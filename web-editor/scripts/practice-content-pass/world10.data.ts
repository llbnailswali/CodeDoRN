/**
 * World 10 (Collection Wizardry) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world10.spec.ts.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'cart-totals': {
    summary: 'Use map to change every price, then filter to keep the big ones.',
    goal: 'A shop adds tax to four prices. Print the new prices, then print only the prices above a limit.',
    steps: [
      '**Add tax to every price.** Call `prices.map { ... }`. Use `it` and add one tenth of it (`it / 10`). Keep the result in `withTax`.',
      '**Keep the big prices.** Call `withTax.filter { ... }`. Keep the prices above `limit`. Keep the result in `big`.',
      '**Print two lines.** Use string templates:\n"With tax: [13, 44, 7, 27]"\n"Big: [44, 27]"',
    ],
    i: ['**Add tax to every price.** Use `map` and `it / 10`.', '**Keep the big prices.** Use `filter` and `limit`.', '**Print two lines.** Show both lists.'],
    e: ['**Add tax to every price.**', '**Keep the big prices.**', '**Print two lines.**'],
  },
  'valid-ages': {
    summary: 'Turn text into numbers with mapNotNull, drop the bad text, then filter and count.',
    goal: 'A form gives ages as text. Some of the text is not a number. Keep the real ages, find the adults, and count the bad entries.',
    steps: [
      '**Convert the text.** Call `raw.mapNotNull { ... }`. Use `it.toIntOrNull()` so bad text is dropped. Keep the result in `ages`.',
      '**Find the adults.** Call `ages.filter { ... }` to keep the ages that are at least `minAge`. Keep the result in `adults`.',
      '**Count the bad entries.** Set `skipped` to `raw.size - ages.size`.',
      '**Print three lines.** Use a string template for each list:\n"Ages: [12, 30, 7]"\n"Adults: [30]"\n"Skipped: 2"',
    ],
    i: ['**Convert the text.** Use `mapNotNull` and `toIntOrNull()`.', '**Find the adults.** Use `filter` and `minAge`.', '**Count the bad entries.** Subtract the two sizes.', '**Print three lines.** Show both lists and the count.'],
    e: ['**Convert the text.**', '**Find the adults.**', '**Count the bad entries.**', '**Print three lines.**'],
  },
  'mixed-bag': {
    summary: 'Split a mixed list by type with filterIsInstance, then drop the long words with filterNot.',
    goal: 'A list holds words and true or false values. Split it by type, then drop the words that are too long.',
    steps: [
      '**Get the words.** Call `items.filterIsInstance<String>()` and keep the result in `texts`.',
      '**Get the true or false values.** Call `items.filterIsInstance<Boolean>()` and keep the result in `flags`.',
      '**Drop the long words.** Call `texts.filterNot { ... }` to remove the words with `it.length` above `limit`. Keep the result in `short`.',
      '**Print three lines.** Use string templates:\n"Texts: [tea, milk, cola]"\n"Flags: [true, false]"\n"Short: [tea]"',
    ],
    i: ['**Get the words.** Use `filterIsInstance<String>()`.', '**Get the true or false values.** Use `filterIsInstance<Boolean>()`.', '**Drop the long words.** Use `filterNot` and `limit`.', '**Print three lines.** Show all three lists.'],
    e: ['**Get the words.**', '**Get the true or false values.**', '**Drop the long words.**', '**Print three lines.**'],
  },
  'split-parts': {
    summary: 'Use flatMap to turn phrases into one list of words, then remove short words.',
    goal: 'Each phrase holds words split by spaces. Make one list of all the words, then remove the words that are too short.',
    steps: [
      '**Split the phrases.** Call `phrases.flatMap { ... }`. Use `it.split(" ")` to get the words of each phrase. Keep the result in `parts`.',
      '**Remove the short words.** Call `parts.filterNot { ... }`. Remove the words with `it.length` below `minLen`. Keep the result in `kept`.',
      '**Print two lines.** Use string templates:\n"Parts: [a, bb, ccc, d, ee]"\n"Kept: [bb, ccc, ee]"',
    ],
    i: ['**Split the phrases.** Use `flatMap` and `split(" ")`.', '**Remove the short words.** Use `filterNot` and `minLen`.', '**Print two lines.** Show both lists.'],
    e: ['**Split the phrases.**', '**Remove the short words.**', '**Print two lines.**'],
  },
  'batch-totals': {
    summary: 'Join batches with flatten, then add them with reduce and with fold.',
    goal: 'Orders arrive in batches. Join the batches into one list. Add up all the numbers, and add them again starting from a base number.',
    steps: [
      '**Join the batches.** Call `batches.flatten()` and keep the result in `all`.',
      '**Add them up.** Call `all.reduce { acc, n -> ... }` to add `acc` and `n`. Keep the result in `total`.',
      '**Add from the base.** Call `all.fold(base) { acc, n -> ... }`. Add `acc` and `n` again. Keep the result in `withBase`.',
      '**Print three lines.** Use a string template for the list:\n"All: [4, 6, 10, 3, 7, 5]"\n"Total: 35"\n"With base: 135"',
    ],
    i: ['**Join the batches.** Use `flatten()`.', '**Add them up.** Use `reduce`.', '**Add from the base.** Use `fold` with `base`.', '**Print three lines.** Show the list and both totals.'],
    e: ['**Join the batches.**', '**Add them up.**', '**Add from the base.**', '**Print three lines.**'],
  },
  'score-folds': {
    summary: 'Use fold to count and to build text, and reduce to find the best score.',
    goal: 'Go through a list of scores. Count the scores that pass, find the best score, and build a text of all the scores.',
    steps: [
      '**Count the passes.** Call `scores.fold(0) { count, s -> ... }`. Add `1` to `count` when `s` is at least `passMark`, otherwise keep `count`. Keep the result in `passed`.',
      '**Find the best score.** Call `scores.reduce { a, b -> ... }`. Return `b` when it is bigger than `a`, otherwise return `a`. Keep the result in `best`.',
      '**Build the text.** Call `scores.fold("") { acc, s -> ... }`. Add each score and a semicolon to `acc`. Keep the result in `text`.',
      '**Print three lines.** Join the text with `+`:\n"Passed: 3"\n"Best: 91"\n"Text: 55;80;62;91;70;"',
    ],
    i: ['**Count the passes.** Use `fold(0)` and `passMark`.', '**Find the best score.** Use `reduce` and compare two scores.', '**Build the text.** Use `fold` with an empty text.', '**Print three lines.** Show all three results.'],
    e: ['**Count the passes.**', '**Find the best score.**', '**Build the text.**', '**Print three lines.**'],
  },
  'group-lengths': {
    summary: 'Group words by length with groupBy, then look up one group.',
    goal: 'Put drink names into groups by their length. Then look up one group and print it.',
    steps: [
      '**Group the words.** Call `words.groupBy { ... }` and use `it.length` as the key. Keep the result in `groups`.',
      '**Look up one group.** Set `found` to `groups[key]`.',
      '**Print two lines.** Use string templates:\n"Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}"\n"Length 4: [milk, cola]"',
    ],
    i: ['**Group the words.** Use `groupBy` with the length.', '**Look up one group.** Use `key` as the index.', '**Print two lines.** Show the map and the found group.'],
    e: ['**Group the words.**', '**Look up one group.**', '**Print two lines.**'],
  },
  'pass-split': {
    summary: 'Split marks with partition, then build a map of gaps with associate.',
    goal: 'Split marks into passed and failed. Then, for each passed mark, find how far it is above the pass mark.',
    steps: [
      '**Split the marks.** Write `val (passed, failed) = marks.partition { ... }`. The first list holds the marks that are at least `passMark`.',
      '**Find the gaps.** Call `passed.associate { ... }`. Pair each mark (`it`) with `it - passMark`. Keep the result in `gaps`.',
      '**Print the lists.** Use string templates:\n"Passed: [72, 88, 50]"\n"Failed: [45, 31]"',
      '**Print the gaps.** Use a string template:\n"Gaps: {72=22, 88=38, 50=0}"',
    ],
    i: ['**Split the marks.** Use `partition` and `passMark`.', '**Find the gaps.** Use `associate` with `it - passMark`.', '**Print the lists.** Show passed and failed.', '**Print the gaps.** Show the map.'],
    e: ['**Split the marks.**', '**Find the gaps.**', '**Print the lists.**', '**Print the gaps.**'],
  },
  'name-scores': {
    summary: 'Join two lists into pairs with zip, then filter the pairs.',
    goal: 'Join a list of names with a list of scores. Keep only the pairs with a strong score.',
    steps: [
      '**Join the lists.** Call `names.zip(scores)` and keep the result in `pairs`.',
      '**Keep the strong pairs.** Call `pairs.filter { ... }`. Keep the pairs where `it.second` is above `cutoff`. Keep the result in `strong`.',
      '**Print two lines.** Use string templates:\n"Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]"\n"Strong: [(Ana, 70), (Bo, 85)]"',
    ],
    i: ['**Join the lists.** Use `zip`.', '**Keep the strong pairs.** Use `filter` and `it.second`.', '**Print two lines.** Show both lists.'],
    e: ['**Join the lists.**', '**Keep the strong pairs.**', '**Print two lines.**'],
  },
  'chunk-window': {
    summary: 'Cut a list with chunked and windowed, then add up each window.',
    goal: 'Cut a list of readings into separate groups, and into overlapping groups. Add up each overlapping group.',
    steps: [
      '**Cut into chunks.** Call `readings.chunked(size)` and keep the result in `chunks`.',
      '**Make sliding windows.** Call `readings.windowed(size)` and keep the result in `windows`. Each window overlaps the one before it.',
      '**Add up each window.** Call `windows.map { ... }` and use `it.sum()`. Keep the result in `sums`.',
      '**Print three lines.** The window count is `windows.size`:\n"Chunks: [[2, 4, 6], [8, 10, 12], [14]]"\n"Windows: 5"\n"Sums: [12, 18, 24, 30, 36]"',
    ],
    i: ['**Cut into chunks.** Use `chunked(size)`.', '**Make sliding windows.** Use `windowed(size)`.', '**Add up each window.** Use `map` and `sum()`.', '**Print three lines.** Show the chunks, the window count and the sums.'],
    e: ['**Cut into chunks.**', '**Make sliding windows.**', '**Add up each window.**', '**Print three lines.**'],
  },
  'unique-tags': {
    summary: 'Remove repeats with distinct, then sort in both directions and keep the top few.',
    goal: 'A list of tags has repeats. Remove the repeats, sort what is left in both directions, and keep the biggest few.',
    steps: [
      '**Remove repeats.** Call `tags.distinct()` and keep the result in `unique`.',
      '**Sort upwards.** Call `unique.sorted()` and keep the result in `ascending`.',
      '**Keep the top tags.** Call `unique.sortedDescending()`, then `take(limit)`. Keep the result in `top`.',
      '**Print three lines.** Use string templates:\n"Unique: [5, 3, 9, 1]"\n"Ascending: [1, 3, 5, 9]"\n"Top: [9, 5]"',
    ],
    i: ['**Remove repeats.** Use `distinct()`.', '**Sort upwards.** Use `sorted()`.', '**Keep the top tags.** Sort down, then use `take`.', '**Print three lines.** Show all three lists.'],
    e: ['**Remove repeats.**', '**Sort upwards.**', '**Keep the top tags.**', '**Print three lines.**'],
  },
  'sort-words': {
    summary: 'Remove repeated words, sort them, and keep one word for each length.',
    goal: 'A list of words has repeats. Remove them, sort the words, keep the first few, and find the first word of each length.',
    steps: [
      '**Remove repeats.** Call `words.distinct()` and keep the result in `unique`.',
      '**Sort and cut.** Call `unique.sorted()` and keep it in `sortedWords`. Then call `sortedWords.take(top)` and keep it in `firstWords`.',
      '**Keep one word per length.** Call `words.distinctBy { ... }` and use `it.length`. Keep the result in `byLength`.',
      '**Count the repeats.** Set `repeats` to `words.size - unique.size`.',
      '**Print four lines.** Use string templates for the lists:\n"Sorted: [apple, fig, kiwi, pear]"\n"First: [apple, fig]"\n"By length: [pear, fig, apple]"\n"Repeats: 1"',
    ],
    i: ['**Remove repeats.** Use `distinct()`.', '**Sort and cut.** Use `sorted()` and `take(top)`.', '**Keep one word per length.** Use `distinctBy`.', '**Count the repeats.** Compare the two sizes.', '**Print four lines.** Show the lists and the count.'],
    e: ['**Remove repeats.**', '**Sort and cut.**', '**Keep one word per length.**', '**Count the repeats.**', '**Print four lines.**'],
  },
  'budget-shelf': {
    summary: 'Sort objects by a property, find the cheapest and dearest, and list what fits a budget.',
    goal: 'A shop has four items. Sort them by price, find the cheapest and the dearest, and list what fits in a budget.',
    setup: 'The class `Item` is in the starter code with `name` and `price`.',
    steps: [
      '**Sort by price.** Call `items.sortedBy { ... }` with `it.price`, then `map { it.name }`. Keep the result in `byPrice`.',
      '**Find the cheapest.** Call `items.minByOrNull { ... }` with `it.price`. Keep the result in `cheapest`.',
      '**Find the dearest.** Call `items.maxByOrNull { ... }` with `it.price`. Keep the result in `priciest`.',
      '**List what fits.** Call `items.filter { ... }` to keep prices up to `budget`. Then call `sortedByDescending { it.price }` and `map { it.name }`. Keep the result in `affordable`.',
      '**Print four lines.** The result can be `null`, so use `?.name ?: "none"`:\n"By price: [cap, pen, bag, book]"\n"Cheapest: cap"\n"Priciest: book"\n"Affordable: [bag, pen, cap]"',
    ],
    i: ['**Sort by price.** Use `sortedBy` and `map`.', '**Find the cheapest.** Use `minByOrNull`.', '**Find the dearest.** Use `maxByOrNull`.', '**List what fits.** Filter by `budget`, then sort down.', '**Print four lines.** Handle `null` with `?.name`.'],
    e: ['**Sort by price.**', '**Find the cheapest.**', '**Find the dearest.**', '**List what fits.**', '**Print four lines.**'],
  },
  'min-max-range': {
    summary: 'Find the lowest and highest value, the gap between them, and the values well above the lowest.',
    goal: 'Find the lowest and highest value in a list, and the gap between them. Then keep the values that are well above the lowest.',
    steps: [
      '**Find the lowest and highest.** Set `low` to `values.min()` and `high` to `values.max()`.',
      '**Find the spread.** Set `spread` to `high - low`.',
      '**Keep the high values.** Call `values.filter { ... }`. Keep the values above `low + threshold`. Keep the result in `above`.',
      '**Print four lines.** Use `+` for the numbers and a string template for the list:\n"Low: 3"\n"High: 27"\n"Spread: 24"\n"Above: [14, 27, 9]"',
    ],
    i: ['**Find the lowest and highest.** Use `min()` and `max()`.', '**Find the spread.** Subtract the two.', '**Keep the high values.** Use `filter` and `threshold`.', '**Print four lines.** Show the numbers and the list.'],
    e: ['**Find the lowest and highest.**', '**Find the spread.**', '**Keep the high values.**', '**Print four lines.**'],
  },
  'basket-stats': {
    summary: 'Find the sum and the average, then ask any, all and none questions about the prices.',
    goal: 'A basket holds four prices. Print the total and the average. Then answer three yes or no questions about the prices.',
    steps: [
      '**Add up the prices.** Set `total` to `prices.sum()`.',
      '**Find the average.** Set `average` to `prices.average()`.',
      '**Check for a big price.** Set `anyBig` to `prices.any { ... }`. It is true when some price is above `limit`.',
      '**Check every price.** Set `allPaid` to `prices.all { ... }`. It is true when every price is at least `10`.',
      '**Check for free items.** Set `noneFree` to `prices.none { ... }`. It is true when no price is `0`.',
      '**Print five lines.** Join the text with `+`:\n"Sum: 120"\n"Average: 30.0"\n"Any above 45: true"\n"All at least 10: true"\n"None free: true"',
    ],
    i: ['**Add up the prices.** Use `sum()`.', '**Find the average.** Use `average()`.', '**Check for a big price.** Use `any` and `limit`.', '**Check every price.** Use `all`.', '**Check for free items.** Use `none`.', '**Print five lines.** Show all five results.'],
    e: ['**Add up the prices.**', '**Find the average.**', '**Check for a big price.**', '**Check every price.**', '**Check for free items.**', '**Print five lines.**'],
  },
  'class-checks': {
    summary: 'Use all, any and none on a list of lists, and add up each inner list.',
    goal: 'Three classes have lists of marks. Add up each class, then check the marks of all classes together.',
    steps: [
      '**Add up each class.** Call `classes.map { ... }` and use `it.sum()`. Keep the result in `totals`.',
      '**Check that all pass.** Set `allPass` to `classes.all { c -> ... }`. Inside, check that `c.all { ... }` marks are at least `passMark`.',
      '**Look for a top mark.** Set `anyTop` to `classes.any { c -> ... }`. Inside, check that `c.any { ... }` mark is above `90`.',
      '**Check for empty classes.** Set `noneEmpty` to `classes.none { ... }`. Use `it.isEmpty()`.',
      '**Print four lines.** Use a string template for the list:\n"Totals: [240, 155, 88]"\n"All pass: true"\n"Any top: true"\n"None empty: true"',
    ],
    i: ['**Add up each class.** Use `map` and `sum()`.', '**Check that all pass.** Use `all` inside `all`.', '**Look for a top mark.** Use `any` inside `any`.', '**Check for empty classes.** Use `none`.', '**Print four lines.** Show the totals and the checks.'],
    e: ['**Add up each class.**', '**Check that all pass.**', '**Look for a top mark.**', '**Check for empty classes.**', '**Print four lines.**'],
  },
  'first-hit': {
    summary: 'Use first, find and last, and handle the null that find can return.',
    goal: 'A list holds temperatures. Find the first one, the first one above a limit, one far above the limit, and the last one.',
    steps: [
      '**Get the first.** Set `first` to `temps.first()`.',
      '**Get the first above the limit.** Set `firstAbove` to `temps.first { ... }` with `it > limit`.',
      '**Look for a far value.** Set `far` to `temps.find { ... }` with `it > limit + 10`. It is `null` when nothing matches.',
      '**Get the last.** Set `last` to `temps.last()`.',
      '**Print four lines.** Use `far ?: -1` so a `null` shows as `-1`:\n"First: 18"\n"First above: 31"\n"Far above: -1"\n"Last: 35"',
    ],
    i: ['**Get the first.** Use `first()`.', '**Get the first above the limit.** Use `first` with a test.', '**Look for a far value.** Use `find`. It can be `null`.', '**Get the last.** Use `last()`.', '**Print four lines.** Use `?:` for the `null`.'],
    e: ['**Get the first.**', '**Get the first above the limit.**', '**Look for a far value.**', '**Get the last.**', '**Print four lines.**'],
  },
  'top-orders': {
    summary: 'Chain filter, map, sortedDescending, take and sum into one pipeline.',
    goal: 'A shop has a list of orders. Ignore small orders, take ten percent off the rest, and add up the three biggest.',
    steps: [
      '**Keep and discount.** Call `orders.filter { ... }` to keep orders of at least `minOrder`. Then call `map { ... }` and subtract `it / 10`. Keep the result in `discounted`.',
      '**Take the top three.** Call `discounted.sortedDescending()`, then `take(3)`. Keep the result in `top`.',
      '**Add them up.** Set `total` to `top.sum()`.',
      '**Print three lines.** Use string templates for the lists:\n"Discounted: [108, 270, 72, 189]"\n"Top: [270, 189, 108]"\n"Total: 567"',
    ],
    i: ['**Keep and discount.** Chain `filter` and `map`.', '**Take the top three.** Sort down, then `take(3)`.', '**Add them up.** Use `sum()`.', '**Print three lines.** Show both lists and the total.'],
    e: ['**Keep and discount.**', '**Take the top three.**', '**Add them up.**', '**Print three lines.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'wrong-tool': {
    subtitle: 'The program should print "Big: [40, 25]", but it prints "Big: [false, true, false, true]".',
    hints: [
      'Look at the values inside the printed list. Are they prices?',
      '`map` changes every item into the result of the lambda. Here the result is true or false, so the prices are lost.',
      'Use the function that keeps only the items that pass the test.',
    ],
    explanation: '`map` replaces each price with the lambda result, so `prices.map { it > 20 }` gives true and false values. `filter` keeps the prices that pass the test, so `prices.filter { it > 20 }` gives `[40, 25]`.',
  },
  'null-survivors': {
    subtitle: 'The program should print "Ages: [12, 30]", but it prints "Ages: [12, null, 30]".',
    hints: [
      'Find the item in the output that is not a number.',
      '`toIntOrNull()` gives `null` for bad text, and `map` keeps every result, even `null`.',
      'Use the version of `map` that drops the `null` results.',
    ],
    explanation: '`map` keeps every result, so the bad text `"x"` becomes `null` in the list. `mapNotNull` drops the `null` results, so the list is `[12, 30]`.',
  },
  'negatives-kept': {
    subtitle: 'The program should print "Valid: [4, 0, 9]", but it prints "Valid: [-3, -8]".',
    hints: [
      'Compare the printed values with the list. Which values did the program keep?',
      '`filterNot` removes the items that pass the test. The test `it >= 0` is true for the good readings, so they are removed.',
      'Write the test for the values you want to remove, not the ones you want to keep.',
    ],
    explanation: '`filterNot { it >= 0 }` removes every reading that is zero or more, so only the negative readings stay. To remove the negatives, the test must describe them: `it < 0`. Then `[4, 0, 9]` stays.',
  },
  'nested-parts': {
    subtitle: 'The program should print "Words: [a, b, c]" and "Count: 3", but it prints a list of lists and "Count: 2".',
    hints: [
      'Look at the brackets in the printed list. How many levels are there?',
      '`map` puts one list for each phrase into the result, so the lists stay inside a list.',
      'Use the function that joins all the lists into one list while it maps.',
    ],
    explanation: '`map` turns each phrase into a list of words, so the result is a list of lists with two items. `flatMap` joins those lists into one, so the result is `[a, b, c]` with three items.',
  },
  'empty-reduce': {
    subtitle: 'The program should print "Total: 0" for an empty list, but it stops with an error.',
    hints: [
      'Look at the list. How many items does it have?',
      '`reduce` starts with the first item, so an empty list has nothing to start with and throws an error.',
      'Use the version that takes a starting value, so an empty list gives that value.',
    ],
    explanation: '`reduce` uses the first item as the start. An empty list has no first item, so it throws an exception. `fold(0)` starts with `0`, so an empty list gives `0`.',
  },
  'lost-words': {
    subtitle: 'The program should print "Groups: {3=[fig, tea], 4=[kiwi, plum, pear]}", but it prints "Groups: {3=tea, 4=pear}".',
    hints: [
      'Count the words in the output. Are they all there?',
      '`associate` makes one entry for each key. When two words have the same key, the later word replaces the earlier one.',
      'Use the function that collects all the items with the same key into a list.',
    ],
    explanation: '`associate` builds a map with one value per key, so a repeated length overwrites the earlier word. `groupBy` keeps every word with the same length in a list, so nothing is lost.',
  },
  'window-vs-chunk': {
    subtitle: 'The program should print "Changes: [4, -2, 8]", but it prints "Changes: [4, 8]".',
    hints: [
      'Count the changes. The list has four temperatures, so how many neighbour pairs are there?',
      '`chunked(2)` cuts the list into separate pairs. The pair `14, 12` is never made.',
      'Use the function that makes overlapping groups, so every neighbour pair appears.',
    ],
    explanation: '`chunked(2)` gives `[10, 14]` and `[12, 20]`, so the change from `14` to `12` is missed. `windowed(2)` slides by one item, so it also gives `[14, 12]`, and the changes are `4`, `-2` and `8`.',
  },
  'sorted-ignored': {
    subtitle: 'The program should print "Scores: [10, 20, 30]", but it prints "Scores: [30, 10, 20]".',
    hints: [
      'Look at the order in the output. Did the sort change `scores`?',
      '`sorted()` does not change the list. It returns a new sorted list, and here the result is thrown away.',
      'Use the function that sorts the same list in place.',
    ],
    explanation: '`sorted()` returns a new list and leaves `scores` as it was. The result is not used, so nothing changes. `sort()` sorts the mutable list itself, so printing `scores` shows `[10, 20, 30]`.',
  },
  'name-not-price': {
    subtitle: 'The program should print "Priciest: book", but it prints "Priciest: pen".',
    hints: [
      'Look at which item the program chose. Is it the most expensive?',
      '`maxByOrNull` compares the values the lambda returns. Here the lambda returns the name.',
      'Change the lambda so it returns the property you want to compare.',
    ],
    explanation: 'The lambda `{ it.name }` makes `maxByOrNull` compare names, and "pen" comes last in alphabetical order. Comparing `it.price` picks the item with the biggest price, which is "book".',
  },
  'empty-all': {
    subtitle: 'The program should print "Everyone passed: false" for an empty class, but it prints "Everyone passed: true".',
    hints: [
      'Look at the list. How many marks does it have?',
      '`all` is true when no item fails the test. An empty list has no item that can fail.',
      'Also check that the list has marks, before you trust `all`.',
    ],
    explanation: 'For an empty list, `all` is always `true`, because there is no mark that fails. An empty class should not count as passed, so the program must also check `isNotEmpty()`. Now the answer is `false`.',
  },
  'find-null': {
    subtitle: 'The program should print "Hot: none" when no temperature is above 99, but it prints "Hot: null".',
    hints: [
      'Look at the word `null` in the output. Where does it come from?',
      '`find` returns `null` when no item matches, and printing `null` shows the word null.',
      'Give the `null` case a friendly default value before you print.',
    ],
    explanation: '`find` returns `null` when no item matches, so `"Hot: " + hot` prints `Hot: null`. With `hot ?: "none"`, the `null` case becomes the text `none`, so the program prints `Hot: none`.',
  },
  'take-first': {
    subtitle: 'The program should print "Top: [100, 90]", but it prints "Top: [90, 40]".',
    hints: [
      'Trace the steps by hand. Which scores are left after the first step?',
      '`take(2)` runs first, so only `40` and `90` are left. The biggest scores are cut away before the sort.',
      'Change the order of the two steps: sort first, then cut.',
    ],
    explanation: '`scores.take(2)` keeps the first two scores, `40` and `90`, and then the sort only orders those two. Sorting first with `sortedDescending()` and then taking two gives `[100, 90]`.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'wrong-tool': 'map gives true and false values instead of keeping the prices.',
  'null-survivors': 'map keeps the null results from bad text.',
  'negatives-kept': 'The filterNot test is the wrong way round.',
  'nested-parts': 'map leaves lists inside a list, so the words are not joined.',
  'empty-reduce': 'reduce fails on an empty list.',
  'lost-words': 'associate overwrites words that share a length.',
  'window-vs-chunk': 'chunked misses the overlapping neighbour pairs.',
  'sorted-ignored': 'sorted returns a new list, and the result is not used.',
  'name-not-price': 'maxByOrNull compares names instead of prices.',
  'empty-all': 'all is true for an empty list, so an empty class passes.',
  'find-null': 'find returns null when nothing matches, and the output shows null.',
  'take-first': 'take runs before the sort, so the top scores are lost.',
};
