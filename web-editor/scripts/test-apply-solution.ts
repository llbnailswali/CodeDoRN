/**
 * "Auto-Complete" (applySolutionPreservingComments) must keep every starter comment, in order, directly above the
 * solution lines that answer it, without changing the program. Verified over EVERY Write & Run task (lessons + the
 * practice bank) and every Debug task:
 *   1. the merged program, with comments and blank lines removed, is exactly the solution's code;
 *   2. every starter comment is present exactly once and in the original order;
 *   3. the merged program runs to the same output as the solution.
 * It also reports how many comments ended up with no code under them (only legitimate when the solution has fewer code
 * lines than the starter has comments).
 */
import assert from 'node:assert/strict';
import { applySolutionPreservingComments } from '../src/utils/applySolution';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK } from '../src/data/practiceBank';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';

const code = (s: string) => s.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
const comments = (s: string) => s.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('//'));

type Task = { id: string; starter: string; solution: string };
const tasks: Task[] = [];
for (const list of Object.values(PRACTICE_WRITE_RUN_BANK) as any[][]) for (const t of list) tasks.push({ id: t.id, starter: t.initialCode, solution: t.solutionCode });
for (const list of Object.values(PRACTICE_DEBUG_BANK) as any[][]) for (const t of list) tasks.push({ id: t.id, starter: t.brokenCode, solution: t.fixedCode });
for (const lesson of Object.values(AVAILABLE_FIVE_STAGE_LESSONS) as any[]) {
  if (lesson?.writeRun?.initialCode && lesson.writeRun.solutionCode) tasks.push({ id: lesson.id + ':writeRun', starter: lesson.writeRun.initialCode, solution: lesson.writeRun.solutionCode });
  if (lesson?.debug?.brokenCode && lesson.debug.fixedCode) tasks.push({ id: lesson.id + ':debug', starter: lesson.debug.brokenCode, solution: lesson.debug.fixedCode });
}

let checked = 0;
let withComments = 0;
let emptyAfter = 0;
let fellBack = 0;
const problems: string[] = [];
for (const t of tasks) {
  const merged = applySolutionPreservingComments(t.starter, t.solution);
  checked++;
  const expectedComments = comments(t.starter).filter((c) => !t.solution.includes(c));
  if (!expectedComments.length) continue;
  withComments++;
  try {
    assert.deepEqual(code(merged), code(t.solution), 'code differs from the solution');
    const got = comments(merged).filter((c) => expectedComments.includes(c));
    assert.deepEqual(got, expectedComments, 'comments missing, duplicated or reordered');
    // a comment with no code under it (next non-blank line is another comment or the closing brace)
    const lines = merged.split('\n');
    lines.forEach((l, i) => {
      if (!expectedComments.includes(l.trim())) return;
      // a comment BLOCK ends where its plain `//` continuation lines end; what follows must be code, not a closing brace
      const next = lines.slice(i + 1).find((x) => x.trim() !== '' && !x.trim().startsWith('//'));
      const nextLine = lines.slice(i + 1).find((x) => x.trim() !== '');
      const continues = nextLine !== undefined && nextLine.trim().startsWith('//') && !/^\s*\/\/\s*(TODO\b|\d+[.):])/.test(nextLine);
      if (continues) return; // the block's last line is judged, not its first
      if (!next || /^\s*\}\s*$/.test(next)) emptyAfter++;
      else if (nextLine !== undefined && nextLine.trim().startsWith('//') && expectedComments.includes(nextLine.trim())) emptyAfter++; // two steps stacked above the same code
    });
    if (/^\s*fun main\(\)[^\n]*\{\n\s*\/\//.test(merged) && comments(merged).length > 2 && expectedComments.length === comments(merged).length) {
      // heuristic: all comments piled right after the opening brace == the old fallback
      const afterBrace = lines.slice(1).findIndex((x) => x.trim() && !x.trim().startsWith('//'));
      if (afterBrace >= expectedComments.length) fellBack++;
    }
  } catch (e) {
    problems.push(`${t.id}: ${(e as Error).message}`);
  }
}

// behaviour: the merged program runs like the solution (compare outputs on a sample incl. every world's tasks)
let ran = 0;
for (const t of tasks) {
  const expectedComments = comments(t.starter).filter((c) => !t.solution.includes(c));
  if (!expectedComments.length) continue;
  const merged = applySolutionPreservingComments(t.starter, t.solution);
  const a = await compileAndRunKotlin(t.solution);
  const b = await compileAndRunKotlin(merged);
  ran++;
  if (a.success !== b.success || (a.output ?? '') !== (b.output ?? '')) problems.push(`${t.id}: merged program behaves differently from the solution`);
}

console.log(`tasks: ${checked}, with comments: ${withComments}, ran: ${ran}, comments left with no code under them: ${emptyAfter}, looks like old top-of-main fallback: ${fellBack}`);
if (problems.length) {
  problems.slice(0, 25).forEach((p) => console.log('  PROBLEM', p));
  process.exit(1);
}
console.log('Auto-Complete comment placement: every task keeps its code and its comment order, and runs the same.');
