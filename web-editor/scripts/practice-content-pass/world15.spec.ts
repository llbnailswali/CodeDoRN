/**
 * World 15 (Error Fortress) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world15.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world15.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'divide-try', difficulty: 'medium', tags: ['lesson:exceptions-try', 'try', 'catch', 'arithmetic-exception'], title: 'Divide with Try', fileName: 'DivideTry.kt',
    solution: `fun main() {
  val divisor = 0
  try {
    println("start")
    val x = 10 / divisor
    println("value " + x)
  } catch (e: ArithmeticException) {
    println("caught " + e.message)
  }
  println("after")
}`,
    starter: `fun main() {
  val divisor = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Dividing by 0 throws ArithmeticException with the message / by zero; the catch handles it and the program goes on. With divisor 2: value 5.
    expected: 'start\ncaught / by zero\nafter',
    swap: { variableName: 'divisor', originalLiteral: '0', alternateLiteral: '2', alternateExpected: 'start\nvalue 5\nafter' },
  },
  {
    id: 'parse-list', difficulty: 'hard', tags: ['lesson:exceptions-try', 'try-in-loop', 'number-format-exception', 'counters'], title: 'Parse the List', fileName: 'ParseList.kt',
    solution: `fun main() {
  val bonus = 10
  val texts = listOf("5", "x", "7", "")
  var total = 0
  var bad = 0
  for (t in texts) {
    try {
      total += t.toInt() + bonus
    } catch (e: NumberFormatException) {
      bad += 1
    }
  }
  println("Total: " + total)
  println("Bad: " + bad)
}`,
    starter: `fun main() {
  val bonus = 10
  val texts = listOf("5", "x", "7", "")

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 5 and 7 are numbers: 15 + 17 = 32. The texts x and the empty text are not numbers, so bad is 2. With bonus 0: 12.
    expected: 'Total: 32\nBad: 2',
    swap: { variableName: 'bonus', originalLiteral: '10', alternateLiteral: '0', alternateExpected: 'Total: 12\nBad: 2' },
  },
  {
    id: 'catch-message', difficulty: 'medium', tags: ['lesson:catch', 'catch', 'exception-message', 'number-format-exception'], title: 'Catch the Message', fileName: 'CatchMessage.kt',
    solution: `fun main() {
  val text = "abc"
  try {
    val n = text.toInt()
    println("Number: " + n)
  } catch (e: NumberFormatException) {
    println("Not a number: " + e.message)
  }
}`,
    starter: `fun main() {
  val text = "abc"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // toInt on abc throws NumberFormatException with the message For input string: "abc". With the text 42 it prints Number: 42.
    expected: 'Not a number: For input string: "abc"',
    swap: { variableName: 'text', originalLiteral: '"abc"', alternateLiteral: '"42"', alternateExpected: 'Number: 42' },
  },
  {
    id: 'age-reader', difficulty: 'hard', tags: ['lesson:catch', 'catch-by-type', 'exception-propagation', 'number-format-exception'], title: 'Age Reader', fileName: 'AgeReader.kt',
    solution: `fun readAge(text: String): Int {
  try {
    val age = text.toInt()
    if (age < 0) {
      throw IllegalArgumentException("negative age " + age)
    }
    return age
  } catch (e: NumberFormatException) {
    return -1
  }
}

fun main() {
  val last = -3
  try {
    println(readAge("5"))
    println(readAge("x"))
    println(readAge(last.toString()))
  } catch (e: IllegalArgumentException) {
    println("main caught " + e.message)
  }
}`,
    starter: `// 1. TODO

fun main() {
  val last = -3

  // 2. TODO

  // 3. TODO
}`,
    // 5 is fine; x gives -1 because readAge catches NumberFormatException; -3 throws IllegalArgumentException, which readAge does not catch, so main does. With last 4: it prints 4.
    expected: '5\n-1\nmain caught negative age -3',
    swap: { variableName: 'last', originalLiteral: '-3', alternateLiteral: '4', alternateExpected: '5\n-1\n4' },
  },
  {
    id: 'always-cleanup', difficulty: 'medium', tags: ['lesson:finally', 'finally', 'return-in-try', 'cleanup'], title: 'Always Clean Up', fileName: 'AlwaysCleanup.kt',
    solution: `fun run(fail: Boolean): String {
  try {
    println("work")
    if (fail) {
      throw IllegalStateException("broke")
    }
    return "ok"
  } catch (e: IllegalStateException) {
    return "failed"
  } finally {
    println("cleanup")
  }
}

fun main() {
  val fail = false
  println(run(fail))
  println(run(!fail))
}`,
    starter: `// 1. TODO

fun main() {
  val fail = false

  // 2. TODO

  // 3. TODO
}`,
    // finally runs after the return value is chosen and before it is printed. First call: work, cleanup, ok. Second call fails: work, cleanup, failed. With fail true the order swaps.
    expected: 'work\ncleanup\nok\nwork\ncleanup\nfailed',
    swap: { variableName: 'fail', originalLiteral: 'false', alternateLiteral: 'true', alternateExpected: 'work\ncleanup\nfailed\nwork\ncleanup\nok' },
  },
  {
    id: 'finally-log', difficulty: 'hard', tags: ['lesson:finally', 'finally', 'try-catch-finally', 'string-log'], title: 'Finally Log', fileName: 'FinallyLog.kt',
    solution: `fun step(n: Int, bad: Int): String {
  var log = ""
  try {
    log += "t" + n + ";"
    if (n == bad) {
      throw RuntimeException("x")
    }
  } catch (e: RuntimeException) {
    log += "c" + n + ";"
  } finally {
    log += "f" + n + ";"
  }
  return log
}

fun main() {
  val bad = 2
  var all = ""
  for (i in 1..3) {
    all += step(i, bad)
  }
  println("Log: " + all)
}`,
    starter: `// 1. TODO

fun main() {
  val bad = 2
  var all = ""

  // 2. TODO

  // 3. TODO
}`,
    // Every step logs t then f; the bad step 2 also logs c between them. With bad 3 the c moves to step 3.
    expected: 'Log: t1;f1;t2;c2;f2;t3;f3;',
    swap: { variableName: 'bad', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Log: t1;f1;t2;f2;t3;c3;f3;' },
  },
  {
    id: 'check-ages', difficulty: 'medium', tags: ['lesson:throw', 'throw', 'illegal-argument-exception', 'validation'], title: 'Check the Ages', fileName: 'CheckAges.kt',
    solution: `fun validate(age: Int) {
  if (age < 0) {
    throw IllegalArgumentException("age " + age + " is negative")
  }
  if (age > 120) {
    throw IllegalArgumentException("age " + age + " is too big")
  }
  println("valid " + age)
}

fun main() {
  val oldest = 130
  for (a in listOf(30, -5, oldest)) {
    try {
      validate(a)
    } catch (e: IllegalArgumentException) {
      println("error: " + e.message)
    }
  }
}`,
    starter: `// 1. TODO

fun main() {
  val oldest = 130

  // 2. TODO

  // 3. TODO
}`,
    // 30 is valid, -5 is negative and 130 is too big. With oldest 100: valid 100.
    expected: 'valid 30\nerror: age -5 is negative\nerror: age 130 is too big',
    swap: { variableName: 'oldest', originalLiteral: '130', alternateLiteral: '100', alternateExpected: 'valid 30\nerror: age -5 is negative\nvalid 100' },
  },
  {
    id: 'wrap-and-throw', difficulty: 'hard', tags: ['lesson:throw', 'throw', 'catch-and-rethrow', 'new-message'], title: 'Wrap and Throw', fileName: 'WrapAndThrow.kt',
    solution: `fun parseId(text: String): Int {
  try {
    return text.toInt()
  } catch (e: NumberFormatException) {
    throw IllegalArgumentException("bad id: " + text)
  }
}

fun main() {
  val id = "x7"
  try {
    println(parseId("12"))
    println(parseId(id))
  } catch (e: IllegalArgumentException) {
    println(e.message)
  }
}`,
    starter: `// 1. TODO

fun main() {
  val id = "x7"

  // 2. TODO

  // 3. TODO
}`,
    // 12 parses; x7 is not a number, so parseId throws a new exception with a clearer message. With id 9: it prints 9.
    expected: '12\nbad id: x7',
    swap: { variableName: 'id', originalLiteral: '"x7"', alternateLiteral: '"9"', alternateExpected: '12\n9' },
  },
  {
    id: 'two-catches', difficulty: 'medium', tags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'illegal-state', 'illegal-argument'], title: 'Two Catches', fileName: 'TwoCatches.kt',
    solution: `fun run(n: Int) {
  try {
    if (n == 1) {
      throw IllegalStateException("state")
    }
    if (n == 2) {
      throw IllegalArgumentException("arg")
    }
    println("fine " + n)
  } catch (e: IllegalArgumentException) {
    println("IAE " + e.message)
  } catch (e: IllegalStateException) {
    println("ISE " + e.message)
  }
}

fun main() {
  val first = 1
  run(first)
  run(first + 1)
  run(first + 2)
}`,
    starter: `// 1. TODO

fun main() {
  val first = 1

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Run 1 throws IllegalStateException, run 2 IllegalArgumentException, run 3 is fine. With first 2: IAE arg, fine 3, fine 4.
    expected: 'ISE state\nIAE arg\nfine 3',
    swap: { variableName: 'first', originalLiteral: '1', alternateLiteral: '2', alternateExpected: 'IAE arg\nfine 3\nfine 4' },
  },
  {
    id: 'catch-order', difficulty: 'hard', tags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'catch-order', 'exception-hierarchy'], title: 'Catch Order', fileName: 'CatchOrder.kt',
    solution: `open class AppError(message: String) : Exception(message)

class NotFound(val id: Int) : AppError("missing " + id)

class Invalid(val field: String) : AppError("bad " + field)

fun find(id: Int): String {
  if (id == 0) {
    throw Invalid("id")
  }
  if (id > 3) {
    throw NotFound(id)
  }
  return "item" + id
}

fun main() {
  val missing = 5
  for (i in listOf(1, 0, missing)) {
    try {
      println(find(i))
    } catch (e: NotFound) {
      println("nf " + e.id)
    } catch (e: AppError) {
      println("app " + e.message)
    }
  }
}`,
    starter: `open class AppError(message: String) : Exception(message)

// 1. TODO

fun main() {
  val missing = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 1 gives item1; 0 throws Invalid, caught by the general AppError catch; 5 throws NotFound, caught by the specific catch first. With missing 2: item2.
    expected: 'item1\napp bad id\nnf 5',
    swap: { variableName: 'missing', originalLiteral: '5', alternateLiteral: '2', alternateExpected: 'item1\napp bad id\nitem2' },
  },
  {
    id: 'parse-or', difficulty: 'medium', tags: ['lesson:try-as-an-expression', 'try-expression', 'fallback-value', 'return-try'], title: 'Parse or Fallback', fileName: 'ParseOr.kt',
    solution: `fun parse(text: String, fallback: Int): Int {
  return try {
    text.toInt()
  } catch (e: NumberFormatException) {
    fallback
  }
}

fun main() {
  val fallback = 5
  println(parse("42", fallback))
  println(parse("x", fallback))
  println(parse("", fallback + 10))
}`,
    starter: `// 1. TODO

fun main() {
  val fallback = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 42 parses; x and the empty text use the fallback: 5 and then 5 + 10 = 15. With fallback 0: 42, 0, 10.
    expected: '42\n5\n15',
    swap: { variableName: 'fallback', originalLiteral: '5', alternateLiteral: '0', alternateExpected: '42\n0\n10' },
  },
  {
    id: 'load-item', difficulty: 'hard', tags: ['lesson:try-as-an-expression', 'try-expression', 'finally', 'value-and-log'], title: 'Load an Item', fileName: 'LoadItem.kt',
    solution: `fun load(id: Int): String {
  var log = ""
  val r = try {
    log += "t;"
    if (id < 0) {
      throw IllegalArgumentException("neg")
    }
    "item" + id
  } catch (e: IllegalArgumentException) {
    log += "c;"
    "none"
  } finally {
    log += "f;"
  }
  return r + " " + log
}

fun main() {
  val id = 3
  println(load(id))
  println(load(-id))
}`,
    starter: `// 1. TODO

fun main() {
  val id = 3

  // 2. TODO

  // 3. TODO
}`,
    // The try block gives item3 and finally adds f. For -3 the catch gives none, and the log is t, c, f. With id 5: item5 and none.
    expected: 'item3 t;f;\nnone t;c;f;',
    swap: { variableName: 'id', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'item5 t;f;\nnone t;c;f;' },
  },
  {
    id: 'out-of-stock', difficulty: 'medium', tags: ['lesson:custom-exceptions', 'custom-exception', 'exception-property', 'message'], title: 'Out of Stock', fileName: 'OutOfStock.kt',
    solution: `class OutOfStock(val item: String, val missing: Int) : Exception("no " + item + ": " + missing + " short")

fun take(stock: Int, want: Int): Int {
  if (want > stock) {
    throw OutOfStock("pen", want - stock)
  }
  return stock - want
}

fun main() {
  val want = 8
  try {
    println(take(10, 4))
    println(take(10, want + 3))
  } catch (e: OutOfStock) {
    println(e.message)
    println("missing " + e.missing)
  }
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val want = 8

  // 3. TODO
}`,
    // Taking 4 of 10 leaves 6. Taking 11 is 1 more than the stock, so OutOfStock says no pen: 1 short and missing 1. With want 0: taking 3 leaves 7.
    expected: '6\nno pen: 1 short\nmissing 1',
    swap: { variableName: 'want', originalLiteral: '8', alternateLiteral: '0', alternateExpected: '6\n7' },
  },
  {
    id: 'app-errors', difficulty: 'hard', tags: ['lesson:custom-exceptions', 'custom-exception', 'exception-hierarchy', 'open-class'], title: 'App Errors', fileName: 'AppErrors.kt',
    solution: `open class AppError(message: String) : Exception(message)

class NotFound(val id: Int) : AppError("missing " + id)

class Invalid(val field: String) : AppError("bad " + field)

fun fail(code: Int) {
  if (code == 1) {
    throw NotFound(code * 10)
  }
  if (code == 2) {
    throw Invalid("name")
  }
  println("fine")
}

fun main() {
  val shift = 0
  for (c in 1..3) {
    try {
      fail(c + shift)
    } catch (e: AppError) {
      println(e.message)
    }
  }
}`,
    starter: `open class AppError(message: String) : Exception(message)

// 1. TODO

// 2. TODO

fun main() {
  val shift = 0

  // 3. TODO

  // 4. TODO
}`,
    // Code 1 throws NotFound(10) with the message missing 10; code 2 throws Invalid with bad name; code 3 is fine. With shift 1 the codes are 2, 3, 4.
    expected: 'missing 10\nbad name\nfine',
    swap: { variableName: 'shift', originalLiteral: '0', alternateLiteral: '1', alternateExpected: 'bad name\nfine\nfine' },
  },
  {
    id: 'no-forced-catch', difficulty: 'medium', tags: ['lesson:checked-vs-unchecked-exception-model', 'unchecked-exceptions', 'optional-catch', 'exception'], title: 'No Forced Catch', fileName: 'NoForcedCatch.kt',
    solution: `fun load(name: String): String {
  if (name.isEmpty()) {
    throw Exception("empty name")
  }
  return name.uppercase()
}

fun main() {
  val name = "ada"
  println(load(name))
  try {
    println(load(""))
  } catch (e: Exception) {
    println("failed: " + e.message)
  }
}`,
    starter: `// 1. TODO

fun main() {
  val name = "ada"

  // 2. TODO

  // 3. TODO
}`,
    // Kotlin does not force a try around load. The first call needs none and prints ADA; the second throws and is caught by choice. With name bo: BO.
    expected: 'ADA\nfailed: empty name',
    swap: { variableName: 'name', originalLiteral: '"ada"', alternateLiteral: '"bo"', alternateExpected: 'BO\nfailed: empty name' },
  },
  {
    id: 'pick-item', difficulty: 'hard', tags: ['lesson:checked-vs-unchecked-exception-model', 'handle-what-you-can', 'specific-catch', 'index-out-of-bounds'], title: 'Pick an Item', fileName: 'PickItem.kt',
    solution: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: NumberFormatException) {
    return "bad index"
  } catch (e: IndexOutOfBoundsException) {
    return "no such item"
  }
}

fun main() {
  val n = "1"
  val items = listOf("a", "b", "c")
  println(pick(items, n))
  println(pick(items, "x"))
  println(pick(items, "7"))
}`,
    starter: `// 1. TODO

fun main() {
  val n = "1"
  val items = listOf("a", "b", "c")

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Index 1 gives b; x is not a number so bad index; 7 is past the end so no such item. With n 9: no such item first.
    expected: 'b\nbad index\nno such item',
    swap: { variableName: 'n', originalLiteral: '"1"', alternateLiteral: '"9"', alternateExpected: 'no such item\nbad index\nno such item' },
  },
  {
    id: 'safe-div-result', difficulty: 'medium', tags: ['lesson:result', 'result', 'getOrNull', 'getOrElse', 'exceptionOrNull'], title: 'Safe Divide Result', fileName: 'SafeDivResult.kt',
    solution: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 2
  println(safeDiv(10, d).getOrNull())
  println(safeDiv(1, 0).getOrElse { -1 })
  println(safeDiv(1, 0).exceptionOrNull()?.message)
}`,
    starter: `// 1. TODO

fun main() {
  val d = 2

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 10 / 2 is 5; the failure gives the default -1; its message is div by zero. With d 5: 2.
    expected: '5\n-1\ndiv by zero',
    swap: { variableName: 'd', originalLiteral: '2', alternateLiteral: '5', alternateExpected: '2\n-1\ndiv by zero' },
  },
  {
    id: 'result-checks', difficulty: 'hard', tags: ['lesson:result', 'result', 'isSuccess', 'isFailure', 'list-of-results'], title: 'Result Checks', fileName: 'ResultChecks.kt',
    solution: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 4
  val results = listOf(safeDiv(8, d), safeDiv(8, 0), safeDiv(9, d))
  val successes = results.count { it.isSuccess }
  val failures = results.size - successes
  var sum = 0
  for (r in results) {
    sum += r.getOrDefault(0)
  }
  println("Successes: " + successes)
  println("Failures: " + failures)
  println("Sum: " + sum)
}`,
    starter: `fun safeDiv(a: Int, b: Int): Result<Int> {
  if (b == 0) {
    return Result.failure(ArithmeticException("div by zero"))
  }
  return Result.success(a / b)
}

fun main() {
  val d = 4

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 8 / 4 = 2 and 9 / 4 = 2 succeed, and 8 / 0 fails: 2 successes, 1 failure, sum 4. With d 0: all fail.
    expected: 'Successes: 2\nFailures: 1\nSum: 4',
    swap: { variableName: 'd', originalLiteral: '4', alternateLiteral: '0', alternateExpected: 'Successes: 0\nFailures: 3\nSum: 0' },
  },
  {
    id: 'catching-parse', difficulty: 'medium', tags: ['lesson:runcatching', 'runCatching', 'isSuccess', 'getOrNull', 'getOrElse'], title: 'Catching a Parse', fileName: 'CatchingParse.kt',
    solution: `fun main() {
  val text = "12"
  val a = runCatching { text.toInt() }
  val b = runCatching { "zz".toInt() }
  println(a.isSuccess)
  println(b.isFailure)
  println(a.getOrNull())
  println(b.getOrNull())
  println(b.getOrElse { -1 })
}`,
    starter: `fun main() {
  val text = "12"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 12 parses and zz does not: true, true, 12, null, -1. With the text x both fail: false, true, null, null, -1.
    expected: 'true\ntrue\n12\nnull\n-1',
    swap: { variableName: 'text', originalLiteral: '"12"', alternateLiteral: '"x"', alternateExpected: 'false\ntrue\nnull\nnull\n-1' },
  },
  {
    id: 'chain-result', difficulty: 'hard', tags: ['lesson:runcatching', 'runCatching', 'map', 'onSuccess', 'onFailure', 'recover'], title: 'Chain a Result', fileName: 'ChainResult.kt',
    solution: `fun main() {
  val text = "20"
  var log = ""
  val r = runCatching { text.toInt() }
    .map { it * 2 }
    .onSuccess { log += "ok " + it + ";" }
    .onFailure { log += "fail;" }
  val value = r.getOrElse { 0 }
  val rec = runCatching { "q".toInt() }.recover { -5 }
  println("Value: " + value)
  println("Log: " + log)
  println("Recovered: " + rec.getOrNull())
}`,
    starter: `fun main() {
  val text = "20"
  var log = ""

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 20 doubles to 40 and logs ok 40; recover turns the failed q into -5. With the text w: the value is 0 and the log is fail;.
    expected: 'Value: 40\nLog: ok 40;\nRecovered: -5',
    swap: { variableName: 'text', originalLiteral: '"20"', alternateLiteral: '"w"', alternateExpected: 'Value: 0\nLog: fail;\nRecovered: -5' },
  },
  {
    id: 'fold-result', difficulty: 'medium', tags: ['lesson:success-failure-handling', 'fold', 'runCatching', 'success-and-failure'], title: 'Fold a Result', fileName: 'FoldResult.kt',
    solution: `fun main() {
  val z = 0
  val a = runCatching { 10 / 2 }.fold({ "value " + it }, { "error " + it.message })
  val b = runCatching { 10 / z }.fold({ "value " + it }, { "error " + it.message })
  println(a)
  println(b)
}`,
    starter: `fun main() {
  val z = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 10 / 2 succeeds with 5. 10 / 0 fails with / by zero. With z 5 the second also succeeds with 2.
    expected: 'value 5\nerror / by zero',
    swap: { variableName: 'z', originalLiteral: '0', alternateLiteral: '5', alternateExpected: 'value 5\nvalue 2' },
  },
  {
    id: 'handle-each', difficulty: 'hard', tags: ['lesson:success-failure-handling', 'onSuccess', 'onFailure', 'loop', 'runCatching'], title: 'Handle Each', fileName: 'HandleEach.kt',
    solution: `fun main() {
  val extra = "9"
  val texts = listOf("4", "x", extra)
  var sum = 0
  for (t in texts) {
    runCatching { t.toInt() }
      .onSuccess { sum += it }
      .onFailure { println("skip " + t) }
  }
  println("Sum: " + sum)
}`,
    starter: `fun main() {
  val extra = "9"
  val texts = listOf("4", "x", extra)
  var sum = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 4 and 9 are added (13). x is skipped with a message. With the text y instead of 9: both x and y are skipped and the sum is 4.
    expected: 'skip x\nSum: 13',
    swap: { variableName: 'extra', originalLiteral: '"9"', alternateLiteral: '"y"', alternateExpected: 'skip x\nskip y\nSum: 4' },
  },
  {
    id: 'null-pattern', difficulty: 'medium', tags: ['lesson:error-handling-patterns', 'toIntOrNull', 'expected-bad-input', 'elvis'], title: 'Null Instead of Throw', fileName: 'NullPattern.kt',
    solution: `fun main() {
  val fallback = 0
  val raw = listOf("5", "x", "7")
  var total = 0
  var bad = 0
  for (t in raw) {
    val n = t.toIntOrNull()
    if (n == null) {
      bad += 1
    }
    total += n ?: fallback
  }
  println("Total: " + total)
  println("Bad: " + bad)
}`,
    starter: `fun main() {
  val fallback = 0
  val raw = listOf("5", "x", "7")
  var total = 0
  var bad = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Bad text is expected here, so toIntOrNull gives null instead of throwing. 5 + 0 + 7 = 12 with one bad entry. With fallback 100: 112.
    expected: 'Total: 12\nBad: 1',
    swap: { variableName: 'fallback', originalLiteral: '0', alternateLiteral: '100', alternateExpected: 'Total: 112\nBad: 1' },
  },
  {
    id: 'result-pattern', difficulty: 'hard', tags: ['lesson:error-handling-patterns', 'result-pattern', 'fold', 'validation-rules'], title: 'Result Pattern', fileName: 'ResultPattern.kt',
    solution: `fun validate(qty: Int): Result<Int> {
  if (qty <= 0) {
    return Result.failure(IllegalArgumentException("qty must be positive"))
  }
  if (qty > 100) {
    return Result.failure(IllegalArgumentException("qty too big"))
  }
  return Result.success(qty * 2)
}

fun main() {
  val big = 150
  for (q in listOf(5, 0, big)) {
    println(validate(q).fold({ "ok " + it }, { "error " + it.message }))
  }
}`,
    starter: `// 1. TODO

fun main() {
  val big = 150

  // 2. TODO

  // 3. TODO
}`,
    // 5 gives ok 10; 0 fails the first rule; 150 fails the second. With big 20: ok 40.
    expected: 'ok 10\nerror qty must be positive\nerror qty too big',
    swap: { variableName: 'big', originalLiteral: '150', alternateLiteral: '20', alternateExpected: 'ok 10\nerror qty must be positive\nok 40' },
  },
  {
    id: 'log-the-error', difficulty: 'medium', tags: ['lesson:avoiding-swallowed-errors', 'logging-errors', 'catch', 'return-default'], title: 'Log the Error', fileName: 'LogTheError.kt',
    solution: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
    println("bad: " + e.message)
    return 0
  }
}

fun main() {
  val text = "zz"
  println(parse("12"))
  println(parse(text))
}`,
    starter: `// 1. TODO

fun main() {
  val text = "zz"

  // 2. TODO

  // 3. TODO
}`,
    // 12 parses. zz fails: the catch prints the reason and returns 0. With the text 7: 12 and 7.
    expected: '12\nbad: For input string: "zz"\n0',
    swap: { variableName: 'text', originalLiteral: '"zz"', alternateLiteral: '"7"', alternateExpected: '12\n7' },
  },
  {
    id: 'keep-the-cause', difficulty: 'hard', tags: ['lesson:avoiding-swallowed-errors', 'exception-cause', 'wrap-exception', 'message'], title: 'Keep the Cause', fileName: 'KeepTheCause.kt',
    solution: `fun load(text: String): Int {
  try {
    return text.toInt()
  } catch (e: NumberFormatException) {
    throw IllegalStateException("load failed", e)
  }
}

fun main() {
  val text = "q"
  try {
    println(load("4"))
    println(load(text))
  } catch (e: IllegalStateException) {
    println(e.message + " <- " + e.cause?.message)
  }
}`,
    starter: `// 1. TODO

fun main() {
  val text = "q"

  // 2. TODO

  // 3. TODO
}`,
    // load wraps the parse error and keeps it as the cause, so both messages can be printed. With the text 8: it prints 4 and 8.
    expected: '4\nload failed <- For input string: "q"',
    swap: { variableName: 'text', originalLiteral: '"q"', alternateLiteral: '"8"', alternateExpected: '4\n8' },
  },
  {
    id: 'clear-messages', difficulty: 'medium', tags: ['lesson:designing-meaningful-failure-paths', 'meaningful-message', 'validation', 'illegal-argument'], title: 'Clear Messages', fileName: 'ClearMessages.kt',
    solution: `fun checkOrder(items: Int, total: Int) {
  if (items <= 0) {
    throw IllegalArgumentException("order has no items")
  }
  if (total < 0) {
    throw IllegalArgumentException("order total " + total + " is negative")
  }
  println("order ok: " + items + " items, " + total)
}

fun main() {
  val items = 0
  try {
    checkOrder(2, 30)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
  try {
    checkOrder(3, -5)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
  try {
    checkOrder(items, 25)
  } catch (e: IllegalArgumentException) {
    println("error: " + e.message)
  }
}`,
    starter: `// 1. TODO

fun main() {
  val items = 0

  // 2. TODO

  // 3. TODO
}`,
    // Each failure says what is wrong and with which value. With items 4 the last order is fine.
    expected: 'order ok: 2 items, 30\nerror: order total -5 is negative\nerror: order has no items',
    swap: { variableName: 'items', originalLiteral: '0', alternateLiteral: '4', alternateExpected: 'order ok: 2 items, 30\nerror: order total -5 is negative\norder ok: 4 items, 25' },
  },
  {
    id: 'order-codes', difficulty: 'hard', tags: ['lesson:designing-meaningful-failure-paths', 'custom-exception', 'error-code', 'failure-paths'], title: 'Order Codes', fileName: 'OrderCodes.kt',
    solution: `class OrderError(val code: Int, message: String) : Exception(message)

fun process(qty: Int, stock: Int): Int {
  if (qty <= 0) {
    throw OrderError(1, "no items")
  }
  if (qty > stock) {
    throw OrderError(2, "need " + (qty - stock) + " more")
  }
  return stock - qty
}

fun main() {
  val stock = 5
  for (q in listOf(0, 8, 3)) {
    try {
      println("done " + process(q, stock))
    } catch (e: OrderError) {
      println("code " + e.code + ": " + e.message)
    }
  }
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val stock = 5

  // 3. TODO
}`,
    // 0 items is code 1; 8 is 3 more than the stock, code 2; 3 leaves 2. With stock 10: 8 leaves 2 and 3 leaves 7.
    expected: 'code 1: no items\ncode 2: need 3 more\ndone 2',
    swap: { variableName: 'stock', originalLiteral: '5', alternateLiteral: '10', alternateExpected: 'code 1: no items\ndone 2\ndone 7' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'unguarded-divide', tags: ['lesson:exceptions-try', 'try', 'catch', 'uncaught-exception'], title: 'Fix the Crash', bugType: 'runtime', bugLabel: 'Runtime Error: an exception is not caught, so the program stops', difficulty: 'medium',
    broken: `fun main() {
  println("a")
  val d = 0
  val x = 10 / d
  println("x " + x)
  println("end")
}`,
    fixed: `fun main() {
  println("a")
  val d = 0
  try {
    val x = 10 / d
    println("x " + x)
  } catch (e: ArithmeticException) {
    println("safe")
  }
  println("end")
}`,
    expected: 'a\nsafe\nend',
  },
  {
    id: 'wrong-catch', tags: ['lesson:catch', 'catch', 'exception-type'], title: 'Fix the Catch Type', bugType: 'runtime', bugLabel: 'Runtime Error: the catch is for a different exception', difficulty: 'medium',
    broken: `fun main() {
  try {
    val x = 10 / 0
    println(x)
  } catch (e: NumberFormatException) {
    println("caught " + e.message)
  }
}`,
    fixed: `fun main() {
  try {
    val x = 10 / 0
    println(x)
  } catch (e: ArithmeticException) {
    println("caught " + e.message)
  }
}`,
    expected: 'caught / by zero',
  },
  {
    id: 'skipped-cleanup', tags: ['lesson:finally', 'finally', 'early-return'], title: 'Fix the Cleanup', bugType: 'logic', bugLabel: 'Logic Error: an early return skips the close line', difficulty: 'hard',
    broken: `fun work(n: Int): String {
  println("open")
  if (n < 0) {
    return "negative"
  }
  println("close")
  return "done"
}

fun main() {
  println(work(-1))
}`,
    fixed: `fun work(n: Int): String {
  println("open")
  try {
    if (n < 0) {
      return "negative"
    }
    return "done"
  } finally {
    println("close")
  }
}

fun main() {
  println(work(-1))
}`,
    expected: 'open\nclose\nnegative',
  },
  {
    id: 'forgot-throw', tags: ['lesson:throw', 'throw', 'new-exception-not-thrown'], title: 'Fix the Missing Throw', bugType: 'logic', bugLabel: 'Logic Error: the exception is created but never thrown', difficulty: 'medium',
    broken: `fun check(age: Int) {
  if (age < 0) {
    IllegalArgumentException("negative")
  }
}

fun main() {
  try {
    check(-1)
    println("accepted")
  } catch (e: IllegalArgumentException) {
    println("rejected: " + e.message)
  }
}`,
    fixed: `fun check(age: Int) {
  if (age < 0) {
    throw IllegalArgumentException("negative")
  }
}

fun main() {
  try {
    check(-1)
    println("accepted")
  } catch (e: IllegalArgumentException) {
    println("rejected: " + e.message)
  }
}`,
    expected: 'rejected: negative',
  },
  {
    id: 'general-first', tags: ['lesson:multiple-catch-blocks', 'multiple-catch', 'catch-order'], title: 'Fix the Catch Order', bugType: 'logic', bugLabel: 'Logic Error: the general catch comes before the specific one', difficulty: 'hard',
    broken: `fun main() {
  try {
    throw IllegalArgumentException("a")
  } catch (e: Exception) {
    println("general " + e.message)
  } catch (e: IllegalArgumentException) {
    println("specific " + e.message)
  }
}`,
    fixed: `fun main() {
  try {
    throw IllegalArgumentException("a")
  } catch (e: IllegalArgumentException) {
    println("specific " + e.message)
  } catch (e: Exception) {
    println("general " + e.message)
  }
}`,
    expected: 'specific a',
  },
  {
    id: 'zero-fallback', tags: ['lesson:try-as-an-expression', 'try-expression', 'fallback-value'], title: 'Fix the Fallback', bugType: 'logic', bugLabel: 'Logic Error: the fallback looks like a real zero', difficulty: 'medium',
    broken: `fun parse(s: String): Int {
  return try {
    s.toInt()
  } catch (e: NumberFormatException) {
    0
  }
}

fun main() {
  println(parse("0"))
  println(parse("x"))
}`,
    fixed: `fun parse(s: String): Int {
  return try {
    s.toInt()
  } catch (e: NumberFormatException) {
    -1
  }
}

fun main() {
  println(parse("0"))
  println(parse("x"))
}`,
    expected: '0\n-1',
  },
  {
    id: 'silent-message', tags: ['lesson:custom-exceptions', 'custom-exception', 'message'], title: 'Fix the Empty Message', bugType: 'logic', bugLabel: 'Logic Error: the custom exception has no message', difficulty: 'medium',
    broken: `class NoStock(val item: String) : Exception()

fun main() {
  try {
    throw NoStock("pen")
  } catch (e: NoStock) {
    println("Error: " + e.message)
  }
}`,
    fixed: `class NoStock(val item: String) : Exception("no stock: " + item)

fun main() {
  try {
    throw NoStock("pen")
  } catch (e: NoStock) {
    println("Error: " + e.message)
  }
}`,
    expected: 'Error: no stock: pen',
  },
  {
    id: 'catch-too-wide', tags: ['lesson:checked-vs-unchecked-exception-model', 'specific-catch', 'index-out-of-bounds'], title: 'Fix the Wide Catch', bugType: 'logic', bugLabel: 'Logic Error: one wide catch gives the wrong reason', difficulty: 'hard',
    broken: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: Exception) {
    return "bad number"
  }
}

fun main() {
  val items = listOf("a", "b", "c")
  println(pick(items, "1"))
  println(pick(items, "7"))
}`,
    fixed: `fun pick(items: List<String>, text: String): String {
  try {
    return items[text.toInt()]
  } catch (e: NumberFormatException) {
    return "bad number"
  } catch (e: IndexOutOfBoundsException) {
    return "no such item"
  }
}

fun main() {
  val items = listOf("a", "b", "c")
  println(pick(items, "1"))
  println(pick(items, "7"))
}`,
    expected: 'b\nno such item',
  },
  {
    id: 'null-default', tags: ['lesson:result', 'result', 'getOrNull', 'getOrElse'], title: 'Fix the Missing Default', bugType: 'logic', bugLabel: 'Logic Error: a failed result gives null, not a default', difficulty: 'medium',
    broken: `fun main() {
  val r = runCatching { "x".toInt() }
  println("Value: " + r.getOrNull())
}`,
    fixed: `fun main() {
  val r = runCatching { "x".toInt() }
  println("Value: " + r.getOrElse { -1 })
}`,
    expected: 'Value: -1',
  },
  {
    id: 'map-skips-failure', tags: ['lesson:runcatching', 'runCatching', 'map-vs-recover'], title: 'Fix the Recovery', bugType: 'logic', bugLabel: 'Logic Error: map does not run for a failure', difficulty: 'hard',
    broken: `fun main() {
  val r = runCatching { "x".toInt() }.map { 0 }
  println("Value: " + r.getOrNull())
}`,
    fixed: `fun main() {
  val r = runCatching { "x".toInt() }.recover { 0 }
  println("Value: " + r.getOrNull())
}`,
    expected: 'Value: 0',
  },
  {
    id: 'inverted-check', tags: ['lesson:success-failure-handling', 'isSuccess', 'isFailure'], title: 'Fix the Check', bugType: 'logic', bugLabel: 'Logic Error: the success branch tests for failure', difficulty: 'medium',
    broken: `fun main() {
  val r = runCatching { "12".toInt() }
  if (r.isFailure) {
    println("ok " + r.getOrNull())
  } else {
    println("failed")
  }
}`,
    fixed: `fun main() {
  val r = runCatching { "12".toInt() }
  if (r.isSuccess) {
    println("ok " + r.getOrNull())
  } else {
    println("failed")
  }
}`,
    expected: 'ok 12',
  },
  {
    id: 'throw-for-normal', tags: ['lesson:error-handling-patterns', 'toIntOrNull', 'expected-bad-input'], title: 'Fix the Normal Case', bugType: 'runtime', bugLabel: 'Runtime Error: bad text is expected, but toInt throws', difficulty: 'hard',
    broken: `fun main() {
  var total = 0
  for (t in listOf("4", "x", "6")) {
    total += t.toInt()
  }
  println("Total: " + total)
}`,
    fixed: `fun main() {
  var total = 0
  for (t in listOf("4", "x", "6")) {
    total += t.toIntOrNull() ?: 0
  }
  println("Total: " + total)
}`,
    expected: 'Total: 10',
  },
  {
    id: 'empty-catch', tags: ['lesson:avoiding-swallowed-errors', 'swallowed-error', 'logging'], title: 'Fix the Silent Catch', bugType: 'logic', bugLabel: 'Logic Error: the catch block hides the error', difficulty: 'medium',
    broken: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
  }
  return 0
}

fun main() {
  println(parse("12"))
  println(parse("zz"))
}`,
    fixed: `fun parse(s: String): Int {
  try {
    return s.toInt()
  } catch (e: NumberFormatException) {
    println("bad: " + e.message)
  }
  return 0
}

fun main() {
  println(parse("12"))
  println(parse("zz"))
}`,
    expected: '12\nbad: For input string: "zz"\n0',
  },
  {
    id: 'vague-message', tags: ['lesson:designing-meaningful-failure-paths', 'meaningful-message', 'illegal-state'], title: 'Fix the Vague Message', bugType: 'logic', bugLabel: 'Logic Error: the message does not say what went wrong', difficulty: 'medium',
    broken: `fun ship(items: Int, id: Int) {
  if (items == 0) {
    throw IllegalStateException("error")
  }
  println("shipped " + id)
}

fun main() {
  try {
    ship(2, 7)
    ship(0, 8)
  } catch (e: IllegalStateException) {
    println(e.message)
  }
}`,
    fixed: `fun ship(items: Int, id: Int) {
  if (items == 0) {
    throw IllegalStateException("order " + id + " has no items")
  }
  println("shipped " + id)
}

fun main() {
  try {
    ship(2, 7)
    ship(0, 8)
  } catch (e: IllegalStateException) {
    println(e.message)
  }
}`,
    expected: 'shipped 7\norder 8 has no items',
  },
];
