import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 7 -- Null Safety Shield (medium and hard only).
// Every lesson already ends with an easy Write & Run and an easy Debug in its
// own 5 stages, so this bank starts at the World 1 Boss Write & Run bar
// (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the null-safe tool (?., ?:, !!, a check, as?) is named in the step.
//   hard   -- a value that is null on SOME path (a function result, a property, an element, a whole
//             list), state carried across several checks, an easily confused pair (null vs blank,
//             missing property vs missing owner, lazy vs eager fallback) and multi-line output;
//             the step names the quantity, not the operator.
//
// Every expected value was derived by hand from Kotlin's rules, not copied from the simulator, and is
// re-verified by scripts/test-practice-bank.ts. Tasks stay inside what the runner models: a numeric
// `as?` only from a `val` initialised with a literal (or a String target), no Char, one `!!` per
// expression, no `isNullOrEmpty()`. The Boss is not in the tab.

export const WORLD_7_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
  // ------------------------------------------------------------ nullable types
  {
    id: 'world-7-practice-writerun-contact-card',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Print fields that can be missing, then count how many are filled in.',
    conceptTags: ['lesson:nullable-types', 'lesson:null-checks', 'nullable-template', 'null-check', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Contact Card',
    goal:
      'A contact always has a name. The phone and email can be missing. Print all three fields. Then print how many of them have a value.',
    description:
      '1. **Print the three fields.** Use string templates, one line per field. A missing `String?` prints the word `null`:\n"Name: Ravi"\n"Phone: null"\n"Email: ravi@mail.com"\n\n' +
              '2. **Count the filled fields.** Create `var filled = 1`, because the name always counts. Add `1` for the phone and for the email when it is not `null`. Use `if (x != null)`.\n\n' +
              '3. **Print the count.** Use a string template:\n"Filled: 2 of 3"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the three fields.** Use string templates.',
          '2. **Count the filled fields.** Check each one with `!= null`.',
          '3. **Print the count.**',
        ],
        comments: [
          '// 1. Print the three fields. Use string templates.',
          '// 2. Count the filled fields. Check each one with != null.',
          '// 3. Print the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the three fields.**',
          '2. **Count the filled fields.**',
          '3. **Print the count.**',
        ],
        comments: [
          '// 1. Print the three fields.',
          '// 2. Count the filled fields.',
          '// 3. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ContactCard.kt',
    initialCode: `fun main() {
  val name: String = "Ravi"
  val phone: String? = null
  val email: String? = "ravi@mail.com"

  // 1. Print the three fields. Use string templates, one line per field. A missing String? prints the word null: "Name: Ravi" "Phone: null" "Email: ravi@mail.com"

  // 2. Count the filled fields. Create var filled = 1, because the name always counts. Add 1 for the phone and for the email when it is not null. Use if (x != null).

  // 3. Print the count. Use a string template: "Filled: 2 of 3"
}`,
    solutionCode: `fun main() {
  val name: String = "Ravi"
  val phone: String? = null
  val email: String? = "ravi@mail.com"

  println("Name: $name")
  println("Phone: $phone")
  println("Email: $email")
  var filled = 1
  if (phone != null) {
    filled++
  }
  if (email != null) {
    filled++
  }
  println("Filled: $filled of 3")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Name: Ravi\nPhone: null\nEmail: ravi@mail.com\nFilled: 2 of 3',
    testCase: { call: '', expected: 'Name: Ravi\nPhone: null\nEmail: ravi@mail.com\nFilled: 2 of 3' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'phone', originalLiteral: 'null', alternateLiteral: '"555-0100"' }],
      alternateExpectedOutput: 'Name: Ravi\nPhone: 555-0100\nEmail: ravi@mail.com\nFilled: 3 of 3',
    },
  },
  {
    id: 'world-7-practice-writerun-discount-codes',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Write a function that returns a number or null, then add up only the codes that have a value.',
    conceptTags: ['lesson:nullable-types', 'lesson:null-checks', 'nullable-return', 'function', 'null-check', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Discount Codes',
    goal:
      'A shop knows two discount codes. Write a function that can return "no discount". Print the value of each code. Then add only the discount codes the shop knows.',
    description:
      '1. **Write the function.** Above `main`, write `fun findDiscount(code: String): Int?`. It returns `10` for "SAVE10", `25` for "SAVE25" and `null` for any other code. Do not return `0`, because an unknown code has no discount at all.\n\n' +
              '2. **Print each code.** Loop over `codes`. Keep `findDiscount(code)` in `val discount`. Print one line for each code. An unknown code prints `null`:\n"SAVE10 -> 10"\n"WELCOME -> null"\n"SAVE25 -> 25"\n\n' +
              '3. **Add up the discounts.** Inside the loop, add `discount` to `saved`, but only when it is not `null`.\n\n' +
              '4. **Print the total.** After the loop:\n"Total discount: 35"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Return `Int?`, with `null` for an unknown code.',
          '2. **Print each code.** Keep the result in `discount`.',
          '3. **Add up the discounts.** Skip `null`.',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write the function. Return Int?, with null for an unknown code.',
          '// 2. Print each code. Keep the result in discount.',
          '// 3. Add up the discounts. Skip null.',
          '// 4. Print the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Print each code.**',
          '3. **Add up the discounts.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Print each code.',
          '// 3. Add up the discounts.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'findDiscount', params: 'code: String', returns: 'Int?' },
    fileName: 'DiscountCodes.kt',
    initialCode: `// 1. Write the function. Above main, write fun findDiscount(code: String): Int?. It returns 10 for "SAVE10", 25 for "SAVE25" and null for any other code. Do not return 0, because an unknown code has no discount at all.

fun main() {
  val codes = listOf("SAVE10", "WELCOME", "SAVE25")
  var saved = 0

  // 2. Print each code. Loop over codes. Keep findDiscount(code) in val discount. Print one line for each code. An unknown code prints null: "SAVE10 -> 10" "WELCOME -> null" "SAVE25 -> 25"

  // 3. Add up the discounts. Inside the loop, add discount to saved, but only when it is not null.

  // 4. Print the total. After the loop: "Total discount: 35"
}`,
    solutionCode: `fun findDiscount(code: String): Int? {
  if (code == "SAVE10") {
    return 10
  }
  if (code == "SAVE25") {
    return 25
  }
  return null
}

fun main() {
  val codes = listOf("SAVE10", "WELCOME", "SAVE25")
  var saved = 0

  for (code in codes) {
    val discount = findDiscount(code)
    println("$code -> $discount")
    if (discount != null) {
      saved += discount
    }
  }
  println("Total discount: $saved")
}`,
    sampleInput: 'main()',
    expectedOutput: 'SAVE10 -> 10\nWELCOME -> null\nSAVE25 -> 25\nTotal discount: 35',
    testCase: { call: '', expected: 'SAVE10 -> 10\nWELCOME -> null\nSAVE25 -> 25\nTotal discount: 35' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'codes', originalLiteral: 'listOf("SAVE10", "WELCOME", "SAVE25")', alternateLiteral: 'listOf("SAVE25", "SAVE25", "NOPE")' }],
      alternateExpectedOutput: 'SAVE25 -> 25\nSAVE25 -> 25\nNOPE -> null\nTotal discount: 50',
    },
  },

  // ------------------------------------------------------- nullable variables
  {
    id: 'world-7-practice-writerun-session-token',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Change a nullable variable from null to a value and back, and print it safely each time.',
    conceptTags: ['lesson:nullable-variables', 'lesson:safe-call', 'nullable-var', 'reassignment', 'safe-call'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Session Token',
    goal:
      'A login token starts empty, gets a value at login and is cleared at logout. Print the token at each stage. Count how many times it changes.',
    description:
      '1. **Print the start.** Use a string template:\n"Start: null"\n\n' +
              '2. **Log in.** Set `token` to "abc123" and add `1` to `changes`. Print the token and its length. Use `token?.length` for the length:\n"Logged in: abc123 (6 chars)"\n\n' +
              '3. **Log out.** Set `token` to `null` and add `1` to `changes`. Print the token:\n"Logged out: null"\n\n' +
              '4. **Print the changes.**\n"Changes: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the start.**',
          '2. **Log in.** Use `token?.length`.',
          '3. **Log out.** Set the token to `null`.',
          '4. **Print the changes.**',
        ],
        comments: [
          '// 1. Print the start.',
          '// 2. Log in. Use token?.length.',
          '// 3. Log out. Set the token to null.',
          '// 4. Print the changes.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the start.**',
          '2. **Log in.**',
          '3. **Log out.**',
          '4. **Print the changes.**',
        ],
        comments: [
          '// 1. Print the start.',
          '// 2. Log in.',
          '// 3. Log out.',
          '// 4. Print the changes.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SessionToken.kt',
    initialCode: `fun main() {
  var token: String? = null
  var changes = 0

  // 1. Print the start. Use a string template: "Start: null"

  // 2. Log in. Set token to "abc123" and add 1 to changes. Print the token and its length. Use token?.length for the length: "Logged in: abc123 (6 chars)"

  // 3. Log out. Set token to null and add 1 to changes. Print the token: "Logged out: null"

  // 4. Print the changes. "Changes: 2"
}`,
    solutionCode: `fun main() {
  var token: String? = null
  var changes = 0

  println("Start: $token")
  token = "abc123"
  changes++
  println("Logged in: $token (\${token?.length} chars)")
  token = null
  changes++
  println("Logged out: $token")
  println("Changes: $changes")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Start: null\nLogged in: abc123 (6 chars)\nLogged out: null\nChanges: 2',
    testCase: { call: '', expected: 'Start: null\nLogged in: abc123 (6 chars)\nLogged out: null\nChanges: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'token', originalLiteral: 'null', alternateLiteral: '"seed"' }],
      alternateExpectedOutput: 'Start: seed\nLogged in: abc123 (6 chars)\nLogged out: null\nChanges: 2',
    },
  },
  {
    id: 'world-7-practice-writerun-login-events',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Go through a list of login and logout events and keep track of who is signed in.',
    conceptTags: ['lesson:nullable-variables', 'lesson:elvis-operator', 'nullable-var', 'loop', 'elvis', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Login Events',
    goal:
      'A log has events like "login:ana" and "logout". Read them in order using one nullable variable for the signed-in user. Print the state after each event. Then print the number of sessions and who is still signed in.',
    description:
      '1. **Handle a logout.** Loop over `events`. When the event is "logout", set `current` to `null`.\n\n' +
              '2. **Handle a login.** Any other event is "login:" and a name. Set `current` to `event.substring(6)` and add `1` to `sessions`.\n\n' +
              '3. **Print the state.** After each event, print the event and who is signed in. Show "nobody" when `current` is `null`. Use `?:`:\n"login:ana -> ana"\n"logout -> nobody"\n"login:ben -> ben"\n"logout -> nobody"\n"login:cy -> cy"\n\n' +
              '4. **Print the totals.** After the loop:\n"Sessions: 3"\n"Active: cy"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Handle a logout.** Set `current` to `null`.',
          '2. **Handle a login.** Use `substring(6)` and count the session.',
          '3. **Print the state.** Use `?:` for "nobody".',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Handle a logout. Set current to null.',
          '// 2. Handle a login. Use substring(6) and count the session.',
          '// 3. Print the state. Use ?: for "nobody".',
          '// 4. Print the totals.',
        ],
      },
      experienced: {
        steps: [
          '1. **Handle a logout.**',
          '2. **Handle a login.**',
          '3. **Print the state.**',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Handle a logout.',
          '// 2. Handle a login.',
          '// 3. Print the state.',
          '// 4. Print the totals.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LoginEvents.kt',
    initialCode: `fun main() {
  val events = listOf("login:ana", "logout", "login:ben", "logout", "login:cy")
  var current: String? = null
  var sessions = 0

  // 1. Handle a logout. Loop over events. When the event is "logout", set current to null.

  // 2. Handle a login. Any other event is "login:" and a name. Set current to event.substring(6) and add 1 to sessions.

  // 3. Print the state. After each event, print the event and who is signed in. Show "nobody" when current is null. Use ?:: "login:ana -> ana" "logout -> nobody" "login:ben -> ben" "logout -> nobody" "login:cy -> cy"

  // 4. Print the totals. After the loop: "Sessions: 3" "Active: cy"
}`,
    solutionCode: `fun main() {
  val events = listOf("login:ana", "logout", "login:ben", "logout", "login:cy")
  var current: String? = null
  var sessions = 0

  for (event in events) {
    if (event == "logout") {
      current = null
    } else {
      current = event.substring(6)
      sessions++
    }
    println("$event -> \${current ?: "nobody"}")
  }
  println("Sessions: $sessions")
  println("Active: \${current ?: "nobody"}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'login:ana -> ana\nlogout -> nobody\nlogin:ben -> ben\nlogout -> nobody\nlogin:cy -> cy\nSessions: 3\nActive: cy',
    testCase: { call: '', expected: 'login:ana -> ana\nlogout -> nobody\nlogin:ben -> ben\nlogout -> nobody\nlogin:cy -> cy\nSessions: 3\nActive: cy' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'events', originalLiteral: 'listOf("login:ana", "logout", "login:ben", "logout", "login:cy")', alternateLiteral: 'listOf("login:zed", "login:kim", "logout")' }],
      alternateExpectedOutput: 'login:zed -> zed\nlogin:kim -> kim\nlogout -> nobody\nSessions: 2\nActive: nobody',
    },
  },

  // ---------------------------------------------------------------- safe call
  {
    id: 'world-7-practice-writerun-lookup-lengths',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Read lengths with a safe call. A missing value gives null instead of a crash.',
    conceptTags: ['lesson:safe-call', 'safe-call', 'safe-chain', 'nullable-template'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Lookup Lengths',
    goal:
      'Three profile fields can be missing. Read each one with a safe call so a missing field gives null instead of a crash. Also check what a chain of safe calls does to padded text.',
    description:
      '1. **Print the city length.** Use `city?.length` in a string template:\n"City length: 6"\n\n' +
              '2. **Print the note length.** Do the same for `note`. It is `null`, so the result is `null`:\n"Note length: null"\n\n' +
              '3. **Print the clean tag.** Remove the spaces and make the letters capital with `tag?.trim()?.uppercase()`:\n"Tag: KOTLIN"\n\n' +
              '4. **Print the tag length.** Use `tag?.trim()?.length`:\n"Tag length: 6"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the city length.** Use `?.length`.',
          '2. **Print the note length.** Use `?.length`.',
          '3. **Print the clean tag.** Chain `?.trim()` and `?.uppercase()`.',
          '4. **Print the tag length.** Chain `?.trim()` and `?.length`.',
        ],
        comments: [
          '// 1. Print the city length. Use ?.length.',
          '// 2. Print the note length. Use ?.length.',
          '// 3. Print the clean tag. Chain ?.trim() and ?.uppercase().',
          '// 4. Print the tag length. Chain ?.trim() and ?.length.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the city length.**',
          '2. **Print the note length.**',
          '3. **Print the clean tag.**',
          '4. **Print the tag length.**',
        ],
        comments: [
          '// 1. Print the city length.',
          '// 2. Print the note length.',
          '// 3. Print the clean tag.',
          '// 4. Print the tag length.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LookupLengths.kt',
    initialCode: `fun main() {
  val city: String? = "Lisbon"
  val note: String? = null
  val tag: String? = "  kotlin  "

  // 1. Print the city length. Use city?.length in a string template: "City length: 6"

  // 2. Print the note length. Do the same for note. It is null, so the result is null: "Note length: null"

  // 3. Print the clean tag. Remove the spaces and make the letters capital with tag?.trim()?.uppercase(): "Tag: KOTLIN"

  // 4. Print the tag length. Use tag?.trim()?.length: "Tag length: 6"
}`,
    solutionCode: `fun main() {
  val city: String? = "Lisbon"
  val note: String? = null
  val tag: String? = "  kotlin  "

  println("City length: \${city?.length}")
  println("Note length: \${note?.length}")
  println("Tag: \${tag?.trim()?.uppercase()}")
  println("Tag length: \${tag?.trim()?.length}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'City length: 6\nNote length: null\nTag: KOTLIN\nTag length: 6',
    testCase: { call: '', expected: 'City length: 6\nNote length: null\nTag: KOTLIN\nTag length: 6' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'city', originalLiteral: '"Lisbon"', alternateLiteral: '"Rome"' }],
      alternateExpectedOutput: 'City length: 4\nNote length: null\nTag: KOTLIN\nTag length: 6',
    },
  },
  {
    id: 'world-7-practice-writerun-customer-addresses',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Read a city and a zip code when the address, or its city, can be missing.',
    conceptTags: ['lesson:safe-call', 'lesson:chaining', 'safe-chain', 'nullable-property', 'null-check', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Customer Addresses',
    goal:
      'A customer may have no address, or an address with no city. Read the city and zip code of each customer with safe calls. Print what you find and count the customers with a known city.',
    description:
      'The classes and the customers are in the starter code. Ben has an address with no city. Cara has no address at all.\n\n' +
              '1. **Read the city and the zip.** Loop over `customers`. Create `val city = customer.address?.city` and `val zip = customer.address?.zip`.\n\n' +
              '2. **Print each customer.** Use string templates. A missing value prints `null`:\n"Asha: city=Pune zip=411001"\n"Ben: city=null zip=100001"\n"Cara: city=null zip=null"\n\n' +
              '3. **Count the known cities.** Add `1` to `known` when `city` is not `null`.\n\n' +
              '4. **Print the count.** After the loop:\n"Known cities: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Read the city and the zip.** Use `address?.city` and `address?.zip`.',
          '2. **Print each customer.** Use string templates.',
          '3. **Count the known cities.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Read the city and the zip. Use address?.city and address?.zip.',
          '// 2. Print each customer. Use string templates.',
          '// 3. Count the known cities.',
          '// 4. Print the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Read the city and the zip.**',
          '2. **Print each customer.**',
          '3. **Count the known cities.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Read the city and the zip.',
          '// 2. Print each customer.',
          '// 3. Count the known cities.',
          '// 4. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'CustomerAddresses.kt',
    initialCode: `class Address(val city: String?, val zip: String?)
class Customer(val name: String, val address: Address?)

fun main() {
  val c1 = Customer("Asha", Address("Pune", "411001"))
  val c2 = Customer("Ben", Address(null, "100001"))
  val c3 = Customer("Cara", null)
  val customers = listOf(c1, c2, c3)
  var known = 0

  // 1. Read the city and the zip. Loop over customers. Create val city = customer.address?.city and val zip = customer.address?.zip.

  // 2. Print each customer. Use string templates. A missing value prints null: "Asha: city=Pune zip=411001" "Ben: city=null zip=100001" "Cara: city=null zip=null"

  // 3. Count the known cities. Add 1 to known when city is not null.

  // 4. Print the count. After the loop: "Known cities: 1"
}`,
    solutionCode: `class Address(val city: String?, val zip: String?)
class Customer(val name: String, val address: Address?)

fun main() {
  val c1 = Customer("Asha", Address("Pune", "411001"))
  val c2 = Customer("Ben", Address(null, "100001"))
  val c3 = Customer("Cara", null)
  val customers = listOf(c1, c2, c3)
  var known = 0

  for (customer in customers) {
    val city = customer.address?.city
    val zip = customer.address?.zip
    println("\${customer.name}: city=$city zip=$zip")
    if (city != null) {
      known++
    }
  }
  println("Known cities: $known")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Asha: city=Pune zip=411001\nBen: city=null zip=100001\nCara: city=null zip=null\nKnown cities: 1',
    testCase: { call: '', expected: 'Asha: city=Pune zip=411001\nBen: city=null zip=100001\nCara: city=null zip=null\nKnown cities: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'c2', originalLiteral: 'Customer("Ben", Address(null, "100001"))', alternateLiteral: 'Customer("Ben", Address("Oslo", "0150"))' }],
      alternateExpectedOutput: 'Asha: city=Pune zip=411001\nBen: city=Oslo zip=0150\nCara: city=null zip=null\nKnown cities: 2',
    },
  },

  // ------------------------------------------------------------------- elvis
  {
    id: 'world-7-practice-writerun-display-name',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Use ?: to give a default when a value is missing.',
    conceptTags: ['lesson:elvis-operator', 'lesson:safe-call', 'elvis', 'default-value', 'safe-call'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Display Name',
    goal:
      'A profile card must always show something. Use a default for every missing field. Show the bio length as 0 when there is no bio.',
    description:
      '1. **Choose the name to show.** Create `val shown` as `nickname ?: fullName`. Print it:\n"Shown: Mira Shah"\n\n' +
              '2. **Print the bio.** Use `bio ?: "No bio"`:\n"Bio: Loves Kotlin"\n\n' +
              '3. **Print the city.** Use `city ?: "Unknown"`:\n"City: Unknown"\n\n' +
              '4. **Print the bio length.** Create `val bioLength` as `bio?.length ?: 0`. Print it:\n"Bio length: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Choose the name to show.** Use `?:`.',
          '2. **Print the bio.** Use `?:` with "No bio".',
          '3. **Print the city.** Use `?:` with "Unknown".',
          '4. **Print the bio length.** Combine `?.` and `?:`.',
        ],
        comments: [
          '// 1. Choose the name to show. Use ?:.',
          '// 2. Print the bio. Use ?: with "No bio".',
          '// 3. Print the city. Use ?: with "Unknown".',
          '// 4. Print the bio length. Combine ?. and ?:.',
        ],
      },
      experienced: {
        steps: [
          '1. **Choose the name to show.**',
          '2. **Print the bio.**',
          '3. **Print the city.**',
          '4. **Print the bio length.**',
        ],
        comments: [
          '// 1. Choose the name to show.',
          '// 2. Print the bio.',
          '// 3. Print the city.',
          '// 4. Print the bio length.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'DisplayName.kt',
    initialCode: `fun main() {
  val nickname: String? = null
  val fullName: String = "Mira Shah"
  val bio: String? = "Loves Kotlin"
  val city: String? = null

  // 1. Choose the name to show. Create val shown as nickname ?: fullName. Print it: "Shown: Mira Shah"

  // 2. Print the bio. Use bio ?: "No bio": "Bio: Loves Kotlin"

  // 3. Print the city. Use city ?: "Unknown": "City: Unknown"

  // 4. Print the bio length. Create val bioLength as bio?.length ?: 0. Print it: "Bio length: 12"
}`,
    solutionCode: `fun main() {
  val nickname: String? = null
  val fullName: String = "Mira Shah"
  val bio: String? = "Loves Kotlin"
  val city: String? = null

  val shown = nickname ?: fullName
  println("Shown: $shown")
  println("Bio: \${bio ?: "No bio"}")
  println("City: \${city ?: "Unknown"}")
  val bioLength = bio?.length ?: 0
  println("Bio length: $bioLength")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Shown: Mira Shah\nBio: Loves Kotlin\nCity: Unknown\nBio length: 12',
    testCase: { call: '', expected: 'Shown: Mira Shah\nBio: Loves Kotlin\nCity: Unknown\nBio length: 12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'nickname', originalLiteral: 'null', alternateLiteral: '"Mimi"' }],
      alternateExpectedOutput: 'Shown: Mimi\nBio: Loves Kotlin\nCity: Unknown\nBio length: 12',
    },
  },
  {
    id: 'world-7-practice-writerun-lazy-fallback',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'The right side of ?: runs only when the left side is null. Count how often it runs.',
    conceptTags: ['lesson:elvis-operator', 'elvis', 'lazy-evaluation', 'side-effect', 'function-call'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Lazy Fallback',
    goal:
      'Creating the default value costs a lot, so it should happen only when a value is missing. Use ?: on four values. Then print how many times the default was created.',
    description:
      'Each time `expensiveDefault()` runs, it adds `1` to `lookups` and returns "DEFAULT". The values `a`, `b`, `c` and `d` are in the starter code. `b` and `d` are `null`.\n\n' +
              '1. **Print the four values.** For each of `a`, `b`, `c` and `d`, print the value, or `expensiveDefault()` when it is `null`. Write the call right after `?:`, so it runs only when needed:\n"cached"\n"DEFAULT"\n"warm"\n"DEFAULT"\n\n' +
              '2. **Print the count.** Say how many times the default was made:\n"Computed defaults: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the four values.** Put `expensiveDefault()` after `?:`.',
          '2. **Print the count.** Read `lookups`.',
        ],
        comments: [
          '// 1. Print the four values. Put expensiveDefault() after ?:.',
          '// 2. Print the count. Read lookups.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the four values.**',
          '2. **Print the count.**',
        ],
        comments: [
          '// 1. Print the four values.',
          '// 2. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LazyFallback.kt',
    initialCode: `var lookups = 0

fun expensiveDefault(): String {
  lookups++
  return "DEFAULT"
}

fun main() {
  val a: String? = "cached"
  val b: String? = null
  val c: String? = "warm"
  val d: String? = null

  // 1. Print the four values. For each of a, b, c and d, print the value, or expensiveDefault() when it is null. Write the call right after ?:, so it runs only when needed: "cached" "DEFAULT" "warm" "DEFAULT"

  // 2. Print the count. Say how many times the default was made: "Computed defaults: 2"
}`,
    solutionCode: `var lookups = 0

fun expensiveDefault(): String {
  lookups++
  return "DEFAULT"
}

fun main() {
  val a: String? = "cached"
  val b: String? = null
  val c: String? = "warm"
  val d: String? = null

  println(a ?: expensiveDefault())
  println(b ?: expensiveDefault())
  println(c ?: expensiveDefault())
  println(d ?: expensiveDefault())
  println("Computed defaults: $lookups")
}`,
    sampleInput: 'main()',
    expectedOutput: 'cached\nDEFAULT\nwarm\nDEFAULT\nComputed defaults: 2',
    testCase: { call: '', expected: 'cached\nDEFAULT\nwarm\nDEFAULT\nComputed defaults: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'b', originalLiteral: 'null', alternateLiteral: '"set"' }],
      alternateExpectedOutput: 'cached\nset\nwarm\nDEFAULT\nComputed defaults: 1',
    },
  },

  // --------------------------------------------------------- non-null assertion
  {
    id: 'world-7-practice-writerun-confirmed-username',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Use !! for a value that must exist, and keep a value that can be null on the safe path.',
    conceptTags: ['lesson:non-null-assertion', 'lesson:elvis-operator', 'non-null-assertion', 'safe-call', 'elvis'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Confirmed Username',
    goal:
      'The stored username comes from code that makes sure it exists, so !! is safe there. The user\'s guess can be missing, so keep it safe. Then add the two lengths.',
    description:
      '1. **Assert the stored name.** Create `val username` as `stored!!`. Print its length and its capital letters:\n"Stored length: 8"\n"Stored upper: ADMIN_01"\n\n' +
              '2. **Read the guess safely.** `guess` can be `null`, so do not use `!!`. Print its length with `?.length ?: 0`:\n"Guess length: 0"\n\n' +
              '3. **Add the lengths.** Create `val total`: `username.length` plus the guess length (`0` when it is `null`). Print it:\n"Total: 8"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Assert the stored name.** Use `!!`.',
          '2. **Read the guess safely.** Use `?.length ?: 0`.',
          '3. **Add the lengths.**',
        ],
        comments: [
          '// 1. Assert the stored name. Use !!.',
          '// 2. Read the guess safely. Use ?.length ?: 0.',
          '// 3. Add the lengths.',
        ],
      },
      experienced: {
        steps: [
          '1. **Assert the stored name.**',
          '2. **Read the guess safely.**',
          '3. **Add the lengths.**',
        ],
        comments: [
          '// 1. Assert the stored name.',
          '// 2. Read the guess safely.',
          '// 3. Add the lengths.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ConfirmedUsername.kt',
    initialCode: `fun main() {
  val stored: String? = "admin_01"
  val guess: String? = null

  // 1. Assert the stored name. Create val username as stored!!. Print its length and its capital letters: "Stored length: 8" "Stored upper: ADMIN_01"

  // 2. Read the guess safely. guess can be null, so do not use !!. Print its length with ?.length ?: 0: "Guess length: 0"

  // 3. Add the lengths. Create val total: username.length plus the guess length (0 when it is null). Print it: "Total: 8"
}`,
    solutionCode: `fun main() {
  val stored: String? = "admin_01"
  val guess: String? = null

  val username = stored!!
  println("Stored length: \${username.length}")
  println("Stored upper: \${username.uppercase()}")
  println("Guess length: \${guess?.length ?: 0}")
  val total = username.length + (guess?.length ?: 0)
  println("Total: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Stored length: 8\nStored upper: ADMIN_01\nGuess length: 0\nTotal: 8',
    testCase: { call: '', expected: 'Stored length: 8\nStored upper: ADMIN_01\nGuess length: 0\nTotal: 8' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'stored', originalLiteral: '"admin_01"', alternateLiteral: '"root"' }],
      alternateExpectedOutput: 'Stored length: 4\nStored upper: ROOT\nGuess length: 0\nTotal: 4',
    },
  },
  {
    id: 'world-7-practice-writerun-load-config',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Use !! for settings that must exist, and ?: for a setting that can be missing.',
    conceptTags: ['lesson:non-null-assertion', 'lesson:elvis-operator', 'non-null-assertion', 'elvis', 'function-result', 'toInt'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Load Config',
    goal:
      'A settings lookup can return null for any key. The host and port are required, so you may use !!. The timeout is optional, so give it a default.',
    description:
      '`loadSetting(key: String): String?` is in the starter code. It knows "host" (db.local), "user" (svc) and "port" (5432). It returns `null` for any other key.\n\n' +
              '1. **Read the host.** Create `val host` as `loadSetting(hostKey)!!`. It is required, so assert it.\n\n' +
              '2. **Read the port.** Create `val port` as `loadSetting("port")!!.toInt()`.\n\n' +
              '3. **Read the timeout.** It is optional. Create `val timeout` as `loadSetting("timeout") ?: "30"`.\n\n' +
              '4. **Print three lines.** The next port is the port plus `1`:\n"Host: db.local"\n"Next port: 5433"\n"Timeout: 30"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Read the host.** Assert it with `!!`.',
          '2. **Read the port.** Assert it, then convert it.',
          '3. **Read the timeout.** Give it a default with `?:`.',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Read the host. Assert it with !!.',
          '// 2. Read the port. Assert it, then convert it.',
          '// 3. Read the timeout. Give it a default with ?:.',
          '// 4. Print three lines.',
        ],
      },
      experienced: {
        steps: [
          '1. **Read the host.**',
          '2. **Read the port.**',
          '3. **Read the timeout.**',
          '4. **Print three lines.**',
        ],
        comments: [
          '// 1. Read the host.',
          '// 2. Read the port.',
          '// 3. Read the timeout.',
          '// 4. Print three lines.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'LoadConfig.kt',
    initialCode: `fun loadSetting(key: String): String? {
  if (key == "host") {
    return "db.local"
  }
  if (key == "user") {
    return "svc"
  }
  if (key == "port") {
    return "5432"
  }
  return null
}

fun main() {
  val hostKey = "host"

  // 1. Read the host. Create val host as loadSetting(hostKey)!!. It is required, so assert it.

  // 2. Read the port. Create val port as loadSetting("port")!!.toInt().

  // 3. Read the timeout. It is optional. Create val timeout as loadSetting("timeout") ?: "30".

  // 4. Print three lines. The next port is the port plus 1: "Host: db.local" "Next port: 5433" "Timeout: 30"
}`,
    solutionCode: `fun loadSetting(key: String): String? {
  if (key == "host") {
    return "db.local"
  }
  if (key == "user") {
    return "svc"
  }
  if (key == "port") {
    return "5432"
  }
  return null
}

fun main() {
  val hostKey = "host"

  val host = loadSetting(hostKey)!!
  val port = loadSetting("port")!!.toInt()
  val timeout = loadSetting("timeout") ?: "30"
  println("Host: $host")
  println("Next port: \${port + 1}")
  println("Timeout: $timeout")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Host: db.local\nNext port: 5433\nTimeout: 30',
    testCase: { call: '', expected: 'Host: db.local\nNext port: 5433\nTimeout: 30' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'hostKey', originalLiteral: '"host"', alternateLiteral: '"user"' }],
      alternateExpectedOutput: 'Host: svc\nNext port: 5433\nTimeout: 30',
    },
  },

  // -------------------------------------------------------------- null checks
  {
    id: 'world-7-practice-writerun-age-report',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Write a function that checks for null first, then sort ages into adult, minor and unknown.',
    conceptTags: ['lesson:null-checks', 'lesson:smart-casts', 'null-check', 'function', 'loop', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Age Report',
    goal:
      'Ages come from a form, so any age can be missing. Mark each age as adult, minor or unknown. Print the age and its label. Count the adults.',
    description:
      '1. **Write the function.** Above `main`, write `fun describe(age: Int?): String`. Check for `null` first and return "unknown". Then return "adult" when `age >= 18`, and "minor" if not.\n\n' +
              '2. **Print each age.** Loop over `listOf(age1, age2, age3)`. Keep `describe(age)` in `val label`. Print the age and the label. A missing age prints `null`:\n"34: adult"\n"null: unknown"\n"17: minor"\n\n' +
              '3. **Count the adults.** Add `1` to `adults` when `label` is "adult".\n\n' +
              '4. **Print the count.** After the loop:\n"Adults: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Check `null` first.',
          '2. **Print each age.** Keep the result in `label`.',
          '3. **Count the adults.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Write the function. Check null first.',
          '// 2. Print each age. Keep the result in label.',
          '// 3. Count the adults.',
          '// 4. Print the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Print each age.**',
          '3. **Count the adults.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Print each age.',
          '// 3. Count the adults.',
          '// 4. Print the count.',
        ],
      },
    },
    requirements: { name: 'describe', params: 'age: Int?', returns: 'String' },
    fileName: 'AgeReport.kt',
    initialCode: `// 1. Write the function. Above main, write fun describe(age: Int?): String. Check for null first and return "unknown". Then return "adult" when age >= 18, and "minor" if not.

fun main() {
  val age1: Int? = 34
  val age2: Int? = null
  val age3: Int? = 17
  var adults = 0

  // 2. Print each age. Loop over listOf(age1, age2, age3). Keep describe(age) in val label. Print the age and the label. A missing age prints null: "34: adult" "null: unknown" "17: minor"

  // 3. Count the adults. Add 1 to adults when label is "adult".

  // 4. Print the count. After the loop: "Adults: 1"
}`,
    solutionCode: `fun describe(age: Int?): String {
  if (age == null) {
    return "unknown"
  }
  if (age >= 18) {
    return "adult"
  }
  return "minor"
}

fun main() {
  val age1: Int? = 34
  val age2: Int? = null
  val age3: Int? = 17
  var adults = 0

  for (age in listOf(age1, age2, age3)) {
    val label = describe(age)
    println("$age: $label")
    if (label == "adult") {
      adults++
    }
  }
  println("Adults: $adults")
}`,
    sampleInput: 'main()',
    expectedOutput: '34: adult\nnull: unknown\n17: minor\nAdults: 1',
    testCase: { call: '', expected: '34: adult\nnull: unknown\n17: minor\nAdults: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'age3', originalLiteral: '17', alternateLiteral: '45' }],
      alternateExpectedOutput: '34: adult\nnull: unknown\n45: adult\nAdults: 2',
    },
  },
  {
    id: 'world-7-practice-writerun-pin-checker',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Write two functions that use && and || so a missing PIN is never read.',
    conceptTags: ['lesson:null-checks', 'lesson:smart-casts', 'null-check', 'short-circuit', 'function', 'boolean-logic'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'PIN Checker',
    goal:
      'A PIN is valid when it exists and has exactly 4 characters. It needs a reset when it is missing or shorter than 4. Write both rules without reading the length of a missing PIN. Print each PIN and count the valid ones.',
    description:
      '1. **Write the valid check.** Above `main`, write `fun isValidPin(pin: String?): Boolean`. It is `true` when `pin != null && pin.length == 4`.\n\n' +
              '2. **Write the reset check.** Write `fun needsReset(pin: String?): Boolean`. It is `true` when `pin == null || pin.length < 4`.\n\n' +
              '3. **Print each PIN.** Loop over `listOf(p1, p2, p3)`. Print the PIN with both answers. A missing PIN prints `null`:\n"1234 -> valid=true reset=false"\n"null -> valid=false reset=true"\n"98 -> valid=false reset=true"\n\n' +
              '4. **Count the valid PINs.** Keep the count in `var valid`. After the loop:\n"Valid: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the valid check.** Use `&&`.',
          '2. **Write the reset check.** Use `||`.',
          '3. **Print each PIN.** Print both answers.',
          '4. **Count the valid PINs.**',
        ],
        comments: [
          '// 1. Write the valid check. Use &&.',
          '// 2. Write the reset check. Use ||.',
          '// 3. Print each PIN. Print both answers.',
          '// 4. Count the valid PINs.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the valid check.**',
          '2. **Write the reset check.**',
          '3. **Print each PIN.**',
          '4. **Count the valid PINs.**',
        ],
        comments: [
          '// 1. Write the valid check.',
          '// 2. Write the reset check.',
          '// 3. Print each PIN.',
          '// 4. Count the valid PINs.',
        ],
      },
    },
    requirements: { name: 'isValidPin', params: 'pin: String?', returns: 'Boolean' },
    fileName: 'PinChecker.kt',
    initialCode: `// 1. Write the valid check. Above main, write fun isValidPin(pin: String?): Boolean. It is true when pin != null && pin.length == 4.
// 2. Write the reset check. Write fun needsReset(pin: String?): Boolean. It is true when pin == null || pin.length < 4.

fun main() {
  val p1: String? = "1234"
  val p2: String? = null
  val p3: String? = "98"
  var valid = 0

  // 3. Print each PIN. Loop over listOf(p1, p2, p3). Print the PIN with both answers. A missing PIN prints null: "1234 -> valid=true reset=false" "null -> valid=false reset=true" "98 -> valid=false reset=true"

  // 4. Count the valid PINs. Keep the count in var valid. After the loop: "Valid: 1"
}`,
    solutionCode: `fun isValidPin(pin: String?): Boolean {
  return pin != null && pin.length == 4
}

fun needsReset(pin: String?): Boolean {
  return pin == null || pin.length < 4
}

fun main() {
  val p1: String? = "1234"
  val p2: String? = null
  val p3: String? = "98"
  var valid = 0

  for (pin in listOf(p1, p2, p3)) {
    println("$pin -> valid=\${isValidPin(pin)} reset=\${needsReset(pin)}")
    if (isValidPin(pin)) {
      valid++
    }
  }
  println("Valid: $valid")
}`,
    sampleInput: 'main()',
    expectedOutput: '1234 -> valid=true reset=false\nnull -> valid=false reset=true\n98 -> valid=false reset=true\nValid: 1',
    testCase: { call: '', expected: '1234 -> valid=true reset=false\nnull -> valid=false reset=true\n98 -> valid=false reset=true\nValid: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'p3', originalLiteral: '"98"', alternateLiteral: '"5678"' }],
      alternateExpectedOutput: '1234 -> valid=true reset=false\nnull -> valid=false reset=true\n5678 -> valid=true reset=false\nValid: 2',
    },
  },

  // -------------------------------------------------------------- smart casts
  {
    id: 'world-7-practice-writerun-bio-lengths',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'After a null check, use plain dots inside the branch, and add up only the real values.',
    conceptTags: ['lesson:smart-casts', 'lesson:null-checks', 'smart-cast', 'null-check', 'loop', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Bio Lengths',
    goal:
      'Two profile texts can be missing. Inside a null check, Kotlin knows the text exists, so you can use plain dots. Print a line for each text. Add the lengths of the texts that exist.',
    description:
      '1. **Check each text.** Loop over `listOf(headline, summary)` with the variable `text`. Use `if (text != null)`.\n\n' +
              '2. **Use the text.** Inside the check, use plain `text.length` and `text.uppercase()`, with no `?.`. Print the length and the capital letters, and add the length to `totalChars`:\n"10 chars: KOTLIN DEV"\n\n' +
              '3. **Handle the missing text.** In the `else` branch, print:\n"none"\n\n' +
              '4. **Print the total.** After the loop:\n"Total: 10"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check each text.** Use `!= null`.',
          '2. **Use the text.** Use plain dots inside the check.',
          '3. **Handle the missing text.** Use `else`.',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Check each text. Use != null.',
          '// 2. Use the text. Use plain dots inside the check.',
          '// 3. Handle the missing text. Use else.',
          '// 4. Print the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check each text.**',
          '2. **Use the text.**',
          '3. **Handle the missing text.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Check each text.',
          '// 2. Use the text.',
          '// 3. Handle the missing text.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'BioLengths.kt',
    initialCode: `fun main() {
  val headline: String? = "Kotlin Dev"
  val summary: String? = null
  var totalChars = 0

  // 1. Check each text. Loop over listOf(headline, summary) with the variable text. Use if (text != null).

  // 2. Use the text. Inside the check, use plain text.length and text.uppercase(), with no ?.. Print the length and the capital letters, and add the length to totalChars: "10 chars: KOTLIN DEV"

  // 3. Handle the missing text. In the else branch, print: "none"

  // 4. Print the total. After the loop: "Total: 10"
}`,
    solutionCode: `fun main() {
  val headline: String? = "Kotlin Dev"
  val summary: String? = null
  var totalChars = 0

  for (text in listOf(headline, summary)) {
    if (text != null) {
      println("\${text.length} chars: \${text.uppercase()}")
      totalChars += text.length
    } else {
      println("none")
    }
  }
  println("Total: $totalChars")
}`,
    sampleInput: 'main()',
    expectedOutput: '10 chars: KOTLIN DEV\nnone\nTotal: 10',
    testCase: { call: '', expected: '10 chars: KOTLIN DEV\nnone\nTotal: 10' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'summary', originalLiteral: 'null', alternateLiteral: '"Builds apps"' }],
      alternateExpectedOutput: '10 chars: KOTLIN DEV\n11 chars: BUILDS APPS\nTotal: 21',
    },
  },
  {
    id: 'world-7-practice-writerun-user-emails',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Check a property for null, then use it directly inside the check.',
    conceptTags: ['lesson:smart-casts', 'lesson:null-checks', 'smart-cast', 'nullable-property', 'loop', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'User Emails',
    goal:
      'Some users have no email. Check the email property for null. Inside the check, you can use it directly because the property is a val. Print the email length or a "no email" message. Count the users with an email.',
    description:
      'The class and the three users are in the starter code. The property `email` is a `val` of type `String?`. User C has the email cc@y.org, which is 8 characters.\n\n' +
              '1. **Check each email.** Loop over `users`. Use `if (user.email != null)`.\n\n' +
              '2. **Print the length.** Inside the check, use plain `user.email.length`, with no `?.`. Add `1` to `withEmail`:\n"A: 7 chars"\n\n' +
              '3. **Handle the missing email.** In the `else` branch, print the name and "no email":\n"B: no email"\n\n' +
              '4. **Print the count.** After the loop. The three lines are "A: 7 chars", "B: no email" and "C: 8 chars". Then:\n"With email: 2"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check each email.** Use `!= null`.',
          '2. **Print the length.** Use plain dots inside the check.',
          '3. **Handle the missing email.** Use `else`.',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Check each email. Use != null.',
          '// 2. Print the length. Use plain dots inside the check.',
          '// 3. Handle the missing email. Use else.',
          '// 4. Print the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check each email.**',
          '2. **Print the length.**',
          '3. **Handle the missing email.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Check each email.',
          '// 2. Print the length.',
          '// 3. Handle the missing email.',
          '// 4. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'UserEmails.kt',
    initialCode: `class User(val name: String, val email: String?)

fun main() {
  val u1 = User("A", "a@x.com")
  val u2 = User("B", null)
  val u3 = User("C", "cc@y.org")
  val users = listOf(u1, u2, u3)
  var withEmail = 0

  // 1. Check each email. Loop over users. Use if (user.email != null).

  // 2. Print the length. Inside the check, use plain user.email.length, with no ?.. Add 1 to withEmail: "A: 7 chars"

  // 3. Handle the missing email. In the else branch, print the name and "no email": "B: no email"

  // 4. Print the count. After the loop. The three lines are "A: 7 chars", "B: no email" and "C: 8 chars". Then: "With email: 2"
}`,
    solutionCode: `class User(val name: String, val email: String?)

fun main() {
  val u1 = User("A", "a@x.com")
  val u2 = User("B", null)
  val u3 = User("C", "cc@y.org")
  val users = listOf(u1, u2, u3)
  var withEmail = 0

  for (user in users) {
    if (user.email != null) {
      println("\${user.name}: \${user.email.length} chars")
      withEmail++
    } else {
      println("\${user.name}: no email")
    }
  }
  println("With email: $withEmail")
}`,
    sampleInput: 'main()',
    expectedOutput: 'A: 7 chars\nB: no email\nC: 8 chars\nWith email: 2',
    testCase: { call: '', expected: 'A: 7 chars\nB: no email\nC: 8 chars\nWith email: 2' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'u2', originalLiteral: 'User("B", null)', alternateLiteral: 'User("B", "bb@z.io")' }],
      alternateExpectedOutput: 'A: 7 chars\nB: 7 chars\nC: 8 chars\nWith email: 3',
    },
  },

  // -------------------------------------------------------------- safe casts
  {
    id: 'world-7-practice-writerun-mixed-inbox',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Try a value as a String and as an Int with as?. A wrong type gives null, not a crash.',
    conceptTags: ['lesson:safe-casts', 'lesson:elvis-operator', 'safe-cast', 'elvis', 'nullable-template'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Mixed Inbox',
    goal:
      'Three values have type Any. Try to read each one as the type you expect using as?. A wrong cast must give null instead of a crash.',
    description:
      '1. **Cast the first value to text.** Create `val firstText` as `first as? String`. Print its length with `?.length`:\n"First length: 5"\n\n' +
              '2. **Cast the number to text.** Create `val secondText` as `second as? String`. Print it. 42 is not a String, so the result is `null`:\n"Second as text: null"\n\n' +
              '3. **Cast the number to a number.** Create `val secondNumber` as `second as? Int`. Print it:\n"Second as number: 42"\n\n' +
              '4. **Use a default.** Print `third as? Int` with `-1` when the cast fails. Put the cast in brackets before `?:`:\n"Third as number: -1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Cast the first value to text.** Use `as? String`.',
          '2. **Cast the number to text.** Expect `null`.',
          '3. **Cast the number to a number.** Use `as? Int`.',
          '4. **Use a default.** Use brackets and `?:`.',
        ],
        comments: [
          '// 1. Cast the first value to text. Use as? String.',
          '// 2. Cast the number to text. Expect null.',
          '// 3. Cast the number to a number. Use as? Int.',
          '// 4. Use a default. Use brackets and ?:.',
        ],
      },
      experienced: {
        steps: [
          '1. **Cast the first value to text.**',
          '2. **Cast the number to text.**',
          '3. **Cast the number to a number.**',
          '4. **Use a default.**',
        ],
        comments: [
          '// 1. Cast the first value to text.',
          '// 2. Cast the number to text.',
          '// 3. Cast the number to a number.',
          '// 4. Use a default.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'MixedInbox.kt',
    initialCode: `fun main() {
  val first: Any = "hello"
  val second: Any = 42
  val third: Any = "kotlin"

  // 1. Cast the first value to text. Create val firstText as first as? String. Print its length with ?.length: "First length: 5"

  // 2. Cast the number to text. Create val secondText as second as? String. Print it. 42 is not a String, so the result is null: "Second as text: null"

  // 3. Cast the number to a number. Create val secondNumber as second as? Int. Print it: "Second as number: 42"

  // 4. Use a default. Print third as? Int with -1 when the cast fails. Put the cast in brackets before ?:: "Third as number: -1"
}`,
    solutionCode: `fun main() {
  val first: Any = "hello"
  val second: Any = 42
  val third: Any = "kotlin"

  val firstText = first as? String
  println("First length: \${firstText?.length}")
  val secondText = second as? String
  println("Second as text: $secondText")
  val secondNumber = second as? Int
  println("Second as number: $secondNumber")
  println("Third as number: \${(third as? Int) ?: -1}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'First length: 5\nSecond as text: null\nSecond as number: 42\nThird as number: -1',
    testCase: { call: '', expected: 'First length: 5\nSecond as text: null\nSecond as number: 42\nThird as number: -1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'second', originalLiteral: '42', alternateLiteral: '"forty"' }],
      alternateExpectedOutput: 'First length: 5\nSecond as text: forty\nSecond as number: null\nThird as number: -1',
    },
  },
  {
    id: 'world-7-practice-writerun-text-lengths',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Write a function that measures only text, then add up the real text lengths.',
    conceptTags: ['lesson:safe-casts', 'lesson:chaining', 'safe-cast', 'elvis', 'function', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Text Lengths',
    goal:
      'A list has values of different types. Write a function that returns the length only when a value is text, and -1 when it is not. Print the result for each value. Add the lengths of the text values.',
    description:
      '1. **Write the function.** Above `main`, write `fun textLength(value: Any): Int`. Write it as one expression: `(value as? String)?.length ?: -1`.\n\n' +
              '2. **Print each length.** Loop over `listOf(a, b, c)`. Keep `textLength(item)` in `val len` and print it:\n"5"\n"-1"\n"2"\n\n' +
              '3. **Add up the text lengths.** Add `len` to `total` only when `len >= 0`.\n\n' +
              '4. **Print the total.** After the loop:\n"Text total: 7"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Write the function.** Use `as?`, `?.length` and `?:`.',
          '2. **Print each length.** Keep the result in `len`.',
          '3. **Add up the text lengths.** Skip `-1`.',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write the function. Use as?, ?.length and ?:.',
          '// 2. Print each length. Keep the result in len.',
          '// 3. Add up the text lengths. Skip -1.',
          '// 4. Print the total.',
        ],
      },
      experienced: {
        steps: [
          '1. **Write the function.**',
          '2. **Print each length.**',
          '3. **Add up the text lengths.**',
          '4. **Print the total.**',
        ],
        comments: [
          '// 1. Write the function.',
          '// 2. Print each length.',
          '// 3. Add up the text lengths.',
          '// 4. Print the total.',
        ],
      },
    },
    requirements: { name: 'textLength', params: 'value: Any', returns: 'Int' },
    fileName: 'TextLengths.kt',
    initialCode: `// 1. Write the function. Above main, write fun textLength(value: Any): Int. Write it as one expression: (value as? String)?.length ?: -1.

fun main() {
  val a: Any = "hello"
  val b: Any = 99
  val c: Any = "hi"
  var total = 0

  // 2. Print each length. Loop over listOf(a, b, c). Keep textLength(item) in val len and print it: "5" "-1" "2"

  // 3. Add up the text lengths. Add len to total only when len >= 0.

  // 4. Print the total. After the loop: "Text total: 7"
}`,
    solutionCode: `fun textLength(value: Any): Int {
  return (value as? String)?.length ?: -1
}

fun main() {
  val a: Any = "hello"
  val b: Any = 99
  val c: Any = "hi"
  var total = 0

  for (item in listOf(a, b, c)) {
    val len = textLength(item)
    println(len)
    if (len >= 0) {
      total += len
    }
  }
  println("Text total: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: '5\n-1\n2\nText total: 7',
    testCase: { call: '', expected: '5\n-1\n2\nText total: 7' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'b', originalLiteral: '99', alternateLiteral: '"abc"' }],
      alternateExpectedOutput: '5\n3\n2\nText total: 10',
    },
  },

  // ------------------------------------------------------ nullable collections
  {
    id: 'world-7-practice-writerun-survey-answers',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Go through a list that can hold null. Count the answers and the gaps, then find the average.',
    conceptTags: ['lesson:nullable-collections', 'lesson:null-checks', 'nullable-element', 'loop', 'null-check', 'int-division'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Survey Answers',
    goal:
      'A survey stores a score from 1 to 5 for each question, and null when the person skips it. Count the answered and skipped questions. Add the real scores and find the average of the answered questions.',
    description:
      '1. **Check each answer.** Loop over `answers` with the variable `answer`. Use `if (answer != null)`.\n\n' +
              '2. **Count the answers.** When it is not `null`, add `1` to `answered` and add `answer` to `total`. If it is `null`, add `1` to `missing`.\n\n' +
              '3. **Print the counts.**\n"Answered: 3"\n"Missing: 2"\n"Total: 12"\n\n' +
              '4. **Print the average.** Divide `total` by `answered`. Both are whole numbers:\n"Average: 4"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Check each answer.** Use `!= null`.',
          '2. **Count the answers.** Count the answered and the missing ones.',
          '3. **Print the counts.**',
          '4. **Print the average.**',
        ],
        comments: [
          '// 1. Check each answer. Use != null.',
          '// 2. Count the answers. Count the answered and the missing ones.',
          '// 3. Print the counts.',
          '// 4. Print the average.',
        ],
      },
      experienced: {
        steps: [
          '1. **Check each answer.**',
          '2. **Count the answers.**',
          '3. **Print the counts.**',
          '4. **Print the average.**',
        ],
        comments: [
          '// 1. Check each answer.',
          '// 2. Count the answers.',
          '// 3. Print the counts.',
          '// 4. Print the average.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'SurveyAnswers.kt',
    initialCode: `fun main() {
  val answers: List<Int?> = listOf(4, null, 5, null, 3)
  var answered = 0
  var missing = 0
  var total = 0

  // 1. Check each answer. Loop over answers with the variable answer. Use if (answer != null).

  // 2. Count the answers. When it is not null, add 1 to answered and add answer to total. If it is null, add 1 to missing.

  // 3. Print the counts. "Answered: 3" "Missing: 2" "Total: 12"

  // 4. Print the average. Divide total by answered. Both are whole numbers: "Average: 4"
}`,
    solutionCode: `fun main() {
  val answers: List<Int?> = listOf(4, null, 5, null, 3)
  var answered = 0
  var missing = 0
  var total = 0

  for (answer in answers) {
    if (answer != null) {
      answered++
      total += answer
    } else {
      missing++
    }
  }
  println("Answered: $answered")
  println("Missing: $missing")
  println("Total: $total")
  println("Average: \${total / answered}")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Answered: 3\nMissing: 2\nTotal: 12\nAverage: 4',
    testCase: { call: '', expected: 'Answered: 3\nMissing: 2\nTotal: 12\nAverage: 4' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'answers', originalLiteral: 'listOf(4, null, 5, null, 3)', alternateLiteral: 'listOf(null, 2, null, 7)' }],
      alternateExpectedOutput: 'Answered: 2\nMissing: 2\nTotal: 9\nAverage: 4',
    },
  },
  {
    id: 'world-7-practice-writerun-shift-lists',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'The whole list can be null. Read its size, first item and sum with a default for each.',
    conceptTags: ['lesson:nullable-collections', 'lesson:safe-call', 'nullable-list', 'safe-call', 'elvis', 'sum'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Shift Lists',
    goal:
      'The morning shift list exists, but the evening shift list was never created, so it is null. Print the size and first entry of each list and the total hours. Give every missing part a default.',
    description:
      '1. **Print the morning list.** Use `morning?.size ?: 0` and `morning?.first() ?: -1`:\n"Morning: 3 items, first 3"\n\n' +
              '2. **Print the evening list.** Do the same for `evening`. The whole list is `null`, so both defaults are used:\n"Evening: 0 items, first -1"\n\n' +
              '3. **Print the total.** Create `val total` as `(morning?.sum() ?: 0) + (evening?.sum() ?: 0)`. Print it:\n"Total: 12"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Print the morning list.** Use `?.size` and `?.first()` with `?:`.',
          '2. **Print the evening list.** Do the same.',
          '3. **Print the total.** Use `?.sum()` with `?:`.',
        ],
        comments: [
          '// 1. Print the morning list. Use ?.size and ?.first() with ?:.',
          '// 2. Print the evening list. Do the same.',
          '// 3. Print the total. Use ?.sum() with ?:.',
        ],
      },
      experienced: {
        steps: [
          '1. **Print the morning list.**',
          '2. **Print the evening list.**',
          '3. **Print the total.**',
        ],
        comments: [
          '// 1. Print the morning list.',
          '// 2. Print the evening list.',
          '// 3. Print the total.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ShiftLists.kt',
    initialCode: `fun main() {
  val morning: List<Int>? = listOf(3, 5, 4)
  val evening: List<Int>? = null

  // 1. Print the morning list. Use morning?.size ?: 0 and morning?.first() ?: -1: "Morning: 3 items, first 3"

  // 2. Print the evening list. Do the same for evening. The whole list is null, so both defaults are used: "Evening: 0 items, first -1"

  // 3. Print the total. Create val total as (morning?.sum() ?: 0) + (evening?.sum() ?: 0). Print it: "Total: 12"
}`,
    solutionCode: `fun main() {
  val morning: List<Int>? = listOf(3, 5, 4)
  val evening: List<Int>? = null

  println("Morning: \${morning?.size ?: 0} items, first \${morning?.first() ?: -1}")
  println("Evening: \${evening?.size ?: 0} items, first \${evening?.first() ?: -1}")
  val total = (morning?.sum() ?: 0) + (evening?.sum() ?: 0)
  println("Total: $total")
}`,
    sampleInput: 'main()',
    expectedOutput: 'Morning: 3 items, first 3\nEvening: 0 items, first -1\nTotal: 12',
    testCase: { call: '', expected: 'Morning: 3 items, first 3\nEvening: 0 items, first -1\nTotal: 12' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'evening', originalLiteral: 'null', alternateLiteral: 'listOf(6, 2)' }],
      alternateExpectedOutput: 'Morning: 3 items, first 3\nEvening: 2 items, first 6\nTotal: 20',
    },
  },
  {
    id: 'world-7-practice-writerun-stock-map',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Go through a map where a value can be null. Add up the known counts and count the unknown ones.',
    conceptTags: ['lesson:nullable-collections', 'lesson:null-checks', 'nullable-value', 'map-iteration', 'null-check', 'accumulator'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Stock Map',
    goal:
      'A stock map shows how many of each item are on the shelf, and null when an item was not counted. Print every entry. Add the known counts and count the items with an unknown count.',
    description:
      '1. **Loop over the map.** Use `for ((item, qty) in stock)`.\n\n' +
              '2. **Print each entry.** A `null` count prints `null`:\n"pen: 12"\n"ink: null"\n"pad: 5"\n\n' +
              '3. **Add up the counts.** When `qty` is not `null`, add it to `total`. If it is `null`, add `1` to `missing`.\n\n' +
              '4. **Print the totals.** After the loop:\n"In stock: 17"\n"Missing: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Loop over the map.** Use two loop variables.',
          '2. **Print each entry.**',
          '3. **Add up the counts.** Check `qty` for `null`.',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Loop over the map. Use two loop variables.',
          '// 2. Print each entry.',
          '// 3. Add up the counts. Check qty for null.',
          '// 4. Print the totals.',
        ],
      },
      experienced: {
        steps: [
          '1. **Loop over the map.**',
          '2. **Print each entry.**',
          '3. **Add up the counts.**',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Loop over the map.',
          '// 2. Print each entry.',
          '// 3. Add up the counts.',
          '// 4. Print the totals.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'StockMap.kt',
    initialCode: `fun main() {
  val stock: Map<String, Int?> = mapOf("pen" to 12, "ink" to null, "pad" to 5)
  var total = 0
  var missing = 0

  // 1. Loop over the map. Use for ((item, qty) in stock).

  // 2. Print each entry. A null count prints null: "pen: 12" "ink: null" "pad: 5"

  // 3. Add up the counts. When qty is not null, add it to total. If it is null, add 1 to missing.

  // 4. Print the totals. After the loop: "In stock: 17" "Missing: 1"
}`,
    solutionCode: `fun main() {
  val stock: Map<String, Int?> = mapOf("pen" to 12, "ink" to null, "pad" to 5)
  var total = 0
  var missing = 0

  for ((item, qty) in stock) {
    println("$item: $qty")
    if (qty != null) {
      total += qty
    } else {
      missing++
    }
  }
  println("In stock: $total")
  println("Missing: $missing")
}`,
    sampleInput: 'main()',
    expectedOutput: 'pen: 12\nink: null\npad: 5\nIn stock: 17\nMissing: 1',
    testCase: { call: '', expected: 'pen: 12\nink: null\npad: 5\nIn stock: 17\nMissing: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'stock', originalLiteral: 'mapOf("pen" to 12, "ink" to null, "pad" to 5)', alternateLiteral: 'mapOf("pen" to 0, "ink" to 9, "pad" to null)' }],
      alternateExpectedOutput: 'pen: 0\nink: 9\npad: null\nIn stock: 9\nMissing: 1',
    },
  },

  // ----------------------------------------------------------------- chaining
  {
    id: 'world-7-practice-writerun-reachable-emails',
    worldId: 'world-7',
    difficulty: 'medium',
    summary: 'Chain two lookups that can fail, and use one ?: for every failure.',
    conceptTags: ['lesson:chaining', 'lesson:elvis-operator', 'safe-chain', 'elvis', 'function-result', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 25,
    title: 'Reachable Emails',
    goal:
      'Finding a user can fail, and finding that user\'s email can also fail. Chain both lookups and get the email length. Use one -1 for every way the chain can fail.',
    description:
      '`findUser(id: Int): String?` and `emailOf(user: String?): String?` are in the starter code. Only user 1 (anna) has an email, "anna@x.org".\n\n' +
              '1. **Measure each email.** Loop over `ids`. Create `val length` as `emailOf(findUser(id))?.length ?: -1`.\n\n' +
              '2. **Print each result.** Print the id and the length:\n"1 -> 10"\n"2 -> -1"\n"3 -> -1"\n\n' +
              '3. **Count the reachable users.** Add `1` to `reachable` when `length >= 0`.\n\n' +
              '4. **Print the count.** After the loop:\n"Reachable: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Measure each email.** Use `?.length ?: -1`.',
          '2. **Print each result.**',
          '3. **Count the reachable users.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Measure each email. Use ?.length ?: -1.',
          '// 2. Print each result.',
          '// 3. Count the reachable users.',
          '// 4. Print the count.',
        ],
      },
      experienced: {
        steps: [
          '1. **Measure each email.**',
          '2. **Print each result.**',
          '3. **Count the reachable users.**',
          '4. **Print the count.**',
        ],
        comments: [
          '// 1. Measure each email.',
          '// 2. Print each result.',
          '// 3. Count the reachable users.',
          '// 4. Print the count.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'ReachableEmails.kt',
    initialCode: `fun findUser(id: Int): String? {
  if (id == 1) {
    return "anna"
  }
  if (id == 2) {
    return "bob"
  }
  return null
}

fun emailOf(user: String?): String? {
  if (user == null) {
    return null
  }
  if (user == "anna") {
    return "anna@x.org"
  }
  return null
}

fun main() {
  val ids = listOf(1, 2, 3)
  var reachable = 0

  // 1. Measure each email. Loop over ids. Create val length as emailOf(findUser(id))?.length ?: -1.

  // 2. Print each result. Print the id and the length: "1 -> 10" "2 -> -1" "3 -> -1"

  // 3. Count the reachable users. Add 1 to reachable when length >= 0.

  // 4. Print the count. After the loop: "Reachable: 1"
}`,
    solutionCode: `fun findUser(id: Int): String? {
  if (id == 1) {
    return "anna"
  }
  if (id == 2) {
    return "bob"
  }
  return null
}

fun emailOf(user: String?): String? {
  if (user == null) {
    return null
  }
  if (user == "anna") {
    return "anna@x.org"
  }
  return null
}

fun main() {
  val ids = listOf(1, 2, 3)
  var reachable = 0

  for (id in ids) {
    val length = emailOf(findUser(id))?.length ?: -1
    println("$id -> $length")
    if (length >= 0) {
      reachable++
    }
  }
  println("Reachable: $reachable")
}`,
    sampleInput: 'main()',
    expectedOutput: '1 -> 10\n2 -> -1\n3 -> -1\nReachable: 1',
    testCase: { call: '', expected: '1 -> 10\n2 -> -1\n3 -> -1\nReachable: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'ids', originalLiteral: 'listOf(1, 2, 3)', alternateLiteral: 'listOf(2, 1, 1)' }],
      alternateExpectedOutput: '2 -> -1\n1 -> 10\n1 -> 10\nReachable: 2',
    },
  },
  {
    id: 'world-7-practice-writerun-nickname-lengths',
    worldId: 'world-7',
    difficulty: 'hard',
    summary: 'Measure a trimmed nickname in one chain, but count missing and blank names separately.',
    conceptTags: ['lesson:chaining', 'lesson:nullable-collections', 'safe-chain', 'nullable-element', 'null-check', 'counter'],
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: 40,
    title: 'Nickname Lengths',
    goal:
      'Nicknames come from a form. They can be missing, have extra spaces or be empty. Find the length of each trimmed nickname with one safe chain. Count how many are missing (null) and how many are blank after trimming.',
    description:
      '1. **Trim each name.** Loop over `names` with the variable `name`. Create `val trimmed` as `name?.trim()`.\n\n' +
              '2. **Count the missing and blank names.** If `trimmed == null`, add `1` to `missing`. Otherwise, if `trimmed.isEmpty()`, add `1` to `blank`.\n\n' +
              '3. **Measure each name.** Create `val len` as `trimmed?.length ?: 0`. Add `len` to `sum` and print it:\n"4"\n"0"\n"2"\n"0"\n\n' +
              '4. **Print the totals.** After the loop:\n"Sum: 6"\n"Missing: 1"\n"Blank: 1"',
    levelHints: {
      intermediate: {
        steps: [
          '1. **Trim each name.** Use `?.trim()`.',
          '2. **Count the missing and blank names.** Check `null` first.',
          '3. **Measure each name.** Use `?.length ?: 0`.',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Trim each name. Use ?.trim().',
          '// 2. Count the missing and blank names. Check null first.',
          '// 3. Measure each name. Use ?.length ?: 0.',
          '// 4. Print the totals.',
        ],
      },
      experienced: {
        steps: [
          '1. **Trim each name.**',
          '2. **Count the missing and blank names.**',
          '3. **Measure each name.**',
          '4. **Print the totals.**',
        ],
        comments: [
          '// 1. Trim each name.',
          '// 2. Count the missing and blank names.',
          '// 3. Measure each name.',
          '// 4. Print the totals.',
        ],
      },
    },
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: 'NicknameLengths.kt',
    initialCode: `fun main() {
  val names: List<String?> = listOf("Asha", null, "  Bo  ", "")
  var sum = 0
  var missing = 0
  var blank = 0

  // 1. Trim each name. Loop over names with the variable name. Create val trimmed as name?.trim().

  // 2. Count the missing and blank names. If trimmed == null, add 1 to missing. Otherwise, if trimmed.isEmpty(), add 1 to blank.

  // 3. Measure each name. Create val len as trimmed?.length ?: 0. Add len to sum and print it: "4" "0" "2" "0"

  // 4. Print the totals. After the loop: "Sum: 6" "Missing: 1" "Blank: 1"
}`,
    solutionCode: `fun main() {
  val names: List<String?> = listOf("Asha", null, "  Bo  ", "")
  var sum = 0
  var missing = 0
  var blank = 0

  for (name in names) {
    val trimmed = name?.trim()
    if (trimmed == null) {
      missing++
    } else if (trimmed.isEmpty()) {
      blank++
    }
    val len = trimmed?.length ?: 0
    sum += len
    println(len)
  }
  println("Sum: $sum")
  println("Missing: $missing")
  println("Blank: $blank")
}`,
    sampleInput: 'main()',
    expectedOutput: '4\n0\n2\n0\nSum: 6\nMissing: 1\nBlank: 1',
    testCase: { call: '', expected: '4\n0\n2\n0\nSum: 6\nMissing: 1\nBlank: 1' },
    hardcodeCheck: {
      inputSwaps: [{ variableName: 'names', originalLiteral: 'listOf("Asha", null, "  Bo  ", "")', alternateLiteral: 'listOf(null, null, " Kim ", "Zed")' }],
      alternateExpectedOutput: '0\n0\n3\n3\nSum: 6\nMissing: 2\nBlank: 0',
    },
  },
];

export const WORLD_7_PRACTICE_DEBUG: PracticeDebugProblem[] = [
  // nullable types
  {
    id: 'world-7-practice-debug-missing-price',
    worldId: 'world-7',
    conceptTags: ['lesson:nullable-types', 'nullable-return', 'null-vs-zero'],
    summary: 'A function that should say "no price" returns 0, which looks like a real price of zero.',
    title: 'Fix the Missing Price',
    subtitle: 'The program should print "coffee: null" for an item with no price, but it prints "coffee: 0".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: 0 is used where null (no value) was meant',
    brokenCode: `fun findPrice(item: String): Int? {
  return if (item == "tea") 30 else 0
}

fun main() {
  println("tea: \${findPrice("tea")}")
  println("coffee: \${findPrice("coffee")}")
}`,
    fixedCode: `fun findPrice(item: String): Int? {
  return if (item == "tea") 30 else null
}

fun main() {
  println("tea: \${findPrice("tea")}")
  println("coffee: \${findPrice("coffee")}")
}`,
    expectedOutput: 'tea: 30\ncoffee: null',
    hints: [
              'The return type is `Int?`. What is that type for? Which value says "there is no price"?',
              'Look at what the function returns for an item it does not know. Is `0` the same as "no price"?',
              'Return the value that means "nothing" for an unknown item.',
            ],
    explanation:
      '`Int?` exists so a function can say "no value". Returning `0` for an unknown item makes up a price of zero, and the caller cannot tell it from a real free item. `null` is the value that means "nothing here", and the caller can check for it.',
  },

  // nullable variables
  {
    id: 'world-7-practice-debug-empty-session',
    worldId: 'world-7',
    conceptTags: ['lesson:nullable-variables', 'lesson:elvis-operator', 'null-vs-empty', 'reassignment'],
    summary: 'Logging out assigns an empty string instead of null, so the fallback never applies.',
    title: 'Fix the Logout',
    subtitle: 'After logout the program should print "After logout: none", but it prints "After logout: " with nothing after it.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: an empty String is not null',
    brokenCode: `fun main() {
  var session: String? = "abc123"
  println("Active: \${session ?: "none"}")
  session = ""
  println("After logout: \${session ?: "none"}")
}`,
    fixedCode: `fun main() {
  var session: String? = "abc123"
  println("Active: \${session ?: "none"}")
  session = null
  println("After logout: \${session ?: "none"}")
}`,
    expectedOutput: 'Active: abc123\nAfter logout: none',
    hints: [
              'The fallback after `?:` is used for only one value. Which one?',
              'Look at what logout puts in `session`. Is an empty String `""` the same as `null`?',
              'Set `session` to the value that means "no session".',
            ],
    explanation:
      '`?:` replaces only `null`. An empty String is a real value, so `session ?: "none"` keeps it and prints nothing. A nullable `var` that means "no session" must be set to `null`, not to empty text.',
  },

  // safe call
  {
    id: 'world-7-practice-debug-unsafe-trim',
    worldId: 'world-7',
    conceptTags: ['lesson:safe-call', 'unsafe-member-access', 'safe-chain'],
    summary: 'Calling trim() and length with plain dots on a String? does not compile.',
    title: 'Fix the Unsafe Access',
    subtitle: 'The program should print "Length: 2", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'null-safety',
    bugLabel: 'Null Safety: plain . on a nullable String?',
    brokenCode: `fun main() {
  val user: String? = "  bo  "
  println("Length: \${user.trim().length}")
}`,
    fixedCode: `fun main() {
  val user: String? = "  bo  "
  println("Length: \${user?.trim()?.length}")
}`,
    expectedOutput: 'Length: 2',
    hints: [
              'Read the compiler message. It says which kind of call is allowed here.',
              '`user` has the type `String?`, so it can be `null`. A plain `.` is not allowed on a value that can be `null`.',
              'Use the safe call on every step of the chain.',
            ],
    explanation:
      'Kotlin does not allow a plain `.` on a `String?`, because the value can be `null`. A safe call (`?.`) skips the call when the value is `null`. Its result can be `null` too, so the next step needs `?.` as well: `user?.trim()?.length`.',
  },

  // elvis
  {
    id: 'world-7-practice-debug-elvis-backwards',
    worldId: 'world-7',
    conceptTags: ['lesson:elvis-operator', 'elvis-order', 'default-value'],
    summary: 'The Elvis operator has the fallback on the left, so the real value is never used.',
    title: 'Fix the Backwards Fallback',
    subtitle: 'The nickname is "Zed", so the program should print "Shown: Zed", but it prints "Shown: Guest".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the fallback is on the wrong side of ?:',
    brokenCode: `fun main() {
  val nickname: String? = "Zed"
  val shown = "Guest" ?: nickname
  println("Shown: $shown")
}`,
    fixedCode: `fun main() {
  val nickname: String? = "Zed"
  val shown = nickname ?: "Guest"
  println("Shown: $shown")
}`,
    expectedOutput: 'Shown: Zed',
    hints: [
              '`?:` uses its left side whenever that side is not `null`. What is on the left here?',
              'The text "Guest" is never `null`, so the right side is never used. Which value can be `null`?',
              'Swap the two sides, so the value that can be missing is tested first.',
            ],
    explanation:
      '`a ?: b` means "use `a`, unless it is `null`, then use `b`". With "Guest" on the left, the left side is never `null`, so `nickname` is never looked at. The value that can be missing goes on the left. The default goes on the right.',
  },

  // non-null assertion
  {
    id: 'world-7-practice-debug-risky-assertion',
    worldId: 'world-7',
    conceptTags: ['lesson:non-null-assertion', 'lesson:elvis-operator', 'runtime-error', 'risky-assertion'],
    summary: '!! on a lookup that returns null crashes the program; a ?: fallback keeps it running.',
    title: 'Fix the Risky Assertion',
    subtitle: 'The second lookup should print "UNKNOWN", but the program crashes with a NullPointerException.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'runtime',
    bugLabel: 'Runtime Error: !! on a value that is null',
    brokenCode: `fun findUser(id: Int): String? {
  return if (id == 1) "admin" else null
}

fun main() {
  println(findUser(1)!!.uppercase())
  println(findUser(2)!!.uppercase())
}`,
    fixedCode: `fun findUser(id: Int): String? {
  return if (id == 1) "admin" else null
}

fun main() {
  println(findUser(1)!!.uppercase())
  println(findUser(2)?.uppercase() ?: "UNKNOWN")
}`,
    expectedOutput: 'ADMIN\nUNKNOWN',
    hints: [
              'Run the program and read the error. It names the operator that failed.',
              '`findUser(2)` returns `null`. What does `!!` do when its value is `null`?',
              'For a value that can really be `null`, use a safe call with a default instead of `!!`.',
            ],
    explanation:
      '`!!` tells Kotlin "I promise this is not null", and it crashes if the promise is wrong. `findUser(2)` is `null`, so the second line crashes. Use `!!` only for values that must exist. For a value that can be missing, use a safe call and a default: `findUser(2)?.uppercase() ?: "UNKNOWN"`.',
  },

  // null checks
  {
    id: 'world-7-practice-debug-swapped-branches',
    worldId: 'world-7',
    conceptTags: ['lesson:null-checks', 'swapped-branches', 'null-check'],
    summary: 'The branches of a null check are swapped: a real score reports "no score" and null reports a score.',
    title: 'Fix the Swapped Branches',
    subtitle: '`label(80)` should print "score 80" and `label(null)` should print "no score", but both lines are wrong.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: the != null branches are swapped',
    brokenCode: `fun label(score: Int?): String {
  return if (score != null) "no score" else "score " + score
}

fun main() {
  println(label(80))
  println(label(null))
}`,
    fixedCode: `fun label(score: Int?): String {
  return if (score != null) "score $score" else "no score"
}

fun main() {
  println(label(80))
  println(label(null))
}`,
    expectedOutput: 'score 80\nno score',
    hints: [
              'Say the condition out loud: "if score is not null...". What should the result be then?',
              'Compare each output with what each branch returns. Which branch runs for 80?',
              'Put the text for a real score in the `!= null` branch, and "no score" in the `else` branch.',
            ],
    explanation:
      'The branch after `if (score != null)` runs when there IS a value, so it must describe the score. The `else` branch runs when the value is missing. The swapped version printed "no score" for 80 and "score null" for the missing value.',
  },

  // smart casts
  {
    id: 'world-7-practice-debug-missing-guard',
    worldId: 'world-7',
    conceptTags: ['lesson:smart-casts', 'lesson:null-checks', 'missing-guard', 'unsafe-member-access'],
    summary: 'Calling uppercase() on a String? parameter without checking for null does not compile.',
    title: 'Fix the Missing Guard',
    subtitle: '`shout("hi")` should print "HI" and `shout(null)` should print "(none)", but the program does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'null-safety',
    bugLabel: 'Null Safety: member access on a String? with no null check',
    brokenCode: `fun shout(text: String?): String {
  return text.uppercase()
}

fun main() {
  println(shout("hi"))
  println(shout(null))
}`,
    fixedCode: `fun shout(text: String?): String {
  if (text == null) {
    return "(none)"
  }
  return text.uppercase()
}

fun main() {
  println(shout("hi"))
  println(shout(null))
}`,
    expectedOutput: 'HI\n(none)',
    hints: [
              'Read the compiler message. What does it say about the type of `text`?',
              '`text` is `String?`, so Kotlin does not allow `uppercase()` on it. How can you show Kotlin that it is not `null`?',
              'Check for `null` first and return "(none)" early. After the check, `text` is a plain `String`.',
            ],
    explanation:
      'After `if (text == null) { return ... }`, Kotlin knows `text` cannot be `null` in the rest of the function, so a plain `text.uppercase()` is allowed. Without the check, the compiler rejects the call because the value can be `null`.',
  },

  // safe casts
  {
    id: 'world-7-practice-debug-wrong-cast-target',
    worldId: 'world-7',
    conceptTags: ['lesson:safe-casts', 'lesson:elvis-operator', 'wrong-target-type', 'safe-cast'],
    summary: 'The value is a String but is cast to Int, so as? quietly gives null.',
    title: 'Fix the Cast Target',
    subtitle: 'The value holds the text "42", so the program should print "Text: 42", but it prints "Text: not text".',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'logic',
    bugLabel: 'Logic Error: as? asks for the wrong type',
    brokenCode: `fun main() {
  val value: Any = "42"
  val text = value as? Int
  println("Text: \${text ?: "not text"}")
}`,
    fixedCode: `fun main() {
  val value: Any = "42"
  val text = value as? String
  println("Text: \${text ?: "not text"}")
}`,
    expectedOutput: 'Text: 42',
    hints: [
              '`as?` gives `null` when the value is not the type you asked for. Which type does `value` really hold?',
              'The value is "42" in quotes. Which target type matches it?',
              'Change the target type of the cast to match the value.',
            ],
    explanation:
      '`as?` never crashes. A cast to the wrong type just gives `null`, which then uses the `?:` default and hides the mistake. The value is a `String`, so the target must be `String`.',
  },

  // nullable collections
  {
    id: 'world-7-practice-debug-null-list-size',
    worldId: 'world-7',
    conceptTags: ['lesson:nullable-collections', 'lesson:safe-call', 'nullable-list', 'unsafe-member-access'],
    summary: 'Reading .size on a List<Int>? with a plain dot does not compile.',
    title: 'Fix the Missing List',
    subtitle: 'With a missing list, the program should print "Count: 0", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'null-safety',
    bugLabel: 'Null Safety: plain . on a nullable list',
    brokenCode: `fun main() {
  val scores: List<Int>? = null
  println("Count: \${scores.size}")
}`,
    fixedCode: `fun main() {
  val scores: List<Int>? = null
  println("Count: \${scores?.size ?: 0}")
}`,
    expectedOutput: 'Count: 0',
    hints: [
              'Look at the type of `scores`. This time the `?` is not on the items.',
              'The whole list can be `null`, so even `.size` needs a safe call.',
              'Use a safe call for the size, and give the missing case a default.',
            ],
    explanation:
      '`List<Int>?` means the list itself can be `null`, so reading `.size` needs `?.`. The result is `Int?`, and `?: 0` gives the count to show when the list is missing.',
  },
  {
    id: 'world-7-practice-debug-null-score-total',
    worldId: 'world-7',
    conceptTags: ['lesson:nullable-collections', 'lesson:null-checks', 'nullable-element', 'unchecked-arithmetic'],
    summary: 'Adding every element of a List<Int?> to a total without a null check does not compile.',
    title: 'Fix the Score Total',
    subtitle: 'The program should print "Total: 10" and skip the missing score, but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'hard',
    bugType: 'null-safety',
    bugLabel: 'Null Safety: adding a possibly-null Int',
    brokenCode: `fun main() {
  val scores: List<Int?> = listOf(4, null, 6)
  var total = 0
  for (score in scores) {
    total += score
  }
  println("Total: $total")
}`,
    fixedCode: `fun main() {
  val scores: List<Int?> = listOf(4, null, 6)
  var total = 0
  for (score in scores) {
    if (score != null) {
      total += score
    }
  }
  println("Total: $total")
}`,
    expectedOutput: 'Total: 10',
    hints: [
              'Look at the type of the list items. What does the `?` after `Int` allow?',
              '`score` can be `null`, and `null` cannot be added to an `Int`. What must you know before you add it?',
              'Add the score only when you know it is not `null`.',
            ],
    explanation:
      '`List<Int?>` can hold `null`, so the loop variable is `Int?`, and an `Int?` cannot be added to an `Int`. A check `if (score != null)` makes the value a plain `Int` inside the branch, and the missing entries are skipped.',
  },

  // chaining
  {
    id: 'world-7-practice-debug-broken-chain',
    worldId: 'world-7',
    conceptTags: ['lesson:chaining', 'lesson:safe-call', 'safe-chain', 'missing-safe-call'],
    summary: 'A chain starts with ?. but continues with a plain dot, which Kotlin rejects.',
    title: 'Fix the Broken Chain',
    subtitle: 'The program should print "City: Pune", but it does not compile.',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: 'medium',
    bugType: 'null-safety',
    bugLabel: 'Null Safety: a plain . after a ?. link',
    brokenCode: `class Address(val city: String?)
class User(val address: Address?)

fun main() {
  val user: User? = User(Address("Pune"))
  println("City: \${user?.address.city}")
}`,
    fixedCode: `class Address(val city: String?)
class User(val address: Address?)

fun main() {
  val user: User? = User(Address("Pune"))
  println("City: \${user?.address?.city}")
}`,
    expectedOutput: 'City: Pune',
    hints: [
              'Read the compiler message and find which part of the chain it complains about.',
              '`user?.address` can be `null` too, because `address` is `Address?`. Is a plain `.` allowed after it?',
              'Every part of the chain that can be `null` needs the safe call.',
            ],
    explanation:
      'A safe call makes its result nullable. `user?.address` has the type `Address?`, so the next step needs `?.` too. A plain `.` there means "I know this is not null", and Kotlin cannot check that. Every part of a chain that can be `null` needs its own `?.`: `user?.address?.city`.',
  },
];
