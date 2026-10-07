// Downloads the minikotlin.run compiler + host runtime into web-editor/tools/minikotlin (git-ignored).
// Dev-only cross-check oracle (see MINIKOTLIN_WASM_FEASIBILITY.md). Not bundled: no licence was found.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tools', 'minikotlin');
const BASE = 'https://minikotlin.run/';
const FILES = [
  'wasm/minikotlin.js', 'wasm/minikotlin.wasm', 'wasm/kotlin_char_rt.wasm', 'wasm/kotlin_math_rt.wasm',
  'engine/host-imports.mjs', 'engine/math-runtime.mjs', 'engine/char-runtime.mjs', 'engine/js-runtime.mjs',
];
for (const f of FILES) {
  const res = await fetch(BASE + f);
  if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
  const out = join(root, f);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log('ok', f);
}
