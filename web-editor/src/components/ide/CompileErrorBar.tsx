import React from 'react';

/**
 * A compile-time error shown over the bottom of the code (it takes no row of its own) instead of in the run-result dialog, so the
 * learner can read the message while the editor still shows the underlined line. It goes away on the next edit (the result is cleared then).
 */
export function CompileErrorBar({ line, message, isDark, fix }: { line: number; message: string; isDark: boolean; fix?: { label: string; onApply: () => void } | null }) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 px-3 py-2 rounded-lg border shadow-lg text-xs leading-snug ${
        isDark ? 'bg-rose-950/95 border-rose-500/50 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-800'
      }`}
    >
      <span className="material-symbols-outlined !text-[16px] mt-px shrink-0">error</span>
      <div className="min-w-0 max-h-[72px] overflow-y-auto">
        <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5">Line {line}</span>
        <span className="font-mono break-words">{message.replace(/^Compilation error:\s*/, '')}</span>
      </div>
      {fix && (
        <button
          type="button"
          onClick={fix.onApply}
          className={`ml-auto shrink-0 self-center max-w-[45%] rounded-md border px-2 py-1 text-[11px] font-bold leading-tight text-left cursor-pointer active:scale-95 ${
            isDark ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200' : 'border-emerald-500 bg-emerald-50 text-emerald-800'
          }`}
        >
          Apply fix
          <span className="block text-[10px] font-medium opacity-80">{fix.label}</span>
        </button>
      )}
    </div>
  );
}
