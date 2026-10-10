import type { KotlinDiagnostic, KotlinExecutionResult } from './kotlinRunner';

/**
 * Runs code with the REAL Kotlin compiler through the dev server (`npm run real-kotlin:serve`, scripts/real-kotlin-server.ts).
 * The result has the same shape as the simulator's, so the editor underlines the error and the run dialog shows the output
 * exactly as for a normal run. Dev-only: the app itself cannot run kotlinc.
 */
const DEFAULT_URL = 'http://localhost:8787';

function serverUrl(): string {
  try {
    return localStorage.getItem('codedo_real_kotlin_url') || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

interface ServerResult {
  stage: 'ok' | 'compile' | 'run';
  output: string;
  errors: { line: number; column: number; message: string }[];
}

const failure = (message: string, extra: Partial<KotlinDiagnostic> = {}): KotlinExecutionResult => ({
  success: false,
  output: '',
  logs: [],
  error: { message, line: 0, unlocated: true, type: 'runtime_error', ...extra },
  executionTimeMs: 0,
  exitCode: 1,
});

export async function runWithRealKotlin(code: string, expectedOutput?: string): Promise<KotlinExecutionResult> {
  const started = performance.now();
  let data: ServerResult;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    const response = await fetch(`${serverUrl()}/run`, { method: 'POST', body: JSON.stringify({ code }), signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return failure(`Kotlin compiler server answered ${response.status}.`);
    data = (await response.json()) as ServerResult;
  } catch {
    return failure('Cannot reach the Kotlin compiler server. On your computer run: npm run real-kotlin:serve (phone over USB: adb reverse tcp:8787 tcp:8787).');
  }
  const elapsed = Math.round(performance.now() - started);
  if (data.stage === 'compile') {
    const first = data.errors[0];
    return {
      success: false,
      output: '',
      logs: [],
      error: { message: `kotlinc: ${first?.message ?? 'compile error'}`, line: first?.line ?? 0, column: first?.column, type: 'compiler_error' },
      executionTimeMs: elapsed,
      exitCode: 1,
    };
  }
  const output = data.output.replace(/\r\n/g, '\n').replace(/\n$/, '');
  if (data.stage === 'run') {
    return { success: false, output, logs: output.split('\n'), error: { message: `kotlinc: ${data.errors[0]?.message ?? 'The program failed.'}`, line: 0, unlocated: true, type: 'runtime_error' }, executionTimeMs: elapsed, exitCode: 1 };
  }
  const matches = expectedOutput === undefined || output.trim() === expectedOutput.trim();
  return {
    success: matches,
    output,
    logs: output.split('\n'),
    error: matches ? undefined : { message: `kotlinc: Output mismatch: expected '${expectedOutput}', but got '${output}'`, line: 0, unlocated: true, type: 'runtime_error' },
    executionTimeMs: elapsed,
    exitCode: 0,
  };
}
