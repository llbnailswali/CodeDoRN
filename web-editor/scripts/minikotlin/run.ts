// runMiniKotlin(code): compile + run one program on the minikotlin.run oracle in a worker with a hard kill.
import { Worker } from 'node:worker_threads';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const MINIKOTLIN_READY = existsSync(join(here, '..', '..', 'tools', 'minikotlin', 'wasm', 'minikotlin.wasm'));

export interface MiniResult { stage: 'ok' | 'compile' | 'run' | 'crash' | 'timeout'; output?: string; errors?: string[] }

export function runMiniKotlin(source: string, timeoutMs = 6000): Promise<MiniResult> {
  return new Promise((resolve) => {
    const w = new Worker(join(here, 'worker.mjs'), { workerData: { source } });
    const timer = setTimeout(() => { void w.terminate(); resolve({ stage: 'timeout', errors: ['timeout'] }); }, timeoutMs);
    w.once('message', (m) => { clearTimeout(timer); void w.terminate(); resolve(m); });
    w.once('error', (e) => { clearTimeout(timer); resolve({ stage: 'crash', errors: [String(e.message)] }); });
  });
}
