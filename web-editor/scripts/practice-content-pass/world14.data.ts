/**
 * World 14 (Sequence Dimension) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world14.spec.ts.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'nothing-yet': {
    summary: 'Build a sequence with a print inside map, and see that nothing runs until toList.',
    goal: 'Build a sequence that prints a line for each item. Print "built" before you ask for the list. See when the prints happen.',
    steps: [
      '**Build the sequence.** Create `val seq` with `listOf(1, 2, 3).asSequence().map { ... }`. Inside, print "map " plus `it`. Then return `it * factor`.',
      '**Print before.** Print "built":\n"built"',
      '**Ask for the list.** Create `val list` with `seq.toList()`.',
      '**Print the list.** Use a string template:\n"map 1"\n"map 2"\n"map 3"\n"List: [3, 6, 9]"',
    ],
    i: ['**Build the sequence.** Use `asSequence().map` and print inside.', '**Print before.** Print "built".', '**Ask for the list.** Call `toList()`.', '**Print the list.** Show the list.'],
    e: ['**Build the sequence.**', '**Print before.**', '**Ask for the list.**', '**Print the list.**'],
  },
  'seq-stats': {
    summary: 'Build a sequence from a range, then ask for its items, its count and its sum.',
    goal: 'Keep the multiples of a number from 1 to 10. Print the items, how many there are, and their sum.',
    steps: [
      '**Build the sequence.** Create `val s` with `(1..10).asSequence().filter { ... }`. Keep the numbers where `it % step == 0`.',
      '**Ask three questions.** Create `val items` with `s.toList()`, `val count` with `s.count()` and `val sum` with `s.sum()`.',
      '**Print three lines.** Use a string template for the list:\n"Items: [3, 6, 9]"\n"Count: 3"\n"Sum: 18"',
    ],
    i: ['**Build the sequence.** Use `filter` and `step`.', '**Ask three questions.** Use `toList()`, `count()` and `sum()`.', '**Print three lines.** Show all three.'],
    e: ['**Build the sequence.**', '**Ask three questions.**', '**Print three lines.**'],
  },
  'eager-trace': {
    summary: 'Chain filter and map on a list and watch each step finish for all items before the next.',
    goal: 'Filter and map a list, and print a line each time a step looks at an item. See the order of the lines.',
    steps: [
      '**Write the filter.** Start `val r` with `listOf(1, 2, 3, 4).filter { ... }`. Inside, print "filter " plus `it`. Return `it % divisor == 0`.',
      '**Write the map.** Add `.map { ... }`. Inside, print "map " plus `it`. Return `it * 10`.',
      '**Print the result.** Use a string template:\n"filter 1"\n"filter 2"\n"filter 3"\n"filter 4"\n"map 2"\n"map 4"\n"R: [20, 40]"',
    ],
    i: ['**Write the filter.** Print each item, keep the even ones.', '**Write the map.** Print each item, multiply by `10`.', '**Print the result.** Show `r`.'],
    e: ['**Write the filter.**', '**Write the map.**', '**Print the result.**'],
  },
  'eager-counts': {
    summary: 'Count how many times filter and map run when you use them on a list.',
    goal: 'Keep the numbers above a limit and double them. Count how many items each step looks at.',
    steps: [
      '**Write the filter.** Start `val r` with `listOf(1, 2, 3, 4, 5, 6).filter { ... }`. Inside, add `1` to `checks`. Return `it > limit`.',
      '**Write the map.** Add `.map { ... }`. Inside, add `1` to `maps`. Return `it * 2`.',
      '**Print the result.** Use a string template:\n"Result: [8, 10, 12]"',
      '**Print the counts.** Print "Checks: " plus `checks`, then "Maps: " plus `maps`:\n"Checks: 6"\n"Maps: 3"',
    ],
    i: ['**Write the filter.** Count each check.', '**Write the map.** Count each map.', '**Print the result.** Show `r`.', '**Print the counts.** Show both counters.'],
    e: ['**Write the filter.**', '**Write the map.**', '**Print the result.**', '**Print the counts.**'],
  },
  'lazy-trace': {
    summary: 'Build a lazy pipeline, print before and after you ask for the list, and watch the order.',
    goal: 'Build a lazy pipeline with prints inside. Print "before" and "after" around the call that runs it.',
    steps: [
      '**Write the filter.** Start `val seq` with `listOf(1, 2, 3, 4).asSequence().filter { ... }`. Inside, print "filter " plus `it`. Return `it % divisor == 0`.',
      '**Write the map.** Add `.map { ... }`. Inside, print "map " plus `it`. Return `it * 10`.',
      '**Print before.** Print "before":\n"before"',
      '**Run the pipeline.** Create `val r` with `seq.toList()`.',
      '**Print after.** Print "after", then "R: " plus the list with a string template:\n"filter 1"\n"filter 2"\n"map 2"\n"filter 3"\n"filter 4"\n"map 4"\n"after"\n"R: [20, 40]"',
    ],
    i: ['**Write the filter.** Print each item, keep the even ones.', '**Write the map.** Print each item, multiply by `10`.', '**Print before.** Print "before".', '**Run the pipeline.** Call `toList()`.', '**Print after.** Show "after" and the list.'],
    e: ['**Write the filter.**', '**Write the map.**', '**Print before.**', '**Run the pipeline.**', '**Print after.**'],
  },
  'lazy-take': {
    summary: 'Use take on a long lazy pipeline and count how little work it does.',
    goal: 'Double the numbers from 1 to 100 but only keep a few. Count how many numbers were really doubled.',
    steps: [
      '**Build the pipeline.** Start `val r` with `(1..100).asSequence().map { ... }`. Inside, add `1` to `maps`. Return `it * 2`.',
      '**Keep a few.** Add `.take(count).toList()`.',
      '**Print two lines.** Use a string template for the list:\n"Result: [2, 4, 6]"\n"Maps: 3"',
    ],
    i: ['**Build the pipeline.** Use `asSequence().map` and count the maps.', '**Keep a few.** Use `take(count)`.', '**Print two lines.** Show the list and `maps`.'],
    e: ['**Build the pipeline.**', '**Keep a few.**', '**Print two lines.**'],
  },
  'make-sequences': {
    summary: 'Make sequences with generateSequence, sequenceOf and a sequence builder.',
    goal: 'Make three sequences in three ways: doubling numbers, a fixed list, and a built list. Print each as a list.',
    steps: [
      '**Make the doubles.** Create `val doubles` with `generateSequence(start) { it * 2 }`. Take the first `6` items and make a list.',
      '**Make the fixed one.** Create `val fixed` with `sequenceOf(3, 1, 2)`. Sort it and make a list.',
      '**Build one.** Create `val built` with `sequence { ... }`. Inside, call `yield(start)`, `yield(start + 1)` and `yield(start + 2)`. Then use `.map { it * 10 }` and make a list.',
      '**Print three lines.** Use string templates:\n"Doubles: [1, 2, 4, 8, 16, 32]"\n"Sorted: [1, 2, 3]"\n"Built: [10, 20, 30]"',
    ],
    i: ['**Make the doubles.** Use `generateSequence` and `take(6)`.', '**Make the fixed one.** Use `sequenceOf` and `sorted()`.', '**Build one.** Use `sequence` and `yield`.', '**Print three lines.** Show all three lists.'],
    e: ['**Make the doubles.**', '**Make the fixed one.**', '**Build one.**', '**Print three lines.**'],
  },
  'countdown': {
    summary: 'Use generateSequence with a rule that returns null to end the sequence.',
    goal: 'Count down from a start number in steps of 4. Stop when the number is 3 or less. Print the numbers and how many there are.',
    steps: [
      '**Make the countdown.** Create `val countdown` with `generateSequence(top) { ... }`. When `it > 3`, return `it - 4`. Otherwise return `null`. Make a list at the end.',
      '**Print the list.** Use a string template:\n"Countdown: [10, 6, 2]"',
      '**Print the size.** Print "Size: " plus `countdown.size`:\n"Size: 3"',
    ],
    i: ['**Make the countdown.** Return `null` to stop.', '**Print the list.** Show the countdown.', '**Print the size.** Show `countdown.size`.'],
    e: ['**Make the countdown.**', '**Print the list.**', '**Print the size.**'],
  },
  'to-sequence': {
    summary: 'Turn a range into a sequence to find the first match without going through all numbers.',
    goal: 'Square a few numbers. Then find the first doubled number, from a very long range, that a given number divides.',
    steps: [
      '**Square the numbers.** Create `val squares` with `(1..n).asSequence().map { ... }`. Return `it * it`. Make a list at the end.',
      '**Find the first match.** Create `val first` with `(1..1000000).asSequence()`. Use `map { it * 2 }`, then `filter { it % k == 0 }`, then `first()`.',
      '**Print two lines.** Use a string template for the list:\n"Squares: [1, 4, 9]"\n"First: 6"',
    ],
    i: ['**Square the numbers.** Use `asSequence`, `map` and `toList()`.', '**Find the first match.** Use `map`, `filter` and `first()`.', '**Print two lines.** Show the squares and the first.'],
    e: ['**Square the numbers.**', '**Find the first match.**', '**Print two lines.**'],
  },
  'map-then-take': {
    summary: 'Use take after map on a range and see which numbers are mapped.',
    goal: 'Square the numbers from 1 to 10 but keep only the first few. Print a line for each number that is squared.',
    steps: [
      '**Start the sequence.** Start `val r` with `(1..10).asSequence().map { ... }`. Inside, print "map " plus `it`. Return `it * it`.',
      '**Keep a few.** Add `.take(count).toList()`.',
      '**Print the result.** Use a string template:\n"map 1"\n"map 2"\n"Result: [1, 4]"',
    ],
    i: ['**Start the sequence.** Print inside `map`.', '**Keep a few.** Use `take(count)`.', '**Print the result.** Show the list.'],
    e: ['**Start the sequence.**', '**Keep a few.**', '**Print the result.**'],
  },
  'chain-ops': {
    summary: 'Chain filter, map, drop and take, and use takeWhile on an endless sequence.',
    goal: 'Keep even numbers, triple them, skip one and keep a few. Then take numbers from an endless counter while they are small.',
    steps: [
      '**Filter and map.** Start `val kept` with `(1..10).asSequence()`. Use `filter { it % 2 == 0 }`, then `map { it * 3 }`.',
      '**Skip and keep.** Add `.drop(1)`, then `.take(limit)`, then `.toList()`.',
      '**Use takeWhile.** Create `val below` with `generateSequence(1) { it + 1 }`. Use `takeWhile { it < cap }` and `toList()`.',
      '**Print two lines.** Use string templates:\n"Result: [12, 18]"\n"Below: [1, 2, 3, 4]"',
    ],
    i: ['**Filter and map.** Even numbers, times `3`.', '**Skip and keep.** Use `drop(1)` and `take(limit)`.', '**Use takeWhile.** Stop before `cap`.', '**Print two lines.** Show both lists.'],
    e: ['**Filter and map.**', '**Skip and keep.**', '**Use takeWhile.**', '**Print two lines.**'],
  },
  'sort-breaks-lazy': {
    summary: 'Use sorted in a sequence and see that it needs every item first.',
    goal: 'Multiply some numbers, sort them, and take the smallest. Print a line for each multiplication, and see how many happen.',
    steps: [
      '**Write the map.** Start `val smallest` with `listOf(3, 1, 2).asSequence().map { ... }`. Inside, print "m " plus `it`. Return `it * boost`.',
      '**Sort and take.** Add `.sorted()`, then `.first()`.',
      '**Print the result.** Print "Smallest: " plus `smallest`:\n"m 3"\n"m 1"\n"m 2"\n"Smallest: 2"',
    ],
    i: ['**Write the map.** Print inside and multiply by `boost`.', '**Sort and take.** Use `sorted()` and `first()`.', '**Print the result.** Show the smallest.'],
    e: ['**Write the map.**', '**Sort and take.**', '**Print the result.**'],
  },
  'run-terminals': {
    summary: 'Use forEach, any and count as terminal operations on the same sequence.',
    goal: 'Add a bonus to some numbers. Print each new number. Then ask if any is big, and count them.',
    steps: [
      '**Build the sequence.** Create `val s` with `listOf(4, 9, 2, 7).asSequence().map { ... }`. Return `it + bonus`.',
      '**Print each value.** Call `s.forEach { ... }`. Inside, print "v " plus `it`.',
      '**Ask if any is big.** Print "Any big: " plus `s.any { it > 10 }`.',
      '**Count them.** Print "Count: " plus `s.count()`:\n"v 5"\n"v 10"\n"v 3"\n"v 8"\n"Any big: false"\n"Count: 4"',
    ],
    i: ['**Build the sequence.** Add `bonus` to each.', '**Print each value.** Use `forEach`.', '**Ask if any is big.** Use `any`.', '**Count them.** Use `count()`.'],
    e: ['**Build the sequence.**', '**Print each value.**', '**Ask if any is big.**', '**Count them.**'],
  },
  'find-lazy': {
    summary: 'Use find on a sequence and watch it stop at the first match.',
    goal: 'Triple the numbers from 1 to 100 and find the first one above a limit. Print a line each time a number is tripled.',
    steps: [
      '**Write the map.** Start `val found` with `(1..100).asSequence().map { ... }`. Inside, print "m " plus `it`. Return `it * 3`.',
      '**Find the first.** Add `.find { it > limit }`.',
      '**Print the result.** Print "Found: " plus `found`:\n"m 1"\n"m 2"\n"Found: 6"',
    ],
    i: ['**Write the map.** Print inside and triple.', '**Find the first.** Use `find` and `limit`.', '**Print the result.** Show `found`.'],
    e: ['**Write the map.**', '**Find the first.**', '**Print the result.**'],
  },
  'item-by-item': {
    summary: 'Use map and filter on a sequence and watch each item go through both steps.',
    goal: 'Double some numbers and keep the big ones. Print a line in each step to see the order.',
    steps: [
      '**Write the map.** Start `val r` with `sequenceOf(1, 2, 3).map { ... }`. Inside, print "double " plus `it`. Return `it * 2`.',
      '**Write the filter.** Add `.filter { ... }`. Inside, print "keep? " plus `it`. Return `it > limit * 2`.',
      '**Make the list.** Add `.toList()`.',
      '**Print the result.** Use a string template:\n"double 1"\n"keep? 2"\n"double 2"\n"keep? 4"\n"double 3"\n"keep? 6"\n"Result: [6]"',
    ],
    i: ['**Write the map.** Print and double.', '**Write the filter.** Print and test `limit * 2`.', '**Make the list.** Call `toList()`.', '**Print the result.** Show `r`.'],
    e: ['**Write the map.**', '**Write the filter.**', '**Make the list.**', '**Print the result.**'],
  },
  'order-compare': {
    summary: 'Run the same steps on a list and on a sequence, and compare the order of the prints.',
    goal: 'Add a number to each item and keep the even ones. Do it with a list and with a sequence, and compare the order of the prints.',
    steps: [
      '**Run it eagerly.** Print "Eager:". Then create `val eager` with `numbers.map { ... }`. Inside, print "e map " plus `it` and return `it + add`. Add `.filter { ... }`. Inside, print "e filter " plus `it` and return `it % 2 == 0`.',
      '**Print the lazy title.** Print "Lazy:":\n"Lazy:"',
      '**Run it lazily.** Create `val lazy` with `numbers.asSequence().map { ... }`. Print "s map " plus `it` and return `it + add`. Add `.filter { ... }`. Print "s filter " plus `it` and return `it % 2 == 0`. End with `.toList()`.',
      '**Compare.** Print "Same: " plus `eager == lazy`:\n"Eager:"\n"e map 1"\n"e map 2"\n"e filter 2"\n"e filter 3"\n"Lazy:"\n"s map 1"\n"s filter 2"\n"s map 2"\n"s filter 3"\n"Same: true"',
    ],
    i: ['**Run it eagerly.** Use a list with prints in `map` and `filter`.', '**Print the lazy title.** Print "Lazy:".', '**Run it lazily.** Use `asSequence` with the same prints.', '**Compare.** Print `eager == lazy`.'],
    e: ['**Run it eagerly.**', '**Print the lazy title.**', '**Run it lazily.**', '**Compare.**'],
  },
  'first-match': {
    summary: 'Use first on a filtered sequence and see that it stops at the first match.',
    goal: 'Find the first number above a limit. Print a line each time a number is checked.',
    steps: [
      '**Write the filter.** Start `val r` with `listOf(5, 8, 12, 3, 20).asSequence().filter { ... }`. Inside, print "check " plus `it`. Return `it > limit`.',
      '**Take the first.** Add `.first()`.',
      '**Print the result.** Print "Result: " plus `r`:\n"check 5"\n"check 8"\n"Result: 8"',
    ],
    i: ['**Write the filter.** Print each check.', '**Take the first.** Use `first()`.', '**Print the result.** Show `r`.'],
    e: ['**Write the filter.**', '**Take the first.**', '**Print the result.**'],
  },
  'any-test': {
    summary: 'Compare any, which stops early, with count, which looks at every item.',
    goal: 'Ask if any number is above a limit, and count how many are. Print a line for each test that any runs.',
    steps: [
      '**Ask with any.** Create `val found` with `nums.asSequence().any { ... }`. Inside, print "test " plus `it`. Return `it > limit`.',
      '**Count them.** Create `val total` with `nums.asSequence().count { it > limit }`.',
      '**Print the answer.** Print "Found: " plus `found`.',
      '**Print the count.** Print "Total: " plus `total`:\n"test 2"\n"test 4"\n"test 7"\n"Found: true"\n"Total: 2"',
    ],
    i: ['**Ask with any.** Print each test.', '**Count them.** Use `count { ... }`.', '**Print the answer.** Show `found`.', '**Print the count.** Show `total`.'],
    e: ['**Ask with any.**', '**Count them.**', '**Print the answer.**', '**Print the count.**'],
  },
  'list-or-seq': {
    summary: 'Use the same map and take on a list and on a sequence, and count the maps.',
    goal: 'Double the numbers 1 to 10 and keep the first few, once with a list and once with a sequence. Count how many numbers are doubled each time.',
    steps: [
      '**Use a list.** Create `val a` with `(1..10).toList().map { ... }`. Inside, add `1` to `listMaps` and return `it * 2`. Add `.take(count)`.',
      '**Use a sequence.** Create `val b` with `(1..10).asSequence().map { ... }`. Inside, add `1` to `seqMaps` and return `it * 2`. Add `.take(count).toList()`.',
      '**Print the list result.** Use a string template for the list, then the counter:\n"List: [2, 4] maps=10"',
      '**Print the sequence result.** Do the same for the sequence:\n"Seq: [2, 4] maps=2"',
    ],
    i: ['**Use a list.** Count the maps in `listMaps`.', '**Use a sequence.** Count the maps in `seqMaps`.', '**Print the list result.** Show the list and `listMaps`.', '**Print the sequence result.** Show the list and `seqMaps`.'],
    e: ['**Use a list.**', '**Use a sequence.**', '**Print the list result.**', '**Print the sequence result.**'],
  },
  'reuse-pipeline': {
    summary: 'See that a sequence runs again for each terminal call, while a list keeps its result.',
    goal: 'Use one sequence for two questions and one list for two questions. Count how often the doubling runs in each.',
    steps: [
      '**Build the sequence.** Create `val seq` with `(1..n).asSequence().map { ... }`. Inside, add `1` to `seqRuns` and return `it * 2`.',
      '**Ask two questions.** Create `val firstPass` with `seq.toList()`. Create `val secondPass` with `seq.count()`.',
      '**Build the list.** Create `val list` with `(1..n).toList().map { ... }`. Inside, add `1` to `listRuns` and return `it * 2`.',
      '**Ask the list.** Create `val again` with `list.size`.',
      '**Print two lines.** Join the text with `+`:\n"Seq runs: 6"\n"List runs: 3"',
    ],
    i: ['**Build the sequence.** Count the runs.', '**Ask two questions.** Use `toList()` and `count()`.', '**Build the list.** Count the runs.', '**Ask the list.** Use `size`.', '**Print two lines.** Show both counters.'],
    e: ['**Build the sequence.**', '**Ask two questions.**', '**Build the list.**', '**Ask the list.**', '**Print two lines.**'],
  },
  'work-saved': {
    summary: 'Find the first multiple of 7 with a list and with a sequence, and count the checks.',
    goal: 'Find the first number that 7 divides, once with a list and once with a sequence. Count how many numbers each way checks.',
    steps: [
      '**Use a list.** Create `val a` with `(1..size).toList().filter { ... }`. Inside, add `1` to `listWork` and return `it % 7 == 0`. End with `.first()`.',
      '**Use a sequence.** Create `val b` with `(1..size).asSequence().filter { ... }`. Inside, add `1` to `seqWork` and return `it % 7 == 0`. End with `.first()`.',
      '**Print three lines.** Join the text with `+`:\n"First: 7"\n"List checks: 100"\n"Seq checks: 7"',
    ],
    i: ['**Use a list.** Count the checks in `listWork`.', '**Use a sequence.** Count the checks in `seqWork`.', '**Print three lines.** Show the first and both counters.'],
    e: ['**Use a list.**', '**Use a sequence.**', '**Print three lines.**'],
  },
  'sort-costs': {
    summary: 'See how sorted makes a sequence do the work for every item, even with take.',
    goal: 'Triple the numbers and take the first two, with and without sorting. Count how many numbers are tripled each time.',
    steps: [
      '**Without sorting.** Create `val a` with `(1..size).asSequence().map { ... }`. Inside, add `1` to `plain` and return `it * 3`. Add `.take(2).toList()`.',
      '**With sorting.** Create `val b` the same way, but count in `sortedRuns`. Add `.sorted().take(2).toList()`.',
      '**Compare the lists.** Create `val same` as `a == b`.',
      '**Print three lines.** Join the text with `+`:\n"Plain maps: 2"\n"Sorted maps: 10"\n"Same result: true"',
    ],
    i: ['**Without sorting.** Use `take(2)`.', '**With sorting.** Add `sorted()` before `take(2)`.', '**Compare the lists.** Create `same`.', '**Print three lines.** Show both counters and the comparison.'],
    e: ['**Without sorting.**', '**With sorting.**', '**Compare the lists.**', '**Print three lines.**'],
  },
  'first-square': {
    summary: 'Use a sequence to search a huge range and a plain list for a small amount of data.',
    goal: 'Find the first square above a limit in a huge range. Then add up a small list and find its biggest number.',
    steps: [
      '**Search the range.** Create `val square` with `(1..1000000).asSequence().map { it * it }`. Add `.first { it > limit }`.',
      '**Use the small list.** Create `val total` with `small.sum()`. Create `val biggest` with `small.maxOrNull()`.',
      '**Print three lines.** Join the text with `+`:\n"Square: 121"\n"Total: 15"\n"Biggest: 9"',
    ],
    i: ['**Search the range.** Use `asSequence`, `map` and `first { ... }`.', '**Use the small list.** Use `sum()` and `maxOrNull()`.', '**Print three lines.** Show all three.'],
    e: ['**Search the range.**', '**Use the small list.**', '**Print three lines.**'],
  },
  'id-stream': {
    summary: 'Use an endless sequence of ids: take a few, and find the first one above a number.',
    goal: 'Make an endless list of ids that grow by a step. Take the first four, and find the first id above 112.',
    steps: [
      '**Make the ids.** Create `val ids` with `generateSequence(100) { it + step }`.',
      '**Take and find.** Create `val firstFour` with `ids.take(4).toList()`. Create `val over` with `ids.first { it > 112 }`.',
      '**Print two lines.** Use a string template for the list:\n"Ids: [100, 105, 110, 115]"\n"Over 112: 115"',
    ],
    i: ['**Make the ids.** Use `generateSequence` and `step`.', '**Take and find.** Use `take(4)` and `first { ... }`.', '**Print two lines.** Show both results.'],
    e: ['**Make the ids.**', '**Take and find.**', '**Print two lines.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'missing-terminal': {
    subtitle: 'The program should print "map 1", "map 2" and "done", but it only prints "done".',
    hints: [
      'Look at the output. Which lines are missing?',
      'A sequence is lazy. Without a terminal operation, the steps never run.',
      'Add a call that asks the sequence for its result, before you print "done".',
    ],
    explanation: '`map` on a sequence only describes the work. Nothing runs until a terminal operation such as `toList()` is called. Calling `seq.toList()` runs the map for both items, so the two lines print before `done`.',
  },
  'eager-snapshot': {
    subtitle: 'The program should print "[2, 4, 6, 10]", but it prints "[2, 4, 6]".',
    hints: [
      'Look at the order of the lines. When is `5` added?',
      'On a list, `map` runs at once and gives a new list. The new list does not change when `nums` changes later.',
      'Use a lazy sequence, and ask for the list after `5` is added.',
    ],
    explanation: '`nums.map { ... }` is eager. It makes the list `[2, 4, 6]` right away, so adding `5` later does not change it. A sequence is lazy: `nums.asSequence().map { ... }` runs when `toList()` is called, after `5` was added, so the result is `[2, 4, 6, 10]`.',
  },
  'forced-early': {
    subtitle: 'The program should print "Checks: 2", but it prints "Checks: 5".',
    hints: [
      'Look at the counter. How many numbers are checked?',
      '`toList()` runs the whole pipeline on every item, before `first()` is called.',
      'Remove the step that builds the full list, so `first()` can stop early.',
    ],
    explanation: '`toList()` is a terminal operation, so it checks all five numbers. Then `first()` only picks from the finished list. Calling `first()` directly on the sequence stops at the first match, `8`, after two checks.',
  },
  'wrong-stop': {
    subtitle: 'The program should print "Countdown: [10, 6, 2]", but it prints "Countdown: [10, 6, 2, -2]".',
    hints: [
      'Look at the last number in the list. Should it be there?',
      'The rule continues while `it > 0`. The number `2` is above `0`, so the next number `-2` is made.',
      'Change the condition so the sequence stops after `2`.',
    ],
    explanation: 'The rule returns `it - 4` while `it > 0`. From `2`, that gives `-2`, which is not wanted. With `it > 3`, the rule returns `null` for `2`, and the sequence ends with `2`.',
  },
  'forgot-as-seq': {
    subtitle: 'The program should print "map 1" and "First: 2", but it prints a "map" line for every number.',
    hints: [
      'Count the "map" lines. How many numbers are doubled?',
      '`map` on a range makes a whole list at once. Then `first()` only picks the first item.',
      'Turn the range into a lazy sequence before you call `map`.',
    ],
    explanation: '`(1..10).map { ... }` is eager, so it doubles all ten numbers and builds a list. With `asSequence()`, the work is lazy, and `first()` stops after the first number. Only `map 1` prints.',
  },
  'take-before-filter': {
    subtitle: 'The program should print "Result: [8, 9]", but it prints "Result: [8]".',
    hints: [
      'Trace the steps by hand. Which numbers does `take(2)` keep?',
      '`take(2)` runs first and keeps `3` and `8`. Then the filter removes `3`.',
      'Change the order, so you filter first and keep the first two matches.',
    ],
    explanation: 'The steps run in the order you write them. `take(2)` cuts the list to `3, 8`, and the filter leaves `[8]`. If `filter` comes first, the matches are `8, 9, 6`, and `take(2)` keeps `[8, 9]`.',
  },
  'wrong-terminal': {
    subtitle: 'The program should print "Total: 18", but it prints "Total: 3".',
    hints: [
      'Look at the number in the output. What does it measure?',
      '`count()` tells how many items there are. It does not add them up.',
      'Use the terminal operation that adds the numbers.',
    ],
    explanation: '`count()` returns the number of items, which is `3`. `sum()` adds the items, `3 + 6 + 9`, and gives `18`.',
  },
  'map-before-filter': {
    subtitle: 'The program should print "Result: [10, 12]", but it prints "Result: [6, 8, 10, 12]".',
    hints: [
      'Look at which numbers the filter sees. Are they the original ones?',
      'The map runs first, so the filter sees `6, 8, 10, 12`. All of them are above `4`.',
      'Change the order, so the filter sees the original numbers.',
    ],
    explanation: 'In a sequence each step works on the output of the step before. With `map` first, the filter tests the doubled numbers, and all pass. With `filter` first, it tests `3, 4, 5, 6`, keeps `5` and `6`, and `map` doubles them to `[10, 12]`.',
  },
  'count-not-any': {
    subtitle: 'The program should stop testing at 7 and print "Found: true", but it tests every number.',
    hints: [
      'Count the "test" lines. How many are printed?',
      '`count` has to look at every item to count it, so it does not stop early.',
      'Use the operation that stops at the first match.',
    ],
    explanation: '`count { ... } > 0` tests all four numbers. `any { ... }` stops as soon as one test is true, so it prints `test 2`, `test 4`, `test 7` and stops. The answer is the same, with less work.',
  },
  'reused-sequence': {
    subtitle: 'The program should print "Runs: 3", but it prints "Runs: 6".',
    hints: [
      'Look at the counter. How many times does the map run?',
      'Each terminal operation, `sum()` and `count()`, runs the whole pipeline again.',
      'Keep the result of the pipeline in a list once, and ask the list your questions.',
    ],
    explanation: 'A sequence does not store results. `seq.sum()` runs the map for three items, and `seq.count()` runs it for three more. Calling `toList()` once stores the result, and then `sum()` and `size` use the stored list, so the map runs only `3` times.',
  },
  'wasted-maps': {
    subtitle: 'The program should print "Maps: 3", but it prints "Maps: 6".',
    hints: [
      'Look at the counter. How many numbers are doubled?',
      'The map runs on every number first, and then the filter throws some away.',
      'Put the filter first, so the map only works on the numbers that you keep. The final result stays the same.',
    ],
    explanation: 'With `map` first, all six numbers are doubled and the filter removes some. With `filter { it % 2 == 0 }` first, only `2, 4, 6` reach the map, which doubles them to `4, 8, 12`. The result is the same, with half the work.',
  },
  'early-total': {
    subtitle: 'The program should print "Total: 6", but it prints "Total: 0".',
    hints: [
      'Look at where `total` is printed. Did the map run before that?',
      'The sequence is lazy, so the code inside `map` has not run yet when `total` is printed.',
      'Run the sequence with a terminal operation before you print `total`.',
    ],
    explanation: 'A sequence only runs when a terminal operation asks for the result. The `total` changes inside `map`, so it is still `0` before that. Calling `seq.toList()` first runs the map, and then `total` is `1 + 2 + 3 = 6`.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'missing-terminal': 'The sequence never runs, because no terminal operation is called.',
  'eager-snapshot': 'A list made by map does not change when the first list changes.',
  'forced-early': 'toList runs every item before first picks one.',
  'wrong-stop': 'The stop condition lets one extra number through.',
  'forgot-as-seq': 'map on a range works on every number.',
  'take-before-filter': 'take cuts the list before the filter runs.',
  'wrong-terminal': 'count gives the number of items, not the sum.',
  'map-before-filter': 'The filter sees the doubled numbers.',
  'count-not-any': 'count tests every item instead of stopping.',
  'reused-sequence': 'Each terminal operation runs the pipeline again.',
  'wasted-maps': 'map runs on items that the filter throws away.',
  'early-total': 'The total is printed before the sequence runs.',
};
