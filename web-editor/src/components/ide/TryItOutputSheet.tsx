import React, { useEffect, useRef, useState } from 'react';
import type { KotlinExecutionResult } from '../../utils/kotlinRunner';

interface TryItOutputSheetProps {
  result: KotlinExecutionResult;
  isDark: boolean;
  onClose: () => void;
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
 * Try it's output, in a bottom sheet that opens after a run. The sheet is as tall as the output, but never shorter than 40% or taller than 80% of the
 * screen: short output sits in a 40% sheet, and it only scrolls inside once it reaches 80%. It shows what the program printed, the error with its line number and which
 * engine ran it. Drag the handle or header down to close it (or tap the X or the dimmed area). Lines never wrap: a wrapped long line would look like an extra newline, so a long line scrolls sideways instead.
 */
export function TryItOutputSheet({ result, isDark, onClose }: TryItOutputSheetProps) {
  const failed = !result.success;
  const printed = result.output ?? '';
  const errorLabel = result.error ? ERROR_LABELS[result.error.type] ?? 'Error' : 'Error';
  const muted = isDark ? 'text-slate-500' : 'text-slate-400';
  const iconBtn = `w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-colors ${
    isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
  }`;

  // Drag to close. The slide-up animation holds its end transform (`forwards`), which would override the drag, so it is dropped once it ends.
  const sheetRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const lastMove = useRef({ y: 0, t: 0 });
  const velocity = useRef(0);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 240);
    return () => clearTimeout(t);
  }, []);

  const closeWithSlide = () => {
    setDragging(false);
    setDragY(sheetRef.current?.offsetHeight ?? window.innerHeight);
    setTimeout(onClose, 180);
  };
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    lastMove.current = { y: e.clientY, t: performance.now() };
    velocity.current = 0;
    setDragging(true);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = now - lastMove.current.t;
    if (dt > 0) velocity.current = (e.clientY - lastMove.current.y) / dt;
    lastMove.current = { y: e.clientY, t: now };
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const onDragEnd = () => {
    if (!dragging) return;
    const height = sheetRef.current?.offsetHeight ?? 400;
    // Close past a third of the sheet's height, or on a quick downward flick; otherwise spring back.
    if (dragY > height / 3 || (velocity.current > 0.5 && dragY > 24)) closeWithSlide();
    else {
      setDragging(false);
      setDragY(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center animate-fadeIn" onClick={onClose}>
      <section
        ref={sheetRef}
        id="try-it-output"
        aria-live="polite"
        onClick={(e) => e.stopPropagation()}
        style={entered ? { transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : 'transform 180ms ease-out' } : undefined}
        className={`${entered ? '' : 'animate-sheetUp '}w-full sm:max-w-[420px] mx-auto rounded-t-2xl border border-b-0 shadow-2xl min-h-[40vh] max-h-[80vh] flex flex-col overflow-hidden ${
          isDark ? 'border-slate-700/80 bg-[#121622] text-slate-100' : 'border-slate-300 bg-white text-slate-900'
        }`}
      >
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'none' }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className={`h-1 w-9 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        </div>

        <div className={`flex items-center gap-1.5 px-4 h-11 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`material-symbols-outlined !text-[16px] ${failed ? 'text-rose-500' : 'text-emerald-500'}`}>{failed ? 'error' : 'check_circle'}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${failed ? 'text-rose-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {failed ? errorLabel : 'Output'}
          </span>
          {result.engine === 'online-kotlin' && (
            <span
              title="The editor could not run this program, so it was checked by real Kotlin online."
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${isDark ? 'border-sky-700/50 text-sky-300 bg-sky-950/60' : 'border-sky-300 text-sky-700 bg-sky-50'}`}
            >
              Real Kotlin (online)
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5">
            <button type="button" aria-label="Close output" onClick={onClose} className={iconBtn}>
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </span>
        </div>
        </div>

        <div
          className={`flex-1 min-h-0 overflow-auto overscroll-contain px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] select-text ${
            isDark ? 'bg-[#070a12]' : 'bg-slate-100'
          }`}
        >
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
              <pre className="m-0 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words">{result.error?.message || 'The code could not be executed.'}</pre>
            </div>
          )}
          {!failed && printed === '' && <p className={`text-xs font-mono italic ${muted}`}>The program finished without printing anything.</p>}
        </div>
      </section>
    </div>
  );
}
