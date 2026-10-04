/**
 * World 1 (Kotlin Awakening) practice-bank wording pass. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'warehouse-pallets': {
    summary: 'Split boxes into full pallets and leftovers, then prove the split adds back up.',
    goal: 'A warehouse ships 487 boxes and each pallet holds 24. Find the full pallets and the leftover boxes, then print a report that also checks the split adds back to 487.',
    steps: [
      '**Find the full pallets.** Create `val fullPallets`: `totalBoxes` divided by `boxesPerPallet`. Int division drops the fraction.',
      '**Find the leftover boxes.** Create `val leftover`: the remainder of `totalBoxes` divided by `boxesPerPallet`. Use `%`.',
      '**Rebuild the total.** Create `val check`: `fullPallets * boxesPerPallet + leftover`.',
      '**Print the report.** Use string templates:\n"Pallets: 20 | Leftover: 7 | Check: 487"',
    ],
    i: ['**Find the full pallets.** Use Int division.', '**Find the leftover boxes.** Use `%`.', '**Rebuild the total.** Create `val check`.', '**Print the report.** Use string templates.'],
    e: ['**Find the full pallets.**', '**Find the leftover boxes.**', '**Rebuild the total.**', '**Print the report.**'],
  },
  'flight-log-timer': {
    summary: 'Break a Long number of seconds into hours, minutes and seconds, then verify it.',
    goal: 'Turn 100,000 seconds into hours, minutes and seconds and print it as a duration. Then rebuild the total from the three parts to prove the conversion is right.',
    steps: [
      '**Find the hours.** Create `val hours`: the whole hours in `totalSeconds`. One hour is `3600` seconds.',
      '**Find the seconds left after the hours.** Create `val leftAfterHours`: the remainder of `totalSeconds` divided by `3600`. Use `%`.',
      '**Find the minutes.** Create `val minutes`: the whole minutes in `leftAfterHours`. One minute is `60` seconds.',
      '**Find the seconds left after the minutes.** Create `val seconds`: the remainder of `leftAfterHours` divided by `60`. Use `%`.',
      '**Rebuild the total.** Create `val check` from `hours`, `minutes` and `seconds`.',
      '**Print two lines.** Use string templates:\n"Duration: 27h 46m 40s"\n"Check: 100000"',
    ],
    i: ['**Find the hours.** Divide by `3600`.', '**Find the seconds left after the hours.** Use `%`.', '**Find the minutes.** Divide by `60`.', '**Find the seconds left after the minutes.** Use `%`.', '**Rebuild the total.**', '**Print the duration and the check.** Use string templates.'],
    e: ['**Find the hours.**', '**Find the seconds left after the hours.**', '**Find the minutes.**', '**Find the seconds left after the minutes.**', '**Rebuild the total.**', '**Print the duration and the check.**'],
  },
  'road-trip-fuel': {
    summary: 'Mix Int and Double values to report fuel efficiency and cost for a trip.',
    goal: 'A trip covered 210 km on 12.5 liters of fuel at 1.5 per liter. Find the km per liter, the whole km per liter, and the fuel cost. Print all three on one line.',
    steps: [
      '**Find the km per liter.** Create `val kmPerLiter`: `distanceKm` divided by `litersUsed`. An Int divided by a Double gives a Double.',
      '**Find the whole km per liter.** Create `val wholeKm`: `kmPerLiter` converted to an Int with `toInt()`.',
      '**Find the cost.** Create `val cost`: `litersUsed` times `pricePerLiter`.',
      '**Print the report.** Use string templates:\n"Efficiency: 16.8 km/L (16 whole) | Cost: 18.75"',
    ],
    i: ['**Find the km per liter.** Divide the distance by the liters.', '**Find the whole km per liter.** Use `toInt()`.', '**Find the cost.**', '**Print the report.** Use string templates.'],
    e: ['**Find the km per liter.**', '**Find the whole km per liter.**', '**Find the cost.**', '**Print the report.**'],
  },
  'quiz-average': {
    summary: 'Average four Int scores without losing the fraction, then split it into parts.',
    goal: 'Find the exact average of four quiz scores, keeping its decimal part. Split it into a whole part and a fraction, and print all three.',
    steps: [
      '**Add the scores.** Create `val total`: the four quiz scores added together.',
      '**Find the exact average.** Create `val average`: `total` divided by `4`. Call `toDouble()` on `total` first, or the fraction is lost.',
      '**Find the whole part.** Create `val whole`: `average` converted to an Int with `toInt()`.',
      '**Find the fraction.** Create `val fraction`: `average` minus `whole`.',
      '**Print three lines.** Use string templates:\n"Average: 83.5"\n"Whole: 83"\n"Fraction: 0.5"',
    ],
    i: ['**Add the scores.**', '**Find the exact average.** Convert to a Double before dividing.', '**Find the whole part.** Use `toInt()`.', '**Find the fraction.** Subtract the whole part.', '**Print three lines.** Use string templates.'],
    e: ['**Add the scores.**', '**Find the exact average.**', '**Find the whole part.**', '**Find the fraction.**', '**Print the three values.**'],
  },
  'badge-builder': {
    summary: 'Join two names with a space, wrap them in brackets and report the character count.',
    goal: 'Build a name badge. Join the first and last name, count its characters, and print the name in square brackets followed by its length.',
    steps: [
      '**Join the names.** Create `val fullName`: `first`, a single space, and `last`. Join them with `+`.',
      '**Count the characters.** Create `val nameLength`: the `.length` of `fullName`. The space counts too.',
      '**Add the brackets.** Create `val badge`: `fullName` wrapped in `[` and `]`. Use `+`.',
      '**Print the sentence.** Join `badge`, the text " has ", `nameLength` and the text " characters" with `+`:\n"[Ada Lovelace] has 12 characters"',
    ],
    i: ['**Join the names.** Use `+`.', '**Count the characters.** Use `.length`.', '**Add the brackets.** Use `+`.', '**Print the sentence.** Join the pieces with `+`.'],
    e: ['**Join the names.**', '**Count the characters.**', '**Add the brackets.**', '**Print the sentence.**'],
  },
  'shipping-label': {
    summary: 'Measure two strings (one possibly empty) and print a multi-line raw-string label.',
    goal: 'A shipping label needs the item, the length of the customer note, and the total characters. This order has no note. Measure both texts, add them up, and print a three-line label.',
    steps: [
      '**Count the item characters.** Create `val itemChars`: the `.length` of `item`.',
      '**Count the note characters.** Create `val noteChars`: the `.length` of `note`. An empty String has length 0.',
      '**Add the counts.** Create `val totalChars`: `itemChars` plus `noteChars`.',
      '**Build the label.** Create `val label` as a triple-quoted raw String over three lines, using string templates. End it with `.trimIndent()` to remove the code indentation.',
      '**Print the label.** The output is three lines:\n"Item: Notebook"\n"Note length: 0"\n"Total: 8"',
    ],
    i: ['**Count the item characters.** Use `.length`.', '**Count the note characters.** Use `.length`.', '**Add the counts.**', '**Build the label.** Use a raw String with `.trimIndent()`.', '**Print the label.**'],
    e: ['**Count the item characters.**', '**Count the note characters.**', '**Add the counts.**', '**Build the label.**', '**Print the label.**'],
  },
  'tea-receipt': {
    summary: 'Print receipt lines with a literal dollar sign and an expression inside a template.',
    goal: 'A customer buys 6 cups of tea at 4 each, with a discount of 3. Find the total, then print a two-line receipt: the price, and the price after the discount. Both show a dollar sign.',
    steps: [
      '**Find the total.** Create `val total`: `unitPrice` times `quantity`.',
      '**Print the first line.** Use string templates. Write `\\$` to print a literal dollar sign before the amount:\n"Tea x6 = $24"',
      '**Print the discounted line.** Use one `${ }` expression that subtracts `discount` from `total`, with no extra `val`. Print a literal dollar sign again:\n"Discounted: $21"',
    ],
    i: ['**Find the total.**', '**Print the first line.** Use `\\$` for the dollar sign.', '**Print the discounted line.** Use one `${ }` expression.'],
    e: ['**Find the total.**', '**Print the first line.**', '**Print the discounted line.**'],
  },
  'invoice-block': {
    summary: 'Build a three-line invoice with a truncated tax, a property call in a template and literal dollar signs.',
    goal: 'Mina buys 4 items at 17 each. Find the subtotal and a tax of one tenth of it, using whole numbers. Then print a three-line invoice with the customer, the subtotal and tax, and the total.',
    steps: [
      '**Find the subtotal.** Create `val subtotal`: `items` times `price`.',
      '**Find the tax.** Create `val tax`: `subtotal` divided by `10`. Int division drops the fraction.',
      '**Find the total.** Create `val total`: `subtotal` plus `tax`.',
      '**Print three lines.** Use string templates and `\\$` before each amount. Show the length of `customer` with `${customer.length}`, since a property needs curly braces:\n"Customer: Mina (4 letters)"\n"Subtotal: $68 | Tax: $6"\n"Total: $74 for 4 items"',
    ],
    i: ['**Find the subtotal.**', '**Find the tax.** Use Int division.', '**Find the total.**', '**Print three lines.** Use string templates, `\\$` and `${ }`.'],
    e: ['**Find the subtotal.**', '**Find the tax.**', '**Find the total.**', '**Print the invoice.**'],
  },
  'launch-countdown': {
    summary: 'Mix print() and println() with a computed value and a blank line, leaving a debug line commented out.',
    goal: 'Print a rocket launch countdown where some lines share a row and others stand alone. The layout is two two-part lines, a blank line, then the final message.',
    setup: 'The commented-out `// println("DEBUG: ...")` line must stay switched off.',
    steps: [
      '**Print the first line in two parts.** Use `print()` for the text "T-minus " with no line break, then `println()` for `start`.',
      '**Find the next number.** Create `val remaining`: `start` minus `1`.',
      '**Print the second line in two parts.** Use `print()` for the text "Next: ", then `println()` for `remaining`.',
      '**Print an empty line.** Use `println()` with no arguments.',
      '**Print the final message.** Use `println()` for "Liftoff!".\nThe output is:\n"T-minus 7"\n"Next: 6"\n(an empty line)\n"Liftoff!"',
    ],
    i: ['**Print the first line in two parts.** Use `print()` then `println()`.', '**Find the next number.** Subtract `1`.', '**Print the second line in two parts.** Use `print()` then `println()`.', '**Print an empty line.**', '**Print the final message.**'],
    e: ['**Print the first line in two parts.**', '**Find the next number.**', '**Print the second line in two parts.**', '**Print an empty line.**', '**Print the final message.**'],
  },
  'arcade-session': {
    summary: 'Update a score and lives in order, printing a snapshot before and after a later change.',
    goal: 'A player has 40 points and 3 lives. They pick up a 15-point bonus and lose one life. Update the game state and print a snapshot. Then double the score and print the new score.',
    steps: [
      '**Add the bonus.** Add `bonus` to `score` with `+=`.',
      '**Lose a life.** Set `lives` to `lives` minus `1`.',
      '**Print the snapshot.** Use string templates:\n"Score: 55 | Lives: 2"',
      '**Double the score.** Set `score` to `score` times `2`.',
      '**Print the new score.** Use a string template:\n"Score after double: 110"',
    ],
    i: ['**Add the bonus.** Use `+=`.', '**Lose a life.** Reassign `lives`.', '**Print the snapshot.** Use string templates.', '**Double the score.** Reassign `score`.', '**Print the new score.** Use a string template.'],
    e: ['**Add the bonus.**', '**Lose a life.**', '**Print the snapshot.**', '**Double the score.**', '**Print the new score.**'],
  },
  'bank-ledger': {
    summary: 'Snapshot a starting balance in a val, apply three changes to a var, then report the net change.',
    goal: 'An account opens with 500, then gets a deposit, a withdrawal and a service fee. Apply the three changes in order, then print the opening balance, the closing balance and the net change.',
    steps: [
      '**Save the opening balance.** Create `val opening`: the value of `balance` before any change.',
      '**Apply the deposit.** Add `250` to `balance`.',
      '**Apply the withdrawal.** Subtract `120` from `balance`.',
      '**Apply the service fee.** Subtract `15` from `balance`.',
      '**Find the net change.** Create `val net`: `balance` minus `opening`.',
      '**Print three lines.** Use string templates:\n"Opening: 500"\n"Closing: 615"\n"Net change: 115"',
    ],
    i: ['**Save the opening balance.** Copy it into a `val`.', '**Apply the deposit.**', '**Apply the withdrawal.**', '**Apply the service fee.**', '**Find the net change.** Compare with `opening`.', '**Print three lines.** Use string templates.'],
    e: ['**Save the opening balance.**', '**Apply the deposit.**', '**Apply the withdrawal.**', '**Apply the service fee.**', '**Find the net change.**', '**Print three lines.**'],
  },
  'sensor-panel': {
    summary: 'Mix explicit and inferred types across Int, String, Double, Boolean and Char in one report.',
    goal: 'A weather station panel stores a sensor id, name, reading, status and zone. Build the doubled reading, the next id and a tag name. Let Kotlin infer the types, except one that you write. Print a one-line status report.',
    steps: [
      '**Double the reading.** Create `val doubled`: `reading` times `2`. Write no type, Kotlin infers a Double.',
      '**Find the next id.** Create `val nextId`: `id` plus `1`. Write its type `Int` explicitly.',
      '**Build the tag.** Create `val tag`: `label`, the text "-" and `nextId`, joined with `+`. Write no type, Kotlin infers a String.',
      '**Print the report.** Use string templates:\n"Sensor North-8 (zone B) reads 43.0, online: true"',
    ],
    i: ['**Double the reading.** Let Kotlin infer the type.', '**Find the next id.** Write the type `Int`.', '**Build the tag.** Join with `+`.', '**Print the report.** Use string templates.'],
    e: ['**Double the reading.**', '**Find the next id.**', '**Build the tag.**', '**Print the report.**'],
  },
  'access-gate': {
    summary: 'Derive three Booleans from comparisons and a negation, then report all of them.',
    goal: 'A visitor aged 17 arrives at a gate with a minimum age of 18. Decide if they are old enough, too young, or exactly the minimum age. Print the three results and the ticket status on one line.',
    steps: [
      '**Check the age.** Create `val oldEnough`: whether `age` is greater than or equal to `minAge`. Use `>=`.',
      '**Check if too young.** Create `val tooYoung`: the opposite of `oldEnough`. Use `!`.',
      '**Check for the exact age.** Create `val exactlyMin`: whether `age` equals `minAge`. Use `==`.',
      '**Print the report.** Use string templates:\n"oldEnough=false | tooYoung=true | exactlyMin=false | ticket=true"',
    ],
    i: ['**Check the age.** Use `>=`.', '**Check if too young.** Use `!`.', '**Check for the exact age.** Use `==`.', '**Print the report.** Use string templates.'],
    e: ['**Check the age.**', '**Check if too young.**', '**Check for the exact age.**', '**Print the report.**'],
  },
  'log-entry': {
    summary: 'Join a String with Char values, including a backslash and a newline escape, into a two-line log entry.',
    goal: 'Build a log entry from a file path and a header line. Print the header and the path on two separate lines with one `println()`.',
    steps: [
      '**Build the path.** Create `val path`: `folder`, `backslash` and the text "app.log", joined with `+`.',
      '**Build the header.** Create `val header`: the text "Code " and `code`, joined with `+`.',
      '**Print both lines.** Use one `println()` that joins `header`, `newline` and `path` with `+`:\n"Code E"\n"logs\\app.log"',
    ],
    i: ['**Build the path.** Join with `+`.', '**Build the header.** Join with `+`.', '**Print both lines.** Use one `println()` and `newline`.'],
    e: ['**Build the path.**', '**Build the header.**', '**Print both lines.**'],
  },
  'ticket-desk': {
    summary: 'Parse two text counts into Ints, then total the visitors and the ticket revenue.',
    goal: 'A ticket desk got its visitor counts as text. Convert them to numbers, find the total visitors and the money from adult and child tickets, and print a one-line summary.',
    steps: [
      '**Convert the adults.** Create `val adults`: `rawAdults` converted with `toInt()`.',
      '**Convert the children.** Create `val children`: `rawChildren` converted with `toInt()`.',
      '**Count the visitors.** Create `val visitors`: `adults` plus `children`.',
      '**Find the revenue.** Create `val revenue`: `adults * adultPrice + children * childPrice`.',
      '**Print the summary.** Use string templates:\n"Visitors: 42 | Revenue: 448"',
    ],
    i: ['**Convert the adults.** Use `toInt()`.', '**Convert the children.** Use `toInt()`.', '**Count the visitors.**', '**Find the revenue.** Multiply each count by its price.', '**Print the summary.** Use string templates.'],
    e: ['**Convert the adults.**', '**Convert the children.**', '**Count the visitors.**', '**Find the revenue.**', '**Print the summary.**'],
  },
  'parcel-weight': {
    summary: 'Add Float weights, convert an Int item count to a Float, and report all three values.',
    goal: 'A parcel weighs 68.5 with 1.25 of wrapping and holds 3 items that count as 1 each. Find the packed weight and the total weight with the items, and print a report.',
    steps: [
      '**Find the packed weight.** Create `val packed`: `parcel` plus `wrap`.',
      '**Convert the item count.** Create `val itemWeight`: `items` converted to a Float with `toFloat()`.',
      '**Find the total weight.** Create `val combined`: `packed` plus `itemWeight`.',
      '**Print the report.** Use string templates:\n"Parcel: 69.75 | Items: 3.0 | Total: 72.75"',
    ],
    i: ['**Find the packed weight.**', '**Convert the item count.** Use `toFloat()`.', '**Find the total weight.**', '**Print the report.** Use string templates.'],
    e: ['**Find the packed weight.**', '**Convert the item count.**', '**Find the total weight.**', '**Print the report.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'quiz-percent': {
    subtitle: 'The program should print "Score: 70%" for 17 correct answers out of 24, but it prints "Score: 0%".',
    hints: ['The score is far too low. Look at the first division, before anything is multiplied.', '`correct` and `total` are both Ints. What whole number is `17 / 24`?', 'Change the order of the operations so the division has a bigger number to work with.'],
    explanation: 'Int division drops the fraction. `17 / 24` is about 0.7, which becomes 0, and `0 * 100` is still 0. Scaling first gives `17 * 100 = 1700`, and `1700 / 24` truncates to 70, the correct whole-number percent. When you need a percentage from Ints, multiply before you divide.',
  },
  'pass-rate': {
    subtitle: 'The program should print "Pass rate: 0.625" and "Percent: 62.5" for 5 passed checks out of 8, but both lines print 0.',
    hints: ['Both lines show 0. Something throws the fraction away before it is used.', '`passed` and `attempts` are both Ints, so the first division is an Int division. Which later value depends on it?', 'Make the division a decimal division, so it keeps its fractional part.'],
    explanation: 'An Int divided by an Int is always an Int, so `5 / 8` became 0 and every later step (`0 * 100`) stayed 0. Calling `toDouble()` on one operand first makes it a Double division, giving 0.625 and then 62.5.',
  },
  'basket-total': {
    subtitle: 'The program should print "Subtotal: 59.25" and "Total: 63.75", but both numbers are too low.',
    hints: ['Both lines are wrong, but only one calculation is really broken. Find the first value that is off.', 'Look at how `subtotal` is calculated. What happens to `price` before it is multiplied?', 'A conversion removes the cents before the multiplication. Multiply the original Double instead.'],
    explanation: '`price.toInt()` turns 19.75 into 19 before it is multiplied, so the subtotal became 57 instead of 59.25, and `total` inherited the error. The fault is in the first line that uses `toInt()`, not in the total. Convert to Int at the very end, or not at all, to keep the cents.',
  },
  'tag-width': {
    subtitle: 'The program should print "Tag width: 8" (the name length plus 2), but it prints "Tag width: 62".',
    hints: ['The output has "6" and "2" side by side, not their total. What is `+` doing here?', 'Kotlin evaluates `+` from left to right. Once one side is text, what does `+` do with the next value?', 'Make the numbers add first, then join the result to the text.'],
    explanation: 'Evaluated left to right, `"Tag width: " + name.length` makes a String, and adding 2 to a String appends the character "2" instead of doing arithmetic. Parentheses make `name.length + 2` add as numbers first (8), and that result is then joined to the text.',
  },
  'order-slip': {
    subtitle: 'The program should print "Item: Notebook" and "Qty: 3" on two lines, but the slip has a blank line above it and indented text.',
    hints: ['The two values are right, but the layout is not. Look at the output above and beside the text.', 'A triple-quoted raw string keeps every character between the quotes, including the line break after the opening quotes and the leading spaces.', 'Use a String function that removes the common indentation and the blank first and last lines.'],
    explanation: 'A raw string keeps everything literally: the newline after `"""`, the spaces that indent the code, and the final newline before the closing `"""`. `trimIndent()` strips the common indentation and the blank first and last lines, leaving exactly "Item: Notebook" and "Qty: 3".',
  },
  'city-length': {
    subtitle: 'The program should print "City: Osaka has 5 letters", but it prints "City: Osaka has Osaka.length letters".',
    hints: ['The sentence has the city name twice and no number. Look at how the second value is written in the template.', 'A bare `$city` inserts only the variable. What happens to the text after it, such as `.length`?', 'Use the template form that can hold a whole expression, not just a name.'],
    explanation: 'In a string template, `$city` inserts only the variable, and the following `.length` is ordinary text, so it printed "Osaka.length". Anything more than a plain variable name, such as a property, must be wrapped in braces: `${city.length}`.',
  },
  'welcome-banner': {
    subtitle: 'The program should print "Welcome, Rin" and then "Ready." on the next line, but it prints "Welcome, RinReady.".',
    hints: ['All the words are there, but on one line. What decides where a new line starts?', '`print()` leaves the cursor where it is, and only `println()` ends the line. Which call should end the greeting?', 'End the first line after the name, so "Ready." starts fresh.'],
    explanation: '`print()` never moves to a new line, so "Welcome, ", the name and "Ready." were glued into "Welcome, RinReady.". Ending the greeting with `println(user)` closes that line, so "Ready." begins on the next one.',
  },
  'level-up': {
    subtitle: 'The program should print "Rex reached level 2", but it prints "Rex reached level 1".',
    hints: ['The line that adds 1 runs without any error, yet `level` never changes. What does that line do with its result?', '`level + 1` works out a number, but nothing keeps it. A `var` only changes when something is assigned to it.', 'Store the new value back into the variable.'],
    explanation: '`level + 1` is just an expression that produces 2 and then throws it away, so `level` stayed 1. A `var` changes only through an assignment. `level += 1` (shorthand for `level = level + 1`) stores the new value back into `level`.',
  },
  'price-tag': {
    subtitle: 'The program should print "Tea costs 4.5", but it does not compile.',
    hints: ['The compiler reports a type mismatch on the price line. Compare the declared type with the value.', '`Int` can only hold whole numbers, but 4.5 has a fractional part. Which type holds decimals?', 'Change the declared type so it can hold the value.'],
    explanation: 'An explicit type is a promise about what the variable holds. `Int` holds only whole numbers, so 4.5 does not fit. Declaring `price` as `Double` accepts the decimal value and prints it as 4.5.',
  },
  'free-shipping': {
    subtitle: 'An order of exactly 50 should get free shipping, so the program should print "Free shipping: true", but it prints "Free shipping: false".',
    hints: ['The rule says "50 or more", and the order is exactly 50. What does the comparison do when both values are equal?', 'Is 50 greater than 50? Which comparison also accepts equal values?', 'Change the comparison so an order equal to the threshold qualifies.'],
    explanation: '`total > threshold` is true only when `total` is strictly larger, so 50 against 50 gave false. "50 or more" includes 50 itself, which needs the greater-than-or-equal operator `>=`.',
  },
  'line-break': {
    subtitle: 'The program should print "Total" and "Done" on two lines, but it does not compile.',
    hints: ['The compiler rejects the Char on the first line. A Char can only hold one character or one escape.', 'An escape sequence starts with one specific slash. Check which slash the Char uses.', 'Write the newline escape with the correct slash.'],
    explanation: 'An escape sequence starts with a backslash: `\'\\n\'` is a single newline character. `\'/n\'` has two separate characters (a forward slash and the letter n), so it is not a valid Char literal. With the backslash it is one character, and it breaks the line between the two words.',
  },
  'class-trip': {
    subtitle: 'The program should print "Students: 32" for groups of 17 and 15, but it prints "Students: 1715".',
    hints: ['The total is far too big. Look at the type of the two counts.', '`boysText` and `girlsText` are Strings. What does `+` do between two Strings?', 'Turn the text into numbers before you add them.'],
    explanation: '`+` between two Strings joins them end to end, so "17" + "15" became "1715". Converting each String with `toInt()` first makes the `+` a numeric addition, giving 17 + 15 = 32.',
  },
};
