/** Eager collection runtime. Kept local to runner values, not Array.prototype. */
export class KotlinPair {
  constructor(public first: any, public second: any) {}
  *[Symbol.iterator]() { yield this.first; yield this.second; }
  get key() { return this.first; }
  get value() { return this.second; }
  component1() { return this.first; }
  component2() { return this.second; }
}
/** `withIndex()` element: prints `IndexedValue(index=0, value=H)`, destructures as `(i, v)`. */
export class KotlinIndexedValue extends KotlinPair {
  get index() { return this.first; }
  toString() { return `IndexedValue(index=${this.first}, value=${this.second})`; }
}

/** A Map.Entry: a pair that prints as `key=value`. Iterable, so `{ (k, v) -> }` destructures it. */
export class KotlinMapEntry extends KotlinPair {}
const compare = (a: any, b: any): number => a === b ? 0 : a == null ? -1 : b == null ? 1 : a < b ? -1 : 1;
const equal = (a: any, b: any): boolean => a === b || (Number.isNaN(a) && Number.isNaN(b)) ||
  (a instanceof KotlinList && b instanceof KotlinList && a.length === b.length && a.every((v: any, i: number) => equal(v, b[i]))) ||
  (a instanceof KotlinPair && b instanceof KotlinPair && equal(a.first, b.first) && equal(a.second, b.second)) ||
  // A user class with a generated/declared equals (a data class) is equal by value, not by identity.
  (typeof a === 'object' && a !== null && !(a instanceof KotlinList) && !(a instanceof KotlinPair) && typeof a.equals === 'function' && a.equals(b) === true);
// Kotlin/JVM: "Index 5 out of bounds for length 3". IndexOutOfBoundsException is a real class in the
// exception hierarchy the runner installs on globalThis, so try/catch (e: IndexOutOfBoundsException) works.
export const outOfBounds = (index: any, length: number) => {
  const message = `Index ${index} out of bounds for length ${length}`;
  const Cls = (globalThis as any).IndexOutOfBoundsException;
  return Cls ? new Cls(message) : new Error(message);
};
const kotlinError = (cls: string, message: string) => { const C = (globalThis as any)[cls]; return C ? new C(message) : new Error(message); };
const noSuchElement = (message = 'Collection is empty.') => kotlinError('NoSuchElementException', message);
const positive = (value: number) => { if (!Number.isInteger(value) || value <= 0) throw new Error('size and step must be positive integers'); };
// A dynamic base accommodates Kotlin overloads that differ from JS Array signatures.
const ArrayBase: any = Array;
export class KotlinList extends ArrayBase {
  declare length: number;
  [index: number]: any;
  [Symbol.iterator](): ArrayIterator<any> { return Array.prototype[Symbol.iterator].call(this); }
  static get [Symbol.species]() { return Array; }
  constructor(values: Iterable<any> = []) { super(); for (const value of values) this.push(value); }
  get size() { return this.length; }
  map(fn: any) { return new KotlinList(Array.prototype.map.call(this, (v: any) => fn(v))); }
  filter(fn: any) { return new KotlinList(Array.prototype.filter.call(this, (v: any) => fn(v))); }
  mapNotNull(fn: any) { return this.map(fn).filter((v: any) => v != null); }
  filterNot(fn: any) { return this.filter((v: any) => !fn(v)); }
  filterNotNull() { return this.filter((v: any) => v != null); }
  flatMap(fn: any) { const result = new KotlinList(); for (const v of this) for (const item of fn(v)) result.push(item); return result; }
  flatten() { return this.flatMap((v: any) => v); }
  fold(initial: any, fn: any) { let result = initial; for (const v of this) result = fn(result, v); return result; }
  reduce(fn: any) { if (!this.length) throw new Error('Empty collection cannot be reduced'); let result = this[0]; for (let i = 1; i < this.length; i++) result = fn(result, this[i]); return result; }
  groupBy(key: any, value: any = (v: any) => v) { const result = new Map(); for (const v of this) { const k = key(v); if (!result.has(k)) result.set(k, new KotlinList()); result.get(k).push(value(v)); } return result; }
  associate(fn: any) { const result = new Map(); for (const v of this) { const pair = fn(v); result.set(pair.first, pair.second); } return result; }
  associateBy(key: any) { return this.associate((v: any) => new KotlinPair(key(v), v)); }
  associateWith(value: any) { return this.associate((v: any) => new KotlinPair(v, value(v))); }
  partition(fn: any) { const yes = new KotlinList(), no = new KotlinList(); for (const v of this) (fn(v) ? yes : no).push(v); return new KotlinPair(yes, no); }
  zip(other: Iterable<any>, fn: any = (a: any, b: any) => new KotlinPair(a, b)) { const right = Array.from(other); return new KotlinList(Array.from(this).slice(0, right.length).map((v, i) => fn(v, right[i]))); }
  chunked(size: number, fn?: any) { return this.windowed(size, size, true, fn); }
  windowed(size: number, step: number | Function = 1, partialWindows: boolean = false, fn?: any) {
    if (typeof step === 'function') { fn = step; step = 1; }
    if (typeof partialWindows === 'function') { fn = partialWindows; partialWindows = false; }
    positive(size); positive(step as number); const result = new KotlinList();
    for (let i = 0; i < this.length; i += step as number) { const window = new KotlinList(Array.prototype.slice.call(this, i, i + size)); if (!partialWindows && window.length < size) break; result.push(fn ? fn(window) : window); } return result;
  }
  distinct() { const result = new KotlinList(); for (const v of this) if (!result.some((x: any) => equal(x, v))) result.push(v); return result; }
  distinctBy(fn: any) { const keys: any[] = []; return this.filter((v: any) => { const k = fn(v); if (keys.some(x => equal(x, k))) return false; keys.push(k); return true; }); }
  forEachIndexed(fn: any) { let i = 0; for (const v of this) fn(i++, v); }
  mapIndexed(fn: any) { return new KotlinList(Array.from(this).map((v: any, i: number) => fn(i, v))); }
  mapIndexedNotNull(fn: any) { return this.mapIndexed(fn).filter((v: any) => v != null); }
  filterIndexed(fn: any) { return new KotlinList(Array.from(this).filter((v: any, i: number) => fn(i, v))); }
  runningFold(initial: any, fn: any) { const out = [initial]; let acc = initial; for (const v of this) { acc = fn(acc, v); out.push(acc); } return new KotlinList(out); }
  scan(initial: any, fn: any) { return this.runningFold(initial, fn); }
  runningReduce(fn: any) { if (!this.length) return new KotlinList(); let acc = this[0]; const out = [acc]; for (let i = 1; i < this.length; i++) { acc = fn(acc, this[i]); out.push(acc); } return new KotlinList(out); }
  reduceOrNull(fn: any) { return this.length ? this.reduce(fn) : null; }
  takeLast(n: number) { if (n < 0) throw kotlinError('IllegalArgumentException', `Requested element count ${n} is less than zero.`); return new KotlinList(n === 0 ? [] : Array.prototype.slice.call(this, Math.max(0, this.length - n))); }
  dropLast(n: number) { if (n < 0) throw kotlinError('IllegalArgumentException', `Requested element count ${n} is less than zero.`); return new KotlinList(Array.prototype.slice.call(this, 0, Math.max(0, this.length - n))); }
  takeLastWhile(fn: any) { let i = this.length; while (i > 0 && fn(this[i - 1])) i--; return new KotlinList(Array.prototype.slice.call(this, i)); }
  dropLastWhile(fn: any) { let i = this.length; while (i > 0 && fn(this[i - 1])) i--; return new KotlinList(Array.prototype.slice.call(this, 0, i)); }
  single(fn?: any) {
    const matches = fn ? Array.from(this).filter((v: any) => fn(v)) : Array.from(this);
    if (matches.length === 0) throw noSuchElement(fn ? 'Collection contains no element matching the predicate.' : 'List is empty.');
    if (matches.length > 1) throw kotlinError('IllegalArgumentException', fn ? 'Collection contains more than one matching element.' : 'List has more than one element.');
    return matches[0];
  }
  singleOrNull(fn?: any) { const matches = fn ? Array.from(this).filter((v: any) => fn(v)) : Array.from(this); return matches.length === 1 ? matches[0] : null; }
  elementAt(index: number) { if (!Number.isInteger(index) || index < 0 || index >= this.length) throw outOfBounds(index, this.length); return this[index]; }
  elementAtOrNull(index: number) { return Number.isInteger(index) && index >= 0 && index < this.length ? this[index] : null; }
  zipWithNext(fn: any = (a: any, b: any) => new KotlinPair(a, b)) { const out = new KotlinList(); for (let i = 0; i + 1 < this.length; i++) out.push(fn(this[i], this[i + 1])); return out; }
  asReversed() { return this.reversed(); }
  shuffled() { const out = Array.from(this); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return new KotlinList(out); }
  indexOfFirst(fn: any) { return Array.from(this).findIndex((v: any) => fn(v)); }
  indexOfLast(fn: any) { const all = Array.from(this); for (let i = all.length - 1; i >= 0; i--) if (fn(all[i])) return i; return -1; }
  getOrElse(index: number, fn: any) { return Number.isInteger(index) && index >= 0 && index < this.length ? this[index] : fn(index); }
  // slice(range | indices) picks elements by index (Kotlin); numeric arguments keep the native Array behaviour.
  slice(...args: any[]): any {
    const [first] = args;
    if (first != null && typeof first === 'object' && typeof first[Symbol.iterator] === 'function') return new KotlinList(Array.from(first as Iterable<number>).map((i) => { if (i < 0 || i >= this.length) throw outOfBounds(i, this.length); return this[i]; }));
    return Array.prototype.slice.apply(this, args as [number?, number?]);
  }
  sortedWith(cmp: any) { return new KotlinList(Array.from(this).sort(cmp)); }
  toTypedArray() { return new KotlinList(Array.from(this)); }
  toIntArray() { return this.toTypedArray(); }
  toLongArray() { return this.toTypedArray(); }
  toDoubleArray() { return this.toTypedArray(); }
  toBooleanArray() { return this.toTypedArray(); }
  toCharArray() { return this.toTypedArray(); }
  unzip() { const a = new KotlinList(), b = new KotlinList(); for (const p of this) { a.push(p.first); b.push(p.second); } return new KotlinPair(a, b); }
  toMap() { const out = new Map(); for (const p of this) out.set(p.first, p.second); return out; }
  groupingBy(key: any) { return new KotlinGrouping(Array.from(this), key); }
  sumBy(fn: any) { return this.sumOf(fn); }
  firstNotNullOf(fn: any) { for (const v of this) { const r = fn(v); if (r != null) return r; } throw noSuchElement('No element of the collection was transformed to a non-null value.'); }
  firstNotNullOfOrNull(fn: any) { for (const v of this) { const r = fn(v); if (r != null) return r; } return null; }
  sorted() { return new KotlinList(Array.from(this).sort(compare)); }
  sortedDescending() { return this.sorted().reversed(); }
  onEach(fn: any) { for (const v of this) fn(v); return this; }
  sumOf(fn: any) { let total = 0; for (const v of this) total += fn(v); return total; }
  // the first element with the largest/smallest key wins a tie, as in Kotlin
  maxByOrNull(fn: any) { let best: any = null, key: any; for (const v of this) { const k = fn(v); if (best === null || compare(k, key) > 0) { best = v; key = k; } } return best; }
  minByOrNull(fn: any) { let best: any = null, key: any; for (const v of this) { const k = fn(v); if (best === null || compare(k, key) < 0) { best = v; key = k; } } return best; }
  maxBy(fn: any) { if (!this.length) throw noSuchElement(); return this.maxByOrNull(fn); }
  minBy(fn: any) { if (!this.length) throw noSuchElement(); return this.minByOrNull(fn); }
  maxOf(fn: any) { if (!this.length) throw noSuchElement(); return Array.from(this, fn).reduce((a: any, b: any) => (compare(b, a) > 0 ? b : a)); }
  minOf(fn: any) { if (!this.length) throw noSuchElement(); return Array.from(this, fn).reduce((a: any, b: any) => (compare(b, a) < 0 ? b : a)); }
  sortedBy(fn: any) { return new KotlinList(Array.from(this).sort((a, b) => compare(fn(a), fn(b)))); }
  sortedByDescending(fn: any) { return new KotlinList(Array.from(this).sort((a, b) => compare(fn(b), fn(a)))); }
  reversed() { return new KotlinList(Array.from(this).reverse()); }
  sum() { return this.fold(0, (a: number, b: number) => a + b); }
  average() { return this.length ? this.sum() / this.length : NaN; }
  any(fn?: any) { return fn ? this.some((v: any) => fn(v)) : this.length > 0; }
  all(fn: any) { return this.every((v: any) => fn(v)); }
  none(fn?: any) { return !this.any(fn); }
  minOrNull() { return this.length ? this.reduce((a: any, b: any) => compare(a, b) <= 0 ? a : b) : null; }
  maxOrNull() { return this.length ? this.reduce((a: any, b: any) => compare(a, b) >= 0 ? a : b) : null; }
  min() { if (!this.length) throw new Error('Collection is empty'); return this.minOrNull(); }
  max() { if (!this.length) throw new Error('Collection is empty'); return this.maxOrNull(); }
  first(fn?: any) {
    const missing = (message: string) => { const Cls = (globalThis as any).NoSuchElementException; return Cls ? new Cls(message) : new Error(message); };
    if (!fn) { if (!this.length) throw missing('List is empty.'); return this[0]; }
    for (const v of this) if (fn(v)) return v;
    throw missing('Collection contains no element matching the predicate.');
  }
  firstOrNull(fn: any = () => true) { for (const v of this) if (fn(v)) return v; return null; }
  find(fn: any) { return this.firstOrNull(fn); }
  last(fn?: any) {
    if (!fn && !this.length) { const Cls = (globalThis as any).NoSuchElementException; throw Cls ? new Cls('List is empty.') : new Error('List is empty.'); }
    return this.reversed().first(fn);
  }
  lastOrNull(fn: any = () => true) { return this.reversed().firstOrNull(fn); }
  count(fn?: any) { return fn ? this.filter(fn).length : this.length; }
  contains(value: any) { return this.some((v: any) => equal(v, value)); }
  isEmpty() { return this.length === 0; }
  isNotEmpty() { return this.length !== 0; }
  get(index: number) { if (!Number.isInteger(index) || index < 0 || index >= this.length) throw outOfBounds(index, this.length); return this[index]; }
  getOrNull(index: number) { return Number.isInteger(index) && index >= 0 && index < this.length ? this[index] : null; }
  set(index: number, value: any) { if (!Number.isInteger(index) || index < 0 || index >= this.length) throw outOfBounds(index, this.length); const old = this[index]; this[index] = value; return old; }
  get indices() { return makeRange(0, this.length - 1); }
  get lastIndex() { return this.length - 1; }
  withIndex() { return new KotlinList(Array.from(this).map((v: any, i: number) => new KotlinIndexedValue(i, v))); }
  random() { if (!this.length) { const E = (globalThis as any).NoSuchElementException; throw E ? new E('Collection is empty.') : new Error('Collection is empty.'); } return this[Math.floor(Math.random() * this.length)]; }
  subList(from: number, to: number) { if (from < 0 || to > this.length || from > to) throw outOfBounds(from < 0 ? from : to, this.length); return new KotlinList(Array.prototype.slice.call(this, from, to)); }
  plus(other: any) { return new KotlinList([...Array.from(this), ...(other != null && typeof other !== 'string' && typeof other[Symbol.iterator] === 'function' ? Array.from(other) : [other])]); }
  // list - element removes the first occurrence; list - collection removes every element of that collection
  minus(other: any) {
    const out = Array.from(this);
    if (other != null && typeof other !== 'string' && typeof other[Symbol.iterator] === 'function') { const drop = Array.from(other as Iterable<any>); return new KotlinList(out.filter((v: any) => !drop.some((d) => equal(v, d)))); }
    const i = out.findIndex((v: any) => equal(v, other)); if (i >= 0) out.splice(i, 1); return new KotlinList(out);
  }
  contentToString() { return '[' + Array.from(this).map((v: any) => String(v)).join(', ') + ']'; }
  // Kotlin's sort() orders by value (numbers numerically); JS's default sort compares as text ([10, 9, 2] -> [10, 2, 9]).
  sort(fn?: any) { Array.prototype.sort.call(this, fn ?? compare); }
  sortDescending() { Array.prototype.sort.call(this, (a: any, b: any) => compare(b, a)); }
  // `__kt_equals` (kotlinRunner.ts, backing every `==` comparison) only
  // ever calls a value's own `.equals` method, falling back to `===`
  // (reference equality) when one isn't defined -- so two structurally
  // identical but reference-distinct Lists (e.g. World 14's
  // `listOf(1,2,3).map{...}` vs the same values built through a Sequence
  // pipeline, `a == b`) silently compared as unequal until this existed,
  // even though the shared `equal()` helper above already implements the
  // right structural comparison and every other KotlinList method already
  // uses it internally (`.contains`, `.distinct`, ...) -- it just was
  // never exposed as `.equals` itself.
  equals(other: any) { return equal(this, other); }
  // World 14's Eager Collection Processing / Performance Trade-offs
  // lessons deliberately compare the SAME operation names on both List
  // (eager -- these four) and Sequence (lazy -- see KotlinSequence below)
  // to make the evaluation-model difference observable, so a real
  // Iterable.take/drop/takeWhile/dropWhile is needed here too, not just
  // on KotlinSequence.
  take(n: number) { return new KotlinList(Array.prototype.slice.call(this, 0, Math.max(0, n))); }
  drop(n: number) { return new KotlinList(Array.prototype.slice.call(this, Math.max(0, n))); }
  takeWhile(fn: any) { const out = new KotlinList(); for (const v of this) { if (!fn(v)) break; out.push(v); } return out; }
  dropWhile(fn: any) { let i = 0; while (i < this.length && fn(this[i])) i++; return new KotlinList(Array.prototype.slice.call(this, i)); }
  asSequence() { const self = this; return new KotlinSequence(() => Array.prototype[Symbol.iterator].call(self), false); }
  iterator() { return new KotlinIterator(this as unknown as any[]); }
}

/** `list.groupingBy { key }`: only the terminal operations lessons use (`eachCount`, `fold`, `reduce`, `aggregate`-free). */
export class KotlinGrouping {
  constructor(private readonly items: any[], private readonly key: (v: any) => any) {}
  eachCount() { const out = new Map(); for (const v of this.items) { const k = this.key(v); out.set(k, (out.get(k) ?? 0) + 1); } return out; }
  fold(initial: any, op: (acc: any, v: any) => any) { const out = new Map(); for (const v of this.items) { const k = this.key(v); out.set(k, op(out.has(k) ? out.get(k) : initial, v)); } return out; }
  reduce(op: (acc: any, v: any) => any) { const out = new Map(); for (const v of this.items) { const k = this.key(v); out.set(k, out.has(k) ? op(out.get(k), v) : v); } return out; }
}

/** `list.iterator()`: hasNext() / next() (and remove() for a mutable list). */
export class KotlinIterator {
  private index = 0;
  constructor(private readonly source: any[]) {}
  hasNext() { return this.index < this.source.length; }
  next() { if (this.index >= this.source.length) throw noSuchElement(); return this.source[this.index++]; }
  remove() { this.source.splice(--this.index, 1); }
  // `Iterator.asSequence()` is single-use: it hands out the REMAINING elements once.
  asSequence() { const self = this; return new KotlinSequence(function* () { while (self.hasNext()) yield self.next(); }, true); }
  [Symbol.iterator]() { const self = this; return (function* () { while (self.hasNext()) yield self.next(); })(); }
}

/**
 * An IntRange / CharRange / IntProgression value (`1..5`, `5 downTo 1`, `1..10 step 3`, `1 until 4`). It is a real list of its
 * elements (so every list operation works) that prints the way Kotlin prints a range. `first`, `last` and `step` are the range's
 * properties; they also work called, as `first()`/`last()` do on any Iterable.
 */
export class KotlinRange extends KotlinList {
  constructor(values: Iterable<any>, public readonly rangeFirst: any, public readonly rangeLast: any, public readonly rangeStep: number, public readonly isChar = false) { super(values); }
  toString(): string {
    const q = (v: any) => String(v);
    if (this.rangeStep > 0) return this.rangeStep === 1 && !this.isProgression ? `${q(this.rangeFirst)}..${q(this.rangeLast)}` : `${q(this.rangeFirst)}..${q(this.rangeLast)} step ${this.rangeStep}`;
    return `${q(this.rangeFirst)} downTo ${q(this.rangeLast)} step ${-this.rangeStep}`;
  }
  /** `(1..10 step 3)` and `(1..5).reversed()` are progressions, which print their step. */
  isProgression = false;
}
/**
 * A range's `first` / `last` / `step` are properties in Kotlin (`r.first`) and `first()` / `last()` are also functions on any
 * Iterable. One object serves both: it behaves as the number (arithmetic, comparison, indexing, printing) and is also callable.
 * `step` called with an argument is the infix `step(n)` progression function.
 */
export function boundValue(value: any, call: (...args: any[]) => any = () => value): any {
  const bound: any = (...args: any[]) => call(...args);
  bound.__kt_value = value;
  bound[Symbol.toPrimitive] = (hint: string) => (hint === 'string' ? String(value) : value);
  bound.valueOf = () => value;
  bound.toString = () => String(value);
  return bound;
}
/** `a..b`, `a until b`, `a downTo b`, optionally `step n`, for Int and Char operands. */
export function makeRange(from: any, to: any, kind: '..' | 'until' | 'downTo' = '..', step = 1): KotlinRange {
  const isChar = typeof from === 'string';
  const a = isChar ? from.codePointAt(0)! : Number(from), b0 = isChar ? String(to).codePointAt(0)! : Number(to);
  if (!(step > 0)) { const E = (globalThis as any).IllegalArgumentException; throw E ? new E(`Step must be positive, was: ${step}.`) : new Error(`Step must be positive, was: ${step}.`); }
  const down = kind === 'downTo';
  const b = kind === 'until' ? b0 - 1 : b0;
  const values: any[] = [];
  for (let v = a; down ? v >= b : v <= b; v += down ? -step : step) { values.push(isChar ? String.fromCodePoint(v) : v); if (values.length > 5_000_000) throw new Error('Execution timed out (possible infinite loop)'); }
  const last = values.length ? values[values.length - 1] : (isChar ? String(to) : b);
  const range = new KotlinRange(values, isChar ? String.fromCodePoint(a) : a, last, down ? -step : step, isChar);
  range.isProgression = down || step !== 1;
  return range;
}
const rangeAccessor = (name: string, value: (r: KotlinRange) => any, call: (r: KotlinRange, ...args: any[]) => any) =>
  Object.defineProperty(KotlinRange.prototype, name, { get(this: KotlinRange) { return boundValue(value(this), (...args: any[]) => call(this, ...args)); }, configurable: true });
rangeAccessor('first', (r) => r.rangeFirst, (r, pred) => (pred ? KotlinList.prototype.first.call(r, pred) : r.rangeFirst));
rangeAccessor('last', (r) => r.rangeLast, (r, pred) => (pred ? KotlinList.prototype.last.call(r, pred) : r.rangeLast));
rangeAccessor('step', (r) => Math.abs(r.rangeStep), (r, n) => makeRange(r.rangeFirst, r.rangeLast, r.rangeStep < 0 ? 'downTo' : '..', n));
/** `r.reversed()` of a range is a progression counting down. */
KotlinRange.prototype.reversed = function (this: KotlinRange) {
  const out = makeRange(this.rangeLast, this.rangeFirst, 'downTo', Math.abs(this.rangeStep));
  return out;
};

// World 14: a lazy, generator-backed Sequence<T>. Every intermediate
// operation (map/filter/take/takeWhile/drop) wraps the upstream iterable
// in a new `function*`, so pulling one element from the OUTERMOST
// generator naturally pulls exactly one element through every stage
// before requesting the next source element -- this is what gives real
// element-by-element evaluation order (verified against real Kotlin: a
// `filter` then `map` prints F1, M1, F2, M2, ..., never a whole filter
// pass before any map), not just a correct final result. See PITFALLS.md.
//
// `singleUse` models Kotlin's own distinction between a reusable sequence
// (sequenceOf, a seeded generateSequence, an Iterable's own asSequence)
// and the no-seed `generateSequence(nextFunction)` overload and a bare
// Iterator's `asSequence()`, both of which real Kotlin documents as
// constrained to exactly one iteration -- a second traversal throws.
//
// Every terminal operation guards its own iteration count independently
// of the transpiled-loop `__kt_check_loop` mechanism (which only
// instruments actual Kotlin while/for loops): a synchronous JS `for...of`
// draining an unbounded generator would otherwise block the single
// JS thread forever, and no external timeout can preempt a loop that
// never yields control back to the event loop.
const SEQUENCE_ITERATION_CAP = 250_000;
export class KotlinSequence {
  private genFn: () => Iterator<any>;
  private singleUse: boolean;
  private used = false;
  constructor(genFn: () => Iterator<any>, singleUse: boolean) {
    this.genFn = genFn;
    this.singleUse = singleUse;
  }
  [Symbol.iterator](): Iterator<any> {
    if (this.singleUse) {
      if (this.used) throw new Error('This sequence can only be iterated once.');
      this.used = true;
    }
    return this.genFn();
  }
  // Printing a Sequence shows the object, not its elements (that needs a terminal operation): like the JVM's `kotlin.sequences.…@hash`.
  private static printed = 0;
  private printId?: number;
  toString(): string {
    if (this.printId === undefined) this.printId = (0x7a81197d + KotlinSequence.printed++ * 0x2f6e9b1) >>> 0;
    return `kotlin.sequences.Sequence@${this.printId.toString(16)}`;
  }
  private static guard(count: number) {
    if (count > SEQUENCE_ITERATION_CAP) throw new Error('Execution timed out (possible infinite loop)');
  }
  map(fn: any): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () { for (const v of self) yield fn(v); }, self.singleUse);
  }
  filter(fn: any): KotlinSequence {
    const self = this;
    // Counts the elements it SCANS, not only those it passes on: a filter that never matches over an endless source never yields, so
    // the terminal operation's own counter would never run (it hung the editor for good).
    return new KotlinSequence(function* () { let scanned = 0; for (const v of self) { KotlinSequence.guard(++scanned); if (fn(v)) yield v; } }, self.singleUse);
  }
  take(n: number): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () {
      if (n <= 0) return;
      let i = 0;
      for (const v of self) { yield v; if (++i >= n) return; }
    }, self.singleUse);
  }
  onEach(fn: any): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () { for (const v of self) { fn(v); yield v; } }, self.singleUse);
  }
  // Sorting is stateful: the first element is only produced after every upstream element was read (as in Kotlin).
  private sortedWith(order: (a: any, b: any) => number): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () {
      const all: any[] = []; let c = 0;
      for (const v of self) { KotlinSequence.guard(++c); all.push(v); }
      yield* all.sort(order);
    }, self.singleUse);
  }
  sorted(): KotlinSequence { return this.sortedWith(compare); }
  sortedDescending(): KotlinSequence { return this.sortedWith((a, b) => compare(b, a)); }
  sortedBy(fn: any): KotlinSequence { return this.sortedWith((a, b) => compare(fn(a), fn(b))); }
  sortedByDescending(fn: any): KotlinSequence { return this.sortedWith((a, b) => compare(fn(b), fn(a))); }
  takeWhile(fn: any): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () { for (const v of self) { if (!fn(v)) return; yield v; } }, self.singleUse);
  }
  drop(n: number): KotlinSequence {
    const self = this;
    return new KotlinSequence(function* () { let i = 0; for (const v of self) { KotlinSequence.guard(i + 1); if (i++ < n) continue; yield v; } }, self.singleUse);
  }
  toList(): KotlinList {
    const out = new KotlinList(); let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); out.push(v); }
    return out;
  }
  first(fn?: any): any {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (!fn || fn(v)) return v; }
    throw new Error('Sequence contains no element matching the predicate.');
  }
  firstOrNull(fn?: any): any {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (!fn || fn(v)) return v; }
    return null;
  }
  find(fn: any): any { return this.firstOrNull(fn); }
  count(fn?: any): number {
    let c = 0, n = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (!fn || fn(v)) n++; }
    return n;
  }
  fold(initial: any, fn: any): any {
    let acc = initial, c = 0;
    for (const v of this) { KotlinSequence.guard(++c); acc = fn(acc, v); }
    return acc;
  }
  forEach(fn: any): void {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); fn(v); }
  }
  any(fn: any): boolean {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (fn(v)) return true; }
    return false;
  }
  all(fn: any): boolean {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (!fn(v)) return false; }
    return true;
  }
  none(fn: any): boolean {
    let c = 0;
    for (const v of this) { KotlinSequence.guard(++c); if (fn(v)) return false; }
    return true;
  }
  sum(): number {
    let s = 0, c = 0;
    for (const v of this) { KotlinSequence.guard(++c); s += v; }
    return s;
  }
}
