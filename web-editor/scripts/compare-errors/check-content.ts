/**
 * Checks lesson CONTENT against the real Kotlin compiler (no AI involved):
 *   - every Predict question with code: is the option marked correct what real Kotlin does? (output questions: the printed text;
 *     other questions: whether the program compiles / throws, when the marked answer says so)
 *   - every Explore card with a stored output: does real Kotlin print it (or fail to compile / throw, for error cards)?
 * Real results are cached by code (outputs/real-kotlin-compare/content-cache.json), so a re-run after editing content is quick.
 * Usage: npx tsx scripts/compare-errors/check-content.ts   ->  outputs/real-kotlin-compare/content-check.md
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../../src/data/lessonStagesData';
import { REAL_KOTLIN_READY, runRealKotlin, type RealResult } from '../minikotlin/real-kotlin';

if (!REAL_KOTLIN_READY) { console.error('Run `npm run kotlinc:fetch` first.'); process.exit(1); }
const OUT = path.resolve('..', 'outputs', 'real-kotlin-compare');
fs.mkdirSync(OUT, { recursive: true });
const cacheFile = path.join(OUT, 'content-cache.json');
const cache: Record<string, RealResult> = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
const hash = (code: string) => crypto.createHash('sha1').update(code).digest('hex');

interface Item { kind: 'predict' | 'explore'; lesson: string; id: string; code: string; prompt?: string; options?: { label: string; correct: boolean }[]; stored?: string[]; outputKind?: string }
const items: Item[] = [];
for (const l of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
  for (const q of l.predict?.questions ?? []) if (q.code?.length) items.push({ kind: 'predict', lesson: l.id, id: q.id, code: q.code.join('\n'), prompt: q.prompt, options: q.options.map((o) => ({ label: o.label, correct: o.isCorrect })) });
  for (const c of l.explore?.cards ?? []) if (c.code?.length && c.output) items.push({ kind: 'explore', lesson: l.id, id: c.id, code: c.code.join('\n'), stored: c.output, outputKind: c.outputKind });
}

const norm = (s: string) => s.replace(/\\n/g, ' ').replace(/^["'`]|["'`]$/g, '').replace(/\s+/g, ' ').trim();
const saysCompileFail = (s: string) => /\b(does ?n[o']t compile|won'?t compile|compil\w* (?:error|fail)|fails? to compile|not compile|rejected|type mismatch|unresolved|compile[- ]time error|it fails|cannot|can't)\b/i.test(s);
const saysCompiles = (s: string) => /^(yes|it compiles|compiles)\b/i.test(s.trim());
const saysThrows = (s: string) => /exception|throws?\b|crash|runtime error/i.test(s);
const isOutputQuestion = (p: string) => /what (will|does) (this|the) (code|program|snippet)? ?print|what is printed|what prints|output question|what does this print|what will this print|printed\?/i.test(p);

(async () => {
  // A "what if" Predict question shows the failing line commented out. Build the variant with code-looking comment lines uncommented.
  const hypotheticals = new Map<string, string>();
  for (const it of items) {
    if (it.kind !== 'predict' || !it.options!.some((o) => o.correct && saysCompileFail(o.label))) continue;
    const lines = it.code.split('\n');
    const variant = lines.map((l) => (/^\s*\/\/\s*\S/.test(l) && /[=(){}.]|\b(val|var|fun|class)\b/.test(l) ? l.replace(/\/\/\s?/, '') : l)).join('\n');
    if (variant !== it.code) { hypotheticals.set(it.id, variant); items.push({ ...it, kind: 'predict', id: `${it.id}#uncommented`, code: variant, options: [] }); }
  }
  const todo = items.filter((it) => !cache[hash(it.code)]);
  console.log(`${items.length} programs (${items.length - todo.length} cached). Running real kotlinc on ${todo.length}...`);
  for (let i = 0; i < todo.length; i += 300) {
    const chunk = todo.slice(i, i + 300);
    const results = await runRealKotlin(chunk.map((it, k) => ({ id: String(k), code: it.code })));
    chunk.forEach((it, k) => { const r = results.get(String(k)); if (r) cache[hash(it.code)] = r; });
    fs.writeFileSync(cacheFile, JSON.stringify(cache));
    console.log(`  ${Math.min(i + 300, todo.length)}/${todo.length}`);
  }

  type Finding = { severity: 'WRONG KEY' | 'CHECK' ; item: Item; detail: string };
  const findings: Finding[] = [];
  let checked = 0, notCheckable = 0, nondeterministic = 0;
  // Predict questions whose marked answer is a sentence no script can grade (written to content-statement-questions.json for review).
  const statementQuestions: { lesson: string; id: string; prompt?: string; key: string; options: string[]; code: string; kotlinc: { stage: string; output: string; error?: string } }[] = [];
  for (const it of items) {
    const r = cache[hash(it.code)];
    if (!r) continue;
    const realOut = (r.output ?? '').replace(/\r\n/g, '\n').trimEnd();
    const nondet = r.errors?.some((e) => /nondeterministic/.test(e));
    if (nondet) { nondeterministic++; continue; }
    if (it.kind === 'explore') {
      checked++;
      const want = it.stored!.join('\n').trimEnd();
      if (it.outputKind === 'compileError') { if (r.stage !== 'compile') findings.push({ severity: 'WRONG KEY', item: it, detail: `card says compile error, real Kotlin ${r.stage === 'ok' ? `prints ${JSON.stringify(realOut.slice(0, 80))}` : 'throws at runtime'}` }); continue; }
      if (it.outputKind === 'runtimeError') { if (r.stage !== 'run') findings.push({ severity: 'WRONG KEY', item: it, detail: `card says runtime error, real Kotlin ${r.stage === 'compile' ? `does not compile: ${r.errors?.[0]}` : `prints ${JSON.stringify(realOut.slice(0, 80))}`}` }); continue; }
      if (r.stage === 'compile') findings.push({ severity: 'CHECK', item: it, detail: `real Kotlin does not compile this card: ${r.errors?.[0]?.slice(0, 120)}` });
      else if (r.stage === 'run') findings.push({ severity: 'CHECK', item: it, detail: `real Kotlin throws: ${r.errors?.[0]?.slice(0, 120)} (stored output ${JSON.stringify(want.slice(0, 60))})` });
      else if (realOut !== want) findings.push({ severity: 'WRONG KEY', item: it, detail: `stored ${JSON.stringify(want.slice(0, 80))}, real Kotlin prints ${JSON.stringify(realOut.slice(0, 80))}` });
      continue;
    }
    // Predict
    if (it.id.endsWith('#uncommented')) continue;
    const correct = it.options!.filter((o) => o.correct);
    const others = it.options!.filter((o) => !o.correct);
    const key = correct.map((o) => o.label).join(' | ');
    if (isOutputQuestion(it.prompt!) && correct.length === 1 && !saysCompileFail(key) && !saysThrows(key)) {
      checked++;
      if (r.stage === 'compile') { findings.push({ severity: 'CHECK', item: it, detail: `key ${JSON.stringify(key)}, but real Kotlin does not compile it: ${r.errors?.[0]?.slice(0, 110)}` }); continue; }
      if (r.stage === 'run') { findings.push({ severity: 'CHECK', item: it, detail: `key ${JSON.stringify(key)}, but real Kotlin throws: ${r.errors?.[0]?.slice(0, 110)}` }); continue; }
      const out = norm(realOut);
      if (norm(key) === out) continue;
      const other = others.find((o) => norm(o.label) === out);
      if (other) findings.push({ severity: 'WRONG KEY', item: it, detail: `key ${JSON.stringify(key)}, but real Kotlin prints ${JSON.stringify(realOut)}, which is option ${JSON.stringify(other.label)}` });
      else findings.push({ severity: 'CHECK', item: it, detail: `key ${JSON.stringify(key)}, real Kotlin prints ${JSON.stringify(realOut.slice(0, 80))} (no option matches exactly)` });
      continue;
    }
    // Statement questions: only judged when the marked answer clearly claims compile failure, compiling, or an exception.
    if (saysCompileFail(key) && r.stage !== 'compile' && hypotheticals.has(it.id)) {
      // The failing line is commented out (a "what if" question): the variant with it uncommented must fail to compile.
      checked++;
      const v = cache[hash(hypotheticals.get(it.id)!)];
      if (v && v.stage !== 'compile') findings.push({ severity: 'WRONG KEY', item: it, detail: `key says the commented-out line would not compile (${JSON.stringify(key)}), but with it uncommented real Kotlin still compiles` });
      else if (!v) findings.push({ severity: 'CHECK', item: it, detail: `hypothetical question (${JSON.stringify(key)}): could not run the uncommented variant` });
      continue;
    }
    if (saysCompileFail(key)) { checked++; if (r.stage !== 'compile') findings.push({ severity: 'WRONG KEY', item: it, detail: `key says it does not compile (${JSON.stringify(key)}), but real Kotlin ${r.stage === 'ok' ? `compiles and prints ${JSON.stringify(realOut.slice(0, 60))}` : 'compiles and throws at runtime'}` }); continue; }
    if (saysCompiles(key)) { checked++; if (r.stage === 'compile') findings.push({ severity: 'WRONG KEY', item: it, detail: `key says it compiles (${JSON.stringify(key)}), but real Kotlin rejects it: ${r.errors?.[0]?.slice(0, 100)}` }); continue; }
    if (saysThrows(key)) { checked++; if (r.stage !== 'run') findings.push({ severity: 'CHECK', item: it, detail: `key says it throws (${JSON.stringify(key)}), but real Kotlin ${r.stage === 'compile' ? `does not compile: ${r.errors?.[0]?.slice(0, 80)}` : `prints ${JSON.stringify(realOut.slice(0, 60))}`}` }); continue; }
    // "... prints ok:3." style answers: compare the printed part with the real output.
    const printsClaim = /\bprints?\s+["“]?(.+?)["”]?\.?$/i.exec(key)?.[1];
    if (printsClaim && r.stage === 'ok') {
      checked++;
      if (norm(printsClaim) !== norm(realOut)) findings.push({ severity: 'CHECK', item: it, detail: `key says it prints ${JSON.stringify(printsClaim)}, real Kotlin prints ${JSON.stringify(realOut.slice(0, 80))}` });
      continue;
    }
    notCheckable++;
    statementQuestions.push({ lesson: it.lesson, id: it.id, prompt: it.prompt, key, options: it.options!.map((o) => o.label), code: it.code, kotlinc: { stage: r.stage, output: realOut, error: r.errors?.[0] } });
  }
  // Findings reviewed by a person and accepted, with the reason (scripts/compare-errors/content-accepted.json).
  const acceptedFile = path.resolve('scripts/compare-errors/content-accepted.json');
  const accepted: Record<string, string> = fs.existsSync(acceptedFile) ? JSON.parse(fs.readFileSync(acceptedFile, 'utf8')) : {};
  for (let i = findings.length - 1; i >= 0; i--) if (accepted[findings[i].item.id]) findings.splice(i, 1);
  const byLesson = (f: Finding) => `${f.item.lesson} ${f.item.kind} ${f.item.id}`;
  findings.sort((a, b) => (a.severity === b.severity ? byLesson(a).localeCompare(byLesson(b)) : a.severity === 'WRONG KEY' ? -1 : 1));
  let md = `# Lesson content vs real Kotlin\n\n${items.length} programs · ${checked} checked · ${notCheckable} Predict statement questions not machine-checkable · ${nondeterministic} skipped (output differs between real runs)\n\n`;
  md += `- **WRONG KEY**: real Kotlin contradicts the marked answer or stored output (${findings.filter((f) => f.severity === 'WRONG KEY').length})\n- **CHECK**: needs a human look, often a code fragment that only runs inside a larger program, or wording the script cannot match (${findings.filter((f) => f.severity === 'CHECK').length})\n\n`;
  for (const f of findings) md += `- **${f.severity}** \`${f.item.lesson}\` ${f.item.kind} \`${f.item.id}\`${f.item.prompt ? ` (“${f.item.prompt.slice(0, 70)}”)` : ''}\n  - ${f.detail}\n`;
  fs.writeFileSync(path.join(OUT, 'content-check.md'), md);
  fs.writeFileSync(path.join(OUT, 'content-statement-questions.json'), JSON.stringify(statementQuestions, null, 1));
  fs.writeFileSync(path.join(OUT, 'content-check.json'), JSON.stringify(findings.map((f) => ({ severity: f.severity, lesson: f.item.lesson, kind: f.item.kind, id: f.item.id, prompt: f.item.prompt, detail: f.detail, code: f.item.code })), null, 1));
  console.log(`\n${checked} checked · WRONG KEY ${findings.filter((f) => f.severity === 'WRONG KEY').length} · CHECK ${findings.filter((f) => f.severity === 'CHECK').length} · not checkable ${notCheckable} · nondeterministic ${nondeterministic}`);
  console.log(`Report: ${path.join(OUT, 'content-check.md')}`);
  process.exit(findings.some((f) => f.severity === 'WRONG KEY') ? 2 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
