import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 8 -- Object Kingdom (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the class feature (object, getter, init, default argument, override ...) is named in the step.
//   hard   -- state shared between a class and an object, a value computed from properties with Int division, a polymorphic list,
//             a method that can refuse, or several features together; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world8.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Debug tasks that must not compile rely on the class
// rules in src/utils/kotlinClassChecks.ts (val reassignment, private access, override and abstract-member rules).
// Limits of the runner that these tasks stay inside (see PITFALLS.md): no enum members after the constants, no secondary
// constructors, no hashCode(), no overloads that differ only by parameter count, and no generic class parameters.

export const WORLD_8_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  {
    id: 'world-8-practice-writerun-shelf-players',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write a class, make two objects, change one of them, and print both.',
    conceptTags: ['lesson:classes', 'class-declaration', 'instances', 'independent-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Two Players',
    goal: 'Make a class for players. Create two players and give one of them a bonus. Print each player and the total score.',
    description: '1. **Write the class.** Above `main`, write `class Player` with two properties: `val name: String` and `var score: Int`.\n\n' +
              '2. **Create two players.** Create `val ana` as `Player("Ana", 0)` and `val bo` as `Player("Bo", 5)`.\n\n' +
              '3. **Give Ana the bonus.** Set `ana.score` to `ana.score` plus `bonus`.\n\n' +
              '4. **Print three lines.** Join the text with `+`:\n"Ana: 10"\n"Bo: 5"\n"Total: 15"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** Put the properties in the class header.',
          '2. **Create two players.** Ana starts at `0`, Bo at `5`.',
          '3. **Give Ana the bonus.** Change her `score`.',
          '4. **Print three lines.** Include the total.',
        ],
        comments: [
          '// 1. Write the class. Put the properties in the class header.',
          '// 2. Create two players. Ana starts at 0, Bo at 5.',
          '// 3. Give Ana the bonus. Change her score.',
          '// 4. Print three lines. Include the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Create two players.**',
          '3. **Give Ana the bonus.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Create two players.',
          '// 3. Give Ana the bonus.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Players.kt',
    initialCode: `// 1. Write the class. Above main, write class Player with two properties: val name: String and var score: Int.

fun main() {
  val bonus = 10

  // 2. Create two players. Create val ana as Player("Ana", 0) and val bo as Player("Bo", 5).

  // 3. Give Ana the bonus. Set ana.score to ana.score plus bonus.

  // 4. Print three lines. Join the text with +: "Ana: 10" "Bo: 5" "Total: 15"
}`,
    solutionCode: `class Player(val name: String, var score: Int)

fun main() {
  val bonus = 10
  val ana = Player("Ana", 0)
  val bo = Player("Bo", 5)
  ana.score = ana.score + bonus
  println(ana.name + ": " + ana.score)
  println(bo.name + ": " + bo.score)
  println("Total: " + (ana.score + bo.score))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 10\nBo: 5\nTotal: 15',
    testCase: { call: '', expected: 'Ana: 10\nBo: 5\nTotal: 15' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '10', alternateLiteral: '7' }],
      alternateExpectedOutput: 'Ana: 7\nBo: 5\nTotal: 12',
    },
  },
  {
    id: 'world-8-practice-writerun-roster-scan',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Go through a list of objects to find the best mark, the average and the passes.',
    conceptTags: ['lesson:classes', 'lesson:properties', 'objects-in-list', 'loop', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Roster Scan',
    goal: 'A class has four students with marks. Find the best student, the average mark and how many students passed. Print three lines.',
    description: 'The class `Student` and the list `students` are in the starter code.\n\n' +
              '1. **Prepare the counters.** Create `var total = 0`, `var best = students[0]` and `var passed = 0`.\n\n' +
              '2. **Check every student.** Loop over `students`. Add `s.mark` to `total`. When `s.mark` is bigger than `best.mark`, set `best` to `s`. When `s.mark` is at least `passMark`, add `1` to `passed`.\n\n' +
              '3. **Print three lines.** The average is `total` divided by `students.size`. Int division drops the fraction:\n"Best: Cy (88)"\n"Average: 63"\n"Passed: 3 of 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Prepare the counters.** Start `best` with the first student.',
          '2. **Check every student.** Update the total, the best student and the passes.',
          '3. **Print three lines.** Divide the total by the number of students.',
        ],
        comments: [
          '// 1. Prepare the counters. Start best with the first student.',
          '// 2. Check every student. Update the total, the best student and the passes.',
          '// 3. Print three lines. Divide the total by the number of students.',
        ],
      },
      experienced: {
        steps: [
          '1. **Prepare the counters.**',
          '2. **Check every student.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Prepare the counters.',
          '// 2. Check every student.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Roster.kt',
    initialCode: `class Student(val name: String, val mark: Int)

fun main() {
  val passMark = 50
  val students = listOf(Student("Ana", 72), Student("Bo", 45), Student("Cy", 88), Student("Di", 50))

  // 1. Prepare the counters. Create var total = 0, var best = students[0] and var passed = 0.

  // 2. Check every student. Loop over students. Add s.mark to total. When s.mark is bigger than best.mark, set best to s. When s.mark is at least passMark, add 1 to passed.

  // 3. Print three lines. The average is total divided by students.size. Int division drops the fraction: "Best: Cy (88)" "Average: 63" "Passed: 3 of 4"
}`,
    solutionCode: `class Student(val name: String, val mark: Int)

fun main() {
  val passMark = 50
  val students = listOf(Student("Ana", 72), Student("Bo", 45), Student("Cy", 88), Student("Di", 50))
  var total = 0
  var best = students[0]
  var passed = 0
  for (s in students) {
    total += s.mark
    if (s.mark > best.mark) {
      best = s
    }
    if (s.mark >= passMark) {
      passed++
    }
  }
  println("Best: " + best.name + " (" + best.mark + ")")
  println("Average: " + total / students.size)
  println("Passed: " + passed + " of " + students.size)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Best: Cy (88)\nAverage: 63\nPassed: 3 of 4',
    testCase: { call: '', expected: 'Best: Cy (88)\nAverage: 63\nPassed: 3 of 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'passMark', originalLiteral: '50', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Best: Cy (88)\nAverage: 63\nPassed: 2 of 4',
    },
  },
  {
    id: 'world-8-practice-writerun-visit-counter',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write an object that keeps one shared count, and use it from main.',
    conceptTags: ['lesson:objects', 'object-declaration', 'shared-state'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Visit Counter',
    goal: 'A website counts its visits in one place. Write an object that stores the count. Add some visits and print the result.',
    description: '1. **Write the object.** Above `main`, write `object VisitCounter`. Give it `var visits = 0`, a function `hit()` that adds `1` to `this.visits`, and a function `report()` that returns "Visits: " plus `this.visits`.\n\n' +
              '2. **Count the visits.** Loop `hits` times. Each time, call `VisitCounter.hit()`.\n\n' +
              '3. **Print the report.** Print `VisitCounter.report()`:\n"Visits: 3"\n\n' +
              '4. **Add one more.** Call `hit()` once more, then print `VisitCounter.visits`:\n"4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the object.** Add `visits`, `hit()` and `report()`.',
          '2. **Count the visits.** Call `hit()` in a loop.',
          '3. **Print the report.**',
          '4. **Add one more.** Print `visits`.',
        ],
        comments: [
          '// 1. Write the object. Add visits, hit() and report().',
          '// 2. Count the visits. Call hit() in a loop.',
          '// 3. Print the report.',
          '// 4. Add one more. Print visits.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the object.**',
          '2. **Count the visits.**',
          '3. **Print the report.**',
          '4. **Add one more.**',
        ],
        comments: [
          '// 1. Write the object.',
          '// 2. Count the visits.',
          '// 3. Print the report.',
          '// 4. Add one more.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Visits.kt',
    initialCode: `// 1. Write the object. Above main, write object VisitCounter. Give it var visits = 0, a function hit() that adds 1 to this.visits, and a function report() that returns "Visits: " plus this.visits.

fun main() {
  val hits = 3

  // 2. Count the visits. Loop hits times. Each time, call VisitCounter.hit().

  // 3. Print the report. Print VisitCounter.report(): "Visits: 3"

  // 4. Add one more. Call hit() once more, then print VisitCounter.visits: "4"
}`,
    solutionCode: `object VisitCounter {
  var visits = 0
  fun hit() {
    this.visits = this.visits + 1
  }
  fun report() = "Visits: " + this.visits
}

fun main() {
  val hits = 3
  for (i in 1..hits) {
    VisitCounter.hit()
  }
  println(VisitCounter.report())
  VisitCounter.hit()
  println(VisitCounter.visits)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Visits: 3\n4',
    testCase: { call: '', expected: 'Visits: 3\n4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hits', originalLiteral: '3', alternateLiteral: '5' }],
      alternateExpectedOutput: 'Visits: 5\n6',
    },
  },
  {
    id: 'world-8-practice-writerun-shop-tax',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Use a shared object inside a class method to work out a price with tax.',
    conceptTags: ['lesson:objects', 'lesson:methods', 'object-shared-by-class', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shop Tax',
    goal: 'A shop adds tax to every order. The tax rate and the order count are kept in one shared object. Price two orders and print the results and the order count.',
    description: 'The object `Shop` and the class `Order` are in the starter code. `Order` still needs its `total()` method.\n\n' +
              '1. **Write `total()`.** Inside `Order`, write `fun total(): Int`. It adds `1` to `Shop.orders`. It returns `this.amount` plus `this.amount * Shop.taxPercent / 100`.\n\n' +
              '2. **Create two orders.** Create `val first` as `Order("Lamp", price)` and `val second` as `Order("Desk", 1200)`.\n\n' +
              '3. **Print two prices.** Join the item and its total with `+`:\n"Lamp: 280"\n"Desk: 1320"\n\n' +
              '4. **Print the order count.** Print `Shop.orders`:\n"Orders priced: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `total()`.** Count the order, then add the tax.',
          '2. **Create two orders.**',
          '3. **Print two prices.**',
          '4. **Print the order count.**',
        ],
        comments: [
          '// 1. Write total(). Count the order, then add the tax.',
          '// 2. Create two orders.',
          '// 3. Print two prices.',
          '// 4. Print the order count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `total()`.**',
          '2. **Create two orders.**',
          '3. **Print two prices.**',
          '4. **Print the order count.**',
        ],
        comments: [
          '// 1. Write total().',
          '// 2. Create two orders.',
          '// 3. Print two prices.',
          '// 4. Print the order count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShopTax.kt',
    initialCode: `object Shop {
  val taxPercent = 10
  var orders = 0
}

class Order(val item: String, val amount: Int) {
  // 1. Write total(). Inside Order, write fun total(): Int. It adds 1 to Shop.orders. It returns this.amount plus this.amount * Shop.taxPercent / 100.
}

fun main() {
  val price = 255

  // 2. Create two orders. Create val first as Order("Lamp", price) and val second as Order("Desk", 1200).

  // 3. Print two prices. Join the item and its total with +: "Lamp: 280" "Desk: 1320"

  // 4. Print the order count. Print Shop.orders: "Orders priced: 2"
}`,
    solutionCode: `object Shop {
  val taxPercent = 10
  var orders = 0
}

class Order(val item: String, val amount: Int) {
  fun total(): Int {
    Shop.orders = Shop.orders + 1
    return this.amount + this.amount * Shop.taxPercent / 100
  }
}

fun main() {
  val price = 255
  val first = Order("Lamp", price)
  val second = Order("Desk", 1200)
  println(first.item + ": " + first.total())
  println(second.item + ": " + second.total())
  println("Orders priced: " + Shop.orders)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Lamp: 280\nDesk: 1320\nOrders priced: 2',
    testCase: { call: '', expected: 'Lamp: 280\nDesk: 1320\nOrders priced: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'price', originalLiteral: '255', alternateLiteral: '199' }],
      alternateExpectedOutput: 'Lamp: 218\nDesk: 1320\nOrders priced: 2',
    },
  },
  {
    id: 'world-8-practice-writerun-wallet',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Change a var property of an object and print it.',
    conceptTags: ['lesson:properties', 'val-vs-var-property', 'compound-assignment'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Wallet',
    goal: 'Mira has a wallet. Add her salary, take away some spending, and print how much is left and how much is spare.',
    description: 'The class `Wallet` is in the starter code. `owner` is a `val` and `balance` is a `var`.\n\n' +
              '1. **Add the salary.** Set `wallet.balance` to `wallet.balance` plus `salary`.\n\n' +
              '2. **Spend some money.** Take `450` away from `wallet.balance` with `-=`.\n\n' +
              '3. **Print the balance.** Join the owner and the balance with `+`:\n"Mira has 1050"\n\n' +
              '4. **Print the spare money.** Create `val spare` as `wallet.balance` minus `500`, and print it:\n"Spare: 550"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add the salary.**',
          '2. **Spend some money.** Use `-=`.',
          '3. **Print the balance.**',
          '4. **Print the spare money.** Subtract `500`.',
        ],
        comments: [
          '// 1. Add the salary.',
          '// 2. Spend some money. Use -=.',
          '// 3. Print the balance.',
          '// 4. Print the spare money. Subtract 500.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add the salary.**',
          '2. **Spend some money.**',
          '3. **Print the balance.**',
          '4. **Print the spare money.**',
        ],
        comments: [
          '// 1. Add the salary.',
          '// 2. Spend some money.',
          '// 3. Print the balance.',
          '// 4. Print the spare money.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Wallet.kt',
    initialCode: `class Wallet(val owner: String, var balance: Int)

fun main() {
  val salary = 1200
  val wallet = Wallet("Mira", 300)

  // 1. Add the salary. Set wallet.balance to wallet.balance plus salary.

  // 2. Spend some money. Take 450 away from wallet.balance with -=.

  // 3. Print the balance. Join the owner and the balance with +: "Mira has 1050"

  // 4. Print the spare money. Create val spare as wallet.balance minus 500, and print it: "Spare: 550"
}`,
    solutionCode: `class Wallet(val owner: String, var balance: Int)

fun main() {
  val salary = 1200
  val wallet = Wallet("Mira", 300)
  wallet.balance = wallet.balance + salary
  wallet.balance -= 450
  println(wallet.owner + " has " + wallet.balance)
  val spare = wallet.balance - 500
  println("Spare: " + spare)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Mira has 1050\nSpare: 550',
    testCase: { call: '', expected: 'Mira has 1050\nSpare: 550' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'salary', originalLiteral: '1200', alternateLiteral: '800' }],
      alternateExpectedOutput: 'Mira has 650\nSpare: 150',
    },
  },
  {
    id: 'world-8-practice-writerun-temperature-sensor',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Add two computed properties with getters, and see them change with the value.',
    conceptTags: ['lesson:properties', 'custom-getter', 'computed-property', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Temperature Sensor',
    goal: 'A sensor stores a temperature in Celsius. Add two properties that are worked out from it: the Fahrenheit value and a "hot" flag. Print them, change the temperature, and print them again.',
    description: 'The class `Sensor` is in the starter code. Write the two getters inside it.\n\n' +
              '1. **Add `fahrenheit`.** Write `val fahrenheit: Int` with a getter. The getter returns `this.celsius * 9 / 5 + 32`.\n\n' +
              '2. **Add `isHot`.** Write `val isHot: Boolean` with a getter. The getter is `true` when `this.celsius` is at least `30`.\n\n' +
              '3. **Create the sensor.** Create `val sensor` as `Sensor("Roof", reading)`.\n\n' +
              '4. **Print the first reading.** Join the label, `fahrenheit` and `isHot` with spaces:\n"Roof 77 false"\n\n' +
              '5. **Change the temperature.** Set `sensor.celsius` to `reading + 10` and print the same line again:\n"Roof 95 true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add `fahrenheit`.** Use a getter.',
          '2. **Add `isHot`.** Use a getter and `>=`.',
          '3. **Create the sensor.**',
          '4. **Print the first reading.**',
          '5. **Change the temperature.** Print again.',
        ],
        comments: [
          '// 1. Add fahrenheit. Use a getter.',
          '// 2. Add isHot. Use a getter and >=.',
          '// 3. Create the sensor.',
          '// 4. Print the first reading.',
          '// 5. Change the temperature. Print again.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add `fahrenheit`.**',
          '2. **Add `isHot`.**',
          '3. **Create the sensor.**',
          '4. **Print the first reading.**',
          '5. **Change the temperature.**',
        ],
        comments: [
          '// 1. Add fahrenheit.',
          '// 2. Add isHot.',
          '// 3. Create the sensor.',
          '// 4. Print the first reading.',
          '// 5. Change the temperature.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Sensor.kt',
    initialCode: `class Sensor(val label: String, var celsius: Int) {
  // 1. Add fahrenheit. Write val fahrenheit: Int with a getter. The getter returns this.celsius * 9 / 5 + 32.

  // 2. Add isHot. Write val isHot: Boolean with a getter. The getter is true when this.celsius is at least 30.
}

fun main() {
  val reading = 25

  // 3. Create the sensor. Create val sensor as Sensor("Roof", reading).

  // 4. Print the first reading. Join the label, fahrenheit and isHot with spaces: "Roof 77 false"

  // 5. Change the temperature. Set sensor.celsius to reading + 10 and print the same line again: "Roof 95 true"
}`,
    solutionCode: `class Sensor(val label: String, var celsius: Int) {
  val fahrenheit: Int
    get() = this.celsius * 9 / 5 + 32

  val isHot: Boolean
    get() = this.celsius >= 30
}

fun main() {
  val reading = 25
  val sensor = Sensor("Roof", reading)
  println(sensor.label + " " + sensor.fahrenheit + " " + sensor.isHot)
  sensor.celsius = reading + 10
  println(sensor.label + " " + sensor.fahrenheit + " " + sensor.isHot)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Roof 77 false\nRoof 95 true',
    testCase: { call: '', expected: 'Roof 77 false\nRoof 95 true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'reading', originalLiteral: '25', alternateLiteral: '28' }],
      alternateExpectedOutput: 'Roof 82 false\nRoof 100 true',
    },
  },
  {
    id: 'world-8-practice-writerun-rectangle-tools',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write three methods that return values, and call them on two objects.',
    conceptTags: ['lesson:methods', 'method-return-value', 'boolean-method'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Rectangle Tools',
    goal: 'Give a rectangle class three methods: area, perimeter and a check for a square. Use them on two rectangles and print the results.',
    description: 'The class `Rectangle` is in the starter code with `width` and `height`.\n\n' +
              '1. **Write `area()`.** It returns `this.width * this.height`.\n\n' +
              '2. **Write `perimeter()`.** It returns `2 * (this.width + this.height)`.\n\n' +
              '3. **Write `isSquare()`.** It returns `true` when `this.width` equals `this.height`. Give it the return type `Boolean`.\n\n' +
              '4. **Create two rectangles.** Create `val a` as `Rectangle(side, 4)` and `val b` as `Rectangle(side, side)`.\n\n' +
              '5. **Print two lines.** Join the label and the three answers with spaces:\n"A: 24 20 false"\n"B: 36 24 true"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `area()`.**',
          '2. **Write `perimeter()`.**',
          '3. **Write `isSquare()`.** Return a `Boolean`.',
          '4. **Create two rectangles.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write area().',
          '// 2. Write perimeter().',
          '// 3. Write isSquare(). Return a Boolean.',
          '// 4. Create two rectangles.',
          '// 5. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `area()`.**',
          '2. **Write `perimeter()`.**',
          '3. **Write `isSquare()`.**',
          '4. **Create two rectangles.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write area().',
          '// 2. Write perimeter().',
          '// 3. Write isSquare().',
          '// 4. Create two rectangles.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Rectangles.kt',
    initialCode: `class Rectangle(val width: Int, val height: Int) {
  // 1. Write area(). It returns this.width * this.height.

  // 2. Write perimeter(). It returns 2 * (this.width + this.height).

  // 3. Write isSquare(). It returns true when this.width equals this.height. Give it the return type Boolean.
}

fun main() {
  val side = 6

  // 4. Create two rectangles. Create val a as Rectangle(side, 4) and val b as Rectangle(side, side).

  // 5. Print two lines. Join the label and the three answers with spaces: "A: 24 20 false" "B: 36 24 true"
}`,
    solutionCode: `class Rectangle(val width: Int, val height: Int) {
  fun area() = this.width * this.height
  fun perimeter() = 2 * (this.width + this.height)
  fun isSquare(): Boolean {
    return this.width == this.height
  }
}

fun main() {
  val side = 6
  val a = Rectangle(side, 4)
  val b = Rectangle(side, side)
  println("A: " + a.area() + " " + a.perimeter() + " " + a.isSquare())
  println("B: " + b.area() + " " + b.perimeter() + " " + b.isSquare())
}`,
    sampleInput: 'main()',
    expectedOutput: 'A: 24 20 false\nB: 36 24 true',
    testCase: { call: '', expected: 'A: 24 20 false\nB: 36 24 true' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'side', originalLiteral: '6', alternateLiteral: '5' }],
      alternateExpectedOutput: 'A: 20 18 false\nB: 25 20 true',
    },
  },
  {
    id: 'world-8-practice-writerun-account-ops',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Write a method that can say no, and count how often it does.',
    conceptTags: ['lesson:methods', 'method-changes-state', 'boolean-result', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Account Operations',
    goal: 'A bank account can take money in and pay money out. A payment must fail when there is not enough money. Make some payments, count the failures, and print the balance.',
    description: 'The class `Account` is in the starter code with `deposit()`. Write `withdraw()` inside it.\n\n' +
              '1. **Write `withdraw()`.** It takes `amount: Int` and returns a `Boolean`. When `amount` is bigger than `this.balance`, return `false`. If not, take the amount from `this.balance` and return `true`.\n\n' +
              '2. **Deposit money.** Call `account.deposit(50)`.\n\n' +
              '3. **Try three payments.** Call `account.withdraw` with `120`, then `100`, then `30`. Each time it returns `false`, add `1` to `failed`.\n\n' +
              '4. **Print two lines.** Print the balance and the failures:\n"Balance: 0"\n"Failed: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `withdraw()`.** Return `false` when the money is not enough.',
          '2. **Deposit money.**',
          '3. **Try three payments.** Count the failures.',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write withdraw(). Return false when the money is not enough.',
          '// 2. Deposit money.',
          '// 3. Try three payments. Count the failures.',
          '// 4. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `withdraw()`.**',
          '2. **Deposit money.**',
          '3. **Try three payments.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Write withdraw().',
          '// 2. Deposit money.',
          '// 3. Try three payments.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'AccountOps.kt',
    initialCode: `class Account(var balance: Int) {
  fun deposit(amount: Int) {
    this.balance = this.balance + amount
  }

  // 1. Write withdraw(). It takes amount: Int and returns a Boolean. When amount is bigger than this.balance, return false. If not, take the amount from this.balance and return true.
}

fun main() {
  val start = 100
  val account = Account(start)
  var failed = 0

  // 2. Deposit money. Call account.deposit(50).

  // 3. Try three payments. Call account.withdraw with 120, then 100, then 30. Each time it returns false, add 1 to failed.

  // 4. Print two lines. Print the balance and the failures: "Balance: 0" "Failed: 1"
}`,
    solutionCode: `class Account(var balance: Int) {
  fun deposit(amount: Int) {
    this.balance = this.balance + amount
  }

  fun withdraw(amount: Int): Boolean {
    if (amount > this.balance) {
      return false
    }
    this.balance = this.balance - amount
    return true
  }
}

fun main() {
  val start = 100
  val account = Account(start)
  var failed = 0
  account.deposit(50)
  if (!account.withdraw(120)) {
    failed++
  }
  if (!account.withdraw(100)) {
    failed++
  }
  if (!account.withdraw(30)) {
    failed++
  }
  println("Balance: " + account.balance)
  println("Failed: " + failed)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Balance: 0\nFailed: 1',
    testCase: { call: '', expected: 'Balance: 0\nFailed: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'start', originalLiteral: '100', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Balance: 10\nFailed: 2',
    },
  },
  {
    id: 'world-8-practice-writerun-price-tag',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Use constructor parameters and an init block to work out a property.',
    conceptTags: ['lesson:constructors', 'lesson:init', 'constructor-parameter', 'init-assignment', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Price Tag',
    goal: 'A price tag is made from a base price and a tax percent. Work out the total price when the object is created. Make two tags and print their totals.',
    description: 'The class header `Price(base, taxPercent)` is in the starter code. Its parameters are not properties.\n\n' +
              '1. **Declare the property.** Inside `Price`, write `val total: Int`.\n\n' +
              '2. **Fill it in `init`.** In an `init` block, set `this.total` to `base + base * taxPercent / 100`. Int division drops the fraction.\n\n' +
              '3. **Create two tags.** Create `val shirt` as `Price(base, 10)` and `val shoes` as `Price(120, 25)`.\n\n' +
              '4. **Print two lines.** Join the label and the total with `+`:\n"Shirt: 93"\n"Shoes: 150"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Declare the property.**',
          '2. **Fill it in `init`.** Use the constructor parameters.',
          '3. **Create two tags.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Declare the property.',
          '// 2. Fill it in init. Use the constructor parameters.',
          '// 3. Create two tags.',
          '// 4. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Declare the property.**',
          '2. **Fill it in `init`.**',
          '3. **Create two tags.**',
          '4. **Print two lines.**',
        ],
        comments: [
          '// 1. Declare the property.',
          '// 2. Fill it in init.',
          '// 3. Create two tags.',
          '// 4. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'PriceTag.kt',
    initialCode: `class Price(base: Int, taxPercent: Int) {
  // 1. Declare the property. Inside Price, write val total: Int.

  // 2. Fill it in init. In an init block, set this.total to base + base * taxPercent / 100. Int division drops the fraction.
}

fun main() {
  val base = 85

  // 3. Create two tags. Create val shirt as Price(base, 10) and val shoes as Price(120, 25).

  // 4. Print two lines. Join the label and the total with +: "Shirt: 93" "Shoes: 150"
}`,
    solutionCode: `class Price(base: Int, taxPercent: Int) {
  val total: Int

  init {
    this.total = base + base * taxPercent / 100
  }
}

fun main() {
  val base = 85
  val shirt = Price(base, 10)
  val shoes = Price(120, 25)
  println("Shirt: " + shirt.total)
  println("Shoes: " + shoes.total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Shirt: 93\nShoes: 150',
    testCase: { call: '', expected: 'Shirt: 93\nShoes: 150' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'base', originalLiteral: '85', alternateLiteral: '90' }],
      alternateExpectedOutput: 'Shirt: 99\nShoes: 150',
    },
  },
  {
    id: 'world-8-practice-writerun-member-card',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write a class with default values and create objects in three different ways.',
    conceptTags: ['lesson:primary-constructors', 'default-constructor-arguments', 'named-constructor-arguments'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Member Card',
    goal: 'A shop has member cards. Most members only need a name. Make a class where the level and the points have default values. Create three members in different ways and print them.',
    description: '1. **Write the class.** Above `main`, write `class Member` with `val name: String`, `val level: String = "Basic"` and `var points: Int = 0` in the class header.\n\n' +
              '2. **Create three members.** Create `val a` as `Member("Ana")`. Create `val b` as `Member("Bo", "Gold", 150)`. Create `val c` as `Member(name = "Cy", points = 40)`.\n\n' +
              '3. **Add the welcome points.** Set `a.points` to `a.points` plus `welcome`.\n\n' +
              '4. **Print three lines.** Join the name, level and points with spaces:\n"Ana Basic 20"\n"Bo Gold 150"\n"Cy Basic 40"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the class.** Use default values.',
          '2. **Create three members.** Use defaults, positions and names.',
          '3. **Add the welcome points.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the class. Use default values.',
          '// 2. Create three members. Use defaults, positions and names.',
          '// 3. Add the welcome points.',
          '// 4. Print three lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the class.**',
          '2. **Create three members.**',
          '3. **Add the welcome points.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Write the class.',
          '// 2. Create three members.',
          '// 3. Add the welcome points.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Members.kt',
    initialCode: `// 1. Write the class. Above main, write class Member with val name: String, val level: String = "Basic" and var points: Int = 0 in the class header.

fun main() {
  val welcome = 20

  // 2. Create three members. Create val a as Member("Ana"). Create val b as Member("Bo", "Gold", 150). Create val c as Member(name = "Cy", points = 40).

  // 3. Add the welcome points. Set a.points to a.points plus welcome.

  // 4. Print three lines. Join the name, level and points with spaces: "Ana Basic 20" "Bo Gold 150" "Cy Basic 40"
}`,
    solutionCode: `class Member(val name: String, val level: String = "Basic", var points: Int = 0)

fun main() {
  val welcome = 20
  val a = Member("Ana")
  val b = Member("Bo", "Gold", 150)
  val c = Member(name = "Cy", points = 40)
  a.points = a.points + welcome
  println(a.name + " " + a.level + " " + a.points)
  println(b.name + " " + b.level + " " + b.points)
  println(c.name + " " + c.level + " " + c.points)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana Basic 20\nBo Gold 150\nCy Basic 40',
    testCase: { call: '', expected: 'Ana Basic 20\nBo Gold 150\nCy Basic 40' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'welcome', originalLiteral: '20', alternateLiteral: '35' }],
      alternateExpectedOutput: 'Ana Basic 35\nBo Gold 150\nCy Basic 40',
    },
  },
  {
    id: 'world-8-practice-writerun-creation-log',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Use an init block to print a message and count every object that is created.',
    conceptTags: ['lesson:init', 'init-order', 'property-initializer', 'object-counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Creation Log',
    goal: 'Every time a ticket is created, print a message and count it in a shared place. Create two tickets, then print the count and the ticket labels.',
    description: 'The object `Registry` and the class `Ticket` are in the starter code. `Ticket` still needs its `init` block.\n\n' +
              '1. **Write the `init` block.** Inside `Ticket`, write an `init` block. It prints "Creating " plus `label`, then adds `1` to `Registry.count`.\n\n' +
              '2. **Create two tickets.** Create `val a` as `Ticket(first)` and `val b` as `Ticket(first + 1)`.\n\n' +
              '3. **Print the count.** Print `Registry.count`:\n"Created: 2"\n\n' +
              '4. **Print the labels.** Print the two labels with a comma between them:\n"Seat 12, Seat 13"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the `init` block.** Print, then count.',
          '2. **Create two tickets.**',
          '3. **Print the count.**',
          '4. **Print the labels.**',
        ],
        comments: [
          '// 1. Write the init block. Print, then count.',
          '// 2. Create two tickets.',
          '// 3. Print the count.',
          '// 4. Print the labels.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the `init` block.**',
          '2. **Create two tickets.**',
          '3. **Print the count.**',
          '4. **Print the labels.**',
        ],
        comments: [
          '// 1. Write the init block.',
          '// 2. Create two tickets.',
          '// 3. Print the count.',
          '// 4. Print the labels.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CreationLog.kt',
    initialCode: `object Registry {
  var count = 0
}

class Ticket(val seat: Int) {
  val label = "Seat " + seat

  // 1. Write the init block. Inside Ticket, write an init block. It prints "Creating " plus label, then adds 1 to Registry.count.
}

fun main() {
  val first = 12

  // 2. Create two tickets. Create val a as Ticket(first) and val b as Ticket(first + 1).

  // 3. Print the count. Print Registry.count: "Created: 2"

  // 4. Print the labels. Print the two labels with a comma between them: "Seat 12, Seat 13"
}`,
    solutionCode: `object Registry {
  var count = 0
}

class Ticket(val seat: Int) {
  val label = "Seat " + seat

  init {
    println("Creating " + label)
    Registry.count = Registry.count + 1
  }
}

fun main() {
  val first = 12
  val a = Ticket(first)
  val b = Ticket(first + 1)
  println("Created: " + Registry.count)
  println(a.label + ", " + b.label)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Creating Seat 12\nCreating Seat 13\nCreated: 2\nSeat 12, Seat 13',
    testCase: { call: '', expected: 'Creating Seat 12\nCreating Seat 13\nCreated: 2\nSeat 12, Seat 13' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'first', originalLiteral: '12', alternateLiteral: '20' }],
      alternateExpectedOutput: 'Creating Seat 20\nCreating Seat 21\nCreated: 2\nSeat 20, Seat 21',
    },
  },
  {
    id: 'world-8-practice-writerun-safe-box',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Keep a code private and let other code use it only through a method.',
    conceptTags: ['lesson:visibility-modifiers', 'private-property', 'public-method-guard'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Safe Box',
    goal: 'A safe box hides its secret code. Other code may only guess the code by calling a method. Count the guesses. Make two guesses and print the results.',
    description: 'The class header `SafeBox(private val code: Int, val label: String)` is in the starter code.\n\n' +
              '1. **Add a private counter.** Write `private var attempts = 0`.\n\n' +
              '2. **Write `open()`.** It takes `guess: Int` and returns a `Boolean`. It adds `1` to `this.attempts`, then returns `true` when `guess` equals `this.code`.\n\n' +
              '3. **Write `attemptsUsed()`.** It returns `this.attempts`.\n\n' +
              '4. **Create the box and guess.** Create `val box` as `SafeBox(secret, "Vault")`. Print the label and the result of `box.open(1234)`:\n"Vault opened: false"\n\n' +
              '5. **Guess again and count.** Print the same line for `box.open(secret)`, then print the attempts:\n"Vault opened: true"\n"Attempts: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Add a private counter.**',
          '2. **Write `open()`.** Count, then compare.',
          '3. **Write `attemptsUsed()`.**',
          '4. **Create the box and guess.**',
          '5. **Guess again and count.**',
        ],
        comments: [
          '// 1. Add a private counter.',
          '// 2. Write open(). Count, then compare.',
          '// 3. Write attemptsUsed().',
          '// 4. Create the box and guess.',
          '// 5. Guess again and count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Add a private counter.**',
          '2. **Write `open()`.**',
          '3. **Write `attemptsUsed()`.**',
          '4. **Create the box and guess.**',
          '5. **Guess again and count.**',
        ],
        comments: [
          '// 1. Add a private counter.',
          '// 2. Write open().',
          '// 3. Write attemptsUsed().',
          '// 4. Create the box and guess.',
          '// 5. Guess again and count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SafeBox.kt',
    initialCode: `class SafeBox(private val code: Int, val label: String) {
  // 1. Add a private counter. Write private var attempts = 0.

  // 2. Write open(). It takes guess: Int and returns a Boolean. It adds 1 to this.attempts, then returns true when guess equals this.code.

  // 3. Write attemptsUsed(). It returns this.attempts.
}

fun main() {
  val secret = 4821

  // 4. Create the box and guess. Create val box as SafeBox(secret, "Vault"). Print the label and the result of box.open(1234): "Vault opened: false"

  // 5. Guess again and count. Print the same line for box.open(secret), then print the attempts: "Vault opened: true" "Attempts: 2"
}`,
    solutionCode: `class SafeBox(private val code: Int, val label: String) {
  private var attempts = 0

  fun open(guess: Int): Boolean {
    this.attempts = this.attempts + 1
    return guess == this.code
  }

  fun attemptsUsed() = this.attempts
}

fun main() {
  val secret = 4821
  val box = SafeBox(secret, "Vault")
  println(box.label + " opened: " + box.open(1234))
  println(box.label + " opened: " + box.open(secret))
  println("Attempts: " + box.attemptsUsed())
}`,
    sampleInput: 'main()',
    expectedOutput: 'Vault opened: false\nVault opened: true\nAttempts: 2',
    testCase: { call: '', expected: 'Vault opened: false\nVault opened: true\nAttempts: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'secret', originalLiteral: '4821', alternateLiteral: '1234' }],
      alternateExpectedOutput: 'Vault opened: true\nVault opened: true\nAttempts: 2',
    },
  },
  {
    id: 'world-8-practice-writerun-ledger-privacy',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Use a private property and a private setter, and read them through methods.',
    conceptTags: ['lesson:visibility-modifiers', 'private-set', 'private-property', 'summary-method'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Private Ledger',
    goal: 'A ledger keeps a hidden total. Other code can read the number of entries but cannot change it. Record three amounts, then print a summary and the number of entries.',
    description: 'The class `Ledger` is in the starter code with `total` (private) and `entries` (public to read, private to change).\n\n' +
              '1. **Write `record()`.** It takes `amount: Int`. It adds `amount` to `this.total` and adds `1` to `this.entries`.\n\n' +
              '2. **Write `summary()`.** It returns "Entries: ", `this.entries`, ", total: " and `this.total`, joined with `+`.\n\n' +
              '3. **Create the ledger.** Create `val ledger` as `Ledger()`.\n\n' +
              '4. **Record three amounts.** Call `record` with `100`, then `250`, then `bonus`.\n\n' +
              '5. **Print two lines.** Print the summary and the entries:\n"Entries: 3, total: 390"\n"3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `record()`.** Update both properties.',
          '2. **Write `summary()`.**',
          '3. **Create the ledger.**',
          '4. **Record three amounts.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write record(). Update both properties.',
          '// 2. Write summary().',
          '// 3. Create the ledger.',
          '// 4. Record three amounts.',
          '// 5. Print two lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `record()`.**',
          '2. **Write `summary()`.**',
          '3. **Create the ledger.**',
          '4. **Record three amounts.**',
          '5. **Print two lines.**',
        ],
        comments: [
          '// 1. Write record().',
          '// 2. Write summary().',
          '// 3. Create the ledger.',
          '// 4. Record three amounts.',
          '// 5. Print two lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Ledger.kt',
    initialCode: `class Ledger {
  private var total = 0
  var entries = 0
    private set

  // 1. Write record(). It takes amount: Int. It adds amount to this.total and adds 1 to this.entries.

  // 2. Write summary(). It returns "Entries: ", this.entries, ", total: " and this.total, joined with +.
}

fun main() {
  val bonus = 40

  // 3. Create the ledger. Create val ledger as Ledger().

  // 4. Record three amounts. Call record with 100, then 250, then bonus.

  // 5. Print two lines. Print the summary and the entries: "Entries: 3, total: 390" "3"
}`,
    solutionCode: `class Ledger {
  private var total = 0
  var entries = 0
    private set

  fun record(amount: Int) {
    this.total = this.total + amount
    this.entries = this.entries + 1
  }

  fun summary() = "Entries: " + this.entries + ", total: " + this.total
}

fun main() {
  val bonus = 40
  val ledger = Ledger()
  ledger.record(100)
  ledger.record(250)
  ledger.record(bonus)
  println(ledger.summary())
  println(ledger.entries)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Entries: 3, total: 390\n3',
    testCase: { call: '', expected: 'Entries: 3, total: 390\n3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '40', alternateLiteral: '60' }],
      alternateExpectedOutput: 'Entries: 3, total: 410\n3',
    },
  },
  {
    id: 'world-8-practice-writerun-product-compare',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write a data class, then compare objects by value and make a changed copy.',
    conceptTags: ['lesson:data-classes', 'data-class-equality', 'copy', 'generated-tostring'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Product Compare',
    goal: 'A shop has products with a name and a price. Compare two equal products, make a cheaper copy, and print the results.',
    description: '1. **Write the data class.** Above `main`, write `data class Product` with `val name: String` and `val price: Int`.\n\n' +
              '2. **Create two products.** Create `val a` and `val b`. Both are `Product("Pen", 20)`.\n\n' +
              '3. **Make a sale copy.** Create `val sale` as `a.copy(price = a.price - discount)`.\n\n' +
              '4. **Print four lines.** Print `a`, then `a == b`, then `a == sale`, then `sale`:\n"Product(name=Pen, price=20)"\n"true"\n"false"\n"Product(name=Pen, price=15)"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the data class.**',
          '2. **Create two products.** Use the same values.',
          '3. **Make a sale copy.** Use `copy`.',
          '4. **Print four lines.**',
        ],
        comments: [
          '// 1. Write the data class.',
          '// 2. Create two products. Use the same values.',
          '// 3. Make a sale copy. Use copy.',
          '// 4. Print four lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the data class.**',
          '2. **Create two products.**',
          '3. **Make a sale copy.**',
          '4. **Print four lines.**',
        ],
        comments: [
          '// 1. Write the data class.',
          '// 2. Create two products.',
          '// 3. Make a sale copy.',
          '// 4. Print four lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Products.kt',
    initialCode: `// 1. Write the data class. Above main, write data class Product with val name: String and val price: Int.

fun main() {
  val discount = 5

  // 2. Create two products. Create val a and val b. Both are Product("Pen", 20).

  // 3. Make a sale copy. Create val sale as a.copy(price = a.price - discount).

  // 4. Print four lines. Print a, then a == b, then a == sale, then sale: "Product(name=Pen, price=20)" "true" "false" "Product(name=Pen, price=15)"
}`,
    solutionCode: `data class Product(val name: String, val price: Int)

fun main() {
  val discount = 5
  val a = Product("Pen", 20)
  val b = Product("Pen", 20)
  val sale = a.copy(price = a.price - discount)
  println(a)
  println(a == b)
  println(a == sale)
  println(sale)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Product(name=Pen, price=20)\ntrue\nfalse\nProduct(name=Pen, price=15)',
    testCase: { call: '', expected: 'Product(name=Pen, price=20)\ntrue\nfalse\nProduct(name=Pen, price=15)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'discount', originalLiteral: '5', alternateLiteral: '0' }],
      alternateExpectedOutput: 'Product(name=Pen, price=20)\ntrue\ntrue\nProduct(name=Pen, price=20)',
    },
  },
  {
    id: 'world-8-practice-writerun-order-lines',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Go through data class objects, take them apart, and make a changed copy.',
    conceptTags: ['lesson:data-classes', 'destructuring', 'copy', 'loop', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Order Lines',
    goal: 'An order has three lines. Print each line total, then the subtotal with tax, the most expensive item and a copy of that item with double the amount.',
    description: 'The data class `Line` is in the starter code.\n\n' +
              '1. **Prepare the trackers.** Create `var subtotal = 0` and `var priciest = lines[0]`.\n\n' +
              '2. **Go through the lines.** Loop over `lines`. Take each line apart with `val (item, qty, unit) = line`. Print the item, the quantity and `qty * unit`. Add `qty * unit` to `subtotal`. When `unit` is bigger than `priciest.unit`, set `priciest` to `line`.\n"Pen x3 = 12"\n"Book x2 = 30"\n"Bag x1 = 40"\n\n' +
              '3. **Work out the tax.** Create `val tax` as `subtotal * taxPercent / 100`. Print the subtotal and the tax. Int division drops the fraction:\n"Subtotal: 82, tax: 8"\n\n' +
              '4. **Print the priciest item.** Print its `item`:\n"Priciest: Bag"\n\n' +
              '5. **Print a doubled copy.** Print `priciest.copy(qty = priciest.qty * 2)`:\n"Line(item=Bag, qty=2, unit=40)"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Prepare the trackers.**',
          '2. **Go through the lines.** Take each line apart.',
          '3. **Work out the tax.** Use Int division.',
          '4. **Print the priciest item.**',
          '5. **Print a doubled copy.** Use `copy`.',
        ],
        comments: [
          '// 1. Prepare the trackers.',
          '// 2. Go through the lines. Take each line apart.',
          '// 3. Work out the tax. Use Int division.',
          '// 4. Print the priciest item.',
          '// 5. Print a doubled copy. Use copy.',
        ],
      },
      experienced: {
        steps: [
          '1. **Prepare the trackers.**',
          '2. **Go through the lines.**',
          '3. **Work out the tax.**',
          '4. **Print the priciest item.**',
          '5. **Print a doubled copy.**',
        ],
        comments: [
          '// 1. Prepare the trackers.',
          '// 2. Go through the lines.',
          '// 3. Work out the tax.',
          '// 4. Print the priciest item.',
          '// 5. Print a doubled copy.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'OrderLines.kt',
    initialCode: `data class Line(val item: String, val qty: Int, val unit: Int)

fun main() {
  val taxPercent = 10
  val lines = listOf(Line("Pen", 3, 4), Line("Book", 2, 15), Line("Bag", 1, 40))

  // 1. Prepare the trackers. Create var subtotal = 0 and var priciest = lines[0].

  // 2. Go through the lines. Loop over lines. Take each line apart with val (item, qty, unit) = line. Print the item, the quantity and qty * unit. Add qty * unit to subtotal. When unit is bigger than priciest.unit, set priciest to line. "Pen x3 = 12" "Book x2 = 30" "Bag x1 = 40"

  // 3. Work out the tax. Create val tax as subtotal * taxPercent / 100. Print the subtotal and the tax. Int division drops the fraction: "Subtotal: 82, tax: 8"

  // 4. Print the priciest item. Print its item: "Priciest: Bag"

  // 5. Print a doubled copy. Print priciest.copy(qty = priciest.qty * 2): "Line(item=Bag, qty=2, unit=40)"
}`,
    solutionCode: `data class Line(val item: String, val qty: Int, val unit: Int)

fun main() {
  val taxPercent = 10
  val lines = listOf(Line("Pen", 3, 4), Line("Book", 2, 15), Line("Bag", 1, 40))
  var subtotal = 0
  var priciest = lines[0]
  for (line in lines) {
    val (item, qty, unit) = line
    println(item + " x" + qty + " = " + qty * unit)
    subtotal += qty * unit
    if (unit > priciest.unit) {
      priciest = line
    }
  }
  val tax = subtotal * taxPercent / 100
  println("Subtotal: " + subtotal + ", tax: " + tax)
  println("Priciest: " + priciest.item)
  println(priciest.copy(qty = priciest.qty * 2))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Pen x3 = 12\nBook x2 = 30\nBag x1 = 40\nSubtotal: 82, tax: 8\nPriciest: Bag\nLine(item=Bag, qty=2, unit=40)',
    testCase: { call: '', expected: 'Pen x3 = 12\nBook x2 = 30\nBag x1 = 40\nSubtotal: 82, tax: 8\nPriciest: Bag\nLine(item=Bag, qty=2, unit=40)' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'taxPercent', originalLiteral: '10', alternateLiteral: '25' }],
      alternateExpectedOutput: 'Pen x3 = 12\nBook x2 = 30\nBag x1 = 40\nSubtotal: 82, tax: 20\nPriciest: Bag\nLine(item=Bag, qty=2, unit=40)',
    },
  },
  {
    id: 'world-8-practice-writerun-traffic-cycle',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write an enum with a property, loop over its constants and add up a value.',
    conceptTags: ['lesson:enums', 'enum-constructor-property', 'enum-values', 'ordinal'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Traffic Cycle',
    goal: 'A traffic light has three colors, and each one lasts some seconds. Print each color with its number, add up the cycle time, and find the time for several rounds.',
    description: '1. **Write the enum.** Above `main`, write `enum class Signal(val seconds: Int)` with three constants: `RED(30)`, `GREEN(25)` and `YELLOW(5)`.\n\n' +
              '2. **Print every color.** Loop over `Signal.values()`. Print the number (`s.ordinal + 1`), the name and the seconds, and add `s.seconds` to `cycle`. Use a string template:\n"1. RED 30s"\n"2. GREEN 25s"\n"3. YELLOW 5s"\n\n' +
              '3. **Print the cycle.** Print `cycle` with the text "Cycle: " before it and "s" after it:\n"Cycle: 60s"\n\n' +
              '4. **Print the time for all rounds.** Multiply `cycle` by `rounds`:\n"After 3 rounds: 180s"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the enum.** Give each constant its seconds.',
          '2. **Print every color.** Use `values()` and `ordinal`.',
          '3. **Print the cycle.**',
          '4. **Print the time for all rounds.**',
        ],
        comments: [
          '// 1. Write the enum. Give each constant its seconds.',
          '// 2. Print every color. Use values() and ordinal.',
          '// 3. Print the cycle.',
          '// 4. Print the time for all rounds.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the enum.**',
          '2. **Print every color.**',
          '3. **Print the cycle.**',
          '4. **Print the time for all rounds.**',
        ],
        comments: [
          '// 1. Write the enum.',
          '// 2. Print every color.',
          '// 3. Print the cycle.',
          '// 4. Print the time for all rounds.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Traffic.kt',
    initialCode: `// 1. Write the enum. Above main, write enum class Signal(val seconds: Int) with three constants: RED(30), GREEN(25) and YELLOW(5).

fun main() {
  val rounds = 3
  var cycle = 0

  // 2. Print every color. Loop over Signal.values(). Print the number (s.ordinal + 1), the name and the seconds, and add s.seconds to cycle. Use a string template: "1. RED 30s" "2. GREEN 25s" "3. YELLOW 5s"

  // 3. Print the cycle. Print cycle with the text "Cycle: " before it and "s" after it: "Cycle: 60s"

  // 4. Print the time for all rounds. Multiply cycle by rounds: "After 3 rounds: 180s"
}`,
    solutionCode: `enum class Signal(val seconds: Int) {
  RED(30), GREEN(25), YELLOW(5)
}

fun main() {
  val rounds = 3
  var cycle = 0
  for (s in Signal.values()) {
    println("\${s.ordinal + 1}. \${s.name} \${s.seconds}s")
    cycle += s.seconds
  }
  println("Cycle: " + cycle + "s")
  println("After " + rounds + " rounds: " + cycle * rounds + "s")
}`,
    sampleInput: 'main()',
    expectedOutput: '1. RED 30s\n2. GREEN 25s\n3. YELLOW 5s\nCycle: 60s\nAfter 3 rounds: 180s',
    testCase: { call: '', expected: '1. RED 30s\n2. GREEN 25s\n3. YELLOW 5s\nCycle: 60s\nAfter 3 rounds: 180s' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'rounds', originalLiteral: '3', alternateLiteral: '4' }],
      alternateExpectedOutput: '1. RED 30s\n2. GREEN 25s\n3. YELLOW 5s\nCycle: 60s\nAfter 4 rounds: 240s',
    },
  },
  {
    id: 'world-8-practice-writerun-size-menu',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Use an enum in a list, with a function that picks a letter for each size.',
    conceptTags: ['lesson:enums', 'when-over-enum', 'enum-in-list', 'enum-equality', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Size Menu',
    goal: 'A coffee shop sells three sizes. For an order of four cups, find the size letters, the total cost with an extra shot, the total volume and the number of small cups.',
    description: 'The enum `Size` is in the starter code.\n\n' +
              '1. **Write `label()`.** Above `main`, write `fun label(size: Size): String`. Use `when` to return "S" for `SMALL`, "M" for `MEDIUM` and "L" for `LARGE`.\n\n' +
              '2. **Go through the order.** Loop over `order`. For each `size`, add `size.price + extraShot` to `cost` and `size.ml` to `volume`. Add `label(size)` to `codes`. When `size` is `Size.SMALL`, add `1` to `smalls`.\n\n' +
              '3. **Print three lines.** Join the text with `+`:\n"Order: SLSM"\n"Cost: 20, volume: 1350ml"\n"Smalls: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `label()`.** Use `when` on the enum.',
          '2. **Go through the order.** Update all four counters.',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write label(). Use when on the enum.',
          '// 2. Go through the order. Update all four counters.',
          '// 3. Print three lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `label()`.**',
          '2. **Go through the order.**',
          '3. **Print three lines.**',
        ],
        comments: [
          '// 1. Write label().',
          '// 2. Go through the order.',
          '// 3. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SizeMenu.kt',
    initialCode: `enum class Size(val ml: Int, val price: Int) {
  SMALL(250, 3), MEDIUM(350, 4), LARGE(500, 6)
}

// 1. Write label(). Above main, write fun label(size: Size): String. Use when to return "S" for SMALL, "M" for MEDIUM and "L" for LARGE.

fun main() {
  val extraShot = 1
  val order = listOf(Size.SMALL, Size.LARGE, Size.SMALL, Size.MEDIUM)
  var cost = 0
  var volume = 0
  var smalls = 0
  var codes = ""

  // 2. Go through the order. Loop over order. For each size, add size.price + extraShot to cost and size.ml to volume. Add label(size) to codes. When size is Size.SMALL, add 1 to smalls.

  // 3. Print three lines. Join the text with +: "Order: SLSM" "Cost: 20, volume: 1350ml" "Smalls: 2"
}`,
    solutionCode: `enum class Size(val ml: Int, val price: Int) {
  SMALL(250, 3), MEDIUM(350, 4), LARGE(500, 6)
}

fun label(size: Size): String {
  return when (size) {
    Size.SMALL -> "S"
    Size.MEDIUM -> "M"
    Size.LARGE -> "L"
  }
}

fun main() {
  val extraShot = 1
  val order = listOf(Size.SMALL, Size.LARGE, Size.SMALL, Size.MEDIUM)
  var cost = 0
  var volume = 0
  var smalls = 0
  var codes = ""
  for (size in order) {
    cost += size.price + extraShot
    volume += size.ml
    codes += label(size)
    if (size == Size.SMALL) {
      smalls++
    }
  }
  println("Order: " + codes)
  println("Cost: " + cost + ", volume: " + volume + "ml")
  println("Smalls: " + smalls)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Order: SLSM\nCost: 20, volume: 1350ml\nSmalls: 2',
    testCase: { call: '', expected: 'Order: SLSM\nCost: 20, volume: 1350ml\nSmalls: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'extraShot', originalLiteral: '1', alternateLiteral: '2' }],
      alternateExpectedOutput: 'Order: SLSM\nCost: 24, volume: 1350ml\nSmalls: 2',
    },
  },
  {
    id: 'world-8-practice-writerun-vehicle-fleet',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write two subclasses of an open class, and call a method from the parent.',
    conceptTags: ['lesson:basic-inheritance', 'open-class', 'super-constructor-call', 'super-method-call'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Vehicle Fleet',
    goal: 'A fleet has vehicles. A bike and a truck both extend a general vehicle class. The truck also carries a load. Print a description of each and the total number of wheels.',
    description: 'The open class `Vehicle` is in the starter code.\n\n' +
              '1. **Write `Bike`.** Write `class Bike(name: String)` that extends `Vehicle`. Pass `name` and `2` wheels to `Vehicle`.\n\n' +
              '2. **Write `Truck`.** Write `class Truck(name: String, val load: Int)` that extends `Vehicle`. Pass `name` and `6` wheels. Override `describe()`: return `super.describe()` plus " and carries ", `this.load` and "kg".\n\n' +
              '3. **Create two vehicles.** Create `val bike` as `Bike("Swift")` and `val truck` as `Truck("Hauler", capacity)`.\n\n' +
              '4. **Print two descriptions.** Print `bike.describe()` and `truck.describe()`:\n"Swift has 2 wheels"\n"Hauler has 6 wheels and carries 800kg"\n\n' +
              '5. **Print the wheels.** Add `bike.wheels` and `truck.wheels`:\n"Wheels: 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Bike`.** Extend `Vehicle`.',
          '2. **Write `Truck`.** Extend `Vehicle` and override `describe()`.',
          '3. **Create two vehicles.**',
          '4. **Print two descriptions.**',
          '5. **Print the wheels.**',
        ],
        comments: [
          '// 1. Write Bike. Extend Vehicle.',
          '// 2. Write Truck. Extend Vehicle and override describe().',
          '// 3. Create two vehicles.',
          '// 4. Print two descriptions.',
          '// 5. Print the wheels.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Bike`.**',
          '2. **Write `Truck`.**',
          '3. **Create two vehicles.**',
          '4. **Print two descriptions.**',
          '5. **Print the wheels.**',
        ],
        comments: [
          '// 1. Write Bike.',
          '// 2. Write Truck.',
          '// 3. Create two vehicles.',
          '// 4. Print two descriptions.',
          '// 5. Print the wheels.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Fleet.kt',
    initialCode: `open class Vehicle(val name: String, val wheels: Int) {
  open fun describe() = this.name + " has " + this.wheels + " wheels"
}

// 1. Write Bike. Write class Bike(name: String) that extends Vehicle. Pass name and 2 wheels to Vehicle.

// 2. Write Truck. Write class Truck(name: String, val load: Int) that extends Vehicle. Pass name and 6 wheels. Override describe(): return super.describe() plus " and carries ", this.load and "kg".

fun main() {
  val capacity = 800

  // 3. Create two vehicles. Create val bike as Bike("Swift") and val truck as Truck("Hauler", capacity).

  // 4. Print two descriptions. Print bike.describe() and truck.describe(): "Swift has 2 wheels" "Hauler has 6 wheels and carries 800kg"

  // 5. Print the wheels. Add bike.wheels and truck.wheels: "Wheels: 8"
}`,
    solutionCode: `open class Vehicle(val name: String, val wheels: Int) {
  open fun describe() = this.name + " has " + this.wheels + " wheels"
}

class Bike(name: String) : Vehicle(name, 2)

class Truck(name: String, val load: Int) : Vehicle(name, 6) {
  override fun describe() = super.describe() + " and carries " + this.load + "kg"
}

fun main() {
  val capacity = 800
  val bike = Bike("Swift")
  val truck = Truck("Hauler", capacity)
  println(bike.describe())
  println(truck.describe())
  println("Wheels: " + (bike.wheels + truck.wheels))
}`,
    sampleInput: 'main()',
    expectedOutput: 'Swift has 2 wheels\nHauler has 6 wheels and carries 800kg\nWheels: 8',
    testCase: { call: '', expected: 'Swift has 2 wheels\nHauler has 6 wheels and carries 800kg\nWheels: 8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'capacity', originalLiteral: '800', alternateLiteral: '1200' }],
      alternateExpectedOutput: 'Swift has 2 wheels\nHauler has 6 wheels and carries 1200kg\nWheels: 8',
    },
  },
  {
    id: 'world-8-practice-writerun-payroll',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Override a method in two subclasses and add up the pay of a mixed list.',
    conceptTags: ['lesson:basic-inheritance', 'lesson:overriding-members', 'polymorphic-list', 'super-call', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Payroll',
    goal: 'A company has employees, managers and interns. A manager gets a bonus and an intern gets half pay. Print the pay of each person and the total payroll.',
    description: 'The open class `Employee` is in the starter code.\n\n' +
              '1. **Write `Manager`.** Write `class Manager(name: String, base: Int, val bonus: Int)` that extends `Employee`. Override `pay()`: return `super.pay()` plus `this.bonus`.\n\n' +
              '2. **Write `Intern`.** Write `class Intern(name: String)` that extends `Employee`. Pass `name` and a base of `505`. Override `pay()`: return `super.pay() / 2`.\n\n' +
              '3. **Make the staff list.** Create `val staff: List<Employee>` with `Employee("Ana", 2000)`, `Manager("Bo", 3000, bonus)` and `Intern("Cy")`. Also create `var payroll = 0`.\n\n' +
              '4. **Print every pay.** Loop over `staff`. Print the name and `e.pay()`, and add `e.pay()` to `payroll`:\n"Ana: 2000"\n"Bo: 3800"\n"Cy: 252"\n\n' +
              '5. **Print the payroll.**\n"Payroll: 6052"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Manager`.** Add the bonus to the base pay.',
          '2. **Write `Intern`.** Halve the base pay.',
          '3. **Make the staff list.**',
          '4. **Print every pay.** Add up the payroll.',
          '5. **Print the payroll.**',
        ],
        comments: [
          '// 1. Write Manager. Add the bonus to the base pay.',
          '// 2. Write Intern. Halve the base pay.',
          '// 3. Make the staff list.',
          '// 4. Print every pay. Add up the payroll.',
          '// 5. Print the payroll.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Manager`.**',
          '2. **Write `Intern`.**',
          '3. **Make the staff list.**',
          '4. **Print every pay.**',
          '5. **Print the payroll.**',
        ],
        comments: [
          '// 1. Write Manager.',
          '// 2. Write Intern.',
          '// 3. Make the staff list.',
          '// 4. Print every pay.',
          '// 5. Print the payroll.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Payroll.kt',
    initialCode: `open class Employee(val name: String, val base: Int) {
  open fun pay() = this.base
}

// 1. Write Manager. Write class Manager(name: String, base: Int, val bonus: Int) that extends Employee. Override pay(): return super.pay() plus this.bonus.

// 2. Write Intern. Write class Intern(name: String) that extends Employee. Pass name and a base of 505. Override pay(): return super.pay() / 2.

fun main() {
  val bonus = 800

  // 3. Make the staff list. Create val staff: List<Employee> with Employee("Ana", 2000), Manager("Bo", 3000, bonus) and Intern("Cy"). Also create var payroll = 0.

  // 4. Print every pay. Loop over staff. Print the name and e.pay(), and add e.pay() to payroll: "Ana: 2000" "Bo: 3800" "Cy: 252"

  // 5. Print the payroll. "Payroll: 6052"
}`,
    solutionCode: `open class Employee(val name: String, val base: Int) {
  open fun pay() = this.base
}

class Manager(name: String, base: Int, val bonus: Int) : Employee(name, base) {
  override fun pay() = super.pay() + this.bonus
}

class Intern(name: String) : Employee(name, 505) {
  override fun pay() = super.pay() / 2
}

fun main() {
  val bonus = 800
  val staff: List<Employee> = listOf(Employee("Ana", 2000), Manager("Bo", 3000, bonus), Intern("Cy"))
  var payroll = 0
  for (e in staff) {
    println(e.name + ": " + e.pay())
    payroll += e.pay()
  }
  println("Payroll: " + payroll)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Ana: 2000\nBo: 3800\nCy: 252\nPayroll: 6052',
    testCase: { call: '', expected: 'Ana: 2000\nBo: 3800\nCy: 252\nPayroll: 6052' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'bonus', originalLiteral: '800', alternateLiteral: '1000' }],
      alternateExpectedOutput: 'Ana: 2000\nBo: 4000\nCy: 252\nPayroll: 6252',
    },
  },
  {
    id: 'world-8-practice-writerun-shape-areas',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Write two classes that implement one interface, and use them in a list.',
    conceptTags: ['lesson:interfaces', 'implement-interface', 'list-of-interface-type'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Shape Areas',
    goal: 'Two kinds of shapes both know their area and their label. Make a list with one of each, print each shape, and print the total area.',
    description: 'The interface `Shape` is in the starter code.\n\n' +
              '1. **Write `Square`.** Write `class Square(val side: Int)` that implements `Shape`. `area()` returns `this.side * this.side`. `label()` returns "Square " plus `this.side`.\n\n' +
              '2. **Write `Rect`.** Write `class Rect(val w: Int, val h: Int)` that implements `Shape`. `area()` returns `this.w * this.h`. `label()` returns "Rect ", `this.w`, "x" and `this.h`, joined with `+`.\n\n' +
              '3. **Make the list.** Create `val shapes: List<Shape>` with `Square(side)` and `Rect(4, 3)`. Also create `var total = 0`.\n\n' +
              '4. **Print the shapes.** Loop over `shapes`. Print the label, " = " and the area, and add the area to `total`. Then print the total:\n"Square 5 = 25"\n"Rect 4x3 = 12"\n"Total area: 37"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Square`.** Implement both functions.',
          '2. **Write `Rect`.** Implement both functions.',
          '3. **Make the list.**',
          '4. **Print the shapes.** Add up the total.',
        ],
        comments: [
          '// 1. Write Square. Implement both functions.',
          '// 2. Write Rect. Implement both functions.',
          '// 3. Make the list.',
          '// 4. Print the shapes. Add up the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Square`.**',
          '2. **Write `Rect`.**',
          '3. **Make the list.**',
          '4. **Print the shapes.**',
        ],
        comments: [
          '// 1. Write Square.',
          '// 2. Write Rect.',
          '// 3. Make the list.',
          '// 4. Print the shapes.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Shapes.kt',
    initialCode: `interface Shape {
  fun area(): Int
  fun label(): String
}

// 1. Write Square. Write class Square(val side: Int) that implements Shape. area() returns this.side * this.side. label() returns "Square " plus this.side.

// 2. Write Rect. Write class Rect(val w: Int, val h: Int) that implements Shape. area() returns this.w * this.h. label() returns "Rect ", this.w, "x" and this.h, joined with +.

fun main() {
  val side = 5

  // 3. Make the list. Create val shapes: List<Shape> with Square(side) and Rect(4, 3). Also create var total = 0.

  // 4. Print the shapes. Loop over shapes. Print the label, " = " and the area, and add the area to total. Then print the total: "Square 5 = 25" "Rect 4x3 = 12" "Total area: 37"
}`,
    solutionCode: `interface Shape {
  fun area(): Int
  fun label(): String
}

class Square(val side: Int) : Shape {
  override fun area() = this.side * this.side
  override fun label() = "Square " + this.side
}

class Rect(val w: Int, val h: Int) : Shape {
  override fun area() = this.w * this.h
  override fun label() = "Rect " + this.w + "x" + this.h
}

fun main() {
  val side = 5
  val shapes: List<Shape> = listOf(Square(side), Rect(4, 3))
  var total = 0
  for (s in shapes) {
    println(s.label() + " = " + s.area())
    total += s.area()
  }
  println("Total area: " + total)
}`,
    sampleInput: 'main()',
    expectedOutput: 'Square 5 = 25\nRect 4x3 = 12\nTotal area: 37',
    testCase: { call: '', expected: 'Square 5 = 25\nRect 4x3 = 12\nTotal area: 37' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'side', originalLiteral: '5', alternateLiteral: '6' }],
      alternateExpectedOutput: 'Square 6 = 36\nRect 4x3 = 12\nTotal area: 48',
    },
  },
  {
    id: 'world-8-practice-writerun-notifier-channels',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Write two classes for one interface and send one message through both.',
    conceptTags: ['lesson:interfaces', 'two-implementers', 'function-takes-interface-list', 'string-take'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Notifier Channels',
    goal: 'An app can send a message by email or by SMS. An SMS keeps only the first ten characters. Send one message through both channels and print how many characters were sent in total.',
    description: 'The interface `Notifier` and the function `broadcast` are in the starter code. `broadcast` prints each line and returns the number of characters.\n\n' +
              '1. **Write `Email`.** Write `class Email(val address: String)` that implements `Notifier`. `send(message)` returns "EMAIL to ", `this.address`, ": " and `message`, joined with `+`.\n\n' +
              '2. **Write `Sms`.** Write `class Sms(val number: String)` that implements `Notifier`. `send(message)` returns "SMS to ", `this.number`, ": " and `message.take(10)`, joined with `+`.\n\n' +
              '3. **Send the message.** Create `val sent` as `broadcast(listOf(Email("ops@x.org"), Sms("555-0101")), text)`. It prints two lines:\n"EMAIL to ops@x.org: Server restarts at noon"\n"SMS to 555-0101: Server res"\n\n' +
              '4. **Print the total.** Print `sent`:\n"Characters sent: 70"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Email`.** Implement `send`.',
          '2. **Write `Sms`.** Keep only ten characters of the message.',
          '3. **Send the message.** Use `broadcast`.',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write Email. Implement send.',
          '// 2. Write Sms. Keep only ten characters of the message.',
          '// 3. Send the message. Use broadcast.',
          '// 4. Print the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Email`.**',
          '2. **Write `Sms`.**',
          '3. **Send the message.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write Email.',
          '// 2. Write Sms.',
          '// 3. Send the message.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Notifier.kt',
    initialCode: `interface Notifier {
  fun send(message: String): String
}

fun broadcast(targets: List<Notifier>, message: String): Int {
  var chars = 0
  for (t in targets) {
    val line = t.send(message)
    println(line)
    chars += line.length
  }
  return chars
}

// 1. Write Email. Write class Email(val address: String) that implements Notifier. send(message) returns "EMAIL to ", this.address, ": " and message, joined with +.

// 2. Write Sms. Write class Sms(val number: String) that implements Notifier. send(message) returns "SMS to ", this.number, ": " and message.take(10), joined with +.

fun main() {
  val text = "Server restarts at noon"

  // 3. Send the message. Create val sent as broadcast(listOf(Email("ops@x.org"), Sms("555-0101")), text). It prints two lines: "EMAIL to ops@x.org: Server restarts at noon" "SMS to 555-0101: Server res"

  // 4. Print the total. Print sent: "Characters sent: 70"
}`,
    solutionCode: `interface Notifier {
  fun send(message: String): String
}

class Email(val address: String) : Notifier {
  override fun send(message: String) = "EMAIL to " + this.address + ": " + message
}

class Sms(val number: String) : Notifier {
  override fun send(message: String) = "SMS to " + this.number + ": " + message.take(10)
}

fun broadcast(targets: List<Notifier>, message: String): Int {
  var chars = 0
  for (t in targets) {
    val line = t.send(message)
    println(line)
    chars += line.length
  }
  return chars
}

fun main() {
  val text = "Server restarts at noon"
  val sent = broadcast(listOf(Email("ops@x.org"), Sms("555-0101")), text)
  println("Characters sent: " + sent)
}`,
    sampleInput: 'main()',
    expectedOutput: 'EMAIL to ops@x.org: Server restarts at noon\nSMS to 555-0101: Server res\nCharacters sent: 70',
    testCase: { call: '', expected: 'EMAIL to ops@x.org: Server restarts at noon\nSMS to 555-0101: Server res\nCharacters sent: 70' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'text', originalLiteral: '"Server restarts at noon"', alternateLiteral: '"Backup done"' }],
      alternateExpectedOutput: 'EMAIL to ops@x.org: Backup done\nSMS to 555-0101: Backup don\nCharacters sent: 58',
    },
  },
  {
    id: 'world-8-practice-writerun-animal-sounds',
    worldId: 'world-8',
    difficulty: 'medium',
    summary: 'Override a property and a method, and keep the parent values where you do not.',
    conceptTags: ['lesson:overriding-members', 'override-property', 'override-method', 'polymorphic-list'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Animal Sounds',
    goal: 'Animals have four legs and a sound. A bird has its own number of legs and sound. A cat has its own sound. Print each animal and the total number of legs.',
    description: 'The open class `Animal` is in the starter code.\n\n' +
              '1. **Write `Bird`.** Write `class Bird(override val legs: Int)` that extends `Animal`. Override `sound()` to return "Tweet".\n\n' +
              '2. **Write `Cat`.** Write `class Cat` that extends `Animal`. Override `sound()` to return "Meow". Keep the legs from `Animal`.\n\n' +
              '3. **Make the zoo.** Create `val zoo: List<Animal>` with `Animal()`, `Bird(birdLegs)` and `Cat()`. Also create `var legs = 0`.\n\n' +
              '4. **Print every animal.** Loop over `zoo`. Print the sound and the legs, and add the legs to `legs`. Then print the total:\n"... 4"\n"Tweet 2"\n"Meow 4"\n"Total legs: 10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Bird`.** Override the legs and the sound.',
          '2. **Write `Cat`.** Override only the sound.',
          '3. **Make the zoo.**',
          '4. **Print every animal.** Add up the legs.',
        ],
        comments: [
          '// 1. Write Bird. Override the legs and the sound.',
          '// 2. Write Cat. Override only the sound.',
          '// 3. Make the zoo.',
          '// 4. Print every animal. Add up the legs.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Bird`.**',
          '2. **Write `Cat`.**',
          '3. **Make the zoo.**',
          '4. **Print every animal.**',
        ],
        comments: [
          '// 1. Write Bird.',
          '// 2. Write Cat.',
          '// 3. Make the zoo.',
          '// 4. Print every animal.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Animals.kt',
    initialCode: `open class Animal {
  open val legs: Int = 4
  open fun sound() = "..."
}

// 1. Write Bird. Write class Bird(override val legs: Int) that extends Animal. Override sound() to return "Tweet".

// 2. Write Cat. Write class Cat that extends Animal. Override sound() to return "Meow". Keep the legs from Animal.

fun main() {
  val birdLegs = 2

  // 3. Make the zoo. Create val zoo: List<Animal> with Animal(), Bird(birdLegs) and Cat(). Also create var legs = 0.

  // 4. Print every animal. Loop over zoo. Print the sound and the legs, and add the legs to legs. Then print the total: "... 4" "Tweet 2" "Meow 4" "Total legs: 10"
}`,
    solutionCode: `open class Animal {
  open val legs: Int = 4
  open fun sound() = "..."
}

class Bird(override val legs: Int) : Animal() {
  override fun sound() = "Tweet"
}

class Cat : Animal() {
  override fun sound() = "Meow"
}

fun main() {
  val birdLegs = 2
  val zoo: List<Animal> = listOf(Animal(), Bird(birdLegs), Cat())
  var legs = 0
  for (a in zoo) {
    println(a.sound() + " " + a.legs)
    legs += a.legs
  }
  println("Total legs: " + legs)
}`,
    sampleInput: 'main()',
    expectedOutput: '... 4\nTweet 2\nMeow 4\nTotal legs: 10',
    testCase: { call: '', expected: '... 4\nTweet 2\nMeow 4\nTotal legs: 10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'birdLegs', originalLiteral: '2', alternateLiteral: '3' }],
      alternateExpectedOutput: '... 4\nTweet 3\nMeow 4\nTotal legs: 11',
    },
  },
  {
    id: 'world-8-practice-writerun-discount-policy',
    worldId: 'world-8',
    difficulty: 'hard',
    summary: 'Override a method with a parameter in two subclasses and compare the prices.',
    conceptTags: ['lesson:overriding-members', 'override-method-with-parameter', 'polymorphic-list', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Discount Policy',
    goal: 'A shop has three offers: no discount, a percent off and a flat amount off. Work out the price for each offer and print the cheapest one.',
    description: 'The open class `Discount` is in the starter code.\n\n' +
              '1. **Write `Percent`.** Write `class Percent(label: String, val percent: Int)` that extends `Discount`. Override `apply(price)`: return `price - price * this.percent / 100`. Int division drops the fraction.\n\n' +
              '2. **Write `Flat`.** Write `class Flat(label: String, val amount: Int)` that extends `Discount`. Override `apply(price)`: return `price - this.amount`.\n\n' +
              '3. **Make the offers.** Create `val offers: List<Discount>` with `Discount("None")`, `Percent("Spring", 15)` and `Flat("Coupon", 40)`. Also create `var cheapest` and start it at `basePrice`.\n\n' +
              '4. **Price every offer.** Loop over `offers`. Create `val result` as `offer.apply(basePrice)`. Print the label and `result`. When `result` is smaller than `cheapest`, set `cheapest` to `result`:\n"None: 250"\n"Spring: 213"\n"Coupon: 210"\n\n' +
              '5. **Print the cheapest price.** After the loop:\n"Cheapest: 210"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write `Percent`.** Take a percent off.',
          '2. **Write `Flat`.** Take a fixed amount off.',
          '3. **Make the offers.** Start `cheapest` at the base price.',
          '4. **Price every offer.** Keep the cheapest.',
          '5. **Print the cheapest price.**',
        ],
        comments: [
          '// 1. Write Percent. Take a percent off.',
          '// 2. Write Flat. Take a fixed amount off.',
          '// 3. Make the offers. Start cheapest at the base price.',
          '// 4. Price every offer. Keep the cheapest.',
          '// 5. Print the cheapest price.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write `Percent`.**',
          '2. **Write `Flat`.**',
          '3. **Make the offers.**',
          '4. **Price every offer.**',
          '5. **Print the cheapest price.**',
        ],
        comments: [
          '// 1. Write Percent.',
          '// 2. Write Flat.',
          '// 3. Make the offers.',
          '// 4. Price every offer.',
          '// 5. Print the cheapest price.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'Discounts.kt',
    initialCode: `open class Discount(val label: String) {
  open fun apply(price: Int) = price
}

// 1. Write Percent. Write class Percent(label: String, val percent: Int) that extends Discount. Override apply(price): return price - price * this.percent / 100. Int division drops the fraction.

// 2. Write Flat. Write class Flat(label: String, val amount: Int) that extends Discount. Override apply(price): return price - this.amount.

fun main() {
  val basePrice = 250

  // 3. Make the offers. Create val offers: List<Discount> with Discount("None"), Percent("Spring", 15) and Flat("Coupon", 40). Also create var cheapest and start it at basePrice.

  // 4. Price every offer. Loop over offers. Create val result as offer.apply(basePrice). Print the label and result. When result is smaller than cheapest, set cheapest to result: "None: 250" "Spring: 213" "Coupon: 210"

  // 5. Print the cheapest price. After the loop: "Cheapest: 210"
}`,
    solutionCode: `open class Discount(val label: String) {
  open fun apply(price: Int) = price
}

class Percent(label: String, val percent: Int) : Discount(label) {
  override fun apply(price: Int) = price - price * this.percent / 100
}

class Flat(label: String, val amount: Int) : Discount(label) {
  override fun apply(price: Int) = price - this.amount
}

fun main() {
  val basePrice = 250
  val offers: List<Discount> = listOf(Discount("None"), Percent("Spring", 15), Flat("Coupon", 40))
  var cheapest = basePrice
  for (offer in offers) {
    val result = offer.apply(basePrice)
    println(offer.label + ": " + result)
    if (result < cheapest) {
      cheapest = result
    }
  }
  println("Cheapest: " + cheapest)
}`,
    sampleInput: 'main()',
    expectedOutput: 'None: 250\nSpring: 213\nCoupon: 210\nCheapest: 210',
    testCase: { call: '', expected: 'None: 250\nSpring: 213\nCoupon: 210\nCheapest: 210' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'basePrice', originalLiteral: '250', alternateLiteral: '200' }],
      alternateExpectedOutput: 'None: 200\nSpring: 170\nCoupon: 160\nCheapest: 160',
    },
  },
];

export const WORLD_8_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  {
    id: 'world-8-practice-debug-shared-score',
    worldId: 'world-8',
    conceptTags: ['lesson:classes', 'alias-vs-new-instance', 'independent-state'],
    summary: 'Two names for one object make both counters change.',
    title: 'Fix the Shared Counter',
    subtitle: 'Only `second` should change, so the program should print "First: 0" and "Second: 5", but it prints "First: 5" and "Second: 5".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: two names for one object',
    brokenCode: `class Counter(var count: Int)

fun main() {
  val first = Counter(0)
  val second = first
  second.count = second.count + 5
  println("First: " + first.count)
  println("Second: " + second.count)
}`,
    fixedCode: `class Counter(var count: Int)

fun main() {
  val first = Counter(0)
  val second = Counter(0)
  second.count = second.count + 5
  println("First: " + first.count)
  println("Second: " + second.count)
}`,
    expectedOutput: 'First: 0\nSecond: 5',
    hints: [
              'Both lines show 5, but the code adds 5 only once. How many counters does the program really have?',
              '`val second = first` does not make a new counter. It gives the same counter a second name. What happens when one name changes it?',
              'Make `second` a counter of its own.',
            ],
    explanation: '`val second = first` copies the reference, not the object, so `first` and `second` are two names for ONE `Counter`. Adding 5 through `second` changes what `first` shows too. `Counter(0)` creates a separate object, so only `second` changes.',
  },
  {
    id: 'world-8-practice-debug-scattered-total',
    worldId: 'world-8',
    conceptTags: ['lesson:objects', 'object-vs-class-state'],
    summary: 'A new object is made on every call, so the total is lost.',
    title: 'Fix the Lost Total',
    subtitle: 'The program should print "Total: 30", but it prints "Total: 0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a new instance each time instead of one shared object',
    brokenCode: `class Stats {
  var total = 0
  fun add(n: Int) {
    this.total = this.total + n
  }
}

fun main() {
  Stats().add(10)
  Stats().add(20)
  println("Total: " + Stats().total)
}`,
    fixedCode: `object Stats {
  var total = 0
  fun add(n: Int) {
    this.total = this.total + n
  }
}

fun main() {
  Stats.add(10)
  Stats.add(20)
  println("Total: " + Stats.total)
}`,
    expectedOutput: 'Total: 30',
    hints: [
              'Both numbers are added, but the total is `0`. Where does each number go?',
              'Every `Stats()` call creates a NEW object with its own total of `0`. What do you need so that all calls share one total?',
              'Use a declaration that makes exactly one shared instance, and call it by its name.',
            ],
    explanation: 'A `class` makes a new object each time you call `Stats()`, so `10` and `20` were added to two objects that were thrown away, and a third new object was printed. An `object` is created once, so every `Stats.add(...)` and `Stats.total` use the same total.',
  },
  {
    id: 'world-8-practice-debug-frozen-balance',
    worldId: 'world-8',
    conceptTags: ['lesson:properties', 'val-property-reassignment'],
    summary: 'A val property cannot be changed, so the program does not compile.',
    title: 'Fix the Frozen Balance',
    subtitle: 'The program should print "Mia: 150", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a val property cannot be reassigned',
    brokenCode: `class Savings(val owner: String, val balance: Int)

fun main() {
  val acc = Savings("Mia", 100)
  acc.balance += 50
  println(acc.owner + ": " + acc.balance)
}`,
    fixedCode: `class Savings(val owner: String, var balance: Int)

fun main() {
  val acc = Savings("Mia", 100)
  acc.balance += 50
  println(acc.owner + ": " + acc.balance)
}`,
    expectedOutput: 'Mia: 150',
    hints: [
              'The error is on the line that adds `50`. What is that line trying to do to `balance`?',
              'The line changes `balance`. How is `balance` declared in the class?',
              'Make the property a kind that can change after it is created.',
            ],
    explanation: 'A `val` property is set once and can never be assigned again, so `acc.balance += 50` is a compile error. A `var` property can change. With `var balance`, the balance becomes 150.',
  },
  {
    id: 'world-8-practice-debug-fence-length',
    worldId: 'world-8',
    conceptTags: ['lesson:methods', 'wrong-formula'],
    summary: 'A method adds two sides and forgets the other two.',
    title: 'Fix the Fence Length',
    subtitle: 'The fence of a 12 by 8 garden should be 40, so the program should print "Fence: 40", but it prints "Fence: 20".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the method forgets two sides',
    brokenCode: `class Garden(val length: Int, val width: Int) {
  fun fenceLength() = this.length + this.width
}

fun main() {
  val garden = Garden(12, 8)
  println("Fence: " + garden.fenceLength())
}`,
    fixedCode: `class Garden(val length: Int, val width: Int) {
  fun fenceLength() = 2 * (this.length + this.width)
}

fun main() {
  val garden = Garden(12, 8)
  println("Fence: " + garden.fenceLength())
}`,
    expectedOutput: 'Fence: 40',
    hints: [
              'The result is exactly half of what it should be. How many sides does a garden have?',
              'The method adds the length and the width once. A fence goes round the whole garden. How many lengths and widths are there?',
              'Count both pairs of sides in the formula.',
            ],
    explanation: 'A fence goes all the way round, so it has two lengths and two widths. `this.length + this.width` counts only half of them. `2 * (this.length + this.width)` counts all four sides: 2 * (12 + 8) = 40.',
  },
  {
    id: 'world-8-practice-debug-pack-weight',
    worldId: 'world-8',
    conceptTags: ['lesson:constructors', 'lesson:init', 'wrong-operator-in-init'],
    summary: 'The init block adds the numbers where it should multiply them.',
    title: 'Fix the Pack Weight',
    subtitle: 'Six items of 4 kg each should weigh 24, so the program should print "Weight: 24", but it prints "Weight: 10".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: init adds where it should multiply',
    brokenCode: `class Pack(items: Int, weightEach: Int) {
  val totalWeight: Int

  init {
    this.totalWeight = items + weightEach
  }
}

fun main() {
  val pack = Pack(6, 4)
  println("Weight: " + pack.totalWeight)
}`,
    fixedCode: `class Pack(items: Int, weightEach: Int) {
  val totalWeight: Int

  init {
    this.totalWeight = items * weightEach
  }
}

fun main() {
  val pack = Pack(6, 4)
  println("Weight: " + pack.totalWeight)
}`,
    expectedOutput: 'Weight: 24',
    hints: [
              'The result is far too small. Look at how `init` combines the two numbers.',
              '`items + weightEach` adds 6 and 4. What do you really want: the sum of two numbers, or a total weight of several equal items?',
              'Use the operation that repeats a number several times.',
            ],
    explanation: 'The total weight of 6 items of 4 kg each is `6 * 4 = 24`. The `init` block used `+`, which gave `6 + 4 = 10`. Changing it to `items * weightEach` fixes the total.',
  },
  {
    id: 'world-8-practice-debug-hidden-title',
    worldId: 'world-8',
    conceptTags: ['lesson:primary-constructors', 'missing-val'],
    summary: 'A constructor parameter without val is not a property.',
    title: 'Fix the Hidden Title',
    subtitle: 'The program should print "Horizon: 3", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a constructor parameter without val is not a property',
    brokenCode: `class Song(title: String, val plays: Int)

fun main() {
  val song = Song("Horizon", 3)
  println(song.title + ": " + song.plays)
}`,
    fixedCode: `class Song(val title: String, val plays: Int)

fun main() {
  val song = Song("Horizon", 3)
  println(song.title + ": " + song.plays)
}`,
    expectedOutput: 'Horizon: 3',
    hints: [
              'The error is about `title` on the line that prints. Compare how `title` and `plays` are written in the class header.',
              '`plays` has `val`, but `title` does not. What is a constructor parameter without `val` or `var`?',
              'Make `title` a property, like `plays`.',
            ],
    explanation: 'A constructor parameter without `val` or `var` is only a value you can use while the object is built, not a property. So `song.title` does not exist. Writing `val title: String` makes it a property you can read.',
  },
  {
    id: 'world-8-practice-debug-visitor-count',
    worldId: 'world-8',
    conceptTags: ['lesson:init', 'per-instance-vs-shared-counter'],
    summary: 'The counter is inside each object, so it always shows 1.',
    title: 'Fix the Visitor Count',
    subtitle: 'The visitors should be numbered 1, 2 and 3, so the program should print "Visitor #1: Ana", "Visitor #2: Bo" and "Visitor #3: Cy", but every line says "#1".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'logic',
    bugLabel: 'Logic Error: the counter lives inside each instance',
    brokenCode: `class Visitor(val name: String) {
  var count = 0

  init {
    this.count = this.count + 1
    println("Visitor #" + this.count + ": " + name)
  }
}

fun main() {
  Visitor("Ana")
  Visitor("Bo")
  Visitor("Cy")
}`,
    fixedCode: `object Tally {
  var count = 0
}

class Visitor(val name: String) {
  init {
    Tally.count = Tally.count + 1
    println("Visitor #" + Tally.count + ": " + name)
  }
}

fun main() {
  Visitor("Ana")
  Visitor("Bo")
  Visitor("Cy")
}`,
    expectedOutput: 'Visitor #1: Ana\nVisitor #2: Bo\nVisitor #3: Cy',
    hints: [
              'Every visitor gets the number `1`. Where does the number come from?',
              '`var count = 0` is inside `Visitor`, so each new visitor gets its own `count` that starts at `0`. Who should keep the count for all visitors?',
              'Keep the count in one place that is shared by all visitors.',
            ],
    explanation: 'A property of a class belongs to each object, so each new `Visitor` starts with its own `count` of `0` and adds `1`. To count all visitors together, keep the number in an `object`, such as `Tally`, which exists only once.',
  },
  {
    id: 'world-8-practice-debug-peek-locker',
    worldId: 'world-8',
    conceptTags: ['lesson:visibility-modifiers', 'private-property-access'],
    summary: 'A private property cannot be read from outside the class.',
    title: 'Fix the Locker Peek',
    subtitle: 'The program should print "Open" and then "Locked", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: a private property cannot be read from outside',
    brokenCode: `class Locker(private val code: Int) {
  fun unlock(guess: Int): String {
    return if (guess == this.code) "Open" else "Locked"
  }
}

fun main() {
  val locker = Locker(2580)
  println(locker.unlock(2580))
  println(locker.code)
}`,
    fixedCode: `class Locker(private val code: Int) {
  fun unlock(guess: Int): String {
    return if (guess == this.code) "Open" else "Locked"
  }
}

fun main() {
  val locker = Locker(2580)
  println(locker.unlock(2580))
  println(locker.unlock(1111))
}`,
    expectedOutput: 'Open\nLocked',
    hints: [
              'The error is on the last `println`. Which property does it read?',
              '`code` is declared `private`. Who is allowed to read a private property?',
              'Do not read the code directly. Ask the object a question through a method that is open to everyone.',
            ],
    explanation: 'A `private` property can only be used inside its own class, so `locker.code` is a compile error outside it. The class already has a public method for this job: `unlock(guess)` tells you if a guess is right without showing the code.',
  },
  {
    id: 'world-8-practice-debug-unequal-points',
    worldId: 'world-8',
    conceptTags: ['lesson:data-classes', 'missing-data-keyword', 'equality'],
    summary: 'A plain class does not compare objects by value.',
    title: 'Fix the Point Comparison',
    subtitle: 'The two points are the same, so the program should print "true" and "Point(x=2, y=3)", but it prints "false" and something unreadable.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: a plain class compares by identity',
    brokenCode: `class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(2, 3)
  val b = Point(2, 3)
  println(a == b)
  println(a)
}`,
    fixedCode: `data class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(2, 3)
  val b = Point(2, 3)
  println(a == b)
  println(a)
}`,
    expectedOutput: 'true\nPoint(x=2, y=3)',
    hints: [
              'Both points hold `2` and `3`, yet they are not equal, and printing one does not show its values. What do both lines have in common?',
              'A plain class compares objects by identity and prints a default text. Which kind of class compares by value and prints its properties?',
              'Change the kind of class, not the main function.',
            ],
    explanation: 'A plain `class` treats two objects as equal only when they are the very same object, and its default text is not readable. A `data class` generates `equals` that compares the properties, and a `toString` that shows them: `Point(x=2, y=3)`.',
  },
  {
    id: 'world-8-practice-debug-plan-seats',
    worldId: 'world-8',
    conceptTags: ['lesson:enums', 'ordinal-vs-property'],
    summary: 'The ordinal is the position, not the seat count.',
    title: 'Fix the Plan Seats',
    subtitle: 'The team plan should show its seats, so the program should print "TEAM seats: 5", but it prints "TEAM seats: 1".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: ordinal is a position, not a value',
    brokenCode: `enum class Plan(val seats: Int) {
  FREE(1), TEAM(5), CORP(50)
}

fun main() {
  val plan = Plan.TEAM
  println(plan.name + " seats: " + plan.ordinal)
}`,
    fixedCode: `enum class Plan(val seats: Int) {
  FREE(1), TEAM(5), CORP(50)
}

fun main() {
  val plan = Plan.TEAM
  println(plan.name + " seats: " + plan.seats)
}`,
    expectedOutput: 'TEAM seats: 5',
    hints: [
              'The number is `1`, but the plan has `5` seats. Which property does the last line read?',
              '`ordinal` is the position of the constant in the list, starting at `0`. `TEAM` is second, so its position is `1`. Where is the real seat count stored?',
              'Read the property that you gave to each constant.',
            ],
    explanation: '`plan.ordinal` is the position of the constant in the enum (`FREE` is 0, `TEAM` is 1). The seat count is the property `seats`, which you set for each constant. `plan.seats` gives 5.',
  },
  {
    id: 'world-8-practice-debug-pet-without-name',
    worldId: 'world-8',
    conceptTags: ['lesson:basic-inheritance', 'super-constructor-arguments'],
    summary: 'The parent class constructor is called without its argument.',
    title: 'Fix the Pet Constructor',
    subtitle: 'The program should print "I am Rex", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: the superclass constructor needs its argument',
    brokenCode: `open class Pet(val name: String) {
  fun intro() = "I am " + this.name
}

class Dog(name: String) : Pet()

fun main() {
  val dog = Dog("Rex")
  println(dog.intro())
}`,
    fixedCode: `open class Pet(val name: String) {
  fun intro() = "I am " + this.name
}

class Dog(name: String) : Pet(name)

fun main() {
  val dog = Dog("Rex")
  println(dog.intro())
}`,
    expectedOutput: 'I am Rex',
    hints: [
              'The error is on the line with `class Dog`. Look at what is written after the colon.',
              '`Pet` needs a `name` when it is built, but `Pet()` passes nothing. What does `Dog` have that it could pass on?',
              'Hand the dog\'s name to the parent class.',
            ],
    explanation: 'A subclass must call the constructor of its parent class with all the arguments it needs. `Pet(val name: String)` needs a name, so `Pet()` is a compile error. `Dog(name: String) : Pet(name)` passes the name on.',
  },
  {
    id: 'world-8-practice-debug-missing-currency',
    worldId: 'world-8',
    conceptTags: ['lesson:interfaces', 'unimplemented-interface-member'],
    summary: 'The class does not implement every member of its interface.',
    title: 'Fix the Invoice',
    subtitle: 'The invoice should print "90 EUR", but the program does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'type',
    bugLabel: 'Compile Error: an interface member is not implemented',
    brokenCode: `interface Payable {
  fun amount(): Int
  fun currency(): String
}

class Invoice(val total: Int) : Payable {
  override fun amount() = this.total
}

fun main() {
  val inv = Invoice(90)
  println(inv.amount().toString() + " " + inv.currency())
}`,
    fixedCode: `interface Payable {
  fun amount(): Int
  fun currency(): String
}

class Invoice(val total: Int) : Payable {
  override fun amount() = this.total
  override fun currency() = "EUR"
}

fun main() {
  val inv = Invoice(90)
  println(inv.amount().toString() + " " + inv.currency())
}`,
    expectedOutput: '90 EUR',
    hints: [
              'The error names a member of the interface. Compare the interface with the class.',
              '`Payable` has two functions, `amount()` and `currency()`. How many does `Invoice` implement?',
              'Add the member that is missing, with the same name and return type.',
            ],
    explanation: 'A class that implements an interface must implement every member of it. `Invoice` has `amount()` but not `currency()`, so it does not compile. Adding `override fun currency() = "EUR"` completes it.',
  },
  {
    id: 'world-8-practice-debug-closed-speak',
    worldId: 'world-8',
    conceptTags: ['lesson:overriding-members', 'override-needs-open'],
    summary: 'A member that is not open cannot be overridden.',
    title: 'Fix the Quack',
    subtitle: 'A duck should say "Quack", so the program should print "Quack", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'type',
    bugLabel: 'Compile Error: the member is final, so it cannot be overridden',
    brokenCode: `open class Bird {
  fun speak() = "..."
}

class Duck : Bird() {
  override fun speak() = "Quack"
}

fun main() {
  val b: Bird = Duck()
  println(b.speak())
}`,
    fixedCode: `open class Bird {
  open fun speak() = "..."
}

class Duck : Bird() {
  override fun speak() = "Quack"
}

fun main() {
  val b: Bird = Duck()
  println(b.speak())
}`,
    expectedOutput: 'Quack',
    hints: [
              'The error says the member cannot be overridden. Look at the function in the parent class.',
              'In Kotlin, members are closed by default. `Bird.speak()` has no `open`. What does `Duck` try to do with it?',
              'Allow the parent function to be overridden.',
            ],
    explanation: 'In Kotlin a member can only be overridden when the parent marks it `open`. `fun speak()` in `Bird` is final, so `override fun speak()` in `Duck` is an error. Writing `open fun speak()` in `Bird` allows it.',
  },
];
