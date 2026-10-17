import { emphasizeQuizPrompt, formatQuizCodeQuestion, QuizQuestion } from '../../utils/quizQuestions';

const W = 'world-7';
const lessons = [
  ['world-7-nullable-types', 'Nullable Types', 'String?', 'Which type can hold a String or null?', 'String? can hold text or null.', ['String', 'Char', 'Boolean'], ['val label: String? = null', 'println(label)', 'null', 'Error', 'empty String', 'null is not the same as empty text.']],
  ['world-7-nullable-variables', 'Nullable Variables', 'var and String?', 'Which declaration can be reassigned from null to text?', 'var allows reassignment and String? allows null.', ['val label: String? = null', 'var label: String = ""', 'val label: String = "A"'], ['var label: String? = null', 'label = "Ready"', 'Ready', 'null', 'Error', 'A nullable val still cannot be reassigned.']],
  ['world-7-safe-call', 'Safe Call', '?.', 'Which operator skips access when its receiver is null?', 'The safe-call operator is ?.', ['!!', '?:', 'as?'], ['val name: String? = null', 'println(name?.length)', 'null', '0', 'Error', 'A null receiver makes the safe-call result null.']],
  ['world-7-elvis-operator', 'Elvis Operator', '?:', 'Which operator uses a fallback only when the left side is null?', 'The Elvis operator chooses its right side only for null.', ['?.', '!!', 'as?'], ['val name: String? = null', 'println(name ?: "Guest")', 'Guest', 'null', 'name', 'When name is null, Elvis selects Guest.']],
  ['world-7-non-null-assertion', 'Non-null Assertion', '!!', 'Which operator asserts that a nullable value is not null?', '!! asserts non-null, but can throw at runtime.', ['?.', '?:', 'as?'], ['val name: String? = "Mia"', 'println(name!!.length)', '3', 'null', 'Error', 'The value is present, so the assertion succeeds.']],
  ['world-7-null-checks', 'Null Checks', '== null', 'Which condition checks whether value is null?', 'Equality with null checks for null.', ['!= null', '?:', '!!'], ['val name: String? = null', 'if (name == null) println("Missing") else println(name)', 'Missing', 'null', 'Error', 'The first branch runs because name is null.']],
  ['world-7-smart-casts', 'Smart Casts', '!= null', 'What can Kotlin know inside a value != null branch?', 'Kotlin can treat a stable checked value as non-null in that branch.', ['It is empty', 'It changed to null', 'It can be reassigned'], ['val text: String? = "Hi"', 'if (text != null) println(text.length)', '2', 'null', '0', 'The check proves text is present in the branch.']],
  ['world-7-safe-casts-as', 'Safe Casts', 'as?', 'Which operator returns null when a cast does not match?', 'The safe-cast operator is as?.', ['as', '!!', '?.'], ['val value: Any = 7', 'println(value as? String)', 'null', '7', 'Error', 'An Int cannot be converted to String by this cast.']],
  ['world-7-nullable-collections-and-collection-valu', 'Nullable Collections', 'List<String?>', 'Which type allows a list element to be null?', 'The question mark on String makes the elements nullable.', ['List<String>?', 'String?', 'List<String>'], ['val names: List<String?> = listOf(null, "Ari")', 'println(names[0])', 'null', 'Ari', 'Error', 'The first element is null.']],
  ['world-7-chaining-nullable-operations', 'Chaining Nullable Operations', '?. and ?:','What happens when an early safe call in a chain returns null?', 'Later safe calls are skipped, and the chain result is null.', ['The program always throws', 'The result becomes zero', 'The chain restarts'], ['val name: String? = null', 'println(name?.length?.toString() ?: "None")', 'None', 'null', 'Error', 'The chain yields null and the final fallback is used.']],
] as const;

const SETS = [
  ['w7-set-nullable-foundations','Nullable Foundations','world-7-nullable-variables',['world-7-nullable-types','world-7-nullable-variables']],
  ['w7-set-safe-access-fallbacks','Safe Access & Fallbacks','world-7-elvis-operator',['world-7-safe-call','world-7-elvis-operator']],
  ['w7-set-assertions-null-checks','Assertions & Null Checks','world-7-null-checks',['world-7-non-null-assertion','world-7-null-checks']],
  ['w7-set-smart-safe-casts','Smart Casts & Safe Casts','world-7-safe-casts-as',['world-7-smart-casts','world-7-safe-casts-as']],
  ['w7-set-collections-chains','Nullable Collections & Chains','world-7-chaining-nullable-operations',['world-7-nullable-collections-and-collection-valu','world-7-chaining-nullable-operations']],
] as const;
const xp = { easy: 10, medium: 15, hard: 20 } as const;
let optionCursor = 0;
const choose = (right: string, wrong: readonly string[]) => {
  const options = [...new Set(wrong)].filter((option) => option !== right);
  const fallback = ['null', '0', '""', 'Error', 'false', '"Guest"'];
  for (const option of fallback) if (options.length < 3 && option !== right && !options.includes(option)) options.push(option);
  options.length = 3;
  const answer = optionCursor++ % 4; options.splice(answer, 0, right); return { options, answer };
};
const make = (id: string, lessonId: string, topic: string, concept: string, difficulty: 'easy'|'medium'|'hard', question: string, explanation: string, hint: string, type: string, data: Record<string, unknown>, setId?: string): QuizQuestion => formatQuizCodeQuestion({
  id, worldId: W, lessonId, topic, concept, difficulty, xp: xp[difficulty], question: emphasizeQuizPrompt(W, question), explanation, hint, type, ...data, ...(setId ? { setId } : {}),
} as QuizQuestion);
const qBase = (lessonId: string, topic: string, concept: string, difficulty: 'easy'|'medium'|'hard', prompt: string, explanation: string, hint: string) => ({ lessonId, topic, concept, difficulty, prompt, explanation, hint });
const program = (body: readonly string[]) => ['fun main() {', ...body.map(line => `  ${line}`), '}'];

const lessonQuestions: QuizQuestion[] = lessons.flatMap((row, index) => {
  const [lessonId, topic, syntax, prompt, explanation, wrong, example] = row;
  const [line1, line2, output, distractor1, distractor2, codeExplanation] = example;
  const id = `w7q-${index + 1}`;
  const mk = (n: number, diff: 'easy'|'medium'|'hard', concept: string, text: string, explain: string, hint: string, type: string, data: Record<string, unknown>) => make(`${id}-${n}`, lessonId, topic, concept, diff, text, explain, hint, type, data);
  const lessonCases = [
    { outCode:['val label: String? = null','println(label == null)'], out:'true', wrong:['false','null','Error'], explain:'label is null, so the equality check is true.' },
    { outCode:['var label: String? = null','label = "Ready"','println(label ?: "Unset")'], out:'Ready', wrong:['Unset','null','Error'], explain:'The reassigned value is non-null, so Elvis keeps Ready.' },
    { outCode:['val title: String? = null','println(title?.length ?: -1)'], out:'-1', wrong:['null','0','Error'], explain:'The safe call returns null, then Elvis supplies -1.' },
    { outCode:['val title: String? = ""','println(title?.length ?: -1)'], out:'0', wrong:['-1','null','Error'], explain:'An empty String is present and has length 0, so Elvis is not used.' },
    { outCode:['val code: String? = null','println(code ?: "Missing")'], out:'Missing', wrong:['null','0','Error'], explain:'This example uses Elvis to handle null; unlike !!, it does not assert presence.' },
    { outCode:['val name: String? = null','if (name == null) println("Missing") else println("Present")'], out:'Missing', wrong:['Present','null','Error'], explain:'name is null, so the first branch prints Missing.' },
    { outCode:['var note: String? = "Hi"','if (note != null) println(note.length)'], out:'2', wrong:['null','0','Error'], explain:'The value is stable during this check, so Kotlin can smart-cast it to String.' },
    { outCode:['val raw: Any = 4','println(raw as? String ?: "No match")'], out:'No match', wrong:['4','null','Error'], explain:'The value is an Int, so the safe cast returns null and Elvis supplies No match.' },
    { outCode:['val names: List<String?> = listOf("Eli", null)','println(names[0]?.length ?: -1)'], out:'3', wrong:['-1','null','Error'], explain:'The first element is Eli, so its safe-call length is 3.' },
    { outCode:['val name: String? = null','println(name?.uppercase() ?: "Unknown")'], out:'Unknown', wrong:['NULL','null','Error'], explain:'The first safe call returns null, so the final Elvis fallback is used.' },
  ];
  const secondCases = [
    { code:['val label: String? = null','println(label)'], out:'null', wrong:['""','0','Error'], explain:'The nullable variable is set to null, so println displays null.' },
    { code:['var label: String? = null','label = "Ready"','println(label)'], out:'Ready', wrong:['null','Unset','Error'], explain:'The var can be reassigned, and it now contains Ready.' },
    { code:['val title: String? = null','println(title?.length)'], out:'null', wrong:['0','Error','-1'], explain:'The safe call on a null receiver evaluates to null.' },
    { code:['val name: String? = null','println(name ?: "Guest")'], out:'Guest', wrong:['null','""','Error'], explain:'The left side is null, so Elvis evaluates the Guest fallback.' },
    { code:['val name: String? = "Mia"','println(name!!.length)'], out:'3', wrong:['null','0','Error'], explain:'Mia is present, so the assertion succeeds and its length is 3.' },
    { code:['val name: String? = "Ari"','if (name != null) println(name.length)'], out:'3', wrong:['Missing','null','Error'], explain:'The non-null branch runs and prints the length of Ari.' },
    { code:['val text: String? = "Kotlin"','if (text != null) println(text.length)'], out:'6', wrong:['null','0','Error'], explain:'The check smart-casts text to String, whose length is 6.' },
    { code:['val value: Any = 7','println(value as? String)'], out:'null', wrong:['7','"7"','Error'], explain:'The value is an Int, so the safe cast to String returns null.' },
    { code:['val names: List<String?> = listOf(null, "Ari")','println(names[0])'], out:'null', wrong:['Ari','0','Error'], explain:'The first element is null even though the list itself is present.' },
    { code:['val name: String? = null','println(name?.length?.toString() ?: "None")'], out:'None', wrong:['null','0','Error'], explain:'The first safe call yields null, so the rest of the chain is skipped and None is used.' },
  ][index];
  const errorCode = [
    ['val label: String = null','println(label)'],
    ['val label: String? = null','label = "Ready"','println(label)'],
    ['val title: String? = null','println(title.length)'],
    ['val title: String? = null','val shown = title ?: "Guest"','println(title.length)'],
    ['val code: String? = "OK"','val length: Int = code','println(length)'],
    ['val name: String? = null','println(name.length)'],
    ['var note: String? = "Hi"','if (note != null) {','  note = null','  println(note.length)','}'],
    ['val raw: Any = 4','val text: String = raw as? String','println(text)'],
    ['val names: List<String>? = null','println(names[0])'],
    ['val name: String? = null','val length: Int = name?.length'],
  ][index];
  // Index into the program() lines, so +1 for `fun main() {`: the line the compiler reports (checked with real kotlinc).
  const errorLine = [1, 2, 2, 3, 2, 2, 4, 2, 2, 2][index];
  const compareA = index === 0 ? ['val label: String? = null','println(label ?: "No label")']
    : index === 1 ? ['var label: String? = null','label = "Ready"','println(label)']
    : index === 2 ? ['val title: String? = null','println(title?.length)']
    : index === 3 ? ['val title: String? = null','println(title ?: "Guest")']
    : index === 4 ? ['val code: String? = null','println(code?.length ?: 0)']
    : index === 5 ? ['val name: String? = null','if (name == null) println("Missing") else println(name.length)']
    : index === 6 ? ['val note: String? = "Hi"','if (note != null) println(note.length)']
    : index === 7 ? ['val raw: Any = "Mia"','println(raw as? String)']
    : index === 8 ? ['val names: List<String?> = listOf(null)','println(names[0])']
    : ['val name: String? = null','println(name?.length ?: 0)'];
  const compareB = index === 0 ? ['val label: String? = null','println(label!!.length)']
    : index === 1 ? ['val label: String? = null','label = "Ready"','println(label)']
    : index === 2 ? ['val title: String? = null','println(title.length)']
    : index === 3 ? ['val title: String? = null','println(title!!.length)']
    : index === 4 ? ['val code: String? = null','println(code!!.length)']
    : index === 5 ? ['val name: String? = null','println(name.length)']
    : index === 6 ? ['var note: String? = "Hi"','if (note != null) {','  note = null','  println(note.length)','}']
    : index === 7 ? ['val raw: Any = 4','println(raw as String)']
    : index === 8 ? ['val names: List<String>? = null','println(names!![0])']
    : ['val name: String? = null','println(name!!.length)'];
  const choices = index === 0 ? ['String?','String','Char?','Null']
    : index === 1 ? ['var label: String?','val label: String?','var label: String','val label: String']
    : index === 2 ? ['?.','!!','?:','as?']
    : index === 3 ? ['?:','?.','!!','as?']
    : index === 4 ? ['!!','?.','?:','as?']
    : index === 5 ? ['name == null','name != null','name ?: ""','name!!']
    : index === 6 ? ['A stable val checked for null','Any mutable value after any check','A value that was assigned null','Every captured var']
    : index === 7 ? ['as?','as','!!','?.']
    : index === 8 ? ['List<String?>','List<String>?','String?','List<String>']
    : ['?. and ?:','!! only','as only','== only'];
  const lessonPrompt = index === 0 ? 'Which declaration can store either text or null?'
    : index === 1 ? 'Which declaration can start as null and later hold text?'
    : index === 2 ? 'Which operator reads a property only when its receiver is not null?'
    : index === 3 ? 'Which operator uses the right-hand value only when the left side is null?'
    : index === 4 ? 'Which operator asserts that a nullable value is present?'
    : index === 5 ? 'Which condition is true only when name is missing?'
    : index === 6 ? 'Which checked value can Kotlin smart-cast inside the branch?'
    : index === 7 ? 'Which operator returns null when the requested type does not match?'
    : index === 8 ? 'Which type allows each String element to be null?'
    : 'What does a safe-call chain return when an earlier receiver is null?';
  const factPair = [
    ['String? can hold null.','An empty String is still a non-null value.','String can hold null without a question mark.','An empty String is the same value as null.'],
    ['A var can be assigned more than once.','String? can hold null as well as text.','A val can be reassigned after initialization.','String? means the value must always be null.'],
    ['The result of a safe call can be null.','A null receiver skips the requested access.','A safe call throws when its receiver is null.','A safe call always returns a non-null value.'],
    ['Elvis keeps a non-null left value.','Elvis uses its right side when the left side is null.','Elvis always evaluates to its right side.','An empty String makes the Elvis left side null.'],
    ['!! produces a non-null value when it succeeds.','Using !! on null throws at runtime.','!! safely returns null when the value is null.','!! is only a compile-time annotation.'],
    ['The == null branch handles the missing case.','A null check does not replace or change the variable.','The != null branch handles the missing case.','Checking for null assigns an empty String.'],
    ['A stable val can be smart-cast after a successful null check.','The check proves the value is non-null on that path.','Every mutable value is smart-cast after any check.','A nullable value becomes non-null everywhere after one check.'],
    ['A failed as? cast returns null.','A successful as? cast returns the requested type.','A failed as? cast returns the original value.','as? throws when the types do not match.'],
    ['List<String?> allows null elements.','A null element still occupies a position in the list.','List<String?> means the list reference is null.','A nullable list type makes every element nullable.'],
    ['A null receiver short-circuits the rest of the safe-call chain.','A final Elvis fallback is used if the chain result is null.','Later safe calls run even after a null receiver.','Elvis is applied separately after every safe call.'],
  ][index];
  const errorExplanation = [
    'String cannot be initialized with null because its type is non-null.',
    'A val cannot be assigned again after its initialization.',
    'title is nullable, so plain property access is not allowed.',
    'Elvis makes shown non-null, but the final line reads nullable title directly.',
    'code has type String?, which cannot be assigned directly to Int.',
    'name is nullable and is accessed without a check or safe call.',
    'note is assigned null, so its length cannot be read as if it were a String.',
    'as? String returns String?, which cannot initialize a non-null String variable.',
    'names may itself be null, so it must be handled before indexing.',
    'name?.length has type Int?, which cannot be assigned to a non-null Int.',
  ][index];
  const decision = [
    { prompt:'For `val code: String? = null`, select the two true statements.', good:['code == null is true.','code == "" is false.'], bad:['code.length compiles without a null check.','null and an empty String are the same value.'], explain:'code is null, not empty text. A direct length access on a nullable String is not allowed.' },
    { prompt:'For `var label: String? = null`, select the two true statements.', good:['label can later be assigned "Ready".','label can be assigned null again.'], bad:['label can be reassigned only if it is val.','String? means the value must always be null.'], explain:'var permits reassignment, and String? accepts either null or a String.' },
    { prompt:'For `val title: String? = null`, select the two true statements.', good:['title?.length evaluates to null.','title?.length ?: 0 evaluates to 0.'], bad:['title!!.length safely returns null.','title.length compiles because title is val.'], explain:'The safe call produces null and Elvis supplies 0; !! would throw, and direct access is not allowed.' },
    { prompt:'For `val title: String? = "Sam"`, select the two true statements.', good:['title ?: "Guest" evaluates to Sam.','title ?: "Guest" does not use Guest.'], bad:['Elvis always chooses its right side.','title ?: "Guest" evaluates to null.'], explain:'Elvis uses the non-null left value and skips the fallback.' },
    { prompt:'For `val name: String? = null`, select the two true statements.', good:['name!! throws at runtime.','name!! has a non-null String type if it returns.'], bad:['name!! returns null safely.','name!!.length is a compile error solely because name is nullable.'], explain:'The assertion converts the type when it succeeds, but a null value causes a runtime exception.' },
    { prompt:'For `val name: String? = null`, select the two true statements.', good:['if (name == null) handles the missing case.','The condition does not assign a new value to name.'], bad:['if (name != null) handles the missing case.','A null check changes name to an empty String.'], explain:'The equality check selects the null branch; checking does not mutate the variable.' },
    { prompt:'For `val note: String? = "Hi"`, select the two true statements.', good:['Inside `if (note != null)`, note.length is allowed.','The check does not change note into a different value.'], bad:['Kotlin smart-casts every nullable var after any check.','note is assigned null by the condition.'], explain:'A stable val is known to be non-null in the checked branch; the condition only proves its state.' },
    { prompt:'For `val raw: Any = 4`, select the two true statements.', good:['raw as? String evaluates to null.','raw as? String does not throw for this mismatch.'], bad:['raw as? String returns the original Int.','raw as? String has type String, not String?.'], explain:'A safe cast returns null for a mismatch and its result is nullable.' },
    { prompt:'For `val names: List<String?> = listOf(null, "Ari")`, select the two true statements.', good:['names.size is 2.','names[0] is null.'], bad:['The list reference itself is null.','names[0].length is allowed without a null check.'], explain:'The list is present and has two elements; its first element is nullable.' },
    { prompt:'For `val name: String? = null`, select the two true statements.', good:['name?.uppercase()?.length evaluates to null.','name?.uppercase()?.length ?: 0 evaluates to 0.'], bad:['uppercase() runs even though name is null.','The fallback is applied after every safe call.'], explain:'The first safe call short-circuits the chain, then the single final Elvis fallback supplies 0.' },
  ][index];
  const application = [
    { prompt:'A label is present but contains no characters. Which condition checks for that empty text?', right:'label == ""', wrong:['label == null','label.isEmpty() when label is nullable','label ?: "Unknown"'] },
    { prompt:'Which keyword allows a nullable label to be assigned again after initialization?', right:'var', wrong:['val','String?','!!'] },
    { prompt:'If title is null, what is the result type of `title?.length`?', right:'Int?', wrong:['Int','String?','Nothing'] },
    { prompt:'If title contains "Sam", which value does `title ?: "Guest"` produce?', right:'Sam', wrong:['Guest','null','Error'] },
    { prompt:'What happens when `name!!` runs while name is null?', right:'It throws a runtime exception.', wrong:['It returns null.','It uses an empty String.','It causes a compile error in every case.'] },
    { prompt:'When name is null, which condition selects the missing-value branch?', right:'name == null', wrong:['name != null','name ?: ""','name!!'] },
    { prompt:'Which value can Kotlin smart-cast after a successful null check?', right:'A stable val read inside the checked branch.', wrong:['Any var, even after it changes.','A value outside the checked branch.','A value that was never checked.'] },
    { prompt:'If raw is an Int, what does `raw as? String` return?', right:'null', wrong:['The original Int.','A String containing the number.','A runtime cast exception.'] },
    { prompt:'Which type allows list items to be null while the list itself is present?', right:'List<String?>', wrong:['List<String>?','String?','List<String>'] },
    { prompt:'If name is null, what happens to `name?.uppercase()?.length`?', right:'It evaluates to null without calling uppercase().', wrong:['It throws before reaching length.','It evaluates to 0.','It calls uppercase() on the text "null".'] },
  ][index];
  const truths: ReadonlyArray<readonly [string, boolean, string]> = [
    ['A nullable `String` can contain an empty `String`, which is different from `null`.', true, 'An empty String "" is a real value with length 0. A String? can hold it or null, and the two are not the same.'],
    ['A `val` variable can be reassigned after it is initialized.', false, 'A val is assigned once. Only a var can be reassigned, even when its type is nullable.'],
    ['A safe call on a `null` receiver returns `null`.', true, 'name?.length skips the call when name is null and evaluates to null instead of throwing.'],
    ['Elvis always evaluates to its right side.', false, 'Elvis uses the right side only when the left side is null; a non-null left value is kept.'],
    ['Using `!!` on `null` throws at runtime.', true, '!! asserts that the value is not null, so a null value throws an exception when the line runs.'],
    ['The `== null` branch runs when the value is absent.', true, 'A check such as name == null is true only when the value is missing, so that branch handles the absent case.'],
    ['Kotlin can smart-cast any `var` after a null check, even if it changes later.', false, 'A smart cast needs a value that cannot change between the check and the use, such as a stable val. A var that may change is not smart-cast.'],
    ['A failed `as?` cast returns `null`.', true, 'as? returns null instead of throwing when the value is not of the requested type.'],
    ['In `List<String?>`, list elements may be `null`.', true, 'The question mark is on String, so each element may be null while the list itself is an ordinary List.'],
    ['A `null` result in a safe-call chain still runs the remaining calls.', false, 'After a safe call yields null, the later ?. calls are skipped and the whole chain evaluates to null.'],
  ];
  const behaviourExplain = [
    'To allow a missing label the type must be nullable, so String? is the syntax. A plain String cannot hold null.',
    'A var can be reassigned, and String? lets it start as null, so a var of type String? can later hold text.',
    'The safe call ?. reads length only when the value is present and gives null otherwise.',
    'Elvis ?: shows a default for missing text: its right side is used only when the left side is null.',
    '!! asserts that known-present text really is non-null; it throws if the value turns out to be null.',
    'A == null check separates a missing name from a present one by branching on null.',
    'After a != null check, Kotlin smart-casts a stable val, so its length can be used safely.',
    'as? tries the cast without throwing: it returns the converted value or null.',
    'List<String?> allows a missing item: each element may be null.',
    'A ?. chain stops safely at the first null and returns null, so no later access can crash.',
  ];
  const compareExplain = [
    'Program A supplies "No label" with Elvis when label is null. Program B uses !!, which throws when label is null.',
    'Program A declares label with var, so it can be reassigned. Program B tries to reassign a val, which does not compile.',
    'Program A uses ?. so a null title gives null. Program B reads title.length directly on a nullable value, which does not compile.',
    'Program A uses Elvis to give a Guest fallback. Program B uses !!, which throws for a null title.',
    'Program A uses a safe call with a fallback of 0. Program B uses !! on null, which throws.',
    'Program A reads length only in the else branch, where name is known to be non-null. Program B reads name.length on a nullable value, which does not compile.',
    'Program A checks a stable val, so note.length is smart-cast. In Program B the var is set to null after the check, so it is no longer smart-cast and the access does not compile.',
    'Program A uses as?, which returns null if the type does not match. Program B uses as on an Int, which throws a ClassCastException.',
    'Program A prints null: only the element is nullable and the list exists. Program B asserts a null list with !!, which throws.',
    'Program A uses a safe call and an Elvis fallback, so null gives 0. Program B uses !!, which throws on null.',
  ];
  return [
    mk(1,'easy',`${topic} syntax`,lessonPrompt,explanation,'Look at the type marker or operator that represents this rule.','single_choice',{...choose(choices[0],choices.slice(1)),monoOptions:true}),
    mk(2,'easy',`${topic} rule`,truths[index][0],truths[index][2],'Decide whether the statement matches Kotlin null-safety behavior.','true_false',{answer:truths[index][1]}),
    mk(3,'medium',`${topic} trace`,index === 0 ? 'Does this program print true or false?' : 'What does this program print?',lessonCases[index].explain,'Trace the declared value and the null-safety operation.', 'predict_output',{...choose(lessonCases[index].out,[...lessonCases[index].wrong,'""']),code:program(lessonCases[index].outCode),monoOptions:true}),
    mk(4,'medium',`${topic} application`,application.prompt,`The correct choice follows the ${topic.toLowerCase()} rule for this specific value or task.`,'Apply the rule to the value described in the question.','single_choice',{...choose(application.right,application.wrong),monoOptions:true}),
    mk(5,'medium',`${topic} behavior`,`A learner wants to ${[ 'allow a missing label','change a missing label to text','read length only when present','show a default for missing text','assert known-present text','separate missing from present names','use length after proving presence','try a cast without throwing','allow a missing list item','stop safely when an access is missing' ][index]}. Which syntax should they use?`,behaviourExplain[index],'Choose the construct whose behavior matches the goal.','single_choice',choose(syntax,wrong)),
    mk(6,'medium',`${topic} second trace`,'What does this example print?',secondCases.explain,'Check the exact input value before tracing the operation.','predict_output',{...choose(secondCases.out,[...secondCases.wrong,'""']),code:program(secondCases.code),monoOptions:true}),
    mk(7,'medium',`${topic} misconception`,`Select the two correct statements about ${topic.toLowerCase()}.`,`${factPair[0]} ${factPair[1]} The other options state common null-safety mistakes.`,'Check both the value state and the type of the result.','multi_select',{options:[factPair[0],factPair[1],factPair[2],factPair[3]],answers:[0,1]}),
    mk(8,'hard',`${topic} compile-time rule`,'Tap the line that does not compile.',errorExplanation,'Check the type Kotlin knows at the marked access.','find_error',{code:program(errorCode),errorLine,errorNote:errorExplanation}),
    mk(9,'hard',`${topic} comparison`,`Which program handles this lesson's nullable value without an unsafe access?`,compareExplain[index],'Compare what happens when the value is null.','code_comparison',{a:program(compareA),b:program(compareB),answer:0}),
    mk(10,'hard',`${topic} edge-case reasoning`,decision.prompt,decision.explain,'Check how this exact value interacts with the lesson rule.','multi_select',{options:[...decision.good,...decision.bad],answers:[0,1]}),
  ];
});

const setQuestions: QuizQuestion[] = SETS.flatMap(([setId,title,lastLesson,lessonIds], index) => {
  const id = `w7q-set-${index + 1}`;
  const b = (n: number, difficulty: 'easy'|'medium'|'hard', concept: string, prompt: string, explanation: string, hint: string) => ({ id:`${id}-${n}`, lessonId:lastLesson, topic:title, concept, difficulty, prompt, explanation, hint, setId });
  const combined = [
    { prompt:'Which declaration can change from null to a name and still allow null later?', right:'var name: String? = null', wrong:['val name: String = null','var name: String = null','val name: String? = null'], code:['var name: String? = null','name = "Rae"','println(name ?: "Guest")'], out:'Rae', distractors:['Guest','null','Error'], blank:['val name: String? = null','println(name ___ "Guest")'], answer:'?:', chips:['?:','?.','!!','.'], hard:['var name: String? = ""','name = null','println(if (name == null) "Missing" else name)'], hardOut:'Missing', hardWrong:['""','null','Error'], skill:'nullable types, reassignment, and null checks' },
    { prompt:'A missing name should show Guest. Which expression uses a safe call and fallback?', right:'name?.uppercase() ?: "Guest"', wrong:['name!!.uppercase() ?: "Guest"','name.uppercase() ?: "Guest"','name?.uppercase() ?: null'], code:['val profile: String? = null','println(profile?.uppercase() ?: "Guest")'], out:'Guest', distractors:['null','PROFILE','Error'], blank:['val profile: String? = "Lee"','println(profile___uppercase())'], answer:'?.', chips:['?.','!!','?:','.'], hard:['val profile: String? = "Lee"','println(profile?.uppercase() ?: "Guest")'], hardOut:'LEE', hardWrong:['Guest','null','Error'], skill:'safe-call results and Elvis fallback' },
    { prompt:'A name can be missing. Which expression checks for null before reading its length?', right:'if (name == null) "Missing" else name!!.length.toString()', wrong:['name!!.length.toString()','name.length.toString()','if (name != null) "Missing" else name!!.length.toString()'], code:['val name: String? = null','if (name == null) println("Missing") else println(name!!.length)'], out:'Missing', distractors:['0','null','Error'], blank:['val name: String? = null','println(if (name ___ null) "Missing" else name.length)'], answer:'==', chips:['==','!=','?:','!!'], hard:['val name: String? = "Kai"','if (name != null) println(name!!.length) else println("Missing")'], hardOut:'3', hardWrong:['Missing','null','Error'], skill:'explicit null checks and assertion risk' },
    { prompt:'A value has type Any?. Which expression safely tries to read it as a String?', right:'value as? String', wrong:['value as String','value!!','value is String'], code:['val value: Any? = "Fox"','if (value is String) println(value.length)'], out:'3', distractors:['null','0','Error'], blank:['val value: Any? = 12','val text = value ___ String','println(text ?: "No text")'], answer:'as?', chips:['as?','as','!!','is'], hard:['val value: Any? = 12','val text = value as? String','if (text is String) println(text.length) else println("No text")'], hardOut:'No text', hardWrong:['12','null','Error'], skill:'safe casts and smart casts' },
    { prompt:'A list may be missing, and its entries may also be missing. Which type represents both?', right:'List<String?>?', wrong:['List<String?>','List<String>?','String??'], code:['val names: List<String?>? = listOf("Uma", null)','println(names?.get(1)?.length ?: -1)'], out:'-1', distractors:['0','null','Error'], blank:['val names: List<String?>? = null','println(names___size ?: 0)'], answer:'?.', chips:['?.','!!','?:','.'], hard:['val names: List<String?>? = listOf("Uma", null)','println(names?.get(0)?.uppercase() ?: "Empty")'], hardOut:'UMA', hardWrong:['Empty','null','Error'], skill:'nullable collections, elements, and chained safe calls' },
  ][index];
  return [
    make(b(1,'easy','Combined concepts',combined.prompt,`This combines ${combined.skill}.`,'Check which nullable type and handling steps the task needs.').id,lastLesson,title,'Combined concepts','easy',combined.prompt,`This combines ${combined.skill}.`,'Check which nullable type and handling steps the task needs.','single_choice',{...choose(combined.right,combined.wrong),monoOptions:true},setId),
    make(`${id}-2`,lastLesson,title,'Trace combined null handling','medium','What does this program print?',`The code combines ${combined.skill}. Its result is ${JSON.stringify(combined.out)}.`,'Trace each nullable step, then apply any fallback.','predict_output',{...choose(combined.out,combined.distractors),code:program(combined.code),monoOptions:true},setId),
    make(`${id}-3`,lastLesson,title,'Complete a combined operation','medium','Complete the expression so the program follows the null-safety rule.',`The needed token is ${combined.answer}; this combines ${combined.skill}.`,'Choose the operator that safely handles this value.','fill_blank',{code:program(combined.blank),chips:combined.chips,answer:combined.answer},setId),
    make(`${id}-4`,lastLesson,title,'Trace a combined edge case','hard','What does this program print?',`The program combines ${combined.skill}. Following the value through the check or chain gives ${JSON.stringify(combined.hardOut)}.`,'Trace the value through the check or safe-call chain.','predict_output',{...choose(combined.hardOut,combined.hardWrong),code:program(combined.hard),monoOptions:true},setId),
  ];
});

const BOSS_LESSON = 'world-7-boss';
const BOSS_TOPIC = 'Safe Data Processor';
const boss = (n: number, difficulty: 'easy'|'medium'|'hard', concept: string, question: string, explanation: string, hint: string, type: string, data: Record<string, unknown>) =>
  make(`w7q-boss-${n}`, BOSS_LESSON, BOSS_TOPIC, concept, difficulty, question, explanation, hint, type, data);

/**
 * Boss quiz: one small data-processing story, records with missing values. 12 questions, 1 easy / 5 medium / 6 hard (10/40/50), ordered easy to hard.
 * Every question combines at least two World 7 lessons (or World 6 collections / World 4 loops).
 */
const bossQuestions: QuizQuestion[] = [
  boss(1, 'easy', 'Nullable type versus empty text', 'A user record may have no nickname. Which declaration can hold "no value" (null)?',
    'Only a nullable type such as `String?` can hold null. `String` cannot, and an empty String is text, not null.',
    'Look for the question mark on the type.', 'single_choice',
    { ...choose('val nickname: String? = null', ['val nickname: String = null', 'val nickname: String = ""', 'val nickname: Null = ""']), monoOptions: true }),
  boss(2, 'medium', 'Nullable variable with a fallback', 'Complete the line so a missing label shows Unknown.',
    'The Elvis operator `?:` uses its right side only when the left side is null. label is null, so shown is Unknown.',
    'Which operator supplies a fallback for null?', 'fill_blank',
    { code: program(['val label: String? = null', 'val shown = label ___ "Unknown"', 'println(shown)']), chips: ['?:', '?.', '!!', 'as?'], answer: '?:' }),
  boss(3, 'medium', 'Nullable elements versus a nullable list', 'Which statement is true for this list of scores?',
    '`List<Int?>` means each element may be null, but the list itself always exists. A nullable list would be written `List<Int>?`.',
    'Where is the question mark: on the list or on the element?', 'single_choice',
    { ...choose('Each score may be null, but the list itself is never null', ['The list may be null, but every score is an Int', 'Both the list and each score may be null', 'Neither the list nor a score can be null']), code: ['val scores: List<Int?> = listOf(90, null, 75)'] }),
  boss(4, 'medium', 'Safe call and Elvis in a loop', 'What does this program print?',
    'Ana has length 3, the null name falls back to 0, and Bo has length 2. The total is 3 + 0 + 2 = 5.',
    'Handle the null name with its fallback before adding.', 'predict_output',
    { ...choose('5', ['3', '2', 'Error']), code: program(['val names: List<String?> = listOf("Ana", null, "Bo")', 'var total = 0', 'for (name in names) {', '  total += name?.length ?: 0', '}', 'println(total)']), monoOptions: true }),
  boss(5, 'medium', 'Fallback before arithmetic', 'Which program handles a missing score safely?',
    'A adds 1 to `score ?: 0`, so a missing score counts as 0. B adds 1 to a nullable Int, which does not compile.',
    'Can you add a number to a value that might be null?', 'code_comparison',
    { a: program(['val score: Int? = null', 'val shown = score ?: 0', 'println(shown + 1)']), b: program(['val score: Int? = null', 'println(score + 1)']), answer: 0 }),
  boss(6, 'medium', 'Map lookup, null check and smart cast', 'What does this program print?',
    'scores["Cy"] is null, so it is skipped. Ana adds 90 and Bo adds 70, which gives 160. Inside the check, score is smart cast to a non-null Int.',
    'A key that is missing from a Map gives null.', 'predict_output',
    { ...choose('160', ['90', '70', 'Error']), code: program(['val scores = mapOf("Ana" to 90, "Bo" to 70)', 'val names = listOf("Ana", "Cy", "Bo")', 'var found = 0', 'for (name in names) {', '  val score = scores[name]', '  if (score != null) found += score', '}', 'println(found)']), monoOptions: true }),
  boss(7, 'hard', 'A check that does not guarantee non-null', 'Tap the line that does not compile.',
    'With `||`, the body can run when `first` is null (the list is empty), so Kotlin does not smart cast it. The body needs `&&` or a safe call.',
    'Does an OR check prove the value is not null?', 'find_error',
    { code: program(['val emails: List<String?> = listOf("a@x.com", null)', 'val first = emails[0]', 'if (first != null || emails.isEmpty()) {', '  println(first.length)', '}']), errorLine: 4, errorNote: 'first may still be null here, so .length is not allowed.' }),
  boss(8, 'hard', 'Absent key versus null value', 'What does this program print?',
    'Ana has an email of length 9. Bo is in the Map with a null value, and Cy is not in the Map at all. Both give null, so the fallback -1 is printed for each.',
    'A null value and a missing key both give null.', 'predict_output',
    { ...choose('9\n-1\n-1', ['9\n0\n0', '9\nnull\nnull', '9\n-1\nError']), code: program(['val emails = mapOf("Ana" to "ana@x.com", "Bo" to null)', 'val names = listOf("Ana", "Bo", "Cy")', 'for (name in names) {', '  println(emails[name]?.length ?: -1)', '}']), monoOptions: true }),
  boss(9, 'hard', 'Nullable elements and safe calls', 'Given `val entries: List<String?> = listOf("a", null)`, which statements are true? Select all that apply.',
    'The list has two elements, because null still takes a place. `entries[0]?.length` is an `Int?` because a safe call can give null. Reading an element gives a `String?`, so `.length` alone does not compile.',
    'Count the null element, and check each element type.', 'multi_select',
    { options: ['entries.size is 2, because null still takes a place in the list', 'entries[0]?.length has the type Int?', 'entries[1].length compiles because the list itself is not null', 'entries[0] is a String and can never be null'], answers: [0, 1] }),
  boss(10, 'hard', 'Safe cast returns a nullable value', 'Tap the line that does not compile.',
    '`raw as? Int` has the type `Int?`, because a failed cast gives null. It cannot be stored in a variable declared as `Int`.',
    'What type does as? produce?', 'find_error',
    { code: program(['val raw: Any = "42"', 'val n: Int = raw as? Int', 'println(n)']), errorLine: 2, errorNote: 'as? gives Int?, not Int.' }),
  boss(11, 'hard', 'Several ways to give a missing name', 'Given `val name: String? = null`, which expressions produce "No name"? Select all that apply.',
    'The Elvis operator and both if checks use the fallback when name is null. `name!!` asserts that name is not null, so it throws an exception instead.',
    'One option asserts instead of handling null.', 'multi_select',
    { options: ['name ?: "No name"', 'if (name != null) name else "No name"', 'if (name == null) "No name" else name', 'name!!'], answers: [0, 1, 2], monoOptions: true }),
  boss(12, 'hard', 'Complete report with missing names and scores', 'What does this program print?',
    'Ana adds 90. The null name adds 1 to missing. Cy is not in the Map, so Elvis gives 0. Bo adds 70. The total is 160 and one name is missing.',
    'Handle the null name first, then the missing key.', 'predict_output',
    { ...choose('160/1', ['160/2', '70/1', 'Error']), code: program(['val names: List<String?> = listOf("Ana", null, "Cy", "Bo")', 'val scores = mapOf("Ana" to 90, "Bo" to 70)', 'var total = 0', 'var missing = 0', 'for (name in names) {', '  if (name == null) {', '    missing++', '  } else {', '    total += scores[name] ?: 0', '  }', '}', 'println("$total/$missing")']), monoOptions: true }),
];

export const WORLD_7_QUIZ = [...lessonQuestions, ...setQuestions];
export const WORLD_7_BOSS_QUIZ = bossQuestions;
