import { scanKotlin, type SourceToken } from './kotlinSource';
import { maskStringsAndComments } from './errorSpan';
import type { KotlinDiagnostic } from './kotlinRunner';
import { declaredNames, distance, KEYWORDS } from './compileFixes';

/**
 * Compile errors decided by the SHAPE of the code alone (no types needed), found by `npm run compare:errors` as mistakes the
 * simulator ran but real Kotlin rejects:
 *   - an assignment used as a value:  `val same = a = b`,  `if (a = b)`
 *   - an `if` used as a value with no `else`:  `val x = if (c) 1`
 */
const ASSIGNMENT_MESSAGE = 'Assignments are not expressions, and only expressions are allowed in this context.';

const OPENERS = new Set(['(', '{', '[']);
/** A line containing one of these before its `=` is a declaration, never an assignment statement. */
const DECLARATION_WORDS = new Set(['val', 'var', 'fun', 'const', 'typealias', 'class', 'object', 'interface', 'enum', 'data', 'sealed', 'abstract', 'open', 'private', 'public', 'protected', 'internal', 'override', 'lateinit', 'companion', 'annotation', 'inner', 'operator', 'infix', 'inline', 'suspend', 'where', 'by']);
const CLOSERS = new Set([')', '}', ']']);
const NOT_PLAIN_BEFORE = new Set(['=', '!', '<', '>', '+', '-', '*', '/', '%']);

/** A single `=` that is neither part of `==`, `!=`, `<=`, `>=` nor a compound assignment. */
function isPlainAssign(tokens: SourceToken[], i: number, code: string): boolean {
  const t = tokens[i];
  if (t.kind !== 'symbol' || t.text !== '=') return false;
  const before = code[t.start - 1];
  const after = code[t.start + 1];
  return !(before && NOT_PLAIN_BEFORE.has(before)) && after !== '=' && after !== '>';
}

const lineOfOffset = (code: string, offset: number) => code.slice(0, offset).split('\n').length;

function diagnostic(code: string, masked: string, token: SourceToken, message: string): KotlinDiagnostic {
  const line = lineOfOffset(code, token.start);
  const lineStart = masked.lastIndexOf('\n', token.start - 1) + 1;
  // The editor finds the token again by its text, so count the same matches it will: whole words for a name, every character otherwise.
  const before = masked.slice(lineStart, token.start);
  const occurrence = /^\w+$/.test(token.text) ? (before.match(new RegExp(`(?<![\\w])${token.text}(?!\\w)`, 'g')) ?? []).length : before.split(token.text).length - 1;
  return { message, line, token: token.text, occurrence, type: 'compiler_error' };
}

/** The first token of the assignment target to the left of the `=` at `eq`: where the real compiler points for "not an expression". */
function assignmentTarget(tokens: SourceToken[], eq: number): SourceToken {
  let depth = 0;
  let first = tokens[eq];
  for (let k = eq - 1; k >= 0; k--) {
    const t = tokens[k];
    if (t.kind === 'symbol' && CLOSERS.has(t.text)) depth++;
    else if (t.kind === 'symbol' && OPENERS.has(t.text)) { if (depth === 0) break; depth--; }
    else if (depth === 0 && t.kind === 'symbol' && (t.text === ',' || t.text === ';' || t.text === '=')) break;
    else if (depth === 0 && t.kind === 'word' && (t.text === 'val' || t.text === 'var' || t.text === 'return')) break;
    first = t;
  }
  return first;
}

/** Index of the token closing the bracket opened at `open`, or -1. */
function closeOf(tokens: SourceToken[], open: number): number {
  let depth = 0;
  for (let i = open; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'symbol') continue;
    if (OPENERS.has(t.text)) depth++;
    else if (CLOSERS.has(t.text) && --depth === 0) return i;
  }
  return -1;
}

export function checkStructureRules(code: string): KotlinDiagnostic | null {
  let tokens: SourceToken[];
  try { tokens = scanKotlin(code); } catch { return null; }
  const masked = maskStringsAndComments(code);

  // The innermost bracket each token sits in: a `val`/`var` directly inside `( ... )` is a parameter (`class A(val x: Int = 1, val y: Int = 2)`),
  // not a declaration statement, so it may legitimately have an `=` of its own.
  const innermost: (string | undefined)[] = [];
  {
    const stack: string[] = [];
    for (const t of tokens) {
      innermost.push(stack[stack.length - 1]);
      if (t.kind === 'symbol' && OPENERS.has(t.text)) stack.push(t.text);
      else if (t.kind === 'symbol' && CLOSERS.has(t.text)) stack.pop();
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // `val x = a = b`: a second plain `=` on the same line at bracket depth 0 after the declaration's own `=`.
    if (t.kind === 'word' && (t.text === 'val' || t.text === 'var') && innermost[i] !== '(') {
      let depth = 0;
      let seenOwn = false;
      const line = lineOfOffset(code, t.start);
      for (let j = i + 1; j < tokens.length && lineOfOffset(code, tokens[j].start) === line; j++) {
        const u = tokens[j];
        if (u.kind === 'symbol' && OPENERS.has(u.text)) depth++;
        else if (u.kind === 'symbol' && CLOSERS.has(u.text)) depth--;
        else if (depth === 0 && u.kind === 'symbol' && u.text === ';') break; // `val a = 1; val b = 2`: the next statement
        else if (depth === 0 && u.kind === 'word' && (u.text === 'get' || u.text === 'set' || (seenOwn && u.text === 'fun'))) break; // `val f = fun(x: Int) = x * 2`, `val area: Int get() = w * h`
        else if (false && depth === 0 && seenOwn && u.kind === 'word' && (u.text === 'fun' || u.text === 'get' || u.text === 'set')) break; // `val f = fun(x: Int) = x * 2`, `val area: Int get() = w * h`
        else if (depth === 0 && isPlainAssign(tokens, j, code)) {
          if (!seenOwn) seenOwn = true;
          else return diagnostic(code, masked, assignmentTarget(tokens, j), ASSIGNMENT_MESSAGE);
        }
        if (depth < 0) break;
      }
    }

    // `if (a = b)` / `while (a = b)`: a plain `=` directly inside the condition's parentheses.
    if (t.kind === 'word' && (t.text === 'if' || t.text === 'while') && tokens[i + 1]?.text === '(') {
      const close = closeOf(tokens, i + 1);
      if (close > 0) {
        let depth = 0;
        for (let j = i + 2; j < close; j++) {
          const u = tokens[j];
          if (u.kind === 'symbol' && OPENERS.has(u.text)) depth++;
          else if (u.kind === 'symbol' && CLOSERS.has(u.text)) depth--;
          else if (depth === 0 && isPlainAssign(tokens, j, code)) return diagnostic(code, masked, assignmentTarget(tokens, j), ASSIGNMENT_MESSAGE);
        }
      }
    }

    // `if` used as a value (after `=` or `return`) must have an `else`.
    const usedAsValue = t.kind === 'word' && t.text === 'if' && tokens[i + 1]?.text === '(' && (
      (i > 0 && isPlainAssign(tokens, i - 1, code)) || (i > 0 && tokens[i - 1].kind === 'word' && tokens[i - 1].text === 'return')
    );
    if (usedAsValue && !ifChainEndsInElse(tokens, i, code)) {
      return diagnostic(code, masked, t, "'if' must have both main and 'else' branches when used as an expression.");
    }
  }

  return topLevelStatement(code, masked, tokens) ?? nonBooleanCondition(code, masked, tokens) ?? assignedLiteralMismatch(code, masked, tokens) ?? conflictingInterfaceDefaults(code, masked, tokens) ?? extensionPropertyInitializer(code, masked, tokens) ?? whenNotExhaustive(code, masked, tokens) ?? valReassigned(code, masked, tokens) ?? literalMismatch(code, masked, tokens) ?? variableExpected(code, masked, tokens) ?? statementsOnOneLine(code, masked, tokens) ?? whenWithoutElse(code, masked, tokens) ?? unresolvedTypo(code, masked, tokens);
}

/** True when the `if` at `i` (an `if (cond) body [else ...]` chain) ends in an `else` that is not itself another `if`. */
function ifChainEndsInElse(tokens: SourceToken[], i: number, code: string): boolean {
  const close = closeOf(tokens, i + 1);
  if (close < 0) return true; // cannot tell: stay quiet
  let end = close + 1;
  let hasElse = false;
  if (tokens[end]?.text === '{') end = closeOf(tokens, end) + 1;
  else {
    // A one-line body: an `else` anywhere at depth 0 before the line ends belongs to this `if`.
    const line = lineOfOffset(code, tokens[end]?.start ?? 0);
    let depth = 0;
    let elseAt = -1;
    while (end < tokens.length && lineOfOffset(code, tokens[end].start) === line) {
      const u = tokens[end];
      if (u.kind === 'symbol' && OPENERS.has(u.text)) depth++;
      else if (u.kind === 'symbol' && CLOSERS.has(u.text)) depth--;
      else if (depth === 0 && u.kind === 'word' && u.text === 'else' && elseAt < 0) elseAt = end;
      end++;
    }
    if (elseAt >= 0) { hasElse = true; end = elseAt + 1; }
  }
  if (!hasElse) {
    const next = tokens[end];
    if (!(next && next.kind === 'word' && next.text === 'else')) return false;
    end++; // the `else` after a block body
  } else if (tokens[end - 1]?.text !== 'else') return true;
  // After `else`: another `if` continues the chain, anything else ends it.
  const after = tokens[end];
  if (after && after.kind === 'word' && after.text === 'if' && tokens[end + 1]?.text === '(') return ifChainEndsInElse(tokens, end, code);
  return true;
}

/**
 * A name that is not declared anywhere but is one typo away from a name that is: `val qauntity = 1 ... quantity`. Real Kotlin rejects the
 * unknown name wherever it appears; the simulator only noticed when that line actually ran, and never inside an unexecuted branch or a
 * `"$name"` template. Deliberately narrow (declared-name neighbours only), so a stdlib or implicit name is never reported.
 */
function unresolvedTypo(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const declared = declaredNames(masked);
  // Every name the program declares or imports, plus lambda parameters and names after `.`, counts as known.
  const known = new Set(declared);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word') continue;
    const prev = tokens[i - 1]?.text;
    if (prev === 'import' || prev === 'package' || prev === 'as') known.add(t.text);
  }
  for (const m of masked.matchAll(/\{\s*([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*->/g)) for (const n of m[1].split(',')) known.add(n.trim());
  for (const m of masked.matchAll(/\bcatch\s*\(\s*([A-Za-z_]\w*)/g)) known.add(m[1]);
  for (const m of masked.matchAll(/\bval\s*\(([^)]*)\)/g)) for (const n of m[1].split(',')) known.add(n.trim().split(/[\s:]/)[0]);
  // The sandbox / stdlib names a learner may use that happen to sit near a declared name never need a typo warning: skip any word that
  // is used as a member (`x.name`), a labelled/annotation word, or a keyword.
  const candidates: { name: string; offset: number }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    // A capitalised word is a type, an enum entry or an object (`Double`, `List`, `SHIPPED`, `Dispatchers`): far too many are not declared in the program.
    if (t.kind !== 'word' || t.text.length < 4 || known.has(t.text) || KEYWORDS.has(t.text) || /^[A-Z]/.test(t.text)) continue;
    const prev = tokens[i - 1]?.text;
    if (prev === '.' || prev === '?.' || prev === '::' || prev === '@') continue;
    if (tokens[i + 1]?.text === '@') continue;
    candidates.push({ name: t.text, offset: t.start });
  }
  // Names used only inside string templates: `"$qauntity"` / `"${qauntity + 1}"`.
  const templateUses: { name: string; offset: number }[] = [];
  for (const tok of tokens) {
    if (tok.kind !== 'string') continue;
    const text = code.slice(tok.start, tok.end);
    for (const m of text.matchAll(/(?<!\\)\$\{?([a-z_]\w{3,})/g)) templateUses.push({ name: m[1], offset: tok.start + m.index! + m[0].indexOf(m[1]) });
  }
  const all = [...candidates, ...templateUses].sort((a, b) => a.offset - b.offset);
  for (const use of all) {
    if (known.has(use.name)) continue;
    const close = [...known].filter((n) => n.length >= 4 && !KEYWORDS.has(n) && distance(use.name.toLowerCase(), n.toLowerCase()) <= Math.max(1, Math.floor(use.name.length / 5)));
    if (!close.length) continue;
    const line = lineOfOffset(code, use.offset);
    const lineStart = masked.lastIndexOf('\n', use.offset - 1) + 1;
    const inString = masked.slice(use.offset, use.offset + use.name.length).trim() === '';
    // A use inside a template is a string token for the editor, so point at the whole word anyway; the occurrence counts words on the line.
    const before = (inString ? code : masked).slice(lineStart, use.offset);
    const occurrence = (before.match(new RegExp(`(?<![\\w])${use.name}(?!\\w)`, 'g')) ?? []).length;
    return { message: `Unresolved reference: ${use.name}`, line, token: use.name, occurrence: inString ? 0 : occurrence, type: 'unresolved_reference' };
  }
  return null;
}

const LITERAL_FITS: Record<string, (t: SourceToken) => boolean> = {
  Int: (t) => t.kind === 'number' && /^\d[\d_]*$/.test(t.text),
  Long: (t) => t.kind === 'number' && /^\d[\d_]*L?$/.test(t.text),
  Double: (t) => t.kind === 'number' && /^\d[\d_]*\.\d/.test(t.text),
  String: (t) => t.kind === 'string' && t.text.startsWith('"'),
  Boolean: (t) => t.kind === 'word' && (t.text === 'true' || t.text === 'false'),
  Char: (t) => t.kind === 'string' && t.text.startsWith("'"),
};
const isLiteral = (t: SourceToken) => t.kind === 'number' || t.kind === 'string' || (t.kind === 'word' && (t.text === 'true' || t.text === 'false'));

/** `name: Int = false` / `port: String = 80`: a literal of the wrong kind as a default value or initializer (parameters, properties, locals). */
function literalMismatch(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  for (let i = 1; i + 4 < tokens.length; i++) {
    const [colon, type, eq, literal] = [tokens[i], tokens[i + 1], tokens[i + 2], tokens[i + 3]];
    if (colon.text !== ':' || type.kind !== 'word' || !LITERAL_FITS[type.text] || !isPlainAssign(tokens, i + 2, code) || !isLiteral(literal)) continue;
    if (tokens[i - 1].kind !== 'word') continue;
    const after = tokens[i + 4];
    // The literal must be the whole initializer (`= 5 + x` is an expression, not a bare literal).
    if (after && lineOfOffset(code, after.start) === lineOfOffset(code, literal.start) && !(after.kind === 'symbol' && [',', ')', ';', '}'].includes(after.text))) continue;
    if (type.text === 'Int' && literal.kind === 'number' && /^\d[\d_]*$/.test(literal.text)) continue;
    if (!LITERAL_FITS[type.text](literal)) return diagnostic(code, masked, literal, `Initializer type mismatch: expected ${type.text}, actual ${literal.kind === 'number' ? (/\./.test(literal.text) ? 'Double' : 'Int') : literal.kind === 'string' ? (literal.text.startsWith("'") ? 'Char' : 'String') : 'Boolean'}.`);
  }
  return null;
}

/** `it % 2 = 0`: the left side of a plain `=` is an expression with operators, not a variable. */
function variableExpected(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const operators = new Set(['+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '?']);
  for (let j = 0; j < tokens.length; j++) {
    if (!isPlainAssign(tokens, j, code)) continue;
    let depth = 0;
    let start = j;
    // The target must start at a real statement boundary (line start, `;`, `{`, `}`, a lambda arrow, else/do/try). Stopping at a comma,
    // an opening `(`/`[` or a declaration keyword means this `=` is inside a parameter list, generics or a declaration: not our case.
    let boundary = true;
    for (let k = j - 1; k >= 0; k--) {
      const t = tokens[k];
      if (depth === 0 && lineOfOffset(code, t.start) !== lineOfOffset(code, tokens[j].start)) break; // the previous line is a different statement
      if (t.kind === 'symbol' && CLOSERS.has(t.text)) { if (t.text === '}' && depth === 0) break; depth++; }
      else if (t.kind === 'symbol' && OPENERS.has(t.text)) { if (depth === 0) { boundary = t.text === '{'; break; } depth--; }
      else if (depth === 0 && t.kind === 'symbol' && t.text === ';') break;
      else if (depth === 0 && t.kind === 'symbol' && t.text === ',') { boundary = false; break; }
      else if (depth === 0 && t.kind === 'word' && ['else', 'do', 'try', 'finally'].includes(t.text)) break;
      else if (depth === 0 && t.kind === 'word' && ['val', 'var', 'fun', 'return', 'class', 'object', 'interface'].includes(t.text)) { boundary = false; break; }
      else if (depth === 0 && t.kind === 'symbol' && t.text === '>' && tokens[k - 1]?.text === '-') break; // lambda arrow
      start = k;
    }
    if (!boundary) continue;
    // A declaration (`val f: (Int) -> String? = ...`) has a colon before its `=` on the same line: its `->` is a function TYPE, not a lambda arrow.
    {
      let lineFirst = j;
      while (lineFirst > 0 && lineOfOffset(code, tokens[lineFirst - 1].start) === lineOfOffset(code, tokens[j].start)) lineFirst--;
      let d = 0;
      let declaration = false;
      for (let k = lineFirst; k < j; k++) {
        const t = tokens[k];
        if (t.kind === 'symbol' && OPENERS.has(t.text)) d++;
        else if (t.kind === 'symbol' && CLOSERS.has(t.text)) d--;
        else if (d <= 0 && t.kind === 'symbol' && t.text === ':') declaration = true;
        else if (t.kind === 'word' && DECLARATION_WORDS.has(t.text)) declaration = true;
      }
      if (declaration) continue;
    }
    if (start === j) continue;
    const left = tokens.slice(start, j);
    // Only a bare expression statement counts: no declaration colon, no generic brackets, no header such as `if (...)` before it.
    if (left.some((t) => t.kind === 'symbol' && (t.text === ':' )) || left.some((t) => t.kind === 'word' && ['if', 'while', 'for', 'when', 'by'].includes(t.text))) continue;
    let d = 0;
    let bad = false;
    for (const t of left) {
      if (t.kind === 'symbol' && OPENERS.has(t.text)) d++;
      else if (t.kind === 'symbol' && CLOSERS.has(t.text)) d--;
      else if (d === 0 && t.kind === 'symbol' && operators.has(t.text)) bad = true;
    }
    if (left.length === 1 && isLiteral(left[0])) bad = true;
    if (bad) return diagnostic(code, masked, left[0], 'Variable expected.');
  }
  return null;
}

/** `} if (...) {` / `} val x = 1`: a new statement on the same line as a closing brace needs a `;` in Kotlin. */
function statementsOnOneLine(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const starters = new Set(['if', 'for', 'val', 'var', 'return', 'when', 'try']);
  for (let i = 0; i + 1 < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (t.kind !== 'symbol' || t.text !== '}' || lineOfOffset(code, t.start) !== lineOfOffset(code, next.start)) continue;
    if (next.kind === 'word' && starters.has(next.text)) return diagnostic(code, masked, next, "Syntax error: Unexpected tokens (use ';' to separate expressions on the same line).");
    // `if (c) { A } { B }`: the block of an if (or else if) followed by a stray block, i.e. an `else` was forgotten.
    if (next.kind === 'symbol' && next.text === '{') {
      let open = -1;
      let depth = 0;
      for (let k = i; k >= 0; k--) {
        if (tokens[k].text === '}') depth++;
        else if (tokens[k].text === '{' && --depth === 0) { open = k; break; }
      }
      if (open > 0 && tokens[open - 1].text === ')') {
        let d = 0;
        let paren = -1;
        for (let k = open - 1; k >= 0; k--) { if (tokens[k].text === ')') d++; else if (tokens[k].text === '(' && --d === 0) { paren = k; break; } }
        if (paren > 0 && tokens[paren - 1].kind === 'word' && tokens[paren - 1].text === 'if') return diagnostic(code, masked, tokens[paren - 1], "'if' must have both main and 'else' branches when used as an expression.");
      }
    }
  }
  return null;
}

/** A `when` used as a value whose branches are all literals/ranges (so the subject is an Int, String or Char) must end in `else`. */
function whenWithoutElse(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  for (let i = 1; i + 2 < tokens.length; i++) {
    const t = tokens[i];
    const asValue = isPlainAssign(tokens, i - 1, code) || (tokens[i - 1].kind === 'word' && tokens[i - 1].text === 'return');
    if (t.kind !== 'word' || t.text !== 'when' || !asValue || tokens[i + 1].text !== '(') continue;
    const subjectClose = closeOf(tokens, i + 1);
    if (subjectClose < 0 || tokens[subjectClose + 1]?.text !== '{') continue;
    const open = subjectClose + 1;
    const close = closeOf(tokens, open);
    if (close < 0) continue;
    let hasElse = false;
    let onlyLiterals = true;
    let sawBranch = false;
    let depth = 0;
    let expectingCondition = true;
    for (let k = open + 1; k < close; k++) {
      const u = tokens[k];
      if (u.kind === 'symbol' && OPENERS.has(u.text)) depth++;
      else if (u.kind === 'symbol' && CLOSERS.has(u.text)) depth--;
      if (depth !== 0) continue;
      if (u.kind === 'word' && u.text === 'else' && tokens[k + 1]?.text === '-') hasElse = true;
      if (u.text === '-' && tokens[k + 1]?.text === '>') { expectingCondition = false; sawBranch = true; continue; }
      if (!expectingCondition) { if (k + 1 < close && lineOfOffset(code, tokens[k + 1].start) !== lineOfOffset(code, u.start)) expectingCondition = true; continue; }
      // Inside a condition: only literals, commas, `in`, ranges (..) and a leading `!`.
      const okWord = u.kind === 'word' && (u.text === 'in' || u.text === 'true' || u.text === 'false');
      const okSymbol = u.kind === 'symbol' && [',', '.', '!', '-'].includes(u.text);
      if (!(u.kind === 'number' || u.kind === 'string' || okWord || okSymbol)) onlyLiterals = false;
    }
    if (sawBranch && onlyLiterals && !hasElse) return diagnostic(code, masked, t, "'when' expression must be exhaustive. Add an 'else' branch.");
  }
  return null;
}

/**
 * A local `val` with an initializer that is assigned again anywhere: `val n = 0 ... { n += 1 }`. The older line-based check only sees
 * assignments at the start of a line. Only names declared exactly ONCE in the whole program are judged, so shadowing or a same-named
 * parameter/loop variable can never cause a false error.
 */
function valReassigned(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const declarations = new Map<string, number>();
  const initialized = new Set<string>();
  // `xs += x` on a val collection is plusAssign (legal); only a val holding a plain number, string or Boolean is an error for compound operators.
  const plainValue = new Set<string>();
  const bump = (name: string) => declarations.set(name, (declarations.get(name) ?? 0) + 1);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    if (t.kind === 'word' && (t.text === 'val' || t.text === 'var') && next?.kind === 'word') {
      bump(next.text);
      if (t.text === 'val') {
        // has an initializer: `= ...` on the same line (after an optional `: Type`)
        const line = lineOfOffset(code, t.start);
        for (let j = i + 2; j < tokens.length && lineOfOffset(code, tokens[j].start) === line; j++) {
          if (!isPlainAssign(tokens, j, code)) continue;
          initialized.add(next.text);
          const value = tokens[j + 1];
          const after = tokens[j + 2];
          if (value && (value.kind === 'number' || value.kind === 'string' || value.text === 'true' || value.text === 'false') && (!after || lineOfOffset(code, after.start) !== line || after.text === ';')) plainValue.add(next.text);
          break;
        }
      }
    }
  }
  // Every other way of introducing a name counts as another declaration: parameters, loop and lambda variables, destructuring, catch.
  for (const m of masked.matchAll(/[(,]\s*(?:(?:vararg|noinline|crossinline|private|public|internal|protected|override)\s+)*([A-Za-z_]\w*)\s*:/g)) bump(m[1]);
  for (const m of masked.matchAll(/\bfor\s*\(\s*\(?([^)]*?)\)?\s+in\b/g)) for (const n of m[1].split(',')) bump(n.trim().split(/[\s:]/)[0]);
  for (const m of masked.matchAll(/\{\s*([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*->/g)) for (const n of m[1].split(',')) bump(n.trim());
  for (const m of masked.matchAll(/\b(?:catch\s*\(\s*|fun\s+)([A-Za-z_]\w*)/g)) bump(m[1]);
  for (const m of masked.matchAll(/\b(?:val|var)\s*\(([^)]*)\)/g)) for (const n of m[1].split(',')) bump(n.trim().split(/[\s:]/)[0]);
  // An `=` directly inside `( ... )` is a named argument or a default value, never an assignment statement.
  const innermost: (string | undefined)[] = [];
  {
    const stack: string[] = [];
    for (const t of tokens) {
      innermost.push(stack[stack.length - 1]);
      if (t.kind === 'symbol' && OPENERS.has(t.text)) stack.push(t.text);
      else if (t.kind === 'symbol' && CLOSERS.has(t.text)) stack.pop();
    }
  }
  for (let i = 0; i + 1 < tokens.length; i++) {
    const t = tokens[i];
    if (innermost[i] === '(' || innermost[i] === '[') continue;
    if (t.kind !== 'word' || !initialized.has(t.text) || declarations.get(t.text) !== 1) continue;
    const before = tokens[i - 1]?.text;
    if (before === '.' || before === '?.' || before === 'val' || before === 'var' || before === '::') continue;
    const next = tokens[i + 1];
    const afterNext = tokens[i + 2];
    const compound = next.kind === 'symbol' && ['+', '-', '*', '/', '%'].includes(next.text) && afterNext?.text === '=' && lineOfOffset(code, next.start) === lineOfOffset(code, afterNext.start) && afterNext.start === next.start + 1 && tokens[i + 3]?.text !== '=';
    const increment = next.kind === 'symbol' && ['+', '-'].includes(next.text) && afterNext?.text === next.text && afterNext.start === next.start + 1;
    if (isPlainAssign(tokens, i + 1, code) || ((compound || increment) && (plainValue.has(t.text) || increment))) return diagnostic(code, masked, t, "'val' cannot be reassigned.");
  }
  return null;
}

/** `val User.fullName: String = ...`: an extension property has no backing field, so it cannot have an initializer (it needs a getter). */
function extensionPropertyInitializer(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  for (let i = 0; i + 3 < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || (t.text !== 'val' && t.text !== 'var')) continue;
    // receiver type (with optional generics), a dot, the property name
    let k = i + 1;
    if (tokens[k]?.kind !== 'word' || !/^[A-Z]/.test(tokens[k].text)) continue;
    k++;
    if (tokens[k]?.text === '<') { let d = 0; for (; k < tokens.length; k++) { if (tokens[k].text === '<') d++; else if (tokens[k].text === '>' && --d === 0) { k++; break; } } }
    if (tokens[k]?.text !== '.' || tokens[k + 1]?.kind !== 'word') continue;
    const name = tokens[k + 1];
    const line = lineOfOffset(code, t.start);
    for (let j = k + 2; j < tokens.length && lineOfOffset(code, tokens[j].start) === line; j++) {
      if (tokens[j].kind === 'word' && (tokens[j].text === 'get' || tokens[j].text === 'by')) break;
      if (isPlainAssign(tokens, j, code)) return diagnostic(code, masked, name, 'Extension property cannot be initialized because it has no backing field.');
    }
  }
  return null;
}

/**
 * A `when` whose branches test the cases of ONE sealed class/interface (`is Loading ->`) or ONE enum (`State.DONE ->`) but miss one and
 * have no `else` is a compile error in Kotlin (as an expression, and since Kotlin 1.7 as a statement too). Only judged when every branch
 * condition is recognised as such a case, so a `when` over anything else is left alone.
 */
function whenNotExhaustive(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  // sealed parents and their direct subtypes; enums and their entries -- all read from the program text
  const sealed = new Set<string>();
  const children = new Map<string, string[]>();
  for (const m of masked.matchAll(/\bsealed\s+(?:class|interface)\s+([A-Z]\w*)/g)) sealed.add(m[1]);
  for (const m of masked.matchAll(/\b(?:class|object|interface)\s+([A-Z]\w*)\s*(?:<[^>]*>)?\s*(?:\([^)]*\))?\s*:\s*([^{\n]+)/g)) {
    for (const part of m[2].split(',')) {
      const parent = part.trim().replace(/\(.*$/, '').replace(/<.*$/, '').trim();
      if (sealed.has(parent)) children.set(parent, [...(children.get(parent) ?? []), m[1]]);
    }
  }
  const enums = new Map<string, string[]>();
  for (const m of masked.matchAll(/\benum\s+class\s+([A-Z]\w*)[^{]*\{([^}]*)/g)) {
    const entries: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of m[2].split(';')[0]) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (depth === 0 && ch === ',') { entries.push(current); current = ''; } else if (depth === 0 && ch !== ')') current += ch;
    }
    entries.push(current);
    enums.set(m[1], entries.map((e) => e.trim().split(/[\s(]/)[0]).filter((e) => /^[A-Za-z_]\w*$/.test(e)));
  }
  if (!children.size && !enums.size) return null;
  const allSubtypes = (parent: string): Set<string> => {
    const out = new Set<string>();
    for (const c of children.get(parent) ?? []) { out.add(c); if (sealed.has(c)) for (const g of allSubtypes(c)) out.add(g); }
    return out;
  };

  for (let i = 0; i + 1 < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || t.text !== 'when' || tokens[i + 1].text !== '(') continue;
    const subjectClose = closeOf(tokens, i + 1);
    if (subjectClose < 0 || tokens[subjectClose + 1]?.text !== '{') continue;
    const open = subjectClose + 1;
    const close = closeOf(tokens, open);
    if (close < 0) continue;
    // Split the body into branch conditions (the tokens before each `->` at depth 0).
    const conditions: SourceToken[][] = [];
    let current: SourceToken[] = [];
    let depth = 0;
    let inBody = false;
    let hasElse = false;
    let line = -1;
    for (let k = open + 1; k < close; k++) {
      const u = tokens[k];
      if (u.kind === 'symbol' && OPENERS.has(u.text)) depth++;
      else if (u.kind === 'symbol' && CLOSERS.has(u.text)) depth--;
      if (depth !== 0) continue;
      if (u.text === '-' && tokens[k + 1]?.text === '>') { conditions.push(current); current = []; inBody = true; line = lineOfOffset(code, u.start); k++; continue; }
      if (inBody) { if (lineOfOffset(code, u.start) !== line) { inBody = false; current = [u]; } continue; }
      current.push(u);
    }
    for (const c of conditions) if (c.length === 1 && c[0].text === 'else') hasElse = true;
    if (hasElse || !conditions.length) continue;
    // Each condition is a comma-separated list of `is Type` or `Enum.ENTRY` / `ENTRY`.
    const covered: string[] = [];
    let recognised = true;
    for (const c of conditions) {
      const parts: SourceToken[][] = [[]];
      for (const u of c) { if (u.text === ',') parts.push([]); else parts[parts.length - 1].push(u); }
      for (const p of parts) {
        if (p.length === 2 && p[0].text === 'is') covered.push(p[1].text);
        else if (p.length === 3 && p[1].text === '.' && enums.has(p[0].text)) covered.push(`${p[0].text}.${p[2].text}`);
        else if (p.length === 1 && [...enums.values()].some((e) => e.includes(p[0].text))) covered.push(p[0].text);
        // a sealed `object` case compared by equality: `Waiting ->`
        else if (p.length === 1 && [...children.values()].some((c) => c.includes(p[0].text))) covered.push(p[0].text);
        else recognised = false;
      }
    }
    if (!recognised || !covered.length) continue;
    // A sealed hierarchy: every covered type belongs under one sealed parent.
    const typeNames = covered.filter((c) => !c.includes('.'));
    for (const parent of sealed) {
      const subtypes = allSubtypes(parent);
      if (!typeNames.length || !typeNames.every((n) => subtypes.has(n) || n === parent)) continue;
      if (typeNames.includes(parent)) break;
      const coveredAll = new Set<string>(typeNames.flatMap((n) => [n, ...allSubtypes(n)]));
      const missing = (children.get(parent) ?? []).filter((c) => !coveredAll.has(c));
      if (missing.length) return diagnostic(code, masked, t, `'when' expression must be exhaustive. Add the '${missing[0]}' branch or an 'else' branch.`);
    }
    // An enum: every covered entry belongs to one enum.
    for (const [name, entries] of enums) {
      const names = covered.map((c) => (c.startsWith(`${name}.`) ? c.slice(name.length + 1) : c));
      if (!names.every((n) => entries.includes(n))) continue;
      const missing = entries.filter((e) => !names.includes(e));
      if (missing.length) return diagnostic(code, masked, t, `'when' expression must be exhaustive. Add the '${missing[0]}' branch or an 'else' branch.`);
    }
  }
  return null;
}

/** The `{ ... }` body that starts at `open` in the masked text (balanced braces), or '' when there is none. */
function bodyAt(masked: string, open: number): string {
  if (masked[open] !== '{') return '';
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === '{') depth++;
    else if (masked[i] === '}' && --depth === 0) return masked.slice(open + 1, i);
  }
  return '';
}

/**
 * `class Theme : Light, Dark` where BOTH interfaces give `mode()` a default body: Kotlin will not choose one, so the class must override
 * it ("must override 'mode' because it inherits multiple interface methods for it"). Only members with a default in two or more of the
 * listed interfaces are judged.
 */
function conflictingInterfaceDefaults(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const defaults = new Map<string, Set<string>>();
  for (const m of masked.matchAll(/\binterface\s+([A-Z]\w*)\s*(?:<[^>]*>)?\s*(?::[^{]*)?/g)) {
    const body = bodyAt(masked, m.index! + m[0].length);
    if (!body) continue;
    const names = new Set<string>();
    let depth = 0;
    let top = '';
    for (const ch of body) { if (ch === '{') depth++; if (depth === 0) top += ch; if (ch === '}') depth--; if (depth > 0 && ch !== '{') top += ' '; }
    for (const f of top.matchAll(/\bfun\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*(?::\s*[\w<>?, ]+)?\s*(=|\{)/g)) names.add(f[1]);
    defaults.set(m[1], names);
  }
  if (defaults.size < 2) return null;
  for (const m of masked.matchAll(/\bclass\s+([A-Z]\w*)\s*(?:<[^>]*>)?\s*(?:\([^)]*\))?\s*:\s*([^{\n]+)/g)) {
    const supertypes = m[2].split(',').map((p) => p.trim().replace(/\s+by\s+.*$/, '').replace(/\(.*$/, '').replace(/<.*$/, '').trim());
    const listed = supertypes.filter((p) => defaults.has(p));
    if (listed.length < 2) continue;
    const afterHeader = m.index! + m[0].length;
    const body = bodyAt(masked, masked.slice(afterHeader).search(/\S/) + afterHeader);
    const counts = new Map<string, number>();
    for (const i of listed) for (const name of defaults.get(i)!) counts.set(name, (counts.get(name) ?? 0) + 1);
    for (const [name, n] of counts) {
      if (n < 2 || new RegExp(`\\boverride\\s+fun\\s+${name}\\b`).test(body)) continue;
      const nameToken = tokens.find((t) => t.kind === 'word' && t.text === m[1] && t.start >= m.index!);
      if (nameToken) return diagnostic(code, masked, nameToken, `Class '${m[1]}' must override '${name}' because it inherits multiple interface methods for it.`);
    }
  }
  return null;
}

const TOP_LEVEL_STARTERS = new Set(['fun', 'val', 'var', 'class', 'interface', 'object', 'enum', 'data', 'sealed', 'abstract', 'open', 'private', 'public', 'internal', 'protected', 'import', 'package', 'typealias', 'const', 'inline', 'suspend', 'tailrec', 'operator', 'infix', 'lateinit', 'override', 'inner', 'value', 'annotation', 'expect', 'actual', 'external', 'final']);

/**
 * `fun main() { ... }` followed by a bare `println("B")`: only declarations may sit at the top level of a Kotlin file. Judged only for a
 * complete program (one with `fun main`), since lesson fragments without main are run as if they were inside it.
 */
function topLevelStatement(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  if (!/\bfun\s+main\s*\(/.test(masked)) return null;
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind === 'symbol' && OPENERS.has(t.text)) { depth++; continue; }
    if (t.kind === 'symbol' && CLOSERS.has(t.text)) { depth--; continue; }
    if (depth !== 0) continue;
    const previous = tokens[i - 1];
    const firstOnLine = !previous || lineOfOffset(code, previous.start) !== lineOfOffset(code, t.start);
    if (!firstOnLine) continue;
    // a line that continues the previous declaration (`= expr`, `: Type`, a chained call, an annotation, a class header continuation)
    if (previous && ((previous.kind === 'symbol' && !['}', ')', ']'].includes(previous.text)) || (previous.kind === 'word' && ['by', 'where', 'in', 'is', 'as', 'else'].includes(previous.text)))) continue;
    if (t.kind === 'symbol' && ['@', '.', '?', ':', '=', ',', '>', '<', '+', '-', '*', '/', '|', '&'].includes(t.text)) continue;
    if (t.kind === 'word' && (TOP_LEVEL_STARTERS.has(t.text) || ['where', 'get', 'set', 'by', 'else', 'in', 'is', 'as'].includes(t.text))) continue;
    return diagnostic(code, masked, t, 'Syntax error: Expecting a top level declaration (statements must be inside a function such as main).');
  }
  return null;
}

/** `if (n)` / `while (count)` where the condition is an Int (a number literal, or a name declared once with a number). */
function nonBooleanCondition(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const numeric = new Map<string, string>();
  for (const m of masked.matchAll(/\b(?:val|var)\s+([A-Za-z_]\w*)\s*(?::\s*(Int|Long|Double|String)\s*)?=\s*(-?\d[\d_]*(\.\d+)?)\s*$/gm)) numeric.set(m[1], m[2] ?? (m[4] ? 'Double' : 'Int'));
  for (const m of masked.matchAll(/\b(?:val|var)\s+([A-Za-z_]\w*)\s*:\s*(Int|Long|Double)\b/g)) numeric.set(m[1], m[2]);
  const declaredTwice = (name: string) => (masked.match(new RegExp(`\\b(?:val|var)\\s+${name}\\b|[(,]\\s*${name}\\s*:`, 'g')) ?? []).length > 1;
  for (let i = 0; i + 3 < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || (t.text !== 'if' && t.text !== 'while') || tokens[i + 1].text !== '(' || tokens[i + 3].text !== ')') continue;
    const c = tokens[i + 2];
    const type = c.kind === 'number' ? (/\./.test(c.text) ? 'Double' : 'Int') : c.kind === 'word' && numeric.has(c.text) && !declaredTwice(c.text) ? numeric.get(c.text) : undefined;
    if (type && type !== 'String') return diagnostic(code, masked, c, `Condition type mismatch: inferred type is ${type} but Boolean was expected.`);
  }
  return null;
}

/** `var name = "Kotlin"` then `name = 5`: the variable's type comes from its first value, and a literal of another type cannot be assigned. */
function assignedLiteralMismatch(code: string, masked: string, tokens: SourceToken[]): KotlinDiagnostic | null {
  const kindOf = (t: SourceToken | undefined): string | undefined => !t ? undefined : t.kind === 'string' ? (t.text.startsWith("'") ? 'Char' : 'String')
    : t.kind === 'number' ? (/[lL]$/.test(t.text) ? 'Long' : /[fF]$/.test(t.text) ? 'Float' : /\./.test(t.text) ? 'Double' : 'Int')
    : t.kind === 'word' && (t.text === 'true' || t.text === 'false') ? 'Boolean' : undefined;
  const declared = new Map<string, string>();
  const count = new Map<string, number>();
  for (let i = 0; i + 3 < tokens.length; i++) {
    if (tokens[i].kind !== 'word' || (tokens[i].text !== 'var' && tokens[i].text !== 'val') || tokens[i + 1].kind !== 'word') continue;
    const name = tokens[i + 1].text;
    count.set(name, (count.get(name) ?? 0) + 1);
    if (isPlainAssign(tokens, i + 2, code)) {
      const value = tokens[i + 3];
      const after = tokens[i + 4];
      const k = kindOf(value);
      if (k && (!after || lineOfOffset(code, after.start) !== lineOfOffset(code, value.start) || after.text === ';')) declared.set(name, k);
    }
  }
  for (const m of masked.matchAll(/[(,]\s*(?:val\s+|var\s+)?([A-Za-z_]\w*)\s*:/g)) count.set(m[1], (count.get(m[1]) ?? 0) + 1);
  for (let i = 1; i + 2 < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || !declared.has(t.text) || count.get(t.text) !== 1) continue;
    const before = tokens[i - 1]?.text;
    if (before === '.' || before === 'val' || before === 'var' || before === '?') continue;
    if (!isPlainAssign(tokens, i + 1, code)) continue;
    const value = tokens[i + 2];
    const after = tokens[i + 3];
    const k = kindOf(value);
    if (!k || (after && lineOfOffset(code, after.start) === lineOfOffset(code, value.start) && after.text !== ';')) continue;
    const want = declared.get(t.text)!;
    const fits = k === want || (want === 'Long' && k === 'Int') || (want === 'Double' && k === 'Double');
    if (!fits) return diagnostic(code, masked, value, `Assignment type mismatch: actual type is ${k}, but ${want} was expected.`);
  }
  return null;
}
