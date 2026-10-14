/** "Apply fix" must respect the program's formatting: a missing } goes on its own line, indented like the block's opener. */
import assert from 'node:assert/strict';
import { suggestFix } from '../src/utils/compileFixes';

const missingBrace = (code: string) => {
  const lines = code.split('\n');
  // The compiler reports the missing closer at the end of the last non-blank line.
  let line = lines.length;
  while (line > 1 && lines[line - 1].trim() === '') line--;
  return { message: "Syntax error: Expecting '}'.", line, column: lines[line - 1].length, type: 'syntax_error' as const };
};
const fixed = (code: string) => suggestFix(code, missingBrace(code))!.code;

// Block opened at column 0: the brace goes on its own line at column 0.
assert.equal(fixed('fun main() {\n    println(1)\n'), 'fun main() {\n    println(1)\n}\n');
// The glued form `    }}` must never come back.
assert.equal(fixed('fun main() {\n    for (x in 1..2) {\n        println(x)\n    }\n'), 'fun main() {\n    for (x in 1..2) {\n        println(x)\n    }\n}\n');
// Blank lines and the user's own spacing are kept.
assert.equal(fixed('fun main() {\n    println(1)\n\n}\n'), 'fun main() {\n    println(1)\n\n}\n}\n');
// The innermost open block decides the indent.
assert.equal(fixed('fun main() {\n    if (true) {\n        println(1)\n'), 'fun main() {\n    if (true) {\n        println(1)\n    }\n');
assert.equal(fixed('class A {\n    fun f() {\n        println(1)\n'), 'class A {\n    fun f() {\n        println(1)\n    }\n');
// Braces inside strings and comments are not counted as blocks.
assert.equal(fixed('fun main() {\n    println("{")\n    // }\n'), 'fun main() {\n    println("{")\n    // }\n}\n');
// Tabs are kept as the opener's indent.
assert.equal(fixed('fun main() {\n\tif (true) {\n\t\tprintln(1)\n'), 'fun main() {\n\tif (true) {\n\t\tprintln(1)\n\t}\n');
// The brace goes at the END of the file, on the last line, even when the learner left blank lines or an indent after the last statement.
assert.equal(fixed('fun main() {\n    println(1)\n\n\n'), 'fun main() {\n    println(1)\n\n\n}\n');
assert.equal(fixed('fun main() {\n    println(1)\n    '), 'fun main() {\n    println(1)\n}');
assert.equal(fixed('fun main() {\n    println(1)   \n'), 'fun main() {\n    println(1)   \n}\n');
assert.equal(fixed('fun main() {\n    println(1)'), 'fun main() {\n    println(1)\n}');
assert.equal(fixed('fun main() {\n    if (true) {\n        println(1)\n        \n'), 'fun main() {\n    if (true) {\n        println(1)\n        \n    }\n');
// A missing ) is still inserted in place, with no other change to the text.
const paren = suggestFix('fun main() {\n    println("hi"\n}', { message: "Syntax error: Expecting ')'.", line: 2, column: 16, type: 'syntax_error' })!;
assert.equal(paren.code, 'fun main() {\n    println("hi")\n}');
// The caret lands after the inserted brace.
const f = suggestFix('fun main() {\n    println(1)\n', missingBrace('fun main() {\n    println(1)\n'))!;
assert.equal(f.code.slice(0, f.caret).endsWith('\n}'), true);

console.log('Apply-fix formatting tests pass.');
