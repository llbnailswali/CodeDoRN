import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 1 -- Kotlin Awakening (medium and hard only).
// Easy tasks are deliberately absent: every lesson already ends with an easy
// Write & Run and an easy Debug in its own 5 stages, so the Practice tab
// starts at the World 1 Boss Write & Run bar (3+ dependent steps, a computed
// value feeding the output) and goes up from there.
//
// Tier definitions used here:
//   medium -- 3-4 dependent steps, one trap or one computed value that feeds
//             another, operator/method named in the step.
//   hard   -- 5+ dependent steps, an anticipated trap, multi-line or
//             formatted output, and the step names the quantity rather than
//             the operator/method.
//
// Lessons covered: Foundations (syntax/comments/print), val vs var, Variables &
// inference, Int & Long, Float & Double, Boolean, Char, String, String templates.
// Deliberately absent: a hard Char task. Char arithmetic and Char-vs-String
// distinctions cannot be simulated (see PITFALLS.md), so no hard Char task is
// authored until the engine can grade one honestly.
//
// Numeric behavior (Int division truncation, Double text such as `25.0`) is
// pinned to real Kotlin by scripts/test-numeric-semantics.ts. Keep new tasks'
// expected values hand-derived, not copied from the simulator's own output.

export const WORLD_1_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // ---------------------------------------------------------------- Int & Long
  {
    id: 'world-1-practice-writerun-warehouse-pallets',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Split boxes into full pallets and leftovers, then prove the split adds back up.',
    conceptTags: ['lesson:int-long', 'int', 'int-division', 'remainder', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Warehouse Pallets',
    goal:
      'A warehouse has 487 boxes to ship. Each pallet can hold 24 boxes. Find how many full pallets are needed and how many boxes are left. Print a report that also checks that the total is 487.',
    description:
      '1. **Find the full pallets.** Create `val fullPallets`: `totalBoxes` divided by `boxesPerPallet`. Int division drops the fraction.\n\n' +
              '2. **Find the leftover boxes.** Create `val leftover`: the remainder of `totalBoxes` divided by `boxesPerPallet`. Use `%`.\n\n' +
              '3. **Rebuild the total.** Create `val check`: `fullPallets * boxesPerPallet + leftover`.\n\n' +
              '4. **Print the report.** Use string templates:\n"Pallets: 20 | Leftover: 7 | Check: 487"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the full pallets.** Use Int division.',
          '2. **Find the leftover boxes.** Use `%`.',
          '3. **Rebuild the total.** Create `val check`.',
          '4. **Print the report.** Use string templates.',
        ],
        comments: [
          '// 1. Find the full pallets. Use Int division.',
          '// 2. Find the leftover boxes. Use %.',
          '// 3. Rebuild the total. Create val check.',
          '// 4. Print the report. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the full pallets.**',
          '2. **Find the leftover boxes.**',
          '3. **Rebuild the total.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Find the full pallets.',
          '// 2. Find the leftover boxes.',
          '// 3. Rebuild the total.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WarehousePallets.kt',
    initialCode: `fun main() {
  val totalBoxes = 487
  val boxesPerPallet = 24

  // 1. Find the full pallets. Create val fullPallets: totalBoxes divided by boxesPerPallet. Int division drops the fraction.

  // 2. Find the leftover boxes. Create val leftover: the remainder of totalBoxes divided by boxesPerPallet. Use %.

  // 3. Rebuild the total. Create val check: fullPallets * boxesPerPallet + leftover.

  // 4. Print the report. Use string templates: "Pallets: 20 | Leftover: 7 | Check: 487"
}`,
    solutionCode: `fun main() {
  val totalBoxes = 487
  val boxesPerPallet = 24

  val fullPallets = totalBoxes / boxesPerPallet
  val leftover = totalBoxes % boxesPerPallet
  val check = fullPallets * boxesPerPallet + leftover

  println("Pallets: $fullPallets | Leftover: $leftover | Check: $check")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pallets: 20 | Leftover: 7 | Check: 487',
    testCase: { call: '', expected: 'Pallets: 20 | Leftover: 7 | Check: 487' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'totalBoxes', originalLiteral: '487', alternateLiteral: '530' }],
      alternateExpectedOutput: 'Pallets: 22 | Leftover: 2 | Check: 530',
    },
  },
  {
    id: 'world-1-practice-writerun-flight-log-timer',
    worldId: 'world-1',
    difficulty: 'hard',
    summary: 'Break a Long number of seconds into hours, minutes and seconds, then verify it.',
    conceptTags: ['lesson:int-long', 'long', 'numeric-literals', 'int-division', 'remainder', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Flight Log Timer',
    goal:
      'Change 100,000 seconds into hours, minutes and seconds. Print the time. Then use these three parts to get the total seconds again and check that it is correct.',
    description:
      '1. **Find the hours.** Create `val hours`: the whole hours in `totalSeconds`. One hour is `3600` seconds.\n\n' +
              '2. **Find the seconds left after the hours.** Create `val leftAfterHours`: the remainder of `totalSeconds` divided by `3600`. Use `%`.\n\n' +
              '3. **Find the minutes.** Create `val minutes`: the whole minutes in `leftAfterHours`. One minute is `60` seconds.\n\n' +
              '4. **Find the seconds left after the minutes.** Create `val seconds`: the remainder of `leftAfterHours` divided by `60`. Use `%`.\n\n' +
              '5. **Rebuild the total.** Create `val check` from `hours`, `minutes` and `seconds`.\n\n' +
              '6. **Print two lines.** Use string templates:\n"Duration: 27h 46m 40s"\n"Check: 100000"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the hours.** Divide by `3600`.',
          '2. **Find the seconds left after the hours.** Use `%`.',
          '3. **Find the minutes.** Divide by `60`.',
          '4. **Find the seconds left after the minutes.** Use `%`.',
          '5. **Rebuild the total.**',
          '6. **Print the duration and the check.** Use string templates.',
        ],
        comments: [
          '// 1. Find the hours. Divide by 3600.',
          '// 2. Find the seconds left after the hours. Use %.',
          '// 3. Find the minutes. Divide by 60.',
          '// 4. Find the seconds left after the minutes. Use %.',
          '// 5. Rebuild the total.',
          '// 6. Print the duration and the check. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the hours.**',
          '2. **Find the seconds left after the hours.**',
          '3. **Find the minutes.**',
          '4. **Find the seconds left after the minutes.**',
          '5. **Rebuild the total.**',
          '6. **Print the duration and the check.**',
        ],
        comments: [
          '// 1. Find the hours.',
          '// 2. Find the seconds left after the hours.',
          '// 3. Find the minutes.',
          '// 4. Find the seconds left after the minutes.',
          '// 5. Rebuild the total.',
          '// 6. Print the duration and the check.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FlightLogTimer.kt',
    initialCode: `fun main() {
  val totalSeconds = 100_000L

  // 1. Find the hours. Create val hours: the whole hours in totalSeconds. One hour is 3600 seconds.

  // 2. Find the seconds left after the hours. Create val leftAfterHours: the remainder of totalSeconds divided by 3600. Use %.

  // 3. Find the minutes. Create val minutes: the whole minutes in leftAfterHours. One minute is 60 seconds.

  // 4. Find the seconds left after the minutes. Create val seconds: the remainder of leftAfterHours divided by 60. Use %.

  // 5. Rebuild the total. Create val check from hours, minutes and seconds.

  // 6. Print two lines. Use string templates: "Duration: 27h 46m 40s" "Check: 100000"
}`,
    solutionCode: `fun main() {
  val totalSeconds = 100_000L

  val hours = totalSeconds / 3600
  val leftAfterHours = totalSeconds % 3600
  val minutes = leftAfterHours / 60
  val seconds = leftAfterHours % 60
  val check = hours * 3600 + minutes * 60 + seconds

  println("Duration: \${hours}h \${minutes}m \${seconds}s")
  println("Check: $check")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Duration: 27h 46m 40s\nCheck: 100000',
    testCase: { call: '', expected: 'Duration: 27h 46m 40s\nCheck: 100000' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'totalSeconds', originalLiteral: '100_000L', alternateLiteral: '200_000L' }],
      alternateExpectedOutput: 'Duration: 55h 33m 20s\nCheck: 200000',
    },
  },

  // ------------------------------------------------------------ Float & Double
  {
    id: 'world-1-practice-writerun-road-trip-fuel',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Mix Int and Double values to report fuel efficiency and cost for a trip.',
    conceptTags: ['lesson:float-double', 'double', 'int', 'type-conversions', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Road Trip Fuel',
    goal:
      'A trip covered 210 km using 12.5 liters of fuel at 1.5 per liter. Find the km per liter, the whole km per liter and the fuel cost. Print all three on one line.',
    description:
      '1. **Find the km per liter.** Create `val kmPerLiter`: `distanceKm` divided by `litersUsed`. An Int divided by a Double gives a Double.\n\n' +
              '2. **Find the whole km per liter.** Create `val wholeKm`: `kmPerLiter` converted to an Int with `toInt()`.\n\n' +
              '3. **Find the cost.** Create `val cost`: `litersUsed` times `pricePerLiter`.\n\n' +
              '4. **Print the report.** Use string templates:\n"Efficiency: 16.8 km/L (16 whole) | Cost: 18.75"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the km per liter.** Divide the distance by the liters.',
          '2. **Find the whole km per liter.** Use `toInt()`.',
          '3. **Find the cost.**',
          '4. **Print the report.** Use string templates.',
        ],
        comments: [
          '// 1. Find the km per liter. Divide the distance by the liters.',
          '// 2. Find the whole km per liter. Use toInt().',
          '// 3. Find the cost.',
          '// 4. Print the report. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the km per liter.**',
          '2. **Find the whole km per liter.**',
          '3. **Find the cost.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Find the km per liter.',
          '// 2. Find the whole km per liter.',
          '// 3. Find the cost.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RoadTripFuel.kt',
    initialCode: `fun main() {
  val distanceKm = 210
  val litersUsed = 12.5
  val pricePerLiter = 1.5

  // 1. Find the km per liter. Create val kmPerLiter: distanceKm divided by litersUsed. An Int divided by a Double gives a Double.

  // 2. Find the whole km per liter. Create val wholeKm: kmPerLiter converted to an Int with toInt().

  // 3. Find the cost. Create val cost: litersUsed times pricePerLiter.

  // 4. Print the report. Use string templates: "Efficiency: 16.8 km/L (16 whole) | Cost: 18.75"
}`,
    solutionCode: `fun main() {
  val distanceKm = 210
  val litersUsed = 12.5
  val pricePerLiter = 1.5

  val kmPerLiter = distanceKm / litersUsed
  val wholeKm = kmPerLiter.toInt()
  val cost = litersUsed * pricePerLiter

  println("Efficiency: $kmPerLiter km/L ($wholeKm whole) | Cost: $cost")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Efficiency: 16.8 km/L (16 whole) | Cost: 18.75',
    testCase: { call: '', expected: 'Efficiency: 16.8 km/L (16 whole) | Cost: 18.75' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'distanceKm', originalLiteral: '210', alternateLiteral: '190' },
        { variableName: 'pricePerLiter', originalLiteral: '1.5', alternateLiteral: '2.5' },
      ],
      alternateExpectedOutput: 'Efficiency: 15.2 km/L (15 whole) | Cost: 31.25',
    },
  },
  {
    id: 'world-1-practice-writerun-quiz-average',
    worldId: 'world-1',
    difficulty: 'hard',
    summary: 'Average four Int scores without losing the fraction, then split it into parts.',
    conceptTags: ['lesson:float-double', 'double', 'int', 'type-conversions', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Quiz Average',
    goal:
      'Find the exact average of four quiz scores and keep the decimal part. Split the average into a whole part and a fraction. Print all three.',
    description:
      '1. **Add the scores.** Create `val total`: the four quiz scores added together.\n\n' +
              '2. **Find the exact average.** Create `val average`: `total` divided by `4`. Call `toDouble()` on `total` first, or the fraction is lost.\n\n' +
              '3. **Find the whole part.** Create `val whole`: `average` converted to an Int with `toInt()`.\n\n' +
              '4. **Find the fraction.** Create `val fraction`: `average` minus `whole`.\n\n' +
              '5. **Print three lines.** Use string templates:\n"Average: 83.5"\n"Whole: 83"\n"Fraction: 0.5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the scores.**',
          '2. **Find the exact average.** Convert to a Double before dividing.',
          '3. **Find the whole part.** Use `toInt()`.',
          '4. **Find the fraction.** Subtract the whole part.',
          '5. **Print three lines.** Use string templates.',
        ],
        comments: [
          '// 1. Add the scores.',
          '// 2. Find the exact average. Convert to a Double before dividing.',
          '// 3. Find the whole part. Use toInt().',
          '// 4. Find the fraction. Subtract the whole part.',
          '// 5. Print three lines. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the scores.**',
          '2. **Find the exact average.**',
          '3. **Find the whole part.**',
          '4. **Find the fraction.**',
          '5. **Print the three values.**',
        ],
        comments: [
          '// 1. Add the scores.',
          '// 2. Find the exact average.',
          '// 3. Find the whole part.',
          '// 4. Find the fraction.',
          '// 5. Print the three values.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'QuizAverage.kt',
    initialCode: `fun main() {
  val quiz1 = 90
  val quiz2 = 85
  val quiz3 = 78
  val quiz4 = 81

  // 1. Add the scores. Create val total: the four quiz scores added together.

  // 2. Find the exact average. Create val average: total divided by 4. Call toDouble() on total first, or the fraction is lost.

  // 3. Find the whole part. Create val whole: average converted to an Int with toInt().

  // 4. Find the fraction. Create val fraction: average minus whole.

  // 5. Print three lines. Use string templates: "Average: 83.5" "Whole: 83" "Fraction: 0.5"
}`,
    solutionCode: `fun main() {
  val quiz1 = 90
  val quiz2 = 85
  val quiz3 = 78
  val quiz4 = 81

  val total = quiz1 + quiz2 + quiz3 + quiz4
  val average = total.toDouble() / 4
  val whole = average.toInt()
  val fraction = average - whole

  println("Average: $average")
  println("Whole: $whole")
  println("Fraction: $fraction")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Average: 83.5\nWhole: 83\nFraction: 0.5',
    testCase: { call: '', expected: 'Average: 83.5\nWhole: 83\nFraction: 0.5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'quiz4', originalLiteral: '81', alternateLiteral: '82' }],
      alternateExpectedOutput: 'Average: 83.75\nWhole: 83\nFraction: 0.75',
    },
  },

  // -------------------------------------------------------------------- String
  {
    id: 'world-1-practice-writerun-badge-builder',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Join two names with a space, wrap them in brackets and report the character count.',
    conceptTags: ['lesson:string', 'string', 'concatenation', 'length'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Badge Builder',
    goal:
      'Make a name badge. Join the first and last name and count the characters. Print the name inside square brackets, followed by its length.',
    description:
      '1. **Join the names.** Create `val fullName`: `first`, a single space, and `last`. Join them with `+`.\n\n' +
              '2. **Count the characters.** Create `val nameLength`: the `.length` of `fullName`. The space counts too.\n\n' +
              '3. **Add the brackets.** Create `val badge`: `fullName` wrapped in `[` and `]`. Use `+`.\n\n' +
              '4. **Print the sentence.** Join `badge`, the text " has ", `nameLength` and the text " characters" with `+`:\n"[Ada Lovelace] has 12 characters"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Join the names.** Use `+`.',
          '2. **Count the characters.** Use `.length`.',
          '3. **Add the brackets.** Use `+`.',
          '4. **Print the sentence.** Join the pieces with `+`.',
        ],
        comments: [
          '// 1. Join the names. Use +.',
          '// 2. Count the characters. Use .length.',
          '// 3. Add the brackets. Use +.',
          '// 4. Print the sentence. Join the pieces with +.',
        ],
      },
      experienced: {
        steps: [
          '1. **Join the names.**',
          '2. **Count the characters.**',
          '3. **Add the brackets.**',
          '4. **Print the sentence.**',
        ],
        comments: [
          '// 1. Join the names.',
          '// 2. Count the characters.',
          '// 3. Add the brackets.',
          '// 4. Print the sentence.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BadgeBuilder.kt',
    initialCode: `fun main() {
  val first = "Ada"
  val last = "Lovelace"

  // 1. Join the names. Create val fullName: first, a single space, and last. Join them with +.

  // 2. Count the characters. Create val nameLength: the .length of fullName. The space counts too.

  // 3. Add the brackets. Create val badge: fullName wrapped in [ and ]. Use +.

  // 4. Print the sentence. Join badge, the text " has ", nameLength and the text " characters" with +: "[Ada Lovelace] has 12 characters"
}`,
    solutionCode: `fun main() {
  val first = "Ada"
  val last = "Lovelace"

  val fullName = first + " " + last
  val nameLength = fullName.length
  val badge = "[" + fullName + "]"

  println(badge + " has " + nameLength + " characters")
}`,
    sampleInput: 'main()',
    expectedOutput: '[Ada Lovelace] has 12 characters',
    testCase: { call: '', expected: '[Ada Lovelace] has 12 characters' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'first', originalLiteral: '"Ada"', alternateLiteral: '"Alan"' },
        { variableName: 'last', originalLiteral: '"Lovelace"', alternateLiteral: '"Turing"' },
      ],
      alternateExpectedOutput: '[Alan Turing] has 11 characters',
    },
  },
  {
    id: 'world-1-practice-writerun-shipping-label',
    worldId: 'world-1',
    difficulty: 'hard',
    summary: 'Measure two strings (one possibly empty) and print a multi-line raw-string label.',
    conceptTags: ['lesson:string', 'string', 'length', 'raw-string', 'trimIndent', 'empty-string'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shipping Label',
    goal:
      'A shipping label needs the item, the length of the customer note and the total number of characters. This order has no note. Find the length of both texts, add them up and print a three-line label.',
    description:
      '1. **Count the item characters.** Create `val itemChars`: the `.length` of `item`.\n\n' +
              '2. **Count the note characters.** Create `val noteChars`: the `.length` of `note`. An empty String has length 0.\n\n' +
              '3. **Add the counts.** Create `val totalChars`: `itemChars` plus `noteChars`.\n\n' +
              '4. **Build the label.** Create `val label` as a triple-quoted raw String over three lines, using string templates. End it with `.trimIndent()` to remove the code indentation.\n\n' +
              '5. **Print the label.** The output is three lines:\n"Item: Notebook"\n"Note length: 0"\n"Total: 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Count the item characters.** Use `.length`.',
          '2. **Count the note characters.** Use `.length`.',
          '3. **Add the counts.**',
          '4. **Build the label.** Use a raw String with `.trimIndent()`.',
          '5. **Print the label.**',
        ],
        comments: [
          '// 1. Count the item characters. Use .length.',
          '// 2. Count the note characters. Use .length.',
          '// 3. Add the counts.',
          '// 4. Build the label. Use a raw String with .trimIndent().',
          '// 5. Print the label.',
        ],
      },
      experienced: {
        steps: [
          '1. **Count the item characters.**',
          '2. **Count the note characters.**',
          '3. **Add the counts.**',
          '4. **Build the label.**',
          '5. **Print the label.**',
        ],
        comments: [
          '// 1. Count the item characters.',
          '// 2. Count the note characters.',
          '// 3. Add the counts.',
          '// 4. Build the label.',
          '// 5. Print the label.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShippingLabel.kt',
    initialCode: `fun main() {
  val item = "Notebook"
  val note = ""

  // 1. Count the item characters. Create val itemChars: the .length of item.

  // 2. Count the note characters. Create val noteChars: the .length of note. An empty String has length 0.

  // 3. Add the counts. Create val totalChars: itemChars plus noteChars.

  // 4. Build the label. Create val label as a triple-quoted raw String over three lines, using string templates. End it with .trimIndent() to remove the code indentation.

  // 5. Print the label. The output is three lines: "Item: Notebook" "Note length: 0" "Total: 8"
}`,
    solutionCode: `fun main() {
  val item = "Notebook"
  val note = ""

  val itemChars = item.length
  val noteChars = note.length
  val totalChars = itemChars + noteChars

  val label = """
        Item: $item
        Note length: $noteChars
        Total: $totalChars
    """.trimIndent()

  println(label)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Item: Notebook\nNote length: 0\nTotal: 8',
    testCase: { call: '', expected: 'Item: Notebook\nNote length: 0\nTotal: 8' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'item', originalLiteral: '"Notebook"', alternateLiteral: '"Stapler"' },
        { variableName: 'note', originalLiteral: '""', alternateLiteral: '"rush"' },
      ],
      alternateExpectedOutput: 'Item: Stapler\nNote length: 4\nTotal: 11',
    },
  },

  // ---------------------------------------------------------- String templates
  {
    id: 'world-1-practice-writerun-tea-receipt',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Print receipt lines with a literal dollar sign and an expression inside a template.',
    conceptTags: ['lesson:string-templates', 'string-templates', 'template-expression', 'dollar-escape'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Tea Receipt',
    goal:
      'A customer buys 6 cups of tea at 4 each and gets a discount of 3. Find the total price. Print a two-line receipt with the price and the price after the discount. Both must show a dollar sign.',
    description:
      '1. **Find the total.** Create `val total`: `unitPrice` times `quantity`.\n\n' +
              '2. **Print the first line.** Use string templates. Write `\\$` to print a literal dollar sign before the amount:\n"Tea x6 = $24"\n\n' +
              '3. **Print the discounted line.** Use one `${ }` expression that subtracts `discount` from `total`, with no extra `val`. Print a literal dollar sign again:\n"Discounted: $21"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the total.**',
          '2. **Print the first line.** Use `\\$` for the dollar sign.',
          '3. **Print the discounted line.** Use one `${ }` expression.',
        ],
        comments: [
          '// 1. Find the total.',
          '// 2. Print the first line. Use \\$ for the dollar sign.',
          '// 3. Print the discounted line. Use one ${ } expression.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the total.**',
          '2. **Print the first line.**',
          '3. **Print the discounted line.**',
        ],
        comments: [
          '// 1. Find the total.',
          '// 2. Print the first line.',
          '// 3. Print the discounted line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TeaReceipt.kt',
    initialCode: `fun main() {
  val product = "Tea"
  val unitPrice = 4
  val quantity = 6
  val discount = 3

  // 1. Find the total. Create val total: unitPrice times quantity.

  // 2. Print the first line. Use string templates. Write \\$ to print a literal dollar sign before the amount: "Tea x6 = $24"

  // 3. Print the discounted line. Use one \${ } expression that subtracts discount from total, with no extra val. Print a literal dollar sign again: "Discounted: $21"
}`,
    solutionCode: `fun main() {
  val product = "Tea"
  val unitPrice = 4
  val quantity = 6
  val discount = 3

  val total = unitPrice * quantity

  println("$product x$quantity = \\$$total")
  println("Discounted: \\$\${total - discount}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Tea x6 = $24\nDiscounted: $21',
    testCase: { call: '', expected: 'Tea x6 = $24\nDiscounted: $21' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'quantity', originalLiteral: '6', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Tea x10 = $40\nDiscounted: $37',
    },
  },
  {
    id: 'world-1-practice-writerun-invoice-block',
    worldId: 'world-1',
    difficulty: 'hard',
    summary: 'Build a three-line invoice with a truncated tax, a property call in a template and literal dollar signs.',
    conceptTags: ['lesson:string-templates', 'string-templates', 'template-expression', 'dollar-escape', 'int-division', 'length'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Invoice Block',
    goal:
      'Mina buys 4 items at 17 each. Find the subtotal and a tax of one tenth of it using whole numbers. Print a three-line invoice with the customer, subtotal and tax, and total.',
    description:
      '1. **Find the subtotal.** Create `val subtotal`: `items` times `price`.\n\n' +
              '2. **Find the tax.** Create `val tax`: `subtotal` divided by `10`. Int division drops the fraction.\n\n' +
              '3. **Find the total.** Create `val total`: `subtotal` plus `tax`.\n\n' +
              '4. **Print three lines.** Use string templates and `\\$` before each amount. Show the length of `customer` with `${customer.length}`, since a property needs curly braces:\n"Customer: Mina (4 letters)"\n"Subtotal: $68 | Tax: $6"\n"Total: $74 for 4 items"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the subtotal.**',
          '2. **Find the tax.** Use Int division.',
          '3. **Find the total.**',
          '4. **Print three lines.** Use string templates, `\\$` and `${ }`.',
        ],
        comments: [
          '// 1. Find the subtotal.',
          '// 2. Find the tax. Use Int division.',
          '// 3. Find the total.',
          '// 4. Print three lines. Use string templates, \\$ and ${ }.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the subtotal.**',
          '2. **Find the tax.**',
          '3. **Find the total.**',
          '4. **Print the invoice.**',
        ],
        comments: [
          '// 1. Find the subtotal.',
          '// 2. Find the tax.',
          '// 3. Find the total.',
          '// 4. Print the invoice.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'InvoiceBlock.kt',
    initialCode: `fun main() {
  val customer = "Mina"
  val items = 4
  val price = 17

  // 1. Find the subtotal. Create val subtotal: items times price.

  // 2. Find the tax. Create val tax: subtotal divided by 10. Int division drops the fraction.

  // 3. Find the total. Create val total: subtotal plus tax.

  // 4. Print three lines. Use string templates and \\$ before each amount. Show the length of customer with \${customer.length}, since a property needs curly braces: "Customer: Mina (4 letters)" "Subtotal: $68 | Tax: $6" "Total: $74 for 4 items"
}`,
    solutionCode: `fun main() {
  val customer = "Mina"
  val items = 4
  val price = 17

  val subtotal = items * price
  val tax = subtotal / 10
  val total = subtotal + tax

  println("Customer: $customer (\${customer.length} letters)")
  println("Subtotal: \\$$subtotal | Tax: \\$$tax")
  println("Total: \\$$total for $items items")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Customer: Mina (4 letters)\nSubtotal: $68 | Tax: $6\nTotal: $74 for 4 items',
    testCase: { call: '', expected: 'Customer: Mina (4 letters)\nSubtotal: $68 | Tax: $6\nTotal: $74 for 4 items' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'customer', originalLiteral: '"Mina"', alternateLiteral: '"Sofia"' },
        { variableName: 'price', originalLiteral: '17', alternateLiteral: '23' },
      ],
      alternateExpectedOutput: 'Customer: Sofia (5 letters)\nSubtotal: $92 | Tax: $9\nTotal: $101 for 4 items',
    },
  },

  // -------------------------------------------- Foundations (syntax, comments, print)
  {
    id: 'world-1-practice-writerun-launch-countdown',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Mix print() and println() with a computed value and a blank line, leaving a debug line commented out.',
    conceptTags: ['lesson:foundations', 'print-println', 'comments', 'statement-order', 'int'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Launch Countdown',
    goal:
      'Print a rocket launch countdown. Some parts must be on the same line and some on separate lines. Print two lines with two parts each, then a blank line, then the final message.',
    description:
      'The commented-out `// println("DEBUG: ...")` line must stay switched off.\n\n' +
              '1. **Print the first line in two parts.** Use `print()` for the text "T-minus " with no line break, then `println()` for `start`.\n\n' +
              '2. **Find the next number.** Create `val remaining`: `start` minus `1`.\n\n' +
              '3. **Print the second line in two parts.** Use `print()` for the text "Next: ", then `println()` for `remaining`.\n\n' +
              '4. **Print an empty line.** Use `println()` with no arguments.\n\n' +
              '5. **Print the final message.** Use `println()` for "Liftoff!".\nThe output is:\n"T-minus 7"\n"Next: 6"\n(an empty line)\n"Liftoff!"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the first line in two parts.** Use `print()` then `println()`.',
          '2. **Find the next number.** Subtract `1`.',
          '3. **Print the second line in two parts.** Use `print()` then `println()`.',
          '4. **Print an empty line.**',
          '5. **Print the final message.**',
        ],
        comments: [
          '// 1. Print the first line in two parts. Use print() then println().',
          '// 2. Find the next number. Subtract 1.',
          '// 3. Print the second line in two parts. Use print() then println().',
          '// 4. Print an empty line.',
          '// 5. Print the final message.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the first line in two parts.**',
          '2. **Find the next number.**',
          '3. **Print the second line in two parts.**',
          '4. **Print an empty line.**',
          '5. **Print the final message.**',
        ],
        comments: [
          '// 1. Print the first line in two parts.',
          '// 2. Find the next number.',
          '// 3. Print the second line in two parts.',
          '// 4. Print an empty line.',
          '// 5. Print the final message.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LaunchCountdown.kt',
    initialCode: `fun main() {
  val start = 7
  // println("DEBUG: start=$start")

  // 1. Print the first line in two parts. Use print() for the text "T-minus " with no line break, then println() for start.

  // 2. Find the next number. Create val remaining: start minus 1.

  // 3. Print the second line in two parts. Use print() for the text "Next: ", then println() for remaining.

  // 4. Print an empty line. Use println() with no arguments.

  // 5. Print the final message. Use println() for "Liftoff!". The output is: "T-minus 7" "Next: 6" (an empty line) "Liftoff!"
}`,
    solutionCode: `fun main() {
  val start = 7
  // println("DEBUG: start=$start")

  print("T-minus ")
  println(start)

  val remaining = start - 1

  print("Next: ")
  println(remaining)

  println()

  println("Liftoff!")
}`,
    sampleInput: 'main()',
    expectedOutput: 'T-minus 7\nNext: 6\n\nLiftoff!',
    testCase: { call: '', expected: 'T-minus 7\nNext: 6\n\nLiftoff!' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '7', alternateLiteral: '12' }],
      alternateExpectedOutput: 'T-minus 12\nNext: 11\n\nLiftoff!',
    },
  },

  // ------------------------------------------------------------------ val vs var
  {
    id: 'world-1-practice-writerun-arcade-session',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Update a score and lives in order, printing a snapshot before and after a later change.',
    conceptTags: ['lesson:val-vs-var', 'val-vs-var', 'reassignment', 'statement-order', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Arcade Session',
    goal:
      'A player has 40 points and 3 lives. They get a 15-point bonus and lose one life. Update the score and lives and print them. Then double the score and print the new score.',
    description:
      '1. **Add the bonus.** Add `bonus` to `score` with `+=`.\n\n' +
              '2. **Lose a life.** Set `lives` to `lives` minus `1`.\n\n' +
              '3. **Print the snapshot.** Use string templates:\n"Score: 55 | Lives: 2"\n\n' +
              '4. **Double the score.** Set `score` to `score` times `2`.\n\n' +
              '5. **Print the new score.** Use a string template:\n"Score after double: 110"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the bonus.** Use `+=`.',
          '2. **Lose a life.** Reassign `lives`.',
          '3. **Print the snapshot.** Use string templates.',
          '4. **Double the score.** Reassign `score`.',
          '5. **Print the new score.** Use a string template.',
        ],
        comments: [
          '// 1. Add the bonus. Use +=.',
          '// 2. Lose a life. Reassign lives.',
          '// 3. Print the snapshot. Use string templates.',
          '// 4. Double the score. Reassign score.',
          '// 5. Print the new score. Use a string template.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the bonus.**',
          '2. **Lose a life.**',
          '3. **Print the snapshot.**',
          '4. **Double the score.**',
          '5. **Print the new score.**',
        ],
        comments: [
          '// 1. Add the bonus.',
          '// 2. Lose a life.',
          '// 3. Print the snapshot.',
          '// 4. Double the score.',
          '// 5. Print the new score.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ArcadeSession.kt',
    initialCode: `fun main() {
  var score = 40
  val bonus = 15
  var lives = 3

  // 1. Add the bonus. Add bonus to score with +=.

  // 2. Lose a life. Set lives to lives minus 1.

  // 3. Print the snapshot. Use string templates: "Score: 55 | Lives: 2"

  // 4. Double the score. Set score to score times 2.

  // 5. Print the new score. Use a string template: "Score after double: 110"
}`,
    solutionCode: `fun main() {
  var score = 40
  val bonus = 15
  var lives = 3

  score += bonus

  lives = lives - 1

  println("Score: $score | Lives: $lives")

  score = score * 2

  println("Score after double: $score")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Score: 55 | Lives: 2\nScore after double: 110',
    testCase: { call: '', expected: 'Score: 55 | Lives: 2\nScore after double: 110' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'score', originalLiteral: '40', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Score: 75 | Lives: 2\nScore after double: 150',
    },
  },
  {
    id: 'world-1-practice-writerun-bank-ledger',
    worldId: 'world-1',
    difficulty: 'hard',
    summary: 'Snapshot a starting balance in a val, apply three changes to a var, then report the net change.',
    conceptTags: ['lesson:val-vs-var', 'val-vs-var', 'reassignment', 'statement-order', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Bank Ledger',
    goal:
      'An account starts with 500. It then gets a deposit, a withdrawal and a service fee. Apply these three changes in order. Print the starting balance, final balance and total change.',
    description:
      '1. **Save the opening balance.** Create `val opening`: the value of `balance` before any change.\n\n' +
              '2. **Apply the deposit.** Add `250` to `balance`.\n\n' +
              '3. **Apply the withdrawal.** Subtract `120` from `balance`.\n\n' +
              '4. **Apply the service fee.** Subtract `15` from `balance`.\n\n' +
              '5. **Find the net change.** Create `val net`: `balance` minus `opening`.\n\n' +
              '6. **Print three lines.** Use string templates:\n"Opening: 500"\n"Closing: 615"\n"Net change: 115"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Save the opening balance.** Copy it into a `val`.',
          '2. **Apply the deposit.**',
          '3. **Apply the withdrawal.**',
          '4. **Apply the service fee.**',
          '5. **Find the net change.** Compare with `opening`.',
          '6. **Print three lines.** Use string templates.',
        ],
        comments: [
          '// 1. Save the opening balance. Copy it into a val.',
          '// 2. Apply the deposit.',
          '// 3. Apply the withdrawal.',
          '// 4. Apply the service fee.',
          '// 5. Find the net change. Compare with opening.',
          '// 6. Print three lines. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Save the opening balance.**',
          '2. **Apply the deposit.**',
          '3. **Apply the withdrawal.**',
          '4. **Apply the service fee.**',
          '5. **Find the net change.**',
          '6. **Print three lines.**',
        ],
        comments: [
          '// 1. Save the opening balance.',
          '// 2. Apply the deposit.',
          '// 3. Apply the withdrawal.',
          '// 4. Apply the service fee.',
          '// 5. Find the net change.',
          '// 6. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BankLedger.kt',
    initialCode: `fun main() {
  var balance = 500

  // 1. Save the opening balance. Create val opening: the value of balance before any change.

  // 2. Apply the deposit. Add 250 to balance.

  // 3. Apply the withdrawal. Subtract 120 from balance.

  // 4. Apply the service fee. Subtract 15 from balance.

  // 5. Find the net change. Create val net: balance minus opening.

  // 6. Print three lines. Use string templates: "Opening: 500" "Closing: 615" "Net change: 115"
}`,
    solutionCode: `fun main() {
  var balance = 500

  val opening = balance

  balance += 250
  balance -= 120
  balance -= 15

  val net = balance - opening

  println("Opening: $opening")
  println("Closing: $balance")
  println("Net change: $net")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Opening: 500\nClosing: 615\nNet change: 115',
    testCase: { call: '', expected: 'Opening: 500\nClosing: 615\nNet change: 115' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'balance', originalLiteral: '500', alternateLiteral: '800' }],
      alternateExpectedOutput: 'Opening: 800\nClosing: 915\nNet change: 115',
    },
  },

  // ------------------------------------------------------- Variables & type inference
  {
    id: 'world-1-practice-writerun-sensor-panel',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Mix explicit and inferred types across Int, String, Double, Boolean and Char in one report.',
    conceptTags: ['lesson:variables-inference', 'type-inference', 'explicit-types', 'double', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Sensor Panel',
    goal:
      'A weather station stores a sensor id, name, reading, status and zone. Find the doubled reading, the next id and a tag name. Let Kotlin infer the types except for one type that you write. Print a one-line status report.',
    description:
      '1. **Double the reading.** Create `val doubled`: `reading` times `2`. Write no type, Kotlin infers a Double.\n\n' +
              '2. **Find the next id.** Create `val nextId`: `id` plus `1`. Write its type `Int` explicitly.\n\n' +
              '3. **Build the tag.** Create `val tag`: `label`, the text "-" and `nextId`, joined with `+`. Write no type, Kotlin infers a String.\n\n' +
              '4. **Print the report.** Use string templates:\n"Sensor North-8 (zone B) reads 43.0, online: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Double the reading.** Let Kotlin infer the type.',
          '2. **Find the next id.** Write the type `Int`.',
          '3. **Build the tag.** Join with `+`.',
          '4. **Print the report.** Use string templates.',
        ],
        comments: [
          '// 1. Double the reading. Let Kotlin infer the type.',
          '// 2. Find the next id. Write the type Int.',
          '// 3. Build the tag. Join with +.',
          '// 4. Print the report. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Double the reading.**',
          '2. **Find the next id.**',
          '3. **Build the tag.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Double the reading.',
          '// 2. Find the next id.',
          '// 3. Build the tag.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SensorPanel.kt',
    initialCode: `fun main() {
  val id: Int = 7
  val label: String = "North"
  val reading: Double = 21.5
  val online: Boolean = true
  val zone: Char = 'B'

  // 1. Double the reading. Create val doubled: reading times 2. Write no type, Kotlin infers a Double.

  // 2. Find the next id. Create val nextId: id plus 1. Write its type Int explicitly.

  // 3. Build the tag. Create val tag: label, the text "-" and nextId, joined with +. Write no type, Kotlin infers a String.

  // 4. Print the report. Use string templates: "Sensor North-8 (zone B) reads 43.0, online: true"
}`,
    solutionCode: `fun main() {
  val id: Int = 7
  val label: String = "North"
  val reading: Double = 21.5
  val online: Boolean = true
  val zone: Char = 'B'

  val doubled = reading * 2
  val nextId: Int = id + 1
  val tag = label + "-" + nextId

  println("Sensor $tag (zone $zone) reads $doubled, online: $online")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sensor North-8 (zone B) reads 43.0, online: true',
    testCase: { call: '', expected: 'Sensor North-8 (zone B) reads 43.0, online: true' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'id', originalLiteral: '7', alternateLiteral: '12' },
        { variableName: 'reading', originalLiteral: '21.5', alternateLiteral: '30.25' },
      ],
      alternateExpectedOutput: 'Sensor North-13 (zone B) reads 60.5, online: true',
    },
  },

  // ---------------------------------------------------------------------- Boolean
  {
    id: 'world-1-practice-writerun-access-gate',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Derive three Booleans from comparisons and a negation, then report all of them.',
    conceptTags: ['lesson:boolean', 'boolean', 'comparison', 'logical-not', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Access Gate',
    goal:
      'A visitor is 17 years old and the minimum age is 18. Find if they are old enough, too young or exactly the minimum age. Print the three results and the ticket status on one line.',
    description:
      '1. **Check the age.** Create `val oldEnough`: whether `age` is greater than or equal to `minAge`. Use `>=`.\n\n' +
              '2. **Check if too young.** Create `val tooYoung`: the opposite of `oldEnough`. Use `!`.\n\n' +
              '3. **Check for the exact age.** Create `val exactlyMin`: whether `age` equals `minAge`. Use `==`.\n\n' +
              '4. **Print the report.** Use string templates:\n"oldEnough=false | tooYoung=true | exactlyMin=false | ticket=true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check the age.** Use `>=`.',
          '2. **Check if too young.** Use `!`.',
          '3. **Check for the exact age.** Use `==`.',
          '4. **Print the report.** Use string templates.',
        ],
        comments: [
          '// 1. Check the age. Use >=.',
          '// 2. Check if too young. Use !.',
          '// 3. Check for the exact age. Use ==.',
          '// 4. Print the report. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check the age.**',
          '2. **Check if too young.**',
          '3. **Check for the exact age.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Check the age.',
          '// 2. Check if too young.',
          '// 3. Check for the exact age.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AccessGate.kt',
    initialCode: `fun main() {
  val age = 17
  val minAge = 18
  val hasTicket = true

  // 1. Check the age. Create val oldEnough: whether age is greater than or equal to minAge. Use >=.

  // 2. Check if too young. Create val tooYoung: the opposite of oldEnough. Use !.

  // 3. Check for the exact age. Create val exactlyMin: whether age equals minAge. Use ==.

  // 4. Print the report. Use string templates: "oldEnough=false | tooYoung=true | exactlyMin=false | ticket=true"
}`,
    solutionCode: `fun main() {
  val age = 17
  val minAge = 18
  val hasTicket = true

  val oldEnough = age >= minAge
  val tooYoung = !oldEnough
  val exactlyMin = age == minAge

  println("oldEnough=$oldEnough | tooYoung=$tooYoung | exactlyMin=$exactlyMin | ticket=$hasTicket")
}`,
    sampleInput: 'main()',
    expectedOutput: 'oldEnough=false | tooYoung=true | exactlyMin=false | ticket=true',
    testCase: { call: '', expected: 'oldEnough=false | tooYoung=true | exactlyMin=false | ticket=true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'age', originalLiteral: '17', alternateLiteral: '18' }],
      alternateExpectedOutput: 'oldEnough=true | tooYoung=false | exactlyMin=true | ticket=true',
    },
  },

  // ------------------------------------------------------------------------- Char
  {
    id: 'world-1-practice-writerun-log-entry',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Join a String with Char values, including a backslash and a newline escape, into a two-line log entry.',
    conceptTags: ['lesson:char', 'char', 'escape-characters', 'concatenation', 'string'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Log Entry',
    goal:
      'Make a log entry using a file path and a header line. Print the header and the path on two separate lines using one println().',
    description:
      '1. **Build the path.** Create `val path`: `folder`, `backslash` and the text "app.log", joined with `+`.\n\n' +
              '2. **Build the header.** Create `val header`: the text "Code " and `code`, joined with `+`.\n\n' +
              '3. **Print both lines.** Use one `println()` that joins `header`, `newline` and `path` with `+`:\n"Code E"\n"logs\\app.log"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Build the path.** Join with `+`.',
          '2. **Build the header.** Join with `+`.',
          '3. **Print both lines.** Use one `println()` and `newline`.',
        ],
        comments: [
          '// 1. Build the path. Join with +.',
          '// 2. Build the header. Join with +.',
          '// 3. Print both lines. Use one println() and newline.',
        ],
      },
      experienced: {
        steps: [
          '1. **Build the path.**',
          '2. **Build the header.**',
          '3. **Print both lines.**',
        ],
        comments: [
          '// 1. Build the path.',
          '// 2. Build the header.',
          '// 3. Print both lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LogEntry.kt',
    initialCode: `fun main() {
  val code = 'E'
  val backslash = '\\\\'
  val newline = '\\n'
  val folder = "logs"

  // 1. Build the path. Create val path: folder, backslash and the text "app.log", joined with +.

  // 2. Build the header. Create val header: the text "Code " and code, joined with +.

  // 3. Print both lines. Use one println() that joins header, newline and path with +: "Code E" "logs\\app.log"
}`,
    solutionCode: `fun main() {
  val code = 'E'
  val backslash = '\\\\'
  val newline = '\\n'
  val folder = "logs"

  val path = folder + backslash + "app.log"
  val header = "Code " + code

  println(header + newline + path)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Code E\nlogs\\app.log',
    testCase: { call: '', expected: 'Code E\nlogs\\app.log' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'code', originalLiteral: "'E'", alternateLiteral: "'W'" },
        { variableName: 'folder', originalLiteral: '"logs"', alternateLiteral: '"data"' },
      ],
      alternateExpectedOutput: 'Code W\ndata\\app.log',
    },
  },

  // ---- String-to-number parsing (Int & Long)
  {
    id: 'world-1-practice-writerun-ticket-desk',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Parse two text counts into Ints, then total the visitors and the ticket revenue.',
    conceptTags: ['lesson:int-long', 'type-conversions', 'int', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Ticket Desk',
    goal:
      'A ticket desk has visitor counts stored as text. Change them to numbers. Find the total visitors and the money from adult and child tickets. Print a one-line summary.',
    description:
      '1. **Convert the adults.** Create `val adults`: `rawAdults` converted with `toInt()`.\n\n' +
              '2. **Convert the children.** Create `val children`: `rawChildren` converted with `toInt()`.\n\n' +
              '3. **Count the visitors.** Create `val visitors`: `adults` plus `children`.\n\n' +
              '4. **Find the revenue.** Create `val revenue`: `adults * adultPrice + children * childPrice`.\n\n' +
              '5. **Print the summary.** Use string templates:\n"Visitors: 42 | Revenue: 448"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Convert the adults.** Use `toInt()`.',
          '2. **Convert the children.** Use `toInt()`.',
          '3. **Count the visitors.**',
          '4. **Find the revenue.** Multiply each count by its price.',
          '5. **Print the summary.** Use string templates.',
        ],
        comments: [
          '// 1. Convert the adults. Use toInt().',
          '// 2. Convert the children. Use toInt().',
          '// 3. Count the visitors.',
          '// 4. Find the revenue. Multiply each count by its price.',
          '// 5. Print the summary. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Convert the adults.**',
          '2. **Convert the children.**',
          '3. **Count the visitors.**',
          '4. **Find the revenue.**',
          '5. **Print the summary.**',
        ],
        comments: [
          '// 1. Convert the adults.',
          '// 2. Convert the children.',
          '// 3. Count the visitors.',
          '// 4. Find the revenue.',
          '// 5. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TicketDesk.kt',
    initialCode: `fun main() {
  val rawAdults = "28"
  val rawChildren = "14"
  val adultPrice = 12
  val childPrice = 8

  // 1. Convert the adults. Create val adults: rawAdults converted with toInt().

  // 2. Convert the children. Create val children: rawChildren converted with toInt().

  // 3. Count the visitors. Create val visitors: adults plus children.

  // 4. Find the revenue. Create val revenue: adults * adultPrice + children * childPrice.

  // 5. Print the summary. Use string templates: "Visitors: 42 | Revenue: 448"
}`,
    solutionCode: `fun main() {
  val rawAdults = "28"
  val rawChildren = "14"
  val adultPrice = 12
  val childPrice = 8

  val adults = rawAdults.toInt()
  val children = rawChildren.toInt()
  val visitors = adults + children
  val revenue = adults * adultPrice + children * childPrice

  println("Visitors: $visitors | Revenue: $revenue")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Visitors: 42 | Revenue: 448',
    testCase: { call: '', expected: 'Visitors: 42 | Revenue: 448' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'rawAdults', originalLiteral: '"28"', alternateLiteral: '"30"' }],
      alternateExpectedOutput: 'Visitors: 44 | Revenue: 472',
    },
  },

  // ---- Float suffix and conversion (Float & Double)
  {
    id: 'world-1-practice-writerun-parcel-weight',
    worldId: 'world-1',
    difficulty: 'medium',
    summary: 'Add Float weights, convert an Int item count to a Float, and report all three values.',
    conceptTags: ['lesson:float-double', 'float', 'type-conversions', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Parcel Weight',
    goal:
      'A parcel weighs 68.5 with 1.25 of wrapping. It has 3 items that count as 1 each. Find the packed weight and the total weight with the items. Print a report.',
    description:
      '1. **Find the packed weight.** Create `val packed`: `parcel` plus `wrap`.\n\n' +
              '2. **Convert the item count.** Create `val itemWeight`: `items` converted to a Float with `toFloat()`.\n\n' +
              '3. **Find the total weight.** Create `val combined`: `packed` plus `itemWeight`.\n\n' +
              '4. **Print the report.** Use string templates:\n"Parcel: 69.75 | Items: 3.0 | Total: 72.75"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the packed weight.**',
          '2. **Convert the item count.** Use `toFloat()`.',
          '3. **Find the total weight.**',
          '4. **Print the report.** Use string templates.',
        ],
        comments: [
          '// 1. Find the packed weight.',
          '// 2. Convert the item count. Use toFloat().',
          '// 3. Find the total weight.',
          '// 4. Print the report. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the packed weight.**',
          '2. **Convert the item count.**',
          '3. **Find the total weight.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Find the packed weight.',
          '// 2. Convert the item count.',
          '// 3. Find the total weight.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ParcelWeight.kt',
    initialCode: `fun main() {
  val parcel = 68.5f
  val wrap = 1.25f
  val items = 3

  // 1. Find the packed weight. Create val packed: parcel plus wrap.

  // 2. Convert the item count. Create val itemWeight: items converted to a Float with toFloat().

  // 3. Find the total weight. Create val combined: packed plus itemWeight.

  // 4. Print the report. Use string templates: "Parcel: 69.75 | Items: 3.0 | Total: 72.75"
}`,
    solutionCode: `fun main() {
  val parcel = 68.5f
  val wrap = 1.25f
  val items = 3

  val packed = parcel + wrap
  val itemWeight = items.toFloat()
  val combined = packed + itemWeight

  println("Parcel: $packed | Items: $itemWeight | Total: $combined")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Parcel: 69.75 | Items: 3.0 | Total: 72.75',
    testCase: { call: '', expected: 'Parcel: 69.75 | Items: 3.0 | Total: 72.75' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'items', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Parcel: 69.75 | Items: 5.0 | Total: 74.75',
    },
  },
];

export const WORLD_1_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // Int & Long
  {
    id: 'world-1-practice-debug-quiz-percent',
    worldId: 'world-1',
    conceptTags: ['lesson:int-long', 'int', 'int-division'],
    summary: 'A quiz score shows 0% even though most answers were right.',
    title: 'Fix the Quiz Percent',
    subtitle: 'The program should print "Score: 70%" for 17 correct answers out of 24, but it prints "Score: 0%".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: Int division happens before scaling',
    brokenCode: `fun main() {
  val correct = 17
  val total = 24

  val ratio = correct / total
  val percent = ratio * 100

  println("Score: $percent%")
}`,
    fixedCode: `fun main() {
  val correct = 17
  val total = 24

  val scaled = correct * 100
  val percent = scaled / total

  println("Score: $percent%")
}`,
    expectedOutput: 'Score: 70%',
    hints: [
              'The score is far too low. Look at the first division, before anything is multiplied.',
              '`correct` and `total` are both Ints. What whole number is `17 / 24`?',
              'Change the order of the operations so the division has a bigger number to work with.',
            ],
    explanation:
      'Int division drops the fraction. `17 / 24` is about 0.7, which becomes 0, and `0 * 100` is still 0. Scaling first gives `17 * 100 = 1700`, and `1700 / 24` truncates to 70, the correct whole-number percent. When you need a percentage from Ints, multiply before you divide.',
  },

  // Float & Double
  {
    id: 'world-1-practice-debug-pass-rate',
    worldId: 'world-1',
    conceptTags: ['lesson:float-double', 'double', 'int', 'type-conversions'],
    summary: 'A pass rate and its percentage both print as 0.',
    title: 'Fix the Pass Rate',
    subtitle: 'The program should print "Pass rate: 0.625" and "Percent: 62.5" for 5 passed checks out of 8, but both lines print 0.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: Int divided by Int before any Double appears',
    brokenCode: `fun main() {
  val passed = 5
  val attempts = 8

  val rate = passed / attempts
  val percent = rate * 100

  println("Pass rate: $rate")
  println("Percent: $percent")
}`,
    fixedCode: `fun main() {
  val passed = 5
  val attempts = 8

  val rate = passed.toDouble() / attempts
  val percent = rate * 100

  println("Pass rate: $rate")
  println("Percent: $percent")
}`,
    expectedOutput: 'Pass rate: 0.625\nPercent: 62.5',
    hints: [
              'Both lines show 0. Something throws the fraction away before it is used.',
              '`passed` and `attempts` are both Ints, so the first division is an Int division. Which later value depends on it?',
              'Make the division a decimal division, so it keeps its fractional part.',
            ],
    explanation:
      'An Int divided by an Int is always an Int, so `5 / 8` became 0 and every later step (`0 * 100`) stayed 0. Calling `toDouble()` on one operand first makes it a Double division, giving 0.625 and then 62.5.',
  },
  {
    id: 'world-1-practice-debug-basket-total',
    worldId: 'world-1',
    conceptTags: ['lesson:float-double', 'double', 'int', 'type-conversions'],
    summary: 'A basket subtotal and total are both too low.',
    title: 'Fix the Basket Total',
    subtitle: 'The program should print "Subtotal: 59.25" and "Total: 63.75", but both numbers are too low.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: toInt() applied too early, loses the fraction',
    brokenCode: `fun main() {
  val price = 19.75
  val quantity = 3
  val shipping = 4.5

  val subtotal = price.toInt() * quantity
  val total = subtotal + shipping

  println("Subtotal: $subtotal")
  println("Total: $total")
}`,
    fixedCode: `fun main() {
  val price = 19.75
  val quantity = 3
  val shipping = 4.5

  val subtotal = price * quantity
  val total = subtotal + shipping

  println("Subtotal: $subtotal")
  println("Total: $total")
}`,
    expectedOutput: 'Subtotal: 59.25\nTotal: 63.75',
    hints: [
              'Both lines are wrong, but only one calculation is really broken. Find the first value that is off.',
              'Look at how `subtotal` is calculated. What happens to `price` before it is multiplied?',
              'A conversion removes the cents before the multiplication. Multiply the original Double instead.',
            ],
    explanation:
      '`price.toInt()` turns 19.75 into 19 before it is multiplied, so the subtotal became 57 instead of 59.25, and `total` inherited the error. The fault is in the first line that uses `toInt()`, not in the total. Convert to Int at the very end, or not at all, to keep the cents.',
  },

  // String
  {
    id: 'world-1-practice-debug-tag-width',
    worldId: 'world-1',
    conceptTags: ['lesson:string', 'string', 'concatenation', 'length'],
    summary: 'A tag width prints as two digits glued together instead of a sum.',
    title: 'Fix the Tag Width',
    subtitle: 'The program should print "Tag width: 8" (the name length plus 2), but it prints "Tag width: 62".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: + joins text instead of adding numbers',
    brokenCode: `fun main() {
  val name = "Kotlin"

  println("Tag width: " + name.length + 2)
}`,
    fixedCode: `fun main() {
  val name = "Kotlin"

  println("Tag width: " + (name.length + 2))
}`,
    expectedOutput: 'Tag width: 8',
    hints: [
              'The output has "6" and "2" side by side, not their total. What is `+` doing here?',
              'Kotlin evaluates `+` from left to right. Once one side is text, what does `+` do with the next value?',
              'Make the numbers add first, then join the result to the text.',
            ],
    explanation:
      'Evaluated left to right, `"Tag width: " + name.length` makes a String, and adding 2 to a String appends the character "2" instead of doing arithmetic. Parentheses make `name.length + 2` add as numbers first (8), and that result is then joined to the text.',
  },
  {
    id: 'world-1-practice-debug-order-slip',
    worldId: 'world-1',
    conceptTags: ['lesson:string', 'string', 'raw-string', 'trimIndent'],
    summary: 'A raw-string order slip prints with extra blank lines and indentation.',
    title: 'Fix the Order Slip',
    subtitle: 'The program should print "Item: Notebook" and "Qty: 3" on two lines, but the slip has a blank line above it and indented text.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: raw string keeps its indentation',
    brokenCode: `fun main() {
  val item = "Notebook"
  val quantity = 3

  val slip = """
        Item: $item
        Qty: $quantity
    """

  println(slip)
}`,
    fixedCode: `fun main() {
  val item = "Notebook"
  val quantity = 3

  val slip = """
        Item: $item
        Qty: $quantity
    """.trimIndent()

  println(slip)
}`,
    expectedOutput: 'Item: Notebook\nQty: 3',
    hints: [
              'The two values are right, but the layout is not. Look at the output above and beside the text.',
              'A triple-quoted raw string keeps every character between the quotes, including the line break after the opening quotes and the leading spaces.',
              'Use a String function that removes the common indentation and the blank first and last lines.',
            ],
    explanation:
      'A raw string keeps everything literally: the newline after `"""`, the spaces that indent the code, and the final newline before the closing `"""`. `trimIndent()` strips the common indentation and the blank first and last lines, leaving exactly "Item: Notebook" and "Qty: 3".',
  },

  // String templates
  {
    id: 'world-1-practice-debug-city-length',
    worldId: 'world-1',
    conceptTags: ['lesson:string-templates', 'string-templates', 'template-expression', 'length'],
    summary: 'A template prints the text ".length" instead of a number.',
    title: 'Fix the City Sentence',
    subtitle: 'The program should print "City: Osaka has 5 letters", but it prints "City: Osaka has Osaka.length letters".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: property access without curly braces in a template',
    brokenCode: `fun main() {
  val city = "Osaka"

  println("City: $city has $city.length letters")
}`,
    fixedCode: `fun main() {
  val city = "Osaka"

  println("City: $city has \${city.length} letters")
}`,
    expectedOutput: 'City: Osaka has 5 letters',
    hints: [
              'The sentence has the city name twice and no number. Look at how the second value is written in the template.',
              'A bare `$city` inserts only the variable. What happens to the text after it, such as `.length`?',
              'Use the template form that can hold a whole expression, not just a name.',
            ],
    explanation:
      'In a string template, `$city` inserts only the variable, and the following `.length` is ordinary text, so it printed "Osaka.length". Anything more than a plain variable name, such as a property, must be wrapped in braces: `${city.length}`.',
  },

  // Foundations
  {
    id: 'world-1-practice-debug-welcome-banner',
    worldId: 'world-1',
    conceptTags: ['lesson:foundations', 'print-println'],
    summary: 'A two-line banner prints as one glued line.',
    title: 'Fix the Welcome Banner',
    subtitle: 'The program should print "Welcome, Rin" and then "Ready." on the next line, but it prints "Welcome, RinReady.".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: print() used where println() ends the line',
    brokenCode: `fun main() {
  val user = "Rin"

  print("Welcome, ")
  print(user)
  print("Ready.")
}`,
    fixedCode: `fun main() {
  val user = "Rin"

  print("Welcome, ")
  println(user)
  print("Ready.")
}`,
    expectedOutput: 'Welcome, Rin\nReady.',
    hints: [
              'All the words are there, but on one line. What decides where a new line starts?',
              '`print()` leaves the cursor where it is, and only `println()` ends the line. Which call should end the greeting?',
              'End the first line after the name, so "Ready." starts fresh.',
            ],
    explanation:
      '`print()` never moves to a new line, so "Welcome, ", the name and "Ready." were glued into "Welcome, RinReady.". Ending the greeting with `println(user)` closes that line, so "Ready." begins on the next one.',
  },

  // val vs var
  {
    id: 'world-1-practice-debug-level-up',
    worldId: 'world-1',
    conceptTags: ['lesson:val-vs-var', 'val-vs-var', 'reassignment'],
    summary: 'A level counter never goes up even though the code adds 1 to it.',
    title: 'Fix the Level Up',
    subtitle: 'The program should print "Rex reached level 2", but it prints "Rex reached level 1".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the result of level + 1 is never stored',
    brokenCode: `fun main() {
  val hero = "Rex"
  var level = 1

  level + 1

  println("$hero reached level $level")
}`,
    fixedCode: `fun main() {
  val hero = "Rex"
  var level = 1

  level += 1

  println("$hero reached level $level")
}`,
    expectedOutput: 'Rex reached level 2',
    hints: [
              'The line that adds 1 runs without any error, yet `level` never changes. What does that line do with its result?',
              '`level + 1` works out a number, but nothing keeps it. A `var` only changes when something is assigned to it.',
              'Store the new value back into the variable.',
            ],
    explanation:
      '`level + 1` is just an expression that produces 2 and then throws it away, so `level` stayed 1. A `var` changes only through an assignment. `level += 1` (shorthand for `level = level + 1`) stores the new value back into `level`.',
  },

  // Variables & type inference
  {
    id: 'world-1-practice-debug-price-tag',
    worldId: 'world-1',
    conceptTags: ['lesson:variables-inference', 'explicit-types', 'double', 'int'],
    summary: 'A price declared with the wrong type fails to compile.',
    title: 'Fix the Price Tag',
    subtitle: 'The program should print "Tea costs 4.5", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Type Error: a decimal value declared as Int',
    brokenCode: `fun main() {
  val item = "Tea"
  val price: Int = 4.5

  println("$item costs $price")
}`,
    fixedCode: `fun main() {
  val item = "Tea"
  val price: Double = 4.5

  println("$item costs $price")
}`,
    expectedOutput: 'Tea costs 4.5',
    hints: [
              'The compiler reports a type mismatch on the price line. Compare the declared type with the value.',
              '`Int` can only hold whole numbers, but 4.5 has a fractional part. Which type holds decimals?',
              'Change the declared type so it can hold the value.',
            ],
    explanation:
      'An explicit type is a promise about what the variable holds. `Int` holds only whole numbers, so 4.5 does not fit. Declaring `price` as `Double` accepts the decimal value and prints it as 4.5.',
  },

  // Boolean
  {
    id: 'world-1-practice-debug-free-shipping',
    worldId: 'world-1',
    conceptTags: ['lesson:boolean', 'boolean', 'comparison'],
    summary: 'An order exactly at the free-shipping threshold is not given free shipping.',
    title: 'Fix the Free Shipping Rule',
    subtitle: 'An order of exactly 50 should get free shipping, so the program should print "Free shipping: true", but it prints "Free shipping: false".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: > excludes the boundary value',
    brokenCode: `fun main() {
  val total = 50
  val threshold = 50

  val free = total > threshold

  println("Free shipping: $free")
}`,
    fixedCode: `fun main() {
  val total = 50
  val threshold = 50

  val free = total >= threshold

  println("Free shipping: $free")
}`,
    expectedOutput: 'Free shipping: true',
    hints: [
              'The rule says "50 or more", and the order is exactly 50. What does the comparison do when both values are equal?',
              'Is 50 greater than 50? Which comparison also accepts equal values?',
              'Change the comparison so an order equal to the threshold qualifies.',
            ],
    explanation:
      '`total > threshold` is true only when `total` is strictly larger, so 50 against 50 gave false. "50 or more" includes 50 itself, which needs the greater-than-or-equal operator `>=`.',
  },

  // Char
  {
    id: 'world-1-practice-debug-line-break',
    worldId: 'world-1',
    conceptTags: ['lesson:char', 'char', 'escape-characters'],
    summary: 'A line-break Char written with the wrong slash does not compile.',
    title: 'Fix the Line Break',
    subtitle: 'The program should print "Total" and "Done" on two lines, but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'syntax',
    bugLabel: 'Syntax Error: forward slash instead of a backslash escape',
    brokenCode: `fun main() {
  val newline = '/n'

  println("Total" + newline + "Done")
}`,
    fixedCode: `fun main() {
  val newline = '\\n'

  println("Total" + newline + "Done")
}`,
    expectedOutput: 'Total\nDone',
    hints: [
              'The compiler rejects the Char on the first line. A Char can only hold one character or one escape.',
              'An escape sequence starts with one specific slash. Check which slash the Char uses.',
              'Write the newline escape with the correct slash.',
            ],
    explanation:
      'An escape sequence starts with a backslash: `\'\\n\'` is a single newline character. `\'/n\'` has two separate characters (a forward slash and the letter n), so it is not a valid Char literal. With the backslash it is one character, and it breaks the line between the two words.',
  },

  {
    id: 'world-1-practice-debug-class-trip',
    worldId: 'world-1',
    conceptTags: ['lesson:int-long', 'type-conversions', 'int', 'concatenation'],
    summary: 'Two student counts stored as text are glued together instead of added.',
    title: 'Fix the Class Trip Count',
    subtitle: 'The program should print "Students: 32" for groups of 17 and 15, but it prints "Students: 1715".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: + joins text instead of adding numbers',
    brokenCode: `fun main() {
  val boysText = "17"
  val girlsText = "15"

  val students = boysText + girlsText

  println("Students: $students")
}`,
    fixedCode: `fun main() {
  val boysText = "17"
  val girlsText = "15"

  val students = boysText.toInt() + girlsText.toInt()

  println("Students: $students")
}`,
    expectedOutput: 'Students: 32',
    hints: [
              'The total is far too big. Look at the type of the two counts.',
              '`boysText` and `girlsText` are Strings. What does `+` do between two Strings?',
              'Turn the text into numbers before you add them.',
            ],
    explanation:
      '`+` between two Strings joins them end to end, so "17" + "15" became "1715". Converting each String with `toInt()` first makes the `+` a numeric addition, giving 17 + 15 = 32.',
  },
];
