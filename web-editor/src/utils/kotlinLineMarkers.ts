import { scanKotlin, type SourceToken } from './kotlinSource';

/**
 * Runtime error line numbers. Before translation, a line `__kt_line = N` is inserted above every statement that starts a line inside a
 * code block (function, method, lambda, init, if/else/loop/try body), N being the statement's ORIGINAL line. When the program crashes,
 * the runner reports the last value written, i.e. the Kotlin line that was running.
 *
 * Markers go on their own line (the runner's later passes match patterns at the start of a line, so a prefix on the same line would
 * break them); `lineMap` converts a line of the marked text back to the original line for errors found during translation.
 *
 * No marker is ever placed where it would change the program: not in class/object/interface/enum bodies (declarations only), not in
 * `when` bodies (branches), and not on a line that continues the previous one (`.map {`, `?: x`, `else`, the body of an `if (...)`
 * written without braces, an operator or comma at the end of the previous line, ...).
 */
export const LINE_MARKER = '__kt_line';

const OPEN = new Set(['(', '[', '{']);
const CLOSE = new Set([')', ']', '}']);
const ENDS_INCOMPLETE = new Set(['+', '-', '*', '/', '%', '=', '(', '[', ',', '.', '?', ':', '!', '<', '>', '&', '|']);
const STARTS_CONTINUATION = new Set(['.', '?', ':', '&', '|', '+', '-', '*', '/', '%', '=', '!', '<', '>', ')', ']', '}', '@']);
const WORD_ENDS_INCOMPLETE = new Set(['else', 'return', 'throw', 'in', 'is', 'as', 'by', 'do']);
const WORD_STARTS_CONTINUATION = new Set(['else', 'catch', 'finally', 'in', 'is', 'as', 'by', 'where', 'get', 'set']);
const DECLARATION_WORDS = new Set(['class', 'object', 'interface', 'enum']);

export function insertLineMarkers(code: string): { code: string; lineMap: number[] } {
  const identity = () => ({ code, lineMap: code.split('\n').map((_, i) => i + 1) });
  let tokens: SourceToken[];
  try {
    tokens = scanKotlin(code).filter((t) => t.kind !== 'comment');
  } catch {
    return identity();
  }
  if (!tokens.length) return identity();

  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (offset: number) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
  const line = tokens.map((t) => lineOf(t.start));
  const pairs = new Map<number, number>();
  {
    const stack: number[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.kind !== 'symbol') continue;
      if (OPEN.has(t.text)) stack.push(i);
      else if (CLOSE.has(t.text) && stack.length) { const o = stack.pop()!; pairs.set(o, i); pairs.set(i, o); }
    }
  }
  const text = (i: number) => tokens[i]?.text ?? '';
  const isSymbol = (i: number, s: string) => tokens[i]?.kind === 'symbol' && tokens[i].text === s;

  /** Is the `{` at `open` the body of code (true) or of declarations / when-branches (false)? Reads the header on the same line. */
  const isCodeBlock = (open: number): boolean => {
    const prev = open - 1;
    if (prev >= 0 && isSymbol(prev, ')') && pairs.has(prev) && text(pairs.get(prev)! - 1) === 'when') return false;
    if (text(prev) === 'when') return false;
    let k = prev;
    let currentLine = line[open];
    while (k >= 0) {
      const t = tokens[k];
      if (t.kind === 'symbol' && CLOSE.has(t.text) && pairs.has(k)) { k = pairs.get(k)!; currentLine = line[k]; k--; continue; }
      // a header continued from the line above (`class Repo<T> :` / `    Reader<T>, Writer<T> {`)
      if (line[k] !== currentLine) { if (t.kind === 'symbol' && (t.text === ':' || t.text === ',')) { currentLine = line[k]; continue; } break; }
      if (t.kind === 'symbol' && (t.text === '{' || t.text === '}' || t.text === ';' || t.text === '=')) break;
      if (t.kind === 'symbol' && t.text === '>' && text(k - 1) === '-') break; // `->`
      if (t.kind === 'word' && DECLARATION_WORDS.has(t.text)) return false;
      if (t.kind === 'word' && t.text === 'fun') return true;
      k--;
    }
    return true;
  };

  const insertBefore: { offset: number; line: number }[] = [];
  for (let open = 0; open < tokens.length; open++) {
    if (!isSymbol(open, '{') || !pairs.has(open) || !isCodeBlock(open)) continue;
    const close = pairs.get(open)!;
    let start = open + 1;
    // Lambda parameters on the opening line: `{ a, b ->` -- statements start after the arrow.
    for (let k = open + 1; k < close && line[k] === line[open]; k++) {
      if (pairs.has(k) && pairs.get(k)! > k) { k = pairs.get(k)!; continue; }
      if (isSymbol(k, '>') && text(k - 1) === '-') { start = k + 1; break; }
    }
    for (let j = start; j < close; j++) {
      const previous = j - 1;
      const firstOnLine = line[j] !== line[previous];
      if (firstOnLine) {
        const p = tokens[previous];
        const t = tokens[j];
        const headerWithoutBraces = isSymbol(previous, ')') && pairs.has(previous) && ['if', 'while', 'for', 'when', 'catch'].includes(text(pairs.get(previous)! - 1));
        // `i++`, `x--`, `x!!`, a nullable type `String?` or a generic `List<Int>` at the end of a line are complete, not a dangling operator.
        const completeSuffix = (p.text === '+' && text(previous - 1) === '+') || (p.text === '-' && text(previous - 1) === '-') || (p.text === '!' && text(previous - 1) === '!')
          || (p.text === '?' && tokens[previous - 1]?.kind === 'word') || (p.text === '>' && !['-', '=', '>'].includes(text(previous - 1)) && tokens[previous - 1]?.kind === 'word');
        const incomplete = (p.kind === 'symbol' && ENDS_INCOMPLETE.has(p.text) && previous !== open && !completeSuffix) || (p.kind === 'word' && WORD_ENDS_INCOMPLETE.has(p.text)) || headerWithoutBraces;
        // `}` then `while (cond)` on the next line closes a do-while: the while belongs to it.
        const doWhileTail = t.kind === 'word' && t.text === 'while' && isSymbol(previous, '}') && pairs.has(previous) && text(pairs.get(previous)! - 1) === 'do';
        const continuation = doWhileTail || (t.kind === 'symbol' && STARTS_CONTINUATION.has(t.text)) || (t.kind === 'word' && WORD_STARTS_CONTINUATION.has(t.text));
        if (!incomplete && !continuation) insertBefore.push({ offset: lineStarts[line[j] - 1], line: line[j] });
      }
      if (pairs.has(j) && pairs.get(j)! > j && pairs.get(j)! < close) j = pairs.get(j)!; // nested brackets are judged on their own
    }
  }
  if (!insertBefore.length) return identity();

  // Insert each marker as its own line, indented like the statement it precedes.
  const markedLines = new Map<number, number>();
  for (const m of insertBefore) markedLines.set(m.line, m.line);
  const original = code.split('\n');
  const out: string[] = [];
  const lineMap: number[] = [];
  original.forEach((text, i) => {
    const n = i + 1;
    if (markedLines.has(n)) {
      // The `;` matters: a next line starting with `(` would otherwise be parsed by JavaScript as a call on the number (`5(n--)`).
      out.push(`${/^\s*/.exec(text)![0]}${LINE_MARKER} = ${n};`);
      lineMap.push(n);
    }
    out.push(text);
    lineMap.push(n);
  });
  return { code: out.join('\n'), lineMap };
}

/**
 * Where each function or getter is declared, for the bodies that have no statement to mark: an expression body (`fun f(x: Int) = x / 0`)
 * or a getter (`get() = a / b`). Keyed `Class.name` for members, `name` for top-level functions, `Class.get:name` for getters.
 */
export function expressionBodyLines(code: string): Map<string, number> {
  const out = new Map<string, number>();
  let tokens: SourceToken[];
  try { tokens = scanKotlin(code).filter((t) => t.kind !== 'comment'); } catch { return out; }
  const lineOf = (offset: number) => code.slice(0, offset).split('\n').length;
  // The class whose body each token sits in (a stack of open braces, each tagged with its class name when it is a class/object body).
  const classAt: (string | null)[] = [];
  const stack: (string | null)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    classAt.push(stack.filter(Boolean).at(-1) ?? null);
    if (t.kind === 'symbol' && t.text === '{') {
      let name: string | null = null;
      for (let k = i - 1; k >= 0 && lineOf(tokens[k].start) === lineOf(t.start); k--) {
        if (tokens[k].kind === 'word' && ['class', 'object'].includes(tokens[k].text) && tokens[k + 1]?.kind === 'word') { name = tokens[k + 1].text; break; }
      }
      stack.push(name);
    } else if (t.kind === 'symbol' && t.text === '}') stack.pop();
  }
  const closeParen = (open: number) => { let d = 0; for (let k = open; k < tokens.length; k++) { if (tokens[k].text === '(') d++; else if (tokens[k].text === ')' && --d === 0) return k; } return -1; };
  for (let i = 0; i + 2 < tokens.length; i++) {
    const t = tokens[i];
    const owner = classAt[i];
    if (t.kind === 'word' && t.text === 'fun' && tokens[i + 1]?.kind === 'word' && tokens[i + 2]?.text === '(') {
      const close = closeParen(i + 2);
      let k = close + 1;
      if (tokens[k]?.text === ':') { k++; while (k < tokens.length && tokens[k].text !== '=' && tokens[k].text !== '{' && lineOf(tokens[k].start) === lineOf(tokens[close].start)) k++; }
      if (tokens[k]?.text === '=' && tokens[k + 1]?.text !== '=') out.set(`${owner ? owner + '.' : ''}${tokens[i + 1].text}`, lineOf(tokens[k + 1]?.start ?? tokens[k].start));
    }
    if (t.kind === 'word' && t.text === 'get' && tokens[i + 1]?.text === '(' && tokens[i + 2]?.text === ')' && tokens[i + 3]?.text === '=') {
      // the property name: the nearest `val name` before it
      for (let k = i - 1; k >= 0; k--) if (tokens[k].kind === 'word' && (tokens[k].text === 'val' || tokens[k].text === 'var') && tokens[k + 1]?.kind === 'word') { out.set(`${owner ? owner + '.' : ''}get:${tokens[k + 1].text}`, lineOf(tokens[i + 3].start)); break; }
    }
  }
  return out;
}

/**
 * After translation: wrap every named function and class method/getter so the line markers stay right across calls. On entry it saves the
 * caller's line (and, for an expression body, sets its own declaration line); on a normal return it restores the caller's line, so a
 * crash later in the same caller statement (`findUser(2)!!`) reports the caller's line; on a throw the error is tagged with the line that
 * was running first, so the innermost line wins.
 */
export function wrapFunctionsForLines(js: string, declarationLines: Map<string, number>): string {
  type Body = { open: number; close: number; key: string };
  const bodies: Body[] = [];
  const stack: { kind: 'class' | 'function' | 'other'; name: string; open: number }[] = [];
  const templateDepth: number[] = [];
  let i = 0;
  const lineStart = (at: number) => js.lastIndexOf('\n', at - 1) + 1;
  while (i < js.length) {
    const ch = js[i];
    if (ch === '/' && js[i + 1] === '/') { while (i < js.length && js[i] !== '\n') i++; continue; }
    if (ch === '/' && js[i + 1] === '*') { const end = js.indexOf('*/', i + 2); i = end < 0 ? js.length : end + 2; continue; }
    if (ch === '"' || ch === "'") { i++; while (i < js.length && js[i] !== ch) { if (js[i] === '\\') i++; i++; } i++; continue; }
    if (ch === '`' || (ch === '}' && templateDepth.length && templateDepth[templateDepth.length - 1] === stack.length)) {
      // inside a template literal: skip text until the closing backtick or a `${`
      if (ch === '}') templateDepth.pop();
      i++;
      while (i < js.length && js[i] !== '`') {
        if (js[i] === '\\') { i += 2; continue; }
        if (js[i] === '$' && js[i + 1] === '{') { templateDepth.push(stack.length); i += 2; break; }
        i++;
      }
      if (js[i] === '`') i++;
      continue;
    }
    if (ch === '{') {
      const header = js.slice(lineStart(i), i);
      const parent = stack.at(-1);
      let entry: (typeof stack)[number] = { kind: 'other', name: '', open: i };
      const classHeader = /\bclass\s+([A-Za-z_$][\w$]*)(?:\s+extends\s+[\w$.]+)?\s*$/.exec(header);
      const fn = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/.exec(header);
      const method = parent?.kind === 'class' ? /^\s*(?:static\s+)?(get\s+)?([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/.exec(header) : null;
      if (classHeader) entry = { kind: 'class', name: classHeader[1], open: i };
      else if (fn) entry = { kind: 'function', name: fn[1], open: i };
      else if (method && method[2] !== 'constructor') entry = { kind: 'function', name: `${parent!.name}.${method[1] ? 'get:' : ''}${method[2]}`, open: i };
      stack.push(entry);
      i++;
      continue;
    }
    if (ch === '}') {
      const entry = stack.pop();
      if (entry?.kind === 'function') bodies.push({ open: entry.open, close: i, key: entry.name });
      i++;
      continue;
    }
    i++;
  }
  // Insert from the end so earlier offsets stay valid.
  const edits: { at: number; text: string }[] = [];
  for (const b of bodies) {
    const own = declarationLines.get(b.key);
    edits.push({ at: b.open + 1, text: ` const __kt_caller = __kt_line;${own ? ` __kt_line = ${own};` : ''} try {` });
    edits.push({ at: b.close, text: `} catch (__kt_error) { __kt_tag(__kt_error); throw __kt_error; } finally { __kt_line = __kt_caller; } ` });
  }
  edits.sort((a, b) => b.at - a.at);
  let result = js;
  for (const e of edits) result = result.slice(0, e.at) + e.text + result.slice(e.at);
  return result;
}

/**
 * `for (n in 1..3) println(n)` / `while (i < 3) i++`: a loop whose body is one statement without braces. The runner's loop translation
 * expects a block, so the body is wrapped in braces first. The braces go on the SAME line(s) (a body on the next line gets `{` after the
 * header and `}` at the end of that line), so line numbers never move. Repeats until no brace-less loop is left (nested one-liners).
 */
export function braceSingleStatementLoops(code: string): string {
  for (let round = 0; round < 20; round++) {
    let tokens: SourceToken[];
    try { tokens = scanKotlin(code).filter((t) => t.kind !== 'comment'); } catch { return code; }
    const lineOf = (offset: number) => code.slice(0, offset).split('\n').length;
    let changed = false;
    for (let i = 0; i + 1 < tokens.length && !changed; i++) {
      const t = tokens[i];
      if (t.kind !== 'word' || (t.text !== 'for' && t.text !== 'while') || tokens[i + 1].text !== '(') continue;
      if (t.text === 'while' && tokens[i - 1]?.text === '}') {
        // `} while (cond)` closes a do-while: no body of its own.
        let depth = 0;
        let isDoWhile = false;
        for (let k = i - 1; k >= 0; k--) { if (tokens[k].text === '}') depth++; else if (tokens[k].text === '{' && --depth === 0) { isDoWhile = tokens[k - 1]?.text === 'do'; break; } }
        if (isDoWhile) continue;
      }
      let depth = 0;
      let close = -1;
      for (let k = i + 1; k < tokens.length; k++) { if (tokens[k].text === '(') depth++; else if (tokens[k].text === ')' && --depth === 0) { close = k; break; } }
      const body = tokens[close + 1];
      if (close < 0 || !body || body.text === '{' || body.text === ';') continue;
      // The body runs to the end of its line (the line of its first token).
      const bodyLine = lineOf(body.start);
      const lineEnd = code.indexOf('\n', body.start) < 0 ? code.length : code.indexOf('\n', body.start);
      let end = lineEnd;
      // keep a trailing `// comment` outside the braces
      for (const tok of scanKotlin(code.slice(body.start, lineEnd))) if (tok.kind === 'comment') { end = body.start + tok.start; break; }
      while (end > body.start && /\s/.test(code[end - 1])) end--;
      const sameLine = lineOf(tokens[close].start) === bodyLine;
      code = sameLine
        ? code.slice(0, body.start) + '{ ' + code.slice(body.start, end) + ' }' + code.slice(end)
        : code.slice(0, tokens[close].end) + ' {' + code.slice(tokens[close].end, end) + ' }' + code.slice(end);
      changed = true;
    }
    if (!changed) return code;
  }
  return code;
}
