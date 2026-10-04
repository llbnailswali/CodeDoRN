/**
 * Content for ONE world's practice-bank wording pass (this file is World 2, kept as the worked example).
 * Copy it to `world<N>.data.ts` and rewrite the text for that world. See PRACTICE_CONTENT_PASS.md.
 *
 * WR_DATA is keyed by the task id WITHOUT its `world-<N>-practice-writerun-` prefix, DBG_DATA by the id without
 * `world-<N>-practice-debug-`. Authored per Write & Run task:
 *   summary  one line for the task list card (plain text, no markup)
 *   goal     WHAT to build (plain text, no markup)
 *   setup    optional note (markup allowed): only for facts the "You start with" box cannot show
 *   steps    BEGINNER steps, WITHOUT the "N. " prefix. `**Goal sentence.** method`, `code` in backticks, "\n" + quoted
 *            output lines allowed
 *   i, e     Intermediate / Experienced versions of the SAME steps (same count, no "N. " prefix)
 * Editor comments are NOT authored: they are derived from the steps (comment == hint text).
 * Debug: subtitle (behaviour, not facts), exactly 3 hints (notice -> reason -> direction), explanation.
 */
export interface WR { summary: string; goal: string; setup?: string; steps: string[]; i: string[]; e: string[] }
export interface DBG { subtitle: string; hints: [string, string, string]; explanation: string }

export const WR_DATA: Record<string, WR> = {
  'digit-splitter': {
    summary: 'Split a four-digit number into its digits with / and %, then add the digits.',
    goal: 'Separate 4872 into its four digits. Then add the digits together and print the digits and their sum.',
    steps: [
      '**Find the thousands digit.** Divide `number` by `1000`.',
      '**Find the hundreds digit.** Divide `number` by `100`, then use `% 10` to get the last digit.',
      '**Find the tens digit.** Divide `number` by `10`, then use `% 10` to get the last digit.',
      '**Find the ones digit.** Use `% 10` on `number` to get its last digit.',
      '**Add the digits.** Create `val digitSum`: the four digits added together.',
      '**Print two lines.** Use string templates:\n"Digits: 4 8 7 2"\n"Sum: 21"',
    ],
    i: ['**Find the thousands digit.** Use division.', '**Find the hundreds digit.** Use division and `%`.', '**Find the tens digit.** Use division and `%`.', '**Find the ones digit.** Use `%`.', '**Add the digits.**', '**Print the digits and the sum.** Use string templates.'],
    e: ['**Extract the thousands digit.**', '**Extract the hundreds digit.**', '**Extract the tens digit.**', '**Extract the ones digit.**', '**Add the digits.**', '**Print the digits and the sum.**'],
  },
  'recipe-scaler': {
    summary: 'Scale a recipe with an Int-to-Double division, so the fraction is kept.',
    goal: 'A recipe for 4 people needs 250 g of flour, and you are cooking for 6. Work out how much to scale the recipe by, keeping the decimal part. Then work out how much flour you need and how many extra servings you are making. Print all three in one line.',
    steps: [
      '**Find the scale.** Create `val scale`: `targetServings` divided by `baseServings`. Call `toDouble()` on `baseServings` first, so the fraction is not lost.',
      '**Find the flour needed.** Create `val flourNeeded`: `flourGrams` times `scale`.',
      '**Find the extra servings.** Create `val extra`: `targetServings` minus `baseServings`.',
      '**Print the summary.** Use string templates:\n"Scale: 1.5 | Flour: 375.0 g | Extra servings: 2"',
    ],
    i: ['**Find the scale.** Keep the decimal part with `toDouble()`.', '**Find the flour needed.** Use `scale`.', '**Find the extra servings.**', '**Print the summary.**'],
    e: ['**Find the scale.**', '**Find the flour needed.**', '**Find the extra servings.**', '**Print the summary.**'],
  },
  'salary-slip': {
    summary: 'Mix Int and Double arithmetic to price regular hours and time-and-a-half overtime.',
    goal: 'An employee worked 39 hours at 17.5 per hour. Hours over 35 count as overtime and are paid at one and a half times the rate. Split the hours into regular and overtime, work out each part of the pay, add them up, and print a four-line slip.',
    steps: [
      '**Find the overtime hours.** Create `val overtimeHours`: the hours worked beyond `regularHours`.',
      '**Find the base pay.** Create `val basePay`: the pay for the regular hours at `hourlyRate`.',
      '**Find the overtime pay.** Create `val overtimePay`: the pay for the overtime hours, at one and a half times `hourlyRate`.',
      '**Find the total pay.** Create `val totalPay`: the base pay and the overtime pay together.',
      '**Print four lines.** Use string templates:\n"Overtime hours: 4"\n"Base: 612.5"\n"Overtime: 105.0"\n"Total: 717.5"',
    ],
    i: ['**Find the overtime hours.** Subtract `regularHours`.', '**Find the base pay.** Use `regularHours` and `hourlyRate`.', '**Find the overtime pay.** Pay time and a half.', '**Find the total pay.**', '**Print four lines.**'],
    e: ['**Find the overtime hours.**', '**Find the base pay.**', '**Find the overtime pay.**', '**Find the total pay.**', '**Print the slip.**'],
  },
  'cart-compare': {
    summary: 'Compare two calculated cart totals with <, ==, <= and != and report each Boolean.',
    goal: 'You are choosing between two shopping carts: 3 items at 15 each, or 5 items at 9 each. Work out each cart total, then compare them. Is cart A cheaper? Are they the same? Is cart A within the 50 budget? Do they differ? Print all four answers on one line.',
    steps: [
      '**Find the total of cart A.** Create `val totalA`: `itemsA` times `priceA`.',
      '**Find the total of cart B.** Create `val totalB`: `itemsB` times `priceB`.',
      '**Check if A is cheaper.** Create `val aCheaper`: whether `totalA` is less than `totalB`. Use `<`.',
      '**Check if the totals are the same.** Create `val same`: whether `totalA` equals `totalB`. Use `==`.',
      '**Check the budget.** Create `val withinBudget`: whether `totalA` is at most `budget`. Use `<=`.',
      '**Check if the totals differ.** Create `val different`: whether `totalA` differs from `totalB`. Use `!=`.',
      '**Print the report.** Use string templates:\n"aCheaper=false | same=true | withinBudget=true | different=false"',
    ],
    i: ['**Find the total of cart A.**', '**Find the total of cart B.**', '**Check if A is cheaper.** Use `<`.', '**Check if the totals are the same.** Use `==`.', '**Check the budget.** Use `<=`.', '**Check if the totals differ.** Use `!=`.', '**Print the report.**'],
    e: ['**Find the total of cart A.**', '**Find the total of cart B.**', '**Check if A is cheaper.**', '**Check if the totals are the same.**', '**Check the budget.**', '**Check if the totals differ.**', '**Print the report.**'],
  },
  'name-sorter': {
    summary: 'Order and compare two Strings, including the uppercase-before-lowercase trap, and their lengths.',
    goal: 'You are sorting two names, banana and Cherry. Find out how they compare: which comes first in dictionary order, whether they have the same length, how far apart their lengths are, and whether they are equal. Print a five-line report.',
    steps: [
      '**Check the order.** Create `val before`: whether `first` sorts before `second` in dictionary order.',
      '**Check the length.** Create `val sameLength`: whether `first` and `second` have the same number of characters.',
      '**Find the length gap.** Create `val lengthGap`: the length of `first` minus the length of `second`.',
      '**Check if they are equal.** Create `val sameWord`: whether `first` and `second` are equal.',
      '**Check the order the other way.** Create `val after`: whether `first` sorts after `second` in dictionary order.',
      '**Print five lines.** Use string templates:\n"banana before Cherry: false"\n"Same length: true"\n"Length gap: 0"\n"Same word: false"\n"banana after Cherry: true"',
    ],
    i: ['**Check the order.** Compare the two Strings.', '**Check the length.** Use `length`.', '**Find the length gap.**', '**Check if they are equal.**', '**Check the order the other way.**', '**Print five lines.**'],
    e: ['**Check the order.**', '**Check the length.**', '**Find the length gap.**', '**Check for equality.**', '**Check the reverse order.**', '**Print the report.**'],
  },
  'club-entry': {
    summary: 'Build entry rules from comparisons with && and ||, then negate the result with !.',
    goal: 'A club lets someone in if they are an adult and a member, or if they have an invitation. A 19-year-old with 2 years of membership and no invite arrives. Work out whether they are an adult, a member, allowed in, and blocked. Print all four answers on one line.',
    steps: [
      '**Check if they are an adult.** Create `val isAdult`: whether `age` is at least 18.',
      '**Check if they are a member.** Create `val isMember`: whether `memberYears` is at least 1.',
      '**Check if they can enter.** Create `val canEnter`: the person is an adult AND a member, OR has an invite. Put the AND part in parentheses.',
      '**Check if they are blocked.** Create `val blocked`: the opposite of `canEnter`. Use `!`.',
      '**Print the report.** Use string templates:\n"adult=true | member=true | enter=true | blocked=false"',
    ],
    i: ['**Check if they are an adult.**', '**Check if they are a member.**', '**Check if they can enter.** Use `&&` and `||`.', '**Check if they are blocked.** Use `!`.', '**Print the report.**'],
    e: ['**Check if they are an adult.**', '**Check if they are a member.**', '**Check if they can enter.**', '**Check if they are blocked.**', '**Print the report.**'],
  },
  'discount-rules': {
    summary: 'Write four store rules that mix &&, ||, ! and grouping, and report each one.',
    goal: 'A shop applies several rules to a 120 order from a member who has no coupon, on a holiday. Work out which rules apply: free shipping, a big discount, whether discounts can stack, and whether the customer gets no perks at all. Print the four answers on separate lines.',
    steps: [
      '**Check free shipping.** Create `val freeShipping`: the `total` is at least 100 AND the customer is a member or has a coupon.',
      '**Check the big discount.** Create `val bigDiscount`: it is a holiday and the customer is a member, or the customer has a coupon.',
      '**Check if discounts stack.** Create `val stackable`: the customer has neither a coupon nor a holiday deal.',
      '**Check for no perks.** Create `val noPerks`: the customer is not a member and does not have a coupon.',
      '**Print four lines.** Use string templates:\n"Free shipping: true"\n"Big discount: true"\n"Stackable: false"\n"No perks: false"',
    ],
    i: ['**Check free shipping.** Combine a comparison with `&&` and `||`.', '**Check the big discount.** Use `&&` and `||`.', '**Check if discounts stack.** Use `!`.', '**Check for no perks.** Use `!` and `&&`.', '**Print four lines.**'],
    e: ['**Check free shipping.**', '**Check the big discount.**', '**Check if discounts stack.**', '**Check for no perks.**', '**Print four lines.**'],
  },
  'inventory-update': {
    summary: 'Update stock with +=, -=, *=, /= and %=, printing checkpoints along the way.',
    goal: 'A warehouse holds 120 items. A delivery of 45 arrives, 8 items are found damaged, and the damaged count doubles after a recount. Update the numbers step by step with compound assignment and print a checkpoint. Then halve the stock and keep only what is left after packing into groups of 25.',
    steps: [
      '**Add the delivery.** Add `delivery` to `stock` with `+=`.',
      '**Remove the damaged items.** Subtract `damaged` from `stock` with `-=`.',
      '**Double the damaged count.** Use `*= 2` on `damaged`.',
      '**Print the checkpoint.** Use string templates:\n"Stock: 157 | Damaged: 16"',
      '**Halve the stock.** Use `/= 2`. Int division drops the fraction.',
      '**Print the halved stock.** Use a string template:\n"Half stock: 78"',
      '**Keep the remainder.** Use `%= 25` on `stock` to keep only what is left after packing groups of 25.',
      '**Print what is left over.** Use a string template:\n"Left over: 3"',
    ],
    i: ['**Add the delivery.** Use `+=`.', '**Remove the damaged items.** Use `-=`.', '**Double the damaged count.** Use `*=`.', '**Print the checkpoint.**', '**Halve the stock.** Use `/=`.', '**Print the halved stock.**', '**Keep the remainder.** Use `%=`.', '**Print what is left over.**'],
    e: ['**Add the delivery.**', '**Remove the damaged items.**', '**Double the damaged count.**', '**Print the checkpoint.**', '**Halve the stock.**', '**Print the halved stock.**', '**Keep the remainder.**', '**Print the leftover.**'],
  },
  'savings-plan': {
    summary: 'Update a Double with several compound operators and build a report String with +=.',
    goal: 'A saver starts with 800 and adds 200 a week. Over two weeks, a 1.5x bonus is applied, a 300 fee is charged, and the balance is then halved. Track the balance and the week count as they change, build a summary sentence piece by piece, and print it.',
    steps: [
      '**Add the deposit.** Add `deposit` to `savings`.',
      '**Count a week.** Add 1 to `weeks`.',
      '**Apply the bonus.** Multiply `savings` by 1.5.',
      '**Count another week.** Add 1 to `weeks` again.',
      '**Charge the fee.** Subtract a fee of 300.0 from `savings`.',
      '**Halve the savings.** Use a compound operator to halve `savings`.',
      '**Build the summary.** Create `var summary` that starts as "Weeks: ". Then use `+=` to append `weeks`, then " | Savings: ", then `savings`.',
      '**Print the summary.** Print `summary`:\n"Weeks: 2 | Savings: 600.0"',
    ],
    i: ['**Add the deposit.** Use `+=`.', '**Count a week.**', '**Apply the bonus.** Use `*=`.', '**Count another week.**', '**Charge the fee.** Use `-=`.', '**Halve the savings.** Use `/=`.', '**Build the summary.** Append the pieces with `+=`.', '**Print the summary.**'],
    e: ['**Add the deposit.**', '**Count a week.**', '**Apply the bonus.**', '**Count another week.**', '**Charge the fee.**', '**Halve the savings.**', '**Build the summary.**', '**Print the summary.**'],
  },
  'ticket-queue': {
    summary: 'Use postfix and prefix ++ as expression values, then --, to issue queue numbers.',
    goal: 'A ticket machine hands out numbers starting at 100. It issues two tickets, skips one number, then steps back one. Use the increment and decrement operators to hand out and track the numbers. The value you get depends on whether the operator comes before or after the variable. Print the report.',
    steps: [
      '**Issue the first ticket.** Create `val first` with `next++`. The value used is the number BEFORE the increase.',
      '**Issue the second ticket.** Create `val second` the same way, with `next++`.',
      '**Skip a number.** Create `val skipped` with `++next`. The value used is the number AFTER the increase.',
      '**Step back.** Lower `next` by 1 with `next--`.',
      '**Print the report.** Use string templates:\n"Issued: 100, 101 | Skipped to: 103 | Back to: 102"',
    ],
    i: ['**Issue the first ticket.** Read the value before it increases.', '**Issue the second ticket.** Do the same.', '**Skip a number.** Read the value after it increases.', '**Step back.** Lower `next` by 1.', '**Print the report.**'],
    e: ['**Issue the first ticket.**', '**Issue the second ticket.**', '**Skip a number.**', '**Step back.**', '**Print the report.**'],
  },
  'lap-counter': {
    summary: 'Choose prefix or postfix ++ and -- for four values, using only the wording to decide which.',
    goal: 'A race tracker counts laps starting at 1, and a seat counter starts at 10 and drops as seats are taken. Read each value either just before or just after it changes, by using increment and decrement in the same statement. Print the values you captured, with the final lap and seat counts.',
    steps: [
      '**Read the current lap.** Create `val currentLap`: the lap number as it is BEFORE advancing. Advance `lap` by 1 in the same statement.',
      '**Read the next lap.** Create `val nextLap`: the lap number as it is AFTER advancing once more. Advance `lap` by 1 in the same statement.',
      '**Read the seat taken.** Create `val seatTaken`: the `seats` value as it is BEFORE it drops. Lower `seats` by 1 in the same statement.',
      '**Read the seats after another drop.** Create `val seatsAfter`: the `seats` value as it is AFTER one more drop. Lower `seats` by 1 in the same statement.',
      '**Print one line.** Use string templates. Show the two lap values, the two seat values, then the final lap and the final seats:\n"Laps: 1, 3 | Seats: 10, 8 | Lap now: 3 | Seats left: 8"',
    ],
    i: ['**Read the current lap.** Read it before advancing.', '**Read the next lap.** Read it after advancing.', '**Read the seat taken.** Read it before it drops.', '**Read the seats after another drop.** Read it after it drops.', '**Print one line.**'],
    e: ['**Read the current lap.**', '**Read the next lap.**', '**Read the seat taken.**', '**Read the seats after another drop.**', '**Print one line.**'],
  },
  'checkout-totals': {
    summary: 'Write three arithmetic expressions where precedence and parentheses decide the answer.',
    goal: 'A shop total is 3 items at 40, with a discount of 15 taken off twice. Work out the checkout total, a split amount and a ratio, using the order Kotlin runs its operators in. Add parentheses only where the rule needs them. Print the three results.',
    steps: [
      '**Find the total.** Create `val total`: `price` times `quantity`, minus `discount` times 2. Use no parentheses, because multiplication runs first.',
      '**Find the split.** Create `val split`: put `price + discount` in parentheses, multiply by `quantity`, then divide by 5.',
      '**Find the ratio.** Create `val ratio`: `total` divided by 4, plus the remainder of `total` divided by 4.',
      '**Print the report.** Use string templates:\n"Total: 90 | Split: 33 | Ratio: 24"',
    ],
    i: ['**Find the total.** Use no parentheses.', '**Find the split.** Add first, using parentheses.', '**Find the ratio.** Use `/` and `%`.', '**Print the report.**'],
    e: ['**Find the total.**', '**Find the split.**', '**Find the ratio.**', '**Print the report.**'],
  },
  'shipping-rules': {
    summary: 'Build shipping rules where arithmetic sits inside comparisons that sit inside && and ||.',
    goal: 'A courier prices a 12 kg parcel that travels 250 km. The parcel is fragile but not priority. Work out the base fee from the weight and the distance. Then decide whether it needs insurance, whether express shipping is allowed, and whether shipping is free. Print all four results.',
    steps: [
      '**Find the base fee.** Create `val baseFee`: 3 for every kilogram, plus 1 for every 50 full kilometres.',
      '**Check insurance.** Create `val needsInsurance`: `baseFee` is above 40 AND the parcel is fragile.',
      '**Check express shipping.** Create `val expressAllowed`: the whole number of 100 km blocks in `distanceKm` is at most 2, OR the parcel is priority.',
      '**Check free shipping.** Create `val freeShipping`: twice `weightKg` is above 30, OR (`baseFee` is below 45 AND the parcel is not fragile).',
      '**Print four lines.** Use string templates:\n"Base fee: 41"\n"Insurance: true"\n"Express: true"\n"Free shipping: false"',
    ],
    i: ['**Find the base fee.** Combine multiplication and Int division.', '**Check insurance.** Use `>` and `&&`.', '**Check express shipping.** Use Int division, `<=` and `||`.', '**Check free shipping.** Use `>`, `<`, `!`, `&&` and `||`.', '**Print four lines.**'],
    e: ['**Find the base fee.**', '**Check insurance.**', '**Check express shipping.**', '**Check free shipping.**', '**Print the report.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'two-test-average': {
    subtitle: 'The program should print "Average: 87.5" for the scores 85 and 90, but it prints "Average: 87".',
    hints: ['The sum is right, but the half is missing from the result. Look at the type of the numbers in the division.', '`(test1 + test2)` is an Int and `2` is an Int. What does dividing two Ints do with a fractional result?', 'Make one side of the division a Double, so the result keeps its fraction.'],
    explanation: 'Int divided by Int always gives an Int, so `175 / 2` became 87 and the .5 was thrown away. A Double operand switches the whole division to decimal math: `175 / 2.0` is 87.5.',
  },
  'version-check': {
    subtitle: 'Version 10 is newer than version 9, so the program should print "Update available: true", but it prints "Update available: false".',
    hints: ['The comparison gives the wrong answer even though 10 is bigger than 9. What type are `latest` and `current`?', 'Both values are Strings, and Strings are ordered like a dictionary, one character at a time. Which character decides "10" against "9"?', 'Convert both Strings to numbers before you compare them.'],
    explanation: 'Strings compare character by character, so "10" against "9" is decided by "1" against "9". "1" sorts first, so `"10" > "9"` is false. Converting with `toInt()` compares 10 and 9 as numbers, which is what a version check needs.',
  },
  'museum-door': {
    subtitle: 'A visitor with a pass should be let in, so the program should print "Denied: false", but it prints "Denied: true".',
    hints: ['A visitor with a pass is denied. The rule says "denied when they have neither a ticket nor a pass". Compare the rule with the code.', '`!` flips only the value right next to it. What does it flip in `!hasTicket || hasPass`?', 'Put both conditions in parentheses, then negate the whole group.'],
    explanation: '`!hasTicket || hasPass` negates `hasTicket` alone: `true || true` is true, so the visitor was denied. "Neither a ticket nor a pass" means NOT (a ticket OR a pass), so the `!` must wrap the whole group: `!(false || true)` is false.',
  },
  'loan-approval': {
    subtitle: 'A loan needs credit approval, so the program should print "Approved: false". But a high income alone gets it approved, and it prints "Approved: true".',
    hints: ['The rule needs credit approval, but a loan without credit approval is approved. Which part is being skipped?', '`&&` is evaluated before `||`. Which two conditions does the `&&` actually join in the broken line?', 'Group the two conditions that can each be enough, so credit approval is required in every case.'],
    explanation: '`&&` binds tighter than `||`, so the broken line means `income >= 3000 || (hasGuarantor && creditOk)`. The high income alone made it true. Parentheses make the intended rule clear: (income or guarantor) AND `creditOk`.',
  },
  'split-the-bill': {
    subtitle: 'A 45 bill split four ways should print "Each pays 11.25", but the program prints "Each pays 11".',
    hints: ['The operator looks right, but the result has no cents. Look at how the variable is declared.', '`bill` is declared from the whole number 45, so it is an Int. What does `/=` do to an Int?', 'Declare `bill` so it holds decimal values, then `/=` keeps the fraction.'],
    explanation: '`bill /= 4` means `bill = bill / 4`. A variable that starts as the Int 45 stays an Int, so `45 / 4` became 11. Starting from the Double `45.0` makes the division decimal, which gives 11.25.',
  },
  'order-number': {
    subtitle: 'The next order should print "Assigned #42", but the receipt shows the previous number, "Assigned #41".',
    hints: ['The receipt shows the number from before the increase. What value does the expression `orderNo++` give?', 'Postfix (`orderNo++`) gives the value first and increases it afterwards. Where should the `++` go to give the new value?', 'Move the `++` to the other side of the variable name.'],
    explanation: '`orderNo++` evaluates to the value BEFORE the increase (41) and only then changes the variable to 42. `++orderNo` increases first and evaluates to the new value, 42, which is what the receipt needs.',
  },
  'three-score-average': {
    subtitle: 'The scores 60, 70 and 80 should print "Average: 70", but the program prints "Average: 156".',
    hints: ['The result is much bigger than any score. Work out which numbers the `/` really divides.', 'Division runs before addition. In `a + b + c / 3`, what is the only thing divided by 3?', 'Put the whole sum in parentheses, so it is added before it is divided.'],
    explanation: 'Division binds tighter than addition, so `a + b + c / 3` is `a + b + (c / 3)` = 60 + 70 + 26 = 156. Parentheses force the sum to be added first: `(60 + 70 + 80) / 3` = 70.',
  },
  'refund-rule': {
    subtitle: 'A refund needs the minimum spend, and either an unopened or a damaged item. The order spent 50, below the minimum of 60, so the program should print "Refund: false", but it prints "Refund: true".',
    hints: ['The order spent 50, below the minimum of 60, but the refund is approved. Which part of the rule is not being required?', 'Operators run in this order: arithmetic, then comparisons, then `&&`, then `||`. Where does the final `||` attach?', 'The minimum-spend check must apply to both item cases. Group the two item conditions together.'],
    explanation: 'The order of operations is arithmetic, then comparison, then `&&`, then `||`. So the broken line means `(spend >= minSpend && !opened) || damaged`: `damaged` alone made it true even though 50 is below 60. Grouping `(!opened || damaged)` makes the minimum spend required in every case: `50 >= 60` is false, so the whole rule is false.',
  },
};

