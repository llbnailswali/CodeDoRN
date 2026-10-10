import type { KotlinDiagnostic } from './kotlinRunner';
import { maskStringsAndComments, resolveErrorSpan } from './errorSpan';

/**
 * A one-tap repair for a compile-time error. Only errors with ONE obvious, safe repair get a fix; for everything else (a type
 * mismatch, a wrong argument, logic) the learner has to decide, so nothing is offered. The same matching covers the in-app
 * simulator's messages and the real compiler's (`kotlinc: ...`), which word the same problems differently.
 */
export interface CompileFix {
  /** Button text, e.g. `Change "val age" to "var age"`. */
  label: string;
  /** The whole program after the repair. */
  code: string;
  /** Where to put the caret afterwards (offset into `code`). */
  caret: number;
}

const stripPrefix = (message: string) => message.replace(/^(?:kotlinc|minikotlin): /, '').replace(/^(?:Compilation|Syntax) error: /i, '');

function lineStartOffset(code: string, line: number): number {
  let offset = 0;
  const lines = code.split('\n');
  for (let i = 0; i < line; i++) offset += lines[i].length + 1;
  return offset;
}

/** Edit distance for "did you mean": insert, delete, replace, or swap two neighbouring letters (a very common typo) each cost 1. */
export function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export const KEYWORDS = new Set(['val', 'var', 'fun', 'class', 'if', 'else', 'for', 'while', 'when', 'return', 'in', 'is', 'null', 'true', 'false', 'println', 'print', 'object', 'interface', 'this', 'it', 'data', 'enum', 'sealed', 'open', 'abstract', 'inner', 'value', 'inline', 'lateinit', 'const', 'operator', 'infix', 'tailrec', 'suspend', 'vararg', 'reified', 'crossinline', 'noinline', 'annotation', 'companion', 'private', 'public', 'protected', 'internal', 'final', 'where', 'out', 'get', 'set', 'field', 'typealias', 'import', 'package', 'break', 'continue', 'do', 'super', 'dynamic', 'expect', 'actual']);

/** Names the program declares (variables, parameters, functions, classes), found outside strings and comments. */
export function declaredNames(masked: string): Set<string> {
  const names = new Set<string>();
  for (const m of masked.matchAll(/\b(?:val|var|fun|class|object|interface|enum\s+class|data\s+class)\s+([A-Za-z_]\w*)/g)) names.add(m[1]);
  for (const m of masked.matchAll(/[(,]\s*(?:(?:vararg|noinline|crossinline|private|public|internal|protected|override|val|var)\s+)*([A-Za-z_]\w*)\s*:/g)) names.add(m[1]);
  for (const m of masked.matchAll(/\bfor\s*\(\s*\(([^)]*)\)\s*in\b/g)) for (const n of m[1].split(',')) names.add(n.trim().split(/[\s:]/)[0]);
  for (const m of masked.matchAll(/\bfor\s*\(\s*([A-Za-z_]\w*)\s+in\b/g)) names.add(m[1]);
  return names;
}

export function suggestFix(code: string, error: KotlinDiagnostic | null | undefined): CompileFix | null {
  if (!error) return null;
  const message = stripPrefix(error.message);
  const lines = code.split('\n');

  // The real compiler reports a missing closer at the exact column where it expected it (often the end of the line).
  const expecting = /Expecting '([)\]}])'/.exec(message);
  if (expecting && error.column !== undefined && error.line >= 1 && error.line <= lines.length) {
    const at = Math.min(error.column, lines[error.line - 1].length);
    const offset = lineStartOffset(code, error.line - 1) + at;
    return { label: `Add the missing ${expecting[1]}`, code: code.slice(0, offset) + expecting[1] + code.slice(offset), caret: offset + 1 };
  }

  const span = resolveErrorSpan(code, error);
  if (!span) return null;
  const masked = maskStringsAndComments(code);
  const maskedLines = masked.split('\n');
  const base = lineStartOffset(code, span.line);
  const spanText = lines[span.line].slice(span.start, span.end);
  const replace = (from: number, to: number, text: string, label: string, caret = from + text.length): CompileFix => ({
    label,
    code: code.slice(0, from) + text + code.slice(to),
    caret,
  });

  // 1. A `val` that is assigned again -> `var`.
  if (/cannot be reassigned/i.test(message)) {
    const quoted = /'([A-Za-z_]\w*)'/.exec(message)?.[1];
    const name = quoted && quoted !== 'val' ? quoted : /^[A-Za-z_]\w*/.exec(spanText)?.[0] ?? /^\s*([A-Za-z_]\w*)/.exec(maskedLines[span.line])?.[1];
    if (!name) return null;
    const declaration = new RegExp(`\\bval(\\s+${name}\\b)`, 'g');
    const errorOffset = base + span.start;
    let chosen: RegExpExecArray | null = null;
    for (let m; (m = declaration.exec(masked)); ) {
      if (m.index < errorOffset || !chosen) chosen = m; // the nearest declaration above the error, else the first one
      if (m.index >= errorOffset) break;
    }
    if (!chosen) return null;
    return replace(chosen.index, chosen.index + 3, 'var', `Change "val ${name}" to "var ${name}"`, errorOffset + 0);
  }

  // 1b. `val`/`var` on a loop variable -> remove the keyword.
  const loopKeyword = /'(val|var)' on loop parameter is prohibited/.exec(message)?.[1];
  if (loopKeyword) {
    const lineText = maskedLines[span.line];
    const at = lineText.indexOf(loopKeyword, Math.max(0, span.start - 1));
    if (at < 0) return null;
    const after = /^\s+/.exec(lineText.slice(at + loopKeyword.length))?.[0].length ?? 0;
    return replace(base + at, base + at + loopKeyword.length + after, '', `Remove "${loopKeyword}"`, base + at);
  }

  // 1c. A when branch missing `->`: the usual slip is a lone `-` (the `>` forgotten) -> `->`.
  if (/Expecting '->' after the when branch/.test(message)) {
    const lineText = maskedLines[span.line];
    const lone = /(?<![-=<>!])-(?![->=\d])\s/.exec(lineText);
    if (!lone) return null;
    return replace(base + lone.index, base + lone.index + 1, '->', 'Change - to -> (when branch arrow)', base + lone.index + 2);
  }

  // 2. A member call on something nullable -> safe call `?.`.
  if (/only safe \(\?\.\)|safe \(\?\.\) or non-null asserted/i.test(message)) {
    const lineText = maskedLines[span.line];
    let dot = -1;
    if (lineText[span.start] === '.') dot = span.start;
    else {
      // The error names the receiver: its dot is the next `.` after it.
      const after = /^\s*\./.exec(lineText.slice(span.end));
      if (after) dot = span.end + after[0].length - 1;
    }
    if (dot < 0 || lineText[dot - 1] === '?') return null;
    return replace(base + dot, base + dot + 1, '?.', 'Use ?. (safe call)', base + dot + 2);
  }

  // 3. A misspelled name -> the closest declared name.
  const unresolved = /unresolved reference:? '?([A-Za-z_]\w*)'?/i.exec(message)?.[1];
  if (unresolved) {
    const candidates = [...declaredNames(masked)].filter((n) => n !== unresolved && !KEYWORDS.has(n));
    const scored = candidates
      .map((name) => ({ name, d: distance(unresolved.toLowerCase(), name.toLowerCase()) }))
      .filter(({ d }) => d <= Math.max(1, Math.floor(unresolved.length / 3)))
      .sort((a, b) => a.d - b.d);
    // Two equally close names would be a guess.
    if (!scored.length || (scored[1] && scored[1].d === scored[0].d)) return null;
    const word = new RegExp(`(?<![\\w.])${unresolved}(?!\\w)`).exec(maskedLines[span.line].slice(span.start));
    const at = word ? span.start + word.index : span.start;
    if (lines[span.line].slice(at, at + unresolved.length) !== unresolved) return null;
    return replace(base + at, base + at + unresolved.length, scored[0].name, `Rename "${unresolved}" to "${scored[0].name}"`);
  }

  // 4. A bracket that was never closed.
  const never = /'([({\[])' on line \d+ is never closed/.exec(message);
  if (never) {
    const closer = ({ '(': ')', '{': '}', '[': ']' } as Record<string, string>)[never[1]];
    const lineText = maskedLines[span.line];
    const end = lineText.trimEnd().length; // before trailing spaces and any trailing // comment (masked to spaces)
    return replace(base + end, base + end, closer, `Add the missing ${closer}`);
  }
  return null;
}
