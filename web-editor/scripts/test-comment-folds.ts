import assert from 'node:assert/strict';
import { computeCommentFolds, moveCaretByVisibleLines } from '../src/utils/editorLogic';

let checks = 0;
const eq = (actual: unknown, expected: unknown, message: string) => { assert.deepEqual(actual, expected, message); checks++; };

// ---- which comments fold
const code = [
  'fun main() {',                                                                             // 0
  '    val x = 1',                                                                            // 1
  '',                                                                                         // 2
  '    // 1. Compute overtimePay (overtime hours at one and a half times hourlyRate):',       // 3 long single line
  '',                                                                                         // 4
  '    // 2. Print it:',                                                                      // 5 short single line
  '',                                                                                         // 6
  '    // 3. fun total(price: Int, qty: Int = 1): Int',                                       // 7 block start (short-ish first line)
  '    //    subtotal = price * qty, minus the discount, plus shipping:',                    // 8 continuation
  '    //    round down at the end',                                                          // 9 continuation
  '',                                                                                         // 10
  '    // a note written by the learner that is long enough to ignore for sure',             // 11 not a helper
  '    // 4. Print all of it with string templates and a label:',                             // 12 new step right after a plain comment
  '}',
];
const folds = computeCommentFolds(code);
eq(folds.map(f => [f.start, f.end]), [[3, 3], [5, 5], [7, 9], [12, 12]], 'every numbered hint folds (single line or block); the learner\'s own plain comment is left alone');
eq(folds.map(f => f.preview), ['    // 1.', '    // 2.', '    // 3.', '    // 4.'], 'collapsed, only the marker shows (indentation kept)');
eq(folds.every(f => code[f.start].startsWith(f.preview)), true, 'the preview is a true prefix of the line (caret columns line up)');
eq(new Set(folds.map(f => f.key)).size, folds.length, 'fold keys are unique');
const dup = computeCommentFolds(['// 1. same long hint text that repeats here', '', '// 1. same long hint text that repeats here']);
eq(dup.length === 2 && dup[0].key !== dup[1].key, true, 'identical comments get distinct keys');
eq(computeCommentFolds(['// 1. just three words'])[0].preview, '// 1.', 'a short hint also folds to its marker');
eq(computeCommentFolds(['// 1.']).length, 0, 'a bare marker has nothing to hide');
eq(computeCommentFolds(['// 1.', '//    continues below']).length, 1, 'a bare marker with a continuation line folds');
eq(computeCommentFolds(['// TODO: implement the whole function body'])[0].preview, '// TODO', 'TODO comments fold to "// TODO"');
eq(computeCommentFolds(['x // 1. trailing comment with lots and lots of words in it here']).length, 0, 'a trailing (not whole-line) comment is ignored');
eq(computeCommentFolds(['// 2) parenthesis style step marker text'])[0].preview, '// 2)', 'the "2)" numbering style works too');

// ---- caret movement treats a collapsed block as ONE line
const text = code.join('\n');
const offsets: number[] = []; { let o = 0; for (const l of code) { offsets.push(o); o += l.length + 1; } }
const hidden = new Set([8, 9]); // the collapsed block 7..9 hides lines 8 and 9
const line = (caret: number) => { let found = 0; offsets.forEach((o, i) => { if (o <= caret) found = i; }); return found; };
eq(line(moveCaretByVisibleLines(text, offsets[6], 1, hidden)), 7, 'down from the blank line above lands on the fold row');
eq(line(moveCaretByVisibleLines(text, offsets[7], 1, hidden)), 10, 'down from the fold row skips its hidden lines');
eq(line(moveCaretByVisibleLines(text, offsets[10], -1, hidden)), 7, 'up from below the fold lands on the fold row, not inside it');
eq(line(moveCaretByVisibleLines(text, offsets[6], 2, hidden)), 10, 'a 2-line swipe crosses the fold as one line');
eq(line(moveCaretByVisibleLines(text, offsets[10], -2, hidden)), 6, 'two lines up from below the fold reaches the line above it');
eq(line(moveCaretByVisibleLines(text, offsets[6], 2, new Set())), 8, 'with nothing collapsed the same swipe goes through the block');
eq(moveCaretByVisibleLines(text, offsets[0] + 3, -1, hidden), 0, 'up from the first line goes to the start');
eq(moveCaretByVisibleLines(text, text.length - 1, 1, hidden), text.length, 'down from the last line goes to the end');
// the column on a collapsed fold row is capped to its visible preview
const capped = moveCaretByVisibleLines(text, offsets[6] + 0, 1, hidden);
const colOnFold = moveCaretByVisibleLines(text, offsets[5] + 10, 2, hidden, (l) => (l === 7 ? 12 : undefined));
eq(colOnFold - offsets[7], 10, 'column is kept when it fits inside the preview');
const colTooFar = moveCaretByVisibleLines(text, offsets[5] + 16, 2, hidden, (l) => (l === 7 ? 12 : undefined));
eq(colTooFar - offsets[7], 12, 'column is capped at the end of the preview on a collapsed row');
void capped;


// ---- the caret never enters hidden text, and never opens a fold
import { snapCaretOutOfFolds } from '../src/utils/editorLogic';
const collapsed = [{ start: 7, end: 9, previewLength: 10 }]; // "    // 3." is 10 characters
const hiddenMid = offsets[8] + 5;
eq(snapCaretOutOfFolds(text, hiddenMid, collapsed, 1) , offsets[10], 'moving forward out of a hidden line jumps to the line after the block');
eq(snapCaretOutOfFolds(text, hiddenMid, collapsed, -1), offsets[7] + 10, 'moving backward out of a hidden line lands at the end of the visible marker');
eq(snapCaretOutOfFolds(text, hiddenMid, collapsed, 0), offsets[7] + 10, 'with no direction the caret goes to the visible marker');
eq(snapCaretOutOfFolds(text, offsets[7] + 10, collapsed, 1), offsets[7] + 10, 'the end of the visible marker is a legal caret spot');
eq(snapCaretOutOfFolds(text, offsets[7] + 11, collapsed, 1), offsets[10], 'one step right of the marker crosses the whole block');
eq(snapCaretOutOfFolds(text, offsets[10], collapsed, -1), offsets[10], 'the line below the block is untouched');
eq(snapCaretOutOfFolds(text, offsets[10] - 1, collapsed, -1), offsets[7] + 10, 'stepping left from the line below lands on the collapsed row, not inside it');
eq(snapCaretOutOfFolds(text, hiddenMid, [], 1), hiddenMid, 'nothing collapsed, nothing moves');
eq(snapCaretOutOfFolds('a\n// 1. x\n//  y', 'a\n// 1. x\n//  y'.length, [{ start: 1, end: 2, previewLength: 5 }], 1), 'a\n// 1. x\n//  y'.length, 'a block at the very end of the code snaps forward to the end of the code');


// ---- the collapsed row reads "// TODO 1."
import { foldPreviewDisplay } from '../src/utils/editorLogic';
eq(foldPreviewDisplay('    // 1.').text, '    // TODO 1.', 'a numbered hint displays as "// TODO 1." (indentation kept)');
eq(foldPreviewDisplay('// 2)').text, '// TODO 2)', 'the "2)" numbering style works too');
eq(foldPreviewDisplay('// TODO').text, '// TODO', 'a hint that already says TODO is shown as written');
eq(foldPreviewDisplay('//1.').text, '// TODO 1.', 'a missing space after the slashes is normalised');
const shown = foldPreviewDisplay('    // 1.');
eq([shown.column(0), shown.column(4), shown.column(7), shown.column(9)], [0, 4, 12, 14], 'caret columns map onto the displayed text (before the marker, at it, inside, at the end)');
eq(foldPreviewDisplay('// TODO').column(5), 5, 'no mapping is needed when nothing was inserted');

console.log(`Comment folding: ${checks} checks passed.`);

// ---- editing an open comment's words must not change its identity (it would collapse while typed in)
{
  const before = computeCommentFolds(['fun main() {', '  // 1. Print the total:', '  // 2. Print the name:', '}']);
  const after = computeCommentFolds(['fun main() {', '  // 1. Print the total and the tax too:', '  // 2. Print the name:', '}']);
  assert.deepEqual(after.map((f) => f.key), before.map((f) => f.key), 'editing a comment body keeps every fold key');
  assert.equal(new Set(before.map((f) => f.key)).size, before.length, 'keys stay unique');
  const twins = computeCommentFolds(['  // TODO first', '', '  // TODO second']);
  assert.equal(new Set(twins.map((f) => f.key)).size, 2, 'two TODO comments still get different keys');
  console.log('Fold identity: 3 more checks passed.');
}
