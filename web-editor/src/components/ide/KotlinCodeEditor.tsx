import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { soundFX } from '../../utils/audio';
import { renderHighlightedLine, renderHighlightedLineSegments, KEYWORDS } from '../../utils/ideSyntaxHighlighter';
import {
  AUTO_PAIR_MAP,
  isInsideStringLiteral,
  CLOSING_CHARS,
  columnFromPoint,
  COMMON_COMPLETION_WORDS,
  dedentLine,
  ensureBlankLinesAfterFirstComment,
  ensureBlankLineBeforeFinalBrace,
  snapEmptyLineIndent,
  computeCommentFolds,
  EDITOR_INDENT,
  toEditorIndent,
  loadExternalDocument,
  loadExternalDocumentAtEnd,
  moveCaretByVisibleLines,
  snapCaretOutOfFolds,
  foldPreviewDisplay,
  findInitialCursorPosition,
  getWordRangeAt,
  pointFromOffset,
} from '../../utils/editorLogic';
import { CodingAccessoryToolbar } from './CodingAccessoryToolbar';
import { MobileCodingKeyboard } from './MobileCodingKeyboard';

// How many editor states Undo can step back through (the history keeps this many; one fewer undo steps).
const MAX_UNDO_STATES = 100;

export interface KotlinCodeEditorHandle {
  // Replaces the whole document (e.g. "Reset to Starter", "Apply Solution").
  // When cursorPos is omitted, the code is also normalized to guarantee 2
  // blank lines after the first TODO comment (see ensureBlankLinesAfterFirstComment),
  // and the cursor is placed on the first of them -- the same treatment the
  // editor gives the starter code on first mount.
  resetTo: (code: string, cursorPos?: number) => void;
  // Opens a folded helper comment by its fold key (marker + occurrence, e.g. "// 1.#0").
  expandHelperComment: (key: string) => void;
  // Shows/hides the dedicated on-screen arrow buttons. Off by default since
  // swiping anywhere on the keypad already moves the cursor in all 4
  // directions; some users may still want the explicit buttons.
  // Switches between wrapping long lines to fit the screen width (default,
  // no horizontal scrollbar -- write code without ever scrolling sideways)
  // and the old no-wrap-plus-horizontal-scroll behavior.
  toggleHorizontalScroll: () => void;
}

interface KotlinCodeEditorProps {
  /** A small control floating over the top-right corner of the code (e.g. Try it's Copy code button). */
  floatingAction?: React.ReactNode;
  /** Free coding ("Try it"): open with the caret on a free line after the last statement, inside the final `}`, instead of at a starter's TODO comment. */
  cursorAtEnd?: boolean;
  code: string;
  onCodeChange: (code: string) => void;
  // Ctrl/Cmd+Enter shortcut. What "running" means (graded vs. freeform) is
  // entirely up to the consumer.
  onRunRequested?: () => void;
  customTokens?: string[];
  prioritySymbols?: string[];
  className?: string;
  // Reports the current on/off state whenever it changes, so a consumer's
  // own menu (e.g. WriteRun's overflow menu) can reflect it in a label.
  // Reports the current wrap/scroll mode whenever it changes, so a
  // consumer's own menu (e.g. WriteRun's overflow menu) can reflect it.
  onHorizontalScrollChange?: (enabled: boolean) => void;
  // Matches the app's light/dark theme toggle -- defaults to dark to match
  // this editor's original always-dark look.
  isDark?: boolean;
  // Practice mode: the starter's numbered `// 1. ...` / `// TODO` helper comments fold Android Studio style to just
  // their marker plus a "..." placeholder; tapping one expands it. The document text is never changed, only how the
  // lines are drawn. Off by default so lesson editors look exactly as before.
  collapseHelperComments?: boolean;
  // Called when the learner opens or closes a folded helper comment by tapping it (key like "// 1.#0"). Not called for
  // opens made through `expandHelperComment`, so a consumer that syncs the two never loops.
  onHelperToggle?: (key: string, open: boolean) => void;
  /** Rendered between the code surface and the keyboard (e.g. the Try it output window). */
  outputPanel?: React.ReactNode;
}

const LONG_PRESS_MS = 450;
const LONG_PRESS_MOVE_THRESHOLD_PX = 8;

export const KotlinCodeEditor = forwardRef<KotlinCodeEditorHandle, KotlinCodeEditorProps>(
  (
    {
      code,
      onCodeChange,
      onRunRequested,
      customTokens = [],
      prioritySymbols,
      className = '',
      onHorizontalScrollChange,
      isDark = true,
      collapseHelperComments = false,
      onHelperToggle,
      outputPanel,
      cursorAtEnd,
      floatingAction,
    },
    ref
  ) => {
    const [showVirtualKeyboard] = useState<boolean>(true);
    // On by default: lines do not wrap and long lines scroll sideways. The overflow menu can switch to wrapping.
    const [horizontalScrollEnabled, setHorizontalScrollEnabled] = useState<boolean>(true);
    // Helper comments the learner has tapped open (keyed by the comment's trimmed text).
    const [expandedHelpers, setExpandedHelpers] = useState<Set<string>>(() => new Set());
    const toggleHelper = (key: string) => {
      const opening = !expandedHelpers.has(key);
      setExpandedHelpers((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      onHelperToggle?.(key, opening);
    };

    useEffect(() => {
      onHorizontalScrollChange?.(horizontalScrollEnabled);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horizontalScrollEnabled]);

    // Cursor and Selection tracking. Starter code marks its fill-in blanks
    // with a `// ...` comment directly above them, so open with the caret
    // already on the first such blank rather than defaulting to the end.
    const [cursorPosition, setCursorPosition] = useState<number>(() => findInitialCursorPosition(code));

    // Undo / Redo History Stack. Each entry remembers the cursor position the
    // caret was at right after that code state was reached, so undo/redo can
    // restore the caret to where the edit actually happened instead of always
    // snapping it to the end of the code.
    const [history, setHistory] = useState<{ code: string; cursor: number }[]>(() => [
      { code, cursor: cursorPosition },
    ]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    // Text handed in from OUTSIDE the editor (first mount, a different task, a reset or replacement by the parent) is
    // loaded as a new document: shown in the editor's own 2-space indentation (starters are authored with 4 spaces
    // per level) with 1 blank line after the first TODO comment, the caret on the first blank, and a fresh undo
    // history. This is the ONLY place that converts indentation, so no screen has to: a parent re-applying the raw
    // starter after mount is converted again here. The editor's own edits are never re-indented (they echo back
    // through `lastEmittedRef`), so code the learner types is left exactly as typed. A layout effect runs before
    // paint, so the 4-space version is never seen.
    // Set when a document was just loaded: the next caret reveal first scrolls the view back to column 0 (see the effect that keeps the caret visible).
    const justLoadedCursor = useRef<number | null>(null);
    const codePropRef = useRef(code);
    codePropRef.current = code;
    const onCodeChangeRef = useRef(onCodeChange);
    onCodeChangeRef.current = onCodeChange;
    useLayoutEffect(() => {
      const loaded = (cursorAtEnd ? loadExternalDocumentAtEnd : loadExternalDocument)(code, lastEmittedRef.current);
      if (!loaded) return; // the editor's own edit echoing back
      lastEmittedRef.current = loaded.code;
      justLoadedCursor.current = loaded.cursorPosition;
      // Safety net: if no re-render follows (caret unchanged), do not leave the flag set.
      setTimeout(() => { justLoadedCursor.current = null; }, 400);
      if (loaded.code !== code) {
        onCodeChange(loaded.code);
      }
      setSelection(null);
      setExpandedHelpers(new Set());
      setCursorPosition(loaded.cursorPosition);
      setHistory([{ code: loaded.code, cursor: loaded.cursorPosition }]);
      setHistoryIndex(0);
      // A parent that re-applies the RAW text in its own effect right after mount gets that update merged with ours
      // (last write wins), so the prop can end up back at the raw text with no further change to trigger this effect,
      // leaving the editor showing un-normalized code. Once the parent has settled, push the loaded text again if the
      // prop is still stale and the learner has not typed since.
      const target = loaded.code;
      window.setTimeout(() => {
        if (codePropRef.current !== target && lastEmittedRef.current === target) onCodeChangeRef.current(target);
      }, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    // Long-press-driven text selection (a real range, distinct from the
    // single blinking-caret cursorPosition above) and the menu it opens.
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
    const [longPressMenu, setLongPressMenu] = useState<{ x: number; y: number; lineIdx: number } | null>(null);

    // Native-style drag handles at the two ends of the active selection, so a
    // learner can extend/shrink a selection by dragging instead of only ever
    // getting the single word `triggerLongPress` selected. Screen positions
    // (viewport-relative, matching getBoundingClientRect/`fixed` styling) are
    // recomputed from `selection` via pointFromOffset -- see the effect below.
    const [handlePositions, setHandlePositions] = useState<{
      start: { x: number; y: number; height: number };
      end: { x: number; y: number; height: number };
    } | null>(null);
    const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);
    // Brief, auto-dismissing feedback for a clipboard action -- Copy/Cut give
    // no other visible confirmation (unlike Paste, where the inserted text
    // itself is the feedback), and every clipboard failure used to be
    // silent (an error sound only), easy to mistake for "nothing happened."
    const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);
    const clipboardNoticeTimerRef = useRef<number | null>(null);
    const showClipboardNotice = (message: string) => {
      setClipboardNotice(message);
      if (clipboardNoticeTimerRef.current !== null) window.clearTimeout(clipboardNoticeTimerRef.current);
      clipboardNoticeTimerRef.current = window.setTimeout(() => setClipboardNotice(null), 1500);
    };

    // The menu's real rendered height, measured after it mounts -- a guessed
    // constant never matched the actual height (it differs by theme, and by
    // how many action rows are shown), which is what left the menu
    // overlapping the selection in both the "above" and "below" placements.
    const [menuHeight, setMenuHeight] = useState(220);
    const menuRef = useRef<HTMLDivElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cursorSpanRef = useRef<HTMLSpanElement>(null);
    const editorScrollRef = useRef<HTMLDivElement>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
    const justLongPressedRef = useRef<boolean>(false);
    // Populated by each rendered line's ref callback below, so drag handling
    // and position recomputation can find "the DOM element for line N"
    // without an app-wide id/selector lookup.
    const lineElsRef = useRef<Map<number, HTMLDivElement>>(new Map());
    // How many on-screen rows each logical line takes. When lines wrap (horizontal scroll off) a long line spans several
    // rows and every row is numbered, so the gutter never has a gap. Lines not listed take one row.
    const [rowCounts, setRowCounts] = useState<Record<number, number>>({});
    // Width of the visible editor area. A `//` comment line (a step hint can be a long sentence) wraps to this width even
    // while horizontal scrolling is on, so reading a hint never needs sideways scrolling.
    const [viewportWidth, setViewportWidth] = useState(0);
    useEffect(() => {
      const el = editorScrollRef.current;
      if (!el) return;
      const update = () => setViewportWidth(el.clientWidth);
      update();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);
    useLayoutEffect(() => {
      const next: Record<number, number> = {};
      lineElsRef.current.forEach((el, idx) => {
        const rows = Math.max(1, Math.round(el.getBoundingClientRect().height / 24));
        if (rows > 1) next[idx] = rows;
      });
      const keys = Object.keys(next);
      const same = keys.length === Object.keys(rowCounts).length && keys.every((k) => rowCounts[Number(k)] === next[Number(k)]);
      if (!same) setRowCounts(next);
    });

    // Sync history if `code` changes externally (e.g. loading a new lesson)
    useEffect(() => {
      if (history[historyIndex].code !== code) {
        setHistory((prev) =>
          [...prev.slice(0, historyIndex + 1), { code, cursor: Math.min(cursorPosition, code.length) }].slice(-MAX_UNDO_STATES)
        );
        setHistoryIndex((prev) => Math.min(prev + 1, MAX_UNDO_STATES - 1));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    // Every change the editor itself makes goes out through here, so a code prop that merely echoes one of them
    // back is recognised and left alone (see the "text handed in from outside" effect below).
    const lastEmittedRef = useRef<string | null>(null);
    // Set by every edit the learner makes; suggestions are computed only for such an edit (see the autocomplete effect).
    const editedSinceRenderRef = useRef(false);
    const emitCode = (next: string) => {
      lastEmittedRef.current = next;
      editedSinceRenderRef.current = true;
      onCodeChange(next);
    };

    const updateCodeWithHistory = (newCode: string, newCursorPos?: number) => {
      emitCode(newCode);
      setSelection(null);
      const cursor = newCursorPos !== undefined ? newCursorPos : cursorPosition;
      setHistory((prev) => {
        const next = [...prev.slice(0, historyIndex + 1), { code: newCode, cursor }];
        return next.slice(-MAX_UNDO_STATES);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_UNDO_STATES - 1));

      if (newCursorPos !== undefined) {
        setCursorPosition(newCursorPos);
      }
    };

    const handleUndo = () => {
      if (historyIndex > 0) {
        soundFX.playClick();
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        const prevEntry = history[nextIdx];
        emitCode(prevEntry.code);
        setCursorPosition(Math.min(prevEntry.cursor, prevEntry.code.length));
      }
    };

    const handleRedo = () => {
      if (historyIndex < history.length - 1) {
        soundFX.playClick();
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        const nextEntry = history[nextIdx];
        emitCode(nextEntry.code);
        setCursorPosition(Math.min(nextEntry.cursor, nextEntry.code.length));
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        expandHelperComment: (key: string) => setExpandedHelpers((prev) => new Set(prev).add(key)),
        resetTo: (newCode: string, cursorPos?: number) => {
          setExpandedHelpers(new Set());
          if (cursorPos !== undefined) {
            updateCodeWithHistory(newCode, cursorPos);
            return;
          }
          const normalized = ensureBlankLinesAfterFirstComment(toEditorIndent(newCode));
          updateCodeWithHistory(ensureBlankLineBeforeFinalBrace(normalized.code), normalized.cursorPosition);
        },
        toggleHorizontalScroll: () => setHorizontalScrollEnabled((prev) => !prev),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [historyIndex]
    );

    // Insert token or text with auto-closing brackets support. If a selection
    // is active, the inserted text replaces it (standard editor behavior).
    const handleInsertToken = (textToInsert: string) => {
      if (!selection && caretOnCollapsedFold) return; // a collapsed hint cannot be typed into
      soundFX.playClick();
      const start = selection ? Math.min(selection.start, selection.end) : cursorPosition;
      const end = selection ? Math.max(selection.start, selection.end) : cursorPosition;

      // Overtype / step-over if next character matches the closing bracket/quote being typed
      if (start === end && CLOSING_CHARS.has(textToInsert) && code[start] === textToInsert) {
        updateCodeWithHistory(code, start + 1);
        return;
      }

      // Auto-dedent when '}' closes a block on an otherwise-blank line
      if (textToInsert === '}' && start === end) {
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const beforeCursorOnLine = code.slice(lineStart, start);
        if (beforeCursorOnLine.length > 0 && /^\s+$/.test(beforeCursorOnLine)) {
          const dedented = dedentLine(beforeCursorOnLine);
          const newCode = code.slice(0, lineStart) + dedented + '}' + code.slice(start);
          updateCodeWithHistory(newCode, lineStart + dedented.length + 1);
          return;
        }
      }

      let insert = textToInsert;
      let cursorOffset = textToInsert.length;

      // Auto-closing brackets/quotes (only for a single-character opener typed with no selection)
      const autoClose = AUTO_PAIR_MAP[textToInsert];
      if (autoClose && start === end && !isInsideStringLiteral(code, start)) {
        insert = textToInsert + autoClose;
        cursorOffset = 1;
      }

      const before = code.slice(0, start);
      const after = code.slice(end);
      const newCode = before + insert + after;
      const newPos = start + cursorOffset;

      updateCodeWithHistory(newCode, newPos);
    };

    // Tapping a keyword/snippet tag (Row 1 of the accessory toolbar --
    // println, val, listOf, a lesson's custom tokens, etc.) while the
    // learner has already hand-typed a leading fragment of that same word
    // (e.g. "pri" or "print" right before the caret, with no selection)
    // replaces the typed fragment with the tapped tag instead of inserting
    // the tag right after it (which would otherwise produce "priprintln").
    // Only a real prefix match triggers the replace; anything else falls
    // back to the normal insert-at-cursor behavior.
    const handleInsertKeywordToken = (tokenText: string) => {
      if (!selection) {
        const before = code.slice(0, cursorPosition);
        const wordMatch = before.match(/[A-Za-z0-9_]+$/);
        const word = wordMatch ? wordMatch[0] : '';
        if (word && tokenText.toLowerCase().startsWith(word.toLowerCase())) {
          soundFX.playClick();
          const wordStart = cursorPosition - word.length;
          const newCode = code.slice(0, wordStart) + tokenText + code.slice(cursorPosition);
          updateCodeWithHistory(newCode, wordStart + tokenText.length);
          return;
        }
      }
      handleInsertToken(tokenText);
    };

    // Smart Backspace: deletes the active selection, or a matching empty
    // bracket pair, or the single preceding character.
    const handleSmartBackspace = () => {
      if (!selection && collapseHelperComments) {
        if (caretOnCollapsedFold) return; // nothing to delete inside a collapsed hint
        // Backspace at the start of the line right below a collapsed hint would glue that line onto the hint's
        // hidden last line; step up onto the hint instead, like moving left across a one-line fold.
        const above = collapsedFolds.find((fold) => lineOffsets[fold.end + 1] === cursorPosition);
        if (above) {
          soundFX.playClick();
          setCursorPosition(lineOffsets[above.start] + above.preview.length);
          return;
        }
      }
      soundFX.playClick();
      suppressAutocompleteRef.current = true;
      const start = selection ? Math.min(selection.start, selection.end) : cursorPosition;
      const end = selection ? Math.max(selection.start, selection.end) : cursorPosition;

      if (start === end && start > 0) {
        const charBefore = code[start - 1];
        const charAfter = code[start];
        const isPair = AUTO_PAIR_MAP[charBefore] === charAfter;

        if (isPair) {
          const before = code.slice(0, start - 1);
          const after = code.slice(start + 1);
          updateCodeWithHistory(before + after, start - 1);
          return;
        }

        const before = code.slice(0, start - 1);
        const after = code.slice(start);
        updateCodeWithHistory(before + after, start - 1);
      } else if (start !== end) {
        const before = code.slice(0, start);
        const after = code.slice(end);
        updateCodeWithHistory(before + after, start);
      }
    };

    // Smart Indentation on Enter / Return. Replaces the active selection (if any).
    const handleSmartReturn = () => {
      if (!selection && caretOnCollapsedFold) return; // a collapsed hint cannot be split
      soundFX.playClick();
      const pos = selection ? Math.min(selection.start, selection.end) : cursorPosition;
      const selEnd = selection ? Math.max(selection.start, selection.end) : cursorPosition;

      const textBefore = code.slice(0, pos);
      const textAfter = code.slice(selEnd);
      const currentLineMatch = textBefore.match(/(?:^|\n)([^\n]*)$/);
      const currentLine = currentLineMatch ? currentLineMatch[1] : '';

      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';

      const trimmedLine = currentLine.trim();
      const endsWithOpenBrace = trimmedLine.endsWith('{');
      const nextCharIsCloseBrace = textAfter.startsWith('}');

      let insert = '\n' + currentIndent;
      let cursorOffset = insert.length;

      if (endsWithOpenBrace) {
        if (nextCharIsCloseBrace) {
          insert = '\n' + currentIndent + EDITOR_INDENT + '\n' + currentIndent;
          cursorOffset = 1 + currentIndent.length + EDITOR_INDENT.length;
        } else {
          insert = '\n' + currentIndent + EDITOR_INDENT;
          cursorOffset = insert.length;
        }
      }

      const newCode = textBefore + insert + textAfter;
      updateCodeWithHistory(newCode, pos + cursorOffset);
      // A new line starts fresh at (or near) column 0 -- show it from the
      // start rather than leaving the view scrolled wherever the previous,
      // possibly long, line had scrolled to.
      if (editorScrollRef.current) {
        editorScrollRef.current.scrollLeft = 0;
      }
    };

    const handleSpace = () => {
      soundFX.playClick();
      handleInsertToken(' ');
    };

    // Calculate lines and active line index
    const lines = code.split('\n');
    const displayLineCount = Math.max(14, lines.length + 1);

    let currentLineIndex = 0;
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (cursorPosition < charCount) {
        currentLineIndex = i;
        break;
      }
      if (i === lines.length - 1) {
        currentLineIndex = i;
      }
    }

    // ---- Helper-comment folds (practice mode): a numbered `//` comment block folds to ONE row, Android Studio style.
    // Hidden lines are not drawn (their gutter numbers are skipped) and the caret steps over them.
    const lineOffsets: number[] = [];
    {
      let runningOffset = 0;
      for (const line of lines) {
        lineOffsets.push(runningOffset);
        runningOffset += line.length + 1;
      }
    }
    const folds = collapseHelperComments ? computeCommentFolds(lines) : [];
    const selectionLow = selection ? Math.min(selection.start, selection.end) : null;
    const selectionHigh = selection ? Math.max(selection.start, selection.end) : null;
    // A fold opens ONLY from a click (marker, "..." pill or the row); the caret and selections never open it.
    const isFoldOpen = (fold: { key: string }) => expandedHelpers.has(fold.key);
    const foldAtLine = new Map(folds.map((fold) => [fold.start, fold]));
    const collapsedFolds = folds.filter((fold) => !isFoldOpen(fold));
    const hiddenLines = new Set<number>();
    for (const fold of collapsedFolds) for (let l = fold.start + 1; l <= fold.end; l++) hiddenLines.add(l);
    // Gutter numbers: one per on-screen row. A wrapped line spans several rows, each numbered; a folded line keeps its
    // own number (hidden), so numbers jump over a collapsed hint like Android Studio, but wrapping never leaves a gap.
    const gutterStart: number[] = [];
    {
      let n = 1;
      lines.forEach((_, i) => {
        gutterStart[i] = n;
        n += hiddenLines.has(i) ? 1 : rowCounts[i] ?? 1;
      });
    }
    const collapsedPreviewLength = (lineIdx: number): number | undefined => {
      const fold = foldAtLine.get(lineIdx);
      return fold && !isFoldOpen(fold) ? fold.preview.length : undefined;
    };

    // The caret never enters hidden text and never opens a fold: if it ends up inside one (Backspace from below,
    // a programmatic move, Undo) it is moved to the visible marker. Directional moves snap themselves (below).
    const collapsedRanges = collapsedFolds.map((fold) => ({ start: fold.start, end: fold.end, previewLength: fold.preview.length }));
    const snapDirectional = (position: number, direction: -1 | 1) => snapCaretOutOfFolds(code, position, collapsedRanges, direction);
    useEffect(() => {
      if (!collapseHelperComments || !collapsedRanges.length) return;
      const snapped = snapCaretOutOfFolds(code, cursorPosition, collapsedRanges, 0);
      if (snapped !== cursorPosition) setCursorPosition(snapped);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursorPosition, code, expandedHelpers]);
    // Typing on a collapsed comment (or in its hidden lines) would silently change text the learner cannot see.
    const caretOnCollapsedFold = collapsedFolds.some((fold) => currentLineIndex >= fold.start && currentLineIndex <= fold.end);

    // Keep the caret visible whenever it moves. `nearest` is a no-op if it's
    // already fully on-screen, and otherwise scrolls exactly enough to
    // reveal it -- for a cursor at the true end of a long line, that lands
    // scrollLeft at the container's max (revealing the whole line's end),
    // while a short line (e.g. a fresh blank line right after Return) is
    // simply left alone instead of being force-scrolled to the document's
    // unrelated global max (handleSmartReturn's explicit scrollLeft reset
    // handles putting a new line's start in view).
    useEffect(() => {
      if (justLoadedCursor.current !== null) {
        // The render before the load settled still has the caret at its old spot; revealing that would scroll the view sideways.
        if (cursorPosition !== justLoadedCursor.current) return;
        justLoadedCursor.current = null;
        if (editorScrollRef.current) editorScrollRef.current.scrollLeft = 0;
      }
      cursorSpanRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [cursorPosition, code]);

    // Cursor movement, shared by the physical-keyboard listener below and
    // the on-screen arrow buttons -- both cross a line boundary instantly on
    // a single step, which is the expected behavior for a discrete key
    // press. The whole-keypad swipe gesture uses its own handler below
    // instead (`handleCursorSwipeHorizontal`), which resists that same
    // crossing briefly so a swipe that merely reaches the start/end of a
    // line doesn't also accidentally hop onto the next one.
    const moveCursorHorizontal = (delta: number) => {
      setSelection(null);
      setCursorPosition((prev) => {
        const next = Math.max(0, Math.min(code.length, prev + delta));
        return collapseHelperComments && delta !== 0 ? snapCaretOutOfFolds(code, next, collapsedRanges, delta > 0 ? 1 : -1) : next;
      });
    };

    // Tracks the cursor position the swipe handler below is building up,
    // kept in sync with real `cursorPosition` state via the effect right
    // after it. A ref (not the `cursorPosition` closure) is needed here
    // because several swipe-move events can fire synchronously within the
    // same tick, before React re-renders -- reading `cursorPosition` in that
    // window would see the same stale value on every call.
    const swipeCursorPosRef = useRef(cursorPosition);
    useEffect(() => {
      swipeCursorPosRef.current = cursorPosition;
    }, [cursorPosition]);

    // A swipe that reaches the very start/end of a line resists immediately
    // crossing into the previous/next line: the learner has to keep
    // swiping past this many extra steps first (see MobileCodingKeyboard's
    // SWIPE_STEP_X_PX for what one "step" is) before the cursor actually
    // hops lines. Without this, the overwhelmingly common case -- a swipe
    // that means to stop right at the start/end of the current line --
    // regularly overshoots onto the adjacent line instead.
    const LINE_CROSS_RESISTANCE_STEPS = 6;
    const lineCrossResistanceRef = useRef<{ direction: -1 | 1; remaining: number } | null>(null);

    const handleCursorSwipeHorizontal = (deltaSteps: number) => {
      if (deltaSteps === 0) return;
      setSelection(null);

      const direction: -1 | 1 = deltaSteps > 0 ? 1 : -1;
      if (lineCrossResistanceRef.current && lineCrossResistanceRef.current.direction !== direction) {
        lineCrossResistanceRef.current = null;
      }

      let pos = swipeCursorPosRef.current;
      let stepsRemaining = Math.abs(deltaSteps);

      while (stepsRemaining > 0) {
        const crossingLeft = direction === -1 && pos > 0 && code[pos - 1] === '\n';
        const crossingRight = direction === 1 && pos < code.length && code[pos] === '\n';

        if (crossingLeft || crossingRight) {
          if (!lineCrossResistanceRef.current) {
            lineCrossResistanceRef.current = { direction, remaining: LINE_CROSS_RESISTANCE_STEPS };
          }
          lineCrossResistanceRef.current.remaining -= 1;
          stepsRemaining -= 1;
          if (lineCrossResistanceRef.current.remaining > 0) continue; // consumed as resistance, no movement yet
          lineCrossResistanceRef.current = null; // resistance exhausted -- cross now
          pos += direction;
          if (collapseHelperComments) pos = snapCaretOutOfFolds(code, pos, collapsedRanges, direction);
          continue;
        }

        lineCrossResistanceRef.current = null;
        pos = Math.max(0, Math.min(code.length, pos + direction));
        if (collapseHelperComments) pos = snapCaretOutOfFolds(code, pos, collapsedRanges, direction);
        stepsRemaining -= 1;
      }

      swipeCursorPosRef.current = pos;
      setCursorPosition(pos);
    };

    // Moves the cursor by `lineDelta` lines, preserving column where possible.
    // Uses the setState-updater form (rather than closing over the render's
    // `cursorPosition`/`currentLineIndex`) so a fast swipe that fires this
    // multiple times in one tick still accumulates correctly instead of every
    // call recomputing from the same stale starting point.
    const moveCursorVerticalBy = (lineDelta: number) => {
      if (lineDelta === 0) return;
      setSelection(null);
      // A collapsed fold counts as one line: its hidden lines are stepped over.
      setCursorPosition((prev) => moveCaretByVisibleLines(code, prev, lineDelta, hiddenLines, collapsedPreviewLength));
    };

    const moveCursorVertical = (direction: -1 | 1) => moveCursorVerticalBy(direction);

    // Desktop physical keyboard listener - allows typing without focusing a native mobile input
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          handleInsertToken(EDITOR_INDENT);
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          onRunRequested?.();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSmartReturn();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          handleSmartBackspace();
        } else if (e.key === 'Delete') {
          e.preventDefault();
          if (cursorPosition < code.length && (selection || !caretOnCollapsedFold)) {
            suppressAutocompleteRef.current = true;
            const before = code.slice(0, cursorPosition);
            const after = code.slice(cursorPosition + 1);
            updateCodeWithHistory(before + after, cursorPosition);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveCursorHorizontal(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveCursorHorizontal(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveCursorVertical(-1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveCursorVertical(1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          let off = 0;
          for (let i = 0; i < currentLineIndex; i++) {
            off += lines[i].length + 1;
          }
          setSelection(null);
          setCursorPosition(off);
        } else if (e.key === 'End') {
          e.preventDefault();
          let off = 0;
          for (let i = 0; i < currentLineIndex; i++) {
            off += lines[i].length + 1;
          }
          setSelection(null);
          setCursorPosition(off + lines[currentLineIndex].length);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleInsertToken(e.key);
        }
      };

      const handleGlobalPaste = (e: ClipboardEvent) => {
        const text = e.clipboardData?.getData('text');
        if (text) {
          e.preventDefault();
          handleInsertToken(text);
        }
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('paste', handleGlobalPaste);
      return () => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
        window.removeEventListener('paste', handleGlobalPaste);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, cursorPosition, historyIndex, lines, currentLineIndex, selection]);

    const getLineStartOffset = (lineIdx: number): number => {
      let offset = 0;
      for (let i = 0; i < lineIdx && i < lines.length; i++) {
        offset += lines[i].length + 1;
      }
      return offset;
    };

    const getLineBounds = (lineIdx: number): { start: number; end: number } => {
      const start = getLineStartOffset(lineIdx);
      const end = start + (lines[lineIdx]?.length ?? 0);
      return { start, end };
    };

    // Which line (index) a given absolute offset into `code` falls on.
    const lineIndexForOffset = (offset: number): number => {
      let idx = 0;
      for (let i = 0; i < lines.length; i++) {
        const { end } = getLineBounds(i);
        idx = i;
        if (offset <= end) break;
      }
      return idx;
    };

    const recomputeHandlePositions = () => {
      if (!selection) {
        setHandlePositions(null);
        return;
      }
      const s = Math.min(selection.start, selection.end);
      const e = Math.max(selection.start, selection.end);
      const startLineIdx = lineIndexForOffset(s);
      const endLineIdx = lineIndexForOffset(e);
      const startEl = lineElsRef.current.get(startLineIdx);
      const endEl = lineElsRef.current.get(endLineIdx);
      if (!startEl || !endEl) {
        setHandlePositions(null);
        return;
      }
      const startPoint = pointFromOffset(startEl, s - getLineStartOffset(startLineIdx));
      const endPoint = pointFromOffset(endEl, e - getLineStartOffset(endLineIdx));
      if (!startPoint || !endPoint) {
        setHandlePositions(null);
        return;
      }
      setHandlePositions({ start: startPoint, end: endPoint });
    };

    // Recompute whenever the selection itself changes, or the surrounding
    // text reflows (an edit, or toggling wrap/horizontal-scroll mode) -- and
    // again on scroll, since getBoundingClientRect/getClientRects are always
    // viewport-relative, not relative to the scrollable editor surface.
    useEffect(() => {
      recomputeHandlePositions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection, code, horizontalScrollEnabled]);

    useEffect(() => {
      const scrollEl = editorScrollRef.current;
      if (!scrollEl || !selection) return;
      const onScroll = () => recomputeHandlePositions();
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      return () => scrollEl.removeEventListener('scroll', onScroll);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection]);

    // ================= Identifier Autocomplete =================
    // Lightweight word-completion for identifiers the learner has already
    // used/declared elsewhere in THIS SAME program -- e.g. typing "rec"
    // (or "recipient") when a `val recipient = ...` already exists
    // somewhere in the code shows "recipient" as a pickable suggestion.
    // This is plain text matching over the whole source, not real
    // scope/symbol-table resolution -- it doesn't know whether a matching
    // name is actually in scope at the cursor, only that it appears
    // somewhere in the file. That's an acceptable, deliberate limit for a
    // teaching editor: it still catches the overwhelmingly common case
    // (re-typing a variable/function name you already declared) without
    // needing a real Kotlin type/scope checker.
    const AUTOCOMPLETE_MIN_PREFIX = 2;
    const AUTOCOMPLETE_MAX_SUGGESTIONS = 6;

    const [autocomplete, setAutocomplete] = useState<{
      wordStart: number;
      suggestions: { text: string; kind: 'variable' | 'keyword' }[];
      pos: { x: number; y: number; height: number };
    } | null>(null);

    // A deletion (Backspace/Delete, or the long-press menu's Delete Line)
    // sets this right before its own `updateCodeWithHistory` call. Suggesting
    // completions right after the learner just removed characters reads as
    // the editor fighting the deletion, so that one resulting code/cursor
    // change is skipped, then the flag clears itself -- normal typing right
    // after still shows suggestions as usual.
    const suppressAutocompleteRef = useRef(false);

    const recomputeAutocomplete = () => {
      if (suppressAutocompleteRef.current) {
        suppressAutocompleteRef.current = false;
        setAutocomplete(null);
        return;
      }
      if (selection) {
        setAutocomplete(null);
        return;
      }
      const before = code.slice(0, cursorPosition);
      const wordMatch = before.match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
      let word = wordMatch ? wordMatch[0] : '';

      // A bare `$name` string-template reference (as opposed to `${name}`,
      // where the `{` already stops the match above from including it) is
      // typed with a leading `$` that the word-match regex above still
      // treats as part of the identifier run. Strip it before matching --
      // a real declared variable is never actually named "$name", so
      // leaving the `$` in would silently exclude every real match. Only
      // real identifiers are offered here (never a keyword/builtin like
      // `val`/`println`), since `$val` is never valid inside a template.
      const isTemplateReference = word.startsWith('$');
      if (isTemplateReference) word = word.slice(1);

      if (word.length < AUTOCOMPLETE_MIN_PREFIX) {
        setAutocomplete(null);
        return;
      }

      const wordLower = word.toLowerCase();
      const seen = new Set<string>();
      const suggestions: { text: string; kind: 'variable' | 'keyword' }[] = [];

      // Priority 1: identifiers the learner has already used/declared in
      // THIS program (variables, function names, ...) -- reusing a name you
      // already typed is by far the more common reason to autocomplete in a
      // short lesson program, so these always rank above keyword suggestions.
      const allIdentifiers = code.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) ?? [];
      for (const ident of allIdentifiers) {
        if (suggestions.length >= AUTOCOMPLETE_MAX_SUGGESTIONS) break;
        if (ident.length <= word.length) continue; // nothing left to complete
        if (KEYWORDS.has(ident)) continue; // don't suggest bare language keywords
        if (seen.has(ident)) continue;
        if (!ident.toLowerCase().startsWith(wordLower)) continue;
        seen.add(ident);
        suggestions.push({ text: ident, kind: 'variable' });
      }

      // Priority 2: fill any remaining slots with commonly used Kotlin
      // keywords/builtins matching the same prefix (println, val, listOf, ...)
      // -- skipped entirely inside a `$name` template reference, since a
      // keyword/builtin can never be substituted there.
      for (const kw of isTemplateReference ? [] : COMMON_COMPLETION_WORDS) {
        if (suggestions.length >= AUTOCOMPLETE_MAX_SUGGESTIONS) break;
        if (kw.length <= word.length) continue;
        if (seen.has(kw)) continue;
        if (!kw.toLowerCase().startsWith(wordLower)) continue;
        seen.add(kw);
        suggestions.push({ text: kw, kind: 'keyword' });
      }

      if (suggestions.length === 0) {
        setAutocomplete(null);
        return;
      }

      const lineIdx = lineIndexForOffset(cursorPosition);
      const lineEl = lineElsRef.current.get(lineIdx);
      const point = lineEl ? pointFromOffset(lineEl, cursorPosition - getLineStartOffset(lineIdx)) : null;
      if (!point) {
        setAutocomplete(null);
        return;
      }

      setAutocomplete({ wordStart: cursorPosition - word.length, suggestions, pos: point });
    };

    // Suggestions appear only right after the learner TYPED (an edit went through emitCode). Merely moving the caret,
    // tapping a line, selecting, or loading a document never opens them, and closes any that are showing.
    useEffect(() => {
      if (editedSinceRenderRef.current) {
        editedSinceRenderRef.current = false;
        recomputeAutocomplete();
      } else {
        setAutocomplete(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, cursorPosition, selection]);

    useEffect(() => {
      const scrollEl = editorScrollRef.current;
      if (!scrollEl || !autocomplete) return;
      const onScroll = () => recomputeAutocomplete();
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      return () => scrollEl.removeEventListener('scroll', onScroll);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autocomplete !== null]);

    // Replaces the typed prefix (`autocomplete.wordStart` .. `cursorPosition`)
    // with the picked suggestion, the same replace-not-append behavior as
    // tapping a keyword tag over a hand-typed prefix (see
    // `handleInsertKeywordToken`).
    const applyAutocompleteSuggestion = (suggestion: string) => {
      if (!autocomplete) return;
      soundFX.playClick();
      const { wordStart } = autocomplete;
      const newCode = code.slice(0, wordStart) + suggestion + code.slice(cursorPosition);
      updateCodeWithHistory(newCode, wordStart + suggestion.length);
      setAutocomplete(null);
    };

    // Dragging a selection handle: hit-test whatever line element is under
    // the current pointer position (via elementFromPoint, since the pointer
    // has left the handle's own small hit area) and move just the dragged
    // end of the selection there, leaving the other end fixed. Mirrors how
    // native text selection lets one handle move independently of the other.
    useEffect(() => {
      if (!draggingHandle) return;

      const findLineElAndIdx = (clientX: number, clientY: number): [HTMLDivElement, number] | null => {
        let el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
        while (el) {
          const idxAttr = el.getAttribute?.('data-line-idx');
          if (idxAttr !== null && idxAttr !== undefined) {
            return [el as HTMLDivElement, Number(idxAttr)];
          }
          el = el.parentElement;
        }
        return null;
      };

      const onMove = (e: PointerEvent) => {
        e.preventDefault();
        const hit = findLineElAndIdx(e.clientX, e.clientY);
        if (!hit) return;
        const [lineEl, lineIdx] = hit;
        const lineStr = lines[lineIdx] ?? '';
        const col = columnFromPoint(lineEl, lineStr, e.clientX, e.clientY);
        const newOffset = Math.min(code.length, getLineStartOffset(lineIdx) + col);
        setSelection((prev) => {
          if (!prev) return prev;
          return draggingHandle === 'start' ? { ...prev, start: newOffset } : { ...prev, end: newOffset };
        });
      };
      const onUp = () => setDraggingHandle(null);

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draggingHandle, lines, code]);

    // Tap directly on a line to move the cursor to the tapped character
    // column (not just the end of the line), without opening the device keyboard.
    // Uses real DOM hit-testing (columnFromPoint) rather than assumed
    // character-width math, so it stays correct whether the line renders as
    // a single row (horizontal-scroll mode) or wraps across several visual
    // rows (default mode).
    const handleLineClick = (lineIdx: number, e?: React.MouseEvent<HTMLElement>) => {
      if (e) e.stopPropagation();
      if (justLongPressedRef.current) {
        justLongPressedRef.current = false;
        return;
      }
      setSelection(null);
      setLongPressMenu(null);

      const offset = getLineStartOffset(lineIdx);
      const targetLine = lines[lineIdx] ?? '';
      let col = targetLine.length;
      if (e) {
        col = columnFromPoint(e.currentTarget, targetLine, e.clientX, e.clientY);
      }
      const newPos = Math.min(offset + col, code.length);
      // Tapping an empty line inside a block lands the caret at the block's indent (see snapEmptyLineIndent).
      if (targetLine === '') {
        const snapped = snapEmptyLineIndent(code, newPos);
        if (snapped.code !== code) {
          updateCodeWithHistory(snapped.code, snapped.cursorPosition);
          return;
        }
      }
      setCursorPosition(newPos);
    };

    // Tap empty canvas below code to position cursor at end of code
    const handleCanvasClick = () => {
      setSelection(null);
      setLongPressMenu(null);
      setCursorPosition(code.length);
    };

    const clearLongPressTimer = () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    // Long-press (touch/pointer hold) on a line: select the word under the
    // touch point and open a contextual action menu near it.
    const triggerLongPress = (lineIdx: number, clientX: number, clientY: number, el: HTMLElement) => {
      const targetLine = lines[lineIdx] ?? '';
      const offset = getLineStartOffset(lineIdx);
      const col = columnFromPoint(el, targetLine, clientX, clientY);
      const { start, end } = getWordRangeAt(targetLine, col);

      soundFX.playClick();
      justLongPressedRef.current = true;
      setSelection(start === end ? null : { start: offset + start, end: offset + end });
      setCursorPosition(offset + end);
      setLongPressMenu({ x: clientX, y: clientY, lineIdx });
    };

    const handleLinePointerDown = (lineIdx: number, e: React.PointerEvent<HTMLDivElement>) => {
      longPressStartRef.current = { x: e.clientX, y: e.clientY };
      clearLongPressTimer();
      const target = e.currentTarget;
      const clientX = e.clientX;
      const clientY = e.clientY;
      longPressTimerRef.current = window.setTimeout(() => {
        triggerLongPress(lineIdx, clientX, clientY, target);
      }, LONG_PRESS_MS);
    };

    const handleLinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const start = longPressStartRef.current;
      if (!start) return;
      if (Math.abs(e.clientX - start.x) > LONG_PRESS_MOVE_THRESHOLD_PX || Math.abs(e.clientY - start.y) > LONG_PRESS_MOVE_THRESHOLD_PX) {
        clearLongPressTimer();
      }
    };

    const handleLinePointerUp = () => {
      clearLongPressTimer();
      longPressStartRef.current = null;
    };

    const closeLongPressMenu = () => setLongPressMenu(null);

    const getSelectedText = (): string => {
      if (!selection) return '';
      const s = Math.min(selection.start, selection.end);
      const e = Math.max(selection.start, selection.end);
      return code.slice(s, e);
    };

    const handleCopySelection = async () => {
      soundFX.playClick();
      const text = getSelectedText();
      if (text) {
        try {
          await Clipboard.write({ string: text });
          showClipboardNotice('Copied');
        } catch {
          soundFX.playError();
          showClipboardNotice('Copy failed');
        }
      }
      setSelection(null);
      closeLongPressMenu();
    };

    const handleCutSelection = async () => {
      soundFX.playClick();
      const text = getSelectedText();
      if (text && selection) {
        let copyFailed = false;
        try {
          await Clipboard.write({ string: text });
        } catch {
          soundFX.playError();
          copyFailed = true;
          // Still remove the selected text below even if the copy failed --
          // the user asked to cut, and losing the clipboard write shouldn't
          // also block the edit itself.
        }
        showClipboardNotice(copyFailed ? 'Cut (clipboard copy failed)' : 'Cut');
        const s = Math.min(selection.start, selection.end);
        const e = Math.max(selection.start, selection.end);
        updateCodeWithHistory(code.slice(0, s) + code.slice(e), s);
      }
      closeLongPressMenu();
    };

    const handlePasteFromClipboard = async () => {
      if (!selection && caretOnCollapsedFold) return;
      soundFX.playClick();
      try {
        const { value } = await Clipboard.read();
        if (value) {
          handleInsertToken(value);
        } else {
          soundFX.playError();
          showClipboardNotice('Clipboard is empty');
        }
      } catch {
        soundFX.playError();
        showClipboardNotice('Paste failed');
      }
      closeLongPressMenu();
    };

    const handleSelectAll = () => {
      soundFX.playClick();
      setSelection({ start: 0, end: code.length });
      setCursorPosition(code.length);
    };

    const handleDuplicateLine = (lineIdx: number) => {
      soundFX.playClick();
      const { start, end } = getLineBounds(lineIdx);
      const lineText = code.slice(start, end);
      const hasTrailingNewline = end < code.length;
      const insertion = hasTrailingNewline ? lineText + '\n' : '\n' + lineText;
      const insertAt = hasTrailingNewline ? end + 1 : end;
      const newCode = code.slice(0, insertAt) + insertion + code.slice(insertAt);
      // Insertion happens entirely after the current line, so the absolute
      // cursor offset within/before this line is still valid unchanged.
      updateCodeWithHistory(newCode, cursorPosition);
      closeLongPressMenu();
    };

    const handleDeleteLine = (lineIdx: number) => {
      soundFX.playClick();
      suppressAutocompleteRef.current = true;
      if (lines.length <= 1) {
        // Only one line exists — clear it but keep a single, valid empty line.
        updateCodeWithHistory('', 0);
        closeLongPressMenu();
        return;
      }
      const { start, end } = getLineBounds(lineIdx);
      let delStart = start;
      let delEnd = end;
      if (end < code.length) {
        delEnd = end + 1; // also consume this line's own trailing newline
      } else if (start > 0) {
        delStart = start - 1; // last line: consume the preceding newline instead
      }
      const newCode = code.slice(0, delStart) + code.slice(delEnd);
      updateCodeWithHistory(newCode, Math.min(delStart, newCode.length));
      closeLongPressMenu();
    };

    // The menu follows the live selection (so dragging a handle keeps it
    // correctly anchored) when one exists and has been measured; otherwise it
    // falls back to wherever the long-press itself landed (e.g. no word was
    // under the touch, so there's no selection to anchor to, but Paste/
    // Duplicate/Delete Line should still open right where the finger was).
    const menuAnchor =
      selection && handlePositions
        ? {
            x: (handlePositions.start.x + handlePositions.end.x) / 2,
            y: Math.min(handlePositions.start.y, handlePositions.end.y),
          }
        : longPressMenu
        ? { x: longPressMenu.x, y: longPressMenu.y }
        : null;

    // Prefer opening above the selection (matches native pickers), but a
    // short file's first couple of lines leave no room above -- in that case
    // drop the menu BELOW the selection/handles instead of clamping it to
    // the top of the screen, where it would otherwise sit directly on top of
    // (and hide) the very selection/handles it's meant to act on. Both
    // directions leave the same MENU_GAP of breathing room -- previously only
    // the "below" branch did, so "above" (the common case, most selections
    // have room above them) always sat flush against the selection with zero
    // gap.
    //
    // HANDLE_VISIBLE_EXTENT must match the handles' own rendered height below
    // (`height: handlePositions.*.height + 20`) -- the circular knob extends
    // well past the character's own height, so anchoring only to the
    // character's bottom edge (no +20) left the menu overlapping the knob.
    const HANDLE_VISIBLE_EXTENT = 20;
    const MENU_GAP = 20;
    const menuBottomAnchor =
      selection && handlePositions
        ? Math.max(
            handlePositions.start.y + handlePositions.start.height + HANDLE_VISIBLE_EXTENT,
            handlePositions.end.y + handlePositions.end.height + HANDLE_VISIBLE_EXTENT
          )
        : menuAnchor
        ? menuAnchor.y + 24
        : 0;
    const menuTop = menuAnchor
      ? menuAnchor.y - menuHeight - MENU_GAP >= MENU_GAP
        ? menuAnchor.y - menuHeight - MENU_GAP
        : menuBottomAnchor + MENU_GAP
      : 0;

    // Measure the menu's real height once it's rendered (its default 220px
    // guess above is only a first-paint placeholder) so menuTop's above/below
    // decision matches the ACTUAL element, not an estimate that varies by
    // theme and by how many action rows show. Runs whenever the menu opens or
    // its anchor moves (e.g. a handle got dragged onto a different line).
    useEffect(() => {
      if (!menuRef.current) return;
      const measured = menuRef.current.offsetHeight;
      if (measured > 0 && measured !== menuHeight) setMenuHeight(measured);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [longPressMenu, menuAnchor?.x, menuAnchor?.y, draggingHandle]);

    return (
      <div className={`flex-1 flex flex-col min-h-0 relative overflow-hidden ${className}`} data-purpose="kotlin-code-editor">
        {floatingAction && <div className="absolute top-2 right-2 z-20">{floatingAction}</div>}
        {/* ================= BEGIN: Code Editor Surface ================= */}
        <div
          ref={editorScrollRef}
          onClick={handleCanvasClick}
          // scroll-padding gives scrollIntoView({inline:'nearest'}) room to stop
          // short of the true edge -- e.g. after a Backspace merges the cursor
          // onto the end of a long previous line, the view now scrolls to
          // reveal that spot PLUS this much breathing room to its right,
          // like a person would naturally scroll, instead of stopping the
          // instant the cursor is barely visible flush against the edge.
          style={{ scrollPaddingLeft: 24, scrollPaddingRight: 96, scrollPaddingTop: 24, scrollPaddingBottom: 24 }}
          className={`flex-1 overflow-y-auto ${
            horizontalScrollEnabled ? 'overflow-x-auto' : 'overflow-x-hidden'
          } overscroll-contain relative font-mono text-[13.5px] leading-[24px] cursor-text ${
            isDark ? 'bg-[#0b0f19]' : 'bg-white'
          }`}
        >
          {/* Each logical line is one row: [gutter cell][code cell] together,
              so the gutter number naturally stays aligned with its line even
              when that line wraps across multiple visual rows (default mode). */}
          <div className={`relative flex flex-col min-h-full ${horizontalScrollEnabled ? 'min-w-max' : ''}`}>
            {/* Read-only sync textarea with inputMode="none" ensuring native device keyboard is NEVER triggered.
                Sized to this wrapper (which grows with all the lines) rather than the outer
                scrollable viewport, so it covers the full document, not just what's on-screen. */}
            <textarea
              ref={textareaRef}
              wrap="off"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              readOnly
              inputMode="none"
              tabIndex={-1}
              aria-hidden="true"
              value={code}
              className="absolute inset-0 opacity-0 w-full h-full resize-none p-0 pointer-events-none font-mono text-[13.5px] leading-[24px] -z-10 select-none"
            />
            {lines.map((lineStr, lineIdx) => {
              // Lines swallowed by a collapsed fold are not drawn; their gutter numbers are skipped.
              if (hiddenLines.has(lineIdx)) return null;
              const isActive = lineIdx === currentLineIndex;

              let lineStartOffset = 0;
              for (let i = 0; i < lineIdx; i++) {
                lineStartOffset += lines[i].length + 1;
              }
              const colInLine = Math.max(0, Math.min(lineStr.length, cursorPosition - lineStartOffset));

              const selStart = selection ? Math.min(selection.start, selection.end) : null;
              const selEnd = selection ? Math.max(selection.start, selection.end) : null;
              const hasSelectionOnLine =
                selStart !== null && selEnd !== null && selEnd > lineStartOffset && selStart < lineStartOffset + lineStr.length;

              // A fold's first row is either collapsed (just the marker + "...") or open (the real lines).
              const fold = foldAtLine.get(lineIdx) ?? null;
              const isHelperExpanded = fold !== null && isFoldOpen(fold);
              const isHelperCollapsed = fold !== null && !isHelperExpanded;
              const isCommentRow = lineStr.trimStart().startsWith('//');
              // The fold this row's gutter toggles: its own (first row) or the open fold it sits inside.
              const gutterFold = fold ?? folds.find((f) => isFoldOpen(f) && lineIdx >= f.start && lineIdx <= f.end) ?? null;
              // What a collapsed hint shows (`// TODO 1.`); the word TODO is display-only.
              const foldDisplay = fold ? foldPreviewDisplay(fold.preview) : { text: '', column: (c: number) => c };

              return (
                <div key={lineIdx} className="flex items-stretch">
                  {/* ONE gutter area: line number + fold marker + the space between. Clicking anywhere in it toggles the
                      fold the row belongs to (its first row, or any row inside an open fold); otherwise it selects the line. */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gutterFold) {
                        soundFX.playClick();
                        toggleHelper(gutterFold.key);
                        return;
                      }
                      handleLineClick(lineIdx);
                    }}
                    className={`sticky left-0 z-10 flex shrink-0 select-none cursor-pointer ${
                      isDark ? 'bg-[#090d15]/90' : 'bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-[22px] shrink-0 text-center text-[10px] leading-[24px] font-mono tracking-tighter ${collapseHelperComments ? '' : 'border-r'} transition-colors ${
                        isDark ? 'border-ide-border' : 'border-slate-300'
                      } ${
                        isActive
                          ? 'text-indigo-400 font-bold'
                          : isDark
                          ? 'text-slate-600 hover:text-slate-400'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {Array.from({ length: isHelperCollapsed ? 1 : rowCounts[lineIdx] ?? 1 }).map((_, r) => (
                        <div key={r} className="h-[24px]">
                          {gutterStart[lineIdx] + r}
                        </div>
                      ))}
                    </span>
                    {collapseHelperComments && (
                      <span className={`w-[16px] shrink-0 flex items-start justify-center border-r ${isDark ? 'border-ide-border' : 'border-slate-300'}`}>
                        {fold && (
                          <span className="h-[24px] flex items-center">
                            <span
                              role="button"
                              aria-expanded={isHelperExpanded}
                              aria-label={isHelperExpanded ? 'Collapse hint comment' : 'Expand hint comment'}
                              className={`w-[11px] h-[11px] rounded-[2px] border flex items-center justify-center text-[10px] leading-none font-mono ${
                                isDark ? 'border-slate-500 text-slate-400' : 'border-slate-400 text-slate-500'
                              }`}
                            >
                              {isHelperExpanded ? '\u2212' : '+'}
                            </span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div
                    ref={(el) => {
                      if (el) lineElsRef.current.set(lineIdx, el);
                      else lineElsRef.current.delete(lineIdx);
                    }}
                    data-line-idx={lineIdx}
                    onClick={(e) => {
                      // A collapsed helper comment opens on tap instead of moving the caret onto it.
                      if (isHelperCollapsed && fold) {
                        e.stopPropagation();
                        soundFX.playClick();
                        toggleHelper(fold.key);
                        return;
                      }
                      handleLineClick(lineIdx, e);
                    }}
                    onPointerDown={(e) => {
                      if (isHelperCollapsed) return; // a collapsed row is tapped, not long-press-selected
                      handleLinePointerDown(lineIdx, e);
                    }}
                    onPointerMove={handleLinePointerMove}
                    onPointerUp={handleLinePointerUp}
                    onPointerCancel={handleLinePointerUp}
                    style={
                      horizontalScrollEnabled && isCommentRow && viewportWidth > 0
                        ? { maxWidth: Math.max(160, viewportWidth - (collapseHelperComments ? 38 : 22)) }
                        : undefined
                    }
                    className={`flex-1 py-0 pl-1.5 pr-8 leading-[24px] transition-colors relative cursor-pointer font-mono ${
                      fold ? 'overflow-hidden' : ''
                    } ${
                      horizontalScrollEnabled && !isCommentRow ? 'whitespace-pre' : 'whitespace-pre-wrap break-words min-w-0'
                    } ${
                      isActive ? (isDark ? 'bg-[#13192c]' : 'bg-indigo-50') : isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100'
                    }`}
                  >
                    {isHelperCollapsed && fold ? (
                      <span className="animate-fadeIn">
                        {isActive ? (
                          (() => {
                            const [before, after] = renderHighlightedLineSegments(foldDisplay.text, [foldDisplay.column(Math.min(colInLine, fold.preview.length))], `line-${lineIdx}`, isDark);
                            return (
                              <>
                                {before}
                                <span
                                  ref={cursorSpanRef}
                                  className="inline-block w-[2px] h-[17px] bg-indigo-400 align-middle blinking-cursor shadow-[0_0_8px_rgba(129,140,248,0.9)] mx-[0.5px]"
                                />
                                {after}
                              </>
                            );
                          })()
                        ) : (
                          renderHighlightedLine(foldDisplay.text, `line-${lineIdx}`, isDark)
                        )}
                        <button
                          type="button"
                          aria-expanded={false}
                          aria-label="Expand hint comment"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFX.playClick();
                            toggleHelper(fold.key);
                          }}
                          className={`ml-1.5 px-1.5 rounded-[4px] text-[12px] leading-[18px] align-baseline cursor-pointer select-none ${
                            isDark
                              ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/60 hover:text-slate-200'
                              : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700'
                          }`}
                        >
                          ...
                        </button>
                      </span>
                    ) : hasSelectionOnLine ? (
                      (() => {
                        const selStartCol = Math.max(0, selStart! - lineStartOffset);
                        const selEndCol = Math.min(lineStr.length, selEnd! - lineStartOffset);
                        const [before, within, after] = renderHighlightedLineSegments(
                          lineStr,
                          [selStartCol, selEndCol],
                          `line-${lineIdx}`,
                          isDark
                        );
                        return (
                          <>
                            {before}
                            <span className="bg-indigo-500/40 rounded-[2px]">{within}</span>
                            {after}
                          </>
                        );
                      })()
                    ) : isActive ? (
                      (() => {
                        const [before, after] = renderHighlightedLineSegments(lineStr, [colInLine], `line-${lineIdx}`, isDark);
                        return (
                          <>
                            {before}
                            <span
                              ref={cursorSpanRef}
                              className="inline-block w-[2px] h-[17px] bg-indigo-400 align-middle blinking-cursor shadow-[0_0_8px_rgba(129,140,248,0.9)] mx-[0.5px]"
                            />
                            {after}
                          </>
                        );
                      })()
                    ) : (
                      renderHighlightedLine(lineStr || ' ', `line-${lineIdx}`, isDark)
                    )}
                  </div>
                </div>
              );
            })}

            {/* Filler rows below the real content, purely decorative so a
                short file doesn't look cramped. They carry NO line number, so the
                gutter never shows a line the program does not have. */}
            {Array.from({ length: Math.max(0, displayLineCount - lines.length) }).map((_, i) => (
              <div key={`filler-${i}`} className="flex items-stretch h-[24px] shrink-0">
                <span
                  className={`sticky left-0 z-10 ${collapseHelperComments ? 'w-[38px]' : 'w-[22px]'} shrink-0 text-center text-[10px] font-mono tracking-tighter border-r ${
                    isDark ? 'text-slate-600 bg-[#090d15]/90 border-ide-border' : 'text-slate-400 bg-slate-100 border-slate-300'
                  }`}
                >
                  {/* decorative padding only: never numbered, so it cannot be mistaken for a real line */}
                </span>
                <div className="flex-1" />
              </div>
            ))}
            {/* Takes up whatever height is left so the gutter runs all the way down to the output window / keyboard. */}
            <div className="flex items-stretch flex-1 min-h-0">
              <span
                className={`sticky left-0 z-10 ${collapseHelperComments ? 'w-[38px]' : 'w-[22px]'} shrink-0 border-r ${
                  isDark ? 'bg-[#090d15]/90 border-ide-border' : 'bg-slate-100 border-slate-300'
                }`}
              />
              <div className="flex-1" />
            </div>
          </div>
        </div>
        {/* ================= END: Code Editor Surface ================= */}

        {/* ================= BEGIN: Native-style Selection Drag Handles ================= */}
        {selection && handlePositions && (
          <>
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                soundFX.playClick();
                setDraggingHandle('start');
              }}
              className="fixed z-50 touch-none"
              style={{
                left: handlePositions.start.x - 10,
                top: handlePositions.start.y,
                width: 20,
                height: handlePositions.start.height + 20,
              }}
            >
              <div className="w-[2px] mx-auto bg-indigo-500" style={{ height: handlePositions.start.height }} />
              <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg mx-auto -mt-0.5" />
            </div>
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                soundFX.playClick();
                setDraggingHandle('end');
              }}
              className="fixed z-50 touch-none"
              style={{
                left: handlePositions.end.x - 10,
                top: handlePositions.end.y,
                width: 20,
                height: handlePositions.end.height + 20,
              }}
            >
              <div className="w-[2px] mx-auto bg-indigo-500" style={{ height: handlePositions.end.height }} />
              <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-lg mx-auto -mt-0.5" />
            </div>
          </>
        )}
        {/* ================= END: Native-style Selection Drag Handles ================= */}

        {/* ================= BEGIN: Clipboard Action Feedback ================= */}
        {clipboardNotice && (
          <div
            className={`fixed z-[60] left-1/2 -translate-x-1/2 top-4 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg animate-fadeIn ${
              isDark ? 'bg-[#141926] border border-slate-700/80 text-slate-200' : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {clipboardNotice}
          </div>
        )}
        {/* ================= END: Clipboard Action Feedback ================= */}

        {/* ================= BEGIN: Long-Press Contextual Action Menu ================= */}
        {longPressMenu && menuAnchor && !draggingHandle && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLongPressMenu(null)} />
            <div
              ref={menuRef}
              className={`fixed z-50 w-44 rounded-xl border shadow-2xl p-1.5 text-xs animate-fadeIn ${
                isDark ? 'bg-[#141926] border-slate-700/80' : 'bg-white border-slate-300'
              }`}
              style={{
                left: Math.min(Math.max(8, menuAnchor.x - 88), window.innerWidth - 184),
                top: Math.max(8, menuTop),
              }}
            >
              <button
                type="button"
                onClick={handleSelectAll}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={handleCopySelection}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={handleCutSelection}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Cut</span>
              </button>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Paste</span>
              </button>
              <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <button
                type="button"
                onClick={() => handleDuplicateLine(longPressMenu.lineIdx)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-indigo-300 flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100 text-indigo-600'
                }`}
              >
                <span>Duplicate Line</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLine(longPressMenu.lineIdx)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-rose-300 flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50 text-rose-600'
                }`}
              >
                <span>Delete Line</span>
              </button>
            </div>
          </>
        )}
        {/* ================= END: Long-Press Contextual Action Menu ================= */}

        {/* ================= BEGIN: Identifier Autocomplete Suggestions ================= */}
        {autocomplete && (
          <div
            className={`fixed z-50 flex items-center gap-1 max-w-[90vw] overflow-x-auto scrollbar-none rounded-lg border shadow-xl px-1 py-1 animate-fadeIn ${
              isDark ? 'bg-[#141926] border-slate-700/80' : 'bg-white border-slate-300'
            }`}
            style={{
              left: Math.min(Math.max(8, autocomplete.pos.x), window.innerWidth - 8),
              top: autocomplete.pos.y + autocomplete.pos.height + 4,
            }}
          >
            {autocomplete.suggestions.map((suggestion) => (
              <button
                key={suggestion.text}
                type="button"
                onClick={() => applyAutocompleteSuggestion(suggestion.text)}
                className={`font-mono text-[12px] px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                  suggestion.kind === 'variable'
                    ? isDark
                      ? 'text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/50 font-semibold'
                      : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        )}
        {/* ================= END: Identifier Autocomplete Suggestions ================= */}

        {outputPanel}

        {/* ================= BEGIN: Sticky Bottom Keyboard & Accessories ================= */}
        <div
          className={`sticky bottom-0 z-30 w-full shrink-0 mt-auto pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_8px_rgba(0,0,0,0.15)] border-t ${
            isDark ? 'bg-[#121622] border-slate-800/80' : 'bg-[#e8eaf0] border-slate-300'
          }`}
          data-purpose="sticky-bottom-keyboard-panel"
        >
          <CodingAccessoryToolbar
            onInsertToken={handleInsertKeywordToken}
            onInsertSymbol={handleInsertToken}
            customTokens={customTokens}
            prioritySymbols={prioritySymbols}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            isDark={isDark}
          />

          {showVirtualKeyboard && (
            <MobileCodingKeyboard
              onInsertChar={handleInsertToken}
              onBackspace={handleSmartBackspace}
              onReturn={handleSmartReturn}
              onSpace={handleSpace}
              onCursorSwipeHorizontal={handleCursorSwipeHorizontal}
              onCursorSwipeVertical={moveCursorVerticalBy}
              isDark={isDark}
            />
          )}
        </div>
        {/* ================= END: Sticky Bottom Keyboard & Accessories ================= */}
      </div>
    );
  }
);

KotlinCodeEditor.displayName = 'KotlinCodeEditor';
