/**
 * Reject awkward quiz prompts that describe a single snippet as "this different
 * example". A comparison prompt must name what it compares; otherwise it
 * should simply ask what the shown example prints.
 *
 * Source quiz banks are the authority. Run `npm run generate:native-data`
 * after correcting a reported prompt.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const bankDir = resolve('src/data/quizBank');
const invalidPrompt = /What does this different (?:example|code|program) print\?/gi;
const replacement = 'What does this example print?';
const violations: Array<{ file: string; line: number; before: string }> = [];

for (const file of readdirSync(bankDir).filter((name) => /^world\d+Quiz\.ts$/.test(name)).sort()) {
  const source = readFileSync(join(bankDir, file), 'utf8');
  for (const match of source.matchAll(invalidPrompt)) {
    const line = source.slice(0, match.index).split('\n').length;
    violations.push({ file, line, before: match[0] });
  }
}

if (violations.length) {
  console.error('Awkward quiz prompt wording found. Apply this correction before regenerating native data:');
  for (const issue of violations) {
    console.error(`- ${issue.file}:${issue.line}\n  before: ${issue.before}\n  after:  ${replacement}`);
  }
  process.exitCode = 1;
} else {
  console.log('Quiz prompt wording check passed: no redundant "this different example" prompts found.');
}
