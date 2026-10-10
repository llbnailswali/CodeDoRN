/**
 * Mutation operators: each takes a VALID program and proposes small edits that reproduce a mistake a learner commonly makes.
 * An edit is a replacement of code[start, end) by `text`. Positions are chosen on the program with strings and comments blanked
 * (same length), so an operator never edits inside a string or a comment.
 */
import { maskStringsAndComments } from '../../src/utils/errorSpan';

export interface Edit { start: number; end: number; text: string; desc: string }
export interface Operator { name: string; describe: string; edits: (code: string, masked: string) => Edit[] }

const KEYWORDS = new Set(['val', 'var', 'fun', 'class', 'if', 'else', 'for', 'while', 'when', 'return', 'in', 'is', 'as', 'null', 'true', 'false', 'println', 'print', 'object', 'interface', 'this', 'it', 'override', 'open', 'data', 'enum', 'try', 'catch', 'finally', 'throw', 'main', 'init', 'constructor', 'by', 'lazy']);

const all = (masked: string, re: RegExp) => [...masked.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))];

function declaredNames(masked: string): Set<string> {
  const names = new Set<string>();
  for (const m of masked.matchAll(/\b(?:val|var|fun|class|object)\s+([A-Za-z_]\w*)/g)) names.add(m[1]);
  for (const m of masked.matchAll(/[(,]\s*(?:val\s+|var\s+)?([A-Za-z_]\w*)\s*:/g)) names.add(m[1]);
  for (const m of masked.matchAll(/\bfor\s*\(\s*([A-Za-z_]\w*)\s+in\b/g)) names.add(m[1]);
  return names;
}

/** Index of the `)` matching the `(` at `open` in `masked`, or -1. */
function matchingParen(masked: string, open: number): number {
  let depth = 0;
  for (let i = open; i < masked.length; i++) {
    if (masked[i] === '(') depth++;
    else if (masked[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

/** Start offsets of the top-level arguments inside the parentheses [open, close]. */
function topLevelCommas(masked: string, open: number, close: number): number[] {
  const commas: number[] = [];
  let depth = 0;
  for (let i = open + 1; i < close; i++) {
    const c = masked[i];
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) commas.push(i);
  }
  return commas;
}

const del = (start: number, end: number, desc: string): Edit => ({ start, end, text: '', desc });

export const OPERATORS: Operator[] = [
  { name: 'drop-close-bracket', describe: 'delete a ) } or ]', edits: (c, m) => all(m, /[)}\]]/).map((x) => del(x.index!, x.index! + 1, `delete "${x[0]}"`)) },
  { name: 'drop-open-bracket', describe: 'delete a ( or {', edits: (c, m) => all(m, /[({]/).map((x) => del(x.index!, x.index! + 1, `delete "${x[0]}"`)) },
  { name: 'drop-quote', describe: 'delete a " quote', edits: (c, m) => all(m, /"/).filter((x) => c[x.index!] === '"').map((x) => del(x.index!, x.index! + 1, 'delete a quote')) },
  {
    name: 'typo-identifier',
    describe: 'swap two neighbouring letters of a declared name where it is used',
    edits: (c, m) => {
      const names = declaredNames(m);
      const out: Edit[] = [];
      for (const x of all(m, /\b[A-Za-z_]\w{3,}\b/)) {
        const word = x[0];
        if (!names.has(word) || KEYWORDS.has(word)) continue;
        for (let k = 1; k < word.length - 1; k++) {
          if (word[k] === word[k + 1]) continue;
          const typo = word.slice(0, k) + word[k + 1] + word[k] + word.slice(k + 2);
          if (!names.has(typo) && !KEYWORDS.has(typo)) { out.push({ start: x.index!, end: x.index! + word.length, text: typo, desc: `${word} -> ${typo}` }); break; }
        }
      }
      return out;
    },
  },
  {
    name: 'typo-builtin',
    describe: 'misspell println / listOf / mutableListOf / mapOf',
    edits: (c, m) => all(m, /\b(println|listOf|mutableListOf|mapOf|mutableMapOf|setOf)\b/).map((x) => ({ start: x.index!, end: x.index! + x[0].length, text: x[0].slice(0, -2) + x[0].slice(-1), desc: `${x[0]} -> ${x[0].slice(0, -2) + x[0].slice(-1)}` })),
  },
  {
    name: 'var-to-val',
    describe: 'declare a variable that is later reassigned with val',
    edits: (c, m) => all(m, /\bvar\s+([A-Za-z_]\w*)/).filter((x) => new RegExp(`(?<![\\w.])${x[1]}\\s*(?:=(?!=)|\\+=|-=|\\*=|/=|%=|\\+\\+|--)|(?:\\+\\+|--)${x[1]}\\b`).test(m.slice(x.index! + x[0].length))).map((x) => ({ start: x.index!, end: x.index! + 3, text: 'val', desc: `var ${x[1]} -> val ${x[1]}` })),
  },
  { name: 'remove-safe-call', describe: 'replace ?. with .', edits: (c, m) => all(m, /\?\./).map((x) => ({ start: x.index!, end: x.index! + 2, text: '.', desc: '?. -> .' })) },
  { name: 'remove-not-null-assert', describe: 'delete !!', edits: (c, m) => all(m, /!!/).map((x) => del(x.index!, x.index! + 2, 'delete !!')) },
  {
    name: 'annotation-type-swap',
    describe: 'declared type no longer matches the value',
    edits: (c, m) => all(m, /:\s*(Int|String|Boolean|Double)\s*=/).map((x) => {
      const to = ({ Int: 'String', String: 'Int', Boolean: 'Int', Double: 'Boolean' } as Record<string, string>)[x[1]];
      const at = x.index! + x[0].indexOf(x[1]);
      return { start: at, end: at + x[1].length, text: to, desc: `: ${x[1]} -> : ${to}` };
    }),
  },
  {
    name: 'initializer-mismatch',
    describe: 'give an Int a text value, or a String a number',
    edits: (c, m) => [
      ...all(m, /(?:val|var)\s+\w+\s*:\s*Int\s*=\s*(\d+)\b/).map((x) => { const at = x.index! + x[0].lastIndexOf(x[1]); return { start: at, end: at + x[1].length, text: '"x"', desc: `${x[1]} -> "x"` }; }),
      ...all(m, /(?:val|var)\s+\w+\s*:\s*String\s*=\s*("\s*")/).map((x) => { const at = x.index! + x[0].lastIndexOf(x[1]); return { start: at, end: at + x[1].length, text: '5', desc: 'string -> 5' }; }),
    ],
  },
  {
    name: 'null-to-non-null',
    describe: 'assign null to a non-null typed variable',
    edits: (c, m) => all(m, /(?:val|var)\s+\w+\s*:\s*(?:String|Int|Boolean|Double)\s*=\s*([^\n]+)/).map((x) => { const at = x.index! + x[0].lastIndexOf(x[1]); return { start: at, end: at + x[1].length, text: 'null', desc: 'initializer -> null' }; }),
  },
  {
    name: 'extra-argument',
    describe: 'call a function with one argument too many',
    edits: (c, m) => {
      const fns = new Set([...m.matchAll(/\bfun\s+([A-Za-z_]\w*)\s*\(/g)].map((x) => x[1]));
      const out: Edit[] = [];
      for (const x of all(m, /\b([A-Za-z_]\w*)\s*\(/)) {
        if (!fns.has(x[1]) || /\bfun\s+$/.test(m.slice(0, x.index!)) || x[1] === 'main') continue;
        const open = x.index! + x[0].length - 1;
        const close = matchingParen(m, open);
        if (close < 0) continue;
        const empty = m.slice(open + 1, close).trim() === '';
        out.push({ start: close, end: close, text: empty ? '0' : ', 0', desc: `${x[1]}(...) + extra argument` });
      }
      return out;
    },
  },
  {
    name: 'missing-argument',
    describe: 'drop the last argument of a call',
    edits: (c, m) => {
      const fns = new Set([...m.matchAll(/\bfun\s+([A-Za-z_]\w*)\s*\(/g)].map((x) => x[1]));
      const out: Edit[] = [];
      for (const x of all(m, /\b([A-Za-z_]\w*)\s*\(/)) {
        if (!fns.has(x[1]) || /\bfun\s+$/.test(m.slice(0, x.index!)) || x[1] === 'main') continue;
        const open = x.index! + x[0].length - 1;
        const close = matchingParen(m, open);
        if (close < 0) continue;
        const commas = topLevelCommas(m, open, close);
        if (commas.length) out.push(del(commas[commas.length - 1], close, `${x[1]}(...) minus last argument`));
      }
      return out;
    },
  },
  { name: 'equals-to-assign', describe: 'write = instead of ==', edits: (c, m) => all(m, /(?<![=!<>])==(?!=)/).map((x) => ({ start: x.index!, end: x.index! + 2, text: '=', desc: '== -> =' })) },
  { name: 'remove-return', describe: 'forget the return keyword', edits: (c, m) => all(m, /\breturn\s+(?=\S)/).map((x) => del(x.index!, x.index! + x[0].length, 'delete return')) },
  { name: 'remove-else', describe: 'forget else', edits: (c, m) => all(m, /\belse\b\s*/).map((x) => del(x.index!, x.index! + x[0].length, 'delete else')) },
  {
    name: 'string-minus',
    describe: 'use - where string + was meant',
    edits: (c, m) => all(m, /"\s*\+\s*(?=[\w"(])/).map((x) => { const at = x.index! + x[0].indexOf('+'); return { start: at, end: at + 1, text: '-', desc: '+ -> - after a string' }; }),
  },
  {
    name: 'divide-by-zero',
    describe: 'divide by a literal 0',
    edits: (c, m) => all(m, /(?<![/*])[/%]\s*(\d+)\b/).filter((x) => x[1] !== '0').map((x) => { const at = x.index! + x[0].lastIndexOf(x[1]); return { start: at, end: at + x[1].length, text: '0', desc: `${x[0].trim()} -> 0` }; }),
  },
  { name: 'index-out-of-bounds', describe: 'index far past the end', edits: (c, m) => all(m, /\[(\d+)\]/).map((x) => ({ start: x.index! + 1, end: x.index! + 1 + x[1].length, text: '99', desc: `[${x[1]}] -> [99]` })) },
  { name: 'remove-override', describe: 'forget override', edits: (c, m) => all(m, /\boverride\s+/).map((x) => del(x.index!, x.index! + x[0].length, 'delete override')) },
  {
    name: 'wrong-argument-type',
    describe: 'pass a text argument where a number is expected (or the reverse) to a declared function',
    edits: (c, m) => {
      const fns = new Set([...m.matchAll(/\bfun\s+([A-Za-z_]\w*)\s*\(/g)].map((x) => x[1]));
      const out: Edit[] = [];
      for (const x of all(m, /\b([A-Za-z_]\w*)\s*\(/)) {
        if (!fns.has(x[1]) || /\bfun\s+$/.test(m.slice(0, x.index!)) || x[1] === 'main') continue;
        const open = x.index! + x[0].length - 1;
        const close = matchingParen(m, open);
        if (close < 0) continue;
        const firstEnd = topLevelCommas(m, open, close)[0] ?? close;
        const arg = c.slice(open + 1, firstEnd).trim();
        const at = c.indexOf(arg, open + 1);
        if (/^-?\d+$/.test(arg)) out.push({ start: at, end: at + arg.length, text: `"${arg}"`, desc: `${x[1]}(${arg}) -> ${x[1]}("${arg}")` });
        else if (/^"[^"$]*"$/.test(arg)) out.push({ start: at, end: at + arg.length, text: '42', desc: `${x[1]}(${arg}) -> ${x[1]}(42)` });
      }
      return out;
    },
  },
  {
    name: 'wrong-return-type',
    describe: 'declare the wrong return type on a function',
    edits: (c, m) => all(m, /\bfun\s+[A-Za-z_]\w*\s*\([^)]*\)\s*:\s*(Int|String|Boolean|Double)\b/).map((x) => {
      const to = ({ Int: 'String', String: 'Int', Boolean: 'Int', Double: 'String' } as Record<string, string>)[x[1]];
      const at = x.index! + x[0].lastIndexOf(x[1]);
      return { start: at, end: at + x[1].length, text: to, desc: `returns ${x[1]} -> ${to}` };
    }),
  },
  {
    name: 'private-access',
    describe: 'make a property private that is read from outside the class',
    edits: (c, m) => {
      const out: Edit[] = [];
      for (const x of all(m, /\b(class\s+[A-Z]\w*\s*\(\s*)(val|var)\s+([a-z]\w*)/)) {
        if (!new RegExp(`\\.${x[3]}\\b`).test(m.slice(x.index! + x[0].length))) continue;
        const at = x.index! + x[1].length;
        out.push({ start: at, end: at, text: 'private ', desc: `${x[2]} ${x[3]} -> private ${x[2]} ${x[3]}` });
      }
      return out;
    },
  },
  { name: 'remove-import', describe: 'forget an import', edits: (c, m) => all(m, /^import\s+[^\n]+\n/m).map((x) => del(x.index!, x.index! + x[0].length, `delete ${x[0].trim()}`)) },
  {
    name: 'loop-variable-after-loop',
    describe: 'use a for-loop variable after the loop has ended',
    edits: (c, m) => {
      const out: Edit[] = [];
      for (const x of all(m, /\bfor\s*\(\s*([a-z]\w*)\s+in\b[^)]*\)\s*\{/)) {
        let depth = 0;
        let close = -1;
        for (let k = x.index! + x[0].length - 1; k < m.length; k++) { if (m[k] === '{') depth++; else if (m[k] === '}' && --depth === 0) { close = k; break; } }
        if (close < 0) continue;
        const indent = /[^\S\n]*$/.exec(m.slice(0, x.index!))?.[0] ?? '';
        out.push({ start: close + 1, end: close + 1, text: `\n${indent}println(${x[1]})`, desc: `println(${x[1]}) after the loop` });
      }
      return out;
    },
  },
  {
    name: 'generic-type-argument',
    describe: 'declare a list with the wrong element type',
    edits: (c, m) => all(m, /:\s*(?:Mutable)?List<(Int|String|Double)>\s*=/).map((x) => {
      const to = ({ Int: 'String', String: 'Int', Double: 'String' } as Record<string, string>)[x[1]];
      const at = x.index! + x[0].indexOf(x[1]);
      return { start: at, end: at + x[1].length, text: to, desc: `List<${x[1]}> -> List<${to}>` };
    }),
  },
  {
    name: 'call-without-parentheses',
    describe: 'call a method without its parentheses',
    edits: (c, m) => all(m, /\.(uppercase|lowercase|trim|reversed|sorted|toInt|toDouble|toString|isEmpty|first|last|size\b)\(\)/).filter((x) => x[1] !== 'size').map((x) => del(x.index! + x[0].length - 2, x.index! + x[0].length, `.${x[1]}() -> .${x[1]}`)),
  },
  { name: 'remove-open', describe: 'forget open on a class or member', edits: (c, m) => all(m, /\bopen\s+(?=class|fun|val|var)/).map((x) => del(x.index!, x.index! + x[0].length, 'delete open')) },
];

/** Deterministic random numbers so a run can be repeated exactly. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function applyEdit(code: string, e: Edit): string {
  return code.slice(0, e.start) + e.text + code.slice(e.end);
}

export const lineOf = (code: string, offset: number) => code.slice(0, offset).split('\n').length;
export { maskStringsAndComments };
