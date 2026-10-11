/**
 * Nested declarations (`sealed class Result { data class Success(...) : Result() }`, `object Config { object Db { ... } }`) are
 * moved to top level, directly after the class that contains them, and every `Outer.Inner` reference becomes the plain name.
 * The runner's class translation only understands top-level declarations; a nested one used to be left inside the JS class body,
 * a parse error with no Kotlin line. Kotlin's nested (not `inner`) classes have no access to the outer instance, so moving them
 * does not change meaning. The plain name is kept so `toString()`, `::class.simpleName` and `is` checks read like Kotlin; it is
 * `Outer_Inner` only when that name is declared elsewhere too.
 *
 * Lines are moved, never added or removed, and `lineMap` (marked line -> source line, see kotlinLineMarkers.ts) moves with them.
 * Not moved (left as before): `inner class`, `companion object`, and a nested declaration that does not occupy whole lines of its
 * own (`sealed class R { object A : R() }` on one line).
 */

const DECL = /^\s*((?:(?:public|private|internal|protected|open|abstract|sealed|final|data|enum|annotation|value|inner|companion)\s+)*)(class|object|interface)\s+([A-Za-z_][A-Za-z0-9_]*)/;

/** Brace/paren depth change of one line and whether it opens a brace at all; strings and comments ignored. */
function scanLine(line: string): { braces: number; parens: number; opens: boolean } {
  let braces = 0, parens = 0, opens = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '/' && line[i + 1] === '/') break;
    if (ch === '"' || ch === '\'') {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
      i = j;
      continue;
    }
    if (ch === '{') { braces++; opens = true; }
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
  }
  return { braces, parens, opens };
}

/** Last line (inclusive) of a declaration starting at `start`: through its `{ ... }` body, or the end of its header; -1 if unclear. */
function declarationEnd(lines: string[], start: number): number {
  let braces = 0, parens = 0, sawBody = false;
  for (let k = start; k < lines.length; k++) {
    const d = scanLine(lines[k]);
    if (d.opens && parens + d.parens <= 0) sawBody = true;
    braces += d.braces;
    parens += d.parens;
    if (braces < 0) return -1;
    if (braces > 0 || parens > 0) continue;
    if (sawBody) return k;
    const next = lines.slice(k + 1).find((l) => l.trim() !== '');
    const continues = /[:,(]\s*$/.test(lines[k].trim()) || (next !== undefined && /^\s*[:{,]/.test(next));
    if (!continues) return k;
  }
  return -1;
}

export function hoistNestedDeclarations(code: string, lineMap: number[]): { code: string; lineMap: number[]; problem?: NestedProblem } {
  let lines = code.split('\n');
  let map = lineMap.slice();
  const problems: NestedProblem[] = [];
  const movedNames: string[] = [];
  for (let pass = 0; pass < 8; pass++) {
    const moved = hoistOnce(lines, map, problems);
    if (!moved) break;
    ({ lines, map } = moved);
    movedNames.push(moved.name);
  }
  // `Outer.Inner` references were rewritten; `.Inner` after anything else (`c.Entry(8)`, `Session("a").Header()`) reaches a nested
  // class through an instance, which Kotlin rejects (only an `inner` class is reached that way).
  for (const name of movedNames) {
    const re = new RegExp(`(?<=[\\w)\\]])\\.${name}\\b`);
    const at = lines.findIndex((line) => re.test(codeOnly(line)));
    if (at >= 0) problems.push({ line: map[at], token: name, message: `Unresolved reference: ${name}` });
  }
  problems.sort((a, b) => a.line - b.line);
  return { code: lines.join('\n'), lineMap: map, problem: problems[0] };
}

/** A Kotlin compile error found while moving nested declarations, on a SOURCE line (see hoistNestedDeclarations). */
export interface NestedProblem { line: number; token: string; message: string }

/** The line with string literals blanked, except that their `$name` / `${...}` templates stay (they are code). */
function codeOnly(line: string): string {
  return line.replace(/"(?:[^"\\]|\\.)*"/g, (str) => (str.match(/\$\{[^}]*\}|\$[A-Za-z_]\w*/g) ?? []).join(' ').replace(/\$\{?/g, ' ').replace(/\}/g, ' '));
}

function hoistOnce(lines: string[], map: number[], problems: NestedProblem[]): { lines: string[]; map: number[]; name: string } | null {
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const outer = depth === 0 ? DECL.exec(lines[i]) : null;
    if (outer) {
      const end = declarationEnd(lines, i);
      if (end > i) {
        const result = hoistFrom(lines, map, i, end, outer[3], problems);
        if (result) return result;
      }
    }
    depth += scanLine(lines[i]).braces;
  }
  return null;
}

/**
 * Moves the LAST movable declaration directly inside `outerName` (lines start..end) to just after the outer's closing line. Taking
 * the last one each time keeps the moved declarations in source order (each later move lands before the earlier ones), which
 * matters when one nested class extends a sibling.
 */
function hoistFrom(lines: string[], map: number[], start: number, end: number, outerName: string, problems: NestedProblem[]) {
  let depth = 0;
  let found: { k: number; innerEnd: number; inner: string } | null = null;
  for (let k = start; k < end; k++) {
    if (k > start && depth === 1) {
      const m = DECL.exec(lines[k]);
      if (m && !/\b(?:inner|companion)\b/.test(m[1])) {
        const innerEnd = declarationEnd(lines, k);
        // whole lines only: the nested declaration must close before the outer's last line
        if (innerEnd >= k && innerEnd < end) found = { k, innerEnd, inner: m[3] };
      }
    }
    depth += scanLine(lines[k]).braces;
  }
  if (!found) return null;
  const { k, innerEnd, inner } = found;
  // A nested (not `inner`) class has no outer instance: using the outer's constructor parameters or members in it is an error.
  {
    const header = lines.slice(start, k).join('\n');
    const outerNames = new Set<string>();
    const ctor = /\(([^)]*)\)/.exec(header.slice(header.indexOf(outerName)));
    for (const p of (ctor?.[1] ?? '').split(',')) { const m = /(\w+)\s*:/.exec(p); if (m) outerNames.add(m[1]); }
    let d = 0;
    for (let j = start; j <= end; j++) {
      if (j >= k && j <= innerEnd) continue;
      if (d === 1) { const m = /^\s*(?:(?:private|protected|internal|public|open|override|lateinit|const)\s+)*(?:val|var|fun)\s+(?:<[^>]*>\s*)?(\w+)/.exec(lines[j]); if (m) outerNames.add(m[1]); }
      d += scanLine(lines[j]).braces;
    }
    const blockText = lines.slice(k, innerEnd + 1).join('\n');
    const own = new Set<string>([...blockText.matchAll(/\b(?:val|var|fun|for\s*\()\s*(\w+)|(\w+)\s*:/g)].map((m) => m[1] ?? m[2]));
    for (let j = k; j <= innerEnd && !problems.length; j++) {
      const code = codeOnly(lines[j]);
      const used = [...outerNames].find((n) => !own.has(n) && new RegExp(`(?<![\\w.])${n}\\b(?!\\s*=(?!=))`).test(code));
      if (used) problems.push({ line: map[j], token: used, message: `Unresolved reference: ${used}` });
    }
  }
  let count = 0;
  for (const line of lines) { const d = DECL.exec(line); if (d && d[3] === inner) count++; }
  const name = count > 1 ? `${outerName}_${inner}` : inner;
  const block = lines.slice(k, innerEnd + 1);
  if (name !== inner) block[0] = block[0].replace(new RegExp(`\\b(class|object|interface)\\s+${inner}\\b`), `$1 ${name}`);
  // at top level the translation passes expect the declaration keyword at the start of its line
  block[0] = block[0].replace(/^\s+/, '');
  const blockMap = map.slice(k, innerEnd + 1);
  const restLines = [...lines.slice(0, k), ...lines.slice(innerEnd + 1)];
  const restMap = [...map.slice(0, k), ...map.slice(innerEnd + 1)];
  const insertAt = end - block.length + 1;
  restLines.splice(insertAt, 0, ...block);
  restMap.splice(insertAt, 0, ...blockMap);
  const ref = new RegExp(`\\b${outerName}\\.${inner}\\b`, 'g');
  // Inside the outer class a nested name may also be used bare (`Success(v)`); only a renamed one needs that rewritten.
  const bare = new RegExp(`(?<![.\\w])${inner}\\b`, 'g');
  const out = restLines.map((line, idx) => {
    let l = line.replace(ref, name);
    const inOuterOrBlock = (idx >= start && idx < insertAt) || (idx >= insertAt && idx < insertAt + block.length);
    if (name !== inner && inOuterOrBlock) l = l.replace(bare, name);
    return l;
  });
  return { lines: out, map: restMap, name };
}
