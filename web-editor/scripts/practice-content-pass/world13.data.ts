/**
 * World 13 (Scope Masters) practice-bank wording. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Simple English: short everyday words, one idea per sentence. The code lives in world13.spec.ts.
 */
import type { WR, DBG } from './world2.data';

const PROFILE = 'The class `Profile` is in the starter code. It has `name`, `age`, `tags` and a `label()` function.';

export const WR_DATA: Record<string, WR> = {
  'name-lengths': {
    summary: 'Use let on a value that may be null, and give a default when it is null.',
    goal: 'A title may be missing. When it exists, print it, find its length and shout it. When it is missing, use default values.',
    steps: [
      '**Find the length.** Create `val length` with `title?.let { ... }`. Inside, return `it.length`. Add `?: -1` for a missing title.',
      '**Shout the title.** Create `val shout` with `title?.let { ... }`. Inside, return `it.uppercase()`. Add `?: "none"` for a missing title.',
      '**Print the title.** Use `title?.let { ... }` and print "Title: " plus `it` inside. Nothing prints when the title is `null`.',
      '**Print two lines.** Join the text with `+`:\n"Title: kotlin"\n"Length: 6"\n"Shout: KOTLIN"',
    ],
    i: ['**Find the length.** Use `?.let` and `?: -1`.', '**Shout the title.** Use `?.let` and `?: "none"`.', '**Print the title.** Use `?.let` to print it.', '**Print two lines.** Show the length and the shout.'],
    e: ['**Find the length.**', '**Shout the title.**', '**Print the title.**', '**Print two lines.**'],
  },
  'area-run': {
    summary: 'Use run for a block that works out a value, and run on a String.',
    goal: 'Work out an area in a block with its own helper values. Then build a text from a word. Print both.',
    steps: [
      '**Work out the area.** Create `val area` with `run { ... }`. Inside, create `val w` as `a + 2` and `val h` as `b`. The last line is `w * h`.',
      '**Build the text.** Create `val text` with `"report".run { ... }`. Inside, return `uppercase()` plus `length`.',
      '**Print two lines.** Join the text with `+`:\n"Area: 32"\n"Text: REPORT6"',
    ],
    i: ['**Work out the area.** Use `run` and end with `w * h`.', '**Build the text.** Use `"report".run`.', '**Print two lines.** Show both values.'],
    e: ['**Work out the area.**', '**Build the text.**', '**Print two lines.**'],
  },
  'build-profile': {
    summary: 'Use apply to set up an object and get the same object back.',
    goal: 'Make a profile and set its name, its age and two tags in one block. Print its label and the number of tags.',
    setup: PROFILE,
    steps: [
      '**Create the profile.** Create `val p` with `Profile().apply { ... }`. Inside, set `name` to "Ada" and `age` to `years`.',
      '**Add the tags.** In the same `apply` block, call `tags.add("math")` and `tags.add("code")`.',
      '**Print two lines.** Print `p.label()`, then "Tags: " plus `p.tags.size`:\n"Ada (36)"\n"Tags: 2"',
    ],
    i: ['**Create the profile.** Use `apply` to set `name` and `age`.', '**Add the tags.** Add two tags in the block.', '**Print two lines.** Show the label and the tag count.'],
    e: ['**Create the profile.**', '**Add the tags.**', '**Print two lines.**'],
  },
  'list-builder': {
    summary: 'Use apply to fill a new list with a loop.',
    goal: 'Make a list and fill it in the same step. Add the doubles of the numbers from 1 up to a count. Print the list and its size.',
    steps: [
      '**Start the list.** Create `val list` with `mutableListOf<Int>().apply { ... }`.',
      '**Fill the list.** Inside the block, loop `i` from `1` to `count`. Each time, call `add(i * 2)`.',
      '**Print two lines.** Use a string template for the list:\n"List: [2, 4, 6]"\n"Size: 3"',
    ],
    i: ['**Start the list.** Use `mutableListOf<Int>().apply`.', '**Fill the list.** Loop and add `i * 2`.', '**Print two lines.** Show the list and its size.'],
    e: ['**Start the list.**', '**Fill the list.**', '**Print two lines.**'],
  },
  'trace-word': {
    summary: 'Use also to print a value in the middle of a chain without changing it.',
    goal: 'Follow a word through a chain. Print it before and after it is made upper case. Then print the result.',
    steps: [
      '**Print the word first.** Start with `word.also { ... }` and print "before: " plus `it` inside.',
      '**Change and print again.** Continue with `.uppercase()`. Then add `.also { ... }` and print "after: " plus `it`. Keep the whole chain in `val result`.',
      '**Print the result.** Print "Result: " plus `result`:\n"before: kotlin"\n"after: KOTLIN"\n"Result: KOTLIN"',
    ],
    i: ['**Print the word first.** Use `also` and print `it`.', '**Change and print again.** Use `uppercase()` and another `also`.', '**Print the result.** Show `result`.'],
    e: ['**Print the word first.**', '**Change and print again.**', '**Print the result.**'],
  },
  'log-and-keep': {
    summary: 'Chain several also calls to log a list before and after you change it.',
    goal: 'Make a list, add an item to it, and write a log of its size before and after. Print the log and the list.',
    steps: [
      '**Make the list and log the start.** Create `val numbers` with `mutableListOf(1, 2, 3)`. Add `.also { ... }` that adds "start:", `it.size` and ";" to `log`.',
      '**Add the extra number.** Add another `.also { ... }` that calls `it.add(extra)`.',
      '**Log the end.** Add a third `.also { ... }` that adds "end:", `it.size` and ";" to `log`.',
      '**Print two lines.** Use a string template for the list:\n"Log: start:3;end:4;"\n"Numbers: [1, 2, 3, 10]"',
    ],
    i: ['**Make the list and log the start.** Use `also` to log the size.', '**Add the extra number.** Use `also` to add `extra`.', '**Log the end.** Use `also` to log the size again.', '**Print two lines.** Show the log and the list.'],
    e: ['**Make the list and log the start.**', '**Add the extra number.**', '**Log the end.**', '**Print two lines.**'],
  },
  'report-with': {
    summary: 'Use with to work on an object and return the last line of the block.',
    goal: 'Add some years to the age of a profile, and get its label, in one block. Print the label and the new age.',
    setup: 'The class `Profile` is in the starter code. The profile `p` already has `name` "Bo" and `age` `5`.',
    steps: [
      '**Write the with block.** Create `val text` with `with(p) { ... }`. Inside, set `age` to `age + years`. The last line is `label()`.',
      '**Print the label.** Print `text`:\n"Bo (9)"',
      '**Print the age.** Print "Age now: " plus `p.age`. The profile itself was changed:\n"Age now: 9"',
    ],
    i: ['**Write the with block.** Change `age`, then return `label()`.', '**Print the label.** Print `text`.', '**Print the age.** Show `p.age`.'],
    e: ['**Write the with block.**', '**Print the label.**', '**Print the age.**'],
  },
  'list-with': {
    summary: 'Use with on a list to call its functions without a name in front.',
    goal: 'Describe a list with its size, first item and last item. Then add its first and last items. Print both.',
    steps: [
      '**Write the summary.** Create `val summary` with `with(numbers) { ... }`. Inside, join "n=", `size`, " first=", `first()`, " last=" and `last()`.',
      '**Add the ends.** Create `val ends` with `with(numbers) { ... }`. Inside, return `first() + last()`.',
      '**Print two lines.** Print `summary`, then "Ends: " plus `ends`:\n"n=4 first=3 last=9"\n"Ends: 12"',
    ],
    i: ['**Write the summary.** Use `size`, `first()` and `last()`.', '**Add the ends.** Add the first and the last item.', '**Print two lines.** Show both values.'],
    e: ['**Write the summary.**', '**Add the ends.**', '**Print two lines.**'],
  },
  'this-or-it': {
    summary: 'Use apply and run with this, and let and also with it, on the same profile.',
    goal: 'Use four scope functions on one profile. Some give the object as this and some as it. Print what each one finds.',
    setup: PROFILE,
    steps: [
      '**Set up the profile.** Create `val p` with `Profile().apply { ... }`. Inside, set `name` to "Ada" and `age` to `years`. Here the object is `this`.',
      '**Add the name length and age.** Create `val len` with `p.let { ... }`. Return `it.name.length + it.age`. Here the object is `it`.',
      '**Add a tag.** Create `val tagged` with `p.also { ... }`. Inside, call `it.tags.add("seen")`. After the block, read `.tags.size`.',
      '**Get the label.** Create `val label` with `p.run { ... }`. Inside, return `label()`.',
      '**Print three lines.** Join the text with `+`:\n"Label: Ada (36)"\n"Length+age: 39"\n"Tags: 1"',
    ],
    i: ['**Set up the profile.** `apply` gives `this`.', '**Add the name length and age.** `let` gives `it`.', '**Add a tag.** `also` gives `it`.', '**Get the label.** `run` gives `this`.', '**Print three lines.** Show the label, the number and the tags.'],
    e: ['**Set up the profile.**', '**Add the name length and age.**', '**Add a tag.**', '**Get the label.**', '**Print three lines.**'],
  },
  'named-lambdas': {
    summary: 'Give names to the lambda parameters of nested let blocks, so each object is clear.',
    goal: 'Use one let inside another. Name the two objects so that you do not mix them up. Print a total and a name.',
    setup: PROFILE,
    steps: [
      '**Set up the profile.** Create `val p` with `Profile().apply { ... }`. Set `name` to "Ada" and `age` to `years`. Add the tags "math" and "code".',
      '**Write the nested let.** Create `val total` with `p.let { person -> ... }`. Inside, use `person.tags.let { list -> ... }`. The inner result is `list.size + person.age`.',
      '**Get the name.** Create `val shout` with `p.let { ... }`. Return `it.name.uppercase()`.',
      '**Print two lines.** Join the text with `+`:\n"Total: 38"\n"Name: ADA"',
    ],
    i: ['**Set up the profile.** Set the name, the age and two tags.', '**Write the nested let.** Name them `person` and `list`.', '**Get the name.** Use `it.name.uppercase()`.', '**Print two lines.** Show the total and the name.'],
    e: ['**Set up the profile.**', '**Write the nested let.**', '**Get the name.**', '**Print two lines.**'],
  },
  'what-comes-back': {
    summary: 'See what each scope function returns: the block result or the object itself.',
    goal: 'Use five scope functions on the same word. Some return the result of the block. Some return the word. Print all five.',
    steps: [
      '**Use let and run.** Create `val a` with `word.let { it.length }`. Create `val b` with `word.run { length * 2 }`.',
      '**Use also and apply.** Create `val c` with `word.also { it.length }`. Create `val d` with `word.apply { length }`.',
      '**Use with.** Create `val e` with `with(word) { length + 1 }`.',
      '**Print five lines.** Print `a`, `b`, `c`, `d` and `e`, each on its own line:\n"6"\n"12"\n"kotlin"\n"kotlin"\n"7"',
    ],
    i: ['**Use let and run.** The block result comes back.', '**Use also and apply.** The word comes back.', '**Use with.** The block result comes back.', '**Print five lines.** Print each value.'],
    e: ['**Use let and run.**', '**Use also and apply.**', '**Use with.**', '**Print five lines.**'],
  },
  'list-results': {
    summary: 'See what apply, also, let and run return when you use them on a mutable list.',
    goal: 'Change a list with four scope functions. Find what each one returns, and print the results.',
    steps: [
      '**Use apply.** Create `val r1` with `list.apply { add(3) }.size`.',
      '**Use also.** Create `val r2` with `list.also { it.add(4) }.size`.',
      '**Use let.** Create `val r3` with `list.let { it.add(5) }`. The block returns what `add` returns.',
      '**Use run.** Create `val r4` with `list.run { sum() }`.',
      '**Print four lines.** Join the text with `+`:\n"r1: 3"\n"r2: 4"\n"r3: true"\n"sum: 15"',
    ],
    i: ['**Use apply.** Add `3`, then read `size`.', '**Use also.** Add `4`, then read `size`.', '**Use let.** Add `5` and keep the result.', '**Use run.** Return the sum.', '**Print four lines.** Show all four results.'],
    e: ['**Use apply.**', '**Use also.**', '**Use let.**', '**Use run.**', '**Print four lines.**'],
  },
  'pick-the-tool': {
    summary: 'Choose apply to set up, also to log, let to compute and with to summarize.',
    goal: 'Build a profile, log that it was built, compute a score, and write a summary. Pick the scope function that fits each job.',
    setup: PROFILE,
    steps: [
      '**Set up the profile.** Create `val p` with `Profile().apply { ... }`. Set `name` to "Ada" and `age` to `years`.',
      '**Log it.** After the `apply` block, add `.also { ... }`. Add "built ", `it.name` and ";" to `log`.',
      '**Work out a score.** Create `val score` with `p.let { ... }`. Return `it.age * 2 + it.name.length`.',
      '**Write a summary.** Create `val summary` with `with(p) { ... }`. Return `name`, "/" and `age`.',
      '**Print three lines.** Join the text with `+`:\n"Log: built Ada;"\n"Score: 75"\n"Summary: Ada/36"',
    ],
    i: ['**Set up the profile.** Use `apply`.', '**Log it.** Use `also`.', '**Work out a score.** Use `let`.', '**Write a summary.** Use `with`.', '**Print three lines.** Show the log, the score and the summary.'],
    e: ['**Set up the profile.**', '**Log it.**', '**Work out a score.**', '**Write a summary.**', '**Print three lines.**'],
  },
  'null-and-config': {
    summary: 'Combine let for a null check with apply to build an object.',
    goal: 'Write a function that makes a profile from a name that may be missing. A missing name gives no profile. Print the label of two results.',
    setup: PROFILE,
    steps: [
      '**Write build.** Above `main`, write `fun build(input: String?, years: Int): Profile?`. Return `input?.let { n -> ... }`. Inside, return `Profile().apply { ... }` that sets `name` to `n` and `age` to `years`.',
      '**Build with a name.** Print `build("Bo", years)?.label() ?: "no profile"`:\n"Bo (9)"',
      '**Build without a name.** Print `build(null, years)?.label() ?: "no profile"`:\n"no profile"',
    ],
    i: ['**Write build.** Use `?.let` and `apply`.', '**Build with a name.** Use `"Bo"`.', '**Build without a name.** Use `null`.'],
    e: ['**Write build.**', '**Build with a name.**', '**Build without a name.**'],
  },
  'chain-config': {
    summary: 'Chain apply, also and let in one expression.',
    goal: 'Build a profile, log that it was made, and turn it into a text. Do it all in one chain. Print the text and the log.',
    setup: PROFILE,
    steps: [
      '**Build the profile.** Start `val label` with `Profile().apply { ... }`. Set `name` to "Cy" and `age` to `years`.',
      '**Log it.** Add `.also { ... }` after the block. Add "made;" to `log`.',
      '**Turn it into text.** Add `.let { ... }`. Return `it.name`, a space and `it.age`.',
      '**Print two lines.** Join the text with `+`:\n"Label: Cy 7"\n"Log: made;"',
    ],
    i: ['**Build the profile.** Use `apply`.', '**Log it.** Use `also`.', '**Turn it into text.** Use `let`.', '**Print two lines.** Show the label and the log.'],
    e: ['**Build the profile.**', '**Log it.**', '**Turn it into text.**', '**Print two lines.**'],
  },
  'chain-numbers': {
    summary: 'Chain filter, also, let and also to work out a result and write a log.',
    goal: 'Keep the numbers above a limit, double their sum, and write a log of what happened. Print the result and the log.',
    steps: [
      '**Filter the numbers.** Start `val result` with `numbers.filter { ... }`. Keep the numbers above `limit`.',
      '**Log the size.** Add `.also { ... }`. Add `it.size.toString()` and ";" to `log`.',
      '**Work out the result.** Add `.let { ... }`. Return `it.sum() * 2`.',
      '**Log the end.** Add `.also { ... }`. Add "total;" to `log`.',
      '**Print two lines.** Join the text with `+`:\n"Result: 56"\n"Log: 3;total;"',
    ],
    i: ['**Filter the numbers.** Use `filter` and `limit`.', '**Log the size.** Use `also`.', '**Work out the result.** Use `let` and `sum()`.', '**Log the end.** Use `also` again.', '**Print two lines.** Show the result and the log.'],
    e: ['**Filter the numbers.**', '**Log the size.**', '**Work out the result.**', '**Log the end.**', '**Print two lines.**'],
  },
  'nested-lets': {
    summary: 'Use two let blocks with clear names, and a default when any value is missing.',
    goal: 'Two texts may be missing. When both exist, add their lengths. When one is missing, the answer is 0.',
    steps: [
      '**Start the outer let.** Create `val total` with `a?.let { first -> ... }`.',
      '**Write the inner let.** Inside, use `b?.let { second -> ... }`. Return `first.length + second.length`.',
      '**Add a default and print.** After the outer block, add `?: 0`. Print "Total: " plus `total`:\n"Total: 3"',
    ],
    i: ['**Start the outer let.** Name the parameter `first`.', '**Write the inner let.** Name the parameter `second`.', '**Add a default and print.** Use `?: 0`, then print.'],
    e: ['**Start the outer let.**', '**Write the inner let.**', '**Add a default and print.**'],
  },
  'guard-instead': {
    summary: 'Write plain code with a null check and an early return, instead of nested lets.',
    goal: 'Add the lengths of two texts that may be missing. Return 0 when one is missing. Use simple code, with no nesting.',
    steps: [
      '**Write total.** Above `main`, write `fun total(a: String?, b: String?): Int`. When `a == null || b == null`, return `0`. Otherwise return `a.length + b.length`.',
      '**Try two texts.** Print `total("x", "yz")`:\n"3"',
      '**Try a missing text.** Print `total("x", null)`:\n"0"',
      '**Try the word.** Print `total(w, "ab")`:\n"8"',
    ],
    i: ['**Write total.** Use an early `return 0`.', '**Try two texts.** Use `"x"` and `"yz"`.', '**Try a missing text.** Use `null`.', '**Try the word.** Use `w` and `"ab"`.'],
    e: ['**Write total.**', '**Try two texts.**', '**Try a missing text.**', '**Try the word.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'let-no-it': {
    subtitle: 'The program should print "Ada", but it does not compile.',
    hints: [
      'Look at the line inside the `let` block. Where does `name` come from?',
      '`let` gives the object as `it`. It does not give a `this`, so `name` alone is unknown.',
      'Use the name that `let` gives to reach the property.',
    ],
    explanation: 'Inside `let`, the object is `it`. The code writes `name = "Ada"`, but `name` alone belongs to `this`, which is not the profile. Writing `it.name = "Ada"` reaches the property, and the program prints `Ada`.',
  },
  'let-null-text': {
    subtitle: 'The program should print "Length: 0" for a missing title, but it prints "Length: null".',
    hints: [
      'Look at the value of `title`. What does `?.let` do when it is `null`?',
      'A `null` receiver skips the block, and the whole expression is `null`.',
      'Give the expression a default value for the `null` case.',
    ],
    explanation: '`title?.let { ... }` does not run the block when `title` is `null`, so `n` is `null` and prints as `null`. Adding `?: 0` gives a default number, so the program prints `Length: 0`.',
  },
  'it-in-apply': {
    subtitle: 'The program should print "Ada", but it does not compile.',
    hints: [
      'Look at the line inside the `apply` block. Where does `it` come from?',
      '`apply` gives the object as `this`. It does not create `it`.',
      'Inside `apply`, use the property names directly.',
    ],
    explanation: '`apply` is a function with a receiver, so the profile is `this` inside the block. There is no `it`, so `it.name` cannot compile. Writing `name = "Ada"` sets the property on `this`.',
  },
  'also-result': {
    subtitle: 'The program should print "2", but it does not compile.',
    hints: [
      'Look at the type of `len` and at what `also` gives back.',
      '`also` returns the object it was called on, which is the text "hi", not the block result.',
      'Use the scope function that returns the result of its block.',
    ],
    explanation: '`also` always returns the original object, so `"hi".also { it.length }` is the text `"hi"`. That cannot be stored in an `Int`. `let` returns the result of its block, so `"hi".let { it.length }` is `2`.',
  },
  'with-receiver': {
    subtitle: 'The program should print "Bo", but it does not compile.',
    hints: [
      'Look at how `with` is called. Where is the object?',
      '`with` is not called on an object with a dot. It is a function that takes the object as an argument.',
      'Write `with` first and give it the object in brackets.',
    ],
    explanation: '`with` takes the object as its first argument, like `with(p) { ... }`. There is no `p.with`, so Kotlin cannot find it. Writing `with(p) { name }` returns the name, `Bo`.',
  },
  'param-shadow': {
    subtitle: 'The program should print "Gus", but it does not compile.',
    hints: [
      'Look at the line `name = name`. How many things are called `name` here?',
      'The function parameter `name` hides the property `name`. Both sides mean the parameter, and a parameter cannot be changed.',
      'Name the object that owns the property on the left side.',
    ],
    explanation: 'Inside `apply`, the parameter `name` is found before the property `name`, so `name = name` tries to change the parameter. Writing `this.name = name` sets the property of the profile to the parameter value, and the program prints `Gus`.',
  },
  'apply-returns-receiver': {
    subtitle: 'The program should print "Length: 5", but it prints "Length: hello".',
    hints: [
      'Look at the output. What was stored in `len`?',
      '`apply` returns the object it was called on, not the result of its block.',
      'Use a scope function that returns the result of the block.',
    ],
    explanation: '`apply` returns the receiver, so `len` holds the text `"hello"`. The block result `length` is thrown away. `let` returns the block result, so `"hello".let { it.length }` gives `5`.',
  },
  'run-unit': {
    subtitle: 'The program should print "Ada (9)", but it does not compile.',
    hints: [
      'Look at what `p` holds after the `run` block.',
      '`run` returns the last line of its block. The last line is an assignment, which gives nothing useful, so `p` is not a `Profile`.',
      'Use the scope function that returns the object itself.',
    ],
    explanation: '`run` returns the value of its last line. An assignment has no value to return, so `p` is not a profile and `p.label()` fails. `apply` returns the object, so `p` is the `Profile` and the label is `Ada (9)`.',
  },
  'log-before-filter': {
    subtitle: 'The program should print "kept 3" and "3", but it prints "kept 5" and "3".',
    hints: [
      'Look at the number in the log. How many numbers are kept?',
      'The `also` block runs before `filter`, so it sees all five numbers.',
      'Change the order of the two calls so the log sees the filtered list.',
    ],
    explanation: 'The chain runs from left to right. `also` comes first, so `it.size` is the size of the full list, `5`. If `filter` comes first and `also` after it, the log sees the kept numbers and says `kept 3`.',
  },
  'nested-apply': {
    subtitle: 'The program should print "Zed|", but it prints "|Zed".',
    hints: [
      'Look at which profile has the name `Zed` in the output.',
      'In the inner `apply`, `this` is `b`. A plain `name` means the closest receiver, which is `b`.',
      'Remove the extra nesting, so the block works on the profile you want to change.',
    ],
    explanation: 'Inside the inner `apply`, the closest receiver is `b`, so `name = "Zed"` changes `b`. Nesting made it hard to see. Using only `a.apply { name = "Zed" }` changes `a`, and the program prints `Zed|`.',
  },
};

export const DBG_SUMMARY: Record<string, string> = {
  'let-no-it': 'let gives the object as it, so a plain name is not found.',
  'let-null-text': 'A missing value leaves a null result with no default.',
  'it-in-apply': 'apply gives this, so it does not exist.',
  'also-result': 'also returns the object, so its result is not a number.',
  'with-receiver': 'with takes the object as an argument, not with a dot.',
  'param-shadow': 'The parameter name hides the property name.',
  'apply-returns-receiver': 'apply returns the text, not the length.',
  'run-unit': 'run returns the last line, not the object.',
  'log-before-filter': 'The log runs before the filter.',
  'nested-apply': 'The inner apply changes a different object.',
};
