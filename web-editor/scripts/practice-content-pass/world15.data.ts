/**
 * World 15 (Error Fortress) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world15.spec.ts.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'divide-try': {
    summary: 'Wrap a division that fails in try, catch the exception, and let the program go on.',
    goal: 'Divide 10 by a number that may be zero. Catch the problem so the program does not stop, and print a line after it.',
    steps: [
      '**Write the try block.** Write `try { ... }`. Inside, print "start". Create `val x` as `10 / divisor`. Then print "value " plus `x`.',
      '**Write the catch block.** Add `catch (e: ArithmeticException) { ... }`. Inside, print "caught " plus `e.message`.',
      '**Print after.** After the catch block, print "after":\n"start"\n"caught / by zero"\n"after"',
    ],
    i: ['**Write the try block.** Print, divide, print the value.', '**Write the catch block.** Catch `ArithmeticException` and print the message.', '**Print after.** Print "after" after the catch block.'],
    e: ['**Write the try block.**', '**Write the catch block.**', '**Print after.**'],
  },
  'parse-list': {
    summary: 'Put a try and catch inside a loop, add the good numbers, and count the bad ones.',
    goal: 'Go through a list of texts. Add a bonus to each text that is a number, and count the texts that are not numbers.',
    steps: [
      '**Write the try block.** Loop over `texts` with `for (t in texts)`. Inside, write `try { ... }`. Add `t.toInt() + bonus` to `total`.',
      '**Write the catch block.** Add `catch (e: NumberFormatException) { ... }`. Add `1` to `bad`.',
      '**Print the total.** Print "Total: " plus `total`:\n"Total: 32"',
      '**Print the bad count.** Print "Bad: " plus `bad`:\n"Bad: 2"',
    ],
    i: ['**Write the try block.** Add each number plus `bonus`.', '**Write the catch block.** Count the bad texts.', '**Print the total.** Show `total`.', '**Print the bad count.** Show `bad`.'],
    e: ['**Write the try block.**', '**Write the catch block.**', '**Print the total.**', '**Print the bad count.**'],
  },
  'catch-message': {
    summary: 'Catch a NumberFormatException and print the reason Kotlin gives.',
    goal: 'Try to turn a text into a number. When the text is not a number, print the reason from the exception.',
    steps: [
      '**Write the try block.** Write `try { ... }`. Inside, create `val n` as `text.toInt()`. Print "Number: " plus `n`.',
      '**Write the catch block.** Add `catch (e: NumberFormatException) { ... }`.',
      '**Print the reason.** Inside the catch block, print "Not a number: " plus `e.message`:\n"Not a number: For input string: \\"abc\\""',
    ],
    i: ['**Write the try block.** Convert and print the number.', '**Write the catch block.** Catch `NumberFormatException`.', '**Print the reason.** Show `e.message`.'],
    e: ['**Write the try block.**', '**Write the catch block.**', '**Print the reason.**'],
  },
  'age-reader': {
    summary: 'Catch only one exception type in a function, and let another one reach the caller.',
    goal: 'Write a function that reads an age. It handles a bad number itself, but lets a negative age travel to the caller. Catch that in main.',
    steps: [
      '**Write readAge.** Above `main`, write `fun readAge(text: String): Int`. In a `try`, create `val age` as `text.toInt()`. When `age < 0`, throw `IllegalArgumentException("negative age " + age)`. Otherwise return `age`. Add `catch (e: NumberFormatException)` that returns `-1`.',
      '**Call it three times.** In a `try` block, print `readAge("5")`, `readAge("x")` and `readAge(last.toString())`.',
      '**Catch the rest.** Add `catch (e: IllegalArgumentException)`. Print "main caught " plus `e.message`:\n"5"\n"-1"\n"main caught negative age -3"',
    ],
    i: ['**Write readAge.** Return `-1` for a bad number. Throw for a negative age.', '**Call it three times.** Print each result inside a `try`.', '**Catch the rest.** Catch `IllegalArgumentException` in `main`.'],
    e: ['**Write readAge.**', '**Call it three times.**', '**Catch the rest.**'],
  },
  'always-cleanup': {
    summary: 'Use finally so a cleanup line runs after a return and after a failure.',
    goal: 'Write a function that does some work and may fail. A cleanup line must print every time, whether the work works or not.',
    steps: [
      '**Write run.** Above `main`, write `fun run(fail: Boolean): String`. In a `try`, print "work". When `fail` is true, throw `IllegalStateException("broke")`. Otherwise `return "ok"`. Add a `catch (e: IllegalStateException)` that returns "failed".',
      '**Add the cleanup.** Add a `finally { ... }` block. Inside, print "cleanup".',
      '**Call it twice.** Print `run(fail)`, then `run(!fail)`:\n"work"\n"cleanup"\n"ok"\n"work"\n"cleanup"\n"failed"',
    ],
    i: ['**Write run.** Work, then return or throw.', '**Add the cleanup.** Print in `finally`.', '**Call it twice.** Use `fail` and `!fail`.'],
    e: ['**Write run.**', '**Add the cleanup.**', '**Call it twice.**'],
  },
  'finally-log': {
    summary: 'Build a text log with try, catch and finally, and see the order of the three parts.',
    goal: 'Run three steps. One step fails. Write a log that shows what happened in each step, including the cleanup.',
    steps: [
      '**Write step.** Above `main`, write `fun step(n: Int, bad: Int): String`. Create `var log = ""`. In a `try`, add "t", `n` and ";" to `log`. When `n == bad`, throw `RuntimeException("x")`. In `catch (e: RuntimeException)`, add "c", `n` and ";". In `finally`, add "f", `n` and ";". Return `log`.',
      '**Run the steps.** Loop `i` from `1` to `3`. Add `step(i, bad)` to `all`.',
      '**Print the log.** Print "Log: " plus `all`:\n"Log: t1;f1;t2;c2;f2;t3;f3;"',
    ],
    i: ['**Write step.** Log t, then c if it fails, then f.', '**Run the steps.** Collect the logs of 1 to 3.', '**Print the log.** Show `all`.'],
    e: ['**Write step.**', '**Run the steps.**', '**Print the log.**'],
  },
  'check-ages': {
    summary: 'Throw IllegalArgumentException with a clear message when a value is out of range.',
    goal: 'Check a list of ages. Throw an error for an age that is too small or too big. Print a line for each age.',
    steps: [
      '**Write validate.** Above `main`, write `fun validate(age: Int)`. When `age < 0`, throw `IllegalArgumentException("age " + age + " is negative")`. When `age > 120`, throw one with "is too big" in the same way. Otherwise print "valid " plus `age`.',
      '**Loop over the ages.** Loop over `listOf(30, -5, oldest)`. In each round, call `validate(a)` inside a `try`.',
      '**Print the errors.** Add `catch (e: IllegalArgumentException)`. Print "error: " plus `e.message`:\n"valid 30"\n"error: age -5 is negative"\n"error: age 130 is too big"',
    ],
    i: ['**Write validate.** Throw for below `0` and above `120`.', '**Loop over the ages.** Call `validate` in a `try`.', '**Print the errors.** Show `e.message`.'],
    e: ['**Write validate.**', '**Loop over the ages.**', '**Print the errors.**'],
  },
  'wrap-and-throw': {
    summary: 'Catch one exception and throw a new one with a clearer message.',
    goal: 'Write a function that reads an id. When the text is not a number, it throws a new error that names the bad text. Catch that error in main.',
    steps: [
      '**Write parseId.** Above `main`, write `fun parseId(text: String): Int`. In a `try`, return `text.toInt()`. In `catch (e: NumberFormatException)`, throw `IllegalArgumentException("bad id: " + text)`.',
      '**Call it.** In a `try` block in `main`, print `parseId("12")`, then `parseId(id)`.',
      '**Catch the new error.** Add `catch (e: IllegalArgumentException)`. Print `e.message`:\n"12"\n"bad id: x7"',
    ],
    i: ['**Write parseId.** Catch the parse error and throw a clearer one.', '**Call it.** Use `"12"` and `id`.', '**Catch the new error.** Print the message.'],
    e: ['**Write parseId.**', '**Call it.**', '**Catch the new error.**'],
  },
  'two-catches': {
    summary: 'Write two catch blocks for two different exceptions and see which one runs.',
    goal: 'A function can fail in two ways. Handle each way with its own catch block. Call it three times.',
    steps: [
      '**Write the try block.** Above `main`, write `fun run(n: Int)`. In a `try`, throw `IllegalStateException("state")` when `n == 1`. Throw `IllegalArgumentException("arg")` when `n == 2`. Otherwise print "fine " plus `n`.',
      '**Catch the argument error.** Add `catch (e: IllegalArgumentException)`. Print "IAE " plus `e.message`.',
      '**Catch the state error.** Add `catch (e: IllegalStateException)`. Print "ISE " plus `e.message`.',
      '**Call it three times.** Call `run(first)`, `run(first + 1)` and `run(first + 2)`:\n"ISE state"\n"IAE arg"\n"fine 3"',
    ],
    i: ['**Write the try block.** Throw for `1` and `2`.', '**Catch the argument error.** Print "IAE " and the message.', '**Catch the state error.** Print "ISE " and the message.', '**Call it three times.** Start at `first`.'],
    e: ['**Write the try block.**', '**Catch the argument error.**', '**Catch the state error.**', '**Call it three times.**'],
  },
  'catch-order': {
    summary: 'Put the specific catch before the general catch, using your own exception classes.',
    goal: 'A search can fail in two ways. A missing item has its own handling. Any other app error has general handling. Show that the order matters.',
    setup: 'The open class `AppError` is in the starter code.',
    steps: [
      '**Write the error classes.** Above `main`, write `class NotFound(val id: Int)` that extends `AppError("missing " + id)`. Write `class Invalid(val field: String)` that extends `AppError("bad " + field)`.',
      '**Write find.** Write `fun find(id: Int): String`. Throw `Invalid("id")` when `id == 0`. Throw `NotFound(id)` when `id > 3`. Otherwise return "item" plus `id`.',
      '**Loop and try.** Loop over `listOf(1, 0, missing)`. In each round, print `find(i)` inside a `try`.',
      '**Write the catches.** First catch `NotFound` and print "nf " plus `e.id`. Then catch `AppError` and print "app " plus `e.message`:\n"item1"\n"app bad id"\n"nf 5"',
    ],
    i: ['**Write the error classes.** Extend `AppError`.', '**Write find.** Throw by the id.', '**Loop and try.** Print the result of `find`.', '**Write the catches.** The specific one comes first.'],
    e: ['**Write the error classes.**', '**Write find.**', '**Loop and try.**', '**Write the catches.**'],
  },
  'parse-or': {
    summary: 'Use try as an expression that gives a value, with a fallback in catch.',
    goal: 'Write a function that turns a text into a number. When it fails, it gives a fallback value instead. Try it three times.',
    steps: [
      '**Write parse.** Above `main`, write `fun parse(text: String, fallback: Int): Int`. Use `return try { ... } catch (...) { ... }`. The try part is `text.toInt()`. The catch part for `NumberFormatException` is `fallback`.',
      '**Parse a good number.** Print `parse("42", fallback)`:\n"42"',
      '**Parse bad text.** Print `parse("x", fallback)`:\n"5"',
      '**Parse with a bigger fallback.** Print `parse("", fallback + 10)`:\n"15"',
    ],
    i: ['**Write parse.** Return a `try` expression with a fallback.', '**Parse a good number.** Use `"42"`.', '**Parse bad text.** Use `"x"`.', '**Parse with a bigger fallback.** Use `fallback + 10`.'],
    e: ['**Write parse.**', '**Parse a good number.**', '**Parse bad text.**', '**Parse with a bigger fallback.**'],
  },
  'load-item': {
    summary: 'Use try as an expression together with finally, and build a log of what ran.',
    goal: 'Write a function that loads an item. A negative id is an error. Return the item and a log of what ran.',
    steps: [
      '**Write load.** Above `main`, write `fun load(id: Int): String`. Create `var log = ""`. Create `val r` as a `try` expression. In the `try`, add "t;" to `log`. When `id < 0`, throw `IllegalArgumentException("neg")`. The last line is "item" plus `id`. In the `catch`, add "c;" and make the last line "none". In `finally`, add "f;". Return `r`, a space and `log`.',
      '**Load a good id.** Print `load(id)`:\n"item3 t;f;"',
      '**Load a bad id.** Print `load(-id)`:\n"none t;c;f;"',
    ],
    i: ['**Write load.** A `try` expression with a catch, a finally and a log.', '**Load a good id.** Use `id`.', '**Load a bad id.** Use `-id`.'],
    e: ['**Write load.**', '**Load a good id.**', '**Load a bad id.**'],
  },
  'out-of-stock': {
    summary: 'Write your own exception class that carries extra data and a message.',
    goal: 'A shop cannot sell more than it has. Write an exception that says what is short, and use it when someone wants too many.',
    steps: [
      '**Write the exception.** Above `main`, write `class OutOfStock(val item: String, val missing: Int)`. It extends `Exception("no " + item + ": " + missing + " short")`.',
      '**Write take.** Write `fun take(stock: Int, want: Int): Int`. When `want > stock`, throw `OutOfStock("pen", want - stock)`. Otherwise return `stock - want`.',
      '**Use it.** In a `try` block, print `take(10, 4)`, then `take(10, want + 3)`. Add `catch (e: OutOfStock)`. Print `e.message`, then "missing " plus `e.missing`:\n"6"\n"no pen: 1 short"\n"missing 1"',
    ],
    i: ['**Write the exception.** Add `item`, `missing` and a message.', '**Write take.** Throw when `want > stock`.', '**Use it.** Call `take` twice and catch `OutOfStock`.'],
    e: ['**Write the exception.**', '**Write take.**', '**Use it.**'],
  },
  'app-errors': {
    summary: 'Write two subclasses of one base exception and catch them with the base class.',
    goal: 'An app has its own kinds of errors. Write two kinds, throw them from one function, and handle them in one place.',
    setup: 'The open class `AppError` is in the starter code.',
    steps: [
      '**Write NotFound.** Above `main`, write `class NotFound(val id: Int)`. It extends `AppError("missing " + id)`.',
      '**Write Invalid and fail.** Write `class Invalid(val field: String)` that extends `AppError("bad " + field)`. Write `fun fail(code: Int)`. Throw `NotFound(code * 10)` for code `1`. Throw `Invalid("name")` for code `2`. Otherwise print "fine".',
      '**Loop.** Loop `c` from `1` to `3`. In each round, call `fail(c + shift)` inside a `try`.',
      '**Catch the base class.** Add `catch (e: AppError)`. Print `e.message`:\n"missing 10"\n"bad name"\n"fine"',
    ],
    i: ['**Write NotFound.** Extend `AppError`.', '**Write Invalid and fail.** Throw by the code.', '**Loop.** Call `fail` three times.', '**Catch the base class.** Print the message.'],
    e: ['**Write NotFound.**', '**Write Invalid and fail.**', '**Loop.**', '**Catch the base class.**'],
  },
  'no-forced-catch': {
    summary: 'See that Kotlin does not force you to catch exceptions, and catch one when you choose to.',
    goal: 'Call a function that can throw. Use it without a try when it works, and with a try when you want to handle the failure.',
    steps: [
      '**Write load.** Above `main`, write `fun load(name: String): String`. When `name.isEmpty()`, throw `Exception("empty name")`. Otherwise return `name.uppercase()`.',
      '**Call it without a try.** Print `load(name)`. Kotlin does not force a `try` here:\n"ADA"',
      '**Call it with a try.** Print `load("")` inside a `try`. Add `catch (e: Exception)`. Print "failed: " plus `e.message`:\n"failed: empty name"',
    ],
    i: ['**Write load.** Throw for an empty name.', '**Call it without a try.** Print `load(name)`.', '**Call it with a try.** Catch the failure.'],
    e: ['**Write load.**', '**Call it without a try.**', '**Call it with a try.**'],
  },
  'pick-item': {
    summary: 'Handle two different unchecked exceptions with two different messages.',
    goal: 'Pick an item by a text index. A text that is not a number and an index that is too big are different problems. Give each its own answer.',
    steps: [
      '**Write pick.** Above `main`, write `fun pick(items: List<String>, text: String): String`. In a `try`, return `items[text.toInt()]`. Add `catch (e: NumberFormatException)` that returns "bad index". Add `catch (e: IndexOutOfBoundsException)` that returns "no such item".',
      '**Try a good index.** Print `pick(items, n)`:\n"b"',
      '**Try a bad number.** Print `pick(items, "x")`:\n"bad index"',
      '**Try an index that is too big.** Print `pick(items, "7")`:\n"no such item"',
    ],
    i: ['**Write pick.** Two catch blocks for two exceptions.', '**Try a good index.** Use `n`.', '**Try a bad number.** Use `"x"`.', '**Try an index that is too big.** Use `"7"`.'],
    e: ['**Write pick.**', '**Try a good index.**', '**Try a bad number.**', '**Try an index that is too big.**'],
  },
  'safe-div-result': {
    summary: 'Return a Result from a function and read it with getOrNull, getOrElse and exceptionOrNull.',
    goal: 'Write a division that returns a Result instead of throwing. Read the result in three ways.',
    steps: [
      '**Write safeDiv.** Above `main`, write `fun safeDiv(a: Int, b: Int): Result<Int>`. When `b == 0`, return `Result.failure(ArithmeticException("div by zero"))`. Otherwise return `Result.success(a / b)`.',
      '**Read a success.** Print `safeDiv(10, d).getOrNull()`:\n"5"',
      '**Read a failure with a default.** Print `safeDiv(1, 0).getOrElse { -1 }`:\n"-1"',
      '**Read the failure message.** Print `safeDiv(1, 0).exceptionOrNull()?.message`:\n"div by zero"',
    ],
    i: ['**Write safeDiv.** Return `Result.failure` or `Result.success`.', '**Read a success.** Use `getOrNull()`.', '**Read a failure with a default.** Use `getOrElse`.', '**Read the failure message.** Use `exceptionOrNull()`.'],
    e: ['**Write safeDiv.**', '**Read a success.**', '**Read a failure with a default.**', '**Read the failure message.**'],
  },
  'result-checks': {
    summary: 'Count the successes and failures in a list of Results, and add up the good values.',
    goal: 'Divide three pairs of numbers. Count how many divisions worked and how many failed, and add up the answers that worked.',
    setup: 'The function `safeDiv(a, b): Result<Int>` is in the starter code.',
    steps: [
      '**Make the results.** Create `val results` with `safeDiv(8, d)`, `safeDiv(8, 0)` and `safeDiv(9, d)`.',
      '**Count the successes.** Create `val successes` with `results.count { it.isSuccess }`. Create `val failures` as `results.size - successes`.',
      '**Add the good values.** Create `var sum = 0`. Loop over `results`. Add `r.getOrDefault(0)` to `sum`.',
      '**Print three lines.** Join the text with `+`:\n"Successes: 2"\n"Failures: 1"\n"Sum: 4"',
    ],
    i: ['**Make the results.** Three divisions.', '**Count the successes.** Use `isSuccess`.', '**Add the good values.** Use `getOrDefault(0)`.', '**Print three lines.** Show both counts and the sum.'],
    e: ['**Make the results.**', '**Count the successes.**', '**Add the good values.**', '**Print three lines.**'],
  },
  'catching-parse': {
    summary: 'Use runCatching to turn a parse that may fail into a Result.',
    goal: 'Parse two texts with runCatching. Ask each result if it worked, and read its value in two ways.',
    steps: [
      '**Make two results.** Create `val a` with `runCatching { text.toInt() }`. Create `val b` with `runCatching { "zz".toInt() }`.',
      '**Ask if they worked.** Print `a.isSuccess`, then `b.isFailure`:\n"true"\n"true"',
      '**Read the values.** Print `a.getOrNull()`, then `b.getOrNull()`, then `b.getOrElse { -1 }`:\n"12"\n"null"\n"-1"',
    ],
    i: ['**Make two results.** Use `runCatching`.', '**Ask if they worked.** Use `isSuccess` and `isFailure`.', '**Read the values.** Use `getOrNull` and `getOrElse`.'],
    e: ['**Make two results.**', '**Ask if they worked.**', '**Read the values.**'],
  },
  'chain-result': {
    summary: 'Chain map, onSuccess and onFailure on a Result, and use recover to repair a failure.',
    goal: 'Parse a text, double the number, and log what happened. Then repair a failed parse with a default value.',
    steps: [
      '**Build the chain.** Create `val r` with `runCatching { text.toInt() }`. Add `.map { it * 2 }`.',
      '**Log the outcome.** Add `.onSuccess { ... }` that adds "ok ", `it` and ";" to `log`. Add `.onFailure { ... }` that adds "fail;".',
      '**Read and repair.** Create `val value` with `r.getOrElse { 0 }`. Create `val rec` with `runCatching { "q".toInt() }.recover { -5 }`.',
      '**Print three lines.** Join the text with `+`:\n"Value: 40"\n"Log: ok 40;"\n"Recovered: -5"',
    ],
    i: ['**Build the chain.** Use `runCatching` and `map`.', '**Log the outcome.** Use `onSuccess` and `onFailure`.', '**Read and repair.** Use `getOrElse` and `recover`.', '**Print three lines.** Show the value, the log and the repair.'],
    e: ['**Build the chain.**', '**Log the outcome.**', '**Read and repair.**', '**Print three lines.**'],
  },
  'fold-result': {
    summary: 'Use fold to turn a success and a failure into text.',
    goal: 'Run two divisions with runCatching. Turn each result into a line of text, one for a value and one for an error.',
    steps: [
      '**Fold the first division.** Create `val a` with `runCatching { 10 / 2 }.fold(...)`. For a value, return "value " plus `it`. For an error, return "error " plus `it.message`.',
      '**Fold the second division.** Create `val b` the same way with `runCatching { 10 / z }`.',
      '**Print two lines.** Print `a`, then `b`:\n"value 5"\n"error / by zero"',
    ],
    i: ['**Fold the first division.** Use `fold` with two lambdas.', '**Fold the second division.** Use `z` as the divisor.', '**Print two lines.** Print `a` and `b`.'],
    e: ['**Fold the first division.**', '**Fold the second division.**', '**Print two lines.**'],
  },
  'handle-each': {
    summary: 'Use onSuccess and onFailure inside a loop to add the good values and report the bad ones.',
    goal: 'Go through a list of texts. Add up the texts that are numbers. Print a line for each text that is not.',
    steps: [
      '**Loop over the texts.** Loop over `texts` with `for (t in texts)`. Start with `runCatching { t.toInt() }`.',
      '**Handle each result.** Add `.onSuccess { ... }` that adds `it` to `sum`. Add `.onFailure { ... }` that prints "skip " plus `t`.',
      '**Print the sum.** Print "Sum: " plus `sum`:\n"skip x"\n"Sum: 13"',
    ],
    i: ['**Loop over the texts.** Use `runCatching` on each.', '**Handle each result.** Use `onSuccess` and `onFailure`.', '**Print the sum.** Show `sum`.'],
    e: ['**Loop over the texts.**', '**Handle each result.**', '**Print the sum.**'],
  },
  'null-pattern': {
    summary: 'Use toIntOrNull when bad text is expected, instead of throwing and catching.',
    goal: 'Add up a list of texts. Bad text is normal here, so use a default for it and count how many texts were bad.',
    steps: [
      '**Convert each text.** Loop over `raw` with `for (t in raw)`. Create `val n` as `t.toIntOrNull()`.',
      '**Count the bad ones.** When `n == null`, add `1` to `bad`.',
      '**Add with a default.** Add `n ?: fallback` to `total`. After the loop, print "Total: " plus `total`, then "Bad: " plus `bad`:\n"Total: 12"\n"Bad: 1"',
    ],
    i: ['**Convert each text.** Use `toIntOrNull()`.', '**Count the bad ones.** Check for `null`.', '**Add with a default.** Use `?: fallback`, then print.'],
    e: ['**Convert each text.**', '**Count the bad ones.**', '**Add with a default.**'],
  },
  'result-pattern': {
    summary: 'Use a function that returns a Result for validation rules, and fold it into messages.',
    goal: 'Check a quantity against two rules. A good quantity is doubled. A bad one gives a clear error. Print one line for each quantity.',
    steps: [
      '**Write validate.** Above `main`, write `fun validate(qty: Int): Result<Int>`. When `qty <= 0`, return a failure with `IllegalArgumentException("qty must be positive")`. When `qty > 100`, return a failure with "qty too big". Otherwise return a success with `qty * 2`.',
      '**Loop over the quantities.** Loop over `listOf(5, 0, big)`.',
      '**Print each result.** Print `validate(q).fold(...)`. For a value, return "ok " plus `it`. For an error, return "error " plus `it.message`:\n"ok 10"\n"error qty must be positive"\n"error qty too big"',
    ],
    i: ['**Write validate.** Two rules, two failures, one success.', '**Loop over the quantities.** Use `5`, `0` and `big`.', '**Print each result.** Use `fold`.'],
    e: ['**Write validate.**', '**Loop over the quantities.**', '**Print each result.**'],
  },
  'log-the-error': {
    summary: 'Print the reason in the catch block so the error is not lost.',
    goal: 'Write a function that turns a text into a number. When it fails, it says why, and gives 0. Try it twice.',
    steps: [
      '**Write parse.** Above `main`, write `fun parse(s: String): Int`. In a `try`, return `s.toInt()`. Add `catch (e: NumberFormatException)`.',
      '**Report the error.** Inside the catch block, print "bad: " plus `e.message`. Then return `0`.',
      '**Call it twice.** Print `parse("12")`, then `parse(text)`:\n"12"\n"bad: For input string: \\"zz\\""\n"0"',
    ],
    i: ['**Write parse.** Parse in a `try`, catch `NumberFormatException`.', '**Report the error.** Print the reason, return `0`.', '**Call it twice.** Use `"12"` and `text`.'],
    e: ['**Write parse.**', '**Report the error.**', '**Call it twice.**'],
  },
  'keep-the-cause': {
    summary: 'Wrap an exception in a new one and keep the first one as its cause.',
    goal: 'Write a function that turns a failed parse into a clearer error and keeps the original error. Print both messages.',
    steps: [
      '**Write load.** Above `main`, write `fun load(text: String): Int`. In a `try`, return `text.toInt()`. In `catch (e: NumberFormatException)`, throw `IllegalStateException("load failed", e)`.',
      '**Call it.** In a `try` block in `main`, print `load("4")`, then `load(text)`.',
      '**Print both messages.** Add `catch (e: IllegalStateException)`. Print `e.message`, " <- " and `e.cause?.message`:\n"4"\n"load failed <- For input string: \\"q\\""',
    ],
    i: ['**Write load.** Wrap the parse error and pass it as the cause.', '**Call it.** Use `"4"` and `text`.', '**Print both messages.** Use `e.message` and `e.cause?.message`.'],
    e: ['**Write load.**', '**Call it.**', '**Print both messages.**'],
  },
  'clear-messages': {
    summary: 'Write failure messages that say what is wrong and show the value that caused it.',
    goal: 'Check three orders. Each problem must say clearly what is wrong. Print one line for each order.',
    steps: [
      '**Write checkOrder.** Above `main`, write `fun checkOrder(items: Int, total: Int)`. When `items <= 0`, throw `IllegalArgumentException("order has no items")`. When `total < 0`, throw one with "order total ", `total` and " is negative". Otherwise print "order ok: ", `items`, " items, " and `total`.',
      '**Check the first two orders.** Call `checkOrder(2, 30)`, then `checkOrder(3, -5)`. Put each call in its own `try`, and catch `IllegalArgumentException`. In the catch, print "error: " plus `e.message`.',
      '**Check the third order.** Do the same with `checkOrder(items, 25)`:\n"order ok: 2 items, 30"\n"error: order total -5 is negative"\n"error: order has no items"',
    ],
    i: ['**Write checkOrder.** Two rules with clear messages.', '**Check the first two orders.** Use `try` and `catch` for each.', '**Check the third order.** Use `items`.'],
    e: ['**Write checkOrder.**', '**Check the first two orders.**', '**Check the third order.**'],
  },
  'order-codes': {
    summary: 'Write an exception with an error code, and use the code and the message when you catch it.',
    goal: 'Process orders. Each kind of failure has its own code and a clear message. Print a line for each order.',
    steps: [
      '**Write the exception.** Above `main`, write `class OrderError(val code: Int, message: String)`. It extends `Exception(message)`.',
      '**Write process.** Write `fun process(qty: Int, stock: Int): Int`. When `qty <= 0`, throw `OrderError(1, "no items")`. When `qty > stock`, throw `OrderError(2, "need " + (qty - stock) + " more")`. Otherwise return `stock - qty`.',
      '**Process three orders.** Loop over `listOf(0, 8, 3)`. In a `try`, print "done " plus `process(q, stock)`. Catch `OrderError` and print "code ", `e.code`, ": " and `e.message`:\n"code 1: no items"\n"code 2: need 3 more"\n"done 2"',
    ],
    i: ['**Write the exception.** Add a `code` and a message.', '**Write process.** Throw code `1` or `2`, or return the new stock.', '**Process three orders.** Print the result or the code and message.'],
    e: ['**Write the exception.**', '**Write process.**', '**Process three orders.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'unguarded-divide': {
    subtitle: 'The program should print "a", "safe" and "end", but it stops with an error after "a".',
    hints: [
      'Look at the output. Which line is the last one that prints?',
      'Dividing by `0` throws an `ArithmeticException`. Nothing catches it, so the program stops.',
      'Put the division in a block that handles that exception, so the program can go on.',
    ],
    explanation: 'The exception `ArithmeticException` is thrown by `10 / d`. With no `try`, the program stops there. Putting the division in `try` and adding `catch (e: ArithmeticException)` prints `safe` and lets the program go on to `end`.',
  },
  'wrong-catch': {
    subtitle: 'The program should print "caught / by zero", but it stops with an error.',
    hints: [
      'Look at the exception type in the `catch` and the kind of error that happens.',
      'Dividing by `0` throws `ArithmeticException`. The catch is for `NumberFormatException`, so it does not match.',
      'Change the catch to the type that the division really throws.',
    ],
    explanation: 'A `catch` only handles the type that you write (and its subtypes). `10 / 0` throws `ArithmeticException`, which is not a `NumberFormatException`, so the exception goes on and stops the program. Catching `ArithmeticException` prints `caught / by zero`.',
  },
  'skipped-cleanup': {
    subtitle: 'The program should print "open", "close" and "negative", but it never prints "close".',
    hints: [
      'Follow the code for `work(-1)`. Which lines run before the `return`?',
      'The early `return` leaves the function, so the line after it never runs.',
      'Put the cleanup in a block that always runs, even when the function returns early.',
    ],
    explanation: 'A `return` ends the function at once, so `println("close")` after it is skipped. A `finally` block runs when the `try` block ends in any way, including `return`. With `finally`, the program prints `close` before it returns `negative`.',
  },
  'forgot-throw': {
    subtitle: 'The program should print "rejected: negative", but it prints "accepted".',
    hints: [
      'Look at the line inside `if (age < 0)`. What does it do?',
      'It creates an exception object, but nothing throws it. The code goes on as normal.',
      'Add the keyword that makes the exception fly.',
    ],
    explanation: '`IllegalArgumentException("negative")` only creates an object. An exception has an effect only when it is thrown. With `throw`, the function stops, the `catch` runs and the program prints `rejected: negative`.',
  },
  'general-first': {
    subtitle: 'The program should print "specific a", but it prints "general a".',
    hints: [
      'Look at the order of the two catch blocks.',
      'Kotlin uses the first catch that matches. `Exception` matches every exception, so it wins.',
      'Put the more specific catch first.',
    ],
    explanation: 'Catch blocks are tried from top to bottom. `IllegalArgumentException` is also an `Exception`, so the general catch matches first and the specific one never runs. With the specific catch first, the program prints `specific a`.',
  },
  'zero-fallback': {
    subtitle: 'The program should print "0" and "-1", but it prints "0" and "0".',
    hints: [
      'Look at the two outputs. Can you tell a real zero from a failure?',
      'The fallback `0` is also a valid answer, so a failed parse looks the same as a real zero.',
      'Choose a fallback value that a real answer can never be.',
    ],
    explanation: 'When the fallback is `0`, the text `"0"` and the bad text `"x"` give the same answer, so the caller cannot tell them apart. A fallback such as `-1` is different from every valid answer here, so the program prints `0` and `-1`.',
  },
  'silent-message': {
    subtitle: 'The program should print "Error: no stock: pen", but it prints "Error: null".',
    hints: [
      'Look at the word `null` in the output. What is `e.message` here?',
      'The class extends `Exception()` with no message, so the message is `null`.',
      'Give the message to the parent class when you declare the exception.',
    ],
    explanation: '`Exception()` without an argument has no message, so `e.message` is `null`. By writing `Exception("no stock: " + item)`, the class passes a message to its parent, and `e.message` returns it.',
  },
  'catch-too-wide': {
    subtitle: 'The program should print "b" and "no such item", but it prints "b" and "bad number".',
    hints: [
      'Look at the second line. Is index 7 a bad number?',
      'The catch is for `Exception`, so it handles every problem with the same answer, including the index that is too big.',
      'Catch each kind of problem on its own, and give each its own answer.',
    ],
    explanation: '`"7"` is a good number, but the list has only three items, so `items[7]` throws `IndexOutOfBoundsException`. The wide catch says `bad number`, which is wrong. Two catches, `NumberFormatException` and `IndexOutOfBoundsException`, give the right reason for each.',
  },
  'null-default': {
    subtitle: 'The program should print "Value: -1", but it prints "Value: null".',
    hints: [
      'Look at what a failed `Result` gives with `getOrNull()`.',
      '`getOrNull()` returns `null` for a failure, and a `null` prints as the word null.',
      'Use the function that lets you give a default value for a failure.',
    ],
    explanation: '`"x".toInt()` fails, so the `Result` is a failure, and `getOrNull()` gives `null`. `getOrElse { -1 }` runs the lambda for a failure and gives `-1`, so the program prints `Value: -1`.',
  },
  'map-skips-failure': {
    subtitle: 'The program should print "Value: 0", but it prints "Value: null".',
    hints: [
      'Look at which step runs for a failed `Result`.',
      '`map` only runs for a success. For a failure, the result stays a failure.',
      'Use the function that works on a failure and gives a new value.',
    ],
    explanation: '`map` changes the value of a success and leaves a failure as it is, so the result is still a failure and `getOrNull()` is `null`. `recover { 0 }` runs for a failure and turns it into a success with `0`.',
  },
  'inverted-check': {
    subtitle: 'The program should print "ok 12", but it prints "failed".',
    hints: [
      'Look at the condition in the `if`. Which result do you expect for "12"?',
      'The text "12" parses, so the result is a success. The condition asks for a failure.',
      'Test for the case that you want in the first branch.',
    ],
    explanation: '`r.isFailure` is `false` for a good parse, so the code goes to the `else` branch and prints `failed`. With `r.isSuccess`, the first branch runs and prints `ok 12`.',
  },
  'throw-for-normal': {
    subtitle: 'The program should print "Total: 10", but it stops with an error.',
    hints: [
      'Look at the list. Which text is not a number?',
      '`toInt()` throws an exception for a bad text. Here bad text is part of the normal input.',
      'Use the conversion that gives a `null` instead of throwing, and give it a default.',
    ],
    explanation: '`"x".toInt()` throws `NumberFormatException`, which stops the program. When bad input is expected, `toIntOrNull()` gives `null` and `?: 0` turns it into a default, so the total is `4 + 0 + 6 = 10`.',
  },
  'empty-catch': {
    subtitle: 'The program should print "bad: For input string: \\"zz\\"" for a bad text, but it prints nothing about the problem.',
    hints: [
      'Look at the output for "zz". Is there any sign that something went wrong?',
      'The catch block is empty, so the error is thrown away and the function quietly returns `0`.',
      'Make the catch block report the reason.',
    ],
    explanation: 'An empty `catch` swallows the exception, so nobody learns what went wrong. Printing `e.message` in the catch block keeps the reason visible, and the function still returns `0`.',
  },
  'vague-message': {
    subtitle: 'The program should print "order 8 has no items", but it prints "error".',
    hints: [
      'Look at the message. Can you tell which order failed and why?',
      'The message is only the word error, which says nothing.',
      'Write a message that names the order and the problem.',
    ],
    explanation: 'A message such as `error` does not help anyone find the problem. A good message names the thing and the reason. `"order " + id + " has no items"` says that order 8 has no items.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'unguarded-divide': 'A division by zero is not caught, so the program stops.',
  'wrong-catch': 'The catch is for a different exception type.',
  'skipped-cleanup': 'An early return skips the close line.',
  'forgot-throw': 'The exception is created but not thrown.',
  'general-first': 'The general catch comes before the specific one.',
  'zero-fallback': 'The fallback looks like a real answer.',
  'silent-message': 'The custom exception has no message.',
  'catch-too-wide': 'One wide catch gives the wrong reason.',
  'null-default': 'A failed Result gives null, not a default.',
  'map-skips-failure': 'map does not run for a failure.',
  'inverted-check': 'The success branch tests for failure.',
  'throw-for-normal': 'toInt throws for text that is expected to be bad.',
  'empty-catch': 'The catch block hides the error.',
  'vague-message': 'The message does not say what went wrong.',
};
