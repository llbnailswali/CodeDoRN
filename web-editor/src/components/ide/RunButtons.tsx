import React from 'react';

interface RunButtonsProps {
  isDark: boolean;
  /** Accent for the simulator Run button (Write & Run is indigo, Debug is rose). */
  accent: 'indigo' | 'rose';
  runDisabled?: boolean;
  /** Spread onto the simulator Run button (the long-press shortcut handlers). */
  runHandlers: React.HTMLAttributes<HTMLButtonElement>;
  /** Hide the simulator Run (Try it has its own in the output panel). */
  showRun: boolean;
  /** JetBrains' online Kotlin Playground compiler (real kotlinc, needs internet). */
  onOnlineRun: () => void;
  onlineRunning: boolean;
}

/** The run buttons beside the Copy button: the in-app simulator and JetBrains' online compiler (J, internet). */
export function RunButtons({ isDark, accent, runDisabled, runHandlers, showRun, onOnlineRun, onlineRunning }: RunButtonsProps) {
  return (
    <>
      {showRun && (
        <button
          type="button"
          aria-label="Execute code"
          id="run-btn"
          disabled={runDisabled}
          {...runHandlers}
          className={`w-9 h-9 rounded-lg text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none shadow-lg ${
            accent === 'rose' ? 'bg-[#f43f5e] hover:bg-[#e11d48]' : 'bg-[#6366f1] hover:bg-[#4f46e5]'
          }`}
        >
          {runDisabled ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-label="Testing">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      )}
      <button
        type="button"
        aria-label="Run with JetBrains online Kotlin"
        title="Run with real Kotlin online (JetBrains' Kotlin Playground server; needs internet; display only)"
        disabled={onlineRunning}
        onClick={onOnlineRun}
        className={`relative w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer active:scale-95 transition-colors ${
          isDark ? 'bg-slate-800/90 border-sky-500/60 text-sky-400' : 'bg-white/90 border-sky-500 text-sky-600'
        }`}
      >
        {onlineRunning ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-label="Running online">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <span className="material-symbols-outlined !text-[20px]">play_arrow</span>
        )}
        <span className="absolute -top-1 -right-1 rounded bg-sky-500 px-[3px] text-[8px] font-bold leading-[11px] text-black">J</span>
      </button>
    </>
  );
}
