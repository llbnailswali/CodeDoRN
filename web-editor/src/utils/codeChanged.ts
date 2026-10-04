/**
 * True when the learner has changed the starter code. Ignores whitespace and whole-line // comments: the editor adds
 * blank lines / indentation when it loads the starter, and practice tasks swap the step comments per help level.
 */
const normalize = (code: string): string =>
  (code || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('')
    .replace(/\s+/g, '');

export const hasEditedCode = (current: string, initial: string): boolean => normalize(current) !== normalize(initial);
