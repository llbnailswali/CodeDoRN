import React, { useState } from 'react';
import { renderVisibleWhitespace } from '../../utils/outputDisplay';
import { soundFX } from '../../utils/audio';

/**
 * The exact expected output, as a small chip floating over the code's bottom-left corner. Tapping it opens a card above it, over the code
 * (it does not push the code down), so the strip no longer takes a row of the screen. Whitespace stays visible and unwrapped
 * (see PITFALLS.md: expected-output panels must use renderVisibleWhitespace and never wrap).
 */
export function ExpectedOutputChip({ expectedOutput, isDark }: { expectedOutput: string; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col-reverse items-start gap-1 max-w-[calc(100vw-100px)]" data-purpose="expected-output-chip">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Hide expected output' : 'Show expected output'}
        onClick={() => {
          soundFX.playClick();
          setOpen((v) => !v);
        }}
        className={`h-7 px-2 rounded-lg border flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-sans cursor-pointer active:scale-95 ${
          isDark ? 'bg-slate-800/90 border-slate-700 text-emerald-400' : 'bg-white/90 border-slate-300 text-emerald-700'
        }`}
      >
        <span className="material-symbols-outlined !text-[14px]">{open ? 'close' : 'output'}</span>
        Expected
      </button>
      {open && (
        <div
          className={`max-w-full max-h-[40vh] overflow-auto rounded-lg border px-3 py-2 shadow-lg text-[11px] font-mono font-bold whitespace-nowrap ${
            isDark ? 'bg-[#0a0e17] border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
          }`}
        >
          {renderVisibleWhitespace(expectedOutput)}
        </div>
      )}
    </div>
  );
}
