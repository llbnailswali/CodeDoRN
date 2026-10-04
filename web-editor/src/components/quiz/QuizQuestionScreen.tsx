import React from 'react';
import { AppTheme } from '../../types';
import { accentForWorld } from '../../utils/worldAccents';
import { soundFX } from '../../utils/audio';
import {
  QuizAnswer,
  QuizQuestion,
  correctAnswerText,
  gradeQuizAnswer,
  hasAnswer,
} from '../../utils/quizQuestions';
import { QuizAnswerBody } from './QuizAnswerBodies';

export type QuizResult = 'correct' | 'wrong';

interface QuizQuestionScreenProps {
  theme: AppTheme;
  question: QuizQuestion;
  /** 1-based position in the session. */
  step: number;
  total: number;
  /** Results of the questions already answered, in order. Drives the progress strip. */
  /** World this session belongs to, shown in the toolbar. */
  world?: { order: number; title: string };
  onClose: () => void;
  /** `answer` is what the learner chose; it is absent only for the temporary Pass / Fail shortcut. */
  onContinue: (correct: boolean, answer?: QuizAnswer) => void;
  /** TEMPORARY test shortcut: marks the question passed or failed and goes straight to the next one. Remove with its buttons. */
  onDevResult?: (correct: boolean) => void;
}

// What the main button says while the learner has not answered yet: it tells them what to do instead of just being greyed out.
const WAITING_LABEL: Record<QuizQuestion['type'], string> = {
  single_choice: 'Choose an answer',
  multi_select: 'Select your answers',
  fill_blank: 'Fill in the blank',
  predict_output: 'Choose an answer',
  find_error: 'Tap a line',
  true_false: 'Choose true or false',
  code_comparison: 'Choose a code',
};

/**
 * One quiz question, built for a learner on a phone:
 *  - minimal chrome while thinking (close, a ten-part progress strip, a count);
 *  - one plain line saying HOW to answer;
 *  - the answers in the lower half, every target at least 52px;
 *  - the explanation appears directly under the answers, never in a popup that hides them;
 *  - the main button says what to do: "Choose an answer", then "Check answer", then "Next".
 */
export const QuizQuestionScreen: React.FC<QuizQuestionScreenProps> = ({ theme, question: q, step, total, world, onClose, onContinue, onDevResult }) => {
  const isDark = theme === 'dark';
  const [value, setValue] = React.useState<QuizAnswer>(null);
  const [checked, setChecked] = React.useState(false);
  const [hintOpen, setHintOpen] = React.useState(false);
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const feedbackRef = React.useRef<HTMLElement | null>(null);

  const correct = checked && gradeQuizAnswer(q, value);
  const answered = hasAnswer(value);
  const isLast = step >= total;

  const check = () => {
    if (!answered || checked) return;
    const right = gradeQuizAnswer(q, value);
    if (right) soundFX.playSuccess();
    else soundFX.playError();
    setChecked(true);
    // Bring the explanation into view without jumping.
    window.setTimeout(() => {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }, 60);
  };

  const requestClose = () => {
    soundFX.playClick();
    if (step > 1 || answered) setConfirmLeave(true);
    else onClose();
  };

  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const title = isDark ? 'text-slate-50' : 'text-[#1c2033]';

  return (
    <div className={`relative min-h-[100dvh] flex flex-col font-['Plus_Jakarta_Sans'] ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f3f4f8] text-[#1c2033]'}`}>
      {/* Top: close, progress strip, count. Nothing else competes with the question. */}
      <header className="px-4 pt-3 pb-1 flex items-center gap-3">
        <button
          type="button"
          aria-label="Leave quiz"
          onClick={requestClose}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform border ${
            isDark ? 'border-white/15 bg-[#121826] text-slate-200' : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined !text-[20px]">close</span>
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {world && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`font-mono text-[12px] font-bold shrink-0 ${isDark ? accentForWorld(world.order).textDark : accentForWorld(world.order).text}`}>W{world.order}</span>
              <span className={`text-[13px] font-semibold truncate ${title}`}>{world.title}</span>
            </div>
          )}
          {/* A thin bar scales to any number of questions; the exact position is the n / total count beside it. */}
          <div
            className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/15' : 'bg-slate-300'}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={step - 1 + (checked ? 1 : 0)}
            aria-label={`Question ${step} of ${total}`}
          >
            <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-300" style={{ width: `${((step - 1 + (checked ? 1 : 0)) / total) * 100}%` }} />
          </div>
        </div>
        <span className={`font-mono text-[13px] font-bold tabular-nums ${title}`}>
          {step}
          <span className={muted}> / {total}</span>
        </span>
      </header>

      <main className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className={`font-mono text-[11px] font-bold tracking-wider uppercase ${muted}`}>Concept · {q.topic}</span>
          <h1 className={`font-['Outfit'] text-[18px] font-semibold leading-snug tracking-tight ${title}`}>{q.question}</h1>
          {q.type === 'multi_select' && Array.isArray(value) && value.length > 0 && (
            <span className={`self-start px-2 py-0.5 rounded-full text-[12px] font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>{value.length} selected</span>
          )}
        </div>

        <QuizAnswerBody question={q} value={value} onChange={setValue} checked={checked} isDark={isDark} />

        {!checked && q.hint && (
          <div className="flex">
            {hintOpen ? (
              <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-snug ${isDark ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                <span className="material-symbols-outlined !text-[18px] mt-0.5">lightbulb</span>
                <span>{q.hint}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setHintOpen(true);
                }}
                className={`self-start inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border text-[13px] font-semibold transition-colors ${isDark ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200' : 'border-indigo-300 bg-indigo-50 text-indigo-700'}`}
              >
                <span className="material-symbols-outlined !text-[18px]">lightbulb</span>
                Need a hint?
              </button>
            )}
          </div>
        )}

        {checked && (
          <section
            ref={feedbackRef}
            role="status"
            aria-live="polite"
            className={`rounded-2xl border-2 p-4 flex flex-col gap-2.5 ${
              correct
                ? isDark ? 'border-emerald-400/70 bg-emerald-400/10' : 'border-emerald-500 bg-emerald-50'
                : isDark ? 'border-rose-400/70 bg-rose-400/10' : 'border-rose-400 bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined !text-[26px] ${correct ? 'text-emerald-500' : 'text-rose-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-['Outfit'] text-[16px] font-semibold ${correct ? (isDark ? 'text-emerald-200' : 'text-emerald-800') : isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                {correct ? 'Correct!' : 'Not quite'}
              </span>
            </div>
            {!correct && (
              <div className={`text-[13px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <span className="font-semibold">Correct answer: </span>
                <span className="font-mono font-bold break-words">{correctAnswerText(q)}</span>
              </div>
            )}
            <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{q.explanation}</p>
            <p className={`font-mono text-[12px] font-semibold ${muted}`}>Concept: {q.topic}</p>
          </section>
        )}
      </main>

      {/* The one main action, always in the thumb zone. */}
      <footer className={`sticky bottom-0 px-4 pt-3 pb-5 ${isDark ? 'bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent' : 'bg-gradient-to-t from-[#f3f4f8] via-[#f3f4f8] to-transparent'}`}>
        {onDevResult && (
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold text-amber-500 mr-auto">DEV · test only</span>
            <button type="button" onClick={() => onDevResult(true)} className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-[13px] font-bold">
              Pass
            </button>
            <button type="button" onClick={() => onDevResult(false)} className="h-9 px-4 rounded-lg bg-rose-500 text-white text-[13px] font-bold">
              Fail
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!checked && !answered}
          onClick={() => {
            if (checked) {
              soundFX.playClick();
              onContinue(correct, value);
            } else check();
          }}
          className={`w-full h-12 rounded-2xl font-['Outfit'] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
            !checked && !answered
              ? isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
              : 'bg-indigo-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.35)]'
          }`}
        >
          {checked ? (isLast ? 'Finish' : 'Next') : answered ? 'Check answer' : WAITING_LABEL[q.type]}
          {(checked || answered) && <span className="material-symbols-outlined !text-[20px]">{checked ? 'arrow_forward' : 'check'}</span>}
        </button>
      </footer>

      {confirmLeave && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/55 p-4" onClick={() => setConfirmLeave(false)}>
          <div
            role="dialog"
            aria-label="Leave quiz?"
            className={`w-full max-w-md rounded-2xl p-5 flex flex-col gap-3 ${isDark ? 'bg-[#121826] border border-white/10' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`font-['Outfit'] text-lg font-semibold ${title}`}>Leave this quiz?</h2>
            <p className={`text-[13px] ${muted}`}>Your answers in this session will not be saved.</p>
            <button type="button" onClick={() => setConfirmLeave(false)} className="h-12 rounded-xl bg-indigo-500 text-white font-semibold">
              Keep going
            </button>
            <button type="button" onClick={onClose} className={`h-12 rounded-xl font-semibold border ${isDark ? 'border-white/15 text-slate-200' : 'border-slate-300 text-slate-700'}`}>
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
