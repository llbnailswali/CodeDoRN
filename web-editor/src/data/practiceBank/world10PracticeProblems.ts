import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 10 -- Collection Wizardry (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-6 dependent steps; the collection function (map, filter, fold, groupBy ...) is named in the step.
//   hard   -- several functions together, a result type that changes (pairs, maps, nested lists, nullable), or a value that depends on
//             the order of the steps; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world10.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world10.real.ts). Collections are printed with string
// templates because the simulator prints "text" + list as a raw JS value (see PITFALLS.md).

export const WORLD_10_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-10-practice-writerun-cart-totals',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Use map to change every price, then filter to keep the big ones.',
    conceptTags: ['lesson:map-mapnotnull-filter', 'map', 'filter', 'chain'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Cart Totals',
    goal: 'A shop adds tax to four prices. Print the new prices, then print only the prices above a limit.',
    description: '1. **Add tax to every price.** Call `prices.map { ... }`. Use `it` and add one tenth of it (`it / 10`). Keep the result in `withTax`.\n\n' +
              '2. **Keep the big prices.** Call `withTax.filter { ... }`. Keep the prices above `limit`. Keep the result in `big`.\n\n' +
              '3. **Print two lines.** Use string templates:\n"With tax: [13, 44, 7, 27]"\n"Big: [44, 27]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add tax to every price.** Use `map` and `it / 10`.',
          '2. **Keep the big prices.** Use `filter` and `limit`.',
          '3. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Add tax to every price. Use map and it / 10.',
          '// 2. Keep the big prices. Use filter and limit.',
          '// 3. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add tax to every price.**',
          '2. **Keep the big prices.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Add tax to every price.',
          '// 2. Keep the big prices.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CartTotals.kt',
    initialCode: `fun main() {
  val limit = 20
  val prices = listOf(12, 40, 7, 25)

  // 1. Add tax to every price. Call prices.map { ... }. Use it and add one tenth of it (it / 10). Keep the result in withTax.

  // 2. Keep the big prices. Call withTax.filter { ... }. Keep the prices above limit. Keep the result in big.

  // 3. Print two lines. Use string templates: "With tax: [13, 44, 7, 27]" "Big: [44, 27]"
}`,
    solutionCode: `fun main() {
  val limit = 20
  val prices = listOf(12, 40, 7, 25)
  val withTax = prices.map { it + it / 10 }
  val big = withTax.filter { it > limit }
  println("With tax: $withTax")
  println("Big: $big")
}`,
    sampleInput: 'main()',
    expectedOutput: 'With tax: [13, 44, 7, 27]\nBig: [44, 27]',
    testCase: { call: '', expected: 'With tax: [13, 44, 7, 27]\nBig: [44, 27]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '20', alternateLiteral: '10' }],
      alternateExpectedOutput: 'With tax: [13, 44, 7, 27]\nBig: [13, 44, 27]',
    },
  },
  {
    id: 'world-10-practice-writerun-valid-ages',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Turn text into numbers with mapNotNull, drop the bad text, then filter and count.',
    conceptTags: ['lesson:map-mapnotnull-filter', 'mapNotNull', 'toIntOrNull', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Valid Ages',
    goal: 'A form gives ages as text. Some of the text is not a number. Keep the real ages, find the adults, and count the bad entries.',
    description: '1. **Convert the text.** Call `raw.mapNotNull { ... }`. Use `it.toIntOrNull()` so bad text is dropped. Keep the result in `ages`.\n\n' +
              '2. **Find the adults.** Call `ages.filter { ... }` to keep the ages that are at least `minAge`. Keep the result in `adults`.\n\n' +
              '3. **Count the bad entries.** Set `skipped` to `raw.size - ages.size`.\n\n' +
              '4. **Print three lines.** Use a string template for each list:\n"Ages: [12, 30, 7]"\n"Adults: [30]"\n"Skipped: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Convert the text.** Use `mapNotNull` and `toIntOrNull()`.',
          '2. **Find the adults.** Use `filter` and `minAge`.',
          '3. **Count the bad entries.** Subtract the two sizes.',
          '4. **Print three lines.** Show both lists and the count.',
        ],
        comments: [
          '// 1. Convert the text. Use mapNotNull and toIntOrNull().',
          '// 2. Find the adults. Use filter and minAge.',
          '// 3. Count the bad entries. Subtract the two sizes.',
          '// 4. Print three lines. Show both lists and the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Convert the text.**',
          '2. **Find the adults.**',
          '3. **Count the bad entries.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Convert the text.',
          '// 2. Find the adults.',
          '// 3. Count the bad entries.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ValidAges.kt',
    initialCode: `fun main() {
  val minAge = 18
  val raw = listOf("12", "x", "30", "", "7")

  // 1. Convert the text. Call raw.mapNotNull { ... }. Use it.toIntOrNull() so bad text is dropped. Keep the result in ages.

  // 2. Find the adults. Call ages.filter { ... } to keep the ages that are at least minAge. Keep the result in adults.

  // 3. Count the bad entries. Set skipped to raw.size - ages.size.

  // 4. Print three lines. Use a string template for each list: "Ages: [12, 30, 7]" "Adults: [30]" "Skipped: 2"
}`,
    solutionCode: `fun main() {
  val minAge = 18
  val raw = listOf("12", "x", "30", "", "7")
  val ages = raw.mapNotNull { it.toIntOrNull() }
  val adults = ages.filter { it >= minAge }
  val skipped = raw.size - ages.size
  println("Ages: $ages")
  println("Adults: $adults")
  println("Skipped: " + skipped)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ages: [12, 30, 7]\nAdults: [30]\nSkipped: 2',
    testCase: { call: '', expected: 'Ages: [12, 30, 7]\nAdults: [30]\nSkipped: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'minAge', originalLiteral: '18', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Ages: [12, 30, 7]\nAdults: [12, 30]\nSkipped: 2',
    },
  },
  {
    id: 'world-10-practice-writerun-mixed-bag',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Split a mixed list by type with filterIsInstance, then drop the long words with filterNot.',
    conceptTags: ['lesson:filternot-filterisinstance-flatmap', 'filterIsInstance', 'filterNot'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Mixed Bag',
    goal: 'A list holds words and true or false values. Split it by type, then drop the words that are too long.',
    description: '1. **Get the words.** Call `items.filterIsInstance<String>()` and keep the result in `texts`.\n\n' +
              '2. **Get the true or false values.** Call `items.filterIsInstance<Boolean>()` and keep the result in `flags`.\n\n' +
              '3. **Drop the long words.** Call `texts.filterNot { ... }` to remove the words with `it.length` above `limit`. Keep the result in `short`.\n\n' +
              '4. **Print three lines.** Use string templates:\n"Texts: [tea, milk, cola]"\n"Flags: [true, false]"\n"Short: [tea]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Get the words.** Use `filterIsInstance<String>()`.',
          '2. **Get the true or false values.** Use `filterIsInstance<Boolean>()`.',
          '3. **Drop the long words.** Use `filterNot` and `limit`.',
          '4. **Print three lines.** Show all three lists.',
        ],
        comments: [
          '// 1. Get the words. Use filterIsInstance<String>().',
          '// 2. Get the true or false values. Use filterIsInstance<Boolean>().',
          '// 3. Drop the long words. Use filterNot and limit.',
          '// 4. Print three lines. Show all three lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Get the words.**',
          '2. **Get the true or false values.**',
          '3. **Drop the long words.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Get the words.',
          '// 2. Get the true or false values.',
          '// 3. Drop the long words.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MixedBag.kt',
    initialCode: `fun main() {
  val limit = 3
  val items: List<Any> = listOf("tea", true, "milk", false, "cola")

  // 1. Get the words. Call items.filterIsInstance<String>() and keep the result in texts.

  // 2. Get the true or false values. Call items.filterIsInstance<Boolean>() and keep the result in flags.

  // 3. Drop the long words. Call texts.filterNot { ... } to remove the words with it.length above limit. Keep the result in short.

  // 4. Print three lines. Use string templates: "Texts: [tea, milk, cola]" "Flags: [true, false]" "Short: [tea]"
}`,
    solutionCode: `fun main() {
  val limit = 3
  val items: List<Any> = listOf("tea", true, "milk", false, "cola")
  val texts = items.filterIsInstance<String>()
  val flags = items.filterIsInstance<Boolean>()
  val short = texts.filterNot { it.length > limit }
  println("Texts: $texts")
  println("Flags: $flags")
  println("Short: $short")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Texts: [tea, milk, cola]\nFlags: [true, false]\nShort: [tea]',
    testCase: { call: '', expected: 'Texts: [tea, milk, cola]\nFlags: [true, false]\nShort: [tea]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Texts: [tea, milk, cola]\nFlags: [true, false]\nShort: [tea, milk, cola]',
    },
  },
  {
    id: 'world-10-practice-writerun-split-parts',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Use flatMap to turn phrases into one list of words, then remove short words.',
    conceptTags: ['lesson:filternot-filterisinstance-flatmap', 'flatMap', 'filterNot', 'split'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Split Parts',
    goal: 'Each phrase holds words split by spaces. Make one list of all the words, then remove the words that are too short.',
    description: '1. **Split the phrases.** Call `phrases.flatMap { ... }`. Use `it.split(" ")` to get the words of each phrase. Keep the result in `parts`.\n\n' +
              '2. **Remove the short words.** Call `parts.filterNot { ... }`. Remove the words with `it.length` below `minLen`. Keep the result in `kept`.\n\n' +
              '3. **Print two lines.** Use string templates:\n"Parts: [a, bb, ccc, d, ee]"\n"Kept: [bb, ccc, ee]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Split the phrases.** Use `flatMap` and `split(" ")`.',
          '2. **Remove the short words.** Use `filterNot` and `minLen`.',
          '3. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Split the phrases. Use flatMap and split(" ").',
          '// 2. Remove the short words. Use filterNot and minLen.',
          '// 3. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Split the phrases.**',
          '2. **Remove the short words.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Split the phrases.',
          '// 2. Remove the short words.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SplitParts.kt',
    initialCode: `fun main() {
  val minLen = 2
  val phrases = listOf("a bb", "ccc d", "ee")

  // 1. Split the phrases. Call phrases.flatMap { ... }. Use it.split(" ") to get the words of each phrase. Keep the result in parts.

  // 2. Remove the short words. Call parts.filterNot { ... }. Remove the words with it.length below minLen. Keep the result in kept.

  // 3. Print two lines. Use string templates: "Parts: [a, bb, ccc, d, ee]" "Kept: [bb, ccc, ee]"
}`,
    solutionCode: `fun main() {
  val minLen = 2
  val phrases = listOf("a bb", "ccc d", "ee")
  val parts = phrases.flatMap { it.split(" ") }
  val kept = parts.filterNot { it.length < minLen }
  println("Parts: $parts")
  println("Kept: $kept")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Parts: [a, bb, ccc, d, ee]\nKept: [bb, ccc, ee]',
    testCase: { call: '', expected: 'Parts: [a, bb, ccc, d, ee]\nKept: [bb, ccc, ee]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'minLen', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Parts: [a, bb, ccc, d, ee]\nKept: [ccc]',
    },
  },
  {
    id: 'world-10-practice-writerun-batch-totals',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Join batches with flatten, then add them with reduce and with fold.',
    conceptTags: ['lesson:flatten-reduce-fold', 'flatten', 'reduce', 'fold'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Batch Totals',
    goal: 'Orders arrive in batches. Join the batches into one list. Add up all the numbers, and add them again starting from a base number.',
    description: '1. **Join the batches.** Call `batches.flatten()` and keep the result in `all`.\n\n' +
              '2. **Add them up.** Call `all.reduce { acc, n -> ... }` to add `acc` and `n`. Keep the result in `total`.\n\n' +
              '3. **Add from the base.** Call `all.fold(base) { acc, n -> ... }`. Add `acc` and `n` again. Keep the result in `withBase`.\n\n' +
              '4. **Print three lines.** Use a string template for the list:\n"All: [4, 6, 10, 3, 7, 5]"\n"Total: 35"\n"With base: 135"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Join the batches.** Use `flatten()`.',
          '2. **Add them up.** Use `reduce`.',
          '3. **Add from the base.** Use `fold` with `base`.',
          '4. **Print three lines.** Show the list and both totals.',
        ],
        comments: [
          '// 1. Join the batches. Use flatten().',
          '// 2. Add them up. Use reduce.',
          '// 3. Add from the base. Use fold with base.',
          '// 4. Print three lines. Show the list and both totals.',
        ],
      },
      experienced: {
        steps: [
          '1. **Join the batches.**',
          '2. **Add them up.**',
          '3. **Add from the base.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Join the batches.',
          '// 2. Add them up.',
          '// 3. Add from the base.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BatchTotals.kt',
    initialCode: `fun main() {
  val base = 100
  val batches = listOf(listOf(4, 6), listOf(10), listOf(3, 7, 5))

  // 1. Join the batches. Call batches.flatten() and keep the result in all.

  // 2. Add them up. Call all.reduce { acc, n -> ... } to add acc and n. Keep the result in total.

  // 3. Add from the base. Call all.fold(base) { acc, n -> ... }. Add acc and n again. Keep the result in withBase.

  // 4. Print three lines. Use a string template for the list: "All: [4, 6, 10, 3, 7, 5]" "Total: 35" "With base: 135"
}`,
    solutionCode: `fun main() {
  val base = 100
  val batches = listOf(listOf(4, 6), listOf(10), listOf(3, 7, 5))
  val all = batches.flatten()
  val total = all.reduce { acc, n -> acc + n }
  val withBase = all.fold(base) { acc, n -> acc + n }
  println("All: $all")
  println("Total: " + total)
  println("With base: " + withBase)
}`,
    sampleInput: 'main()',
    expectedOutput: 'All: [4, 6, 10, 3, 7, 5]\nTotal: 35\nWith base: 135',
    testCase: { call: '', expected: 'All: [4, 6, 10, 3, 7, 5]\nTotal: 35\nWith base: 135' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '100', alternateLiteral: '50' }],
      alternateExpectedOutput: 'All: [4, 6, 10, 3, 7, 5]\nTotal: 35\nWith base: 85',
    },
  },
  {
    id: 'world-10-practice-writerun-score-folds',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Use fold to count and to build text, and reduce to find the best score.',
    conceptTags: ['lesson:flatten-reduce-fold', 'fold', 'reduce', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Score Folds',
    goal: 'Go through a list of scores. Count the scores that pass, find the best score, and build a text of all the scores.',
    description: '1. **Count the passes.** Call `scores.fold(0) { count, s -> ... }`. Add `1` to `count` when `s` is at least `passMark`, otherwise keep `count`. Keep the result in `passed`.\n\n' +
              '2. **Find the best score.** Call `scores.reduce { a, b -> ... }`. Return `b` when it is bigger than `a`, otherwise return `a`. Keep the result in `best`.\n\n' +
              '3. **Build the text.** Call `scores.fold("") { acc, s -> ... }`. Add each score and a semicolon to `acc`. Keep the result in `text`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Passed: 3"\n"Best: 91"\n"Text: 55;80;62;91;70;"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Count the passes.** Use `fold(0)` and `passMark`.',
          '2. **Find the best score.** Use `reduce` and compare two scores.',
          '3. **Build the text.** Use `fold` with an empty text.',
          '4. **Print three lines.** Show all three results.',
        ],
        comments: [
          '// 1. Count the passes. Use fold(0) and passMark.',
          '// 2. Find the best score. Use reduce and compare two scores.',
          '// 3. Build the text. Use fold with an empty text.',
          '// 4. Print three lines. Show all three results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Count the passes.**',
          '2. **Find the best score.**',
          '3. **Build the text.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Count the passes.',
          '// 2. Find the best score.',
          '// 3. Build the text.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScoreFolds.kt',
    initialCode: `fun main() {
  val passMark = 65
  val scores = listOf(55, 80, 62, 91, 70)

  // 1. Count the passes. Call scores.fold(0) { count, s -> ... }. Add 1 to count when s is at least passMark, otherwise keep count. Keep the result in passed.

  // 2. Find the best score. Call scores.reduce { a, b -> ... }. Return b when it is bigger than a, otherwise return a. Keep the result in best.

  // 3. Build the text. Call scores.fold("") { acc, s -> ... }. Add each score and a semicolon to acc. Keep the result in text.

  // 4. Print three lines. Join the text with +: "Passed: 3" "Best: 91" "Text: 55;80;62;91;70;"
}`,
    solutionCode: `fun main() {
  val passMark = 65
  val scores = listOf(55, 80, 62, 91, 70)
  val passed = scores.fold(0) { count, s -> if (s >= passMark) count + 1 else count }
  val best = scores.reduce { a, b -> if (b > a) b else a }
  val text = scores.fold("") { acc, s -> acc + s + ";" }
  println("Passed: " + passed)
  println("Best: " + best)
  println("Text: " + text)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Passed: 3\nBest: 91\nText: 55;80;62;91;70;',
    testCase: { call: '', expected: 'Passed: 3\nBest: 91\nText: 55;80;62;91;70;' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'passMark', originalLiteral: '65', alternateLiteral: '75' }],
      alternateExpectedOutput: 'Passed: 2\nBest: 91\nText: 55;80;62;91;70;',
    },
  },
  {
    id: 'world-10-practice-writerun-group-lengths',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Group words by length with groupBy, then look up one group.',
    conceptTags: ['lesson:groupby-associate-partition', 'groupBy', 'map-lookup'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Group by Length',
    goal: 'Put drink names into groups by their length. Then look up one group and print it.',
    description: '1. **Group the words.** Call `words.groupBy { ... }` and use `it.length` as the key. Keep the result in `groups`.\n\n' +
              '2. **Look up one group.** Set `found` to `groups[key]`.\n\n' +
              '3. **Print two lines.** Use string templates:\n"Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}"\n"Length 4: [milk, cola]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Group the words.** Use `groupBy` with the length.',
          '2. **Look up one group.** Use `key` as the index.',
          '3. **Print two lines.** Show the map and the found group.',
        ],
        comments: [
          '// 1. Group the words. Use groupBy with the length.',
          '// 2. Look up one group. Use key as the index.',
          '// 3. Print two lines. Show the map and the found group.',
        ],
      },
      experienced: {
        steps: [
          '1. **Group the words.**',
          '2. **Look up one group.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Group the words.',
          '// 2. Look up one group.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GroupLengths.kt',
    initialCode: `fun main() {
  val key = 4
  val words = listOf("tea", "coffee", "milk", "juice", "cola", "water")

  // 1. Group the words. Call words.groupBy { ... } and use it.length as the key. Keep the result in groups.

  // 2. Look up one group. Set found to groups[key].

  // 3. Print two lines. Use string templates: "Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}" "Length 4: [milk, cola]"
}`,
    solutionCode: `fun main() {
  val key = 4
  val words = listOf("tea", "coffee", "milk", "juice", "cola", "water")
  val groups = words.groupBy { it.length }
  val found = groups[key]
  println("Groups: $groups")
  println("Length $key: $found")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}\nLength 4: [milk, cola]',
    testCase: { call: '', expected: 'Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}\nLength 4: [milk, cola]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'key', originalLiteral: '4', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}\nLength 5: [juice, water]',
    },
  },
  {
    id: 'world-10-practice-writerun-pass-split',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Split marks with partition, then build a map of gaps with associate.',
    conceptTags: ['lesson:groupby-associate-partition', 'partition', 'associate', 'destructuring'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pass Split',
    goal: 'Split marks into passed and failed. Then, for each passed mark, find how far it is above the pass mark.',
    description: '1. **Split the marks.** Write `val (passed, failed) = marks.partition { ... }`. The first list holds the marks that are at least `passMark`.\n\n' +
              '2. **Find the gaps.** Call `passed.associate { ... }`. Pair each mark (`it`) with `it - passMark`. Keep the result in `gaps`.\n\n' +
              '3. **Print the lists.** Use string templates:\n"Passed: [72, 88, 50]"\n"Failed: [45, 31]"\n\n' +
              '4. **Print the gaps.** Use a string template:\n"Gaps: {72=22, 88=38, 50=0}"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Split the marks.** Use `partition` and `passMark`.',
          '2. **Find the gaps.** Use `associate` with `it - passMark`.',
          '3. **Print the lists.** Show passed and failed.',
          '4. **Print the gaps.** Show the map.',
        ],
        comments: [
          '// 1. Split the marks. Use partition and passMark.',
          '// 2. Find the gaps. Use associate with it - passMark.',
          '// 3. Print the lists. Show passed and failed.',
          '// 4. Print the gaps. Show the map.',
        ],
      },
      experienced: {
        steps: [
          '1. **Split the marks.**',
          '2. **Find the gaps.**',
          '3. **Print the lists.**',
          '4. **Print the gaps.**',
        ],
        comments: [
          '// 1. Split the marks.',
          '// 2. Find the gaps.',
          '// 3. Print the lists.',
          '// 4. Print the gaps.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PassSplit.kt',
    initialCode: `fun main() {
  val passMark = 50
  val marks = listOf(72, 45, 88, 50, 31)

  // 1. Split the marks. Write val (passed, failed) = marks.partition { ... }. The first list holds the marks that are at least passMark.

  // 2. Find the gaps. Call passed.associate { ... }. Pair each mark (it) with it - passMark. Keep the result in gaps.

  // 3. Print the lists. Use string templates: "Passed: [72, 88, 50]" "Failed: [45, 31]"

  // 4. Print the gaps. Use a string template: "Gaps: {72=22, 88=38, 50=0}"
}`,
    solutionCode: `fun main() {
  val passMark = 50
  val marks = listOf(72, 45, 88, 50, 31)
  val (passed, failed) = marks.partition { it >= passMark }
  val gaps = passed.associate { it to it - passMark }
  println("Passed: $passed")
  println("Failed: $failed")
  println("Gaps: $gaps")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Passed: [72, 88, 50]\nFailed: [45, 31]\nGaps: {72=22, 88=38, 50=0}',
    testCase: { call: '', expected: 'Passed: [72, 88, 50]\nFailed: [45, 31]\nGaps: {72=22, 88=38, 50=0}' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'passMark', originalLiteral: '50', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Passed: [72, 88]\nFailed: [45, 50, 31]\nGaps: {72=12, 88=28}',
    },
  },
  {
    id: 'world-10-practice-writerun-name-scores',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Join two lists into pairs with zip, then filter the pairs.',
    conceptTags: ['lesson:zip-chunked-windowed', 'zip', 'pair', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Name Scores',
    goal: 'Join a list of names with a list of scores. Keep only the pairs with a strong score.',
    description: '1. **Join the lists.** Call `names.zip(scores)` and keep the result in `pairs`.\n\n' +
              '2. **Keep the strong pairs.** Call `pairs.filter { ... }`. Keep the pairs where `it.second` is above `cutoff`. Keep the result in `strong`.\n\n' +
              '3. **Print two lines.** Use string templates:\n"Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]"\n"Strong: [(Ana, 70), (Bo, 85)]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Join the lists.** Use `zip`.',
          '2. **Keep the strong pairs.** Use `filter` and `it.second`.',
          '3. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Join the lists. Use zip.',
          '// 2. Keep the strong pairs. Use filter and it.second.',
          '// 3. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Join the lists.**',
          '2. **Keep the strong pairs.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Join the lists.',
          '// 2. Keep the strong pairs.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NameScores.kt',
    initialCode: `fun main() {
  val cutoff = 65
  val names = listOf("Ana", "Bo", "Cy")
  val scores = listOf(70, 85, 60)

  // 1. Join the lists. Call names.zip(scores) and keep the result in pairs.

  // 2. Keep the strong pairs. Call pairs.filter { ... }. Keep the pairs where it.second is above cutoff. Keep the result in strong.

  // 3. Print two lines. Use string templates: "Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]" "Strong: [(Ana, 70), (Bo, 85)]"
}`,
    solutionCode: `fun main() {
  val cutoff = 65
  val names = listOf("Ana", "Bo", "Cy")
  val scores = listOf(70, 85, 60)
  val pairs = names.zip(scores)
  val strong = pairs.filter { it.second > cutoff }
  println("Pairs: $pairs")
  println("Strong: $strong")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]\nStrong: [(Ana, 70), (Bo, 85)]',
    testCase: { call: '', expected: 'Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]\nStrong: [(Ana, 70), (Bo, 85)]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'cutoff', originalLiteral: '65', alternateLiteral: '80' }],
      alternateExpectedOutput: 'Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]\nStrong: [(Bo, 85)]',
    },
  },
  {
    id: 'world-10-practice-writerun-chunk-window',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Cut a list with chunked and windowed, then add up each window.',
    conceptTags: ['lesson:zip-chunked-windowed', 'chunked', 'windowed', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Chunks and Windows',
    goal: 'Cut a list of readings into separate groups, and into overlapping groups. Add up each overlapping group.',
    description: '1. **Cut into chunks.** Call `readings.chunked(size)` and keep the result in `chunks`.\n\n' +
              '2. **Make sliding windows.** Call `readings.windowed(size)` and keep the result in `windows`. Each window overlaps the one before it.\n\n' +
              '3. **Add up each window.** Call `windows.map { ... }` and use `it.sum()`. Keep the result in `sums`.\n\n' +
              '4. **Print three lines.** The window count is `windows.size`:\n"Chunks: [[2, 4, 6], [8, 10, 12], [14]]"\n"Windows: 5"\n"Sums: [12, 18, 24, 30, 36]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Cut into chunks.** Use `chunked(size)`.',
          '2. **Make sliding windows.** Use `windowed(size)`.',
          '3. **Add up each window.** Use `map` and `sum()`.',
          '4. **Print three lines.** Show the chunks, the window count and the sums.',
        ],
        comments: [
          '// 1. Cut into chunks. Use chunked(size).',
          '// 2. Make sliding windows. Use windowed(size).',
          '// 3. Add up each window. Use map and sum().',
          '// 4. Print three lines. Show the chunks, the window count and the sums.',
        ],
      },
      experienced: {
        steps: [
          '1. **Cut into chunks.**',
          '2. **Make sliding windows.**',
          '3. **Add up each window.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Cut into chunks.',
          '// 2. Make sliding windows.',
          '// 3. Add up each window.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ChunkWindow.kt',
    initialCode: `fun main() {
  val size = 3
  val readings = listOf(2, 4, 6, 8, 10, 12, 14)

  // 1. Cut into chunks. Call readings.chunked(size) and keep the result in chunks.

  // 2. Make sliding windows. Call readings.windowed(size) and keep the result in windows. Each window overlaps the one before it.

  // 3. Add up each window. Call windows.map { ... } and use it.sum(). Keep the result in sums.

  // 4. Print three lines. The window count is windows.size: "Chunks: [[2, 4, 6], [8, 10, 12], [14]]" "Windows: 5" "Sums: [12, 18, 24, 30, 36]"
}`,
    solutionCode: `fun main() {
  val size = 3
  val readings = listOf(2, 4, 6, 8, 10, 12, 14)
  val chunks = readings.chunked(size)
  val windows = readings.windowed(size)
  val sums = windows.map { it.sum() }
  println("Chunks: $chunks")
  println("Windows: " + windows.size)
  println("Sums: $sums")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Chunks: [[2, 4, 6], [8, 10, 12], [14]]\nWindows: 5\nSums: [12, 18, 24, 30, 36]',
    testCase: { call: '', expected: 'Chunks: [[2, 4, 6], [8, 10, 12], [14]]\nWindows: 5\nSums: [12, 18, 24, 30, 36]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'size', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Chunks: [[2, 4, 6, 8], [10, 12, 14]]\nWindows: 4\nSums: [20, 28, 36, 44]',
    },
  },
  {
    id: 'world-10-practice-writerun-unique-tags',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Remove repeats with distinct, then sort in both directions and keep the top few.',
    conceptTags: ['lesson:distinct-sorted', 'distinct', 'sorted', 'sortedDescending', 'take'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Unique Tags',
    goal: 'A list of tags has repeats. Remove the repeats, sort what is left in both directions, and keep the biggest few.',
    description: '1. **Remove repeats.** Call `tags.distinct()` and keep the result in `unique`.\n\n' +
              '2. **Sort upwards.** Call `unique.sorted()` and keep the result in `ascending`.\n\n' +
              '3. **Keep the top tags.** Call `unique.sortedDescending()`, then `take(limit)`. Keep the result in `top`.\n\n' +
              '4. **Print three lines.** Use string templates:\n"Unique: [5, 3, 9, 1]"\n"Ascending: [1, 3, 5, 9]"\n"Top: [9, 5]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Remove repeats.** Use `distinct()`.',
          '2. **Sort upwards.** Use `sorted()`.',
          '3. **Keep the top tags.** Sort down, then use `take`.',
          '4. **Print three lines.** Show all three lists.',
        ],
        comments: [
          '// 1. Remove repeats. Use distinct().',
          '// 2. Sort upwards. Use sorted().',
          '// 3. Keep the top tags. Sort down, then use take.',
          '// 4. Print three lines. Show all three lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Remove repeats.**',
          '2. **Sort upwards.**',
          '3. **Keep the top tags.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Remove repeats.',
          '// 2. Sort upwards.',
          '// 3. Keep the top tags.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'UniqueTags.kt',
    initialCode: `fun main() {
  val limit = 2
  val tags = listOf(5, 3, 5, 9, 3, 1)

  // 1. Remove repeats. Call tags.distinct() and keep the result in unique.

  // 2. Sort upwards. Call unique.sorted() and keep the result in ascending.

  // 3. Keep the top tags. Call unique.sortedDescending(), then take(limit). Keep the result in top.

  // 4. Print three lines. Use string templates: "Unique: [5, 3, 9, 1]" "Ascending: [1, 3, 5, 9]" "Top: [9, 5]"
}`,
    solutionCode: `fun main() {
  val limit = 2
  val tags = listOf(5, 3, 5, 9, 3, 1)
  val unique = tags.distinct()
  val ascending = unique.sorted()
  val top = unique.sortedDescending().take(limit)
  println("Unique: $unique")
  println("Ascending: $ascending")
  println("Top: $top")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Unique: [5, 3, 9, 1]\nAscending: [1, 3, 5, 9]\nTop: [9, 5]',
    testCase: { call: '', expected: 'Unique: [5, 3, 9, 1]\nAscending: [1, 3, 5, 9]\nTop: [9, 5]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Unique: [5, 3, 9, 1]\nAscending: [1, 3, 5, 9]\nTop: [9, 5, 3]',
    },
  },
  {
    id: 'world-10-practice-writerun-sort-words',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Remove repeated words, sort them, and keep one word for each length.',
    conceptTags: ['lesson:distinct-sorted', 'distinctBy', 'sorted', 'take'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Sort the Words',
    goal: 'A list of words has repeats. Remove them, sort the words, keep the first few, and find the first word of each length.',
    description: '1. **Remove repeats.** Call `words.distinct()` and keep the result in `unique`.\n\n' +
              '2. **Sort and cut.** Call `unique.sorted()` and keep it in `sortedWords`. Then call `sortedWords.take(top)` and keep it in `firstWords`.\n\n' +
              '3. **Keep one word per length.** Call `words.distinctBy { ... }` and use `it.length`. Keep the result in `byLength`.\n\n' +
              '4. **Count the repeats.** Set `repeats` to `words.size - unique.size`.\n\n' +
              '5. **Print four lines.** Use string templates for the lists:\n"Sorted: [apple, fig, kiwi, pear]"\n"First: [apple, fig]"\n"By length: [pear, fig, apple]"\n"Repeats: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Remove repeats.** Use `distinct()`.',
          '2. **Sort and cut.** Use `sorted()` and `take(top)`.',
          '3. **Keep one word per length.** Use `distinctBy`.',
          '4. **Count the repeats.** Compare the two sizes.',
          '5. **Print four lines.** Show the lists and the count.',
        ],
        comments: [
          '// 1. Remove repeats. Use distinct().',
          '// 2. Sort and cut. Use sorted() and take(top).',
          '// 3. Keep one word per length. Use distinctBy.',
          '// 4. Count the repeats. Compare the two sizes.',
          '// 5. Print four lines. Show the lists and the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Remove repeats.**',
          '2. **Sort and cut.**',
          '3. **Keep one word per length.**',
          '4. **Count the repeats.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Remove repeats.',
          '// 2. Sort and cut.',
          '// 3. Keep one word per length.',
          '// 4. Count the repeats.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SortWords.kt',
    initialCode: `fun main() {
  val top = 2
  val words = listOf("pear", "fig", "apple", "fig", "kiwi")

  // 1. Remove repeats. Call words.distinct() and keep the result in unique.

  // 2. Sort and cut. Call unique.sorted() and keep it in sortedWords. Then call sortedWords.take(top) and keep it in firstWords.

  // 3. Keep one word per length. Call words.distinctBy { ... } and use it.length. Keep the result in byLength.

  // 4. Count the repeats. Set repeats to words.size - unique.size.

  // 5. Print four lines. Use string templates for the lists: "Sorted: [apple, fig, kiwi, pear]" "First: [apple, fig]" "By length: [pear, fig, apple]" "Repeats: 1"
}`,
    solutionCode: `fun main() {
  val top = 2
  val words = listOf("pear", "fig", "apple", "fig", "kiwi")
  val unique = words.distinct()
  val sortedWords = unique.sorted()
  val firstWords = sortedWords.take(top)
  val byLength = words.distinctBy { it.length }
  val repeats = words.size - unique.size
  println("Sorted: $sortedWords")
  println("First: $firstWords")
  println("By length: $byLength")
  println("Repeats: " + repeats)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sorted: [apple, fig, kiwi, pear]\nFirst: [apple, fig]\nBy length: [pear, fig, apple]\nRepeats: 1',
    testCase: { call: '', expected: 'Sorted: [apple, fig, kiwi, pear]\nFirst: [apple, fig]\nBy length: [pear, fig, apple]\nRepeats: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'top', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Sorted: [apple, fig, kiwi, pear]\nFirst: [apple, fig, kiwi]\nBy length: [pear, fig, apple]\nRepeats: 1',
    },
  },
  {
    id: 'world-10-practice-writerun-budget-shelf',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Sort objects by a property, find the cheapest and dearest, and list what fits a budget.',
    conceptTags: ['lesson:sortedby-min-max', 'sortedBy', 'minByOrNull', 'maxByOrNull', 'class-list'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Budget Shelf',
    goal: 'A shop has four items. Sort them by price, find the cheapest and the dearest, and list what fits in a budget.',
    description: 'The class `Item` is in the starter code with `name` and `price`.\n\n' +
              '1. **Sort by price.** Call `items.sortedBy { ... }` with `it.price`, then `map { it.name }`. Keep the result in `byPrice`.\n\n' +
              '2. **Find the cheapest.** Call `items.minByOrNull { ... }` with `it.price`. Keep the result in `cheapest`.\n\n' +
              '3. **Find the dearest.** Call `items.maxByOrNull { ... }` with `it.price`. Keep the result in `priciest`.\n\n' +
              '4. **List what fits.** Call `items.filter { ... }` to keep prices up to `budget`. Then call `sortedByDescending { it.price }` and `map { it.name }`. Keep the result in `affordable`.\n\n' +
              '5. **Print four lines.** The result can be `null`, so use `?.name ?: "none"`:\n"By price: [cap, pen, bag, book]"\n"Cheapest: cap"\n"Priciest: book"\n"Affordable: [bag, pen, cap]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Sort by price.** Use `sortedBy` and `map`.',
          '2. **Find the cheapest.** Use `minByOrNull`.',
          '3. **Find the dearest.** Use `maxByOrNull`.',
          '4. **List what fits.** Filter by `budget`, then sort down.',
          '5. **Print four lines.** Handle `null` with `?.name`.',
        ],
        comments: [
          '// 1. Sort by price. Use sortedBy and map.',
          '// 2. Find the cheapest. Use minByOrNull.',
          '// 3. Find the dearest. Use maxByOrNull.',
          '// 4. List what fits. Filter by budget, then sort down.',
          '// 5. Print four lines. Handle null with ?.name.',
        ],
      },
      experienced: {
        steps: [
          '1. **Sort by price.**',
          '2. **Find the cheapest.**',
          '3. **Find the dearest.**',
          '4. **List what fits.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Sort by price.',
          '// 2. Find the cheapest.',
          '// 3. Find the dearest.',
          '// 4. List what fits.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BudgetShelf.kt',
    initialCode: `class Item(val name: String, val price: Int)

fun main() {
  val budget = 35
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8), Item("bag", 30))

  // 1. Sort by price. Call items.sortedBy { ... } with it.price, then map { it.name }. Keep the result in byPrice.

  // 2. Find the cheapest. Call items.minByOrNull { ... } with it.price. Keep the result in cheapest.

  // 3. Find the dearest. Call items.maxByOrNull { ... } with it.price. Keep the result in priciest.

  // 4. List what fits. Call items.filter { ... } to keep prices up to budget. Then call sortedByDescending { it.price } and map { it.name }. Keep the result in affordable.

  // 5. Print four lines. The result can be null, so use ?.name ?: "none": "By price: [cap, pen, bag, book]" "Cheapest: cap" "Priciest: book" "Affordable: [bag, pen, cap]"
}`,
    solutionCode: `class Item(val name: String, val price: Int)

fun main() {
  val budget = 35
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8), Item("bag", 30))
  val byPrice = items.sortedBy { it.price }.map { it.name }
  val cheapest = items.minByOrNull { it.price }
  val priciest = items.maxByOrNull { it.price }
  val affordable = items.filter { it.price <= budget }.sortedByDescending { it.price }.map { it.name }
  println("By price: $byPrice")
  println("Cheapest: " + (cheapest?.name ?: "none"))
  println("Priciest: " + (priciest?.name ?: "none"))
  println("Affordable: $affordable")
}`,
    sampleInput: 'main()',
    expectedOutput: 'By price: [cap, pen, bag, book]\nCheapest: cap\nPriciest: book\nAffordable: [bag, pen, cap]',
    testCase: { call: '', expected: 'By price: [cap, pen, bag, book]\nCheapest: cap\nPriciest: book\nAffordable: [bag, pen, cap]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'budget', originalLiteral: '35', alternateLiteral: '15' }],
      alternateExpectedOutput: 'By price: [cap, pen, bag, book]\nCheapest: cap\nPriciest: book\nAffordable: [pen, cap]',
    },
  },
  {
    id: 'world-10-practice-writerun-min-max-range',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Find the lowest and highest value, the gap between them, and the values well above the lowest.',
    conceptTags: ['lesson:sortedby-min-max', 'min', 'max', 'filter', 'spread'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Min, Max and Spread',
    goal: 'Find the lowest and highest value in a list, and the gap between them. Then keep the values that are well above the lowest.',
    description: '1. **Find the lowest and highest.** Set `low` to `values.min()` and `high` to `values.max()`.\n\n' +
              '2. **Find the spread.** Set `spread` to `high - low`.\n\n' +
              '3. **Keep the high values.** Call `values.filter { ... }`. Keep the values above `low + threshold`. Keep the result in `above`.\n\n' +
              '4. **Print four lines.** Use `+` for the numbers and a string template for the list:\n"Low: 3"\n"High: 27"\n"Spread: 24"\n"Above: [14, 27, 9]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the lowest and highest.** Use `min()` and `max()`.',
          '2. **Find the spread.** Subtract the two.',
          '3. **Keep the high values.** Use `filter` and `threshold`.',
          '4. **Print four lines.** Show the numbers and the list.',
        ],
        comments: [
          '// 1. Find the lowest and highest. Use min() and max().',
          '// 2. Find the spread. Subtract the two.',
          '// 3. Keep the high values. Use filter and threshold.',
          '// 4. Print four lines. Show the numbers and the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the lowest and highest.**',
          '2. **Find the spread.**',
          '3. **Keep the high values.**',
          '4. **Print four lines.**',
        ],
        comments: [
          '// 1. Find the lowest and highest.',
          '// 2. Find the spread.',
          '// 3. Keep the high values.',
          '// 4. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MinMaxRange.kt',
    initialCode: `fun main() {
  val threshold = 5
  val values = listOf(14, 3, 27, 9)

  // 1. Find the lowest and highest. Set low to values.min() and high to values.max().

  // 2. Find the spread. Set spread to high - low.

  // 3. Keep the high values. Call values.filter { ... }. Keep the values above low + threshold. Keep the result in above.

  // 4. Print four lines. Use + for the numbers and a string template for the list: "Low: 3" "High: 27" "Spread: 24" "Above: [14, 27, 9]"
}`,
    solutionCode: `fun main() {
  val threshold = 5
  val values = listOf(14, 3, 27, 9)
  val low = values.min()
  val high = values.max()
  val spread = high - low
  val above = values.filter { it > low + threshold }
  println("Low: " + low)
  println("High: " + high)
  println("Spread: " + spread)
  println("Above: $above")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Low: 3\nHigh: 27\nSpread: 24\nAbove: [14, 27, 9]',
    testCase: { call: '', expected: 'Low: 3\nHigh: 27\nSpread: 24\nAbove: [14, 27, 9]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'threshold', originalLiteral: '5', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Low: 3\nHigh: 27\nSpread: 24\nAbove: [14, 27]',
    },
  },
  {
    id: 'world-10-practice-writerun-basket-stats',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Find the sum and the average, then ask any, all and none questions about the prices.',
    conceptTags: ['lesson:sum-average-any-all-none', 'sum', 'average', 'any', 'all', 'none'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Basket Stats',
    goal: 'A basket holds four prices. Print the total and the average. Then answer three yes or no questions about the prices.',
    description: '1. **Add up the prices.** Set `total` to `prices.sum()`.\n\n' +
              '2. **Find the average.** Set `average` to `prices.average()`.\n\n' +
              '3. **Check for a big price.** Set `anyBig` to `prices.any { ... }`. It is true when some price is above `limit`.\n\n' +
              '4. **Check every price.** Set `allPaid` to `prices.all { ... }`. It is true when every price is at least `10`.\n\n' +
              '5. **Check for free items.** Set `noneFree` to `prices.none { ... }`. It is true when no price is `0`.\n\n' +
              '6. **Print five lines.** Join the text with `+`:\n"Sum: 120"\n"Average: 30.0"\n"Any above 45: true"\n"All at least 10: true"\n"None free: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add up the prices.** Use `sum()`.',
          '2. **Find the average.** Use `average()`.',
          '3. **Check for a big price.** Use `any` and `limit`.',
          '4. **Check every price.** Use `all`.',
          '5. **Check for free items.** Use `none`.',
          '6. **Print five lines.** Show all five results.',
        ],
        comments: [
          '// 1. Add up the prices. Use sum().',
          '// 2. Find the average. Use average().',
          '// 3. Check for a big price. Use any and limit.',
          '// 4. Check every price. Use all.',
          '// 5. Check for free items. Use none.',
          '// 6. Print five lines. Show all five results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add up the prices.**',
          '2. **Find the average.**',
          '3. **Check for a big price.**',
          '4. **Check every price.**',
          '5. **Check for free items.**',
          '6. **Print five lines.**',
        ],
        comments: [
          '// 1. Add up the prices.',
          '// 2. Find the average.',
          '// 3. Check for a big price.',
          '// 4. Check every price.',
          '// 5. Check for free items.',
          '// 6. Print five lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BasketStats.kt',
    initialCode: `fun main() {
  val limit = 45
  val prices = listOf(20, 35, 15, 50)

  // 1. Add up the prices. Set total to prices.sum().

  // 2. Find the average. Set average to prices.average().

  // 3. Check for a big price. Set anyBig to prices.any { ... }. It is true when some price is above limit.

  // 4. Check every price. Set allPaid to prices.all { ... }. It is true when every price is at least 10.

  // 5. Check for free items. Set noneFree to prices.none { ... }. It is true when no price is 0.

  // 6. Print five lines. Join the text with +: "Sum: 120" "Average: 30.0" "Any above 45: true" "All at least 10: true" "None free: true"
}`,
    solutionCode: `fun main() {
  val limit = 45
  val prices = listOf(20, 35, 15, 50)
  val total = prices.sum()
  val average = prices.average()
  val anyBig = prices.any { it > limit }
  val allPaid = prices.all { it >= 10 }
  val noneFree = prices.none { it == 0 }
  println("Sum: " + total)
  println("Average: " + average)
  println("Any above $limit: " + anyBig)
  println("All at least 10: " + allPaid)
  println("None free: " + noneFree)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sum: 120\nAverage: 30.0\nAny above 45: true\nAll at least 10: true\nNone free: true',
    testCase: { call: '', expected: 'Sum: 120\nAverage: 30.0\nAny above 45: true\nAll at least 10: true\nNone free: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '45', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Sum: 120\nAverage: 30.0\nAny above 60: false\nAll at least 10: true\nNone free: true',
    },
  },
  {
    id: 'world-10-practice-writerun-class-checks',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Use all, any and none on a list of lists, and add up each inner list.',
    conceptTags: ['lesson:sum-average-any-all-none', 'all', 'any', 'none', 'nested-lists', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Class Checks',
    goal: 'Three classes have lists of marks. Add up each class, then check the marks of all classes together.',
    description: '1. **Add up each class.** Call `classes.map { ... }` and use `it.sum()`. Keep the result in `totals`.\n\n' +
              '2. **Check that all pass.** Set `allPass` to `classes.all { c -> ... }`. Inside, check that `c.all { ... }` marks are at least `passMark`.\n\n' +
              '3. **Look for a top mark.** Set `anyTop` to `classes.any { c -> ... }`. Inside, check that `c.any { ... }` mark is above `90`.\n\n' +
              '4. **Check for empty classes.** Set `noneEmpty` to `classes.none { ... }`. Use `it.isEmpty()`.\n\n' +
              '5. **Print four lines.** Use a string template for the list:\n"Totals: [240, 155, 88]"\n"All pass: true"\n"Any top: true"\n"None empty: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add up each class.** Use `map` and `sum()`.',
          '2. **Check that all pass.** Use `all` inside `all`.',
          '3. **Look for a top mark.** Use `any` inside `any`.',
          '4. **Check for empty classes.** Use `none`.',
          '5. **Print four lines.** Show the totals and the checks.',
        ],
        comments: [
          '// 1. Add up each class. Use map and sum().',
          '// 2. Check that all pass. Use all inside all.',
          '// 3. Look for a top mark. Use any inside any.',
          '// 4. Check for empty classes. Use none.',
          '// 5. Print four lines. Show the totals and the checks.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add up each class.**',
          '2. **Check that all pass.**',
          '3. **Look for a top mark.**',
          '4. **Check for empty classes.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Add up each class.',
          '// 2. Check that all pass.',
          '// 3. Look for a top mark.',
          '// 4. Check for empty classes.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ClassChecks.kt',
    initialCode: `fun main() {
  val passMark = 60
  val classes = listOf(listOf(80, 90, 70), listOf(60, 95), listOf(88))

  // 1. Add up each class. Call classes.map { ... } and use it.sum(). Keep the result in totals.

  // 2. Check that all pass. Set allPass to classes.all { c -> ... }. Inside, check that c.all { ... } marks are at least passMark.

  // 3. Look for a top mark. Set anyTop to classes.any { c -> ... }. Inside, check that c.any { ... } mark is above 90.

  // 4. Check for empty classes. Set noneEmpty to classes.none { ... }. Use it.isEmpty().

  // 5. Print four lines. Use a string template for the list: "Totals: [240, 155, 88]" "All pass: true" "Any top: true" "None empty: true"
}`,
    solutionCode: `fun main() {
  val passMark = 60
  val classes = listOf(listOf(80, 90, 70), listOf(60, 95), listOf(88))
  val totals = classes.map { it.sum() }
  val allPass = classes.all { c -> c.all { it >= passMark } }
  val anyTop = classes.any { c -> c.any { it > 90 } }
  val noneEmpty = classes.none { it.isEmpty() }
  println("Totals: $totals")
  println("All pass: " + allPass)
  println("Any top: " + anyTop)
  println("None empty: " + noneEmpty)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Totals: [240, 155, 88]\nAll pass: true\nAny top: true\nNone empty: true',
    testCase: { call: '', expected: 'Totals: [240, 155, 88]\nAll pass: true\nAny top: true\nNone empty: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'passMark', originalLiteral: '60', alternateLiteral: '65' }],
      alternateExpectedOutput: 'Totals: [240, 155, 88]\nAll pass: false\nAny top: true\nNone empty: true',
    },
  },
  {
    id: 'world-10-practice-writerun-first-hit',
    worldId: 'world-10',
    difficulty: 'medium',
    summary: 'Use first, find and last, and handle the null that find can return.',
    conceptTags: ['lesson:first-find-collection-pipelines-and-chai', 'first', 'find', 'last', 'elvis'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'First Hit',
    goal: 'A list holds temperatures. Find the first one, the first one above a limit, one far above the limit, and the last one.',
    description: '1. **Get the first.** Set `first` to `temps.first()`.\n\n' +
              '2. **Get the first above the limit.** Set `firstAbove` to `temps.first { ... }` with `it > limit`.\n\n' +
              '3. **Look for a far value.** Set `far` to `temps.find { ... }` with `it > limit + 10`. It is `null` when nothing matches.\n\n' +
              '4. **Get the last.** Set `last` to `temps.last()`.\n\n' +
              '5. **Print four lines.** Use `far ?: -1` so a `null` shows as `-1`:\n"First: 18"\n"First above: 31"\n"Far above: -1"\n"Last: 35"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Get the first.** Use `first()`.',
          '2. **Get the first above the limit.** Use `first` with a test.',
          '3. **Look for a far value.** Use `find`. It can be `null`.',
          '4. **Get the last.** Use `last()`.',
          '5. **Print four lines.** Use `?:` for the `null`.',
        ],
        comments: [
          '// 1. Get the first. Use first().',
          '// 2. Get the first above the limit. Use first with a test.',
          '// 3. Look for a far value. Use find. It can be null.',
          '// 4. Get the last. Use last().',
          '// 5. Print four lines. Use ?: for the null.',
        ],
      },
      experienced: {
        steps: [
          '1. **Get the first.**',
          '2. **Get the first above the limit.**',
          '3. **Look for a far value.**',
          '4. **Get the last.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Get the first.',
          '// 2. Get the first above the limit.',
          '// 3. Look for a far value.',
          '// 4. Get the last.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstHit.kt',
    initialCode: `fun main() {
  val limit = 30
  val temps = listOf(18, 25, 31, 22, 35)

  // 1. Get the first. Set first to temps.first().

  // 2. Get the first above the limit. Set firstAbove to temps.first { ... } with it > limit.

  // 3. Look for a far value. Set far to temps.find { ... } with it > limit + 10. It is null when nothing matches.

  // 4. Get the last. Set last to temps.last().

  // 5. Print four lines. Use far ?: -1 so a null shows as -1: "First: 18" "First above: 31" "Far above: -1" "Last: 35"
}`,
    solutionCode: `fun main() {
  val limit = 30
  val temps = listOf(18, 25, 31, 22, 35)
  val first = temps.first()
  val firstAbove = temps.first { it > limit }
  val far = temps.find { it > limit + 10 }
  val last = temps.last()
  println("First: " + first)
  println("First above: " + firstAbove)
  println("Far above: " + (far ?: -1))
  println("Last: " + last)
}`,
    sampleInput: 'main()',
    expectedOutput: 'First: 18\nFirst above: 31\nFar above: -1\nLast: 35',
    testCase: { call: '', expected: 'First: 18\nFirst above: 31\nFar above: -1\nLast: 35' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '30', alternateLiteral: '20' }],
      alternateExpectedOutput: 'First: 18\nFirst above: 25\nFar above: 31\nLast: 35',
    },
  },
  {
    id: 'world-10-practice-writerun-top-orders',
    worldId: 'world-10',
    difficulty: 'hard',
    summary: 'Chain filter, map, sortedDescending, take and sum into one pipeline.',
    conceptTags: ['lesson:first-find-collection-pipelines-and-chai', 'pipeline', 'filter', 'map', 'sortedDescending', 'take', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Top Orders',
    goal: 'A shop has a list of orders. Ignore small orders, take ten percent off the rest, and add up the three biggest.',
    description: '1. **Keep and discount.** Call `orders.filter { ... }` to keep orders of at least `minOrder`. Then call `map { ... }` and subtract `it / 10`. Keep the result in `discounted`.\n\n' +
              '2. **Take the top three.** Call `discounted.sortedDescending()`, then `take(3)`. Keep the result in `top`.\n\n' +
              '3. **Add them up.** Set `total` to `top.sum()`.\n\n' +
              '4. **Print three lines.** Use string templates for the lists:\n"Discounted: [108, 270, 72, 189]"\n"Top: [270, 189, 108]"\n"Total: 567"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Keep and discount.** Chain `filter` and `map`.',
          '2. **Take the top three.** Sort down, then `take(3)`.',
          '3. **Add them up.** Use `sum()`.',
          '4. **Print three lines.** Show both lists and the total.',
        ],
        comments: [
          '// 1. Keep and discount. Chain filter and map.',
          '// 2. Take the top three. Sort down, then take(3).',
          '// 3. Add them up. Use sum().',
          '// 4. Print three lines. Show both lists and the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Keep and discount.**',
          '2. **Take the top three.**',
          '3. **Add them up.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Keep and discount.',
          '// 2. Take the top three.',
          '// 3. Add them up.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TopOrders.kt',
    initialCode: `fun main() {
  val minOrder = 50
  val orders = listOf(120, 45, 300, 80, 210, 15)

  // 1. Keep and discount. Call orders.filter { ... } to keep orders of at least minOrder. Then call map { ... } and subtract it / 10. Keep the result in discounted.

  // 2. Take the top three. Call discounted.sortedDescending(), then take(3). Keep the result in top.

  // 3. Add them up. Set total to top.sum().

  // 4. Print three lines. Use string templates for the lists: "Discounted: [108, 270, 72, 189]" "Top: [270, 189, 108]" "Total: 567"
}`,
    solutionCode: `fun main() {
  val minOrder = 50
  val orders = listOf(120, 45, 300, 80, 210, 15)
  val discounted = orders.filter { it >= minOrder }.map { it - it / 10 }
  val top = discounted.sortedDescending().take(3)
  val total = top.sum()
  println("Discounted: $discounted")
  println("Top: $top")
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Discounted: [108, 270, 72, 189]\nTop: [270, 189, 108]\nTotal: 567',
    testCase: { call: '', expected: 'Discounted: [108, 270, 72, 189]\nTop: [270, 189, 108]\nTotal: 567' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'minOrder', originalLiteral: '50', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Discounted: [270, 189]\nTop: [270, 189]\nTotal: 459',
    },
  },
];

export const WORLD_10_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-10-practice-debug-wrong-tool',
    worldId: 'world-10',
    conceptTags: ['lesson:map-mapnotnull-filter', 'map-vs-filter'],
    summary: 'map gives true and false values instead of keeping the prices.',
    title: 'Fix the Wrong Tool',
    subtitle: 'The program should print "Big: [40, 25]", but it prints "Big: [false, true, false, true]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: map was used where filter is needed',
    brokenCode: `fun main() {
  val prices = listOf(12, 40, 7, 25)
  val big = prices.map { it > 20 }
  println("Big: $big")
}`,
    fixedCode: `fun main() {
  val prices = listOf(12, 40, 7, 25)
  val big = prices.filter { it > 20 }
  println("Big: $big")
}`,
    expectedOutput: 'Big: [40, 25]',
    hints: [
              'Look at the values inside the printed list. Are they prices?',
              '`map` changes every item into the result of the lambda. Here the result is true or false, so the prices are lost.',
              'Use the function that keeps only the items that pass the test.',
            ],
    explanation: '`map` replaces each price with the lambda result, so `prices.map { it > 20 }` gives true and false values. `filter` keeps the prices that pass the test, so `prices.filter { it > 20 }` gives `[40, 25]`.',
  },
  {
    id: 'world-10-practice-debug-null-survivors',
    worldId: 'world-10',
    conceptTags: ['lesson:map-mapnotnull-filter', 'mapNotNull', 'toIntOrNull'],
    summary: 'map keeps the null results from bad text.',
    title: 'Fix the Null Survivors',
    subtitle: 'The program should print "Ages: [12, 30]", but it prints "Ages: [12, null, 30]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: null results stay in the list',
    brokenCode: `fun main() {
  val raw = listOf("12", "x", "30")
  val ages = raw.map { it.toIntOrNull() }
  println("Ages: $ages")
}`,
    fixedCode: `fun main() {
  val raw = listOf("12", "x", "30")
  val ages = raw.mapNotNull { it.toIntOrNull() }
  println("Ages: $ages")
}`,
    expectedOutput: 'Ages: [12, 30]',
    hints: [
              'Find the item in the output that is not a number.',
              '`toIntOrNull()` gives `null` for bad text, and `map` keeps every result, even `null`.',
              'Use the version of `map` that drops the `null` results.',
            ],
    explanation: '`map` keeps every result, so the bad text `"x"` becomes `null` in the list. `mapNotNull` drops the `null` results, so the list is `[12, 30]`.',
  },
  {
    id: 'world-10-practice-debug-negatives-kept',
    worldId: 'world-10',
    conceptTags: ['lesson:filternot-filterisinstance-flatmap', 'filterNot', 'condition'],
    summary: 'The filterNot test is the wrong way round.',
    title: 'Fix the Kept Negatives',
    subtitle: 'The program should print "Valid: [4, 0, 9]", but it prints "Valid: [-3, -8]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: filterNot keeps the wrong values',
    brokenCode: `fun main() {
  val readings = listOf(4, -3, 0, -8, 9)
  val valid = readings.filterNot { it >= 0 }
  println("Valid: $valid")
}`,
    fixedCode: `fun main() {
  val readings = listOf(4, -3, 0, -8, 9)
  val valid = readings.filterNot { it < 0 }
  println("Valid: $valid")
}`,
    expectedOutput: 'Valid: [4, 0, 9]',
    hints: [
              'Compare the printed values with the list. Which values did the program keep?',
              '`filterNot` removes the items that pass the test. The test `it >= 0` is true for the good readings, so they are removed.',
              'Write the test for the values you want to remove, not the ones you want to keep.',
            ],
    explanation: '`filterNot { it >= 0 }` removes every reading that is zero or more, so only the negative readings stay. To remove the negatives, the test must describe them: `it < 0`. Then `[4, 0, 9]` stays.',
  },
  {
    id: 'world-10-practice-debug-nested-parts',
    worldId: 'world-10',
    conceptTags: ['lesson:filternot-filterisinstance-flatmap', 'flatMap', 'nested-list'],
    summary: 'map leaves lists inside a list, so the words are not joined.',
    title: 'Fix the Nested Words',
    subtitle: 'The program should print "Words: [a, b, c]" and "Count: 3", but it prints a list of lists and "Count: 2".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: map leaves lists inside a list',
    brokenCode: `fun main() {
  val phrases = listOf("a b", "c")
  val words = phrases.map { it.split(" ") }
  println("Words: $words")
  println("Count: " + words.size)
}`,
    fixedCode: `fun main() {
  val phrases = listOf("a b", "c")
  val words = phrases.flatMap { it.split(" ") }
  println("Words: $words")
  println("Count: " + words.size)
}`,
    expectedOutput: 'Words: [a, b, c]\nCount: 3',
    hints: [
              'Look at the brackets in the printed list. How many levels are there?',
              '`map` puts one list for each phrase into the result, so the lists stay inside a list.',
              'Use the function that joins all the lists into one list while it maps.',
            ],
    explanation: '`map` turns each phrase into a list of words, so the result is a list of lists with two items. `flatMap` joins those lists into one, so the result is `[a, b, c]` with three items.',
  },
  {
    id: 'world-10-practice-debug-empty-reduce',
    worldId: 'world-10',
    conceptTags: ['lesson:flatten-reduce-fold', 'reduce-vs-fold', 'empty-collection'],
    summary: 'reduce fails on an empty list.',
    title: 'Fix the Empty Total',
    subtitle: 'The program should print "Total: 0" for an empty list, but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: reduce fails on an empty list',
    brokenCode: `fun main() {
  val bonuses = listOf<Int>()
  val total = bonuses.reduce { acc, n -> acc + n }
  println("Total: " + total)
}`,
    fixedCode: `fun main() {
  val bonuses = listOf<Int>()
  val total = bonuses.fold(0) { acc, n -> acc + n }
  println("Total: " + total)
}`,
    expectedOutput: 'Total: 0',
    hints: [
              'Look at the list. How many items does it have?',
              '`reduce` starts with the first item, so an empty list has nothing to start with and throws an error.',
              'Use the version that takes a starting value, so an empty list gives that value.',
            ],
    explanation: '`reduce` uses the first item as the start. An empty list has no first item, so it throws an exception. `fold(0)` starts with `0`, so an empty list gives `0`.',
  },
  {
    id: 'world-10-practice-debug-lost-words',
    worldId: 'world-10',
    conceptTags: ['lesson:groupby-associate-partition', 'associate-vs-groupBy', 'duplicate-keys'],
    summary: 'associate overwrites words that share a length.',
    title: 'Fix the Lost Words',
    subtitle: 'The program should print "Groups: {3=[fig, tea], 4=[kiwi, plum, pear]}", but it prints "Groups: {3=tea, 4=pear}".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: associate overwrites repeated keys',
    brokenCode: `fun main() {
  val words = listOf("fig", "kiwi", "plum", "pear", "tea")
  val groups = words.associate { it.length to it }
  println("Groups: $groups")
}`,
    fixedCode: `fun main() {
  val words = listOf("fig", "kiwi", "plum", "pear", "tea")
  val groups = words.groupBy { it.length }
  println("Groups: $groups")
}`,
    expectedOutput: 'Groups: {3=[fig, tea], 4=[kiwi, plum, pear]}',
    hints: [
              'Count the words in the output. Are they all there?',
              '`associate` makes one entry for each key. When two words have the same key, the later word replaces the earlier one.',
              'Use the function that collects all the items with the same key into a list.',
            ],
    explanation: '`associate` builds a map with one value per key, so a repeated length overwrites the earlier word. `groupBy` keeps every word with the same length in a list, so nothing is lost.',
  },
  {
    id: 'world-10-practice-debug-window-vs-chunk',
    worldId: 'world-10',
    conceptTags: ['lesson:zip-chunked-windowed', 'windowed-vs-chunked'],
    summary: 'chunked misses the overlapping neighbour pairs.',
    title: 'Fix the Missing Changes',
    subtitle: 'The program should print "Changes: [4, -2, 8]", but it prints "Changes: [4, 8]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: chunked skips the overlapping pairs',
    brokenCode: `fun main() {
  val temps = listOf(10, 14, 12, 20)
  val pairs = temps.chunked(2)
  val diffs = pairs.map { it[1] - it[0] }
  println("Changes: $diffs")
}`,
    fixedCode: `fun main() {
  val temps = listOf(10, 14, 12, 20)
  val pairs = temps.windowed(2)
  val diffs = pairs.map { it[1] - it[0] }
  println("Changes: $diffs")
}`,
    expectedOutput: 'Changes: [4, -2, 8]',
    hints: [
              'Count the changes. The list has four temperatures, so how many neighbour pairs are there?',
              '`chunked(2)` cuts the list into separate pairs. The pair `14, 12` is never made.',
              'Use the function that makes overlapping groups, so every neighbour pair appears.',
            ],
    explanation: '`chunked(2)` gives `[10, 14]` and `[12, 20]`, so the change from `14` to `12` is missed. `windowed(2)` slides by one item, so it also gives `[14, 12]`, and the changes are `4`, `-2` and `8`.',
  },
  {
    id: 'world-10-practice-debug-sorted-ignored',
    worldId: 'world-10',
    conceptTags: ['lesson:distinct-sorted', 'sorted-vs-sort', 'new-list'],
    summary: 'sorted returns a new list, and the result is not used.',
    title: 'Fix the Ignored Sort',
    subtitle: 'The program should print "Scores: [10, 20, 30]", but it prints "Scores: [30, 10, 20]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: sorted returns a new list',
    brokenCode: `fun main() {
  val scores = mutableListOf(30, 10, 20)
  scores.sorted()
  println("Scores: $scores")
}`,
    fixedCode: `fun main() {
  val scores = mutableListOf(30, 10, 20)
  scores.sort()
  println("Scores: $scores")
}`,
    expectedOutput: 'Scores: [10, 20, 30]',
    hints: [
              'Look at the order in the output. Did the sort change `scores`?',
              '`sorted()` does not change the list. It returns a new sorted list, and here the result is thrown away.',
              'Use the function that sorts the same list in place.',
            ],
    explanation: '`sorted()` returns a new list and leaves `scores` as it was. The result is not used, so nothing changes. `sort()` sorts the mutable list itself, so printing `scores` shows `[10, 20, 30]`.',
  },
  {
    id: 'world-10-practice-debug-name-not-price',
    worldId: 'world-10',
    conceptTags: ['lesson:sortedby-min-max', 'maxByOrNull', 'selector'],
    summary: 'maxByOrNull compares names instead of prices.',
    title: 'Fix the Priciest Item',
    subtitle: 'The program should print "Priciest: book", but it prints "Priciest: pen".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the selector uses the wrong property',
    brokenCode: `class Item(val name: String, val price: Int)

fun main() {
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8))
  val priciest = items.maxByOrNull { it.name }
  println("Priciest: " + (priciest?.name ?: "none"))
}`,
    fixedCode: `class Item(val name: String, val price: Int)

fun main() {
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8))
  val priciest = items.maxByOrNull { it.price }
  println("Priciest: " + (priciest?.name ?: "none"))
}`,
    expectedOutput: 'Priciest: book',
    hints: [
              'Look at which item the program chose. Is it the most expensive?',
              '`maxByOrNull` compares the values the lambda returns. Here the lambda returns the name.',
              'Change the lambda so it returns the property you want to compare.',
            ],
    explanation: 'The lambda `{ it.name }` makes `maxByOrNull` compare names, and "pen" comes last in alphabetical order. Comparing `it.price` picks the item with the biggest price, which is "book".',
  },
  {
    id: 'world-10-practice-debug-empty-all',
    worldId: 'world-10',
    conceptTags: ['lesson:sum-average-any-all-none', 'all-on-empty', 'isNotEmpty'],
    summary: 'all is true for an empty list, so an empty class passes.',
    title: 'Fix the Empty Class',
    subtitle: 'The program should print "Everyone passed: false" for an empty class, but it prints "Everyone passed: true".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: all is true for an empty list',
    brokenCode: `fun main() {
  val marks = listOf<Int>()
  val everyonePassed = marks.all { it >= 50 }
  println("Everyone passed: " + everyonePassed)
}`,
    fixedCode: `fun main() {
  val marks = listOf<Int>()
  val everyonePassed = marks.isNotEmpty() && marks.all { it >= 50 }
  println("Everyone passed: " + everyonePassed)
}`,
    expectedOutput: 'Everyone passed: false',
    hints: [
              'Look at the list. How many marks does it have?',
              '`all` is true when no item fails the test. An empty list has no item that can fail.',
              'Also check that the list has marks, before you trust `all`.',
            ],
    explanation: 'For an empty list, `all` is always `true`, because there is no mark that fails. An empty class should not count as passed, so the program must also check `isNotEmpty()`. Now the answer is `false`.',
  },
  {
    id: 'world-10-practice-debug-find-null',
    worldId: 'world-10',
    conceptTags: ['lesson:first-find-collection-pipelines-and-chai', 'find', 'nullable-result', 'elvis'],
    summary: 'find returns null when nothing matches, and the output shows null.',
    title: 'Fix the Missing Match',
    subtitle: 'The program should print "Hot: none" when no temperature is above 99, but it prints "Hot: null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: find returns null when nothing matches',
    brokenCode: `fun main() {
  val temps = listOf(18, 25, 31)
  val hot = temps.find { it > 99 }
  println("Hot: " + hot)
}`,
    fixedCode: `fun main() {
  val temps = listOf(18, 25, 31)
  val hot = temps.find { it > 99 }
  println("Hot: " + (hot ?: "none"))
}`,
    expectedOutput: 'Hot: none',
    hints: [
              'Look at the word `null` in the output. Where does it come from?',
              '`find` returns `null` when no item matches, and printing `null` shows the word null.',
              'Give the `null` case a friendly default value before you print.',
            ],
    explanation: '`find` returns `null` when no item matches, so `"Hot: " + hot` prints `Hot: null`. With `hot ?: "none"`, the `null` case becomes the text `none`, so the program prints `Hot: none`.',
  },
  {
    id: 'world-10-practice-debug-take-first',
    worldId: 'world-10',
    conceptTags: ['lesson:first-find-collection-pipelines-and-chai', 'pipeline-order', 'take', 'sortedDescending'],
    summary: 'take runs before the sort, so the top scores are lost.',
    title: 'Fix the Pipeline Order',
    subtitle: 'The program should print "Top: [100, 90]", but it prints "Top: [90, 40]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: take runs before the sort',
    brokenCode: `fun main() {
  val scores = listOf(40, 90, 70, 100, 20)
  val top = scores.take(2).sortedDescending()
  println("Top: $top")
}`,
    fixedCode: `fun main() {
  val scores = listOf(40, 90, 70, 100, 20)
  val top = scores.sortedDescending().take(2)
  println("Top: $top")
}`,
    expectedOutput: 'Top: [100, 90]',
    hints: [
              'Trace the steps by hand. Which scores are left after the first step?',
              '`take(2)` runs first, so only `40` and `90` are left. The biggest scores are cut away before the sort.',
              'Change the order of the two steps: sort first, then cut.',
            ],
    explanation: '`scores.take(2)` keeps the first two scores, `40` and `90`, and then the sort only orders those two. Sorting first with `sortedDescending()` and then taking two gives `[100, 90]`.',
  },
];
