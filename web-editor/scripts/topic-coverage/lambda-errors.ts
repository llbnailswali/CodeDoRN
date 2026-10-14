/** Negative World 9 cases, checked against real kotlinc by compare:errors. */
export const LAMBDA_ERRORS = [
  ['wrong-arity', 'val f: (Int) -> Int = { x, y -> x + y }'],
  ['missing-argument', 'val f: (Int) -> Int = { it + 1 }\nf()'],
  ['extra-argument', 'val f: (Int) -> Int = { it + 1 }\nf(1, 2)'],
  ['argument-type', 'val f: (Int) -> Int = { it + 1 }\nf("x")'],
  ['result-type', 'val f: (Int) -> String = { it + 1 }'],
  ['stored-return', 'val f = { n: Int -> return n }'],
  ['non-inline-return', 'fun execute(action: () -> Unit) { action() }\nexecute { return }'],
  ['wrong-label', 'listOf(1).forEach { return@missing }'],
  ['unsafe-nullable-call', 'val f: ((Int) -> Int)? = null\nf(2)'],
].map(([name, body]) => ({ name, code: `fun main() {\n${body}\n}` }));
