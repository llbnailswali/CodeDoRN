import type { KotlinDiagnostic } from './kotlinRunner';

/**
 * Where a compile-time error sits in the learner's own source, for the editor to highlight.
 *
 * The engine reports a line plus (when it knows) the offending token's text. This turns that into a character span on
 * the ORIGINAL text, because the engine works on a rewritten copy whose columns no longer match what was typed.
 * When no token is known the span is the whole statement on that line, never a guess at a column.
 */
export interface ErrorSpan {
  /** 0-based line index. */
  line: number;
  /** 0-based start column and exclusive end column within that line. */
  start: number;
  end: number;
  /** False when the span is the whole statement rather than one token. */
  exact: boolean;
}

/** Error kinds that are decided before the program runs. A runtime error or a wrong answer has no place in the code to mark. */
const COMPILE_TIME_TYPES = new Set<KotlinDiagnostic['type']>([
  'syntax_error',
  'compiler_error',
  'type_mismatch',
  'val_reassignment',
  'unresolved_reference',
]);

/** Same length as `source`, with the inside of every string and comment replaced by spaces (newlines kept), so a search never matches there. */
export function maskStringsAndComments(source: string): string {
  const out = source.split('');
  const blank = (from: number, to: number) => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  let i = 0;
  while (i < source.length) {
    if (source.startsWith('//', i)) {
      let j = i;
      while (j < source.length && source[j] !== '\n') j++;
      blank(i, j);
      i = j;
    } else if (source.startsWith('/*', i)) {
      let depth = 1;
      let j = i + 2;
      while (j < source.length && depth) {
        if (source.startsWith('/*', j)) { depth++; j += 2; }
        else if (source.startsWith('*/', j)) { depth--; j += 2; }
        else j++;
      }
      blank(i, j);
      i = j;
    } else if (source.startsWith('"""', i)) {
      const close = source.indexOf('"""', i + 3);
      const j = close < 0 ? source.length : close + 3;
      blank(i + 3, close < 0 ? j : close);
      i = j;
    } else if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      let j = i + 1;
      while (j < source.length && source[j] !== '\n') {
        if (source[j] === '\\') { j += 2; continue; }
        if (source[j] === quote) break;
        j++;
      }
      blank(i + 1, j);
      i = Math.min(source.length, j + 1);
    } else i++;
  }
  return out.join('');
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Start/end of the `occurrence`-th whole-token match of `token` in `masked`, or null. */
function findToken(masked: string, token: string, occurrence: number): [number, number] | null {
  const word = /^\w+$/.test(token);
  const re = new RegExp(word ? `(?<![\\w.])${escapeRegExp(token)}(?!\\w)|(?<=\\.)${escapeRegExp(token)}(?!\\w)` : escapeRegExp(token), 'g');
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(masked))) {
    if (n === occurrence) return [m.index, m.index + m[0].length];
    n++;
    if (m[0].length === 0) re.lastIndex++;
  }
  return null;
}

/** The identifier a message names, e.g. `'age'` in "Val cannot be reassigned: 'age' ..." or `add` in "Unresolved reference: add". */
function tokenFromMessage(message: string): string | null {
  const quoted = message.match(/'([A-Za-z_]\w*)'/);
  if (quoted) return quoted[1];
  const unresolved = message.match(/Unresolved reference: ([A-Za-z_]\w*)/);
  return unresolved ? unresolved[1] : null;
}

export function isCompileTimeError(error: KotlinDiagnostic | undefined | null): boolean {
  return !!error && COMPILE_TIME_TYPES.has(error.type) && !error.unlocated && error.line > 0;
}

export function resolveErrorSpan(code: string, error: KotlinDiagnostic | undefined | null): ErrorSpan | null {
  if (!error || !isCompileTimeError(error)) return null;
  const lines = code.split('\n');
  const lineIdx = error.line - 1;
  if (lineIdx < 0 || lineIdx >= lines.length) return null;

  const maskedLines = maskStringsAndComments(code).split('\n');
  const masked = maskedLines[lineIdx] ?? '';
  const raw = lines[lineIdx];
  const trimmedStart = masked.length - masked.trimStart().length;
  const trimmedEnd = masked.trimEnd().length;
  // A line with only a comment/blank has nothing to mark; the engine's line number is then not trustworthy.
  if (trimmedEnd <= trimmedStart) return null;

  // 1. An explicit column from the engine.
  if (typeof error.column === 'number' && error.column >= 0 && error.column < raw.length) {
    const end = /\w/.test(raw[error.column]) ? error.column + (raw.slice(error.column).match(/^\w+/)?.[0].length ?? 1) : error.column + 1;
    return { line: lineIdx, start: error.column, end, exact: true };
  }

  // 2. A named token: from the engine, else quoted in the message. A reassignment is the assigned name, not any mention of it.
  const token = error.token ?? tokenFromMessage(error.message);
  if (token) {
    if (error.type === 'val_reassignment' && /^\w+$/.test(token)) {
      const re = new RegExp(`(?<![\\w])${escapeRegExp(token)}(?=\\s*(?:[-+*/%]?=(?!=)|\\+\\+|--))|(?<=\\+\\+|--)${escapeRegExp(token)}(?!\\w)`);
      const m = re.exec(masked);
      if (m) return { line: lineIdx, start: m.index, end: m.index + token.length, exact: true };
    }
    const found = findToken(masked, token, error.occurrence ?? 0) ?? findToken(masked, token, 0);
    if (found) {
      // A bare `.` is too small to see: include the member it calls (`.length`).
      const member = token === '.' ? /^\w+/.exec(raw.slice(found[1]))?.[0].length ?? 0 : 0;
      return { line: lineIdx, start: found[0], end: found[1] + member, exact: true };
    }
  }

  // 3. A declaration whose value has the wrong type: mark the value.
  if (error.type === 'type_mismatch') {
    const decl = /^\s*(?:val|var)\s+\w+\s*(?::\s*[^=]+?)?=\s*(?!=)/.exec(masked);
    if (decl && decl[0].length < trimmedEnd) return { line: lineIdx, start: decl[0].length, end: trimmedEnd, exact: true };
  }

  // 4. Fall back to the whole statement.
  return { line: lineIdx, start: trimmedStart, end: trimmedEnd, exact: false };
}
