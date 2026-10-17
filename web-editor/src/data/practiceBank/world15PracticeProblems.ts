import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 15 -- Error Fortress (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-4 dependent steps; the error feature (try, catch, finally, throw, Result, runCatching ...) is named in the step.
//   hard   -- several features together, a value or a log that depends on the order in which try, catch and finally run, a custom
//             exception hierarchy, or an error that travels from a function to its caller; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world15.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world15.real.ts). The simulator reports no compile errors for
// exception code (throw of a non-Throwable, catch of a non-Throwable), so every Debug task is a logic or runtime bug (PITFALLS.md).

export const WORLD_15_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-15-practice-writerun-divide-try',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Wrap a division that fails in try, catch the exception, and let the program go on.',
    conceptTags: ['lesson:exceptions-try', 'try', 'catch', 'arithmetic-exception'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Divide with Try',
    goal: 'Divide 10 by a number that may be zero. Catch the problem so the program does not stop, and print a line after it.',
    description: '1. **Write the try block.** Write `try { ... }`. Inside, print "start". Create `val x` as `10 / divisor`. Then print "value " plus `x`.\n\n' +
              '2. **Write the catch block.** Add `catch (e: ArithmeticException) { ... }`. Inside, print "caught " plus `e.message`.\n\n' +
              '3. **Print after.** After the catch block, print "after":\n"start"\n"caught / by zero"\n"after"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the try block.** Print, divide, print the value.',
          '2. **Write the catch block.** Catch `ArithmeticException` and print the message.',
          '3. **Print after.** Print "after" after the catch block.',
        ],
        comments: [
          '// 1. Write the try block. Print, divide, print the value.',
          '// 2. Write the catch block. Catch ArithmeticException and print the message.',
          '// 3. Print after. Print "after" after the catch block.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the try block.**',
          '2. **Write the catch block.**',
          '3. **Print after.**',
        ],
        comments: [
          '// 1. Write the try block.',
          '// 2. Write the catch block.',
          '// 3. Print after.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DivideTry.kt',
    initialCode: `fun main() {
  val divisor = 0

  // 1. Write the try block. Write try { ... }. Inside, print "start". Create val x as 10 / divisor. Then print "value " plus x.

  // 2. Write the catch block. Add catch (e: ArithmeticException) { ... }. Inside, print "caught " plus e.message.

  // 3. Print after. After the catch block, print "after": "start" "caught / by zero" "after"
}`,
    solutionCode: `fun main() {
  val divisor = 0
  try {
    println("start")
    val x = 10 / divisor
    println("value " + x)
  } catch (e: ArithmeticException) {
    println("caught " + e.message)
  }
  println("after")
}`,
    sampleInput: 'main()',
    expectedOutput: 'start\ncaught / by zero\nafter',
    testCase: { call: '', expected: 'start\ncaught / by zero\nafter' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'divisor', originalLiteral: '0', alternateLiteral: '2' }],
      alternateExpectedOutput: 'start\nvalue 5\nafter',
    },
  },
  {
    id: 'world-15-practice-writerun-parse-list',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Put a try and catch inside a loop, add the good numbers, and count the bad ones.',
    conceptTags: ['lesson:exceptions-try', 'try-in-loop', 'number-format-exception', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Parse the List',
    goal: 'Go through a list of texts. Add a bonus to each text that is a number, and count the texts that are not numbers.',
    description: '1. **Write the try block.** Loop over `texts` with `for (t in texts)`. Inside, write `try { ... }`. Add `t.toInt() + bonus` to `total`.\n\n' +
              '2. **Write the catch block.** Add `catch (e: NumberFormatException) { ... }`. Add `1` to `bad`.\n\n' +
              '3. **Print the total.** Print "Total: " plus `total`:\n"Total: 32"\n\n' +
              '4. **Print the bad count.** Print "Bad: " plus `bad`:\n"Bad: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the try block.** Add each number plus `bonus`.',
          '2. **Write the catch block.** Count the bad texts.',
          '3. **Print the total.** Show `total`.',
          '4. **Print the bad count.** Show `bad`.',
        ],
        comments: [
          '// 1. Write the try block. Add each number plus bonus.',
          '// 2. Write the catch block. Count the bad texts.',
          '// 3. Print the total. Show total.',
          '// 4. Print the bad count. Show bad.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the try block.**',
          '2. **Write the catch block.**',
          '3. **Print the total.**',
          '4. **Print the bad count.**',
        ],
        comments: [
          '// 1. Write the try block.',
          '// 2. Write the catch block.',
          '// 3. Print the total.',
          '// 4. Print the bad count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ParseList.kt',
    initialCode: `fun main() {
  val bonus = 10
  val texts = listOf("5", "x", "7", "")

  // 1. Write the try block. Loop over texts with for (t in texts). Inside, write try { ... }. Add t.toInt() + bonus to total.

  // 2. Write the catch block. Add catch (e: NumberFormatException) { ... }. Add 1 to bad.

  // 3. Print the total. Print "Total: " plus total: "Total: 32"

  // 4. Print the bad count. Print "Bad: " plus bad: "Bad: 2"
}`,
    solutionCode: `fun main() {
  val bonus = 10
  val texts = listOf("5", "x", "7", "")
  var total = 0
  var bad = 0
  for (t in texts) {
    try {
      total += t.toInt() + bonus
    } catch (e: NumberFormatException) {
      bad += 1
    }
  }
  println("Total: " + total)
  println("Bad: " + bad)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 32\nBad: 2',
    testCase: { call: '', expected: 'Total: 32\nBad: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '10', alternateLiteral: '0' }],
      alternateExpectedOutput: 'Total: 12\nBad: 2',
    },
  },
  {
    id: 'world-15-practice-writerun-catch-message',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Catch a NumberFormatException and print the reason Kotlin gives.',
    conceptTags: ['lesson:catch', 'catch', 'exception-message', 'number-format-exception'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Catch the Message',
    goal: 'Try to turn a text into a number. When the text is not a number, print the reason from the exception.',
    description: '1. **Write the try block.** Write `try { ... }`. Inside, create `val n` as `text.toInt()`. Print "Number: " plus `n`.\n\n' +
              '2. **Write the catch block.** Add `catch (e: NumberFormatException) { ... }`.\n\n' +
              '3. **Print the reason.** Inside the catch block, print "Not a number: " plus `e.message`:\n"Not a number: For input string: \\"abc\\""',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the try block.** Convert and print the number.',
          '2. **Write the catch block.** Catch `NumberFormatException`.',
          '3. **Print the reason.** Show `e.message`.',
        ],
        comments: [
          '// 1. Write the try block. Convert and print the number.',
          '// 2. Write the catch block. Catch NumberFormatException.',
          '// 3. Print the reason. Show e.message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the try block.**',
          '2. **Write the catch block.**',
          '3. **Print the reason.**',
        ],
        comments: [
          '// 1. Write the try block.',
          '// 2. Write the catch block.',
          '// 3. Print the reason.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CatchMessage.kt',
    initialCode: `fun main() {
  val text = "abc"

  // 1. Write the try block. Write try { ... }. Inside, create val n as text.toInt(). Print "Number: " plus n.

  // 2. Write the catch block. Add catch (e: NumberFormatException) { ... }.

  // 3. Print the reason. Inside the catch block, print "Not a number: " plus e.message: "Not a number: For input string: \\"abc\\""
}`,
    solutionCode: `fun main() {
  val text = "abc"
  try {
    val n = text.toInt()
    println("Number: " + n)
  } catch (e: NumberFormatException) {
    println("Not a number: " + e.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'Not a number: For input string: "abc"',
    testCase: { call: '', expected: 'Not a number: For input string: "abc"' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"abc"', alternateLiteral: '"42"' }],
      alternateExpectedOutput: 'Number: 42',
    },
  },
  {
    id: 'world-15-practice-writerun-age-reader',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Catch only one exception type in a function, and let another one reach the caller.',
    conceptTags: ['lesson:catch', 'catch-by-type', 'exception-propagation', 'number-format-exception'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Age Reader',
    goal: 'Write a function that reads an age. It handles a bad number itself, but lets a negative age travel to the caller. Catch that in main.',
    description: '1. **Write readAge.** Above `main`, write `fun readAge(text: String): Int`. In a `try`, create `val age` as `text.toInt()`. When `age < 0`, throw `IllegalArgumentException("negative age " + age)`. Otherwise return `age`. Add `catch (e: NumberFormatException)` that returns `-1`.\n\n' +
              '2. **Call it three times.** In a `try` block, print `readAge("5")`, `readAge("x")` and `readAge(last.toString())`.\n\n' +
              '3. **Catch the rest.** Add `catch (e: IllegalArgumentException)`. Print "main caught " plus `e.message`:\n"5"\n"-1"\n"main caught negative age -3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write readAge.** Return `-1` for a bad number. Throw for a negative age.',
          '2. **Call it three times.** Print each result inside a `try`.',
          '3. **Catch the rest.** Catch `IllegalArgumentException` in `main`.',
        ],
        comments: [
          '// 1. Write readAge. Return -1 for a bad number. Throw for a negative age.',
          '// 2. Call it three times. Print each result inside a try.',
          '// 3. Catch the rest. Catch IllegalArgumentException in main.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write readAge.**',
          '2. **Call it three times.**',
          '3. **Catch the rest.**',
        ],
        comments: [
          '// 1. Write readAge.',
          '// 2. Call it three times.',
          '// 3. Catch the rest.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AgeReader.kt',
    initialCode: `// 1. Write readAge. Above main, write fun readAge(text: String): Int. In a try, create val age as text.toInt(). When age < 0, throw IllegalArgumentException("negative age " + age). Otherwise return age. Add catch (e: NumberFormatException) that returns -1.

fun main() {
  val last = -3

  // 2. Call it three times. In a try block, print readAge("5"), readAge("x") and readAge(last.toString()).

  // 3. Catch the rest. Add catch (e: IllegalArgumentException). Print "main caught " plus e.message: "5" "-1" "main caught negative age -3"
}`,
    solutionCode: `fun readAge(text: String): Int {
  try {
    val age = text.toInt()
    if (age < 0) {
      throw IllegalArgumentException("negative age " + age)
    }
    return age
  } catch (e: NumberFormatException) {
    return -1
  }
}

fun main() {
  val last = -3
  try {
    println(readAge("5"))
    println(readAge("x"))
    println(readAge(last.toString()))
  } catch (e: IllegalArgumentException) {
    println("main caught " + e.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '5\n-1\nmain caught negative age -3',
    testCase: { call: '', expected: '5\n-1\nmain caught negative age -3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'last', originalLiteral: '-3', alternateLiteral: '4' }],
      alternateExpectedOutput: '5\n-1\n4',
    },
  },
  {
    id: 'world-15-practice-writerun-always-cleanup',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Use finally so a cleanup line runs after a return and after a failure.',
    conceptTags: ['lesson:finally', 'finally', 'return-in-try', 'cleanup'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Always Clean Up',
    goal: 'Write a function that does some work and may fail. A cleanup line must print every time, whether the work works or not.',
    description: '1. **Write run.** Above `main`, write `fun run(fail: Boolean): String`. In a `try`, print "work". When `fail` is true, throw `IllegalStateException("broke")`. Otherwise `return "ok"`. Add a `catch (e: IllegalStateException)` that returns "failed".\n\n' +
              '2. **Add the cleanup.** Add a `finally { ... }` block. Inside, print "cleanup".\n\n' +
              '3. **Call it twice.** Print `run(fail)`, then `run(!fail)`:\n"work"\n"cleanup"\n"ok"\n"work"\n"cleanup"\n"failed"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write run.** Work, then return or throw.',
          '2. **Add the cleanup.** Print in `finally`.',
          '3. **Call it twice.** Use `fail` and `!fail`.',
        ],
        comments: [
          '// 1. Write run. Work, then return or throw.',
          '// 2. Add the cleanup. Print in finally.',
          '// 3. Call it twice. Use fail and !fail.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write run.**',
          '2. **Add the cleanup.**',
          '3. **Call it twice.**',
        ],
        comments: [
          '// 1. Write run.',
          '// 2. Add the cleanup.',
          '// 3. Call it twice.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AlwaysCleanup.kt',
    initialCode: `// 1. Write run. Above main, write fun run(fail: Boolean): String. In a try, print "work". When fail is true, throw IllegalStateException("broke"). Otherwise return "ok". Add a catch (e: IllegalStateException) that returns "failed".

fun main() {
  val fail = false

  // 2. Add the cleanup. Add a finally { ... } block. Inside, print "cleanup".

  // 3. Call it twice. Print run(fail), then run(!fail): "work" "cleanup" "ok" "work" "cleanup" "failed"
}`,
    solutionCode: `fun run(fail: Boolean): String {
  try {
    println("work")
    if (fail) {
      throw IllegalStateException("broke")
    }
    return "ok"
  } catch (e: IllegalStateException) {
    return "failed"
  } finally {
    println("cleanup")
  }
}

fun main() {
  val fail = false
  println(run(fail))
  println(run(!fail))
}`,
    sampleInput: 'main()',
    expectedOutput: 'work\ncleanup\nok\nwork\ncleanup\nfailed',
    testCase: { call: '', expected: 'work\ncleanup\nok\nwork\ncleanup\nfailed' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'fail', originalLiteral: 'false', alternateLiteral: 'true' }],
      alternateExpectedOutput: 'work\ncleanup\nfailed\nwork\ncleanup\nok',
    },
  },
  {
    id: 'world-15-practice-writerun-finally-log',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Build a text log with try, catch and finally, and see the order of the three parts.',
    conceptTags: ['lesson:finally', 'finally', 'try-catch-finally', 'string-log'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Finally Log',
    goal: 'Run three steps. One step fails. Write a log that shows what happened in each step, including the cleanup.',
    description: '1. **Write step.** Above `main`, write `fun step(n: Int, bad: Int): String`. Create `var log = ""`. In a `try`, add "t", `n` and ";" to `log`. When `n == bad`, throw `RuntimeException("x")`. In `catch (e: RuntimeException)`, add "c", `n` and ";". In `finally`, add "f", `n` and ";". Return `log`.\n\n' +
              '2. **Run the steps.** Loop `i` from `1` to `3`. Add `step(i, bad)` to `all`.\n\n' +
              '3. **Print the log.** Print "Log: " plus `all`:\n"Log: t1;f1;t2;c2;f2;t3;f3;"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write step.** Log t, then c if it fails, then f.',
          '2. **Run the steps.** Collect the logs of 1 to 3.',
          '3. **Print the log.** Show `all`.',
        ],
        comments: [
          '// 1. Write step. Log t, then c if it fails, then f.',
          '// 2. Run the steps. Collect the logs of 1 to 3.',
          '// 3. Print the log. Show all.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write step.**',
          '2. **Run the steps.**',
          '3. **Print the log.**',
        ],
        comments: [
          '// 1. Write step.',
          '// 2. Run the steps.',
          '// 3. Print the log.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FinallyLog.kt',
    initialCode: `// 1. Write step. Above main, write fun step(n: Int, bad: Int): String. Create var log = "". In a try, add "t", n and ";" to log. When n == bad, throw RuntimeException("x"). In catch (e: RuntimeException), add "c", n and ";". In finally, add "f", n and ";". Return log.

fun main() {
  val bad = 2
  var all = ""

  // 2. Run the steps. Loop i from 1 to 3. Add step(i, bad) to all.

  // 3. Print the log. Print "Log: " plus all: "Log: t1;f1;t2;c2;f2;t3;f3;"
}`,
    solutionCode: `fun step(n: Int, bad: Int): String {
  var log = ""
  try {
    log += "t" + n + ";"
    if (n == bad) {
      throw RuntimeException("x")
    }
  } catch (e: RuntimeException) {
    log += "c" + n + ";"
  } finally {
    log += "f" + n + ";"
  }
  return log
}

fun main() {
  val bad = 2
  var all = ""
  for (i in 1..3) {
    all += step(i, bad)
  }
  println("Log: " + all)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Log: t1;f1;t2;c2;f2;t3;f3;',
    testCase: { call: '', expected: 'Log: t1;f1;t2;c2;f2;t3;f3;' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bad', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Log: t1;f1;t2;f2;t3;c3;f3;',
    },
  },
  {
    id: 'world-15-practice-writerun-check-ages',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Throw IllegalArgumentException with a clear message when a value is out of range.',
    conceptTags: ['lesson:throw', 'throw', 'illegal-argument-exception', 'validation'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Check the Ages',
    goal: 'Check a list of ages. Throw an error for an age that is too small or too big. Print a line for each age.',
    description: '1. **Write validate.** Above `main`, write `fun validate(age: Int)`. When `age < 0`, throw `IllegalArgumentException("age " + age + " is negative")`. When `age > 120`, throw one with "is too big" in the same way. Otherwise print "valid " plus `age`.\n\n' +
              '2. **Loop over the ages.** Loop over `listOf(30, -5, oldest)`. In each round, call `validate(a)` inside a `try`.\n\n' +
              '3. **Print the errors.** Add `catch (e: IllegalArgumentException)`. Print "error: " plus `e.message`:\n"valid 30"\n"error: age -5 is negative"\n"error: age 130 is too big"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write validate.** Throw for below `0` and above `120`.',
          '2. **Loop over the ages.** Call `validate` in a `try`.',
          '3. **Print the errors.** Show `e.message`.',
        ],
        comments: [
          '// 1. Write validate. Throw for below 0 and above 120.',
          '// 2. Loop over the ages. Call validate in a try.',
          '// 3. Print the errors. Show e.message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write validate.**',
          '2. **Loop over the ages.**',
          '3. **Print the errors.**',
        ],
        comments: [
          '// 1. Write validate.',
          '// 2. Loop over the ages.',
          '// 3. Print the errors.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CheckAges.kt',
    initialCode: `// 1. Write validate. Above main, write fun validate(age: Int). When age < 0, throw IllegalArgumentException("age " + age + " is negative"). When age > 120, throw one with "is too big" in the same way. Otherwise print "valid " plus age.

fun main() {
  val oldest = 130

  // 2. Loop over the ages. Loop over listOf(30, -5, oldest). In each round, call validate(a) inside a try.

  // 3. Print the errors. Add catch (e: IllegalArgumentException). Print "error: " plus e.message: "valid 30" "error: age -5 is negative" "error: age 130 is too big"
}`,
    solutionCode: `fun validate(age: Int) {
  if (age < 0) {
    throw IllegalArgumentException("age " + age + " is negative")
  }
  if (age > 120) {
    throw IllegalArgumentException("age " + age + " is too big")
  }
  println("valid " + age)
}

fun main() {
  val oldest = 130
  for (a in listOf(30, -5, oldest)) {
    try {
      validate(a)
    } catch (e: IllegalArgumentException) {
      println("error: " + e.message)
    }
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'valid 30\nerror: age -5 is negative\nerror: age 130 is too big',
    testCase: { call: '', expected: 'valid 30\nerror: age -5 is negative\nerror: age 130 is too big' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'oldest', originalLiteral: '130', alternateLiteral: '100' }],
      alternateExpectedOutput: 'valid 30\nerror: age -5 is negative\nvalid 100',
    },
  },
  {
    id: 'world-15-practice-writerun-wrap-and-throw',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Catch one exception and throw a new one with a clearer message.',
    conceptTags: ['lesson:throw', 'throw', 'catch-and-rethrow', 'new-message'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Wrap and Throw',
    goal: 'Write a function that reads an id. When the text is not a number, it throws a new error that names the bad text. Catch that error in main.',
    description: '1. **Write parseId.** Above `main`, write `fun parseId(text: String): Int`. In a `try`, return `text.toInt()`. In `catch (e: NumberFormatException)`, throw `IllegalArgumentException("bad id: " + text)`.\n\n' +
              '2. **Call it.** In a `try` block in `main`, print `parseId("12")`, then `parseId(id)`.\n\n' +
              '3. **Catch the new error.** Add `catch (e: IllegalArgumentException)`. Print `e.message`:\n"12"\n"bad id: x7"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write parseId.** Catch the parse error and throw a clearer one.',
          '2. **Call it.** Use `"12"` and `id`.',
          '3. **Catch the new error.** Print the message.',
        ],
        comments: [
          '// 1. Write parseId. Catch the parse error and throw a clearer one.',
          '// 2. Call it. Use "12" and id.',
          '// 3. Catch the new error. Print the message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write parseId.**',
          '2. **Call it.**',
          '3. **Catch the new error.**',
        ],
        comments: [
          '// 1. Write parseId.',
          '// 2. Call it.',
          '// 3. Catch the new error.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WrapAndThrow.kt',
    initialCode: `// 1. Write parseId. Above main, write fun parseId(text: String): Int. In a try, return text.toInt(). In catch (e: NumberFormatException), throw IllegalArgumentException("bad id: " + text).

fun main() {
  val id = "x7"

  // 2. Call it. In a try block in main, print parseId("12"), then parseId(id).

  // 3. Catch the new error. Add catch (e: IllegalArgumentException). Print e.message: "12" "bad id: x7"
}`,
    solutionCode: `fun parseId(text: String): Int {
  try {
    return text.toInt()
  } catch (e: NumberFormatException) {
    throw IllegalArgumentException("bad id: " + text)
  }
}

fun main() {
  val id = "x7"
  try {
    println(parseId("12"))
    println(parseId(id))
  } catch (e: IllegalArgumentException) {
    println(e.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '12\nbad id: x7',
    testCase: { call: '', expected: '12\nbad id: x7' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'id', originalLiteral: '"x7"', alternateLiteral: '"9"' }],
      alternateExpectedOutput: '12\n9',
    },
  },
  {
    id: 'world-15-practice-writerun-two-catches',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Write two catch blocks for two different exceptions and see which one runs.',
    conceptTags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'illegal-state', 'illegal-argument'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Two Catches',
    goal: 'A function can fail in two ways. Handle each way with its own catch block. Call it three times.',
    description: '1. **Write the try block.** Above `main`, write `fun run(n: Int)`. In a `try`, throw `IllegalStateException("state")` when `n == 1`. Throw `IllegalArgumentException("arg")` when `n == 2`. Otherwise print "fine " plus `n`.\n\n' +
              '2. **Catch the argument error.** Add `catch (e: IllegalArgumentException)`. Print "IAE " plus `e.message`.\n\n' +
              '3. **Catch the state error.** Add `catch (e: IllegalStateException)`. Print "ISE " plus `e.message`.\n\n' +
              '4. **Call it three times.** Call `run(first)`, `run(first + 1)` and `run(first + 2)`:\n"ISE state"\n"IAE arg"\n"fine 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the try block.** Throw for `1` and `2`.',
          '2. **Catch the argument error.** Print "IAE " and the message.',
          '3. **Catch the state error.** Print "ISE " and the message.',
          '4. **Call it three times.** Start at `first`.',
        ],
        comments: [
          '// 1. Write the try block. Throw for 1 and 2.',
          '// 2. Catch the argument error. Print "IAE " and the message.',
          '// 3. Catch the state error. Print "ISE " and the message.',
          '// 4. Call it three times. Start at first.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the try block.**',
          '2. **Catch the argument error.**',
          '3. **Catch the state error.**',
          '4. **Call it three times.**',
        ],
        comments: [
          '// 1. Write the try block.',
          '// 2. Catch the argument error.',
          '// 3. Catch the state error.',
          '// 4. Call it three times.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TwoCatches.kt',
    initialCode: `// 1. Write the try block. Above main, write fun run(n: Int). In a try, throw IllegalStateException("state") when n == 1. Throw IllegalArgumentException("arg") when n == 2. Otherwise print "fine " plus n.

fun main() {
  val first = 1

  // 2. Catch the argument error. Add catch (e: IllegalArgumentException). Print "IAE " plus e.message.

  // 3. Catch the state error. Add catch (e: IllegalStateException). Print "ISE " plus e.message.

  // 4. Call it three times. Call run(first), run(first + 1) and run(first + 2): "ISE state" "IAE arg" "fine 3"
}`,
    solutionCode: `fun run(n: Int) {
  try {
    if (n == 1) {
      throw IllegalStateException("state")
    }
    if (n == 2) {
      throw IllegalArgumentException("arg")
    }
    println("fine " + n)
  } catch (e: IllegalArgumentException) {
    println("IAE " + e.message)
  } catch (e: IllegalStateException) {
    println("ISE " + e.message)
  }
}

fun main() {
  val first = 1
  run(first)
  run(first + 1)
  run(first + 2)
}`,
    sampleInput: 'main()',
    expectedOutput: 'ISE state\nIAE arg\nfine 3',
    testCase: { call: '', expected: 'ISE state\nIAE arg\nfine 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'first', originalLiteral: '1', alternateLiteral: '2' }],
      alternateExpectedOutput: 'IAE arg\nfine 3\nfine 4',
    },
  },
  {
    id: 'world-15-practice-writerun-catch-order',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Put the specific catch before the general catch, using your own exception classes.',
    conceptTags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'catch-order', 'exception-hierarchy'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Catch Order',
    goal: 'A search can fail in two ways. A missing item has its own handling. Any other app error has general handling. Show that the order matters.',
    description: 'The open class `AppError` is in the starter code.\n\n' +
              '1. **Write the error classes.** Above `main`, write `class NotFound(val id: Int)` that extends `AppError("missing " + id)`. Write `class Invalid(val field: String)` that extends `AppError("bad " + field)`.\n\n' +
              '2. **Write find.** Write `fun find(id: Int): String`. Throw `Invalid("id")` when `id == 0`. Throw `NotFound(id)` when `id > 3`. Otherwise return "item" plus `id`.\n\n' +
              '3. **Loop and try.** Loop over `listOf(1, 0, missing)`. In each round, print `find(i)` inside a `try`.\n\n' +
              '4. **Write the catches.** First catch `NotFound` and print "nf " plus `e.id`. Then catch `AppError` and print "app " plus `e.message`:\n"item1"\n"app bad id"\n"nf 5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the error classes.** Extend `AppError`.',
          '2. **Write find.** Throw by the id.',
          '3. **Loop and try.** Print the result of `find`.',
          '4. **Write the catches.** The specific one comes first.',
        ],
        comments: [
          '// 1. Write the error classes. Extend AppError.',
          '// 2. Write find. Throw by the id.',
          '// 3. Loop and try. Print the result of find.',
          '// 4. Write the catches. The specific one comes first.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the error classes.**',
          '2. **Write find.**',
          '3. **Loop and try.**',
          '4. **Write the catches.**',
        ],
        comments: [
          '// 1. Write the error classes.',
          '// 2. Write find.',
          '// 3. Loop and try.',
          '// 4. Write the catches.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CatchOrder.kt',
    initialCode: `open class AppError(message: String) : Exception(message)

// 1. Write the error classes. Above main, write class NotFound(val id: Int) that extends AppError("missing " + id). Write class Invalid(val field: String) that extends AppError("bad " + field).

fun main() {
  val missing = 5

  // 2. Write find. Write fun find(id: Int): String. Throw Invalid("id") when id == 0. Throw NotFound(id) when id > 3. Otherwise return "item" plus id.

  // 3. Loop and try. Loop over listOf(1, 0, missing). In each round, print find(i) inside a try.

  // 4. Write the catches. First catch NotFound and print "nf " plus e.id. Then catch AppError and print "app " plus e.message: "item1" "app bad id" "nf 5"
}`,
    solutionCode: `open class AppError(message: String) : Exception(message)

class NotFound(val id: Int) : AppError("missing " + id)

class Invalid(val field: String) : AppError("bad " + field)

fun find(id: Int): String {
  if (id == 0) {
    throw Invalid("id")
  }
  if (id > 3) {
    throw NotFound(id)
  }
  return "item" + id
}

fun main() {
  val missing = 5
  for (i in listOf(1, 0, missing)) {
    try {
      println(find(i))
    } catch (e: NotFound) {
      println("nf " + e.id)
    } catch (e: AppError) {
      println("app " + e.message)
    }
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'item1\napp bad id\nnf 5',
    testCase: { call: '', expected: 'item1\napp bad id\nnf 5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'missing', originalLiteral: '5', alternateLiteral: '2' }],
      alternateExpectedOutput: 'item1\napp bad id\nitem2',
    },
  },
  {
    id: 'world-15-practice-writerun-parse-or',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Use try as an expression that gives a value, with a fallback in catch.',
    conceptTags: ['lesson:try-as-an-expression', 'try-expression', 'fallback-value', 'return-try'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Parse or Fallback',
    goal: 'Write a function that turns a text into a number. When it fails, it gives a fallback value instead. Try it three times.',
    description: '1. **Write parse.** Above `main`, write `fun parse(text: String, fallback: Int): Int`. Use `return try { ... } catch (...) { ... }`. The try part is `text.toInt()`. The catch part for `NumberFormatException` is `fallback`.\n\n' +
              '2. **Parse a good number.** Print `parse("42", fallback)`:\n"42"\n\n' +
              '3. **Parse bad text.** Print `parse("x", fallback)`:\n"5"\n\n' +
              '4. **Parse with a bigger fallback.** Print `parse("", fallback + 10)`:\n"15"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write parse.** Return a `try` expression with a fallback.',
          '2. **Parse a good number.** Use `"42"`.',
          '3. **Parse bad text.** Use `"x"`.',
          '4. **Parse with a bigger fallback.** Use `fallback + 10`.',
        ],
        comments: [
          '// 1. Write parse. Return a try expression with a fallback.',
          '// 2. Parse a good number. Use "42".',
          '// 3. Parse bad text. Use "x".',
          '// 4. Parse with a bigger fallback. Use fallback + 10.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write parse.**',
          '2. **Parse a good number.**',
          '3. **Parse bad text.**',
          '4. **Parse with a bigger fallback.**',
        ],
        comments: [
          '// 1. Write parse.',
          '// 2. Parse a good number.',
          '// 3. Parse bad text.',
          '// 4. Parse with a bigger fallback.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ParseOr.kt',
    initialCode: `// 1. Write parse. Above main, write fun parse(text: String, fallback: Int): Int. Use return try { ... } catch (...) { ... }. The try part is text.toInt(). The catch part for NumberFormatException is fallback.

fun main() {
  val fallback = 5

  // 2. Parse a good number. Print parse("42", fallback): "42"

  // 3. Parse bad text. Print parse("x", fallback): "5"

  // 4. Parse with a bigger fallback. Print parse("", fallback + 10): "15"
}`,
    solutionCode: `fun parse(text: String, fallback: Int): Int {
  return try {
    text.toInt()
  } catch (e: NumberFormatException) {
    fallback
  }
}

fun main() {
  val fallback = 5
  println(parse("42", fallback))
  println(parse("x", fallback))
  println(parse("", fallback + 10))
}`,
    sampleInput: 'main()',
    expectedOutput: '42\n5\n15',
    testCase: { call: '', expected: '42\n5\n15' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'fallback', originalLiteral: '5', alternateLiteral: '0' }],
      alternateExpectedOutput: '42\n0\n10',
    },
  },
  {
    id: 'world-15-practice-writerun-load-item',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Use try as an expression together with finally, and build a log of what ran.',
    conceptTags: ['lesson:try-as-an-expression', 'try-expression', 'finally', 'value-and-log'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Load an Item',
    goal: 'Write a function that loads an item. A negative id is an error. Return the item and a log of what ran.',
    description: '1. **Write load.** Above `main`, write `fun load(id: Int): String`. Create `var log = ""`. Create `val r` as a `try` expression. In the `try`, add "t;" to `log`. When `id < 0`, throw `IllegalArgumentException("neg")`. The last line is "item" plus `id`. In the `catch`, add "c;" and make the last line "none". In `finally`, add "f;". Return `r`, a space and `log`.\n\n' +
              '2. **Load a good id.** Print `load(id)`:\n"item3 t;f;"\n\n' +
              '3. **Load a bad id.** Print `load(-id)`:\n"none t;c;f;"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write load.** A `try` expression with a catch, a finally and a log.',
          '2. **Load a good id.** Use `id`.',
          '3. **Load a bad id.** Use `-id`.',
        ],
        comments: [
          '// 1. Write load. A try expression with a catch, a finally and a log.',
          '// 2. Load a good id. Use id.',
          '// 3. Load a bad id. Use -id.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write load.**',
          '2. **Load a good id.**',
          '3. **Load a bad id.**',
        ],
        comments: [
          '// 1. Write load.',
          '// 2. Load a good id.',
          '// 3. Load a bad id.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LoadItem.kt',
    initialCode: `// 1. Write load. Above main, write fun load(id: Int): String. Create var log = "". Create val r as a try expression. In the try, add "t;" to log. When id < 0, throw IllegalArgumentException("neg"). The last line is "item" plus id. In the catch, add "c;" and make the last line "none". In finally, add "f;". Return r, a space and log.

fun main() {
  val id = 3

  // 2. Load a good id. Print load(id): "item3 t;f;"

  // 3. Load a bad id. Print load(-id): "none t;c;f;"
}`,
    solutionCode: `fun load(id: Int): String {
  var log = ""
  val r = try {
    log += "t;"
    if (id < 0) {
      throw IllegalArgumentException("neg")
    }
    "item" + id
  } catch (e: IllegalArgumentException) {
    log += "c;"
    "none"
  } finally {
    log += "f;"
  }
  return r + " " + log
}

fun main() {
  val id = 3
  println(load(id))
  println(load(-id))
}`,
    sampleInput: 'main()',
    expectedOutput: 'item3 t;f;\nnone t;c;f;',
    testCase: { call: '', expected: 'item3 t;f;\nnone t;c;f;' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'id', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'item5 t;f;\nnone t;c;f;',
    },
  },
  {
    id: 'world-15-practice-writerun-out-of-stock',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Write your own exception class that carries extra data and a message.',
    conceptTags: ['lesson:custom-exceptions', 'custom-exception', 'exception-property', 'message'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Out of Stock',
    goal: 'A shop cannot sell more than it has. Write an exception that says what is short, and use it when someone wants too many.',
    description: '1. **Write the exception.** Above `main`, write `class OutOfStock(val item: String, val missing: Int)`. It extends `Exception("no " + item + ": " + missing + " short")`.\n\n' +
              '2. **Write take.** Write `fun take(stock: Int, want: Int): Int`. When `want > stock`, throw `OutOfStock("pen", want - stock)`. Otherwise return `stock - want`.\n\n' +
              '3. **Use it.** In a `try` block, print `take(10, 4)`, then `take(10, want + 3)`. Add `catch (e: OutOfStock)`. Print `e.message`, then "missing " plus `e.missing`:\n"6"\n"no pen: 1 short"\n"missing 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the exception.** Add `item`, `missing` and a message.',
          '2. **Write take.** Throw when `want > stock`.',
          '3. **Use it.** Call `take` twice and catch `OutOfStock`.',
        ],
        comments: [
          '// 1. Write the exception. Add item, missing and a message.',
          '// 2. Write take. Throw when want > stock.',
          '// 3. Use it. Call take twice and catch OutOfStock.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the exception.**',
          '2. **Write take.**',
          '3. **Use it.**',
        ],
        comments: [
          '// 1. Write the exception.',
          '// 2. Write take.',
          '// 3. Use it.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OutOfStock.kt',
    initialCode: `// 1. Write the exception. Above main, write class OutOfStock(val item: String, val missing: Int). It extends Exception("no " + item + ": " + missing + " short").

// 2. Write take. Write fun take(stock: Int, want: Int): Int. When want > stock, throw OutOfStock("pen", want - stock). Otherwise return stock - want.

fun main() {
  val want = 8

  // 3. Use it. In a try block, print take(10, 4), then take(10, want + 3). Add catch (e: OutOfStock). Print e.message, then "missing " plus e.missing: "6" "no pen: 1 short" "missing 1"
}`,
    solutionCode: `class OutOfStock(val item: String, val missing: Int) : Exception("no " + item + ": " + missing + " short")

fun take(stock: Int, want: Int): Int {
  if (want > stock) {
    throw OutOfStock("pen", want - stock)
  }
  return stock - want
}

fun main() {
  val want = 8
  try {
    println(take(10, 4))
    println(take(10, want + 3))
  } catch (e: OutOfStock) {
    println(e.message)
    println("missing " + e.missing)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '6\nno pen: 1 short\nmissing 1',
    testCase: { call: '', expected: '6\nno pen: 1 short\nmissing 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'want', originalLiteral: '8', alternateLiteral: '0' }],
      alternateExpectedOutput: '6\n7',
    },
  },
  {
    id: 'world-15-practice-writerun-app-errors',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Write two subclasses of one base exception and catch them with the base class.',
    conceptTags: ['lesson:custom-exceptions', 'custom-exception', 'exception-hierarchy', 'open-class'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'App Errors',
    goal: 'An app has its own kinds of errors. Write two kinds, throw them from one function, and handle them in one place.',
    description: 'The open class `AppError` is in the starter code.\n\n' +
              '1. **Write NotFound.** Above `main`, write `class NotFound(val id: Int)`. It extends `AppError("missing " + id)`.\n\n' +
              '2. **Write Invalid and fail.** Write `class Invalid(val field: String)` that extends `AppError("bad " + field)`. Write `fun fail(code: Int)`. Throw `NotFound(code * 10)` for code `1`. Throw `Invalid("name")` for code `2`. Otherwise print "fine".\n\n' +
              '3. **Loop.** Loop `c` from `1` to `3`. In each round, call `fail(c + shift)` inside a `try`.\n\n' +
              '4. **Catch the base class.** Add `catch (e: AppError)`. Print `e.message`:\n"missing 10"\n"bad name"\n"fine"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write NotFound.** Extend `AppError`.',
          '2. **Write Invalid and fail.** Throw by the code.',
          '3. **Loop.** Call `fail` three times.',
          '4. **Catch the base class.** Print the message.',
        ],
        comments: [
          '// 1. Write NotFound. Extend AppError.',
          '// 2. Write Invalid and fail. Throw by the code.',
          '// 3. Loop. Call fail three times.',
          '// 4. Catch the base class. Print the message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write NotFound.**',
          '2. **Write Invalid and fail.**',
          '3. **Loop.**',
          '4. **Catch the base class.**',
        ],
        comments: [
          '// 1. Write NotFound.',
          '// 2. Write Invalid and fail.',
          '// 3. Loop.',
          '// 4. Catch the base class.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AppErrors.kt',
    initialCode: `open class AppError(message: String) : Exception(message)

// 1. Write NotFound. Above main, write class NotFound(val id: Int). It extends AppError("missing " + id).

// 2. Write Invalid and fail. Write class Invalid(val field: String) that extends AppError("bad " + field). Write fun fail(code: Int). Throw NotFound(code * 10) for code 1. Throw Invalid("name") for code 2. Otherwise print "fine".

fun main() {
  val shift = 0

  // 3. Loop. Loop c from 1 to 3. In each round, call fail(c + shift) inside a try.

  // 4. Catch the base class. Add catch (e: AppError). Print e.message: "missing 10" "bad name" "fine"
}`,
    solutionCode: `open class AppError(message: String) : Exception(message)

class NotFound(val id: Int) : AppError("missing " + id)

class Invalid(val field: String) : AppError("bad " + field)

fun fail(code: Int) {
  if (code == 1) {
    throw NotFound(code * 10)
  }
  if (code == 2) {
    throw Invalid("name")
  }
  println("fine")
}

fun main() {
  val shift = 0
  for (c in 1..3) {
    try {
      fail(c + shift)
    } catch (e: AppError) {
      println(e.message)
    }
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'missing 10\nbad name\nfine',
    testCase: { call: '', expected: 'missing 10\nbad name\nfine' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'shift', originalLiteral: '0', alternateLiteral: '1' }],
      alternateExpectedOutput: 'bad name\nfine\nfine',
    },
  },
  {
    id: 'world-15-practice-writerun-no-forced-catch',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'See that Kotlin does not force you to catch exceptions, and catch one when you choose to.',
    conceptTags: ['lesson:checked-vs-unchecked-exception-model', 'unchecked-exceptions', 'optional-catch', 'exception'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'No Forced Catch',
    goal: 'Call a function that can throw. Use it without a try when it works, and with a try when you want to handle the failure.',
    description: '1. **Write load.** Above `main`, write `fun load(name: String): String`. When `name.isEmpty()`, throw `Exception("empty name")`. Otherwise return `name.uppercase()`.\n\n' +
              '2. **Call it without a try.** Print `load(name)`. Kotlin does not force a `try` here:\n"ADA"\n\n' +
              '3. **Call it with a try.** Print `load("")` inside a `try`. Add `catch (e: Exception)`. Print "failed: " plus `e.message`:\n"failed: empty name"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write load.** Throw for an empty name.',
          '2. **Call it without a try.** Print `load(name)`.',
          '3. **Call it with a try.** Catch the failure.',
        ],
        comments: [
          '// 1. Write load. Throw for an empty name.',
          '// 2. Call it without a try. Print load(name).',
          '// 3. Call it with a try. Catch the failure.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write load.**',
          '2. **Call it without a try.**',
          '3. **Call it with a try.**',
        ],
        comments: [
          '// 1. Write load.',
          '// 2. Call it without a try.',
          '// 3. Call it with a try.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NoForcedCatch.kt',
    initialCode: `// 1. Write load. Above main, write fun load(name: String): String. When name.isEmpty(), throw Exception("empty name"). Otherwise return name.uppercase().

fun main() {
  val name = "ada"

  // 2. Call it without a try. Print load(name). Kotlin does not force a try here: "ADA"

  // 3. Call it with a try. Print load("") inside a try. Add catch (e: Exception). Print "failed: " plus e.message: "failed: empty name"
}`,
    solutionCode: `fun load(name: String): String {
  if (name.isEmpty()) {
    throw Exception("empty name")
  }
  return name.uppercase()
}

fun main() {
  val name = "ada"
  println(load(name))
  try {
    println(load(""))
  } catch (e: Exception) {
    println("failed: " + e.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'ADA\nfailed: empty name',
    testCase: { call: '', expected: 'ADA\nfailed: empty name' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'name', originalLiteral: '"ada"', alternateLiteral: '"bo"' }],
      alternateExpectedOutput: 'BO\nfailed: empty name',
    },
  },
  {
    id: 'world-15-practice-writerun-pick-item',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Handle two different unchecked exceptions with two different messages.',
    conceptTags: ['lesson:checked-vs-unchecked-exception-model', 'handle-what-you-can', 'specific-catch', 'index-out-of-bounds'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pick an Item',
    goal: 'Pick an item by a text index. A text that is not a number and an index that is too big are different problems. Give each its own answer.',
    description: '1. **Write pick.** Above `main`, write `fun pick(items: List<String>, text: String): String`. In a `try`, return `items[text.toInt()]`. Add `catch (e: NumberFormatException)` that returns "bad index". Add `catch (e: IndexOutOfBoundsException)` that returns "no such item".\n\n' +
              '2. **Try a good index.** Print `pick(items, n)`:\n"b"\n\n' +
              '3. **Try a bad number.** Print `pick(items, "x")`:\n"bad index"\n\n' +
              '4. **Try an index that is too big.** Print `pick(items, "7")`:\n"no such item"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write pick.** Two catch blocks for two exceptions.',
          '2. **Try a good index.** Use `n`.',
          '3. **Try a bad number.** Use `"x"`.',
          '4. **Try an index that is too big.** Use `"7"`.',
        ],
        comments: [
          '// 1. Write pick. Two catch blocks for two exceptions.',
          '// 2. Try a good index. Use n.',
          '// 3. Try a bad number. Use "x".',
          '// 4. Try an index that is too big. Use "7".',
        ],
      },
      experienced: {
        steps: [
          '1. **Write pick.**',
          '2. **Try a good index.**',
          '3. **Try a bad number.**',
          '4. **Try an index that is too big.**',
        ],
        comments: [
          '// 1. Write pick.',
          '// 2. Try a good index.',
          '// 3. Try a bad number.',
          '// 4. Try an index that is too big.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PickItem.kt',
    initialCode: `// 1. Write pick. Above main, write fun pick(items: List<String>, text: String): String. In a try, return items[text.toInt()]. Add catch (e: NumberFormatException) that returns "bad index". Add catch (e: IndexOutOfBoundsException) that returns "no such item".

fun main() {
  val n = "1"
  val items = listOf("a", "b", "c")

  // 2. Try a good index. Print pick(items, n): "b"

  // 3. Try a bad number. Print pick(items, "x"): "bad index"

  // 4. Try an index that is too big. Print pick(items, "7"): "no such item"
}`,
    solutionCode: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: NumberFormatException) {
    return "bad index"
  } catch (e: IndexOutOfBoundsException) {
    return "no such item"
  }
}

fun main() {
  val n = "1"
  val items = listOf("a", "b", "c")
  println(pick(items, n))
  println(pick(items, "x"))
  println(pick(items, "7"))
}`,
    sampleInput: 'main()',
    expectedOutput: 'b\nbad index\nno such item',
    testCase: { call: '', expected: 'b\nbad index\nno such item' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '"1"', alternateLiteral: '"9"' }],
      alternateExpectedOutput: 'no such item\nbad index\nno such item',
    },
  },
  {
    id: 'world-15-practice-writerun-safe-div-result',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Return a Result from a function and read it with getOrNull, getOrElse and exceptionOrNull.',
    conceptTags: ['lesson:result', 'result', 'getOrNull', 'getOrElse', 'exceptionOrNull'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Safe Divide Result',
    goal: 'Write a division that returns a Result instead of throwing. Read the result in three ways.',
    description: '1. **Write safeDiv.** Above `main`, write `fun safeDiv(a: Int, b: Int): Result<Int>`. When `b == 0`, return `Result.failure(ArithmeticException("div by zero"))`. Otherwise return `Result.success(a / b)`.\n\n' +
              '2. **Read a success.** Print `safeDiv(10, d).getOrNull()`:\n"5"\n\n' +
              '3. **Read a failure with a default.** Print `safeDiv(1, 0).getOrElse { -1 }`:\n"-1"\n\n' +
              '4. **Read the failure message.** Print `safeDiv(1, 0).exceptionOrNull()?.message`:\n"div by zero"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write safeDiv.** Return `Result.failure` or `Result.success`.',
          '2. **Read a success.** Use `getOrNull()`.',
          '3. **Read a failure with a default.** Use `getOrElse`.',
          '4. **Read the failure message.** Use `exceptionOrNull()`.',
        ],
        comments: [
          '// 1. Write safeDiv. Return Result.failure or Result.success.',
          '// 2. Read a success. Use getOrNull().',
          '// 3. Read a failure with a default. Use getOrElse.',
          '// 4. Read the failure message. Use exceptionOrNull().',
        ],
      },
      experienced: {
        steps: [
          '1. **Write safeDiv.**',
          '2. **Read a success.**',
          '3. **Read a failure with a default.**',
          '4. **Read the failure message.**',
        ],
        comments: [
          '// 1. Write safeDiv.',
          '// 2. Read a success.',
          '// 3. Read a failure with a default.',
          '// 4. Read the failure message.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SafeDivResult.kt',
    initialCode: `// 1. Write safeDiv. Above main, write fun safeDiv(a: Int, b: Int): Result<Int>. When b == 0, return Result.failure(ArithmeticException("div by zero")). Otherwise return Result.success(a / b).

fun main() {
  val d = 2

  // 2. Read a success. Print safeDiv(10, d).getOrNull(): "5"

  // 3. Read a failure with a default. Print safeDiv(1, 0).getOrElse { -1 }: "-1"

  // 4. Read the failure message. Print safeDiv(1, 0).exceptionOrNull()?.message: "div by zero"
}`,
    solutionCode: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 2
  println(safeDiv(10, d).getOrNull())
  println(safeDiv(1, 0).getOrElse { -1 })
  println(safeDiv(1, 0).exceptionOrNull()?.message)
}`,
    sampleInput: 'main()',
    expectedOutput: '5\n-1\ndiv by zero',
    testCase: { call: '', expected: '5\n-1\ndiv by zero' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'd', originalLiteral: '2', alternateLiteral: '5' }],
      alternateExpectedOutput: '2\n-1\ndiv by zero',
    },
  },
  {
    id: 'world-15-practice-writerun-result-checks',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Count the successes and failures in a list of Results, and add up the good values.',
    conceptTags: ['lesson:result', 'result', 'isSuccess', 'isFailure', 'list-of-results'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Result Checks',
    goal: 'Divide three pairs of numbers. Count how many divisions worked and how many failed, and add up the answers that worked.',
    description: 'The function `safeDiv(a, b): Result<Int>` is in the starter code.\n\n' +
              '1. **Make the results.** Create `val results` with `safeDiv(8, d)`, `safeDiv(8, 0)` and `safeDiv(9, d)`.\n\n' +
              '2. **Count the successes.** Create `val successes` with `results.count { it.isSuccess }`. Create `val failures` as `results.size - successes`.\n\n' +
              '3. **Add the good values.** Create `var sum = 0`. Loop over `results`. Add `r.getOrDefault(0)` to `sum`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Successes: 2"\n"Failures: 1"\n"Sum: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make the results.** Three divisions.',
          '2. **Count the successes.** Use `isSuccess`.',
          '3. **Add the good values.** Use `getOrDefault(0)`.',
          '4. **Print three lines.** Show both counts and the sum.',
        ],
        comments: [
          '// 1. Make the results. Three divisions.',
          '// 2. Count the successes. Use isSuccess.',
          '// 3. Add the good values. Use getOrDefault(0).',
          '// 4. Print three lines. Show both counts and the sum.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make the results.**',
          '2. **Count the successes.**',
          '3. **Add the good values.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Make the results.',
          '// 2. Count the successes.',
          '// 3. Add the good values.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ResultChecks.kt',
    initialCode: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 4

  // 1. Make the results. Create val results with safeDiv(8, d), safeDiv(8, 0) and safeDiv(9, d).

  // 2. Count the successes. Create val successes with results.count { it.isSuccess }. Create val failures as results.size - successes.

  // 3. Add the good values. Create var sum = 0. Loop over results. Add r.getOrDefault(0) to sum.

  // 4. Print three lines. Join the text with +: "Successes: 2" "Failures: 1" "Sum: 4"
}`,
    solutionCode: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 4
  val results = listOf(safeDiv(8, d), safeDiv(8, 0), safeDiv(9, d))
  val successes = results.count { it.isSuccess }
  val failures = results.size - successes
  var sum = 0
  for (r in results) {
    sum += r.getOrDefault(0)
  }
  println("Successes: " + successes)
  println("Failures: " + failures)
  println("Sum: " + sum)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Successes: 2\nFailures: 1\nSum: 4',
    testCase: { call: '', expected: 'Successes: 2\nFailures: 1\nSum: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'd', originalLiteral: '4', alternateLiteral: '0' }],
      alternateExpectedOutput: 'Successes: 0\nFailures: 3\nSum: 0',
    },
  },
  {
    id: 'world-15-practice-writerun-catching-parse',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Use runCatching to turn a parse that may fail into a Result.',
    conceptTags: ['lesson:runcatching', 'runCatching', 'isSuccess', 'getOrNull', 'getOrElse'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Catching a Parse',
    goal: 'Parse two texts with runCatching. Ask each result if it worked, and read its value in two ways.',
    description: '1. **Make two results.** Create `val a` with `runCatching { text.toInt() }`. Create `val b` with `runCatching { "zz".toInt() }`.\n\n' +
              '2. **Ask if they worked.** Print `a.isSuccess`, then `b.isFailure`:\n"true"\n"true"\n\n' +
              '3. **Read the values.** Print `a.getOrNull()`, then `b.getOrNull()`, then `b.getOrElse { -1 }`:\n"12"\n"null"\n"-1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make two results.** Use `runCatching`.',
          '2. **Ask if they worked.** Use `isSuccess` and `isFailure`.',
          '3. **Read the values.** Use `getOrNull` and `getOrElse`.',
        ],
        comments: [
          '// 1. Make two results. Use runCatching.',
          '// 2. Ask if they worked. Use isSuccess and isFailure.',
          '// 3. Read the values. Use getOrNull and getOrElse.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make two results.**',
          '2. **Ask if they worked.**',
          '3. **Read the values.**',
        ],
        comments: [
          '// 1. Make two results.',
          '// 2. Ask if they worked.',
          '// 3. Read the values.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CatchingParse.kt',
    initialCode: `fun main() {
  val text = "12"

  // 1. Make two results. Create val a with runCatching { text.toInt() }. Create val b with runCatching { "zz".toInt() }.

  // 2. Ask if they worked. Print a.isSuccess, then b.isFailure: "true" "true"

  // 3. Read the values. Print a.getOrNull(), then b.getOrNull(), then b.getOrElse { -1 }: "12" "null" "-1"
}`,
    solutionCode: `fun main() {
  val text = "12"
  val a = runCatching { text.toInt() }
  val b = runCatching { "zz".toInt() }
  println(a.isSuccess)
  println(b.isFailure)
  println(a.getOrNull())
  println(b.getOrNull())
  println(b.getOrElse { -1 })
}`,
    sampleInput: 'main()',
    expectedOutput: 'true\ntrue\n12\nnull\n-1',
    testCase: { call: '', expected: 'true\ntrue\n12\nnull\n-1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"12"', alternateLiteral: '"x"' }],
      alternateExpectedOutput: 'false\ntrue\nnull\nnull\n-1',
    },
  },
  {
    id: 'world-15-practice-writerun-chain-result',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Chain map, onSuccess and onFailure on a Result, and use recover to repair a failure.',
    conceptTags: ['lesson:runcatching', 'runCatching', 'map', 'onSuccess', 'onFailure', 'recover'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Chain a Result',
    goal: 'Parse a text, double the number, and log what happened. Then repair a failed parse with a default value.',
    description: '1. **Build the chain.** Create `val r` with `runCatching { text.toInt() }`. Add `.map { it * 2 }`.\n\n' +
              '2. **Log the outcome.** Add `.onSuccess { ... }` that adds "ok ", `it` and ";" to `log`. Add `.onFailure { ... }` that adds "fail;".\n\n' +
              '3. **Read and repair.** Create `val value` with `r.getOrElse { 0 }`. Create `val rec` with `runCatching { "q".toInt() }.recover { -5 }`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Value: 40"\n"Log: ok 40;"\n"Recovered: -5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the chain.** Use `runCatching` and `map`.',
          '2. **Log the outcome.** Use `onSuccess` and `onFailure`.',
          '3. **Read and repair.** Use `getOrElse` and `recover`.',
          '4. **Print three lines.** Show the value, the log and the repair.',
        ],
        comments: [
          '// 1. Build the chain. Use runCatching and map.',
          '// 2. Log the outcome. Use onSuccess and onFailure.',
          '// 3. Read and repair. Use getOrElse and recover.',
          '// 4. Print three lines. Show the value, the log and the repair.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the chain.**',
          '2. **Log the outcome.**',
          '3. **Read and repair.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Build the chain.',
          '// 2. Log the outcome.',
          '// 3. Read and repair.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ChainResult.kt',
    initialCode: `fun main() {
  val text = "20"
  var log = ""

  // 1. Build the chain. Create val r with runCatching { text.toInt() }. Add .map { it * 2 }.

  // 2. Log the outcome. Add .onSuccess { ... } that adds "ok ", it and ";" to log. Add .onFailure { ... } that adds "fail;".

  // 3. Read and repair. Create val value with r.getOrElse { 0 }. Create val rec with runCatching { "q".toInt() }.recover { -5 }.

  // 4. Print three lines. Join the text with +: "Value: 40" "Log: ok 40;" "Recovered: -5"
}`,
    solutionCode: `fun main() {
  val text = "20"
  var log = ""
  val r = runCatching { text.toInt() }
    .map { it * 2 }
    .onSuccess { log += "ok " + it + ";" }
    .onFailure { log += "fail;" }
  val value = r.getOrElse { 0 }
  val rec = runCatching { "q".toInt() }.recover { -5 }
  println("Value: " + value)
  println("Log: " + log)
  println("Recovered: " + rec.getOrNull())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Value: 40\nLog: ok 40;\nRecovered: -5',
    testCase: { call: '', expected: 'Value: 40\nLog: ok 40;\nRecovered: -5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"20"', alternateLiteral: '"w"' }],
      alternateExpectedOutput: 'Value: 0\nLog: fail;\nRecovered: -5',
    },
  },
  {
    id: 'world-15-practice-writerun-fold-result',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Use fold to turn a success and a failure into text.',
    conceptTags: ['lesson:success-failure-handling', 'fold', 'runCatching', 'success-and-failure'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Fold a Result',
    goal: 'Run two divisions with runCatching. Turn each result into a line of text, one for a value and one for an error.',
    description: '1. **Fold the first division.** Create `val a` with `runCatching { 10 / 2 }.fold(...)`. For a value, return "value " plus `it`. For an error, return "error " plus `it.message`.\n\n' +
              '2. **Fold the second division.** Create `val b` the same way with `runCatching { 10 / z }`.\n\n' +
              '3. **Print two lines.** Print `a`, then `b`:\n"value 5"\n"error / by zero"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Fold the first division.** Use `fold` with two lambdas.',
          '2. **Fold the second division.** Use `z` as the divisor.',
          '3. **Print two lines.** Print `a` and `b`.',
        ],
        comments: [
          '// 1. Fold the first division. Use fold with two lambdas.',
          '// 2. Fold the second division. Use z as the divisor.',
          '// 3. Print two lines. Print a and b.',
        ],
      },
      experienced: {
        steps: [
          '1. **Fold the first division.**',
          '2. **Fold the second division.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Fold the first division.',
          '// 2. Fold the second division.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FoldResult.kt',
    initialCode: `fun main() {
  val z = 0

  // 1. Fold the first division. Create val a with runCatching { 10 / 2 }.fold(...). For a value, return "value " plus it. For an error, return "error " plus it.message.

  // 2. Fold the second division. Create val b the same way with runCatching { 10 / z }.

  // 3. Print two lines. Print a, then b: "value 5" "error / by zero"
}`,
    solutionCode: `fun main() {
  val z = 0
  val a = runCatching { 10 / 2 }.fold({ "value " + it }, { "error " + it.message })
  val b = runCatching { 10 / z }.fold({ "value " + it }, { "error " + it.message })
  println(a)
  println(b)
}`,
    sampleInput: 'main()',
    expectedOutput: 'value 5\nerror / by zero',
    testCase: { call: '', expected: 'value 5\nerror / by zero' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'z', originalLiteral: '0', alternateLiteral: '5' }],
      alternateExpectedOutput: 'value 5\nvalue 2',
    },
  },
  {
    id: 'world-15-practice-writerun-handle-each',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Use onSuccess and onFailure inside a loop to add the good values and report the bad ones.',
    conceptTags: ['lesson:success-failure-handling', 'onSuccess', 'onFailure', 'loop', 'runCatching'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Handle Each',
    goal: 'Go through a list of texts. Add up the texts that are numbers. Print a line for each text that is not.',
    description: '1. **Loop over the texts.** Loop over `texts` with `for (t in texts)`. Start with `runCatching { t.toInt() }`.\n\n' +
              '2. **Handle each result.** Add `.onSuccess { ... }` that adds `it` to `sum`. Add `.onFailure { ... }` that prints "skip " plus `t`.\n\n' +
              '3. **Print the sum.** Print "Sum: " plus `sum`:\n"skip x"\n"Sum: 13"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Loop over the texts.** Use `runCatching` on each.',
          '2. **Handle each result.** Use `onSuccess` and `onFailure`.',
          '3. **Print the sum.** Show `sum`.',
        ],
        comments: [
          '// 1. Loop over the texts. Use runCatching on each.',
          '// 2. Handle each result. Use onSuccess and onFailure.',
          '// 3. Print the sum. Show sum.',
        ],
      },
      experienced: {
        steps: [
          '1. **Loop over the texts.**',
          '2. **Handle each result.**',
          '3. **Print the sum.**',
        ],
        comments: [
          '// 1. Loop over the texts.',
          '// 2. Handle each result.',
          '// 3. Print the sum.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'HandleEach.kt',
    initialCode: `fun main() {
  val extra = "9"
  val texts = listOf("4", "x", extra)
  var sum = 0

  // 1. Loop over the texts. Loop over texts with for (t in texts). Start with runCatching { t.toInt() }.

  // 2. Handle each result. Add .onSuccess { ... } that adds it to sum. Add .onFailure { ... } that prints "skip " plus t.

  // 3. Print the sum. Print "Sum: " plus sum: "skip x" "Sum: 13"
}`,
    solutionCode: `fun main() {
  val extra = "9"
  val texts = listOf("4", "x", extra)
  var sum = 0
  for (t in texts) {
    runCatching { t.toInt() }
      .onSuccess { sum += it }
      .onFailure { println("skip " + t) }
  }
  println("Sum: " + sum)
}`,
    sampleInput: 'main()',
    expectedOutput: 'skip x\nSum: 13',
    testCase: { call: '', expected: 'skip x\nSum: 13' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '"9"', alternateLiteral: '"y"' }],
      alternateExpectedOutput: 'skip x\nskip y\nSum: 4',
    },
  },
  {
    id: 'world-15-practice-writerun-null-pattern',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Use toIntOrNull when bad text is expected, instead of throwing and catching.',
    conceptTags: ['lesson:error-handling-patterns', 'toIntOrNull', 'expected-bad-input', 'elvis'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Null Instead of Throw',
    goal: 'Add up a list of texts. Bad text is normal here, so use a default for it and count how many texts were bad.',
    description: '1. **Convert each text.** Loop over `raw` with `for (t in raw)`. Create `val n` as `t.toIntOrNull()`.\n\n' +
              '2. **Count the bad ones.** When `n == null`, add `1` to `bad`.\n\n' +
              '3. **Add with a default.** Add `n ?: fallback` to `total`. After the loop, print "Total: " plus `total`, then "Bad: " plus `bad`:\n"Total: 12"\n"Bad: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Convert each text.** Use `toIntOrNull()`.',
          '2. **Count the bad ones.** Check for `null`.',
          '3. **Add with a default.** Use `?: fallback`, then print.',
        ],
        comments: [
          '// 1. Convert each text. Use toIntOrNull().',
          '// 2. Count the bad ones. Check for null.',
          '// 3. Add with a default. Use ?: fallback, then print.',
        ],
      },
      experienced: {
        steps: [
          '1. **Convert each text.**',
          '2. **Count the bad ones.**',
          '3. **Add with a default.**',
        ],
        comments: [
          '// 1. Convert each text.',
          '// 2. Count the bad ones.',
          '// 3. Add with a default.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NullPattern.kt',
    initialCode: `fun main() {
  val fallback = 0
  val raw = listOf("5", "x", "7")
  var total = 0
  var bad = 0

  // 1. Convert each text. Loop over raw with for (t in raw). Create val n as t.toIntOrNull().

  // 2. Count the bad ones. When n == null, add 1 to bad.

  // 3. Add with a default. Add n ?: fallback to total. After the loop, print "Total: " plus total, then "Bad: " plus bad: "Total: 12" "Bad: 1"
}`,
    solutionCode: `fun main() {
  val fallback = 0
  val raw = listOf("5", "x", "7")
  var total = 0
  var bad = 0
  for (t in raw) {
    val n = t.toIntOrNull()
    if (n == null) {
      bad += 1
    }
    total += n ?: fallback
  }
  println("Total: " + total)
  println("Bad: " + bad)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 12\nBad: 1',
    testCase: { call: '', expected: 'Total: 12\nBad: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'fallback', originalLiteral: '0', alternateLiteral: '100' }],
      alternateExpectedOutput: 'Total: 112\nBad: 1',
    },
  },
  {
    id: 'world-15-practice-writerun-result-pattern',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Use a function that returns a Result for validation rules, and fold it into messages.',
    conceptTags: ['lesson:error-handling-patterns', 'result-pattern', 'fold', 'validation-rules'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Result Pattern',
    goal: 'Check a quantity against two rules. A good quantity is doubled. A bad one gives a clear error. Print one line for each quantity.',
    description: '1. **Write validate.** Above `main`, write `fun validate(qty: Int): Result<Int>`. When `qty <= 0`, return a failure with `IllegalArgumentException("qty must be positive")`. When `qty > 100`, return a failure with "qty too big". Otherwise return a success with `qty * 2`.\n\n' +
              '2. **Loop over the quantities.** Loop over `listOf(5, 0, big)`.\n\n' +
              '3. **Print each result.** Print `validate(q).fold(...)`. For a value, return "ok " plus `it`. For an error, return "error " plus `it.message`:\n"ok 10"\n"error qty must be positive"\n"error qty too big"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write validate.** Two rules, two failures, one success.',
          '2. **Loop over the quantities.** Use `5`, `0` and `big`.',
          '3. **Print each result.** Use `fold`.',
        ],
        comments: [
          '// 1. Write validate. Two rules, two failures, one success.',
          '// 2. Loop over the quantities. Use 5, 0 and big.',
          '// 3. Print each result. Use fold.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write validate.**',
          '2. **Loop over the quantities.**',
          '3. **Print each result.**',
        ],
        comments: [
          '// 1. Write validate.',
          '// 2. Loop over the quantities.',
          '// 3. Print each result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ResultPattern.kt',
    initialCode: `// 1. Write validate. Above main, write fun validate(qty: Int): Result<Int>. When qty <= 0, return a failure with IllegalArgumentException("qty must be positive"). When qty > 100, return a failure with "qty too big". Otherwise return a success with qty * 2.

fun main() {
  val big = 150

  // 2. Loop over the quantities. Loop over listOf(5, 0, big).

  // 3. Print each result. Print validate(q).fold(...). For a value, return "ok " plus it. For an error, return "error " plus it.message: "ok 10" "error qty must be positive" "error qty too big"
}`,
    solutionCode: `fun validate(qty: Int): Result<Int> {
  if (qty <= 0) {
    return Result.failure(IllegalArgumentException("qty must be positive"))
  }
  if (qty > 100) {
    return Result.failure(IllegalArgumentException("qty too big"))
  }
  return Result.success(qty * 2)
}

fun main() {
  val big = 150
  for (q in listOf(5, 0, big)) {
    println(validate(q).fold({ "ok " + it }, { "error " + it.message }))
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'ok 10\nerror qty must be positive\nerror qty too big',
    testCase: { call: '', expected: 'ok 10\nerror qty must be positive\nerror qty too big' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'big', originalLiteral: '150', alternateLiteral: '20' }],
      alternateExpectedOutput: 'ok 10\nerror qty must be positive\nok 40',
    },
  },
  {
    id: 'world-15-practice-writerun-log-the-error',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Print the reason in the catch block so the error is not lost.',
    conceptTags: ['lesson:avoiding-swallowed-errors', 'logging-errors', 'catch', 'return-default'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Log the Error',
    goal: 'Write a function that turns a text into a number. When it fails, it says why, and gives 0. Try it twice.',
    description: '1. **Write parse.** Above `main`, write `fun parse(s: String): Int`. In a `try`, return `s.toInt()`. Add `catch (e: NumberFormatException)`.\n\n' +
              '2. **Report the error.** Inside the catch block, print "bad: " plus `e.message`. Then return `0`.\n\n' +
              '3. **Call it twice.** Print `parse("12")`, then `parse(text)`:\n"12"\n"bad: For input string: \\"zz\\""\n"0"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write parse.** Parse in a `try`, catch `NumberFormatException`.',
          '2. **Report the error.** Print the reason, return `0`.',
          '3. **Call it twice.** Use `"12"` and `text`.',
        ],
        comments: [
          '// 1. Write parse. Parse in a try, catch NumberFormatException.',
          '// 2. Report the error. Print the reason, return 0.',
          '// 3. Call it twice. Use "12" and text.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write parse.**',
          '2. **Report the error.**',
          '3. **Call it twice.**',
        ],
        comments: [
          '// 1. Write parse.',
          '// 2. Report the error.',
          '// 3. Call it twice.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LogTheError.kt',
    initialCode: `// 1. Write parse. Above main, write fun parse(s: String): Int. In a try, return s.toInt(). Add catch (e: NumberFormatException).

fun main() {
  val text = "zz"

  // 2. Report the error. Inside the catch block, print "bad: " plus e.message. Then return 0.

  // 3. Call it twice. Print parse("12"), then parse(text): "12" "bad: For input string: \\"zz\\"" "0"
}`,
    solutionCode: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
    println("bad: " + e.message)
    return 0
  }
}

fun main() {
  val text = "zz"
  println(parse("12"))
  println(parse(text))
}`,
    sampleInput: 'main()',
    expectedOutput: '12\nbad: For input string: "zz"\n0',
    testCase: { call: '', expected: '12\nbad: For input string: "zz"\n0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"zz"', alternateLiteral: '"7"' }],
      alternateExpectedOutput: '12\n7',
    },
  },
  {
    id: 'world-15-practice-writerun-keep-the-cause',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Wrap an exception in a new one and keep the first one as its cause.',
    conceptTags: ['lesson:avoiding-swallowed-errors', 'exception-cause', 'wrap-exception', 'message'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Keep the Cause',
    goal: 'Write a function that turns a failed parse into a clearer error and keeps the original error. Print both messages.',
    description: '1. **Write load.** Above `main`, write `fun load(text: String): Int`. In a `try`, return `text.toInt()`. In `catch (e: NumberFormatException)`, throw `IllegalStateException("load failed", e)`.\n\n' +
              '2. **Call it.** In a `try` block in `main`, print `load("4")`, then `load(text)`.\n\n' +
              '3. **Print both messages.** Add `catch (e: IllegalStateException)`. Print `e.message`, " <- " and `e.cause?.message`:\n"4"\n"load failed <- For input string: \\"q\\""',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write load.** Wrap the parse error and pass it as the cause.',
          '2. **Call it.** Use `"4"` and `text`.',
          '3. **Print both messages.** Use `e.message` and `e.cause?.message`.',
        ],
        comments: [
          '// 1. Write load. Wrap the parse error and pass it as the cause.',
          '// 2. Call it. Use "4" and text.',
          '// 3. Print both messages. Use e.message and e.cause?.message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write load.**',
          '2. **Call it.**',
          '3. **Print both messages.**',
        ],
        comments: [
          '// 1. Write load.',
          '// 2. Call it.',
          '// 3. Print both messages.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'KeepTheCause.kt',
    initialCode: `// 1. Write load. Above main, write fun load(text: String): Int. In a try, return text.toInt(). In catch (e: NumberFormatException), throw IllegalStateException("load failed", e).

fun main() {
  val text = "q"

  // 2. Call it. In a try block in main, print load("4"), then load(text).

  // 3. Print both messages. Add catch (e: IllegalStateException). Print e.message, " <- " and e.cause?.message: "4" "load failed <- For input string: \\"q\\""
}`,
    solutionCode: `fun load(text: String): Int {
  try {
    return text.toInt()
  } catch (e: NumberFormatException) {
    throw IllegalStateException("load failed", e)
  }
}

fun main() {
  val text = "q"
  try {
    println(load("4"))
    println(load(text))
  } catch (e: IllegalStateException) {
    println(e.message + " <- " + e.cause?.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '4\nload failed <- For input string: "q"',
    testCase: { call: '', expected: '4\nload failed <- For input string: "q"' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"q"', alternateLiteral: '"8"' }],
      alternateExpectedOutput: '4\n8',
    },
  },
  {
    id: 'world-15-practice-writerun-clear-messages',
    worldId: 'world-15',
    difficulty: 'medium',
    summary: 'Write failure messages that say what is wrong and show the value that caused it.',
    conceptTags: ['lesson:designing-meaningful-failure-paths', 'meaningful-message', 'validation', 'illegal-argument'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Clear Messages',
    goal: 'Check three orders. Each problem must say clearly what is wrong. Print one line for each order.',
    description: '1. **Write checkOrder.** Above `main`, write `fun checkOrder(items: Int, total: Int)`. When `items <= 0`, throw `IllegalArgumentException("order has no items")`. When `total < 0`, throw one with "order total ", `total` and " is negative". Otherwise print "order ok: ", `items`, " items, " and `total`.\n\n' +
              '2. **Check the first two orders.** Call `checkOrder(2, 30)`, then `checkOrder(3, -5)`. Put each call in its own `try`, and catch `IllegalArgumentException`. In the catch, print "error: " plus `e.message`.\n\n' +
              '3. **Check the third order.** Do the same with `checkOrder(items, 25)`:\n"order ok: 2 items, 30"\n"error: order total -5 is negative"\n"error: order has no items"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write checkOrder.** Two rules with clear messages.',
          '2. **Check the first two orders.** Use `try` and `catch` for each.',
          '3. **Check the third order.** Use `items`.',
        ],
        comments: [
          '// 1. Write checkOrder. Two rules with clear messages.',
          '// 2. Check the first two orders. Use try and catch for each.',
          '// 3. Check the third order. Use items.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write checkOrder.**',
          '2. **Check the first two orders.**',
          '3. **Check the third order.**',
        ],
        comments: [
          '// 1. Write checkOrder.',
          '// 2. Check the first two orders.',
          '// 3. Check the third order.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ClearMessages.kt',
    initialCode: `// 1. Write checkOrder. Above main, write fun checkOrder(items: Int, total: Int). When items <= 0, throw IllegalArgumentException("order has no items"). When total < 0, throw one with "order total ", total and " is negative". Otherwise print "order ok: ", items, " items, " and total.

fun main() {
  val items = 0

  // 2. Check the first two orders. Call checkOrder(2, 30), then checkOrder(3, -5). Put each call in its own try, and catch IllegalArgumentException. In the catch, print "error: " plus e.message.

  // 3. Check the third order. Do the same with checkOrder(items, 25): "order ok: 2 items, 30" "error: order total -5 is negative" "error: order has no items"
}`,
    solutionCode: `fun checkOrder(items: Int, total: Int) {
  if (items <= 0) {
    throw IllegalArgumentException("order has no items")
  }
  if (total < 0) {
    throw IllegalArgumentException("order total " + total + " is negative")
  }
  println("order ok: " + items + " items, " + total)
}

fun main() {
  val items = 0
  try {
    checkOrder(2, 30)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
  try {
    checkOrder(3, -5)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
  try {
    checkOrder(items, 25)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'order ok: 2 items, 30\nerror: order total -5 is negative\nerror: order has no items',
    testCase: { call: '', expected: 'order ok: 2 items, 30\nerror: order total -5 is negative\nerror: order has no items' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'items', originalLiteral: '0', alternateLiteral: '4' }],
      alternateExpectedOutput: 'order ok: 2 items, 30\nerror: order total -5 is negative\norder ok: 4 items, 25',
    },
  },
  {
    id: 'world-15-practice-writerun-order-codes',
    worldId: 'world-15',
    difficulty: 'hard',
    summary: 'Write an exception with an error code, and use the code and the message when you catch it.',
    conceptTags: ['lesson:designing-meaningful-failure-paths', 'custom-exception', 'error-code', 'failure-paths'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Order Codes',
    goal: 'Process orders. Each kind of failure has its own code and a clear message. Print a line for each order.',
    description: '1. **Write the exception.** Above `main`, write `class OrderError(val code: Int, message: String)`. It extends `Exception(message)`.\n\n' +
              '2. **Write process.** Write `fun process(qty: Int, stock: Int): Int`. When `qty <= 0`, throw `OrderError(1, "no items")`. When `qty > stock`, throw `OrderError(2, "need " + (qty - stock) + " more")`. Otherwise return `stock - qty`.\n\n' +
              '3. **Process three orders.** Loop over `listOf(0, 8, 3)`. In a `try`, print "done " plus `process(q, stock)`. Catch `OrderError` and print "code ", `e.code`, ": " and `e.message`:\n"code 1: no items"\n"code 2: need 3 more"\n"done 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the exception.** Add a `code` and a message.',
          '2. **Write process.** Throw code `1` or `2`, or return the new stock.',
          '3. **Process three orders.** Print the result or the code and message.',
        ],
        comments: [
          '// 1. Write the exception. Add a code and a message.',
          '// 2. Write process. Throw code 1 or 2, or return the new stock.',
          '// 3. Process three orders. Print the result or the code and message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the exception.**',
          '2. **Write process.**',
          '3. **Process three orders.**',
        ],
        comments: [
          '// 1. Write the exception.',
          '// 2. Write process.',
          '// 3. Process three orders.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderCodes.kt',
    initialCode: `// 1. Write the exception. Above main, write class OrderError(val code: Int, message: String). It extends Exception(message).

// 2. Write process. Write fun process(qty: Int, stock: Int): Int. When qty <= 0, throw OrderError(1, "no items"). When qty > stock, throw OrderError(2, "need " + (qty - stock) + " more"). Otherwise return stock - qty.

fun main() {
  val stock = 5

  // 3. Process three orders. Loop over listOf(0, 8, 3). In a try, print "done " plus process(q, stock). Catch OrderError and print "code ", e.code, ": " and e.message: "code 1: no items" "code 2: need 3 more" "done 2"
}`,
    solutionCode: `class OrderError(val code: Int, message: String) : Exception(message)

fun process(qty: Int, stock: Int): Int {
  if (qty <= 0) {
    throw OrderError(1, "no items")
  }
  if (qty > stock) {
    throw OrderError(2, "need " + (qty - stock) + " more")
  }
  return stock - qty
}

fun main() {
  val stock = 5
  for (q in listOf(0, 8, 3)) {
    try {
      println("done " + process(q, stock))
    } catch (e: OrderError) {
      println("code " + e.code + ": " + e.message)
    }
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'code 1: no items\ncode 2: need 3 more\ndone 2',
    testCase: { call: '', expected: 'code 1: no items\ncode 2: need 3 more\ndone 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'stock', originalLiteral: '5', alternateLiteral: '10' }],
      alternateExpectedOutput: 'code 1: no items\ndone 2\ndone 7',
    },
  },
];

export const WORLD_15_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-15-practice-debug-unguarded-divide',
    worldId: 'world-15',
    conceptTags: ['lesson:exceptions-try', 'try', 'catch', 'uncaught-exception'],
    summary: 'A division by zero is not caught, so the program stops.',
    title: 'Fix the Crash',
    subtitle: 'The program should print "a", "safe" and "end", but it stops with an error after "a".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: an exception is not caught, so the program stops',
    brokenCode: `fun main() {
  println("a")
  val d = 0
  val x = 10 / d
  println("x " + x)
  println("end")
}`,
    fixedCode: `fun main() {
  println("a")
  val d = 0
  try {
    val x = 10 / d
    println("x " + x)
  } catch (e: ArithmeticException) {
    println("safe")
  }
  println("end")
}`,
    expectedOutput: 'a\nsafe\nend',
    hints: [
              'Look at the output. Which line is the last one that prints?',
              'Dividing by `0` throws an `ArithmeticException`. Nothing catches it, so the program stops.',
              'Put the division in a block that handles that exception, so the program can go on.',
            ],
    explanation: 'The exception `ArithmeticException` is thrown by `10 / d`. With no `try`, the program stops there. Putting the division in `try` and adding `catch (e: ArithmeticException)` prints `safe` and lets the program go on to `end`.',
  },
  {
    id: 'world-15-practice-debug-wrong-catch',
    worldId: 'world-15',
    conceptTags: ['lesson:catch', 'catch', 'exception-type'],
    summary: 'The catch is for a different exception type.',
    title: 'Fix the Catch Type',
    subtitle: 'The program should print "caught / by zero", but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: the catch is for a different exception',
    brokenCode: `fun main() {
  try {
    val x = 10 / 0
    println(x)
  } catch (e: NumberFormatException) {
    println("caught " + e.message)
  }
}`,
    fixedCode: `fun main() {
  try {
    val x = 10 / 0
    println(x)
  } catch (e: ArithmeticException) {
    println("caught " + e.message)
  }
}`,
    expectedOutput: 'caught / by zero',
    hints: [
              'Look at the exception type in the `catch` and the kind of error that happens.',
              'Dividing by `0` throws `ArithmeticException`. The catch is for `NumberFormatException`, so it does not match.',
              'Change the catch to the type that the division really throws.',
            ],
    explanation: 'A `catch` only handles the type that you write (and its subtypes). `10 / 0` throws `ArithmeticException`, which is not a `NumberFormatException`, so the exception goes on and stops the program. Catching `ArithmeticException` prints `caught / by zero`.',
  },
  {
    id: 'world-15-practice-debug-skipped-cleanup',
    worldId: 'world-15',
    conceptTags: ['lesson:finally', 'finally', 'early-return'],
    summary: 'An early return skips the close line.',
    title: 'Fix the Cleanup',
    subtitle: 'The program should print "open", "close" and "negative", but it never prints "close".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: an early return skips the close line',
    brokenCode: `fun work(n: Int): String {
  println("open")
  if (n < 0) {
    return "negative"
  }
  println("close")
  return "done"
}

fun main() {
  println(work(-1))
}`,
    fixedCode: `fun work(n: Int): String {
  println("open")
  try {
    if (n < 0) {
      return "negative"
    }
    return "done"
  } finally {
    println("close")
  }
}

fun main() {
  println(work(-1))
}`,
    expectedOutput: 'open\nclose\nnegative',
    hints: [
              'Follow the code for `work(-1)`. Which lines run before the `return`?',
              'The early `return` leaves the function, so the line after it never runs.',
              'Put the cleanup in a block that always runs, even when the function returns early.',
            ],
    explanation: 'A `return` ends the function at once, so `println("close")` after it is skipped. A `finally` block runs when the `try` block ends in any way, including `return`. With `finally`, the program prints `close` before it returns `negative`.',
  },
  {
    id: 'world-15-practice-debug-forgot-throw',
    worldId: 'world-15',
    conceptTags: ['lesson:throw', 'throw', 'new-exception-not-thrown'],
    summary: 'The exception is created but not thrown.',
    title: 'Fix the Missing Throw',
    subtitle: 'The program should print "rejected: negative", but it prints "accepted".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the exception is created but never thrown',
    brokenCode: `fun check(age: Int) {
  if (age < 0) {
    IllegalArgumentException("negative")
  }
}

fun main() {
  try {
    check(-1)
    println("accepted")
  } catch (e: IllegalArgumentException) {
    println("rejected: " + e.message)
  }
}`,
    fixedCode: `fun check(age: Int) {
  if (age < 0) {
    throw IllegalArgumentException("negative")
  }
}

fun main() {
  try {
    check(-1)
    println("accepted")
  } catch (e: IllegalArgumentException) {
    println("rejected: " + e.message)
  }
}`,
    expectedOutput: 'rejected: negative',
    hints: [
              'Look at the line inside `if (age < 0)`. What does it do?',
              'It creates an exception object, but nothing throws it. The code goes on as normal.',
              'Add the keyword that makes the exception fly.',
            ],
    explanation: '`IllegalArgumentException("negative")` only creates an object. An exception has an effect only when it is thrown. With `throw`, the function stops, the `catch` runs and the program prints `rejected: negative`.',
  },
  {
    id: 'world-15-practice-debug-general-first',
    worldId: 'world-15',
    conceptTags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'catch-order'],
    summary: 'The general catch comes before the specific one.',
    title: 'Fix the Catch Order',
    subtitle: 'The program should print "specific a", but it prints "general a".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the general catch comes before the specific one',
    brokenCode: `fun main() {
  try {
    throw IllegalArgumentException("a")
  } catch (e: Exception) {
    println("general " + e.message)
  } catch (e: IllegalArgumentException) {
    println("specific " + e.message)
  }
}`,
    fixedCode: `fun main() {
  try {
    throw IllegalArgumentException("a")
  } catch (e: IllegalArgumentException) {
    println("specific " + e.message)
  } catch (e: Exception) {
    println("general " + e.message)
  }
}`,
    expectedOutput: 'specific a',
    hints: [
              'Look at the order of the two catch blocks.',
              'Kotlin uses the first catch that matches. `Exception` matches every exception, so it wins.',
              'Put the more specific catch first.',
            ],
    explanation: 'Catch blocks are tried from top to bottom. `IllegalArgumentException` is also an `Exception`, so the general catch matches first and the specific one never runs. With the specific catch first, the program prints `specific a`.',
  },
  {
    id: 'world-15-practice-debug-zero-fallback',
    worldId: 'world-15',
    conceptTags: ['lesson:try-as-an-expression', 'try-expression', 'fallback-value'],
    summary: 'The fallback looks like a real answer.',
    title: 'Fix the Fallback',
    subtitle: 'The program should print "0" and "-1", but it prints "0" and "0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the fallback looks like a real zero',
    brokenCode: `fun parse(s: String): Int {
  return try {
    s.toInt()
  } catch (e: NumberFormatException) {
    0
  }
}

fun main() {
  println(parse("0"))
  println(parse("x"))
}`,
    fixedCode: `fun parse(s: String): Int {
  return try {
    s.toInt()
  } catch (e: NumberFormatException) {
    -1
  }
}

fun main() {
  println(parse("0"))
  println(parse("x"))
}`,
    expectedOutput: '0\n-1',
    hints: [
              'Look at the two outputs. Can you tell a real zero from a failure?',
              'The fallback `0` is also a valid answer, so a failed parse looks the same as a real zero.',
              'Choose a fallback value that a real answer can never be.',
            ],
    explanation: 'When the fallback is `0`, the text `"0"` and the bad text `"x"` give the same answer, so the caller cannot tell them apart. A fallback such as `-1` is different from every valid answer here, so the program prints `0` and `-1`.',
  },
  {
    id: 'world-15-practice-debug-silent-message',
    worldId: 'world-15',
    conceptTags: ['lesson:custom-exceptions', 'custom-exception', 'message'],
    summary: 'The custom exception has no message.',
    title: 'Fix the Empty Message',
    subtitle: 'The program should print "Error: no stock: pen", but it prints "Error: null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the custom exception has no message',
    brokenCode: `class NoStock(val item: String) : Exception()

fun main() {
  try {
    throw NoStock("pen")
  } catch (e: NoStock) {
    println("Error: " + e.message)
  }
}`,
    fixedCode: `class NoStock(val item: String) : Exception("no stock: " + item)

fun main() {
  try {
    throw NoStock("pen")
  } catch (e: NoStock) {
    println("Error: " + e.message)
  }
}`,
    expectedOutput: 'Error: no stock: pen',
    hints: [
              'Look at the word `null` in the output. What is `e.message` here?',
              'The class extends `Exception()` with no message, so the message is `null`.',
              'Give the message to the parent class when you declare the exception.',
            ],
    explanation: '`Exception()` without an argument has no message, so `e.message` is `null`. By writing `Exception("no stock: " + item)`, the class passes a message to its parent, and `e.message` returns it.',
  },
  {
    id: 'world-15-practice-debug-catch-too-wide',
    worldId: 'world-15',
    conceptTags: ['lesson:checked-vs-unchecked-exception-model', 'specific-catch', 'index-out-of-bounds'],
    summary: 'One wide catch gives the wrong reason.',
    title: 'Fix the Wide Catch',
    subtitle: 'The program should print "b" and "no such item", but it prints "b" and "bad number".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: one wide catch gives the wrong reason',
    brokenCode: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: Exception) {
    return "bad number"
  }
}

fun main() {
  val items = listOf("a", "b", "c")
  println(pick(items, "1"))
  println(pick(items, "7"))
}`,
    fixedCode: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: NumberFormatException) {
    return "bad number"
  } catch (e: IndexOutOfBoundsException) {
    return "no such item"
  }
}

fun main() {
  val items = listOf("a", "b", "c")
  println(pick(items, "1"))
  println(pick(items, "7"))
}`,
    expectedOutput: 'b\nno such item',
    hints: [
              'Look at the second line. Is index 7 a bad number?',
              'The catch is for `Exception`, so it handles every problem with the same answer, including the index that is too big.',
              'Catch each kind of problem on its own, and give each its own answer.',
            ],
    explanation: '`"7"` is a good number, but the list has only three items, so `items[7]` throws `IndexOutOfBoundsException`. The wide catch says `bad number`, which is wrong. Two catches, `NumberFormatException` and `IndexOutOfBoundsException`, give the right reason for each.',
  },
  {
    id: 'world-15-practice-debug-null-default',
    worldId: 'world-15',
    conceptTags: ['lesson:result', 'result', 'getOrNull', 'getOrElse'],
    summary: 'A failed Result gives null, not a default.',
    title: 'Fix the Missing Default',
    subtitle: 'The program should print "Value: -1", but it prints "Value: null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a failed result gives null, not a default',
    brokenCode: `fun main() {
  val r = runCatching { "x".toInt() }
  println("Value: " + r.getOrNull())
}`,
    fixedCode: `fun main() {
  val r = runCatching { "x".toInt() }
  println("Value: " + r.getOrElse { -1 })
}`,
    expectedOutput: 'Value: -1',
    hints: [
              'Look at what a failed `Result` gives with `getOrNull()`.',
              '`getOrNull()` returns `null` for a failure, and a `null` prints as the word null.',
              'Use the function that lets you give a default value for a failure.',
            ],
    explanation: '`"x".toInt()` fails, so the `Result` is a failure, and `getOrNull()` gives `null`. `getOrElse { -1 }` runs the lambda for a failure and gives `-1`, so the program prints `Value: -1`.',
  },
  {
    id: 'world-15-practice-debug-map-skips-failure',
    worldId: 'world-15',
    conceptTags: ['lesson:runcatching', 'runCatching', 'map-vs-recover'],
    summary: 'map does not run for a failure.',
    title: 'Fix the Recovery',
    subtitle: 'The program should print "Value: 0", but it prints "Value: null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: map does not run for a failure',
    brokenCode: `fun main() {
  val r = runCatching { "x".toInt() }.map { 0 }
  println("Value: " + r.getOrNull())
}`,
    fixedCode: `fun main() {
  val r = runCatching { "x".toInt() }.recover { 0 }
  println("Value: " + r.getOrNull())
}`,
    expectedOutput: 'Value: 0',
    hints: [
              'Look at which step runs for a failed `Result`.',
              '`map` only runs for a success. For a failure, the result stays a failure.',
              'Use the function that works on a failure and gives a new value.',
            ],
    explanation: '`map` changes the value of a success and leaves a failure as it is, so the result is still a failure and `getOrNull()` is `null`. `recover { 0 }` runs for a failure and turns it into a success with `0`.',
  },
  {
    id: 'world-15-practice-debug-inverted-check',
    worldId: 'world-15',
    conceptTags: ['lesson:success-failure-handling', 'isSuccess', 'isFailure'],
    summary: 'The success branch tests for failure.',
    title: 'Fix the Check',
    subtitle: 'The program should print "ok 12", but it prints "failed".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the success branch tests for failure',
    brokenCode: `fun main() {
  val r = runCatching { "12".toInt() }
  if (r.isFailure) {
    println("ok " + r.getOrNull())
  } else {
    println("failed")
  }
}`,
    fixedCode: `fun main() {
  val r = runCatching { "12".toInt() }
  if (r.isSuccess) {
    println("ok " + r.getOrNull())
  } else {
    println("failed")
  }
}`,
    expectedOutput: 'ok 12',
    hints: [
              'Look at the condition in the `if`. Which result do you expect for "12"?',
              'The text "12" parses, so the result is a success. The condition asks for a failure.',
              'Test for the case that you want in the first branch.',
            ],
    explanation: '`r.isFailure` is `false` for a good parse, so the code goes to the `else` branch and prints `failed`. With `r.isSuccess`, the first branch runs and prints `ok 12`.',
  },
  {
    id: 'world-15-practice-debug-throw-for-normal',
    worldId: 'world-15',
    conceptTags: ['lesson:error-handling-patterns', 'toIntOrNull', 'expected-bad-input'],
    summary: 'toInt throws for text that is expected to be bad.',
    title: 'Fix the Normal Case',
    subtitle: 'The program should print "Total: 10", but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: bad text is expected, but toInt throws',
    brokenCode: `fun main() {
  var total = 0
  for (t in listOf("4", "x", "6")) {
    total += t.toInt()
  }
  println("Total: " + total)
}`,
    fixedCode: `fun main() {
  var total = 0
  for (t in listOf("4", "x", "6")) {
    total += t.toIntOrNull() ?: 0
  }
  println("Total: " + total)
}`,
    expectedOutput: 'Total: 10',
    hints: [
              'Look at the list. Which text is not a number?',
              '`toInt()` throws an exception for a bad text. Here bad text is part of the normal input.',
              'Use the conversion that gives a `null` instead of throwing, and give it a default.',
            ],
    explanation: '`"x".toInt()` throws `NumberFormatException`, which stops the program. When bad input is expected, `toIntOrNull()` gives `null` and `?: 0` turns it into a default, so the total is `4 + 0 + 6 = 10`.',
  },
  {
    id: 'world-15-practice-debug-empty-catch',
    worldId: 'world-15',
    conceptTags: ['lesson:avoiding-swallowed-errors', 'swallowed-error', 'logging'],
    summary: 'The catch block hides the error.',
    title: 'Fix the Silent Catch',
    subtitle: 'The program should print "bad: For input string: \\"zz\\"" for a bad text, but it prints nothing about the problem.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the catch block hides the error',
    brokenCode: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
  }
  return 0
}

fun main() {
  println(parse("12"))
  println(parse("zz"))
}`,
    fixedCode: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
    println("bad: " + e.message)
  }
  return 0
}

fun main() {
  println(parse("12"))
  println(parse("zz"))
}`,
    expectedOutput: '12\nbad: For input string: "zz"\n0',
    hints: [
              'Look at the output for "zz". Is there any sign that something went wrong?',
              'The catch block is empty, so the error is thrown away and the function quietly returns `0`.',
              'Make the catch block report the reason.',
            ],
    explanation: 'An empty `catch` swallows the exception, so nobody learns what went wrong. Printing `e.message` in the catch block keeps the reason visible, and the function still returns `0`.',
  },
  {
    id: 'world-15-practice-debug-vague-message',
    worldId: 'world-15',
    conceptTags: ['lesson:designing-meaningful-failure-paths', 'meaningful-message', 'illegal-state'],
    summary: 'The message does not say what went wrong.',
    title: 'Fix the Vague Message',
    subtitle: 'The program should print "order 8 has no items", but it prints "error".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the message does not say what went wrong',
    brokenCode: `fun ship(items: Int, id: Int) {
  if (items == 0) {
    throw IllegalStateException("error")
  }
  println("shipped " + id)
}

fun main() {
  try {
    ship(2, 7)
    ship(0, 8)
  } catch (e: IllegalStateException) {
    println(e.message)
  }
}`,
    fixedCode: `fun ship(items: Int, id: Int) {
  if (items == 0) {
    throw IllegalStateException("order " + id + " has no items")
  }
  println("shipped " + id)
}

fun main() {
  try {
    ship(2, 7)
    ship(0, 8)
  } catch (e: IllegalStateException) {
    println(e.message)
  }
}`,
    expectedOutput: 'shipped 7\norder 8 has no items',
    hints: [
              'Look at the message. Can you tell which order failed and why?',
              'The message is only the word error, which says nothing.',
              'Write a message that names the order and the problem.',
            ],
    explanation: 'A message such as `error` does not help anyone find the problem. A good message names the thing and the reason. `"order " + id + " has no items"` says that order 8 has no items.',
  },
];
