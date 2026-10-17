import { PracticeHelpLevel, StorageManager } from './storage';

/** The learner's chosen Practice help level (Beginner when unset). */
export const getPracticeHelpLevelOrDefault = (): PracticeHelpLevel => StorageManager.getPracticeHelpLevel() ?? 'beginner';

/**
 * Removes numbered step comments (`// 1. ...`) from starter code, keeping the
 * starting values and blank writable space. Every Practice help level starts
 * from a clean editor; a comment is inserted only when its hint is requested.
 */
export const stripStepComments = (code: string): string =>
  code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !/^\s*\/\/\s*\d+\./.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
