/**
 * World 9 (Lambda Lab) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world9.spec.ts.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'tax-and-shipping': {
    summary: 'Write two small lambdas, one for tax and one for shipping, and print the two prices.',
    goal: 'A shop adds tax to a price, then adds a shipping fee. Work out the price after tax and the final total. Print both.',
    steps: [
      '**Write the tax lambda.** Create `val withTax` as a lambda with one `Int` parameter, `price`. It returns `price` plus one tenth of `price` (use `price / 10`).',
      '**Write the shipping lambda.** Create `val withShipping` as a lambda with two `Int` parameters, `price` and `kg`. It returns `price` plus `kg * 3`.',
      '**Work out both prices.** Call `withTax(basePrice)` and keep the result in `taxed`. Then call `withShipping(taxed, kilos)` and keep the result in `total`.',
      '**Print two lines.** Join the text with `+`:\n"Taxed: 88"\n"Total: 100"',
    ],
    i: ['**Write the tax lambda.** Add one tenth to `price`.', '**Write the shipping lambda.** Add `kg * 3` to `price`.', '**Work out both prices.** Tax first, then shipping.', '**Print two lines.** Show the taxed price and the total.'],
    e: ['**Write the tax lambda.**', '**Write the shipping lambda.**', '**Work out both prices.**', '**Print two lines.**'],
  },
  'click-counter': {
    summary: 'Write a lambda that changes a variable outside it, call it in a loop, then reset the variable.',
    goal: 'A button counts its clicks. Click it several times and show the count. Then reset the count and show it again.',
    steps: [
      '**Write the click lambda.** Create `val onClick` as a lambda with no parameters. Inside, add `1` to `clicks`. Make the last line `clicks`, so the lambda returns the new count.',
      '**Click the button.** Use a `for` loop from `1` to `limit`. Each time, call `onClick()` and keep the result in `last`.',
      '**Write the reset lambda.** Create `val reset` as a lambda that sets `clicks` to `0`.',
      '**Print two lines.** Show `last` and `clicks`:\n"Last: 3"\n"Clicks: 3"',
      '**Reset and print.** Call `reset()`, then print `clicks`:\n"After reset: 0"',
    ],
    i: ['**Write the click lambda.** Add `1` to `clicks` and return it.', '**Click the button.** Loop `limit` times and keep the last result.', '**Write the reset lambda.** Set `clicks` back to `0`.', '**Print two lines.** Show `last` and `clicks`.', '**Reset and print.** Call `reset()` and print `clicks`.'],
    e: ['**Write the click lambda.**', '**Click the button.**', '**Write the reset lambda.**', '**Print two lines.**', '**Reset and print.**'],
  },
  'grade-label': {
    summary: 'Write an anonymous function that returns Pass or Fail, then test it on three scores.',
    goal: 'Give each score a label: Pass or Fail. Check three scores and print each score with its label.',
    steps: [
      '**Write the anonymous function.** Create `val grade = fun(score: Int): String { ... }`. Inside, use `if` to `return "Pass"` when `score` is at least `passMark`. After the `if`, `return "Fail"`.',
      '**Test three scores.** Call `grade` with `72`, `41` and `50`. Keep the results in `high`, `low` and `edge`.',
      '**Print three lines.** Join each score and its label with `+`:\n"72: Pass"\n"41: Fail"\n"50: Pass"',
    ],
    i: ['**Write the anonymous function.** Use `fun(score: Int): String` and `return`.', '**Test three scores.** Use `72`, `41` and `50`.', '**Print three lines.** Show each score and its label.'],
    e: ['**Write the anonymous function.**', '**Test three scores.**', '**Print three lines.**'],
  },
  'big-numbers': {
    summary: 'Use an anonymous function to keep the numbers above a limit, then count and add them.',
    goal: 'A list has six numbers. Keep only the numbers above a limit. Then count them, add them up and print the results.',
    steps: [
      '**Keep the big numbers.** Call `numbers.filter(...)` and give it an anonymous function: `fun(n: Int): Boolean`. It returns `true` when `n` is bigger than `limit`. Keep the result in `big`.',
      '**Add them up.** Create `var sum = 0`. Loop over `big` and add each `n` to `sum`.',
      '**Print three lines.** Use a string template to show the list. The count is `big.size`:\n"Big: [15, 21, 12]"\n"Count: 3"\n"Sum: 48"',
    ],
    i: ['**Keep the big numbers.** Pass `fun(n: Int): Boolean` to `filter`.', '**Add them up.** Loop over `big` and keep a total.', '**Print three lines.** Show the list, its size and the sum.'],
    e: ['**Keep the big numbers.**', '**Add them up.**', '**Print three lines.**'],
  },
  'time-split': {
    summary: 'Write three lambdas with explicit function types to turn minutes into hours and minutes.',
    goal: 'Turn a number of minutes into hours and minutes. Print the hours, and the time as text.',
    steps: [
      '**Write the hours function.** Create `val toHours: (Int) -> Int` as a lambda that divides `m` by `60`.',
      '**Write the leftover function.** Create `val leftOver: (Int) -> Int` as a lambda that returns `m % 60`.',
      '**Write the label function.** Create `val label: (Int, Int) -> String` as a lambda with `h` and `m`. It joins them as `h.toString() + "h " + m + "m"`.',
      '**Print two lines.** Use `toHours(minutes)` for the hours. Use `label` with the hours and the leftover minutes:\n"Hours: 2"\n"Time: 2h 15m"',
    ],
    i: ['**Write the hours function.** Divide the minutes by `60`.', '**Write the leftover function.** Use `%`.', '**Write the label function.** Join hours and minutes into text.', '**Print two lines.** Show the hours and the label.'],
    e: ['**Write the hours function.**', '**Write the leftover function.**', '**Write the label function.**', '**Print two lines.**'],
  },
  'op-switch': {
    summary: 'Change what a function variable does, and call a function that may be null.',
    goal: 'A calculator can add, then multiply. It may also have an optional bonus step. Print each result, with and without the bonus.',
    steps: [
      '**Add the numbers.** Create `var op: (Int, Int) -> Int` as a lambda that adds `x` and `y`. Call `op(a, b)` and keep the result in `first`.',
      '**Switch to multiply.** Set `op` to a lambda that multiplies `x` and `y`. Call `op(a, b)` again and keep the result in `second`.',
      '**Try the bonus when it is null.** Create `var bonus: ((Int) -> Int)? = null`. Set `plain` to `bonus?.invoke(second) ?: second`.',
      '**Set the bonus.** Set `bonus` to a lambda that adds `10` to `n`. Set `boosted` the same way as `plain`.',
      '**Print four lines.** Use `first`, `second`, `plain` and `boosted`:\n"Add: 17"\n"Multiply: 60"\n"No bonus: 60"\n"With bonus: 70"',
    ],
    i: ['**Add the numbers.** Store an adding lambda in `op` and call it.', '**Switch to multiply.** Give `op` a new lambda and call it again.', '**Try the bonus when it is null.** Use `?.invoke` and `?:`.', '**Set the bonus.** Add `10`, then compute `boosted`.', '**Print four lines.** Show all four results.'],
    e: ['**Add the numbers.**', '**Switch to multiply.**', '**Try the bonus when it is null.**', '**Set the bonus.**', '**Print four lines.**'],
  },
  'apply-twice': {
    summary: 'Write a function that takes a function and calls it twice. Use it with two different lambdas.',
    goal: 'Write a function that runs a step on a number two times in a row. Use it to double a number twice and to add 7 twice.',
    steps: [
      '**Write the function.** Above `main`, write `applyTwice(start: Int, step: (Int) -> Int): Int`. Call `step(start)` and keep the result in `once`. Then return `step(once)`.',
      '**Use it twice.** Call `applyTwice(seed)` with a trailing lambda `{ n -> n * 2 }` and keep the result in `doubled`. Then call it with `{ n -> n + 7 }` and keep the result in `shifted`.',
      '**Print two lines.** Join the text with `+`:\n"Doubled twice: 12"\n"Shifted twice: 17"',
    ],
    i: ['**Write the function.** Take a function parameter and call it two times.', '**Use it twice.** Pass a doubling lambda, then an add-7 lambda.', '**Print two lines.** Show both results.'],
    e: ['**Write the function.**', '**Use it twice.**', '**Print two lines.**'],
  },
  'fee-factory': {
    summary: 'Write a function that builds and returns a fee lambda, then use two fees.',
    goal: 'A bank charges fees as a percent of a payment. Build a fee calculator for each percent. Print the fees for two payments.',
    steps: [
      '**Write the function.** Above `main`, write `makeFee(percent: Int): (Int) -> Int`. It returns a lambda that gives `amount * percent / 100`.',
      '**Make two calculators.** Create `val standard` with `makeFee(2)` and `val premium` with `makeFee(5)`.',
      '**Print three lines.** Call the calculators like functions:\n"Standard on 1500: 30"\n"Premium on 1500: 75"\n"Premium on 240: 12"',
    ],
    i: ['**Write the function.** Return a lambda that uses `percent`.', '**Make two calculators.** Use `2` and `5`.', '**Print three lines.** Use `payment` and `small`.'],
    e: ['**Write the function.**', '**Make two calculators.**', '**Print three lines.**'],
  },
  'repeat-action': {
    summary: 'Write a function that calls a Unit function many times. Use it to build a log and a total.',
    goal: 'Run an action for each round. Keep a log of the round numbers and a total of their squares. Print both.',
    steps: [
      '**Write the function.** Above `main`, write `repeatAction(times: Int, action: (Int) -> Unit)`. Use a `for` loop from `1` to `times`. Each time, call `action(i)`.',
      '**Run the rounds.** Call `repeatAction(rounds)` with a trailing lambda `{ i -> ... }`. Inside, add `i` and a space to `log`. Add `i * i` to `total`.',
      '**Print two lines.** Remove the last space with `log.trim()`:\n"Log: 1 2 3 4"\n"Total: 30"',
    ],
    i: ['**Write the function.** Loop from `1` to `times` and call `action`.', '**Run the rounds.** Build `log` and `total` inside the lambda.', '**Print two lines.** Trim the log.'],
    e: ['**Write the function.**', '**Run the rounds.**', '**Print two lines.**'],
  },
  'price-tags': {
    summary: 'Use it to take one fifth off every price, then keep the cheap prices.',
    goal: 'A shop gives a 20 percent discount on four prices. Print the new prices. Then print only the cheap ones.',
    steps: [
      '**Discount every price.** Call `prices.map { ... }`. Use `it` and subtract `it / 5`. Keep the result in `discounted`.',
      '**Keep the cheap prices.** Call `discounted.filter { ... }`. Keep the prices below `limit`, and use `it` again. Keep the result in `cheap`.',
      '**Print two lines.** Use string templates to show the lists:\n"Discounted: [32, 12, 72, 20]"\n"Cheap: [12, 20]"',
    ],
    i: ['**Discount every price.** Use `map` and `it`.', '**Keep the cheap prices.** Use `filter` and `it`.', '**Print two lines.** Show both lists.'],
    e: ['**Discount every price.**', '**Keep the cheap prices.**', '**Print two lines.**'],
  },
  'row-counts': {
    summary: 'Put a lambda inside a lambda. Name the outer parameter so it does not clash with it.',
    goal: 'Each row number multiplies each column number. For each row, count how many results are bigger than a limit. Print the counts.',
    steps: [
      '**Start the outer loop.** Create `val counts` with `rows.map { row -> ... }`. Naming the parameter `row` keeps `it` free for the inner lambda.',
      '**Filter the columns.** Inside, create `val big` with `columns.filter { ... }`. Keep the columns where `it * row` is bigger than `limit`.',
      '**Return the count.** Make `big.size` the last line of the outer lambda, so the lambda returns it.',
      '**Print one line.** Use a string template to show the list:\n"Counts: [1, 2]"',
    ],
    i: ['**Start the outer loop.** Use `map` and name the parameter `row`.', '**Filter the columns.** Use `it * row` and `limit`.', '**Return the count.** End with the size.', '**Print one line.** Show `counts`.'],
    e: ['**Start the outer loop.**', '**Filter the columns.**', '**Return the count.**', '**Print one line.**'],
  },
  'square-labels': {
    summary: 'Write two small functions and pass them to map with function references.',
    goal: 'Turn a list of numbers into squares. Then turn each square into a label. Print both lists.',
    steps: [
      '**Write the square function.** Above `main`, write `square(n: Int): Int`. It returns `n * n`.',
      '**Write the describe function.** Above `main`, write `describe(n: Int): String`. It returns the text `n=` followed by `n`.',
      '**Square the numbers.** Call `numbers.map(::square)` and keep the result in `squares`.',
      '**Label the squares.** Call `squares.map(::describe)` and keep the result in `labels`.',
      '**Print two lines.** Use string templates to show the lists:\n"Squares: [4, 25, 81]"\n"Labels: [n=4, n=25, n=81]"',
    ],
    i: ['**Write the square function.** Return `n * n`.', '**Write the describe function.** Return text that has `n` in it.', '**Square the numbers.** Pass `::square` to `map`.', '**Label the squares.** Pass `::describe` to `map`.', '**Print two lines.** Show both lists.'],
    e: ['**Write the square function.**', '**Write the describe function.**', '**Square the numbers.**', '**Label the squares.**', '**Print two lines.**'],
  },
  'bound-counter': {
    summary: 'Make a reference tied to one object, and a reference to a member of a type.',
    goal: 'A counter object adds 1 each time it is used. Use the counter and a list of words through function references. Print the counter and the shouted words.',
    setup: 'The class `Counter` is in the starter code. Its function `next()` adds `1` to `value` and returns it.',
    steps: [
      '**Make a bound reference.** Create `val advance` with `counter::next`. This reference works on this one `counter`.',
      '**Shout the words.** Call `words.map(String::uppercase)` and keep the result in `shouted`.',
      '**Move the counter twice.** Call `advance()` two times. You do not need the results.',
      '**Move it a third time.** Call `advance()` again and keep the result in `third`.',
      '**Print three lines.** Use a string template to show `shouted`:\n"Third: 13"\n"Counter: 13"\n"Shouted: [KOTLIN, LAMBDA, IT]"',
    ],
    i: ['**Make a bound reference.** Use `counter::next`.', '**Shout the words.** Use `String::uppercase` with `map`.', '**Move the counter twice.** Call `advance()` two times.', '**Move it a third time.** Keep the result in `third`.', '**Print three lines.** Show `third`, `counter.value` and `shouted`.'],
    e: ['**Make a bound reference.**', '**Shout the words.**', '**Move the counter twice.**', '**Move it a third time.**', '**Print three lines.**'],
  },
  'time-of-day': {
    summary: 'Write one lambda that ends with a when expression and one that returns true or false.',
    goal: 'Name the part of the day for an hour. Also say if a shop is open at that hour. Print the results.',
    steps: [
      '**Write the greeting lambda.** Create `val greeting` as a lambda with `h: Int`. Use a `when` as the last line. Give `Morning` below `12`, `Afternoon` below `18`, and `Evening` for everything else.',
      '**Write the open lambda.** Create `val isOpen` as a lambda with `h: Int`. It returns `true` when `h` is at least `9` and below `17`.',
      '**Print three lines.** Use `greeting(hour)`, `greeting(hour + 6)` and `isOpen(hour)`:\n"Now: Afternoon"\n"Later: Evening"\n"Open: true"',
    ],
    i: ['**Write the greeting lambda.** End with a `when` that picks the part of the day.', '**Write the open lambda.** Return a Boolean for the hours `9` to `16`.', '**Print three lines.** Show now, six hours later, and open.'],
    e: ['**Write the greeting lambda.**', '**Write the open lambda.**', '**Print three lines.**'],
  },
  'capped-bonus': {
    summary: 'Write a lambda with several lines that ends with an if expression, and a lambda that prints.',
    goal: 'Add a streak bonus to each base score, but never go above a cap. Print a line for each player.',
    steps: [
      '**Write the score lambda.** Create `val bonusScore` as a lambda with `base: Int` and `streak: Int`. Create `bonus` as `streak * 5`, then `total` as `base + bonus`. Make the last line `if (total > cap) cap else total`.',
      '**Write the report lambda.** Create `val report` as a lambda with `name: String` and `score: Int`. Print `name`, then `: `, then `score`.',
      '**Report Ana.** Call `report` with `"Ana"` and the score for base `60` and streak `2`.',
      '**Report Bo.** Call `report` with `"Bo"` and the score for base `90` and streak `4`. The two lines are:\n"Ana: 70"\n"Bo: 100"',
    ],
    i: ['**Write the score lambda.** Add the bonus, and cap the total with `if`.', '**Write the report lambda.** Print the name and the score.', '**Report Ana.** Base `60`, streak `2`.', '**Report Bo.** Base `90`, streak `4`.'],
    e: ['**Write the score lambda.**', '**Write the report lambda.**', '**Report Ana.**', '**Report Bo.**'],
  },
  'skip-zeros': {
    summary: 'Skip some items inside forEach with a labelled return, and add up the rest.',
    goal: 'A list of readings has some zero values. Skip the zeros, count them, and add up the other readings. Print both.',
    steps: [
      '**Start the loop.** Call `readings.forEach { ... }`. Use `it` for each reading.',
      '**Count the skipped ones.** Inside the loop, check `it == ignored`. When it is true, add `1` to `skipped`.',
      '**Skip the rest of the round.** In the same `if`, write `return@forEach`. This leaves only the current round.',
      '**Add the other readings.** After the `if`, add `it` to `sum`.',
      '**Print two lines.** Join the text with `+`:\n"Sum: 39"\n"Skipped: 2"',
    ],
    i: ['**Start the loop.** Use `forEach` and `it`.', '**Count the skipped ones.** Check `it == ignored`.', '**Skip the rest of the round.** Use `return@forEach`.', '**Add the other readings.** Add `it` to `sum`.', '**Print two lines.** Show `sum` and `skipped`.'],
    e: ['**Start the loop.**', '**Count the skipped ones.**', '**Skip the rest of the round.**', '**Add the other readings.**', '**Print two lines.**'],
  },
  'first-below': {
    summary: 'Search a list inside forEach and return from the whole function as soon as you find a match.',
    goal: 'Write a function that finds the position of the first value below a limit. Return -1 when there is none. Test it on two lists.',
    setup: 'The function header `firstBelow(values, threshold)` and the two lists are in the starter code.',
    steps: [
      '**Start the position.** Create `var index = 0`. It counts the values you have passed.',
      '**Loop over the values.** Call `values.forEach { ... }` and use `it` for each value.',
      '**Stop at the first match.** Inside the loop, when `it` is below `threshold`, write `return index`. This leaves the whole function.',
      '**Move to the next value.** After the `if`, add `1` to `index`.',
      '**Return -1.** After the loop, return `-1`. It means that no value was below `threshold`.',
      '**Print two lines.** In `main`, call `firstBelow` with `listA`, then with `listB`:\n"Index in A: 2"\n"Index in B: -1"',
    ],
    i: ['**Start the position.** Create a counter for the index.', '**Loop over the values.** Use `forEach` and `it`.', '**Stop at the first match.** Return `index` from the function.', '**Move to the next value.** Add `1` to `index`.', '**Return -1.** Use it when nothing matched.', '**Print two lines.** Test both lists.'],
    e: ['**Start the position.**', '**Loop over the values.**', '**Stop at the first match.**', '**Move to the next value.**', '**Return -1.**', '**Print two lines.**'],
  },
  'order-checks': {
    summary: 'Write an inline function and use return inside its lambdas to leave the whole function early.',
    goal: 'Check an order amount. Reject a negative amount, send a large amount for review, and accept the rest. Print the result for three amounts.',
    setup: 'The function header `process(amount: Int)` and `val large = 2500` are in the starter code.',
    steps: [
      '**Write the inline function.** Above `process`, write `inline fun runIf(condition: Boolean, action: () -> Unit)`. When `condition` is `true`, call `action()`.',
      '**Reject negative amounts.** In `process`, call `runIf(amount < 0)` with a trailing lambda. Inside it, return the text `Invalid`.',
      '**Send large amounts for review.** Call `runIf(amount > 1000)` with a trailing lambda. Inside it, return the text `Review`.',
      '**Accept the rest.** At the end of `process`, return the text `Accepted`.',
      '**Print three lines.** Call `process` with `-5`, with `large`, and with `300`:\n"Invalid"\n"Review"\n"Accepted"',
    ],
    i: ['**Write the inline function.** Call `action` only when `condition` is `true`.', '**Reject negative amounts.** Return from inside the lambda.', '**Send large amounts for review.** Check for more than `1000`.', '**Accept the rest.** Return the default result.', '**Print three lines.** Use `-5`, `large` and `300`.'],
    e: ['**Write the inline function.**', '**Reject negative amounts.**', '**Send large amounts for review.**', '**Accept the rest.**', '**Print three lines.**'],
  },
  'counted-steps': {
    summary: 'Write an inline function that counts its calls and returns the result of a lambda.',
    goal: 'Run three steps one after another. Each step uses the result of the one before. Count how many steps ran and print the final result.',
    setup: 'The top-level `var calls = 0` is shared by every function.',
    steps: [
      '**Write the inline function.** Above `main`, write `inline fun counted(action: () -> Int): Int`. Add `1` to `calls`, then return `action()`.',
      '**Double the base.** Create `val a` with `counted { ... }`. Inside, return `base * 2`.',
      '**Add the base.** Create `val b` with `counted { ... }`. Inside, return `a + base`.',
      '**Take one away.** Create `val c` with `counted { ... }`. Inside, return `b - 1`.',
      '**Print two lines.** Join the text with `+`:\n"Result: 17"\n"Calls: 3"',
    ],
    i: ['**Write the inline function.** Count the call, then return what `action()` gives.', '**Double the base.** Use `counted` with `base * 2`.', '**Add the base.** Use `counted` with `a + base`.', '**Take one away.** Use `counted` with `b - 1`.', '**Print two lines.** Show `c` and `calls`.'],
    e: ['**Write the inline function.**', '**Double the base.**', '**Add the base.**', '**Take one away.**', '**Print two lines.**'],
  },
  'swap-handler': {
    summary: 'Write an inline function that stores a lambda in a variable, then swap the handler twice.',
    goal: 'A program keeps one handler in a variable. Run the handler, replace it twice, and run it again each time.',
    setup: 'The top-level `var handler` is in the starter code. It starts as a lambda that returns the word idle and the number.',
    steps: [
      '**Write the inline function.** Above `main`, write `inline fun install(noinline next: (Int) -> String)`. Set `handler` to `next`. The `noinline` keyword lets you store the lambda.',
      '**Run the first handler.** Print `handler(code)`:\n"idle 7"',
      '**Install the ready handler.** Call `install` with a lambda `{ n -> ... }` that returns the text `ready ` followed by `n * 2`. Then print `handler(code)`:\n"ready 14"',
      '**Install the done handler.** Call `install` with a lambda that returns the text `done ` followed by `n + 1`. Put `n + 1` in brackets. Then print `handler(code)`:\n"done 8"',
    ],
    i: ['**Write the inline function.** Store `next` in `handler`. Mark it `noinline`.', '**Run the first handler.** Print `handler(code)`.', '**Install the ready handler.** Double `n`, install it, and print.', '**Install the done handler.** Add `1` to `n` (use brackets), install it, and print.'],
    e: ['**Write the inline function.**', '**Run the first handler.**', '**Install the ready handler.**', '**Install the done handler.**'],
  },
  'retry-callback': {
    summary: 'Write an inline function with one normal callback and one noinline callback that it hands back.',
    goal: 'A function runs a start action right away and gives back a finish action for later. Check the order of the events.',
    steps: [
      '**Write the inline function.** Above `main`, write `inline fun register(onStart: () -> Unit, noinline onDone: () -> String): () -> String`. Call `onStart()`, then return `onDone`.',
      '**Register the callbacks.** Create `val finish` with `register(...)`. For `onStart`, pass a lambda that adds `start;` to `log`. For `onDone`, pass a lambda that returns the text `Retries: ` followed by `retries`.',
      '**Log the next event.** Add `registered;` to `log`.',
      '**Print the log.** The start action has already run:\n"start;registered;"',
      '**Run the finish action.** Print `finish()`:\n"Retries: 3"',
    ],
    i: ['**Write the inline function.** Run `onStart` now. Return `onDone`.', '**Register the callbacks.** Pass one lambda that edits `log` and one that returns the retries text.', '**Log the next event.** Add `registered;` to `log`.', '**Print the log.** Show `log`.', '**Run the finish action.** Print `finish()`.'],
    e: ['**Write the inline function.**', '**Register the callbacks.**', '**Log the next event.**', '**Print the log.**', '**Run the finish action.**'],
  },
  'late-label': {
    summary: 'Write an inline function that calls a crossinline lambda inside another lambda, and see when it runs.',
    goal: 'Make labels that are built later. Change a value before a label is read, and see that the label shows the new value.',
    steps: [
      '**Write the inline function.** Above `main`, write `inline fun labelled(tag: String, crossinline action: () -> String): () -> String`. Create `val wrapper` as a lambda that joins `[`, `tag`, `] ` and `action()` with `+`. Return `wrapper`.',
      '**Make the receipt label.** Create `val receipt` with `labelled("ORDER")` and a trailing lambda that returns the text `id=` followed by `orderId`.',
      '**Change the order id.** Set `orderId` to `orderId + 1`. The receipt label has not run yet.',
      '**Make the note label.** Create `val note` with `labelled("NOTE")` and a trailing lambda that returns the text `paid`.',
      '**Print two lines.** Call both labels like functions:\n"[ORDER] id=43"\n"[NOTE] paid"',
    ],
    i: ['**Write the inline function.** Wrap `action()` in a lambda and return it. Use `crossinline`.', '**Make the receipt label.** Use the order id.', '**Change the order id.** Add `1`.', '**Make the note label.** Return the text `paid`.', '**Print two lines.** Call both labels.'],
    e: ['**Write the inline function.**', '**Make the receipt label.**', '**Change the order id.**', '**Make the note label.**', '**Print two lines.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'stale-fee': {
    subtitle: 'The program should print "Fee: 16" after the rate changes to 8, but it prints "Fee: 10".',
    hints: [
      'Look at when `fee` gets its value. Is it before or after `rate` changes?',
      'A plain value is worked out once, at the line where it is declared. Later changes to `rate` do not update it.',
      'Store the calculation itself in `fee`, as a lambda, and run it when you print.',
    ],
    explanation: 'The broken code writes `val fee = rate * 2`. Kotlin works this out right away, so `fee` stays `10` even after `rate` becomes `8`. The fix stores a lambda, `{ rate * 2 }`, and calls `fee()` when printing. The lambda reads `rate` each time it runs, so it sees `8` and prints `16`.',
  },
  'missing-argument': {
    subtitle: 'The program should print "Sum: 8", but it does not compile.',
    hints: [
      'Find the line that calls `add`. Count the values it passes.',
      'The lambda has two parameters, `a` and `b`. A call must give a value for each one.',
      'Give the call a second value. Choose one that makes the sum 8.',
    ],
    explanation: 'The lambda `add` has two parameters, `a` and `b`. The call `add(5)` passes only one value, so Kotlin reports that `b` has no value. Calling `add(5, 3)` gives both, and the result is `8`.',
  },
  'return-in-lambda': {
    subtitle: 'The program should print "negative" and then "not negative", but it does not compile.',
    hints: [
      'Look at the `return` inside the braces after `sign =`.',
      'A plain `return` is not allowed in a lambda. It would try to leave the function around the lambda.',
      'Switch to an anonymous function, which is allowed to use `return`. Give it its parameter and its return type.',
    ],
    explanation: 'A lambda cannot use a plain `return`. An anonymous function can, and `return` leaves only that function. The fix changes `{ n: Int -> ... }` into `fun(n: Int): String { ... }` and ends with `return "not negative"`. Now both calls give a `String`.',
  },
  'wrong-arity-type': {
    subtitle: 'The program should print "Total: 10", but it does not compile.',
    hints: [
      'Compare the function type on the left with the lambda on the right.',
      'The type `(Int) -> Int` has one parameter, but the lambda has two, `a` and `b`.',
      'Change the type so it lists one parameter for each name in the lambda.',
    ],
    explanation: 'The type before `=` says the function takes one `Int`. The lambda takes two, so the types do not match. The fix is `(Int, Int) -> Int`, which also matches the call `combine(4, 6)` and gives `10`.',
  },
  'restarting-steps': {
    subtitle: 'The program should print "Result: 54", but it prints "Result: 6".',
    hints: [
      'Trace the loop by hand. What value does `step` get in each round?',
      'Every round calls `step(start)`, so it always begins again from the first value and the earlier results are lost.',
      'Give each round the result of the round before it, using the running value.',
    ],
    explanation: 'The loop calls `step(start)` in every round, so `current` is `6` each time and the loop only repeats the same answer. The fix is `current = step(current)`. Now the rounds give `6`, then `18`, then `54`.',
  },
  'it-with-name': {
    subtitle: 'The program should print "Doubled: [40, 70, 100]", but it does not compile.',
    hints: [
      'Look at the lambda after `map`. What name does it give the parameter?',
      'When you write `price ->`, Kotlin does not create `it`. So `it` is unknown.',
      'Use one name for the value inside the lambda. Either use your own name everywhere, or remove the name and use `it`.',
    ],
    explanation: 'The lambda names its parameter `price`, so `it` does not exist and `it * 2` cannot compile. You can use the name, `{ price -> price * 2 }`, or drop the name and write `{ it * 2 }`. Both double every price.',
  },
  'reference-arity': {
    subtitle: 'The program should print "#1/3" and "#2/3", but it does not compile.',
    hints: [
      'Compare the type of `format` with the parameters of `label`.',
      'The type `(Int) -> String` takes one value, but `label` needs two, `n` and `width`. So `::label` does not fit.',
      'Use a lambda instead of the reference. Call `label` inside it and give the second value yourself.',
    ],
    explanation: 'The type `(Int) -> String` says `format` takes one number, but `label` needs two arguments, so `::label` has the wrong shape. A lambda can fill in the missing one: `{ label(it, 3) }`. Each number is passed as `it`, and `3` is the width.',
  },
  'no-final-value': {
    subtitle: 'The program should print "Computed 24" and "Area: 24", but it does not compile.',
    hints: [
      'Look at the last line inside the braces of `area`, and at the type on the left.',
      'The last line of a lambda is its result. `println` gives back `Unit`, but the type says `Int`.',
      'Make the last line of the lambda the value you want it to return.',
    ],
    explanation: 'A lambda returns the value of its last line. Here the last line is `println(...)`, which gives back `Unit`, but the type says `Int`. The fix adds `result` as the last line, after the `println`. Now the lambda returns `24`.',
  },
  'stops-too-late': {
    subtitle: 'The program should print "Sum: 13", the sum before the first negative number, but it prints "Sum: 17".',
    hints: [
      'Trace the list `5, 8, -1, 4`. Which numbers are added to `sum`?',
      '`return@forEach` ends only the current round, so the loop goes on and adds `4`.',
      'Use a return that leaves the whole function, and make it give back the sum so far.',
    ],
    explanation: '`return@forEach` skips only the current item, so `-1` is skipped but `4` is still added. That gives `5 + 8 + 4 = 17`. Inside an inline lambda such as the one for `forEach`, a plain `return` leaves the whole function. Writing `return sum` stops at `-1` and returns `13`.',
  },
  'early-exit-main': {
    subtitle: 'The program should print four lines, ending with "End export" and "Done", but it stops after "working".',
    hints: [
      'Look at which lines are missing from the output.',
      'The lambda is inlined, so a plain `return` inside it leaves `main`. The rest of `task` and the last `println` never run.',
      'Say which function the `return` should leave. Use the label of the function that the lambda is given to.',
    ],
    explanation: '`task` is inline, so a plain `return` in its lambda leaves `main`, and `End export` and `Done` are never printed. With `return@task`, only the lambda ends. Then `task` goes on to print `End export`, and `main` prints `Done`.',
  },
  'unsaved-callback': {
    subtitle: 'The program should print "Saved action ran", but it does not compile.',
    hints: [
      'Look at the function `remember` and the line that stores `action`.',
      'An inline function copies the lambda into the code that calls it, so the parameter is not a real object that can be stored in a variable.',
      'Mark the parameter so that it is kept as a real function value.',
    ],
    explanation: 'In an inline function, the lambda is copied into the code that calls it, so `action` is not a real object. Storing it in `saved` is not allowed. Marking the parameter `noinline` keeps it as a real function value, so the program compiles and `saved()` prints the line.',
  },
  'wrapped-call': {
    subtitle: 'The program should print "Run job", but it does not compile.',
    hints: [
      'Find where `action` is called in `later`. Is the call directly in the function body?',
      'The call is inside another lambda. That lambda runs later, so a `return` in the lambda given to `later` could not jump out in time.',
      'Add a modifier to the parameter that forbids such returns, so that Kotlin can inline the call here.',
    ],
    explanation: 'The call `action()` is inside the lambda that `later` returns. That lambda runs later, so a plain `return` in the lambda given to `later` would have nowhere to go. Marking the parameter `crossinline` forbids such returns, and then Kotlin allows the call. The program prints `Run job`.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'stale-fee': 'The fee is worked out once, so it ignores the later rate change.',
  'missing-argument': 'A lambda with two parameters is called with one value.',
  'return-in-lambda': 'A plain return is not allowed inside a lambda.',
  'wrong-arity-type': 'The function type has one parameter but the lambda has two.',
  'restarting-steps': 'Every round starts again from the first value.',
  'it-with-name': 'The parameter has a name, so it does not exist.',
  'reference-arity': 'A function reference does not fit a function that needs two arguments.',
  'no-final-value': 'The lambda ends with println, so it returns Unit instead of an Int.',
  'stops-too-late': 'The label skips one item but the loop does not stop.',
  'early-exit-main': 'A plain return in an inline lambda leaves main.',
  'unsaved-callback': 'An inline parameter cannot be stored without noinline.',
  'wrapped-call': 'An inline parameter is called inside another lambda without crossinline.',
};
