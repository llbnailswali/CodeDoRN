/**
 * Practice-bank wording pass runner. Usage (see PRACTICE_CONTENT_PASS.md):
 *   tsx scripts/practice-content-pass/run.ts dump <world> <out.txt>        readable text of every task (to author from)
 *   tsx scripts/practice-content-pass/run.ts snapshot <world> <out.json>   save the world's current data
 *   tsx scripts/practice-content-pass/run.ts apply <world> [--dry]         write the content from world<N>.data.ts
 *   tsx scripts/practice-content-pass/run.ts verify <world> <before.json>  prove only text fields changed
 *   tsx scripts/practice-content-pass/run.ts lint [world]                  step/comment/level checks (all worlds if omitted)
 * `snapshot`, `verify` and `lint` import the bank, so run each in its own process (never in the same one as `apply`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Node, Project, SyntaxKind, type ObjectLiteralExpression, type PropertyAssignment } from 'ts-morph';

const [command, worldArg, extra] = process.argv.slice(2);
const world = Number(worldArg);
const bankFile = (n: number) => `src/data/practiceBank/world${n}PracticeProblems.ts`;

const plain = (t: string) => t.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1');
/** The editor comment for a step: `// N. ` + the step as plain text on ONE line. */
const toComment = (n: number, step: string) => `// ${n}. ${plain(step).replace(/\s*\n\s*/g, ' ').trim()}`;
const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
const concat = (ps: string[]) => ps.map((p, i) => q(i < ps.length - 1 ? p + '\n\n' : p)).join(' +\n      ');
const levelText = (steps: string[]) => {
  const numbered = steps.map((s, k) => `${k + 1}. ${s}`);
  return `{\n        steps: [\n${numbered.map((s) => `          ${q(s)},`).join('\n')}\n        ],\n        comments: [\n${numbered.map((s, k) => `          ${q(toComment(k + 1, s.replace(/^\d+\.\s/, '')))},`).join('\n')}\n        ],\n      }`;
};

/** Re-indents every generated `levelHints: { ... }` block to the file's 2-space style. */
function reindentLevelHints(file: string) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; ) {
    if (/^\s*levelHints: \{$/.test(lines[i])) {
      let depth = 0;
      do {
        const l = lines[i].trim();
        const t = l.replace(/'(?:[^'\\]|\\.)*'/g, '');
        const lead = /^[\]}]+/.exec(l)?.[0].length ?? 0;
        out.push('    ' + '  '.repeat(depth - lead) + l);
        depth += (t.match(/[[{]/g) ?? []).length - (t.match(/[\]}]/g) ?? []).length;
        i++;
      } while (depth !== 0);
    } else out.push(lines[i++]);
  }
  fs.writeFileSync(file, out.join('\n'));
}

async function apply() {
  const data = await import(pathToFileURL(path.resolve(`scripts/practice-content-pass/world${world}.data.ts`)).href);
  const { WR_DATA, DBG_DATA } = data as { WR_DATA: Record<string, any>; DBG_DATA: Record<string, any> };
  const project = new Project({ tsConfigFilePath: 'tsconfig.json', skipAddingFilesFromTsConfig: true });
  const sf = project.addSourceFileAtPath(bankFile(world));
  const problems: string[] = [];
  const find = (id: string): ObjectLiteralExpression | undefined => sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression).find((o) => {
    const p = o.getProperty('id');
    return p && Node.isPropertyAssignment(p) && p.getInitializer()?.getText().replace(/['"`]/g, '') === id;
  });
  const set = (o: ObjectLiteralExpression, name: string, text: string) => (o.getPropertyOrThrow(name) as PropertyAssignment).setInitializer(text);
  let wr = 0, dbg = 0;
  for (const [key, d] of Object.entries(WR_DATA)) {
    const id = `world-${world}-practice-writerun-${key}`;
    const o = find(id);
    if (!o) { problems.push(`${id}: not found`); continue; }
    const n = d.steps.length;
    if (d.i.length !== n || d.e.length !== n) problems.push(`${id}: level steps ${d.i.length}/${d.e.length} for ${n}`);
    set(o, 'summary', q(d.summary));
    set(o, 'goal', q(d.goal));
    set(o, 'description', concat([...(d.setup ? [d.setup] : []), ...d.steps.map((s: string, k: number) => `${k + 1}. ${s}`)]));
    // Beginner starter comments = the detailed steps, one line each, separated by blank lines
    const init = o.getPropertyOrThrow('initialCode') as PropertyAssignment;
    const isTpl = init.getInitializerOrThrow().getText().startsWith('`');
    const lines = init.getInitializerOrThrow().getText().split('\n');
    const isStep = (l: string) => /^\s*`?\/\/\s*\d+[a-z]?\./.test(l);
    const first = lines.findIndex(isStep);
    const last = lines.map(isStep).lastIndexOf(true);
    if (first < 0) { problems.push(`${id}: no step comments in the starter`); continue; }
    const codeBetween = lines.slice(first, last + 1).some((l) => !/^\s*(`?\/\/.*)?$/.test(l));
    if (codeBetween) {
      // Step comments are split by code (e.g. a function above main): replace each comment line in place.
      const at = lines.map((l, k) => (isStep(l) ? k : -1)).filter((k) => k >= 0);
      if (at.length !== n) { problems.push(`${id}: ${at.length} step comments for ${n} steps`); continue; }
      d.steps.forEach((st: string, k: number) => {
        const m = /^(\s*`?)/.exec(lines[at[k]])![1];
        const c = toComment(k + 1, st);
        lines[at[k]] = m + (isTpl ? c.replace(/\\/g, '\\\\').replace(/\$\{/g, '\\${') : c);
      });
      init.setInitializer(lines.join('\n'));
      o.getProperty('levelHints')?.remove();
      const ix = o.getProperties().indexOf(o.getProperty('description')!) + 1;
      o.insertPropertyAssignment(ix, { name: 'levelHints', initializer: `{\n      intermediate: ${levelText(d.i)},\n      experienced: ${levelText(d.e)},\n    }` });
      wr++;
      continue;
    }
    const indent = /^(\s*)`?\/\//.exec(lines[first])![1];
    const prefix = /^(\s*`?)/.exec(lines[first])![1];
    const block: string[] = [];
    d.steps.forEach((s: string, k: number) => { block.push((k === 0 ? prefix : indent) + (isTpl ? toComment(k + 1, s).replace(/\\/g, '\\\\').replace(/\$\{/g, '\\${') : toComment(k + 1, s))); if (k < n - 1) block.push(''); });
    lines.splice(first, last - first + 1, ...block);
    init.setInitializer(lines.join('\n'));
    o.getProperty('levelHints')?.remove();
    const idx = o.getProperties().indexOf(o.getProperty('description')!) + 1;
    o.insertPropertyAssignment(idx, { name: 'levelHints', initializer: `{\n      intermediate: ${levelText(d.i)},\n      experienced: ${levelText(d.e)},\n    }` });
    wr++;
  }
  for (const [key, d] of Object.entries(DBG_DATA)) {
    const id = `world-${world}-practice-debug-${key}`;
    const o = find(id);
    if (!o) { problems.push(`${id}: not found`); continue; }
    set(o, 'subtitle', q(d.subtitle));
    set(o, 'hints', `[\n${d.hints.map((h: string) => `      ${q(h)},`).join('\n')}\n    ]`);
    set(o, 'explanation', q(d.explanation));
    dbg++;
  }
  console.log(`Write & Run ${wr}, Debug ${dbg}`);
  if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exit(1); }
  if (extra === '--dry') { console.log('dry run, nothing written'); return; }
  sf.saveSync();
  reindentLevelHints(bankFile(world));
  console.log('written');
}

async function loadBank() {
  return import(pathToFileURL(path.resolve('src/data/practiceBank/index.ts')).href) as Promise<typeof import('../../src/data/practiceBank')>;
}

async function dump() {
  const bank = await loadBank();
  const wr = bank.PRACTICE_WRITE_RUN_BANK[`world-${world}`] ?? [];
  const dbg = bank.PRACTICE_DEBUG_BANK[`world-${world}`] ?? [];
  let out = '';
  wr.forEach((p, i) => {
    out += `\n##### WRITE & RUN ${i + 1}/${wr.length}  ${p.id}  [${p.difficulty}]\nSUMMARY: ${p.summary}\nGOAL: ${p.goal}\nDESCRIPTION:\n${p.description}\nSTARTER:\n${p.initialCode}\nSOLUTION:\n${p.solutionCode}\nEXPECTED: ${JSON.stringify(p.expectedOutput)}\n`;
  });
  dbg.forEach((p, i) => {
    out += `\n##### DEBUG ${i + 1}/${dbg.length}  ${p.id}  [${p.difficulty}] ${p.bugType}\nSUMMARY: ${p.summary}\nSUBTITLE: ${p.subtitle}\nHINTS:\n- ${p.hints.join('\n- ')}\nEXPLANATION: ${p.explanation}\nEXPECTED: ${JSON.stringify(p.expectedOutput)}\nBROKEN:\n${p.brokenCode}\nFIXED:\n${p.fixedCode}\n`;
  });
  fs.writeFileSync(extra, out);
  console.log(`wrote ${wr.length} Write & Run and ${dbg.length} Debug tasks of world ${world} to ${extra}`);
}

async function snapshot() {
  const bank = await loadBank();
  fs.writeFileSync(extra, JSON.stringify({ wr: bank.PRACTICE_WRITE_RUN_BANK[`world-${world}`], dbg: bank.PRACTICE_DEBUG_BANK[`world-${world}`] }));
  console.log(`saved world ${world} to ${extra}`);
}

async function verify() {
  const before = JSON.parse(fs.readFileSync(extra, 'utf8'));
  const bank = await loadBank();
  const after = { wr: bank.PRACTICE_WRITE_RUN_BANK[`world-${world}`] as any[], dbg: bank.PRACTICE_DEBUG_BANK[`world-${world}`] as any[] };
  const nonStep = (c: string) => c.split('\n').filter((l) => !/^\s*\/\/\s*\d+[a-z]?\./.test(l)).map((l) => l.trim()).filter(Boolean).join('\n');
  const TEXT_WR = new Set(['summary', 'goal', 'description', 'levelHints']);
  const TEXT_DBG = new Set(['subtitle', 'hints', 'explanation']);
  const bad: string[] = [];
  for (const kind of ['wr', 'dbg'] as const) {
    if (before[kind].length !== after[kind].length) bad.push(`${kind}: task count changed`);
    before[kind].forEach((x: any, i: number) => {
      const y = after[kind][i];
      if (x.id !== y.id) bad.push(`order changed at ${x.id}`);
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        if ((kind === 'wr' ? TEXT_WR : TEXT_DBG).has(k)) continue;
        if (k === 'initialCode') { if (nonStep(x[k]) !== nonStep(y[k])) bad.push(`${x.id}: initialCode changed beyond the step comments`); continue; }
        if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) bad.push(`${x.id}: non-text field "${k}" changed`);
      }
    });
  }
  console.log(bad.length ? 'PROBLEMS:\n' + bad.join('\n') : `Only text fields changed for all ${after.wr.length + after.dbg.length} world-${world} tasks.`);
  if (bad.length) process.exit(1);
}

async function lint() {
  const bank = await loadBank();
  const worlds = worldArg ? [`world-${world}`] : Object.keys(bank.PRACTICE_WRITE_RUN_BANK);
  const len = (t: string) => plain(t).length;
  const problems: string[] = [];
  let tasks = 0;
  for (const w of worlds) {
    for (const p of bank.PRACTICE_WRITE_RUN_BANK[w] ?? []) {
      tasks++;
      const steps = p.description.split('\n\n').filter((x) => /^\d+\.\s/.test(x.trim()));
      const comments = p.initialCode.split('\n').filter((l) => /^\s*\/\/\s*\d+\./.test(l));
      if (steps.length !== comments.length) problems.push(`${p.id}: ${steps.length} steps but ${comments.length} starter comments`);
      if (!p.levelHints) { problems.push(`${p.id}: no levelHints (still the old wording)`); continue; }
      let prev = steps.map(len);
      for (const level of ['intermediate', 'experienced'] as const) {
        const lv = p.levelHints[level];
        if (!lv || lv.steps.length !== steps.length || lv.comments.length !== steps.length) { problems.push(`${p.id}: ${level} levelHints do not match the ${steps.length} steps`); continue; }
        lv.steps.forEach((s, i) => { if (len(s) > prev[i]) problems.push(`${p.id}: ${level} step ${i + 1} is longer than the more detailed level (enrich the more detailed one)`); });
        prev = lv.steps.map(len);
      }
    }
  }
  console.log(problems.length ? `${problems.length} finding(s) in ${tasks} task(s):\n` + problems.join('\n') : `${tasks} task(s): no findings`);
}

const commands: Record<string, () => Promise<void>> = { apply, dump, snapshot, verify, lint };
if (!commands[command]) { console.log('usage: run.ts dump|snapshot|apply|verify|lint <world> [file|--dry]'); process.exit(1); }
await commands[command]();
