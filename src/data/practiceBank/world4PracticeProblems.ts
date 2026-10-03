import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 4 -- Loop Master (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-6 dependent steps, the loop form is named in the step.
//   hard   -- an anticipated trap (Int truncation compounding inside a loop,
//             a step that overshoots, break/continue combined, break leaving only
//             the inner loop) and multi-line output; the step names the quantity
//             rather than the exact construct.
//
// Every expected value was derived from Kotlin's rules with an independent
// reference (plain JavaScript loops), not copied from the simulator, and is
// re-verified by scripts/test-practice-bank.ts. The Boss is not in the tab.

export const WORLD_4_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // -------------------------------------------------------------------- for
  {
    id: 'world-4-practice-writerun-savings-ladder',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Add a weekly deposit in a for loop, print the balance each week, then print the total saved.',
    conceptTags: ['lesson:for', 'for-loop', 'accumulator', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Savings Ladder',
    goal:
      'You start with 100 and save 50 every week for 4 weeks. Show the balance after each week. At the end, show how much you saved in total.',
    description:
      '1. **Add the deposit every week.** Use a `for` loop over `week` in `1..weeks`. Inside the loop, add `weeklyDeposit` to `balance` with `+=`.\n\n' +
              '2. **Print the balance every week.** Still inside the loop, use a string template:\n"Week 1: 150"\n\n' +
              '3. **Print the total saved.** After the loop, print `balance` minus `start`:\n"Total saved: 200"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the deposit every week.** Use a `for` loop over the weeks.',
          '2. **Print the balance every week.** Use a string template inside the loop.',
          '3. **Print the total saved.** Use `balance` and `start`.',
        ],
        comments: [
          '// 1. Add the deposit every week. Use a for loop over the weeks.',
          '// 2. Print the balance every week. Use a string template inside the loop.',
          '// 3. Print the total saved. Use balance and start.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the deposit every week.**',
          '2. **Print the balance every week.**',
          '3. **Print the total saved.**',
        ],
        comments: [
          '// 1. Add the deposit every week.',
          '// 2. Print the balance every week.',
          '// 3. Print the total saved.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SavingsLadder.kt',
    initialCode: `fun main() {
  val start = 100
  var balance = start
  val weeks = 4
  val weeklyDeposit = 50

  // 1. Add the deposit every week. Use a for loop over week in 1..weeks. Inside the loop, add weeklyDeposit to balance with +=.

  // 2. Print the balance every week. Still inside the loop, use a string template: "Week 1: 150"

  // 3. Print the total saved. After the loop, print balance minus start: "Total saved: 200"
}`,
    solutionCode: `fun main() {
  val start = 100
  var balance = start
  val weeks = 4
  val weeklyDeposit = 50

  for (week in 1..weeks) {
    balance += weeklyDeposit
    println("Week $week: $balance")
  }

  println("Total saved: \${balance - start}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Week 1: 150\nWeek 2: 200\nWeek 3: 250\nWeek 4: 300\nTotal saved: 200',
    testCase: { call: '', expected: 'Week 1: 150\nWeek 2: 200\nWeek 3: 250\nWeek 4: 300\nTotal saved: 200' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'weeks', originalLiteral: '4', alternateLiteral: '3' },
        { variableName: 'weeklyDeposit', originalLiteral: '50', alternateLiteral: '75' },
      ],
      alternateExpectedOutput: 'Week 1: 175\nWeek 2: 250\nWeek 3: 325\nTotal saved: 225',
    },
  },
  {
    id: 'world-4-practice-writerun-growth-table',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Add yearly interest to a balance for five years. Each year the interest is added before the next year starts.',
    conceptTags: ['lesson:for', 'for-loop', 'accumulator', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Growth Table',
    goal:
      'You invest 1000 and earn 10 percent interest every year. The interest is added to your balance. This means you also earn interest on earlier interest. Show all 5 years. Then show the final balance and total interest.',
    description:
      'All amounts are whole numbers.\n\n' +
              '1. **Find the interest for the year.** Loop over `year` in `1..years`. In each pass, create `val interest`. It is the current `balance` times `ratePercent`, divided by 100.\n\n' +
              '2. **Update the balance.** Add `interest` to `balance`. Also add `interest` to `totalInterest`.\n\n' +
              '3. **Print one line for each year.** Use string templates:\n"Year 1: +100 = 1100"\n\n' +
              '4. **Print the summary.** After the loop, print two lines:\n"Final balance: 1610"\n"Total interest: 610"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the interest for the year.** Use `balance` and `ratePercent`.',
          '2. **Update the balance.** Add the interest to `balance` and to `totalInterest`.',
          '3. **Print one line for each year.** Use string templates.',
          '4. **Print the summary.** Show the final balance and the total interest.',
        ],
        comments: [
          '// 1. Find the interest for the year. Use balance and ratePercent.',
          '// 2. Update the balance. Add the interest to balance and to totalInterest.',
          '// 3. Print one line for each year. Use string templates.',
          '// 4. Print the summary. Show the final balance and the total interest.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the interest for the year.**',
          '2. **Update the balance.**',
          '3. **Print each year.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Find the interest for the year.',
          '// 2. Update the balance.',
          '// 3. Print each year.',
          '// 4. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GrowthTable.kt',
    initialCode: `fun main() {
  var balance = 1000
  val ratePercent = 10
  val years = 5
  var totalInterest = 0

  // 1. Find the interest for the year. Loop over year in 1..years. In each pass, create val interest. It is the current balance times ratePercent, divided by 100.

  // 2. Update the balance. Add interest to balance. Also add interest to totalInterest.

  // 3. Print one line for each year. Use string templates: "Year 1: +100 = 1100"

  // 4. Print the summary. After the loop, print two lines: "Final balance: 1610" "Total interest: 610"
}`,
    solutionCode: `fun main() {
  var balance = 1000
  val ratePercent = 10
  val years = 5
  var totalInterest = 0

  for (year in 1..years) {
    val interest = balance * ratePercent / 100
    balance += interest
    totalInterest += interest
    println("Year $year: +$interest = $balance")
  }

  println("Final balance: $balance")
  println("Total interest: $totalInterest")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Year 1: +100 = 1100\nYear 2: +110 = 1210\nYear 3: +121 = 1331\nYear 4: +133 = 1464\nYear 5: +146 = 1610\nFinal balance: 1610\nTotal interest: 610',
    testCase: { call: '', expected: 'Year 1: +100 = 1100\nYear 2: +110 = 1210\nYear 3: +121 = 1331\nYear 4: +133 = 1464\nYear 5: +146 = 1610\nFinal balance: 1610\nTotal interest: 610' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'ratePercent', originalLiteral: '10', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Year 1: +50 = 1050\nYear 2: +52 = 1102\nYear 3: +55 = 1157\nYear 4: +57 = 1214\nYear 5: +60 = 1274\nFinal balance: 1274\nTotal interest: 274',
    },
  },

  // ------------------------------------------------------------------ while
  {
    id: 'world-4-practice-writerun-ticket-counter',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Sell tickets in bundles with a while loop, then report the sales and any tickets left.',
    conceptTags: ['lesson:while', 'while-loop', 'compound-assignment', 'if-statement'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Ticket Counter',
    goal:
      'A box office has 11 tickets and sells them in bundles of 3. It keeps selling while there are enough tickets for a full bundle. Show how many bundles were sold and how many tickets are left.',
    description:
      '1. **Keep selling while a full bundle is left.** Use a `while` loop that runs as long as `ticketsLeft` is at least `batch`.\n\n' +
              '2. **Record each sale.** Inside the loop, subtract `batch` from `ticketsLeft` with `-=`. Then add 1 to `sales` with `++`.\n\n' +
              '3. **Print the summary.** After the loop, use string templates:\n"Sales: 3 | Left: 2"\n\n' +
              '4. **Print the leftover tickets, but only if there are some.** Use an `if`: when `ticketsLeft` is above 0, print:\n"Leftover tickets: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Keep selling while a full bundle is left.** Use a `while` loop.',
          '2. **Record each sale.** Update `ticketsLeft` and `sales`.',
          '3. **Print the summary.** Use string templates.',
          '4. **Print the leftover tickets, but only if there are some.**',
        ],
        comments: [
          '// 1. Keep selling while a full bundle is left. Use a while loop.',
          '// 2. Record each sale. Update ticketsLeft and sales.',
          '// 3. Print the summary. Use string templates.',
          '// 4. Print the leftover tickets, but only if there are some.',
        ],
      },
      experienced: {
        steps: [
          '1. **Keep selling while a full bundle is left.**',
          '2. **Record each sale.**',
          '3. **Print the summary.**',
          '4. **Print the leftover, if any.**',
        ],
        comments: [
          '// 1. Keep selling while a full bundle is left.',
          '// 2. Record each sale.',
          '// 3. Print the summary.',
          '// 4. Print the leftover, if any.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TicketCounter.kt',
    initialCode: `fun main() {
  var ticketsLeft = 11
  val batch = 3
  var sales = 0

  // 1. Keep selling while a full bundle is left. Use a while loop that runs as long as ticketsLeft is at least batch.

  // 2. Record each sale. Inside the loop, subtract batch from ticketsLeft with -=. Then add 1 to sales with ++.

  // 3. Print the summary. After the loop, use string templates: "Sales: 3 | Left: 2"

  // 4. Print the leftover tickets, but only if there are some. Use an if: when ticketsLeft is above 0, print: "Leftover tickets: 2"
}`,
    solutionCode: `fun main() {
  var ticketsLeft = 11
  val batch = 3
  var sales = 0

  while (ticketsLeft >= batch) {
    ticketsLeft -= batch
    sales++
  }

  println("Sales: $sales | Left: $ticketsLeft")

  if (ticketsLeft > 0) {
    println("Leftover tickets: $ticketsLeft")
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sales: 3 | Left: 2\nLeftover tickets: 2',
    testCase: { call: '', expected: 'Sales: 3 | Left: 2\nLeftover tickets: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'ticketsLeft', originalLiteral: '11', alternateLiteral: '12' }],
      alternateExpectedOutput: 'Sales: 4 | Left: 0',
    },
  },
  {
    id: 'world-4-practice-writerun-collatz-steps',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Play the Collatz game with a while loop. Count the steps and track the highest value.',
    conceptTags: ['lesson:while', 'while-loop', 'if-else', 'remainder', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Collatz Steps',
    goal:
      'Start with 6. If the number is even, divide it by 2. If it is odd, multiply it by 3 and add 1. Repeat until you reach 1. Count the steps and keep the highest number reached. Print the result.',
    description:
      '1. **Repeat until you reach 1.** Use a `while` loop that runs while `current` is not 1.\n\n' +
              '2. **Change current in each pass.** If `current` is even, halve it. Otherwise, set it to three times `current` plus 1.\n\n' +
              '3. **Count the step.** Add 1 to `steps`.\n\n' +
              '4. **Track the highest value.** After the change, if `current` is larger than `peak`, make it the new `peak`.\n\n' +
              '5. **Print the result.** After the loop, use string templates:\n"Start: 6 | Steps: 8 | Peak: 16"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Repeat until you reach 1.** Use a `while` loop.',
          '2. **Change current in each pass.** Use the even and odd rule.',
          '3. **Count the step.**',
          '4. **Track the highest value.** Compare `current` with `peak`.',
          '5. **Print the result.** Use string templates.',
        ],
        comments: [
          '// 1. Repeat until you reach 1. Use a while loop.',
          '// 2. Change current in each pass. Use the even and odd rule.',
          '// 3. Count the step.',
          '// 4. Track the highest value. Compare current with peak.',
          '// 5. Print the result. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Repeat until you reach 1.**',
          '2. **Apply the Collatz rule.**',
          '3. **Count the step.**',
          '4. **Track the peak.**',
          '5. **Print the result.**',
        ],
        comments: [
          '// 1. Repeat until you reach 1.',
          '// 2. Apply the Collatz rule.',
          '// 3. Count the step.',
          '// 4. Track the peak.',
          '// 5. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CollatzSteps.kt',
    initialCode: `fun main() {
  val start = 6
  var current = start
  var steps = 0
  var peak = start

  // 1. Repeat until you reach 1. Use a while loop that runs while current is not 1.

  // 2. Change current in each pass. If current is even, halve it. Otherwise, set it to three times current plus 1.

  // 3. Count the step. Add 1 to steps.

  // 4. Track the highest value. After the change, if current is larger than peak, make it the new peak.

  // 5. Print the result. After the loop, use string templates: "Start: 6 | Steps: 8 | Peak: 16"
}`,
    solutionCode: `fun main() {
  val start = 6
  var current = start
  var steps = 0
  var peak = start

  while (current != 1) {
    if (current % 2 == 0) {
      current /= 2
    } else {
      current = 3 * current + 1
    }
    steps++
    if (current > peak) {
      peak = current
    }
  }

  println("Start: $start | Steps: $steps | Peak: $peak")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Start: 6 | Steps: 8 | Peak: 16',
    testCase: { call: '', expected: 'Start: 6 | Steps: 8 | Peak: 16' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '6', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Start: 7 | Steps: 16 | Peak: 52',
    },
  },

  // --------------------------------------------------------------- do-while
  {
    id: 'world-4-practice-writerun-retry-timer',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Retry with a doubling wait using do-while, so the first attempt always happens.',
    conceptTags: ['lesson:do-while', 'do-while-loop', 'compound-assignment', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Retry Timer',
    goal:
      'A program retries a failed request. The wait time doubles each time: 2 seconds, then 4, 8 and so on. Stop when the wait goes above 20 seconds. The program must try at least once. Show each attempt and its wait time. Then show the number of attempts.',
    description:
      'The wait is in seconds.\n\n' +
              '1. **Make sure the first attempt happens.** Use a `do-while` loop. Its body always runs at least once.\n\n' +
              '2. **Run one attempt.** Inside the loop, add 1 to `attempt`.\nPrint the `attempt` and its wait with string templates:\n"Attempt 1: wait 2s"\nThen double `delay` with `*=` 2.\n\n' +
              '3. **Set the repeat rule.** Make the loop repeat while `delay` is at most `limit`.\n\n' +
              '4. **Print the number of attempts after the loop:**\n"Attempts: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make sure the first attempt happens.** Use a `do-while` loop.',
          '2. **Run one attempt.** Count it, print it, then double `delay`.',
          '3. **Set the repeat rule.** Compare `delay` with `limit`.',
          '4. **Print the number of attempts after the loop.**',
        ],
        comments: [
          '// 1. Make sure the first attempt happens. Use a do-while loop.',
          '// 2. Run one attempt. Count it, print it, then double delay.',
          '// 3. Set the repeat rule. Compare delay with limit.',
          '// 4. Print the number of attempts after the loop.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make sure the first attempt happens.**',
          '2. **Run one attempt.**',
          '3. **Set the repeat rule.**',
          '4. **Print the number of attempts.**',
        ],
        comments: [
          '// 1. Make sure the first attempt happens.',
          '// 2. Run one attempt.',
          '// 3. Set the repeat rule.',
          '// 4. Print the number of attempts.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RetryTimer.kt',
    initialCode: `fun main() {
  var delay = 2
  val limit = 20
  var attempt = 0

  // 1. Make sure the first attempt happens. Use a do-while loop. Its body always runs at least once.

  // 2. Run one attempt. Inside the loop, add 1 to attempt. Print the attempt and its wait with string templates: "Attempt 1: wait 2s" Then double delay with *= 2.

  // 3. Set the repeat rule. Make the loop repeat while delay is at most limit.

  // 4. Print the number of attempts after the loop: "Attempts: 4"
}`,
    solutionCode: `fun main() {
  var delay = 2
  val limit = 20
  var attempt = 0

  do {
    attempt++
    println("Attempt $attempt: wait \${delay}s")
    delay *= 2
  } while (delay <= limit)

  println("Attempts: $attempt")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Attempt 1: wait 2s\nAttempt 2: wait 4s\nAttempt 3: wait 8s\nAttempt 4: wait 16s\nAttempts: 4',
    testCase: { call: '', expected: 'Attempt 1: wait 2s\nAttempt 2: wait 4s\nAttempt 3: wait 8s\nAttempt 4: wait 16s\nAttempts: 4' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'delay', originalLiteral: '2', alternateLiteral: '3' },
        { variableName: 'limit', originalLiteral: '20', alternateLiteral: '5' },
      ],
      alternateExpectedOutput: 'Attempt 1: wait 3s\nAttempts: 1',
    },
  },
  {
    id: 'world-4-practice-writerun-digit-reverse',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Reverse the digits of a number with do-while. The trailing zero disappears.',
    conceptTags: ['lesson:do-while', 'do-while-loop', 'remainder', 'int-division', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Digit Reverse',
    goal:
      'Reverse the digits of 4820 without changing it into text. Take the last digit from the number again and again. Use these digits to make the reversed number. Also count the digits. Print the reversed number and the digit count.',
    description:
      '1. **Repeat while digits remain.** Use a `do-while` loop that repeats while `remaining` is above 0.\n\n' +
              '2. **Add the last digit to reversed.** In each pass, multiply `reversed` by 10 to shift it one place left. Then add the last digit of `remaining`.\n\n' +
              '3. **Remove the last digit from remaining.** Then add 1 to `digits`.\n\n' +
              '4. **Print two lines using string templates.** The reversed number is a real number, so the leading zero is not shown:\n"4820 reversed is 284"\n"Digits: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Repeat while digits remain.** Use a `do-while` loop.',
          '2. **Add the last digit to reversed.** Shift `reversed` left first.',
          '3. **Remove the last digit from remaining.** Count it too.',
          '4. **Print two lines using string templates.**',
        ],
        comments: [
          '// 1. Repeat while digits remain. Use a do-while loop.',
          '// 2. Add the last digit to reversed. Shift reversed left first.',
          '// 3. Remove the last digit from remaining. Count it too.',
          '// 4. Print two lines using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Repeat while digits remain.**',
          '2. **Add the last digit to reversed.**',
          '3. **Remove the last digit.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Repeat while digits remain.',
          '// 2. Add the last digit to reversed.',
          '// 3. Remove the last digit.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DigitReverse.kt',
    initialCode: `fun main() {
  val number = 4820
  var remaining = number
  var reversed = 0
  var digits = 0

  // 1. Repeat while digits remain. Use a do-while loop that repeats while remaining is above 0.

  // 2. Add the last digit to reversed. In each pass, multiply reversed by 10 to shift it one place left. Then add the last digit of remaining.

  // 3. Remove the last digit from remaining. Then add 1 to digits.

  // 4. Print two lines using string templates. The reversed number is a real number, so the leading zero is not shown: "4820 reversed is 284" "Digits: 4"
}`,
    solutionCode: `fun main() {
  val number = 4820
  var remaining = number
  var reversed = 0
  var digits = 0

  do {
    reversed = reversed * 10 + remaining % 10
    remaining /= 10
    digits++
  } while (remaining > 0)

  println("$number reversed is $reversed")
  println("Digits: $digits")
}`,
    sampleInput: 'main()',
    expectedOutput: '4820 reversed is 284\nDigits: 4',
    testCase: { call: '', expected: '4820 reversed is 284\nDigits: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'number', originalLiteral: '4820', alternateLiteral: '907' }],
      alternateExpectedOutput: '907 reversed is 709\nDigits: 3',
    },
  },

  // ----------------------------------------------------------------- ranges
  {
    id: 'world-4-practice-writerun-range-scan',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Count the numbers inside and outside a range, then count the passes of an until range.',
    conceptTags: ['lesson:ranges', 'range-membership', 'until', 'for-loop', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Range Scan',
    goal:
      'Check the numbers 1 to 20 against the range 6 to 12. Count how many are inside and how many are outside. Then count a second range that ends just before 12. Print both results to show the difference between the two range styles.',
    description:
      '1. **Count the numbers inside and outside the range.** Loop over `n` in `1..20`. Use an `if/else`. When `n` is in `low..high`, add 1 to `inside`. Otherwise, add 1 to `outside`.\n\n' +
              '2. **Count the until range.** Create `var untilCount = 0`. Loop over `n` in `low until high`. `until` does not include `high`. Add 1 to `untilCount` on every pass.\n\n' +
              '3. **Print two lines using string templates:**\n"Inside: 7 | Outside: 13"\n"Until count: 6"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Count the numbers inside and outside the range.** Use `if`/`else` with `in`.',
          '2. **Count the until range.** Loop with `until`.',
          '3. **Print two lines using string templates.**',
        ],
        comments: [
          '// 1. Count the numbers inside and outside the range. Use if/else with in.',
          '// 2. Count the until range. Loop with until.',
          '// 3. Print two lines using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Count the numbers inside and outside the range.**',
          '2. **Count the until range.**',
          '3. **Print both results.**',
        ],
        comments: [
          '// 1. Count the numbers inside and outside the range.',
          '// 2. Count the until range.',
          '// 3. Print both results.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RangeScan.kt',
    initialCode: `fun main() {
  val low = 6
  val high = 12
  var inside = 0
  var outside = 0

  // 1. Count the numbers inside and outside the range. Loop over n in 1..20. Use an if/else. When n is in low..high, add 1 to inside. Otherwise, add 1 to outside.

  // 2. Count the until range. Create var untilCount = 0. Loop over n in low until high. until does not include high. Add 1 to untilCount on every pass.

  // 3. Print two lines using string templates: "Inside: 7 | Outside: 13" "Until count: 6"
}`,
    solutionCode: `fun main() {
  val low = 6
  val high = 12
  var inside = 0
  var outside = 0

  for (n in 1..20) {
    if (n in low..high) {
      inside++
    } else {
      outside++
    }
  }

  var untilCount = 0
  for (n in low until high) {
    untilCount++
  }

  println("Inside: $inside | Outside: $outside")
  println("Until count: $untilCount")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Inside: 7 | Outside: 13\nUntil count: 6',
    testCase: { call: '', expected: 'Inside: 7 | Outside: 13\nUntil count: 6' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'high', originalLiteral: '12', alternateLiteral: '15' }],
      alternateExpectedOutput: 'Inside: 10 | Outside: 10\nUntil count: 9',
    },
  },
  {
    id: 'world-4-practice-writerun-overlap-counter',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Find where two ranges overlap. Count the shared values and track the first and last.',
    conceptTags: ['lesson:ranges', 'range-membership', 'logical-and', 'for-loop', 'boundary'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Overlap Counter',
    goal:
      'Two ranges, 5 to 15 and 10 to 25, overlap. Check the numbers 1 to 30 and find the numbers that are in both ranges. Count them and keep the first and last shared numbers. Print the overlap.',
    description:
      'Both ends of each range are included.\n\n' +
              '1. **Check every number.** Loop over `x` in `1..30`.\n\n' +
              '2. **Count the shared numbers.** When `x` is in the first range AND in the second range (use in with `&&`), add 1 to `count`.\n\n' +
              '3. **Remember the first shared number.** Set `first` to `x` only while `first` is still `-1`.\n\n' +
              '4. **Remember the latest shared number.** Set `last` to `x` each time.\n\n' +
              '5. **Print one line using string templates:**\n"Overlap: 6 values from 10 to 15"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check every number.**',
          '2. **Count the shared numbers.** Test both ranges with `in` and `&&`.',
          '3. **Remember the first shared number.**',
          '4. **Remember the latest shared number.**',
          '5. **Print one line using string templates.**',
        ],
        comments: [
          '// 1. Check every number.',
          '// 2. Count the shared numbers. Test both ranges with in and &&.',
          '// 3. Remember the first shared number.',
          '// 4. Remember the latest shared number.',
          '// 5. Print one line using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check every number.**',
          '2. **Count the shared numbers.**',
          '3. **Remember the first one.**',
          '4. **Remember the last one.**',
          '5. **Print the overlap.**',
        ],
        comments: [
          '// 1. Check every number.',
          '// 2. Count the shared numbers.',
          '// 3. Remember the first one.',
          '// 4. Remember the last one.',
          '// 5. Print the overlap.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OverlapCounter.kt',
    initialCode: `fun main() {
  val aLow = 5
  val aHigh = 15
  val bLow = 10
  val bHigh = 25
  var count = 0
  var first = -1
  var last = -1

  // 1. Check every number. Loop over x in 1..30.

  // 2. Count the shared numbers. When x is in the first range AND in the second range (use in with &&), add 1 to count.

  // 3. Remember the first shared number. Set first to x only while first is still -1.

  // 4. Remember the latest shared number. Set last to x each time.

  // 5. Print one line using string templates: "Overlap: 6 values from 10 to 15"
}`,
    solutionCode: `fun main() {
  val aLow = 5
  val aHigh = 15
  val bLow = 10
  val bHigh = 25
  var count = 0
  var first = -1
  var last = -1

  for (x in 1..30) {
    if (x in aLow..aHigh && x in bLow..bHigh) {
      count++
      if (first == -1) {
        first = x
      }
      last = x
    }
  }

  println("Overlap: $count values from $first to $last")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Overlap: 6 values from 10 to 15',
    testCase: { call: '', expected: 'Overlap: 6 values from 10 to 15' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'aHigh', originalLiteral: '15', alternateLiteral: '18' },
        { variableName: 'bLow', originalLiteral: '10', alternateLiteral: '12' },
      ],
      alternateExpectedOutput: 'Overlap: 7 values from 12 to 18',
    },
  },

  // ------------------------------------------------------------ progressions
  {
    id: 'world-4-practice-writerun-stair-steps',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Walk a range with a step, print each stop and add the stops up.',
    conceptTags: ['lesson:progressions', 'step', 'for-loop', 'accumulator', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Stair Steps',
    goal:
      'A staircase has landings at 3, 9, 15 and so on, up to 30. There are 6 units between each landing. Visit and print each landing. Add all the landing numbers and print the total at the end.',
    description:
      '1. **Visit every landing.** Loop over `s` in `first..last step gap`.\n\n' +
              '2. **Print each stop.** Inside the loop, use a string template:\n"Stop: 3"\n\n' +
              '3. **Add up the landings.** Also inside the loop, add `s` to `total`.\n\n' +
              '4. **Print the total after the loop:**\n"Total: 75"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Visit every landing.** Use a range with `step`.',
          '2. **Print each stop.**',
          '3. **Add up the landings.**',
          '4. **Print the total after the loop.**',
        ],
        comments: [
          '// 1. Visit every landing. Use a range with step.',
          '// 2. Print each stop.',
          '// 3. Add up the landings.',
          '// 4. Print the total after the loop.',
        ],
      },
      experienced: {
        steps: [
          '1. **Visit every landing.**',
          '2. **Print each stop.**',
          '3. **Add up the landings.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Visit every landing.',
          '// 2. Print each stop.',
          '// 3. Add up the landings.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StairSteps.kt',
    initialCode: `fun main() {
  val first = 3
  val last = 30
  val gap = 6
  var total = 0

  // 1. Visit every landing. Loop over s in first..last step gap.

  // 2. Print each stop. Inside the loop, use a string template: "Stop: 3"

  // 3. Add up the landings. Also inside the loop, add s to total.

  // 4. Print the total after the loop: "Total: 75"
}`,
    solutionCode: `fun main() {
  val first = 3
  val last = 30
  val gap = 6
  var total = 0

  for (s in first..last step gap) {
    println("Stop: $s")
    total += s
  }

  println("Total: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Stop: 3\nStop: 9\nStop: 15\nStop: 21\nStop: 27\nTotal: 75',
    testCase: { call: '', expected: 'Stop: 3\nStop: 9\nStop: 15\nStop: 21\nStop: 27\nTotal: 75' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'gap', originalLiteral: '6', alternateLiteral: '9' }],
      alternateExpectedOutput: 'Stop: 3\nStop: 12\nStop: 21\nStop: 30\nTotal: 66',
    },
  },
  {
    id: 'world-4-practice-writerun-overshoot-detector',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Compare a stepped range going up with one going down. Neither lands on its end value.',
    conceptTags: ['lesson:progressions', 'step', 'downto', 'for-loop', 'boundary'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Overshoot Detector',
    goal:
      'Start at 1 and move toward 20 in steps of 6. You will not land exactly on 20. Then start at 20 and move toward 1. Count the stops and keep the last stop for each direction. Print how far each one stopped before the end.',
    description:
      '1. **Walk up.** Loop from 1 up to `limit` in steps of `size`. Count the stops in `var upStops`. Keep the last value in `var lastUp`.\n\n' +
              '2. **Walk down.** Loop from `limit` down to 1 in steps of `size`. Count the stops in `var downStops`. Keep the last value in `var lastDown`.\n\n' +
              '3. **Find how far the up walk fell short.** Create `val upShort`: how far `lastUp` is below `limit`.\n\n' +
              '4. **Find how far the down walk fell short.** Create `val downShort`: how far `lastDown` is above 1.\n\n' +
              '5. **Print two lines using string templates:**\n"Up: 4 stops, last 19, short by 1"\n"Down: 4 stops, last 2, short by 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Walk up.** Count the stops and keep the last value.',
          '2. **Walk down.** Count the stops and keep the last value.',
          '3. **Find how far the up walk fell short.**',
          '4. **Find how far the down walk fell short.**',
          '5. **Print two lines using string templates.**',
        ],
        comments: [
          '// 1. Walk up. Count the stops and keep the last value.',
          '// 2. Walk down. Count the stops and keep the last value.',
          '// 3. Find how far the up walk fell short.',
          '// 4. Find how far the down walk fell short.',
          '// 5. Print two lines using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Walk up.**',
          '2. **Walk down.**',
          '3. **Measure the up shortfall.**',
          '4. **Measure the down shortfall.**',
          '5. **Print both results.**',
        ],
        comments: [
          '// 1. Walk up.',
          '// 2. Walk down.',
          '// 3. Measure the up shortfall.',
          '// 4. Measure the down shortfall.',
          '// 5. Print both results.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OvershootDetector.kt',
    initialCode: `fun main() {
  val limit = 20
  val size = 6

  // 1. Walk up. Loop from 1 up to limit in steps of size. Count the stops in var upStops. Keep the last value in var lastUp.

  // 2. Walk down. Loop from limit down to 1 in steps of size. Count the stops in var downStops. Keep the last value in var lastDown.

  // 3. Find how far the up walk fell short. Create val upShort: how far lastUp is below limit.

  // 4. Find how far the down walk fell short. Create val downShort: how far lastDown is above 1.

  // 5. Print two lines using string templates: "Up: 4 stops, last 19, short by 1" "Down: 4 stops, last 2, short by 1"
}`,
    solutionCode: `fun main() {
  val limit = 20
  val size = 6

  var upStops = 0
  var lastUp = 0
  for (n in 1..limit step size) {
    upStops++
    lastUp = n
  }

  var downStops = 0
  var lastDown = 0
  for (n in limit downTo 1 step size) {
    downStops++
    lastDown = n
  }

  val upShort = limit - lastUp
  val downShort = lastDown - 1

  println("Up: $upStops stops, last $lastUp, short by $upShort")
  println("Down: $downStops stops, last $lastDown, short by $downShort")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Up: 4 stops, last 19, short by 1\nDown: 4 stops, last 2, short by 1',
    testCase: { call: '', expected: 'Up: 4 stops, last 19, short by 1\nDown: 4 stops, last 2, short by 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'size', originalLiteral: '6', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Up: 4 stops, last 16, short by 4\nDown: 4 stops, last 5, short by 4',
    },
  },

  // ----------------------------------------------------------------- downTo
  {
    id: 'world-4-practice-writerun-rocket-countdown',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Count down with downTo, show a special line for one second, then print Liftoff.',
    conceptTags: ['lesson:downto', 'downto', 'for-loop', 'if-else', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Rocket Countdown',
    goal:
      'Print a rocket countdown from 5 to 1. Show a special ignition message at one second. After the countdown, print a liftoff line.',
    description:
      '1. **Count down.** Loop over `t` from `start` down to 1 (both included) with `downTo`.\n\n' +
              '2. **Print each second.** Inside the loop, use an `if/else`.\nWhen `t` equals 3, print the special line.\nOtherwise, print the plain line, which is T- followed by `t`.\nThe plain line looks like:\n"T-5"\nThe special line is:\n"T-3 Ignition"\n\n' +
              '3. **Print the last line after the loop:**\n"Liftoff!"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Count down.** Use `downTo`.',
          '2. **Print each second.** Use `if`/`else` for the special second.',
          '3. **Print the last line after the loop.**',
        ],
        comments: [
          '// 1. Count down. Use downTo.',
          '// 2. Print each second. Use if/else for the special second.',
          '// 3. Print the last line after the loop.',
        ],
      },
      experienced: {
        steps: [
          '1. **Count down.**',
          '2. **Print each second.**',
          '3. **Print the last line.**',
        ],
        comments: [
          '// 1. Count down.',
          '// 2. Print each second.',
          '// 3. Print the last line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RocketCountdown.kt',
    initialCode: `fun main() {
  val start = 5

  // 1. Count down. Loop over t from start down to 1 (both included) with downTo.

  // 2. Print each second. Inside the loop, use an if/else. When t equals 3, print the special line. Otherwise, print the plain line, which is T- followed by t. The plain line looks like: "T-5" The special line is: "T-3 Ignition"

  // 3. Print the last line after the loop: "Liftoff!"
}`,
    solutionCode: `fun main() {
  val start = 5

  for (t in start downTo 1) {
    if (t == 3) {
      println("T-$t Ignition")
    } else {
      println("T-$t")
    }
  }

  println("Liftoff!")
}`,
    sampleInput: 'main()',
    expectedOutput: 'T-5\nT-4\nT-3 Ignition\nT-2\nT-1\nLiftoff!',
    testCase: { call: '', expected: 'T-5\nT-4\nT-3 Ignition\nT-2\nT-1\nLiftoff!' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '5', alternateLiteral: '4' }],
      alternateExpectedOutput: 'T-4\nT-3 Ignition\nT-2\nT-1\nLiftoff!',
    },
  },
  {
    id: 'world-4-practice-writerun-elevator-descent',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Go down floors with downTo and step. Track the stops, even floors, a running sum and the last floor.',
    conceptTags: ['lesson:downto', 'downto', 'step', 'accumulator', 'remainder'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Elevator Descent',
    goal:
      'An elevator starts on floor 20 and goes down. It stops every 3 floors until floor 2. Count all stops and the stops on even floors. Add the floor numbers it visits. Print the last floor where it stops.',
    description:
      '1. **Visit each stop.** Loop over `floor` from `top` down to `bottom` (both included) in steps of `hop`.\n\n' +
              '2. **Record each stop.** Add 1 to `stops`. Add `floor` to `visited`. Save `floor` in `lastFloor`.\n\n' +
              '3. **Count the even floors.** Add 1 to `evenStops` when `floor` is even.\n\n' +
              '4. **Print two lines using string templates:**\n"Stops: 7 | Even floors: 4 | Sum: 77"\n"Last floor: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Visit each stop.** Use `downTo` and `step`.',
          '2. **Record each stop.** Update `stops`, `visited` and `lastFloor`.',
          '3. **Count the even floors.**',
          '4. **Print two lines using string templates.**',
        ],
        comments: [
          '// 1. Visit each stop. Use downTo and step.',
          '// 2. Record each stop. Update stops, visited and lastFloor.',
          '// 3. Count the even floors.',
          '// 4. Print two lines using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Visit each stop.**',
          '2. **Record each stop.**',
          '3. **Count the even floors.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Visit each stop.',
          '// 2. Record each stop.',
          '// 3. Count the even floors.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ElevatorDescent.kt',
    initialCode: `fun main() {
  val top = 20
  val bottom = 2
  val hop = 3
  var stops = 0
  var evenStops = 0
  var visited = 0
  var lastFloor = 0

  // 1. Visit each stop. Loop over floor from top down to bottom (both included) in steps of hop.

  // 2. Record each stop. Add 1 to stops. Add floor to visited. Save floor in lastFloor.

  // 3. Count the even floors. Add 1 to evenStops when floor is even.

  // 4. Print two lines using string templates: "Stops: 7 | Even floors: 4 | Sum: 77" "Last floor: 2"
}`,
    solutionCode: `fun main() {
  val top = 20
  val bottom = 2
  val hop = 3
  var stops = 0
  var evenStops = 0
  var visited = 0
  var lastFloor = 0

  for (floor in top downTo bottom step hop) {
    stops++
    visited += floor
    if (floor % 2 == 0) {
      evenStops++
    }
    lastFloor = floor
  }

  println("Stops: $stops | Even floors: $evenStops | Sum: $visited")
  println("Last floor: $lastFloor")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Stops: 7 | Even floors: 4 | Sum: 77\nLast floor: 2',
    testCase: { call: '', expected: 'Stops: 7 | Even floors: 4 | Sum: 77\nLast floor: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hop', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Stops: 5 | Even floors: 5 | Sum: 60\nLast floor: 4',
    },
  },

  // ------------------------------------------------------------------- step
  {
    id: 'world-4-practice-writerun-checkpoints',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Place checkpoints along a route with until and step, then find the distance left.',
    conceptTags: ['lesson:step', 'step', 'until', 'for-loop', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Checkpoints',
    goal:
      'A 50 km route has a checkpoint every 15 km, starting at 0. The finish line is not a checkpoint. Count the checkpoints and keep the last checkpoint. Then find the distance from the last checkpoint to the finish.',
    description:
      '1. **Visit each checkpoint.** Loop over `mark` in `0 until distance step size`. `until` leaves out the finish line.\n\n' +
              '2. **Record each checkpoint.** Inside the loop, add 1 to `checkpoints`. Save `mark` in `lastMark`.\n\n' +
              '3. **Find the distance left.** Create `val toFinish`: `distance` minus `lastMark`.\n\n' +
              '4. **Print the report using string templates:**\n"Checkpoints: 4 | Last: 45 | To finish: 5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Visit each checkpoint.** Use `until` and `step`.',
          '2. **Record each checkpoint.** Count it and remember the mark.',
          '3. **Find the distance left.**',
          '4. **Print the report using string templates.**',
        ],
        comments: [
          '// 1. Visit each checkpoint. Use until and step.',
          '// 2. Record each checkpoint. Count it and remember the mark.',
          '// 3. Find the distance left.',
          '// 4. Print the report using string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Visit each checkpoint.**',
          '2. **Record each checkpoint.**',
          '3. **Find the distance left.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Visit each checkpoint.',
          '// 2. Record each checkpoint.',
          '// 3. Find the distance left.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Checkpoints.kt',
    initialCode: `fun main() {
  val distance = 50
  val size = 15
  var checkpoints = 0
  var lastMark = 0

  // 1. Visit each checkpoint. Loop over mark in 0 until distance step size. until leaves out the finish line.

  // 2. Record each checkpoint. Inside the loop, add 1 to checkpoints. Save mark in lastMark.

  // 3. Find the distance left. Create val toFinish: distance minus lastMark.

  // 4. Print the report using string templates: "Checkpoints: 4 | Last: 45 | To finish: 5"
}`,
    solutionCode: `fun main() {
  val distance = 50
  val size = 15
  var checkpoints = 0
  var lastMark = 0

  for (mark in 0 until distance step size) {
    checkpoints++
    lastMark = mark
  }

  val toFinish = distance - lastMark

  println("Checkpoints: $checkpoints | Last: $lastMark | To finish: $toFinish")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Checkpoints: 4 | Last: 45 | To finish: 5',
    testCase: { call: '', expected: 'Checkpoints: 4 | Last: 45 | To finish: 5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'size', originalLiteral: '15', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Checkpoints: 3 | Last: 40 | To finish: 10',
    },
  },

  // ------------------------------------------------------------------ break
  {
    id: 'world-4-practice-writerun-budget-cutoff',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Buy items until the next one would go over budget. Use break, then report what is left.',
    conceptTags: ['lesson:break', 'break', 'for-loop', 'accumulator', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Budget Cutoff',
    goal:
      'You buy items that cost 15, 30, 45 and so on. Your budget is 100. Keep buying until the next item would cost more than your remaining budget. Print how many items you bought, how much you spent and how much money is left.',
    description:
      '1. **Work out each price.** Loop over `item` in `1..10`. Inside the loop, create `val cost`: `item` times 15.\n\n' +
              '2. **Stop when an item is too expensive.** If `spent` plus `cost` is above `budget`, use `break` to leave the loop.\n\n' +
              '3. **Otherwise, buy the item.** Add `cost` to `spent`. Add 1 to `bought`.\n\n' +
              '4. **Print the report.** After the loop, create `val left`: `budget` minus `spent`. Then print with string templates:\n"Bought 3 items, spent 90, left 10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Work out each price.**',
          '2. **Stop when an item is too expensive.** Use `break`.',
          '3. **Otherwise, buy the item.**',
          '4. **Print the report.** Work out what is left first.',
        ],
        comments: [
          '// 1. Work out each price.',
          '// 2. Stop when an item is too expensive. Use break.',
          '// 3. Otherwise, buy the item.',
          '// 4. Print the report. Work out what is left first.',
        ],
      },
      experienced: {
        steps: [
          '1. **Work out each price.**',
          '2. **Stop when an item is too expensive.**',
          '3. **Otherwise, buy the item.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Work out each price.',
          '// 2. Stop when an item is too expensive.',
          '// 3. Otherwise, buy the item.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BudgetCutoff.kt',
    initialCode: `fun main() {
  val budget = 100
  var spent = 0
  var bought = 0

  // 1. Work out each price. Loop over item in 1..10. Inside the loop, create val cost: item times 15.

  // 2. Stop when an item is too expensive. If spent plus cost is above budget, use break to leave the loop.

  // 3. Otherwise, buy the item. Add cost to spent. Add 1 to bought.

  // 4. Print the report. After the loop, create val left: budget minus spent. Then print with string templates: "Bought 3 items, spent 90, left 10"
}`,
    solutionCode: `fun main() {
  val budget = 100
  var spent = 0
  var bought = 0

  for (item in 1..10) {
    val cost = item * 15
    if (spent + cost > budget) {
      break
    }
    spent += cost
    bought++
  }

  val left = budget - spent

  println("Bought $bought items, spent $spent, left $left")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Bought 3 items, spent 90, left 10',
    testCase: { call: '', expected: 'Bought 3 items, spent 90, left 10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'budget', originalLiteral: '100', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Bought 4 items, spent 150, left 50',
    },
  },
  {
    id: 'world-4-practice-writerun-prime-check',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Find the first divisor of a number with break. Report a prime, or the two factors, with the number of checks.',
    conceptTags: ['lesson:break', 'break', 'for-loop', 'remainder', 'if-else'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Prime Check',
    goal:
      'Find if 29 is prime. Check smaller numbers from 2 upward to see if any divide 29 exactly. Stop when you find one. Count how many checks you make. Print that 29 is prime, or print the two factors you find.',
    description:
      '`divisor` is 0 until a divisor is found.\n\n' +
              '1. **Try the possible divisors.** Loop over `d` from 2 up to, but not including, `n`.\n\n' +
              '2. **Count each check.** Add 1 to `checks` in every pass.\n\n' +
              '3. **Stop at the first divisor.** If `d` divides `n` evenly, save `d` in `divisor` and leave the loop with `break`.\n\n' +
              '4. **Print the result after the loop.** If no `divisor` was found, print the prime line. Otherwise, print the factor line. The other factor is `n` divided by `divisor`. Use string templates.\nFor 29, the line is:\n"29 is prime (27 checks)"\nIf `n` were 91, the line would be:\n"91 = 7 x 13 (6 checks)"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Try the possible divisors.**',
          '2. **Count each check.**',
          '3. **Stop at the first divisor.** Use `break`.',
          '4. **Print the result after the loop.** Print the prime line or the factor line.',
        ],
        comments: [
          '// 1. Try the possible divisors.',
          '// 2. Count each check.',
          '// 3. Stop at the first divisor. Use break.',
          '// 4. Print the result after the loop. Print the prime line or the factor line.',
        ],
      },
      experienced: {
        steps: [
          '1. **Try the divisors.**',
          '2. **Count each check.**',
          '3. **Stop at the first divisor.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Try the divisors.',
          '// 2. Count each check.',
          '// 3. Stop at the first divisor.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PrimeCheck.kt',
    initialCode: `fun main() {
  val n = 29
  var divisor = 0
  var checks = 0

  // 1. Try the possible divisors. Loop over d from 2 up to, but not including, n.

  // 2. Count each check. Add 1 to checks in every pass.

  // 3. Stop at the first divisor. If d divides n evenly, save d in divisor and leave the loop with break.

  // 4. Print the result after the loop. If no divisor was found, print the prime line. Otherwise, print the factor line. The other factor is n divided by divisor. Use string templates. For 29, the line is: "29 is prime (27 checks)" If n were 91, the line would be: "91 = 7 x 13 (6 checks)"
}`,
    solutionCode: `fun main() {
  val n = 29
  var divisor = 0
  var checks = 0

  for (d in 2 until n) {
    checks++
    if (n % d == 0) {
      divisor = d
      break
    }
  }

  if (divisor == 0) {
    println("$n is prime ($checks checks)")
  } else {
    println("$n = $divisor x \${n / divisor} ($checks checks)")
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '29 is prime (27 checks)',
    testCase: { call: '', expected: '29 is prime (27 checks)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '29', alternateLiteral: '91' }],
      alternateExpectedOutput: '91 = 7 x 13 (6 checks)',
    },
  },

  // --------------------------------------------------------------- continue
  {
    id: 'world-4-practice-writerun-skip-multiples',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Add the numbers up to a limit and skip multiples of 3 with continue. Count the skipped numbers.',
    conceptTags: ['lesson:continue', 'continue', 'for-loop', 'remainder', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Skip Multiples',
    goal:
      'Add the numbers from 1 to 15, but do not add multiples of 3. Count how many numbers you skip. Print the sum and the number skipped.',
    description:
      '1. **Check every number.** Loop over `n` in `1..last`.\n\n' +
              '2. **Skip the multiples of 3.** When `n` is a multiple of 3, add 1 to `skipped`. Then use `continue` to jump to the next number.\n\n' +
              '3. **Add the other numbers.** Otherwise, add `n` to `total`.\n\n' +
              '4. **Print the result after the loop, using string templates:**\n"Sum: 75 | Skipped: 5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check every number.**',
          '2. **Skip the multiples of 3.** Count them, then use `continue`.',
          '3. **Add the other numbers.**',
          '4. **Print the result after the loop.**',
        ],
        comments: [
          '// 1. Check every number.',
          '// 2. Skip the multiples of 3. Count them, then use continue.',
          '// 3. Add the other numbers.',
          '// 4. Print the result after the loop.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check every number.**',
          '2. **Skip the multiples of 3.**',
          '3. **Add the other numbers.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Check every number.',
          '// 2. Skip the multiples of 3.',
          '// 3. Add the other numbers.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SkipMultiples.kt',
    initialCode: `fun main() {
  val last = 15
  var total = 0
  var skipped = 0

  // 1. Check every number. Loop over n in 1..last.

  // 2. Skip the multiples of 3. When n is a multiple of 3, add 1 to skipped. Then use continue to jump to the next number.

  // 3. Add the other numbers. Otherwise, add n to total.

  // 4. Print the result after the loop, using string templates: "Sum: 75 | Skipped: 5"
}`,
    solutionCode: `fun main() {
  val last = 15
  var total = 0
  var skipped = 0

  for (n in 1..last) {
    if (n % 3 == 0) {
      skipped++
      continue
    }
    total += n
  }

  println("Sum: $total | Skipped: $skipped")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sum: 75 | Skipped: 5',
    testCase: { call: '', expected: 'Sum: 75 | Skipped: 5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'last', originalLiteral: '15', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Sum: 147 | Skipped: 6',
    },
  },
  {
    id: 'world-4-practice-writerun-big-odd-sum',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Add odd numbers. Skip evens with continue and stop with break once the total passes a limit.',
    conceptTags: ['lesson:continue', 'continue', 'break', 'for-loop', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'First Big Odd Sum',
    goal:
      'Add odd numbers until the total goes above 60, then stop. Do not add even numbers. Print the number that made the total go above 60, how many odd numbers you used and the total.',
    description:
      '1. **Check the numbers.** Loop over `i` in `1..50`.\n\n' +
              '2. **Skip the even numbers.** When `i` is even, use `continue`.\n\n' +
              '3. **Add the odd numbers.** For an odd `i`, add `i` to `total`. Add 1 to `count`.\n\n' +
              '4. **Stop at the limit.** As soon as `total` is above `limit`, save `i` in `stoppedAt` and leave the loop with `break`.\n\n' +
              '5. **Print one line after the loop, using string templates:**\n"Stopped at 15 after 8 odd numbers, total 64"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check the numbers.**',
          '2. **Skip the even numbers.** Use `continue`.',
          '3. **Add the odd numbers.** Count them too.',
          '4. **Stop at the limit.** Use `break`.',
          '5. **Print one line after the loop.**',
        ],
        comments: [
          '// 1. Check the numbers.',
          '// 2. Skip the even numbers. Use continue.',
          '// 3. Add the odd numbers. Count them too.',
          '// 4. Stop at the limit. Use break.',
          '// 5. Print one line after the loop.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check the numbers.**',
          '2. **Skip the even numbers.**',
          '3. **Add the odd numbers.**',
          '4. **Stop at the limit.**',
          '5. **Print the result.**',
        ],
        comments: [
          '// 1. Check the numbers.',
          '// 2. Skip the even numbers.',
          '// 3. Add the odd numbers.',
          '// 4. Stop at the limit.',
          '// 5. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstBigOddSum.kt',
    initialCode: `fun main() {
  val limit = 60
  var total = 0
  var count = 0
  var stoppedAt = 0

  // 1. Check the numbers. Loop over i in 1..50.

  // 2. Skip the even numbers. When i is even, use continue.

  // 3. Add the odd numbers. For an odd i, add i to total. Add 1 to count.

  // 4. Stop at the limit. As soon as total is above limit, save i in stoppedAt and leave the loop with break.

  // 5. Print one line after the loop, using string templates: "Stopped at 15 after 8 odd numbers, total 64"
}`,
    solutionCode: `fun main() {
  val limit = 60
  var total = 0
  var count = 0
  var stoppedAt = 0

  for (i in 1..50) {
    if (i % 2 == 0) {
      continue
    }
    total += i
    count++
    if (total > limit) {
      stoppedAt = i
      break
    }
  }

  println("Stopped at $stoppedAt after $count odd numbers, total $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Stopped at 15 after 8 odd numbers, total 64',
    testCase: { call: '', expected: 'Stopped at 15 after 8 odd numbers, total 64' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '60', alternateLiteral: '100' }],
      alternateExpectedOutput: 'Stopped at 21 after 11 odd numbers, total 121',
    },
  },

  // ----------------------------------------------------------- nested loops
  {
    id: 'world-4-practice-writerun-seating-chart',
    worldId: 'world-4',
    difficulty: 'medium',
    summary: 'Print a seating grid with nested loops, end each row with a line break, and count the seats.',
    conceptTags: ['lesson:nested-loops', 'nested-loop', 'print-println', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Seating Chart',
    goal:
      'Print a seating chart with 3 rows and 4 seats in each row. Label each seat with its row and seat number. Show each row on one line. Then print the total number of seats.',
    description:
      '1. **Set up the loops.** Use an outer loop over `row` in `1..rows`. Inside it, use an inner loop over `seat` in `1..cols`.\n\n' +
              '2. **Print each seat.** Inside the inner loop, use `print` (not `println`) to show the label, like `[1-1]`. Then add 1 to `seats`.\n\n' +
              '3. **End each row.** After the inner loop finishes (still inside the outer loop), call `println()` with no arguments.\n\n' +
              '4. **Print the seat count after both loops:**\n"Seats: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Set up the loops.** Use an outer loop for rows and an inner loop for seats.',
          '2. **Print each seat.** Use `print`, not `println`.',
          '3. **End each row.**',
          '4. **Print the seat count after both loops.**',
        ],
        comments: [
          '// 1. Set up the loops. Use an outer loop for rows and an inner loop for seats.',
          '// 2. Print each seat. Use print, not println.',
          '// 3. End each row.',
          '// 4. Print the seat count after both loops.',
        ],
      },
      experienced: {
        steps: [
          '1. **Set up the loops.**',
          '2. **Print each seat.**',
          '3. **End each row.**',
          '4. **Print the seat count.**',
        ],
        comments: [
          '// 1. Set up the loops.',
          '// 2. Print each seat.',
          '// 3. End each row.',
          '// 4. Print the seat count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SeatingChart.kt',
    initialCode: `fun main() {
  val rows = 3
  val cols = 4
  var seats = 0

  // 1. Set up the loops. Use an outer loop over row in 1..rows. Inside it, use an inner loop over seat in 1..cols.

  // 2. Print each seat. Inside the inner loop, use print (not println) to show the label, like [1-1]. Then add 1 to seats.

  // 3. End each row. After the inner loop finishes (still inside the outer loop), call println() with no arguments.

  // 4. Print the seat count after both loops: "Seats: 12"
}`,
    solutionCode: `fun main() {
  val rows = 3
  val cols = 4
  var seats = 0

  for (row in 1..rows) {
    for (seat in 1..cols) {
      print("[$row-$seat]")
      seats++
    }
    println()
  }

  println("Seats: $seats")
}`,
    sampleInput: 'main()',
    expectedOutput: '[1-1][1-2][1-3][1-4]\n[2-1][2-2][2-3][2-4]\n[3-1][3-2][3-3][3-4]\nSeats: 12',
    testCase: { call: '', expected: '[1-1][1-2][1-3][1-4]\n[2-1][2-2][2-3][2-4]\n[3-1][3-2][3-3][3-4]\nSeats: 12' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'rows', originalLiteral: '3', alternateLiteral: '2' },
        { variableName: 'cols', originalLiteral: '4', alternateLiteral: '3' },
      ],
      alternateExpectedOutput: '[1-1][1-2][1-3]\n[2-1][2-2][2-3]\nSeats: 6',
    },
  },
  {
    id: 'world-4-practice-writerun-pair-counter',
    worldId: 'world-4',
    difficulty: 'hard',
    summary: 'Count pairs with nested loops. break leaves only the inner loop, and continue skips one pair.',
    conceptTags: ['lesson:nested-loops', 'nested-loop', 'break', 'continue', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pair Counter',
    goal:
      'Check all pairs (a, b) where a and b each go from 1 to 6. Ignore pairs where a and b are equal. Stop a row when a times b goes above 12. Count the pairs and the total number of inner steps. Print both numbers.',
    description:
      '1. **Set up the loops.** Use an outer loop over `a` in `1..6`. Inside it, use an inner loop over `b` in `1..6`.\n\n' +
              '2. **Count every inner step.** At the very start of each inner pass, add 1 to `iterations`.\n\n' +
              '3. **Stop the row when the product is too big.** If `a` times `b` is above `limit`, use `break`. It leaves only the inner loop, and the outer loop carries on with the next `a`.\n\n' +
              '4. **Skip equal pairs.** If `a` equals `b`, use `continue` to skip this pair.\n\n' +
              '5. **Count the pair.** Otherwise, add 1 to `pairs`.\n\n' +
              '6. **Print one line after both loops, using string templates:**\n"Pairs: 20 | Iterations: 27"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Set up the loops.** Use an outer loop and an inner loop.',
          '2. **Count every inner step.**',
          '3. **Stop the row when the product is too big.** Use `break`.',
          '4. **Skip equal pairs.** Use `continue`.',
          '5. **Count the pair.**',
          '6. **Print one line after both loops.**',
        ],
        comments: [
          '// 1. Set up the loops. Use an outer loop and an inner loop.',
          '// 2. Count every inner step.',
          '// 3. Stop the row when the product is too big. Use break.',
          '// 4. Skip equal pairs. Use continue.',
          '// 5. Count the pair.',
          '// 6. Print one line after both loops.',
        ],
      },
      experienced: {
        steps: [
          '1. **Set up the loops.**',
          '2. **Count every inner step.**',
          '3. **Stop the row early.**',
          '4. **Skip equal pairs.**',
          '5. **Count the pair.**',
          '6. **Print the result.**',
        ],
        comments: [
          '// 1. Set up the loops.',
          '// 2. Count every inner step.',
          '// 3. Stop the row early.',
          '// 4. Skip equal pairs.',
          '// 5. Count the pair.',
          '// 6. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PairCounter.kt',
    initialCode: `fun main() {
  val limit = 12
  var pairs = 0
  var iterations = 0

  // 1. Set up the loops. Use an outer loop over a in 1..6. Inside it, use an inner loop over b in 1..6.

  // 2. Count every inner step. At the very start of each inner pass, add 1 to iterations.

  // 3. Stop the row when the product is too big. If a times b is above limit, use break. It leaves only the inner loop, and the outer loop carries on with the next a.

  // 4. Skip equal pairs. If a equals b, use continue to skip this pair.

  // 5. Count the pair. Otherwise, add 1 to pairs.

  // 6. Print one line after both loops, using string templates: "Pairs: 20 | Iterations: 27"
}`,
    solutionCode: `fun main() {
  val limit = 12
  var pairs = 0
  var iterations = 0

  for (a in 1..6) {
    for (b in 1..6) {
      iterations++
      if (a * b > limit) {
        break
      }
      if (a == b) {
        continue
      }
      pairs++
    }
  }

  println("Pairs: $pairs | Iterations: $iterations")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pairs: 20 | Iterations: 27',
    testCase: { call: '', expected: 'Pairs: 20 | Iterations: 27' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '12', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Pairs: 26 | Iterations: 33',
    },
  },
];

export const WORLD_4_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // for
  {
    id: 'world-4-practice-debug-ticket-sum',
    worldId: 'world-4',
    conceptTags: ['lesson:for', 'for-loop', 'until', 'accumulator'],
    summary: 'A sum of the numbers 1 to 10 comes out as 45 because the range stops one number early.',
    title: 'Fix the Ticket Sum',
    subtitle: 'The program should add the ticket numbers 1 to 10 and print 55, but it prints 45.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: until excludes the last number',
    brokenCode: `fun main() {
  var total = 0

  for (i in 1 until 10) {
    total += i
  }

  println("Sum: $total")
}`,
    fixedCode: `fun main() {
  var total = 0

  for (i in 1..10) {
    total += i
  }

  println("Sum: $total")
}`,
    expectedOutput: 'Sum: 55',
    hints: [
              'The `total` is exactly 10 less than it should be. Which number is not being added?',
              'Look at the loop header. Does `1 until 10` ever give the value 10?',
              'Change until to the range operator that includes the last number.',
            ],
    explanation:
      '`until` does not include its upper bound, so `1 until 10` gives 1 to 9 and the sum is 45. The range `1..10` includes both ends, so 10 is added too and the sum is 55.',
  },

  // while
  {
    id: 'world-4-practice-debug-ticket-loop',
    worldId: 'world-4',
    conceptTags: ['lesson:while', 'while-loop', 'boundary'],
    summary: 'A while loop that should print five tickets stops after four.',
    title: 'Fix the Ticket Loop',
    subtitle: 'The program should print five tickets, but it stops after Ticket 4.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the loop condition stops one pass early',
    brokenCode: `fun main() {
  var n = 1

  while (n < 5) {
    println("Ticket $n")
    n++
  }
}`,
    fixedCode: `fun main() {
  var n = 1

  while (n <= 5) {
    println("Ticket $n")
    n++
  }
}`,
    expectedOutput: 'Ticket 1\nTicket 2\nTicket 3\nTicket 4\nTicket 5',
    hints: [
              'Ticket 5 is missing. Check the value of `n` when the loop decides whether to run again.',
              'When `n` is 5, is `n < 5` true or false? What does that mean for the pass with `n = 5`?',
              'Change the condition so that it is still true when `n` is 5.',
            ],
    explanation:
      'A `while` loop checks its condition before each pass. When `n` reached 5, `n < 5` was false, so the pass for Ticket 5 never ran. `n <= 5` is still true at 5, so the fifth pass runs. Then `n` becomes 6 and the loop ends.',
  },

  // do-while
  {
    id: 'world-4-practice-debug-digit-counter',
    worldId: 'world-4',
    conceptTags: ['lesson:do-while', 'do-while-loop', 'while-loop'],
    summary: 'A digit counter reports 0 digits for the number 0, because a while loop can skip its body.',
    title: 'Fix the Digit Counter',
    subtitle: 'The program reports 0 digits for the number 0, but 0 has one digit. It should print Digits: 1.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: while can run zero times where do-while must run once',
    brokenCode: `fun main() {
  var n = 0
  var digits = 0

  while (n > 0) {
    digits++
    n /= 10
  }

  println("Digits: $digits")
}`,
    fixedCode: `fun main() {
  var n = 0
  var digits = 0

  do {
    digits++
    n /= 10
  } while (n > 0)

  println("Digits: $digits")
}`,
    expectedOutput: 'Digits: 1',
    hints: [
              'The program gives a count of 0 for the number 0. Does the loop body run at all?',
              'A `while` loop checks its condition before running the body. With `n = 0`, is `n > 0` true?',
              'Switch to a `do-while` loop so the body runs once before the condition is checked.',
            ],
    explanation:
      '`while (n > 0)` is false right away when `n` is 0, so the body never ran and `digits` stayed 0. A `do-while` runs the body once before it checks the condition, so the digit is counted. Then `n / 10` is 0 and the loop ends.',
  },

  // ranges
  {
    id: 'world-4-practice-debug-pass-range',
    worldId: 'world-4',
    conceptTags: ['lesson:ranges', 'range-membership', 'until', 'boundary'],
    summary: 'A pass count misses the top score because the range uses until.',
    title: 'Fix the Pass Range',
    subtitle: 'The program checks the scores 55 to 100, and scores 60 to 100 pass. That is 41 passing scores, but the program counts only 40.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: an exclusive range drops the top score',
    brokenCode: `fun main() {
  var passed = 0

  for (score in 55..100) {
    if (score in 60 until 100) {
      passed++
    }
  }

  println("Passed: $passed")
}`,
    fixedCode: `fun main() {
  var passed = 0

  for (score in 55..100) {
    if (score in 60..100) {
      passed++
    }
  }

  println("Passed: $passed")
}`,
    expectedOutput: 'Passed: 41',
    hints: [
              'The count is one less than it should be. Which `score` could be missing from the passing range?',
              'Look at the upper end of the range in the if. Is 100 inside `60 until 100`?',
              'Use a range that includes both ends, so a `score` of 100 counts as a pass.',
            ],
    explanation:
      '`until` stops just before its upper bound, so `60 until 100` covers 60 to 99, and a perfect 100 was not counted. `60..100` includes both ends, so all 41 passing scores (60 to 100) are counted.',
  },

  // progressions
  {
    id: 'world-4-practice-debug-negative-step',
    worldId: 'world-4',
    conceptTags: ['lesson:progressions', 'step', 'downto', 'runtime-error'],
    summary: 'A countdown with a negative step crashes instead of counting down.',
    title: 'Fix the Negative Step',
    subtitle: 'The program should count down by twos from 10 and print Total: 30. Instead, it stops with an error before it prints anything.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: step must be positive',
    brokenCode: `fun main() {
  var total = 0

  for (i in 10 downTo 1 step -2) {
    total += i
  }

  println("Total: $total")
}`,
    fixedCode: `fun main() {
  var total = 0

  for (i in 10 downTo 1 step 2) {
    total += i
  }

  println("Total: $total")
}`,
    expectedOutput: 'Total: 30',
    hints: [
              'The program stops with an error before it prints the `total`. What does the error message say about the step?',
              '`downTo` already counts backwards, so step only sets the size of each jump. Can a jump size be negative?',
              'Give step a positive size. The direction already comes from `downTo`.',
            ],
    explanation:
      'A step is a size, so it must be positive. Kotlin throws `IllegalArgumentException`: "Step must be positive" for `step -2`. The direction is already set by `downTo`, so `step 2` counts 10, 8, 6, 4, 2 and the `total` is 30.',
  },

  // downTo
  {
    id: 'world-4-practice-debug-last-floor',
    worldId: 'world-4',
    conceptTags: ['lesson:downto', 'downto', 'boundary'],
    summary: 'A floor countdown never reaches the ground floor.',
    title: 'Fix the Last Floor',
    subtitle: 'The program should print floors 3, 2, 1 and 0, but it stops at Floor 1.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: downTo stops at the wrong end',
    brokenCode: `fun main() {
  for (f in 3 downTo 1) {
    println("Floor $f")
  }
}`,
    fixedCode: `fun main() {
  for (f in 3 downTo 0) {
    println("Floor $f")
  }
}`,
    expectedOutput: 'Floor 3\nFloor 2\nFloor 1\nFloor 0',
    hints: [
              'The countdown stops one floor too early. What is the last value the loop gives?',
              '`downTo` includes its end value but nothing after it. What end value does the loop header use?',
              'Change the end value so the loop reaches the ground floor, 0.',
            ],
    explanation:
      '`a downTo b` counts down to b and stops there (b is included). With `3 downTo 1` the last value is 1, so floor 0 was never reached. `3 downTo 0` includes the ground floor.',
  },

  // step
  {
    id: 'world-4-practice-debug-even-sum',
    worldId: 'world-4',
    conceptTags: ['lesson:step', 'step', 'for-loop'],
    summary: 'A sum of even numbers actually adds the odd ones, because the range starts at 1.',
    title: 'Fix the Even Sum',
    subtitle: 'The program should add the even numbers from 1 to 10 and print 30, but it prints 25.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a step of 2 from an odd start',
    brokenCode: `fun main() {
  var total = 0

  for (n in 1..10 step 2) {
    total += n
  }

  println("Sum of evens: $total")
}`,
    fixedCode: `fun main() {
  var total = 0

  for (n in 2..10 step 2) {
    total += n
  }

  println("Sum of evens: $total")
}`,
    expectedOutput: 'Sum of evens: 30',
    hints: [
              'The `total` is 25, not 30. Which numbers does the loop really visit?',
              '`step 2` jumps by two, but the first value decides whether you get odd or even numbers. What does the loop start at?',
              'Start the range at an even number.',
            ],
    explanation:
      'A step only changes the gap. The first value decides the pattern. `1..10 step 2` visits 1, 3, 5, 7, 9 (sum 25). Starting at 2 visits 2, 4, 6, 8, 10, whose sum is 30.',
  },

  // break
  {
    id: 'world-4-practice-debug-square-search',
    worldId: 'world-4',
    conceptTags: ['lesson:break', 'break', 'for-loop'],
    summary: 'A search leaves the loop before it saves the value it found.',
    title: 'Fix the Square Search',
    subtitle: 'The program should find the first number whose square is above 50 (it is 8), but it prints -1.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: break comes before the assignment',
    brokenCode: `fun main() {
  var found = -1

  for (i in 1..20) {
    if (i * i > 50) {
      break
      found = i
    }
  }

  println("First number whose square exceeds 50: $found")
}`,
    fixedCode: `fun main() {
  var found = -1

  for (i in 1..20) {
    if (i * i > 50) {
      found = i
      break
    }
  }

  println("First number whose square exceeds 50: $found")
}`,
    expectedOutput: 'First number whose square exceeds 50: 8',
    hints: [
              'The loop stops at the right moment, but the answer is still `-1`. Which line never runs?',
              '`break` leaves the loop immediately. What happens to the lines written after it in the same block?',
              'Save the value before the `break`, so the assignment runs.',
            ],
    explanation:
      '`break` ends the loop at once, so `found = i` written after it can never run. If you assign `found` before the `break`, it records 8 and then the loop stops.',
  },

  // continue
  {
    id: 'world-4-practice-debug-stuck-loop',
    worldId: 'world-4',
    conceptTags: ['lesson:continue', 'continue', 'while-loop', 'runtime-error'],
    summary: 'A while loop with continue never finishes, because the counter is updated after the skipped line.',
    title: 'Fix the Stuck Loop',
    subtitle: 'The program should add the numbers 1 to 10 except the multiples of 3, but it never finishes.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: continue skips the counter update',
    brokenCode: `fun main() {
  var i = 1
  var total = 0

  while (i <= 10) {
    if (i % 3 == 0) {
      continue
    }
    total += i
    i++
  }

  println("Sum: $total")
}`,
    fixedCode: `fun main() {
  var i = 1
  var total = 0

  while (i <= 10) {
    val current = i
    i++
    if (current % 3 == 0) {
      continue
    }
    total += current
  }

  println("Sum: $total")
}`,
    expectedOutput: 'Sum: 37',
    hints: [
              'The program reports a possible infinite loop. It works until `i` reaches a certain number. Which number is it?',
              'When `i` is 3, `continue` jumps back to the condition. Did `i++` run before that jump?',
              'Make sure `i` is increased before `continue` can skip it.',
            ],
    explanation:
      '`continue` skips the rest of the pass, including `i++` at the bottom. When `i` became 3 it was never increased, so the loop tested `i = 3` forever. If the counter moves forward before the `continue`, every pass makes progress. The sum of 1 to 10 without 3, 6 and 9 is 37.',
  },

  // nested loops
  {
    id: 'world-4-practice-debug-row-break',
    worldId: 'world-4',
    conceptTags: ['lesson:nested-loops', 'nested-loop', 'print-println'],
    summary: 'A grid prints one cell per line, because the line break is inside the inner loop.',
    title: 'Fix the Row Break',
    subtitle: 'The program should print two rows of three cells, but every cell is on its own line.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: println() is inside the wrong loop',
    brokenCode: `fun main() {
  for (r in 1..2) {
    for (c in 1..3) {
      print("[$r-$c]")
      println()
    }
  }
}`,
    fixedCode: `fun main() {
  for (r in 1..2) {
    for (c in 1..3) {
      print("[$r-$c]")
    }
    println()
  }
}`,
    expectedOutput: '[1-1][1-2][1-3]\n[2-1][2-2][2-3]',
    hints: [
              'Every cell is on its own line. Which loop runs once for each cell?',
              '`println()` ends a line. It runs once for every pass of the loop it is inside. Which loop should decide when a row ends?',
              'Move `println()` so it runs once per row: after the inner loop, but still inside the outer loop.',
            ],
    explanation:
      'The inner loop runs once per cell, so a `println()` inside it ended the line after every cell. The line should end once per row. That means after the inner loop finishes, inside the outer loop.',
  },
  {
    id: 'world-4-practice-debug-pair-search',
    worldId: 'world-4',
    conceptTags: ['lesson:nested-loops', 'nested-loop', 'break', 'flag'],
    summary: 'A search for the first pair keeps printing pairs, because break only leaves the inner loop.',
    title: 'Fix the Pair Search',
    subtitle: 'The program should print only the first pair that adds up to 10, but it prints nine pairs.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: break exits only the inner loop',
    brokenCode: `fun main() {
  val target = 10
  var found = false

  for (a in 1..9) {
    for (b in 1..9) {
      if (a + b == target) {
        println("Pair: $a + $b")
        found = true
        break
      }
    }
  }
}`,
    fixedCode: `fun main() {
  val target = 10
  var found = false

  for (a in 1..9) {
    for (b in 1..9) {
      if (a + b == target) {
        println("Pair: $a + $b")
        found = true
        break
      }
    }
    if (found) {
      break
    }
  }
}`,
    expectedOutput: 'Pair: 1 + 9',
    hints: [
              'The first pair is correct, but the program keeps going. Which loop does the `break` stop?',
              '`break` only leaves the loop it is written directly inside. What does the outer loop do next?',
              'After the inner loop, check `found`. If it is true, stop the outer loop as well.',
            ],
    explanation:
      '`break` leaves only the nearest loop around it, which is the inner loop here. The outer loop then moved on to `a = 2`, reached `b = 8`, and so on, so nine pairs were printed. If you check the `found` flag after the inner loop and `break` the outer loop too, it stops after the first pair.',
  },
];
