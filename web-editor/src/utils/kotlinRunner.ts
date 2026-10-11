import { checkClassMemberRules } from './kotlinClassChecks';
import { prepareKotlinSource, scanKotlin, KotlinSourceError, NESTED_QUOTE } from './kotlinSource';
import { hoistNestedDeclarations } from './kotlinNestedClasses';
import { KotlinIndexedValue, KotlinList, KotlinMapEntry, KotlinPair, KotlinRange, KotlinSequence, makeRange, outOfBounds } from './kotlinCollections';
import { installKotlinMath, installKotlinStdlib, javaDoubleToString, makeStructural } from './kotlinStdlib';
import { lowerKotlinFunctions, KotlinFunctionError } from './kotlinFunctions';
import { maskStringsAndComments } from './errorSpan';
import { checkStructureRules } from './kotlinStructureChecks';
import { checkKotlinSyntax, ensureKotlinSyntax } from './kotlinSyntaxCheck';
import { insertLineMarkers, expressionBodyLines, wrapFunctionsForLines, braceSingleStatementLoops } from './kotlinLineMarkers';
import {
  kotlinAsync,
  KotlinCoroutineStart,
  kotlinDelay,
  kotlinEnsureActive,
  kotlinYield,
  kotlinWithContext,
  KotlinMutex,
  KotlinAtomicNumber,
  kotlinJoinAll,
  kotlinAwaitAll,
  kotlinCoroutineContext,
  kotlinCoroutineName,
  kotlinCoroutineExceptionHandler,
  kotlinCoroutineScope,
  kotlinSupervisorScope,
  KotlinCoroutineNameKey,
  KotlinDispatchers,
  KotlinJobKey,
  kotlinLaunch,
  kotlinRunBlocking,
  kotlinGlobalScopeLaunch,
  prepareCoroutineSource,
} from './kotlinCoroutines';
import {
  Throwable, Exception, RuntimeException, IllegalStateException, IllegalArgumentException,
  NumberFormatException, IndexOutOfBoundsException, ArithmeticException, NoSuchElementException,
  UnsupportedOperationException, ClassCastException, CancellationException, KotlinResult, kotlinRunCatching,
  NullPointerException, ArrayIndexOutOfBoundsException, StringIndexOutOfBoundsException, NotImplementedError, AssertionError,
} from './kotlinExceptions';

const BUILTIN_EXCEPTION_NAMES = [
  'Throwable', 'Exception', 'RuntimeException', 'IllegalStateException', 'IllegalArgumentException',
  'NumberFormatException', 'IndexOutOfBoundsException', 'ArithmeticException', 'NoSuchElementException',
  'UnsupportedOperationException', 'ClassCastException', 'CancellationException',
  'NullPointerException', 'ArrayIndexOutOfBoundsException', 'StringIndexOutOfBoundsException', 'NotImplementedError', 'AssertionError',
];

/**
 * Kotlin In-Browser Compilation & Execution Engine
 * Evaluates Kotlin code safely, enforces val immutability, type constraints,
 * syntax validity, captures stdout (println/print), and produces structured diagnostics.
 */

export interface KotlinDiagnostic {
  message: string;
  line: number;
  column?: number;
  /** The offending token's text and which same-text token on `line` it is (0-based); the editor underlines it. */
  token?: string;
  occurrence?: number;
  /** True when `line` is only a placeholder (the engine could not locate the problem), so nothing should be highlighted. */
  unlocated?: boolean;
  type: 'syntax_error' | 'compiler_error' | 'type_mismatch' | 'val_reassignment' | 'unresolved_reference' | 'runtime_error' | 'hardcoded_output';
  codeSnippet?: string;
}

export interface KotlinExecutionResult {
  success: boolean;
  output: string;
  logs: string[];
  returnValue?: any;
  error?: KotlinDiagnostic;
  executionTimeMs: number;
  exitCode: number;
}

interface VarDeclaration {
  name: string;
  isVal: boolean;
  type?: string;
  line: number;
  /** True for `val xs = mutableListOf(...)` (or MutableSet/MutableMap/etc.) -- `xs += x` there is legal Kotlin (resolves to the collection's own `plusAssign`, not a reassignment of `xs` itself), unlike every other `val`. */
  isMutableCollectionRef?: boolean;
}

const MUTABLE_COLLECTION_INITIALIZER = /^(?:mutableListOf|mutableSetOf|mutableMapOf|ArrayList|HashSet|HashMap|LinkedHashSet|LinkedHashMap)\s*[(<]/;
const MUTABLE_COLLECTION_TYPE = /^Mutable(?:List|Set|Map)\s*</;

/**
 * World 15: Kotlin classes are final (non-inheritable) by default -- only
 * `open`/`abstract`/`sealed` classes may be subclassed. This engine had no
 * such check at all (see PITFALLS.md's "Debug exercises: the bug must be
 * reproducible" entry): a `class Parent(...)` (no `open`) subclassed by
 * `class Child : Parent(...)` previously transpiled and ran successfully
 * either way, making a `bugType: 'type'` debug exercise built around
 * exactly this mistake (World 15's Custom Exceptions lesson) auto-"pass"
 * with zero edits, since broken and fixed code produced identical output.
 * Scoped narrowly to classes DECLARED IN THIS SAME SOURCE -- a built-in
 * exception class like `Exception`/`RuntimeException` (see
 * kotlinExceptions.ts) is never flagged, since it is real Kotlin's own
 * open type and this simulator has no source text for it to check a
 * modifier against.
 */
function checkFinalClassInheritance(code: string): KotlinDiagnostic | null {
  const declaredOpen = new Map<string, boolean>();
  for (const line of code.split('\n')) {
    const m = line.match(/^(.*?)\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (!m) continue;
    const [, prefix, name] = m;
    const isOpen = /\b(open|abstract|sealed)\b/.test(prefix);
    declaredOpen.set(name, isOpen);
  }
  const superRe = /\bclass\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*<[^>{}]+>)?\s*(?:\([^)]*\))?\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = superRe.exec(code)) !== null) {
    const parentName = match[1];
    if (declaredOpen.get(parentName) === false) {
      const line = code.slice(0, match.index).split('\n').length;
      return { message: `Compilation error: '${parentName}' is final, so it cannot be inherited from -- mark it 'open' (or 'abstract'/'sealed') to allow subclassing`, line, type: 'compiler_error' };
    }
  }
  return null;
}

/**
 * Grading is a literal string comparison against `expectedOutput` (see the
 * end of `compileAndRunKotlin`), which a learner can trivially satisfy by
 * deleting all real logic and printing the expected text back verbatim --
 * `println("Austin: 68F, Raining: false")` passes exactly like a correct
 * solution. This is a static, source-only check that catches exactly that:
 * it reconstructs what stdout WOULD be if every `print`/`println` call in
 * the file only ever printed literal, constant text (string/char/number
 * literals and `true`/`false`/`null`, joined by `+`, with no interpolated
 * `$name`/`${...}` and no other identifier or call anywhere in the
 * argument), and flags the code only when that all-literal reconstruction
 * equals `expectedOutput` exactly. The moment a single output call touches
 * any variable, parameter, or function call, this bails out silently (never
 * flags real solutions) -- it only ever catches the "print the answer back"
 * case, not partial credit or disguised laundering through a variable
 * (`val s = "..."; println(s)`), which needs input-variation testing to
 * catch instead (see PITFALLS.md-adjacent design notes for that mechanism).
 */
function detectHardcodedOutput(code: string, expectedOutput: string): KotlinDiagnostic | null {
  if (!expectedOutput) return null;

  let tokens;
  try { tokens = scanKotlin(code); } catch { return null; }

  const literalWords = new Set(['true', 'false', 'null']);

  // Mirrors the real runtime's print()/println() stdout model (see
  // `appendOutput`/`lineOpen` further down in this file) so the
  // reconstructed text lines up the same way real output would.
  const stdout: string[] = [];
  let lineOpen = false;
  const appendOutput = (text: string) => {
    if (lineOpen && stdout.length > 0) stdout[stdout.length - 1] += text;
    else stdout.push(text);
  };

  // Returns the literal's decoded text, or null if it contains string
  // interpolation (a reference to a variable/expression, i.e. not a
  // constant).
  const decodeLiteral = (raw: string): string | null => {
    const isTriple = raw.startsWith('"""');
    const inner = isTriple ? raw.slice(3, -3) : raw.slice(1, -1);
    let out = '';
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (!isTriple && ch === '\\') {
        const next = inner[i + 1];
        // `prepareKotlinSource` (run before this check, at the top of
        // `compileAndRunKotlin`) escapes every `/` inside a string/char
        // literal into `/` -- a real Kotlin literal never has this
        // escape verbatim, but by the time this function sees the source,
        // an ordinary `/` the learner typed already looks like one.
        // Without decoding it back, reconstruction silently diverges from
        // the real output and this check falls through as a false negative.
        if (next === 'u' && /^[0-9a-fA-F]{4}/.test(inner.slice(i + 2, i + 6))) {
          out += String.fromCharCode(parseInt(inner.slice(i + 2, i + 6), 16));
          i += 5; continue;
        }
        const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', '"': '"', "'": "'", '\\': '\\', $: '$' };
        if (next in map) { out += map[next]; i++; continue; }
        out += next ?? ''; i++; continue;
      }
      if (ch === '$' && (inner[i + 1] === '{' || /[A-Za-z_]/.test(inner[i + 1] || ''))) return null;
      out += ch;
    }
    return out;
  };

  let sawOutputCall = false;
  let sawDynamicCall = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || (t.text !== 'print' && t.text !== 'println')) continue;
    let j = i + 1;
    while (j < tokens.length && tokens[j].kind === 'comment') j++;
    if (j >= tokens.length || !(tokens[j].kind === 'symbol' && tokens[j].text === '(')) continue;

    let depth = 1;
    let k = j + 1;
    const argTokens: typeof tokens = [];
    while (k < tokens.length && depth > 0) {
      const tok = tokens[k];
      if (tok.kind === 'symbol' && tok.text === '(') depth++;
      else if (tok.kind === 'symbol' && tok.text === ')') { depth--; if (depth === 0) break; }
      if (depth > 0) argTokens.push(tok);
      k++;
    }

    sawOutputCall = true;
    const isPrintln = t.text === 'println';
    let value = '';
    let dynamic = false;
    for (const tok of argTokens) {
      if (tok.kind === 'comment') continue;
      if (tok.kind === 'symbol') { if (tok.text === '+' || tok.text === '(' || tok.text === ')') continue; dynamic = true; break; }
      if (tok.kind === 'number') { value += tok.text.replace(/_/g, '').replace(/[fFL]$/, ''); continue; }
      if (tok.kind === 'string' || tok.kind === 'char') {
        const decoded = decodeLiteral(tok.text);
        if (decoded === null) { dynamic = true; break; }
        value += decoded; continue;
      }
      if (tok.kind === 'word' && literalWords.has(tok.text)) { value += tok.text; continue; }
      dynamic = true; break;
    }

    if (dynamic) { sawDynamicCall = true; i = k; continue; }
    appendOutput(value);
    lineOpen = !isPrintln;
    i = k;
  }

  if (!sawOutputCall || sawDynamicCall) return null;

  const reconstructed = stdout.join('\n').trim().replace(/\r\n/g, '\n');
  const normExpected = expectedOutput.trim().replace(/\r\n/g, '\n');
  if (reconstructed !== normExpected) return null;

  return {
    message: "Buddy, don't act smart 😏 -- printing the answer isn't the same as writing the code. Use the actual logic to compute it for real!",
    line: 1,
    type: 'hardcoded_output',
  };
}

/**
 * Validates Kotlin code for static errors before execution:
 * - Unbalanced braces/parentheses
 * - Unclosed strings
 * - val reassignment
 * - basic unresolved references
 */
/** How many identical tokens precede the one at `offset` on its own line (0-based), so the editor can find the same one. */
function occurrenceOnLine(code: string, offset: number, text: string): number {
  const lineStart = code.lastIndexOf('\n', offset - 1) + 1;
  return code.slice(lineStart, offset).split(text).length - 1;
}

function staticValidateKotlin(code: string): KotlinDiagnostic | null {
  const lines = code.split('\n');

  const stack: { text: string; line: number; occurrence: number }[] = [];
  for (const token of scanKotlin(code)) {
    if (token.kind !== 'symbol') continue;
    const line = code.slice(0, token.start).split('\n').length;
    if ('({['.includes(token.text)) stack.push({ text: token.text, line, occurrence: occurrenceOnLine(code, token.start, token.text) });
    else if (')}]'.includes(token.text)) {
      const open = stack.pop();
      if (!open) return { message: `Syntax error: unexpected '${token.text}'`, line, token: token.text, occurrence: occurrenceOnLine(code, token.start, token.text), type: 'syntax_error' };
      if ('({['.indexOf(open.text) !== ')}]'.indexOf(token.text)) {
        // Mark the opener that was never closed (where the learner forgot something), not the later closer that exposed it.
        return { message: `Syntax error: '${open.text}' on line ${open.line} is never closed`, line: open.line, token: open.text, occurrence: open.occurrence, type: 'syntax_error' };
      }
    }
  }
  if (stack.length) {
    const open = stack.at(-1)!;
    return { message: 'Syntax error: unclosed delimiter', line: open.line, token: open.text, occurrence: open.occurrence, type: 'syntax_error' };
  }

  // A loop variable is always read-only and never declared with val/var: `for (val i in xs)` is a compile error in Kotlin.
  {
    const masked = maskStringsAndComments(code);
    const loopKeyword = /\bfor\s*\(\s*(val|var)\s+[A-Za-z_(]/.exec(masked);
    if (loopKeyword) {
      const at = loopKeyword.index + loopKeyword[0].indexOf(loopKeyword[1], 3);
      const line = code.slice(0, at).split('\n').length;
      return { message: `'${loopKeyword[1]}' on loop parameter is prohibited.`, line, token: loopKeyword[1], occurrence: occurrenceOnLine(code, at, loopKeyword[1]), type: 'compiler_error' };
    }
  }

  // World 16 Lesson 3: a suspend function may only be called from another
  // suspend function or a recognized coroutine builder body. This narrow
  // source-level check covers ordinary block-bodied functions, including the
  // lesson's canonical invalid `fun main() { println(load()) }`, before the
  // suspend modifier is intentionally erased for JavaScript lowering.
  const suspendNames = [...code.matchAll(/\bsuspend\s+fun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map(match => match[1]);
  if (suspendNames.length) {
    const ordinaryFunctions = /\bfun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)[^{=]*\{/g;
    for (const fn of code.matchAll(ordinaryFunctions)) {
      if (/suspend\s+$/.test(code.slice(0, fn.index ?? 0))) continue;
      const open = (fn.index ?? 0) + fn[0].lastIndexOf('{');
      let depth = 1, end = open + 1;
      while (end < code.length && depth) {
        if (code[end] === '{') depth++;
        else if (code[end] === '}') depth--;
        end++;
      }
      const body = code.slice(open + 1, Math.max(open + 1, end - 1));
      const illegal = suspendNames.find(name => new RegExp(`\\b${name}\\s*\\(`).test(body));
      if (illegal) return {
        message: `Suspend function '${illegal}' can be called only from a coroutine or another suspend function`,
        line: code.slice(0, open).split('\n').length,
        type: 'compiler_error',
      };
    }
  }

  const abstractContracts = [...code.matchAll(/abstract\s+class\s+([A-Za-z_][A-Za-z0-9_]*)[^\{]*\{([\s\S]*?)\n?\}/g)]
    .map((match) => ({ base: match[1], methods: [...match[2].matchAll(/abstract\s+fun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map((method) => method[1]) }));
  for (const contract of abstractContracts) {
    if (!contract.methods.length) continue;
    const subclasses = [...code.matchAll(new RegExp(`\\bclass\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*:\\s*${contract.base}\\s*\\([^)]*\\)(?:\\s*\\{([\\s\\S]*?)\\})?`, 'g'))];
    for (const subclass of subclasses) {
      const body = subclass[2] ?? '';
      const missing = contract.methods.find((method) => !new RegExp(`\\boverride\\s+fun\\s+${method}\\s*\\(`).test(body));
      if (missing) return {
        message: `Class ${subclass[1]} must implement ${missing}() or be abstract`,
        line: code.slice(0, subclass.index).split('\n').length,
        type: 'compiler_error',
      };
    }
  }

  // 3. Track val vs var declarations and catch val reassignment
  const declaredVars: Map<string, VarDeclaration> = new Map();
  // Standard built-ins that shouldn't be flagged as unresolved
  const builtIns = new Set([
    'println', 'print', 'listOf', 'mutableListOf', 'mapOf', 'setOf',
    'maxOf', 'minOf', 'repeat', 'arrayOf', 'Int', 'String', 'Boolean', 'Double', 'Float',
    'true', 'false', 'null', 'args', 'this', 'it'
  ]);

  // Open `(` count before each line (strings removed): a line inside an argument list (`amount = amount,` in a call written
  // over several lines) is a named argument, never an assignment.
  let parenDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const commentIdx = rawLine.indexOf('//');
    const lineWithoutComment = commentIdx !== -1 ? rawLine.slice(0, commentIdx) : rawLine;
    const trimmed = lineWithoutComment.trim();
    const insideArguments = parenDepth > 0;
    const bare = lineWithoutComment.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '');
    parenDepth = Math.max(0, parenDepth + (bare.match(/\(/g) ?? []).length - (bare.match(/\)/g) ?? []).length);
    if (!trimmed) continue;

    // Detect function parameters e.g., fun foo(player: String, coins: Int)
    const funMatch = trimmed.match(/fun\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/);
    if (funMatch && funMatch[2]) {
      const params = funMatch[2].split(',');
      for (const p of params) {
        const pTrimmed = p.trim();
        const pMatch = pTrimmed.match(/(?:(val|var)\s+)?([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)/);
        if (pMatch) {
          const isVal = pMatch[1] !== 'var'; // function params in Kotlin are default val (read-only)
          const varName = pMatch[2];
          declaredVars.set(varName, {
            name: varName,
            isVal,
            type: pMatch[3],
            line: i + 1,
          });
        }
      }
    }

    // Detect val/var declarations: val x: Int = 5 or val x = 5
    const declMatch = trimmed.match(/\b(val|var)\s+([a-zA-Z0-9_]+)(?:\s*:\s*([a-zA-Z0-9_<>]+))?(?:\s*=\s*(.+))?/);
    if (declMatch) {
      const isVal = declMatch[1] === 'val';
      const varName = declMatch[2];
      const type = declMatch[3];
      const initialExpr = declMatch[4]?.trim();

      // Check simple static type mismatch on declaration
      if (type && initialExpr) {
        if (type === 'Int' && (initialExpr.startsWith('"') || /^-?\d[\d_]*\.\d/.test(initialExpr))) {
          return {
            message: `Type mismatch: Inferred type is not Int`,
            line: i + 1,
            type: 'type_mismatch',
            codeSnippet: rawLine.trim(),
          };
        } else if (type === 'String' && !initialExpr.startsWith('"') && !initialExpr.endsWith('"') && !isNaN(Number(initialExpr))) {
          return {
            message: `Type mismatch: Inferred type is Int but String was expected`,
            line: i + 1,
            type: 'type_mismatch',
            codeSnippet: rawLine.trim(),
          };
        } else if (type === 'Boolean' && initialExpr !== 'true' && initialExpr !== 'false' && !initialExpr.includes('==') && !initialExpr.includes('>')) {
          if (!isNaN(Number(initialExpr))) {
            return {
              message: `Type mismatch: Inferred type is Int but Boolean was expected`,
              line: i + 1,
              type: 'type_mismatch',
              codeSnippet: rawLine.trim(),
            };
          }
        }
      }

      const isMutableCollectionRef =
        (!!type && MUTABLE_COLLECTION_TYPE.test(type)) || (!!initialExpr && MUTABLE_COLLECTION_INITIALIZER.test(initialExpr));
      declaredVars.set(varName, {
        name: varName,
        // `val total: Int` with no initializer is assigned exactly once later (definite assignment): legal, so not read-only yet.
        isVal: isVal && !!initialExpr,
        type,
        line: i + 1,
        isMutableCollectionRef,
      });
      continue;
    }

    // Check reassignments to val: e.g. player = "Bob" or coins += 15.
    // `=(?!=)` (not `=`) is required: a bare `=` alternative also matches the
    // FIRST `=` of a `==` comparison, so a line starting with a comparison
    // like `x == 3` was wrongly read as an assignment attempt `x = ...` and
    // rejected as a val-reassignment error -- confirmed as a real, previously
    // dormant bug: `with(receiver) { x == 3 && y == 4 }` runs fine when the
    // comparison stays on the SAME line as `with(...) {`, but throws this
    // false positive the moment it's reformatted onto its own line, which is
    // exactly what happens for a multi-statement/multi-line block body.
    const assignMatch = insideArguments ? null : trimmed.match(/^([a-zA-Z0-9_]+)\s*(\+=|-=|\*=|(?:\/=)|=(?!=)|\+\+|--)/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const op = assignMatch[2];
      const decl = declaredVars.get(varName);
      // `xs += x` on `val xs = mutableListOf(...)` is legal Kotlin: `+=`/`-=`
      // resolve to the collection's own `plusAssign`/`minusAssign` operator,
      // which mutates the collection in place rather than reassigning `xs`
      // itself -- only `=`/`++`/`--` (or `+=`/`-=` on anything else) really
      // reassign the val reference. Confirmed as a real, previously dormant
      // false positive the same way as the `==` case above: `xs += x` buried
      // mid-line (`fun add(x: String) { xs += x }`) was invisible to this
      // line-start-anchored check until reformatted onto its own line.
      const isLegalCompoundOnMutableCollection = decl?.isMutableCollectionRef && (op === '+=' || op === '-=');
      if (decl && decl.isVal && !isLegalCompoundOnMutableCollection) {
        return {
          message: `Val cannot be reassigned: '${varName}' is declared with 'val'`,
          line: i + 1,
          type: 'val_reassignment',
          codeSnippet: rawLine.trim(),
        };
      }
    }
  }

  return null;
}

/**
 * Conservatively infers which val/var names (AND function parameter names)
 * are statically known to be Int/Long (as opposed to Double/Float/String/
 * Boolean/etc.), from explicit type annotations or a bare integer-literal
 * initializer. Used only to decide when `/` needs Kotlin's Int-division
 * truncation -- see `wrapIntDivision` below. Deliberately does not attempt
 * to trace values through arbitrary expressions; when a variable's type
 * can't be determined this way, it's simply left out of the set, which
 * preserves today's (already-shipped, already-tested) plain-JS-division
 * behavior for it.
 */
function inferIntTypedVars(code: string): Set<string> {
  const intVars = new Set<string>();
  for (const rawLine of code.split('\n')) {
    const commentIdx = rawLine.indexOf('//');
    const line = commentIdx !== -1 ? rawLine.slice(0, commentIdx) : rawLine;

    const declMatch = line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*([a-zA-Z_][a-zA-Z0-9_<>]*))?\s*=\s*(.+)$/);
    if (declMatch) {
      const [, name, explicitType, rhsRaw] = declMatch;
      const rhs = rhsRaw.trim();
      if (explicitType) {
        if (explicitType === 'Int' || explicitType === 'Long') intVars.add(name);
      } else if (/^-?\d[\d_]*[lL]?$/.test(rhs)) {
        intVars.add(name);
      }
    }

    // `val total: Int` / `var celsius: Int` (a class property or a constructor property) and plain constructor parameters
    // (`class Price(base: Int, taxPercent: Int)`): their names are Int in any `this.name` / bare-name division in the class.
    for (const prop of line.matchAll(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(Int|Long)\b/g)) intVars.add(prop[1]);
    const classMatch = line.match(/\bclass\s+[a-zA-Z0-9_]+\s*(?:<[^>]*>)?\s*\(([^)]*)\)/);
    if (classMatch) {
      for (const param of classMatch[1].split(',')) {
        const paramMatch = param.trim().match(/^(?:(?:private|protected|internal|public|override|open)\s+)*(?:val\s+|var\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(Int|Long)\b/);
        if (paramMatch) intVars.add(paramMatch[1]);
      }
    }

    // Function parameters with an explicit Int/Long type, e.g.
    // `fun average(a: Int, b: Int): Int {` -- these never go through the
    // val/var declaration pattern above, so without this a division
    // between two Int PARAMETERS (a very common pattern in this world's
    // content) would silently fail to truncate.
    const funMatch = line.match(/\bfun\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)/);
    if (funMatch) {
      for (const param of funMatch[1].split(',')) {
        const paramMatch = param.trim().match(/^(?:vararg\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(Int|Long)\b/);
        if (paramMatch) intVars.add(paramMatch[1]);
      }
    }
  }
  return intVars;
}

/**
 * Finds the [start, end) character ranges of double-quoted string literals
 * on a single line (respecting backslash escapes), so `wrapIntDivision`
 * never rewrites a `/` that only appears inside a string.
 */
function findStringRanges(line: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let inString = false;
  let start = -1;
  let escaped = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\' && inString) {
      escaped = !escaped;
      continue;
    }
    if (ch === '"' && !escaped) {
      if (!inString) {
        inString = true;
        start = i;
      } else {
        inString = false;
        ranges.push([start, i]);
      }
    } else {
      escaped = false;
    }
  }
  return ranges;
}

/**
 * Kotlin's `/` performs truncating integer division when BOTH operands are
 * Int/Long -- `47 / 5` is `9`, not `9.4`. Plain JS `/` never truncates, so
 * without this, any graded writeRun/debug exercise that divides two Ints
 * with a non-exact quotient would compute the wrong (fractional) result in
 * this simulator even when the learner's Kotlin is perfectly correct -- see
 * PITFALLS.md. This only rewrites the narrow, unambiguous case of a bare
 * identifier or integer literal divided by another bare identifier or
 * integer literal (the pattern actual lesson content uses); anything more
 * complex (parenthesized sub-expressions, chained arithmetic) is left
 * untouched rather than guessed at.
 */
/**
 * `i % 0` / `n / 0` with a LITERAL integer zero and a simple operand (a name, a member, a number): routed through `__kt_divZero`, which
 * throws ArithmeticException for an integer operand. Typed Int operands are already handled by the lowerer (`__kt_idiv`/`__kt_irem`);
 * this covers the operands it cannot type, such as a lambda's `it` or a range loop variable. String contents are never touched.
 */
function guardLiteralZeroDivisor(line: string): string {
  if (!/[%/]\s*0(?![\w.])/.test(line)) return line;
  return splitCodeAndStrings(line)
    .map((chunk) => chunk.isString ? chunk.text : chunk.text.replace(/(?<![\w$.)\]])([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|\d+)\s*([%/])\s*0(?![\w.])/g, (_m, operand, op) => `__kt_divZero(${operand}, '${op}')`))
    .join('');
}

function wrapIntDivision(line: string, intVars: Set<string>): string {
  if (!line.includes('/')) return line;
  const stringRanges = findStringRanges(line);
  const isInString = (idx: number) => stringRanges.some(([s, e]) => idx > s && idx < e);

  // Operands are a bare identifier or an integer literal. The trailing
  // `(?!\.\d)` on each digit-literal alternative stops this from matching just
  // the INTEGER part of a decimal literal (`a / 2.0` must never become
  // `Math.trunc(a / 2).0`), and the `(?<![\w.])` lookbehind stops a match from
  // starting inside a longer identifier, a member access, or the fractional
  // digits of a decimal literal (`5.0 / b`).
  const term = String.raw`(?:-?\d[\d_]*(?!\.\d)|(?:this\.)?[a-zA-Z_][a-zA-Z0-9_]*)`;
  // A whole left-associated run of `*`, `/`, `%`: `a * 100 / b` is
  // `(a * 100) / b`, so truncation must wrap the entire left operand instead of
  // pairing `100 / b` on its own. The lookahead rejects a chain whose last
  // operand is really a call/member/index (`a / b.length`), which this text
  // pass cannot type.
  const chainRe = new RegExp(String.raw`(?<![\w.])${term}(?:\s*[*/%]\s*${term})+(?![\w.(\[])`, 'g');
  const isIntLiteral = (tok: string) => /^-?\d[\d_]*$/.test(tok);

  return line.replace(chainRe, (match: string, offset: number) => {
    if (!match.includes('/') || isInString(offset)) return match;
    // If an operator (or a closing bracket/call) sits right before this chain,
    // its true left operand is a larger expression this pass cannot classify
    // (`2.5 * a / b` is `(2.5 * a) / b`, a Double division): treat the chain
    // start as unknown so nothing here is truncated.
    const before = line.slice(0, offset).trimEnd();
    const precededByOperand = /[*/%)\]]$/.test(before);

    const parts = match.split(/\s*([*/%])\s*/);
    let expr = parts[0];
    const bare = (tok: string) => tok.replace(/^this\./, '');
    let isInt = !precededByOperand && (isIntLiteral(parts[0]) || intVars.has(bare(parts[0])));
    let changed = false;
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const right = parts[i + 1];
      const rightIsInt = isIntLiteral(right) || intVars.has(bare(right));
      if (op === '/' && isInt && rightIsInt) {
        expr = `__kt_idiv(${expr} / ${right})`;
        changed = true;
      } else if (op === '%' && isInt && rightIsInt) {
        expr = `__kt_irem(${expr}, ${right})`;
        changed = true;
      } else {
        expr = `${expr} ${op} ${right}`;
        isInt = isInt && rightIsInt;
      }
    }
    return changed ? expr : match;
  });
}

/**
 * Rewrites a Kotlin range-based `for` loop header into a plain JS `for`
 * loop, since `for (i in 1..10) { ... }` is not valid JS syntax at all.
 * Supports exactly the range forms World 4 (Loop Master) teaches:
 * `a..b`, `a until b` (exclusive upper bound), `a downTo b` (counting
 * down), and any of those with a trailing `step n`. Deliberately does
 * NOT support `for (x in someCollection)` (iterating a List/Set/Map) --
 * that's a later-world topic (Collections), out of scope here.
 *
 * Must run BEFORE `transformTypeChecks`/`transformRanges` in the per-line
 * pipeline: those two look for a bare `in`/`!in` keyword to rewrite as a
 * boolean check, and a for-loop header also contains the word `in` --
 * once this function has fully rewritten the header into a plain JS
 * `for (let i = ...; ...; ...) {`, there's no `in` keyword left for them
 * to (mis)match.
 */
function transformForLoops(line: string): string {
  // Destructured Map iteration: `for ((key, value) in map) { ... }` -> JS
  // `for (const [key, value] of map) {`, since iterating a JS Map yields
  // [key, value] tuples natively. Must run before the bare-identifier
  // branch below, which would not match a parenthesized `(key, value)`
  // anyway (it requires a single identifier), but is kept as a distinct
  // regex/replace for clarity.
  const destructured = line.replace(
    /\bfor\s*\(\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s+in\s+(.+)\)\s*\{\s*$/,
    (_whole, keyName, valName, mapExpr) => `for (const [${keyName}, ${valName}] of ${mapExpr.trim()}) {`
  );
  if (destructured !== line) return destructured;

  return line.replace(
    /\bfor\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.+)\)\s*\{\s*$/,
    (whole, varName, rangeExprRaw) => {
      const expr = rangeExprRaw.trim();
      let m: RegExpMatchArray | null;

      // A Char range (`'a'..'e'`) cannot be counted with `++` on a JS string: iterate the range value instead.
      if (/'(?:\\.|[^'\\])'/.test(expr) && /\.\.|\buntil\b|\bdownTo\b/.test(expr)) return `for (const ${varName} of ${transformRangeValues(expr)}) {`;

      if ((m = expr.match(/^(.+?)\s+downTo\s+(.+?)\s+step\s+(.+)$/))) {
        const [, start, end, step] = m;
        return `for (let ${varName} = ${start.trim()}, __kt_step = __kt_checkStep(${step.trim()}); ${varName} >= ${end.trim()}; ${varName} -= __kt_step) {`;
      }
      if ((m = expr.match(/^(.+?)\s+downTo\s+(.+)$/))) {
        const [, start, end] = m;
        return `for (let ${varName} = ${start.trim()}; ${varName} >= ${end.trim()}; ${varName}--) {`;
      }
      if ((m = expr.match(/^(.+?)\.\.(.+?)\s+step\s+(.+)$/))) {
        const [, start, end, step] = m;
        return `for (let ${varName} = ${start.trim()}, __kt_step = __kt_checkStep(${step.trim()}); ${varName} <= ${end.trim()}; ${varName} += __kt_step) {`;
      }
      if ((m = expr.match(/^(.+?)\s+until\s+(.+?)\s+step\s+(.+)$/))) {
        const [, start, end, step] = m;
        return `for (let ${varName} = ${start.trim()}, __kt_step = __kt_checkStep(${step.trim()}); ${varName} < ${end.trim()}; ${varName} += __kt_step) {`;
      }
      if ((m = expr.match(/^(.+?)\.\.(.+)$/))) {
        const [, start, end] = m;
        return `for (let ${varName} = ${start.trim()}; ${varName} <= ${end.trim()}; ${varName}++) {`;
      }
      if ((m = expr.match(/^(.+?)\s+until\s+(.+)$/))) {
        const [, start, end] = m;
        return `for (let ${varName} = ${start.trim()}; ${varName} < ${end.trim()}; ${varName}++) {`;
      }
      // A bare identifier (no .., until, or downTo) -- treat it as an
      // array-like value and iterate its VALUES with JS `for...of`.
      // This specifically covers `for (item in varargParam)` (this
      // world's `vararg` produces a real JS array at runtime). Without
      // this, the line would fall through unchanged and JS would still
      // happily parse `for (item in arr)` as its OWN native for-in
      // loop -- which iterates ARRAY INDICES AS STRINGS, not values, a
      // silent-wrong-answer bug rather than a clear error. `for...of`
      // is the correct translation both for a vararg array today and
      // for a real Kotlin collection once that becomes supported later.
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
        return `for (const ${varName} of __kt_iterable(${expr})) {`;
      }
      // Any other subject that is not a range (`list.indices`, `map.keys`, `list.withIndex()`,
      // `listOf(1, 2)`, `set.toList()`) is a collection expression. Left untouched it is still valid JS
      // for...in, which walks the wrong things (or nothing at all) without any error, so iterate its values.
      return `for (const ${varName} of __kt_iterable(${expr})) {`;
    }
  );
}

/**
 * A braceless statement-level `if` with its `else` on the same line (`if (x < 0) println("neg") else println("pos")`) is not valid
 * JavaScript: unlike a newline, nothing inserts the `;` that has to end the then-branch. A `;` goes before every top-level `else`
 * that does not follow a `}`. Only lines that START with `if` / `else if` are touched (never `val x = if (...) a else b`).
 */
function separateSameLineElse(line: string): string {
  if (!/^\s*(?:\}\s*)?(?:else\s+)?if\s*\(/.test(line) || !/\belse\b/.test(line)) return line;
  let out = '';
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' || ch === '\'' || ch === '`') {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
      out += line.slice(i, j + 1);
      i = j;
      continue;
    }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    if (depth === 0 && ch === 'e' && line.startsWith('else', i) && !/[\w$]/.test(line[i - 1] ?? ' ') && !/[\w$]/.test(line[i + 4] ?? ' ')) {
      const before = out.trimEnd();
      if (before && !before.endsWith('}') && !before.endsWith(';') && !/^\s*(?:\}\s*)?$/.test(before)) out = `${before}; `;
    }
    out += ch;
  }
  return out;
}

/**
 * Infix bit/logic functions: `a shl 2`, `x and y`, `flag xor other`. They bind looser than `+`/`-` and tighter than comparisons, so
 * each becomes a method call on its whole left operand (`(1 + 2).shl(3)`); the methods live on Number and Boolean (kotlinStdlib.ts).
 */
function transformInfixOperators(line: string): string {
  if (!/\b(?:shl|shr|ushr|and|or|xor|union|intersect|subtract)\b/.test(line)) return line;
  const strings: string[] = [];
  let out = line.replace(/"(?:[^"\\]|\\.)*"/g, (m) => { strings.push(m); return `__KT_S${strings.length - 1}__`; });
  const group = String.raw`\((?:[^()]|\([^()]*\))*\)`;
  const base = String.raw`(?:-?\d[\d_]*(?:\.\d+)?|0[xXbB][0-9a-fA-F_]+|'(?:\\.|[^'\\])'|[A-Za-z_]\w*(?:${group})?|${group})`;
  const term = String.raw`${base}(?:\.[A-Za-z_]\w*(?:${group})?)*`;
  const expr = String.raw`${term}(?:\s*[-+*/%]\s*${term})*`;
  const re = new RegExp(String.raw`(?<![\w.])(${expr})\s+(shl|shr|ushr|and|or|xor|union|intersect|subtract)\s+(${expr})`);
  for (let guard = 0; guard < 20 && re.test(out); guard++) {
    out = out.replace(re, (whole: string, left: string, op: string, right: string) => (/^(?:val|var|fun|if|while|return|in|is)\b/.test(left) ? whole : `(${left}).${op}(${right})`));
    if (!re.test(out)) break;
  }
  return out.replace(/__KT_S(\d+)__/g, (_m, i: string) => strings[Number(i)]);
}

/**
 * Range VALUES (not loop headers, not the simple `x in 1..5` check): `1..5`, `a until b`, `a downTo b`, `1..<n`, each optionally
 * followed by `step n`, becomes `__kt_rangeOf(a, b, kind, step)`, a list that prints like a Kotlin range. Endpoints may be
 * arithmetic (`0 until n - 1`: `..`/`until`/`downTo` bind looser than `+`/`-` and tighter than `step`). `x in <range>` with
 * such endpoints becomes `.contains(x)` (JavaScript's own `in` would test property names).
 */
function transformRangeValues(line: string): string {
  if (!/\.\.|\buntil\b|\bdownTo\b/.test(line)) return line;
  const strings: string[] = [];
  const masked = line.replace(/"(?:[^"\\]|\\.)*"/g, (m) => { strings.push(m); return `__KT_S${strings.length - 1}__`; });
  const group = String.raw`\((?:[^()]|\([^()]*\))*\)`; // one level of nesting: (a.b(c))
  const base = String.raw`(?:-?\d[\d_]*(?:\.\d+)?|'(?:\\.|[^'\\])'|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*(?:${group})?|${group})`;
  const term = String.raw`${base}(?:\.[A-Za-z_]\w*(?:${group})?)*`;
  const expr = String.raw`${term}(?:\s*[-+*/%]\s*${term})*`;
  const re = new RegExp(String.raw`(?<![\w.])(?:(${expr})\s+(!in|in)\s+)?(${expr})\s*(\.\.<|\.\.|\buntil\b|\bdownTo\b)\s*(${expr})(?:\s+step\s+(${expr}))?`, 'g');
  const out = masked.replace(re, (_whole, subject: string | undefined, membership: string | undefined, from: string, op: string, to: string, step: string | undefined) => {
    const kind = op === '..' ? '..' : op === 'downTo' ? 'downTo' : 'until';
    const range = `__kt_rangeOf(${from}, ${to}, '${kind}'${step ? `, ${step}` : ''})`;
    return subject ? `${membership === '!in' ? '!' : ''}${range}.contains(${subject})` : range;
  });
  return out.replace(/__KT_S(\d+)__/g, (_m, i: string) => strings[Number(i)]);
}

/**
 * Rewrites `x in a..b` / `x !in a..b` (numeric or single-quoted-char range
 * endpoints) into a plain boolean expression. Used both as a standalone
 * per-line transform (e.g. `if (x in 1..10)`) and reused, with the subject
 * substituted in directly, by `transpileWhenBlocks` for `when`'s range
 * branches.
 */
function transformRanges(line: string): string {
  // Endpoints: an integer, a single-quoted char, or a (member) identifier such as
  // `low` / `limits.max` -- `n in low..high` is as ordinary as `n in 1..10`.
  const endpoint = String.raw`(-?\d[\d_]*(?:\.\d+)?|'.'|[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)`;
  // A number or char literal is a valid subject too: `println(10 in 5..10)`.
  const subject = String.raw`(-?\d[\d_]*(?:\.\d+)?|'.'|[a-zA-Z_][a-zA-Z0-9_.]*|\([^()]*\))`;
  // (?<![\w.]) keeps the subject from being the tail of a larger expression (`(1..5).random() in 1..5`: not `()`).
  const inclusive = new RegExp(`(?<![\\w.])${subject}\\s+(!in|in)\\s+${endpoint}\\.\\.${endpoint}(?![\\w.])`, 'g');
  const exclusive = new RegExp(`(?<![\\w.])${subject}\\s+(!in|in)\\s+${endpoint}\\s+until\\s+${endpoint}(?![\\w.])`, 'g');
  // `x in collection` / `x !in collection` (a name that is not a range): membership via .contains().
  const anySubject = String.raw`(-?\d[\d_]*(?:\.\d+)?|'[^'\\]'|"(?:[^"\\]|\\.)*"|[a-zA-Z_][a-zA-Z0-9_.]*(?:\([^()]*\))?|\([^()]*\))`;
  const callArgs = String.raw`\((?:[^()]|\([^()]*\))*\)`; // one level of nested parentheses: mapOf(Pair("a", 1))
  const collectionExpr = String.raw`"(?:[^"\\]|\\.)*"|[a-zA-Z_][a-zA-Z0-9_]*(?:${callArgs})?(?:\.[a-zA-Z_][a-zA-Z0-9_]*(?:${callArgs})?)*`;
  const membership = new RegExp(`(?<![\\w.])${anySubject}\\s+(!in|in)\\s+(${collectionExpr})(?![\\w.(\\[])(?!\\s*(?:\\.\\.|until\\b|downTo\\b))`, 'g');
  return line
    .replace(inclusive, (_m, expr, kw, lo, hi) => {
      const check = `((${expr}) >= ${lo} && (${expr}) <= ${hi})`;
      return kw === '!in' ? `!${check}` : check;
    })
    .replace(exclusive, (_m, expr, kw, lo, hi) => {
      const check = `((${expr}) >= ${lo} && (${expr}) < ${hi})`;
      return kw === '!in' ? `!${check}` : check;
    })
    .replace(membership, (whole: string, subjectText: string, kw: string, collection: string, offset: number, source: string) => {
      // Words inside a string literal ("item in cart") are text, not an operator.
      if (findStringRanges(source).some(([from, to]) => offset > from && offset < to)) return whole;
      if (/^(?:for|while|if|when|return)$/.test(subjectText)) return whole;
      const check = `(${collection}).contains(${subjectText})`;
      return kw === '!in' ? `!${check}` : check;
    });
}

/**
 * Rewrites `x is Type` / `x !is Type` into a runtime `typeof` check.
 * Deliberately supports only Int/Long/Float/Double (all -> 'number'),
 * String, and Boolean -- the distinctions this simulator's plain-JS-value
 * model can actually tell apart. `is Char` is intentionally NOT supported:
 * a Kotlin Char and a same-text String are indistinguishable JS strings
 * here (see PITFALLS.md), so an `is Char` check would silently misbehave
 * exactly like the Char-vs-String debug bugs documented there.
 */
/** Every declared `interface Name` in `code`, bodied or bodyless -- used by
 * `transformTypeChecks` to pick `instanceof` (a real class/object, backed
 * by a real prototype chain) vs the `__kt_implements_Name` marker property
 * (an interface, erased to a plain object with none) for an `is` check,
 * since calling `instanceof` against the latter throws a TypeError
 * ("right-hand side ... is not callable") rather than just being wrong. */
function getAllInterfaceNames(code: string): Set<string> {
  const names = new Set<string>();
  const re = /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) names.add(m[1]);
  return names;
}

function transformTypeChecks(line: string, interfaceNames: Set<string> = new Set()): string {
  const typeofMap: Record<string, string> = {
    Int: 'number', Long: 'number', Float: 'number', Double: 'number',
    String: 'string', Boolean: 'boolean',
  };
  return line.replace(
    // A primitive Kotlin type maps to a typeof check (never Char -- a
    // single-quoted Char and a same-text String are indistinguishable JS
    // strings, see the standing pitfall on this). A known interface name
    // (`Open is Trackable`) checks the `__kt_implements_Trackable` marker
    // instead -- see `getAllInterfaceNames`'s doc comment for why.
    // Anything else (a declared class/object) falls back to `instanceof`,
    // matching the identical class-vs-primitive split already used inside
    // a `when` branch's `is Type ->` condition (see `parseWhenBranches`)
    // -- this is the standalone-expression form of the same check.
    // The trailing boundary is a negative lookahead, not `\b`: when the
    // optional `<...>` generic suffix IS consumed, the character right
    // after it (typically `)` or end of line) is non-word, and so is the
    // `>` right before it -- `\b` requires a word/non-word transition, so
    // it would fail exactly there and force the regex to backtrack into
    // NOT consuming the generic after all, silently leaving `<Int>`
    // dangling, unconverted, in the output (confirmed directly: `s is
    // Sequence<Int>` produced `(s instanceof Sequence)<Int>`, a syntax
    // error). `(?![A-Za-z0-9_])` only asserts "not immediately followed by
    // another identifier character," which is satisfiable regardless of
    // what came just before it.
    // World 15: the LHS can also be a zero/simple-arg method call on a
    // dotted receiver (`r.exceptionOrNull() is NumberFormatException`) --
    // the optional `(?:\([^()]*\))?` tail covers that shape without
    // needing full nested-call parsing, matching every lesson usage.
    // (`new ` is part of the operand: `P(1) is P` already reads `new P(1) is P` here)
    /((?:new\s+)?[a-zA-Z_][a-zA-Z0-9_.]*(?:\([^()]*\))?|\([^()]*\))\s+(is|!is)\s+([A-Z][a-zA-Z0-9_]*)(?:<[^<>]*>)?(?![A-Za-z0-9_])/g,
    (_m, expr, kw, type) => {
      const jsType = typeofMap[type];
      const check = jsType
        ? `typeof (${expr}) === '${jsType}'`
        : interfaceNames.has(type)
          ? `Boolean((${expr}) && (${expr}).__kt_implements_${type})`
          : `(${expr}) instanceof ${type}`;
      return kw === '!is' ? `!(${check})` : `(${check})`;
    }
  );
}

/**
 * Recursively converts a Kotlin if-expression (including chained `else if`)
 * into nested JS ternaries.
 */
// World 15: a `throw` in an if-expression branch (`if (cond) value else
// throw X(...)`) is real, common Kotlin -- `throw` has type `Nothing`,
// which is compatible with any expected type. JS has no such expression
// (`throw` is a statement, so a bare `throw` inside a ternary branch is a
// SyntaxError), so a branch that is exactly `throw EXPR` is rewritten to
// call `__kt_throw(EXPR)` (a plain function that throws its argument)
// instead -- valid anywhere an expression is expected.
function wrapThrowBranch(branch: string): string {
  const m = branch.match(/^throw\s+(.+)$/);
  return m ? `__kt_throw(${m[1]})` : branch;
}
// Index of the `)` matching the `(` at `open`, skipping string literals; -1 if unbalanced.
function matchingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === '\\') i++;
    } else if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) return i;
  }
  return -1;
}
function convertIfExpr(expr: string): string {
  // A condition may itself contain parentheses (`if (x / 2 > 6) ...`,
  // `if ((a + b) > 3) ...`), so find the matching `)` instead of the first one.
  const head = expr.match(/^\s*if\s*\(/);
  if (head) {
    const open = head[0].length - 1;
    const close = matchingParen(expr, open);
    const rest = close > 0 ? expr.slice(close + 1).match(/^\s+([^\n]+?)\s+else\s+([^\n]+)$/) : null;
    if (rest) {
      return `((${expr.slice(open + 1, close)}) ? (${wrapThrowBranch(rest[1].trim())}) : (${convertIfExpr(rest[2].trim())}))`;
    }
  }
  const m = expr.match(/^\s*if\s*\((.+?)\)\s+([^\n]+?)\s+else\s+([^\n]+)$/);
  if (!m) return wrapThrowBranch(expr.trim());
  const [, cond, thenBranch, elseBranch] = m;
  return `((${cond}) ? (${wrapThrowBranch(thenBranch.trim())}) : (${convertIfExpr(elseBranch.trim())}))`;
}

/**
 * `if (c) a else b` used INSIDE a larger expression -- an argument (`println(if (n > 5) "big"
 * else "small")`), a parenthesised operand (`(if (gift) 3 else 0) + 1`), or the body of a
 * `${...}` placeholder. `transformIfExpression` only sees `= if ...` / `return if ...` at the
 * end of a line, so these reached JavaScript as a raw `if` and failed with "Unexpected token
 * 'if'". An `if` is an expression (not a statement) when the text before it ends an operand
 * position: `(`, `,`, an operator, or -- for a placeholder body -- the very start. It is
 * rewritten to a ternary; a statement-level `if` (start of line, after `{`, `}`, `;`, or
 * `else`) and any `if` without an `else` are left untouched.
 */
function transformInlineIfExpressions(text: string, startIsExpression = false): string {
  const scanTo = (from: number, stop: (ch: string, depth: number, i: number) => boolean): number => {
    let depth = 0;
    for (let i = from; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"' || ch === "'") {
        for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === '\\') i++;
        continue;
      }
      if (stop(ch, depth, i)) return i;
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
    }
    return text.length;
  };
  const ifRe = /\bif\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = ifRe.exec(text)) !== null) {
    const start = match.index;
    if (start > 0 && /[A-Za-z0-9_$.]/.test(text[start - 1])) continue;
    // Words inside a string literal are text, not code.
    if (findStringRanges(text).some(([from, to]) => start > from && start < to)) continue;
    const before = text.slice(0, start).trimEnd();
    const inExpression = before === '' ? startIsExpression : /[(,+\-*/%<>=?:\[|&!]$/.test(before);
    if (!inExpression) continue;
    const open = start + match[0].length - 1;
    const close = matchingParen(text, open);
    if (close < 0) continue;
    // then-branch ends at a top-level `else`; the else-branch ends at the unmatched `)`/`]`/`}`, a `,` or `;`.
    const elseAt = scanTo(close + 1, (_ch, depth, i) => depth === 0 && /^\belse\b/.test(text.slice(i)) && !/[A-Za-z0-9_]/.test(text[i - 1] ?? ' '));
    if (elseAt >= text.length) continue;
    const elseEnd = scanTo(elseAt + 4, (ch, depth) => depth === 0 && (ch === ',' || ch === ';' || ch === ')' || ch === ']' || ch === '}'));
    const condition = text.slice(open + 1, close);
    const thenText = transformInlineIfExpressions(text.slice(close + 1, elseAt).trim(), true);
    const elseText = transformInlineIfExpressions(text.slice(elseAt + 4, elseEnd).trim(), true);
    const replacement = `((${condition}) ? (${thenText}) : (${elseText}))`;
    text = text.slice(0, start) + replacement + text.slice(elseEnd);
    ifRe.lastIndex = start + replacement.length;
  }
  return text;
}

/**
 * Converts Kotlin if-expressions (single-line or chained else-if)
 * into JS ternaries.
 */
function transformIfExpression(line: string): string {
  // A `;` the lambda lowering put after the statement ends the statement, not the else branch.
  const semicolon = /;\s*$/.exec(line);
  const body = semicolon ? line.slice(0, semicolon.index) : line;
  const match = body.match(/(=\s*|\breturn\s+)(if\s*\(.+?\)\s+.+?\s+else\s+.+)$/);
  if (!match || match.index === undefined) return line;
  const prefix = match[1];
  const ifExpr = match[2];
  return body.slice(0, match.index) + prefix + convertIfExpr(ifExpr) + (semicolon ? ';' : '');
}

/**
 * Rewrites multiline if-expressions with braces:
 *   val x = if (cond) { ... } else { ... }
 * or
 *   return if (cond) { ... } else { ... }
 * into an IIFE:
 *   val x = (() => { if (cond) { ... } else { ... } })()
 */
function transpileMultilineIfExpressions(code: string): string {
  const ifRe = /(=\s*|\breturn\s+)if\s*\(([^)]+)\)\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = ifRe.exec(code)) !== null) {
    const prefix = match[1];
    const condition = match[2].trim();
    const ifStart = match.index;
    const thenBraceStart = match.index + match[0].length - 1;

    let depth = 1;
    let i = thenBraceStart + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) {
      ifRe.lastIndex = thenBraceStart + 1;
      continue;
    }
    const thenBody = code.slice(thenBraceStart + 1, i - 1).trim();

    const remaining = code.slice(i);
    const elseMatch = remaining.match(/^\s*else\s*\{/);
    // `val y = if (c) { stmt; value } else 0`: a bare (brace-free, non-`if`) else branch runs to the end of the line.
    const bareElse = elseMatch ? null : remaining.match(/^[ \t]*else[ \t]+(?!if\b|\{)([^\n]+)/);
    if (bareElse) {
      const body = (text: string) => { const parts = splitKotlinPieces(text); const last = parts.pop() ?? ''; const stmt = /^(?:return|throw|val|var|for|while|do)\b/.test(last); return `${parts.join('\n')}\n${stmt ? last : `return (${last})`};`; };
      const rewrittenBare = `${prefix}(() => { if (${condition}) { ${body(thenBody)} } else { ${body(bareElse[1].trim())} } })()`;
      result += code.slice(cursor, ifStart) + rewrittenBare;
      cursor = i + bareElse[0].length;
      ifRe.lastIndex = cursor;
      continue;
    }
    if (!elseMatch) {
      ifRe.lastIndex = i;
      continue;
    }
    const elseBraceStart = i + elseMatch[0].length - 1;
    depth = 1;
    let j = elseBraceStart + 1;
    for (; j < code.length && depth > 0; j++) {
      if (code[j] === '{') depth++;
      else if (code[j] === '}') depth--;
    }
    if (depth !== 0) {
      ifRe.lastIndex = elseBraceStart + 1;
      continue;
    }
    const elseBody = code.slice(elseBraceStart + 1, j - 1).trim();
    const blockEnd = j;

    // several statements: only the LAST is the value
    const asValue = (text: string) => { const parts = splitKotlinPieces(text); const last = parts.pop() ?? ''; const stmt = /^(?:return|throw|val|var|for|while|do)\b/.test(last); return `${parts.join('\n')}\n${stmt ? last : `return (${last})`}`; };
    const thenReturn = asValue(thenBody);
    const elseReturn = asValue(elseBody);

    const rewritten = `${prefix}(() => { if (${condition}) { ${thenReturn}; } else { ${elseReturn}; } })()`;
    result += code.slice(cursor, ifStart) + rewritten;
    cursor = blockEnd;
    ifRe.lastIndex = blockEnd;
  }
  result += code.slice(cursor);
  return result;
}

/**
 * Strips Kotlin generic type parameters from collection helper calls:
 * e.g. mutableListOf<Int>() -> mutableListOf()
 */
function stripCollectionGenerics(code: string): string {
  return code.replace(/\b(emptyList|listOf|mutableListOf|arrayOf|setOf|mutableSetOf|mapOf|mutableMapOf|emptySet|emptyMap|emptyArray|arrayOfNulls|hashSetOf|linkedSetOf|sortedSetOf|hashMapOf|linkedMapOf|arrayListOf|compareBy|compareByDescending|buildList|buildMap|buildSet|buildString)<[a-zA-Z0-9_?,<>*\s]+>\s*(?=[({])/g, '$1');
}

/**
 * `inline fun <reified T> name(...): R = ...T is used inside...` has no
 * direct JS equivalent: real Kotlin substitutes T with the actual type
 * argument at every call site at compile time (that's what "reified"
 * means), but this engine has no per-call-site inlining/specialization
 * mechanism at all. Rather than build one, T is turned into an ordinary
 * runtime parameter carrying the type NAME as a plain string (supplied by
 * the caller's explicit type argument), and `value is T` becomes a call to
 * `__kt_isReifiedType(value, T)`, which does the same typeof-based dispatch
 * every other `is`/`as?` check in this file already uses (never Char, never
 * an arbitrary declared class -- this engine has no runtime class registry
 * keyed by a string name; see `__kt_isReifiedType`'s own doc comment).
 *
 * Scope, deliberately narrow (verify with `compileAndRunKotlin` before
 * relying on anything wider): the declaration's header (`inline fun <
 * reified T> name(params): ReturnType = expr`, `inline` and the return type
 * both optional) must be a SINGLE line ending in a single-expression body
 * (`= expr`) -- a block body (`{ ... }`) is not supported, matching this
 * file's existing single-line-header convention elsewhere (see
 * `transpileClassDeclarations`/`splitClassMembers`'s own limits). Only one
 * reified type parameter per function is supported. A call site's explicit
 * type argument must be a single bare type name (`name<String>(...)`), not
 * a nested/qualified generic.
 */
function transpileReifiedFunctions(code: string): string {
  const reifiedFunctions = new Map<string, string>();
  code = code.replace(
    /\b(?:inline\s+)?fun\s*<\s*reified\s+([A-Za-z_][A-Za-z0-9_]*)\s*>\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)(\s*:\s*[A-Za-z0-9_<>?.]+)?\s*=\s*(.+)$/gm,
    (_whole, typeParam: string, name: string, params: string, returnType: string | undefined, body: string) => {
      reifiedFunctions.set(name, typeParam);
      const esc = typeParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rewrittenBody = body
        .replace(new RegExp(`([A-Za-z_][A-Za-z0-9_.]*|\\([^()]*\\))\\s+!is\\s+${esc}\\b`, 'g'), (_m: string, expr: string) => `!__kt_isReifiedType(${expr}, ${typeParam})`)
        .replace(new RegExp(`([A-Za-z_][A-Za-z0-9_.]*|\\([^()]*\\))\\s+is\\s+${esc}\\b`, 'g'), (_m: string, expr: string) => `__kt_isReifiedType(${expr}, ${typeParam})`)
        .replace(new RegExp(`__kt_simpleName\\(${esc}\\)`, 'g'), `__kt_simpleName(${typeParam}, true)`);
      const trimmedParams = params.trim();
      const newParams = trimmedParams ? `${trimmedParams}, ${typeParam}: String` : `${typeParam}: String`;
      return `fun ${name}(${newParams})${returnType ?? ''} = ${rewrittenBody}`;
    }
  );
  if (reifiedFunctions.size === 0) return code;
  for (const [name, typeParam] of reifiedFunctions) {
    const escName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    code = code.replace(new RegExp(`\\b${escName}\\s*<\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*>\\s*\\(([^()]*)\\)`, 'g'), (_m: string, typeArg: string, args: string, offset: number) => {
      const trimmedArgs = args.trim();
      // Inside a `"...${typeName<X>()}..."` placeholder the quotes must be the encoded nested quote (prepareKotlinSource), or
      // they would end the string: an odd number of real quotes before the call on its line means it sits in a string.
      const lineStart = code.lastIndexOf('\n', offset) + 1;
      const quote = ((code.slice(lineStart, offset).match(/(?<!\\)"/g) ?? []).length % 2 === 1) ? NESTED_QUOTE : '"';
      return `${name}(${trimmedArgs ? trimmedArgs + ', ' : ''}${quote}${typeArg}${quote})`;
    });
  }
  return code;
}

/**
 * Transforms mapOf / mutableMapOf calls across single or multiple lines,
 * translating `key to value` pairs into `[key, value]` arrays.
 */
function transpileMapDeclarations(code: string): string {
  return code.replace(/\b(mapOf|mutableMapOf)\s*\(([\s\S]*?)\)/g, (_whole, factory, inner) => {
    const entries = splitTopLevelCommas(inner);
    const pairs = entries.map((entry) => {
      const parts = entry.trim().split(/\s+to\s+/);
      return parts.length === 2 ? `[${parts[0]}, ${parts[1]}]` : entry;
    });
    return `${factory === 'mutableMapOf' ? '__kt_mutableMapOf' : '__kt_mapOf'}(${pairs.join(', ')})`;
  });
}

/**
 * Splits Kotlin source into top-level pieces (brackets, strings and comments
 * respected). Used for a `when` body and for a `{ ... }` branch block.
 *
 * A piece ends at a top-level `;` or newline once it is complete: not empty,
 * not ending in an operator/`,`/`->`, and the next line does not continue it
 * (`.x`, `?.`, `?:`, `&&`, `||`, `else`). So `is A ->` followed by the result
 * on the next line, and `-> if (c) a` with `else b` below it, stay one piece.
 * A `{ ... }` block right after `->` ends the piece. Comments are dropped.
 */
function splitKotlinPieces(text: string): string[] {
  const pieces: string[] = [];
  let current = '';
  let depth = 0;
  let i = 0;
  const incomplete = (s: string) => {
    const t = s.trim();
    return !t || /(?:->|[-+*/%=,.(&|!<>:]|\?:|\belse|\bin|\bis)$/.test(t) && !/(?:\+\+|--|!!)$/.test(t);
  };
  const continues = (from: number) => /^\s*(?:\.(?!\.)|\?\.|\?:|&&|\|\||else\b(?!\s*->))/.test(text.slice(from));
  const flush = () => { if (current.trim()) pieces.push(current.trim()); current = ''; };
  while (i < text.length) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (ch === '/' && text[i + 1] === '*') { const end = text.indexOf('*/', i + 2); i = end < 0 ? text.length : end + 2; continue; }
    if (ch === '"' || ch === '\'') {
      const triple = ch === '"' && text.startsWith('"""', i);
      const close = triple ? '"""' : ch;
      let j = i + close.length;
      while (j < text.length && !text.startsWith(close, j)) j += !triple && text[j] === '\\' ? 2 : 1;
      current += text.slice(i, j + close.length);
      i = j + close.length;
      continue;
    }
    if ('([{'.includes(ch)) {
      const isBranchBlock = ch === '{' && depth === 0 && /->\s*$/.test(current);
      depth++;
      current += ch;
      i++;
      if (isBranchBlock) {
        while (i < text.length && depth > 0) {
          if (text[i] === '"' || text[i] === '\'') {
            const q = text[i];
            let j = i + 1;
            while (j < text.length && text[j] !== q) j += text[j] === '\\' ? 2 : 1;
            current += text.slice(i, j + 1);
            i = j + 1;
            continue;
          }
          if (text[i] === '{') depth++;
          else if (text[i] === '}') depth--;
          current += text[i++];
        }
        if (!continues(i)) flush();
      }
      continue;
    }
    if (')]}'.includes(ch)) { depth--; current += ch; i++; continue; }
    if (depth === 0 && (ch === ';' || ch === '\n')) {
      if (!incomplete(current) && !continues(i + 1)) flush();
      else current += ch === ';' ? ';' : '\n';
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  flush();
  return pieces;
}

/** Index of the first top-level `->` in a `when` branch (not one inside brackets or a string), or -1. */
function topLevelArrow(piece: string): number {
  let depth = 0;
  for (let i = 0; i < piece.length; i++) {
    const ch = piece[i];
    if (ch === '"' || ch === '\'') { let j = i + 1; while (j < piece.length && piece[j] !== ch) j += piece[j] === '\\' ? 2 : 1; i = j; continue; }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (depth === 0 && ch === '-' && piece[i + 1] === '>') return i;
  }
  return -1;
}

/**
 * Parses the branches inside a `when (subject) { ... }` body: `<match> -> <result>`, where `<match>`
 * is one of: `else`, a comma-separated list of values (equality, OR'd
 * together), `in a..b` / `!in a..b` (a range) or `is Type`. `<result>` is an
 * expression (which may continue on the following lines, or start on the
 * line after `->`) or a `{ ... }` block. Branches may also be separated by
 * `;` on one line (`when(s){A->0;is B->s.n}`).
 */
function parseWhenBranches(body: string, subject: string | null): Array<{ condition: string | null; result: string }> {
  const branches: Array<{ condition: string | null; result: string }> = [];
  for (const piece of splitKotlinPieces(body)) {
    const arrowIdx = topLevelArrow(piece);
    if (arrowIdx === -1) continue;
    const rawCond = piece.slice(0, arrowIdx).replace(/\s+/g, ' ').trim();
    const result = piece.slice(arrowIdx + 2).trim().replace(/,\s*$/, '');

    if (rawCond === 'else') {
      branches.push({ condition: null, result });
      continue;
    }

    if (!subject) {
      // Subject-less when branch: rawCond is already the boolean expression
      branches.push({ condition: rawCond, result });
      continue;
    }

    // Endpoints: an integer, a single-quoted char, or a (member) identifier (`in low..high`).
    const bound = String.raw`(-?\d[\d_]*|'.'|[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)`;
    const rangeMatch = rawCond.match(new RegExp(String.raw`^(!in|in)\s+${bound}(\.\.|\s+until\s+)${bound}$`));
    if (rangeMatch) {
      const [, kw, lo, op, hi] = rangeMatch;
      const check = `((${subject}) >= ${lo} && (${subject}) ${op === '..' ? '<=' : '<'} ${hi})`;
      branches.push({ condition: kw === '!in' ? `!${check}` : check, result });
      continue;
    }

    // `is Type -> ...` / `!is Type -> ...`: a primitive Kotlin type maps to
    // a typeof check (see transformTypeChecks above, same scope: never
    // Char, since a single-quoted Char and a same-text String are
    // indistinguishable JS strings in this simulator); any other capitalized
    // name is treated as a class/data-class/object variant (e.g. a sealed
    // hierarchy member) and checked with `instanceof`, which is exactly
    // what this engine's real JS classes support.
    const isMatch = rawCond.match(/^(is|!is)\s+([A-Za-z_][A-Za-z0-9_]*)\??$/);
    if (isMatch) {
      const [, kw, type] = isMatch;
      const typeofMap: Record<string, string> = { Int: 'number', Long: 'number', Float: 'number', Double: 'number', String: 'string', Boolean: 'boolean' };
      const check = typeofMap[type] ? `typeof (${subject}) === '${typeofMap[type]}'` : `(${subject}) instanceof ${type}`;
      branches.push({ condition: kw === '!is' ? `!(${check})` : check, result });
      continue;
    }

    const values = rawCond.split(',').map((v) => v.trim()).filter(Boolean);
    const eqChecks = values.map((v) => `(${subject}) === ${v}`).join(' || ');
    branches.push({ condition: eqChecks, result });
  }
  return branches;
}

/**
 * Rewrites every `when (subject) { ... }` or subject-less `when { ... }`
 * block (statement or expression form) into equivalent JS. Runs once over
 * the whole source, before the per-line pass, because a `when` block spans
 * multiple lines and needs balanced-brace scanning to find its extent.
 */
/**
 * `val days = when (month) { ... -> 31 ... }` has no visible type until the `when` is
 * rewritten into an IIFE, which happens AFTER the function lowerer has already typed
 * the program -- so `days / 7` was never truncated and a Double result never printed
 * as `3.0`. When every branch result is a literal of one kind, declare that type on
 * the variable up front so the lowerer (and the Int-division pass) can see it.
 */
function annotateWhenExpressionTypes(code: string): string {
  const literalKind = (text: string): string | null => {
    const t = text.trim();
    if (/^-?\d[\d_]*$/.test(t)) return 'Int';
    if (/^-?\d[\d_]*L$/.test(t)) return 'Long';
    if (/^-?\d[\d_]*\.\d+$/.test(t)) return 'Double';
    if (/^"(?:[^"\\]|\\.)*"$/.test(t)) return 'String';
    if (t === 'true' || t === 'false') return 'Boolean';
    return null;
  };
  const re = /\b(val|var)(\s+)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*when(?:\s*\(([^)]*)\))?\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const open = match.index + match[0].length - 1;
    let depth = 1;
    let i = open + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) continue;
    const subject = match[4] ? match[4].trim() : null;
    const kinds = new Set(parseWhenBranches(code.slice(open + 1, i - 1), subject).map(({ result: res }) => literalKind(res)));
    if (kinds.size !== 1 || kinds.has(null)) continue;
    const nameEnd = match.index + match[1].length + match[2].length + match[3].length;
    result += code.slice(cursor, nameEnd) + `: ${[...kinds][0]}`;
    cursor = nameEnd;
  }
  return result + code.slice(cursor);
}

function transpileWhenBlocks(code: string, expressionContext = false): string {
  const whenRe = /\bwhen(?:\s*\(([^)]*)\))?\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = whenRe.exec(code)) !== null) {
    const blockStart = match.index;
    const openBraceIdx = match.index + match[0].length - 1;
    const subject = match[1] ? match[1].trim() : null;

    let depth = 1;
    let i = openBraceIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) {
      whenRe.lastIndex = openBraceIdx + 1;
      continue;
    }
    const blockEnd = i;
    const body = code.slice(openBraceIdx + 1, i - 1);

    const linePrefix = (code.slice(0, blockStart).split('\n').pop() || '').trimEnd();
    // A value position: after `=`/`return`, as a call argument, as another branch's result, or after an Elvis.
    const isExpression = /(?:=|\breturn|\(|,|->|\?\?|\?:)$/.test(linePrefix) || (linePrefix === '' && expressionContext);

    const branches = parseWhenBranches(body, subject);
    // Inner `when`s (inside a branch result or block) are rewritten first, in the branch's own context.
    const arm = (res: string, valued: boolean): string => {
      if (res.startsWith('{') && res.endsWith('}')) {
        const inner = res.slice(1, -1);
        if (!valued) return `{${transpileWhenBlocks(inner)}\n}`;
        const statements = splitKotlinPieces(inner);
        const last = statements.pop() ?? '';
        const lead = statements.map((s) => transpileWhenBlocks(s)).join('\n');
        const lastJs = transpileWhenBlocks(last, true);
        const plain = /^(?:val|var|for|while|do|throw|return)\b/.test(last);
        return `{\n${lead}\n${plain ? lastJs : `return (${lastJs})`};\n}`;
      }
      // A braceless result split over lines (`-> if (c) a` + `else b`) is joined, so the line-based if/ternary pass sees all of it.
      const js = transpileWhenBlocks(/\{|"""/.test(res) ? res : res.replace(/\s*\n\s*/g, ' '), valued);
      if (!valued || /^throw\b/.test(res)) return `{ ${js}; }`;
      return `{ return (${js}); }`;
    };
    const arms = branches
      .map(({ condition, result: res }) => (condition ? `if (${condition}) ${arm(res, isExpression)}` : arm(res, isExpression)))
      .join(' else ');
    const rewritten = isExpression ? `(() => { ${arms} })()` : arms;

    let before = code.slice(cursor, blockStart);
    result += before + rewritten;
    cursor = blockEnd;
    whenRe.lastIndex = blockEnd;
  }
  result += code.slice(cursor);
  return result;
}

/**
 * Cleans a Kotlin function parameter list into a JS parameter list, shared
 * by both the block-bodied and single-expression `fun` transforms below.
 * Handles:
 *  - stripping `val`/`var` and the `: Type` annotation
 *  - preserving a default value (`name: Type = default` -> `name = default`),
 *    which the previous version of this cleaner silently dropped, so a
 *    function with a default parameter value ran fine in real Kotlin but
 *    always received `undefined` here when called without that argument
 *  - `vararg name: Type` -> JS rest parameter `...name`, since Kotlin's
 *    vararg and a JS rest parameter behave the same way (an array of the
 *    trailing arguments) for everything this app's lessons need
 */
function cleanKotlinParams(params: string): string {
  return splitTopLevelCommas(params)
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      const varargMatch = trimmed.match(/^vararg\s+([a-zA-Z0-9_]+)/);
      if (varargMatch) return `...${varargMatch[1]}`;
      // `*` (a star projection, e.g. `v: List<*>`) is valid inside a type
      // annotation's `<...>` but wasn't in this character class -- since
      // the whole match is anchored to `$`, a type this regex can't fully
      // consume doesn't partially match, it fails to match AT ALL, so the
      // entire parameter (including its NAME) was silently dropped,
      // producing a function with no parameter at all instead of one
      // whose type was merely not stripped. See PITFALLS.md.
      const m = trimmed.match(/^(?:(?:val|var)\s+)?([a-zA-Z0-9_]+)(?:\s*:\s*[a-zA-Z0-9_<>?.*]+)?(?:\s*=\s*(.+))?$/);
      if (!m) return '';
      const [, name, defaultVal] = m;
      return defaultVal ? `${name} = ${defaultVal.trim()}` : name;
    })
    .filter(Boolean)
    .join(', ');
}

/** Finds variables initialized with mapOf/mutableMapOf so only their square
 * bracket access is translated into JavaScript Map.get/Map.set calls. */
function inferMapVars(code: string): Set<string> {
  const mapVars = new Set<string>();
  for (const line of code.split('\n')) {
    // `mutableMapOf<Int, T>()` (type arguments first), `hashMapOf(...)`, or a declared `Map<...>`/`MutableMap<...>` type.
    const match = line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)[^=]*=\s*(?:__kt_)?(?:mapOf|mutableMapOf|hashMapOf|linkedMapOf|emptyMap|HashMap|LinkedHashMap|newHashMap)\s*(?:<[^()=]*>)?\s*\(/)
      ?? line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?:Mutable)?Map\s*</);
    if (match) mapVars.add(match[1]);
    const derived = line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)[^=]*=\s*.*\.(?:groupBy|associate|associateBy|associateWith)\s*(?:\(|\{)/);
    if (derived) mapVars.add(derived[1]);
  }
  return mapVars;
}

/**
 * Finds names known to hold a MutableList -- from a `mutableListOf(...)`
 * initializer, or a declared `: MutableList<...>` type (a local/property
 * `val`/`var`, or a primary-constructor property) -- so `name += value`
 * can be rewritten to `name.add(value)` (see the `+=` handling in the
 * per-line pass below). Plain JS `+=` on an array coerces both sides to
 * strings and REASSIGNS the variable to that string (`[1] + 2` is the
 * string `"1,2"`), which is silently wrong twice over: it neither adds the
 * element nor preserves the shared-reference aliasing a `val` MutableList
 * (which cannot itself be reassigned) actually has in Kotlin.
 */
/** Names of list / array variables -- declared with a list or array factory, typed List / Array / IntArray,
 * taken as a parameter or vararg, or derived from another such name (`val top = scores.sorted()`). Their
 * `name[i]` reads and writes are bounds-checked, as Kotlin does. */
function inferIndexedVars(code: string): Set<string> {
  const names = new Set<string>();
  const factory = String.raw`(?:__kt_)?(?:arrayOf|intArrayOf|doubleArrayOf|longArrayOf|booleanArrayOf|charArrayOf|listOf|mutableListOf|arrayListOf|emptyList|listOfNotNull)\s*(?:<[^>]*>)?\s*\(`;
  const declared = new RegExp(String.raw`\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::[^=]*)?=\s*${factory}`);
  const sized = /\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::[^=]*)?=\s*(?:IntArray|DoubleArray|LongArray|BooleanArray|CharArray)\s*\(/;
  const typed = /(?:\b(?:val|var)\s+|[(,]\s*(?:vararg\s+)?)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?:(?:Mutable)?List<|Array<|IntArray\b|DoubleArray\b|LongArray\b|BooleanArray\b|CharArray\b)/g;
  const vararg = /\bvararg\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
  const lines = code.split('\n');
  for (const line of lines) {
    const a = line.match(declared); if (a) names.add(a[1]);
    const b = line.match(sized); if (b) names.add(b[1]);
    for (const m of line.matchAll(typed)) names.add(m[1]);
    for (const m of line.matchAll(vararg)) names.add(m[1]);
  }
  const derived = /\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::[^=]*)?=\s*([a-zA-Z_][a-zA-Z0-9_]*)\.(?:sorted|sortedDescending|sortedBy|sortedByDescending|reversed|filter|filterNot|map|take|drop|distinct|toList|toMutableList|plus|minus|subList|slice)\b/;
  for (let pass = 0; pass < 3; pass++) {
    for (const line of lines) {
      const m = line.match(derived);
      if (m && names.has(m[2])) names.add(m[1]);
    }
  }
  return names;
}

/** Mutable sets (`mutableSetOf`, `hashSetOf`, `MutableSet<>`) -- for `set += x` / `set -= x`. */
function inferMutableSetVars(code: string): Set<string> {
  const names = new Set<string>();
  for (const line of code.split('\n')) {
    const init = line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)[^=]*=\s*(?:__kt_)?(?:mutableSetOf|hashSetOf|linkedSetOf)\s*(?:<[^>]*>)?\s*\(/);
    if (init) names.add(init[1]);
    for (const m of line.matchAll(/(?:\b(?:val|var)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*MutableSet</g)) names.add(m[1]);
  }
  return names;
}

/** `var xs = listOf(...)` / `var xs: List<...>` -- a read-only list held in a var: `xs += x` reassigns it to a new list. */
function inferVarReadOnlyLists(code: string): Set<string> {
  const names = new Set<string>();
  for (const line of code.split('\n')) {
    const init = line.match(/\bvar\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*List<[^=]*)?=\s*(?:__kt_)?(?:listOf|emptyList)\s*(?:<[^>]*>)?\s*\(/);
    if (init) names.add(init[1]);
    const typed = line.match(/\bvar\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*List</);
    if (typed) names.add(typed[1]);
  }
  return names;
}

/** Index of the `]` matching the `[` at `open` (respecting nesting and strings); -1 if none. */
function matchingBracket(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === '\\') i++; continue; }
    if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return i;
  }
  return -1;
}

/**
 * Rewrites `name[i]` for a known list/array variable into bounds-checked helpers:
 *   name[i]            -> __kt_at(name, i)
 *   name[i] = v        -> __kt_setAt(name, i, v)
 *   name[i] += v       -> __kt_setAt(name, i, __kt_at(name, i) + (v))    (also -=, *=, %=)
 *   name[i]++ / --     -> __kt_setAt(name, i, __kt_at(name, i) + 1)      (as a statement)
 * Member access (`obj.name[i]`) and text inside string literals are left alone.
 */
/** `listOf(1, 2, 3)[5]` / `arrayOf(...)[i]`: indexing a list literal directly is bounds-checked like any other list access. */
function rewriteLiteralIndexing(line: string): string {
  const re = /\b(listOf|mutableListOf|arrayOf)\s*\(/g;
  let out = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  const closing = (text: string, open: number, pair: string): number => {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"' || ch === "'") { for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === '\\') i++; continue; }
      if (ch === pair[0]) depth++;
      else if (ch === pair[1] && --depth === 0) return i;
    }
    return -1;
  };
  while ((m = re.exec(line)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = closing(line, open, '()');
    if (close < 0 || line[close + 1] !== '[') continue;
    const end = closing(line, close + 1, '[]');
    if (end < 0) continue;
    out += line.slice(cursor, m.index) + `__kt_at(${line.slice(m.index, close + 1)}, ${line.slice(close + 2, end)})`;
    cursor = end + 1;
    re.lastIndex = end + 1;
  }
  return out + line.slice(cursor);
}

/** Variables whose class declares `operator fun get` / `set`: `m[0, 1]` calls them. Read from the source before modifiers are stripped. */
function inferOperatorIndexVars(code: string): Set<string> {
  const classes = new Set<string>();
  const re = /\bclass\s+([A-Za-z_]\w*)[^{\n]*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 1, i = open + 1;
    for (; i < code.length && depth > 0; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') depth--; }
    if (/\boperator\s+fun\s+(?:get|set)\b/.test(code.slice(open, i))) classes.add(m[1]);
  }
  const names = new Set<string>();
  for (const cls of classes) {
    for (const v of code.matchAll(new RegExp(`\\b(?:val|var)\\s+([A-Za-z_]\\w*)\\s*(?::\\s*${cls})?\\s*=\\s*${cls}\\s*\\(`, 'g'))) names.add(v[1]);
    for (const v of code.matchAll(new RegExp(`\\b([A-Za-z_]\\w*)\\s*:\\s*${cls}\\b`, 'g'))) names.add(v[1]);
  }
  return names;
}

function rewriteIndexAccess(line: string, names: Set<string>, mode: 'list' | 'map' | 'operator' = 'list'): string {
  for (const name of names) {
    // `this.items[i]` too: inside a class, a property is reached through `this.` after the OOP pass.
    const re = new RegExp(String.raw`(?<![\w.$])((?:this\.)?)${name}\s*\[`, 'g');
    let match: RegExpExecArray | null;
    let searchFrom = 0;
    while ((match = re.exec(line)) !== null) {
      if (match.index < searchFrom) continue;
      if (findStringRanges(line).some(([from, to]) => match!.index > from && match!.index < to)) continue;
      const target = `${match[1]}${name}`;
      const open = match.index + match[0].length - 1;
      const close = matchingBracket(line, open);
      if (close < 0) break;
      // the index and an assigned value may themselves index a collection (`m[k] = (m[k] ?: 0) + 1`, `menu[names[i]]`)
      const index = rewriteIndexAccess(line.slice(open + 1, close).trim(), names, mode);
      const rest = line.slice(close + 1);
      const assign = rest.match(/^\s*(=|\+=|-=|\*=|%=)(?!=)\s*/);
      const step = rest.match(/^\s*(\+\+|--)/);
      let replacement: string; let end: number;
      if (assign) {
        const valueStart = close + 1 + assign[0].length;
        let valueEnd = valueStart;
        for (let depth = 0; valueEnd < line.length; valueEnd++) {
          const ch = line[valueEnd];
          if (ch === '"' || ch === "'") { for (valueEnd++; valueEnd < line.length && line[valueEnd] !== ch; valueEnd++) if (line[valueEnd] === '\\') valueEnd++; continue; }
          if ('([{'.includes(ch)) depth++;
          else if (')]}'.includes(ch)) { if (depth === 0) break; depth--; }
          else if (ch === ';' && depth === 0) break;
        }
        const value = rewriteIndexAccess(line.slice(valueStart, valueEnd).trim(), names, mode);
        replacement = mode === 'map' || mode === 'operator'
          ? (assign[1] === '=' ? `${target}.set(${index}, ${value})` : `${target}.set(${index}, ${target}.get(${index}) ${assign[1][0]} (${value}))`)
          : (assign[1] === '=' ? `__kt_setAt(${target}, ${index}, ${value})` : `__kt_setAt(${target}, ${index}, __kt_at(${target}, ${index}) ${assign[1][0]} (${value}))`);
        end = valueEnd;
      } else if (step) {
        replacement = mode === 'map' || mode === 'operator'
          ? `${target}.set(${index}, ${target}.get(${index}) ${step[1][0]} 1)`
          : `__kt_setAt(${target}, ${index}, __kt_at(${target}, ${index}) ${step[1][0]} 1)`;
        end = close + 1 + step[0].length;
      } else {
        replacement = mode === 'map' || mode === 'operator' ? `${target}.get(${index})` : `__kt_at(${target}, ${index})`;
        end = close + 1;
      }
      line = line.slice(0, match.index) + replacement + line.slice(end);
      searchFrom = match.index + replacement.length;
      re.lastIndex = searchFrom;
    }
  }
  return line;
}

/**
 * Compile-time error Kotlin reports when a READ-ONLY collection is mutated:
 * `val names = listOf("A"); names.add("B")` is "Unresolved reference: add" (List has no add), and
 * `map["k"] = v` on a Map is "No set method providing array access". Without this the simulator failed with
 * the JavaScript message "names.add is not a function". A name is only judged when EVERY declaration of it
 * in the program (val/var, parameter) is read-only, so the same name reused mutably elsewhere is never flagged.
 */
function checkReadOnlyCollectionMutation(code: string): KotlinDiagnostic | null {
  const lines = code.split('\n').map((raw) => {
    const noComment = raw.replace(/\/\/.*$/, '');
    return noComment.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'(?:[^'\\]|\\.)'/g, "''");
  });
  const readOnlyFactory = /\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::[^=]*)?=\s*(?:listOf|setOf|mapOf|emptyList|emptySet|emptyMap|listOfNotNull)\s*(?:<[^>]*>)?\s*\(/;
  const readOnlyTyped = /(?:\b(?:val|var)\s+|[(,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?:List|Set|Map|Collection)</g;
  const anyDeclaration = /(?:\b(?:val|var)\s+|[(,]\s*(?:vararg\s+)?|\bfor\s*\(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::|=|\s+in\b)/g;
  const readOnly = new Map<string, 'list' | 'map'>();
  const declarations = new Map<string, number>();
  const readOnlyDeclarations = new Map<string, number>();
  for (const line of lines) {
    for (const m of line.matchAll(anyDeclaration)) declarations.set(m[1], (declarations.get(m[1]) ?? 0) + 1);
    const factory = line.match(readOnlyFactory);
    if (factory) { readOnlyDeclarations.set(factory[1], (readOnlyDeclarations.get(factory[1]) ?? 0) + 1); readOnly.set(factory[1], /mapOf|emptyMap/.test(line) ? 'map' : 'list'); }
    for (const m of line.matchAll(readOnlyTyped)) { readOnlyDeclarations.set(m[1], (readOnlyDeclarations.get(m[1]) ?? 0) + 1); readOnly.set(m[1], /Map</.test(line.slice(m.index ?? 0, (m.index ?? 0) + m[0].length + 4)) ? 'map' : 'list'); }
  }
  const mutating = ['add', 'addAll', 'remove', 'removeAt', 'removeAll', 'clear', 'put', 'putAll', 'set', 'sort', 'sortDescending', 'retainAll'];
  for (const [name, kind] of readOnly) {
    if ((readOnlyDeclarations.get(name) ?? 0) < (declarations.get(name) ?? 0)) continue;
    const call = new RegExp(String.raw`(?<![\w.])${name}\s*\.\s*(${mutating.join('|')})\s*\(`);
    const store = new RegExp(String.raw`(?<![\w.])${name}\s*\[[^\]]*\]\s*(?:=|\+=|-=|\*=)(?!=)`);
    for (let i = 0; i < lines.length; i++) {
      const c = lines[i].match(call);
      if (c) return { message: `Unresolved reference: ${c[1]}`, line: i + 1, type: 'compiler_error' };
      if (store.test(lines[i])) return { message: 'No set method providing array access', line: i + 1, type: 'compiler_error' };
    }
    void kind;
  }
  return null;
}

function inferMutableListVars(code: string): Set<string> {
  const names = new Set<string>();
  for (const line of code.split('\n')) {
    const initMatch = line.match(/\b(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)[^=]*=\s*(?:__kt_)?(?:mutableListOf|newArrayList|arrayListOf)\s*(?:<[^>]*>)?\s*\(/);
    if (initMatch) names.add(initMatch[1]);
    const typeMatch = line.matchAll(/(?:\b(?:val|var)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*MutableList</g);
    for (const m of typeMatch) names.add(m[1]);
  }
  return names;
}

/**
 * Strips modifier keywords (visibility, `open`, `abstract`, `override`) that
 * precede a declaration keyword. None of these affect runtime behavior in
 * this simplified simulator -- there is no real access control, and `open`/
 * `override` only matter to Kotlin's compile-time inheritance checks, which
 * this engine doesn't perform. Scoped to fire only when immediately
 * followed by `class`/`val`/`var`/`fun`/`constructor`, so an ordinary
 * printed sentence containing one of these words (e.g. "this is private")
 * is never touched.
 */
function stripModifierKeywords(code: string): string {
  return code.replace(
    /\b(?:(?:private|public|protected|internal|open|abstract|override|const|lateinit)\s+)+(?=(?:class|val|var|fun|constructor)\b)/g,
    ''
  );
}

/**
 * Members an abstract class or interface declares (abstract functions/properties, interface defaults) and each class's supertypes, read
 * from the ORIGINAL source before modifiers and abstract declarations are stripped. A subclass or implementer reaches them bare
 * (`name()`, `$sides`), so they join its member set: methods as `name()`, properties as `name`.
 */
interface InheritedMembers { members: Map<string, Set<string>>; supers: Map<string, string[]> }
function collectInheritedMembers(code: string): InheritedMembers {
  const members = new Map<string, Set<string>>();
  const supers = new Map<string, string[]>();
  const re = /\b((?:abstract\s+|open\s+|sealed\s+|data\s+)*(?:class|interface))\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*<[^>{}]+>)?([^{\n]*)(\{)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const [, kind, name, tail, brace] = m;
    const clause = /:\s*(.+)$/.exec(tail.replace(/\((?:[^()]|\([^()]*\))*\)/g, ''));
    supers.set(name, clause ? clause[1].split(',').map((t) => t.trim().replace(/<.*$/, '').replace(/\s+by\s+.*$/, '')).filter(Boolean) : []);
    if (!brace) continue;
    const open = m.index + m[0].length - 1;
    let depth = 1, i = open + 1;
    for (; i < code.length && depth > 0; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') depth--; }
    const names = new Set<string>();
    let level = 0;
    for (const line of code.slice(open + 1, i - 1).split('\n')) {
      if (level === 0) {
        const fn = /^\s*(?:(?:abstract|open|override|private|protected|internal|public)\s+)*fun\s+(?:<[^>]*>\s*)?([A-Za-z_]\w*)/.exec(line);
        const prop = /^\s*(?:(?:abstract|open|override|private|protected|internal|public)\s+)*(?:val|var)\s+([A-Za-z_]\w*)/.exec(line);
        if (fn && (kind.includes('interface') || /\babstract\b/.test(line) || true)) names.add(`${fn[1]}()`);
        if (prop && (kind.includes('interface') || /\babstract\b/.test(line))) names.add(prop[1]);
      }
      level += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
    }
    members.set(name, names);
  }
  return { members, supers };
}
/** Everything a class inherits from its (transitive) abstract/interface supertypes. */
function inheritedNamesOf(info: InheritedMembers, className: string, seen = new Set<string>()): Set<string> {
  const out = new Set<string>();
  for (const superType of [className, ...(info.supers.get(className) ?? [])]) {
    if (seen.has(superType)) continue;
    seen.add(superType);
    for (const n of info.members.get(superType) ?? []) out.add(n);
    if (superType !== className) for (const n of inheritedNamesOf(info, superType, seen)) out.add(n);
  }
  return out;
}

function stripAbstractMemberDeclarations(code: string): string {
  return code.replace(/^\s*abstract\s+fun\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*(?::\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*)?\s*$/gm, '');
}

/**
 * Splits a class/object body into top-level "members" (a property, a
 * method, or an init block), each represented as its own array of source
 * lines. Depth-aware so a member's own nested braces (an if-block inside a
 * method, for instance) don't prematurely end it. Deliberately requires
 * every member header (`fun foo(...) {`, `init {`, `val x: Int = ...`) to
 * start on its own line -- a header that wraps across multiple lines
 * before its opening brace is NOT supported, since no lesson content
 * authored against this engine needs it.
 */
function splitClassMembers(bodyLines: string[]): string[][] {
  const members: string[][] = [];
  let current: string[] = [];
  let depth = 0;
  for (const line of bodyLines) {
    const trimmed = line.trim();
    const opensNewMember = depth === 0 && current.length > 0 && /^(val|var|fun|init|constructor)\b/.test(trimmed);
    if (opensNewMember) {
      members.push(current);
      current = [];
    }
    current.push(line);
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
  }
  if (current.length) members.push(current);
  return members.filter((m) => m.some((l) => l.trim().length > 0));
}

/** Parses a Kotlin primary-constructor/enum-constructor parameter list into
 * structured info: which params are actual properties (`val`/`var`), their
 * names, and any default value. Reuses the same shape `cleanKotlinParams`
 * targets but keeps the property/name/default split explicit, since class
 * construction needs to know which params also become `this.x` fields. */
/** Splits a parameter list at the commas that are not inside (), [], {} or <> (a type such as `Map<String, Int>`). */
function splitParamList(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([{<'.includes(ch)) depth++;
    else if (')]}'.includes(ch) || (ch === '>' && text[i - 1] !== '-')) depth--;
    if (ch === ',' && depth === 0) { parts.push(current); current = ''; } else current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function parseConstructorParams(paramsRaw: string): { name: string; isProperty: boolean; default?: string; type?: string }[] {
  return splitParamList(paramsRaw)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(?:(val|var)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*([a-zA-Z0-9_<>?,\s]+?))?(?:\s*=\s*(.+))?$/);
      if (!m) return { name: p, isProperty: false };
      return { name: m[2], isProperty: !!m[1], type: m[3]?.trim(), default: m[4]?.trim() };
    });
}

/** Renders a constructor's JS parameter list from parsed constructor params. */
function renderCtorParams(params: { name: string; default?: string }[]): string {
  return params.map((p) => (p.default ? `${p.name} = ${p.default}` : p.name)).join(', ');
}

/**
 * Converts one class/object body member's raw source lines into JS.
 * - `init { ... }` -> its inner lines are returned as `ctorLines` (spliced
 *   directly into the generated constructor, in source order).
 * - a property with an initializer (`val x: Int = expr`) -> also becomes a
 *   `ctorLines` entry (`this.x = expr;`), NOT a JS class-field declaration
 *   -- a class-field initializer can't see constructor parameters, but a
 *   Kotlin property initializer can, so constructor-body assignment is the
 *   only form that supports both.
 * - a property with no initializer (`val x: Int`) -> produces nothing; it
 *   exists only so a later `init` block's `this.x = x` has somewhere to
 *   assign, which needs no JS declaration at all.
 * - a method (`fun name(...) { ... }` or `fun name(...) = expr`) -> becomes
 *   a JS method, appended to `methodLines`. Single-expression form is
 *   single-line only, matching the same limitation as top-level functions.
 */
function splitCodeAndStrings(line: string): Array<{ text: string; isString: boolean }> {
  const chunks: Array<{ text: string; isString: boolean }> = [];
  const strRe = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = strRe.exec(line)) !== null) {
    if (match.index > lastIdx) {
      chunks.push({ text: line.slice(lastIdx, match.index), isString: false });
    }
    chunks.push({ text: match[0], isString: true });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < line.length) {
    chunks.push({ text: line.slice(lastIdx), isString: false });
  }
  return chunks;
}

/**
 * Turns a `lazy { ... }` block's raw body text into a JS function body that
 * `return`s its Kotlin last-expression value -- Kotlin lambda blocks are
 * implicitly value-returning on their last statement; JS requires an
 * explicit `return`. Splits on both real newlines and a `;`-joined single
 * line (`lazy{println("build");7}` is valid, common Kotlin), since either
 * form is just "a list of statements" once separated -- naive on a literal
 * `;` inside a string, but no lesson content puts one there.
 */
function wrapLazyBlockBody(rawBody: string): string {
  const statements = rawBody
    .split('\n')
    .flatMap((line) => line.split(';'))
    .map((s) => s.trim())
    .filter(Boolean);
  if (statements.length === 0) return '';
  const last = statements.pop()!;
  return [...statements.map((s) => `${s};`), `return (${last});`].join('\n');
}

/**
 * The members a class or object body declares at its own level (brace depth 0), never a method's locals: each `val`/`var` by
 * name, and each method as `name()` (rewritten only where it is called, see rewriteClassPropertyAccess).
 */
function topLevelMemberProperties(bodyLines: string[]): string[] {
  const names: string[] = [];
  let depth = 0;
  for (const line of bodyLines) {
    const pm = line.trim().match(/^(?:(?:private|protected|internal|public|open|override|lateinit|const)\s+)*(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (pm && depth === 0) names.push(pm[1]);
    const fm = line.trim().match(/^(?:(?:private|protected|internal|public|open|override|abstract|final|suspend|inline|operator|infix)\s+)*fun\s+(?:<[^>]*>\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\s*[(<]/);
    if (fm && depth === 0) names.push(`${fm[1]}()`);
    const bare = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '');
    depth += (bare.match(/\{/g) ?? []).length - (bare.match(/\}/g) ?? []).length;
  }
  return names;
}

/** Replaces each `${...}` placeholder (not `\${`) with `render(expression)`, matching nested braces (`${xs.map { it.name }}`). */
function replaceTemplatePlaceholders(text: string, render: (expression: string) => string): string {
  let out = '';
  let i = 0;
  for (let start = text.indexOf('${'); start >= 0; start = text.indexOf('${', i)) {
    if (start > 0 && text[start - 1] === '\\') {
      out += text.slice(i, start + 2);
      i = start + 2;
      continue;
    }
    let depth = 1, end = start + 2;
    for (; end < text.length && depth > 0; end++) {
      if (text[end] === '{') depth++;
      else if (text[end] === '}') depth--;
    }
    if (depth !== 0) break;
    out += text.slice(i, start) + render(text.slice(start + 2, end - 1));
    i = end;
  }
  return out + text.slice(i);
}

function rewriteClassPropertyAccess(lines: string[], classProps: Set<string>, paramNames: Set<string>, prefix = 'this.'): string[] {
  const localVars = new Set<string>();
  const rewriteCode = (text: string): string => {
    for (const member of classProps) {
      const isMethod = member.endsWith('()');
      const prop = isMethod ? member.slice(0, -2) : member;
      if (paramNames.has(prop) || localVars.has(prop)) continue;
      // a method only where it is called (`total()`, `wrap { }`), so a same-named loop variable or parameter is left alone
      text = text.replace(new RegExp(`(?<![.\\w:])(${prop})${isMethod ? '(?=\\s*[({])' : '(?![\\w])'}`, 'g'), (m, name, offset, str) => {
        const before = str.slice(0, offset).trimEnd();
        // Skip a property-declaration target (`val`/`var name`, already
        // handled) AND a function being DECLARED with this same name
        // (`fun name(...)`) -- a class body can legitimately have a
        // method whose name matches an in-scope property name (an inner
        // class's own method named the same as an outer property it
        // reads, for instance); rewriting the declaration itself would
        // corrupt it into `fun this.propName(...)`, not a call site.
        if (before.endsWith('.') || /(?:val|var|fun)$/.test(before)) return m;
        return `${prefix}${name}`;
      });
    }
    return text;
  };
  return lines.map((line) => {
    const declMatch = line.match(/\b(?:val|var)\s+([a-zA-Z0-9_]+)/);
    if (declMatch) {
      localVars.add(declMatch[1]);
    }
    const chunks = splitCodeAndStrings(line);
    for (const chunk of chunks) {
      if (chunk.isString) {
        // `${acct.bump(1)}` is code: rewrite the property names inside it like any other code.
        chunk.text = replaceTemplatePlaceholders(chunk.text, (expr) => `\${${rewriteCode(expr)}}`);
        for (const prop of classProps) {
          if (prop.endsWith('()') || paramNames.has(prop) || localVars.has(prop)) continue;
          chunk.text = chunk.text.replace(new RegExp(`\\$${prop}(?![\\w])`, 'g'), `\${${prefix}${prop}}`);
        }
        continue;
      }
      chunk.text = rewriteCode(chunk.text);
    }
    return chunks.map((c) => c.text).join('');
  });
}

function transpileClassMember(rawMemberLines: string[], classProps: Set<string> = new Set(), ctorParamNames: Set<string> = new Set()): { ctorLines: string[]; methodLines: string[] } {
  // Trailing blank lines are an artifact of how `splitClassMembers` divides
  // the body text (a blank line right before the class's own closing brace
  // gets attached to the last member) -- strip them so a genuinely
  // single-line member (a property or a single-expression fun) is still
  // recognized as such, rather than looking like a multi-line member.
  const memberLines = [...rawMemberLines];
  while (memberLines.length > 1 && memberLines[memberLines.length - 1].trim() === '') {
    memberLines.pop();
  }
  // `private set` (or `protected`/`internal set`) directly below a
  // property header restricts who may assign it -- compile-time-only
  // visibility metadata with no runtime effect in this simulator (same
  // rationale as `stripModifierKeywords` above), so once it's confirmed to
  // be the harmless trailing line it always is here, drop it and let the
  // property header behind it be classified as if it were a plain,
  // single-line property.
  while (
    memberLines.length > 1 &&
    /^(?:private|protected|internal)\s+set\s*;?$/.test(memberLines[memberLines.length - 1].trim())
  ) {
    memberLines.pop();
  }
  const header = memberLines[0].trim();

  // `var name: Type` with no initializer (lateinit, or assigned in `init`): the field exists, unset
  const bareProperty = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?![^=]*\bby\b)[^=]+$/);
  if (bareProperty && memberLines.length === 1) return { ctorLines: [`this.${bareProperty[1]} = undefined;`], methodLines: [] };

  // A property whose initializer spans several lines once lowered (`val data = Array(n) { IntArray(m) }`): one assignment in the constructor.
  const multiLineProperty = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[^=]+?)?\s*=\s*(.*)$/);
  if (multiLineProperty && memberLines.length > 1 && !/^\s*(?:get|set)\s*\(/.test(memberLines[1])) {
    const expression = [multiLineProperty[2], ...memberLines.slice(1)].join('\n');
    return { ctorLines: [`this.${multiLineProperty[1]} = ${rewriteClassPropertyAccess([expression], classProps, ctorParamNames)[0]};`], methodLines: [] };
  }

  // A property with a custom setter and/or a backing `field` (`var celsius = 0.0` + `set(value) { field = ... }`): stored in a hidden
  // `__f_name` field behind a real JS getter/setter pair, so every `obj.name` read and write goes through the accessors.
  const accessorHeader = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[^=]+?)?\s*(?:=\s*(.+))?$/);
  if (accessorHeader && memberLines.length > 1) {
    const rest = memberLines.slice(1).join('\n');
    const hasSetter = /^\s*set\s*\(/m.test(rest);
    const initializer = accessorHeader[2];
    if (hasSetter || (initializer !== undefined && /^\s*get\s*\(/m.test(rest))) {
      const name = accessorHeader[1];
      const field = `this.__f_${name}`;
      const accessors: { kind: 'get' | 'set'; param?: string; expr?: string; block?: string }[] = [];
      const re = /\b(get\s*\(\s*\)|set\s*\(\s*(\w*)\s*\))\s*(?:=\s*([^\n]+)|\{)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(rest)) !== null) {
        const kind = m[1].startsWith('get') ? 'get' : 'set';
        if (m[3] !== undefined) { accessors.push({ kind, param: m[2], expr: m[3].trim() }); continue; }
        const open = m.index + m[0].length - 1;
        let depth = 1, i = open + 1;
        for (; i < rest.length && depth > 0; i++) { if (rest[i] === '{') depth++; else if (rest[i] === '}') depth--; }
        accessors.push({ kind, param: m[2], block: rest.slice(open + 1, i - 1) });
        re.lastIndex = i;
      }
      const body = (a: { expr?: string; block?: string }, params: Set<string>) => rewriteClassPropertyAccess((a.block ?? a.expr ?? '').replace(/\bfield\b/g, field).split('\n'), classProps, params);
      const getter = accessors.find((a) => a.kind === 'get');
      const setter = accessors.find((a) => a.kind === 'set');
      const methodLines: string[] = [];
      if (getter?.block !== undefined) methodLines.push(`  get ${name}() {`, ...body(getter, new Set()), '  }');
      else methodLines.push(`  get ${name}() { return ${getter?.expr !== undefined ? body(getter, new Set())[0] : field}; }`);
      if (setter) methodLines.push(`  set ${name}(${setter.param || 'value'}) {`, ...(setter.block !== undefined ? body(setter, new Set([setter.param || 'value'])) : [`${field} = ${body(setter, new Set([setter.param || 'value'])).join('\n')};`]), '  }');
      else if (header.startsWith('var')) methodLines.push(`  set ${name}(value) { ${field} = value; }`);
      return { ctorLines: initializer !== undefined ? [`${field} = ${rewriteClassPropertyAccess([initializer], classProps, ctorParamNames)[0]};`] : [], methodLines };
    }
  }

  const getterProp = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*:\s*[a-zA-Z0-9_<>?,\s]+?)?\s+get\(\)\s*=\s*(.+)$/);
  if (getterProp && memberLines.length === 1) {
    const [, name, expr] = getterProp;
    const rewrittenExpr = rewriteClassPropertyAccess([expr], classProps, new Set())[0];
    return { ctorLines: [], methodLines: [`  get ${name}() { return ${rewrittenExpr}; }`] };
  }

  // `val name[: Type] by lazy { ... }` -- computes once on first access and
  // caches the result, backed by two hidden instance fields (a `computed`
  // flag and the cached value) checked/set from a real JS getter, so every
  // subsequent `instance.name` read (no parens, matching how Kotlin itself
  // reads it) is free after the first. Two shapes: the block spans several
  // lines (closing `}` alone on its own trailing line), or the whole thing
  // -- header and block -- sits on one line.
  const lazyPropBlock = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[a-zA-Z0-9_<>?,\s]+)?\s+by\s+lazy\s*\{\s*$/);
  if (lazyPropBlock && memberLines.length > 1 && memberLines[memberLines.length - 1].trim() === '}') {
    const [, name] = lazyPropBlock;
    const inner = rewriteClassPropertyAccess(memberLines.slice(1, -1), classProps, new Set());
    const wrapped = wrapLazyBlockBody(inner.join('\n'));
    return { ctorLines: [], methodLines: [
      `  get ${name}() {`,
      `    if (!this.__kt_lazy_computed_${name}) {`,
      `      this.__kt_lazy_computed_${name} = true;`,
      `      this.__kt_lazy_value_${name} = (() => {`,
      ...wrapped.split('\n'),
      `      })();`,
      `    }`,
      `    return this.__kt_lazy_value_${name};`,
      `  }`,
    ] };
  }
  const lazyPropSingleLine = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[a-zA-Z0-9_<>?,\s]+)?\s+by\s+lazy\s*\{(.*)\}\s*$/);
  if (lazyPropSingleLine && memberLines.length === 1) {
    const [, name, block] = lazyPropSingleLine;
    const rewrittenBlock = rewriteClassPropertyAccess([block], classProps, new Set())[0];
    const wrapped = wrapLazyBlockBody(rewrittenBlock);
    return { ctorLines: [], methodLines: [
      `  get ${name}() {`,
      `    if (!this.__kt_lazy_computed_${name}) {`,
      `      this.__kt_lazy_computed_${name} = true;`,
      `      this.__kt_lazy_value_${name} = (() => { ${wrapped.replace(/\n/g, ' ')} })();`,
      `    }`,
      `    return this.__kt_lazy_value_${name};`,
      `  }`,
    ] };
  }

  // `val name: Type` on its own line, followed by a separate `get() {
  // ...block body with an explicit return... }` -- a class-member custom
  // getter that (unlike `getterProp` above) is not a single expression.
  // The body's own `return` statement is kept as-is (no implicit
  // last-expression wrapping needed, unlike a `lazy` block).
  const blockGetterHeader = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*[a-zA-Z0-9_<>?,\s]+$/);
  if (blockGetterHeader && memberLines.length > 1) {
    const rest = memberLines.slice(1).join('\n');
    // The getter can also be a single expression on the line below the header: `val area: Int` / `get() = w * h`.
    const exprGetterBody = rest.match(/^\s*get\(\)\s*=\s*([^\n]+?)\s*$/);
    if (exprGetterBody) {
      const [, name] = blockGetterHeader;
      const expr = rewriteClassPropertyAccess([exprGetterBody[1]], classProps, new Set())[0];
      return { ctorLines: [], methodLines: [`  get ${name}() { return ${expr}; }`] };
    }
    const blockGetterBody = rest.match(/^\s*get\(\)\s*\{([\s\S]*)\}\s*$/);
    if (blockGetterBody) {
      const [, name] = blockGetterHeader;
      const inner = rewriteClassPropertyAccess(blockGetterBody[1].split('\n'), classProps, new Set());
      return { ctorLines: [], methodLines: [`  get ${name}() {`, ...inner, '  }'] };
    }
  }

  if (/^init\b/.test(header)) {
    const inner = memberLines.slice(0, -1).join('\n').replace(/^\s*init\s*\{/, '').split('\n');
    // Drop the header's own `init {` remnant on the first line, and the
    // lone closing `}` this member ends with.
    const first = inner[0] ?? '';
    const rest = inner.slice(1);
    const cleanedFirst = first.replace(/^.*init\s*\{/, '');
    // A bare property name in an init block (`println("d " + d)`) is that property, but a constructor parameter of the
    // same name (`this.x = x`) is the parameter, so parameters are excluded from the rewrite.
    const initBody = rewriteClassPropertyAccess([cleanedFirst, ...rest], classProps, ctorParamNames);
    return { ctorLines: initBody.filter((l) => l.trim().length > 0), methodLines: [] };
  }

  const propMatch = header.match(/^(?:val|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[a-zA-Z0-9_<>?,\s]+)?(?:\s*=\s*(.+))?$/);
  if (propMatch && memberLines.length === 1) {
    const [, name, initExpr] = propMatch;
    // An initializer can read an earlier body property by its bare name (`val b = a + 1`); constructor parameters stay bare.
    const expr = initExpr ? rewriteClassPropertyAccess([initExpr], classProps, ctorParamNames)[0] : undefined;
    return { ctorLines: expr ? [`this.${name} = ${expr};`] : [], methodLines: [] };
  }

  const singleExprFun = header.match(/^fun\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(?:\s*:\s*[a-zA-Z0-9_<>?,\s]+)?\s*=\s*(.+)$/);
  if (singleExprFun && memberLines.length === 1) {
    const [, name, params, expr] = singleExprFun;
    const paramNames = new Set(
      params
        .split(',')
        .map((p) => p.trim().split(/[\s=:]/)[0])
        .filter(Boolean)
    );
    const rewrittenExpr = rewriteClassPropertyAccess([expr], classProps, paramNames)[0];
    return { ctorLines: [], methodLines: [`  ${name}(${cleanKotlinParams(params)}) { return ${rewrittenExpr}; }`] };
  }

  const blockFunHeader = header.match(/^fun\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(?:\s*:\s*[a-zA-Z0-9_<>?,\s]+)?\s*\{\s*$/);
  if (blockFunHeader) {
    const [, name, params] = blockFunHeader;
    const inner = memberLines.slice(1, -1);
    const paramNames = new Set(
      params
        .split(',')
        .map((p) => p.trim().split(/[\s=:]/)[0])
        .filter(Boolean)
    );
    const rewrittenInner = rewriteClassPropertyAccess(inner, classProps, paramNames);
    return { ctorLines: [], methodLines: [`  ${name}(${cleanKotlinParams(params)}) {`, ...rewrittenInner, '  }'] };
  }

  // Unrecognized member shape -- pass through verbatim rather than losing
  // it silently; this will likely surface as a JS syntax error rather than
  // a silent misbehavior, consistent with this file's stated preference.
  return { ctorLines: [], methodLines: memberLines };
}

/**
 * Replaces every `enum class Name(ctorParams)? { CONST1(args), CONST2, ... }`
 * with a plain JS object mapping each constant name to its own object,
 * carrying a `name` property (matching Kotlin's `.name`) plus any
 * constructor-declared properties, and a `toString()` returning `.name` so
 * printing/string-concatenating a constant shows its name instead of
 * "[object Object]". Deliberately does NOT support extra members after the
 * constant list (a trailing `;` followed by more properties/methods) or
 * `.values()`/`.ordinal` -- out of scope for what this world's lessons need.
 */
/** `var x: T by Delegates.observable(init) { _, old, new -> body }` and `Delegates.vetoable` become a plain property with a custom setter
 * (`var x: T = init` + `set(value) { ... field = value }`), which the class pass already runs. */
function transpileDelegatesObservable(code: string): string {
  const re = /\b(var)\s+([A-Za-z_]\w*)\s*(?::\s*([A-Za-z_][\w<>?, ]*?))?\s+by\s+(?:kotlin\.properties\.)?Delegates\.(observable|vetoable)\s*\(/g;
  let out = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    let i = m.index + m[0].length;
    let depth = 1;
    const argStart = i;
    for (; i < code.length && depth > 0; i++) { if (code[i] === '(') depth++; else if (code[i] === ')') depth--; }
    if (depth !== 0) continue;
    const init = code.slice(argStart, i - 1);
    const braceAt = code.indexOf('{', i);
    if (braceAt < 0 || code.slice(i, braceAt).trim() !== '') continue;
    let d = 1;
    let j = braceAt + 1;
    for (; j < code.length && d > 0; j++) { if (code[j] === '{') d++; else if (code[j] === '}') d--; }
    if (d !== 0) continue;
    const lambda = code.slice(braceAt + 1, j - 1);
    const arrow = lambda.match(/^\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*->([\s\S]*)$/);
    if (!arrow) continue;
    const [, , oldName, newName, bodyRaw] = arrow;
    const rename = (text: string) => (oldName === '_' ? text : text.replace(new RegExp(`\\b${oldName}\\b`, 'g'), '__kt_old')).replace(new RegExp(`\\b${newName}\\b`, 'g'), '__kt_new');
    const body = rename(bodyRaw.trim());
    const [, , name, type, kind] = m;
    const header = `var ${name}${type ? `: ${type}` : ''} = ${init}`;
    const setter = kind === 'observable'
      ? `    set(__kt_new) {\n        val __kt_old = field\n        field = __kt_new\n        ${body}\n    }`
      : `    set(__kt_new) {\n        val __kt_old = field\n        if (${body}) {\n            field = __kt_new\n        }\n    }`;
    out += code.slice(cursor, m.index) + header + '\n' + setter;
    cursor = j;
    re.lastIndex = j;
  }
  return out + code.slice(cursor);
}

/** An enum with member functions/properties after the constants, or constants that carry their own body
 * (`ADD("+") { override fun apply(...) }`), is rewritten into ordinary Kotlin the class/object passes already handle:
 * an open class holding the members, one subclass per constant that has a body, and an `object` holding the constants. */
function transpileRichEnums(code: string): string {
  const re = /\benum\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*\{/g;
  let out = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 1;
    let end = open + 1;
    for (; end < code.length && depth > 0; end++) {
      if (code[end] === '{') depth++;
      else if (code[end] === '}') depth--;
    }
    if (depth !== 0) continue;
    const body = code.slice(open + 1, end - 1);
    // split constants from members at the first top-level `;`
    let semi = -1;
    let d = 0;
    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch === '(' || ch === '{') d++;
      else if (ch === ')' || ch === '}') d--;
      else if (ch === ';' && d === 0) { semi = i; break; }
    }
    const constantsText = semi >= 0 ? body.slice(0, semi) : body;
    const membersText = semi >= 0 ? body.slice(semi + 1) : '';
    const hasBodies = /\)\s*\{|[A-Za-z0-9_]\s*\{/.test(constantsText);
    if (!membersText.trim() && !hasBodies) continue;
    const name = m[1];
    const ctor = (m[2] ?? '').trim();
    // constants: split at top-level commas (respecting () and {})
    const entries: string[] = [];
    let cur = '';
    d = 0;
    for (const ch of constantsText) {
      if (ch === '(' || ch === '{') d++;
      else if (ch === ')' || ch === '}') d--;
      if (ch === ',' && d === 0) { entries.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) entries.push(cur);
    const base = `${name}__Enum`;
    const names: string[] = [];
    const subclasses: string[] = [];
    const vals: string[] = [];
    entries.forEach((entry, idx) => {
      const em = entry.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([\s\S]*?)\))?\s*(?:\{([\s\S]*)\})?$/);
      if (!em) return;
      const [, constName, args = '', constBody] = em;
      names.push(constName);
      const callArgs = `${args.trim()}${args.trim() ? ', ' : ''}"${constName}", ${idx}`;
      if (constBody !== undefined) {
        subclasses.push(`class ${name}__${constName}(${ctor ? ctor.replace(/\bval\s+|\bvar\s+/g, '') + ', ' : ''}name: String, ordinal: Int) : ${base}(${ctor ? splitParamNames(ctor).join(', ') + ', ' : ''}name, ordinal) {\n${constBody}\n}`);
        vals.push(`val ${constName} = ${name}__${constName}(${callArgs})`);
      } else {
        vals.push(`val ${constName} = ${base}(${callArgs})`);
      }
    });
    // a companion object's members belong to the constants' holder object (`Planet.first()`)
    let companionBody = '';
    let membersNoCompanion = membersText;
    const cm = /\bcompanion\s+object\b(?:\s+[A-Za-z_]\w*)?\s*\{/.exec(membersText);
    if (cm) {
      let cd = 1;
      let ci = cm.index + cm[0].length;
      for (; ci < membersText.length && cd > 0; ci++) { if (membersText[ci] === '{') cd++; else if (membersText[ci] === '}') cd--; }
      if (cd === 0) {
        companionBody = membersText.slice(cm.index + cm[0].length, ci - 1);
        membersNoCompanion = membersText.slice(0, cm.index) + membersText.slice(ci);
      }
    }
    const members = membersNoCompanion.replace(/(?<![.\w])values\(\)/g, `${name}.values()`).replace(/(?<![.\w])valueOf\(/g, `${name}.valueOf(`).replace(/^[ \t]+/gm, '');
    const hasToString = /\bfun\s+toString\s*\(/.test(membersText);
    const classText =
      `class ${base}(${ctor ? ctor + ', ' : ''}val name: String, val ordinal: Int) {\n${members}\n${hasToString ? '' : 'override fun toString() = name\n'}}\n` +
      subclasses.join('\n') + (subclasses.length ? '\n' : '') +
      `object ${name} {\n${vals.join('\n')}\n${companionBody.replace(/^[ \t]+/gm, '')}\nval entries = listOf(${names.join(', ')})\nfun values() = entries\n` +
      `fun valueOf(n: String): ${base} {\nfor (e in entries) {\nif (e.name == n) return e\n}\nthrow IllegalArgumentException("No enum constant ${name}." + n)\n}\n}`;
    out += code.slice(cursor, m.index) + classText;
    cursor = end;
    re.lastIndex = end;
  }
  return out + code.slice(cursor);
}

function splitParamNames(ctor: string): string[] {
  return splitTopLevelCommas(ctor).map((p) => p.trim().replace(/^(?:(?:private|public|protected|internal)\s+)?(?:val|var)\s+/, '').split(':')[0].trim());
}

function transpileEnumClasses(code: string): string {
  return code.replace(
    /\benum\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*\{([^}]*)\}/g,
    (_whole, name, ctorParamsRaw, body) => {
      const ctorParams = ctorParamsRaw ? parseConstructorParams(ctorParamsRaw) : [];
      const entries = splitTopLevelCommas(body).map((entry: string) => entry.trim()).filter(Boolean);
      const constants = entries.map((entry: string) => {
        const m = entry.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?$/);
        if (!m) return '';
        const [, constName, argsRaw] = m;
        const args = argsRaw ? splitTopLevelCommas(argsRaw).map((a: string) => a.trim()) : [];
        const props = ctorParams.map((p, idx) => `${p.name}: ${args[idx] ?? 'undefined'}`);
        return `${constName}: { name: '${constName}', ${props.join(', ')}${props.length ? ', ' : ''}toString() { return this.name; } }`;
      });
      const names = entries.map((entry: string) => entry.match(/^([A-Za-z_][A-Za-z0-9_]*)/)?.[1]).filter(Boolean);
      // ordinal is the declaration position; values()/entries/valueOf are non-enumerable so they never show up as constants.
      return `const ${name} = (() => {\n  const __e = {\n  ${constants.join(',\n  ')}\n};\n` +
        `  [${names.map((n) => `'${n}'`).join(', ')}].forEach((k, i) => { __e[k].ordinal = i; });\n` +
        `  Object.defineProperty(__e, 'values', { value: () => __kt_listOf(...Object.values(__e)) });\n` +
        `  Object.defineProperty(__e, 'entries', { get: () => __kt_listOf(...Object.values(__e)) });\n` +
        `  Object.defineProperty(__e, 'valueOf', { value: (n) => { if (!Object.prototype.hasOwnProperty.call(__e, n)) throw new Error('No enum constant ${name}.' + n); return __e[n]; } });\n` +
        `  return __e;\n})();`;
    }
  );
}

/** Splits a comma-separated string at its TOP LEVEL only, respecting
 * nested parens -- so `NORTH(0, 1), SOUTH(0, -1)` splits into the two
 * constant entries, not four fragments broken at each inner comma. */
function splitTopLevelCommas(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/**
 * Removes every `interface Name { ... }` block entirely. JS has no runtime
 * concept of an interface -- it never checks structural conformance -- so
 * an interface declaration contributes nothing at runtime as long as every
 * implementing class actually supplies real methods (which `override fun`
 * already does). A default method BODY written directly in an interface
 * (rather than overridden by every implementer) is NOT supported -- out of
 * scope, since it would require the interface to become a real mixin.
 */
function transpileInterfaceDeclarations(code: string, inherited?: InheritedMembers): string {
  // A generic interface's type parameter list (`interface Logger<in T>`) --
  // including a variance annotation, since that's compile-time-only and
  // has no runtime representation -- sits between the name and the body;
  // the optional `(?:<[^>{}]*>)?` accounts for it so a generic interface
  // isn't left completely unmatched (and therefore un-transpiled) here.
  const re = /\binterface\s+[A-Za-z_][A-Za-z0-9_]*\s*(?:<[^>{}]*>)?\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const blockStart = match.index;
    const openBraceIdx = match.index + match[0].length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) {
      re.lastIndex = openBraceIdx + 1;
      continue;
    }
    const name = match[0].match(/interface\s+([A-Za-z_][A-Za-z0-9_]*)/)![1];
    const body = code.slice(openBraceIdx + 1, i - 1);
    const methods = [...body.matchAll(/(?:fun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)(?:\s*:\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*)?\s*=\s*([^\n}]+)|fun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*:\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*\{\s*return\s+([^;}]+)[;}]|function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{\s*return\s+([^;}]+)[;}])/g)]
      .map((method) => [method[1] ?? method[4] ?? method[7], method[2] ?? method[5] ?? method[8], method[3] ?? method[6] ?? method[9]]);
    // a default method reaches the interface's other members bare (`$sides`, `describe()`): they belong to `this`
    const own = inherited ? inheritedNamesOf(inherited, name) : new Set<string>();
    const defaultBody = (method: string[]) => rewriteClassPropertyAccess([method[2].trim()], own, new Set(splitParamList(method[1]).map((p) => p.trim().split(/[\s:]/)[0].replace(/^(?:val|var|vararg)$/, ''))))[0];
    const helper = `const __kt_interface_${name} = { ${methods.map((method) => `${method[0]}(${cleanKotlinParams(method[1])}) { return ${defaultBody(method)}; }`).join(', ')} };\n`;
    result += code.slice(cursor, blockStart) + helper;
    cursor = i;
    re.lastIndex = i;
  }
  result += code.slice(cursor);
  return result.replace(/super<([A-Za-z_][A-Za-z0-9_]*)>\.([A-Za-z_][A-Za-z0-9_]*)\(([^)]*)\)/g, '__kt_interface_$1.$2.call(this$3)');
}

/**
 * Replaces every `(data )?class Name(ctorParams)? (: Super(args)?)? { ... }`
 * declaration (body optional -- a bodyless class ending right after its
 * constructor parameter list, or after the supertype clause, is valid
 * Kotlin) with an equivalent JS class. Collects every declared class name
 * into `classNamesOut` so a later pass can insert `new` before its
 * constructor calls (Kotlin never writes `new`). See the member-level
 * helpers above for how the body itself is handled.
 */
/**
 * Anonymous objects (`val v = object : Visitor { ... }`, `register(object { ... })`): the literal becomes a named LOCAL object declared on the
 * line before its statement (so the variables in scope there stay captured) and the expression is replaced by that name.
 */
function hoistAnonymousObjects(code: string): string {
  const re = /(?<![\w.])object\s*(?::\s*([A-Za-z_]\w*)(?:\s*<[^>{}]*>)?(\s*\((?:[^()]|\([^()]*\))*\))?)?\s*\{/g;
  let out = '';
  let cursor = 0;
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    // expression position only: `val v = object ...`, `f(object ...)`, `, object ...`, `return object ...`
    const before = code.slice(0, m.index).trimEnd();
    if (!/(?:=|\(|,|\breturn)$/.test(before)) continue;
    const open = m.index + m[0].length - 1;
    let depth = 1, i = open + 1;
    for (; i < code.length && depth > 0; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') depth--; }
    if (depth !== 0) continue;
    const lineStart = code.lastIndexOf('\n', m.index) + 1;
    if (lineStart < cursor) continue;
    const indent = /^[ \t]*/.exec(code.slice(lineStart))![0];
    const name = `__KtAnon${++count}`;
    const header = `object ${name}${m[1] ? ` : ${m[1]}${m[2] ?? ''}` : ''} {`;
    out += code.slice(cursor, lineStart) + `${indent}${header}${code.slice(open + 1, i - 1)}}\n` + code.slice(lineStart, m.index) + name;
    cursor = i;
    re.lastIndex = i;
  }
  return count ? out + code.slice(cursor) : code;
}

/**
 * Secondary constructors (`constructor() : this(7)`, `constructor(a: Int) : this(a, 0) { ... }`): each becomes a top-level factory
 * `fun A__ctor1(params): A = A(delegated args).apply { body }`, and a call `A(args)` whose argument count does not fit the primary
 * constructor but fits a secondary one calls that factory. Resolution is by argument COUNT (a limit documented in PITFALLS.md).
 */
function transpileSecondaryConstructors(code: string): string {
  const classRe = /\bclass\s+([A-Za-z_]\w*)(?:\s*<[^>{}]+>)?\s*(?:\(((?:[^()]|\([^()]*\))*)\))?[^{\n]*\{/g;
  const factories = new Map<string, { name: string; min: number; max: number }[]>();
  const primary = new Map<string, { min: number; max: number }>();
  const additions: { at: number; text: string }[] = [];
  const edits: { from: number; to: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = classRe.exec(code)) !== null) {
    const className = m[1];
    const params = m[2] ? splitParamList(m[2]).filter((p) => p.trim()) : [];
    primary.set(className, { min: params.filter((p) => !/=/.test(p)).length, max: params.length });
    const open = m.index + m[0].length - 1;
    let depth = 1, i = open + 1;
    for (; i < code.length && depth > 0; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') depth--; }
    if (depth !== 0) continue;
    const body = code.slice(open + 1, i - 1);
    const ctorRe = /^[ \t]*constructor\s*\(((?:[^()]|\([^()]*\))*)\)\s*:\s*this\s*\(((?:[^()]|\([^()]*\))*)\)[ \t]*(\{)?/gm;
    let c: RegExpExecArray | null;
    let produced = '';
    while ((c = ctorRe.exec(body)) !== null) {
      let end = c.index + c[0].length;
      let ctorBody = '';
      if (c[3]) {
        let d = 1, k = end;
        for (; k < body.length && d > 0; k++) { if (body[k] === '{') d++; else if (body[k] === '}') d--; }
        ctorBody = body.slice(end, k - 1);
        end = k;
      }
      const cparams = c[1].trim() ? splitParamList(c[1]).filter((p) => p.trim()) : [];
      const index = (factories.get(className)?.length ?? 0) + 1;
      const fname = `${className}__ctor${index}`;
      if (!factories.has(className)) factories.set(className, []);
      factories.get(className)!.push({ name: fname, min: cparams.filter((p) => !/=/.test(p)).length, max: cparams.length });
      produced += `\nfun ${fname}(${c[1]}): ${className} = ${className}(${c[2]})${ctorBody.trim() ? `.apply {${ctorBody}}` : ''}\n`;
      edits.push({ from: open + 1 + c.index, to: open + 1 + end, text: '' });
    }
    if (produced) additions.push({ at: i, text: produced });
    classRe.lastIndex = open + 1;
  }
  if (!factories.size) return code;
  // remove the constructor members and insert the factories after their class, from the end backwards
  let out = code;
  const ops = [...edits, ...additions.map((a) => ({ from: a.at, to: a.at, text: a.text }))].sort((a, b) => b.from - a.from);
  for (const op of ops) out = out.slice(0, op.from) + op.text + out.slice(op.to);
  // call sites: pick the factory by argument count
  for (const [className, list] of factories) {
    const callRe = new RegExp(`(?<![\\w.])${className}\\s*\\(`, 'g');
    let result = '';
    let last = 0;
    let call: RegExpExecArray | null;
    while ((call = callRe.exec(out)) !== null) {
      if (/\b(?:class|fun)\s+$/.test(out.slice(Math.max(0, call.index - 12), call.index))) continue;
      const open = call.index + call[0].length - 1;
      let d = 1, k = open + 1;
      for (; k < out.length && d > 0; k++) { if (out[k] === '(') d++; else if (out[k] === ')') d--; }
      if (d !== 0) continue;
      const argsText = out.slice(open + 1, k - 1);
      const argCount = argsText.trim() ? splitParamList(argsText).length : 0;
      const prim = primary.get(className)!;
      if (/(?:^|,)\s*\w+\s*=(?!=)/.test(argsText)) continue; // named arguments stay with the primary constructor
      if (argCount >= prim.min && argCount <= prim.max) continue;
      const target = list.find((f) => argCount >= f.min && argCount <= f.max);
      if (target) { result += out.slice(last, call.index) + `${target.name}(`; last = call.index + call[0].length; }
    }
    out = result + out.slice(last);
  }
  return out;
}

/**
 * A member written with a one-line block body (`fun make(): Counter { created++; return Counter() }`, `init { a; b }`) is expanded onto
 * real lines: members are found line by line, and the statements of a crammed body would otherwise be read as one.
 */
function expandInlineMemberBodies(lines: string[]): string[] {
  return lines.flatMap((line) => {
    const m = /^(\s*)((?:(?:private|protected|internal|public|open|override|abstract|final|suspend|operator|inline|infix)\s+)*(?:fun\b[^{=\n]*?|init|constructor\b[^{\n]*?|set\s*\([^)]*\)|get\s*\(\s*\)))\s*\{(.*)\}\s*$/.exec(line);
    if (!m || !m[3].includes(';')) return [line];
    const statements = splitKotlinPieces(m[3]);
    return statements.length > 1 ? [`${m[1]}${m[2]} {`, ...statements.map((st) => `${m[1]}  ${st}`), `${m[1]}}`] : [line];
  });
}

function transpileClassDeclarations(code: string, classNamesOut: Set<string>, interfaceMembers: Map<string, string[]> = new Map(), inherited?: InheritedMembers): string {
  // A supertype/interface in the `: ...` clause can itself carry a generic
  // type argument (`: Logger<Any>`, `: Formatter<User>`) -- the optional
  // `(?:\s*<[^>{}]+>)?` right after each supertype name (both the first
  // and any comma-separated additional ones) accounts for it, the same way
  // the class's own type parameter list is already handled right after its
  // name. Without it, the `<...>` text is left unmatched and leaks out as
  // raw, unparseable trailing source after the class block.
  const NEST = String.raw`(?:[^()]|\([^()]*\))*`; // one level of nested parentheses: `= mutableListOf()`, `Base(listOf(1))`
  const classRe = new RegExp(String.raw`\b(data\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*<[^>{}]+>)?\s*(?:\((${NEST})\))?\s*(?:\:\s*(([A-Za-z_][A-Za-z0-9_]*)(?:\s*<[^>{}]+>)?(?:\s*\((${NEST})\))?(?:\s+by\s+[A-Za-z_][A-Za-z0-9_]*)?(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*(?:\s*<[^>{}]+>)?(?:\s*\(${NEST}\))?)*))?\s*(\{)?`, 'g');
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = classRe.exec(code)) !== null) {
    const [whole, dataFlag, className, ctorParamsRaw, supertypesRaw, superName, superArgsRaw, hasBrace] = match;
    classNamesOut.add(className);
    const blockStart = match.index;
    let blockEnd = blockStart + whole.length;
    let bodyLines: string[] = [];
    let companionName: string | undefined;
    let companionLines: string[] = [];

    if (hasBrace) {
      const openBraceIdx = blockStart + whole.length - 1;
      let depth = 1;
      let i = openBraceIdx + 1;
      for (; i < code.length && depth > 0; i++) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') depth--;
      }
      if (depth !== 0) {
        classRe.lastIndex = openBraceIdx + 1;
        continue;
      }
      blockEnd = i;
      bodyLines = expandInlineMemberBodies(code.slice(openBraceIdx + 1, i - 1).split('\n'));
      const body = bodyLines.join('\n');
      const companion = /\bcompanion\s+object(?:\s+([A-Za-z_][A-Za-z0-9_]*))?(?:\s*:\s*[A-Za-z_][A-Za-z0-9_]*)?\s*\{/.exec(body);
      if (companion && companion.index !== undefined) {
        const open = companion.index + companion[0].length - 1;
        let companionDepth = 1;
        let end = open + 1;
        for (; end < body.length && companionDepth > 0; end++) {
          if (body[end] === '{') companionDepth++;
          else if (body[end] === '}') companionDepth--;
        }
        if (companionDepth === 0) {
          companionName = companion[1];
          companionLines = expandInlineMemberBodies(body.slice(open + 1, end - 1).split('\n')).flatMap((line) => {
            // Support the compact factory form commonly used in the lesson
            // content: `fun of(x) { return Product(x) }`.
            const compact = line.match(/^(\s*fun\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)(?:\s*:\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*)?)\s*\{\s*return\s+(.+?)\s*\}\s*$/);
            return compact ? [`${compact[1]} = ${compact[2]}`] : [line];
          });
          bodyLines = (body.slice(0, companion.index) + body.slice(end)).split('\n');
        }
      }
    }

    // `: Interface by delegateExpr` (class delegation) names the
    // constructor parameter/property whose members get forwarded. Kotlin
    // retains a reference to the delegate even when it has no `val`/`var`
    // of its own (`class Wrap(p: P) : P by p`), so this simulator forces
    // one into existence below rather than requiring lesson content to
    // always write `val`/`var` on the delegate parameter.
    const delegateVar = (supertypesRaw ?? '').match(/\bby\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/)?.[1];

    const ctorParams = ctorParamsRaw ? parseConstructorParams(ctorParamsRaw) : [];
    const propertyAssignments = ctorParams.filter((p) => p.isProperty).map((p) => `    this.${p.name} = ${p.name};`);
    if (delegateVar && ctorParams.some((p) => p.name === delegateVar && !p.isProperty)) {
      propertyAssignments.push(`    this.${delegateVar} = ${delegateVar};`);
    }
    const classProps = new Set(ctorParams.filter((p) => p.isProperty).map((p) => p.name));
    if (delegateVar) classProps.add(delegateVar);
    for (const name of topLevelMemberProperties(bodyLines)) classProps.add(name);
    if (superName && superArgsRaw !== undefined) {
      for (const inheritedName of getClassOwnPropertyNames(code, superName)) classProps.add(inheritedName);
    }
    // members of abstract superclasses / implemented interfaces, reached bare (`name()`, `$sides`)
    if (inherited) for (const name of inheritedNamesOf(inherited, className)) if (!ctorParams.some((p) => p.name === name)) classProps.add(name);

    // The companion's own members are reached bare from its functions (`created++`) and from the class's instance members
    // (`BANK_NAME`): inside a static method `this` is the class, and an instance member names it explicitly.
    const companionProps = new Set(topLevelMemberProperties(companionLines));
    const members = splitClassMembers(bodyLines);
    const ctorExtraLines: string[] = [];
    const methodLines: string[] = [];
    for (const member of members) {
      const { ctorLines, methodLines: mLines0 } = transpileClassMember(member, classProps, new Set(ctorParams.map((p) => p.name)));
      // a companion member used bare in an instance member is `ClassName.member`
      const mLines = companionProps.size ? rewriteClassPropertyAccess(mLines0, new Set([...companionProps].filter((n) => !classProps.has(n))), new Set(ctorParams.map((p) => p.name)), `${className}.`) : mLines0;
      ctorExtraLines.push(...ctorLines.map((l) => `    ${l}`));
      methodLines.push(...mLines);
    }

    const companionStaticLines: string[] = [];
    for (const rawMember of splitClassMembers(companionLines)) {
      // A companion body that spans multiple SOURCE lines (the `{`/`}` on
      // their own lines, as a multi-line companion naturally reads) leaves
      // a trailing blank line attached to its last real member -- the same
      // `splitClassMembers` artifact `transpileClassMember` itself trims
      // for a class's own members. Trim it here too so a genuinely
      // single-line member (`const val X = 4`) is still recognized as one
      // instead of falling through to the general member path below, which
      // (correctly, for an INSTANCE property) returns a constructor
      // assignment -- discarded here, since a companion only reads
      // `methodLines` -- silently dropping the property.
      const member = [...rawMember];
      while (member.length > 1 && member[member.length - 1].trim() === '') member.pop();
      const header = member[0]?.trim() ?? '';
      const property = header.match(/^(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[^=]+)?\s*=\s*(.+)$/);
      if (property && member.length === 1) {
        companionStaticLines.push(`  static ${property[1]} = ${property[2]};`);
        continue;
      }
      const { methodLines: companionMethods } = transpileClassMember(member, companionProps);
      companionStaticLines.push(...companionMethods.map((line, index) => index === 0 ? line.replace(/^  /, '  static ') : line));
    }

    const superCallLine = superName && superArgsRaw !== undefined ? [`    super(${superArgsRaw});`] : [];
    const ctorBodyLines = [...superCallLine, ...propertyAssignments, ...ctorExtraLines];

    // Built via concatenation, NOT a template literal with `${className}(`
    // directly adjacent -- the later `insertNewForInstantiation` pass looks
    // for `ClassName(` as literal text anywhere in the source, with no
    // awareness of string-literal context, so a template literal here would
    // get its own generated toString corrupted into `new ClassName(...)`
    // text embedded inside the returned string.
    const dataClassLines = dataFlag
      ? [
          `  copy(overrides = {}) { return new ${className}(${ctorParams.map((p) => `Object.prototype.hasOwnProperty.call(overrides, '${p.name}') ? overrides.${p.name} : this.${p.name}`).join(', ')}); }`,
          `  equals(other) { return other instanceof ${className} && ${ctorParams.map((p) => `__kt_equals(this.${p.name}, other.${p.name})`).join(' && ')}; }`,
          // A property declared Double/Float prints a whole value as `12000.0`, as Kotlin does (JS keeps no such distinction).
          `  toString() { return '${className}' + '(' + ${ctorParams.map((p) => `'${p.name}=' + ${/^(?:Double|Float)\??$/.test(p.type ?? '') ? `__kt_decimalText(this.${p.name}${/^Float/.test(p.type ?? '') ? ', true' : ''})` : `this.${p.name}`}`).join(" + ', ' + ")} + ')'; }`,
          // \`val (a, b) = point\` and \`for ((a, b) in points)\` read component1(), component2()... in order.
          `  *[Symbol.iterator]() { ${ctorParams.filter((p) => p.isProperty).map((p) => `yield this.${p.name};`).join(' ')} }`,
          ...ctorParams.filter((p) => p.isProperty).map((p, index) => `  component${index + 1}() { return this.${p.name}; }`),
          `  hashCode() { return __kt_hashAll([${ctorParams.filter((p) => p.isProperty).map((p) => `this.${p.name}`).join(', ')}]); }`,
        ]
      : [];

    // A supertype WITHOUT parens (`: Greetable`) is an interface -- Kotlin
    // requires parens (a constructor call, `: Animal(name)`) only when
    // actually extending a class. JS has no interface concept, so an
    // interface supertype contributes no `extends` at all (the
    // implementing class already supplies real methods via `override fun`).
    const isRealSuperclass = Boolean(superName) && superArgsRaw !== undefined;
    const extendsClause = isRealSuperclass ? ` extends ${superName}` : '';
    const interfaceClause = (supertypesRaw ?? '').replace(/\s+by\s+[A-Za-z_][A-Za-z0-9_]*\s*$/, '');
    const interfaceNames = interfaceClause
      .split(',')
      .map((part) => part.trim().replace(/\s*\([^)]*\)$/, '').replace(/<[^>]*>$/, ''))
      .filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && (!isRealSuperclass || name !== superName));
    const rewritten = [
      `class ${className}${extendsClause} {`,
      `  constructor(${renderCtorParams(ctorParams)}) {`,
      ...ctorBodyLines,
      '  }',
      // A plain class prints like the JVM's Object.toString (`Ticket@6d06d69c`), not JS's `[object Object]`. Placed before the class's own
      // methods so an `override fun toString()` (a later method of the same name) still wins; subclasses inherit it.
      ...(!dataFlag && !isRealSuperclass ? ['  toString() { return __kt_identityText(this); }'] : []),
      ...methodLines,
      ...companionStaticLines,
      ...dataClassLines,
      '}',
    ].join('\n');

    const defaultMixins = interfaceNames.length
      ? `\nfor (const __kt_defaults of [${interfaceNames.map((name) => `(typeof __kt_interface_${name} === 'undefined' ? {} : __kt_interface_${name})`).join(', ')}]) for (const [__kt_name, __kt_method] of Object.entries(__kt_defaults)) if (!Object.prototype.hasOwnProperty.call(${className}.prototype, __kt_name)) ${className}.prototype[__kt_name] = __kt_method;\n${interfaceNames.map((name) => `${className}.prototype.__kt_implements_${name} = true;`).join('\n')}`
      : '';
    // Interface delegation (`class Wrap(d: X) : X by d`): forward every
    // abstract member of the delegated interface(s) the wrapper does NOT
    // already define itself (an `override fun` in the wrapper's own body
    // must win -- checked against the method names actually emitted into
    // `methodLines`) onto the retained delegate reference. `...args`
    // forwards any arity uniformly since this simulator has no per-member
    // parameter-list introspection; every interface this world's lessons
    // delegate to happens to declare zero-arg members, so this is not a
    // narrowing in practice.
    let delegationMixin = '';
    if (delegateVar) {
      const overridden = new Set(
        methodLines.map((line) => line.match(/^\s*(?:static\s+)?(?:get\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1]).filter((n): n is string => Boolean(n))
      );
      const toForward = interfaceNames.flatMap((name) => interfaceMembers.get(name) ?? []).filter((name) => !overridden.has(name));
      if (toForward.length) {
        delegationMixin = `\nfor (const __kt_delegate_name of ${JSON.stringify(toForward)}) if (!Object.prototype.hasOwnProperty.call(${className}.prototype, __kt_delegate_name)) ${className}.prototype[__kt_delegate_name] = function(...__kt_delegate_args) { return this.${delegateVar}[__kt_delegate_name](...__kt_delegate_args); };`;
      }
    }
    result += code.slice(cursor, blockStart) + rewritten + defaultMixins + delegationMixin + (companionName ? `\n${className}.${companionName} = ${className};` : '');
    cursor = blockEnd;
    classRe.lastIndex = blockEnd;
  }
  result += code.slice(cursor);
  return result;
}

function transpileDataClassCopyCalls(code: string): string {
  // The receiver can be a bare variable (`a.copy(...)`) or a fresh
  // constructor call chained straight off (`P(1, 2).copy(...)`, real and
  // common Kotlin) -- the optional `(?:\([^()]*\))?` covers the latter so
  // its whole "P(1, 2)" text is kept as the receiver, not just the
  // unmatched tail after the last `.`, which previously left `.copy(y=5)`
  // completely untouched (no bare identifier immediately precedes it) and
  // let it fall through to be misinterpreted as an ordinary call with a
  // plain assignment argument -- silently ignoring the override entirely.
  // The argument list is read with balanced parentheses (a value may itself be a call or a wrapped expression) and may hold
  // several named arguments: copy(price = a.price - discount, name = "x") -> copy({ price: ..., name: "x" }).
  const marker = /\b([A-Za-z_][A-Za-z0-9_]*(?:\([^()]*\))?)\.copy\(/g;
  let out = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = marker.exec(code)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 1, i = open + 1;
    for (; i < code.length && depth > 0; i++) {
      const ch = code[i];
      if (ch === '"' || ch === '\'') { const q = ch; for (i++; i < code.length && code[i] !== q; i++) if (code[i] === '\\') i++; continue; }
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
    }
    if (depth !== 0) break;
    const parts = splitTopLevelCommas(code.slice(open + 1, i - 1));
    const named = parts.map((part) => /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*([\s\S]+?)\s*$/.exec(part));
    if (!parts.length || named.some((n) => !n)) { marker.lastIndex = open + 1; continue; }
    out += code.slice(cursor, m.index) + `${m[1]}.copy({ ${named.map((n) => `${n![1]}: ${n![2]}`).join(', ')} })`;
    cursor = i;
    marker.lastIndex = i;
  }
  return out + code.slice(cursor);
}

function eraseGenericConstructorArguments(code: string): string {
  code = code.replace(/\b([A-Z][A-Za-z0-9_]*)\s*<[^>{}]+>\s*\(/g, '$1(');
  // World 15: an explicit type argument on a member/static call
  // (`Result.failure<Int>(...)`) is compile-time-only, same as a
  // constructor's -- but the callee name here (`failure`) is lowercase, so
  // the capitalized-name-only pattern above never matches it. Scoped to a
  // dot-prefixed call specifically (`.name<...>(`), which is never
  // confusable with a `<`/`>` comparison chain the way a bare identifier
  // would be.
  code = code.replace(/\.([a-zA-Z_][A-Za-z0-9_]*)\s*<[^>{}]+>\s*\(/g, '.$1(');
  return code;
}

/**
 * Replaces every `object Name { ... }` singleton declaration with an
 * immediately-instantiated anonymous JS class: `const Name = new (class {
 * ... })();`. Every later `Name.member` access then just works, matching
 * Kotlin's own single-shared-instance semantics. Scoped to a plain object
 * declaration -- `object Name : Interface { ... }` is not supported.
 */
function transpileObjectDeclarations(code: string, objectInterfaces: Map<string, string[]> = new Map(), objectSupers: Map<string, { name: string; args: string }> = new Map()): string {
  const re = /\bobject\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(code)) !== null) {
    const [whole, name] = match;
    const blockStart = match.index;
    const openBraceIdx = blockStart + whole.length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) {
      re.lastIndex = openBraceIdx + 1;
      continue;
    }
    const blockEnd = i;
    const bodyLines = code.slice(openBraceIdx + 1, i - 1).split('\n');

    const classProps = new Set<string>();
    for (const name of topLevelMemberProperties(bodyLines)) classProps.add(name);

    const members = splitClassMembers(bodyLines);
    const ctorExtraLines: string[] = [];
    const methodLines: string[] = [];
    for (const member of members) {
      const { ctorLines, methodLines: mLines } = transpileClassMember(member, classProps);
      ctorExtraLines.push(...ctorLines.map((l) => `    ${l}`));
      methodLines.push(...mLines);
    }

    const superClass = objectSupers.get(name);
    const rewritten = [
      `const ${name} = new (class ${name}${superClass ? ` extends ${superClass.name}` : ''} {`,
      `  constructor() {`,
      ...(superClass ? [`    super(${superClass.args});`] : []),
      ...ctorExtraLines,
      '  }',
      // `x is Idle` becomes `x instanceof Idle`; an object is an instance, so it answers for itself.
      '  [Symbol.hasInstance](value) { return value === this; }',
      ...methodLines,
      '})();',
    ].join('\n');

    // An object implementing an interface has no `extends`/prototype chain
    // of its own to inherit a default method through (unlike a class,
    // whose `defaultMixins` -- see `transpileClassDeclarations` -- patch
    // the prototype); this is the instance-level equivalent, skipping any
    // name the object's own body already defines. Also tags the instance
    // with `__kt_implements_<Interface>` for each declared interface, so a
    // later `x is Interface` check (see `transformTypeChecks`) has
    // something real to read -- interfaces are erased to a plain
    // `__kt_interface_X` object with no prototype relation, so
    // `instanceof` can never work against one.
    const interfaces = objectInterfaces.get(name) ?? [];
    const defaultMixin = interfaces
      .map((interfaceName) => `\nfor (const [__kt_name, __kt_method] of Object.entries(typeof __kt_interface_${interfaceName} === 'undefined' ? {} : __kt_interface_${interfaceName})) if (typeof ${name}[__kt_name] !== 'function') ${name}[__kt_name] = __kt_method;\n${name}.__kt_implements_${interfaceName} = true;`)
      .join('');

    result += code.slice(cursor, blockStart) + rewritten + defaultMixin;
    cursor = blockEnd;
    re.lastIndex = blockEnd;
  }
  result += code.slice(cursor);
  return result;
}

/**
 * Final pass, run after every class/object/enum/interface declaration has
 * been transpiled: Kotlin instantiates with `ClassName(args)` (no `new`),
 * so every call site referring to a name collected in `classNames` gets
 * `new ` inserted before it. Safe against double-insertion via a negative
 * lookbehind, and never touches a class's own declaration (`class Foo {`
 * has no `(` right after the name once transpiled) or a `super(...)` call
 * (a literal `super`, never one of the collected class names).
 */
function insertNewForInstantiation(code: string, classNames: Set<string>): string {
  const regexes = [...classNames].map((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { name, re: new RegExp(`(?<!new\\s)\\b${escaped}\\s*\\(`, 'g') };
  });
  // A blind whole-source replace would also rewrite `"ClassName("` text
  // sitting inside an unrelated STRING LITERAL (e.g. a method building a
  // display string like `"Box(" + value + ")"`) into `"new Box("` --
  // corrupting the literal instead of leaving it alone, since this regex
  // has no idea it isn't looking at a real instantiation there. Restricted
  // to non-string chunks of each line, the same way `rewriteClassPropertyAccess`
  // already avoids corrupting a string's own content elsewhere in this file.
  return code
    .split('\n')
    .map((line) => {
      const chunks = splitCodeAndStrings(line);
      const addNew = (text: string) => { for (const { name, re } of regexes) text = text.replace(re, `new ${name}(`); return text; };
      for (const chunk of chunks) {
        // a string's own text is left alone, but a `${...}` placeholder inside it is code: `"p=${Point(3, 4)}"`
        if (chunk.isString) { if (chunk.text.includes('${')) chunk.text = replaceTemplatePlaceholders(chunk.text, (expression) => '${' + addNew(expression) + '}'); continue; }
        chunk.text = addNew(chunk.text);
      }
      return chunks.map((c) => c.text).join('');
    })
    .join('\n');
}

/**
 * Finds the start of the postfix expression ending right before `endExclusive`
 * (a `.` position) -- either a bare identifier (`a`) or a single call whose
 * own closing paren sits right there (`Outer("x")`). Scoped to exactly the
 * receiver shapes World 11's inner-class lessons use; a longer chain
 * (`a.b.Inner()`) is not walked past its last segment.
 */
function findReceiverExpressionStart(code: string, endExclusive: number): number {
  let i = endExclusive - 1;
  while (i >= 0 && /\s/.test(code[i])) i--;
  if (i >= 0 && code[i] === ')') {
    let depth = 1;
    i--;
    while (i >= 0 && depth > 0) {
      if (code[i] === ')') depth++;
      else if (code[i] === '(') depth--;
      i--;
    }
  }
  while (i >= 0 && /[A-Za-z0-9_]/.test(code[i])) i--;
  return i + 1;
}

/**
 * Supported World 11 inner-class subset: `inner class Inner(...) { ... }`
 * declared as the sole nested block inside `class Outer(...) { ... }`.
 * Kotlin constructs it as `outerInstance.Inner(...)`, capturing that
 * specific outer instance for the lifetime of the inner object -- unlike a
 * plain nested class (no `inner`), which captures nothing. Lowered to an
 * ordinary top-level class taking the outer instance as a real (property)
 * constructor parameter named `__outer`, so the shared class transpiler
 * that runs after this needs no changes of its own: `this@Outer.prop` and
 * a bare, unshadowed outer property reference both become
 * `this.__outer.prop`, reusing `rewriteClassPropertyAccess` (the same
 * string-template-aware rewrite an ordinary class body already gets) with
 * `this.__outer.` as its prefix instead of the default `this.`.
 */
function transpileInnerClasses(code: string): string {
  const innerClasses: Array<{ innerName: string; loweredName: string }> = [];
  const outerRe = /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = outerRe.exec(code)) !== null) {
    const [whole, outerName, outerCtorRaw] = match;
    const openBraceIdx = match.index + whole.length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) { outerRe.lastIndex = openBraceIdx + 1; continue; }
    const blockEnd = i;
    const body = code.slice(openBraceIdx + 1, blockEnd - 1);

    const innerRe = /\binner\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*\{/;
    const innerMatch = innerRe.exec(body);
    if (!innerMatch) continue;
    const [innerWhole, innerName, innerCtorRaw] = innerMatch;
    const innerOpenIdx = innerMatch.index! + innerWhole.length - 1;
    let innerDepth = 1;
    let j = innerOpenIdx + 1;
    for (; j < body.length && innerDepth > 0; j++) {
      if (body[j] === '{') innerDepth++;
      else if (body[j] === '}') innerDepth--;
    }
    if (innerDepth !== 0) continue;
    const innerBlockEnd = j;
    const innerBodyRaw = body.slice(innerOpenIdx + 1, innerBlockEnd - 1);

    const outerProps = new Set(
      (outerCtorRaw ?? '').split(',').map((p) => p.trim().match(/^(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1]).filter((n): n is string => Boolean(n))
    );
    const innerParamNames = new Set(
      (innerCtorRaw ?? '').split(',').map((p) => p.trim().match(/^(?:(?:val|var)\s+)?([A-Za-z_][A-Za-z0-9_]*)/)?.[1]).filter((n): n is string => Boolean(n))
    );

    let innerBody = innerBodyRaw.replace(new RegExp(`this@${outerName}\\.([A-Za-z_][A-Za-z0-9_]*)`, 'g'), 'this.__outer.$1');
    innerBody = rewriteClassPropertyAccess(innerBody.split('\n'), outerProps, innerParamNames, 'this.__outer.').join('\n');

    const loweredName = `__KtInner_${outerName}_${innerName}`;
    const loweredClass = `\nclass ${loweredName}(val __outer${innerCtorRaw ? `, ${innerCtorRaw}` : ''}) {${innerBody}}`;
    innerClasses.push({ innerName, loweredName });

    const newBody = body.slice(0, innerMatch.index!) + body.slice(innerBlockEnd);
    const newWhole = code.slice(match.index, openBraceIdx + 1) + newBody + '}' + loweredClass;
    code = code.slice(0, match.index) + newWhole + code.slice(blockEnd);
    outerRe.lastIndex = match.index + newWhole.length;
  }

  for (const { innerName, loweredName } of innerClasses) {
    const marker = `.${innerName}(`;
    let searchFrom = 0;
    for (;;) {
      const dotIdx = code.indexOf(marker, searchFrom);
      if (dotIdx === -1) break;
      const openParenIdx = dotIdx + marker.length - 1;
      let depth = 1;
      let k = openParenIdx + 1;
      for (; k < code.length && depth > 0; k++) {
        if (code[k] === '(') depth++;
        else if (code[k] === ')') depth--;
      }
      const closeParenIdx = k;
      const argsText = code.slice(openParenIdx + 1, k - 1).trim();
      const receiverStart = findReceiverExpressionStart(code, dotIdx);
      const receiverText = code.slice(receiverStart, dotIdx);
      const replacement = `new ${loweredName}(${receiverText}${argsText ? `, ${argsText}` : ''})`;
      code = code.slice(0, receiverStart) + replacement + code.slice(closeParenIdx);
      searchFrom = receiverStart + replacement.length;
    }
  }
  return code;
}

/**
 * Supported World 11 nested-class subset: an ordinary (non-`inner`) class
 * declared inside another class's body -- with or without its own `{ ...
 * }` body, and regardless of whether the OUTER class itself has
 * constructor parameters. Unlike `transpileInnerClasses`, a nested class
 * captures nothing from its outer -- Kotlin gives it no implicit outer
 * receiver at all, so any outer state it needs must arrive as an ordinary,
 * explicit parameter (`fun f(o: Outer) = o.x`, real Kotlin and exactly
 * what this lowering already handles for free once the class is a
 * perfectly normal top-level one). Lowering is therefore just "move the
 * declaration to the top level under a unique name, then rewrite every
 * `Outer.Nested` reference (construction or bare name) to it" -- run
 * AFTER `transpileInnerClasses`, so an `inner class` has already been
 * extracted and cannot be mistaken for a nested one here.
 */
function transpileNestedClasses(code: string): string {
  const nestedNames: Array<{ outer: string; nested: string; lowered: string }> = [];
  const outerRe = /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\([^)]*\))?\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = outerRe.exec(code)) !== null) {
    const [whole, outerName] = match;
    const openBraceIdx = match.index + whole.length - 1;
    let depth = 1;
    let i = openBraceIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    if (depth !== 0) { outerRe.lastIndex = openBraceIdx + 1; continue; }
    const blockEnd = i;
    const body = code.slice(openBraceIdx + 1, blockEnd - 1);

    const nestedRe = /(?<!inner\s+)\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?\s*(\{)?/;
    const nestedMatch = nestedRe.exec(body);
    if (!nestedMatch) continue;
    const [nestedWhole, nestedName, nestedCtorRaw, hasBrace] = nestedMatch;
    const loweredName = `__KtNested_${outerName}_${nestedName}`;
    nestedNames.push({ outer: outerName, nested: nestedName, lowered: loweredName });

    let nestedEnd = nestedMatch.index! + nestedWhole.length;
    let nestedBody = '';
    if (hasBrace) {
      let nestedDepth = 1;
      let j = nestedEnd;
      for (; j < body.length && nestedDepth > 0; j++) {
        if (body[j] === '{') nestedDepth++;
        else if (body[j] === '}') nestedDepth--;
      }
      nestedBody = body.slice(nestedEnd, j - 1);
      nestedEnd = j;
    }

    const loweredClass = `\nclass ${loweredName}${nestedCtorRaw !== undefined ? `(${nestedCtorRaw})` : ''} {${nestedBody}}`;
    const newBody = body.slice(0, nestedMatch.index) + body.slice(nestedEnd);
    const newWhole = code.slice(match.index, openBraceIdx + 1) + newBody + '}' + loweredClass;
    code = code.slice(0, match.index) + newWhole + code.slice(blockEnd);
    outerRe.lastIndex = match.index + newWhole.length;
  }

  for (const { outer, nested, lowered } of nestedNames) {
    code = code.replace(new RegExp(`\\b${outer}\\.${nested}\\b`, 'g'), lowered);
  }
  return code;
}

/**
 * Runs the full class/object/enum/interface transpilation pipeline, in the
 * order each stage depends on: modifiers stripped first (so every later
 * regex sees a plain `class`/`fun`/`val` with no leading keyword noise),
 * enums and interfaces removed/replaced next (so the general class regex
 * never mistakes an enum body's constant list for ordinary class members),
 * then objects and classes themselves, and finally the `new` insertion
 * pass once every class name is known.
 */
function transpileOOPDeclarations(code: string): string {
  const inherited = collectInheritedMembers(code);
  code = stripAbstractMemberDeclarations(code);
  code = stripModifierKeywords(code);
  // Captured before any interface-erasing transform below (both replace
  // the ORIGINAL `interface X { ... }` text entirely), since class
  // delegation (`: X by d`, further down) needs to know which abstract
  // members to forward and there is no representation of them left once
  // an interface has been lowered to its runtime `__kt_interface_X`
  // default-method-only object.
  const interfaceMembers = getAllInterfaceMemberNames(code);
  // The supported sealed subset has ordinary runtime class/object behavior;
  // exhaustiveness remains a separate compiler-validation concern.
  code = code.replace(/\bsealed\s+(?=(?:class|interface)\b)/g, '');
  code = code.replace(/\bdata\s+object\b/g, 'object');
  code = code.replace(/\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=\n|$)/g, 'const __kt_interface_$1 = {};');
  // Capture each object's interface supertype (if any) before discarding
  // the `: Interface` clause, so an object implementing an interface with
  // a default method (`object O : X` where `X` has `fun f() = ...`) still
  // gets that default mixed in below -- otherwise `O.f()` would throw
  // "not a function", since the object literal this lowers to has no
  // other way to inherit it.
  const objectInterfaces = new Map<string, string[]>();
  // `object Idle : State()` (the usual sealed-class member) extends a CLASS: recorded here, built with `extends` below.
  const objectSupers = new Map<string, { name: string; args: string }>();
  code = code.replace(/\bobject\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)(?:<[^>{}]*>)?\s*\(([^()]*)\)(?:[ \t]*,[ \t]*)?/g, (_whole, name, superName, args) => {
    objectSupers.set(name, { name: superName, args: args.trim() });
    return `object ${name} : `;
  });
  code = code.replace(/\bobject\s+([A-Za-z_][A-Za-z0-9_]*) : (?=[ \t]*(?:\{|\n|$))/g, 'object $1');
  // As with a class's supertype clause, an object's interface can itself
  // carry a generic type argument (`object UserFormatter : Formatter<User>`)
  // -- the optional `(?:<[^>{}]+>)?` after each name accounts for it, and
  // it is stripped back off (kept out of the captured interface name)
  // before being recorded, since the interface lookups below key on the
  // bare declared name.
  code = code.replace(/\bobject\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*(?:<[^>{}]+>)?(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*(?:<[^>{}]+>)?)*)(?=\s*(?:\{|\n|$))/g, (_whole, name, interfaceClause) => {
    objectInterfaces.set(name, interfaceClause.split(',').map((n: string) => n.trim().replace(/<[^>]*>$/, '')));
    return `object ${name}`;
  });
  code = code.replace(/\bobject\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?=\n|$)/g, 'object $1 {}');
  code = transpileInnerClasses(code);
  code = transpileNestedClasses(code);
  // Visibility on a primary constructor is compile-time metadata; remove it
  // before class declaration matching so `class X private constructor(...)`
  // is parsed as a normal constructor while retaining the runtime shape.
  code = code.replace(/\b(?:private|public|protected|internal)\s+constructor\b/g, '');
  code = code.replace(/\bconstructor\s*(?=\()/g, '');
  // Kotlin permits a bodyless class declaration; give the JavaScript
  // transpiler an explicit empty body so it cannot swallow the next top-level
  // function declaration.
  code = transpileDataClassCopyCalls(code);
  code = eraseGenericConstructorArguments(code);
  code = transpileEnumClasses(code);
  code = transpileInterfaceDeclarations(code, inherited);
  const classNames = new Set<string>(['StringBuilder', ...BUILTIN_EXCEPTION_NAMES]);
  code = transpileClassDeclarations(code, classNames, interfaceMembers, inherited);
  code = transpileObjectDeclarations(code, objectInterfaces, objectSupers);
  code = insertNewForInstantiation(code, classNames);
  // Runs last: any `by lazy { ... }` still in the source at this point is
  // NOT a class member (transpileClassDeclarations, above, has already
  // consumed and replaced every one inside a class/object body with a
  // real getter), so it must be a top-level or local declaration instead.
  code = transpileTopLevelLazyProperties(code);
  code = transpileTopLevelCustomDelegatedProperties(code, inferMapVars(code));
  return code;
}

/** Declared type of each property whose custom accessor hides it from the lowerer (`var degrees: Double = 0.0` + `get`/`set`). */
function accessorPropertyTypes(blocks: string[], source: string): Record<string, string> {
  const doubleProps = new Set([...source.matchAll(/\b(?:val|var)\s+([A-Za-z_]\w*)\s*:\s*Double\b(?!\?)/g)].map((x) => x[1]));
  const out: Record<string, string> = {};
  const clash = new Set<string>();
  for (const block of blocks) {
    let m = block.match(/\b(?:val|var)\s+([A-Za-z_]\w*)\s*:\s*(Int|Long|Double|Float|String|Boolean)\b(?!\?)/);
    if (!m) {
      // `val total get() = price * qty`: no declared type. A purely arithmetic expression over Double names/literals is a Double.
      const g = block.match(/\bval\s+([A-Za-z_]\w*)\s+get\(\)\s*=\s*([^\n]+)$/);
      if (g && /^[\w\s.+\-*/%()]+$/.test(g[2]) && !/\.\s*[A-Za-z_]|\b(?:if|when|true|false|null)\b/.test(g[2].replace(/\d+\.\d+/g, '0'))) {
        const idents = [...g[2].replace(/\d+(?:\.\d+)?/g, ' ').matchAll(/[A-Za-z_]\w*/g)].map((x) => x[0]);
        if (/\d\.\d/.test(g[2]) || idents.some((n) => doubleProps.has(n))) m = [g[0], g[1], 'Double'] as unknown as RegExpMatchArray;
      }
    }
    if (!m) continue;
    if (out[m[1]] && out[m[1]] !== m[2]) clash.add(m[1]);
    out[m[1]] = m[2];
  }
  for (const name of clash) delete out[name];
  return out;
}

/** Result type of each function declared in a companion object: an explicit `: Type`, or an expression body that constructs a class (`= Temp(...)`). */
function companionResultTypes(blocks: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  const clash = new Set<string>();
  for (const block of blocks) {
    for (const m of block.matchAll(/\bfun\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*(?::\s*([A-Z][\w]*)\s*(?=[={\n])|=\s*([A-Z][\w]*)\s*\()/g)) {
      const type = m[2] ?? m[3];
      if (out[m[1]] && out[m[1]] !== type) clash.add(m[1]);
      out[m[1]] = type;
    }
  }
  for (const name of clash) delete out[name];
  return out;
}

/** Keeps companion members in Kotlin form while the general function lowerer
 * processes top-level functions. The lowerer intentionally understands
 * anonymous `object` expressions, but a companion is a class member and must
 * be handled by `transpileClassDeclarations` instead. */
function protectCompanionBlocks(code: string): { code: string; blocks: string[] } {
  const blocks: string[] = [];
  const companionRe = /\bcompanion\s+object(?:\s+[A-Za-z_][A-Za-z0-9_]*)?(?:\s*:\s*[A-Za-z_][A-Za-z0-9_]*)?\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = companionRe.exec(code)) !== null) {
    const open = match.index + match[0].length - 1;
    let depth = 1;
    let end = open + 1;
    for (; end < code.length && depth > 0; end++) {
      if (code[end] === '{') depth++;
      else if (code[end] === '}') depth--;
    }
    if (depth !== 0) continue;
    const marker = `__KT_COMPANION_${blocks.length}__`;
    blocks.push(code.slice(match.index, end));
    result += code.slice(cursor, match.index) + marker;
    cursor = end;
    companionRe.lastIndex = end;
  }
  return { code: result + code.slice(cursor), blocks };
}

/**
 * Shields a class-member computed-getter property (`val name: Type get() =
 * expr`, handled later by `transpileClassMember`'s own `getterProp` branch)
 * from the general function lowerer the same way `protectCompanionBlocks`
 * shields a companion. kotlinFunctions.ts's own `val`/`var` handling has no
 * concept of a `get()` accessor -- it treats everything between the `:` and
 * the final `=` as one (bogus) declared type, and `readType`'s fallback
 * reconstructs that "type" by concatenating token text with NO original
 * whitespace between tokens, so `List<String> get()` collapses into
 * `List<String>get()`. That corrupted text then fails every later
 * text-based transform that expects a plain type annotation (including the
 * `val`->`const` per-line rewrite), leaving a literal, invalid `val` in the
 * final JS. Protecting the whole line keeps kotlinFunctions.ts from ever
 * seeing it in the first place. Single-line only, matching the getter
 * shape this simulator actually supports.
 */
function protectGetterProperties(code: string): { code: string; blocks: string[] } {
  const blocks: string[] = [];
  const newCode = code.replace(
    /^[ \t]*(?:(?:private|protected|internal|public|override)\s+)*(?:val|var)\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*:\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*?)?\s+get\(\)\s*=\s*[^\n]+$/gm,
    (whole) => {
      const marker = `__KT_GETTERPROP_${blocks.length}__`;
      blocks.push(whole);
      return marker;
    }
  );
  return { code: newCode, blocks };
}

/**
 * Shields a class-member property whose getter has a BLOCK body split
 * across its own line(s) (`val name: Type` then, on a separate line,
 * `get() { ... }` -- as opposed to `protectGetterProperties`'s
 * single-expression, single-line `val name: Type get() = expr`) from the
 * general function lowerer. `get` is an ordinary identifier to
 * kotlinFunctions.ts; `get()` immediately followed by `{` matches its
 * generic trailing-lambda heuristic, and a `return` inside that
 * synthetic lambda then fails with "return is not allowed outside a
 * function" since it isn't a real recognized function frame. Balanced-
 * brace scanned so a multi-statement getter body is captured whole.
 * `transpileClassMember`'s `blockGetterProp` branch does the real
 * lowering once this is restored.
 */
function protectBlockGetterProperties(code: string): { code: string; blocks: string[] } {
  const blocks: string[] = [];
  // header line (`val x: T`, `var y = 0.0`) whose NEXT line starts an accessor: `get() { }`, `get() = expr`, `set(v) { }`
  const header = /^[ \t]*(?:(?:private|protected|internal|public|open|override|lateinit)\s+)*(?:val|var)\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*:\s*[A-Za-z_][\w<>?,. ]*?)?(?:[ \t]*=[^\n]+)?\n(?=[ \t]*(?:get\s*\(\s*\)|set\s*\(\s*\w*\s*\)))/gm;
  const accessor = /^[ \t]*(?:(?:private|protected|internal)\s+)?(?:get\s*\(\s*\)|set\s*\(\s*\w*\s*\))[ \t]*(?:=[^\n]*|\{)?/;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = header.exec(code)) !== null) {
    let end = match.index + match[0].length;
    // consume the whole accessor chain (any order of get/set, each a block or a single expression)
    for (;;) {
      const rest = code.slice(end);
      const skip = /^(?:[ \t]*\n)*/.exec(rest)![0].length;
      const next = accessor.exec(rest.slice(skip));
      if (!next) break;
      const start = end + skip;
      if (next[0].endsWith('{')) {
        let depth = 1, i = start + next[0].length;
        for (; i < code.length && depth > 0; i++) { if (code[i] === '{') depth++; else if (code[i] === '}') depth--; }
        if (depth !== 0) break;
        end = i;
      } else end = start + next[0].length;
    }
    // a trailing `private set` style modifier line is dropped by the member splitter; the span ends here
    blocks.push(code.slice(match.index, end));
    result += code.slice(cursor, match.index) + `__KT_BLOCKGETTER_${blocks.length - 1}__`;
    cursor = end;
    header.lastIndex = end;
  }
  return { code: result + code.slice(cursor), blocks };
}

/**
 * Shields a property-delegation `by lazy { ... }` block (class-member --
 * see `transpileClassMember`'s `lazyPropBlock`/`lazyPropSingleLine`
 * branches -- or top-level/local, see `transpileTopLevelLazyProperties`)
 * from the general function lowerer. `lazy` is an ordinary identifier to
 * kotlinFunctions.ts, not a keyword, so a `{` immediately after it (with
 * nothing else marking it as special) matches its generic trailing-lambda
 * heuristic and gets rewritten into a real `lazy(...)` CALL with an arrow
 * function -- valid-looking JS, but not a shape either lazy-property
 * transform below still recognizes, and `lazy` is never actually defined
 * as a runtime helper. Balanced-brace scanned, since a lazy block's own
 * body can contain further nested braces (an `if`, a lambda argument).
 */
/**
 * World 14's `sequence { yield(1); yieldAll(listOf(2, 3)) }` builder is
 * protected the same way `by lazy { ... }` is: replaced with a placeholder
 * before `lowerKotlinFunctions` ever tokenizes the source (its generic
 * lambda/trailing-call lowering has no concept of `yield`/`yieldAll` and
 * would otherwise mangle the block trying to treat it as an ordinary
 * lambda argument), then restored -- transformed -- immediately after.
 * Restoring before the OOP pass and the later per-line loop (rather than
 * at the very end) is deliberate: it lets the block's own inner Kotlin
 * (e.g. `listOf(2, 3)` inside `yieldAll`) still go through every normal
 * later transform (collection-name rewriting, etc.) instead of needing
 * its own separate, parallel mini-pipeline.
 */
function protectSequenceBuilders(code: string): { code: string; blocks: string[] } {
  const blocks: string[] = [];
  const re = /\bsequence\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const openIdx = match.index + match[0].length - 1;
    let depth = 1;
    let end = openIdx + 1;
    for (; end < code.length && depth > 0; end++) {
      if (code[end] === '{') depth++;
      else if (code[end] === '}') depth--;
    }
    if (depth !== 0) continue;
    const marker = `__KT_SEQBLOCK_${blocks.length}__`;
    blocks.push(code.slice(openIdx + 1, end - 1));
    result += code.slice(cursor, match.index) + marker;
    cursor = end;
    re.lastIndex = end;
  }
  return { code: result + code.slice(cursor), blocks };
}

/**
 * Supported top-level/local subset of property delegation: `val name[:
 * Type] by lazy { ... }` outside any class body (a class-member lazy
 * property is handled separately by `transpileClassMember`, which has
 * already consumed and removed every one inside a class/object body by
 * the time this runs). Since a plain local/top-level binding has no
 * receiver to hang a real getter off of, the property name itself
 * becomes a memoized zero-arg function, and every later bare read of
 * that name is rewritten to a call to it -- the same
 * declare-then-rewrite-call-sites strategy `transpileExtensionProperties`
 * already uses. Declarations are replaced with a placeholder marker
 * first and substituted back in only AFTER usage sites are rewritten, so
 * the declaration's own internal references to the name are not
 * themselves mistaken for a usage site and double-wrapped.
 */
function transpileTopLevelLazyProperties(code: string): string {
  const lazyNames: string[] = [];
  const declarations: string[] = [];
  code = code.replace(
    /\b(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*)?\s+by\s+lazy\s*\{([^{}]*)\}/g,
    (_whole, name, block) => {
      const wrapped = wrapLazyBlockBody(block);
      const marker = `__KT_LAZYDECL_${declarations.length}__`;
      declarations.push(
        `let __kt_lazy_computed_${name} = false, __kt_lazy_value_${name}; const ${name} = () => { if (!__kt_lazy_computed_${name}) { __kt_lazy_computed_${name} = true; __kt_lazy_value_${name} = (() => {\n${wrapped}\n})(); } return __kt_lazy_value_${name}; };`
      );
      lazyNames.push(name);
      return marker;
    }
  );
  for (const name of lazyNames) {
    code = code.replace(new RegExp(`\\b${name}\\b(?!\\s*\\()`, 'g'), `${name}()`);
  }
  declarations.forEach((decl, index) => {
    code = code.replace(`__KT_LAZYDECL_${index}__`, decl);
  });
  return code;
}

/**
 * Supported top-level/local subset of the two remaining, non-`lazy`
 * property-delegation forms this world's lessons use, read-only (`val`)
 * only -- a mutable (`var`) custom delegate would also need every
 * assignment site rewritten to a `setValue(...)` call, which no lesson
 * content here actually exercises:
 *  - Map-backed (`val name: Type by someMap`, `someMap` a known
 *    `mapOf`/`mutableMapOf` variable per `mapVars`): Kotlin looks up the
 *    entry whose key is the property's OWN name. Read-only and eager (the
 *    map already exists), so this becomes a plain `const`, no accessor
 *    function needed.
 *  - Custom delegate (`val name by SomeDelegate()`): Kotlin calls the
 *    delegate's `operator fun getValue(thisRef, property)` on every read,
 *    passing a `KProperty`-shaped object whose `.name` is the delegated
 *    property's own name -- reproduced here as a plain `{ name: '...' }`
 *    object literal, this simulator's stand-in for real `KProperty`
 *    reflection metadata. Uses the same declare-a-marker-then-rewrite-call-
 *    sites strategy as `transpileTopLevelLazyProperties`.
 */
function transpileTopLevelCustomDelegatedProperties(code: string, mapVars: Set<string>): string {
  // Every import (`import kotlin.math.*`, `import java.util.Scanner`, a trailing `;`) is compile-time-only here: the names it brings in are
  // provided by the runtime (kotlinStdlib.ts) or are not supported. `import x as y` aliases are kept so they fail visibly.
  code = code.replace(/^[ \t]*import[ \t]+[A-Za-z0-9_.]+(?:\.\*)?[ \t]*;?[ \t]*$/gm, '');
  // `kotlin.math.abs(-3)`: a fully qualified standard-library name is the bare name
  code = code.replace(/\bkotlin\.(?:math|random|text|collections)\.(?=[A-Za-z_])/g, '');
  const accessorNames: string[] = [];
  const declarations: string[] = [];
  code = code.replace(
    // `insertNewForInstantiation` (an earlier pass) has already turned a
    // constructor-call delegate expression into `new D()` by the time
    // this runs, hence the optional leading `new `.
    /\bval\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[A-Za-z_][A-Za-z0-9_<>?,\s]*)?\s+by\s+((?:new\s+)?[A-Za-z_][A-Za-z0-9_]*(?:\([^()]*\))?)\s*(?=\n|;|$)/g,
    (whole, name, delegateExpr) => {
      const delegateHead = delegateExpr.replace(/^new\s+/, '').match(/^[A-Za-z_][A-Za-z0-9_]*/)[0];
      if (delegateHead === 'lazy') return whole;
      const marker = `__KT_CUSTOMDELEGATE_${declarations.length}__`;
      if (mapVars.has(delegateHead)) {
        declarations.push(`const ${name} = ${delegateExpr}.get('${name}');`);
        return marker;
      }
      declarations.push(
        `const __kt_delegate_${name} = ${delegateExpr}; const ${name} = () => __kt_delegate_${name}.getValue(null, { name: '${name}' });`
      );
      accessorNames.push(name);
      return marker;
    }
  );
  for (const name of accessorNames) {
    code = code.replace(new RegExp(`\\b${name}\\b(?!\\s*\\()`, 'g'), `${name}()`);
  }
  declarations.forEach((decl, index) => {
    code = code.replace(`__KT_CUSTOMDELEGATE_${index}__`, decl);
  });
  return code;
}

/** Finds every `interface Name { ... }` in `code` and lists its abstract
 * member names (a `fun` header, with or without a default `=`/`{ ... }`
 * body -- class delegation forwards a name regardless of whether the
 * interface itself supplies a default, since an explicit wrapper override
 * must still be able to win either way). Used only by class delegation
 * (`: Interface by delegate`); see `transpileClassDeclarations`. */
function getAllInterfaceMemberNames(code: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const re = /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const names: string[] = [];
    const fnRe = /\bfun\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let fm: RegExpExecArray | null;
    while ((fm = fnRe.exec(m[2])) !== null) names.push(fm[1]);
    result.set(m[1], names);
  }
  return result;
}

/** Finds a class's own primary-constructor property names in `code`, for
 * rewriting bare references to them inside an extension property's getter
 * (see `transpileExtensionProperties`). Returns an empty set for a type
 * with no user-declared class in this program (e.g. `String`). */
function getClassPropertyNames(code: string, typeName: string): Set<string> {
  const m = new RegExp(`\\b(?:data\\s+)?class\\s+${typeName}\\s*\\(([^)]*)\\)`).exec(code);
  if (!m) return new Set();
  return new Set(
    m[1].split(',').map((p) => p.trim().match(/^(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1]).filter((n): n is string => Boolean(n))
  );
}

/** Finds ALL of a class's own properties visible to a subclass -- both
 * primary-constructor properties and plain body `val`/`var` declarations
 * (leading visibility modifiers like `protected` stripped first) -- used
 * so a subclass's bare reference to an inherited property (`fun read() =
 * code`, reading a `protected val code` declared on the base class) is
 * still recognized as `this.code` rather than an undefined bare
 * identifier. This is real Kotlin's inheritance-visibility model
 * simplified to "any base property is reachable by name from a
 * subclass" -- adequate for this simulator's single-inheritance depth. */
function getClassOwnPropertyNames(code: string, typeName: string): Set<string> {
  const names = new Set<string>();
  const propLine = /^(?:(?:private|protected|internal|open)\s+)?(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)/;
  const withBody = new RegExp(`\\bclass\\s+${typeName}\\b\\s*(?:\\(([^)]*)\\))?\\s*(?:\\:[^{]*)?\\{`).exec(code);
  if (withBody) {
    if (withBody[1]) {
      for (const p of withBody[1].split(',')) {
        const match = p.trim().match(propLine);
        if (match) names.add(match[1]);
      }
    }
    const openIdx = withBody.index + withBody[0].length - 1;
    let depth = 1;
    let i = openIdx + 1;
    for (; i < code.length && depth > 0; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') depth--;
    }
    for (const line of code.slice(openIdx + 1, i - 1).split('\n')) {
      const match = line.trim().match(propLine);
      if (match) names.add(match[1]);
      const method = line.trim().match(/^(?:(?:private|protected|internal|public|open|override|abstract|suspend)\s+)*fun\s+(?:<[^>]*>\s*)?([A-Za-z_][A-Za-z0-9_]*)\s*[(<]/);
      if (method) names.add(`${method[1]}()`);
    }
    return names;
  }
  const bodyless = new RegExp(`\\bclass\\s+${typeName}\\s*\\(([^)]*)\\)`).exec(code);
  if (bodyless) {
    for (const p of bodyless[1].split(',')) {
      const match = p.trim().match(propLine);
      if (match) names.add(match[1]);
    }
  }
  return names;
}

/**
 * Supported World 11 extension-property subset: `val Type(?).name: RetType
 * get() = expr` (single line, or the property header and `get()` split
 * across two lines), with a single-expression getter body and no setter.
 * An extension property is semantically a zero-argument extension
 * function wearing property syntax (same static, receiver-type-based
 * resolution, same "member wins" rule) -- so rather than reimplementing
 * that dispatch logic a second time, this canonicalizes the declaration
 * into `fun Type(?).name() = expr` and every bare `receiver.name` call
 * site into `receiver.name()`, and lets the already-supported extension
 * FUNCTION pipeline (lowerKotlinFunctions in kotlinFunctions.ts) do the
 * rest. A bare, unqualified reference to the receiver's own
 * primary-constructor property inside the getter body (`width*height`,
 * not `this.width*this.height`) is rewritten to `this.width*this.height`
 * first via the same `rewriteClassPropertyAccess` helper an ordinary
 * class body already uses -- kotlinFunctions.ts then substitutes that
 * `this` for the real receiver parameter, exactly like any other
 * extension function.
 */
function transpileExtensionProperties(code: string): string {
  const propNames: string[] = [];
  code = code.replace(
    /\bval\s+([A-Za-z_][A-Za-z0-9_]*)(\?)?\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*[A-Za-z_][A-Za-z0-9_<>?]*\s*\n?\s*get\(\)\s*=\s*([^\n]+)/g,
    (_whole, receiverType, nullable, propName, body) => {
      const receiverProps = getClassPropertyNames(code, receiverType);
      const rewrittenBody = rewriteClassPropertyAccess([body], receiverProps, new Set(), 'this.')[0];
      propNames.push(propName);
      return `fun ${receiverType}${nullable ?? ''}.${propName}() = ${rewrittenBody}`;
    }
  );
  for (const propName of propNames) {
    code = code.replace(new RegExp(`\\.${propName}\\b(?!\\()`, 'g'), `.${propName}()`);
  }
  return code;
}

function protectLazyBlocks(code: string): { code: string; blocks: string[] } {
  const blocks: string[] = [];
  const re = /\bby\s+lazy\s*\{/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const openIdx = match.index + match[0].length - 1;
    let depth = 1;
    let end = openIdx + 1;
    for (; end < code.length && depth > 0; end++) {
      if (code[end] === '{') depth++;
      else if (code[end] === '}') depth--;
    }
    if (depth !== 0) continue;
    const marker = `__KT_LAZYBLOCK_${blocks.length}__`;
    blocks.push(code.slice(match.index, end));
    result += code.slice(cursor, match.index) + marker;
    cursor = end;
    re.lastIndex = end;
  }
  return { code: result + code.slice(cursor), blocks };
}

/**
 * Transpiles Kotlin code into an isolated JavaScript execution function.
 */
export function transpileKotlinToJS(kotlinCode: string): string {
  // World 16 Lesson 1 normalization must run before lowerKotlinFunctions:
  // imports are not executable in the new-Function sandbox, and `suspend`
  // is modifier metadata for this deliberately synchronous teaching subset.
  // The helper's lexical scan preserves matching text in strings/comments.
  kotlinCode = prepareCoroutineSource(kotlinCode);
  kotlinCode = transpileSecondaryConstructors(hoistAnonymousObjects(transpileRichEnums(transpileDelegatesObservable(kotlinCode))));
  // a bare `apply { }` / `also { }` (an implicit `this` receiver, e.g. `fun add(x) = apply { items.add(x) }`) is `this.apply { }`
  kotlinCode = kotlinCode.replace(/(?<![.\w$])(apply|also)(\s*\{)/g, 'this.$1$2');
  // `::name.isInitialized` (lateinit): the property holds a value
  kotlinCode = kotlinCode.replace(/::\s*([A-Za-z_]\w*)\s*\.\s*isInitialized\b/g, '($1 != null)');
  // `data object Name` prints its name; a plain object keeps the default text
  kotlinCode = kotlinCode.replace(/\bdata\s+object\s+([A-Za-z_]\w*)(\s*:\s*[^{\n]+?)?(\s*\{)?[ \t]*(?=\n|$|\{)/g, (_w, name: string, supers: string | undefined, brace: string | undefined) => brace ? `object ${name}${supers ?? ''} { override fun toString() = "${name}";` : `object ${name}${supers ?? ''} { override fun toString() = "${name}" }`);
  // Java-style factories and constructors map onto the Kotlin collection factories (`ArrayList<Int>()`, `HashMap(other)`, `hashSetOf(...)`).
  kotlinCode = kotlinCode
    .replace(/\b(?:hashSetOf|linkedSetOf)\s*\(/g, 'mutableSetOf(').replace(/\b(?:hashMapOf|linkedMapOf)\s*\(/g, 'mutableMapOf(')
    .replace(/\bemptySet\s*(?:<[^()]*?>)?\s*\(\s*\)/g, 'setOf()').replace(/\bemptyMap\s*(?:<[^()]*?>)?\s*\(\s*\)/g, 'mapOf()').replace(/\bsortedSetOf\s*\(/g, '__kt_sortedSetOf(')
    .replace(/(?<![.\w$])(?:ArrayList|LinkedList)\s*(?:<[^()]*?>)?\s*\(/g, '__kt_newArrayList(')
    .replace(/(?<![.\w$])(?:HashSet|LinkedHashSet|TreeSet)\s*(?:<[^()]*?>)?\s*\(/g, '__kt_newHashSet(')
    .replace(/(?<![.\w$])(?:HashMap|LinkedHashMap|TreeMap)\s*(?:<[^()]*?>)?\s*\(/g, '__kt_newHashMap(')
    .replace(/(?<![.\w$])Array\s*(?:<[^()]*?>)?\s*\(/g, '__kt_newArray(');
  // `tailrec` only asks the compiler to turn self-recursion into a loop; the recursion itself computes the same result.
  kotlinCode = kotlinCode.replace(/\btailrec\s+(?=(?:(?:private|public|internal|protected|inline)\s+)*fun\b)/g, '');
  // A custom property-delegate's `getValue`/`setValue` signature takes a
  // `KProperty<*>` parameter (real reflection metadata this simulator does
  // not model) -- the star-projected generic `<*>` breaks
  // kotlinFunctions.ts's parameter-list parsing (it silently drops the
  // whole parameter, not just its type), so it is erased before that pass
  // ever sees it. `operator` is a modifier `stripModifierKeywords` doesn't
  // reach until AFTER function lowering has already run; strip it here too
  // so it never lingers as stray leftover text in front of the generated
  // `function getValue(...)`.
  kotlinCode = kotlinCode.replace(/KProperty<[^>]*>/g, 'KProperty');
  // World 16: `async<Int> { ... }` / `runBlocking<Unit> { ... }` (an explicit type argument on a
  // coroutine builder call whose block is a trailing LAMBDA, not a call
  // with parens) is real, common Kotlin used to pin a Deferred's result
  // type -- but `eraseGenericConstructorArguments` (below) only strips a
  // `<...>` immediately before `(`, never before `{`. Left alone, the
  // literal `<Int>` survives all the way into the generated JS as
  // `__kt_async<Int> { ... }`, which is not valid JavaScript at all
  // (confirmed directly: `new Function(...)` rejects it with `Unexpected
  // token 'new'`, a confusing error with no visible connection to the
  // real cause). Scoped to the coroutine builder names (`runBlocking<Unit>`
  // keeps `fun main() = runBlocking<Unit> { ... }` a valid Unit main) so
  // this can never misfire on an unrelated `x < Type > y` comparison chain.
  kotlinCode = kotlinCode.replace(/\b(async|launch|runBlocking|coroutineScope|supervisorScope|withContext)\s*<\s*[A-Za-z_][A-Za-z0-9_]*\s*>\s*(?=[({])/g, '$1 ');
  // World 15: `e::class.simpleName` (a caught exception's runtime type
  // name, e.g. printed as "NumberFormatException") -> `e.constructor.name`.
  // Every built-in and user-declared exception class is named exactly like
  // its real Kotlin counterpart (see kotlinExceptions.ts), so the JS
  // class's own `.name` already IS the right string with no extra mapping.
  // Scoped to a bare identifier receiver (`e`, `it`) -- the only shape any
  // lesson content actually uses.
  // `Customer::class.simpleName` (a class, not an instance) and a reified `T::class.simpleName` (T is the type name as a String,
  // see transpileReifiedFunctions) go through `__kt_simpleName` too; `.constructor.name` of a class is "Function".
  kotlinCode = kotlinCode.replace(/\b([A-Za-z_][A-Za-z0-9_]*)::class\.simpleName\b/g, '__kt_simpleName($1)');
  // A whole-line `@Annotation(...)` (World 15's Checked vs Unchecked
  // Exception Model lesson uses `@Throws(...)` purely to illustrate a
  // Java-interop concept Kotlin itself does not enforce -- see PITFALLS.md)
  // has no runtime meaning this simulator needs to model; JS has no
  // annotation syntax at all, so left in place it would be a hard
  // SyntaxError. Scoped to a line that IS only the annotation (matching
  // how this and every other annotation appear in lesson content, always
  // on their own source line immediately before the thing they annotate).
  kotlinCode = kotlinCode.replace(/^[ \t]*@[A-Za-z_][A-Za-z0-9_.]*\([^\n]*\)[ \t]*$/gm, '');
  // A `where T : X, T : Y` clause (multiple upper bounds on one type
  // parameter) is compile-time-only constraint metadata with no runtime
  // meaning, but kotlinFunctions.ts's return-type reader has no concept of
  // it: it just keeps consuming tokens up to the next `=`/`{`, so the whole
  // clause gets glued onto the return type with no spaces between tokens
  // (`StringwhereT:Named,T:Prioritized`) -- corrupt text that then fails to
  // parse as either a type or a function body. Erased before that pass
  // ever runs; non-greedy up to the next `=`/`{`, since a `where` clause's
  // own comma list never itself contains one.
  kotlinCode = kotlinCode.replace(/\s*\bwhere\s+[A-Za-z_][\s\S]*?(?=[={])/g, '');
  // A bare integer literal immediately followed by `.member` (e.g.
  // `4.also { ... }`, from World 13's scope-function lessons) is valid
  // Kotlin, but JS's own numeric-literal grammar greedily consumes the
  // trailing `.` into the number itself (`4.` is a complete float), then
  // fails to parse the immediately-adjacent identifier with no operator
  // between them (`4.also` -> `SyntaxError: Invalid or unexpected token`).
  // Existing lesson content already sidesteps this by hand (`(250).foo()`
  // in World 11) -- generalized here so new content doesn't have to. The
  // lookahead requires a letter/underscore right after the dot, so a real
  // decimal literal (`3.14`, digit after the dot) is never touched.
  // Not the fraction of a decimal (`5.0.isFinite()` is already valid JS) and never inside a string.
  kotlinCode = kotlinCode.split('\n').map((line) => splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/(?<![\d.\w])(\d+)\.(?=[A-Za-z_])/g, '($1).'))).join('')).join('\n');
  // A standalone Kotlin range VALUE used as an expression (World 14, e.g.
  // `(1..100).asSequence()`, `(1..1_000_000).filter { ... }`) is not
  // valid JS at all -- `1..100` isn't a JS token sequence -- unlike a
  // for-loop header's `a..b` (`transformForLoops`, a separate later
  // pass). Every lesson usage wraps the range in its own parens
  // specifically to call a method off the result, so requiring `(` and
  // `)` immediately around the range is enough to avoid colliding with a
  // for-loop header (`for (i in 1..10)` -- the parens there belong to the
  // `for(...)` call, not to `1..10` alone) or the existing `x in a..b`
  // boolean-membership form. `__kt_range` (added to the runtime below)
  // returns a real, reusable KotlinList so every existing List operation
  // -- and the new `.asSequence()` -- already works on it for free.
  kotlinCode = kotlinCode.replace(/\((\d[\d_]*)\.\.(\d[\d_]*)\)/g, '(__kt_range($1, $2))');
  // The same range-as-value case, but assigned directly with no wrapping
  // parens at all (World 14's Boss lesson: `val source = 1..100`, then
  // `source.filter { ... }` later) -- unambiguous only when the range is
  // the WHOLE remaining line (`$`, in multiline mode), since a range used
  // as part of a larger expression on the same line already needs its own
  // parens in real Kotlin to chain a method off it.
  kotlinCode = kotlinCode.replace(/=(\s*)(\d[\d_]*)\.\.(\d[\d_]*)\s*$/gm, '=$1__kt_range($2, $3)');
  kotlinCode = transpileReifiedFunctions(kotlinCode);
  // Capture Map-producing declarations before lambda lowering expands a
  // chained expression across lines. The post-lowering scan below still
  // catches declarations introduced or normalized by the lowering passes.
  const sourceMapVars = inferMapVars(kotlinCode);
  const operatorIndexVars = inferOperatorIndexVars(kotlinCode);
  const sourceInterfaceNames = getAllInterfaceNames(kotlinCode);
  const sourceMutableListVars = inferMutableListVars(kotlinCode);
  // Class headers (`class Sensor(var celsius: Int)`) are gone after the OOP lowering, so Int-typed names are read from the source too.
  const sourceIntVars = inferIntTypedVars(kotlinCode);
  // Read before the OOP pass rewrites class headers: `class Box(val items: List<Int>)` must still mark `items` as an indexed list.
  const sourceIndexedVars = inferIndexedVars(kotlinCode);
  kotlinCode = transpileExtensionProperties(kotlinCode);
  kotlinCode = stripCollectionGenerics(kotlinCode);
  const protectedCompanions = protectCompanionBlocks(kotlinCode);
  kotlinCode = protectedCompanions.code;
  const protectedGetters = protectGetterProperties(kotlinCode);
  kotlinCode = protectedGetters.code;
  const protectedBlockGetters = protectBlockGetterProperties(kotlinCode);
  kotlinCode = protectedBlockGetters.code;
  const protectedLazyBlocks = protectLazyBlocks(kotlinCode);
  kotlinCode = protectedLazyBlocks.code;
  const protectedSequenceBuilders = protectSequenceBuilders(kotlinCode);
  kotlinCode = protectedSequenceBuilders.code;
  kotlinCode = annotateWhenExpressionTypes(kotlinCode);
  kotlinCode = lowerKotlinFunctions(kotlinCode, { wholeProgram: true, companionResults: companionResultTypes(protectedCompanions.blocks), accessorProps: accessorPropertyTypes([...protectedGetters.blocks, ...protectedBlockGetters.blocks], kotlinCode) });
  protectedSequenceBuilders.blocks.forEach((block, index) => {
    // `yield(x)` is already valid JS as-is inside a `function*` (a plain
    // parenthesized operand of the `yield` keyword) -- only `yieldAll(x)`
    // needs rewriting, to JS's `yield* (x)`. Deliberately narrow ([^)]* --
    // a single argument, no nested parens): every lesson usage is exactly
    // this shape; widen only if real content needs more.
    const generatorBody = block.replace(/\byieldAll\(([^)]*)\)/g, 'yield* ($1)');
    kotlinCode = kotlinCode.replace(`__KT_SEQBLOCK_${index}__`, `new Sequence(function* () {${generatorBody}}, false)`);
  });
  protectedLazyBlocks.blocks.forEach((block, index) => {
    kotlinCode = kotlinCode.replace(`__KT_LAZYBLOCK_${index}__`, block);
  });
  protectedBlockGetters.blocks.forEach((block, index) => {
    kotlinCode = kotlinCode.replace(`__KT_BLOCKGETTER_${index}__`, block);
  });
  protectedGetters.blocks.forEach((block, index) => {
    // A getter with a lambda (`get() = items.sumOf { it.quantity }`) needs the lambda lowered: it is put back as a block getter.
    const lambdaGetter = /^([ \t]*(?:val|var)\s+[A-Za-z_][A-Za-z0-9_]*\s*:[^\n]*?)\s+get\(\)\s*=\s*([^\n]*\{[^\n]*)$/.exec(block);
    if (lambdaGetter) block = `${lambdaGetter[1]}\n  get() {\nreturn ${lowerKotlinFunctions(lambdaGetter[2])};\n  }`;
    kotlinCode = kotlinCode.replace(`__KT_GETTERPROP_${index}__`, () => block);
  });
  protectedCompanions.blocks.forEach((block, index) => {
    kotlinCode = kotlinCode.replace(`__KT_COMPANION_${index}__`, block);
  });
  kotlinCode = transpileMapDeclarations(kotlinCode);
  kotlinCode = transpileOOPDeclarations(kotlinCode);
  kotlinCode = transpileWhenBlocks(kotlinCode);
  kotlinCode = transpileMultilineIfExpressions(kotlinCode);
  const lines = kotlinCode.split('\n');
  const jsLines: string[] = [];
  const intVars = new Set([...sourceIntVars, ...inferIntTypedVars(kotlinCode)]);
  const mapVars = new Set([...sourceMapVars, ...inferMapVars(kotlinCode)]);
  const mutableListVars = new Set([...sourceMutableListVars, ...inferMutableListVars(kotlinCode)]);
  const indexedVars = new Set([...sourceIndexedVars, ...inferIndexedVars(kotlinCode)]);
  const mutableSetVars = inferMutableSetVars(kotlinCode);
  const varReadOnlyLists = inferVarReadOnlyLists(kotlinCode);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Strip comments for transformation, but preserve line structure
    const commentIdx = line.indexOf('//');
    let comment = '';
    if (commentIdx !== -1) {
      comment = line.slice(commentIdx);
      line = line.slice(0, commentIdx);
    }

    // Strip Kotlin numeric literal type suffixes (100_000L, 3.14f, 19.99d/D)
    // before treating the line as JS -- JS has no such suffix syntax, so
    // `100_000L` (still valid, since JS does support the `_` digit-group
    // separator) is otherwise a SyntaxError and the whole program fails to
    // run, even when the Kotlin code itself is perfectly correct. The
    // underscore separator needs no further handling; only the trailing
    // type-suffix letter must go.
    // Code only: inside a string `"%.2f"` or `"Room 5d"` is text, not a literal.
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/\b(\d[\d_]*(?:\.[\d_]+)?)[fFdDL]\b/g, '$1'))).join('');

    // Range-based for loops (`for (i in 1..10) { ... }`) -- must run
    // before the is/in transforms below, see `transformForLoops` above.
    line = transformForLoops(line);

    // Guard loops against infinite execution in the browser
    line = line.replace(/\b((?:while|for)\s*\([^)]*\))\s*\{/, '$1 { __kt_check_loop();');
    line = line.replace(/\bdo\s*\{/, 'do { __kt_check_loop();');

    // Truncate Int/Int division the way real Kotlin does (see
    // `wrapIntDivision` above) -- must run after suffix-stripping so a
    // literal like `100L` is already bare `100` by the time we classify it.
    line = wrapIntDivision(line, intVars);
    line = guardLiteralZeroDivisor(line);

    // `is`/`!is` type checks and `in`/`!in` range checks -- see
    // `transformTypeChecks`/`transformRanges` above.
    line = transformTypeChecks(line, sourceInterfaceNames);
    line = transformRanges(line);
    line = transformInfixOperators(line);
    line = transformRangeValues(line);

    // Null-safety expressions are lowered with token boundaries in kotlinFunctions.ts.

    // Replace Kotlin val -> const, var -> let
    // Handle: val name: Type = expr -> const name = expr
    // The type char class includes `?` so a nullable declared type
    // (`val name: String? = ...`, `val ages: List<Int?> = ...`) is
    // consumed and stripped along with the rest of the annotation, rather
    // than leaving a stray `?` behind that would break the rest of the line.
    line = line.replace(/\bval\s+([a-zA-Z0-9_]+)(?:\s*:\s*[a-zA-Z0-9_<>?,\s]+)?\s*=/g, 'const $1 =');
    line = line.replace(/\bvar\s+([a-zA-Z0-9_]+)(?:\s*:\s*[a-zA-Z0-9_<>?,\s]+)?\s*=/g, 'let $1 =');
    // A `const`/`let` declaration whose RHS is a bare, self-contained
    // literal (never continued onto a later line, unlike a chained
    // pipeline's receiver expression) needs an explicit trailing `;` --
    // Kotlin never requires one, so the line is otherwise emitted exactly
    // as written. Without it, if the VERY NEXT statement happens to start
    // with `(` (World 14's standalone `(a..b)` range values, or any bare
    // parenthesized expression used as its own statement), JS automatic
    // semicolon insertion does NOT insert a semicolon before a line
    // starting with `(` -- so `let c = 0\n(range).map(...)` is parsed as
    // ONE statement, `let c = 0(range).map(...)`, calling the number `0`
    // as a function (`TypeError: 0 is not a function`). Confirmed via
    // direct execution before narrowing the fix to this literal-RHS-only
    // shape, specifically to avoid ever terminating a real multi-line
    // chain (`val result = source\n    .filter { ... }`), whose own
    // first line's RHS is never a bare literal.
    //
    // Anchored to an actual `const`/`let` declaration at the start of the
    // line -- NOT just "the line ends with `= <literal>`" -- because the
    // unanchored version also matched a plain reassignment or a Map bracket
    // assignment (`stock["Pen"] = 15`), appending `;` there too. That is
    // harmless on its own, but the mapVars bracket-assignment transform
    // below captures "everything to end of line" as its value group, so it
    // captured the appended `;` INSIDE that value, producing
    // `stock.set("Pen", 15;)` -- a syntax error ("missing ) after argument
    // list") for any Map write whose value is a bare literal. Found via the
    // World 6 quality audit; confirmed present on main before this session's
    // unrelated 'use strict' change, i.e. not a regression from that.
    if (/^\s*(?:const|let)\s+[a-zA-Z0-9_]+\s*=\s*(-?\d+(?:\.\d+)?|true|false|null)\s*$/.test(line)) line = line + ';';

    // Kotlin single-line if-expression (`val x = if (cond) a else b`) ->
    // JS ternary -- see `transformIfExpression` above.
    line = transformIfExpression(line);
    line = transformInlineIfExpressions(line);
    line = separateSameLineElse(line);

    // Kotlin equality calls an object's generated/declared equals method;
    // JavaScript's `==` only compares object identity. This narrow lowering
    // covers the identifiers and property accesses used by the teaching
    // runner while retaining primitive equality behavior.
    // `==` binds LOWER than arithmetic, so when either neighbouring operand is
    // really part of a larger arithmetic expression (`n % m == 0`,
    // `a + b == c`, `a == b + 1`) rewriting just the two nearest tokens would
    // capture the wrong operands (`n % __kt_equals(m, 0)` -> NaN). Those
    // comparisons are between plain numbers, where JS `==` is already correct.
    // An operand can also be a call chain (`Point(1, 2) == Point(1, 2)`, `a.copy() == b`): a data class
    // compared inline must still use its generated equals, not JavaScript identity.
    const EQ_ARGS = '\\((?:[^()]|\\([^()]*\\))*\\)';
    const EQ_OPERAND = `(?:new\\s+)?[A-Za-z_][A-Za-z0-9_]*(?:${EQ_ARGS})?(?:\\.[A-Za-z_][A-Za-z0-9_]*(?:${EQ_ARGS})?)*`;
    line = line.replace(new RegExp(`(?<![.\\w])(${EQ_OPERAND})\\s*(==|!=)(?!=)\\s*(${EQ_OPERAND}|\\d+|true|false|null)(?![\\w(])`, 'g'),
      (whole: string, left: string, op: string, right: string, offset: number, source: string) => {
        const before = source.slice(0, offset).trimEnd();
        const after = source.slice(offset + whole.length).trimStart();
        if (/[+\-*/%]$/.test(before) || /^[+\-*/%(\[]/.test(after)) return whole;
        // `x != null` / `x != 3` keep JavaScript's own primitive comparison; only `==` needs the null-safe helper there.
        if (op === '!=') return /^(?:\d+|true|false|null)$/.test(right) ? whole : `!__kt_equals(${left}, ${right})`;
        return `__kt_equals(${left}, ${right})`;
      });

    // Handle Kotlin fun declarations
    // fun foo(a: Int, b: String): String { -> function foo(a, b) {
    // The return type may be generic with several arguments (`Pair<Int,Int>`), qualified, or a function type (`(Int) -> Int`).
    const varargPrologue = (params: string) => splitTopLevelCommas(params).map((p) => /^\s*vararg\s+([a-zA-Z0-9_]+)/.exec(p)?.[1]).filter(Boolean).map((n) => ` ${n} = __kt_varargs(${n});`).join('');
    line = line.replace(/\bfun\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(?:\s*:\s*[\w<>?,.*\s()-]+?)?\s*\{/g, (_, name, params) => {
      return `function ${name}(${cleanKotlinParams(params)}) {${varargPrologue(params)}`;
    });

    // Handle single-expression functions: fun sum(a: Int, b: Int) = a + b
    line = line.replace(/\bfun\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(?:\s*:\s*[\w<>?,.*\s()-]+?)?\s*=\s*(.+)$/g, (_, name, params, expr) => {
      return `function ${name}(${cleanKotlinParams(params)}) {${varargPrologue(params)} return ${expr}; }`;
    });

    // Transform Kotlin string templates within double quotes:
    // "Hello $name! You have ${coins + 5} coins" -> `Hello ${name}! You have ${coins + 5} coins`
    line = line.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, inner) => {
      if (inner.includes('$')) {
        // Convert ${expr} -> ${expr}
        // Convert $varName -> ${varName}
        // A `$` immediately preceded by a backslash is Kotlin's OWN escape
        // for a literal, non-interpolating dollar sign (`\$price` should
        // print the two characters "$price", not run price as a template
        // reference) -- the negative lookbehind skips converting that one
        // into `${price}`. The backslash+dollar is then left exactly as
        // written in the resulting JS template literal, where `\$` (not
        // followed by `{`) is ALSO already a literal-dollar escape in JS,
        // so no further rewriting is needed for it to print correctly.
        let transformed = inner.replace(/(?<!\\)\$([a-zA-Z_][a-zA-Z0-9_]*)/g, '${$1}');
        // prepareKotlinSource encodes every `/` inside a string literal as `\u002f`
        // (so line-level regexes never see it); an expression placeholder is CODE,
        // where that escape is a syntax error, so decode it before lowering.
        transformed = replaceTemplatePlaceholders(transformed, (expression) => '${__kt_format(' + transformInlineIfExpressions(lowerKotlinFunctions(expression.replace(/\\u002f/g, '/').split(NESTED_QUOTE).join('"')), true) + ')}');
        return `\`${transformed}\``;
      }
      return match;
    });

    // Handle Kotlin collections. Map pairs use Kotlin's `key to value`
    // syntax; this deliberately supports the simple literal/identifier
    // pairs used by the beginner Collection Valley lessons.
    line = line.replace(/\b(mapOf|mutableMapOf)\(([^)]*)\)/g, (_whole, factory, args) => {
      const pairs = args.split(',').map((entry: string) => {
        const parts = entry.trim().split(/\s+to\s+/);
        return parts.length === 2 ? `[${parts[0]}, ${parts[1]}]` : entry;
      });
      return `${factory === 'mutableMapOf' ? '__kt_mutableMapOf' : '__kt_mapOf'}(${pairs.join(', ')})`;
    });
    // Map element access: `m[k]` -> get, `m[k] = v` -> set (keys may themselves contain brackets: m[names[i]]).
    line = rewriteIndexAccess(line, operatorIndexVars, 'operator');
    line = rewriteIndexAccess(line, mapVars, 'map');
    // `map.keys` / `.values` / `.entries` are properties in Kotlin (JS Maps have same-named methods).
    for (const mapVar of mapVars) {
      const escaped = mapVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\.(keys|values|entries)\\b(?!\\s*\\()`, 'g'), (_w, kind) => `__kt_mapView(${mapVar}, '${kind}')`);
    }
    // Bounds-checked list / array element access (maps were handled above and are excluded).
    line = rewriteIndexAccess(line, new Set([...indexedVars].filter((name) => !mapVars.has(name))));
    line = rewriteLiteralIndexing(line);
    // Compound assignment on collections: `xs -= x`, `set += x`, `set -= x`, `map -= key`, `map += k to v`,
    // and `var readOnlyList += x` (which builds a new list).
    for (const name of new Set([...mutableListVars, ...mutableSetVars, ...mapVars])) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\s*-=\\s*([^;\\n]+)`, 'g'), (_w, value) => `${name}.remove(${value.trim()})`);
    }
    for (const name of mutableSetVars) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\s*\\+=\\s*([^;\\n]+)`, 'g'), (_w, value) => `${name}.add(${value.trim()})`);
    }
    for (const name of mapVars) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\s*\\+=\\s*([^;\\n]+)`, 'g'), (_w, value) => {
        // `map += key to value`; the leading `;` guards against JS joining this line onto the previous one.
        const pair = value.trim().match(/^(.+?)\s+to\s+(.+)$/);
        return pair ? `${name}.set(${pair[1]}, ${pair[2]})` : `;((__kt_pair) => ${name}.set(__kt_pair.first, __kt_pair.second))(${value.trim()})`;
      });
    }
    for (const name of varReadOnlyLists) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\s*\\+=\\s*([^;\\n]+)`, 'g'), (_w, value) => `${name} = ${name}.plus(${value.trim()})`);
      line = line.replace(new RegExp(`(?<![\\w.])${escaped}\\s*-=\\s*([^;\\n]+)`, 'g'), (_w, value) => `${name} = ${name}.minus(${value.trim()})`);
    }
    for (const listVar of mutableListVars) {
      const escaped = listVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // `receiver.xs += value` as well as a bare `xs += value` -- an
      // optional leading `identifier.` receiver chain covers a mutable
      // list reached through a property (`b.xs += 2`), not just a local
      // variable. The `[^;\n]+` value stops at the next statement
      // (several statements often share one physical line here), so it
      // never swallows a trailing `; nextStatement()` as part of the value.
      const plusAssign = new RegExp(`((?:[a-zA-Z_][a-zA-Z0-9_]*\\.)?${escaped})\\s*\\+=\\s*([^;\\n]+)`, 'g');
      line = line.replace(plusAssign, (_whole, target, value) => `${target}.add(${value.trim()})`);
    }
    // A nullable collection reference's safe-call size (`bonuses?.size`) is
    // handled separately from plain `.size` -- JS's own `?.` short-circuits
    // to `undefined` before ever reaching a property, but `__kt_size`
    // unconditionally reads `.size`/`.length`, which would throw on a null
    // receiver instead of safely producing null. Must run before the plain
    // `.size` replace below (which wouldn't match the `?` anyway, but this
    // keeps the safe-call case handled first and explicitly).
    line = line.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\?\.size\b(?!\s*\()/g, '($1 == null ? null : __kt_size($1))');
    // The receiver can itself be a member-access chain (`service.items.size`,
    // not just a bare `list.size`) -- capture every dotted segment leading
    // up to the final `.size`, not just the single identifier closest to
    // it, so the whole chain becomes the argument to `__kt_size` instead of
    // only its last segment (`service.__kt_size(items)`, invalid). The
    // negative lookahead excludes a real `.size(...)` METHOD call (a class
    // or object member happens to be named `size`, distinct from a
    // collection's `.size` PROPERTY) from being mistaken for one.
    // (not after `)` / `]`: in `Wrapper(x).value.size` the receiver is the whole call chain, not just `value`)
    line = line.replace(/(?<![)\]]\.?)\b([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\.size\b(?!\s*\()/g, '__kt_size($1)');
    // Kotlin's String.split returns a List, but JS split returns a plain Array with no `.size`/`.first()`, so
    // `"a,b".split(",").size` printed null. Route the call through `__kt_split` (see its definition).
    line = line.replace(/\.split\(/g, '.__kt_split(');
    // `outer@ for (...)` / `break@outer` / `continue@outer` are JavaScript labels (`return@name` is a lambda return: untouched).
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/\b([A-Za-z_]\w*)@\s*(?=(?:for|while|do)\b)/g, '$1: ').replace(/\b(break|continue)@([A-Za-z_]\w*)/g, '$1 $2'))).join('');
    // `eval` / `arguments` cannot be called by those names in strict JavaScript (a `when` branch result never passes the lowerer)
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/(?<![.\w$])(eval|arguments)(?=\s*\()/g, '__kt_$1'))).join('');
    // `f(*array)`: the spread operator (a `*` that starts an argument can never be multiplication)
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/([(,]\s*)\*(?=\s*[A-Za-z_])/g, '$1...'))).join('');
    // `String(charArray)` joins the chars (JavaScript's String([...]) would put commas between them).
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/(?<![.\w$])String\s*\(/g, '__kt_String('))).join('');
    // Kotlin's String.replace / startsWith / endsWith differ from JavaScript's (all occurrences, ignoreCase); see kotlinStdlib.ts.
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/\.(replace|startsWith|endsWith|trim|trimStart|trimEnd|substring)\(/g, '.__kt_$1('))).join('');
    // A Map reached through a call or a property (`m.filterValues { ... }.keys`, `this.data.values`) has no variable name for the
    // rewrite above; `__kt_keys` etc. give Kotlin's list on a Map and the plain property on anything else.
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/(?<=[\w)\]])\.(keys|values|entries)\b(?!\s*\()/g, '.__kt_$1'))).join('');
    // A Map's forEach hands Kotlin a Map.Entry (or key, value), not JS's (value, key); see `__kt_forEach`.
    line = splitCodeAndStrings(line).map((c) => (c.isString ? c.text : c.text.replace(/\.forEach\s*\(/g, '.__kt_forEach('))).join('');
    line = line.replace(/\b(?:intArrayOf|doubleArrayOf|longArrayOf|booleanArrayOf|charArrayOf|arrayListOf)\(/g, (whole) => (whole.startsWith('arrayListOf') ? '__kt_mutableListOf(' : '__kt_arrayOf('));
    line = line.replace(/\b(?:IntArray|DoubleArray|LongArray)\(([^()]*)\)/g, '__kt_intArray($1)');
    line = line.replace(/\barrayOf\(/g, '__kt_arrayOf(');
    line = line.replace(/\b(?:listOf|emptyList)\(/g, '__kt_listOf(');
    line = line.replace(/\bmutableListOf\(/g, '__kt_mutableListOf(');
    line = line.replace(/\bsetOf\(/g, '__kt_setOf(');
    line = line.replace(/\bmutableSetOf\(/g, '__kt_mutableSetOf(');

    jsLines.push(line + comment);
  }

  return jsLines.join('\n');
}



/**
 * Compiles and runs a Kotlin program in-browser with sandboxing,
 * output streaming, diagnostic generation, and optional test case execution.
 */
export async function compileAndRunKotlin(
  code: string,
  options?: {
    testCase?: { call?: string; expected?: string };
    expectedOutput?: string;
    timeoutMs?: number;
  }
): Promise<KotlinExecutionResult> {
  const startTime = performance.now();
  const timeoutMs = options?.timeoutMs || 2000;

  const originalCode = code;
  try { code = prepareKotlinSource(code); }
  catch (err) {
    return { success: false, output: '', logs: [], error: { message: `Syntax error: ${(err as Error).message}`, line: err instanceof KotlinSourceError ? err.line : 1, unlocated: !(err instanceof KotlinSourceError), type: 'syntax_error' }, executionTimeMs: 0, exitCode: 1 };
  }

  // World 16: `Job`/`CoroutineName`/`CoroutineExceptionHandler`/`Dispatchers`
  // are bare top-level identifiers a coroutine lesson's code needs in
  // scope (`coroutineContext[Job]`, `Dispatchers.Default`, etc.), but
  // they are also completely ordinary, plausible NAMES a non-coroutine
  // lesson's own Kotlin might declare for unrelated domain types --
  // World 13's own `data class Job(var state: String = "")` is exactly
  // this collision, confirmed directly: unconditionally injecting
  // `const Job = ...` into every generated script's top-level scope
  // broke that lesson with `Identifier 'Job' has already been declared`.
  // Real Kotlin never has this problem (these names are only in scope
  // where a file actually imports kotlinx.coroutines); this flat-scope
  // simulator reproduces that by only injecting the coroutine prelude
  // when the ORIGINAL source actually references coroutines.
  // Library classes the program uses (by import or by name) and does not declare itself: a same-named user class must win.
  const libraryClasses = ['Mutex', 'AtomicInteger', 'AtomicLong'].filter((name) => new RegExp(`\\b${name}\\s*\\(`).test(code) && !new RegExp(`\\b(?:class|object|interface)\\s+${name}\\b`).test(code));
  const usesCoroutines = /\bkotlinx\.coroutines\b|\brunBlocking\b|\blaunch\s*\(|\basync\s*\(|\bcoroutineScope\s*\{|\bsupervisorScope\s*\{|\bwithContext\s*\(|\bcoroutineContext\b|\bCoroutineStart\b|\bCoroutineName\s*\(|\bDispatchers\./.test(code);

  // 1. Static Validation (Lexical, Syntax, Immutability, Type Constraints). The real Kotlin grammar (kotlinSyntaxCheck.ts) checks the
  // syntax; the engine's own rules give more specific messages, so one of them wins when it reports the same line or an earlier one.
  await ensureKotlinSyntax();
  const syntax = checkKotlinSyntax(originalCode);
  const syntaxError: KotlinDiagnostic | null = syntax ? { message: `Syntax error: ${syntax.message}`, line: syntax.line, column: syntax.column, token: syntax.token, type: 'syntax_error' } : null;
  // The rules judge classes at top level, so they see nested declarations moved out (see kotlinNestedClasses.ts); lines map back.
  const hoisted = hoistNestedDeclarations(code, code.split('\n').map((_, i) => i + 1));
  const ruleCode = hoisted.code;
  const classRule = () => { const e = checkClassMemberRules(ruleCode); return e ? { message: `Compilation error: ${e.message}`, line: e.line, type: e.type } as KotlinDiagnostic : null; };
  const rawRuleError = staticValidateKotlin(ruleCode) ?? checkReadOnlyCollectionMutation(ruleCode) ?? checkFinalClassInheritance(ruleCode) ?? checkStructureRules(ruleCode) ?? classRule();
  const mappedRuleError = rawRuleError && !rawRuleError.unlocated ? { ...rawRuleError, line: hoisted.lineMap[rawRuleError.line - 1] ?? rawRuleError.line } : rawRuleError;
  const nestedError: KotlinDiagnostic | null = hoisted.problem ? { message: hoisted.problem.message, line: hoisted.problem.line, token: hoisted.problem.token, occurrence: 0, type: 'unresolved_reference' } : null;
  const ruleError = nestedError && (!mappedRuleError || mappedRuleError.unlocated || nestedError.line <= mappedRuleError.line) ? nestedError : mappedRuleError;
  const firstError = syntaxError && (!ruleError || ruleError.unlocated || ruleError.line > syntaxError.line) ? syntaxError : ruleError;
  if (firstError) {
    return { success: false, output: '', logs: [], error: firstError, executionTimeMs: Math.round(performance.now() - startTime), exitCode: 1 };
  }
  // Libraries the editor does not simulate: once the program has passed the compile checks above, say so plainly instead of failing on a
  // name from them ("Unresolved reference: flowOf" would suggest the learner made a mistake).
  {
    const unsupported: Array<[RegExp, string]> = [
      [/^[ \t]*import[ \t]+kotlinx\.coroutines\.flow\b/m, 'Flow (kotlinx.coroutines.flow)'],
      [/^[ \t]*import[ \t]+java\.(?:io|nio|net|time|sql)\b/m, 'Java I/O, networking and date/time APIs'],
      [/^[ \t]*import[ \t]+kotlinx\.serialization\b/m, 'kotlinx.serialization'],
    ];
    for (const [pattern, name] of unsupported) {
      const found = pattern.exec(originalCode);
      if (found) return { success: false, output: '', logs: [], error: { message: `${name} is not supported in the CodeDo editor yet, so this program cannot run here.`, line: originalCode.slice(0, found.index).split('\n').length, type: 'runtime_error' }, executionTimeMs: 0, exitCode: 1 };
    }
  }

  // Note: the "printed a literal instead of computing it" static check
  // (`detectHardcodedOutput`) deliberately does NOT run here unconditionally
  // -- some lessons' entire correct answer genuinely IS `println("literal")`
  // (e.g. World 1's very first `println` exercise, which has no declared
  // input at all), and flagging those would break every correct submission.
  // It only runs from `runKotlinCode`, gated on `hardcodeCheck` being present
  // -- that field only exists on lessons an author has verified DO have a
  // real, swappable input driving the output, so a bare literal print there
  // is unambiguously wrong. See `runKotlinCode` below.

  // 2. Transpilation to Safe JS
  const lineMarked = insertLineMarkers(braceSingleStatementLoops(code));
  const marked = hoistNestedDeclarations(lineMarked.code, lineMarked.lineMap);
  let transpiledJS = '';
  try {
    // Line markers (`__kt_line = N`) let a runtime error report the Kotlin line that was running; see kotlinLineMarkers.ts.
    transpiledJS = wrapFunctionsForLines(transpileKotlinToJS(marked.code), expressionBodyLines(code));
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    return {
      success: false,
      output: '',
      logs: [],
      error: {
        message: `Compilation error: ${err?.message || 'Failed to parse Kotlin code'}`,
        line: err instanceof KotlinFunctionError ? marked.lineMap[err.line - 1] ?? err.line : 1,
        token: err instanceof KotlinFunctionError ? err.token : undefined,
        occurrence: err instanceof KotlinFunctionError ? err.occurrence : undefined,
        unlocated: !(err instanceof KotlinFunctionError),
        type: 'compiler_error',
      },
      executionTimeMs: elapsed,
      exitCode: 1,
    };
  }

  // 3. Execution Environment
  const stdout: string[] = [];
  // Tracks whether the last stdout entry is a line still "open" (started by
  // a print() call that hasn't been newline-terminated yet) vs. a completed
  // line (the previous call was println(), or there's no previous call at
  // all). Both print() and println() must consult and update this flag --
  // print() alone assuming the last entry is always open breaks as soon as
  // it's preceded by a println() (which must start a fresh entry, not
  // append to the finished line above it).
  let lineOpen = false;
  const appendOutput = (text: string) => {
    if (lineOpen && stdout.length > 0) {
      stdout[stdout.length - 1] += text;
    } else {
      stdout.push(text);
    }
  };
  const formatKotlinValue = (value: any): string => {
    // JS optional chaining (`?.`) short-circuits to `undefined`, not
    // `null`, when the left side is nullish -- but Kotlin has only ONE
    // null value, and a safe-call chain that fizzles out should print
    // exactly like an explicit `null` would. Without this, `x?.length`
    // would print "undefined" for a null x while `x` itself prints "null",
    // an inconsistency with no equivalent in real Kotlin.
    if (value === undefined) return 'null';
    // A bare function value reaching print almost always means a method call
    // was written without its parentheses (e.g. `x.toFloat` instead of
    // `x.toFloat()`) -- real Kotlin rejects this at compile time as a type
    // mismatch, but this simulator has no type checker to catch it earlier.
    // Without this check, `String(value)` below would silently print the
    // function's own transpiled JS source text (e.g.
    // "function(){return Number(Math.fround(...))}") as if it were valid
    // program output -- a confusing, implementation-leaking result instead
    // of a clear signal of what actually went wrong.
    if (typeof value === 'function' && value.__kt_value !== undefined) return formatKotlinValue(value.__kt_value);
    if (typeof value === 'function') {
      throw new Error(
        'Expected a value, but got a function reference instead -- did you forget the parentheses () when calling a method (e.g. write toFloat() instead of toFloat)?'
      );
    }
    if (value instanceof KotlinRange) return value.toString();
    if (value instanceof KotlinIndexedValue) return `IndexedValue(index=${formatKotlinValue(value.first)}, value=${formatKotlinValue(value.second)})`;
    if (value instanceof KotlinMapEntry) return `${formatKotlinValue(value.first)}=${formatKotlinValue(value.second)}`;
    // A fractional number can only be a Double/Float: print it as Java does (`1.23456789E7`, `1.0E-5`). A whole number may be an Int.
    if (typeof value === 'number' && !Number.isInteger(value) && Number.isFinite(value)) return javaDoubleToString(value);
    if (value instanceof KotlinPair) return `(${formatKotlinValue(value.first)}, ${formatKotlinValue(value.second)})`;
    if (Array.isArray(value)) return `[${value.map(formatKotlinValue).join(', ')}]`;
    if (value instanceof Set) return `[${[...value].map(formatKotlinValue).join(', ')}]`;
    if (value instanceof Map) return `{${[...value.entries()].map(([k, v]) => `${formatKotlinValue(k)}=${formatKotlinValue(v)}`).join(', ')}}`;
    return String(value);
  };

  (globalThis as any).__kt_formatValue = formatKotlinValue;
  if (!(Number.prototype as any).toLong) {
    Object.defineProperties(Number.prototype, {
      toLong: { value: function () { const value = Math.trunc(Number(this)); if (!Number.isSafeInteger(value)) throw new Error('Long conversion outside the editor safe-integer range'); return value; } },
      toInt: { value: function () { return Math.trunc(Number(this)); } },
      toDouble: { value: function () { return Number(this); } },
      isFinite: { value: function () { return Number.isFinite(Number(this)); } },
      isNaN: { value: function () { return Number.isNaN(Number(this)); } },
      isInfinite: { value: function () { const n = Number(this); return n === Infinity || n === -Infinity; } },
      // Math.fround alone gives the nearest true 32-bit float value, but
      // printing that raw double (e.g. 19.989999771118164 for 19.99f)
      // exposes float32-rounding noise that real Kotlin's Float.toString
      // never shows -- it prints the shortest decimal that round-trips to
      // the same float32, e.g. "19.99". Rounding to 7 significant digits
      // (float32's precision ceiling) before converting back to a plain
      // number reproduces that shortest-decimal behavior for lesson-scale
      // values without needing a full float32 shortest-round-trip algorithm.
      toFloat: { value: function () { return Number(Math.fround(Number(this)).toPrecision(7)); } },
    });
  }
  // World 13's `let`/`run`/`apply`/`also` are Kotlin extension functions on
  // EVERY type (`T.let(...)`, etc.), so this simulator has no single
  // built-in prototype to attach them to -- Object.prototype is the one
  // place every value (including boxed primitives, via the standard JS
  // autoboxing that already happens for e.g. `"x".length`) inherits from.
  // kotlinFunctions.ts already lowers each call's trailing lambda to a
  // plain function that takes the receiver as its own first positional
  // parameter (never JS `this`) -- see the `size: String.() -> Int = {
  // length }` case this reuses -- so all four just need to call `block`
  // with `this` (unboxed back to a primitive first; a boxed String/Number/
  // Boolean would otherwise make e.g. `it is String` checks see `typeof
  // 'object'` instead of the real primitive type). `run`/`apply` receive a
  // receiver-style block (no separate argument), but that's exactly the
  // same call shape once lowered -- both forms already collapse to a
  // single positional parameter. `also`/`apply` discard the block's own
  // result and return the original (unboxed) receiver instead, matching
  // Kotlin. `Object.prototype.apply` does not shadow `Function.prototype
  // .apply` for an actual function value -- Function.prototype is closer
  // in the prototype chain and already defines its own `apply` -- so this
  // only ever applies to non-function receivers, which is the only case
  // any World 13 lesson exercises.
  if (!(Object.prototype as any).let) {
    const __kt_unbox = (value: any) => (value instanceof Number || value instanceof String || value instanceof Boolean) ? value.valueOf() : value;
    Object.defineProperties(Object.prototype, {
      let: { value: function (block: (receiver: any) => any) { return block(__kt_unbox(this)); }, configurable: true, writable: true },
      run: { value: function (block: (receiver: any) => any) { return block(__kt_unbox(this)); }, configurable: true, writable: true },
      also: { value: function (block: (receiver: any) => any) { const receiver = __kt_unbox(this); block(receiver); return receiver; }, configurable: true, writable: true },
      apply: { value: function (block: (receiver: any) => any) { const receiver = __kt_unbox(this); block(receiver); return receiver; }, configurable: true, writable: true },
      // World 14's Creating Sequences lesson uses `(n--).takeIf { it > 0 }`
      // to model the single-use, no-seed generateSequence overload. Same
      // `it`-argument shape as let/also -- kotlinFunctions.ts's generic
      // trailing-lambda lowering already defaults an UNREGISTERED call
      // name to an `it`-bound lambda (see the `!expected?.params && label`
      // branch in `lambda()`), so no signature registration was needed
      // here, only the runtime method itself.
      takeIf: { value: function (predicate: (receiver: any) => boolean) { const receiver = __kt_unbox(this); return predicate(receiver) ? receiver : null; }, configurable: true, writable: true },
      takeUnless: { value: function (predicate: (receiver: any) => boolean) { const receiver = __kt_unbox(this); return predicate(receiver) ? null : receiver; }, configurable: true, writable: true },
      // World 15's receiver form, `"25".runCatching { toInt() }` -- a
      // dot-prefixed call, so kotlinFunctions.ts resolves it via
      // `scopeMemberSignatures` (like let/run/also/apply) rather than the
      // bare-name `__kt_runCatching` rename above, and it reaches the
      // runtime as a real method call needing a real prototype method.
      runCatching: { value: function (block: () => any) { return kotlinRunCatching(block, __kt_unbox(this)); }, configurable: true, writable: true },
    });
  }
  // World 13's apply/also Explore examples build up text with
  // StringBuilder (`StringBuilder().apply { append("dark"); append(...) }`)
  // -- there is no JS equivalent, so `new StringBuilder()` (inserted by
  // `insertNewForInstantiation`, which also needs "StringBuilder" added to
  // its recognized class-name set -- see transpileKotlinToJS) would
  // otherwise fail with "StringBuilder is not defined". Defined as a real
  // global rather than a sandbox-passed parameter, the same way Number/
  // Array/Map already work inside the generated code without being
  // explicitly injected. `.append` returns `this` to support the real
  // Kotlin chaining style (`sb.append(a).append(b)`), and `toString()`
  // covers both explicit calls and this simulator's own print/format path
  // (`formatKotlinValue` falls back to `String(value)`, which itself calls
  // `toString()`).
  if (!(globalThis as any).StringBuilder) {
    (globalThis as any).StringBuilder = class KotlinStringBuilder {
      __kt_text: string;
      constructor(initial: string = '') { this.__kt_text = initial; }
      append(value: any) { this.__kt_text += String(value); return this; }
      appendLine(value: any = '') { this.__kt_text += String(value) + '\n'; return this; }
      get length() { return this.__kt_text.length; }
      isEmpty() { return this.__kt_text.length === 0; }
      isNotEmpty() { return this.__kt_text.length > 0; }
      reverse() { this.__kt_text = Array.from(this.__kt_text).reverse().join(''); return this; }
      insert(index: number, value: any) { if (index < 0 || index > this.__kt_text.length) throw new (globalThis as any).StringIndexOutOfBoundsException(`offset ${index}, length ${this.__kt_text.length}`); this.__kt_text = this.__kt_text.slice(0, index) + String(value) + this.__kt_text.slice(index); return this; }
      deleteCharAt(index: number) { if (index < 0 || index >= this.__kt_text.length) throw new (globalThis as any).StringIndexOutOfBoundsException(`index ${index},length ${this.__kt_text.length}`); this.__kt_text = this.__kt_text.slice(0, index) + this.__kt_text.slice(index + 1); return this; }
      delete(start: number, end: number) { this.__kt_text = this.__kt_text.slice(0, start) + this.__kt_text.slice(Math.min(end, this.__kt_text.length)); return this; }
      setLength(length: number) { this.__kt_text = length <= this.__kt_text.length ? this.__kt_text.slice(0, length) : this.__kt_text + '\0'.repeat(length - this.__kt_text.length); }
      clear() { this.__kt_text = ''; return this; }
      indexOf(part: string) { return this.__kt_text.indexOf(part); }
      lastIndexOf(part: string) { return this.__kt_text.lastIndexOf(part); }
      substring(start: number, end?: number) { return this.__kt_text.substring(start, end); }
      get(index: number) { if (index < 0 || index >= this.__kt_text.length) throw new (globalThis as any).StringIndexOutOfBoundsException(`index ${index},length ${this.__kt_text.length}`); return this.__kt_text[index]; }
      toString() { return this.__kt_text; }
    };
  }
  // World 15: the exception hierarchy, `Result`/`runCatching`, `require`/
  // `check`, and `__kt_throw` -- all exposed as real globals (not sandbox
  // parameters) the same way StringBuilder/Sequence already are, so
  // generated code can reference them by their literal Kotlin names with
  // no separate call-site renaming pass. `__kt_throw` turns Kotlin's
  // expression-position `throw` (Elvis right-hand side, an if-expression
  // branch) into a plain function call -- JS's own `throw` is a statement
  // and cannot appear inside a ternary or `??`, so every expression-
  // position `throw` is rewritten to call this instead (see
  // `transformIfExpression`/`kotlinFunctions.ts`'s elvis handling).
  if (!(globalThis as any).CancellationException) (globalThis as any).CancellationException = CancellationException;
  if (!(globalThis as any).NullPointerException) Object.assign(globalThis as any, { NullPointerException, ArrayIndexOutOfBoundsException, StringIndexOutOfBoundsException, NotImplementedError, AssertionError });
  if (!(globalThis as any).Exception) {
    (globalThis as any).Throwable = Throwable;
    (globalThis as any).Exception = Exception;
    (globalThis as any).RuntimeException = RuntimeException;
    (globalThis as any).IllegalStateException = IllegalStateException;
    (globalThis as any).IllegalArgumentException = IllegalArgumentException;
    (globalThis as any).NumberFormatException = NumberFormatException;
    (globalThis as any).IndexOutOfBoundsException = IndexOutOfBoundsException;
    (globalThis as any).ArithmeticException = ArithmeticException;
    (globalThis as any).ClassCastException = ClassCastException;
    (globalThis as any).NoSuchElementException = NoSuchElementException;
    (globalThis as any).UnsupportedOperationException = UnsupportedOperationException;
    (globalThis as any).Result = KotlinResult;
    (globalThis as any).runCatching = (block: () => any) => kotlinRunCatching(block);
    (globalThis as any).require = (condition: boolean, lazyMessage?: () => string) => {
      if (!condition) throw new IllegalArgumentException(lazyMessage ? lazyMessage() : 'Failed requirement.');
    };
    (globalThis as any).check = (condition: boolean, lazyMessage?: () => string) => {
      if (!condition) throw new IllegalStateException(lazyMessage ? lazyMessage() : 'Check failed.');
    };
    (globalThis as any).error = (message: any) => { throw new IllegalStateException(String(message)); };
    (globalThis as any).__kt_throw = (error: any) => { throw error; };
  }
  // World 14: Sequence and its creation functions, exposed as real
  // globals (not sandbox parameters) the same way StringBuilder is --
  // generated code references them by their literal Kotlin names
  // (`Sequence`, `sequenceOf`, `generateSequence`), so no separate
  // call-site renaming pass is needed.
  if (!(globalThis as any).Sequence) {
    (globalThis as any).Sequence = KotlinSequence;
    // World 14's Eager Collection Processing lesson has a Predict question
    // asking `x is List<Int>` (contrasted against `is Sequence<Int>`
    // elsewhere in the same world) -- needs "List" resolvable as a real
    // instanceof target the same way "Sequence" now is. Scoped to just
    // List for now, matching the one case that actually needs it; extend
    // with MutableList/Set/Map only once real content requires them too.
    (globalThis as any).List = KotlinList;
    (globalThis as any).sequenceOf = (...items: any[]) => new KotlinSequence(() => items[Symbol.iterator](), false);
    // Two distinct real-Kotlin overloads, disambiguated by arity (JS
    // leaves `next` undefined for a one-argument call): `generateSequence
    // (seed, nextFunction)` always yields the seed first, then repeatedly
    // reapplies nextFunction to the previous value until it returns null
    // -- reusable, since each fresh iteration recomputes from the same
    // seed. `generateSequence(nextFunction)` (no seed) instead calls a
    // stateful zero-arg function for every value including the first, and
    // real Kotlin documents this overload as constrained to one
    // iteration -- a second traversal must throw, not silently restart.
    (globalThis as any).generateSequence = (seedOrNext: any, next?: (prev: any) => any) => {
      if (typeof next === 'function') {
        const seed = seedOrNext;
        return new KotlinSequence(function* () {
          let current = seed;
          while (current != null) { yield current; current = next(current); }
        }, false);
      }
      const nextFn = seedOrNext as () => any;
      return new KotlinSequence(function* () {
        let value = nextFn();
        while (value != null) { yield value; value = nextFn(); }
      }, true);
    };
    (globalThis as any).__kt_range = (a: number, b: number) => makeRange(a, b);
  }
  // World 16 Lesson 11: `GlobalScope.launch { ... }` is the anti-pattern
  // the lesson teaches learners to avoid -- see `kotlinGlobalScopeLaunch`'s
  // doc comment in kotlinCoroutines.ts for exactly what this does and does
  // not simulate. Exposed as a real global the same way Exception/Sequence/
  // StringBuilder already are, so generated code can reference the literal
  // Kotlin name with no separate call-site renaming pass.
  if (!(globalThis as any).GlobalScope) {
    (globalThis as any).GlobalScope = { launch: kotlinGlobalScopeLaunch };
  }
  // String.split -> a real Kotlin List; several delimiters (`split(",", " ")`) are alternatives, not a JS limit.
  if (!(String.prototype as any).__kt_split) {
    Object.defineProperty(String.prototype, '__kt_split', { value: function (...args: any[]) {
      // split(delimiter..., ignoreCase = false, limit = 0): strings are delimiters, a Boolean is ignoreCase, a number is the limit.
      const text = String(this);
      const delimiters = args.filter((a) => typeof a === 'string');
      const ignoreCase = args.some((a) => a === true);
      const limit = args.find((a) => typeof a === 'number') ?? 0;
      if (!delimiters.length) return new KotlinList(text.split(args[0] as any));
      if (limit < 0) throw new (globalThis as any).IllegalArgumentException(`Limit must be non-negative, but was ${limit}`);
      const hay = ignoreCase ? text.toLowerCase() : text;
      const needles = delimiters.map((d) => (ignoreCase ? d.toLowerCase() : d));
      const parts: string[] = [];
      let from = 0, search = 0;
      while (limit === 0 || parts.length < limit - 1) {
        let at = -1, len = 0;
        for (let k = 0; k < needles.length; k++) { const i = hay.indexOf(needles[k], search); if (i >= 0 && (at < 0 || i < at)) { at = i; len = needles[k].length; } }
        if (at < 0) break;
        if (len === 0) { search = at + 1; if (search > text.length) break; continue; }
        parts.push(text.slice(from, at));
        from = search = at + len;
      }
      parts.push(text.slice(from));
      return new KotlinList(parts);
    } });
    // A user class that declares its own `split` method keeps working: the renamed call falls through to it.
    Object.defineProperty(Object.prototype, '__kt_split', { value: function (...args: any[]) { return (this as any).split(...args); }, writable: true, configurable: true });
  }
  if (!(String.prototype as any).trimIndent) Object.defineProperty(String.prototype, 'trimIndent', { value: function () {
    const lines = String(this).split(/\r?\n/);
    if (lines.length && !lines[0].trim()) lines.shift();
    if (lines.length && !lines.at(-1)!.trim()) lines.pop();
    const nonblank = lines.filter(line => line.trim());
    const indent = nonblank.length ? Math.min(...nonblank.map(line => line.match(/^\s*/)![0].length)) : 0;
    return lines.map(line => line.trim() ? line.slice(indent) : '').join('\n');
  } });

  // Standard Kotlin String and Collection utility prototypes
  if (typeof (String.prototype as any).reversed !== 'function') {
    (String.prototype as any).reversed = function () {
      return this.split('').reverse().join('');
    };
  }
  if (typeof (String.prototype as any).lowercase !== 'function') {
    (String.prototype as any).lowercase = function () {
      return this.toLowerCase();
    };
  }
  if (typeof (String.prototype as any).uppercase !== 'function') {
    (String.prototype as any).uppercase = function () {
      return this.toUpperCase();
    };
  }
  // String.take/drop/takeLast/dropLast (n larger than the length is fine; a negative n is an IllegalArgumentException).
  for (const [name, cut] of [
    ['take', (text: string, n: number) => text.slice(0, n)],
    ['drop', (text: string, n: number) => text.slice(n)],
    ['takeLast', (text: string, n: number) => (n === 0 ? '' : text.slice(-n))],
    ['dropLast', (text: string, n: number) => text.slice(0, Math.max(0, text.length - n))],
  ] as Array<[string, (text: string, n: number) => string]>) {
    if (typeof (String.prototype as any)[name] !== 'function') {
      Object.defineProperty(String.prototype, name, { value: function (n: number) {
        if (n < 0) throw new Error(`IllegalArgumentException: Requested character count ${n} is less than zero.`);
        return cut(String(this), n);
      }, configurable: true });
    }
  }
  // `"%.2f".format(x)` / `String.format("%5d", n)`: Java's Formatter for the common conversions (d, f, s, x, X, c, b, e, %, n) with
  // the flags `-`, `0`, `+`, `,` and space. `%f` rounds HALF_UP on the shortest decimal text of the number, as Java does
  // (`"%.2f".format(1.005)` is 1.01; JS toFixed gives 1.00).
  if (!(String.prototype as any).__kt_format) {
    const roundHalfUp = (value: number, digits: number): string => {
      const negative = value < 0 || Object.is(value, -0);
      // the shortest round-trip text (String(x)); a number that prints in exponent form is written out in full first
      const shortest = String(Math.abs(value));
      const [int, frac = ''] = (/e/i.test(shortest) ? Math.abs(value).toFixed(Math.min(100, digits + 20)) : shortest).split('.');
      const digitsText = int + frac.padEnd(digits + 1, '0');
      const keep = int.length + digits;
      let kept = digitsText.slice(0, keep).split('').map(Number);
      if (Number(digitsText[keep] ?? '0') >= 5) {
        let k = kept.length - 1;
        while (k >= 0) { if (kept[k] === 9) { kept[k] = 0; k--; } else { kept[k]++; break; } }
        if (k < 0) kept = [1, ...kept];
      }
      const all = kept.join('');
      const intPart = all.slice(0, all.length - digits) || '0';
      const text = digits > 0 ? `${intPart}.${all.slice(all.length - digits)}` : intPart;
      return (negative && /[1-9]/.test(text) ? '-' : '') + text;
    };
    const javaFormat = (pattern: string, args: any[]): string => {
      let next = 0;
      return pattern.replace(/%(\d+\$)?([-0+, (#]*)(\d+)?(?:\.(\d+))?([dfsxXcbeEn%])/g, (whole, index, flags: string, width, precision, conv: string) => {
        if (conv === '%') return '%';
        if (conv === 'n') return '\n';
        const arg = index ? args[parseInt(index, 10) - 1] : args[next++];
        let body: string;
        const sign = (n: number) => (n < 0 ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '');
        const group = (digits: string) => (flags.includes(',') ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : digits);
        switch (conv) {
          case 'd': {
            if (typeof arg !== 'number' || !Number.isInteger(arg)) throw new Error(`IllegalFormatConversionException: d != ${typeof arg === 'number' ? 'java.lang.Double' : 'java.lang.String'}`);
            body = sign(arg) + group(String(Math.abs(arg)));
            break;
          }
          case 'f': case 'e': case 'E': {
            if (typeof arg !== 'number') throw new Error(`IllegalFormatConversionException: ${conv} != java.lang.String`);
            const digits = precision === undefined ? 6 : parseInt(precision, 10);
            if (conv === 'f') {
              const text = roundHalfUp(Math.abs(arg), digits);
              const [i, f] = text.split('.');
              body = sign(arg) + group(i) + (f !== undefined ? '.' + f : '');
            } else {
              const t = Math.abs(arg).toExponential(digits).replace(/e([+-])(\d)$/, 'e$10$2');
              body = sign(arg) + (conv === 'E' ? t.toUpperCase() : t);
            }
            break;
          }
          case 'x': case 'X': body = (arg >>> 0).toString(16); if (conv === 'X') body = body.toUpperCase(); break;
          case 'c': body = String(arg); break;
          case 'b': body = String(arg != null && arg !== false); break;
          default: body = arg === undefined ? 'null' : typeof arg === 'string' ? arg : formatKotlinValue(arg); if (precision !== undefined) body = body.slice(0, parseInt(precision, 10));
        }
        const w = width ? parseInt(width, 10) : 0;
        if (body.length >= w) return body;
        if (flags.includes('-')) return body.padEnd(w);
        if (flags.includes('0') && /[dfeE]/.test(conv)) {
          const m = /^([-+ ]?)(.*)$/.exec(body)!;
          return m[1] + m[2].padStart(w - m[1].length, '0');
        }
        return body.padStart(w);
      });
    };
    Object.defineProperty(String.prototype, 'format', { value: function (...args: any[]) { return javaFormat(String(this), args); }, configurable: true, writable: true });
    Object.defineProperty(String, 'format', { value: (pattern: string, ...args: any[]) => javaFormat(pattern, args), configurable: true, writable: true });
    Object.defineProperty(String.prototype, '__kt_format', { value: true });
  }
  // World 15: real Kotlin's `String.toInt()` validates the WHOLE string
  // (optional leading sign, then digits only -- no surrounding whitespace,
  // no trailing garbage) and throws `NumberFormatException` otherwise, with
  // an exact, JVM-matching message (`For input string: "text"`) that
  // World 15's own Boss lesson asserts verbatim in its `expectedOutput`.
  // The previous `parseInt(this, 10)` was lenient exactly like JS's own
  // `parseInt` -- `"12x".toInt()` silently returned 12 instead of throwing
  // -- a silent-wrong-answer bug of exactly the kind this codebase's own
  // pitfalls file warns about repeatedly, invisible until a lesson actually
  // needed the throwing behavior (World 1-14 content never did).
  if (typeof (String.prototype as any).toInt !== 'function' || !(String.prototype as any).__kt_toIntThrows) {
    (String.prototype as any).toInt = function (radix = 10) {
      const s = String(this);
      const body = s.replace(/^[+-]/, '');
      const valid = body.length > 0 && Array.from(body).every((ch) => !Number.isNaN(parseInt(ch, radix)));
      const value = parseInt(s, radix);
      if (!valid || !Number.isSafeInteger(value)) {
        throw new NumberFormatException(`For input string: "${s}"${radix === 10 ? '' : ` under radix ${radix}`}`);
      }
      return value;
    };
    (String.prototype as any).__kt_toIntThrows = true;
  }
  if (typeof (String.prototype as any).toIntOrNull !== 'function') {
    (String.prototype as any).toIntOrNull = function () {
      const s = String(this);
      if (!/^[+-]?\d+$/.test(s) || !Number.isSafeInteger(parseInt(s, 10))) return null;
      return parseInt(s, 10);
    };
  }
  // Same validation shape as toInt() above, applied to Long: a Long is also
  // a whole-number-only string, just with a wider (though still
  // Number.isSafeInteger-bounded, per the Number.prototype.toLong comment
  // above) range than Int in real Kotlin -- this editor makes no attempt to
  // simulate that wider range distinctly from Int.
  if (typeof (String.prototype as any).toLong !== 'function') {
    (String.prototype as any).toLong = function () {
      const s = String(this);
      if (!/^[+-]?\d+$/.test(s) || !Number.isSafeInteger(parseInt(s, 10))) {
        throw new NumberFormatException(`For input string: "${s}"`);
      }
      return parseInt(s, 10);
    };
  }
  if (typeof (String.prototype as any).toLongOrNull !== 'function') {
    (String.prototype as any).toLongOrNull = function () {
      const s = String(this);
      if (!/^[+-]?\d+$/.test(s) || !Number.isSafeInteger(parseInt(s, 10))) return null;
      return parseInt(s, 10);
    };
  }
  if (typeof (String.prototype as any).toDouble !== 'function') {
    (String.prototype as any).toDouble = function () {
      return parseFloat(this);
    };
  }
  if (typeof (String.prototype as any).toDoubleOrNull !== 'function') {
    (String.prototype as any).toDoubleOrNull = function () {
      const s = String(this);
      if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s.trim())) return null;
      return parseFloat(s);
    };
  }
  // World 1 practiceBank: String.toFloat() had no support at all (only
  // Number.prototype.toFloat existed, for a Double->Float narrowing, not a
  // String->Float parse) -- mirrors toDouble() above, then narrows through
  // the same float32-rounding helper Number.prototype.toFloat already uses
  // so the printed value matches Kotlin's shortest-round-trip Float format.
  if (typeof (String.prototype as any).toFloat !== 'function') {
    (String.prototype as any).toFloat = function () {
      const s = String(this);
      if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s.trim())) {
        throw new NumberFormatException(`For input string: "${s}"`);
      }
      return (Number.prototype as any).toFloat.call(parseFloat(s));
    };
  }
  if (typeof (String.prototype as any).toFloatOrNull !== 'function') {
    (String.prototype as any).toFloatOrNull = function () {
      const s = String(this);
      if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s.trim())) return null;
      return (Number.prototype as any).toFloat.call(parseFloat(s));
    };
  }
  if (typeof (String.prototype as any).isBlank !== 'function') {
    (String.prototype as any).isBlank = function () {
      return this.trim().length === 0;
    };
  }
  if (typeof (String.prototype as any).isNotBlank !== 'function') {
    (String.prototype as any).isNotBlank = function () {
      return this.trim().length > 0;
    };
  }
  if (typeof (String.prototype as any).contains !== 'function') {
    (String.prototype as any).contains = function (part: string) { return this.includes(part); };
  }
  if (typeof (String.prototype as any).isEmpty !== 'function') {
    (String.prototype as any).isEmpty = function () {
      return this.length === 0;
    };
  }
  (globalThis as any).__kt_rangeOf = makeRange;
  installKotlinStdlib();
  // kotlin.math's top-level functions exist only for a program that imports (or qualifies) them, as in Kotlin.
  if (/\bkotlin\.math\b/.test(originalCode)) installKotlinMath();
  if (typeof (String.prototype as any).isNotEmpty !== 'function') {
    (String.prototype as any).isNotEmpty = function () {
      return this.length > 0;
    };
  }
  if (typeof (Array.prototype as any).joinToString !== 'function') {
    // joinToString(separator, prefix, postfix, limit, truncated, transform): `limit` keeps the first n elements then `truncated`.
    (Array.prototype as any).joinToString = function (...args: any[]) {
      // a function argument is `transform` (a trailing lambda arrives last, in whatever position its siblings left free)
      const transform = args.find((a) => typeof a === 'function') as ((v: unknown) => unknown) | undefined;
      const [separator = ', ', prefix = '', postfix = '', limit = -1, truncated = '...'] = args.filter((a) => typeof a !== 'function');
      const shown = limit >= 0 ? Array.from(this as any[]).slice(0, limit) : Array.from(this as any[]);
      const parts = shown.map((v: unknown) => (transform ? String(formatKotlinValue(transform(v))) : formatKotlinValue(v)));
      if (limit >= 0 && (this as any[]).length > limit) parts.push(truncated);
      return prefix + parts.join(separator) + postfix;
    };
  }
  if (typeof (Array.prototype as any).reversed !== 'function') {
    (Array.prototype as any).reversed = function () {
      return [...this].reverse();
    };
  }
  const customPrintln = (...args: any[]) => {
    const text = args.map(formatKotlinValue).join(' ');
    appendOutput(text);
    lineOpen = false;
    return __kt_Unit; // println returns Unit (a non-null value): `x?.let { println(it) } ?: other` must not run `other`
  };
  const customPrint = (...args: any[]) => {
    const text = args.map(formatKotlinValue).join(' ');
    appendOutput(text);
    lineOpen = true;
    return __kt_Unit;
  };

  // Arrays are fixed-size lists whose ELEMENTS can be replaced, so they share KotlinList's full method set
  // (size, sum, sorted, indices, contentToString, ...) but get no add/remove.
  // An array (not a list) throws ArrayIndexOutOfBoundsException, a subclass of IndexOutOfBoundsException (see __kt_at).
  const markArray = <T extends object>(list: T): T => { Object.defineProperty(list, '__kt_isArray', { value: true }); return list; };
  (globalThis as any).__kt_markArray = markArray;
  const __kt_arrayOf = (...items: any[]) => markArray(new KotlinList(items));
  const __kt_intArray = (size: number, init?: (index: number) => any) => {
    if (!Number.isInteger(size) || size < 0) throw new (globalThis as any).IllegalArgumentException('Array size must not be negative, was: ' + size + '.');
    return markArray(new KotlinList(Array.from({ length: size }, (_, i) => (init ? init(i) : 0))));
  };
  const __kt_listOf = (...items: any[]) => new KotlinList(items);
  const __kt_mutableListOf = (...items: any[]) => {
    const list = new KotlinList(items) as unknown as any[] & { add?: (...args: any[]) => any; remove?: (item: any) => boolean; removeAt?: (index: number) => any };
    // add(item) appends and returns true; add(index, item) inserts (index 0..size), like Kotlin's MutableList.
    list.add = (...args: any[]) => {
      if (args.length >= 2) {
        const [index, item] = args;
        if (!Number.isInteger(index) || index < 0 || index > list.length) throw outOfBounds(index, list.length);
        list.splice(index, 0, item);
        return undefined;
      }
      list.push(args[0]);
      return true;
    };
    list.remove = (item: any) => {
      const index = list.findIndex((v: any) => (typeof v?.equals === 'function' ? v.equals(item) : v === item));
      if (index === -1) return false;
      list.splice(index, 1);
      return true;
    };
    list.removeAt = (index: number) => {
      if (!Number.isInteger(index) || index < 0 || index >= list.length) throw outOfBounds(index, list.length);
      return list.splice(index, 1)[0];
    };
    // addAll(items) appends; addAll(index, items) inserts at index
    (list as any).addAll = (first: any, second?: Iterable<any>) => {
      const before = list.length;
      if (second !== undefined) {
        if (!Number.isInteger(first) || first < 0 || first > list.length) throw outOfBounds(first, list.length);
        list.splice(first, 0, ...Array.from(second));
      } else for (const item of Array.from(first as Iterable<any>)) list.push(item);
      return list.length > before;
    };
    const sameItem = (a: any, b: any) => (typeof a?.equals === 'function' ? a.equals(b) : a === b);
    const removeWhere = (pred: (v: any) => boolean) => { const keep = Array.from(list).filter((v) => !pred(v)); const changed = keep.length !== list.length; list.length = 0; for (const v of keep) list.push(v); return changed; };
    (list as any).removeIf = (pred: (v: any) => boolean) => removeWhere(pred);
    (list as any).removeAll = (arg: any) => (typeof arg === 'function' ? removeWhere(arg) : removeWhere((v) => Array.from(arg as Iterable<any>).some((x) => sameItem(v, x))));
    (list as any).retainAll = (arg: Iterable<any>) => removeWhere((v) => !Array.from(arg).some((x) => sameItem(v, x)));
    (list as any).removeFirst = () => { if (!list.length) throw new (globalThis as any).NoSuchElementException('List is empty.'); return list.shift(); };
    (list as any).removeLast = () => { if (!list.length) throw new (globalThis as any).NoSuchElementException('List is empty.'); return list.pop(); };
    const resort = (sorted: any[]) => { list.splice(0, list.length, ...sorted); };
    (list as any).sortBy = (selector: (v: any) => any) => resort(Array.from(new KotlinList(list).sortedBy(selector)));
    (list as any).sortByDescending = (selector: (v: any) => any) => resort(Array.from(new KotlinList(list).sortedByDescending(selector)));
    (list as any).sortWith = (comparator: (a: any, b: any) => number) => resort(Array.from(list).sort(comparator));
    (list as any).shuffle = () => resort(Array.from(new KotlinList(list).shuffled()));
    (list as any).replaceAll = (fn: (v: any) => any) => { for (let i = 0; i < list.length; i++) list[i] = fn(list[i]); };
    (list as any).clear = () => { list.length = 0; };
    (list as any).toList = () => new KotlinList([...list]);
    (list as any).toMutableList = () => __kt_mutableListOf(...list);
    return list;
  };
  const withMapChecks = (map: Map<any, any>) => {
    (map as any).containsKey = (key: any) => map.has(key);
    (map as any).containsValue = (value: any) => [...map.values()].includes(value);
    (map as any).isEmpty = () => map.size === 0;
    (map as any).isNotEmpty = () => map.size > 0;
    (map as any).getOrDefault = (key: any, fallback: any) => (map.has(key) ? map.get(key) : fallback);
    (map as any).getValue = (key: any) => {
      if (!map.has(key)) throw new (globalThis as any).NoSuchElementException('Key ' + formatKotlinValue(key) + ' is missing in the map.');
      return map.get(key);
    };
    return map;
  };
  // Kotlin's Map operations, under names a JS Map does not have (non-enumerable, installed once). A callback receives a
  // Map.Entry (`it.key`, `it.value`, or destructured `{ (k, v) -> }`). `forEach` is the one clash: generated code calls
  // `__kt_forEach` (see transpileKotlinToJS) so the native Map.forEach the rest of the app relies on stays untouched.
  if (!(Map.prototype as any).mapValues) {
    const entries = (map: Map<any, any>) => [...map.entries()].map(([k, v]) => new KotlinMapEntry(k, v));
    const kotlinMap = (pairs: Array<[any, any]>) => withMapChecks(new Map(pairs));
    const methods: Record<string, (this: Map<any, any>, ...args: any[]) => any> = {
      mapValues(fn) { return kotlinMap(entries(this).map((e) => [e.key, fn(e)])); },
      mapKeys(fn) { return kotlinMap(entries(this).map((e) => [fn(e), e.value])); },
      filter(fn) { return kotlinMap(entries(this).filter((e) => fn(e)).map((e) => [e.key, e.value])); },
      filterNot(fn) { return kotlinMap(entries(this).filter((e) => !fn(e)).map((e) => [e.key, e.value])); },
      filterKeys(fn) { return kotlinMap([...this.entries()].filter(([k]) => fn(k))); },
      filterValues(fn) { return kotlinMap([...this.entries()].filter(([, v]) => fn(v))); },
      map(fn) { return new KotlinList(entries(this).map((e) => fn(e))); },
      mapNotNull(fn) { return new KotlinList(entries(this).map((e) => fn(e)).filter((v) => v != null)); },
      flatMap(fn) { return new KotlinList(entries(this).flatMap((e) => Array.from(fn(e)))); },
      any(fn) { return fn ? entries(this).some((e) => fn(e)) : this.size > 0; },
      all(fn) { return entries(this).every((e) => fn(e)); },
      none(fn) { return fn ? !entries(this).some((e) => fn(e)) : this.size === 0; },
      count(fn) { return fn ? entries(this).filter((e) => fn(e)).length : this.size; },
      maxByOrNull(fn) { return entries(this).reduce((best: any, e) => (best === null || fn(e) > fn(best) ? e : best), null); },
      minByOrNull(fn) { return entries(this).reduce((best: any, e) => (best === null || fn(e) < fn(best) ? e : best), null); },
      toList() { return new KotlinList(entries(this).map((e) => new KotlinPair(e.key, e.value))); },
      toMap() { return kotlinMap([...this.entries()]); },
      toMutableMap() { return __kt_mutableMapOf(...this.entries()); },
      getOrElse(key, fallback) { return this.has(key) ? this.get(key) : fallback(); },
      getOrPut(key, make) { if (!this.has(key)) this.set(key, make()); return this.get(key); },
      __kt_forEach(fn) { for (const e of entries(this)) { if (fn.length >= 2) fn(e.key, e.value); else fn(e); } },
    };
    for (const [name, fn] of Object.entries(methods)) Object.defineProperty(Map.prototype, name, { value: fn, configurable: true, writable: true });
    for (const kind of ['keys', 'values', 'entries'] as const) {
      Object.defineProperty(Map.prototype, `__kt_${kind}`, { get(this: Map<any, any>) { return __kt_mapView(this, kind); }, configurable: true });
      // a user property named `keys`/`values`/`entries` is read and assigned through the same name
      Object.defineProperty(Object.prototype, `__kt_${kind}`, { get(this: any) { return this[kind]; }, set(this: any, value: any) { this[kind] = value; }, configurable: true });
    }
    Object.defineProperty(Object.prototype, '__kt_forEach', { value: function (this: any, fn: any) { return this.forEach(fn); }, configurable: true, writable: true });
  }
  const __kt_mapOf = (...pairs: [any, any][]) => { const m = makeStructural(new Map()) as Map<any, any>; for (const pair of pairs) { const [k, v] = Array.from(pair) as [any, any]; m.set(k, v); } return withMapChecks(m); };
  const __kt_mutableMapOf = (...pairs: [any, any][]) => {
    const structuralMap = makeStructural(new Map()) as Map<any, any>;
    for (const pair of pairs) { const [k, v] = Array.from(pair) as [any, any]; structuralMap.set(k, v); }
    const map = withMapChecks(structuralMap) as Map<any, any> & { remove?: (key: any) => any };
    // Kotlin's MutableMap.remove(key) returns the removed value (or null if
    // absent) and deletes the entry -- mirroring how mutableSetOf's .remove
    // already delegates to Set.prototype.delete, this delegates to
    // Map.prototype.delete/get rather than JS's own differently-named,
    // differently-behaved (returns a boolean) native method.
    map.remove = (key: any) => {
      const existing = map.has(key) ? map.get(key) : null;
      map.delete(key);
      return existing;
    };
    // put(key, value) stores the value and returns the PREVIOUS value for that key (null if none).
    (map as any).put = (key: any, value: any) => {
      const previous = map.has(key) ? map.get(key) : null;
      map.set(key, value);
      return previous;
    };
    (map as any).putAll = (other: Map<any, any>) => { for (const [k, v] of other) map.set(k, v); };
    return map;
  };
  // Kotlin exposes keys / values / entries as PROPERTIES; a JS Map has same-named METHODS returning one-shot
  // iterators. `map.keys` in user code is rewritten to this, giving a real list that prints as [a, b].
  const __kt_mapView = (map: Map<any, any>, kind: 'keys' | 'values' | 'entries') => {
    if (!(map instanceof Map)) return (map as any)[kind];
    if (kind === 'keys') return new KotlinList([...map.keys()]);
    if (kind === 'values') return new KotlinList([...map.values()]);
    return new KotlinList([...map.entries()].map(([k, v]) => new KotlinMapEntry(k, v)));
  };
  const withSetContains = (set: Set<any>) => {
    (set as any).contains = (item: any) => set.has(item);
    (set as any).isEmpty = () => set.size === 0;
    (set as any).isNotEmpty = () => set.size > 0;
    (set as any).first = () => { if (!set.size) throw new (globalThis as any).NoSuchElementException('Collection is empty.'); return [...set][0]; };
    (set as any).last = () => { if (!set.size) throw new (globalThis as any).NoSuchElementException('Collection is empty.'); return [...set][set.size - 1]; };
    (set as any).toList = () => new KotlinList([...set]);
    (set as any).sorted = () => new KotlinList([...set]).sorted();
    (set as any).union = (other: Iterable<any>) => __kt_setOf(...set, ...Array.from(other));
    (set as any).intersect = (other: Iterable<any>) => { const keep = new Set(Array.from(other)); return __kt_setOf(...[...set].filter((x) => keep.has(x))); };
    (set as any).subtract = (other: Iterable<any>) => { const drop = new Set(Array.from(other)); return __kt_setOf(...[...set].filter((x) => !drop.has(x))); };
    (set as any).asSequence = () => new KotlinSequence(() => set[Symbol.iterator](), false);
    return set;
  };
  const __kt_setOf = (...items: any[]) => { const set = makeStructural(new Set()) as Set<any>; for (const item of items) set.add(item); return withSetContains(set); };
  (globalThis as any).__kt_setOf = __kt_setOf;
  const __kt_mutableSetOf = (...items: any[]) => {
    const structuralSet = makeStructural(new Set()) as Set<any>;
    for (const item of items) structuralSet.add(item);
    const set = withSetContains(structuralSet) as Set<any> & { remove?: (item: any) => boolean };
    // Kotlin's MutableSet.add returns true when the element was NEW and false when it was already present
    // (JS's Set.add returns the set itself).
    const nativeAdd = Set.prototype.add;
    (set as any).add = (item: any) => { const had = set.has(item); nativeAdd.call(set, item); return !had; };
    set.remove = (item: any) => set.delete(item);
    (set as any).addAll = (others: Iterable<any>) => { const before = set.size; for (const item of Array.from(others)) nativeAdd.call(set, item); return set.size > before; };
    return set;
  };
  // List.toSet() / distinct collections: attach set behaviour to a KotlinList created elsewhere.
  // `toList()` on a list made by an operation (map/filter, a map's values), not only one from listOf.
  (KotlinList.prototype as any).toList = function () { return new KotlinList(Array.from(this as any)); };
  (KotlinList.prototype as any).toSet = function () { return __kt_setOf(...Array.from(this as any)); };
  (KotlinList.prototype as any).toMutableSet = function () { return __kt_mutableSetOf(...Array.from(this as any)); };
  (KotlinList.prototype as any).joinAll = function () { kotlinJoinAll(this as any); };
  (KotlinList.prototype as any).awaitAll = function () { return new KotlinList(kotlinAwaitAll(this as any)); };
  (KotlinList.prototype as any).toMutableList = function () { return __kt_mutableListOf(...Array.from(this as any)); };
  // `x.size`: a collection's size; anything else (a user class with its own `size` property or getter) keeps its own `size`
  const __kt_size = (value: any) => value instanceof Map || value instanceof Set ? value.size : (value != null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof KotlinList) && 'size' in value ? value.size : value.length);
  // The factories are also needed by kotlinStdlib.ts (buildList, Set/Map operators, ArrayList(...) ...), which cannot see this scope.
  Object.assign(globalThis as any, { __kt_listOf, __kt_mutableListOf, __kt_mapOf, __kt_mutableMapOf, __kt_mutableSetOf, __kt_MapEntry: KotlinMapEntry });
  const __kt_notNull = (value: any) => {
    if (value === null || value === undefined) {
      throw new NullPointerException('non-null assertion (!!) failed because the expression was null');
    }
    return value;
  };
  const __kt_equals = (left: any, right: any) => {
    if (typeof left === 'function' && left.__kt_value !== undefined) left = left.__kt_value;
    if (typeof right === 'function' && right.__kt_value !== undefined) right = right.__kt_value;
    if (left === null || left === undefined || right === null || right === undefined) return left === right;
    // Sets and Maps are equal by content, whatever the order
    if (left instanceof Set && right instanceof Set) return left.size === right.size && [...left].every((x) => right.has(x));
    if (left instanceof Map && right instanceof Map) return left.size === right.size && [...left].every(([k, v]) => right.has(k) && __kt_equals(v, right.get(k)));
    return typeof left.equals === 'function' ? left.equals(right) : left === right;
  };
  // Backs `value is T` inside an `inline fun <reified T>` body once T has
  // been rewritten (see `transpileReifiedFunctions`) into an ordinary
  // runtime parameter carrying the type NAME as a string (e.g. "String"),
  // supplied by the caller's explicit type argument (`isType<String>(x)`
  // -> `isType(x, "String")`). Scoped to the same primitive set every
  // other `is`/`as?` check in this file supports -- never Char (a
  // single-quoted Char and same-text String are indistinguishable JS
  // values here, see the standing pitfall on this) and never an arbitrary
  // declared class (this engine has no runtime class registry keyed by a
  // string name to look up).
  const __kt_isReifiedType = (value: any, typeName: string): boolean => {
    switch (typeName) {
      case 'Int': case 'Long': case 'Float': case 'Double': return typeof value === 'number';
      case 'String': return typeof value === 'string';
      case 'Boolean': return typeof value === 'boolean';
      default: throw new Error(`Reified type check for "${typeName}" is not supported`);
    }
  };

  // `X::class.simpleName`: a class gives its own name, a reified type parameter arrives as its name (a String), an instance gives its
  // class's name. JS primitives map to Kotlin's names (a whole number is reported as Int).
  const __kt_simpleName = (value: any, reified = false): string | null => {
    if (typeof value === 'function') return value.name.replace(/^Kotlin(?=[A-Z])/, '');
    if (typeof value === 'number') return Number.isInteger(value) ? 'Int' : 'Double';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'string') return reified ? value : 'String';
    if (value == null) return null;
    return (value.constructor?.name ?? 'Any').replace(/^Kotlin(?=[A-Z])/, '');
  };

  // Kotlin's `Unit` written as a value (`return Unit`, a lambda ending in `Unit`) prints as kotlin.Unit. A function that merely returns
  // nothing still yields JS undefined, printed as null (see PITFALLS.md: the simulator can't print `Unit` it never sees).
  // Unit has no members: reading one gives undefined, exactly what a value-less `println(...)` used to give, so misuse such as
  // `println(1).name.uppercase()` is reported on the member that does not exist.
  const __kt_Unit: any = new Proxy(Object.freeze({ toString: () => 'kotlin.Unit', equals: (other: unknown) => other === __kt_Unit }), {
    get(target: any, prop: string | symbol) { return typeof prop === 'symbol' || prop in target ? target[prop] : undefined; },
  });
  (globalThis as any).__kt_UnitValue = __kt_Unit;

  let returnValue: any = undefined;
  let runnerScript = '';

  try {
    // Construct execution sandbox
    // If the code contains `fun main()`, call `main()`.
    // If a testCase call is provided (e.g. `calculatePlayerInventory("Alex", 25)`), evaluate that too.
    //
    // 'use strict' is required for correctness, not just style: without it, an
    // assignment to a misspelled/undeclared identifier (e.g. a typo'd variable
    // name) silently creates an implicit global instead of throwing -- a
    // program with a typo like `temperatur = 68` (meant to be `temperature`)
    // would run to completion with the ORIGINAL, un-reassigned value and no
    // error at all, exactly the "plausible-looking wrong answer" failure mode
    // this file warns about repeatedly, and nothing like real Kotlin's
    // "Unresolved reference" compile error. In strict mode this instead throws
    // a real ReferenceError, which is at least a loud, honest failure.
    runnerScript = `
      "use strict";
      let __kt_loop_start = Date.now();
      let __kt_loop_iter = 0;
      const __kt_check_loop = () => {
        if (++__kt_loop_iter > 250000 || Date.now() - __kt_loop_start > ${timeoutMs}) {
          throw new Error('Execution timed out (possible infinite loop)');
        }
      };

      const __kt_decimalText = (value, isFloat) => {
        if (value == null) return 'null';
        // Same guard as formatKotlinValue above, and for the same reason:
        // a Double/Float-typed variable whose initializer omitted a method
        // call's parentheses (e.g. \`subtotal.toFloat\` instead of
        // \`subtotal.toFloat()\`) holds the function itself. Number.isInteger
        // of a function is false, so this would otherwise fall through to
        // String(value) and print the function's own transpiled JS source
        // text as if it were a real Double/Float value.
        if (typeof value === 'function') {
          throw new Error('Expected a Double/Float value, but got a function reference instead -- did you forget the parentheses () when calling a method (e.g. write toFloat() instead of toFloat)?');
        }
        return isFloat ? __kt_javaFloat(value) : __kt_javaDouble(value);
      };
      // Kotlin's step must be positive: '1..10 step 0' and '10 downTo 1 step -2' throw when the
      // progression is created, before any iteration runs (not an infinite loop).
      const __kt_checkStep = (step) => {
        if (!(step > 0)) throw new IllegalArgumentException('Step must be positive, was: ' + step + '.');
        return step;
      };
      // Bounds-checked element access for list/array variables: Kotlin throws IndexOutOfBoundsException
      // for list[3] on a 3-element list, where plain JS would quietly yield undefined (printed as null)
      // or, for an assignment, grow the array.
      const __kt_at = (collection, index) => {
        if (typeof index === 'number' && collection != null && typeof collection.length === 'number' && (index < 0 || index >= collection.length || !Number.isInteger(index))) {
          throw new (collection.__kt_isArray ? ArrayIndexOutOfBoundsException : IndexOutOfBoundsException)('Index ' + index + ' out of bounds for length ' + collection.length);
        }
        return collection[index];
      };
      const __kt_setAt = (collection, index, value) => {
        if (typeof index === 'number' && collection != null && typeof collection.length === 'number' && (index < 0 || index >= collection.length || !Number.isInteger(index))) {
          throw new (collection.__kt_isArray ? ArrayIndexOutOfBoundsException : IndexOutOfBoundsException)('Index ' + index + ' out of bounds for length ' + collection.length);
        }
        collection[index] = value;
        return value;
      };
      const __kt_run = (action) => action();
      // value as Type: a checked cast for the primitive types this runtime can tell apart, unchecked (as in Kotlin for generics) otherwise.
      const __kt_cast = (value, type, nullable) => {
        if (value == null) { if (nullable) return null; throw new Error('NullPointerException: null cannot be cast to non-null type ' + type); }
        const ok = type === 'String' ? typeof value === 'string' : type === 'Boolean' ? typeof value === 'boolean'
          : ['Int', 'Long', 'Double', 'Float', 'Short', 'Byte', 'Number'].includes(type) ? typeof value === 'number' : true;
        if (!ok) throw new ClassCastException('class ' + (typeof value === 'string' ? 'java.lang.String' : typeof value === 'number' ? 'java.lang.Integer' : typeof value === 'boolean' ? 'java.lang.Boolean' : value.constructor?.name) + ' cannot be cast to ' + type);
        return value;
      };
      // Identity hash text for Object.toString(): stable per object for the run, 8 hex digits like the JVM's (the value itself is arbitrary there too).
      const __kt_identities = new WeakMap();
      let __kt_nextIdentity = 0x1b6d3586;
      const __kt_identityText = (obj) => {
        if (!__kt_identities.has(obj)) { __kt_identities.set(obj, __kt_nextIdentity); __kt_nextIdentity = (__kt_nextIdentity + 0x2f6e9b1) >>> 0; }
        return obj.constructor.name + '@' + __kt_identities.get(obj).toString(16);
      };
      // Int/Long division and remainder by zero throw in Kotlin (java.lang.ArithmeticException: / by zero); in JS they give Infinity/NaN.
      // The typed lowering rewrites Int / Int to __kt_idiv(a / b): the quotient of two finite integers is non-finite only for a zero divisor.
      const __kt_idiv = (quotient) => {
        if (!Number.isFinite(quotient)) throw new ArithmeticException('/ by zero');
        return Math.trunc(quotient);
      };
      const __kt_irem = (dividend, divisor) => {
        if (divisor === 0) throw new ArithmeticException('/ by zero');
        return dividend % divisor;
      };
      // \`x % 0\` / \`x / 0\` with a literal zero, where the typer did not know x is an Int (a lambda's \`it\`, a loop variable): an
      // integer operand throws like Kotlin; a fractional one gives NaN/Infinity, as a Double does.
      const __kt_divZero = (x, op) => {
        if (typeof x === 'number' && Number.isInteger(x)) throw new ArithmeticException('/ by zero');
        return op === '%' ? x % 0 : x / 0;
      };
      // with(receiver) { block } -- registered as a plain builtins entry
      // in kotlinFunctions.ts (same as run/repeat above), which already
      // auto-renames a bare "with" token to "__kt_with" wherever it's
      // used, so the reserved JS "with" statement keyword never reaches
      // the generated code. block is already lowered to take the receiver
      // as its own first positional parameter (same shape as the
      // Object.prototype.let/run/also/apply helpers below), so calling it
      // directly with receiver is all that's needed.
      const __kt_with = (receiver, block) => block(receiver);
      const __kt_repeat = (times, action) => {
        for (let index = 0; index < times; index++) {
          __kt_check_loop();
          action(index);
        }
      };
      // World 15's standalone \`runCatching { block }\` -- registered as a
      // plain builtins entry in kotlinFunctions.ts (same as run/with/repeat
      // above), so it is likewise auto-renamed to \`__kt_runCatching\` at
      // every call site. Delegates to the real \`runCatching\` global
      // (kotlinRunner.ts exposes it on globalThis) rather than duplicating
      // its Result-wrapping logic here.
      const __kt_runCatching = (block) => runCatching(block);
      // World 16 Lesson 1 uses a deterministic single-threaded child queue.
      // These helpers do not imply real scheduling; see kotlinCoroutines.ts.
      const __kt_runBlocking = (block) => kotlinRunBlocking(block);
      const __kt_coroutineScope = (block) => kotlinCoroutineScope(block);
      const __kt_supervisorScope = (block) => kotlinSupervisorScope(block);
      const __kt_CoroutineExceptionHandler = (handler) => kotlinCoroutineExceptionHandler(handler);
      const __kt_launch = (contextOrBlock, maybeBlock) => kotlinLaunch(contextOrBlock, maybeBlock);
      const __kt_async = (startOrBlock, maybeBlock) => kotlinAsync(startOrBlock, maybeBlock);
      const __kt_delay = (milliseconds) => kotlinDelay(milliseconds);
      const __kt_ensureActive = () => kotlinEnsureActive();
      const __kt_yield = () => kotlinYield();
      const __kt_withContext = (context, block) => kotlinWithContext(context, block);
      ${usesCoroutines ? `
      const CoroutineStart = kotlinCoroutineStart;
      const coroutineContext = kotlinCoroutineContext;
      const Job = kotlinJobKey;
      const CoroutineName = Object.assign((name) => kotlinCoroutineName(name), { toString: () => kotlinCoroutineNameKey });
      const CoroutineExceptionHandler = __kt_CoroutineExceptionHandler;
      const Dispatchers = kotlinDispatchers;
      const joinAll = (...jobs) => kotlinJoinAll(jobs);
      const awaitAll = (...deferreds) => new KotlinList(kotlinAwaitAll(deferreds));
      ` : ''}
      ${libraryClasses.map((name) => `const ${name} = ${name === 'Mutex' ? '() => new KotlinMutex()' : '(value = 0) => new KotlinAtomicNumber(value)'};`).join('\n')}

      let __kt_line = 0;
      // Tag an error with the Kotlin line that was running, once (the innermost function that sees it first wins).
      const __kt_tag = (error) => { if (error && typeof error === 'object' && error.__kt_line === undefined) { try { error.__kt_line = __kt_line; } catch (__kt_ignored) {} } };
      //__KT_USER_BEGIN__
      ${transpiledJS}

      let __lastResult = undefined;
      if (typeof main === 'function') {
        try {
          __lastResult = main();
        } catch (__kt_error) {
          // Remember which Kotlin line was running (set by the line markers) for the error report.
          __kt_tag(__kt_error);
          throw __kt_error;
        }
      }
    `;

    if (options?.testCase?.call) {
      runnerScript += `
        try {
          __lastResult = ${options.testCase.call};
        } catch(e) {
          throw new Error('Test case execution failed (' + ${JSON.stringify(options.testCase.call)} + '): ' + (e && e.message ? e.message : String(e)));
        }
      `;
    }

    runnerScript += `\nreturn __lastResult;`;

    // Execute with timeout safeguard
    const runFunction = new Function(
      'println',
      'print',
      '__kt_arrayOf',
      '__kt_intArray',
      '__kt_mapView',
      '__kt_listOf',
      '__kt_mutableListOf',
      '__kt_mapOf',
      '__kt_mutableMapOf',
      '__kt_setOf',
      '__kt_mutableSetOf',
      '__kt_size',
      '__kt_notNull',
      '__kt_equals',
      '__kt_isReifiedType',
      '__kt_simpleName',
      'Unit',
      'kotlinRunBlocking',
      'kotlinCoroutineScope',
      'kotlinSupervisorScope',
      'kotlinLaunch',
      'kotlinAsync',
      'kotlinCoroutineStart',
      'kotlinDelay',
      'kotlinEnsureActive',
      'kotlinYield',
      'kotlinWithContext',
      'KotlinMutex',
      'KotlinAtomicNumber',
      'kotlinJoinAll',
      'kotlinAwaitAll',
      'kotlinCoroutineContext',
      'kotlinCoroutineName',
      'kotlinCoroutineExceptionHandler',
      'kotlinCoroutineNameKey',
      'kotlinDispatchers',
      'kotlinJobKey',
      'Pair',
      '__kt_format',
      runnerScript
    );

    // Run within guarded promise
    const executionPromise = new Promise<any>((resolve, reject) => {
      try {
        const res = runFunction(
          customPrintln,
          customPrint,
          __kt_arrayOf,
          __kt_intArray,
          __kt_mapView,
          __kt_listOf,
          __kt_mutableListOf,
          __kt_mapOf,
          __kt_mutableMapOf,
          __kt_setOf,
          __kt_mutableSetOf,
          __kt_size,
          __kt_notNull,
          __kt_equals,
          __kt_isReifiedType,
          __kt_simpleName,
          __kt_Unit,
          kotlinRunBlocking,
          kotlinCoroutineScope,
          kotlinSupervisorScope,
          kotlinLaunch,
          kotlinAsync,
          KotlinCoroutineStart,
          kotlinDelay,
          kotlinEnsureActive,
          kotlinYield,
          kotlinWithContext,
          KotlinMutex,
          KotlinAtomicNumber,
          kotlinJoinAll,
          kotlinAwaitAll,
          kotlinCoroutineContext,
          kotlinCoroutineName,
          kotlinCoroutineExceptionHandler,
          KotlinCoroutineNameKey,
          KotlinDispatchers,
          KotlinJobKey,
          (a: any, b: any) => new KotlinPair(a, b),
          formatKotlinValue
        );
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Execution timed out (possible infinite loop)')), timeoutMs)
    );

    returnValue = await Promise.race([executionPromise, timeoutPromise]);
  } catch (runtimeErr: any) {
    const elapsed = Math.round(performance.now() - startTime);
    // A Kotlin exception is reported with its class, like the JVM does (`ArithmeticException: / by zero`).
    const errMessage = runtimeErr instanceof Throwable ? String(runtimeErr) : runtimeErr?.message || String(runtimeErr);

    // Try to extract line number from stack trace if available
    // The stack line is inside the generated script (a long helper prelude, then the transpiled program). Map it back to the
    // Kotlin line only when the transpiled program kept the source's line count, so line N is still line N. Otherwise report no
    // line (0) rather than a number that points into generated code.
    // The Kotlin line that was running when it failed, recorded by the line markers (0 when unknown, e.g. a failure outside main).
    const line = typeof runtimeErr?.__kt_line === 'number' && runtimeErr.__kt_line > 0 ? runtimeErr.__kt_line : 0;

    // `foo is not defined` is Kotlin's "Unresolved reference" -- a compile-time error. Report it where the name is
    // written in the source (the JS stack line points into generated code), so the editor can underline it.
    const undefinedName = runtimeErr instanceof ReferenceError ? /^([A-Za-z_]\w*) is not defined$/.exec(errMessage)?.[1] : undefined;
    // A member that does not exist (`text.with(...)`, `x.uppercase()` on Unit, `c.Entry(...)`) reaches JS as "... is not a function" or a
    // read of `undefined`; Kotlin rejects it at compile time as an unresolved reference. Report it on the line where the member is written.
    if (!undefinedName && runtimeErr instanceof TypeError) {
      const missing = /(?:^|\.)([A-Za-z_]\w*) is not a function/.exec(errMessage)?.[1] ?? /of undefined \(reading '([A-Za-z_]\w*)'\)/.exec(errMessage)?.[1];
      if (missing && !missing.startsWith('__kt')) {
        const maskedLines = maskStringsAndComments(code).split('\n');
        // Prefer a member access (`.name`), then a call that is not the declaration itself (`class Entry(`, `fun with(`).
        const memberAccess = new RegExp(`\\.${missing}(?!\\w)`);
        const call = new RegExp(`(?<![\\w.])(?<!\\b(?:class|fun|object|interface)\\s+)${missing}\\s*\\(`);
        let at = maskedLines.findIndex((l) => memberAccess.test(l));
        if (at < 0) at = maskedLines.findIndex((l) => call.test(l));
        if (at >= 0) {
          return {
            success: false,
            output: '',
            logs: [],
            error: { message: `Unresolved reference: ${missing}`, line: at + 1, token: missing, occurrence: 0, type: 'unresolved_reference' },
            executionTimeMs: elapsed,
            exitCode: 1,
          };
        }
      }
    }
    if (undefinedName) {
      const maskedLines = maskStringsAndComments(code).split('\n');
      const nameRe = new RegExp(`(?<!\\w)${undefinedName}(?!\\w)`);
      // Prefer the line that was running (line markers); fall back to the first line that mentions the name.
      const at = line > 0 ? line - 1 : maskedLines.findIndex((l) => nameRe.test(l));
      if (at >= 0) {
        return {
          success: false,
          output: '',
          logs: [],
          error: { message: `Unresolved reference: ${undefinedName}`, line: at + 1, token: undefinedName, occurrence: 0, type: 'unresolved_reference' },
          executionTimeMs: elapsed,
          exitCode: 1,
        };
      }
    }

    return {
      success: false,
      output: stdout.join('\n'),
      logs: stdout,
      error: {
        message: `Runtime error: ${errMessage}`,
        line,
        type: 'runtime_error',
      },
      executionTimeMs: elapsed,
      exitCode: 1,
    };
  }

  const elapsed = Math.max(1, Math.round(performance.now() - startTime));
  const finalOutput = stdout.length > 0 ? stdout.join('\n') : returnValue !== undefined ? String(returnValue) : '';

  // Validate output against expected output if defined
  const expectedTarget = options?.expectedOutput ?? options?.testCase?.expected;
  if (expectedTarget !== undefined && expectedTarget !== '') {
    const normActual = finalOutput.trim().replace(/\r\n/g, '\n');
    const normExpected = expectedTarget.trim().replace(/\r\n/g, '\n');

    if (normActual !== normExpected) {
      return {
        success: false,
        output: finalOutput,
        logs: stdout,
        returnValue,
        error: {
          message: normActual === ''
            ? `No output generated. Expected: '${expectedTarget}'`
            : `Output mismatch: expected '${expectedTarget}', but got '${finalOutput}'`,
          line: 1,
          type: 'runtime_error',
        },
        executionTimeMs: elapsed,
        exitCode: 1,
      };
    }
  }

  return {
    success: true,
    output: finalOutput,
    logs: stdout,
    returnValue,
    executionTimeMs: elapsed,
    exitCode: 0,
  };
}

export interface HardcodeCheck {
  inputSwaps: Array<{ variableName: string; originalLiteral: string; alternateLiteral: string }>;
  alternateExpectedOutput: string;
}

/**
 * Swaps a starter-declared input literal for an alternate one in the
 * LEARNER'S submitted source (not a rewrite of their logic) -- scoped to
 * that exact `val`/`var name = ...` declaration so an unrelated number
 * elsewhere in the file is never touched. Returns null when the expected
 * declaration/literal pair isn't found verbatim (e.g. the learner
 * restructured the code in a way this wasn't anticipating) -- callers must
 * treat null as "can't safely verify" and fall back to the original result
 * rather than punishing a legitimately different-shaped solution.
 *
 * Operates on `scanKotlin` TOKENS, not a whole-string regex, specifically so
 * a comment that happens to contain the same-looking text (e.g. "Apply
 * Solution" re-inserts the starter's own `// 1. Declare val x = 'K' ...`
 * hint comment right above the real declaration -- see
 * `applySolutionPreservingComments`) is never mistaken for the real
 * declaration. A comment (line or block) is scanned as a single opaque
 * `comment`-kind token, so it can never match the `word`-kind `val`/`var`/
 * variable-name tokens this search looks for -- unlike the previous plain
 * regex, which matched whichever occurrence came FIRST in the raw text
 * (the comment, if the hint comment sits above the declaration), silently
 * mutating the comment instead of the real code and leaving the actual
 * value untouched.
 */
function applyInputSwaps(code: string, inputSwaps: HardcodeCheck['inputSwaps']): string | null {
  let mutated = code;
  for (const swap of inputSwaps) {
    let tokens;
    try { tokens = scanKotlin(mutated); } catch { return null; }

    let literalTok: (typeof tokens)[number] | null = null;
    for (let i = 0; i < tokens.length - 1; i++) {
      const keywordTok = tokens[i];
      if (keywordTok.kind !== 'word' || (keywordTok.text !== 'val' && keywordTok.text !== 'var')) continue;
      const nameTok = tokens[i + 1];
      if (nameTok.kind !== 'word' || nameTok.text !== swap.variableName) continue;

      // Scan forward (skipping an optional `: Type` annotation) for the
      // declaration's `=`, staying on the same source line -- mirrors the
      // original regex's `[^=\n]*` "same line, before the next '='" scope.
      let j = i + 2;
      let eqTok: (typeof tokens)[number] | null = null;
      let prevEnd = nameTok.end;
      while (j < tokens.length) {
        const tok = tokens[j];
        if (mutated.slice(prevEnd, tok.start).includes('\n')) break;
        if (tok.kind === 'symbol' && tok.text === '=') { eqTok = tok; break; }
        prevEnd = tok.end;
        j++;
      }
      if (!eqTok) continue;

      const candidate = tokens[j + 1];
      if (!candidate) continue;
      // The literal may span several tokens (`arrayOf(62, 58)`, `listOf("a", "b")`, `mutableMapOf(...)`), so
      // compare the exact source text starting at the first token. The character after it must not continue
      // a word or number, so the swap of `5` never matches the front of `50`.
      if (!mutated.startsWith(swap.originalLiteral, candidate.start)) continue;
      const following = mutated[candidate.start + swap.originalLiteral.length] ?? '';
      if (/[\w.]/.test(following)) continue;

      literalTok = { ...candidate, end: candidate.start + swap.originalLiteral.length };
      break;
    }

    if (!literalTok) return null;
    mutated = mutated.slice(0, literalTok.start) + swap.alternateLiteral + mutated.slice(literalTok.end);
  }
  return mutated;
}

export async function runKotlinCode(
  code: string,
  expectedOutput?: string,
  testCase?: { call?: string; expected?: string },
  hardcodeCheck?: HardcodeCheck
): Promise<KotlinExecutionResult> {
  // Only ever runs when `hardcodeCheck` is present -- that field only
  // exists on a lesson an author has verified DOES have a real, swappable
  // input driving the output, so a bare literal print there is unambiguous.
  const expectedForStaticCheck = expectedOutput ?? testCase?.expected;
  if (hardcodeCheck && expectedForStaticCheck) {
    const hardcodedError = detectHardcodedOutput(code, expectedForStaticCheck);
    if (hardcodedError) {
      return { success: false, output: '', logs: [], error: hardcodedError, executionTimeMs: 0, exitCode: 1 };
    }
  }

  const result = await compileAndRunKotlin(code, {
    expectedOutput,
    testCase,
  });
  if (!result.success || !hardcodeCheck) return result;

  // Re-run the SAME submitted code with the given input(s) swapped; a
  // hardcoded/laundered-through-a-variable answer can satisfy the original
  // expectedOutput but can't also satisfy a genuinely different one for a
  // genuinely different input (see the `hardcodeCheck` field's doc comment
  // on Stage4WriteRunData for the full rationale).
  const mutatedCode = applyInputSwaps(code, hardcodeCheck.inputSwaps);
  if (mutatedCode === null) return result;

  const mutatedResult = await compileAndRunKotlin(mutatedCode, {
    expectedOutput: hardcodeCheck.alternateExpectedOutput,
  });
  if (mutatedResult.success) return result;

  return {
    success: false,
    output: result.output,
    logs: result.logs,
    returnValue: result.returnValue,
    error: {
      message: "Nice try, buddy 👀 -- we swapped the input and your output stayed exactly the same. That's a dead giveaway you hardcoded it. Use proper logic!",
      line: 1,
      type: 'hardcoded_output',
    },
    executionTimeMs: result.executionTimeMs,
    exitCode: 1,
  };
}
