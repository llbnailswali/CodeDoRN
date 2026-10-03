import { QuizQuestion } from '../../utils/quizQuestions';

/**
 * World 1 (Kotlin Awakening) quiz bank: 38 questions, about 3 per lesson, weighted by how many concepts the lesson teaches.
 * `lessonId` and `concept` are internal tags (analytics, spreading a session across lessons); `topic` is the lesson's name, shown to
 * the learner as the question's concept tag. Code is 2-space indented. Every predict_output / fill_blank answer is run through the real engine by
 * `npm run test:quiz-bank`, and the answer positions are spread so no option position dominates.
 */
const T = {
  what: 'What is Kotlin?',
  syntax: 'Kotlin Syntax & main()',
  comments: 'Comments',
  print: 'print() and println()',
  valvar: 'val vs var',
  infer: 'Variables & Type Inference',
  int: 'Int & Long',
  float: 'Float & Double',
  bool: 'Boolean',
  char: 'Char',
  string: 'Strings',
  template: 'String Templates',
  boss: 'Personal Profile Program',
};

/** Catalog lesson ids, by the same keys as `T`. */
const L = {
  what: 'world-1-what-is-kotlin',
  syntax: 'world-1-kotlin-syntax',
  comments: 'world-1-comments',
  print: 'world-1-print-println',
  valvar: 'world-1-val-vs-var',
  infer: 'world-1-variables-type-inference',
  int: 'world-1-int-long',
  float: 'world-1-float-double',
  bool: 'world-1-boolean',
  char: 'world-1-char',
  string: 'world-1-string',
  template: 'world-1-string-templates',
  boss: 'world-1-boss',
};
const W = 'world-1';

export const WORLD_1_QUIZ: QuizQuestion[] = [
  // What is Kotlin?
  {
    id: 'w1q-what-1', type: 'single_choice', worldId: W, lessonId: L.what, topic: T.what, concept: 'Who created Kotlin', difficulty: 'easy', xp: 10,
    question: 'Which company created the Kotlin language?',
    options: ['Google', 'JetBrains', 'Oracle', 'Microsoft'], answer: 1,
    hint: 'This company also makes the IntelliJ IDEA editor.',
    explanation: 'JetBrains created Kotlin. Google later made it an officially supported language for Android apps.',
  },
  {
    id: 'w1q-what-2', type: 'true_false', worldId: W, lessonId: L.what, topic: T.what, concept: 'Kotlin and the JVM', difficulty: 'medium', xp: 15,
    question: 'Kotlin code can run on the JVM and can use existing Java libraries.',
    answer: true,
    hint: 'Kotlin was designed to work together with Java.',
    explanation: 'Kotlin compiles to JVM bytecode and works smoothly with Java code, so a Kotlin program can call Java libraries.',
  },

  // Kotlin Syntax & main()
  {
    id: 'w1q-syntax-1', type: 'single_choice', worldId: W, lessonId: L.syntax, topic: T.syntax, concept: 'Entry point main()', difficulty: 'easy', xp: 10,
    question: 'Where does a Kotlin program start running?',
    options: ['fun start()', 'println()', 'fun main()', 'val main'], monoOptions: true, answer: 2,
    hint: 'Every program has one special function that the computer calls first.',
    explanation: 'Execution begins in fun main(). The other names are not entry points, and println() only prints text.',
  },
  {
    id: 'w1q-syntax-2', type: 'find_error', worldId: W, lessonId: L.syntax, topic: T.syntax, concept: 'Syntax: parentheses', difficulty: 'medium', xp: 15,
    question: 'Tap the line that contains an error.',
    code: ['fun main() {', '  println("Hello"', '}'], errorLine: 1,
    hint: 'Count the opening and closing parentheses on each line.',
    errorNote: 'The closing ) is missing.',
    explanation: 'println( opens a parenthesis that is never closed. The line needs println("Hello") with a closing parenthesis.',
  },
  {
    id: 'w1q-syntax-3', type: 'fill_blank', worldId: W, lessonId: L.syntax, topic: T.syntax, concept: 'Entry point main()', difficulty: 'easy', xp: 10,
    question: 'Complete the code so the program starts running when you launch it.',
    code: ['fun ___() {', '  println("Hi")', '}'], chips: ['run', 'begin', 'main', 'start'], answer: 'main',
    hint: 'It is the same name used by every Kotlin program.',
    explanation: 'A Kotlin program starts in a function called main. Without that exact name there is no starting point.',
  },

  // Comments
  {
    id: 'w1q-comments-1', type: 'predict_output', worldId: W, lessonId: L.comments, topic: T.comments, concept: 'Line comments', difficulty: 'easy', xp: 10,
    question: 'What will this code print?',
    code: ['fun main() {', '  // println("A")', '  println("B")', '}'],
    options: ['B', 'A', 'AB', 'Nothing'], monoOptions: true, answer: 0,
    hint: 'What does the // at the start of a line do?',
    explanation: 'The first println is inside a // comment, so Kotlin ignores it. Only println("B") runs.',
  },
  {
    id: 'w1q-comments-2', type: 'true_false', worldId: W, lessonId: L.comments, topic: T.comments, concept: 'Block comments', difficulty: 'easy', xp: 10,
    question: 'A comment that starts with /* and ends with */ can cover several lines.',
    answer: true,
    hint: 'Think about which comment style has both an opening and a closing mark.',
    explanation: 'Everything between /* and */ is a comment, even across many lines. A // comment ends at the end of its line.',
  },

  // print() and println()
  {
    id: 'w1q-print-1', type: 'predict_output', worldId: W, lessonId: L.print, topic: T.print, concept: 'print vs println', difficulty: 'easy', xp: 10,
    question: 'What will this code print?',
    code: ['print("Hi")', 'print("!")', 'println(" there")'],
    options: ['Hi! there', 'Hi!there', 'Hi ! there', 'Hi!'], monoOptions: true, answer: 0,
    hint: 'print does not move to a new line. Look at the space inside " there".',
    explanation: 'All three calls write on the same line: Hi, then !, then " there" (with its leading space). println only ends the line after the last text.',
  },
  {
    id: 'w1q-print-2', type: 'fill_blank', worldId: W, lessonId: L.print, topic: T.print, concept: 'print vs println', difficulty: 'medium', xp: 15,
    question: 'Complete the code so Line 1 and Line 2 appear on the same line.',
    code: ['fun main() {', '  ___("Line 1")', '  println("Line 2")', '}'], chips: ['println', 'print', 'echo', 'write'], answer: 'print',
    hint: 'One of these prints text without moving to a new line.',
    explanation: 'print writes text and stays on the same line, so "Line 2" follows "Line 1". println would put Line 2 on the next line.',
  },
  {
    id: 'w1q-print-3', type: 'code_comparison', worldId: W, lessonId: L.print, topic: T.print, concept: 'Line breaks', difficulty: 'medium', xp: 15,
    question: 'Which code prints Hello and World on two separate lines?',
    a: ['print("Hello")', 'print("World")'],
    b: ['println("Hello")', 'println("World")'],
    answer: 1,
    hint: 'Which call ends the line after printing?',
    explanation: 'println ends the line after its text, so World starts on a new line. With print the output would be HelloWorld on one line.',
  },

  // val vs var
  {
    id: 'w1q-valvar-1', type: 'find_error', worldId: W, lessonId: L.valvar, topic: T.valvar, concept: 'val is read-only', difficulty: 'easy', xp: 10,
    question: 'Tap the line that contains an error.',
    code: ['val lives = 3', 'lives = 2', 'println(lives)'], errorLine: 1,
    hint: 'Look for a line that changes a value declared with val.',
    errorNote: 'lives is a val, so it cannot get a new value.',
    explanation: 'A val is read-only, so lives = 2 is not allowed. Declare it with var if the value has to change.',
  },
  {
    id: 'w1q-valvar-2', type: 'predict_output', worldId: W, lessonId: L.valvar, topic: T.valvar, concept: 'Reassigning a var', difficulty: 'medium', xp: 15,
    question: 'What will this code print?',
    code: ['var points = 10', 'points = points + 5', 'points = points - 3', 'println(points)'],
    options: ['15', '7', 'Error', '12'], monoOptions: true, answer: 3,
    hint: 'Follow the lines in order and write down points after each one.',
    explanation: 'points starts at 10, becomes 15, then 12. println shows the last value, 12.',
  },
  {
    id: 'w1q-valvar-3', type: 'true_false', worldId: W, lessonId: L.valvar, topic: T.valvar, concept: 'Choosing val or var', difficulty: 'easy', xp: 10,
    question: 'If a value never changes after it is set, Kotlin style prefers val over var.',
    answer: true,
    hint: 'Which keyword makes the code safer because the value cannot change by mistake?',
    explanation: 'Use val by default and var only when the value really must change. It makes accidental changes impossible.',
  },
  {
    id: 'w1q-valvar-4', type: 'code_comparison', worldId: W, lessonId: L.valvar, topic: T.valvar, concept: 'val vs var', difficulty: 'medium', xp: 15,
    question: 'Which code compiles without an error?',
    a: ['val count = 0', 'count = count + 1'],
    b: ['var count = 0', 'count = count + 1'],
    answer: 1,
    hint: 'The second line changes count. Which keyword allows that?',
    explanation: 'count changes on the second line, so it must be declared with var. Code A tries to change a val, which is an error.',
  },

  // Variables & Type Inference
  {
    id: 'w1q-infer-1', type: 'single_choice', worldId: W, lessonId: L.infer, topic: T.infer, concept: 'Type inference', difficulty: 'easy', xp: 10,
    question: 'What type does Kotlin infer for this variable?',
    code: ['val city = "Pune"'],
    options: ['Int', 'Char', 'Any', 'String'], monoOptions: true, answer: 3,
    hint: 'Look at the kind of value on the right of the =.',
    explanation: 'The value "Pune" is text in double quotes, so Kotlin infers the type String.',
  },
  {
    id: 'w1q-infer-2', type: 'fill_blank', worldId: W, lessonId: L.infer, topic: T.infer, concept: 'Declared types', difficulty: 'medium', xp: 15,
    question: 'Complete the declaration with the type that matches the value.',
    code: ['val price: ___ = 19.99'], chips: ['Int', 'Boolean', 'String', 'Double'], answer: 'Double',
    hint: 'The value has a decimal part.',
    explanation: '19.99 has a decimal part, so its type is Double. Int cannot hold decimals, and String and Boolean are different kinds of values.',
  },
  {
    id: 'w1q-infer-3', type: 'single_choice', worldId: W, lessonId: L.infer, topic: T.infer, concept: 'Static typing', difficulty: 'hard', xp: 20,
    question: 'What happens when this code is compiled?',
    code: ['var age = 25', 'age = "twenty"', 'println(age)'],
    options: ['It prints twenty', 'It does not compile', 'It prints 25', 'It prints null'], answer: 1,
    hint: 'Kotlin decides the type of age from its first value and keeps it.',
    explanation: 'Kotlin infers age as Int from 25. The type cannot change, so assigning the text "twenty" is a type mismatch and the code does not compile.',
  },

  // Int & Long
  {
    id: 'w1q-int-1', type: 'predict_output', worldId: W, lessonId: L.int, topic: T.int, concept: 'Long literals', difficulty: 'easy', xp: 10,
    question: 'What will this code print?',
    code: ['val big = 5_000_000_000L', 'println(big)'],
    options: ['5_000_000_000', '5000000000L', '5000000000', 'Error'], monoOptions: true, answer: 2,
    hint: 'The underscores only make the number easier to read.',
    explanation: 'Underscores are ignored and the L suffix only marks the type, so Kotlin prints the plain number 5000000000.',
  },
  {
    id: 'w1q-int-2', type: 'find_error', worldId: W, lessonId: L.int, topic: T.int, concept: 'Int range', difficulty: 'medium', xp: 15,
    question: 'Tap the line that contains an error.',
    code: ['val a: Int = 100', 'val b: Long = 100L', 'val c: Int = 3000000000', 'println(a + b)'], errorLine: 2,
    hint: 'The biggest Int is about 2.1 billion.',
    errorNote: '3000000000 is too big for an Int.',
    explanation: 'An Int holds values up to 2147483647. 3000000000 is bigger, so it needs the type Long (for example val c: Long = 3000000000).',
  },
  {
    id: 'w1q-int-3', type: 'multi_select', worldId: W, lessonId: L.int, topic: T.int, concept: 'Int vs Long', difficulty: 'hard', xp: 20,
    question: 'Which declarations create a Long? Select all that apply.',
    options: ['val a = 5', 'val b = 5L', 'val c: Long = 5', 'val d = 3000000000'], monoOptions: true, answers: [1, 2, 3],
    hint: 'A Long can come from a suffix, a declared type, or a number too big for Int.',
    explanation: 'The L suffix makes a Long, a declared type Long makes a Long, and a number too big for Int is automatically a Long. A plain 5 is an Int.',
  },

  // Float & Double
  {
    id: 'w1q-float-1', type: 'single_choice', worldId: W, lessonId: L.float, topic: T.float, concept: 'Default decimal type', difficulty: 'easy', xp: 10,
    question: 'What type does Kotlin give a decimal number written like 3.14?',
    options: ['Float', 'Decimal', 'Double', 'Int'], monoOptions: true, answer: 2,
    hint: 'It is the default type for numbers with a decimal point.',
    explanation: 'A decimal literal such as 3.14 is a Double by default. You need an f at the end (3.14f) to make it a Float.',
  },
  {
    id: 'w1q-float-2', type: 'predict_output', worldId: W, lessonId: L.float, topic: T.float, concept: 'Float arithmetic', difficulty: 'medium', xp: 15,
    question: 'What will this code print?',
    code: ['val f: Float = 2.5f', 'println(f * 2)'],
    options: ['5', '2.5', 'Error', '5.0'], monoOptions: true, answer: 3,
    hint: 'A Float multiplied by 2 is still a decimal type.',
    explanation: 'Float times 2 gives the Float 5.0, and Kotlin prints a decimal value with its .0.',
  },
  {
    id: 'w1q-float-3', type: 'find_error', worldId: W, lessonId: L.float, topic: T.float, concept: 'Float literals', difficulty: 'medium', xp: 15,
    question: 'Tap the line that contains an error.',
    code: ['val ratio: Float = 0.75f', 'val total: Float = 1.5', 'println(ratio + total)'], errorLine: 1,
    hint: 'Check how each Float value is written.',
    errorNote: '1.5 is a Double. A Float needs 1.5f.',
    explanation: 'Without the f suffix, 1.5 is a Double, which does not fit a Float variable. Write 1.5f.',
  },

  // Boolean
  {
    id: 'w1q-bool-1', type: 'predict_output', worldId: W, lessonId: L.bool, topic: T.bool, concept: 'Logical NOT', difficulty: 'easy', xp: 10,
    question: 'What will this code print?',
    code: ['val isOpen = true', 'println(!isOpen)'],
    options: ['false', 'true', '!true', 'Error'], monoOptions: true, answer: 0,
    hint: 'What does ! do to a Boolean?',
    explanation: '! means "not". It flips true to false, so the program prints false.',
  },
  {
    id: 'w1q-bool-2', type: 'true_false', worldId: W, lessonId: L.bool, topic: T.bool, concept: 'Comparison results', difficulty: 'easy', xp: 10,
    question: 'The result of the comparison 10 > 3 is a Boolean value.',
    answer: true,
    hint: 'A comparison answers a yes or no question.',
    explanation: 'Comparisons such as > give a Boolean: here the result is true.',
  },
  {
    id: 'w1q-bool-3', type: 'single_choice', worldId: W, lessonId: L.bool, topic: T.bool, concept: 'Boolean literals', difficulty: 'medium', xp: 15,
    question: 'Which line declares a Boolean variable correctly?',
    options: ['val ready: Boolean = "true"', 'val ready: Boolean = 1', 'val ready = true', 'val ready = True'], monoOptions: true, answer: 2,
    hint: 'Boolean values are written in lowercase and without quotes.',
    explanation: 'The values are the lowercase words true and false. "true" is a String, 1 is an Int and True is not a Kotlin value.',
  },

  // Char
  {
    id: 'w1q-char-1', type: 'multi_select', worldId: W, lessonId: L.char, topic: T.char, concept: 'Char literals', difficulty: 'medium', xp: 15,
    question: 'Which of these are valid Char literals? Select all that apply.',
    options: ["'A'", '"A"', "'7'", "'AB'"], monoOptions: true, answers: [0, 2],
    hint: 'A Char is exactly one character inside single quotes.',
    explanation: "A Char uses single quotes and holds one character: 'A' and '7' are valid. \"A\" is a String and 'AB' has two characters.",
  },
  {
    id: 'w1q-char-2', type: 'find_error', worldId: W, lessonId: L.char, topic: T.char, concept: 'Char vs String', difficulty: 'easy', xp: 10,
    question: 'Tap the line that contains an error.',
    code: ["val first = 'K'", 'val second = "L"', 'val third: Char = "M"', 'println(first)'], errorLine: 2,
    hint: 'Look at which quotes a Char needs.',
    errorNote: 'A Char needs single quotes: \'M\'.',
    explanation: "val third is declared as Char, but \"M\" in double quotes is a String. A Char value is written with single quotes: 'M'.",
  },
  {
    id: 'w1q-char-3', type: 'predict_output', worldId: W, lessonId: L.char, topic: T.char, concept: 'Escape sequences', difficulty: 'medium', xp: 15,
    question: 'What will this code print?',
    code: ['println("Say \\"Hi\\"")'],
    options: ['Say \\"Hi\\"', 'Say Hi', 'Say "Hi"', 'Error'], monoOptions: true, answer: 2,
    hint: 'What does a backslash before a quote do inside a string?',
    explanation: 'The \\" escape puts a real quote mark in the text without ending the string, so the output is Say "Hi".',
  },

  // Strings
  {
    id: 'w1q-string-1', type: 'predict_output', worldId: W, lessonId: L.string, topic: T.string, concept: 'String length', difficulty: 'easy', xp: 10,
    question: 'What will this code print?',
    code: ['val word = "Kotlin"', 'println(word.length)'],
    options: ['5', '7', 'Kotlin', '6'], monoOptions: true, answer: 3,
    hint: 'Count every letter in the word.',
    explanation: '.length is the number of characters. K-o-t-l-i-n has 6 characters.',
  },
  {
    id: 'w1q-string-2', type: 'fill_blank', worldId: W, lessonId: L.string, topic: T.string, concept: 'Concatenation', difficulty: 'medium', xp: 15,
    question: 'Complete the code so it prints CodeDo.',
    code: ['val first = "Code"', 'val second = "Do"', 'println(first ___ second)'], chips: ['-', '*', '+', '/'], answer: '+',
    hint: 'Which operator joins two strings together?',
    explanation: 'The + operator joins (concatenates) two strings into one: "Code" + "Do" is "CodeDo". The other operators do not work on text.',
  },
  {
    id: 'w1q-string-3', type: 'true_false', worldId: W, lessonId: L.string, topic: T.string, concept: 'String immutability', difficulty: 'medium', xp: 15,
    question: "You can change one character of a String in place, for example word[0] = 'J'.",
    answer: false,
    hint: 'Think about whether a String can be edited after it is created.',
    explanation: 'Strings in Kotlin are immutable. You can read a character with word[0], but to get different text you create a new String.',
  },

  // String Templates
  {
    id: 'w1q-template-1', type: 'fill_blank', worldId: W, lessonId: L.template, topic: T.template, concept: 'Variable templates', difficulty: 'easy', xp: 10,
    question: 'Complete the code so it prints Hello, Mia.',
    code: ['val name = "Mia"', 'println("Hello, ___name")'], chips: ['%', '#', '$', '@'], answer: '$',
    hint: 'Which symbol puts a variable into a string?',
    explanation: 'A $ before a variable name inserts its value into the string, so "Hello, $name" prints Hello, Mia.',
  },
  {
    id: 'w1q-template-2', type: 'predict_output', worldId: W, lessonId: L.template, topic: T.template, concept: 'Expression templates', difficulty: 'medium', xp: 15,
    question: 'What will this code print?',
    code: ['val a = 3', 'val b = 4', 'println("Sum: ${a + b}")'],
    options: ['Sum: 3 + 4', 'Sum: 7', 'Sum: ${a + b}', 'Sum: 34'], monoOptions: true, answer: 1,
    hint: 'Kotlin calculates what is inside ${ }.',
    explanation: 'Inside ${ } Kotlin evaluates the expression a + b, which is 7, and puts the result in the text.',
  },
  {
    id: 'w1q-template-3', type: 'find_error', worldId: W, lessonId: L.template, topic: T.template, concept: 'Template syntax', difficulty: 'medium', xp: 15,
    question: 'Tap the line that contains an error.',
    code: ['val score = 25', 'println("Score: $score")', 'println("Score: ${score")', 'println("Done")'], errorLine: 2,
    hint: 'Check that every opening brace has a closing brace.',
    errorNote: '${ is never closed with }.',
    explanation: 'The template ${score is missing its closing brace. It should be ${score}.',
  },

  // Personal Profile Program
  {
    id: 'w1q-boss-1', type: 'multi_select', worldId: W, lessonId: L.boss, topic: T.boss, concept: 'Choosing types', difficulty: 'medium', xp: 15,
    question: 'Which declarations are valid Kotlin? Select all that apply.',
    options: ['val name = "Ana"', 'var age = 30', 'val height: Double = 1.70', 'val isStudent: Boolean = "yes"', "val initial = 'A'"], monoOptions: true, answers: [0, 1, 2, 4],
    hint: 'Check that each value matches its type: text, whole number, decimal, true/false, one character.',
    explanation: 'Four lines pair a value with the right type. A Boolean can only be true or false, so "yes" in quotes is a String and does not fit.',
  },
  {
    id: 'w1q-boss-2', type: 'predict_output', worldId: W, lessonId: L.boss, topic: T.boss, concept: 'Variables and templates', difficulty: 'medium', xp: 15,
    question: 'What will this code print?',
    code: ['val name = "Ana"', 'var age = 30', 'age = age + 1', 'println("$name is $age")'],
    options: ['Ana is 30', '$name is $age', 'Ana is 31', 'Ana is age'], monoOptions: true, answer: 2,
    hint: 'Check the value of age after line 3, before the print.',
    explanation: 'age becomes 31 on line 3. The templates $name and $age are replaced by their values, giving Ana is 31.',
  },
  {
    id: 'w1q-boss-3', type: 'code_comparison', worldId: W, lessonId: L.boss, topic: T.boss, concept: 'Templates', difficulty: 'hard', xp: 20,
    question: 'Which code prints the real values of name and age?',
    a: ['val name = "Ana"', 'val age = 30', 'println("Name: $name, Age: $age")'],
    b: ['val name = "Ana"', 'val age = 30', 'println("Name: name, Age: age")'],
    answer: 0,
    hint: 'How does Kotlin know a word inside quotes is a variable?',
    explanation: 'Without a $, the words name and age are plain text. Code A uses $name and $age, so their values are inserted.',
  },
];
