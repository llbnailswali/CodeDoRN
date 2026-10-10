// Every character of every practice-bank code field must survive the shared highlighter (PITFALLS.md: a character with no tokenizer
// alternative silently vanishes from the render). Also pins the cases that broke: `("a@x.com")`, `%`, `$name`, `"\"\""`.
import { renderKotlinCodeLines } from '../src/utils/codeHighlighter';
import * as bank from '../src/data/practiceBank';
const text = (n: any): string => n == null || typeof n === 'boolean' ? '' : typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : text(n.props?.children);
const codes: string[] = [];
const KEYS = new Set(['initialCode', 'solutionCode', 'brokenCode', 'fixedCode']);
const walk = (o: any, depth = 0) => { if (depth > 6 || o == null || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach((x) => walk(x, depth + 1)); return; } for (const [k, v] of Object.entries(o)) { if (KEYS.has(k) && typeof v === 'string') codes.push(v); else walk(v, depth + 1); } };
walk(bank);
let bad = 0;
for (const c of codes) { const lines = c.split('\n'); const got = renderKotlinCodeLines(lines, { isDark: true }).map(text); lines.forEach((l, i) => { if ((got[i] ?? '').replace(/\u00a0/g, ' ') !== (l === '' ? ' ' : l)) { if (bad++ < 8) console.log('LOST', JSON.stringify(l), '->', JSON.stringify(got[i])); } }); }
const probes = ['val u1 = User("A", "a@x.com")', 'f("a@x.com")', 'val r = a % b', 'println("T: $total")', 'return@forEach', '@Test fun t() {}'];
for (const l of probes) { const got = renderKotlinCodeLines([l], { isDark: true }).map(text)[0]; if (got !== l) { bad++; console.log('LOST', JSON.stringify(l), '->', JSON.stringify(got)); } }
console.log(codes.length, 'code blocks,', bad, 'lines differ');
process.exit(bad ? 1 : 0);
