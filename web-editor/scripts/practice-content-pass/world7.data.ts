/**
 * World 7 (Null Safety Shield) practice-bank wording pass. Format: see world2.data.ts and PRACTICE_CONTENT_PASS.md.
 * Written in simple English: short everyday words, one idea per sentence.
 */
import type { WR, DBG } from './world2.data';

export const WR_DATA: Record<string, WR> = {
  'contact-card': {
    summary: 'Print fields that can be missing, then count how many are filled in.',
    goal: 'A contact always has a name. The phone and the email can be missing. Print all three fields, then say how many of them have a value.',
    steps: [
      '**Print the three fields.** Use string templates, one line per field. A missing `String?` prints the word `null`:\n"Name: Ravi"\n"Phone: null"\n"Email: ravi@mail.com"',
      '**Count the filled fields.** Create `var filled = 1`, because the name always counts. Add `1` for the phone and for the email when it is not `null`. Use `if (x != null)`.',
      '**Print the count.** Use a string template:\n"Filled: 2 of 3"',
    ],
    i: ['**Print the three fields.** Use string templates.', '**Count the filled fields.** Check each one with `!= null`.', '**Print the count.**'],
    e: ['**Print the three fields.**', '**Count the filled fields.**', '**Print the count.**'],
  },
  'discount-codes': {
    summary: 'Write a function that returns a number or null, then add up only the codes that have a value.',
    goal: 'A shop knows two discount codes. Write a function that can answer "no discount". Print the value of each code, then add up only the codes the shop knows.',
    steps: [
      '**Write the function.** Above `main`, write `fun findDiscount(code: String): Int?`. It returns `10` for "SAVE10", `25` for "SAVE25" and `null` for any other code. Do not return `0`, because an unknown code has no discount at all.',
      '**Print each code.** Loop over `codes`. Keep `findDiscount(code)` in `val discount`. Print one line for each code. An unknown code prints `null`:\n"SAVE10 -> 10"\n"WELCOME -> null"\n"SAVE25 -> 25"',
      '**Add up the discounts.** Inside the loop, add `discount` to `saved`, but only when it is not `null`.',
      '**Print the total.** After the loop:\n"Total discount: 35"',
    ],
    i: ['**Write the function.** Return `Int?`, with `null` for an unknown code.', '**Print each code.** Keep the result in `discount`.', '**Add up the discounts.** Skip `null`.', '**Print the total.**'],
    e: ['**Write the function.**', '**Print each code.**', '**Add up the discounts.**', '**Print the total.**'],
  },
  'session-token': {
    summary: 'Change a nullable variable from null to a value and back, and print it safely each time.',
    goal: 'A login token starts empty, gets a value at login and is cleared at logout. Print the token at each stage and count how many times it changed.',
    steps: [
      '**Print the start.** Use a string template:\n"Start: null"',
      '**Log in.** Set `token` to "abc123" and add `1` to `changes`. Print the token and its length. Use `token?.length` for the length:\n"Logged in: abc123 (6 chars)"',
      '**Log out.** Set `token` to `null` and add `1` to `changes`. Print the token:\n"Logged out: null"',
      '**Print the changes.**\n"Changes: 2"',
    ],
    i: ['**Print the start.**', '**Log in.** Use `token?.length`.', '**Log out.** Set the token to `null`.', '**Print the changes.**'],
    e: ['**Print the start.**', '**Log in.**', '**Log out.**', '**Print the changes.**'],
  },
  'login-events': {
    summary: 'Go through a list of login and logout events and keep track of who is signed in.',
    goal: 'A log has events like "login:ana" and "logout". Go through them in order with one nullable variable that holds who is signed in. Print the state after each event, then the number of sessions and who is still signed in.',
    steps: [
      '**Handle a logout.** Loop over `events`. When the event is "logout", set `current` to `null`.',
      '**Handle a login.** Any other event is "login:" and a name. Set `current` to `event.substring(6)` and add `1` to `sessions`.',
      '**Print the state.** After each event, print the event and who is signed in. Show "nobody" when `current` is `null`. Use `?:`:\n"login:ana -> ana"\n"logout -> nobody"\n"login:ben -> ben"\n"logout -> nobody"\n"login:cy -> cy"',
      '**Print the totals.** After the loop:\n"Sessions: 3"\n"Active: cy"',
    ],
    i: ['**Handle a logout.** Set `current` to `null`.', '**Handle a login.** Use `substring(6)` and count the session.', '**Print the state.** Use `?:` for "nobody".', '**Print the totals.**'],
    e: ['**Handle a logout.**', '**Handle a login.**', '**Print the state.**', '**Print the totals.**'],
  },
  'lookup-lengths': {
    summary: 'Read lengths with a safe call. A missing value gives null instead of a crash.',
    goal: 'Three profile fields can be missing. Read each one with a safe call, so a missing field gives `null` and not a crash. Also see what a chain of safe calls does to padded text.',
    steps: [
      '**Print the city length.** Use `city?.length` in a string template:\n"City length: 6"',
      '**Print the note length.** Do the same for `note`. It is `null`, so the result is `null`:\n"Note length: null"',
      '**Print the clean tag.** Remove the spaces and make the letters capital with `tag?.trim()?.uppercase()`:\n"Tag: KOTLIN"',
      '**Print the tag length.** Use `tag?.trim()?.length`:\n"Tag length: 6"',
    ],
    i: ['**Print the city length.** Use `?.length`.', '**Print the note length.** Use `?.length`.', '**Print the clean tag.** Chain `?.trim()` and `?.uppercase()`.', '**Print the tag length.** Chain `?.trim()` and `?.length`.'],
    e: ['**Print the city length.**', '**Print the note length.**', '**Print the clean tag.**', '**Print the tag length.**'],
  },
  'customer-addresses': {
    summary: 'Read a city and a zip code when the address, or its city, can be missing.',
    goal: 'A customer can have no address, or an address with no city. Read the city and the zip code of each customer with safe calls, print what you find, and count the customers with a known city.',
    setup: 'The classes and the customers are in the starter code. Ben has an address with no city. Cara has no address at all.',
    steps: [
      '**Read the city and the zip.** Loop over `customers`. Create `val city = customer.address?.city` and `val zip = customer.address?.zip`.',
      '**Print each customer.** Use string templates. A missing value prints `null`:\n"Asha: city=Pune zip=411001"\n"Ben: city=null zip=100001"\n"Cara: city=null zip=null"',
      '**Count the known cities.** Add `1` to `known` when `city` is not `null`.',
      '**Print the count.** After the loop:\n"Known cities: 1"',
    ],
    i: ['**Read the city and the zip.** Use `address?.city` and `address?.zip`.', '**Print each customer.** Use string templates.', '**Count the known cities.**', '**Print the count.**'],
    e: ['**Read the city and the zip.**', '**Print each customer.**', '**Count the known cities.**', '**Print the count.**'],
  },
  'display-name': {
    summary: 'Use ?: to give a default when a value is missing.',
    goal: 'A profile card must always show something. Use a default for every missing field, and show the bio length as `0` when there is no bio.',
    steps: [
      '**Choose the name to show.** Create `val shown` as `nickname ?: fullName`. Print it:\n"Shown: Mira Shah"',
      '**Print the bio.** Use `bio ?: "No bio"`:\n"Bio: Loves Kotlin"',
      '**Print the city.** Use `city ?: "Unknown"`:\n"City: Unknown"',
      '**Print the bio length.** Create `val bioLength` as `bio?.length ?: 0`. Print it:\n"Bio length: 12"',
    ],
    i: ['**Choose the name to show.** Use `?:`.', '**Print the bio.** Use `?:` with "No bio".', '**Print the city.** Use `?:` with "Unknown".', '**Print the bio length.** Combine `?.` and `?:`.'],
    e: ['**Choose the name to show.**', '**Print the bio.**', '**Print the city.**', '**Print the bio length.**'],
  },
  'lazy-fallback': {
    summary: 'The right side of ?: runs only when the left side is null. Count how often it runs.',
    goal: 'Making the default value costs a lot, so it must run only when a value is really missing. Use `?:` on four values, then say how many times the default was made.',
    setup: 'Each time `expensiveDefault()` runs, it adds `1` to `lookups` and returns "DEFAULT". The values `a`, `b`, `c` and `d` are in the starter code. `b` and `d` are `null`.',
    steps: [
      '**Print the four values.** For each of `a`, `b`, `c` and `d`, print the value, or `expensiveDefault()` when it is `null`. Write the call right after `?:`, so it runs only when needed:\n"cached"\n"DEFAULT"\n"warm"\n"DEFAULT"',
      '**Print the count.** Say how many times the default was made:\n"Computed defaults: 2"',
    ],
    i: ['**Print the four values.** Put `expensiveDefault()` after `?:`.', '**Print the count.** Read `lookups`.'],
    e: ['**Print the four values.**', '**Print the count.**'],
  },
  'confirmed-username': {
    summary: 'Use !! for a value that must exist, and keep a value that can be null on the safe path.',
    goal: 'The stored username comes from code that makes sure it exists, so `!!` is fair there. The guess from a user can be missing, so keep it safe. Then add the two lengths.',
    steps: [
      '**Assert the stored name.** Create `val username` as `stored!!`. Print its length and its capital letters:\n"Stored length: 8"\n"Stored upper: ADMIN_01"',
      '**Read the guess safely.** `guess` can be `null`, so do not use `!!`. Print its length with `?.length ?: 0`:\n"Guess length: 0"',
      '**Add the lengths.** Create `val total`: `username.length` plus the guess length (`0` when it is `null`). Print it:\n"Total: 8"',
    ],
    i: ['**Assert the stored name.** Use `!!`.', '**Read the guess safely.** Use `?.length ?: 0`.', '**Add the lengths.**'],
    e: ['**Assert the stored name.**', '**Read the guess safely.**', '**Add the lengths.**'],
  },
  'load-config': {
    summary: 'Use !! for settings that must exist, and ?: for a setting that can be missing.',
    goal: 'A settings lookup can return `null` for any key. The host and the port are required, so you may use `!!`. The timeout is optional, so give it a default.',
    setup: '`loadSetting(key: String): String?` is in the starter code. It knows "host" (db.local), "user" (svc) and "port" (5432). It returns `null` for any other key.',
    steps: [
      '**Read the host.** Create `val host` as `loadSetting(hostKey)!!`. It is required, so assert it.',
      '**Read the port.** Create `val port` as `loadSetting("port")!!.toInt()`.',
      '**Read the timeout.** It is optional. Create `val timeout` as `loadSetting("timeout") ?: "30"`.',
      '**Print three lines.** The next port is the port plus `1`:\n"Host: db.local"\n"Next port: 5433"\n"Timeout: 30"',
    ],
    i: ['**Read the host.** Assert it with `!!`.', '**Read the port.** Assert it, then convert it.', '**Read the timeout.** Give it a default with `?:`.', '**Print three lines.**'],
    e: ['**Read the host.**', '**Read the port.**', '**Read the timeout.**', '**Print three lines.**'],
  },
  'age-report': {
    summary: 'Write a function that checks for null first, then sort ages into adult, minor and unknown.',
    goal: 'Ages come from a form, so any of them can be missing. Name each age as adult, minor or unknown. Print the age and its name, and count the adults.',
    steps: [
      '**Write the function.** Above `main`, write `fun describe(age: Int?): String`. Check for `null` first and return "unknown". Then return "adult" when `age >= 18`, and "minor" if not.',
      '**Print each age.** Loop over `listOf(age1, age2, age3)`. Keep `describe(age)` in `val label`. Print the age and the label. A missing age prints `null`:\n"34: adult"\n"null: unknown"\n"17: minor"',
      '**Count the adults.** Add `1` to `adults` when `label` is "adult".',
      '**Print the count.** After the loop:\n"Adults: 1"',
    ],
    i: ['**Write the function.** Check `null` first.', '**Print each age.** Keep the result in `label`.', '**Count the adults.**', '**Print the count.**'],
    e: ['**Write the function.**', '**Print each age.**', '**Count the adults.**', '**Print the count.**'],
  },
  'pin-checker': {
    summary: 'Write two functions that use && and || so a missing PIN is never read.',
    goal: 'A PIN is valid when it exists and has exactly 4 characters. It needs a reset when it is missing or shorter than 4. Write both rules without ever reading the length of a missing PIN. Print each PIN and count the valid ones.',
    steps: [
      '**Write the valid check.** Above `main`, write `fun isValidPin(pin: String?): Boolean`. It is `true` when `pin != null && pin.length == 4`.',
      '**Write the reset check.** Write `fun needsReset(pin: String?): Boolean`. It is `true` when `pin == null || pin.length < 4`.',
      '**Print each PIN.** Loop over `listOf(p1, p2, p3)`. Print the PIN with both answers. A missing PIN prints `null`:\n"1234 -> valid=true reset=false"\n"null -> valid=false reset=true"\n"98 -> valid=false reset=true"',
      '**Count the valid PINs.** Keep the count in `var valid`. After the loop:\n"Valid: 1"',
    ],
    i: ['**Write the valid check.** Use `&&`.', '**Write the reset check.** Use `||`.', '**Print each PIN.** Print both answers.', '**Count the valid PINs.**'],
    e: ['**Write the valid check.**', '**Write the reset check.**', '**Print each PIN.**', '**Count the valid PINs.**'],
  },
  'bio-lengths': {
    summary: 'After a null check, use plain dots inside the branch, and add up only the real values.',
    goal: 'Two profile texts can be missing. Inside a null check, Kotlin knows the text is real, so you can use plain dots. Print a line for each text and add up the lengths of the texts that exist.',
    steps: [
      '**Check each text.** Loop over `listOf(headline, summary)` with the variable `text`. Use `if (text != null)`.',
      '**Use the text.** Inside the check, use plain `text.length` and `text.uppercase()`, with no `?.`. Print the length and the capital letters, and add the length to `totalChars`:\n"10 chars: KOTLIN DEV"',
      '**Handle the missing text.** In the `else` branch, print:\n"none"',
      '**Print the total.** After the loop:\n"Total: 10"',
    ],
    i: ['**Check each text.** Use `!= null`.', '**Use the text.** Use plain dots inside the check.', '**Handle the missing text.** Use `else`.', '**Print the total.**'],
    e: ['**Check each text.**', '**Use the text.**', '**Handle the missing text.**', '**Print the total.**'],
  },
  'user-emails': {
    summary: 'Check a property for null, then use it directly inside the check.',
    goal: 'Some users have no email. Check the `email` property for `null`. Inside the check you can use it directly, because the property is a `val`. Print the email length or a "no email" message, and count the users with an email.',
    setup: 'The class and the three users are in the starter code. The property `email` is a `val` of type `String?`. User C has the email cc@y.org, which is 8 characters.',
    steps: [
      '**Check each email.** Loop over `users`. Use `if (user.email != null)`.',
      '**Print the length.** Inside the check, use plain `user.email.length`, with no `?.`. Add `1` to `withEmail`:\n"A: 7 chars"',
      '**Handle the missing email.** In the `else` branch, print the name and "no email":\n"B: no email"',
      '**Print the count.** After the loop. The three lines are "A: 7 chars", "B: no email" and "C: 8 chars". Then:\n"With email: 2"',
    ],
    i: ['**Check each email.** Use `!= null`.', '**Print the length.** Use plain dots inside the check.', '**Handle the missing email.** Use `else`.', '**Print the count.**'],
    e: ['**Check each email.**', '**Print the length.**', '**Handle the missing email.**', '**Print the count.**'],
  },
  'mixed-inbox': {
    summary: 'Try a value as a String and as an Int with as?. A wrong type gives null, not a crash.',
    goal: 'Three values come as type `Any`. Ask for each one as the type you hope it is, with `as?`. A cast to the wrong type must give `null`, not a crash.',
    steps: [
      '**Cast the first value to text.** Create `val firstText` as `first as? String`. Print its length with `?.length`:\n"First length: 5"',
      '**Cast the number to text.** Create `val secondText` as `second as? String`. Print it. 42 is not a String, so the result is `null`:\n"Second as text: null"',
      '**Cast the number to a number.** Create `val secondNumber` as `second as? Int`. Print it:\n"Second as number: 42"',
      '**Use a default.** Print `third as? Int` with `-1` when the cast fails. Put the cast in brackets before `?:`:\n"Third as number: -1"',
    ],
    i: ['**Cast the first value to text.** Use `as? String`.', '**Cast the number to text.** Expect `null`.', '**Cast the number to a number.** Use `as? Int`.', '**Use a default.** Use brackets and `?:`.'],
    e: ['**Cast the first value to text.**', '**Cast the number to text.**', '**Cast the number to a number.**', '**Use a default.**'],
  },
  'text-lengths': {
    summary: 'Write a function that measures only text, then add up the real text lengths.',
    goal: 'A list holds values of different types. Write a function that gives the length of a value only when it is text, and `-1` if not. Print the result for each value and add up the text lengths.',
    steps: [
      '**Write the function.** Above `main`, write `fun textLength(value: Any): Int`. Write it as one expression: `(value as? String)?.length ?: -1`.',
      '**Print each length.** Loop over `listOf(a, b, c)`. Keep `textLength(item)` in `val len` and print it:\n"5"\n"-1"\n"2"',
      '**Add up the text lengths.** Add `len` to `total` only when `len >= 0`.',
      '**Print the total.** After the loop:\n"Text total: 7"',
    ],
    i: ['**Write the function.** Use `as?`, `?.length` and `?:`.', '**Print each length.** Keep the result in `len`.', '**Add up the text lengths.** Skip `-1`.', '**Print the total.**'],
    e: ['**Write the function.**', '**Print each length.**', '**Add up the text lengths.**', '**Print the total.**'],
  },
  'survey-answers': {
    summary: 'Go through a list that can hold null. Count the answers and the gaps, then find the average.',
    goal: 'A survey stores a score from 1 to 5 for each question, and `null` when the person skipped it. Count the answered and the skipped questions, add up the real scores, and find the average of the answered ones.',
    steps: [
      '**Check each answer.** Loop over `answers` with the variable `answer`. Use `if (answer != null)`.',
      '**Count the answers.** When it is not `null`, add `1` to `answered` and add `answer` to `total`. If it is `null`, add `1` to `missing`.',
      '**Print the counts.**\n"Answered: 3"\n"Missing: 2"\n"Total: 12"',
      '**Print the average.** Divide `total` by `answered`. Both are whole numbers:\n"Average: 4"',
    ],
    i: ['**Check each answer.** Use `!= null`.', '**Count the answers.** Count the answered and the missing ones.', '**Print the counts.**', '**Print the average.**'],
    e: ['**Check each answer.**', '**Count the answers.**', '**Print the counts.**', '**Print the average.**'],
  },
  'shift-lists': {
    summary: 'The whole list can be null. Read its size, first item and sum with a default for each.',
    goal: 'The morning shift list exists, but the evening shift list was never made, so it is `null`. Print the size and the first entry of each list, and the total hours. Give every missing part a default.',
    steps: [
      '**Print the morning list.** Use `morning?.size ?: 0` and `morning?.first() ?: -1`:\n"Morning: 3 items, first 3"',
      '**Print the evening list.** Do the same for `evening`. The whole list is `null`, so both defaults are used:\n"Evening: 0 items, first -1"',
      '**Print the total.** Create `val total` as `(morning?.sum() ?: 0) + (evening?.sum() ?: 0)`. Print it:\n"Total: 12"',
    ],
    i: ['**Print the morning list.** Use `?.size` and `?.first()` with `?:`.', '**Print the evening list.** Do the same.', '**Print the total.** Use `?.sum()` with `?:`.'],
    e: ['**Print the morning list.**', '**Print the evening list.**', '**Print the total.**'],
  },
  'stock-map': {
    summary: 'Go through a map where a value can be null. Add up the known counts and count the unknown ones.',
    goal: 'A stock map shows how many of each item are on the shelf, and `null` when nobody counted. Print every entry, add up the known counts, and count the items with an unknown count.',
    steps: [
      '**Loop over the map.** Use `for ((item, qty) in stock)`.',
      '**Print each entry.** A `null` count prints `null`:\n"pen: 12"\n"ink: null"\n"pad: 5"',
      '**Add up the counts.** When `qty` is not `null`, add it to `total`. If it is `null`, add `1` to `missing`.',
      '**Print the totals.** After the loop:\n"In stock: 17"\n"Missing: 1"',
    ],
    i: ['**Loop over the map.** Use two loop variables.', '**Print each entry.**', '**Add up the counts.** Check `qty` for `null`.', '**Print the totals.**'],
    e: ['**Loop over the map.**', '**Print each entry.**', '**Add up the counts.**', '**Print the totals.**'],
  },
  'reachable-emails': {
    summary: 'Chain two lookups that can fail, and use one ?: for every failure.',
    goal: 'Finding a user can fail, and finding that user\'s email can fail too. Chain both lookups, take the length of the email, and use one `-1` for every way the chain can fail.',
    setup: '`findUser(id: Int): String?` and `emailOf(user: String?): String?` are in the starter code. Only user 1 (anna) has an email, "anna@x.org".',
    steps: [
      '**Measure each email.** Loop over `ids`. Create `val length` as `emailOf(findUser(id))?.length ?: -1`.',
      '**Print each result.** Print the id and the length:\n"1 -> 10"\n"2 -> -1"\n"3 -> -1"',
      '**Count the reachable users.** Add `1` to `reachable` when `length >= 0`.',
      '**Print the count.** After the loop:\n"Reachable: 1"',
    ],
    i: ['**Measure each email.** Use `?.length ?: -1`.', '**Print each result.**', '**Count the reachable users.**', '**Print the count.**'],
    e: ['**Measure each email.**', '**Print each result.**', '**Count the reachable users.**', '**Print the count.**'],
  },
  'nickname-lengths': {
    summary: 'Measure a trimmed nickname in one chain, but count missing and blank names separately.',
    goal: 'Nicknames come from a form. They can be missing, have extra spaces, or be empty. Measure each trimmed nickname with one safe chain. Also count how many are missing (`null`) and how many are blank after trimming.',
    steps: [
      '**Trim each name.** Loop over `names` with the variable `name`. Create `val trimmed` as `name?.trim()`.',
      '**Count the missing and blank names.** If `trimmed == null`, add `1` to `missing`. Otherwise, if `trimmed.isEmpty()`, add `1` to `blank`.',
      '**Measure each name.** Create `val len` as `trimmed?.length ?: 0`. Add `len` to `sum` and print it:\n"4"\n"0"\n"2"\n"0"',
      '**Print the totals.** After the loop:\n"Sum: 6"\n"Missing: 1"\n"Blank: 1"',
    ],
    i: ['**Trim each name.** Use `?.trim()`.', '**Count the missing and blank names.** Check `null` first.', '**Measure each name.** Use `?.length ?: 0`.', '**Print the totals.**'],
    e: ['**Trim each name.**', '**Count the missing and blank names.**', '**Measure each name.**', '**Print the totals.**'],
  },
};

export const DBG_DATA: Record<string, DBG> = {
  'missing-price': {
    subtitle: 'The program should print "coffee: null" for an item with no price, but it prints "coffee: 0".',
    hints: ['The return type is `Int?`. What is that type for? Which value says "there is no price"?', 'Look at what the function returns for an item it does not know. Is `0` the same as "no price"?', 'Return the value that means "nothing" for an unknown item.'],
    explanation: '`Int?` exists so a function can say "no value". Returning `0` for an unknown item makes up a price of zero, and the caller cannot tell it from a real free item. `null` is the value that means "nothing here", and the caller can check for it.',
  },
  'empty-session': {
    subtitle: 'After logout the program should print "After logout: none", but it prints "After logout: " with nothing after it.',
    hints: ['The fallback after `?:` is used for only one value. Which one?', 'Look at what logout puts in `session`. Is an empty String `""` the same as `null`?', 'Set `session` to the value that means "no session".'],
    explanation: '`?:` replaces only `null`. An empty String is a real value, so `session ?: "none"` keeps it and prints nothing. A nullable `var` that means "no session" must be set to `null`, not to empty text.',
  },
  'unsafe-trim': {
    subtitle: 'The program should print "Length: 2", but it does not compile.',
    hints: ['Read the compiler message. It says which kind of call is allowed here.', '`user` has the type `String?`, so it can be `null`. A plain `.` is not allowed on a value that can be `null`.', 'Use the safe call on every step of the chain.'],
    explanation: 'Kotlin does not allow a plain `.` on a `String?`, because the value can be `null`. A safe call (`?.`) skips the call when the value is `null`. Its result can be `null` too, so the next step needs `?.` as well: `user?.trim()?.length`.',
  },
  'elvis-backwards': {
    subtitle: 'The nickname is "Zed", so the program should print "Shown: Zed", but it prints "Shown: Guest".',
    hints: ['`?:` uses its left side whenever that side is not `null`. What is on the left here?', 'The text "Guest" is never `null`, so the right side is never used. Which value can be `null`?', 'Swap the two sides, so the value that can be missing is tested first.'],
    explanation: '`a ?: b` means "use `a`, unless it is `null`, then use `b`". With "Guest" on the left, the left side is never `null`, so `nickname` is never looked at. The value that can be missing goes on the left. The default goes on the right.',
  },
  'risky-assertion': {
    subtitle: 'The second lookup should print "UNKNOWN", but the program crashes with a NullPointerException.',
    hints: ['Run the program and read the error. It names the operator that failed.', '`findUser(2)` returns `null`. What does `!!` do when its value is `null`?', 'For a value that can really be `null`, use a safe call with a default instead of `!!`.'],
    explanation: '`!!` tells Kotlin "I promise this is not null", and it crashes if the promise is wrong. `findUser(2)` is `null`, so the second line crashes. Use `!!` only for values that must exist. For a value that can be missing, use a safe call and a default: `findUser(2)?.uppercase() ?: "UNKNOWN"`.',
  },
  'swapped-branches': {
    subtitle: '`label(80)` should print "score 80" and `label(null)` should print "no score", but both lines are wrong.',
    hints: ['Say the condition out loud: "if score is not null...". What should the result be then?', 'Compare each output with what each branch returns. Which branch runs for 80?', 'Put the text for a real score in the `!= null` branch, and "no score" in the `else` branch.'],
    explanation: 'The branch after `if (score != null)` runs when there IS a value, so it must describe the score. The `else` branch runs when the value is missing. The swapped version printed "no score" for 80 and "score null" for the missing value.',
  },
  'missing-guard': {
    subtitle: '`shout("hi")` should print "HI" and `shout(null)` should print "(none)", but the program does not compile.',
    hints: ['Read the compiler message. What does it say about the type of `text`?', '`text` is `String?`, so Kotlin does not allow `uppercase()` on it. How can you show Kotlin that it is not `null`?', 'Check for `null` first and return "(none)" early. After the check, `text` is a plain `String`.'],
    explanation: 'After `if (text == null) { return ... }`, Kotlin knows `text` cannot be `null` in the rest of the function, so a plain `text.uppercase()` is allowed. Without the check, the compiler rejects the call because the value can be `null`.',
  },
  'wrong-cast-target': {
    subtitle: 'The value holds the text "42", so the program should print "Text: 42", but it prints "Text: not text".',
    hints: ['`as?` gives `null` when the value is not the type you asked for. Which type does `value` really hold?', 'The value is "42" in quotes. Which target type matches it?', 'Change the target type of the cast to match the value.'],
    explanation: '`as?` never crashes. A cast to the wrong type just gives `null`, which then uses the `?:` default and hides the mistake. The value is a `String`, so the target must be `String`.',
  },
  'null-list-size': {
    subtitle: 'With a missing list, the program should print "Count: 0", but it does not compile.',
    hints: ['Look at the type of `scores`. This time the `?` is not on the items.', 'The whole list can be `null`, so even `.size` needs a safe call.', 'Use a safe call for the size, and give the missing case a default.'],
    explanation: '`List<Int>?` means the list itself can be `null`, so reading `.size` needs `?.`. The result is `Int?`, and `?: 0` gives the count to show when the list is missing.',
  },
  'null-score-total': {
    subtitle: 'The program should print "Total: 10" and skip the missing score, but it does not compile.',
    hints: ['Look at the type of the list items. What does the `?` after `Int` allow?', '`score` can be `null`, and `null` cannot be added to an `Int`. What must you know before you add it?', 'Add the score only when you know it is not `null`.'],
    explanation: '`List<Int?>` can hold `null`, so the loop variable is `Int?`, and an `Int?` cannot be added to an `Int`. A check `if (score != null)` makes the value a plain `Int` inside the branch, and the missing entries are skipped.',
  },
  'broken-chain': {
    subtitle: 'The program should print "City: Pune", but it does not compile.',
    hints: ['Read the compiler message and find which part of the chain it complains about.', '`user?.address` can be `null` too, because `address` is `Address?`. Is a plain `.` allowed after it?', 'Every part of the chain that can be `null` needs the safe call.'],
    explanation: 'A safe call makes its result nullable. `user?.address` has the type `Address?`, so the next step needs `?.` too. A plain `.` there means "I know this is not null", and Kotlin cannot check that. Every part of a chain that can be `null` needs its own `?.`: `user?.address?.city`.',
  },
};
