/** Dumps every export of every live data module as JSON, for before/after comparison. Usage: tsx scripts/dump-data-exports.ts <out.json> */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const EXCLUDE = /OLD_BACKUP|LessonsDataOld/;
function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.tsx?$/.test(e.name) && !EXCLUDE.test(e.name) ? [p] : [];
  });
}
const out: Record<string, unknown> = {};
const errors: string[] = [];
for (const file of walk('src/data').sort()) {
  try {
    const mod = await import(pathToFileURL(path.resolve(file)).href);
    const plain: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mod)) if (typeof v !== 'function') plain[k] = v;
    out[file] = JSON.parse(JSON.stringify(plain, (_k, v) => (v === undefined ? '__undef__' : v)));
  } catch (e) {
    errors.push(`${file}: ${(e as Error).message.split('\n')[0]}`);
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log(`dumped ${Object.keys(out).length} modules; ${errors.length} failed to import`);
errors.forEach((e) => console.log('  ', e));
