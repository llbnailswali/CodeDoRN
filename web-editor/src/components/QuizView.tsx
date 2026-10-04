import React from 'react';
import { AppTheme, LessonQuestion, UserStats } from '../types';
import { soundFX } from '../utils/audio';
import { StorageManager } from '../utils/storage';
import { accentForWorld } from '../utils/worldAccents';
import { NEW_QUIZ_BANKS } from '../data/quizBank';
import { loadQuestionProgress, worldStats } from '../utils/quizProgress';
import {
  QUIZ_SESSION_SIZE,
  QuizWorld,
  buildQuickSession,
  buildWorldSession,
  countCorrect,
  getQuizWorlds,
} from '../utils/quizBank';

interface QuizViewProps {
  theme: AppTheme;
  userStats: UserStats;
  onStartQuiz: (questions: LessonQuestion[]) => void;
  /** Opens a World that has a bank in the new question format. */
  onOpenWorldQuiz: (world: QuizWorld, review?: boolean) => void;
}

// The small monospace glyph on each World card (the design shows one per World).
const WORLD_GLYPHS: Record<number, string> = {
  1: '</>', 2: '+=%', 3: '<>', 4: '↻', 5: 'f(x)', 6: '[ ]', 7: '?.', 8: '{ }', 9: 'λ',
  10: '.map', 11: 'OOP', 12: '<T>', 13: 'let', 14: 'seq', 15: 'try', 16: 'co', 17: '~>',
};

export const QuizView: React.FC<QuizViewProps> = ({ theme, userStats, onStartQuiz, onOpenWorldQuiz }) => {
  const isDark = theme === 'dark';
  const worlds = React.useMemo(() => getQuizWorlds(), []);
  // Read on every render: answering a question in a quiz and coming back must show the new progress.
  const correctIds = new Set(StorageManager.getQuizCorrectIds());
  const newProgress = loadQuestionProgress();

  const highestWorldWithProgress = worlds.reduce((highest, world) => (countCorrect(world, correctIds) > 0 ? Math.max(highest, world.order) : highest), 0);
  const reachedOrder = Math.max(1, (userStats.completedWorlds ?? 0) + 1, highestWorldWithProgress);

  const startQuick = () => {
    soundFX.playClick();
    const session = buildQuickSession(worlds, reachedOrder);
    if (session.length > 0) onStartQuiz(session);
  };

  const startWorld = (world: QuizWorld) => {
    soundFX.playClick();
    if (NEW_QUIZ_BANKS[world.id]) {
      onOpenWorldQuiz(world);
      return;
    }
    const session = buildWorldSession(world, correctIds);
    if (session.length > 0) onStartQuiz(session);
  };

  const surface = isDark ? 'bg-[#151b28]' : 'bg-[#e8eaf0]';
  const title = isDark ? 'text-[#e2e8f0]' : 'text-[#2e3040]';
  const muted = isDark ? 'text-slate-400' : 'text-[#585a68]';
  const accent = isDark ? 'text-indigo-400' : 'text-[#6366f1]';
  const violet = isDark ? 'text-violet-400' : 'text-[#7c3aed]';

  return (
    <div
      className={`min-h-full min-h-screen w-full flex flex-col items-center select-none pb-28 pt-2 px-4 font-['Plus_Jakarta_Sans'] transition-colors duration-300 ${
        isDark ? 'bg-[#0b0f19] text-[#e2e8f0]' : 'bg-[#e8eaf0] text-[#2e3040]'
      }`}
    >
      <div className="w-full max-w-md flex flex-col space-y-5">
        {/* Intro */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h1 className={`font-bold text-[22px] tracking-tight ${title}`}>Test your knowledge</h1>
            <p className={`text-xs mt-0.5 ${muted}`}>Practice Kotlin concepts with quick quizzes.</p>
          </div>
          <div className={`w-10 h-10 rounded-2xl neu-raised flex items-center justify-center ${surface} ${accent}`}>
            <span className="material-symbols-outlined !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
        </div>

        {/* Quick Quiz: a dark editor-style panel */}
        <button
          type="button"
          onClick={startQuick}
          className="relative w-full rounded-2xl text-left overflow-hidden transition-all active:scale-[0.99] bg-[#0d1322] border border-slate-700/60 shadow-lg"
        >
          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#090d17] border-b border-slate-800/70">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <span className="font-mono text-[11px] text-slate-400 ml-2">quick_quiz.kt</span>
            <span className="ml-auto flex items-center gap-1 font-mono text-[11px] font-medium text-[#4ec9b0]/75">
              <span className="material-symbols-outlined !text-[13px]">autorenew</span>
              randomize()
            </span>
          </div>
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[13px] font-semibold leading-snug">
                <span className="text-[#c586c0]">fun </span>
                <span className="text-[#dcdcaa]">quickQuiz</span>
                <span className="text-slate-400">(</span>
                <span className="text-[#9cdcfe]">count</span>
                <span className="text-slate-400">: </span>
                <span className="text-[#4ec9b0]">Int</span>
                <span className="text-slate-400"> = </span>
                <span className="text-[#b5cea8]">{QUIZ_SESSION_SIZE}</span>
                <span className="text-slate-400">)</span>
              </div>
              <p className="font-mono text-[12px] truncate mt-1 text-[#7d8ca4]">{'// a mix of concepts you\'ve learned'}</p>
            </div>
            <div className="w-9 h-9 rounded-lg border border-[#4ec9b0]/50 text-[#4ec9b0] bg-[#4ec9b0]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined !text-[18px]">play_arrow</span>
            </div>
          </div>
        </button>

        {/* Divider: the quick quiz above and the per-World quizzes below are two separate sections */}
        <div className="flex items-center gap-3 pt-2" aria-hidden="true">
          <div className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-400/40'}`} />
          <span className={`font-mono text-[10px] tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{'// worlds'}</span>
          <div className={`h-px flex-1 ${isDark ? 'bg-white/15' : 'bg-slate-400/40'}`} />
        </div>

        {/* Quiz by World */}
        <div className="flex flex-col space-y-3">
          <div className="px-1">
            <h2 className={`font-semibold text-base tracking-tight ${title}`}>Quiz by World</h2>
            <p className={`text-xs ${muted}`}>Choose a World and test what you've learned</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4">
            {worlds.map((world) => {
              // A World with a bank in the new format counts mastered questions; the others count questions answered right once.
              const bank = NEW_QUIZ_BANKS[world.id];
              const bankStats = bank ? worldStats(bank, newProgress) : null;
              const total = bank ? bank.length : world.questions.length;
              const correct = bankStats ? bankStats.mastered : countCorrect(world, correctIds);
              const touched = bankStats ? bankStats.seen > 0 : correct > 0;
              const percent = Math.round((correct / total) * 100);
              const started = touched;
              const done = correct >= total;
              const accent = accentForWorld(world.order);
              const accentText = isDark ? accent.textDark : accent.text;
              const missedCount = bankStats?.missed.length ?? 0;
              return (
                <div key={world.id} className="relative flex flex-col">
                <button
                  type="button"
                  onClick={() => startWorld(world)}
                  className={`flex-1 rounded-xl p-3.5 text-left flex flex-col justify-between active:scale-[0.98] transition-transform border border-l-[3px] ${accent.stripe} ${
                    isDark ? `bg-[#0f1420] ${accent.borderDark} shadow-md shadow-black/30` : 'bg-[#f6f7fa] border-slate-300/70 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono text-[10px] font-bold tracking-wider ${accentText}`}>
                        WORLD_{String(world.order).padStart(2, '0')}
                      </span>
                      {done && (
                        <span className={`material-symbols-outlined !text-[15px] ${accentText}`}>check</span>
                      )}
                    </div>
                    <h3 className={`font-bold text-sm leading-snug line-clamp-1 mb-1.5 ${title}`}>{world.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${accentText} ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-white'}`}>
                        {WORLD_GLYPHS[world.order] ?? '{ }'}
                      </span>
                      <span className={`font-mono text-[11px] ${muted}`}>{total} questions</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[10px] ${muted}`}>progress</span>
                      <span className={`font-mono text-[10px] ${started ? `font-bold ${accentText}` : muted}`}>{percent}%</span>
                    </div>
                    <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-300/70'}`}>
                      <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5">
                      <span className={`font-mono text-[11px] font-semibold flex items-center gap-0.5 ${accentText}`}>
                        {done ? 'review()' : started ? 'continue()' : 'start()'}
                        <span className="material-symbols-outlined !text-[13px]">{done ? 'replay' : 'arrow_forward'}</span>
                      </span>
                    </div>
                  </div>
                </button>
                {missedCount > 0 && (
                  // A sibling of the card button (a button inside a button is invalid), laid over its bottom-right corner.
                  <button
                    type="button"
                    aria-label={`Review ${missedCount} missed questions in ${world.title}`}
                    onClick={() => {
                      soundFX.playClick();
                      onOpenWorldQuiz(world, true);
                    }}
                    className={`absolute right-2.5 bottom-2.5 h-7 px-2 rounded-lg border font-mono text-[11px] font-bold flex items-center gap-1 ${
                      isDark ? 'border-rose-400/50 bg-rose-400/10 text-rose-200' : 'border-rose-300 bg-rose-50 text-rose-700'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[13px]">replay</span>
                    {missedCount}
                  </button>
                )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
