import { emphasizeQuizPrompt, formatQuizCodeQuestion, QuizQuestion } from '../../utils/quizQuestions';
import { WORLD_3_QUIZ_SETS } from './quizSets';

const W = 'world-3';
const L = {
  if: 'world-3-if', ifElse: 'world-3-if-else', elseIf: 'world-3-else-if', when: 'world-3-when',
  ranges: 'world-3-when-with-ranges', expression: 'world-3-when-as-an-expression',
  nested: 'world-3-multiple-conditions-and-nested-condition', types: 'world-3-type-checks-with-is-where-appropriate',
  boss: 'world-3-boss',
};
const T = {
  if: 'if', ifElse: 'if-else', elseIf: 'else-if', when: 'when', ranges: 'when with ranges',
  expression: 'when as an expression', nested: 'Multiple conditions and nested conditions',
  types: 'Type checks with is where appropriate', boss: 'Grade & Eligibility System',
};
const SET = { branch: 'w3-set-branching', when: 'w3-set-when', conditions: 'w3-set-combined-conditions' };
const xp = { easy: 10, medium: 15, hard: 20 } as const;
type Diff = keyof typeof xp;
type Base = { id: string; worldId: string; lessonId: string; topic: string; concept: string; difficulty: Diff; xp: number; question: string; explanation: string; hint: string; setId?: string };
const base = (id: string, lessonId: string, topic: string, concept: string, difficulty: Diff, question: string, explanation: string, hint: string, setId?: string): Base => ({ id, worldId: W, lessonId, topic, concept, difficulty, xp: xp[difficulty], question: emphasizeQuizPrompt(W, question), explanation, hint, ...(setId ? { setId } : {}) });
let choiceSlot = 0;
const spreadAnswer = (options: string[], answer: number) => {
  const correct = options[answer];
  const rest = options.filter((_, index) => index !== answer);
  const position = choiceSlot++ % options.length;
  rest.splice(position, 0, correct);
  return { options: rest, answer: position };
};
const sc = (id: string, l: string, t: string, c: string, d: Diff, q: string, options: string[], answer: number, explanation: string, hint: string, code?: string[]): QuizQuestion => formatQuizCodeQuestion({ ...base(id,l,t,c,d,q,explanation,hint), type: 'single_choice', ...spreadAnswer(options, answer), ...(code ? { code } : {}) });
const po = (id: string, l: string, t: string, c: string, d: Diff, q: string, code: string[], options: string[], answer: number, explanation: string, hint: string, setId?: string, indentSpaces = 2): QuizQuestion => formatQuizCodeQuestion({ ...base(id,l,t,c,d,q,explanation,hint,setId), type: 'predict_output', code, ...spreadAnswer(options, answer), monoOptions: true }, indentSpaces);
const tf = (id: string, l: string, t: string, c: string, d: Diff, q: string, answer: boolean, explanation: string, hint: string): QuizQuestion => ({ ...base(id,l,t,c,d,q,explanation,hint), type: 'true_false', answer });
const fb = (id: string, l: string, t: string, c: string, d: Diff, q: string, code: string[], chips: string[], answer: string, explanation: string, hint: string): QuizQuestion => formatQuizCodeQuestion({ ...base(id,l,t,c,d,q,explanation,hint), type: 'fill_blank', code, chips, answer });
const fe = (id: string, l: string, t: string, c: string, d: Diff, q: string, code: string[], errorLine: number, explanation: string, hint: string, errorNote: string): QuizQuestion => formatQuizCodeQuestion({ ...base(id,l,t,c,d,q,explanation,hint), type: 'find_error', code, errorLine, errorNote });
const cc = (id: string, l: string, t: string, c: string, d: Diff, q: string, a: string[], b: string[], answer: 0 | 1, explanation: string, hint: string, setId?: string): QuizQuestion => formatQuizCodeQuestion({ ...base(id,l,t,c,d,q,explanation,hint,setId), type: 'code_comparison', a, b, answer });
const ms = (id: string, l: string, t: string, c: string, d: Diff, q: string, options: string[], answers: number[], explanation: string, hint: string): QuizQuestion => ({ ...base(id,l,t,c,d,q,explanation,hint), type: 'multi_select', options, answers });
const setTopic = (id: string) => WORLD_3_QUIZ_SETS.find(s => s.id === id)!.title;
const sq = (id: string, lessonId: string, setId: string, concept: string, difficulty: Diff, question: string, explanation: string, hint: string) => base(id, lessonId, setTopic(setId), concept, difficulty, question, explanation, hint, setId);
const ssc = (id: string, l: string, s: string, c: string, d: Diff, q: string, options: string[], answer: number, explanation: string, hint: string): QuizQuestion => ({ ...sq(id,l,s,c,d,q,explanation,hint), type: 'single_choice', ...spreadAnswer(options, answer) });
const spo = (id: string, l: string, s: string, c: string, d: Diff, q: string, code: string[], options: string[], answer: number, explanation: string, hint: string): QuizQuestion => formatQuizCodeQuestion({ ...sq(id,l,s,c,d,q,explanation,hint), type: 'predict_output', code, ...spreadAnswer(options, answer), monoOptions: true });
const stf = (id: string, l: string, s: string, c: string, d: Diff, q: string, answer: boolean, explanation: string, hint: string): QuizQuestion => ({ ...sq(id,l,s,c,d,q,explanation,hint), type: 'true_false', answer });
const scc = (id: string, l: string, s: string, c: string, d: Diff, q: string, a: string[], b: string[], answer: 0 | 1, explanation: string, hint: string): QuizQuestion => formatQuizCodeQuestion({ ...sq(id,l,s,c,d,q,explanation,hint), type: 'code_comparison', a, b, answer });
const sms = (id: string, l: string, s: string, c: string, d: Diff, q: string, options: string[], answers: number[], explanation: string, hint: string): QuizQuestion => ({ ...sq(id,l,s,c,d,q,explanation,hint), type: 'multi_select', options, answers });

/** 76 regular questions: 16 easy, 38 medium, 22 hard (about 20/50/30). */
export const WORLD_3_QUIZ: QuizQuestion[] = [
  // if — 2 easy, 4 medium, 2 hard.
  tf('w3q-if-1',L.if,T.if,'True condition runs','easy','An if block runs when its condition is true.',true,'A true condition enters the if block.','Check whether the condition is true or false.'),
  sc('w3q-if-2',L.if,T.if,'Boolean condition','easy','Which value can be used directly as an if condition?',['"yes"','42','true','null'],2,'An if condition must evaluate to a Boolean: true or false.','Choose the Boolean value.'),
  po('w3q-if-3',L.if,T.if,'True branch','medium','What does this code print?',['fun main() {','  val age = 20','  if (age >= 18) println("Adult")','}'],['Adult','Nothing','true','Error'],0,'20 >= 18 is true, so the statement runs.','Evaluate the comparison first.'),
  po('w3q-if-4',L.if,T.if,'False skips block','medium','What does this code print?',['fun main() {','  if (3 > 5) println("A")','  println("Done")','}'],['A','Done','A\nDone','Nothing'],1,'3 > 5 is false, so the if body is skipped; execution continues to Done.','A false condition does not stop the program.'),
  fb('w3q-if-5',L.if,T.if,'Condition uses Boolean comparison','medium','Complete the comparison so it is true when score is at least 60.',['fun main() {','  val score = 60','  val passes = score ___ 60','  println(passes)','}'],['<','>','>=','!='],'>=','At least 60 includes exactly 60, so >= is correct.','Include the boundary value.'),
  sc('w3q-if-6',L.if,T.if,'Statement after if continues','medium','If an if condition is false, what happens to the next statement after its block?',['It never runs','It runs normally','The program restarts','It becomes an else branch'],1,'A false condition skips only its own block; execution continues afterward.','The if does not terminate the program.'),
  fe('w3q-if-7',L.if,T.if,'Boolean condition required','hard','This code should print Ready only when score is at least 50. Tap the line that fails to compile.',['fun main() {','  val score = 70','  if (score) println("Ready")','}'],2,'score is an Int, but if requires a Boolean condition. Use score >= 50.','The condition must evaluate to true or false.','An Int cannot be used as a Boolean condition.'),
  po('w3q-if-8',L.if,T.if,'Combined condition application','hard','What does this code print?',['fun main() {','  val age = 20','  val hasTicket = false','  if (age >= 18 && hasTicket) println("Enter")','  println("Checked")','}'],['Enter','Checked','Enter\nChecked','Nothing'],1,'The age check is true but hasTicket is false, so AND is false. Only Checked prints.','Both sides of && must be true.'),

  // if-else — 2 easy, 4 medium, 2 hard.
  tf('w3q-ifelse-1',L.ifElse,T.ifElse,'Else handles false','easy','In an if/else, else runs when the if condition is false.',true,'The else branch is the alternative when the if condition fails.','Think of else as the other path.'),
  sc('w3q-ifelse-2',L.ifElse,T.ifElse,'Two-way branch','easy','How many branches are selected by one if/else execution?',['Neither','Exactly one','Both','It depends on print()'],1,'Exactly one branch runs: the if branch or the else branch.','The condition chooses one path.'),
  po('w3q-ifelse-3',L.ifElse,T.ifElse,'Else path','medium','What does this code print?',['fun main() {','  val stock = 0','  if (stock > 0) {','    println("Available")','  } else {','    println("Sold out")','  }','}'],['Available','Sold out','Nothing','Error'],1,'stock > 0 is false, so the else statement prints Sold out.','Evaluate 0 > 0.'),
  po('w3q-ifelse-4',L.ifElse,T.ifElse,'If/else expression value','medium','What does this code print?',['fun main() {','  val age = 17','  val group = if (age >= 18) "adult" else "minor"','  println(group)','}'],['adult','minor','17','Error'],1,'The condition is false, so the if expression produces "minor".','Follow the selected branch’s value into group.'),
  sc('w3q-ifelse-5',L.ifElse,T.ifElse,'Complete else branch','medium','Which keyword introduces the alternative branch when an if condition is false?',['when','else','then','otherwise'],1,'Kotlin uses else for the alternative branch.','Use the keyword paired with if.'),
  cc('w3q-ifelse-6',L.ifElse,T.ifElse,'Equivalent conditional values','medium','Which expression assigns "even" when n is divisible by 2 and "odd" otherwise?',['val label = if (n % 2 == 0) "even" else "odd"'],['val label = if (n % 2 == 0) "even"'],0,'The if expression needs both possible values, so the first option handles both outcomes.','Check that both true and false have a value.'),
  fe('w3q-ifelse-7',L.ifElse,T.ifElse,'Expression needs both values','hard','This should assign a label for either outcome. Tap the line with the compile error.',['fun main() {','  val passed = true','  val label = if (passed) "Pass"','  println(label)','}'],2,'An if used as an expression needs a value for both outcomes; add else.','Is every possible path assigning label?','The if expression is missing its else value.'),
  po('w3q-ifelse-8',L.ifElse,T.ifElse,'Branch value and output','hard','What does this code print?',['fun main() {','  val n = 4','  val result = if (n > 5) n * 2 else n + 3','  println(result)','}'],['8','7','4','Nothing'],1,'4 > 5 is false, so the else expression computes 4 + 3 = 7.','Choose the false branch, then calculate it.',undefined,2),

  // else-if — 2 easy, 4 medium, 2 hard.
  tf('w3q-elseif-1',L.elseIf,T.elseIf,'First matching branch','easy','In an else-if chain, later branches are checked after an earlier condition matches.',false,'Once a branch matches, the rest of the chain is skipped.','Only the first matching branch runs.'),
  sc('w3q-elseif-2',L.elseIf,T.elseIf,'Branch ordering','easy','Which branch runs first in an else-if chain?',['The last true branch','The first true branch','Every true branch','The else branch always'],1,'Conditions are checked top to bottom; the first true branch wins.','Read the chain from its first condition.'),
  po('w3q-elseif-3',L.elseIf,T.elseIf,'First match wins','medium','What does this code print?',['fun main() {','  val score = 85','  if (score >= 60) println("Pass")','  else if (score >= 80) println("Merit")','  else println("Fail")','}'],['Pass','Merit','Fail','Pass\nMerit'],0,'The first condition is already true, so later branches are not checked.','Evaluate from top to bottom.'),
  po('w3q-elseif-4',L.elseIf,T.elseIf,'Ordered grade bands','medium','What does this code print?',['fun main() {','  val score = 85','  if (score >= 90) println("A")','  else if (score >= 80) println("B")','  else println("C")','}'],['A','B','C','Nothing'],1,'85 is below 90 but at least 80, so the second branch runs.','Check each condition in order.'),
  sc('w3q-elseif-5',L.elseIf,T.elseIf,'Else-if syntax','medium','Which syntax checks another condition only when the preceding if condition is false?',['else','else if','if else','when'],1,'An else-if condition follows the preceding if/else-if branch.','Use the two-word branch keyword.'),
  po('w3q-elseif-6',L.elseIf,T.elseIf,'Else catch-all','medium','What prints when score is 40?',['fun main() {','  val score = 40','  if (score >= 90) println("A")','  else if (score >= 60) println("Pass")','  else println("Retry")','}'],['A','Pass','Retry','Nothing'],2,'Neither comparison is true, so the final else runs.','Both thresholds are above 40.'),
  po('w3q-elseif-7',L.elseIf,T.elseIf,'Incorrect branch order trap','hard','What does this code print for score 95?',['fun main() {','  val score = 95','  if (score >= 60) println("Pass")','  else if (score >= 90) println("A")','}'],['A','Pass','Nothing','Error'],1,'The broad >= 60 condition matches first, so the later >= 90 branch is unreachable for 95.','The first matching condition wins.'),
  cc('w3q-elseif-8',L.elseIf,T.elseIf,'Specific condition before broad condition','hard','Which ordering correctly labels scores 90+ as A and other passing scores as Pass?',['if (score >= 90) {','  "A"','} else if (score >= 60) {','  "Pass"','} else {','  "Fail"','}'],['if (score >= 60) {','  "Pass"','} else if (score >= 90) {','  "A"','} else {','  "Fail"','}'],0,'The specific high-score check must come before the broader passing threshold.','Could the first branch capture values meant for the next one?'),

  // when — 2 easy, 4 medium, 2 hard.
  tf('w3q-when-1',L.when,T.when,'When subject matching','easy','A when branch can list multiple matching values separated by commas.',true,'Comma-separated entries share one branch body.','One branch can match any listed value.'),
  sc('w3q-when-2',L.when,T.when,'When fallback','easy','Which branch handles a subject that matches none of the listed values?',['default','otherwise','else','finally'],2,'The else branch is the catch-all in a when statement.','Choose Kotlin’s fallback keyword.'),
  po('w3q-when-3',L.when,T.when,'Subject value match','medium','What does this code print?',['fun main() {','  val day = 2','  when (day) {','    1 -> println("Mon")','    2 -> println("Tue")','    else -> println("Other")','  }','}'],['Mon','Tue','Other','Nothing'],1,'The subject day is 2, so the second branch matches.','Match the subject to a branch value.'),
  po('w3q-when-4',L.when,T.when,'Comma-separated values','medium','What does this code print?',['fun main() {','  val code = 404','  when (code) {','    200, 201 -> println("OK")','    404, 410 -> println("Missing")','    else -> println("Other")','  }','}'],['OK','Missing','Other','Error'],1,'404 matches one of the comma-separated values in the second branch.','Check every value listed in a branch.'),
  sc('w3q-when-5',L.when,T.when,'When syntax arrow','medium','Which symbol separates a when branch condition from its result?',['=>','->',':=','=='],1,'Kotlin separates a when branch condition and result with ->.','The branch marker looks like a short arrow.'),
  po('w3q-when-6',L.when,T.when,'Else fallback','medium','What prints when mode is "quiet"?',['fun main() {','  val mode = "quiet"','  when (mode) {','    "fast" -> println("Quick")','    "safe" -> println("Careful")','    else -> println("Normal")','  }','}'],['Quick','Careful','Normal','Nothing'],2,'Neither listed value matches quiet, so else runs.','Use the fallback branch.'),
  po('w3q-when-7',L.when,T.when,'First matching branch','hard','What does this code print?',['fun main() {','  val n = 2','  when (n) {','    1, 2 -> println("Small")','    2 -> println("Two")','    else -> println("Other")','  }','}'],['Small','Two','Other','Error'],0,'The first branch already matches 2; later branches are not considered.','Check branch order when values overlap.'),
  cc('w3q-when-8',L.when,T.when,'When as clear alternatives','hard','Which when matches both 0 and 1 to the same result?',['when (n) { 0, 1 -> "low"; else -> "other" }'],['when (n) { 0 -> "low"; 1 -> "other"; else -> "other" }'],0,'Comma-separated values share a single branch and result.','Look for both values on one branch.'),

  // when with ranges — 2 easy, 4 medium, 2 hard.
  tf('w3q-ranges-1',L.ranges,T.ranges,'Inclusive range endpoints','easy','The range 60..69 includes both 60 and 69.',true,'Kotlin ranges include their lower and upper endpoints.','Test each endpoint.'),
  sc('w3q-ranges-2',L.ranges,T.ranges,'Range membership syntax','easy','Which operator checks whether score is within 70 through 79?',['score = 70..79','score in 70..79','score == 70..79','score has 70..79'],1,'in checks membership in a range.','Use the membership operator.'),
  po('w3q-ranges-3',L.ranges,T.ranges,'Upper endpoint included','medium','What does this code print?',['fun main() {','  val score = 90','  when (score) {','    in 90..100 -> println("A")','    in 80..89 -> println("B")','    else -> println("Other")','  }','}'],['A','B','Other','Nothing'],0,'90 is included in 90..100.','Ranges include the first number.'),
  po('w3q-ranges-4',L.ranges,T.ranges,'Range gap','medium','What prints for score 80?',['fun main() {','  val score = 80','  when (score) {','    in 90..100 -> println("A")','    in 81..89 -> println("B")','    else -> println("Other")','  }','}'],['A','B','Other','Error'],2,'80 is not in either range, so else runs.','Check whether the lower range includes 80.'),
  sc('w3q-ranges-5',L.ranges,T.ranges,'Range branch operator','medium','Which operator matches scores from 60 through 69 in a when branch?',['is','in','of','=='],1,'Use in before an inclusive range in when.','Use the membership operator before the range.'),
  po('w3q-ranges-6',L.ranges,T.ranges,'Not-in range','medium','What prints for score 85?',['fun main() {','  val score = 85','  when (score) {','    !in 60..79 -> println("Outside")','    else -> println("Inside")','  }','}'],['Outside','Inside','85','Nothing'],0,'85 is not in 60..79, so !in is true.','!in means outside the range.'),
  po('w3q-ranges-7',L.ranges,T.ranges,'Boundary ordering','hard','What does this code print for score 90?',['fun main() {','  val score = 90','  when (score) {','    in 80..100 -> println("B")','    in 90..100 -> println("A")','    else -> println("F")','  }','}'],['A','B','F','Nothing'],1,'The first, wider range matches 90, so the later A range is never checked.','when branches are tested from top to bottom.'),
  cc('w3q-ranges-8',L.ranges,T.ranges,'Correct range partition','hard','Which grade ranges assign 90 to A and 89 to B?',['when (score) { in 90..100 -> "A"; in 80..89 -> "B"; else -> "F" }'],['when (score) { in 80..100 -> "B"; in 90..100 -> "A"; else -> "F" }'],0,'The non-overlapping ranges put the specific A band first and include the intended boundaries.','Avoid a broad earlier range that captures 90.'),

  // when as an expression — 2 easy, 4 medium, 2 hard.
  tf('w3q-expression-1',L.expression,T.expression,'Expression produces a value','easy','A when expression can assign one of its branch results to a val.',true,'The selected branch value becomes the value of the whole when expression.','Think of the result as a value.'),
  sc('w3q-expression-2',L.expression,T.expression,'Expression exhaustiveness','easy','What branch is required so a when expression covers other values?',['default','else','break','return'],1,'An else branch handles every value not matched by earlier branches.','The expression must cover every possible case.'),
  po('w3q-expression-3',L.expression,T.expression,'Assign branch result','medium','What does this code print?',['fun main() {','  val n = 2','  val label = when (n) {','    1 -> "One"','    2 -> "Two"','    else -> "Other"','  }','  println(label)','}'],['One','Two','Other','2'],1,'The matching branch produces Two, which is assigned to label.','Follow the selected branch value.'),
  po('w3q-expression-4',L.expression,T.expression,'When range expression','medium','What does this code print?',['fun main() {','  val score = 75','  val grade = when (score) {','    in 90..100 -> "A"','    in 70..89 -> "C"','    else -> "F"','  }','  println(grade)','}'],['A','C','F','75'],1,'75 is in 70..89, so the expression returns C.','Find the matching range.'),
  sc('w3q-expression-5',L.expression,T.expression,'Complete exhaustive expression','medium','Which branch handles values not listed in an Int when expression?',['default','else','otherwise','null'],1,'A when expression over an Int needs else to handle unlisted values.','Use Kotlin’s catch-all branch.'),
  po('w3q-expression-6',L.expression,T.expression,'Printed variable vs source','medium','What does this code print?',['fun main() {','  val score = 72','  val grade = when (score) {','    in 70..79 -> "C"','    else -> "F"','  }','  println(grade)','}'],['72','C','F','Nothing'],1,'The program prints grade, which receives C from the matching branch.','Track which variable is passed to println.'),
  fe('w3q-expression-7',L.expression,T.expression,'Missing else in expression','hard','This should compute a label for any Int. Tap the line that causes a compile error.',['fun main() {','  val code = 500','  val label = when (code) {','    200 -> "OK"','  }','  println(label)','}'],3,'A when expression on Int is not exhaustive without an else branch.','Could code have another value?','The when expression does not return a value for every Int.'),
  po('w3q-expression-8',L.expression,T.expression,'Expression and inclusive boundary','hard','What does this code print for score 90?',['fun main() {','  val score = 90','  val grade = when (score) {','    in 90..100 -> "A"','    in 80..89 -> "B"','    else -> "F"','  }','  println(grade)','}'],['A','B','F','90'],0,'90 is included in 90..100, so the expression returns A.','Check the range endpoints.'),

  // Combined conditions — 2 easy, 4 medium, 2 hard in each lesson.
  tf('w3q-nested-1',L.nested,T.nested,'AND requires both','easy','A condition using && is true only when both operands are true.',true,'Logical AND requires both conditions to be true.','One false side makes the result false.'),
  sc('w3q-nested-2',L.nested,T.nested,'Nested checks','easy','In nested if statements, when is the inner if reached?',['Always','Only after the outer if runs','Only when the outer if is false','Never'],1,'The inner if is inside the outer block, so it is reached only when the outer condition is true.','Follow the nesting.'),
  po('w3q-nested-3',L.nested,T.nested,'AND combined rule','medium','What prints?',['fun main() {','  val score = 80','  val submitted = true','  if (score >= 60 && submitted) {','    println("Pass")','  } else {','    println("Retry")','  }','}'],['Pass','Retry','Pass\nRetry','Nothing'],0,'Both score >= 60 and submitted are true.','Evaluate both sides of &&.'),
  po('w3q-nested-4',L.nested,T.nested,'Nested dependent conditions','medium','What does this code print?',['fun main() {','  val loggedIn = true','  val isAdmin = false','  if (loggedIn) {','    if (isAdmin) {','      println("Admin")','    } else {','      println("Member")','    }','  }','}'],['Admin','Member','Nothing','Error'],1,'The outer check passes; the inner check is false, so Member prints.','Evaluate outer, then inner.'),
  sc('w3q-nested-5',L.nested,T.nested,'OR alternative rule','medium','Which operator allows either a member or a guest to enter?',['&&','||','!!','!='],1,'OR is true when either condition is true.','The rule says either one is enough.'),
  po('w3q-nested-6',L.nested,T.nested,'Nested block skipped','medium','What does this code print?',['fun main() {','  val hasAccount = false','  if (hasAccount) {','    if (true) println("Welcome")','  }','  println("Done")','}'],['Welcome','Done','Welcome\nDone','Nothing'],1,'The outer condition is false, so the entire nested block is skipped.','An inner true condition cannot run if its outer block is skipped.'),
  po('w3q-nested-7',L.nested,T.nested,'OR precedence and grouping','hard','What does this code print?',['fun main() {','  val score = 50','  val vip = true','  println(score >= 60 && vip || vip)','}'],['false','true','50','Error'],1,'&& is evaluated before ||: false && true || true becomes true.','Apply && before ||, unless parentheses change it.'),
  cc('w3q-nested-8',L.nested,T.nested,'Combined vs dependent checks','hard','A user must be logged in and be either admin or editor. Which condition states that rule?',['loggedIn && (isAdmin || isEditor)'],['loggedIn && isAdmin || isEditor'],0,'Parentheses require login and then either role; without them an editor could pass without being logged in.','Group the alternatives required after login.'),

  tf('w3q-types-1',L.types,T.types,'is checks runtime type','easy','The is operator checks whether a value has a particular runtime type.',true,'is performs a type check.','It asks whether the value is of a type.'),
  sc('w3q-types-2',L.types,T.types,'Negated type check','easy','Which operator checks that a value is not a String?',['not','!is','!==','is not'],1,'!is is Kotlin’s negated type check.','Place ! before is.'),
  po('w3q-types-3',L.types,T.types,'Any type check','medium','What does this code print?',['fun main() {','  val item: Any = "Kotlin"','  println(item is String)','}'],['true','false','Kotlin','Error'],0,'The value stored in item is a String, so the type check is true.','Check the value assigned to item.'),
  po('w3q-types-4',L.types,T.types,'Negated type check','medium','What does this code print?',['fun main() {','  val item: Any = 42','  println(item !is String)','}'],['true','false','42','Error'],0,'42 is not a String, so item !is String is true.','!is means the type check does not match.'),
  fb('w3q-types-5',L.types,T.types,'is operator syntax','medium','Complete the condition to check whether item contains an Int.',['val isNumber = item ___ Int'],['as','in','is','=='],'is','Use is to test a runtime type.','This is a type test, not a cast.'),
  po('w3q-types-6',L.types,T.types,'Type check in condition','medium','What does this code print?',['fun main() {','  val item: Any = 7','  if (item is String) {','    println("Text")','  } else {','    println("Not text")','  }','}'],['Text','Not text','7','Error'],1,'item contains an Int, so the String check is false and else runs.','Compare the stored value’s type with String.'),
  cc('w3q-types-7',L.types,T.types,'Safe branch for expected type','hard','Which condition enters the branch only when item is a String?',['if (item is String) println("Text")'],['if (item == String) println("Text")'],0,'is checks the runtime type; == would compare values and cannot compare an Any value to the String type.','Use a type-check operator.'),
  po('w3q-types-8',L.types,T.types,'Combined type and value checks','hard','What does this code print?',['fun main() {','  val item: Any = "Kotlin"','  if (item is String && item.length > 3) {','    println("Long text")','  } else {','    println("Other")','  }','}'],['Long text','Other','Kotlin','Error'],0,'item is a String and its length is 6, so both conditions are true.','Check the type, then the length condition.'),

  // Cross-lesson set questions: two medium and two hard in each set.
  spo('w3q-set-br-1',L.elseIf,SET.branch,'Truth selects the first branch','medium','What does this chain print?',['fun main() {','  val score = 95','  if (score >= 90) println("A")','  else if (score >= 60) println("Pass")','  else println("Fail")','}'],['A','Pass','Fail','Nothing'],0,'The first threshold matches, so later branches are skipped.','Read from the first condition down.'),
  ssc('w3q-set-br-2',L.elseIf,SET.branch,'Value-producing branch chain','medium','Which declaration compiles when `if` is used as an expression?',['val label = if (score >= 60) "Pass"','val label = if (score >= 60) "Pass" else "Fail"','val label = if (score >= 60) else "Fail"','val label = (score >= 60) "Pass" else "Fail"'],1,'When if produces a value, both outcomes must provide one, so it needs an else branch. The other forms are missing a branch or are not valid if syntax.','Both outcomes need a value.'),
  scc('w3q-set-br-3',L.elseIf,SET.branch,'Order protects specific branch','hard','Which ordering gives score 95 the label A and score 75 the label Pass?',['if (score >= 90) {','  "A"','} else if (score >= 60) {','  "Pass"','} else {','  "Fail"','}'],['if (score >= 60) {','  "Pass"','} else if (score >= 90) {','  "A"','} else {','  "Fail"','}'],0,'The more specific threshold must come before the broader passing threshold.','Check which condition would match first.'),
  spo('w3q-set-br-4',L.elseIf,SET.branch,'Separate if versus else-if chain','hard','What does this code print?',['fun main() {','  val score = 85','  if (score >= 60) println("Pass")','  if (score >= 90) println("Top") else if (score >= 80) println("Good") else println("Ok")','}'],['Pass\nGood','Pass','Good','Pass\nOk'],0,'The first if stands alone, so it prints Pass. The second if/else-if chain then picks the first true condition: 85 >= 90 is false, 85 >= 80 is true, so it prints Good.','The first if is not part of the chain.'),
  ssc('w3q-set-wh-1',L.expression,SET.when,'When expression returns matching value','medium','What value does this expression produce for n = 3?',['when (n) { 1, 2 -> "low"; 3 -> "mid"; else -> "high" }','low','mid','high'],2,'The subject 3 matches its branch, which returns mid.','Find the matching subject value.'),
  spo('w3q-set-wh-2',L.expression,SET.when,'Range endpoints and first match','medium','What does this code print?',['fun main() {','  val score = 80','  val grade = when (score) {','    in 70..80 -> "B"','    in 80..90 -> "A"','    else -> "F"','  }','  println(grade)','}'],['B','A','F','80'],0,'Both ranges contain 80, but a when evaluates branches top to bottom and selects the first match, so grade is B.','Check order as well as membership.'),
  scc('w3q-set-wh-3',L.expression,SET.when,'Exhaustive value assignment','hard','Which expression safely assigns a result for every Int score?',['when (score) { in 90..100 -> "A"; else -> "Other" }'],['when (score) { in 90..100 -> "A" }'],0,'The else branch ensures every possible Int produces a value.','An Int has values outside the listed range.'),
  spo('w3q-set-wh-4',L.expression,SET.when,'Inclusive grade bands','hard','What grade is assigned to score 80?',['fun main() {','  val score = 80','  val grade = when (score) {','    in 90..100 -> "A"','    in 80..89 -> "B"','    else -> "F"','  }','  println(grade)','}'],['A','B','F','80'],1,'80 is the inclusive lower endpoint of 80..89.','Check the lower boundary.'),
  spo('w3q-set-co-1',L.types,SET.conditions,'Type check gates string operation','medium','What does this print?',['fun main() {','  val value: Any = "Code"','  if (value is String && value.length > 3) {','    println("Long")','  } else {','    println("Other")','  }','}'],['Long','Other','Code','Error'],0,'value passes the String check and its length is 4, so both conditions pass.','Evaluate the type check and length test.'),
  spo('w3q-set-co-2',L.types,SET.conditions,'Nested condition depends on outer check','medium','What does this code print?',['fun main() {','  val age = 15','  val hasId = true','  if (age >= 18) {','    if (hasId) println("Enter")','    println("Welcome")','  }','  println("Done")','}'],['Done','Enter\nWelcome\nDone','Welcome\nDone','Enter\nDone'],0,'age >= 18 is false, so the whole outer block is skipped, including the nested if. Only the final println runs.','The nested statements are inside the outer block.'),
  scc('w3q-set-co-3',L.types,SET.conditions,'Eligibility requires grouped alternatives','hard','A user must be logged in and have either an active pass or a staff role. Which condition expresses this?',['loggedIn && (hasPass || isStaff)'],['loggedIn && hasPass || isStaff'],0,'Parentheses make login mandatory while allowing either qualification.','Group alternatives before combining with the required condition.'),
  sms('w3q-set-co-4',L.types,SET.conditions,'Type and decision combined','hard','Select every true statement when item: Any = 12.',['item is Int','item !is String','item is String','item !is Int'],[0,1],'The value is an Int, so it is Int and not String, but it is not String and not !is Int.','Evaluate the stored value’s actual type.'),
];

const program = (body: string[]) => ['fun main() {', ...body.map(line => `  ${line}`), '}'];
const withCode = (q: QuizQuestion, code: string[]): QuizQuestion => formatQuizCodeQuestion({ ...q, code } as QuizQuestion);
const bossBase = (n: number) => `w3q-boss-${n}`;

/**
 * Boss quiz: one Grade & Eligibility System story. 12 questions, 1 easy / 5 medium / 6 hard (10/40/50), ordered easy to hard.
 * Every question combines at least two World 3 lessons (with World 1 and 2 basics such as templates, comparisons and var).
 */
export const WORLD_3_BOSS_QUIZ: QuizQuestion[] = [
  sc(bossBase(1), L.boss, T.boss, 'if-else expression with a boundary', 'easy',
    'A student passes with 60 or more. Which line stores "Pass" or "Fail" in label?',
    ['val label = if (score >= 60) "Pass" else "Fail"', 'val label = if (score > 60) "Pass" else "Fail"', 'val label = if (score >= 60) "Pass"', 'val label = if (score >= 60) else "Fail"'], 0,
    'An if used as a value needs both branches, and "60 or more" means >= so that exactly 60 passes. > would fail a score of 60, and the other two lines are missing a value.',
    'Check the boundary and that both outcomes have a value.'),
  fb(bossBase(2), L.boss, T.boss, 'if-else with a combined condition', 'medium',
    'A submission is accepted only when the score is at least 60 and it was submitted. Complete the condition so the program prints Rejected.',
    program(['val score = 72', 'val submitted = false', 'if (score >= 60 ___ submitted) {', '  println("Accepted")', '} else {', '  println("Rejected")', '}']),
    ['&&', '||', '!is', 'in'], '&&',
    '&& needs both sides to be true. submitted is false, so the condition is false and the else branch prints Rejected. With || the score alone would make it Accepted.',
    'Which operator needs both sides to be true?'),
  po(bossBase(3), L.boss, T.boss, 'when range expression with arithmetic and a template', 'medium', 'What does this program print?',
    program(['val score = 86', 'val bonus = 5', 'val total = score + bonus', 'val grade = when (total) {', '  in 90..100 -> "A"', '  in 80..89 -> "B"', '  else -> "C"', '}', 'println("$total $grade")']),
    ['91 A', '86 B', '91 B', '91 C'], 0,
    'The bonus is added first, so total is 91, which is inside 90..100. The template prints the total and then the grade: 91 A.',
    'Add the bonus before choosing a range.'),
  po(bossBase(4), L.boss, T.boss, 'else-if chain with && in a later branch', 'medium', 'What does this program print?',
    program(['val age = 16', 'val hasPermission = true', 'if (age >= 18) {', '  println("Adult entry")', '} else if (age >= 14 && hasPermission) {', '  println("Teen entry")', '} else {', '  println("No entry")', '}']),
    ['Teen entry', 'Adult entry', 'No entry', 'Teen entry\nNo entry'], 0,
    '16 >= 18 is false, so the chain moves on. 16 >= 14 and hasPermission are both true, so Teen entry prints and the else is skipped.',
    'Check the first condition, then the second one with both parts.'),
  sc(bossBase(5), L.boss, T.boss, 'else-if as a value with a combined first condition', 'medium', 'What value does result hold?',
    ['Pass', 'Honors', 'Fail', 'Pass and Fail'], 0,
    'The first condition needs score >= 80 AND attendance >= 75. Attendance is 70, so it is false. 85 >= 60 is true, so result is Pass.',
    'Test the && condition as a whole before moving to the next branch.',
    program(['val score = 85', 'val attendance = 70', 'val result = if (score >= 80 && attendance >= 75) {', '  "Honors"', '} else if (score >= 60) {', '  "Pass"', '} else {', '  "Fail"', '}'])),
  cc(bossBase(6), L.boss, T.boss, 'Grouping alternatives in a rule', 'medium',
    'Staff always get in. Students need to be 18 or older and have an ID. Which condition states this rule?',
    ['isStaff || (age >= 18 && hasId)'], ['(isStaff || age >= 18) && hasId'], 0,
    'The first condition lets any staff member in, and otherwise requires both the age and the ID. The second one demands an ID even from staff, so a staff member without an ID is refused.',
    'Does a staff member without an ID get in under each version?'),
  fe(bossBase(7), L.boss, T.boss, 'if expression result type', 'hard', 'Tap the line that does not compile.',
    program(['val score = 72', 'val label: String = if (score >= 60) "Pass" else 0', 'println(label)']), 2,
    'label is declared as a String, but the else branch gives the Int 0. Both branches of an if expression must produce a value of the declared type, so use "Fail".',
    'Compare the type of each branch with the declared type.',
    'The else branch is an Int, not a String.'),
  po(bossBase(8), L.boss, T.boss, 'if expression feeding a when range', 'hard', 'What does this program print?',
    program(['val raw = 92', 'val late = true', 'val score = if (late) raw - 5 else raw', 'val grade = when (score) {', '  in 90..100 -> "A"', '  in 80..89 -> "B"', '  else -> "C"', '}', 'println("$score $grade")']),
    ['87 B', '92 A', '87 A', '92 B'], 0,
    'The submission is late, so score is 92 - 5 = 87. 87 is inside 80..89, so the grade is B. The raw score no longer decides the grade.',
    'Work out score first, then find its range.'),
  ms(bossBase(9), L.boss, T.boss, 'ranges, !in, is and combined conditions', 'hard',
    'Given score = 60, age = 17, hasId = true and item: Any = 60, select every true expression. Three are true.',
    ['score in 60..100 && hasId', 'score in 60..100 && age >= 18', 'item is Int && item >= 60', 'score !in 61..100 && age < 18'], [0, 2, 3],
    '60 is inside 60..100 and hasId is true, so the first is true. The second fails because 17 >= 18 is false. item holds an Int, so the type check and then the comparison are both true. 60 is not in 61..100 and 17 < 18, so the last is true.',
    'Evaluate each side separately, including the range boundaries.'),
  fe(bossBase(10), L.boss, T.boss, 'is check order inside &&', 'hard', 'Tap the line that does not compile.',
    program(['val input: Any = 120', 'val limit = 100', 'if (input > limit && input is Int) {', '  println("Over limit")', '}']), 3,
    'The comparison is checked before the type check, so input is still an Any and cannot be compared with an Int. Write input is Int && input > limit so the type is known first.',
    'What does the compiler know about input at the moment of the comparison?',
    'input is not known to be an Int yet.'),
  withCode(ms(bossBase(11), L.boss, T.boss, 'overlapping ranges, first match and else', 'hard',
    'For this when expression, select every true statement. Two are true.',
    ['An age of 12 gives Child, because the first matching branch wins', 'An age of 17 gives Adult', 'An age of -1 gives Child', 'An age of 65 gives Senior, because else handles it'], [0, 3],
    '12 is in both 0..12 and 12..17, and the first branch wins, so it is Child. 17 is in 12..17, so it is Teen, not Adult. -1 is in no range, so else gives Senior. 65 is above 64, so else gives Senior.',
    'Check the overlap at 12, then the ages no range contains.'),
    ['val label = when (age) {', '  in 0..12 -> "Child"', '  in 12..17 -> "Teen"', '  in 18..64 -> "Adult"', '  else -> "Senior"', '}']),
  po(bossBase(12), L.boss, T.boss, 'Grade, eligibility, exemption and type check together', 'hard', 'What does this program print?',
    program(['val score = 59', 'val attendance = 95', 'val exempt: Any = "yes"', 'val grade = when (score) {', '  in 90..100 -> "A"', '  in 60..89 -> "Pass"', '  else -> "Retry"', '}', 'var eligible = false', 'if (grade != "Retry") {', '  eligible = attendance >= 80', '} else if (exempt is String && exempt.length >= 3) {', '  eligible = true', '}', 'println("$grade $eligible")']),
    ['Retry true', 'Retry false', 'Pass true', 'Pass false'], 0,
    '59 is just below 60, so the grade is Retry and the first branch of the chain is skipped. exempt is a String of length 3, so the else-if sets eligible to true. The program prints Retry true.',
    'Find the grade first, then see which branch of the chain runs.'),
];
