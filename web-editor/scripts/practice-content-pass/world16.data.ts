/**
 * World 16 (Coroutine Academy) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world16.spec.ts.
 */
import type { WR, DBG } from './world2.data';

const RB = 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write your steps inside it.';

export const WR_DATA: Record<string, WR> = {
  'start-parent-child': {
    summary: 'Launch a child coroutine, and see that the parent goes on first until it joins.',
    goal: 'Start a child coroutine that prints some lines. Print a line before it, a line after you start it, and a line when it is done.',
    setup: RB,
    steps: [
      '**Print the start.** Print "start":\n"start"',
      '**Launch the child.** Create `val job` with `launch { ... }`. Inside, loop `i` from `1` to `count`. Each time, print "child " plus `i`.',
      '**Print the parent line.** Print "parent". The child has not run yet:\n"parent"',
      '**Wait and finish.** Call `job.join()`. Then print "done":\n"child 1"\n"child 2"\n"done"',
    ],
    i: ['**Print the start.** Print "start".', '**Launch the child.** Print `i` in a loop.', '**Print the parent line.** Print "parent".', '**Wait and finish.** Use `join()`, then print "done".'],
    e: ['**Print the start.**', '**Launch the child.**', '**Print the parent line.**', '**Wait and finish.**'],
  },
  'block-result': {
    summary: 'See that runBlocking gives back a value, and that it waits for its children first.',
    goal: 'Use runBlocking to work out a total with two async values. Then use it again with a child that prints. Print what each one gives back.',
    steps: [
      '**Work out the total.** Create `val total` with `runBlocking { ... }`. Inside, create `val a` with `async { base * 2 }` and `val b` with `async { base + 1 }`. The last line is `a.await() + b.await()`.',
      '**Print the total.** Print "Total: " plus `total`:\n"Total: 31"',
      '**Use a child.** Create `val text` with `runBlocking { ... }`. Inside, call `launch { ... }` that prints "child ran". The last line is the text "finished".',
      '**Print the text.** Print `text`. The child ran before `runBlocking` gave the text back:\n"child ran"\n"finished"',
    ],
    i: ['**Work out the total.** Use two `async` values.', '**Print the total.** Show `total`.', '**Use a child.** Use `launch`, and end with "finished".', '**Print the text.** Show `text`.'],
    e: ['**Work out the total.**', '**Print the total.**', '**Use a child.**', '**Print the text.**'],
  },
  'three-launches': {
    summary: 'Launch three coroutines that add to a list, join them, and print the list.',
    goal: 'Start three coroutines. Each adds a text to one list. Wait for all three, then print the list.',
    setup: RB,
    steps: [
      '**Launch the first two.** Create `val j1` with `launch { log.add("one") }`. Create `val j2` with `launch { log.add("two") }`.',
      '**Launch the third.** Create `val j3` with `launch { log.add(extra) }`.',
      '**Wait for all.** Call `join()` on `j1`, then `j2`, then `j3`.',
      '**Print the list.** Use a string template:\n"Log: [one, two, three]"',
    ],
    i: ['**Launch the first two.** Add "one" and "two".', '**Launch the third.** Add `extra`.', '**Wait for all.** Join the three jobs.', '**Print the list.** Show `log`.'],
    e: ['**Launch the first two.**', '**Launch the third.**', '**Wait for all.**', '**Print the list.**'],
  },
  'async-squares': {
    summary: 'Start many async coroutines, and collect their values with await.',
    goal: 'Square the numbers from 1 to n, each in its own coroutine. Print the values and their total.',
    setup: RB,
    steps: [
      '**Start the coroutines.** Create `val jobs` with `(1..n).map { k -> async { ... } }`. Inside `async`, return `k * k`.',
      '**Collect the values.** Create `val values` with `jobs.map { it.await() }`. Create `val total` with `jobs.sumOf { it.await() }`.',
      '**Print two lines.** Use a string template for the list:\n"Values: [1, 4, 9]"\n"Total: 14"',
    ],
    i: ['**Start the coroutines.** One `async` for each number.', '**Collect the values.** Use `await()` and `sumOf`.', '**Print two lines.** Show the values and the total.'],
    e: ['**Start the coroutines.**', '**Collect the values.**', '**Print two lines.**'],
  },
  'seq-vs-par': {
    summary: 'Call two suspend functions one after another, and then at the same time with async.',
    goal: 'Write two suspend functions that wait a little. Use them one after another, and then in parallel. Print both sums.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the two functions above `main`.',
    steps: [
      '**Write first.** Above `main`, write `suspend fun first(base: Int): Int`. Call `delay(100)`, then return `base`.',
      '**Write second.** Write `suspend fun second(base: Int): Int`. Call `delay(100)`, then return `base * 2`.',
      '**Call them in sequence.** Create `val sequential` as `first(base) + second(base)`.',
      '**Call them in parallel.** Create `val a` with `async { first(base) }` and `val b` with `async { second(base) }`. Create `val parallel` as `a.await() + b.await()`.',
      '**Print two lines.** Join the text with `+`:\n"Sequential: 15"\n"Parallel: 15"',
    ],
    i: ['**Write first.** Wait, then return `base`.', '**Write second.** Wait, then return `base * 2`.', '**Call them in sequence.** Add the two results.', '**Call them in parallel.** Use `async` and `await`.', '**Print two lines.** Show both sums.'],
    e: ['**Write first.**', '**Write second.**', '**Call them in sequence.**', '**Call them in parallel.**', '**Print two lines.**'],
  },
  'await-order': {
    summary: 'See when async blocks run, and in which order you can await them.',
    goal: 'Start two async blocks that print a line. Print "created" after you start them. Then read the second value first and the first value second.',
    setup: RB,
    steps: [
      '**Start a.** Create `val a` with `async { ... }`. Inside, print "a runs". The last line is `x`.',
      '**Start b.** Create `val b` with `async { ... }`. Inside, print "b runs". The last line is `x + 1`.',
      '**Print created.** Print "created". Neither block has run yet:\n"created"',
      '**Await in the other order.** Print `b.await()`, then print `a.await()`:\n"a runs"\n"b runs"\n"2"\n"1"',
    ],
    i: ['**Start a.** Print, then return `x`.', '**Start b.** Print, then return `x + 1`.', '**Print created.** Print "created".', '**Await in the other order.** `b` first, then `a`.'],
    e: ['**Start a.**', '**Start b.**', '**Print created.**', '**Await in the other order.**'],
  },
  'suspend-chain': {
    summary: 'Write suspend functions that call each other and call them from a coroutine.',
    goal: 'Write a suspend function that doubles a number after a short wait. Write another that uses it twice. Print both results.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the two functions above `main`.',
    steps: [
      '**Write load.** Above `main`, write `suspend fun load(n: Int): Int`. Call `delay(10)`, then return `n * 2`.',
      '**Write total.** Write `suspend fun total(a: Int, b: Int): Int`. Return `load(a) + load(b)`.',
      '**Call load.** Print `load(x)`:\n"8"',
      '**Call total.** Print `total(x, x + 1)`:\n"18"',
    ],
    i: ['**Write load.** Wait, then double.', '**Write total.** Add two calls of `load`.', '**Call load.** Use `x`.', '**Call total.** Use `x` and `x + 1`.'],
    e: ['**Write load.**', '**Write total.**', '**Call load.**', '**Call total.**'],
  },
  'with-context': {
    summary: 'Use withContext to run work on another dispatcher and get its value back.',
    goal: 'Write a suspend function that squares a number on the Default dispatcher. Use it directly, and from an async block.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.',
    steps: [
      '**Write compute.** Above `main`, write `suspend fun compute(n: Int): Int`. Return `withContext(Dispatchers.Default) { ... }`. Inside the block, return `n * n`.',
      '**Call it directly.** Print `compute(n)`:\n"25"',
      '**Call it from async.** Create `val a` with `async(Dispatchers.Default) { compute(n - 2) }`.',
      '**Print the result.** Print `a.await() + 1`:\n"10"',
    ],
    i: ['**Write compute.** Use `withContext` and `n * n`.', '**Call it directly.** Use `n`.', '**Call it from async.** Use `n - 2`.', '**Print the result.** Await and add `1`.'],
    e: ['**Write compute.**', '**Call it directly.**', '**Call it from async.**', '**Print the result.**'],
  },
  'job-states': {
    summary: 'Read the state of a job before and after it runs.',
    goal: 'Launch a job and check if it is active. Wait for it, and check again. Also check if it is completed.',
    setup: RB,
    steps: [
      '**Launch the job.** Create `val job` with `launch { ... }`. Inside, print "count " plus `n`.',
      '**Check before.** Print "Active: " plus `job.isActive`. The job has not run yet:\n"Active: true"',
      '**Wait for it.** Call `job.join()`. The child prints its line:\n"count 3"',
      '**Check after.** Print "Active: " plus `job.isActive`, then "Completed: " plus `job.isCompleted`:\n"Active: false"\n"Completed: true"',
    ],
    i: ['**Launch the job.** Print `n` inside.', '**Check before.** Print `job.isActive`.', '**Wait for it.** Use `join()`.', '**Check after.** Print `isActive` and `isCompleted`.'],
    e: ['**Launch the job.**', '**Check before.**', '**Wait for it.**', '**Check after.**'],
  },
  'dispatch-work': {
    summary: 'Run two pieces of work on two dispatchers with withContext, and add the results.',
    goal: 'Do one calculation on the Default dispatcher and one on the IO dispatcher. Print both results and their sum.',
    setup: RB,
    steps: [
      '**Run on Default.** Create `val a` with `withContext(Dispatchers.Default) { ... }`. Return `base * 2`.',
      '**Run on IO.** Create `val b` with `withContext(Dispatchers.IO) { ... }`. Return `base + 3`.',
      '**Print three lines.** Join the text with `+`:\n"Default: 20"\n"IO: 13"\n"Sum: 33"',
    ],
    i: ['**Run on Default.** Return `base * 2`.', '**Run on IO.** Return `base + 3`.', '**Print three lines.** Show both and the sum.'],
    e: ['**Run on Default.**', '**Run on IO.**', '**Print three lines.**'],
  },
  'cancel-before-start': {
    summary: 'Cancel a job before it runs, and check its state after join.',
    goal: 'Launch two jobs. Cancel the first one at once. Wait for both and print their states.',
    setup: RB,
    steps: [
      '**Launch the first job.** Create `val job` with `launch { ... }`. Inside, print "never".',
      '**Launch the other job.** Create `val other` with `launch { ... }`. Inside, print "other " plus `n`.',
      '**Cancel and wait.** Call `job.cancel()`. Then call `job.join()` and `other.join()`:\n"other 3"',
      '**Print the states.** Print "Cancelled: " plus `job.isCancelled`. Print "Other done: " plus `other.isCompleted`:\n"Cancelled: true"\n"Other done: true"',
    ],
    i: ['**Launch the first job.** Print "never".', '**Launch the other job.** Print `n`.', '**Cancel and wait.** Cancel `job`, then join both.', '**Print the states.** Show `isCancelled` and `isCompleted`.'],
    e: ['**Launch the first job.**', '**Launch the other job.**', '**Cancel and wait.**', '**Print the states.**'],
  },
  'cleanup-on-cancel': {
    summary: 'Use finally in a coroutine so cleanup runs when the job is cancelled.',
    goal: 'Start a job that waits a long time. Cancel it, and check that its cleanup line still prints before the program says done.',
    setup: RB,
    steps: [
      '**Launch the job.** Create `val job` with `launch { ... }`. Inside, write `try { delay(1000) }`.',
      '**Add the cleanup.** Add `finally { ... }`. Inside, print "cleanup " plus `note`.',
      '**Cancel it.** Call `delay(50)` so the job starts. Then call `job.cancelAndJoin()`. Then print "done":\n"cleanup closed"\n"done"',
    ],
    i: ['**Launch the job.** Wait in a `try`.', '**Add the cleanup.** Print in `finally`.', '**Cancel it.** Use `cancelAndJoin()`, then print "done".'],
    e: ['**Launch the job.**', '**Add the cleanup.**', '**Cancel it.**'],
  },
  'wait-for-children': {
    summary: 'See that coroutineScope waits for its child before it ends.',
    goal: 'Start a child inside a coroutineScope. Print a line in the scope and a line after it. See that the child finishes before the scope ends.',
    setup: RB,
    steps: [
      '**Start the scope.** Write `coroutineScope { ... }`. Inside, call `launch { ... }`. In the child, call `delay(100)`, then print "child " plus `n`.',
      '**Print the body line.** Still inside the scope, after the `launch`, print "scope body":\n"scope body"\n"child 2"',
      '**Print after the scope.** After the scope, print "after scope":\n"after scope"',
    ],
    i: ['**Start the scope.** Launch a child in `coroutineScope`.', '**Print the body line.** Print "scope body".', '**Print after the scope.** Print "after scope".'],
    e: ['**Start the scope.**', '**Print the body line.**', '**Print after the scope.**'],
  },
  'nested-launch': {
    summary: 'Launch a coroutine inside a coroutine and follow the order of the lines.',
    goal: 'Launch an outer coroutine that launches an inner one. Print lines in all three places. See the order.',
    setup: RB,
    steps: [
      '**Launch the outer coroutine.** Write `launch { ... }`. Inside, print "outer start".',
      '**Launch the inner coroutine.** Still inside the outer one, call `launch { ... }`. In the inner one, print "inner " plus `label`. After it, print "outer end".',
      '**Print the main line.** After the outer `launch`, print "main":\n"main"\n"outer start"\n"outer end"\n"inner x"',
    ],
    i: ['**Launch the outer coroutine.** Print "outer start".', '**Launch the inner coroutine.** Print `label`, then "outer end".', '**Print the main line.** Print "main".'],
    e: ['**Launch the outer coroutine.**', '**Launch the inner coroutine.**', '**Print the main line.**'],
  },
  'scope-sum': {
    summary: 'Write a suspend function that uses coroutineScope to run two async blocks.',
    goal: 'Write a suspend function that runs two calculations at the same time and adds them. Call it and print the result.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.',
    steps: [
      '**Write work.** Above `main`, write `suspend fun work(a: Int, b: Int): Int = coroutineScope { ... }`. Inside, create `val x` with `async { a * 2 }` and `val y` with `async { b * 3 }`. The last line is `x.await() + y.await()`.',
      '**Call it.** Create `val result` with `work(a, 5)`.',
      '**Print the result.** Print "Result: " plus `result`:\n"Result: 23"',
    ],
    i: ['**Write work.** Use `coroutineScope` and two `async` blocks.', '**Call it.** Use `a` and `5`.', '**Print the result.** Show `result`.'],
    e: ['**Write work.**', '**Call it.**', '**Print the result.**'],
  },
  'scope-catch': {
    summary: 'Catch the failure of a child outside its coroutineScope, and go on with a new scope.',
    goal: 'A child coroutine fails inside a scope. Catch the failure outside the scope and go on. Then use a scope that works.',
    setup: RB,
    steps: [
      '**Start the try.** Write `try { ... }`. Inside, write `coroutineScope { ... }`.',
      '**Fail inside.** In the scope, call `launch { ... }`. Inside, throw `IllegalStateException(reason)`.',
      '**Catch it.** Add `catch (e: IllegalStateException)`. Print "caught " plus `e.message`. After the `try`, print "after":\n"caught x"\n"after"',
      '**Use a good scope.** Create `val v` with `coroutineScope { 5 + k }`. Print "Value: " plus `v`:\n"Value: 7"',
    ],
    i: ['**Start the try.** Put `coroutineScope` in it.', '**Fail inside.** Throw in a child.', '**Catch it.** Print the message, then "after".', '**Use a good scope.** Return `5 + k`.'],
    e: ['**Start the try.**', '**Fail inside.**', '**Catch it.**', '**Use a good scope.**'],
  },
  'one-fails': {
    summary: 'Use supervisorScope so that one failing child does not stop the others.',
    goal: 'Start three children in a supervisorScope. The first one fails. Show that the other two still do their work.',
    setup: RB,
    steps: [
      '**Start the scope and the failing child.** Write `supervisorScope { ... }`. Inside, create `val a` with `launch { ... }`. Throw `IllegalStateException("a")`.',
      '**Start the other two.** Create `val b` with `launch { results.add("b") }`. Create `val c` with `launch { results.add(extra) }`.',
      '**Wait and print.** Call `joinAll(a, b, c)` inside the scope. After the scope, print the list with a string template:\n"Results: [b, c]"',
    ],
    i: ['**Start the scope and the failing child.** `a` throws.', '**Start the other two.** Add "b" and `extra`.', '**Wait and print.** Use `joinAll`, then print `results`.'],
    e: ['**Start the scope and the failing child.**', '**Start the other two.**', '**Wait and print.**'],
  },
  'supervised-await': {
    summary: 'Catch the failure of an async value in a supervisorScope, while another async value still works.',
    goal: 'Start two async values. One fails. Catch its failure when you read it, and still read the good one.',
    setup: RB,
    steps: [
      '**Start the scope and the bad value.** Write `supervisorScope { ... }`. Inside, create `val bad` with `async { ... }`. Inside, call `check(false) { "boom" }`, then return `0`.',
      '**Start the good value.** Create `val good` with `async { k * 2 }`.',
      '**Catch the failure.** Write `try { bad.await() }`. Add `catch (e: IllegalStateException)`. Print "caught " plus `e.message`.',
      '**Read the good value.** Still in the scope, print "good " plus `good.await()`. After the scope, print "end":\n"caught boom"\n"good 8"\n"end"',
    ],
    i: ['**Start the scope and the bad value.** It fails with `check`.', '**Start the good value.** Return `k * 2`.', '**Catch the failure.** Await `bad` in a `try`.', '**Read the good value.** Print it, then "end".'],
    e: ['**Start the scope and the bad value.**', '**Start the good value.**', '**Catch the failure.**', '**Read the good value.**'],
  },
  'try-inside-launch': {
    summary: 'Put the try and catch inside the coroutine so the failure is handled there.',
    goal: 'A coroutine throws an exception. Handle it inside the same coroutine, so the program goes on as normal.',
    setup: RB,
    steps: [
      '**Launch with a try.** Create `val job` with `launch { ... }`. Inside, write `try { ... }`. In the try, throw `IllegalStateException(msg)`.',
      '**Handle it.** Add `catch (e: IllegalStateException)`. Print "handled " plus `e.message`.',
      '**Wait and finish.** Call `job.join()`, then print "done":\n"handled inside"\n"done"',
    ],
    i: ['**Launch with a try.** Throw inside the `try`.', '**Handle it.** Print the message.', '**Wait and finish.** Use `join()`, then print "done".'],
    e: ['**Launch with a try.**', '**Handle it.**', '**Wait and finish.**'],
  },
  'retry': {
    summary: 'Write a suspend function that can fail, and retry it in a loop until it works.',
    goal: 'A function fails for small numbers. Call it again with a bigger number each time, until it works. Print each failure and the result.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. `limit` and `n` are declared in `main`. Write the function above `main`.',
    steps: [
      '**Write risky.** Above `main`, write `suspend fun risky(n: Int, limit: Int): Int`. Call `delay(10)`. When `n < limit`, throw `IllegalStateException("try " + n)`. Otherwise return `n * 10`.',
      '**Write the loop.** Write `while (true) { ... }`. Inside, write `try { ... }`. Print "result " plus `risky(n, limit)`, then `break`.',
      '**Retry on failure.** Add `catch (e: IllegalStateException)`. Print "fail " plus `e.message`. Add `1` to `n`:\n"fail try 1"\n"fail try 2"\n"result 30"',
    ],
    i: ['**Write risky.** Throw for `n < limit`.', '**Write the loop.** Try, print, break.', '**Retry on failure.** Print the failure, add `1` to `n`.'],
    e: ['**Write risky.**', '**Write the loop.**', '**Retry on failure.**'],
  },
  'parallel-load': {
    summary: 'Load many items at the same time with async, and collect them with awaitAll.',
    goal: 'Load three items in parallel, each in its own coroutine. Collect the results in one list and print it.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.',
    steps: [
      '**Write load.** Above `main`, write `suspend fun load(id: Int, mult: Int): Int`. Call `delay(50)`, then return `id * mult`.',
      '**Load them all.** Create `val results` with `ids.map { id -> async { ... } }.awaitAll()`. Inside `async`, return `load(id, mult)`.',
      '**Print the results.** Use a string template:\n"Results: [10, 20, 30]"',
    ],
    i: ['**Write load.** Wait, then return `id * mult`.', '**Load them all.** Use `async` and `awaitAll()`.', '**Print the results.** Show `results`.'],
    e: ['**Write load.**', '**Load them all.**', '**Print the results.**'],
  },
  'scoped-work': {
    summary: 'Write a function that starts workers in a coroutineScope and returns when all are done.',
    goal: 'Write a function that starts one worker for each number, and returns the full list of results. Print the list and its size.',
    setup: 'The import and `fun main() = runBlocking { ... }` are in the starter code. Write the function above `main`.',
    steps: [
      '**Write runAll.** Above `main`, write `suspend fun runAll(n: Int): List<Int>`. Create `val out = mutableListOf<Int>()`. In a `coroutineScope { ... }`, loop `i` from `1` to `n`. Each time, call `launch { out.add(i * i) }`. After the scope, return `out`.',
      '**Call it.** Create `val squares` with `runAll(n)`.',
      '**Print two lines.** Use a string template for the list:\n"Squares: [1, 4, 9]"\n"Count: 3"',
    ],
    i: ['**Write runAll.** Launch workers in a `coroutineScope`.', '**Call it.** Use `n`.', '**Print two lines.** Show the list and its size.'],
    e: ['**Write runAll.**', '**Call it.**', '**Print two lines.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'no-join': {
    subtitle: 'The program should print "child" and then "done", but it prints "done" first.',
    hints: [
      'Look at the order of the two lines in the output.',
      '`launch` starts the child later. The parent goes on and prints "done" first.',
      'Keep the job from `launch` and make the parent wait for it before it prints.',
    ],
    explanation: '`launch` does not wait for the child. The parent goes on at once and prints `done`, and the child runs when the parent has nothing more to do. With `val job = launch { ... }` and `job.join()`, the parent waits, so `child` prints first.',
  },
  'missing-await': {
    subtitle: 'The program should print "Total: 42", but it prints "Total: 20".',
    hints: [
      'Look at the two async values. Which one is read?',
      'Only `a.await()` is used, so the value of `b` is never added.',
      'Read both values and add them.',
    ],
    explanation: 'Each `async` gives a `Deferred`, and you get its value with `await()`. The code reads only `a`, so the total is `20`. Adding `b.await()` gives `20 + 22 = 42`.',
  },
  'suspend-from-main': {
    subtitle: 'The program should print "5", but it does not compile.',
    hints: [
      'Look at where `load()` is called. What kind of function is `main` here?',
      'A suspend function can only be called from a coroutine or from another suspend function.',
      'Start a coroutine in `main` with the builder that blocks until it is done.',
    ],
    explanation: '`load` is a suspend function, but `main` is a normal function, so Kotlin refuses the call. `fun main() = runBlocking { ... }` starts a coroutine, and inside it, calling `load()` is allowed. The program prints `5`.',
  },
  'dropped-result': {
    subtitle: 'The program should print "Result: 25", but it prints "Result: 0".',
    hints: [
      'Look at what `compute` returns. Where does `25` go?',
      '`withContext` gives back the value of its block, but the code does not use it and returns `0`.',
      'Return the value that `withContext` gives back.',
    ],
    explanation: '`withContext(...) { n * n }` is an expression with the value `25`. The code throws it away and returns `0`. Writing `return withContext(...) { n * n }` returns the value, so the program prints `Result: 25`.',
  },
  'not-joined': {
    subtitle: 'The program should print "work" and then "Completed: true", but it prints "Completed: false" first.',
    hints: [
      'Look at what happens before the check. Did the job run?',
      '`launch` has not run the child yet when the state is read, so the job is not completed.',
      'Wait for the job before you read its state.',
    ],
    explanation: 'The child does not run until the parent waits. Reading `isCompleted` at once gives `false`. After `job.join()`, the child has run and printed `work`, and `isCompleted` is `true`.',
  },
  'wrong-flag': {
    subtitle: 'The program should print "Cancelled: true", but it prints "Cancelled: false".',
    hints: [
      'Look at which property is printed after the job is cancelled.',
      '`isActive` tells if the job is still running. A cancelled job is not active, so it is `false`.',
      'Use the property that tells if the job was cancelled.',
    ],
    explanation: 'After `cancel()` and `join()`, the job is not active, so `isActive` is `false`. The property that answers the question is `isCancelled`, and it is `true`.',
  },
  'early-print': {
    subtitle: 'The program should print "[1]", but it prints "[]".',
    hints: [
      'Look at where the list is printed. Is it inside or after the scope?',
      'The print runs in the body of the scope, before the child has run.',
      'Move the print so it runs after the scope, because the scope waits for its children.',
    ],
    explanation: 'Inside `coroutineScope`, the body goes on first and the child runs later, so the list is still empty. `coroutineScope` only returns when all its children are done. Printing after the scope shows `[1]`.',
  },
  'uncaught-scope': {
    subtitle: 'The program should print "caught fail" and "after", but it stops with an error.',
    hints: [
      'Look at what happens when the child throws.',
      'The failure of a child makes `coroutineScope` throw, and nothing catches it, so the program stops.',
      'Catch the exception around the scope.',
    ],
    explanation: 'A failing child cancels its scope, and `coroutineScope` throws the exception to the code that called it. With no `try`, the program stops. Putting the scope in a `try` and adding `catch (e: IllegalStateException)` prints `caught fail`, and the program goes on.',
  },
  'await-no-catch': {
    subtitle: 'The program should print "caught boom" and "good 8", but it stops with an error.',
    hints: [
      'Look at the line `bad.await()`. What does it do when the async failed?',
      '`await()` throws the failure of the async. Nothing catches it, so the rest of the scope does not run.',
      'Catch the exception where you call `await()`.',
    ],
    explanation: 'A `supervisorScope` keeps the good child running, but `bad.await()` still throws the failure into your code. Without a `try`, it ends the program. With `try` and `catch (e: IllegalStateException)`, the program prints `caught boom` and goes on to `good 8`.',
  },
  'try-outside-launch': {
    subtitle: 'The program should print "end" and then "caught", but the exception is not caught and the program stops with an error.',
    hints: [
      'Look at where the `try` is. Where is the code that throws?',
      '`launch` returns at once, so the `try` ends before the exception happens. The exception then happens in the coroutine.',
      'Put the `try` and `catch` inside the coroutine, around the code that throws.',
    ],
    explanation: 'The `try` only covers the call of `launch`, which returns at once. The `throw` runs later inside the coroutine, outside the `try`, so nothing catches it. Putting the `try` inside the coroutine handles it there, and the program prints `end` and `caught`.',
  },
  'read-too-early': {
    subtitle: 'The program should print "[1, 4, 9]", but it prints "[]".',
    hints: [
      'Look at when the list is printed. Have the workers run?',
      'The workers run later. The print runs first and sees an empty list.',
      'Wait for all the jobs before you print.',
    ],
    explanation: '`launch` only schedules the workers. Printing at once shows the empty list. `jobs.joinAll()` waits for all of them, so the list holds `[1, 4, 9]` when it is printed.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'no-join': 'The parent finishes before the child runs.',
  'missing-await': 'One async value is never read.',
  'suspend-from-main': 'A suspend function is called outside a coroutine.',
  'dropped-result': 'The value of withContext is thrown away.',
  'not-joined': 'The job state is read before the job has run.',
  'wrong-flag': 'isActive is used where isCancelled is needed.',
  'early-print': 'The list is printed before the child has run.',
  'uncaught-scope': 'The failure of a child is not caught.',
  'await-no-catch': 'await throws, and nothing catches it.',
  'try-outside-launch': 'The try is around launch, not inside it.',
  'read-too-early': 'The list is read before the workers have run.',
};
