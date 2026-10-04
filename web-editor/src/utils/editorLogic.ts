// Shared, framework-free helpers for the mobile code editor (WriteRun.tsx).
// Kept separate from the component so the column-math/word-boundary/bracket
// logic can be unit-reasoned about without React in the loop.

export const AUTO_PAIR_MAP: Record<string, string> = {
  '(': ')',
  '{': '}',
  '[': ']',
  '"': '"',
  "'": "'",
};

export const CLOSING_CHARS = new Set(Object.values(AUTO_PAIR_MAP));

// True when `position` sits inside an unterminated "..." or '...' literal on
// its own line (escaped quotes ignored). Used to suppress bracket/quote
// auto-closing while the learner is typing string text.
export const isInsideStringLiteral = (code: string, position: number): boolean => {
  const lineStart = code.lastIndexOf('\n', position - 1) + 1;
  let quote: string | null = null;
  for (let i = lineStart; i < position; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    }
  }
  return quote !== null;
};

const IDENTIFIER_CHAR = /[a-zA-Z0-9_$]/;

// Commonly used Kotlin keywords/builtins offered as autocomplete suggestions
// once no (or not enough) matching identifier already exists in the
// learner's own code -- mirrors the accessory toolbar's own keyword tag row
// (CodingAccessoryToolbar.tsx's DEFAULT_KEYWORDS) plus the collection/type
// builtins most lessons actually reach for, so the two "quick word" surfaces
// stay roughly consistent with each other.
export const COMMON_COMPLETION_WORDS = [
  'val', 'var', 'fun', 'return', 'if', 'else', 'when', 'for', 'in', 'while', 'do',
  'true', 'false', 'null', 'break', 'continue', 'class',
  'println', 'print',
  'listOf', 'mutableListOf', 'mapOf', 'mutableMapOf', 'setOf', 'mutableSetOf', 'arrayOf',
  'Int', 'Long', 'Float', 'Double', 'Boolean', 'Char', 'String', 'Unit', 'Any', 'List', 'Map', 'Set', 'Array',
];

// The editor indents with 2 spaces per level: the Tab key and button, the extra level after `{` on Enter, and
// the dedent on a closing `}` all use this one size.
export const EDITOR_INDENT_SIZE = 2;
export const EDITOR_INDENT = ' '.repeat(EDITOR_INDENT_SIZE);

// Removes one indent level from a whitespace-only string, never going negative.
export function dedentLine(indent: string, spacesPerLevel: number = EDITOR_INDENT_SIZE): string {
  if (indent.length <= spacesPerLevel) return '';
  return indent.slice(0, indent.length - spacesPerLevel);
}

// Given a line of text and a character column, returns the [start, end) range
// of the "word" under that column: an identifier run if the column sits on/
// beside one, a single punctuation character if it sits on punctuation, or a
// collapsed (no-op) range if it sits on whitespace/out of bounds.
export function getWordRangeAt(line: string, col: number): { start: number; end: number } {
  const clamped = Math.max(0, Math.min(line.length, col));
  const isIdentChar = (idx: number) => idx >= 0 && idx < line.length && IDENTIFIER_CHAR.test(line[idx]);

  if (isIdentChar(clamped) || isIdentChar(clamped - 1)) {
    let start = clamped;
    let end = clamped;
    while (start > 0 && isIdentChar(start - 1)) start--;
    while (end < line.length && isIdentChar(end)) end++;
    return { start, end };
  }

  if (clamped < line.length && !/\s/.test(line[clamped])) {
    return { start: clamped, end: clamped + 1 };
  }

  return { start: clamped, end: clamped };
}

// Lesson starter code marks the blank(s) a learner needs to fill in with a
// `// ...` comment directly above them (e.g. `// 1. Declare ...:` followed by
// a blank or `}` line). The editor should open with the cursor already
// sitting on that first fill-in line, not wherever a generic heuristic lands.
export function findInitialCursorPosition(code: string): number {
  const lines = code.split('\n');
  const firstCommentLineIdx = lines.findIndex((line) => line.trim().startsWith('//'));

  if (firstCommentLineIdx !== -1 && firstCommentLineIdx + 1 < lines.length) {
    let offset = 0;
    for (let i = 0; i <= firstCommentLineIdx; i++) {
      offset += lines[i].length + 1;
    }
    return offset;
  }

  const returnIdx = code.indexOf('return');
  return returnIdx !== -1 ? returnIdx + 'return'.length : code.length;
}

// Like `findInitialCursorPosition`, but also guarantees the learner has
// `blankLineCount` blank lines to write into right after the first `// ...`
// TODO-style comment -- inserting more if the starter code has fewer (some
// lessons leave only one, or none at all when the comment sits directly
// above a closing `}`). Returns the (possibly modified) code alongside the
// cursor position, since this can change the document itself, not just
// where the caret sits. If no comment line exists at all, the code is
// returned unchanged (this only applies to the TODO-comment convention).
export function ensureBlankLinesAfterFirstComment(
  code: string,
  blankLineCount: number = 1
): { code: string; cursorPosition: number } {
  const lines = code.split('\n');
  const firstCommentLineIdx = lines.findIndex((line) => line.trim().startsWith('//'));

  if (firstCommentLineIdx === -1 || firstCommentLineIdx + 1 >= lines.length) {
    return { code, cursorPosition: findInitialCursorPosition(code) };
  }

  let existingBlankLines = 0;
  while (
    firstCommentLineIdx + 1 + existingBlankLines < lines.length &&
    lines[firstCommentLineIdx + 1 + existingBlankLines].trim() === ''
  ) {
    existingBlankLines++;
  }

  const missing = Math.max(0, blankLineCount - existingBlankLines);
  if (missing > 0) {
    lines.splice(firstCommentLineIdx + 1 + existingBlankLines, 0, ...Array(missing).fill(''));
  }

  let cursorPosition = 0;
  for (let i = 0; i <= firstCommentLineIdx; i++) {
    cursorPosition += lines[i].length + 1;
  }

  return { code: lines.join('\n'), cursorPosition };
}

// Guarantees a blank line right before the document's final closing brace, so the learner always has a free
// line to write on at the end of `main`. Applied when a document is LOADED into the editor (never while typing),
// so it never fights the learner's own edits. The insertion is at the very end, after any caret position the
// other load-time steps compute.
export function ensureBlankLineBeforeFinalBrace(code: string): string {
  const lines = code.split('\n');
  let last = lines.length - 1;
  while (last >= 0 && lines[last].trim() === '') last--;
  if (last < 1 || lines[last].trim() !== '}') return code;
  if (lines[last - 1].trim() === '') return code;
  lines.splice(last, 0, '');
  return lines.join('\n');
}

// The indent a brand-new line at `lineIdx` should start with: that of the nearest non-blank line above it, one
// level deeper when that line opens a block (`{`). Top level (nothing above, or after a top-level `}`) is 0.
export function indentForLine(lines: string[], lineIdx: number): string {
  for (let i = lineIdx - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.trim()) continue;
    const base = (line.match(/^ */) as RegExpMatchArray)[0];
    return line.trimEnd().endsWith('{') ? base + EDITOR_INDENT : base;
  }
  return '';
}

// Tapping (or landing the caret on) a completely EMPTY line inside a block puts the caret at that block's indent, so
// the learner can type straight away instead of first pressing Tab. Only an empty line is touched; a line that already
// has any text or spaces is left exactly as it is, and top-level lines stay at column 0. Returns the caret position.
export function snapEmptyLineIndent(code: string, position: number): { code: string; cursorPosition: number } {
  const lines = code.split('\n');
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const end = offset + lines[i].length;
    if (position >= offset && position <= end) {
      if (lines[i] !== '') return { code, cursorPosition: position };
      const indent = indentForLine(lines, i);
      if (!indent) return { code, cursorPosition: position };
      lines[i] = indent;
      return { code: lines.join('\n'), cursorPosition: offset + indent.length };
    }
    offset = end + 1;
  }
  return { code, cursorPosition: position };
}

// Converts a tap/press point (clientX/clientY) into a character column
// within `lineStr`, using the browser's own text hit-testing rather than
// assumed monospace character-width math. This is what makes tap-to-column
// and long-press-to-select-word work correctly whether the line renders as
// a single row (horizontal-scroll mode) or wraps across multiple visual
// rows (default mode) -- a fixed "pixels per character" assumption breaks
// the moment a line wraps, since the click's Y coordinate then also matters,
// not just X. `lineEl` must be the element containing exactly this line's
// rendered text (and nothing else), so summing preceding text-node lengths
// up to the hit point gives the correct absolute column.
export function columnFromPoint(lineEl: HTMLElement, lineStr: string, clientX: number, clientY: number): number {
  try {
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    };

    let hitNode: Node | null = null;
    let hitOffset = 0;

    if (doc.caretRangeFromPoint) {
      const range = doc.caretRangeFromPoint(clientX, clientY);
      if (range) {
        hitNode = range.startContainer;
        hitOffset = range.startOffset;
      }
    } else if (doc.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(clientX, clientY);
      if (pos) {
        hitNode = pos.offsetNode;
        hitOffset = pos.offset;
      }
    }

    if (hitNode && lineEl.contains(hitNode)) {
      const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT);
      let offsetInLine = 0;
      let node = walker.nextNode();
      while (node) {
        if (node === hitNode) {
          offsetInLine += hitOffset;
          return Math.max(0, Math.min(lineStr.length, offsetInLine));
        }
        offsetInLine += (node.textContent || '').length;
        node = walker.nextNode();
      }
    }
  } catch {
    // Fall through to the coarse fallback below.
  }

  // Fallback (hit-testing API unavailable, or the point fell outside any
  // text node -- most commonly a tap/long-press landing in the row's own
  // trailing empty space after a short line's last character, since `lineEl`
  // is a full-width flex row, not sized to its text). Comparing against
  // `lineEl`'s own bounding box here is wrong: for a short line the text's
  // real right edge sits far left of the row's midpoint, so most of that
  // trailing space would be misjudged as "left half" and incorrectly snap
  // the cursor to column 0 (the start of the line) instead of after the
  // last character. Use the actual rendered text's own bounding box(es)
  // instead, picking the visual row that matches clientY when the line wraps.
  try {
    const textRange = document.createRange();
    textRange.selectNodeContents(lineEl);
    const rects = Array.from(textRange.getClientRects());
    if (rects.length > 0) {
      const rect = rects.find((r) => clientY >= r.top && clientY <= r.bottom) ?? (clientY < rects[0].top ? rects[0] : rects[rects.length - 1]);
      if (clientX >= rect.right) return lineStr.length;
      if (clientX <= rect.left) return 0;
      return clientX < rect.left + rect.width / 2 ? 0 : lineStr.length;
    }
  } catch {
    // Fall through to the line-empty case below.
  }

  return 0;
}

// The reverse of columnFromPoint: given a character column within a line,
// returns its on-screen (viewport-relative) position. Used to position
// native-style selection drag handles and the floating selection menu
// exactly at the selection's edges, including on a wrapped (multi-visual-row)
// line, where a fixed "pixels per character" assumption would place the
// handle on the wrong visual row entirely.
export function pointFromOffset(lineEl: HTMLElement, offsetInLine: number): { x: number; y: number; height: number } | null {
  const walker = document.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT);
  let remaining = offsetInLine;
  let node = walker.nextNode();
  let lastTextNode: Text | null = null;
  while (node) {
    const text = node as Text;
    const len = text.textContent?.length ?? 0;
    if (remaining <= len) {
      const range = document.createRange();
      range.setStart(text, remaining);
      range.setEnd(text, remaining);
      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
      if (rect && (rect.width > 0 || rect.height > 0 || rect.top !== 0 || rect.left !== 0)) {
        return { x: rect.left, y: rect.top, height: rect.height || 17 };
      }
      // A collapsed range at a text-node boundary can report an empty rect
      // in some browsers -- fall through to the coarser line-box fallback
      // below rather than returning a meaningless (0, 0).
      break;
    }
    remaining -= len;
    lastTextNode = text;
    node = walker.nextNode();
  }

  // No text nodes at all (an empty line), or the offset landed past the end
  // of the last one: anchor to the end of the last real text node if there
  // is one, otherwise the line element's own left edge.
  if (lastTextNode) {
    const range = document.createRange();
    range.selectNodeContents(lastTextNode);
    range.collapse(false);
    const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
    if (rect) return { x: rect.left, y: rect.top, height: rect.height || 17 };
  }
  const rect = lineEl.getBoundingClientRect();
  return { x: rect.left, y: rect.top, height: rect.height || 17 };
}

// Symbols to surface first on the accessory bar for a given task. Driven only
// by text the learner can already see (title, description, starter/broken
// code) -- never the reference solution, so the ordering can't leak the answer.
// Rules are checked in order; earlier matches rank earlier. Symbols literally
// present in the visible text are ranked ahead of keyword-derived ones.
const SYMBOL_TOPIC_RULES: Array<{ pattern: RegExp; symbols: string[] }> = [
  { pattern: /\b(compar|equal|greater|less|larger|smaller|at least|at most|eligib|adult|boolean)/i, symbols: ['==', '!=', '<', '>', '<=', '>='] },
  { pattern: /\b(arithmetic|calculat|sum|total|add|subtract|multipl|divid|division|average|price|discount|tax|operator|precedence)/i, symbols: ['+', '-', '*', '/', '%', '(', ')'] },
  { pattern: /(\bremainder|\bmodulo|\beven\b|\bodd\b|\bdivisib|%)/i, symbols: ['%', '==', '/'] },
  { pattern: /(\blogical\b|\bboth\b|\beither\b|&&|\|\||\bnegat)/i, symbols: ['&&', '||', '!', '(', ')'] },
  { pattern: /\b(assign|increment|decrement|compound|counter|update)/i, symbols: ['+=', '-=', '*=', '/=', '++', '--'] },
  { pattern: /\b(range|loop|progression|until|downTo|step|repeat|iterate)/i, symbols: ['..', '{', '}', '(', ')'] },
  { pattern: /\b(when|branch|else if|condition)/i, symbols: ['->', '{', '}', '==', '<', '>'] },
  { pattern: /\b(template|string|text|message|greeting|print|output)/i, symbols: ['"', '$', '{', '}', '+', '\\'] },
  { pattern: /\b(char|character|escape|newline)/i, symbols: ["'", '\\', '"'] },
  { pattern: /\b(list|set|map|array|collection|index|element)/i, symbols: ['[', ']', '(', ')', '.', ','] },
  { pattern: /\b(null|nullable|safe call|elvis|optional|missing)/i, symbols: ['?', '.', ':', '!', '='] },
  { pattern: /\b(lambda|function type|higher-order|callback|it\b)/i, symbols: ['{', '}', '->', '(', ')', ':'] },
  { pattern: /\b(generic|type parameter|variance|<T>)/i, symbols: ['<', '>', ':', ','] },
  { pattern: /\b(class|object|constructor|property|method)/i, symbols: ['{', '}', '(', ')', ':', '.'] },
  { pattern: /\b(function|parameter|return|argument)/i, symbols: ['(', ')', ':', '{', '}', '='] },
];

const LITERAL_SYMBOLS = ['==', '!=', '<=', '>=', '&&', '||', '->', '..', '+=', '-=', '*=', '/=', '++', '--', '%', '+', '-', '*', '/', '<', '>', '!', '?', '$', '"', "'", '[', ']'];

export const deriveSymbolPriority = (...texts: Array<string | undefined>): string[] => {
  const text = texts.filter(Boolean).join('\n');
  const ordered: string[] = [];
  const add = (s: string) => {
    if (!ordered.includes(s)) ordered.push(s);
  };
  if (!text) return ordered;
  for (const sym of LITERAL_SYMBOLS) {
    if (text.includes(sym)) add(sym);
  }
  for (const rule of SYMBOL_TOPIC_RULES) {
    if (rule.pattern.test(text)) rule.symbols.forEach(add);
  }
  return ordered;
};

// Practice-bank problems carry `conceptTags` (e.g. 'lesson:arithmetic',
// 'remainder'). Those are an exact statement of what the task is about, so
// they take precedence over the wording-based guess above.
const CONCEPT_TAG_SYMBOLS: Record<string, string[]> = {
  'lesson:arithmetic': ['+', '-', '*', '/', '%'],
  'lesson:precedence': ['(', ')', '+', '-', '*', '/'],
  'lesson:comparison': ['==', '!=', '<', '>', '<=', '>='],
  'lesson:logical': ['&&', '||', '!', '(', ')'],
  'lesson:assignment': ['+=', '-=', '*=', '/=', '%='],
  'lesson:incdec': ['++', '--'],
  'lesson:if': ['==', '<', '>', '{', '}'],
  'lesson:if-else': ['==', '<', '>', '{', '}'],
  'lesson:else-if': ['<', '>', '<=', '>=', '{', '}'],
  'lesson:multiple-conditions': ['&&', '||', '!', '==', '<', '>'],
  'lesson:when': ['->', '{', '}', '=='],
  'lesson:when-ranges': ['->', '..', '{', '}'],
  'lesson:when-expression': ['->', '{', '}', '=='],
  'lesson:type-checks': ['!', '==', '{', '}'],
  'lesson:ranges': ['..', '{', '}'],
  'lesson:progressions': ['..', '{', '}'],
  'lesson:step': ['..', '{', '}'],
  'lesson:downto': ['..', '{', '}'],
  'lesson:for': ['..', '{', '}'],
  'lesson:while': ['<', '>', '++', '--', '{', '}'],
  'lesson:do-while': ['<', '>', '++', '--', '{', '}'],
  'lesson:nested-loops': ['..', '{', '}', '*'],
  'lesson:string-templates': ['$', '{', '}', '"'],
  'lesson:char': ["'", '\\', '"'],
  'lesson:string': ['"', '\\', '$', '+'],
  'lesson:parameters': ['(', ')', ':', ','],
  'lesson:defining': ['(', ')', ':', '{', '}'],
  'lesson:return': ['(', ')', ':', '=', '{', '}'],
  'lesson:single-expression': ['=', '(', ')', ':'],
  'lesson:default': ['=', '(', ')', ':', ','],
  'lesson:named': ['=', '(', ')', ','],
  'lesson:vararg': ['(', ')', ':', '.', '*'],
  'lesson:local': ['{', '}', '(', ')', ':'],
  remainder: ['%', '=='],
  'int-division': ['/', '%'],
  comparison: ['==', '!=', '<', '>', '<=', '>='],
  'logical-and': ['&&'],
  'logical-or': ['||'],
  'logical-not': ['!'],
  'compound-assignment': ['+=', '-=', '*=', '/='],
  'prefix-increment': ['++'],
  'postfix-increment': ['++'],
  decrement: ['--'],
  'range-membership': ['..'],
  'when-ranges': ['..', '->'],
  'negated-range': ['..', '!'],
  until: ['..'],
  downto: ['..'],
  'string-templates': ['$'],
  'dollar-escape': ['\\', '$'],
  'escape-characters': ['\\'],
  'template-expression': ['$', '{', '}'],
  precedence: ['(', ')', '*', '+'],
  grouping: ['(', ')'],
  'string-ordering': ['<', '>'],
};

export const deriveTaskSymbols = (conceptTags: string[] | undefined, ...texts: Array<string | undefined>): string[] => {
  const ordered: string[] = [];
  for (const tag of conceptTags ?? []) {
    for (const sym of CONCEPT_TAG_SYMBOLS[tag] ?? []) {
      if (!ordered.includes(sym)) ordered.push(sym);
    }
  }
  for (const sym of deriveSymbolPriority(...texts)) {
    if (!ordered.includes(sym)) ordered.push(sym);
  }
  return ordered;
};

// ---------------------------------------------------------------------------
// Helper-comment folding (Android Studio style), used by the practice-task editor.
// ---------------------------------------------------------------------------

// Collapsed, a fold shows only the comment's marker ("// 1." or "// TODO") followed by a "..." placeholder.
// A whole-line comment that guides the learner: a numbered step marker ("// 1. ...") or "// TODO".
const FOLD_START_RE = /^\s*\/\/\s*(?:\d+[.)]|TODO\b)/;
const PLAIN_COMMENT_LINE_RE = /^\s*\/\//;

export interface CommentFold {
  /** First line of the comment block (0-based). */
  start: number;
  /** Last line of the block; equals `start` for a single-line comment. */
  end: number;
  /** Stable identity used to remember which folds the learner opened (marker + occurrence, NOT the comment text). */
  key: string;
  /** Exact prefix of the first line shown while collapsed: just the marker, e.g. "    // 1.". */
  preview: string;
}

/**
 * Finds the foldable helper comments. A block starts at a numbered (or TODO) `//` line and continues over the
 * `//` lines directly below it that are not themselves a new numbered step. Every such comment folds as long as
 * there is something after its marker to hide.
 */
export function computeCommentFolds(lines: readonly string[]): CommentFold[] {
  const folds: CommentFold[] = [];
  const seen = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const marker = lines[i].match(FOLD_START_RE);
    if (!marker) continue;
    let end = i;
    while (end + 1 < lines.length && PLAIN_COMMENT_LINE_RE.test(lines[end + 1]) && !FOLD_START_RE.test(lines[end + 1])) end++;
    const hasMoreThanMarker = lines[i].slice(marker[0].length).trim().length > 0 || end > i;
    if (!hasMoreThanMarker) continue;
    // Identity is the MARKER (`// 1.`, `// TODO`) plus how many of that marker came before, never the comment's text:
    // editing the words of an open comment must not change its key, or the comment would collapse while being typed in.
    const text = marker[0].trim();
    const occurrence = seen.get(text) ?? 0;
    seen.set(text, occurrence + 1);
    folds.push({
      start: i,
      end,
      key: `${text}#${occurrence}`,
      // Exact prefix of the line (indentation included), so caret columns still line up.
      preview: marker[0],
    });
    i = end;
  }
  return folds;
}

/**
 * Moves the caret `lineDelta` VISIBLE lines, preserving the column where possible. `hidden` holds the lines
 * swallowed by collapsed folds (they are stepped over, so a collapsed block counts as one line), and
 * `maxColumn` optionally caps the column on a collapsed fold's first row to its visible preview.
 */
export function moveCaretByVisibleLines(
  code: string,
  caret: number,
  lineDelta: number,
  hidden: ReadonlySet<number>,
  maxColumn: (line: number) => number | undefined = () => undefined
): number {
  if (lineDelta === 0) return caret;
  const lines = code.split('\n');
  const offsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    offsets.push(offset);
    offset += line.length + 1;
  }
  let current = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (caret < offsets[i] + lines[i].length + 1) { current = i; break; }
  }
  const visible: number[] = [];
  for (let i = 0; i < lines.length; i++) if (!hidden.has(i)) visible.push(i);
  let position = visible.findIndex((line) => line >= current);
  if (position < 0) position = visible.length - 1;
  const target = position + lineDelta;
  if (target < 0) return 0;
  if (target > visible.length - 1) return code.length;
  const targetLine = visible[target];
  const column = Math.min(caret - offsets[current], lines[targetLine].length, maxColumn(targetLine) ?? Infinity);
  return offsets[targetLine] + Math.max(0, column);
}

export interface CollapsedFoldRange {
  start: number;
  end: number;
  /** Length of the visible marker on the fold's first row. */
  previewLength: number;
}

/**
 * Keeps the caret out of text a collapsed fold hides, WITHOUT opening the fold (only a click opens it). A caret
 * on a hidden line, or on the fold's first row past its visible marker, is moved: forward travel jumps to the
 * start of the line after the block, backward travel (or no direction) to the end of the visible marker, so a
 * collapsed block is crossed as a single line in both directions.
 */
export function snapCaretOutOfFolds(
  code: string,
  caret: number,
  collapsed: readonly CollapsedFoldRange[],
  direction: -1 | 0 | 1 = 0
): number {
  if (!collapsed.length) return caret;
  const lines = code.split('\n');
  const offsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    offsets.push(offset);
    offset += line.length + 1;
  }
  let lineIndex = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (caret < offsets[i] + lines[i].length + 1) { lineIndex = i; break; }
  }
  const column = caret - offsets[lineIndex];
  for (const fold of collapsed) {
    const hidden = lineIndex > fold.start && lineIndex <= fold.end;
    const pastMarker = lineIndex === fold.start && column > fold.previewLength;
    if (!hidden && !pastMarker) continue;
    if (direction > 0) return fold.end + 1 < lines.length ? offsets[fold.end + 1] : code.length;
    return offsets[fold.start] + fold.previewLength;
  }
  return caret;
}

/**
 * Re-indents code to the editor's 2-space level. Lesson and practice starters are authored with 4 spaces per
 * level; when every indented line is a multiple of 4 the whole program is halved. Code that is already
 * 2-space (or mixed) is left alone, so the function is safe to apply twice. Leading tabs become one level each.
 * Lines INSIDE a triple-quoted raw string are never touched: their spaces are program output, not formatting.
 */
export function toEditorIndent(code: string): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const isRawInterior: boolean[] = [];
  let insideRaw = false;
  for (const line of lines) {
    isRawInterior.push(insideRaw);
    if (((line.match(/"""/g) ?? []).length % 2) === 1) insideRaw = !insideRaw;
  }
  const withTabs = lines.map((line, i) => (isRawInterior[i] ? line : line.replace(/^\t+/, (tabs) => EDITOR_INDENT.repeat(tabs.length))));
  const indents = withTabs
    .map((line, i) => (isRawInterior[i] || !line.trim() ? null : (line.match(/^ */) as RegExpMatchArray)[0].length))
    .filter((n): n is number => n !== null && n > 0);
  if (!indents.length || indents.some((n) => n % 4 !== 0)) return withTabs.join('\n');
  return withTabs
    .map((line, i) => {
      if (isRawInterior[i] || !line.trim()) return line;
      const spaces = (line.match(/^ */) as RegExpMatchArray)[0].length;
      return ' '.repeat(spaces / 2) + line.slice(spaces);
    })
    .join('\n');
}

/**
 * What a collapsed hint DISPLAYS: `// TODO 1.` for a numbered hint (the word TODO is display-only, the comment's
 * real text is unchanged), or the marker as written for a `// TODO` hint. `column` maps a caret column in the real
 * preview onto the displayed text so the caret still lines up.
 */
export function foldPreviewDisplay(preview: string): { text: string; column: (realColumn: number) => number } {
  const marker = preview.match(/^(\s*)\/\/\s*(.*)$/);
  if (!marker || /^TODO\b/.test(marker[2])) return { text: preview, column: (c) => c };
  const realPrefix = preview.length - marker[2].length;
  const shownPrefix = `${marker[1]}// TODO `;
  return {
    text: shownPrefix + marker[2],
    column: (c) => (c >= realPrefix ? c - realPrefix + shownPrefix.length : Math.min(c, shownPrefix.length)),
  };
}

/**
 * Decides what the editor does when its `code` prop changes. `lastEmitted` is the last text the editor itself
 * produced (typing, Undo, Reset...). If the prop merely echoes it, nothing happens, so the learner's own code is
 * NEVER re-indented. Anything else was handed in from outside (first mount, another task, a parent overwriting the
 * code): it is loaded as a new document in 2-space indentation with the caret on the first blank line under the
 * first hint comment. Returns null when there is nothing to do.
 */
export function loadExternalDocument(
  code: string,
  lastEmitted: string | null
): { code: string; cursorPosition: number } | null {
  if (lastEmitted === code) return null;
  const normalized = ensureBlankLinesAfterFirstComment(toEditorIndent(code));
  return snapEmptyLineIndent(ensureBlankLineBeforeFinalBrace(normalized.code), normalized.cursorPosition);
}
