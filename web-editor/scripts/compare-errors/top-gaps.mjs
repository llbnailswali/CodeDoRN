// Prints the biggest remaining gaps from outputs/real-kotlin-compare/results.json, each with the SHORTEST program that shows it, so a
// gap can be reproduced and fixed without reading the whole report. Usage: node scripts/compare-errors/top-gaps.mjs [count]
import fs from 'node:fs';
const file = new URL('../../../outputs/real-kotlin-compare/results.json', import.meta.url);
const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
const count = Number(process.argv[2] ?? 6);
const key = (r) => {
  const k = /kotlinc(?: line \d+)?: (.*?)(?: \(line \d+\))? \||\| kotlinc(?: line \d+)?: (.*)$/.exec(r.detail);
  const msg = (k?.[1] ?? k?.[2] ?? r.detail).replace(/'[^']*'/g, "'_'").replace(/\b\d+\b/g, 'N').slice(0, 80);
  return `${r.verdict} :: ${msg}`;
};
const groups = new Map();
for (const r of rows) {
  if (r.verdict === 'skipped') continue;
  const g = groups.get(key(r)) ?? [];
  g.push(r);
  groups.set(key(r), g);
}
const ranked = [...groups].sort((a, b) => b[1].length - a[1].length).slice(0, count);
for (const [k, g] of ranked) {
  const shortest = g.reduce((a, b) => (b.code.length < a.code.length ? b : a));
  console.log(`\n${g.length} x ${k}`);
  console.log(`  e.g. ${shortest.id.split('#')[0]} (${shortest.op})${shortest.mutation ? `  line ${shortest.mutation.line}: ${shortest.mutation.after.trim().slice(0, 80)}` : ''}`);
  console.log(`  ${shortest.detail.slice(0, 200)}`);
}
