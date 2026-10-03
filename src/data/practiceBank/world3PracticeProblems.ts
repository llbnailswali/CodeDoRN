import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 3 -- Decision Maker (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-6 dependent steps, the construct is named in the step.
//   hard   -- an anticipated trap (boundary values, branch order, nested
//             decisions, a value that flows through two or three decisions) and
//             multi-line or formatted output; the step names the quantity rather
//             than the exact construct.
//
// Engine limits these tasks respect (PITFALLS.md): every `when` branch result is
// a single line, no subject-less `when`, no `is Char`, no if-expression nested
// inside a `when` branch. Expected values are hand-derived from Kotlin's rules
// and verified by scripts/test-practice-bank.ts. The Boss is not in the tab.

export const WORLD_3_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // --------------------------------------------------------------------- if
  {
    id: 'world-3-practice-writerun-fitness-check',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Run several independent if checks, one of them driven by a calculated value.',
    conceptTags: ['lesson:if', 'if-statement', 'comparison', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Fitness Check',
    goal:
      'A fitness app has daily targets: 10,000 steps, at least 7 hours of sleep and at least 2 liters of water. Today you walked 8,200 steps, slept 6 hours and drank 1.5 liters. Show a message for each target that was not reached. Always print a completion line at the end.',
    description:
      '1. **Find the steps left.** Create `val remaining`: `goal` minus `steps`.\n\n' +
              '2. **Check the steps goal.** Use an `if` to print "Steps goal reached" when `steps` is at least `goal`.\n\n' +
              '3. **Print the steps still to go.** Use an `if` with a string template. Print the remaining steps only when `remaining` is above 0:\n"Steps to go: 1800"\n\n' +
              '4. **Check the sleep.** Use an `if` to print "Sleep more" when `sleepHours` is below 7.\n\n' +
              '5. **Check the water.** Use an `if` to print "Drink water" when `waterLiters` is below 2.0.\n\n' +
              '6. **Finish the check.** Always print "Check complete".',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the steps left.** Use `goal` and `steps`.',
          '2. **Check the steps goal.** Use an `if`.',
          '3. **Print the steps still to go.** Only when `remaining` is above 0.',
          '4. **Check the sleep.** Use an `if`.',
          '5. **Check the water.** Use an `if`.',
          '6. **Finish the check.** Print the last line.',
        ],
        comments: [
          '// 1. Find the steps left. Use goal and steps.',
          '// 2. Check the steps goal. Use an if.',
          '// 3. Print the steps still to go. Only when remaining is above 0.',
          '// 4. Check the sleep. Use an if.',
          '// 5. Check the water. Use an if.',
          '// 6. Finish the check. Print the last line.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the steps left.**',
          '2. **Check the steps goal.**',
          '3. **Print the steps still to go.**',
          '4. **Check the sleep.**',
          '5. **Check the water.**',
          '6. **Finish the check.**',
        ],
        comments: [
          '// 1. Find the steps left.',
          '// 2. Check the steps goal.',
          '// 3. Print the steps still to go.',
          '// 4. Check the sleep.',
          '// 5. Check the water.',
          '// 6. Finish the check.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FitnessCheck.kt',
    initialCode: `fun main() {
  val steps = 8200
  val sleepHours = 6
  val waterLiters = 1.5
  val goal = 10000

  // 1. Find the steps left. Create val remaining: goal minus steps.

  // 2. Check the steps goal. Use an if to print "Steps goal reached" when steps is at least goal.

  // 3. Print the steps still to go. Use an if with a string template. Print the remaining steps only when remaining is above 0: "Steps to go: 1800"

  // 4. Check the sleep. Use an if to print "Sleep more" when sleepHours is below 7.

  // 5. Check the water. Use an if to print "Drink water" when waterLiters is below 2.0.

  // 6. Finish the check. Always print "Check complete".
}`,
    solutionCode: `fun main() {
  val steps = 8200
  val sleepHours = 6
  val waterLiters = 1.5
  val goal = 10000

  val remaining = goal - steps

  if (steps >= goal) {
    println("Steps goal reached")
  }

  if (remaining > 0) {
    println("Steps to go: $remaining")
  }

  if (sleepHours < 7) {
    println("Sleep more")
  }

  if (waterLiters < 2.0) {
    println("Drink water")
  }

  println("Check complete")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Steps to go: 1800\nSleep more\nDrink water\nCheck complete',
    testCase: { call: '', expected: 'Steps to go: 1800\nSleep more\nDrink water\nCheck complete' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'steps', originalLiteral: '8200', alternateLiteral: '12000' },
        { variableName: 'sleepHours', originalLiteral: '6', alternateLiteral: '8' },
      ],
      alternateExpectedOutput: 'Steps goal reached\nDrink water\nCheck complete',
    },
  },
  {
    id: 'world-3-practice-writerun-risk-score',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Build a risk score from independent if rules, then decide on an alert.',
    conceptTags: ['lesson:if', 'if-statement', 'compound-assignment', 'logical-and', 'statement-order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Risk Score',
    goal:
      'A monitoring tool gives a server a risk score. It adds points for a busy CPU, high memory with swap use and a nearly full disk. Find the score from the readings. Show an alert only if the score reaches 60. Print the final score.',
    description:
      '1. **Check the CPU.** Add 40 to `risk` when `cpuPercent` is above 80.\n\n' +
              '2. **Check memory and swap.** Add 30 to `risk` when `memoryPercent` is above 70 AND swap is in use (`swapMb` is above 0).\n\n' +
              '3. **Check the disk.** Add 30 to `risk` when `diskPercent` is at least 95.\n\n' +
              '4. **Raise the alert.** Print "ALERT" only when `risk` is at least 60.\n\n' +
              '5. **Print the score.** Use a string template:\n"Risk: 70"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check the CPU.** Add points to `risk`.',
          '2. **Check memory and swap.** Both conditions must be true.',
          '3. **Check the disk.**',
          '4. **Raise the alert.** Compare `risk` with 60.',
          '5. **Print the score.**',
        ],
        comments: [
          '// 1. Check the CPU. Add points to risk.',
          '// 2. Check memory and swap. Both conditions must be true.',
          '// 3. Check the disk.',
          '// 4. Raise the alert. Compare risk with 60.',
          '// 5. Print the score.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check the CPU.**',
          '2. **Check memory and swap.**',
          '3. **Check the disk.**',
          '4. **Raise the alert.**',
          '5. **Print the score.**',
        ],
        comments: [
          '// 1. Check the CPU.',
          '// 2. Check memory and swap.',
          '// 3. Check the disk.',
          '// 4. Raise the alert.',
          '// 5. Print the score.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RiskScore.kt',
    initialCode: `fun main() {
  val cpuPercent = 85
  val memoryPercent = 72
  val swapMb = 0
  val diskPercent = 96
  var risk = 0

  // 1. Check the CPU. Add 40 to risk when cpuPercent is above 80.

  // 2. Check memory and swap. Add 30 to risk when memoryPercent is above 70 AND swap is in use (swapMb is above 0).

  // 3. Check the disk. Add 30 to risk when diskPercent is at least 95.

  // 4. Raise the alert. Print "ALERT" only when risk is at least 60.

  // 5. Print the score. Use a string template: "Risk: 70"
}`,
    solutionCode: `fun main() {
  val cpuPercent = 85
  val memoryPercent = 72
  val swapMb = 0
  val diskPercent = 96
  var risk = 0

  if (cpuPercent > 80) {
    risk += 40
  }

  if (memoryPercent > 70 && swapMb > 0) {
    risk += 30
  }

  if (diskPercent >= 95) {
    risk += 30
  }

  if (risk >= 60) {
    println("ALERT")
  }

  println("Risk: $risk")
}`,
    sampleInput: 'main()',
    expectedOutput: 'ALERT\nRisk: 70',
    testCase: { call: '', expected: 'ALERT\nRisk: 70' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'cpuPercent', originalLiteral: '85', alternateLiteral: '60' },
        { variableName: 'swapMb', originalLiteral: '0', alternateLiteral: '5' },
      ],
      alternateExpectedOutput: 'ALERT\nRisk: 60',
    },
  },

  // --------------------------------------------------------------- if / else
  {
    id: 'world-3-practice-writerun-parking-fee',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Set a fee inside an if/else statement, then cap it with an if/else expression.',
    conceptTags: ['lesson:if-else', 'if-else-statement', 'if-else-expression', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Parking Fee',
    goal:
      'A car park charges 5 for the first 2 hours and 3 for each extra hour. The total charge cannot be more than 12. Find the fee for a 5-hour stay and the amount actually charged. Print both.',
    description:
      '1. **Work out the fee.** Use an `if`/`else` statement. When `hours` is at most 2, set `fee` to 5. Otherwise, set `fee` to 5 plus 3 for every hour after the first 2.\n\n' +
              '2. **Cap the fee.** Create `val charged` with a one-line `if`/`else` expression. It is 12 when `fee` is above 12, otherwise `fee` itself.\n\n' +
              '3. **Print the report.** Use string templates:\n"Fee: 14 | Charged: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Work out the fee.** Use an `if`/`else` statement.',
          '2. **Cap the fee.** Use a one-line `if`/`else` expression.',
          '3. **Print the report.**',
        ],
        comments: [
          '// 1. Work out the fee. Use an if/else statement.',
          '// 2. Cap the fee. Use a one-line if/else expression.',
          '// 3. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Work out the fee.**',
          '2. **Cap the fee.**',
          '3. **Print the report.**',
        ],
        comments: [
          '// 1. Work out the fee.',
          '// 2. Cap the fee.',
          '// 3. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ParkingFee.kt',
    initialCode: `fun main() {
  val hours = 5
  var fee = 0

  // 1. Work out the fee. Use an if/else statement. When hours is at most 2, set fee to 5. Otherwise, set fee to 5 plus 3 for every hour after the first 2.

  // 2. Cap the fee. Create val charged with a one-line if/else expression. It is 12 when fee is above 12, otherwise fee itself.

  // 3. Print the report. Use string templates: "Fee: 14 | Charged: 12"
}`,
    solutionCode: `fun main() {
  val hours = 5
  var fee = 0

  if (hours <= 2) {
    fee = 5
  } else {
    fee = 5 + (hours - 2) * 3
  }

  val charged = if (fee > 12) 12 else fee

  println("Fee: $fee | Charged: $charged")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Fee: 14 | Charged: 12',
    testCase: { call: '', expected: 'Fee: 14 | Charged: 12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hours', originalLiteral: '5', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Fee: 8 | Charged: 8',
    },
  },
  {
    id: 'world-3-practice-writerun-leap-year',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Combine remainder checks with &&, || and ! to decide whether a year is a leap year.',
    conceptTags: ['lesson:if-else', 'if-else-statement', 'remainder', 'logical-and', 'logical-or', 'grouping'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Leap Year',
    goal:
      'Find if 2024 is a leap year. A year divisible by 4 is a leap year, except a century year must also be divisible by 400. Check each rule, combine the results into one answer and print which case applies.',
    description:
      '1. **Test for 4.** Create `val divisibleBy4`: whether `year` divides evenly by 4.\n\n' +
              '2. **Test for 100.** Create `val divisibleBy100`: whether `year` divides evenly by 100.\n\n' +
              '3. **Test for 400.** Create `val divisibleBy400`: whether `year` divides evenly by 400.\n\n' +
              '4. **Combine the tests.** Create `val isLeap`. A year is a leap year when it is divisible by 4, except century years (divisible by 100), which must also be divisible by 400.\n\n' +
              '5. **Print the answer.** Use an `if`/`else` and a string template:\n"2024 is a leap year"\nWhen the year is not a leap year, print "2024 is not a leap year" style text instead.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Test for 4.** Use `%`.',
          '2. **Test for 100.** Use `%`.',
          '3. **Test for 400.** Use `%`.',
          '4. **Combine the tests.** Use `&&`, `||` and `!`.',
          '5. **Print the answer.** Use `if`/`else`.',
        ],
        comments: [
          '// 1. Test for 4. Use %.',
          '// 2. Test for 100. Use %.',
          '// 3. Test for 400. Use %.',
          '// 4. Combine the tests. Use &&, || and !.',
          '// 5. Print the answer. Use if/else.',
        ],
      },
      experienced: {
        steps: [
          '1. **Test for 4.**',
          '2. **Test for 100.**',
          '3. **Test for 400.**',
          '4. **Combine the tests.**',
          '5. **Print the answer.**',
        ],
        comments: [
          '// 1. Test for 4.',
          '// 2. Test for 100.',
          '// 3. Test for 400.',
          '// 4. Combine the tests.',
          '// 5. Print the answer.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LeapYear.kt',
    initialCode: `fun main() {
  val year = 2024

  // 1. Test for 4. Create val divisibleBy4: whether year divides evenly by 4.

  // 2. Test for 100. Create val divisibleBy100: whether year divides evenly by 100.

  // 3. Test for 400. Create val divisibleBy400: whether year divides evenly by 400.

  // 4. Combine the tests. Create val isLeap. A year is a leap year when it is divisible by 4, except century years (divisible by 100), which must also be divisible by 400.

  // 5. Print the answer. Use an if/else and a string template: "2024 is a leap year" When the year is not a leap year, print "2024 is not a leap year" style text instead.
}`,
    solutionCode: `fun main() {
  val year = 2024

  val divisibleBy4 = year % 4 == 0
  val divisibleBy100 = year % 100 == 0
  val divisibleBy400 = year % 400 == 0
  val isLeap = divisibleBy4 && (!divisibleBy100 || divisibleBy400)

  if (isLeap) {
    println("$year is a leap year")
  } else {
    println("$year is not a leap year")
  }
}`,
    sampleInput: 'main()',
    expectedOutput: '2024 is a leap year',
    testCase: { call: '', expected: '2024 is a leap year' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'year', originalLiteral: '2024', alternateLiteral: '1900' }],
      alternateExpectedOutput: '1900 is not a leap year',
    },
  },

  // --------------------------------------------------------------- else if
  {
    id: 'world-3-practice-writerun-grade-report',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Add a bonus to a score, then pick a letter grade with an else-if chain.',
    conceptTags: ['lesson:else-if', 'else-if-chain', 'boundary', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Grade Report',
    goal:
      'A student scored 78 and gets a 5-point bonus. Add the bonus. Give the new score a grade: A from 90, B from 80, C from 70, D from 60 and F below that. Print the new score and the grade.',
    description:
      '1. **Add the bonus.** Create `val adjusted`: `score` plus `bonus`.\n\n' +
              '2. **Pick the grade.** Use an `if` / `else if` chain on `adjusted` to set `grade`: "A" for 90 or more, "B" for 80 or more, "C" for 70 or more, "D" for 60 or more. Anything lower keeps "F".\n\n' +
              '3. **Print the report.** Use string templates:\n"Adjusted: 83 | Grade: B"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the bonus.**',
          '2. **Pick the grade.** Use an `if` / `else if` chain.',
          '3. **Print the report.**',
        ],
        comments: [
          '// 1. Add the bonus.',
          '// 2. Pick the grade. Use an if / else if chain.',
          '// 3. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the bonus.**',
          '2. **Pick the grade.**',
          '3. **Print the report.**',
        ],
        comments: [
          '// 1. Add the bonus.',
          '// 2. Pick the grade.',
          '// 3. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GradeReport.kt',
    initialCode: `fun main() {
  val score = 78
  val bonus = 5
  var grade = "F"

  // 1. Add the bonus. Create val adjusted: score plus bonus.

  // 2. Pick the grade. Use an if / else if chain on adjusted to set grade: "A" for 90 or more, "B" for 80 or more, "C" for 70 or more, "D" for 60 or more. Anything lower keeps "F".

  // 3. Print the report. Use string templates: "Adjusted: 83 | Grade: B"
}`,
    solutionCode: `fun main() {
  val score = 78
  val bonus = 5
  var grade = "F"

  val adjusted = score + bonus

  if (adjusted >= 90) {
    grade = "A"
  } else if (adjusted >= 80) {
    grade = "B"
  } else if (adjusted >= 70) {
    grade = "C"
  } else if (adjusted >= 60) {
    grade = "D"
  }

  println("Adjusted: $adjusted | Grade: $grade")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Adjusted: 83 | Grade: B',
    testCase: { call: '', expected: 'Adjusted: 83 | Grade: B' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'score', originalLiteral: '78', alternateLiteral: '85' }],
      alternateExpectedOutput: 'Adjusted: 90 | Grade: A',
    },
  },
  {
    id: 'world-3-practice-writerun-tax-bracket',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Pick a tax rate with an ordered else-if chain, then work out the tax and the net income.',
    conceptTags: ['lesson:else-if', 'else-if-chain', 'boundary', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Tax Bracket',
    goal:
      'A tax office uses different rates based on income: 0 percent below 10,000, 10 percent below 40,000, 20 percent below 90,000 and 30 percent for anything higher. For an income of 62,000, find the rate, tax and take-home amount. Print all three.',
    description:
      '1. **Choose the rate.** Set `rate` from `income` with an `else if` chain: 0 below 10000, 10 below 40000, 20 below 90000, and 30 for everything else.\n\n' +
              '2. **Work out the tax.** Create `val tax`: `rate` percent of `income` (`income` times `rate`, divided by 100).\n\n' +
              '3. **Work out the take-home pay.** Create `val net`: `income` minus `tax`.\n\n' +
              '4. **Print three lines.** Use string templates:\n"Rate: 20%"\n"Tax: 12400"\n"Net: 49600"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Choose the rate.** Use an `else if` chain on `income`.',
          '2. **Work out the tax.** Take a percent of `income`.',
          '3. **Work out the take-home pay.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Choose the rate. Use an else if chain on income.',
          '// 2. Work out the tax. Take a percent of income.',
          '// 3. Work out the take-home pay.',
          '// 4. Print three lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Choose the rate.**',
          '2. **Work out the tax.**',
          '3. **Work out the take-home pay.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Choose the rate.',
          '// 2. Work out the tax.',
          '// 3. Work out the take-home pay.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TaxBracket.kt',
    initialCode: `fun main() {
  val income = 62000
  var rate = 0

  // 1. Choose the rate. Set rate from income with an else if chain: 0 below 10000, 10 below 40000, 20 below 90000, and 30 for everything else.

  // 2. Work out the tax. Create val tax: rate percent of income (income times rate, divided by 100).

  // 3. Work out the take-home pay. Create val net: income minus tax.

  // 4. Print three lines. Use string templates: "Rate: 20%" "Tax: 12400" "Net: 49600"
}`,
    solutionCode: `fun main() {
  val income = 62000
  var rate = 0

  if (income < 10000) {
    rate = 0
  } else if (income < 40000) {
    rate = 10
  } else if (income < 90000) {
    rate = 20
  } else {
    rate = 30
  }

  val tax = income * rate / 100
  val net = income - tax

  println("Rate: $rate%")
  println("Tax: $tax")
  println("Net: $net")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Rate: 20%\nTax: 12400\nNet: 49600',
    testCase: { call: '', expected: 'Rate: 20%\nTax: 12400\nNet: 49600' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'income', originalLiteral: '62000', alternateLiteral: '90000' }],
      alternateExpectedOutput: 'Rate: 30%\nTax: 27000\nNet: 63000',
    },
  },

  // ------------------------------------------------------------------- when
  {
    id: 'world-3-practice-writerun-arcade-menu',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Use three when statements: an Int subject with a comma list, a String subject, and a calculated subject.',
    conceptTags: ['lesson:when', 'when-statement', 'comma-values', 'string-subject', 'else-branch'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Arcade Menu',
    goal:
      'An arcade machine shows different messages based on the level and game mode. For level 3 in duo mode, find the level name, the number of players and if a bonus is unlocked. Print one line for each.',
    description:
      '1. **Name the level.** Use `when` on `level`. 1 prints "Tutorial". 2 and 3 share one branch (comma-separated) and print "Standard". 4 prints "Hard". Anything else prints "Unknown level".\n\n' +
              '2. **Count the players.** Use `when` on `mode`. "solo" prints "Players: 1", "duo" prints "Players: 2", and anything else prints "Players: many".\n\n' +
              '3. **Find the bonus level.** Create `val bonusLevel`: `level` times 2.\n\n' +
              '4. **Check the bonus.** Use `when` on `bonusLevel`. 6 prints "Bonus unlocked". Anything else prints "No bonus".',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Name the level.** Use `when` on `level`.',
          '2. **Count the players.** Use `when` on `mode`.',
          '3. **Find the bonus level.**',
          '4. **Check the bonus.** Use `when` on `bonusLevel`.',
        ],
        comments: [
          '// 1. Name the level. Use when on level.',
          '// 2. Count the players. Use when on mode.',
          '// 3. Find the bonus level.',
          '// 4. Check the bonus. Use when on bonusLevel.',
        ],
      },
      experienced: {
        steps: [
          '1. **Name the level.**',
          '2. **Count the players.**',
          '3. **Find the bonus level.**',
          '4. **Check the bonus.**',
        ],
        comments: [
          '// 1. Name the level.',
          '// 2. Count the players.',
          '// 3. Find the bonus level.',
          '// 4. Check the bonus.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ArcadeMenu.kt',
    initialCode: `fun main() {
  val level = 3
  val mode = "duo"

  // 1. Name the level. Use when on level. 1 prints "Tutorial". 2 and 3 share one branch (comma-separated) and print "Standard". 4 prints "Hard". Anything else prints "Unknown level".

  // 2. Count the players. Use when on mode. "solo" prints "Players: 1", "duo" prints "Players: 2", and anything else prints "Players: many".

  // 3. Find the bonus level. Create val bonusLevel: level times 2.

  // 4. Check the bonus. Use when on bonusLevel. 6 prints "Bonus unlocked". Anything else prints "No bonus".
}`,
    solutionCode: `fun main() {
  val level = 3
  val mode = "duo"

  when (level) {
    1 -> println("Tutorial")
    2, 3 -> println("Standard")
    4 -> println("Hard")
    else -> println("Unknown level")
  }

  when (mode) {
    "solo" -> println("Players: 1")
    "duo" -> println("Players: 2")
    else -> println("Players: many")
  }

  val bonusLevel = level * 2

  when (bonusLevel) {
    6 -> println("Bonus unlocked")
    else -> println("No bonus")
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'Standard\nPlayers: 2\nBonus unlocked',
    testCase: { call: '', expected: 'Standard\nPlayers: 2\nBonus unlocked' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'level', originalLiteral: '3', alternateLiteral: '4' },
        { variableName: 'mode', originalLiteral: '"duo"', alternateLiteral: '"solo"' },
      ],
      alternateExpectedOutput: 'Hard\nPlayers: 1\nNo bonus',
    },
  },
  {
    id: 'world-3-practice-writerun-month-info',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Turn a month number into its day count and season with two when expressions that use comma lists.',
    conceptTags: ['lesson:when', 'when-expression', 'comma-values', 'else-branch', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Month Info',
    goal:
      'A calendar app needs information about a month. For month 2, find the number of days and the season. Then find how many full weeks are in the month. Print the month summary and the week count.',
    description:
      'Month numbers go from 1 (January) to 12 (December).\n\n' +
              '1. **Find the number of days.** Create `val days` with `when` on `month`: 31 for months 1, 3, 5, 7, 8, 10 and 12; 30 for months 4, 6, 9 and 11; 28 for month 2; and 0 for anything else.\n\n' +
              '2. **Find the season.** Create `val season` with `when` on `month`: "Winter" for 12, 1 and 2; "Spring" for 3, 4 and 5; "Summer" for 6, 7 and 8; "Autumn" for 9, 10 and 11; and "Invalid" for anything else.\n\n' +
              '3. **Count the full weeks.** Create `val weeks`: the number of full 7-day weeks in `days`.\n\n' +
              '4. **Print two lines.** Use string templates:\n"Month 2: 28 days, Winter"\n"Full weeks: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the number of days.** Use `when` with comma-separated months.',
          '2. **Find the season.** Use `when` with comma-separated months.',
          '3. **Count the full weeks.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Find the number of days. Use when with comma-separated months.',
          '// 2. Find the season. Use when with comma-separated months.',
          '// 3. Count the full weeks.',
          '// 4. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the number of days.**',
          '2. **Find the season.**',
          '3. **Count the full weeks.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Find the number of days.',
          '// 2. Find the season.',
          '// 3. Count the full weeks.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MonthInfo.kt',
    initialCode: `fun main() {
  val month = 2

  // 1. Find the number of days. Create val days with when on month: 31 for months 1, 3, 5, 7, 8, 10 and 12; 30 for months 4, 6, 9 and 11; 28 for month 2; and 0 for anything else.

  // 2. Find the season. Create val season with when on month: "Winter" for 12, 1 and 2; "Spring" for 3, 4 and 5; "Summer" for 6, 7 and 8; "Autumn" for 9, 10 and 11; and "Invalid" for anything else.

  // 3. Count the full weeks. Create val weeks: the number of full 7-day weeks in days.

  // 4. Print two lines. Use string templates: "Month 2: 28 days, Winter" "Full weeks: 4"
}`,
    solutionCode: `fun main() {
  val month = 2

  val days = when (month) {
    1, 3, 5, 7, 8, 10, 12 -> 31
    4, 6, 9, 11 -> 30
    2 -> 28
    else -> 0
  }

  val season = when (month) {
    12, 1, 2 -> "Winter"
    3, 4, 5 -> "Spring"
    6, 7, 8 -> "Summer"
    9, 10, 11 -> "Autumn"
    else -> "Invalid"
  }

  val weeks = days / 7

  println("Month $month: $days days, $season")
  println("Full weeks: $weeks")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Month 2: 28 days, Winter\nFull weeks: 4',
    testCase: { call: '', expected: 'Month 2: 28 days, Winter\nFull weeks: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'month', originalLiteral: '2', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Month 7: 31 days, Summer\nFull weeks: 4',
    },
  },

  // ------------------------------------------------------- when with ranges
  {
    id: 'world-3-practice-writerun-age-category',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Sort an age into a group with a when over ranges, then work out a decade and the years to 65.',
    conceptTags: ['lesson:when-ranges', 'when-ranges', 'when-expression', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Age Category',
    goal:
      'A registration form puts people into age groups: child, teen, adult and senior. For someone aged 34, find their group, their decade (30s, 40s and so on) and the number of years until 65. Print one summary line.',
    description:
      '1. **Find the group.** Create `val category` with `when` on `age` and ranges: "Child" for 0 to 12, "Teen" for 13 to 19, "Adult" for 20 to 64, and "Senior" for anything else.\n\n' +
              '2. **Find the decade.** Create `val decade`: `age` rounded down to a multiple of 10. Divide by 10, then multiply by 10.\n\n' +
              '3. **Find the years to 65.** Create `val untilSenior`: 65 minus `age`.\n\n' +
              '4. **Print the summary.** Use string templates. The decade is followed by the letter s:\n"Age 34: Adult | Decade: 30s | Years to 65: 31"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the group.** Use `when` with ranges.',
          '2. **Find the decade.** Use Int division.',
          '3. **Find the years to 65.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Find the group. Use when with ranges.',
          '// 2. Find the decade. Use Int division.',
          '// 3. Find the years to 65.',
          '// 4. Print the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the group.**',
          '2. **Find the decade.**',
          '3. **Find the years to 65.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Find the group.',
          '// 2. Find the decade.',
          '// 3. Find the years to 65.',
          '// 4. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AgeCategory.kt',
    initialCode: `fun main() {
  val age = 34

  // 1. Find the group. Create val category with when on age and ranges: "Child" for 0 to 12, "Teen" for 13 to 19, "Adult" for 20 to 64, and "Senior" for anything else.

  // 2. Find the decade. Create val decade: age rounded down to a multiple of 10. Divide by 10, then multiply by 10.

  // 3. Find the years to 65. Create val untilSenior: 65 minus age.

  // 4. Print the summary. Use string templates. The decade is followed by the letter s: "Age 34: Adult | Decade: 30s | Years to 65: 31"
}`,
    solutionCode: `fun main() {
  val age = 34

  val category = when (age) {
    in 0..12 -> "Child"
    in 13..19 -> "Teen"
    in 20..64 -> "Adult"
    else -> "Senior"
  }

  val decade = age / 10 * 10
  val untilSenior = 65 - age

  println("Age $age: $category | Decade: \${decade}s | Years to 65: $untilSenior")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Age 34: Adult | Decade: 30s | Years to 65: 31',
    testCase: { call: '', expected: 'Age 34: Adult | Decade: 30s | Years to 65: 31' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'age', originalLiteral: '34', alternateLiteral: '19' }],
      alternateExpectedOutput: 'Age 19: Teen | Decade: 10s | Years to 65: 46',
    },
  },
  {
    id: 'world-3-practice-writerun-pace-classifier',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Turn seconds into minutes and seconds, and label a pace, rejecting invalid readings first with !in.',
    conceptTags: ['lesson:when-ranges', 'when-ranges', 'negated-range', 'branch-order', 'remainder'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pace Classifier',
    goal:
      'A running app gets a pace of 350 seconds per km. Change it into minutes and seconds and give it a label from Elite to Easy. Impossible readings must show a Check sensor message. Find the values and print one line.',
    description:
      '1. **Find the minutes.** Create `val minutes`: the whole minutes in `secondsPerKm`.\n\n' +
              '2. **Find the seconds.** Create `val secs`: the seconds left over after the whole minutes.\n\n' +
              '3. **Choose the label.** Create `val label` with `when` on `secondsPerKm`. The first branch must reject invalid readings: outside 1 to 900 gives "Check sensor". After that: 1 to 239 gives "Elite", 240 to 299 gives "Fast", 300 to 389 gives "Steady", and anything else gives "Easy".\n\n' +
              '4. **Print the result.** Use string templates:\n"Pace 5:50 per km: Steady"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the minutes.** Use `/`.',
          '2. **Find the seconds.** Use `%`.',
          '3. **Choose the label.** Check for invalid readings first with `!in`.',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Find the minutes. Use /.',
          '// 2. Find the seconds. Use %.',
          '// 3. Choose the label. Check for invalid readings first with !in.',
          '// 4. Print the result.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the minutes.**',
          '2. **Find the seconds.**',
          '3. **Choose the label.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Find the minutes.',
          '// 2. Find the seconds.',
          '// 3. Choose the label.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PaceClassifier.kt',
    initialCode: `fun main() {
  val secondsPerKm = 350

  // 1. Find the minutes. Create val minutes: the whole minutes in secondsPerKm.

  // 2. Find the seconds. Create val secs: the seconds left over after the whole minutes.

  // 3. Choose the label. Create val label with when on secondsPerKm. The first branch must reject invalid readings: outside 1 to 900 gives "Check sensor". After that: 1 to 239 gives "Elite", 240 to 299 gives "Fast", 300 to 389 gives "Steady", and anything else gives "Easy".

  // 4. Print the result. Use string templates: "Pace 5:50 per km: Steady"
}`,
    solutionCode: `fun main() {
  val secondsPerKm = 350

  val minutes = secondsPerKm / 60
  val secs = secondsPerKm % 60

  val label = when (secondsPerKm) {
    !in 1..900 -> "Check sensor"
    in 1..239 -> "Elite"
    in 240..299 -> "Fast"
    in 300..389 -> "Steady"
    else -> "Easy"
  }

  println("Pace $minutes:$secs per km: $label")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pace 5:50 per km: Steady',
    testCase: { call: '', expected: 'Pace 5:50 per km: Steady' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'secondsPerKm', originalLiteral: '350', alternateLiteral: '273' }],
      alternateExpectedOutput: 'Pace 4:33 per km: Fast',
    },
  },

  // ------------------------------------------------------ when as expression
  {
    id: 'world-3-practice-writerun-temperature-label',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Label a temperature with a when expression and convert it to Fahrenheit.',
    conceptTags: ['lesson:when-expression', 'when-expression', 'when-ranges', 'int-division', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Temperature Label',
    goal:
      'A weather display shows a temperature of 27 C. Give it a label from Freezing to Extreme and change it to Fahrenheit. Print the label and Fahrenheit temperature on one line.',
    description:
      'The temperature is in degrees Celsius.\n\n' +
              '1. **Choose the label.** Create `val label` with `when` on `temp` and ranges: "Freezing" for -50 to 0, "Cold" for 1 to 15, "Mild" for 16 to 25, "Warm" for 26 to 35, and "Extreme" for anything else.\n\n' +
              '2. **Convert to Fahrenheit.** Create `val fahrenheit`: `temp` times 9, divided by 5, plus 32.\n\n' +
              '3. **Print the summary.** Use string templates. A letter follows each number:\n"27C (80F): Warm"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Choose the label.** Use `when` with ranges.',
          '2. **Convert to Fahrenheit.**',
          '3. **Print the summary.**',
        ],
        comments: [
          '// 1. Choose the label. Use when with ranges.',
          '// 2. Convert to Fahrenheit.',
          '// 3. Print the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Choose the label.**',
          '2. **Convert to Fahrenheit.**',
          '3. **Print the summary.**',
        ],
        comments: [
          '// 1. Choose the label.',
          '// 2. Convert to Fahrenheit.',
          '// 3. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TemperatureLabel.kt',
    initialCode: `fun main() {
  val temp = 27

  // 1. Choose the label. Create val label with when on temp and ranges: "Freezing" for -50 to 0, "Cold" for 1 to 15, "Mild" for 16 to 25, "Warm" for 26 to 35, and "Extreme" for anything else.

  // 2. Convert to Fahrenheit. Create val fahrenheit: temp times 9, divided by 5, plus 32.

  // 3. Print the summary. Use string templates. A letter follows each number: "27C (80F): Warm"
}`,
    solutionCode: `fun main() {
  val temp = 27

  val label = when (temp) {
    in -50..0 -> "Freezing"
    in 1..15 -> "Cold"
    in 16..25 -> "Mild"
    in 26..35 -> "Warm"
    else -> "Extreme"
  }

  val fahrenheit = temp * 9 / 5 + 32

  println("\${temp}C (\${fahrenheit}F): $label")
}`,
    sampleInput: 'main()',
    expectedOutput: '27C (80F): Warm',
    testCase: { call: '', expected: '27C (80F): Warm' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'temp', originalLiteral: '27', alternateLiteral: '12' }],
      alternateExpectedOutput: '12C (53F): Cold',
    },
  },
  {
    id: 'world-3-practice-writerun-shipping-cost',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Chain three when expressions, so each result feeds the next one.',
    conceptTags: ['lesson:when-expression', 'when-expression', 'when-ranges', 'comma-values', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shipping Cost',
    goal:
      'A parcel shop finds the shipping price from the weight and destination. A 7 kg parcel is going to the EU. Find the base cost from its weight band and multiply it by the factor for the zone. Label the total as cheap, standard or premium. Print two lines.',
    description:
      '1. **Find the base cost.** Create `val baseCost` with `when` on `weightKg` and ranges: 5 for 1 to 2, 12 for 3 to 10, 30 for 11 to 25, and 60 for anything else.\n\n' +
              '2. **Find the zone factor.** Create `val zoneFactor` with `when` on `zone`: 1 for "LOCAL", 2 for "EU" and "UK" (one comma-separated branch), 3 for "US", and 5 for anything else.\n\n' +
              '3. **Find the total.** Create `val total`: `baseCost` times `zoneFactor`.\n\n' +
              '4. **Choose the label.** Create `val label` with `when` on `total` and ranges: "cheap" for 0 to 10, "standard" for 11 to 50, and "premium" for anything else.\n\n' +
              '5. **Print two lines.** Use string templates:\n"Base: 12 x2 = 24"\n"Shipping: standard"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the base cost.** Use `when` with ranges.',
          '2. **Find the zone factor.** Use `when` on `zone`.',
          '3. **Find the total.**',
          '4. **Choose the label.** Use `when` with ranges on `total`.',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Find the base cost. Use when with ranges.',
          '// 2. Find the zone factor. Use when on zone.',
          '// 3. Find the total.',
          '// 4. Choose the label. Use when with ranges on total.',
          '// 5. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the base cost.**',
          '2. **Find the zone factor.**',
          '3. **Find the total.**',
          '4. **Choose the label.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Find the base cost.',
          '// 2. Find the zone factor.',
          '// 3. Find the total.',
          '// 4. Choose the label.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShippingCost.kt',
    initialCode: `fun main() {
  val weightKg = 7
  val zone = "EU"

  // 1. Find the base cost. Create val baseCost with when on weightKg and ranges: 5 for 1 to 2, 12 for 3 to 10, 30 for 11 to 25, and 60 for anything else.

  // 2. Find the zone factor. Create val zoneFactor with when on zone: 1 for "LOCAL", 2 for "EU" and "UK" (one comma-separated branch), 3 for "US", and 5 for anything else.

  // 3. Find the total. Create val total: baseCost times zoneFactor.

  // 4. Choose the label. Create val label with when on total and ranges: "cheap" for 0 to 10, "standard" for 11 to 50, and "premium" for anything else.

  // 5. Print two lines. Use string templates: "Base: 12 x2 = 24" "Shipping: standard"
}`,
    solutionCode: `fun main() {
  val weightKg = 7
  val zone = "EU"

  val baseCost = when (weightKg) {
    in 1..2 -> 5
    in 3..10 -> 12
    in 11..25 -> 30
    else -> 60
  }

  val zoneFactor = when (zone) {
    "LOCAL" -> 1
    "EU", "UK" -> 2
    "US" -> 3
    else -> 5
  }

  val total = baseCost * zoneFactor

  val label = when (total) {
    in 0..10 -> "cheap"
    in 11..50 -> "standard"
    else -> "premium"
  }

  println("Base: $baseCost x$zoneFactor = $total")
  println("Shipping: $label")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Base: 12 x2 = 24\nShipping: standard',
    testCase: { call: '', expected: 'Base: 12 x2 = 24\nShipping: standard' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'weightKg', originalLiteral: '7', alternateLiteral: '12' },
        { variableName: 'zone', originalLiteral: '"EU"', alternateLiteral: '"US"' },
      ],
      alternateExpectedOutput: 'Base: 30 x3 = 90\nShipping: premium',
    },
  },

  // -------------------------------------------- multiple and nested conditions
  {
    id: 'world-3-practice-writerun-entry-check',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Gate entry with a combined condition, run a nested check inside it, then add a one-line note.',
    conceptTags: ['lesson:multiple-conditions', 'logical-and', 'nested-if', 'if-else-expression'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Entry Check',
    goal:
      'A venue checks age, ticket, ban status and VIP status before allowing entry. A 20-year-old has a ticket and is not banned or VIP. Find if they can enter and which area they can use. Then print an alcohol notice based on their age.',
    description:
      '1. **Check the entry.** Use an `if`/`else`. When `age` is at least 18 AND `hasTicket` is true AND `isBanned` is false, print "Entry allowed". Otherwise, print "Entry denied".\n\n' +
              '2. **Choose the area.** Inside the allowed branch, use another `if`/`else`. Print "VIP lounge" when `isVip` is true, otherwise print "Standard area".\n\n' +
              '3. **Print the alcohol notice.** After the `if`/`else`, create `val note` with a one-line `if`/`else` expression: "No alcohol" when `age` is below 21, otherwise "Alcohol allowed". Then print it.',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check the entry.** Combine three conditions with `&&`.',
          '2. **Choose the area.** Use a nested `if`/`else`.',
          '3. **Print the alcohol notice.** Use a one-line `if`/`else` expression.',
        ],
        comments: [
          '// 1. Check the entry. Combine three conditions with &&.',
          '// 2. Choose the area. Use a nested if/else.',
          '// 3. Print the alcohol notice. Use a one-line if/else expression.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check the entry.**',
          '2. **Choose the area.**',
          '3. **Print the alcohol notice.**',
        ],
        comments: [
          '// 1. Check the entry.',
          '// 2. Choose the area.',
          '// 3. Print the alcohol notice.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'EntryCheck.kt',
    initialCode: `fun main() {
  val age = 20
  val hasTicket = true
  val isBanned = false
  val isVip = false

  // 1. Check the entry. Use an if/else. When age is at least 18 AND hasTicket is true AND isBanned is false, print "Entry allowed". Otherwise, print "Entry denied".

  // 2. Choose the area. Inside the allowed branch, use another if/else. Print "VIP lounge" when isVip is true, otherwise print "Standard area".

  // 3. Print the alcohol notice. After the if/else, create val note with a one-line if/else expression: "No alcohol" when age is below 21, otherwise "Alcohol allowed". Then print it.
}`,
    solutionCode: `fun main() {
  val age = 20
  val hasTicket = true
  val isBanned = false
  val isVip = false

  if (age >= 18 && hasTicket && !isBanned) {
    println("Entry allowed")
    if (isVip) {
      println("VIP lounge")
    } else {
      println("Standard area")
    }
  } else {
    println("Entry denied")
  }

  val note = if (age < 21) "No alcohol" else "Alcohol allowed"
  println(note)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Entry allowed\nStandard area\nNo alcohol',
    testCase: { call: '', expected: 'Entry allowed\nStandard area\nNo alcohol' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'age', originalLiteral: '20', alternateLiteral: '25' },
        { variableName: 'isVip', originalLiteral: 'false', alternateLiteral: 'true' },
      ],
      alternateExpectedOutput: 'Entry allowed\nVIP lounge\nAlcohol allowed',
    },
  },
  {
    id: 'world-3-practice-writerun-scholarship-decision',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Decide an award with nested ifs inside an else-if chain, then adjust and cap it.',
    conceptTags: ['lesson:multiple-conditions', 'nested-if', 'else-if-chain', 'compound-assignment', 'if-else-expression'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Scholarship Decision',
    goal:
      'A college gives a scholarship as a percentage of tuition. The amount depends on GPA and family income. Extra volunteering can add a bonus, but the award cannot be more than 100. Find this student\'s final award and its tier (full, partial or none). Print both.',
    description:
      '`award` is a percentage of tuition.\n\n' +
              '1. **Decide for a high GPA.** If `gpa` is at least 3.5, use a nested `if`/`else` on `income`. An income of at most 50000 gives an award of 100, otherwise 50.\n\n' +
              '2. **Decide for a medium GPA.** Otherwise, if `gpa` is at least 3.0, use a nested `if`/`else` on `income`. An income of at most 30000 gives an award of 40, otherwise 0.\n\n' +
              '3. **Leave the award at 0.** For any other GPA, the award stays 0.\n\n' +
              '4. **Add the volunteer bonus.** When `volunteerHours` is at least 100, add 10 to `award`.\n\n' +
              '5. **Cap the award.** An award can never be above 100. When `award` is above 100, set it to 100.\n\n' +
              '6. **Find the tier.** Create `val tier` with a one-line `if` / `else if` / `else` expression: "full" when `award` is at least 100, "partial" when it is above 0, otherwise "none".\n\n' +
              '7. **Print the result.** Use string templates:\n"Award: 100% | Tier: full"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Decide for a high GPA.** Use a nested `if`/`else` on `income`.',
          '2. **Decide for a medium GPA.** Use an `else if` with a nested `if`/`else`.',
          '3. **Leave the award at 0.**',
          '4. **Add the volunteer bonus.**',
          '5. **Cap the award.**',
          '6. **Find the tier.** Use a one-line `if` expression.',
          '7. **Print the result.**',
        ],
        comments: [
          '// 1. Decide for a high GPA. Use a nested if/else on income.',
          '// 2. Decide for a medium GPA. Use an else if with a nested if/else.',
          '// 3. Leave the award at 0.',
          '// 4. Add the volunteer bonus.',
          '// 5. Cap the award.',
          '// 6. Find the tier. Use a one-line if expression.',
          '// 7. Print the result.',
        ],
      },
      experienced: {
        steps: [
          '1. **Decide for a high GPA.**',
          '2. **Decide for a medium GPA.**',
          '3. **Leave the award at 0.**',
          '4. **Add the volunteer bonus.**',
          '5. **Cap the award.**',
          '6. **Find the tier.**',
          '7. **Print the result.**',
        ],
        comments: [
          '// 1. Decide for a high GPA.',
          '// 2. Decide for a medium GPA.',
          '// 3. Leave the award at 0.',
          '// 4. Add the volunteer bonus.',
          '// 5. Cap the award.',
          '// 6. Find the tier.',
          '// 7. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScholarshipDecision.kt',
    initialCode: `fun main() {
  val gpa = 3.6
  val income = 42000
  val volunteerHours = 120
  var award = 0

  // 1. Decide for a high GPA. If gpa is at least 3.5, use a nested if/else on income. An income of at most 50000 gives an award of 100, otherwise 50.

  // 2. Decide for a medium GPA. Otherwise, if gpa is at least 3.0, use a nested if/else on income. An income of at most 30000 gives an award of 40, otherwise 0.

  // 3. Leave the award at 0. For any other GPA, the award stays 0.

  // 4. Add the volunteer bonus. When volunteerHours is at least 100, add 10 to award.

  // 5. Cap the award. An award can never be above 100. When award is above 100, set it to 100.

  // 6. Find the tier. Create val tier with a one-line if / else if / else expression: "full" when award is at least 100, "partial" when it is above 0, otherwise "none".

  // 7. Print the result. Use string templates: "Award: 100% | Tier: full"
}`,
    solutionCode: `fun main() {
  val gpa = 3.6
  val income = 42000
  val volunteerHours = 120
  var award = 0

  if (gpa >= 3.5) {
    if (income <= 50000) {
      award = 100
    } else {
      award = 50
    }
  } else if (gpa >= 3.0) {
    if (income <= 30000) {
      award = 40
    } else {
      award = 0
    }
  } else {
    award = 0
  }

  if (volunteerHours >= 100) {
    award += 10
  }

  if (award > 100) {
    award = 100
  }

  val tier = if (award >= 100) "full" else if (award > 0) "partial" else "none"

  println("Award: $award% | Tier: $tier")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Award: 100% | Tier: full',
    testCase: { call: '', expected: 'Award: 100% | Tier: full' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'gpa', originalLiteral: '3.6', alternateLiteral: '3.2' },
        { variableName: 'income', originalLiteral: '42000', alternateLiteral: '28000' },
      ],
      alternateExpectedOutput: 'Award: 50% | Tier: partial',
    },
  },

  // ---------------------------------------------------------------- is checks
  {
    id: 'world-3-practice-writerun-input-classifier',
    worldId: 'world-3',
    difficulty: 'medium',
    summary: 'Test values of type Any with is and !is, and report each result as a Boolean.',
    conceptTags: ['lesson:type-checks', 'is-check', 'not-is-check', 'boolean', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Input Classifier',
    goal:
      'A data tool gets values of unknown type: a number, some text and a Boolean. Find the real type of each value. Also check once for a type that a value is not. Print all four answers on one line.',
    description:
      'Each value is declared as `Any`, so it can hold any type.\n\n' +
              '1. **Test the number.** Create `val aIsInt`: whether `a` is an Int. Use `is`.\n\n' +
              '2. **Test the text as a number.** Create `val bIsInt`: whether `b` is an Int. Use `is`.\n\n' +
              '3. **Test the Boolean.** Create `val cIsBoolean`: whether `c` is a Boolean. Use `is`.\n\n' +
              '4. **Test what the text is not.** Create `val bIsNotString`: whether `b` is NOT a String. Use `!is`.\n\n' +
              '5. **Print the report.** Use string templates:\n"aIsInt=true | bIsInt=false | cIsBoolean=true | bIsNotString=false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Test the number.** Use `is`.',
          '2. **Test the text as a number.** Use `is`.',
          '3. **Test the Boolean.** Use `is`.',
          '4. **Test what the text is not.** Use `!is`.',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Test the number. Use is.',
          '// 2. Test the text as a number. Use is.',
          '// 3. Test the Boolean. Use is.',
          '// 4. Test what the text is not. Use !is.',
          '// 5. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Test the number.**',
          '2. **Test the text as a number.**',
          '3. **Test the Boolean.**',
          '4. **Test what the text is not.**',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Test the number.',
          '// 2. Test the text as a number.',
          '// 3. Test the Boolean.',
          '// 4. Test what the text is not.',
          '// 5. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'InputClassifier.kt',
    initialCode: `fun main() {
  val a: Any = 42
  val b: Any = "hello"
  val c: Any = true

  // 1. Test the number. Create val aIsInt: whether a is an Int. Use is.

  // 2. Test the text as a number. Create val bIsInt: whether b is an Int. Use is.

  // 3. Test the Boolean. Create val cIsBoolean: whether c is a Boolean. Use is.

  // 4. Test what the text is not. Create val bIsNotString: whether b is NOT a String. Use !is.

  // 5. Print the report. Use string templates: "aIsInt=true | bIsInt=false | cIsBoolean=true | bIsNotString=false"
}`,
    solutionCode: `fun main() {
  val a: Any = 42
  val b: Any = "hello"
  val c: Any = true

  val aIsInt = a is Int
  val bIsInt = b is Int
  val cIsBoolean = c is Boolean
  val bIsNotString = b !is String

  println("aIsInt=$aIsInt | bIsInt=$bIsInt | cIsBoolean=$cIsBoolean | bIsNotString=$bIsNotString")
}`,
    sampleInput: 'main()',
    expectedOutput: 'aIsInt=true | bIsInt=false | cIsBoolean=true | bIsNotString=false',
    testCase: { call: '', expected: 'aIsInt=true | bIsInt=false | cIsBoolean=true | bIsNotString=false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'b', originalLiteral: '"hello"', alternateLiteral: '7' }],
      alternateExpectedOutput: 'aIsInt=true | bIsInt=true | cIsBoolean=true | bIsNotString=true',
    },
  },
  {
    id: 'world-3-practice-writerun-data-validator',
    worldId: 'world-3',
    difficulty: 'hard',
    summary: 'Count the types in three Any values with an is / else-if chain, using a smart cast on a String.',
    conceptTags: ['lesson:type-checks', 'is-check', 'smart-cast', 'else-if-chain', 'compound-assignment'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Data Validator',
    goal:
      'A form gets three values of unknown type. Count how many are whole numbers, texts and other values. Also count the texts longer than one character. Check each value, update the correct count and print all four counts on one line.',
    description:
      '`first`, `second` and `third` are declared as `Any`.\n\n' +
              '1. **Sort the first value.** Use an `if` / `else if` / `else` chain on `first`. Add 1 to `ints` when it is an Int. Add 1 to `texts` when it is a String. Otherwise, add 1 to `others`. A Double is neither an Int nor a String.\n\n' +
              '2. **Sort the second value.** Use the same chain on `second`.\n\n' +
              '3. **Count the long texts.** In the String branch for `second`, also add 1 to `longTexts` when `second.length` is above 1. Kotlin lets you use `.length` there without a cast.\n\n' +
              '4. **Sort the third value.** Use the same chain on `third`.\n\n' +
              '5. **Print the counts.** Use string templates:\n"Ints: 1 | Texts: 1 | Others: 1 | Long texts: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Sort the first value.** Use an `if` / `else if` chain with `is`.',
          '2. **Sort the second value.** Use the same chain.',
          '3. **Count the long texts.** Check the length inside the String branch.',
          '4. **Sort the third value.** Use the same chain.',
          '5. **Print the counts.**',
        ],
        comments: [
          '// 1. Sort the first value. Use an if / else if chain with is.',
          '// 2. Sort the second value. Use the same chain.',
          '// 3. Count the long texts. Check the length inside the String branch.',
          '// 4. Sort the third value. Use the same chain.',
          '// 5. Print the counts.',
        ],
      },
      experienced: {
        steps: [
          '1. **Sort the first value.**',
          '2. **Sort the second value.**',
          '3. **Count the long texts.**',
          '4. **Sort the third value.**',
          '5. **Print the counts.**',
        ],
        comments: [
          '// 1. Sort the first value.',
          '// 2. Sort the second value.',
          '// 3. Count the long texts.',
          '// 4. Sort the third value.',
          '// 5. Print the counts.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DataValidator.kt',
    initialCode: `fun main() {
  val first: Any = 15
  val second: Any = "20"
  val third: Any = 3.5
  var ints = 0
  var texts = 0
  var others = 0
  var longTexts = 0

  // 1. Sort the first value. Use an if / else if / else chain on first. Add 1 to ints when it is an Int. Add 1 to texts when it is a String. Otherwise, add 1 to others. A Double is neither an Int nor a String.

  // 2. Sort the second value. Use the same chain on second.

  // 3. Count the long texts. In the String branch for second, also add 1 to longTexts when second.length is above 1. Kotlin lets you use .length there without a cast.

  // 4. Sort the third value. Use the same chain on third.

  // 5. Print the counts. Use string templates: "Ints: 1 | Texts: 1 | Others: 1 | Long texts: 1"
}`,
    solutionCode: `fun main() {
  val first: Any = 15
  val second: Any = "20"
  val third: Any = 3.5
  var ints = 0
  var texts = 0
  var others = 0
  var longTexts = 0

  if (first is Int) {
    ints++
  } else if (first is String) {
    texts++
  } else {
    others++
  }

  if (second is Int) {
    ints++
  } else if (second is String) {
    texts++
    if (second.length > 1) {
      longTexts++
    }
  } else {
    others++
  }

  if (third is Int) {
    ints++
  } else if (third is String) {
    texts++
  } else {
    others++
  }

  println("Ints: $ints | Texts: $texts | Others: $others | Long texts: $longTexts")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ints: 1 | Texts: 1 | Others: 1 | Long texts: 1',
    testCase: { call: '', expected: 'Ints: 1 | Texts: 1 | Others: 1 | Long texts: 1' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'first', originalLiteral: '15', alternateLiteral: '2.5' },
        { variableName: 'second', originalLiteral: '"20"', alternateLiteral: '"x"' },
      ],
      alternateExpectedOutput: 'Ints: 0 | Texts: 1 | Others: 2 | Long texts: 0',
    },
  },
];

export const WORLD_3_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // if
  {
    id: 'world-3-practice-debug-hot-day-notice',
    worldId: 'world-3',
    conceptTags: ['lesson:if', 'if-statement', 'braces'],
    summary: 'An indented line under a brace-less if runs every time.',
    title: 'Fix the Hot Day Notice',
    subtitle: 'On a 20 degree day the program should print only "Forecast done", but it also prints "Drink water".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: an if without braces controls only one statement',
    brokenCode: `fun main() {
  val temp = 20

  if (temp > 30)
    println("Hot")
    println("Drink water")

  println("Forecast done")
}`,
    fixedCode: `fun main() {
  val temp = 20

  if (temp > 30) {
    println("Hot")
    println("Drink water")
  }

  println("Forecast done")
}`,
    expectedOutput: 'Forecast done',
    hints: [
              'The temperature is 20, so the "Hot" branch should not run, but "Drink water" is printed. Which lines does the `if` really control?',
              'Kotlin ignores indentation. Without braces, an `if` controls only the one statement right after it.',
              'Use curly braces so that both `println` lines belong to the `if`.',
            ],
    explanation:
      'Without curly braces, `if (temp > 30)` controls only the next statement, `println("Hot")`. The "Drink water" line only looks like part of it because it is indented. It is an ordinary statement, so it always runs. Curly braces make both lines depend on the condition.',
  },

  // if / else
  {
    id: 'world-3-practice-debug-member-price',
    worldId: 'world-3',
    conceptTags: ['lesson:if-else', 'if-else-expression'],
    summary: 'A member is charged the full price because the two branches are swapped.',
    title: 'Fix the Member Price',
    subtitle: 'The program should print "Price: 40" for a member, but it prints "Price: 50".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: if and else branches are swapped',
    brokenCode: `fun main() {
  val isMember = true
  val fullPrice = 50
  val memberPrice = 40

  val price = if (isMember) fullPrice else memberPrice

  println("Price: $price")
}`,
    fixedCode: `fun main() {
  val isMember = true
  val fullPrice = 50
  val memberPrice = 40

  val price = if (isMember) memberPrice else fullPrice

  println("Price: $price")
}`,
    expectedOutput: 'Price: 40',
    hints: [
              'The condition is fine, but a member gets the wrong price. Which value does the true branch return?',
              'The value right after the condition is used when the condition is true. What should a member get there?',
              'Swap the two values, so the member price is used when `isMember` is true.',
            ],
    explanation:
      'In `if (condition) A else B`, A is used when the condition is true and B when it is false. `isMember` is true, so the true branch decides the price, and it returned `fullPrice`. If `memberPrice` is in the true branch and `fullPrice` is in the `else` branch, members get the discount.',
  },

  // else if
  {
    id: 'world-3-practice-debug-alert-levels',
    worldId: 'world-3',
    conceptTags: ['lesson:else-if', 'else-if-chain'],
    summary: 'Separate ifs print every matching alert instead of only the most severe one.',
    title: 'Fix the Alert Levels',
    subtitle: 'The program should print only "Critical" for a load of 95, but it prints all three alerts.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: separate ifs instead of an else-if chain',
    brokenCode: `fun main() {
  val load = 95

  if (load >= 90) {
    println("Critical")
  }
  if (load >= 70) {
    println("Warning")
  }
  if (load >= 50) {
    println("Notice")
  }
}`,
    fixedCode: `fun main() {
  val load = 95

  if (load >= 90) {
    println("Critical")
  } else if (load >= 70) {
    println("Warning")
  } else if (load >= 50) {
    println("Notice")
  }
}`,
    expectedOutput: 'Critical',
    hints: [
              'Three messages appear, but only one level should apply. Are the three checks connected to each other?',
              'Each `if` is tested on its own, so every true condition prints. Which keyword links a check to the one before it, so it runs only if the earlier one failed?',
              'Join the checks into one chain, so only the first matching branch runs.',
            ],
    explanation:
      'Three separate `if` statements are three independent decisions, and 95 passes all three conditions. Joining them with `else if` makes it one decision: the first true condition runs and the rest are skipped, so only "Critical" prints.',
  },

  // when
  {
    id: 'world-3-practice-debug-day-planner',
    worldId: 'world-3',
    conceptTags: ['lesson:when', 'when-expression', 'string-subject'],
    summary: 'A when on a String never matches because of letter case.',
    title: 'Fix the Day Planner',
    subtitle: 'The program should print "Sat is a Weekend", but it prints "Sat is a Weekday".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: when branch text differs in letter case',
    brokenCode: `fun main() {
  val day = "Sat"

  val kind = when (day) {
    "sat", "sun" -> "Weekend"
    else -> "Weekday"
  }

  println("$day is a $kind")
}`,
    fixedCode: `fun main() {
  val day = "Sat"

  val kind = when (day) {
    "Sat", "Sun" -> "Weekend"
    else -> "Weekday"
  }

  println("$day is a $kind")
}`,
    expectedOutput: 'Sat is a Weekend',
    hints: [
              'The `when` falls through to `else` even though the day is Saturday. Compare the branch text with the value.',
              'A String branch matches only an exact copy, and "sat" is not the same String as "Sat". What is different?',
              'Change the branch values so they match the capital letters.',
            ],
    explanation:
      'A String matches a `when` branch only when the text is exactly equal, including upper and lower case. "Sat" does not equal "sat", so no branch matched and `else` ran. Branch values "Sat" and "Sun" match the value.',
  },

  // when with ranges
  {
    id: 'world-3-practice-debug-age-band',
    worldId: 'world-3',
    conceptTags: ['lesson:when-ranges', 'when-ranges', 'boundary'],
    summary: 'A range gap leaves age 18 in the else branch.',
    title: 'Fix the Age Band',
    subtitle: 'The program should print "Age 18: Adult", but it prints "Age 18: Senior".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a gap between two ranges',
    brokenCode: `fun main() {
  val age = 18

  val band = when (age) {
    in 0..17 -> "Minor"
    in 19..64 -> "Adult"
    else -> "Senior"
  }

  println("Age $age: $band")
}`,
    fixedCode: `fun main() {
  val age = 18

  val band = when (age) {
    in 0..17 -> "Minor"
    in 18..64 -> "Adult"
    else -> "Senior"
  }

  println("Age $age: $band")
}`,
    expectedOutput: 'Age 18: Adult',
    hints: [
              'Only ages at a boundary are wrong. Look at where one range ends and the next begins.',
              'The first range stops at 17 and the second starts at 19. Which age is between them?',
              'Start the Adult range at the age that is missing.',
            ],
    explanation:
      'The ranges `0..17` and `19..64` leave a gap at 18. No branch matched, so the `else` branch (Senior) ran. Ranges include both ends, so the second range must start at 18 to cover every age.',
  },

  // when as an expression
  {
    id: 'world-3-practice-debug-signal-strength',
    worldId: 'world-3',
    conceptTags: ['lesson:when-expression', 'when-expression', 'branch-order'],
    summary: 'A broad range placed first swallows the narrower branch after it.',
    title: 'Fix the Signal Strength',
    subtitle: 'The program should print "Signal 85: Strong", but it prints "Signal 85: Weak".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: overlapping ranges in the wrong order',
    brokenCode: `fun main() {
  val signal = 85

  val quality = when (signal) {
    in 0..100 -> "Weak"
    in 50..100 -> "Strong"
    else -> "Unknown"
  }

  println("Signal $signal: $quality")
}`,
    fixedCode: `fun main() {
  val signal = 85

  val quality = when (signal) {
    in 50..100 -> "Strong"
    in 0..49 -> "Weak"
    else -> "Unknown"
  }

  println("Signal $signal: $quality")
}`,
    expectedOutput: 'Signal 85: Strong',
    hints: [
              'Every signal from 0 to 100 gets the same answer. Which branch is checked first, and which signals does it match?',
              'A `when` runs the FIRST matching branch. `0..100` already contains 85, so the Strong branch is never reached.',
              'Make the ranges not overlap, so each signal matches only one branch.',
            ],
    explanation:
      'A `when` checks branches from top to bottom and stops at the first match. `in 0..100` matches every signal in the valid range, so "Strong" could never be chosen. Ranges that do not overlap (`50..100` and `0..49`) make each signal match exactly one branch.',
  },

  // multiple and nested conditions
  {
    id: 'world-3-practice-debug-weekend-pass',
    worldId: 'world-3',
    conceptTags: ['lesson:multiple-conditions', 'logical-or', 'logical-and'],
    summary: 'A pass that should apply on either day needs both to be true.',
    title: 'Fix the Weekend Pass',
    subtitle: 'The discount should apply on Saturdays or on holidays. Today is a holiday, but the program prints "Full price" instead of "Discount".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: && used where || is needed',
    brokenCode: `fun main() {
  val isSaturday = false
  val isHoliday = true

  val offer = if (isSaturday && isHoliday) "Discount" else "Full price"

  println(offer)
}`,
    fixedCode: `fun main() {
  val isSaturday = false
  val isHoliday = true

  val offer = if (isSaturday || isHoliday) "Discount" else "Full price"

  println(offer)
}`,
    expectedOutput: 'Discount',
    hints: [
              'Today is a holiday, so a discount is expected, but it prints "Full price". How many of the two conditions does the rule need?',
              'The rule says Saturday OR holiday, so one is enough. What does `&&` need?',
              'Use the operator that is true when either condition is true.',
            ],
    explanation:
      '`&&` is true only when BOTH sides are true. Today is a holiday but not a Saturday, so it failed. The rule needs either one, which is `||`: `false || true` is true.',
  },
  {
    id: 'world-3-practice-debug-dangling-else',
    worldId: 'world-3',
    conceptTags: ['lesson:multiple-conditions', 'nested-if', 'braces', 'dangling-else'],
    summary: 'An else attaches to the inner if instead of the outer one, so a logged-out user sees nothing.',
    title: 'Fix the Dangling Else',
    subtitle: 'A visitor who is not logged in should see "Please log in", but nothing is printed before "Done".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: else binds to the nearest if',
    brokenCode: `fun main() {
  val loggedIn = false
  val isAdmin = true

  if (loggedIn)
    if (isAdmin) println("Admin panel")
  else println("Please log in")

  println("Done")
}`,
    fixedCode: `fun main() {
  val loggedIn = false
  val isAdmin = true

  if (loggedIn) {
    if (isAdmin) println("Admin panel")
  } else println("Please log in")

  println("Done")
}`,
    expectedOutput: 'Please log in\nDone',
    hints: [
              'The visitor is not logged in, but neither message appears. Which `if` does the `else` belong to?',
              'Kotlin ignores indentation. Without braces, an `else` pairs with the nearest `if` above it, which is the `isAdmin` check.',
              'Use braces around the inner `if`, so the `else` pairs with the `loggedIn` check.',
            ],
    explanation:
      'Kotlin pairs an `else` with the nearest unmatched `if`, however the code is indented. So the `else` belonged to `if (isAdmin)`, which is only reached when `loggedIn` is true. For a visitor who is not logged in, nothing ran. Braces around the inner `if` make the `else` belong to `if (loggedIn)`.',
  },

  // is checks
  {
    id: 'world-3-practice-debug-number-check',
    worldId: 'world-3',
    conceptTags: ['lesson:type-checks', 'is-check', 'logical-or', 'logical-and'],
    summary: 'A value is checked as both an Int and a Double at once, which can never be true.',
    title: 'Fix the Number Check',
    subtitle: 'The value 3.5 is a number, but the program prints "Number: false".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: && requires two type checks that exclude each other',
    brokenCode: `fun main() {
  val value: Any = 3.5

  val isNumber = value is Int && value is Double

  println("Number: $isNumber")
}`,
    fixedCode: `fun main() {
  val value: Any = 3.5

  val isNumber = value is Int || value is Double

  println("Number: $isNumber")
}`,
    expectedOutput: 'Number: true',
    hints: [
              'The value is clearly a number, but the result is false. Can one value be an Int and a Double at the same time?',
              '`&&` needs both checks to be true. A single value has exactly one of these types.',
              'Use the operator that needs only one of the two checks to be true.',
            ],
    explanation:
      'A value has one runtime type. 3.5 is a Double and never also an Int, so `value is Int` is false and `&&` can never be true. "Is some kind of number" means Int OR Double, so `||` is the right operator.',
  },
];
