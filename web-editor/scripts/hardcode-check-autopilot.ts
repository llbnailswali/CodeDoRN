/**
 * Semi-automated hardcodeCheck proposer + verifier + patcher for every
 * five-stage curriculum lesson's writeRun stage, across every world.
 *
 * For each writeRun without a hardcodeCheck already:
 *  1. Extracts candidate declarations from solutionCode whose RHS is a bare
 *     literal (number/string/char/boolean) -- the only shape applyInputSwaps
 *     (kotlinRunner.ts) can safely target.
 *  2. Nudges the literal to a different value, applies the swap to the SAME
 *     solutionCode text, and actually runs it through compileAndRunKotlin --
 *     never hand-computes the alternate output.
 *  3. Accepts the first candidate whose mutated run succeeds AND produces a
 *     genuinely different output from the original expectedOutput.
 *  4. Skips (never auto-applies) any lesson whose description contains
 *     hedging language like "(or setting it to 75)" -- see World 1's
 *     val-vs-var lesson: a task that explicitly allows multiple equally
 *     valid solution shapes can't be swap-tested safely without risking a
 *     false rejection of a legitimate alternate approach.
 *  5. Re-verifies the accepted candidate end-to-end via runKotlinCode:
 *     solution passes, bare-literal cheat rejected, laundered cheat rejected.
 *  6. In --apply mode, patches the candidate into the world's own
 *     worldNLessonsData.ts source, anchored on the lesson's unique writeRun
 *     `title` string (never on solutionCode itself, since Kotlin string
 *     templates like `${x}` are backslash-escaped in the TS source but not
 *     in the parsed runtime string -- an anchor built from the parsed value
 *     would silently fail to match for any lesson using string templates).
 *
 * Usage:
 *   npx tsx scripts/hardcode-check-autopilot.ts world-3 world-4 ...   (dry run, report only)
 *   npx tsx scripts/hardcode-check-autopilot.ts --apply world-3 ...  (writes the files)
 */
import fs from 'node:fs';
import path from 'node:path';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { compileAndRunKotlin, runKotlinCode } from '../src/utils/kotlinRunner';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const worldIds = args.filter(a => a.startsWith('world-'));

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Kind = 'number' | 'string' | 'char' | 'boolean';
interface Candidate { variableName: string; originalLiteral: string; kind: Kind }

function extractDeclCandidates(code: string): Candidate[] {
  const out: Candidate[] = [];
  const declRe = /^\s*(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[A-Za-z0-9_<>?.,\s]+)?\s*=\s*(.+?)\s*$/;
  for (const line of code.split('\n')) {
    const noComment = line.replace(/\/\/.*$/, '');
    const m = noComment.match(declRe);
    if (!m) continue;
    const [, name, rhs] = m;
    const trimmed = rhs.trim();
    if (/^-?\d[\d_]*(\.[\d_]+)?[fFdDL]?$/.test(trimmed)) out.push({ variableName: name, originalLiteral: trimmed, kind: 'number' });
    else if (/^"(?:[^"\\]|\\.)*"$/.test(trimmed)) out.push({ variableName: name, originalLiteral: trimmed, kind: 'string' });
    else if (/^'(?:[^'\\]|\\.)'$/.test(trimmed)) out.push({ variableName: name, originalLiteral: trimmed, kind: 'char' });
    else if (/^(?:true|false)$/.test(trimmed)) out.push({ variableName: name, originalLiteral: trimmed, kind: 'boolean' });
  }
  return out;
}

function nudge(kind: Kind, literal: string): string | null {
  if (kind === 'boolean') return literal === 'true' ? 'false' : 'true';
  if (kind === 'char') {
    const inner = literal.slice(1, -1);
    if (inner.length !== 1) return null; // skip escape sequences, too fragile to nudge safely
    const code = inner.charCodeAt(0);
    const next = code + 1 <= 122 ? code + 1 : code - 1;
    return `'${String.fromCharCode(next)}'`;
  }
  if (kind === 'string') {
    const inner = literal.slice(1, -1);
    return `"${inner}X"`;
  }
  // number
  const m = literal.match(/^(-?)([\d_]+)(\.[\d_]+)?([fFdDL]?)$/);
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const intPart = parseInt(m[2].replace(/_/g, ''), 10);
  const suffix = m[4] || '';
  if (m[3]) {
    const decPart = parseFloat('0' + m[3].replace(/_/g, ''));
    const original = sign * (intPart + decPart);
    const bumped = original === 0 ? 1.5 : original + Math.sign(original) * (Math.abs(original) * 0.5 + 0.25);
    return (Math.round(bumped * 100) / 100).toString() + suffix;
  }
  const original = sign * intPart;
  const delta = original === 0 ? 3 : Math.max(1, Math.round(Math.abs(original) * 0.4)) + 1;
  const bumped = original + (original >= 0 ? delta : -delta);
  return bumped.toString() + suffix;
}

function applySwapToCode(code: string, variableName: string, originalLiteral: string, alternateLiteral: string): string | null {
  const pattern = new RegExp(`(\\b(?:val|var)\\s+${escapeRegExp(variableName)}\\b[^=\\n]*=\\s*)${escapeRegExp(originalLiteral)}(?![\\w.])`);
  if (!pattern.test(code)) return null;
  return code.replace(pattern, `$1${alternateLiteral}`);
}

/** Serializes a value as a single-quoted TS string literal, matching this
 * codebase's own style (real newlines encoded as literal `\n` text, the way
 * `expectedOutput: 'Alex\n10'` already appears in these files). */
function tsString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, "\\'");
  return `'${escaped}'`;
}

interface Accepted {
  lessonId: string;
  worldId: string;
  filePath: string;
  title: string;
  variableName: string;
  originalLiteral: string;
  alternateLiteral: string;
  alternateExpectedOutput: string;
}

const accepted: Accepted[] = [];
const skipped: { lessonId: string; reason: string }[] = [];

async function scanWorld(worldId: string) {
  const world = CODEDO_MASTER_WORLDS.find(w => w.id === worldId);
  if (!world) { console.log(`${worldId}: not found in catalog`); return; }
  const worldNum = worldId.replace('world-', '');
  const filePath = path.join('src/data/curriculum', `world${worldNum}LessonsData.ts`);
  if (!fs.existsSync(filePath)) { console.log(`${worldId}: no data file at ${filePath}`); return; }

  for (const entry of world.lessons) {
    const lesson = entry.fiveStageLessonKey ? AVAILABLE_FIVE_STAGE_LESSONS[entry.fiveStageLessonKey] : undefined;
    if (!lesson || !lesson.writeRun) continue;
    const write = lesson.writeRun;
    if (write.hardcodeCheck) continue;

    if (/\(or\b/i.test(write.description)) {
      skipped.push({ lessonId: lesson.id, reason: `hedging language in description suggests multiple valid solution shapes (needs manual review): "${write.description.match(/\([^)]*\)/)?.[0] ?? ''}"` });
      continue;
    }

    const candidates = extractDeclCandidates(write.solutionCode);
    let foundOne = false;
    for (const cand of candidates.slice(0, 6)) {
      const alt = nudge(cand.kind, cand.originalLiteral);
      if (alt === null) continue;
      const mutatedCode = applySwapToCode(write.solutionCode, cand.variableName, cand.originalLiteral, alt);
      if (mutatedCode === null) continue;
      const result = await compileAndRunKotlin(mutatedCode);
      if (!result.success) continue;
      const normOutput = result.output.trim().replace(/\r\n/g, '\n');
      const normExpected = write.expectedOutput.trim().replace(/\r\n/g, '\n');
      if (normOutput === normExpected) continue; // swap didn't change anything real -- not a useful candidate

      // End-to-end re-verification before accepting.
      const hardcodeCheck = { inputSwaps: [{ variableName: cand.variableName, originalLiteral: cand.originalLiteral, alternateLiteral: alt }], alternateExpectedOutput: normOutput };
      const solutionResult = await runKotlinCode(write.solutionCode, write.expectedOutput, write.testCase, hardcodeCheck);
      if (!solutionResult.success) continue;
      const cheatCode = `fun main() {\n    println(${JSON.stringify(write.expectedOutput)})\n}`;
      const cheatResult = await runKotlinCode(cheatCode, write.expectedOutput, write.testCase, hardcodeCheck);
      if (cheatResult.success) continue; // static check somehow didn't catch it -- don't trust this candidate
      const declarationLines = write.solutionCode.split('\n').filter(l => /^\s*(val|var)\b/.test(l)).join('\n');
      const laundered = `fun main() {\n${declarationLines}\n    val answer = ${JSON.stringify(write.expectedOutput)}\n    println(answer)\n}`;
      const launderedResult = await runKotlinCode(laundered, write.expectedOutput, write.testCase, hardcodeCheck);
      if (launderedResult.success) continue; // input swap didn't actually catch laundering -- don't trust this candidate

      accepted.push({
        lessonId: lesson.id, worldId, filePath, title: write.title,
        variableName: cand.variableName, originalLiteral: cand.originalLiteral,
        alternateLiteral: alt, alternateExpectedOutput: normOutput,
      });
      foundOne = true;
      break;
    }
    if (!foundOne) {
      skipped.push({ lessonId: lesson.id, reason: candidates.length === 0 ? 'no literal-initialized val/var found in solutionCode' : 'no candidate swap produced a verified, differing output' });
    }
  }
}

function applyPatches() {
  const byFile = new Map<string, Accepted[]>();
  for (const a of accepted) {
    if (!byFile.has(a.filePath)) byFile.set(a.filePath, []);
    byFile.get(a.filePath)!.push(a);
  }
  for (const [filePath, patches] of byFile) {
    let text = fs.readFileSync(filePath, 'utf8');
    for (const p of patches) {
      const titleAnchor = `title: ${tsString(p.title)},`;
      const titleIdx = text.indexOf(titleAnchor);
      if (titleIdx === -1) { console.log(`  SKIP APPLY (${p.lessonId}): title anchor not found verbatim`); continue; }
      const testCaseIdx = text.indexOf('testCase: {', titleIdx);
      if (testCaseIdx === -1 || testCaseIdx - titleIdx > 3000) { console.log(`  SKIP APPLY (${p.lessonId}): testCase not found near title`); continue; }
      // Brace-match from the `{` right after "testCase: "
      let i = text.indexOf('{', testCaseIdx);
      let depth = 1; i++;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        i++;
      }
      const insertion = `,\n    hardcodeCheck: {\n      inputSwaps: [{ variableName: ${tsString(p.variableName)}, originalLiteral: ${tsString(p.originalLiteral)}, alternateLiteral: ${tsString(p.alternateLiteral)} }],\n      alternateExpectedOutput: ${tsString(p.alternateExpectedOutput)},\n    }`;
      text = text.slice(0, i) + insertion + text.slice(i);
    }
    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`Patched ${filePath}: ${patches.length} lesson(s)`);
  }
}

async function main() {
  for (const worldId of worldIds) await scanWorld(worldId);

  console.log(`\n=== Accepted (${accepted.length}) ===`);
  for (const a of accepted) console.log(`  ${a.lessonId}: swap ${a.variableName} ${a.originalLiteral} -> ${a.alternateLiteral}`);

  console.log(`\n=== Skipped / needs manual review (${skipped.length}) ===`);
  for (const s of skipped) console.log(`  ${s.lessonId}: ${s.reason}`);

  if (APPLY) {
    console.log('\n--apply: writing files...');
    applyPatches();
  } else {
    console.log('\n(dry run -- pass --apply to write these into the data files)');
  }
}

main();
