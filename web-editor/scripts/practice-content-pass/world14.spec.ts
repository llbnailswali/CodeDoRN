/**
 * World 14 (Sequence Dimension) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world14.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world14.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step.
 * Evaluation order is made visible with println inside the lambdas, or with counters.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'nothing-yet', difficulty: 'medium', tags: ['lesson:what-sequences-are', 'lazy', 'sequence-pipeline', 'terminal-operation'], title: 'Nothing Yet', fileName: 'NothingYet.kt',
    solution: `fun main() {
  val factor = 3
  val seq = listOf(1, 2, 3).asSequence().map {
    println("map " + it)
    it * factor
  }
  println("built")
  val list = seq.toList()
  println("List: $list")
}`,
    starter: `fun main() {
  val factor = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Building the sequence prints nothing. built comes first; then toList runs the map for 1, 2, 3 and the list is [3, 6, 9]. With factor 10: [10, 20, 30].
    expected: 'built\nmap 1\nmap 2\nmap 3\nList: [3, 6, 9]',
    swap: { variableName: 'factor', originalLiteral: '3', alternateLiteral: '10', alternateExpected: 'built\nmap 1\nmap 2\nmap 3\nList: [10, 20, 30]' },
  },
  {
    id: 'seq-stats', difficulty: 'hard', tags: ['lesson:what-sequences-are', 'sequence', 'filter', 'toList', 'count', 'sum'], title: 'Sequence Stats', fileName: 'SeqStats.kt',
    solution: `fun main() {
  val step = 3
  val s = (1..10).asSequence().filter { it % step == 0 }
  val items = s.toList()
  val count = s.count()
  val sum = s.sum()
  println("Items: $items")
  println("Count: " + count)
  println("Sum: " + sum)
}`,
    starter: `fun main() {
  val step = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Multiples of 3 up to 10: 3, 6, 9 (count 3, sum 18). With step 4: 4 and 8 (count 2, sum 12).
    expected: 'Items: [3, 6, 9]\nCount: 3\nSum: 18',
    swap: { variableName: 'step', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Items: [4, 8]\nCount: 2\nSum: 12' },
  },
  {
    id: 'eager-trace', difficulty: 'medium', tags: ['lesson:eager-collection-processing', 'eager', 'filter', 'map', 'processing-order'], title: 'Eager Trace', fileName: 'EagerTrace.kt',
    solution: `fun main() {
  val divisor = 2
  val r = listOf(1, 2, 3, 4)
    .filter {
      println("filter " + it)
      it % divisor == 0
    }
    .map {
      println("map " + it)
      it * 10
    }
  println("R: $r")
}`,
    starter: `fun main() {
  val divisor = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // A list does each step on every item before the next step: filter 1 to 4, then map 2 and 4. With divisor 4 only 4 is mapped.
    expected: 'filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 2\nmap 4\nR: [20, 40]',
    swap: { variableName: 'divisor', originalLiteral: '2', alternateLiteral: '4', alternateExpected: 'filter 1\nfilter 2\nfilter 3\nfilter 4\nmap 4\nR: [40]' },
  },
  {
    id: 'eager-counts', difficulty: 'hard', tags: ['lesson:eager-collection-processing', 'eager', 'counters', 'filter', 'map'], title: 'Eager Counts', fileName: 'EagerCounts.kt',
    solution: `fun main() {
  val limit = 3
  var checks = 0
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6)
    .filter {
      checks += 1
      it > limit
    }
    .map {
      maps += 1
      it * 2
    }
  println("Result: $r")
  println("Checks: " + checks)
  println("Maps: " + maps)
}`,
    starter: `fun main() {
  val limit = 3
  var checks = 0
  var maps = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // filter checks all 6 numbers; 4, 5, 6 are above 3 so map runs 3 times: [8, 10, 12]. With limit 4: map runs 2 times.
    expected: 'Result: [8, 10, 12]\nChecks: 6\nMaps: 3',
    swap: { variableName: 'limit', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Result: [10, 12]\nChecks: 6\nMaps: 2' },
  },
  {
    id: 'lazy-trace', difficulty: 'medium', tags: ['lesson:lazy-processing', 'lazy', 'asSequence', 'toList', 'processing-order'], title: 'Lazy Trace', fileName: 'LazyTrace.kt',
    solution: `fun main() {
  val divisor = 2
  val seq = listOf(1, 2, 3, 4).asSequence()
    .filter {
      println("filter " + it)
      it % divisor == 0
    }
    .map {
      println("map " + it)
      it * 10
    }
  println("before")
  val r = seq.toList()
  println("after")
  println("R: $r")
}`,
    starter: `fun main() {
  val divisor = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Nothing runs until toList. Then each item goes through filter and map one at a time. With divisor 4 only 4 reaches map.
    expected: 'before\nfilter 1\nfilter 2\nmap 2\nfilter 3\nfilter 4\nmap 4\nafter\nR: [20, 40]',
    swap: { variableName: 'divisor', originalLiteral: '2', alternateLiteral: '4', alternateExpected: 'before\nfilter 1\nfilter 2\nfilter 3\nfilter 4\nmap 4\nafter\nR: [40]' },
  },
  {
    id: 'lazy-take', difficulty: 'hard', tags: ['lesson:lazy-processing', 'lazy', 'take', 'counters'], title: 'Lazy Take', fileName: 'LazyTake.kt',
    solution: `fun main() {
  val count = 3
  var maps = 0
  val r = (1..100).asSequence().map {
    maps += 1
    it * 2
  }.take(count).toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    starter: `fun main() {
  val count = 3
  var maps = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // take stops the pipeline: only 3 of the 100 numbers are mapped. With count 5: 5 maps.
    expected: 'Result: [2, 4, 6]\nMaps: 3',
    swap: { variableName: 'count', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Result: [2, 4, 6, 8, 10]\nMaps: 5' },
  },
  {
    id: 'make-sequences', difficulty: 'medium', tags: ['lesson:creating-sequences', 'sequenceOf', 'generateSequence', 'sequence-builder'], title: 'Make Sequences', fileName: 'MakeSequences.kt',
    solution: `fun main() {
  val start = 1
  val doubles = generateSequence(start) { it * 2 }.take(6).toList()
  val fixed = sequenceOf(3, 1, 2).sorted().toList()
  val built = sequence {
    yield(start)
    yield(start + 1)
    yield(start + 2)
  }.map { it * 10 }.toList()
  println("Doubles: $doubles")
  println("Sorted: $fixed")
  println("Built: $built")
}`,
    starter: `fun main() {
  val start = 1

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // From 1 the doubles are 1, 2, 4, 8, 16, 32; sorted 3, 1, 2 is 1, 2, 3; the built sequence 1, 2, 3 times 10 is 10, 20, 30. With start 3: 3, 6, 12 ... 96 and 30, 40, 50.
    expected: 'Doubles: [1, 2, 4, 8, 16, 32]\nSorted: [1, 2, 3]\nBuilt: [10, 20, 30]',
    swap: { variableName: 'start', originalLiteral: '1', alternateLiteral: '3', alternateExpected: 'Doubles: [3, 6, 12, 24, 48, 96]\nSorted: [1, 2, 3]\nBuilt: [30, 40, 50]' },
  },
  {
    id: 'countdown', difficulty: 'hard', tags: ['lesson:creating-sequences', 'generateSequence', 'null-ends-sequence'], title: 'Countdown', fileName: 'Countdown.kt',
    solution: `fun main() {
  val top = 10
  val countdown = generateSequence(top) { if (it > 3) it - 4 else null }.toList()
  println("Countdown: $countdown")
  println("Size: " + countdown.size)
}`,
    starter: `fun main() {
  val top = 10

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 10, 6, 2 and then 2 is not above 3 so null ends it: size 3. With top 15: 15, 11, 7, 3 and size 4.
    expected: 'Countdown: [10, 6, 2]\nSize: 3',
    swap: { variableName: 'top', originalLiteral: '10', alternateLiteral: '15', alternateExpected: 'Countdown: [15, 11, 7, 3]\nSize: 4' },
  },
  {
    id: 'to-sequence', difficulty: 'medium', tags: ['lesson:assequence', 'asSequence', 'range', 'first'], title: 'To Sequence', fileName: 'ToSequence.kt',
    solution: `fun main() {
  val n = 3
  val k = 3
  val squares = (1..n).asSequence().map { it * it }.toList()
  val first = (1..1000000).asSequence().map { it * 2 }.filter { it % k == 0 }.first()
  println("Squares: $squares")
  println("First: " + first)
}`,
    starter: `fun main() {
  val n = 3
  val k = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Squares of 1 to 3 are 1, 4, 9. The first double divisible by 3 is 6, found without visiting a million numbers. With k 5: the first double divisible by 5 is 10.
    expected: 'Squares: [1, 4, 9]\nFirst: 6',
    swap: { variableName: 'k', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Squares: [1, 4, 9]\nFirst: 10' },
  },
  {
    id: 'map-then-take', difficulty: 'hard', tags: ['lesson:assequence', 'asSequence', 'take', 'lazy-trace'], title: 'Map then Take', fileName: 'MapThenTake.kt',
    solution: `fun main() {
  val count = 2
  val r = (1..10).asSequence().map {
    println("map " + it)
    it * it
  }.take(count).toList()
  println("Result: $r")
}`,
    starter: `fun main() {
  val count = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Only the numbers that take needs are mapped: 1 and 2. With count 3: 1, 2 and 3.
    expected: 'map 1\nmap 2\nResult: [1, 4]',
    swap: { variableName: 'count', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'map 1\nmap 2\nmap 3\nResult: [1, 4, 9]' },
  },
  {
    id: 'chain-ops', difficulty: 'medium', tags: ['lesson:intermediate-operations', 'filter', 'map', 'drop', 'take', 'takeWhile'], title: 'Chain Operations', fileName: 'ChainOps.kt',
    solution: `fun main() {
  val limit = 2
  val cap = 5
  val kept = (1..10).asSequence().filter { it % 2 == 0 }.map { it * 3 }.drop(1).take(limit).toList()
  val below = generateSequence(1) { it + 1 }.takeWhile { it < cap }.toList()
  println("Result: $kept")
  println("Below: $below")
}`,
    starter: `fun main() {
  val limit = 2
  val cap = 5

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Evens 2 to 10 times 3 give 6, 12, 18, 24, 30; drop 1 leaves 12, 18, 24, 30; take 2 gives [12, 18]. The endless counter stops before 5: [1, 2, 3, 4]. With limit 3: [12, 18, 24].
    expected: 'Result: [12, 18]\nBelow: [1, 2, 3, 4]',
    swap: { variableName: 'limit', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Result: [12, 18, 24]\nBelow: [1, 2, 3, 4]' },
  },
  {
    id: 'sort-breaks-lazy', difficulty: 'hard', tags: ['lesson:intermediate-operations', 'sorted', 'needs-all-items', 'lazy-trace'], title: 'Sort Breaks Laziness', fileName: 'SortBreaksLazy.kt',
    solution: `fun main() {
  val boost = 2
  val smallest = listOf(3, 1, 2).asSequence()
    .map {
      println("m " + it)
      it * boost
    }
    .sorted()
    .first()
  println("Smallest: " + smallest)
}`,
    starter: `fun main() {
  val boost = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // sorted must see every item, so all three are mapped: 6, 2, 4 and the smallest is 2. With boost 5: 15, 5, 10 and the smallest is 5.
    expected: 'm 3\nm 1\nm 2\nSmallest: 2',
    swap: { variableName: 'boost', originalLiteral: '2', alternateLiteral: '5', alternateExpected: 'm 3\nm 1\nm 2\nSmallest: 5' },
  },
  {
    id: 'run-terminals', difficulty: 'medium', tags: ['lesson:terminal-operations', 'forEach', 'any', 'count', 'terminal'], title: 'Run the Terminals', fileName: 'RunTerminals.kt',
    solution: `fun main() {
  val bonus = 1
  val s = listOf(4, 9, 2, 7).asSequence().map { it + bonus }
  s.forEach { println("v " + it) }
  println("Any big: " + s.any { it > 10 })
  println("Count: " + s.count())
}`,
    starter: `fun main() {
  val bonus = 1

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The values are 5, 10, 3, 8. None is above 10; the count is 4. With bonus 3: 7, 12, 5, 10 and 12 is above 10.
    expected: 'v 5\nv 10\nv 3\nv 8\nAny big: false\nCount: 4',
    swap: { variableName: 'bonus', originalLiteral: '1', alternateLiteral: '3', alternateExpected: 'v 7\nv 12\nv 5\nv 10\nAny big: true\nCount: 4' },
  },
  {
    id: 'find-lazy', difficulty: 'hard', tags: ['lesson:terminal-operations', 'find', 'lazy-trace', 'terminal'], title: 'Find Lazily', fileName: 'FindLazy.kt',
    solution: `fun main() {
  val limit = 5
  val found = (1..100).asSequence().map {
    println("m " + it)
    it * 3
  }.find { it > limit }
  println("Found: " + found)
}`,
    starter: `fun main() {
  val limit = 5

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 1 maps to 3 (not above 5), 2 maps to 6 (found), then it stops. With limit 10: 1 to 4 are mapped and 12 is found.
    expected: 'm 1\nm 2\nFound: 6',
    swap: { variableName: 'limit', originalLiteral: '5', alternateLiteral: '10', alternateExpected: 'm 1\nm 2\nm 3\nm 4\nFound: 12' },
  },
  {
    id: 'item-by-item', difficulty: 'medium', tags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'map', 'filter'], title: 'Item by Item', fileName: 'ItemByItem.kt',
    solution: `fun main() {
  val limit = 2
  val r = sequenceOf(1, 2, 3)
    .map {
      println("double " + it)
      it * 2
    }
    .filter {
      println("keep? " + it)
      it > limit * 2
    }
    .toList()
  println("Result: $r")
}`,
    starter: `fun main() {
  val limit = 2

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Each item goes through both steps before the next item starts. Only 6 is above 4. With limit 1: 4 and 6 are above 2.
    expected: 'double 1\nkeep? 2\ndouble 2\nkeep? 4\ndouble 3\nkeep? 6\nResult: [6]',
    swap: { variableName: 'limit', originalLiteral: '2', alternateLiteral: '1', alternateExpected: 'double 1\nkeep? 2\ndouble 2\nkeep? 4\ndouble 3\nkeep? 6\nResult: [4, 6]' },
  },
  {
    id: 'order-compare', difficulty: 'hard', tags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'eager-vs-lazy', 'trace'], title: 'Compare the Orders', fileName: 'OrderCompare.kt',
    solution: `fun main() {
  val add = 1
  val numbers = listOf(1, 2)
  println("Eager:")
  val eager = numbers.map {
    println("e map " + it)
    it + add
  }.filter {
    println("e filter " + it)
    it % 2 == 0
  }
  println("Lazy:")
  val lazy = numbers.asSequence().map {
    println("s map " + it)
    it + add
  }.filter {
    println("s filter " + it)
    it % 2 == 0
  }.toList()
  println("Same: " + (eager == lazy))
}`,
    starter: `fun main() {
  val add = 1
  val numbers = listOf(1, 2)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The list maps both items, then filters both. The sequence maps and filters one item at a time. Both give [2]. With add 2 the numbers are 3 and 4 and both give [4].
    expected: 'Eager:\ne map 1\ne map 2\ne filter 2\ne filter 3\nLazy:\ns map 1\ns filter 2\ns map 2\ns filter 3\nSame: true',
    swap: { variableName: 'add', originalLiteral: '1', alternateLiteral: '2', alternateExpected: 'Eager:\ne map 1\ne map 2\ne filter 3\ne filter 4\nLazy:\ns map 1\ns filter 3\ns map 2\ns filter 4\nSame: true' },
  },
  {
    id: 'first-match', difficulty: 'medium', tags: ['lesson:short-circuiting', 'first', 'short-circuit', 'filter'], title: 'First Match', fileName: 'FirstMatch.kt',
    solution: `fun main() {
  val limit = 6
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      println("check " + it)
      it > limit
    }
    .first()
  println("Result: " + r)
}`,
    starter: `fun main() {
  val limit = 6

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 5 fails, 8 passes, and first stops there. With limit 10: 5 and 8 fail and 12 passes.
    expected: 'check 5\ncheck 8\nResult: 8',
    swap: { variableName: 'limit', originalLiteral: '6', alternateLiteral: '10', alternateExpected: 'check 5\ncheck 8\ncheck 12\nResult: 12' },
  },
  {
    id: 'any-test', difficulty: 'hard', tags: ['lesson:short-circuiting', 'any', 'count', 'short-circuit'], title: 'Any Test', fileName: 'AnyTest.kt',
    solution: `fun main() {
  val limit = 5
  val nums = listOf(2, 4, 7, 9)
  val found = nums.asSequence().any {
    println("test " + it)
    it > limit
  }
  val total = nums.asSequence().count { it > limit }
  println("Found: " + found)
  println("Total: " + total)
}`,
    starter: `fun main() {
  val limit = 5
  val nums = listOf(2, 4, 7, 9)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // any stops at 7, the first number above 5. count looks at every number: 7 and 9 give 2. With limit 10: any tests all four and finds nothing, and the count is 0.
    expected: 'test 2\ntest 4\ntest 7\nFound: true\nTotal: 2',
    swap: { variableName: 'limit', originalLiteral: '5', alternateLiteral: '10', alternateExpected: 'test 2\ntest 4\ntest 7\ntest 9\nFound: false\nTotal: 0' },
  },
  {
    id: 'list-or-seq', difficulty: 'medium', tags: ['lesson:sequences-vs-collections', 'list-vs-sequence', 'take', 'counters'], title: 'List or Sequence', fileName: 'ListOrSeq.kt',
    solution: `fun main() {
  val count = 2
  var listMaps = 0
  var seqMaps = 0
  val a = (1..10).toList().map {
    listMaps += 1
    it * 2
  }.take(count)
  val b = (1..10).asSequence().map {
    seqMaps += 1
    it * 2
  }.take(count).toList()
  println("List: $a maps=" + listMaps)
  println("Seq: $b maps=" + seqMaps)
}`,
    starter: `fun main() {
  val count = 2
  var listMaps = 0
  var seqMaps = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The list maps all 10 numbers before take; the sequence maps only what take needs. With count 4: the sequence maps 4.
    expected: 'List: [2, 4] maps=10\nSeq: [2, 4] maps=2',
    swap: { variableName: 'count', originalLiteral: '2', alternateLiteral: '4', alternateExpected: 'List: [2, 4, 6, 8] maps=10\nSeq: [2, 4, 6, 8] maps=4' },
  },
  {
    id: 'reuse-pipeline', difficulty: 'hard', tags: ['lesson:sequences-vs-collections', 'sequence-reuse', 're-evaluation', 'counters'], title: 'Reuse a Pipeline', fileName: 'ReusePipeline.kt',
    solution: `fun main() {
  val n = 3
  var seqRuns = 0
  var listRuns = 0
  val seq = (1..n).asSequence().map {
    seqRuns += 1
    it * 2
  }
  val firstPass = seq.toList()
  val secondPass = seq.count()
  val list = (1..n).toList().map {
    listRuns += 1
    it * 2
  }
  val again = list.size
  println("Seq runs: " + seqRuns)
  println("List runs: " + listRuns)
}`,
    starter: `fun main() {
  val n = 3
  var seqRuns = 0
  var listRuns = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // The sequence runs its map again for each terminal call: 3 + 3 = 6. The list keeps its result, so its map runs 3 times. With n 4: 8 and 4.
    expected: 'Seq runs: 6\nList runs: 3',
    swap: { variableName: 'n', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Seq runs: 8\nList runs: 4' },
  },
  {
    id: 'work-saved', difficulty: 'medium', tags: ['lesson:performance-trade-offs', 'performance', 'first', 'counters'], title: 'Work Saved', fileName: 'WorkSaved.kt',
    solution: `fun main() {
  val size = 100
  var listWork = 0
  var seqWork = 0
  val a = (1..size).toList().filter {
    listWork += 1
    it % 7 == 0
  }.first()
  val b = (1..size).asSequence().filter {
    seqWork += 1
    it % 7 == 0
  }.first()
  println("First: " + a)
  println("List checks: " + listWork)
  println("Seq checks: " + seqWork)
}`,
    starter: `fun main() {
  val size = 100
  var listWork = 0
  var seqWork = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Both find 7. The list checks every number (100); the sequence stops at 7 (7 checks). With size 50 the list checks 50.
    expected: 'First: 7\nList checks: 100\nSeq checks: 7',
    swap: { variableName: 'size', originalLiteral: '100', alternateLiteral: '50', alternateExpected: 'First: 7\nList checks: 50\nSeq checks: 7' },
  },
  {
    id: 'sort-costs', difficulty: 'hard', tags: ['lesson:performance-trade-offs', 'performance', 'sorted', 'counters'], title: 'Sort Costs', fileName: 'SortCosts.kt',
    solution: `fun main() {
  val size = 10
  var plain = 0
  var sortedRuns = 0
  val a = (1..size).asSequence().map {
    plain += 1
    it * 3
  }.take(2).toList()
  val b = (1..size).asSequence().map {
    sortedRuns += 1
    it * 3
  }.sorted().take(2).toList()
  println("Plain maps: " + plain)
  println("Sorted maps: " + sortedRuns)
  println("Same result: " + (a == b))
}`,
    starter: `fun main() {
  val size = 10
  var plain = 0
  var sortedRuns = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Without sorted, take 2 needs 2 maps. sorted needs every item, so all 10 are mapped. The results are the same. With size 6: 6 maps with sorted.
    expected: 'Plain maps: 2\nSorted maps: 10\nSame result: true',
    swap: { variableName: 'size', originalLiteral: '10', alternateLiteral: '6', alternateExpected: 'Plain maps: 2\nSorted maps: 6\nSame result: true' },
  },
  {
    id: 'first-square', difficulty: 'medium', tags: ['lesson:when-sequences-should-and-should-not-be-used', 'sequence-for-search', 'list-for-small-data', 'first'], title: 'First Square', fileName: 'FirstSquare.kt',
    solution: `fun main() {
  val limit = 100
  val small = listOf(4, 9, 2)
  val square = (1..1000000).asSequence().map { it * it }.first { it > limit }
  val total = small.sum()
  val biggest = small.maxOrNull()
  println("Square: " + square)
  println("Total: " + total)
  println("Biggest: " + biggest)
}`,
    starter: `fun main() {
  val limit = 100
  val small = listOf(4, 9, 2)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The first square above 100 is 121 (11 times 11). The small list adds up to 15 and its biggest is 9. With limit 200: 225.
    expected: 'Square: 121\nTotal: 15\nBiggest: 9',
    swap: { variableName: 'limit', originalLiteral: '100', alternateLiteral: '200', alternateExpected: 'Square: 225\nTotal: 15\nBiggest: 9' },
  },
  {
    id: 'id-stream', difficulty: 'hard', tags: ['lesson:when-sequences-should-and-should-not-be-used', 'endless-sequence', 'first', 'take'], title: 'Id Stream', fileName: 'IdStream.kt',
    solution: `fun main() {
  val step = 5
  val ids = generateSequence(100) { it + step }
  val firstFour = ids.take(4).toList()
  val over = ids.first { it > 112 }
  println("Ids: $firstFour")
  println("Over 112: " + over)
}`,
    starter: `fun main() {
  val step = 5

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The ids go 100, 105, 110, 115; the first above 112 is 115. With step 3: 100, 103, 106, 109 and the first above 112 is 115 (112 is not above 112).
    expected: 'Ids: [100, 105, 110, 115]\nOver 112: 115',
    swap: { variableName: 'step', originalLiteral: '5', alternateLiteral: '3', alternateExpected: 'Ids: [100, 103, 106, 109]\nOver 112: 115' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'missing-terminal', tags: ['lesson:what-sequences-are', 'lazy', 'terminal-operation'], title: 'Fix the Silent Pipeline', bugType: 'logic', bugLabel: 'Logic Error: no terminal operation, so nothing runs', difficulty: 'medium',
    broken: `fun main() {
  val seq = listOf(1, 2).asSequence().map {
    println("map " + it)
    it * 2
  }
  println("done")
}`,
    fixed: `fun main() {
  val seq = listOf(1, 2).asSequence().map {
    println("map " + it)
    it * 2
  }
  seq.toList()
  println("done")
}`,
    expected: 'map 1\nmap 2\ndone',
  },
  {
    id: 'eager-snapshot', tags: ['lesson:eager-collection-processing', 'eager', 'snapshot', 'mutable-list'], title: 'Fix the Old Copy', bugType: 'logic', bugLabel: 'Logic Error: map made a list at once and it did not change later', difficulty: 'hard',
    broken: `fun main() {
  val nums = mutableListOf(1, 2, 3)
  val doubled = nums.map { it * 2 }
  nums.add(5)
  println(doubled)
}`,
    fixed: `fun main() {
  val nums = mutableListOf(1, 2, 3)
  val doubled = nums.asSequence().map { it * 2 }
  nums.add(5)
  println(doubled.toList())
}`,
    expected: '[2, 4, 6, 10]',
  },
  {
    id: 'forced-early', tags: ['lesson:lazy-processing', 'lazy', 'toList-too-early', 'counters'], title: 'Fix the Early List', bugType: 'logic', bugLabel: 'Logic Error: toList makes the pipeline run on every item', difficulty: 'hard',
    broken: `fun main() {
  var checks = 0
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      checks += 1
      it > 6
    }
    .toList()
    .first()
  println("First: " + r)
  println("Checks: " + checks)
}`,
    fixed: `fun main() {
  var checks = 0
  val r = listOf(5, 8, 12, 3, 20).asSequence()
    .filter {
      checks += 1
      it > 6
    }
    .first()
  println("First: " + r)
  println("Checks: " + checks)
}`,
    expected: 'First: 8\nChecks: 2',
  },
  {
    id: 'wrong-stop', tags: ['lesson:creating-sequences', 'generateSequence', 'stop-condition'], title: 'Fix the Countdown', bugType: 'logic', bugLabel: 'Logic Error: the stop condition lets one extra number through', difficulty: 'medium',
    broken: `fun main() {
  val countdown = generateSequence(10) { if (it > 0) it - 4 else null }.toList()
  println("Countdown: $countdown")
}`,
    fixed: `fun main() {
  val countdown = generateSequence(10) { if (it > 3) it - 4 else null }.toList()
  println("Countdown: $countdown")
}`,
    expected: 'Countdown: [10, 6, 2]',
  },
  {
    id: 'forgot-as-seq', tags: ['lesson:assequence', 'asSequence', 'eager-map', 'first'], title: 'Fix the Eager Range', bugType: 'logic', bugLabel: 'Logic Error: map on a range works on every number', difficulty: 'medium',
    broken: `fun main() {
  val r = (1..10).map {
    println("map " + it)
    it * 2
  }.first()
  println("First: " + r)
}`,
    fixed: `fun main() {
  val r = (1..10).asSequence().map {
    println("map " + it)
    it * 2
  }.first()
  println("First: " + r)
}`,
    expected: 'map 1\nFirst: 2',
  },
  {
    id: 'take-before-filter', tags: ['lesson:intermediate-operations', 'take', 'filter', 'order-of-steps'], title: 'Fix the Step Order', bugType: 'logic', bugLabel: 'Logic Error: take cuts the list before the filter', difficulty: 'medium',
    broken: `fun main() {
  val r = listOf(3, 8, 9, 6).asSequence().take(2).filter { it > 5 }.toList()
  println("Result: $r")
}`,
    fixed: `fun main() {
  val r = listOf(3, 8, 9, 6).asSequence().filter { it > 5 }.take(2).toList()
  println("Result: $r")
}`,
    expected: 'Result: [8, 9]',
  },
  {
    id: 'wrong-terminal', tags: ['lesson:terminal-operations', 'terminal', 'sum-vs-count'], title: 'Fix the Terminal', bugType: 'logic', bugLabel: 'Logic Error: count was used where sum is needed', difficulty: 'medium',
    broken: `fun main() {
  val s = listOf(3, 6, 9).asSequence()
  println("Total: " + s.count())
}`,
    fixed: `fun main() {
  val s = listOf(3, 6, 9).asSequence()
  println("Total: " + s.sum())
}`,
    expected: 'Total: 18',
  },
  {
    id: 'map-before-filter', tags: ['lesson:sequence-evaluation-order', 'evaluation-order', 'filter', 'map'], title: 'Fix the Operation Order', bugType: 'logic', bugLabel: 'Logic Error: the filter sees the doubled numbers', difficulty: 'hard',
    broken: `fun main() {
  val r = listOf(3, 4, 5, 6).asSequence().map { it * 2 }.filter { it > 4 }.toList()
  println("Result: $r")
}`,
    fixed: `fun main() {
  val r = listOf(3, 4, 5, 6).asSequence().filter { it > 4 }.map { it * 2 }.toList()
  println("Result: $r")
}`,
    expected: 'Result: [10, 12]',
  },
  {
    id: 'count-not-any', tags: ['lesson:short-circuiting', 'short-circuit', 'any-vs-count'], title: 'Fix the Search', bugType: 'logic', bugLabel: 'Logic Error: count tests every item instead of stopping', difficulty: 'hard',
    broken: `fun main() {
  val found = listOf(2, 4, 7, 9).asSequence().count {
    println("test " + it)
    it > 5
  } > 0
  println("Found: " + found)
}`,
    fixed: `fun main() {
  val found = listOf(2, 4, 7, 9).asSequence().any {
    println("test " + it)
    it > 5
  }
  println("Found: " + found)
}`,
    expected: 'test 2\ntest 4\ntest 7\nFound: true',
  },
  {
    id: 'reused-sequence', tags: ['lesson:sequences-vs-collections', 'sequence-reuse', 're-evaluation'], title: 'Fix the Repeated Work', bugType: 'logic', bugLabel: 'Logic Error: each terminal operation runs the pipeline again', difficulty: 'hard',
    broken: `fun main() {
  var runs = 0
  val seq = (1..3).asSequence().map {
    runs += 1
    it * 2
  }
  val total = seq.sum()
  val count = seq.count()
  println("Total: " + total + " of " + count)
  println("Runs: " + runs)
}`,
    fixed: `fun main() {
  var runs = 0
  val seq = (1..3).asSequence().map {
    runs += 1
    it * 2
  }
  val list = seq.toList()
  val total = list.sum()
  val count = list.size
  println("Total: " + total + " of " + count)
  println("Runs: " + runs)
}`,
    expected: 'Total: 12 of 3\nRuns: 3',
  },
  {
    id: 'wasted-maps', tags: ['lesson:performance-trade-offs', 'performance', 'order-of-steps', 'counters'], title: 'Fix the Wasted Work', bugType: 'logic', bugLabel: 'Logic Error: map runs on items that the filter throws away', difficulty: 'hard',
    broken: `fun main() {
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6).asSequence()
    .map {
      maps += 1
      it * 2
    }
    .filter { it % 4 == 0 }
    .toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    fixed: `fun main() {
  var maps = 0
  val r = listOf(1, 2, 3, 4, 5, 6).asSequence()
    .filter { it % 2 == 0 }
    .map {
      maps += 1
      it * 2
    }
    .toList()
  println("Result: $r")
  println("Maps: " + maps)
}`,
    expected: 'Result: [4, 8, 12]\nMaps: 3',
  },
  {
    id: 'early-total', tags: ['lesson:when-sequences-should-and-should-not-be-used', 'side-effect', 'lazy', 'terminal'], title: 'Fix the Early Total', bugType: 'logic', bugLabel: 'Logic Error: the total is printed before the sequence runs', difficulty: 'medium',
    broken: `fun main() {
  var total = 0
  val seq = listOf(1, 2, 3).asSequence().map {
    total += it
    it * 2
  }
  println("Total: " + total)
}`,
    fixed: `fun main() {
  var total = 0
  val seq = listOf(1, 2, 3).asSequence().map {
    total += it
    it * 2
  }
  seq.toList()
  println("Total: " + total)
}`,
    expected: 'Total: 6',
  },
];
