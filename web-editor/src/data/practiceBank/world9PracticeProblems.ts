import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 9 -- Lambda Lab (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the lambda feature (function type, trailing lambda, reference, label, modifier ...) is named in the step.
//   hard   -- state captured by a lambda, a function that returns a function, nested lambdas, a return that leaves the outer function,
//             or a modifier rule (inline, noinline, crossinline) that changes the output; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world9.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world9.real.ts). Debug tasks that must not compile rely on the
// lambda and inline checks in src/utils/kotlinFunctions.ts (plain return in a lambda, arity, unresolved it, inline parameter rules).

export const WORLD_9_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-9-practice-writerun-tax-and-shipping',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write two small lambdas, one for tax and one for shipping, and print the two prices.',
    conceptTags: ['lesson:lambda-expressions', 'one-parameter-lambda', 'two-parameter-lambda', 'lambda-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Tax and Shipping',
    goal: 'A shop adds tax to a price, then adds a shipping fee. Work out the price after tax and the final total. Print both.',
    description: '1. **Write the tax lambda.** Create `val withTax` as a lambda with one `Int` parameter, `price`. It returns `price` plus one tenth of `price` (use `price / 10`).\n\n' +
              '2. **Write the shipping lambda.** Create `val withShipping` as a lambda with two `Int` parameters, `price` and `kg`. It returns `price` plus `kg * 3`.\n\n' +
              '3. **Work out both prices.** Call `withTax(basePrice)` and keep the result in `taxed`. Then call `withShipping(taxed, kilos)` and keep the result in `total`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Taxed: 88"\n"Total: 100"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the tax lambda.** Add one tenth to `price`.',
          '2. **Write the shipping lambda.** Add `kg * 3` to `price`.',
          '3. **Work out both prices.** Tax first, then shipping.',
          '4. **Print two lines.** Show the taxed price and the total.',
        ],
        comments: [
          '// 1. Write the tax lambda. Add one tenth to price.',
          '// 2. Write the shipping lambda. Add kg * 3 to price.',
          '// 3. Work out both prices. Tax first, then shipping.',
          '// 4. Print two lines. Show the taxed price and the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the tax lambda.**',
          '2. **Write the shipping lambda.**',
          '3. **Work out both prices.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the tax lambda.',
          '// 2. Write the shipping lambda.',
          '// 3. Work out both prices.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TaxAndShipping.kt',
    initialCode: `fun main() {
  val basePrice = 80
  val kilos = 4

  // 1. Write the tax lambda. Create val withTax as a lambda with one Int parameter, price. It returns price plus one tenth of price (use price / 10).

  // 2. Write the shipping lambda. Create val withShipping as a lambda with two Int parameters, price and kg. It returns price plus kg * 3.

  // 3. Work out both prices. Call withTax(basePrice) and keep the result in taxed. Then call withShipping(taxed, kilos) and keep the result in total.

  // 4. Print two lines. Join the text with +: "Taxed: 88" "Total: 100"
}`,
    solutionCode: `fun main() {
  val basePrice = 80
  val kilos = 4
  val withTax = { price: Int -> price + price / 10 }
  val withShipping = { price: Int, kg: Int -> price + kg * 3 }
  val taxed = withTax(basePrice)
  val total = withShipping(taxed, kilos)
  println("Taxed: " + taxed)
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Taxed: 88\nTotal: 100',
    testCase: { call: '', expected: 'Taxed: 88\nTotal: 100' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'basePrice', originalLiteral: '80', alternateLiteral: '50' }],
      alternateExpectedOutput: 'Taxed: 55\nTotal: 67',
    },
  },
  {
    id: 'world-9-practice-writerun-click-counter',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write a lambda that changes a variable outside it, call it in a loop, then reset the variable.',
    conceptTags: ['lesson:lambda-expressions', 'closure', 'captured-state', 'last-expression'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Click Counter',
    goal: 'A button counts its clicks. Click it several times and show the count. Then reset the count and show it again.',
    description: '1. **Write the click lambda.** Create `val onClick` as a lambda with no parameters. Inside, add `1` to `clicks`. Make the last line `clicks`, so the lambda returns the new count.\n\n' +
              '2. **Click the button.** Use a `for` loop from `1` to `limit`. Each time, call `onClick()` and keep the result in `last`.\n\n' +
              '3. **Write the reset lambda.** Create `val reset` as a lambda that sets `clicks` to `0`.\n\n' +
              '4. **Print two lines.** Show `last` and `clicks`:\n"Last: 3"\n"Clicks: 3"\n\n' +
              '5. **Reset and print.** Call `reset()`, then print `clicks`:\n"After reset: 0"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the click lambda.** Add `1` to `clicks` and return it.',
          '2. **Click the button.** Loop `limit` times and keep the last result.',
          '3. **Write the reset lambda.** Set `clicks` back to `0`.',
          '4. **Print two lines.** Show `last` and `clicks`.',
          '5. **Reset and print.** Call `reset()` and print `clicks`.',
        ],
        comments: [
          '// 1. Write the click lambda. Add 1 to clicks and return it.',
          '// 2. Click the button. Loop limit times and keep the last result.',
          '// 3. Write the reset lambda. Set clicks back to 0.',
          '// 4. Print two lines. Show last and clicks.',
          '// 5. Reset and print. Call reset() and print clicks.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the click lambda.**',
          '2. **Click the button.**',
          '3. **Write the reset lambda.**',
          '4. **Print two lines.**',
          '5. **Reset and print.**',
        ],
        comments: [
          '// 1. Write the click lambda.',
          '// 2. Click the button.',
          '// 3. Write the reset lambda.',
          '// 4. Print two lines.',
          '// 5. Reset and print.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ClickCounter.kt',
    initialCode: `fun main() {
  var clicks = 0
  val limit = 3
  var last = 0

  // 1. Write the click lambda. Create val onClick as a lambda with no parameters. Inside, add 1 to clicks. Make the last line clicks, so the lambda returns the new count.

  // 2. Click the button. Use a for loop from 1 to limit. Each time, call onClick() and keep the result in last.

  // 3. Write the reset lambda. Create val reset as a lambda that sets clicks to 0.

  // 4. Print two lines. Show last and clicks: "Last: 3" "Clicks: 3"

  // 5. Reset and print. Call reset(), then print clicks: "After reset: 0"
}`,
    solutionCode: `fun main() {
  var clicks = 0
  val limit = 3
  var last = 0
  val onClick = {
    clicks = clicks + 1
    clicks
  }
  for (i in 1..limit) {
    last = onClick()
  }
  val reset = { clicks = 0 }
  println("Last: " + last)
  println("Clicks: " + clicks)
  reset()
  println("After reset: " + clicks)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Last: 3\nClicks: 3\nAfter reset: 0',
    testCase: { call: '', expected: 'Last: 3\nClicks: 3\nAfter reset: 0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Last: 5\nClicks: 5\nAfter reset: 0',
    },
  },
  {
    id: 'world-9-practice-writerun-grade-label',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write an anonymous function that returns Pass or Fail, then test it on three scores.',
    conceptTags: ['lesson:anonymous-functions', 'anonymous-function', 'return-in-anonymous-function', 'closure'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Grade Label',
    goal: 'Give each score a label: Pass or Fail. Check three scores and print each score with its label.',
    description: '1. **Write the anonymous function.** Create `val grade = fun(score: Int): String { ... }`. Inside, use `if` to `return "Pass"` when `score` is at least `passMark`. After the `if`, `return "Fail"`.\n\n' +
              '2. **Test three scores.** Call `grade` with `72`, `41` and `50`. Keep the results in `high`, `low` and `edge`.\n\n' +
              '3. **Print three lines.** Join each score and its label with `+`:\n"72: Pass"\n"41: Fail"\n"50: Pass"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the anonymous function.** Use `fun(score: Int): String` and `return`.',
          '2. **Test three scores.** Use `72`, `41` and `50`.',
          '3. **Print three lines.** Show each score and its label.',
        ],
        comments: [
          '// 1. Write the anonymous function. Use fun(score: Int): String and return.',
          '// 2. Test three scores. Use 72, 41 and 50.',
          '// 3. Print three lines. Show each score and its label.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the anonymous function.**',
          '2. **Test three scores.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the anonymous function.',
          '// 2. Test three scores.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GradeLabel.kt',
    initialCode: `fun main() {
  val passMark = 50

  // 1. Write the anonymous function. Create val grade = fun(score: Int): String { ... }. Inside, use if to return "Pass" when score is at least passMark. After the if, return "Fail".

  // 2. Test three scores. Call grade with 72, 41 and 50. Keep the results in high, low and edge.

  // 3. Print three lines. Join each score and its label with +: "72: Pass" "41: Fail" "50: Pass"
}`,
    solutionCode: `fun main() {
  val passMark = 50
  val grade = fun(score: Int): String {
    if (score >= passMark) {
      return "Pass"
    }
    return "Fail"
  }
  val high = grade(72)
  val low = grade(41)
  val edge = grade(50)
  println("72: " + high)
  println("41: " + low)
  println("50: " + edge)
}`,
    sampleInput: 'main()',
    expectedOutput: '72: Pass\n41: Fail\n50: Pass',
    testCase: { call: '', expected: '72: Pass\n41: Fail\n50: Pass' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'passMark', originalLiteral: '50', alternateLiteral: '70' }],
      alternateExpectedOutput: '72: Pass\n41: Fail\n50: Fail',
    },
  },
  {
    id: 'world-9-practice-writerun-big-numbers',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Use an anonymous function to keep the numbers above a limit, then count and add them.',
    conceptTags: ['lesson:anonymous-functions', 'anonymous-function-argument', 'filter', 'captured-value'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Big Numbers',
    goal: 'A list has six numbers. Keep only the numbers above a limit. Then count them, add them up and print the results.',
    description: '1. **Keep the big numbers.** Call `numbers.filter(...)` and give it an anonymous function: `fun(n: Int): Boolean`. It returns `true` when `n` is bigger than `limit`. Keep the result in `big`.\n\n' +
              '2. **Add them up.** Create `var sum = 0`. Loop over `big` and add each `n` to `sum`.\n\n' +
              '3. **Print three lines.** Use a string template to show the list. The count is `big.size`:\n"Big: [15, 21, 12]"\n"Count: 3"\n"Sum: 48"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Keep the big numbers.** Pass `fun(n: Int): Boolean` to `filter`.',
          '2. **Add them up.** Loop over `big` and keep a total.',
          '3. **Print three lines.** Show the list, its size and the sum.',
        ],
        comments: [
          '// 1. Keep the big numbers. Pass fun(n: Int): Boolean to filter.',
          '// 2. Add them up. Loop over big and keep a total.',
          '// 3. Print three lines. Show the list, its size and the sum.',
        ],
      },
      experienced: {
        steps: [
          '1. **Keep the big numbers.**',
          '2. **Add them up.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Keep the big numbers.',
          '// 2. Add them up.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BigNumbers.kt',
    initialCode: `fun main() {
  val limit = 10
  val numbers = listOf(4, 15, 8, 21, 12, 7)

  // 1. Keep the big numbers. Call numbers.filter(...) and give it an anonymous function: fun(n: Int): Boolean. It returns true when n is bigger than limit. Keep the result in big.

  // 2. Add them up. Create var sum = 0. Loop over big and add each n to sum.

  // 3. Print three lines. Use a string template to show the list. The count is big.size: "Big: [15, 21, 12]" "Count: 3" "Sum: 48"
}`,
    solutionCode: `fun main() {
  val limit = 10
  val numbers = listOf(4, 15, 8, 21, 12, 7)
  val big = numbers.filter(fun(n: Int): Boolean {
    return n > limit
  })
  var sum = 0
  for (n in big) {
    sum += n
  }
  println("Big: $big")
  println("Count: " + big.size)
  println("Sum: " + sum)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Big: [15, 21, 12]\nCount: 3\nSum: 48',
    testCase: { call: '', expected: 'Big: [15, 21, 12]\nCount: 3\nSum: 48' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '10', alternateLiteral: '14' }],
      alternateExpectedOutput: 'Big: [15, 21]\nCount: 2\nSum: 36',
    },
  },
  {
    id: 'world-9-practice-writerun-time-split',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write three lambdas with explicit function types to turn minutes into hours and minutes.',
    conceptTags: ['lesson:function-types', 'explicit-function-type', 'multi-parameter-function-type', 'function-as-argument'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Time Split',
    goal: 'Turn a number of minutes into hours and minutes. Print the hours, and the time as text.',
    description: '1. **Write the hours function.** Create `val toHours: (Int) -> Int` as a lambda that divides `m` by `60`.\n\n' +
              '2. **Write the leftover function.** Create `val leftOver: (Int) -> Int` as a lambda that returns `m % 60`.\n\n' +
              '3. **Write the label function.** Create `val label: (Int, Int) -> String` as a lambda with `h` and `m`. It joins them as `h.toString() + "h " + m + "m"`.\n\n' +
              '4. **Print two lines.** Use `toHours(minutes)` for the hours. Use `label` with the hours and the leftover minutes:\n"Hours: 2"\n"Time: 2h 15m"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the hours function.** Divide the minutes by `60`.',
          '2. **Write the leftover function.** Use `%`.',
          '3. **Write the label function.** Join hours and minutes into text.',
          '4. **Print two lines.** Show the hours and the label.',
        ],
        comments: [
          '// 1. Write the hours function. Divide the minutes by 60.',
          '// 2. Write the leftover function. Use %.',
          '// 3. Write the label function. Join hours and minutes into text.',
          '// 4. Print two lines. Show the hours and the label.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the hours function.**',
          '2. **Write the leftover function.**',
          '3. **Write the label function.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the hours function.',
          '// 2. Write the leftover function.',
          '// 3. Write the label function.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TimeSplit.kt',
    initialCode: `fun main() {
  val minutes = 135

  // 1. Write the hours function. Create val toHours: (Int) -> Int as a lambda that divides m by 60.

  // 2. Write the leftover function. Create val leftOver: (Int) -> Int as a lambda that returns m % 60.

  // 3. Write the label function. Create val label: (Int, Int) -> String as a lambda with h and m. It joins them as h.toString() + "h " + m + "m".

  // 4. Print two lines. Use toHours(minutes) for the hours. Use label with the hours and the leftover minutes: "Hours: 2" "Time: 2h 15m"
}`,
    solutionCode: `fun main() {
  val minutes = 135
  val toHours: (Int) -> Int = { m -> m / 60 }
  val leftOver: (Int) -> Int = { m -> m % 60 }
  val label: (Int, Int) -> String = { h, m -> h.toString() + "h " + m + "m" }
  println("Hours: " + toHours(minutes))
  println("Time: " + label(toHours(minutes), leftOver(minutes)))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Hours: 2\nTime: 2h 15m',
    testCase: { call: '', expected: 'Hours: 2\nTime: 2h 15m' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'minutes', originalLiteral: '135', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Hours: 3\nTime: 3h 20m',
    },
  },
  {
    id: 'world-9-practice-writerun-op-switch',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Change what a function variable does, and call a function that may be null.',
    conceptTags: ['lesson:function-types', 'function-variable-reassignment', 'nullable-function-type', 'safe-invoke'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Operation Switch',
    goal: 'A calculator can add, then multiply. It may also have an optional bonus step. Print each result, with and without the bonus.',
    description: '1. **Add the numbers.** Create `var op: (Int, Int) -> Int` as a lambda that adds `x` and `y`. Call `op(a, b)` and keep the result in `first`.\n\n' +
              '2. **Switch to multiply.** Set `op` to a lambda that multiplies `x` and `y`. Call `op(a, b)` again and keep the result in `second`.\n\n' +
              '3. **Try the bonus when it is null.** Create `var bonus: ((Int) -> Int)? = null`. Set `plain` to `bonus?.invoke(second) ?: second`.\n\n' +
              '4. **Set the bonus.** Set `bonus` to a lambda that adds `10` to `n`. Set `boosted` the same way as `plain`.\n\n' +
              '5. **Print four lines.** Use `first`, `second`, `plain` and `boosted`:\n"Add: 17"\n"Multiply: 60"\n"No bonus: 60"\n"With bonus: 70"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the numbers.** Store an adding lambda in `op` and call it.',
          '2. **Switch to multiply.** Give `op` a new lambda and call it again.',
          '3. **Try the bonus when it is null.** Use `?.invoke` and `?:`.',
          '4. **Set the bonus.** Add `10`, then compute `boosted`.',
          '5. **Print four lines.** Show all four results.',
        ],
        comments: [
          '// 1. Add the numbers. Store an adding lambda in op and call it.',
          '// 2. Switch to multiply. Give op a new lambda and call it again.',
          '// 3. Try the bonus when it is null. Use ?.invoke and ?:.',
          '// 4. Set the bonus. Add 10, then compute boosted.',
          '// 5. Print four lines. Show all four results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the numbers.**',
          '2. **Switch to multiply.**',
          '3. **Try the bonus when it is null.**',
          '4. **Set the bonus.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Add the numbers.',
          '// 2. Switch to multiply.',
          '// 3. Try the bonus when it is null.',
          '// 4. Set the bonus.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OpSwitch.kt',
    initialCode: `fun main() {
  val a = 12
  val b = 5

  // 1. Add the numbers. Create var op: (Int, Int) -> Int as a lambda that adds x and y. Call op(a, b) and keep the result in first.

  // 2. Switch to multiply. Set op to a lambda that multiplies x and y. Call op(a, b) again and keep the result in second.

  // 3. Try the bonus when it is null. Create var bonus: ((Int) -> Int)? = null. Set plain to bonus?.invoke(second) ?: second.

  // 4. Set the bonus. Set bonus to a lambda that adds 10 to n. Set boosted the same way as plain.

  // 5. Print four lines. Use first, second, plain and boosted: "Add: 17" "Multiply: 60" "No bonus: 60" "With bonus: 70"
}`,
    solutionCode: `fun main() {
  val a = 12
  val b = 5
  var op: (Int, Int) -> Int = { x, y -> x + y }
  val first = op(a, b)
  op = { x, y -> x * y }
  val second = op(a, b)
  var bonus: ((Int) -> Int)? = null
  val plain = bonus?.invoke(second) ?: second
  bonus = { n -> n + 10 }
  val boosted = bonus?.invoke(second) ?: second
  println("Add: " + first)
  println("Multiply: " + second)
  println("No bonus: " + plain)
  println("With bonus: " + boosted)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Add: 17\nMultiply: 60\nNo bonus: 60\nWith bonus: 70',
    testCase: { call: '', expected: 'Add: 17\nMultiply: 60\nNo bonus: 60\nWith bonus: 70' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'a', originalLiteral: '12', alternateLiteral: '9' }],
      alternateExpectedOutput: 'Add: 14\nMultiply: 45\nNo bonus: 45\nWith bonus: 55',
    },
  },
  {
    id: 'world-9-practice-writerun-apply-twice',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write a function that takes a function and calls it twice. Use it with two different lambdas.',
    conceptTags: ['lesson:higher-order-functions', 'function-parameter', 'trailing-lambda', 'calling-a-parameter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Apply Twice',
    goal: 'Write a function that runs a step on a number two times in a row. Use it to double a number twice and to add 7 twice.',
    description: '1. **Write the function.** Above `main`, write `applyTwice(start: Int, step: (Int) -> Int): Int`. Call `step(start)` and keep the result in `once`. Then return `step(once)`.\n\n' +
              '2. **Use it twice.** Call `applyTwice(seed)` with a trailing lambda `{ n -> n * 2 }` and keep the result in `doubled`. Then call it with `{ n -> n + 7 }` and keep the result in `shifted`.\n\n' +
              '3. **Print two lines.** Join the text with `+`:\n"Doubled twice: 12"\n"Shifted twice: 17"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Take a function parameter and call it two times.',
          '2. **Use it twice.** Pass a doubling lambda, then an add-7 lambda.',
          '3. **Print two lines.** Show both results.',
        ],
        comments: [
          '// 1. Write the function. Take a function parameter and call it two times.',
          '// 2. Use it twice. Pass a doubling lambda, then an add-7 lambda.',
          '// 3. Print two lines. Show both results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Use it twice.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Use it twice.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ApplyTwice.kt',
    initialCode: `// 1. Write the function. Above main, write applyTwice(start: Int, step: (Int) -> Int): Int. Call step(start) and keep the result in once. Then return step(once).

fun main() {
  val seed = 3

  // 2. Use it twice. Call applyTwice(seed) with a trailing lambda { n -> n * 2 } and keep the result in doubled. Then call it with { n -> n + 7 } and keep the result in shifted.

  // 3. Print two lines. Join the text with +: "Doubled twice: 12" "Shifted twice: 17"
}`,
    solutionCode: `fun applyTwice(start: Int, step: (Int) -> Int): Int {
  val once = step(start)
  return step(once)
}

fun main() {
  val seed = 3
  val doubled = applyTwice(seed) { n -> n * 2 }
  val shifted = applyTwice(seed) { n -> n + 7 }
  println("Doubled twice: " + doubled)
  println("Shifted twice: " + shifted)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Doubled twice: 12\nShifted twice: 17',
    testCase: { call: '', expected: 'Doubled twice: 12\nShifted twice: 17' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'seed', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Doubled twice: 20\nShifted twice: 19',
    },
  },
  {
    id: 'world-9-practice-writerun-fee-factory',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write a function that builds and returns a fee lambda, then use two fees.',
    conceptTags: ['lesson:higher-order-functions', 'returning-a-function', 'closure', 'integer-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Fee Factory',
    goal: 'A bank charges fees as a percent of a payment. Build a fee calculator for each percent. Print the fees for two payments.',
    description: '1. **Write the function.** Above `main`, write `makeFee(percent: Int): (Int) -> Int`. It returns a lambda that gives `amount * percent / 100`.\n\n' +
              '2. **Make two calculators.** Create `val standard` with `makeFee(2)` and `val premium` with `makeFee(5)`.\n\n' +
              '3. **Print three lines.** Call the calculators like functions:\n"Standard on 1500: 30"\n"Premium on 1500: 75"\n"Premium on 240: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Return a lambda that uses `percent`.',
          '2. **Make two calculators.** Use `2` and `5`.',
          '3. **Print three lines.** Use `payment` and `small`.',
        ],
        comments: [
          '// 1. Write the function. Return a lambda that uses percent.',
          '// 2. Make two calculators. Use 2 and 5.',
          '// 3. Print three lines. Use payment and small.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Make two calculators.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Make two calculators.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FeeFactory.kt',
    initialCode: `// 1. Write the function. Above main, write makeFee(percent: Int): (Int) -> Int. It returns a lambda that gives amount * percent / 100.

fun main() {
  val payment = 1500
  val small = 240

  // 2. Make two calculators. Create val standard with makeFee(2) and val premium with makeFee(5).

  // 3. Print three lines. Call the calculators like functions: "Standard on 1500: 30" "Premium on 1500: 75" "Premium on 240: 12"
}`,
    solutionCode: `fun makeFee(percent: Int): (Int) -> Int {
  return { amount -> amount * percent / 100 }
}

fun main() {
  val payment = 1500
  val small = 240
  val standard = makeFee(2)
  val premium = makeFee(5)
  println("Standard on " + payment + ": " + standard(payment))
  println("Premium on " + payment + ": " + premium(payment))
  println("Premium on " + small + ": " + premium(small))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Standard on 1500: 30\nPremium on 1500: 75\nPremium on 240: 12',
    testCase: { call: '', expected: 'Standard on 1500: 30\nPremium on 1500: 75\nPremium on 240: 12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'payment', originalLiteral: '1500', alternateLiteral: '900' }],
      alternateExpectedOutput: 'Standard on 900: 18\nPremium on 900: 45\nPremium on 240: 12',
    },
  },
  {
    id: 'world-9-practice-writerun-repeat-action',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write a function that calls a Unit function many times. Use it to build a log and a total.',
    conceptTags: ['lesson:higher-order-functions', 'unit-callback', 'captured-state', 'trailing-lambda'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Repeat Action',
    goal: 'Run an action for each round. Keep a log of the round numbers and a total of their squares. Print both.',
    description: '1. **Write the function.** Above `main`, write `repeatAction(times: Int, action: (Int) -> Unit)`. Use a `for` loop from `1` to `times`. Each time, call `action(i)`.\n\n' +
              '2. **Run the rounds.** Call `repeatAction(rounds)` with a trailing lambda `{ i -> ... }`. Inside, add `i` and a space to `log`. Add `i * i` to `total`.\n\n' +
              '3. **Print two lines.** Remove the last space with `log.trim()`:\n"Log: 1 2 3 4"\n"Total: 30"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Loop from `1` to `times` and call `action`.',
          '2. **Run the rounds.** Build `log` and `total` inside the lambda.',
          '3. **Print two lines.** Trim the log.',
        ],
        comments: [
          '// 1. Write the function. Loop from 1 to times and call action.',
          '// 2. Run the rounds. Build log and total inside the lambda.',
          '// 3. Print two lines. Trim the log.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Run the rounds.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Run the rounds.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RepeatAction.kt',
    initialCode: `// 1. Write the function. Above main, write repeatAction(times: Int, action: (Int) -> Unit). Use a for loop from 1 to times. Each time, call action(i).

fun main() {
  val rounds = 4
  var log = ""
  var total = 0

  // 2. Run the rounds. Call repeatAction(rounds) with a trailing lambda { i -> ... }. Inside, add i and a space to log. Add i * i to total.

  // 3. Print two lines. Remove the last space with log.trim(): "Log: 1 2 3 4" "Total: 30"
}`,
    solutionCode: `fun repeatAction(times: Int, action: (Int) -> Unit) {
  for (i in 1..times) {
    action(i)
  }
}

fun main() {
  val rounds = 4
  var log = ""
  var total = 0
  repeatAction(rounds) { i ->
    log = log + i + " "
    total += i * i
  }
  println("Log: " + log.trim())
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Log: 1 2 3 4\nTotal: 30',
    testCase: { call: '', expected: 'Log: 1 2 3 4\nTotal: 30' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'rounds', originalLiteral: '4', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Log: 1 2 3\nTotal: 14',
    },
  },
  {
    id: 'world-9-practice-writerun-price-tags',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Use it to take one fifth off every price, then keep the cheap prices.',
    conceptTags: ['lesson:it', 'implicit-parameter', 'map', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Price Tags',
    goal: 'A shop gives a 20 percent discount on four prices. Print the new prices. Then print only the cheap ones.',
    description: '1. **Discount every price.** Call `prices.map { ... }`. Use `it` and subtract `it / 5`. Keep the result in `discounted`.\n\n' +
              '2. **Keep the cheap prices.** Call `discounted.filter { ... }`. Keep the prices below `limit`, and use `it` again. Keep the result in `cheap`.\n\n' +
              '3. **Print two lines.** Use string templates to show the lists:\n"Discounted: [32, 12, 72, 20]"\n"Cheap: [12, 20]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Discount every price.** Use `map` and `it`.',
          '2. **Keep the cheap prices.** Use `filter` and `it`.',
          '3. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Discount every price. Use map and it.',
          '// 2. Keep the cheap prices. Use filter and it.',
          '// 3. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Discount every price.**',
          '2. **Keep the cheap prices.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Discount every price.',
          '// 2. Keep the cheap prices.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PriceTags.kt',
    initialCode: `fun main() {
  val limit = 30
  val prices = listOf(40, 15, 90, 25)

  // 1. Discount every price. Call prices.map { ... }. Use it and subtract it / 5. Keep the result in discounted.

  // 2. Keep the cheap prices. Call discounted.filter { ... }. Keep the prices below limit, and use it again. Keep the result in cheap.

  // 3. Print two lines. Use string templates to show the lists: "Discounted: [32, 12, 72, 20]" "Cheap: [12, 20]"
}`,
    solutionCode: `fun main() {
  val limit = 30
  val prices = listOf(40, 15, 90, 25)
  val discounted = prices.map { it - it / 5 }
  val cheap = discounted.filter { it < limit }
  println("Discounted: $discounted")
  println("Cheap: $cheap")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Discounted: [32, 12, 72, 20]\nCheap: [12, 20]',
    testCase: { call: '', expected: 'Discounted: [32, 12, 72, 20]\nCheap: [12, 20]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '30', alternateLiteral: '50' }],
      alternateExpectedOutput: 'Discounted: [32, 12, 72, 20]\nCheap: [32, 12, 20]',
    },
  },
  {
    id: 'world-9-practice-writerun-row-counts',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Put a lambda inside a lambda. Name the outer parameter so it does not clash with it.',
    conceptTags: ['lesson:it', 'nested-lambdas', 'named-outer-parameter', 'filter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Row Counts',
    goal: 'Each row number multiplies each column number. For each row, count how many results are bigger than a limit. Print the counts.',
    description: '1. **Start the outer loop.** Create `val counts` with `rows.map { row -> ... }`. Naming the parameter `row` keeps `it` free for the inner lambda.\n\n' +
              '2. **Filter the columns.** Inside, create `val big` with `columns.filter { ... }`. Keep the columns where `it * row` is bigger than `limit`.\n\n' +
              '3. **Return the count.** Make `big.size` the last line of the outer lambda, so the lambda returns it.\n\n' +
              '4. **Print one line.** Use a string template to show the list:\n"Counts: [1, 2]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the outer loop.** Use `map` and name the parameter `row`.',
          '2. **Filter the columns.** Use `it * row` and `limit`.',
          '3. **Return the count.** End with the size.',
          '4. **Print one line.** Show `counts`.',
        ],
        comments: [
          '// 1. Start the outer loop. Use map and name the parameter row.',
          '// 2. Filter the columns. Use it * row and limit.',
          '// 3. Return the count. End with the size.',
          '// 4. Print one line. Show counts.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the outer loop.**',
          '2. **Filter the columns.**',
          '3. **Return the count.**',
          '4. **Print one line.**',
        ],
        comments: [
          '// 1. Start the outer loop.',
          '// 2. Filter the columns.',
          '// 3. Return the count.',
          '// 4. Print one line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RowCounts.kt',
    initialCode: `fun main() {
  val limit = 50
  val rows = listOf(2, 3)
  val columns = listOf(10, 20, 30)

  // 1. Start the outer loop. Create val counts with rows.map { row -> ... }. Naming the parameter row keeps it free for the inner lambda.

  // 2. Filter the columns. Inside, create val big with columns.filter { ... }. Keep the columns where it * row is bigger than limit.

  // 3. Return the count. Make big.size the last line of the outer lambda, so the lambda returns it.

  // 4. Print one line. Use a string template to show the list: "Counts: [1, 2]"
}`,
    solutionCode: `fun main() {
  val limit = 50
  val rows = listOf(2, 3)
  val columns = listOf(10, 20, 30)
  val counts = rows.map { row ->
    val big = columns.filter { it * row > limit }
    big.size
  }
  println("Counts: $counts")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Counts: [1, 2]',
    testCase: { call: '', expected: 'Counts: [1, 2]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '50', alternateLiteral: '25' }],
      alternateExpectedOutput: 'Counts: [2, 3]',
    },
  },
  {
    id: 'world-9-practice-writerun-square-labels',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write two small functions and pass them to map with function references.',
    conceptTags: ['lesson:function-references', 'top-level-function-reference', 'map', 'function-chain'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Square Labels',
    goal: 'Turn a list of numbers into squares. Then turn each square into a label. Print both lists.',
    description: '1. **Write the square function.** Above `main`, write `square(n: Int): Int`. It returns `n * n`.\n\n' +
              '2. **Write the describe function.** Above `main`, write `describe(n: Int): String`. It returns the text `n=` followed by `n`.\n\n' +
              '3. **Square the numbers.** Call `numbers.map(::square)` and keep the result in `squares`.\n\n' +
              '4. **Label the squares.** Call `squares.map(::describe)` and keep the result in `labels`.\n\n' +
              '5. **Print two lines.** Use string templates to show the lists:\n"Squares: [4, 25, 81]"\n"Labels: [n=4, n=25, n=81]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the square function.** Return `n * n`.',
          '2. **Write the describe function.** Return text that has `n` in it.',
          '3. **Square the numbers.** Pass `::square` to `map`.',
          '4. **Label the squares.** Pass `::describe` to `map`.',
          '5. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Write the square function. Return n * n.',
          '// 2. Write the describe function. Return text that has n in it.',
          '// 3. Square the numbers. Pass ::square to map.',
          '// 4. Label the squares. Pass ::describe to map.',
          '// 5. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the square function.**',
          '2. **Write the describe function.**',
          '3. **Square the numbers.**',
          '4. **Label the squares.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the square function.',
          '// 2. Write the describe function.',
          '// 3. Square the numbers.',
          '// 4. Label the squares.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SquareLabels.kt',
    initialCode: `// 1. Write the square function. Above main, write square(n: Int): Int. It returns n * n.

// 2. Write the describe function. Above main, write describe(n: Int): String. It returns the text n= followed by n.

fun main() {
  val start = 2
  val numbers = listOf(start, start + 3, start + 7)

  // 3. Square the numbers. Call numbers.map(::square) and keep the result in squares.

  // 4. Label the squares. Call squares.map(::describe) and keep the result in labels.

  // 5. Print two lines. Use string templates to show the lists: "Squares: [4, 25, 81]" "Labels: [n=4, n=25, n=81]"
}`,
    solutionCode: `fun square(n: Int): Int {
  return n * n
}

fun describe(n: Int): String {
  return "n=" + n
}

fun main() {
  val start = 2
  val numbers = listOf(start, start + 3, start + 7)
  val squares = numbers.map(::square)
  val labels = squares.map(::describe)
  println("Squares: $squares")
  println("Labels: $labels")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Squares: [4, 25, 81]\nLabels: [n=4, n=25, n=81]',
    testCase: { call: '', expected: 'Squares: [4, 25, 81]\nLabels: [n=4, n=25, n=81]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Squares: [9, 36, 100]\nLabels: [n=9, n=36, n=100]',
    },
  },
  {
    id: 'world-9-practice-writerun-bound-counter',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Make a reference tied to one object, and a reference to a member of a type.',
    conceptTags: ['lesson:function-references', 'bound-reference', 'unbound-reference', 'object-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Bound Counter',
    goal: 'A counter object adds 1 each time it is used. Use the counter and a list of words through function references. Print the counter and the shouted words.',
    description: 'The class `Counter` is in the starter code. Its function `next()` adds `1` to `value` and returns it.\n\n' +
              '1. **Make a bound reference.** Create `val advance` with `counter::next`. This reference works on this one `counter`.\n\n' +
              '2. **Shout the words.** Call `words.map(String::uppercase)` and keep the result in `shouted`.\n\n' +
              '3. **Move the counter twice.** Call `advance()` two times. You do not need the results.\n\n' +
              '4. **Move it a third time.** Call `advance()` again and keep the result in `third`.\n\n' +
              '5. **Print three lines.** Use a string template to show `shouted`:\n"Third: 13"\n"Counter: 13"\n"Shouted: [KOTLIN, LAMBDA, IT]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make a bound reference.** Use `counter::next`.',
          '2. **Shout the words.** Use `String::uppercase` with `map`.',
          '3. **Move the counter twice.** Call `advance()` two times.',
          '4. **Move it a third time.** Keep the result in `third`.',
          '5. **Print three lines.** Show `third`, `counter.value` and `shouted`.',
        ],
        comments: [
          '// 1. Make a bound reference. Use counter::next.',
          '// 2. Shout the words. Use String::uppercase with map.',
          '// 3. Move the counter twice. Call advance() two times.',
          '// 4. Move it a third time. Keep the result in third.',
          '// 5. Print three lines. Show third, counter.value and shouted.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make a bound reference.**',
          '2. **Shout the words.**',
          '3. **Move the counter twice.**',
          '4. **Move it a third time.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Make a bound reference.',
          '// 2. Shout the words.',
          '// 3. Move the counter twice.',
          '// 4. Move it a third time.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BoundCounter.kt',
    initialCode: `class Counter(var value: Int) {
  fun next(): Int {
    value = value + 1
    return value
  }
}

fun main() {
  val start = 10
  val counter = Counter(start)
  val words = listOf("kotlin", "lambda", "it")

  // 1. Make a bound reference. Create val advance with counter::next. This reference works on this one counter.

  // 2. Shout the words. Call words.map(String::uppercase) and keep the result in shouted.

  // 3. Move the counter twice. Call advance() two times. You do not need the results.

  // 4. Move it a third time. Call advance() again and keep the result in third.

  // 5. Print three lines. Use a string template to show shouted: "Third: 13" "Counter: 13" "Shouted: [KOTLIN, LAMBDA, IT]"
}`,
    solutionCode: `class Counter(var value: Int) {
  fun next(): Int {
    value = value + 1
    return value
  }
}

fun main() {
  val start = 10
  val counter = Counter(start)
  val words = listOf("kotlin", "lambda", "it")
  val advance = counter::next
  val shouted = words.map(String::uppercase)
  advance()
  advance()
  val third = advance()
  println("Third: " + third)
  println("Counter: " + counter.value)
  println("Shouted: $shouted")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Third: 13\nCounter: 13\nShouted: [KOTLIN, LAMBDA, IT]',
    testCase: { call: '', expected: 'Third: 13\nCounter: 13\nShouted: [KOTLIN, LAMBDA, IT]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Third: 23\nCounter: 23\nShouted: [KOTLIN, LAMBDA, IT]',
    },
  },
  {
    id: 'world-9-practice-writerun-time-of-day',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write one lambda that ends with a when expression and one that returns true or false.',
    conceptTags: ['lesson:returning-from-lambdas', 'when-as-last-expression', 'boolean-result', 'lambda-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Time of Day',
    goal: 'Name the part of the day for an hour. Also say if a shop is open at that hour. Print the results.',
    description: '1. **Write the greeting lambda.** Create `val greeting` as a lambda with `h: Int`. Use a `when` as the last line. Give `Morning` below `12`, `Afternoon` below `18`, and `Evening` for everything else.\n\n' +
              '2. **Write the open lambda.** Create `val isOpen` as a lambda with `h: Int`. It returns `true` when `h` is at least `9` and below `17`.\n\n' +
              '3. **Print three lines.** Use `greeting(hour)`, `greeting(hour + 6)` and `isOpen(hour)`:\n"Now: Afternoon"\n"Later: Evening"\n"Open: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the greeting lambda.** End with a `when` that picks the part of the day.',
          '2. **Write the open lambda.** Return a Boolean for the hours `9` to `16`.',
          '3. **Print three lines.** Show now, six hours later, and open.',
        ],
        comments: [
          '// 1. Write the greeting lambda. End with a when that picks the part of the day.',
          '// 2. Write the open lambda. Return a Boolean for the hours 9 to 16.',
          '// 3. Print three lines. Show now, six hours later, and open.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the greeting lambda.**',
          '2. **Write the open lambda.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the greeting lambda.',
          '// 2. Write the open lambda.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TimeOfDay.kt',
    initialCode: `fun main() {
  val hour = 14

  // 1. Write the greeting lambda. Create val greeting as a lambda with h: Int. Use a when as the last line. Give Morning below 12, Afternoon below 18, and Evening for everything else.

  // 2. Write the open lambda. Create val isOpen as a lambda with h: Int. It returns true when h is at least 9 and below 17.

  // 3. Print three lines. Use greeting(hour), greeting(hour + 6) and isOpen(hour): "Now: Afternoon" "Later: Evening" "Open: true"
}`,
    solutionCode: `fun main() {
  val hour = 14
  val greeting = { h: Int ->
    when {
      h < 12 -> "Morning"
      h < 18 -> "Afternoon"
      else -> "Evening"
    }
  }
  val isOpen = { h: Int -> h >= 9 && h < 17 }
  println("Now: " + greeting(hour))
  println("Later: " + greeting(hour + 6))
  println("Open: " + isOpen(hour))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Now: Afternoon\nLater: Evening\nOpen: true',
    testCase: { call: '', expected: 'Now: Afternoon\nLater: Evening\nOpen: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hour', originalLiteral: '14', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Now: Morning\nLater: Afternoon\nOpen: false',
    },
  },
  {
    id: 'world-9-practice-writerun-capped-bonus',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write a lambda with several lines that ends with an if expression, and a lambda that prints.',
    conceptTags: ['lesson:returning-from-lambdas', 'multiline-lambda', 'if-as-last-expression', 'unit-ending-lambda'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Capped Bonus',
    goal: 'Add a streak bonus to each base score, but never go above a cap. Print a line for each player.',
    description: '1. **Write the score lambda.** Create `val bonusScore` as a lambda with `base: Int` and `streak: Int`. Create `bonus` as `streak * 5`, then `total` as `base + bonus`. Make the last line `if (total > cap) cap else total`.\n\n' +
              '2. **Write the report lambda.** Create `val report` as a lambda with `name: String` and `score: Int`. Print `name`, then `: `, then `score`.\n\n' +
              '3. **Report Ana.** Call `report` with `"Ana"` and the score for base `60` and streak `2`.\n\n' +
              '4. **Report Bo.** Call `report` with `"Bo"` and the score for base `90` and streak `4`. The two lines are:\n"Ana: 70"\n"Bo: 100"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the score lambda.** Add the bonus, and cap the total with `if`.',
          '2. **Write the report lambda.** Print the name and the score.',
          '3. **Report Ana.** Base `60`, streak `2`.',
          '4. **Report Bo.** Base `90`, streak `4`.',
        ],
        comments: [
          '// 1. Write the score lambda. Add the bonus, and cap the total with if.',
          '// 2. Write the report lambda. Print the name and the score.',
          '// 3. Report Ana. Base 60, streak 2.',
          '// 4. Report Bo. Base 90, streak 4.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the score lambda.**',
          '2. **Write the report lambda.**',
          '3. **Report Ana.**',
          '4. **Report Bo.**',
        ],
        comments: [
          '// 1. Write the score lambda.',
          '// 2. Write the report lambda.',
          '// 3. Report Ana.',
          '// 4. Report Bo.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CappedBonus.kt',
    initialCode: `fun main() {
  val cap = 100

  // 1. Write the score lambda. Create val bonusScore as a lambda with base: Int and streak: Int. Create bonus as streak * 5, then total as base + bonus. Make the last line if (total > cap) cap else total.

  // 2. Write the report lambda. Create val report as a lambda with name: String and score: Int. Print name, then : , then score.

  // 3. Report Ana. Call report with "Ana" and the score for base 60 and streak 2.

  // 4. Report Bo. Call report with "Bo" and the score for base 90 and streak 4. The two lines are: "Ana: 70" "Bo: 100"
}`,
    solutionCode: `fun main() {
  val cap = 100
  val bonusScore = { base: Int, streak: Int ->
    val bonus = streak * 5
    val total = base + bonus
    if (total > cap) cap else total
  }
  val report = { name: String, score: Int ->
    println(name + ": " + score)
  }
  report("Ana", bonusScore(60, 2))
  report("Bo", bonusScore(90, 4))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 70\nBo: 100',
    testCase: { call: '', expected: 'Ana: 70\nBo: 100' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'cap', originalLiteral: '100', alternateLiteral: '80' }],
      alternateExpectedOutput: 'Ana: 70\nBo: 80',
    },
  },
  {
    id: 'world-9-practice-writerun-skip-zeros',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Skip some items inside forEach with a labelled return, and add up the rest.',
    conceptTags: ['lesson:local-returns', 'return-at-label', 'skip-one-item', 'captured-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Skip the Zeros',
    goal: 'A list of readings has some zero values. Skip the zeros, count them, and add up the other readings. Print both.',
    description: '1. **Start the loop.** Call `readings.forEach { ... }`. Use `it` for each reading.\n\n' +
              '2. **Count the skipped ones.** Inside the loop, check `it == ignored`. When it is true, add `1` to `skipped`.\n\n' +
              '3. **Skip the rest of the round.** In the same `if`, write `return@forEach`. This leaves only the current round.\n\n' +
              '4. **Add the other readings.** After the `if`, add `it` to `sum`.\n\n' +
              '5. **Print two lines.** Join the text with `+`:\n"Sum: 39"\n"Skipped: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the loop.** Use `forEach` and `it`.',
          '2. **Count the skipped ones.** Check `it == ignored`.',
          '3. **Skip the rest of the round.** Use `return@forEach`.',
          '4. **Add the other readings.** Add `it` to `sum`.',
          '5. **Print two lines.** Show `sum` and `skipped`.',
        ],
        comments: [
          '// 1. Start the loop. Use forEach and it.',
          '// 2. Count the skipped ones. Check it == ignored.',
          '// 3. Skip the rest of the round. Use return@forEach.',
          '// 4. Add the other readings. Add it to sum.',
          '// 5. Print two lines. Show sum and skipped.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the loop.**',
          '2. **Count the skipped ones.**',
          '3. **Skip the rest of the round.**',
          '4. **Add the other readings.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Start the loop.',
          '// 2. Count the skipped ones.',
          '// 3. Skip the rest of the round.',
          '// 4. Add the other readings.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SkipZeros.kt',
    initialCode: `fun main() {
  val ignored = 0
  val readings = listOf(12, 0, 7, 0, 20)
  var sum = 0
  var skipped = 0

  // 1. Start the loop. Call readings.forEach { ... }. Use it for each reading.

  // 2. Count the skipped ones. Inside the loop, check it == ignored. When it is true, add 1 to skipped.

  // 3. Skip the rest of the round. In the same if, write return@forEach. This leaves only the current round.

  // 4. Add the other readings. After the if, add it to sum.

  // 5. Print two lines. Join the text with +: "Sum: 39" "Skipped: 2"
}`,
    solutionCode: `fun main() {
  val ignored = 0
  val readings = listOf(12, 0, 7, 0, 20)
  var sum = 0
  var skipped = 0
  readings.forEach {
    if (it == ignored) {
      skipped += 1
      return@forEach
    }
    sum += it
  }
  println("Sum: " + sum)
  println("Skipped: " + skipped)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sum: 39\nSkipped: 2',
    testCase: { call: '', expected: 'Sum: 39\nSkipped: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'ignored', originalLiteral: '0', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Sum: 32\nSkipped: 1',
    },
  },
  {
    id: 'world-9-practice-writerun-first-below',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Search a list inside forEach and return from the whole function as soon as you find a match.',
    conceptTags: ['lesson:local-returns', 'non-local-return', 'early-exit', 'index-counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'First Below the Line',
    goal: 'Write a function that finds the position of the first value below a limit. Return -1 when there is none. Test it on two lists.',
    description: 'The function header `firstBelow(values, threshold)` and the two lists are in the starter code.\n\n' +
              '1. **Start the position.** Create `var index = 0`. It counts the values you have passed.\n\n' +
              '2. **Loop over the values.** Call `values.forEach { ... }` and use `it` for each value.\n\n' +
              '3. **Stop at the first match.** Inside the loop, when `it` is below `threshold`, write `return index`. This leaves the whole function.\n\n' +
              '4. **Move to the next value.** After the `if`, add `1` to `index`.\n\n' +
              '5. **Return -1.** After the loop, return `-1`. It means that no value was below `threshold`.\n\n' +
              '6. **Print two lines.** In `main`, call `firstBelow` with `listA`, then with `listB`:\n"Index in A: 2"\n"Index in B: -1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the position.** Create a counter for the index.',
          '2. **Loop over the values.** Use `forEach` and `it`.',
          '3. **Stop at the first match.** Return `index` from the function.',
          '4. **Move to the next value.** Add `1` to `index`.',
          '5. **Return -1.** Use it when nothing matched.',
          '6. **Print two lines.** Test both lists.',
        ],
        comments: [
          '// 1. Start the position. Create a counter for the index.',
          '// 2. Loop over the values. Use forEach and it.',
          '// 3. Stop at the first match. Return index from the function.',
          '// 4. Move to the next value. Add 1 to index.',
          '// 5. Return -1. Use it when nothing matched.',
          '// 6. Print two lines. Test both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the position.**',
          '2. **Loop over the values.**',
          '3. **Stop at the first match.**',
          '4. **Move to the next value.**',
          '5. **Return -1.**',
          '6. **Print two lines.**',
        ],
        comments: [
          '// 1. Start the position.',
          '// 2. Loop over the values.',
          '// 3. Stop at the first match.',
          '// 4. Move to the next value.',
          '// 5. Return -1.',
          '// 6. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstBelow.kt',
    initialCode: `fun firstBelow(values: List<Int>, threshold: Int): Int {
  // 1. Start the position. Create var index = 0. It counts the values you have passed.

  // 2. Loop over the values. Call values.forEach { ... } and use it for each value.

  // 3. Stop at the first match. Inside the loop, when it is below threshold, write return index. This leaves the whole function.

  // 4. Move to the next value. After the if, add 1 to index.

  // 5. Return -1. After the loop, return -1. It means that no value was below threshold.
}

fun main() {
  val threshold = 0
  val listA = listOf(4, 9, -2, 8, -5)
  val listB = listOf(3, 1, 6)

  // 6. Print two lines. In main, call firstBelow with listA, then with listB: "Index in A: 2" "Index in B: -1"
}`,
    solutionCode: `fun firstBelow(values: List<Int>, threshold: Int): Int {
  var index = 0
  values.forEach {
    if (it < threshold) {
      return index
    }
    index += 1
  }
  return -1
}

fun main() {
  val threshold = 0
  val listA = listOf(4, 9, -2, 8, -5)
  val listB = listOf(3, 1, 6)
  println("Index in A: " + firstBelow(listA, threshold))
  println("Index in B: " + firstBelow(listB, threshold))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Index in A: 2\nIndex in B: -1',
    testCase: { call: '', expected: 'Index in A: 2\nIndex in B: -1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'threshold', originalLiteral: '0', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Index in A: 0\nIndex in B: 0',
    },
  },
  {
    id: 'world-9-practice-writerun-order-checks',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write an inline function and use return inside its lambdas to leave the whole function early.',
    conceptTags: ['lesson:inline-functions', 'inline-function', 'non-local-return', 'early-exit'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Order Checks',
    goal: 'Check an order amount. Reject a negative amount, send a large amount for review, and accept the rest. Print the result for three amounts.',
    description: 'The function header `process(amount: Int)` and `val large = 2500` are in the starter code.\n\n' +
              '1. **Write the inline function.** Above `process`, write `inline fun runIf(condition: Boolean, action: () -> Unit)`. When `condition` is `true`, call `action()`.\n\n' +
              '2. **Reject negative amounts.** In `process`, call `runIf(amount < 0)` with a trailing lambda. Inside it, return the text `Invalid`.\n\n' +
              '3. **Send large amounts for review.** Call `runIf(amount > 1000)` with a trailing lambda. Inside it, return the text `Review`.\n\n' +
              '4. **Accept the rest.** At the end of `process`, return the text `Accepted`.\n\n' +
              '5. **Print three lines.** Call `process` with `-5`, with `large`, and with `300`:\n"Invalid"\n"Review"\n"Accepted"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the inline function.** Call `action` only when `condition` is `true`.',
          '2. **Reject negative amounts.** Return from inside the lambda.',
          '3. **Send large amounts for review.** Check for more than `1000`.',
          '4. **Accept the rest.** Return the default result.',
          '5. **Print three lines.** Use `-5`, `large` and `300`.',
        ],
        comments: [
          '// 1. Write the inline function. Call action only when condition is true.',
          '// 2. Reject negative amounts. Return from inside the lambda.',
          '// 3. Send large amounts for review. Check for more than 1000.',
          '// 4. Accept the rest. Return the default result.',
          '// 5. Print three lines. Use -5, large and 300.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the inline function.**',
          '2. **Reject negative amounts.**',
          '3. **Send large amounts for review.**',
          '4. **Accept the rest.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the inline function.',
          '// 2. Reject negative amounts.',
          '// 3. Send large amounts for review.',
          '// 4. Accept the rest.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderChecks.kt',
    initialCode: `// 1. Write the inline function. Above process, write inline fun runIf(condition: Boolean, action: () -> Unit). When condition is true, call action().

fun process(amount: Int): String {
  // 2. Reject negative amounts. In process, call runIf(amount < 0) with a trailing lambda. Inside it, return the text Invalid.

  // 3. Send large amounts for review. Call runIf(amount > 1000) with a trailing lambda. Inside it, return the text Review.

  // 4. Accept the rest. At the end of process, return the text Accepted.
}

fun main() {
  val large = 2500

  // 5. Print three lines. Call process with -5, with large, and with 300: "Invalid" "Review" "Accepted"
}`,
    solutionCode: `inline fun runIf(condition: Boolean, action: () -> Unit) {
  if (condition) {
    action()
  }
}

fun process(amount: Int): String {
  runIf(amount < 0) {
    return "Invalid"
  }
  runIf(amount > 1000) {
    return "Review"
  }
  return "Accepted"
}

fun main() {
  val large = 2500
  println(process(-5))
  println(process(large))
  println(process(300))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Invalid\nReview\nAccepted',
    testCase: { call: '', expected: 'Invalid\nReview\nAccepted' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'large', originalLiteral: '2500', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Invalid\nAccepted\nAccepted',
    },
  },
  {
    id: 'world-9-practice-writerun-counted-steps',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write an inline function that counts its calls and returns the result of a lambda.',
    conceptTags: ['lesson:inline-functions', 'inline-function', 'lambda-result', 'shared-counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Counted Steps',
    goal: 'Run three steps one after another. Each step uses the result of the one before. Count how many steps ran and print the final result.',
    description: 'The top-level `var calls = 0` is shared by every function.\n\n' +
              '1. **Write the inline function.** Above `main`, write `inline fun counted(action: () -> Int): Int`. Add `1` to `calls`, then return `action()`.\n\n' +
              '2. **Double the base.** Create `val a` with `counted { ... }`. Inside, return `base * 2`.\n\n' +
              '3. **Add the base.** Create `val b` with `counted { ... }`. Inside, return `a + base`.\n\n' +
              '4. **Take one away.** Create `val c` with `counted { ... }`. Inside, return `b - 1`.\n\n' +
              '5. **Print two lines.** Join the text with `+`:\n"Result: 17"\n"Calls: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the inline function.** Count the call, then return what `action()` gives.',
          '2. **Double the base.** Use `counted` with `base * 2`.',
          '3. **Add the base.** Use `counted` with `a + base`.',
          '4. **Take one away.** Use `counted` with `b - 1`.',
          '5. **Print two lines.** Show `c` and `calls`.',
        ],
        comments: [
          '// 1. Write the inline function. Count the call, then return what action() gives.',
          '// 2. Double the base. Use counted with base * 2.',
          '// 3. Add the base. Use counted with a + base.',
          '// 4. Take one away. Use counted with b - 1.',
          '// 5. Print two lines. Show c and calls.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the inline function.**',
          '2. **Double the base.**',
          '3. **Add the base.**',
          '4. **Take one away.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the inline function.',
          '// 2. Double the base.',
          '// 3. Add the base.',
          '// 4. Take one away.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CountedSteps.kt',
    initialCode: `var calls = 0

// 1. Write the inline function. Above main, write inline fun counted(action: () -> Int): Int. Add 1 to calls, then return action().

fun main() {
  val base = 6

  // 2. Double the base. Create val a with counted { ... }. Inside, return base * 2.

  // 3. Add the base. Create val b with counted { ... }. Inside, return a + base.

  // 4. Take one away. Create val c with counted { ... }. Inside, return b - 1.

  // 5. Print two lines. Join the text with +: "Result: 17" "Calls: 3"
}`,
    solutionCode: `var calls = 0

inline fun counted(action: () -> Int): Int {
  calls += 1
  return action()
}

fun main() {
  val base = 6
  val a = counted { base * 2 }
  val b = counted { a + base }
  val c = counted { b - 1 }
  println("Result: " + c)
  println("Calls: " + calls)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: 17\nCalls: 3',
    testCase: { call: '', expected: 'Result: 17\nCalls: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '6', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Result: 29\nCalls: 3',
    },
  },
  {
    id: 'world-9-practice-writerun-swap-handler',
    worldId: 'world-9',
    difficulty: 'medium',
    summary: 'Write an inline function that stores a lambda in a variable, then swap the handler twice.',
    conceptTags: ['lesson:noinline', 'noinline-parameter', 'stored-callback', 'top-level-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Swap the Handler',
    goal: 'A program keeps one handler in a variable. Run the handler, replace it twice, and run it again each time.',
    description: 'The top-level `var handler` is in the starter code. It starts as a lambda that returns the word idle and the number.\n\n' +
              '1. **Write the inline function.** Above `main`, write `inline fun install(noinline next: (Int) -> String)`. Set `handler` to `next`. The `noinline` keyword lets you store the lambda.\n\n' +
              '2. **Run the first handler.** Print `handler(code)`:\n"idle 7"\n\n' +
              '3. **Install the ready handler.** Call `install` with a lambda `{ n -> ... }` that returns the text `ready ` followed by `n * 2`. Then print `handler(code)`:\n"ready 14"\n\n' +
              '4. **Install the done handler.** Call `install` with a lambda that returns the text `done ` followed by `n + 1`. Put `n + 1` in brackets. Then print `handler(code)`:\n"done 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the inline function.** Store `next` in `handler`. Mark it `noinline`.',
          '2. **Run the first handler.** Print `handler(code)`.',
          '3. **Install the ready handler.** Double `n`, install it, and print.',
          '4. **Install the done handler.** Add `1` to `n` (use brackets), install it, and print.',
        ],
        comments: [
          '// 1. Write the inline function. Store next in handler. Mark it noinline.',
          '// 2. Run the first handler. Print handler(code).',
          '// 3. Install the ready handler. Double n, install it, and print.',
          '// 4. Install the done handler. Add 1 to n (use brackets), install it, and print.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the inline function.**',
          '2. **Run the first handler.**',
          '3. **Install the ready handler.**',
          '4. **Install the done handler.**',
        ],
        comments: [
          '// 1. Write the inline function.',
          '// 2. Run the first handler.',
          '// 3. Install the ready handler.',
          '// 4. Install the done handler.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SwapHandler.kt',
    initialCode: `var handler: (Int) -> String = { n -> "idle " + n }

// 1. Write the inline function. Above main, write inline fun install(noinline next: (Int) -> String). Set handler to next. The noinline keyword lets you store the lambda.

fun main() {
  val code = 7

  // 2. Run the first handler. Print handler(code): "idle 7"

  // 3. Install the ready handler. Call install with a lambda { n -> ... } that returns the text ready  followed by n * 2. Then print handler(code): "ready 14"

  // 4. Install the done handler. Call install with a lambda that returns the text done  followed by n + 1. Put n + 1 in brackets. Then print handler(code): "done 8"
}`,
    solutionCode: `var handler: (Int) -> String = { n -> "idle " + n }

inline fun install(noinline next: (Int) -> String) {
  handler = next
}

fun main() {
  val code = 7
  println(handler(code))
  install { n -> "ready " + n * 2 }
  println(handler(code))
  install { n -> "done " + (n + 1) }
  println(handler(code))
}`,
    sampleInput: 'main()',
    expectedOutput: 'idle 7\nready 14\ndone 8',
    testCase: { call: '', expected: 'idle 7\nready 14\ndone 8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'code', originalLiteral: '7', alternateLiteral: '10' }],
      alternateExpectedOutput: 'idle 10\nready 20\ndone 11',
    },
  },
  {
    id: 'world-9-practice-writerun-retry-callback',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write an inline function with one normal callback and one noinline callback that it hands back.',
    conceptTags: ['lesson:noinline', 'noinline-parameter', 'returned-callback', 'mixed-callbacks'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Retry Callback',
    goal: 'A function runs a start action right away and gives back a finish action for later. Check the order of the events.',
    description: '1. **Write the inline function.** Above `main`, write `inline fun register(onStart: () -> Unit, noinline onDone: () -> String): () -> String`. Call `onStart()`, then return `onDone`.\n\n' +
              '2. **Register the callbacks.** Create `val finish` with `register(...)`. For `onStart`, pass a lambda that adds `start;` to `log`. For `onDone`, pass a lambda that returns the text `Retries: ` followed by `retries`.\n\n' +
              '3. **Log the next event.** Add `registered;` to `log`.\n\n' +
              '4. **Print the log.** The start action has already run:\n"start;registered;"\n\n' +
              '5. **Run the finish action.** Print `finish()`:\n"Retries: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the inline function.** Run `onStart` now. Return `onDone`.',
          '2. **Register the callbacks.** Pass one lambda that edits `log` and one that returns the retries text.',
          '3. **Log the next event.** Add `registered;` to `log`.',
          '4. **Print the log.** Show `log`.',
          '5. **Run the finish action.** Print `finish()`.',
        ],
        comments: [
          '// 1. Write the inline function. Run onStart now. Return onDone.',
          '// 2. Register the callbacks. Pass one lambda that edits log and one that returns the retries text.',
          '// 3. Log the next event. Add registered; to log.',
          '// 4. Print the log. Show log.',
          '// 5. Run the finish action. Print finish().',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the inline function.**',
          '2. **Register the callbacks.**',
          '3. **Log the next event.**',
          '4. **Print the log.**',
          '5. **Run the finish action.**',
        ],
        comments: [
          '// 1. Write the inline function.',
          '// 2. Register the callbacks.',
          '// 3. Log the next event.',
          '// 4. Print the log.',
          '// 5. Run the finish action.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RetryCallback.kt',
    initialCode: `// 1. Write the inline function. Above main, write inline fun register(onStart: () -> Unit, noinline onDone: () -> String): () -> String. Call onStart(), then return onDone.

fun main() {
  val retries = 3
  var log = ""

  // 2. Register the callbacks. Create val finish with register(...). For onStart, pass a lambda that adds start; to log. For onDone, pass a lambda that returns the text Retries:  followed by retries.

  // 3. Log the next event. Add registered; to log.

  // 4. Print the log. The start action has already run: "start;registered;"

  // 5. Run the finish action. Print finish(): "Retries: 3"
}`,
    solutionCode: `inline fun register(onStart: () -> Unit, noinline onDone: () -> String): () -> String {
  onStart()
  return onDone
}

fun main() {
  val retries = 3
  var log = ""
  val finish = register({ log = log + "start;" }, { "Retries: " + retries })
  log = log + "registered;"
  println(log)
  println(finish())
}`,
    sampleInput: 'main()',
    expectedOutput: 'start;registered;\nRetries: 3',
    testCase: { call: '', expected: 'start;registered;\nRetries: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'retries', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'start;registered;\nRetries: 5',
    },
  },
  {
    id: 'world-9-practice-writerun-late-label',
    worldId: 'world-9',
    difficulty: 'hard',
    summary: 'Write an inline function that calls a crossinline lambda inside another lambda, and see when it runs.',
    conceptTags: ['lesson:crossinline', 'crossinline-parameter', 'returned-lambda', 'captured-variable'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Late Label',
    goal: 'Make labels that are built later. Change a value before a label is read, and see that the label shows the new value.',
    description: '1. **Write the inline function.** Above `main`, write `inline fun labelled(tag: String, crossinline action: () -> String): () -> String`. Create `val wrapper` as a lambda that joins `[`, `tag`, `] ` and `action()` with `+`. Return `wrapper`.\n\n' +
              '2. **Make the receipt label.** Create `val receipt` with `labelled("ORDER")` and a trailing lambda that returns the text `id=` followed by `orderId`.\n\n' +
              '3. **Change the order id.** Set `orderId` to `orderId + 1`. The receipt label has not run yet.\n\n' +
              '4. **Make the note label.** Create `val note` with `labelled("NOTE")` and a trailing lambda that returns the text `paid`.\n\n' +
              '5. **Print two lines.** Call both labels like functions:\n"[ORDER] id=43"\n"[NOTE] paid"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the inline function.** Wrap `action()` in a lambda and return it. Use `crossinline`.',
          '2. **Make the receipt label.** Use the order id.',
          '3. **Change the order id.** Add `1`.',
          '4. **Make the note label.** Return the text `paid`.',
          '5. **Print two lines.** Call both labels.',
        ],
        comments: [
          '// 1. Write the inline function. Wrap action() in a lambda and return it. Use crossinline.',
          '// 2. Make the receipt label. Use the order id.',
          '// 3. Change the order id. Add 1.',
          '// 4. Make the note label. Return the text paid.',
          '// 5. Print two lines. Call both labels.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the inline function.**',
          '2. **Make the receipt label.**',
          '3. **Change the order id.**',
          '4. **Make the note label.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the inline function.',
          '// 2. Make the receipt label.',
          '// 3. Change the order id.',
          '// 4. Make the note label.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LateLabel.kt',
    initialCode: `// 1. Write the inline function. Above main, write inline fun labelled(tag: String, crossinline action: () -> String): () -> String. Create val wrapper as a lambda that joins [, tag, ]  and action() with +. Return wrapper.

fun main() {
  var orderId = 42

  // 2. Make the receipt label. Create val receipt with labelled("ORDER") and a trailing lambda that returns the text id= followed by orderId.

  // 3. Change the order id. Set orderId to orderId + 1. The receipt label has not run yet.

  // 4. Make the note label. Create val note with labelled("NOTE") and a trailing lambda that returns the text paid.

  // 5. Print two lines. Call both labels like functions: "[ORDER] id=43" "[NOTE] paid"
}`,
    solutionCode: `inline fun labelled(tag: String, crossinline action: () -> String): () -> String {
  val wrapper = { "[" + tag + "] " + action() }
  return wrapper
}

fun main() {
  var orderId = 42
  val receipt = labelled("ORDER") { "id=" + orderId }
  orderId = orderId + 1
  val note = labelled("NOTE") { "paid" }
  println(receipt())
  println(note())
}`,
    sampleInput: 'main()',
    expectedOutput: '[ORDER] id=43\n[NOTE] paid',
    testCase: { call: '', expected: '[ORDER] id=43\n[NOTE] paid' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'orderId', originalLiteral: '42', alternateLiteral: '99' }],
      alternateExpectedOutput: '[ORDER] id=100\n[NOTE] paid',
    },
  },
];

export const WORLD_9_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-9-practice-debug-stale-fee',
    worldId: 'world-9',
    conceptTags: ['lesson:lambda-expressions', 'closure', 'value-vs-lambda'],
    summary: 'The fee is worked out once, so it ignores the later rate change.',
    title: 'Fix the Stale Fee',
    subtitle: 'The program should print "Fee: 16" after the rate changes to 8, but it prints "Fee: 10".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a value was computed once instead of a lambda',
    brokenCode: `fun main() {
  var rate = 5
  val fee = rate * 2
  rate = 8
  println("Fee: " + fee)
}`,
    fixedCode: `fun main() {
  var rate = 5
  val fee = { rate * 2 }
  rate = 8
  println("Fee: " + fee())
}`,
    expectedOutput: 'Fee: 16',
    hints: [
              'Look at when `fee` gets its value. Is it before or after `rate` changes?',
              'A plain value is worked out once, at the line where it is declared. Later changes to `rate` do not update it.',
              'Store the calculation itself in `fee`, as a lambda, and run it when you print.',
            ],
    explanation: 'The broken code writes `val fee = rate * 2`. Kotlin works this out right away, so `fee` stays `10` even after `rate` becomes `8`. The fix stores a lambda, `{ rate * 2 }`, and calls `fee()` when printing. The lambda reads `rate` each time it runs, so it sees `8` and prints `16`.',
  },
  {
    id: 'world-9-practice-debug-missing-argument',
    worldId: 'world-9',
    conceptTags: ['lesson:lambda-expressions', 'two-parameter-lambda', 'call-arity'],
    summary: 'A lambda with two parameters is called with one value.',
    title: 'Fix the Missing Argument',
    subtitle: 'The program should print "Sum: 8", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a parameter has no value',
    brokenCode: `fun main() {
  val add = { a: Int, b: Int -> a + b }
  val result = add(5)
  println("Sum: " + result)
}`,
    fixedCode: `fun main() {
  val add = { a: Int, b: Int -> a + b }
  val result = add(5, 3)
  println("Sum: " + result)
}`,
    expectedOutput: 'Sum: 8',
    hints: [
              'Find the line that calls `add`. Count the values it passes.',
              'The lambda has two parameters, `a` and `b`. A call must give a value for each one.',
              'Give the call a second value. Choose one that makes the sum 8.',
            ],
    explanation: 'The lambda `add` has two parameters, `a` and `b`. The call `add(5)` passes only one value, so Kotlin reports that `b` has no value. Calling `add(5, 3)` gives both, and the result is `8`.',
  },
  {
    id: 'world-9-practice-debug-return-in-lambda',
    worldId: 'world-9',
    conceptTags: ['lesson:anonymous-functions', 'return-not-allowed', 'anonymous-function'],
    summary: 'A plain return is not allowed inside a lambda.',
    title: 'Fix the Return in the Lambda',
    subtitle: 'The program should print "negative" and then "not negative", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'syntax',
    bugLabel: 'Compile Error: a lambda cannot use a plain return',
    brokenCode: `fun main() {
  val sign = { n: Int ->
    if (n < 0) {
      return "negative"
    }
    "not negative"
  }
  println(sign(-4))
  println(sign(9))
}`,
    fixedCode: `fun main() {
  val sign = fun(n: Int): String {
    if (n < 0) {
      return "negative"
    }
    return "not negative"
  }
  println(sign(-4))
  println(sign(9))
}`,
    expectedOutput: 'negative\nnot negative',
    hints: [
              'Look at the `return` inside the braces after `sign =`.',
              'A plain `return` is not allowed in a lambda. It would try to leave the function around the lambda.',
              'Switch to an anonymous function, which is allowed to use `return`. Give it its parameter and its return type.',
            ],
    explanation: 'A lambda cannot use a plain `return`. An anonymous function can, and `return` leaves only that function. The fix changes `{ n: Int -> ... }` into `fun(n: Int): String { ... }` and ends with `return "not negative"`. Now both calls give a `String`.',
  },
  {
    id: 'world-9-practice-debug-wrong-arity-type',
    worldId: 'world-9',
    conceptTags: ['lesson:function-types', 'parameter-count', 'explicit-function-type'],
    summary: 'The function type has one parameter but the lambda has two.',
    title: 'Fix the Function Type',
    subtitle: 'The program should print "Total: 10", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the type has one parameter but the lambda has two',
    brokenCode: `fun main() {
  val combine: (Int) -> Int = { a, b -> a + b }
  println("Total: " + combine(4, 6))
}`,
    fixedCode: `fun main() {
  val combine: (Int, Int) -> Int = { a, b -> a + b }
  println("Total: " + combine(4, 6))
}`,
    expectedOutput: 'Total: 10',
    hints: [
              'Compare the function type on the left with the lambda on the right.',
              'The type `(Int) -> Int` has one parameter, but the lambda has two, `a` and `b`.',
              'Change the type so it lists one parameter for each name in the lambda.',
            ],
    explanation: 'The type before `=` says the function takes one `Int`. The lambda takes two, so the types do not match. The fix is `(Int, Int) -> Int`, which also matches the call `combine(4, 6)` and gives `10`.',
  },
  {
    id: 'world-9-practice-debug-restarting-steps',
    worldId: 'world-9',
    conceptTags: ['lesson:higher-order-functions', 'loop-with-callback', 'running-value'],
    summary: 'Every round starts again from the first value.',
    title: 'Fix the Restarting Steps',
    subtitle: 'The program should print "Result: 54", but it prints "Result: 6".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: every step starts again from the first value',
    brokenCode: `fun repeatStep(start: Int, times: Int, step: (Int) -> Int): Int {
  var current = start
  for (i in 1..times) {
    current = step(start)
  }
  return current
}

fun main() {
  val result = repeatStep(2, 3) { n -> n * 3 }
  println("Result: " + result)
}`,
    fixedCode: `fun repeatStep(start: Int, times: Int, step: (Int) -> Int): Int {
  var current = start
  for (i in 1..times) {
    current = step(current)
  }
  return current
}

fun main() {
  val result = repeatStep(2, 3) { n -> n * 3 }
  println("Result: " + result)
}`,
    expectedOutput: 'Result: 54',
    hints: [
              'Trace the loop by hand. What value does `step` get in each round?',
              'Every round calls `step(start)`, so it always begins again from the first value and the earlier results are lost.',
              'Give each round the result of the round before it, using the running value.',
            ],
    explanation: 'The loop calls `step(start)` in every round, so `current` is `6` each time and the loop only repeats the same answer. The fix is `current = step(current)`. Now the rounds give `6`, then `18`, then `54`.',
  },
  {
    id: 'world-9-practice-debug-it-with-name',
    worldId: 'world-9',
    conceptTags: ['lesson:it', 'named-parameter-vs-it', 'unresolved-reference'],
    summary: 'The parameter has a name, so it does not exist.',
    title: 'Fix the Missing it',
    subtitle: 'The program should print "Doubled: [40, 70, 100]", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: it does not exist when the parameter has a name',
    brokenCode: `fun main() {
  val prices = listOf(20, 35, 50)
  val doubled = prices.map { price -> it * 2 }
  println("Doubled: $doubled")
}`,
    fixedCode: `fun main() {
  val prices = listOf(20, 35, 50)
  val doubled = prices.map { it * 2 }
  println("Doubled: $doubled")
}`,
    expectedOutput: 'Doubled: [40, 70, 100]',
    hints: [
              'Look at the lambda after `map`. What name does it give the parameter?',
              'When you write `price ->`, Kotlin does not create `it`. So `it` is unknown.',
              'Use one name for the value inside the lambda. Either use your own name everywhere, or remove the name and use `it`.',
            ],
    explanation: 'The lambda names its parameter `price`, so `it` does not exist and `it * 2` cannot compile. You can use the name, `{ price -> price * 2 }`, or drop the name and write `{ it * 2 }`. Both double every price.',
  },
  {
    id: 'world-9-practice-debug-reference-arity',
    worldId: 'world-9',
    conceptTags: ['lesson:function-references', 'reference-signature', 'function-type-match'],
    summary: 'A function reference does not fit a function that needs two arguments.',
    title: 'Fix the Function Reference',
    subtitle: 'The program should print "#1/3" and "#2/3", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the function needs two arguments but the type gives one',
    brokenCode: `fun label(n: Int, width: Int): String {
  return "#" + n + "/" + width
}

fun main() {
  val format: (Int) -> String = ::label
  println(format(1))
  println(format(2))
}`,
    fixedCode: `fun label(n: Int, width: Int): String {
  return "#" + n + "/" + width
}

fun main() {
  val format: (Int) -> String = { label(it, 3) }
  println(format(1))
  println(format(2))
}`,
    expectedOutput: '#1/3\n#2/3',
    hints: [
              'Compare the type of `format` with the parameters of `label`.',
              'The type `(Int) -> String` takes one value, but `label` needs two, `n` and `width`. So `::label` does not fit.',
              'Use a lambda instead of the reference. Call `label` inside it and give the second value yourself.',
            ],
    explanation: 'The type `(Int) -> String` says `format` takes one number, but `label` needs two arguments, so `::label` has the wrong shape. A lambda can fill in the missing one: `{ label(it, 3) }`. Each number is passed as `it`, and `3` is the width.',
  },
  {
    id: 'world-9-practice-debug-no-final-value',
    worldId: 'world-9',
    conceptTags: ['lesson:returning-from-lambdas', 'last-expression', 'unit-vs-int'],
    summary: 'The lambda ends with println, so it returns Unit instead of an Int.',
    title: 'Fix the Missing Result',
    subtitle: 'The program should print "Computed 24" and "Area: 24", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the lambda ends with println, so it returns Unit, not Int',
    brokenCode: `fun main() {
  val area: (Int, Int) -> Int = { w, h ->
    val result = w * h
    println("Computed " + result)
  }
  println("Area: " + area(4, 6))
}`,
    fixedCode: `fun main() {
  val area: (Int, Int) -> Int = { w, h ->
    val result = w * h
    println("Computed " + result)
    result
  }
  println("Area: " + area(4, 6))
}`,
    expectedOutput: 'Computed 24\nArea: 24',
    hints: [
              'Look at the last line inside the braces of `area`, and at the type on the left.',
              'The last line of a lambda is its result. `println` gives back `Unit`, but the type says `Int`.',
              'Make the last line of the lambda the value you want it to return.',
            ],
    explanation: 'A lambda returns the value of its last line. Here the last line is `println(...)`, which gives back `Unit`, but the type says `Int`. The fix adds `result` as the last line, after the `println`. Now the lambda returns `24`.',
  },
  {
    id: 'world-9-practice-debug-stops-too-late',
    worldId: 'world-9',
    conceptTags: ['lesson:local-returns', 'return-at-label', 'non-local-return', 'early-exit'],
    summary: 'The label skips one item but the loop does not stop.',
    title: 'Fix the Late Stop',
    subtitle: 'The program should print "Sum: 13", the sum before the first negative number, but it prints "Sum: 17".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the label only skips one item',
    brokenCode: `fun sumBeforeNegative(values: List<Int>): Int {
  var sum = 0
  values.forEach {
    if (it < 0) {
      return@forEach
    }
    sum += it
  }
  return sum
}

fun main() {
  println("Sum: " + sumBeforeNegative(listOf(5, 8, -1, 4)))
}`,
    fixedCode: `fun sumBeforeNegative(values: List<Int>): Int {
  var sum = 0
  values.forEach {
    if (it < 0) {
      return sum
    }
    sum += it
  }
  return sum
}

fun main() {
  println("Sum: " + sumBeforeNegative(listOf(5, 8, -1, 4)))
}`,
    expectedOutput: 'Sum: 13',
    hints: [
              'Trace the list `5, 8, -1, 4`. Which numbers are added to `sum`?',
              '`return@forEach` ends only the current round, so the loop goes on and adds `4`.',
              'Use a return that leaves the whole function, and make it give back the sum so far.',
            ],
    explanation: '`return@forEach` skips only the current item, so `-1` is skipped but `4` is still added. That gives `5 + 8 + 4 = 17`. Inside an inline lambda such as the one for `forEach`, a plain `return` leaves the whole function. Writing `return sum` stops at `-1` and returns `13`.',
  },
  {
    id: 'world-9-practice-debug-early-exit-main',
    worldId: 'world-9',
    conceptTags: ['lesson:inline-functions', 'non-local-return', 'return-at-label'],
    summary: 'A plain return in an inline lambda leaves main.',
    title: 'Fix the Early Exit',
    subtitle: 'The program should print four lines, ending with "End export" and "Done", but it stops after "working".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: return leaves main, not just the lambda',
    brokenCode: `inline fun task(name: String, action: () -> Unit) {
  println("Start " + name)
  action()
  println("End " + name)
}

fun main() {
  task("export") {
    println("working")
    return
  }
  println("Done")
}`,
    fixedCode: `inline fun task(name: String, action: () -> Unit) {
  println("Start " + name)
  action()
  println("End " + name)
}

fun main() {
  task("export") {
    println("working")
    return@task
  }
  println("Done")
}`,
    expectedOutput: 'Start export\nworking\nEnd export\nDone',
    hints: [
              'Look at which lines are missing from the output.',
              'The lambda is inlined, so a plain `return` inside it leaves `main`. The rest of `task` and the last `println` never run.',
              'Say which function the `return` should leave. Use the label of the function that the lambda is given to.',
            ],
    explanation: '`task` is inline, so a plain `return` in its lambda leaves `main`, and `End export` and `Done` are never printed. With `return@task`, only the lambda ends. Then `task` goes on to print `End export`, and `main` prints `Done`.',
  },
  {
    id: 'world-9-practice-debug-unsaved-callback',
    worldId: 'world-9',
    conceptTags: ['lesson:noinline', 'storing-inline-parameter', 'noinline-parameter'],
    summary: 'An inline parameter cannot be stored without noinline.',
    title: 'Fix the Unsaved Callback',
    subtitle: 'The program should print "Saved action ran", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: an inline parameter cannot be stored',
    brokenCode: `var saved: () -> Unit = { }

inline fun remember(action: () -> Unit) {
  saved = action
}

fun main() {
  remember { println("Saved action ran") }
  saved()
}`,
    fixedCode: `var saved: () -> Unit = { }

inline fun remember(noinline action: () -> Unit) {
  saved = action
}

fun main() {
  remember { println("Saved action ran") }
  saved()
}`,
    expectedOutput: 'Saved action ran',
    hints: [
              'Look at the function `remember` and the line that stores `action`.',
              'An inline function copies the lambda into the code that calls it, so the parameter is not a real object that can be stored in a variable.',
              'Mark the parameter so that it is kept as a real function value.',
            ],
    explanation: 'In an inline function, the lambda is copied into the code that calls it, so `action` is not a real object. Storing it in `saved` is not allowed. Marking the parameter `noinline` keeps it as a real function value, so the program compiles and `saved()` prints the line.',
  },
  {
    id: 'world-9-practice-debug-wrapped-call',
    worldId: 'world-9',
    conceptTags: ['lesson:crossinline', 'calling-inside-another-lambda', 'crossinline-parameter'],
    summary: 'An inline parameter is called inside another lambda without crossinline.',
    title: 'Fix the Wrapped Call',
    subtitle: 'The program should print "Run job", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: an inline parameter is called inside another lambda',
    brokenCode: `inline fun later(action: () -> Unit): () -> Unit {
  return { action() }
}

fun main() {
  val job = later { println("Run job") }
  job()
}`,
    fixedCode: `inline fun later(crossinline action: () -> Unit): () -> Unit {
  return { action() }
}

fun main() {
  val job = later { println("Run job") }
  job()
}`,
    expectedOutput: 'Run job',
    hints: [
              'Find where `action` is called in `later`. Is the call directly in the function body?',
              'The call is inside another lambda. That lambda runs later, so a `return` in the lambda given to `later` could not jump out in time.',
              'Add a modifier to the parameter that forbids such returns, so that Kotlin can inline the call here.',
            ],
    explanation: 'The call `action()` is inside the lambda that `later` returns. That lambda runs later, so a plain `return` in the lambda given to `later` would have nowhere to go. Marking the parameter `crossinline` forbids such returns, and then Kotlin allows the call. The program prints `Run job`.',
  },
];
