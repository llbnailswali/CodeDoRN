import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 12 -- Generic Realm (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the generics feature (type parameter, bound, in/out, star, reified, alias ...) is named in the step.
//   hard   -- several generics features together, two type parameters, a bound used in a loop, or a value that depends on sharing one object;
//             the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world12.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world12.real.ts). The simulator does not report variance or
// bound violations, and mis-reads class C<out T>, so the in/out/declaration-site/use-site Debug tasks use logic bugs (PITFALLS.md).

export const WORLD_12_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-12-practice-writerun-stack-box',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic class that stores items of any type, and use it with Int.',
    conceptTags: ['lesson:generic-classes', 'generic-class', 'type-parameter', 'nullable-result'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Stack Box',
    goal: 'Write a stack that can hold any type. Push three numbers, take them off again, and see what an empty stack gives.',
    description: '1. **Write the class.** Above `main`, write `class Stack<T>`. Keep a private `mutableListOf<T>()` called `items`. Add `push(x: T)`, `pop(): T?` and `size(): Int`. `pop()` returns `null` for an empty stack. Otherwise it removes and returns the last item.\n\n' +
              '2. **Create the stack.** Create `val s` as `Stack<Int>()`.\n\n' +
              '3. **Push three numbers.** Push `first`, then `first + 5`, then `first + 10`.\n\n' +
              '4. **Pop and print.** Print "Popped: " plus `s.pop()`. Then print "Size: " plus `s.size()`. Then pop and print three more times:\n"Popped: 20"\n"Size: 2"\n"Popped: 15"\n"Popped: 10"\n"Popped: null"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** A generic `Stack<T>` with `push`, `pop` and `size`.',
          '2. **Create the stack.** Use `Stack<Int>`.',
          '3. **Push three numbers.** Start at `first`.',
          '4. **Pop and print.** Show each pop and the size.',
        ],
        comments: [
          '// 1. Write the class. A generic Stack<T> with push, pop and size.',
          '// 2. Create the stack. Use Stack<Int>.',
          '// 3. Push three numbers. Start at first.',
          '// 4. Pop and print. Show each pop and the size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Create the stack.**',
          '3. **Push three numbers.**',
          '4. **Pop and print.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Create the stack.',
          '// 3. Push three numbers.',
          '// 4. Pop and print.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StackBox.kt',
    initialCode: `// 1. Write the class. Above main, write class Stack<T>. Keep a private mutableListOf<T>() called items. Add push(x: T), pop(): T? and size(): Int. pop() returns null for an empty stack. Otherwise it removes and returns the last item.

fun main() {
  val first = 10

  // 2. Create the stack. Create val s as Stack<Int>().

  // 3. Push three numbers. Push first, then first + 5, then first + 10.

  // 4. Pop and print. Print "Popped: " plus s.pop(). Then print "Size: " plus s.size(). Then pop and print three more times: "Popped: 20" "Size: 2" "Popped: 15" "Popped: 10" "Popped: null"
}`,
    solutionCode: `class Stack<T> {
  private val items = mutableListOf<T>()

  fun push(x: T) {
    items.add(x)
  }

  fun pop(): T? {
    if (items.isEmpty()) {
      return null
    }
    return items.removeAt(items.size - 1)
  }

  fun size(): Int {
    return items.size
  }
}

fun main() {
  val first = 10
  val s = Stack<Int>()
  s.push(first)
  s.push(first + 5)
  s.push(first + 10)
  println("Popped: " + s.pop())
  println("Size: " + s.size())
  println("Popped: " + s.pop())
  println("Popped: " + s.pop())
  println("Popped: " + s.pop())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Popped: 20\nSize: 2\nPopped: 15\nPopped: 10\nPopped: null',
    testCase: { call: '', expected: 'Popped: 20\nSize: 2\nPopped: 15\nPopped: 10\nPopped: null' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'first', originalLiteral: '10', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Popped: 11\nSize: 2\nPopped: 6\nPopped: 1\nPopped: null',
    },
  },
  {
    id: 'world-12-practice-writerun-pair-swap',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write a class with two type parameters and a function that swaps them.',
    conceptTags: ['lesson:generic-classes', 'generic-class', 'two-type-parameters', 'swapped-types'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pair Swap',
    goal: 'Write a pair that holds two values of different types. Swap the two values and print them.',
    description: '1. **Write the class.** Above `main`, write `class Pair2<A, B>(val first: A, val second: B)`. Add `swap(): Pair2<B, A>`. It returns a new `Pair2` with `second` first.\n\n' +
              '2. **Create the pair.** Create `val p` as `Pair2("x", n)`.\n\n' +
              '3. **Print the pair.** Join `p.first`, a space and `p.second`:\n"x 5"\n\n' +
              '4. **Swap and print.** Create `val q` with `p.swap()`. Use `q.first.toString()` so `+` joins text:\n"5 x"\n\n' +
              '5. **Swap back.** Create `val r` with `q.swap()`. Print `r.first`:\n"x"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** Two type parameters and a `swap()`.',
          '2. **Create the pair.** A text and a number.',
          '3. **Print the pair.** Show both values.',
          '4. **Swap and print.** Show the swapped pair.',
          '5. **Swap back.** Print the first value.',
        ],
        comments: [
          '// 1. Write the class. Two type parameters and a swap().',
          '// 2. Create the pair. A text and a number.',
          '// 3. Print the pair. Show both values.',
          '// 4. Swap and print. Show the swapped pair.',
          '// 5. Swap back. Print the first value.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Create the pair.**',
          '3. **Print the pair.**',
          '4. **Swap and print.**',
          '5. **Swap back.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Create the pair.',
          '// 3. Print the pair.',
          '// 4. Swap and print.',
          '// 5. Swap back.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PairSwap.kt',
    initialCode: `// 1. Write the class. Above main, write class Pair2<A, B>(val first: A, val second: B). Add swap(): Pair2<B, A>. It returns a new Pair2 with second first.

fun main() {
  val n = 5

  // 2. Create the pair. Create val p as Pair2("x", n).

  // 3. Print the pair. Join p.first, a space and p.second: "x 5"

  // 4. Swap and print. Create val q with p.swap(). Use q.first.toString() so + joins text: "5 x"

  // 5. Swap back. Create val r with q.swap(). Print r.first: "x"
}`,
    solutionCode: `class Pair2<A, B>(val first: A, val second: B) {
  fun swap(): Pair2<B, A> {
    return Pair2(second, first)
  }
}

fun main() {
  val n = 5
  val p = Pair2("x", n)
  val q = p.swap()
  println(p.first + " " + p.second)
  println(q.first.toString() + " " + q.second)
  val r = q.swap()
  println(r.first)
}`,
    sampleInput: 'main()',
    expectedOutput: 'x 5\n5 x\nx',
    testCase: { call: '', expected: 'x 5\n5 x\nx' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '5', alternateLiteral: '8' }],
      alternateExpectedOutput: 'x 8\n8 x\nx',
    },
  },
  {
    id: 'world-12-practice-writerun-first-or',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write two generic functions that work for any type, and call them with different types.',
    conceptTags: ['lesson:generic-functions', 'generic-function', 'inferred-type', 'fallback'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'First or Fallback',
    goal: 'Write a function that gives the first item of a list, or a fallback when the list is empty. Write another that joins two values. Print the results.',
    description: '1. **Write firstOr.** Above `main`, write `fun <T> firstOr(list: List<T>, fallback: T): T`. When the list is empty, return `fallback`. Otherwise return `list[0]`.\n\n' +
              '2. **Write pairUp.** Write `fun <A, B> pairUp(a: A, b: B): Pair<A, B>`. It returns `Pair(a, b)`.\n\n' +
              '3. **Use firstOr with numbers.** Print `firstOr(listOf<Int>(), spare)`, then `firstOr(listOf(4, 5), spare)`:\n"0"\n"4"\n\n' +
              '4. **Use firstOr with text.** Print `firstOr(listOf<String>(), "none")`:\n"none"\n\n' +
              '5. **Use pairUp.** Print `pairUp("a", spare)`:\n"(a, 0)"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write firstOr.** Return the fallback for an empty list.',
          '2. **Write pairUp.** Return a `Pair`.',
          '3. **Use firstOr with numbers.** Try an empty and a full list.',
          '4. **Use firstOr with text.** Try an empty list of text.',
          '5. **Use pairUp.** Print the pair.',
        ],
        comments: [
          '// 1. Write firstOr. Return the fallback for an empty list.',
          '// 2. Write pairUp. Return a Pair.',
          '// 3. Use firstOr with numbers. Try an empty and a full list.',
          '// 4. Use firstOr with text. Try an empty list of text.',
          '// 5. Use pairUp. Print the pair.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write firstOr.**',
          '2. **Write pairUp.**',
          '3. **Use firstOr with numbers.**',
          '4. **Use firstOr with text.**',
          '5. **Use pairUp.**',
        ],
        comments: [
          '// 1. Write firstOr.',
          '// 2. Write pairUp.',
          '// 3. Use firstOr with numbers.',
          '// 4. Use firstOr with text.',
          '// 5. Use pairUp.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FirstOr.kt',
    initialCode: `// 1. Write firstOr. Above main, write fun <T> firstOr(list: List<T>, fallback: T): T. When the list is empty, return fallback. Otherwise return list[0].

// 2. Write pairUp. Write fun <A, B> pairUp(a: A, b: B): Pair<A, B>. It returns Pair(a, b).

fun main() {
  val spare = 0

  // 3. Use firstOr with numbers. Print firstOr(listOf<Int>(), spare), then firstOr(listOf(4, 5), spare): "0" "4"

  // 4. Use firstOr with text. Print firstOr(listOf<String>(), "none"): "none"

  // 5. Use pairUp. Print pairUp("a", spare): "(a, 0)"
}`,
    solutionCode: `fun <T> firstOr(list: List<T>, fallback: T): T {
  if (list.isEmpty()) {
    return fallback
  }
  return list[0]
}

fun <A, B> pairUp(a: A, b: B): Pair<A, B> {
  return Pair(a, b)
}

fun main() {
  val spare = 0
  println(firstOr(listOf<Int>(), spare))
  println(firstOr(listOf(4, 5), spare))
  println(firstOr(listOf<String>(), "none"))
  println(pairUp("a", spare))
}`,
    sampleInput: 'main()',
    expectedOutput: '0\n4\nnone\n(a, 0)',
    testCase: { call: '', expected: '0\n4\nnone\n(a, 0)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'spare', originalLiteral: '0', alternateLiteral: '9' }],
      alternateExpectedOutput: '9\n4\nnone\n(a, 9)',
    },
  },
  {
    id: 'world-12-practice-writerun-map-all',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write a generic function that changes every item with a function, and use it three ways.',
    conceptTags: ['lesson:generic-functions', 'generic-function', 'two-type-parameters', 'function-parameter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Map All',
    goal: 'Write a function that changes each item of a list with a function you give it. Use it to square numbers, measure words and shift numbers.',
    description: '1. **Write mapAll.** Above `main`, write `fun <T, R> mapAll(list: List<T>, f: (T) -> R): List<R>`. Make a `mutableListOf<R>()`. Loop over `list` and add `f(x)` for each item. Return the list.\n\n' +
              '2. **Square the numbers.** Create `val squares` with `mapAll(listOf(1, 2, 3)) { ... }`. Return `it * it`.\n\n' +
              '3. **Measure the words.** Create `val lengths` with `mapAll(listOf("a", "bb")) { ... }`. Return `it.length`.\n\n' +
              '4. **Shift the numbers.** Create `val shifted` with `mapAll(listOf(1, 2, 3)) { ... }`. Return `it + offset`.\n\n' +
              '5. **Print three lines.** Use string templates:\n"Squares: [1, 4, 9]"\n"Lengths: [1, 2]"\n"Shifted: [11, 12, 13]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write mapAll.** Loop and collect `f(x)`.',
          '2. **Square the numbers.** Multiply `it` by itself.',
          '3. **Measure the words.** Use `it.length`.',
          '4. **Shift the numbers.** Add `offset`.',
          '5. **Print three lines.** Show the three lists.',
        ],
        comments: [
          '// 1. Write mapAll. Loop and collect f(x).',
          '// 2. Square the numbers. Multiply it by itself.',
          '// 3. Measure the words. Use it.length.',
          '// 4. Shift the numbers. Add offset.',
          '// 5. Print three lines. Show the three lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write mapAll.**',
          '2. **Square the numbers.**',
          '3. **Measure the words.**',
          '4. **Shift the numbers.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Write mapAll.',
          '// 2. Square the numbers.',
          '// 3. Measure the words.',
          '// 4. Shift the numbers.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MapAll.kt',
    initialCode: `// 1. Write mapAll. Above main, write fun <T, R> mapAll(list: List<T>, f: (T) -> R): List<R>. Make a mutableListOf<R>(). Loop over list and add f(x) for each item. Return the list.

fun main() {
  val offset = 10

  // 2. Square the numbers. Create val squares with mapAll(listOf(1, 2, 3)) { ... }. Return it * it.

  // 3. Measure the words. Create val lengths with mapAll(listOf("a", "bb")) { ... }. Return it.length.

  // 4. Shift the numbers. Create val shifted with mapAll(listOf(1, 2, 3)) { ... }. Return it + offset.

  // 5. Print three lines. Use string templates: "Squares: [1, 4, 9]" "Lengths: [1, 2]" "Shifted: [11, 12, 13]"
}`,
    solutionCode: `fun <T, R> mapAll(list: List<T>, f: (T) -> R): List<R> {
  val out = mutableListOf<R>()
  for (x in list) {
    out.add(f(x))
  }
  return out
}

fun main() {
  val offset = 10
  val squares = mapAll(listOf(1, 2, 3)) { it * it }
  val lengths = mapAll(listOf("a", "bb")) { it.length }
  val shifted = mapAll(listOf(1, 2, 3)) { it + offset }
  println("Squares: $squares")
  println("Lengths: $lengths")
  println("Shifted: $shifted")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Squares: [1, 4, 9]\nLengths: [1, 2]\nShifted: [11, 12, 13]',
    testCase: { call: '', expected: 'Squares: [1, 4, 9]\nLengths: [1, 2]\nShifted: [11, 12, 13]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'offset', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Squares: [1, 4, 9]\nLengths: [1, 2]\nShifted: [21, 22, 23]',
    },
  },
  {
    id: 'world-12-practice-writerun-entry-describe',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a class and a function that each use two type parameters, K and V.',
    conceptTags: ['lesson:type-parameters', 'two-type-parameters', 'generic-class', 'generic-function'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Entry Describe',
    goal: 'Write an entry that holds a key and a value of any types. Describe two entries with different types.',
    description: '1. **Write the class.** Above `main`, write `class Entry<K, V>(val key: K, val value: V)`.\n\n' +
              '2. **Write describe.** Write `fun <K, V> describe(e: Entry<K, V>): String`. It returns `e.key.toString()`, then "=", then `e.value`.\n\n' +
              '3. **Create two entries.** Create `val pen` as `Entry("pen", qty)`. Create `val seven` as `Entry(7, "seven")`.\n\n' +
              '4. **Print two lines.** Print `describe(pen)`, then `describe(seven)`:\n"pen=3"\n"7=seven"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** Two type parameters, `K` and `V`.',
          '2. **Write describe.** Join the key and the value.',
          '3. **Create two entries.** Use different types.',
          '4. **Print two lines.** Describe both.',
        ],
        comments: [
          '// 1. Write the class. Two type parameters, K and V.',
          '// 2. Write describe. Join the key and the value.',
          '// 3. Create two entries. Use different types.',
          '// 4. Print two lines. Describe both.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Write describe.**',
          '3. **Create two entries.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Write describe.',
          '// 3. Create two entries.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'EntryDescribe.kt',
    initialCode: `// 1. Write the class. Above main, write class Entry<K, V>(val key: K, val value: V).

// 2. Write describe. Write fun <K, V> describe(e: Entry<K, V>): String. It returns e.key.toString(), then "=", then e.value.

fun main() {
  val qty = 3

  // 3. Create two entries. Create val pen as Entry("pen", qty). Create val seven as Entry(7, "seven").

  // 4. Print two lines. Print describe(pen), then describe(seven): "pen=3" "7=seven"
}`,
    solutionCode: `class Entry<K, V>(val key: K, val value: V)

fun <K, V> describe(e: Entry<K, V>): String {
  return e.key.toString() + "=" + e.value
}

fun main() {
  val qty = 3
  val pen = Entry("pen", qty)
  val seven = Entry(7, "seven")
  println(describe(pen))
  println(describe(seven))
}`,
    sampleInput: 'main()',
    expectedOutput: 'pen=3\n7=seven',
    testCase: { call: '', expected: 'pen=3\n7=seven' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'qty', originalLiteral: '3', alternateLiteral: '8' }],
      alternateExpectedOutput: 'pen=8\n7=seven',
    },
  },
  {
    id: 'world-12-practice-writerun-explicit-types',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Give type arguments by hand where Kotlin cannot guess them, for lists and a generic class.',
    conceptTags: ['lesson:type-parameters', 'explicit-type-argument', 'empty-collection', 'generic-class'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Explicit Types',
    goal: 'Make lists and boxes with explicit type arguments. Print the contents and the sizes.',
    description: 'The class `Box<T>(val value: T)` is in the starter code.\n\n' +
              '1. **Make a list of numbers.** Create `val nums` with `listOf<Int>(start, start + 1)`.\n\n' +
              '2. **Make a text list.** Create `val names` as `mutableListOf<String>()`. Add the text "a" to it.\n\n' +
              '3. **Make an empty list.** Create `val empty` with `emptyList<String>()`.\n\n' +
              '4. **Make two boxes.** Create `val box` as `Box<Int>(start * 2)`. Create `val label` as `Box<String>("n")`.\n\n' +
              '5. **Print five lines.** Use a string template for the list:\n"Nums: [4, 5]"\n"Names: 1"\n"Empty: 0"\n"Box: 8"\n"Label: n"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make a list of numbers.** Use `listOf<Int>`.',
          '2. **Make a text list.** Add one text.',
          '3. **Make an empty list.** Use `emptyList<String>()`.',
          '4. **Make two boxes.** Use `Box<Int>` and `Box<String>`.',
          '5. **Print five lines.** Show the list, two sizes and two boxes.',
        ],
        comments: [
          '// 1. Make a list of numbers. Use listOf<Int>.',
          '// 2. Make a text list. Add one text.',
          '// 3. Make an empty list. Use emptyList<String>().',
          '// 4. Make two boxes. Use Box<Int> and Box<String>.',
          '// 5. Print five lines. Show the list, two sizes and two boxes.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make a list of numbers.**',
          '2. **Make a text list.**',
          '3. **Make an empty list.**',
          '4. **Make two boxes.**',
          '5. **Print five lines.**',
        ],
        comments: [
          '// 1. Make a list of numbers.',
          '// 2. Make a text list.',
          '// 3. Make an empty list.',
          '// 4. Make two boxes.',
          '// 5. Print five lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ExplicitTypes.kt',
    initialCode: `class Box<T>(val value: T)

fun main() {
  val start = 4

  // 1. Make a list of numbers. Create val nums with listOf<Int>(start, start + 1).

  // 2. Make a text list. Create val names as mutableListOf<String>(). Add the text "a" to it.

  // 3. Make an empty list. Create val empty with emptyList<String>().

  // 4. Make two boxes. Create val box as Box<Int>(start * 2). Create val label as Box<String>("n").

  // 5. Print five lines. Use a string template for the list: "Nums: [4, 5]" "Names: 1" "Empty: 0" "Box: 8" "Label: n"
}`,
    solutionCode: `class Box<T>(val value: T)

fun main() {
  val start = 4
  val nums = listOf<Int>(start, start + 1)
  val names = mutableListOf<String>()
  names.add("a")
  val empty = emptyList<String>()
  val box = Box<Int>(start * 2)
  val label = Box<String>("n")
  println("Nums: $nums")
  println("Names: " + names.size)
  println("Empty: " + empty.size)
  println("Box: " + box.value)
  println("Label: " + label.value)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Nums: [4, 5]\nNames: 1\nEmpty: 0\nBox: 8\nLabel: n',
    testCase: { call: '', expected: 'Nums: [4, 5]\nNames: 1\nEmpty: 0\nBox: 8\nLabel: n' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '4', alternateLiteral: '9' }],
      alternateExpectedOutput: 'Nums: [9, 10]\nNames: 1\nEmpty: 0\nBox: 18\nLabel: n',
    },
  },
  {
    id: 'world-12-practice-writerun-max-of-list',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic function that needs T to be Comparable, and use it on numbers and text.',
    conceptTags: ['lesson:generic-constraints', 'comparable-bound', 'generic-function', 'int-and-string'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Biggest of a List',
    goal: 'Find the biggest item in a list. It must work for numbers and for text.',
    description: '1. **Write maxOfList.** Above `main`, write `fun <T : Comparable<T>> maxOfList(list: List<T>): T`. Start with `var best = list[0]`. Loop over `list`. When `x > best`, set `best` to `x`. Return `best`.\n\n' +
              '2. **Try numbers.** Print `maxOfList(listOf(3, 9, 4))`:\n"9"\n\n' +
              '3. **Try words.** Print `maxOfList(listOf("kiwi", "apple", "zebra"))`:\n"zebra"\n\n' +
              '4. **Try with the extra number.** Print `maxOfList(listOf(3, 9, extra))`:\n"10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write maxOfList.** Compare items with `>`.',
          '2. **Try numbers.** Use `3, 9, 4`.',
          '3. **Try words.** Use three fruit names.',
          '4. **Try with the extra number.** Use `extra` as the last item.',
        ],
        comments: [
          '// 1. Write maxOfList. Compare items with >.',
          '// 2. Try numbers. Use 3, 9, 4.',
          '// 3. Try words. Use three fruit names.',
          '// 4. Try with the extra number. Use extra as the last item.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write maxOfList.**',
          '2. **Try numbers.**',
          '3. **Try words.**',
          '4. **Try with the extra number.**',
        ],
        comments: [
          '// 1. Write maxOfList.',
          '// 2. Try numbers.',
          '// 3. Try words.',
          '// 4. Try with the extra number.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MaxOfList.kt',
    initialCode: `// 1. Write maxOfList. Above main, write fun <T : Comparable<T>> maxOfList(list: List<T>): T. Start with var best = list[0]. Loop over list. When x > best, set best to x. Return best.

fun main() {
  val extra = 10

  // 2. Try numbers. Print maxOfList(listOf(3, 9, 4)): "9"

  // 3. Try words. Print maxOfList(listOf("kiwi", "apple", "zebra")): "zebra"

  // 4. Try with the extra number. Print maxOfList(listOf(3, 9, extra)): "10"
}`,
    solutionCode: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x > best) {
      best = x
    }
  }
  return best
}

fun main() {
  val extra = 10
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
  println(maxOfList(listOf(3, 9, extra)))
}`,
    sampleInput: 'main()',
    expectedOutput: '9\nzebra\n10',
    testCase: { call: '', expected: '9\nzebra\n10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '10', alternateLiteral: '2' }],
      alternateExpectedOutput: '9\nzebra\n9',
    },
  },
  {
    id: 'world-12-practice-writerun-number-total',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic function that needs T to be a Number, and add up the values.',
    conceptTags: ['lesson:generic-constraints', 'number-bound', 'generic-function', 'toInt'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Number Total',
    goal: 'Add up a list of numbers. The function must accept any kind of number list.',
    description: '1. **Write sumOf.** Above `main`, write `fun <T : Number> sumOf(list: List<T>): Int`. Keep `var t = 0`. Loop over `list` and add `x.toInt()` to `t`. Return `t`.\n\n' +
              '2. **Add a simple list.** Print `sumOf(listOf(1, 2, 3))`:\n"6"\n\n' +
              '3. **Add the extra values.** Print `sumOf(listOf(extra, extra * 2))`:\n"12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write sumOf.** Use `T : Number` and `toInt()`.',
          '2. **Add a simple list.** Use `1, 2, 3`.',
          '3. **Add the extra values.** Use `extra` and `extra * 2`.',
        ],
        comments: [
          '// 1. Write sumOf. Use T : Number and toInt().',
          '// 2. Add a simple list. Use 1, 2, 3.',
          '// 3. Add the extra values. Use extra and extra * 2.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write sumOf.**',
          '2. **Add a simple list.**',
          '3. **Add the extra values.**',
        ],
        comments: [
          '// 1. Write sumOf.',
          '// 2. Add a simple list.',
          '// 3. Add the extra values.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NumberTotal.kt',
    initialCode: `// 1. Write sumOf. Above main, write fun <T : Number> sumOf(list: List<T>): Int. Keep var t = 0. Loop over list and add x.toInt() to t. Return t.

fun main() {
  val extra = 4

  // 2. Add a simple list. Print sumOf(listOf(1, 2, 3)): "6"

  // 3. Add the extra values. Print sumOf(listOf(extra, extra * 2)): "12"
}`,
    solutionCode: `fun <T : Number> sumOf(list: List<T>): Int {
  var t = 0
  for (x in list) {
    t += x.toInt()
  }
  return t
}

fun main() {
  val extra = 4
  println(sumOf(listOf(1, 2, 3)))
  println(sumOf(listOf(extra, extra * 2)))
}`,
    sampleInput: 'main()',
    expectedOutput: '6\n12',
    testCase: { call: '', expected: '6\n12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '4', alternateLiteral: '5' }],
      alternateExpectedOutput: '6\n15',
    },
  },
  {
    id: 'world-12-practice-writerun-crate-label',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a function whose type must follow two interfaces at once, using a where clause.',
    conceptTags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'generic-function'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Crate Label',
    goal: 'A crate has a label and a size. Write a function that works with anything that has both. Describe two crates.',
    description: 'The interfaces `Named` and `Sized` and the class `Crate` are in the starter code.\n\n' +
              '1. **Write describe.** Above `main`, write `fun <T> describe(x: T): String where T : Named, T : Sized`. It returns `x.label()`, then ":", then `x.size()`.\n\n' +
              '2. **Describe the first crate.** Print `describe(Crate("box", n))`:\n"box:4"\n\n' +
              '3. **Describe the second crate.** Print `describe(Crate("bag", n * 2))`:\n"bag:8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write describe.** Use a `where` clause with both interfaces.',
          '2. **Describe the first crate.** Use `n` as the size.',
          '3. **Describe the second crate.** Use `n * 2` as the size.',
        ],
        comments: [
          '// 1. Write describe. Use a where clause with both interfaces.',
          '// 2. Describe the first crate. Use n as the size.',
          '// 3. Describe the second crate. Use n * 2 as the size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write describe.**',
          '2. **Describe the first crate.**',
          '3. **Describe the second crate.**',
        ],
        comments: [
          '// 1. Write describe.',
          '// 2. Describe the first crate.',
          '// 3. Describe the second crate.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CrateLabel.kt',
    initialCode: `interface Named {
  fun label(): String
}

interface Sized {
  fun size(): Int
}

class Crate(val tag: String, val n: Int) : Named, Sized {
  override fun label(): String {
    return tag
  }

  override fun size(): Int {
    return n
  }
}

// 1. Write describe. Above main, write fun <T> describe(x: T): String where T : Named, T : Sized. It returns x.label(), then ":", then x.size().

fun main() {
  val n = 4

  // 2. Describe the first crate. Print describe(Crate("box", n)): "box:4"

  // 3. Describe the second crate. Print describe(Crate("bag", n * 2)): "bag:8"
}`,
    solutionCode: `interface Named {
  fun label(): String
}

interface Sized {
  fun size(): Int
}

class Crate(val tag: String, val n: Int) : Named, Sized {
  override fun label(): String {
    return tag
  }

  override fun size(): Int {
    return n
  }
}

fun <T> describe(x: T): String where T : Named, T : Sized {
  return x.label() + ":" + x.size()
}

fun main() {
  val n = 4
  println(describe(Crate("box", n)))
  println(describe(Crate("bag", n * 2)))
}`,
    sampleInput: 'main()',
    expectedOutput: 'box:4\nbag:8',
    testCase: { call: '', expected: 'box:4\nbag:8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '4', alternateLiteral: '5' }],
      alternateExpectedOutput: 'box:5\nbag:10',
    },
  },
  {
    id: 'world-12-practice-writerun-cheapest-item',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Use a where clause with two bounds in a loop, and a single bound in another function.',
    conceptTags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'loop-with-bounds'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Cheapest Item',
    goal: 'A list of items has names and prices. Find the cheapest item and add up all the prices.',
    description: 'The interfaces `Named` and `Priced` and the class `Item` are in the starter code.\n\n' +
              '1. **Write cheapest.** Above `main`, write `fun <T> cheapest(items: List<T>): String where T : Named, T : Priced`. Start with `var best = items[0]`. Loop over `items`. When `x.price()` is less than `best.price()`, set `best` to `x`. Return `best.label()`, " costs " and `best.price()`.\n\n' +
              '2. **Write total.** Write `fun <T : Priced> total(items: List<T>): Int`. Add up `x.price()` for every item and return the sum.\n\n' +
              '3. **Make the list.** Create `val items` with `Item("pen", 12)`, `Item("cap", extra)` and `Item("bag", 30)`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Cheapest: cap costs 8"\n"Total: 50"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write cheapest.** Keep the item with the lowest price.',
          '2. **Write total.** Add up the prices.',
          '3. **Make the list.** Three items.',
          '4. **Print two lines.** Show the cheapest and the total.',
        ],
        comments: [
          '// 1. Write cheapest. Keep the item with the lowest price.',
          '// 2. Write total. Add up the prices.',
          '// 3. Make the list. Three items.',
          '// 4. Print two lines. Show the cheapest and the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write cheapest.**',
          '2. **Write total.**',
          '3. **Make the list.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write cheapest.',
          '// 2. Write total.',
          '// 3. Make the list.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CheapestItem.kt',
    initialCode: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

// 1. Write cheapest. Above main, write fun <T> cheapest(items: List<T>): String where T : Named, T : Priced. Start with var best = items[0]. Loop over items. When x.price() is less than best.price(), set best to x. Return best.label(), " costs " and best.price().

// 2. Write total. Write fun <T : Priced> total(items: List<T>): Int. Add up x.price() for every item and return the sum.

fun main() {
  val extra = 8

  // 3. Make the list. Create val items with Item("pen", 12), Item("cap", extra) and Item("bag", 30).

  // 4. Print two lines. Join the text with +: "Cheapest: cap costs 8" "Total: 50"
}`,
    solutionCode: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() < best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun <T : Priced> total(items: List<T>): Int {
  var t = 0
  for (x in items) {
    t += x.price()
  }
  return t
}

fun main() {
  val extra = 8
  val items = listOf(Item("pen", 12), Item("cap", extra), Item("bag", 30))
  println("Cheapest: " + cheapest(items))
  println("Total: " + total(items))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Cheapest: cap costs 8\nTotal: 50',
    testCase: { call: '', expected: 'Cheapest: cap costs 8\nTotal: 50' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '8', alternateLiteral: '15' }],
      alternateExpectedOutput: 'Cheapest: pen costs 12\nTotal: 57',
    },
  },
  {
    id: 'world-12-practice-writerun-shared-sink',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write one consumer of Any and use it where a consumer of Int and a consumer of String are expected.',
    conceptTags: ['lesson:in-variance', 'in-variance', 'consumer', 'shared-object'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Shared Sink',
    goal: 'A log accepts anything. Use the same log for numbers and for words. Print how many lines it got and the last one.',
    description: 'The interface `Sink<in T>` and the functions `fillInts` and `fillWords` are in the starter code.\n\n' +
              '1. **Write the log.** Above `main`, write `class Log : Sink<Any>`. Give it `var lines = 0` and `var last: Any = ""`. Override `put(x: Any)`. Add `1` to `lines` and set `last` to `x`.\n\n' +
              '2. **Create the log.** Create `val log` as `Log()`.\n\n' +
              '3. **Fill it.** Call `fillInts(log, count)`, then `fillWords(log)`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Lines: 5"\n"Last: b"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the log.** Implement `Sink<Any>` and count the lines.',
          '2. **Create the log.** One `Log` object.',
          '3. **Fill it.** Use the same log for both calls.',
          '4. **Print two lines.** Show `lines` and `last`.',
        ],
        comments: [
          '// 1. Write the log. Implement Sink<Any> and count the lines.',
          '// 2. Create the log. One Log object.',
          '// 3. Fill it. Use the same log for both calls.',
          '// 4. Print two lines. Show lines and last.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the log.**',
          '2. **Create the log.**',
          '3. **Fill it.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the log.',
          '// 2. Create the log.',
          '// 3. Fill it.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SharedSink.kt',
    initialCode: `interface Sink<in T> {
  fun put(x: T)
}

fun fillInts(s: Sink<Int>, n: Int) {
  for (i in 1..n) {
    s.put(i)
  }
}

fun fillWords(s: Sink<String>) {
  s.put("a")
  s.put("b")
}

// 1. Write the log. Above main, write class Log : Sink<Any>. Give it var lines = 0 and var last: Any = "". Override put(x: Any). Add 1 to lines and set last to x.

fun main() {
  val count = 3

  // 2. Create the log. Create val log as Log().

  // 3. Fill it. Call fillInts(log, count), then fillWords(log).

  // 4. Print two lines. Join the text with +: "Lines: 5" "Last: b"
}`,
    solutionCode: `interface Sink<in T> {
  fun put(x: T)
}

fun fillInts(s: Sink<Int>, n: Int) {
  for (i in 1..n) {
    s.put(i)
  }
}

fun fillWords(s: Sink<String>) {
  s.put("a")
  s.put("b")
}

class Log : Sink<Any> {
  var lines = 0
  var last: Any = ""

  override fun put(x: Any) {
    lines += 1
    last = x
  }
}

fun main() {
  val count = 3
  val log = Log()
  fillInts(log, count)
  fillWords(log)
  println("Lines: " + log.lines)
  println("Last: " + log.last)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Lines: 5\nLast: b',
    testCase: { call: '', expected: 'Lines: 5\nLast: b' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '3', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Lines: 3\nLast: b',
    },
  },
  {
    id: 'world-12-practice-writerun-text-checker',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write a checker for Any and use it where a checker for String is expected.',
    conceptTags: ['lesson:in-variance', 'in-variance', 'consumer', 'broader-type-accepted'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Text Checker',
    goal: 'A checker says if an item passes a test. Write one that works for anything, and use it to count the long words in a list.',
    description: 'The interface `Checker<in T>` and the function `countOk` are in the starter code.\n\n' +
              '1. **Write the checker.** Above `main`, write `class LongText(val limit: Int) : Checker<Any>`. Override `ok(x: Any): Boolean`. Return `x.toString().length > limit`.\n\n' +
              '2. **Count the long words.** Print "Long: " plus `countOk(items, LongText(limit))`:\n"Long: 4"\n\n' +
              '3. **Count the very long words.** Print "Very long: " plus `countOk(items, LongText(limit + 2))`:\n"Very long: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the checker.** Implement `Checker<Any>`.',
          '2. **Count the long words.** Use `LongText(limit)`.',
          '3. **Count the very long words.** Use `limit + 2`.',
        ],
        comments: [
          '// 1. Write the checker. Implement Checker<Any>.',
          '// 2. Count the long words. Use LongText(limit).',
          '// 3. Count the very long words. Use limit + 2.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the checker.**',
          '2. **Count the long words.**',
          '3. **Count the very long words.**',
        ],
        comments: [
          '// 1. Write the checker.',
          '// 2. Count the long words.',
          '// 3. Count the very long words.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TextChecker.kt',
    initialCode: `interface Checker<in T> {
  fun ok(x: T): Boolean
}

fun countOk(items: List<String>, c: Checker<String>): Int {
  var n = 0
  for (x in items) {
    if (c.ok(x)) {
      n += 1
    }
  }
  return n
}

// 1. Write the checker. Above main, write class LongText(val limit: Int) : Checker<Any>. Override ok(x: Any): Boolean. Return x.toString().length > limit.

fun main() {
  val limit = 3
  val items = listOf("kiwi", "fig", "banana", "plum", "apple")

  // 2. Count the long words. Print "Long: " plus countOk(items, LongText(limit)): "Long: 4"

  // 3. Count the very long words. Print "Very long: " plus countOk(items, LongText(limit + 2)): "Very long: 1"
}`,
    solutionCode: `interface Checker<in T> {
  fun ok(x: T): Boolean
}

fun countOk(items: List<String>, c: Checker<String>): Int {
  var n = 0
  for (x in items) {
    if (c.ok(x)) {
      n += 1
    }
  }
  return n
}

class LongText(val limit: Int) : Checker<Any> {
  override fun ok(x: Any): Boolean {
    return x.toString().length > limit
  }
}

fun main() {
  val limit = 3
  val items = listOf("kiwi", "fig", "banana", "plum", "apple")
  println("Long: " + countOk(items, LongText(limit)))
  println("Very long: " + countOk(items, LongText(limit + 2)))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Long: 4\nVery long: 1',
    testCase: { call: '', expected: 'Long: 4\nVery long: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Long: 2\nVery long: 0',
    },
  },
  {
    id: 'world-12-practice-writerun-counter-source',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a producer of Int and use it where a producer of Number is expected.',
    conceptTags: ['lesson:out-variance', 'out-variance', 'producer', 'shared-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Counter Source',
    goal: 'A counter makes the numbers 1, 2, 3 and so on. Use it where a source of Number is needed. Print the sum and the next number.',
    description: 'The interface `Source<out T>` and the function `pull` are in the starter code.\n\n' +
              '1. **Write the counter.** Above `main`, write `class Counter(var n: Int) : Source<Int>`. Override `next(): Int`. Add `1` to `n`, then return `n`.\n\n' +
              '2. **Create the counter.** Create `val c` as `Counter(0)`.\n\n' +
              '3. **Pull the numbers.** Print "Sum: " plus `pull(c, times)`:\n"Sum: 6"\n\n' +
              '4. **Pull one more.** Print "Next: " plus `c.next()`:\n"Next: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the counter.** Implement `Source<Int>`.',
          '2. **Create the counter.** Start at `0`.',
          '3. **Pull the numbers.** Use `pull(c, times)`.',
          '4. **Pull one more.** Call `next()`.',
        ],
        comments: [
          '// 1. Write the counter. Implement Source<Int>.',
          '// 2. Create the counter. Start at 0.',
          '// 3. Pull the numbers. Use pull(c, times).',
          '// 4. Pull one more. Call next().',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the counter.**',
          '2. **Create the counter.**',
          '3. **Pull the numbers.**',
          '4. **Pull one more.**',
        ],
        comments: [
          '// 1. Write the counter.',
          '// 2. Create the counter.',
          '// 3. Pull the numbers.',
          '// 4. Pull one more.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CounterSource.kt',
    initialCode: `interface Source<out T> {
  fun next(): T
}

fun pull(s: Source<Number>, times: Int): Int {
  var t = 0
  for (i in 1..times) {
    t += s.next().toInt()
  }
  return t
}

// 1. Write the counter. Above main, write class Counter(var n: Int) : Source<Int>. Override next(): Int. Add 1 to n, then return n.

fun main() {
  val times = 3

  // 2. Create the counter. Create val c as Counter(0).

  // 3. Pull the numbers. Print "Sum: " plus pull(c, times): "Sum: 6"

  // 4. Pull one more. Print "Next: " plus c.next(): "Next: 4"
}`,
    solutionCode: `interface Source<out T> {
  fun next(): T
}

fun pull(s: Source<Number>, times: Int): Int {
  var t = 0
  for (i in 1..times) {
    t += s.next().toInt()
  }
  return t
}

class Counter(var n: Int) : Source<Int> {
  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val times = 3
  val c = Counter(0)
  println("Sum: " + pull(c, times))
  println("Next: " + c.next())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sum: 6\nNext: 4',
    testCase: { call: '', expected: 'Sum: 6\nNext: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'times', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: 'Sum: 10\nNext: 5',
    },
  },
  {
    id: 'world-12-practice-writerun-shelf-reader',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write two producers of different types and read both through one parameter of type Shelf<Any>.',
    conceptTags: ['lesson:out-variance', 'out-variance', 'producer', 'two-implementations'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shelf Reader',
    goal: 'A shelf of words and a shelf of numbers are both read by the same function. Print what that function says about each.',
    description: 'The interface `Shelf<out T>` and the function `describe` are in the starter code.\n\n' +
              '1. **Write the words shelf.** Above `main`, write `class Words(val items: List<String>) : Shelf<String>`. Override `first()` to return `items[0]`. Override `count()` to return `items.size`.\n\n' +
              '2. **Write the numbers shelf.** Write `class Numbers(val items: List<Int>) : Shelf<Int>` in the same way.\n\n' +
              '3. **Describe the words.** Print `describe(Words(listOf(lead, "fig")))`:\n"first=pear count=2"\n\n' +
              '4. **Describe the numbers.** Print `describe(Numbers(listOf(1, 2, 3)))`:\n"first=1 count=3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the words shelf.** Implement `Shelf<String>`.',
          '2. **Write the numbers shelf.** Implement `Shelf<Int>`.',
          '3. **Describe the words.** Start with `lead`.',
          '4. **Describe the numbers.** Use `1, 2, 3`.',
        ],
        comments: [
          '// 1. Write the words shelf. Implement Shelf<String>.',
          '// 2. Write the numbers shelf. Implement Shelf<Int>.',
          '// 3. Describe the words. Start with lead.',
          '// 4. Describe the numbers. Use 1, 2, 3.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the words shelf.**',
          '2. **Write the numbers shelf.**',
          '3. **Describe the words.**',
          '4. **Describe the numbers.**',
        ],
        comments: [
          '// 1. Write the words shelf.',
          '// 2. Write the numbers shelf.',
          '// 3. Describe the words.',
          '// 4. Describe the numbers.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShelfReader.kt',
    initialCode: `interface Shelf<out T> {
  fun first(): T
  fun count(): Int
}

fun describe(s: Shelf<Any>): String {
  return "first=" + s.first() + " count=" + s.count()
}

// 1. Write the words shelf. Above main, write class Words(val items: List<String>) : Shelf<String>. Override first() to return items[0]. Override count() to return items.size.

// 2. Write the numbers shelf. Write class Numbers(val items: List<Int>) : Shelf<Int> in the same way.

fun main() {
  val lead = "pear"

  // 3. Describe the words. Print describe(Words(listOf(lead, "fig"))): "first=pear count=2"

  // 4. Describe the numbers. Print describe(Numbers(listOf(1, 2, 3))): "first=1 count=3"
}`,
    solutionCode: `interface Shelf<out T> {
  fun first(): T
  fun count(): Int
}

fun describe(s: Shelf<Any>): String {
  return "first=" + s.first() + " count=" + s.count()
}

class Words(val items: List<String>) : Shelf<String> {
  override fun first(): String {
    return items[0]
  }

  override fun count(): Int {
    return items.size
  }
}

class Numbers(val items: List<Int>) : Shelf<Int> {
  override fun first(): Int {
    return items[0]
  }

  override fun count(): Int {
    return items.size
  }
}

fun main() {
  val lead = "pear"
  println(describe(Words(listOf(lead, "fig"))))
  println(describe(Numbers(listOf(1, 2, 3))))
}`,
    sampleInput: 'main()',
    expectedOutput: 'first=pear count=2\nfirst=1 count=3',
    testCase: { call: '', expected: 'first=pear count=2\nfirst=1 count=3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'lead', originalLiteral: '"pear"', alternateLiteral: '"plum"' }],
      alternateExpectedOutput: 'first=plum count=2\nfirst=1 count=3',
    },
  },
  {
    id: 'world-12-practice-writerun-swap-cells',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic function that needs two cells of the same type, and swap numbers and words.',
    conceptTags: ['lesson:invariance', 'invariance', 'generic-function', 'same-type-argument'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Swap Cells',
    goal: 'Swap the values of two cells. Do it for two number cells and for two word cells. Print the results.',
    description: 'The class `Cell<T>(var value: T)` is in the starter code.\n\n' +
              '1. **Write swapValues.** Above `main`, write `fun <T> swapValues(a: Cell<T>, b: Cell<T>)`. Keep `a.value` in `val tmp`. Set `a.value` to `b.value`. Set `b.value` to `tmp`.\n\n' +
              '2. **Swap two numbers.** Create `val a` as `Cell(start)` and `val b` as `Cell(start + 4)`. Call `swapValues(a, b)`.\n\n' +
              '3. **Print the numbers.** Print "A: " plus `a.value`, then "B: " plus `b.value`:\n"A: 7"\n"B: 3"\n\n' +
              '4. **Swap two words.** Create `val x` as `Cell("x")` and `val y` as `Cell("y")`. Swap them. Print "Words: ", `x.value`, a space and `y.value`:\n"Words: y x"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write swapValues.** Use a temporary value.',
          '2. **Swap two numbers.** Start at `start` and `start + 4`.',
          '3. **Print the numbers.** Show both cells.',
          '4. **Swap two words.** Use `"x"` and `"y"`.',
        ],
        comments: [
          '// 1. Write swapValues. Use a temporary value.',
          '// 2. Swap two numbers. Start at start and start + 4.',
          '// 3. Print the numbers. Show both cells.',
          '// 4. Swap two words. Use "x" and "y".',
        ],
      },
      experienced: {
        steps: [
          '1. **Write swapValues.**',
          '2. **Swap two numbers.**',
          '3. **Print the numbers.**',
          '4. **Swap two words.**',
        ],
        comments: [
          '// 1. Write swapValues.',
          '// 2. Swap two numbers.',
          '// 3. Print the numbers.',
          '// 4. Swap two words.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SwapCells.kt',
    initialCode: `class Cell<T>(var value: T)

// 1. Write swapValues. Above main, write fun <T> swapValues(a: Cell<T>, b: Cell<T>). Keep a.value in val tmp. Set a.value to b.value. Set b.value to tmp.

fun main() {
  val start = 3

  // 2. Swap two numbers. Create val a as Cell(start) and val b as Cell(start + 4). Call swapValues(a, b).

  // 3. Print the numbers. Print "A: " plus a.value, then "B: " plus b.value: "A: 7" "B: 3"

  // 4. Swap two words. Create val x as Cell("x") and val y as Cell("y"). Swap them. Print "Words: ", x.value, a space and y.value: "Words: y x"
}`,
    solutionCode: `class Cell<T>(var value: T)

fun <T> swapValues(a: Cell<T>, b: Cell<T>) {
  val tmp = a.value
  a.value = b.value
  b.value = tmp
}

fun main() {
  val start = 3
  val a = Cell(start)
  val b = Cell(start + 4)
  swapValues(a, b)
  println("A: " + a.value)
  println("B: " + b.value)
  val x = Cell("x")
  val y = Cell("y")
  swapValues(x, y)
  println("Words: " + x.value + " " + y.value)
}`,
    sampleInput: 'main()',
    expectedOutput: 'A: 7\nB: 3\nWords: y x',
    testCase: { call: '', expected: 'A: 7\nB: 3\nWords: y x' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '3', alternateLiteral: '10' }],
      alternateExpectedOutput: 'A: 14\nB: 10\nWords: y x',
    },
  },
  {
    id: 'world-12-practice-writerun-fill-list',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic function that adds an item many times to a mutable list.',
    conceptTags: ['lesson:invariance', 'invariance', 'mutable-list', 'generic-function'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Fill a List',
    goal: 'Add the same item to a list several times. Do it for a list of numbers and for a list of words.',
    description: '1. **Write fillWith.** Above `main`, write `fun <T> fillWith(list: MutableList<T>, x: T, n: Int)`. Loop `i` from `1` to `n`. Each time, add `x` to `list`.\n\n' +
              '2. **Fill the numbers.** Create `val ints` as `mutableListOf(1)`. Call `fillWith(ints, 9, times)`.\n\n' +
              '3. **Fill the words.** Create `val words` as `mutableListOf<String>()`. Call `fillWith(words, "ab", 2)`.\n\n' +
              '4. **Print two lines.** Use string templates:\n"Ints: [1, 9, 9, 9]"\n"Words: [ab, ab]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write fillWith.** Add `x` to the list `n` times.',
          '2. **Fill the numbers.** Use `9` and `times`.',
          '3. **Fill the words.** Use `"ab"` two times.',
          '4. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Write fillWith. Add x to the list n times.',
          '// 2. Fill the numbers. Use 9 and times.',
          '// 3. Fill the words. Use "ab" two times.',
          '// 4. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write fillWith.**',
          '2. **Fill the numbers.**',
          '3. **Fill the words.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write fillWith.',
          '// 2. Fill the numbers.',
          '// 3. Fill the words.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FillList.kt',
    initialCode: `// 1. Write fillWith. Above main, write fun <T> fillWith(list: MutableList<T>, x: T, n: Int). Loop i from 1 to n. Each time, add x to list.

fun main() {
  val times = 3

  // 2. Fill the numbers. Create val ints as mutableListOf(1). Call fillWith(ints, 9, times).

  // 3. Fill the words. Create val words as mutableListOf<String>(). Call fillWith(words, "ab", 2).

  // 4. Print two lines. Use string templates: "Ints: [1, 9, 9, 9]" "Words: [ab, ab]"
}`,
    solutionCode: `fun <T> fillWith(list: MutableList<T>, x: T, n: Int) {
  for (i in 1..n) {
    list.add(x)
  }
}

fun main() {
  val times = 3
  val ints = mutableListOf(1)
  fillWith(ints, 9, times)
  val words = mutableListOf<String>()
  fillWith(words, "ab", 2)
  println("Ints: $ints")
  println("Words: $words")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ints: [1, 9, 9, 9]\nWords: [ab, ab]',
    testCase: { call: '', expected: 'Ints: [1, 9, 9, 9]\nWords: [ab, ab]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'times', originalLiteral: '3', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Ints: [1, 9]\nWords: [ab, ab]',
    },
  },
  {
    id: 'world-12-practice-writerun-farm-feed',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write producers of Dog and Cat and use them where a producer of Animal is expected.',
    conceptTags: ['lesson:declaration-site-variance', 'declaration-site-variance', 'out', 'class-hierarchy'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Farm Feed',
    goal: 'A dog farm makes dogs and a cat farm makes cats. One function feeds any farm of animals. Print what each farm makes.',
    description: 'The classes `Animal`, `Dog` and `Cat`, the interface `Producer<out T>` and the function `feed` are in the starter code.\n\n' +
              '1. **Write the dog farm.** Above `main`, write `class DogFarm : Producer<Dog>`. Override `produce(): Dog` to return `Dog()`.\n\n' +
              '2. **Write the cat farm.** Write `class CatFarm : Producer<Cat>`. Override `produce(): Cat` to return `Cat()`.\n\n' +
              '3. **Feed the dogs.** Print `feed(DogFarm(), times)`:\n"Dog Dog"\n\n' +
              '4. **Feed the cats.** Print `feed(CatFarm(), times + 1)`:\n"Cat Cat Cat"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the dog farm.** Implement `Producer<Dog>`.',
          '2. **Write the cat farm.** Implement `Producer<Cat>`.',
          '3. **Feed the dogs.** Use `times`.',
          '4. **Feed the cats.** Use `times + 1`.',
        ],
        comments: [
          '// 1. Write the dog farm. Implement Producer<Dog>.',
          '// 2. Write the cat farm. Implement Producer<Cat>.',
          '// 3. Feed the dogs. Use times.',
          '// 4. Feed the cats. Use times + 1.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the dog farm.**',
          '2. **Write the cat farm.**',
          '3. **Feed the dogs.**',
          '4. **Feed the cats.**',
        ],
        comments: [
          '// 1. Write the dog farm.',
          '// 2. Write the cat farm.',
          '// 3. Feed the dogs.',
          '// 4. Feed the cats.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FarmFeed.kt',
    initialCode: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Producer<out T> {
  fun produce(): T
}

fun feed(p: Producer<Animal>, times: Int): String {
  var s = ""
  for (i in 1..times) {
    s += p.produce().name + " "
  }
  return s.trim()
}

// 1. Write the dog farm. Above main, write class DogFarm : Producer<Dog>. Override produce(): Dog to return Dog().

// 2. Write the cat farm. Write class CatFarm : Producer<Cat>. Override produce(): Cat to return Cat().

fun main() {
  val times = 2

  // 3. Feed the dogs. Print feed(DogFarm(), times): "Dog Dog"

  // 4. Feed the cats. Print feed(CatFarm(), times + 1): "Cat Cat Cat"
}`,
    solutionCode: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Producer<out T> {
  fun produce(): T
}

fun feed(p: Producer<Animal>, times: Int): String {
  var s = ""
  for (i in 1..times) {
    s += p.produce().name + " "
  }
  return s.trim()
}

class DogFarm : Producer<Dog> {
  override fun produce(): Dog {
    return Dog()
  }
}

class CatFarm : Producer<Cat> {
  override fun produce(): Cat {
    return Cat()
  }
}

fun main() {
  val times = 2
  println(feed(DogFarm(), times))
  println(feed(CatFarm(), times + 1))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Dog Dog\nCat Cat Cat',
    testCase: { call: '', expected: 'Dog Dog\nCat Cat Cat' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'times', originalLiteral: '2', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Dog\nCat Cat',
    },
  },
  {
    id: 'world-12-practice-writerun-vet-visit',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write one vet for all animals and use it where a vet for Dog and a vet for Cat are expected.',
    conceptTags: ['lesson:declaration-site-variance', 'declaration-site-variance', 'in', 'class-hierarchy'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Vet Visit',
    goal: 'One vet can treat any animal. Use it as a dog vet and as a cat vet. Print what each visit costs.',
    description: 'The classes `Animal`, `Dog` and `Cat` and the interface `Vet<in T>` are in the starter code.\n\n' +
              '1. **Write the vet.** Above `main`, write `class AnimalVet(val fee: Int) : Vet<Animal>`. Override `treat(x: Animal): String`. Return "Vet treats ", `x.name`, " for " and `fee`.\n\n' +
              '2. **Make the dog vet.** Create `val dogVet: Vet<Dog>` as `AnimalVet(fee)`.\n\n' +
              '3. **Make the cat vet.** Create `val catVet: Vet<Cat>` as `AnimalVet(fee + 5)`.\n\n' +
              '4. **Print two lines.** Treat a `Dog()` and a `Cat()`:\n"Vet treats Dog for 20"\n"Vet treats Cat for 25"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the vet.** Implement `Vet<Animal>`.',
          '2. **Make the dog vet.** Type it as `Vet<Dog>`.',
          '3. **Make the cat vet.** Type it as `Vet<Cat>`.',
          '4. **Print two lines.** Treat both animals.',
        ],
        comments: [
          '// 1. Write the vet. Implement Vet<Animal>.',
          '// 2. Make the dog vet. Type it as Vet<Dog>.',
          '// 3. Make the cat vet. Type it as Vet<Cat>.',
          '// 4. Print two lines. Treat both animals.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the vet.**',
          '2. **Make the dog vet.**',
          '3. **Make the cat vet.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the vet.',
          '// 2. Make the dog vet.',
          '// 3. Make the cat vet.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'VetVisit.kt',
    initialCode: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Vet<in T> {
  fun treat(x: T): String
}

// 1. Write the vet. Above main, write class AnimalVet(val fee: Int) : Vet<Animal>. Override treat(x: Animal): String. Return "Vet treats ", x.name, " for " and fee.

fun main() {
  val fee = 20

  // 2. Make the dog vet. Create val dogVet: Vet<Dog> as AnimalVet(fee).

  // 3. Make the cat vet. Create val catVet: Vet<Cat> as AnimalVet(fee + 5).

  // 4. Print two lines. Treat a Dog() and a Cat(): "Vet treats Dog for 20" "Vet treats Cat for 25"
}`,
    solutionCode: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Vet<in T> {
  fun treat(x: T): String
}

class AnimalVet(val fee: Int) : Vet<Animal> {
  override fun treat(x: Animal): String {
    return "Vet treats " + x.name + " for " + fee
  }
}

fun main() {
  val fee = 20
  val dogVet: Vet<Dog> = AnimalVet(fee)
  val catVet: Vet<Cat> = AnimalVet(fee + 5)
  println(dogVet.treat(Dog()))
  println(catVet.treat(Cat()))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Vet treats Dog for 20\nVet treats Cat for 25',
    testCase: { call: '', expected: 'Vet treats Dog for 20\nVet treats Cat for 25' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'fee', originalLiteral: '20', alternateLiteral: '35' }],
      alternateExpectedOutput: 'Vet treats Dog for 35\nVet treats Cat for 40',
    },
  },
  {
    id: 'world-12-practice-writerun-sum-out',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Use an out projection so one function can read lists of Int and lists of Number.',
    conceptTags: ['lesson:use-site-variance', 'use-site-variance', 'out-projection', 'read-only'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Sum with Out',
    goal: 'Write one function that adds up a list of any kind of number. Use it on two lists, then add to a list and use it again.',
    description: '1. **Write sumAll.** Above `main`, write `fun sumAll(list: MutableList<out Number>): Int`. Add `x.toInt()` for each item and return the sum.\n\n' +
              '2. **Make the lists.** Create `val ints` as `mutableListOf(1, 2, 3)`. Create `val nums` as `mutableListOf<Number>(4, 5)`.\n\n' +
              '3. **Add up both lists.** Print `sumAll(ints)`, then `sumAll(nums)`:\n"6"\n"9"\n\n' +
              '4. **Add one more.** Add `extra` to `ints`. Print `sumAll(ints)`:\n"16"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write sumAll.** Use `MutableList<out Number>`.',
          '2. **Make the lists.** One of `Int` and one of `Number`.',
          '3. **Add up both lists.** Print both sums.',
          '4. **Add one more.** Add `extra`, then print.',
        ],
        comments: [
          '// 1. Write sumAll. Use MutableList<out Number>.',
          '// 2. Make the lists. One of Int and one of Number.',
          '// 3. Add up both lists. Print both sums.',
          '// 4. Add one more. Add extra, then print.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write sumAll.**',
          '2. **Make the lists.**',
          '3. **Add up both lists.**',
          '4. **Add one more.**',
        ],
        comments: [
          '// 1. Write sumAll.',
          '// 2. Make the lists.',
          '// 3. Add up both lists.',
          '// 4. Add one more.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SumOut.kt',
    initialCode: `// 1. Write sumAll. Above main, write fun sumAll(list: MutableList<out Number>): Int. Add x.toInt() for each item and return the sum.

fun main() {
  val extra = 10

  // 2. Make the lists. Create val ints as mutableListOf(1, 2, 3). Create val nums as mutableListOf<Number>(4, 5).

  // 3. Add up both lists. Print sumAll(ints), then sumAll(nums): "6" "9"

  // 4. Add one more. Add extra to ints. Print sumAll(ints): "16"
}`,
    solutionCode: `fun sumAll(list: MutableList<out Number>): Int {
  var t = 0
  for (x in list) {
    t += x.toInt()
  }
  return t
}

fun main() {
  val extra = 10
  val ints = mutableListOf(1, 2, 3)
  val nums = mutableListOf<Number>(4, 5)
  println(sumAll(ints))
  println(sumAll(nums))
  ints.add(extra)
  println(sumAll(ints))
}`,
    sampleInput: 'main()',
    expectedOutput: '6\n9\n16',
    testCase: { call: '', expected: '6\n9\n16' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '10', alternateLiteral: '1' }],
      alternateExpectedOutput: '6\n9\n7',
    },
  },
  {
    id: 'world-12-practice-writerun-fill-in',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Use an in projection so one function can write to lists of Int and lists of Any.',
    conceptTags: ['lesson:use-site-variance', 'use-site-variance', 'in-projection', 'write-only'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Fill with In',
    goal: 'Write one function that adds sevens to a list. Use it on a list of numbers and on a list that can hold anything.',
    description: '1. **Write fillSeven.** Above `main`, write `fun fillSeven(list: MutableList<in Int>, n: Int)`. Loop `i` from `1` to `n`. Each time, add `7` to `list`.\n\n' +
              '2. **Fill the numbers.** Call `fillSeven(ints, count)`.\n\n' +
              '3. **Fill the mixed list.** Call `fillSeven(anys, count)`.\n\n' +
              '4. **Print two lines.** Use string templates:\n"Ints: [1, 7, 7]"\n"Anys: [x, 7, 7]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write fillSeven.** Use `MutableList<in Int>`.',
          '2. **Fill the numbers.** Use `ints`.',
          '3. **Fill the mixed list.** Use `anys`.',
          '4. **Print two lines.** Show both lists.',
        ],
        comments: [
          '// 1. Write fillSeven. Use MutableList<in Int>.',
          '// 2. Fill the numbers. Use ints.',
          '// 3. Fill the mixed list. Use anys.',
          '// 4. Print two lines. Show both lists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write fillSeven.**',
          '2. **Fill the numbers.**',
          '3. **Fill the mixed list.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write fillSeven.',
          '// 2. Fill the numbers.',
          '// 3. Fill the mixed list.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'FillIn.kt',
    initialCode: `// 1. Write fillSeven. Above main, write fun fillSeven(list: MutableList<in Int>, n: Int). Loop i from 1 to n. Each time, add 7 to list.

fun main() {
  val count = 2
  val ints = mutableListOf(1)
  val anys = mutableListOf<Any>("x")

  // 2. Fill the numbers. Call fillSeven(ints, count).

  // 3. Fill the mixed list. Call fillSeven(anys, count).

  // 4. Print two lines. Use string templates: "Ints: [1, 7, 7]" "Anys: [x, 7, 7]"
}`,
    solutionCode: `fun fillSeven(list: MutableList<in Int>, n: Int) {
  for (i in 1..n) {
    list.add(7)
  }
}

fun main() {
  val count = 2
  val ints = mutableListOf(1)
  val anys = mutableListOf<Any>("x")
  fillSeven(ints, count)
  fillSeven(anys, count)
  println("Ints: $ints")
  println("Anys: $anys")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ints: [1, 7, 7]\nAnys: [x, 7, 7]',
    testCase: { call: '', expected: 'Ints: [1, 7, 7]\nAnys: [x, 7, 7]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '2', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Ints: [1, 7]\nAnys: [x, 7]',
    },
  },
  {
    id: 'world-12-practice-writerun-size-all',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Use List<*> for functions that do not care what the lists hold.',
    conceptTags: ['lesson:star-projections', 'star-projection', 'list-of-lists', 'count'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Size of All',
    goal: 'Three lists hold different types. Add up their sizes, and count how many lists are big.',
    description: '1. **Write totalSize.** Above `main`, write `fun totalSize(lists: List<List<*>>): Int`. Add `l.size` for every list `l` and return the sum.\n\n' +
              '2. **Write bigLists.** Write `fun bigLists(lists: List<List<*>>, min: Int): Int`. Count the lists whose `size` is at least `min`.\n\n' +
              '3. **Print the total.** Print "Total: " plus `totalSize(lists)`:\n"Total: 6"\n\n' +
              '4. **Print the big lists.** Print "Big lists: " plus `bigLists(lists, min)`:\n"Big lists: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write totalSize.** Use `List<List<*>>`.',
          '2. **Write bigLists.** Count the lists of at least `min`.',
          '3. **Print the total.** Call `totalSize`.',
          '4. **Print the big lists.** Call `bigLists`.',
        ],
        comments: [
          '// 1. Write totalSize. Use List<List<*>>.',
          '// 2. Write bigLists. Count the lists of at least min.',
          '// 3. Print the total. Call totalSize.',
          '// 4. Print the big lists. Call bigLists.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write totalSize.**',
          '2. **Write bigLists.**',
          '3. **Print the total.**',
          '4. **Print the big lists.**',
        ],
        comments: [
          '// 1. Write totalSize.',
          '// 2. Write bigLists.',
          '// 3. Print the total.',
          '// 4. Print the big lists.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SizeAll.kt',
    initialCode: `// 1. Write totalSize. Above main, write fun totalSize(lists: List<List<*>>): Int. Add l.size for every list l and return the sum.

// 2. Write bigLists. Write fun bigLists(lists: List<List<*>>, min: Int): Int. Count the lists whose size is at least min.

fun main() {
  val min = 2
  val lists = listOf(listOf(1, 2), listOf("a"), listOf(true, false, true))

  // 3. Print the total. Print "Total: " plus totalSize(lists): "Total: 6"

  // 4. Print the big lists. Print "Big lists: " plus bigLists(lists, min): "Big lists: 2"
}`,
    solutionCode: `fun totalSize(lists: List<List<*>>): Int {
  var t = 0
  for (l in lists) {
    t += l.size
  }
  return t
}

fun bigLists(lists: List<List<*>>, min: Int): Int {
  var n = 0
  for (l in lists) {
    if (l.size >= min) {
      n += 1
    }
  }
  return n
}

fun main() {
  val min = 2
  val lists = listOf(listOf(1, 2), listOf("a"), listOf(true, false, true))
  println("Total: " + totalSize(lists))
  println("Big lists: " + bigLists(lists, min))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 6\nBig lists: 2',
    testCase: { call: '', expected: 'Total: 6\nBig lists: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'min', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Total: 6\nBig lists: 1',
    },
  },
  {
    id: 'world-12-practice-writerun-box-peek',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Read the value of a Box<*>, which Kotlin treats as Any, and compare two of them.',
    conceptTags: ['lesson:star-projections', 'star-projection', 'read-as-any', 'equality'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Box Peek',
    goal: 'A function must read boxes of any type. Describe three boxes and check if two boxes hold the same value.',
    description: 'The class `Box<T>(val value: T)` is in the starter code.\n\n' +
              '1. **Write describe.** Above `main`, write `fun describe(b: Box<*>): String`. It returns "box " plus `b.value`.\n\n' +
              '2. **Write same.** Write `fun same(a: Box<*>, b: Box<*>): Boolean`. It returns `a.value == b.value`.\n\n' +
              '3. **Describe two boxes.** Print `describe(Box("a"))`, then `describe(Box(n))`:\n"box a"\n"box 7"\n\n' +
              '4. **Compare two boxes.** Print "Same: " plus `same(Box(n), Box(7))`:\n"Same: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write describe.** Use `Box<*>` and read `value`.',
          '2. **Write same.** Compare the two values.',
          '3. **Describe two boxes.** A text box and a number box.',
          '4. **Compare two boxes.** Use `n` and `7`.',
        ],
        comments: [
          '// 1. Write describe. Use Box<*> and read value.',
          '// 2. Write same. Compare the two values.',
          '// 3. Describe two boxes. A text box and a number box.',
          '// 4. Compare two boxes. Use n and 7.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write describe.**',
          '2. **Write same.**',
          '3. **Describe two boxes.**',
          '4. **Compare two boxes.**',
        ],
        comments: [
          '// 1. Write describe.',
          '// 2. Write same.',
          '// 3. Describe two boxes.',
          '// 4. Compare two boxes.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BoxPeek.kt',
    initialCode: `class Box<T>(val value: T)

// 1. Write describe. Above main, write fun describe(b: Box<*>): String. It returns "box " plus b.value.

// 2. Write same. Write fun same(a: Box<*>, b: Box<*>): Boolean. It returns a.value == b.value.

fun main() {
  val n = 7

  // 3. Describe two boxes. Print describe(Box("a")), then describe(Box(n)): "box a" "box 7"

  // 4. Compare two boxes. Print "Same: " plus same(Box(n), Box(7)): "Same: true"
}`,
    solutionCode: `class Box<T>(val value: T)

fun describe(b: Box<*>): String {
  return "box " + b.value
}

fun same(a: Box<*>, b: Box<*>): Boolean {
  return a.value == b.value
}

fun main() {
  val n = 7
  println(describe(Box("a")))
  println(describe(Box(n)))
  println("Same: " + same(Box(n), Box(7)))
}`,
    sampleInput: 'main()',
    expectedOutput: 'box a\nbox 7\nSame: true',
    testCase: { call: '', expected: 'box a\nbox 7\nSame: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '7', alternateLiteral: '9' }],
      alternateExpectedOutput: 'box a\nbox 9\nSame: false',
    },
  },
  {
    id: 'world-12-practice-writerun-count-type',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write an inline function with a reified type to count the items of one type.',
    conceptTags: ['lesson:reified-type-parameters', 'reified', 'is-check', 'inline'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Count by Type',
    goal: 'A list holds numbers and text. Count the items of a chosen type.',
    description: '1. **Write countOf.** Above `main`, write `inline fun <reified T> countOf(items: List<Any>): Int`. Use the body `items.filter { it is T }.size`.\n\n' +
              '2. **Count the text items.** Print "Strings: " plus `countOf<String>(items)`:\n"Strings: 3"\n\n' +
              '3. **Count the numbers.** Print "Ints: " plus `countOf<Int>(items)`:\n"Ints: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write countOf.** Use `inline`, `reified` and `it is T`.',
          '2. **Count the text items.** Use `countOf<String>`.',
          '3. **Count the numbers.** Use `countOf<Int>`.',
        ],
        comments: [
          '// 1. Write countOf. Use inline, reified and it is T.',
          '// 2. Count the text items. Use countOf<String>.',
          '// 3. Count the numbers. Use countOf<Int>.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write countOf.**',
          '2. **Count the text items.**',
          '3. **Count the numbers.**',
        ],
        comments: [
          '// 1. Write countOf.',
          '// 2. Count the text items.',
          '// 3. Count the numbers.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CountType.kt',
    initialCode: `// 1. Write countOf. Above main, write inline fun <reified T> countOf(items: List<Any>): Int. Use the body items.filter { it is T }.size.

fun main() {
  val extra = 5
  val items: List<Any> = listOf(1, "a", 2, "b", "c", extra)

  // 2. Count the text items. Print "Strings: " plus countOf<String>(items): "Strings: 3"

  // 3. Count the numbers. Print "Ints: " plus countOf<Int>(items): "Ints: 3"
}`,
    solutionCode: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val extra = 5
  val items: List<Any> = listOf(1, "a", 2, "b", "c", extra)
  println("Strings: " + countOf<String>(items))
  println("Ints: " + countOf<Int>(items))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Strings: 3\nInts: 3',
    testCase: { call: '', expected: 'Strings: 3\nInts: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '5', alternateLiteral: '"five"' }],
      alternateExpectedOutput: 'Strings: 4\nInts: 2',
    },
  },
  {
    id: 'world-12-practice-writerun-has-type',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write an inline function with a reified type to ask if a list has an item of a type.',
    conceptTags: ['lesson:reified-type-parameters', 'reified', 'any', 'is-check'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Has the Type',
    goal: 'A list holds items of different types. Ask if it has an item of each type.',
    description: '1. **Write hasType.** Above `main`, write `inline fun <reified T> hasType(items: List<Any>): Boolean`. Use the body `items.any { it is T }`.\n\n' +
              '2. **Ask about text.** Print "String: " plus `hasType<String>(items)`:\n"String: true"\n\n' +
              '3. **Ask about Boolean.** Print "Boolean: " plus `hasType<Boolean>(items)`:\n"Boolean: false"\n\n' +
              '4. **Ask about Int.** Print "Int: " plus `hasType<Int>(items)`:\n"Int: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write hasType.** Use `any` and `it is T`.',
          '2. **Ask about text.** Use `hasType<String>`.',
          '3. **Ask about Boolean.** Use `hasType<Boolean>`.',
          '4. **Ask about Int.** Use `hasType<Int>`.',
        ],
        comments: [
          '// 1. Write hasType. Use any and it is T.',
          '// 2. Ask about text. Use hasType<String>.',
          '// 3. Ask about Boolean. Use hasType<Boolean>.',
          '// 4. Ask about Int. Use hasType<Int>.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write hasType.**',
          '2. **Ask about text.**',
          '3. **Ask about Boolean.**',
          '4. **Ask about Int.**',
        ],
        comments: [
          '// 1. Write hasType.',
          '// 2. Ask about text.',
          '// 3. Ask about Boolean.',
          '// 4. Ask about Int.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'HasType.kt',
    initialCode: `// 1. Write hasType. Above main, write inline fun <reified T> hasType(items: List<Any>): Boolean. Use the body items.any { it is T }.

fun main() {
  val extra = 1
  val items: List<Any> = listOf(extra, "a")

  // 2. Ask about text. Print "String: " plus hasType<String>(items): "String: true"

  // 3. Ask about Boolean. Print "Boolean: " plus hasType<Boolean>(items): "Boolean: false"

  // 4. Ask about Int. Print "Int: " plus hasType<Int>(items): "Int: true"
}`,
    solutionCode: `inline fun <reified T> hasType(items: List<Any>): Boolean = items.any { it is T }

fun main() {
  val extra = 1
  val items: List<Any> = listOf(extra, "a")
  println("String: " + hasType<String>(items))
  println("Boolean: " + hasType<Boolean>(items))
  println("Int: " + hasType<Int>(items))
}`,
    sampleInput: 'main()',
    expectedOutput: 'String: true\nBoolean: false\nInt: true',
    testCase: { call: '', expected: 'String: true\nBoolean: false\nInt: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '1', alternateLiteral: 'true' }],
      alternateExpectedOutput: 'String: true\nBoolean: true\nInt: false',
    },
  },
  {
    id: 'world-12-practice-writerun-alias-handler',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write type aliases for a function type and a list type, and use them in a function.',
    conceptTags: ['lesson:type-aliases', 'type-alias', 'function-type-alias', 'list-alias'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Alias Handler',
    goal: 'Give short names to two types. Use them to apply a function twice, and to keep a list of names.',
    description: '1. **Write the aliases.** Above `main`, write `typealias Handler = (Int) -> Int` and `typealias Names = List<String>`.\n\n' +
              '2. **Write twice.** Write `fun twice(h: Handler, x: Int): Int`. It returns `h(h(x))`.\n\n' +
              '3. **Use twice.** Print `twice({ it + 5 }, start)`, then `twice({ it * 3 }, start)`:\n"11"\n"9"\n\n' +
              '4. **Use the list alias.** Create `val names: Names` as `listOf("a", "bb")`. Print "Names: " plus `names.size`:\n"Names: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the aliases.** Name the function type and the list type.',
          '2. **Write twice.** Call `h` two times.',
          '3. **Use twice.** Try add 5, then multiply by 3.',
          '4. **Use the list alias.** Print the size.',
        ],
        comments: [
          '// 1. Write the aliases. Name the function type and the list type.',
          '// 2. Write twice. Call h two times.',
          '// 3. Use twice. Try add 5, then multiply by 3.',
          '// 4. Use the list alias. Print the size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the aliases.**',
          '2. **Write twice.**',
          '3. **Use twice.**',
          '4. **Use the list alias.**',
        ],
        comments: [
          '// 1. Write the aliases.',
          '// 2. Write twice.',
          '// 3. Use twice.',
          '// 4. Use the list alias.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AliasHandler.kt',
    initialCode: `// 1. Write the aliases. Above main, write typealias Handler = (Int) -> Int and typealias Names = List<String>.

// 2. Write twice. Write fun twice(h: Handler, x: Int): Int. It returns h(h(x)).

fun main() {
  val start = 1

  // 3. Use twice. Print twice({ it + 5 }, start), then twice({ it * 3 }, start): "11" "9"

  // 4. Use the list alias. Create val names: Names as listOf("a", "bb"). Print "Names: " plus names.size: "Names: 2"
}`,
    solutionCode: `typealias Handler = (Int) -> Int
typealias Names = List<String>

fun twice(h: Handler, x: Int): Int {
  return h(h(x))
}

fun main() {
  val start = 1
  println(twice({ it + 5 }, start))
  println(twice({ it * 3 }, start))
  val names: Names = listOf("a", "bb")
  println("Names: " + names.size)
}`,
    sampleInput: 'main()',
    expectedOutput: '11\n9\nNames: 2',
    testCase: { call: '', expected: '11\n9\nNames: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '1', alternateLiteral: '2' }],
      alternateExpectedOutput: '12\n18\nNames: 2',
    },
  },
  {
    id: 'world-12-practice-writerun-alias-bucket',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write generic type aliases and use them to fill a list and count the items that pass a test.',
    conceptTags: ['lesson:type-aliases', 'type-alias', 'generic-alias', 'function-type-alias'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Alias Bucket',
    goal: 'Use short names for a list type and a test type. Fill a list with tens and count how many items pass a test.',
    description: '1. **Write the aliases.** Above `main`, write `typealias Bucket<T> = MutableList<T>` and `typealias Predicate<T> = (T) -> Boolean`.\n\n' +
              '2. **Write the functions.** Write `fun fill(b: Bucket<Int>, n: Int)` that adds `i * 10` for `i` from `1` to `n`. Write `fun countIf(items: List<Int>, p: Predicate<Int>): Int` that counts the items for which `p(x)` is true.\n\n' +
              '3. **Fill the bucket.** Create `val b: Bucket<Int>` as `mutableListOf<Int>()`. Call `fill(b, n)`. Print `Bucket: ` and the list with a string template:\n"Bucket: [10, 20, 30, 40]"\n\n' +
              '4. **Count the big ones.** Print "Big: " plus `countIf(b) { it > 15 }`:\n"Big: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the aliases.** A generic list alias and a test alias.',
          '2. **Write the functions.** Fill the list and count with the test.',
          '3. **Fill the bucket.** Print the list.',
          '4. **Count the big ones.** Use `it > 15`.',
        ],
        comments: [
          '// 1. Write the aliases. A generic list alias and a test alias.',
          '// 2. Write the functions. Fill the list and count with the test.',
          '// 3. Fill the bucket. Print the list.',
          '// 4. Count the big ones. Use it > 15.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the aliases.**',
          '2. **Write the functions.**',
          '3. **Fill the bucket.**',
          '4. **Count the big ones.**',
        ],
        comments: [
          '// 1. Write the aliases.',
          '// 2. Write the functions.',
          '// 3. Fill the bucket.',
          '// 4. Count the big ones.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AliasBucket.kt',
    initialCode: `// 1. Write the aliases. Above main, write typealias Bucket<T> = MutableList<T> and typealias Predicate<T> = (T) -> Boolean.

// 2. Write the functions. Write fun fill(b: Bucket<Int>, n: Int) that adds i * 10 for i from 1 to n. Write fun countIf(items: List<Int>, p: Predicate<Int>): Int that counts the items for which p(x) is true.

fun main() {
  val n = 4

  // 3. Fill the bucket. Create val b: Bucket<Int> as mutableListOf<Int>(). Call fill(b, n). Print Bucket:  and the list with a string template: "Bucket: [10, 20, 30, 40]"

  // 4. Count the big ones. Print "Big: " plus countIf(b) { it > 15 }: "Big: 3"
}`,
    solutionCode: `typealias Bucket<T> = MutableList<T>
typealias Predicate<T> = (T) -> Boolean

fun fill(b: Bucket<Int>, n: Int) {
  for (i in 1..n) {
    b.add(i * 10)
  }
}

fun countIf(items: List<Int>, p: Predicate<Int>): Int {
  var c = 0
  for (x in items) {
    if (p(x)) {
      c += 1
    }
  }
  return c
}

fun main() {
  val n = 4
  val b: Bucket<Int> = mutableListOf<Int>()
  fill(b, n)
  println("Bucket: $b")
  println("Big: " + countIf(b) { it > 15 })
}`,
    sampleInput: 'main()',
    expectedOutput: 'Bucket: [10, 20, 30, 40]\nBig: 3',
    testCase: { call: '', expected: 'Bucket: [10, 20, 30, 40]\nBig: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '4', alternateLiteral: '2' }],
      alternateExpectedOutput: 'Bucket: [10, 20]\nBig: 1',
    },
  },
  {
    id: 'world-12-practice-writerun-typed-repo',
    worldId: 'world-12',
    difficulty: 'medium',
    summary: 'Write a generic class that follows a generic interface, and keep words and numbers in separate typed stores.',
    conceptTags: ['lesson:type-safe-generic-apis', 'generic-interface', 'generic-class', 'typed-api'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Typed Repo',
    goal: 'A store keeps items of one type. Make one store for words and one for numbers. Print what each holds and the count of all items.',
    description: 'The interface `Repo<T>` is in the starter code.\n\n' +
              '1. **Write the store.** Above `main`, write `class MemRepo<T> : Repo<T>`. Keep a private `mutableListOf<T>()` called `items`. Override `add(x: T)` to add to `items`. Override `all(): List<T>` to return `items`.\n\n' +
              '2. **Fill the words.** Create `val words: Repo<String>` as `MemRepo()`. Add "a", "b" and `last`.\n\n' +
              '3. **Fill the numbers.** Create `val numbers: Repo<Int>` as `MemRepo()`. Add `1` and `2`.\n\n' +
              '4. **Print three lines.** Use `all()` and string templates for the lists. For the count, add the two sizes:\n"Words: [a, b, c]"\n"Numbers: [1, 2]"\n"Count: 5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the store.** Implement `Repo<T>` with a list.',
          '2. **Fill the words.** Use `Repo<String>`.',
          '3. **Fill the numbers.** Use `Repo<Int>`.',
          '4. **Print three lines.** Show both stores and the count.',
        ],
        comments: [
          '// 1. Write the store. Implement Repo<T> with a list.',
          '// 2. Fill the words. Use Repo<String>.',
          '// 3. Fill the numbers. Use Repo<Int>.',
          '// 4. Print three lines. Show both stores and the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the store.**',
          '2. **Fill the words.**',
          '3. **Fill the numbers.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the store.',
          '// 2. Fill the words.',
          '// 3. Fill the numbers.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TypedRepo.kt',
    initialCode: `interface Repo<T> {
  fun add(x: T)
  fun all(): List<T>
}

// 1. Write the store. Above main, write class MemRepo<T> : Repo<T>. Keep a private mutableListOf<T>() called items. Override add(x: T) to add to items. Override all(): List<T> to return items.

fun main() {
  val last = "c"

  // 2. Fill the words. Create val words: Repo<String> as MemRepo(). Add "a", "b" and last.

  // 3. Fill the numbers. Create val numbers: Repo<Int> as MemRepo(). Add 1 and 2.

  // 4. Print three lines. Use all() and string templates for the lists. For the count, add the two sizes: "Words: [a, b, c]" "Numbers: [1, 2]" "Count: 5"
}`,
    solutionCode: `interface Repo<T> {
  fun add(x: T)
  fun all(): List<T>
}

class MemRepo<T> : Repo<T> {
  private val items = mutableListOf<T>()

  override fun add(x: T) {
    items.add(x)
  }

  override fun all(): List<T> {
    return items
  }
}

fun main() {
  val last = "c"
  val words: Repo<String> = MemRepo()
  words.add("a")
  words.add("b")
  words.add(last)
  val numbers: Repo<Int> = MemRepo()
  numbers.add(1)
  numbers.add(2)
  val wordList = words.all()
  val numberList = numbers.all()
  println("Words: $wordList")
  println("Numbers: $numberList")
  println("Count: " + (wordList.size + numberList.size))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Words: [a, b, c]\nNumbers: [1, 2]\nCount: 5',
    testCase: { call: '', expected: 'Words: [a, b, c]\nNumbers: [1, 2]\nCount: 5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'last', originalLiteral: '"c"', alternateLiteral: '"z"' }],
      alternateExpectedOutput: 'Words: [a, b, z]\nNumbers: [1, 2]\nCount: 5',
    },
  },
  {
    id: 'world-12-practice-writerun-answer-unwrap',
    worldId: 'world-12',
    difficulty: 'hard',
    summary: 'Write a generic function that opens a sealed answer type and uses a fallback for errors.',
    conceptTags: ['lesson:type-safe-generic-apis', 'sealed-generic', 'out-variance', 'exhaustive-when'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Answer Unwrap',
    goal: 'An answer is either a value or an error. Write a function that gives the value, or a fallback for an error. Try it with numbers and text.',
    description: 'The sealed class `Answer<out T>` with `Ok` and `Err` is in the starter code.\n\n' +
              '1. **Write unwrap.** Above `main`, write `fun <T> unwrap(a: Answer<T>, fallback: T): T`. Use `when (a)` with no `else`. For `is Ok`, return `a.value`. For `is Err`, return `fallback`.\n\n' +
              '2. **Unwrap a good number.** Print `unwrap(Ok(5), fallback)`:\n"5"\n\n' +
              '3. **Unwrap an error.** Print `unwrap(Err("bad"), fallback)`:\n"0"\n\n' +
              '4. **Unwrap text.** Print `unwrap(Ok("hi"), "none")`:\n"hi"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write unwrap.** Use an exhaustive `when`.',
          '2. **Unwrap a good number.** Use `Ok(5)`.',
          '3. **Unwrap an error.** Use `Err("bad")`.',
          '4. **Unwrap text.** Use `Ok("hi")`.',
        ],
        comments: [
          '// 1. Write unwrap. Use an exhaustive when.',
          '// 2. Unwrap a good number. Use Ok(5).',
          '// 3. Unwrap an error. Use Err("bad").',
          '// 4. Unwrap text. Use Ok("hi").',
        ],
      },
      experienced: {
        steps: [
          '1. **Write unwrap.**',
          '2. **Unwrap a good number.**',
          '3. **Unwrap an error.**',
          '4. **Unwrap text.**',
        ],
        comments: [
          '// 1. Write unwrap.',
          '// 2. Unwrap a good number.',
          '// 3. Unwrap an error.',
          '// 4. Unwrap text.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AnswerUnwrap.kt',
    initialCode: `sealed class Answer<out T>

class Ok<T>(val value: T) : Answer<T>()

class Err(val msg: String) : Answer<Nothing>()

// 1. Write unwrap. Above main, write fun <T> unwrap(a: Answer<T>, fallback: T): T. Use when (a) with no else. For is Ok, return a.value. For is Err, return fallback.

fun main() {
  val fallback = 0

  // 2. Unwrap a good number. Print unwrap(Ok(5), fallback): "5"

  // 3. Unwrap an error. Print unwrap(Err("bad"), fallback): "0"

  // 4. Unwrap text. Print unwrap(Ok("hi"), "none"): "hi"
}`,
    solutionCode: `sealed class Answer<out T>

class Ok<T>(val value: T) : Answer<T>()

class Err(val msg: String) : Answer<Nothing>()

fun <T> unwrap(a: Answer<T>, fallback: T): T {
  return when (a) {
    is Ok -> a.value
    is Err -> fallback
  }
}

fun main() {
  val fallback = 0
  println(unwrap(Ok(5), fallback))
  println(unwrap(Err("bad"), fallback))
  println(unwrap(Ok("hi"), "none"))
}`,
    sampleInput: 'main()',
    expectedOutput: '5\n0\nhi',
    testCase: { call: '', expected: '5\n0\nhi' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'fallback', originalLiteral: '0', alternateLiteral: '-1' }],
      alternateExpectedOutput: '5\n-1\nhi',
    },
  },
];

export const WORLD_12_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-12-practice-debug-wrong-arg',
    worldId: 'world-12',
    conceptTags: ['lesson:generic-classes', 'generic-class', 'type-argument'],
    summary: 'The value does not match the type argument of the box.',
    title: 'Fix the Box Type',
    subtitle: 'The program should print "5", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the value does not match the type argument',
    brokenCode: `class Box<T>(val value: T)

fun main() {
  val b: Box<String> = Box(5)
  println(b.value)
}`,
    fixedCode: `class Box<T>(val value: T)

fun main() {
  val b: Box<Int> = Box(5)
  println(b.value)
}`,
    expectedOutput: '5',
    hints: [
              'Look at the declared type of `b` and at the value given to `Box`.',
              'The type says `Box<String>`, so `T` is `String`. The value `5` is an `Int`.',
              'Make the type argument match the value you store.',
            ],
    explanation: '`Box<String>` fixes `T` to `String`, but `Box(5)` stores an `Int`, so Kotlin reports a type mismatch. With `Box<Int>` the type argument matches the value, and the program prints `5`.',
  },
  {
    id: 'world-12-practice-debug-no-swap',
    worldId: 'world-12',
    conceptTags: ['lesson:generic-functions', 'generic-function', 'swap-logic'],
    summary: 'The generic swap keeps the pair in the same order.',
    title: 'Fix the Swap',
    subtitle: 'The program should print "(2, 1)", but it prints "(1, 2)".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the function returns the pair in the same order',
    brokenCode: `fun <T> swapPair(p: Pair<T, T>): Pair<T, T> {
  return Pair(p.first, p.second)
}

fun main() {
  println(swapPair(Pair(1, 2)))
}`,
    fixedCode: `fun <T> swapPair(p: Pair<T, T>): Pair<T, T> {
  return Pair(p.second, p.first)
}

fun main() {
  println(swapPair(Pair(1, 2)))
}`,
    expectedOutput: '(2, 1)',
    hints: [
              'Compare the printed pair with the pair you gave the function.',
              'The function builds a new pair from `first` and `second` in the same order.',
              'Change the order of the two values in the new pair.',
            ],
    explanation: '`Pair(p.first, p.second)` keeps the order, so nothing is swapped. `Pair(p.second, p.first)` puts the second value first, so `Pair(1, 2)` becomes `(2, 1)`.',
  },
  {
    id: 'world-12-practice-debug-one-type',
    worldId: 'world-12',
    conceptTags: ['lesson:type-parameters', 'type-parameter', 'inferred-type'],
    summary: 'T is one type, but the result is stored in another type.',
    title: 'Fix the One Type',
    subtitle: 'The program should print "a", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: T is one type, but the result is declared as another',
    brokenCode: `fun <T> pick(a: T, b: T): T {
  return a
}

fun main() {
  val x: Int = pick("a", "b")
  println(x)
}`,
    fixedCode: `fun <T> pick(a: T, b: T): T {
  return a
}

fun main() {
  val x = pick("a", "b")
  println(x)
}`,
    expectedOutput: 'a',
    hints: [
              'Look at the arguments of `pick` and at the type of `x`.',
              'Both arguments are text, so `T` is `String`. The result is `String`, but `x` is declared as `Int`.',
              'Remove the wrong declared type, and let Kotlin work out the type of `x` from the arguments.',
            ],
    explanation: '`pick("a", "b")` gives `T = String`, so it returns a `String`. A `String` cannot be stored in an `Int` variable. Without the declared type, Kotlin infers `x` as `String`, and the program prints `a`.',
  },
  {
    id: 'world-12-practice-debug-smallest-not-biggest',
    worldId: 'world-12',
    conceptTags: ['lesson:generic-constraints', 'comparable-bound', 'comparison-direction'],
    summary: 'The comparison finds the smallest value, not the biggest.',
    title: 'Fix the Biggest',
    subtitle: 'The program should print "9" and "zebra", but it prints "3" and "apple".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the comparison picks the smallest value',
    brokenCode: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x < best) {
      best = x
    }
  }
  return best
}

fun main() {
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
}`,
    fixedCode: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x > best) {
      best = x
    }
  }
  return best
}

fun main() {
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
}`,
    expectedOutput: '9\nzebra',
    hints: [
              'Look at the output. Are the values the biggest or the smallest?',
              'The loop replaces `best` when `x < best`, so it keeps the smallest item.',
              'Change the comparison so that `best` is replaced by a bigger item.',
            ],
    explanation: 'With `x < best`, `best` always moves to a smaller value, so the function finds the smallest item. With `x > best`, it finds the biggest: `9` and `zebra`.',
  },
  {
    id: 'world-12-practice-debug-priciest-pick',
    worldId: 'world-12',
    conceptTags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'comparison-direction'],
    summary: 'The loop keeps the most expensive item.',
    title: 'Fix the Cheapest',
    subtitle: 'The program should print "cap costs 8", but it prints "bag costs 30".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the loop keeps the most expensive item',
    brokenCode: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() > best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun main() {
  val items = listOf(Item("pen", 12), Item("cap", 8), Item("bag", 30))
  println(cheapest(items))
}`,
    fixedCode: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() < best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun main() {
  val items = listOf(Item("pen", 12), Item("cap", 8), Item("bag", 30))
  println(cheapest(items))
}`,
    expectedOutput: 'cap costs 8',
    hints: [
              'Which item does the function return? Is it the cheapest?',
              'The loop replaces `best` when the price is greater, so it keeps the highest price.',
              'Change the comparison so that a lower price wins.',
            ],
    explanation: 'The test `x.price() > best.price()` keeps the most expensive item. Using `<` keeps the cheapest, so the answer is `cap costs 8`.',
  },
  {
    id: 'world-12-practice-debug-fresh-sink',
    worldId: 'world-12',
    conceptTags: ['lesson:in-variance', 'in-variance', 'shared-object'],
    summary: 'A second Log is created, so one line is lost.',
    title: 'Fix the Split Log',
    subtitle: 'The program should print "Lines: 2", but it prints "Lines: 1".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: a second Log is created instead of reusing the first',
    brokenCode: `interface Sink<in T> {
  fun put(x: T)
}

class Log : Sink<Any> {
  var lines = 0

  override fun put(x: Any) {
    lines += 1
  }
}

fun main() {
  val log = Log()
  val a: Sink<Int> = log
  val b: Sink<String> = Log()
  a.put(1)
  b.put("x")
  println("Lines: " + log.lines)
}`,
    fixedCode: `interface Sink<in T> {
  fun put(x: T)
}

class Log : Sink<Any> {
  var lines = 0

  override fun put(x: Any) {
    lines += 1
  }
}

fun main() {
  val log = Log()
  val a: Sink<Int> = log
  val b: Sink<String> = log
  a.put(1)
  b.put("x")
  println("Lines: " + log.lines)
}`,
    expectedOutput: 'Lines: 2',
    hints: [
              'Count how many `Log` objects are created in `main`.',
              '`b` is a new `Log`, so its line is stored in another object that is never printed.',
              'Use the `Log` you already have for both sinks. A `Sink<Any>` can serve both.',
            ],
    explanation: '`Sink<in T>` lets one `Log`, which is a `Sink<Any>`, work as a `Sink<Int>` and as a `Sink<String>`. Here `b` is a second `Log`, so `log.lines` only sees one line. Giving `b` the same `log` makes it `2`.',
  },
  {
    id: 'world-12-practice-debug-fresh-source',
    worldId: 'world-12',
    conceptTags: ['lesson:out-variance', 'lesson:declaration-site-variance', 'out-variance', 'declaration-site-variance', 'shared-object'],
    summary: 'A second Counter is created, so the numbers are not shared.',
    title: 'Fix the Split Counter',
    subtitle: 'The program should print "1", "2" and "3", but it prints "1", "1" and "2".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: a second Counter is created instead of reusing the first',
    brokenCode: `interface Source<out T> {
  fun next(): T
}

class Counter : Source<Int> {
  var n = 0

  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val c = Counter()
  val a: Source<Number> = c
  val b: Source<Any> = Counter()
  println(a.next())
  println(b.next())
  println(a.next())
}`,
    fixedCode: `interface Source<out T> {
  fun next(): T
}

class Counter : Source<Int> {
  var n = 0

  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val c = Counter()
  val a: Source<Number> = c
  val b: Source<Any> = c
  println(a.next())
  println(b.next())
  println(a.next())
}`,
    expectedOutput: '1\n2\n3',
    hints: [
              'Count how many `Counter` objects are created in `main`.',
              '`b` is a new `Counter` with its own count, so the numbers are not shared.',
              'Use the `Counter` you already have for both sources. A `Source<Int>` can be used as a `Source<Number>` or `Source<Any>`.',
            ],
    explanation: '`Source<out T>` lets one `Counter`, which is a `Source<Int>`, be used as a `Source<Number>` and as a `Source<Any>`. Here `b` is another `Counter`, so it counts on its own. Sharing `c` gives `1`, `2`, `3`.',
  },
  {
    id: 'world-12-practice-debug-cell-any',
    worldId: 'world-12',
    conceptTags: ['lesson:invariance', 'invariance', 'generic-function'],
    summary: 'A Cell<Int> is passed where a Cell<Any> is needed.',
    title: 'Fix the Cell Type',
    subtitle: 'The program should print "4", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: Cell<Int> is not a Cell<Any>',
    brokenCode: `class Cell<T>(val value: T)

fun show(c: Cell<Any>) {
  println(c.value)
}

fun main() {
  val c = Cell(4)
  show(c)
}`,
    fixedCode: `class Cell<T>(val value: T)

fun <T> show(c: Cell<T>) {
  println(c.value)
}

fun main() {
  val c = Cell(4)
  show(c)
}`,
    expectedOutput: '4',
    hints: [
              'Look at the type of the parameter of `show` and the type of `c` in `main`.',
              '`Cell<Int>` is not a `Cell<Any>`. A class with a type parameter is invariant by default.',
              'Make `show` generic, so it accepts a cell of any one type.',
            ],
    explanation: '`Cell<T>` is invariant, so a `Cell<Int>` cannot be used where a `Cell<Any>` is needed. A generic function `fun <T> show(c: Cell<T>)` accepts a cell of any type and prints `4`.',
  },
  {
    id: 'world-12-practice-debug-copy-list',
    worldId: 'world-12',
    conceptTags: ['lesson:use-site-variance', 'use-site-variance', 'in-projection'],
    summary: 'The function fills a copy of the list.',
    title: 'Fix the Copy',
    subtitle: 'The program should print "[1, 2, 7]", but it prints "[1, 2]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the function fills a copy of the list',
    brokenCode: `fun fill(list: MutableList<in Int>) {
  list.add(7)
}

fun main() {
  val nums = mutableListOf<Number>(1, 2)
  fill(nums.toMutableList())
  println(nums)
}`,
    fixedCode: `fun fill(list: MutableList<in Int>) {
  list.add(7)
}

fun main() {
  val nums = mutableListOf<Number>(1, 2)
  fill(nums)
  println(nums)
}`,
    expectedOutput: '[1, 2, 7]',
    hints: [
              'Look at what is passed to `fill`. Is it the list `nums`?',
              '`toMutableList()` makes a new list. `fill` adds the `7` to that copy.',
              'Pass the list itself, so the `7` is added to the list you print.',
            ],
    explanation: '`nums.toMutableList()` is a copy, so `fill` changes the copy and `nums` stays `[1, 2]`. The projection `in Int` allows a `MutableList<Number>`, so `fill(nums)` works and adds the `7`.',
  },
  {
    id: 'world-12-practice-debug-typed-box',
    worldId: 'world-12',
    conceptTags: ['lesson:star-projections', 'star-projection', 'type-argument'],
    summary: 'The parameter only accepts Box<Int>.',
    title: 'Fix the Box Parameter',
    subtitle: 'The program should print "box a", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the parameter only accepts Box<Int>',
    brokenCode: `class Box<T>(val value: T)

fun describe(b: Box<Int>): String {
  return "box " + b.value
}

fun main() {
  println(describe(Box("a")))
}`,
    fixedCode: `class Box<T>(val value: T)

fun describe(b: Box<*>): String {
  return "box " + b.value
}

fun main() {
  println(describe(Box("a")))
}`,
    expectedOutput: 'box a',
    hints: [
              'Look at the type of the parameter of `describe` and at the box in `main`.',
              '`Box<Int>` only accepts boxes of numbers. The box in `main` holds text.',
              'Change the parameter so it accepts a box of any type.',
            ],
    explanation: 'The parameter `Box<Int>` rejects `Box<String>`. A star projection, `Box<*>`, accepts a box of any type, and the value can be read as `Any`. Then `describe(Box("a"))` prints `box a`.',
  },
  {
    id: 'world-12-practice-debug-wrong-type-arg',
    worldId: 'world-12',
    conceptTags: ['lesson:reified-type-parameters', 'reified', 'type-argument'],
    summary: 'The call counts the wrong type.',
    title: 'Fix the Type Argument',
    subtitle: 'The program should print "Strings: 3", but it prints "Strings: 2".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the call counts the wrong type',
    brokenCode: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val items: List<Any> = listOf(1, "a", 2, "b", "c")
  println("Strings: " + countOf<Int>(items))
}`,
    fixedCode: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val items: List<Any> = listOf(1, "a", 2, "b", "c")
  println("Strings: " + countOf<String>(items))
}`,
    expectedOutput: 'Strings: 3',
    hints: [
              'Look at the type argument in the call to `countOf`.',
              'The call counts the `Int` items, and there are only two of them.',
              'Choose the type argument for the items you want to count.',
            ],
    explanation: '`countOf<Int>` counts the `Int` items, which are `1` and `2`. To count the text items, the type argument must be `String`. Then the answer is `3`.',
  },
  {
    id: 'world-12-practice-debug-alias-mixup',
    worldId: 'world-12',
    conceptTags: ['lesson:type-aliases', 'type-alias', 'no-new-type'],
    summary: 'An alias does not stop feet from being used as meters.',
    title: 'Fix the Mixed Units',
    subtitle: 'The program should print "15", but it prints "35".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: an alias does not stop a wrong unit from being passed',
    brokenCode: `typealias Meters = Int
typealias Feet = Int

fun add(a: Meters, b: Meters): Meters {
  return a + b
}

fun main() {
  val room: Feet = 30
  println(add(5, room))
}`,
    fixedCode: `typealias Meters = Int
typealias Feet = Int

fun add(a: Meters, b: Meters): Meters {
  return a + b
}

fun main() {
  val room: Feet = 30
  val roomMeters: Meters = room / 3
  println(add(5, roomMeters))
}`,
    expectedOutput: '15',
    hints: [
              'Look at the units. What does `room` measure? What does `add` expect?',
              '`Feet` and `Meters` are both just `Int`. An alias does not stop you from mixing them.',
              'Convert the feet to meters before you call `add`. One meter is about 3 feet in this program.',
            ],
    explanation: 'A `typealias` is only another name, so `Feet` and `Meters` are the same type and Kotlin allows the mix. Here `30` feet was added as if it was meters. Dividing by `3` first gives `10` meters, so the total is `15`.',
  },
  {
    id: 'world-12-practice-debug-lost-type',
    worldId: 'world-12',
    conceptTags: ['lesson:type-safe-generic-apis', 'typed-api', 'cast', 'generic-function'],
    summary: 'A cast fails because the list was typed as Any.',
    title: 'Fix the Lost Type',
    subtitle: 'The program should print "1", but it stops with an error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: a cast fails because the type was lost',
    brokenCode: `fun firstOf(list: List<Any>): String {
  return list[0] as String
}

fun main() {
  println(firstOf(listOf(1, 2)))
}`,
    fixedCode: `fun <T> firstOf(list: List<T>): T {
  return list[0]
}

fun main() {
  println(firstOf(listOf(1, 2)))
}`,
    expectedOutput: '1',
    hints: [
              'Look at the error. Which line does it come from?',
              'The function takes a `List<Any>` and forces the first item to be `String` with `as`. The first item is an `Int`.',
              'Keep the type of the list items instead of using `Any` and a cast.',
            ],
    explanation: 'The type `Any` hides what the list holds, so the code casts with `as String`, which fails for an `Int`. A generic function `fun <T> firstOf(list: List<T>): T` keeps the real type, needs no cast, and prints `1`.',
  },
];
