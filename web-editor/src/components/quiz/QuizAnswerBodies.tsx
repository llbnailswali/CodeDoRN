import React from 'react';
import { QuizAnswer, QuizQuestion } from '../../utils/quizQuestions';
import { QuizCodePanel, CodeLineState } from './QuizCodePanel';

interface BodyProps {
  question: QuizQuestion;
  value: QuizAnswer;
  onChange: (value: QuizAnswer) => void;
  /** After "Check answer": the choices are locked and show what was right. */
  checked: boolean;
  isDark: boolean;
}

type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed' | 'dim';

/** One answer's state: before checking it is idle or selected; after checking it says whether it was right. */
const choiceState = (checked: boolean, selected: boolean, isRight: boolean): ChoiceState => {
  if (!checked) return selected ? 'selected' : 'idle';
  if (selected && isRight) return 'correct';
  if (selected && !isRight) return 'wrong';
  if (!selected && isRight) return 'missed';
  return 'dim';
};

const surface = (state: ChoiceState, isDark: boolean): string => {
  switch (state) {
    case 'selected':
      return isDark ? 'border-2 border-indigo-400 bg-indigo-500/15' : 'border-2 border-indigo-500 bg-indigo-50';
    case 'correct':
      return isDark ? 'border-2 border-emerald-400 bg-emerald-400/10' : 'border-2 border-emerald-500 bg-emerald-50';
    case 'wrong':
      return isDark ? 'border-2 border-rose-400 bg-rose-400/10' : 'border-2 border-rose-400 bg-rose-50';
    case 'missed':
      return isDark ? 'border-2 border-dashed border-emerald-400/80' : 'border-2 border-dashed border-emerald-500';
    case 'dim':
      return isDark ? 'border border-white/10 bg-[#121826] opacity-45' : 'border border-slate-200 bg-white opacity-55';
    default:
      return isDark ? 'border border-white/15 bg-[#121826] hover:border-white/30' : 'border border-slate-300 bg-white hover:border-slate-400';
  }
};

/** Right / wrong is never colour alone: each state also has an icon and a word. */
const tagFor = (state: ChoiceState): { icon: string; text: string } | null => {
  if (state === 'correct') return { icon: 'check_circle', text: 'Correct' };
  if (state === 'wrong') return { icon: 'cancel', text: 'Your answer' };
  if (state === 'missed') return { icon: 'check_circle', text: 'Correct answer' };
  return null;
};

const Indicator: React.FC<{ state: ChoiceState; multi: boolean }> = ({ state, multi }) => {
  const shape = multi ? 'rounded-md' : 'rounded-full';
  if (state === 'selected')
    return (
      <span className={`w-6 h-6 ${shape} bg-indigo-500 text-white flex items-center justify-center shrink-0`}>
        {multi ? <span className="material-symbols-outlined !text-[16px]">check</span> : <span className="w-2.5 h-2.5 rounded-full bg-white" />}
      </span>
    );
  if (state === 'correct' || state === 'missed')
    return <span className={`w-6 h-6 ${shape} bg-emerald-500 text-white flex items-center justify-center shrink-0`}><span className="material-symbols-outlined !text-[16px]">check</span></span>;
  if (state === 'wrong')
    return <span className={`w-6 h-6 ${shape} bg-rose-500 text-white flex items-center justify-center shrink-0`}><span className="material-symbols-outlined !text-[16px]">close</span></span>;
  return <span className={`w-6 h-6 ${shape} border-2 border-slate-400/70 shrink-0`} />;
};

/**
 * A full-width answer. The indicator sits on the LEFT, where the thumb is, and the whole row is the target (at least 56px tall).
 * `console` draws it as program output (a `>` prompt, monospace) for "what will it print" questions.
 */
const Option: React.FC<{ label: string; mono?: boolean; console?: boolean; state: ChoiceState; multi?: boolean; locked: boolean; isDark: boolean; onClick: () => void }> = ({
  label, mono, console: asConsole, state, multi = false, locked, isDark, onClick,
}) => {
  const tag = tagFor(state);
  return (
    <button
      type="button"
      disabled={locked}
      aria-pressed={state === 'selected' || state === 'correct' || state === 'wrong'}
      onClick={onClick}
      className={`w-full min-h-[3.5rem] rounded-xl px-4 py-3 flex items-center gap-3.5 text-left transition-all active:scale-[0.99] ${surface(state, isDark)}`}
    >
      <Indicator state={state} multi={multi} />
      <span className={`flex-1 min-w-0 break-words whitespace-pre-line ${asConsole ? 'font-mono text-[14px] font-semibold' : mono ? 'font-mono text-[14px] font-semibold' : 'text-[14px] font-medium'} ${isDark ? 'text-slate-100' : 'text-[#222638]'}`}>
        {label}
      </span>
      {tag && (
        <span className={`shrink-0 flex items-center gap-1 text-[12px] font-bold ${state === 'wrong' ? (isDark ? 'text-rose-300' : 'text-rose-600') : isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
          <span className="material-symbols-outlined !text-[16px]">{tag.icon}</span>
          {tag.text}
        </span>
      )}
    </button>
  );
};

export const QuizAnswerBody: React.FC<BodyProps> = ({ question: q, value, onChange, checked, isDark }) => {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
      return (
        <div className="flex flex-col gap-4">
          {q.code && <QuizCodePanel lines={q.code} />}
          <div className="flex flex-col gap-2.5">
            {q.options.map((option, i) => (
              <Option
                key={option}
                label={option}
                mono={q.monoOptions && q.type === 'single_choice'}
                console={q.type === 'predict_output'}
                state={choiceState(checked, value === i, i === q.answer)}
                locked={checked}
                isDark={isDark}
                onClick={() => onChange(i)}
              />
            ))}
          </div>
        </div>
      );

    case 'multi_select': {
      const picked = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((option, i) => (
            <Option
              key={option}
              label={option}
              mono={q.monoOptions}
              multi
              state={choiceState(checked, picked.includes(i), q.answers.includes(i))}
              locked={checked}
              isDark={isDark}
              onClick={() => onChange(picked.includes(i) ? picked.filter((p) => p !== i) : [...picked, i])}
            />
          ))}
        </div>
      );
    }

    case 'fill_blank': {
      const placed = typeof value === 'string' ? value : null;
      const slotState = !checked ? (placed ? 'filled' : 'idle') : placed === q.answer ? 'correct' : 'wrong';
      return (
        <div className="flex flex-col gap-5">
          <QuizCodePanel lines={q.code} fill={{ value: placed, state: slotState, onClear: checked ? undefined : () => onChange(null) }} />
          <div className="flex flex-wrap gap-3">
            {q.chips.map((chip) => {
              const used = placed === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  disabled={checked}
                  onClick={() => onChange(used ? null : chip)}
                  className={`min-w-[5rem] h-12 px-5 rounded-xl font-mono text-[14px] font-bold transition-all active:scale-95 ${
                    used
                      ? isDark ? 'border-2 border-dashed border-white/20 text-transparent' : 'border-2 border-dashed border-slate-300 text-transparent'
                      : isDark ? 'border border-white/20 bg-[#121826] text-slate-100 hover:border-white/40' : 'border border-slate-300 bg-white text-[#222638] hover:border-slate-400'
                  } ${checked && !used ? 'opacity-45' : ''}`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'find_error': {
      const lineState = (i: number): CodeLineState => {
        if (!checked) return value === i ? 'selected' : 'idle';
        if (i === q.errorLine) return 'error';
        if (value === i) return 'wrongPick';
        return 'idle';
      };
      return (
        <QuizCodePanel
          lines={q.code}
          onLineClick={checked ? undefined : (i) => onChange(i)}
          lineState={lineState}
          lineNote={(i) => (checked && i === q.errorLine ? q.errorNote ?? null : null)}
        />
      );
    }

    case 'true_false':
      return (
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((option) => {
            const state = choiceState(checked, value === option, option === q.answer);
            const tag = tagFor(state);
            return (
              <button
                key={String(option)}
                type="button"
                disabled={checked}
                aria-pressed={value === option}
                onClick={() => onChange(option)}
                className={`min-h-[8rem] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${surface(state, isDark)}`}
              >
                <span className={`material-symbols-outlined !text-[28px] ${state === 'correct' || state === 'missed' ? 'text-emerald-500' : state === 'wrong' ? 'text-rose-500' : state === 'selected' ? 'text-indigo-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {option ? 'check_circle' : 'cancel'}
                </span>
                <span className={`font-['Outfit'] text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-[#222638]'}`}>{option ? 'True' : 'False'}</span>
                <span className={`h-4 text-[12px] font-bold ${state === 'wrong' ? 'text-rose-500' : 'text-emerald-600'}`}>{tag?.text ?? ''}</span>
              </button>
            );
          })}
        </div>
      );

    case 'code_comparison': {
      // After checking, the lines that differ between A and B are marked, so the learner sees the one difference that matters.
      const differs = (i: number) => q.a[i] !== q.b[i];
      const lineStateOf = (lines: string[]) => (i: number): CodeLineState => (checked && differs(i) && lines[i] !== undefined ? 'diff' : 'idle');
      return (
        <div className="flex flex-col gap-3">
          {[q.a, q.b].map((lines, i) => {
            const state = choiceState(checked, value === i, i === q.answer);
            const tag = tagFor(state);
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                aria-pressed={value === i}
                onClick={() => onChange(i)}
                className={`w-full rounded-2xl p-3.5 flex flex-col gap-3 text-left transition-all active:scale-[0.99] ${surface(state, isDark)}`}
              >
                <span className="flex items-center gap-3">
                  <Indicator state={state} multi={false} />
                  <span className={`font-['Outfit'] text-[14px] font-semibold flex-1 ${isDark ? 'text-slate-100' : 'text-[#222638]'}`}>Code {i === 0 ? 'A' : 'B'}</span>
                  {tag && (
                    <span className={`flex items-center gap-1 text-[12px] font-bold ${state === 'wrong' ? (isDark ? 'text-rose-300' : 'text-rose-600') : isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <span className="material-symbols-outlined !text-[16px]">{tag.icon}</span>
                      {tag.text}
                    </span>
                  )}
                </span>
                <QuizCodePanel lines={lines} compact lineState={lineStateOf(lines)} />
              </button>
            );
          })}
          {checked && (
            <span className={`flex items-center gap-1.5 text-[13px] ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <span className="inline-block w-3 h-3 rounded-sm bg-amber-300/60 border-l-2 border-amber-400" />
              The highlighted line is the difference
            </span>
          )}
        </div>
      );
    }
  }
};
