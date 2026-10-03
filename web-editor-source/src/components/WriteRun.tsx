import React, { useRef, useState, useEffect } from 'react';
import { Stage4WriteRunData } from '../data/lessonStagesData';
import { soundFX } from '../utils/audio';
import { StorageManager } from '../utils/storage';
import { deriveTaskSymbols } from '../utils/editorLogic';
import { runKotlinCode, KotlinExecutionResult } from '../utils/kotlinRunner';
import { applySolutionPreservingComments } from '../utils/applySolution';
import { renderVisibleWhitespace, renderTaskText, stripTaskMarkup } from '../utils/outputDisplay';
import { KotlinCodeEditor, KotlinCodeEditorHandle } from './ide/KotlinCodeEditor';
import { renderKotlinCodeLines } from '../utils/codeHighlighter';
import { useLongPress } from '../utils/useLongPress';

// The starter declarations a task is "given": everything inside main() before
// the first numbered step comment. Empty when the task is a function stub or
// starts with no declarations, in which case the Given box is hidden.
export const extractGivenLines = (initialCode: string): string[] => {
  const lines = (initialCode || '').replace(/\r\n/g, '\n').split('\n');
  if (lines.some((l) => /^\s*fun\s+(?!main\b)/.test(l))) return [];
  const mainIdx = lines.findIndex((l) => /^\s*fun\s+main\s*\(/.test(l));
  const body = lines.slice(mainIdx + 1);
  const stepIdx = body.findIndex((l) => /^\s*\/\/\s*\d+\./.test(l));
  const given = (stepIdx === -1 ? [] : body.slice(0, stepIdx)).filter((l) => l.trim() !== '' && !/^\s*\/\//.test(l));
  const indent = Math.min(...given.map((l) => l.match(/^\s*/)![0].length), Infinity);
  return Number.isFinite(indent) ? given.map((l) => l.slice(indent)) : [];
};

// The task details should appear shortly after the stage has rendered.
const TEMP_SKIP_PREP_DIALOG = true;

interface WriteRunStageProps {
  data: Stage4WriteRunData;
  topicTitle?: string;
  isDark: boolean;
  revealStep?: number;
  setRevealStep?: React.Dispatch<React.SetStateAction<number>>;
  userCode: string;
  setUserCode: (code: string) => void;
  hasRunCode: boolean;
  setHasRunCode: (hasRun: boolean) => void;
  actualOutput: string;
  setActualOutput?: (output: string) => void;
  onRunCode?: () => void;
  onContinue: () => void;
  onBack?: () => void;
  nextStageLabel?: string;
  onProblemPassed?: () => void;
  isPracticeMode?: boolean;
  isRandomPractice?: boolean;
  practicePosition?: { current: number; total: number };
  onPracticeNextTask?: () => void;
  onPracticeGoBack?: () => void;
}

export const WriteRun: React.FC<WriteRunStageProps> = ({
  data,
  topicTitle = 'Kotlin Basics',
  isDark,
  userCode,
  setUserCode,
  setHasRunCode,
  setActualOutput,
  onRunCode,
  onContinue,
  onBack,
  nextStageLabel,
  onProblemPassed,
  isPracticeMode = false,
  isRandomPractice = false,
  practicePosition,
  onPracticeNextTask,
  onPracticeGoBack,
}) => {
  const [executionResult, setExecutionResult] = useState<KotlinExecutionResult | null>(null);
  const [showOutputPanel, setShowOutputPanel] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState<boolean>(false);

  // Clicking anywhere outside the three-dot menu (and its button) closes it. Capture phase, so it also works over the
  // editor, whose own handlers stop propagation; the click still reaches what was tapped.
  useEffect(() => {
    if (!showOverflowMenu) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('[data-overflow-menu]')) setShowOverflowMenu(false);
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [showOverflowMenu]);
  // Persistent Expected Output strip: collapsed by default, expandable via
  // its header row when the learner wants to check the target.
  const [showExpectedOutputStrip, setShowExpectedOutputStrip] = useState<boolean>(false);

  // Preparing state with progress animation before auto-opening Task dialog
  const [isPreparing, setIsPreparing] = useState<boolean>(!TEMP_SKIP_PREP_DIALOG);
  const [prepProgress, setPrepProgress] = useState<number>(15);
  const prepTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Auto-open Task dialog with 1 second delay
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  // Practice mode only: how much guidance the learner asked for (Practice tab
  // "Practice help"). Beginner shows the Steps open, Intermediate keeps them
  // behind a "Need help? View Steps" row, Experienced reveals one step at a
  // time on request. Read once per task; it only changes from the Practice tab.
  const helpLevel = React.useMemo(
    () => (isPracticeMode ? StorageManager.getPracticeHelpLevel() ?? 'beginner' : 'beginner'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPracticeMode, data.title]
  );
  const [stepsOpen, setStepsOpen] = useState<boolean>(isPracticeMode && helpLevel === 'beginner');
  const [hintsShown, setHintsShown] = useState<number>(0);
  // Index of the hint just revealed; highlighted in the task dialog for a few seconds.
  const [highlightedHint, setHighlightedHint] = useState<number | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightHint = (index: number) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedHint(index);
    highlightTimerRef.current = setTimeout(() => setHighlightedHint(null), 3500);
  };
  useEffect(() => () => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);
  useEffect(() => {
    setStepsOpen(isPracticeMode && helpLevel === 'beginner');
    setHintsShown(0);
    setHighlightedHint(null);
  }, [isPracticeMode, helpLevel, data.title]);
  // The numbered steps, one per paragraph, for Experienced's one-at-a-time hints.
  const stepParagraphs = React.useMemo(
    () => (data.description || '').split('\n\n').filter((para) => /^\d+\.\s/.test(para.trim())),
    [data.description]
  );
  // Hint wording for the chosen help level: Intermediate and Experienced have their own, less detailed text for the
  // same steps (Beginner sees the full steps instead). Used only when it matches the steps one for one.
  const levelHints = React.useMemo(() => {
    if (!isPracticeMode || helpLevel === 'beginner') return undefined;
    const candidate = data.levelHints?.[helpLevel];
    return candidate && candidate.steps.length === stepParagraphs.length && candidate.comments.length === stepParagraphs.length ? candidate : undefined;
  }, [isPracticeMode, helpLevel, data.levelHints, stepParagraphs.length]);
  const hintParagraphs = levelHints?.steps ?? stepParagraphs;
  // Tapping a folded comment in the editor unlocks its hint (and every hint before it) in the dialog, opening the earlier
  // comments too so the editor and the dialog always agree. The other direction is in the "show a hint" buttons.
  const handleHelperToggle = (key: string, open: boolean) => {
    if (!open || !levelHints) return;
    const m = /^\/\/ (\d+)\./.exec(key);
    if (!m) return;
    const n = Math.min(Number(m[1]), stepParagraphs.length);
    if (n <= hintsShown) return;
    for (let k = hintsShown + 1; k < n; k++) editorRef.current?.expandHelperComment(`// ${k}.#0`);
    setHintsShown(n);
    highlightHint(n - 1);
  };
  // Unlocking a hint also drops its step comment into the editor, so it stays in
  // view while typing (the editor folds it to a tappable `// 1.` marker). The
  // first one goes right under the starting values; each later one goes under
  // the previous hint comment. Falls back to just above main's closing brace.
  const insertedHintCommentsRef = useRef<string[]>([]);
  useEffect(() => {
    insertedHintCommentsRef.current = [];
  }, [data.title]);
  const insertHintComment = (index: number, keepResultPanel = false) => {
    // With level hints the numbered comments are already in the editor (collapsed); unlocking only has to open them.
    if (levelHints) return;
    const paragraph = stepParagraphs[index];
    if (!paragraph) return;
    const prepared = levelHints
      ? levelHints.comments[index]
      : data.helperComments && data.helperComments.length === stepParagraphs.length
        ? data.helperComments[index]
        : '// ' + stripTaskMarkup(paragraph.split('\n')[0]).trim();
    const lines = userCode.split('\n');
    const given = extractGivenLines(data.initialCode);
    const prevComment = insertedHintCommentsRef.current[index - 1];
    let anchor = -1;
    if (prevComment) anchor = lines.findIndex((l) => l.trim() === prevComment);
    if (anchor === -1 && given.length > 0) {
      const lastGiven = given[given.length - 1].trim();
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === lastGiven) {
          anchor = i;
          break;
        }
      }
    }
    let next: string[];
    if (anchor >= 0) {
      const indent = (lines[anchor].match(/^\s*/) ?? [''])[0];
      next = [...lines.slice(0, anchor + 1), '', indent + prepared, ...lines.slice(anchor + 1)];
    } else {
      let close = lines.length - 1;
      while (close > 0 && lines[close].trim() !== '}') close--;
      next = [...lines.slice(0, close), '    ' + prepared, '', ...lines.slice(close)];
    }
    insertedHintCommentsRef.current[index] = prepared;
    if (keepResultPanel) setUserCode(next.join('\n'));
    else handleCodeChange(next.join('\n'));
  };
  const [modalAnimState, setModalAnimState] = useState<'open' | 'closing' | 'opening' | 'closed'>('closed');
  const [heroStyle, setHeroStyle] = useState<React.CSSProperties>({});
  const [isTaskButtonCatching, setIsTaskButtonCatching] = useState<boolean>(false);

  const [horizontalScrollEnabled, setHorizontalScrollEnabled] = useState<boolean>(true);

  const editorRef = useRef<KotlinCodeEditorHandle>(null);
  const taskButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoOpenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute Hero transition coordinates between center dialog and Top Task button
  const computeHeroStyle = (forOpening = false): React.CSSProperties => {
    const btnEl = taskButtonRef.current;
    const modalEl = modalRef.current;

    let btnCenterX = 70;
    let btnCenterY = 40;
    let btnWidth = 74;
    let btnHeight = 28;

    if (btnEl) {
      const bRect = btnEl.getBoundingClientRect();
      btnCenterX = bRect.left + bRect.width / 2;
      btnCenterY = bRect.top + bRect.height / 2;
      btnWidth = bRect.width;
      btnHeight = bRect.height;
    }

    let modalCenterX = window.innerWidth / 2;
    let modalCenterY = window.innerHeight / 2;
    let modalWidth = Math.min(372, window.innerWidth - 32);
    let modalHeight = Math.min(window.innerHeight * 0.82, 520);

    if (modalEl && !forOpening) {
      const mRect = modalEl.getBoundingClientRect();
      if (mRect.width > 50 && mRect.height > 50) {
        modalCenterX = mRect.left + mRect.width / 2;
        modalCenterY = mRect.top + mRect.height / 2;
        modalWidth = mRect.width;
        modalHeight = mRect.height;
      }
    }

    const dx = btnCenterX - modalCenterX;
    const dy = btnCenterY - modalCenterY;
    const scaleX = Math.max(0.06, btnWidth / modalWidth);
    const scaleY = Math.max(0.04, btnHeight / modalHeight);

    return {
      '--hero-dx': `${dx.toFixed(1)}px`,
      '--hero-dy': `${dy.toFixed(1)}px`,
      '--hero-scale-x': `${scaleX.toFixed(3)}`,
      '--hero-scale-y': `${scaleY.toFixed(3)}`,
    } as React.CSSProperties;
  };

  // Auto-open Task dialog with a preparation progress animation ("Preparing Write & Run Exercise")
  useEffect(() => {
    prepTimersRef.current.forEach(clearTimeout);
    prepTimersRef.current = [];
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);

    setIsPreparing(!TEMP_SKIP_PREP_DIALOG);
    setPrepProgress(12);

    const t1 = setTimeout(() => setPrepProgress(38), 450);
    const t2 = setTimeout(() => setPrepProgress(65), 1050);
    const t3 = setTimeout(() => setPrepProgress(88), 1750);
    const t4 = setTimeout(() => setPrepProgress(100), 2250);

    autoOpenTimerRef.current = setTimeout(() => {
      setIsPreparing(false);
      const style = computeHeroStyle(true);
      setHeroStyle(style);
      setShowTaskModal(true);
      setModalAnimState('opening');

      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = setTimeout(() => {
        setModalAnimState('open');
      }, 360);
    }, 100);

    prepTimersRef.current.push(t1, t2, t3, t4, autoOpenTimerRef.current);

    return () => {
      prepTimersRef.current.forEach(clearTimeout);
      prepTimersRef.current = [];
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, [data]);

  // Clean up animation timeouts on unmount
  useEffect(() => {
    return () => {
      prepTimersRef.current.forEach(clearTimeout);
      prepTimersRef.current = [];
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

  // Hero scale-down into the Top Task button so user sees where it went
  const handleCloseTaskModal = () => {
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    if (modalAnimState === 'closing') return;
    soundFX.playClick();

    const style = computeHeroStyle(false);
    setHeroStyle(style);
    setModalAnimState('closing');

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      setShowTaskModal(false);
      setStepsOpen(false);
      setModalAnimState('closed');

      // Trigger the Task button catch bounce and glowing ring
      setIsTaskButtonCatching(true);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => {
        setIsTaskButtonCatching(false);
      }, 700);
    }, 380);
  };

  // Hero scale-up expanding out from the Top Task button
  const handleOpenTaskModal = () => {
    prepTimersRef.current.forEach(clearTimeout);
    prepTimersRef.current = [];
    setIsPreparing(false);
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    soundFX.playClick();
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);

    const style = computeHeroStyle(true);
    setHeroStyle(style);

    setShowTaskModal(true);
    setModalAnimState('opening');

    animTimeoutRef.current = setTimeout(() => {
      setModalAnimState('open');
    }, 360);
  };

  const handleToggleTaskModal = () => {
    if (showTaskModal && modalAnimState !== 'closing') {
      handleCloseTaskModal();
    } else {
      handleOpenTaskModal();
    }
  };

  // Escape key closes modal with Hero scale-down effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTaskModal && modalAnimState === 'open') {
        handleCloseTaskModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTaskModal, modalAnimState]);

  // Any edit to the code should dismiss a currently-shown run result, since
  // it no longer describes what's in the editor.
  const handleCodeChange = (newCode: string) => {
    setUserCode(newCode);
    setExecutionResult(null);
    setShowOutputPanel(false);
  };

  // Execute Kotlin Code
  const handleExecute = async () => {
    soundFX.playClick();

    // Prevent success if the user hasn't edited anything yet
    // Compare ignoring ALL whitespace: the editor adds blank lines / indentation when it loads the starter.
    const trimmedUser = userCode.replace(/\s+/g, '');
    const trimmedInitial = (data.initialCode || '').replace(/\s+/g, '');
    if (trimmedUser === trimmedInitial) {
      soundFX.playError();
      const uneditedResult: KotlinExecutionResult = {
        success: false,
        output: '',
        logs: [],
        error: {
          message: 'Code has not been edited yet. Please write the required logic before running.',
          line: 1,
          type: 'runtime_error',
        },
        executionTimeMs: 0,
        exitCode: 1,
      };
      setExecutionResult(uneditedResult);
      setShowOutputPanel(true);
      setHasRunCode(true);
      return;
    }

    const res = await runKotlinCode(userCode, data.expectedOutput, data.testCase, data.hardcodeCheck);
    setExecutionResult(res);
    setShowOutputPanel(true);
    setHasRunCode(true);

    if (setActualOutput) {
      setActualOutput(res.output);
    }
    if (onRunCode) {
      onRunCode();
    }

    if (res.success) {
      soundFX.playSuccess();
      onProblemPassed?.();
    } else {
      soundFX.playError();
    }
  };

  // Temporary testing shortcut: holding Run completes this stage without
  // invoking the real compiler or changing normal tap behavior.
  const runButtonLongPress = useLongPress({
    onClick: handleExecute,
    onLongPress: () => {
      soundFX.playSuccess();
      onProblemPassed?.();
      onContinue();
    },
  });

  // Autocomplete suggestion handler
  const handleAcceptSuggestion = () => {
    soundFX.playSuccess();
    if (data.solutionCode) {
      const merged = applySolutionPreservingComments(data.initialCode, data.solutionCode);
      editorRef.current?.resetTo(merged, merged.length);
    }
  };

  // Derive lesson-relevant accessory tokens dynamically
  const accessoryTokens = React.useMemo(() => {
    const tokens = new Set<string>();
    if (data.requirements?.name) tokens.add(data.requirements.name);
    if (data.requirements?.params) {
      const parts = data.requirements.params.split(',');
      for (const p of parts) {
        const clean = p.trim().split(':')[0].trim();
        if (clean) tokens.add(clean);
      }
    }
    if (data.testCase?.call) {
      const fnName = data.testCase.call.split('(')[0].trim();
      if (fnName) tokens.add(fnName);
    }
    return Array.from(tokens);
  }, [data.requirements, data.testCase]);

  const givenLines = React.useMemo(() => extractGivenLines(data.initialCode), [data.initialCode]);

  const prioritySymbols = React.useMemo(
    () => deriveTaskSymbols((data as { conceptTags?: string[] }).conceptTags, data.title, topicTitle, stripTaskMarkup(data.description), data.initialCode),
    [data.title, topicTitle, data.description, data.initialCode]
  );

  return (
    <main
      className={`w-full max-w-2xl h-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between relative overflow-hidden shadow-2xl border-x-0 md:border md:rounded-2xl select-none ${
        isDark ? 'bg-[#090d16] md:border-slate-800/80 text-slate-100' : 'bg-white md:border-slate-300 text-slate-900'
      }`}
    >
      {/* ================= BEGIN: Minimal Top Toolbar (Sticky Top) ================= */}
      {/* Safe-area padding lives on this OUTER element with no fixed height,
          so it adds to the header's total height instead of eating into a
          fixed h-10 box (which squished/clipped the button row on devices
          with a real status-bar inset -- invisible in browser preview,
          where the inset is always 0). */}
      <header
        className={`sticky top-0 z-30 w-full border-b shrink-0 select-none pt-[env(safe-area-inset-top,0px)] ${
          isDark ? 'bg-[#0d121d] border-ide-border' : 'bg-[#e8eaf0] border-slate-300'
        }`}
      >
      <div className="px-3 sm:px-4 h-14 flex items-center justify-between">
        {/* Left: Back button & Problem Details Trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            aria-label="Go Back"
            onClick={onBack || onContinue}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-transform cursor-pointer shrink-0 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Short & meaningful Task Button with Hero animation */}
          <button
            ref={taskButtonRef}
            type="button"
            id="task-trigger-btn"
            onClick={handleToggleTaskModal}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium active:scale-95 transition-all cursor-pointer ${
              isTaskButtonCatching ? 'animate-task-catch ring-2 ring-indigo-400' : ''
            } ${
              showTaskModal
                ? 'bg-indigo-600/25 border-indigo-500/70 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : isDark
                ? 'bg-[#131826] hover:bg-[#1c2438] border-slate-700/80 text-slate-200'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
            aria-label="Toggle Task"
            title="Click to view Task instructions"
          >
            {/* When minimized into the button, show an attractive subtle pulse beacon */}
            {!showTaskModal && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 border border-white/60"></span>
              </span>
            )}
            <span className="font-semibold tracking-tight">Task</span>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                showTaskModal ? 'rotate-180 text-indigo-300' : ''
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Center: Practice-mode task position, e.g. "2 / 12" */}
        {isPracticeMode && practicePosition && (
          <div
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold tracking-wide ${
              isDark ? 'bg-slate-800/80 text-indigo-300' : 'bg-white text-indigo-600 border border-slate-300'
            }`}
          >
            {practicePosition.current} / {practicePosition.total}
          </div>
        )}

        {/* Right: Run button and Overflow Menu (Undo/Redo now live above the
            keyboard, right-aligned, within easy thumb reach while typing) */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            aria-label="Execute code"
            {...runButtonLongPress}
            className="h-9 px-4 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_14px_rgba(99,102,241,0.45)] active:scale-95 transition-all cursor-pointer select-none"
            id="run-btn"
          >
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="tracking-wide">Run</span>
          </button>

          <button
            type="button"
            aria-label="More options"
            data-overflow-menu
            onClick={() => setShowOverflowMenu((prev) => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="12" cy="19" r="1.75" />
            </svg>
          </button>

          {/* Overflow Dropdown */}
          {showOverflowMenu && (
            <div
              data-overflow-menu
              className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-2xl p-1.5 z-50 text-xs animate-fadeIn ${
                isDark ? 'bg-[#141926] border-slate-700/80' : 'bg-white border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setShowOverflowMenu(false);
                  handleExecute();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Run (Ctrl+Enter)</span>
              </button>


              {data.solutionCode && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOverflowMenu(false);
                    setShowSolutionModal(true);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-indigo-300 flex items-center gap-2 cursor-pointer ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100 text-indigo-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-400">visibility</span>
                  <span>View Solution</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowOverflowMenu(false);
                  handleAcceptSuggestion();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-amber-300 flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100 text-amber-700'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-amber-400">auto_fix_high</span>
                <span>Auto-Complete</span>
              </button>


              <button
                type="button"
                onClick={() => {
                  setShowOverflowMenu(false);
                  soundFX.playClick();
                  editorRef.current?.toggleHorizontalScroll();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className={`material-symbols-outlined text-[15px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {horizontalScrollEnabled ? 'wrap_text' : 'unfold_more'}
                </span>
                <span>{horizontalScrollEnabled ? 'Disable' : 'Enable'} Horizontal Scroll</span>
              </button>

              <div className={`h-[1px] my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

              <button
                type="button"
                onClick={() => {
                  setShowOverflowMenu(false);
                  soundFX.playClick();
                  editorRef.current?.resetTo(data.initialCode);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-rose-300 flex items-center gap-2 cursor-pointer ${
                  isDark ? 'hover:bg-rose-950/40' : 'hover:bg-rose-50 text-rose-600'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset to Starter</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </header>
      {/* ================= END: Minimal Top Toolbar ================= */}

      {/* ================= BEGIN: Persistent Target Output Strip ================= */}
      {/* Lets a learner glance at the exact expected output while actively
          coding, without leaving the editor to reopen "View Task" -- see
          PITFALLS.md's rule that whitespace-exact output must always render
          via renderVisibleWhitespace, and CLAUDE.md's discussion of why this
          belongs here (a persistent display) rather than inside the code's
          own comments (which would just hand the learner the literal
          answer to paste). Reuses the exact same "terminal window" card
          design as the task-intro modal's own Expected Output box below
          (dot header row + green monospace value row) instead of a single
          inline line, so the
          label and the value are never visually ambiguous with each other. */}
      {data.expectedOutput && (
        <div className={`shrink-0 border-b ${isDark ? 'border-ide-border' : 'border-slate-300'}`}>
          <div className={`text-xs font-mono ${isDark ? 'bg-[#0a0e17]' : 'bg-white'}`}>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowExpectedOutputStrip((prev) => !prev);
              }}
              className={`w-full flex items-center gap-1.5 px-3 sm:px-4 py-1.5 cursor-pointer ${
                showExpectedOutputStrip
                  ? isDark
                    ? 'border-b border-slate-800'
                    : 'border-b border-slate-200'
                  : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              <span className={`ml-1.5 text-[9px] font-bold uppercase tracking-wider font-sans ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Expected Output
              </span>
              <span className={`material-symbols-outlined text-[15px] ml-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {showExpectedOutputStrip ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {showExpectedOutputStrip && (
              <div className={`px-3 sm:px-4 py-1.5 overflow-x-auto whitespace-nowrap text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {renderVisibleWhitespace(data.expectedOutput)}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ================= END: Persistent Target Output Strip ================= */}

      <KotlinCodeEditor
        ref={editorRef}
        code={userCode}
        onCodeChange={handleCodeChange}
        onHorizontalScrollChange={setHorizontalScrollEnabled}
        onRunRequested={handleExecute}
        customTokens={accessoryTokens}
        prioritySymbols={prioritySymbols}
        isDark={isDark}
        collapseHelperComments={isPracticeMode}
        onHelperToggle={handleHelperToggle}
      />

      {/* ================= BEGIN: Preparing Exercise Progress Animation ================= */}
      {isPreparing && !showTaskModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn"
          id="preparing-writerun-modal"
        >
          <div
            className={`w-full max-w-[310px] rounded-2xl border p-5 shadow-2xl flex flex-col items-center text-center animate-scaleUp ${
              isDark
                ? 'bg-[#101422] border-indigo-500/30 text-slate-100 shadow-[0_0_35px_rgba(99,102,241,0.25)]'
                : 'bg-white border-indigo-200 text-slate-900 shadow-[0_12px_36px_rgba(99,102,241,0.15)]'
            }`}
          >
            {/* Animated Icon with subtle ping halo */}
            <div className="relative mb-3.5 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-11 w-11 rounded-2xl bg-indigo-500/25" />
              <div
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
                  isDark
                    ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">terminal</span>
              </div>
            </div>

            <h4 className={`font-bold text-sm tracking-tight mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Preparing Write &amp; Run Exercise
            </h4>
            <p className={`text-xs mb-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Setting up compiler &amp; test workspace...
            </p>

            {/* Smooth animated progress bar */}
            <div className="w-full space-y-1.5">
              <div
                className={`w-full h-2 rounded-full overflow-hidden border p-[1px] ${
                  isDark ? 'bg-[#090d16] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.7)]"
                  style={{ width: `${prepProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10.5px] font-mono">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Initializing</span>
                <span className="text-indigo-400 font-semibold">{prepProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================= END: Preparing Exercise Progress Animation ================= */}

      {/* ================= BEGIN: Task Details Modal (Hero Scale Animation) ================= */}
      {showTaskModal && (
        <div
          className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 select-text ${
            modalAnimState === 'closing'
              ? 'animate-hero-backdrop-out'
              : modalAnimState === 'opening'
              ? 'animate-hero-backdrop-in'
              : ''
          }`}
          onClick={handleCloseTaskModal}
        >
          <div
            ref={modalRef}
            style={modalAnimState === 'open' ? undefined : heroStyle}
            className={`w-full max-w-[372px] mx-auto rounded-2xl border shadow-2xl max-h-[calc(100dvh-1rem)] flex flex-col overflow-hidden ${
              modalAnimState === 'closing'
                ? 'animate-hero-down'
                : modalAnimState === 'opening'
                ? 'animate-hero-up'
                : ''
            } ${
              isDark ? 'border-slate-700/80 bg-[#121622] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
            id="task-details-modal"
          >
            {/* Sticky Top Header: Title + Cross Button */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border tracking-tight ${
                    isDark
                      ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700/50'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  }`}
                >
                  {isRandomPractice
                    ? 'Write & Run'
                    : `Write & Run - Task ${String(isPracticeMode && practicePosition ? practicePosition.current : data.challengeNumber).padStart(2, '0')}`}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close task details"
                onClick={handleCloseTaskModal}
                className={`cursor-pointer p-1 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-3.5 space-y-3.5 flex-1 overscroll-contain">
              <div>
                <h3 className={`font-bold text-base mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {data.title || topicTitle || 'Kotlin Code Task'}
                </h3>
                {data.goal && (
                  <div
                    className={`mb-3 rounded-xl border px-3 py-2.5 ${
                      isDark ? 'bg-indigo-500/10 border-indigo-400/25' : 'bg-indigo-50 border-indigo-200'
                    }`}
                  >
                    <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      What you need to achieve
                    </span>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{data.goal}</p>
                  </div>
                )}
                {givenLines.length > 0 && (
                  <div className="mb-3">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      You start with
                    </span>
                    <div className="rounded-xl border border-slate-800 bg-[#0a0e17] px-3 py-2.5 text-xs font-mono overflow-x-auto">
                      {renderKotlinCodeLines(givenLines, { isDark: true }).map((node, idx) => (
                        <div key={idx} className="whitespace-pre">{node}</div>
                      ))}
                    </div>
                  </div>
                )}
                {(() => {
                  // The existing Steps content, unchanged.
                  const stepsContent = (
                    <>
                      {(data.goal || givenLines.length > 0) && (
                        <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Steps
                        </span>
                      )}
                      <p className={`text-xs leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {renderTaskText(data.description, isDark)}
                      </p>
                    </>
                  );
                  if (!isPracticeMode) return stepsContent;
                  if (helpLevel !== 'beginner' && data.goal && stepParagraphs.length > 0) {
                    return (
                      <div className="space-y-2">
                        {hintsShown > 0 && (
                          <div className={`rounded-xl border px-3 py-2.5 space-y-2 ${isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
                            {hintParagraphs.slice(0, hintsShown).map((para, i) => (
                              <p
                                key={para}
                                ref={highlightedHint === i ? (el) => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) : undefined}
                                className={`text-xs leading-relaxed whitespace-pre-line rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-700 ${
                                  highlightedHint === i
                                    ? isDark
                                      ? 'bg-amber-400/25 ring-1 ring-amber-400/60 text-amber-50'
                                      : 'bg-amber-100 ring-1 ring-amber-400 text-amber-900'
                                    : isDark
                                    ? 'text-slate-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                {renderTaskText(para, isDark)}
                              </p>
                            ))}
                          </div>
                        )}
                        {hintsShown < stepParagraphs.length && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              insertHintComment(hintsShown);
                              editorRef.current?.expandHelperComment(`// ${hintsShown + 1}.#0`);
                              highlightHint(hintsShown);
                              setHintsShown((n) => Math.min(stepParagraphs.length, n + 1));
                            }}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                              isDark
                                ? 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{hintsShown === 0 ? 'Stuck? Show a hint' : 'Show the next hint'}</span>
                            <span className="font-mono text-[10px] opacity-70">
                              {hintsShown} / {stepParagraphs.length}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div>
                      <button
                        type="button"
                        aria-expanded={stepsOpen}
                        aria-controls="practice-task-steps"
                        onClick={() => {
                          soundFX.playClick();
                          setStepsOpen((open) => !open);
                        }}
                        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                          isDark
                            ? 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{stepsOpen ? 'Hide Steps' : 'Need help? View Steps'}</span>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${stepsOpen ? 'rotate-180' : 'rotate-0'}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {/* grid-template-rows 0fr -> 1fr animates an auto-height panel smoothly */}
                      <div
                        id="practice-task-steps"
                        aria-hidden={!stepsOpen}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                          stepsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden min-h-0">
                          <div className="pt-3">{stepsContent}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Expected Output -- always rendered as a dark code-editor/terminal
                  window, independent of the app's light/dark theme */}
              {data.expectedOutput && (
                <div className="rounded-xl border border-slate-800 bg-[#0a0e17] overflow-hidden text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500/70" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider font-sans text-slate-500">
                      Expected Output
                    </span>
                  </div>
                  <div className="p-3.5 leading-snug break-words whitespace-pre-line text-emerald-400 font-bold">
                    {data.expectedOutput}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Bottom Footer */}
            <div className={`flex items-center justify-end px-5 py-3 border-t shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <button
                type="button"
                onClick={handleCloseTaskModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
              >
                <span>Start Coding</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= END: Task Details Modal ================= */}

      {/* ================= BEGIN: Real Kotlin Verify Modal (long-press Run) ================= */}
      {/* ================= END: Real Kotlin Verify Modal ================= */}

      {/* ================= BEGIN: Run Result Dialog (bottom sheet) ================= */}
      {showOutputPanel && executionResult && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center animate-fadeIn"
          onClick={() => setShowOutputPanel(false)}
        >
          <div
            className={`w-full sm:max-w-[420px] mx-auto rounded-t-2xl border border-b-0 shadow-2xl animate-sheetUp max-h-[85vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)] ${
              isDark ? 'border-slate-700/80 bg-[#121622] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
            id="run-result-modal"
          >
            {/* Bottom sheet drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <span className={`h-1 w-9 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            </div>
            {/* Modal Header - Sticky to top */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2">
                {executionResult.success ? (
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] font-bold border flex items-center gap-1 ${
                      isDark
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/50'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>TEST PASSED</span>
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] font-bold border flex items-center gap-1 ${
                      isDark ? 'bg-rose-950/90 text-rose-300 border-rose-700/50' : 'bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    <svg className="w-3 h-3 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>RUN FAILED</span>
                  </span>
                )}
                <span className="text-slate-500 text-xs">·</span>
                <span className={`font-mono text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {executionResult.executionTimeMs || 12}ms
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-5 py-4 flex-1 overscroll-contain">
              {executionResult.success ? (
                <>
                  <h3 className={`font-bold text-base mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    <span>Correct Output!</span>
                    <span className="text-emerald-400">🎉</span>
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Your code compiled and executed smoothly with the expected output.
                  </p>

                  <div
                    className={`my-3.5 p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                      isDark ? 'bg-[#090d16] border-emerald-500/30' : 'bg-slate-50 border-emerald-400/50'
                    }`}
                  >
                    <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Output Verification
                    </div>
                    <div className={`flex justify-between items-start gap-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`shrink-0 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Output:</span>
                      <span
                        className={`min-w-0 font-bold px-2 py-0.5 rounded border leading-snug break-words whitespace-pre-line text-right ${
                          isDark ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' : 'text-emerald-700 bg-emerald-100 border-emerald-300'
                        }`}
                      >
                        {executionResult.output || '(no output)'}
                      </span>
                    </div>
                    {data.expectedOutput && (
                      <div className={`flex justify-between items-start gap-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="shrink-0 leading-snug">Expected:</span>
                        <span
                          className={`min-w-0 font-bold px-2 py-0.5 rounded border leading-snug break-words whitespace-pre-line text-right ${
                            isDark ? 'text-slate-300 bg-slate-500/15 border-slate-500/30' : 'text-slate-700 bg-slate-100 border-slate-300'
                          }`}
                        >
                          {data.expectedOutput}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    Execution Error
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {executionResult.error?.message || 'The code produced an unexpected output or failed to compile.'}
                  </p>

                  {isPracticeMode && helpLevel !== 'beginner' && data.goal && stepParagraphs.length > hintsShown && (
                    executionResult.error?.message?.startsWith('Code has not been edited') ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          // Reveal the next hint: its comment goes into the editor (expanded) and
                          // the same hint is now unlocked in the task dialog.
                          const index = hintsShown;
                          insertHintComment(index, true);
                          setHintsShown(index + 1);
                          editorRef.current?.expandHelperComment(`// ${index + 1}.#0`);
                          highlightHint(index);
                          setShowOutputPanel(false);
                          handleOpenTaskModal();
                        }}
                        className={`mt-2.5 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                          isDark ? 'border-amber-400/40 bg-amber-500/10 text-amber-300' : 'border-amber-400 bg-amber-50 text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                        {hintsShown > 0 ? 'Show next hint' : 'Show a hint'}
                      </button>
                    )
                  )}

                  <div
                    className={`my-3.5 p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                      isDark ? 'bg-[#090d16] border-rose-500/30' : 'bg-slate-50 border-rose-400/50'
                    }`}
                  >
                    <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Output Details
                    </div>
                    <div className={`flex justify-between items-start gap-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`shrink-0 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your Output:</span>
                      <span
                        className={`min-w-0 font-bold px-2 py-0.5 rounded border leading-snug break-words whitespace-pre-line text-right ${
                          isDark ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' : 'text-rose-700 bg-rose-100 border-rose-300'
                        }`}
                      >
                        {executionResult.output || '(no output)'}
                      </span>
                    </div>
                    {data.expectedOutput && (
                      <div className={`flex justify-between items-start gap-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="shrink-0 leading-snug">Expected:</span>
                        <span className={`min-w-0 text-right leading-snug break-words whitespace-pre-line ${isDark ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-medium'}`}>{data.expectedOutput}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions - Sticky to bottom */}
            <div className={`flex items-center ${isPracticeMode ? 'justify-between' : 'justify-end'} gap-2.5 px-5 py-3 border-t shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <button
                type="button"
                onClick={() => {
                  if (executionResult.success && isPracticeMode) {
                    onPracticeGoBack?.();
                  } else {
                    setShowOutputPanel(false);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium active:scale-95 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {executionResult.success ? (isPracticeMode ? 'Go Back' : 'Keep Editing') : 'Back to Code'}
              </button>

              {executionResult.success ? (
                <button
                  type="button"
                  id="run-dialog-continue-btn"
                  onClick={() => {
                    soundFX.playSuccess();
                    setShowOutputPanel(false);
                    if (isPracticeMode) {
                      onPracticeNextTask?.();
                    } else {
                      onContinue();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
                >
                  <span>
                    {isPracticeMode
                      ? isRandomPractice
                        ? 'Next Random Task'
                        : practicePosition?.current && practicePosition.current < practicePosition.total
                        ? `Next Task ${practicePosition.current + 1}/${practicePosition.total}`
                        : 'Next Task'
                      : nextStageLabel
                      ? `Continue to ${nextStageLabel}`
                      : 'Continue'}
                  </span>
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                data.solutionCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowOutputPanel(false);
                      setShowSolutionModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-medium active:scale-95 transition-all cursor-pointer"
                  >
                    View Solution
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
      {/* ================= END: Run Result Dialog ================= */}

      {/* Reference Solution Modal (accessible via overflow menu) */}
      {showSolutionModal && data.solutionCode && (
        <div onClick={() => setShowSolutionModal(false)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl max-h-[85vh] flex flex-col overflow-hidden ${
              isDark ? 'border-slate-700/80 bg-[#121622] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Reference Solution</h3>
              <button
                type="button"
                aria-label="Close reference solution"
                onClick={() => setShowSolutionModal(false)}
                className={`cursor-pointer p-1 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-5 py-3.5 flex-1 overscroll-contain">
              <div
                className={`p-3 rounded-xl border font-mono text-xs whitespace-pre overflow-x-auto ${
                  isDark ? 'bg-[#090d16] border-slate-800 text-indigo-300' : 'bg-slate-50 border-slate-200 text-indigo-700'
                }`}
              >
                {data.solutionCode}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className={`flex items-center justify-end gap-2 px-5 py-3 border-t shrink-0 ${isDark ? 'border-slate-800 bg-[#121622]' : 'border-slate-200 bg-white'}`}>
              <button
                type="button"
                onClick={() => setShowSolutionModal(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSolutionModal(false);
                  handleAcceptSuggestion();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-[0_0_14px_rgba(99,102,241,0.4)]"
              >
                Apply Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
