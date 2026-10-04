import React from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BW, Icon, MAIN, fz } from './shell';
import { accentFor, hexAlpha, lh } from './parts';
import { QuizAnswer, QuizQuestion, correctAnswerText, gradeQuizAnswer, hasAnswer } from './quizQuestions';
import { SAMPLE_QUIZ } from './quizSample';
import { ShadowStack } from './shadows';
import { FONT, Palette } from './theme';

// The screen a Quiz card opens (web: src/components/quiz/QuizSession.tsx, QuizQuestionScreen.tsx, QuizAnswerBodies.tsx, QuizCodePanel.tsx
// and QuizSessionComplete.tsx): one question at a time, then a result screen. It really plays: pick an answer, "Check answer", read the
// explanation, "Next". UI only: nothing is saved, and every World plays the same 12 sample questions (only World 1 has a bank so far).

type Result = 'correct' | 'wrong';

const WAITING_LABEL: Record<QuizQuestion['type'], string> = {
  single_choice: 'Choose an answer',
  multi_select: 'Select your answers',
  fill_blank: 'Fill in the blank',
  predict_output: 'Choose an answer',
  find_error: 'Tap a line',
  true_false: 'Choose true or false',
  code_comparison: 'Choose a code',
};

// ---------------------------------------------------------------------------------------------------------------------
// Kotlin colouring (web: src/utils/codeHighlighter.tsx, dark colours: the code panels are always dark)
// ---------------------------------------------------------------------------------------------------------------------

const KEYWORDS = new Set(['val', 'var', 'fun', 'class', 'when', 'if', 'else', 'for', 'in', 'downTo', 'step', 'until', 'return']);
const LITERALS = new Set(['true', 'false', 'null']);
const TYPES = new Set(['Int', 'String', 'Boolean', 'Double', 'Unit', 'Float', 'List', 'Set', 'Map']);
const BUILTIN_CALLS = new Set(['println', 'print', 'listOf', 'mutableListOf']);
const TOKEN = /(\/\/.*$)|("[^"]*")|('(?:\\.|[^'\\])*')|(\d[\d_]*(?:\.[\d_]+)?[fFdDL]?)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_])/g;

function Kotlin({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  let i = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    const [tok, comment, str, chr, num, ident] = m;
    let style: object = { color: '#E2E8F0' };
    if (comment) style = { color: '#64748B', fontStyle: 'italic' };
    else if (str || chr) style = { color: '#6EE7B7' };
    else if (num) style = { color: '#FCD34D' };
    else if (ident) {
      const rest = text.slice(m.index + tok.length).trimStart();
      if (KEYWORDS.has(ident)) style = { color: '#C084FC', fontFamily: FONT.mono.b };
      else if (LITERALS.has(ident)) style = { color: '#FBBF24', fontFamily: FONT.mono.b };
      else if (TYPES.has(ident)) style = { color: '#A5B4FC', fontFamily: FONT.mono.sb };
      else if (BUILTIN_CALLS.has(ident) || rest.startsWith('(')) style = { color: '#22D3EE', fontFamily: FONT.mono.md };
    } else if (!/^\s+$/.test(tok)) style = { color: '#94A3B8' };
    parts.push(
      <Text key={i++} style={style}>
        {tok}
      </Text>
    );
  }
  return <>{parts}</>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Code panel
// ---------------------------------------------------------------------------------------------------------------------

type CodeLineState = 'idle' | 'selected' | 'error' | 'wrongPick' | 'diff';

const LINE_STYLE: Record<CodeLineState, { backgroundColor: string; borderLeftColor: string }> = {
  idle: { backgroundColor: 'transparent', borderLeftColor: 'transparent' },
  selected: { backgroundColor: 'rgba(99,102,241,0.25)', borderLeftColor: '#818CF8' },
  error: { backgroundColor: 'rgba(239,68,68,0.20)', borderLeftColor: '#F87171' },
  wrongPick: { backgroundColor: 'rgba(251,191,36,0.10)', borderLeftColor: 'rgba(251,191,36,0.7)' },
  diff: { backgroundColor: 'rgba(252,211,77,0.15)', borderLeftColor: '#FCD34D' },
};

/**
 * A question sentence in which text between backticks is code or an exact output (for example "prints `Total: 5` on ONE line"). Those parts are
 * drawn as small rounded chips in the editor colour and the monospace code font, so the learner can tell what is quoted from what is being
 * asked. React Native cannot round the background of text inside a sentence, so the sentence is laid out as wrapping words and chips. A
 * collapsed row (numberOfLines) keeps the code in the code font without a box, because that layout cannot be clamped to lines.
 */
function RichText({ text, style, dark, numberOfLines }: { text: string; style: object; dark: boolean; numberOfLines?: number }) {
  const parts = text.replace(/\s+/g, ' ').trim().split('`');
  const base = StyleSheet.flatten(style) as { fontSize?: number; lineHeight?: number };
  const codeSize = (base.fontSize ?? 15) * 0.88;
  if (numberOfLines) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <Text key={i} style={{ fontFamily: FONT.mono.sb, color: dark ? '#A5B4FC' : '#4338CA' }}>
              {part}
            </Text>
          ) : (
            part
          ),
        )}
      </Text>
    );
  }
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      {parts.flatMap((part, i) => {
        if (i % 2 === 1) {
          const spaceAfter = /^\s/.test(parts[i + 1] ?? '');
          return [
            <View key={`c${i}`} style={{ backgroundColor: dark ? '#0D1322' : '#EEF2FF', borderRadius: 7, borderWidth: 1, borderColor: dark ? 'rgba(129,140,248,0.35)' : '#C7D2FE', paddingHorizontal: 8, paddingVertical: 2, marginRight: spaceAfter ? 5 : 0, marginVertical: 1 }}>
              <Text style={{ fontFamily: FONT.mono.sb, fontSize: codeSize, lineHeight: (base.lineHeight ?? codeSize * 1.4) * 0.9, color: dark ? '#E2E8F0' : '#4338CA', includeFontPadding: false }}>{part}</Text>
            </View>,
          ];
        }
        return part
          .split(' ')
          .filter((word) => word !== '')
          .map((word, j, words) => (
            <Text key={`w${i}-${j}`} style={style}>
              {word + (j < words.length - 1 || /\s$/.test(part) ? ' ' : '')}
            </Text>
          ));
      })}
    </View>
  );
}

/** An explanation: one short paragraph per sentence (easier to scan than a wall of text), with `code` parts drawn as chips. */
function ExplainText({ text, style, dark }: { text: string; style: object; dark: boolean }) {
  const sentences = text.trim().split(/(?<=[.!?])\s+(?=[A-Z`])/);
  return (
    <View style={{ gap: 6 }}>
      {sentences.map((sentence, i) => (
        <RichText key={i} text={sentence} style={style} dark={dark} />
      ))}
    </View>
  );
}

function CodePanel({
  lines, fileName = 'Main.kt', compact, onLineClick, lineState, lineNote, fill,
}: {
  lines: string[];
  fileName?: string;
  compact?: boolean;
  onLineClick?: (i: number) => void;
  lineState?: (i: number) => CodeLineState;
  lineNote?: (i: number) => string | null;
  fill?: { value: string | null; state: 'idle' | 'filled' | 'correct' | 'wrong'; onClear?: () => void };
}) {
  const renderLine = (line: string) => {
    if (fill && line.includes('___')) {
      const [left, right] = line.split('___');
      const slot =
        fill.state === 'correct'
          ? { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.2)', color: '#A7F3D0', borderStyle: 'solid' as const }
          : fill.state === 'wrong'
          ? { borderColor: '#F87171', backgroundColor: 'rgba(248,113,113,0.2)', color: '#FECACA', borderStyle: 'solid' as const }
          : fill.state === 'filled'
          ? { borderColor: '#818CF8', backgroundColor: 'rgba(129,140,248,0.2)', color: '#E0E7FF', borderStyle: 'solid' as const }
          : { borderColor: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748B', borderStyle: 'dashed' as const };
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          {!!left && (
            <Text style={s.codeText}>
              <Kotlin text={left} />
            </Text>
          )}
          <Pressable onPress={fill.onClear} style={[s.slot, { borderColor: slot.borderColor, backgroundColor: slot.backgroundColor, borderStyle: slot.borderStyle }]}>
            <Text style={[s.slotText, { color: slot.color }]}>{fill.value ?? ' '}</Text>
          </Pressable>
          {!!right && (
            <Text style={s.codeText}>
              <Kotlin text={right} />
            </Text>
          )}
        </View>
      );
    }
    return (
      <Text style={s.codeText}>
        <Kotlin text={line} />
      </Text>
    );
  };

  return (
    <View style={s.codePanel}>
      {!compact && (
        <View style={s.codeBar}>
          <View style={[s.dot, { backgroundColor: 'rgba(248,113,113,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(251,191,36,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(52,211,153,0.8)' }]} />
          <Text style={[s.mono11, { color: '#94A3B8', marginLeft: 8 }]}>{fileName}</Text>
        </View>
      )}
      <View style={{ paddingVertical: 8 }}>
        {lines.map((line, idx) => {
          const state = lineState ? lineState(idx) : 'idle';
          const note = lineNote ? lineNote(idx) : null;
          const tappable = !!onLineClick;
          const row = (
            <View
              style={[
                s.codeRow,
                { minHeight: tappable ? 48 : 28 },
                // Tappable lines read as separate rows: a tint, a thin divider and a tap circle on the right.
                tappable && state === 'idle' && { backgroundColor: 'rgba(255,255,255,0.04)' },
                tappable && idx < lines.length - 1 && { borderBottomWidth: BW, borderBottomColor: 'rgba(148,163,184,0.22)' },
                LINE_STYLE[state],
              ]}
            >
              <Text style={s.gutter}>{idx + 1}</Text>
              <View style={{ flex: 1, paddingRight: 8 }}>{renderLine(line)}</View>
              {tappable && (
                <View style={[s.tapCircle, state === 'selected' && { backgroundColor: '#6366F1', borderColor: '#6366F1' }]} />
              )}
            </View>
          );
          return (
            <View key={idx}>
              {tappable ? <Pressable onPress={() => onLineClick?.(idx)}>{row}</Pressable> : row}
              {!!note && (
                <View style={[s.note, state === 'error' ? { backgroundColor: 'rgba(239,68,68,0.15)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Icon name="error" size={16} exact color={state === 'error' ? '#FEE2E2' : '#CBD5E1'} />
                  <Text style={[s.noteText, { color: state === 'error' ? '#FEE2E2' : '#CBD5E1' }]}>{note}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------------------------------------------------

type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed' | 'dim';

const choiceState = (checked: boolean, selected: boolean, isRight: boolean): ChoiceState => {
  if (!checked) return selected ? 'selected' : 'idle';
  if (selected && isRight) return 'correct';
  if (selected && !isRight) return 'wrong';
  if (!selected && isRight) return 'missed';
  return 'dim';
};

const TWO = 1.82; // CSS 2px border on this phone (5 device px)

const surface = (state: ChoiceState, dark: boolean) => {
  switch (state) {
    case 'selected':
      return dark ? { borderWidth: TWO, borderColor: '#818CF8', backgroundColor: 'rgba(99,102,241,0.15)' } : { borderWidth: TWO, borderColor: '#6366F1', backgroundColor: '#EEF2FF' };
    case 'correct':
      return dark ? { borderWidth: TWO, borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.10)' } : { borderWidth: TWO, borderColor: '#10B981', backgroundColor: '#ECFDF5' };
    case 'wrong':
      return dark ? { borderWidth: TWO, borderColor: '#FB7185', backgroundColor: 'rgba(251,113,133,0.10)' } : { borderWidth: TWO, borderColor: '#FB7185', backgroundColor: '#FFF1F2' };
    case 'missed':
      return dark
        ? { borderWidth: TWO, borderColor: 'rgba(52,211,153,0.8)', borderStyle: 'dashed' as const, backgroundColor: 'transparent' }
        : { borderWidth: TWO, borderColor: '#10B981', borderStyle: 'dashed' as const, backgroundColor: 'transparent' };
    case 'dim':
      return dark
        ? { borderWidth: BW, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: '#121826', opacity: 0.45 }
        : { borderWidth: BW, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', opacity: 0.55 };
    default:
      return dark ? { borderWidth: BW, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#121826' } : { borderWidth: BW, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' };
  }
};

const tagFor = (state: ChoiceState): { icon: string; text: string } | null =>
  state === 'correct' ? { icon: 'check_circle', text: 'Correct' } : state === 'wrong' ? { icon: 'cancel', text: 'Your answer' } : state === 'missed' ? { icon: 'check_circle', text: 'Correct answer' } : null;

function Indicator({ state, multi, compact }: { state: ChoiceState; multi: boolean; compact?: boolean }) {
  const size = compact ? { width: 18, height: 18 } : null;
  const shape = { borderRadius: multi ? (compact ? 5 : 6) : compact ? 9 : 12, ...size };
  if (state === 'selected')
    return (
      <View style={[s.indicator, shape, { backgroundColor: '#6366F1' }]}>
        {multi ? <Icon name="check" size={16} exact color="#FFFFFF" /> : <View style={s.indicatorDot} />}
      </View>
    );
  if (state === 'correct' || state === 'missed')
    return (
      <View style={[s.indicator, shape, { backgroundColor: '#10B981' }]}>
        <Icon name="check" size={16} exact color="#FFFFFF" />
      </View>
    );
  if (state === 'wrong')
    return (
      <View style={[s.indicator, shape, { backgroundColor: '#F43F5E' }]}>
        <Icon name="close" size={16} exact color="#FFFFFF" />
      </View>
    );
  return <View style={[s.indicator, shape, { borderWidth: TWO, borderColor: 'rgba(148,163,184,0.7)' }]} />;
}

function tagColor(state: ChoiceState, dark: boolean) {
  return state === 'wrong' ? (dark ? '#FDA4AF' : '#E11D48') : dark ? '#6EE7B7' : '#047857';
}

function Option({
  label, mono, multi = false, state, locked, dark, onPress, compact = false,
}: { label: string; mono?: boolean; multi?: boolean; state: ChoiceState; locked: boolean; dark: boolean; onPress: () => void; /** A trimmed-down row (smaller height and text), used where many options are listed, such as the review. */ compact?: boolean }) {
  const full = tagFor(state);
  const tag = full && compact ? { ...full, text: state === 'wrong' ? 'Your pick' : 'Correct' } : full;
  return (
    <Pressable disabled={locked} onPress={onPress} style={[s.option, compact && s.optionCompact, surface(state, dark)]}>
      <Indicator state={state} multi={multi} compact={compact} />
      <Text style={[mono ? s.optionMono : s.optionText, compact && s.optionTextCompact, { color: dark ? '#F1F5F9' : '#222638' }]}>{label}</Text>
      {tag && (
        <View style={s.tag}>
          <Icon name={tag.icon} size={compact ? 13 : 16} exact color={tagColor(state, dark)} />
          <Text style={[s.tagText, compact && s.tagTextCompact, { color: tagColor(state, dark) }]}>{tag.text}</Text>
        </View>
      )}
    </Pressable>
  );
}

function AnswerBody({ q, value, onChange, checked, dark }: { q: QuizQuestion; value: QuizAnswer; onChange: (v: QuizAnswer) => void; checked: boolean; dark: boolean }) {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
      return (
        <View style={{ gap: 16 }}>
          {q.code && <CodePanel lines={q.code} />}
          <View style={{ gap: 8 }}>
            {q.options.map((option, i) => (
              <Option
                key={option + i}
                label={option}
                mono={q.type === 'predict_output' || (q.monoOptions && q.type === 'single_choice')}
                state={choiceState(checked, value === i, i === q.answer)}
                locked={checked}
                dark={dark}
                onPress={() => onChange(i)}
                compact
              />
            ))}
          </View>
        </View>
      );
    case 'multi_select': {
      const picked = Array.isArray(value) ? value : [];
      return (
        <View style={{ gap: 8 }}>
          {q.options.map((option, i) => (
            <Option
              key={option + i}
              label={option}
              mono={q.monoOptions}
              multi
              state={choiceState(checked, picked.includes(i), q.answers.includes(i))}
              locked={checked}
              dark={dark}
              onPress={() => onChange(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i])}
              compact
            />
          ))}
        </View>
      );
    }
    case 'fill_blank': {
      const placed = typeof value === 'string' ? value : null;
      const slotState = !checked ? (placed ? 'filled' : 'idle') : placed === q.answer ? 'correct' : 'wrong';
      return (
        <View style={{ gap: 20 }}>
          <CodePanel lines={q.code} fill={{ value: placed, state: slotState, onClear: checked ? undefined : () => onChange(null) }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {q.chips.map((chip) => {
              const used = placed === chip;
              return (
                <Pressable
                  key={chip}
                  disabled={checked}
                  onPress={() => onChange(used ? null : chip)}
                  style={[
                    s.chip,
                    used
                      ? { borderWidth: TWO, borderStyle: 'dashed', borderColor: dark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }
                      : dark
                      ? { borderWidth: BW, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: '#121826' }
                      : { borderWidth: BW, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
                    checked && !used && { opacity: 0.45 },
                  ]}
                >
                  <Text style={[s.chipText, { color: used ? 'transparent' : dark ? '#F1F5F9' : '#222638' }]}>{chip}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
        <View style={{ gap: 10 }}>
        {!checked && (
          <Text style={[s.tapInstruction, { color: dark ? '#A5B4FC' : '#4338CA' }]}>Tap the one line with the error · {q.code.length} lines</Text>
        )}
        <CodePanel
          lines={q.code}
          onLineClick={checked ? undefined : (i) => onChange(i)}
          lineState={lineState}
          lineNote={(i) => (checked && i === q.errorLine ? q.errorNote ?? null : null)}
        />
        </View>
      );
    }
    case 'true_false':
      return (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[true, false].map((option) => {
            const state = choiceState(checked, value === option, option === q.answer);
            const tag = tagFor(state);
            const iconColor =
              state === 'correct' || state === 'missed' ? '#10B981' : state === 'wrong' ? '#F43F5E' : state === 'selected' ? '#6366F1' : dark ? '#94A3B8' : '#64748B';
            return (
              <Pressable key={String(option)} disabled={checked} onPress={() => onChange(option)} style={[s.tfCard, surface(state, dark)]}>
                <Icon name={option ? 'check_circle' : 'cancel'} size={28} exact color={iconColor} />
                <Text style={[s.tfLabel, { color: dark ? '#F1F5F9' : '#222638' }]}>{option ? 'True' : 'False'}</Text>
                <Text style={[s.tfTag, { color: state === 'wrong' ? '#F43F5E' : '#059669' }]}>{tag?.text ?? ' '}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    case 'code_comparison': {
      const differs = (i: number) => q.a[i] !== q.b[i];
      const stateOf = (lines: string[]) => (i: number): CodeLineState => (checked && differs(i) && lines[i] !== undefined ? 'diff' : 'idle');
      return (
        <View style={{ gap: 12 }}>
          {[q.a, q.b].map((lines, i) => {
            const state = choiceState(checked, value === i, i === q.answer);
            const tag = tagFor(state);
            return (
              <Pressable key={i} disabled={checked} onPress={() => onChange(i)} style={[s.cmpCard, surface(state, dark)]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Indicator state={state} multi={false} />
                  <Text style={[s.cmpTitle, { color: dark ? '#F1F5F9' : '#222638' }]}>Code {i === 0 ? 'A' : 'B'}</Text>
                  {tag && (
                    <View style={s.tag}>
                      <Icon name={tag.icon} size={16} exact color={tagColor(state, dark)} />
                      <Text style={[s.tagText, { color: tagColor(state, dark) }]}>{tag.text}</Text>
                    </View>
                  )}
                </View>
                <CodePanel lines={lines} compact lineState={stateOf(lines)} />
              </Pressable>
            );
          })}
          {checked && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'rgba(252,211,77,0.6)', borderLeftWidth: 2, borderLeftColor: '#FBBF24' }} />
              <Text style={[s.body13, { color: dark ? '#FDE68A' : '#92400E' }]}>The highlighted line is the difference</Text>
            </View>
          )}
        </View>
      );
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// One question
// ---------------------------------------------------------------------------------------------------------------------

function QuestionScreen({
  p, q, step, total, world, label, topInset, onClose, onContinue,
}: {
  p: Palette;
  q: QuizQuestion;
  step: number;
  total: number;
  world?: { order: number; title: string };
  /** What this quiz is, shown in the toolbar instead of the World's name: a set's title, "Full quiz", "Review mistakes", "Quick quiz". */
  label?: string;
  topInset: number;
  onClose: () => void;
  onContinue: (correct: boolean, answer: QuizAnswer) => void;
}) {
  const dark = p.isDark;
  const [value, setValue] = React.useState<QuizAnswer>(null);
  const [checked, setChecked] = React.useState(false);
  const [hintOpen, setHintOpen] = React.useState(false);
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const scrollRef = React.useRef<ScrollView>(null);

  const answered = hasAnswer(value);
  const correct = checked && gradeQuizAnswer(q, value);
  const isLast = step >= total;
  const bg = dark ? '#0B0F19' : '#F3F4F8';
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  const progress = (step - 1 + (checked ? 1 : 0)) / total;

  const check = () => {
    if (!answered || checked) return;
    setChecked(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  // A question answered with a single tap (choose an option, true/false, A or B, tap a line, tap a chip) is checked the moment it is tapped,
  // which saves a separate "Check answer" tap. Multi-select keeps its Check button: the learner ticks several options and decides when done.
  const checksOnTap = q.type !== 'multi_select';
  const changeAnswer = (next: QuizAnswer) => {
    if (checked) return;
    setValue(next);
    if (checksOnTap && hasAnswer(next)) {
      setChecked(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const requestClose = () => (step > 1 || answered ? setConfirmLeave(true) : onClose());

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (confirmLeave) {
        setConfirmLeave(false);
      } else {
        requestClose();
      }
      return true;
    });
    return () => subscription.remove();
  }, [confirmLeave, step, answered]);

  const accent = world ? accentFor(world.order) : null;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingTop: topInset, backgroundColor: bg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: dark ? 0.28 : 0.14, shadowRadius: 3, zIndex: 10 }}>
        <View style={s.header}>
          <Pressable onPress={requestClose} style={[s.closeBtn, dark ? { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#121826' } : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }]}>
            <Icon name="close" size={20} exact color={dark ? '#E2E8F0' : '#334155'} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            {(world || label) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {world && accent && <Text style={[s.worldTag, { color: dark ? accent[0] : accent[1] }]}>W{world.order}</Text>}
                <Text numberOfLines={1} style={[s.worldTitle, { color: title }]}>{label ?? world?.title}</Text>
              </View>
            )}
            <View style={[s.progressTrack, { backgroundColor: dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]}>
              <View style={{ height: 4, width: `${progress * 100}%`, borderRadius: 2, backgroundColor: '#6366F1' }} />
            </View>
          </View>
          <Text style={[s.count, { color: title }]}>
            {step}
            <Text style={{ color: muted }}> / {total}</Text>
          </Text>
        </View>
      </View>

      {/* Sticky, full width: the concept and level stay in view while the question scrolls, and read as a label apart from the question. */}
      <View style={[s.conceptRow, { backgroundColor: dark ? '#121826' : '#EEF1F7', borderBottomColor: dark ? 'rgba(255,255,255,0.10)' : '#DDE3EE' }]}>
        <Text numberOfLines={1} style={[s.concept, { color: muted, flexShrink: 1 }]}>Concept · {q.topic}</Text>
        <View style={s.badgeRow}>
        {q.type === 'multi_select' && (
          <View style={[s.diffPill, { backgroundColor: dark ? 'rgba(99,102,241,0.25)' : '#E0E7FF' }]}>
            <Text style={[s.diffText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>Multiple</Text>
          </View>
        )}
        {(() => {
          // The level is its own badge, coloured by difficulty, apart from the concept text.
          const tone = q.difficulty === 'easy'
            ? { bg: dark ? 'rgba(16,185,129,0.18)' : '#D1FAE5', fg: dark ? '#6EE7B7' : '#047857' }
            : q.difficulty === 'hard'
            ? { bg: dark ? 'rgba(244,63,94,0.18)' : '#FFE4E6', fg: dark ? '#FDA4AF' : '#BE123C' }
            : { bg: dark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', fg: dark ? '#FCD34D' : '#B45309' };
          return (
            <View style={[s.diffPill, { backgroundColor: tone.bg }]}>
              <Text style={[s.diffText, { color: tone.fg }]}>{q.difficulty}</Text>
            </View>
          );
        })()}
        </View>
      </View>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}>
        <View style={{ gap: 12 }}>
          <RichText text={q.question} style={[s.question, { color: title }]} dark={dark} />
          {q.type === 'multi_select' && (
            <View style={[s.selectedPill, { backgroundColor: dark ? 'rgba(99,102,241,0.2)' : '#E0E7FF' }]}>
              <Text style={[s.selectedText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>
                Select all that apply{Array.isArray(value) && value.length > 0 ? ` · ${value.length} selected` : ''}
              </Text>
            </View>
          )}
        </View>

        <AnswerBody q={q} value={value} onChange={changeAnswer} checked={checked} dark={dark} />

        {!checked && !!q.hint && (
          <View style={{ flexDirection: 'row' }}>
            {hintOpen ? (
              <View
                style={[
                  s.hintBox,
                  dark ? { borderColor: 'rgba(252,211,77,0.3)', backgroundColor: 'rgba(252,211,77,0.1)' } : { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },
                ]}
              >
                <Icon name="lightbulb" size={18} exact color={dark ? '#FEF3C7' : '#78350F'} />
                <Text style={[s.hintText, { color: dark ? '#FEF3C7' : '#78350F' }]}>{q.hint}</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setHintOpen(true)}
                style={[
                  s.hintBtn,
                  dark ? { borderColor: 'rgba(129,140,248,0.4)', backgroundColor: 'rgba(129,140,248,0.1)' } : { borderColor: '#A5B4FC', backgroundColor: '#EEF2FF' },
                ]}
              >
                <Icon name="lightbulb" size={18} exact color={dark ? '#C7D2FE' : '#4338CA'} />
                <Text style={[s.hintBtnText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>Need a hint?</Text>
              </Pressable>
            )}
          </View>
        )}

        {checked && (
          <View
            style={[
              s.feedback,
              correct
                ? dark ? { borderColor: 'rgba(52,211,153,0.7)', backgroundColor: 'rgba(52,211,153,0.10)' } : { borderColor: '#10B981', backgroundColor: '#ECFDF5' }
                : dark ? { borderColor: 'rgba(251,113,133,0.7)', backgroundColor: 'rgba(251,113,133,0.10)' } : { borderColor: '#FB7185', backgroundColor: '#FFF1F2' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name={correct ? 'check_circle' : 'cancel'} size={18} exact filled color={correct ? '#10B981' : '#F43F5E'} />
              <Text style={[s.feedbackTitle, { color: correct ? (dark ? '#A7F3D0' : '#065F46') : dark ? '#FECDD3' : '#9F1239' }]}>{correct ? 'Correct!' : 'Not quite'}</Text>
            </View>
            {!correct && (
              <Text style={[s.body13, { color: dark ? '#E2E8F0' : '#334155' }]}>
                <Text style={{ fontFamily: FONT.outfit.sb }}>Correct answer: </Text>
                <Text style={{ fontFamily: FONT.mono.b }}>{correctAnswerText(q)}</Text>
              </Text>
            )}
            <ExplainText text={q.explanation} style={[s.explain, { color: dark ? '#E2E8F0' : '#334155' }]} dark={dark} />
            <Text style={[s.conceptLine, { color: muted }]}>Concept: {q.topic}</Text>
          </View>
        )}
      </ScrollView>

      {/* The one main action, in the thumb zone */}
      <View style={{ backgroundColor: bg }}>
        <Svg width="100%" height={24} style={{ position: 'absolute', left: 0, right: 0, top: -24 }} pointerEvents="none">
          <Defs>
            <LinearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={bg} stopOpacity="0" />
              <Stop offset="1" stopColor={bg} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeUp)" />
        </Svg>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}>
          {__DEV__ && (
            <View style={s.debugRow}>
              <Text style={[s.debugLabel, { color: muted }]}>DEBUG</Text>
              <Pressable onPress={() => onContinue(true, value)} style={[s.debugBtn, { borderColor: '#10B981', backgroundColor: dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5' }]}>
                <Text style={[s.debugBtnText, { color: dark ? '#6EE7B7' : '#047857' }]}>Pass</Text>
              </Pressable>
              <Pressable onPress={() => onContinue(false, value)} style={[s.debugBtn, { borderColor: '#F43F5E', backgroundColor: dark ? 'rgba(244,63,94,0.12)' : '#FFF1F2' }]}>
                <Text style={[s.debugBtnText, { color: dark ? '#FDA4AF' : '#BE123C' }]}>Fail</Text>
              </Pressable>
            </View>
          )}
          {answered || checked ? <ShadowStack r={16} shadows={[{ dy: 6, blur: 20, rgb: '99,102,241', alpha: 0.35 }]} /> : null}
          <Pressable
            disabled={!checked && !answered}
            onPress={() => (checked ? onContinue(correct, value) : check())}
            style={[s.mainBtn, !checked && !answered ? { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' } : { backgroundColor: '#6366F1' }]}
          >
            <Text style={[s.mainBtnText, { color: !checked && !answered ? (dark ? '#64748B' : '#94A3B8') : '#FFFFFF' }]}>
              {checked ? (isLast ? 'Finish' : 'Next') : answered ? 'Check answer' : WAITING_LABEL[q.type]}
            </Text>
            {(checked || answered) && <Icon name={checked ? 'arrow_forward' : 'check'} size={20} exact color="#FFFFFF" />}
          </Pressable>
        </View>
      </View>

      {confirmLeave && (
        <Pressable style={s.leaveOverlay} onPress={() => setConfirmLeave(false)}>
          <Pressable style={[s.leaveCard, dark ? { backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.10)', borderWidth: BW } : { backgroundColor: '#FFFFFF' }]} onPress={() => {}}>
            <Text style={[s.leaveTitle, { color: title }]}>Leave this quiz?</Text>
            <Text style={[s.body13, { color: muted }]}>Your answers in this session will not be saved.</Text>
            <Pressable onPress={() => setConfirmLeave(false)} style={[s.leaveBtn, { backgroundColor: '#6366F1' }]}>
              <Text style={[s.leaveBtnText, { color: '#FFFFFF' }]}>Keep going</Text>
            </Pressable>
            <Pressable onPress={onClose} style={[s.leaveBtn, { borderWidth: BW, borderColor: dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]}>
              <Text style={[s.leaveBtnText, { color: dark ? '#E2E8F0' : '#334155' }]}>Leave</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Result screen
// ---------------------------------------------------------------------------------------------------------------------

const headline = (pct: number) => (pct === 100 ? 'Perfect run!' : pct >= 70 ? 'Nice work!' : pct >= 40 ? 'Good start' : 'Keep practicing');

/** What the learner answered, as text, for question types that are not shown as a list of options. */
const yourAnswerText = (q: QuizQuestion, answer: QuizAnswer): string | null => {
  if (answer === null || answer === undefined) return null;
  if (q.type === 'fill_blank' && typeof answer === 'string') return answer;
  if (q.type === 'find_error' && typeof answer === 'number') return `line ${answer + 1}`;
  if (q.type === 'code_comparison' && typeof answer === 'number') return answer === 0 ? 'Code A' : 'Code B';
  return null;
};

/** All the choices of a missed question, with the learner's pick and the correct answer marked, so the mistake is easy to remember. */
function ReviewChoices({ q, answer, dark }: { q: QuizQuestion; answer: QuizAnswer; dark: boolean }) {
  const noop = () => {};
  if (q.type === 'true_false') {
    return (
      <View style={{ gap: 6 }}>
        {[true, false].map((option) => (
          <Option key={String(option)} label={option ? 'True' : 'False'} state={choiceState(true, answer === option, option === q.answer)} locked dark={dark} onPress={noop} compact />
        ))}
      </View>
    );
  }
  if (q.type === 'multi_select') {
    const picked = Array.isArray(answer) ? answer : [];
    return (
      <View style={{ gap: 6 }}>
        {q.options.map((option, i) => (
          <Option key={option + i} label={option} mono={q.monoOptions} multi state={choiceState(true, picked.includes(i), q.answers.includes(i))} locked dark={dark} onPress={noop} compact />
        ))}
      </View>
    );
  }
  if (q.type === 'single_choice' || q.type === 'predict_output') {
    return (
      <View style={{ gap: 10 }}>
        {q.code && <CodePanel lines={q.code} compact />}
        <View style={{ gap: 6 }}>
          {q.options.map((option, i) => (
            <Option
              key={option + i}
              label={option}
              mono={q.type === 'predict_output' || (q.monoOptions && q.type === 'single_choice')}
              state={choiceState(true, answer === i, i === q.answer)}
              locked
              dark={dark}
              onPress={noop}
              compact
            />
          ))}
        </View>
      </View>
    );
  }
  return null;
}

function ReviewMistakesScreen({ p, world, questions, answers, topInset, onTryAgain, onDone }: { p: Palette; world?: { order: number; title: string }; questions: QuizQuestion[]; /** What the learner chose for each of these questions, in the same order. */ answers: QuizAnswer[]; topInset: number; onTryAgain: () => void; onDone: () => void }) {
  const dark = p.isDark;
  const [openId, setOpenId] = React.useState<string | null>(questions[0]?.id ?? null);
  const bg = dark ? '#0B0F19' : '#F3F4F8';
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  return <View style={{ flex: 1, backgroundColor: bg, paddingTop: topInset }}>
    <View style={[s.reviewHeader, { backgroundColor: bg, borderBottomColor: dark ? '#262C3D' : '#E2E8F0' }]}>
      <Pressable onPress={onDone} style={[s.closeBtn, dark ? { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#121826' } : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }]}><Icon name="close" size={20} exact color={dark ? '#E2E8F0' : '#334155'} /></Pressable>
      <View style={{ flex: 1 }}><Text style={[s.worldTag, { color: dark ? '#A5B4FC' : '#4F46E5' }]}>{world ? `W${world.order} · ${world.title}` : 'QUIZ'}</Text><Text style={[s.reviewTitle, { color: title }]}>Review mistakes</Text></View>
      <Text style={[s.count, { color: title }]}>{questions.length}<Text style={{ color: muted }}> missed</Text></Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}>
      {questions.map((q, i) => { const open = openId === q.id; return <View key={q.id} style={[s.reviewCard, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: open ? (dark ? '#818CF8' : '#A5B4FC') : (dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0') }]}>
        <Pressable onPress={() => setOpenId(open ? null : q.id)} style={s.reviewRow}><View style={[s.reviewNumber, { backgroundColor: dark ? 'rgba(251,113,133,0.18)' : '#FFE4E6' }]}><Text style={{ color: dark ? '#FDA4AF' : '#BE123C', fontFamily: FONT.mono.b }}>{i + 1}</Text></View><RichText text={q.question} numberOfLines={open ? undefined : 2} style={[s.reviewQuestion, { color: title }]} dark={dark} /><Icon name={open ? 'expand_less' : 'expand_more'} size={20} color={muted} /></Pressable>
        {open && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
            {['single_choice', 'predict_output', 'multi_select', 'true_false'].includes(q.type) ? (
              <ReviewChoices q={q} answer={answers[i] ?? null} dark={dark} />
            ) : (
              <>
                <View style={[s.answerBox, { backgroundColor: dark ? 'rgba(16,185,129,0.10)' : '#ECFDF5', borderColor: dark ? 'rgba(110,231,183,0.4)' : '#A7F3D0' }]}><Text style={{ color: dark ? '#6EE7B7' : '#047857', fontFamily: FONT.outfit.b }}>✓ Correct answer</Text><Text style={[s.answerText, { color: dark ? '#D1FAE5' : '#065F46' }]}>{correctAnswerText(q)}</Text></View>
                {yourAnswerText(q, answers[i] ?? null) !== null && (
                  <Text style={{ color: dark ? '#FDA4AF' : '#BE123C', fontFamily: FONT.outfit.b, fontSize: fz(13) }}>Your answer: {yourAnswerText(q, answers[i] ?? null)}</Text>
                )}
              </>
            )}
            <ExplainText text={q.explanation} style={[s.body13, s.reviewBody, { color: dark ? '#CBD5E1' : '#475569' }]} dark={dark} />
          </View>
        )}
      </View>; })}
    </ScrollView>
    <View style={[s.reviewFooter, { backgroundColor: bg }]}><Pressable onPress={onTryAgain} style={[s.mainBtn, { backgroundColor: '#6366F1' }]}><Icon name="replay" size={20} exact color="#FFFFFF" /><Text style={s.mainBtnText}>Try these again ({questions.length})</Text></Pressable><Pressable onPress={onDone} style={s.doneBtn}><Text style={[s.body13, { color: muted, fontFamily: FONT.outfit.b }]}>Done for now</Text></Pressable></View>
  </View>;
}

function CompleteScreen({ p, results, xp, topInset, onDone, onReview, nextLabel, onNext }: { p: Palette; results: Result[]; xp: number; topInset: number; onDone: () => void; onReview: () => void; nextLabel?: string; onNext?: () => void }) {
  const dark = p.isDark;
  const total = results.length;
  const right = results.filter((r) => r === 'correct').length;
  const wrong = total - right;
  const pct = total ? Math.round((right / total) * 100) : 0;
  const bg = dark ? '#0B0F19' : '#F3F4F8';
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  const stats = [
    { label: 'XP earned', value: `+${xp}`, icon: 'bolt', tone: dark ? '#FCD34D' : '#B45309' },
    { label: 'Correct', value: String(right), icon: 'check_circle', tone: dark ? '#6EE7B7' : '#047857' },
    { label: 'To review', value: String(wrong), icon: 'refresh', tone: dark ? '#FDA4AF' : '#BE123C' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: topInset }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 24, alignItems: 'center', gap: 24 }}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={[s.completeKicker, { color: dark ? '#4EC9B0' : '#0F766E' }]}>session.complete()</Text>
          <Text style={[s.completeTitle, { color: title }]}>{headline(pct)}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[s.bigScore, { color: title }]}>
            {right}
            <Text style={[s.bigScoreTotal, { color: muted }]}> / {total}</Text>
          </Text>
          <Text style={[s.scoreSub, { color: muted }]}>questions correct · {pct}%</Text>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', gap: 6 }}>
          {results.map((r, i) => (
            <View key={i} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: r === 'correct' ? '#10B981' : '#F43F5E' }} />
          ))}
        </View>
        <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
          {stats.map((st) => (
            <View
              key={st.label}
              style={[s.statCard, dark ? { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: '#121826' } : { borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }]}
            >
              <Icon name={st.icon} size={22} exact color={st.tone} />
              <Text style={[s.statValue, { color: title }]}>{st.value}</Text>
              <Text style={[s.statLabel, { color: muted }]}>{st.label}</Text>
            </View>
          ))}
        </View>
        {wrong > 0 && (
          <Text style={[s.reviewNote, { color: muted }]}>
            {wrong === 1 ? 'One question' : `${wrong} questions`} went wrong. Reviewing them is the fastest way to remember the rule.
          </Text>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}>
        {wrong > 0 && (
          <Pressable onPress={onReview} style={[s.reviewBtn, { borderColor: dark ? 'rgba(129,140,248,0.6)' : '#6366F1' }]}>
            <Icon name="replay" size={20} exact color={dark ? '#C7D2FE' : '#4338CA'} />
            <Text style={[s.mainBtnText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>Review mistakes</Text>
          </Pressable>
        )}
        {onNext && (
          <View>
            <ShadowStack r={16} shadows={[{ dy: 6, blur: 20, rgb: '99,102,241', alpha: 0.35 }]} />
            <Pressable onPress={onNext} style={[s.mainBtn, { backgroundColor: '#6366F1' }]}>
              <Text style={[s.mainBtnText, { color: '#FFFFFF' }]}>Next: {nextLabel}</Text>
              <Icon name="arrow_forward" size={20} exact color="#FFFFFF" />
            </Pressable>
          </View>
        )}
        {onNext ? (
          <Pressable onPress={onDone} style={[s.reviewBtn, { borderColor: dark ? 'rgba(255,255,255,0.18)' : '#CBD5E1' }]}>
            <Text style={[s.mainBtnText, { color: dark ? '#E2E8F0' : '#334155' }]}>Back to Quiz</Text>
          </Pressable>
        ) : (
          <View>
            <ShadowStack r={16} shadows={[{ dy: 6, blur: 20, rgb: '99,102,241', alpha: 0.35 }]} />
            <Pressable onPress={onDone} style={[s.mainBtn, { backgroundColor: '#6366F1' }]}>
              <Text style={[s.mainBtnText, { color: '#FFFFFF' }]}>Back to Quiz</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function QuizSessionScreen({ p, world, label, questions = SAMPLE_QUIZ, topInset, stepOffset = 0, totalOverride, onExit, onComplete, onAnswer, nextLabel, onNext }: { p: Palette; world?: { order: number; title: string }; label?: string; /** Position of a resumed quiz: questions already answered before this session. */ stepOffset?: number; /** The whole quiz's length (the position is shown as 13 / 24 even when only the rest is played). */ totalOverride?: number; /** What to offer after the last question: the next set (label and action). */ nextLabel?: string; onNext?: () => void; /** Called as each answer is committed, so progress survives quitting midway. */ onAnswer?: (question: QuizQuestion, correct: boolean) => void; questions?: QuizQuestion[]; topInset: number; onExit: () => void; onComplete?: (questions: QuizQuestion[], results: Result[]) => void }) {
  const [index, setIndex] = React.useState(0);
  const [results, setResults] = React.useState<Result[]>([]);
  // What the learner chose for each answered question, so the review can show it next to the correct answer.
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([]);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [sessionQuestions, setSessionQuestions] = React.useState(questions);
  // The offset / whole-quiz length only apply to the first run; "Try these again" replays the missed questions on their own.
  const [position, setPosition] = React.useState<{ offset: number; total?: number }>({ offset: stepOffset, total: totalOverride });
  const missed = sessionQuestions.filter((_, i) => results[i] === 'wrong');
  const missedAnswers = sessionQuestions.map((_, i) => answers[i] ?? null).filter((_, i) => results[i] === 'wrong');

  if (reviewOpen) return <ReviewMistakesScreen p={p} world={world} questions={missed} answers={missedAnswers} topInset={topInset} onTryAgain={() => { setSessionQuestions(missed); setPosition({ offset: 0, total: undefined }); setReviewOpen(false); setIndex(0); setResults([]); setAnswers([]); }} onDone={onExit} />;

  if (index >= sessionQuestions.length) {
    const xp = sessionQuestions.reduce((sum, q, i) => sum + (results[i] === 'correct' ? q.xp : 0), 0);
    return <CompleteScreen p={p} results={results} xp={xp} topInset={topInset} onReview={() => setReviewOpen(true)} nextLabel={nextLabel} onNext={onNext} onDone={() => { onComplete?.(sessionQuestions, results); onExit(); }} />;
  }
  return (
    <QuestionScreen
      key={sessionQuestions[index].id}
      p={p}
      q={sessionQuestions[index]}
      step={position.offset + index + 1}
      total={position.total ?? sessionQuestions.length}
      world={world}
      label={label}
      topInset={topInset}
      onClose={onExit}
      onContinue={(correct, answer) => {
        onAnswer?.(sessionQuestions[index], correct);
        setResults((r) => [...r, correct ? 'correct' : 'wrong']);
        setAnswers((a) => [...a, answer]);
        setIndex((i) => i + 1);
      }}
    />
  );
}

const s = StyleSheet.create({
  debugRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 8 },
  debugLabel: { fontFamily: FONT.mono.b, fontSize: fz(9), letterSpacing: 1 },
  debugBtn: { minWidth: 56, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7, borderWidth: BW, alignItems: 'center' },
  debugBtnText: { fontFamily: FONT.mono.b, fontSize: fz(11), includeFontPadding: false },
  header: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewHeader: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: BW, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 3 },
  reviewTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(18 * MAIN), lineHeight: lh(18, 1.3), includeFontPadding: false },
  reviewCard: { borderRadius: 16, borderWidth: BW, overflow: 'hidden' },
  reviewRow: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reviewNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reviewQuestion: { flex: 1, fontFamily: FONT.outfit.sb, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.4), includeFontPadding: false },
  reviewBody: { fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5) },
  answerBox: { borderRadius: 12, borderWidth: BW, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  answerText: { fontFamily: FONT.mono.b, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.4), includeFontPadding: false },
  reviewFooter: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24, gap: 8 },
  doneBtn: { height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  worldTag: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  worldTitle: { flexShrink: 1, fontFamily: FONT.outfit.sb, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  count: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  conceptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottomWidth: BW, paddingHorizontal: 16, paddingVertical: 8 },
  tapCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(148,163,184,0.55)', marginRight: 12 },
  tapInstruction: { fontFamily: FONT.mono.b, fontSize: fz(11), letterSpacing: 0.5, includeFontPadding: false },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diffPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  diffText: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.6, textTransform: 'uppercase', includeFontPadding: false },
  concept: { fontFamily: FONT.mono.b, fontSize: fz(10.5 * MAIN), lineHeight: lh(10.5, 1.5), letterSpacing: 0.05 * 10.5 * MAIN, textTransform: 'uppercase', includeFontPadding: false },
  question: { fontFamily: FONT.outfit.sb, fontSize: fz(16 * MAIN), lineHeight: lh(16, 1.4), letterSpacing: -0.025 * 16 * MAIN, includeFontPadding: false },
  selectedPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  selectedText: { fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.3333), includeFontPadding: false },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  body13: { fontFamily: FONT.body, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  // code panel
  codePanel: { width: '100%', borderRadius: 12, borderWidth: BW, borderColor: 'rgba(51,65,85,0.6)', backgroundColor: '#0D1322', overflow: 'hidden' },
  codeBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#090D17', borderBottomWidth: BW, borderBottomColor: 'rgba(30,41,59,0.7)' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2.91 },
  gutter: { width: 36, textAlign: 'right', paddingRight: 12, fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), color: '#64748B', includeFontPadding: false },
  codeText: { fontFamily: FONT.mono.r, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.625), includeFontPadding: false },
  slot: { marginHorizontal: 6, minWidth: 68, height: 32, paddingHorizontal: 12, borderRadius: 8, borderWidth: TWO, alignItems: 'center', justifyContent: 'center' },
  slotText: { fontFamily: FONT.mono.b, fontSize: fz(13 * MAIN), includeFontPadding: false },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 36, marginRight: 8, marginBottom: 4, borderRadius: 8 },
  noteText: { flex: 1, fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.4), includeFontPadding: false },
  // options
  option: { width: '100%', minHeight: 56, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  indicator: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  indicatorDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  optionCompact: { minHeight: 42, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, gap: 10 },
  optionTextCompact: { fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.4) },
  tagTextCompact: { fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.3) },
  optionText: { flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), includeFontPadding: false },
  optionMono: { flex: 1, fontFamily: FONT.mono.sb, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), includeFontPadding: false },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  chip: { minWidth: 80, height: 48, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: FONT.mono.b, fontSize: fz(14 * MAIN), includeFontPadding: false },
  tfCard: { flex: 1, minHeight: 128, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  tfLabel: { fontFamily: FONT.outfit.sb, fontSize: fz(20 * MAIN), lineHeight: lh(20, 1.4), includeFontPadding: false },
  tfTag: { height: 16, fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  cmpCard: { width: '100%', borderRadius: 16, padding: 14, gap: 12 },
  cmpTitle: { flex: 1, fontFamily: FONT.outfit.sb, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), includeFontPadding: false },
  // hint + feedback
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 12, borderWidth: BW },
  hintBtnText: { fontFamily: FONT.outfit.sb, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  hintBox: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, borderWidth: BW, paddingHorizontal: 14, paddingVertical: 12 },
  hintText: { flex: 1, fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.4), includeFontPadding: false },
  feedback: { borderRadius: 16, borderWidth: TWO, padding: 12, gap: 6 },
  feedbackTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4), includeFontPadding: false },
  explain: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  conceptLine: { fontFamily: FONT.mono.sb, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  // main button
  mainBtn: { height: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mainBtnText: { fontFamily: FONT.outfit.sb, fontSize: fz(15 * MAIN), lineHeight: lh(15, 1.5), includeFontPadding: false },
  // leave dialog
  leaveOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', padding: 16, zIndex: 20 },
  leaveCard: { width: '100%', borderRadius: 16, padding: 20, gap: 12 },
  leaveTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(18 * MAIN), lineHeight: lh(18, 1.5556), includeFontPadding: false },
  leaveBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  leaveBtnText: { fontFamily: FONT.outfit.sb, fontSize: fz(15 * MAIN), includeFontPadding: false },
  // complete
  completeKicker: { fontFamily: FONT.mono.b, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  completeTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(30 * MAIN), lineHeight: lh(30, 1.2), includeFontPadding: false },
  bigScore: { fontFamily: FONT.outfit.b, fontSize: fz(48 * MAIN), lineHeight: lh(48, 1), includeFontPadding: false },
  bigScoreTotal: { fontFamily: FONT.outfit.b, fontSize: fz(24 * MAIN), includeFontPadding: false },
  scoreSub: { fontFamily: FONT.outfit.md, fontSize: fz(15 * MAIN), lineHeight: lh(15, 1.5), includeFontPadding: false },
  statCard: { flex: 1, borderRadius: 16, borderWidth: BW, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: FONT.outfit.b, fontSize: fz(18 * MAIN), lineHeight: lh(18, 1.5556), includeFontPadding: false },
  statLabel: { fontFamily: FONT.outfit.md, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  reviewNote: { maxWidth: 320, textAlign: 'center', fontFamily: FONT.body, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), includeFontPadding: false },
  reviewBtn: { height: 48, borderRadius: 16, borderWidth: TWO, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
