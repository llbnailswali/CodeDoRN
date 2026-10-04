import { Stage4WriteRunData, Stage5DebugData } from '../lessonStagesData';

/**
 * A Practice-tab-only Write & Run problem -- distinct from any lesson's own
 * `writeRun` (which the learner already solved during Learn). Shares the
 * exact same shape as `Stage4WriteRunData` so it renders through the same
 * `WriteRun.tsx` component with no changes there; `difficulty` is added
 * because the base type has no real difficulty rating (TaskListScreen
 * fakes one positionally for lesson-derived entries -- bank entries carry
 * a real, authored one instead).
 */
export interface PracticeWriteRunProblem extends Stage4WriteRunData {
  id: string;
  worldId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Which lesson concepts this problem combines, for coverage tracking --
   * not currently rendered anywhere. */
  conceptTags: string[];
  /** One-liner shown on the Practice-tab task list card -- `description` is
   * the full multi-step task text (setup + numbered steps + the exact
   * expected-output quote), already shown again in full on the "Start
   * Coding" intro modal, so the list itself uses this short summary instead
   * (mirrors `Stage5DebugData.subtitle`, which already served this role for
   * Debug problems). */
  summary?: string;
}

/**
 * A Practice-tab-only Debug problem -- same shape as `Stage5DebugData`
 * (which already carries its own `difficulty`), plus an id/worldId/
 * conceptTags for bank bookkeeping.
 */
export interface PracticeDebugProblem extends Stage5DebugData {
  id: string;
  worldId: string;
  conceptTags: string[];
  /** Short 1–2 line description shown on the Practice task list. */
  summary?: string;
}
