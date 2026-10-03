/**
 * "Apply Solution"/"Apply Fix" used to replace the editor's content
 * wholesale with `solutionCode`/`fixedCode` -- both of which are authored
 * as clean, final programs with none of the starter's numbered `// 1. ...`
 * helper comments (those only ever live in `initialCode`/`brokenCode`).
 * That silently discarded every hint the moment a learner used the
 * shortcut, even though the comments are exactly what a learner re-reading
 * the applied solution would want to see. This preserves them instead of
 * dropping them, placed inside `fun main() { ... }`'s body (where the
 * numbered steps are actually about), not above the whole file.
 *
 * Deliberately a simple, position-agnostic merge rather than an attempt to
 * re-insert each comment next to whichever solution line "replaced" it --
 * `solutionCode` is authored as a wholly separate, often shorter and
 * differently-structured program (see e.g. the String Templates lesson,
 * whose solutionCode drops the blank line + comment entirely rather than
 * filling in beneath them), so there is no reliable line-for-line
 * correspondence to exploit. Prepending the extracted comments right after
 * the opening brace of `main` is safe, deterministic, and requires no
 * per-lesson data changes across any of the 17 already-shipped worlds.
 *
 * This is now only the FALLBACK. `applySolutionPreservingComments` (below) first tries to put every comment right
 * above the solution lines that answer it, and uses this when it cannot do so safely.
 */
function prependCommentsToMain(sourceCode: string, solutionCode: string): string {
  const comments = sourceCode
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('//'))
    // Skip a comment already present verbatim in the solution -- avoids a
    // duplicate line for the rare case a hint comment survives into
    // solutionCode as-is.
    .filter((line) => !solutionCode.includes(line));

  if (comments.length === 0) return solutionCode;

  // Find `main`'s opening brace specifically -- a solution occasionally
  // defines helper functions/classes before `main`, and the numbered steps
  // are about what happens inside main's body, not those helpers. Falls
  // back to the very first `{` in the file if there's no `fun main(...)` at
  // all (e.g. a lesson whose graded function isn't literally named main),
  // and to plain prepending if the code has no brace to insert into.
  const mainMatch = /\bfun\s+main\s*\([^)]*\)[^{]*\{/.exec(solutionCode);
  const braceIndex = mainMatch ? mainMatch.index + mainMatch[0].length - 1 : solutionCode.indexOf('{');

  if (braceIndex === -1) return `${comments.join('\n')}\n\n${solutionCode}`;

  const before = solutionCode.slice(0, braceIndex + 1);
  const after = solutionCode.slice(braceIndex + 1);

  // Match the existing body's own indentation rather than hardcoding one --
  // this codebase consistently uses 4 spaces, but nothing here should
  // silently depend on that.
  const firstBodyLine = after.split('\n').find((line) => line.trim().length > 0);
  const indent = firstBodyLine ? firstBodyLine.match(/^\s*/)?.[0] ?? '    ' : '    ';

  const indentedComments = comments.map((line) => `${indent}${line}`).join('\n');

  return `${before}\n${indentedComments}\n${after}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Placing each comment above the code that answers it.
//
// The starter is `declarations + // step comments`; the solution is the SAME declarations with the steps filled in.
// So: (1) align the starter's code lines with the solution's (longest common subsequence of trimmed lines), which
// leaves the lines the solution ADDED between two shared lines; (2) every run of consecutive starter comments that sat
// between the same two shared lines gets that added region split among them, one contiguous chunk per comment,
// choosing the split whose lines mention the most words of their comment (`Compute hours` -> `val hours = ...`,
// `Print ...` -> `println(...)`); (3) each comment is written immediately above its chunk. A split never falls inside
// a `{ ... }` block. When alignment is unusable, the old "comments at the top of main" merge is used instead.

const COMMENT_STOP_WORDS = new Set([
  'the', 'and', 'with', 'from', 'into', 'then', 'using', 'use', 'that', 'this', 'each', 'all', 'its', 'for',
  'print', 'prints', 'println', 'compute', 'computes', 'calculate', 'declare', 'create', 'write', 'call', 'define',
  'store', 'make', 'get', 'set', 'add', 'show', 'output', 'result', 'value', 'values', 'variable', 'line', 'lines',
  'inside', 'outside', 'main', 'step', 'todo', 'fun', 'val', 'var', 'when', 'also', 'more', 'than', 'your', 'you',
]);

const isCommentLine = (line: string) => line.trim().startsWith('//');
const isCodeLine = (line: string) => line.trim() !== '' && !isCommentLine(line);
// A line that can anchor the alignment: real code, but not a bare closing brace (every `}` looks alike).
const isAnchorLine = (line: string) => isCodeLine(line) && !/^\s*\}\s*$/.test(line);

function commentWords(comment: string): string[] {
  const text = comment.replace(/^\s*\/\/\s*(TODO\s*)?\d*[.):]?\s*/i, '');
  const words = text.match(/[A-Za-z][A-Za-z0-9_]*/g) ?? [];
  // camelCase identifiers also contribute their parts (leftAfterHours -> left, after, hours)
  const out = new Set<string>();
  for (const w of words) {
    const lower = w.toLowerCase();
    if (lower.length >= 3 && !COMMENT_STOP_WORDS.has(lower)) out.add(lower);
    for (const part of w.split(/(?=[A-Z])/)) {
      const pl = part.toLowerCase();
      if (pl.length >= 3 && !COMMENT_STOP_WORDS.has(pl)) out.add(pl);
    }
  }
  return [...out];
}

function lineScore(comment: string, words: string[], line: string): number {
  const lower = line.toLowerCase();
  let score = 0;
  for (const w of words) if (lower.includes(w)) score += 1;
  if (/\bprint(ln)?\b|\bshow|\bdisplay/i.test(comment) && /\bprintln?\s*\(/.test(line)) score += 2;
  return score;
}

/**
 * Cost of letting a new chunk (a comment) begin at each region line: 0 at the top level, a small cost INSIDE a block on
 * a line that starts a statement (a starter's sub-step comments often belong inside its loop or `if`), and Infinity
 * where a comment must never go (inside a triple-quoted string, or on a continuation line such as `.map { }`/`else`).
 */
function splitCosts(region: string[]): number[] {
  const cost: number[] = [];
  let depth = 0;
  let insideRaw = false;
  for (const line of region) {
    const t = line.trim();
    const continuation = /^(\.|\}|\)|else\b|&&|\|\||\+|-|\*|\/|\?:|,)/.test(t);
    cost.push(insideRaw ? Infinity : depth === 0 ? 0 : continuation ? Infinity : 0.6);
    if (((line.match(/"""/g) ?? []).length % 2) === 1) insideRaw = !insideRaw;
    for (const ch of line.replace(/"(?:\\.|[^"\\])*"/g, '')) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
  }
  return cost;
}

const EMPTY_CHUNK_COST = 1.5;

/** Start index in `region` of each comment's chunk (non-decreasing; chunks are contiguous and cover the region). */
function splitRegion(comments: string[], region: string[]): number[] {
  const k = comments.length;
  const m = region.length;
  if (m === 0) return comments.map(() => 0);
  const boundaryCost = splitCosts(region);
  const words = comments.map(commentWords);
  const score = (i: number, j: number) => lineScore(comments[i], words[i], region[j]);
  const NEG = -1e9;
  // best[i][a]: best total for comments 0..i-1 placed, with comment i's chunk starting at line a.
  const best: number[][] = Array.from({ length: k + 1 }, () => new Array(m + 1).fill(NEG));
  const from: number[][] = Array.from({ length: k + 1 }, () => new Array(m + 1).fill(-1));
  best[0][0] = 0;
  for (let i = 0; i < k; i++) {
    for (let a = 0; a <= m; a++) {
      if (best[i][a] === NEG) continue;
      for (let b = a; b <= m; b++) {
        if (i === k - 1 && b !== m) continue; // the last chunk runs to the end of the region
        if (i < k - 1 && b < m && boundaryCost[b] === Infinity) continue;
        // A chunk is worth its BEST line (the statement the comment describes), not the sum: a long block or a
        // raw string whose lines repeat the comment's words must not swallow the next comment's code.
        let gain = 0;
        for (let j = a; j < b; j++) gain = Math.max(gain, score(i, j));
        const penalty = (i < k - 1 && b < m ? boundaryCost[b] : 0) + (b === a ? EMPTY_CHUNK_COST : 0);
        // gentle preference for comparable chunk sizes when everything else ties
        const total = best[i][a] + gain - penalty - (b - a) * (b - a) * 0.001;
        if (total > best[i + 1][b]) {
          best[i + 1][b] = total;
          from[i + 1][b] = a;
        }
      }
    }
  }
  if (best[k][m] === NEG) return comments.map((_, i) => (i === 0 ? 0 : m));
  const starts: number[] = new Array(k).fill(0);
  let end = m;
  for (let i = k; i >= 1; i--) {
    const a = from[i][end];
    starts[i - 1] = a;
    end = a;
  }
  return starts;
}

/** LCS alignment of trimmed code lines; returns, for each starter line index, its solution line index or -1. */
function alignCodeLines(starter: string[], solution: string[]): number[] {
  const a = starter.map((l) => l.trim());
  const b = solution.map((l) => l.trim());
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] !== '' && isAnchorLine(starter[i]) && a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const map = new Array(n).fill(-1);
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] !== '' && isAnchorLine(starter[i]) && a[i] === b[j]) {
      map[i] = j;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return map;
}

function placeCommentsAboveTheirCode(sourceCode: string, solutionCode: string): string | null {
  const starter = sourceCode.replace(/\r\n/g, '\n').split('\n');
  const solution = solutionCode.replace(/\r\n/g, '\n').split('\n');
  // A comment is one BLOCK: a `// 1. ...` line plus the plain `//` lines directly under it (`//    1, 2 -> "x"`).
  const NEW_STEP = /^\s*\/\/\s*(TODO\b|\d+[.):])/;
  const comments: { l: string; i: number; lines: string[] }[] = [];
  for (let i = 0; i < starter.length; i++) {
    if (!isCommentLine(starter[i]) || solutionCode.includes(starter[i].trim())) continue;
    const lines = [starter[i].trim()];
    while (i + 1 < starter.length && isCommentLine(starter[i + 1]) && !NEW_STEP.test(starter[i + 1]) && !solutionCode.includes(starter[i + 1].trim())) {
      i++;
      lines.push(starter[i].trim());
    }
    comments.push({ l: lines.join(' '), i: i - lines.length + 1, lines });
  }
  if (comments.length === 0) return solutionCode;

  const starterCodeIdx = starter.map((l, i) => (isAnchorLine(l) ? i : -1)).filter((i) => i >= 0);
  const align = alignCodeLines(starter, solution);
  const matched = starterCodeIdx.filter((i) => align[i] >= 0);
  // Unusable when most of the starter's code is not in the solution (a rewritten program).
  if (starterCodeIdx.length > 0 && matched.length < Math.ceil(starterCodeIdx.length * 0.6)) return null;

  // Group consecutive comments (no matched code line between them) and find the solution region each group owns.
  const insertBefore = new Map<number, string[]>(); // solution line index -> comments to write above it
  const addAbove = (solIdx: number, texts: string[]) => insertBefore.set(solIdx, [...(insertBefore.get(solIdx) ?? []), ...texts]);
  let g = 0;
  while (g < comments.length) {
    let h = g;
    const prevMatched = (idx: number) => [...matched].reverse().find((i) => i < idx);
    const nextMatched = (idx: number) => matched.find((i) => i > idx);
    const afterA = prevMatched(comments[g].i);
    while (h + 1 < comments.length && prevMatched(comments[h + 1].i) === afterA) h++;
    const beforeA = nextMatched(comments[h].i);
    const regionStart = afterA === undefined ? 0 : align[afterA] + 1;
    const regionEnd = beforeA === undefined ? solution.length : align[beforeA];
    // In the solution, the added CODE lines between the two shared lines (blank lines and the solution's own comments are not content).
    const regionLines: { text: string; idx: number }[] = [];
    for (let j = regionStart; j < regionEnd; j++) if (isCodeLine(solution[j])) regionLines.push({ text: solution[j], idx: j });
    // Closing braces that end the enclosing block(s) belong after the region, not in a chunk.
    let balance = 0;
    for (const r of regionLines) for (const ch of r.text.replace(/"(?:\\.|[^"\\])*"/g, '')) balance += ch === '{' ? 1 : ch === '}' ? -1 : 0;
    while (balance < 0 && regionLines.length && /^\s*\}\s*$/.test(regionLines[regionLines.length - 1].text)) {
      regionLines.pop();
      balance++;
    }
    // Leading `}` lines close blocks opened before this region (the comment sits below them, not inside).
    let leadingClosers = 0;
    while (leadingClosers < regionLines.length && /^\s*\}\s*$/.test(regionLines[leadingClosers].text)) leadingClosers++;
    if (leadingClosers) regionLines.splice(0, leadingClosers);
    const group = comments.slice(g, h + 1);
    const starts = splitRegion(group.map((c) => c.l), regionLines.map((r) => r.text));
    // Comments whose chunk starts at the end of the region go just below its last code line (above the closing braces).
    const endIdx = beforeA === undefined ? (regionLines.length ? regionLines[regionLines.length - 1].idx + 1 : regionStart) : regionEnd;
    group.forEach((c, n) => {
      addAbove(starts[n] >= regionLines.length ? endIdx : regionLines[starts[n]].idx, c.lines);
    });
    g = h + 1;
  }

  // A comment must never land INSIDE a triple-quoted string (it would become part of the text): move it up to the
  // line where that string's statement begins.
  const rawInterior: boolean[] = [];
  {
    let inside = false;
    for (const line of solution) {
      rawInterior.push(inside);
      if (((line.match(/"""/g) ?? []).length % 2) === 1) inside = !inside;
    }
  }
  // Nor between a property and its accessor (`var x` ... `private set` / `get() = ...`): the accessor must follow it.
  const ACCESSOR = /^\s*((private|protected|internal)\s+)?(set|get)\b/;
  for (const key of [...insertBefore.keys()]) {
    let at = key;
    while (at > 0 && (rawInterior[at] || (at < solution.length && ACCESSOR.test(solution[at])))) {
      at--;
      while (at > 0 && solution[at].trim() === '') at--;
    }
    if (at !== key) {
      const moved = insertBefore.get(key)!;
      insertBefore.delete(key);
      insertBefore.set(at, [...(insertBefore.get(at) ?? []), ...moved]);
    }
  }

  const out: string[] = [];
  const indentAt = (solIdx: number) => {
    for (let j = solIdx; j < solution.length; j++) {
      if (solution[j].trim() !== '') return solution[j].match(/^ */)![0];
    }
    return '';
  };
  for (let j = 0; j <= solution.length; j++) {
    const texts = insertBefore.get(j);
    if (texts) {
      // a comment sits at the indent of the code it introduces, and a blank line separates it from what came before
      const indent = indentAt(j);
      const last = out[out.length - 1];
      if (out.length > 0 && last.trim() !== '' && !last.trimEnd().endsWith('{')) out.push('');
      for (const t of texts) out.push(`${indent}${t}`);
    }
    if (j < solution.length) out.push(solution[j]);
  }
  return out.join('\n');
}

export function applySolutionPreservingComments(sourceCode: string, solutionCode: string): string {
  return placeCommentsAboveTheirCode(sourceCode, solutionCode) ?? prependCommentsToMain(sourceCode, solutionCode);
}
