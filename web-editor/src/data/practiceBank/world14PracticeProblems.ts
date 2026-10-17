import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 14 -- Sequence Dimension (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the sequence feature (asSequence, take, first, any, terminal ...) is named in the step.
//   hard   -- evaluation order or work counted with a counter, a pipeline that needs every item (sorted), reuse of a sequence,
//             or several operations together; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world14.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world14.real.ts). Evaluation order is shown with println
// inside the lambdas or with counters. The simulator lacks distinct, joinToString, mapIndexed, max and last on Sequence
// (PITFALLS.md), so no task uses them.

export const WORLD_14_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-14-practice-writerun-nothing-yet',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Build a sequence with a print inside map, and see that nothing runs until toList.',
    conceptTags: ['lesson:what-sequences-are', 'lazy', 'sequence-pipeline', 'terminal-operation'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Nothing Yet',
    goal: 'Build a sequence that prints a line for each item. Print "built" before you ask for the list. See when the prints happen.',
    description: '1. **Build the sequence.** Create `val seq` with `listOf(1, 2, 3).asSequence().map { ... }`. Inside, print "map " plus `it`. Then return `it * factor`.\n\n' +
              '2. **Print before.** Print "built":\n"built"\n\n' +
              '3. **Ask for the list.** Create `val list` with `seq.toList()`.\n\n' +
              '4. **Print the list.** Use a string template:\n"map 1"\n"map 2"\n"map 3"\n"List: [3, 6, 9]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the sequence.** Use `asSequence().map` and print inside.',
          '2. **Print before.** Print "built".',
          '3. **Ask for the list.** Call `toList()`.',
          '4. **Print the list.** Show the list.',
        ],
        comments: [
          '// 1. Build the sequence. Use asSequence().map and print inside.',
          '// 2. Print before. Print "built".',
          '// 3. Ask for the list. Call toList().',
          '// 4. Print the list. Show the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the sequence.**',
          '2. **Print before.**',
          '3. **Ask for the list.**',
          '4. **Print the list.**',
        ],
        comments: [
          '// 1. Build the sequence.',
          '// 2. Print before.',
          '// 3. Ask for the list.',
          '// 4. Print the list.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NothingYet.kt',
    initialCode: `fun main() {
  val factor = 3

  // 1. Build the sequence. Create val seq with listOf(1, 2, 3).asSequence().map { ... }. Inside, print "map " plus it. Then return it * factor.

  // 2. Print before. Print "built": "built"

  // 3. Ask for the list. Create val list with seq.toList().

  // 4. Print the list. Use a string template: "map 1" "map 2" "map 3" "List: [3, 6, 9]"
}`,
    solutionCode: `fun main() {
  val factor = 3
  val seq = listOf(1, 2, 3).asSequence().map {
    println("map " + it)
    it * factor
  }
  println("built")
  val list = seq.toList()
  println("List: $list")
}`,
    sampleInput: 'main()',
    expectedOutput: 'built\nmap 1\nmap 2\nmap 3\nList: [3, 6, 9]',
    testCase: { call: '', expected: 'built\nmap 1\nmap 2\nmap 3\nList: [3, 6, 9]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'factor', originalLiteral: '3', alternateLiteral: '10' }],
      alternateExpectedOutput: 'built\nmap 1\nmap 2\nmap 3\nList: [10, 20, 30]',
    },
  },
  {
    id: 'world-14-practice-writerun-seq-stats',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Build a sequence from a range, then ask for its items, its count and its sum.',
    conceptTags: ['lesson:what-sequences-are', 'sequence', 'filter', 'toList', 'count', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Sequence Stats',
    goal: 'Keep the multiples of a number from 1 to 10. Print the items, how many there are, and their sum.',
    description: '1. **Build the sequence.** Create `val s` with `(1..10).asSequence().filter { ... }`. Keep the numbers where `it % step == 0`.\n\n' +
              '2. **Ask three questions.** Create `val items` with `s.toList()`, `val count` with `s.count()` and `val sum` with `s.sum()`.\n\n' +
              '3. **Print three lines.** Use a string template for the list:\n"Items: [3, 6, 9]"\n"Count: 3"\n"Sum: 18"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the sequence.** Use `filter` and `step`.',
          '2. **Ask three questions.** Use `toList()`, `count()` and `sum()`.',
          '3. **Print three lines.** Show all three.',
        ],
        comments: [
          '// 1. Build the sequence. Use filter and step.',
          '// 2. Ask three questions. Use toList(), count() and sum().',
          '// 3. Print three lines. Show all three.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the sequence.**',
          '2. **Ask three questions.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Build the sequence.',
          '// 2. Ask three questions.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SeqStats.kt',
    initialCode: `fun main() {
  val step = 3

  // 1. Build the sequence. Create val s with (1..10).asSequence().filter { ... }. Keep the numbers where it % step == 0.

  // 2. Ask three questions. Create val items with s.toList(), val count with s.count() and val sum with s.sum().

  // 3. Print three lines. Use a string template for the list: "Items: [3, 6, 9]" "Count: 3" "Sum: 18"
}`,
    solutionCode: `fun main() {
  val step = 3
  val s = (1..10).asSequence().filter { it % step == 0 }
  val items = s.toList()
  val count = s.count()
  val sum = s.sum()
  println("Items: $items")
  println("Count: " + count)
  println("Sum: " + sum)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Items: [3, 6, 9]\nCount: 3\nSum: 18',
    testCase: { call: '', expected: 'Items: [3, 6, 9]\nCount: 3\nSum: 18' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'step', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Items: [4, 8]\nCount: 2\nSum: 12',
    },
  },
  {
    id: 'world-14-practice-writerun-eager-trace',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Chain filter and map on a list and watch each step finish for all items before the next.',
    conceptTags: ['lesson:eager-collection-processing', 'eager', 'filter', 'map', 'processing-order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Eager Trace',
    goal: 'Filter and map a list, and print a line each time a step looks at an item. See the order of the lines.',
    description: '1. **Write the filter.** Start `val r` with `listOf(1, 2, 3, 4).filter { ... }`. Inside, print "filter " plus `it`. Return `it % divisor == 0`.\n\n' +
              '2. **Write the map.** Add `.map { ... }`. Inside, print "map " plus `it`. Return `it * 10`.\n\n' +
              '3. **Print the result.** Use a string template:\n"filter 1"\n"filter 2"\n"filter 3"\n"filter 4"\n"map 2"\n"map 4"\n"R: [20, 40]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the filter.** Print each item, keep the even ones.',
          '2. **Write the map.** Print each item, multiply by `10`.',
          '3. **Print the result.** Show `r`.',
        ],
        comments: [
          '// 1. Write the filter. Print each item, keep the even ones.',
          '// 2. Write the map. Print each item, multiply by 10.',
          '// 3. Print the result. Show r.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the filter.**',
          '2. **Write the map.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Write the filter.',
          '// 2. Write the map.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'EagerTrace.kt',
    initialCode: `fun main() {
  val divisor = 2

  // 1. Write the filter. Start val r with listOf(1, 2, 3, 4).filter { ... }. Inside, print "filter " plus it. Return it % divisor == 0.

  // 2. Write the map. Add .map { ... }. Inside, print "map " plus it. Return it * 10.

  // 3. Print the result. Use a string template: "filter 1" "filter 2" "filter 3" "filter 4" "map 2" "map 4" "R: [20, 40]"
}`,
    solutionCode: `fun main() {
  val divisor = 2
  val r = listOf(1, 2, 3, 4)
    .filter {
      println("filter " + it)
      it % divisor == 0
    }
    .map {
      println("map " + it)
      it * 10
    }
  println("R: $r")
}`,
    sampleInput: 'main()',
    expectedOutput: 'filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 2\nmap 4\nR: [20, 40]',
    testCase: { call: '', expected: 'filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 2\nmap 4\nR: [20, 40]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'divisor', originalLiteral: '2', alternateLiteral: '4' }],
      alternateExpectedOutput: 'filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 4\nR: [40]',
    },
  },
  {
    id: 'world-14-practice-writerun-eager-counts',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Count how many times filter and map run when you use them on a list.',
    conceptTags: ['lesson:eager-collection-processing', 'eager', 'counters', 'filter', 'map'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Eager Counts',
    goal: 'Keep the numbers above a limit and double them. Count how many items each step looks at.',
    description: '1. **Write the filter.** Start `val r` with `listOf(1, 2, 3, 4, 5, 6).filter { ... }`. Inside, add `1` to `checks`. Return `it > limit`.\n\n' +
              '2. **Write the map.** Add `.map { ... }`. Inside, add `1` to `maps`. Return `it * 2`.\n\n' +
              '3. **Print the result.** Use a string template:\n"Result: [8, 10, 12]"\n\n' +
              '4. **Print the counts.** Print "Checks: " plus `checks`, then "Maps: " plus `maps`:\n"Checks: 6"\n"Maps: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the filter.** Count each check.',
          '2. **Write the map.** Count each map.',
          '3. **Print the result.** Show `r`.',
          '4. **Print the counts.** Show both counters.',
        ],
        comments: [
          '// 1. Write the filter. Count each check.',
          '// 2. Write the map. Count each map.',
          '// 3. Print the result. Show r.',
          '// 4. Print the counts. Show both counters.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the filter.**',
          '2. **Write the map.**',
          '3. **Print the result.**',
          '4. **Print the counts.**',
        ],
        comments: [
          '// 1. Write the filter.',
          '// 2. Write the map.',
          '// 3. Print the result.',
          '// 4. Print the counts.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'EagerCounts.kt',
    initialCode: `fun main() {
  val limit = 3
  var checks = 0
  var maps = 0

  // 1. Write the filter. Start val r with listOf(1, 2, 3, 4, 5, 6).filter { ... }. Inside, add 1 to checks. Return it > limit.

  // 2. Write the map. Add .map { ... }. Inside, add 1 to maps. Return it * 2.

  // 3. Print the result. Use a string template: "Result: [8, 10, 12]"

  // 4. Print the counts. Print "Checks: " plus checks, then "Maps: " plus maps: "Checks: 6" "Maps: 3"
}`,
    solutionCode: `fun main() {
  val limit = 3
  var checks = 0
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6)
    .filter {
      checks += 1
      it > limit
    }
    .map {
      maps += 1
      it * 2
    }
  println("Result: $r")
  println("Checks: " + checks)
  println("Maps: " + maps)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: [8, 10, 12]\nChecks: 6\nMaps: 3',
    testCase: { call: '', expected: 'Result: [8, 10, 12]\nChecks: 6\nMaps: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Result: [10, 12]\nChecks: 6\nMaps: 2',
    },
  },
  {
    id: 'world-14-practice-writerun-lazy-trace',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Build a lazy pipeline, print before and after you ask for the list, and watch the order.',
    conceptTags: ['lesson:lazy-processing', 'lazy', 'asSequence', 'toList', 'processing-order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Lazy Trace',
    goal: 'Build a lazy pipeline with prints inside. Print "before" and "after" around the call that runs it.',
    description: '1. **Write the filter.** Start `val seq` with `listOf(1, 2, 3, 4).asSequence().filter { ... }`. Inside, print "filter " plus `it`. Return `it % divisor == 0`.\n\n' +
              '2. **Write the map.** Add `.map { ... }`. Inside, print "map " plus `it`. Return `it * 10`.\n\n' +
              '3. **Print before.** Print "before":\n"before"\n\n' +
              '4. **Run the pipeline.** Create `val r` with `seq.toList()`.\n\n' +
              '5. **Print after.** Print "after", then "R: " plus the list with a string template:\n"filter 1"\n"filter 2"\n"map 2"\n"filter 3"\n"filter 4"\n"map 4"\n"after"\n"R: [20, 40]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the filter.** Print each item, keep the even ones.',
          '2. **Write the map.** Print each item, multiply by `10`.',
          '3. **Print before.** Print "before".',
          '4. **Run the pipeline.** Call `toList()`.',
          '5. **Print after.** Show "after" and the list.',
        ],
        comments: [
          '// 1. Write the filter. Print each item, keep the even ones.',
          '// 2. Write the map. Print each item, multiply by 10.',
          '// 3. Print before. Print "before".',
          '// 4. Run the pipeline. Call toList().',
          '// 5. Print after. Show "after" and the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the filter.**',
          '2. **Write the map.**',
          '3. **Print before.**',
          '4. **Run the pipeline.**',
          '5. **Print after.**',
        ],
        comments: [
          '// 1. Write the filter.',
          '// 2. Write the map.',
          '// 3. Print before.',
          '// 4. Run the pipeline.',
          '// 5. Print after.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LazyTrace.kt',
    initialCode: `fun main() {
  val divisor = 2

  // 1. Write the filter. Start val seq with listOf(1, 2, 3, 4).asSequence().filter { ... }. Inside, print "filter " plus it. Return it % divisor == 0.

  // 2. Write the map. Add .map { ... }. Inside, print "map " plus it. Return it * 10.

  // 3. Print before. Print "before": "before"

  // 4. Run the pipeline. Create val r with seq.toList().

  // 5. Print after. Print "after", then "R: " plus the list with a string template: "filter 1" "filter 2" "map 2" "filter 3" "filter 4" "map 4" "after" "R: [20, 40]"
}`,
    solutionCode: `fun main() {
  val divisor = 2
  val seq = listOf(1, 2, 3, 4).asSequence()
    .filter {
      println("filter " + it)
      it % divisor == 0
    }
    .map {
      println("map " + it)
      it * 10
    }
  println("before")
  val r = seq.toList()
  println("after")
  println("R: $r")
}`,
    sampleInput: 'main()',
    expectedOutput: 'before\nfilter 1\nfilter 2\nmap 2\nfilter 3\nfilter 4\nmap 4\nafter\nR: [20, 40]',
    testCase: { call: '', expected: 'before\nfilter 1\nfilter 2\nmap 2\nfilter 3\nfilter 4\nmap 4\nafter\nR: [20, 40]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'divisor', originalLiteral: '2', alternateLiteral: '4' }],
      alternateExpectedOutput: 'before\nfilter 1\nfilter 2\nfilter 3\nfilter 4\nmap 4\nafter\nR: [40]',
    },
  },
  {
    id: 'world-14-practice-writerun-lazy-take',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use take on a long lazy pipeline and count how little work it does.',
    conceptTags: ['lesson:lazy-processing', 'lazy', 'take', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Lazy Take',
    goal: 'Double the numbers from 1 to 100 but only keep a few. Count how many numbers were really doubled.',
    description: '1. **Build the pipeline.** Start `val r` with `(1..100).asSequence().map { ... }`. Inside, add `1` to `maps`. Return `it * 2`.\n\n' +
              '2. **Keep a few.** Add `.take(count).toList()`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"Result: [2, 4, 6]"\n"Maps: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the pipeline.** Use `asSequence().map` and count the maps.',
          '2. **Keep a few.** Use `take(count)`.',
          '3. **Print two lines.** Show the list and `maps`.',
        ],
        comments: [
          '// 1. Build the pipeline. Use asSequence().map and count the maps.',
          '// 2. Keep a few. Use take(count).',
          '// 3. Print two lines. Show the list and maps.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the pipeline.**',
          '2. **Keep a few.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Build the pipeline.',
          '// 2. Keep a few.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LazyTake.kt',
    initialCode: `fun main() {
  val count = 3
  var maps = 0

  // 1. Build the pipeline. Start val r with (1..100).asSequence().map { ... }. Inside, add 1 to maps. Return it * 2.

  // 2. Keep a few. Add .take(count).toList().

  // 3. Print two lines. Use a string template for the list: "Result: [2, 4, 6]" "Maps: 3"
}`,
    solutionCode: `fun main() {
  val count = 3
  var maps = 0
  val r = (1..100).asSequence().map {
    maps += 1
    it * 2
  }.take(count).toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: [2, 4, 6]\nMaps: 3',
    testCase: { call: '', expected: 'Result: [2, 4, 6]\nMaps: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Result: [2, 4, 6, 8, 10]\nMaps: 5',
    },
  },
  {
    id: 'world-14-practice-writerun-make-sequences',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Make sequences with generateSequence, sequenceOf and a sequence builder.',
    conceptTags: ['lesson:creating-sequences', 'sequenceOf', 'generateSequence', 'sequence-builder'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Make Sequences',
    goal: 'Make three sequences in three ways: doubling numbers, a fixed list, and a built list. Print each as a list.',
    description: '1. **Make the doubles.** Create `val doubles` with `generateSequence(start) { it * 2 }`. Take the first `6` items and make a list.\n\n' +
              '2. **Make the fixed one.** Create `val fixed` with `sequenceOf(3, 1, 2)`. Sort it and make a list.\n\n' +
              '3. **Build one.** Create `val built` with `sequence { ... }`. Inside, call `yield(start)`, `yield(start + 1)` and `yield(start + 2)`. Then use `.map { it * 10 }` and make a list.\n\n' +
              '4. **Print three lines.** Use string templates:\n"Doubles: [1, 2, 4, 8, 16, 32]"\n"Sorted: [1, 2, 3]"\n"Built: [10, 20, 30]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make the doubles.** Use `generateSequence` and `take(6)`.',
          '2. **Make the fixed one.** Use `sequenceOf` and `sorted()`.',
          '3. **Build one.** Use `sequence` and `yield`.',
          '4. **Print three lines.** Show all three lists.',
        ],
        comments: [
          '// 1. Make the doubles. Use generateSequence and take(6).',
          '// 2. Make the fixed one. Use sequenceOf and sorted().',
          '// 3. Build one. Use sequence and yield.',
          '// 4. Print three lines. Show all three lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make the doubles.**',
          '2. **Make the fixed one.**',
          '3. **Build one.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Make the doubles.',
          '// 2. Make the fixed one.',
          '// 3. Build one.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MakeSequences.kt',
    initialCode: `fun main() {
  val start = 1

  // 1. Make the doubles. Create val doubles with generateSequence(start) { it * 2 }. Take the first 6 items and make a list.

  // 2. Make the fixed one. Create val fixed with sequenceOf(3, 1, 2). Sort it and make a list.

  // 3. Build one. Create val built with sequence { ... }. Inside, call yield(start), yield(start + 1) and yield(start + 2). Then use .map { it * 10 } and make a list.

  // 4. Print three lines. Use string templates: "Doubles: [1, 2, 4, 8, 16, 32]" "Sorted: [1, 2, 3]" "Built: [10, 20, 30]"
}`,
    solutionCode: `fun main() {
  val start = 1
  val doubles = generateSequence(start) { it * 2 }.take(6).toList()
  val fixed = sequenceOf(3, 1, 2).sorted().toList()
  val built = sequence {
    yield(start)
    yield(start + 1)
    yield(start + 2)
  }.map { it * 10 }.toList()
  println("Doubles: $doubles")
  println("Sorted: $fixed")
  println("Built: $built")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Doubles: [1, 2, 4, 8, 16, 32]\nSorted: [1, 2, 3]\nBuilt: [10, 20, 30]',
    testCase: { call: '', expected: 'Doubles: [1, 2, 4, 8, 16, 32]\nSorted: [1, 2, 3]\nBuilt: [10, 20, 30]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '1', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Doubles: [3, 6, 12, 24, 48, 96]\nSorted: [1, 2, 3]\nBuilt: [30, 40, 50]',
    },
  },
  {
    id: 'world-14-practice-writerun-countdown',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use generateSequence with a rule that returns null to end the sequence.',
    conceptTags: ['lesson:creating-sequences', 'generateSequence', 'null-ends-sequence'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Countdown',
    goal: 'Count down from a start number in steps of 4. Stop when the number is 3 or less. Print the numbers and how many there are.',
    description: '1. **Make the countdown.** Create `val countdown` with `generateSequence(top) { ... }`. When `it > 3`, return `it - 4`. Otherwise return `null`. Make a list at the end.\n\n' +
              '2. **Print the list.** Use a string template:\n"Countdown: [10, 6, 2]"\n\n' +
              '3. **Print the size.** Print "Size: " plus `countdown.size`:\n"Size: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make the countdown.** Return `null` to stop.',
          '2. **Print the list.** Show the countdown.',
          '3. **Print the size.** Show `countdown.size`.',
        ],
        comments: [
          '// 1. Make the countdown. Return null to stop.',
          '// 2. Print the list. Show the countdown.',
          '// 3. Print the size. Show countdown.size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make the countdown.**',
          '2. **Print the list.**',
          '3. **Print the size.**',
        ],
        comments: [
          '// 1. Make the countdown.',
          '// 2. Print the list.',
          '// 3. Print the size.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Countdown.kt',
    initialCode: `fun main() {
  val top = 10

  // 1. Make the countdown. Create val countdown with generateSequence(top) { ... }. When it > 3, return it - 4. Otherwise return null. Make a list at the end.

  // 2. Print the list. Use a string template: "Countdown: [10, 6, 2]"

  // 3. Print the size. Print "Size: " plus countdown.size: "Size: 3"
}`,
    solutionCode: `fun main() {
  val top = 10
  val countdown = generateSequence(top) { if (it > 3) it - 4 else null }.toList()
  println("Countdown: $countdown")
  println("Size: " + countdown.size)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Countdown: [10, 6, 2]\nSize: 3',
    testCase: { call: '', expected: 'Countdown: [10, 6, 2]\nSize: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'top', originalLiteral: '10', alternateLiteral: '15' }],
      alternateExpectedOutput: 'Countdown: [15, 11, 7, 3]\nSize: 4',
    },
  },
  {
    id: 'world-14-practice-writerun-to-sequence',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Turn a range into a sequence to find the first match without going through all numbers.',
    conceptTags: ['lesson:assequence', 'asSequence', 'range', 'first'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'To Sequence',
    goal: 'Square a few numbers. Then find the first doubled number, from a very long range, that a given number divides.',
    description: '1. **Square the numbers.** Create `val squares` with `(1..n).asSequence().map { ... }`. Return `it * it`. Make a list at the end.\n\n' +
              '2. **Find the first match.** Create `val first` with `(1..1000000).asSequence()`. Use `map { it * 2 }`, then `filter { it % k == 0 }`, then `first()`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"Squares: [1, 4, 9]"\n"First: 6"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Square the numbers.** Use `asSequence`, `map` and `toList()`.',
          '2. **Find the first match.** Use `map`, `filter` and `first()`.',
          '3. **Print two lines.** Show the squares and the first.',
        ],
        comments: [
          '// 1. Square the numbers. Use asSequence, map and toList().',
          '// 2. Find the first match. Use map, filter and first().',
          '// 3. Print two lines. Show the squares and the first.',
        ],
      },
      experienced: {
        steps: [
          '1. **Square the numbers.**',
          '2. **Find the first match.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Square the numbers.',
          '// 2. Find the first match.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ToSequence.kt',
    initialCode: `fun main() {
  val n = 3
  val k = 3

  // 1. Square the numbers. Create val squares with (1..n).asSequence().map { ... }. Return it * it. Make a list at the end.

  // 2. Find the first match. Create val first with (1..1000000).asSequence(). Use map { it * 2 }, then filter { it % k == 0 }, then first().

  // 3. Print two lines. Use a string template for the list: "Squares: [1, 4, 9]" "First: 6"
}`,
    solutionCode: `fun main() {
  val n = 3
  val k = 3
  val squares = (1..n).asSequence().map { it * it }.toList()
  val first = (1..1000000).asSequence().map { it * 2 }.filter { it % k == 0 }.first()
  println("Squares: $squares")
  println("First: " + first)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Squares: [1, 4, 9]\nFirst: 6',
    testCase: { call: '', expected: 'Squares: [1, 4, 9]\nFirst: 6' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'k', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Squares: [1, 4, 9]\nFirst: 10',
    },
  },
  {
    id: 'world-14-practice-writerun-map-then-take',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use take after map on a range and see which numbers are mapped.',
    conceptTags: ['lesson:assequence', 'asSequence', 'take', 'lazy-trace'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Map then Take',
    goal: 'Square the numbers from 1 to 10 but keep only the first few. Print a line for each number that is squared.',
    description: '1. **Start the sequence.** Start `val r` with `(1..10).asSequence().map { ... }`. Inside, print "map " plus `it`. Return `it * it`.\n\n' +
              '2. **Keep a few.** Add `.take(count).toList()`.\n\n' +
              '3. **Print the result.** Use a string template:\n"map 1"\n"map 2"\n"Result: [1, 4]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the sequence.** Print inside `map`.',
          '2. **Keep a few.** Use `take(count)`.',
          '3. **Print the result.** Show the list.',
        ],
        comments: [
          '// 1. Start the sequence. Print inside map.',
          '// 2. Keep a few. Use take(count).',
          '// 3. Print the result. Show the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the sequence.**',
          '2. **Keep a few.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Start the sequence.',
          '// 2. Keep a few.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MapThenTake.kt',
    initialCode: `fun main() {
  val count = 2

  // 1. Start the sequence. Start val r with (1..10).asSequence().map { ... }. Inside, print "map " plus it. Return it * it.

  // 2. Keep a few. Add .take(count).toList().

  // 3. Print the result. Use a string template: "map 1" "map 2" "Result: [1, 4]"
}`,
    solutionCode: `fun main() {
  val count = 2
  val r = (1..10).asSequence().map {
    println("map " + it)
    it * it
  }.take(count).toList()
  println("Result: $r")
}`,
    sampleInput: 'main()',
    expectedOutput: 'map 1\nmap 2\nResult: [1, 4]',
    testCase: { call: '', expected: 'map 1\nmap 2\nResult: [1, 4]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'map 1\nmap 2\nmap 3\nResult: [1, 4, 9]',
    },
  },
  {
    id: 'world-14-practice-writerun-chain-ops',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Chain filter, map, drop and take, and use takeWhile on an endless sequence.',
    conceptTags: ['lesson:intermediate-operations', 'filter', 'map', 'drop', 'take', 'takeWhile'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Chain Operations',
    goal: 'Keep even numbers, triple them, skip one and keep a few. Then take numbers from an endless counter while they are small.',
    description: '1. **Filter and map.** Start `val kept` with `(1..10).asSequence()`. Use `filter { it % 2 == 0 }`, then `map { it * 3 }`.\n\n' +
              '2. **Skip and keep.** Add `.drop(1)`, then `.take(limit)`, then `.toList()`.\n\n' +
              '3. **Use takeWhile.** Create `val below` with `generateSequence(1) { it + 1 }`. Use `takeWhile { it < cap }` and `toList()`.\n\n' +
              '4. **Print two lines.** Use string templates:\n"Result: [12, 18]"\n"Below: [1, 2, 3, 4]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Filter and map.** Even numbers, times `3`.',
          '2. **Skip and keep.** Use `drop(1)` and `take(limit)`.',
          '3. **Use takeWhile.** Stop before `cap`.',
          '4. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Filter and map. Even numbers, times 3.',
          '// 2. Skip and keep. Use drop(1) and take(limit).',
          '// 3. Use takeWhile. Stop before cap.',
          '// 4. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Filter and map.**',
          '2. **Skip and keep.**',
          '3. **Use takeWhile.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Filter and map.',
          '// 2. Skip and keep.',
          '// 3. Use takeWhile.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ChainOps.kt',
    initialCode: `fun main() {
  val limit = 2
  val cap = 5

  // 1. Filter and map. Start val kept with (1..10).asSequence(). Use filter { it % 2 == 0 }, then map { it * 3 }.

  // 2. Skip and keep. Add .drop(1), then .take(limit), then .toList().

  // 3. Use takeWhile. Create val below with generateSequence(1) { it + 1 }. Use takeWhile { it < cap } and toList().

  // 4. Print two lines. Use string templates: "Result: [12, 18]" "Below: [1, 2, 3, 4]"
}`,
    solutionCode: `fun main() {
  val limit = 2
  val cap = 5
  val kept = (1..10).asSequence().filter { it % 2 == 0 }.map { it * 3 }.drop(1).take(limit).toList()
  val below = generateSequence(1) { it + 1 }.takeWhile { it < cap }.toList()
  println("Result: $kept")
  println("Below: $below")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: [12, 18]\nBelow: [1, 2, 3, 4]',
    testCase: { call: '', expected: 'Result: [12, 18]\nBelow: [1, 2, 3, 4]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Result: [12, 18, 24]\nBelow: [1, 2, 3, 4]',
    },
  },
  {
    id: 'world-14-practice-writerun-sort-breaks-lazy',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use sorted in a sequence and see that it needs every item first.',
    conceptTags: ['lesson:intermediate-operations', 'sorted', 'needs-all-items', 'lazy-trace'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Sort Breaks Laziness',
    goal: 'Multiply some numbers, sort them, and take the smallest. Print a line for each multiplication, and see how many happen.',
    description: '1. **Write the map.** Start `val smallest` with `listOf(3, 1, 2).asSequence().map { ... }`. Inside, print "m " plus `it`. Return `it * boost`.\n\n' +
              '2. **Sort and take.** Add `.sorted()`, then `.first()`.\n\n' +
              '3. **Print the result.** Print "Smallest: " plus `smallest`:\n"m 3"\n"m 1"\n"m 2"\n"Smallest: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the map.** Print inside and multiply by `boost`.',
          '2. **Sort and take.** Use `sorted()` and `first()`.',
          '3. **Print the result.** Show the smallest.',
        ],
        comments: [
          '// 1. Write the map. Print inside and multiply by boost.',
          '// 2. Sort and take. Use sorted() and first().',
          '// 3. Print the result. Show the smallest.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the map.**',
          '2. **Sort and take.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Write the map.',
          '// 2. Sort and take.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SortBreaksLazy.kt',
    initialCode: `fun main() {
  val boost = 2

  // 1. Write the map. Start val smallest with listOf(3, 1, 2).asSequence().map { ... }. Inside, print "m " plus it. Return it * boost.

  // 2. Sort and take. Add .sorted(), then .first().

  // 3. Print the result. Print "Smallest: " plus smallest: "m 3" "m 1" "m 2" "Smallest: 2"
}`,
    solutionCode: `fun main() {
  val boost = 2
  val smallest = listOf(3, 1, 2).asSequence()
    .map {
      println("m " + it)
      it * boost
    }
    .sorted()
    .first()
  println("Smallest: " + smallest)
}`,
    sampleInput: 'main()',
    expectedOutput: 'm 3\nm 1\nm 2\nSmallest: 2',
    testCase: { call: '', expected: 'm 3\nm 1\nm 2\nSmallest: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'boost', originalLiteral: '2', alternateLiteral: '5' }],
      alternateExpectedOutput: 'm 3\nm 1\nm 2\nSmallest: 5',
    },
  },
  {
    id: 'world-14-practice-writerun-run-terminals',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Use forEach, any and count as terminal operations on the same sequence.',
    conceptTags: ['lesson:terminal-operations', 'forEach', 'any', 'count', 'terminal'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Run the Terminals',
    goal: 'Add a bonus to some numbers. Print each new number. Then ask if any is big, and count them.',
    description: '1. **Build the sequence.** Create `val s` with `listOf(4, 9, 2, 7).asSequence().map { ... }`. Return `it + bonus`.\n\n' +
              '2. **Print each value.** Call `s.forEach { ... }`. Inside, print "v " plus `it`.\n\n' +
              '3. **Ask if any is big.** Print "Any big: " plus `s.any { it > 10 }`.\n\n' +
              '4. **Count them.** Print "Count: " plus `s.count()`:\n"v 5"\n"v 10"\n"v 3"\n"v 8"\n"Any big: false"\n"Count: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the sequence.** Add `bonus` to each.',
          '2. **Print each value.** Use `forEach`.',
          '3. **Ask if any is big.** Use `any`.',
          '4. **Count them.** Use `count()`.',
        ],
        comments: [
          '// 1. Build the sequence. Add bonus to each.',
          '// 2. Print each value. Use forEach.',
          '// 3. Ask if any is big. Use any.',
          '// 4. Count them. Use count().',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the sequence.**',
          '2. **Print each value.**',
          '3. **Ask if any is big.**',
          '4. **Count them.**',
        ],
        comments: [
          '// 1. Build the sequence.',
          '// 2. Print each value.',
          '// 3. Ask if any is big.',
          '// 4. Count them.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RunTerminals.kt',
    initialCode: `fun main() {
  val bonus = 1

  // 1. Build the sequence. Create val s with listOf(4, 9, 2, 7).asSequence().map { ... }. Return it + bonus.

  // 2. Print each value. Call s.forEach { ... }. Inside, print "v " plus it.

  // 3. Ask if any is big. Print "Any big: " plus s.any { it > 10 }.

  // 4. Count them. Print "Count: " plus s.count(): "v 5" "v 10" "v 3" "v 8" "Any big: false" "Count: 4"
}`,
    solutionCode: `fun main() {
  val bonus = 1
  val s = listOf(4, 9, 2, 7).asSequence().map { it + bonus }
  s.forEach { println("v " + it) }
  println("Any big: " + s.any { it > 10 })
  println("Count: " + s.count())
}`,
    sampleInput: 'main()',
    expectedOutput: 'v 5\nv 10\nv 3\nv 8\nAny big: false\nCount: 4',
    testCase: { call: '', expected: 'v 5\nv 10\nv 3\nv 8\nAny big: false\nCount: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '1', alternateLiteral: '3' }],
      alternateExpectedOutput: 'v 7\nv 12\nv 5\nv 10\nAny big: true\nCount: 4',
    },
  },
  {
    id: 'world-14-practice-writerun-find-lazy',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use find on a sequence and watch it stop at the first match.',
    conceptTags: ['lesson:terminal-operations', 'find', 'lazy-trace', 'terminal'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Find Lazily',
    goal: 'Triple the numbers from 1 to 100 and find the first one above a limit. Print a line each time a number is tripled.',
    description: '1. **Write the map.** Start `val found` with `(1..100).asSequence().map { ... }`. Inside, print "m " plus `it`. Return `it * 3`.\n\n' +
              '2. **Find the first.** Add `.find { it > limit }`.\n\n' +
              '3. **Print the result.** Print "Found: " plus `found`:\n"m 1"\n"m 2"\n"Found: 6"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the map.** Print inside and triple.',
          '2. **Find the first.** Use `find` and `limit`.',
          '3. **Print the result.** Show `found`.',
        ],
        comments: [
          '// 1. Write the map. Print inside and triple.',
          '// 2. Find the first. Use find and limit.',
          '// 3. Print the result. Show found.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the map.**',
          '2. **Find the first.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Write the map.',
          '// 2. Find the first.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FindLazy.kt',
    initialCode: `fun main() {
  val limit = 5

  // 1. Write the map. Start val found with (1..100).asSequence().map { ... }. Inside, print "m " plus it. Return it * 3.

  // 2. Find the first. Add .find { it > limit }.

  // 3. Print the result. Print "Found: " plus found: "m 1" "m 2" "Found: 6"
}`,
    solutionCode: `fun main() {
  val limit = 5
  val found = (1..100).asSequence().map {
    println("m " + it)
    it * 3
  }.find { it > limit }
  println("Found: " + found)
}`,
    sampleInput: 'main()',
    expectedOutput: 'm 1\nm 2\nFound: 6',
    testCase: { call: '', expected: 'm 1\nm 2\nFound: 6' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '5', alternateLiteral: '10' }],
      alternateExpectedOutput: 'm 1\nm 2\nm 3\nm 4\nFound: 12',
    },
  },
  {
    id: 'world-14-practice-writerun-item-by-item',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Use map and filter on a sequence and watch each item go through both steps.',
    conceptTags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'map', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Item by Item',
    goal: 'Double some numbers and keep the big ones. Print a line in each step to see the order.',
    description: '1. **Write the map.** Start `val r` with `sequenceOf(1, 2, 3).map { ... }`. Inside, print "double " plus `it`. Return `it * 2`.\n\n' +
              '2. **Write the filter.** Add `.filter { ... }`. Inside, print "keep? " plus `it`. Return `it > limit * 2`.\n\n' +
              '3. **Make the list.** Add `.toList()`.\n\n' +
              '4. **Print the result.** Use a string template:\n"double 1"\n"keep? 2"\n"double 2"\n"keep? 4"\n"double 3"\n"keep? 6"\n"Result: [6]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the map.** Print and double.',
          '2. **Write the filter.** Print and test `limit * 2`.',
          '3. **Make the list.** Call `toList()`.',
          '4. **Print the result.** Show `r`.',
        ],
        comments: [
          '// 1. Write the map. Print and double.',
          '// 2. Write the filter. Print and test limit * 2.',
          '// 3. Make the list. Call toList().',
          '// 4. Print the result. Show r.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the map.**',
          '2. **Write the filter.**',
          '3. **Make the list.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Write the map.',
          '// 2. Write the filter.',
          '// 3. Make the list.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ItemByItem.kt',
    initialCode: `fun main() {
  val limit = 2

  // 1. Write the map. Start val r with sequenceOf(1, 2, 3).map { ... }. Inside, print "double " plus it. Return it * 2.

  // 2. Write the filter. Add .filter { ... }. Inside, print "keep? " plus it. Return it > limit * 2.

  // 3. Make the list. Add .toList().

  // 4. Print the result. Use a string template: "double 1" "keep? 2" "double 2" "keep? 4" "double 3" "keep? 6" "Result: [6]"
}`,
    solutionCode: `fun main() {
  val limit = 2
  val r = sequenceOf(1, 2, 3)
    .map {
      println("double " + it)
      it * 2
    }
    .filter {
      println("keep? " + it)
      it > limit * 2
    }
    .toList()
  println("Result: $r")
}`,
    sampleInput: 'main()',
    expectedOutput: 'double 1\nkeep? 2\ndouble 2\nkeep? 4\ndouble 3\nkeep? 6\nResult: [6]',
    testCase: { call: '', expected: 'double 1\nkeep? 2\ndouble 2\nkeep? 4\ndouble 3\nkeep? 6\nResult: [6]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '2', alternateLiteral: '1' }],
      alternateExpectedOutput: 'double 1\nkeep? 2\ndouble 2\nkeep? 4\ndouble 3\nkeep? 6\nResult: [4, 6]',
    },
  },
  {
    id: 'world-14-practice-writerun-order-compare',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Run the same steps on a list and on a sequence, and compare the order of the prints.',
    conceptTags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'eager-vs-lazy', 'trace'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Compare the Orders',
    goal: 'Add a number to each item and keep the even ones. Do it with a list and with a sequence, and compare the order of the prints.',
    description: '1. **Run it eagerly.** Print "Eager:". Then create `val eager` with `numbers.map { ... }`. Inside, print "e map " plus `it` and return `it + add`. Add `.filter { ... }`. Inside, print "e filter " plus `it` and return `it % 2 == 0`.\n\n' +
              '2. **Print the lazy title.** Print "Lazy:":\n"Lazy:"\n\n' +
              '3. **Run it lazily.** Create `val lazy` with `numbers.asSequence().map { ... }`. Print "s map " plus `it` and return `it + add`. Add `.filter { ... }`. Print "s filter " plus `it` and return `it % 2 == 0`. End with `.toList()`.\n\n' +
              '4. **Compare.** Print "Same: " plus `eager == lazy`:\n"Eager:"\n"e map 1"\n"e map 2"\n"e filter 2"\n"e filter 3"\n"Lazy:"\n"s map 1"\n"s filter 2"\n"s map 2"\n"s filter 3"\n"Same: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Run it eagerly.** Use a list with prints in `map` and `filter`.',
          '2. **Print the lazy title.** Print "Lazy:".',
          '3. **Run it lazily.** Use `asSequence` with the same prints.',
          '4. **Compare.** Print `eager == lazy`.',
        ],
        comments: [
          '// 1. Run it eagerly. Use a list with prints in map and filter.',
          '// 2. Print the lazy title. Print "Lazy:".',
          '// 3. Run it lazily. Use asSequence with the same prints.',
          '// 4. Compare. Print eager == lazy.',
        ],
      },
      experienced: {
        steps: [
          '1. **Run it eagerly.**',
          '2. **Print the lazy title.**',
          '3. **Run it lazily.**',
          '4. **Compare.**',
        ],
        comments: [
          '// 1. Run it eagerly.',
          '// 2. Print the lazy title.',
          '// 3. Run it lazily.',
          '// 4. Compare.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderCompare.kt',
    initialCode: `fun main() {
  val add = 1
  val numbers = listOf(1, 2)

  // 1. Run it eagerly. Print "Eager:". Then create val eager with numbers.map { ... }. Inside, print "e map " plus it and return it + add. Add .filter { ... }. Inside, print "e filter " plus it and return it % 2 == 0.

  // 2. Print the lazy title. Print "Lazy:": "Lazy:"

  // 3. Run it lazily. Create val lazy with numbers.asSequence().map { ... }. Print "s map " plus it and return it + add. Add .filter { ... }. Print "s filter " plus it and return it % 2 == 0. End with .toList().

  // 4. Compare. Print "Same: " plus eager == lazy: "Eager:" "e map 1" "e map 2" "e filter 2" "e filter 3" "Lazy:" "s map 1" "s filter 2" "s map 2" "s filter 3" "Same: true"
}`,
    solutionCode: `fun main() {
  val add = 1
  val numbers = listOf(1, 2)
  println("Eager:")
  val eager = numbers.map {
    println("e map " + it)
    it + add
  }.filter {
    println("e filter " + it)
    it % 2 == 0
  }
  println("Lazy:")
  val lazy = numbers.asSequence().map {
    println("s map " + it)
    it + add
  }.filter {
    println("s filter " + it)
    it % 2 == 0
  }.toList()
  println("Same: " + (eager == lazy))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Eager:\ne map 1\ne map 2\ne filter 2\ne filter 3\nLazy:\ns map 1\ns filter 2\ns map 2\ns filter 3\nSame: true',
    testCase: { call: '', expected: 'Eager:\ne map 1\ne map 2\ne filter 2\ne filter 3\nLazy:\ns map 1\ns filter 2\ns map 2\ns filter 3\nSame: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'add', originalLiteral: '1', alternateLiteral: '2' }],
      alternateExpectedOutput: 'Eager:\ne map 1\ne map 2\ne filter 3\ne filter 4\nLazy:\ns map 1\ns filter 3\ns map 2\ns filter 4\nSame: true',
    },
  },
  {
    id: 'world-14-practice-writerun-first-match',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Use first on a filtered sequence and see that it stops at the first match.',
    conceptTags: ['lesson:short-circuiting', 'first', 'short-circuit', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'First Match',
    goal: 'Find the first number above a limit. Print a line each time a number is checked.',
    description: '1. **Write the filter.** Start `val r` with `listOf(5, 8, 12, 3, 20).asSequence().filter { ... }`. Inside, print "check " plus `it`. Return `it > limit`.\n\n' +
              '2. **Take the first.** Add `.first()`.\n\n' +
              '3. **Print the result.** Print "Result: " plus `r`:\n"check 5"\n"check 8"\n"Result: 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the filter.** Print each check.',
          '2. **Take the first.** Use `first()`.',
          '3. **Print the result.** Show `r`.',
        ],
        comments: [
          '// 1. Write the filter. Print each check.',
          '// 2. Take the first. Use first().',
          '// 3. Print the result. Show r.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the filter.**',
          '2. **Take the first.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Write the filter.',
          '// 2. Take the first.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstMatch.kt',
    initialCode: `fun main() {
  val limit = 6

  // 1. Write the filter. Start val r with listOf(5, 8, 12, 3, 20).asSequence().filter { ... }. Inside, print "check " plus it. Return it > limit.

  // 2. Take the first. Add .first().

  // 3. Print the result. Print "Result: " plus r: "check 5" "check 8" "Result: 8"
}`,
    solutionCode: `fun main() {
  val limit = 6
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      println("check " + it)
      it > limit
    }
    .first()
  println("Result: " + r)
}`,
    sampleInput: 'main()',
    expectedOutput: 'check 5\ncheck 8\nResult: 8',
    testCase: { call: '', expected: 'check 5\ncheck 8\nResult: 8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '6', alternateLiteral: '10' }],
      alternateExpectedOutput: 'check 5\ncheck 8\ncheck 12\nResult: 12',
    },
  },
  {
    id: 'world-14-practice-writerun-any-test',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Compare any, which stops early, with count, which looks at every item.',
    conceptTags: ['lesson:short-circuiting', 'any', 'count', 'short-circuit'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Any Test',
    goal: 'Ask if any number is above a limit, and count how many are. Print a line for each test that any runs.',
    description: '1. **Ask with any.** Create `val found` with `nums.asSequence().any { ... }`. Inside, print "test " plus `it`. Return `it > limit`.\n\n' +
              '2. **Count them.** Create `val total` with `nums.asSequence().count { it > limit }`.\n\n' +
              '3. **Print the answer.** Print "Found: " plus `found`.\n\n' +
              '4. **Print the count.** Print "Total: " plus `total`:\n"test 2"\n"test 4"\n"test 7"\n"Found: true"\n"Total: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Ask with any.** Print each test.',
          '2. **Count them.** Use `count { ... }`.',
          '3. **Print the answer.** Show `found`.',
          '4. **Print the count.** Show `total`.',
        ],
        comments: [
          '// 1. Ask with any. Print each test.',
          '// 2. Count them. Use count { ... }.',
          '// 3. Print the answer. Show found.',
          '// 4. Print the count. Show total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Ask with any.**',
          '2. **Count them.**',
          '3. **Print the answer.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Ask with any.',
          '// 2. Count them.',
          '// 3. Print the answer.',
          '// 4. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AnyTest.kt',
    initialCode: `fun main() {
  val limit = 5
  val nums = listOf(2, 4, 7, 9)

  // 1. Ask with any. Create val found with nums.asSequence().any { ... }. Inside, print "test " plus it. Return it > limit.

  // 2. Count them. Create val total with nums.asSequence().count { it > limit }.

  // 3. Print the answer. Print "Found: " plus found.

  // 4. Print the count. Print "Total: " plus total: "test 2" "test 4" "test 7" "Found: true" "Total: 2"
}`,
    solutionCode: `fun main() {
  val limit = 5
  val nums = listOf(2, 4, 7, 9)
  val found = nums.asSequence().any {
    println("test " + it)
    it > limit
  }
  val total = nums.asSequence().count { it > limit }
  println("Found: " + found)
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'test 2\ntest 4\ntest 7\nFound: true\nTotal: 2',
    testCase: { call: '', expected: 'test 2\ntest 4\ntest 7\nFound: true\nTotal: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '5', alternateLiteral: '10' }],
      alternateExpectedOutput: 'test 2\ntest 4\ntest 7\ntest 9\nFound: false\nTotal: 0',
    },
  },
  {
    id: 'world-14-practice-writerun-list-or-seq',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Use the same map and take on a list and on a sequence, and count the maps.',
    conceptTags: ['lesson:sequences-vs-collections', 'list-vs-sequence', 'take', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'List or Sequence',
    goal: 'Double the numbers 1 to 10 and keep the first few, once with a list and once with a sequence. Count how many numbers are doubled each time.',
    description: '1. **Use a list.** Create `val a` with `(1..10).toList().map { ... }`. Inside, add `1` to `listMaps` and return `it * 2`. Add `.take(count)`.\n\n' +
              '2. **Use a sequence.** Create `val b` with `(1..10).asSequence().map { ... }`. Inside, add `1` to `seqMaps` and return `it * 2`. Add `.take(count).toList()`.\n\n' +
              '3. **Print the list result.** Use a string template for the list, then the counter:\n"List: [2, 4] maps=10"\n\n' +
              '4. **Print the sequence result.** Do the same for the sequence:\n"Seq: [2, 4] maps=2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Use a list.** Count the maps in `listMaps`.',
          '2. **Use a sequence.** Count the maps in `seqMaps`.',
          '3. **Print the list result.** Show the list and `listMaps`.',
          '4. **Print the sequence result.** Show the list and `seqMaps`.',
        ],
        comments: [
          '// 1. Use a list. Count the maps in listMaps.',
          '// 2. Use a sequence. Count the maps in seqMaps.',
          '// 3. Print the list result. Show the list and listMaps.',
          '// 4. Print the sequence result. Show the list and seqMaps.',
        ],
      },
      experienced: {
        steps: [
          '1. **Use a list.**',
          '2. **Use a sequence.**',
          '3. **Print the list result.**',
          '4. **Print the sequence result.**',
        ],
        comments: [
          '// 1. Use a list.',
          '// 2. Use a sequence.',
          '// 3. Print the list result.',
          '// 4. Print the sequence result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ListOrSeq.kt',
    initialCode: `fun main() {
  val count = 2
  var listMaps = 0
  var seqMaps = 0

  // 1. Use a list. Create val a with (1..10).toList().map { ... }. Inside, add 1 to listMaps and return it * 2. Add .take(count).

  // 2. Use a sequence. Create val b with (1..10).asSequence().map { ... }. Inside, add 1 to seqMaps and return it * 2. Add .take(count).toList().

  // 3. Print the list result. Use a string template for the list, then the counter: "List: [2, 4] maps=10"

  // 4. Print the sequence result. Do the same for the sequence: "Seq: [2, 4] maps=2"
}`,
    solutionCode: `fun main() {
  val count = 2
  var listMaps = 0
  var seqMaps = 0
  val a = (1..10).toList().map {
    listMaps += 1
    it * 2
  }.take(count)
  val b = (1..10).asSequence().map {
    seqMaps += 1
    it * 2
  }.take(count).toList()
  println("List: $a maps=" + listMaps)
  println("Seq: $b maps=" + seqMaps)
}`,
    sampleInput: 'main()',
    expectedOutput: 'List: [2, 4] maps=10\nSeq: [2, 4] maps=2',
    testCase: { call: '', expected: 'List: [2, 4] maps=10\nSeq: [2, 4] maps=2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '2', alternateLiteral: '4' }],
      alternateExpectedOutput: 'List: [2, 4, 6, 8] maps=10\nSeq: [2, 4, 6, 8] maps=4',
    },
  },
  {
    id: 'world-14-practice-writerun-reuse-pipeline',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'See that a sequence runs again for each terminal call, while a list keeps its result.',
    conceptTags: ['lesson:sequences-vs-collections', 'sequence-reuse', 're-evaluation', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Reuse a Pipeline',
    goal: 'Use one sequence for two questions and one list for two questions. Count how often the doubling runs in each.',
    description: '1. **Build the sequence.** Create `val seq` with `(1..n).asSequence().map { ... }`. Inside, add `1` to `seqRuns` and return `it * 2`.\n\n' +
              '2. **Ask two questions.** Create `val firstPass` with `seq.toList()`. Create `val secondPass` with `seq.count()`.\n\n' +
              '3. **Build the list.** Create `val list` with `(1..n).toList().map { ... }`. Inside, add `1` to `listRuns` and return `it * 2`.\n\n' +
              '4. **Ask the list.** Create `val again` with `list.size`.\n\n' +
              '5. **Print two lines.** Join the text with `+`:\n"Seq runs: 6"\n"List runs: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the sequence.** Count the runs.',
          '2. **Ask two questions.** Use `toList()` and `count()`.',
          '3. **Build the list.** Count the runs.',
          '4. **Ask the list.** Use `size`.',
          '5. **Print two lines.** Show both counters.',
        ],
        comments: [
          '// 1. Build the sequence. Count the runs.',
          '// 2. Ask two questions. Use toList() and count().',
          '// 3. Build the list. Count the runs.',
          '// 4. Ask the list. Use size.',
          '// 5. Print two lines. Show both counters.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the sequence.**',
          '2. **Ask two questions.**',
          '3. **Build the list.**',
          '4. **Ask the list.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Build the sequence.',
          '// 2. Ask two questions.',
          '// 3. Build the list.',
          '// 4. Ask the list.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReusePipeline.kt',
    initialCode: `fun main() {
  val n = 3
  var seqRuns = 0
  var listRuns = 0

  // 1. Build the sequence. Create val seq with (1..n).asSequence().map { ... }. Inside, add 1 to seqRuns and return it * 2.

  // 2. Ask two questions. Create val firstPass with seq.toList(). Create val secondPass with seq.count().

  // 3. Build the list. Create val list with (1..n).toList().map { ... }. Inside, add 1 to listRuns and return it * 2.

  // 4. Ask the list. Create val again with list.size.

  // 5. Print two lines. Join the text with +: "Seq runs: 6" "List runs: 3"
}`,
    solutionCode: `fun main() {
  val n = 3
  var seqRuns = 0
  var listRuns = 0
  val seq = (1..n).asSequence().map {
    seqRuns += 1
    it * 2
  }
  val firstPass = seq.toList()
  val secondPass = seq.count()
  val list = (1..n).toList().map {
    listRuns += 1
    it * 2
  }
  val again = list.size
  println("Seq runs: " + seqRuns)
  println("List runs: " + listRuns)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Seq runs: 6\nList runs: 3',
    testCase: { call: '', expected: 'Seq runs: 6\nList runs: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Seq runs: 8\nList runs: 4',
    },
  },
  {
    id: 'world-14-practice-writerun-work-saved',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Find the first multiple of 7 with a list and with a sequence, and count the checks.',
    conceptTags: ['lesson:performance-trade-offs', 'performance', 'first', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Work Saved',
    goal: 'Find the first number that 7 divides, once with a list and once with a sequence. Count how many numbers each way checks.',
    description: '1. **Use a list.** Create `val a` with `(1..size).toList().filter { ... }`. Inside, add `1` to `listWork` and return `it % 7 == 0`. End with `.first()`.\n\n' +
              '2. **Use a sequence.** Create `val b` with `(1..size).asSequence().filter { ... }`. Inside, add `1` to `seqWork` and return `it % 7 == 0`. End with `.first()`.\n\n' +
              '3. **Print three lines.** Join the text with `+`:\n"First: 7"\n"List checks: 100"\n"Seq checks: 7"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Use a list.** Count the checks in `listWork`.',
          '2. **Use a sequence.** Count the checks in `seqWork`.',
          '3. **Print three lines.** Show the first and both counters.',
        ],
        comments: [
          '// 1. Use a list. Count the checks in listWork.',
          '// 2. Use a sequence. Count the checks in seqWork.',
          '// 3. Print three lines. Show the first and both counters.',
        ],
      },
      experienced: {
        steps: [
          '1. **Use a list.**',
          '2. **Use a sequence.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Use a list.',
          '// 2. Use a sequence.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WorkSaved.kt',
    initialCode: `fun main() {
  val size = 100
  var listWork = 0
  var seqWork = 0

  // 1. Use a list. Create val a with (1..size).toList().filter { ... }. Inside, add 1 to listWork and return it % 7 == 0. End with .first().

  // 2. Use a sequence. Create val b with (1..size).asSequence().filter { ... }. Inside, add 1 to seqWork and return it % 7 == 0. End with .first().

  // 3. Print three lines. Join the text with +: "First: 7" "List checks: 100" "Seq checks: 7"
}`,
    solutionCode: `fun main() {
  val size = 100
  var listWork = 0
  var seqWork = 0
  val a = (1..size).toList().filter {
    listWork += 1
    it % 7 == 0
  }.first()
  val b = (1..size).asSequence().filter {
    seqWork += 1
    it % 7 == 0
  }.first()
  println("First: " + a)
  println("List checks: " + listWork)
  println("Seq checks: " + seqWork)
}`,
    sampleInput: 'main()',
    expectedOutput: 'First: 7\nList checks: 100\nSeq checks: 7',
    testCase: { call: '', expected: 'First: 7\nList checks: 100\nSeq checks: 7' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'size', originalLiteral: '100', alternateLiteral: '50' }],
      alternateExpectedOutput: 'First: 7\nList checks: 50\nSeq checks: 7',
    },
  },
  {
    id: 'world-14-practice-writerun-sort-costs',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'See how sorted makes a sequence do the work for every item, even with take.',
    conceptTags: ['lesson:performance-trade-offs', 'performance', 'sorted', 'counters'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Sort Costs',
    goal: 'Triple the numbers and take the first two, with and without sorting. Count how many numbers are tripled each time.',
    description: '1. **Without sorting.** Create `val a` with `(1..size).asSequence().map { ... }`. Inside, add `1` to `plain` and return `it * 3`. Add `.take(2).toList()`.\n\n' +
              '2. **With sorting.** Create `val b` the same way, but count in `sortedRuns`. Add `.sorted().take(2).toList()`.\n\n' +
              '3. **Compare the lists.** Create `val same` as `a == b`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Plain maps: 2"\n"Sorted maps: 10"\n"Same result: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Without sorting.** Use `take(2)`.',
          '2. **With sorting.** Add `sorted()` before `take(2)`.',
          '3. **Compare the lists.** Create `same`.',
          '4. **Print three lines.** Show both counters and the comparison.',
        ],
        comments: [
          '// 1. Without sorting. Use take(2).',
          '// 2. With sorting. Add sorted() before take(2).',
          '// 3. Compare the lists. Create same.',
          '// 4. Print three lines. Show both counters and the comparison.',
        ],
      },
      experienced: {
        steps: [
          '1. **Without sorting.**',
          '2. **With sorting.**',
          '3. **Compare the lists.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Without sorting.',
          '// 2. With sorting.',
          '// 3. Compare the lists.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SortCosts.kt',
    initialCode: `fun main() {
  val size = 10
  var plain = 0
  var sortedRuns = 0

  // 1. Without sorting. Create val a with (1..size).asSequence().map { ... }. Inside, add 1 to plain and return it * 3. Add .take(2).toList().

  // 2. With sorting. Create val b the same way, but count in sortedRuns. Add .sorted().take(2).toList().

  // 3. Compare the lists. Create val same as a == b.

  // 4. Print three lines. Join the text with +: "Plain maps: 2" "Sorted maps: 10" "Same result: true"
}`,
    solutionCode: `fun main() {
  val size = 10
  var plain = 0
  var sortedRuns = 0
  val a = (1..size).asSequence().map {
    plain += 1
    it * 3
  }.take(2).toList()
  val b = (1..size).asSequence().map {
    sortedRuns += 1
    it * 3
  }.sorted().take(2).toList()
  println("Plain maps: " + plain)
  println("Sorted maps: " + sortedRuns)
  println("Same result: " + (a == b))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Plain maps: 2\nSorted maps: 10\nSame result: true',
    testCase: { call: '', expected: 'Plain maps: 2\nSorted maps: 10\nSame result: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'size', originalLiteral: '10', alternateLiteral: '6' }],
      alternateExpectedOutput: 'Plain maps: 2\nSorted maps: 6\nSame result: true',
    },
  },
  {
    id: 'world-14-practice-writerun-first-square',
    worldId: 'world-14',
    difficulty: 'medium',
    summary: 'Use a sequence to search a huge range and a plain list for a small amount of data.',
    conceptTags: ['lesson:when-sequences-should-and-should-not-be-used', 'sequence-for-search', 'list-for-small-data', 'first'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'First Square',
    goal: 'Find the first square above a limit in a huge range. Then add up a small list and find its biggest number.',
    description: '1. **Search the range.** Create `val square` with `(1..1000000).asSequence().map { it * it }`. Add `.first { it > limit }`.\n\n' +
              '2. **Use the small list.** Create `val total` with `small.sum()`. Create `val biggest` with `small.maxOrNull()`.\n\n' +
              '3. **Print three lines.** Join the text with `+`:\n"Square: 121"\n"Total: 15"\n"Biggest: 9"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Search the range.** Use `asSequence`, `map` and `first { ... }`.',
          '2. **Use the small list.** Use `sum()` and `maxOrNull()`.',
          '3. **Print three lines.** Show all three.',
        ],
        comments: [
          '// 1. Search the range. Use asSequence, map and first { ... }.',
          '// 2. Use the small list. Use sum() and maxOrNull().',
          '// 3. Print three lines. Show all three.',
        ],
      },
      experienced: {
        steps: [
          '1. **Search the range.**',
          '2. **Use the small list.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Search the range.',
          '// 2. Use the small list.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstSquare.kt',
    initialCode: `fun main() {
  val limit = 100
  val small = listOf(4, 9, 2)

  // 1. Search the range. Create val square with (1..1000000).asSequence().map { it * it }. Add .first { it > limit }.

  // 2. Use the small list. Create val total with small.sum(). Create val biggest with small.maxOrNull().

  // 3. Print three lines. Join the text with +: "Square: 121" "Total: 15" "Biggest: 9"
}`,
    solutionCode: `fun main() {
  val limit = 100
  val small = listOf(4, 9, 2)
  val square = (1..1000000).asSequence().map { it * it }.first { it > limit }
  val total = small.sum()
  val biggest = small.maxOrNull()
  println("Square: " + square)
  println("Total: " + total)
  println("Biggest: " + biggest)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Square: 121\nTotal: 15\nBiggest: 9',
    testCase: { call: '', expected: 'Square: 121\nTotal: 15\nBiggest: 9' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '100', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Square: 225\nTotal: 15\nBiggest: 9',
    },
  },
  {
    id: 'world-14-practice-writerun-id-stream',
    worldId: 'world-14',
    difficulty: 'hard',
    summary: 'Use an endless sequence of ids: take a few, and find the first one above a number.',
    conceptTags: ['lesson:when-sequences-should-and-should-not-be-used', 'endless-sequence', 'first', 'take'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Id Stream',
    goal: 'Make an endless list of ids that grow by a step. Take the first four, and find the first id above 112.',
    description: '1. **Make the ids.** Create `val ids` with `generateSequence(100) { it + step }`.\n\n' +
              '2. **Take and find.** Create `val firstFour` with `ids.take(4).toList()`. Create `val over` with `ids.first { it > 112 }`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"Ids: [100, 105, 110, 115]"\n"Over 112: 115"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make the ids.** Use `generateSequence` and `step`.',
          '2. **Take and find.** Use `take(4)` and `first { ... }`.',
          '3. **Print two lines.** Show both results.',
        ],
        comments: [
          '// 1. Make the ids. Use generateSequence and step.',
          '// 2. Take and find. Use take(4) and first { ... }.',
          '// 3. Print two lines. Show both results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make the ids.**',
          '2. **Take and find.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Make the ids.',
          '// 2. Take and find.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'IdStream.kt',
    initialCode: `fun main() {
  val step = 5

  // 1. Make the ids. Create val ids with generateSequence(100) { it + step }.

  // 2. Take and find. Create val firstFour with ids.take(4).toList(). Create val over with ids.first { it > 112 }.

  // 3. Print two lines. Use a string template for the list: "Ids: [100, 105, 110, 115]" "Over 112: 115"
}`,
    solutionCode: `fun main() {
  val step = 5
  val ids = generateSequence(100) { it + step }
  val firstFour = ids.take(4).toList()
  val over = ids.first { it > 112 }
  println("Ids: $firstFour")
  println("Over 112: " + over)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ids: [100, 105, 110, 115]\nOver 112: 115',
    testCase: { call: '', expected: 'Ids: [100, 105, 110, 115]\nOver 112: 115' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'step', originalLiteral: '5', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Ids: [100, 103, 106, 109]\nOver 112: 115',
    },
  },
];

export const WORLD_14_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-14-practice-debug-missing-terminal',
    worldId: 'world-14',
    conceptTags: ['lesson:what-sequences-are', 'lazy', 'terminal-operation'],
    summary: 'The sequence never runs, because no terminal operation is called.',
    title: 'Fix the Silent Pipeline',
    subtitle: 'The program should print "map 1", "map 2" and "done", but it only prints "done".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: no terminal operation, so nothing runs',
    brokenCode: `fun main() {
  val seq = listOf(1, 2).asSequence().map {
    println("map " + it)
    it * 2
  }
  println("done")
}`,
    fixedCode: `fun main() {
  val seq = listOf(1, 2).asSequence().map {
    println("map " + it)
    it * 2
  }
  seq.toList()
  println("done")
}`,
    expectedOutput: 'map 1\nmap 2\ndone',
    hints: [
              'Look at the output. Which lines are missing?',
              'A sequence is lazy. Without a terminal operation, the steps never run.',
              'Add a call that asks the sequence for its result, before you print "done".',
            ],
    explanation: '`map` on a sequence only describes the work. Nothing runs until a terminal operation such as `toList()` is called. Calling `seq.toList()` runs the map for both items, so the two lines print before `done`.',
  },
  {
    id: 'world-14-practice-debug-eager-snapshot',
    worldId: 'world-14',
    conceptTags: ['lesson:eager-collection-processing', 'eager', 'snapshot', 'mutable-list'],
    summary: 'A list made by map does not change when the first list changes.',
    title: 'Fix the Old Copy',
    subtitle: 'The program should print "[2, 4, 6, 10]", but it prints "[2, 4, 6]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: map made a list at once and it did not change later',
    brokenCode: `fun main() {
  val nums = mutableListOf(1, 2, 3)
  val doubled = nums.map { it * 2 }
  nums.add(5)
  println(doubled)
}`,
    fixedCode: `fun main() {
  val nums = mutableListOf(1, 2, 3)
  val doubled = nums.asSequence().map { it * 2 }
  nums.add(5)
  println(doubled.toList())
}`,
    expectedOutput: '[2, 4, 6, 10]',
    hints: [
              'Look at the order of the lines. When is `5` added?',
              'On a list, `map` runs at once and gives a new list. The new list does not change when `nums` changes later.',
              'Use a lazy sequence, and ask for the list after `5` is added.',
            ],
    explanation: '`nums.map { ... }` is eager. It makes the list `[2, 4, 6]` right away, so adding `5` later does not change it. A sequence is lazy: `nums.asSequence().map { ... }` runs when `toList()` is called, after `5` was added, so the result is `[2, 4, 6, 10]`.',
  },
  {
    id: 'world-14-practice-debug-forced-early',
    worldId: 'world-14',
    conceptTags: ['lesson:lazy-processing', 'lazy', 'toList-too-early', 'counters'],
    summary: 'toList runs every item before first picks one.',
    title: 'Fix the Early List',
    subtitle: 'The program should print "Checks: 2", but it prints "Checks: 5".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: toList makes the pipeline run on every item',
    brokenCode: `fun main() {
  var checks = 0
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      checks += 1
      it > 6
    }
    .toList()
    .first()
  println("First: " + r)
  println("Checks: " + checks)
}`,
    fixedCode: `fun main() {
  var checks = 0
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      checks += 1
      it > 6
    }
    .first()
  println("First: " + r)
  println("Checks: " + checks)
}`,
    expectedOutput: 'First: 8\nChecks: 2',
    hints: [
              'Look at the counter. How many numbers are checked?',
              '`toList()` runs the whole pipeline on every item, before `first()` is called.',
              'Remove the step that builds the full list, so `first()` can stop early.',
            ],
    explanation: '`toList()` is a terminal operation, so it checks all five numbers. Then `first()` only picks from the finished list. Calling `first()` directly on the sequence stops at the first match, `8`, after two checks.',
  },
  {
    id: 'world-14-practice-debug-wrong-stop',
    worldId: 'world-14',
    conceptTags: ['lesson:creating-sequences', 'generateSequence', 'stop-condition'],
    summary: 'The stop condition lets one extra number through.',
    title: 'Fix the Countdown',
    subtitle: 'The program should print "Countdown: [10, 6, 2]", but it prints "Countdown: [10, 6, 2, -2]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the stop condition lets one extra number through',
    brokenCode: `fun main() {
  val countdown = generateSequence(10) { if (it > 0) it - 4 else null }.toList()
  println("Countdown: $countdown")
}`,
    fixedCode: `fun main() {
  val countdown = generateSequence(10) { if (it > 3) it - 4 else null }.toList()
  println("Countdown: $countdown")
}`,
    expectedOutput: 'Countdown: [10, 6, 2]',
    hints: [
              'Look at the last number in the list. Should it be there?',
              'The rule continues while `it > 0`. The number `2` is above `0`, so the next number `-2` is made.',
              'Change the condition so the sequence stops after `2`.',
            ],
    explanation: 'The rule returns `it - 4` while `it > 0`. From `2`, that gives `-2`, which is not wanted. With `it > 3`, the rule returns `null` for `2`, and the sequence ends with `2`.',
  },
  {
    id: 'world-14-practice-debug-forgot-as-seq',
    worldId: 'world-14',
    conceptTags: ['lesson:assequence', 'asSequence', 'eager-map', 'first'],
    summary: 'map on a range works on every number.',
    title: 'Fix the Eager Range',
    subtitle: 'The program should print "map 1" and "First: 2", but it prints a "map" line for every number.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: map on a range works on every number',
    brokenCode: `fun main() {
  val r = (1..10).map {
    println("map " + it)
    it * 2
  }.first()
  println("First: " + r)
}`,
    fixedCode: `fun main() {
  val r = (1..10).asSequence().map {
    println("map " + it)
    it * 2
  }.first()
  println("First: " + r)
}`,
    expectedOutput: 'map 1\nFirst: 2',
    hints: [
              'Count the "map" lines. How many numbers are doubled?',
              '`map` on a range makes a whole list at once. Then `first()` only picks the first item.',
              'Turn the range into a lazy sequence before you call `map`.',
            ],
    explanation: '`(1..10).map { ... }` is eager, so it doubles all ten numbers and builds a list. With `asSequence()`, the work is lazy, and `first()` stops after the first number. Only `map 1` prints.',
  },
  {
    id: 'world-14-practice-debug-take-before-filter',
    worldId: 'world-14',
    conceptTags: ['lesson:intermediate-operations', 'take', 'filter', 'order-of-steps'],
    summary: 'take cuts the list before the filter runs.',
    title: 'Fix the Step Order',
    subtitle: 'The program should print "Result: [8, 9]", but it prints "Result: [8]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: take cuts the list before the filter',
    brokenCode: `fun main() {
  val r = listOf(3, 8, 9, 6).asSequence().take(2).filter { it > 5 }.toList()
  println("Result: $r")
}`,
    fixedCode: `fun main() {
  val r = listOf(3, 8, 9, 6).asSequence().filter { it > 5 }.take(2).toList()
  println("Result: $r")
}`,
    expectedOutput: 'Result: [8, 9]',
    hints: [
              'Trace the steps by hand. Which numbers does `take(2)` keep?',
              '`take(2)` runs first and keeps `3` and `8`. Then the filter removes `3`.',
              'Change the order, so you filter first and keep the first two matches.',
            ],
    explanation: 'The steps run in the order you write them. `take(2)` cuts the list to `3, 8`, and the filter leaves `[8]`. If `filter` comes first, the matches are `8, 9, 6`, and `take(2)` keeps `[8, 9]`.',
  },
  {
    id: 'world-14-practice-debug-wrong-terminal',
    worldId: 'world-14',
    conceptTags: ['lesson:terminal-operations', 'terminal', 'sum-vs-count'],
    summary: 'count gives the number of items, not the sum.',
    title: 'Fix the Terminal',
    subtitle: 'The program should print "Total: 18", but it prints "Total: 3".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: count was used where sum is needed',
    brokenCode: `fun main() {
  val s = listOf(3, 6, 9).asSequence()
  println("Total: " + s.count())
}`,
    fixedCode: `fun main() {
  val s = listOf(3, 6, 9).asSequence()
  println("Total: " + s.sum())
}`,
    expectedOutput: 'Total: 18',
    hints: [
              'Look at the number in the output. What does it measure?',
              '`count()` tells how many items there are. It does not add them up.',
              'Use the terminal operation that adds the numbers.',
            ],
    explanation: '`count()` returns the number of items, which is `3`. `sum()` adds the items, `3 + 6 + 9`, and gives `18`.',
  },
  {
    id: 'world-14-practice-debug-map-before-filter',
    worldId: 'world-14',
    conceptTags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'filter', 'map'],
    summary: 'The filter sees the doubled numbers.',
    title: 'Fix the Operation Order',
    subtitle: 'The program should print "Result: [10, 12]", but it prints "Result: [6, 8, 10, 12]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the filter sees the doubled numbers',
    brokenCode: `fun main() {
  val r = listOf(3, 4, 5, 6).asSequence().map { it * 2 }.filter { it > 4 }.toList()
  println("Result: $r")
}`,
    fixedCode: `fun main() {
  val r = listOf(3, 4, 5, 6).asSequence().filter { it > 4 }.map { it * 2 }.toList()
  println("Result: $r")
}`,
    expectedOutput: 'Result: [10, 12]',
    hints: [
              'Look at which numbers the filter sees. Are they the original ones?',
              'The map runs first, so the filter sees `6, 8, 10, 12`. All of them are above `4`.',
              'Change the order, so the filter sees the original numbers.',
            ],
    explanation: 'In a sequence each step works on the output of the step before. With `map` first, the filter tests the doubled numbers, and all pass. With `filter` first, it tests `3, 4, 5, 6`, keeps `5` and `6`, and `map` doubles them to `[10, 12]`.',
  },
  {
    id: 'world-14-practice-debug-count-not-any',
    worldId: 'world-14',
    conceptTags: ['lesson:short-circuiting', 'short-circuit', 'any-vs-count'],
    summary: 'count tests every item instead of stopping.',
    title: 'Fix the Search',
    subtitle: 'The program should stop testing at 7 and print "Found: true", but it tests every number.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: count tests every item instead of stopping',
    brokenCode: `fun main() {
  val found = listOf(2, 4, 7, 9).asSequence().count {
    println("test " + it)
    it > 5
  } > 0
  println("Found: " + found)
}`,
    fixedCode: `fun main() {
  val found = listOf(2, 4, 7, 9).asSequence().any {
    println("test " + it)
    it > 5
  }
  println("Found: " + found)
}`,
    expectedOutput: 'test 2\ntest 4\ntest 7\nFound: true',
    hints: [
              'Count the "test" lines. How many are printed?',
              '`count` has to look at every item to count it, so it does not stop early.',
              'Use the operation that stops at the first match.',
            ],
    explanation: '`count { ... } > 0` tests all four numbers. `any { ... }` stops as soon as one test is true, so it prints `test 2`, `test 4`, `test 7` and stops. The answer is the same, with less work.',
  },
  {
    id: 'world-14-practice-debug-reused-sequence',
    worldId: 'world-14',
    conceptTags: ['lesson:sequences-vs-collections', 'sequence-reuse', 're-evaluation'],
    summary: 'Each terminal operation runs the pipeline again.',
    title: 'Fix the Repeated Work',
    subtitle: 'The program should print "Runs: 3", but it prints "Runs: 6".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: each terminal operation runs the pipeline again',
    brokenCode: `fun main() {
  var runs = 0
  val seq = (1..3).asSequence().map {
    runs += 1
    it * 2
  }
  val total = seq.sum()
  val count = seq.count()
  println("Total: " + total + " of " + count)
  println("Runs: " + runs)
}`,
    fixedCode: `fun main() {
  var runs = 0
  val seq = (1..3).asSequence().map {
    runs += 1
    it * 2
  }
  val list = seq.toList()
  val total = list.sum()
  val count = list.size
  println("Total: " + total + " of " + count)
  println("Runs: " + runs)
}`,
    expectedOutput: 'Total: 12 of 3\nRuns: 3',
    hints: [
              'Look at the counter. How many times does the map run?',
              'Each terminal operation, `sum()` and `count()`, runs the whole pipeline again.',
              'Keep the result of the pipeline in a list once, and ask the list your questions.',
            ],
    explanation: 'A sequence does not store results. `seq.sum()` runs the map for three items, and `seq.count()` runs it for three more. Calling `toList()` once stores the result, and then `sum()` and `size` use the stored list, so the map runs only `3` times.',
  },
  {
    id: 'world-14-practice-debug-wasted-maps',
    worldId: 'world-14',
    conceptTags: ['lesson:performance-trade-offs', 'performance', 'order-of-steps', 'counters'],
    summary: 'map runs on items that the filter throws away.',
    title: 'Fix the Wasted Work',
    subtitle: 'The program should print "Maps: 3", but it prints "Maps: 6".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: map runs on items that the filter throws away',
    brokenCode: `fun main() {
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6).asSequence()
    .map {
      maps += 1
      it * 2
    }
    .filter { it % 4 == 0 }
    .toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    fixedCode: `fun main() {
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6).asSequence()
    .filter { it % 2 == 0 }
    .map {
      maps += 1
      it * 2
    }
    .toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    expectedOutput: 'Result: [4, 8, 12]\nMaps: 3',
    hints: [
              'Look at the counter. How many numbers are doubled?',
              'The map runs on every number first, and then the filter throws some away.',
              'Put the filter first, so the map only works on the numbers that you keep. The final result stays the same.',
            ],
    explanation: 'With `map` first, all six numbers are doubled and the filter removes some. With `filter { it % 2 == 0 }` first, only `2, 4, 6` reach the map, which doubles them to `4, 8, 12`. The result is the same, with half the work.',
  },
  {
    id: 'world-14-practice-debug-early-total',
    worldId: 'world-14',
    conceptTags: ['lesson:when-sequences-should-and-should-not-be-used', 'side-effect', 'lazy', 'terminal'],
    summary: 'The total is printed before the sequence runs.',
    title: 'Fix the Early Total',
    subtitle: 'The program should print "Total: 6", but it prints "Total: 0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the total is printed before the sequence runs',
    brokenCode: `fun main() {
  var total = 0
  val seq = listOf(1, 2, 3).asSequence().map {
    total += it
    it * 2
  }
  println("Total: " + total)
}`,
    fixedCode: `fun main() {
  var total = 0
  val seq = listOf(1, 2, 3).asSequence().map {
    total += it
    it * 2
  }
  seq.toList()
  println("Total: " + total)
}`,
    expectedOutput: 'Total: 6',
    hints: [
              'Look at where `total` is printed. Did the map run before that?',
              'The sequence is lazy, so the code inside `map` has not run yet when `total` is printed.',
              'Run the sequence with a terminal operation before you print `total`.',
            ],
    explanation: 'A sequence only runs when a terminal operation asks for the result. The `total` changes inside `map`, so it is still `0` before that. Calling `seq.toList()` first runs the map, and then `total` is `1 + 2 + 3 = 6`.',
  },
];
