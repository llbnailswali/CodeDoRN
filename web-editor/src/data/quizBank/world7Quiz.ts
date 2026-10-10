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
  while (options.length < 3) options.push(`Not ${right} (${options.length + 1})`);
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
  return [
    mk(1,'easy',`${topic} syntax`,prompt,explanation,'Look at the operator or type marker.','single_choice',choose(syntax,wrong)),
    mk(2,'easy',`${topic} behavior`,`True or false: ${explanation}`,explanation,'Think about what happens when the value is null.','true_false',{answer:true}),
    mk(3,'medium',`${topic} output`,'What prints?',codeExplanation,'Trace the value through the code.','predict_output',{...choose(output,[distractor1,distractor2,'Compile error']),code:program(index === 1 ? ['var label: String? = null','label = "Ready"','println("Ready")'] : index === 5 ? ['val name: String? = null','if (name == null) println("Missing")'] : index === 7 ? ['val value: Any = 7','val text = value as? String','println("null")'] : [line1,line2]),monoOptions:true}),
    mk(4,'medium',`${topic} syntax`,`Which token is used for ${topic.toLowerCase()}?`,`${syntax} is the key syntax for this lesson.`,`Recall the lesson's main syntax.`,'single_choice',choose(syntax,wrong)),
    mk(5,'medium',`${topic} null behavior`,`What does ${syntax} help you do?`,explanation,'Focus on its behavior when a value is null.','single_choice',choose(explanation,wrong)),
    mk(6,'medium',`${topic} code reading`,'What prints?',codeExplanation,'Follow the value and check whether it is null.','predict_output',{...choose(index === 1 ? 'null' : index === 5 ? '3' : index === 7 ? 'Mia' : output,[distractor2,distractor1,'0']),code:program(index === 1 ? ['var label: String? = "Ready"','label = null','println("null")'] : index === 5 ? ['val name: String? = "Ari"','if (name != null) println(name.length)'] : index === 7 ? ['val value: Any = "Mia"','println(value as? String)'] : [line1,line2]),monoOptions:true}),
    mk(7,'medium',`${topic} facts`,'Select every correct statement.','The main rule applies, and the lesson is part of Kotlin null safety.','Choose statements that match the rule.','multi_select',{options:[explanation,'This is a Kotlin null-safety concept.',wrong[1],`The operator ${syntax} always returns zero.`],answers:[0,1]}),
    mk(8,'hard',`${topic} error location`,'Tap the line that has an error.',explanation,'Find the line that uses the wrong null-safety rule.','find_error',{code:program([`val value: String? = null`,`println(value.length)`]),errorLine:2,errorNote:'A nullable value needs a safe call, a null check, or an appropriate fallback.'}),
    mk(9,'hard',`${topic} comparison`,'Which program handles the nullable value safely?',explanation,'Compare how each program treats null.','code_comparison',{a:program(['val value: String? = null','println(value?.length)']),b:program(['val value: String? = null','println(value!!.length)']),answer:0}),
    mk(10,'hard',`${topic} rules`,'Select every true statement.',explanation,'Consider both null and non-null values.','multi_select',{options:[explanation,`A nullable type and a non-null type are identical.`,`The value can never be null.`,`This is a Kotlin null-safety concept.`],answers:[0,3]}),
  ];
});

const setQuestions: QuizQuestion[] = SETS.flatMap(([setId,title,lastLesson,lessonIds], index) => {
  const id = `w7q-set-${index + 1}`;
  const b = (n: number, difficulty: 'easy'|'medium'|'hard', concept: string, prompt: string, explanation: string, hint: string) => ({ id:`${id}-${n}`, lessonId:lastLesson, topic:title, concept, difficulty, prompt, explanation, hint, setId });
  return [
    make(b(1,'easy','Combined rule',`Which concept belongs in ${title}?`,'This set combines the listed null-safety lessons.','Recall the ideas practised together.').id,lastLesson,title,'Combined rule','easy',`Which concept belongs in ${title}?`,'This set combines the listed null-safety lessons.','Recall the ideas practised together.','single_choice',choose(title,['Loops','Classes','Arithmetic']),setId),
    make(b(2,'medium','Combined null handling','What prints?', 'A null-safe access followed by a fallback uses the fallback when the result is null.','Trace the nullable result before its fallback.').id,lastLesson,title,'Combined null handling','medium','What prints?','The safe call returns null, so the fallback is selected.','Trace the nullable result before its fallback.','predict_output',{...choose('Guest',['null','0','Error']),code:program(['val name: String? = null','println(name?.uppercase() ?: "Guest")']),monoOptions:true},setId),
    make(b(3,'medium','Combined value check','Complete the expression with a fallback.','Elvis supplies Guest when the left side is null.','Use the operator that handles a null result.').id,lastLesson,title,'Combined value check','medium','Complete the expression with a fallback.','Elvis supplies Guest when the left side is null.','Use the operator that handles a null result.','fill_blank',{code:program(['val name: String? = null','println(name ___ "Guest")']),chips:['?:','?.','!!','.'],answer:'?:'},setId),
    make(b(4,'hard','Combined program','What prints?', 'The null check and fallback determine the final output.','Follow the value from the first line to the print.').id,lastLesson,title,'Combined program','hard','What prints?','The value is null, so the Elvis fallback is printed.','Follow the value from the first line to the print.','predict_output',{...choose('Missing',['null','0','Error']),code:program(['val name: String? = null','println(name ?: "Missing")']),monoOptions:true},setId),
  ];
});

const bossQuestions: QuizQuestion[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1; const difficulty = n <= 2 ? 'easy' : n <= 8 ? 'medium' : 'hard';
  const prompt = n % 3 === 0 ? 'What prints?' : 'A profile field may be missing. What is the safest result?';
  const code = n % 2 === 0 ? program(['val name: String? = null','println(name?.length ?: -1)']) : program(['val name: String? = "Ari"','println(name?.length ?: -1)']);
  const answerText = n % 2 === 0 ? '-1' : '3';
  const options = choose(answerText, answerText === '-1' ? ['null','0','Error'] : ['-1','null','Error']);
  return make(`w7q-boss-${n}`, 'world-7-boss','Safe Data Processor',`Missing profile field ${n}`,difficulty,prompt,n % 2 === 0 ? 'The safe call returns null and Elvis supplies -1.' : 'The name is present, so its length is printed.','Trace the optional field before choosing a fallback.', 'predict_output',{...options,code,monoOptions:true});
});

export const WORLD_7_QUIZ = [...lessonQuestions, ...setQuestions];
export const WORLD_7_BOSS_QUIZ = bossQuestions;
