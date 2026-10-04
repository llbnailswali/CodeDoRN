/**
 * World 8 (Object Kingdom) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares. Wording lives in world8.data.ts.
 * A starter holds exactly one single-line `// N.` placeholder per step, which `run.ts apply 8` replaces.
 */
export interface WRSpec {
  id: string; difficulty: 'medium' | 'hard'; tags: string[]; title: string; fileName: string;
  solution: string; starter: string; expected: string;
  swap: { variableName: string; originalLiteral: string; alternateLiteral: string; alternateExpected: string };
}
export interface DbgSpec {
  id: string; tags: string[]; title: string; bugType: 'logic' | 'syntax' | 'type' | 'runtime'; bugLabel: string; difficulty: 'medium' | 'hard';
  broken: string; fixed: string; expected: string;
}

export const WR_SPECS: WRSpec[] = [
  {
    id: 'shelf-players', difficulty: 'medium', tags: ['lesson:classes', 'class-declaration', 'instances', 'independent-state'], title: 'Two Players', fileName: 'Players.kt',
    solution: `class Player(val name: String, var score: Int)

fun main() {
  val bonus = 10
  val ana = Player("Ana", 0)
  val bo = Player("Bo", 5)
  ana.score = ana.score + bonus
  println(ana.name + ": " + ana.score)
  println(bo.name + ": " + bo.score)
  println("Total: " + (ana.score + bo.score))
}`,
    starter: `// 1. TODO

fun main() {
  val bonus = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Ana 0+10=10, Bo 5, total 15. With bonus 7: Ana 7, total 12.
    expected: 'Ana: 10\nBo: 5\nTotal: 15',
    swap: { variableName: 'bonus', originalLiteral: '10', alternateLiteral: '7', alternateExpected: 'Ana: 7\nBo: 5\nTotal: 12' },
  },
  {
    id: 'roster-scan', difficulty: 'hard', tags: ['lesson:classes', 'lesson:properties', 'objects-in-list', 'loop', 'accumulator'], title: 'Roster Scan', fileName: 'Roster.kt',
    solution: `class Student(val name: String, val mark: Int)

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
    starter: `class Student(val name: String, val mark: Int)

fun main() {
  val passMark = 50
  val students = listOf(Student("Ana", 72), Student("Bo", 45), Student("Cy", 88), Student("Di", 50))

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // total 72+45+88+50 = 255, 255 / 4 = 63 (Int). Best Cy 88. Passed (>= 50): Ana, Cy, Di = 3. With passMark 60: Ana, Cy = 2.
    expected: 'Best: Cy (88)\nAverage: 63\nPassed: 3 of 4',
    swap: { variableName: 'passMark', originalLiteral: '50', alternateLiteral: '60', alternateExpected: 'Best: Cy (88)\nAverage: 63\nPassed: 2 of 4' },
  },
  {
    id: 'visit-counter', difficulty: 'medium', tags: ['lesson:objects', 'object-declaration', 'shared-state'], title: 'Visit Counter', fileName: 'Visits.kt',
    solution: `object VisitCounter {
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
    starter: `// 1. TODO

fun main() {
  val hits = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 3 hits -> "Visits: 3", one more -> 4. With hits 5: "Visits: 5" then 6.
    expected: 'Visits: 3\n4',
    swap: { variableName: 'hits', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Visits: 5\n6' },
  },
  {
    id: 'shop-tax', difficulty: 'hard', tags: ['lesson:objects', 'lesson:methods', 'object-shared-by-class', 'int-division'], title: 'Shop Tax', fileName: 'ShopTax.kt',
    solution: `object Shop {
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
    starter: `object Shop {
  val taxPercent = 10
  var orders = 0
}

class Order(val item: String, val amount: Int) {
  // 1. TODO
}

fun main() {
  val price = 255

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 255 * 10 / 100 = 25 (25.5 truncates), 255 + 25 = 280. 1200 * 10 / 100 = 120 -> 1320. Two orders priced.
    // With price 199: 199 * 10 / 100 = 19 (19.9 truncates) -> 218.
    expected: 'Lamp: 280\nDesk: 1320\nOrders priced: 2',
    swap: { variableName: 'price', originalLiteral: '255', alternateLiteral: '199', alternateExpected: 'Lamp: 218\nDesk: 1320\nOrders priced: 2' },
  },
  {
    id: 'wallet', difficulty: 'medium', tags: ['lesson:properties', 'val-vs-var-property', 'compound-assignment'], title: 'Wallet', fileName: 'Wallet.kt',
    solution: `class Wallet(val owner: String, var balance: Int)

fun main() {
  val salary = 1200
  val wallet = Wallet("Mira", 300)
  wallet.balance = wallet.balance + salary
  wallet.balance -= 450
  println(wallet.owner + " has " + wallet.balance)
  val spare = wallet.balance - 500
  println("Spare: " + spare)
}`,
    starter: `class Wallet(val owner: String, var balance: Int)

fun main() {
  val salary = 1200
  val wallet = Wallet("Mira", 300)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 300 + 1200 = 1500, - 450 = 1050, spare 550. With salary 800: 1100 - 450 = 650, spare 150.
    expected: 'Mira has 1050\nSpare: 550',
    swap: { variableName: 'salary', originalLiteral: '1200', alternateLiteral: '800', alternateExpected: 'Mira has 650\nSpare: 150' },
  },
  {
    id: 'temperature-sensor', difficulty: 'hard', tags: ['lesson:properties', 'custom-getter', 'computed-property', 'int-division'], title: 'Temperature Sensor', fileName: 'Sensor.kt',
    solution: `class Sensor(val label: String, var celsius: Int) {
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
    starter: `class Sensor(val label: String, var celsius: Int) {
  // 1. TODO

  // 2. TODO
}

fun main() {
  val reading = 25

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // 25: 25*9=225, /5=45, +32=77, not hot. 35: 315/5=63, +32=95, hot. With 28: 252/5=50 (50.4), 82, not hot; 38: 342/5=68 (68.4), 100, hot.
    expected: 'Roof 77 false\nRoof 95 true',
    swap: { variableName: 'reading', originalLiteral: '25', alternateLiteral: '28', alternateExpected: 'Roof 82 false\nRoof 100 true' },
  },
  {
    id: 'rectangle-tools', difficulty: 'medium', tags: ['lesson:methods', 'method-return-value', 'boolean-method'], title: 'Rectangle Tools', fileName: 'Rectangles.kt',
    solution: `class Rectangle(val width: Int, val height: Int) {
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
    starter: `class Rectangle(val width: Int, val height: Int) {
  // 1. TODO

  // 2. TODO

  // 3. TODO
}

fun main() {
  val side = 6

  // 4. TODO

  // 5. TODO
}`,
    // A 6x4: 24, 2*10=20, false. B 6x6: 36, 24, true. With side 5: A 20, 18, false; B 25, 20, true.
    expected: 'A: 24 20 false\nB: 36 24 true',
    swap: { variableName: 'side', originalLiteral: '6', alternateLiteral: '5', alternateExpected: 'A: 20 18 false\nB: 25 20 true' },
  },
  {
    id: 'account-ops', difficulty: 'hard', tags: ['lesson:methods', 'method-changes-state', 'boolean-result', 'counter'], title: 'Account Operations', fileName: 'AccountOps.kt',
    solution: `class Account(var balance: Int) {
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
    starter: `class Account(var balance: Int) {
  fun deposit(amount: Int) {
    this.balance = this.balance + amount
  }

  // 1. TODO
}

fun main() {
  val start = 100
  val account = Account(start)
  var failed = 0

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 100+50=150; withdraw 120 ok -> 30; withdraw 100 fails (100 > 30); withdraw 30 ok (30 > 30 is false) -> 0. Balance 0, failed 1.
    // With start 60: 110; 120 fails; 100 ok -> 10; 30 fails. Balance 10, failed 2.
    expected: 'Balance: 0\nFailed: 1',
    swap: { variableName: 'start', originalLiteral: '100', alternateLiteral: '60', alternateExpected: 'Balance: 10\nFailed: 2' },
  },
  {
    id: 'price-tag', difficulty: 'medium', tags: ['lesson:constructors', 'lesson:init', 'constructor-parameter', 'init-assignment', 'int-division'], title: 'Price Tag', fileName: 'PriceTag.kt',
    solution: `class Price(base: Int, taxPercent: Int) {
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
    starter: `class Price(base: Int, taxPercent: Int) {
  // 1. TODO

  // 2. TODO
}

fun main() {
  val base = 85

  // 3. TODO

  // 4. TODO
}`,
    // 85 * 10 / 100 = 8 (8.5 truncates), 93. 120 * 25 / 100 = 30, 150. With base 90: 90 * 10 / 100 = 9 -> 99.
    expected: 'Shirt: 93\nShoes: 150',
    swap: { variableName: 'base', originalLiteral: '85', alternateLiteral: '90', alternateExpected: 'Shirt: 99\nShoes: 150' },
  },
  {
    id: 'member-card', difficulty: 'medium', tags: ['lesson:primary-constructors', 'default-constructor-arguments', 'named-constructor-arguments'], title: 'Member Card', fileName: 'Members.kt',
    solution: `class Member(val name: String, val level: String = "Basic", var points: Int = 0)

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
    starter: `// 1. TODO

fun main() {
  val welcome = 20

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Ana: Basic, 0 + 20. Bo: Gold 150. Cy: Basic (default), 40. With welcome 35: Ana 35.
    expected: 'Ana Basic 20\nBo Gold 150\nCy Basic 40',
    swap: { variableName: 'welcome', originalLiteral: '20', alternateLiteral: '35', alternateExpected: 'Ana Basic 35\nBo Gold 150\nCy Basic 40' },
  },
  {
    id: 'creation-log', difficulty: 'hard', tags: ['lesson:init', 'init-order', 'property-initializer', 'object-counter'], title: 'Creation Log', fileName: 'CreationLog.kt',
    solution: `object Registry {
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
    starter: `object Registry {
  var count = 0
}

class Ticket(val seat: Int) {
  val label = "Seat " + seat

  // 1. TODO
}

fun main() {
  val first = 12

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Creating runs once per instance, label is set before init runs. Output order: both Creating lines, then Created: 2, then labels.
    expected: 'Creating Seat 12\nCreating Seat 13\nCreated: 2\nSeat 12, Seat 13',
    swap: { variableName: 'first', originalLiteral: '12', alternateLiteral: '20', alternateExpected: 'Creating Seat 20\nCreating Seat 21\nCreated: 2\nSeat 20, Seat 21' },
  },
  {
    id: 'safe-box', difficulty: 'medium', tags: ['lesson:visibility-modifiers', 'private-property', 'public-method-guard'], title: 'Safe Box', fileName: 'SafeBox.kt',
    solution: `class SafeBox(private val code: Int, val label: String) {
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
    starter: `class SafeBox(private val code: Int, val label: String) {
  // 1. TODO

  // 2. TODO

  // 3. TODO
}

fun main() {
  val secret = 4821

  // 4. TODO

  // 5. TODO
}`,
    // open(1234): 1234 == 4821 false. open(secret) true. Two attempts. With secret 1234 the first guess is right: true, true.
    expected: 'Vault opened: false\nVault opened: true\nAttempts: 2',
    swap: { variableName: 'secret', originalLiteral: '4821', alternateLiteral: '1234', alternateExpected: 'Vault opened: true\nVault opened: true\nAttempts: 2' },
  },
  {
    id: 'ledger-privacy', difficulty: 'hard', tags: ['lesson:visibility-modifiers', 'private-set', 'private-property', 'summary-method'], title: 'Private Ledger', fileName: 'Ledger.kt',
    solution: `class Ledger {
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
    starter: `class Ledger {
  private var total = 0
  var entries = 0
    private set

  // 1. TODO

  // 2. TODO
}

fun main() {
  val bonus = 40

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // 100 + 250 + 40 = 390 in 3 entries. With bonus 60: 410.
    expected: 'Entries: 3, total: 390\n3',
    swap: { variableName: 'bonus', originalLiteral: '40', alternateLiteral: '60', alternateExpected: 'Entries: 3, total: 410\n3' },
  },
  {
    id: 'product-compare', difficulty: 'medium', tags: ['lesson:data-classes', 'data-class-equality', 'copy', 'generated-tostring'], title: 'Product Compare', fileName: 'Products.kt',
    solution: `data class Product(val name: String, val price: Int)

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
    starter: `// 1. TODO

fun main() {
  val discount = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // a and b are equal by value; sale has price 15 so it differs. With discount 0 the copy equals a.
    expected: 'Product(name=Pen, price=20)\ntrue\nfalse\nProduct(name=Pen, price=15)',
    swap: { variableName: 'discount', originalLiteral: '5', alternateLiteral: '0', alternateExpected: 'Product(name=Pen, price=20)\ntrue\ntrue\nProduct(name=Pen, price=20)' },
  },
  {
    id: 'order-lines', difficulty: 'hard', tags: ['lesson:data-classes', 'destructuring', 'copy', 'loop', 'int-division'], title: 'Order Lines', fileName: 'OrderLines.kt',
    solution: `data class Line(val item: String, val qty: Int, val unit: Int)

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
    starter: `data class Line(val item: String, val qty: Int, val unit: Int)

fun main() {
  val taxPercent = 10
  val lines = listOf(Line("Pen", 3, 4), Line("Book", 2, 15), Line("Bag", 1, 40))

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // 3*4=12, 2*15=30, 1*40=40, subtotal 82, tax 82*10/100 = 8 (8.2). Bag has the highest unit price (40). Doubled copy: qty 2.
    // With taxPercent 25: 82*25/100 = 20 (20.5 truncates).
    expected: 'Pen x3 = 12\nBook x2 = 30\nBag x1 = 40\nSubtotal: 82, tax: 8\nPriciest: Bag\nLine(item=Bag, qty=2, unit=40)',
    swap: { variableName: 'taxPercent', originalLiteral: '10', alternateLiteral: '25', alternateExpected: 'Pen x3 = 12\nBook x2 = 30\nBag x1 = 40\nSubtotal: 82, tax: 20\nPriciest: Bag\nLine(item=Bag, qty=2, unit=40)' },
  },
  {
    id: 'traffic-cycle', difficulty: 'medium', tags: ['lesson:enums', 'enum-constructor-property', 'enum-values', 'ordinal'], title: 'Traffic Cycle', fileName: 'Traffic.kt',
    solution: `enum class Signal(val seconds: Int) {
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
    starter: `// 1. TODO

fun main() {
  val rounds = 3
  var cycle = 0

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // ordinal is the position (0 based): RED 0, GREEN 1, YELLOW 2, shown as 1. 2. 3. Cycle 30+25+5 = 60. 3 rounds 180; with 4 rounds 240.
    expected: '1. RED 30s\n2. GREEN 25s\n3. YELLOW 5s\nCycle: 60s\nAfter 3 rounds: 180s',
    swap: { variableName: 'rounds', originalLiteral: '3', alternateLiteral: '4', alternateExpected: '1. RED 30s\n2. GREEN 25s\n3. YELLOW 5s\nCycle: 60s\nAfter 4 rounds: 240s' },
  },
  {
    id: 'size-menu', difficulty: 'hard', tags: ['lesson:enums', 'when-over-enum', 'enum-in-list', 'enum-equality', 'accumulator'], title: 'Size Menu', fileName: 'SizeMenu.kt',
    solution: `enum class Size(val ml: Int, val price: Int) {
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
    starter: `enum class Size(val ml: Int, val price: Int) {
  SMALL(250, 3), MEDIUM(350, 4), LARGE(500, 6)
}

// 1. TODO

fun main() {
  val extraShot = 1
  val order = listOf(Size.SMALL, Size.LARGE, Size.SMALL, Size.MEDIUM)
  var cost = 0
  var volume = 0
  var smalls = 0
  var codes = ""

  // 2. TODO

  // 3. TODO
}`,
    // Codes SLSM. Cost: (3+1) + (6+1) + (3+1) + (4+1) = 20. Volume 250+500+250+350 = 1350. Two smalls. With extraShot 2: 24.
    expected: 'Order: SLSM\nCost: 20, volume: 1350ml\nSmalls: 2',
    swap: { variableName: 'extraShot', originalLiteral: '1', alternateLiteral: '2', alternateExpected: 'Order: SLSM\nCost: 24, volume: 1350ml\nSmalls: 2' },
  },
  {
    id: 'vehicle-fleet', difficulty: 'medium', tags: ['lesson:basic-inheritance', 'open-class', 'super-constructor-call', 'super-method-call'], title: 'Vehicle Fleet', fileName: 'Fleet.kt',
    solution: `open class Vehicle(val name: String, val wheels: Int) {
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
    starter: `open class Vehicle(val name: String, val wheels: Int) {
  open fun describe() = this.name + " has " + this.wheels + " wheels"
}

// 1. TODO

// 2. TODO

fun main() {
  val capacity = 800

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Bike: 2 wheels; Truck: 6 wheels and 800kg. Wheels 2 + 6 = 8. With capacity 1200 the truck line ends 1200kg.
    expected: 'Swift has 2 wheels\nHauler has 6 wheels and carries 800kg\nWheels: 8',
    swap: { variableName: 'capacity', originalLiteral: '800', alternateLiteral: '1200', alternateExpected: 'Swift has 2 wheels\nHauler has 6 wheels and carries 1200kg\nWheels: 8' },
  },
  {
    id: 'payroll', difficulty: 'hard', tags: ['lesson:basic-inheritance', 'lesson:overriding-members', 'polymorphic-list', 'super-call', 'int-division'], title: 'Payroll', fileName: 'Payroll.kt',
    solution: `open class Employee(val name: String, val base: Int) {
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
    starter: `open class Employee(val name: String, val base: Int) {
  open fun pay() = this.base
}

// 1. TODO

// 2. TODO

fun main() {
  val bonus = 800

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Ana 2000, Bo 3000+800 = 3800, Cy 505 / 2 = 252 (252.5 truncates). Payroll 2000+3800+252 = 6052. With bonus 1000: 4000 and 6252.
    expected: 'Ana: 2000\nBo: 3800\nCy: 252\nPayroll: 6052',
    swap: { variableName: 'bonus', originalLiteral: '800', alternateLiteral: '1000', alternateExpected: 'Ana: 2000\nBo: 4000\nCy: 252\nPayroll: 6252' },
  },
  {
    id: 'shape-areas', difficulty: 'medium', tags: ['lesson:interfaces', 'implement-interface', 'list-of-interface-type'], title: 'Shape Areas', fileName: 'Shapes.kt',
    solution: `interface Shape {
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
    starter: `interface Shape {
  fun area(): Int
  fun label(): String
}

// 1. TODO

// 2. TODO

fun main() {
  val side = 5

  // 3. TODO

  // 4. TODO
}`,
    // Square 5 = 25, Rect 4x3 = 12, total 37. With side 6: 36 and 48.
    expected: 'Square 5 = 25\nRect 4x3 = 12\nTotal area: 37',
    swap: { variableName: 'side', originalLiteral: '5', alternateLiteral: '6', alternateExpected: 'Square 6 = 36\nRect 4x3 = 12\nTotal area: 48' },
  },
  {
    id: 'notifier-channels', difficulty: 'hard', tags: ['lesson:interfaces', 'two-implementers', 'function-takes-interface-list', 'string-take'], title: 'Notifier Channels', fileName: 'Notifier.kt',
    solution: `interface Notifier {
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
    starter: `interface Notifier {
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

// 1. TODO

// 2. TODO

fun main() {
  val text = "Server restarts at noon"

  // 3. TODO

  // 4. TODO
}`,
    // Email line: "EMAIL to " (9) + "ops@x.org" (9) + ": " (2) + 23 message characters = 43. SMS line: "SMS to " (7) + "555-0101" (8) + ": " (2) + "Server res" (10) = 27. Total 70.
    // With "Backup done" (11 characters): Email 20 + 11 = 31, SMS 17 + "Backup don" (10) = 27, total 58.
    expected: 'EMAIL to ops@x.org: Server restarts at noon\nSMS to 555-0101: Server res\nCharacters sent: 70',
    swap: { variableName: 'text', originalLiteral: '"Server restarts at noon"', alternateLiteral: '"Backup done"', alternateExpected: 'EMAIL to ops@x.org: Backup done\nSMS to 555-0101: Backup don\nCharacters sent: 58' },
  },
  {
    id: 'animal-sounds', difficulty: 'medium', tags: ['lesson:overriding-members', 'override-property', 'override-method', 'polymorphic-list'], title: 'Animal Sounds', fileName: 'Animals.kt',
    solution: `open class Animal {
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
    starter: `open class Animal {
  open val legs: Int = 4
  open fun sound() = "..."
}

// 1. TODO

// 2. TODO

fun main() {
  val birdLegs = 2

  // 3. TODO

  // 4. TODO
}`,
    // Animal "..." 4, Bird "Tweet" 2, Cat "Meow" 4 (inherited legs). Total 10. With birdLegs 3: "Tweet 3" and 11.
    expected: '... 4\nTweet 2\nMeow 4\nTotal legs: 10',
    swap: { variableName: 'birdLegs', originalLiteral: '2', alternateLiteral: '3', alternateExpected: '... 4\nTweet 3\nMeow 4\nTotal legs: 11' },
  },
  {
    id: 'discount-policy', difficulty: 'hard', tags: ['lesson:overriding-members', 'override-method-with-parameter', 'polymorphic-list', 'int-division'], title: 'Discount Policy', fileName: 'Discounts.kt',
    solution: `open class Discount(val label: String) {
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
    starter: `open class Discount(val label: String) {
  open fun apply(price: Int) = price
}

// 1. TODO

// 2. TODO

fun main() {
  val basePrice = 250

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // None 250. Spring 15%: 250 * 15 / 100 = 37 (37.5 truncates), 250 - 37 = 213. Coupon: 250 - 40 = 210. Cheapest 210.
    // With basePrice 200: None 200, Spring 200 - 30 = 170, Coupon 160, cheapest 160.
    expected: 'None: 250\nSpring: 213\nCoupon: 210\nCheapest: 210',
    swap: { variableName: 'basePrice', originalLiteral: '250', alternateLiteral: '200', alternateExpected: 'None: 200\nSpring: 170\nCoupon: 160\nCheapest: 160' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'shared-score', tags: ['lesson:classes', 'alias-vs-new-instance', 'independent-state'], title: 'Fix the Shared Counter', bugType: 'logic', bugLabel: 'Logic Error: two names for one object', difficulty: 'medium',
    broken: `class Counter(var count: Int)

fun main() {
  val first = Counter(0)
  val second = first
  second.count = second.count + 5
  println("First: " + first.count)
  println("Second: " + second.count)
}`,
    fixed: `class Counter(var count: Int)

fun main() {
  val first = Counter(0)
  val second = Counter(0)
  second.count = second.count + 5
  println("First: " + first.count)
  println("Second: " + second.count)
}`,
    expected: 'First: 0\nSecond: 5',
  },
  {
    id: 'scattered-total', tags: ['lesson:objects', 'object-vs-class-state'], title: 'Fix the Lost Total', bugType: 'logic', bugLabel: 'Logic Error: a new instance each time instead of one shared object', difficulty: 'medium',
    broken: `class Stats {
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
    fixed: `object Stats {
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
    expected: 'Total: 30',
  },
  {
    id: 'frozen-balance', tags: ['lesson:properties', 'val-property-reassignment'], title: 'Fix the Frozen Balance', bugType: 'type', bugLabel: 'Compile Error: a val property cannot be reassigned', difficulty: 'medium',
    broken: `class Savings(val owner: String, val balance: Int)

fun main() {
  val acc = Savings("Mia", 100)
  acc.balance += 50
  println(acc.owner + ": " + acc.balance)
}`,
    fixed: `class Savings(val owner: String, var balance: Int)

fun main() {
  val acc = Savings("Mia", 100)
  acc.balance += 50
  println(acc.owner + ": " + acc.balance)
}`,
    expected: 'Mia: 150',
  },
  {
    id: 'fence-length', tags: ['lesson:methods', 'wrong-formula'], title: 'Fix the Fence Length', bugType: 'logic', bugLabel: 'Logic Error: the method forgets two sides', difficulty: 'medium',
    broken: `class Garden(val length: Int, val width: Int) {
  fun fenceLength() = this.length + this.width
}

fun main() {
  val garden = Garden(12, 8)
  println("Fence: " + garden.fenceLength())
}`,
    fixed: `class Garden(val length: Int, val width: Int) {
  fun fenceLength() = 2 * (this.length + this.width)
}

fun main() {
  val garden = Garden(12, 8)
  println("Fence: " + garden.fenceLength())
}`,
    expected: 'Fence: 40',
  },
  {
    id: 'pack-weight', tags: ['lesson:constructors', 'lesson:init', 'wrong-operator-in-init'], title: 'Fix the Pack Weight', bugType: 'logic', bugLabel: 'Logic Error: init adds where it should multiply', difficulty: 'medium',
    broken: `class Pack(items: Int, weightEach: Int) {
  val totalWeight: Int

  init {
    this.totalWeight = items + weightEach
  }
}

fun main() {
  val pack = Pack(6, 4)
  println("Weight: " + pack.totalWeight)
}`,
    fixed: `class Pack(items: Int, weightEach: Int) {
  val totalWeight: Int

  init {
    this.totalWeight = items * weightEach
  }
}

fun main() {
  val pack = Pack(6, 4)
  println("Weight: " + pack.totalWeight)
}`,
    expected: 'Weight: 24',
  },
  {
    id: 'hidden-title', tags: ['lesson:primary-constructors', 'missing-val'], title: 'Fix the Hidden Title', bugType: 'type', bugLabel: 'Compile Error: a constructor parameter without val is not a property', difficulty: 'medium',
    broken: `class Song(title: String, val plays: Int)

fun main() {
  val song = Song("Horizon", 3)
  println(song.title + ": " + song.plays)
}`,
    fixed: `class Song(val title: String, val plays: Int)

fun main() {
  val song = Song("Horizon", 3)
  println(song.title + ": " + song.plays)
}`,
    expected: 'Horizon: 3',
  },
  {
    id: 'visitor-count', tags: ['lesson:init', 'per-instance-vs-shared-counter'], title: 'Fix the Visitor Count', bugType: 'logic', bugLabel: 'Logic Error: the counter lives inside each instance', difficulty: 'hard',
    broken: `class Visitor(val name: String) {
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
    fixed: `object Tally {
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
    expected: 'Visitor #1: Ana\nVisitor #2: Bo\nVisitor #3: Cy',
  },
  {
    id: 'peek-locker', tags: ['lesson:visibility-modifiers', 'private-property-access'], title: 'Fix the Locker Peek', bugType: 'type', bugLabel: 'Compile Error: a private property cannot be read from outside', difficulty: 'medium',
    broken: `class Locker(private val code: Int) {
  fun unlock(guess: Int): String {
    return if (guess == this.code) "Open" else "Locked"
  }
}

fun main() {
  val locker = Locker(2580)
  println(locker.unlock(2580))
  println(locker.code)
}`,
    fixed: `class Locker(private val code: Int) {
  fun unlock(guess: Int): String {
    return if (guess == this.code) "Open" else "Locked"
  }
}

fun main() {
  val locker = Locker(2580)
  println(locker.unlock(2580))
  println(locker.unlock(1111))
}`,
    expected: 'Open\nLocked',
  },
  {
    id: 'unequal-points', tags: ['lesson:data-classes', 'missing-data-keyword', 'equality'], title: 'Fix the Point Comparison', bugType: 'logic', bugLabel: 'Logic Error: a plain class compares by identity', difficulty: 'medium',
    broken: `class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(2, 3)
  val b = Point(2, 3)
  println(a == b)
  println(a)
}`,
    fixed: `data class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(2, 3)
  val b = Point(2, 3)
  println(a == b)
  println(a)
}`,
    expected: 'true\nPoint(x=2, y=3)',
  },
  {
    id: 'plan-seats', tags: ['lesson:enums', 'ordinal-vs-property'], title: 'Fix the Plan Seats', bugType: 'logic', bugLabel: 'Logic Error: ordinal is a position, not a value', difficulty: 'medium',
    broken: `enum class Plan(val seats: Int) {
  FREE(1), TEAM(5), CORP(50)
}

fun main() {
  val plan = Plan.TEAM
  println(plan.name + " seats: " + plan.ordinal)
}`,
    fixed: `enum class Plan(val seats: Int) {
  FREE(1), TEAM(5), CORP(50)
}

fun main() {
  val plan = Plan.TEAM
  println(plan.name + " seats: " + plan.seats)
}`,
    expected: 'TEAM seats: 5',
  },
  {
    id: 'pet-without-name', tags: ['lesson:basic-inheritance', 'super-constructor-arguments'], title: 'Fix the Pet Constructor', bugType: 'type', bugLabel: 'Compile Error: the superclass constructor needs its argument', difficulty: 'hard',
    broken: `open class Pet(val name: String) {
  fun intro() = "I am " + this.name
}

class Dog(name: String) : Pet()

fun main() {
  val dog = Dog("Rex")
  println(dog.intro())
}`,
    fixed: `open class Pet(val name: String) {
  fun intro() = "I am " + this.name
}

class Dog(name: String) : Pet(name)

fun main() {
  val dog = Dog("Rex")
  println(dog.intro())
}`,
    expected: 'I am Rex',
  },
  {
    id: 'missing-currency', tags: ['lesson:interfaces', 'unimplemented-interface-member'], title: 'Fix the Invoice', bugType: 'type', bugLabel: 'Compile Error: an interface member is not implemented', difficulty: 'hard',
    broken: `interface Payable {
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
    fixed: `interface Payable {
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
    expected: '90 EUR',
  },
  {
    id: 'closed-speak', tags: ['lesson:overriding-members', 'override-needs-open'], title: 'Fix the Quack', bugType: 'type', bugLabel: 'Compile Error: the member is final, so it cannot be overridden', difficulty: 'medium',
    broken: `open class Bird {
  fun speak() = "..."
}

class Duck : Bird() {
  override fun speak() = "Quack"
}

fun main() {
  val b: Bird = Duck()
  println(b.speak())
}`,
    fixed: `open class Bird {
  open fun speak() = "..."
}

class Duck : Bird() {
  override fun speak() = "Quack"
}

fun main() {
  val b: Bird = Duck()
  println(b.speak())
}`,
    expected: 'Quack',
  },
];
