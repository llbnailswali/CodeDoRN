import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 5 -- Function Forge (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps, the function shape is named in the step.
//   hard   -- functions that call or feed each other, shared or captured state,
//             an edge case (no arguments, an early return, a skipped default)
//             and multi-line output; the step names the quantity rather than
//             the exact construct.
//
// Every expected value was derived with an independent reference (plain
// JavaScript), not copied from the simulator, and is re-verified by
// scripts/test-practice-bank.ts. Each program declares its input as a val (or
// var) so the hardcode check can swap it. The Boss is not in the Practice tab.

export const WORLD_5_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // ------------------------------------------------------ defining functions
  {
    id: 'world-5-practice-writerun-morning-routine',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Write three functions, where one calls the other two, then call them from main.',
    conceptTags: ['lesson:defining', 'function-definition', 'function-call', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Morning Routine',
    goal:
      'Show a morning routine using small functions. One wakes up, one has breakfast and one gets ready using both. Run the routine once. Then run the breakfast step again by itself. Print a line for each action.',
    description:
      'The top-level `name` is already given. Write the functions above `main()`.\n\n' +
              '1. **Write the `wakeUp()` function.** It has no parameters. It prints `name` followed by "wakes up", using a string template.\n\n' +
              '2. **Write the `breakfast()` function.** It has no parameters. It prints `name` followed by "eats breakfast".\n\n' +
              '3. **Write the `getReady()` function.** It calls `wakeUp()`, then `breakfast()`. Then it prints `name` followed by "is ready".\n\n' +
              '4. **Run the routine.** In `main()`, call `getReady()` once. Then call `breakfast()` once more on its own.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the `wakeUp()` function.** Print `name` and "wakes up".',
          '2. **Write the `breakfast()` function.** Print `name` and "eats breakfast".',
          '3. **Write the `getReady()` function.** Call the two functions, then print `name` and "is ready".',
          '4. **Run the routine.** Call `getReady()`, then `breakfast()` again.',
        ],
        comments: [
          '// 1. Write the wakeUp() function. Print name and "wakes up".',
          '// 2. Write the breakfast() function. Print name and "eats breakfast".',
          '// 3. Write the getReady() function. Call the two functions, then print name and "is ready".',
          '// 4. Run the routine. Call getReady(), then breakfast() again.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `wakeUp()`.**',
          '2. **Write `breakfast()`.**',
          '3. **Write `getReady()`.**',
          '4. **Run the routine.**',
        ],
        comments: [
          '// 1. Write wakeUp().',
          '// 2. Write breakfast().',
          '// 3. Write getReady().',
          '// 4. Run the routine.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MorningRoutine.kt',
    initialCode: `val name = "Ana"

// 1. Write the wakeUp() function. It has no parameters. It prints name followed by "wakes up", using a string template.

// 2. Write the breakfast() function. It has no parameters. It prints name followed by "eats breakfast".

// 3. Write the getReady() function. It calls wakeUp(), then breakfast(). Then it prints name followed by "is ready".

fun main() {
  // 4. Run the routine. In main(), call getReady() once. Then call breakfast() once more on its own.
}`,
    solutionCode: `val name = "Ana"

fun wakeUp() {
  println("$name wakes up")
}

fun breakfast() {
  println("$name eats breakfast")
}

fun getReady() {
  wakeUp()
  breakfast()
  println("$name is ready")
}

fun main() {
  getReady()
  breakfast()
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana wakes up\nAna eats breakfast\nAna is ready\nAna eats breakfast',
    testCase: { call: '', expected: 'Ana wakes up\nAna eats breakfast\nAna is ready\nAna eats breakfast' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'name', originalLiteral: '"Ana"', alternateLiteral: '"Zed"' }],
      alternateExpectedOutput: 'Zed wakes up\nZed eats breakfast\nZed is ready\nZed eats breakfast',
    },
  },
  {
    id: 'world-5-practice-writerun-round-tracker',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Change a shared top-level score from several small functions and follow it across repeated calls.',
    conceptTags: ['lesson:defining', 'function-definition', 'function-call', 'shared-state', 'compound-assignment'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Round Tracker',
    goal:
      'A game score is shared by several functions. One adds a bonus, one takes a penalty and one plays a full round using both. Play three rounds and print the score after each round.',
    description:
      'The top-level `var score = 10` is shared by every function.\n\n' +
              '1. **Write the `bonus()` function.** It adds 5 to `score`.\n\n' +
              '2. **Write the `penalty()` function.** It subtracts 3 from `score`.\n\n' +
              '3. **Write the `playRound()` function.** It earns two bonuses, then takes one penalty. Call `bonus()` twice, then `penalty()` once.\n\n' +
              '4. **Play three rounds.** In `main()`, call `playRound()` and print the score with a string template. Do this for each round:\n"After round 1: 17"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the `bonus()` function.** Add to `score`.',
          '2. **Write the `penalty()` function.** Subtract from `score`.',
          '3. **Write the `playRound()` function.** Use the two functions above.',
          '4. **Play three rounds.** Print the score after each one.',
        ],
        comments: [
          '// 1. Write the bonus() function. Add to score.',
          '// 2. Write the penalty() function. Subtract from score.',
          '// 3. Write the playRound() function. Use the two functions above.',
          '// 4. Play three rounds. Print the score after each one.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `bonus()`.**',
          '2. **Write `penalty()`.**',
          '3. **Write `playRound()`.**',
          '4. **Play three rounds.**',
        ],
        comments: [
          '// 1. Write bonus().',
          '// 2. Write penalty().',
          '// 3. Write playRound().',
          '// 4. Play three rounds.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RoundTracker.kt',
    initialCode: `var score = 10

// 1. Write the bonus() function. It adds 5 to score.

// 2. Write the penalty() function. It subtracts 3 from score.

// 3. Write the playRound() function. It earns two bonuses, then takes one penalty. Call bonus() twice, then penalty() once.

fun main() {
  // 4. Play three rounds. In main(), call playRound() and print the score with a string template. Do this for each round: "After round 1: 17"
}`,
    solutionCode: `var score = 10

fun bonus() {
  score += 5
}

fun penalty() {
  score -= 3
}

fun playRound() {
  bonus()
  bonus()
  penalty()
}

fun main() {
  playRound()
  println("After round 1: $score")
  playRound()
  println("After round 2: $score")
  playRound()
  println("After round 3: $score")
}`,
    sampleInput: 'main()',
    expectedOutput: 'After round 1: 17\nAfter round 2: 24\nAfter round 3: 31',
    testCase: { call: '', expected: 'After round 1: 17\nAfter round 2: 24\nAfter round 3: 31' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'score', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'After round 1: 27\nAfter round 2: 34\nAfter round 3: 41',
    },
  },

  // ---------------------------------------------------- function parameters
  {
    id: 'world-5-practice-writerun-trip-planner',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Write one function with three parameters and call it twice, using computed values as arguments.',
    conceptTags: ['lesson:parameters', 'function-parameters', 'arguments', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Trip Planner',
    goal:
      'A travel agency prices trips using the traveler\'s name, number of days and daily rate. Write one function that prints a trip and its total cost. Use it for two travelers with different plans.',
    description:
      '1. **Write `printTrip`.** Create `fun printTrip(name: String, days: Int, rate: Int)` above `main()`. It prints one line with a string template: the name, the days, the rate and the cost (`days` times `rate`):\n"Ana: 3 days at 40 = 120"\n\n' +
              '2. **Print the first trip.** In `main()`, call `printTrip` for "Ana" with `days` and `rate`.\n\n' +
              '3. **Print the second trip.** Call `printTrip` for "Ben". Pass `days + 2` as the days and `rate + 10` as the rate.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `printTrip`.** Use three parameters and print the cost.',
          '2. **Print the first trip.** Use `days` and `rate`.',
          '3. **Print the second trip.** Pass computed values.',
        ],
        comments: [
          '// 1. Write printTrip. Use three parameters and print the cost.',
          '// 2. Print the first trip. Use days and rate.',
          '// 3. Print the second trip. Pass computed values.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `printTrip`.**',
          '2. **Print the first trip.**',
          '3. **Print the second trip.**',
        ],
        comments: [
          '// 1. Write printTrip.',
          '// 2. Print the first trip.',
          '// 3. Print the second trip.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TripPlanner.kt',
    initialCode: `// 1. Write printTrip. Create fun printTrip(name: String, days: Int, rate: Int) above main(). It prints one line with a string template: the name, the days, the rate and the cost (days times rate): "Ana: 3 days at 40 = 120"

fun main() {
  val days = 3
  val rate = 40

  // 2. Print the first trip. In main(), call printTrip for "Ana" with days and rate.

  // 3. Print the second trip. Call printTrip for "Ben". Pass days + 2 as the days and rate + 10 as the rate.
}`,
    solutionCode: `fun printTrip(name: String, days: Int, rate: Int) {
  println("$name: $days days at $rate = \${days * rate}")
}

fun main() {
  val days = 3
  val rate = 40
  printTrip("Ana", days, rate)
  printTrip("Ben", days + 2, rate + 10)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 3 days at 40 = 120\nBen: 5 days at 50 = 250',
    testCase: { call: '', expected: 'Ana: 3 days at 40 = 120\nBen: 5 days at 50 = 250' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'days', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Ana: 4 days at 40 = 160\nBen: 6 days at 50 = 300',
    },
  },
  {
    id: 'world-5-practice-writerun-fence-planner',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Pass calculated values, including Int division and remainder, as function arguments.',
    conceptTags: ['lesson:parameters', 'function-parameters', 'arguments', 'int-division', 'remainder'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Fence Planner',
    goal:
      'A landscaper shows garden measurements in the same format: a label, a colon and a number. Write one function to show them. Use it for the width, perimeter, posts needed (one every 4 metres) and leftover length. Find each value when you call the function.',
    description:
      '1. **Write `report`.** Create `fun report(label: String, value: Int)` above `main()`. It prints the label, a colon and a space, then the value.\n\n' +
              '2. **Report the width.** In `main()`, call `report` with the width.\n\n' +
              '3. **Report the perimeter.** The perimeter is twice the sum of `width` and `height`. Pass that expression directly as the argument.\n\n' +
              '4. **Report the posts needed.** Divide the perimeter by `postGap`. Use Int division, which rounds down. Pass the expression directly as the argument.\n\n' +
              '5. **Report the metres left over.** Use `%` to get the remainder when the perimeter is divided by `postGap`.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `report`.** Take a label and a value.',
          '2. **Report the width.**',
          '3. **Report the perimeter.** Pass the calculation as the argument.',
          '4. **Report the posts needed.** Use Int division.',
          '5. **Report the metres left over.** Use `%`.',
        ],
        comments: [
          '// 1. Write report. Take a label and a value.',
          '// 2. Report the width.',
          '// 3. Report the perimeter. Pass the calculation as the argument.',
          '// 4. Report the posts needed. Use Int division.',
          '// 5. Report the metres left over. Use %.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `report`.**',
          '2. **Report the width.**',
          '3. **Report the perimeter.**',
          '4. **Report the posts needed.**',
          '5. **Report the leftover.**',
        ],
        comments: [
          '// 1. Write report.',
          '// 2. Report the width.',
          '// 3. Report the perimeter.',
          '// 4. Report the posts needed.',
          '// 5. Report the leftover.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FencePlanner.kt',
    initialCode: `// 1. Write report. Create fun report(label: String, value: Int) above main(). It prints the label, a colon and a space, then the value.

fun main() {
  val width = 14
  val height = 9
  val postGap = 4

  // 2. Report the width. In main(), call report with the width.

  // 3. Report the perimeter. The perimeter is twice the sum of width and height. Pass that expression directly as the argument.

  // 4. Report the posts needed. Divide the perimeter by postGap. Use Int division, which rounds down. Pass the expression directly as the argument.

  // 5. Report the metres left over. Use % to get the remainder when the perimeter is divided by postGap.
}`,
    solutionCode: `fun report(label: String, value: Int) {
  println("$label: $value")
}

fun main() {
  val width = 14
  val height = 9
  val postGap = 4
  report("Width", width)
  report("Perimeter", 2 * (width + height))
  report("Posts", 2 * (width + height) / postGap)
  report("Left over", 2 * (width + height) % postGap)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Width: 14\nPerimeter: 46\nPosts: 11\nLeft over: 2',
    testCase: { call: '', expected: 'Width: 14\nPerimeter: 46\nPosts: 11\nLeft over: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'width', originalLiteral: '14', alternateLiteral: '17' }],
      alternateExpectedOutput: 'Width: 17\nPerimeter: 52\nPosts: 13\nLeft over: 0',
    },
  },

  // -------------------------------------------------------- return values
  {
    id: 'world-5-practice-writerun-shipping-quote',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Write two functions that return values, one with an early return, and feed one result into the other.',
    conceptTags: ['lesson:return', 'return-value', 'early-return', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Shipping Quote',
    goal:
      'A shop needs the total price for a 6 kg parcel. Use two small functions. One finds the shipping cost from the weight. The other adds tax to an amount. Combine them with the price of the goods. Print the shipping cost and final total.',
    description:
      '1. **Write `shippingFor`.** Create `fun shippingFor(kg: Int): Int` above `main()`. For 2 kg or less, use an early return of 5. Otherwise, return 5 plus 3 for every kilogram above 2.\n\n' +
              '2. **Write `withTax`.** Create `fun withTax(amount: Int): Int`. It returns the amount plus 10 percent of it. Use Int division, so the fraction is dropped.\n\n' +
              '3. **Find the shipping.** In `main()`, store `shippingFor(weight)` in `val shipping`.\n\n' +
              '4. **Find the total.** Add 20 for the goods to `shipping`. Pass that sum to `withTax` and store the result in `val total`.\n\n' +
              '5. **Print the result.** Use string templates:\n"Shipping: 17 | Total: 40"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `shippingFor`.** Use an early return for light parcels.',
          '2. **Write `withTax`.** Add 10 percent with Int division.',
          '3. **Find the shipping.**',
          '4. **Find the total.** Add the goods price, then add tax.',
          '5. **Print the result.**',
        ],
        comments: [
          '// 1. Write shippingFor. Use an early return for light parcels.',
          '// 2. Write withTax. Add 10 percent with Int division.',
          '// 3. Find the shipping.',
          '// 4. Find the total. Add the goods price, then add tax.',
          '// 5. Print the result.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `shippingFor`.**',
          '2. **Write `withTax`.**',
          '3. **Find the shipping.**',
          '4. **Find the total.**',
          '5. **Print the result.**',
        ],
        comments: [
          '// 1. Write shippingFor.',
          '// 2. Write withTax.',
          '// 3. Find the shipping.',
          '// 4. Find the total.',
          '// 5. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShippingQuote.kt',
    initialCode: `// 1. Write shippingFor. Create fun shippingFor(kg: Int): Int above main(). For 2 kg or less, use an early return of 5. Otherwise, return 5 plus 3 for every kilogram above 2.

// 2. Write withTax. Create fun withTax(amount: Int): Int. It returns the amount plus 10 percent of it. Use Int division, so the fraction is dropped.

fun main() {
  val weight = 6

  // 3. Find the shipping. In main(), store shippingFor(weight) in val shipping.

  // 4. Find the total. Add 20 for the goods to shipping. Pass that sum to withTax and store the result in val total.

  // 5. Print the result. Use string templates: "Shipping: 17 | Total: 40"
}`,
    solutionCode: `fun shippingFor(kg: Int): Int {
  if (kg <= 2) {
    return 5
  }
  return 5 + (kg - 2) * 3
}

fun withTax(amount: Int): Int {
  return amount + amount / 10
}

fun main() {
  val weight = 6
  val shipping = shippingFor(weight)
  val total = withTax(shipping + 20)
  println("Shipping: $shipping | Total: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Shipping: 17 | Total: 40',
    testCase: { call: '', expected: 'Shipping: 17 | Total: 40' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'weight', originalLiteral: '6', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Shipping: 5 | Total: 27',
    },
  },
  {
    id: 'world-5-practice-writerun-grade-book',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Combine three functions that return an Int, a String and a Boolean inside one printing function.',
    conceptTags: ['lesson:return', 'return-value', 'early-return', 'boolean-return', 'string-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Grade Book',
    goal:
      'A teacher needs a report line for each student score. It shows the letter grade, bonus and whether the student passes. Write a small function for each decision. Then write a report function that uses them. Print one line for each of three scores.',
    description:
      '1. **Write `bonus`.** Create `fun bonus(score: Int): Int`. It returns 5 for a score of 90 or more, 3 for 75 or more, and 0 otherwise.\n\n' +
              '2. **Write `letter`.** Create `fun letter(score: Int): String`. It returns "A" for 90 or more, "B" for 80 or more, "C" for 65 or more, and "F" otherwise.\n\n' +
              '3. **Write `isPassing`.** Create `fun isPassing(score: Int): Boolean`. It returns whether the score is at least 60.\n\n' +
              '4. **Write `report`.** Create `fun report(score: Int)`. It prints one line: the score, then the letter of the score PLUS its bonus, then the bonus, then whether the original score is passing:\n"92 -> A | bonus 5 | pass true"\n\n' +
              '5. **Print the three reports.** In `main()`, call `report` for `first`, `second` and `third`.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `bonus`.** Return a bonus based on the score.',
          '2. **Write `letter`.** Return a grade letter.',
          '3. **Write `isPassing`.** Return a Boolean.',
          '4. **Write `report`.** Use the three functions. The letter uses the score plus its bonus.',
          '5. **Print the three reports.**',
        ],
        comments: [
          '// 1. Write bonus. Return a bonus based on the score.',
          '// 2. Write letter. Return a grade letter.',
          '// 3. Write isPassing. Return a Boolean.',
          '// 4. Write report. Use the three functions. The letter uses the score plus its bonus.',
          '// 5. Print the three reports.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `bonus`.**',
          '2. **Write `letter`.**',
          '3. **Write `isPassing`.**',
          '4. **Write `report`.**',
          '5. **Report the three scores.**',
        ],
        comments: [
          '// 1. Write bonus.',
          '// 2. Write letter.',
          '// 3. Write isPassing.',
          '// 4. Write report.',
          '// 5. Report the three scores.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GradeBook.kt',
    initialCode: `// 1. Write bonus. Create fun bonus(score: Int): Int. It returns 5 for a score of 90 or more, 3 for 75 or more, and 0 otherwise.

// 2. Write letter. Create fun letter(score: Int): String. It returns "A" for 90 or more, "B" for 80 or more, "C" for 65 or more, and "F" otherwise.

// 3. Write isPassing. Create fun isPassing(score: Int): Boolean. It returns whether the score is at least 60.

// 4. Write report. Create fun report(score: Int). It prints one line: the score, then the letter of the score PLUS its bonus, then the bonus, then whether the original score is passing: "92 -> A | bonus 5 | pass true"

fun main() {
  val first = 92
  val second = 68
  val third = 55

  // 5. Print the three reports. In main(), call report for first, second and third.
}`,
    solutionCode: `fun bonus(score: Int): Int {
  if (score >= 90) {
    return 5
  }
  if (score >= 75) {
    return 3
  }
  return 0
}

fun letter(score: Int): String {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 65) return "C"
  return "F"
}

fun isPassing(score: Int): Boolean {
  return score >= 60
}

fun report(score: Int) {
  println("$score -> \${letter(score + bonus(score))} | bonus \${bonus(score)} | pass \${isPassing(score)}")
}

fun main() {
  val first = 92
  val second = 68
  val third = 55
  report(first)
  report(second)
  report(third)
}`,
    sampleInput: 'main()',
    expectedOutput: '92 -> A | bonus 5 | pass true\n68 -> C | bonus 0 | pass true\n55 -> F | bonus 0 | pass false',
    testCase: { call: '', expected: '92 -> A | bonus 5 | pass true\n68 -> C | bonus 0 | pass true\n55 -> F | bonus 0 | pass false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'third', originalLiteral: '55', alternateLiteral: '76' }],
      alternateExpectedOutput: '92 -> A | bonus 5 | pass true\n68 -> C | bonus 0 | pass true\n76 -> C | bonus 3 | pass true',
    },
  },

  // ------------------------------------------------------ default parameters
  {
    id: 'world-5-practice-writerun-shipping-label',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Give a label function two default parameters and call it with none, one and both of them supplied.',
    conceptTags: ['lesson:default', 'default-parameters', 'positional-arguments', 'string-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Shipping Label',
    goal:
      'A shipping label has a recipient, city and zip code. Most parcels use the same city and zip. Write a function with default values for the city and zip. Call it three ways: use both defaults, use only the zip default and provide all values.',
    description:
      '1. **Write `label`.** Create `fun label(recipient: String, city: String = "Pune", zip: Int = 411001): String` above `main()`. It returns the recipient, the city and the zip joined with " | ", using a string template:\n"Ana | Pune | 411001"\n\n' +
              '2. **Use both defaults.** In `main()`, print `label(first)`.\n\n' +
              '3. **Use one default.** Print `label("Ben", city)`. Only the zip uses its default.\n\n' +
              '4. **Use no defaults.** Print `label("Cy", "Goa", 403001)`.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `label`.** Give `city` and `zip` default values.',
          '2. **Use both defaults.**',
          '3. **Use one default.**',
          '4. **Use no defaults.**',
        ],
        comments: [
          '// 1. Write label. Give city and zip default values.',
          '// 2. Use both defaults.',
          '// 3. Use one default.',
          '// 4. Use no defaults.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `label`.**',
          '2. **Use both defaults.**',
          '3. **Use one default.**',
          '4. **Use no defaults.**',
        ],
        comments: [
          '// 1. Write label.',
          '// 2. Use both defaults.',
          '// 3. Use one default.',
          '// 4. Use no defaults.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShippingLabel.kt',
    initialCode: `// 1. Write label. Create fun label(recipient: String, city: String = "Pune", zip: Int = 411001): String above main(). It returns the recipient, the city and the zip joined with " | ", using a string template: "Ana | Pune | 411001"

fun main() {
  val first = "Ana"
  val city = "Delhi"

  // 2. Use both defaults. In main(), print label(first).

  // 3. Use one default. Print label("Ben", city). Only the zip uses its default.

  // 4. Use no defaults. Print label("Cy", "Goa", 403001).
}`,
    solutionCode: `fun label(recipient: String, city: String = "Pune", zip: Int = 411001): String {
  return "$recipient | $city | $zip"
}

fun main() {
  val first = "Ana"
  val city = "Delhi"
  println(label(first))
  println(label("Ben", city))
  println(label("Cy", "Goa", 403001))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana | Pune | 411001\nBen | Delhi | 411001\nCy | Goa | 403001',
    testCase: { call: '', expected: 'Ana | Pune | 411001\nBen | Delhi | 411001\nCy | Goa | 403001' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'first', originalLiteral: '"Ana"', alternateLiteral: '"Zed"' },
        { variableName: 'city', originalLiteral: '"Delhi"', alternateLiteral: '"Rome"' },
      ],
      alternateExpectedOutput: 'Zed | Pune | 411001\nBen | Rome | 411001\nCy | Goa | 403001',
    },
  },
  {
    id: 'world-5-practice-writerun-order-total',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Write a price function with three default values and call it in five ways, one of them setting only the shipping by name.',
    conceptTags: ['lesson:default', 'default-parameters', 'named-arguments', 'int-division', 'return-value'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Order Total',
    goal:
      'An order price depends on quantity, discount and shipping. Usually only some values change. Write one function with default values for all three. Call it in five ways to show how the defaults work, including setting only the shipping by name.',
    description:
      '1. **Write `total`.** Create `fun total(price: Int, qty: Int = 1, discountPercent: Int = 0, shipping: Int = 5): Int` above `main()`. It returns the subtotal (`price` times `qty`), minus `discountPercent` percent of the subtotal (Int division), plus `shipping`.\n\n' +
              '2. **Print the plain price.** Call `total(price)` and print it with a string template:\n"Plain: 45"\n\n' +
              '3. **Print the price for three items.** Call `total(price, 3)`:\n"Three: 125"\n\n' +
              '4. **Print the discounted price.** Call `total(price, 3, 10)`:\n"Discounted: 113"\n\n' +
              '5. **Print the price with free shipping.** Call `total(price, 3, 10, 0)`:\n"Free shipping: 108"\n\n' +
              '6. **Set only the shipping.** Call `total` with `shipping = 0` set BY NAME. Leave every other parameter at its default:\n"Single, no fee: 40"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `total`.** Give `qty`, `discountPercent` and `shipping` default values.',
          '2. **Print the plain price.**',
          '3. **Print the price for three items.**',
          '4. **Print the discounted price.**',
          '5. **Print the price with free shipping.**',
          '6. **Set only the shipping.** Use a named argument.',
        ],
        comments: [
          '// 1. Write total. Give qty, discountPercent and shipping default values.',
          '// 2. Print the plain price.',
          '// 3. Print the price for three items.',
          '// 4. Print the discounted price.',
          '// 5. Print the price with free shipping.',
          '// 6. Set only the shipping. Use a named argument.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `total`.**',
          '2. **Print the plain price.**',
          '3. **Print three items.**',
          '4. **Print the discounted price.**',
          '5. **Print with free shipping.**',
          '6. **Set only the shipping.**',
        ],
        comments: [
          '// 1. Write total.',
          '// 2. Print the plain price.',
          '// 3. Print three items.',
          '// 4. Print the discounted price.',
          '// 5. Print with free shipping.',
          '// 6. Set only the shipping.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderTotal.kt',
    initialCode: `// 1. Write total. Create fun total(price: Int, qty: Int = 1, discountPercent: Int = 0, shipping: Int = 5): Int above main(). It returns the subtotal (price times qty), minus discountPercent percent of the subtotal (Int division), plus shipping.

fun main() {
  val price = 40

  // 2. Print the plain price. Call total(price) and print it with a string template: "Plain: 45"

  // 3. Print the price for three items. Call total(price, 3): "Three: 125"

  // 4. Print the discounted price. Call total(price, 3, 10): "Discounted: 113"

  // 5. Print the price with free shipping. Call total(price, 3, 10, 0): "Free shipping: 108"

  // 6. Set only the shipping. Call total with shipping = 0 set BY NAME. Leave every other parameter at its default: "Single, no fee: 40"
}`,
    solutionCode: `fun total(price: Int, qty: Int = 1, discountPercent: Int = 0, shipping: Int = 5): Int {
  val subtotal = price * qty
  return subtotal - subtotal * discountPercent / 100 + shipping
}

fun main() {
  val price = 40
  println("Plain: \${total(price)}")
  println("Three: \${total(price, 3)}")
  println("Discounted: \${total(price, 3, 10)}")
  println("Free shipping: \${total(price, 3, 10, 0)}")
  println("Single, no fee: \${total(price = price, shipping = 0)}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Plain: 45\nThree: 125\nDiscounted: 113\nFree shipping: 108\nSingle, no fee: 40',
    testCase: { call: '', expected: 'Plain: 45\nThree: 125\nDiscounted: 113\nFree shipping: 108\nSingle, no fee: 40' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'price', originalLiteral: '40', alternateLiteral: '55' }],
      alternateExpectedOutput: 'Plain: 60\nThree: 170\nDiscounted: 154\nFree shipping: 149\nSingle, no fee: 55',
    },
  },

  // --------------------------------------------------------- named arguments
  {
    id: 'world-5-practice-writerun-booking',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Call a function with four parameters using named arguments in a different order from the parameters.',
    conceptTags: ['lesson:named', 'named-arguments', 'reordering', 'string-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Booking',
    goal:
      'A hotel booking has four details: guest, nights, breakfast and room type. Write a booking function. Call it twice with every argument passed by name, using a different order each time. This shows that names make the call clear and safe.',
    description:
      '1. **Write `book`.** Create `fun book(guest: String, nights: Int, breakfast: Boolean, roomType: String): String` above `main()`. It returns one line built with a string template, for example:\n"Ana: 2 nights, Sea room, breakfast=true"\n\n' +
              '2. **Call it by name.** In `main()`, print a call that passes every argument BY NAME in this order: `nights = 2`, `guest = guest`, `roomType = "Sea"`, `breakfast = true`.\n\n' +
              '3. **Call it by name in another order.** Print a second call, again by name, in this order: `roomType = "Garden"`, `breakfast = false`, `guest = "Ben"`, `nights = 5`.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `book`.** Use four parameters and a string template.',
          '2. **Call it by name.** Put the arguments in a different order from the parameters.',
          '3. **Call it by name in another order.**',
        ],
        comments: [
          '// 1. Write book. Use four parameters and a string template.',
          '// 2. Call it by name. Put the arguments in a different order from the parameters.',
          '// 3. Call it by name in another order.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `book`.**',
          '2. **Call it by name.**',
          '3. **Call it in another order.**',
        ],
        comments: [
          '// 1. Write book.',
          '// 2. Call it by name.',
          '// 3. Call it in another order.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Booking.kt',
    initialCode: `// 1. Write book. Create fun book(guest: String, nights: Int, breakfast: Boolean, roomType: String): String above main(). It returns one line built with a string template, for example: "Ana: 2 nights, Sea room, breakfast=true"

fun main() {
  val guest = "Ana"

  // 2. Call it by name. In main(), print a call that passes every argument BY NAME in this order: nights = 2, guest = guest, roomType = "Sea", breakfast = true.

  // 3. Call it by name in another order. Print a second call, again by name, in this order: roomType = "Garden", breakfast = false, guest = "Ben", nights = 5.
}`,
    solutionCode: `fun book(guest: String, nights: Int, breakfast: Boolean, roomType: String): String {
  return "$guest: $nights nights, $roomType room, breakfast=$breakfast"
}

fun main() {
  val guest = "Ana"
  println(book(nights = 2, guest = guest, roomType = "Sea", breakfast = true))
  println(book(roomType = "Garden", breakfast = false, guest = "Ben", nights = 5))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 2 nights, Sea room, breakfast=true\nBen: 5 nights, Garden room, breakfast=false',
    testCase: { call: '', expected: 'Ana: 2 nights, Sea room, breakfast=true\nBen: 5 nights, Garden room, breakfast=false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'guest', originalLiteral: '"Ana"', alternateLiteral: '"Zed"' }],
      alternateExpectedOutput: 'Zed: 2 nights, Sea room, breakfast=true\nBen: 5 nights, Garden room, breakfast=false',
    },
  },
  {
    id: 'world-5-practice-writerun-order-options',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Aim at later default values by name while skipping earlier ones, with a fee that depends on two options.',
    conceptTags: ['lesson:named', 'named-arguments', 'default-parameters', 'if-else-expression', 'string-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Order Options',
    goal:
      'A shop order has an item and three optional extras: quantity, gift wrap and a note. Each has a default value, and the cost depends on them. Write the function. Call it four ways using skipped defaults, named arguments and positional arguments. Print each order line.',
    description:
      'The top-level `val unitPrice = 10` is given.\n\n' +
              '1. **Write `order`.** Create `fun order(item: String, qty: Int = 1, gift: Boolean = false, note: String = "none"): String` above `main()`.\n\n' +
              '2. **Find the fee.** Inside it, create `val fee`. It is 3 when `gift` is true (otherwise 0), plus 1 when `note` is anything other than "none" (otherwise 0).\n\n' +
              '3. **Find the cost.** Create `val cost`: `qty` times `unitPrice`, plus `fee`.\n\n' +
              '4. **Return the order line.** Use a string template, for example:\n"Pen x1 gift=false note=none cost=10"\n\n' +
              '5. **Order a pen.** In `main()`, print `order("Pen")`.\n\n' +
              '6. **Add a gift wrap.** Print `order("Pen")` with `gift` set to true BY NAME. This skips `qty`.\n\n' +
              '7. **Order ink with a note.** Print a call with `note = "rush"`, `item = "Ink"` and `qty = 4`, all BY NAME and in that order.\n\n' +
              '8. **Mix positional and named.** Print a call with "Cap", then 2 by position, then `note = "blue"` by name.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `order`.** Give `qty`, `gift` and `note` default values.',
          '2. **Find the fee.** It depends on `gift` and `note`.',
          '3. **Find the cost.**',
          '4. **Return the order line.**',
          '5. **Order a pen.**',
          '6. **Add a gift wrap.** Use a named argument.',
          '7. **Order ink with a note.** Name every argument.',
          '8. **Mix positional and named.**',
        ],
        comments: [
          '// 1. Write order. Give qty, gift and note default values.',
          '// 2. Find the fee. It depends on gift and note.',
          '// 3. Find the cost.',
          '// 4. Return the order line.',
          '// 5. Order a pen.',
          '// 6. Add a gift wrap. Use a named argument.',
          '// 7. Order ink with a note. Name every argument.',
          '// 8. Mix positional and named.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `order`.**',
          '2. **Find the fee.**',
          '3. **Find the cost.**',
          '4. **Return the line.**',
          '5. **Order a pen.**',
          '6. **Add a gift wrap.**',
          '7. **Order ink.**',
          '8. **Mix the argument styles.**',
        ],
        comments: [
          '// 1. Write order.',
          '// 2. Find the fee.',
          '// 3. Find the cost.',
          '// 4. Return the line.',
          '// 5. Order a pen.',
          '// 6. Add a gift wrap.',
          '// 7. Order ink.',
          '// 8. Mix the argument styles.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderOptions.kt',
    initialCode: `val unitPrice = 10

// 1. Write order. Create fun order(item: String, qty: Int = 1, gift: Boolean = false, note: String = "none"): String above main().

// 2. Find the fee. Inside it, create val fee. It is 3 when gift is true (otherwise 0), plus 1 when note is anything other than "none" (otherwise 0).

// 3. Find the cost. Create val cost: qty times unitPrice, plus fee.

// 4. Return the order line. Use a string template, for example: "Pen x1 gift=false note=none cost=10"

fun main() {
  // 5. Order a pen. In main(), print order("Pen").

  // 6. Add a gift wrap. Print order("Pen") with gift set to true BY NAME. This skips qty.

  // 7. Order ink with a note. Print a call with note = "rush", item = "Ink" and qty = 4, all BY NAME and in that order.

  // 8. Mix positional and named. Print a call with "Cap", then 2 by position, then note = "blue" by name.
}`,
    solutionCode: `val unitPrice = 10

fun order(item: String, qty: Int = 1, gift: Boolean = false, note: String = "none"): String {
  val fee = (if (gift) 3 else 0) + (if (note != "none") 1 else 0)
  val cost = qty * unitPrice + fee
  return "$item x$qty gift=$gift note=$note cost=$cost"
}

fun main() {
  println(order("Pen"))
  println(order("Pen", gift = true))
  println(order(note = "rush", item = "Ink", qty = 4))
  println(order("Cap", 2, note = "blue"))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pen x1 gift=false note=none cost=10\nPen x1 gift=true note=none cost=13\nInk x4 gift=false note=rush cost=41\nCap x2 gift=false note=blue cost=21',
    testCase: { call: '', expected: 'Pen x1 gift=false note=none cost=10\nPen x1 gift=true note=none cost=13\nInk x4 gift=false note=rush cost=41\nCap x2 gift=false note=blue cost=21' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'unitPrice', originalLiteral: '10', alternateLiteral: '12' }],
      alternateExpectedOutput: 'Pen x1 gift=false note=none cost=12\nPen x1 gift=true note=none cost=15\nInk x4 gift=false note=rush cost=49\nCap x2 gift=false note=blue cost=25',
    },
  },

  // -------------------------------------------------- single-expression functions
  {
    id: 'world-5-practice-writerun-unit-converters',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Write three one-line functions that return an Int, a Double and a Boolean, and print all three.',
    conceptTags: ['lesson:single-expression', 'single-expression-function', 'double-promotion', 'boolean-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Unit Converters',
    goal:
      'Create quick helpers for Celsius to Fahrenheit, centimeters to meters and a freezing check. Each one is a single expression, so write them as short single-expression functions. Use all three with sample values and print the results.',
    description:
      '1. **Write `celsiusToF`.** Create `fun celsiusToF(c: Int)` with `=` and no braces. It returns `c` times 9, divided by 5, plus 32.\n\n' +
              '2. **Write `cmToMeters`.** Write it the same way. It returns `cm` divided by `100.0`, which is a Double.\n\n' +
              '3. **Write `isFreezing`.** Write it the same way. It returns whether `c` is at most 0.\n\n' +
              '4. **Print the results.** In `main()`, print three lines using string templates:\n"F: 77"\n"Meters: 0.5"\n"Freezing: false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `celsiusToF`.** Use a single expression.',
          '2. **Write `cmToMeters`.** Divide to get a Double.',
          '3. **Write `isFreezing`.** Return a Boolean.',
          '4. **Print the three results.**',
        ],
        comments: [
          '// 1. Write celsiusToF. Use a single expression.',
          '// 2. Write cmToMeters. Divide to get a Double.',
          '// 3. Write isFreezing. Return a Boolean.',
          '// 4. Print the three results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `celsiusToF`.**',
          '2. **Write `cmToMeters`.**',
          '3. **Write `isFreezing`.**',
          '4. **Print the results.**',
        ],
        comments: [
          '// 1. Write celsiusToF.',
          '// 2. Write cmToMeters.',
          '// 3. Write isFreezing.',
          '// 4. Print the results.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'UnitConverters.kt',
    initialCode: `// 1. Write celsiusToF. Create fun celsiusToF(c: Int) with = and no braces. It returns c times 9, divided by 5, plus 32.

// 2. Write cmToMeters. Write it the same way. It returns cm divided by 100.0, which is a Double.

// 3. Write isFreezing. Write it the same way. It returns whether c is at most 0.

fun main() {
  val temp = 25
  val length = 50

  // 4. Print the results. In main(), print three lines using string templates: "F: 77" "Meters: 0.5" "Freezing: false"
}`,
    solutionCode: `fun celsiusToF(c: Int) = c * 9 / 5 + 32
fun cmToMeters(cm: Int) = cm / 100.0
fun isFreezing(c: Int) = c <= 0

fun main() {
  val temp = 25
  val length = 50
  println("F: \${celsiusToF(temp)}")
  println("Meters: \${cmToMeters(length)}")
  println("Freezing: \${isFreezing(temp)}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'F: 77\nMeters: 0.5\nFreezing: false',
    testCase: { call: '', expected: 'F: 77\nMeters: 0.5\nFreezing: false' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'temp', originalLiteral: '25', alternateLiteral: '-5' },
        { variableName: 'length', originalLiteral: '50', alternateLiteral: '37' },
      ],
      alternateExpectedOutput: 'F: 23\nMeters: 0.37\nFreezing: true',
    },
  },
  {
    id: 'world-5-practice-writerun-grade-rules',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Chain four one-line functions, using if expressions and calls to each other, to summarise scores.',
    conceptTags: ['lesson:single-expression', 'single-expression-function', 'if-else-expression', 'function-composition', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Grade Rules',
    goal:
      'A grading tool has small rules for a letter grade, a pass check and a score curve. Write each one as a single-expression function. Then create a summary function that uses them. Print a summary line for three scores.',
    description:
      'Every function below is a single expression written with `=`.\n\n' +
              '1. **Write `label`.** Create `fun label(score: Int)`. It returns "A" for 90 or more, "B" for 75 or more, "C" for 50 or more, and "F" otherwise. Use one chained `if` / `else if` expression.\n\n' +
              '2. **Write `isPass`.** Create `fun isPass(score: Int)`. It returns whether the score is at least 50.\n\n' +
              '3. **Write `curved`.** Create `fun curved(score: Int)`. It returns the score plus 5 when the score is below 95, otherwise 100.\n\n' +
              '4. **Write `summary`.** Create `fun summary(score: Int)`. It returns a String with the ORIGINAL score, the label of the curved score, the curved score, and whether the curved score passes:\n"88 -> A (curved 93, pass true)"\n\n' +
              '5. **Print the summaries.** In `main()`, print `summary` for `first`, `second` and `third`.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `label`.** Use a chained `if` expression.',
          '2. **Write `isPass`.**',
          '3. **Write `curved`.** Add 5 below 95, otherwise 100.',
          '4. **Write `summary`.** Use the other three functions.',
          '5. **Print the summaries.**',
        ],
        comments: [
          '// 1. Write label. Use a chained if expression.',
          '// 2. Write isPass.',
          '// 3. Write curved. Add 5 below 95, otherwise 100.',
          '// 4. Write summary. Use the other three functions.',
          '// 5. Print the summaries.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `label`.**',
          '2. **Write `isPass`.**',
          '3. **Write `curved`.**',
          '4. **Write `summary`.**',
          '5. **Print the summaries.**',
        ],
        comments: [
          '// 1. Write label.',
          '// 2. Write isPass.',
          '// 3. Write curved.',
          '// 4. Write summary.',
          '// 5. Print the summaries.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GradeRules.kt',
    initialCode: `// 1. Write label. Create fun label(score: Int). It returns "A" for 90 or more, "B" for 75 or more, "C" for 50 or more, and "F" otherwise. Use one chained if / else if expression.

// 2. Write isPass. Create fun isPass(score: Int). It returns whether the score is at least 50.

// 3. Write curved. Create fun curved(score: Int). It returns the score plus 5 when the score is below 95, otherwise 100.

// 4. Write summary. Create fun summary(score: Int). It returns a String with the ORIGINAL score, the label of the curved score, the curved score, and whether the curved score passes: "88 -> A (curved 93, pass true)"

fun main() {
  val first = 88
  val second = 72
  val third = 44

  // 5. Print the summaries. In main(), print summary for first, second and third.
}`,
    solutionCode: `fun label(score: Int) = if (score >= 90) "A" else if (score >= 75) "B" else if (score >= 50) "C" else "F"
fun isPass(score: Int) = score >= 50
fun curved(score: Int) = if (score < 95) score + 5 else 100
fun summary(score: Int) = "$score -> \${label(curved(score))} (curved \${curved(score)}, pass \${isPass(curved(score))})"

fun main() {
  val first = 88
  val second = 72
  val third = 44
  println(summary(first))
  println(summary(second))
  println(summary(third))
}`,
    sampleInput: 'main()',
    expectedOutput: '88 -> A (curved 93, pass true)\n72 -> B (curved 77, pass true)\n44 -> F (curved 49, pass false)',
    testCase: { call: '', expected: '88 -> A (curved 93, pass true)\n72 -> B (curved 77, pass true)\n44 -> F (curved 49, pass false)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'third', originalLiteral: '44', alternateLiteral: '47' }],
      alternateExpectedOutput: '88 -> A (curved 93, pass true)\n72 -> B (curved 77, pass true)\n47 -> C (curved 52, pass true)',
    },
  },

  // ---------------------------------------------------------- local functions
  {
    id: 'world-5-practice-writerun-receipt-helpers',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Write two local functions inside main, one using an outer val and one calling the other.',
    conceptTags: ['lesson:local', 'local-function', 'closure', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Receipt Helpers',
    goal:
      'A cafe receipt uses two helpers that are needed only inside this program. One adds tax to a price. The other uses it to make a receipt line. Define both inside main so they stay private to it. Then print a line for three items.',
    description:
      'Write everything inside `main()`.\n\n' +
              '1. **Write the local `withTax` function.** Use `=` and no braces. It returns `price` plus `taxPercent` percent of `price`. Use Int division.\n\n' +
              '2. **Write the local `line` function.** Write it below `withTax`. It returns the name, a colon and a space, then `withTax(price)`. Use a string template.\n\n' +
              '3. **Print three lines.** Print `line` for "Coffee" at 30, "Cake" at 45 and "Tea" at 25.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the local `withTax` function.** Add `taxPercent` percent.',
          '2. **Write the local `line` function.** Use `withTax`.',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the local withTax function. Add taxPercent percent.',
          '// 2. Write the local line function. Use withTax.',
          '// 3. Print three lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write local `withTax`.**',
          '2. **Write local `line`.**',
          '3. **Print the lines.**',
        ],
        comments: [
          '// 1. Write local withTax.',
          '// 2. Write local line.',
          '// 3. Print the lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReceiptHelpers.kt',
    initialCode: `fun main() {
  val taxPercent = 10

  // 1. Write the local withTax function. Use = and no braces. It returns price plus taxPercent percent of price. Use Int division.

  // 2. Write the local line function. Write it below withTax. It returns the name, a colon and a space, then withTax(price). Use a string template.

  // 3. Print three lines. Print line for "Coffee" at 30, "Cake" at 45 and "Tea" at 25.
}`,
    solutionCode: `fun main() {
  val taxPercent = 10

  fun withTax(price: Int) = price + price * taxPercent / 100
  fun line(name: String, price: Int) = "$name: \${withTax(price)}"

  println(line("Coffee", 30))
  println(line("Cake", 45))
  println(line("Tea", 25))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Coffee: 33\nCake: 49\nTea: 27',
    testCase: { call: '', expected: 'Coffee: 33\nCake: 49\nTea: 27' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'taxPercent', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Coffee: 36\nCake: 54\nTea: 30',
    },
  },
  {
    id: 'world-5-practice-writerun-scoreboard',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Let local functions update captured variables and call each other, then report an average.',
    conceptTags: ['lesson:local', 'local-function', 'closure', 'captured-state', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Scoreboard',
    goal:
      'A scoreboard keeps a total score and a round count. Use small helper functions inside main to record points, play a bonus round and find the average. Play a few rounds. Then print the rounds, total and average on one line.',
    description:
      'Write everything inside `main()`.\n\n' +
              '1. **Write the local `record` function.** Create `fun record(points: Int)` inside `main()`. It adds `points` to `total`, then increases `rounds` by 1.\n\n' +
              '2. **Write the local `bonusRound` function.** It calls `record` twice: first with 10 points, then with 20 points.\n\n' +
              '3. **Write the local `average` function.** Use `=` and no braces. It returns `total` divided by `rounds` (Int division).\n\n' +
              '4. **Play the rounds.** Record `firstScore`, then play the bonus round, then record 7 points.\n\n' +
              '5. **Print the result.** Use string templates, and call `average()` inside the template:\n"Rounds: 4 | Total: 42 | Average: 10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the local `record` function.** Update `total` and `rounds`.',
          '2. **Write the local `bonusRound` function.** Call `record` twice.',
          '3. **Write the local `average` function.** Use Int division.',
          '4. **Play the rounds.**',
          '5. **Print the result.** Call `average()` in the template.',
        ],
        comments: [
          '// 1. Write the local record function. Update total and rounds.',
          '// 2. Write the local bonusRound function. Call record twice.',
          '// 3. Write the local average function. Use Int division.',
          '// 4. Play the rounds.',
          '// 5. Print the result. Call average() in the template.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write local `record`.**',
          '2. **Write local `bonusRound`.**',
          '3. **Write local `average`.**',
          '4. **Play the rounds.**',
          '5. **Print the result.**',
        ],
        comments: [
          '// 1. Write local record.',
          '// 2. Write local bonusRound.',
          '// 3. Write local average.',
          '// 4. Play the rounds.',
          '// 5. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Scoreboard.kt',
    initialCode: `fun main() {
  var total = 0
  var rounds = 0
  val firstScore = 5

  // 1. Write the local record function. Create fun record(points: Int) inside main(). It adds points to total, then increases rounds by 1.

  // 2. Write the local bonusRound function. It calls record twice: first with 10 points, then with 20 points.

  // 3. Write the local average function. Use = and no braces. It returns total divided by rounds (Int division).

  // 4. Play the rounds. Record firstScore, then play the bonus round, then record 7 points.

  // 5. Print the result. Use string templates, and call average() inside the template: "Rounds: 4 | Total: 42 | Average: 10"
}`,
    solutionCode: `fun main() {
  var total = 0
  var rounds = 0
  val firstScore = 5

  fun record(points: Int) {
    total += points
    rounds++
  }

  fun bonusRound() {
    record(10)
    record(20)
  }

  fun average() = total / rounds

  record(firstScore)
  bonusRound()
  record(7)
  println("Rounds: $rounds | Total: $total | Average: \${average()}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Rounds: 4 | Total: 42 | Average: 10',
    testCase: { call: '', expected: 'Rounds: 4 | Total: 42 | Average: 10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'firstScore', originalLiteral: '5', alternateLiteral: '9' }],
      alternateExpectedOutput: 'Rounds: 4 | Total: 46 | Average: 11',
    },
  },

  // ------------------------------------------------------------------ vararg
  {
    id: 'world-5-practice-writerun-score-summary',
    worldId: 'world-5',
    difficulty: 'medium',
    summary: 'Summarise any number of scores with a vararg function, including one score and none at all.',
    conceptTags: ['lesson:vararg', 'vararg', 'for-loop', 'accumulator', 'string-return'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Score Summary',
    goal:
      'A scoring tool must work with any number of scores: three, one or none. Write a function that accepts a variable number of scores and returns the count, total and best score. Call it with three different amounts.',
    description:
      '1. **Write `summary`.** Create `fun summary(vararg scores: Int): String` above `main()`.\n\n' +
              '2. **Total and compare the scores.** Inside it, loop over `scores`. Keep `var total` for the sum. Keep `var best` for the largest value, and start it at 0.\n\n' +
              '3. **Return the text.** Return a String with the number of scores (`scores.size`), the total and the best. Use a string template:\n"n=3 total=16 best=9"\n\n' +
              '4. **Call it three times.** In `main()`, print `summary(a, 9, 4)`, then `summary(7)`, then `summary()` with no arguments.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `summary`.** Use a `vararg` parameter.',
          '2. **Total and compare the scores.**',
          '3. **Return the text.** Use `scores.size`.',
          '4. **Call it three times.** Use a different number of arguments each time.',
        ],
        comments: [
          '// 1. Write summary. Use a vararg parameter.',
          '// 2. Total and compare the scores.',
          '// 3. Return the text. Use scores.size.',
          '// 4. Call it three times. Use a different number of arguments each time.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `summary`.**',
          '2. **Total and compare.**',
          '3. **Return the text.**',
          '4. **Call it three times.**',
        ],
        comments: [
          '// 1. Write summary.',
          '// 2. Total and compare.',
          '// 3. Return the text.',
          '// 4. Call it three times.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScoreSummary.kt',
    initialCode: `// 1. Write summary. Create fun summary(vararg scores: Int): String above main().

// 2. Total and compare the scores. Inside it, loop over scores. Keep var total for the sum. Keep var best for the largest value, and start it at 0.

// 3. Return the text. Return a String with the number of scores (scores.size), the total and the best. Use a string template: "n=3 total=16 best=9"

fun main() {
  val a = 3

  // 4. Call it three times. In main(), print summary(a, 9, 4), then summary(7), then summary() with no arguments.
}`,
    solutionCode: `fun summary(vararg scores: Int): String {
  var total = 0
  var best = 0
  for (s in scores) {
    total += s
    if (s > best) {
      best = s
    }
  }
  return "n=\${scores.size} total=$total best=$best"
}

fun main() {
  val a = 3
  println(summary(a, 9, 4))
  println(summary(7))
  println(summary())
}`,
    sampleInput: 'main()',
    expectedOutput: 'n=3 total=16 best=9\nn=1 total=7 best=7\nn=0 total=0 best=0',
    testCase: { call: '', expected: 'n=3 total=16 best=9\nn=1 total=7 best=7\nn=0 total=0 best=0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'a', originalLiteral: '3', alternateLiteral: '12' }],
      alternateExpectedOutput: 'n=3 total=25 best=12\nn=1 total=7 best=7\nn=0 total=0 best=0',
    },
  },
  {
    id: 'world-5-practice-writerun-report-builder',
    worldId: 'world-5',
    difficulty: 'hard',
    summary: 'Combine a fixed parameter, a threshold and a vararg, handle the empty case and format a Double average.',
    conceptTags: ['lesson:vararg', 'vararg', 'early-return', 'double-promotion', 'for-loop'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Report Builder',
    goal:
      'A weather report has a label, a threshold and any number of readings. Show the number of readings, their sum, how many are above the threshold and the average as a decimal. If there are no readings, say there is no data.',
    description:
      '1. **Write `report`.** Create `fun report(label: String, threshold: Int, vararg values: Int): String` above `main()`.\n\n' +
              '2. **Handle the empty case.** If no values were passed, return the label followed by ": no data" right away (an early return).\n\n' +
              '3. **Add up and count.** Otherwise, loop over `values`. Add each one to `var sum`. Count how many are strictly above `threshold` in `var above`.\n\n' +
              '4. **Find the average.** Create `val average`: the sum divided by the number of values, as a Double. Convert before dividing.\n\n' +
              '5. **Return the line.** Use a string template:\n"Temps: n=4 sum=84 above=2 avg=21.0"\n\n' +
              '6. **Print both reports.** In `main()`, print `report("Temps", limit, first, 22, 25, 19)`, then `report("Empty", limit)` with no values.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `report`.** Use a `vararg` parameter.',
          '2. **Handle the empty case.** Use an early return.',
          '3. **Add up and count.** Count the values above `threshold`.',
          '4. **Find the average.** Make it a Double.',
          '5. **Return the line.**',
          '6. **Print both reports.**',
        ],
        comments: [
          '// 1. Write report. Use a vararg parameter.',
          '// 2. Handle the empty case. Use an early return.',
          '// 3. Add up and count. Count the values above threshold.',
          '// 4. Find the average. Make it a Double.',
          '// 5. Return the line.',
          '// 6. Print both reports.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `report`.**',
          '2. **Handle the empty case.**',
          '3. **Add up and count.**',
          '4. **Find the average.**',
          '5. **Return the line.**',
          '6. **Print both reports.**',
        ],
        comments: [
          '// 1. Write report.',
          '// 2. Handle the empty case.',
          '// 3. Add up and count.',
          '// 4. Find the average.',
          '// 5. Return the line.',
          '// 6. Print both reports.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReportBuilder.kt',
    initialCode: `// 1. Write report. Create fun report(label: String, threshold: Int, vararg values: Int): String above main().

// 2. Handle the empty case. If no values were passed, return the label followed by ": no data" right away (an early return).

// 3. Add up and count. Otherwise, loop over values. Add each one to var sum. Count how many are strictly above threshold in var above.

// 4. Find the average. Create val average: the sum divided by the number of values, as a Double. Convert before dividing.

// 5. Return the line. Use a string template: "Temps: n=4 sum=84 above=2 avg=21.0"

fun main() {
  val limit = 20
  val first = 18

  // 6. Print both reports. In main(), print report("Temps", limit, first, 22, 25, 19), then report("Empty", limit) with no values.
}`,
    solutionCode: `fun report(label: String, threshold: Int, vararg values: Int): String {
  if (values.size == 0) {
    return "$label: no data"
  }
  var sum = 0
  var above = 0
  for (v in values) {
    sum += v
    if (v > threshold) {
      above++
    }
  }
  val average = sum.toDouble() / values.size
  return "$label: n=\${values.size} sum=$sum above=$above avg=$average"
}

fun main() {
  val limit = 20
  val first = 18
  println(report("Temps", limit, first, 22, 25, 19))
  println(report("Empty", limit))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Temps: n=4 sum=84 above=2 avg=21.0\nEmpty: no data',
    testCase: { call: '', expected: 'Temps: n=4 sum=84 above=2 avg=21.0\nEmpty: no data' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'limit', originalLiteral: '20', alternateLiteral: '23' },
        { variableName: 'first', originalLiteral: '18', alternateLiteral: '30' },
      ],
      alternateExpectedOutput: 'Temps: n=4 sum=96 above=2 avg=24.0\nEmpty: no data',
    },
  },
];

export const WORLD_5_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // defining functions
  {
    id: 'world-5-practice-debug-call-order',
    worldId: 'world-5',
    conceptTags: ['lesson:defining', 'function-call', 'statement-order'],
    summary: 'Three correct functions are called in the wrong order, so the steps print out of sequence.',
    title: 'Fix the Call Order',
    subtitle: 'The program should print Setup, then Run, then Cleanup, but the lines come out in a different order.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: functions called in the wrong order',
    brokenCode: `fun setup() {
  println("Setup")
}

fun execute() {
  println("Run")
}

fun cleanup() {
  println("Cleanup")
}

fun main() {
  execute()
  setup()
  cleanup()
}`,
    fixedCode: `fun setup() {
  println("Setup")
}

fun execute() {
  println("Run")
}

fun cleanup() {
  println("Cleanup")
}

fun main() {
  setup()
  execute()
  cleanup()
}`,
    expectedOutput: 'Setup\nRun\nCleanup',
    hints: [
              'Each function prints the right text, but the lines are in the wrong order. Where is the order decided?',
              'A function runs where it is called. The order of the lines follows the order of the calls in `main()`, not the order the functions are written in the file.',
              'Change the calls in `main()` so the steps run in the right order: setup, main step, cleanup.',
            ],
    explanation:
      'Writing functions in a certain order does not run them. A function runs where it is called, so `main()` controls the order of the output. Calling `setup()`, `execute()` and `cleanup()` in that order prints Setup, Run, Cleanup.',
  },

  // parameters
  {
    id: 'world-5-practice-debug-argument-order',
    worldId: 'world-5',
    conceptTags: ['lesson:parameters', 'arguments', 'type-mismatch'],
    summary: 'The arguments are passed in the opposite order to the parameters, so the types do not match.',
    title: 'Fix the Argument Order',
    subtitle: 'The program should print "Rex is 3 years old", but it does not compile. The call to `describe` has a type error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Type Error: arguments in the wrong order',
    brokenCode: `fun describe(age: Int, name: String) {
  println("$name is $age years old")
}

fun main() {
  describe("Rex", 3)
}`,
    fixedCode: `fun describe(age: Int, name: String) {
  println("$name is $age years old")
}

fun main() {
  describe(3, "Rex")
}`,
    expectedOutput: 'Rex is 3 years old',
    hints: [
              'The compiler reports a type mismatch on the call. Compare the call with the function header.',
              'Arguments are matched to parameters by position. What type does the first parameter expect, and what is passed first?',
              'Pass the arguments in the same order as the parameters.',
            ],
    explanation:
      'Arguments are matched to parameters by position. `describe` expects an Int first (`age`) and a String second (`name`), but the call passed "Rex" first, and a String cannot be an Int. Passing `3` first and "Rex" second matches the parameter order.',
  },

  // return values
  {
    id: 'world-5-practice-debug-missing-return',
    worldId: 'world-5',
    conceptTags: ['lesson:return', 'return-value', 'compile-error'],
    summary: 'A function with a return type prints its result instead of returning it.',
    title: 'Fix the Missing Return',
    subtitle: 'The program should print "Double: 14", but it does not compile. `double` says it returns an Int, but it never returns a value.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'syntax',
    bugLabel: 'Compile Error: a return expression is required',
    brokenCode: `fun double(n: Int): Int {
  println(n * 2)
}

fun main() {
  println("Double: \${double(7)}")
}`,
    fixedCode: `fun double(n: Int): Int {
  return n * 2
}

fun main() {
  println("Double: \${double(7)}")
}`,
    expectedOutput: 'Double: 14',
    hints: [
              'The compiler complains about the body of `double`. What does the function header promise?',
              '`: Int` says the function gives back an Int. Does the body ever send a value back to its caller?',
              'Make the function return the value instead of printing it.',
            ],
    explanation:
      'A function with a return type must send a value back with `return`. Printing shows the number on the screen, but it gives nothing back to the caller, so the compiler rejects the body. `return n * 2` hands 14 to the caller, and `main` prints it inside the template.',
  },

  // default parameters
  {
    id: 'world-5-practice-debug-positional-override',
    worldId: 'world-5',
    conceptTags: ['lesson:default', 'default-parameters', 'named-arguments', 'type-mismatch'],
    summary: 'A positional argument lands in the first default parameter instead of the intended later one.',
    title: 'Fix the Positional Override',
    subtitle: 'The program should print "Hi (size 12, bold true)", but it does not compile. The `true` goes to the wrong parameter.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Type Error: positional argument fills the wrong parameter',
    brokenCode: `fun tag(text: String, size: Int = 12, bold: Boolean = false) {
  println("$text (size $size, bold $bold)")
}

fun main() {
  tag("Hi", true)
}`,
    fixedCode: `fun tag(text: String, size: Int = 12, bold: Boolean = false) {
  println("$text (size $size, bold $bold)")
}

fun main() {
  tag("Hi", bold = true)
}`,
    expectedOutput: 'Hi (size 12, bold true)',
    hints: [
              'The compiler reports a type mismatch. Which parameter receives the `true`?',
              'Positional arguments fill the parameters from left to right, so the second value goes to `size`, which is an Int. How can you aim a value at `bold` directly?',
              'Use a named argument for `bold`. Then `size` keeps its default.',
            ],
    explanation:
      'Positional arguments fill the parameters from the left, so `true` was aimed at `size` (an Int). To skip a default and set a later parameter, name it: `bold = true`. Then `size` uses its default, 12.',
  },

  // named arguments
  {
    id: 'world-5-practice-debug-swapped-arguments',
    worldId: 'world-5',
    conceptTags: ['lesson:named', 'named-arguments', 'positional-arguments', 'int-division'],
    summary: 'Two Int arguments are passed in the wrong order, and nothing warns about it.',
    title: 'Fix the Swapped Arguments',
    subtitle: 'The program should print "Ratio: 5" (20 divided by 4), but it prints "Ratio: 0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: same-typed arguments swapped',
    brokenCode: `fun ratio(numerator: Int, denominator: Int): Int {
  return numerator / denominator
}

fun main() {
  println("Ratio: \${ratio(4, 20)}")
}`,
    fixedCode: `fun ratio(numerator: Int, denominator: Int): Int {
  return numerator / denominator
}

fun main() {
  println("Ratio: \${ratio(numerator = 20, denominator = 4)}")
}`,
    expectedOutput: 'Ratio: 5',
    hints: [
              'The function is correct and the call compiles, but the answer is wrong. Which number is the numerator?',
              'Both parameters are Ints, so swapped arguments are still legal. Which number should be divided by which?',
              'Name each argument in the call, so each value goes to the right parameter.',
            ],
    explanation:
      'Two Int parameters accept either order without an error, so `ratio(4, 20)` calculated 4 / 20 = 0. Named arguments attach each value to its parameter: `numerator = 20`, `denominator = 4` gives 20 / 4 = 5. They also make the call easy to read.',
  },

  // single-expression functions
  {
    id: 'world-5-practice-debug-discount',
    worldId: 'world-5',
    conceptTags: ['lesson:single-expression', 'single-expression-function', 'precedence'],
    summary: 'A discount function subtracts the percent number instead of the percent of the price.',
    title: 'Fix the Discount',
    subtitle: 'The program should print "Discounted: 45" (10 percent off 50), but it prints "Discounted: 40".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: subtracts the percent value instead of a percentage',
    brokenCode: `fun discounted(price: Int, percent: Int) = price - percent

fun main() {
  println("Discounted: \${discounted(50, 10)}")
}`,
    fixedCode: `fun discounted(price: Int, percent: Int) = price - price * percent / 100

fun main() {
  println("Discounted: \${discounted(50, 10)}")
}`,
    expectedOutput: 'Discounted: 45',
    hints: [
              'The result is 40. What does the expression subtract from the price?',
              '`percent` is 10, which means 10 percent of the price, not 10 units. What is 10 percent of 50?',
              'Subtract the percent of the price, not the percent number.',
            ],
    explanation:
      '`price - percent` subtracted the number 10 from 50. A percentage is a share of the price: `price * percent / 100` is 50 * 10 / 100 = 5, so the discounted price is 50 - 5 = 45.',
  },

  // local functions
  {
    id: 'world-5-practice-debug-local-order',
    worldId: 'world-5',
    conceptTags: ['lesson:local', 'local-function', 'declaration-order'],
    summary: 'A local function is called before the line that declares it.',
    title: 'Fix the Local Order',
    subtitle: 'The program should print "Doubled: 8", but it does not compile. `twice` is used on a line above its own declaration.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'syntax',
    bugLabel: 'Compile Error: local function used before its declaration',
    brokenCode: `fun main() {
  val doubled = twice(4)

  fun twice(n: Int) = n * 2

  println("Doubled: $doubled")
}`,
    fixedCode: `fun main() {
  fun twice(n: Int) = n * 2

  val doubled = twice(4)

  println("Doubled: $doubled")
}`,
    expectedOutput: 'Doubled: 8',
    hints: [
              'The compiler says it cannot resolve `twice`. The function exists, so look at where the call is compared with the declaration.',
              'A function declared inside another function exists only from its declaration line onward. Where is `twice` declared compared with its first use?',
              'Move the declaration above the line that uses it.',
            ],
    explanation:
      'Unlike a top-level function, a local function can only be used after its declaration. Calling `twice` on the line above it is an unresolved reference. If you declare it first, it is available: `twice(4)` returns 8.',
  },

  // vararg
  {
    id: 'world-5-practice-debug-vararg-total',
    worldId: 'world-5',
    conceptTags: ['lesson:vararg', 'vararg', 'for-loop', 'accumulator'],
    summary: 'A vararg total returns only the last value because it assigns instead of adding.',
    title: 'Fix the Vararg Total',
    subtitle: 'The program should print "Total: 15", but it prints "Total: 6".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: = used where += is needed',
    brokenCode: `fun total(vararg nums: Int): Int {
  var sum = 0
  for (n in nums) {
    sum = n
  }
  return sum
}

fun main() {
  println("Total: \${total(4, 5, 6)}")
}`,
    fixedCode: `fun total(vararg nums: Int): Int {
  var sum = 0
  for (n in nums) {
    sum += n
  }
  return sum
}

fun main() {
  println("Total: \${total(4, 5, 6)}")
}`,
    expectedOutput: 'Total: 15',
    hints: [
              'The total is the same as the last number passed in. What does each pass of the loop do to `sum`?',
              '`sum = n` replaces the running total each time. Which operator adds to a value instead?',
              'Make each pass add `n` to the running total.',
            ],
    explanation:
      '`sum = n` replaced the running total on every pass, so after the loop it held only the last value, 6. `sum += n` adds each value to what is already there: 4 + 5 + 6 = 15.',
  },
];
