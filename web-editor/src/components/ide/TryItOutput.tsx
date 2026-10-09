import React, { useEffect, useRef } from 'react';
import type { KotlinExecutionResult } from '../../utils/kotlinRunner';

interface TryItOutputProps {
  result: KotlinExecutionResult | null;
  isDark: boolean;
  onClear: () => void;
  onRun: () => void;
}

const ERROR_LABELS: Record<string, string> = {
  syntax_error: 'Syntax error',
  compiler_error: 'Compile error',
  type_mismatch: 'Compile error',
  val_reassignment: 'Compile error',
  unresolved_reference: 'Compile error',
  runtime_error: 'Runtime error',
};

/**
 * The output window shown under the editor (above the keyboard) in "Try it". Shows what the program printed (even when it then failed),
 * the error with its line number, the run time, and Clear. Lines never wrap: a wrapped long line would look like an extra
 * newline, so a long line scrolls sideways instead.
 */
export function TryItOutput({ result, isDark, onClear, onRun }: TryItOutputProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const failed = !!result && !result.success;
  const printed = result?.output ?? '';
  const errorLabel = result?.error ? ERROR_LABELS[result.error.type] ?? 'Error' : 'Error';

  // A new result starts at the top-left, so the first line is what you see.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, left: 0 });
  }, [result]);

  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const muted = isDark ? 'text-slate-500' : 'text-slate-400';
  const iconBtn = `w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-colors ${
    isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
  }`;

  return (
    <section
      aria-live="polite"
      id="try-it-output"
      className={`shrink-0 max-h-[30vh] flex flex-col border-t ${isDark ? 'border-slate-700 bg-[#0a0e17]' : 'border-slate-300 bg-slate-50'}`}
    >
      <div className={`shrink-0 flex items-center gap-1.5 pl-3 sm:pl-4 pr-3 sm:pr-4 h-11 border-b ${border}`}>
        <span
          className={`material-symbols-outlined !text-[16px] ${
            !result ? muted : failed ? 'text-rose-500' : 'text-emerald-500'
          }`}
        >
          {!result ? 'terminal' : failed ? 'error' : 'check_circle'}
        </span>
        <span className={`text-[11px] font-bold uppercase tracking-wider ${failed ? 'text-rose-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {failed ? errorLabel : 'Output'}
        </span>
        {result && (
          <span className={`text-[10px] font-mono ${muted}`}>
            {result.executionTimeMs || 0} ms
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Run code"
            onClick={onRun}
            className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-bold cursor-pointer active:scale-95 transition-all shadow-sm ${
              isDark ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-950/40' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            <span className="material-symbols-outlined !text-[15px]">play_arrow</span>
            <span>Run</span>
          </button>
          {result && (
            <button type="button" aria-label="Clear output" onClick={onClear} className={iconBtn}>
              <span className="material-symbols-outlined !text-[18px]">delete_sweep</span>
            </button>
          )}
        </span>
      </div>

      <div ref={bodyRef} className="flex-1 min-h-[52px] overflow-auto px-3 sm:px-4 pt-2 pb-8 select-text">
        {!result ? (
          <p className={`text-xs font-mono ${muted}`}>Tap Run to see the output here.</p>
        ) : (
          <>
            {printed !== '' && (
              <pre className={`m-0 text-xs leading-relaxed font-mono whitespace-pre ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{printed}</pre>
            )}
            {failed && (
              <div
                className={`${printed !== '' ? 'mt-2' : ''} rounded-md border px-2.5 py-1.5 ${
                  isDark ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {!!result.error?.line && result.error.line > 0 && (
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Line {result.error.line}</div>
                )}
                <pre className="m-0 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words">
                  {result.error?.message || 'The code could not be executed.'}
                </pre>
              </div>
            )}
            {!failed && printed === '' && (
              <p className={`text-xs font-mono italic ${muted}`}>The program finished without printing anything.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
