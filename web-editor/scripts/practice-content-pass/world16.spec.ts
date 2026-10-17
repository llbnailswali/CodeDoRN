/**
 * World 16 (Coroutine Academy) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world16.real.ts` runs every solution and Debug program through real kotlinc with
 * kotlinx-coroutines. The simulator runs coroutines in a deterministic single-threaded queue with no timing, so every task here
 * avoids output that depends on delay() timing, cancelling a running coroutine, yield(), isActive, withTimeout or a
 * CoroutineExceptionHandler (PITFALLS.md). Wording lives in world16.data.ts.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'start-parent-child', difficulty: 'medium', tags: ['lesson:coroutine-fundamentals-coroutine-builder', 'runBlocking', 'launch', 'join', 'order'], title: 'Start, Parent, Child', fileName: 'StartParentChild.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val count = 2
  println("start")
  val job = launch {
    for (i in 1..count) {
      println("child " + i)
    }
  }
  println("parent")
  job.join()
  println("done")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val count = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // launch starts the child later, so parent prints before the child. join waits for the child, then done. With count 3 the child prints three lines.
    expected: 'start\nparent\nchild 1\nchild 2\ndone',
    swap: { variableName: 'count', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'start\nparent\nchild 1\nchild 2\nchild 3\ndone' },
  },
  {
    id: 'block-result', difficulty: 'hard', tags: ['lesson:coroutine-fundamentals-coroutine-builder', 'runBlocking', 'async', 'await', 'return-value'], title: 'Block Result', fileName: 'BlockResult.kt',
    solution: `import kotlinx.coroutines.*

fun main() {
  val base = 10
  val total = runBlocking {
    val a = async { base * 2 }
    val b = async { base + 1 }
    a.await() + b.await()
  }
  println("Total: " + total)
  val text = runBlocking {
    launch {
      println("child ran")
    }
    "finished"
  }
  println(text)
}`,
    starter: `import kotlinx.coroutines.*

fun main() {
  val base = 10

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The first runBlocking returns 20 + 11 = 31. The second returns finished, but only after its child has run. With base 5: 10 + 6 = 16.
    expected: 'Total: 31\nchild ran\nfinished',
    swap: { variableName: 'base', originalLiteral: '10', alternateLiteral: '5', alternateExpected: 'Total: 16\nchild ran\nfinished' },
  },
  {
    id: 'three-launches', difficulty: 'medium', tags: ['lesson:launch-async', 'launch', 'join', 'shared-list'], title: 'Three Launches', fileName: 'ThreeLaunches.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "three"
  val log = mutableListOf<String>()
  val j1 = launch { log.add("one") }
  val j2 = launch { log.add("two") }
  val j3 = launch { log.add(extra) }
  j1.join()
  j2.join()
  j3.join()
  println("Log: $log")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "three"
  val log = mutableListOf<String>()

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The three coroutines run in the order they were launched and add one, two and the extra text. With extra tres: one, two, tres.
    expected: 'Log: [one, two, three]',
    swap: { variableName: 'extra', originalLiteral: '"three"', alternateLiteral: '"tres"', alternateExpected: 'Log: [one, two, tres]' },
  },
  {
    id: 'async-squares', difficulty: 'hard', tags: ['lesson:launch-async', 'async', 'await', 'map', 'sumOf'], title: 'Async Squares', fileName: 'AsyncSquares.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3
  val jobs = (1..n).map { k -> async { k * k } }
  val values = jobs.map { it.await() }
  val total = jobs.sumOf { it.await() }
  println("Values: $values")
  println("Total: " + total)
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Squares of 1, 2, 3 are 1, 4, 9 and add up to 14. With n 4: 1, 4, 9, 16 and 30.
    expected: 'Values: [1, 4, 9]\nTotal: 14',
    swap: { variableName: 'n', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Values: [1, 4, 9, 16]\nTotal: 30' },
  },
  {
    id: 'seq-vs-par', difficulty: 'medium', tags: ['lesson:await-suspending-functions', 'suspend', 'delay', 'sequential', 'parallel'], title: 'Sequential or Parallel', fileName: 'SeqVsPar.kt',
    solution: `import kotlinx.coroutines.*

suspend fun first(base: Int): Int {
  delay(100)
  return base
}

suspend fun second(base: Int): Int {
  delay(100)
  return base * 2
}

fun main() = runBlocking {
  val base = 5
  val sequential = first(base) + second(base)
  val a = async { first(base) }
  val b = async { second(base) }
  val parallel = a.await() + b.await()
  println("Sequential: " + sequential)
  println("Parallel: " + parallel)
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

// 2. TODO

fun main() = runBlocking {
  val base = 5

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Both ways give 5 + 10 = 15. The sequential way waits for first and then second; the parallel way starts both and then waits. With base 7: 21.
    expected: 'Sequential: 15\nParallel: 15',
    swap: { variableName: 'base', originalLiteral: '5', alternateLiteral: '7', alternateExpected: 'Sequential: 21\nParallel: 21' },
  },
  {
    id: 'await-order', difficulty: 'hard', tags: ['lesson:await-suspending-functions', 'async', 'await', 'order-of-prints'], title: 'Await Order', fileName: 'AwaitOrder.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val x = 1
  val a = async {
    println("a runs")
    x
  }
  val b = async {
    println("b runs")
    x + 1
  }
  println("created")
  println(b.await())
  println(a.await())
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val x = 1

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The async blocks start when main waits, in the order they were created: created, a runs, b runs. Then b is awaited first (2), then a (1). With x 5: 6 and 5.
    expected: 'created\na runs\nb runs\n2\n1',
    swap: { variableName: 'x', originalLiteral: '1', alternateLiteral: '5', alternateExpected: 'created\na runs\nb runs\n6\n5' },
  },
  {
    id: 'suspend-chain', difficulty: 'medium', tags: ['lesson:suspend-coroutine-context', 'suspend-function', 'delay', 'calling-suspend'], title: 'Suspend Chain', fileName: 'SuspendChain.kt',
    solution: `import kotlinx.coroutines.*

suspend fun load(n: Int): Int {
  delay(10)
  return n * 2
}

suspend fun total(a: Int, b: Int): Int {
  return load(a) + load(b)
}

fun main() = runBlocking {
  val x = 4
  println(load(x))
  println(total(x, x + 1))
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

// 2. TODO

fun main() = runBlocking {
  val x = 4

  // 3. TODO

  // 4. TODO
}`,
    // load(4) is 8. total(4, 5) is 8 + 10 = 18. With x 6: 12 and 12 + 14 = 26.
    expected: '8\n18',
    swap: { variableName: 'x', originalLiteral: '4', alternateLiteral: '6', alternateExpected: '12\n26' },
  },
  {
    id: 'with-context', difficulty: 'hard', tags: ['lesson:suspend-coroutine-context', 'withContext', 'Dispatchers.Default', 'async-with-context'], title: 'With Context', fileName: 'WithContext.kt',
    solution: `import kotlinx.coroutines.*

suspend fun compute(n: Int): Int {
  return withContext(Dispatchers.Default) {
    n * n
  }
}

fun main() = runBlocking {
  val n = 5
  println(compute(n))
  val a = async(Dispatchers.Default) { compute(n - 2) }
  println(a.await() + 1)
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

fun main() = runBlocking {
  val n = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // compute(5) is 25. compute(3) is 9 and adding 1 gives 10. With n 6: 36 and 16 + 1 = 17.
    expected: '25\n10',
    swap: { variableName: 'n', originalLiteral: '5', alternateLiteral: '6', alternateExpected: '36\n17' },
  },
  {
    id: 'job-states', difficulty: 'medium', tags: ['lesson:dispatchers-jobs', 'Job', 'isActive', 'isCompleted', 'join'], title: 'Job States', fileName: 'JobStates.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3
  val job = launch {
    println("count " + n)
  }
  println("Active: " + job.isActive)
  job.join()
  println("Active: " + job.isActive)
  println("Completed: " + job.isCompleted)
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The job is active before the child runs. join lets it run, and then it is not active and it is completed. With n 7: count 7.
    expected: 'Active: true\ncount 3\nActive: false\nCompleted: true',
    swap: { variableName: 'n', originalLiteral: '3', alternateLiteral: '7', alternateExpected: 'Active: true\ncount 7\nActive: false\nCompleted: true' },
  },
  {
    id: 'dispatch-work', difficulty: 'hard', tags: ['lesson:dispatchers-jobs', 'Dispatchers.Default', 'Dispatchers.IO', 'withContext'], title: 'Dispatch the Work', fileName: 'DispatchWork.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val base = 10
  val a = withContext(Dispatchers.Default) { base * 2 }
  val b = withContext(Dispatchers.IO) { base + 3 }
  println("Default: " + a)
  println("IO: " + b)
  println("Sum: " + (a + b))
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val base = 10

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The Default block gives 20 and the IO block gives 13; the sum is 33. With base 4: 8, 7 and 15.
    expected: 'Default: 20\nIO: 13\nSum: 33',
    swap: { variableName: 'base', originalLiteral: '10', alternateLiteral: '4', alternateExpected: 'Default: 8\nIO: 7\nSum: 15' },
  },
  {
    id: 'cancel-before-start', difficulty: 'medium', tags: ['lesson:cancellation-cooperative-cancellation', 'cancel', 'join', 'isCancelled'], title: 'Cancel Before Start', fileName: 'CancelBeforeStart.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3
  val job = launch {
    println("never")
  }
  val other = launch {
    println("other " + n)
  }
  job.cancel()
  job.join()
  other.join()
  println("Cancelled: " + job.isCancelled)
  println("Other done: " + other.isCompleted)
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The first job is cancelled before it starts, so never does not print. The other job runs when main waits for it. With n 7: other 7.
    expected: 'other 3\nCancelled: true\nOther done: true',
    swap: { variableName: 'n', originalLiteral: '3', alternateLiteral: '7', alternateExpected: 'other 7\nCancelled: true\nOther done: true' },
  },
  {
    id: 'cleanup-on-cancel', difficulty: 'hard', tags: ['lesson:cancellation-cooperative-cancellation', 'cancelAndJoin', 'finally', 'cleanup'], title: 'Cleanup on Cancel', fileName: 'CleanupOnCancel.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val note = "closed"
  val job = launch {
    try {
      delay(1000)
    } finally {
      println("cleanup " + note)
    }
  }
  delay(50)
  job.cancelAndJoin()
  println("done")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val note = "closed"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The job waits in delay. When it is cancelled, the finally block still runs and prints the note, and then main prints done. With note saved: cleanup saved.
    expected: 'cleanup closed\ndone',
    swap: { variableName: 'note', originalLiteral: '"closed"', alternateLiteral: '"saved"', alternateExpected: 'cleanup saved\ndone' },
  },
  {
    id: 'wait-for-children', difficulty: 'medium', tags: ['lesson:structured-concurrency', 'coroutineScope', 'structured-concurrency', 'launch'], title: 'Wait for Children', fileName: 'WaitForChildren.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 2
  coroutineScope {
    launch {
      delay(100)
      println("child " + n)
    }
    println("scope body")
  }
  println("after scope")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The scope body finishes first, but coroutineScope waits for its child before it ends: scope body, child 2, after scope. With n 5: child 5.
    expected: 'scope body\nchild 2\nafter scope',
    swap: { variableName: 'n', originalLiteral: '2', alternateLiteral: '5', alternateExpected: 'scope body\nchild 5\nafter scope' },
  },
  {
    id: 'nested-launch', difficulty: 'hard', tags: ['lesson:structured-concurrency', 'nested-launch', 'order-of-prints', 'parent-child'], title: 'Nested Launch', fileName: 'NestedLaunch.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val label = "x"
  launch {
    println("outer start")
    launch {
      println("inner " + label)
    }
    println("outer end")
  }
  println("main")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val label = "x"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // main prints first. Then the outer child runs: outer start, outer end. The inner child runs after the outer one has finished its own lines. With label y: inner y.
    expected: 'main\nouter start\nouter end\ninner x',
    swap: { variableName: 'label', originalLiteral: '"x"', alternateLiteral: '"y"', alternateExpected: 'main\nouter start\nouter end\ninner y' },
  },
  {
    id: 'scope-sum', difficulty: 'medium', tags: ['lesson:coroutinescope', 'coroutineScope', 'async', 'suspend-function'], title: 'Scope Sum', fileName: 'ScopeSum.kt',
    solution: `import kotlinx.coroutines.*

suspend fun work(a: Int, b: Int): Int = coroutineScope {
  val x = async { a * 2 }
  val y = async { b * 3 }
  x.await() + y.await()
}

fun main() = runBlocking {
  val a = 4
  println("Result: " + work(a, 5))
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

fun main() = runBlocking {
  val a = 4

  // 2. TODO

  // 3. TODO
}`,
    // 4 * 2 is 8 and 5 * 3 is 15, so the result is 23. With a 10: 20 + 15 = 35.
    expected: 'Result: 23',
    swap: { variableName: 'a', originalLiteral: '4', alternateLiteral: '10', alternateExpected: 'Result: 35' },
  },
  {
    id: 'scope-catch', difficulty: 'hard', tags: ['lesson:coroutinescope', 'coroutineScope', 'exception', 'try-catch'], title: 'Scope Catch', fileName: 'ScopeCatch.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val reason = "x"
  val k = 2
  try {
    coroutineScope {
      launch {
        throw IllegalStateException(reason)
      }
    }
  } catch (e: IllegalStateException) {
    println("caught " + e.message)
  }
  println("after")
  val v = coroutineScope { 5 + k }
  println("Value: " + v)
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val reason = "x"
  val k = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // A failing child makes coroutineScope throw, and the try catches it. The program goes on. The next scope works and gives 5 + 2 = 7. With reason y: caught y.
    expected: 'caught x\nafter\nValue: 7',
    swap: { variableName: 'reason', originalLiteral: '"x"', alternateLiteral: '"y"', alternateExpected: 'caught y\nafter\nValue: 7' },
  },
  {
    id: 'one-fails', difficulty: 'medium', tags: ['lesson:supervisorscope', 'supervisorScope', 'launch', 'joinAll'], title: 'One Fails', fileName: 'OneFails.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "c"
  val results = mutableListOf<String>()
  supervisorScope {
    val a = launch {
      throw IllegalStateException("a")
    }
    val b = launch {
      results.add("b")
    }
    val c = launch {
      results.add(extra)
    }
    joinAll(a, b, c)
  }
  println("Results: $results")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "c"
  val results = mutableListOf<String>()

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // In a supervisorScope the failure of a does not cancel b and c. They add b and c. With extra z: b and z.
    expected: 'Results: [b, c]',
    swap: { variableName: 'extra', originalLiteral: '"c"', alternateLiteral: '"z"', alternateExpected: 'Results: [b, z]' },
  },
  {
    id: 'supervised-await', difficulty: 'hard', tags: ['lesson:supervisorscope', 'supervisorScope', 'async', 'await', 'try-catch'], title: 'Supervised Await', fileName: 'SupervisedAwait.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val k = 4
  supervisorScope {
    val bad = async {
      check(false) { "boom" }
      0
    }
    val good = async { k * 2 }
    try {
      bad.await()
    } catch (e: IllegalStateException) {
      println("caught " + e.message)
    }
    println("good " + good.await())
  }
  println("end")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val k = 4

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The bad async fails, and await throws into the try, which prints caught boom. The good async is not affected: 4 * 2 is 8. With k 6: good 12.
    expected: 'caught boom\ngood 8\nend',
    swap: { variableName: 'k', originalLiteral: '4', alternateLiteral: '6', alternateExpected: 'caught boom\ngood 12\nend' },
  },
  {
    id: 'try-inside-launch', difficulty: 'medium', tags: ['lesson:exception-handling-in-coroutines', 'try-catch', 'launch', 'exception'], title: 'Try Inside Launch', fileName: 'TryInsideLaunch.kt',
    solution: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val msg = "inside"
  val job = launch {
    try {
      throw IllegalStateException(msg)
    } catch (e: IllegalStateException) {
      println("handled " + e.message)
    }
  }
  job.join()
  println("done")
}`,
    starter: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val msg = "inside"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The try is inside the coroutine, so the exception is handled there and the program goes on. With msg oops: handled oops.
    expected: 'handled inside\ndone',
    swap: { variableName: 'msg', originalLiteral: '"inside"', alternateLiteral: '"oops"', alternateExpected: 'handled oops\ndone' },
  },
  {
    id: 'retry', difficulty: 'hard', tags: ['lesson:exception-handling-in-coroutines', 'suspend-function', 'retry', 'try-catch'], title: 'Retry', fileName: 'Retry.kt',
    solution: `import kotlinx.coroutines.*

suspend fun risky(n: Int, limit: Int): Int {
  delay(10)
  if (n < limit) {
    throw IllegalStateException("try " + n)
  }
  return n * 10
}

fun main() = runBlocking {
  val limit = 3
  var n = 1
  while (true) {
    try {
      println("result " + risky(n, limit))
      break
    } catch (e: IllegalStateException) {
      println("fail " + e.message)
      n += 1
    }
  }
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

fun main() = runBlocking {
  val limit = 3
  var n = 1

  // 2. TODO

  // 3. TODO
}`,
    // Attempts 1 and 2 fail and print their message. Attempt 3 works and gives 30. With limit 2: one failure, then 20.
    expected: 'fail try 1\nfail try 2\nresult 30',
    swap: { variableName: 'limit', originalLiteral: '3', alternateLiteral: '2', alternateExpected: 'fail try 1\nresult 20' },
  },
  {
    id: 'parallel-load', difficulty: 'medium', tags: ['lesson:coroutine-best-practices', 'async', 'awaitAll', 'parallel'], title: 'Parallel Load', fileName: 'ParallelLoad.kt',
    solution: `import kotlinx.coroutines.*

suspend fun load(id: Int, mult: Int): Int {
  delay(50)
  return id * mult
}

fun main() = runBlocking {
  val mult = 10
  val ids = listOf(1, 2, 3)
  val results = ids.map { id -> async { load(id, mult) } }.awaitAll()
  println("Results: $results")
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

fun main() = runBlocking {
  val mult = 10
  val ids = listOf(1, 2, 3)

  // 2. TODO

  // 3. TODO
}`,
    // Each id is loaded in its own async and awaitAll collects 10, 20, 30. With mult 5: 5, 10, 15.
    expected: 'Results: [10, 20, 30]',
    swap: { variableName: 'mult', originalLiteral: '10', alternateLiteral: '5', alternateExpected: 'Results: [5, 10, 15]' },
  },
  {
    id: 'scoped-work', difficulty: 'hard', tags: ['lesson:coroutine-best-practices', 'coroutineScope', 'launch', 'suspend-function', 'structured-concurrency'], title: 'Scoped Work', fileName: 'ScopedWork.kt',
    solution: `import kotlinx.coroutines.*

suspend fun runAll(n: Int): List<Int> {
  val out = mutableListOf<Int>()
  coroutineScope {
    for (i in 1..n) {
      launch {
        out.add(i * i)
      }
    }
  }
  return out
}

fun main() = runBlocking {
  val n = 3
  val squares = runAll(n)
  println("Squares: $squares")
  println("Count: " + squares.size)
}`,
    starter: `import kotlinx.coroutines.*

// 1. TODO

fun main() = runBlocking {
  val n = 3

  // 2. TODO

  // 3. TODO
}`,
    // coroutineScope waits for all workers, so the list is complete when runAll returns: 1, 4, 9. With n 4: 1, 4, 9, 16 and a count of 4.
    expected: 'Squares: [1, 4, 9]\nCount: 3',
    swap: { variableName: 'n', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Squares: [1, 4, 9, 16]\nCount: 4' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'no-join', tags: ['lesson:coroutine-fundamentals-coroutine-builder', 'launch', 'join', 'order'], title: 'Fix the Missing Join', bugType: 'logic', bugLabel: 'Logic Error: the parent finishes before the child runs', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  launch {
    println("child")
  }
  println("done")
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("child")
  }
  job.join()
  println("done")
}`,
    expected: 'child\ndone',
  },
  {
    id: 'missing-await', tags: ['lesson:launch-async', 'async', 'await', 'sum'], title: 'Fix the Missing Await', bugType: 'logic', bugLabel: 'Logic Error: one async value is never read', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val a = async { 20 }
  val b = async { 22 }
  println("Total: " + a.await())
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val a = async { 20 }
  val b = async { 22 }
  println("Total: " + (a.await() + b.await()))
}`,
    expected: 'Total: 42',
  },
  {
    id: 'suspend-from-main', tags: ['lesson:await-suspending-functions', 'suspend-function', 'runBlocking'], title: 'Fix the Suspend Call', bugType: 'type', bugLabel: 'Compile Error: a suspend function is called outside a coroutine', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

suspend fun load(): Int {
  delay(10)
  return 5
}

fun main() {
  println(load())
}`,
    fixed: `import kotlinx.coroutines.*

suspend fun load(): Int {
  delay(10)
  return 5
}

fun main() = runBlocking {
  println(load())
}`,
    expected: '5',
  },
  {
    id: 'dropped-result', tags: ['lesson:suspend-coroutine-context', 'withContext', 'return-value'], title: 'Fix the Dropped Result', bugType: 'logic', bugLabel: 'Logic Error: the value of withContext is thrown away', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

suspend fun compute(n: Int): Int {
  withContext(Dispatchers.Default) {
    n * n
  }
  return 0
}

fun main() = runBlocking {
  println("Result: " + compute(5))
}`,
    fixed: `import kotlinx.coroutines.*

suspend fun compute(n: Int): Int {
  return withContext(Dispatchers.Default) {
    n * n
  }
}

fun main() = runBlocking {
  println("Result: " + compute(5))
}`,
    expected: 'Result: 25',
  },
  {
    id: 'not-joined', tags: ['lesson:dispatchers-jobs', 'Job', 'isCompleted', 'join'], title: 'Fix the Early Check', bugType: 'logic', bugLabel: 'Logic Error: the job state is read before the job has run', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("work")
  }
  println("Completed: " + job.isCompleted)
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("work")
  }
  job.join()
  println("Completed: " + job.isCompleted)
}`,
    expected: 'work\nCompleted: true',
  },
  {
    id: 'wrong-flag', tags: ['lesson:cancellation-cooperative-cancellation', 'cancel', 'isCancelled', 'isActive'], title: 'Fix the Cancel Check', bugType: 'logic', bugLabel: 'Logic Error: isActive is read where isCancelled is needed', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("never")
  }
  job.cancel()
  job.join()
  println("Cancelled: " + job.isActive)
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("never")
  }
  job.cancel()
  job.join()
  println("Cancelled: " + job.isCancelled)
}`,
    expected: 'Cancelled: true',
  },
  {
    id: 'early-print', tags: ['lesson:structured-concurrency', 'coroutineScope', 'structured-concurrency', 'order'], title: 'Fix the Early Print', bugType: 'logic', bugLabel: 'Logic Error: the list is printed inside the scope, before the child runs', difficulty: 'hard',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  coroutineScope {
    launch {
      out.add(1)
    }
    println(out)
  }
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  coroutineScope {
    launch {
      out.add(1)
    }
  }
  println(out)
}`,
    expected: '[1]',
  },
  {
    id: 'uncaught-scope', tags: ['lesson:coroutinescope', 'coroutineScope', 'exception', 'try-catch'], title: 'Fix the Uncaught Failure', bugType: 'runtime', bugLabel: 'Runtime Error: the failure of a child is not caught', difficulty: 'hard',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  coroutineScope {
    launch {
      throw IllegalStateException("fail")
    }
  }
  println("after")
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  try {
    coroutineScope {
      launch {
        throw IllegalStateException("fail")
      }
    }
  } catch (e: IllegalStateException) {
    println("caught " + e.message)
  }
  println("after")
}`,
    expected: 'caught fail\nafter',
  },
  {
    id: 'await-no-catch', tags: ['lesson:supervisorscope', 'supervisorScope', 'async', 'await'], title: 'Fix the Rethrown Failure', bugType: 'runtime', bugLabel: 'Runtime Error: await throws and nothing catches it', difficulty: 'hard',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  supervisorScope {
    val bad = async {
      check(false) { "boom" }
      0
    }
    val good = async { 8 }
    bad.await()
    println("good " + good.await())
  }
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  supervisorScope {
    val bad = async {
      check(false) { "boom" }
      0
    }
    val good = async { 8 }
    try {
      bad.await()
    } catch (e: IllegalStateException) {
      println("caught " + e.message)
    }
    println("good " + good.await())
  }
}`,
    expected: 'caught boom\ngood 8',
  },
  {
    id: 'try-outside-launch', tags: ['lesson:exception-handling-in-coroutines', 'try-catch', 'launch', 'exception'], title: 'Fix the Try Placement', bugType: 'runtime', bugLabel: 'Runtime Error: the try is around launch, not inside it', difficulty: 'hard',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  try {
    launch {
      throw IllegalStateException("x")
    }
  } catch (e: IllegalStateException) {
    println("caught")
  }
  println("end")
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  launch {
    try {
      throw IllegalStateException("x")
    } catch (e: IllegalStateException) {
      println("caught")
    }
  }
  println("end")
}`,
    expected: 'end\ncaught',
  },
  {
    id: 'read-too-early', tags: ['lesson:coroutine-best-practices', 'launch', 'joinAll', 'shared-list'], title: 'Fix the Early Read', bugType: 'logic', bugLabel: 'Logic Error: the list is read before the workers have run', difficulty: 'medium',
    broken: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  val jobs = (1..3).map { i ->
    launch {
      out.add(i * i)
    }
  }
  println(out)
}`,
    fixed: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  val jobs = (1..3).map { i ->
    launch {
      out.add(i * i)
    }
  }
  jobs.joinAll()
  println(out)
}`,
    expected: '[1, 4, 9]',
  },
];
