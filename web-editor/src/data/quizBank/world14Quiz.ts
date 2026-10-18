import { QuizQuestion, formatQuizCodeQuestion } from '../../utils/quizQuestions';

// Statically authored World 14 bank. Questions are independent from lesson Predict stages.

const WORLD_14_QUIZ_SOURCE: QuizQuestion[] = [
  {
    "id": "w14q-what-sequences-are-1",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "core fact: Produces values during iteration",
    "difficulty": "easy",
    "xp": 10,
    "question": "Creating a transformed Sequence does not by itself consume its elements.",
    "explanation": "Intermediate sequence calls describe deferred work; a terminal operation requests values.",
    "hint": "For core fact: Produces values during iteration, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": true
  },
  {
    "id": "w14q-what-sequences-are-2",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "design choice: Produces values during iteration",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which description distinguishes a Sequence from a stored result list?",
    "explanation": "A Sequence is an iteration pipeline, not an automatically materialized result.",
    "hint": "Use design choice: Produces values during iteration to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["It produces values while being iterated.", "It eagerly stores every transformed value.", "It can contain only Int values.", "It always runs faster than a List."],
    "answer": 0
  },
  {
    "id": "w14q-what-sequences-are-3",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "terminal value versus pipeline",
    "difficulty": "medium",
    "xp": 15,
    "question": "What value does the terminal first() return from this mapped Sequence?",
    "explanation": "map keeps the result deferred; first requests one mapped value and returns that Int.",
    "hint": "Trace terminal value versus pipeline one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val result = sequenceOf(3, 6, 9).map { it / 3 }.first()",
      "println(result)"
    ],
    "options": ["1", "6", "3", "9"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-what-sequences-are-4",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "bounded demand on an unbounded source",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which list is printed after taking four values from the generated source?",
    "explanation": "take bounds demand before toList materializes the requested prefix.",
    "hint": "Trace bounded demand on an unbounded source one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val values = generateSequence(2) { it + 2 }.take(4).toList()",
      "println(values)"
    ],
    "options": ["[2, 4, 6, 8, 10]", "[2, 4, 6]", "[2, 4, 6, 8]", "[2, 4, 6, 10]"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-what-sequences-are-5",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "Sequence and List type boundary",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that incorrectly treats a deferred Sequence as a stored List.",
    "explanation": "A Sequence pipeline remains deferred until a terminal such as toList materializes it.",
    "hint": "Check Sequence and List type boundary at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val values: List<Int> = sequenceOf(1, 2, 3).map { it * 2 }",
      " println(values)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "map on Sequence returns Sequence<Int>, not List<Int>."
  },
  {
    "id": "w14q-what-sequences-are-6",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "pipeline value category",
    "difficulty": "medium",
    "xp": 15,
    "question": "What does `map` return when its receiver is a Sequence?",
    "explanation": "The result is another Sequence describing deferred work; no transformed values are stored yet.",
    "hint": "Distinguish the pipeline object returned by map from a collection of computed results.",
    "type": "single_choice",
    "options": ["A List containing every doubled value.", "Another deferred Sequence pipeline.", "The first doubled element only.", "The number of source elements."],
    "answer": 1
  },
  {
    "id": "w14q-what-sequences-are-7",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "source demand begins at terminal",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which statement best explains why the side-effect counter remains zero?",
    "explanation": "Intermediate Sequence work waits until a terminal operation requests values.",
    "hint": "Use source demand begins at terminal to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "var visited = 0",
      "val values = sequenceOf(4, 5, 6).map { visited++",
      " it }",
      "println(visited)"
    ],
    "options": ["Sequence construction visited all three values.", "map cached the values without running its body.", "Every Sequence source must be finite before iteration can begin.", "The pipeline has no terminal consumer yet."],
    "answer": 3
  },
  {
    "id": "w14q-what-sequences-are-8",
    "worldId": "world-14",
    "lessonId": "world-14-what-sequences-are",
    "topic": "What sequences are",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 true statements about a Sequence pipeline.",
    "explanation": "Sequences may defer intermediate work and begin producing values when consumed.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Intermediate work may be deferred.",
      "A terminal operation can request values.",
      "Every Sequence is finite.",
      "Every Sequence caches its results."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-eager-collection-processing-1",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "core fact: Whole-stage execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "For a List pipeline, `filter` finishes its whole stage before the following `map` stage starts.",
    "explanation": "Iterable transformations are eager and stage-oriented.",
    "hint": "For core fact: Whole-stage execution, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": true
  },
  {
    "id": "w14q-eager-collection-processing-2",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "design choice: Whole-stage execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "What does `take(1)` do after an eager List `map`?",
    "explanation": "`map` has already processed the source before `take` receives its List.",
    "hint": "Use design choice: Whole-stage execution to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["It prevents map from visiting later source elements.", "It makes every earlier operation lazy.", "It converts the result into a Sequence.", "It limits the already mapped result."],
    "answer": 3
  },
  {
    "id": "w14q-eager-collection-processing-3",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "eager stage trace",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is printed by the eager filter-then-map pipeline?",
    "explanation": "List.filter completes its stage for the entire input before List.map begins.",
    "hint": "Trace eager stage trace one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val result = listOf(1, 2, 3).filter { println(\"F$it\")",
      " it > 1 }.map { println(\"M$it\")",
      " it * 10 }",
      "println(result)"
    ],
    "options": ["F1\nM1\nF2\nM2\nF3\nM3\n[10, 20, 30]", "F1\nF2\nM2\nF3\nM3\n[20, 30]", "F1\nF2\nF3\nM2\nM3\n[20, 30]", "F1\nF2\nM2\nF3\nM3\n[4, 6]"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-eager-collection-processing-4",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "late limit cannot undo eager map",
    "difficulty": "medium",
    "xp": 15,
    "question": "What output is printed after eager `map` finishes and `take(1)` keeps the first result?",
    "explanation": "The eager List map visits all four values before take limits the already-created result.",
    "hint": "Trace late limit cannot undo eager map one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var visits = 0",
      "val first = listOf(2, 4, 6, 8).map { visits++",
      " it }.take(1)",
      "println(\"$first:$visits\")"
    ],
    "options": ["[2]:1", "[2]:0", "[4]:4", "[2]:4"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-eager-collection-processing-5",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "eager result type",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that assigns an eager List result to the wrong abstraction.",
    "explanation": "Collection map executes eagerly and returns a materialized List.",
    "hint": "Check eager result type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val values: Sequence<Int> = listOf(1, 2, 3).map { it * 2 }",
      " println(values)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "List.map returns List<Int>, not Sequence<Int>."
  },
  {
    "id": "w14q-eager-collection-processing-6",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "eager intermediate allocation",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which conclusion follows from assigning this result?",
    "explanation": "Each List transformation runs immediately and returns a materialized collection.",
    "hint": "Use eager intermediate allocation to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val result = listOf(\"a\", \"bb\", \"ccc\").filter { it.length > 1 }.map { it.length }",
      "println(result)"
    ],
    "options": ["The filtered List is created before the mapped List.", "filter and map both wait for a terminal operation.", "The expression still has type Sequence<Int>.", "The filter and map stages alternate one element at a time for a List."],
    "answer": 0
  },
  {
    "id": "w14q-eager-collection-processing-7",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "limit placement",
    "difficulty": "medium",
    "xp": 15,
    "question": "What result and mapper-call count does this eager List pipeline print?",
    "explanation": "List.map completes over all four source elements before take receives the mapped List.",
    "hint": "Read the receiver type at map; the later limit cannot undo already completed work.",
    "type": "single_choice",
    "code": [
      "var n = 0",
      "val first = listOf(1, 2, 3, 4).map { n++",
      " it * 2 }.take(1)",
      "println(\"$first:$n\")"
    ],
    "options": ["[2]:1", "[2]:0", "[2]:4", "[2]:2"],
    "answer": 2
  },
  {
    "id": "w14q-eager-collection-processing-8",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 properties of eager collection processing.",
    "explanation": "Eager collection operations execute stage by stage and may allocate intermediate collections.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Intermediate results can be materialized.",
      "Each stage processes its available input immediately.",
      "A terminal operation is required to start every stage.",
      "A late limit cancels earlier work."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-eager-collection-processing-9",
    "worldId": "world-14",
    "lessonId": "world-14-eager-collection-processing",
    "topic": "Eager collection processing",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version maps only one source element?",
    "explanation": "The Sequence version prints 1; the eager List version prints 4.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " var n = 0",
      " listOf(1, 2, 3, 4).asSequence().map { n++",
      " it * 2 }.take(1).toList()",
      " println(n)",
      "}"
    ],
    "b": [
      "fun main() {",
      " var n = 0",
      " listOf(1, 2, 3, 4).map { n++",
      " it * 2 }.take(1)",
      " println(n)",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-lazy-processing-1",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "core fact: Deferred execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "A reusable Sequence automatically caches values after its first terminal traversal.",
    "explanation": "Sequences are not caches; another terminal traversal may repeat intermediate work.",
    "hint": "For core fact: Deferred execution, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-lazy-processing-2",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "design choice: Deferred execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "What starts deferred intermediate work in a sequence pipeline?",
    "explanation": "Terminal consumption requests elements and triggers upstream stages.",
    "hint": "Use design choice: Deferred execution to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["Demand from a terminal operation.", "Assigning the pipeline to val.", "Adding another map call.", "Declaring the source with sequenceOf."],
    "answer": 0
  },
  {
    "id": "w14q-lazy-processing-3",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "construction versus consumption",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is printed before any terminal asks for the mapped values?",
    "explanation": "Pipeline construction runs no mapping body and the stored value is still a Sequence.",
    "hint": "Trace construction versus consumption one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var mapped = 0",
      "val pipeline = sequenceOf(1, 2, 3).map { mapped++",
      " it + 10 }",
      "println(\"$mapped:${pipeline is Sequence<*>}\")"
    ],
    "options": ["3:true", "0:false", "0:true", "1:true"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-lazy-processing-4",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "repeated traversal repeats work",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is printed after traversing this reusable source twice?",
    "explanation": "A normal reusable source reruns its deferred map for each terminal traversal.",
    "hint": "Trace repeated traversal repeats work one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var calls = 0",
      "val values = sequenceOf(2, 4).map { calls++",
      " it }",
      "values.toList()",
      "values.toList()",
      "println(calls)"
    ],
    "options": ["2", "4", "0", "6"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-lazy-processing-5",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "unconsumed pipeline type",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that expects a deferred map to have produced an Int.",
    "explanation": "Building a lazy map describes work but does not calculate one accumulated Int.",
    "hint": "Check unconsumed pipeline type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val total: Int = sequenceOf(1, 2, 3).map { it * 2 }",
      " println(total)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "The map expression is Sequence<Int>; a terminal operation is required."
  },
  {
    "id": "w14q-lazy-processing-6",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "element-oriented flow",
    "difficulty": "medium",
    "xp": 15,
    "question": "What order is printed by this Sequence filter-map chain?",
    "explanation": "A demanded value passes through filter and then map before the source advances.",
    "hint": "Trace element-oriented flow one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "sequenceOf(1, 2, 3).filter { println(\"F$it\")",
      " it != 1 }.map { println(\"M$it\")",
      " it }.toList()"
    ],
    "options": ["F1\nF2\nM2\nM3\nF3", "F1\nF2\nM2\nF3\nM3", "F1\nM1\nF2\nF3\nM3", "F1\nF2\nF3\nM2\nM3"],
    "answer": 1
  },
  {
    "id": "w14q-lazy-processing-7",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "deferred repeated traversal",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which explanation accounts for the counter reaching six?",
    "explanation": "Sequence pipelines defer work but do not memoize a reusable source automatically.",
    "hint": "Use deferred repeated traversal to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "var calls = 0",
      "val values = (1..3).asSequence().map { calls++",
      " it }",
      "values.sum()",
      "values.count()",
      "println(calls)"
    ],
    "options": ["The first terminal cached all mapped values.", "Declaring the pipeline ran map six times.", "Deferred execution guarantees lower wall-clock time for every workload.", "Each terminal traverses three values and reruns map."],
    "answer": 3
  },
  {
    "id": "w14q-lazy-processing-8",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 true statements about lazy processing.",
    "explanation": "Lazy pipelines defer work and commonly process one demanded element through successive stages.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Elements can move through several stages one at a time.",
      "Building a pipeline can perform no element work.",
      "Every terminal traversal reuses cached transforms.",
      "Lazy means the result is never computed."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-lazy-processing-9",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which program prints only `built`?",
    "explanation": "Without a terminal operation, the Sequence map body does not run.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " val s = listOf(1, 2).map { println(it)",
              " it }",
              " println(\"built\")",
              "}"
            ],
    "b": [
              "fun main() {",
              " val s = sequenceOf(1, 2).map { println(it)",
              " it }",
              " println(\"built\")",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-lazy-processing-10",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Lazy processing",
    "concept": "operation completion",
    "difficulty": "medium",
    "xp": 15,
    "question": "Complete the terminal call that starts traversal.",
    "explanation": "`sum` is terminal and consumes the sequence.",
    "hint": "Choose the operation that supplies operation completion before the terminal consumes or stores the values.",
    "type": "fill_blank",
    "code": [
      "fun main() {",
      " val s = sequenceOf(1, 2).map { it * 2 }",
      " println(s.___())",
      "}"
    ],
    "chips": [
      "sum",
      "map",
      "filter",
      "take"
    ],
    "answer": "sum"
  },
  {
    "id": "w14q-creating-sequences-1",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "core fact: sequenceOf",
    "difficulty": "easy",
    "xp": 10,
    "question": "Every Sequence source can safely be traversed any number of times.",
    "explanation": "Reuse depends on the source; iterator-backed or constrained-once sequences may allow only one traversal.",
    "hint": "For core fact: sequenceOf, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-creating-sequences-2",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "design choice: sequenceOf",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which constructor is suitable for a potentially unbounded progression?",
    "explanation": "`generateSequence` can produce each next value on demand without prebuilding a finite collection.",
    "hint": "Use design choice: sequenceOf to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["toList", "map", "listOf", "generateSequence"],
    "answer": 2
  },
  {
    "id": "w14q-creating-sequences-3",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "sequenceOf source",
    "difficulty": "medium",
    "xp": 15,
    "question": "What does first() return from this explicit Sequence source?",
    "explanation": "sequenceOf preserves the supplied values and first returns the first element.",
    "hint": "Trace sequenceOf source one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val labels = sequenceOf(\"oak\", \"elm\", \"ash\")",
      "println(labels.first())"
    ],
    "options": ["oak, elm, ash", "oak", "ash", "elm"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-creating-sequences-4",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "finite generateSequence",
    "difficulty": "medium",
    "xp": 15,
    "question": "What values are produced before the generator returns null?",
    "explanation": "The next-value function ends the source by returning null after 5.",
    "hint": "Trace finite generateSequence one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val odds = generateSequence(1) { if (it < 5) it + 2 else null }.toList()",
      "println(odds)"
    ],
    "options": ["[1, 3, 5]", "[1, 3, 5, 7]", "[1, 3, 5, 7, 9]", "[1, 3, 5, 9]"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-creating-sequences-5",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "bounded generated source",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which value is printed without exhausting the unbounded generator?",
    "explanation": "take(3) bounds the generated prefix; materialization makes its third value available to last.",
    "hint": "Trace bounded generated source one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val answer = generateSequence(10) { it + 10 }.take(3).toList().last()",
      "println(answer)"
    ],
    "options": ["30", "40", "10", "20"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-creating-sequences-6",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "yield scope",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that uses a sequence-builder operation outside its valid receiver.",
    "explanation": "The sequence builder supplies the restricted suspension scope used by yield.",
    "hint": "Check yield scope at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " yield(4)",
      " println(\"done\")",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "yield is available inside a sequence builder, not an ordinary function."
  },
  {
    "id": "w14q-creating-sequences-7",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "iterator-backed one-use source",
    "difficulty": "medium",
    "xp": 15,
    "question": "What happens when this constrained Sequence is traversed a second time?",
    "explanation": "constrainOnce explicitly rejects a second traversal rather than caching or recreating the iterator.",
    "hint": "Use iterator-backed one-use source to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val once = listOf(7, 8).iterator().asSequence().constrainOnce()",
      "println(once.first())",
      "println(once.first())"
    ],
    "options": ["It prints 7 both times from a cache.", "The second traversal returns 8.", "The second traversal throws IllegalStateException.", "It prints [2, 1] again"],
    "answer": 2
  },
  {
    "id": "w14q-creating-sequences-8",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "sequence builder yield",
    "difficulty": "medium",
    "xp": 15,
    "question": "What list is yielded by this builder?",
    "explanation": "yield suspends the builder to offer each value in source order.",
    "hint": "Use sequence builder yield to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val values = sequence { yield(2)",
      " yield(5)",
      " yield(9) }.toList()",
      "println(values)"
    ],
    "options": ["[2, 5, 9]", "[9, 5, 2]", "[2, 5, 9, 14]", "[2, 9, 5]"],
    "answer": 0
  },
  {
    "id": "w14q-creating-sequences-9",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 valid ways to create sequence values lazily.",
    "explanation": "`generateSequence` and the `sequence` builder are lazy source mechanisms.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Use generateSequence with a next-value function.",
      "Use a sequence builder with yield.",
      "Call toList before creating the source.",
      "Map a List and assume that makes prior work lazy."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-creating-sequences-10",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version safely prints the first five values from an unbounded source?",
    "explanation": "`take(5)` bounds demand before materialization; the other program never reaches the end.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.take(5).toList())",
      "}"
    ],
    "b": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.toList())",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-creating-sequences-11",
    "worldId": "world-14",
    "lessonId": "world-14-creating-sequences",
    "topic": "Creating sequences",
    "concept": "operation completion",
    "difficulty": "medium",
    "xp": 15,
    "question": "Complete the builder emission.",
    "explanation": "`yield` contributes a value from a sequence builder.",
    "hint": "Choose the operation that supplies operation completion before the terminal consumes or stores the values.",
    "type": "fill_blank",
    "code": [
      "fun main() {",
      " val s = sequence {",
      " ___(10)",
      " }",
      " println(s.first())",
      "}"
    ],
    "chips": [
      "yield",
      "return",
      "emit",
      "add"
    ],
    "answer": "yield"
  },
  {
    "id": "w14q-assequence-1",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "core fact: Conversion boundary",
    "difficulty": "easy",
    "xp": 10,
    "question": "Operations placed before `asSequence()` become lazy retroactively.",
    "explanation": "`asSequence()` is a boundary; work before it has already used collection semantics.",
    "hint": "For core fact: Conversion boundary, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-assequence-2",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "design choice: Conversion boundary",
    "difficulty": "easy",
    "xp": 10,
    "question": "What happens to the original List after calling `asSequence()`?",
    "explanation": "`asSequence()` returns a sequence view and does not mutate the collection.",
    "hint": "Use design choice: Conversion boundary to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["The List remains a List and is used as the sequence source.", "It is converted in place.", "It is emptied after traversal.", "It becomes constrained to one use."],
    "answer": 0
  },
  {
    "id": "w14q-assequence-3",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "conversion preserves source",
    "difficulty": "medium",
    "xp": 15,
    "question": "What does the original List contain after creating and consuming its Sequence view?",
    "explanation": "asSequence and the downstream sorted operation do not mutate the original collection.",
    "hint": "Trace conversion preserves source one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val source = mutableListOf(3, 1)",
      "val view = source.asSequence().sorted()",
      "view.first()",
      "println(source)"
    ],
    "options": ["[1, 3]", "[]", "[3]", "[3, 1]"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-assequence-4",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "conversion boundary placement",
    "difficulty": "medium",
    "xp": 15,
    "question": "How many mapper calls have occurred when `before` is printed?",
    "explanation": "The map ran eagerly before the conversion; asSequence only affects later operations.",
    "hint": "Trace conversion boundary placement one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var calls = 0",
      "val result = listOf(1, 2, 3).map { calls++",
      " it }.asSequence()",
      "println(\"before:$calls\")"
    ],
    "options": ["before:2", "before:0", "before:3", "before:1"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-assequence-5",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "conversion result type",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that assigns a Sequence view to a List variable.",
    "explanation": "The conversion creates a Sequence view without mutating or replacing the original List.",
    "hint": "Check conversion result type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val values: List<Int> = listOf(1, 2, 3).asSequence()",
      " println(values)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "asSequence returns Sequence<Int>, not List<Int>."
  },
  {
    "id": "w14q-assequence-6",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "lazy work after conversion",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which statement explains the different counter values before first()?",
    "explanation": "Only operations after asSequence are deferred, and first requests one mapped value.",
    "hint": "Use lazy work after conversion to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "var calls = 0",
      "val view = listOf(1, 2, 3).asSequence().map { calls++",
      " it }",
      "println(calls)",
      "view.first()",
      "println(calls)"
    ],
    "options": ["Both counts are 3 because the List is eager.", "Both counts are 0 because first does not consume a Sequence.", "The count changes from 0 to 1 because map follows the lazy boundary.", "Operations completed before asSequence become lazy retroactively."],
    "answer": 2
  },
  {
    "id": "w14q-assequence-7",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "reusable collection-backed view",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is printed when this ordinary List-backed Sequence is traversed twice?",
    "explanation": "A regular List-backed Sequence can be traversed again; its deferred map is recomputed.",
    "hint": "Use reusable collection-backed view to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val view = listOf(\"x\", \"yy\").asSequence().map { it.length }",
      "println(view.sum())",
      "println(view.sum())"
    ],
    "options": ["3\n3", "3\n0", "3\n6", "3\n1"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-assequence-8",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 true statements about `asSequence()`.",
    "explanation": "Placement defines the lazy boundary, and ordinary collection-backed sources are reusable.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Only operations after the conversion use Sequence semantics.",
      "An ordinary List-backed sequence can normally be traversed again.",
      "It caches every later transformation.",
      "It guarantees lower execution time."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-assequence-9",
    "worldId": "world-14",
    "lessonId": "world-14-assequence",
    "topic": "asSequence()",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version prints `0` because mapping remains lazy?",
    "explanation": "The version that places `map` after `asSequence()` prints 0; mapping before conversion prints 3.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " var n = 0",
              " val s = listOf(1, 2, 3).map { n++",
              " it * 2 }.asSequence()",
              " println(n)",
              "}"
            ],
    "b": [
              "fun main() {",
              " var n = 0",
              " val s = listOf(1, 2, 3).asSequence().map { n++",
              " it * 2 }",
              " println(n)",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-intermediate-operations-1",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "core fact: map",
    "difficulty": "easy",
    "xp": 10,
    "question": "Sequence `map`, `filter`, `take`, and `drop` are intermediate operations.",
    "explanation": "They return another Sequence description and do not by themselves consume it.",
    "hint": "For core fact: map, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": true
  },
  {
    "id": "w14q-intermediate-operations-2",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "design choice: map",
    "difficulty": "easy",
    "xp": 10,
    "question": "What does `take(3)` express in a lazy pipeline?",
    "explanation": "`take` limits how many values continue downstream.",
    "hint": "Use design choice: map to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["Downstream demand for at most three values.", "Immediate creation of a three-item List.", "Dropping the first three source values.", "Three complete traversals."],
    "answer": 0
  },
  {
    "id": "w14q-intermediate-operations-3",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "map transformation",
    "difficulty": "medium",
    "xp": 15,
    "question": "What values are produced after mapping and materializing?",
    "explanation": "map transforms each demanded value; toList requests and stores all results.",
    "hint": "Trace map transformation one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val values = sequenceOf(2, 3, 4).map { it * it }.toList()",
      "println(values)"
    ],
    "options": ["[2, 3, 4]", "[4, 6, 8]", "[4, 9, 12]", "[4, 9, 16]"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-intermediate-operations-4",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "filter predicate",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which values remain after filtering for strings of length at least three?",
    "explanation": "filter passes only elements whose Boolean predicate is true.",
    "hint": "Trace filter predicate one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val words = sequenceOf(\"sun\", \"cloud\", \"rain\").filter { it.length >= 3 }.toList()",
      "println(words)"
    ],
    "options": ["[sun, cloud, rain]", "[cloud, rain]", "[sun, rain]", "[]"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-intermediate-operations-5",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "filter predicate contract",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line whose filter lambda returns the wrong type.",
    "explanation": "A filter decides whether each value continues by returning Boolean.",
    "hint": "Check filter predicate contract at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val values = sequenceOf(1, 2, 3).filter { it * 2 }",
      " println(values.toList())",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "filter requires a Boolean predicate, but it * 2 is Int."
  },
  {
    "id": "w14q-intermediate-operations-6",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "drop then take",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is the resulting list after skipping two values and taking the next three?",
    "explanation": "drop removes the prefix from downstream demand; take caps the remaining output.",
    "hint": "Trace drop then take one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val result = sequenceOf(5, 10, 15, 20, 25, 30).drop(2).take(3).toList()",
      "println(result)"
    ],
    "options": ["[15, 20, 25]", "[5, 10, 15]", "[15, 20, 25, 30]", "[20, 25, 30]"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-intermediate-operations-7",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "downstream demand through drop",
    "difficulty": "hard",
    "xp": 20,
    "question": "How many source values are requested to produce these two outputs?",
    "explanation": "The pipeline must request and discard three values before producing the two retained values.",
    "hint": "Trace downstream demand through drop one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var requested = 0",
      "val result = sequenceOf(4, 5, 6, 7, 8).map { requested++",
      " it }.drop(3).take(2).toList()",
      "println(\"$result:$requested\")"
    ],
    "options": ["[7, 8]:2", "[7, 8]:5", "[4, 5]:5", "[7, 8]:3"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-intermediate-operations-8",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "intermediate return category",
    "difficulty": "medium",
    "xp": 15,
    "question": "What kind of value does `take(2)` return before any terminal is added?",
    "explanation": "drop and take are intermediate operations that return a Sequence.",
    "hint": "Use intermediate return category to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val prefix = sequenceOf(\"a\", \"b\", \"c\").drop(1).take(2)",
      "println(prefix is Sequence<*>)"
    ],
    "options": ["A List that is materialized as soon as take is called.", "A mutable List with two source values removed permanently.", "A deferred Sequence that yields at most two values when consumed.", "An Int containing the number of values in the source."],
    "answer": 2
  },
  {
    "id": "w14q-intermediate-operations-9",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 true intermediate-operation statements.",
    "explanation": "Filtering gates later stages, while dropping omits initial values lazily.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "filter may reject a value before map sees it.",
      "drop skips a requested prefix.",
      "map always materializes a List.",
      "take consumes an infinite source completely."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-intermediate-operations-10",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Intermediate operations",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which pipeline prints the first two even squares?",
    "explanation": "The filter-then-map pipeline prints `[4, 16]`; the pipeline with `drop(2)` prints later matching squares.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.filter { it % 2 == 0 }.map { it * it }.take(2).toList())",
      "}"
    ],
    "b": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.map { it * it }.filter { it % 2 == 0 }.drop(2).take(2).toList())",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-terminal-operations-1",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "core fact: toList",
    "difficulty": "easy",
    "xp": 10,
    "question": "`toList()` is terminal because it requests and stores the sequence values.",
    "explanation": "Materialization consumes the requested sequence and returns a List.",
    "hint": "For core fact: toList, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": true
  },
  {
    "id": "w14q-terminal-operations-2",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "design choice: toList",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which terminal can stop after finding one matching element?",
    "explanation": "`find` returns the first match and need not inspect later elements.",
    "hint": "Use design choice: toList to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["map", "find", "filter", "drop"],
    "answer": 1
  },
  {
    "id": "w14q-terminal-operations-3",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "materialization result",
    "difficulty": "medium",
    "xp": 15,
    "question": "What does the type check and value print after toList consumes the pipeline?",
    "explanation": "toList consumes the pipeline and returns a List containing the mapped values.",
    "hint": "Trace materialization result one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val values = sequenceOf(1, 3, 5).map { it + 1 }.toList()",
      "println(values is List<*>)",
      "println(values)"
    ],
    "options": ["false\n[2, 4, 6]", "true\n[2, 4, 6]", "true\n[1, 3, 5]", "Sequence\n[2, 4, 6]"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-terminal-operations-4",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "first matching value",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which element does first return?",
    "explanation": "first returns the earliest element satisfying both parts of the predicate.",
    "hint": "Trace first matching value one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val found = sequenceOf(4, 7, 10, 13).first { it > 5 && it % 3 == 1 }",
      "println(found)"
    ],
    "options": ["4", "13", "10", "7"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-terminal-operations-5",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "first terminal result type",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line that assigns a terminal result to a Sequence variable.",
    "explanation": "first is terminal and returns the selected element directly.",
    "hint": "Check first terminal result type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val value: Sequence<Int> = sequenceOf(1, 2, 3).first()",
      " println(value)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "first returns one Int, not Sequence<Int>."
  },
  {
    "id": "w14q-terminal-operations-6",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "count predicate result",
    "difficulty": "medium",
    "xp": 15,
    "question": "How many values satisfy the predicate?",
    "explanation": "2, 4, and 6 satisfy the even predicate.",
    "hint": "Trace count predicate result one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val count = sequenceOf(2, 3, 4, 5, 6).count { it % 2 == 0 }",
      "println(count)"
    ],
    "options": ["3", "5", "2", "4"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-terminal-operations-7",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "fold accumulator",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is the final accumulator value?",
    "explanation": "fold starts at 10 and adds each of the three values.",
    "hint": "Trace fold accumulator one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val total = sequenceOf(3, 4, 5).fold(10) { acc, value -> acc + value }",
      "println(total)"
    ],
    "options": ["12", "22", "10", "3"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-terminal-operations-8",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "forEach side effect",
    "difficulty": "medium",
    "xp": 15,
    "question": "What lines does forEach print?",
    "explanation": "forEach consumes values for side effects and preserves their traversal order.",
    "hint": "Trace forEach side effect one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "sequenceOf(\"red\", \"blue\").forEach { println(it.uppercase()) }"
    ],
    "options": ["RED, BLUE", "red\nblue", "RED\nBLUE", "done\nx\ny"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-terminal-operations-9",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "any stops at witness",
    "difficulty": "hard",
    "xp": 20,
    "question": "How many predicate calls occur before any returns true?",
    "explanation": "any stops as soon as it reaches 7, the first odd value.",
    "hint": "Trace any stops at witness one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var checks = 0",
      "val found = sequenceOf(2, 4, 7, 8).any { checks++",
      " it % 2 == 1 }",
      "println(\"$found:$checks\")"
    ],
    "options": ["true:4", "false:3", "true:1", "true:3"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-terminal-operations-10",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 terminal operations.",
    "explanation": "`fold` consumes to an accumulated result and `forEach` consumes to perform actions.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "fold",
      "forEach",
      "map",
      "take"
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-terminal-operations-11",
    "worldId": "world-14",
    "lessonId": "world-14-terminal-operations",
    "topic": "Terminal operations",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version prints `3` without visiting the fourth source value?",
    "explanation": "`first` stops at 3; full materialization visits every value and the other program prints 4.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " println(sequenceOf(1, 2, 3, 4).toList().last())",
              "}"
            ],
    "b": [
              "fun main() {",
              " println(sequenceOf(1, 2, 3, 4).first { it > 2 })",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-sequence-evaluation-order-1",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "core fact: Per-element sequence order",
    "difficulty": "easy",
    "xp": 10,
    "question": "A lazy filter-map pipeline normally processes all filter inputs before any map call.",
    "explanation": "Sequence evaluation is generally element-oriented: a passing element can reach map before the next source element is requested.",
    "hint": "For core fact: Per-element sequence order, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-sequence-evaluation-order-2",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "design choice: Per-element sequence order",
    "difficulty": "easy",
    "xp": 10,
    "question": "When do side effects inside Sequence intermediates begin?",
    "explanation": "Terminal demand starts the observable intermediate trace.",
    "hint": "Use design choice: Per-element sequence order to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["When the pipeline variable is declared.", "When asSequence is parsed.", "When a terminal operation requests values.", "Only after the program ends."],
    "answer": 2
  },
  {
    "id": "w14q-sequence-evaluation-order-3",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "element-oriented evaluation trace",
    "difficulty": "medium",
    "xp": 15,
    "question": "What exact trace is printed by the lazy chain?",
    "explanation": "Each value reaches map immediately if accepted; take stops requesting after one output.",
    "hint": "Trace element-oriented evaluation trace one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "sequenceOf(2, 3, 4).filter { println(\"check$it\")",
      " it > 2 }.map { println(\"keep$it\")",
      " it }.take(1).toList()"
    ],
    "options": ["check2\ncheck3\ncheck4\nkeep3", "check2\ncheck3\nkeep3", "keep2\ncheck2\nkeep3", "F1\nF2\nF3\nM1\nM3"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-sequence-evaluation-order-4",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "stage-oriented eager trace",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is the trace from the eager collection equivalent?",
    "explanation": "The eager filter examines the full source and map processes the full filtered List before take.",
    "hint": "Trace stage-oriented eager trace one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "listOf(2, 3, 4).filter { println(\"check$it\")",
      " it > 2 }.map { println(\"keep$it\")",
      " it }.take(1)"
    ],
    "options": ["check2\ncheck3\ncheck4\nkeep3\nkeep4", "check2\ncheck3\nkeep3", "check2\nkeep2\ncheck3\nkeep3", "F1\nM1\nF2\nF3\nM3"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-sequence-evaluation-order-5",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "materialization boundary",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the line that claims an unmaterialized trace is already a List.",
    "explanation": "The mapping trace remains deferred while its type is Sequence<Int>.",
    "hint": "Check materialization boundary at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val trace: List<Int> = sequenceOf(1, 2).map { println(it)",
      " it }",
      " println(trace)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "Sequence.map returns Sequence<Int>; call toList to materialize it."
  },
  {
    "id": "w14q-sequence-evaluation-order-6",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "filter gates later stage",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which values reach the map body?",
    "explanation": "filter rejects odd values before they can reach map.",
    "hint": "Use filter gates later stage to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val result = sequenceOf(1, 2, 3, 4)",
      "  .filter { it % 2 == 0 }",
      "  .map {",
      "    println(\"mapped$it\")",
      "    it * 10",
      "  }",
      "  .toList()"
    ],
    "options": ["mapped1\nmapped2\nmapped3\nmapped4", "mapped2\nmapped4", "mapped2\nmapped3", "mapped1\nmapped3"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-sequence-evaluation-order-7",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "execution order changes with abstraction",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which statement describes the difference between these two pipelines?",
    "explanation": "Sequence evaluation is demand-driven; collection evaluation materializes the whole mapped stage.",
    "hint": "Use execution order changes with abstraction to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val lazy = sequenceOf(1, 2).map { println(\"S$it\")",
      " it }.toList()",
      "val eager = listOf(1, 2).map { println(\"L$it\")",
      " it }"
    ],
    "options": ["Both defer map until toList.", "The Sequence performs work per demanded element; the List map runs eagerly as a collection stage.", "The List map runs only for its first element.", "Each intermediate stage materializes its own collection."],
    "answer": 1
  },
  {
    "id": "w14q-sequence-evaluation-order-8",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 sequence-order statements.",
    "explanation": "Evaluation is vertical per demanded element, and rejection prevents later-stage work for that value.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "A rejected filter value never reaches the following map.",
      "One accepted element can move through several stages before the next source value.",
      "Every intermediate stage finishes globally before the next.",
      "Side effects run while merely storing the pipeline."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-sequence-evaluation-order-9",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which program prints the element-oriented trace `F1, F2, M2, F3, M3`?",
    "explanation": "Sequence work is element-oriented; the collection trace is stage-oriented.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " listOf(1, 2, 3).filter { println(\"F$it\")",
              " it > 1 }.map { println(\"M$it\")",
              " it }",
              "}"
            ],
    "b": [
              "fun main() {",
              " sequenceOf(1, 2, 3).filter { println(\"F$it\")",
              " it > 1 }.map { println(\"M$it\")",
              " it }.toList()",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-sequence-evaluation-order-10",
    "worldId": "world-14",
    "lessonId": "world-14-sequence-evaluation-order",
    "topic": "Sequence evaluation order",
    "concept": "operation completion",
    "difficulty": "medium",
    "xp": 15,
    "question": "Complete the terminal operation that triggers the trace.",
    "explanation": "`toList()` requests the values and triggers the mapping trace.",
    "hint": "Choose the operation that supplies operation completion before the terminal consumes or stores the values.",
    "type": "fill_blank",
    "code": [
      "fun main() {",
      " val s = sequenceOf(1, 2, 3).map { println(it)",
      " it }",
      " s.___()",
      "}"
    ],
    "chips": [
      "toList",
      "map",
      "filter",
      "take"
    ],
    "answer": "toList"
  },
  {
    "id": "w14q-short-circuiting-1",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "core fact: first/find",
    "difficulty": "easy",
    "xp": 10,
    "question": "`all` can stop as soon as one element fails its predicate.",
    "explanation": "One failure is enough to determine that not all elements match.",
    "hint": "For core fact: first/find, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": true
  },
  {
    "id": "w14q-short-circuiting-2",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "design choice: first/find",
    "difficulty": "easy",
    "xp": 10,
    "question": "Why can `take(5)` make an unbounded sequence usable?",
    "explanation": "Only five values are requested before the bounded result completes.",
    "hint": "Use design choice: first/find to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["It converts the source into a finite List immediately.", "It caches the infinite source.", "It removes the generator function.", "It limits downstream demand to five values."],
    "answer": 3
  },
  {
    "id": "w14q-short-circuiting-3",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "first predicate trace",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which trace is printed while finding the first value above four?",
    "explanation": "first stops at 5 after testing 2, 4, and 5.",
    "hint": "Trace first predicate trace one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var seen = 0",
      "val answer = sequenceOf(2, 4, 5, 8).first { seen++",
      " it > 4 }",
      "println(\"$answer:$seen\")"
    ],
    "options": ["5:4", "5:3", "8:4", "5:2"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-short-circuiting-4",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "find result and stopping point",
    "difficulty": "medium",
    "xp": 15,
    "question": "What result and check count does find produce?",
    "explanation": "find returns the first match, owl, without visiting yak.",
    "hint": "Trace find result and stopping point one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var checks = 0",
      "val answer = sequenceOf(\"ant\", \"bee\", \"owl\", \"yak\").find { checks++",
      " it.length == 3 && it.startsWith(\"o\") }",
      "println(\"$answer:$checks\")"
    ],
    "options": ["owl:4", "null:4", "owl:2", "owl:3"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-short-circuiting-5",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "take count type",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line that supplies an invalid bound to take.",
    "explanation": "The numeric bound controls how many demanded values continue downstream.",
    "hint": "Check take count type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      "  val values = generateSequence(1) { it + 1 }",
      "    .take(\"2\")",
      "  println(values.toList())",
      "}"
    ],
    "errorLine": 2,
    "errorNote": "take expects an Int count, not String."
  },
  {
    "id": "w14q-short-circuiting-6",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "all stops at first failure",
    "difficulty": "medium",
    "xp": 15,
    "question": "How many values does all inspect before returning false?",
    "explanation": "all stops at the first failing value, 7.",
    "hint": "Trace all stops at first failure one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var checks = 0",
      "val result = sequenceOf(2, 4, 7, 8, 10).all { checks++",
      " it % 2 == 0 }",
      "println(\"$result:$checks\")"
    ],
    "options": ["false:5", "true:3", "false:4", "false:3"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-short-circuiting-7",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "takeWhile stops at first failure",
    "difficulty": "medium",
    "xp": 15,
    "question": "What prefix and predicate-check count result when `takeWhile` receives an increasing sequence that stops satisfying the condition?",
    "explanation": "The predicate accepts 2, 4, and 6, then fails on 7; takeWhile stops there without testing 8.",
    "hint": "A failed takeWhile predicate is consumed as the stopping point; later source values are not tested.",
    "type": "predict_output",
    "code": [
      "var checked = 0",
      "val result = sequenceOf(2, 4, 6, 7, 8).takeWhile { checked++",
      " it % 2 == 0 }.toList()",
      "println(\"$result:$checked\")"
    ],
    "options": ["[2, 4, 6]:3", "[2, 4, 6, 8]:5", "[2, 4, 6]:4", "[2, 4]:4"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-short-circuiting-8",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "none disproved by match",
    "difficulty": "hard",
    "xp": 20,
    "question": "What does none return and how many elements are tested?",
    "explanation": "none is disproved by 6 and stops after the third predicate call.",
    "hint": "Trace none disproved by match one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var tested = 0",
      "val answer = sequenceOf(1, 3, 6, 9).none { tested++",
      " it % 2 == 0 }",
      "println(\"$answer:$tested\")"
    ],
    "options": ["false:4", "true:3", "false:3", "true:2"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-short-circuiting-9",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "takeWhile prefix",
    "difficulty": "hard",
    "xp": 20,
    "question": "What prefix does takeWhile retain?",
    "explanation": "takeWhile stops at the first odd value, 5; later values are not considered.",
    "hint": "Trace takeWhile prefix one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val prefix = sequenceOf(2, 4, 6, 5, 8).takeWhile { it % 2 == 0 }.toList()",
      "println(prefix)"
    ],
    "options": ["[2, 4, 6, 8]", "[2, 4, 6]", "[2, 4]", "[2]"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-short-circuiting-10",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 operations that may determine their result early.",
    "explanation": "`any` stops on a match and `first` stops when its first requested result is found.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "any",
      "first",
      "map",
      "drop"
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-short-circuiting-11",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version terminates and prints `7`?",
    "explanation": "`first` stops at 7; counting an unbounded source has no end.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.first { it == 7 })",
      "}"
    ],
    "b": [
      "fun main() {",
      " println(generateSequence(1) { it + 1 }.count())",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-short-circuiting-12",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Short-circuiting",
    "concept": "operation completion",
    "difficulty": "medium",
    "xp": 15,
    "question": "Complete the operation that keeps values only until the first failure.",
    "explanation": "`takeWhile` stops at the first value that fails.",
    "hint": "Choose the operation that supplies operation completion before the terminal consumes or stores the values.",
    "type": "fill_blank",
    "code": [
      "fun main() {",
      " val values = sequenceOf(2, 4, 5, 6).___ { it % 2 == 0 }.toList()",
      " println(values)",
      "}"
    ],
    "chips": [
      "takeWhile",
      "filter",
      "dropWhile",
      "map"
    ],
    "answer": "takeWhile"
  },
  {
    "id": "w14q-sequences-vs-collections-1",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "core fact: Same APIs, different execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "Sequences are universally better than collections for every pipeline.",
    "explanation": "The better abstraction depends on size, operations, demand, reuse, readability, and overhead.",
    "hint": "For core fact: Same APIs, different execution, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-sequences-vs-collections-2",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "design choice: Same APIs, different execution",
    "difficulty": "easy",
    "xp": 10,
    "question": "When can a materialized collection be the clearer choice?",
    "explanation": "Materializing once can avoid repeated lazy traversal and keep simple code direct.",
    "hint": "Use design choice: Same APIs, different execution to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["Whenever the source is unbounded.", "Whenever only the first match is needed.", "Whenever no result is stored.", "When a small transformed result will be reused repeatedly."],
    "answer": 3
  },
  {
    "id": "w14q-sequences-vs-collections-3",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "equal values distinct execution",
    "difficulty": "medium",
    "xp": 15,
    "question": "What mapped lists are printed for the eager List and the materialized Sequence?",
    "explanation": "Both transformations multiply each source value by three, so the eager and materialized lazy results are identical.",
    "hint": "Trace equal values distinct execution one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val listResult = listOf(1, 2, 3).map { it * 3 }",
      "val sequenceResult = listOf(1, 2, 3).asSequence().map { it * 3 }.toList()",
      "println(\"$listResult:$sequenceResult\")"
    ],
    "options": ["[3, 6, 9]:[3, 6, 9]", "[3, 6, 9]:[1, 2, 3]", "[1, 2, 3]:[3, 6, 9]", "[2, 4, 6]:[2, 4, 6]"],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-sequences-vs-collections-4",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "collection stage order",
    "difficulty": "medium",
    "xp": 15,
    "question": "What is the List result after filtering before mapping?",
    "explanation": "The filter produces [3, 4], then map transforms both values.",
    "hint": "Trace collection stage order one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val result = listOf(1, 2, 3, 4).filter { it > 2 }.map { it * 10 }",
      "println(result)"
    ],
    "options": ["[10, 20, 30, 40]", "[30, 40]", "[30]", "[30, 40, 50]"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-sequences-vs-collections-5",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "lazy versus stored result type",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line that declares a lazy pipeline as a stored List.",
    "explanation": "A lazy pipeline and its materialized result can contain equal values but have different types and reuse behavior.",
    "hint": "Check lazy versus stored result type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val values: List<Int> = (1..3).asSequence().map { it * 2 }",
      " println(values)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "The expression is Sequence<Int>; add toList for a stored result."
  },
  {
    "id": "w14q-sequences-vs-collections-6",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "abstraction and demand",
    "difficulty": "medium",
    "xp": 15,
    "question": "A report needs only the first matching record from a large source. Which design can stop upstream work early?",
    "explanation": "Deferred filtering propagates the terminal’s early demand upstream.",
    "hint": "Use abstraction and demand to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val records = (1..100).toList()",
      "val record = records.asSequence().filter { it % 7 == 0 }.firstOrNull()",
      "println(record)"
    ],
    "options": ["The List filter must always finish before firstOrNull.", "The Sequence caches the entire source first.", "A Sequence is always faster.", "The Sequence filter can stop when firstOrNull finds a match."],
    "answer": 3
  },
  {
    "id": "w14q-sequences-vs-collections-7",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "stored result reuse",
    "difficulty": "medium",
    "xp": 15,
    "question": "A small transformed result is read repeatedly. Which choice makes the values available without rerunning the transform?",
    "explanation": "An eager List result materializes once and can be reused directly.",
    "hint": "Use stored result reuse to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val names = listOf(\"Ada\", \"Lin\").map { it.uppercase() }",
      "println(names.first())",
      "println(names.last())"
    ],
    "options": ["The List remaps on each read.", "The List stores the mapped values once.", "The List remains an unconsumed Sequence.", "Sequence is the clearer choice for every small one-pass transformation."],
    "answer": 1
  },
  {
    "id": "w14q-sequences-vs-collections-8",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "drop then take composition",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which two values remain after the pipeline skips one value and then takes two?",
    "explanation": "drop(1) removes 5, leaving 10, 15, and 20; take(2) keeps only the next two values.",
    "hint": "Apply drop to the source prefix first, then count two values from the remaining sequence.",
    "type": "predict_output",
    "code": [
      "val chosen = sequenceOf(5, 10, 15, 20).drop(1).take(2).toList()",
      "println(chosen)"
    ],
    "options": ["[5, 10]", "[10, 15, 20]", "[10, 15]", "[15, 20]"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-sequences-vs-collections-9",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 correct comparisons.",
    "explanation": "The execution models differ, but neither is a universal performance winner.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Collections commonly materialize intermediate results.",
      "Sequences defer intermediate operations until demand.",
      "Sequences always use less memory.",
      "Collections cannot short-circuit terminals."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-sequences-vs-collections-10",
    "worldId": "world-14",
    "lessonId": "world-14-sequences-vs-collections",
    "topic": "Sequences vs collections",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version runs its mapping body only three times across two result uses?",
    "explanation": "The List mapping runs once and stores values; the Sequence mapping runs again for the second terminal and reports six calls.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " var n = 0",
      " val values = (1..3).map { n++",
      " it * 2 }",
      " println(values.sum() + values.size)",
      " println(n)",
      "}"
    ],
    "b": [
      "fun main() {",
      " var n = 0",
      " val values = (1..3).asSequence().map { n++",
      " it * 2 }",
      " println(values.sum() + values.count())",
      " println(n)",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-performance-trade-offs-1",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "core fact: Allocation",
    "difficulty": "easy",
    "xp": 10,
    "question": "Kotlin guarantees that a Sequence pipeline is faster than its collection equivalent.",
    "explanation": "Sequence machinery has overhead, and performance depends on workload and demand.",
    "hint": "For core fact: Allocation, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-performance-trade-offs-2",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "design choice: Allocation",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which evidence is safe to use without making timing claims?",
    "explanation": "Observable evaluation counts support semantic reasoning without promising wall-clock speed.",
    "hint": "Use design choice: Allocation to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["A claim that lazy code is always faster.", "A guessed allocation count for every runtime.", "A counter showing how many elements an operation examined.", "One machine’s unrecorded impression."],
    "answer": 2
  },
  {
    "id": "w14q-performance-trade-offs-3",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "observable mapper count",
    "difficulty": "medium",
    "xp": 15,
    "question": "How many mapper calls occur before first() returns?",
    "explanation": "first requests one mapped value, so the mapper runs once; no timing claim is needed.",
    "hint": "Trace observable mapper count one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var mapped = 0",
      "val answer = (1..500).asSequence().map { mapped++",
      " it * 2 }.first()",
      "println(\"$answer:$mapped\")"
    ],
    "options": ["2:500", "0:1", "2:2", "2:1"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-performance-trade-offs-4",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "intermediate allocation",
    "difficulty": "medium",
    "xp": 15,
    "question": "What storage behavior differs between these pipelines?",
    "explanation": "List stages materialize; Sequence stages defer work and avoid those intermediate result collections.",
    "hint": "Use intermediate allocation to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val eager = (1..5).filter { it > 2 }.map { it * 2 }",
      "val lazy = (1..5).asSequence().filter { it > 2 }.map { it * 2 }"
    ],
    "options": ["The eager pipeline creates intermediate collections; the Sequence describes stages until consumed.", "Both create the same intermediate Lists.", "The Sequence stores all final values on declaration.", "A Sequence allocates no objects at all."],
    "answer": 0
  },
  {
    "id": "w14q-performance-trade-offs-5",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "small workload trade-off",
    "difficulty": "medium",
    "xp": 15,
    "question": "Why might a direct List map be preferable for three values consumed once?",
    "explanation": "For a tiny fully consumed input, clarity can outweigh deferred execution; timing requires measurement.",
    "hint": "Use small workload trade-off to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val labels = listOf(\"a\", \"b\", \"c\").map { it.uppercase() }",
      "println(labels)"
    ],
    "options": ["It is guaranteed to run faster on every machine.", "It is direct and avoids an unnecessary lazy wrapper and terminal conversion.", "List.map is lazy for small inputs.", "A List cannot be traversed more than once."],
    "answer": 1
  },
  {
    "id": "w14q-performance-trade-offs-6",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "short circuit measured work",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which evidence demonstrates that a Sequence avoids unnecessary mapper calls?",
    "explanation": "A mapper counter measures performed work; it does not by itself prove wall-clock speed.",
    "hint": "Use short circuit measured work to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "var calls = 0",
      "(1..1000).asSequence().map { calls++",
      " it }.take(4).toList()",
      "println(calls)"
    ],
    "options": ["The elapsed time is always lower.", "The counter is 4.", "The counter proves the pipeline allocated no intermediate storage.", "The counter proves lower CPU time on every runtime."],
    "answer": 1
  },
  {
    "id": "w14q-performance-trade-offs-7",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "work-count pipeline type",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line that expects an intermediate pipeline to be a completed count.",
    "explanation": "Observable work requires a terminal traversal; pipeline construction alone produces no count.",
    "hint": "Check work-count pipeline type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val calls: Int = (1..100).asSequence().map { it * 2 }",
      " println(calls)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "map returns Sequence<Int>, not a completed Int count."
  },
  {
    "id": "w14q-performance-trade-offs-8",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "lazy wrapper overhead",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which engineering conclusion is supported for a tiny pipeline?",
    "explanation": "Laziness trades intermediate storage and demand for iteration machinery; no universal speed claim follows.",
    "hint": "Use lazy wrapper overhead to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val result = listOf(1, 2).asSequence().map { it + 1 }.toList()",
      "println(result)"
    ],
    "options": ["A Sequence is always faster because it is lazy.", "The List version must allocate more in every runtime.", "The mapped result is cached by both abstractions.", "Sequence machinery adds overhead, so measure a real workload before choosing it for speed."],
    "answer": 3
  },
  {
    "id": "w14q-performance-trade-offs-9",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "repeated traversal work",
    "difficulty": "hard",
    "xp": 20,
    "question": "How many times does the transform run across these two terminal operations?",
    "explanation": "first visits one value, then sum traverses all four values; the shared pipeline does not cache mapped results.",
    "hint": "Trace repeated traversal work one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "var calls = 0",
      "val pipeline = (1..4).asSequence().map { calls++",
      " it }",
      "pipeline.first()",
      "pipeline.sum()",
      "println(calls)"
    ],
    "options": ["4", "8", "5", "2"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-performance-trade-offs-10",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 real sequence trade-offs.",
    "explanation": "Laziness can avoid work, but traversal can repeat and the abstraction itself is not free.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "Short-circuiting can reduce upstream work.",
      "Repeated terminal traversal can repeat intermediate work.",
      "Lazy operators have zero overhead.",
      "A Sequence always caches results."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-performance-trade-offs-11",
    "worldId": "world-14",
    "lessonId": "world-14-performance-trade-offs",
    "topic": "Performance trade-offs",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which program performs the mapping body only twice?",
    "explanation": "Lazy downstream demand limits mapping; eager List map visits all 100 values.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " var n = 0",
              " (1..100).map { n++",
              " it }.take(2)",
              " println(n)",
              "}"
            ],
    "b": [
              "fun main() {",
              " var n = 0",
              " (1..100).asSequence().map { n++",
              " it }.take(2).toList()",
              " println(n)",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-1",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "core fact: Use Sequence when demand is limited",
    "difficulty": "easy",
    "xp": 10,
    "question": "A potentially infinite sequence should be fully materialized before applying a limit.",
    "explanation": "The limit must be applied while processing remains lazy; full materialization would not finish.",
    "hint": "For core fact: Use Sequence when demand is limited, decide whether the statement describes pipeline construction, value demand, or stored output.",
    "type": "true_false",
    "answer": false
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-2",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "design choice: Use Sequence when demand is limited",
    "difficulty": "easy",
    "xp": 10,
    "question": "When should a lazy result often be materialized once?",
    "explanation": "A stored result prevents repeated traversal when reuse is the requirement.",
    "hint": "Use design choice: Use Sequence when demand is limited to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "options": ["When downstream code will reuse the same completed values.", "Before bounding an infinite source.", "Whenever a pipeline has one map.", "To guarantee faster execution."],
    "answer": 0
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-3",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "long pipeline with limited demand",
    "difficulty": "medium",
    "xp": 15,
    "question": "A multi-stage pipeline needs only five matching records. Which design is appropriate to try first?",
    "explanation": "Several stages and early termination give laziness a plausible benefit; benchmark if speed matters.",
    "hint": "Use long pipeline with limited demand to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val records = (1..100).toList()",
      "val result = records.asSequence().filter { it % 3 == 0 }.map { it * 10 }.take(5).toList()",
      "println(result.size)"
    ],
    "options": ["A Sequence lets the five-result demand limit upstream work.", "Converting to Sequence shrinks the original records collection.", "A List is required because take is terminal.", "The limit can avoid mapping records after five matches are found."],
    "answer": 0
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-4",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "tiny transformation choice",
    "difficulty": "medium",
    "xp": 15,
    "question": "A tiny list is transformed once and every result is needed. Which implementation is simplest?",
    "explanation": "A direct eager pipeline expresses this small, fully consumed task with less machinery.",
    "hint": "Use tiny transformation choice to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val display = listOf(\"a\", \"b\").map { it.uppercase() }",
      "println(display)"
    ],
    "options": ["Convert to Sequence, add three intermediate stages, then materialize.", "Use an unbounded generator.", "Use the direct collection transformation.", "Materialize an unbounded generated source before limiting it."],
    "answer": 2
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-5",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "infinite source bound",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which order safely obtains a finite List from an unbounded generator?",
    "explanation": "A terminal can finish only after downstream demand is bounded for an infinite source.",
    "hint": "Use infinite source bound to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val page = generateSequence(1) { it + 1 }.drop(20).take(5).toList()",
      "println(page)"
    ],
    "options": ["Bound the source with take before materializing.", "Call toList before take.", "Call count to discover the source size.", "Call toList first, then take(10)."],
    "answer": 0
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-6",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "materialize before repeated reuse",
    "difficulty": "medium",
    "xp": 15,
    "question": "A computed result is traversed many times and memory allows storage. What should the pipeline do?",
    "explanation": "Sequences do not memoize; materializing once avoids repeating transforms when reuse is required.",
    "hint": "Use materialize before repeated reuse to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "type": "single_choice",
    "code": [
      "val source = listOf(1, 2, 3, 4)",
      "val stored = source.asSequence().filter { it % 2 == 0 }.map { it * 10 }.toList()",
      "repeat(3) { println(stored.size) }"
    ],
    "options": ["Keep the reusable values deferred and materialize for each traversal.", "Convert the result to an unbounded source.", "Materialize once and reuse the List.", "Assume each terminal stores its output inside the Sequence."],
    "answer": 2
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-7",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "materialize for reuse type",
    "difficulty": "medium",
    "xp": 15,
    "question": "Tap the line that omits the required materialization for a reusable List.",
    "explanation": "When completed values will be reused, the materialization boundary should be explicit.",
    "hint": "Check materialize for reuse type at the marked expression, then compare its actual type with the receiving declaration or operation contract.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val names: List<String> = listOf(\"A\", \"B\").asSequence().map { it.lowercase() }",
      " println(names)",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "The pipeline is Sequence<String>; call toList to store it."
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-8",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "finite prefix from generated source",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which list is produced by safely bounding the generated source?",
    "explanation": "take bounds generation at six values before toList materializes the prefix.",
    "hint": "Trace finite prefix from generated source one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "type": "predict_output",
    "code": [
      "val firstSix = generateSequence(10) { it + 10 }.take(6).toList()",
      "println(firstSix)"
    ],
    "options": ["[10, 20, 30, 40, 50, 60, 70]", "[10, 20, 30, 40, 50]", "[10, 20, 30, 40, 50, 60]", "[60]"],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-9",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "combined semantic claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 situations that favor Sequence semantics.",
    "explanation": "Limited demand and bounded use of unbounded sources are strong reasons for laziness.",
    "hint": "Test every claim independently against combined semantic claims; distinguish guaranteed behavior from a possible optimization.",
    "type": "multi_select",
    "options": [
      "A multi-stage pipeline needs only an early result.",
      "A generator may be unbounded but demand is bounded.",
      "A tiny List is fully transformed once.",
      "The transformed values must be stored and reused many times."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-when-sequences-should-and-should-not-be-used-10",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "When sequences should and should not be used",
    "concept": "execution-model comparison",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version directly produces and stores a `List<String>`?",
    "explanation": "The direct List pipeline has the requested stored type; the Sequence expression needs `toList()`.",
    "hint": "Compare both programs on execution-model comparison; follow their operations in order and note what each consumer demands.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " val names: List<String> = listOf(\"A\",\"B\").map { it.lowercase() }",
      " println(names)",
      "}"
    ],
    "b": [
      "fun main() {",
      " val names: List<String> = listOf(\"A\",\"B\").asSequence().map { it.lowercase() }",
      " println(names)",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-set-1",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Sequence Foundations",
    "concept": "pipeline construction versus consumption",
    "difficulty": "easy",
    "xp": 10,
    "question": "A Sequence pipeline with only `map` is assigned to a variable. Has its mapping body run yet?",
    "explanation": "No. The Sequence describes deferred work until a terminal operation requests values.",
    "hint": "Use pipeline construction versus consumption to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "setId": "w14-set-foundations",
    "type": "single_choice",
    "options": ["No; no terminal demand exists.", "Yes; map is always eager.", "Yes; assignment consumes it.", "Only the first element ran."],
    "answer": 0
  },
  {
    "id": "w14q-set-2",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Sequence Foundations",
    "concept": "eager versus lazy trace",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which program prints `F2, F3, M3, F4, M4` in that order?",
    "explanation": "The Sequence pipeline sends each value above 2 into map before requesting the next source value.",
    "hint": "Compare both programs on eager versus lazy trace; follow their operations in order and note what each consumer demands.",
    "setId": "w14-set-foundations",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " listOf(2, 3, 4).filter { println(\"F$it\")",
              " it > 2 }.map { println(\"M$it\")",
              " it }",
              "}"
            ],
    "b": [
              "fun main() {",
              " sequenceOf(2, 3, 4).filter { println(\"F$it\")",
              " it > 2 }.map { println(\"M$it\")",
              " it }.toList()",
              "}"
            ],
    "answer": 1
  },
  {
    "id": "w14q-set-3",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Sequence Foundations",
    "concept": "deferred repeated traversal",
    "difficulty": "medium",
    "xp": 15,
    "question": "Select the 2 true statements about traversing a reusable mapped Sequence twice.",
    "explanation": "Each terminal traversal can rerun the deferred map; pipeline creation itself does not cache results.",
    "hint": "Test every claim independently against deferred repeated traversal; distinguish guaranteed behavior from a possible optimization.",
    "setId": "w14-set-foundations",
    "type": "multi_select",
    "options": [
      "The mapping can run again.",
      "The Sequence is automatically cached.",
      "Creating the pipeline can do no mapping work.",
      "The second terminal is always illegal."
    ],
    "answers": [
      0,
      2
    ]
  },
  {
    "id": "w14q-set-4",
    "worldId": "world-14",
    "lessonId": "world-14-lazy-processing",
    "topic": "Sequence Foundations",
    "concept": "lazy work count",
    "difficulty": "hard",
    "xp": 20,
    "question": "What is printed?",
    "explanation": "`take(2)` requests two mapped values, so the lazy map body runs twice.",
    "hint": "Trace lazy work count one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "setId": "w14-set-foundations",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " var calls = 0",
      " val x = (1..10).asSequence().map { calls++",
      " it }.take(2).toList()",
      " println(\"$x:$calls\")",
      "}"
    ],
    "options": ["[1, 2]:10", "[1, 2]:2", "[1, 2]:0", "[1, 2]:1"],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-set-5",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Creation and Operations",
    "concept": "generated bounded source",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which expression safely materializes three values from an unbounded generated source?",
    "explanation": "The limit must precede materialization.",
    "hint": "Use generated bounded source to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "setId": "w14-set-creation-operations",
    "type": "single_choice",
    "options": ["generateSequence(1) { it+1 }.toList()", "listOf(1).generateSequence()", "sequenceOf(1).count()", "generateSequence(1) { it+1 }.take(3).toList()"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-set-6",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Creation and Operations",
    "concept": "conversion placement",
    "difficulty": "medium",
    "xp": 15,
    "question": "Which version prints `0` before its first terminal call?",
    "explanation": "Only operations after `asSequence()` remain deferred; mapping before the boundary prints 2 immediately.",
    "hint": "Compare both programs on conversion placement; follow their operations in order and note what each consumer demands.",
    "setId": "w14-set-creation-operations",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " var n = 0",
      " val x = listOf(1, 2).asSequence().map { n++",
      " it * 2 }",
      " println(n)",
      " println(x.first())",
      "}"
    ],
    "b": [
      "fun main() {",
      " var n = 0",
      " val x = listOf(1, 2).map { n++",
      " it * 2 }.asSequence()",
      " println(n)",
      " println(x.first())",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-set-7",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Creation and Operations",
    "concept": "intermediate chain",
    "difficulty": "medium",
    "xp": 15,
    "question": "What list remains after dropping the first value, filtering evens, and taking at most two?",
    "explanation": "`drop(1)` removes 1, `filter` keeps 2 and 4, and `take(2)` requests both.",
    "hint": "Trace intermediate chain one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "setId": "w14-set-creation-operations",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " println(sequenceOf(1, 2, 3, 4).drop(1).filter { it % 2 == 0 }.take(2).toList())",
      "}"
    ],
    "options": ["[2, 4, 6]", "[2]", "[3, 4]", "[2, 4]"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-set-8",
    "worldId": "world-14",
    "lessonId": "world-14-intermediate-operations",
    "topic": "Creation and Operations",
    "concept": "single-use source boundary",
    "difficulty": "hard",
    "xp": 20,
    "question": "Select the 2 safe claims about `iterator.asSequence()`.",
    "explanation": "The first traversal consumes iterator values, and repeated traversal must not be assumed.",
    "hint": "Test every claim independently against single-use source boundary; distinguish guaranteed behavior from a possible optimization.",
    "setId": "w14-set-creation-operations",
    "type": "multi_select",
    "options": [
      "Its first traversal follows the iterator.",
      "It is always an automatically cached Sequence.",
      "Reuse must not be assumed.",
      "It recreates the iterator after each terminal call."
    ],
    "answers": [
      0,
      2
    ]
  },
  {
    "id": "w14q-set-9",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Consumption and Control",
    "concept": "terminal recognition",
    "difficulty": "easy",
    "xp": 10,
    "question": "Which operation is terminal?",
    "explanation": "`fold` consumes values into one accumulated result.",
    "hint": "Use terminal recognition to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "setId": "w14-set-consumption-control",
    "type": "single_choice",
    "options": ["map", "fold", "filter", "drop"],
    "answer": 1
  },
  {
    "id": "w14q-set-10",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Consumption and Control",
    "concept": "short-circuit count",
    "difficulty": "medium",
    "xp": 15,
    "question": "When does `any` stop, and what Boolean plus check count is printed?",
    "explanation": "`any` checks 1, 2, then 3 and stops on the match.",
    "hint": "Trace short-circuit count one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "setId": "w14-set-consumption-control",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " var n = 0",
      " val found = sequenceOf(1, 2, 3, 4).any { n++",
      " it == 3 }",
      " println(\"$found:$n\")",
      "}"
    ],
    "options": ["true:4", "false:3", "true:1", "true:3"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-set-11",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Consumption and Control",
    "concept": "evaluation gating",
    "difficulty": "medium",
    "xp": 15,
    "question": "Select the 2 true statements about `filter(...).map(...).first()`.",
    "explanation": "Rejected values do not reach map, and first stops after receiving its first mapped result.",
    "hint": "Test every claim independently against evaluation gating; distinguish guaranteed behavior from a possible optimization.",
    "setId": "w14-set-consumption-control",
    "type": "multi_select",
    "options": [
      "Rejected values skip map.",
      "first can stop downstream demand.",
      "map processes every source value first.",
      "first materializes the whole Sequence."
    ],
    "answers": [
      0,
      1
    ]
  },
  {
    "id": "w14q-set-12",
    "worldId": "world-14",
    "lessonId": "world-14-short-circuiting",
    "topic": "Consumption and Control",
    "concept": "bounded infinite sequence",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version terminates and prints `10`?",
    "explanation": "`take(11).last()` bounds the zero-based generated source; counting the unbounded source cannot finish.",
    "hint": "Compare both programs on bounded infinite sequence; follow their operations in order and note what each consumer demands.",
    "setId": "w14-set-consumption-control",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " println(generateSequence(0) { it + 1 }.take(11).last())",
      "}"
    ],
    "b": [
      "fun main() {",
      " println(generateSequence(0) { it + 1 }.count())",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-set-13",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "Design and Performance",
    "concept": "abstraction choice",
    "difficulty": "easy",
    "xp": 10,
    "question": "A small List is mapped once and fully used. Which default is clearest?",
    "explanation": "A direct List pipeline avoids a lazy boundary that provides no useful deferred demand.",
    "hint": "Use abstraction choice to check whether each option's operation, return type, and evaluation timing fit the stated task.",
    "setId": "w14-set-design-performance",
    "type": "single_choice",
    "options": ["Always convert to Sequence.", "Use the direct List map.", "Generate an unbounded source.", "Traverse the result twice."],
    "answer": 1
  },
  {
    "id": "w14q-set-14",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "Design and Performance",
    "concept": "observable performance evidence",
    "difficulty": "medium",
    "xp": 15,
    "question": "Select the 2 defensible statements.",
    "explanation": "Work counts and materialization boundaries are observable; universal speed claims are not.",
    "hint": "Test every claim independently against observable performance evidence; distinguish guaranteed behavior from a possible optimization.",
    "setId": "w14-set-design-performance",
    "type": "multi_select",
    "options": [
      "A counter can show avoided evaluations.",
      "Sequences are guaranteed faster.",
      "Repeated terminals can repeat work.",
      "Lazy operators have zero overhead."
    ],
    "answers": [
      0,
      2
    ]
  },
  {
    "id": "w14q-set-15",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "Design and Performance",
    "concept": "materialize for reuse",
    "difficulty": "medium",
    "xp": 15,
    "question": "What sum and mapper-call total appear after the result is materialized once?",
    "explanation": "The sequence is materialized once, then the stored List is reused.",
    "hint": "Trace materialize for reuse one source value at a time; stop when the terminal has obtained everything the prompt requests.",
    "setId": "w14-set-design-performance",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " var calls = 0",
      " val values = (1..3).asSequence().map { calls++",
      " it * 2 }.toList()",
      " println(values.sum())",
      " println(calls)",
      "}"
    ],
    "options": ["12\n6", "6\n3", "12\n9", "12\n3"],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-set-16",
    "worldId": "world-14",
    "lessonId": "world-14-when-sequences-should-and-should-not-be-used",
    "topic": "Design and Performance",
    "concept": "limited demand trade-off",
    "difficulty": "hard",
    "xp": 20,
    "question": "Which version performs fewer predicate checks before producing the first multiple of 100?",
    "explanation": "The Sequence version lets `first` stop the lazy filter at 100; the List filter examines the full range.",
    "hint": "Compare both programs on limited demand trade-off; follow their operations in order and note what each consumer demands.",
    "setId": "w14-set-design-performance",
    "type": "code_comparison",
    "a": [
              "fun main() {",
              " var n = 0",
              " val x = (1..1000).filter { n++",
              " it % 100 == 0 }.first()",
              " println(\"$x:$n\")",
              "}"
            ],
    "b": [
              "fun main() {",
              " var n = 0",
              " val x = (1..1000).asSequence().filter { n++",
              " it % 100 == 0 }.first()",
              " println(\"$x:$n\")",
              "}"
            ],
    "answer": 1
  }
];

const WORLD_14_BOSS_QUIZ_SOURCE: QuizQuestion[] = [
  {
    "id": "w14q-boss-1",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "lazy boundary and terminal result",
    "difficulty": "easy",
    "xp": 10,
    "question": "The intake job should scan events lazily, keep at most two urgent ones, then store that batch. Which pipeline matches the requirement?",
    "explanation": "The Sequence boundary comes before filtering, take limits demand, and toList stores the selected batch.",
    "hint": "Check where the lazy view starts, where the batch is capped, and where it becomes a List.",
    "type": "single_choice",
    "options": [
      "source.filter(p).take(2).asSequence()",
      "source.toList().filter(p).take(2).toList()",
      "source.asSequence().toList().filter(p)",
      "source.asSequence().filter(p).take(2).toList()"
    ],
    "monoOptions": true,
    "answer": 3
  },
  {
    "id": "w14q-boss-2",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "bounded generation completion",
    "difficulty": "medium",
    "xp": 15,
    "question": "The event cursor can produce IDs indefinitely. Complete the pipeline to store only the first five IDs.",
    "explanation": "take(5) stops demand from the unbounded ID source before toList materializes it.",
    "hint": "The limiting call must run while values are being requested, before storage begins.",
    "type": "fill_blank",
    "code": [
      "fun main() {",
      " val values = generateSequence(1) { it + 1 }.___(5).toList()",
      " println(values)",
      "}"
    ],
    "chips": [
      "take",
      "drop",
      "count",
      "filter"
    ],
    "answer": "take"
  },
  {
    "id": "w14q-boss-3",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "construction does not execute",
    "difficulty": "medium",
    "xp": 15,
    "question": "The intake stages are assembled before the worker starts. What is printed before the first terminal call?",
    "explanation": "Defining the mapped Sequence does not visit event IDs; only the status line is printed.",
    "hint": "Follow execution only to the status print; has any operation requested an event yet?",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " val eventIds = (1..3).asSequence().map { println(\"map:$it\")",
      " it * 2 }",
      " println(\"worker ready\")",
      "}"
    ],
    "options": [
      "map:1\nmap:2\nmap:3\nworker ready",
      "worker ready",
      "map:1\nworker ready",
      "worker ready\nmap:1"
    ],
    "monoOptions": true,
    "answer": 1
  },
  {
    "id": "w14q-boss-4",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "materialize once decision",
    "difficulty": "medium",
    "xp": 15,
    "question": "The same urgent-event batch feeds both a dashboard and an export. Which design avoids filtering the source again for the second consumer?",
    "explanation": "Materialize the selected events once, then let both consumers read the stored List.",
    "hint": "Distinguish a reusable stored batch from a deferred recipe that runs again at each terminal.",
    "type": "single_choice",
    "options": [
      "Run the same filter pipeline separately for each consumer.",
      "Add another lazy stage and assume it stores prior values.",
      "Convert the selected events to a List once and share that List.",
      "Assume the Sequence caches values after the dashboard reads them."
    ],
    "answer": 2
  },
  {
    "id": "w14q-boss-5",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "priority threshold and aggregation",
    "difficulty": "medium",
    "xp": 15,
    "question": "The dashboard keeps events scoring at least 70, doubles their scores, then reports the stored scores and their sum. What is printed?",
    "explanation": "Filtering retains 72 and 80; mapping produces 144 and 160, whose sum is 304.",
    "hint": "Apply the threshold to original scores first, then transform only retained values before summing.",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " val scores = sequenceOf(48, 72, 65, 80, 54)",
      " .filter { it >= 70 }",
      " .map { it * 2 }",
      " .toList()",
      " println(\"$scores:${scores.sum()}\")",
      "}"
    ],
    "options": [
      "[144, 160]:152",
      "[96, 130, 108]:334",
      "[144, 160]:304",
      "[72, 80]:152"
    ],
    "monoOptions": true,
    "answer": 2
  },
  {
    "id": "w14q-boss-6",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "backing collection observed at consumption",
    "difficulty": "medium",
    "xp": 15,
    "question": "An event arrives after the deferred cursor is created but before it is consumed. What output does the intake trace produce?",
    "explanation": "asSequence creates a view over the List rather than a snapshot; because the List is updated before traversal begins, both event tags are read in order during consumption.",
    "hint": "Separate the moment the Sequence view is created from the later moment its source iterator begins reading the List.",
    "type": "predict_output",
    "code": [
      "fun main() {",
      "  val eventQueue = mutableListOf(\"queued\")",
      "  val pending = eventQueue.asSequence().map {",
      "    println(\"read:$it\")",
      "    it",
      "  }",
      "  println(\"cursor ready\")",
      "  eventQueue.add(\"late\")",
      "  println(pending.toList())",
      "}"
    ],
    "options": [
      "cursor ready\nread:queued\nread:late\n[queued, late]",
      "cursor ready\nread:queued\n[queued]",
      "read:queued\nread:late\ncursor ready\n[queued, late]",
      "cursor ready\nread:late\nread:queued\n[late, queued]"
    ],
    "monoOptions": true,
    "answer": 0
  },
  {
    "id": "w14q-boss-7",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "invalid generated next value",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the next-value expression whose type conflicts with the generated integer event IDs.",
    "explanation": "The next-value function must return another `Int?`; `it + \"x\"` returns a String.",
    "hint": "Compare the seed's type with the lambda result; every generated item must stay in the same sequence type.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val source = generateSequence(1) {",
      " it + \"x\"",
      " }",
      " println(source.take(2).toList())",
      "}"
    ],
    "errorLine": 2,
    "errorNote": "The next function returns String where Int? is required."
  },
  {
    "id": "w14q-boss-8",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "collection versus sequence type",
    "difficulty": "hard",
    "xp": 20,
    "question": "Tap the assignment that supplies a List where the event cursor requires a Sequence.",
    "explanation": "A `List<Int>` is not a `Sequence<Int>`; call `asSequence()` at the assignment boundary.",
    "hint": "Compare the declared type with the initializer.",
    "type": "find_error",
    "code": [
      "fun main() {",
      " val source: Sequence<Int> = listOf(1, 2, 3)",
      " println(source.first())",
      "}"
    ],
    "errorLine": 1,
    "errorNote": "Use listOf(1,2,3).asSequence()."
  },
  {
    "id": "w14q-boss-9",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "performance claims",
    "difficulty": "hard",
    "xp": 20,
    "question": "For this event intake pipeline, select the 2 claims that are supported by sequence semantics.",
    "explanation": "A bounded request can stop upstream work, and traversing a deferred recipe again can repeat its transformations; neither fact establishes universal speed.",
    "hint": "Select exactly two claims with measurable semantics.",
    "type": "multi_select",
    "options": [
      "take can reduce upstream evaluations.",
      "Sequence is always faster than List.",
      "A second terminal may repeat intermediate work.",
      "Sequence operators have no overhead."
    ],
    "answers": [
      0,
      2
    ]
  },
  {
    "id": "w14q-boss-10",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "semantics-preserving conversion",
    "difficulty": "hard",
    "xp": 20,
    "question": "When the event filter-map pipeline is converted to a Sequence without changing operation order, select the 2 statements that remain true.",
    "explanation": "The final values can stay equal, while execution order and avoided work may differ.",
    "hint": "Separate result semantics from evaluation strategy.",
    "type": "multi_select",
    "options": [
      "The materialized final values can be equal.",
      "Side-effect order must remain stage-oriented.",
      "The lazy version may evaluate fewer source elements.",
      "The Sequence automatically caches the final values."
    ],
    "answers": [
      0,
      2
    ]
  },
  {
    "id": "w14q-boss-11",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "normalize before predicate",
    "difficulty": "hard",
    "xp": 20,
    "question": "The dashboard must normalize tags before checking the `ALERT` prefix. Which implementation includes the alert tag with leading whitespace?",
    "explanation": "The first implementation trims and uppercases before filtering; the second tests the raw string and misses the leading-space alert.",
    "hint": "Inspect the first input tag and check whether its whitespace is removed before startsWith runs.",
    "type": "code_comparison",
    "a": [
      "fun main() {",
      " val tags = listOf(\" ALERT:disk \", \"debug:sync\")",
      " val routed = tags.asSequence().map { it.trim().uppercase() }.filter { it.startsWith(\"ALERT\") }.toList()",
      " println(routed)",
      "}"
    ],
    "b": [
      "fun main() {",
      " val tags = listOf(\" ALERT:disk \", \"debug:sync\")",
      " val routed = tags.asSequence().filter { it.startsWith(\"ALERT\") }.map { it.trim().uppercase() }.toList()",
      " println(routed)",
      "}"
    ],
    "answer": 0
  },
  {
    "id": "w14q-boss-12",
    "worldId": "world-14",
    "lessonId": "world-14-boss",
    "topic": "Event Intake Pipeline",
    "concept": "empty-result edge case",
    "difficulty": "hard",
    "xp": 20,
    "question": "No urgent event appears in the first four generated IDs. What does the bounded intake job print when it safely requests the first urgent result?",
    "explanation": "The generated source is bounded before filtering, so the search finishes with an empty List; firstOrNull returns null and the fallback reports `no urgent event`.",
    "hint": "Follow the limit, filter, and materialization in order, then check the value firstOrNull produces for an empty List.",
    "type": "predict_output",
    "code": [
      "fun main() {",
      " val urgentIds = generateSequence(1) { it + 1 }",
      " .take(4)",
      " .filter { it > 10 }",
      " .toList()",
      " println(urgentIds.firstOrNull() ?: \"no urgent event\")",
      "}"
    ],
    "options": [
      "11",
      "no urgent event",
      "null",
      "empty"
    ],
    "monoOptions": true,
    "answer": 1
  }
];

// The snippets above were authored with one-space indents and lambdas split mid-expression; formatQuizCodeQuestion lays them out
// by brace depth (as Worlds 1-12 and 15 are) and keeps the line each find-the-error question points at.
export const WORLD_14_QUIZ = WORLD_14_QUIZ_SOURCE.map((q) => formatQuizCodeQuestion(q));
export const WORLD_14_BOSS_QUIZ = WORLD_14_BOSS_QUIZ_SOURCE.map((q) => formatQuizCodeQuestion(q));
