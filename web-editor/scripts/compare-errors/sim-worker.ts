// Runs the in-app simulator in a worker thread so the parent can kill it when a program never returns (a synchronous loop the
// simulator's own timeout cannot interrupt).
import { parentPort } from 'node:worker_threads';
import { compileAndRunKotlin } from '../../src/utils/kotlinRunner';
import { resolveErrorSpan } from '../../src/utils/errorSpan';

parentPort!.on('message', async ({ id, code }: { id: string; code: string }) => {
  const r = await compileAndRunKotlin(code, { timeoutMs: 1500 });
  const span = r.error && r.error.type !== 'runtime_error' ? resolveErrorSpan(code, r.error) : null;
  parentPort!.postMessage({ id, output: r.output, error: r.error ? { message: r.error.message, line: r.error.line, type: r.error.type } : null, span: span ? { start: span.start, end: span.end, line: span.line + 1 } : null });
});
