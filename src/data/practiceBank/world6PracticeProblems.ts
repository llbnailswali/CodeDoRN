import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 6 -- Collection Valley (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps, the collection operation is named in the step.
//   hard   -- state carried through several collection operations, an easily
//             confused pair (remove vs removeAt, alias vs copy, even vs odd median),
//             and multi-line output; the step names the quantity, not the call.
//
// Every expected value was derived with an independent reference (plain
// JavaScript), not copied from the simulator, and is re-verified by
// scripts/test-practice-bank.ts. Map values are read with for ((key, value) in map)
// or printed through map[key] (which may print null); tasks never do arithmetic
// on a nullable map[key] because null safety is World 7. The Boss is not in the tab.

export const WORLD_6_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // ------------------------------------------------------------------ arrays
  {
    id: 'world-6-practice-writerun-lap-times',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Correct one element of an array by index, then scan it for the total and the fastest lap.',
    conceptTags: ['lesson:arrays', 'array-index', 'array-update', 'for-loop', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Lap Times',
    goal:
      'A runner recorded five lap times. The first lap was timed 3 seconds too slow. Fix that lap. Then find the fastest lap and the total time. Print a summary with the lap count and the last lap.',
    description:
      '1. **Fix the first lap.** Set `laps[0]` to its current value minus `3`.\n\n' +
              '2. **Scan all laps.** Loop over `laps` with `for`. Keep `var total` (the sum of all times) and `var fastest` (the smallest time, starting at `laps[0]`).\n\n' +
              '3. **Print the summary.** Use string templates. The count is `laps.size` and the last lap is the element at the last index:\n"Laps: 5 | Fastest: 55 | Total: 293 | Last: 60"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Fix the first lap.** Reassign `laps[0]`.',
          '2. **Scan all laps.** Use a `for` loop with `total` and `fastest`.',
          '3. **Print the summary.** Use `laps.size` and the last index.',
        ],
        comments: [
          '// 1. Fix the first lap. Reassign laps[0].',
          '// 2. Scan all laps. Use a for loop with total and fastest.',
          '// 3. Print the summary. Use laps.size and the last index.',
        ],
      },
      experienced: {
        steps: [
          '1. **Fix the first lap.**',
          '2. **Scan all laps.**',
          '3. **Print the summary.**',
        ],
        comments: [
          '// 1. Fix the first lap.',
          '// 2. Scan all laps.',
          '// 3. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LapTimes.kt',
    initialCode: `fun main() {
  val laps = arrayOf(62, 58, 61, 55, 60)

  // 1. Fix the first lap. Set laps[0] to its current value minus 3.

  // 2. Scan all laps. Loop over laps with for. Keep var total (the sum of all times) and var fastest (the smallest time, starting at laps[0]).

  // 3. Print the summary. Use string templates. The count is laps.size and the last lap is the element at the last index: "Laps: 5 | Fastest: 55 | Total: 293 | Last: 60"
}`,
    solutionCode: `fun main() {
  val laps = arrayOf(62, 58, 61, 55, 60)
  laps[0] = laps[0] - 3
  var total = 0
  var fastest = laps[0]
  for (time in laps) {
    total += time
    if (time < fastest) {
      fastest = time
    }
  }
  println("Laps: \${laps.size} | Fastest: $fastest | Total: $total | Last: \${laps[laps.size - 1]}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Laps: 5 | Fastest: 55 | Total: 293 | Last: 60',
    testCase: { call: '', expected: 'Laps: 5 | Fastest: 55 | Total: 293 | Last: 60' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'laps', originalLiteral: 'arrayOf(62, 58, 61, 55, 60)', alternateLiteral: 'arrayOf(70, 66, 64, 68, 65)' }],
      alternateExpectedOutput: 'Laps: 5 | Fastest: 64 | Total: 330 | Last: 65',
    },
  },
  {
    id: 'world-6-practice-writerun-array-reversal',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Reverse an array in place by swapping elements from both ends with index arithmetic.',
    conceptTags: ['lesson:arrays', 'array-index', 'array-update', 'for-loop', 'swap'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Array Reversal',
    goal:
      'Reverse an array of six numbers without using a second array. Print the reversed array and its middle element.',
    description:
      '1. **Loop to the halfway point.** Loop `i` from `0` until `data.size / 2`.\n\n' +
              '2. **Swap the mirror elements.** Swap `data[i]` with `data[data.size - 1 - i]`. Use a temporary variable so no value is lost.\n\n' +
              '3. **Print the array.** Use a string template with `data.joinToString(", ")`:\n"Reversed: 7, 4, 9, 1, 8, 3"\n\n' +
              '4. **Print the middle element.** Use the element at `data.size / 2`. Int division drops the fraction:\n"Middle: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Loop to the halfway point.** Use `until`.',
          '2. **Swap the mirror elements.** Use a temporary variable.',
          '3. **Print the array.** Use `joinToString(", ")`.',
          '4. **Print the middle element.**',
        ],
        comments: [
          '// 1. Loop to the halfway point. Use until.',
          '// 2. Swap the mirror elements. Use a temporary variable.',
          '// 3. Print the array. Use joinToString(", ").',
          '// 4. Print the middle element.',
        ],
      },
      experienced: {
        steps: [
          '1. **Loop to the halfway point.**',
          '2. **Swap the mirror elements.**',
          '3. **Print the array.**',
          '4. **Print the middle element.**',
        ],
        comments: [
          '// 1. Loop to the halfway point.',
          '// 2. Swap the mirror elements.',
          '// 3. Print the array.',
          '// 4. Print the middle element.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ArrayReversal.kt',
    initialCode: `fun main() {
  val data = arrayOf(3, 8, 1, 9, 4, 7)

  // 1. Loop to the halfway point. Loop i from 0 until data.size / 2.

  // 2. Swap the mirror elements. Swap data[i] with data[data.size - 1 - i]. Use a temporary variable so no value is lost.

  // 3. Print the array. Use a string template with data.joinToString(", "): "Reversed: 7, 4, 9, 1, 8, 3"

  // 4. Print the middle element. Use the element at data.size / 2. Int division drops the fraction: "Middle: 1"
}`,
    solutionCode: `fun main() {
  val data = arrayOf(3, 8, 1, 9, 4, 7)
  for (i in 0 until data.size / 2) {
    val temp = data[i]
    data[i] = data[data.size - 1 - i]
    data[data.size - 1 - i] = temp
  }
  println("Reversed: \${data.joinToString(", ")}")
  println("Middle: \${data[data.size / 2]}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Reversed: 7, 4, 9, 1, 8, 3\nMiddle: 1',
    testCase: { call: '', expected: 'Reversed: 7, 4, 9, 1, 8, 3\nMiddle: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'data', originalLiteral: 'arrayOf(3, 8, 1, 9, 4, 7)', alternateLiteral: 'arrayOf(5, 2, 6, 1, 9)' }],
      alternateExpectedOutput: 'Reversed: 9, 1, 6, 2, 5\nMiddle: 6',
    },
  },

  // ------------------------------------------------------------------- lists
  {
    id: 'world-6-practice-writerun-playlist-desk',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Read a read-only list by position and by value: first, last, an index, a search, and a sorted copy.',
    conceptTags: ['lesson:lists', 'list-index', 'indexOf', 'contains', 'sorted', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Playlist Desk',
    goal:
      'A playlist has five songs. Print the number of songs, the first and last songs, the third song, the position of Moon and whether it contains Rain. Then make and print an alphabetical copy without changing the original order.',
    description:
      '1. **Print the size, first and last.** Use `size`, `first()` and `last()` in string templates:\n"Songs: 5 | First: Sky | Last: Star"\n\n' +
              '2. **Print the third song, a position and a check.** Use `songs[2]`, `indexOf("Moon")` and `contains("Rain")`:\n"Third: Sun | Moon is at 3 | Has Rain: false"\n\n' +
              '3. **Print a sorted copy.** Use `sorted()`, which leaves the original list unchanged:\n"Alphabetical: [Moon, River, Sky, Star, Sun]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the size, first and last.** Use `first()` and `last()`.',
          '2. **Print the third song, a position and a check.** Use `indexOf` and `contains`.',
          '3. **Print a sorted copy.** Use `sorted()`.',
        ],
        comments: [
          '// 1. Print the size, first and last. Use first() and last().',
          '// 2. Print the third song, a position and a check. Use indexOf and contains.',
          '// 3. Print a sorted copy. Use sorted().',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the size, first and last.**',
          '2. **Print the third song, a position and a check.**',
          '3. **Print a sorted copy.**',
        ],
        comments: [
          '// 1. Print the size, first and last.',
          '// 2. Print the third song, a position and a check.',
          '// 3. Print a sorted copy.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PlaylistDesk.kt',
    initialCode: `fun main() {
  val songs = listOf("Sky", "River", "Sun", "Moon", "Star")

  // 1. Print the size, first and last. Use size, first() and last() in string templates: "Songs: 5 | First: Sky | Last: Star"

  // 2. Print the third song, a position and a check. Use songs[2], indexOf("Moon") and contains("Rain"): "Third: Sun | Moon is at 3 | Has Rain: false"

  // 3. Print a sorted copy. Use sorted(), which leaves the original list unchanged: "Alphabetical: [Moon, River, Sky, Star, Sun]"
}`,
    solutionCode: `fun main() {
  val songs = listOf("Sky", "River", "Sun", "Moon", "Star")
  println("Songs: \${songs.size} | First: \${songs.first()} | Last: \${songs.last()}")
  println("Third: \${songs[2]} | Moon is at \${songs.indexOf("Moon")} | Has Rain: \${songs.contains("Rain")}")
  println("Alphabetical: \${songs.sorted()}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Songs: 5 | First: Sky | Last: Star\nThird: Sun | Moon is at 3 | Has Rain: false\nAlphabetical: [Moon, River, Sky, Star, Sun]',
    testCase: { call: '', expected: 'Songs: 5 | First: Sky | Last: Star\nThird: Sun | Moon is at 3 | Has Rain: false\nAlphabetical: [Moon, River, Sky, Star, Sun]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'songs', originalLiteral: 'listOf("Sky", "River", "Sun", "Moon", "Star")', alternateLiteral: 'listOf("Star", "Moon", "Sun", "River", "Sky")' }],
      alternateExpectedOutput: 'Songs: 5 | First: Star | Last: Sky\nThird: Sun | Moon is at 1 | Has Rain: false\nAlphabetical: [Moon, River, Sky, Star, Sun]',
    },
  },
  {
    id: 'world-6-practice-writerun-median-board',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Find the median of a list, whether it has an odd or an even number of items, plus the range and runner-up.',
    conceptTags: ['lesson:lists', 'list-index', 'sorted', 'if-else-expression', 'double-promotion'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Median Board',
    goal:
      'Find the median of six sensor readings. It must also work when the number of readings is odd or even. Find the range and the second-highest reading too. Print four lines.',
    description:
      '1. **Sort the readings.** Create `val sorted` (ascending) and `val n` (the count).\n\n' +
              '2. **Find the median.** Create `val median` as a Double. For an odd count it is the middle element. For an even count it is the average of the two middle elements. The code must work for both.\n\n' +
              '3. **Find the range.** Create `val range`: the largest reading minus the smallest.\n\n' +
              '4. **Print four lines.** Use string templates. The last shows the second element from the end of `sorted`:\n"Sorted: [58, 65, 72, 77, 81, 90]"\n"Median: 74.5"\n"Range: 32"\n"Second highest: 81"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Sort the readings.** Also keep the count.',
          '2. **Find the median.** Handle odd and even counts.',
          '3. **Find the range.** Largest minus smallest.',
          '4. **Print four lines.** Use string templates.',
        ],
        comments: [
          '// 1. Sort the readings. Also keep the count.',
          '// 2. Find the median. Handle odd and even counts.',
          '// 3. Find the range. Largest minus smallest.',
          '// 4. Print four lines. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Sort the readings.**',
          '2. **Find the median.**',
          '3. **Find the range.**',
          '4. **Print four lines.**',
        ],
        comments: [
          '// 1. Sort the readings.',
          '// 2. Find the median.',
          '// 3. Find the range.',
          '// 4. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MedianBoard.kt',
    initialCode: `fun main() {
  val readings = listOf(72, 65, 90, 58, 81, 77)

  // 1. Sort the readings. Create val sorted (ascending) and val n (the count).

  // 2. Find the median. Create val median as a Double. For an odd count it is the middle element. For an even count it is the average of the two middle elements. The code must work for both.

  // 3. Find the range. Create val range: the largest reading minus the smallest.

  // 4. Print four lines. Use string templates. The last shows the second element from the end of sorted: "Sorted: [58, 65, 72, 77, 81, 90]" "Median: 74.5" "Range: 32" "Second highest: 81"
}`,
    solutionCode: `fun main() {
  val readings = listOf(72, 65, 90, 58, 81, 77)
  val sorted = readings.sorted()
  val n = sorted.size
  val median = if (n % 2 == 1) sorted[n / 2].toDouble() else (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0
  val range = sorted.last() - sorted.first()
  println("Sorted: $sorted")
  println("Median: $median")
  println("Range: $range")
  println("Second highest: \${sorted[n - 2]}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sorted: [58, 65, 72, 77, 81, 90]\nMedian: 74.5\nRange: 32\nSecond highest: 81',
    testCase: { call: '', expected: 'Sorted: [58, 65, 72, 77, 81, 90]\nMedian: 74.5\nRange: 32\nSecond highest: 81' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'readings', originalLiteral: 'listOf(72, 65, 90, 58, 81, 77)', alternateLiteral: 'listOf(40, 95, 60, 85, 70)' }],
      alternateExpectedOutput: 'Sorted: [40, 60, 70, 85, 95]\nMedian: 70.0\nRange: 55\nSecond highest: 85',
    },
  },

  // -------------------------------------------------------------------- sets
  {
    id: 'world-6-practice-writerun-unique-visitors',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Collect visitors into a mutable set and use add\'s true/false result to count the repeat visits.',
    conceptTags: ['lesson:sets', 'mutable-set', 'set-add', 'contains', 'for-loop'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Unique Visitors',
    goal:
      'A website log has visitor names, and some visitors appear more than once. Put them in a set to count the different visitors. Also count the repeat visits. Print a summary line.',
    description:
      '1. **Prepare the set and the counter.** Create `unique` with `mutableSetOf<String>()` and `var repeats = 0`.\n\n' +
              '2. **Count the repeats.** Loop over `visits` and call `unique.add(visitor)`. It returns `true` for a new visitor and `false` for one already in the set. When it returns `false`, add `1` to `repeats`.\n\n' +
              '3. **Print the summary.** Use string templates with the number of visits, the set size, `repeats`, and whether the set contains "cy":\n"Visits: 6 | Unique: 3 | Repeat visits: 3 | Has cy: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Prepare the set and the counter.**',
          '2. **Count the repeats.** Check what `add` returns.',
          '3. **Print the summary.** Use `size` and `contains`.',
        ],
        comments: [
          '// 1. Prepare the set and the counter.',
          '// 2. Count the repeats. Check what add returns.',
          '// 3. Print the summary. Use size and contains.',
        ],
      },
      experienced: {
        steps: [
          '1. **Prepare the set and the counter.**',
          '2. **Count the repeats.**',
          '3. **Print the summary.**',
        ],
        comments: [
          '// 1. Prepare the set and the counter.',
          '// 2. Count the repeats.',
          '// 3. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'UniqueVisitors.kt',
    initialCode: `fun main() {
  val visits = listOf("ana", "bo", "ana", "cy", "bo", "ana")

  // 1. Prepare the set and the counter. Create unique with mutableSetOf<String>() and var repeats = 0.

  // 2. Count the repeats. Loop over visits and call unique.add(visitor). It returns true for a new visitor and false for one already in the set. When it returns false, add 1 to repeats.

  // 3. Print the summary. Use string templates with the number of visits, the set size, repeats, and whether the set contains "cy": "Visits: 6 | Unique: 3 | Repeat visits: 3 | Has cy: true"
}`,
    solutionCode: `fun main() {
  val visits = listOf("ana", "bo", "ana", "cy", "bo", "ana")
  val unique = mutableSetOf<String>()
  var repeats = 0
  for (visitor in visits) {
    if (!unique.add(visitor)) {
      repeats++
    }
  }
  println("Visits: \${visits.size} | Unique: \${unique.size} | Repeat visits: $repeats | Has cy: \${unique.contains("cy")}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Visits: 6 | Unique: 3 | Repeat visits: 3 | Has cy: true',
    testCase: { call: '', expected: 'Visits: 6 | Unique: 3 | Repeat visits: 3 | Has cy: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'visits', originalLiteral: 'listOf("ana", "bo", "ana", "cy", "bo", "ana")', alternateLiteral: 'listOf("dan", "eve", "dan")' }],
      alternateExpectedOutput: 'Visits: 3 | Unique: 2 | Repeat visits: 1 | Has cy: false',
    },
  },
  {
    id: 'world-6-practice-writerun-tag-merger',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Compare two tag lists with sets: merge them, find the shared tags, and count what is exclusive to each.',
    conceptTags: ['lesson:sets', 'mutable-set', 'membership', 'sorted', 'for-loop'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Tag Merger',
    goal:
      'Two tag lists for one project contain duplicates. Turn each list into a set. Then find all tags together, the tags in both sets and how many tags are in only one set. Print all three results.',
    description:
      '1. **Remove the duplicates.** Create mutable sets `firstSet` and `secondSet` from the two lists.\n\n' +
              '2. **Merge the tags.** Create a mutable set `merged` holding every tag from both sets.\n\n' +
              '3. **Collect the shared tags.** Build `var common` as text: each tag of `firstSet` that is also in `secondSet`, in the order of `firstSet`, followed by a space. Trim it before printing.\n\n' +
              '4. **Count the exclusive tags.** Count `var onlyFirst` (tags of `firstSet` not in `secondSet`) and `var onlySecond` (the reverse).\n\n' +
              '5. **Print three lines.** Use string templates. Show `merged` as a sorted list:\n"Merged: [android, java, kotlin, swift]"\n"Common: kotlin java"\n"Only in first: 1 | Only in second: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Remove the duplicates.** Convert each list to a set.',
          '2. **Merge the tags.**',
          '3. **Collect the shared tags.** Build text from `firstSet`.',
          '4. **Count the exclusive tags.**',
          '5. **Print three lines.** Sort the merged tags.',
        ],
        comments: [
          '// 1. Remove the duplicates. Convert each list to a set.',
          '// 2. Merge the tags.',
          '// 3. Collect the shared tags. Build text from firstSet.',
          '// 4. Count the exclusive tags.',
          '// 5. Print three lines. Sort the merged tags.',
        ],
      },
      experienced: {
        steps: [
          '1. **Remove the duplicates.**',
          '2. **Merge the tags.**',
          '3. **Collect the shared tags.**',
          '4. **Count the exclusive tags.**',
          '5. **Print three lines.**',
        ],
        comments: [
          '// 1. Remove the duplicates.',
          '// 2. Merge the tags.',
          '// 3. Collect the shared tags.',
          '// 4. Count the exclusive tags.',
          '// 5. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TagMerger.kt',
    initialCode: `fun main() {
  val first = listOf("kotlin", "android", "java", "kotlin")
  val second = listOf("java", "swift", "kotlin", "swift")

  // 1. Remove the duplicates. Create mutable sets firstSet and secondSet from the two lists.

  // 2. Merge the tags. Create a mutable set merged holding every tag from both sets.

  // 3. Collect the shared tags. Build var common as text: each tag of firstSet that is also in secondSet, in the order of firstSet, followed by a space. Trim it before printing.

  // 4. Count the exclusive tags. Count var onlyFirst (tags of firstSet not in secondSet) and var onlySecond (the reverse).

  // 5. Print three lines. Use string templates. Show merged as a sorted list: "Merged: [android, java, kotlin, swift]" "Common: kotlin java" "Only in first: 1 | Only in second: 1"
}`,
    solutionCode: `fun main() {
  val first = listOf("kotlin", "android", "java", "kotlin")
  val second = listOf("java", "swift", "kotlin", "swift")
  val firstSet = mutableSetOf<String>()
  for (tag in first) {
    firstSet.add(tag)
  }
  val secondSet = mutableSetOf<String>()
  for (tag in second) {
    secondSet.add(tag)
  }
  val merged = mutableSetOf<String>()
  var common = ""
  var onlyFirst = 0
  var onlySecond = 0
  for (tag in firstSet) {
    merged.add(tag)
    if (tag in secondSet) {
      common += tag + " "
    } else {
      onlyFirst++
    }
  }
  for (tag in secondSet) {
    merged.add(tag)
    if (tag !in firstSet) {
      onlySecond++
    }
  }
  println("Merged: \${merged.sorted()}")
  println("Common: \${common.trim()}")
  println("Only in first: $onlyFirst | Only in second: $onlySecond")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Merged: [android, java, kotlin, swift]\nCommon: kotlin java\nOnly in first: 1 | Only in second: 1',
    testCase: { call: '', expected: 'Merged: [android, java, kotlin, swift]\nCommon: kotlin java\nOnly in first: 1 | Only in second: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'second', originalLiteral: 'listOf("java", "swift", "kotlin", "swift")', alternateLiteral: 'listOf("go", "java", "go")' }],
      alternateExpectedOutput: 'Merged: [android, go, java, kotlin]\nCommon: java\nOnly in first: 2 | Only in second: 1',
    },
  },

  // -------------------------------------------------------------------- maps
  {
    id: 'world-6-practice-writerun-stock-lookup',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Update and add map entries by key, look one up, test a key, and total the values.',
    conceptTags: ['lesson:maps', 'mutable-map', 'map-update', 'containsKey', 'destructuring'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Stock Lookup',
    goal:
      'A shop stores item stock in a map from item to units. Update an item after restocking, add a new item, look up some items and add all the units. Print the results.',
    description:
      '1. **Update the pear.** Set the pear entry to `9` with `stock["pear"] = 9`.\n\n' +
              '2. **Add the fig.** Add a `"fig"` entry with `6` in the same way.\n\n' +
              '3. **Add up the units.** Loop with `for ((item, units) in stock)` and add each `units` value to `var total`.\n\n' +
              '4. **Print two lines.** Use string templates. The first shows `stock["apple"]`, whether the map `containsKey("kiwi")`, and the number of entries:\n"apple: 12 | kiwi listed: false | items: 4"\n"Total units: 27"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Update the pear.** Assign by key.',
          '2. **Add the fig.** Assign by key.',
          '3. **Add up the units.** Loop over the entries.',
          '4. **Print two lines.** Use `containsKey` and `size`.',
        ],
        comments: [
          '// 1. Update the pear. Assign by key.',
          '// 2. Add the fig. Assign by key.',
          '// 3. Add up the units. Loop over the entries.',
          '// 4. Print two lines. Use containsKey and size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Update the pear.**',
          '2. **Add the fig.**',
          '3. **Add up the units.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Update the pear.',
          '// 2. Add the fig.',
          '// 3. Add up the units.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StockLookup.kt',
    initialCode: `fun main() {
  val stock = mutableMapOf("apple" to 12, "pear" to 4, "plum" to 0)

  // 1. Update the pear. Set the pear entry to 9 with stock["pear"] = 9.

  // 2. Add the fig. Add a "fig" entry with 6 in the same way.

  // 3. Add up the units. Loop with for ((item, units) in stock) and add each units value to var total.

  // 4. Print two lines. Use string templates. The first shows stock["apple"], whether the map containsKey("kiwi"), and the number of entries: "apple: 12 | kiwi listed: false | items: 4" "Total units: 27"
}`,
    solutionCode: `fun main() {
  val stock = mutableMapOf("apple" to 12, "pear" to 4, "plum" to 0)
  stock["pear"] = 9
  stock["fig"] = 6
  var total = 0
  for ((item, units) in stock) {
    total += units
  }
  println("apple: \${stock["apple"]} | kiwi listed: \${stock.containsKey("kiwi")} | items: \${stock.size}")
  println("Total units: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'apple: 12 | kiwi listed: false | items: 4\nTotal units: 27',
    testCase: { call: '', expected: 'apple: 12 | kiwi listed: false | items: 4\nTotal units: 27' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'stock', originalLiteral: 'mutableMapOf("apple" to 12, "pear" to 4, "plum" to 0)', alternateLiteral: 'mutableMapOf("apple" to 20, "pear" to 1, "plum" to 5)' }],
      alternateExpectedOutput: 'apple: 20 | kiwi listed: false | items: 4\nTotal units: 40',
    },
  },
  {
    id: 'world-6-practice-writerun-word-counter',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Count how often each word appears in a map, then find the most frequent word while iterating.',
    conceptTags: ['lesson:maps', 'mutable-map', 'getOrDefault', 'destructuring', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Word Counter',
    goal:
      'Count how many times each word appears in a list using a map from word to count. Print each word and its count. Then print the most common word.',
    description:
      '1. **Create the map.** Create `counts` with `mutableMapOf<String, Int>()`.\n\n' +
              '2. **Count the words.** Loop over `words`. For each word, set its count to `counts.getOrDefault(word, 0) + 1`. `getOrDefault` returns the current count, or `0` for a new word.\n\n' +
              '3. **Print the counts and track the winner.** Loop with `for ((word, count) in counts)`. Print each entry, such as "red: 3". Keep `var best` (the word) and `var bestCount` (starting at `0`), and update them when `count` is larger than `bestCount`.\n\n' +
              '4. **Print the winner.** After the loop:\n"Most common: red (3)"\nThe full output is:\n"red: 3"\n"blue: 2"\n"green: 1"\n"Most common: red (3)"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Create the map.**',
          '2. **Count the words.** Use `getOrDefault`.',
          '3. **Print the counts and track the winner.** Loop over the entries.',
          '4. **Print the winner.**',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Count the words. Use getOrDefault.',
          '// 3. Print the counts and track the winner. Loop over the entries.',
          '// 4. Print the winner.',
        ],
      },
      experienced: {
        steps: [
          '1. **Create the map.**',
          '2. **Count the words.**',
          '3. **Print the counts and track the winner.**',
          '4. **Print the winner.**',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Count the words.',
          '// 3. Print the counts and track the winner.',
          '// 4. Print the winner.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WordCounter.kt',
    initialCode: `fun main() {
  val words = listOf("red", "blue", "red", "green", "blue", "red")

  // 1. Create the map. Create counts with mutableMapOf<String, Int>().

  // 2. Count the words. Loop over words. For each word, set its count to counts.getOrDefault(word, 0) + 1. getOrDefault returns the current count, or 0 for a new word.

  // 3. Print the counts and track the winner. Loop with for ((word, count) in counts). Print each entry, such as "red: 3". Keep var best (the word) and var bestCount (starting at 0), and update them when count is larger than bestCount.

  // 4. Print the winner. After the loop: "Most common: red (3)" The full output is: "red: 3" "blue: 2" "green: 1" "Most common: red (3)"
}`,
    solutionCode: `fun main() {
  val words = listOf("red", "blue", "red", "green", "blue", "red")
  val counts = mutableMapOf<String, Int>()
  for (word in words) {
    counts[word] = counts.getOrDefault(word, 0) + 1
  }
  var best = ""
  var bestCount = 0
  for ((word, count) in counts) {
    println("$word: $count")
    if (count > bestCount) {
      best = word
      bestCount = count
    }
  }
  println("Most common: $best ($bestCount)")
}`,
    sampleInput: 'main()',
    expectedOutput: 'red: 3\nblue: 2\ngreen: 1\nMost common: red (3)',
    testCase: { call: '', expected: 'red: 3\nblue: 2\ngreen: 1\nMost common: red (3)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'words', originalLiteral: 'listOf("red", "blue", "red", "green", "blue", "red")', alternateLiteral: 'listOf("b", "a", "b", "c", "c", "c", "a", "a", "a")' }],
      alternateExpectedOutput: 'b: 2\na: 4\nc: 3\nMost common: a (4)',
    },
  },

  // ------------------------------------------------- mutable vs read-only
  {
    id: 'world-6-practice-writerun-read-only-copy',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Make an editable copy of a read-only list, change the copy, and show the original is untouched.',
    conceptTags: ['lesson:mutable-vs-read-only', 'toMutableList', 'list-add', 'list-remove', 'sort'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Read-Only Copy',
    goal:
      'A list of numbers must not change, so work on an editable copy. Add a value to the copy, remove one and sort it. Print both lists to show that the original did not change.',
    description:
      '1. **Make an editable copy.** Create `val working` with `original.toMutableList()`.\n\n' +
              '2. **Add a value.** Add `1` to `working`.\n\n' +
              '3. **Remove a value.** Remove the VALUE `3` from `working`. `remove` takes a value, not a position.\n\n' +
              '4. **Sort the copy.** Sort `working` in place with `sort()`.\n\n' +
              '5. **Print both lists.** Use string templates:\n"Original: [5, 3, 8]"\n"Working: [1, 5, 8]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make an editable copy.** Use `toMutableList()`.',
          '2. **Add a value.**',
          '3. **Remove a value.** Remove by value.',
          '4. **Sort the copy.** Use `sort()`.',
          '5. **Print both lists.** Use string templates.',
        ],
        comments: [
          '// 1. Make an editable copy. Use toMutableList().',
          '// 2. Add a value.',
          '// 3. Remove a value. Remove by value.',
          '// 4. Sort the copy. Use sort().',
          '// 5. Print both lists. Use string templates.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make an editable copy.**',
          '2. **Add a value.**',
          '3. **Remove a value.**',
          '4. **Sort the copy.**',
          '5. **Print both lists.**',
        ],
        comments: [
          '// 1. Make an editable copy.',
          '// 2. Add a value.',
          '// 3. Remove a value.',
          '// 4. Sort the copy.',
          '// 5. Print both lists.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReadOnlyCopy.kt',
    initialCode: `fun main() {
  val original = listOf(5, 3, 8)

  // 1. Make an editable copy. Create val working with original.toMutableList().

  // 2. Add a value. Add 1 to working.

  // 3. Remove a value. Remove the VALUE 3 from working. remove takes a value, not a position.

  // 4. Sort the copy. Sort working in place with sort().

  // 5. Print both lists. Use string templates: "Original: [5, 3, 8]" "Working: [1, 5, 8]"
}`,
    solutionCode: `fun main() {
  val original = listOf(5, 3, 8)
  val working = original.toMutableList()
  working.add(1)
  working.remove(3)
  working.sort()
  println("Original: $original")
  println("Working: $working")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Original: [5, 3, 8]\nWorking: [1, 5, 8]',
    testCase: { call: '', expected: 'Original: [5, 3, 8]\nWorking: [1, 5, 8]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'original', originalLiteral: 'listOf(5, 3, 8)', alternateLiteral: 'listOf(9, 4, 6)' }],
      alternateExpectedOutput: 'Original: [9, 4, 6]\nWorking: [1, 4, 6, 9]',
    },
  },
  {
    id: 'world-6-practice-writerun-snapshot-guard',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Compare a read-only view of a list (which follows changes) with a copy (which does not).',
    conceptTags: ['lesson:mutable-vs-read-only', 'read-only-view', 'toList', 'reference', 'list-add'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Snapshot Guard',
    goal:
      'A shopping list can be shared as a read-only view of the same list or as a copy made at one moment. Make both and change the original. Print what each one shows to see which one changes with the original.',
    description:
      '1. **Make a view.** Create `val view: List<String> = cart`. It is a read-only VIEW of the same list, not a copy.\n\n' +
              '2. **Make a copy.** Create `val snapshot = cart.toList()`. It is a separate COPY made right now.\n\n' +
              '3. **Add to the cart.** Add `"cap"` to `cart`.\n\n' +
              '4. **Print the sizes.** Use string templates:\n"cart=3 view=3 snapshot=2"\n\n' +
              '5. **Remove the first item.** Remove the first element of `cart` by its position.\n\n' +
              '6. **Print the contents.** Show all three lists:\n"cart=[ink, cap] view=[ink, cap] snapshot=[pen, ink]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Make a view.** Assign `cart` to a `List`.',
          '2. **Make a copy.** Use `toList()`.',
          '3. **Add to the cart.**',
          '4. **Print the sizes.**',
          '5. **Remove the first item.** Remove by position.',
          '6. **Print the contents.**',
        ],
        comments: [
          '// 1. Make a view. Assign cart to a List.',
          '// 2. Make a copy. Use toList().',
          '// 3. Add to the cart.',
          '// 4. Print the sizes.',
          '// 5. Remove the first item. Remove by position.',
          '// 6. Print the contents.',
        ],
      },
      experienced: {
        steps: [
          '1. **Make a view.**',
          '2. **Make a copy.**',
          '3. **Add to the cart.**',
          '4. **Print the sizes.**',
          '5. **Remove the first item.**',
          '6. **Print the contents.**',
        ],
        comments: [
          '// 1. Make a view.',
          '// 2. Make a copy.',
          '// 3. Add to the cart.',
          '// 4. Print the sizes.',
          '// 5. Remove the first item.',
          '// 6. Print the contents.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SnapshotGuard.kt',
    initialCode: `fun main() {
  val cart = mutableListOf("pen", "ink")

  // 1. Make a view. Create val view: List<String> = cart. It is a read-only VIEW of the same list, not a copy.

  // 2. Make a copy. Create val snapshot = cart.toList(). It is a separate COPY made right now.

  // 3. Add to the cart. Add "cap" to cart.

  // 4. Print the sizes. Use string templates: "cart=3 view=3 snapshot=2"

  // 5. Remove the first item. Remove the first element of cart by its position.

  // 6. Print the contents. Show all three lists: "cart=[ink, cap] view=[ink, cap] snapshot=[pen, ink]"
}`,
    solutionCode: `fun main() {
  val cart = mutableListOf("pen", "ink")
  val view: List<String> = cart
  val snapshot = cart.toList()
  cart.add("cap")
  println("cart=\${cart.size} view=\${view.size} snapshot=\${snapshot.size}")
  cart.removeAt(0)
  println("cart=$cart view=$view snapshot=$snapshot")
}`,
    sampleInput: 'main()',
    expectedOutput: 'cart=3 view=3 snapshot=2\ncart=[ink, cap] view=[ink, cap] snapshot=[pen, ink]',
    testCase: { call: '', expected: 'cart=3 view=3 snapshot=2\ncart=[ink, cap] view=[ink, cap] snapshot=[pen, ink]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'cart', originalLiteral: 'mutableListOf("pen", "ink")', alternateLiteral: 'mutableListOf("tea", "jam", "oat")' }],
      alternateExpectedOutput: 'cart=4 view=4 snapshot=3\ncart=[jam, oat, cap] view=[jam, oat, cap] snapshot=[tea, jam, oat]',
    },
  },

  // ------------------------------------------------- creating and accessing
  {
    id: 'world-6-practice-writerun-class-roster',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Read from a list, an array and a map, including a map key that does not exist.',
    conceptTags: ['lesson:creating-accessing', 'list-index', 'array-index', 'map-lookup', 'missing-key'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Class Roster',
    goal:
      'A class stores students in a list, seat numbers in an array and grades in a map. Read one value from each. Look up a student who is not in the map. Print the size of each collection.',
    description:
      '1. **Read a list and an array.** Use `students[1]` and `seats[0]` in string templates:\n"Second student: Ben | Seat 0: 12"\n\n' +
              '2. **Read the map.** Use `grades["Ben"]` and `grades["Zed"]`. A missing key gives `null`:\n"Ben\'s grade: 72 | Zed\'s grade: null"\n\n' +
              '3. **Print the sizes.** Use `size` of each collection:\n"Students: 3 | Seats: 3 | Graded: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Read a list and an array.** Use the indexes.',
          '2. **Read the map.** Look up one missing key.',
          '3. **Print the sizes.** Use `size`.',
        ],
        comments: [
          '// 1. Read a list and an array. Use the indexes.',
          '// 2. Read the map. Look up one missing key.',
          '// 3. Print the sizes. Use size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Read a list and an array.**',
          '2. **Read the map.**',
          '3. **Print the sizes.**',
        ],
        comments: [
          '// 1. Read a list and an array.',
          '// 2. Read the map.',
          '// 3. Print the sizes.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ClassRoster.kt',
    initialCode: `fun main() {
  val students = listOf("Ana", "Ben", "Cy")
  val seats = arrayOf(12, 7, 30)
  val grades = mapOf("Ana" to 90, "Ben" to 72, "Cy" to 85)

  // 1. Read a list and an array. Use students[1] and seats[0] in string templates: "Second student: Ben | Seat 0: 12"

  // 2. Read the map. Use grades["Ben"] and grades["Zed"]. A missing key gives null: "Ben's grade: 72 | Zed's grade: null"

  // 3. Print the sizes. Use size of each collection: "Students: 3 | Seats: 3 | Graded: 3"
}`,
    solutionCode: `fun main() {
  val students = listOf("Ana", "Ben", "Cy")
  val seats = arrayOf(12, 7, 30)
  val grades = mapOf("Ana" to 90, "Ben" to 72, "Cy" to 85)
  println("Second student: \${students[1]} | Seat 0: \${seats[0]}")
  println("Ben's grade: \${grades["Ben"]} | Zed's grade: \${grades["Zed"]}")
  println("Students: \${students.size} | Seats: \${seats.size} | Graded: \${grades.size}")
}`,
    sampleInput: 'main()',
    expectedOutput: "Second student: Ben | Seat 0: 12\nBen's grade: 72 | Zed's grade: null\nStudents: 3 | Seats: 3 | Graded: 3",
    testCase: { call: '', expected: "Second student: Ben | Seat 0: 12\nBen's grade: 72 | Zed's grade: null\nStudents: 3 | Seats: 3 | Graded: 3" },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'students', originalLiteral: 'listOf("Ana", "Ben", "Cy")', alternateLiteral: 'listOf("Ana", "Dee", "Cy")' },
        { variableName: 'seats', originalLiteral: 'arrayOf(12, 7, 30)', alternateLiteral: 'arrayOf(4, 9, 15)' },
      ],
      alternateExpectedOutput: "Second student: Dee | Seat 0: 4\nBen's grade: 72 | Zed's grade: null\nStudents: 3 | Seats: 3 | Graded: 3",
    },
  },
  {
    id: 'world-6-practice-writerun-lookup-chain',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Use values from one collection as the index into a second one and the key into a third.',
    conceptTags: ['lesson:creating-accessing', 'list-index', 'array-index', 'map-lookup', 'destructuring'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Lookup Chain',
    goal:
      'A seating order stores positions in a list of names, and each name has a score in a map. Use each position to find a name, then find its score. Print a ranked list with the scores and the average score as a decimal. The numbers in order are positions in names.',
    description:
      '1. **Find each name.** Loop over `order.indices`. For each `i`, the name is `names[order[i]]`.\n\n' +
              '2. **Print the ranked line.** Print the rank (`i + 1`), the name and its score `scores[name]`:\n"1. Cy (85)"\n\n' +
              '3. **Add up the scores.** Keep `var total`. Loop with `for ((student, score) in scores)` and add `score` when `student` equals the name.\n\n' +
              '4. **Print the average.** After the loop, divide `total` by `order.size` as a Double. Convert `total` before dividing:\n"Average: 82.0"\nThe full output is:\n"1. Cy (85)"\n"2. Ana (90)"\n"3. Dee (81)"\n"4. Ben (72)"\n"Average: 82.0"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Find each name.** Use the position from `order`.',
          '2. **Print the ranked line.** Look up the score.',
          '3. **Add up the scores.** Loop over the map entries.',
          '4. **Print the average.** Convert before dividing.',
        ],
        comments: [
          '// 1. Find each name. Use the position from order.',
          '// 2. Print the ranked line. Look up the score.',
          '// 3. Add up the scores. Loop over the map entries.',
          '// 4. Print the average. Convert before dividing.',
        ],
      },
      experienced: {
        steps: [
          '1. **Find each name.**',
          '2. **Print the ranked line.**',
          '3. **Add up the scores.**',
          '4. **Print the average.**',
        ],
        comments: [
          '// 1. Find each name.',
          '// 2. Print the ranked line.',
          '// 3. Add up the scores.',
          '// 4. Print the average.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LookupChain.kt',
    initialCode: `fun main() {
  val order = listOf(2, 0, 3, 1)
  val names = arrayOf("Ana", "Ben", "Cy", "Dee")
  val scores = mapOf("Ana" to 90, "Ben" to 72, "Cy" to 85, "Dee" to 81)
  var total = 0

  // 1. Find each name. Loop over order.indices. For each i, the name is names[order[i]].

  // 2. Print the ranked line. Print the rank (i + 1), the name and its score scores[name]: "1. Cy (85)"

  // 3. Add up the scores. Keep var total. Loop with for ((student, score) in scores) and add score when student equals the name.

  // 4. Print the average. After the loop, divide total by order.size as a Double. Convert total before dividing: "Average: 82.0" The full output is: "1. Cy (85)" "2. Ana (90)" "3. Dee (81)" "4. Ben (72)" "Average: 82.0"
}`,
    solutionCode: `fun main() {
  val order = listOf(2, 0, 3, 1)
  val names = arrayOf("Ana", "Ben", "Cy", "Dee")
  val scores = mapOf("Ana" to 90, "Ben" to 72, "Cy" to 85, "Dee" to 81)
  var total = 0
  for (i in order.indices) {
    val name = names[order[i]]
    println("\${i + 1}. $name (\${scores[name]})")
    for ((student, score) in scores) {
      if (student == name) {
        total += score
      }
    }
  }
  println("Average: \${total.toDouble() / order.size}")
}`,
    sampleInput: 'main()',
    expectedOutput: '1. Cy (85)\n2. Ana (90)\n3. Dee (81)\n4. Ben (72)\nAverage: 82.0',
    testCase: { call: '', expected: '1. Cy (85)\n2. Ana (90)\n3. Dee (81)\n4. Ben (72)\nAverage: 82.0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'order', originalLiteral: 'listOf(2, 0, 3, 1)', alternateLiteral: 'listOf(3, 2, 1, 0)' }],
      alternateExpectedOutput: '1. Dee (81)\n2. Cy (85)\n3. Ben (72)\n4. Ana (90)\nAverage: 82.0',
    },
  },

  // ------------------------------------------------ adding, removing, updating
  {
    id: 'world-6-practice-writerun-shopping-cart',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Edit a mutable list four ways: append, remove by value, replace by position, and insert at a position.',
    conceptTags: ['lesson:add-remove-update', 'list-add', 'list-remove', 'list-update', 'list-insert'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Shopping Cart',
    goal:
      'A shopping cart starts with three items. Add one item at the end, remove one by name, replace the first item and insert one at a chosen position. Print the final cart and its size.',
    description:
      '1. **Add at the end.** Add `"jam"` to the end of `cart`.\n\n' +
              '2. **Remove by value.** Remove the item `"eggs"` by its value.\n\n' +
              '3. **Replace the first item.** Set `cart[0]` to `"oat milk"`.\n\n' +
              '4. **Insert at a position.** Insert `"tea"` at position `1` with `add(1, "tea")`.\n\n' +
              '5. **Print the cart and its size.** Use string templates:\n"Cart: [oat milk, tea, bread, jam]"\n"Items: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add at the end.**',
          '2. **Remove by value.**',
          '3. **Replace the first item.** Assign by index.',
          '4. **Insert at a position.** Use `add(index, item)`.',
          '5. **Print the cart and its size.**',
        ],
        comments: [
          '// 1. Add at the end.',
          '// 2. Remove by value.',
          '// 3. Replace the first item. Assign by index.',
          '// 4. Insert at a position. Use add(index, item).',
          '// 5. Print the cart and its size.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add at the end.**',
          '2. **Remove by value.**',
          '3. **Replace the first item.**',
          '4. **Insert at a position.**',
          '5. **Print the cart and its size.**',
        ],
        comments: [
          '// 1. Add at the end.',
          '// 2. Remove by value.',
          '// 3. Replace the first item.',
          '// 4. Insert at a position.',
          '// 5. Print the cart and its size.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShoppingCart.kt',
    initialCode: `fun main() {
  val cart = mutableListOf("milk", "eggs", "bread")

  // 1. Add at the end. Add "jam" to the end of cart.

  // 2. Remove by value. Remove the item "eggs" by its value.

  // 3. Replace the first item. Set cart[0] to "oat milk".

  // 4. Insert at a position. Insert "tea" at position 1 with add(1, "tea").

  // 5. Print the cart and its size. Use string templates: "Cart: [oat milk, tea, bread, jam]" "Items: 4"
}`,
    solutionCode: `fun main() {
  val cart = mutableListOf("milk", "eggs", "bread")
  cart.add("jam")
  cart.remove("eggs")
  cart[0] = "oat milk"
  cart.add(1, "tea")
  println("Cart: $cart")
  println("Items: \${cart.size}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Cart: [oat milk, tea, bread, jam]\nItems: 4',
    testCase: { call: '', expected: 'Cart: [oat milk, tea, bread, jam]\nItems: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'cart', originalLiteral: 'mutableListOf("milk", "eggs", "bread")', alternateLiteral: 'mutableListOf("rice", "eggs", "salt")' }],
      alternateExpectedOutput: 'Cart: [oat milk, tea, salt, jam]\nItems: 4',
    },
  },
  {
    id: 'world-6-practice-writerun-ticket-numbers',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Keep remove-by-value and remove-by-position apart while a queue is edited and served.',
    conceptTags: ['lesson:add-remove-update', 'list-remove', 'list-removeAt', 'list-update', 'while-loop'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Ticket Numbers',
    goal:
      'A support ticket queue changes. One ticket is cancelled by number, one is removed from the front, a new one arrives and one is replaced. Then serve tickets from the front until only two remain. Print how many were served and the queue.',
    description:
      '1. **Cancel a ticket by value.** Remove the ticket whose VALUE is `cancelled`.\n\n' +
              '2. **Remove the front ticket.** Remove the ticket at POSITION `0`.\n\n' +
              '3. **Add a new ticket.** Add `106` at the end.\n\n' +
              '4. **Replace a ticket.** Set the element now at position `1` to `999`.\n\n' +
              '5. **Serve the queue.** Loop while more than `keep` tickets wait. Remove the front ticket and add `1` to `var served`.\n\n' +
              '6. **Print the result.** Use string templates with `served`, the waiting list and `first()`:\n"Served: 2 | Waiting: [105, 106] | Next ticket: 105"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Cancel a ticket by value.**',
          '2. **Remove the front ticket.** Remove by position.',
          '3. **Add a new ticket.**',
          '4. **Replace a ticket.** Assign by index.',
          '5. **Serve the queue.** Use a `while` loop.',
          '6. **Print the result.** Use `first()`.',
        ],
        comments: [
          '// 1. Cancel a ticket by value.',
          '// 2. Remove the front ticket. Remove by position.',
          '// 3. Add a new ticket.',
          '// 4. Replace a ticket. Assign by index.',
          '// 5. Serve the queue. Use a while loop.',
          '// 6. Print the result. Use first().',
        ],
      },
      experienced: {
        steps: [
          '1. **Cancel a ticket by value.**',
          '2. **Remove the front ticket.**',
          '3. **Add a new ticket.**',
          '4. **Replace a ticket.**',
          '5. **Serve the queue.**',
          '6. **Print the result.**',
        ],
        comments: [
          '// 1. Cancel a ticket by value.',
          '// 2. Remove the front ticket.',
          '// 3. Add a new ticket.',
          '// 4. Replace a ticket.',
          '// 5. Serve the queue.',
          '// 6. Print the result.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TicketNumbers.kt',
    initialCode: `fun main() {
  val cancelled = 103
  val keep = 2
  val tickets = mutableListOf(101, 102, 103, 104, 105)

  // 1. Cancel a ticket by value. Remove the ticket whose VALUE is cancelled.

  // 2. Remove the front ticket. Remove the ticket at POSITION 0.

  // 3. Add a new ticket. Add 106 at the end.

  // 4. Replace a ticket. Set the element now at position 1 to 999.

  // 5. Serve the queue. Loop while more than keep tickets wait. Remove the front ticket and add 1 to var served.

  // 6. Print the result. Use string templates with served, the waiting list and first(): "Served: 2 | Waiting: [105, 106] | Next ticket: 105"
}`,
    solutionCode: `fun main() {
  val cancelled = 103
  val keep = 2
  val tickets = mutableListOf(101, 102, 103, 104, 105)
  tickets.remove(cancelled)
  tickets.removeAt(0)
  tickets.add(106)
  tickets[1] = 999
  var served = 0
  while (tickets.size > keep) {
    tickets.removeAt(0)
    served++
  }
  println("Served: $served | Waiting: $tickets | Next ticket: \${tickets.first()}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Served: 2 | Waiting: [105, 106] | Next ticket: 105',
    testCase: { call: '', expected: 'Served: 2 | Waiting: [105, 106] | Next ticket: 105' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'cancelled', originalLiteral: '103', alternateLiteral: '102' },
        { variableName: 'keep', originalLiteral: '2', alternateLiteral: '3' },
      ],
      alternateExpectedOutput: 'Served: 1 | Waiting: [999, 105, 106] | Next ticket: 999',
    },
  },

  // ------------------------------------------------------------- iterating
  {
    id: 'world-6-practice-writerun-grade-totals',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Walk a list by index, numbering each line, while summing and tracking the highest score and its position.',
    conceptTags: ['lesson:iterating', 'for-indices', 'accumulator', 'string-templates'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Grade Totals',
    goal:
      'A teacher has four scores. Print each score with a rank number. Find the total and the highest score with its rank number.',
    description:
      '1. **Prepare the trackers.** Create `var total = 0`, `var highest = scores[0]` and `var highestAt = 1`. The last one is a rank number, starting at 1.\n\n' +
              '2. **Print each rank.** Loop with `for (i in scores.indices)`. Inside it, print the rank (`i + 1`) and the score:\n"#1: 80"\n\n' +
              '3. **Update the trackers.** Inside the loop, add the score to `total`. When the score is larger than `highest`, store it in `highest` and store `i + 1` in `highestAt`.\n\n' +
              '4. **Print the summary.** After the loop:\n"Total: 308 | Highest: 92 at #3"\nThe full output is:\n"#1: 80"\n"#2: 65"\n"#3: 92"\n"#4: 71"\n"Total: 308 | Highest: 92 at #3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Prepare the trackers.**',
          '2. **Print each rank.** Loop over the indices.',
          '3. **Update the trackers.** Compare with `highest`.',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Prepare the trackers.',
          '// 2. Print each rank. Loop over the indices.',
          '// 3. Update the trackers. Compare with highest.',
          '// 4. Print the summary.',
        ],
      },
      experienced: {
        steps: [
          '1. **Prepare the trackers.**',
          '2. **Print each rank.**',
          '3. **Update the trackers.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Prepare the trackers.',
          '// 2. Print each rank.',
          '// 3. Update the trackers.',
          '// 4. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'GradeTotals.kt',
    initialCode: `fun main() {
  val scores = listOf(80, 65, 92, 71)

  // 1. Prepare the trackers. Create var total = 0, var highest = scores[0] and var highestAt = 1. The last one is a rank number, starting at 1.

  // 2. Print each rank. Loop with for (i in scores.indices). Inside it, print the rank (i + 1) and the score: "#1: 80"

  // 3. Update the trackers. Inside the loop, add the score to total. When the score is larger than highest, store it in highest and store i + 1 in highestAt.

  // 4. Print the summary. After the loop: "Total: 308 | Highest: 92 at #3" The full output is: "#1: 80" "#2: 65" "#3: 92" "#4: 71" "Total: 308 | Highest: 92 at #3"
}`,
    solutionCode: `fun main() {
  val scores = listOf(80, 65, 92, 71)
  var total = 0
  var highest = scores[0]
  var highestAt = 1
  for (i in scores.indices) {
    println("#\${i + 1}: \${scores[i]}")
    total += scores[i]
    if (scores[i] > highest) {
      highest = scores[i]
      highestAt = i + 1
    }
  }
  println("Total: $total | Highest: $highest at #$highestAt")
}`,
    sampleInput: 'main()',
    expectedOutput: '#1: 80\n#2: 65\n#3: 92\n#4: 71\nTotal: 308 | Highest: 92 at #3',
    testCase: { call: '', expected: '#1: 80\n#2: 65\n#3: 92\n#4: 71\nTotal: 308 | Highest: 92 at #3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'scores', originalLiteral: 'listOf(80, 65, 92, 71)', alternateLiteral: 'listOf(50, 88, 61)' }],
      alternateExpectedOutput: '#1: 50\n#2: 88\n#3: 61\nTotal: 199 | Highest: 88 at #2',
    },
  },
  {
    id: 'world-6-practice-writerun-pair-walker',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Pair up two parallel lists into a map by index, then iterate the map to total, compare and average.',
    conceptTags: ['lesson:iterating', 'for-indices', 'mutable-map', 'destructuring', 'double-promotion'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Pair Walker',
    goal:
      'Two lists store item names and prices at matching positions. Combine them into a map from name to price. Find the total, the most expensive item and the average price. Print one summary line.',
    description:
      '1. **Create the map.** Create `menu` with `mutableMapOf<String, Int>()`.\n\n' +
              '2. **Fill the map.** Loop over `names.indices` and store each name in `menu` with the price at the same index.\n\n' +
              '3. **Scan the map.** Loop with `for ((name, price) in menu)`. Keep `var total` (the sum of the prices), `var top` (the largest price, starting at `0`) and `var priciest` (the name with that price).\n\n' +
              '4. **Print the summary.** Use string templates. The average is a Double: `total` converted before dividing by the size of `menu`:\n"Items: 4 | Total: 27 | Priciest: ink (12) | Average: 6.75"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Create the map.**',
          '2. **Fill the map.** Use the same index for both lists.',
          '3. **Scan the map.** Track the total and the largest price.',
          '4. **Print the summary.** Convert before dividing.',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Fill the map. Use the same index for both lists.',
          '// 3. Scan the map. Track the total and the largest price.',
          '// 4. Print the summary. Convert before dividing.',
        ],
      },
      experienced: {
        steps: [
          '1. **Create the map.**',
          '2. **Fill the map.**',
          '3. **Scan the map.**',
          '4. **Print the summary.**',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Fill the map.',
          '// 3. Scan the map.',
          '// 4. Print the summary.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PairWalker.kt',
    initialCode: `fun main() {
  val names = listOf("pen", "ink", "pad", "cap")
  val prices = listOf(3, 12, 7, 5)

  // 1. Create the map. Create menu with mutableMapOf<String, Int>().

  // 2. Fill the map. Loop over names.indices and store each name in menu with the price at the same index.

  // 3. Scan the map. Loop with for ((name, price) in menu). Keep var total (the sum of the prices), var top (the largest price, starting at 0) and var priciest (the name with that price).

  // 4. Print the summary. Use string templates. The average is a Double: total converted before dividing by the size of menu: "Items: 4 | Total: 27 | Priciest: ink (12) | Average: 6.75"
}`,
    solutionCode: `fun main() {
  val names = listOf("pen", "ink", "pad", "cap")
  val prices = listOf(3, 12, 7, 5)
  val menu = mutableMapOf<String, Int>()
  for (i in names.indices) {
    menu[names[i]] = prices[i]
  }
  var total = 0
  var priciest = ""
  var top = 0
  for ((name, price) in menu) {
    total += price
    if (price > top) {
      top = price
      priciest = name
    }
  }
  println("Items: \${menu.size} | Total: $total | Priciest: $priciest ($top) | Average: \${total.toDouble() / menu.size}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Items: 4 | Total: 27 | Priciest: ink (12) | Average: 6.75',
    testCase: { call: '', expected: 'Items: 4 | Total: 27 | Priciest: ink (12) | Average: 6.75' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'prices', originalLiteral: 'listOf(3, 12, 7, 5)', alternateLiteral: 'listOf(4, 4, 9, 11)' }],
      alternateExpectedOutput: 'Items: 4 | Total: 28 | Priciest: cap (11) | Average: 7.0',
    },
  },

  // ------------------------------------------------------ basic operations
  {
    id: 'world-6-practice-writerun-stats-panel',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Read basic facts from a list: count, sum, average, minimum, maximum, membership and emptiness.',
    conceptTags: ['lesson:basic-operations', 'size', 'sum', 'sorted', 'contains', 'isEmpty'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Stats Panel',
    goal:
      'Show details for five temperatures: count, sum, average as a decimal, smallest, largest, whether 30 is in the list and whether the list is empty. Use built-in collection operations instead of loops.',
    description:
      '1. **Sort the temperatures.** Create `val sorted` with `sorted()`.\n\n' +
              '2. **Find the average.** Create `val average` as a Double: `temps.sum()` converted with `toDouble()` before dividing by the number of elements.\n\n' +
              '3. **Print the first line.** Use string templates with the count, the sum and the average:\n"Count: 5 | Sum: 119 | Average: 23.8"\n\n' +
              '4. **Print the second line.** Show the smallest (`first()` of `sorted`), the largest (`last()`), whether `temps` contains `30`, and whether it `isEmpty()`:\n"Min: 19 | Max: 30 | Has 30: true | Empty: false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Sort the temperatures.** Use `sorted()`.',
          '2. **Find the average.** Convert before dividing.',
          '3. **Print the first line.** Use `size` and `sum()`.',
          '4. **Print the second line.** Use `first()`, `last()`, `contains` and `isEmpty()`.',
        ],
        comments: [
          '// 1. Sort the temperatures. Use sorted().',
          '// 2. Find the average. Convert before dividing.',
          '// 3. Print the first line. Use size and sum().',
          '// 4. Print the second line. Use first(), last(), contains and isEmpty().',
        ],
      },
      experienced: {
        steps: [
          '1. **Sort the temperatures.**',
          '2. **Find the average.**',
          '3. **Print the first line.**',
          '4. **Print the second line.**',
        ],
        comments: [
          '// 1. Sort the temperatures.',
          '// 2. Find the average.',
          '// 3. Print the first line.',
          '// 4. Print the second line.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StatsPanel.kt',
    initialCode: `fun main() {
  val temps = listOf(21, 25, 19, 30, 24)

  // 1. Sort the temperatures. Create val sorted with sorted().

  // 2. Find the average. Create val average as a Double: temps.sum() converted with toDouble() before dividing by the number of elements.

  // 3. Print the first line. Use string templates with the count, the sum and the average: "Count: 5 | Sum: 119 | Average: 23.8"

  // 4. Print the second line. Show the smallest (first() of sorted), the largest (last()), whether temps contains 30, and whether it isEmpty(): "Min: 19 | Max: 30 | Has 30: true | Empty: false"
}`,
    solutionCode: `fun main() {
  val temps = listOf(21, 25, 19, 30, 24)
  val sorted = temps.sorted()
  val average = temps.sum().toDouble() / temps.size
  println("Count: \${temps.size} | Sum: \${temps.sum()} | Average: $average")
  println("Min: \${sorted.first()} | Max: \${sorted.last()} | Has 30: \${temps.contains(30)} | Empty: \${temps.isEmpty()}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Count: 5 | Sum: 119 | Average: 23.8\nMin: 19 | Max: 30 | Has 30: true | Empty: false',
    testCase: { call: '', expected: 'Count: 5 | Sum: 119 | Average: 23.8\nMin: 19 | Max: 30 | Has 30: true | Empty: false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'temps', originalLiteral: 'listOf(21, 25, 19, 30, 24)', alternateLiteral: 'listOf(10, 12, 14, 16)' }],
      alternateExpectedOutput: 'Count: 4 | Sum: 52 | Average: 13.0\nMin: 10 | Max: 16 | Has 30: false | Empty: false',
    },
  },
  {
    id: 'world-6-practice-writerun-top-three',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Rank scores with a descending sort, take the top three, drop duplicates, and locate one score\'s rank.',
    conceptTags: ['lesson:basic-operations', 'sortedDescending', 'take', 'distinct', 'indexOf'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Top Three',
    goal:
      'A leaderboard has six scores, including a repeated top score. Sort them from highest to lowest. Find the top three, the top three different scores, the rank of a given score and the lowest score. Print all four results.',
    description:
      '1. **Rank the scores.** Create `val ranked` with `sortedDescending()`.\n\n' +
              '2. **Take the top three.** Create `val topThree`: the first three of `ranked`. Use `take(3)`.\n\n' +
              '3. **Take the top three distinct.** Create `val distinctBest`: the first three distinct values of `ranked`. Use `distinct()`, then `take(3)`.\n\n' +
              '4. **Print four lines.** Use string templates. The rank is the `indexOf` of `query` in `ranked`, counted from 1. The last line is the last element of `ranked`:\n"Top three: [91, 91, 84] (sum 266)"\n"Distinct best: [91, 84, 78]"\n"Rank of 78: 4"\n"Lowest: 55"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Rank the scores.** Sort in descending order.',
          '2. **Take the top three.** Use `take(3)`.',
          '3. **Take the top three distinct.** Use `distinct()` first.',
          '4. **Print four lines.** Use `indexOf`.',
        ],
        comments: [
          '// 1. Rank the scores. Sort in descending order.',
          '// 2. Take the top three. Use take(3).',
          '// 3. Take the top three distinct. Use distinct() first.',
          '// 4. Print four lines. Use indexOf.',
        ],
      },
      experienced: {
        steps: [
          '1. **Rank the scores.**',
          '2. **Take the top three.**',
          '3. **Take the top three distinct.**',
          '4. **Print four lines.**',
        ],
        comments: [
          '// 1. Rank the scores.',
          '// 2. Take the top three.',
          '// 3. Take the top three distinct.',
          '// 4. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TopThree.kt',
    initialCode: `fun main() {
  val scores = listOf(55, 91, 78, 62, 91, 84)
  val query = 78

  // 1. Rank the scores. Create val ranked with sortedDescending().

  // 2. Take the top three. Create val topThree: the first three of ranked. Use take(3).

  // 3. Take the top three distinct. Create val distinctBest: the first three distinct values of ranked. Use distinct(), then take(3).

  // 4. Print four lines. Use string templates. The rank is the indexOf of query in ranked, counted from 1. The last line is the last element of ranked: "Top three: [91, 91, 84] (sum 266)" "Distinct best: [91, 84, 78]" "Rank of 78: 4" "Lowest: 55"
}`,
    solutionCode: `fun main() {
  val scores = listOf(55, 91, 78, 62, 91, 84)
  val query = 78
  val ranked = scores.sortedDescending()
  val topThree = ranked.take(3)
  val distinctBest = ranked.distinct().take(3)
  println("Top three: $topThree (sum \${topThree.sum()})")
  println("Distinct best: $distinctBest")
  println("Rank of $query: \${ranked.indexOf(query) + 1}")
  println("Lowest: \${ranked.last()}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Top three: [91, 91, 84] (sum 266)\nDistinct best: [91, 84, 78]\nRank of 78: 4\nLowest: 55',
    testCase: { call: '', expected: 'Top three: [91, 91, 84] (sum 266)\nDistinct best: [91, 84, 78]\nRank of 78: 4\nLowest: 55' },
    hardcodeCheck: {
      inputSwaps: [
        { variableName: 'scores', originalLiteral: 'listOf(55, 91, 78, 62, 91, 84)', alternateLiteral: 'listOf(40, 70, 70, 20, 90)' },
        { variableName: 'query', originalLiteral: '78', alternateLiteral: '40' },
      ],
      alternateExpectedOutput: 'Top three: [90, 70, 70] (sum 230)\nDistinct best: [90, 70, 40]\nRank of 40: 4\nLowest: 20',
    },
  },

  // ------------------------------------------------- choosing a collection type
  {
    id: 'world-6-practice-writerun-contact-book',
    worldId: 'world-6',
    difficulty: 'medium',
    summary: 'Turn two parallel lists into a map for lookup by name, then query and edit it.',
    conceptTags: ['lesson:choosing-type', 'mutable-map', 'containsKey', 'map-remove', 'for-indices'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Contact Book',
    goal:
      'Two lists store names and phone numbers at matching positions. Turn them into a map from name to phone. Look up one contact that exists and one that does not. Check a name, remove a contact and print the results after each step.',
    description:
      '1. **Create the map.** Create `contacts`, an empty mutable map from String to String.\n\n' +
              '2. **Fill the map.** Loop over `names.indices` and store `contacts[names[i]] = phones[i]`.\n\n' +
              '3. **Look up two names.** Print the phone for `"bo"` and for `"dee"`, who is not in the book (`null`):\n"bo: 555-2 | dee: null"\n\n' +
              '4. **Check a name.** Print whether the map `containsKey("cy")` and its size:\n"Has cy: true | Size: 3"\n\n' +
              '5. **Remove a contact.** Remove `"cy"`, then print the new size and whether `"cy"` is still a key:\n"After removing cy: 2 | Has cy: false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Create the map.**',
          '2. **Fill the map.** Use the same index for both lists.',
          '3. **Look up two names.** A missing key gives `null`.',
          '4. **Check a name.** Use `containsKey`.',
          '5. **Remove a contact.** Use `remove`.',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Fill the map. Use the same index for both lists.',
          '// 3. Look up two names. A missing key gives null.',
          '// 4. Check a name. Use containsKey.',
          '// 5. Remove a contact. Use remove.',
        ],
      },
      experienced: {
        steps: [
          '1. **Create the map.**',
          '2. **Fill the map.**',
          '3. **Look up two names.**',
          '4. **Check a name.**',
          '5. **Remove a contact.**',
        ],
        comments: [
          '// 1. Create the map.',
          '// 2. Fill the map.',
          '// 3. Look up two names.',
          '// 4. Check a name.',
          '// 5. Remove a contact.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ContactBook.kt',
    initialCode: `fun main() {
  val names = listOf("ana", "bo", "cy")
  val phones = listOf("555-1", "555-2", "555-3")

  // 1. Create the map. Create contacts, an empty mutable map from String to String.

  // 2. Fill the map. Loop over names.indices and store contacts[names[i]] = phones[i].

  // 3. Look up two names. Print the phone for "bo" and for "dee", who is not in the book (null): "bo: 555-2 | dee: null"

  // 4. Check a name. Print whether the map containsKey("cy") and its size: "Has cy: true | Size: 3"

  // 5. Remove a contact. Remove "cy", then print the new size and whether "cy" is still a key: "After removing cy: 2 | Has cy: false"
}`,
    solutionCode: `fun main() {
  val names = listOf("ana", "bo", "cy")
  val phones = listOf("555-1", "555-2", "555-3")
  val contacts = mutableMapOf<String, String>()
  for (i in names.indices) {
    contacts[names[i]] = phones[i]
  }
  println("bo: \${contacts["bo"]} | dee: \${contacts["dee"]}")
  println("Has cy: \${contacts.containsKey("cy")} | Size: \${contacts.size}")
  contacts.remove("cy")
  println("After removing cy: \${contacts.size} | Has cy: \${contacts.containsKey("cy")}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'bo: 555-2 | dee: null\nHas cy: true | Size: 3\nAfter removing cy: 2 | Has cy: false',
    testCase: { call: '', expected: 'bo: 555-2 | dee: null\nHas cy: true | Size: 3\nAfter removing cy: 2 | Has cy: false' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'phones', originalLiteral: 'listOf("555-1", "555-2", "555-3")', alternateLiteral: 'listOf("777-9", "777-8", "777-7")' }],
      alternateExpectedOutput: 'bo: 777-8 | dee: null\nHas cy: true | Size: 3\nAfter removing cy: 2 | Has cy: false',
    },
  },
  {
    id: 'world-6-practice-writerun-sensor-log',
    worldId: 'world-6',
    difficulty: 'hard',
    summary: 'Use a list for order, a set for distinct values and a map for counts, all built from one log.',
    conceptTags: ['lesson:choosing-type', 'list', 'mutable-set', 'mutable-map', 'getOrDefault'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Sensor Log',
    goal:
      'A sensor has a list of readings. The list keeps every reading in order, a set shows the different values and a map counts each value. Build the set and map. Print the log, the different values and the most common reading.',
    description:
      '1. **Create the set and the map.** Create `seen` (an empty mutable set of Int) and `counts` (an empty mutable map from Int to Int).\n\n' +
              '2. **Fill both.** Loop over `readings`. Add each value to `seen`, and raise its count in `counts` by one. `counts.getOrDefault(value, 0)` returns the current count, or `0` for a new value.\n\n' +
              '3. **Find the most frequent value.** Loop with `for ((value, count) in counts)`. Keep `var mostSeen` and `var mostCount` (starting at `0`), and update them when `count` is larger than `mostCount`.\n\n' +
              '4. **Print three lines.** Use string templates. Show the distinct values as a sorted list:\n"Log: [3, 5, 3, 8, 5, 3]"\n"Distinct: [3, 5, 8] (3 of 6)"\n"Most frequent: 3 x3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Create the set and the map.**',
          '2. **Fill both.** Use `getOrDefault` for the count.',
          '3. **Find the most frequent value.** Loop over the entries.',
          '4. **Print three lines.** Sort the distinct values.',
        ],
        comments: [
          '// 1. Create the set and the map.',
          '// 2. Fill both. Use getOrDefault for the count.',
          '// 3. Find the most frequent value. Loop over the entries.',
          '// 4. Print three lines. Sort the distinct values.',
        ],
      },
      experienced: {
        steps: [
          '1. **Create the set and the map.**',
          '2. **Fill both.**',
          '3. **Find the most frequent value.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Create the set and the map.',
          '// 2. Fill both.',
          '// 3. Find the most frequent value.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SensorLog.kt',
    initialCode: `fun main() {
  val readings = listOf(3, 5, 3, 8, 5, 3)

  // 1. Create the set and the map. Create seen (an empty mutable set of Int) and counts (an empty mutable map from Int to Int).

  // 2. Fill both. Loop over readings. Add each value to seen, and raise its count in counts by one. counts.getOrDefault(value, 0) returns the current count, or 0 for a new value.

  // 3. Find the most frequent value. Loop with for ((value, count) in counts). Keep var mostSeen and var mostCount (starting at 0), and update them when count is larger than mostCount.

  // 4. Print three lines. Use string templates. Show the distinct values as a sorted list: "Log: [3, 5, 3, 8, 5, 3]" "Distinct: [3, 5, 8] (3 of 6)" "Most frequent: 3 x3"
}`,
    solutionCode: `fun main() {
  val readings = listOf(3, 5, 3, 8, 5, 3)
  val seen = mutableSetOf<Int>()
  val counts = mutableMapOf<Int, Int>()
  for (value in readings) {
    seen.add(value)
    counts[value] = counts.getOrDefault(value, 0) + 1
  }
  var mostSeen = 0
  var mostCount = 0
  for ((value, count) in counts) {
    if (count > mostCount) {
      mostSeen = value
      mostCount = count
    }
  }
  println("Log: $readings")
  println("Distinct: \${seen.sorted()} (\${seen.size} of \${readings.size})")
  println("Most frequent: $mostSeen x$mostCount")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Log: [3, 5, 3, 8, 5, 3]\nDistinct: [3, 5, 8] (3 of 6)\nMost frequent: 3 x3',
    testCase: { call: '', expected: 'Log: [3, 5, 3, 8, 5, 3]\nDistinct: [3, 5, 8] (3 of 6)\nMost frequent: 3 x3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'readings', originalLiteral: 'listOf(3, 5, 3, 8, 5, 3)', alternateLiteral: 'listOf(7, 7, 2, 9, 2)' }],
      alternateExpectedOutput: 'Log: [7, 7, 2, 9, 2]\nDistinct: [2, 7, 9] (3 of 5)\nMost frequent: 7 x2',
    },
  },
];

export const WORLD_6_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // arrays / creating and accessing
  {
    id: 'world-6-practice-debug-last-index',
    worldId: 'world-6',
    conceptTags: ['lesson:arrays', 'lesson:creating-accessing', 'array-index', 'runtime-error'],
    summary: 'Reading an array at index size crashes, because the last element is at size minus one.',
    title: 'Fix the Last Index',
    subtitle: 'The program should print "Last lap: 60", but it crashes with an index error.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: index equals the array size',
    brokenCode: `fun main() {
  val laps = arrayOf(62, 58, 61, 55, 60)

  println("Last lap: \${laps[laps.size]}")
}`,
    fixedCode: `fun main() {
  val laps = arrayOf(62, 58, 61, 55, 60)

  println("Last lap: \${laps[laps.size - 1]}")
}`,
    expectedOutput: 'Last lap: 60',
    hints: [
              'The error names an index and a length. Compare the two numbers.',
              'Indexes start at 0, so an array of 5 elements has indexes 0 to 4. Is there an element at index `laps.size`?',
              'The last element sits one position before the size.',
            ],
    explanation:
      'Array positions are counted from 0, so a 5-element array ends at index 4. `laps.size` is 5, and there is no element at index 5, so the program stops with an index-out-of-bounds error. `laps[laps.size - 1]` reaches the final element.',
  },

  // lists
  {
    id: 'world-6-practice-debug-sorted-copy',
    worldId: 'world-6',
    conceptTags: ['lesson:lists', 'lesson:basic-operations', 'sorted', 'return-value'],
    summary: 'sorted() returns a new list; ignoring its result leaves the original order unchanged.',
    title: 'Fix the Sorted Copy',
    subtitle: 'The program should print "[1, 2, 3]", but it prints "[3, 1, 2]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the result of sorted() is thrown away',
    brokenCode: `fun main() {
  val nums = listOf(3, 1, 2)

  nums.sorted()

  println(nums)
}`,
    fixedCode: `fun main() {
  val nums = listOf(3, 1, 2)

  val ordered = nums.sorted()

  println(ordered)
}`,
    expectedOutput: '[1, 2, 3]',
    hints: [
              'The list prints exactly as it was created. What does the sorting line do with its result?',
              'A read-only list cannot be changed in place. `sorted()` builds a NEW list and returns it. Where does that new list go?',
              'Keep the returned list in a new variable and print that one.',
            ],
    explanation:
      '`sorted()` never changes the list it is called on, it returns a new sorted list. The line `nums.sorted()` created that list and discarded it, so `nums` was printed unchanged. Keeping the returned list in `ordered` and printing it shows [1, 2, 3].',
  },

  // sets / choosing a type
  {
    id: 'world-6-practice-debug-duplicate-count',
    worldId: 'world-6',
    conceptTags: ['lesson:sets', 'lesson:choosing-type', 'mutable-set', 'mutable-list'],
    summary: 'A list keeps every duplicate, so the count of unique ids is too high.',
    title: 'Fix the Duplicate Count',
    subtitle: 'The five ids hold only three different values, so the program should print "Unique ids: 3", but it prints "Unique ids: 5".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a list where a set is needed',
    brokenCode: `fun main() {
  val ids = listOf(3, 5, 3, 7, 5)
  val seen = mutableListOf<Int>()

  for (id in ids) {
    seen.add(id)
  }

  println("Unique ids: \${seen.size}")
}`,
    fixedCode: `fun main() {
  val ids = listOf(3, 5, 3, 7, 5)
  val seen = mutableSetOf<Int>()

  for (id in ids) {
    seen.add(id)
  }

  println("Unique ids: \${seen.size}")
}`,
    expectedOutput: 'Unique ids: 3',
    hints: [
              'The count equals the number of ids you started with. Does the collection ever refuse a value it already has?',
              'A list stores every element, duplicates included. Which collection type stores each value only once?',
              'Switch to the collection type that ignores a value it already holds.',
            ],
    explanation:
      'A List keeps every element in order, so adding 3, 5, 3, 7, 5 left five entries. A Set holds each value at most once, so adding the same id again changes nothing and the size is 3. `mutableSetOf<Int>()` is the fix.',
  },

  // maps
  {
    id: 'world-6-practice-debug-missing-key',
    worldId: 'world-6',
    conceptTags: ['lesson:maps', 'lesson:creating-accessing', 'map-lookup', 'missing-key', 'string-case'],
    summary: 'A map lookup returns null because the key differs in letter case.',
    title: 'Fix the Missing Key',
    subtitle: 'The program should print "Apple costs 3", but it prints "Apple costs null".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the lookup key does not match the stored key',
    brokenCode: `fun main() {
  val prices = mapOf("apple" to 3, "pear" to 5)

  println("Apple costs \${prices["Apple"]}")
}`,
    fixedCode: `fun main() {
  val prices = mapOf("apple" to 3, "pear" to 5)

  println("Apple costs \${prices["apple"]}")
}`,
    expectedOutput: 'Apple costs 3',
    hints: [
              'The map does contain an apple price, yet the result is `null`. What does a map return for a key it does not have?',
              'Keys are matched exactly. Compare the lookup key with the key used when the map was created, letter by letter.',
              'Look the key up exactly as it was stored.',
            ],
    explanation:
      'Map keys match exactly, including upper and lower case. "Apple" is not the same key as "apple", so the lookup found nothing and gave `null`. Using the stored key "apple" returns 3.',
  },

  // mutable vs read-only
  {
    id: 'world-6-practice-debug-read-only-list',
    worldId: 'world-6',
    conceptTags: ['lesson:mutable-vs-read-only', 'read-only-list', 'compile-error'],
    summary: 'A list created with listOf is read-only, so calling add on it does not compile.',
    title: 'Fix the Read-Only List',
    subtitle: 'The program should print "Names: 2" after adding a name to a list, but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'syntax',
    bugLabel: 'Compile Error: add on a read-only list',
    brokenCode: `fun main() {
  val names = listOf("Ana")

  names.add("Ben")

  println("Names: \${names.size}")
}`,
    fixedCode: `fun main() {
  val names = mutableListOf("Ana")

  names.add("Ben")

  println("Names: \${names.size}")
}`,
    expectedOutput: 'Names: 2',
    hints: [
              'The compiler says it cannot resolve `add`. Which function created the list?',
              '`listOf` builds a read-only `List`, and a `List` has no `add`. Which function builds a list you may change?',
              'Create the list with the function that builds an editable list.',
            ],
    explanation:
      '`listOf` returns a read-only `List`, which simply has no `add` function, so the call is an unresolved reference. `mutableListOf` returns a `MutableList`, which can grow. After the add, the list has 2 names.',
  },
  {
    id: 'world-6-practice-debug-shared-list',
    worldId: 'world-6',
    conceptTags: ['lesson:mutable-vs-read-only', 'reference', 'toList', 'list-add'],
    summary: 'A "backup" that is just another name for the same list changes when the original does.',
    title: 'Fix the Shared List',
    subtitle: 'The backup of the cart should still show "Backup: [pen, ink]" after a third item is added, but it shows "Backup: [pen, ink, cap]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: two names for one list instead of a copy',
    brokenCode: `fun main() {
  val cart = mutableListOf("pen", "ink")
  val backup = cart

  cart.add("cap")

  println("Backup: $backup")
}`,
    fixedCode: `fun main() {
  val cart = mutableListOf("pen", "ink")
  val backup = cart.toList()

  cart.add("cap")

  println("Backup: $backup")
}`,
    expectedOutput: 'Backup: [pen, ink]',
    hints: [
              'The backup changed even though only `cart` was modified. How many lists exist in this program?',
              '`val backup = cart` makes `backup` another name for the SAME list, so a change through either name shows through both.',
              'Make a real copy of the list instead of a second name.',
            ],
    explanation:
      'Assigning one list variable to another copies the reference, not the elements, so `backup` and `cart` pointed at a single list. Adding "cap" showed through both. `cart.toList()` builds a separate list at that moment, so later changes to `cart` do not affect it.',
  },

  // add / remove / update
  {
    id: 'world-6-practice-debug-removal-index',
    worldId: 'world-6',
    conceptTags: ['lesson:add-remove-update', 'list-remove', 'list-removeAt'],
    summary: 'remove(1) looks for the value 1 instead of removing the element at position 1.',
    title: 'Fix the Removal',
    subtitle: 'The middle score should be removed, so the program should print "[10, 30]", but it prints "[10, 20, 30]".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: remove by value used where remove by position is meant',
    brokenCode: `fun main() {
  val scores = mutableListOf(10, 20, 30)

  scores.remove(1)

  println(scores)
}`,
    fixedCode: `fun main() {
  val scores = mutableListOf(10, 20, 30)

  scores.removeAt(1)

  println(scores)
}`,
    expectedOutput: '[10, 30]',
    hints: [
              'Nothing was removed, and there was no error. What is `remove(1)` actually looking for?',
              'For a list of Ints, `remove` takes a VALUE. Is the number 1 in the list? Which function takes a position instead?',
              'Use the function that removes by position.',
            ],
    explanation:
      '`MutableList.remove(element)` deletes the first element EQUAL to its argument. The list holds 10, 20 and 30, so there was no 1 to delete and nothing changed. `removeAt(1)` deletes the element at position 1, the value 20, leaving [10, 30].',
  },

  // iterating
  {
    id: 'world-6-practice-debug-loop-range',
    worldId: 'world-6',
    conceptTags: ['lesson:iterating', 'for-indices', 'until', 'runtime-error'],
    summary: 'A loop over 0..size runs one pass too many and reads past the end of the list.',
    title: 'Fix the Loop Range',
    subtitle: 'The program should print "Total: 18", but it crashes with an index error on the last pass.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: the range includes index size',
    brokenCode: `fun main() {
  val scores = listOf(4, 6, 8)
  var total = 0

  for (i in 0..scores.size) {
    total += scores[i]
  }

  println("Total: $total")
}`,
    fixedCode: `fun main() {
  val scores = listOf(4, 6, 8)
  var total = 0

  for (i in 0 until scores.size) {
    total += scores[i]
  }

  println("Total: $total")
}`,
    expectedOutput: 'Total: 18',
    hints: [
              'The error appears at the very end of the loop. Which index does the last pass use?',
              'The indexes of 3 scores are 0, 1 and 2. Does `0..scores.size` stop at 2?',
              'Change the range so the index stops before the size.',
            ],
    explanation:
      'The range `0..scores.size` includes the value 3, but a 3-element list has indexes 0 to 2, so the last pass reads past the end and fails. `until` stops just before the upper bound, so the indexes are 0, 1, 2 and the total is 18. `scores.indices` works too.',
  },

  // basic operations
  {
    id: 'world-6-practice-debug-empty-guard',
    worldId: 'world-6',
    conceptTags: ['lesson:basic-operations', 'isNotEmpty', 'first', 'runtime-error'],
    summary: 'first() on an empty list crashes, so the program must check for emptiness first.',
    title: 'Fix the Empty Guard',
    subtitle: 'With no readings, the program should print "No readings", but it crashes instead.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: first() on an empty list',
    brokenCode: `fun main() {
  val readings = emptyList<Int>()

  println("First: \${readings.first()}")
}`,
    fixedCode: `fun main() {
  val readings = emptyList<Int>()

  if (readings.isNotEmpty()) {
    println("First: \${readings.first()}")
  } else {
    println("No readings")
  }
}`,
    expectedOutput: 'No readings',
    hints: [
              'The message says the list is empty. What does `first()` have to return when there is no first element?',
              '`first()` cannot answer for an empty list. Which check can you run before calling it?',
              'Check that the list has an element before reading it, and report the empty case in an `else` branch.',
            ],
    explanation:
      'There is no first element in an empty list, so `first()` throws an error. Checking `readings.isNotEmpty()` before calling `first()` lets the program take the `else` branch and report "No readings" instead of crashing.',
  },
];
