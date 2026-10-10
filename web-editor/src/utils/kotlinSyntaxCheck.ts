/**
 * A real Kotlin grammar (tree-sitter-kotlin, MIT) checks the program's SYNTAX before the simulator runs it. The simulator's own parser is
 * permissive (it translates line by line), so a malformed program used to run, or crash at runtime, where kotlinc refuses to compile it.
 *
 * The parser is loaded once, asynchronously (`ensureKotlinSyntax`); the check itself is synchronous. Until the parser is ready, or if it
 * fails to load (an old WebView without WebAssembly), the check returns null and the simulator behaves exactly as before.
 *
 * The grammar has a few gaps where it rejects valid Kotlin. `prepareForParse` rewrites those shapes before parsing, without moving any
 * line, so the reported line and column still point into the learner's code. Measured against kotlinc in
 * scripts/compare-errors (programs with a mistake) and scripts/test-structure-no-false-positives.ts (every valid program in the app).
 */
import type { Node as TSNode, Parser as TSParser } from 'web-tree-sitter';
import { maskStringsAndComments } from './errorSpan';

export interface KotlinSyntaxError { line: number; column: number; message: string; token?: string }

let parser: TSParser | null = null;
let loading: Promise<boolean> | null = null;
/** Where the two WASM files are; the app sets it from Vite asset URLs (kotlinSyntaxAssets.ts). Node scripts read the files from disk. */
let assets: { runtime?: string; grammar: string | Uint8Array } | null = null;

export function setKotlinSyntaxAssets(a: { runtime?: string; grammar: string | Uint8Array }) { assets = a; }

export function ensureKotlinSyntax(): Promise<boolean> {
  if (parser) return Promise.resolve(true);
  if (!loading) loading = load().catch((err) => { console.warn('Kotlin syntax check unavailable:', err); return false; });
  return loading;
}

async function load(): Promise<boolean> {
  const { Parser, Language } = await import('web-tree-sitter');
  let a = assets;
  if (!a && typeof window === 'undefined' && typeof process !== 'undefined' && process.versions?.node) {
    // Node (tests, comparison scripts): a variable specifier keeps the bundler from following it into the app.
    const spec = './kotlinSyntaxAssets.node.ts';
    a = await (await import(/* @vite-ignore */ spec)).nodeKotlinSyntaxAssets();
  }
  if (!a) return false;
  const runtime = a.runtime;
  await Parser.init(runtime ? { locateFile: () => runtime } : undefined);
  const lang = await Language.load(a.grammar);
  const p = new Parser();
  p.setLanguage(lang);
  parser = p;
  return true;
}

export function kotlinSyntaxReady(): boolean { return !!parser; }

/**
 * Rewrites shapes valid in Kotlin that this grammar rejects. Line breaks never move. Returns the text and, per line, the original columns
 * where a character was INSERTED (so a reported column can be mapped back).
 */
export function prepareForParse(code: string): { text: string; inserted: Map<number, number[]> } {
  const out = code.split('');
  const masked = maskStringsAndComments(code).split('');
  const insertBefore = new Map<number, string>();
  const addBefore = (at: number, text: string) => insertBefore.set(at, (insertBefore.get(at) ?? '') + text);
  // 1. `}` then a line break, then `catch`/`finally`: a second catch on its own line is rejected. Move the `}` next to the keyword
  //    (into the indentation before it), so neither line count nor the keyword's column changes.
  const src = masked.join('');
  const movedBraces = new Set<number>();
  for (const m of src.matchAll(/\}([ \t]*\n([ \t]*))(?=(?:catch|finally)\b)/g)) {
    const brace = m.index!;
    const keyword = brace + m[0].length;
    out[brace] = ' '; masked[brace] = ' ';
    // No indentation to reuse: insert the brace instead (the column map below undoes the shift).
    if (m[2]) { out[keyword - 1] = '}'; masked[keyword - 1] = '}'; } else movedBraces.add(keyword);
  }
  // 2. A closing `}` on the same line as the last member of a class/object body (`class K { val x = 1 }`) is rejected; a `;` before it
  //    is valid Kotlin everywhere a block ends, and accepted. The space before the brace becomes the `;` (columns unchanged).
  for (let i = 0; i < masked.length; i++) {
    if (masked[i] !== '}') continue;
    let j = i - 1;
    while (j >= 0 && (masked[j] === ' ' || masked[j] === '\t')) j--;
    if (j < 0 || masked[j] === '\n' || '{;,('.includes(masked[j])) continue;
    if (masked[j] === '>' && masked[j - 1] === '-') continue; // `{ x -> }`
    if (j < i - 1) { out[i - 1] = ';'; } else addBefore(i, ';');
  }
  for (const at of movedBraces) addBefore(at, '}');
  // 2b. A statement that is only a parenthesized name (`{ (it) }`) is read as a destructuring lambda parameter missing its `->`. For the
  //     syntax check `(it)` and ` it ` are the same, so the parentheses are blanked (a real `(a) ->` parameter keeps them).
  for (const m of masked.join('').matchAll(/(^|[{;\n])([ \t]*)\(\s*[A-Za-z_]\w*\s*\)(?=[ \t]*(?:\n|\}|;|$))/g)) {
    const open = m.index! + m[1].length + m[2].length;
    const close = masked.indexOf(')', open);
    out[open] = ' '; out[close] = ' ';
  }
  // 3. Anonymous function parameters without a type (`fun(word) = ...`, valid where the expected type is known): give them one.
  for (const m of src.matchAll(/(?<![\w.])fun\s*\(([^()]*)\)/g)) {
    let at = m.index! + m[0].indexOf('(') + 1;
    for (const part of m[1].split(',')) {
      const name = /^\s*([A-Za-z_]\w*)\s*$/.exec(part);
      if (name) addBefore(at + part.trimEnd().length, ': Any');
      at += part.length + 1;
    }
  }
  if (!insertBefore.size) return { text: out.join(''), inserted: new Map() };
  const inserted = new Map<number, number[]>();
  let line = 0, col = 0, text = '';
  for (let i = 0; i <= out.length; i++) {
    const add = insertBefore.get(i);
    if (add) { text += add; const list = inserted.get(line) ?? []; for (let k = 0; k < add.length; k++) list.push(col); inserted.set(line, list); }
    if (i === out.length) break;
    text += out[i];
    if (out[i] === '\n') { line++; col = 0; } else col++;
  }
  return { text, inserted };
}

/** The first syntax error, as kotlinc would roughly report it; null when the program parses (or the parser is not loaded). */
export function checkKotlinSyntax(code: string): KotlinSyntaxError | null {
  if (!parser) return null;
  const { text, inserted } = prepareForParse(code);
  const tree = parser.parse(text);
  if (!tree) return null;
  let bad: { row: number; column: number; message: string } | null = null;
  const missing: { row: number; column: number; message: string }[] = [];
  try {
    if (!tree.rootNode.hasError) return null;
    const p = firstProblem(tree.rootNode);
    if (p) bad = { row: p.node.startPosition.row, column: p.node.startPosition.column, message: p.message };
    collectMissing(tree.rootNode, missing);
  } finally {
    tree.delete();
  }
  if (!bad) return null;
  const unshift = (row: number, column: number) => column - (inserted.get(row) ?? []).filter((c, k) => c + k < column).length;
  const lines = code.split('\n');
  const maskedLines = maskStringsAndComments(code).split('\n');
  const tokenAt = (row: number, column: number) => /^[\w$]+|^\S/.exec((lines[row] ?? '').slice(column))?.[0];

  // tree-sitter's ERROR node often wraps the whole enclosing function, so its position says little. Locate the mistake by experiment
  // instead (a parse takes well under a millisecond): the first line whose removal lets the program parse is where kotlinc stops too,
  // and within it, the token whose removal fixes the line is the unexpected one.
  const blankLine = (row: number) => lines.map((l, k) => (k === row ? l.replace(/[^\n]/g, ' ') : l)).join('\n');
  // Removing a line whose brackets do not balance changes the block structure (blanking `fun main() {` turns the body into top-level
  // script code that parses). Such a line can only be the culprit when the program's brackets do not balance either.
  const balance = (s: string) => { let n = 0; for (const ch of s) n += '({['.includes(ch) ? 1 : ')}]'.includes(ch) ? -1 : 0; return n; };
  const programBalanced = balance(maskedLines.join('\n')) === 0;
  let row = -1;
  for (let r = 0; r < lines.length && r <= bad.row + 40; r++) {
    if (!maskedLines[r].trim() || /^[\s{}()]*$/.test(maskedLines[r])) continue; // a line of only brackets never "fixes" anything real
    if (programBalanced && balance(maskedLines[r]) !== 0) continue;
    if (parsesCleanly(blankLine(r))) { row = r; break; }
  }
  if (row < 0) {
    // No single line is to blame (often an unclosed bracket): report tree-sitter's own first problem.
    const column = unshift(bad.row, bad.column);
    return { line: bad.row + 1, column, message: bad.message, token: tokenAt(bad.row, column) };
  }
  const masked = maskedLines[row];
  for (const m of masked.matchAll(/->|\.\.|\?:|\?\.|!!|&&|\|\||[=!<>]=|[A-Za-z_]\w*|\d[\w.]*|\S/g)) {
    const start = m.index!, end = start + m[0].length;
    const edited = lines.map((l, k) => (k === row ? l.slice(0, start) + ' '.repeat(end - start) + l.slice(end) : l)).join('\n');
    if (parsesCleanly(edited)) return { line: row + 1, column: start, message: `Unexpected '${lines[row].slice(start, end)}'`, token: lines[row].slice(start, end) };
  }
  const miss = missing.find((x) => x.row === row);
  if (miss) { const column = unshift(row, miss.column); return { line: row + 1, column, message: miss.message, token: tokenAt(row, column) }; }
  const column = bad.row === row ? unshift(row, bad.column) : masked.length - masked.trimStart().length;
  return { line: row + 1, column, message: bad.row === row ? bad.message : 'This line is not valid Kotlin', token: tokenAt(row, column) };
}

function parsesCleanly(code: string): boolean {
  const tree = parser!.parse(prepareForParse(code).text);
  if (!tree) return false;
  const ok = !tree.rootNode.hasError;
  tree.delete();
  return ok;
}

function collectMissing(node: TSNode, out: { row: number; column: number; message: string }[]) {
  if (node.isMissing) out.push({ row: node.startPosition.row, column: node.startPosition.column, message: `Expecting ${describe(node.type)}` });
  if (!node.hasError) return;
  for (const c of node.children) if (c) collectMissing(c, out);
}

function firstProblem(node: TSNode): { node: TSNode; message: string } | null {
  if (node.isMissing) return { node, message: `Expecting ${describe(node.type)}` };
  if (node.isError) {
    // The ERROR node wraps what could not be fitted; its first token is where parsing went wrong.
    const first = firstLeaf(node);
    return { node: first ?? node, message: first ? `Unexpected '${first.text.slice(0, 20)}'` : 'Unexpected input' };
  }
  for (const child of node.children) {
    if (!child) continue;
    if (child.hasError || child.isMissing || child.isError) {
      const r = firstProblem(child);
      if (r) return r;
    }
  }
  return null;
}

function firstLeaf(node: TSNode): TSNode | null {
  if (node.childCount === 0) return node.text ? node : null;
  for (const c of node.children) { if (!c) continue; const l = firstLeaf(c); if (l) return l; }
  return null;
}

function describe(type: string): string {
  if (type === 'identifier' || type === 'simple_identifier') return 'a name';
  if (/^[a-z_]+$/.test(type)) return `an ${type.replace(/_/g, ' ')}`.replace(/^an ([^aeiou])/, 'a $1');
  return `'${type}'`;
}
