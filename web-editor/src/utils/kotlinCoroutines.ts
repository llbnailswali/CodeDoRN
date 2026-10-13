/**
 * World 16 Lesson 1 coroutine teaching runtime.
 *
 * This is deliberately deterministic and single-threaded. `launch`/`async`
 * enqueue a child in the current runBlocking scope; join/await execute that
 * child, and runBlocking drains any children that were not explicitly waited
 * for before returning. `delay` is a documented no-op. This preserves Lesson
 * 1's important distinction between reading state before and after `join`
 * without pretending to provide real scheduling, threads, cancellation,
 * timing, or sibling-coroutine interleaving. Lesson 4 adds a small context
 * model, but dispatcher values remain metadata and never switch threads.
 */
import { CancellationException } from './kotlinExceptions';

export class KotlinJob {
  private completed = false;
  private cancelled = false;
  private running = false;
  protected error: unknown;
  private readonly children = new Set<KotlinJob>();
  constructor(private readonly action: () => unknown = () => undefined) {}
  get isCompleted(): boolean { return this.completed; }
  get isCancelled(): boolean { return this.cancelled; }
  get isActive(): boolean { return !this.completed && !this.cancelled; }
  addChild(child: KotlinJob): void { this.children.add(child); }
  cancel(): void {
    if (this.completed) return;
    this.cancelled = true;
    for (const child of this.children) child.cancel();
  }
  cancelAndJoin(): void { this.cancel(); this.join(); }
  start(): boolean {
    if (this.completed || this.running || this.queued) return false;
    this.queued = true;
    pending.push(this);
    return true;
  }
  /** Set while the job waits in the scheduler queue (`pending`). */
  queued = false;
  /** Runs a job taken from the scheduler queue (never rethrows; failures surface through await or the scope drain). */
  __runQueued(): void { this.ensureRun(); }
  /** The scope that launched this job (set by `register`). */
  __scope?: { children: KotlinJob[]; context: Record<string, unknown>; supervisor?: boolean; failure?: unknown };
  get __error(): unknown { return this.error; }
  /**
   * Runs the action if it hasn't already, capturing (never throwing) any
   * failure. Shared by the public, never-throwing `join()` below and by
   * `__drainComplete` (the scope's own internal structural-propagation
   * path) -- keeping "did the action run" separate from "does completing
   * it expose an error" is exactly the distinction real Kotlin draws
   * between Job.join() and Deferred.await().
   */
  protected ensureRun(): void {
    if (this.completed) return;
    if (this.cancelled && !this.running) {
      this.completed = true;
      return;
    }
    this.running = true;
    try { this.action(); }
    catch (error) {
      if (!(error instanceof KotlinCancellationException)) this.error = error;
    }
    finally { this.running = false; this.completed = true; }
  }
  /**
   * Real Kotlin's `Job.join()` suspends until the job completes and never
   * exposes/rethrows a completion exception -- only `Deferred.await()`
   * does that (confirmed directly against Kotlin 2.0.21/coroutines 1.8.1:
   * `async<Int> { throw ... }; job.join(); println("done")` inside
   * supervisorScope prints "done" and exits 0, it does not throw). A
   * previous version of this simulator had `join()` unconditionally
   * rethrow any stored error, which silently turned a correct "join()
   * doesn't observe failure" lesson scenario into an incorrect crash.
   */
  join(): void {
    if (!this.completed) { runPending(); checkCancelledAfterWait(); }
    this.ensureRun();
  }
  /**
   * Used ONLY by the owning scope's own structural drain (see
   * `drainScope`/`drainSupervisorScope` below) -- this is what actually
   * propagates a child's failure to its parent the way real Kotlin's Job
   * hierarchy does automatically, independent of whether user code ever
   * calls join()/await() on that child at all. Never call this from
   * user-facing Kotlin lowering; only the scope-drain functions may.
   */
  __drainComplete(): void {
    this.ensureRun();
    if (this.error !== undefined) throw this.error;
  }
  toString(): string { return `Job{${this.cancelled ? 'Cancelled' : this.completed ? 'Completed' : 'Active'}}`; }
}

export class KotlinCancellationException extends CancellationException {
  constructor(message = 'Coroutine was cancelled') {
    super(message);
  }
  toString(): string { return `CancellationException: ${this.message}`; }
}

export class KotlinDeferred<T = unknown> extends KotlinJob {
  private value!: T;
  constructor(action: () => T) { super(() => { this.value = action(); }); }
  // Deferred.await(), unlike Job.join(), DOES retrieve and rethrow the
  // stored completion exception -- this is the one place in real Kotlin
  // where a coroutine builder's outcome is actually exposed to the caller.
  await(): T {
    // A failed Deferred rethrows its own exception even when that failure is also cancelling the waiting parent; a successful one
    // still lets the parent's cancellation show at this suspension point.
    const waited = !this.isCompleted;
    if (waited) runPending();
    this.ensureRun();
    if (this.error !== undefined) throw this.error;
    if (waited) checkCancelledAfterWait();
    // A Deferred that was cancelled (for example by a failed sibling) has no value: await throws CancellationException.
    if (this.isCancelled) throw new KotlinCancellationException();
    return this.value;
  }
  toString(): string { return `Deferred{${this.isCompleted ? 'Completed' : 'Active'}}`; }
}

/** Syntax-level start modes used by Lesson 2. DEFAULT starts immediately;
 * LAZY waits for start()/await()/scope completion. Neither mode schedules a
 * thread or models real interleaving in this single-threaded simulator. */
export const KotlinCoroutineStart = Object.freeze({
  DEFAULT: 'DEFAULT',
  LAZY: 'LAZY',
} as const);
export type KotlinCoroutineStartValue = typeof KotlinCoroutineStart[keyof typeof KotlinCoroutineStart];

export const KotlinJobKey = 'Job';
export const KotlinCoroutineNameKey = 'CoroutineName';
export const KotlinDispatcherKey = 'ContinuationInterceptor';
export const KotlinExceptionHandlerKey = 'CoroutineExceptionHandler';
export type KotlinContextElement = { key: string; [property: string]: unknown };
type KotlinContext = Record<string, unknown>;
type CoroutineScope = { children: KotlinJob[]; context: KotlinContext; supervisor?: boolean; failure?: unknown };
const scopes: CoroutineScope[] = [];
const contexts: KotlinContext[] = [];
/**
 * The scheduler queue. `launch` and a DEFAULT `async` only schedule their child here, as real Kotlin does on runBlocking's single
 * thread; queued children run, in order, when the current coroutine suspends (`join`, `await`, `yield`, `delay`, or the end of a scope).
 * A child still runs its whole body at once: this runtime cannot pause a child halfway, so a child is never cancelled in the middle
 * of a `delay` (see PITFALLS.md, "World 16 quiz: coroutine gaps").
 */
const pending: KotlinJob[] = [];
function runPending(): void {
  while (pending.length) {
    const job = pending.shift()!;
    job.queued = false;
    job.__runQueued();
    failScope(job);
  }
}

/**
 * Structured failure: in an ordinary (non-supervisor) scope a failed child cancels its siblings and its parent at once. The parent
 * notices at its next suspension point, and the scope function rethrows the child's original exception (`scope.failure`).
 */
function failScope(job: KotlinJob): void {
  const scope = job.__scope;
  const error = job.__error;
  if (!scope || scope.supervisor || error === undefined || scope.failure !== undefined) return;
  scope.failure = error;
  for (const sibling of scope.children) if (sibling !== job) sibling.cancel();
  const parent = scope.context[KotlinJobKey];
  if (parent instanceof KotlinJob) parent.cancel();
}

/** After waiting, a coroutine whose own Job was cancelled meanwhile (for example by a failed sibling) stops here. */
function checkCancelledAfterWait(): void {
  if (contexts.length) kotlinEnsureActive();
}

export const KotlinDispatchers = Object.freeze({
  Default: Object.freeze({ key: KotlinDispatcherKey, name: 'Default' }),
  IO: Object.freeze({ key: KotlinDispatcherKey, name: 'IO' }),
  Main: Object.freeze({ key: KotlinDispatcherKey, name: 'Main' }),
});

export function kotlinCoroutineName(name: string): KotlinContextElement {
  return Object.freeze({ key: KotlinCoroutineNameKey, name });
}

export function kotlinCoroutineExceptionHandler(
  handler: (context: KotlinContext, error: unknown) => void,
): KotlinContextElement {
  return Object.freeze({ key: KotlinExceptionHandlerKey, handler });
}

export const kotlinCoroutineContext: KotlinContext = new Proxy({}, {
  get(_target, property) {
    if (typeof property !== 'string') return undefined;
    return contexts.at(-1)?.[property];
  },
});

function inContext<T>(context: KotlinContext, block: () => T): T {
  contexts.push(context);
  try { return block(); }
  finally { contexts.pop(); }
}

function currentContext(): KotlinContext {
  const context = contexts.at(-1);
  if (!context) throw new Error('coroutineContext requires runBlocking in this lesson simulator');
  return context;
}

function register<T extends KotlinJob>(job: T): T {
  const scope = scopes.at(-1);
  if (!scope) throw new Error('Coroutine builder requires runBlocking in this lesson simulator');
  scope.children.push(job);
  job.__scope = scope;
  const parent = scope.context[KotlinJobKey];
  if (parent instanceof KotlinJob) parent.addChild(job);
  return job;
}

function drainScope(scope: CoroutineScope): void {
  runPending();
  for (let index = 0; index < scope.children.length; index++) {
    try { scope.children[index].__drainComplete(); }
    catch (error) {
      for (let sibling = index + 1; sibling < scope.children.length; sibling++) {
        scope.children[sibling].cancel();
      }
      throw error;
    }
  }
}

function drainSupervisorScope(scope: CoroutineScope): void {
  runPending();
  for (let index = 0; index < scope.children.length; index++) {
    try { scope.children[index].__drainComplete(); }
    catch { /* supervised child failure remains observable through join/await */ }
  }
}

export function kotlinRunBlocking<T>(contextOrBlock: KotlinContextElement | (() => T), maybeBlock?: () => T): T {
  const block = typeof contextOrBlock === 'function' ? contextOrBlock : maybeBlock;
  if (!block) throw new Error('runBlocking requires a block');
  if (!scopes.length) pending.length = 0;
  const rootJob = new KotlinJob();
  const context: KotlinContext = {
    [KotlinJobKey]: rootJob,
    [KotlinDispatcherKey]: KotlinDispatchers.Default,
    ...(typeof contextOrBlock === 'function' ? {} : elementsOf(contextOrBlock)),
  };
  const scope: CoroutineScope = { children: [], context };
  scopes.push(scope);
  try {
    const result = inContext(context, block);
    drainScope(scope);
    return result;
  } catch (error) {
    if (scope.failure !== undefined) throw scope.failure;
    throw error;
  } finally {
    scopes.pop();
  }
}

/** `coroutineScope` / `supervisorScope`: a child Job of the caller; waits for its children; rethrows a child failure to the caller. */
function runScope<T>(block: () => T, supervisor: boolean): T {
  const parentContext = currentContext();
  const scopeJob = new KotlinJob();
  const parentJob = parentContext[KotlinJobKey];
  if (parentJob instanceof KotlinJob) parentJob.addChild(scopeJob);
  const context: KotlinContext = { ...parentContext, [KotlinJobKey]: scopeJob };
  const scope: CoroutineScope = { children: [], context, supervisor };
  scopes.push(scope);
  try {
    const result = inContext(context, block);
    if (supervisor) drainSupervisorScope(scope); else drainScope(scope);
    return result;
  } catch (error) {
    for (const child of scope.children) child.cancel();
    if (scope.failure !== undefined) throw scope.failure;
    throw error;
  } finally {
    scopes.pop();
  }
}

export function kotlinCoroutineScope<T>(block: () => T): T {
  return runScope(block, false);
}

export function kotlinSupervisorScope<T>(block: () => T): T {
  return runScope(block, true);
}

export function kotlinLaunch(block: () => unknown): KotlinJob;
export function kotlinLaunch(context: KotlinContextElement, block: () => unknown): KotlinJob;
export function kotlinLaunch(contextOrBlock: KotlinContextElement | (() => unknown), maybeBlock?: () => unknown): KotlinJob {
  const block = typeof contextOrBlock === 'function' ? contextOrBlock : maybeBlock;
  if (!block) throw new Error('launch requires a block');
  const inherited = { ...currentContext() };
  if (typeof contextOrBlock !== 'function') {
    Object.assign(inherited, elementsOf(contextOrBlock));
  }
  let job!: KotlinJob;
  job = new KotlinJob(() => inContext({ ...inherited, [KotlinJobKey]: job }, () => {
    try { return block(); }
    catch (error) {
      const element = inherited[KotlinExceptionHandlerKey] as { handler?: (context: KotlinContext, error: unknown) => void } | undefined;
      if (element?.handler) {
        element.handler(inherited, error);
        return undefined;
      }
      throw error;
    }
  }));
  register(job);
  job.start();
  return job;
}

export function kotlinAsync<T>(block: () => T): KotlinDeferred<T>;
export function kotlinAsync<T>(start: KotlinCoroutineStartValue, block: () => T): KotlinDeferred<T>;
export function kotlinAsync<T>(context: KotlinContextElement, block: () => T): KotlinDeferred<T>;
export function kotlinAsync<T>(startOrContextOrBlock: KotlinCoroutineStartValue | KotlinContextElement | (() => T), maybeBlock?: () => T): KotlinDeferred<T> {
  const block = typeof startOrContextOrBlock === 'function' ? startOrContextOrBlock : maybeBlock;
  if (!block) throw new Error('async requires a block');
  const element = typeof startOrContextOrBlock === 'object' ? startOrContextOrBlock : undefined;
  const start = typeof startOrContextOrBlock === 'string' ? startOrContextOrBlock : KotlinCoroutineStart.DEFAULT;
  if (start !== KotlinCoroutineStart.DEFAULT && start !== KotlinCoroutineStart.LAZY) {
    throw new Error(`Unsupported CoroutineStart value: ${String(start)}`);
  }
  const inherited = { ...currentContext() };
  if (element) Object.assign(inherited, elementsOf(element));
  let deferred!: KotlinDeferred<T>;
  deferred = register(new KotlinDeferred(() => inContext({ ...inherited, [KotlinJobKey]: deferred }, block)));
  if (start === KotlinCoroutineStart.DEFAULT) deferred.start();
  return deferred;
}

export function kotlinWithContext<T>(element: KotlinContextElement, block: () => T): T {
  const context = { ...currentContext(), ...elementsOf(element) };
  return inContext(context, () => kotlinCoroutineScope(block));
}

/** A context argument is one element or several combined with `+` (`Dispatchers.Default + CoroutineName("x")`). */
function elementsOf(element: unknown): KotlinContext {
  const list = element instanceof KotlinCombinedContext ? element.elements
    : element && typeof element === 'object' && !('key' in element) && Symbol.iterator in element ? Array.from(element as Iterable<unknown>)
    : [element];
  const out: KotlinContext = {};
  for (const e of list) {
    if (!e || typeof (e as KotlinContextElement).key !== 'string') throw new Error('Unsupported coroutine context element');
    out[(e as KotlinContextElement).key] = e;
  }
  return out;
}

/** `a + b` of two context elements. */
export class KotlinCombinedContext {
  constructor(readonly elements: KotlinContextElement[]) {}
  plus(other: KotlinContextElement | KotlinCombinedContext): KotlinCombinedContext {
    return new KotlinCombinedContext([...this.elements, ...(other instanceof KotlinCombinedContext ? other.elements : [other])]);
  }
}
export function kotlinContextPlus(a: KotlinContextElement | KotlinCombinedContext, b: KotlinContextElement | KotlinCombinedContext): KotlinCombinedContext {
  return new KotlinCombinedContext([...(a instanceof KotlinCombinedContext ? a.elements : [a]), ...(b instanceof KotlinCombinedContext ? b.elements : [b])]);
}

export function kotlinDelay(milliseconds: number | bigint): void {
  const ms = Number(milliseconds);
  if (!Number.isInteger(ms) || ms < 0) {
    throw new Error('delay requires a non-negative Int or Long in this lesson simulator');
  }
  kotlinEnsureActive();
  // No timing: delay is a suspension point, so queued children run here.
  runPending();
  kotlinEnsureActive();
}

export function kotlinEnsureActive(): void {
  const job = currentContext()[KotlinJobKey];
  if (job instanceof KotlinJob && job.isCancelled) throw new KotlinCancellationException();
}

export function kotlinYield(): void {
  kotlinEnsureActive();
  runPending();
  kotlinEnsureActive();
}

/**
 * Removes supported coroutine imports and the `suspend`
 * function modifier. The modifier scan is lexical: strings and comments are
 * copied untouched, so text such as "suspend fun" is never corrupted.
 */
export function prepareCoroutineSource(source: string): string {
  // `Dispatchers.Default + CoroutineName("x")`: a combined context becomes a list of its elements (elementsOf accepts one).
  const element = String.raw`(?:Dispatchers\.\w+|CoroutineName\("[^"\n]*"\))`;
  source = source.replace(new RegExp(`${element}(?:\\s*\\+\\s*${element})+`, 'g'), (m) => `listOf(${m.split(/\s*\+\s*/).join(', ')})`);
  source = source.replace(
    /^[ \t]*import[ \t]+kotlinx\.coroutines\.\*[ \t]*;?[ \t]*(?:\/\/[^\n]*)?$/gm,
    '',
  );
  source = source.replace(
    /^[ \t]*import[ \t]+kotlin\.coroutines\.coroutineContext[ \t]*;?[ \t]*(?:\/\/[^\n]*)?$/gm,
    '',
  );

  let output = '';
  let i = 0;
  while (i < source.length) {
    if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i);
      const stop = end < 0 ? source.length : end;
      output += source.slice(i, stop);
      i = stop;
      continue;
    }
    if (source.startsWith('/*', i)) {
      let j = i + 2;
      let depth = 1;
      while (j < source.length && depth > 0) {
        if (source.startsWith('/*', j)) { depth++; j += 2; }
        else if (source.startsWith('*/', j)) { depth--; j += 2; }
        else j++;
      }
      output += source.slice(i, j);
      i = j;
      continue;
    }
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') { j += 2; continue; }
        if (source[j++] === quote) break;
      }
      output += source.slice(i, j);
      i = j;
      continue;
    }

    const match = source.slice(i).match(/^suspend\b(?=\s+fun\b)/);
    if (match && (i === 0 || !/[A-Za-z0-9_]/.test(source[i - 1]))) {
      i += match[0].length;
      continue;
    }
    output += source[i++];
  }
  return output;
}

/**
 * Labeled `this` (`"O".run outer@{ "I".run { this@outer + this } }`): a labeled lambda's receiver is saved in a local at the top of
 * that lambda (`val __kt_this_outer = this`) and every `this@outer` becomes that local, so the lowering never sees the label. The
 * label itself is dropped unless a `return@outer` needs it. Everything stays on its own line, so error lines do not move. Strings and
 * comments are left alone; `this@ClassName` (no `label@{` with that name) is not touched.
 */
export function rewriteLabeledThis(source: string): string {
  if (!/\bthis@\w+/.test(source)) return source;
  // blank out strings and comments (same length) to find real code positions
  const masked = source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, (m) => m.replace(/[^\n]/g, ' '));
  const labels = new Set<string>();
  for (const m of masked.matchAll(/\b([A-Za-z_]\w*)@\s*\{/g)) labels.add(m[1]);
  const edits: Array<{ start: number; end: number; text: string }> = [];
  for (const label of labels) {
    if (!new RegExp(`\\bthis@${label}\\b`).test(masked)) continue;
    const keepLabel = new RegExp(`\\breturn@${label}\\b`).test(masked);
    for (const m of masked.matchAll(new RegExp(`\\b${label}@(\\s*)\\{`, 'g'))) {
      const open = m.index! + m[0].length;
      const afterOpen = masked.slice(open);
      const arrow = /^\s*[A-Za-z_][\w,\s:<>?]*->/.exec(afterOpen);
      const alias = ` val __kt_this_${label} = this;`;
      if (arrow) edits.push({ start: open + arrow[0].length, end: open + arrow[0].length, text: alias });
      else edits.push({ start: open, end: open, text: alias });
      if (!keepLabel) edits.push({ start: m.index!, end: m.index! + label.length + 1, text: '' });
    }
    for (const m of masked.matchAll(new RegExp(`\\bthis@${label}\\b`, 'g'))) edits.push({ start: m.index!, end: m.index! + m[0].length, text: `__kt_this_${label}` });
  }
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = source;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

/** Backward-compatible alias for Lesson 1 callers; new code uses the
 * capability-wide name above. */
export const prepareLessonOneCoroutineSource = prepareCoroutineSource;

/**
 * World 16 Lesson 11 (Coroutine Best Practices): `GlobalScope.launch { ... }`
 * is the well-known anti-pattern this lesson teaches learners to AVOID --
 * work detached from any structured scope, whose completion no caller can
 * observe or wait for. Real Kotlin's `GlobalScope` is a real, always-active
 * top-level scope tied to the process; this simulator has no background
 * event loop or process lifetime to run detached work on at all, so the
 * most honest reproduction of "detached from structured concurrency" is
 * literal: the returned Job is a real `KotlinJob` (so `is Job`,
 * `.isCompleted`, etc. all still behave normally if inspected), but it is
 * deliberately never registered with any scope's children -- nothing in
 * this deterministic runtime will ever call join()/await()/__drainComplete
 * on it, so its action never runs during synchronous execution. This
 * reproduces the exact bug World 16 Lesson 11's Debug exercise teaches:
 * code that reads state a `GlobalScope.launch` block was supposed to set
 * observes the OLD value, because the detached work was never awaited (or,
 * in this simulator, never run at all).
 */
export function kotlinGlobalScopeLaunch(block: () => unknown): KotlinJob {
  return new KotlinJob(block);
}

/**
 * `kotlinx.coroutines.sync.Mutex`. This runtime never interleaves two coroutines inside a block (launch/async run their work
 * whole, `delay` is a no-op), so the lock is only ever found held when the SAME mutex is locked again inside its own block. Real
 * Kotlin's Mutex is not reentrant and suspends there forever; that deadlock is reported instead of hanging the editor.
 */
export class KotlinMutex {
  private locked = false;
  get isLocked(): boolean { return this.locked; }
  lock(): void {
    if (this.locked) throw new Error('IllegalStateException: Deadlock: this Mutex is already locked (a Kotlin Mutex is not reentrant, so this coroutine would wait forever)');
    this.locked = true;
  }
  tryLock(): boolean { if (this.locked) return false; this.locked = true; return true; }
  unlock(): void {
    if (!this.locked) throw new Error('IllegalStateException: This mutex is not locked');
    this.locked = false;
  }
  withLock<T>(block: () => T): T {
    this.lock();
    try { return block(); } finally { this.locked = false; }
  }
  toString(): string { return `Mutex@${this.locked ? 'locked' : 'unlocked'}`; }
}

/** `java.util.concurrent.atomic.AtomicInteger` / `AtomicLong`: a counter whose read-modify-write calls return Kotlin's values. */
export class KotlinAtomicNumber {
  constructor(private value: number = 0) {}
  get(): number { return this.value; }
  set(value: number): void { this.value = value; }
  getAndSet(value: number): number { const old = this.value; this.value = value; return old; }
  incrementAndGet(): number { return ++this.value; }
  decrementAndGet(): number { return --this.value; }
  getAndIncrement(): number { return this.value++; }
  getAndDecrement(): number { return this.value--; }
  addAndGet(delta: number): number { this.value += delta; return this.value; }
  getAndAdd(delta: number): number { const old = this.value; this.value += delta; return old; }
  compareAndSet(expected: number, next: number): boolean { if (this.value !== expected) return false; this.value = next; return true; }
  updateAndGet(fn: (v: number) => number): number { this.value = fn(this.value); return this.value; }
  toInt(): number { return this.value; }
  toString(): string { return String(this.value); }
}

/**
 * `this` inside a `runBlocking { }` / `coroutineScope { }` lambda: a CoroutineScope whose builders start children in the scope
 * that is currently running (`class Loader(val scope: CoroutineScope)` + `Loader(this)` + `scope.launch { }`).
 */
export const kotlinScopeReceiver = Object.freeze({
  launch: (contextOrBlock: KotlinContextElement | (() => unknown), maybeBlock?: () => unknown) =>
    kotlinLaunch(contextOrBlock as KotlinContextElement, maybeBlock as () => unknown),
  async: (startOrBlock: KotlinCoroutineStartValue | (() => unknown), maybeBlock?: () => unknown) =>
    kotlinAsync(startOrBlock as KotlinCoroutineStartValue, maybeBlock as () => unknown),
  get coroutineContext() { return kotlinCoroutineContext; },
  get isActive() { const job = contexts.at(-1)?.[KotlinJobKey]; return job instanceof KotlinJob ? job.isActive : true; },
  cancel() { const job = contexts.at(-1)?.[KotlinJobKey]; if (job instanceof KotlinJob) job.cancel(); },
  toString() { return 'CoroutineScope'; },
});

/** `jobs.joinAll()` / `joinAll(a, b)` and `deferreds.awaitAll()` / `awaitAll(a, b)`. */
export function kotlinJoinAll(jobs: Iterable<KotlinJob>): void { for (const job of jobs) job.join(); }
export function kotlinAwaitAll<T>(deferreds: Iterable<KotlinDeferred<T>>): T[] { return Array.from(deferreds, (d) => d.await()); }
