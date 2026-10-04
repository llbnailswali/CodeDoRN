/**
 * World 6 (Collection Valley) practice-bank wording pass. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'lap-times': {
    summary: 'Correct one element of an array by index, then scan it for the total and the fastest lap.',
    goal: 'A runner recorded five lap times, and the first was timed 3 seconds too slow. Fix that lap, then find the fastest lap and the total, and print a summary with the lap count and the last lap.',
    steps: [
      '**Fix the first lap.** Set `laps[0]` to its current value minus `3`.',
      '**Scan all laps.** Loop over `laps` with `for`. Keep `var total` (the sum of all times) and `var fastest` (the smallest time, starting at `laps[0]`).',
      '**Print the summary.** Use string templates. The count is `laps.size` and the last lap is the element at the last index:\n"Laps: 5 | Fastest: 55 | Total: 293 | Last: 60"',
    ],
    i: ['**Fix the first lap.** Reassign `laps[0]`.', '**Scan all laps.** Use a `for` loop with `total` and `fastest`.', '**Print the summary.** Use `laps.size` and the last index.'],
    e: ['**Fix the first lap.**', '**Scan all laps.**', '**Print the summary.**'],
  },
  'array-reversal': {
    summary: 'Reverse an array in place by swapping elements from both ends with index arithmetic.',
    goal: 'Reverse an array of six numbers in place, with no second array. Print the reversed array and its middle element.',
    steps: [
      '**Loop to the halfway point.** Loop `i` from `0` until `data.size / 2`.',
      '**Swap the mirror elements.** Swap `data[i]` with `data[data.size - 1 - i]`. Use a temporary variable so no value is lost.',
      '**Print the array.** Use a string template with `data.joinToString(", ")`:\n"Reversed: 7, 4, 9, 1, 8, 3"',
      '**Print the middle element.** Use the element at `data.size / 2`. Int division drops the fraction:\n"Middle: 1"',
    ],
    i: ['**Loop to the halfway point.** Use `until`.', '**Swap the mirror elements.** Use a temporary variable.', '**Print the array.** Use `joinToString(", ")`.', '**Print the middle element.**'],
    e: ['**Loop to the halfway point.**', '**Swap the mirror elements.**', '**Print the array.**', '**Print the middle element.**'],
  },
  'playlist-desk': {
    summary: 'Read a read-only list by position and by value: first, last, an index, a search, and a sorted copy.',
    goal: 'A playlist has five songs. Print how many songs there are, the first and last, the third, where Moon sits, and whether it contains Rain. Finish with an alphabetical copy that leaves the original order alone.',
    steps: [
      '**Print the size, first and last.** Use `size`, `first()` and `last()` in string templates:\n"Songs: 5 | First: Sky | Last: Star"',
      '**Print the third song, a position and a check.** Use `songs[2]`, `indexOf("Moon")` and `contains("Rain")`:\n"Third: Sun | Moon is at 3 | Has Rain: false"',
      '**Print a sorted copy.** Use `sorted()`, which leaves the original list unchanged:\n"Alphabetical: [Moon, River, Sky, Star, Sun]"',
    ],
    i: ['**Print the size, first and last.** Use `first()` and `last()`.', '**Print the third song, a position and a check.** Use `indexOf` and `contains`.', '**Print a sorted copy.** Use `sorted()`.'],
    e: ['**Print the size, first and last.**', '**Print the third song, a position and a check.**', '**Print a sorted copy.**'],
  },
  'median-board': {
    summary: 'Find the median of a list, whether it has an odd or an even number of items, plus the range and runner-up.',
    goal: 'Find the median of six sensor readings. It must work for an odd or an even count. Also find the range and the second-highest reading, and print four lines.',
    steps: [
      '**Sort the readings.** Create `val sorted` (ascending) and `val n` (the count).',
      '**Find the median.** Create `val median` as a Double. For an odd count it is the middle element. For an even count it is the average of the two middle elements. The code must work for both.',
      '**Find the range.** Create `val range`: the largest reading minus the smallest.',
      '**Print four lines.** Use string templates. The last shows the second element from the end of `sorted`:\n"Sorted: [58, 65, 72, 77, 81, 90]"\n"Median: 74.5"\n"Range: 32"\n"Second highest: 81"',
    ],
    i: ['**Sort the readings.** Also keep the count.', '**Find the median.** Handle odd and even counts.', '**Find the range.** Largest minus smallest.', '**Print four lines.** Use string templates.'],
    e: ['**Sort the readings.**', '**Find the median.**', '**Find the range.**', '**Print four lines.**'],
  },
  'unique-visitors': {
    summary: 'Collect visitors into a mutable set and use add\'s true/false result to count the repeat visits.',
    goal: 'A website log lists visitors, and repeat visitors appear several times. Collect them in a set to count the distinct visitors, and count the repeat visits. Print a summary line.',
    steps: [
      '**Prepare the set and the counter.** Create `unique` with `mutableSetOf<String>()` and `var repeats = 0`.',
      '**Count the repeats.** Loop over `visits` and call `unique.add(visitor)`. It returns `true` for a new visitor and `false` for one already in the set. When it returns `false`, add `1` to `repeats`.',
      '**Print the summary.** Use string templates with the number of visits, the set size, `repeats`, and whether the set contains "cy":\n"Visits: 6 | Unique: 3 | Repeat visits: 3 | Has cy: true"',
    ],
    i: ['**Prepare the set and the counter.**', '**Count the repeats.** Check what `add` returns.', '**Print the summary.** Use `size` and `contains`.'],
    e: ['**Prepare the set and the counter.**', '**Count the repeats.**', '**Print the summary.**'],
  },
  'tag-merger': {
    summary: 'Compare two tag lists with sets: merge them, find the shared tags, and count what is exclusive to each.',
    goal: 'Two tag lists for one project both contain duplicates. Clean each into a set, then find the merged tags, the shared tags, and how many tags are in only one list. Print all three results.',
    steps: [
      '**Remove the duplicates.** Create mutable sets `firstSet` and `secondSet` from the two lists.',
      '**Merge the tags.** Create a mutable set `merged` holding every tag from both sets.',
      '**Collect the shared tags.** Build `var common` as text: each tag of `firstSet` that is also in `secondSet`, in the order of `firstSet`, followed by a space. Trim it before printing.',
      '**Count the exclusive tags.** Count `var onlyFirst` (tags of `firstSet` not in `secondSet`) and `var onlySecond` (the reverse).',
      '**Print three lines.** Use string templates. Show `merged` as a sorted list:\n"Merged: [android, java, kotlin, swift]"\n"Common: kotlin java"\n"Only in first: 1 | Only in second: 1"',
    ],
    i: ['**Remove the duplicates.** Convert each list to a set.', '**Merge the tags.**', '**Collect the shared tags.** Build text from `firstSet`.', '**Count the exclusive tags.**', '**Print three lines.** Sort the merged tags.'],
    e: ['**Remove the duplicates.**', '**Merge the tags.**', '**Collect the shared tags.**', '**Count the exclusive tags.**', '**Print three lines.**'],
  },
  'stock-lookup': {
    summary: 'Update and add map entries by key, look one up, test a key, and total the values.',
    goal: 'A shop keeps stock counts in a map from item to units. Update a restocked item, add a new item, look up some entries, and add up all the units. Print the results.',
    steps: [
      '**Update the pear.** Set the pear entry to `9` with `stock["pear"] = 9`.',
      '**Add the fig.** Add a `"fig"` entry with `6` in the same way.',
      '**Add up the units.** Loop with `for ((item, units) in stock)` and add each `units` value to `var total`.',
      '**Print two lines.** Use string templates. The first shows `stock["apple"]`, whether the map `containsKey("kiwi")`, and the number of entries:\n"apple: 12 | kiwi listed: false | items: 4"\n"Total units: 27"',
    ],
    i: ['**Update the pear.** Assign by key.', '**Add the fig.** Assign by key.', '**Add up the units.** Loop over the entries.', '**Print two lines.** Use `containsKey` and `size`.'],
    e: ['**Update the pear.**', '**Add the fig.**', '**Add up the units.**', '**Print two lines.**'],
  },
  'word-counter': {
    summary: 'Count how often each word appears in a map, then find the most frequent word while iterating.',
    goal: 'Count how often each word appears in a list, using a map from word to count. Print each word with its count, then name the most common word.',
    steps: [
      '**Create the map.** Create `counts` with `mutableMapOf<String, Int>()`.',
      '**Count the words.** Loop over `words`. For each word, set its count to `counts.getOrDefault(word, 0) + 1`. `getOrDefault` returns the current count, or `0` for a new word.',
      '**Print the counts and track the winner.** Loop with `for ((word, count) in counts)`. Print each entry, such as "red: 3". Keep `var best` (the word) and `var bestCount` (starting at `0`), and update them when `count` is larger than `bestCount`.',
      '**Print the winner.** After the loop:\n"Most common: red (3)"\nThe full output is:\n"red: 3"\n"blue: 2"\n"green: 1"\n"Most common: red (3)"',
    ],
    i: ['**Create the map.**', '**Count the words.** Use `getOrDefault`.', '**Print the counts and track the winner.** Loop over the entries.', '**Print the winner.**'],
    e: ['**Create the map.**', '**Count the words.**', '**Print the counts and track the winner.**', '**Print the winner.**'],
  },
  'read-only-copy': {
    summary: 'Make an editable copy of a read-only list, change the copy, and show the original is untouched.',
    goal: 'A list of numbers must stay untouched, so work on an editable copy. Add a value to the copy, remove one, sort it, and print both lists to show the original never changed.',
    steps: [
      '**Make an editable copy.** Create `val working` with `original.toMutableList()`.',
      '**Add a value.** Add `1` to `working`.',
      '**Remove a value.** Remove the VALUE `3` from `working`. `remove` takes a value, not a position.',
      '**Sort the copy.** Sort `working` in place with `sort()`.',
      '**Print both lists.** Use string templates:\n"Original: [5, 3, 8]"\n"Working: [1, 5, 8]"',
    ],
    i: ['**Make an editable copy.** Use `toMutableList()`.', '**Add a value.**', '**Remove a value.** Remove by value.', '**Sort the copy.** Use `sort()`.', '**Print both lists.** Use string templates.'],
    e: ['**Make an editable copy.**', '**Add a value.**', '**Remove a value.**', '**Sort the copy.**', '**Print both lists.**'],
  },
  'snapshot-guard': {
    summary: 'Compare a read-only view of a list (which follows changes) with a copy (which does not).',
    goal: 'A shopping list can be shared as a read-only view of the same list, or as a copy taken at one moment. Make both, change the original, and print what each shows, to see which one follows the original.',
    steps: [
      '**Make a view.** Create `val view: List<String> = cart`. It is a read-only VIEW of the same list, not a copy.',
      '**Make a copy.** Create `val snapshot = cart.toList()`. It is a separate COPY made right now.',
      '**Add to the cart.** Add `"cap"` to `cart`.',
      '**Print the sizes.** Use string templates:\n"cart=3 view=3 snapshot=2"',
      '**Remove the first item.** Remove the first element of `cart` by its position.',
      '**Print the contents.** Show all three lists:\n"cart=[ink, cap] view=[ink, cap] snapshot=[pen, ink]"',
    ],
    i: ['**Make a view.** Assign `cart` to a `List`.', '**Make a copy.** Use `toList()`.', '**Add to the cart.**', '**Print the sizes.**', '**Remove the first item.** Remove by position.', '**Print the contents.**'],
    e: ['**Make a view.**', '**Make a copy.**', '**Add to the cart.**', '**Print the sizes.**', '**Remove the first item.**', '**Print the contents.**'],
  },
  'class-roster': {
    summary: 'Read from a list, an array and a map, including a map key that does not exist.',
    goal: 'A class keeps students in a list, seat numbers in an array and grades in a map. Read one value from each, look up a student who is not in the map, and print the size of each collection.',
    steps: [
      '**Read a list and an array.** Use `students[1]` and `seats[0]` in string templates:\n"Second student: Ben | Seat 0: 12"',
      '**Read the map.** Use `grades["Ben"]` and `grades["Zed"]`. A missing key gives `null`:\n"Ben\'s grade: 72 | Zed\'s grade: null"',
      '**Print the sizes.** Use `size` of each collection:\n"Students: 3 | Seats: 3 | Graded: 3"',
    ],
    i: ['**Read a list and an array.** Use the indexes.', '**Read the map.** Look up one missing key.', '**Print the sizes.** Use `size`.'],
    e: ['**Read a list and an array.**', '**Read the map.**', '**Print the sizes.**'],
  },
  'lookup-chain': {
    summary: 'Use values from one collection as the index into a second one and the key into a third.',
    goal: 'A seating order stores positions into a list of names, and each name has a score in a map. Follow each position to a name and then to its score. Print a ranked list with the scores, then the average score as a decimal. The numbers in `order` are positions in `names`.',
    steps: [
      '**Find each name.** Loop over `order.indices`. For each `i`, the name is `names[order[i]]`.',
      '**Print the ranked line.** Print the rank (`i + 1`), the name and its score `scores[name]`:\n"1. Cy (85)"',
      '**Add up the scores.** Keep `var total`. Loop with `for ((student, score) in scores)` and add `score` when `student` equals the name.',
      '**Print the average.** After the loop, divide `total` by `order.size` as a Double. Convert `total` before dividing:\n"Average: 82.0"\nThe full output is:\n"1. Cy (85)"\n"2. Ana (90)"\n"3. Dee (81)"\n"4. Ben (72)"\n"Average: 82.0"',
    ],
    i: ['**Find each name.** Use the position from `order`.', '**Print the ranked line.** Look up the score.', '**Add up the scores.** Loop over the map entries.', '**Print the average.** Convert before dividing.'],
    e: ['**Find each name.**', '**Print the ranked line.**', '**Add up the scores.**', '**Print the average.**'],
  },
  'shopping-cart': {
    summary: 'Edit a mutable list four ways: append, remove by value, replace by position, and insert at a position.',
    goal: 'A shopping cart starts with three items. Add one at the end, remove one by name, replace the first item, and insert one at a chosen position. Print the final cart and its size.',
    steps: [
      '**Add at the end.** Add `"jam"` to the end of `cart`.',
      '**Remove by value.** Remove the item `"eggs"` by its value.',
      '**Replace the first item.** Set `cart[0]` to `"oat milk"`.',
      '**Insert at a position.** Insert `"tea"` at position `1` with `add(1, "tea")`.',
      '**Print the cart and its size.** Use string templates:\n"Cart: [oat milk, tea, bread, jam]"\n"Items: 4"',
    ],
    i: ['**Add at the end.**', '**Remove by value.**', '**Replace the first item.** Assign by index.', '**Insert at a position.** Use `add(index, item)`.', '**Print the cart and its size.**'],
    e: ['**Add at the end.**', '**Remove by value.**', '**Replace the first item.**', '**Insert at a position.**', '**Print the cart and its size.**'],
  },
  'ticket-numbers': {
    summary: 'Keep remove-by-value and remove-by-position apart while a queue is edited and served.',
    goal: 'A queue of support tickets changes: one is cancelled by its number, one is removed from the front, a new one arrives, and one is replaced. Then serve tickets from the front until only two wait. Print the number served and the queue.',
    steps: [
      '**Cancel a ticket by value.** Remove the ticket whose VALUE is `cancelled`.',
      '**Remove the front ticket.** Remove the ticket at POSITION `0`.',
      '**Add a new ticket.** Add `106` at the end.',
      '**Replace a ticket.** Set the element now at position `1` to `999`.',
      '**Serve the queue.** Loop while more than `keep` tickets wait. Remove the front ticket and add `1` to `var served`.',
      '**Print the result.** Use string templates with `served`, the waiting list and `first()`:\n"Served: 2 | Waiting: [105, 106] | Next ticket: 105"',
    ],
    i: ['**Cancel a ticket by value.**', '**Remove the front ticket.** Remove by position.', '**Add a new ticket.**', '**Replace a ticket.** Assign by index.', '**Serve the queue.** Use a `while` loop.', '**Print the result.** Use `first()`.'],
    e: ['**Cancel a ticket by value.**', '**Remove the front ticket.**', '**Add a new ticket.**', '**Replace a ticket.**', '**Serve the queue.**', '**Print the result.**'],
  },
  'grade-totals': {
    summary: 'Walk a list by index, numbering each line, while summing and tracking the highest score and its position.',
    goal: 'A teacher has four scores. Print each one as a numbered rank, and work out the total and the highest score with its rank number.',
    steps: [
      '**Prepare the trackers.** Create `var total = 0`, `var highest = scores[0]` and `var highestAt = 1`. The last one is a rank number, starting at 1.',
      '**Print each rank.** Loop with `for (i in scores.indices)`. Inside it, print the rank (`i + 1`) and the score:\n"#1: 80"',
      '**Update the trackers.** Inside the loop, add the score to `total`. When the score is larger than `highest`, store it in `highest` and store `i + 1` in `highestAt`.',
      '**Print the summary.** After the loop:\n"Total: 308 | Highest: 92 at #3"\nThe full output is:\n"#1: 80"\n"#2: 65"\n"#3: 92"\n"#4: 71"\n"Total: 308 | Highest: 92 at #3"',
    ],
    i: ['**Prepare the trackers.**', '**Print each rank.** Loop over the indices.', '**Update the trackers.** Compare with `highest`.', '**Print the summary.**'],
    e: ['**Prepare the trackers.**', '**Print each rank.**', '**Update the trackers.**', '**Print the summary.**'],
  },
  'pair-walker': {
    summary: 'Pair up two parallel lists into a map by index, then iterate the map to total, compare and average.',
    goal: 'Two lists hold item names and prices at matching positions. Combine them into a map from name to price, then find the total, the priciest item and the average price. Print one summary line.',
    steps: [
      '**Create the map.** Create `menu` with `mutableMapOf<String, Int>()`.',
      '**Fill the map.** Loop over `names.indices` and store each name in `menu` with the price at the same index.',
      '**Scan the map.** Loop with `for ((name, price) in menu)`. Keep `var total` (the sum of the prices), `var top` (the largest price, starting at `0`) and `var priciest` (the name with that price).',
      '**Print the summary.** Use string templates. The average is a Double: `total` converted before dividing by the size of `menu`:\n"Items: 4 | Total: 27 | Priciest: ink (12) | Average: 6.75"',
    ],
    i: ['**Create the map.**', '**Fill the map.** Use the same index for both lists.', '**Scan the map.** Track the total and the largest price.', '**Print the summary.** Convert before dividing.'],
    e: ['**Create the map.**', '**Fill the map.**', '**Scan the map.**', '**Print the summary.**'],
  },
  'stats-panel': {
    summary: 'Read basic facts from a list: count, sum, average, minimum, maximum, membership and emptiness.',
    goal: 'Summarize five temperatures: the count, sum and average (as a decimal), the smallest and largest, whether 30 is in the list, and whether the list is empty. Use built-in collection operations instead of loops.',
    steps: [
      '**Sort the temperatures.** Create `val sorted` with `sorted()`.',
      '**Find the average.** Create `val average` as a Double: `temps.sum()` converted with `toDouble()` before dividing by the number of elements.',
      '**Print the first line.** Use string templates with the count, the sum and the average:\n"Count: 5 | Sum: 119 | Average: 23.8"',
      '**Print the second line.** Show the smallest (`first()` of `sorted`), the largest (`last()`), whether `temps` contains `30`, and whether it `isEmpty()`:\n"Min: 19 | Max: 30 | Has 30: true | Empty: false"',
    ],
    i: ['**Sort the temperatures.** Use `sorted()`.', '**Find the average.** Convert before dividing.', '**Print the first line.** Use `size` and `sum()`.', '**Print the second line.** Use `first()`, `last()`, `contains` and `isEmpty()`.'],
    e: ['**Sort the temperatures.**', '**Find the average.**', '**Print the first line.**', '**Print the second line.**'],
  },
  'top-three': {
    summary: 'Rank scores with a descending sort, take the top three, drop duplicates, and locate one score\'s rank.',
    goal: 'A leaderboard has six scores with a repeated top score. Rank them from highest to lowest, then find the top three, the top three distinct scores, the rank of a given score, and the lowest score. Print all four results.',
    steps: [
      '**Rank the scores.** Create `val ranked` with `sortedDescending()`.',
      '**Take the top three.** Create `val topThree`: the first three of `ranked`. Use `take(3)`.',
      '**Take the top three distinct.** Create `val distinctBest`: the first three distinct values of `ranked`. Use `distinct()`, then `take(3)`.',
      '**Print four lines.** Use string templates. The rank is the `indexOf` of `query` in `ranked`, counted from 1. The last line is the last element of `ranked`:\n"Top three: [91, 91, 84] (sum 266)"\n"Distinct best: [91, 84, 78]"\n"Rank of 78: 4"\n"Lowest: 55"',
    ],
    i: ['**Rank the scores.** Sort in descending order.', '**Take the top three.** Use `take(3)`.', '**Take the top three distinct.** Use `distinct()` first.', '**Print four lines.** Use `indexOf`.'],
    e: ['**Rank the scores.**', '**Take the top three.**', '**Take the top three distinct.**', '**Print four lines.**'],
  },
  'contact-book': {
    summary: 'Turn two parallel lists into a map for lookup by name, then query and edit it.',
    goal: 'Finding a phone number by name in two parallel lists means searching, so turn them into a map from name to phone. Look up one contact who exists and one who does not, check a name, remove a contact, and print the results at each step.',
    steps: [
      '**Create the map.** Create `contacts`, an empty mutable map from String to String.',
      '**Fill the map.** Loop over `names.indices` and store `contacts[names[i]] = phones[i]`.',
      '**Look up two names.** Print the phone for `"bo"` and for `"dee"`, who is not in the book (`null`):\n"bo: 555-2 | dee: null"',
      '**Check a name.** Print whether the map `containsKey("cy")` and its size:\n"Has cy: true | Size: 3"',
      '**Remove a contact.** Remove `"cy"`, then print the new size and whether `"cy"` is still a key:\n"After removing cy: 2 | Has cy: false"',
    ],
    i: ['**Create the map.**', '**Fill the map.** Use the same index for both lists.', '**Look up two names.** A missing key gives `null`.', '**Check a name.** Use `containsKey`.', '**Remove a contact.** Use `remove`.'],
    e: ['**Create the map.**', '**Fill the map.**', '**Look up two names.**', '**Check a name.**', '**Remove a contact.**'],
  },
  'sensor-log': {
    summary: 'Use a list for order, a set for distinct values and a map for counts, all built from one log.',
    goal: 'A sensor produced a list of readings. The list keeps every reading in order, a set shows the distinct values, and a map counts each value. Build the set and the map, and report the log, the distinct values and the most frequent reading.',
    steps: [
      '**Create the set and the map.** Create `seen` (an empty mutable set of Int) and `counts` (an empty mutable map from Int to Int).',
      '**Fill both.** Loop over `readings`. Add each value to `seen`, and raise its count in `counts` by one. `counts.getOrDefault(value, 0)` returns the current count, or `0` for a new value.',
      '**Find the most frequent value.** Loop with `for ((value, count) in counts)`. Keep `var mostSeen` and `var mostCount` (starting at `0`), and update them when `count` is larger than `mostCount`.',
      '**Print three lines.** Use string templates. Show the distinct values as a sorted list:\n"Log: [3, 5, 3, 8, 5, 3]"\n"Distinct: [3, 5, 8] (3 of 6)"\n"Most frequent: 3 x3"',
    ],
    i: ['**Create the set and the map.**', '**Fill both.** Use `getOrDefault` for the count.', '**Find the most frequent value.** Loop over the entries.', '**Print three lines.** Sort the distinct values.'],
    e: ['**Create the set and the map.**', '**Fill both.**', '**Find the most frequent value.**', '**Print three lines.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'last-index': {
    subtitle: 'The program should print "Last lap: 60", but it crashes with an index error.',
    hints: ['The error names an index and a length. Compare the two numbers.', 'Indexes start at 0, so an array of 5 elements has indexes 0 to 4. Is there an element at index `laps.size`?', 'The last element sits one position before the size.'],
    explanation: 'Array positions are counted from 0, so a 5-element array ends at index 4. `laps.size` is 5, and there is no element at index 5, so the program stops with an index-out-of-bounds error. `laps[laps.size - 1]` reaches the final element.',
  },
  'sorted-copy': {
    subtitle: 'The program should print "[1, 2, 3]", but it prints "[3, 1, 2]".',
    hints: ['The list prints exactly as it was created. What does the sorting line do with its result?', 'A read-only list cannot be changed in place. `sorted()` builds a NEW list and returns it. Where does that new list go?', 'Keep the returned list in a new variable and print that one.'],
    explanation: '`sorted()` never changes the list it is called on, it returns a new sorted list. The line `nums.sorted()` created that list and discarded it, so `nums` was printed unchanged. Keeping the returned list in `ordered` and printing it shows [1, 2, 3].',
  },
  'duplicate-count': {
    subtitle: 'The five ids hold only three different values, so the program should print "Unique ids: 3", but it prints "Unique ids: 5".',
    hints: ['The count equals the number of ids you started with. Does the collection ever refuse a value it already has?', 'A list stores every element, duplicates included. Which collection type stores each value only once?', 'Switch to the collection type that ignores a value it already holds.'],
    explanation: 'A List keeps every element in order, so adding 3, 5, 3, 7, 5 left five entries. A Set holds each value at most once, so adding the same id again changes nothing and the size is 3. `mutableSetOf<Int>()` is the fix.',
  },
  'missing-key': {
    subtitle: 'The program should print "Apple costs 3", but it prints "Apple costs null".',
    hints: ['The map does contain an apple price, yet the result is `null`. What does a map return for a key it does not have?', 'Keys are matched exactly. Compare the lookup key with the key used when the map was created, letter by letter.', 'Look the key up exactly as it was stored.'],
    explanation: 'Map keys match exactly, including upper and lower case. "Apple" is not the same key as "apple", so the lookup found nothing and gave `null`. Using the stored key "apple" returns 3.',
  },
  'read-only-list': {
    subtitle: 'The program should print "Names: 2" after adding a name to a list, but it does not compile.',
    hints: ['The compiler says it cannot resolve `add`. Which function created the list?', '`listOf` builds a read-only `List`, and a `List` has no `add`. Which function builds a list you may change?', 'Create the list with the function that builds an editable list.'],
    explanation: '`listOf` returns a read-only `List`, which simply has no `add` function, so the call is an unresolved reference. `mutableListOf` returns a `MutableList`, which can grow. After the add, the list has 2 names.',
  },
  'shared-list': {
    subtitle: 'The backup of the cart should still show "Backup: [pen, ink]" after a third item is added, but it shows "Backup: [pen, ink, cap]".',
    hints: ['The backup changed even though only `cart` was modified. How many lists exist in this program?', '`val backup = cart` makes `backup` another name for the SAME list, so a change through either name shows through both.', 'Make a real copy of the list instead of a second name.'],
    explanation: 'Assigning one list variable to another copies the reference, not the elements, so `backup` and `cart` pointed at a single list. Adding "cap" showed through both. `cart.toList()` builds a separate list at that moment, so later changes to `cart` do not affect it.',
  },
  'removal-index': {
    subtitle: 'The middle score should be removed, so the program should print "[10, 30]", but it prints "[10, 20, 30]".',
    hints: ['Nothing was removed, and there was no error. What is `remove(1)` actually looking for?', 'For a list of Ints, `remove` takes a VALUE. Is the number 1 in the list? Which function takes a position instead?', 'Use the function that removes by position.'],
    explanation: '`MutableList.remove(element)` deletes the first element EQUAL to its argument. The list holds 10, 20 and 30, so there was no 1 to delete and nothing changed. `removeAt(1)` deletes the element at position 1, the value 20, leaving [10, 30].',
  },
  'loop-range': {
    subtitle: 'The program should print "Total: 18", but it crashes with an index error on the last pass.',
    hints: ['The error appears at the very end of the loop. Which index does the last pass use?', 'The indexes of 3 scores are 0, 1 and 2. Does `0..scores.size` stop at 2?', 'Change the range so the index stops before the size.'],
    explanation: 'The range `0..scores.size` includes the value 3, but a 3-element list has indexes 0 to 2, so the last pass reads past the end and fails. `until` stops just before the upper bound, so the indexes are 0, 1, 2 and the total is 18. `scores.indices` works too.',
  },
  'empty-guard': {
    subtitle: 'With no readings, the program should print "No readings", but it crashes instead.',
    hints: ['The message says the list is empty. What does `first()` have to return when there is no first element?', '`first()` cannot answer for an empty list. Which check can you run before calling it?', 'Check that the list has an element before reading it, and report the empty case in an `else` branch.'],
    explanation: 'There is no first element in an empty list, so `first()` throws an error. Checking `readings.isNotEmpty()` before calling `first()` lets the program take the `else` branch and report "No readings" instead of crashing.',
  },
};
