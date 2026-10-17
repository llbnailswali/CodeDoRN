/** Runs every World 13 practice solution (base and swapped), Debug fixed code and Debug broken code through real kotlinc. */
import { runRealKotlin } from '../minikotlin/real-kotlin';
import { WR_SPECS, DBG_SPECS } from './world13.spec';

const cases: { id: string; code: string }[] = [];
const swapped = (code: string, s: { variableName: string; originalLiteral: string; alternateLiteral: string }) =>
  code.replace(new RegExp(`(val|var)\\s+${s.variableName}\\b([^=\\n]*=\\s*)${s.originalLiteral}`), `$1 ${s.variableName}$2${s.alternateLiteral}`);
for (const t of WR_SPECS) {
  cases.push({ id: `${t.id}::base`, code: t.solution });
  cases.push({ id: `${t.id}::swap`, code: swapped(t.solution, t.swap) });
}
for (const d of DBG_SPECS) {
  cases.push({ id: `${d.id}::fixed`, code: d.fixed });
  cases.push({ id: `${d.id}::broken`, code: d.broken });
}
const r = await runRealKotlin(cases);
let bad = 0;
const out = (id: string) => r.get(id) as any;
for (const t of WR_SPECS) {
  for (const [kind, want] of [['base', t.expected], ['swap', t.swap.alternateExpected]] as const) {
    const a = out(`${t.id}::${kind}`);
    if (a.stage !== 'ok' || a.output.trim() !== want) { bad++; console.log('MISMATCH', t.id, kind, a.stage, JSON.stringify(a.output?.trim() ?? a.errors?.slice(0, 2)), 'want', JSON.stringify(want)); }
  }
}
for (const d of DBG_SPECS) {
  const f = out(`${d.id}::fixed`);
  if (f.stage !== 'ok' || f.output.trim() !== d.expected) { bad++; console.log('FIXED MISMATCH', d.id, f.stage, JSON.stringify(f.output?.trim() ?? f.errors?.slice(0, 2))); }
  const b = out(`${d.id}::broken`);
  console.log('broken', d.id.padEnd(18), b.stage, JSON.stringify((b.output ?? b.errors?.[0] ?? '').toString().trim()).slice(0, 110));
}
console.log('cases', cases.length, 'problems', bad);
