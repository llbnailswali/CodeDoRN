// Downloads the official Kotlin compiler (2.0.21) + kotlinx-coroutines (1.8.1) into web-editor/tools (git-ignored). Needs Java on PATH.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const tools = join(process.cwd(), 'tools');
mkdirSync(tools, { recursive: true });
async function get(url, out) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}
if (!existsSync(join(tools, 'kotlinc', 'bin', 'kotlinc'))) {
  const zip = join(tools, 'kotlin.zip');
  await get('https://github.com/JetBrains/kotlin/releases/download/v2.0.21/kotlin-compiler-2.0.21.zip', zip);
  execFileSync('unzip', ['-q', '-o', zip, '-d', tools]);
  rmSync(zip);
}
const jar = join(tools, 'kotlinx-coroutines-core-jvm-1.8.1.jar');
if (!existsSync(jar)) await get('https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-core-jvm/1.8.1/kotlinx-coroutines-core-jvm-1.8.1.jar', jar);
console.log('kotlinc ready in', tools);
