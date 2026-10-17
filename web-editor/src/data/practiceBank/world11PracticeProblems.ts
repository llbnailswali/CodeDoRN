import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 11 -- OOP Evolution (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the OOP feature (open class, interface, sealed, data, companion, extension, by ...) is named in the step.
//   hard   -- several features together, shared state, a value that depends on the order of steps, or a rule such as exhaustive when,
//             inner vs nested, or member-wins; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world11.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world11.real.ts).

export const WORLD_11_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-11-practice-writerun-pay-grades',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write a subclass that overrides a function, then total the pay of a mixed list.',
    conceptTags: ['lesson:inheritance-abstract-classes', 'open-class', 'override', 'polymorphic-list'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Pay Grades',
    goal: 'A company has employees and managers. A manager gets a bonus on top of the base pay. Print each pay and the total.',
    description: 'The open class `Employee` is in the starter code. Its `pay()` returns `base`.\n\n' +
              '1. **Write the subclass.** Above `main`, write `class Manager` with `name`, `base` and `val bonus: Int`. It extends `Employee(name, base)`. Override `pay()` to return `base + bonus`.\n\n' +
              '2. **Make the staff list.** Create `val staff` with `listOf(...)`: `Employee("Ana", 300)`, `Manager("Bo", 400, bonus)` and `Employee("Cy", 250)`.\n\n' +
              '3. **Print each pay.** Create `var total = 0`. Loop over `staff`. Print `s.name`, a colon and `s.pay()`. Add `s.pay()` to `total`.\n\n' +
              '4. **Print the total.** Join the text with `+`:\n"Ana: 300"\n"Bo: 450"\n"Cy: 250"\n"Total: 1000"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the subclass.** Extend `Employee` and override `pay()`.',
          '2. **Make the staff list.** Mix employees and one manager.',
          '3. **Print each pay.** Loop and keep a total.',
          '4. **Print the total.** Show the last line.',
        ],
        comments: [
          '// 1. Write the subclass. Extend Employee and override pay().',
          '// 2. Make the staff list. Mix employees and one manager.',
          '// 3. Print each pay. Loop and keep a total.',
          '// 4. Print the total. Show the last line.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the subclass.**',
          '2. **Make the staff list.**',
          '3. **Print each pay.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write the subclass.',
          '// 2. Make the staff list.',
          '// 3. Print each pay.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PayGrades.kt',
    initialCode: `open class Employee(val name: String, val base: Int) {
  open fun pay(): Int {
    return base
  }
}

// 1. Write the subclass. Above main, write class Manager with name, base and val bonus: Int. It extends Employee(name, base). Override pay() to return base + bonus.

fun main() {
  val bonus = 50

  // 2. Make the staff list. Create val staff with listOf(...): Employee("Ana", 300), Manager("Bo", 400, bonus) and Employee("Cy", 250).

  // 3. Print each pay. Create var total = 0. Loop over staff. Print s.name, a colon and s.pay(). Add s.pay() to total.

  // 4. Print the total. Join the text with +: "Ana: 300" "Bo: 450" "Cy: 250" "Total: 1000"
}`,
    solutionCode: `open class Employee(val name: String, val base: Int) {
  open fun pay(): Int {
    return base
  }
}

class Manager(name: String, base: Int, val bonus: Int) : Employee(name, base) {
  override fun pay(): Int {
    return base + bonus
  }
}

fun main() {
  val bonus = 50
  val staff = listOf(Employee("Ana", 300), Manager("Bo", 400, bonus), Employee("Cy", 250))
  var total = 0
  for (s in staff) {
    println(s.name + ": " + s.pay())
    total += s.pay()
  }
  println("Total: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 300\nBo: 450\nCy: 250\nTotal: 1000',
    testCase: { call: '', expected: 'Ana: 300\nBo: 450\nCy: 250\nTotal: 1000' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '50', alternateLiteral: '100' }],
      alternateExpectedOutput: 'Ana: 300\nBo: 500\nCy: 250\nTotal: 1050',
    },
  },
  {
    id: 'world-11-practice-writerun-shape-areas',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Write two subclasses of an abstract class and find the shape with the biggest area.',
    conceptTags: ['lesson:inheritance-abstract-classes', 'abstract-class', 'abstract-member', 'override', 'largest'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shape Areas',
    goal: 'Make two kinds of shapes. Print each shape with its area, then print the name of the largest shape.',
    description: 'The abstract class `Shape` is in the starter code. It has `name`, an abstract `area()` and a `describe()` function.\n\n' +
              '1. **Write the rectangle.** Above `main`, write `class Rect(val w: Int, val h: Int)`. It extends `Shape("Rect")`. Override `area()` to return `w * h`.\n\n' +
              '2. **Write the square.** Write `class Square(val side: Int)`. It extends `Shape("Square")`. Override `area()` to return `side * side`.\n\n' +
              '3. **Make the list.** Create `val shapes` with `Rect(4, 5)` and `Square(side)`.\n\n' +
              '4. **Find the largest.** Create `var biggest = shapes[0]`. Loop over `shapes`. Print `s.describe()`. When `s.area()` is bigger than `biggest.area()`, set `biggest` to `s`.\n\n' +
              '5. **Print the winner.** Join the text with `+`:\n"Rect area 20"\n"Square area 9"\n"Largest: Rect"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the rectangle.** Extend `Shape` and override `area()`.',
          '2. **Write the square.** Extend `Shape` and override `area()`.',
          '3. **Make the list.** Use `Rect(4, 5)` and `Square(side)`.',
          '4. **Find the largest.** Loop, print, and keep the best.',
          '5. **Print the winner.** Show the largest name.',
        ],
        comments: [
          '// 1. Write the rectangle. Extend Shape and override area().',
          '// 2. Write the square. Extend Shape and override area().',
          '// 3. Make the list. Use Rect(4, 5) and Square(side).',
          '// 4. Find the largest. Loop, print, and keep the best.',
          '// 5. Print the winner. Show the largest name.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the rectangle.**',
          '2. **Write the square.**',
          '3. **Make the list.**',
          '4. **Find the largest.**',
          '5. **Print the winner.**',
        ],
        comments: [
          '// 1. Write the rectangle.',
          '// 2. Write the square.',
          '// 3. Make the list.',
          '// 4. Find the largest.',
          '// 5. Print the winner.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShapeAreas.kt',
    initialCode: `abstract class Shape(val name: String) {
  abstract fun area(): Int

  fun describe(): String {
    return name + " area " + area()
  }
}

// 1. Write the rectangle. Above main, write class Rect(val w: Int, val h: Int). It extends Shape("Rect"). Override area() to return w * h.

// 2. Write the square. Write class Square(val side: Int). It extends Shape("Square"). Override area() to return side * side.

fun main() {
  val side = 3

  // 3. Make the list. Create val shapes with Rect(4, 5) and Square(side).

  // 4. Find the largest. Create var biggest = shapes[0]. Loop over shapes. Print s.describe(). When s.area() is bigger than biggest.area(), set biggest to s.

  // 5. Print the winner. Join the text with +: "Rect area 20" "Square area 9" "Largest: Rect"
}`,
    solutionCode: `abstract class Shape(val name: String) {
  abstract fun area(): Int

  fun describe(): String {
    return name + " area " + area()
  }
}

class Rect(val w: Int, val h: Int) : Shape("Rect") {
  override fun area(): Int {
    return w * h
  }
}

class Square(val side: Int) : Shape("Square") {
  override fun area(): Int {
    return side * side
  }
}

fun main() {
  val side = 3
  val shapes = listOf(Rect(4, 5), Square(side))
  var biggest = shapes[0]
  for (s in shapes) {
    println(s.describe())
    if (s.area() > biggest.area()) {
      biggest = s
    }
  }
  println("Largest: " + biggest.name)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Rect area 20\nSquare area 9\nLargest: Rect',
    testCase: { call: '', expected: 'Rect area 20\nSquare area 9\nLargest: Rect' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'side', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Rect area 20\nSquare area 25\nLargest: Square',
    },
  },
  {
    id: 'world-11-practice-writerun-animal-sounds',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write two classes that implement an interface, and use its default function.',
    conceptTags: ['lesson:interfaces-multiple-interface-implementa', 'interface', 'default-method', 'override', 'list-of-interface'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Animal Sounds',
    goal: 'Animals make sounds. Each animal repeats its sound twice. Print what each animal says.',
    description: 'The interface `Speaker` is in the starter code. `twice()` already repeats `speak()`.\n\n' +
              '1. **Write the dog.** Above `main`, write `class Dog : Speaker`. Override `speak()` to return `"Woof"`.\n\n' +
              '2. **Write the cat.** Write `class Cat(val happy: Boolean) : Speaker`. Override `speak()`. Return `"Purr"` when `happy` is true, otherwise `"Hiss"`.\n\n' +
              '3. **Make the list.** Create `val speakers: List<Speaker>` with `Dog()` and `Cat(happy)`.\n\n' +
              '4. **Print the sounds.** Loop over `speakers` and print `s.twice()`:\n"Woof Woof"\n"Purr Purr"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the dog.** Implement `speak()`.',
          '2. **Write the cat.** Use `happy` to choose the sound.',
          '3. **Make the list.** Use the type `List<Speaker>`.',
          '4. **Print the sounds.** Print `twice()` for each.',
        ],
        comments: [
          '// 1. Write the dog. Implement speak().',
          '// 2. Write the cat. Use happy to choose the sound.',
          '// 3. Make the list. Use the type List<Speaker>.',
          '// 4. Print the sounds. Print twice() for each.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the dog.**',
          '2. **Write the cat.**',
          '3. **Make the list.**',
          '4. **Print the sounds.**',
        ],
        comments: [
          '// 1. Write the dog.',
          '// 2. Write the cat.',
          '// 3. Make the list.',
          '// 4. Print the sounds.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AnimalSounds.kt',
    initialCode: `interface Speaker {
  fun speak(): String

  fun twice(): String = speak() + " " + speak()
}

// 1. Write the dog. Above main, write class Dog : Speaker. Override speak() to return "Woof".

// 2. Write the cat. Write class Cat(val happy: Boolean) : Speaker. Override speak(). Return "Purr" when happy is true, otherwise "Hiss".

fun main() {
  val happy = true

  // 3. Make the list. Create val speakers: List<Speaker> with Dog() and Cat(happy).

  // 4. Print the sounds. Loop over speakers and print s.twice(): "Woof Woof" "Purr Purr"
}`,
    solutionCode: `interface Speaker {
  fun speak(): String

  fun twice(): String = speak() + " " + speak()
}

class Dog : Speaker {
  override fun speak(): String {
    return "Woof"
  }
}

class Cat(val happy: Boolean) : Speaker {
  override fun speak(): String {
    if (happy) {
      return "Purr"
    }
    return "Hiss"
  }
}

fun main() {
  val happy = true
  val speakers: List<Speaker> = listOf(Dog(), Cat(happy))
  for (s in speakers) {
    println(s.twice())
  }
}`,
    sampleInput: 'main()',
    expectedOutput: 'Woof Woof\nPurr Purr',
    testCase: { call: '', expected: 'Woof Woof\nPurr Purr' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'happy', originalLiteral: 'true', alternateLiteral: 'false' }],
      alternateExpectedOutput: 'Woof Woof\nHiss Hiss',
    },
  },
  {
    id: 'world-11-practice-writerun-duck-powers',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Write one class that implements two interfaces, and check its type with is.',
    conceptTags: ['lesson:interfaces-multiple-interface-implementa', 'two-interfaces', 'is-check', 'override'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Duck Powers',
    goal: 'A duck can fly and swim. Write the duck. Print its powers, their total, and whether it can fly.',
    description: 'The interfaces `Flyer` and `Swimmer` and the function `total(f, s)` are in the starter code.\n\n' +
              '1. **Write the duck.** Above `main`, write `class Duck(val power: Int)`. It implements `Flyer` and `Swimmer`. Override `fly()` to return `power * 3`, and `swim()` to return `power * 2`.\n\n' +
              '2. **Create the duck.** Create `val duck` with `Duck(power)`.\n\n' +
              '3. **Print three lines.** Print `duck.fly()`, `duck.swim()` and `total(duck, duck)`:\n"Fly: 12"\n"Swim: 8"\n"Total: 20"\n\n' +
              '4. **Check the type.** Print whether `duck is Flyer`:\n"Duck can fly: true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the duck.** Implement both interfaces.',
          '2. **Create the duck.** Use `power`.',
          '3. **Print three lines.** Show fly, swim and total.',
          '4. **Check the type.** Use `is Flyer`.',
        ],
        comments: [
          '// 1. Write the duck. Implement both interfaces.',
          '// 2. Create the duck. Use power.',
          '// 3. Print three lines. Show fly, swim and total.',
          '// 4. Check the type. Use is Flyer.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the duck.**',
          '2. **Create the duck.**',
          '3. **Print three lines.**',
          '4. **Check the type.**',
        ],
        comments: [
          '// 1. Write the duck.',
          '// 2. Create the duck.',
          '// 3. Print three lines.',
          '// 4. Check the type.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DuckPowers.kt',
    initialCode: `interface Flyer {
  fun fly(): Int
}

interface Swimmer {
  fun swim(): Int
}

fun total(f: Flyer, s: Swimmer): Int {
  return f.fly() + s.swim()
}

// 1. Write the duck. Above main, write class Duck(val power: Int). It implements Flyer and Swimmer. Override fly() to return power * 3, and swim() to return power * 2.

fun main() {
  val power = 4

  // 2. Create the duck. Create val duck with Duck(power).

  // 3. Print three lines. Print duck.fly(), duck.swim() and total(duck, duck): "Fly: 12" "Swim: 8" "Total: 20"

  // 4. Check the type. Print whether duck is Flyer: "Duck can fly: true"
}`,
    solutionCode: `interface Flyer {
  fun fly(): Int
}

interface Swimmer {
  fun swim(): Int
}

class Duck(val power: Int) : Flyer, Swimmer {
  override fun fly(): Int {
    return power * 3
  }

  override fun swim(): Int {
    return power * 2
  }
}

fun total(f: Flyer, s: Swimmer): Int {
  return f.fly() + s.swim()
}

fun main() {
  val power = 4
  val duck = Duck(power)
  println("Fly: " + duck.fly())
  println("Swim: " + duck.swim())
  println("Total: " + total(duck, duck))
  println("Duck can fly: " + (duck is Flyer))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Fly: 12\nSwim: 8\nTotal: 20\nDuck can fly: true',
    testCase: { call: '', expected: 'Fly: 12\nSwim: 8\nTotal: 20\nDuck can fly: true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'power', originalLiteral: '4', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Fly: 15\nSwim: 10\nTotal: 25\nDuck can fly: true',
    },
  },
  {
    id: 'world-11-practice-writerun-payment-states',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write a when over a sealed class with no else, and total only the paid amounts.',
    conceptTags: ['lesson:sealed-classes-sealed-interfaces', 'sealed-class', 'exhaustive-when', 'smart-cast'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Payment States',
    goal: 'A payment can be paid, failed or pending. Print a line for each payment, then the total of the paid amounts.',
    description: 'The sealed class `Payment` and its three cases are in the starter code.\n\n' +
              '1. **Write describe.** Above `main`, write `describe(p: Payment): String`. Use `when (p)` with no `else`. Return "Paid " plus the amount, "Failed: " plus the reason, or "Pending".\n\n' +
              '2. **Make the list.** Create `val payments` with `Paid(first)`, `Failed("card")`, `Pending` and `Paid(25)`.\n\n' +
              '3. **Print and add.** Create `var total = 0`. Loop over `payments` and print `describe(p)`. When `p is Paid`, add `p.amount` to `total`.\n\n' +
              '4. **Print the total.** Join the text with `+`:\n"Paid 40"\n"Failed: card"\n"Pending"\n"Paid 25"\n"Total paid: 65"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write describe.** Use an exhaustive `when` without `else`.',
          '2. **Make the list.** Mix all three cases.',
          '3. **Print and add.** Add the amount of paid ones.',
          '4. **Print the total.** Show the last line.',
        ],
        comments: [
          '// 1. Write describe. Use an exhaustive when without else.',
          '// 2. Make the list. Mix all three cases.',
          '// 3. Print and add. Add the amount of paid ones.',
          '// 4. Print the total. Show the last line.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write describe.**',
          '2. **Make the list.**',
          '3. **Print and add.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write describe.',
          '// 2. Make the list.',
          '// 3. Print and add.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PaymentStates.kt',
    initialCode: `sealed class Payment
class Paid(val amount: Int) : Payment()
class Failed(val reason: String) : Payment()
object Pending : Payment()

// 1. Write describe. Above main, write describe(p: Payment): String. Use when (p) with no else. Return "Paid " plus the amount, "Failed: " plus the reason, or "Pending".

fun main() {
  val first = 40

  // 2. Make the list. Create val payments with Paid(first), Failed("card"), Pending and Paid(25).

  // 3. Print and add. Create var total = 0. Loop over payments and print describe(p). When p is Paid, add p.amount to total.

  // 4. Print the total. Join the text with +: "Paid 40" "Failed: card" "Pending" "Paid 25" "Total paid: 65"
}`,
    solutionCode: `sealed class Payment
class Paid(val amount: Int) : Payment()
class Failed(val reason: String) : Payment()
object Pending : Payment()

fun describe(p: Payment): String {
  return when (p) {
    is Paid -> "Paid " + p.amount
    is Failed -> "Failed: " + p.reason
    Pending -> "Pending"
  }
}

fun main() {
  val first = 40
  val payments = listOf(Paid(first), Failed("card"), Pending, Paid(25))
  var total = 0
  for (p in payments) {
    println(describe(p))
    if (p is Paid) {
      total += p.amount
    }
  }
  println("Total paid: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Paid 40\nFailed: card\nPending\nPaid 25\nTotal paid: 65',
    testCase: { call: '', expected: 'Paid 40\nFailed: card\nPending\nPaid 25\nTotal paid: 65' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'first', originalLiteral: '40', alternateLiteral: '70' }],
      alternateExpectedOutput: 'Paid 70\nFailed: card\nPending\nPaid 25\nTotal paid: 95',
    },
  },
  {
    id: 'world-11-practice-writerun-safe-divide',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Return a sealed result from a function and unwrap it with a when.',
    conceptTags: ['lesson:sealed-classes-sealed-interfaces', 'sealed-interface', 'when-statement', 'smart-cast', 'guard'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Safe Divide',
    goal: 'A division can fail when the divisor is zero. Divide three pairs of numbers. Print the sum of the answers and the number of failures.',
    description: 'The sealed interface `Outcome` with `Success(value)` and `Failure(code)` is in the starter code.\n\n' +
              '1. **Write safeDivide.** Above `main`, write `safeDivide(a: Int, b: Int): Outcome`. When `b` is `0`, return `Failure(1)`. Otherwise return `Success(a / b)`.\n\n' +
              '2. **Make the results.** Create `val results` with `safeDivide(20, 4)`, `safeDivide(7, zero)` and `safeDivide(9, 2)`.\n\n' +
              '3. **Unwrap each result.** Create `var sum = 0` and `var failures = 0`. Loop over `results`. Use `when (r)`. For `is Success`, add `r.value` to `sum`. For `is Failure`, add `1` to `failures`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Sum: 9"\n"Failures: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write safeDivide.** Return `Failure` or `Success`.',
          '2. **Make the results.** Divide three pairs.',
          '3. **Unwrap each result.** Use `when` with `is`.',
          '4. **Print two lines.** Show the sum and the failures.',
        ],
        comments: [
          '// 1. Write safeDivide. Return Failure or Success.',
          '// 2. Make the results. Divide three pairs.',
          '// 3. Unwrap each result. Use when with is.',
          '// 4. Print two lines. Show the sum and the failures.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write safeDivide.**',
          '2. **Make the results.**',
          '3. **Unwrap each result.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write safeDivide.',
          '// 2. Make the results.',
          '// 3. Unwrap each result.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SafeDivide.kt',
    initialCode: `sealed interface Outcome
class Success(val value: Int) : Outcome
class Failure(val code: Int) : Outcome

// 1. Write safeDivide. Above main, write safeDivide(a: Int, b: Int): Outcome. When b is 0, return Failure(1). Otherwise return Success(a / b).

fun main() {
  val zero = 0

  // 2. Make the results. Create val results with safeDivide(20, 4), safeDivide(7, zero) and safeDivide(9, 2).

  // 3. Unwrap each result. Create var sum = 0 and var failures = 0. Loop over results. Use when (r). For is Success, add r.value to sum. For is Failure, add 1 to failures.

  // 4. Print two lines. Join the text with +: "Sum: 9" "Failures: 1"
}`,
    solutionCode: `sealed interface Outcome
class Success(val value: Int) : Outcome
class Failure(val code: Int) : Outcome

fun safeDivide(a: Int, b: Int): Outcome {
  if (b == 0) {
    return Failure(1)
  }
  return Success(a / b)
}

fun main() {
  val zero = 0
  val results = listOf(safeDivide(20, 4), safeDivide(7, zero), safeDivide(9, 2))
  var sum = 0
  var failures = 0
  for (r in results) {
    when (r) {
      is Success -> sum += r.value
      is Failure -> failures += 1
    }
  }
  println("Sum: " + sum)
  println("Failures: " + failures)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Sum: 9\nFailures: 1',
    testCase: { call: '', expected: 'Sum: 9\nFailures: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'zero', originalLiteral: '0', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Sum: 11\nFailures: 0',
    },
  },
  {
    id: 'world-11-practice-writerun-point-copy',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Use a data class: print it, copy it with one change, compare, and destructure.',
    conceptTags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'data-class', 'copy', 'equals', 'destructuring'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Point Copy',
    goal: 'A point has an x and a y. Make a copy that moves the point up. Compare the points and add the new x and y.',
    description: '1. **Write the data class.** Above `main`, write `data class Point(val x: Int, val y: Int)`.\n\n' +
              '2. **Make two points.** Create `val p` as `Point(2, 5)`. Create `val q` with `p.copy(y = p.y + shift)`.\n\n' +
              '3. **Print both points.** Use `println` on each point:\n"Point(x=2, y=5)"\n"Point(x=2, y=8)"\n\n' +
              '4. **Compare.** Print `p == Point(2, 5)`, then `p == q`:\n"true"\n"false"\n\n' +
              '5. **Destructure.** Write `val (x, y) = q`. Print the sum of `x` and `y`:\n"Sum: 10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the data class.** Two `Int` properties.',
          '2. **Make two points.** Use `copy` for `q`.',
          '3. **Print both points.** Print each one.',
          '4. **Compare.** Use `==` twice.',
          '5. **Destructure.** Add `x` and `y`.',
        ],
        comments: [
          '// 1. Write the data class. Two Int properties.',
          '// 2. Make two points. Use copy for q.',
          '// 3. Print both points. Print each one.',
          '// 4. Compare. Use == twice.',
          '// 5. Destructure. Add x and y.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the data class.**',
          '2. **Make two points.**',
          '3. **Print both points.**',
          '4. **Compare.**',
          '5. **Destructure.**',
        ],
        comments: [
          '// 1. Write the data class.',
          '// 2. Make two points.',
          '// 3. Print both points.',
          '// 4. Compare.',
          '// 5. Destructure.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PointCopy.kt',
    initialCode: `// 1. Write the data class. Above main, write data class Point(val x: Int, val y: Int).

fun main() {
  val shift = 3

  // 2. Make two points. Create val p as Point(2, 5). Create val q with p.copy(y = p.y + shift).

  // 3. Print both points. Use println on each point: "Point(x=2, y=5)" "Point(x=2, y=8)"

  // 4. Compare. Print p == Point(2, 5), then p == q: "true" "false"

  // 5. Destructure. Write val (x, y) = q. Print the sum of x and y: "Sum: 10"
}`,
    solutionCode: `data class Point(val x: Int, val y: Int)

fun main() {
  val shift = 3
  val p = Point(2, 5)
  val q = p.copy(y = p.y + shift)
  println(p)
  println(q)
  println(p == Point(2, 5))
  println(p == q)
  val (x, y) = q
  println("Sum: " + (x + y))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Point(x=2, y=5)\nPoint(x=2, y=8)\ntrue\nfalse\nSum: 10',
    testCase: { call: '', expected: 'Point(x=2, y=5)\nPoint(x=2, y=8)\ntrue\nfalse\nSum: 10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'shift', originalLiteral: '3', alternateLiteral: '1' }],
      alternateExpectedOutput: 'Point(x=2, y=5)\nPoint(x=2, y=6)\ntrue\nfalse\nSum: 8',
    },
  },
  {
    id: 'world-11-practice-writerun-level-enum',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Write an enum with a property, pick a level with when, and read name and ordinal.',
    conceptTags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'enum-class', 'enum-property', 'when-ranges', 'ordinal'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Level Enum',
    goal: 'Scores map to levels. Each level is worth points. Print the level and points of each score, the total points, and a position.',
    description: '1. **Write the enum.** Above `main`, write `enum class Level(val points: Int)`. Its constants are `LOW(1)`, `MEDIUM(5)` and `HIGH(10)`.\n\n' +
              '2. **Write levelFor.** Write `levelFor(score: Int, highFrom: Int): Level`. Use `when` with no subject. A score of at least `highFrom` is `HIGH`. A score of at least `40` is `MEDIUM`. Otherwise it is `LOW`.\n\n' +
              '3. **Go through the scores.** Create `var total = 0`. Loop over `scores`. Print the score, " -> ", `level.name`, and the points in brackets. Add the points to `total`.\n\n' +
              '4. **Print the last two lines.** Print `total` and `Level.HIGH.ordinal`:\n"3 -> LOW (1)"\n"55 -> MEDIUM (5)"\n"80 -> HIGH (10)"\n"20 -> LOW (1)"\n"Total: 17"\n"Index of HIGH: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the enum.** Three constants with points.',
          '2. **Write levelFor.** Use `when` and `highFrom`.',
          '3. **Go through the scores.** Print and add the points.',
          '4. **Print the last two lines.** Show the total and the ordinal.',
        ],
        comments: [
          '// 1. Write the enum. Three constants with points.',
          '// 2. Write levelFor. Use when and highFrom.',
          '// 3. Go through the scores. Print and add the points.',
          '// 4. Print the last two lines. Show the total and the ordinal.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the enum.**',
          '2. **Write levelFor.**',
          '3. **Go through the scores.**',
          '4. **Print the last two lines.**',
        ],
        comments: [
          '// 1. Write the enum.',
          '// 2. Write levelFor.',
          '// 3. Go through the scores.',
          '// 4. Print the last two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LevelEnum.kt',
    initialCode: `// 1. Write the enum. Above main, write enum class Level(val points: Int). Its constants are LOW(1), MEDIUM(5) and HIGH(10).

// 2. Write levelFor. Write levelFor(score: Int, highFrom: Int): Level. Use when with no subject. A score of at least highFrom is HIGH. A score of at least 40 is MEDIUM. Otherwise it is LOW.

fun main() {
  val highFrom = 70
  val scores = listOf(3, 55, 80, 20)

  // 3. Go through the scores. Create var total = 0. Loop over scores. Print the score, " -> ", level.name, and the points in brackets. Add the points to total.

  // 4. Print the last two lines. Print total and Level.HIGH.ordinal: "3 -> LOW (1)" "55 -> MEDIUM (5)" "80 -> HIGH (10)" "20 -> LOW (1)" "Total: 17" "Index of HIGH: 2"
}`,
    solutionCode: `enum class Level(val points: Int) {
  LOW(1),
  MEDIUM(5),
  HIGH(10)
}

fun levelFor(score: Int, highFrom: Int): Level {
  return when {
    score >= highFrom -> Level.HIGH
    score >= 40 -> Level.MEDIUM
    else -> Level.LOW
  }
}

fun main() {
  val highFrom = 70
  val scores = listOf(3, 55, 80, 20)
  var total = 0
  for (s in scores) {
    val level = levelFor(s, highFrom)
    println(s.toString() + " -> " + level.name + " (" + level.points + ")")
    total += level.points
  }
  println("Total: " + total)
  println("Index of HIGH: " + Level.HIGH.ordinal)
}`,
    sampleInput: 'main()',
    expectedOutput: '3 -> LOW (1)\n55 -> MEDIUM (5)\n80 -> HIGH (10)\n20 -> LOW (1)\nTotal: 17\nIndex of HIGH: 2',
    testCase: { call: '', expected: '3 -> LOW (1)\n55 -> MEDIUM (5)\n80 -> HIGH (10)\n20 -> LOW (1)\nTotal: 17\nIndex of HIGH: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'highFrom', originalLiteral: '70', alternateLiteral: '50' }],
      alternateExpectedOutput: '3 -> LOW (1)\n55 -> HIGH (10)\n80 -> HIGH (10)\n20 -> LOW (1)\nTotal: 22\nIndex of HIGH: 2',
    },
  },
  {
    id: 'world-11-practice-writerun-order-lines',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write a nested class inside another class and create it with the outer name.',
    conceptTags: ['lesson:nested-classes', 'nested-class', 'qualified-creation', 'no-outer-access'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Order Lines',
    goal: 'An order has lines. Each line has an item and a quantity. Print the cost of each line and the total quantity cost.',
    description: 'The class `Order` is in the starter code. The nested class goes inside it.\n\n' +
              '1. **Write the nested class.** Inside `Order`, write `class Line(val item: String, val qty: Int)`. Add `label(unit: Int): String`. It returns the item, " x", the quantity, " = " and `qty * unit`.\n\n' +
              '2. **Make the first line.** Create `val first` with `Order.Line("pen", 3)`.\n\n' +
              '3. **Make the second line.** Create `val second` with `Order.Line("cap", 2)`.\n\n' +
              '4. **Print three lines.** The total is `(first.qty + second.qty) * unit`:\n"pen x3 = 12"\n"cap x2 = 8"\n"Total: 20"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the nested class.** Add `Line` and `label()`.',
          '2. **Make the first line.** Use `Order.Line`.',
          '3. **Make the second line.** Use `Order.Line`.',
          '4. **Print three lines.** Show both labels and the total.',
        ],
        comments: [
          '// 1. Write the nested class. Add Line and label().',
          '// 2. Make the first line. Use Order.Line.',
          '// 3. Make the second line. Use Order.Line.',
          '// 4. Print three lines. Show both labels and the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the nested class.**',
          '2. **Make the first line.**',
          '3. **Make the second line.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the nested class.',
          '// 2. Make the first line.',
          '// 3. Make the second line.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderLines.kt',
    initialCode: `class Order(val id: Int) {
  // 1. Write the nested class. Inside Order, write class Line(val item: String, val qty: Int). Add label(unit: Int): String. It returns the item, " x", the quantity, " = " and qty * unit.
}

fun main() {
  val unit = 4

  // 2. Make the first line. Create val first with Order.Line("pen", 3).

  // 3. Make the second line. Create val second with Order.Line("cap", 2).

  // 4. Print three lines. The total is (first.qty + second.qty) * unit: "pen x3 = 12" "cap x2 = 8" "Total: 20"
}`,
    solutionCode: `class Order(val id: Int) {
  class Line(val item: String, val qty: Int) {
    fun label(unit: Int): String {
      return item + " x" + qty + " = " + qty * unit
    }
  }
}

fun main() {
  val unit = 4
  val first = Order.Line("pen", 3)
  val second = Order.Line("cap", 2)
  println(first.label(unit))
  println(second.label(unit))
  println("Total: " + (first.qty + second.qty) * unit)
}`,
    sampleInput: 'main()',
    expectedOutput: 'pen x3 = 12\ncap x2 = 8\nTotal: 20',
    testCase: { call: '', expected: 'pen x3 = 12\ncap x2 = 8\nTotal: 20' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'unit', originalLiteral: '4', alternateLiteral: '5' }],
      alternateExpectedOutput: 'pen x3 = 15\ncap x2 = 10\nTotal: 25',
    },
  },
  {
    id: 'world-11-practice-writerun-counter-view',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write an inner class that reads its outer object, and see that each outer object has its own view.',
    conceptTags: ['lesson:inner-classes', 'inner-class', 'outer-state', 'independent-outers'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Counter View',
    goal: 'A counter has a view that shows the count. Change the counter and see the view change. A second counter has its own view.',
    description: 'The class header `Counter(var count: Int)` is in the starter code.\n\n' +
              '1. **Write the class body.** Inside `Counter`, write `fun inc()` that adds `1` to `count`. Also write `inner class View` with `show()`. It returns "Count: " plus `count`.\n\n' +
              '2. **Make the counter and view.** Create `val c` with `Counter(start)`. Create `val v` with `c.View()`.\n\n' +
              '3. **Change the counter.** Call `c.inc()` two times.\n\n' +
              '4. **Show the first view.** Print `v.show()`:\n"Count: 12"\n\n' +
              '5. **Show a second counter.** Create `val other` with `Counter(0)`. Print `other.View().show()`:\n"Count: 0"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class body.** Add `inc()` and the inner `View`.',
          '2. **Make the counter and view.** Use `c.View()`.',
          '3. **Change the counter.** Call `inc()` twice.',
          '4. **Show the first view.** Print `show()`.',
          '5. **Show a second counter.** Use a new `Counter`.',
        ],
        comments: [
          '// 1. Write the class body. Add inc() and the inner View.',
          '// 2. Make the counter and view. Use c.View().',
          '// 3. Change the counter. Call inc() twice.',
          '// 4. Show the first view. Print show().',
          '// 5. Show a second counter. Use a new Counter.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class body.**',
          '2. **Make the counter and view.**',
          '3. **Change the counter.**',
          '4. **Show the first view.**',
          '5. **Show a second counter.**',
        ],
        comments: [
          '// 1. Write the class body.',
          '// 2. Make the counter and view.',
          '// 3. Change the counter.',
          '// 4. Show the first view.',
          '// 5. Show a second counter.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CounterView.kt',
    initialCode: `class Counter(var count: Int) {
  // 1. Write the class body. Inside Counter, write fun inc() that adds 1 to count. Also write inner class View with show(). It returns "Count: " plus count.
}

fun main() {
  val start = 10

  // 2. Make the counter and view. Create val c with Counter(start). Create val v with c.View().

  // 3. Change the counter. Call c.inc() two times.

  // 4. Show the first view. Print v.show(): "Count: 12"

  // 5. Show a second counter. Create val other with Counter(0). Print other.View().show(): "Count: 0"
}`,
    solutionCode: `class Counter(var count: Int) {
  inner class View {
    fun show(): String {
      return "Count: " + count
    }
  }

  fun inc() {
    count += 1
  }
}

fun main() {
  val start = 10
  val c = Counter(start)
  val v = c.View()
  c.inc()
  c.inc()
  println(v.show())
  val other = Counter(0)
  println(other.View().show())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Count: 12\nCount: 0',
    testCase: { call: '', expected: 'Count: 12\nCount: 0' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '10', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Count: 22\nCount: 0',
    },
  },
  {
    id: 'world-11-practice-writerun-id-maker',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write an object that keeps one shared counter and call it by name.',
    conceptTags: ['lesson:object-declarations', 'object-declaration', 'singleton-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'ID Maker',
    goal: 'A program makes ids. Every id is a step bigger than the last one. Print three ids and the last one.',
    description: '1. **Write the object.** Above `main`, write `object IdMaker`. Give it `var last = 100`. Add `next(step: Int): Int`. It adds `step` to `last` and returns `last`.\n\n' +
              '2. **Make the first id.** Print `IdMaker.next(step)`:\n"105"\n\n' +
              '3. **Make the second id.** Print `IdMaker.next(step)` again:\n"110"\n\n' +
              '4. **Make the third id.** Print `IdMaker.next(step)` once more:\n"115"\n\n' +
              '5. **Print the last id.** Print `IdMaker.last`:\n"Last: 115"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the object.** Add `last` and `next()`.',
          '2. **Make the first id.** Call `IdMaker.next(step)`.',
          '3. **Make the second id.** Call it again.',
          '4. **Make the third id.** Call it again.',
          '5. **Print the last id.** Use `IdMaker.last`.',
        ],
        comments: [
          '// 1. Write the object. Add last and next().',
          '// 2. Make the first id. Call IdMaker.next(step).',
          '// 3. Make the second id. Call it again.',
          '// 4. Make the third id. Call it again.',
          '// 5. Print the last id. Use IdMaker.last.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the object.**',
          '2. **Make the first id.**',
          '3. **Make the second id.**',
          '4. **Make the third id.**',
          '5. **Print the last id.**',
        ],
        comments: [
          '// 1. Write the object.',
          '// 2. Make the first id.',
          '// 3. Make the second id.',
          '// 4. Make the third id.',
          '// 5. Print the last id.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'IdMaker.kt',
    initialCode: `// 1. Write the object. Above main, write object IdMaker. Give it var last = 100. Add next(step: Int): Int. It adds step to last and returns last.

fun main() {
  val step = 5

  // 2. Make the first id. Print IdMaker.next(step): "105"

  // 3. Make the second id. Print IdMaker.next(step) again: "110"

  // 4. Make the third id. Print IdMaker.next(step) once more: "115"

  // 5. Print the last id. Print IdMaker.last: "Last: 115"
}`,
    solutionCode: `object IdMaker {
  var last = 100

  fun next(step: Int): Int {
    last += step
    return last
  }
}

fun main() {
  val step = 5
  println(IdMaker.next(step))
  println(IdMaker.next(step))
  println(IdMaker.next(step))
  println("Last: " + IdMaker.last)
}`,
    sampleInput: 'main()',
    expectedOutput: '105\n110\n115\nLast: 115',
    testCase: { call: '', expected: '105\n110\n115\nLast: 115' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'step', originalLiteral: '5', alternateLiteral: '10' }],
      alternateExpectedOutput: '110\n120\n130\nLast: 130',
    },
  },
  {
    id: 'world-11-practice-writerun-shared-stats',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Write an object that collects numbers from a loop and work out an average.',
    conceptTags: ['lesson:object-declarations', 'object-declaration', 'shared-state', 'integer-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shared Stats',
    goal: 'An object collects numbers and counts them. Add four numbers. Print the total, the count and the average.',
    description: '1. **Write the object.** Above `main`, write `object Stats`. Give it `var total = 0` and `var calls = 0`. Add `add(n: Int)`. It adds `n` to `total` and `1` to `calls`.\n\n' +
              '2. **Add the numbers.** Loop `i` from `1` to `rounds`. Each time, call `Stats.add(i * 10)`.\n\n' +
              '3. **Print the totals.** Print `Stats.total` and `Stats.calls`:\n"Total: 100"\n"Calls: 4"\n\n' +
              '4. **Print the average.** Divide `Stats.total` by `Stats.calls`. Int division drops the fraction:\n"Average: 25"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the object.** Two counters and `add()`.',
          '2. **Add the numbers.** Add `i * 10` each round.',
          '3. **Print the totals.** Show the total and the calls.',
          '4. **Print the average.** Divide the two.',
        ],
        comments: [
          '// 1. Write the object. Two counters and add().',
          '// 2. Add the numbers. Add i * 10 each round.',
          '// 3. Print the totals. Show the total and the calls.',
          '// 4. Print the average. Divide the two.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the object.**',
          '2. **Add the numbers.**',
          '3. **Print the totals.**',
          '4. **Print the average.**',
        ],
        comments: [
          '// 1. Write the object.',
          '// 2. Add the numbers.',
          '// 3. Print the totals.',
          '// 4. Print the average.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SharedStats.kt',
    initialCode: `// 1. Write the object. Above main, write object Stats. Give it var total = 0 and var calls = 0. Add add(n: Int). It adds n to total and 1 to calls.

fun main() {
  val rounds = 4

  // 2. Add the numbers. Loop i from 1 to rounds. Each time, call Stats.add(i * 10).

  // 3. Print the totals. Print Stats.total and Stats.calls: "Total: 100" "Calls: 4"

  // 4. Print the average. Divide Stats.total by Stats.calls. Int division drops the fraction: "Average: 25"
}`,
    solutionCode: `object Stats {
  var total = 0
  var calls = 0

  fun add(n: Int) {
    total += n
    calls += 1
  }
}

fun main() {
  val rounds = 4
  for (i in 1..rounds) {
    Stats.add(i * 10)
  }
  println("Total: " + Stats.total)
  println("Calls: " + Stats.calls)
  println("Average: " + Stats.total / Stats.calls)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Total: 100\nCalls: 4\nAverage: 25',
    testCase: { call: '', expected: 'Total: 100\nCalls: 4\nAverage: 25' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'rounds', originalLiteral: '4', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Total: 60\nCalls: 3\nAverage: 20',
    },
  },
  {
    id: 'world-11-practice-writerun-user-factory',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write a companion object with a constant and factory functions.',
    conceptTags: ['lesson:companion-objects', 'companion-object', 'const-val', 'factory-function'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'User Factory',
    goal: 'Users have a level, and no level may go above a maximum. Make a user with a capped level and a guest. Print them.',
    description: 'The class header `User(val name: String, val level: Int)` is in the starter code.\n\n' +
              '1. **Write the companion.** Inside `User`, write `companion object`. Add `const val MAX = 5`. Add `create(name: String, level: Int): User`. When `level` is above `MAX`, use `MAX` as the level. Add `guest()`. It returns a user named "guest" with level `0`.\n\n' +
              '2. **Create Ana.** Create `val ana` with `User.create("Ana", wanted)`.\n\n' +
              '3. **Create the guest.** Create `val guest` with `User.guest()`.\n\n' +
              '4. **Print three lines.** Use `User.MAX` for the last line:\n"Ana level 5"\n"guest level 0"\n"Max: 5"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the companion.** Add `MAX`, `create()` and `guest()`.',
          '2. **Create Ana.** Call `User.create`.',
          '3. **Create the guest.** Call `User.guest()`.',
          '4. **Print three lines.** Show both users and `MAX`.',
        ],
        comments: [
          '// 1. Write the companion. Add MAX, create() and guest().',
          '// 2. Create Ana. Call User.create.',
          '// 3. Create the guest. Call User.guest().',
          '// 4. Print three lines. Show both users and MAX.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the companion.**',
          '2. **Create Ana.**',
          '3. **Create the guest.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the companion.',
          '// 2. Create Ana.',
          '// 3. Create the guest.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'UserFactory.kt',
    initialCode: `class User(val name: String, val level: Int) {
  // 1. Write the companion. Inside User, write companion object. Add const val MAX = 5. Add create(name: String, level: Int): User. When level is above MAX, use MAX as the level. Add guest(). It returns a user named "guest" with level 0.
}

fun main() {
  val wanted = 9

  // 2. Create Ana. Create val ana with User.create("Ana", wanted).

  // 3. Create the guest. Create val guest with User.guest().

  // 4. Print three lines. Use User.MAX for the last line: "Ana level 5" "guest level 0" "Max: 5"
}`,
    solutionCode: `class User(val name: String, val level: Int) {
  companion object {
    const val MAX = 5

    fun create(name: String, level: Int): User {
      if (level > MAX) {
        return User(name, MAX)
      }
      return User(name, level)
    }

    fun guest(): User {
      return User("guest", 0)
    }
  }
}

fun main() {
  val wanted = 9
  val ana = User.create("Ana", wanted)
  val guest = User.guest()
  println(ana.name + " level " + ana.level)
  println(guest.name + " level " + guest.level)
  println("Max: " + User.MAX)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana level 5\nguest level 0\nMax: 5',
    testCase: { call: '', expected: 'Ana level 5\nguest level 0\nMax: 5' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'wanted', originalLiteral: '9', alternateLiteral: '3' }],
      alternateExpectedOutput: 'Ana level 3\nguest level 0\nMax: 5',
    },
  },
  {
    id: 'world-11-practice-writerun-ticket-counter',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Use a companion object to count how many objects the class has made.',
    conceptTags: ['lesson:companion-objects', 'companion-object', 'shared-counter', 'instance-factory'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Ticket Counter',
    goal: 'A class makes numbered tickets. Count how many tickets it has made. Print each ticket number and the count.',
    description: 'The class header `Ticket(val number: Int)` is in the starter code.\n\n' +
              '1. **Write the companion.** Inside `Ticket`, write `companion object`. Add `var issued = 0`. Add `issue(): Ticket`. It adds `1` to `issued` and returns `Ticket(issued)`.\n\n' +
              '2. **Issue the tickets.** Loop `i` from `1` to `count`. Each time, create `val t` with `Ticket.issue()` and print "Ticket " plus `t.number`.\n\n' +
              '3. **Print the count.** Print `Ticket.issued`:\n"Ticket 1"\n"Ticket 2"\n"Ticket 3"\n"Issued: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the companion.** Add `issued` and `issue()`.',
          '2. **Issue the tickets.** Loop and print each number.',
          '3. **Print the count.** Use `Ticket.issued`.',
        ],
        comments: [
          '// 1. Write the companion. Add issued and issue().',
          '// 2. Issue the tickets. Loop and print each number.',
          '// 3. Print the count. Use Ticket.issued.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the companion.**',
          '2. **Issue the tickets.**',
          '3. **Print the count.**',
        ],
        comments: [
          '// 1. Write the companion.',
          '// 2. Issue the tickets.',
          '// 3. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TicketCounter.kt',
    initialCode: `class Ticket(val number: Int) {
  // 1. Write the companion. Inside Ticket, write companion object. Add var issued = 0. Add issue(): Ticket. It adds 1 to issued and returns Ticket(issued).
}

fun main() {
  val count = 3

  // 2. Issue the tickets. Loop i from 1 to count. Each time, create val t with Ticket.issue() and print "Ticket " plus t.number.

  // 3. Print the count. Print Ticket.issued: "Ticket 1" "Ticket 2" "Ticket 3" "Issued: 3"
}`,
    solutionCode: `class Ticket(val number: Int) {
  companion object {
    var issued = 0

    fun issue(): Ticket {
      issued += 1
      return Ticket(issued)
    }
  }
}

fun main() {
  val count = 3
  for (i in 1..count) {
    val t = Ticket.issue()
    println("Ticket " + t.number)
  }
  println("Issued: " + Ticket.issued)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ticket 1\nTicket 2\nTicket 3\nIssued: 3',
    testCase: { call: '', expected: 'Ticket 1\nTicket 2\nTicket 3\nIssued: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'count', originalLiteral: '3', alternateLiteral: '2' }],
      alternateExpectedOutput: 'Ticket 1\nTicket 2\nIssued: 2',
    },
  },
  {
    id: 'world-11-practice-writerun-text-helpers',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write three extension functions on String and Int and call them like members.',
    conceptTags: ['lesson:extension-functions', 'extension-function', 'receiver', 'this'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Text Helpers',
    goal: 'Add new helpers to String and Int. Shout a word, square a number and check if it is even. Print the results.',
    description: '1. **Write shout.** Above `main`, write `fun String.shout(): String`. It returns `this.uppercase()` plus an exclamation mark.\n\n' +
              '2. **Write squared.** Write `fun Int.squared(): Int`. It returns `this * this`.\n\n' +
              '3. **Write isEven.** Write `fun Int.isEven(): Boolean`. It returns `this % 2 == 0`.\n\n' +
              '4. **Print three lines.** Call `"hello".shout()`, then `n.squared()`, then `n.isEven()`:\n"HELLO!"\n"49"\n"false"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write shout.** Upper case plus an exclamation mark.',
          '2. **Write squared.** Multiply `this` by itself.',
          '3. **Write isEven.** Use `%`.',
          '4. **Print three lines.** Call each helper.',
        ],
        comments: [
          '// 1. Write shout. Upper case plus an exclamation mark.',
          '// 2. Write squared. Multiply this by itself.',
          '// 3. Write isEven. Use %.',
          '// 4. Print three lines. Call each helper.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write shout.**',
          '2. **Write squared.**',
          '3. **Write isEven.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write shout.',
          '// 2. Write squared.',
          '// 3. Write isEven.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TextHelpers.kt',
    initialCode: `// 1. Write shout. Above main, write fun String.shout(): String. It returns this.uppercase() plus an exclamation mark.

// 2. Write squared. Write fun Int.squared(): Int. It returns this * this.

// 3. Write isEven. Write fun Int.isEven(): Boolean. It returns this % 2 == 0.

fun main() {
  val n = 7

  // 4. Print three lines. Call "hello".shout(), then n.squared(), then n.isEven(): "HELLO!" "49" "false"
}`,
    solutionCode: `fun String.shout(): String {
  return this.uppercase() + "!"
}

fun Int.squared(): Int {
  return this * this
}

fun Int.isEven(): Boolean {
  return this % 2 == 0
}

fun main() {
  val n = 7
  println("hello".shout())
  println(n.squared())
  println(n.isEven())
}`,
    sampleInput: 'main()',
    expectedOutput: 'HELLO!\n49\nfalse',
    testCase: { call: '', expected: 'HELLO!\n49\nfalse' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'n', originalLiteral: '7', alternateLiteral: '8' }],
      alternateExpectedOutput: 'HELLO!\n64\ntrue',
    },
  },
  {
    id: 'world-11-practice-writerun-list-helpers',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Write extension functions on a list that add things up and filter with a loop.',
    conceptTags: ['lesson:extension-functions', 'extension-function', 'list-receiver', 'accumulator', 'filter-loop'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'List Helpers',
    goal: 'Add two helpers to lists of numbers. One adds up the squares. One keeps the numbers above a limit. Print the results.',
    description: '1. **Write sumOfSquares.** Above `main`, write `fun List<Int>.sumOfSquares(): Int`. Loop over `this` and add each `n * n` to a total. Return it.\n\n' +
              '2. **Write above.** Write `fun List<Int>.above(limit: Int): List<Int>`. Make a `mutableListOf<Int>()`. Loop over `this` and add each `n` that is above `limit`. Return the list.\n\n' +
              '3. **Call above.** Create `val big` with `numbers.above(limit)`.\n\n' +
              '4. **Print two lines.** Use a string template for the list:\n"Squares: 114"\n"Above 4: [5, 8]"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write sumOfSquares.** Loop over `this` and add squares.',
          '2. **Write above.** Loop and keep numbers above `limit`.',
          '3. **Call above.** Use `limit`.',
          '4. **Print two lines.** Show the sum and the list.',
        ],
        comments: [
          '// 1. Write sumOfSquares. Loop over this and add squares.',
          '// 2. Write above. Loop and keep numbers above limit.',
          '// 3. Call above. Use limit.',
          '// 4. Print two lines. Show the sum and the list.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write sumOfSquares.**',
          '2. **Write above.**',
          '3. **Call above.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write sumOfSquares.',
          '// 2. Write above.',
          '// 3. Call above.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ListHelpers.kt',
    initialCode: `// 1. Write sumOfSquares. Above main, write fun List<Int>.sumOfSquares(): Int. Loop over this and add each n * n to a total. Return it.

// 2. Write above. Write fun List<Int>.above(limit: Int): List<Int>. Make a mutableListOf<Int>(). Loop over this and add each n that is above limit. Return the list.

fun main() {
  val limit = 4
  val numbers = listOf(3, 4, 5, 8)

  // 3. Call above. Create val big with numbers.above(limit).

  // 4. Print two lines. Use a string template for the list: "Squares: 114" "Above 4: [5, 8]"
}`,
    solutionCode: `fun List<Int>.sumOfSquares(): Int {
  var total = 0
  for (n in this) {
    total += n * n
  }
  return total
}

fun List<Int>.above(limit: Int): List<Int> {
  val result = mutableListOf<Int>()
  for (n in this) {
    if (n > limit) {
      result.add(n)
    }
  }
  return result
}

fun main() {
  val limit = 4
  val numbers = listOf(3, 4, 5, 8)
  val big = numbers.above(limit)
  println("Squares: " + numbers.sumOfSquares())
  println("Above $limit: $big")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Squares: 114\nAbove 4: [5, 8]',
    testCase: { call: '', expected: 'Squares: 114\nAbove 4: [5, 8]' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'limit', originalLiteral: '4', alternateLiteral: '6' }],
      alternateExpectedOutput: 'Squares: 114\nAbove 6: [8]',
    },
  },
  {
    id: 'world-11-practice-writerun-word-props',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write extension properties with getters and read them like normal properties.',
    conceptTags: ['lesson:extension-properties', 'extension-property', 'getter', 'receiver'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Word Properties',
    goal: 'Add new properties to String and Int. Count the words of a sentence, get its first word, and double a number. Print them.',
    description: '1. **Write wordCount.** Above `main`, write `val String.wordCount: Int` with a getter. The getter returns the size of `this.split(" ")`.\n\n' +
              '2. **Write firstWord.** Write `val String.firstWord: String` with a getter. The getter returns the first item of `this.split(" ")`.\n\n' +
              '3. **Write doubled.** Write `val Int.doubled: Int` with a getter. The getter returns `this * 2`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Words: 4"\n"First: kotlin"\n"Doubled: 42"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write wordCount.** Count the parts of `split(" ")`.',
          '2. **Write firstWord.** Take the first part.',
          '3. **Write doubled.** Multiply `this` by `2`.',
          '4. **Print three lines.** Read each property.',
        ],
        comments: [
          '// 1. Write wordCount. Count the parts of split(" ").',
          '// 2. Write firstWord. Take the first part.',
          '// 3. Write doubled. Multiply this by 2.',
          '// 4. Print three lines. Read each property.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write wordCount.**',
          '2. **Write firstWord.**',
          '3. **Write doubled.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write wordCount.',
          '// 2. Write firstWord.',
          '// 3. Write doubled.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'WordProps.kt',
    initialCode: `// 1. Write wordCount. Above main, write val String.wordCount: Int with a getter. The getter returns the size of this.split(" ").

// 2. Write firstWord. Write val String.firstWord: String with a getter. The getter returns the first item of this.split(" ").

// 3. Write doubled. Write val Int.doubled: Int with a getter. The getter returns this * 2.

fun main() {
  val base = 21
  val sentence = "kotlin makes code short"

  // 4. Print three lines. Join the text with +: "Words: 4" "First: kotlin" "Doubled: 42"
}`,
    solutionCode: `val String.wordCount: Int
  get() = this.split(" ").size

val String.firstWord: String
  get() = this.split(" ")[0]

val Int.doubled: Int
  get() = this * 2

fun main() {
  val base = 21
  val sentence = "kotlin makes code short"
  println("Words: " + sentence.wordCount)
  println("First: " + sentence.firstWord)
  println("Doubled: " + base.doubled)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Words: 4\nFirst: kotlin\nDoubled: 42',
    testCase: { call: '', expected: 'Words: 4\nFirst: kotlin\nDoubled: 42' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '21', alternateLiteral: '30' }],
      alternateExpectedOutput: 'Words: 4\nFirst: kotlin\nDoubled: 60',
    },
  },
  {
    id: 'world-11-practice-writerun-boosted-scorer',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Write a class that gets its interface from another object with by, and adds one more function.',
    conceptTags: ['lesson:delegation', 'class-delegation', 'by-keyword', 'extra-member'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Boosted Scorer',
    goal: 'A plain scorer returns the number it gets. Build a boosted scorer that reuses it and adds an extra amount. Print both scores.',
    description: 'The interface `Scorer` and the class `Plain` are in the starter code.\n\n' +
              '1. **Write the wrapper.** Above `main`, write `class Boosted(private val base: Scorer, val extra: Int)`. Make it implement `Scorer by base`. Add `boosted(n: Int): Int` that returns `score(n) + extra`.\n\n' +
              '2. **Create it.** Create `val b` with `Boosted(Plain(), extra)`.\n\n' +
              '3. **Print the plain score.** Print `b.score(10)`. This call is forwarded to `Plain`:\n"10"\n\n' +
              '4. **Print the boosted score.** Print `b.boosted(10)`:\n"17"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the wrapper.** Use `Scorer by base` and add `boosted()`.',
          '2. **Create it.** Wrap a `Plain`.',
          '3. **Print the plain score.** Call `score(10)`.',
          '4. **Print the boosted score.** Call `boosted(10)`.',
        ],
        comments: [
          '// 1. Write the wrapper. Use Scorer by base and add boosted().',
          '// 2. Create it. Wrap a Plain.',
          '// 3. Print the plain score. Call score(10).',
          '// 4. Print the boosted score. Call boosted(10).',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the wrapper.**',
          '2. **Create it.**',
          '3. **Print the plain score.**',
          '4. **Print the boosted score.**',
        ],
        comments: [
          '// 1. Write the wrapper.',
          '// 2. Create it.',
          '// 3. Print the plain score.',
          '// 4. Print the boosted score.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BoostedScorer.kt',
    initialCode: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

// 1. Write the wrapper. Above main, write class Boosted(private val base: Scorer, val extra: Int). Make it implement Scorer by base. Add boosted(n: Int): Int that returns score(n) + extra.

fun main() {
  val extra = 7

  // 2. Create it. Create val b with Boosted(Plain(), extra).

  // 3. Print the plain score. Print b.score(10). This call is forwarded to Plain: "10"

  // 4. Print the boosted score. Print b.boosted(10): "17"
}`,
    solutionCode: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Boosted(private val base: Scorer, val extra: Int) : Scorer by base {
  fun boosted(n: Int): Int {
    return score(n) + extra
  }
}

fun main() {
  val extra = 7
  val b = Boosted(Plain(), extra)
  println(b.score(10))
  println(b.boosted(10))
}`,
    sampleInput: 'main()',
    expectedOutput: '10\n17',
    testCase: { call: '', expected: '10\n17' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extra', originalLiteral: '7', alternateLiteral: '3' }],
      alternateExpectedOutput: '10\n13',
    },
  },
  {
    id: 'world-11-practice-writerun-lazy-and-watch',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Use lazy for a property that is worked out once, and observable to watch changes.',
    conceptTags: ['lesson:delegated-properties', 'lazy', 'observable', 'delegated-property'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Lazy and Watch',
    goal: 'A panel has a value that is worked out only when it is first used. It also has a score that prints a message each time it changes. Run both.',
    description: 'The import for `Delegates` and the class header `Panel(val base: Int)` are in the starter code.\n\n' +
              '1. **Write the lazy property.** Inside `Panel`, write `val total: Int by lazy { ... }`. Inside the braces, print "computing", then make the last line `base * 2`.\n\n' +
              '2. **Write the watched score.** Inside `Panel`, write `var score: Int by Delegates.observable(0) { _, old, new -> ... }`. Inside, print "score ", `old`, " -> " and `new`.\n\n' +
              '3. **Read the lazy property.** Print "Before", then print `p.total` two times:\n"Before"\n"computing"\n"42"\n"42"\n\n' +
              '4. **Change the score.** Set `p.score` to `5`, then to `9`:\n"score 0 -> 5"\n"score 5 -> 9"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the lazy property.** Print once, then return `base * 2`.',
          '2. **Write the watched score.** Print the old and new value.',
          '3. **Read the lazy property.** Print `p.total` twice.',
          '4. **Change the score.** Set it two times.',
        ],
        comments: [
          '// 1. Write the lazy property. Print once, then return base * 2.',
          '// 2. Write the watched score. Print the old and new value.',
          '// 3. Read the lazy property. Print p.total twice.',
          '// 4. Change the score. Set it two times.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the lazy property.**',
          '2. **Write the watched score.**',
          '3. **Read the lazy property.**',
          '4. **Change the score.**',
        ],
        comments: [
          '// 1. Write the lazy property.',
          '// 2. Write the watched score.',
          '// 3. Read the lazy property.',
          '// 4. Change the score.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LazyAndWatch.kt',
    initialCode: `import kotlin.properties.Delegates

class Panel(val base: Int) {
  // 1. Write the lazy property. Inside Panel, write val total: Int by lazy { ... }. Inside the braces, print "computing", then make the last line base * 2.

  // 2. Write the watched score. Inside Panel, write var score: Int by Delegates.observable(0) { _, old, new -> ... }. Inside, print "score ", old, " -> " and new.
}

fun main() {
  val base = 21
  val p = Panel(base)

  // 3. Read the lazy property. Print "Before", then print p.total two times: "Before" "computing" "42" "42"

  // 4. Change the score. Set p.score to 5, then to 9: "score 0 -> 5" "score 5 -> 9"
}`,
    solutionCode: `import kotlin.properties.Delegates

class Panel(val base: Int) {
  val total: Int by lazy {
    println("computing")
    base * 2
  }

  var score: Int by Delegates.observable(0) { _, old, new ->
    println("score " + old + " -> " + new)
  }
}

fun main() {
  val base = 21
  val p = Panel(base)
  println("Before")
  println(p.total)
  println(p.total)
  p.score = 5
  p.score = 9
}`,
    sampleInput: 'main()',
    expectedOutput: 'Before\ncomputing\n42\n42\nscore 0 -> 5\nscore 5 -> 9',
    testCase: { call: '', expected: 'Before\ncomputing\n42\n42\nscore 0 -> 5\nscore 5 -> 9' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '21', alternateLiteral: '10' }],
      alternateExpectedOutput: 'Before\ncomputing\n20\n20\nscore 0 -> 5\nscore 5 -> 9',
    },
  },
  {
    id: 'world-11-practice-writerun-age-guard',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Use vetoable to refuse some changes to a property.',
    conceptTags: ['lesson:delegated-properties', 'vetoable', 'delegated-property', 'class-property'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Age Guard',
    goal: 'A profile only accepts a new age when it is at least a minimum age. Try three ages. Print the age that is kept, and the minimum.',
    description: 'The import for `Delegates` and the class header `Profile(val minAge: Int)` are in the starter code.\n\n' +
              '1. **Write the guarded age.** Inside `Profile`, write `var age: Int by Delegates.vetoable(18) { _, _, new -> ... }`. The last line inside is `new >= minAge`.\n\n' +
              '2. **Try the first age.** Set `p.age` to `25`.\n\n' +
              '3. **Try two more ages.** Set `p.age` to `12`, then to `20`.\n\n' +
              '4. **Print two lines.** Join the text with `+`:\n"Age: 20"\n"Min age: 18"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the guarded age.** Accept only when `new >= minAge`.',
          '2. **Try the first age.** Use `25`.',
          '3. **Try two more ages.** Use `12` and `20`.',
          '4. **Print two lines.** Show the age and the minimum.',
        ],
        comments: [
          '// 1. Write the guarded age. Accept only when new >= minAge.',
          '// 2. Try the first age. Use 25.',
          '// 3. Try two more ages. Use 12 and 20.',
          '// 4. Print two lines. Show the age and the minimum.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the guarded age.**',
          '2. **Try the first age.**',
          '3. **Try two more ages.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the guarded age.',
          '// 2. Try the first age.',
          '// 3. Try two more ages.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AgeGuard.kt',
    initialCode: `import kotlin.properties.Delegates

class Profile(val minAge: Int) {
  // 1. Write the guarded age. Inside Profile, write var age: Int by Delegates.vetoable(18) { _, _, new -> ... }. The last line inside is new >= minAge.
}

fun main() {
  val minAge = 18
  val p = Profile(minAge)

  // 2. Try the first age. Set p.age to 25.

  // 3. Try two more ages. Set p.age to 12, then to 20.

  // 4. Print two lines. Join the text with +: "Age: 20" "Min age: 18"
}`,
    solutionCode: `import kotlin.properties.Delegates

class Profile(val minAge: Int) {
  var age: Int by Delegates.vetoable(18) { _, _, new ->
    new >= minAge
  }
}

fun main() {
  val minAge = 18
  val p = Profile(minAge)
  p.age = 25
  p.age = 12
  p.age = 20
  println("Age: " + p.age)
  println("Min age: " + p.minAge)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Age: 20\nMin age: 18',
    testCase: { call: '', expected: 'Age: 20\nMin age: 18' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'minAge', originalLiteral: '18', alternateLiteral: '22' }],
      alternateExpectedOutput: 'Age: 25\nMin age: 22',
    },
  },
  {
    id: 'world-11-practice-writerun-safe-account',
    worldId: 'world-11',
    difficulty: 'medium',
    summary: 'Keep a balance private and change it only through functions that check the rules.',
    conceptTags: ['lesson:visibility-and-api-design', 'private-property', 'public-api', 'guarded-change'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Safe Account',
    goal: 'A bank account hides its balance. Money goes in and out only through functions. A withdrawal that is too big is refused.',
    description: '1. **Write the class.** Above `main`, write `class Account(private var balance: Int)`. Add `deposit(n: Int)` that adds `n`. Add `withdraw(n: Int): Boolean`. When `n` is above `balance`, return `false`. Otherwise subtract `n` and return `true`. Add `show(): String` that returns "Balance: " plus `balance`.\n\n' +
              '2. **Make the account.** Create `val acc` with `Account(0)`. Call `acc.deposit(100)`.\n\n' +
              '3. **Withdraw 30.** Print "Withdraw 30: " plus `acc.withdraw(30)`:\n"Withdraw 30: true"\n\n' +
              '4. **Withdraw the amount.** Print "Withdraw ", `amount`, ": " and `acc.withdraw(amount)`:\n"Withdraw 120: false"\n\n' +
              '5. **Show the balance.** Print `acc.show()`:\n"Balance: 70"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** Private `balance` with three functions.',
          '2. **Make the account.** Start at `0`, then deposit `100`.',
          '3. **Withdraw 30.** Print the result.',
          '4. **Withdraw the amount.** Print the result.',
          '5. **Show the balance.** Print `show()`.',
        ],
        comments: [
          '// 1. Write the class. Private balance with three functions.',
          '// 2. Make the account. Start at 0, then deposit 100.',
          '// 3. Withdraw 30. Print the result.',
          '// 4. Withdraw the amount. Print the result.',
          '// 5. Show the balance. Print show().',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Make the account.**',
          '3. **Withdraw 30.**',
          '4. **Withdraw the amount.**',
          '5. **Show the balance.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Make the account.',
          '// 3. Withdraw 30.',
          '// 4. Withdraw the amount.',
          '// 5. Show the balance.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SafeAccount.kt',
    initialCode: `// 1. Write the class. Above main, write class Account(private var balance: Int). Add deposit(n: Int) that adds n. Add withdraw(n: Int): Boolean. When n is above balance, return false. Otherwise subtract n and return true. Add show(): String that returns "Balance: " plus balance.

fun main() {
  val amount = 120

  // 2. Make the account. Create val acc with Account(0). Call acc.deposit(100).

  // 3. Withdraw 30. Print "Withdraw 30: " plus acc.withdraw(30): "Withdraw 30: true"

  // 4. Withdraw the amount. Print "Withdraw ", amount, ": " and acc.withdraw(amount): "Withdraw 120: false"

  // 5. Show the balance. Print acc.show(): "Balance: 70"
}`,
    solutionCode: `class Account(private var balance: Int) {
  fun deposit(n: Int) {
    balance += n
  }

  fun withdraw(n: Int): Boolean {
    if (n > balance) {
      return false
    }
    balance -= n
    return true
  }

  fun show(): String {
    return "Balance: " + balance
  }
}

fun main() {
  val amount = 120
  val acc = Account(0)
  acc.deposit(100)
  println("Withdraw 30: " + acc.withdraw(30))
  println("Withdraw " + amount + ": " + acc.withdraw(amount))
  println(acc.show())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Withdraw 30: true\nWithdraw 120: false\nBalance: 70',
    testCase: { call: '', expected: 'Withdraw 30: true\nWithdraw 120: false\nBalance: 70' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'amount', originalLiteral: '120', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Withdraw 30: true\nWithdraw 60: true\nBalance: 10',
    },
  },
  {
    id: 'world-11-practice-writerun-tick-timer',
    worldId: 'world-11',
    difficulty: 'hard',
    summary: 'Use a private setter and a private function, and show only a public report.',
    conceptTags: ['lesson:visibility-and-api-design', 'private-set', 'private-function', 'public-api'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Tick Timer',
    goal: 'A timer counts ticks. Other code can read the count but not change it. Tick the timer and print its report.',
    description: 'The class header `Timer` is in the starter code.\n\n' +
              '1. **Write the counter.** Inside `Timer`, write `var ticks = 0` with `private set`. Add `tick()` that adds `1` to `ticks`.\n\n' +
              '2. **Write the report.** Add `private fun label(): String` that returns "Timer ticks: ". Add `report(): String` that returns `label()` plus `ticks`.\n\n' +
              '3. **Tick the timer.** Create `val timer` with `Timer()`. Loop `i` from `1` to `times` and call `timer.tick()`.\n\n' +
              '4. **Print two lines.** Print `timer.ticks`, then `timer.report()`:\n"Ticks: 3"\n"Timer ticks: 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the counter.** Add `ticks` with a private setter, and `tick()`.',
          '2. **Write the report.** Add a private label and `report()`.',
          '3. **Tick the timer.** Loop `times` times.',
          '4. **Print two lines.** Show the count and the report.',
        ],
        comments: [
          '// 1. Write the counter. Add ticks with a private setter, and tick().',
          '// 2. Write the report. Add a private label and report().',
          '// 3. Tick the timer. Loop times times.',
          '// 4. Print two lines. Show the count and the report.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the counter.**',
          '2. **Write the report.**',
          '3. **Tick the timer.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write the counter.',
          '// 2. Write the report.',
          '// 3. Tick the timer.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'TickTimer.kt',
    initialCode: `class Timer {
  // 1. Write the counter. Inside Timer, write var ticks = 0 with private set. Add tick() that adds 1 to ticks.

  // 2. Write the report. Add private fun label(): String that returns "Timer ticks: ". Add report(): String that returns label() plus ticks.
}

fun main() {
  val times = 3

  // 3. Tick the timer. Create val timer with Timer(). Loop i from 1 to times and call timer.tick().

  // 4. Print two lines. Print timer.ticks, then timer.report(): "Ticks: 3" "Timer ticks: 3"
}`,
    solutionCode: `class Timer {
  var ticks = 0
    private set

  fun tick() {
    ticks += 1
  }

  private fun label(): String {
    return "Timer ticks: "
  }

  fun report(): String {
    return label() + ticks
  }
}

fun main() {
  val times = 3
  val timer = Timer()
  for (i in 1..times) {
    timer.tick()
  }
  println("Ticks: " + timer.ticks)
  println(timer.report())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ticks: 3\nTimer ticks: 3',
    testCase: { call: '', expected: 'Ticks: 3\nTimer ticks: 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'times', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Ticks: 5\nTimer ticks: 5',
    },
  },
];

export const WORLD_11_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-11-practice-debug-closed-parent',
    worldId: 'world-11',
    conceptTags: ['lesson:inheritance-abstract-classes', 'final-class', 'open-modifier'],
    summary: 'A class that is not open cannot be extended.',
    title: 'Fix the Closed Parent',
    subtitle: 'The program should print "Rex says Woof", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a class must be open to be inherited',
    brokenCode: `class Animal(val name: String) {
  open fun sound(): String {
    return "..."
  }
}

class Dog(name: String) : Animal(name) {
  override fun sound(): String {
    return "Woof"
  }
}

fun main() {
  val d = Dog("Rex")
  println(d.name + " says " + d.sound())
}`,
    fixedCode: `open class Animal(val name: String) {
  open fun sound(): String {
    return "..."
  }
}

class Dog(name: String) : Animal(name) {
  override fun sound(): String {
    return "Woof"
  }
}

fun main() {
  val d = Dog("Rex")
  println(d.name + " says " + d.sound())
}`,
    expectedOutput: 'Rex says Woof',
    hints: [
              'Look at the line where `Dog` extends `Animal`. What does Kotlin say about `Animal`?',
              'A class is final by default, so no other class may extend it.',
              'Mark the parent class so that other classes are allowed to extend it.',
            ],
    explanation: 'In Kotlin, a class is final unless it is marked `open`. `Animal` is not open, so `Dog` cannot extend it. Writing `open class Animal` allows the subclass, and the program prints `Rex says Woof`.',
  },
  {
    id: 'world-11-practice-debug-missing-member',
    worldId: 'world-11',
    conceptTags: ['lesson:interfaces-multiple-interface-implementa', 'interface-contract', 'override-required'],
    summary: 'A class does not write one of the interface functions.',
    title: 'Fix the Missing Member',
    subtitle: 'The program should print "Hello Ana" and "Bye Ana", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: an interface member is not implemented',
    brokenCode: `interface Greeter {
  fun greet(name: String): String
  fun farewell(name: String): String
}

class Polite : Greeter {
  override fun greet(name: String): String {
    return "Hello " + name
  }
}

fun main() {
  val g = Polite()
  println(g.greet("Ana"))
  println(g.farewell("Ana"))
}`,
    fixedCode: `interface Greeter {
  fun greet(name: String): String
  fun farewell(name: String): String
}

class Polite : Greeter {
  override fun greet(name: String): String {
    return "Hello " + name
  }

  override fun farewell(name: String): String {
    return "Bye " + name
  }
}

fun main() {
  val g = Polite()
  println(g.greet("Ana"))
  println(g.farewell("Ana"))
}`,
    expectedOutput: 'Hello Ana\nBye Ana',
    hints: [
              'Compare the functions in `Greeter` with the functions in `Polite`.',
              'A class that implements an interface must give a body for every function that has none.',
              'Add the function that `Polite` is missing.',
            ],
    explanation: '`Greeter` has two functions without a body, `greet` and `farewell`. `Polite` only writes `greet`, so Kotlin refuses to compile it. Adding `override fun farewell` completes the contract, and both lines print.',
  },
  {
    id: 'world-11-practice-debug-open-when',
    worldId: 'world-11',
    conceptTags: ['lesson:sealed-classes-sealed-interfaces', 'exhaustive-when', 'sealed-class'],
    summary: 'A when over a sealed class misses one subclass.',
    title: 'Fix the Open When',
    subtitle: 'The program should print "slow" and "go", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a when over a sealed class misses a case',
    brokenCode: `sealed class Light
class Red : Light()
class Green : Light()
class Yellow : Light()

fun action(l: Light): String {
  return when (l) {
    is Red -> "stop"
    is Green -> "go"
  }
}

fun main() {
  println(action(Yellow()))
  println(action(Green()))
}`,
    fixedCode: `sealed class Light
class Red : Light()
class Green : Light()
class Yellow : Light()

fun action(l: Light): String {
  return when (l) {
    is Red -> "stop"
    is Green -> "go"
    is Yellow -> "slow"
  }
}

fun main() {
  println(action(Yellow()))
  println(action(Green()))
}`,
    expectedOutput: 'slow\ngo',
    hints: [
              'Count the subclasses of `Light`. Then count the branches in the `when`.',
              'A `when` that returns a value over a sealed class must handle every subclass, or have an `else`.',
              'Add the branch for the subclass that is missing.',
            ],
    explanation: '`Light` is sealed with three subclasses, but the `when` handles only two. Kotlin checks that the `when` is exhaustive, so it refuses to compile. Adding `is Yellow -> "slow"` covers every case.',
  },
  {
    id: 'world-11-practice-debug-plain-equals',
    worldId: 'world-11',
    conceptTags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'data-class', 'structural-equality'],
    summary: 'A plain class compares by identity, not by values.',
    title: 'Fix the Plain Equals',
    subtitle: 'The program should print "Same: true" for two equal points, but it prints "Same: false".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a plain class compares by identity',
    brokenCode: `class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(1, 2)
  val b = Point(1, 2)
  println("Same: " + (a == b))
}`,
    fixedCode: `data class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(1, 2)
  val b = Point(1, 2)
  println("Same: " + (a == b))
}`,
    expectedOutput: 'Same: true',
    hints: [
              'Look at how `Point` is declared. What kind of class is it?',
              'A plain class compares by identity. Two different objects are never `==`, even with the same values.',
              'Use the kind of class that compares by the values of its properties.',
            ],
    explanation: 'In a plain class, `==` checks if both names point to the same object. `a` and `b` are two objects, so the answer is `false`. A `data class` makes `==` compare `x` and `y`, so the answer is `true`.',
  },
  {
    id: 'world-11-practice-debug-nested-no-outer',
    worldId: 'world-11',
    conceptTags: ['lesson:nested-classes', 'nested-vs-inner', 'outer-access'],
    summary: 'A nested class cannot read the outer property.',
    title: 'Fix the Lost Outer',
    subtitle: 'The program should print "Cart of Ana", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: a nested class cannot see the outer instance',
    brokenCode: `class Shop(val name: String) {
  class Cart {
    fun owner(): String {
      return "Cart of " + name
    }
  }
}

fun main() {
  val shop = Shop("Ana")
  val cart = shop.Cart()
  println(cart.owner())
}`,
    fixedCode: `class Shop(val name: String) {
  inner class Cart {
    fun owner(): String {
      return "Cart of " + name
    }
  }
}

fun main() {
  val shop = Shop("Ana")
  val cart = shop.Cart()
  println(cart.owner())
}`,
    expectedOutput: 'Cart of Ana',
    hints: [
              'Find the line in `Cart` that uses `name`. Where does `name` belong?',
              'A nested class has no link to an outer object, so it cannot read the outer properties.',
              'Change the kind of class so that each `Cart` is tied to one `Shop` object.',
            ],
    explanation: 'A plain nested class is not connected to a `Shop` object, so `name` is unknown inside it. An `inner class` keeps a link to the outer object. Then `name` works, and `shop.Cart()` is a valid way to create it.',
  },
  {
    id: 'world-11-practice-debug-inner-no-outer',
    worldId: 'world-11',
    conceptTags: ['lesson:inner-classes', 'inner-class', 'outer-instance'],
    summary: 'The inner class is created from the wrong outer object.',
    title: 'Fix the Wrong Bank',
    subtitle: 'The program should print "10", the interest at the rate of 5 percent, but it prints "16".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the account was created from the wrong outer object',
    brokenCode: `class Bank(val rate: Int) {
  inner class Account(val saved: Int) {
    fun interest(): Int {
      return saved * rate / 100
    }
  }
}

fun main() {
  val bank = Bank(5)
  val other = Bank(8)
  val acc = other.Account(200)
  println(acc.interest())
}`,
    fixedCode: `class Bank(val rate: Int) {
  inner class Account(val saved: Int) {
    fun interest(): Int {
      return saved * rate / 100
    }
  }
}

fun main() {
  val bank = Bank(5)
  val other = Bank(8)
  val acc = bank.Account(200)
  println(acc.interest())
}`,
    expectedOutput: '10',
    hints: [
              'Look at the two banks in `main`. Which bank makes the account?',
              'An inner class uses the outer object that created it. `other` has a rate of 8, not 5.',
              'Create the account from the bank that has the rate you want.',
            ],
    explanation: 'An inner class is tied to the outer object that creates it, and it reads `rate` from that object. `other.Account(200)` uses the rate `8`, so the interest is `16`. `bank.Account(200)` uses the rate `5`, so the interest is `200 * 5 / 100 = 10`.',
  },
  {
    id: 'world-11-practice-debug-new-object',
    worldId: 'world-11',
    conceptTags: ['lesson:object-declarations', 'object-declaration', 'no-constructor'],
    summary: 'An object is created with () but it is already one instance.',
    title: 'Fix the New Object',
    subtitle: 'The program should print "start" and "1", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: an object cannot be created with ()',
    brokenCode: `object Logger {
  var lines = 0

  fun log(text: String) {
    lines += 1
    println(text)
  }
}

fun main() {
  val l = Logger()
  l.log("start")
  println(l.lines)
}`,
    fixedCode: `object Logger {
  var lines = 0

  fun log(text: String) {
    lines += 1
    println(text)
  }
}

fun main() {
  Logger.log("start")
  println(Logger.lines)
}`,
    expectedOutput: 'start\n1',
    hints: [
              'Look at the line `Logger()`. Is `Logger` a class or an object?',
              'An `object` is already one single instance. It has no constructor to call.',
              'Use the name `Logger` directly to reach its members.',
            ],
    explanation: '`object Logger` creates its only instance when it is first used, so `Logger()` is not allowed. You call its members with the object name: `Logger.log("start")` and `Logger.lines`.',
  },
  {
    id: 'world-11-practice-debug-companion-via-instance',
    worldId: 'world-11',
    conceptTags: ['lesson:companion-objects', 'companion-object', 'access-by-class-name'],
    summary: 'A companion function is called on an object.',
    title: 'Fix the Companion Call',
    subtitle: 'The program should print "red", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a companion member is called on the class name',
    brokenCode: `class Color(val name: String) {
  companion object {
    fun red(): Color {
      return Color("red")
    }
  }
}

fun main() {
  val c = Color("blue")
  val r = c.red()
  println(r.name)
}`,
    fixedCode: `class Color(val name: String) {
  companion object {
    fun red(): Color {
      return Color("red")
    }
  }
}

fun main() {
  val r = Color.red()
  println(r.name)
}`,
    expectedOutput: 'red',
    hints: [
              'Look at the line `c.red()`. What is `c`?',
              'A companion member belongs to the class, not to an object made from it.',
              'Call the function with the class name instead of an object.',
            ],
    explanation: '`red()` lives in the companion object, so it is called on the class name. `c` is an object of `Color`, and objects cannot call companion members. `Color.red()` works.',
  },
  {
    id: 'world-11-practice-debug-shadowed-extension',
    worldId: 'world-11',
    conceptTags: ['lesson:extension-functions', 'member-wins', 'extension-function'],
    summary: 'A member function hides the extension of the same name.',
    title: 'Fix the Shadowed Extension',
    subtitle: 'The program should print "BOX", but it prints "box".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: a member function hides an extension with the same name',
    brokenCode: `class Box {
  fun label(): String {
    return "box"
  }
}

fun Box.label(): String {
  return "BOX"
}

fun main() {
  println(Box().label())
}`,
    fixedCode: `class Box {
  fun label(): String {
    return "box"
  }
}

fun Box.shout(): String {
  return "BOX"
}

fun main() {
  println(Box().shout())
}`,
    expectedOutput: 'BOX',
    hints: [
              'Look at the two functions called `label`. Which one runs?',
              'When a member and an extension have the same name and parameters, the member always wins.',
              'Give the extension a name that the class does not already use.',
            ],
    explanation: 'Kotlin picks a member function before an extension with the same name. So `Box().label()` calls the member and prints `box`. Renaming the extension, for example to `shout`, makes the call reach it and print `BOX`.',
  },
  {
    id: 'world-11-practice-debug-ext-field',
    worldId: 'world-11',
    conceptTags: ['lesson:extension-properties', 'extension-property', 'no-backing-field'],
    summary: 'An extension property is given a stored value.',
    title: 'Fix the Extension Field',
    subtitle: 'The program should print "k", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: an extension property cannot store a value',
    brokenCode: `val String.initial: String = this.substring(0, 1)

fun main() {
  println("kotlin".initial)
}`,
    fixedCode: `val String.initial: String
  get() = this.substring(0, 1)

fun main() {
  println("kotlin".initial)
}`,
    expectedOutput: 'k',
    hints: [
              'Look at the line that declares `initial`. How does it get its value?',
              'An extension property has no place to store a value, so it cannot have an initial value.',
              'Compute the value in a getter instead of storing it.',
            ],
    explanation: 'An extension property cannot hold a value of its own, because it adds no field to the class. It must work out its value each time with a getter: `get() = this.substring(0, 1)`.',
  },
  {
    id: 'world-11-practice-debug-wrong-delegate',
    worldId: 'world-11',
    conceptTags: ['lesson:delegation', 'class-delegation', 'delegate-choice'],
    summary: 'The class delegates to the wrong object.',
    title: 'Fix the Wrong Delegate',
    subtitle: 'The program should print "20", but it prints "10".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the class delegates to the wrong object',
    brokenCode: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Twice : Scorer {
  override fun score(n: Int): Int {
    return n * 2
  }
}

class Pair2(val first: Scorer, val second: Scorer) : Scorer by first

fun main() {
  val p = Pair2(Plain(), Twice())
  println(p.score(10))
}`,
    fixedCode: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Twice : Scorer {
  override fun score(n: Int): Int {
    return n * 2
  }
}

class Pair2(val first: Scorer, val second: Scorer) : Scorer by second

fun main() {
  val p = Pair2(Plain(), Twice())
  println(p.score(10))
}`,
    expectedOutput: '20',
    hints: [
              'Which scorer should answer the call? Which one does the class use?',
              'The class says `Scorer by first`, so every call goes to the first scorer, which is `Plain`.',
              'Change which object the class delegates to.',
            ],
    explanation: '`Scorer by first` forwards every `Scorer` call to `first`, which is `Plain`, so the score is `10`. Delegating to `second`, which is `Twice`, gives `20`.',
  },
  {
    id: 'world-11-practice-debug-recompute',
    worldId: 'world-11',
    conceptTags: ['lesson:delegated-properties', 'lazy', 'getter-vs-delegate'],
    summary: 'A getter does the work again on every read.',
    title: 'Fix the Repeated Work',
    subtitle: 'The program should print "computing" once and then "42" two times, but it prints "computing" twice.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a getter runs again on every read',
    brokenCode: `class Report(val base: Int) {
  val total: Int
    get() {
      println("computing")
      return base * 2
    }
}

fun main() {
  val r = Report(21)
  println(r.total)
  println(r.total)
}`,
    fixedCode: `class Report(val base: Int) {
  val total: Int by lazy {
    println("computing")
    base * 2
  }
}

fun main() {
  val r = Report(21)
  println(r.total)
  println(r.total)
}`,
    expectedOutput: 'computing\n42\n42',
    hints: [
              'Count how many times the word "computing" appears. How many times is `total` read?',
              'A getter runs every time the property is read, so the work is done again.',
              'Use a property delegate that works the value out once and keeps it.',
            ],
    explanation: 'A `get()` block runs on every read, so the message prints twice. `by lazy` runs its block once, on the first read, and keeps the result. The second read gives `42` without printing again.',
  },
  {
    id: 'world-11-practice-debug-private-read',
    worldId: 'world-11',
    conceptTags: ['lesson:visibility-and-api-design', 'private-member', 'public-api'],
    summary: 'A private property is read from outside the class.',
    title: 'Fix the Private Read',
    subtitle: 'The program should print "Opened: true", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a private property is read from outside',
    brokenCode: `class Safe(private val code: Int) {
  fun check(guess: Int): Boolean {
    return guess == code
  }
}

fun main() {
  val s = Safe(1234)
  println("Opened: " + (s.code == 1234))
}`,
    fixedCode: `class Safe(private val code: Int) {
  fun check(guess: Int): Boolean {
    return guess == code
  }
}

fun main() {
  val s = Safe(1234)
  println("Opened: " + s.check(1234))
}`,
    expectedOutput: 'Opened: true',
    hints: [
              'Look at what `main` reads from `s`. Is that property public?',
              '`code` is private, so only code inside `Safe` can read it.',
              'Ask the object through the public function that it already offers.',
            ],
    explanation: '`code` is a private property, so `main` cannot read it. `Safe` offers `check(guess)` as its public API. Calling `s.check(1234)` gives `true` without showing the code.',
  },
];
