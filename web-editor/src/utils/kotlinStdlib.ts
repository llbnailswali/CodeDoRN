/**
 * Kotlin standard-library members the teaching runner adds to JavaScript's String, Number and Boolean, plus the numeric constant
 * holders (`Int.MAX_VALUE`, `Double.NaN`, ...). Installed once per realm by `installKotlinStdlib()` (idempotent).
 *
 * A Kotlin `Char` and a one-character `String` are the same JS string here (see PITFALLS.md), so the Char members below work on
 * any string and only ever look at its first character. Names that a JS String already has with a DIFFERENT meaning for Kotlin
 * code (`replace`, `startsWith`, `endsWith`, `contains`) are redefined on purpose; every redefinition keeps the native behaviour
 * for the argument shapes JavaScript callers use.
 */
import { KotlinIndexedValue, KotlinList, KotlinPair, makeRange } from './kotlinCollections';

const isIterable = (v: any): boolean => v != null && typeof v !== 'string' && typeof v[Symbol.iterator] === 'function';
const natural = (a: any, b: any): number => (a === b ? 0 : a == null ? -1 : b == null ? 1 : a < b ? -1 : 1);

const G = globalThis as any;
const error = (cls: string, message: string) => { const C = G[cls]; return C ? new C(message) : new Error(message); };
const define = (target: any, name: string, value: unknown) => Object.defineProperty(target, name, { value, configurable: true, writable: true });
const getter = (target: any, name: string, get: () => unknown) => Object.defineProperty(target, name, { get, configurable: true });
const chars = (text: string): string[] => Array.from(text);
const lastWhere = <T>(items: T[], pred: (v: T) => boolean): T | undefined => { for (let i = items.length - 1; i >= 0; i--) if (pred(items[i])) return items[i]; return undefined; };
const same = (a: string, b: string, ignoreCase: boolean) => (ignoreCase ? a.toLowerCase() === b.toLowerCase() : a === b);

/** Java's String.hashCode (32-bit). */
export function javaHashCode(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return h;
}

/**
 * Java's Double.toString, which Kotlin prints: at least one digit after the point, and scientific notation (`1.0E10`, `1.5E-5`) when
 * the magnitude is >= 10^7 or < 10^-3. JavaScript's shortest round-trip digits are the same digits Java (19+) prints.
 */
export function javaDoubleToString(value: number): string {
  if (Number.isNaN(value)) return 'NaN';
  if (value === Infinity) return 'Infinity';
  if (value === -Infinity) return '-Infinity';
  if (value === 0) return Object.is(value, -0) ? '-0.0' : '0.0';
  const abs = Math.abs(value);
  if (abs >= 1e-3 && abs < 1e7) { const plain = String(value); return plain.includes('.') ? plain : `${plain}.0`; }
  const [mantissa, exponent] = value.toExponential().split('e');
  return `${mantissa.includes('.') ? mantissa : `${mantissa}.0`}E${Number(exponent)}`;
}

/** Float.toString: the shortest decimal that identifies the same 32-bit float (so 1 / 3.0f prints 0.33333334). */
export function javaFloatToString(value: number): string {
  if (!Number.isFinite(value) || value === 0) return javaDoubleToString(value);
  const target = Math.fround(value);
  for (let digits = 1; digits <= 9; digits++) {
    const candidate = Number(target.toPrecision(digits));
    if (Math.fround(candidate) === target) return javaDoubleToString(candidate);
  }
  return javaDoubleToString(target);
}


/** Set / Map / array / comparator / builder members and the Java-style collection constructors. */
function installCollections() {
  const SET: any = Set.prototype, MAP: any = Map.prototype;
  const list = (items: Iterable<any>) => new KotlinList(items);

  // Iterable operations on a Set run on the List implementation (map/filter/... return Lists, as in Kotlin).
  const iterableOps = ['map', 'mapNotNull', 'filter', 'filterNot', 'flatMap', 'forEachIndexed', 'mapIndexed', 'filterIndexed', 'any', 'all', 'none', 'count', 'sum', 'sumOf', 'average',
    'maxOrNull', 'minOrNull', 'max', 'min', 'maxByOrNull', 'minByOrNull', 'maxOf', 'minOf', 'joinToString', 'partition', 'fold', 'reduce', 'reduceOrNull', 'sortedBy', 'sortedDescending', 'sortedByDescending',
    'sortedWith', 'firstOrNull', 'find', 'findLast', 'lastOrNull', 'take', 'drop', 'takeWhile', 'dropWhile', 'distinct', 'zip', 'withIndex', 'groupBy', 'groupingBy', 'associate', 'associateBy', 'associateWith',
    'toTypedArray', 'indexOf', 'elementAt', 'elementAtOrNull', 'single', 'singleOrNull', 'chunked', 'windowed', 'toMutableList', 'flatten', 'filterNotNull', 'unzip', 'shuffled', 'sumBy', 'asReversed', 'reversed', 'iterator'];
  for (const name of iterableOps) {
    define(SET, name, function (this: Set<any>, ...args: any[]) { return (list(this) as any)[name](...args); });
  }
  define(SET, 'onEach', function (this: Set<any>, fn: (v: any) => void) { for (const v of this) fn(v); return this; });
  define(SET, 'toMutableSet', function (this: Set<any>) { return G.__kt_mutableSetOf(...this); });
  define(SET, 'toSet', function (this: Set<any>) { return G.__kt_setOf(...this); });
  define(SET, 'contains', function (this: Set<any>, item: any) { return this.has(item); });

  // Map operations a JS Map lacks. A callback gets what Kotlin passes (key/value or an entry); results are Kotlin collections.
  const mapOps: Record<string, (this: Map<any, any>, ...args: any[]) => unknown> = {
    putIfAbsent(key, value) { if (this.has(key) && this.get(key) != null) return this.get(key); this.set(key, value); return null; },
    merge(key, value, fn) { const old = this.get(key); const next = old == null ? value : fn(old, value); if (next == null) this.delete(key); else this.set(key, next); return next; },
    compute(key, fn) { const next = fn(key, this.has(key) ? this.get(key) : null); if (next == null) this.delete(key); else this.set(key, next); return next; },
    computeIfAbsent(key, fn) { if (this.has(key) && this.get(key) != null) return this.get(key); const v = fn(key); if (v != null) this.set(key, v); return v; },
    computeIfPresent(key, fn) { if (!this.has(key) || this.get(key) == null) return null; const next = fn(key, this.get(key)); if (next == null) this.delete(key); else this.set(key, next); return next; },
    toSortedMap() { return G.__kt_mutableMapOf(...[...this.entries()].sort((a, b) => natural(a[0], b[0]))); },
    asSequence() { return list([...this.entries()].map(([k, v]) => new (G.__kt_MapEntry)(k, v))).asSequence(); },
    containsKey(key) { return this.has(key); },
    contains(key) { return this.has(key); }, // `key in map`
    containsValue(value) { return [...this.values()].some((v) => v === value || (typeof (v as any)?.equals === 'function' && (v as any).equals(value))); },
    isEmpty() { return this.size === 0; },
    isNotEmpty() { return this.size > 0; },
    getOrDefault(key, fallback) { return this.has(key) ? this.get(key) : fallback; },
    getValue(key) { if (!this.has(key)) throw error('NoSuchElementException', `Key ${key} is missing in the map.`); return this.get(key); },
    put(key, value) { const old = this.has(key) ? this.get(key) : null; this.set(key, value); return old; },
    putAll(other) { for (const [k, v] of other) this.set(k, v); },
    remove(key) { const old = this.has(key) ? this.get(key) : null; this.delete(key); return old; },
  };
  for (const [name, fn] of Object.entries(mapOps)) define(MAP, name, fn);

  // Arrays: an array is a KotlinList flagged as an array (out-of-range access throws ArrayIndexOutOfBoundsException).
  const arr = (items: Iterable<any>) => G.__kt_markArray(new KotlinList(items));
  const sized = (zero: unknown) => (size: number, init?: (i: number) => unknown) => {
    if (!Number.isInteger(size) || size < 0) throw error('IllegalArgumentException', `Array size must not be negative, was: ${size}.`);
    return arr(Array.from({ length: size }, (_, i) => (init ? init(i) : zero)));
  };
  for (const [name, zero] of [['IntArray', 0], ['LongArray', 0], ['ShortArray', 0], ['ByteArray', 0], ['DoubleArray', 0], ['FloatArray', 0], ['BooleanArray', false], ['CharArray', '\u0000']] as Array<[string, unknown]>) G[name] = sized(zero);
  G.__kt_newArray = sized(null);
  // a `vararg` parameter is an array of its arguments with the full array API (sum, joinToString, size, ...)
  G.__kt_varargs = (items: Iterable<any>) => arr(items);
  G.arrayOfNulls = (size: number) => arr(new Array(size).fill(null));
  G.emptyArray = () => arr([]);
  const LIST: any = KotlinList.prototype;
  define(LIST, 'copyOf', function (this: any[], newSize?: number) { const items = Array.from(this); if (newSize === undefined) return arr(items); return arr(Array.from({ length: newSize }, (_, i) => (i < items.length ? items[i] : typeof items[0] === 'number' ? 0 : null))); });
  define(LIST, 'copyOfRange', function (this: any[], from: number, to: number) { if (from < 0 || from > this.length) throw error('ArrayIndexOutOfBoundsException', `fromIndex: ${from}, toIndex: ${to}, size: ${this.length}`); return arr(Array.from(this).slice(from, to)); });
  define(LIST, 'reversedArray', function (this: any[]) { return arr(Array.from(this).reverse()); });
  define(LIST, 'sortedArray', function (this: any[]) { return arr(Array.from(this).sort(natural)); });
  define(LIST, 'sortedArrayDescending', function (this: any[]) { return arr(Array.from(this).sort((a, b) => natural(b, a))); });
  define(LIST, 'sliceArray', function (this: any, indices: any) { return arr((this as any).slice(indices)); });
  define(LIST, 'contentEquals', function (this: any[], other: any[]) { return this.length === other.length && this.every((v, i) => v === other[i]); });
  define(LIST, 'contentHashCode', function (this: any[]) { return this.reduce((h, v) => (Math.imul(31, h) + (typeof v === 'number' ? v | 0 : 0)) | 0, 1); });

  // Comparators: compareBy(selector...) / compareByDescending / naturalOrder / reverseOrder with thenBy / reversed.
  const comparator = (fn: (a: any, b: any) => number): any => {
    fn = fn.bind(null);
    Object.assign(fn, {
      thenBy: (sel: (v: any) => any) => comparator((a, b) => (fn(a, b) || natural(sel(a), sel(b)))),
      thenByDescending: (sel: (v: any) => any) => comparator((a, b) => (fn(a, b) || natural(sel(b), sel(a)))),
      thenComparator: (other: (a: any, b: any) => number) => comparator((a, b) => (fn(a, b) || other(a, b))),
      reversed: () => comparator((a, b) => fn(b, a)),
    });
    return fn;
  };
  G.compareBy = (...selectors: Array<(v: any) => any>) => comparator((a, b) => { for (const sel of selectors) { const c = natural(sel(a), sel(b)); if (c) return c; } return 0; });
  G.compareByDescending = (sel: (v: any) => any) => comparator((a, b) => natural(sel(b), sel(a)));
  G.naturalOrder = () => comparator(natural);
  G.reverseOrder = () => comparator((a, b) => natural(b, a));
  G.Comparator = (fn: (a: any, b: any) => number) => comparator(fn);

  // Builders: the lambda's receiver is the collection being built.
  G.__kt_buildString = (block: (sb: unknown) => void) => { const sb = new G.StringBuilder(); block(sb); return sb.toString(); };
  G.__kt_buildList = (block: (l: unknown) => void) => { const l = G.__kt_mutableListOf(); block(l); return l; };
  G.__kt_buildMap = (block: (m: unknown) => void) => { const m = G.__kt_mutableMapOf(); block(m); return m; };
  G.__kt_buildSet = (block: (s: unknown) => void) => { const s = G.__kt_mutableSetOf(); block(s); return s; };

  // Java-style constructors and factories (`ArrayList<Int>()`, `HashMap(...)`, `hashSetOf(...)`)
  const fromArg = (arg: unknown) => (isIterable(arg) ? Array.from(arg as Iterable<any>) : []);
  G.__kt_newArrayList = (arg?: unknown) => G.__kt_mutableListOf(...fromArg(arg));
  G.__kt_newHashSet = (arg?: unknown) => G.__kt_mutableSetOf(...fromArg(arg));
  G.__kt_newHashMap = (arg?: unknown) => (arg instanceof Map ? G.__kt_mutableMapOf(...arg.entries()) : G.__kt_mutableMapOf());
  G.__kt_sortedSetOf = (...items: any[]) => G.__kt_mutableSetOf(...items.sort(natural));
  G.__kt_sortedMapOf = (...pairs: any[]) => G.__kt_mutableMapOf(...[...pairs].sort((a, b) => natural(a[0], b[0])));

  // Kotlin-only stdlib functions
  G.TODO = (reason?: string) => { throw error('NotImplementedError', reason === undefined ? 'An operation is not implemented.' : `An operation is not implemented: ${reason}`); };
  G.assert = () => G.__kt_UnitValue; // assertions are disabled on the JVM unless -ea is passed
  G.Integer = Object.freeze({ MAX_VALUE: 2147483647, MIN_VALUE: -2147483648, parseInt: (s: string, radix = 10) => (s as any).toInt(radix), valueOf: (v: any) => (typeof v === 'string' ? (v as any).toInt() : v), toString: (n: number, radix = 10) => n.toString(radix), compare: (a: number, b: number) => natural(a, b), max: Math.max, min: Math.min, sum: (a: number, b: number) => (a + b) | 0 });
}

/**
 * Sets and Maps of OBJECTS compare keys by `equals` (a data class is equal by value), not by identity: the instance's `has`/`add`/`get`/
 * `set`/`delete` look an equal element up first. Primitives and objects without `equals` keep the native (fast) behaviour.
 */
export function makeStructural<T extends Set<any> | Map<any, any>>(collection: T): T {
  const isObject = (v: any) => v !== null && typeof v === 'object' && typeof v.equals === 'function';
  const target: any = collection;
  const nativeHas = collection.has.bind(collection), nativeDelete = collection.delete.bind(collection);
  const keys = () => (collection instanceof Map ? collection.keys() : collection.values());
  const existing = (key: any) => { for (const k of keys()) if (k === key || k.equals?.(key) === true) return k; return undefined; };
  const find = (key: any) => (isObject(key) ? existing(key) : key);
  const found = (key: any) => (isObject(key) ? existing(key) !== undefined : nativeHas(key));
  target.has = (key: any) => found(key);
  target.delete = (key: any) => nativeDelete(find(key));
  if (collection instanceof Map) {
    const nativeGet = collection.get.bind(collection), nativeSet = collection.set.bind(collection);
    target.get = (key: any) => nativeGet(find(key));
    target.set = (key: any, value: any) => { const k = find(key); nativeSet(isObject(key) && k !== undefined ? k : key, value); return collection; };
  } else {
    const nativeAdd = (collection as Set<any>).add.bind(collection);
    target.add = (value: any) => { if (!found(value)) nativeAdd(value); return collection; };
  }
  return collection;
}

/** Kotlin's hashCode of a value, for the data class `hashCode()`: Int as is, Double via its bits, String as Java, Boolean 1231/1237. */
function hashOf(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value | 0;
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value);
    return (view.getInt32(0) ^ view.getInt32(4)) | 0;
  }
  if (typeof value === 'string') return javaHashCode(value);
  if (typeof value === 'boolean') return value ? 1231 : 1237;
  if (typeof value.hashCode === 'function') return value.hashCode() | 0;
  if (Array.isArray(value)) return value.reduce((h, v) => (Math.imul(31, h) + hashOf(v)) | 0, 1);
  return 0;
}

function installStrings() {
  const S: any = String.prototype;
  const text = (self: unknown) => String(self);
  const methods: Record<string, (this: unknown, ...args: any[]) => unknown> = {
    first(pred?: (c: string) => boolean) {
      const all = chars(text(this));
      const found = pred ? all.find(pred) : all[0];
      if (found === undefined) throw error('NoSuchElementException', pred ? 'Char sequence contains no character matching the predicate.' : 'Char sequence is empty.');
      return found;
    },
    last(pred?: (c: string) => boolean) {
      const all = chars(text(this));
      const found = pred ? lastWhere(all, pred) : all[all.length - 1];
      if (found === undefined) throw error('NoSuchElementException', pred ? 'Char sequence contains no character matching the predicate.' : 'Char sequence is empty.');
      return found;
    },
    firstOrNull(pred?: (c: string) => boolean) { const all = chars(text(this)); return (pred ? all.find(pred) : all[0]) ?? null; },
    lastOrNull(pred?: (c: string) => boolean) { const all = chars(text(this)); return (pred ? lastWhere(all, pred) : all[all.length - 1]) ?? null; },
    count(pred?: (c: string) => boolean) { const all = chars(text(this)); return pred ? all.filter(pred).length : all.length; },
    filter(pred: (c: string) => boolean) { return chars(text(this)).filter((c) => pred(c)).join(''); },
    filterNot(pred: (c: string) => boolean) { return chars(text(this)).filter((c) => !pred(c)).join(''); },
    map(fn: (c: string) => unknown) { return new KotlinList(chars(text(this)).map((c) => fn(c))); },
    mapNotNull(fn: (c: string) => unknown) { return new KotlinList(chars(text(this)).map((c) => fn(c)).filter((v) => v != null)); },
    flatMap(fn: (c: string) => Iterable<unknown>) { return new KotlinList(chars(text(this)).flatMap((c) => Array.from(fn(c)))); },
    forEach(fn: (c: string) => void) { for (const c of chars(text(this))) fn(c); },
    forEachIndexed(fn: (i: number, c: string) => void) { chars(text(this)).forEach((c, i) => fn(i, c)); },
    any(pred?: (c: string) => boolean) { const all = chars(text(this)); return pred ? all.some((c) => pred(c)) : all.length > 0; },
    all(pred: (c: string) => boolean) { return chars(text(this)).every((c) => pred(c)); },
    none(pred?: (c: string) => boolean) { const all = chars(text(this)); return pred ? !all.some((c) => pred(c)) : all.length === 0; },
    indexOfFirst(pred: (c: string) => boolean) { return chars(text(this)).findIndex((c) => pred(c)); },
    indexOfLast(pred: (c: string) => boolean) { const all = chars(text(this)); for (let i = all.length - 1; i >= 0; i--) if (pred(all[i])) return i; return -1; },
    toList() { return new KotlinList(chars(text(this))); },
    toCharArray() { return new KotlinList(chars(text(this))); },
    toMutableList() { return new KotlinList(chars(text(this))); },
    get(index: number) { const s = text(this); if (index < 0 || index >= s.length) throw error('StringIndexOutOfBoundsException', `Index ${index} out of bounds for length ${s.length}`); return s[index]; },
    contentEquals(other: string) { return text(this) === String(other); },
    withIndex() { return new KotlinList(chars(text(this)).map((c, i) => new KotlinIndexedValue(i, c))); },
    toSet() { return G.__kt_setOf(...chars(text(this))); },
    titlecase() { const s = text(this); return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); },
    sorted() { return new KotlinList(chars(text(this)).sort()); },
    lines() { return new KotlinList(text(this).split(/\r\n|\n|\r/)); },
    takeWhile(pred: (c: string) => boolean) { const all = chars(text(this)); const n = all.findIndex((c) => !pred(c)); return (n < 0 ? all : all.slice(0, n)).join(''); },
    dropWhile(pred: (c: string) => boolean) { const all = chars(text(this)); const n = all.findIndex((c) => !pred(c)); return (n < 0 ? [] : all.slice(n)).join(''); },
    chunked(size: number) { const all = chars(text(this)); const out = new KotlinList(); for (let i = 0; i < all.length; i += size) out.push(all.slice(i, i + size).join('')); return out; },
    windowed(size: number, step = 1, partial = false) { const all = chars(text(this)); const out = new KotlinList(); for (let i = 0; i < all.length && (partial || i + size <= all.length); i += step) out.push(all.slice(i, i + size).join('')); return out; },
    zip(other: string) { const a = chars(text(this)), b = chars(String(other)); return new KotlinList(a.slice(0, b.length).map((c, i) => new KotlinPair(c, b[i]))); },
    substringBefore(delimiter: string, missing?: string) { const s = text(this), i = s.indexOf(delimiter); return i < 0 ? (missing ?? s) : s.slice(0, i); },
    substringAfter(delimiter: string, missing?: string) { const s = text(this), i = s.indexOf(delimiter); return i < 0 ? (missing ?? s) : s.slice(i + delimiter.length); },
    substringBeforeLast(delimiter: string, missing?: string) { const s = text(this), i = s.lastIndexOf(delimiter); return i < 0 ? (missing ?? s) : s.slice(0, i); },
    substringAfterLast(delimiter: string, missing?: string) { const s = text(this), i = s.lastIndexOf(delimiter); return i < 0 ? (missing ?? s) : s.slice(i + delimiter.length); },
    removePrefix(prefix: string) { const s = text(this); return s.startsWith(prefix) ? s.slice(prefix.length) : s; },
    removeSuffix(suffix: string) { const s = text(this); return suffix && s.endsWith(suffix) ? s.slice(0, s.length - suffix.length) : s; },
    // Java's String.compareTo: the difference of the first differing chars, else of the lengths.
    compareTo(other: string, ignoreCase = false) {
      let a = text(this), b = String(other);
      if (ignoreCase) { a = a.toLowerCase(); b = b.toLowerCase(); }
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) if (a.charCodeAt(i) !== b.charCodeAt(i)) return a.charCodeAt(i) - b.charCodeAt(i);
      return a.length - b.length;
    },
    equals(other: unknown, ignoreCase = false) { return typeof other === 'string' && same(text(this), other, ignoreCase); },
    contains(other: string, ignoreCase = false) { const s = text(this); return ignoreCase ? s.toLowerCase().includes(String(other).toLowerCase()) : s.includes(String(other)); },
    ifEmpty(fn: () => string) { const s = text(this); return s.length === 0 ? fn() : s; },
    ifBlank(fn: () => string) { const s = text(this); return s.trim().length === 0 ? fn() : s; },
    plus(other: unknown) { return text(this) + String(other); },
    capitalize() { const s = text(this); return s.charAt(0).toUpperCase() + s.slice(1); },
    decapitalize() { const s = text(this); return s.charAt(0).toLowerCase() + s.slice(1); },
    replaceFirstChar(fn: (c: string) => unknown) { const all = chars(text(this)); return all.length ? String(fn(all[0])) + all.slice(1).join('') : ''; },
    hashCode() { return javaHashCode(text(this)); },
    trimMargin(prefix = '|') {
      const lines = text(this).split(/\r\n|\n|\r/);
      if (lines.length && !lines[0].trim()) lines.shift();
      if (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      return lines.map((l) => { const t = l.trimStart(); return t.startsWith(prefix) ? t.slice(prefix.length) : l; }).join('\n');
    },
    // String.substring(start[, end]) throws StringIndexOutOfBoundsException for a bad range (JS clamps silently).
    __kt_substring(start: number, end?: number) {
      const s = text(this), stop = end === undefined ? s.length : end;
      if (start < 0 || stop > s.length || start > stop) throw error('StringIndexOutOfBoundsException', `begin ${start}, end ${stop}, length ${s.length}`);
      return s.substring(start, stop);
    },
    // Kotlin's replace/replaceFirst take LITERAL text and replace every occurrence (JS replaces only the first). Generated code calls
    // `__kt_replace`; JavaScript's own `replace` is left alone because the transpiler itself runs in this realm and relies on it.
    __kt_replace(oldValue: unknown, newValue: unknown, ignoreCase = false) {
      const s = text(this);
      if (oldValue instanceof RegExp) return s.replace(oldValue.global ? oldValue : new RegExp(oldValue.source, oldValue.flags + 'g'), String(newValue));
      const needle = String(oldValue);
      if (needle === '') return s;
      if (!ignoreCase) return s.split(needle).join(String(newValue));
      return s.replace(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), () => String(newValue));
    },
    replaceFirst(oldValue: string, newValue: string, ignoreCase = false) {
      const s = text(this), needle = String(oldValue);
      const i = ignoreCase ? s.toLowerCase().indexOf(needle.toLowerCase()) : s.indexOf(needle);
      return i < 0 ? s : s.slice(0, i) + newValue + s.slice(i + needle.length);
    },
  };
  for (const [name, fn] of Object.entries(methods)) define(S, name, fn);

  // `startsWith("x", true)` / `endsWith("x", true)`: a Boolean second argument is Kotlin's ignoreCase, a number JavaScript's position.
  // Generated code calls `__kt_startsWith` / `__kt_endsWith` (the natives stay untouched, see __kt_replace above).
  const nativeStarts = S.startsWith, nativeEnds = S.endsWith;
  define(S, '__kt_startsWith', function (this: unknown, prefix: string, second?: unknown) {
    const s = text(this);
    return typeof second === 'boolean' ? (second ? s.toLowerCase().startsWith(String(prefix).toLowerCase()) : nativeStarts.call(s, prefix)) : nativeStarts.call(s, prefix, second);
  });
  define(S, '__kt_endsWith', function (this: unknown, suffix: string, second?: unknown) {
    const s = text(this);
    return typeof second === 'boolean' ? (second ? s.toLowerCase().endsWith(String(suffix).toLowerCase()) : nativeEnds.call(s, suffix)) : nativeEnds.call(s, suffix, second);
  });
  // The same names on any other receiver (a user class with its own `replace` / `startsWith` method) call that receiver's method.
  for (const name of ['replace', 'startsWith', 'endsWith', 'substring']) define(Object.prototype, `__kt_${name}`, function (this: any, ...args: unknown[]) { return this[name](...args); });

  // trim / trimStart / trimEnd with Char arguments or a predicate (`s.trimEnd(',')`, `s.trim { it == '-' }`); generated code calls the __kt_ names.
  const trimmer = (start: boolean, end: boolean) => function (this: unknown, ...args: any[]) {
    const all = chars(text(this));
    const drop: (c: string) => boolean = args.length === 0 ? (c) => /\s/.test(c) : typeof args[0] === 'function' ? args[0] : (c) => args.includes(c);
    let a = 0, b = all.length;
    if (start) while (a < b && drop(all[a])) a++;
    if (end) while (b > a && drop(all[b - 1])) b--;
    return all.slice(a, b).join('');
  };
  define(S, '__kt_trim', trimmer(true, true));
  define(S, '__kt_trimStart', trimmer(true, false));
  define(S, '__kt_trimEnd', trimmer(false, true));
  for (const name of ['trim', 'trimStart', 'trimEnd']) define(Object.prototype, `__kt_${name}`, function (this: any, ...args: unknown[]) { return this[name](...args); });
  getter(S, 'indices', function (this: unknown) { return G.__kt_rangeOf(0, text(this).length - 1); });
  getter(S, 'lastIndex', function (this: unknown) { return text(this).length - 1; });
}

function installChars() {
  const S: any = String.prototype;
  const first = (self: unknown) => String(self).codePointAt(0) ?? 0;
  const test = (re: RegExp) => function (this: unknown) { return re.test(String.fromCodePoint(first(this))); };
  const methods: Record<string, (this: unknown, ...args: any[]) => unknown> = {
    isLetter: test(/^\p{L}$/u), isDigit: test(/^\p{Nd}$/u), isLetterOrDigit: test(/^[\p{L}\p{Nd}]$/u), isWhitespace: test(/^\s$/u),
    isUpperCase: test(/^\p{Lu}$/u), isLowerCase: test(/^\p{Ll}$/u),
    uppercaseChar() { return String(this).charAt(0).toUpperCase(); },
    lowercaseChar() { return String(this).charAt(0).toLowerCase(); },
    titlecaseChar() { return String(this).charAt(0).toUpperCase(); },
    digitToInt(radix = 10) {
      const c = String(this).charAt(0), v = parseInt(c, radix);
      if (Number.isNaN(v)) throw error('IllegalArgumentException', `Char ${c} is not a decimal digit`);
      return v;
    },
    digitToIntOrNull(radix = 10) { const v = parseInt(String(this).charAt(0), radix); return Number.isNaN(v) ? null : v; },
  };
  for (const [name, fn] of Object.entries(methods)) define(S, name, fn);
  getter(S, 'code', function (this: unknown) { return first(this); });
}

function installNumbers() {
  const N: any = Number.prototype;
  const methods: Record<string, (this: unknown, ...args: any[]) => unknown> = {
    coerceIn(min: number, max: number) {
      if (min > max) throw error('IllegalArgumentException', `Cannot coerce value to an empty range: maximum ${max} is less than minimum ${min}.`);
      return Math.min(Math.max(Number(this), min), max);
    },
    coerceAtLeast(min: number) { return Math.max(Number(this), min); },
    coerceAtMost(max: number) { return Math.min(Number(this), max); },
    roundToInt() { const v = Number(this); if (Number.isNaN(v)) throw error('IllegalArgumentException', 'Cannot round NaN value.'); return Math.round(v); },
    roundToLong() { const v = Number(this); if (Number.isNaN(v)) throw error('IllegalArgumentException', 'Cannot round NaN value.'); return Math.round(v); },
    rem(other: number) { return Number(this) % other; },
    mod(other: number) { const r = Number(this) % other; return r !== 0 && (r < 0) !== (other < 0) ? r + other : r; },
    compareTo(other: number) { const a = Number(this); return a < other ? -1 : a > other ? 1 : 0; },
    toChar() { return String.fromCharCode(Number(this)); },
    inv() { return ~Number(this); },
    shl(bits: number) { return Number(this) << bits; },
    shr(bits: number) { return Number(this) >> bits; },
    ushr(bits: number) { return Number(this) >>> bits; },
    and(other: number) { return Number(this) & other; },
    or(other: number) { return Number(this) | other; },
    xor(other: number) { return Number(this) ^ other; },
    pow(exponent: number) { return Math.pow(Number(this), exponent); },
    plus(other: number) { return Number(this) + other; },
    minus(other: number) { return Number(this) - other; },
    times(other: number) { return Number(this) * other; },
  };
  for (const [name, fn] of Object.entries(methods)) define(N, name, fn);
  getter(N, 'absoluteValue', function (this: unknown) { return Math.abs(Number(this)); });

  // Boolean `and` / `or` / `xor` / `not()` (non-short-circuit, as in Kotlin).
  const B: any = Boolean.prototype;
  define(B, 'and', function (this: unknown, other: boolean) { return Boolean(this) && other; });
  define(B, 'or', function (this: unknown, other: boolean) { return Boolean(this) || other; });
  define(B, 'xor', function (this: unknown, other: boolean) { return Boolean(this) !== other; });
  define(B, 'not', function (this: unknown) { return !Boolean(this); });
}

/** `maxOf(a, b, ...)` / `minOf(a, b, ...)` for numbers and strings. */
function installGlobals() {
  const pick = (name: 'maxOf' | 'minOf') => (...values: any[]) => {
    if (!values.length) throw error('IllegalArgumentException', `${name} needs at least one argument`);
    return values.reduce((best, v) => (name === 'maxOf' ? (v > best ? v : best) : (v < best ? v : best)));
  };
  const decimal = (v: unknown, isFloat: boolean) => (typeof v === 'number' ? (isFloat ? javaFloatToString(v) : javaDoubleToString(v)) : G.__kt_formatValue(v));
  G.__kt_decimalAll = (xs: Iterable<unknown>, isFloat: boolean) => `[${Array.from(xs).map((v) => decimal(v, isFloat)).join(', ')}]`;
  G.__kt_decimalMap = (m: Map<unknown, unknown>, isFloat: boolean) => `{${[...m].map(([k, v]) => `${G.__kt_formatValue(k)}=${decimal(v, isFloat)}`).join(', ')}}`;
  G.__kt_iterable = (x: unknown) => (x instanceof Map ? new KotlinList([...x].map(([k, v]) => new G.__kt_MapEntry(k, v))) : x);
  G.__kt_orEmpty = (x: any, type: string) => (x != null ? x : type === 'String' ? '' : type.startsWith('Map') || type.startsWith('MutableMap') ? G.__kt_mapOf() : type.startsWith('Set') || type.startsWith('MutableSet') ? G.__kt_setOf() : type.startsWith('Array') ? G.__kt_markArray(new KotlinList()) : G.__kt_listOf());
  G.__kt_isNullOrEmpty = (x: any) => x == null || (x.length ?? x.size) === 0;
  G.__kt_isNullOrBlank = (x: any) => x == null || String(x).trim().length === 0;
  G.__kt_plus = (a: any, b: any) => {
    if (a instanceof Map) { const out = G.__kt_mutableMapOf(...a.entries()); if (b instanceof Map) for (const [k, v] of b) out.set(k, v); else if (b instanceof KotlinPair) out.set(b.first, b.second); else for (const p of b) out.set(p.first, p.second); return out; }
    if (a instanceof Set) return G.__kt_setOf(...a, ...(isIterable(b) ? b : [b]));
    if (a instanceof KotlinList) return a.plus(b);
    return a + b;
  };
  G.__kt_minus = (a: any, b: any) => {
    if (a instanceof Map) { const out = G.__kt_mutableMapOf(...a.entries()); for (const k of isIterable(b) ? b : [b]) out.delete(k); return out; }
    if (a instanceof Set) { const drop = isIterable(b) ? Array.from(b) : [b]; return G.__kt_setOf(...[...a].filter((x) => !drop.includes(x))); }
    if (a instanceof KotlinList) return a.minus(b);
    return a - b;
  };
  G.__kt_hashAll = (values: unknown[]) => values.reduce((h: number, v) => (Math.imul(31, h) + hashOf(v)) | 0, 0);
  G.__kt_charPlus = (c: string, n: number) => String.fromCodePoint((c.codePointAt(0) ?? 0) + n);
  G.__kt_charDiff = (a: string, b: string) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0);
  G.__kt_javaDouble = javaDoubleToString;
  G.__kt_javaFloat = javaFloatToString;
  G.IntRange = (from: number, to: number) => makeRange(from, to);
  G.CharRange = (from: string, to: string) => makeRange(from, to);
  G.LongRange = (from: number, to: number) => makeRange(from, to);
  G.Char = Object.assign((code: number) => String.fromCharCode(code), { MAX_VALUE: '\uffff', MIN_VALUE: '\u0000' });
  G.__kt_String = (value: unknown) => (Array.isArray(value) ? value.map(String).join('') : String(value));
  G.maxOf = pick('maxOf');
  G.minOf = pick('minOf');
  const longLimit = (name: string) => { throw error('IllegalStateException', `${name} is outside the editor's safe-integer range (a Long here is a JavaScript number)`); };
  G.Int = Object.freeze({ MAX_VALUE: 2147483647, MIN_VALUE: -2147483648 });
  G.Short = Object.freeze({ MAX_VALUE: 32767, MIN_VALUE: -32768 });
  G.Byte = Object.freeze({ MAX_VALUE: 127, MIN_VALUE: -128 });
  G.Long = Object.freeze({ get MAX_VALUE() { return longLimit('Long.MAX_VALUE'); }, get MIN_VALUE() { return longLimit('Long.MIN_VALUE'); } });
  G.Double = Object.freeze({ parseDouble: (s: string) => (s as any).toDouble(), MAX_VALUE: Number.MAX_VALUE, MIN_VALUE: Number.MIN_VALUE, NaN: Number.NaN, POSITIVE_INFINITY: Infinity, NEGATIVE_INFINITY: -Infinity });
  G.Float = Object.freeze({ MAX_VALUE: 3.4028234663852886e38, MIN_VALUE: 1.401298464324817e-45, NaN: Number.NaN, POSITIVE_INFINITY: Infinity, NEGATIVE_INFINITY: -Infinity });
}

/** kotlin.math: top-level functions and constants (`import kotlin.math.*`). `round` is round-half-to-even, unlike JavaScript's Math.round. */
export function installKotlinMath(): void {
  const rint = (x: number) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };
  Object.assign(G, {
    abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil, truncate: Math.trunc, round: rint,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, exp: Math.exp, expm1: Math.expm1, ln: Math.log, ln1p: Math.log1p,
    log10: Math.log10, log2: Math.log2, hypot: Math.hypot, cbrt: Math.cbrt, sign: Math.sign, min: Math.min, max: Math.max,
    log: (x: number, base?: number) => (base === undefined ? Math.log(x) : Math.log(x) / Math.log(base)),
    PI: Math.PI, E: Math.E,
  });
}

let installed = false;
export function installKotlinStdlib(): void {
  if (installed) return;
  installed = true;
  installStrings();
  installCollections();
  installChars();
  installNumbers();
  installGlobals();
}
