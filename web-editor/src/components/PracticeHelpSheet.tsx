import React from 'react';
import { createPortal } from 'react-dom';
import { PracticeHelpLevel } from '../utils/storage';

// The `line` of each level states what it really changes in a Write & Run task (see Detail.tsx and WriteRun.tsx): Beginner gets every step in full
// up front; Intermediate and Experienced have the steps hidden and unlock hints one at a time, any time (Intermediate's name the goal and the
// main tools, Experienced's only point in a direction).
export const PRACTICE_HELP_OPTIONS: Array<{ level: PracticeHelpLevel; label: string; line: string }> = [
  { level: 'beginner', label: 'Beginner', line: 'Complete step-by-step guidance shown up front, including what to do and how to approach each step.' },
  { level: 'intermediate', label: 'Intermediate', line: 'Progressive hints shown one at a time, covering the goal, key concepts, and main tools to use.' },
  { level: 'experienced', label: 'Experienced', line: 'Minimal progressive hints shown one at a time, giving only enough direction to help you move forward.' },
];

interface PracticeHelpSheetProps {
  isDark: boolean;
  current: PracticeHelpLevel | null;
  onChoose: (level: PracticeHelpLevel) => void;
  /** Omit for the first-time prompt, which must be answered. */
  onClose?: () => void;
}

// Rendered in a portal on <body> above the bottom tab bar (also z-50, and painted later in the page): inside the page
// the sheet sat UNDER the tabs and its last option ("Experienced") was hidden behind them.
export const PracticeHelpSheet: React.FC<PracticeHelpSheetProps> = ({ isDark, current, onChoose, onClose }) =>
  createPortal(
  <div
    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-label="Practice help"
      className={`w-full sm:max-w-[400px] rounded-t-2xl sm:rounded-2xl border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-3 shadow-2xl ${
        isDark ? 'bg-[#151b28] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold font-['Outfit'] tracking-tight">How much help do you want?</h2>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          This changes the guidance in Write &amp; Run tasks. Debug hints stay the same. You can change it any time.
        </p>
      </div>
      <div className="space-y-2.5 pt-1">
        {PRACTICE_HELP_OPTIONS.map((opt) => {
          const selected = current === opt.level;
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => onChoose(opt.level)}
              className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all active:scale-[0.98] ${
                selected
                  ? isDark
                    ? 'border-indigo-400/60 bg-indigo-500/15'
                    : 'border-indigo-400 bg-indigo-50'
                  : isDark
                  ? 'border-white/10 bg-[#0f1420]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span className="block text-sm font-bold font-['Outfit'] leading-tight">{opt.label}</span>
              <span className={`block mt-1.5 text-xs font-medium leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{opt.line}</span>
            </button>
          );
        })}
      </div>
    </div>
  </div>,
  document.body
);
