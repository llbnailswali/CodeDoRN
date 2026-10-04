import assert from 'node:assert/strict';
import { EDITOR_INDENT, EDITOR_INDENT_SIZE, dedentLine, toEditorIndent, ensureBlankLinesAfterFirstComment, ensureBlankLineBeforeFinalBrace, snapEmptyLineIndent, indentForLine } from '../src/utils/editorLogic';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK } from '../src/data/practiceBank';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

let checks = 0;
const eq = (actual: unknown, expected: unknown, message: string) => { assert.deepEqual(actual, expected, message); checks++; };

// ---- the indent unit
eq(EDITOR_INDENT_SIZE, 2, 'the editor indents with 2 spaces');
eq(EDITOR_INDENT, '  ', 'EDITOR_INDENT is two spaces');
eq(dedentLine('    '), '  ', 'dedent removes one 2-space level');
eq(dedentLine('  '), '', 'dedent never goes negative');
eq(dedentLine(''), '', 'dedent of nothing is nothing');

// ---- a free line before the final closing brace
eq(ensureBlankLineBeforeFinalBrace('fun main() {\n  val a = 1\n}'), 'fun main() {\n  val a = 1\n\n}', 'a blank line is added before the last }');
eq(ensureBlankLineBeforeFinalBrace('fun main() {\n  val a = 1\n\n}'), 'fun main() {\n  val a = 1\n\n}', 'an existing blank line is kept, not doubled');
eq(ensureBlankLineBeforeFinalBrace('fun main() {\n  val a = 1\n}\n'), 'fun main() {\n  val a = 1\n\n}\n', 'a trailing newline after the brace is fine');
eq(ensureBlankLineBeforeFinalBrace('val a = 1\nprintln(a)'), 'val a = 1\nprintln(a)', 'code not ending in } is untouched');
eq(ensureBlankLineBeforeFinalBrace('}'), '}', 'a lone brace is untouched');
eq(loadExternalDocument('fun main() {\n    val a = 1\n}', null)?.code, 'fun main() {\n  val a = 1\n\n}', 'loading a document applies it');
eq(loadExternalDocument('fun main() {\n  val a = 1\n}', 'fun main() {\n  val a = 1\n}'), null, 'the editor\'s own emission is never touched');

// ---- tapping an empty line inside a block lands at the block's indent
const tapDoc = 'fun main() {\n  val a = 1\n\n  // 1. step:\n\n}';
eq(snapEmptyLineIndent(tapDoc, tapDoc.indexOf('\n\n  //') + 1), { code: 'fun main() {\n  val a = 1\n  \n  // 1. step:\n\n}', cursorPosition: 'fun main() {\n  val a = 1\n  '.length }, 'an empty line after a statement gets that statement\'s indent');
const afterBrace = 'fun main() {\n\n}';
eq(snapEmptyLineIndent(afterBrace, 'fun main() {\n'.length), { code: 'fun main() {\n  \n}', cursorPosition: 'fun main() {\n  '.length }, 'the first line inside a block is one level deeper than the line that opens it');
eq(snapEmptyLineIndent('val a = 1\n\nfun main() {\n}', 'val a = 1\n'.length), { code: 'val a = 1\n\nfun main() {\n}', cursorPosition: 'val a = 1\n'.length }, 'top-level empty lines stay at column 0');
eq(snapEmptyLineIndent('fun main() {\n  val a = 1\n  \n}', 'fun main() {\n  val a = 1\n  '.length).code, 'fun main() {\n  val a = 1\n  \n}', 'a line that already has spaces is never touched');
eq(snapEmptyLineIndent('fun main() {\n  val a = 1\n}', 'fun main() {\n  va'.length).code, 'fun main() {\n  val a = 1\n}', 'a line with text is never touched');
eq(indentForLine(['fun f() {', '  if (x) {', '    y()', '  }', ''], 4), '  ', 'after a closing brace the indent is that brace\'s own');
eq(loadExternalDocument('fun main() {\n  val a = 1\n\n  // 1. step:\n\n}', null)?.code, 'fun main() {\n  val a = 1\n\n  // 1. step:\n  \n}', 'the load puts the caret on an indented blank line under the first hint');

// ---- converting 4-space starters
eq(toEditorIndent('fun main() {\n    val a = 1\n    if (a > 0) {\n        println(a)\n    }\n}'),
  'fun main() {\n  val a = 1\n  if (a > 0) {\n    println(a)\n  }\n}', '4-space code becomes 2-space, per level');
eq(toEditorIndent('fun main() {\n    // 1. step:\n\n    // 2. step:\n}'), 'fun main() {\n  // 1. step:\n\n  // 2. step:\n}', 'comments and blank lines follow the same rule');
const twoSpace = 'fun main() {\n  val a = 1\n  if (a > 0) {\n    println(a)\n  }\n}';
eq(toEditorIndent(twoSpace), twoSpace, 'code that is already 2-space is left alone');
const once = toEditorIndent('fun main() {\n    val a = 1\n}');
eq(toEditorIndent(once), once, 'applying it twice changes nothing');
eq(toEditorIndent('fun main() {\n      val a = 1\n}'), 'fun main() {\n      val a = 1\n}', 'an indent that is not a multiple of 4 leaves the whole program untouched');
eq(toEditorIndent('fun main() {\n\tval a = 1\n\t\tprintln(a)\n}'), 'fun main() {\n  val a = 1\n    println(a)\n}', 'leading tabs become one 2-space level each');
eq(toEditorIndent('fun main() {\r\n    val a = 1\r\n}'), 'fun main() {\n  val a = 1\n}', 'CRLF is normalised');
eq(toEditorIndent('val a = 1\nval b = 2'), 'val a = 1\nval b = 2', 'unindented code is untouched');
// raw-string interior is data, not formatting
const raw = 'fun main() {\n    val s = """\n        Item\n          Qty\n    """\n    println(s)\n}';
eq(toEditorIndent(raw), 'fun main() {\n  val s = """\n        Item\n          Qty\n    """\n  println(s)\n}', 'lines inside a triple-quoted string, including the one holding the closing quotes, keep their spaces');


// ---- the editor owns the conversion, and only for text handed in from outside
import { loadExternalDocument } from '../src/utils/editorLogic';
const starter = 'fun main() {\n    val hoursWorked = 39\n    val hourlyRate = 17.5\n    val regularHours = 35\n\n    // 1. Compute overtimeHours:\n\n    // 2. Print it:\n}';
const converted = 'fun main() {\n  val hoursWorked = 39\n  val hourlyRate = 17.5\n  val regularHours = 35\n\n  // 1. Compute overtimeHours:\n\n  // 2. Print it:\n}';
const first = loadExternalDocument(starter, null);
const base = ensureBlankLinesAfterFirstComment(converted);
const loadedStarter = snapEmptyLineIndent(ensureBlankLineBeforeFinalBrace(base.code), base.cursorPosition).code; // blank line under the first hint (caret there, indented) + a free line before the last }
eq(first?.code, loadedStarter, 'first mount: the 4-space starter is loaded as 2-space');
eq(first !== null && first.cursorPosition > 0 && first.code.slice(first.code.lastIndexOf('\n', first.cursorPosition - 1) + 1, first.cursorPosition).trim() === '', true, 'first mount: the caret sits on a blank (indented) line under the first hint');
// the editor emits its converted text and the parent echoes it back
eq(loadExternalDocument(loadedStarter, loadedStarter), null, 'the parent echoing the editor\'s own converted text changes nothing');
// THE RACE: a parent effect then overwrites the code with the raw 4-space starter
eq(loadExternalDocument(starter, loadedStarter)?.code, loadedStarter, 'a parent re-applying the raw 4-space starter after mount is converted again');
// learner typing: their code is never re-indented, even when every indent happens to be a multiple of 4
const typed = 'fun main() {\n  if (true) {\n    println(1)\n  }\n}\n// typed only at depth 2\nval x = 1\n    val y = 2';
eq(loadExternalDocument(typed, typed), null, 'the learner\'s own edits are left exactly as typed');
const deepOnly = 'fun main() {\n    println(1)\n}';
eq(loadExternalDocument(deepOnly, deepOnly), null, 'even code that would look like a 4-space starter is not converted once it is the editor\'s own text');
eq(loadExternalDocument('', null)?.code, '', 'an empty document loads as empty');
eq(loadExternalDocument(starter, starter)?.code === undefined, true, 'text identical to the last emitted text is not reloaded');

// ---- re-indenting never changes what a program prints
let programs = 0;
for (const problems of [...Object.values(PRACTICE_WRITE_RUN_BANK), ...Object.values(PRACTICE_DEBUG_BANK)]) {
  for (const p of problems as any[]) {
    const sources: Array<[string, string]> = 'solutionCode' in p
      ? [['solution', p.solutionCode]]
      : [['broken', p.brokenCode], ['fixed', p.fixedCode]];
    for (const [label, source] of sources) {
      const before = await compileAndRunKotlin(source);
      const after = await compileAndRunKotlin(toEditorIndent(source));
      eq([after.success, after.output], [before.success, before.output], `${p.id} (${label}): output identical after re-indenting`);
      programs++;
    }
    if ('initialCode' in p) {
      eq(toEditorIndent(toEditorIndent(p.initialCode)), toEditorIndent(p.initialCode), `${p.id}: starter re-indent is idempotent`);
      const comments = (code: string) => (code.match(/^\s*\/\/.*$/gm) ?? []).map((c) => c.trim());
      eq(comments(toEditorIndent(p.initialCode)), comments(p.initialCode), `${p.id}: starter comments survive the re-indent`);
    }
  }
}
console.log(`Editor indent: ${checks} checks passed (${programs} programs compared before/after).`);
