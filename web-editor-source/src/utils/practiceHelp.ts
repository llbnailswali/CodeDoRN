import { PracticeHelpLevel, StorageManager } from './storage';

/** The learner's chosen Practice help level (Beginner when unset). */
export const getPracticeHelpLevelOrDefault = (): PracticeHelpLevel => StorageManager.getPracticeHelpLevel() ?? 'beginner';

/**
 * Removes the numbered step comments (`// 1. ...`) from starter code, keeping
 * the starting values and the blank writable space. Beginner keeps them;
 * Intermediate and Experienced start from a clean editor.
 */
export const stripStepComments = (code: string): string =>
  code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !/^\s*\/\/\s*\d+\./.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
