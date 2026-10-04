import React from 'react';
import { AppTheme } from '../../types';
import { soundFX } from '../../utils/audio';
import { QuizResult } from './QuizQuestionScreen';

interface Props {
  theme: AppTheme;
  results: QuizResult[];
  xpEarned: number;
  onReview?: () => void;
  onDone: () => void;
}

const headline = (pct: number) =>
  pct === 100 ? 'Perfect run!' : pct >= 70 ? 'Nice work!' : pct >= 40 ? 'Good start' : 'Keep practicing';

export const QuizSessionComplete: React.FC<Props> = ({ theme, results, xpEarned, onReview, onDone }) => {
  const isDark = theme === 'dark';
  const total = results.length;
  const right = results.filter((r) => r === 'correct').length;
  const wrong = total - right;
  const pct = total ? Math.round((right / total) * 100) : 0;
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const title = isDark ? 'text-slate-50' : 'text-[#1c2033]';
  const card = isDark ? 'border-white/10 bg-[#121826]' : 'border-slate-200 bg-white';

  return (
    <div className={`min-h-[100dvh] flex flex-col font-['Plus_Jakarta_Sans'] ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f3f4f8]'}`}>
      <main className="flex-1 px-4 pt-10 pb-6 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className={`font-mono text-[13px] font-bold ${isDark ? 'text-[#4ec9b0]' : 'text-teal-700'}`}>session.complete()</span>
          <h1 className={`font-['Outfit'] text-3xl font-semibold ${title}`}>{headline(pct)}</h1>
        </div>

        <div className="flex flex-col items-center">
          <span className={`font-['Outfit'] text-5xl font-bold tabular-nums ${title}`}>
            {right}
            <span className={`text-2xl ${muted}`}> / {total}</span>
          </span>
          <span className={`text-[15px] font-medium ${muted}`}>questions correct · {pct}%</span>
        </div>

        <div className="w-full flex gap-1.5" aria-label="Result of each question">
          {results.map((r, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full ${r === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          ))}
        </div>

        <div className="w-full grid grid-cols-3 gap-2.5">
          {[
            { label: 'XP earned', value: `+${xpEarned}`, icon: 'bolt', tone: isDark ? 'text-amber-300' : 'text-amber-700' },
            { label: 'Correct', value: String(right), icon: 'check_circle', tone: isDark ? 'text-emerald-300' : 'text-emerald-700' },
            { label: 'To review', value: String(wrong), icon: 'refresh', tone: isDark ? 'text-rose-300' : 'text-rose-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-3 flex flex-col items-center gap-1 ${card}`}>
              <span className={`material-symbols-outlined !text-[22px] ${s.tone}`}>{s.icon}</span>
              <span className={`font-['Outfit'] text-lg font-bold ${title}`}>{s.value}</span>
              <span className={`text-[12px] font-medium ${muted}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {wrong > 0 && (
          <p className={`text-[14px] text-center max-w-xs ${muted}`}>
            {wrong === 1 ? 'One question' : `${wrong} questions`} went wrong. Reviewing them is the fastest way to remember the rule.
          </p>
        )}
      </main>

      <footer className="px-4 pb-6 flex flex-col gap-2.5">
        {wrong > 0 && onReview && (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onReview();
            }}
            className={`h-12 rounded-2xl border-2 font-['Outfit'] text-[15px] font-semibold flex items-center justify-center gap-2 ${
              isDark ? 'border-indigo-400/60 text-indigo-200' : 'border-indigo-500 text-indigo-700'
            }`}
          >
            <span className="material-symbols-outlined !text-[20px]">replay</span>
            Review mistakes
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onDone();
          }}
          className="h-12 rounded-2xl bg-indigo-500 text-white font-['Outfit'] text-[15px] font-semibold shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
        >
          Back to Quiz
        </button>
      </footer>
    </div>
  );
};
