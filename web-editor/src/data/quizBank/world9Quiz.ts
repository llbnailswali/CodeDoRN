import { emphasizeQuizPrompt, formatQuizCodeQuestion, QuizQuestion } from '../../utils/quizQuestions';
import { WORLD_9_QUIZ_SETS } from './quizSets';

const W = 'world-9';
type Diff = 'easy' | 'medium' | 'hard';
const xp = { easy: 10, medium: 15, hard: 20 } as const;
const lessons = [
  ['lambda-expressions', 'Lambda expressions', '{ x: Int -> x + 1 }', 'A lambda is a function value that can be stored and called later.'],
  ['anonymous-functions', 'Anonymous functions', 'fun(x: Int): Int = x + 1', 'An anonymous function is an unnamed callable value.'],
  ['function-types', 'Function types', '(Int) -> Int', 'A function type states the parameter types and the return type.'],
  ['higher-order-functions', 'Higher-order functions', 'apply(3) { it * 2 }', 'A higher-order function accepts or returns another function.'],
  ['it', 'it', 'it * 2', 'it is the implicit name for one lambda parameter.'],
  ['function-references', 'Function references', '::double', 'The :: syntax creates a reference to a named function.'],
  ['returning-from-lambdas', 'Returning from lambdas', 'x + 1', 'A lambda returns the value of its final expression.'],
  ['local-returns', 'Local returns', 'return@forEach', 'A labelled return can leave the intended lambda invocation.'],
  ['inline-functions', 'Inline functions', 'inline fun run(block: () -> Unit)', 'inline is a compiler instruction for a higher-order function.'],
  ['noinline', 'noinline', 'noinline transform: (Int) -> Int', 'noinline keeps a selected function parameter as a real function value.'],
  ['crossinline', 'crossinline', 'crossinline block: () -> Unit', 'crossinline prevents an unsafe non-local return across another boundary.'],
] as const;
const setRows = [
  ['w9-set-callable-values', 'Callable Values', ['lambda-expressions', 'anonymous-functions', 'function-types']],
  ['w9-set-function-composition', 'Function Composition', ['higher-order-functions', 'it', 'function-references']],
  ['w9-set-return-control', 'Return Control', ['returning-from-lambdas', 'local-returns']],
  ['w9-set-inline-boundaries', 'Inline Boundaries', ['inline-functions', 'noinline', 'crossinline']],
] as const;
const topic = (key: string) => lessons.find(x => x[0] === key)![1];
const lid = (key: string) => `world-9-${key}`;
let cursor = 0;
const choice = (right: string, wrong: string[]) => { const rest = wrong.filter(x => x !== right); while (rest.length < 3) rest.push(`Not ${right}`); const answer = cursor++ % 4; rest.splice(answer, 0, right); return { options: rest, answer }; };
const code = (body: string[]) => ['fun main() {', ...body.map(x => `  ${x}`), '}'];
const make = (id: string, lessonId: string, t: string, concept: string, difficulty: Diff, question: string, explanation: string, hint: string, type: string, data: Record<string, unknown>, setId?: string): QuizQuestion => formatQuizCodeQuestion({ id, worldId: W, lessonId, topic: t, concept, difficulty, xp: xp[difficulty], question: emphasizeQuizPrompt(W, question), explanation, hint, type, ...data, ...(setId ? { setId } : {}) } as QuizQuestion);

const full = (lines: string[]) => lines;
const lessonQuestions: QuizQuestion[] = lessons.flatMap(([key, t], index) => {
  const lessonId = lid(key); const base = `w9q-${index + 1}`;
  const mk = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) => make(`${base}-${n}`, lessonId, t, c, d, q, e, h, type, data);
  const specs = [
    { easy:'Which expression is a lambda that adds 2 to its Int input?', right:'{ n: Int -> n + 2 }', wrong:['fun(n: Int) = n + 2','{ n: Int, n + 2 }','{ n + 2 }'], truth:'A lambda does not run until code invokes it.', trace:['val addTwo = { n: Int -> n + 2 }','println(addTwo(5))'], out:'7', outWrong:['5','2','Error'], app:'Which part of `{ n: Int -> n * 3 }` is the result?', appRight:'n * 3', appWrong:['n: Int','->','the opening brace'], second:['val join = { a: String, b: String -> a + b }','println(join("A", "B"))'], secondOut:'AB', secondWrong:['A B','BA','Error'], facts:['A lambda can be stored in a variable.','A lambda can have more than one parameter.','A lambda runs merely because it is declared.','The arrow is optional when parameters are named.'], error:['val add = { n: Int -> n + 1 }','println(add())'], errorLine:1, errorNote:'add requires one Int argument.', a:['val add = { n: Int -> n + 1 }','println(add(2))'], b:['val add = { n: Int -> n + 1 }','println(add())'], hard:['The last expression in a lambda supplies its result.','A lambda can be called with parentheses.','Braces alone call a lambda.','Every lambda needs exactly one parameter.'], hardExplain:'A lambda is a value. It runs when invoked, and its final expression becomes its result.' },
    { easy:'Which value is an anonymous function that adds 2?', right:'fun(n: Int): Int = n + 2', wrong:['fun add(n: Int) = n + 2','{ n: Int -> n + 2 }','fun(n: Int) -> n + 2'], truth:'An anonymous function can use a plain return inside its own body.', trace:['val addTwo = fun(n: Int): Int { return n + 2 }','println(addTwo(5))'], out:'7', outWrong:['5','2','Error'], app:'What makes `fun(n: Int): Int = n + 2` anonymous?', appRight:'It has no function name.', appWrong:['It has no parameter type.','It cannot return a value.','It is called immediately.'], second:['val label = fun(n: Int): String = "#" + n','println(label(4))'], secondOut:'#4', secondWrong:['4','#','Error'], facts:['An anonymous function is a callable value.','It can declare its parameter and return types.','It must be assigned a top-level name.','It cannot be invoked from a variable.'], error:['val add: (Int) -> Int = fun(n: Int): Int { return n + 1 }','println(add())'], errorLine:1, errorNote:'add requires one Int argument.', a:['val test = fun(n: Int): Boolean { return n > 0 }','println(test(1))'], b:['val test = fun(n: Int): Boolean { return n > 0 }','println(test())'], hard:['An anonymous function may use return inside its body.','An anonymous function can be stored in a variable.','Every anonymous function must have a declared name.','An anonymous function cannot have a return type.'], hardExplain:'An anonymous function is a function value with its own function body and return boundary.' },
    { easy:'Which type describes a function that takes Int and returns String?', right:'(Int) -> String', wrong:['(String) -> Int','Int -> String','(Int, String)'], truth:'In `(Int) -> String`, Int is the parameter type and String is the return type.', trace:['val label: (Int) -> String = { "#" + it }','println(label(4))'], out:'#4', outWrong:['4','#','Error'], app:'Which callable fits the type `() -> Int`?', appRight:'{ 42 }', appWrong:['{ n: Int -> n + 1 }','{ "42" }','{ a: Int, b: Int -> a + b }'], second:['val twice: (Int) -> Int = { it * 2 }','println(twice(6))'], secondOut:'12', secondWrong:['6','8','Error'], facts:['Function types show parameter types before the arrow.','Function types show the return type after the arrow.','The return type appears before the parameter type.','A typed callable cannot be invoked.'], error:['val label: (Int) -> String = { n -> n + 1 }','println(label(2))'], errorLine:0, errorNote:'This lambda returns Int, but the declared function type returns String.', a:['val twice: (Int) -> Int = { it * 2 }','println(twice(3))'], b:['val twice: (Int) -> Int = { it * 2 }','println(twice("3"))'], hard:['`(Int) -> Int` accepts one Int.','`(Int) -> Int` produces an Int.','`(Int) -> Int` can accept a String.','`(Int) -> Int` has two parameters.'], hardExplain:'Both parameter and return positions must agree with the callable.' },
    { easy:'What makes a function higher-order?', right:'It receives or returns a function value.', wrong:['It must use a loop.','It always returns Int.','It can never call its parameter.'], truth:'A higher-order function can invoke a function parameter.', trace:['fun apply(n: Int, op: (Int) -> Int): Int = op(n)','println(apply(3) { it * 2 })'], out:'6', outWrong:['3','5','Error'], app:'In `apply(3) { it * 2 }`, what is passed as `op`?', appRight:'The lambda `{ it * 2 }`', appWrong:['The number 3','The result 6','The word apply'], second:['fun combine(a: Int, b: Int, op: (Int, Int) -> Int) = op(a, b)','println(combine(2, 5) { x, y -> x + y })'], secondOut:'7', secondWrong:['10','25','Error'], facts:['A higher-order function may accept a function parameter.','The received function can be invoked inside it.','Passing a lambda always runs it immediately.','A higher-order function must return another function.'], error:['fun apply(n: Int, op: (Int) -> Int) = op(n)','println(apply(3))'], errorLine:1, errorNote:'apply requires its function argument.', a:['fun apply(n: Int, op: (Int) -> Int) = op(n)','println(apply(3) { it + 1 })'], b:['fun apply(n: Int, op: (Int) -> Int) = op(n)','println(apply { it + 1 })'], hard:['A function parameter can be invoked like `op(value)`.','A lambda can be supplied to a higher-order function.','Passing a lambda always evaluates it before the call begins.','Higher-order functions cannot return ordinary values.'], hardExplain:'Higher-order functions handle callable values and decide when to invoke them.' },
    { easy:'When may a lambda use `it`?', right:'When it has one implicit parameter.', wrong:['When it has two parameters.','Only inside a loop.','Only when it returns Unit.'], truth:'`it` names the single implicit parameter of a lambda.', trace:['val square: (Int) -> Int = { it * it }','println(square(4))'], out:'16', outWrong:['8','4','Error'], app:'Which lambda correctly uses `it` to add 3?', appRight:'{ it + 3 }', appWrong:['{ it, other -> it + 3 }','{ -> it + 3 }','{ value -> it + 3 }'], second:['val words = listOf("a", "bb")','println(words.map { it.length })'], secondOut:'[1, 2]', secondWrong:['[2, 2]','[a, bb]','Error'], facts:['`it` is the implicit parameter name.','`it` works when exactly one parameter is implicit.','`it` names every parameter in a two-parameter lambda.','`it` is the collection being mapped.'], error:['val sum: (Int, Int) -> Int = { it + 1 }','println(sum(2, 3))'], errorLine:0, errorNote:'A two-parameter lambda needs explicit parameter names; it is unavailable.', a:['val plusOne: (Int) -> Int = { it + 1 }','println(plusOne(2))'], b:['val plusOne: (Int) -> Int = { x -> it + 1 }','println(plusOne(2))'], hard:['`it` represents the current single lambda argument.','An explicit parameter name replaces `it`.','`it` is available for every lambda with two inputs.','`it` automatically refers to the surrounding list.'], hardExplain:'Kotlin supplies it only for one implicit lambda parameter.' },
    { easy:'Which expression passes the named function `double` as a value?', right:'::double', wrong:['double()','double','->double'], truth:'`::double` is a function reference; it does not call double yet.', trace:['fun double(n: Int) = n * 2','val transform = ::double','println(transform(4))'], out:'8', outWrong:['4','2','Error'], app:'What does `::double` create?', appRight:'A callable reference to double', appWrong:['The result of calling double','A String named double','A second copy of double'], second:['fun greet(name: String) = "Hi " + name','val message = ::greet','println(message("Ada"))'], secondOut:'Hi Ada', secondWrong:['Ada','Hi','Error'], facts:['A function reference can be stored in a variable.','A reference is invoked only when called.','`::name` immediately calls name.','A reference has no function type.'], error:['fun double(n: Int) = n * 2','val f: (Int) -> Int = double','println(f(4))'], errorLine:1, errorNote:'Use ::double to turn the named function into a value.', a:['fun double(n: Int) = n * 2','val f: (Int) -> Int = ::double','println(f(4))'], b:['fun double(n: Int) = n * 2','val f: (Int) -> Int = double','println(f(4))'], hard:['`::double` can be passed to a function expecting `(Int) -> Int`.','A reference can be invoked through its variable.','`double` and `::double` mean the same thing in a value position.','A reference runs at the moment it is created.'], hardExplain:'The double-colon syntax creates a callable value without calling the function.' },
    { easy:'What does a lambda return when it has no explicit return statement?', right:'The value of its final expression', wrong:['Always Unit','The first expression','Nothing'], truth:'A lambda’s final expression supplies its result.', trace:['val label = { n: Int -> "#" + n }','println(label(3))'], out:'#3', outWrong:['3','#','Error'], app:'What does this lambda return: `{ n: Int -> n * 2 }`?', appRight:'The Int result of n * 2', appWrong:['Unit always','The lambda itself','Nothing until println'], second:['val pick = { n: Int ->','  if (n > 0) "positive" else "other"','}','println(pick(-1))'], secondOut:'other', secondWrong:['positive','-1','Error'], facts:['The final lambda expression can be its result.','Calling a lambda obtains its result.','A lambda result prints automatically.','A lambda always requires a return keyword.'], error:['val label: (Int) -> String = { n -> n + 1 }','println(label(2))'], errorLine:0, errorNote:'The final expression is Int, but the declared result type is String.', a:['val label: (Int) -> String = { n -> "#" + n }','println(label(2))'], b:['val label: (Int) -> String = { n -> n + 1 }','println(label(2))'], hard:['A lambda can return a value without `return`.','The caller receives the final expression value.','The final expression prints by itself.','Every lambda has Unit return type.'], hardExplain:'A lambda evaluates to its last expression unless another rule controls its return.' },
    { easy:'Which label skips only the current `forEach` lambda call?', right:'return@forEach', wrong:['return@each','return','break@forEach'], truth:'`return@forEach` returns locally from the current forEach lambda.', trace:['listOf(1, 2, 3).forEach {','  if (it == 2) return@forEach','  println(it)','}'], out:'1\n3', outWrong:['1','1\n2\n3','Error'], app:'What does `return@forEach` do?', appRight:'Skips the rest of the current lambda call', appWrong:['Exits main immediately','Stops every loop forever','Returns a value named forEach'], second:['listOf("A", "", "B").forEach { text ->','  if (text == "") return@forEach','  println(text)','}'], secondOut:'A\nB', secondWrong:['A','A\n\nB','Error'], facts:['A labelled return can target a lambda call.','The label names the receiving function.','Every return inside a lambda exits main.','A label automatically creates a String result.'], error:['listOf(1, 2).forEach { n ->','  if (n == 1) return@each','  println(n)','}'], errorLine:1, errorNote:'There is no each label; forEach is the receiving function.', a:['listOf(1, 2).forEach { n ->','  if (n == 1) return@forEach','  println(n)','}'], b:['listOf(1, 2).forEach { n ->','  if (n == 1) return@each','  println(n)','}'], hard:['A local return skips one lambda invocation.','Later forEach elements can still run.','return@forEach exits the whole enclosing function.','A local return always stops the collection loop.'], hardExplain:'The label confines control flow to the intended lambda invocation.' },
    { easy:'What does `inline` describe on a higher-order function?', right:'How the compiler may substitute its function body at call sites', wrong:['A different printed result','A collection operation','A nullable type'], truth:'Marking a function inline does not by itself change its ordinary output.', trace:full(['inline fun apply(n: Int, op: (Int) -> Int) = op(n)','fun main() {','  println(apply(3) { it * 2 })','}']), out:'6', outWrong:['3','inline','Error'], app:'Which declaration is an inline higher-order function?', appRight:'inline fun run(block: () -> Unit) = block()', appWrong:['inline val run = 3','fun inline(run: Int) = run','inline fun run() = 3'], second:full(['inline fun show(block: () -> String) {','  println(block())','}','fun main() {','  show { "ok" }','}']), secondOut:'ok', secondWrong:['Unit','inline','Error'], facts:['inline is written on a function declaration.','An inline function can receive a lambda parameter.','inline always changes a function’s returned value.','Every function is inline automatically.'], error:full(['inline fun bad() {','  val value = 1','  println(value)','}','fun main() {','  bad()','}']), errorLine:0, errorNote:'Kotlin does not allow inline functions without function parameters to inline.', a:full(['inline fun apply(n: Int, op: (Int) -> Int) = op(n)','fun main() { println(apply(2) { it + 1 }) }']), b:full(['inline fun apply(n: Int, op: (Int) -> Int) = op(n)','fun main() { println(apply(2)) }']), hard:['inline can be used on a higher-order function.','inline alone does not change normal output.','inline means the lambda cannot be called.','inline is a value printed by the function.'], hardExplain:'inline affects compilation and enables particular control-flow rules; it does not alter ordinary evaluation.' },
    { easy:'What does `noinline` do to an inline function parameter?', right:'Keeps that parameter as a function value', wrong:['Disables the whole function','Prevents the parameter from running','Makes every parameter noinline'], truth:'A noinline parameter can be stored or returned as a function value.', trace:full(['inline fun keep(noinline op: (Int) -> Int): (Int) -> Int = op','fun main() {','  println(keep { it + 2 }(3))','}']), out:'5', outWrong:['3','2','Error'], app:'Where is `noinline` written?', appRight:'Before a function parameter in an inline function', appWrong:['Before the function name only','After the return type','Before every lambda call'], second:full(['inline fun later(noinline task: () -> String) {','  val saved = task','  println(saved())','}','fun main() {','  later { "saved" }','}']), secondOut:'saved', secondWrong:['Unit','later','Error'], facts:['A noinline parameter remains a function value.','A noinline parameter can still be invoked.','noinline stops the enclosing function from being inline.','Every inline parameter is automatically noinline.'], error:full(['inline fun keep(op: (Int) -> Int): (Int) -> Int {','  return op','}','fun main() {','  println(keep { it + 1 }(2))','}']), errorLine:1, errorNote:'An inline parameter is not a value that can be returned; mark op noinline.', a:full(['inline fun keep(noinline op: (Int) -> Int): (Int) -> Int = op','fun main() { println(keep { it + 1 }(2)) }']), b:full(['inline fun keep(op: (Int) -> Int): (Int) -> Int = op','fun main() { println(keep { it + 1 }(2)) }']), hard:['A noinline parameter can be stored in a variable.','A noinline parameter can still be called.','noinline prevents all code in the function from running.','noinline changes the lambda result.'], hardExplain:'noinline applies to one parameter and preserves it as a callable value.' },
    { easy:'What does `crossinline` prevent for its parameter?', right:'A non-local return', wrong:['All lambda returns','Calling the lambda','Returning a normal value'], truth:'crossinline still allows ordinary invocation and ordinary lambda results.', trace:full(['inline fun show(crossinline text: () -> String) {','  println(text())','}','fun main() {','  show { "ok" }','}']), out:'ok', outWrong:['crossinline','Unit','Error'], app:'Why use crossinline?', appRight:'The lambda will run inside another boundary and must not non-locally return', appWrong:['To make the lambda asynchronous','To change its result type','To prevent calling it'], second:full(['inline fun twice(crossinline op: (Int) -> Int, n: Int) {','  println(op(n))','  println(op(n + 1))','}','fun main() {','  twice({ it * 2 }, 2)','}']), secondOut:'4\n6', secondWrong:['2\n3','4','Error'], facts:['crossinline blocks non-local returns from that parameter.','A crossinline lambda can still return an ordinary expression value.','crossinline makes the lambda asynchronous.','crossinline prevents the lambda from being invoked.'], error:full(['inline fun run(crossinline block: () -> Unit) {','  val saved = { block() }','  saved()','}','fun stop() {','  run { return }','}','fun main() { stop() }']), errorLine:4, errorNote:'A crossinline lambda cannot make a non-local return from stop.', a:full(['inline fun run(crossinline block: () -> Unit) { block() }','fun main() { run { println("ok") } }']), b:full(['inline fun run(crossinline block: () -> Unit) { block() }','fun stop() { run { return } }','fun main() { stop() }']), hard:['crossinline blocks a non-local return.','crossinline does not change an ordinary lambda result.','crossinline prevents every kind of return expression.','crossinline makes the lambda run later automatically.'], hardExplain:'crossinline limits only the non-local control-flow escape while retaining ordinary lambda behavior.' },
  ][index];
  if (index === 0) Object.assign(specs, { errorNote: 'The lambda `add` needs one Int argument, but this call supplies none.' });
  if (index === 1) Object.assign(specs, { errorNote: 'The anonymous function has signature `(Int) -> Int`; `add()` omits its required Int argument.' });
  if (index === 5) Object.assign(specs, { errorNote: 'A function reference is written `::double`; bare `double` does not create the `(Int) -> Int` value required here.' });
  if (index === 8) Object.assign(specs, {
    error: full(['inline fun apply(n: Int, op: (Int) -> Int): String = op(n)', 'fun main() { println(apply(2) { it + 1 }) }']),
    errorLine: 0,
    errorNote: 'The function body returns Int, but apply declares String as its return type.',
  });
  const traceExplanations = [
    ['The lambda receives 5, evaluates `5 + 2`, and returns 7.', 'Both String arguments reach the lambda; `a + b` concatenates them as `AB`.'],
    ['The anonymous function returns `5 + 2` from its own body, so the call prints 7.', 'The anonymous function builds `#` plus the decimal form of 4, producing `#4`.'],
    ['The typed callable accepts 4, substitutes it for `it`, and returns the String `#4`.', 'The `(Int) -> Int` value doubles 6, so the printed result is 12.'],
    ['`apply` calls `op(3)`; the trailing lambda doubles 3 and returns 6.', '`combine` passes 2 and 5 as `x` and `y`; the lambda adds them to get 7.'],
    ['Here `it` is 4, so `it * it` returns 16.', '`map` invokes the one-parameter lambda for each word; their lengths are 1 and 2.'],
    ['`::double` stores a callable reference; invoking it with 4 returns 8.', '`::greet` is invoked with `Ada`, so the function returns `Hi Ada`.'],
    ['The lambda’s final expression is `"#" + 3`; that value is printed as `#3`.', 'For -1 the condition is false, so the lambda returns the `else` value `other`.'],
    ['`return@forEach` skips only the current item 2; the remaining items print 1 and 3.', 'The labelled return skips the empty String’s iteration, leaving A and B to print.'],
    ['Inlining does not change evaluation: `apply` invokes the lambda with 3, yielding 6.', '`show` invokes the lambda, whose final String expression is `ok`.'],
    ['`keep` returns the noinline function value; the caller invokes it with 3 and gets 5.', '`task` is retained as a function value, then `saved()` runs it and returns `saved`.'],
    ['`crossinline` still allows an ordinary call; the lambda returns `ok` to `println`.', '`twice` calls the lambda with 2 and 3, so the two printed results are 4 and 6.'],
  ][index];
  const rationale = [
    {
      choice:'`{ n: Int -> n + 2 }` is a lambda with a named parameter and arrow. `fun(n: Int) = ...` is an anonymous function, not lambda syntax; the comma form is malformed; `{ n + 2 }` refers to an undeclared `n`.',
      truth:'True: declaring a lambda creates a function value; the body runs only when that value is invoked, as with `addTwo(5)`.',
      app:'`n * 3` is the body expression after the arrow. `n: Int` declares the parameter, while the arrow separates parameters from the body; the brace only delimits the lambda.',
      purpose:'A lambda can be stored and can declare multiple parameters. Declaration does not execute it, and named parameters require the arrow to separate them from the body.',
      facts:'The lambda is storable and may take multiple parameters. It does not execute at declaration, and a named parameter needs the arrow before its body.',
      comparison:'A compiles because `add` is invoked with its required Int. B calls it with no argument, so Kotlin reports a missing parameter.',
      edge:'The final expression supplies a lambda result, and the lambda can be invoked with parentheses. Braces only declare it; lambdas may have zero, one, or multiple parameters.',
    },
    {
      choice:'`fun(n: Int): Int = n + 2` is an unnamed function value with an explicit parameter and result type. `fun add` is named; the brace form is a lambda; `->` is not anonymous-function expression syntax.',
      truth:'True: `return` exits the anonymous function body, so its function value returns to its caller rather than returning from the enclosing function.',
      app:'It is anonymous because no name appears between `fun` and `(`. Its parameter type is explicit, it returns a value, and assigning the value does not call it.',
      purpose:'An anonymous function is callable and can declare both types. It needs no top-level name and can be invoked through its variable.',
      facts:'It is a callable value and may state both types. It need not have a top-level name, and a variable holding it can be called.',
      comparison:'A invokes the anonymous function with the required Int and prints its Boolean result. B supplies no argument, so the call fails the one-parameter signature.',
      edge:'An anonymous function has its own return boundary and can be stored. It may be unnamed and can declare a result type; those are not errors.',
    },
    {
      choice:'`(Int) -> String` means one Int parameter and a String result. `(String) -> Int` reverses those roles; `Int -> String` omits required parentheses; `(Int, String)` has no function arrow/result type.',
      truth:'True: types before `->` are parameters; the type after it is the result. Thus `(Int) -> String` accepts Int and returns String.',
      app:'`() -> Int` has no parameters and returns Int, so `{ 42 }` fits. The other lambdas take parameters or return String, so their signatures do not match.',
      purpose:'The parameter types precede the arrow and the result follows it. A typed callable is still invoked normally; the return type is not placed first.',
      facts:'A function type lists parameter types before `->` and its result type after it. The result does not come first, and a value of that type remains callable.',
      comparison:'A supplies an Int and returns an Int, matching `(Int) -> Int`. B passes a String where the function requires an Int.',
      edge:'The type accepts one Int and produces one Int. It neither accepts String nor describes two parameters; those require different signatures.',
    },
    {
      choice:'A function is higher-order when it receives or returns a function. It need not use a loop or return Int, and it may invoke its function parameter.',
      truth:'True: `apply` receives `op` as a function parameter and calls it with `n`.',
      app:'The trailing lambda is passed as `op`; `apply` invokes it later. The integer is the separate `n` argument, not the lambda’s result.',
      purpose:'A higher-order function may accept and invoke a callable. Passing a lambda supplies behavior; it does not mean every higher-order function returns another function.',
      facts:'It may accept a function parameter and invoke it. Passing a lambda supplies the callable; it is not necessarily executed before the function receives it, and no function return is required.',
      comparison:'A supplies both `n` and `op`, allowing `apply` to call the lambda. B omits `n`, so its required Int argument is missing.',
      edge:'`op(value)` invokes a function parameter, and a lambda can be passed as that value. Passing it does not force eager execution, and a higher-order function may return an ordinary value.',
    },
    {
      choice:'`it` is available for one implicit lambda parameter. Two parameters need names; `it` is not limited to loops or Unit-returning lambdas.',
      truth:'True: with one unnamed lambda parameter, Kotlin provides `it` as that parameter’s name.',
      app:'`{ it + 3 }` uses the single implicit parameter. The other options combine `it` with explicit/multiple parameters, where it is not available.',
      purpose:'`it` names the one implicit parameter, not the collection. A two-parameter lambda needs explicit parameter names.',
      facts:'`it` is the implicit name for one parameter. It is not a name for every parameter in a multi-parameter lambda or for the collection receiver.',
      comparison:'A uses the single implicit parameter consistently. B declares `x` explicitly, so the body must use `x`; `it` is not introduced as a second name.',
      edge:'`it` can stand for one single implicit argument, and an explicit name replaces it. It is unavailable for two inputs and does not refer automatically to an outer list.',
    },
    {
      choice:'`::double` creates a function reference. `double()` calls the function, bare `double` is not a value reference here, and `->double` is not reference syntax.',
      truth:'True: creating `::double` stores a reference; execution happens later when that reference is called.',
      app:'`::double` creates a callable reference, not a call or a copied function body. It can be stored or passed where a matching function type is expected.',
      purpose:'A reference can be stored and called through its variable. `::name` does not invoke immediately, and the reference has a function type.',
      facts:'A reference can be stored and runs when invoked. `::name` does not call at creation, and the reference has a callable type.',
      comparison:'A uses `::double` to create the `(Int) -> Int` value. B uses the function name without reference syntax, so it cannot initialize that value.',
      edge:'A reference can be passed and called through its variable. Bare `double` is not interchangeable with `::double` in a value position, and creating a reference does not execute it.',
    },
    {
      choice:'A lambda returns its final expression unless it explicitly changes control flow. `return` is not required, and its first expression or the lambda object is not the result.',
      truth:'True: the lambda’s final expression is its result; it is returned to the caller, not printed automatically.',
      app:'The final expression `n * 2` produces the Int result. A lambda does not always return Unit, nor does `println` or the lambda value replace that result.',
      purpose:'The final expression supplies a result and the caller receives it. A result is not printed by itself, and a lambda need not use `return`.',
      facts:'The final expression can be returned, and the caller receives it on invocation. It does not print automatically; an explicit `return` is not always required.',
      comparison:'A’s final expression is a String, matching the declared result type. B’s final expression is Int, so it cannot satisfy `(Int) -> String`.',
      edge:'A lambda can return its final value without `return`, and the caller receives that value. It does not print by itself or always have Unit result.',
    },
    {
      choice:'`return@forEach` targets the current `forEach` lambda. `return@each` has no matching label, bare `return` exits an enclosing function, and `break@forEach` is not a lambda return.',
      truth:'True: the label targets this lambda invocation, so the current element is skipped while later elements can still be visited.',
      app:'It skips the remaining statements in only the current lambda call. It does not exit `main`, stop all future iterations, or return a value named `forEach`.',
      purpose:'A label identifies the receiving lambda and confines the return to that call. It neither automatically creates a value nor exits the enclosing function.',
      facts:'A labelled return can target the receiving lambda. It does not make every return leave `main`, and a label is not a value or a result type.',
      comparison:'A uses the real `forEach` label and skips the current call. B uses `each`, which is not the lambda’s label, so the return target is invalid.',
      edge:'A local return skips only that invocation; `forEach` can continue with later elements. It does not exit the enclosing function or stop the whole collection traversal.',
    },
    {
      choice:'`inline fun run(block: () -> Unit)` is an inline function with a function parameter. `inline val` is not allowed, `fun inline` puts the modifier in the wrong place, and the last option has no higher-order parameter.',
      truth:'True: `inline` affects compilation, not the ordinary result printed by this call.',
      app:'The first declaration is an inline function that receives and invokes a lambda. The alternatives use an invalid property modifier, invalid declaration order, or no function parameter.',
      purpose:'`inline` belongs on a function declaration, and an inline function can receive a lambda. It does not force every function to be inline or alter values automatically.',
      facts:'`inline` modifies a function declaration, and the function may receive a lambda. It does not automatically change results, and other functions are not inline by default.',
      comparison:'A passes the required lambda and prints its result. B omits `op`, so the function parameter is missing; `inline` does not remove normal arguments.',
      edge:'Inline functions may receive higher-order parameters and still evaluate normally. `inline` neither prevents lambda invocation nor becomes a printed value.',
    },
    {
      choice:'`noinline` preserves that parameter as a function value. It does not disable the enclosing function or prevent calls; it applies only where marked.',
      truth:'True: `noinline` lets the parameter remain a normal callable value that can be stored or returned.',
      app:'`noinline` is written on a parameter of an inline function. It is not a modifier on the function name, return type, or a later call.',
      purpose:'The marked parameter remains a function value and can still be called. `noinline` does not disable the enclosing inline function or apply automatically to every parameter.',
      facts:'A noinline parameter remains callable and can be invoked. The modifier does not stop the enclosing function or make all its parameters noinline.',
      comparison:'A marks `op` noinline before returning it as a function value. B tries to return an ordinary inline parameter, which Kotlin rejects.',
      edge:'A noinline parameter can be stored and called. The modifier affects that parameter only; it neither stops the function nor changes the lambda’s result.',
    },
    {
      choice:'`crossinline` prevents a non-local return across another execution boundary. It still allows ordinary lambda returns, invocation, and values.',
      truth:'True: the modifier restricts non-local control flow, not ordinary invocation or the lambda’s normal result.',
      app:'Use it when the lambda runs inside another boundary and must not return from the caller. It does not make code asynchronous or change the type/value.',
      purpose:'A crossinline lambda can still be called and return an ordinary expression. It is neither asynchronous nor unusable.',
      facts:'`crossinline` blocks non-local returns while preserving normal invocation and expression results. It does not make a lambda asynchronous or forbid all calls.',
      comparison:'A uses an ordinary lambda call allowed by `crossinline`. B attempts a non-local return from `stop`, which the modifier forbids.',
      edge:'`crossinline` blocks the non-local escape but allows ordinary lambda results. It does not ban every return or automatically delay execution.',
    },
  ][index];
  return [
    mk(1,'easy',`${t} core idea`,specs.easy,rationale.choice,'Identify the form or rule specific to this lesson.','single_choice',{...choice(specs.right,specs.wrong),monoOptions:true}),
    mk(2,'easy',`${t} rule`,`True or false: ${specs.truth}`,rationale.truth,'Decide whether the statement describes Kotlin behavior.','true_false',{answer:true}),
    mk(3,'medium',`${t} trace`,'What does this code print?',traceExplanations[0],'Follow the value through the callable.','predict_output',{...choice(specs.out,specs.outWrong),code:specs.trace,monoOptions:true}),
    mk(4,'medium',`${t} application`,specs.app,rationale.app,'Apply the lesson rule to this exact declaration or value.','single_choice',{...choice(specs.appRight,specs.appWrong),monoOptions:true}),
    mk(5,'medium',`${t} purpose`,`Which statement describes a use of ${t.toLowerCase()}?`,rationale.purpose,'Choose the statement tied to the feature, not a general Kotlin claim.','single_choice',{...choice(specs.facts[0],[specs.facts[2],specs.facts[3],'It changes every result to zero.']),monoOptions:true}),
    mk(6,'medium',`${t} second trace`,'What does this different example print?',traceExplanations[1],'Trace the argument, return value, and any control flow.','predict_output',{...choice(specs.secondOut,specs.secondWrong),code:specs.second,monoOptions:true}),
    mk(7,'medium',`${t} misconceptions`,'Select the two correct statements.',rationale.facts,'Check the callable form and when it runs.','multi_select',{options:specs.facts,answers:[0,1]}),
    mk(8,'hard',`${t} compiler rule`,'Tap the line that does not compile.',specs.errorNote,'Check the parameter, return type, label, or inline rule on the marked line.','find_error',{code:specs.error,errorLine:specs.errorLine,errorNote:specs.errorNote}),
    mk(9,'hard',`${t} comparison`,'Which program follows this lesson’s rule?',rationale.comparison,'Compare the declaration and how the callable is used.','code_comparison',{a:specs.a,b:specs.b,answer:0}),
    mk(10,'hard',`${t} edge case`,'Select the two true statements.',rationale.edge,'Separate control flow and type rules from plausible misconceptions.','multi_select',{options:specs.hard,answers:[0,1]}),
  ];
});

const setQuestions: QuizQuestion[] = setRows.flatMap(([setId, title, keys], index) => {
  const last = lid(keys[keys.length - 1]); const base = `w9q-set-${index + 1}`;
  const mk = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) => make(`${base}-${n}`, last, title, c, d, q, e, h, type, data, setId);
  const combined = [
    { easy:'Which declaration stores a callable that takes an Int and returns an Int?', right:'val adjust: (Int) -> Int = { n -> n + 1 }', wrong:['val adjust: Int = { n -> n + 1 }','val adjust: (Int) -> String = { n -> n + 1 }','val adjust = fun(n: Int): String { n + 1 }'], trace:code(['val add = fun(n: Int): Int = n + 3','val operation: (Int) -> Int = add','println(operation(4))']), out:'7', outWrong:['4','3','Error'], blank:code(['val twice: (Int) ___ Int = { n -> n * 2 }','println(twice(3))']), answer:'->', chips:['->','=>',':','=='], hard:code(['val multiply: (Int, Int) -> Int = { a, b -> a * b }','println(multiply(2, 4))']), hardOut:'8', hardWrong:['6','24','Error'], explain:'This set combines lambda syntax, anonymous functions, and compatible function types.' },
    { easy:'Which expression passes the named function `double` as a callable value?', right:'::double', wrong:['double()','double','->double'], trace:code(['fun apply(n: Int, op: (Int) -> Int) = op(n)','fun double(n: Int) = n * 2','println(apply(3, ::double))']), out:'6', outWrong:['3','9','Error'], blank:code(['fun apply(n: Int, op: (Int) -> Int) = op(n)','println(apply(4) ___ it + 1 })']), answer:'{', chips:['{','::','->','('], hard:code(['fun decorate(text: String) = "[" + text + "]"','fun format(text: String, op: (String) -> String) = op(text)','println(format("go", ::decorate))']), hardOut:'[go]', hardWrong:['go','decorate','Error'], explain:'This set combines higher-order calls, the implicit it parameter, and function references.' },
    { easy:'What supplies the result of `{ n: Int -> n * 2 }`?', right:'Its final expression, n * 2', wrong:['println automatically','A required return keyword','The lambda declaration itself'], trace:code(['val describe = { n: Int -> "#" + n }','println(describe(2))']), out:'#2', outWrong:['2','#','Error'], blank:code(['listOf(1, 2, 3).forEach {','  if (it == 2) ___forEach','  println(it)','}']), answer:'return@', chips:['return@','return','break@','continue@'], hard:code(['listOf("A", "", "B").forEach { text ->','  if (text == "") return@forEach','  println(text + "!")','}']), hardOut:'A!\nB!', hardWrong:['A!','A!\n!\nB!','Error'], explain:'This set combines lambda final-expression results with labelled local returns.' },
    { easy:'Which modifier keeps one inline function parameter as a function value?', right:'noinline', wrong:['crossinline','return@','it'], trace:full(['inline fun keep(noinline op: (Int) -> Int): (Int) -> Int = op','fun main() {','  println(keep { it + 1 }(4))','}']), out:'5', outWrong:['4','1','Error'], blank:full(['inline fun show(crossinline block: () -> String) {','  println(block())','}','fun main() {','  show ___ "ok" }','}']), answer:'{', chips:['{','::','->','('], hard:full(['inline fun run(crossinline block: () -> Unit) {','  block()','}','fun main() {','  run { println("safe") }','}']), hardOut:'safe', hardWrong:['Unit','crossinline','Error'], explain:'This set combines inline functions with noinline function values and crossinline control-flow limits.' },
  ][index];
  const explanations = [
    {
      easy:'The declaration’s type is `(Int) -> Int`, and its lambda accepts `n` and returns `n + 1`. The other choices declare a non-callable Int, the wrong String result, or an anonymous function with a result mismatch.',
      trace:'The anonymous function adds 3 to 4 and is stored in a matching `(Int) -> Int` value; invoking that value prints 7.',
      blank:'The arrow separates the one Int parameter from the function result type. `=>`, `:`, and `==` are not the Kotlin function-type arrow.',
      hard:'The lambda accepts two Ints and multiplies them once, so the call prints 8. Addition would produce 6; 24 adds an extra operation that is not in the code; no error occurs.',
    },
    {
      easy:'`::double` creates a reference to pass as `op`. `double()` calls it too early, bare `double` is not a value reference, and `->double` is not Kotlin reference syntax.',
      trace:'`apply` invokes `op(3)`. The supplied `::double` calls `double(3)`, producing 6.',
      blank:'The trailing lambda is the `op` function argument, and its single implicit `it` is increased by 1. The opening brace begins that lambda; the other chips cannot begin it here.',
      hard:'`format` passes `go` to `decorate`, which wraps it in brackets. The output is `[go]`; the other choices omit the wrapper or incorrectly report an error.',
    },
    {
      easy:'A lambda’s final expression supplies its result, so `n * 2` is returned. `println` only displays a value, `return` is not required, and the lambda declaration itself is not the result.',
      trace:'The lambda returns `#` plus 2, producing `#2`; `describe(2)` supplies that String to `println`.',
      blank:'`return@forEach` skips only the current element’s remaining lambda body. Bare `return` would target an enclosing function; break/continue labels are not interchangeable here.',
      hard:'For the empty String, `return@forEach` skips the print. The other two elements each print with `!`, yielding A! and B!; no error occurs.',
    },
    {
      easy:'`noinline` keeps the selected parameter as a normal function value. `crossinline` restricts non-local returns; `return@` is return syntax, and `it` is a parameter name.',
      trace:'`keep` returns the noinline callable. The caller immediately invokes it with 4; adding 1 prints 5.',
      blank:'The trailing lambda starts with `{`, and its final String expression is the value passed to `show`. The other chips cannot open a lambda body.',
      hard:'`run` invokes its crossinline lambda normally, so it prints `safe`. The modifier neither prints itself nor prevents invocation; no error is raised.',
    },
  ][index];
  return [
    mk(1, 'easy', 'Combined concepts', combined.easy, explanations.easy, 'Use the features from all lessons in this set.', 'single_choice', { ...choice(combined.right, combined.wrong), monoOptions: true }),
    mk(2, 'medium', 'Combined trace', 'What does this code print?', explanations.trace, 'Trace the callable through each step.', 'predict_output', { ...choice(combined.out, combined.outWrong), code: combined.trace, monoOptions: true }),
    mk(3, 'medium', 'Complete a combined expression', 'Complete the code so it follows the set’s Kotlin rule.', explanations.blank, 'Choose the token that fits this position.', 'fill_blank', { code: combined.blank, chips: combined.chips, answer: combined.answer }),
    mk(4, 'hard', 'Combined edge case', 'What does this code print?', explanations.hard, 'Follow the function value or local control flow carefully.', 'predict_output', { ...choice(combined.hardOut, combined.hardWrong), code: combined.hard, monoOptions: true }),
  ];
});

const BOSS_TOPIC = 'Functional Utility Engine';
const boss = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) =>
  make(`w9q-boss-${n}`, 'world-9-boss', BOSS_TOPIC, c, d, q, e, h, type, data);

/**
 * Boss quiz: small utilities (formatter, scaler, filter, dispatcher) that accept or return function values. 12 questions, 1 easy / 5 medium / 6 hard
 * (10/40/50), ordered easy to hard. Every question combines at least two World 9 lessons.
 */
const bossQuestions: QuizQuestion[] = [
  boss(1, 'easy', 'Function type for a utility parameter', 'A utility needs a parameter that accepts a function. The function takes an Int and returns an Int. Which type fits?',
    '`(Int) -> Int` has one Int input and an Int result. `(String) -> Int` has the wrong input, `(Int, Int) -> Int` requires two inputs, `() -> Int` takes none, and `Int -> Int` omits the required parentheses.',
    'Parameters go in parentheses, the result after the arrow.', 'single_choice',
    { ...choice('(Int) -> Int', ['Int -> Int', '(Int, Int) -> Int', '() -> Int']), monoOptions: true }),
  boss(2, 'medium', 'Declaring a higher-order parameter', 'Complete the parameter type so the call below works.',
    'op is called with one Int and returns an Int, so its type is `(Int) -> Int`. `(Int, Int) -> Int` expects two inputs, `() -> Int` expects none, and `Int -> Int` is not valid function-type syntax. The trailing lambda doubles 3 twice, giving 12.',
    'op(x) is called with one Int and its result is an Int.', 'fill_blank',
    { code: ['fun applyTwice(x: Int, op: ___): Int = op(op(x))', 'fun main() {', '  println(applyTwice(3) { it * 2 })', '}'], chips: ['(Int) -> Int', 'Int -> Int', '(Int, Int) -> Int', '() -> Int'], answer: '(Int) -> Int' }),
  boss(3, 'medium', 'Which lambda fits a function type', 'A parameter has the type `(Int) -> Int`. Which lambda can be passed to it?',
    'A one-parameter lambda can use `it` for that parameter, and its last expression is the Int result. The other lambdas take no parameters or two parameters.',
    'Count the parameters the type expects.', 'single_choice',
    { ...choice('{ it + 1 }', ['{ it, other -> it + 1 }', '{ -> it + 1 }', '{ x, y -> x + y }']), monoOptions: true }),
  boss(4, 'medium', 'Function reference and trailing lambda', 'What does this program print?',
    '`::shout` passes the function value; applying it to Ana returns Ana!. The trailing lambda applies `it + "?"` to Bo, returning Bo?. The distractors either skip the transformation, use the wrong suffix, or claim these valid function arguments fail.',
    'Both calls pass a function; neither is called early.', 'predict_output',
    { ...choice('Ana!\nBo?', ['Ana\nBo', 'Ana!\nBo!', 'Error']), code: ['fun shout(text: String): String = text + "!"', 'fun format(name: String, style: (String) -> String): String = style(name)', 'fun main() {', '  println(format("Ana", ::shout))', '  println(format("Bo") { it + "?" })', '}'], monoOptions: true }),
  boss(5, 'medium', 'Anonymous function return versus lambda return', 'Which program compiles?',
    'A plain `return` is allowed inside an anonymous function, because it returns from that function. A lambda has no such boundary, so an unlabelled `return` in B is not allowed.',
    'Which one is a function with its own return?', 'code_comparison',
    { a: code(['val check = fun(n: Int): Boolean {', '  if (n > 5) return true', '  return false', '}', 'println(check(7))']), b: code(['val check = { n: Int ->', '  if (n > 5) return true', '  false', '}', 'println(check(7))']), answer: 0 }),
  boss(6, 'medium', 'Lambda with several statements', 'What does this program print?',
    'The last expression of a lambda is its result: 4 takes the even branch and produces `even4`; 7 takes the odd branch and produces `odd7`. The other choices omit the label text, omit the number, or incorrectly claim a compile error.',
    'Follow the last expression of the lambda.', 'predict_output',
    { ...choice('even4\nodd7', ['even\nodd', '4\n7', 'Error']), code: code(['val describe = { n: Int ->', '  val label = if (n % 2 == 0) "even" else "odd"', '  label + n', '}', 'println(describe(4))', 'println(describe(7))']), monoOptions: true }),
  boss(7, 'hard', 'Return label must match the function', 'Tap the line that does not compile.',
    'A labelled return uses the name of the function that receives the lambda. Here that is forEach, so the label must be `return@forEach`.',
    'Which function receives the lambda?', 'find_error',
    { code: code(['val numbers = listOf(1, -2, 3)', 'numbers.forEach { n ->', '  if (n < 0) return@each', '  println(n)', '}']), errorLine: 3, errorNote: 'There is no label each; use return@forEach.' }),
  boss(8, 'hard', 'Local return skips one element', 'What does this program print?',
    '`return@forEach` skips only the current call, so 2 and 4 are omitted while 1 and 3 print; execution then reaches `println("done")`. The distractors either stop the whole iteration too early, omit later output, or fail to skip even values.',
    'The return ends one lambda call, not the whole program.', 'predict_output',
    { ...choice('1\n3\ndone', ['1\ndone', '1', '1\n2\n3\n4\ndone']), code: code(['listOf(1, 2, 3, 4).forEach {', '  if (it % 2 == 0) return@forEach', '  println(it)', '}', 'println("done")']), monoOptions: true }),
  boss(9, 'hard', 'Inline, noinline and crossinline rules', 'Which statements about inline functions are true? Select all that apply.',
    'A lambda passed to an inline function can use a non-local return. A noinline parameter stays a real function value, so it can be stored. A crossinline lambda does not allow a non-local return, and inline does not change the value a function returns.',
    'Think about which parameters stay real function values.', 'multi_select',
    { options: ['A lambda passed to an inline function can use a non-local return', 'A noinline parameter can be stored in a variable', 'A crossinline lambda can use a non-local return', 'Marking a function inline changes the value it returns'], answers: [0, 1] }),
  boss(10, 'hard', 'Returning an inline parameter needs noinline', 'Tap the line that does not compile.',
    'An inline parameter is copied into the call site, so it is not a real function value that can be returned. Marking it `noinline` keeps it a value.',
    'What must a returned function value be?', 'find_error',
    { code: ['inline fun twice(action: (Int) -> Int): (Int) -> Int {', '  return action', '}', 'fun main() {', '  val f = twice { it + 1 }', '  println(f(1))', '}'], errorLine: 1, errorNote: 'action is inlined, so it cannot be returned; mark it noinline.' }),
  boss(11, 'hard', 'Ways to create a callable value', 'Given `fun double(x: Int) = x * 2`, which lines compile? Select all that apply.',
    'A function reference, a lambda and an anonymous function can all be stored as `(Int) -> Int`. The bare name `double` is not a value: it needs `::` to become a reference.',
    'Which line forgot the ::?', 'multi_select',
    { options: ['val a: (Int) -> Int = ::double', 'val b: (Int) -> Int = { it * 2 }', 'val c: (Int) -> Int = double', 'val d: (Int) -> Int = fun(x: Int) = x * 2'], answers: [0, 1, 3], monoOptions: true }),
  boss(12, 'hard', 'Function returning a function, used in a pipeline', 'What does this program print?',
    '`makeScaler(3)` returns a function that multiplies each input by 3, giving `[3, 6, 9]`. Then `triple(1)` is 3, so the second lambda adds 3 to each input, giving `[4, 5, 6]`; the distractors either add 1, skip scaling, or multiply by 3 again.',
    'triple is a function value, and its result is added inside the lambda.', 'predict_output',
    { ...choice('[3, 6, 9]\n[4, 5, 6]', ['[3, 6, 9]\n[2, 3, 4]', '[1, 2, 3]\n[4, 5, 6]', '[3, 6, 9]\n[6, 9, 12]']), code: ['fun makeScaler(factor: Int): (Int) -> Int = { it * factor }', 'fun applyAll(values: List<Int>, op: (Int) -> Int): List<Int> {', '  val result = mutableListOf<Int>()', '  for (v in values) {', '    result.add(op(v))', '  }', '  return result', '}', 'fun main() {', '  val triple = makeScaler(3)', '  println(applyAll(listOf(1, 2, 3), triple))', '  println(applyAll(listOf(1, 2, 3)) { it + triple(1) })', '}'], monoOptions: true }),
];

export const WORLD_9_QUIZ: QuizQuestion[] = [...lessonQuestions, ...setQuestions];
export const WORLD_9_BOSS_QUIZ: QuizQuestion[] = bossQuestions;
