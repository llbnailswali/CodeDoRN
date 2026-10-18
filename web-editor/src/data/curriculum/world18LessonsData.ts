import type { FiveStageLesson, Stage4WriteRunData, Stage5DebugData } from '../lessonStagesData';

// All snippets are complete Kotlin/JVM programs. Coroutine examples require kotlinx-coroutines-core.
// Helpers supply schema metadata only; each lesson's concepts, scenarios and answers are authored below.
const lines = (code: string) => code.trim().split('\n');
const jvm = (body: string, imports = '') => `${imports ? imports + '\n\n' : ''}fun main() {\n${body}\n}`;
const coroutine = (body: string, imports = '') => `import kotlinx.coroutines.*\n${imports ? imports + '\n' : ''}\nfun main() = runBlocking {\n${body}\n}`;
const mutexImports = 'import kotlinx.coroutines.sync.Mutex\nimport kotlinx.coroutines.sync.withLock';
const atomicImport = 'import java.util.concurrent.atomic.AtomicInteger';
const threadImport = 'import kotlin.concurrent.thread';

type Example = { title: string; code: string; output: string; why: string; change: string };
type Prediction = { title: string; code?: string; prompt: string; answers: [string, string, string, string]; correct: number; why: string; ref: string };
type Writing = { title: string; goal: string; steps: string; initial: string; solution: string; output: string; swap: NonNullable<Stage4WriteRunData['hardcodeCheck']> };
type Debugging = { title: string; symptom: string; broken: string; fixed: string; output: string; hints: [string, string, string]; why: string };
type LessonSeed = {
  slug: string; title: string; intro: string; exampleTitle: string; code: string; explanation: string;
  ideas: [string, string][]; takeaway: string; exploreIntro: string; examples: Example[];
  predictIntro: string; predictions: Prediction[]; write: Writing; debug: Debugging;
};

function lesson(seed: LessonSeed): FiveStageLesson {
  const id = `world-18-${seed.slug}`;
  const ids = ['A', 'B', 'C', 'D'] as const;
  return {
    id, worldId: 'world-18', worldName: 'Concurrency Arena', stageName: 'STAGE 18 — CONCURRENCY', topicTitle: seed.title,
    learn: {
      title: seed.title, subtitle: seed.intro, exampleTag: 'KOTLIN/JVM', exampleTitle: seed.exampleTitle,
      language: 'Kotlin', codeSnippet: lines(seed.code), explanation: seed.explanation,
      keyIdeas: seed.ideas.map(([title, description], i) => ({ number: i + 1, title, description })),
      keyTakeaway: seed.takeaway,
    },
    explore: {
      title: 'Explore ' + seed.title, subtitle: seed.exploreIntro,
      cards: seed.examples.map((e, i) => ({
        id: `${id}-explore-${i + 1}`, number: String(i + 1).padStart(2, '0'), title: e.title,
        language: 'Kotlin', subtitle: e.change, code: lines(e.code), output: e.output ? e.output.split('\n') : [],
        whatItMeans: [{ label: e.title, description: e.why }], whatChanged: e.change,
      })),
    },
    predict: {
      title: 'Reason about ' + seed.title, subtitle: seed.predictIntro,
      questions: seed.predictions.map((q, i) => ({
        id: `${id}-predict-${i + 1}`, questionNumber: i + 1, totalQuestions: seed.predictions.length,
        title: q.title, topicMeta: seed.title, language: 'Kotlin', ...(q.code ? { code: lines(q.code) } : {}), prompt: q.prompt,
        options: q.answers.map((label, n) => ({ id: ids[n], label, isCorrect: n === q.correct })),
        explanation: { codeRef: q.ref, detail: q.why },
      })),
    },
    writeRun: {
      challengeNumber: 1, totalChallenges: 1, xpReward: seed.slug === 'boss' ? 50 : 25,
      title: seed.write.title, goal: seed.write.goal, description: seed.write.steps,
      requirements: { name: 'main', params: '(none)', returns: 'Unit' }, fileName: 'Main.kt',
      initialCode: seed.write.initial, solutionCode: seed.write.solution, sampleInput: 'Run main()',
      expectedOutput: seed.write.output, testCase: { call: '', expected: seed.write.output }, hardcodeCheck: seed.write.swap,
    },
    debug: {
      title: seed.debug.title, subtitle: seed.debug.symptom, challengeNumber: 1, totalChallenges: 1,
      difficulty: seed.slug === 'boss' ? 'hard' : 'medium', bugType: 'logic', bugLabel: seed.debug.title,
      brokenCode: seed.debug.broken, fixedCode: seed.debug.fixed, expectedOutput: seed.debug.output,
      hints: seed.debug.hints, explanation: seed.debug.why,
    } satisfies Stage5DebugData,
    mastered: {
      topicTitle: seed.title, summary: seed.takeaway, passedCount: '5 / 5 STAGES',
      verificationItems: [
        { title: 'Learn', subtitle: seed.exampleTitle },
        { title: 'Explore', subtitle: `${seed.examples.length} worked examples` },
        { title: 'Predict', subtitle: `${seed.predictions.length} reasoning questions` },
        { title: 'Write & Run', subtitle: seed.write.title },
        { title: 'Debug', subtitle: seed.debug.title },
      ], xpEarned: seed.slug === 'boss' ? 50 : 25, streakDays: 1, accuracy: '100%',
    },
  };
}

const swap = (variableName: string, originalLiteral: string, alternateLiteral: string, alternateExpectedOutput: string): Writing['swap'] => ({
  inputSwaps: [{ variableName, originalLiteral, alternateLiteral }], alternateExpectedOutput,
});

export const THREADS_LESSON = lesson({
  slug: 'threads', title: 'Threads',
  intro: 'Start a JVM worker and wait for it before using its result. You already know functions and mutable variables; a thread gives a function an independent execution path.',
  exampleTitle: 'Read a result after the worker finishes',
  code: jvm(`  var answer = 0
  val worker = thread {
    answer = 6 * 7
  }
  worker.join()
  println(answer)`, threadImport),
  explanation: 'thread { } starts a new JVM thread by default and returns its Thread handle. The caller and worker can make progress independently. join() blocks the caller until that worker terminates; here the print therefore sees 42.\n\nStarting threads in a particular order does not guarantee the order in which they finish. Wait for the work you depend on, rather than guessing how long it will take.',
  ideas: [
    ['Start once', 'thread(start = false) creates a worker without starting it. Call start() once when it should begin. Calling run() directly executes the body on the caller instead.'],
    ['Completion and visibility', 'After a successful join(), the worker has finished and its writes are visible to the joining thread. Joining one worker does not wait for other workers.'],
    ['Blocking and suspension', 'Thread.sleep pauses the current thread. Coroutine delay suspends a coroutine so that its thread can do other work. Neither is a substitute for waiting for completion.'],
    ['Process lifetime', 'A non-daemon JVM thread keeps the process alive. Daemon workers do not keep it alive by themselves; do not put required cleanup in a fire-and-forget daemon.'],
  ], takeaway: 'Keep the Thread handle and join the worker whose result you need.',
  exploreIntro: 'Follow worker creation, manual start, joining several workers, and direct run calls.',
  examples: [
    { title: 'Create now, start later', code: jvm(`  val worker = thread(start = false) {
    println("worker")
  }
  println("created")
  worker.start()
  worker.join()
  println("finished")`, threadImport), output: 'created\nworker\nfinished', why: 'The first print happens before start. The final print happens after join, so all three lines have a guaranteed order.', change: 'Disable automatic start, then start the worker explicitly.' },
    { title: 'Wait for both workers', code: jvm(`  val values = IntArray(2)
  val first = thread { values[0] = 12 }
  val second = thread { values[1] = 8 }
  first.join()
  second.join()
  println(values.sum())`, threadImport), output: '20', why: 'The workers own different array slots. Both joins complete before the main thread reads either result.', change: 'Keep a separate handle for each independent result.' },
    { title: 'run is an ordinary call', code: jvm(`  val caller = Thread.currentThread()
  val worker = thread(start = false) {
    println(Thread.currentThread() === caller)
  }
  worker.run()`, threadImport), output: 'true', why: 'run() invokes the body on the current thread. It does not start the new thread.', change: 'Call run directly and compare the executing thread with the caller.' },
    { title: 'Name and daemon flag', code: jvm(`  val worker = thread(start = false, isDaemon = true, name = "preview") {
    println(Thread.currentThread().name)
  }
  println(worker.isDaemon)
  worker.start()
  worker.join()`, threadImport), output: 'true\npreview', why: 'The daemon flag controls process lifetime, not scheduling priority. This main still joins the worker, so its print is observed.', change: 'Configure the worker before it starts.' },
  ],
  predictIntro: 'Use start and join boundaries to distinguish guaranteed order from independent execution.',
  predictions: [
    { title: 'Unstarted worker', code: jvm(`  var value = 3
  val worker = thread(start = false) { value = 11 }
  worker.join()
  println(value)`, threadImport), prompt: 'What does this complete JVM program print?', answers: ['11', '3', 'It waits forever', 'It does not compile'], correct: 1, why: 'join on a thread that has not started returns. No code assigns 11.', ref: 'start = false' },
    { title: 'Two completion boundaries', code: jvm(`  val results = IntArray(2)
  val a = thread { results[0] = 5 }
  val b = thread { results[1] = 9 }
  b.join()
  a.join()
  println(results[1] - results[0])`, threadImport), prompt: 'What is the output after both joins?', answers: ['-4', '0', '9', '4'], correct: 3, why: 'Join order does not change the assigned slots. Both values are available for 9 - 5.', ref: 'b.join(); a.join()' },
    { title: 'No dependency between workers', code: jvm(`  val a = thread { println("A") }
  val b = thread { println("B") }
  a.join()
  b.join()
  println("end")`, threadImport), prompt: 'Which ordering is guaranteed?', answers: ['end follows both A and B; A and B may appear in either order', 'A always precedes B', 'B always precedes A', 'end may appear before A'], correct: 0, why: 'The joins order the final print after both workers, but do not order the two worker prints against each other.', ref: 'two joins before end' },
    { title: 'Waiting by elapsed time', prompt: 'A worker usually takes 20 ms. Why is Thread.sleep(30) before reading its result not a correct replacement for join()?', answers: ['sleep always starts the worker again', 'sleep changes the worker to a daemon', 'Elapsed time does not prove the worker has finished', 'join only works for coroutines'], correct: 2, why: 'Scheduling and workload vary. join observes completion; a delay only waits for time to pass.', ref: 'completion versus time' },
  ],
  write: {
    title: 'Combine two worker results', goal: 'Compute the double and triple of an input on two JVM threads, then print their sum after both finish.',
    steps: '1. Each worker writes only its own slot in results.\n2. Join both workers before printing results.sum().',
    initial: jvm(`  val input = 7
  val results = IntArray(2)
  // Start two workers, store input * 2 and input * 3, and join both.
  println(results.sum())`, threadImport),
    solution: jvm(`  val input = 7
  val results = IntArray(2)
  val doubleWorker = thread { results[0] = input * 2 }
  val tripleWorker = thread { results[1] = input * 3 }
  doubleWorker.join()
  tripleWorker.join()
  println(results.sum())`, threadImport), output: '35', swap: swap('input', '7', '4', '20'),
  },
  debug: {
    title: 'Actually start the loader', symptom: 'The loader should replace pending with ready, but joining this worker still prints pending.',
    broken: jvm(`  var status = "pending"
  val loader = thread(start = false) { status = "ready" }
  loader.join()
  println(status)`, threadImport),
    fixed: jvm(`  var status = "pending"
  val loader = thread(start = false) { status = "ready" }
  loader.start()
  loader.join()
  println(status)`, threadImport), output: 'ready',
    hints: ['Waiting cannot complete work that never began.', 'Check the start argument passed to thread.', 'Call loader.start() before loader.join().'],
    why: 'start = false only constructs the thread. Starting it before joining makes the assignment run before the final read.',
  },
});

export const SHARED_MUTABLE_STATE_LESSON = lesson({
  slug: 'shared-mutable-state', title: 'Shared mutable state',
  intro: 'Find the object that several workers can change. Knowing where state lives is the first step toward choosing how to protect it.',
  exampleTitle: 'Two names can refer to one mutable list',
  code: jvm(`  val orders = mutableListOf("tea")
  val alias = orders
  alias.add("coffee")
  println(orders.joinToString())`),
  explanation: 'The list is mutable even though orders is declared with val. alias holds the same reference, so adding through alias changes the list seen through orders.\n\nIf workers share that list, they share its changing contents. A variable declared inside each worker is local to that worker, but a local reference can still point at a shared object.',
  ideas: [
    ['Shared plus mutable', 'Shared state becomes a coordination problem when one execution path can change data another path reads or changes. Read-only access to an object that never changes is a simpler case.'],
    ['Increment is a sequence', 'count++ reads the old value, computes a new value, then writes it. Two workers can both read the same old value and overwrite one another.'],
    ['A copy has a depth', 'toList() copies list membership. If the elements themselves are mutable objects, both lists still refer to those elements.'],
    ['Choose an owner', 'Let each worker compute its own result and combine results after completion, or use a shared protection mechanism for the shared object.'],
  ], takeaway: 'Track object identity as well as variable names: val and local aliases do not make shared objects immutable.',
  exploreIntro: 'Compare aliases, snapshots, shallow copies, and separate worker results.',
  examples: [
    { title: 'Membership snapshot', code: jvm(`  val live = mutableListOf(2, 4)
  val snapshot = live.toList()
  live.add(6)
  println(snapshot.sum())
  println(live.sum())`), output: '6\n12', why: 'The new list has its own membership. Adding 6 to live does not insert it into snapshot.', change: 'Copy the list before the original membership changes.' },
    { title: 'Elements can still be shared', code: `data class Box(var count: Int)

${jvm(`  val original = listOf(Box(1))
  val copy = original.toList()
  copy[0].count = 9
  println(original[0].count)`)}`, output: '9', why: 'Both lists contain the same Box reference. toList does not recursively copy the Box.', change: 'Copy a list whose element is itself mutable.' },
    { title: 'A lost update, step by step', code: jvm(`  var count = 0
  val firstRead = count
  val secondRead = count
  count = firstRead + 1
  count = secondRead + 1
  println(count)`), output: '1', why: 'This sequential trace models one possible two-worker interleaving. Both computations start from 0, so the second write overwrites 1 with 1.', change: 'Expand two increments into their reads and writes to expose the shared state.' },
    { title: 'Each worker owns one result', code: jvm(`  val parts = IntArray(2)
  val a = thread {
    val local = listOf(1, 2).sum()
    parts[0] = local
  }
  val b = thread {
    val local = listOf(4, 5).sum()
    parts[1] = local
  }
  a.join()
  b.join()
  println(parts.sum())`, threadImport), output: '12', why: 'The local sums are independent, and each array element has one writer. The main thread reads only after both workers finish.', change: 'Partition writes instead of having both workers update one accumulator.' },
  ], predictIntro: 'Identify shared references and reason about the exact reads and writes shown.',
  predictions: [
    { title: 'A val list', code: jvm(`  val names = mutableListOf("Ada")
  val other = names
  other.clear()
  println(names.size)`), prompt: 'What does the program print?', answers: ['1', 'It does not compile because names is val', '0', '2'], correct: 2, why: 'val prevents rebinding names, not changing the list it refers to.', ref: 'other = names' },
    { title: 'Local reference', code: jvm(`  val shared = mutableListOf(3)
  run {
    val local = shared
    local.add(7)
  }
  println(shared.sum())`), prompt: 'What is printed after the local block?', answers: ['10', '3', '7', '0'], correct: 0, why: 'The local variable refers to the shared list; it is not a private copy.', ref: 'val local = shared' },
    { title: 'Fresh read', code: jvm(`  var total = 10
  val first = total
  total = first + 2
  val second = total
  total = second + 3
  println(total)`), prompt: 'What does this particular read/write trace print?', answers: ['12', '13', '10', '15'], correct: 3, why: 'The second read happens after the first write and therefore includes its update.', ref: 'val second = total' },
    { title: 'Snapshot membership', code: jvm(`  val source = mutableListOf(1, 8)
  val copy = source.toList()
  source[0] = 5
  println(copy.sum())`), prompt: 'What does this program print?', answers: ['13', '9', '5', '8'], correct: 1, why: 'Replacing a list entry does not replace the corresponding entry in the copied list.', ref: 'source.toList()' },
  ],
  write: {
    title: 'Keep a stable reading list', goal: 'Capture a snapshot before a later reading arrives, then print the sums of the snapshot and live list.',
    steps: '1. Make a membership copy of readings.\n2. Add extra to readings.\n3. Print the snapshot sum, then the live sum on a new line.',
    initial: jvm(`  val extra = 8
  val readings = mutableListOf(2, 5)
  // Capture a snapshot before adding extra, then print both sums.`),
    solution: jvm(`  val extra = 8
  val readings = mutableListOf(2, 5)
  val snapshot = readings.toList()
  readings.add(extra)
  println(snapshot.sum())
  println(readings.sum())`), output: '7\n15', swap: swap('extra', '8', '3', '7\n10'),
  },
  debug: {
    title: 'Keep the draft separate', symptom: 'Adding bread to the draft must not change the saved list. The saved count should stay 1.',
    broken: jvm(`  val saved = mutableListOf("milk")
  val draft = saved
  draft.add("bread")
  println(saved.size)`),
    fixed: jvm(`  val saved = mutableListOf("milk")
  val draft = saved.toMutableList()
  draft.add("bread")
  println(saved.size)`), output: '1', hints: ['Check whether there are two lists or two names.', 'Assigning a reference does not copy membership.', 'Initialize draft with saved.toMutableList().'],
    why: 'The draft now has independent membership. The String elements are immutable, so a membership copy is sufficient for this task.',
  },
});

const counterProgram = (increment: string, repetitions = '20') => jvm(`  val repetitions = ${repetitions}
  val total = AtomicInteger(0)
  val workers = List(3) {
    thread {
      repeat(repetitions) {
        ${increment}
      }
    }
  }
  workers.forEach { it.join() }
  println(total.get())`, `${threadImport}\n${atomicImport}`);

export const THREAD_SAFETY_LESSON = lesson({
  slug: 'thread-safety', title: 'Thread safety',
  intro: 'A safe component preserves its rules when several threads call it. Define those rules before picking a concurrency tool.',
  exampleTitle: 'One atomic increment per completed item', code: counterProgram('total.incrementAndGet()', '4'),
  explanation: 'AtomicInteger.incrementAndGet() performs one indivisible increment, so three workers doing four increments each produce 12. The class coordinates these operations internally.\n\nSafety belongs to the operation you need. A thread-safe get followed by a thread-safe set is still two operations; another worker may act between them. Likewise, two safe counters do not automatically form one safe transfer.',
  ideas: [
    ['Name the invariant', 'For a counter, every accepted item must add exactly one. For a transfer, the combined balance must stay constant. These rules tell you what must be coordinated together.'],
    ['Visibility is not atomicity', '@Volatile on a JVM backing field makes writes visible to later reads of that field. It does not combine a read and a write into one increment.'],
    ['Protect every access', 'A lock protects an invariant only if every competing access follows the same lock protocol. Public mutable fields can bypass that protocol.'],
    ['Keep boundaries explicit', 'Return a copy when callers need a snapshot. Exposing the internal mutable collection allows callers to change state behind the component’s back.'],
  ], takeaway: 'Choose a safe operation for the whole invariant, and prevent callers from bypassing it.',
  exploreIntro: 'Inspect atomic calls, compound operations, visibility, and encapsulated snapshots.',
  examples: [
    { title: 'One operation changes the count', code: jvm(`  val count = AtomicInteger(5)
  println(count.addAndGet(3))
  println(count.get())`, atomicImport), output: '8\n8', why: 'addAndGet returns the updated value from the same atomic operation that performs the addition.', change: 'Use an atomic operation that expresses the complete update.' },
    { title: 'Safe calls can compose unsafely', code: jvm(`  val count = AtomicInteger(0)
  val a = count.get()
  val b = count.get()
  count.set(a + 1)
  count.set(b + 1)
  println(count.get())`, atomicImport), output: '1', why: 'Each individual call is valid, but this explicit interleaving loses an increment. Atomic get and set do not combine themselves.', change: 'Split a compound update into individually safe method calls.' },
    { title: 'A visible completion flag', code: `import kotlin.concurrent.thread

class Signal {
  @Volatile var ready = false
}

${jvm(`  val signal = Signal()
  val worker = thread { signal.ready = true }
  worker.join()
  println(signal.ready)`)}`, output: 'true', why: 'The annotation describes field visibility. This example also joins, so completion is explicit; it does not use a spin loop or pretend volatility makes increments atomic.', change: 'Use a volatile Boolean for a single flag rather than a multi-step update.' },
    { title: 'Keep mutation inside the owner', code: `class Archive {
  private val entries = mutableListOf("A")

  fun snapshot(): List<String> = entries.toList()
}

${jvm(`  val archive = Archive()
  val copy = archive.snapshot().toMutableList()
  copy.clear()
  println(archive.snapshot().size)`)}`, output: '1', why: 'The caller only changes its own copy. This example demonstrates encapsulation; a concurrently mutable archive would additionally coordinate its internal reads and writes.', change: 'Return a snapshot instead of exposing a mutable collection.' },
  ], predictIntro: 'Decide whether a guarantee applies to one field, one call, or a whole transaction.',
  predictions: [
    { title: 'Whole update', code: jvm(`  val n = AtomicInteger(6)
  n.addAndGet(4)
  println(n.get())`, atomicImport), prompt: 'What is printed?', answers: ['6', '4', '24', '10'], correct: 3, why: 'The atomic addition stores 10.', ref: 'addAndGet(4)' },
    { title: 'Volatile increment', prompt: 'Two JVM threads both execute count++ on the same @Volatile Int field. Which claim is correct?', answers: ['The annotation guarantees both increments are retained', 'The increments can still overwrite one another', 'Volatile prevents the field from changing', 'Volatile forces both workers onto one thread'], correct: 1, why: 'Visibility of individual reads and writes does not make the full read–modify–write operation indivisible.', ref: '@Volatile count++' },
    { title: 'A transfer uses two balances', prompt: 'Two AtomicInteger balances are updated with separate debit and credit calls. Can another thread observe the state between those calls?', answers: ['Yes; the pair is not one atomic transaction', 'No; all atomic objects share one global lock', 'No; atomic means every function is synchronized', 'Only if the variables are declared var'], correct: 0, why: 'The independent objects guarantee individual operations, not the combined invariant.', ref: 'two atomic objects' },
    { title: 'Lock protocol', prompt: 'A list writer uses lock A, but a reader uses lock B. What does that mean for concurrent access to the list?', answers: ['The list is protected twice', 'Readers never need coordination', 'The two locks do not coordinate these accesses', 'Different lock names still refer to the same monitor'], correct: 2, why: 'Mutual exclusion requires the competing operations to use the same protection boundary.', ref: 'one shared lock protocol' },
  ],
  write: {
    title: 'Count completed checks', goal: 'Three workers each complete repetitions checks. Count every completion with one atomic increment and print the total after all workers finish.',
    steps: '1. Replace the missing update with an atomic increment.\n2. Keep the joins before the final read.',
    initial: counterProgram('// TODO: Record one completion.'), solution: counterProgram('total.incrementAndGet()'), output: '60', swap: swap('repetitions', '20', '7', '21'),
  },
  debug: {
    title: 'Do not leak the internal queue', symptom: 'A caller clears its returned list. The inbox must still contain its two original messages.',
    broken: `class Inbox {
  private val messages = mutableListOf("hello", "thanks")

  fun snapshot(): MutableList<String> = messages
}

${jvm(`  val inbox = Inbox()
  val view = inbox.snapshot()
  view.clear()
  println(inbox.snapshot().size)`)}`,
    fixed: `class Inbox {
  private val messages = mutableListOf("hello", "thanks")

  fun snapshot(): MutableList<String> = messages.toMutableList()
}

${jvm(`  val inbox = Inbox()
  val view = inbox.snapshot()
  view.clear()
  println(inbox.snapshot().size)`)}`, output: '2',
    hints: ['Private storage can still escape through a returned reference.', 'Inspect the object returned by snapshot().', 'Return messages.toMutableList() so callers receive a copy.'],
    why: 'The getter previously exposed the mutable object itself. Copying closes this mutation path. If the inbox later mutates concurrently, taking the copy must use its synchronization protocol too.',
  },
});

// The rendezvous makes both reads happen before either write. No timing guess is needed.
const raceProgram = (fixed: boolean, amount = '1') => coroutine(`  val amount = ${amount}
  var total = 0
  var arrived = 0
  val bothRead = CompletableDeferred<Unit>()
  val mutex = Mutex()
  coroutineScope {
    repeat(2) {
      launch {
        val snapshot = total
        arrived++
        if (arrived == 2) bothRead.complete(Unit)
        bothRead.await()
${fixed ? `        mutex.withLock {
          total += amount
        }` : `        total = snapshot + amount`}
      }
    }
  }
  println(total)`, mutexImports);

export const RACE_CONDITIONS_LESSON = lesson({
  slug: 'race-conditions', title: 'Race conditions',
  intro: 'A result can depend on how operations interleave. Learn to show the conflicting steps rather than hoping a stress run reveals them.',
  exampleTitle: 'Force two stale reads before either write', code: raceProgram(false),
  explanation: 'Both children run on the runBlocking event loop. Each saves total before waiting at bothRead. CompletableDeferred is a one-time signal: await suspends until complete is called. The second arrival releases both children. Both saved 0, so each writes 1 and the final output is 1.\n\nThis is a logical race across suspension points even on one thread. A JVM data race is a narrower problem involving conflicting memory accesses without the required synchronization; overlapping multithreaded increments can have that problem too.',
  ideas: [
    ['A stale decision', 'Checking a value and acting on it later leaves a window in which another task can change the state. The decision and update may need one protected operation.'],
    ['Ordering is a partial guarantee', 'join and await establish completion boundaries. They do not retroactively make conflicting updates atomic.'],
    ['Coordinate a reproduction', 'A signal or barrier can force the hazardous interleaving. Sleep durations are guesses, and a correct result in one run is not proof of safety.'],
    ['Repair the whole operation', 'Read the current value inside the same critical section as the update. Locking only a write of a stale snapshot still loses information.'],
  ], takeaway: 'Find the gap between observing state and changing it, then protect or remove that gap.',
  exploreIntro: 'Trace lost updates, stale writes under a lock, and a repair that reads fresh state.',
  examples: [
    { title: 'Two tasks use the same snapshot', code: raceProgram(false, '2'), output: '2', why: 'Both tasks read 0 before either writes. Two additions of 2 collapse into the same final value 2.', change: 'Use a rendezvous to make the lost update repeatable.' },
    { title: 'Read inside the protected update', code: raceProgram(true, '2'), output: '4', why: 'Each lock holder reads the current total. The second addition therefore starts from 2.', change: 'Keep the arrival signal but use a fresh read under the mutex.' },
    { title: 'A lock cannot refresh an old value', code: coroutine(`  var score = 5
  val old = score
  val mutex = Mutex()
  mutex.withLock { score += 3 }
  mutex.withLock { score = old + 2 }
  println(score)`, mutexImports), output: '7', why: 'The second protected block writes from old = 5 and discards the earlier addition of 3. Mutual exclusion does not make stale data current.', change: 'Keep both writes locked but move one read outside the lock.' },
    { title: 'Preserve each result separately', code: coroutine(`  val values = listOf(4, 6)
  val results = values.map { value ->
    async { value * 2 }
  }
  println(results.awaitAll().sum())`), output: '20', why: 'Each child returns its own value. Combining completed results removes the shared read–modify–write operation.', change: 'Replace the shared accumulator with returned values.' },
  ], predictIntro: 'Reason about explicit interleavings and distinguish a repair from an accidental successful run.',
  predictions: [
    { title: 'Controlled overwrite', code: jvm(`  var remaining = 3
  val a = remaining
  val b = remaining
  remaining = a - 1
  remaining = b - 1
  println(remaining)`), prompt: 'What does this explicit interleaving print?', answers: ['1', '2', '3', '0'], correct: 1, why: 'Both decrements use 3, so both writes store 2.', ref: 'a and b read before either write' },
    { title: 'Protected stale snapshot', code: coroutine(`  val lock = Mutex()
  var points = 10
  val old = points
  lock.withLock { points += 8 }
  lock.withLock { points = old + 4 }
  println(points)`, mutexImports), prompt: 'What is printed?', answers: ['22', '18', '10', '14'], correct: 3, why: 'old remains 10. Locking the assignment does not change the value used in it.', ref: 'points = old + 4' },
    { title: 'One event loop', prompt: 'Two coroutines on one thread each read a balance, suspend, then write a new balance. Can their logical updates conflict?', answers: ['Yes; suspension allows another coroutine to change the balance', 'No; coroutines are always atomic', 'No; one thread prevents every kind of race', 'Only when the balance is volatile'], correct: 0, why: 'Single-thread execution prevents simultaneous instructions but does not make a sequence spanning suspension indivisible.', ref: 'read, suspend, write' },
    { title: 'Evidence from a stress run', prompt: 'An unprotected counter produced the intended answer 100 times. What can you conclude?', answers: ['The code is thread-safe', 'The JVM made increment atomic', 'Those runs did not expose the bug; the update still needs reasoning or protection', 'More workers can never change the result'], correct: 2, why: 'Testing can expose an unsafe execution but cannot make an unsafe compound operation atomic.', ref: 'testing an interleaving' },
  ],
  write: {
    title: 'Preserve both deposits', goal: 'Two coordinated tasks each deposit amount. Keep the rendezvous and make the final total include both deposits.',
    steps: '1. Keep bothRead and the two child tasks.\n2. Inside mutex.withLock, add amount to the current total.\n3. Print the total after coroutineScope returns.',
    initial: raceProgram(false, '6'), solution: raceProgram(true, '6'), output: '12', swap: swap('amount', '6', '9', '18'),
  },
  debug: {
    title: 'Read the stock at reservation time', symptom: 'Two sequential reservations should leave 6 items, but the second reservation uses a snapshot from before the first.',
    broken: coroutine(`  var stock = 10
  val lock = Mutex()
  val before = stock
  lock.withLock { stock -= 3 }
  lock.withLock { stock = before - 1 }
  println(stock)`, mutexImports),
    fixed: coroutine(`  var stock = 10
  val lock = Mutex()
  lock.withLock { stock -= 3 }
  lock.withLock { stock -= 1 }
  println(stock)`, mutexImports), output: '6',
    hints: ['The lock protects execution, but inspect the value used for the second update.', 'before was captured before the first reservation.', 'Subtract 1 from the current stock inside the second withLock block.'],
    why: 'The second reservation now incorporates the first. This deterministic trace isolates the stale-read mistake without depending on a scheduler.',
  },
});

const reservations = (body: string) => `import kotlin.concurrent.thread

class Seats(initial: Int) {
  private val guard = Any()
  private var remaining = initial

  fun reserve(): Boolean = synchronized(guard) {
${body}
  }
}

fun main() {
  val capacity = 3
  val seats = Seats(capacity)
  val accepted = BooleanArray(5)
  val workers = List(5) { index ->
    thread { accepted[index] = seats.reserve() }
  }
  workers.forEach { it.join() }
  println(accepted.count { it })
}`;

export const SYNCHRONIZATION_LESSON = lesson({
  slug: 'synchronization', title: 'Synchronization',
  intro: 'On the JVM, synchronized(lock) lets one thread at a time enter a critical section guarded by the same object.',
  exampleTitle: 'Keep a condition and its update together', code: reservations(`    if (remaining > 0) {
      remaining--
      true
    } else {
      false
    }`),
  explanation: 'Every reserve call uses the same guard. Checking remaining and decrementing it happen while holding that monitor, so at most three calls succeed and the output is 3.\n\nThe last expression in the synchronized block becomes its result. A monitor is released when the block exits, including when an exception escapes. Waiting for a monitor blocks the competing JVM thread.',
  ideas: [
    ['Share the lock object', 'Two different Any() objects are two different locks. Construct the guard once for the shared state, not once per call.'],
    ['Protect the complete invariant', 'Keep read, condition, and update in one critical section. Readers that need a consistent view must follow the same protocol.'],
    ['Keep sections small', 'Do unrelated slow work before or after acquiring the monitor. Do not suspend while holding a JVM monitor; coroutine critical sections use Mutex.'],
    ['Monitors are reentrant', 'A thread can re-enter a monitor it already holds. This differs from coroutine Mutex, which is not reentrant.'],
  ], takeaway: 'Use one stable monitor for the complete check-and-update operation.',
  exploreIntro: 'Inspect lock identity, expression results, exception cleanup, and reentrant monitor access.',
  examples: [
    { title: 'The block returns a value', code: jvm(`  val guard = Any()
  var balance = 10
  val after = synchronized(guard) {
    balance -= 4
    balance
  }
  println(after)`), output: '6', why: 'The final balance expression is returned after the update while the guard is still held.', change: 'Return a consistent result directly from the critical section.' },
    { title: 'Different objects mean different monitors', code: jvm(`  val guard = Any()
  synchronized(Any()) {
    println(Thread.holdsLock(guard))
  }`), output: 'false', why: 'The new Any object is unrelated to guard. The code holds a monitor, but not the one protecting the shared resource.', change: 'Check the exact monitor held by the current thread.' },
    { title: 'An exception releases the monitor', code: jvm(`  val guard = Any()
  try {
    synchronized(guard) {
      error("reject")
    }
  } catch (e: IllegalStateException) {
    println(Thread.holdsLock(guard))
  }`), output: 'false', why: 'Leaving synchronized releases the monitor before control reaches catch.', change: 'Exit the critical section by throwing rather than returning normally.' },
    { title: 'One thread can re-enter', code: jvm(`  val guard = Any()
  synchronized(guard) {
    synchronized(guard) {
      println(Thread.holdsLock(guard))
    }
  }`), output: 'true', why: 'JVM monitors are reentrant. The nested entry by the same thread succeeds.', change: 'Acquire the same monitor twice on one thread.' },
  ], predictIntro: 'Identify which monitor protects the operation and when its returned value is computed.',
  predictions: [
    { title: 'Return from the block', code: jvm(`  val lock = Any()
  var items = 8
  val result = synchronized(lock) {
    items -= 2
    items * 3
  }
  println(result)`), prompt: 'What does this program print?', answers: ['18', '24', '6', '2'], correct: 0, why: 'items becomes 6, and the last expression returns 18.', ref: 'items * 3' },
    { title: 'Fresh guard per call', prompt: 'Each call to a shared counter creates val guard = Any() and synchronizes on it. Why does that fail to coordinate callers?', answers: ['Any cannot be used as a JVM monitor', 'synchronized never blocks', 'Each caller locks a different object', 'val makes a lock immutable and unusable'], correct: 2, why: 'Mutual exclusion only applies to competing entries on the same monitor.', ref: 'one Any per invocation' },
    { title: 'Check outside the lock', prompt: 'A caller checks seats > 0 before synchronized(guard), then decrements inside. Is the no-negative-seats invariant protected?', answers: ['Yes, because the write is inside', 'No; another caller can consume the last seat between check and decrement', 'Yes, provided seats is an Int', 'No; monitors never protect integers'], correct: 1, why: 'The condition can become stale before entering the section. Both steps must share the protection boundary.', ref: 'check then lock' },
    { title: 'Nested monitor', code: jvm(`  val lock = Any()
  synchronized(lock) {
    synchronized(lock) {
      println("inside")
    }
  }
  println("outside")`), prompt: 'What does this JVM program print?', answers: ['It deadlocks', 'outside only', 'It does not compile', 'inside\noutside'], correct: 3, why: 'The same thread can re-enter its monitor and then release both entries.', ref: 'nested synchronized(lock)' },
  ],
  write: {
    title: 'Reserve a limited seat pool', goal: 'Five workers compete for capacity seats. Make reserve return true only when it also consumes one available seat.',
    steps: '1. Inside the existing synchronized block, test whether remaining is positive.\n2. Decrement and return true on success; otherwise return false.\n3. Keep the final count after the joins.',
    initial: reservations(`    // Implement the atomic availability check and decrement.
    false`),
    solution: reservations(`    if (remaining > 0) {
      remaining--
      true
    } else {
      false
    }`), output: '3', swap: swap('capacity', '3', '2', '2'),
  },
  debug: {
    title: 'Use the resource guard', symptom: 'The assertion print should confirm that the resource guard is held, but it prints false.',
    broken: jvm(`  val resourceGuard = Any()
  synchronized(Any()) {
    println(Thread.holdsLock(resourceGuard))
  }`),
    fixed: jvm(`  val resourceGuard = Any()
  synchronized(resourceGuard) {
    println(Thread.holdsLock(resourceGuard))
  }`), output: 'true',
    hints: ['A monitor belongs to a particular object.', 'Compare the argument of synchronized with resourceGuard.', 'Pass resourceGuard to synchronized instead of constructing Any().'],
    why: 'The section now holds the exact monitor used by the resource protocol. Other callers must also use resourceGuard.',
  },
});

const mutexWrite = (update: string) => coroutine(`  val entries = listOf("red", "blue", "gold")
  val lock = Mutex()
  val saved = mutableListOf<String>()
  coroutineScope {
    entries.forEach { entry ->
      launch(Dispatchers.Default) {
        ${update}
      }
    }
  }
  println(saved.sorted().joinToString())`, mutexImports);

export const MUTEX_LESSON = lesson({
  slug: 'mutex', title: 'Mutex',
  intro: 'Use a coroutine Mutex to keep a shared update indivisible while allowing contending coroutines to suspend instead of blocking a thread.',
  exampleTitle: 'Protect a shared collection', code: mutexWrite('lock.withLock { saved.add(entry) }'),
  explanation: 'All workers use one Mutex around the list mutation. coroutineScope waits for them, then sorted produces a stable display order: blue, gold, red. The lock protects mutation, not insertion order.\n\nwithLock acquires the mutex and releases it when the block exits, even after an exception. lock() and unlock() are also available, but manual locking requires try/finally. Acquiring an already held Mutex suspends; the same coroutine cannot re-enter it.',
  ideas: [
    ['One mutex per state boundary', 'A new Mutex in each worker does not coordinate their access. Share the same instance among all operations on that state.'],
    ['tryLock is a decision', 'tryLock returns immediately: true means you acquired the lock and must release it; false means you must not access the protected state as its owner.'],
    ['isLocked is only an observation', 'Checking isLocked and then acting is not an atomic acquisition. Use lock, withLock or tryLock to acquire ownership.'],
    ['Cancellation and cleanup', 'A coroutine waiting in lock can be cancelled. Keep the protected region brief, avoid nested acquisition of the same mutex, and rely on withLock for release.'],
  ], takeaway: 'Use the same Mutex and withLock for the entire shared-state operation.',
  exploreIntro: 'Observe acquisition, release on failure, failed tryLock, and the value returned by withLock.',
  examples: [
    { title: 'Observe the lock boundary', code: coroutine(`  val mutex = Mutex()
  println(mutex.isLocked)
  mutex.withLock { println(mutex.isLocked) }
  println(mutex.isLocked)`, mutexImports), output: 'false\ntrue\nfalse', why: 'withLock owns the mutex only during its action and releases it afterward.', change: 'Inspect state before, inside, and after the critical section.' },
    { title: 'A second tryLock fails', code: coroutine(`  val mutex = Mutex()
  println(mutex.tryLock())
  println(mutex.tryLock())
  mutex.unlock()
  println(mutex.tryLock())
  mutex.unlock()`, mutexImports), output: 'true\nfalse\ntrue', why: 'Mutex is not reentrant. The failed second attempt acquired nothing; releasing the first acquisition makes the last attempt succeed.', change: 'Use immediate acquisition attempts instead of waiting.' },
    { title: 'Failure still releases', code: coroutine(`  val mutex = Mutex()
  try {
    mutex.withLock { error("failed") }
  } catch (e: IllegalStateException) {
    println(mutex.isLocked)
  }`, mutexImports), output: 'false', why: 'withLock releases in a finally path before the exception reaches catch.', change: 'Throw inside the protected action.' },
    { title: 'Return a consistent value', code: coroutine(`  val mutex = Mutex()
  var stock = 9
  val remaining = mutex.withLock {
    stock -= 2
    stock
  }
  println(remaining)`, mutexImports), output: '7', why: 'The last expression is evaluated while the lock is held, so the result belongs to this update.', change: 'Use withLock as an expression.' },
    { title: 'Cancel a waiting acquisition', code: coroutine(`  val mutex = Mutex()
  mutex.lock()
  val waiter = launch(start = CoroutineStart.UNDISPATCHED) {
    mutex.withLock { println("entered") }
  }
  waiter.cancelAndJoin()
  mutex.unlock()
  println(waiter.isCancelled)`, mutexImports), output: 'true', why: 'UNDISPATCHED begins immediately until the first suspension, so the child reaches the held mutex. Cancellation stops the waiter before it can enter.', change: 'Cancel a coroutine that is waiting for the lock.' },
  ], predictIntro: 'Track who acquired the mutex and whether an action runs before release or cancellation.',
  predictions: [
    { title: 'Try while held', code: coroutine(`  val lock = Mutex()
  lock.withLock {
    println(lock.tryLock())
  }
  println(lock.isLocked)`, mutexImports), prompt: 'What is printed?', answers: ['true\nfalse', 'false\ntrue', 'false\nfalse', 'It hangs'], correct: 2, why: 'tryLock fails immediately inside the held mutex. withLock releases its original acquisition before the final print.', ref: 'tryLock inside withLock' },
    { title: 'Returned value', code: coroutine(`  val lock = Mutex()
  val value = lock.withLock { 3 + 8 }
  println(value)`, mutexImports), prompt: 'What is printed?', answers: ['11', 'Unit', 'true', '3'], correct: 0, why: 'withLock returns the action result, here 11.', ref: 'withLock result' },
    { title: 'An observation is not ownership', prompt: 'Why is if (!mutex.isLocked) followed by an unprotected write unsafe?', answers: ['isLocked always returns true', 'Mutex can only protect lists', 'The check automatically unlocks the mutex', 'Another task may acquire the lock after the check; this code never acquires it'], correct: 3, why: 'State observation does not reserve the critical section.', ref: 'check versus acquire' },
    { title: 'Manual cleanup', prompt: 'After a successful mutex.lock(), where should mutex.unlock() go if the protected code can throw?', answers: ['Only after the try block', 'In a finally block, or use withLock', 'Inside the catch block only', 'It is unnecessary after a failure'], correct: 1, why: 'finally runs on both success and failure. withLock packages that cleanup pattern.', ref: 'lock / try / finally / unlock' },
    { title: 'Two independent mutexes', prompt: 'Each child creates its own Mutex and locks it before appending to the same mutable list. Are the appends mutually exclusive?', answers: ['No; the children must share the same mutex', 'Yes; all Mutex instances use one global lock', 'Yes; mutable lists acquire every mutex automatically', 'Only if the list is declared val'], correct: 0, why: 'Different mutex instances have unrelated ownership states.', ref: 'shared lock identity' },
  ],
  write: {
    title: 'Save concurrent labels safely', goal: 'Launch a child per entry and protect every append with the shared mutex. Print sorted labels after all children finish.',
    steps: '1. Inside each child, append entry within lock.withLock.\n2. Preserve coroutineScope and the sorted final display.',
    initial: mutexWrite('// Append entry under the shared mutex.'), solution: mutexWrite('lock.withLock { saved.add(entry) }'), output: 'blue, gold, red', swap: swap('entries', 'listOf("red", "blue", "gold")', 'listOf("pear", "apple")', 'apple, pear'),
  },
  debug: {
    title: 'Release after rejected work', symptom: 'After a rejected request, another request must be able to acquire the mutex. The final attempt currently fails.',
    broken: coroutine(`  val guard = Mutex()
  try {
    guard.lock()
    error("rejected")
    guard.unlock()
  } catch (e: IllegalStateException) {
    println("recovered")
  }
  val acquired = guard.tryLock()
  println(acquired)
  if (acquired) guard.unlock()`, mutexImports),
    fixed: coroutine(`  val guard = Mutex()
  try {
    guard.withLock { error("rejected") }
  } catch (e: IllegalStateException) {
    println("recovered")
  }
  val acquired = guard.tryLock()
  println(acquired)
  if (acquired) guard.unlock()`, mutexImports), output: 'recovered\ntrue',
    hints: ['Trace whether execution reaches the original unlock.', 'The exception skips statements after error().', 'Use guard.withLock around the failing work so release occurs on every exit.'],
    why: 'The original manual release was unreachable after the throw. withLock restores availability before recovery continues.',
  },
});

const atomicReserve = (body: string) => `${atomicImport}

fun takeOne(stock: AtomicInteger): Boolean {
${body}
}

${jvm(`  val available = 3
  val stock = AtomicInteger(available)
  var accepted = 0
  repeat(5) {
    if (takeOne(stock)) accepted++
  }
  println(accepted)
  println(stock.get())`)}`;

export const ATOMIC_OPERATIONS_LESSON = lesson({
  slug: 'atomic-operations', title: 'Atomic operations',
  intro: 'Use an atomic counter when one integer is the whole shared invariant. Learn the returned values and conditional updates precisely.',
  exampleTitle: 'Reserve only if the observed value is still current',
  code: jvm(`  val stock = AtomicInteger(2)
  println(stock.compareAndSet(2, 1))
  println(stock.compareAndSet(2, 0))
  println(stock.get())`, atomicImport),
  explanation: 'compareAndSet(expected, next) changes the value only when it still equals expected. The first call succeeds and stores 1. The second expected value is stale, so it returns false without changing 1.\n\nA conditional update can retry after a failed comparison: read again, reconsider the condition, then try to replace that newly observed value. This protects one atomic variable; it does not combine several objects into a transaction.',
  ideas: [
    ['Old and new values', 'getAndIncrement returns the old value. incrementAndGet returns the new value. getAndAdd and addAndGet follow the same naming rule.'],
    ['A read is not a reservation', 'get followed by set leaves a gap. Prefer a matching atomic operation or a compare-and-set retry loop.'],
    ['Retryable functions', 'updateAndGet can invoke its transformation again under contention. Keep that transformation free of external side effects such as sending messages.'],
    ['Scope of the guarantee', 'AtomicInteger is a JVM integer tool. A relationship across several fields usually needs a larger synchronization boundary or a different state design.'],
  ], takeaway: 'Match the atomic operation to the update, and distinguish the value before an update from the value after it.',
  exploreIntro: 'Compare old/new return values, successful and failed comparisons, and conditional retries.',
  examples: [
    { title: 'Old value versus new value', code: jvm(`  val ticket = AtomicInteger(10)
  println(ticket.getAndIncrement())
  println(ticket.incrementAndGet())
  println(ticket.get())`, atomicImport), output: '10\n12\n12', why: 'The first call returns 10 and stores 11. The second stores and returns 12.', change: 'Read both variants of the increment API.' },
    { title: 'Add and replace', code: jvm(`  val score = AtomicInteger(4)
  println(score.getAndAdd(3))
  println(score.addAndGet(2))
  println(score.getAndSet(0))
  println(score.get())`, atomicImport), output: '4\n9\n9\n0', why: 'getAndAdd returns the old 4; addAndGet reaches 9; getAndSet returns 9 while replacing it with 0.', change: 'Use compound additions and an exchange operation.' },
    { title: 'Conditional replacement can fail', code: jvm(`  val count = AtomicInteger(7)
  println(count.compareAndSet(6, 20))
  println(count.compareAndSet(7, 8))
  println(count.get())`, atomicImport), output: 'false\ntrue\n8', why: 'A failed comparison leaves the value unchanged. The second expected value matches.', change: 'Compare against the wrong value before the right one.' },
    { title: 'Compute an updated value', code: jvm(`  val value = AtomicInteger(3)
  println(value.updateAndGet { current -> current * 2 })
  println(value.get())`, atomicImport), output: '6\n6', why: 'The transformation produces the new value. It has no external side effect, so retrying it under contention is safe.', change: 'Express a pure transformation of one atomic value.' },
    { title: 'Stop at zero', code: atomicReserve(`  while (true) {
    val current = stock.get()
    if (current == 0) return false
    if (stock.compareAndSet(current, current - 1)) return true
  }`), output: '3\n0', why: 'The function rechecks after a failed comparison and never subtracts from zero. Five requests consume only three available units.', change: 'Combine a condition and replacement in a retry loop.' },
  ], predictIntro: 'Calculate atomic return values and identify which functions may be retried.',
  predictions: [
    { title: 'Post-increment value', code: jvm(`  val n = AtomicInteger(8)
  println(n.getAndIncrement())
  println(n.get())`, atomicImport), prompt: 'What is printed?', answers: ['9\n9', '8\n8', '8\n9', '9\n8'], correct: 2, why: 'getAndIncrement returns the previous value and then leaves 9 stored.', ref: 'getAndIncrement' },
    { title: 'Stale expected value', code: jvm(`  val n = AtomicInteger(4)
  n.incrementAndGet()
  println(n.compareAndSet(4, 99))
  println(n.get())`, atomicImport), prompt: 'What is printed?', answers: ['true\n99', 'false\n4', 'true\n5', 'false\n5'], correct: 3, why: 'The increment has already changed the value to 5, so comparison with 4 fails.', ref: 'compareAndSet(4, 99)' },
    { title: 'Safe retry body', prompt: 'Which updateAndGet body is safe to retry without duplicating an external action?', answers: ['current -> current + 2', 'current -> sendEmail(); current + 2', 'current -> chargeCard(); current + 2', 'current -> appendAuditRecord(); current + 2'], correct: 0, why: 'A pure transformation can be evaluated again. External effects may happen more than once if placed inside a retryable function.', ref: 'updateAndGet' },
    { title: 'Two calls are not one operation', code: jvm(`  val n = AtomicInteger(2)
  val observed = n.get()
  n.incrementAndGet()
  n.set(observed + 5)
  println(n.get())`, atomicImport), prompt: 'What does this explicit sequence print?', answers: ['8', '7', '3', '5'], correct: 1, why: 'set uses the stale observed value 2 and replaces the intervening 3 with 7.', ref: 'set(observed + 5)' },
  ],
  write: {
    title: 'Reserve an atomic stock unit', goal: 'Complete takeOne so each successful request consumes one unit and no request makes stock negative.',
    steps: '1. Read stock and return false when it is zero.\n2. Try compareAndSet to subtract one. Return true on success; retry with a fresh read otherwise.',
    initial: atomicReserve(`  // Implement a conditional atomic decrement.
  return false`),
    solution: atomicReserve(`  while (true) {
    val current = stock.get()
    if (current == 0) return false
    if (stock.compareAndSet(current, current - 1)) return true
  }`), output: '3\n0', swap: swap('available', '3', '2', '2\n0'),
  },
  debug: {
    title: 'Issue the next ticket number', symptom: 'The stored value is the last issued ticket. The next two issued tickets should be 41 and 42.',
    broken: jvm(`  val lastIssued = AtomicInteger(40)
  println(lastIssued.getAndIncrement())
  println(lastIssued.getAndIncrement())`, atomicImport),
    fixed: jvm(`  val lastIssued = AtomicInteger(40)
  println(lastIssued.incrementAndGet())
  println(lastIssued.incrementAndGet())`, atomicImport), output: '41\n42',
    hints: ['The increment happens, but which value is returned?', 'getAndIncrement returns the number before the change.', 'Use incrementAndGet for both newly issued numbers.'],
    why: 'The state represents the last issued ticket, so the desired result is the value after incrementing.',
  },
});

const ownerImports = 'import java.util.concurrent.Executors';
const confined = (body: string) => coroutine(`  Executors.newSingleThreadExecutor { task ->
    Thread(task, "state-owner")
  }.asCoroutineDispatcher().use { owner ->
${body}
  }`, ownerImports);

export const THREAD_CONFINEMENT_LESSON = lesson({
  slug: 'thread-confinement', title: 'Thread confinement',
  intro: 'Give mutable state one execution owner. Every operation on that state must go through the owner, including reads that need a consistent view.',
  exampleTitle: 'Update and inspect on the owner thread',
  code: confined(`    var count = 0
    withContext(owner) {
      repeat(3) { count++ }
      println(Thread.currentThread().name)
      println(count)
    }`),
  explanation: 'The executor owns one JVM thread named state-owner. asCoroutineDispatcher lets coroutines use it. withContext(owner) executes the state operation there and waits for its result. use closes this owned dispatcher after the work finishes.\n\nConfinement is a protocol: another caller can still break it by touching the variable elsewhere. Moving an entire small transaction to the owner is usually clearer than switching for every individual read and write.',
  ideas: [
    ['One owner for all access', 'Route both mutations and related reads through the same owner. UI state often follows a similar rule with the platform’s UI dispatcher.'],
    ['A thread is not a transaction', 'Two owner coroutines can interleave when one suspends. Keep read–check–write together without suspension, or add a mutex for a transaction spanning suspension.'],
    ['Own the dispatcher lifetime', 'Close a dispatcher created from your own executor after its work completes. Do not close shared dispatchers such as Default.'],
    ['One-at-a-time is not a fixed thread', 'A dispatcher view limited to one parallel task can serialize execution without promising a particular physical thread. ThreadLocal-based APIs need actual thread affinity.'],
  ], takeaway: 'Confinement works when every relevant access follows one owner and each transaction respects suspension boundaries.',
  exploreIntro: 'Move work to a named owner, return snapshots, close owned resources, and examine a suspension gap.',
  examples: [
    { title: 'Return a snapshot from the owner', code: confined(`    val stock = mutableListOf(2, 5)
    val total = withContext(owner) {
      stock.add(3)
      stock.sum()
    }
    println(total)`), output: '10', why: 'The mutation and sum run together on the owner. The caller receives a value after withContext completes.', change: 'Return an immutable result instead of exposing mutable storage.' },
    { title: 'Several requests, one owner', code: confined(`    var count = 0
    coroutineScope {
      repeat(4) {
        launch {
          withContext(owner) { count++ }
        }
      }
    }
    println(withContext(owner) { count })`), output: '4', why: 'Each increment is a non-suspending operation on the owner. The final read uses the same owner after all requests complete.', change: 'Submit separate requests to the same owner.' },
    { title: 'Group a related operation', code: confined(`    var balance = 12
    val receipt = withContext(owner) {
      balance -= 5
      "remaining=" + balance
    }
    println(receipt)`), output: 'remaining=7', why: 'The update and receipt are one non-suspending piece of work, so the receipt describes that transaction.', change: 'Move a full transaction into one context switch.' },
    { title: 'Suspension still allows a stale read', code: confined(`    withContext(owner) {
      var value = 0
      val firstRead = CompletableDeferred<Unit>()
      val updated = CompletableDeferred<Unit>()
      coroutineScope {
        launch {
          val old = value
          firstRead.complete(Unit)
          updated.await()
          value = old + 1
        }
        launch {
          firstRead.await()
          value += 5
          updated.complete(Unit)
        }
      }
      println(value)
    }`), output: '1', why: 'The first child suspends after saving 0. The second changes value to 5, then the first resumes and overwrites it with 1. One thread does not make a suspending transaction atomic.', change: 'Put a coordinated suspension between a read and its write.' },
  ], predictIntro: 'Check ownership, dispatcher lifetime, and whether a transaction crosses a suspension point.',
  predictions: [
    { title: 'Owner result', code: confined(`    var size = 2
    val answer = withContext(owner) {
      size += 6
      size
    }
    println(answer)`), prompt: 'What is printed?', answers: ['2', '6', '0', '8'], correct: 3, why: 'withContext waits for the block and returns its last expression.', ref: 'withContext(owner)' },
    { title: 'Outside read', prompt: 'All mutations use the owner dispatcher, but callers read the mutable list on arbitrary threads while mutations continue. Is the confinement protocol complete?', answers: ['Yes, reads cannot conflict', 'No; those reads bypass the owner', 'Yes, if the reference is val', 'No, because confinement requires two threads'], correct: 1, why: 'Concurrent reads also need a consistent access protocol. Return snapshots through the owner.', ref: 'all access follows ownership' },
    { title: 'Suspending transaction', prompt: 'On one owner thread a coroutine reads a balance, awaits a signal, then writes from that saved balance. What remains possible?', answers: ['Another coroutine updates the balance during the suspension', 'The thread splits into two threads', 'The saved local variable changes automatically', 'withContext makes the whole block atomic'], correct: 0, why: 'Ownership restricts execution location, not interleaving at suspension points.', ref: 'read / await / write' },
    { title: 'Close what you own', prompt: 'A function creates an executor-backed dispatcher for a bounded batch. What should it do after all owned work completes?', answers: ['Close Dispatchers.Default', 'Leave the executor running forever', 'Close its own dispatcher, for example with use', 'Cancel every coroutine in the application'], correct: 2, why: 'The created executor consumes resources and belongs to this function’s lifetime.', ref: 'asCoroutineDispatcher().use' },
  ],
  write: {
    title: 'Process inventory on one owner', goal: 'Apply all deliveries on the owner dispatcher and return the final inventory count to the caller.',
    steps: '1. Inside withContext(owner), add each delivery to inventory.\n2. Return inventory and print that returned value.\n3. Keep use so the owned dispatcher is closed.',
    initial: confined(`    val deliveries = listOf(2, 4, 1)
    var inventory = 10
    val finalCount = withContext(owner) {
      // Apply deliveries here.
      inventory
    }
    println(finalCount)`),
    solution: confined(`    val deliveries = listOf(2, 4, 1)
    var inventory = 10
    val finalCount = withContext(owner) {
      deliveries.forEach { inventory += it }
      inventory
    }
    println(finalCount)`), output: '17', swap: swap('deliveries', 'listOf(2, 4, 1)', 'listOf(3, 5)', '18'),
  },
  debug: {
    title: 'Route the access through its owner', symptom: 'The ownership assertion must print true. This access runs on the caller instead of state-owner.',
    broken: confined(`    val onOwner = Thread.currentThread().name == "state-owner"
    println(onOwner)`),
    fixed: confined(`    val onOwner = withContext(owner) {
      Thread.currentThread().name == "state-owner"
    }
    println(onOwner)`), output: 'true',
    hints: ['Constructing a dispatcher does not move the current coroutine.', 'Look for the boundary that selects the dispatcher for this operation.', 'Compute onOwner inside withContext(owner).'],
    why: 'The operation is now dispatched to the named owner, and the caller receives its Boolean result after completion.',
  },
});

export const COROUTINE_CONCURRENCY_LESSON = lesson({
  slug: 'coroutine-concurrency', title: 'Coroutine concurrency',
  intro: 'Start related operations before awaiting their results, and keep them inside a scope that owns their lifetime.',
  exampleTitle: 'Start two computations and combine their results',
  code: coroutine(`  val answer = coroutineScope {
    val first = async { 8 * 2 }
    val second = async { 7 * 3 }
    first.await() + second.await()
  }
  println(answer)`),
  explanation: 'Both async calls create children before either result is awaited. await suspends until its Deferred has a result. coroutineScope owns both children and returns 37 only after its work completes.\n\nConcurrency means tasks can have overlapping lifetimes. Parallel execution requires execution resources such as a multithreaded dispatcher; using async alone does not guarantee two CPU operations run simultaneously.',
  ideas: [
    ['Launch versus async', 'launch returns a Job for completion and cancellation. async returns a Deferred that also supplies a result through await.'],
    ['Start before waiting', 'async { a() }.await() followed by async { b() }.await() waits for a before creating b. Create both Deferred values first when the operations are independent.'],
    ['Shared state still needs protection', 'Dispatchers.Default can run children on different threads. Coroutine syntax does not make a shared mutable list or counter safe.'],
    ['Completion is owned', 'coroutineScope waits for children; an ordinary child failure fails that scope and cancels siblings. Catch failures outside the scope when recovering the operation.'],
  ], takeaway: 'Use owned children and explicit results; choose a dispatcher separately from how you manage task lifetime.',
  exploreIntro: 'Compare launch, async, lazy start, sibling communication, and scope failure.',
  examples: [
    { title: 'Join waits but returns no result', code: coroutine(`  var ready = false
  val job = launch { ready = true }
  job.join()
  println(ready)`), output: 'true', why: 'join waits for the side effect. A Job does not contain a computed Int or String result.', change: 'Use launch for a completion-only task.' },
    { title: 'Await values in a different order', code: coroutine(`  val a = async { "north" }
  val b = async { "south" }
  println(b.await() + "/" + a.await())`), output: 'south/north', why: 'The expression chooses output order independently of completion order.', change: 'Combine returned values explicitly.' },
    { title: 'A child can wait for a sibling', code: coroutine(`  val signal = CompletableDeferred<Int>()
  val consumer = async { signal.await() * 2 }
  val producer = launch { signal.complete(9) }
  println(consumer.await())
  producer.join()`), output: '18', why: 'The consumer suspends at await, leaving the thread able to run the producer. This demonstrates concurrency without requiring parallel CPU execution.', change: 'Coordinate two children through a one-time value.' },
    { title: 'Lazy async starts when awaited', code: coroutine(`  val value = async(start = CoroutineStart.LAZY) {
    println("work")
    5
  }
  println("created")
  println(value.await())`), output: 'created\nwork\n5', why: 'LAZY delays the child’s start. await starts it and waits for the result.', change: 'Separate Deferred creation from execution.' },
    { title: 'Catch failure outside the owned scope', code: coroutine(`  try {
    coroutineScope {
      async<Int> { error("offline") }.await()
    }
  } catch (e: IllegalStateException) {
    println("unavailable")
  }`), output: 'unavailable', why: 'The failure leaves the child scope and reaches the enclosing recovery block. No successful value is returned.', change: 'Make a child fail instead of producing a value.' },
  ], predictIntro: 'Reason about result order, lazy execution, and where an owned operation completes.',
  predictions: [
    { title: 'Deferred arithmetic', code: coroutine(`  val a = async { 9 }
  val b = async { 4 }
  println(a.await() - b.await())`), prompt: 'What is printed?', answers: ['13', '5', '-5', 'It depends on completion order'], correct: 1, why: 'The arithmetic operands are explicit. Completion order cannot swap them.', ref: 'a.await() - b.await()' },
    { title: 'Scope completion', code: coroutine(`  var label = "old"
  coroutineScope {
    launch { label = "new" }
  }
  println(label)`), prompt: 'What is printed?', answers: ['old', 'Either value', 'Nothing', 'new'], correct: 3, why: 'The child belongs to coroutineScope, which waits for it before returning.', ref: 'coroutineScope child' },
    { title: 'Sequential start pattern', prompt: 'What happens with val a = async { loadA() }.await() followed by val b = async { loadB() }.await()?', answers: ['loadB is created only after loadA finishes', 'Both are started before loadA finishes', 'Both automatically use a new thread', 'The code cannot compile'], correct: 0, why: 'Evaluation waits at the first await before reaching the second async call.', ref: 'await before second async' },
    { title: 'Lazy child order', code: coroutine(`  val n = async(start = CoroutineStart.LAZY) {
    println("begin")
    12
  }
  println("before")
  println(n.await())`), prompt: 'What is printed?', answers: ['begin\nbefore\n12', 'before\n12\nbegin', 'before\nbegin\n12', 'before only'], correct: 2, why: 'The child is dormant until await starts it.', ref: 'CoroutineStart.LAZY' },
    { title: 'Parallel dispatcher', prompt: 'Two async children both use Dispatchers.Default and update the same ordinary mutable list. What is required?', answers: ['Nothing; async makes collections safe', 'A shared access protocol or separate result values', 'Only await on one child', 'Declare the list reference val'], correct: 1, why: 'Default may execute children on different threads. Awaiting later does not protect overlapping writes.', ref: 'Default and shared mutable list' },
  ],
  write: {
    title: 'Combine independent quote parts', goal: 'Start subtotal and shipping computations as two async children, then return their combined quote.',
    steps: '1. Create both Deferred values before awaiting either.\n2. Compute base * 3 and base + 2 in the children.\n3. Await both and print their sum.',
    initial: coroutine(`  val base = 6
  // Create and await the two quote computations.
  println(0)`),
    solution: coroutine(`  val base = 6
  val subtotal = async { base * 3 }
  val shipping = async { base + 2 }
  println(subtotal.await() + shipping.await())`), output: '26', swap: swap('base', '6', '4', '18'),
  },
  debug: {
    title: 'Include the second result', symptom: 'The two sensors report 13 and 8. The displayed total should include both reports.',
    broken: coroutine(`  val indoor = async { 13 }
  val outdoor = async { 8 }
  outdoor.await()
  println(indoor.await())`),
    fixed: coroutine(`  val indoor = async { 13 }
  val outdoor = async { 8 }
  println(indoor.await() + outdoor.await())`), output: '21',
    hints: ['Waiting for a result does not automatically add it to another result.', 'The first await discards its returned Int.', 'Use both awaited values in the addition.'],
    why: 'await both waits and returns a value. The repair consumes both returned sensor readings.',
  },
});

const mapImport = 'import java.util.concurrent.ConcurrentHashMap';
const channelImport = 'import kotlinx.coroutines.channels.Channel';
const channelTask = (body: string) => coroutine(`  val readings = listOf(3, 7, 2)
  val messages = Channel<Int>()
  val total = async {
    var sum = 0
    for (value in messages) {
      ${body}
    }
    sum
  }
  coroutineScope {
    readings.forEach { value ->
      launch { messages.send(value) }
    }
  }
  messages.close()
  println(total.await())`, channelImport);

export const CONCURRENT_ACCESS_PATTERNS_LESSON = lesson({
  slug: 'concurrent-access-patterns', title: 'Concurrent access patterns',
  intro: 'Choose a design based on who owns the state and which operation must stay indivisible: a scalar update, one map entry, a group of fields, or a stream of messages.',
  exampleTitle: 'One receiver owns the accumulator', code: channelTask('sum += value'),
  explanation: 'Producers send Int values through a Channel. Only the receiver changes sum, so producers never compete to write it. Closing the channel after all sends finish lets the receiver loop end and return 12.\n\nA channel transfers values; it does not make mutable objects sent through it immutable. Decide whether the sender relinquishes ownership or sends a copy. For a shared map, use an operation such as merge that combines one entry’s read and update.',
  ideas: [
    ['Match the state shape', 'An atomic scalar suits a simple count. A mutex can protect related fields. One receiver can own a complex state machine. Independent computations can return immutable results.'],
    ['Map operations have a scope', 'ConcurrentHashMap.merge coordinates an update for one key. A sequence of operations across keys is not automatically one transaction.'],
    ['A channel has a lifecycle', 'A receiver using for(value in channel) stops after the channel is closed and buffered values are consumed. Close only after producers have finished sending.'],
    ['Bound the work', 'A rendezvous channel suspends senders until a receiver accepts values. Buffering can absorb bursts, but unbounded buffering can grow memory without bound.'],
  ], takeaway: 'Choose an ownership and update pattern that matches the invariant, including how work finishes.',
  exploreIntro: 'Compare map merge, one-owner message processing, immutable snapshots, and buffered delivery.',
  examples: [
    { title: 'Merge one map entry', code: jvm(`  val visits = ConcurrentHashMap<String, Int>()
  visits.merge("home", 1) { old, added -> old + added }
  visits.merge("home", 1) { old, added -> old + added }
  println(visits["home"])`, mapImport), output: '2', why: 'The first merge inserts 1; the next atomically combines the existing entry with 1.', change: 'Use a compound map operation instead of get followed by put.' },
    { title: 'Receiver owns the sum', code: channelTask('sum += value'), output: '12', why: 'The receiver processes all messages before its loop ends. Only it mutates sum.', change: 'Replace competing accumulator writers with producer messages.' },
    { title: 'Copy while holding the mutex', code: coroutine(`  val mutex = Mutex()
  val current = mutableListOf("A")
  val snapshot = mutex.withLock { current.toList() }
  mutex.withLock { current.add("B") }
  println(snapshot.joinToString())`, mutexImports), output: 'A', why: 'Copying membership inside the protection boundary produces a stable snapshot. The later protected addition changes only current.', change: 'Expose a value snapshot instead of a shared mutable reference.' },
    { title: 'Close after a buffered send', code: coroutine(`  val channel = Channel<Int>(2)
  channel.send(5)
  channel.send(9)
  channel.close()
  for (value in channel) {
    println(value)
  }`, channelImport), output: '5\n9', why: 'The capacity holds both values without a receiver. Closing does not discard the buffered values; iteration drains them in send order.', change: 'Use a finite buffer and then finish the stream.' },
  ], predictIntro: 'Choose the right atomic boundary and trace how producers and consumers complete.',
  predictions: [
    { title: 'Merge an existing key', code: jvm(`  val counts = ConcurrentHashMap<String, Int>()
  counts["ok"] = 4
  counts.merge("ok", 3) { a, b -> a + b }
  println(counts["ok"])`, mapImport), prompt: 'What is printed?', answers: ['3', '4', '7', 'null'], correct: 2, why: 'merge combines the old 4 and supplied 3 for the existing key.', ref: 'merge("ok", 3)' },
    { title: 'Rendezvous buffer', prompt: 'A default Channel<Int>() has no receiver yet. What happens when a coroutine calls send(1)?', answers: ['It suspends until a receiver can accept the value, unless cancelled or the channel closes', 'The value is always dropped', 'The channel creates an unlimited buffer', 'send blocks every coroutine on the thread'], correct: 0, why: 'The default rendezvous channel synchronizes a send with a receive using suspension.', ref: 'Channel<Int>()' },
    { title: 'Who closes the stream?', prompt: 'Several child producers send into one channel. When should their owner close it for a receiver loop?', answers: ['Before launching the producers', 'After the first producer finishes', 'Never', 'After all producers have finished sending'], correct: 3, why: 'Closing early can reject later sends. Closing after production allows the receiver to terminate after consuming messages.', ref: 'producer lifetime' },
    { title: 'Two-key invariant', prompt: 'A shared map contains debit and credit entries. Does two separate merge calls guarantee that a reader cannot observe the state between them?', answers: ['Yes, because both are map methods', 'No; a wider transaction boundary is needed for that invariant', 'Yes, if both keys are strings', 'Only if the map is empty'], correct: 1, why: 'Per-entry operations do not create a multi-entry transaction.', ref: 'scope of merge' },
  ],
  write: {
    title: 'Total readings through one receiver', goal: 'Keep sum owned by the receiver and combine every reading sent by the producer children.',
    steps: '1. Add each received value to sum inside the receiver loop.\n2. Preserve the producer scope, channel close, and final await.',
    initial: channelTask('// Add this received value to the receiver-owned sum.'), solution: channelTask('sum += value'), output: '12', swap: swap('readings', 'listOf(3, 7, 2)', 'listOf(4, 9)', '13'),
  },
  debug: {
    title: 'Count repeated page visits', symptom: 'Three visits to docs should produce a count of 3. Each visit currently overwrites the entry with 1.',
    broken: jvm(`  val visits = ConcurrentHashMap<String, Int>()
  repeat(3) {
    visits["docs"] = 1
  }
  println(visits["docs"])`, mapImport),
    fixed: jvm(`  val visits = ConcurrentHashMap<String, Int>()
  repeat(3) {
    visits.merge("docs", 1) { old, added -> old + added }
  }
  println(visits["docs"])`, mapImport), output: '3',
    hints: ['A thread-safe assignment still performs the assignment you requested.', 'The existing count is never included.', 'Use merge to insert 1 or atomically add 1 to the existing count.'],
    why: 'The repair expresses accumulation as one map operation. A separate get and put would still leave a concurrent update gap.',
  },
});

const orderedLocks = (ordered: boolean, run = true) => `import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread

class Resource(val id: Int) {
  val lock = ReentrantLock()
}

fun withBoth(a: Resource, b: Resource, action: () -> Unit) {
  require(a.id != b.id)
  val ordered = ${ordered ? 'listOf(a, b).sortedBy { it.id }' : 'listOf(a, b)'}
  ordered[0].lock.lock()
  try {
    ordered[1].lock.lock()
    try {
      action()
    } finally {
      ordered[1].lock.unlock()
    }
  } finally {
    ordered[0].lock.unlock()
  }
}

${jvm(run ? `  val rounds = 6
  val first = Resource(1)
  val second = Resource(2)
  var completed = 0
  val a = thread {
    repeat(rounds) { withBoth(first, second) { completed++ } }
  }
  val b = thread {
    repeat(rounds) { withBoth(second, first) { completed++ } }
  }
  a.join()
  b.join()
  println(completed)` : `  val rounds = 6
  // Finish the ordering rule in withBoth, then run two workers using opposite argument orders.
  println(0)`)}`;

export const DEADLOCK_CONCEPTS_LESSON = lesson({
  slug: 'deadlock-concepts', title: 'Deadlock concepts',
  intro: 'A deadlock is a cycle of tasks waiting for resources that cannot be released until those same tasks make progress.',
  exampleTitle: 'Try a non-reentrant acquisition without hanging',
  code: coroutine(`  val lock = Mutex()
  lock.withLock {
    println(lock.tryLock())
  }
  println("finished")`, mutexImports),
  explanation: 'tryLock prints false because the Mutex is already held. A suspending lock() here would wait for a release that this same coroutine cannot reach while waiting. tryLock lets us inspect the problem without hanging.\n\nA two-task cycle can happen when A holds lock 1 and waits for lock 2 while B holds lock 2 and waits for lock 1. Requiring every operation to acquire distinct locks in one consistent order removes that cycle for those locks.',
  ideas: [
    ['Draw the dependency', 'Write down what each task holds and what it waits for. A cycle explains why waiting longer cannot make those tasks release their resources.'],
    ['Use a stable order', 'Assign distinct resource IDs and acquire locks by ID, regardless of the order arguments arrive. All callers must follow the same rule.'],
    ['Release on every exit', 'Use withLock or try/finally. A thrown exception must not leave resources permanently held.'],
    ['Avoid waiting for a child while holding its lock', 'If a parent holds a mutex and joins a child that needs it, the parent and child depend on each other. Move the wait outside the critical section.'],
    ['Other forms of no progress', 'Starvation means a task repeatedly loses opportunities while others progress. Livelock means tasks keep reacting without useful progress. Neither requires a stable deadlock cycle.'],
  ], takeaway: 'Prevent cycles with consistent ownership and lock order, and release resources on every exit.',
  exploreIntro: 'Compare non-reentrant mutexes, ordered resource acquisition, cleanup, and reentrant JVM locks.',
  examples: [
    { title: 'A consistent order for reversed inputs', code: jvm(`  val from = listOf(9, 2).sorted()
  val to = listOf(2, 9).sorted()
  println(from.joinToString())
  println(to.joinToString())`), output: '2, 9\n2, 9', why: 'Both operations choose resource 2 before 9. The same ordering rule must be applied when actually acquiring the locks.', change: 'Sort stable resource IDs before taking locks.' },
    { title: 'Opposite requests, same lock order', code: orderedLocks(true), output: '12', why: 'Although the workers pass arguments in opposite orders, withBoth sorts the resources. They never hold the higher lock while waiting for the lower one.', change: 'Apply the ordering rule to real JVM locks and two worker threads.' },
    { title: 'Release a JVM lock after failure', code: jvm(`  val lock = ReentrantLock()
  try {
    lock.lock()
    try {
      error("stop")
    } finally {
      lock.unlock()
    }
  } catch (e: IllegalStateException) {
    println(lock.isLocked)
  }`, 'import java.util.concurrent.locks.ReentrantLock'), output: 'false', why: 'The finally block releases the acquisition before recovery. Manual locks do not release merely because an exception was thrown.', change: 'Pair a manual lock with explicit cleanup.' },
    { title: 'Reentrant locks count acquisitions', code: jvm(`  val lock = ReentrantLock()
  lock.lock()
  lock.lock()
  println(lock.holdCount)
  lock.unlock()
  println(lock.isLocked)
  lock.unlock()
  println(lock.isLocked)`, 'import java.util.concurrent.locks.ReentrantLock'), output: '2\ntrue\nfalse', why: 'This JVM lock permits re-entry and requires a matching release per acquisition. Coroutine Mutex has different non-reentrant behavior.', change: 'Contrast reentrant JVM locking with Mutex.' },
  ], predictIntro: 'Find wait cycles, check resource ordering, and distinguish deadlock from starvation.',
  predictions: [
    { title: 'Two-resource cycle', prompt: 'A holds X and waits for Y. B holds Y and waits for X. Neither has a timeout or cancellation path. What is the problem?', answers: ['A lost update', 'Normal completion', 'A deadlock cycle', 'An immutable snapshot'], correct: 2, why: 'Each task requires a resource held by the other, and neither can reach its release.', ref: 'A → Y → B → X → A' },
    { title: 'Child dependency', prompt: 'A parent holds a Mutex and joins a child. That child must acquire the same Mutex before finishing. Which repair removes this cycle?', answers: ['Join the child after leaving the protected section', 'Add another join inside the lock', 'Rename the Mutex', 'Delay longer while holding it'], correct: 0, why: 'The child can acquire the mutex once the parent releases it; waiting outside the critical section removes the circular dependency.', ref: 'hold lock / join child' },
    { title: 'Ordering contract', prompt: 'Transfer functions receive account pairs in either order. Which rule prevents opposite acquisition order?', answers: ['Always lock the first argument first', 'Pick a random order', 'Lock the account with the larger balance first', 'Always acquire by distinct stable account ID'], correct: 3, why: 'Stable IDs define a consistent total order independent of arguments and changing balances.', ref: 'consistent lock order' },
    { title: 'Starvation', prompt: 'One waiting worker is repeatedly bypassed while other workers complete. What does this describe?', answers: ['A guaranteed deadlock', 'Starvation', 'Atomicity', 'Structured concurrency'], correct: 1, why: 'Other tasks are progressing. The waiting task is being denied an opportunity, rather than participating in a fixed wait cycle.', ref: 'progress of other tasks' },
  ],
  write: {
    title: 'Order paired resource locks', goal: 'Complete withBoth so two workers can request the same resources in opposite argument orders without opposite lock acquisition orders.',
    steps: '1. Order the resources by their distinct stable IDs before acquiring them.\n2. Preserve both finally releases.\n3. Start two workers, each calling withBoth rounds times with reversed arguments, incrementing completed while both locks are held. Join them and print completed.',
    initial: orderedLocks(false, false), solution: orderedLocks(true), output: '12', swap: swap('rounds', '6', '4', '8'),
  },
  debug: {
    title: 'Do not reacquire an owned mutex', symptom: 'The action already holds the mutex. Its readiness check should succeed without a second acquisition.',
    broken: coroutine(`  val lock = Mutex()
  lock.withLock {
    val ready = lock.tryLock()
    println(ready)
    if (ready) lock.unlock()
  }`, mutexImports),
    fixed: coroutine(`  val lock = Mutex()
  lock.withLock {
    val ready = lock.isLocked
    println(ready)
  }`, mutexImports), output: 'true',
    hints: ['withLock already acquired the mutex for this action.', 'A non-reentrant Mutex will reject the nested tryLock.', 'Remove the second acquisition and its matching release; the outer withLock owns this action.'],
    why: 'The corrected action uses the existing ownership boundary. isLocked is only used as an observation inside a known held section, not as a general ownership test.',
  },
});

const partialTotals = (body: string) => coroutine(`  val values = listOf(1, 2, 3, 4)
  val parts = values.chunked(2)
  val totals = parts.map { part ->
    async(Dispatchers.Default) {
      ${body}
    }
  }
  println(totals.awaitAll().sum())`);

export const AVOIDING_SHARED_MUTABLE_STATE_LESSON = lesson({
  slug: 'avoiding-shared-mutable-state', title: 'Avoiding shared mutable state',
  intro: 'Often the easiest shared update to make safe is the one you remove. Let workers return values, then combine those values in one place.',
  exampleTitle: 'Partition work and combine local totals', code: partialTotals('part.sumOf { it * it }'),
  explanation: 'Each async child owns one input chunk and computes its square total without changing another child’s result. awaitAll returns completed values, and the parent combines them into 30.\n\nA worker can use local mutable variables internally. The useful boundary is ownership: no other worker should mutate those variables or the objects they refer to. Read-only Kotlin collection interfaces do not guarantee that another alias cannot mutate the underlying object.',
  ideas: [
    ['Return instead of append', 'map plus async plus awaitAll collects results without a shared mutable output list. Result order follows the Deferred list, not completion order.'],
    ['Local mutation is compatible', 'A mutable accumulator created inside a child is safe from other children if its reference never escapes to them.'],
    ['Copies may be shallow', 'Copy nested mutable objects when you need independent ownership. Copying only a list or data class does not automatically copy its mutable members.'],
    ['Balance overhead', 'Partition meaningful work into batches. Launching a coroutine for every tiny arithmetic operation can cost more than the calculation itself.'],
  ], takeaway: 'Keep intermediate state private and combine completed values through a single owner.',
  exploreIntro: 'Build pure results, use local accumulators, inspect shallow copies, and preserve input ordering.',
  examples: [
    { title: 'Independent result objects', code: coroutine(`  val input = listOf(2, 5, 1)
  val jobs = input.map { n -> async { n * 10 } }
  println(jobs.awaitAll().joinToString())`), output: '20, 50, 10', why: 'awaitAll returns results in the order of the supplied Deferred values. Worker completion order does not reorder the list.', change: 'Build the result list from returned values.' },
    { title: 'Private mutable accumulator', code: coroutine(`  val jobs = listOf(3, 4).map { limit ->
    async {
      var local = 0
      for (n in 1..limit) {
        local += n
      }
      local
    }
  }
  println(jobs.awaitAll().sum())`), output: '16', why: 'Each invocation creates its own local variable. The parent sums 6 and 10 after both children finish.', change: 'Allow mutation inside the worker while keeping ownership private.' },
    { title: 'A data class copy can share a member', code: `data class Batch(val items: MutableList<Int>)

${jvm(`  val original = Batch(mutableListOf(4))
  val copy = original.copy()
  copy.items.add(9)
  println(original.items.sum())`)}`, output: '13', why: 'copy duplicates the Batch object but reuses its items reference. Independent ownership requires copying that mutable list too.', change: 'Inspect nested references in an apparently copied result.' },
    { title: 'Copy the mutable member', code: `data class Batch(val items: MutableList<Int>)

${jvm(`  val original = Batch(mutableListOf(6))
  val copy = original.copy(items = original.items.toMutableList())
  copy.items.add(8)
  println(original.items.sum())
  println(copy.items.sum())`)}`, output: '6\n14', why: 'The two Batch objects now own separate list membership. Their Int elements are immutable values.', change: 'Copy the actual mutable object at the ownership boundary.' },
    { title: 'No chunks is a valid batch', code: coroutine(`  val values = emptyList<Int>()
  val jobs = values.chunked(2).map { part ->
    async { part.sum() }
  }
  println(jobs.awaitAll().sum())`), output: '0', why: 'No child is needed for empty input. The empty result list has sum 0.', change: 'Exercise the empty-input boundary of partition and reduce.' },
  ], predictIntro: 'Identify shared aliases, local ownership, and the order of combined results.',
  predictions: [
    { title: 'Mapped results', code: coroutine(`  val jobs = listOf(4, 1).map { n -> async { n + 2 } }
  println(jobs.awaitAll().joinToString())`), prompt: 'What is printed?', answers: ['3, 6', '6, 3', '4, 1', 'The order is random'], correct: 1, why: 'The Deferred list follows input order, and awaitAll preserves that order.', ref: 'map then awaitAll' },
    { title: 'Local or shared?', prompt: 'Each child creates var subtotal = 0 inside its own async block and returns it. Is subtotal shared just because it is mutable?', answers: ['Yes; all vars are global', 'Yes; async always shares local variables', 'Only when declared with Int', 'No; each invocation owns its own variable unless it is exposed elsewhere'], correct: 3, why: 'Mutability and sharing are separate properties. These local variables have independent storage.', ref: 'local accumulator ownership' },
    { title: 'Copying nested mutable state', code: `data class Row(val cells: MutableList<Int>)

${jvm(`  val a = Row(mutableListOf(2))
  val b = a.copy()
  b.cells[0] = 7
  println(a.cells[0])`)}`, prompt: 'What is printed?', answers: ['7', '2', '0', 'It does not compile'], correct: 0, why: 'The generated copy method reuses the cells reference unless a replacement is supplied.', ref: 'a.copy()' },
    { title: 'Combining private totals', code: coroutine(`  val jobs = listOf(listOf(2, 3), listOf(5)).map { part ->
    async { part.sum() }
  }
  println(jobs.awaitAll().sum())`), prompt: 'What is printed?', answers: ['5', '15', '10', '3'], correct: 2, why: 'The private results are 5 and 5; the parent combines them after completion.', ref: 'private sums' },
  ],
  write: {
    title: 'Reduce private square totals', goal: 'Compute the sum of squares using independent chunk results, without a shared mutable accumulator.',
    steps: '1. Each child computes the sum of n * n for its own part.\n2. Await all partial results and keep the final sum in the parent.',
    initial: partialTotals('0 // Replace with this part’s square total.'), solution: partialTotals('part.sumOf { it * it }'), output: '30', swap: swap('values', 'listOf(1, 2, 3, 4)', 'listOf(2, 5)', '29'),
  },
  debug: {
    title: 'Give each report its own object', symptom: 'Reports for scores 4 and 9 must retain their individual values. Both entries currently show the last score.',
    broken: `data class Report(var score: Int)

${jvm(`  val shared = Report(0)
  val reports = listOf(4, 9).map { value ->
    shared.score = value
    shared
  }
  println(reports.map { it.score }.joinToString())`)}`,
    fixed: `data class Report(var score: Int)

${jvm(`  val reports = listOf(4, 9).map { value ->
    Report(value)
  }
  println(reports.map { it.score }.joinToString())`)}`, output: '4, 9',
    hints: ['Inspect whether the result list contains two objects or one object twice.', 'Every map invocation returns shared.', 'Construct Report(value) inside each map invocation.'],
    why: 'Each result now owns a distinct Report. This aliasing bug already appears sequentially and would also undermine independent concurrent results.',
  },
});

const detached = (owned: boolean) => coroutine(`  var processed = 0
  lateinit var child: Job
  coroutineScope {
    child = launch${owned ? '' : '(Job())'} {
      processed = 9
    }
  }
  println(processed)
  child.join()`);

export const STRUCTURED_CONCURRENCY_LESSON = lesson({
  slug: 'structured-concurrency-vs-uncontrolled-c', title: 'Structured concurrency vs uncontrolled concurrency',
  intro: 'Tie work to the operation that needs it. A scope should know which children it must wait for and cancel.',
  exampleTitle: 'Return only after owned work completes',
  code: coroutine(`  var ready = false
  coroutineScope {
    launch { ready = true }
  }
  println(ready)`),
  explanation: 'The launch inherits the child scope’s Job, so coroutineScope does not return until that child completes. The output is true.\n\nPassing a fresh Job to a builder replaces the inherited Job relationship. GlobalScope also launches work without an operation parent. Work that deliberately outlives a caller needs an explicit longer-lived owner and a cancellation policy; it should not accidentally escape just to avoid waiting.',
  ideas: [
    ['Inheritance establishes ownership', 'launch and async normally inherit their parent scope. A supplied Job can replace that relationship, even when the builder call is textually inside coroutineScope.'],
    ['Failure belongs to the operation', 'An ordinary child failure cancels siblings and fails coroutineScope. Recover around the whole operation or use supervision when independent child failure is part of the design.'],
    ['Cancellation propagates downward', 'Cancelling a parent requests cancellation of children. Children still need cooperative suspension or cancellation checks, and finally is the place for cleanup.'],
    ['Longer-lived owners are deliberate', 'An application scope may own work beyond a screen or request, but the application must cancel that scope at the end of its lifetime. GlobalScope provides no such owner for you.'],
  ], takeaway: 'Keep the Job parent relationship aligned with the operation’s lifetime, including cancellation and cleanup.',
  exploreIntro: 'Observe waiting, cancellation, failure, and the effect of replacing an inherited Job.',
  examples: [
    { title: 'Owned grandchildren also finish', code: coroutine(`  var n = 0
  coroutineScope {
    launch {
      launch { n = 6 }
    }
  }
  println(n)`), output: '6', why: 'The outer child waits for its child. The enclosing scope waits for the whole owned subtree.', change: 'Add another level to the ownership tree.' },
    { title: 'Replacing the Job detaches work', code: detached(false), output: '0', why: 'This child inherits the runBlocking event loop but has a fresh Job, so coroutineScope does not wait for it. There is no suspension before the print, so the queued child has not run. The final join cleans it up.', change: 'Replace the inherited Job while keeping the same execution context.' },
    { title: 'Restore the parent relationship', code: detached(true), output: '9', why: 'Without Job(), the child belongs to coroutineScope. The scope waits before processed is read.', change: 'Let launch inherit its owning scope’s Job.' },
    { title: 'Cancel and finish cleanup', code: coroutine(`  val owner = Job()
  val scope = CoroutineScope(coroutineContext + owner)
  val child = scope.launch(start = CoroutineStart.UNDISPATCHED) {
    try {
      awaitCancellation()
    } finally {
      println("cleanup")
    }
  }
  owner.cancelAndJoin()
  println(child.isCancelled)`), output: 'cleanup\ntrue', why: 'UNDISPATCHED starts the child until it suspends. Cancelling the owner cancels the child; joining waits for its finally block.', change: 'Give a deliberately created scope an explicit shutdown path.' },
    { title: 'Recover at the scope boundary', code: coroutine(`  try {
    coroutineScope {
      launch { error("request failed") }
    }
  } catch (e: IllegalStateException) {
    println("retry later")
  }`), output: 'retry later', why: 'The child failure fails the owning operation and reaches the catch outside that scope.', change: 'Propagate a child failure to the operation owner.' },
  ], predictIntro: 'Follow Job parent relationships rather than indentation alone.',
  predictions: [
    { title: 'Wait for the subtree', code: coroutine(`  var done = 0
  coroutineScope {
    launch {
      launch { done = 14 }
    }
  }
  println(done)`), prompt: 'What is printed?', answers: ['0', 'Either 0 or 14', '14', 'It does not compile'], correct: 2, why: 'The nested launch belongs to the outer child, which belongs to the scope. The whole subtree finishes before the print.', ref: 'nested owned launch' },
    { title: 'Fresh Job argument', prompt: 'What does launch(Job()) change compared with launch() inside an existing scope?', answers: ['It guarantees faster execution', 'It uses the inherited parent twice', 'It makes the block synchronous', 'It replaces the inherited Job relationship and can escape the current owner'], correct: 3, why: 'Context elements with the same key replace one another. Job() does not automatically become a child of the current Job.', ref: 'launch(Job())' },
    { title: 'Parent cancellation', prompt: 'An owner Job is cancelled while its child is suspended in delay. What normally happens?', answers: ['The child is cancelled cooperatively and its finally block can run', 'The child always completes its normal work first', 'The child becomes a GlobalScope task', 'Cancellation skips every finally block'], correct: 0, why: 'Cancellation propagates through the Job relationship and a cancellable suspension responds to it.', ref: 'owner → child cancellation' },
    { title: 'Long-running application work', prompt: 'An upload must deliberately outlive one screen. Which ownership design is clearest?', answers: ['Launch in GlobalScope and forget its handle', 'Use an explicit application-owned scope with a shutdown policy', 'Pass Job() on every launch and never cancel it', 'Keep the screen blocked until app shutdown'], correct: 1, why: 'Longer lifetime still needs an owner. Application ownership makes cancellation and resource cleanup explicit.', ref: 'deliberate lifetime owner' },
  ],
  write: {
    title: 'Finish the owned batch before returning', goal: 'Complete summarize so it returns a total only after all its child calculations finish.',
    steps: '1. Implement summarize with coroutineScope.\n2. Start one async child per input, returning n * 2.\n3. Await all child values and return their sum.',
    initial: `import kotlinx.coroutines.*

suspend fun summarize(values: List<Int>): Int {
  // Own the child calculations and combine their results.
  return 0
}

fun main() = runBlocking {
  val input = listOf(3, 5, 2)
  println(summarize(input))
}`,
    solution: `import kotlinx.coroutines.*

suspend fun summarize(values: List<Int>): Int = coroutineScope {
  val results = values.map { n -> async { n * 2 } }
  results.awaitAll().sum()
}

fun main() = runBlocking {
  val input = listOf(3, 5, 2)
  println(summarize(input))
}`, output: '20', swap: swap('input', 'listOf(3, 5, 2)', 'listOf(4, 1)', '10'),
  },
  debug: {
    title: 'Keep the refresh under its caller', symptom: 'The scope must finish refreshing the label before it is printed. A fresh Job has detached the refresh.',
    broken: coroutine(`  var label = "stale"
  lateinit var refresh: Job
  coroutineScope {
    refresh = launch(Job()) { label = "updated" }
  }
  println(label)
  refresh.join()`),
    fixed: coroutine(`  var label = "stale"
  lateinit var refresh: Job
  coroutineScope {
    refresh = launch { label = "updated" }
  }
  println(label)
  refresh.join()`), output: 'updated',
    hints: ['Being written inside coroutineScope is not enough if ownership is replaced.', 'Inspect the context passed to launch.', 'Remove Job() so refresh inherits the owning scope’s Job.'],
    why: 'The child now belongs to the operation whose completion the caller observes. coroutineScope waits for the assignment before returning.',
  },
});

const processor = (body: string) => coroutine(`  val amounts = listOf(4, 7, 3)
  val mutex = Mutex()
  var processed = 0
  var total = 0
  coroutineScope {
    amounts.forEach { amount ->
      launch(Dispatchers.Default) {
        val value = amount * 2
${body}
      }
    }
  }
  println("processed=" + processed)
  println("total=" + total)`, mutexImports);
const bossRace = (fixed: boolean) => coroutine(`  val weights = listOf(7, 7)
  var arrived = 0
  var totalWeight = 0
  val ready = CompletableDeferred<Unit>()
  val lock = Mutex()
  coroutineScope {
    weights.forEach { weight ->
      launch {
        val before = totalWeight
        arrived++
        if (arrived == weights.size) ready.complete(Unit)
        ready.await()
        lock.withLock {
          totalWeight = ${fixed ? 'totalWeight' : 'before'} + weight
        }
      }
    }
  }
  println(totalWeight)`, mutexImports);

export const CONCURRENT_DATA_PROCESSOR_LESSON = lesson({
  slug: 'boss', title: 'Concurrent Data Processor',
  intro: 'Build a small concurrent processor with an owned lifetime and a protected result summary. Then diagnose a race that survives locking only the write.',
  exampleTitle: 'Publish a count and total under one mutex',
  code: processor(`        mutex.withLock {
          processed++
          total += value
        }`),
  explanation: 'Each child transforms one amount privately, then updates processed and total together under the same mutex. The scope waits before printing processed=3 and total=28. If a concurrent observer needed a snapshot while work was active, it would read both fields under that same mutex.\n\nThe ownership tree manages completion and failure. The mutex manages shared-state access. These solve different problems: waiting for children does not make competing mutations safe, and a mutex does not make detached work part of the scope.',
  ideas: [
    ['State the contract', 'On successful completion, processed equals the number of inputs and total equals the sum of their transformed values. A failed batch must not be reported as a successful complete batch.'],
    ['Keep local work outside the lock', 'Compute the per-item transformation before entering the critical section. Only the shared summary update needs the mutex.'],
    ['Read and write inside the boundary', 'A saved total from before the lock can already be stale. Read the current total while holding the same lock used for the write.'],
    ['Alternative architecture', 'Returning immutable per-item results and reducing them in the parent removes the shared summary. Choose that approach when live shared progress is unnecessary.'],
  ], takeaway: 'Combine scope ownership, private computation, and a complete shared-state protection boundary.',
  exploreIntro: 'Check empty batches, alternate inputs, immutable reduction, and a reproducible stale-read race.',
  examples: [
    { title: 'Protected summary', code: processor(`        mutex.withLock {
          processed++
          total += value
        }`), output: 'processed=3\ntotal=28', why: 'Each of the three child results contributes exactly once under the shared mutex.', change: 'Update the count and value total together.' },
    { title: 'An empty batch succeeds with zeros', code: processor(`        mutex.withLock {
          processed++
          total += value
        }`).replace('listOf(4, 7, 3)', 'emptyList<Int>()'), output: 'processed=0\ntotal=0', why: 'There are no children and no contributions. The scope completes and the initialized summary is already correct.', change: 'Exercise a valid batch with no records.' },
    { title: 'Return values instead of sharing a summary', code: coroutine(`  val inputs = listOf(2, 6)
  val values = inputs.map { n -> async(Dispatchers.Default) { n * 3 } }.awaitAll()
  println("processed=" + values.size)
  println("total=" + values.sum())`), output: 'processed=2\ntotal=24', why: 'The parent owns the completed list and computes the summary. No worker writes a shared accumulator.', change: 'Choose immutable result aggregation when progress need not be shared live.' },
    { title: 'A locked stale write still loses data', code: bossRace(false), output: '7', why: 'The rendezvous ensures both children save 0. Locking their writes still stores 7 twice.', change: 'Read the shared total before acquiring the mutex.' },
    { title: 'Fresh read under the same lock', code: bossRace(true), output: '14', why: 'The second lock holder reads the first completed update and adds the other weight.', change: 'Move the effective read into the protected update.' },
  ], predictIntro: 'Check the processor’s result contract and identify whether a defect concerns state access or task lifetime.',
  predictions: [
    { title: 'Different input records', code: processor(`        mutex.withLock {
          processed++
          total += value
        }`).replace('listOf(4, 7, 3)', 'listOf(1, 5)'), prompt: 'What is printed after successful completion?', answers: ['processed=2\ntotal=6', 'processed=2\ntotal=12', 'processed=3\ntotal=12', 'The output order is random'], correct: 1, why: 'Two records each contribute their doubled value, so 2 + 10 = 12.', ref: 'amount * 2 and one update per record' },
    { title: 'When to observe the summary', prompt: 'The processor’s children are still active. How can an observer get a consistent pair of processed and total?', answers: ['Read each field whenever convenient', 'Make only processed volatile', 'Use a different Mutex for reads', 'Read both fields together under the same mutex used by writers'], correct: 3, why: 'The pair belongs to one invariant, so its snapshot must use the writers’ protection boundary.', ref: 'consistent paired snapshot' },
    { title: 'Locked stale update', code: coroutine(`  val lock = Mutex()
  var sum = 0
  val old = sum
  lock.withLock { sum += 11 }
  lock.withLock { sum = old + 4 }
  println(sum)`, mutexImports), prompt: 'What does this explicit update trace print?', answers: ['4', '15', '11', '0'], correct: 0, why: 'The second update uses the stale 0 and overwrites the first contribution.', ref: 'old + 4' },
    { title: 'Detached protected work', prompt: 'All mutations use a Mutex, but every child is launched with a new unrelated Job. Does the caller’s scope now own completion?', answers: ['Yes, the mutex makes all jobs children', 'Yes, because the code is indented inside the scope', 'No; state protection does not establish Job parent relationships', 'Only if there are two inputs'], correct: 2, why: 'A mutex controls access, while the Job hierarchy controls lifetime. Both must be designed correctly.', ref: 'ownership versus mutual exclusion' },
    { title: 'Failure contract', prompt: 'A transformation fails in coroutineScope. Which behavior fits a batch API that promises a complete successful summary?', answers: ['Return the current partial total as if it were complete', 'Propagate failure or return an explicitly modeled failure result', 'Ignore every exception and print success', 'Detach the remaining children'], correct: 1, why: 'Partial work is not the promised complete result. The caller needs an honest success or failure outcome.', ref: 'batch contract' },
  ],
  write: {
    title: 'Build the concurrent amount processor', goal: 'Process every input amount in an owned child and publish the count and doubled-value total safely.',
    steps: '1. Keep the per-item transformation outside the mutex.\n2. Under mutex.withLock, increment processed and add value to total.\n3. Print the summary only after coroutineScope returns.',
    initial: processor('        // Publish this result under the shared mutex.'),
    solution: processor(`        mutex.withLock {
          processed++
          total += value
        }`), output: 'processed=3\ntotal=28', swap: swap('amounts', 'listOf(4, 7, 3)', 'listOf(2, 5)', 'processed=2\ntotal=14'),
  },
  debug: {
    title: 'Keep both parcel weights', symptom: 'Two parcels weigh 7 each, but the coordinated program always reports 7. The writes use a mutex, yet one contribution disappears.',
    broken: bossRace(false), fixed: bossRace(true), output: '14',
    hints: ['The barrier makes both parcels observe the same earlier total.', 'The protected assignment still uses before, which was read outside the mutex.', 'Use the current totalWeight inside withLock when adding weight.'],
    why: 'Both tasks saved 0 before the rendezvous. Their serialized stale writes each stored 7. Reading totalWeight inside the lock makes the second contribution build on the first and yields 14.',
  },
});

export const WORLD_18_LESSONS: FiveStageLesson[] = [
  THREADS_LESSON,
  SHARED_MUTABLE_STATE_LESSON,
  THREAD_SAFETY_LESSON,
  RACE_CONDITIONS_LESSON,
  SYNCHRONIZATION_LESSON,
  MUTEX_LESSON,
  ATOMIC_OPERATIONS_LESSON,
  THREAD_CONFINEMENT_LESSON,
  COROUTINE_CONCURRENCY_LESSON,
  CONCURRENT_ACCESS_PATTERNS_LESSON,
  DEADLOCK_CONCEPTS_LESSON,
  AVOIDING_SHARED_MUTABLE_STATE_LESSON,
  STRUCTURED_CONCURRENCY_LESSON,
  CONCURRENT_DATA_PROCESSOR_LESSON,
];
