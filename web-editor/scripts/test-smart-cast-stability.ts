import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Kotlin smart-casts only STABLE values. `users[i].email` and `get(0).email` are re-evaluated on every use, so a null check on
// them proves nothing. Every expectation below was confirmed with the real compiler (kotlinc 2.0.21) via `npm run real-kotlin:serve`.
const head = 'class User(val name: String, val email: String?)\nfun main() {\n  val u1 = User("A", "a@x.com")\n  val u2 = User("B", null)\n  val users = listOf(u1, u2)\n';
const cases: Array<[string, string, 'error' | 'ok']> = [
  ['index expression after == null', '  for (i in users.indices) {\n    val len = if (users[i].email == null) "no email" else users[i].email.length.toString() + " chars"\n    println(len)\n  }\n}', 'error'],
  ['index expression inside an != null block', '  for (i in users.indices) {\n    if (users[i].email != null) {\n      println(users[i].email.length)\n    }\n  }\n}', 'error'],
  ['call receiver inside an != null block', '  fun get(i: Int) = users[i]\n  if (get(0).email != null) {\n    println(get(0).email.length)\n  }\n}', 'error'],
  ['loop variable inside an != null block', '  for (u in users) {\n    if (u.email != null) {\n      println(u.email.length)\n    }\n  }\n}', 'ok'],
  ['loop variable in an if-else expression', '  for (u in users) {\n    val len = if (u.email == null) "no email" else u.email.length.toString() + " chars"\n    println(len)\n  }\n}', 'ok'],
  ['index expression with !!', '  for (i in users.indices) {\n    println(users[i].email!!.length)\n  }\n}', 'ok'],
  ['index expression with ?. and ?:', '  for (i in users.indices) {\n    println(users[i].email?.length ?: 0)\n  }\n}', 'ok'],
  ['index copied to a local val first', '  val e = users[0].email\n  if (e != null) {\n    println(e.length)\n  }\n}', 'ok'],
  ['index copied to a local val inside a loop', '  for (i in users.indices) {\n    val e = users[i].email\n    println(if (e == null) "none" else e.length.toString())\n  }\n}', 'ok'],
];

(async () => {
  for (const [name, body, want] of cases) {
    const result = await compileAndRunKotlin(head + body);
    const compileError = !!result.error && result.error.type !== 'runtime_error';
    assert.equal(compileError ? 'error' : 'ok', want, `${name}: ${JSON.stringify(result.error)}`);
    console.log(`ok  ${name} -> ${want}`);
  }
  console.log('smart-cast stability: all cases match real Kotlin');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
