# Practice tasks: "What you need to achieve" text

## Instructions for ChatGPT

You are rewriting short task descriptions for a Kotlin learning app. The learners are beginners and many are not native English speakers.

IMPORTANT: Do NOT change the meaning of any goal. Only rephrase it, so that an average person who knows basic English can understand it easily. The learner must still have to do exactly the same thing, with the same values and the same result. If you are not sure that a rewrite keeps the exact meaning, keep the original wording for that part.

Below is a JSON list. Each item has a worldId, a world name, an id and a "goal" text. Rewrite ONLY the "goal" text of every item in simple English.

Rules:
1. Use short, everyday words. Prefer "find", "count", "print", "add up", "keep" over words like "derive", "compute", "scan", "track", "exclusive".
2. One idea per sentence. Keep sentences short (about 20 words or fewer).
3. Say WHAT the learner must achieve. Do not explain HOW (no step-by-step method).
4. Keep every number, name, unit and quoted text exactly as it is (for example 487, 24, "Moon", Ravi). Do not change values.
5. Keep Kotlin words and code terms exactly (val, var, Int, Double, String, List, Map, Set, null, println, toInt). Put no new code terms in. Use a code term only if the original had it.
6. Keep the exact meaning and the difficulty. Rephrase only. Never change what the learner has to do. Do not give away the answer or add hints. Do not remove a requirement. Do not add one.
7. Use plain text only: no markdown, no bold, no backticks, no quotes added around the text, no line breaks inside a goal.
8. Do not change worldId, world, id. Do not reorder, merge, add or remove items.
9. If a goal is already simple, return it with only small fixes.

Output format: return the SAME JSON list, with the same fields, and with only "goal" changed. Return valid JSON only, in one code block, with no extra text. If the list is too long for one answer, return the first half, then continue with the rest when I say "continue", keeping the original order.

## Data (121 items)

```json
[
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-warehouse-pallets",
    "goal": "A warehouse ships 487 boxes and each pallet holds 24. Find the full pallets and the leftover boxes, then print a report that also checks the split adds back to 487."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-flight-log-timer",
    "goal": "Turn 100,000 seconds into hours, minutes and seconds and print it as a duration. Then rebuild the total from the three parts to prove the conversion is right."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-road-trip-fuel",
    "goal": "A trip covered 210 km on 12.5 liters of fuel at 1.5 per liter. Find the km per liter, the whole km per liter, and the fuel cost. Print all three on one line."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-quiz-average",
    "goal": "Find the exact average of four quiz scores, keeping its decimal part. Split it into a whole part and a fraction, and print all three."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-badge-builder",
    "goal": "Build a name badge. Join the first and last name, count its characters, and print the name in square brackets followed by its length."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-shipping-label",
    "goal": "A shipping label needs the item, the length of the customer note, and the total characters. This order has no note. Measure both texts, add them up, and print a three-line label."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-tea-receipt",
    "goal": "A customer buys 6 cups of tea at 4 each, with a discount of 3. Find the total, then print a two-line receipt: the price, and the price after the discount. Both show a dollar sign."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-invoice-block",
    "goal": "Mina buys 4 items at 17 each. Find the subtotal and a tax of one tenth of it, using whole numbers. Then print a three-line invoice with the customer, the subtotal and tax, and the total."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-launch-countdown",
    "goal": "Print a rocket launch countdown where some lines share a row and others stand alone. The layout is two two-part lines, a blank line, then the final message."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-arcade-session",
    "goal": "A player has 40 points and 3 lives. They pick up a 15-point bonus and lose one life. Update the game state and print a snapshot. Then double the score and print the new score."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-bank-ledger",
    "goal": "An account opens with 500, then gets a deposit, a withdrawal and a service fee. Apply the three changes in order, then print the opening balance, the closing balance and the net change."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-sensor-panel",
    "goal": "A weather station panel stores a sensor id, name, reading, status and zone. Build the doubled reading, the next id and a tag name. Let Kotlin infer the types, except one that you write. Print a one-line status report."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-access-gate",
    "goal": "A visitor aged 17 arrives at a gate with a minimum age of 18. Decide if they are old enough, too young, or exactly the minimum age. Print the three results and the ticket status on one line."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-log-entry",
    "goal": "Build a log entry from a file path and a header line. Print the header and the path on two separate lines with one `println()`."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-ticket-desk",
    "goal": "A ticket desk got its visitor counts as text. Convert them to numbers, find the total visitors and the money from adult and child tickets, and print a one-line summary."
  },
  {
    "worldId": "world-1",
    "world": "Kotlin Awakening",
    "id": "world-1-practice-writerun-parcel-weight",
    "goal": "A parcel weighs 68.5 with 1.25 of wrapping and holds 3 items that count as 1 each. Find the packed weight and the total weight with the items, and print a report."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-digit-splitter",
    "goal": "Separate 4872 into its four digits. Then add the digits together and print the digits and their sum."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-recipe-scaler",
    "goal": "A recipe for 4 people needs 250 g of flour, and you are cooking for 6. Work out how much to scale the recipe by, keeping the decimal part. Then work out how much flour you need and how many extra servings you are making. Print all three in one line."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-salary-slip",
    "goal": "An employee worked 39 hours at 17.5 per hour. Hours over 35 count as overtime and are paid at one and a half times the rate. Split the hours into regular and overtime, work out each part of the pay, add them up, and print a four-line slip."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-cart-compare",
    "goal": "You are choosing between two shopping carts: 3 items at 15 each, or 5 items at 9 each. Work out each cart total, then compare them. Is cart A cheaper? Are they the same? Is cart A within the 50 budget? Do they differ? Print all four answers on one line."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-name-sorter",
    "goal": "You are sorting two names, banana and Cherry. Find out how they compare: which comes first in dictionary order, whether they have the same length, how far apart their lengths are, and whether they are equal. Print a five-line report."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-club-entry",
    "goal": "A club lets someone in if they are an adult and a member, or if they have an invitation. A 19-year-old with 2 years of membership and no invite arrives. Work out whether they are an adult, a member, allowed in, and blocked. Print all four answers on one line."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-discount-rules",
    "goal": "A shop applies several rules to a 120 order from a member who has no coupon, on a holiday. Work out which rules apply: free shipping, a big discount, whether discounts can stack, and whether the customer gets no perks at all. Print the four answers on separate lines."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-inventory-update",
    "goal": "A warehouse holds 120 items. A delivery of 45 arrives, 8 items are found damaged, and the damaged count doubles after a recount. Update the numbers step by step with compound assignment and print a checkpoint. Then halve the stock and keep only what is left after packing into groups of 25."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-savings-plan",
    "goal": "A saver starts with 800 and adds 200 a week. Over two weeks, a 1.5x bonus is applied, a 300 fee is charged, and the balance is then halved. Track the balance and the week count as they change, build a summary sentence piece by piece, and print it."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-ticket-queue",
    "goal": "A ticket machine hands out numbers starting at 100. It issues two tickets, skips one number, then steps back one. Use the increment and decrement operators to hand out and track the numbers. The value you get depends on whether the operator comes before or after the variable. Print the report."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-lap-counter",
    "goal": "A race tracker counts laps starting at 1, and a seat counter starts at 10 and drops as seats are taken. Read each value either just before or just after it changes, by using increment and decrement in the same statement. Print the values you captured, with the final lap and seat counts."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-checkout-totals",
    "goal": "A shop total is 3 items at 40, with a discount of 15 taken off twice. Work out the checkout total, a split amount and a ratio, using the order Kotlin runs its operators in. Add parentheses only where the rule needs them. Print the three results."
  },
  {
    "worldId": "world-2",
    "world": "Operator Forge",
    "id": "world-2-practice-writerun-shipping-rules",
    "goal": "A courier prices a 12 kg parcel that travels 250 km. The parcel is fragile but not priority. Work out the base fee from the weight and the distance. Then decide whether it needs insurance, whether express shipping is allowed, and whether shipping is free. Print all four results."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-fitness-check",
    "goal": "A fitness app checks a day against its targets: 10,000 steps, at least 7 hours of sleep, and at least 2 liters of water. Today you walked 8,200 steps, slept 6 hours and drank 1.5 liters. Show a message only for each target that is not met, and always finish with a completion line."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-risk-score",
    "goal": "A monitoring tool turns a server report into a risk score. It adds points for each danger sign: a busy CPU, high memory together with swap use, and a nearly full disk. Build the score from the readings, raise an alert only if the score reaches 60, and print the final score."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-parking-fee",
    "goal": "A car park charges 5 for the first 2 hours and 3 for each extra hour, but never more than 12 in total. Work out the fee for a 5-hour stay, then the amount actually charged, and print both."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-leap-year",
    "goal": "Decide whether 2024 is a leap year. A year divisible by 4 is a leap year, except for century years, which must also be divisible by 400. Test each divisibility, combine the tests into one answer, and print a sentence that says which case applies."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-grade-report",
    "goal": "A student scored 78 and earned a 5-point bonus. Add the bonus, then turn the adjusted score into a letter grade: A from 90, B from 80, C from 70, D from 60, and F below that. Print the adjusted score and the grade."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-tax-bracket",
    "goal": "A tax office charges a rate that depends on income: 0 percent below 10,000, 10 percent below 40,000, 20 percent below 90,000, and 30 percent for anything higher. For an income of 62,000, choose the rate, work out the tax and the take-home amount, and print all three."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-arcade-menu",
    "goal": "An arcade machine shows different messages for the level and the game mode. For level 3 in duo mode, decide what the level is called, how many players are in the game, and whether a bonus is unlocked. Print one line for each."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-month-info",
    "goal": "A calendar app needs facts about a month. For month 2, work out how many days it has and which season it is in, then how many full weeks fit in the month. Print the month summary and the week count."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-age-category",
    "goal": "A registration form sorts people into age groups: child, teen, adult and senior. For someone aged 34, find their group, their decade (30s, 40s and so on) and how many years are left until 65. Print one summary line."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-pace-classifier",
    "goal": "A running app takes a pace of 350 seconds per km and makes it readable: minutes and seconds, plus a label from Elite to Easy. It must reject impossible readings with a Check sensor message. Work out the parts and print one line."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-temperature-label",
    "goal": "A weather display shows a temperature of 27 C as a word, from Freezing to Extreme, and also in Fahrenheit. Pick the label from the temperature bands, convert the temperature, and print both in one line."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-shipping-cost",
    "goal": "A parcel shop prices shipping from the weight and the destination. A 7 kg parcel going to the EU has a base cost by weight band, multiplied by a factor for the zone. Work out the total, label it as cheap, standard or premium, and print two lines."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-entry-check",
    "goal": "A venue decides entry from several facts: age, ticket, ban status and VIP status. For a 20-year-old with a ticket who is not banned and not VIP, decide whether they get in and which area they go to. Then print an alcohol notice based on their age."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-scholarship-decision",
    "goal": "A college gives a scholarship as a percentage of tuition. The award depends on the GPA and the family income, gets a bonus for a lot of volunteering, and can never go above 100. Work out the final award and its tier (full, partial or none) for this student, and print both."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-input-classifier",
    "goal": "A data tool receives values of unknown type: a number, some text and a Boolean. Test what each one really is, including one check for what it is not, and print all four answers on one line."
  },
  {
    "worldId": "world-3",
    "world": "Decision Maker",
    "id": "world-3-practice-writerun-data-validator",
    "goal": "A form receives three values of unknown type. Sort them into counts of whole numbers, texts and other values, and also count the texts that are longer than one character. Go through each value, update the right counter, and print all four counts on one line."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-savings-ladder",
    "goal": "You start with 100 and save 50 every week for 4 weeks. Show the balance after each week. At the end, show how much you saved in total."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-growth-table",
    "goal": "You invest 1000 and earn 10 percent interest every year. The interest is added to the balance, so next year you earn interest on the interest. Show each of the 5 years, then the final balance and the total interest."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-ticket-counter",
    "goal": "A box office has 11 tickets and sells them in bundles of 3. It keeps selling while a full bundle is left. Show how many bundles were sold and how many tickets remain."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-collatz-steps",
    "goal": "Start from 6. If the number is even, halve it. If it is odd, triple it and add 1. Repeat until you reach 1. Count the steps, track the highest number you reach, and print the result."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-retry-timer",
    "goal": "A program retries a failed request. The wait doubles each time: 2 seconds, then 4, 8 and so on, until the wait passes 20 seconds. It must try at least once. Show each attempt and its wait, then the number of attempts."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-digit-reverse",
    "goal": "Reverse the digits of 4820 without turning it into text. Take the last digit off the number again and again, and build the reversed number from those digits. Also count the digits. Print the reversed number and the digit count."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-range-scan",
    "goal": "Check the numbers 1 to 20 against the range 6 to 12. Count how many are inside it and how many are outside. Then count a second range that stops just before 12, to see how the two range styles differ. Print both results."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-overlap-counter",
    "goal": "Two ranges, 5 to 15 and 10 to 25, overlap. Check the numbers 1 to 30 and find the ones that are in both ranges. Record how many there are, the first one and the last one. Print the overlap."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-stair-steps",
    "goal": "A staircase has landings at 3, 9, 15 and so on, up to 30, with 6 units between them. Visit each landing and print it. Keep a running total of the landing numbers and print it at the end."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-overshoot-detector",
    "goal": "Walking from 1 up to 20 in steps of 6 does not land exactly on 20. Walking from 20 down to 1 does not land on 1 either. Walk both ways. Count the stops and remember where each walk ended. Print how far each walk fell short."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-rocket-countdown",
    "goal": "Print a rocket countdown from 5 down to 1. One second needs a special ignition message. After the countdown, print a liftoff line."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-elevator-descent",
    "goal": "An elevator starts on floor 20 and goes down, stopping every 3 floors until floor 2. Count its stops and how many are on even floors. Add up the floor numbers it visits. Report the last floor it stops at."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-checkpoints",
    "goal": "A 50 km route has a checkpoint every 15 km, starting at 0. The finish line is not a checkpoint. Walk the route, count the checkpoints and remember the last one. Then work out how far it is from the last checkpoint to the finish."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-budget-cutoff",
    "goal": "You buy items that cost 15, 30, 45 and so on, with a budget of 100. Keep buying until the next item would go over the budget, then stop. Print how many items you bought, how much you spent and how much is left."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-prime-check",
    "goal": "Decide if 29 is prime. Try each smaller number from 2 upward as a divisor, and stop as soon as one divides 29 evenly. Count how many checks you made. Print that the number is prime, or print the two factors you found."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-skip-multiples",
    "goal": "Add up the numbers from 1 to 15, but skip every multiple of 3. Count how many numbers you skipped. Print the sum and the number skipped."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-big-odd-sum",
    "goal": "Keep adding odd numbers until the running total goes above 60, then stop right away. Ignore the even numbers. Print the number that pushed the total over the limit, how many odd numbers you used, and the total."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-seating-chart",
    "goal": "Print a seating chart with 3 rows and 4 seats in each row. Label each seat with its row and seat number. Show each row on one line, then print the total number of seats."
  },
  {
    "worldId": "world-4",
    "world": "Loop Master",
    "id": "world-4-practice-writerun-pair-counter",
    "goal": "Look at all pairs (a, b) where a and b each go from 1 to 6. Ignore pairs where a and b are equal. Stop a row early once a times b goes above 12. Count the pairs and the total number of inner steps. Print both numbers."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-morning-routine",
    "goal": "Show a morning routine as small functions. One wakes up, one has breakfast, and one gets ready by using both. Run the routine once, then repeat the breakfast step on its own. Print a line for each action."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-round-tracker",
    "goal": "A game score is shared by several functions. One adds a bonus, one takes a penalty, and one plays a full round using both. Play three rounds and print the score after each round."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-trip-planner",
    "goal": "A travel agency prices trips by name, number of days and daily rate. Write one function that prints a trip and its total cost. Use it for two travelers with different plans."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-fence-planner",
    "goal": "A landscaper reports measurements of a fenced garden in the same format: a label, a colon and a number. Write one reporting function. Use it for the width, the perimeter, the posts needed (one every 4 metres) and the leftover length. Work out each value right where you call the function."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-shipping-quote",
    "goal": "A shop quotes a total for a 6 kg parcel. Build it from two small functions. One works out shipping from the weight. The other adds tax to an amount. Combine them with the price of the goods, then print the shipping and the final total."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-grade-book",
    "goal": "A teacher wants a report line for each student score. It shows the letter grade, the bonus and whether the student passes. Write a small function for each decision, then a report function that uses them. Print one line for each of three scores."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-shipping-label",
    "goal": "A shipping label has a recipient, a city and a zip code. Most parcels go to the same city and zip. Write a function with default values for the city and zip. Call it three ways: with both defaults, with only the zip defaulted, and with everything supplied."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-order-total",
    "goal": "An order price depends on quantity, discount and shipping, but usually only some of them change. Write one function with default values for all three. Call it in five ways to see how each default is used, including setting only the shipping by name."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-booking",
    "goal": "A hotel booking has four details that are easy to mix up: guest, nights, breakfast and room type. Write a booking function. Then call it with every argument passed by name, in two different orders. This shows that names keep a call clear and safe."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-order-options",
    "goal": "A shop order has an item and three optional extras: quantity, gift wrap and a note. Each has a default value, and the cost depends on them. Write the function. Then call it four ways, mixing skipped defaults, named arguments and positional arguments, and print each order line."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-unit-converters",
    "goal": "You want quick conversion helpers: Celsius to Fahrenheit, centimeters to meters, and a freezing check. Each one is a single expression, so write them as short single-expression functions. Then use all three on sample values and print the results."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-grade-rules",
    "goal": "A grading tool has small rules: a letter label, a pass check and a score curve. Write each one as a single-expression function. Then build a summary function on top of them. Print a summary line for three scores."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-receipt-helpers",
    "goal": "A cafe receipt is built from two helpers that only make sense inside this program. One adds tax to a price. One formats a receipt line using it. Define them inside main so they stay private to it. Then print a line for three items."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-scoreboard",
    "goal": "A scoreboard keeps a running total and a round count. Use small helper functions defined inside main to record points, play a bonus round and work out the average. Play a few rounds, then print the rounds, the total and the average in one line."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-score-summary",
    "goal": "A scoring tool must handle any number of scores: three, one or none. Write a function that accepts a variable number of scores and returns how many there were, their total and the best. Call it with three different amounts."
  },
  {
    "worldId": "world-5",
    "world": "Function Forge",
    "id": "world-5-practice-writerun-report-builder",
    "goal": "A weather report takes a label, a threshold and any number of readings. Summarize them: how many there are, their sum, how many are above the threshold, and the average as a decimal. If there are no readings, say there is no data instead."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-lap-times",
    "goal": "A runner recorded five lap times, and the first was timed 3 seconds too slow. Fix that lap, then find the fastest lap and the total, and print a summary with the lap count and the last lap."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-array-reversal",
    "goal": "Reverse an array of six numbers in place, with no second array. Print the reversed array and its middle element."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-playlist-desk",
    "goal": "A playlist has five songs. Print how many songs there are, the first and last, the third, where Moon sits, and whether it contains Rain. Finish with an alphabetical copy that leaves the original order alone."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-median-board",
    "goal": "Find the median of six sensor readings. It must work for an odd or an even count. Also find the range and the second-highest reading, and print four lines."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-unique-visitors",
    "goal": "A website log lists visitors, and repeat visitors appear several times. Collect them in a set to count the distinct visitors, and count the repeat visits. Print a summary line."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-tag-merger",
    "goal": "Two tag lists for one project both contain duplicates. Clean each into a set, then find the merged tags, the shared tags, and how many tags are in only one list. Print all three results."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-stock-lookup",
    "goal": "A shop keeps stock counts in a map from item to units. Update a restocked item, add a new item, look up some entries, and add up all the units. Print the results."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-word-counter",
    "goal": "Count how often each word appears in a list, using a map from word to count. Print each word with its count, then name the most common word."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-read-only-copy",
    "goal": "A list of numbers must stay untouched, so work on an editable copy. Add a value to the copy, remove one, sort it, and print both lists to show the original never changed."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-snapshot-guard",
    "goal": "A shopping list can be shared as a read-only view of the same list, or as a copy taken at one moment. Make both, change the original, and print what each shows, to see which one follows the original."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-class-roster",
    "goal": "A class keeps students in a list, seat numbers in an array and grades in a map. Read one value from each, look up a student who is not in the map, and print the size of each collection."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-lookup-chain",
    "goal": "A seating order stores positions into a list of names, and each name has a score in a map. Follow each position to a name and then to its score. Print a ranked list with the scores, then the average score as a decimal. The numbers in `order` are positions in `names`."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-shopping-cart",
    "goal": "A shopping cart starts with three items. Add one at the end, remove one by name, replace the first item, and insert one at a chosen position. Print the final cart and its size."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-ticket-numbers",
    "goal": "A queue of support tickets changes: one is cancelled by its number, one is removed from the front, a new one arrives, and one is replaced. Then serve tickets from the front until only two wait. Print the number served and the queue."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-grade-totals",
    "goal": "A teacher has four scores. Print each one as a numbered rank, and work out the total and the highest score with its rank number."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-pair-walker",
    "goal": "Two lists hold item names and prices at matching positions. Combine them into a map from name to price, then find the total, the priciest item and the average price. Print one summary line."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-stats-panel",
    "goal": "Summarize five temperatures: the count, sum and average (as a decimal), the smallest and largest, whether 30 is in the list, and whether the list is empty. Use built-in collection operations instead of loops."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-top-three",
    "goal": "A leaderboard has six scores with a repeated top score. Rank them from highest to lowest, then find the top three, the top three distinct scores, the rank of a given score, and the lowest score. Print all four results."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-contact-book",
    "goal": "Finding a phone number by name in two parallel lists means searching, so turn them into a map from name to phone. Look up one contact who exists and one who does not, check a name, remove a contact, and print the results at each step."
  },
  {
    "worldId": "world-6",
    "world": "Collection Valley",
    "id": "world-6-practice-writerun-sensor-log",
    "goal": "A sensor produced a list of readings. The list keeps every reading in order, a set shows the distinct values, and a map counts each value. Build the set and the map, and report the log, the distinct values and the most frequent reading."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-contact-card",
    "goal": "A contact always has a name. The phone and the email can be missing. Print all three fields, then say how many of them have a value."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-discount-codes",
    "goal": "A shop knows two discount codes. Write a function that can answer \"no discount\". Print the value of each code, then add up only the codes the shop knows."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-session-token",
    "goal": "A login token starts empty, gets a value at login and is cleared at logout. Print the token at each stage and count how many times it changed."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-login-events",
    "goal": "A log has events like \"login:ana\" and \"logout\". Go through them in order with one nullable variable that holds who is signed in. Print the state after each event, then the number of sessions and who is still signed in."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-lookup-lengths",
    "goal": "Three profile fields can be missing. Read each one with a safe call, so a missing field gives `null` and not a crash. Also see what a chain of safe calls does to padded text."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-customer-addresses",
    "goal": "A customer can have no address, or an address with no city. Read the city and the zip code of each customer with safe calls, print what you find, and count the customers with a known city."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-display-name",
    "goal": "A profile card must always show something. Use a default for every missing field, and show the bio length as `0` when there is no bio."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-lazy-fallback",
    "goal": "Making the default value costs a lot, so it must run only when a value is really missing. Use `?:` on four values, then say how many times the default was made."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-confirmed-username",
    "goal": "The stored username comes from code that makes sure it exists, so `!!` is fair there. The guess from a user can be missing, so keep it safe. Then add the two lengths."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-load-config",
    "goal": "A settings lookup can return `null` for any key. The host and the port are required, so you may use `!!`. The timeout is optional, so give it a default."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-age-report",
    "goal": "Ages come from a form, so any of them can be missing. Name each age as adult, minor or unknown. Print the age and its name, and count the adults."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-pin-checker",
    "goal": "A PIN is valid when it exists and has exactly 4 characters. It needs a reset when it is missing or shorter than 4. Write both rules without ever reading the length of a missing PIN. Print each PIN and count the valid ones."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-bio-lengths",
    "goal": "Two profile texts can be missing. Inside a null check, Kotlin knows the text is real, so you can use plain dots. Print a line for each text and add up the lengths of the texts that exist."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-user-emails",
    "goal": "Some users have no email. Check the `email` property for `null`. Inside the check you can use it directly, because the property is a `val`. Print the email length or a \"no email\" message, and count the users with an email."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-mixed-inbox",
    "goal": "Three values come as type `Any`. Ask for each one as the type you hope it is, with `as?`. A cast to the wrong type must give `null`, not a crash."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-text-lengths",
    "goal": "A list holds values of different types. Write a function that gives the length of a value only when it is text, and `-1` if not. Print the result for each value and add up the text lengths."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-survey-answers",
    "goal": "A survey stores a score from 1 to 5 for each question, and `null` when the person skipped it. Count the answered and the skipped questions, add up the real scores, and find the average of the answered ones."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-shift-lists",
    "goal": "The morning shift list exists, but the evening shift list was never made, so it is `null`. Print the size and the first entry of each list, and the total hours. Give every missing part a default."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-stock-map",
    "goal": "A stock map shows how many of each item are on the shelf, and `null` when nobody counted. Print every entry, add up the known counts, and count the items with an unknown count."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-reachable-emails",
    "goal": "Finding a user can fail, and finding that user's email can fail too. Chain both lookups, take the length of the email, and use one `-1` for every way the chain can fail."
  },
  {
    "worldId": "world-7",
    "world": "Null Safety Shield",
    "id": "world-7-practice-writerun-nickname-lengths",
    "goal": "Nicknames come from a form. They can be missing, have extra spaces, or be empty. Measure each trimmed nickname with one safe chain. Also count how many are missing (`null`) and how many are blank after trimming."
  }
]
```
