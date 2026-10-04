/**
 * The Write & Run / Debug stage loads one World's data on its own (data/stageLessonSource.ts). This checks that, for every catalog
 * lesson and every Practice-tab problem, it returns exactly what the full registry does AND does so without falling back to the
 * full source (a fallback is correct but defeats the point: it loads every World).
 */
import assert from 'node:assert/strict';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK, PRACTICE_BANK_SYNTHETIC_LESSONS } from '../src/data/practiceBank';
import { fullLessonSource } from '../src/data/fullLessonSource';
import { loadStageLessonSource } from '../src/data/stageLessonSource';

let lessons = 0;
for (const world of CODEDO_MASTER_WORLDS) {
  for (const meta of world.lessons) {
    const key = meta.fiveStageLessonKey;
    if (!key) continue;
    const expected = AVAILABLE_FIVE_STAGE_LESSONS[key];
    assert.ok(expected, `${key}: missing from the full registry`);
    const source = await loadStageLessonSource(key);
    assert.notEqual(source, fullLessonSource, `${key}: the stage source fell back to the full source`);
    assert.equal(source.resolveLesson(key), expected, `${key}: stage source returned a different lesson`);
    lessons++;
  }
}

let problems = 0;
for (const mode of ['writeRun', 'debug'] as const) {
  const bank = mode === 'writeRun' ? PRACTICE_WRITE_RUN_BANK : PRACTICE_DEBUG_BANK;
  for (const [worldId, list] of Object.entries(bank)) {
    for (const problem of list) {
      const source = await loadStageLessonSource(problem.id);
      assert.notEqual(source, fullLessonSource, `${problem.id}: the stage source fell back to the full source`);
      assert.deepEqual(source.resolveLesson(problem.id), PRACTICE_BANK_SYNTHETIC_LESSONS[problem.id], `${problem.id}: different lesson`);
      assert.deepEqual(
        source.practiceProblems(mode, worldId).map((p) => p.id),
        list.map((p) => p.id),
        `${problem.id}: practice list differs`,
      );
      assert.deepEqual(source.practiceProblems(mode, 'world-999'), [], `${problem.id}: foreign world list should be empty`);
      problems++;
    }
  }
}

// An unknown key must not leave the stage empty: it falls back to the full source.
assert.equal(await loadStageLessonSource('no-such-lesson'), fullLessonSource);

console.log(`Stage source: ${lessons} lessons and ${problems} practice problems resolve identically to the full registry, none via the fallback.`);
