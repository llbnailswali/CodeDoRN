import type { KotlinDiagnostic, KotlinExecutionResult } from './kotlinRunner';

/**
 * Fallback engine: when the in-app simulator cannot run or grade a program, the same code is sent to JetBrains' public Kotlin
 * Playground compiler (real kotlinc + JVM) and the answer is shown in the simulator's own result shape.
 *
 * Caveats (see TOPIC_COVERAGE_AUDIT.md / the engine comparison notes):
 *  - JetBrains publishes no terms, limits or uptime promise for this endpoint, so it is only ever a FALLBACK. Every failure here
 *    (offline, HTTP error, timeout, unreadable answer) returns `null` and the caller keeps the simulator's own result.
 *  - Kill switch: `localStorage.setItem('codedo_online_fallback', 'off')` disables it on a device; `ONLINE_FALLBACK_ENABLED` disables it
 *    for everyone in a release. It is never active outside a browser/WebView (scripts and tests never touch the network).
 *  - Learner code leaves the device when it runs (the product decision was not to ask first); the result is labelled `engine: 'online-kotlin'`.
 */
export const ONLINE_FALLBACK_ENABLED = true;
export const ONLINE_KOTLIN_URL = 'https://api.kotlinlang.org/api/latest/compiler/run';
const TIMEOUT_MS = 20000;

export function onlineFallbackAvailable(): boolean {
  if (!ONLINE_FALLBACK_ENABLED || typeof window === 'undefined' || typeof fetch !== 'function') return false;
  try {
    return localStorage.getItem('codedo_online_fallback') !== 'off';
  } catch {
    return true;
  }
}

interface OnlineDiagnostic {
  interval?: { start?: { line?: number; ch?: number } };
  message?: string;
  severity?: string;
}
interface OnlineResponse {
  errors?: Record<string, OnlineDiagnostic[]>;
  exception?: { message?: string | null; fullName?: string; stackTrace?: { fileName?: string | null; lineNumber?: number }[] } | null;
  text?: string;
}

const ONLINE_ERROR_TYPE: KotlinDiagnostic['type'] = 'compiler_error';

/** Pure: turns the playground's JSON answer into the simulator's result shape. Exported for tests. */
export function interpretOnlineResponse(data: OnlineResponse, expectedOutput: string | undefined, elapsedMs: number): KotlinExecutionResult {
  const compileErrors = Object.values(data.errors ?? {}).flat().filter((d) => d.severity === 'ERROR');
  if (compileErrors.length > 0) {
    const first = compileErrors[0];
    return {
      success: false,
      output: '',
      logs: [],
      error: {
        message: first.message ?? 'Compilation error',
        line: (first.interval?.start?.line ?? 0) + 1,
        column: first.interval?.start?.ch ?? 0,
        type: ONLINE_ERROR_TYPE,
      },
      executionTimeMs: elapsedMs,
      exitCode: 1,
      engine: 'online-kotlin',
    };
  }

  const out = [...(data.text ?? '').matchAll(/<outStream>([\s\S]*?)<\/outStream>/g)].map((m) => m[1]).join('');
  const output = out.replace(/\r\n/g, '\n').replace(/\n$/, '');
  const logs = output === '' ? [] : output.split('\n');

  if (data.exception) {
    const frame = (data.exception.stackTrace ?? []).find((f) => f.fileName === 'File.kt' && (f.lineNumber ?? 0) > 0);
    const name = data.exception.fullName ?? 'Exception';
    return {
      success: false,
      output,
      logs,
      error: {
        message: data.exception.message ? `${name}: ${data.exception.message}` : name,
        line: frame?.lineNumber ?? 0,
        unlocated: !frame,
        type: 'runtime_error',
      },
      executionTimeMs: elapsedMs,
      exitCode: 1,
      engine: 'online-kotlin',
    };
  }

  if (expectedOutput !== undefined && expectedOutput !== '') {
    const actual = output.trim();
    if (actual !== expectedOutput.trim().replace(/\r\n/g, '\n')) {
      return {
        success: false,
        output,
        logs,
        error: {
          message: actual === '' ? `No output generated. Expected: '${expectedOutput}'` : `Output mismatch: expected '${expectedOutput}', but got '${output}'`,
          line: 1,
          type: 'runtime_error',
        },
        executionTimeMs: elapsedMs,
        exitCode: 1,
        engine: 'online-kotlin',
      };
    }
  }
  return { success: true, output, logs, executionTimeMs: elapsedMs, exitCode: 0, engine: 'online-kotlin' };
}

/** Runs `code` online. Returns null when the service is unavailable in any way, so the caller can keep the simulator's result. */
export async function runOnlineKotlin(code: string, expectedOutput?: string): Promise<KotlinExecutionResult | null> {
  if (!onlineFallbackAvailable()) return null;
  return requestOnline(code, expectedOutput);
}

/**
 * The explicit "J" run button: always asks the online compiler (ignores the fallback kill switch, since the learner pressed it) and says
 * plainly when it cannot be reached. Display only: like the K and M buttons it never completes a task.
 */
export async function runWithOnlineKotlin(code: string, expectedOutput?: string): Promise<KotlinExecutionResult> {
  const result = typeof fetch === 'function' ? await requestOnline(code, expectedOutput) : null;
  return (
    result ?? {
      success: false,
      output: '',
      logs: [],
      error: { message: 'Cannot reach the online Kotlin compiler right now. Check your connection and try again.', line: 0, unlocated: true, type: 'runtime_error' },
      executionTimeMs: 0,
      exitCode: 1,
    }
  );
}

async function requestOnline(code: string, expectedOutput?: string): Promise<KotlinExecutionResult | null> {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ONLINE_KOTLIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args: '', confType: 'java', files: [{ name: 'File.kt', publicId: '', text: code }] }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as OnlineResponse;
    if (typeof data !== 'object' || data === null || (!data.errors && data.text === undefined && !data.exception)) return null;
    const elapsed = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - started));
    return interpretOnlineResponse(data, expectedOutput, elapsed);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
