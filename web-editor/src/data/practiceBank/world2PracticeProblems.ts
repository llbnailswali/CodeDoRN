import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 2 -- Operator Forge (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-8 dependent steps, the operator is named in the step.
//   hard   -- an anticipated trap (precedence, left-to-right ++/--, a whole Double
//             printing as `105.0`, String ordering) and multi-line or formatted
//             output; the step names the quantity rather than the operator.
//
// Expected values are hand-derived from Kotlin's rules and checked against the
// simulator by scripts/test-practice-bank.ts; numeric behavior itself is pinned by
// scripts/test-numeric-semantics.ts. Lessons: arithmetic, comparison, logical,
// assignment, increment/decrement, precedence. The Boss is not in the Practice tab.

export const WORLD_2_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // ------------------------------------------------------------- Arithmetic
  {
    id: 'world-2-practice-writerun-digit-splitter',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Split a four-digit number into its digits with / and %, then add the digits.',
    conceptTags: ['lesson:arithmetic', 'int-division', 'remainder', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Digit Splitter',
    goal:
      'Separate 4872 into its four digits. Add the four digits together. Print the digits and their sum.',
    description:
      '1. **Find the thousands digit.** Divide `number` by `1000`.\n\n' +
              '2. **Find the hundreds digit.** Divide `number` by `100`, then use `% 10` to get the last digit.\n\n' +
              '3. **Find the tens digit.** Divide `number` by `10`, then use `% 10` to get the last digit.\n\n' +
              '4. **Find the ones digit.** Use `% 10` on `number` to get its last digit.\n\n' +
              '5. **Add the digits.** Create `val digitSum`: the four digits added together.\n\n' +
              '6. **Print two lines.** Use string templates:\n"Digits: 4 8 7 2"\n"Sum: 21"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the thousands digit.** Use division.',
          '2. **Find the hundreds digit.** Use division and `%`.',
          '3. **Find the tens digit.** Use division and `%`.',
          '4. **Find the ones digit.** Use `%`.',
          '5. **Add the digits.**',
          '6. **Print the digits and the sum.** Use string templates.',
        ],
        comments: [
          '// 1. Find the thousands digit. Use division.',
          '// 2. Find the hundreds digit. Use division and %.',
          '// 3. Find the tens digit. Use division and %.',
          '// 4. Find the ones digit. Use %.',
          '// 5. Add the digits.',
          '// 6. Print the digits and the sum. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Extract the thousands digit.**',
          '2. **Extract the hundreds digit.**',
          '3. **Extract the tens digit.**',
          '4. **Extract the ones digit.**',
          '5. **Add the digits.**',
          '6. **Print the digits and the sum.**',
        ],
        comments: [
          '// 1. Extract the thousands digit.',
          '// 2. Extract the hundreds digit.',
          '// 3. Extract the tens digit.',
          '// 4. Extract the ones digit.',
          '// 5. Add the digits.',
          '// 6. Print the digits and the sum.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DigitSplitter.kt',
    initialCode: `fun main() {
  val number = 4872

  // 1. Find the thousands digit. Divide number by 1000.

  // 2. Find the hundreds digit. Divide number by 100, then use % 10 to get the last digit.

  // 3. Find the tens digit. Divide number by 10, then use % 10 to get the last digit.

  // 4. Find the ones digit. Use % 10 on number to get its last digit.

  // 5. Add the digits. Create val digitSum: the four digits added together.

  // 6. Print two lines. Use string templates: "Digits: 4 8 7 2" "Sum: 21"
}`,
    solutionCode: `fun main() {
  val number = 4872

  val thousands = number / 1000
  val hundreds = number / 100 % 10
  val tens = number / 10 % 10
  val ones = number % 10
  val digitSum = thousands + hundreds + tens + ones

  println("Digits: $thousands $hundreds $tens $ones")
  println("Sum: $digitSum")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Digits: 4 8 7 2\nSum: 21',
    testCase: { call: '', expected: 'Digits: 4 8 7 2\nSum: 21' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'number', originalLiteral: '4872', alternateLiteral: '9305' }],
      alternateExpectedOutput: 'Digits: 9 3 0 5\nSum: 17',
    },
  },
  {
    id: 'world-2-practice-writerun-recipe-scaler',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Scale a recipe with an Int-to-Double division, so the fraction is kept.',
    conceptTags: ['lesson:arithmetic', 'double-promotion', 'type-conversions', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Recipe Scaler',
    goal:
      'A recipe for 4 people needs 250 g of flour. You are cooking for 6 people. Find how much to increase the recipe by and keep the decimal part. Find the flour needed and the number of extra servings. Print all three on one line.',
    description:
      '1. **Find the scale.** Create `val scale`: `targetServings` divided by `baseServings`. Call `toDouble()` on `baseServings` first, so the fraction is not lost.\n\n' +
              '2. **Find the flour needed.** Create `val flourNeeded`: `flourGrams` times `scale`.\n\n' +
              '3. **Find the extra servings.** Create `val extra`: `targetServings` minus `baseServings`.\n\n' +
              '4. **Print the summary.** Use string templates:\n"Scale: 1.5 | Flour: 375.0 g | Extra servings: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the scale.** Keep the decimal part with `toDouble()`.',
          '2. **Find the flour needed.** Use `scale`.',
          '3. **Find the extra servings.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Find the scale. Keep the decimal part with toDouble().',
          '// 2. Find the flour needed. Use scale.',
          '// 3. Find the extra servings.',
          '// 4. Print the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the scale.**',
          '2. **Find the flour needed.**',
          '3. **Find the extra servings.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Find the scale.',
          '// 2. Find the flour needed.',
          '// 3. Find the extra servings.',
          '// 4. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'RecipeScaler.kt',
    initialCode: `fun main() {
  val baseServings = 4
  val flourGrams = 250
  val targetServings = 6

  // 1. Find the scale. Create val scale: targetServings divided by baseServings. Call toDouble() on baseServings first, so the fraction is not lost.

  // 2. Find the flour needed. Create val flourNeeded: flourGrams times scale.

  // 3. Find the extra servings. Create val extra: targetServings minus baseServings.

  // 4. Print the summary. Use string templates: "Scale: 1.5 | Flour: 375.0 g | Extra servings: 2"
}`,
    solutionCode: `fun main() {
  val baseServings = 4
  val flourGrams = 250
  val targetServings = 6

  val scale = targetServings / baseServings.toDouble()
  val flourNeeded = flourGrams * scale
  val extra = targetServings - baseServings

  println("Scale: $scale | Flour: $flourNeeded g | Extra servings: $extra")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Scale: 1.5 | Flour: 375.0 g | Extra servings: 2',
    testCase: { call: '', expected: 'Scale: 1.5 | Flour: 375.0 g | Extra servings: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'targetServings', originalLiteral: '6', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Scale: 2.5 | Flour: 625.0 g | Extra servings: 6',
    },
  },
  {
    id: 'world-2-practice-writerun-salary-slip',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Mix Int and Double arithmetic to price regular hours and time-and-a-half overtime.',
    conceptTags: ['lesson:arithmetic', 'double-promotion', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Salary Slip',
    goal:
      'An employee worked 39 hours at 17.5 per hour. Hours above 35 are overtime and pay one and a half times the normal rate. Find the regular and overtime hours and their pay. Add the pay and print a four-line slip.',
    description:
      '1. **Find the overtime hours.** Create `val overtimeHours`: the hours worked beyond `regularHours`.\n\n' +
              '2. **Find the base pay.** Create `val basePay`: the pay for the regular hours at `hourlyRate`.\n\n' +
              '3. **Find the overtime pay.** Create `val overtimePay`: the pay for the overtime hours, at one and a half times `hourlyRate`.\n\n' +
              '4. **Find the total pay.** Create `val totalPay`: the base pay and the overtime pay together.\n\n' +
              '5. **Print four lines.** Use string templates:\n"Overtime hours: 4"\n"Base: 612.5"\n"Overtime: 105.0"\n"Total: 717.5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the overtime hours.** Subtract `regularHours`.',
          '2. **Find the base pay.** Use `regularHours` and `hourlyRate`.',
          '3. **Find the overtime pay.** Pay time and a half.',
          '4. **Find the total pay.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Find the overtime hours. Subtract regularHours.',
          '// 2. Find the base pay. Use regularHours and hourlyRate.',
          '// 3. Find the overtime pay. Pay time and a half.',
          '// 4. Find the total pay.',
          '// 5. Print four lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the overtime hours.**',
          '2. **Find the base pay.**',
          '3. **Find the overtime pay.**',
          '4. **Find the total pay.**',
          '5. **Print the slip.**',
        ],
        comments: [
          '// 1. Find the overtime hours.',
          '// 2. Find the base pay.',
          '// 3. Find the overtime pay.',
          '// 4. Find the total pay.',
          '// 5. Print the slip.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SalarySlip.kt',
    initialCode: `fun main() {
  val hoursWorked = 39
  val hourlyRate = 17.5
  val regularHours = 35

  // 1. Find the overtime hours. Create val overtimeHours: the hours worked beyond regularHours.

  // 2. Find the base pay. Create val basePay: the pay for the regular hours at hourlyRate.

  // 3. Find the overtime pay. Create val overtimePay: the pay for the overtime hours, at one and a half times hourlyRate.

  // 4. Find the total pay. Create val totalPay: the base pay and the overtime pay together.

  // 5. Print four lines. Use string templates: "Overtime hours: 4" "Base: 612.5" "Overtime: 105.0" "Total: 717.5"
}`,
    solutionCode: `fun main() {
  val hoursWorked = 39
  val hourlyRate = 17.5
  val regularHours = 35

  val overtimeHours = hoursWorked - regularHours
  val basePay = regularHours * hourlyRate
  val overtimePay = overtimeHours * hourlyRate * 1.5
  val totalPay = basePay + overtimePay

  println("Overtime hours: $overtimeHours")
  println("Base: $basePay")
  println("Overtime: $overtimePay")
  println("Total: $totalPay")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Overtime hours: 4\nBase: 612.5\nOvertime: 105.0\nTotal: 717.5',
    testCase: { call: '', expected: 'Overtime hours: 4\nBase: 612.5\nOvertime: 105.0\nTotal: 717.5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hoursWorked', originalLiteral: '39', alternateLiteral: '42' }],
      alternateExpectedOutput: 'Overtime hours: 7\nBase: 612.5\nOvertime: 183.75\nTotal: 796.25',
    },
  },

  // ------------------------------------------------------------- Comparison
  {
    id: 'world-2-practice-writerun-cart-compare',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Compare two calculated cart totals with <, ==, <= and != and report each Boolean.',
    conceptTags: ['lesson:comparison', 'comparison', 'boolean', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Cart Compare',
    goal:
      'You are comparing two shopping carts: 3 items at 15 each and 5 items at 9 each. Find each cart total. Check if cart A is cheaper, if both totals are equal, if cart A is within the 50 budget and if the totals are different. Print all four answers on one line.',
    description:
      '1. **Find the total of cart A.** Create `val totalA`: `itemsA` times `priceA`.\n\n' +
              '2. **Find the total of cart B.** Create `val totalB`: `itemsB` times `priceB`.\n\n' +
              '3. **Check if A is cheaper.** Create `val aCheaper`: whether `totalA` is less than `totalB`. Use `<`.\n\n' +
              '4. **Check if the totals are the same.** Create `val same`: whether `totalA` equals `totalB`. Use `==`.\n\n' +
              '5. **Check the budget.** Create `val withinBudget`: whether `totalA` is at most `budget`. Use `<=`.\n\n' +
              '6. **Check if the totals differ.** Create `val different`: whether `totalA` differs from `totalB`. Use `!=`.\n\n' +
              '7. **Print the report.** Use string templates:\n"aCheaper=false | same=true | withinBudget=true | different=false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the total of cart A.**',
          '2. **Find the total of cart B.**',
          '3. **Check if A is cheaper.** Use `<`.',
          '4. **Check if the totals are the same.** Use `==`.',
          '5. **Check the budget.** Use `<=`.',
          '6. **Check if the totals differ.** Use `!=`.',
          '7. **Print the report.**',
        ],
        comments: [
          '// 1. Find the total of cart A.',
          '// 2. Find the total of cart B.',
          '// 3. Check if A is cheaper. Use <.',
          '// 4. Check if the totals are the same. Use ==.',
          '// 5. Check the budget. Use <=.',
          '// 6. Check if the totals differ. Use !=.',
          '// 7. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the total of cart A.**',
          '2. **Find the total of cart B.**',
          '3. **Check if A is cheaper.**',
          '4. **Check if the totals are the same.**',
          '5. **Check the budget.**',
          '6. **Check if the totals differ.**',
          '7. **Print the report.**',
        ],
        comments: [
          '// 1. Find the total of cart A.',
          '// 2. Find the total of cart B.',
          '// 3. Check if A is cheaper.',
          '// 4. Check if the totals are the same.',
          '// 5. Check the budget.',
          '// 6. Check if the totals differ.',
          '// 7. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CartCompare.kt',
    initialCode: `fun main() {
  val itemsA = 3
  val priceA = 15
  val itemsB = 5
  val priceB = 9
  val budget = 50

  // 1. Find the total of cart A. Create val totalA: itemsA times priceA.

  // 2. Find the total of cart B. Create val totalB: itemsB times priceB.

  // 3. Check if A is cheaper. Create val aCheaper: whether totalA is less than totalB. Use <.

  // 4. Check if the totals are the same. Create val same: whether totalA equals totalB. Use ==.

  // 5. Check the budget. Create val withinBudget: whether totalA is at most budget. Use <=.

  // 6. Check if the totals differ. Create val different: whether totalA differs from totalB. Use !=.

  // 7. Print the report. Use string templates: "aCheaper=false | same=true | withinBudget=true | different=false"
}`,
    solutionCode: `fun main() {
  val itemsA = 3
  val priceA = 15
  val itemsB = 5
  val priceB = 9
  val budget = 50

  val totalA = itemsA * priceA
  val totalB = itemsB * priceB
  val aCheaper = totalA < totalB
  val same = totalA == totalB
  val withinBudget = totalA <= budget
  val different = totalA != totalB

  println("aCheaper=$aCheaper | same=$same | withinBudget=$withinBudget | different=$different")
}`,
    sampleInput: 'main()',
    expectedOutput: 'aCheaper=false | same=true | withinBudget=true | different=false',
    testCase: { call: '', expected: 'aCheaper=false | same=true | withinBudget=true | different=false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'priceA', originalLiteral: '15', alternateLiteral: '12' }],
      alternateExpectedOutput: 'aCheaper=true | same=false | withinBudget=true | different=true',
    },
  },
  {
    id: 'world-2-practice-writerun-name-sorter',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Order and compare two Strings, including the uppercase-before-lowercase trap, and their lengths.',
    conceptTags: ['lesson:comparison', 'comparison', 'string-ordering', 'length', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Name Sorter',
    goal:
      'Compare the names banana and Cherry. Find which comes first in dictionary order. Check if they have the same length, find the difference between their lengths and check if they are equal. Print a five-line report.',
    description:
      '1. **Check the order.** Create `val before`: whether `first` sorts before `second` in dictionary order.\n\n' +
              '2. **Check the length.** Create `val sameLength`: whether `first` and `second` have the same number of characters.\n\n' +
              '3. **Find the length gap.** Create `val lengthGap`: the length of `first` minus the length of `second`.\n\n' +
              '4. **Check if they are equal.** Create `val sameWord`: whether `first` and `second` are equal.\n\n' +
              '5. **Check the order the other way.** Create `val after`: whether `first` sorts after `second` in dictionary order.\n\n' +
              '6. **Print five lines.** Use string templates:\n"banana before Cherry: false"\n"Same length: true"\n"Length gap: 0"\n"Same word: false"\n"banana after Cherry: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check the order.** Compare the two Strings.',
          '2. **Check the length.** Use `length`.',
          '3. **Find the length gap.**',
          '4. **Check if they are equal.**',
          '5. **Check the order the other way.**',
          '6. **Print five lines.**',
        ],
        comments: [
          '// 1. Check the order. Compare the two Strings.',
          '// 2. Check the length. Use length.',
          '// 3. Find the length gap.',
          '// 4. Check if they are equal.',
          '// 5. Check the order the other way.',
          '// 6. Print five lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check the order.**',
          '2. **Check the length.**',
          '3. **Find the length gap.**',
          '4. **Check for equality.**',
          '5. **Check the reverse order.**',
          '6. **Print the report.**',
        ],
        comments: [
          '// 1. Check the order.',
          '// 2. Check the length.',
          '// 3. Find the length gap.',
          '// 4. Check for equality.',
          '// 5. Check the reverse order.',
          '// 6. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NameSorter.kt',
    initialCode: `fun main() {
  val first = "banana"
  val second = "Cherry"

  // 1. Check the order. Create val before: whether first sorts before second in dictionary order.

  // 2. Check the length. Create val sameLength: whether first and second have the same number of characters.

  // 3. Find the length gap. Create val lengthGap: the length of first minus the length of second.

  // 4. Check if they are equal. Create val sameWord: whether first and second are equal.

  // 5. Check the order the other way. Create val after: whether first sorts after second in dictionary order.

  // 6. Print five lines. Use string templates: "banana before Cherry: false" "Same length: true" "Length gap: 0" "Same word: false" "banana after Cherry: true"
}`,
    solutionCode: `fun main() {
  val first = "banana"
  val second = "Cherry"

  val before = first < second
  val sameLength = first.length == second.length
  val lengthGap = first.length - second.length
  val sameWord = first == second
  val after = first > second

  println("$first before $second: $before")
  println("Same length: $sameLength")
  println("Length gap: $lengthGap")
  println("Same word: $sameWord")
  println("$first after $second: $after")
}`,
    sampleInput: 'main()',
    expectedOutput: 'banana before Cherry: false\nSame length: true\nLength gap: 0\nSame word: false\nbanana after Cherry: true',
    testCase: { call: '', expected: 'banana before Cherry: false\nSame length: true\nLength gap: 0\nSame word: false\nbanana after Cherry: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'first', originalLiteral: '"banana"', alternateLiteral: '"Apple"' }],
      alternateExpectedOutput: 'Apple before Cherry: true\nSame length: false\nLength gap: -1\nSame word: false\nApple after Cherry: false',
    },
  },

  // ---------------------------------------------------------------- Logical
  {
    id: 'world-2-practice-writerun-club-entry',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Build entry rules from comparisons with && and ||, then negate the result with !.',
    conceptTags: ['lesson:logical', 'logical-and', 'logical-or', 'logical-not', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Club Entry',
    goal:
      'A club allows entry if someone is an adult and a member, or has an invitation. A 19-year-old has 2 years of membership and no invite. Find if they are an adult, a member, allowed in and blocked. Print all four answers on one line.',
    description:
      '1. **Check if they are an adult.** Create `val isAdult`: whether `age` is at least 18.\n\n' +
              '2. **Check if they are a member.** Create `val isMember`: whether `memberYears` is at least 1.\n\n' +
              '3. **Check if they can enter.** Create `val canEnter`: the person is an adult AND a member, OR has an invite. Put the AND part in parentheses.\n\n' +
              '4. **Check if they are blocked.** Create `val blocked`: the opposite of `canEnter`. Use `!`.\n\n' +
              '5. **Print the report.** Use string templates:\n"adult=true | member=true | enter=true | blocked=false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check if they are an adult.**',
          '2. **Check if they are a member.**',
          '3. **Check if they can enter.** Use `&&` and `||`.',
          '4. **Check if they are blocked.** Use `!`.',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Check if they are an adult.',
          '// 2. Check if they are a member.',
          '// 3. Check if they can enter. Use && and ||.',
          '// 4. Check if they are blocked. Use !.',
          '// 5. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check if they are an adult.**',
          '2. **Check if they are a member.**',
          '3. **Check if they can enter.**',
          '4. **Check if they are blocked.**',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Check if they are an adult.',
          '// 2. Check if they are a member.',
          '// 3. Check if they can enter.',
          '// 4. Check if they are blocked.',
          '// 5. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ClubEntry.kt',
    initialCode: `fun main() {
  val age = 19
  val memberYears = 2
  val hasInvite = false

  // 1. Check if they are an adult. Create val isAdult: whether age is at least 18.

  // 2. Check if they are a member. Create val isMember: whether memberYears is at least 1.

  // 3. Check if they can enter. Create val canEnter: the person is an adult AND a member, OR has an invite. Put the AND part in parentheses.

  // 4. Check if they are blocked. Create val blocked: the opposite of canEnter. Use !.

  // 5. Print the report. Use string templates: "adult=true | member=true | enter=true | blocked=false"
}`,
    solutionCode: `fun main() {
  val age = 19
  val memberYears = 2
  val hasInvite = false

  val isAdult = age >= 18
  val isMember = memberYears >= 1
  val canEnter = (isAdult && isMember) || hasInvite
  val blocked = !canEnter

  println("adult=$isAdult | member=$isMember | enter=$canEnter | blocked=$blocked")
}`,
    sampleInput: 'main()',
    expectedOutput: 'adult=true | member=true | enter=true | blocked=false',
    testCase: { call: '', expected: 'adult=true | member=true | enter=true | blocked=false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'age', originalLiteral: '19', alternateLiteral: '16' }],
      alternateExpectedOutput: 'adult=false | member=true | enter=false | blocked=true',
    },
  },
  {
    id: 'world-2-practice-writerun-discount-rules',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Write four store rules that mix &&, ||, ! and grouping, and report each one.',
    conceptTags: ['lesson:logical', 'logical-and', 'logical-or', 'logical-not', 'grouping', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Discount Rules',
    goal:
      'A shop checks several rules for a 120 order from a member with no coupon on a holiday. Find if free shipping applies, if a big discount applies, if discounts can be combined and if the customer gets no perks. Print the four answers on separate lines.',
    description:
      '1. **Check free shipping.** Create `val freeShipping`: the `total` is at least 100 AND the customer is a member or has a coupon.\n\n' +
              '2. **Check the big discount.** Create `val bigDiscount`: it is a holiday and the customer is a member, or the customer has a coupon.\n\n' +
              '3. **Check if discounts stack.** Create `val stackable`: the customer has neither a coupon nor a holiday deal.\n\n' +
              '4. **Check for no perks.** Create `val noPerks`: the customer is not a member and does not have a coupon.\n\n' +
              '5. **Print four lines.** Use string templates:\n"Free shipping: true"\n"Big discount: true"\n"Stackable: false"\n"No perks: false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check free shipping.** Combine a comparison with `&&` and `||`.',
          '2. **Check the big discount.** Use `&&` and `||`.',
          '3. **Check if discounts stack.** Use `!`.',
          '4. **Check for no perks.** Use `!` and `&&`.',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Check free shipping. Combine a comparison with && and ||.',
          '// 2. Check the big discount. Use && and ||.',
          '// 3. Check if discounts stack. Use !.',
          '// 4. Check for no perks. Use ! and &&.',
          '// 5. Print four lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check free shipping.**',
          '2. **Check the big discount.**',
          '3. **Check if discounts stack.**',
          '4. **Check for no perks.**',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Check free shipping.',
          '// 2. Check the big discount.',
          '// 3. Check if discounts stack.',
          '// 4. Check for no perks.',
          '// 5. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DiscountRules.kt',
    initialCode: `fun main() {
  val total = 120
  val isMember = true
  val hasCoupon = false
  val isHoliday = true

  // 1. Check free shipping. Create val freeShipping: the total is at least 100 AND the customer is a member or has a coupon.

  // 2. Check the big discount. Create val bigDiscount: it is a holiday and the customer is a member, or the customer has a coupon.

  // 3. Check if discounts stack. Create val stackable: the customer has neither a coupon nor a holiday deal.

  // 4. Check for no perks. Create val noPerks: the customer is not a member and does not have a coupon.

  // 5. Print four lines. Use string templates: "Free shipping: true" "Big discount: true" "Stackable: false" "No perks: false"
}`,
    solutionCode: `fun main() {
  val total = 120
  val isMember = true
  val hasCoupon = false
  val isHoliday = true

  val freeShipping = total >= 100 && (isMember || hasCoupon)
  val bigDiscount = isHoliday && isMember || hasCoupon
  val stackable = !(hasCoupon || isHoliday)
  val noPerks = !isMember && !hasCoupon

  println("Free shipping: $freeShipping")
  println("Big discount: $bigDiscount")
  println("Stackable: $stackable")
  println("No perks: $noPerks")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Free shipping: true\nBig discount: true\nStackable: false\nNo perks: false',
    testCase: { call: '', expected: 'Free shipping: true\nBig discount: true\nStackable: false\nNo perks: false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'isMember', originalLiteral: 'true', alternateLiteral: 'false' }],
      alternateExpectedOutput: 'Free shipping: false\nBig discount: false\nStackable: false\nNo perks: true',
    },
  },

  // ------------------------------------------------------------- Assignment
  {
    id: 'world-2-practice-writerun-inventory-update',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Update stock with +=, -=, *=, /= and %=, printing checkpoints along the way.',
    conceptTags: ['lesson:assignment', 'compound-assignment', 'int-division', 'remainder', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Inventory Update',
    goal:
      'A warehouse has 120 items. A delivery of 45 arrives and 8 items are damaged. The damaged count doubles after a recount. Update the numbers step by step with compound assignment and print a checkpoint. Then halve the stock and keep the amount left after packing groups of 25.',
    description:
      '1. **Add the delivery.** Add `delivery` to `stock` with `+=`.\n\n' +
              '2. **Remove the damaged items.** Subtract `damaged` from `stock` with `-=`.\n\n' +
              '3. **Double the damaged count.** Use `*= 2` on `damaged`.\n\n' +
              '4. **Print the checkpoint.** Use string templates:\n"Stock: 157 | Damaged: 16"\n\n' +
              '5. **Halve the stock.** Use `/= 2`. Int division drops the fraction.\n\n' +
              '6. **Print the halved stock.** Use a string template:\n"Half stock: 78"\n\n' +
              '7. **Keep the remainder.** Use `%= 25` on `stock` to keep only what is left after packing groups of 25.\n\n' +
              '8. **Print what is left over.** Use a string template:\n"Left over: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the delivery.** Use `+=`.',
          '2. **Remove the damaged items.** Use `-=`.',
          '3. **Double the damaged count.** Use `*=`.',
          '4. **Print the checkpoint.**',
          '5. **Halve the stock.** Use `/=`.',
          '6. **Print the halved stock.**',
          '7. **Keep the remainder.** Use `%=`.',
          '8. **Print what is left over.**',
        ],
        comments: [
          '// 1. Add the delivery. Use +=.',
          '// 2. Remove the damaged items. Use -=.',
          '// 3. Double the damaged count. Use *=.',
          '// 4. Print the checkpoint.',
          '// 5. Halve the stock. Use /=.',
          '// 6. Print the halved stock.',
          '// 7. Keep the remainder. Use %=.',
          '// 8. Print what is left over.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the delivery.**',
          '2. **Remove the damaged items.**',
          '3. **Double the damaged count.**',
          '4. **Print the checkpoint.**',
          '5. **Halve the stock.**',
          '6. **Print the halved stock.**',
          '7. **Keep the remainder.**',
          '8. **Print the leftover.**',
        ],
        comments: [
          '// 1. Add the delivery.',
          '// 2. Remove the damaged items.',
          '// 3. Double the damaged count.',
          '// 4. Print the checkpoint.',
          '// 5. Halve the stock.',
          '// 6. Print the halved stock.',
          '// 7. Keep the remainder.',
          '// 8. Print the leftover.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'InventoryUpdate.kt',
    initialCode: `fun main() {
  var stock = 120
  val delivery = 45
  var damaged = 8

  // 1. Add the delivery. Add delivery to stock with +=.

  // 2. Remove the damaged items. Subtract damaged from stock with -=.

  // 3. Double the damaged count. Use *= 2 on damaged.

  // 4. Print the checkpoint. Use string templates: "Stock: 157 | Damaged: 16"

  // 5. Halve the stock. Use /= 2. Int division drops the fraction.

  // 6. Print the halved stock. Use a string template: "Half stock: 78"

  // 7. Keep the remainder. Use %= 25 on stock to keep only what is left after packing groups of 25.

  // 8. Print what is left over. Use a string template: "Left over: 3"
}`,
    solutionCode: `fun main() {
  var stock = 120
  val delivery = 45
  var damaged = 8

  stock += delivery
  stock -= damaged
  damaged *= 2

  println("Stock: $stock | Damaged: $damaged")

  stock /= 2

  println("Half stock: $stock")

  stock %= 25

  println("Left over: $stock")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Stock: 157 | Damaged: 16\nHalf stock: 78\nLeft over: 3',
    testCase: { call: '', expected: 'Stock: 157 | Damaged: 16\nHalf stock: 78\nLeft over: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'stock', originalLiteral: '120', alternateLiteral: '200' }],
      alternateExpectedOutput: 'Stock: 237 | Damaged: 16\nHalf stock: 118\nLeft over: 18',
    },
  },
  {
    id: 'world-2-practice-writerun-savings-plan',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Update a Double with several compound operators and build a report String with +=.',
    conceptTags: ['lesson:assignment', 'compound-assignment', 'double', 'string-append', 'statement-order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Savings Plan',
    goal:
      'A saver starts with 800 and adds 200 each week. Over two weeks, a 1.5x bonus is added, a 300 fee is charged and the balance is then halved. Keep the balance and week count updated. Build a summary sentence piece by piece and print it.',
    description:
      '1. **Add the deposit.** Add `deposit` to `savings`.\n\n' +
              '2. **Count a week.** Add 1 to `weeks`.\n\n' +
              '3. **Apply the bonus.** Multiply `savings` by 1.5.\n\n' +
              '4. **Count another week.** Add 1 to `weeks` again.\n\n' +
              '5. **Charge the fee.** Subtract a fee of 300.0 from `savings`.\n\n' +
              '6. **Halve the savings.** Use a compound operator to halve `savings`.\n\n' +
              '7. **Build the summary.** Create `var summary` that starts as "Weeks: ". Then use `+=` to append `weeks`, then " | Savings: ", then `savings`.\n\n' +
              '8. **Print the summary.** Print `summary`:\n"Weeks: 2 | Savings: 600.0"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the deposit.** Use `+=`.',
          '2. **Count a week.**',
          '3. **Apply the bonus.** Use `*=`.',
          '4. **Count another week.**',
          '5. **Charge the fee.** Use `-=`.',
          '6. **Halve the savings.** Use `/=`.',
          '7. **Build the summary.** Append the pieces with `+=`.',
          '8. **Print the summary.**',
        ],
        comments: [
          '// 1. Add the deposit. Use +=.',
          '// 2. Count a week.',
          '// 3. Apply the bonus. Use *=.',
          '// 4. Count another week.',
          '// 5. Charge the fee. Use -=.',
          '// 6. Halve the savings. Use /=.',
          '// 7. Build the summary. Append the pieces with +=.',
          '// 8. Print the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the deposit.**',
          '2. **Count a week.**',
          '3. **Apply the bonus.**',
          '4. **Count another week.**',
          '5. **Charge the fee.**',
          '6. **Halve the savings.**',
          '7. **Build the summary.**',
          '8. **Print the summary.**',
        ],
        comments: [
          '// 1. Add the deposit.',
          '// 2. Count a week.',
          '// 3. Apply the bonus.',
          '// 4. Count another week.',
          '// 5. Charge the fee.',
          '// 6. Halve the savings.',
          '// 7. Build the summary.',
          '// 8. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SavingsPlan.kt',
    initialCode: `fun main() {
  var savings = 800.0
  val deposit = 200.0
  var weeks = 0

  // 1. Add the deposit. Add deposit to savings.

  // 2. Count a week. Add 1 to weeks.

  // 3. Apply the bonus. Multiply savings by 1.5.

  // 4. Count another week. Add 1 to weeks again.

  // 5. Charge the fee. Subtract a fee of 300.0 from savings.

  // 6. Halve the savings. Use a compound operator to halve savings.

  // 7. Build the summary. Create var summary that starts as "Weeks: ". Then use += to append weeks, then " | Savings: ", then savings.

  // 8. Print the summary. Print summary: "Weeks: 2 | Savings: 600.0"
}`,
    solutionCode: `fun main() {
  var savings = 800.0
  val deposit = 200.0
  var weeks = 0

  savings += deposit
  weeks += 1
  savings *= 1.5
  weeks += 1
  savings -= 300.0
  savings /= 2

  var summary = "Weeks: "
  summary += weeks
  summary += " | Savings: "
  summary += savings

  println(summary)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Weeks: 2 | Savings: 600.0',
    testCase: { call: '', expected: 'Weeks: 2 | Savings: 600.0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'deposit', originalLiteral: '200.0', alternateLiteral: '400.0' }],
      alternateExpectedOutput: 'Weeks: 2 | Savings: 750.0',
    },
  },

  // ------------------------------------------------------ Increment/decrement
  {
    id: 'world-2-practice-writerun-ticket-queue',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Use postfix and prefix ++ as expression values, then --, to issue queue numbers.',
    conceptTags: ['lesson:incdec', 'postfix-increment', 'prefix-increment', 'decrement', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Ticket Queue',
    goal:
      'A ticket machine starts giving ticket numbers from 100. It gives two tickets, skips one number and then goes back one number. Use the increment and decrement operators to give and update the numbers. The result depends on whether the operator is before or after the variable. Print the report.',
    description:
      '1. **Issue the first ticket.** Create `val first` with `next++`. The value used is the number BEFORE the increase.\n\n' +
              '2. **Issue the second ticket.** Create `val second` the same way, with `next++`.\n\n' +
              '3. **Skip a number.** Create `val skipped` with `++next`. The value used is the number AFTER the increase.\n\n' +
              '4. **Step back.** Lower `next` by 1 with `next--`.\n\n' +
              '5. **Print the report.** Use string templates:\n"Issued: 100, 101 | Skipped to: 103 | Back to: 102"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Issue the first ticket.** Read the value before it increases.',
          '2. **Issue the second ticket.** Do the same.',
          '3. **Skip a number.** Read the value after it increases.',
          '4. **Step back.** Lower `next` by 1.',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Issue the first ticket. Read the value before it increases.',
          '// 2. Issue the second ticket. Do the same.',
          '// 3. Skip a number. Read the value after it increases.',
          '// 4. Step back. Lower next by 1.',
          '// 5. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Issue the first ticket.**',
          '2. **Issue the second ticket.**',
          '3. **Skip a number.**',
          '4. **Step back.**',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Issue the first ticket.',
          '// 2. Issue the second ticket.',
          '// 3. Skip a number.',
          '// 4. Step back.',
          '// 5. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TicketQueue.kt',
    initialCode: `fun main() {
  var next = 100

  // 1. Issue the first ticket. Create val first with next++. The value used is the number BEFORE the increase.

  // 2. Issue the second ticket. Create val second the same way, with next++.

  // 3. Skip a number. Create val skipped with ++next. The value used is the number AFTER the increase.

  // 4. Step back. Lower next by 1 with next--.

  // 5. Print the report. Use string templates: "Issued: 100, 101 | Skipped to: 103 | Back to: 102"
}`,
    solutionCode: `fun main() {
  var next = 100

  val first = next++
  val second = next++
  val skipped = ++next
  next--

  println("Issued: $first, $second | Skipped to: $skipped | Back to: $next")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Issued: 100, 101 | Skipped to: 103 | Back to: 102',
    testCase: { call: '', expected: 'Issued: 100, 101 | Skipped to: 103 | Back to: 102' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'next', originalLiteral: '100', alternateLiteral: '250' }],
      alternateExpectedOutput: 'Issued: 250, 251 | Skipped to: 253 | Back to: 252',
    },
  },
  {
    id: 'world-2-practice-writerun-lap-counter',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Choose prefix or postfix ++ and -- for four values, using only the wording to decide which.',
    conceptTags: ['lesson:incdec', 'postfix-increment', 'prefix-increment', 'decrement', 'statement-order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Lap Counter',
    goal:
      'A race tracker starts counting laps at 1. A seat counter starts at 10 and goes down as seats are taken. Read each value just before or just after it changes using increment and decrement in the same statement. Print the saved values and the final lap and seat counts.',
    description:
      '1. **Read the current lap.** Create `val currentLap`: the lap number as it is BEFORE advancing. Advance `lap` by 1 in the same statement.\n\n' +
              '2. **Read the next lap.** Create `val nextLap`: the lap number as it is AFTER advancing once more. Advance `lap` by 1 in the same statement.\n\n' +
              '3. **Read the seat taken.** Create `val seatTaken`: the `seats` value as it is BEFORE it drops. Lower `seats` by 1 in the same statement.\n\n' +
              '4. **Read the seats after another drop.** Create `val seatsAfter`: the `seats` value as it is AFTER one more drop. Lower `seats` by 1 in the same statement.\n\n' +
              '5. **Print one line.** Use string templates. Show the two lap values, the two seat values, then the final lap and the final seats:\n"Laps: 1, 3 | Seats: 10, 8 | Lap now: 3 | Seats left: 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Read the current lap.** Read it before advancing.',
          '2. **Read the next lap.** Read it after advancing.',
          '3. **Read the seat taken.** Read it before it drops.',
          '4. **Read the seats after another drop.** Read it after it drops.',
          '5. **Print one line.**',
        ],
        comments: [
          '// 1. Read the current lap. Read it before advancing.',
          '// 2. Read the next lap. Read it after advancing.',
          '// 3. Read the seat taken. Read it before it drops.',
          '// 4. Read the seats after another drop. Read it after it drops.',
          '// 5. Print one line.',
        ],
      },
      experienced: {
        steps: [
          '1. **Read the current lap.**',
          '2. **Read the next lap.**',
          '3. **Read the seat taken.**',
          '4. **Read the seats after another drop.**',
          '5. **Print one line.**',
        ],
        comments: [
          '// 1. Read the current lap.',
          '// 2. Read the next lap.',
          '// 3. Read the seat taken.',
          '// 4. Read the seats after another drop.',
          '// 5. Print one line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LapCounter.kt',
    initialCode: `fun main() {
  var lap = 1
  var seats = 10

  // 1. Read the current lap. Create val currentLap: the lap number as it is BEFORE advancing. Advance lap by 1 in the same statement.

  // 2. Read the next lap. Create val nextLap: the lap number as it is AFTER advancing once more. Advance lap by 1 in the same statement.

  // 3. Read the seat taken. Create val seatTaken: the seats value as it is BEFORE it drops. Lower seats by 1 in the same statement.

  // 4. Read the seats after another drop. Create val seatsAfter: the seats value as it is AFTER one more drop. Lower seats by 1 in the same statement.

  // 5. Print one line. Use string templates. Show the two lap values, the two seat values, then the final lap and the final seats: "Laps: 1, 3 | Seats: 10, 8 | Lap now: 3 | Seats left: 8"
}`,
    solutionCode: `fun main() {
  var lap = 1
  var seats = 10

  val currentLap = lap++
  val nextLap = ++lap
  val seatTaken = seats--
  val seatsAfter = --seats

  println("Laps: $currentLap, $nextLap | Seats: $seatTaken, $seatsAfter | Lap now: $lap | Seats left: $seats")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Laps: 1, 3 | Seats: 10, 8 | Lap now: 3 | Seats left: 8',
    testCase: { call: '', expected: 'Laps: 1, 3 | Seats: 10, 8 | Lap now: 3 | Seats left: 8' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'lap', originalLiteral: '1', alternateLiteral: '7' },
        { variableName: 'seats', originalLiteral: '10', alternateLiteral: '20' },
      ],
      alternateExpectedOutput: 'Laps: 7, 9 | Seats: 20, 18 | Lap now: 9 | Seats left: 18',
    },
  },

  // -------------------------------------------------------------- Precedence
  {
    id: 'world-2-practice-writerun-checkout-totals',
    worldId: 'world-2',
    difficulty: 'medium',
    summary: 'Write three arithmetic expressions where precedence and parentheses decide the answer.',
    conceptTags: ['lesson:precedence', 'precedence', 'parentheses', 'int-division', 'remainder', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Checkout Totals',
    goal:
      'A shop has 3 items at 40 each and takes off a discount of 15 twice. Find the checkout total, a split amount and a ratio using Kotlin\'s operator order. Add parentheses only where needed. Print the three results.',
    description:
      '1. **Find the total.** Create `val total`: `price` times `quantity`, minus `discount` times 2. Use no parentheses, because multiplication runs first.\n\n' +
              '2. **Find the split.** Create `val split`: put `price + discount` in parentheses, multiply by `quantity`, then divide by 5.\n\n' +
              '3. **Find the ratio.** Create `val ratio`: `total` divided by 4, plus the remainder of `total` divided by 4.\n\n' +
              '4. **Print the report.** Use string templates:\n"Total: 90 | Split: 33 | Ratio: 24"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the total.** Use no parentheses.',
          '2. **Find the split.** Add first, using parentheses.',
          '3. **Find the ratio.** Use `/` and `%`.',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Find the total. Use no parentheses.',
          '// 2. Find the split. Add first, using parentheses.',
          '// 3. Find the ratio. Use / and %.',
          '// 4. Print the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the total.**',
          '2. **Find the split.**',
          '3. **Find the ratio.**',
          '4. **Print the report.**',
        ],
        comments: [
          '// 1. Find the total.',
          '// 2. Find the split.',
          '// 3. Find the ratio.',
          '// 4. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CheckoutTotals.kt',
    initialCode: `fun main() {
  val price = 40
  val quantity = 3
  val discount = 15

  // 1. Find the total. Create val total: price times quantity, minus discount times 2. Use no parentheses, because multiplication runs first.

  // 2. Find the split. Create val split: put price + discount in parentheses, multiply by quantity, then divide by 5.

  // 3. Find the ratio. Create val ratio: total divided by 4, plus the remainder of total divided by 4.

  // 4. Print the report. Use string templates: "Total: 90 | Split: 33 | Ratio: 24"
}`,
    solutionCode: `fun main() {
  val price = 40
  val quantity = 3
  val discount = 15

  val total = price * quantity - discount * 2
  val split = (price + discount) * quantity / 5
  val ratio = total / 4 + total % 4

  println("Total: $total | Split: $split | Ratio: $ratio")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 90 | Split: 33 | Ratio: 24',
    testCase: { call: '', expected: 'Total: 90 | Split: 33 | Ratio: 24' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'quantity', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Total: 130 | Split: 44 | Ratio: 34',
    },
  },
  {
    id: 'world-2-practice-writerun-shipping-rules',
    worldId: 'world-2',
    difficulty: 'hard',
    summary: 'Build shipping rules where arithmetic sits inside comparisons that sit inside && and ||.',
    conceptTags: ['lesson:precedence', 'precedence', 'comparison', 'logical-and', 'logical-or', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shipping Rules',
    goal:
      'A courier needs to price a 12 kg parcel traveling 250 km. The parcel is fragile but not priority. Find the base fee from the weight and distance. Then find if it needs insurance, if express shipping is allowed and if shipping is free. Print all four results.',
    description:
      '1. **Find the base fee.** Create `val baseFee`: 3 for every kilogram, plus 1 for every 50 full kilometres.\n\n' +
              '2. **Check insurance.** Create `val needsInsurance`: `baseFee` is above 40 AND the parcel is fragile.\n\n' +
              '3. **Check express shipping.** Create `val expressAllowed`: the whole number of 100 km blocks in `distanceKm` is at most 2, OR the parcel is priority.\n\n' +
              '4. **Check free shipping.** Create `val freeShipping`: twice `weightKg` is above 30, OR (`baseFee` is below 45 AND the parcel is not fragile).\n\n' +
              '5. **Print four lines.** Use string templates:\n"Base fee: 41"\n"Insurance: true"\n"Express: true"\n"Free shipping: false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find the base fee.** Combine multiplication and Int division.',
          '2. **Check insurance.** Use `>` and `&&`.',
          '3. **Check express shipping.** Use Int division, `<=` and `||`.',
          '4. **Check free shipping.** Use `>`, `<`, `!`, `&&` and `||`.',
          '5. **Print four lines.**',
        ],
        comments: [
          '// 1. Find the base fee. Combine multiplication and Int division.',
          '// 2. Check insurance. Use > and &&.',
          '// 3. Check express shipping. Use Int division, <= and ||.',
          '// 4. Check free shipping. Use >, <, !, && and ||.',
          '// 5. Print four lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find the base fee.**',
          '2. **Check insurance.**',
          '3. **Check express shipping.**',
          '4. **Check free shipping.**',
          '5. **Print the report.**',
        ],
        comments: [
          '// 1. Find the base fee.',
          '// 2. Check insurance.',
          '// 3. Check express shipping.',
          '// 4. Check free shipping.',
          '// 5. Print the report.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShippingRules.kt',
    initialCode: `fun main() {
  val weightKg = 12
  val distanceKm = 250
  val isFragile = true
  val isPriority = false

  // 1. Find the base fee. Create val baseFee: 3 for every kilogram, plus 1 for every 50 full kilometres.

  // 2. Check insurance. Create val needsInsurance: baseFee is above 40 AND the parcel is fragile.

  // 3. Check express shipping. Create val expressAllowed: the whole number of 100 km blocks in distanceKm is at most 2, OR the parcel is priority.

  // 4. Check free shipping. Create val freeShipping: twice weightKg is above 30, OR (baseFee is below 45 AND the parcel is not fragile).

  // 5. Print four lines. Use string templates: "Base fee: 41" "Insurance: true" "Express: true" "Free shipping: false"
}`,
    solutionCode: `fun main() {
  val weightKg = 12
  val distanceKm = 250
  val isFragile = true
  val isPriority = false

  val baseFee = weightKg * 3 + distanceKm / 50
  val needsInsurance = baseFee > 40 && isFragile
  val expressAllowed = distanceKm / 100 <= 2 || isPriority
  val freeShipping = weightKg * 2 > 30 || (baseFee < 45 && !isFragile)

  println("Base fee: $baseFee")
  println("Insurance: $needsInsurance")
  println("Express: $expressAllowed")
  println("Free shipping: $freeShipping")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Base fee: 41\nInsurance: true\nExpress: true\nFree shipping: false',
    testCase: { call: '', expected: 'Base fee: 41\nInsurance: true\nExpress: true\nFree shipping: false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'weightKg', originalLiteral: '12', alternateLiteral: '16' }],
      alternateExpectedOutput: 'Base fee: 53\nInsurance: true\nExpress: true\nFree shipping: true',
    },
  },
];

export const WORLD_2_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // Arithmetic
  {
    id: 'world-2-practice-debug-two-test-average',
    worldId: 'world-2',
    conceptTags: ['lesson:arithmetic', 'int-division', 'double-promotion'],
    summary: 'The average of two test scores loses its .5.',
    title: 'Fix the Two-Test Average',
    subtitle: 'The program should print "Average: 87.5" for the scores 85 and 90, but it prints "Average: 87".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: Int / Int drops the fraction',
    brokenCode: `fun main() {
  val test1 = 85
  val test2 = 90

  val average = (test1 + test2) / 2

  println("Average: $average")
}`,
    fixedCode: `fun main() {
  val test1 = 85
  val test2 = 90

  val average = (test1 + test2) / 2.0

  println("Average: $average")
}`,
    expectedOutput: 'Average: 87.5',
    hints: [
              'The sum is right, but the half is missing from the result. Look at the type of the numbers in the division.',
              '`(test1 + test2)` is an Int and `2` is an Int. What does dividing two Ints do with a fractional result?',
              'Make one side of the division a Double, so the result keeps its fraction.',
            ],
    explanation:
      'Int divided by Int always gives an Int, so `175 / 2` became 87 and the .5 was thrown away. A Double operand switches the whole division to decimal math: `175 / 2.0` is 87.5.',
  },

  // Comparison
  {
    id: 'world-2-practice-debug-version-check',
    worldId: 'world-2',
    conceptTags: ['lesson:comparison', 'string-ordering', 'type-conversions'],
    summary: 'Version numbers stored as text compare in the wrong order.',
    title: 'Fix the Version Check',
    subtitle: 'Version 10 is newer than version 9, so the program should print "Update available: true", but it prints "Update available: false".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: numbers compared as text',
    brokenCode: `fun main() {
  val latest = "10"
  val current = "9"

  val newer = latest > current

  println("Update available: $newer")
}`,
    fixedCode: `fun main() {
  val latest = "10"
  val current = "9"

  val newer = latest.toInt() > current.toInt()

  println("Update available: $newer")
}`,
    expectedOutput: 'Update available: true',
    hints: [
              'The comparison gives the wrong answer even though 10 is bigger than 9. What type are `latest` and `current`?',
              'Both values are Strings, and Strings are ordered like a dictionary, one character at a time. Which character decides "10" against "9"?',
              'Convert both Strings to numbers before you compare them.',
            ],
    explanation:
      'Strings compare character by character, so "10" against "9" is decided by "1" against "9". "1" sorts first, so `"10" > "9"` is false. Converting with `toInt()` compares 10 and 9 as numbers, which is what a version check needs.',
  },

  // Logical
  {
    id: 'world-2-practice-debug-museum-door',
    worldId: 'world-2',
    conceptTags: ['lesson:logical', 'logical-not', 'logical-or'],
    summary: 'A door rule negates only half of its condition.',
    title: 'Fix the Museum Door',
    subtitle: 'A visitor with a pass should be let in, so the program should print "Denied: false", but it prints "Denied: true".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: ! applied to only part of the condition',
    brokenCode: `fun main() {
  val hasTicket = false
  val hasPass = true

  val denied = !hasTicket || hasPass

  println("Denied: $denied")
}`,
    fixedCode: `fun main() {
  val hasTicket = false
  val hasPass = true

  val denied = !(hasTicket || hasPass)

  println("Denied: $denied")
}`,
    expectedOutput: 'Denied: false',
    hints: [
              'A visitor with a pass is denied. The rule says "denied when they have neither a ticket nor a pass". Compare the rule with the code.',
              '`!` flips only the value right next to it. What does it flip in `!hasTicket || hasPass`?',
              'Put both conditions in parentheses, then negate the whole group.',
            ],
    explanation:
      '`!hasTicket || hasPass` negates `hasTicket` alone: `true || true` is true, so the visitor was denied. "Neither a ticket nor a pass" means NOT (a ticket OR a pass), so the `!` must wrap the whole group: `!(false || true)` is false.',
  },
  {
    id: 'world-2-practice-debug-loan-approval',
    worldId: 'world-2',
    conceptTags: ['lesson:logical', 'logical-and', 'logical-or', 'grouping'],
    summary: 'A loan rule is approved because && binds tighter than the intended grouping.',
    title: 'Fix the Loan Approval',
    subtitle: 'A loan needs credit approval, so the program should print "Approved: false". But a high income alone gets it approved, and it prints "Approved: true".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: missing parentheses around an OR',
    brokenCode: `fun main() {
  val income = 3500
  val hasGuarantor = false
  val creditOk = false

  val approved = income >= 3000 || hasGuarantor && creditOk

  println("Approved: $approved")
}`,
    fixedCode: `fun main() {
  val income = 3500
  val hasGuarantor = false
  val creditOk = false

  val approved = (income >= 3000 || hasGuarantor) && creditOk

  println("Approved: $approved")
}`,
    expectedOutput: 'Approved: false',
    hints: [
              'The rule needs credit approval, but a loan without credit approval is approved. Which part is being skipped?',
              '`&&` is evaluated before `||`. Which two conditions does the `&&` actually join in the broken line?',
              'Group the two conditions that can each be enough, so credit approval is required in every case.',
            ],
    explanation:
      '`&&` binds tighter than `||`, so the broken line means `income >= 3000 || (hasGuarantor && creditOk)`. The high income alone made it true. Parentheses make the intended rule clear: (income or guarantor) AND `creditOk`.',
  },

  // Assignment
  {
    id: 'world-2-practice-debug-split-the-bill',
    worldId: 'world-2',
    conceptTags: ['lesson:assignment', 'compound-assignment', 'int-division'],
    summary: 'Splitting a bill with /= drops the cents.',
    title: 'Fix the Bill Split',
    subtitle: 'A 45 bill split four ways should print "Each pays 11.25", but the program prints "Each pays 11".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: /= on an Int drops the fraction',
    brokenCode: `fun main() {
  var bill = 45

  bill /= 4

  println("Each pays $bill")
}`,
    fixedCode: `fun main() {
  var bill = 45.0

  bill /= 4

  println("Each pays $bill")
}`,
    expectedOutput: 'Each pays 11.25',
    hints: [
              'The operator looks right, but the result has no cents. Look at how the variable is declared.',
              '`bill` is declared from the whole number 45, so it is an Int. What does `/=` do to an Int?',
              'Declare `bill` so it holds decimal values, then `/=` keeps the fraction.',
            ],
    explanation:
      '`bill /= 4` means `bill = bill / 4`. A variable that starts as the Int 45 stays an Int, so `45 / 4` became 11. Starting from the Double `45.0` makes the division decimal, which gives 11.25.',
  },

  // Increment/decrement
  {
    id: 'world-2-practice-debug-order-number',
    worldId: 'world-2',
    conceptTags: ['lesson:incdec', 'postfix-increment', 'prefix-increment'],
    summary: 'A freshly assigned order number is one behind because ++ was written after the variable.',
    title: 'Fix the Order Number',
    subtitle: 'The next order should print "Assigned #42", but the receipt shows the previous number, "Assigned #41".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: postfix ++ returns the old value',
    brokenCode: `fun main() {
  var orderNo = 41

  val assigned = orderNo++

  println("Assigned #$assigned")
}`,
    fixedCode: `fun main() {
  var orderNo = 41

  val assigned = ++orderNo

  println("Assigned #$assigned")
}`,
    expectedOutput: 'Assigned #42',
    hints: [
              'The receipt shows the number from before the increase. What value does the expression `orderNo++` give?',
              'Postfix (`orderNo++`) gives the value first and increases it afterwards. Where should the `++` go to give the new value?',
              'Move the `++` to the other side of the variable name.',
            ],
    explanation:
      '`orderNo++` evaluates to the value BEFORE the increase (41) and only then changes the variable to 42. `++orderNo` increases first and evaluates to the new value, 42, which is what the receipt needs.',
  },

  // Precedence
  {
    id: 'world-2-practice-debug-three-score-average',
    worldId: 'world-2',
    conceptTags: ['lesson:precedence', 'precedence', 'parentheses'],
    summary: 'An average divides only the last score because the sum is not in parentheses.',
    title: 'Fix the Three-Score Average',
    subtitle: 'The scores 60, 70 and 80 should print "Average: 70", but the program prints "Average: 156".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: missing parentheses around a sum',
    brokenCode: `fun main() {
  val a = 60
  val b = 70
  val c = 80

  val average = a + b + c / 3

  println("Average: $average")
}`,
    fixedCode: `fun main() {
  val a = 60
  val b = 70
  val c = 80

  val average = (a + b + c) / 3

  println("Average: $average")
}`,
    expectedOutput: 'Average: 70',
    hints: [
              'The result is much bigger than any score. Work out which numbers the `/` really divides.',
              'Division runs before addition. In `a + b + c / 3`, what is the only thing divided by 3?',
              'Put the whole sum in parentheses, so it is added before it is divided.',
            ],
    explanation:
      'Division binds tighter than addition, so `a + b + c / 3` is `a + b + (c / 3)` = 60 + 70 + 26 = 156. Parentheses force the sum to be added first: `(60 + 70 + 80) / 3` = 70.',
  },
  {
    id: 'world-2-practice-debug-refund-rule',
    worldId: 'world-2',
    conceptTags: ['lesson:precedence', 'precedence', 'comparison', 'logical-and', 'logical-or', 'grouping'],
    summary: 'A refund rule approves an order that misses the minimum spend because of operator grouping.',
    title: 'Fix the Refund Rule',
    subtitle: 'A refund needs the minimum spend, and either an unopened or a damaged item. The order spent 50, below the minimum of 60, so the program should print "Refund: false", but it prints "Refund: true".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: && and || grouped differently than intended',
    brokenCode: `fun main() {
  val price = 20
  val quantity = 3
  val coupon = 10
  val minSpend = 60
  val opened = true
  val damaged = true

  val eligible = price * quantity - coupon >= minSpend && !opened || damaged

  println("Refund: $eligible")
}`,
    fixedCode: `fun main() {
  val price = 20
  val quantity = 3
  val coupon = 10
  val minSpend = 60
  val opened = true
  val damaged = true

  val eligible = price * quantity - coupon >= minSpend && (!opened || damaged)

  println("Refund: $eligible")
}`,
    expectedOutput: 'Refund: false',
    hints: [
              'The order spent 50, below the minimum of 60, but the refund is approved. Which part of the rule is not being required?',
              'Operators run in this order: arithmetic, then comparisons, then `&&`, then `||`. Where does the final `||` attach?',
              'The minimum-spend check must apply to both item cases. Group the two item conditions together.',
            ],
    explanation:
      'The order of operations is arithmetic, then comparison, then `&&`, then `||`. So the broken line means `(spend >= minSpend && !opened) || damaged`: `damaged` alone made it true even though 50 is below 60. Grouping `(!opened || damaged)` makes the minimum spend required in every case: `50 >= 60` is false, so the whole rule is false.',
  },
];
