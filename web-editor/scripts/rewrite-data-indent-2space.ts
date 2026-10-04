/**
 * One-off, AST-based rewrite of every authored Kotlin code string under src/data from 4-space to 2-space indentation.
 *
 * Only the run of LEADING SPACES on each line is touched (halved), directly in the source text, so every other
 * character of every literal -- quotes, escapes, `\$`, `\"`, line endings -- is preserved byte for byte. The rule is
 * exactly the editor's `toEditorIndent`: a code unit is converted only if every indented line outside a `"""` raw
 * string is a multiple of 4; anything else (already 2-space, mixed, tabs) is left alone and reported.
 *
 * A "unit" is one code string (initialCode, solutionCode, ...) or one array of code lines (code, codeSnippet, ...).
 *
 * Usage: tsx scripts/rewrite-data-indent-2space.ts [--apply | --check]    (dry run by default; --check exits 1 if any 4-space unit remains)
 * Verify afterwards with scripts/dump-data-exports.ts before/after + scripts/verify-indent-rewrite.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Node, Project, SyntaxKind, type SourceFile } from 'ts-morph';

const APPLY = process.argv.includes('--apply');
const EXCLUDE = /OLD_BACKUP|LessonsDataOld/;

const STRING_KEYS = new Set(['initialCode', 'solutionCode', 'brokenCode', 'fixedCode', 'broken', 'fixed', 'initial', 'solution']);
const LINE_ARRAY_KEYS = new Set(['code', 'codeSnippet', 'example', 'badCode', 'fixedCode', 'leftCode', 'rightCode', 'exampleSnippet']);

type Lit = import('ts-morph').StringLiteral | import('ts-morph').NoSubstitutionTemplateLiteral;
const isLit = (n: Node | undefined): n is Lit => !!n && (Node.isStringLiteral(n) || Node.isNoSubstitutionTemplateLiteral(n));

interface Seg {
  /** Absolute offset in the source file of this logical line's first raw character. */
  abs: number;
  raw: string;
}

/** Splits a literal's raw source into logical lines: real newlines (templates) and `\n` escapes (quoted strings). */
function segmentsOf(lit: Lit): Seg[] {
  const start = lit.getStart() + 1;
  const raw = lit.getText().slice(1, -1);
  const segs: Seg[] = [];
  let segStart = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\\') {
      if (raw[i + 1] === 'n') {
        segs.push({ abs: start + segStart, raw: raw.slice(segStart, i) });
        segStart = i + 2;
      }
      i++;
    } else if (c === '\n') {
      segs.push({ abs: start + segStart, raw: raw.slice(segStart, i) });
      segStart = i + 1;
    }
  }
  segs.push({ abs: start + segStart, raw: raw.slice(segStart) });
  return segs;
}

interface Edit {
  pos: number;
  remove: number;
  insert: string;
}

type UnitResult = { status: 'changed'; edits: Edit[] } | { status: 'skipped'; reason: string };

function convertUnit(lits: Lit[]): UnitResult {
  const lines: Seg[] = lits.flatMap(segmentsOf);
  const raw: boolean[] = [];
  let insideRaw = false;
  for (const l of lines) {
    raw.push(insideRaw);
    const decoded = l.raw.replace(/\\(["'])/g, '$1');
    if (((decoded.match(/"""/g) ?? []).length % 2) === 1) insideRaw = !insideRaw;
  }
  const indents: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (raw[i]) continue;
    const l = lines[i].raw;
    if (/^\s*$/.test(l)) continue;
    if (/^(\t|\\t)/.test(l)) return { status: 'skipped', reason: 'tab indentation' };
    const n = (l.match(/^ */) as RegExpMatchArray)[0].length;
    if (n > 0) indents.push(n);
  }
  if (!indents.length) return { status: 'skipped', reason: 'no indented lines' };
  if (indents.some((n) => n % 4 !== 0)) return { status: 'skipped', reason: 'indent not a multiple of 4 (already 2-space or mixed)' };
  const edits: Edit[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (raw[i] || /^\s*$/.test(lines[i].raw)) continue;
    const n = (lines[i].raw.match(/^ */) as RegExpMatchArray)[0].length;
    if (n > 0) edits.push({ pos: lines[i].abs, remove: n, insert: ' '.repeat(n / 2) });
  }
  return { status: 'changed', edits };
}

function propName(p: import('ts-morph').PropertyAssignment): string {
  return p.getName().replace(/^["'`]|["'`]$/g, '');
}

function unitsOf(sf: SourceFile, report: (msg: string) => void): Lit[][] {
  const units: Lit[][] = [];
  const claimed = new Set<Node>();
  const claim = (lits: Lit[]) => {
    if (lits.some((l) => claimed.has(l))) return;
    lits.forEach((l) => claimed.add(l));
    units.push(lits);
  };
  for (const p of sf.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
    const name = propName(p);
    const init = p.getInitializer();
    if (!init) continue;
    if ((STRING_KEYS.has(name) || LINE_ARRAY_KEYS.has(name)) && isLit(init)) claim([init]);
    else if (LINE_ARRAY_KEYS.has(name) && Node.isArrayLiteralExpression(init)) {
      const els = init.getElements();
      if (els.length && els.every(isLit)) claim(els as Lit[]);
      else if (els.length) report(`line ${p.getStartLineNumber()}: ${name}[] has non-literal elements, skipped`);
    } else if (STRING_KEYS.has(name) && Node.isTemplateExpression(init)) {
      report(`line ${p.getStartLineNumber()}: ${name} is a template with \${} substitutions, skipped`);
    }
  }
  // Un-keyed code strings passed straight into a helper call, e.g. extendNullSafety(LESSON, 'title', '...code...').
  for (const call of sf.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    for (const arg of call.getArguments()) {
      if (!isLit(arg) || claimed.has(arg)) continue;
      const text = arg.getLiteralText();
      if (/\n {4}\S/.test(text) && /[{}]|\b(fun|val|var|println)\b/.test(text)) claim([arg]);
    }
  }
  return units;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.tsx?$/.test(e.name) && !EXCLUDE.test(e.name) ? [p] : [];
  });
}

const project = new Project({ tsConfigFilePath: 'tsconfig.json', skipAddingFilesFromTsConfig: true });
let totalChanged = 0;
let totalSkipped = 0;
for (const file of walk('src/data').sort()) {
  const sf = project.addSourceFileAtPath(file);
  const notes: string[] = [];
  let changed = 0;
  const skipReasons = new Map<string, number>();
  const edits: Edit[] = [];
  for (const unit of unitsOf(sf, (m) => notes.push(m))) {
    const res = convertUnit(unit);
    if (res.status === 'changed') {
      changed++;
      edits.push(...res.edits);
    } else if (res.reason !== 'no indented lines') {
      skipReasons.set(res.reason, (skipReasons.get(res.reason) ?? 0) + 1);
    }
  }
  const skipped = [...skipReasons.values()].reduce((a, b) => a + b, 0);
  totalChanged += changed;
  totalSkipped += skipped;
  if (changed || skipped || notes.length) {
    console.log(`${file}: ${changed} converted, ${skipped} skipped${[...skipReasons].map(([r, n]) => ` [${n}x ${r}]`).join('')}`);
    notes.forEach((n) => console.log(`    ${n}`));
  }
  if (APPLY && edits.length) {
    let text = sf.getFullText();
    for (const e of edits.sort((a, b) => b.pos - a.pos)) text = text.slice(0, e.pos) + e.insert + text.slice(e.pos + e.remove);
    fs.writeFileSync(file, text);
  }
}
console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${totalChanged} units converted, ${totalSkipped} skipped`);
if (process.argv.includes('--check') && totalChanged > 0) {
  console.error('Found code still indented with 4 spaces -- run: tsx scripts/rewrite-data-indent-2space.ts --apply');
  process.exit(1);
}
