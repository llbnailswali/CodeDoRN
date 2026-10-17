import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 16 -- Coroutine Academy (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-4 dependent steps; the coroutine feature (launch, async, join, suspend, withContext, a scope ...) is named in the step.
//   hard   -- several features together, the order of lines from several coroutines, an exception that travels through a scope,
//             or a value that depends on waiting for the right job; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world16.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc with kotlinx-coroutines (scripts/practice-content-pass/world16.real.ts). The simulator runs
// coroutines in a deterministic single-threaded queue, so no task depends on delay() timing, cancelling a running coroutine,
// yield(), isActive, withTimeout or a CoroutineExceptionHandler (PITFALLS.md).

export const WORLD_16_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-16-practice-writerun-start-parent-child',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Launch a child coroutine, and see that the parent goes on first until it joins.',
    conceptTags: ['lesson:coroutine-fundamentals-coroutine-builder', 'runBlocking', 'launch', 'join', 'order'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Start, Parent, Child',
    goal: 'Start a child coroutine that prints some lines. Print a line before it, a line after you start it, and a line when it is done.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Print the start.** Print "start":\n"start"\n\n' +
              '2. **Launch the child.** Create `val job` with `launch { ... }`. Inside, loop `i` from `1` to `count`. Each time, print "child " plus `i`.\n\n' +
              '3. **Print the parent line.** Print "parent". The child has not run yet:\n"parent"\n\n' +
              '4. **Wait and finish.** Call `job.join()`. Then print "done":\n"child 1"\n"child 2"\n"done"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the start.** Print "start".',
          '2. **Launch the child.** Print `i` in a loop.',
          '3. **Print the parent line.** Print "parent".',
          '4. **Wait and finish.** Use `join()`, then print "done".',
        ],
        comments: [
          '// 1. Print the start. Print "start".',
          '// 2. Launch the child. Print i in a loop.',
          '// 3. Print the parent line. Print "parent".',
          '// 4. Wait and finish. Use join(), then print "done".',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the start.**',
          '2. **Launch the child.**',
          '3. **Print the parent line.**',
          '4. **Wait and finish.**',
        ],
        comments: [
          '// 1. Print the start.',
          '// 2. Launch the child.',
          '// 3. Print the parent line.',
          '// 4. Wait and finish.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StartParentChild.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val count = 2

  // 1. Print the start. Print "start": "start"

  // 2. Launch the child. Create val job with launch { ... }. Inside, loop i from 1 to count. Each time, print "child " plus i.

  // 3. Print the parent line. Print "parent". The child has not run yet: "parent"

  // 4. Wait and finish. Call job.join(). Then print "done": "child 1" "child 2" "done"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'start\nparent\nchild 1\nchild 2\ndone',
    testCase: { call: '', expected: 'start\nparent\nchild 1\nchild 2\ndone' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'start\nparent\nchild 1\nchild 2\nchild 3\ndone',
    },
  },
  {
    id: 'world-16-practice-writerun-block-result',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'See that runBlocking gives back a value, and that it waits for its children first.',
    conceptTags: ['lesson:coroutine-fundamentals-coroutine-builder', 'runBlocking', 'async', 'await', 'return-value'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Block Result',
    goal: 'Use runBlocking to work out a total with two async values. Then use it again with a child that prints. Print what each one gives back.',
    description: '1. **Work out the total.** Create `val total` with `runBlocking { ... }`. Inside, create `val a` with `async { base * 2 }` and `val b` with `async { base + 1 }`. The last line is `a.await() + b.await()`.\n\n' +
              '2. **Print the total.** Print "Total: " plus `total`:\n"Total: 31"\n\n' +
              '3. **Use a child.** Create `val text` with `runBlocking { ... }`. Inside, call `launch { ... }` that prints "child ran". The last line is the text "finished".\n\n' +
              '4. **Print the text.** Print `text`. The child ran before `runBlocking` gave the text back:\n"child ran"\n"finished"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Work out the total.** Use two `async` values.',
          '2. **Print the total.** Show `total`.',
          '3. **Use a child.** Use `launch`, and end with "finished".',
          '4. **Print the text.** Show `text`.',
        ],
        comments: [
          '// 1. Work out the total. Use two async values.',
          '// 2. Print the total. Show total.',
          '// 3. Use a child. Use launch, and end with "finished".',
          '// 4. Print the text. Show text.',
        ],
      },
      experienced: {
        steps: [
          '1. **Work out the total.**',
          '2. **Print the total.**',
          '3. **Use a child.**',
          '4. **Print the text.**',
        ],
        comments: [
          '// 1. Work out the total.',
          '// 2. Print the total.',
          '// 3. Use a child.',
          '// 4. Print the text.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BlockResult.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() {
  val base = 10

  // 1. Work out the total. Create val total with runBlocking { ... }. Inside, create val a with async { base * 2 } and val b with async { base + 1 }. The last line is a.await() + b.await().

  // 2. Print the total. Print "Total: " plus total: "Total: 31"

  // 3. Use a child. Create val text with runBlocking { ... }. Inside, call launch { ... } that prints "child ran". The last line is the text "finished".

  // 4. Print the text. Print text. The child ran before runBlocking gave the text back: "child ran" "finished"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Total: 31\nchild ran\nfinished',
    testCase: { call: '', expected: 'Total: 31\nchild ran\nfinished' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '10', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Total: 16\nchild ran\nfinished',
    },
  },
  {
    id: 'world-16-practice-writerun-three-launches',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Launch three coroutines that add to a list, join them, and print the list.',
    conceptTags: ['lesson:launch-async', 'launch', 'join', 'shared-list'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Three Launches',
    goal: 'Start three coroutines. Each adds a text to one list. Wait for all three, then print the list.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch the first two.** Create `val j1` with `launch { log.add("one") }`. Create `val j2` with `launch { log.add("two") }`.\n\n' +
              '2. **Launch the third.** Create `val j3` with `launch { log.add(extra) }`.\n\n' +
              '3. **Wait for all.** Call `join()` on `j1`, then `j2`, then `j3`.\n\n' +
              '4. **Print the list.** Use a string template:\n"Log: [one, two, three]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch the first two.** Add "one" and "two".',
          '2. **Launch the third.** Add `extra`.',
          '3. **Wait for all.** Join the three jobs.',
          '4. **Print the list.** Show `log`.',
        ],
        comments: [
          '// 1. Launch the first two. Add "one" and "two".',
          '// 2. Launch the third. Add extra.',
          '// 3. Wait for all. Join the three jobs.',
          '// 4. Print the list. Show log.',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch the first two.**',
          '2. **Launch the third.**',
          '3. **Wait for all.**',
          '4. **Print the list.**',
        ],
        comments: [
          '// 1. Launch the first two.',
          '// 2. Launch the third.',
          '// 3. Wait for all.',
          '// 4. Print the list.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ThreeLaunches.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "three"
  val log = mutableListOf<String>()

  // 1. Launch the first two. Create val j1 with launch { log.add("one") }. Create val j2 with launch { log.add("two") }.

  // 2. Launch the third. Create val j3 with launch { log.add(extra) }.

  // 3. Wait for all. Call join() on j1, then j2, then j3.

  // 4. Print the list. Use a string template: "Log: [one, two, three]"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Log: [one, two, three]',
    testCase: { call: '', expected: 'Log: [one, two, three]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '"three"', alternateLiteral: '"tres"' }],
      alternateExpectedOutput: 'Log: [one, two, tres]',
    },
  },
  {
    id: 'world-16-practice-writerun-async-squares',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Start many async coroutines, and collect their values with await.',
    conceptTags: ['lesson:launch-async', 'async', 'await', 'map', 'sumOf'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Async Squares',
    goal: 'Square the numbers from 1 to n, each in its own coroutine. Print the values and their total.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start the coroutines.** Create `val jobs` with `(1..n).map { k -> async { ... } }`. Inside `async`, return `k * k`.\n\n' +
              '2. **Collect the values.** Create `val values` with `jobs.map { it.await() }`. Create `val total` with `jobs.sumOf { it.await() }`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"Values: [1, 4, 9]"\n"Total: 14"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the coroutines.** One `async` for each number.',
          '2. **Collect the values.** Use `await()` and `sumOf`.',
          '3. **Print two lines.** Show the values and the total.',
        ],
        comments: [
          '// 1. Start the coroutines. One async for each number.',
          '// 2. Collect the values. Use await() and sumOf.',
          '// 3. Print two lines. Show the values and the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the coroutines.**',
          '2. **Collect the values.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Start the coroutines.',
          '// 2. Collect the values.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AsyncSquares.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. Start the coroutines. Create val jobs with (1..n).map { k -> async { ... } }. Inside async, return k * k.

  // 2. Collect the values. Create val values with jobs.map { it.await() }. Create val total with jobs.sumOf { it.await() }.

  // 3. Print two lines. Use a string template for the list: "Values: [1, 4, 9]" "Total: 14"
}`,
    solutionCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3
  val jobs = (1..n).map { k -> async { k * k } }
  val values = jobs.map { it.await() }
  val total = jobs.sumOf { it.await() }
  println("Values: $values")
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Values: [1, 4, 9]\nTotal: 14',
    testCase: { call: '', expected: 'Values: [1, 4, 9]\nTotal: 14' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Values: [1, 4, 9, 16]\nTotal: 30',
    },
  },
  {
    id: 'world-16-practice-writerun-seq-vs-par',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Call two suspend functions one after another, and then at the same time with async.',
    conceptTags: ['lesson:await-suspending-functions', 'suspend', 'delay', 'sequential', 'parallel'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Sequential or Parallel',
    goal: 'Write two suspend functions that wait a little. Use them one after another, and then in parallel. Print both sums.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the two functions above `main`.\n\n' +
              '1. **Write first.** Above `main`, write `suspend fun first(base: Int): Int`. Call `delay(100)`, then return `base`.\n\n' +
              '2. **Write second.** Write `suspend fun second(base: Int): Int`. Call `delay(100)`, then return `base * 2`.\n\n' +
              '3. **Call them in sequence.** Create `val sequential` as `first(base) + second(base)`.\n\n' +
              '4. **Call them in parallel.** Create `val a` with `async { first(base) }` and `val b` with `async { second(base) }`. Create `val parallel` as `a.await() + b.await()`.\n\n' +
              '5. **Print two lines.** Join the text with `+`:\n"Sequential: 15"\n"Parallel: 15"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write first.** Wait, then return `base`.',
          '2. **Write second.** Wait, then return `base * 2`.',
          '3. **Call them in sequence.** Add the two results.',
          '4. **Call them in parallel.** Use `async` and `await`.',
          '5. **Print two lines.** Show both sums.',
        ],
        comments: [
          '// 1. Write first. Wait, then return base.',
          '// 2. Write second. Wait, then return base * 2.',
          '// 3. Call them in sequence. Add the two results.',
          '// 4. Call them in parallel. Use async and await.',
          '// 5. Print two lines. Show both sums.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write first.**',
          '2. **Write second.**',
          '3. **Call them in sequence.**',
          '4. **Call them in parallel.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write first.',
          '// 2. Write second.',
          '// 3. Call them in sequence.',
          '// 4. Call them in parallel.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SeqVsPar.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write first. Above main, write suspend fun first(base: Int): Int. Call delay(100), then return base.

// 2. Write second. Write suspend fun second(base: Int): Int. Call delay(100), then return base * 2.

fun main() = runBlocking {
  val base = 5

  // 3. Call them in sequence. Create val sequential as first(base) + second(base).

  // 4. Call them in parallel. Create val a with async { first(base) } and val b with async { second(base) }. Create val parallel as a.await() + b.await().

  // 5. Print two lines. Join the text with +: "Sequential: 15" "Parallel: 15"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Sequential: 15\nParallel: 15',
    testCase: { call: '', expected: 'Sequential: 15\nParallel: 15' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '5', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Sequential: 21\nParallel: 21',
    },
  },
  {
    id: 'world-16-practice-writerun-await-order',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'See when async blocks run, and in which order you can await them.',
    conceptTags: ['lesson:await-suspending-functions', 'async', 'await', 'order-of-prints'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Await Order',
    goal: 'Start two async blocks that print a line. Print "created" after you start them. Then read the second value first and the first value second.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start a.** Create `val a` with `async { ... }`. Inside, print "a runs". The last line is `x`.\n\n' +
              '2. **Start b.** Create `val b` with `async { ... }`. Inside, print "b runs". The last line is `x + 1`.\n\n' +
              '3. **Print created.** Print "created". Neither block has run yet:\n"created"\n\n' +
              '4. **Await in the other order.** Print `b.await()`, then print `a.await()`:\n"a runs"\n"b runs"\n"2"\n"1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start a.** Print, then return `x`.',
          '2. **Start b.** Print, then return `x + 1`.',
          '3. **Print created.** Print "created".',
          '4. **Await in the other order.** `b` first, then `a`.',
        ],
        comments: [
          '// 1. Start a. Print, then return x.',
          '// 2. Start b. Print, then return x + 1.',
          '// 3. Print created. Print "created".',
          '// 4. Await in the other order. b first, then a.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start a.**',
          '2. **Start b.**',
          '3. **Print created.**',
          '4. **Await in the other order.**',
        ],
        comments: [
          '// 1. Start a.',
          '// 2. Start b.',
          '// 3. Print created.',
          '// 4. Await in the other order.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AwaitOrder.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val x = 1

  // 1. Start a. Create val a with async { ... }. Inside, print "a runs". The last line is x.

  // 2. Start b. Create val b with async { ... }. Inside, print "b runs". The last line is x + 1.

  // 3. Print created. Print "created". Neither block has run yet: "created"

  // 4. Await in the other order. Print b.await(), then print a.await(): "a runs" "b runs" "2" "1"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'created\na runs\nb runs\n2\n1',
    testCase: { call: '', expected: 'created\na runs\nb runs\n2\n1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'x', originalLiteral: '1', alternateLiteral: '5' }],
      alternateExpectedOutput: 'created\na runs\nb runs\n6\n5',
    },
  },
  {
    id: 'world-16-practice-writerun-suspend-chain',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Write suspend functions that call each other and call them from a coroutine.',
    conceptTags: ['lesson:suspend-coroutine-context', 'suspend-function', 'delay', 'calling-suspend'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Suspend Chain',
    goal: 'Write a suspend function that doubles a number after a short wait. Write another that uses it twice. Print both results.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the two functions above `main`.\n\n' +
              '1. **Write load.** Above `main`, write `suspend fun load(n: Int): Int`. Call `delay(10)`, then return `n * 2`.\n\n' +
              '2. **Write total.** Write `suspend fun total(a: Int, b: Int): Int`. Return `load(a) + load(b)`.\n\n' +
              '3. **Call load.** Print `load(x)`:\n"8"\n\n' +
              '4. **Call total.** Print `total(x, x + 1)`:\n"18"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write load.** Wait, then double.',
          '2. **Write total.** Add two calls of `load`.',
          '3. **Call load.** Use `x`.',
          '4. **Call total.** Use `x` and `x + 1`.',
        ],
        comments: [
          '// 1. Write load. Wait, then double.',
          '// 2. Write total. Add two calls of load.',
          '// 3. Call load. Use x.',
          '// 4. Call total. Use x and x + 1.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write load.**',
          '2. **Write total.**',
          '3. **Call load.**',
          '4. **Call total.**',
        ],
        comments: [
          '// 1. Write load.',
          '// 2. Write total.',
          '// 3. Call load.',
          '// 4. Call total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SuspendChain.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write load. Above main, write suspend fun load(n: Int): Int. Call delay(10), then return n * 2.

// 2. Write total. Write suspend fun total(a: Int, b: Int): Int. Return load(a) + load(b).

fun main() = runBlocking {
  val x = 4

  // 3. Call load. Print load(x): "8"

  // 4. Call total. Print total(x, x + 1): "18"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: '8\n18',
    testCase: { call: '', expected: '8\n18' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'x', originalLiteral: '4', alternateLiteral: '6' }],
      alternateExpectedOutput: '12\n26',
    },
  },
  {
    id: 'world-16-practice-writerun-with-context',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Use withContext to run work on another dispatcher and get its value back.',
    conceptTags: ['lesson:suspend-coroutine-context', 'withContext', 'Dispatchers.Default', 'async-with-context'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'With Context',
    goal: 'Write a suspend function that squares a number on the Default dispatcher. Use it directly, and from an async block.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.\n\n' +
              '1. **Write compute.** Above `main`, write `suspend fun compute(n: Int): Int`. Return `withContext(Dispatchers.Default) { ... }`. Inside the block, return `n * n`.\n\n' +
              '2. **Call it directly.** Print `compute(n)`:\n"25"\n\n' +
              '3. **Call it from async.** Create `val a` with `async(Dispatchers.Default) { compute(n - 2) }`.\n\n' +
              '4. **Print the result.** Print `a.await() + 1`:\n"10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write compute.** Use `withContext` and `n * n`.',
          '2. **Call it directly.** Use `n`.',
          '3. **Call it from async.** Use `n - 2`.',
          '4. **Print the result.** Await and add `1`.',
        ],
        comments: [
          '// 1. Write compute. Use withContext and n * n.',
          '// 2. Call it directly. Use n.',
          '// 3. Call it from async. Use n - 2.',
          '// 4. Print the result. Await and add 1.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write compute.**',
          '2. **Call it directly.**',
          '3. **Call it from async.**',
          '4. **Print the result.**',
        ],
        comments: [
          '// 1. Write compute.',
          '// 2. Call it directly.',
          '// 3. Call it from async.',
          '// 4. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WithContext.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write compute. Above main, write suspend fun compute(n: Int): Int. Return withContext(Dispatchers.Default) { ... }. Inside the block, return n * n.

fun main() = runBlocking {
  val n = 5

  // 2. Call it directly. Print compute(n): "25"

  // 3. Call it from async. Create val a with async(Dispatchers.Default) { compute(n - 2) }.

  // 4. Print the result. Print a.await() + 1: "10"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: '25\n10',
    testCase: { call: '', expected: '25\n10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '5', alternateLiteral: '6' }],
      alternateExpectedOutput: '36\n17',
    },
  },
  {
    id: 'world-16-practice-writerun-job-states',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Read the state of a job before and after it runs.',
    conceptTags: ['lesson:dispatchers-jobs', 'Job', 'isActive', 'isCompleted', 'join'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Job States',
    goal: 'Launch a job and check if it is active. Wait for it, and check again. Also check if it is completed.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch the job.** Create `val job` with `launch { ... }`. Inside, print "count " plus `n`.\n\n' +
              '2. **Check before.** Print "Active: " plus `job.isActive`. The job has not run yet:\n"Active: true"\n\n' +
              '3. **Wait for it.** Call `job.join()`. The child prints its line:\n"count 3"\n\n' +
              '4. **Check after.** Print "Active: " plus `job.isActive`, then "Completed: " plus `job.isCompleted`:\n"Active: false"\n"Completed: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch the job.** Print `n` inside.',
          '2. **Check before.** Print `job.isActive`.',
          '3. **Wait for it.** Use `join()`.',
          '4. **Check after.** Print `isActive` and `isCompleted`.',
        ],
        comments: [
          '// 1. Launch the job. Print n inside.',
          '// 2. Check before. Print job.isActive.',
          '// 3. Wait for it. Use join().',
          '// 4. Check after. Print isActive and isCompleted.',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch the job.**',
          '2. **Check before.**',
          '3. **Wait for it.**',
          '4. **Check after.**',
        ],
        comments: [
          '// 1. Launch the job.',
          '// 2. Check before.',
          '// 3. Wait for it.',
          '// 4. Check after.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'JobStates.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. Launch the job. Create val job with launch { ... }. Inside, print "count " plus n.

  // 2. Check before. Print "Active: " plus job.isActive. The job has not run yet: "Active: true"

  // 3. Wait for it. Call job.join(). The child prints its line: "count 3"

  // 4. Check after. Print "Active: " plus job.isActive, then "Completed: " plus job.isCompleted: "Active: false" "Completed: true"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Active: true\ncount 3\nActive: false\nCompleted: true',
    testCase: { call: '', expected: 'Active: true\ncount 3\nActive: false\nCompleted: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '3', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Active: true\ncount 7\nActive: false\nCompleted: true',
    },
  },
  {
    id: 'world-16-practice-writerun-dispatch-work',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Run two pieces of work on two dispatchers with withContext, and add the results.',
    conceptTags: ['lesson:dispatchers-jobs', 'Dispatchers.Default', 'Dispatchers.IO', 'withContext'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Dispatch the Work',
    goal: 'Do one calculation on the Default dispatcher and one on the IO dispatcher. Print both results and their sum.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Run on Default.** Create `val a` with `withContext(Dispatchers.Default) { ... }`. Return `base * 2`.\n\n' +
              '2. **Run on IO.** Create `val b` with `withContext(Dispatchers.IO) { ... }`. Return `base + 3`.\n\n' +
              '3. **Print three lines.** Join the text with `+`:\n"Default: 20"\n"IO: 13"\n"Sum: 33"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Run on Default.** Return `base * 2`.',
          '2. **Run on IO.** Return `base + 3`.',
          '3. **Print three lines.** Show both and the sum.',
        ],
        comments: [
          '// 1. Run on Default. Return base * 2.',
          '// 2. Run on IO. Return base + 3.',
          '// 3. Print three lines. Show both and the sum.',
        ],
      },
      experienced: {
        steps: [
          '1. **Run on Default.**',
          '2. **Run on IO.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Run on Default.',
          '// 2. Run on IO.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DispatchWork.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val base = 10

  // 1. Run on Default. Create val a with withContext(Dispatchers.Default) { ... }. Return base * 2.

  // 2. Run on IO. Create val b with withContext(Dispatchers.IO) { ... }. Return base + 3.

  // 3. Print three lines. Join the text with +: "Default: 20" "IO: 13" "Sum: 33"
}`,
    solutionCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val base = 10
  val a = withContext(Dispatchers.Default) { base * 2 }
  val b = withContext(Dispatchers.IO) { base + 3 }
  println("Default: " + a)
  println("IO: " + b)
  println("Sum: " + (a + b))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Default: 20\nIO: 13\nSum: 33',
    testCase: { call: '', expected: 'Default: 20\nIO: 13\nSum: 33' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '10', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Default: 8\nIO: 7\nSum: 15',
    },
  },
  {
    id: 'world-16-practice-writerun-cancel-before-start',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Cancel a job before it runs, and check its state after join.',
    conceptTags: ['lesson:cancellation-cooperative-cancellation', 'cancel', 'join', 'isCancelled'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Cancel Before Start',
    goal: 'Launch two jobs. Cancel the first one at once. Wait for both and print their states.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch the first job.** Create `val job` with `launch { ... }`. Inside, print "never".\n\n' +
              '2. **Launch the other job.** Create `val other` with `launch { ... }`. Inside, print "other " plus `n`.\n\n' +
              '3. **Cancel and wait.** Call `job.cancel()`. Then call `job.join()` and `other.join()`:\n"other 3"\n\n' +
              '4. **Print the states.** Print "Cancelled: " plus `job.isCancelled`. Print "Other done: " plus `other.isCompleted`:\n"Cancelled: true"\n"Other done: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch the first job.** Print "never".',
          '2. **Launch the other job.** Print `n`.',
          '3. **Cancel and wait.** Cancel `job`, then join both.',
          '4. **Print the states.** Show `isCancelled` and `isCompleted`.',
        ],
        comments: [
          '// 1. Launch the first job. Print "never".',
          '// 2. Launch the other job. Print n.',
          '// 3. Cancel and wait. Cancel job, then join both.',
          '// 4. Print the states. Show isCancelled and isCompleted.',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch the first job.**',
          '2. **Launch the other job.**',
          '3. **Cancel and wait.**',
          '4. **Print the states.**',
        ],
        comments: [
          '// 1. Launch the first job.',
          '// 2. Launch the other job.',
          '// 3. Cancel and wait.',
          '// 4. Print the states.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CancelBeforeStart.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 3

  // 1. Launch the first job. Create val job with launch { ... }. Inside, print "never".

  // 2. Launch the other job. Create val other with launch { ... }. Inside, print "other " plus n.

  // 3. Cancel and wait. Call job.cancel(). Then call job.join() and other.join(): "other 3"

  // 4. Print the states. Print "Cancelled: " plus job.isCancelled. Print "Other done: " plus other.isCompleted: "Cancelled: true" "Other done: true"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'other 3\nCancelled: true\nOther done: true',
    testCase: { call: '', expected: 'other 3\nCancelled: true\nOther done: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '3', alternateLiteral: '7' }],
      alternateExpectedOutput: 'other 7\nCancelled: true\nOther done: true',
    },
  },
  {
    id: 'world-16-practice-writerun-cleanup-on-cancel',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Use finally in a coroutine so cleanup runs when the job is cancelled.',
    conceptTags: ['lesson:cancellation-cooperative-cancellation', 'cancelAndJoin', 'finally', 'cleanup'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Cleanup on Cancel',
    goal: 'Start a job that waits a long time. Cancel it, and check that its cleanup line still prints before the program says done.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch the job.** Create `val job` with `launch { ... }`. Inside, write `try { delay(1000) }`.\n\n' +
              '2. **Add the cleanup.** Add `finally { ... }`. Inside, print "cleanup " plus `note`.\n\n' +
              '3. **Cancel it.** Call `delay(50)` so the job starts. Then call `job.cancelAndJoin()`. Then print "done":\n"cleanup closed"\n"done"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch the job.** Wait in a `try`.',
          '2. **Add the cleanup.** Print in `finally`.',
          '3. **Cancel it.** Use `cancelAndJoin()`, then print "done".',
        ],
        comments: [
          '// 1. Launch the job. Wait in a try.',
          '// 2. Add the cleanup. Print in finally.',
          '// 3. Cancel it. Use cancelAndJoin(), then print "done".',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch the job.**',
          '2. **Add the cleanup.**',
          '3. **Cancel it.**',
        ],
        comments: [
          '// 1. Launch the job.',
          '// 2. Add the cleanup.',
          '// 3. Cancel it.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CleanupOnCancel.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val note = "closed"

  // 1. Launch the job. Create val job with launch { ... }. Inside, write try { delay(1000) }.

  // 2. Add the cleanup. Add finally { ... }. Inside, print "cleanup " plus note.

  // 3. Cancel it. Call delay(50) so the job starts. Then call job.cancelAndJoin(). Then print "done": "cleanup closed" "done"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'cleanup closed\ndone',
    testCase: { call: '', expected: 'cleanup closed\ndone' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'note', originalLiteral: '"closed"', alternateLiteral: '"saved"' }],
      alternateExpectedOutput: 'cleanup saved\ndone',
    },
  },
  {
    id: 'world-16-practice-writerun-wait-for-children',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'See that coroutineScope waits for its child before it ends.',
    conceptTags: ['lesson:structured-concurrency', 'coroutineScope', 'structured-concurrency', 'launch'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Wait for Children',
    goal: 'Start a child inside a coroutineScope. Print a line in the scope and a line after it. See that the child finishes before the scope ends.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start the scope.** Write `coroutineScope { ... }`. Inside, call `launch { ... }`. In the child, call `delay(100)`, then print "child " plus `n`.\n\n' +
              '2. **Print the body line.** Still inside the scope, after the `launch`, print "scope body":\n"scope body"\n"child 2"\n\n' +
              '3. **Print after the scope.** After the scope, print "after scope":\n"after scope"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the scope.** Launch a child in `coroutineScope`.',
          '2. **Print the body line.** Print "scope body".',
          '3. **Print after the scope.** Print "after scope".',
        ],
        comments: [
          '// 1. Start the scope. Launch a child in coroutineScope.',
          '// 2. Print the body line. Print "scope body".',
          '// 3. Print after the scope. Print "after scope".',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the scope.**',
          '2. **Print the body line.**',
          '3. **Print after the scope.**',
        ],
        comments: [
          '// 1. Start the scope.',
          '// 2. Print the body line.',
          '// 3. Print after the scope.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WaitForChildren.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val n = 2

  // 1. Start the scope. Write coroutineScope { ... }. Inside, call launch { ... }. In the child, call delay(100), then print "child " plus n.

  // 2. Print the body line. Still inside the scope, after the launch, print "scope body": "scope body" "child 2"

  // 3. Print after the scope. After the scope, print "after scope": "after scope"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'scope body\nchild 2\nafter scope',
    testCase: { call: '', expected: 'scope body\nchild 2\nafter scope' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '2', alternateLiteral: '5' }],
      alternateExpectedOutput: 'scope body\nchild 5\nafter scope',
    },
  },
  {
    id: 'world-16-practice-writerun-nested-launch',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Launch a coroutine inside a coroutine and follow the order of the lines.',
    conceptTags: ['lesson:structured-concurrency', 'nested-launch', 'order-of-prints', 'parent-child'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Nested Launch',
    goal: 'Launch an outer coroutine that launches an inner one. Print lines in all three places. See the order.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch the outer coroutine.** Write `launch { ... }`. Inside, print "outer start".\n\n' +
              '2. **Launch the inner coroutine.** Still inside the outer one, call `launch { ... }`. In the inner one, print "inner " plus `label`. After it, print "outer end".\n\n' +
              '3. **Print the main line.** After the outer `launch`, print "main":\n"main"\n"outer start"\n"outer end"\n"inner x"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch the outer coroutine.** Print "outer start".',
          '2. **Launch the inner coroutine.** Print `label`, then "outer end".',
          '3. **Print the main line.** Print "main".',
        ],
        comments: [
          '// 1. Launch the outer coroutine. Print "outer start".',
          '// 2. Launch the inner coroutine. Print label, then "outer end".',
          '// 3. Print the main line. Print "main".',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch the outer coroutine.**',
          '2. **Launch the inner coroutine.**',
          '3. **Print the main line.**',
        ],
        comments: [
          '// 1. Launch the outer coroutine.',
          '// 2. Launch the inner coroutine.',
          '// 3. Print the main line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NestedLaunch.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val label = "x"

  // 1. Launch the outer coroutine. Write launch { ... }. Inside, print "outer start".

  // 2. Launch the inner coroutine. Still inside the outer one, call launch { ... }. In the inner one, print "inner " plus label. After it, print "outer end".

  // 3. Print the main line. After the outer launch, print "main": "main" "outer start" "outer end" "inner x"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'main\nouter start\nouter end\ninner x',
    testCase: { call: '', expected: 'main\nouter start\nouter end\ninner x' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'label', originalLiteral: '"x"', alternateLiteral: '"y"' }],
      alternateExpectedOutput: 'main\nouter start\nouter end\ninner y',
    },
  },
  {
    id: 'world-16-practice-writerun-scope-sum',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Write a suspend function that uses coroutineScope to run two async blocks.',
    conceptTags: ['lesson:coroutinescope', 'coroutineScope', 'async', 'suspend-function'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Scope Sum',
    goal: 'Write a suspend function that runs two calculations at the same time and adds them. Call it and print the result.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.\n\n' +
              '1. **Write work.** Above `main`, write `suspend fun work(a: Int, b: Int): Int = coroutineScope { ... }`. Inside, create `val x` with `async { a * 2 }` and `val y` with `async { b * 3 }`. The last line is `x.await() + y.await()`.\n\n' +
              '2. **Call it.** Create `val result` with `work(a, 5)`.\n\n' +
              '3. **Print the result.** Print "Result: " plus `result`:\n"Result: 23"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write work.** Use `coroutineScope` and two `async` blocks.',
          '2. **Call it.** Use `a` and `5`.',
          '3. **Print the result.** Show `result`.',
        ],
        comments: [
          '// 1. Write work. Use coroutineScope and two async blocks.',
          '// 2. Call it. Use a and 5.',
          '// 3. Print the result. Show result.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write work.**',
          '2. **Call it.**',
          '3. **Print the result.**',
        ],
        comments: [
          '// 1. Write work.',
          '// 2. Call it.',
          '// 3. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScopeSum.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write work. Above main, write suspend fun work(a: Int, b: Int): Int = coroutineScope { ... }. Inside, create val x with async { a * 2 } and val y with async { b * 3 }. The last line is x.await() + y.await().

fun main() = runBlocking {
  val a = 4

  // 2. Call it. Create val result with work(a, 5).

  // 3. Print the result. Print "Result: " plus result: "Result: 23"
}`,
    solutionCode: `import kotlinx.coroutines.*

suspend fun work(a: Int, b: Int): Int = coroutineScope {
  val x = async { a * 2 }
  val y = async { b * 3 }
  x.await() + y.await()
}

fun main() = runBlocking {
  val a = 4
  println("Result: " + work(a, 5))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Result: 23',
    testCase: { call: '', expected: 'Result: 23' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'a', originalLiteral: '4', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Result: 35',
    },
  },
  {
    id: 'world-16-practice-writerun-scope-catch',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Catch the failure of a child outside its coroutineScope, and go on with a new scope.',
    conceptTags: ['lesson:coroutinescope', 'coroutineScope', 'exception', 'try-catch'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Scope Catch',
    goal: 'A child coroutine fails inside a scope. Catch the failure outside the scope and go on. Then use a scope that works.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start the try.** Write `try { ... }`. Inside, write `coroutineScope { ... }`.\n\n' +
              '2. **Fail inside.** In the scope, call `launch { ... }`. Inside, throw `IllegalStateException(reason)`.\n\n' +
              '3. **Catch it.** Add `catch (e: IllegalStateException)`. Print "caught " plus `e.message`. After the `try`, print "after":\n"caught x"\n"after"\n\n' +
              '4. **Use a good scope.** Create `val v` with `coroutineScope { 5 + k }`. Print "Value: " plus `v`:\n"Value: 7"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the try.** Put `coroutineScope` in it.',
          '2. **Fail inside.** Throw in a child.',
          '3. **Catch it.** Print the message, then "after".',
          '4. **Use a good scope.** Return `5 + k`.',
        ],
        comments: [
          '// 1. Start the try. Put coroutineScope in it.',
          '// 2. Fail inside. Throw in a child.',
          '// 3. Catch it. Print the message, then "after".',
          '// 4. Use a good scope. Return 5 + k.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the try.**',
          '2. **Fail inside.**',
          '3. **Catch it.**',
          '4. **Use a good scope.**',
        ],
        comments: [
          '// 1. Start the try.',
          '// 2. Fail inside.',
          '// 3. Catch it.',
          '// 4. Use a good scope.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScopeCatch.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val reason = "x"
  val k = 2

  // 1. Start the try. Write try { ... }. Inside, write coroutineScope { ... }.

  // 2. Fail inside. In the scope, call launch { ... }. Inside, throw IllegalStateException(reason).

  // 3. Catch it. Add catch (e: IllegalStateException). Print "caught " plus e.message. After the try, print "after": "caught x" "after"

  // 4. Use a good scope. Create val v with coroutineScope { 5 + k }. Print "Value: " plus v: "Value: 7"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'caught x\nafter\nValue: 7',
    testCase: { call: '', expected: 'caught x\nafter\nValue: 7' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'reason', originalLiteral: '"x"', alternateLiteral: '"y"' }],
      alternateExpectedOutput: 'caught y\nafter\nValue: 7',
    },
  },
  {
    id: 'world-16-practice-writerun-one-fails',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Use supervisorScope so that one failing child does not stop the others.',
    conceptTags: ['lesson:supervisorscope', 'supervisorScope', 'launch', 'joinAll'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'One Fails',
    goal: 'Start three children in a supervisorScope. The first one fails. Show that the other two still do their work.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start the scope and the failing child.** Write `supervisorScope { ... }`. Inside, create `val a` with `launch { ... }`. Throw `IllegalStateException("a")`.\n\n' +
              '2. **Start the other two.** Create `val b` with `launch { results.add("b") }`. Create `val c` with `launch { results.add(extra) }`.\n\n' +
              '3. **Wait and print.** Call `joinAll(a, b, c)` inside the scope. After the scope, print the list with a string template:\n"Results: [b, c]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the scope and the failing child.** `a` throws.',
          '2. **Start the other two.** Add "b" and `extra`.',
          '3. **Wait and print.** Use `joinAll`, then print `results`.',
        ],
        comments: [
          '// 1. Start the scope and the failing child. a throws.',
          '// 2. Start the other two. Add "b" and extra.',
          '// 3. Wait and print. Use joinAll, then print results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the scope and the failing child.**',
          '2. **Start the other two.**',
          '3. **Wait and print.**',
        ],
        comments: [
          '// 1. Start the scope and the failing child.',
          '// 2. Start the other two.',
          '// 3. Wait and print.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OneFails.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val extra = "c"
  val results = mutableListOf<String>()

  // 1. Start the scope and the failing child. Write supervisorScope { ... }. Inside, create val a with launch { ... }. Throw IllegalStateException("a").

  // 2. Start the other two. Create val b with launch { results.add("b") }. Create val c with launch { results.add(extra) }.

  // 3. Wait and print. Call joinAll(a, b, c) inside the scope. After the scope, print the list with a string template: "Results: [b, c]"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Results: [b, c]',
    testCase: { call: '', expected: 'Results: [b, c]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '"c"', alternateLiteral: '"z"' }],
      alternateExpectedOutput: 'Results: [b, z]',
    },
  },
  {
    id: 'world-16-practice-writerun-supervised-await',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Catch the failure of an async value in a supervisorScope, while another async value still works.',
    conceptTags: ['lesson:supervisorscope', 'supervisorScope', 'async', 'await', 'try-catch'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Supervised Await',
    goal: 'Start two async values. One fails. Catch its failure when you read it, and still read the good one.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Start the scope and the bad value.** Write `supervisorScope { ... }`. Inside, create `val bad` with `async { ... }`. Inside, call `check(false) { "boom" }`, then return `0`.\n\n' +
              '2. **Start the good value.** Create `val good` with `async { k * 2 }`.\n\n' +
              '3. **Catch the failure.** Write `try { bad.await() }`. Add `catch (e: IllegalStateException)`. Print "caught " plus `e.message`.\n\n' +
              '4. **Read the good value.** Still in the scope, print "good " plus `good.await()`. After the scope, print "end":\n"caught boom"\n"good 8"\n"end"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Start the scope and the bad value.** It fails with `check`.',
          '2. **Start the good value.** Return `k * 2`.',
          '3. **Catch the failure.** Await `bad` in a `try`.',
          '4. **Read the good value.** Print it, then "end".',
        ],
        comments: [
          '// 1. Start the scope and the bad value. It fails with check.',
          '// 2. Start the good value. Return k * 2.',
          '// 3. Catch the failure. Await bad in a try.',
          '// 4. Read the good value. Print it, then "end".',
        ],
      },
      experienced: {
        steps: [
          '1. **Start the scope and the bad value.**',
          '2. **Start the good value.**',
          '3. **Catch the failure.**',
          '4. **Read the good value.**',
        ],
        comments: [
          '// 1. Start the scope and the bad value.',
          '// 2. Start the good value.',
          '// 3. Catch the failure.',
          '// 4. Read the good value.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SupervisedAwait.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val k = 4

  // 1. Start the scope and the bad value. Write supervisorScope { ... }. Inside, create val bad with async { ... }. Inside, call check(false) { "boom" }, then return 0.

  // 2. Start the good value. Create val good with async { k * 2 }.

  // 3. Catch the failure. Write try { bad.await() }. Add catch (e: IllegalStateException). Print "caught " plus e.message.

  // 4. Read the good value. Still in the scope, print "good " plus good.await(). After the scope, print "end": "caught boom" "good 8" "end"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'caught boom\ngood 8\nend',
    testCase: { call: '', expected: 'caught boom\ngood 8\nend' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'k', originalLiteral: '4', alternateLiteral: '6' }],
      alternateExpectedOutput: 'caught boom\ngood 12\nend',
    },
  },
  {
    id: 'world-16-practice-writerun-try-inside-launch',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Put the try and catch inside the coroutine so the failure is handled there.',
    conceptTags: ['lesson:exception-handling-in-coroutines', 'try-catch', 'launch', 'exception'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Try Inside Launch',
    goal: 'A coroutine throws an exception. Handle it inside the same coroutine, so the program goes on as normal.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.\n\n' +
              '1. **Launch with a try.** Create `val job` with `launch { ... }`. Inside, write `try { ... }`. In the try, throw `IllegalStateException(msg)`.\n\n' +
              '2. **Handle it.** Add `catch (e: IllegalStateException)`. Print "handled " plus `e.message`.\n\n' +
              '3. **Wait and finish.** Call `job.join()`, then print "done":\n"handled inside"\n"done"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Launch with a try.** Throw inside the `try`.',
          '2. **Handle it.** Print the message.',
          '3. **Wait and finish.** Use `join()`, then print "done".',
        ],
        comments: [
          '// 1. Launch with a try. Throw inside the try.',
          '// 2. Handle it. Print the message.',
          '// 3. Wait and finish. Use join(), then print "done".',
        ],
      },
      experienced: {
        steps: [
          '1. **Launch with a try.**',
          '2. **Handle it.**',
          '3. **Wait and finish.**',
        ],
        comments: [
          '// 1. Launch with a try.',
          '// 2. Handle it.',
          '// 3. Wait and finish.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TryInsideLaunch.kt',
    initialCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val msg = "inside"

  // 1. Launch with a try. Create val job with launch { ... }. Inside, write try { ... }. In the try, throw IllegalStateException(msg).

  // 2. Handle it. Add catch (e: IllegalStateException). Print "handled " plus e.message.

  // 3. Wait and finish. Call job.join(), then print "done": "handled inside" "done"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'handled inside\ndone',
    testCase: { call: '', expected: 'handled inside\ndone' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'msg', originalLiteral: '"inside"', alternateLiteral: '"oops"' }],
      alternateExpectedOutput: 'handled oops\ndone',
    },
  },
  {
    id: 'world-16-practice-writerun-retry',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Write a suspend function that can fail, and retry it in a loop until it works.',
    conceptTags: ['lesson:exception-handling-in-coroutines', 'suspend-function', 'retry', 'try-catch'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Retry',
    goal: 'A function fails for small numbers. Call it again with a bigger number each time, until it works. Print each failure and the result.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. `limit` and `n` are declared in `main`. Write the function above `main`.\n\n' +
              '1. **Write risky.** Above `main`, write `suspend fun risky(n: Int, limit: Int): Int`. Call `delay(10)`. When `n < limit`, throw `IllegalStateException("try " + n)`. Otherwise return `n * 10`.\n\n' +
              '2. **Write the loop.** Write `while (true) { ... }`. Inside, write `try { ... }`. Print "result " plus `risky(n, limit)`, then `break`.\n\n' +
              '3. **Retry on failure.** Add `catch (e: IllegalStateException)`. Print "fail " plus `e.message`. Add `1` to `n`:\n"fail try 1"\n"fail try 2"\n"result 30"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write risky.** Throw for `n < limit`.',
          '2. **Write the loop.** Try, print, break.',
          '3. **Retry on failure.** Print the failure, add `1` to `n`.',
        ],
        comments: [
          '// 1. Write risky. Throw for n < limit.',
          '// 2. Write the loop. Try, print, break.',
          '// 3. Retry on failure. Print the failure, add 1 to n.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write risky.**',
          '2. **Write the loop.**',
          '3. **Retry on failure.**',
        ],
        comments: [
          '// 1. Write risky.',
          '// 2. Write the loop.',
          '// 3. Retry on failure.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Retry.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write risky. Above main, write suspend fun risky(n: Int, limit: Int): Int. Call delay(10). When n < limit, throw IllegalStateException("try " + n). Otherwise return n * 10.

fun main() = runBlocking {
  val limit = 3
  var n = 1

  // 2. Write the loop. Write while (true) { ... }. Inside, write try { ... }. Print "result " plus risky(n, limit), then break.

  // 3. Retry on failure. Add catch (e: IllegalStateException). Print "fail " plus e.message. Add 1 to n: "fail try 1" "fail try 2" "result 30"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'fail try 1\nfail try 2\nresult 30',
    testCase: { call: '', expected: 'fail try 1\nfail try 2\nresult 30' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '3', alternateLiteral: '2' }],
      alternateExpectedOutput: 'fail try 1\nresult 20',
    },
  },
  {
    id: 'world-16-practice-writerun-parallel-load',
    worldId: 'world-16',
    difficulty: 'medium',
    summary: 'Load many items at the same time with async, and collect them with awaitAll.',
    conceptTags: ['lesson:coroutine-best-practices', 'async', 'awaitAll', 'parallel'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Parallel Load',
    goal: 'Load three items in parallel, each in its own coroutine. Collect the results in one list and print it.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.\n\n' +
              '1. **Write load.** Above `main`, write `suspend fun load(id: Int, mult: Int): Int`. Call `delay(50)`, then return `id * mult`.\n\n' +
              '2. **Load them all.** Create `val results` with `ids.map { id -> async { ... } }.awaitAll()`. Inside `async`, return `load(id, mult)`.\n\n' +
              '3. **Print the results.** Use a string template:\n"Results: [10, 20, 30]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write load.** Wait, then return `id * mult`.',
          '2. **Load them all.** Use `async` and `awaitAll()`.',
          '3. **Print the results.** Show `results`.',
        ],
        comments: [
          '// 1. Write load. Wait, then return id * mult.',
          '// 2. Load them all. Use async and awaitAll().',
          '// 3. Print the results. Show results.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write load.**',
          '2. **Load them all.**',
          '3. **Print the results.**',
        ],
        comments: [
          '// 1. Write load.',
          '// 2. Load them all.',
          '// 3. Print the results.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ParallelLoad.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write load. Above main, write suspend fun load(id: Int, mult: Int): Int. Call delay(50), then return id * mult.

fun main() = runBlocking {
  val mult = 10
  val ids = listOf(1, 2, 3)

  // 2. Load them all. Create val results with ids.map { id -> async { ... } }.awaitAll(). Inside async, return load(id, mult).

  // 3. Print the results. Use a string template: "Results: [10, 20, 30]"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Results: [10, 20, 30]',
    testCase: { call: '', expected: 'Results: [10, 20, 30]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'mult', originalLiteral: '10', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Results: [5, 10, 15]',
    },
  },
  {
    id: 'world-16-practice-writerun-scoped-work',
    worldId: 'world-16',
    difficulty: 'hard',
    summary: 'Write a function that starts workers in a coroutineScope and returns when all are done.',
    conceptTags: ['lesson:coroutine-best-practices', 'coroutineScope', 'launch', 'suspend-function', 'structured-concurrency'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Scoped Work',
    goal: 'Write a function that starts one worker for each number, and returns the full list of results. Print the list and its size.',
    description: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.\n\n' +
              '1. **Write runAll.** Above `main`, write `suspend fun runAll(n: Int): List<Int>`. Create `val out = mutableListOf<Int>()`. In a `coroutineScope { ... }`, loop `i` from `1` to `n`. Each time, call `launch { out.add(i * i) }`. After the scope, return `out`.\n\n' +
              '2. **Call it.** Create `val squares` with `runAll(n)`.\n\n' +
              '3. **Print two lines.** Use a string template for the list:\n"Squares: [1, 4, 9]"\n"Count: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write runAll.** Launch workers in a `coroutineScope`.',
          '2. **Call it.** Use `n`.',
          '3. **Print two lines.** Show the list and its size.',
        ],
        comments: [
          '// 1. Write runAll. Launch workers in a coroutineScope.',
          '// 2. Call it. Use n.',
          '// 3. Print two lines. Show the list and its size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write runAll.**',
          '2. **Call it.**',
          '3. **Print two lines.**',
        ],
        comments: [
          '// 1. Write runAll.',
          '// 2. Call it.',
          '// 3. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ScopedWork.kt',
    initialCode: `import kotlinx.coroutines.*

// 1. Write runAll. Above main, write suspend fun runAll(n: Int): List<Int>. Create val out = mutableListOf<Int>(). In a coroutineScope { ... }, loop i from 1 to n. Each time, call launch { out.add(i * i) }. After the scope, return out.

fun main() = runBlocking {
  val n = 3

  // 2. Call it. Create val squares with runAll(n).

  // 3. Print two lines. Use a string template for the list: "Squares: [1, 4, 9]" "Count: 3"
}`,
    solutionCode: `import kotlinx.coroutines.*

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
    sampleInput: 'main()',
    expectedOutput: 'Squares: [1, 4, 9]\nCount: 3',
    testCase: { call: '', expected: 'Squares: [1, 4, 9]\nCount: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Squares: [1, 4, 9, 16]\nCount: 4',
    },
  },
];

export const WORLD_16_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-16-practice-debug-no-join',
    worldId: 'world-16',
    conceptTags: ['lesson:coroutine-fundamentals-coroutine-builder', 'launch', 'join', 'order'],
    summary: 'The parent finishes before the child runs.',
    title: 'Fix the Missing Join',
    subtitle: 'The program should print "child" and then "done", but it prints "done" first.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the parent finishes before the child runs',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  launch {
    println("child")
  }
  println("done")
}`,
    fixedCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("child")
  }
  job.join()
  println("done")
}`,
    expectedOutput: 'child\ndone',
    hints: [
              'Look at the order of the two lines in the output.',
              '`launch` starts the child later. The parent goes on and prints "done" first.',
              'Keep the job from `launch` and make the parent wait for it before it prints.',
            ],
    explanation: '`launch` does not wait for the child. The parent goes on at once and prints `done`, and the child runs when the parent has nothing more to do. With `val job = launch { ... }` and `job.join()`, the parent waits, so `child` prints first.',
  },
  {
    id: 'world-16-practice-debug-missing-await',
    worldId: 'world-16',
    conceptTags: ['lesson:launch-async', 'async', 'await', 'sum'],
    summary: 'One async value is never read.',
    title: 'Fix the Missing Await',
    subtitle: 'The program should print "Total: 42", but it prints "Total: 20".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: one async value is never read',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val a = async { 20 }
  val b = async { 22 }
  println("Total: " + a.await())
}`,
    fixedCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val a = async { 20 }
  val b = async { 22 }
  println("Total: " + (a.await() + b.await()))
}`,
    expectedOutput: 'Total: 42',
    hints: [
              'Look at the two async values. Which one is read?',
              'Only `a.await()` is used, so the value of `b` is never added.',
              'Read both values and add them.',
            ],
    explanation: 'Each `async` gives a `Deferred`, and you get its value with `await()`. The code reads only `a`, so the total is `20`. Adding `b.await()` gives `20 + 22 = 42`.',
  },
  {
    id: 'world-16-practice-debug-suspend-from-main',
    worldId: 'world-16',
    conceptTags: ['lesson:await-suspending-functions', 'suspend-function', 'runBlocking'],
    summary: 'A suspend function is called outside a coroutine.',
    title: 'Fix the Suspend Call',
    subtitle: 'The program should print "5", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a suspend function is called outside a coroutine',
    brokenCode: `import kotlinx.coroutines.*

suspend fun load(): Int {
  delay(10)
  return 5
}

fun main() {
  println(load())
}`,
    fixedCode: `import kotlinx.coroutines.*

suspend fun load(): Int {
  delay(10)
  return 5
}

fun main() = runBlocking {
  println(load())
}`,
    expectedOutput: '5',
    hints: [
              'Look at where `load()` is called. What kind of function is `main` here?',
              'A suspend function can only be called from a coroutine or from another suspend function.',
              'Start a coroutine in `main` with the builder that blocks until it is done.',
            ],
    explanation: '`load` is a suspend function, but `main` is a normal function, so Kotlin refuses the call. `fun main() = runBlocking { ... }` starts a coroutine, and inside it, calling `load()` is allowed. The program prints `5`.',
  },
  {
    id: 'world-16-practice-debug-dropped-result',
    worldId: 'world-16',
    conceptTags: ['lesson:suspend-coroutine-context', 'withContext', 'return-value'],
    summary: 'The value of withContext is thrown away.',
    title: 'Fix the Dropped Result',
    subtitle: 'The program should print "Result: 25", but it prints "Result: 0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the value of withContext is thrown away',
    brokenCode: `import kotlinx.coroutines.*

suspend fun compute(n: Int): Int {
  withContext(Dispatchers.Default) {
    n * n
  }
  return 0
}

fun main() = runBlocking {
  println("Result: " + compute(5))
}`,
    fixedCode: `import kotlinx.coroutines.*

suspend fun compute(n: Int): Int {
  return withContext(Dispatchers.Default) {
    n * n
  }
}

fun main() = runBlocking {
  println("Result: " + compute(5))
}`,
    expectedOutput: 'Result: 25',
    hints: [
              'Look at what `compute` returns. Where does `25` go?',
              '`withContext` gives back the value of its block, but the code does not use it and returns `0`.',
              'Return the value that `withContext` gives back.',
            ],
    explanation: '`withContext(...) { n * n }` is an expression with the value `25`. The code throws it away and returns `0`. Writing `return withContext(...) { n * n }` returns the value, so the program prints `Result: 25`.',
  },
  {
    id: 'world-16-practice-debug-not-joined',
    worldId: 'world-16',
    conceptTags: ['lesson:dispatchers-jobs', 'Job', 'isCompleted', 'join'],
    summary: 'The job state is read before the job has run.',
    title: 'Fix the Early Check',
    subtitle: 'The program should print "work" and then "Completed: true", but it prints "Completed: false" first.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the job state is read before the job has run',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("work")
  }
  println("Completed: " + job.isCompleted)
}`,
    fixedCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("work")
  }
  job.join()
  println("Completed: " + job.isCompleted)
}`,
    expectedOutput: 'work\nCompleted: true',
    hints: [
              'Look at what happens before the check. Did the job run?',
              '`launch` has not run the child yet when the state is read, so the job is not completed.',
              'Wait for the job before you read its state.',
            ],
    explanation: 'The child does not run until the parent waits. Reading `isCompleted` at once gives `false`. After `job.join()`, the child has run and printed `work`, and `isCompleted` is `true`.',
  },
  {
    id: 'world-16-practice-debug-wrong-flag',
    worldId: 'world-16',
    conceptTags: ['lesson:cancellation-cooperative-cancellation', 'cancel', 'isCancelled', 'isActive'],
    summary: 'isActive is used where isCancelled is needed.',
    title: 'Fix the Cancel Check',
    subtitle: 'The program should print "Cancelled: true", but it prints "Cancelled: false".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: isActive is read where isCancelled is needed',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("never")
  }
  job.cancel()
  job.join()
  println("Cancelled: " + job.isActive)
}`,
    fixedCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val job = launch {
    println("never")
  }
  job.cancel()
  job.join()
  println("Cancelled: " + job.isCancelled)
}`,
    expectedOutput: 'Cancelled: true',
    hints: [
              'Look at which property is printed after the job is cancelled.',
              '`isActive` tells if the job is still running. A cancelled job is not active, so it is `false`.',
              'Use the property that tells if the job was cancelled.',
            ],
    explanation: 'After `cancel()` and `join()`, the job is not active, so `isActive` is `false`. The property that answers the question is `isCancelled`, and it is `true`.',
  },
  {
    id: 'world-16-practice-debug-early-print',
    worldId: 'world-16',
    conceptTags: ['lesson:structured-concurrency', 'coroutineScope', 'structured-concurrency', 'order'],
    summary: 'The list is printed before the child has run.',
    title: 'Fix the Early Print',
    subtitle: 'The program should print "[1]", but it prints "[]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the list is printed inside the scope, before the child runs',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  coroutineScope {
    launch {
      out.add(1)
    }
    println(out)
  }
}`,
    fixedCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  coroutineScope {
    launch {
      out.add(1)
    }
  }
  println(out)
}`,
    expectedOutput: '[1]',
    hints: [
              'Look at where the list is printed. Is it inside or after the scope?',
              'The print runs in the body of the scope, before the child has run.',
              'Move the print so it runs after the scope, because the scope waits for its children.',
            ],
    explanation: 'Inside `coroutineScope`, the body goes on first and the child runs later, so the list is still empty. `coroutineScope` only returns when all its children are done. Printing after the scope shows `[1]`.',
  },
  {
    id: 'world-16-practice-debug-uncaught-scope',
    worldId: 'world-16',
    conceptTags: ['lesson:coroutinescope', 'coroutineScope', 'exception', 'try-catch'],
    summary: 'The failure of a child is not caught.',
    title: 'Fix the Uncaught Failure',
    subtitle: 'The program should print "caught fail" and "after", but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: the failure of a child is not caught',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  coroutineScope {
    launch {
      throw IllegalStateException("fail")
    }
  }
  println("after")
}`,
    fixedCode: `import kotlinx.coroutines.*

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
    expectedOutput: 'caught fail\nafter',
    hints: [
              'Look at what happens when the child throws.',
              'The failure of a child makes `coroutineScope` throw, and nothing catches it, so the program stops.',
              'Catch the exception around the scope.',
            ],
    explanation: 'A failing child cancels its scope, and `coroutineScope` throws the exception to the code that called it. With no `try`, the program stops. Putting the scope in a `try` and adding `catch (e: IllegalStateException)` prints `caught fail`, and the program goes on.',
  },
  {
    id: 'world-16-practice-debug-await-no-catch',
    worldId: 'world-16',
    conceptTags: ['lesson:supervisorscope', 'supervisorScope', 'async', 'await'],
    summary: 'await throws, and nothing catches it.',
    title: 'Fix the Rethrown Failure',
    subtitle: 'The program should print "caught boom" and "good 8", but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: await throws and nothing catches it',
    brokenCode: `import kotlinx.coroutines.*

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
    fixedCode: `import kotlinx.coroutines.*

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
    expectedOutput: 'caught boom\ngood 8',
    hints: [
              'Look at the line `bad.await()`. What does it do when the async failed?',
              '`await()` throws the failure of the async. Nothing catches it, so the rest of the scope does not run.',
              'Catch the exception where you call `await()`.',
            ],
    explanation: 'A `supervisorScope` keeps the good child running, but `bad.await()` still throws the failure into your code. Without a `try`, it ends the program. With `try` and `catch (e: IllegalStateException)`, the program prints `caught boom` and goes on to `good 8`.',
  },
  {
    id: 'world-16-practice-debug-try-outside-launch',
    worldId: 'world-16',
    conceptTags: ['lesson:exception-handling-in-coroutines', 'try-catch', 'launch', 'exception'],
    summary: 'The try is around launch, not inside it.',
    title: 'Fix the Try Placement',
    subtitle: 'The program should print "end" and then "caught", but the exception is not caught and the program stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: the try is around launch, not inside it',
    brokenCode: `import kotlinx.coroutines.*

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
    fixedCode: `import kotlinx.coroutines.*

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
    expectedOutput: 'end\ncaught',
    hints: [
              'Look at where the `try` is. Where is the code that throws?',
              '`launch` returns at once, so the `try` ends before the exception happens. The exception then happens in the coroutine.',
              'Put the `try` and `catch` inside the coroutine, around the code that throws.',
            ],
    explanation: 'The `try` only covers the call of `launch`, which returns at once. The `throw` runs later inside the coroutine, outside the `try`, so nothing catches it. Putting the `try` inside the coroutine handles it there, and the program prints `end` and `caught`.',
  },
  {
    id: 'world-16-practice-debug-read-too-early',
    worldId: 'world-16',
    conceptTags: ['lesson:coroutine-best-practices', 'launch', 'joinAll', 'shared-list'],
    summary: 'The list is read before the workers have run.',
    title: 'Fix the Early Read',
    subtitle: 'The program should print "[1, 4, 9]", but it prints "[]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the list is read before the workers have run',
    brokenCode: `import kotlinx.coroutines.*

fun main() = runBlocking {
  val out = mutableListOf<Int>()
  val jobs = (1..3).map { i ->
    launch {
      out.add(i * i)
    }
  }
  println(out)
}`,
    fixedCode: `import kotlinx.coroutines.*

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
    expectedOutput: '[1, 4, 9]',
    hints: [
              'Look at when the list is printed. Have the workers run?',
              'The workers run later. The print runs first and sees an empty list.',
              'Wait for all the jobs before you print.',
            ],
    explanation: '`launch` only schedules the workers. Printing at once shows the empty list. `jobs.joinAll()` waits for all of them, so the list holds `[1, 4, 9]` when it is printed.',
  },
];
