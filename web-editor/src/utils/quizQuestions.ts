/**
 * The seven Quiz question types and how each one is answered and graded.
 *
 * A question carries only its own content. What the learner has chosen (the "answer") is one of:
 *   single_choice / predict_output / code_comparison -> number   index of the chosen option (code_comparison: 0 = A, 1 = B)
 *   multi_select                                      -> number[] indexes of every ticked option
 *   fill_blank                                        -> string   the chip put into the blank
 *   find_error                                        -> number   index of the tapped code line
 *   true_false                                        -> boolean
 */

export type QuizQuestionType =
  | 'single_choice'
  | 'multi_select'
  | 'fill_blank'
  | 'predict_output'
  | 'find_error'
  | 'true_false'
  | 'code_comparison';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

interface QuestionBase {
  id: string;
  /** World this question belongs to (catalog id, for example `world-1`). */
  worldId: string;
  /** Catalog id of the lesson that teaches it. Internal: analytics and spreading a session across lessons. The learner never browses by lesson. */
  lessonId: string;
  /**
   * Set only: the quiz set (see data/quizBank/quizSets.ts) this question belongs to. A question with a setId combines concepts from several
   * lessons, so lesson quizzes leave it out; its lessonId is then the last lesson of the set. Absent for an ordinary one-lesson question.
   */
  setId?: string;
  /** The lesson's name, shown to the learner as the question's concept tag ("CONCEPT · Comments"). */
  topic: string;
  /** The specific skill inside the lesson ("Block comments"). Internal: finds weak spots such as "Operator precedence". */
  concept: string;
  /** Used to order a session (easier first) and to balance a World's bank. */
  difficulty: QuizDifficulty;
  xp: number;
  /** States the whole goal on its own: a code question must never rely on missing context. */
  question: string;
  /** Shown after checking. Say WHY the answer is right, not only what it is. */
  explanation: string;
  /** One-line nudge, shown only when the learner asks for it. Must not give the answer away. */
  hint?: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'single_choice' | 'predict_output';
  /** predict_output shows this code; single_choice usually has none. */
  code?: string[];
  options: string[];
  /** Options are plain values (a keyword, an output) and are drawn in monospace. */
  monoOptions?: boolean;
  answer: number;
}
export interface MultiSelectQuestion extends QuestionBase {
  type: 'multi_select';
  options: string[];
  monoOptions?: boolean;
  answers: number[];
}
export interface FillBlankQuestion extends QuestionBase {
  type: 'fill_blank';
  /** One line contains `___`, the blank. */
  code: string[];
  chips: string[];
  answer: string;
}
export interface FindErrorQuestion extends QuestionBase {
  type: 'find_error';
  code: string[];
  /** Index (0-based) of the line that has the error. */
  errorLine: number;
  /** Short note drawn under the error line after checking ("age is a val, so it cannot change"). */
  errorNote?: string;
}
export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false';
  answer: boolean;
}
export interface CodeComparisonQuestion extends QuestionBase {
  type: 'code_comparison';
  a: string[];
  b: string[];
  /** 0 = A, 1 = B. */
  answer: 0 | 1;
}
export type QuizQuestion =
  | ChoiceQuestion
  | MultiSelectQuestion
  | FillBlankQuestion
  | FindErrorQuestion
  | TrueFalseQuestion
  | CodeComparisonQuestion;

/** Format authored Kotlin snippets for readable quiz code panels, preserving error-line targets. */
export function formatQuizCodeQuestion(question: QuizQuestion, indentSpaces = 2): QuizQuestion {
  const formatted = { ...question } as QuizQuestion;
  const fields = formatted as unknown as Record<string, unknown>;
  for (const key of ['code', 'a', 'b']) {
    const lines = fields[key];
    if (!Array.isArray(lines) || !lines.every((line) => typeof line === 'string')) continue;
    const expanded: string[] = [];
    const originalLineStarts: number[] = [];
    let depth = 0;
    let buffer = '';
    let quoted = false;
    let escaped = false;
    const flush = () => {
      const text = buffer.trim();
      if (text) expanded.push(`${' '.repeat(Math.max(0, depth) * indentSpaces)}${text}`);
      buffer = '';
    };
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      originalLineStarts[lineIndex] = expanded.length;
      if (!(lines[lineIndex] as string).trim()) {
        flush();
        if (expanded.length > 0 && expanded[expanded.length - 1] !== '') expanded.push('');
        continue;
      }
      const lineText = lines[lineIndex] as string;
      for (let charIndex = 0; charIndex < lineText.length; charIndex++) {
        const char = lineText[charIndex];
        if (quoted) {
          buffer += char;
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === '"') quoted = false;
          continue;
        }
        if (char === '"') { quoted = true; buffer += char; continue; }
        if (char === '{') {
          // A lambda header such as `{ n ->` at the end of a line stays on that line.
          const rest = lineText.slice(charIndex + 1);
          if (/^\s*[A-Za-z_][\w, :<>?]*->\s*$/.test(rest)) { buffer = `${buffer.trimEnd()} {${rest.trimEnd()}`; flush(); depth++; break; }
          buffer = `${buffer.trimEnd()} {`; flush(); depth++; continue;
        }
        if (char === '}') {
          // The closer sits at its opener's depth; text after it on the same line (`else {`, `)`) stays with it.
          flush(); depth = Math.max(0, depth - 1);
          buffer = '}';
          continue;
        }
        if (char === ';') { flush(); continue; }
        buffer += char;
      }
      flush();
    }
    fields[key] = expanded;
    if (key === 'code' && formatted.type === 'find_error') {
      formatted.errorLine = originalLineStarts[formatted.errorLine] ?? formatted.errorLine;
    }
  }
  return formatted;
}

/** Add the same inline-code emphasis used by World 1 to important syntax in newer quiz prompts. */
export function emphasizeQuizPrompt(worldId: string, prompt: string): string {
  const terms: Record<string, string[]> = {
    'world-2': ['val', 'var', 'true', 'false', 'Boolean', 'Int', 'Double', 'String'],
    'world-3': ['else-if', 'else', 'true', 'false', 'Any', 'Int', 'String', 'Boolean'],
    'world-4': ['do-while', 'downTo', 'step', 'break', 'continue', 'true', 'false'],
    'world-5': ['fun', 'return', 'vararg', 'String', 'Int', 'Unit'],
    'world-7': ['null', 'String', 'Int', 'Any', 'List', 'true', 'false'],
    'world-8': ['class', 'object', 'val', 'var', 'init', 'private', 'public', 'open', 'override', 'interface', 'enum', 'data', 'String', 'Int', 'true', 'false'],
  };
  const keywords = terms[worldId] ?? [];
  if (!keywords.length) return prompt;

  const inline = /(`[^`]*`)/g;
  return prompt.split(inline).map((part, index) => {
    if (index % 2 === 1) return part;
    const protectedParts: string[] = [];
    let value = part;
    const protect = (pattern: RegExp) => {
      value = value.replace(pattern, (match) => {
        const token = String.fromCharCode(0xE100 + protectedParts.length);
        protectedParts.push(`\`${match}\``);
        return token;
      });
    };

    // Keep expressions and literal output values together as one readable code chip.
    protect(/"(?:\\.|[^"\\])*"/g);
    // A generic type such as List<Animal> is one code chip; otherwise `<` is mistaken for a comparison.
    protect(/\b[A-Z]\w*<[^<>`]+>/g);
    protect(/\b\d+\s*(?:\.\.|until|downTo)\s*\d+(?:\s+step\s+-?\d+)?\b/g);
    protect(/\b[A-Za-z_]\w*\s*(?:\+=|-=|\*=|\/=|%=|\+\+|--|==|!=|>=|<=|&&|\|\||=|>|<)\s*(?:[A-Za-z_]\w*|\d+(?:\.\d+)?|true|false)\b/g);

    if (worldId === 'world-8') {
      protect(/\b(?:data|enum|open)\s+class\b/g);
      protect(/\boverride\s+fun\b/g);
    }

    if (worldId === 'world-4') {
      protect(/\bfor(?=\s*(?:\(|-loop|\s+loop))\b/g);
      protect(/\bin(?=\s*(?:\d|[A-Za-z_]\w*\s*(?:\.\.|until|downTo)))/g);
      protect(/\bwhile(?=\s+(?:condition|loop|can|checks|body|statement))/g);
    }
    if (worldId === 'world-3') {
      protect(/\bif(?=\s*(?:block|condition|expression|statement|\/else|\())/g);
      protect(/\bwhen(?=\s*(?:branch|expression|matches|\())/g);
    }
    for (const term of keywords.sort((a, b) => b.length - a.length)) {
      protect(new RegExp(`\\b${term}\\b`, 'g'));
    }
    // Standalone numeric values are often the boundary or expected output being tested.
    protect(/\b\d+(?:\.\d+)?\b/g);

    return value.replace(/[\uE100-\uF8FF]/g, (token) => protectedParts[token.charCodeAt(0) - 0xE100] ?? token);
  }).join('');
}

export type QuizAnswer = number | number[] | string | boolean | null;

export const hasAnswer = (value: QuizAnswer): boolean =>
  value !== null && !(Array.isArray(value) && value.length === 0);

export function gradeQuizAnswer(q: QuizQuestion, value: QuizAnswer): boolean {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
    case 'code_comparison':
      return value === q.answer;
    case 'multi_select': {
      const picked = Array.isArray(value) ? [...value].sort() : [];
      const wanted = [...q.answers].sort();
      return picked.length === wanted.length && picked.every((v, i) => v === wanted[i]);
    }
    case 'fill_blank':
      return value === q.answer;
    case 'find_error':
      return value === q.errorLine;
    case 'true_false':
      return value === q.answer;
  }
}

/** Any answer (the right one or a learner's) as text, for "Your answer" and "Correct answer" lines. */
export function answerText(q: QuizQuestion, value: QuizAnswer): string {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
      return typeof value === 'number' ? (q.options[value] ?? '') : '';
    case 'multi_select':
      return Array.isArray(value) ? value.map((i) => q.options[i]).join(', ') : '';
    case 'fill_blank':
      return typeof value === 'string' ? value : '';
    case 'find_error':
      return typeof value === 'number' && q.code[value] !== undefined ? `Line ${value + 1}: ${q.code[value].trim()}` : '';
    case 'true_false':
      return typeof value === 'boolean' ? (value ? 'True' : 'False') : '';
    case 'code_comparison':
      return value === 0 ? 'A' : value === 1 ? 'B' : '';
  }
}

/** The right answer as text, for the "Correct answer" line shown after a wrong try. */
export function correctAnswerText(q: QuizQuestion): string {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
    case 'code_comparison':
    case 'fill_blank':
    case 'true_false':
      return answerText(q, q.answer);
    case 'multi_select':
      return answerText(q, q.answers);
    case 'find_error':
      return answerText(q, q.errorLine);
  }
}

/**
 * A copy of the question with its choices in a new random order (the right answer is remapped), so a retry cannot be passed by
 * remembering "it was the third one". Options of choice questions, chips of fill-in-the-blank and the A/B codes are shuffled.
 */
export function shuffleChoices(q: QuizQuestion): QuizQuestion {
  const order = <T,>(items: T[]) => items.map((item, index) => ({ item, index, key: Math.random() })).sort((x, y) => x.key - y.key);
  switch (q.type) {
    case 'single_choice':
    case 'predict_output': {
      const o = order(q.options);
      return { ...q, options: o.map((x) => x.item), answer: o.findIndex((x) => x.index === q.answer) };
    }
    case 'multi_select': {
      const o = order(q.options);
      return { ...q, options: o.map((x) => x.item), answers: o.flatMap((x, i) => (q.answers.includes(x.index) ? [i] : [])) };
    }
    case 'fill_blank':
      return { ...q, chips: order(q.chips).map((x) => x.item) };
    case 'code_comparison':
      return Math.random() < 0.5 ? q : { ...q, a: q.b, b: q.a, answer: q.answer === 0 ? 1 : 0 };
    default:
      return q;
  }
}

/** One plain line telling the learner HOW to answer this kind of question. */
export const QUIZ_INSTRUCTION: Record<QuizQuestionType, string> = {
  single_choice: 'Choose one answer',
  multi_select: 'Select all that apply',
  fill_blank: 'Tap a word to fill the blank',
  predict_output: 'Choose what it prints',
  find_error: 'Tap the line with the error',
  true_false: 'Choose true or false',
  code_comparison: 'Choose the correct code',
};

/** Short monospace tag shown at the top of a question, with its accent colour (editor syntax tones). */
export const QUIZ_TYPE_META: Record<QuizQuestionType, { tag: string; light: string; dark: string }> = {
  single_choice: { tag: 'single_choice', light: 'text-[#1f6fb5]', dark: 'text-[#569cd6]' },
  multi_select: { tag: 'multi_select', light: 'text-[#95468f]', dark: 'text-[#c586c0]' },
  fill_blank: { tag: 'fill_blank', light: 'text-[#936a14]', dark: 'text-[#e5c07b]' },
  predict_output: { tag: 'predict_output', light: 'text-[#17846f]', dark: 'text-[#4ec9b0]' },
  find_error: { tag: 'find_error', light: 'text-[#a8502f]', dark: 'text-[#ce9178]' },
  true_false: { tag: 'true_false', light: 'text-[#4a7a28]', dark: 'text-[#98c379]' },
  code_comparison: { tag: 'code_comparison', light: 'text-[#4338ca]', dark: 'text-[#9cdcfe]' },
};

/** Sample questions, one per type (World 1 / 2 content), used by the Quiz screens preview. */
export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sample-single', type: 'single_choice', worldId: 'sample', lessonId: 'sample', topic: 'Variables & Immutability', concept: 'Variables & Immutability', xp: 10, difficulty: 'easy',
    question: 'Which keyword declares a read-only variable in Kotlin?',
    options: ['var', 'val', 'const', 'let'], monoOptions: true, answer: 1,
    hint: 'Think about which keyword means the value can be set only once.',
    explanation: 'val declares a read-only variable: it can be set once. var is mutable, const marks a compile-time constant, and let is a scope function, not a declaration.',
  },
  {
    id: 'sample-predict', type: 'predict_output', worldId: 'sample', lessonId: 'sample', topic: 'Operators', concept: 'Operators', xp: 10, difficulty: 'easy',
    question: 'What will this code print?',
    code: ['var x = 5', 'x++', 'println(x)'],
    options: ['5', '6', '4', 'Error'], monoOptions: true, answer: 1,
    hint: 'Follow the lines in order: what is x after the second line?',
    explanation: 'x++ adds 1 to x, so x becomes 6 before println runs.',
  },
  {
    id: 'sample-tf', type: 'true_false', worldId: 'sample', lessonId: 'sample', topic: 'Variables & Immutability', concept: 'Variables & Immutability', xp: 10, difficulty: 'easy',
    question: 'A variable declared with val can be reassigned a new value.',
    answer: false,
    hint: 'What does "read-only" mean for a value?',
    explanation: 'A val variable is read-only. Assigning to it again is a compile error. Use var when the value must change.',
  },
  {
    id: 'sample-multi', type: 'multi_select', worldId: 'sample', lessonId: 'sample', topic: 'Basic Data Types', concept: 'Basic Data Types', xp: 15, difficulty: 'medium',
    question: 'Which of these are Kotlin integer types? Select all that apply.',
    options: ['Int', 'Long', 'String', 'Boolean', 'Double'], monoOptions: true, answers: [0, 1],
    hint: 'An integer is a whole number, with no decimal part.',
    explanation: 'Int and Long hold whole numbers. Double holds decimals, String holds text and Boolean holds true or false.',
  },
  {
    id: 'sample-fill', type: 'fill_blank', worldId: 'sample', lessonId: 'sample', topic: 'Variables & Immutability', concept: 'Variables & Immutability', xp: 10, difficulty: 'easy',
    question: 'Complete the code to declare a read-only variable with the value 25.',
    code: ['___ age = 25'], chips: ['val', 'var', 'const', 'let'], answer: 'val',
    hint: 'The age never has to change here.',
    explanation: 'val declares a read-only variable. var would let age change later, and const and let are not used to declare a local variable.',
  },
  {
    id: 'sample-error', type: 'find_error', worldId: 'sample', lessonId: 'sample', topic: 'Variables & Immutability', concept: 'Variables & Immutability', xp: 15, difficulty: 'medium',
    question: 'Tap the line that contains an error.',
    code: ['val age = 20', 'age = 21', 'println(age)'], errorLine: 1,
    hint: 'Look for a line that changes a value that was declared read-only.',
    errorNote: 'age is a val, so it cannot be given a new value.',
    explanation: "age is a val, so it cannot be reassigned on line 2. Declare it with var if it has to change.",
  },
  {
    id: 'sample-compare', type: 'code_comparison', worldId: 'sample', lessonId: 'sample', topic: 'Comparison Operators', concept: 'Comparison Operators', xp: 15, difficulty: 'medium',
    question: 'Which code correctly checks whether age is at least 18?',
    a: ['if (age > 18) {', '  println("Adult")', '}'],
    b: ['if (age >= 18) {', '  println("Adult")', '}'],
    answer: 1,
    hint: 'Does "at least 18" include 18 itself?',
    explanation: '"At least 18" includes 18 itself, so it needs >=. With > a person who is exactly 18 would be left out.',
  },
];
