/**
 * World 13 (Scope Masters) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world13.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world13.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'name-lengths', difficulty: 'medium', tags: ['lesson:let-run', 'let', 'nullable-receiver', 'elvis'], title: 'Name Lengths', fileName: 'NameLengths.kt',
    solution: `fun main() {
  val title: String? = "kotlin"
  val length = title?.let { it.length } ?: -1
  val shout = title?.let { it.uppercase() } ?: "none"
  title?.let { println("Title: " + it) }
  println("Length: " + length)
  println("Shout: " + shout)
}`,
    starter: `fun main() {
  val title: String? = "kotlin"

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The title is kotlin: it prints the title, its length 6 and KOTLIN. If the title is null, let does not run: the length is -1, the shout is none and no title line prints.
    expected: 'Title: kotlin\nLength: 6\nShout: KOTLIN',
    swap: { variableName: 'title', originalLiteral: '"kotlin"', alternateLiteral: 'null', alternateExpected: 'Length: -1\nShout: none' },
  },
  {
    id: 'area-run', difficulty: 'medium', tags: ['lesson:let-run', 'run', 'run-block', 'extension-run'], title: 'Area with Run', fileName: 'AreaRun.kt',
    solution: `fun main() {
  val a = 6
  val b = 4
  val area = run {
    val w = a + 2
    val h = b
    w * h
  }
  val text = "report".run { uppercase() + length }
  println("Area: " + area)
  println("Text: " + text)
}`,
    starter: `fun main() {
  val a = 6
  val b = 4

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // w = 6 + 2 = 8 and h = 4 so the area is 32; "report" in upper case plus its length 6 is REPORT6. With a 10: w = 12 and the area is 48.
    expected: 'Area: 32\nText: REPORT6',
    swap: { variableName: 'a', originalLiteral: '6', alternateLiteral: '10', alternateExpected: 'Area: 48\nText: REPORT6' },
  },
  {
    id: 'build-profile', difficulty: 'medium', tags: ['lesson:apply', 'apply', 'configure-object', 'returns-receiver'], title: 'Build a Profile', fileName: 'BuildProfile.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
    tags.add("math")
    tags.add("code")
  }
  println(p.label())
  println("Tags: " + p.tags.size)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // apply sets the name and age and adds two tags, then returns the profile: Ada (36) and 2 tags. With years 40: Ada (40).
    expected: 'Ada (36)\nTags: 2',
    swap: { variableName: 'years', originalLiteral: '36', alternateLiteral: '40', alternateExpected: 'Ada (40)\nTags: 2' },
  },
  {
    id: 'list-builder', difficulty: 'medium', tags: ['lesson:apply', 'apply', 'builder', 'loop-inside-apply'], title: 'List Builder', fileName: 'ListBuilder.kt',
    solution: `fun main() {
  val count = 3
  val list = mutableListOf<Int>().apply {
    for (i in 1..count) {
      add(i * 2)
    }
  }
  println("List: $list")
  println("Size: " + list.size)
}`,
    starter: `fun main() {
  val count = 3

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The loop adds 2, 4, 6 so the size is 3. With count 2: [2, 4] and size 2.
    expected: 'List: [2, 4, 6]\nSize: 3',
    swap: { variableName: 'count', originalLiteral: '3', alternateLiteral: '2', alternateExpected: 'List: [2, 4]\nSize: 2' },
  },
  {
    id: 'trace-word', difficulty: 'medium', tags: ['lesson:also', 'also', 'side-effect', 'returns-receiver'], title: 'Trace a Word', fileName: 'TraceWord.kt',
    solution: `fun main() {
  val word = "kotlin"
  val result = word.also { println("before: " + it) }.uppercase().also { println("after: " + it) }
  println("Result: " + result)
}`,
    starter: `fun main() {
  val word = "kotlin"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // also prints the word and passes it on: before kotlin, then upper case, then after KOTLIN, then the result. With the word scope: SCOPE.
    expected: 'before: kotlin\nafter: KOTLIN\nResult: KOTLIN',
    swap: { variableName: 'word', originalLiteral: '"kotlin"', alternateLiteral: '"scope"', alternateExpected: 'before: scope\nafter: SCOPE\nResult: SCOPE' },
  },
  {
    id: 'log-and-keep', difficulty: 'hard', tags: ['lesson:also', 'also', 'chained-also', 'mutable-list', 'log'], title: 'Log and Keep', fileName: 'LogAndKeep.kt',
    solution: `fun main() {
  val extra = 10
  var log = ""
  val numbers = mutableListOf(1, 2, 3)
    .also { log += "start:" + it.size + ";" }
    .also { it.add(extra) }
    .also { log += "end:" + it.size + ";" }
  println("Log: " + log)
  println("Numbers: $numbers")
}`,
    starter: `fun main() {
  val extra = 10
  var log = ""

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The list starts with 3 items (logged), gets 10 added, and ends with 4 items (logged). With extra 20: the last number is 20.
    expected: 'Log: start:3;end:4;\nNumbers: [1, 2, 3, 10]',
    swap: { variableName: 'extra', originalLiteral: '10', alternateLiteral: '20', alternateExpected: 'Log: start:3;end:4;\nNumbers: [1, 2, 3, 20]' },
  },
  {
    id: 'report-with', difficulty: 'medium', tags: ['lesson:with', 'with', 'change-inside-with', 'block-result'], title: 'Report with With', fileName: 'ReportWith.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 4
  val p = Profile()
  p.name = "Bo"
  p.age = 5
  val text = with(p) {
    age = age + years
    label()
  }
  println(text)
  println("Age now: " + p.age)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 4
  val p = Profile()
  p.name = "Bo"
  p.age = 5

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The block adds 4 to the age (5 becomes 9) and returns the label: Bo (9). The profile itself changed, so its age is 9. With years 10: 15.
    expected: 'Bo (9)\nAge now: 9',
    swap: { variableName: 'years', originalLiteral: '4', alternateLiteral: '10', alternateExpected: 'Bo (15)\nAge now: 15' },
  },
  {
    id: 'list-with', difficulty: 'medium', tags: ['lesson:with', 'with', 'list-receiver', 'block-result'], title: 'List with With', fileName: 'ListWith.kt',
    solution: `fun main() {
  val start = 3
  val numbers = listOf(start, 1, 2, 9)
  val summary = with(numbers) {
    "n=" + size + " first=" + first() + " last=" + last()
  }
  val ends = with(numbers) {
    first() + last()
  }
  println(summary)
  println("Ends: " + ends)
}`,
    starter: `fun main() {
  val start = 3
  val numbers = listOf(start, 1, 2, 9)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // The list has 4 items, first 3 and last 9, so the ends add up to 12. With start 7: first 7 and ends 16.
    expected: 'n=4 first=3 last=9\nEnds: 12',
    swap: { variableName: 'start', originalLiteral: '3', alternateLiteral: '7', alternateExpected: 'n=4 first=7 last=9\nEnds: 16' },
  },
  {
    id: 'this-or-it', difficulty: 'medium', tags: ['lesson:this-vs-it', 'this-vs-it', 'apply-this', 'let-it', 'also-it', 'run-this'], title: 'This or It', fileName: 'ThisOrIt.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
  }
  val len = p.let { it.name.length + it.age }
  val tagged = p.also { it.tags.add("seen") }.tags.size
  val label = p.run { label() }
  println("Label: " + label)
  println("Length+age: " + len)
  println("Tags: " + tagged)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // apply and run use this, let and also use it. The name Ada has 3 letters, so 3 + 36 = 39; one tag was added. With years 40: Ada (40) and 43.
    expected: 'Label: Ada (36)\nLength+age: 39\nTags: 1',
    swap: { variableName: 'years', originalLiteral: '36', alternateLiteral: '40', alternateExpected: 'Label: Ada (40)\nLength+age: 43\nTags: 1' },
  },
  {
    id: 'named-lambdas', difficulty: 'hard', tags: ['lesson:this-vs-it', 'this-vs-it', 'named-lambda-parameter', 'nested-let'], title: 'Named Lambdas', fileName: 'NamedLambdas.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  val p = Profile().apply {
    name = "Ada"
    age = years
    tags.add("math")
    tags.add("code")
  }
  val total = p.let { person -> person.tags.let { list -> list.size + person.age } }
  val shout = p.let { it.name.uppercase() }
  println("Total: " + total)
  println("Name: " + shout)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Two tags plus the age 36 make 38; the name in upper case is ADA. With years 40: 42.
    expected: 'Total: 38\nName: ADA',
    swap: { variableName: 'years', originalLiteral: '36', alternateLiteral: '40', alternateExpected: 'Total: 42\nName: ADA' },
  },
  {
    id: 'what-comes-back', difficulty: 'medium', tags: ['lesson:return-values-of-scope-functions', 'let-result', 'run-result', 'also-receiver', 'apply-receiver', 'with-result'], title: 'What Comes Back', fileName: 'WhatComesBack.kt',
    solution: `fun main() {
  val word = "kotlin"
  val a = word.let { it.length }
  val b = word.run { length * 2 }
  val c = word.also { it.length }
  val d = word.apply { length }
  val e = with(word) { length + 1 }
  println(a)
  println(b)
  println(c)
  println(d)
  println(e)
}`,
    starter: `fun main() {
  val word = "kotlin"

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // let and run give the block result (6 and 12); also and apply give the word back; with gives the block result 7. With the word ab: 2, 4, ab, ab, 3.
    expected: '6\n12\nkotlin\nkotlin\n7',
    swap: { variableName: 'word', originalLiteral: '"kotlin"', alternateLiteral: '"ab"', alternateExpected: '2\n4\nab\nab\n3' },
  },
  {
    id: 'list-results', difficulty: 'hard', tags: ['lesson:return-values-of-scope-functions', 'apply-receiver', 'also-receiver', 'let-result', 'run-result'], title: 'List Results', fileName: 'ListResults.kt',
    solution: `fun main() {
  val start = 1
  val list = mutableListOf(start, 2)
  val r1 = list.apply { add(3) }.size
  val r2 = list.also { it.add(4) }.size
  val r3 = list.let { it.add(5) }
  val r4 = list.run { sum() }
  println("r1: " + r1)
  println("r2: " + r2)
  println("r3: " + r3)
  println("sum: " + r4)
}`,
    starter: `fun main() {
  val start = 1
  val list = mutableListOf(start, 2)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // After apply the list has 3 items; after also it has 4; let returns what add returns (true) while adding a fifth item; run returns the sum 1+2+3+4+5 = 15. With start 6: sum 20.
    expected: 'r1: 3\nr2: 4\nr3: true\nsum: 15',
    swap: { variableName: 'start', originalLiteral: '1', alternateLiteral: '6', alternateExpected: 'r1: 3\nr2: 4\nr3: true\nsum: 20' },
  },
  {
    id: 'pick-the-tool', difficulty: 'medium', tags: ['lesson:choosing-the-appropriate-scope-function', 'apply', 'also', 'let', 'with', 'choose-by-purpose'], title: 'Pick the Tool', fileName: 'PickTheTool.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  var log = ""
  val p = Profile().apply {
    name = "Ada"
    age = years
  }.also { log += "built " + it.name + ";" }
  val score = p.let { it.age * 2 + it.name.length }
  val summary = with(p) { name + "/" + age }
  println("Log: " + log)
  println("Score: " + score)
  println("Summary: " + summary)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 36
  var log = ""

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // apply configures, also logs, let computes a score (36 * 2 + 3 = 75), with builds a summary. With years 40: score 83.
    expected: 'Log: built Ada;\nScore: 75\nSummary: Ada/36',
    swap: { variableName: 'years', originalLiteral: '36', alternateLiteral: '40', alternateExpected: 'Log: built Ada;\nScore: 83\nSummary: Ada/40' },
  },
  {
    id: 'null-and-config', difficulty: 'hard', tags: ['lesson:choosing-the-appropriate-scope-function', 'let', 'apply', 'nullable-input', 'function-return'], title: 'Null and Config', fileName: 'NullAndConfig.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun build(input: String?, years: Int): Profile? {
  return input?.let { n ->
    Profile().apply {
      name = n
      age = years
    }
  }
}

fun main() {
  val years = 9
  println(build("Bo", years)?.label() ?: "no profile")
  println(build(null, years)?.label() ?: "no profile")
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

// 1. TODO

fun main() {
  val years = 9

  // 2. TODO

  // 3. TODO
}`,
    // let skips a null input, and apply fills in a new profile otherwise: Bo (9), then no profile. With years 12: Bo (12).
    expected: 'Bo (9)\nno profile',
    swap: { variableName: 'years', originalLiteral: '9', alternateLiteral: '12', alternateExpected: 'Bo (12)\nno profile' },
  },
  {
    id: 'chain-config', difficulty: 'medium', tags: ['lesson:scope-function-chaining', 'chaining', 'apply', 'also', 'let'], title: 'Chain a Config', fileName: 'ChainConfig.kt',
    solution: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 7
  var log = ""
  val label = Profile().apply {
    name = "Cy"
    age = years
  }.also { log += "made;" }.let { it.name + " " + it.age }
  println("Label: " + label)
  println("Log: " + log)
}`,
    starter: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val years = 7
  var log = ""

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // apply builds the profile, also logs made, let turns it into the text Cy 7. With years 8: Cy 8.
    expected: 'Label: Cy 7\nLog: made;',
    swap: { variableName: 'years', originalLiteral: '7', alternateLiteral: '8', alternateExpected: 'Label: Cy 8\nLog: made;' },
  },
  {
    id: 'chain-numbers', difficulty: 'hard', tags: ['lesson:scope-function-chaining', 'chaining', 'filter', 'also', 'let', 'sum'], title: 'Chain the Numbers', fileName: 'ChainNumbers.kt',
    solution: `fun main() {
  var log = ""
  val limit = 5
  val numbers = listOf(4, 9, 2, 7, 12)
  val result = numbers.filter { it > limit }.also { log += it.size.toString() + ";" }.let { it.sum() * 2 }.also { log += "total;" }
  println("Result: " + result)
  println("Log: " + log)
}`,
    starter: `fun main() {
  var log = ""
  val limit = 5
  val numbers = listOf(4, 9, 2, 7, 12)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Above 5: 9, 7, 12 (3 items logged); the sum 28 doubled is 56; then total is logged. With limit 8: 9 and 12, sum 21, result 42.
    expected: 'Result: 56\nLog: 3;total;',
    swap: { variableName: 'limit', originalLiteral: '5', alternateLiteral: '8', alternateExpected: 'Result: 42\nLog: 2;total;' },
  },
  {
    id: 'nested-lets', difficulty: 'medium', tags: ['lesson:avoiding-overuse-and-nesting', 'nested-let', 'named-lambda-parameter', 'nullable'], title: 'Nested Lets', fileName: 'NestedLets.kt',
    solution: `fun main() {
  val a: String? = "x"
  val b: String? = "yz"
  val total = a?.let { first ->
    b?.let { second ->
      first.length + second.length
    }
  } ?: 0
  println("Total: " + total)
}`,
    starter: `fun main() {
  val a: String? = "x"
  val b: String? = "yz"

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Both texts exist: 1 + 2 = 3. If b is null the inner let gives null, so the elvis gives 0.
    expected: 'Total: 3',
    swap: { variableName: 'b', originalLiteral: '"yz"', alternateLiteral: 'null', alternateExpected: 'Total: 0' },
  },
  {
    id: 'guard-instead', difficulty: 'hard', tags: ['lesson:avoiding-overuse-and-nesting', 'null-guard', 'plain-code', 'early-return'], title: 'Guard Instead of Nesting', fileName: 'GuardInstead.kt',
    solution: `fun total(a: String?, b: String?): Int {
  if (a == null || b == null) {
    return 0
  }
  return a.length + b.length
}

fun main() {
  val w = "kotlin"
  println(total("x", "yz"))
  println(total("x", null))
  println(total(w, "ab"))
}`,
    starter: `// 1. TODO

fun main() {
  val w = "kotlin"

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 1 + 2 = 3; a null input gives 0; kotlin (6) + ab (2) = 8. With w go: 2 + 2 = 4.
    expected: '3\n0\n8',
    swap: { variableName: 'w', originalLiteral: '"kotlin"', alternateLiteral: '"go"', alternateExpected: '3\n0\n4' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'let-no-it', tags: ['lesson:let-run', 'let', 'it-vs-this'], title: 'Fix the Missing it', bugType: 'type', bugLabel: 'Compile Error: let gives the object as it, not as this', difficulty: 'medium',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.let {
    name = "Ada"
  }
  println(p.name)
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.let {
    it.name = "Ada"
  }
  println(p.name)
}`,
    expected: 'Ada',
  },
  {
    id: 'let-null-text', tags: ['lesson:let-run', 'let', 'nullable-receiver', 'elvis'], title: 'Fix the Null Length', bugType: 'logic', bugLabel: 'Logic Error: a null receiver leaves a null result', difficulty: 'medium',
    broken: `fun main() {
  val title: String? = null
  val n = title?.let { it.length }
  println("Length: " + n)
}`,
    fixed: `fun main() {
  val title: String? = null
  val n = title?.let { it.length } ?: 0
  println("Length: " + n)
}`,
    expected: 'Length: 0',
  },
  {
    id: 'it-in-apply', tags: ['lesson:apply', 'apply', 'this-vs-it'], title: 'Fix the Apply Block', bugType: 'type', bugLabel: 'Compile Error: apply gives the object as this, not as it', difficulty: 'medium',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    it.name = "Ada"
  }
  println(p.name)
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    name = "Ada"
  }
  println(p.name)
}`,
    expected: 'Ada',
  },
  {
    id: 'also-result', tags: ['lesson:also', 'also', 'returns-receiver'], title: 'Fix the Also Result', bugType: 'type', bugLabel: 'Compile Error: also returns the object, not the block result', difficulty: 'medium',
    broken: `fun main() {
  val len: Int = "hi".also { it.length }
  println(len)
}`,
    fixed: `fun main() {
  val len = "hi".let { it.length }
  println(len)
}`,
    expected: '2',
  },
  {
    id: 'with-receiver', tags: ['lesson:with', 'with', 'receiver-as-argument'], title: 'Fix the With Call', bugType: 'type', bugLabel: 'Compile Error: with takes the object as an argument', difficulty: 'medium',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.name = "Bo"
  val t = p.with {
    name
  }
  println(t)
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile()
  p.name = "Bo"
  val t = with(p) {
    name
  }
  println(t)
}`,
    expected: 'Bo',
  },
  {
    id: 'param-shadow', tags: ['lesson:this-vs-it', 'this', 'name-shadowing'], title: 'Fix the Shadowed Name', bugType: 'type', bugLabel: 'Compile Error: the parameter hides the property inside apply', difficulty: 'hard',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun make(name: String): Profile {
  return Profile().apply {
    name = name
  }
}

fun main() {
  println(make("Gus").name)
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun make(name: String): Profile {
  return Profile().apply {
    this.name = name
  }
}

fun main() {
  println(make("Gus").name)
}`,
    expected: 'Gus',
  },
  {
    id: 'apply-returns-receiver', tags: ['lesson:return-values-of-scope-functions', 'apply', 'returns-receiver', 'block-result'], title: 'Fix the Length', bugType: 'logic', bugLabel: 'Logic Error: apply gives the text back, not its length', difficulty: 'medium',
    broken: `fun main() {
  val len = "hello".apply { length }
  println("Length: " + len)
}`,
    fixed: `fun main() {
  val len = "hello".let { it.length }
  println("Length: " + len)
}`,
    expected: 'Length: 5',
  },
  {
    id: 'run-unit', tags: ['lesson:choosing-the-appropriate-scope-function', 'run-vs-apply', 'block-result'], title: 'Fix the Wrong Tool', bugType: 'type', bugLabel: 'Compile Error: run returns the last line, not the object', difficulty: 'hard',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().run {
    name = "Ada"
    age = 9
  }
  println(p.label())
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val p = Profile().apply {
    name = "Ada"
    age = 9
  }
  println(p.label())
}`,
    expected: 'Ada (9)',
  },
  {
    id: 'log-before-filter', tags: ['lesson:scope-function-chaining', 'chaining', 'order-of-steps', 'also', 'filter'], title: 'Fix the Chain Order', bugType: 'logic', bugLabel: 'Logic Error: the log runs before the filter', difficulty: 'hard',
    broken: `fun main() {
  var log = ""
  val numbers = listOf(4, 9, 2, 7, 12)
  val big = numbers.also { log = "kept " + it.size }.filter { it > 5 }
  println(log)
  println(big.size)
}`,
    fixed: `fun main() {
  var log = ""
  val numbers = listOf(4, 9, 2, 7, 12)
  val big = numbers.filter { it > 5 }.also { log = "kept " + it.size }
  println(log)
  println(big.size)
}`,
    expected: 'kept 3\n3',
  },
  {
    id: 'nested-apply', tags: ['lesson:avoiding-overuse-and-nesting', 'nested-apply', 'receiver-confusion'], title: 'Fix the Nested Apply', bugType: 'logic', bugLabel: 'Logic Error: the inner apply changes a different object', difficulty: 'hard',
    broken: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val a = Profile()
  val b = Profile()
  a.apply {
    b.apply {
      name = "Zed"
    }
  }
  println(a.name + "|" + b.name)
}`,
    fixed: `class Profile {
  var name = ""
  var age = 0
  var tags = mutableListOf<String>()

  fun label(): String {
    return name + " (" + age + ")"
  }
}

fun main() {
  val a = Profile()
  val b = Profile()
  a.apply {
    name = "Zed"
  }
  println(a.name + "|" + b.name)
}`,
    expected: 'Zed|',
  },
];
