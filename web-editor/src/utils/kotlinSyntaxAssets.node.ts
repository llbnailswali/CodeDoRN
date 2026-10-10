// Node only (tests and comparison scripts): the grammar is read from disk. The app uses Vite asset URLs instead (kotlinSyntaxAssets.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function nodeKotlinSyntaxAssets() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return { grammar: new Uint8Array(fs.readFileSync(path.join(here, '..', 'assets', 'tree-sitter', 'tree-sitter-kotlin.wasm'))) };
}
