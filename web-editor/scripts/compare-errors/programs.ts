/**
 * The programs the comparison runs: the authored Debug `brokenCode` programs, plus mutants (every valid reference program with ONE
 * mistake injected by a rule in mutations.ts). Shared by run.ts and other scripts that need the exact same, seeded set.
 */
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../../src/data/lessonStagesData';
import { PRACTICE_DEBUG_BANK, PRACTICE_WRITE_RUN_BANK } from '../../src/data/practiceBank';
import { OPERATORS, applyEdit, lineOf, maskStringsAndComments, rng } from './mutations';

export interface Program { id: string; op: string; code: string; baseId: string; world: number; mutation?: { line: number; desc: string; before: string; after: string } }

export function worldOf(id: string): number {
  const m = /world-(\d+)/.exec(id);
  return m ? Number(m[1]) : 0;
}

export function collect(worlds: number[] = []) {
  const valid: { id: string; code: string }[] = [];
  const broken: { id: string; code: string }[] = [];
  const add = (list: { id: string; code: string }[], id: string, code?: string) => { if (code && /\bfun\s+main\s*\(/.test(code)) list.push({ id, code }); };
  for (const lesson of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
    add(valid, `${lesson.id}:solution`, lesson.writeRun?.solutionCode);
    add(valid, `${lesson.id}:fixed`, lesson.debug?.fixedCode);
    add(broken, `${lesson.id}:broken`, lesson.debug?.brokenCode);
  }
  for (const list of Object.values(PRACTICE_WRITE_RUN_BANK)) for (const p of list) add(valid, `${p.id}:solution`, p.solutionCode);
  for (const list of Object.values(PRACTICE_DEBUG_BANK)) for (const p of list) { add(valid, `${p.id}:fixed`, p.fixedCode); add(broken, `${p.id}:broken`, p.brokenCode); }
  const keep = (x: { id: string }) => !worlds.length || worlds.includes(worldOf(x.id));
  return { valid: valid.filter(keep), broken: broken.filter(keep) };
}

export function buildPrograms(opts: { seed: number; perOp: number; genericPerOp: number; worlds?: number[] }): Program[] {
  const { valid, broken } = collect(opts.worlds);
  const programs: Program[] = broken.map((b) => ({ id: b.id, op: 'authored-broken', code: b.code, baseId: b.id, world: worldOf(b.id) }));
  const random = rng(opts.seed);
  for (const op of OPERATORS) {
    const candidates: Program[] = [];
    for (const base of valid) {
      const masked = maskStringsAndComments(base.code);
      const edits = op.edits(base.code, masked);
      // up to 2 sites per program (4 for the generic operators), chosen by the seeded generator
      for (let n = 0; n < Math.min(op.generic ? 4 : 2, edits.length); n++) {
        const e = edits.splice(Math.floor(random() * edits.length), 1)[0];
        const code = applyEdit(base.code, e);
        if (code === base.code) continue;
        const line = lineOf(base.code, e.start);
        candidates.push({ id: `${base.id}#${op.name}#${candidates.length}`, op: op.name, code, baseId: base.id, world: worldOf(base.id), mutation: { line, desc: e.desc, before: base.code.split('\n')[line - 1] ?? '', after: code.split('\n')[line - 1] ?? '' } });
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    const seen = new Set<string>();
    for (const c of candidates) { if (seen.has(c.code)) continue; seen.add(c.code); programs.push(c); if (seen.size >= (op.generic ? opts.genericPerOp : opts.perOp)) break; }
  }
  return programs;
}
