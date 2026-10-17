import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 13 -- Scope Masters (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the scope function (let, run, apply, also, with) is named in the step.
//   hard   -- several scope functions together, a chain, nested blocks, or a null check; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world13.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world13.real.ts). Labelled this (this@Outer) is not supported
// by the simulator, so no task uses it (PITFALLS.md).

export const WORLD_13_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-13-practice-writerun-name-lengths',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use let on a value that may be null, and give a default when it is null.',
    conceptTags: ['lesson:let-run', 'let', 'nullable-receiver', 'elvis'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Name Lengths',
    goal: 'A title may be missing. When it exists, print it, find its length and shout it. When it is missing, use default values.',
    description: '1. **Find the length.** Create `val length` with `title?.let { ... }`. Inside, return `it.length`. Add `?: -1` for a missing title.\n\n' +
              '2. **Shout the title.** Create `val shout` with `title?.let { ... }`. Inside, return `it.uppercase()`. Add `?: "none"` for a missing title.\n\n' +
              '3. **Print the title.** Use `title?.let { ... }` and print "Title: " plus `it` inside. Nothing prints when the title is `null`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Title: kotlin"\n"Length: 6"\n"Shout: KOTLIN"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the length.** Use `?.let` and `?: -1`.',
          '2. **Shout the title.** Use `?.let` and `?: "none"`.',
          '3. **Print the title.** Use `?.let` to print it.',
          '4. **Print two lines.** Show the length and the shout.',
        ],
        comments: [
          '// 1. Find the length. Use ?.let and ?: -1.',
          '// 2. Shout the title. Use ?.let and ?: "none".',
          '// 3. Print the title. Use ?.let to print it.',
          '// 4. Print two lines. Show the length and the shout.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the length.**',
          '2. **Shout the title.**',
          '3. **Print the title.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Find the length.',
          '// 2. Shout the title.',
          '// 3. Print the title.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NameLengths.kt',
    initialCode: `fun main() {
  val title: String? = "kotlin"

  // 1. Find the length. Create val length with title?.let { ... }. Inside, return it.length. Add ?: -1 for a missing title.

  // 2. Shout the title. Create val shout with title?.let { ... }. Inside, return it.uppercase(). Add ?: "none" for a missing title.

  // 3. Print the title. Use title?.let { ... } and print "Title: " plus it inside. Nothing prints when the title is null.

  // 4. Print two lines. Join the text with +: "Title: kotlin" "Length: 6" "Shout: KOTLIN"
}`,
    solutionCode: `fun main() {
  val title: String? = "kotlin"
  val length = title?.let { it.length } ?: -1
  val shout = title?.let { it.uppercase() } ?: "none"
  title?.let { println("Title: " + it) }
  println("Length: " + length)
  println("Shout: " + shout)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Title: kotlin\nLength: 6\nShout: KOTLIN',
    testCase: { call: '', expected: 'Title: kotlin\nLength: 6\nShout: KOTLIN' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'title', originalLiteral: '"kotlin"', alternateLiteral: 'null' }],
      alternateExpectedOutput: 'Length: -1\nShout: none',
    },
  },
  {
    id: 'world-13-practice-writerun-area-run',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use run for a block that works out a value, and run on a String.',
    conceptTags: ['lesson:let-run', 'run', 'run-block', 'extension-run'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Area with Run',
    goal: 'Work out an area in a block with its own helper values. Then build a text from a word. Print both.',
    description: '1. **Work out the area.** Create `val area` with `run { ... }`. Inside, create `val w` as `a + 2` and `val h` as `b`. The last line is `w * h`.\n\n' +
              '2. **Build the text.** Create `val text` with `"report".run { ... }`. Inside, return `uppercase()` plus `length`.\n\n' +
              '3. **Print two lines.** Join the text with `+`:\n"Area: 32"\n"Text: REPORT6"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Work out the area.** Use `run` and end with `w * h`.',
          '2. **Build the text.** Use `"report".run`.',
          '3. **Print two lines.** Show both values.',
        ],
        comments: [
          '// 1. Work out the area. Use run and end with w * h.',
          '// 2. Build the text. Use "report".run.',
          '// 3. Print two lines. Show both values.',
        ],
      },
      experienced: {
        steps: [
          '1. **Work out the area.**',
          '2. **Build the text.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Work out the area.',
          '// 2. Build the text.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AreaRun.kt',
    initialCode: `fun main() {
  val a = 6
  val b = 4

  // 1. Work out the area. Create val area with run { ... }. Inside, create val w as a + 2 and val h as b. The last line is w * h.

  // 2. Build the text. Create val text with "report".run { ... }. Inside, return uppercase() plus length.

  // 3. Print two lines. Join the text with +: "Area: 32" "Text: REPORT6"
}`,
    solutionCode: `fun main() {
  val a = 6
  val b = 4
  val area = run {
    val w = a + 2
    val h = b
    w * h
  }
  val text = "report".run { uppercase() + length }
  println("Area: " + area)
  println("Text: " + text)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Area: 32\nText: REPORT6',
    testCase: { call: '', expected: 'Area: 32\nText: REPORT6' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'a', originalLiteral: '6', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Area: 48\nText: REPORT6',
    },
  },
  {
    id: 'world-13-practice-writerun-build-profile',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use apply to set up an object and get the same object back.',
    conceptTags: ['lesson:apply', 'apply', 'configure-object', 'returns-receiver'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Build a Profile',
    goal: 'Make a profile and set its name, its age and two tags in one block. Print its label and the number of tags.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Create the profile.** Create `val p` with `Profile().apply { ... }`. Inside, set `name` to "Ada" and `age` to `years`.\n\n' +
              '2. **Add the tags.** In the same `apply` block, call `tags.add("math")` and `tags.add("code")`.\n\n' +
              '3. **Print two lines.** Print `p.label()`, then "Tags: " plus `p.tags.size`:\n"Ada (36)"\n"Tags: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Create the profile.** Use `apply` to set `name` and `age`.',
          '2. **Add the tags.** Add two tags in the block.',
          '3. **Print two lines.** Show the label and the tag count.',
        ],
        comments: [
          '// 1. Create the profile. Use apply to set name and age.',
          '// 2. Add the tags. Add two tags in the block.',
          '// 3. Print two lines. Show the label and the tag count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Create the profile.**',
          '2. **Add the tags.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Create the profile.',
          '// 2. Add the tags.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BuildProfile.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. Create the profile. Create val p with Profile().apply { ... }. Inside, set name to "Ada" and age to years.

  // 2. Add the tags. In the same apply block, call tags.add("math") and tags.add("code").

  // 3. Print two lines. Print p.label(), then "Tags: " plus p.tags.size: "Ada (36)" "Tags: 2"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
    tags.add("math")
    tags.add("code")
  }
  println(p.label())
  println("Tags: " + p.tags.size)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ada (36)\nTags: 2',
    testCase: { call: '', expected: 'Ada (36)\nTags: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '36', alternateLiteral: '40' }],
      alternateExpectedOutput: 'Ada (40)\nTags: 2',
    },
  },
  {
    id: 'world-13-practice-writerun-list-builder',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use apply to fill a new list with a loop.',
    conceptTags: ['lesson:apply', 'apply', 'builder', 'loop-inside-apply'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'List Builder',
    goal: 'Make a list and fill it in the same step. Add the doubles of the numbers from 1 up to a count. Print the list and its size.',
    description: '1. **Start the list.** Create `val list` with `mutableListOf<Int>().apply { ... }`.\n\n' +
              '2. **Fill the list.** Inside the block, loop `i` from `1` to `count`. Each time, call `add(i * 2)`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"List: [2, 4, 6]"\n"Size: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the list.** Use `mutableListOf<Int>().apply`.',
          '2. **Fill the list.** Loop and add `i * 2`.',
          '3. **Print two lines.** Show the list and its size.',
        ],
        comments: [
          '// 1. Start the list. Use mutableListOf<Int>().apply.',
          '// 2. Fill the list. Loop and add i * 2.',
          '// 3. Print two lines. Show the list and its size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the list.**',
          '2. **Fill the list.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Start the list.',
          '// 2. Fill the list.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ListBuilder.kt',
    initialCode: `fun main() {
  val count = 3

  // 1. Start the list. Create val list with mutableListOf<Int>().apply { ... }.

  // 2. Fill the list. Inside the block, loop i from 1 to count. Each time, call add(i * 2).

  // 3. Print two lines. Use a string template for the list: "List: [2, 4, 6]" "Size: 3"
}`,
    solutionCode: `fun main() {
  val count = 3
  val list = mutableListOf<Int>().apply {
    for (i in 1..count) {
      add(i * 2)
    }
  }
  println("List: $list")
  println("Size: " + list.size)
}`,
    sampleInput: 'main()',
    expectedOutput: 'List: [2, 4, 6]\nSize: 3',
    testCase: { call: '', expected: 'List: [2, 4, 6]\nSize: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '3', alternateLiteral: '2' }],
      alternateExpectedOutput: 'List: [2, 4]\nSize: 2',
    },
  },
  {
    id: 'world-13-practice-writerun-trace-word',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use also to print a value in the middle of a chain without changing it.',
    conceptTags: ['lesson:also', 'also', 'side-effect', 'returns-receiver'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Trace a Word',
    goal: 'Follow a word through a chain. Print it before and after it is made upper case. Then print the result.',
    description: '1. **Print the word first.** Start with `word.also { ... }` and print "before: " plus `it` inside.\n\n' +
              '2. **Change and print again.** Continue with `.uppercase()`. Then add `.also { ... }` and print "after: " plus `it`. Keep the whole chain in `val result`.\n\n' +
              '3. **Print the result.** Print "Result: " plus `result`:\n"before: kotlin"\n"after: KOTLIN"\n"Result: KOTLIN"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the word first.** Use `also` and print `it`.',
          '2. **Change and print again.** Use `uppercase()` and another `also`.',
          '3. **Print the result.** Show `result`.',
        ],
        comments: [
          '// 1. Print the word first. Use also and print it.',
          '// 2. Change and print again. Use uppercase() and another also.',
          '// 3. Print the result. Show result.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the word first.**',
          '2. **Change and print again.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Print the word first.',
          '// 2. Change and print again.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TraceWord.kt',
    initialCode: `fun main() {
  val word = "kotlin"

  // 1. Print the word first. Start with word.also { ... } and print "before: " plus it inside.

  // 2. Change and print again. Continue with .uppercase(). Then add .also { ... } and print "after: " plus it. Keep the whole chain in val result.

  // 3. Print the result. Print "Result: " plus result: "before: kotlin" "after: KOTLIN" "Result: KOTLIN"
}`,
    solutionCode: `fun main() {
  val word = "kotlin"
  val result = word.also { println("before: " + it) }.uppercase().also { println("after: " + it) }
  println("Result: " + result)
}`,
    sampleInput: 'main()',
    expectedOutput: 'before: kotlin\nafter: KOTLIN\nResult: KOTLIN',
    testCase: { call: '', expected: 'before: kotlin\nafter: KOTLIN\nResult: KOTLIN' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'word', originalLiteral: '"kotlin"', alternateLiteral: '"scope"' }],
      alternateExpectedOutput: 'before: scope\nafter: SCOPE\nResult: SCOPE',
    },
  },
  {
    id: 'world-13-practice-writerun-log-and-keep',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'Chain several also calls to log a list before and after you change it.',
    conceptTags: ['lesson:also', 'also', 'chained-also', 'mutable-list', 'log'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Log and Keep',
    goal: 'Make a list, add an item to it, and write a log of its size before and after. Print the log and the list.',
    description: '1. **Make the list and log the start.** Create `val numbers` with `mutableListOf(1, 2, 3)`. Add `.also { ... }` that adds "start:", `it.size` and ";" to `log`.\n\n' +
              '2. **Add the extra number.** Add another `.also { ... }` that calls `it.add(extra)`.\n\n' +
              '3. **Log the end.** Add a third `.also { ... }` that adds "end:", `it.size` and ";" to `log`.\n\n' +
              '4. **Print two lines.** Use a string template for the list:\n"Log: start:3;end:4;"\n"Numbers: [1, 2, 3, 10]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make the list and log the start.** Use `also` to log the size.',
          '2. **Add the extra number.** Use `also` to add `extra`.',
          '3. **Log the end.** Use `also` to log the size again.',
          '4. **Print two lines.** Show the log and the list.',
        ],
        comments: [
          '// 1. Make the list and log the start. Use also to log the size.',
          '// 2. Add the extra number. Use also to add extra.',
          '// 3. Log the end. Use also to log the size again.',
          '// 4. Print two lines. Show the log and the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make the list and log the start.**',
          '2. **Add the extra number.**',
          '3. **Log the end.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Make the list and log the start.',
          '// 2. Add the extra number.',
          '// 3. Log the end.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LogAndKeep.kt',
    initialCode: `fun main() {
  val extra = 10
  var log = ""

  // 1. Make the list and log the start. Create val numbers with mutableListOf(1, 2, 3). Add .also { ... } that adds "start:", it.size and ";" to log.

  // 2. Add the extra number. Add another .also { ... } that calls it.add(extra).

  // 3. Log the end. Add a third .also { ... } that adds "end:", it.size and ";" to log.

  // 4. Print two lines. Use a string template for the list: "Log: start:3;end:4;" "Numbers: [1, 2, 3, 10]"
}`,
    solutionCode: `fun main() {
  val extra = 10
  var log = ""
  val numbers = mutableListOf(1, 2, 3)
    .also { log += "start:" + it.size + ";" }
    .also { it.add(extra) }
    .also { log += "end:" + it.size + ";" }
  println("Log: " + log)
  println("Numbers: $numbers")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Log: start:3;end:4;\nNumbers: [1, 2, 3, 10]',
    testCase: { call: '', expected: 'Log: start:3;end:4;\nNumbers: [1, 2, 3, 10]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Log: start:3;end:4;\nNumbers: [1, 2, 3, 20]',
    },
  },
  {
    id: 'world-13-practice-writerun-report-with',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use with to work on an object and return the last line of the block.',
    conceptTags: ['lesson:with', 'with', 'change-inside-with', 'block-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Report with With',
    goal: 'Add some years to the age of a profile, and get its label, in one block. Print the label and the new age.',
    description: 'The class `Profile` is in the starter code. The profile `p` already has `name` "Bo" and `age` `5`.\n\n' +
              '1. **Write the with block.** Create `val text` with `with(p) { ... }`. Inside, set `age` to `age + years`. The last line is `label()`.\n\n' +
              '2. **Print the label.** Print `text`:\n"Bo (9)"\n\n' +
              '3. **Print the age.** Print "Age now: " plus `p.age`. The profile itself was changed:\n"Age now: 9"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the with block.** Change `age`, then return `label()`.',
          '2. **Print the label.** Print `text`.',
          '3. **Print the age.** Show `p.age`.',
        ],
        comments: [
          '// 1. Write the with block. Change age, then return label().',
          '// 2. Print the label. Print text.',
          '// 3. Print the age. Show p.age.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the with block.**',
          '2. **Print the label.**',
          '3. **Print the age.**',
        ],
        comments: [
          '// 1. Write the with block.',
          '// 2. Print the label.',
          '// 3. Print the age.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReportWith.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 4
  val p = Profile()
  p.name = "Bo"
  p.age = 5

  // 1. Write the with block. Create val text with with(p) { ... }. Inside, set age to age + years. The last line is label().

  // 2. Print the label. Print text: "Bo (9)"

  // 3. Print the age. Print "Age now: " plus p.age. The profile itself was changed: "Age now: 9"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 4
  val p = Profile()
  p.name = "Bo"
  p.age = 5
  val text = with(p) {
    age = age + years
    label()
  }
  println(text)
  println("Age now: " + p.age)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Bo (9)\nAge now: 9',
    testCase: { call: '', expected: 'Bo (9)\nAge now: 9' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '4', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Bo (15)\nAge now: 15',
    },
  },
  {
    id: 'world-13-practice-writerun-list-with',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use with on a list to call its functions without a name in front.',
    conceptTags: ['lesson:with', 'with', 'list-receiver', 'block-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'List with With',
    goal: 'Describe a list with its size, first item and last item. Then add its first and last items. Print both.',
    description: '1. **Write the summary.** Create `val summary` with `with(numbers) { ... }`. Inside, join "n=", `size`, " first=", `first()`, " last=" and `last()`.\n\n' +
              '2. **Add the ends.** Create `val ends` with `with(numbers) { ... }`. Inside, return `first() + last()`.\n\n' +
              '3. **Print two lines.** Print `summary`, then "Ends: " plus `ends`:\n"n=4 first=3 last=9"\n"Ends: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the summary.** Use `size`, `first()` and `last()`.',
          '2. **Add the ends.** Add the first and the last item.',
          '3. **Print two lines.** Show both values.',
        ],
        comments: [
          '// 1. Write the summary. Use size, first() and last().',
          '// 2. Add the ends. Add the first and the last item.',
          '// 3. Print two lines. Show both values.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the summary.**',
          '2. **Add the ends.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the summary.',
          '// 2. Add the ends.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ListWith.kt',
    initialCode: `fun main() {
  val start = 3
  val numbers = listOf(start, 1, 2, 9)

  // 1. Write the summary. Create val summary with with(numbers) { ... }. Inside, join "n=", size, " first=", first(), " last=" and last().

  // 2. Add the ends. Create val ends with with(numbers) { ... }. Inside, return first() + last().

  // 3. Print two lines. Print summary, then "Ends: " plus ends: "n=4 first=3 last=9" "Ends: 12"
}`,
    solutionCode: `fun main() {
  val start = 3
  val numbers = listOf(start, 1, 2, 9)
  val summary = with(numbers) {
    "n=" + size + " first=" + first() + " last=" + last()
  }
  val ends = with(numbers) {
    first() + last()
  }
  println(summary)
  println("Ends: " + ends)
}`,
    sampleInput: 'main()',
    expectedOutput: 'n=4 first=3 last=9\nEnds: 12',
    testCase: { call: '', expected: 'n=4 first=3 last=9\nEnds: 12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '3', alternateLiteral: '7' }],
      alternateExpectedOutput: 'n=4 first=7 last=9\nEnds: 16',
    },
  },
  {
    id: 'world-13-practice-writerun-this-or-it',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use apply and run with this, and let and also with it, on the same profile.',
    conceptTags: ['lesson:this-vs-it', 'this-vs-it', 'apply-this', 'let-it', 'also-it', 'run-this'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'This or It',
    goal: 'Use four scope functions on one profile. Some give the object as this and some as it. Print what each one finds.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Set up the profile.** Create `val p` with `Profile().apply { ... }`. Inside, set `name` to "Ada" and `age` to `years`. Here the object is `this`.\n\n' +
              '2. **Add the name length and age.** Create `val len` with `p.let { ... }`. Return `it.name.length + it.age`. Here the object is `it`.\n\n' +
              '3. **Add a tag.** Create `val tagged` with `p.also { ... }`. Inside, call `it.tags.add("seen")`. After the block, read `.tags.size`.\n\n' +
              '4. **Get the label.** Create `val label` with `p.run { ... }`. Inside, return `label()`.\n\n' +
              '5. **Print three lines.** Join the text with `+`:\n"Label: Ada (36)"\n"Length+age: 39"\n"Tags: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Set up the profile.** `apply` gives `this`.',
          '2. **Add the name length and age.** `let` gives `it`.',
          '3. **Add a tag.** `also` gives `it`.',
          '4. **Get the label.** `run` gives `this`.',
          '5. **Print three lines.** Show the label, the number and the tags.',
        ],
        comments: [
          '// 1. Set up the profile. apply gives this.',
          '// 2. Add the name length and age. let gives it.',
          '// 3. Add a tag. also gives it.',
          '// 4. Get the label. run gives this.',
          '// 5. Print three lines. Show the label, the number and the tags.',
        ],
      },
      experienced: {
        steps: [
          '1. **Set up the profile.**',
          '2. **Add the name length and age.**',
          '3. **Add a tag.**',
          '4. **Get the label.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Set up the profile.',
          '// 2. Add the name length and age.',
          '// 3. Add a tag.',
          '// 4. Get the label.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ThisOrIt.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. Set up the profile. Create val p with Profile().apply { ... }. Inside, set name to "Ada" and age to years. Here the object is this.

  // 2. Add the name length and age. Create val len with p.let { ... }. Return it.name.length + it.age. Here the object is it.

  // 3. Add a tag. Create val tagged with p.also { ... }. Inside, call it.tags.add("seen"). After the block, read .tags.size.

  // 4. Get the label. Create val label with p.run { ... }. Inside, return label().

  // 5. Print three lines. Join the text with +: "Label: Ada (36)" "Length+age: 39" "Tags: 1"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
  }
  val len = p.let { it.name.length + it.age }
  val tagged = p.also { it.tags.add("seen") }.tags.size
  val label = p.run { label() }
  println("Label: " + label)
  println("Length+age: " + len)
  println("Tags: " + tagged)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Label: Ada (36)\nLength+age: 39\nTags: 1',
    testCase: { call: '', expected: 'Label: Ada (36)\nLength+age: 39\nTags: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '36', alternateLiteral: '40' }],
      alternateExpectedOutput: 'Label: Ada (40)\nLength+age: 43\nTags: 1',
    },
  },
  {
    id: 'world-13-practice-writerun-named-lambdas',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'Give names to the lambda parameters of nested let blocks, so each object is clear.',
    conceptTags: ['lesson:this-vs-it', 'this-vs-it', 'named-lambda-parameter', 'nested-let'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Named Lambdas',
    goal: 'Use one let inside another. Name the two objects so that you do not mix them up. Print a total and a name.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Set up the profile.** Create `val p` with `Profile().apply { ... }`. Set `name` to "Ada" and `age` to `years`. Add the tags "math" and "code".\n\n' +
              '2. **Write the nested let.** Create `val total` with `p.let { person -> ... }`. Inside, use `person.tags.let { list -> ... }`. The inner result is `list.size + person.age`.\n\n' +
              '3. **Get the name.** Create `val shout` with `p.let { ... }`. Return `it.name.uppercase()`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Total: 38"\n"Name: ADA"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Set up the profile.** Set the name, the age and two tags.',
          '2. **Write the nested let.** Name them `person` and `list`.',
          '3. **Get the name.** Use `it.name.uppercase()`.',
          '4. **Print two lines.** Show the total and the name.',
        ],
        comments: [
          '// 1. Set up the profile. Set the name, the age and two tags.',
          '// 2. Write the nested let. Name them person and list.',
          '// 3. Get the name. Use it.name.uppercase().',
          '// 4. Print two lines. Show the total and the name.',
        ],
      },
      experienced: {
        steps: [
          '1. **Set up the profile.**',
          '2. **Write the nested let.**',
          '3. **Get the name.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Set up the profile.',
          '// 2. Write the nested let.',
          '// 3. Get the name.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NamedLambdas.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. Set up the profile. Create val p with Profile().apply { ... }. Set name to "Ada" and age to years. Add the tags "math" and "code".

  // 2. Write the nested let. Create val total with p.let { person -> ... }. Inside, use person.tags.let { list -> ... }. The inner result is list.size + person.age.

  // 3. Get the name. Create val shout with p.let { ... }. Return it.name.uppercase().

  // 4. Print two lines. Join the text with +: "Total: 38" "Name: ADA"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
    tags.add("math")
    tags.add("code")
  }
  val total = p.let { person -> person.tags.let { list -> list.size + person.age } }
  val shout = p.let { it.name.uppercase() }
  println("Total: " + total)
  println("Name: " + shout)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 38\nName: ADA',
    testCase: { call: '', expected: 'Total: 38\nName: ADA' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '36', alternateLiteral: '40' }],
      alternateExpectedOutput: 'Total: 42\nName: ADA',
    },
  },
  {
    id: 'world-13-practice-writerun-what-comes-back',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'See what each scope function returns: the block result or the object itself.',
    conceptTags: ['lesson:return-values-of-scope-functions', 'let-result', 'run-result', 'also-receiver', 'apply-receiver', 'with-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'What Comes Back',
    goal: 'Use five scope functions on the same word. Some return the result of the block. Some return the word. Print all five.',
    description: '1. **Use let and run.** Create `val a` with `word.let { it.length }`. Create `val b` with `word.run { length * 2 }`.\n\n' +
              '2. **Use also and apply.** Create `val c` with `word.also { it.length }`. Create `val d` with `word.apply { length }`.\n\n' +
              '3. **Use with.** Create `val e` with `with(word) { length + 1 }`.\n\n' +
              '4. **Print five lines.** Print `a`, `b`, `c`, `d` and `e`, each on its own line:\n"6"\n"12"\n"kotlin"\n"kotlin"\n"7"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Use let and run.** The block result comes back.',
          '2. **Use also and apply.** The word comes back.',
          '3. **Use with.** The block result comes back.',
          '4. **Print five lines.** Print each value.',
        ],
        comments: [
          '// 1. Use let and run. The block result comes back.',
          '// 2. Use also and apply. The word comes back.',
          '// 3. Use with. The block result comes back.',
          '// 4. Print five lines. Print each value.',
        ],
      },
      experienced: {
        steps: [
          '1. **Use let and run.**',
          '2. **Use also and apply.**',
          '3. **Use with.**',
          '4. **Print five lines.**',
        ],
        comments: [
          '// 1. Use let and run.',
          '// 2. Use also and apply.',
          '// 3. Use with.',
          '// 4. Print five lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WhatComesBack.kt',
    initialCode: `fun main() {
  val word = "kotlin"

  // 1. Use let and run. Create val a with word.let { it.length }. Create val b with word.run { length * 2 }.

  // 2. Use also and apply. Create val c with word.also { it.length }. Create val d with word.apply { length }.

  // 3. Use with. Create val e with with(word) { length + 1 }.

  // 4. Print five lines. Print a, b, c, d and e, each on its own line: "6" "12" "kotlin" "kotlin" "7"
}`,
    solutionCode: `fun main() {
  val word = "kotlin"
  val a = word.let { it.length }
  val b = word.run { length * 2 }
  val c = word.also { it.length }
  val d = word.apply { length }
  val e = with(word) { length + 1 }
  println(a)
  println(b)
  println(c)
  println(d)
  println(e)
}`,
    sampleInput: 'main()',
    expectedOutput: '6\n12\nkotlin\nkotlin\n7',
    testCase: { call: '', expected: '6\n12\nkotlin\nkotlin\n7' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'word', originalLiteral: '"kotlin"', alternateLiteral: '"ab"' }],
      alternateExpectedOutput: '2\n4\nab\nab\n3',
    },
  },
  {
    id: 'world-13-practice-writerun-list-results',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'See what apply, also, let and run return when you use them on a mutable list.',
    conceptTags: ['lesson:return-values-of-scope-functions', 'apply-receiver', 'also-receiver', 'let-result', 'run-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'List Results',
    goal: 'Change a list with four scope functions. Find what each one returns, and print the results.',
    description: '1. **Use apply.** Create `val r1` with `list.apply { add(3) }.size`.\n\n' +
              '2. **Use also.** Create `val r2` with `list.also { it.add(4) }.size`.\n\n' +
              '3. **Use let.** Create `val r3` with `list.let { it.add(5) }`. The block returns what `add` returns.\n\n' +
              '4. **Use run.** Create `val r4` with `list.run { sum() }`.\n\n' +
              '5. **Print four lines.** Join the text with `+`:\n"r1: 3"\n"r2: 4"\n"r3: true"\n"sum: 15"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Use apply.** Add `3`, then read `size`.',
          '2. **Use also.** Add `4`, then read `size`.',
          '3. **Use let.** Add `5` and keep the result.',
          '4. **Use run.** Return the sum.',
          '5. **Print four lines.** Show all four results.',
        ],
        comments: [
          '// 1. Use apply. Add 3, then read size.',
          '// 2. Use also. Add 4, then read size.',
          '// 3. Use let. Add 5 and keep the result.',
          '// 4. Use run. Return the sum.',
          '// 5. Print four lines. Show all four results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Use apply.**',
          '2. **Use also.**',
          '3. **Use let.**',
          '4. **Use run.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Use apply.',
          '// 2. Use also.',
          '// 3. Use let.',
          '// 4. Use run.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ListResults.kt',
    initialCode: `fun main() {
  val start = 1
  val list = mutableListOf(start, 2)

  // 1. Use apply. Create val r1 with list.apply { add(3) }.size.

  // 2. Use also. Create val r2 with list.also { it.add(4) }.size.

  // 3. Use let. Create val r3 with list.let { it.add(5) }. The block returns what add returns.

  // 4. Use run. Create val r4 with list.run { sum() }.

  // 5. Print four lines. Join the text with +: "r1: 3" "r2: 4" "r3: true" "sum: 15"
}`,
    solutionCode: `fun main() {
  val start = 1
  val list = mutableListOf(start, 2)
  val r1 = list.apply { add(3) }.size
  val r2 = list.also { it.add(4) }.size
  val r3 = list.let { it.add(5) }
  val r4 = list.run { sum() }
  println("r1: " + r1)
  println("r2: " + r2)
  println("r3: " + r3)
  println("sum: " + r4)
}`,
    sampleInput: 'main()',
    expectedOutput: 'r1: 3\nr2: 4\nr3: true\nsum: 15',
    testCase: { call: '', expected: 'r1: 3\nr2: 4\nr3: true\nsum: 15' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '1', alternateLiteral: '6' }],
      alternateExpectedOutput: 'r1: 3\nr2: 4\nr3: true\nsum: 20',
    },
  },
  {
    id: 'world-13-practice-writerun-pick-the-tool',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Choose apply to set up, also to log, let to compute and with to summarize.',
    conceptTags: ['lesson:choosing-the-appropriate-scope-function', 'apply', 'also', 'let', 'with', 'choose-by-purpose'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Pick the Tool',
    goal: 'Build a profile, log that it was built, compute a score, and write a summary. Pick the scope function that fits each job.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Set up the profile.** Create `val p` with `Profile().apply { ... }`. Set `name` to "Ada" and `age` to `years`.\n\n' +
              '2. **Log it.** After the `apply` block, add `.also { ... }`. Add "built ", `it.name` and ";" to `log`.\n\n' +
              '3. **Work out a score.** Create `val score` with `p.let { ... }`. Return `it.age * 2 + it.name.length`.\n\n' +
              '4. **Write a summary.** Create `val summary` with `with(p) { ... }`. Return `name`, "/" and `age`.\n\n' +
              '5. **Print three lines.** Join the text with `+`:\n"Log: built Ada;"\n"Score: 75"\n"Summary: Ada/36"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Set up the profile.** Use `apply`.',
          '2. **Log it.** Use `also`.',
          '3. **Work out a score.** Use `let`.',
          '4. **Write a summary.** Use `with`.',
          '5. **Print three lines.** Show the log, the score and the summary.',
        ],
        comments: [
          '// 1. Set up the profile. Use apply.',
          '// 2. Log it. Use also.',
          '// 3. Work out a score. Use let.',
          '// 4. Write a summary. Use with.',
          '// 5. Print three lines. Show the log, the score and the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Set up the profile.**',
          '2. **Log it.**',
          '3. **Work out a score.**',
          '4. **Write a summary.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Set up the profile.',
          '// 2. Log it.',
          '// 3. Work out a score.',
          '// 4. Write a summary.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PickTheTool.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  var log = ""

  // 1. Set up the profile. Create val p with Profile().apply { ... }. Set name to "Ada" and age to years.

  // 2. Log it. After the apply block, add .also { ... }. Add "built ", it.name and ";" to log.

  // 3. Work out a score. Create val score with p.let { ... }. Return it.age * 2 + it.name.length.

  // 4. Write a summary. Create val summary with with(p) { ... }. Return name, "/" and age.

  // 5. Print three lines. Join the text with +: "Log: built Ada;" "Score: 75" "Summary: Ada/36"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  var log = ""
  val p = Profile().apply {
    name = "Ada"
    age = years
  }.also { log += "built " + it.name + ";" }
  val score = p.let { it.age * 2 + it.name.length }
  val summary = with(p) { name + "/" + age }
  println("Log: " + log)
  println("Score: " + score)
  println("Summary: " + summary)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Log: built Ada;\nScore: 75\nSummary: Ada/36',
    testCase: { call: '', expected: 'Log: built Ada;\nScore: 75\nSummary: Ada/36' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '36', alternateLiteral: '40' }],
      alternateExpectedOutput: 'Log: built Ada;\nScore: 83\nSummary: Ada/40',
    },
  },
  {
    id: 'world-13-practice-writerun-null-and-config',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'Combine let for a null check with apply to build an object.',
    conceptTags: ['lesson:choosing-the-appropriate-scope-function', 'let', 'apply', 'nullable-input', 'function-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Null and Config',
    goal: 'Write a function that makes a profile from a name that may be missing. A missing name gives no profile. Print the label of two results.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Write build.** Above `main`, write `fun build(input: String?, years: Int): Profile?`. Return `input?.let { n -> ... }`. Inside, return `Profile().apply { ... }` that sets `name` to `n` and `age` to `years`.\n\n' +
              '2. **Build with a name.** Print `build("Bo", years)?.label() ?: "no profile"`:\n"Bo (9)"\n\n' +
              '3. **Build without a name.** Print `build(null, years)?.label() ?: "no profile"`:\n"no profile"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write build.** Use `?.let` and `apply`.',
          '2. **Build with a name.** Use `"Bo"`.',
          '3. **Build without a name.** Use `null`.',
        ],
        comments: [
          '// 1. Write build. Use ?.let and apply.',
          '// 2. Build with a name. Use "Bo".',
          '// 3. Build without a name. Use null.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write build.**',
          '2. **Build with a name.**',
          '3. **Build without a name.**',
        ],
        comments: [
          '// 1. Write build.',
          '// 2. Build with a name.',
          '// 3. Build without a name.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NullAndConfig.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

// 1. Write build. Above main, write fun build(input: String?, years: Int): Profile?. Return input?.let { n -> ... }. Inside, return Profile().apply { ... } that sets name to n and age to years.

fun main() {
  val years = 9

  // 2. Build with a name. Print build("Bo", years)?.label() ?: "no profile": "Bo (9)"

  // 3. Build without a name. Print build(null, years)?.label() ?: "no profile": "no profile"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun build(input: String?, years: Int): Profile? {
  return input?.let { n ->
    Profile().apply {
      name = n
      age = years
    }
  }
}

fun main() {
  val years = 9
  println(build("Bo", years)?.label() ?: "no profile")
  println(build(null, years)?.label() ?: "no profile")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Bo (9)\nno profile',
    testCase: { call: '', expected: 'Bo (9)\nno profile' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '9', alternateLiteral: '12' }],
      alternateExpectedOutput: 'Bo (12)\nno profile',
    },
  },
  {
    id: 'world-13-practice-writerun-chain-config',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Chain apply, also and let in one expression.',
    conceptTags: ['lesson:scope-function-chaining', 'chaining', 'apply', 'also', 'let'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Chain a Config',
    goal: 'Build a profile, log that it was made, and turn it into a text. Do it all in one chain. Print the text and the log.',
    description: 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.\n\n' +
              '1. **Build the profile.** Start `val label` with `Profile().apply { ... }`. Set `name` to "Cy" and `age` to `years`.\n\n' +
              '2. **Log it.** Add `.also { ... }` after the block. Add "made;" to `log`.\n\n' +
              '3. **Turn it into text.** Add `.let { ... }`. Return `it.name`, a space and `it.age`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Label: Cy 7"\n"Log: made;"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the profile.** Use `apply`.',
          '2. **Log it.** Use `also`.',
          '3. **Turn it into text.** Use `let`.',
          '4. **Print two lines.** Show the label and the log.',
        ],
        comments: [
          '// 1. Build the profile. Use apply.',
          '// 2. Log it. Use also.',
          '// 3. Turn it into text. Use let.',
          '// 4. Print two lines. Show the label and the log.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the profile.**',
          '2. **Log it.**',
          '3. **Turn it into text.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Build the profile.',
          '// 2. Log it.',
          '// 3. Turn it into text.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ChainConfig.kt',
    initialCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 7
  var log = ""

  // 1. Build the profile. Start val label with Profile().apply { ... }. Set name to "Cy" and age to years.

  // 2. Log it. Add .also { ... } after the block. Add "made;" to log.

  // 3. Turn it into text. Add .let { ... }. Return it.name, a space and it.age.

  // 4. Print two lines. Join the text with +: "Label: Cy 7" "Log: made;"
}`,
    solutionCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 7
  var log = ""
  val label = Profile().apply {
    name = "Cy"
    age = years
  }.also { log += "made;" }.let { it.name + " " + it.age }
  println("Label: " + label)
  println("Log: " + log)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Label: Cy 7\nLog: made;',
    testCase: { call: '', expected: 'Label: Cy 7\nLog: made;' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'years', originalLiteral: '7', alternateLiteral: '8' }],
      alternateExpectedOutput: 'Label: Cy 8\nLog: made;',
    },
  },
  {
    id: 'world-13-practice-writerun-chain-numbers',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'Chain filter, also, let and also to work out a result and write a log.',
    conceptTags: ['lesson:scope-function-chaining', 'chaining', 'filter', 'also', 'let', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Chain the Numbers',
    goal: 'Keep the numbers above a limit, double their sum, and write a log of what happened. Print the result and the log.',
    description: '1. **Filter the numbers.** Start `val result` with `numbers.filter { ... }`. Keep the numbers above `limit`.\n\n' +
              '2. **Log the size.** Add `.also { ... }`. Add `it.size.toString()` and ";" to `log`.\n\n' +
              '3. **Work out the result.** Add `.let { ... }`. Return `it.sum() * 2`.\n\n' +
              '4. **Log the end.** Add `.also { ... }`. Add "total;" to `log`.\n\n' +
              '5. **Print two lines.** Join the text with `+`:\n"Result: 56"\n"Log: 3;total;"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Filter the numbers.** Use `filter` and `limit`.',
          '2. **Log the size.** Use `also`.',
          '3. **Work out the result.** Use `let` and `sum()`.',
          '4. **Log the end.** Use `also` again.',
          '5. **Print two lines.** Show the result and the log.',
        ],
        comments: [
          '// 1. Filter the numbers. Use filter and limit.',
          '// 2. Log the size. Use also.',
          '// 3. Work out the result. Use let and sum().',
          '// 4. Log the end. Use also again.',
          '// 5. Print two lines. Show the result and the log.',
        ],
      },
      experienced: {
        steps: [
          '1. **Filter the numbers.**',
          '2. **Log the size.**',
          '3. **Work out the result.**',
          '4. **Log the end.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Filter the numbers.',
          '// 2. Log the size.',
          '// 3. Work out the result.',
          '// 4. Log the end.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ChainNumbers.kt',
    initialCode: `fun main() {
  var log = ""
  val limit = 5
  val numbers = listOf(4, 9, 2, 7, 12)

  // 1. Filter the numbers. Start val result with numbers.filter { ... }. Keep the numbers above limit.

  // 2. Log the size. Add .also { ... }. Add it.size.toString() and ";" to log.

  // 3. Work out the result. Add .let { ... }. Return it.sum() * 2.

  // 4. Log the end. Add .also { ... }. Add "total;" to log.

  // 5. Print two lines. Join the text with +: "Result: 56" "Log: 3;total;"
}`,
    solutionCode: `fun main() {
  var log = ""
  val limit = 5
  val numbers = listOf(4, 9, 2, 7, 12)
  val result = numbers.filter { it > limit }.also { log += it.size.toString() + ";" }.let { it.sum() * 2 }.also { log += "total;" }
  println("Result: " + result)
  println("Log: " + log)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: 56\nLog: 3;total;',
    testCase: { call: '', expected: 'Result: 56\nLog: 3;total;' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '5', alternateLiteral: '8' }],
      alternateExpectedOutput: 'Result: 42\nLog: 2;total;',
    },
  },
  {
    id: 'world-13-practice-writerun-nested-lets',
    worldId: 'world-13',
    difficulty: 'medium',
    summary: 'Use two let blocks with clear names, and a default when any value is missing.',
    conceptTags: ['lesson:avoiding-overuse-and-nesting', 'nested-let', 'named-lambda-parameter', 'nullable'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Nested Lets',
    goal: 'Two texts may be missing. When both exist, add their lengths. When one is missing, the answer is 0.',
    description: '1. **Start the outer let.** Create `val total` with `a?.let { first -> ... }`.\n\n' +
              '2. **Write the inner let.** Inside, use `b?.let { second -> ... }`. Return `first.length + second.length`.\n\n' +
              '3. **Add a default and print.** After the outer block, add `?: 0`. Print "Total: " plus `total`:\n"Total: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the outer let.** Name the parameter `first`.',
          '2. **Write the inner let.** Name the parameter `second`.',
          '3. **Add a default and print.** Use `?: 0`, then print.',
        ],
        comments: [
          '// 1. Start the outer let. Name the parameter first.',
          '// 2. Write the inner let. Name the parameter second.',
          '// 3. Add a default and print. Use ?: 0, then print.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the outer let.**',
          '2. **Write the inner let.**',
          '3. **Add a default and print.**',
        ],
        comments: [
          '// 1. Start the outer let.',
          '// 2. Write the inner let.',
          '// 3. Add a default and print.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NestedLets.kt',
    initialCode: `fun main() {
  val a: String? = "x"
  val b: String? = "yz"

  // 1. Start the outer let. Create val total with a?.let { first -> ... }.

  // 2. Write the inner let. Inside, use b?.let { second -> ... }. Return first.length + second.length.

  // 3. Add a default and print. After the outer block, add ?: 0. Print "Total: " plus total: "Total: 3"
}`,
    solutionCode: `fun main() {
  val a: String? = "x"
  val b: String? = "yz"
  val total = a?.let { first ->
    b?.let { second ->
      first.length + second.length
    }
  } ?: 0
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 3',
    testCase: { call: '', expected: 'Total: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'b', originalLiteral: '"yz"', alternateLiteral: 'null' }],
      alternateExpectedOutput: 'Total: 0',
    },
  },
  {
    id: 'world-13-practice-writerun-guard-instead',
    worldId: 'world-13',
    difficulty: 'hard',
    summary: 'Write plain code with a null check and an early return, instead of nested lets.',
    conceptTags: ['lesson:avoiding-overuse-and-nesting', 'null-guard', 'plain-code', 'early-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Guard Instead of Nesting',
    goal: 'Add the lengths of two texts that may be missing. Return 0 when one is missing. Use simple code, with no nesting.',
    description: '1. **Write total.** Above `main`, write `fun total(a: String?, b: String?): Int`. When `a == null || b == null`, return `0`. Otherwise return `a.length + b.length`.\n\n' +
              '2. **Try two texts.** Print `total("x", "yz")`:\n"3"\n\n' +
              '3. **Try a missing text.** Print `total("x", null)`:\n"0"\n\n' +
              '4. **Try the word.** Print `total(w, "ab")`:\n"8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write total.** Use an early `return 0`.',
          '2. **Try two texts.** Use `"x"` and `"yz"`.',
          '3. **Try a missing text.** Use `null`.',
          '4. **Try the word.** Use `w` and `"ab"`.',
        ],
        comments: [
          '// 1. Write total. Use an early return 0.',
          '// 2. Try two texts. Use "x" and "yz".',
          '// 3. Try a missing text. Use null.',
          '// 4. Try the word. Use w and "ab".',
        ],
      },
      experienced: {
        steps: [
          '1. **Write total.**',
          '2. **Try two texts.**',
          '3. **Try a missing text.**',
          '4. **Try the word.**',
        ],
        comments: [
          '// 1. Write total.',
          '// 2. Try two texts.',
          '// 3. Try a missing text.',
          '// 4. Try the word.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GuardInstead.kt',
    initialCode: `// 1. Write total. Above main, write fun total(a: String?, b: String?): Int. When a == null || b == null, return 0. Otherwise return a.length + b.length.

fun main() {
  val w = "kotlin"

  // 2. Try two texts. Print total("x", "yz"): "3"

  // 3. Try a missing text. Print total("x", null): "0"

  // 4. Try the word. Print total(w, "ab"): "8"
}`,
    solutionCode: `fun total(a: String?, b: String?): Int {
  if (a == null || b == null) {
    return 0
  }
  return a.length + b.length
}

fun main() {
  val w = "kotlin"
  println(total("x", "yz"))
  println(total("x", null))
  println(total(w, "ab"))
}`,
    sampleInput: 'main()',
    expectedOutput: '3\n0\n8',
    testCase: { call: '', expected: '3\n0\n8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'w', originalLiteral: '"kotlin"', alternateLiteral: '"go"' }],
      alternateExpectedOutput: '3\n0\n4',
    },
  },
];

export const WORLD_13_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-13-practice-debug-let-no-it',
    worldId: 'world-13',
    conceptTags: ['lesson:let-run', 'let', 'it-vs-this'],
    summary: 'let gives the object as it, so a plain name is not found.',
    title: 'Fix the Missing it',
    subtitle: 'The program should print "Ada", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: let gives the object as it, not as this',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.let {
    name = "Ada"
  }
  println(p.name)
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.let {
    it.name = "Ada"
  }
  println(p.name)
}`,
    expectedOutput: 'Ada',
    hints: [
              'Look at the line inside the `let` block. Where does `name` come from?',
              '`let` gives the object as `it`. It does not give a `this`, so `name` alone is unknown.',
              'Use the name that `let` gives to reach the property.',
            ],
    explanation: 'Inside `let`, the object is `it`. The code writes `name = "Ada"`, but `name` alone belongs to `this`, which is not the profile. Writing `it.name = "Ada"` reaches the property, and the program prints `Ada`.',
  },
  {
    id: 'world-13-practice-debug-let-null-text',
    worldId: 'world-13',
    conceptTags: ['lesson:let-run', 'let', 'nullable-receiver', 'elvis'],
    summary: 'A missing value leaves a null result with no default.',
    title: 'Fix the Null Length',
    subtitle: 'The program should print "Length: 0" for a missing title, but it prints "Length: null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a null receiver leaves a null result',
    brokenCode: `fun main() {
  val title: String? = null
  val n = title?.let { it.length }
  println("Length: " + n)
}`,
    fixedCode: `fun main() {
  val title: String? = null
  val n = title?.let { it.length } ?: 0
  println("Length: " + n)
}`,
    expectedOutput: 'Length: 0',
    hints: [
              'Look at the value of `title`. What does `?.let` do when it is `null`?',
              'A `null` receiver skips the block, and the whole expression is `null`.',
              'Give the expression a default value for the `null` case.',
            ],
    explanation: '`title?.let { ... }` does not run the block when `title` is `null`, so `n` is `null` and prints as `null`. Adding `?: 0` gives a default number, so the program prints `Length: 0`.',
  },
  {
    id: 'world-13-practice-debug-it-in-apply',
    worldId: 'world-13',
    conceptTags: ['lesson:apply', 'apply', 'this-vs-it'],
    summary: 'apply gives this, so it does not exist.',
    title: 'Fix the Apply Block',
    subtitle: 'The program should print "Ada", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: apply gives the object as this, not as it',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    it.name = "Ada"
  }
  println(p.name)
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    name = "Ada"
  }
  println(p.name)
}`,
    expectedOutput: 'Ada',
    hints: [
              'Look at the line inside the `apply` block. Where does `it` come from?',
              '`apply` gives the object as `this`. It does not create `it`.',
              'Inside `apply`, use the property names directly.',
            ],
    explanation: '`apply` is a function with a receiver, so the profile is `this` inside the block. There is no `it`, so `it.name` cannot compile. Writing `name = "Ada"` sets the property on `this`.',
  },
  {
    id: 'world-13-practice-debug-also-result',
    worldId: 'world-13',
    conceptTags: ['lesson:also', 'also', 'returns-receiver'],
    summary: 'also returns the object, so its result is not a number.',
    title: 'Fix the Also Result',
    subtitle: 'The program should print "2", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: also returns the object, not the block result',
    brokenCode: `fun main() {
  val len: Int = "hi".also { it.length }
  println(len)
}`,
    fixedCode: `fun main() {
  val len = "hi".let { it.length }
  println(len)
}`,
    expectedOutput: '2',
    hints: [
              'Look at the type of `len` and at what `also` gives back.',
              '`also` returns the object it was called on, which is the text "hi", not the block result.',
              'Use the scope function that returns the result of its block.',
            ],
    explanation: '`also` always returns the original object, so `"hi".also { it.length }` is the text `"hi"`. That cannot be stored in an `Int`. `let` returns the result of its block, so `"hi".let { it.length }` is `2`.',
  },
  {
    id: 'world-13-practice-debug-with-receiver',
    worldId: 'world-13',
    conceptTags: ['lesson:with', 'with', 'receiver-as-argument'],
    summary: 'with takes the object as an argument, not with a dot.',
    title: 'Fix the With Call',
    subtitle: 'The program should print "Bo", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: with takes the object as an argument',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.name = "Bo"
  val t = p.with {
    name
  }
  println(t)
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.name = "Bo"
  val t = with(p) {
    name
  }
  println(t)
}`,
    expectedOutput: 'Bo',
    hints: [
              'Look at how `with` is called. Where is the object?',
              '`with` is not called on an object with a dot. It is a function that takes the object as an argument.',
              'Write `with` first and give it the object in brackets.',
            ],
    explanation: '`with` takes the object as its first argument, like `with(p) { ... }`. There is no `p.with`, so Kotlin cannot find it. Writing `with(p) { name }` returns the name, `Bo`.',
  },
  {
    id: 'world-13-practice-debug-param-shadow',
    worldId: 'world-13',
    conceptTags: ['lesson:this-vs-it', 'this', 'name-shadowing'],
    summary: 'The parameter name hides the property name.',
    title: 'Fix the Shadowed Name',
    subtitle: 'The program should print "Gus", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: the parameter hides the property inside apply',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun make(name: String): Profile {
  return Profile().apply {
    name = name
  }
}

fun main() {
  println(make("Gus").name)
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun make(name: String): Profile {
  return Profile().apply {
    this.name = name
  }
}

fun main() {
  println(make("Gus").name)
}`,
    expectedOutput: 'Gus',
    hints: [
              'Look at the line `name = name`. How many things are called `name` here?',
              'The function parameter `name` hides the property `name`. Both sides mean the parameter, and a parameter cannot be changed.',
              'Name the object that owns the property on the left side.',
            ],
    explanation: 'Inside `apply`, the parameter `name` is found before the property `name`, so `name = name` tries to change the parameter. Writing `this.name = name` sets the property of the profile to the parameter value, and the program prints `Gus`.',
  },
  {
    id: 'world-13-practice-debug-apply-returns-receiver',
    worldId: 'world-13',
    conceptTags: ['lesson:return-values-of-scope-functions', 'apply', 'returns-receiver', 'block-result'],
    summary: 'apply returns the text, not the length.',
    title: 'Fix the Length',
    subtitle: 'The program should print "Length: 5", but it prints "Length: hello".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: apply gives the text back, not its length',
    brokenCode: `fun main() {
  val len = "hello".apply { length }
  println("Length: " + len)
}`,
    fixedCode: `fun main() {
  val len = "hello".let { it.length }
  println("Length: " + len)
}`,
    expectedOutput: 'Length: 5',
    hints: [
              'Look at the output. What was stored in `len`?',
              '`apply` returns the object it was called on, not the result of its block.',
              'Use a scope function that returns the result of the block.',
            ],
    explanation: '`apply` returns the receiver, so `len` holds the text `"hello"`. The block result `length` is thrown away. `let` returns the block result, so `"hello".let { it.length }` gives `5`.',
  },
  {
    id: 'world-13-practice-debug-run-unit',
    worldId: 'world-13',
    conceptTags: ['lesson:choosing-the-appropriate-scope-function', 'run-vs-apply', 'block-result'],
    summary: 'run returns the last line, not the object.',
    title: 'Fix the Wrong Tool',
    subtitle: 'The program should print "Ada (9)", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: run returns the last line, not the object',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().run {
    name = "Ada"
    age = 9
  }
  println(p.label())
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    name = "Ada"
    age = 9
  }
  println(p.label())
}`,
    expectedOutput: 'Ada (9)',
    hints: [
              'Look at what `p` holds after the `run` block.',
              '`run` returns the last line of its block. The last line is an assignment, which gives nothing useful, so `p` is not a `Profile`.',
              'Use the scope function that returns the object itself.',
            ],
    explanation: '`run` returns the value of its last line. An assignment has no value to return, so `p` is not a profile and `p.label()` fails. `apply` returns the object, so `p` is the `Profile` and the label is `Ada (9)`.',
  },
  {
    id: 'world-13-practice-debug-log-before-filter',
    worldId: 'world-13',
    conceptTags: ['lesson:scope-function-chaining', 'chaining', 'order-of-steps', 'also', 'filter'],
    summary: 'The log runs before the filter.',
    title: 'Fix the Chain Order',
    subtitle: 'The program should print "kept 3" and "3", but it prints "kept 5" and "3".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the log runs before the filter',
    brokenCode: `fun main() {
  var log = ""
  val numbers = listOf(4, 9, 2, 7, 12)
  val big = numbers.also { log = "kept " + it.size }.filter { it > 5 }
  println(log)
  println(big.size)
}`,
    fixedCode: `fun main() {
  var log = ""
  val numbers = listOf(4, 9, 2, 7, 12)
  val big = numbers.filter { it > 5 }.also { log = "kept " + it.size }
  println(log)
  println(big.size)
}`,
    expectedOutput: 'kept 3\n3',
    hints: [
              'Look at the number in the log. How many numbers are kept?',
              'The `also` block runs before `filter`, so it sees all five numbers.',
              'Change the order of the two calls so the log sees the filtered list.',
            ],
    explanation: 'The chain runs from left to right. `also` comes first, so `it.size` is the size of the full list, `5`. If `filter` comes first and `also` after it, the log sees the kept numbers and says `kept 3`.',
  },
  {
    id: 'world-13-practice-debug-nested-apply',
    worldId: 'world-13',
    conceptTags: ['lesson:avoiding-overuse-and-nesting', 'nested-apply', 'receiver-confusion'],
    summary: 'The inner apply changes a different object.',
    title: 'Fix the Nested Apply',
    subtitle: 'The program should print "Zed|", but it prints "|Zed".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the inner apply changes a different object',
    brokenCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val a = Profile()
  val b = Profile()
  a.apply {
    b.apply {
      name = "Zed"
    }
  }
  println(a.name + "|" + b.name)
}`,
    fixedCode: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val a = Profile()
  val b = Profile()
  a.apply {
    name = "Zed"
  }
  println(a.name + "|" + b.name)
}`,
    expectedOutput: 'Zed|',
    hints: [
              'Look at which profile has the name `Zed` in the output.',
              'In the inner `apply`, `this` is `b`. A plain `name` means the closest receiver, which is `b`.',
              'Remove the extra nesting, so the block works on the profile you want to change.',
            ],
    explanation: 'Inside the inner `apply`, the closest receiver is `b`, so `name = "Zed"` changes `b`. Nesting made it hard to see. Using only `a.apply { name = "Zed" }` changes `a`, and the program prints `Zed|`.',
  },
];
