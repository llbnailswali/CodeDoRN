import React from 'react';
import { renderKotlinCodeLines } from '../../utils/codeHighlighter';

/** How one code line is drawn. */
export type CodeLineState = 'idle' | 'selected' | 'error' | 'wrongPick' | 'diff';

interface QuizCodePanelProps {
  lines: string[];
  fileName?: string;
  /** Draw only the code, without the window chrome (inside the Code comparison cards). */
  compact?: boolean;
  /** Find the error: lines are tappable. */
  onLineClick?: (index: number) => void;
  lineState?: (index: number) => CodeLineState;
  /** A note drawn directly under a line (the explanation of an error, attached to the line it is about). */
  lineNote?: (index: number) => string | null;
  /** Fill in the blank: the line that contains `___` gets a slot; `value` is the chip placed in it. */
  fill?: { value: string | null; state: 'idle' | 'filled' | 'correct' | 'wrong'; onClear?: () => void };
}

const highlight = (text: string) => renderKotlinCodeLines([text], { isDark: true })[0];

/** A dark code panel (always dark, like the editor): file name, line numbers, Kotlin colours, 14px so it can be read at a glance. */
export const QuizCodePanel: React.FC<QuizCodePanelProps> = ({ lines, fileName = 'Main.kt', compact = false, onLineClick, lineState, lineNote, fill }) => {
  const renderLine = (line: string) => {
    if (fill && line.includes('___')) {
      const [left, right] = line.split('___');
      const slotClass =
        fill.state === 'correct'
          ? 'border-emerald-400 bg-emerald-400/20 text-emerald-200'
          : fill.state === 'wrong'
          ? 'border-red-400 bg-red-400/20 text-red-200'
          : fill.state === 'filled'
          ? 'border-indigo-400 bg-indigo-400/20 text-indigo-100'
          : 'border-dashed border-slate-400 bg-white/5 text-slate-500';
      return (
        <span className="inline-flex items-center">
          {left ? highlight(left) : null}
          <button
            type="button"
            aria-label={fill.value ? `Remove ${fill.value} from the blank` : 'Empty blank'}
            onClick={fill.onClear}
            className={`mx-1.5 inline-flex items-center justify-center min-w-[4.25rem] h-8 px-3 rounded-lg border-2 font-mono text-[13px] font-bold transition-colors ${slotClass}`}
          >
            {fill.value ?? ' '}
          </button>
          {right ? highlight(right) : null}
        </span>
      );
    }
    return <span>{highlight(line)}</span>;
  };

  return (
    <div className="w-full rounded-xl border border-slate-700/60 bg-[#0d1322] overflow-hidden text-left">
      {!compact && (
        <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#090d17] border-b border-slate-800/70">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
          <span className="font-mono text-[11px] text-slate-400 ml-2">{fileName}</span>
        </div>
      )}
      <div className="py-2 font-mono text-[13px] leading-relaxed text-slate-100 overflow-x-auto">
        {lines.map((line, idx) => {
          const state = lineState ? lineState(idx) : 'idle';
          const note = lineNote ? lineNote(idx) : null;
          const tappable = Boolean(onLineClick);
          const rowClass =
            state === 'selected'
              ? 'bg-indigo-500/25 border-l-[3px] border-indigo-400'
              : state === 'error'
              ? 'bg-red-500/20 border-l-[3px] border-red-400'
              : state === 'wrongPick'
              ? 'bg-amber-400/10 border-l-[3px] border-amber-400/70'
              : state === 'diff'
              ? 'bg-amber-300/15 border-l-[3px] border-amber-300'
              : 'border-l-[3px] border-transparent';
          const row = (
            <>
              <span className="w-9 shrink-0 select-none text-right pr-3 text-[12px] text-slate-500">{idx + 1}</span>
              <span className="whitespace-pre flex-1 pr-3">{renderLine(line)}</span>
            </>
          );
          return (
            <div key={idx}>
              {tappable ? (
                <button type="button" onClick={() => onLineClick?.(idx)} className={`w-full flex items-center min-h-[3rem] text-left transition-colors hover:bg-white/5 ${rowClass}`}>
                  {row}
                </button>
              ) : (
                <div className={`flex items-center min-h-[1.75rem] ${rowClass}`}>{row}</div>
              )}
              {note && (
                <div className={`flex items-start gap-2 px-3 py-2 ml-9 mr-2 mb-1 rounded-lg font-sans text-[13px] leading-snug ${state === 'error' ? 'bg-red-500/15 text-red-100' : 'bg-white/5 text-slate-300'}`}>
                  <span className="material-symbols-outlined !text-[16px] mt-0.5 shrink-0">error</span>
                  <span>{note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
