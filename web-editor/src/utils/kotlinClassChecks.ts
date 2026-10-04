import { scanKotlin } from './kotlinSource';

/**
 * Compile-time class rules that the JavaScript lowering would otherwise silently ignore (World 8, Object Kingdom):
 * reassigning a `val` property, `override` rules, an unimplemented abstract member, `private`/`protected` access from
 * outside the class, and a member that does not exist on a typed object.
 *
 * This is a conservative, source-text check, not a type checker. A rule fires only when the RECEIVER's class is known
 * (a `this` inside a class body, a variable declared with a constructor call or an explicit class type, a function
 * parameter typed as the class) and every class that could be meant breaks the rule. When in doubt it stays silent, so
 * a correct program is never rejected. Anything it cannot see (a class from a library, a property reached through a
 * call result) is left to the runtime.
 */

export interface ClassRuleError { message: string; line: number; type: 'compiler_error' | 'val_reassignment' | 'unresolved_reference' }

type Visibility = 'public' | 'private' | 'protected' | 'internal';
interface Member {
  name: string;
  kind: 'val' | 'var' | 'fun';
  visibility: Visibility;
  isOverride: boolean;
  isOpen: boolean;
  isAbstract: boolean;
  /** val/var: has an initializer, a getter, or is declared in the primary constructor (so it can never be assigned again). */
  fixed: boolean;
  setterVisibility?: Visibility;
  paramCount?: number;
  fromConstructor: boolean;
  /** Offset of the declaration in the masked source (for error lines). */
  index: number;
  /** The type is a plain value (Int, String, ...), so `x.n += 1` really reassigns it (a `val` MutableList's `+=` does not). */
  primitive: boolean;
}
interface Decl {
  kind: 'class' | 'interface' | 'object';
  name: string;
  modifiers: Set<string>;
  supers: { name: string; isClass: boolean }[];
  hasDelegation: boolean;
  members: Member[];
  start: number; // body range in the masked source
  end: number;
}

const BUILTIN_MEMBERS = new Set([
  'toString', 'equals', 'hashCode', 'copy', 'name', 'ordinal', 'let', 'also', 'apply', 'run', 'takeIf', 'takeUnless', 'javaClass',
  'compareTo', 'component1', 'component2', 'component3', 'component4', 'component5', 'to', 'with', 'invoke',
]);

/**
 * Replaces the inside of every comment, string and char literal with spaces so text rules never see them, keeping offsets
 * and lines. The expressions inside a string template (`"${acc.pin}"`) are code, so they are kept.
 */
function mask(source: string): string {
  const out = source.split('');
  for (const token of scanKotlin(source)) {
    if (token.kind !== 'comment' && token.kind !== 'string' && token.kind !== 'char') continue;
    const keep = new Array<boolean>(token.end - token.start).fill(false);
    if (token.kind === 'string') {
      for (let i = token.start; i < token.end - 1; i++) {
        if (source[i] === '\\') { i++; continue; }
        if (source[i] === '$' && source[i + 1] === '{') {
          let depth = 1, j = i + 2;
          while (j < token.end && depth > 0) {
            if (source[j] === '{') depth++;
            else if (source[j] === '}') depth--;
            j++;
          }
          for (let k = i + 2; k < j - 1; k++) keep[k - token.start] = true;
          i = j - 1;
        }
      }
    }
    for (let i = token.start; i < token.end; i++) if (out[i] !== '\n' && !keep[i - token.start]) out[i] = ' ';
  }
  return out.join('');
}

function balanced(text: string, open: number, openCh: string, closeCh: string): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === openCh) depth++;
    else if (text[i] === closeCh && --depth === 0) return i;
  }
  return -1;
}

function splitTop(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, current = '';
  for (const ch of text) {
    if ('(<[{'.includes(ch)) depth++;
    else if (')>]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { parts.push(current); current = ''; } else current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

const MODIFIER_WORDS = 'private|protected|internal|public|override|open|abstract|final|lateinit|const|inline|suspend|operator|infix|data|enum|sealed|inner|annotation|companion';

function parseDecls(m: string): Decl[] {
  const decls: Decl[] = [];
  const re = /\b(class|interface|object)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(m)) !== null) {
    const kind = match[1] as Decl['kind'];
    const name = match[2];
    const lineStart = m.lastIndexOf('\n', match.index) + 1;
    const prefix = m.slice(lineStart, match.index);
    if (/\bcompanion\s+$/.test(prefix) || /::\s*$/.test(prefix) || /\.\s*$/.test(prefix)) continue;
    const modifiers = new Set((prefix.match(new RegExp(`\\b(?:${MODIFIER_WORDS})\\b`, 'g')) ?? []));
    let i = match.index + match[0].length;
    const skipSpaces = () => { while (i < m.length && /[ \t]/.test(m[i])) i++; };
    skipSpaces();
    if (m[i] === '<') { const close = balanced(m, i, '<', '>'); if (close < 0) continue; i = close + 1; skipSpaces(); }
    let ctor = '';
    if (m[i] === '(') { const close = balanced(m, i, '(', ')'); if (close < 0) continue; ctor = m.slice(i + 1, close); i = close + 1; skipSpaces(); }
    let supers: Decl['supers'] = [];
    let hasDelegation = false;
    if (m[i] === ':') {
      i++;
      let end = i;
      let depth = 0;
      while (end < m.length && !(depth === 0 && (m[end] === '{' || m[end] === '\n'))) {
        if ('(<'.includes(m[end])) depth++;
        else if (')>'.includes(m[end])) depth--;
        end++;
      }
      const clause = m.slice(i, end);
      hasDelegation = /\bby\b/.test(clause);
      supers = splitTop(clause.replace(/\s+by\s+[\s\S]*$/, '')).map((part) => {
        const t = part.trim();
        const mm = /^([A-Za-z_][A-Za-z0-9_]*)\s*(<[^()]*>)?\s*(\()?/.exec(t);
        return mm ? { name: mm[1], isClass: Boolean(mm[3]) } : null;
      }).filter((x): x is { name: string; isClass: boolean } => x !== null);
      i = end;
    }
    while (i < m.length && /\s/.test(m[i])) i++;
    let bodyStart = -1, bodyEnd = -1;
    if (m[i] === '{') { bodyStart = i; bodyEnd = balanced(m, i, '{', '}'); if (bodyEnd < 0) bodyEnd = m.length; }

    const members: Member[] = [];
    // primary-constructor properties
    for (const raw of splitTop(ctor)) {
      const mm = new RegExp(`^\\s*((?:(?:${MODIFIER_WORDS})\\s+)*)(val|var)\\s+([A-Za-z_][A-Za-z0-9_]*)`).exec(raw);
      if (!mm) continue;
      members.push({
        name: mm[3], kind: mm[2] as 'val' | 'var', visibility: visibilityOf(mm[1]), isOverride: /\boverride\b/.test(mm[1]),
        isOpen: /\bopen\b/.test(mm[1]) || /\boverride\b/.test(mm[1]), isAbstract: false, fixed: true, fromConstructor: true,
        index: match.index, primitive: isPlainType(raw.split(':')[1] ?? ''),
      });
    }
    if (bodyStart >= 0) {
      const body = m.slice(bodyStart + 1, bodyEnd);
      const lines = body.split('\n');
      let depth = 0;
      let offset = bodyStart + 1;
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const lineOffset = offset;
        offset += line.length + 1;
        if (depth === 0) {
          const mm = new RegExp(`^\\s*((?:(?:${MODIFIER_WORDS})\\s+)*)(val|var|fun)\\s+(?:<[^>]*>\\s*)?(?:[A-Za-z_][A-Za-z0-9_<>?,. ]*?\\.)?([A-Za-z_][A-Za-z0-9_]*)(.*)$`).exec(line);
          if (mm) {
            const mods = mm[1];
            const rest = mm[4];
            const nextLines = lines.slice(li + 1, li + 3).join(' ');
            const kindM = mm[2] as Member['kind'];
            const abstractMod = /\babstract\b/.test(mods);
            let isAbstract = abstractMod;
            if (!abstractMod && kind === 'interface') {
              isAbstract = kindM === 'fun' ? !/[{=]/.test(rest.replace(/\([^)]*\)/, '')) : !/=|\bget\b|\bby\b/.test(rest + ' ' + nextLines.split(/\b(?:val|var|fun)\b/)[0]);
            }
            const params = kindM === 'fun' ? /\(([^)]*)\)/.exec(rest)?.[1] : undefined;
            members.push({
              name: mm[3], kind: kindM, visibility: visibilityOf(mods), isOverride: /\boverride\b/.test(mods),
              isOpen: /\b(open|abstract)\b/.test(mods) || /\boverride\b/.test(mods) || (kind === 'interface'),
              isAbstract, fixed: kindM === 'val' ? true : /=|\bget\b|\bby\b/.test(rest) || /^\s*(get|by)\b/.test(nextLines),
              paramCount: params === undefined ? undefined : params.trim() === '' ? 0 : splitTop(params).length,
              fromConstructor: false,
              index: lineOffset,
              primitive: kindM !== 'fun' && (isPlainType(/^\s*:\s*([^=]*)/.exec(rest)?.[1] ?? '') || /^\s*=\s*(-?\d|"|'|true\b|false\b)/.test(rest.replace(/^\s*:[^=]*/, '')) ),
            });
            // `val name: T` without an initializer and without a getter can still be assigned once in an init block
            if (kindM === 'val') {
              const m0 = members[members.length - 1];
              m0.fixed = /=|\bby\b/.test(rest) || /^\s*get\b/.test(nextLines.trim());
            }
          } else {
            const sm = /^\s*(private|protected|internal|public)\s+set\b/.exec(line);
            if (sm) {
              for (let k = members.length - 1; k >= 0; k--) {
                if (members[k].kind === 'var' && !members[k].fromConstructor) { members[k].setterVisibility = sm[1] as Visibility; break; }
              }
              if (!members.some((x) => x.setterVisibility === sm[1] as Visibility)) { /* a constructor var with a private set is not valid Kotlin */ }
            }
          }
        }
        for (const ch of line) { if (ch === '{') depth++; else if (ch === '}') depth--; }
      }
    }
    decls.push({ kind, name, modifiers, supers, hasDelegation, members, start: bodyStart >= 0 ? bodyStart : match.index, end: bodyStart >= 0 ? bodyEnd : match.index + match[0].length });
  }
  return decls;
}

function isPlainType(type: string): boolean {
  return /^\s*(Int|Long|Short|Byte|Double|Float|String|Boolean|Char)\s*\??\s*(=.*)?$/.test(type.trim());
}

function visibilityOf(mods: string): Visibility {
  if (/\bprivate\b/.test(mods)) return 'private';
  if (/\bprotected\b/.test(mods)) return 'protected';
  if (/\binternal\b/.test(mods)) return 'internal';
  return 'public';
}

const lineOf = (m: string, index: number) => m.slice(0, index).split('\n').length;

export function checkClassMemberRules(source: string): ClassRuleError | null {
  if (!/\b(class|interface|object)\s+[A-Za-z_]/.test(source)) return null;
  const m = mask(source);
  const decls = parseDecls(m);
  if (!decls.length) return null;
  const byName = new Map<string, Decl[]>();
  for (const d of decls) byName.set(d.name, [...(byName.get(d.name) ?? []), d]);
  const find = (name: string) => byName.get(name)?.[0];

  /** The declaration itself plus every user-declared supertype, nearest first. `complete` is false when any supertype is not declared in this source. */
  const lineage = (d: Decl): { chain: Decl[]; complete: boolean } => {
    const chain: Decl[] = [d];
    let complete = true;
    const seen = new Set<string>([d.name]);
    const queue = [...d.supers];
    while (queue.length) {
      const s = queue.shift()!;
      if (seen.has(s.name)) continue;
      seen.add(s.name);
      const sd = find(s.name);
      if (!sd) { complete = false; continue; }
      chain.push(sd);
      queue.push(...sd.supers);
    }
    return { chain, complete };
  };
  const ownerOf = (member: string, d: Decl): { decl: Decl; member: Member } | undefined => {
    for (const c of lineage(d).chain) {
      const found = c.members.find((x) => x.name === member);
      if (found) return { decl: c, member: found };
    }
    return undefined;
  };
  const innermostDecl = (index: number): Decl | undefined =>
    decls.filter((d) => d.start <= index && index <= d.end).sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];

  // ---- override rules and unimplemented abstract members ----------------------------------------------------------
  for (const d of decls) {
    const { chain, complete } = lineage(d);
    const supers = chain.slice(1);
    const lineNo = lineOf(m, d.start);
    for (const own of d.members) {
      if (own.visibility === 'private' && !own.isOverride) continue;
      const overloaded = (s: Member) => own.kind === 'fun' && s.kind === 'fun' && own.paramCount !== undefined && s.paramCount !== undefined && own.paramCount !== s.paramCount;
      let hidden: { decl: Decl; member: Member } | undefined;
      for (const sd of supers) {
        const found = sd.members.find((x) => x.name === own.name && x.kind === (own.kind === 'fun' ? 'fun' : x.kind) && x.visibility !== 'private' && !overloaded(x));
        if (found) { hidden = { decl: sd, member: found }; break; }
      }
      const memberLine = lineOf(m, own.index);
      if (own.isOverride && !hidden && complete && supers.length && !BUILTIN_MEMBERS.has(own.name)) {
        return { message: `'${own.name}' overrides nothing`, line: memberLine, type: 'compiler_error' };
      }
      if (own.isOverride && !hidden && !supers.length && d.kind !== 'object' && !BUILTIN_MEMBERS.has(own.name) && !d.supers.length) {
        return { message: `'${own.name}' overrides nothing`, line: memberLine, type: 'compiler_error' };
      }
      if (!own.isOverride && hidden && !own.fromConstructor) {
        return { message: `'${own.name}' hides member of supertype '${hidden.decl.name}' and needs 'override' modifier`, line: memberLine, type: 'compiler_error' };
      }
      if (!own.isOverride && hidden && own.fromConstructor) {
        return { message: `'${own.name}' hides member of supertype '${hidden.decl.name}' and needs 'override' modifier`, line: lineNo, type: 'compiler_error' };
      }
      if (own.isOverride && hidden && hidden.decl.kind === 'class' && !hidden.member.isOpen && !hidden.member.isAbstract) {
        return { message: `'${own.name}' in '${hidden.decl.name}' is final and cannot be overridden`, line: memberLine, type: 'compiler_error' };
      }
    }
    // a concrete class or object must implement every abstract member it inherits
    const concrete = (d.kind === 'class' && !d.modifiers.has('abstract') && !d.modifiers.has('sealed')) || d.kind === 'object';
    if (concrete && !d.hasDelegation && complete && supers.length && !d.modifiers.has('enum')) {
      const implemented = (name: string) => chain.some((c) => c.members.some((x) => x.name === name && !x.isAbstract));
      for (const sd of supers) {
        for (const abs of sd.members) {
          if (abs.isAbstract && !implemented(abs.name) && !chain.some((c) => c.hasDelegation)) {
            return { message: `Class '${d.name}' is not abstract and does not implement abstract member '${abs.name}'`, line: lineNo, type: 'compiler_error' };
          }
        }
      }
    }
  }

  // ---- receivers: which class does `x` in `x.member` belong to? --------------------------------------------------
  const classNames = new Set(decls.filter((d) => d.kind !== 'object').map((d) => d.name));
  const varClasses = new Map<string, Set<string>>();
  const note = (name: string, cls: string) => { if (classNames.has(cls)) (varClasses.get(name) ?? varClasses.set(name, new Set()).get(name)!).add(cls); };
  for (const mm of m.matchAll(/\b(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*(\?)?/g)) note(mm[1], mm[2]);
  for (const mm of m.matchAll(/\b(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=\n]+)?=\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) note(mm[1], mm[2]);
  for (const mm of m.matchAll(/\b(?:fun\s+[A-Za-z_][A-Za-z0-9_]*\s*\(|,)\s*(?:val\s+|var\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*[,)=]/g)) note(mm[1], mm[2]);
  // A name that is also declared without a known class (a loop variable, a lambda parameter, a destructuring name, a
  // variable of another type) could mean something else somewhere, so the checks skip it.
  const ambiguous = new Set<string>();
  for (const mm of m.matchAll(/\b(?:val|var)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(:\s*([A-Za-z_][A-Za-z0-9_]*)[^=\n]*)?(=\s*([^\n]*))?/g)) {
    const typed = mm[3] && classNames.has(mm[3]);
    const call = mm[5] !== undefined ? /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(mm[5]) : null;
    if (!(typed || (call && classNames.has(call[1])))) ambiguous.add(mm[1]);
  }
  for (const mm of m.matchAll(/\bfor\s*\(\s*\(?([A-Za-z_][A-Za-z0-9_, ]*)\)?\s+in\b/g)) for (const n of mm[1].split(',')) ambiguous.add(n.trim());
  for (const mm of m.matchAll(/\{\s*([A-Za-z_][A-Za-z0-9_, ]*)\s*->/g)) for (const n of mm[1].split(',')) ambiguous.add(n.trim());
  for (const mm of m.matchAll(/\b(?:val|var)\s*\(([^)]*)\)/g)) for (const n of mm[1].split(',')) ambiguous.add(n.trim());
  // a parameter or property typed as something other than a user class
  for (const mm of m.matchAll(/(?:[(,]\s*|\b(?:val|var)\s+)([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)/g)) if (!classNames.has(mm[2])) ambiguous.add(mm[1]);

  const receiverClasses = (receiver: string, index: number): Decl[] => {
    if (receiver === 'this') { const d = innermostDecl(index); return d ? [d] : []; }
    if (ambiguous.has(receiver)) return [];
    const set = varClasses.get(receiver);
    return set ? [...set].map((n) => find(n)!).filter(Boolean) : [];
  };

  const usage = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?/g;
  let u: RegExpExecArray | null;
  while ((u = usage.exec(m)) !== null) {
    const receiver = u[1], name = u[2];
    const before = m.slice(Math.max(0, u.index - 1), u.index);
    if (before === '.') continue;
    const index = u.index;
    const classes = receiverClasses(receiver, index);
    if (!classes.length) continue;
    const after = m.slice(u.index + u[0].length);
    const assign = !u[3] && /^\s*(=(?!=)|\+=|-=|\*=|\/=|%=|\+\+|--)/.exec(after);
    const here = innermostDecl(index);

    const resolved = classes.map((c) => ({ c, owner: ownerOf(name, c), complete: lineage(c).complete }));
    // 1. unknown member
    // A class that something else extends or implements, or a receiver that is type-checked (`x is Paid`, `when (x)`),
    // may be smart-cast to a subtype that does have the member, so only a plain, never-narrowed receiver is judged.
    const narrowed = new RegExp(`\\b${receiver}\\s+(?:is|as|!is)\\b|\\bwhen\\s*\\(\\s*${receiver}\\s*\\)`).test(m);
    const plainClasses = classes.every((c) => c.kind === 'class' && !c.modifiers.has('sealed') && !c.modifiers.has('abstract') && !decls.some((d) => d.supers.some((sp) => sp.name === c.name)));
    if (plainClasses && !narrowed && resolved.every((r) => !r.owner && r.complete) && !BUILTIN_MEMBERS.has(name) && !byName.has(name) && !/^component\d+$/.test(name)
      && !decls.some((d) => d.modifiers.has('enum')) && !new RegExp(`\\b(?:fun|val|var)\\s+(?:<[^>]*>\\s*)?(?:${classes.map((c) => c.name).join('|')})\\??\\.\\s*${name}\\b`).test(m)) {
      return { message: `Unresolved reference: ${name}`, line: lineOf(m, index), type: 'unresolved_reference' };
    }
    const owners = resolved.filter((r) => r.owner);
    if (owners.length !== resolved.length) continue;
    // 2. visibility: every candidate must forbid the access
    const insideOwner = (r: typeof owners[number]) => Boolean(here && lineage(here).chain.some((c) => c === r.owner!.decl)) || (r.owner!.decl.start <= index && index <= r.owner!.decl.end);
    if (owners.every((r) => r.owner!.member.visibility === 'private' && !(r.owner!.decl.start <= index && index <= r.owner!.decl.end))) {
      return { message: `Cannot access '${name}': it is private in '${owners[0].owner!.decl.name}'`, line: lineOf(m, index), type: 'compiler_error' };
    }
    if (owners.every((r) => r.owner!.member.visibility === 'protected' && !insideOwner(r))) {
      return { message: `Cannot access '${name}': it is protected in '${owners[0].owner!.decl.name}'`, line: lineOf(m, index), type: 'compiler_error' };
    }
    // 3. assignment rules. `x.n += 1` reassigns a plain value, but `x.items += item` on a `val` list is plusAssign (legal),
    // so a compound assignment is flagged only for a plain-typed property.
    if (assign) {
      const compound = /^(\+=|-=|\*=|\/=|%=)$/.test(assign[1]);
      const everyVal = owners.every((r) => r.owner!.member.kind === 'val');
      if (everyVal && (!compound || owners.every((r) => r.owner!.member.primitive))) {
        const fixed = owners.every((r) => r.owner!.member.fixed);
        if (receiver !== 'this' || fixed) {
          return { message: `Val cannot be reassigned: '${name}' is declared with 'val'`, line: lineOf(m, index), type: 'val_reassignment' };
        }
      }
      if (owners.every((r) => r.owner!.member.kind === 'var' && r.owner!.member.setterVisibility === 'private' && !(r.owner!.decl.start <= index && index <= r.owner!.decl.end))) {
        return { message: `Cannot assign to '${name}': the setter is private in '${owners[0].owner!.decl.name}'`, line: lineOf(m, index), type: 'compiler_error' };
      }
    }
  }
  return null;
}
