import React from 'react';
import { AppTheme } from '../../types';
import { soundFX } from '../../utils/audio';
import { accentForWorld } from '../../utils/worldAccents';
import { QuizAnswer, QuizQuestion, answerText, correctAnswerText } from '../../utils/quizQuestions';
import { QuestionProgress, loadQuestionProgress } from '../../utils/quizProgress';
import { QuizCodePanel } from './QuizCodePanel';

interface Props {
  theme: AppTheme;
  world: { order: number; title: string };
  /** The questions to review (the ones answered wrong). */
  questions: QuizQuestion[];
  onTryAgain: (questions: QuizQuestion[]) => void;
  onDone: () => void;
}

const oneLine = (q: QuizQuestion) => q.question.replace(/\s+/g, ' ');

/** The code a question shows, if any, drawn once with the right answer marked. */
function QuestionCode({ q, wrong }: { q: QuizQuestion; wrong?: QuizAnswer }) {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
      return q.code?.length ? <QuizCodePanel lines={q.code} /> : null;
    case 'fill_blank':
      return <QuizCodePanel lines={q.code} fill={{ value: q.answer, state: 'correct' }} />;
    case 'find_error':
      return (
        <QuizCodePanel
          lines={q.code}
          lineState={(i) => (i === q.errorLine ? 'error' : i === wrong ? 'wrongPick' : 'idle')}
          lineNote={(i) => (i === q.errorLine ? (q.errorNote ?? null) : null)}
        />
      );
    case 'code_comparison':
      return (
        <div className="flex flex-col gap-2">
          {(['A', 'B'] as const).map((label, idx) => (
            <div key={label}>
              <div className={`font-mono text-[12px] font-bold mb-1 ${q.answer === idx ? 'text-emerald-500' : 'text-slate-400'}`}>
                {label}
                {q.answer === idx ? ' · correct' : ''}
              </div>
              <QuizCodePanel lines={idx === 0 ? q.a : q.b} compact />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/**
 * Read why a question was missed, then try again. One card per missed question: the first is open, tapping another opens it and
 * closes the rest. Each card shows the question, its code, "Your answer" next to "Correct answer", and the explanation. A question
 * answered correctly since (in a retry) is marked fixed.
 */
export const QuizReviewScreen: React.FC<Props> = ({ theme, world, questions, onTryAgain, onDone }) => {
  const isDark = theme === 'dark';
  const accent = accentForWorld(world.order);
  const [progress] = React.useState<Record<string, QuestionProgress>>(loadQuestionProgress);
  const [openId, setOpenId] = React.useState<string | null>(questions[0]?.id ?? null);

  const isFixed = (q: QuizQuestion) => (progress[q.id]?.streak ?? 0) >= 1;
  const todo = questions.filter((q) => !isFixed(q));

  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const title = isDark ? 'text-slate-50' : 'text-[#1c2033]';
  const card = isDark ? 'border-white/10 bg-[#121826]' : 'border-slate-200 bg-white';
  const body = isDark ? 'text-slate-200' : 'text-slate-700';

  return (
    <div className={`min-h-[100dvh] flex flex-col font-['Plus_Jakarta_Sans'] ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f3f4f8] text-[#1c2033]'}`}>
      <header className="px-4 pt-3 pb-1 flex items-center gap-3">
        <button
          type="button"
          aria-label="Close review"
          onClick={() => {
            soundFX.playClick();
            onDone();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${isDark ? 'border-white/15 bg-[#121826]' : 'border-slate-300 bg-white'}`}
        >
          <span className="material-symbols-outlined !text-[20px]">close</span>
        </button>
        <div className="min-w-0">
          <div className={`font-mono text-[12px] font-bold ${isDark ? accent.textDark : accent.text}`}>W{world.order} · {world.title}</div>
          <h1 className={`font-['Outfit'] text-[18px] font-semibold leading-tight ${title}`}>Review mistakes</h1>
        </div>
        <span className={`ml-auto font-mono text-[13px] font-bold tabular-nums ${title}`}>
          {questions.length - todo.length}
          <span className={muted}> / {questions.length} fixed</span>
        </span>
      </header>

      <main className="flex-1 px-4 pt-3 pb-6 flex flex-col gap-2.5">
        {questions.map((q, i) => {
          const open = openId === q.id;
          const wrong = progress[q.id]?.lastWrong;
          const mine = wrong === undefined || wrong === null ? '' : answerText(q, wrong);
          const fixed = isFixed(q);
          return (
            <section key={q.id} className={`rounded-2xl border overflow-hidden ${card} ${open ? (isDark ? 'border-indigo-400/40' : 'border-indigo-300') : ''}`}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  soundFX.playClick();
                  setOpenId(open ? null : q.id);
                }}
                className="w-full text-left px-3.5 py-3 flex items-start gap-3"
              >
                <span
                  className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-mono text-[12px] font-bold ${
                    fixed ? 'bg-emerald-500 text-white' : isDark ? 'bg-rose-400/20 text-rose-200' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {fixed ? <span className="material-symbols-outlined !text-[16px]">check</span> : i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[14px] font-semibold leading-snug ${title} ${open ? '' : 'line-clamp-2'}`}>{oneLine(q)}</span>
                  {!open && (
                    <span className={`block text-[12px] mt-1 truncate ${muted}`}>
                      {fixed ? 'Fixed: answered correctly since' : `Correct: ${correctAnswerText(q)}`}
                    </span>
                  )}
                </span>
                <span className={`material-symbols-outlined !text-[20px] mt-0.5 ${muted}`}>{open ? 'expand_less' : 'expand_more'}</span>
              </button>

              {open && (
                <div className="px-3.5 pb-4 flex flex-col gap-3">
                  <QuestionCode q={q} wrong={typeof wrong === 'number' ? wrong : undefined} />
                  <div className="grid grid-cols-1 gap-2">
                    {mine && (
                      <div className={`rounded-xl border px-3 py-2.5 ${isDark ? 'border-rose-400/40 bg-rose-400/10' : 'border-rose-300 bg-rose-50'}`}>
                        <div className={`flex items-center gap-1.5 text-[12px] font-bold ${isDark ? 'text-rose-200' : 'text-rose-700'}`}>
                          <span className="material-symbols-outlined !text-[16px]">cancel</span>Your answer
                        </div>
                        <div className={`font-mono text-[13px] font-semibold mt-0.5 break-words ${body}`}>{mine}</div>
                      </div>
                    )}
                    <div className={`rounded-xl border px-3 py-2.5 ${isDark ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-emerald-300 bg-emerald-50'}`}>
                      <div className={`flex items-center gap-1.5 text-[12px] font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        <span className="material-symbols-outlined !text-[16px]">check_circle</span>Correct answer
                      </div>
                      <div className={`font-mono text-[13px] font-semibold mt-0.5 break-words ${body}`}>{correctAnswerText(q)}</div>
                    </div>
                  </div>
                  <p className={`text-[14px] leading-relaxed ${body}`}>{q.explanation}</p>
                </div>
              )}
            </section>
          );
        })}
      </main>

      <footer className={`sticky bottom-0 px-4 pt-3 pb-5 flex flex-col gap-2 ${isDark ? 'bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent' : 'bg-gradient-to-t from-[#f3f4f8] via-[#f3f4f8] to-transparent'}`}>
        {todo.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onTryAgain(todo);
            }}
            className="w-full h-12 rounded-2xl bg-indigo-500 text-white font-['Outfit'] text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
          >
            <span className="material-symbols-outlined !text-[20px]">replay</span>
            Try these again ({todo.length})
          </button>
        ) : (
          <button type="button" onClick={onDone} className="w-full h-12 rounded-2xl bg-emerald-500 text-white font-['Outfit'] text-[15px] font-semibold">
            All fixed. Back to Quiz
          </button>
        )}
        {todo.length > 0 && (
          <button type="button" onClick={onDone} className={`h-10 text-[14px] font-semibold ${muted}`}>
            Done for now
          </button>
        )}
      </footer>
    </div>
  );
};
