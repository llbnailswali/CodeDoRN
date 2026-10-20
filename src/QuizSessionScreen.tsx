import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BETS, BetId, STAKES_SHIELD_SAVINGS, STAKES_START, betById, grantStakesShield, loadStakesBest, payout, saveStakesRound, spendStakesShield } from './stakes';
import { SurvivalArt, survivalArtFor } from './survivalArt';
import { DIFFICULTY_LABEL, SURVIVAL_LEVEL_STEP, SURVIVAL_LIVES, difficultyForLevel, grantSurvivalBonus, loadSurvivalBest, pickSurvivalQuestion, spendSurvivalBonus, saveSurvivalRun, startSurvivalRun, survivalLevel } from './survival';
import { SPEED_ROUND_HISTORY_KEY, SpeedRoundEntry, entryPoints, loadSpeedHistory, speedPoints } from './speedRoundHistory';
import { Alert, Animated, BackHandler, Image, Modal, NativeModules, Pressable, ScrollView, StyleSheet, StyleProp, Text, TextStyle, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import PagerView from 'react-native-pager-view';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { CodeScrollPagerLock, HorizontalCodeScroll } from './HorizontalCodeScroll';
import { BW, Icon, MAIN, fz } from './shell';
import { accentFor, lh } from './parts';
import { QuizAnswer, QuizQuestion, correctAnswerText, gradeQuizAnswer, hasAnswer } from './quizQuestions';
import { SAMPLE_QUIZ } from './quizSample';
import { ShadowStack } from './shadows';
import { FONT, Palette } from './theme';
import { PROFILE_NAME } from './profileIdentity';

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
function RichText({ text, style, dark, numberOfLines, subtle = false }: { text: string; style: StyleProp<TextStyle>; dark: boolean; numberOfLines?: number; subtle?: boolean }) {
  const parts = text.replace(/\s+/g, ' ').trim().split('`');
  // Plain questions should remain one text flow. Rendering them through the
  // rich inline-code layout below puts the sentence's text fragments into a
  // flex-wrapping View, which can wrap individual words/characters as if
  // they were separate columns (especially on the review screen).
  if (parts.length === 1) {
    return <Text style={style} numberOfLines={numberOfLines}>{parts[0]}</Text>;
  }
  const { flex, ...wordStyle } = StyleSheet.flatten(style) ?? {};
  const base = wordStyle as { fontSize?: number; lineHeight?: number };
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
    <View style={{ flex, flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      {parts.flatMap((part, i) => {
        if (i % 2 === 1) {
          const spaceAfter = /^\s/.test(parts[i + 1] ?? '');
          return [
            <View key={`c${i}`} style={{ backgroundColor: subtle ? (dark ? 'rgba(129,140,248,0.06)' : 'rgba(99,102,241,0.06)') : (dark ? '#0D1322' : '#EEF2FF'), borderRadius: 7, borderWidth: subtle ? BW : 1, borderColor: subtle ? (dark ? 'rgba(129,140,248,0.16)' : 'rgba(99,102,241,0.16)') : (dark ? 'rgba(129,140,248,0.35)' : '#C7D2FE'), paddingHorizontal: subtle ? 5 : 8, paddingVertical: subtle ? 1 : 2, marginRight: spaceAfter ? 5 : 0, marginVertical: 1 }}>
              <Text style={{ fontFamily: FONT.mono.sb, fontSize: codeSize, lineHeight: (base.lineHeight ?? codeSize * 1.4) * 0.9, color: subtle ? (dark ? '#CBD5E1' : '#4F566B') : (dark ? '#E2E8F0' : '#4338CA'), includeFontPadding: false }}>{part}</Text>
            </View>,
          ];
        }
        return part
          .split(' ')
          .filter((word) => word !== '')
          .map((word, j, words) => (
            <Text key={`w${i}-${j}`} style={wordStyle}>
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
      {sentences.map((sentence, i) => {
        const parts = sentence.split('`');
        return (
          <Text key={i} style={style}>
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <Text key={partIndex} style={{ fontFamily: FONT.mono.sb, color: dark ? '#A5B4FC' : '#4338CA' }}>{part}</Text>
              ) : (
                <Text key={partIndex}>{part}</Text>
              ),
            )}
          </Text>
        );
      })}
    </View>
  );
}

function CodePanel({
  lines, fileName = 'Main.kt', compact, fullBleed = false, showLineNumbers = true, onLineClick, lineState, lineNote, fill,
}: {
  lines: string[];
  fileName?: string;
  compact?: boolean;
  fullBleed?: boolean;
  showLineNumbers?: boolean;
  onLineClick?: (i: number) => void;
  lineState?: (i: number) => CodeLineState;
  lineNote?: (i: number) => string | null;
  fill?: { value: string | null; state: 'idle' | 'filled' | 'correct' | 'wrong'; onClear?: () => void };
}) {
  const [panelWidth, setPanelWidth] = React.useState(0);
  const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);
  const handleCopy = async () => {
    try {
      await NativeModules.WebStage.copyToClipboard(lines.join('\n'));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 1600);
  };

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
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' }}>
          {!!left && (
            <Text numberOfLines={1} style={s.codeText}>
              <Kotlin text={left} />
            </Text>
          )}
          <Pressable onPress={fill.onClear} style={[s.slot, { borderColor: slot.borderColor, backgroundColor: slot.backgroundColor, borderStyle: slot.borderStyle }]}>
            <Text style={[s.slotText, { color: slot.color }]}>{fill.value ?? ' '}</Text>
          </Pressable>
          {!!right && (
            <Text numberOfLines={1} style={s.codeText}>
              <Kotlin text={right} />
            </Text>
          )}
        </View>
      );
    }
    return (
      <Text numberOfLines={1} style={s.codeText}>
        <Kotlin text={line} />
      </Text>
    );
  };

  return (
    <View style={[s.codePanel, fullBleed && { width: 'auto', alignSelf: 'stretch', marginHorizontal: -16, borderRadius: 0 }]} onLayout={event => setPanelWidth(event.nativeEvent.layout.width)}>
      {!compact && (
        <View style={s.codeBar}>
          <View style={[s.dot, { backgroundColor: 'rgba(248,113,113,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(251,191,36,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(52,211,153,0.8)' }]} />
          <Text style={[s.mono11, { color: '#94A3B8', marginLeft: 8 }]}>{fileName}</Text>
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel={copyState === 'copied' ? 'Code copied' : copyState === 'failed' ? 'Could not copy code' : 'Copy code'}
            hitSlop={8}
            style={s.copyButton}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" accessibilityLabel={copyState === 'copied' ? 'Copied' : 'Copy code'}>
              {copyState === 'copied' ? (
                <Path fill="#6EE7B7" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              ) : (
                <Path fill={copyState === 'failed' ? '#FDA4AF' : '#CBD5E1'} d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              )}
            </Svg>
            {copyState === 'failed' && <Text style={[s.mono11, { color: '#FDA4AF' }]}>Failed</Text>}
          </Pressable>
        </View>
      )}
      <HorizontalCodeScroll>
        <View style={{ alignSelf: 'flex-start', paddingVertical: 2 }}>
          {lines.map((line, idx) => {
            const state = lineState ? lineState(idx) : 'idle';
            const note = lineNote ? lineNote(idx) : null;
            const tappable = !!onLineClick;
            const row = (
              <View
                style={[
                  s.codeRow,
                  { minHeight: tappable ? 38 : 24 },
                  tappable && panelWidth > 0 && { minWidth: panelWidth - 2 * BW },
                  // Tappable lines read as separate rows: a tint, a thin divider and a tap circle on the right.
                  tappable && state === 'idle' && { backgroundColor: 'rgba(255,255,255,0.04)' },
                  tappable && idx < lines.length - 1 && { borderBottomWidth: BW, borderBottomColor: 'rgba(148,163,184,0.22)' },
                  LINE_STYLE[state],
                ]}
              >
                {showLineNumbers && <Text style={s.gutter}>{idx + 1}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0, paddingLeft: tappable ? 32 : showLineNumbers ? 0 : 8, paddingRight: fullBleed ? 0 : 8 }}>
                  {renderLine(line)}
                </View>
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
      </HorizontalCodeScroll>
      {onLineClick && (
        <View pointerEvents="none" style={s.selectionRail}>
          {lines.map((_, idx) => {
            const state = lineState ? lineState(idx) : 'idle';
            return <View key={idx} style={s.selectionRailRow}><View style={[s.tapCircle, { marginRight: 0 }, state === 'selected' && { backgroundColor: '#6366F1', borderColor: '#6366F1' }]} /></View>;
          })}
        </View>
      )}
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
  label, mono, multi = false, state, locked, dark, onPress, compact = false, survival = false,
}: { label: string; mono?: boolean; multi?: boolean; state: ChoiceState; locked: boolean; dark: boolean; onPress: () => void; compact?: boolean; survival?: boolean }) {
  const full = tagFor(state);
  const tag = full && compact ? { ...full, text: state === 'wrong' ? 'Your pick' : 'Correct' } : full;
  return (
    <Pressable disabled={locked} onPress={onPress} style={[s.option, compact && s.optionCompact, surface(state, dark), survival && { borderRadius: 16, minHeight: 56, paddingVertical: 12, backgroundColor: state === 'idle' ? (dark ? '#281B2B' : '#FFFFFF') : undefined, borderColor: state === 'idle' ? (dark ? '#694257' : '#EDC9D5') : undefined }, survival && state === 'selected' && { borderColor: '#E11D48', backgroundColor: dark ? '#432234' : '#FFF1F2' }]}>
      <Indicator state={state} multi={multi} compact={compact} />
      {/* A monospace option is program output: keep its line breaks and spaces exactly (RichText collapses them, so "F\n3" read as "F 3"). */}
      {mono && !label.includes('`')
        ? <Text style={[s.optionMono, compact && s.optionTextCompact, { color: dark ? '#F1F5F9' : '#222638' }]}>{label}</Text>
        : <RichText
          text={label}
          style={[mono ? s.optionMono : s.optionText, compact && s.optionTextCompact, { color: dark ? '#F1F5F9' : '#222638' }]}
          dark={dark}
          subtle
        />}
      {tag && (
        <View style={s.tag}>
          <Icon name={tag.icon} size={compact ? 13 : 16} exact color={tagColor(state, dark)} />
          <Text style={[s.tagText, compact && s.tagTextCompact, { color: tagColor(state, dark) }]}>{tag.text}</Text>
        </View>
      )}
    </Pressable>
  );
}

function AnswerBody({ q, value, onChange, checked, dark, survival = false }: { q: QuizQuestion; value: QuizAnswer; onChange: (v: QuizAnswer) => void; checked: boolean; dark: boolean; survival?: boolean }) {
  switch (q.type) {
    case 'single_choice':
    case 'predict_output':
      return (
        <View style={{ gap: 16 }}>
          {q.code && <CodePanel lines={q.code} fullBleed showLineNumbers={false} />}
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
                survival={survival}
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
              survival={survival}
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
          <CodePanel lines={q.code} fullBleed showLineNumbers={false} fill={{ value: placed, state: slotState, onClear: checked ? undefined : () => onChange(null) }} />
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
          <Text style={[s.tapInstruction, { color: dark ? '#A5B4FC' : '#4338CA' }]}>{q.code.length} lines to inspect</Text>
        )}
        <CodePanel
          lines={q.code}
          fullBleed
          showLineNumbers={false}
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

function QuizToolbar({ p, world, label, question, topInset, step, total, checked, onClose }: {
  p: Palette;
  world?: { order: number; title: string };
  label?: string;
  question: QuizQuestion;
  topInset: number;
  step: number;
  total: number;
  checked: boolean;
  onClose: () => void;
}) {
  const dark = p.isDark;
  const bg = dark ? '#121826' : '#FFFFFF';
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  const progress = Math.min(1, (step - 1 + (checked ? 1 : 0)) / total);
  const accent = world ? accentFor(world.order) : null;
  const difficultyTone = question.difficulty === 'easy'
    ? { bg: dark ? 'rgba(16,185,129,0.18)' : '#D1FAE5', fg: dark ? '#6EE7B7' : '#047857' }
    : question.difficulty === 'hard'
      ? { bg: dark ? 'rgba(244,63,94,0.18)' : '#FFE4E6', fg: dark ? '#FDA4AF' : '#BE123C' }
      : { bg: dark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', fg: dark ? '#FCD34D' : '#B45309' };
  return (
    <View style={{ paddingTop: topInset, backgroundColor: bg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: dark ? 0.28 : 0.14, shadowRadius: 3, zIndex: 10 }}>
      <View style={{ height: 1 }} />
      <View style={[s.header, { paddingRight: 0, paddingTop: 0 }]}> 
        <Pressable onPress={onClose} style={[s.closeBtn, dark ? { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#121826' } : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' }]}>
          <Icon name="close" size={20} exact color={dark ? '#E2E8F0' : '#334155'} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          {(world || label) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {world && accent && <Text style={[s.worldTag, { color: dark ? accent[0] : accent[1] }]}>W{world.order}</Text>}
              <Text numberOfLines={1} style={[s.worldTitle, { color: title }]}>{label ?? world?.title}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Text numberOfLines={1} style={[s.concept, { color: muted, flexShrink: 1 }]}>{question.topic}</Text>
            <View style={s.badgeRow}>
              {question.type === 'multi_select' && (
                <View style={[s.diffPill, { backgroundColor: dark ? 'rgba(99,102,241,0.25)' : '#E0E7FF' }]}>
                  <Text style={[s.diffText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>Multiple</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4, marginRight: 16 }}>
          <Text style={[s.count, { color: title, textAlign: 'right' }]}>{step}<Text style={{ color: muted }}> / {total}</Text></Text>
          <View style={[s.diffPill, { backgroundColor: difficultyTone.bg, alignSelf: 'flex-end', transform: [{ translateX: 6 }] }]}>
            <Text style={[s.diffText, { color: difficultyTone.fg }]}>{question.difficulty}</Text>
          </View>
        </View>
      </View>
      <View style={[s.progressTrack, { marginHorizontal: 0, marginTop: 0, marginBottom: 0, backgroundColor: dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]}>
        <View style={{ height: 4, width: `${progress * 100}%`, borderRadius: 2, backgroundColor: '#6366F1' }} />
      </View>
    </View>
  );
}

function StakesToolbar({ p, topInset, coins, step, total, shield = false, onClose }: { p: Palette; topInset: number; coins: number; step: number; total: number; /** A Safety Shield is still waiting for the first wrong bet. */ shield?: boolean; onClose: () => void }) {
  const dark = p.isDark;
  const tone = dark ? '#FBBF24' : '#B45309';
  // The coin count pops and shows the change for a moment whenever a bet is settled.
  const [delta, setDelta] = React.useState(0);
  const pop = React.useRef(new Animated.Value(1)).current;
  const fade = React.useRef(new Animated.Value(0)).current;
  const prev = React.useRef(coins);
  React.useEffect(() => {
    const change = coins - prev.current;
    prev.current = coins;
    if (!change) return;
    setDelta(change);
    pop.setValue(1.25);
    fade.setValue(1);
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 1400, delay: 500, useNativeDriver: true }),
    ]).start();
  }, [coins, pop, fade]);
  return <View style={{ paddingTop: topInset, backgroundColor: dark ? '#1D1708' : '#FFFBEB' }}>
    <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable onPress={onClose} style={[s.closeBtn, { backgroundColor: dark ? '#2A2210' : '#FFFFFF', borderColor: dark ? '#7A5F1F' : '#FCD34D' }]}><Icon name="close" size={20} exact color={dark ? '#FDE68A' : '#92400E'} /></Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[s.speedKicker, { color: tone }]}>HIGH STAKES</Text>
        <Text style={[s.speedMeta, { color: dark ? '#E7D7AE' : '#7C5A14' }]}>Question {step}/{total} · Bet on what you know</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, transform: [{ scale: pop }] }}>
          {shield && <Text style={{ fontSize: fz(15) }}>🛡️</Text>}
          <Text style={{ fontSize: fz(17) }}>🪙</Text>
          <Text style={[s.speedTime, { color: tone, fontSize: fz(22) }]}>{coins}</Text>
        </Animated.View>
        <Animated.Text style={{ position: 'absolute', top: '100%', right: 0, opacity: fade, fontFamily: FONT.mono.b, fontSize: fz(12), color: delta >= 0 ? '#16A34A' : '#DC2626' }}>{delta >= 0 ? `+${delta}` : `${delta}`}</Animated.Text>
      </View>
    </View>
    <View style={{ flexDirection: 'row', gap: 4, backgroundColor: dark ? '#1D1708' : '#FFFBEB' }}>{Array.from({ length: total }, (_, i) => <View key={i} style={{ flex: 1, height: 5, backgroundColor: i < step - 1 ? (dark ? '#FBBF24' : '#D97706') : (dark ? '#51432A' : '#E9DFC7') }} />)}</View>
  </View>;
}

function BetArrow({ up, color }: { up: boolean; color: string }) {
  return <Svg width={11} height={11} viewBox="0 0 12 12"><Path d={up ? 'M6 1 2 5h2.5v6h3V5H10L6 1Z' : 'M4.5 1v6H2l4 4 4-4H7.5V1h-3Z'} fill={color} /></Svg>;
}

function BetCards({ dark, selected, onSelect, tickScale }: { dark: boolean; selected?: BetId; onSelect: (bet: BetId) => void; tickScale: Animated.Value }) {
  return <View style={{ flexDirection: 'row', gap: 8 }}>{BETS.map((bet) => {
    const active = selected === bet.id;
    const gain = dark ? '#6EE7B7' : '#00843D';
    const loss = dark ? '#FDA4AF' : '#E60012';
    const description = bet.id === 'sure' ? 'I’m confident' : bet.id === 'think' ? 'Somewhat sure' : 'Not sure yet';
    return <Pressable key={bet.id} onPress={() => onSelect(bet.id)} accessibilityRole="radio" accessibilityLabel={`${bet.label}, gain ${bet.win} or lose ${bet.lose} coins`} accessibilityState={{ selected: active }} style={{ flex: 1, minWidth: 0, minHeight: 154, paddingHorizontal: 5, paddingVertical: 9, borderRadius: 15, alignItems: 'center', justifyContent: 'space-between', borderWidth: active ? 2 : BW, borderColor: active ? '#6366F1' : (dark ? '#475569' : '#D8DEE8'), backgroundColor: active ? (dark ? '#252B4B' : '#F0F1FF') : (dark ? '#202633' : '#FFFFFF') }}>
      {active && <Animated.View style={{ position: 'absolute', top: 7, right: 7, width: 19, height: 19, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', transform: [{ scale: tickScale }] }}><Icon name="check" size={13} exact color="#FFFFFF" /></Animated.View>}
      <View style={{ alignItems: 'center', gap: 2 }}><View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: active ? (dark ? '#40457B' : '#E0E4FF') : (dark ? '#4A3F2E' : '#FFF3D8'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: fz(23) }}>{bet.emoji}</Text></View><Text numberOfLines={1} style={{ fontFamily: FONT.outfit.b, fontSize: fz(12), color: dark ? '#F1F5F9' : '#172033' }}>{bet.label}</Text><Text numberOfLines={1} style={{ fontFamily: FONT.outfit.md, fontSize: fz(10), color: dark ? '#AAB5C6' : '#64748B' }}>{description}</Text></View>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden' }}>
        <View style={{ flex: 1, minWidth: 0, paddingVertical: 6, alignItems: 'center', gap: 2, backgroundColor: dark ? '#19352F' : '#EAF8EF' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><BetArrow up color={gain} /><Text style={{ fontFamily: FONT.mono.b, fontSize: fz(12), fontVariant: ['tabular-nums'], color: gain }}>+{bet.win}</Text></View><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(9), color: gain }}>if correct</Text></View>
        <View style={{ width: 1, height: 30, backgroundColor: dark ? '#596273' : '#D2D6DF' }} />
        <View style={{ flex: 1, minWidth: 0, paddingVertical: 6, alignItems: 'center', gap: 2, backgroundColor: dark ? '#3B2931' : '#FBEDEF' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><BetArrow up={false} color={loss} /><Text style={{ fontFamily: FONT.mono.b, fontSize: fz(12), fontVariant: ['tabular-nums'], color: loss }}>−{bet.lose}</Text></View><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(9), color: dark ? '#F3B5C4' : '#66525C' }}>if wrong</Text></View>
      </View>
    </Pressable>;
  })}</View>;
}

function SurvivalToolbar({ p, topInset, lives, maxLives, correct, step, onClose }: { p: Palette; topInset: number; lives: number; maxLives: number; correct: number; step: number; onClose: () => void }) {
  const dark = p.isDark;
  const level = survivalLevel(correct);
  const levelProgress = correct % SURVIVAL_LEVEL_STEP;
  const tone = dark ? '#FB7185' : '#E11D48';
  const difficulty = difficultyForLevel(level);
  const difficultyColor = difficulty === 'easy' ? (dark ? '#86EFAC' : '#15803D') : difficulty === 'medium' ? (dark ? '#FCD34D' : '#A16207') : (dark ? '#FDA4AF' : '#BE123C');
  // A lost heart shakes the row and pops the heart that just broke.
  const shake = React.useRef(new Animated.Value(0)).current;
  const prevLives = React.useRef(lives);
  React.useEffect(() => {
    if (lives < prevLives.current) {
      shake.setValue(0);
      Animated.sequence([-1, 1, -1, 1, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 60, useNativeDriver: true }))).start();
    }
    prevLives.current = lives;
  }, [lives, shake]);
  return <View style={{ paddingTop: topInset, backgroundColor: dark ? '#1D202B' : '#FAFAFC' }}>
    <View style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Leave survival" style={[s.closeBtn, { backgroundColor: dark ? '#2B3040' : '#FFFFFF', borderColor: dark ? '#51596B' : '#CBD5E1' }]}><Icon name="close" size={20} exact color={dark ? '#CBD5E1' : '#475569'} /></Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Svg width={17} height={17} viewBox="0 0 24 24"><Path d="M12 22c4.42 0 8-3.58 8-8 0-3.18-1.84-5.98-5.52-8.42.04 2.5-1.08 4.12-2.48 4.42C12.3 6.8 10.54 3.36 7.5 2 8 5.28 6.92 7.2 5.26 9.12 4.44 10.08 4 11.66 4 14c0 4.42 3.58 8 8 8Zm0-2a3.5 3.5 0 0 1-3.5-3.5c0-1.44.8-2.5 1.5-3.5.28 1.42 1.12 2.16 2 2.5.38-1.24.48-2.42.5-3.5 2 1.54 3 2.88 3 4.5A3.5 3.5 0 0 1 12 20Z" fill={tone} /></Svg>
          <Text numberOfLines={1} style={{ fontFamily: FONT.outfit.b, fontSize: fz(15), color: dark ? '#F8FAFC' : '#1E293B', flexShrink: 1 }}>SURVIVAL</Text>
          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: dark ? '#343B4C' : '#E8EDF4', flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(11), color: dark ? '#CBD5E1' : '#475569' }}>LEVEL {level}</Text><Text style={{ fontFamily: FONT.outfit.sb, fontSize: fz(10), color: difficultyColor }}>· {DIFFICULTY_LABEL[difficulty]}</Text></View>
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Animated.View style={{ flexDirection: 'row', gap: 3, transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-5, 5] }) }] }}>
          {Array.from({ length: maxLives }, (_, i) => <ResultIcon key={i} name={i < lives ? 'favorite' : 'favorite_border'} size={22} color={i < lives ? tone : (dark ? '#664052' : '#DDA8B9')} />)}
        </Animated.View>
        <Text style={{ fontFamily: FONT.outfit.sb, fontSize: fz(10), color: dark ? '#94A3B8' : '#64748B' }}>Next: Level {level + 1}</Text>
      </View>
    </View>
    <View style={{ flexDirection: 'row', gap: 5, backgroundColor: dark ? '#1D202B' : '#FAFAFC' }}>{Array.from({ length: SURVIVAL_LEVEL_STEP }, (_, i) => <View key={i} style={{ flex: 1, height: 5, backgroundColor: i < levelProgress ? (dark ? '#FB7185' : '#F43F5E') : (dark ? '#475061' : '#DCE2E9') }} />)}</View>
  </View>;
}

function SpeedRoundToolbar({ p, topInset, secondsLeft, limit, correct, step, onClose }: { p: Palette; topInset: number; secondsLeft: number; limit: number; correct: number; step: number; onClose: () => void }) {
  const dark = p.isDark;
  const urgent = secondsLeft <= 10;
  const tone = urgent ? '#FB7185' : '#FBBF24';
  // Through the last ten seconds the clock beats once a second, like the countdown on the Speed Round card.
  const pulse = React.useRef(new Animated.Value(1)).current;
  const flash = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!urgent || secondsLeft <= 0) return;
    pulse.setValue(1.22);
    flash.setValue(1);
    Animated.parallel([
      Animated.spring(pulse, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [secondsLeft, urgent, pulse, flash]);
  return <View style={{ paddingTop: topInset, backgroundColor: dark ? '#171225' : '#FFF8E7', borderBottomWidth: BW, borderBottomColor: dark ? '#4C3B18' : '#F6D78A' }}>
    <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable onPress={onClose} style={[s.closeBtn, { backgroundColor: dark ? '#211A32' : '#FFFFFF', borderColor: dark ? '#5B4779' : '#E8C978' }]}><Icon name="close" size={20} exact color={dark ? '#FDE68A' : '#6B4D0A'} /></Pressable>
      <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><ResultIcon name="bolt" size={18} color={tone} /><Text style={[s.speedKicker, { color: tone }]}>SPEED ROUND</Text></View><Text style={[s.speedMeta, { color: dark ? '#C9BEDB' : '#725C2E' }]}>Question {step} · {correct} correct</Text></View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -6, bottom: -6, left: -10, right: -10, borderRadius: 999, backgroundColor: `${tone}33`, opacity: flash, transform: [{ scale: pulse }] }} />
        <Animated.Text style={[s.speedTime, { color: tone, transform: [{ scale: pulse }] }]}>{`${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`}</Animated.Text>
      </View>
    </View>
    <View style={{ height: 5, backgroundColor: dark ? '#2E2440' : '#F3E2B4' }}><View style={{ height: 5, width: `${limit ? Math.min(100, (secondsLeft / limit) * 100) : 0}%`, backgroundColor: tone }} /></View>
  </View>;
}

function QuestionScreen({
  p, q, value, checked, onDraftChange, onScrollRef, survival = false,
}: {
  p: Palette;
  q: QuizQuestion;
  value: QuizAnswer;
  checked: boolean;
  onDraftChange: (answer: QuizAnswer, isChecked: boolean) => void;
  onScrollRef: (ref: any) => void;
  survival?: boolean;
}) {
  const dark = p.isDark;
  const [hintOpen, setHintOpen] = React.useState(false);

  const correct = checked && gradeQuizAnswer(q, value);
  const bg = survival ? (dark ? '#1A121D' : '#FFF8F9') : dark ? '#0B0F19' : '#F3F4F8';
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';

  // A question answered with a single tap (choose an option, true/false, A or B, tap a line, tap a chip) is checked the moment it is tapped,
  // which saves a separate "Check answer" tap. Multi-select keeps its Check button: the learner ticks several options and decides when done.
  const checksOnTap = q.type !== 'multi_select';
  const changeAnswer = (next: QuizAnswer) => {
    if (checked) return;
    onDraftChange(next, checksOnTap && hasAnswer(next));
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView ref={onScrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: survival ? 16 : 10 }}>
        {survival && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#E11D48' }} /><Text style={{ fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 1.4, color: dark ? '#FDA4AF' : '#BE123C' }}>STAY IN THE GAME</Text></View>}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <RichText text={q.question} style={[s.question, survival && { fontSize: fz(17 * MAIN), lineHeight: lh(17, 1.35) }, { color: title, flex: 1 }]} dark={dark} />
          </View>
          {q.type === 'multi_select' && (
            <View style={[s.selectedPill, { backgroundColor: dark ? 'rgba(99,102,241,0.2)' : '#E0E7FF' }]}>
              <Text style={[s.selectedText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>
                Select all that apply{Array.isArray(value) && value.length > 0 ? ` · ${value.length} selected` : ''}
              </Text>
            </View>
          )}
        </View>

        <AnswerBody q={q} value={value} onChange={changeAnswer} checked={checked} dark={dark} survival={survival} />

        {!checked && !!q.hint && (
          <View style={{ flexDirection: 'row' }}>
            {hintOpen ? (
              <View
                style={[
                  s.hintBox,
                  dark ? { borderColor: 'rgba(252,211,77,0.3)', backgroundColor: 'rgba(252,211,77,0.1)' } : { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' },
                ]}
              >
                <Icon name="lightbulb" size={14} exact color={dark ? '#FEF3C7' : '#78350F'} />
                <Text style={[s.hintText, { color: dark ? '#FEF3C7' : '#78350F' }]}>{q.hint}</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setHintOpen(true)}
                style={[
                  s.hintBtn,
                  survival ? { borderColor: dark ? '#85445C' : '#F5B6CA', backgroundColor: dark ? '#382033' : '#FFF1F2' } : dark ? { borderColor: 'rgba(129,140,248,0.4)', backgroundColor: 'rgba(129,140,248,0.1)' } : { borderColor: '#A5B4FC', backgroundColor: '#EEF2FF' },
                ]}
              >
                <Icon name="lightbulb" size={14} exact color={survival ? (dark ? '#FDA4AF' : '#BE123C') : dark ? '#C7D2FE' : '#4338CA'} />
                <Text style={[s.hintBtnText, { color: survival ? (dark ? '#FDA4AF' : '#BE123C') : dark ? '#C7D2FE' : '#4338CA' }]}>Need a hint?</Text>
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
            {!correct && (correctAnswerText(q).includes('\n')
              // A multi-line output (such as "F\n3") goes in its own block, so its lines line up instead of wrapping after the label.
              ? <View style={{ gap: 4 }}>
                <Text style={[s.body13, { color: dark ? '#E2E8F0' : '#334155', fontFamily: FONT.outfit.sb }]}>Correct answer:</Text>
                <Text style={[s.body13, { color: dark ? '#E2E8F0' : '#334155', fontFamily: FONT.mono.b, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: dark ? '#475569' : '#CBD5E1' }]}>{correctAnswerText(q)}</Text>
              </View>
              : <Text style={[s.body13, { color: dark ? '#E2E8F0' : '#334155' }]}>
                <Text style={{ fontFamily: FONT.outfit.sb }}>Correct answer: </Text>
                <Text style={{ fontFamily: FONT.mono.b }}>{correctAnswerText(q)}</Text>
              </Text>
            )}
            <ExplainText text={q.explanation} style={[s.explain, { color: dark ? '#E2E8F0' : '#334155' }]} dark={dark} />
            <Text style={[s.conceptLine, { color: muted }]}>Concept: {q.topic}</Text>
          </View>
        )}
      </ScrollView>

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

function ReviewMistakesScreen({ p, world, questions, answers, topInset, bottomInset, onTryAgain, onDone }: { p: Palette; world?: { order: number; title: string }; questions: QuizQuestion[]; /** What the learner chose for each of these questions, in the same order. */ answers: QuizAnswer[]; topInset: number; bottomInset: number; onTryAgain: () => void; onDone: () => void }) {
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 + bottomInset }}>
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
    <View style={[s.reviewFooter, { backgroundColor: bg, paddingBottom: 24 + bottomInset }]}><Pressable onPress={onTryAgain} style={[s.mainBtn, { backgroundColor: '#6366F1' }]}><Icon name="replay" size={20} exact color="#FFFFFF" /><Text style={s.mainBtnText}>Try these again ({questions.length})</Text></Pressable><Pressable onPress={onDone} style={s.doneBtn}><Text style={[s.body13, { color: muted, fontFamily: FONT.outfit.b }]}>Done for now</Text></Pressable></View>
  </View>;
}


// The bundled Material Symbols fonts are small subsets without these glyphs, so the results dialog draws them (Material paths, 24px grid).
const RESULT_ICON_PATHS: Record<string, string> = {
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  favorite: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  favorite_border: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  bolt: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z',
  schedule: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  done_all: 'M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z',
  emoji_events: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  rule: 'M16.54 11L13 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L16.54 11zM11 7H2v2h9V7zm10 6.41L19.59 12 17 14.59 14.41 12 13 13.41 15.59 16 13 18.59 14.41 20 17 17.41 19.59 20 21 18.59 18.41 16 21 13.41zM11 15H2v2h9v-2z',
};
function ResultIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={RESULT_ICON_PATHS[name]} fill={color} /></Svg>;
}

// Two benchmarks, both scaled to a minute so a short test round compares with a 60-second one:
// quantity = questions attempted per minute, quality = accuracy.
function perMinute(n: number, limit: number) { return limit ? (n * 60) / limit : 0; }

// Dummy benchmark: there is no backend with other learners' results, so the percentile is derived from the round itself.
// It scores correct answers minus half a point per wrong one (guessing does not pay), and caps low-volume rounds,
// so a perfect 3 of 3 ranks below 12 of 15. The same result always gives the same number.
const FASTER_THAN_CURVE: [number, number][] = [[0, 15], [4, 35], [8, 60], [12, 72], [18, 84], [24, 92], [30, 97]];
function dummyFasterThan(correct: number, attempted: number, limit: number) {
  const effective = perMinute(Math.max(0, correct - 0.5 * (attempted - correct)), limit);
  // No points (nothing answered, or misses cancel out the correct answers) means faster than nobody.
  if (effective <= 0) return 0;
  let base = FASTER_THAN_CURVE[FASTER_THAN_CURVE.length - 1][1];
  for (let i = 1; i < FASTER_THAN_CURVE.length; i++) {
    const [x0, y0] = FASTER_THAN_CURVE[i - 1], [x1, y1] = FASTER_THAN_CURVE[i];
    if (effective <= x1) { base = y0 + ((effective - x0) / (x1 - x0)) * (y1 - y0); break; }
  }
  const jitter = ((correct * 7 + attempted * 13) % 7) - 3;
  const volume = perMinute(attempted, limit);
  const volumeCap = volume < 5 ? 45 : volume < 8 ? 65 : volume < 12 ? 85 : 99;
  return Math.max(15, Math.min(volumeCap, Math.round(base + jitter)));
}

// Per-concept summary of the round, grouped by the learner-facing topic (the "CONCEPT · ..." tag on each question).
// Strong = every answer on it correct; weak = at least one wrong. Most-answered first, so the best-evidenced topics lead.
type ConceptTally = { topic: string; correct: number; total: number };
function conceptSummary(questions: QuizQuestion[], results: Result[]) {
  const byTopic = new Map<string, ConceptTally>();
  results.forEach((result, i) => {
    const topic = result && questions[i]?.topic;
    if (!topic) return;
    const t = byTopic.get(topic) ?? { topic, correct: 0, total: 0 };
    t.total += 1;
    if (result === 'correct') t.correct += 1;
    byTopic.set(topic, t);
  });
  const all = [...byTopic.values()];
  const strong = all.filter((t) => t.correct === t.total).sort((a, b) => b.total - a.total);
  const weak = all.filter((t) => t.correct < t.total).sort((a, b) => (b.total - b.correct) - (a.total - a.correct) || a.correct / a.total - b.correct / b.total);
  return { strong, weak };
}

// One sentence naming the weaker benchmark, so the label is never a mystery. None when neither is weak.
function speedCoachLine(attempted: number, missed: number, accuracy: number, limit: number): string | null {
  if (!attempted) return 'Answer a few to get a score.';
  const manyAttempts = perMinute(attempted, limit) >= 12;
  if (manyAttempts && accuracy >= 80) return null; // nothing to fix: the label says it
  if (manyAttempts && accuracy >= 60) return `Good volume, only ${missed} missed.`;
  if (manyAttempts) return `Fast, but ${missed} missed. Slow down a little.`;
  if (accuracy === 100) return 'Perfect accuracy. Now try answering more.';
  if (accuracy >= 60) return 'Accurate. Now try answering more.';
  return 'Take your time, then pick up the pace.';
}

// Shared by the Speed Round and Survival Ladder result dialogs.
const RESULT_INK = '#202020', RESULT_MUTED = '#7C7C8D', RESULT_ACCENT = '#5146E5', RESULT_RULE = '#E2E2E8';
const RESULT_BOX = { marginTop: 12, width: '100%', borderRadius: 18, borderWidth: 1, borderColor: RESULT_RULE, backgroundColor: '#FFFFFF' } as const;
const resultStat = (icon: string, iconColor: string, value: string, label: string, filled = true) => <View style={{ alignItems: 'center', gap: 2 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{icon === 'check_circle' ? <Icon name={icon} size={19} exact filled={filled} color={iconColor} /> : <ResultIcon name={icon} size={19} color={iconColor} />}<Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(18), color: RESULT_INK }}>{value}</Text></View><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(11), letterSpacing: 0.3, color: RESULT_MUTED }}>{label}</Text></View>;

/** Strong-grip and needs-practice concepts side by side, with the link to review the misses. */
function ConceptSummaryBox({ questions, results, missed, onReview, weakTitle = 'NEEDS PRACTICE' }: { questions: QuizQuestion[]; results: Result[]; missed: number; onReview: () => void; weakTitle?: string }) {
  const concepts = React.useMemo(() => conceptSummary(questions, results), [questions, results]);
  // Each concept column shows 3 chips until its "+N" chip is tapped.
  const [expanded, setExpanded] = React.useState<[boolean, boolean]>([false, false]);
  const toggleColumn = (col: number) => setExpanded((e) => (col === 0 ? [!e[0], e[1]] : [e[0], !e[1]]));
  return <>
      {concepts.strong.length + concepts.weak.length > 0 && <View style={[RESULT_BOX, { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 12 }]}>
        {([['STRONG GRIP', concepts.strong, '#EAF3EC', '#3E6B4A', 'None this round'], [weakTitle, concepts.weak, '#FBEDE9', '#A63D2A', 'Nothing missed']] as const).map(([title, list, bg, fg, empty], col) => <React.Fragment key={title}>
          {col === 1 && <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: RESULT_RULE }} />}
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(10.5), letterSpacing: 0.5, color: RESULT_MUTED }}>{title}</Text>
            {list.length === 0 ? <Text style={{ fontFamily: FONT.body, fontSize: fz(12), color: RESULT_MUTED }}>{empty}</Text> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>{(expanded[col] ? list : list.slice(0, 3)).map((t) => <View key={t.topic} style={{ maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: bg }}><Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.outfit.md, fontSize: fz(11.5), color: fg }}>{t.topic}</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(10.5), color: fg }}>{t.correct}/{t.total}</Text></View>)}{list.length > 3 && <Pressable onPress={() => toggleColumn(col)} hitSlop={6} style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#F2F2F5' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(11.5), color: RESULT_MUTED }}>{expanded[col] ? 'Less' : `+${list.length - 3}`}</Text></Pressable>}</View>}
            {col === 1 && missed > 0 && <Pressable onPress={onReview} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(12.5), color: RESULT_ACCENT }}>Review {missed} missed</Text><Icon name="chevron_right" size={16} exact color={RESULT_ACCENT} /></Pressable>}
          </View>
        </React.Fragment>)}
      </View>}
      {missed > 0 && concepts.strong.length + concepts.weak.length === 0 && <Pressable onPress={onReview} style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(13), color: RESULT_ACCENT }}>Review {missed} missed</Text><Icon name="chevron_right" size={16} exact color={RESULT_ACCENT} /></Pressable>}
  </>;
}

/** A burst of falling confetti over the dialog, played once when it opens. */
function Confetti() {
  const fall = React.useRef(new Animated.Value(0)).current;
  const pieces = React.useMemo(() => Array.from({ length: 36 }, (_, i) => ({ left: ((i * 37) % 100), delay: (i % 9) * 0.05, drift: ((i * 53) % 90) - 45, spin: 360 + ((i * 71) % 540), size: 7 + (i % 4) * 2, color: ['#FBBF24', '#818CF8', '#34D399', '#FB7185', '#60A5FA'][i % 5] })), []);
  React.useEffect(() => { Animated.timing(fall, { toValue: 1, duration: 2600, useNativeDriver: true }).start(); }, [fall]);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{pieces.map((c, i) => <Animated.View key={i} style={{ position: 'absolute', top: -20, left: `${c.left}%`, width: c.size, height: c.size * 1.7, borderRadius: 2, backgroundColor: c.color, opacity: fall.interpolate({ inputRange: [0, c.delay, 0.8, 1], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' }), transform: [{ translateY: fall.interpolate({ inputRange: [0, c.delay, 1], outputRange: [0, 0, 560], extrapolate: 'clamp' }) }, { translateX: fall.interpolate({ inputRange: [0, 1], outputRange: [0, c.drift] }) }, { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${c.spin}deg`] }) }] }} />)}</View>;
}

function SpeedShareCard({ points, correct, attempted, accuracy, tier, strongIn }: { points: number; correct: number; attempted: number; accuracy: number; tier: string; strongIn: string[] }) {
  return <View style={{ width: 320, height: 400, backgroundColor: '#FFFCF9', overflow: 'hidden' }}>
    <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: 20, color: RESULT_ACCENT }}>CodeDo</Text>
        <View style={{ borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: '#EEEAFE' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 10, letterSpacing: 0.4, color: RESULT_ACCENT }}>SPEED ROUND</Text></View>
      </View>
      <View style={{ marginTop: 8, alignItems: 'center' }}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontFamily: FONT.outfit.b, fontSize: 17, color: RESULT_INK }}>{PROFILE_NAME}</Text>
        <Text style={{ marginTop: 1, fontFamily: FONT.outfit.md, fontSize: 12, color: RESULT_ACCENT }}>{tier}</Text>
      </View>
      <View style={{ marginTop: 10, height: 83, borderRadius: 16, backgroundColor: '#F1EEFF', borderWidth: 1, borderColor: '#DED7FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Image source={require('../assets/speed/light/bolt.png')} resizeMode="contain" style={{ width: 38, height: 38 }} />
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: 49, lineHeight: 55, color: '#272143' }}>{points}</Text>
        <Text style={{ alignSelf: 'center', marginTop: 19, fontFamily: FONT.outfit.b, fontSize: 10, letterSpacing: 0.7, color: RESULT_ACCENT }}>POINTS</Text>
      </View>
      <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, paddingVertical: 7, borderRadius: 10, backgroundColor: '#F7F6FA', alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 16, color: RESULT_INK }}>{correct}/{attempted}</Text><Text style={{ fontFamily: FONT.outfit.md, fontSize: 10, color: RESULT_MUTED }}>CORRECT</Text></View>
        <View style={{ flex: 1, paddingVertical: 7, borderRadius: 10, backgroundColor: '#F7F6FA', alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 16, color: RESULT_INK }}>{accuracy}%</Text><Text style={{ fontFamily: FONT.outfit.md, fontSize: 10, color: RESULT_MUTED }}>ACCURACY</Text></View>
      </View>
      {strongIn.length > 0 && <View style={{ marginTop: 9, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#D6E9DC', backgroundColor: '#F0F8F2', gap: 2 }}>
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: 12, color: '#205C38' }}>Your strong topics</Text>
        {strongIn.map((topic) => <Text key={topic} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontFamily: FONT.outfit.md, fontSize: 10.5, lineHeight: 14, color: '#2F6945' }}>•  {topic}</Text>)}
      </View>}
    </View>
    <View style={{ height: 40, backgroundColor: RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 14, color: '#FFFFFF' }}>Can you beat my score?  #CodeDo</Text></View>
  </View>;
}

function SpeedRoundDialog({ results, questions, onPlayAgain, limit, elapsed, onDone, onReview }: { results: Result[]; questions: QuizQuestion[]; onPlayAgain?: () => void; limit: number; elapsed: number; onDone: () => void; onReview: () => void }) {
  const correct = results.filter((result) => result === 'correct').length;
  const attempted = results.filter(Boolean).length;
  const missed = Math.max(0, attempted - correct);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const pace = attempted ? Math.max(1, elapsed) / attempted : 0;
  const points = speedPoints(correct, attempted);
  const [history, setHistory] = React.useState<SpeedRoundEntry[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    loadSpeedHistory().then((all) => {
      if (alive) setHistory(all.filter((e) => e.limit === limit));
      if (points > 0) AsyncStorage.setItem(SPEED_ROUND_HISTORY_KEY, JSON.stringify([...all, { limit, correct, attempted, pace, points, at: Date.now() }].slice(-100))).catch(() => {});
    }).catch(() => { if (alive) setHistory([]); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Rounds saved before points existed are scored from their counts.
  const scored = history ? history.filter((e) => entryPoints(e) > 0) : [];
  const prevBest = scored.length ? Math.max(...scored.map(entryPoints)) : null;
  const best = Math.max(prevBest ?? 0, points);
  const fasterPct = dummyFasterThan(correct, attempted, limit);
  // Label guards: under 50% accuracy or very few attempts, the label stops at "Nice Effort", and no record is set.
  const weakRound = accuracy < 50 || perMinute(attempted, limit) < 5;
  const newRecord = prevBest !== null && points > prevBest && accuracy >= 50;
  const tier = newRecord ? 'New Record! 🏆' : fasterPct >= 85 && !weakRound ? 'Outstanding! ⚡' : fasterPct >= 60 && !weakRound ? 'Great Run! 🔥' : fasterPct >= 35 ? 'Nice Effort! 👏' : 'Keep Practicing! 💪';
  const coach = speedCoachLine(attempted, missed, accuracy, limit);
  const [shown, setShown] = React.useState(points > 0 ? 1 : 0);
  React.useEffect(() => {
    if (points < 1) return undefined;
    // Count up from 1 to the points total in about 1.4 s, easing out near the end.
    const started = Date.now();
    const tick = setInterval(() => { const t = Math.min(1, (Date.now() - started) / 1400); setShown(Math.max(1, Math.round(points * (1 - (1 - t) ** 3)))); if (t === 1) clearInterval(tick); }, 30);
    return () => clearInterval(tick);
  }, [points]);
  const ink = '#202020', muted = '#7C7C8D', accent = '#5146E5', rule = '#E2E2E8';
  const box = { marginTop: 12, width: '100%', borderRadius: 18, borderWidth: 1, borderColor: rule, backgroundColor: '#FFFFFF' } as const;
  const bestNote = !history ? '' : prevBest === null ? 'first round' : points > prevBest ? `+${points - prevBest} on ${prevBest}` : `${best - points + 5} more to beat`;
  const strongIn = React.useMemo(() => conceptSummary(questions, results).strong.slice(0, 4).map((t) => t.topic), [questions, results]);
  const shareRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = React.useState(false);
  const shareResult = async () => {
    if (sharing || !shareRef.current) return;
    setSharing(true);
    try {
      const file = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 });
      await Share.open({ url: file.startsWith('file://') ? file : `file://${file}`, type: 'image/png', message: `${PROFILE_NAME} scored ${points} points in CodeDo Speed Round with ${correct}/${attempted} correct. Can you beat my score? #CodeDo`, failOnCancel: false });
    } catch {
      Alert.alert('Could not share', 'Something went wrong while preparing the picture. Please try again.');
    } finally {
      setSharing(false);
    }
  };
  return <View style={{ flex: 1, backgroundColor: '#242424', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
    <View ref={shareRef} collapsable={false} pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', width: 320, height: 400, marginTop: -200, marginLeft: -160 }}><SpeedShareCard points={points} correct={correct} attempted={attempted} accuracy={accuracy} tier={tier} strongIn={strongIn} /></View>
    <View style={{ width: '100%', maxWidth: 550, maxHeight: '100%', borderRadius: 18, backgroundColor: '#FFFCF9', overflow: 'hidden' }}>
    <View style={{ height: 34, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone} hitSlop={10}><Icon name="close" size={26} exact color={ink} /></Pressable><SharePreviewButton><SpeedShareCard points={points} correct={correct} attempted={attempted} accuracy={accuracy} tier={tier} strongIn={strongIn} /></SharePreviewButton></View>
    <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: ink }}>{PROFILE_NAME}</Text>
      <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: accent }}>{tier}</Text>
      <Text style={{ marginTop: 2, fontFamily: FONT.outfit.b, fontSize: fz(64), lineHeight: fz(70), color: '#191919' }}>{shown}</Text>
      <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(11), letterSpacing: 0.6, color: muted }}>POINTS</Text>
      <Text style={{ marginTop: 6, fontFamily: FONT.outfit.md, fontSize: fz(16), color: ink }}>{correct} correct <Text style={{ fontFamily: FONT.outfit.b, color: '#4F7A5A' }}>+{correct * 10}</Text>  ·  {missed} wrong <Text style={{ fontFamily: FONT.outfit.b, color: missed ? '#B4442F' : muted }}>−{missed * 5}</Text></Text>
      {coach && <Text style={{ marginTop: 4, fontFamily: FONT.body, fontSize: fz(13), color: muted, textAlign: 'center' }}>{coach}</Text>}
      <Pressable onPress={shareResult} disabled={sharing} accessibilityRole="button" accessibilityLabel="Share Speed Round result" style={{ alignSelf: 'stretch', marginTop: 10, height: 42, borderRadius: 12, backgroundColor: accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sharing ? 0.6 : 1 }}><ResultIcon name="share" size={18} color="#FFFFFF" /><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: '#FFFFFF' }}>Share your result</Text></Pressable>
      <View style={[box, { marginTop: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }]}>{resultStat('done_all', accent, `${attempted}`, 'ATTEMPTED')}<View style={{ width: 1, height: 36, backgroundColor: rule }} />{resultStat('check_circle', '#4F7A5A', attempted ? `${accuracy}%` : '–', 'ACCURACY')}<View style={{ width: 1, height: 36, backgroundColor: rule }} />{resultStat('schedule', accent, attempted ? `${pace.toFixed(1)}s` : '–', 'AVG PACE', false)}</View>
      <View style={[box, { paddingHorizontal: 14, paddingVertical: 10, gap: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ResultIcon name="bolt" size={18} color={accent} /><Text style={{ flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(14), color: '#29252D' }}>Faster than <Text style={{ fontFamily: FONT.outfit.b, color: accent }}>{fasterPct}%</Text> of learners</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ResultIcon name="emoji_events" size={18} color={accent} /><Text style={{ flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(14), color: '#29252D' }}>Personal Best <Text style={{ fontFamily: FONT.outfit.b, color: accent }}>{best} points</Text>{bestNote ? <Text style={{ fontFamily: FONT.body, fontSize: fz(13), color: muted }}>  ·  {bestNote}</Text> : null}</Text></View>
      </View>
      <ConceptSummaryBox questions={questions} results={results} missed={missed} onReview={onReview} />
    </ScrollView>
    <View style={{ borderTopWidth: BW, borderTopColor: '#EEEEF2', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 12 }}><Pressable onPress={onDone} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: BW, borderColor: rule, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#29252D' }}>Back to Quiz</Text></Pressable><Pressable onPress={onPlayAgain ?? onDone} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: accent, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#FFFFFF' }}>Play Again</Text><ResultIcon name="bolt" size={18} color="#FFFFFF" /></Pressable></View>
    {points > 0 && <Confetti />}
  </View></View>;
}

// Concepts split by how the bet went: sure or fairly sure and right, right on a guess, sure and wrong.
function StakesConceptBox({ questions, results, bets, missed, onReview }: { questions: QuizQuestion[]; results: Result[]; bets: (BetId | undefined)[]; missed: number; onReview: () => void }) {
  const groups = React.useMemo(() => {
    const knew = new Set<string>(), lucky = new Set<string>(), bold = new Set<string>();
    results.forEach((r, i) => {
      const topic = questions[i]?.topic, bet = bets[i];
      if (!r || !topic || !bet) return;
      if (r === 'correct') (bet === 'guess' ? lucky : knew).add(topic);
      else if (bet === 'sure') bold.add(topic);
    });
    return ([['KNEW IT', [...knew], '#EAF3EC', '#3E6B4A'], ['LUCKY GUESS', [...lucky], '#FEF3C7', '#92400E'], ['OVERCONFIDENT', [...bold], '#FBEDE9', '#A63D2A']] as const).filter(([, list]) => list.length > 0);
  }, [questions, results, bets]);
  if (!groups.length && !missed) return null;
  return <View style={[RESULT_BOX, { paddingHorizontal: 14, paddingVertical: 10, gap: 9 }]}>
    {groups.map(([title, list, bg, fg], groupIndex) => <View key={title} style={{ gap: 5, borderTopWidth: groupIndex ? BW : 0, borderTopColor: '#E8E8EE', paddingTop: groupIndex ? 8 : 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(12), color: fg }}>{title === 'OVERCONFIDENT' ? '✕' : '✓'}</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(10), letterSpacing: 0.6, color: fg }}>{title}</Text></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>{list.map((topic) => <View key={topic} style={{ maxWidth: '100%', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: bg }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(10.5), lineHeight: lh(10.5, 1.25), color: fg }}>{topic}</Text></View>)}</View>
    </View>)}
    {missed > 0 && <Pressable onPress={onReview} hitSlop={8} style={{ borderTopWidth: groups.length ? BW : 0, borderTopColor: '#E8E8EE', paddingTop: groups.length ? 8 : 0, flexDirection: 'row', alignItems: 'center', gap: 3 }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(12), color: RESULT_ACCENT }}>Review {missed} missed</Text><Icon name="chevron_right" size={15} exact color={RESULT_ACCENT} /></Pressable>}
  </View>;
}

// Preview the same card that will be shared.
function SharePreviewButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <>
    <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Preview share image" hitSlop={8} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}><Icon name="visibility" size={22} exact color={RESULT_INK} /></Pressable>
    <Modal transparent animationType="fade" statusBarTranslucent visible={open} onRequestClose={() => setOpen(false)}>
      <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 320, maxHeight: '90%', borderRadius: 12, overflow: 'hidden' }}>{children}</View>
        <Text style={{ marginTop: 14, fontFamily: FONT.outfit.md, fontSize: fz(13), color: '#FFFFFF' }}>Tap anywhere to close</Text>
      </Pressable>
    </Modal>
  </>;
}

function StakesShareCard({ coins, tier, strongIn = [] }: { coins: number; change?: number; correct?: number; attempted?: number; tier: string; strongIn?: string[] }) {
  return <View style={{ width: 320, height: 400, backgroundColor: '#FFFCF9' }}>
    <View style={{ paddingHorizontal: 24, paddingTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 21, color: RESULT_ACCENT }}>CodeDo</Text><View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F0EDFF' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 10.5, letterSpacing: 1, color: RESULT_ACCENT }}>HIGH STAKES</Text></View></View>
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 16, justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Image source={require('../assets/stakes/robot-reading.png')} resizeMode="contain" style={{ width: 38, height: 38 }} />
          <View style={{ flexShrink: 1 }}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ fontFamily: FONT.outfit.b, fontSize: 18, color: RESULT_ACCENT }}>{PROFILE_NAME}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.outfit.md, fontSize: 12, color: RESULT_MUTED }}>{tier}</Text>
          </View>
        </View>
        <View style={{ marginTop: 14, alignSelf: 'stretch', paddingVertical: 12, borderRadius: 18, backgroundColor: '#F6F3FF', borderWidth: 1, borderColor: '#E4DEFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Text style={{ fontSize: 32 }}>🪙</Text>
          <Text style={{ fontFamily: FONT.outfit.b, fontSize: 40, lineHeight: 46, color: RESULT_INK }}>{coins}</Text>
          <Text style={{ fontFamily: FONT.outfit.md, fontSize: 18, color: RESULT_MUTED }}>coins</Text>
        </View>
      </View>
      {strongIn.length > 0 && <View style={{ alignItems: 'center' }}>
        <Text style={{ marginBottom: 8, textAlign: 'center', fontFamily: FONT.outfit.b, fontSize: 10.5, letterSpacing: 1.2, color: RESULT_MUTED }}>STRONG IN</Text>
        {/* One block, centred as a whole; inside it the ticks and names start at the same left edge. */}
        <View style={{ maxWidth: '100%', alignItems: 'flex-start', gap: 6 }}>
          {strongIn.map((t) => <View key={t} style={{ maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#EAF3EC', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 11, color: '#3E6B4A' }}>✓</Text></View>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ flexShrink: 1, fontFamily: FONT.outfit.md, fontSize: 14, color: '#2F4F39' }}>{t}</Text>
          </View>)}
        </View>
      </View>}
    </View>
    <View style={{ height: 42, backgroundColor: RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 14, color: '#FFFFFF' }}>Can you beat my score?  #CodeDo</Text></View>
  </View>;
}

function StakesDialog({ results, questions, bets, shieldSavings, onPlayAgain, onDone, onReview }: { results: Result[]; questions: QuizQuestion[]; bets: (BetId | undefined)[]; shieldSavings: number; onPlayAgain?: () => void; onDone: () => void; onReview: () => void }) {
  const correct = results.filter((r) => r === 'correct').length;
  const attempted = results.filter(Boolean).length;
  const missed = Math.max(0, attempted - correct);
  const coins = Math.max(0, STAKES_START + results.reduce((sum, r, i) => sum + (r && bets[i] ? payout(bets[i]!, r === 'correct') : 0), 0) + shieldSavings);
  const change = coins - STAKES_START;
  // How often each bet was right: the calibration this mode is about.
  const calibration = BETS.map((b) => {
    const idx = results.map((r, i) => (r && bets[i] === b.id ? i : -1)).filter((i) => i >= 0);
    return { ...b, total: idx.length, right: idx.filter((i) => results[i] === 'correct').length };
  }).filter((c) => c.total > 0);
  const sure = calibration.find((c) => c.id === 'sure'), guess = calibration.find((c) => c.id === 'guess');
  const overconfident = !!(sure && sure.total >= 2 && sure.right / sure.total < 0.6);
  const coach = overconfident && sure ? `Missed ${sure.total - sure.right} while confident. Pause before big bets.`
    : guess && guess.total >= 2 && guess.right / guess.total >= 0.7 ? 'You know more than you think. Bet higher next time.'
    : attempted ? 'Nice work! You made thoughtful bets and trusted your knowledge.' : 'Answer a question to place a bet.';
  const [prevBest, setPrevBest] = React.useState<number | null | undefined>(undefined);
  React.useEffect(() => {
    let alive = true;
    loadStakesBest().then((best) => {
      if (alive) setPrevBest(best);
      if (attempted > 0) saveStakesRound({ coins, correct, attempted, at: Date.now() });
    });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const best = Math.max(prevBest ?? 0, coins);
  const newRecord = prevBest != null && coins > prevBest;
  const tier = newRecord ? 'New Record!' : coins >= 200 ? 'Sharp Instincts!' : coins >= 150 ? 'Well Judged!' : coins >= 100 ? 'Held Your Ground!' : 'Too Bold This Time!';
  // The concepts answered right every time (the five most-answered fit on the card).
  const strongIn = React.useMemo(() => conceptSummary(questions, results).strong.slice(0, 5).map((t) => t.topic), [questions, results]);
  const shareRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = React.useState(false);
  const [shieldEarned, setShieldEarned] = React.useState(false);
  const [shieldDialog, setShieldDialog] = React.useState(false);
  const shareResult = async () => {
    if (sharing || !shareRef.current) return;
    setSharing(true);
    try {
      const file = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 });
      const shared = await Share.open({ url: file.startsWith('file://') ? file : `file://${file}`, type: 'image/png', message: `${PROFILE_NAME.split(' ')[0]} finished CodeDo High Stakes with ${coins} coins (${change >= 0 ? `+${change}` : `−${-change}`}) and ${correct}/${attempted} correct.${strongIn.length ? ` Strong in ${strongIn.slice(0, 3).join(', ')}.` : ''} Can you beat my score? #CodeDo`, failOnCancel: false });
      if (shared?.success) { await grantStakesShield(); setShieldEarned(true); setShieldDialog(true); }
    } catch {
      Alert.alert('Could not share', 'Something went wrong while preparing the picture. Please try again.');
    } finally {
      setSharing(false);
    }
  };
  const bestNote = prevBest === undefined ? '' : prevBest === null ? 'first round' : newRecord ? `+${coins - prevBest} on ${prevBest}` : `${best - coins + 5} more to beat`;
  const [shown, setShown] = React.useState(STAKES_START);
  React.useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => { const t = Math.min(1, (Date.now() - started) / 1200); setShown(Math.round(STAKES_START + change * (1 - (1 - t) ** 3))); if (t === 1) clearInterval(tick); }, 30);
    return () => clearInterval(tick);
  }, [change]);
  return <View style={{ flex: 1, backgroundColor: '#242424', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
    <Modal transparent animationType="fade" statusBarTranslucent visible={shieldDialog} onRequestClose={() => setShieldDialog(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <View style={{ width: '100%', maxWidth: 340, borderRadius: 20, backgroundColor: '#FFFCF9', padding: 22, alignItems: 'center' }}>
          <Text style={{ fontSize: fz(48) }}>🛡️</Text>
          <Text style={{ marginTop: 6, fontFamily: FONT.outfit.b, fontSize: fz(20), color: '#191919', textAlign: 'center' }}>Safety Shield earned!</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.body, fontSize: fz(14), lineHeight: lh(14, 1.4), color: RESULT_MUTED, textAlign: 'center' }}>Thanks for sharing. On your next High Stakes round, it saves up to {STAKES_SHIELD_SAVINGS} coins on your first wrong bet.</Text>
          <Pressable onPress={() => setShieldDialog(false)} accessibilityRole="button" style={{ alignSelf: 'stretch', marginTop: 16, height: 44, borderRadius: 12, backgroundColor: RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(15), color: '#FFFFFF' }}>Got it</Text></Pressable>
        </View>
      </View>
    </Modal>
    <View ref={shareRef} collapsable={false} pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', width: 320, height: 400, marginTop: -200, marginLeft: -160 }}><StakesShareCard strongIn={strongIn} coins={coins} change={change} correct={correct} attempted={attempted} tier={tier} /></View>
    <View style={{ width: '100%', maxWidth: 550, maxHeight: '100%', borderRadius: 18, backgroundColor: '#FFFCF9', overflow: 'hidden' }}>
    <View style={{ height: 34, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close results"><Icon name="close" size={22} exact color={RESULT_INK} /></Pressable><SharePreviewButton><StakesShareCard strongIn={strongIn} coins={coins} change={change} correct={correct} attempted={attempted} tier={tier} /></SharePreviewButton></View>
    <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, alignItems: 'center' }}>
      <View style={{ maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F0EDFF' }}><Image source={require('../assets/stakes/robot-reading.png')} resizeMode="contain" style={{ width: 22, height: 22 }} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ flexShrink: 1, fontFamily: FONT.outfit.b, fontSize: fz(13), color: RESULT_ACCENT }}>{PROFILE_NAME}, {tier}</Text></View>
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Text style={{ fontSize: fz(30) }}>🪙</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(56), lineHeight: fz(62), color: '#191919' }}>{shown}</Text></View>
      {overconfident
        ? <View style={{ marginTop: 7, alignSelf: 'center', maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: '#FFF4E5', borderWidth: BW, borderColor: '#F3D5A5' }}><Text style={{ fontSize: fz(12) }}>⚠️</Text><Text style={{ flexShrink: 1, fontFamily: FONT.outfit.md, fontSize: fz(11.5), lineHeight: lh(11.5, 1.25), color: '#86521E' }}>{coach}</Text></View>
        : <Text style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 4, fontFamily: FONT.body, fontSize: fz(13), lineHeight: lh(13, 1.4), color: RESULT_MUTED, textAlign: 'center' }}>{coach}</Text>}
      <Pressable onPress={shareResult} disabled={sharing} accessibilityRole="button" accessibilityLabel="Share High Stakes result" style={{ alignSelf: 'stretch', marginTop: 10, height: 42, borderRadius: 12, backgroundColor: newRecord ? '#B45309' : RESULT_ACCENT, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sharing ? 0.6 : 1 }}><ResultIcon name="share" size={18} color="#FFFFFF" /><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: '#FFFFFF' }}>{newRecord ? 'Share your new record' : 'Share your result'} · +🛡️</Text></Pressable>
      <Text style={{ marginTop: 5, fontFamily: FONT.body, fontSize: fz(11.5), color: shieldEarned ? '#3E6B4A' : RESULT_MUTED, textAlign: 'center' }}>{shieldEarned ? 'Safety Shield saved for your next round' : 'Share to save up to 10 coins on your next wrong bet'}</Text>
      {calibration.length > 0 && <View style={[RESULT_BOX, { marginTop: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'stretch' }]}>
        {calibration.map((c, i) => <React.Fragment key={c.id}>
          {i > 0 && <View style={{ width: BW, backgroundColor: RESULT_RULE }} />}
          <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 8, alignItems: 'center', gap: 4 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.outfit.b, fontSize: fz(10), letterSpacing: 0.4, color: RESULT_MUTED }}>{c.label.toUpperCase()}</Text>
            <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(19), color: RESULT_INK }}>{c.right}<Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(13), color: RESULT_MUTED }}>/{c.total}</Text></Text>
            <View style={{ width: '80%', height: 4, borderRadius: 2, backgroundColor: '#E8E8EE', overflow: 'hidden' }}><View style={{ width: `${(c.right / c.total) * 100}%`, height: '100%', borderRadius: 2, backgroundColor: c.right / c.total >= 0.7 ? '#4F7A5A' : c.right / c.total >= 0.4 ? '#C1842E' : '#B4442F' }} /></View>
          </View>
        </React.Fragment>)}
      </View>}
      <View style={[RESULT_BOX, { paddingHorizontal: 14, paddingVertical: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ResultIcon name="emoji_events" size={18} color={RESULT_ACCENT} /><Text style={{ flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(14), color: '#29252D' }}>Best <Text style={{ fontFamily: FONT.outfit.b, color: RESULT_ACCENT }}>{best} coins</Text>{bestNote ? <Text style={{ fontFamily: FONT.body, fontSize: fz(13), color: RESULT_MUTED }}>  ·  {bestNote}</Text> : null}</Text></View>
      </View>
      <StakesConceptBox questions={questions} results={results} bets={bets} missed={missed} onReview={onReview} />
    </ScrollView>
    <View style={{ borderTopWidth: BW, borderTopColor: '#EEEEF2', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 12 }}><Pressable onPress={onDone} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: BW, borderColor: RESULT_RULE, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#29252D' }}>Back to Quiz</Text></Pressable><Pressable onPress={onPlayAgain ?? onDone} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#FFFFFF' }}>Bet Again 🪙</Text></Pressable></View>
    {change > 0 && <Confetti />}
  </View></View>;
}

const STEP_ACCENT = ['#15803D', '#4F46E5', '#B45309', '#B91C1C', '#5B21B6'];

/**
 * The illustrated hero for a level: the art fills the width, and the number of each step is drawn on its front face (anchors are
 * fractions of the image, so they scale with it). The labels are decorative: the same
 * facts are in the text under the hero, and the whole hero reads as one line to a screen reader.
 */
function SurvivalArtHero({ art, level, correct, description, still = false }: { art: SurvivalArt; level: number; correct: number; description?: string; /** No fade-in: drawn in its final state (the share card is captured as an image). */ still?: boolean }) {
  const [width, setWidth] = React.useState(0);
  // A plain fade: a scale transform on the parent made the Android image view draw the picture at the wrong size and place.
  const enter = React.useRef(new Animated.Value(still ? 1 : 0)).current;
  React.useEffect(() => { if (!still) Animated.timing(enter, { toValue: 1, duration: 450, useNativeDriver: true }).start(); }, [enter, still]);
  const height = width * (art.height / art.width);
  return (
    <Animated.View
      accessible
      accessibilityLabel={description ?? `Level ${level} on the ladder, ${correct} correct`}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ alignSelf: 'stretch', marginHorizontal: -8, marginTop: 4, aspectRatio: art.width / art.height, opacity: enter }}
    >
      {/* Explicit pixel size from the measured width (not a fill), so the picture can only be drawn at the size of its box. */}
      {width > 0 && <Image source={art.source} fadeDuration={0} resizeMode="contain" style={{ position: 'absolute', left: 0, top: 0, width, height }} />}
      {/* The labels are SVG text in the picture's own pixel space: placed by baseline, so no Android line box can clip them, and they scale exactly with the image. */}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${art.width} ${art.height}`}>
          {art.faces.map((f, i) => {
            const text = art.labels ? art.labels(level)[i] : String(i === art.faces.length - 1 ? Math.max(art.faces.length, level) : i + 1);
            if (text == null) return null;
            const pill = !!art.pills?.includes(i);
            const cx = (f.x + f.w / 2) * art.width, cy = (f.y + f.h / 2) * art.height;
            // Sized to the step face: a short or narrow face (a low step, or one half hidden by clouds) gets a smaller number.
            const size = Math.min(art.width * (pill ? 0.04 : 0.05), f.h * art.height * 0.8, f.w * art.width * 0.55);
            const pillW = text.length * size * 0.62 + size * 1.2, pillH = size * 1.6;
            return (
              <React.Fragment key={i}>
                {pill && <Rect x={cx - pillW / 2} y={cy - pillH / 2} width={pillW} height={pillH} rx={pillH / 2} fill="#FFFFFF" fillOpacity={0.92} stroke="#DDD6FE" strokeWidth={art.width * 0.0012} />}
                <SvgText x={cx} y={cy + size * 0.36} fontSize={size} fontFamily={FONT.outfit.b} fill={art.colors?.[i] ?? (i >= art.lit ? '#9CA3AF' : STEP_ACCENT[i])} fillOpacity={0.9} textAnchor="middle">{text}</SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </Animated.View>
  );
}

// The picture people share: a fixed 4:5 portrait card (it is captured at 1080 x 1350, the shape WhatsApp, Instagram and LinkedIn all show well).
// It is laid out at 320 x 400 with plain font sizes, so it looks the same on every phone whatever the font scale. A record or a Level 5+
// climb gets a gold look and a record gets a ribbon, because that is what people want to show off. Add the store link to `shareFooter`
// (and to the message in `shareResult`) once the app is live.
const SHARE_W = 320, SHARE_H = 400;
const shareFooter = (level: number) => `Can you beat Level ${level}?  #CodeDo`;

function SurvivalShareCard({ level, correct, accuracy, bestClimb, tier, newRecord, strongIn, wrapContent = false }: { level: number; correct: number; accuracy: number; bestClimb: number; tier: string; newRecord: boolean; strongIn: string[]; wrapContent?: boolean }) {
  const art = survivalArtFor(level);
  const gold = newRecord || level >= 5;
  const answers = correct === 1 ? '1 right answer' : `${correct} right answers`;
  return (
    <View style={{ width: SHARE_W, height: wrapContent ? undefined : SHARE_H, backgroundColor: gold ? '#FFF8E7' : '#FFFCF9', alignItems: 'center' }}>
      <View style={{ alignSelf: 'stretch', paddingHorizontal: 18, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: 21, color: RESULT_ACCENT }}>CodeDo</Text>
        <Text style={{ fontFamily: FONT.outfit.md, fontSize: 11, letterSpacing: 0.8, color: RESULT_MUTED }}>SURVIVAL LADDER</Text>
      </View>
      {/* The picture and its text are centred in the space between the header and the footer band. */}
      <View style={{ flex: wrapContent ? undefined : 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingBottom: wrapContent ? 16 : 46 }}>
        {newRecord && <View style={{ marginBottom: 6, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 999, backgroundColor: '#F59E0B' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: 11.5, letterSpacing: 0.8, color: '#FFFFFF' }}>🏆  NEW RECORD</Text></View>}
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ fontFamily: FONT.outfit.b, fontSize: 14, color: RESULT_ACCENT }}>{PROFILE_NAME}</Text>
        {!newRecord && <Text style={{ fontFamily: FONT.outfit.md, fontSize: 13, color: RESULT_ACCENT }}>{tier}</Text>}
        <View style={{ alignSelf: 'stretch', paddingHorizontal: 10 }}>{art && <SurvivalArtHero still art={art} level={level} correct={correct} />}</View>
        <Text style={{ marginTop: 6, fontFamily: FONT.outfit.b, fontSize: 24, color: RESULT_INK }}>You reached Level {level}</Text>
        <Text style={{ marginTop: 2, fontFamily: FONT.outfit.md, fontSize: 16, color: '#3E6B4A' }}>{answers}</Text>
        {strongIn.length > 0 && <View style={{ alignSelf: 'stretch', marginTop: 9, marginHorizontal: 18, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: '#D6E9DC', backgroundColor: '#F0F8F2', alignItems: 'center', gap: 7 }}>
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={{ width: 3, height: 17, borderRadius: 2, backgroundColor: '#3E6B4A' }} />
            <Text style={{ flex: 1, fontFamily: FONT.outfit.b, fontSize: 14, lineHeight: 18, color: '#205C38' }}>Your strong topics</Text>
            <Text style={{ fontFamily: FONT.outfit.b, fontSize: 11, color: '#3E6B4A' }}>{accuracy}% accuracy</Text>
          </View>
          <View style={{ alignSelf: 'stretch', gap: 4 }}>
            {strongIn.map((topic) => <View key={topic} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
              <Text style={{ fontFamily: FONT.outfit.b, fontSize: 13, lineHeight: 17, color: '#3E6B4A' }}>•</Text>
              <Text style={{ flex: 1, fontFamily: FONT.outfit.md, fontSize: 12, lineHeight: 17, color: '#2F6945' }}>{topic}</Text>
            </View>)}
          </View>
        </View>}
        {bestClimb > 0 && !newRecord && <Text style={{ marginTop: 6, fontFamily: FONT.body, fontSize: 12.5, color: RESULT_MUTED }}>🏆 Best climb: Level {survivalLevel(bestClimb)}</Text>}
      </View>
      <View style={{ position: wrapContent ? 'relative' : 'absolute', left: 0, right: 0, bottom: 0, alignSelf: 'stretch', height: 46, backgroundColor: gold ? '#B45309' : RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: 15, color: '#FFFFFF' }}>{shareFooter(level)}</Text>
      </View>
    </View>
  );
}

// 1st, 2nd, 3rd, 4th ... 11th, 12th, 13th ... 21st.
const ordinal = (n: number) => {
  const mod100 = n % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
};

function SurvivalDialog({ lives, results, questions, onPlayAgain, onDone, onReview }: { lives: number; results: Result[]; questions: QuizQuestion[]; onPlayAgain?: () => void; onDone: () => void; onReview: () => void }) {
  const correct = results.filter((result) => result === 'correct').length;
  const attempted = results.filter(Boolean).length;
  const missed = Math.max(0, attempted - correct);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const level = survivalLevel(correct);
  const toNext = SURVIVAL_LEVEL_STEP - (correct % SURVIVAL_LEVEL_STEP);
  // Where each heart was lost: the question number, the level it was asked at, and its concept.
  let climbed = 0;
  const losses: { q: number; level: number; topic: string }[] = [];
  results.forEach((r, i) => {
    if (r === 'correct') climbed++;
    else if (r === 'wrong') losses.push({ q: i + 1, level: survivalLevel(climbed), topic: questions[i]?.topic ?? '' });
  });
  // Best climb before this run (undefined while loading), then this run is saved.
  const [prevBest, setPrevBest] = React.useState<number | null | undefined>(undefined);
  // A climb that started with the bonus heart has now used it.
  React.useEffect(() => { if (lives > SURVIVAL_LIVES) spendSurvivalBonus(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    let alive = true;
    loadSurvivalBest().then((best) => {
      if (alive) setPrevBest(best);
      if (correct > 0) saveSurvivalRun({ correct, attempted, level, at: Date.now() });
    });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const newRecord = prevBest != null && correct > prevBest;
  // The best climb including this run (nothing until the earlier runs have loaded).
  const bestClimb = prevBest === undefined ? 0 : Math.max(prevBest ?? 0, correct);
  // A run with no correct answer never really climbed: a sad face and a gentler message instead of "Level 1".
  const noClimb = attempted > 0 && correct === 0;
  const tier = noClimb ? 'Tough Start 😔' : newRecord ? 'New Record! 🏆' : level >= 4 ? 'Legendary Climb! ⚡' : level === 3 ? 'Great Climb! 🔥' : level === 2 ? 'Nice Climb! 👏' : 'Keep Climbing! 💪';
  // The run is over, so the wording is past tense: what you reached, how many you got right, and what was one step short.
  const rightAnswers = correct === 1 ? '1 right answer' : `${correct} right answers`;
  // What the learner achieved is said positively; what would have been next is a separate hint.
  const positive = noClimb ? null : rightAnswers;
  // The concepts you answered right every time, ordered by how often they appeared.
  const strongIn = React.useMemo(() => conceptSummary(questions, results).strong.slice(0, 4).map((t) => t.topic), [questions, results]);
  // Share: the card below is drawn behind the dialog (full size, always loaded), then captured as a PNG and handed to the phone's share sheet.
  const shareRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const [sharing, setSharing] = React.useState(false);
  // Set once a share went through: the reward is one bonus heart for the next climb.
  const [bonusEarned, setBonusEarned] = React.useState(false);
  const [bonusDialog, setBonusDialog] = React.useState(false);
  const shareResult = async () => {
    if (sharing || !shareRef.current) return;
    setSharing(true);
    try {
      const file = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 });
      const shared = await Share.open({
        url: file.startsWith('file://') ? file : `file://${file}`,
        type: 'image/png',
        message: `I reached Level ${level} in the CodeDo Survival Ladder with ${correct === 1 ? '1 right answer' : `${correct} right answers`}${newRecord ? ', a new personal record' : ''}!${strongIn.length ? ` Strong in ${strongIn.join(' and ')}.` : ''} Can you beat Level ${level}? #CodeDo`,
        failOnCancel: false,
      });
      // Android reports success once an app was picked in the share sheet; iOS, once the share completed. Cancelling earns nothing.
      if (shared?.success) { await grantSurvivalBonus(); setBonusEarned(true); setBonusDialog(true); }
    } catch {
      Alert.alert('Could not share', 'Something went wrong while preparing the picture. Please try again.');
    } finally {
      setSharing(false);
    }
  };
  const hint = noClimb ? { icon: '💡', text: 'The first questions are the easiest. Take your time and try again.' }
    : newRecord ? { icon: '🏆', text: `${correct - prevBest!} more than your best of ${prevBest}.` }
    : { icon: '💡', text: `${toNext} more right ${toNext === 1 ? 'answer' : 'answers'} would have reached ${ordinal(level + 1)} Level.` };
  return <View style={{ flex: 1, backgroundColor: '#242424', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
    <Modal transparent animationType="fade" statusBarTranslucent visible={bonusDialog} onRequestClose={() => setBonusDialog(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <View style={{ width: '100%', maxWidth: 340, borderRadius: 20, backgroundColor: '#FFFCF9', padding: 22, alignItems: 'center' }}>
          <Text style={{ fontSize: fz(48) }}>❤️</Text>
          <Text style={{ marginTop: 6, fontFamily: FONT.outfit.b, fontSize: fz(20), color: '#191919', textAlign: 'center' }}>Bonus heart earned!</Text>
          <Text style={{ marginTop: 8, fontFamily: FONT.body, fontSize: fz(14), lineHeight: lh(14, 1.4), color: RESULT_MUTED, textAlign: 'center' }}>Thanks for sharing. Your next Survival Ladder starts with one extra heart.</Text>
          <Pressable onPress={() => setBonusDialog(false)} accessibilityRole="button" style={{ alignSelf: 'stretch', marginTop: 16, height: 44, borderRadius: 12, backgroundColor: RESULT_ACCENT, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(15), color: '#FFFFFF' }}>Got it</Text></Pressable>
        </View>
      </View>
    </Modal>
    {/* The share card sits centred behind the dialog (which covers it), so it is on screen and loaded when captured. */}
    {!noClimb && <View ref={shareRef} collapsable={false} pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', width: SHARE_W, height: SHARE_H, marginTop: -SHARE_H / 2, marginLeft: -SHARE_W / 2 }}><SurvivalShareCard level={level} correct={correct} accuracy={accuracy} bestClimb={bestClimb} tier={tier} newRecord={newRecord} strongIn={strongIn} /></View>}
    <View style={{ width: '100%', maxWidth: 550, maxHeight: '100%', borderRadius: 18, backgroundColor: '#FFFCF9', overflow: 'hidden' }}>
    <View style={{ height: 34, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone} hitSlop={10}><Icon name="close" size={26} exact color={RESULT_INK} /></Pressable>{!noClimb && <SharePreviewButton><SurvivalShareCard level={level} correct={correct} accuracy={accuracy} bestClimb={bestClimb} tier={tier} newRecord={newRecord} strongIn={strongIn} wrapContent /></SharePreviewButton>}</View>
    <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: RESULT_INK }}>{PROFILE_NAME}</Text>
      <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: RESULT_ACCENT }}>{tier}</Text>
      {survivalArtFor(level, noClimb) && <SurvivalArtHero key={noClimb ? 0 : level} art={survivalArtFor(level, noClimb)!} level={level} correct={correct} description={noClimb ? 'The climber fell before the first step: no correct answers' : undefined} />}
      <Text style={{ marginTop: 10, fontFamily: FONT.outfit.b, fontSize: fz(17), color: RESULT_INK }}>{noClimb ? 'No correct answers yet' : `You reached Level ${level}`}</Text>
      {positive && <Text style={{ marginTop: 3, fontFamily: FONT.outfit.md, fontSize: fz(14), color: '#3E6B4A', textAlign: 'center' }}>{positive}</Text>}
      {/* One line always: the pill spans the dialog and the text shrinks a little if a long level name needs it, but never wraps. */}
      <View style={{ alignSelf: 'stretch', marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 7 }}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: FONT.body, fontSize: fz(12), color: '#92400E', textAlign: 'center' }}>{hint.icon} {hint.text}</Text>
      </View>
      {/* The one way to share, offered on every climb that got something right (a run with none is nothing to post). */}
      {!noClimb && <Pressable onPress={shareResult} disabled={sharing} accessibilityRole="button" style={{ alignSelf: 'stretch', marginTop: 10, height: 44, borderRadius: 12, backgroundColor: newRecord ? '#F59E0B' : RESULT_ACCENT, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: sharing ? 0.6 : 1 }}>
        <ResultIcon name="share" size={18} color="#FFFFFF" />
        <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#FFFFFF' }}>{newRecord ? 'Share your new record' : 'Share your climb'}  +❤️</Text>
      </Pressable>}
      {/* The reward: said before sharing, confirmed after. */}
      {!noClimb && (bonusEarned
        ? <Text style={{ marginTop: 6, fontFamily: FONT.outfit.md, fontSize: fz(12.5), color: '#3E6B4A', textAlign: 'center' }}>🎉 Bonus heart added! Your next climb starts with {SURVIVAL_LIVES + 1} ❤️</Text>
        : <Text style={{ marginTop: 6, fontFamily: FONT.body, fontSize: fz(12.5), color: RESULT_MUTED, textAlign: 'center' }}>Share it and start your next climb with an extra heart</Text>)}
      {/* Heart log: where each heart went */}
      <View style={[RESULT_BOX, { marginTop: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }]}>
        <Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(10.5), letterSpacing: 0.5, color: RESULT_MUTED }}>WHERE YOUR HEARTS WENT</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: lives }, (_, i) => {
            const loss = losses[i];
            return <View key={i} style={{ flexGrow: 1, flexBasis: lives > 3 ? '46%' : 0, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 12, backgroundColor: loss ? '#FFF1F2' : '#F0FDF4' }}>
              <Text style={{ fontSize: fz(16) }}>{loss ? '💔' : '❤️'}</Text>
              <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(11.5), color: loss ? '#9F1239' : '#166534' }}>{loss ? `Q${loss.q} · ${DIFFICULTY_LABEL[difficultyForLevel(loss.level)]}` : 'Kept'}</Text>
              {/* The concept name wraps onto as many lines as it needs (the three tiles stretch to the same height), so it is never cut off. */}
              {loss && <Text style={{ alignSelf: 'stretch', paddingHorizontal: 6, fontFamily: FONT.body, fontSize: fz(11), lineHeight: fz(14), color: RESULT_MUTED, textAlign: 'center' }}>{loss.topic}</Text>}
            </View>;
          })}
        </View>
        {missed > 0 && <Pressable onPress={onReview} hitSlop={8} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 2 }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(12.5), color: RESULT_ACCENT }}>Review {missed} missed</Text><Icon name="chevron_right" size={16} exact color={RESULT_ACCENT} /></Pressable>}
      </View>
      {/* The best climb, on every run: before, it only showed up when a record was broken. */}
      {bestClimb > 0 && <View style={[RESULT_BOX, { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <ResultIcon name="emoji_events" size={18} color={RESULT_ACCENT} />
        <Text style={{ flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(14), color: '#29252D' }}>Best climb <Text style={{ fontFamily: FONT.outfit.b, color: RESULT_ACCENT }}>Level {survivalLevel(bestClimb)}</Text><Text style={{ fontFamily: FONT.body, fontSize: fz(13), color: RESULT_MUTED }}>  ·  {bestClimb === 1 ? '1 right answer' : `${bestClimb} right answers`}{correct === bestClimb ? '  ·  this run' : ''}</Text></Text>
      </View>}
      <View style={[RESULT_BOX, { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }]}>{resultStat('done_all', RESULT_ACCENT, `${attempted}`, 'ATTEMPTED')}<View style={{ width: 1, height: 36, backgroundColor: RESULT_RULE }} />{resultStat('check_circle', '#4F7A5A', attempted ? `${accuracy}%` : '–', 'ACCURACY')}</View>
    </ScrollView>
    <View style={{ borderTopWidth: BW, borderTopColor: '#EEEEF2', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 12 }}><Pressable onPress={onDone} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: BW, borderColor: RESULT_RULE, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#29252D' }}>Back to Quiz</Text></Pressable><Pressable onPress={onPlayAgain ?? onDone} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: RESULT_ACCENT, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(15), color: '#FFFFFF' }}>Climb Again</Text><ResultIcon name="favorite" size={18} color="#FFFFFF" /></Pressable></View>
    {(level >= 2 || newRecord) && <Confetti />}
  </View></View>;
}

function SpeedRoundComplete({ p, results, questions, onPlayAgain, limit, elapsed, topInset, bottomInset, onDone, onReview }: { p: Palette; results: Result[]; questions: QuizQuestion[]; onPlayAgain?: () => void; limit: number; elapsed: number; topInset: number; bottomInset: number; onDone: () => void; onReview: () => void }) {
  return <SpeedRoundDialog results={results} questions={questions} onPlayAgain={onPlayAgain} limit={limit} elapsed={elapsed} onDone={onDone} onReview={onReview} />;
  const dark = p.isDark;
  const correct = results.filter((result) => result === 'correct').length;
  const attempted = results.filter(Boolean).length;
  const band = correct < 3 ? { label: 'Keep warming up', note: 'Every fast answer builds your instinct.', tone: '#94A3B8' } : correct < 7 ? { label: 'Solid start', note: 'You found your rhythm. Push for a few more next round.', tone: '#60A5FA' } : correct < 12 ? { label: 'Great pace!', note: 'Sharp work under pressure. That was a strong run.', tone: '#34D399' } : { label: 'Excellent!', note: 'Outstanding speed and accuracy. You owned that round.', tone: '#FBBF24' };
  const [shownScore, setShownScore] = React.useState(0);
  const pop = React.useRef(new Animated.Value(0.7)).current;
  React.useEffect(() => { const started = Date.now(); const tick = setInterval(() => { const progress = Math.min(1, (Date.now() - started) / 700); setShownScore(Math.round(correct * progress)); if (progress === 1) clearInterval(tick); }, 24); Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5 }).start(); return () => clearInterval(tick); }, [correct, pop]);
  const accuracyNow = attempted ? Math.round((correct / attempted) * 100) : 0;
  const missedNow = Math.max(0, attempted - correct);
  return <View style={{ flex: 1, backgroundColor: '#242424', padding: 10, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: '100%', maxWidth: 550, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFCF9' }}><View style={{ height: 76, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone}><Icon name="close" size={27} exact color="#202020" /></Pressable><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(19 * MAIN), color: '#202020' }}>Speed Round Results</Text><View style={{ width: 27 }} /></View><ScrollView contentContainerStyle={{ paddingHorizontal: 45, paddingBottom: 20, alignItems: 'center' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 }}><Icon name="bolt" size={18} exact color="#5146E5" /><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(15 * MAIN), color: '#5146E5' }}>{band.label}</Text></View><Animated.Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(68 * MAIN), lineHeight: lh(68, 1), color: '#191919', marginTop: 12, transform: [{ scale: pop }] }}>{shownScore}</Animated.Text><Text style={{ marginTop: 6, fontFamily: FONT.outfit.b, fontSize: fz(20 * MAIN), color: '#202020' }}>Correct out of {attempted} questions</Text><Text style={{ marginTop: 4, fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), letterSpacing: 0.08 * 11 * MAIN, color: '#7C7C8D' }}>60-SECOND CHALLENGE COMPLETED</Text><View style={{ marginTop: 20, width: '100%', borderRadius: 18, paddingVertical: 18, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around' }}><View style={{ alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(20 * MAIN), color: '#202020' }}>✓ {accuracyNow}%</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), color: '#7C7C8D' }}>ACCURACY</Text></View><View style={{ width: 1, backgroundColor: '#E2E2E8' }} /><View style={{ alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(20 * MAIN), color: '#202020' }}>◷ {attempted ? (60 / attempted).toFixed(1) : '0.0'}s</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), color: '#7C7C8D' }}>AVG PACE</Text></View><View style={{ width: 1, backgroundColor: '#E2E2E8' }} /><View style={{ alignItems: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(20 * MAIN), color: '#202020' }}>♨ {correct}</Text><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), color: '#7C7C8D' }}>BEST STREAK</Text></View></View><View style={{ marginTop: 20, width: '100%', borderRadius: 18, backgroundColor: '#FFFFFF', padding: 22, gap: 18 }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(16 * MAIN), color: '#29252D' }}>⚡  Outperformed <Text style={{ fontFamily: FONT.outfit.b, color: '#5146E5' }}>82%</Text> of learners</Text><View style={{ height: 1, backgroundColor: '#E2E2E8' }} /><View><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(16 * MAIN), color: '#29252D' }}>🏆  Personal Best: <Text style={{ fontFamily: FONT.outfit.b, color: '#5146E5' }}>{Math.max(correct, 26)} correct</Text></Text><Text style={{ marginLeft: 30, marginTop: 4, fontFamily: FONT.body, fontSize: fz(13 * MAIN), color: '#7C7C8D' }}>{Math.max(0, 26 - correct)} more to beat your record.</Text></View></View>{missedNow > 0 && <Pressable onPress={onReview} style={{ width: '100%', marginTop: 22, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(16 * MAIN), color: '#29252D' }}>✣  Review {missedNow} missed answers</Text><Icon name="chevron_right" size={22} exact color="#7C7C8D" /></Pressable>}</ScrollView><View style={{ borderTopWidth: BW, borderTopColor: '#EEEEF2', padding: 18, flexDirection: 'row', gap: 14 }}><Pressable onPress={onDone} style={{ flex: 1, height: 56, borderRadius: 11, borderWidth: BW, borderColor: '#E2E2E8', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN), color: '#29252D' }}>Back to Quiz</Text></Pressable><Pressable onPress={onDone} style={{ flex: 1, height: 56, borderRadius: 11, backgroundColor: '#5146E5', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN), color: '#FFFFFF' }}>Play Again ⚡</Text></Pressable></View></View></View>;
  return <View style={{ flex: 1, padding: 16, backgroundColor: 'rgba(2,6,23,0.78)', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: '100%', maxWidth: 420, borderRadius: 24, overflow: 'hidden', backgroundColor: dark ? '#171225' : '#FFFCF7' }}><View style={{ height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone}><Icon name="close" size={26} exact color={dark ? '#F8FAFC' : '#202020'} /></Pressable><Text style={[s.worldTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Speed Round Results</Text><View style={{ width: 26 }} /></View>{correct >= 7 && <View pointerEvents="none" style={{ position: 'absolute', top: 62, left: 0, right: 0, height: 80 }}>{['#FBBF24','#818CF8','#34D399','#FB7185','#60A5FA'].map((color, i) => <Animated.View key={color} style={{ position: 'absolute', left: `${12 + i * 19}%`, top: i % 2 ? 24 : 5, width: 8, height: 14, borderRadius: 3, backgroundColor: color, transform: [{ rotate: `${i * 31}deg` }, { scale: pop }] }} />)}</View>}<View style={{ padding: 24, alignItems: 'center', gap: 14 }}><View style={{ borderRadius: 999, backgroundColor: `${band.tone}22`, paddingHorizontal: 18, paddingVertical: 8 }}><Text style={{ color: band.tone, fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN) }}>⚡ {band.label} ⚡</Text></View><Animated.Text style={[s.bigScore, { color: dark ? '#F8FAFC' : '#202020', transform: [{ scale: pop }] }]}>{shownScore}</Animated.Text><Text style={[s.completeTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Correct out of {attempted} questions</Text><Text style={[s.reviewNote, { color: dark ? '#DDD4ED' : '#4E4858' }]}>{band.note}</Text></View><View style={{ padding: 16, gap: 10 }}>{attempted > correct && <Pressable onPress={onReview} style={[s.reviewBtn, { borderColor: band.tone }]}><Text style={[s.mainBtnText, { color: band.tone }]}>Review {attempted - correct} missed answers</Text></Pressable>}<Pressable onPress={onDone} style={[s.mainBtn, { backgroundColor: '#4C3BCF' }]}><Text style={[s.mainBtnText, { color: '#FFFFFF' }]}>Back to Quiz</Text></Pressable></View></View></View>;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const pace = attempted ? (60 / attempted).toFixed(1) : '0.0';
  return <View style={{ flex: 1, padding: 16, backgroundColor: 'rgba(2,6,23,0.78)', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: '100%', maxWidth: 420, maxHeight: '92%', borderRadius: 24, overflow: 'hidden', backgroundColor: dark ? '#171225' : '#FFFCF7' }}><View style={{ height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone}><Icon name="close" size={26} exact color={dark ? '#F8FAFC' : '#202020'} /></Pressable><Text style={[s.worldTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Speed Round Results</Text><View style={{ width: 26 }} /></View><ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center', gap: 16 }}><View style={{ borderRadius: 999, backgroundColor: `${band.tone}22`, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', gap: 7 }}><Icon name="bolt" size={18} exact color={band.tone} /><Text style={{ color: band.tone, fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN) }}>{band.label}</Text></View><Text style={[s.bigScore, { color: dark ? '#F8FAFC' : '#202020' }]}>{correct}</Text><Text style={[s.completeTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Correct out of {attempted} questions</Text><Text style={[s.completeKicker, { color: dark ? '#AFA4C5' : '#7C7588' }]}>60-SECOND CHALLENGE COMPLETED</Text><View style={{ width: '100%', borderRadius: 18, padding: 16, backgroundColor: dark ? '#211A32' : '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around' }}><View style={{ alignItems: 'center' }}><Text style={[s.statValue, { color: dark ? '#F8FAFC' : '#202020' }]}>{accuracy}%</Text><Text style={[s.statLabel, { color: dark ? '#C9BEDB' : '#7C7588' }]}>ACCURACY</Text></View><View style={{ alignItems: 'center' }}><Text style={[s.statValue, { color: dark ? '#F8FAFC' : '#202020' }]}>{pace}s</Text><Text style={[s.statLabel, { color: dark ? '#C9BEDB' : '#7C7588' }]}>AVG PACE</Text></View></View><Text style={[s.reviewNote, { color: dark ? '#DDD4ED' : '#4E4858' }]}>{band.note}</Text></ScrollView><View style={{ padding: 16, gap: 10 }}>{attempted > correct && <Pressable onPress={onReview} style={[s.reviewBtn, { borderColor: band.tone }]}><Text style={[s.mainBtnText, { color: band.tone }]}>Review {attempted - correct} missed answers</Text></Pressable>}<Pressable onPress={onDone} style={[s.mainBtn, { backgroundColor: '#4C3BCF' }]}><Text style={[s.mainBtnText, { color: '#FFFFFF' }]}>Back to Quiz</Text></Pressable></View></View></View>;
  return <View style={{ flex: 1, backgroundColor: dark ? '#0B0F19' : '#202020', padding: 4 }}><View style={{ flex: 1, borderRadius: 24, backgroundColor: dark ? '#171225' : '#FFFCF7', overflow: 'hidden', paddingTop: topInset }}><View style={{ height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Pressable onPress={onDone}><Icon name="close" size={28} exact color={dark ? '#F8FAFC' : '#202020'} /></Pressable><Text style={[s.worldTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Speed Round Results</Text><View style={{ width: 28 }} /></View><ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 20 }}><View style={{ borderRadius: 999, backgroundColor: `${band.tone}22`, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', gap: 7 }}><Icon name="bolt" size={18} exact color={band.tone} /><Text style={{ color: band.tone, fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN) }}>{band.label}</Text></View><Text style={[s.bigScore, { color: dark ? '#F8FAFC' : '#202020' }]}>{correct}</Text><Text style={[s.completeTitle, { color: dark ? '#F8FAFC' : '#202020', fontSize: fz(18 * MAIN) }]}>Correct out of {attempted} questions</Text><Text style={[s.completeKicker, { color: dark ? '#AFA4C5' : '#7C7588' }]}>60-SECOND CHALLENGE COMPLETED</Text><View style={{ width: '100%', borderRadius: 20, padding: 18, backgroundColor: dark ? '#211A32' : '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around' }}><View style={{ alignItems: 'center' }}><Text style={[s.statValue, { color: dark ? '#F8FAFC' : '#202020' }]}>{accuracy}%</Text><Text style={[s.statLabel, { color: dark ? '#C9BEDB' : '#7C7588' }]}>ACCURACY</Text></View><View style={{ alignItems: 'center' }}><Text style={[s.statValue, { color: dark ? '#F8FAFC' : '#202020' }]}>{pace}s</Text><Text style={[s.statLabel, { color: dark ? '#C9BEDB' : '#7C7588' }]}>AVG PACE</Text></View></View><Text style={[s.reviewNote, { color: dark ? '#DDD4ED' : '#4E4858' }]}>{band.note}</Text></ScrollView><View style={{ padding: 16, paddingBottom: 24 + bottomInset, gap: 10 }}>{attempted > correct && <Pressable onPress={onReview} style={[s.reviewBtn, { borderColor: band.tone }]}><Text style={[s.mainBtnText, { color: band.tone }]}>Review {attempted - correct} missed answers</Text></Pressable>}<Pressable onPress={onDone} style={[s.mainBtn, { backgroundColor: '#4C3BCF' }]}><Text style={[s.mainBtnText, { color: '#FFFFFF' }]}>Back to Quiz</Text></Pressable></View></View></View>;
  return <View style={{ flex: 1, backgroundColor: dark ? '#100D1A' : '#FFF9EA', paddingTop: topInset }}><ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 18 }}><Icon name="bolt" size={46} exact color={band.tone} /><Text style={[s.completeKicker, { color: band.tone }]}>TIME'S UP · SPEED ROUND</Text><Text style={[s.completeTitle, { color: dark ? '#F8FAFC' : '#30230C' }]}>{band.label}</Text><View style={{ alignItems: 'center', paddingVertical: 16, paddingHorizontal: 36, borderRadius: 24, backgroundColor: dark ? '#211A32' : '#FFF0BF', borderWidth: BW, borderColor: `${band.tone}88` }}><Text style={[s.bigScore, { color: band.tone }]}>{correct}</Text><Text style={[s.scoreSub, { color: dark ? '#C9BEDB' : '#725C2E' }]}>correct answers · {attempted} attempted</Text></View><Text style={[s.reviewNote, { color: dark ? '#DDD4ED' : '#58451C' }]}>{band.note}</Text><View style={{ width: '100%', gap: 9 }}>{['Poor · 0–2', 'Average · 3–6', 'Good · 7–11', 'Excellent · 12+'].map((label, i) => { const active = i === (correct < 3 ? 0 : correct < 7 ? 1 : correct < 12 ? 2 : 3); return <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Text style={{ width: 112, fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), color: active ? band.tone : dark ? '#8B7FA4' : '#8B794D' }}>{active ? '● ' : ''}{label}</Text><View style={{ flex: 1, height: active ? 9 : 6, borderRadius: 6, backgroundColor: active ? band.tone : dark ? '#302842' : '#EADDB6' }} /></View>; })}</View></ScrollView><View style={{ paddingHorizontal: 16, paddingBottom: 24 + bottomInset, gap: 10 }}>{attempted > correct && <Pressable onPress={onReview} style={[s.reviewBtn, { borderColor: band.tone }]}><Text style={[s.mainBtnText, { color: band.tone }]}>Review missed answers</Text></Pressable>}<Pressable onPress={onDone} style={[s.mainBtn, { backgroundColor: band.tone }]}><Text style={[s.mainBtnText, { color: '#1C1607' }]}>Back to Quiz</Text></Pressable></View></View>;
}

function CompleteScreen({ p, results, xp, topInset, bottomInset, onDone, onReview, nextLabel, onNext, speedRound = false, speedLimit = 0, speedElapsed = 0, questions = [], onPlayAgain, survival = false, survivalLives = SURVIVAL_LIVES, stakesBets, stakesShieldSavings = 0 }: { p: Palette; onPlayAgain?: () => void; survival?: boolean; survivalLives?: number; /** High Stakes: the bet placed on each question. */ stakesBets?: (BetId | undefined)[]; stakesShieldSavings?: number; results: Result[]; questions?: QuizQuestion[]; xp: number; topInset: number; bottomInset: number; onDone: () => void; onReview: () => void; nextLabel?: string; onNext?: () => void; speedRound?: boolean; speedLimit?: number; speedElapsed?: number }) {
  if (stakesBets) return <StakesDialog results={results} questions={questions} bets={stakesBets} shieldSavings={stakesShieldSavings} onPlayAgain={onPlayAgain} onDone={onDone} onReview={onReview} />;
  if (survival) return <SurvivalDialog lives={survivalLives} results={results} questions={questions} onPlayAgain={onPlayAgain} onDone={onDone} onReview={onReview} />;
  if (speedRound) return <SpeedRoundComplete p={p} results={results} questions={questions} onPlayAgain={onPlayAgain} limit={speedLimit} elapsed={speedElapsed} topInset={topInset} bottomInset={bottomInset} onDone={onDone} onReview={onReview} />;
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
          <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: title }}>{PROFILE_NAME}</Text>
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
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 + bottomInset, gap: 10 }}>
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

function getCorrectQuizAnswer(question: QuizQuestion): QuizAnswer {
  if (question.type === 'multi_select') return [...question.answers];
  if (question.type === 'find_error') return question.errorLine;
  return question.answer;
}

export function QuizSessionScreen({ p, world, label, questions = SAMPLE_QUIZ, timeLimitSeconds: initialTimeLimit, topInset, bottomInset = 0, stepOffset = 0, startIndex = 0, lockedQuestionIds = [], totalOverride, onExit, onComplete, onAnswer, nextLabel, onNext, onPlayAgain, survival: initialSurvival = false, survivalLives: maxLives = SURVIVAL_LIVES, stakes: initialStakes = false, stakesShield = false }: { p: Palette; /** High Stakes: bet on each answer before checking it. */ stakes?: boolean; stakesShield?: boolean; /** Survival: hearts for this climb (3, or 4 with the bonus heart earned by sharing). */ survivalLives?: number; /** Survival Ladder: `questions` is the pool; the run picks from it level by level. */ survival?: boolean; /** Speed Round: start a fresh round from the results dialog. */ onPlayAgain?: () => void; world?: { order: number; title: string }; label?: string; timeLimitSeconds?: number; /** Position of a resumed quiz: questions already answered before this session. */ stepOffset?: number; /** First page to show when resuming. */ startIndex?: number; /** Previously passed pages, shown correct and kept read-only. */ lockedQuestionIds?: string[]; /** The whole quiz's length. */ totalOverride?: number; /** What to offer when a set ends: the next set (label and action). */ nextLabel?: string; onNext?: () => void; /** Called as each answer is committed, so progress survives quitting midway. */ onAnswer?: (question: QuizQuestion, correct: boolean) => void; questions?: QuizQuestion[]; topInset: number; /** Device bottom safe-area inset. */ bottomInset?: number; onExit: () => void; onComplete?: (questions: QuizQuestion[], results: Result[]) => void }) {
  const lockedIds = React.useMemo(() => new Set(lockedQuestionIds), [lockedQuestionIds]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialQuestions = React.useMemo(() => (initialSurvival ? startSurvivalRun(questions) : questions), []);
  const initialResults = React.useMemo(() => initialQuestions.map((question) => lockedIds.has(question.id) ? 'correct' as Result : undefined) as Result[], [initialQuestions, lockedIds]);
  const initialAnswers = React.useMemo(() => initialQuestions.map((question) => lockedIds.has(question.id) ? getCorrectQuizAnswer(question) : null), [initialQuestions, lockedIds]);
  const initialDrafts = React.useMemo(() => initialQuestions.map((question, i) => ({ answer: initialAnswers[i], checked: lockedIds.has(question.id) })), [initialQuestions, initialAnswers, lockedIds]);
  const [index, setIndex] = React.useState(startIndex);
  const [results, setResults] = React.useState<Result[]>(initialResults);
  const resultsRef = React.useRef<Result[]>(initialResults);
  // What the learner chose for each answered question, so the review can show it next to the correct answer.
  const [answers, setAnswers] = React.useState<QuizAnswer[]>(initialAnswers);
  const answersRef = React.useRef<QuizAnswer[]>(initialAnswers);
  const [drafts, setDrafts] = React.useState<{ answer: QuizAnswer; checked: boolean }[]>(initialDrafts);
  const draftsRef = React.useRef(drafts);
  const activeIndexRef = React.useRef(startIndex);
  const pagerRef = React.useRef<PagerView | null>(null);
  // While a finger is on a code block, the pager stops swiping so the code can scroll sideways (see CodeScrollPagerLock).
  const lockPagerForCode = React.useCallback((locked: boolean) => pagerRef.current?.setScrollEnabled(!locked), []);
  const questionScrollRefs = React.useRef<Array<any>>([]);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const [shieldSavings, setShieldSavings] = React.useState(0);
  const shieldUsedRef = React.useRef(false);
  const [levelUp, setLevelUp] = React.useState<number | null>(null);
  const levelToastOpacity = React.useRef(new Animated.Value(0)).current;
  const levelToastLift = React.useRef(new Animated.Value(10)).current;
  React.useEffect(() => {
    if (levelUp === null) return undefined;
    levelToastOpacity.setValue(0);
    levelToastLift.setValue(10);
    Animated.parallel([
      Animated.timing(levelToastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(levelToastLift, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(levelToastOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => { if (finished) setLevelUp(null); });
    }, 2820);
    return () => { clearTimeout(timer); levelToastOpacity.stopAnimation(); levelToastLift.stopAnimation(); };
  }, [levelUp, levelToastOpacity, levelToastLift]);
  const [sessionQuestions, setSessionQuestions] = React.useState(initialQuestions);
  const [survival, setSurvival] = React.useState(initialSurvival);
  const [stakes, setStakes] = React.useState(initialStakes);
  const [bets, setBets] = React.useState<(BetId | undefined)[]>([]);
  const [betPromptOpen, setBetPromptOpen] = React.useState(false);
  const betTickScale = React.useRef(new Animated.Value(0)).current;
  const betResultPop = React.useRef(new Animated.Value(1)).current;
  // A toast slides up above the action button when the Safety Shield absorbs a loss, then leaves by itself.
  const [shieldToast, setShieldToast] = React.useState(0);
  const toastAnim = React.useRef(new Animated.Value(0)).current;
  const showShieldToast = (saved: number) => {
    setShieldToast(saved);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.spring(toastAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setShieldToast(0); });
  };
  const betResultTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const betSelectionAnimating = React.useRef(false);
  React.useEffect(() => () => { if (betResultTimer.current) clearTimeout(betResultTimer.current); }, []);
  const betsRef = React.useRef<(BetId | undefined)[]>([]);
  const placeBet = (questionIndex: number, bet: BetId) => { const next = [...betsRef.current]; next[questionIndex] = bet; betsRef.current = next; setBets(next); };
  const selectBet = (bet: BetId) => {
    if (betSelectionAnimating.current) return;
    betSelectionAnimating.current = true;
    betTickScale.setValue(0);
    betResultPop.setValue(0);
    placeBet(index, bet);
    setBetPromptOpen(true);
    Animated.sequence([
      Animated.timing(betTickScale, { toValue: 1.25, duration: 180, useNativeDriver: true }),
      Animated.timing(betTickScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(320),
    ]).start(({ finished }) => {
      betSelectionAnimating.current = false;
      if (finished) {
        setBetPromptOpen(false);
        betResultTimer.current = setTimeout(() => {
          betResultTimer.current = null;
          checkCurrentAnswer();
          Animated.sequence([
            Animated.timing(betResultPop, { toValue: 1.12, duration: 220, useNativeDriver: true }),
            Animated.spring(betResultPop, { toValue: 1, friction: 6, useNativeDriver: true }),
          ]).start();
        }, 300);
      }
    });
  };
  const wrongCount = results.filter((result) => result === 'wrong').length;
  // "Try these again" after a Speed Round retries the misses as a normal, untimed quiz.
  const [timeLimitSeconds, setTimeLimitSeconds] = React.useState(initialTimeLimit);
  const [secondsLeft, setSecondsLeft] = React.useState(initialTimeLimit ?? 0);
  React.useEffect(() => {
    if (!timeLimitSeconds) return undefined;
    const timer = setInterval(() => setSecondsLeft((seconds) => {
      if (seconds <= 1) { clearInterval(timer); activeIndexRef.current = sessionQuestions.length; setIndex(sessionQuestions.length); return 0; }
      return seconds - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [timeLimitSeconds, sessionQuestions.length]);
  // The offset / whole-quiz length only apply to the first run; "Try these again" replays the missed questions on their own.
  const [position, setPosition] = React.useState<{ offset: number; total?: number }>({ offset: stepOffset, total: totalOverride });
  const missed = sessionQuestions.filter((_, i) => results[i] === 'wrong');
  const missedAnswers = sessionQuestions.map((_, i) => answers[i] ?? null).filter((_, i) => results[i] === 'wrong');
  const currentAnswer = drafts[index]?.answer ?? answers[index] ?? null;
  const requestClose = React.useCallback(() => {
    const step = position.offset + index + 1;
    if (step > 1 || hasAnswer(currentAnswer)) setConfirmLeave(true);
    else onExit();
  }, [position.offset, index, currentAnswer, onExit]);

  React.useEffect(() => {
    if (reviewOpen || index >= sessionQuestions.length) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (betPromptOpen) setBetPromptOpen(false);
      else if (confirmLeave) setConfirmLeave(false);
      else requestClose();
      return true;
    });
    return () => subscription.remove();
  }, [reviewOpen, index, sessionQuestions.length, betPromptOpen, confirmLeave, requestClose]);

  if (reviewOpen) return <ReviewMistakesScreen p={p} world={world} questions={missed} answers={missedAnswers} topInset={topInset} bottomInset={bottomInset} onTryAgain={() => { setTimeLimitSeconds(undefined); setSurvival(false); setStakes(false); setSessionQuestions(missed); setPosition({ offset: 0, total: undefined }); setReviewOpen(false); setIndex(0); activeIndexRef.current = 0; setResults([]); resultsRef.current = []; setAnswers([]); answersRef.current = []; setDrafts([]); draftsRef.current = []; }} onDone={onExit} />;

  if (index >= sessionQuestions.length || (survival && wrongCount >= maxLives)) {
    const xp = sessionQuestions.reduce((sum, q, i) => sum + (!lockedIds.has(q.id) && results[i] === 'correct' ? q.xp : 0), 0);
    return <CompleteScreen p={p} survival={survival} survivalLives={maxLives} stakesBets={stakes ? bets.slice(0, index) : undefined} stakesShieldSavings={shieldSavings} results={results.slice(0, index)} questions={sessionQuestions.slice(0, index)} onPlayAgain={onPlayAgain} xp={xp} speedRound={!!timeLimitSeconds} speedLimit={timeLimitSeconds ?? 0} speedElapsed={(timeLimitSeconds ?? 0) - secondsLeft} topInset={topInset} bottomInset={bottomInset} onReview={() => setReviewOpen(true)} nextLabel={nextLabel} onNext={onNext} onDone={() => { onComplete?.(sessionQuestions, results); onExit(); }} />;
  }
  const saveDraft = (questionIndex: number, answer: QuizAnswer, checkedIn: boolean, correctOverride?: boolean) => {
    // High Stakes: no answer is checked (even a tap-to-check type) until a bet is on it.
    const checked = checkedIn && !(stakes && !betsRef.current[questionIndex] && correctOverride === undefined);
    if (stakes && stakesShield && checked && !draftsRef.current[questionIndex]?.checked && !shieldUsedRef.current && !(correctOverride ?? gradeQuizAnswer(sessionQuestions[questionIndex], answer))) {
      shieldUsedRef.current = true;
      const saved = Math.min(STAKES_SHIELD_SAVINGS, betById(betsRef.current[questionIndex]!).lose);
      setShieldSavings(saved);
      showShieldToast(saved);
      spendStakesShield();
    }
    // Survival: the moment an answer is checked, swap the next page for a question of the level this answer leads to.
    // That page is still off screen (the learner can only move on after checking), so the swap is never seen.
    if (survival && checked && !draftsRef.current[questionIndex]?.checked && questionIndex + 1 < sessionQuestions.length) {
      const correct = correctOverride ?? gradeQuizAnswer(sessionQuestions[questionIndex], answer);
      const before = resultsRef.current.slice(0, questionIndex);
      const correctSoFar = before.filter((r) => r === 'correct').length + (correct ? 1 : 0);
      const wrongSoFar = before.filter((r) => r === 'wrong').length + (correct ? 0 : 1);
      if (wrongSoFar < maxLives) {
        const used = new Set(sessionQuestions.slice(0, questionIndex + 1).map((q) => q.id));
        const nextQuestions = [...sessionQuestions];
        nextQuestions[questionIndex + 1] = pickSurvivalQuestion(questions, difficultyForLevel(survivalLevel(correctSoFar)), used);
        setSessionQuestions(nextQuestions);
      }
    }
    const next = [...draftsRef.current];
    next[questionIndex] = { answer, checked };
    draftsRef.current = next;
    setDrafts(next);
  };
  const commitAnswer = (questionIndex: number, answer: QuizAnswer, correct: boolean) => {
    if (resultsRef.current[questionIndex] !== undefined) return;
    const nextResults = [...resultsRef.current];
    nextResults[questionIndex] = correct ? 'correct' : 'wrong';
    resultsRef.current = nextResults;
    setResults(nextResults);
    if (survival && correct) {
      const correctCount = nextResults.filter((result) => result === 'correct').length;
      if (correctCount > 0 && correctCount % SURVIVAL_LEVEL_STEP === 0) setLevelUp(survivalLevel(correctCount));
    }
    const nextAnswers = [...answersRef.current];
    nextAnswers[questionIndex] = answer;
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    onAnswer?.(sessionQuestions[questionIndex], correct);
  };
  // Survival ends with the last heart: jump to the results, which count only the questions answered.
  const survivalOver = () => {
    if (!survival || resultsRef.current.filter((r) => r === 'wrong').length < maxLives) return false;
    const answered = resultsRef.current.reduce((n, r, i) => (r ? i + 1 : n), 0);
    activeIndexRef.current = answered;
    setIndex(answered);
    return true;
  };
  const handlePageSelected = (pageIndex: number) => {
    const previousIndex = activeIndexRef.current;
    if (pageIndex > previousIndex) {
      const draft = draftsRef.current[previousIndex];
      if (pageIndex !== previousIndex + 1 || !draft?.checked) {
        pagerRef.current?.setPageWithoutAnimation(previousIndex);
        return;
      }
      commitAnswer(previousIndex, draft.answer, gradeQuizAnswer(sessionQuestions[previousIndex], draft.answer));
      if (survivalOver()) return;
    }
    activeIndexRef.current = pageIndex;
    setIndex(pageIndex);
  };
  const continueQuestion = (questionIndex: number, correct: boolean, answer: QuizAnswer) => {
    if (stakes && !betsRef.current[questionIndex]) placeBet(questionIndex, 'think'); // DEBUG Pass / Fail skip the bet
    saveDraft(questionIndex, answer, true, correct);
    commitAnswer(questionIndex, answer, correct);
    if (survivalOver()) return;
    if (questionIndex === sessionQuestions.length - 1) {
      activeIndexRef.current = sessionQuestions.length;
      setIndex(sessionQuestions.length);
    } else {
      pagerRef.current?.setPage(questionIndex + 1);
    }
  };
  const currentQuestion = sessionQuestions[index];
  const currentDraft = drafts[index] ?? { answer: answers[index] ?? null, checked: results[index] !== undefined };
  const currentAnswered = hasAnswer(currentDraft.answer);
  const currentCorrect = gradeQuizAnswer(currentQuestion, currentDraft.answer);
  const currentShieldSaved = stakesShield && shieldSavings > 0 && !currentCorrect && !results.slice(0, index).includes('wrong');
  const checkCurrentAnswer = () => {
    if (!currentAnswered || currentDraft.checked || (stakes && !betsRef.current[index])) return;
    saveDraft(index, currentDraft.answer, true);
    setTimeout(() => questionScrollRefs.current[index]?.scrollToEnd({ animated: true }), 80);
  };

  const dark = p.isDark;
  const bg = survival ? (dark ? '#1A121D' : '#FFF8F9') : dark ? '#0B0F19' : '#F3F4F8';
  // High Stakes: once an answer is picked, a bet must be placed before it can be checked.
  const needsBet = stakes && currentAnswered && !currentDraft.checked && !bets[index];
  const canOpenBetPrompt = needsBet && currentQuestion.type === 'multi_select';
  const currentReady = currentAnswered && !needsBet;
  const coins = STAKES_START + sessionQuestions.reduce((sum, q, i) => {
    const bet = bets[i], draft = drafts[i];
    if (!bet || !(draft?.checked || results[i])) return sum;
    return sum + payout(bet, results[i] ? results[i] === 'correct' : gradeQuizAnswer(q, draft.answer));
  }, 0) + shieldSavings;
  const actionReady = currentDraft.checked || currentReady || canOpenBetPrompt;
  const actionButtonBg = actionReady ? (dark ? '#343A70' : '#D5D8FF') : (dark ? '#202846' : '#E5E7FA');
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {shieldToast > 0 && <Animated.View pointerEvents="none" style={{ position: 'absolute', zIndex: 50, elevation: 12, bottom: bottomInset + 110, left: 16, right: 16, alignItems: 'center', opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, backgroundColor: dark ? '#2A2210' : '#FFFBEB', borderWidth: 1, borderColor: dark ? '#7A5F1F' : '#FCD34D', maxWidth: 380 }}>
          <Text style={{ fontSize: fz(26) }}>🛡️</Text>
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(14), color: dark ? '#FDE68A' : '#92400E' }}>Safety Shield used</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: fz(12), lineHeight: lh(12, 1.3), color: dark ? '#E7D7AE' : '#7C5A14' }}>It saved you {shieldToast} coins on that wrong bet.</Text>
          </View>
        </View>
      </Animated.View>}
      {stakes ? <StakesToolbar p={p} topInset={topInset} coins={coins} step={index + 1} total={sessionQuestions.length} shield={!!stakesShield && !shieldSavings} onClose={requestClose} /> : survival ? <SurvivalToolbar p={p} topInset={topInset} lives={maxLives - wrongCount} maxLives={maxLives} correct={results.filter((result) => result === 'correct').length} step={index + 1} onClose={requestClose} /> : timeLimitSeconds ? <SpeedRoundToolbar p={p} topInset={topInset} secondsLeft={secondsLeft} limit={timeLimitSeconds} correct={results.filter((result) => result === 'correct').length} step={position.offset + index + 1} onClose={requestClose} /> : <QuizToolbar p={p} world={world} label={label} question={currentQuestion} topInset={topInset} step={position.offset + index + 1} total={position.total ?? sessionQuestions.length} checked={currentDraft.checked} onClose={requestClose} />}
      <CodeScrollPagerLock.Provider value={lockPagerForCode}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={startIndex}
        onPageSelected={(event: any) => handlePageSelected(event.nativeEvent.position)}
        overScrollMode="never"
        offscreenPageLimit={1}
        orientation="horizontal"
      >
        {sessionQuestions.map((question, questionIndex) => {
          const isNearActivePage = Math.abs(questionIndex - index) <= 1;
          const draft = drafts[questionIndex] ?? { answer: answers[questionIndex] ?? null, checked: results[questionIndex] !== undefined };
          return (
            <View key={`${questionIndex}-${question.id}`} style={{ width: '100%', height: '100%' }}>
              {isNearActivePage && <QuestionScreen
                p={p}
                q={question}
                value={draft.answer}
                checked={draft.checked}
                onDraftChange={(answer, isChecked) => saveDraft(questionIndex, answer, isChecked)}
                onScrollRef={(ref) => { questionScrollRefs.current[questionIndex] = ref; }}
                survival={survival}
              />}
            </View>
          );
        })}
      </PagerView>
      </CodeScrollPagerLock.Provider>
      <View style={{ backgroundColor: bg }}>
        <Svg width="100%" height={6} style={{ position: 'absolute', left: 0, right: 0, top: -6 }} pointerEvents="none">
          <Defs>
            <LinearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={bg} stopOpacity="0" />
              <Stop offset="1" stopColor={bg} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeUp)" />
        </Svg>
        <View style={{ paddingHorizontal: 0, paddingTop: 12, paddingBottom: 20 + bottomInset }}>
          {/* TEMPORARY: Pass / Fail test shortcut, shown in release builds too. Remove before public release. */}
          <View style={s.debugRow}>
            <Text style={[s.debugLabel, { color: dark ? '#94A3B8' : '#64748B' }]}>DEBUG</Text>
            <Pressable onPress={() => continueQuestion(index, true, currentDraft.answer)} style={[s.debugBtn, { borderColor: '#10B981', backgroundColor: dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5' }]}>
              <Text style={[s.debugBtnText, { color: dark ? '#6EE7B7' : '#047857' }]}>Pass</Text>
            </Pressable>
            <Pressable onPress={() => continueQuestion(index, false, currentDraft.answer)} style={[s.debugBtn, { borderColor: '#F43F5E', backgroundColor: dark ? 'rgba(244,63,94,0.12)' : '#FFF1F2' }]}>
              <Text style={[s.debugBtnText, { color: dark ? '#FDA4AF' : '#BE123C' }]}>Fail</Text>
            </Pressable>
          </View>
          {stakes && stakesShield && !shieldSavings && <Text style={{ marginBottom: 6, textAlign: 'center', fontFamily: FONT.outfit.md, fontSize: fz(11), color: dark ? '#FCD34D' : '#92400E' }}>🛡️ Safety Shield ready · first wrong bet loses up to 10 fewer coins</Text>}
          {stakes && bets[index] && <View style={{ paddingHorizontal: 16, marginBottom: 10, alignItems: 'center' }}>
            {currentDraft.checked
              ? <Animated.View style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: currentCorrect ? (dark ? '#173B35' : '#E9FCF0') : (dark ? '#462832' : '#FAE9EF'), opacity: betResultPop.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: betResultPop }] }}><Text style={{ textAlign: 'center', fontFamily: FONT.outfit.b, fontSize: fz(13), color: currentCorrect ? (dark ? '#6EE7B7' : '#047857') : (dark ? '#FDA4AF' : '#BE123C') }}>{currentCorrect ? '✓' : '✕'} {betById(bets[index]!).emoji} {betById(bets[index]!).label} · {currentCorrect ? `+${betById(bets[index]!).win}` : `−${betById(bets[index]!).lose - (currentShieldSaved ? shieldSavings : 0)}`} coins{currentShieldSaved ? ' · 🛡️ shield used' : ''}</Text></Animated.View>
              : <Text style={{ textAlign: 'center', fontFamily: FONT.outfit.md, fontSize: fz(13), color: dark ? '#CBD5E1' : '#475569' }}>{betById(bets[index]!).emoji} {betById(bets[index]!).label} · +{betById(bets[index]!).win} / −{betById(bets[index]!).lose} coins</Text>}
          </View>}
          <View style={{ position: 'relative', width: '100%', paddingHorizontal: 16 }}>
            <Pressable
              disabled={!actionReady}
              onPress={() => (currentDraft.checked ? continueQuestion(index, currentCorrect, currentDraft.answer) : canOpenBetPrompt ? setBetPromptOpen(true) : checkCurrentAnswer())}
              accessibilityRole="button"
              accessibilityLabel={currentDraft.checked ? (index + 1 >= sessionQuestions.length ? 'Finish quiz' : 'Next question') : currentReady ? 'Check answer' : (needsBet ? 'Place your bet' : WAITING_LABEL[currentQuestion.type])}
              accessibilityState={{ disabled: !actionReady }}
              android_ripple={{ color: 'rgba(255,255,255,0.14)', borderless: false }}
              style={[
                s.mainBtn,
                s.quizActionBtn,
                {
                  backgroundColor: survival ? (actionReady ? (dark ? '#BE123C' : '#E11D48') : (dark ? '#4A2A38' : '#F9DDE5')) : actionButtonBg,
                  borderTopColor: dark ? 'rgba(255,255,255,0.16)' : '#FFFFFF',
                  borderLeftColor: dark ? 'rgba(255,255,255,0.12)' : '#FFFFFF',
                  borderBottomColor: survival ? (actionReady ? '#9F1239' : '#E8B9C8') : dark ? 'rgba(0,0,0,0.72)' : actionReady ? '#A8AFE8' : '#C5C9EA',
                  borderRightColor: survival ? (actionReady ? '#9F1239' : '#E8B9C8') : dark ? 'rgba(0,0,0,0.72)' : actionReady ? '#A8AFE8' : '#C5C9EA',
                  shadowColor: survival ? '#BE123C' : dark ? '#000000' : actionReady ? '#969DDB' : '#9DA3B5',
                  shadowOpacity: dark ? 0.52 : 0.38,
                  elevation: 8,
                },
                !actionReady && s.quizActionDisabled,
              ]}
            >
              <Text style={[s.mainBtnText, s.quizActionText, { color: survival ? (actionReady ? '#FFFFFF' : (dark ? '#C88B9D' : '#A85C74')) : !actionReady ? (dark ? '#8E9AD0' : '#6872BC') : (dark ? '#A5B4FC' : '#4F46E5') }]}>
                {currentDraft.checked ? (index + 1 >= sessionQuestions.length ? 'Finish' : 'Next') : currentReady ? 'Check answer' : (needsBet ? 'Place your bet' : WAITING_LABEL[currentQuestion.type])}
              </Text>
              {(currentDraft.checked || currentReady) && <Icon name={currentDraft.checked ? 'arrow_forward' : 'check'} size={20} exact color={survival ? '#FFFFFF' : dark ? '#A5B4FC' : '#4F46E5'} />}
            </Pressable>
          </View>
        </View>
      </View>
      <Modal visible={!!(stakes && currentAnswered && !currentDraft.checked && ((needsBet && currentQuestion.type !== 'multi_select') || betPromptOpen))} transparent animationType="slide" statusBarTranslucent onRequestClose={() => { if (currentQuestion.type === 'multi_select') setBetPromptOpen(false); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(8,12,24,0.62)', justifyContent: 'flex-end' }}>
          <View style={{ width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(22, bottomInset + 12), gap: 16, backgroundColor: dark ? '#171D2C' : '#F8FAFF', shadowColor: '#000000', shadowOpacity: 0.24, shadowRadius: 22, shadowOffset: { width: 0, height: -6 }, elevation: 16 }}>
            <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: dark ? '#64748B' : '#CBD5E1', alignSelf: 'center' }} />
            <View style={{ minHeight: 80, justifyContent: 'center' }}>
              <Image source={require('../assets/stakes/bet-coins.png')} resizeMode="contain" style={{ position: 'absolute', left: 0, top: 6, width: 76, height: 64, opacity: 0.55 }} />
              <Image source={require('../assets/stakes/bet-sparkles.png')} resizeMode="contain" style={{ position: 'absolute', right: 0, top: 8, width: 42, height: 48, opacity: 0.55 }} />
              <View style={{ alignItems: 'center', gap: 4, paddingHorizontal: 58 }}><Text numberOfLines={2} style={{ fontFamily: FONT.outfit.b, fontSize: fz(21), textAlign: 'center', color: dark ? '#F8FAFC' : '#101D33' }}>How sure are you?</Text><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(11), color: dark ? '#AAB5C6' : '#64748B', textAlign: 'center' }}>Choose your bet before checking</Text></View>
            </View>
            <BetCards dark={dark} selected={bets[index]} onSelect={selectBet} tickScale={betTickScale} />
          </View>
        </View>
      </Modal>
      {levelUp !== null && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 19, backgroundColor: '#000000', opacity: levelToastOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }]} />}
      {levelUp !== null && <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: '20%', left: 18, right: 18, zIndex: 20, alignItems: 'center', opacity: levelToastOpacity, transform: [{ translateY: levelToastLift }] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '100%', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, backgroundColor: dark ? '#3B1D2C' : '#FFFFFF', borderWidth: BW, borderColor: dark ? '#FB7185' : '#FDA4AF', shadowColor: '#BE123C', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: dark ? '#6B2943' : '#FFE4EC', alignItems: 'center', justifyContent: 'center' }}><Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M12 22c4.42 0 8-3.58 8-8 0-3.18-1.84-5.98-5.52-8.42.04 2.5-1.08 4.12-2.48 4.42C12.3 6.8 10.54 3.36 7.5 2 8 5.28 6.92 7.2 5.26 9.12 4.44 10.08 4 11.66 4 14c0 4.42 3.58 8 8 8Zm0-2a3.5 3.5 0 0 1-3.5-3.5c0-1.44.8-2.5 1.5-3.5.28 1.42 1.12 2.16 2 2.5.38-1.24.48-2.42.5-3.5 2 1.54 3 2.88 3 4.5A3.5 3.5 0 0 1 12 20Z" fill={dark ? '#FB7185' : '#E11D48'} /></Svg></View>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: FONT.outfit.b, fontSize: fz(15), color: dark ? '#FFF1F2' : '#9F1239' }}>Level {levelUp} reached!</Text><Text style={{ fontFamily: FONT.outfit.md, fontSize: fz(11), color: dark ? '#F3B5C9' : '#A83D60' }}>{DIFFICULTY_LABEL[difficultyForLevel(levelUp)]} questions unlocked</Text></View>
        </View>
      </Animated.View>}
      {confirmLeave && (
        <Pressable style={[s.leaveOverlay, { paddingBottom: 16 + bottomInset }]} onPress={() => setConfirmLeave(false)}>
          <Pressable style={[s.leaveCard, dark ? { backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.10)', borderWidth: BW } : { backgroundColor: '#FFFFFF' }]} onPress={() => {}}>
            <Text style={[s.leaveTitle, { color: dark ? '#F8FAFC' : '#1C2033' }]}>Leave this quiz?</Text>
            <Text style={[s.body13, { color: dark ? '#94A3B8' : '#64748B' }]}>Your answers in this session will not be saved.</Text>
            <Pressable onPress={() => setConfirmLeave(false)} style={[s.leaveBtn, { backgroundColor: '#6366F1' }]}>
              <Text style={[s.leaveBtnText, { color: '#FFFFFF' }]}>Keep going</Text>
            </Pressable>
            <Pressable onPress={onExit} style={[s.leaveBtn, { borderWidth: BW, borderColor: dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]}>
              <Text style={[s.leaveBtnText, { color: dark ? '#E2E8F0' : '#334155' }]}>Leave</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  debugRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 8, paddingHorizontal: 16 },
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
  speedKicker: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), letterSpacing: 0.12 * 10 * MAIN, includeFontPadding: false },
  speedMeta: { marginTop: 3, fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), includeFontPadding: false },
  speedTime: { fontFamily: FONT.mono.b, fontSize: fz(24 * MAIN), lineHeight: lh(24, 1), includeFontPadding: false },
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
  question: { fontFamily: FONT.outfit.sb, fontSize: fz(15 * MAIN), lineHeight: lh(15, 1.3), letterSpacing: -0.025 * 15 * MAIN, includeFontPadding: false },
  selectedPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  selectedText: { fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.3333), includeFontPadding: false },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  body13: { fontFamily: FONT.body, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  // code panel
  codePanel: { width: '100%', borderRadius: 12, borderWidth: BW, borderColor: 'rgba(51,65,85,0.6)', backgroundColor: '#0D1322', overflow: 'hidden', position: 'relative' },
  codeBar: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 3, backgroundColor: '#090D17', borderBottomWidth: BW, borderBottomColor: 'rgba(30,41,59,0.7)' },
  copyButton: { marginLeft: 'auto', width: 22, height: 22, borderRadius: 5, borderWidth: BW, borderColor: '#334155', backgroundColor: 'rgba(30,41,59,0.9)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 2.91 },
  selectionRail: { position: 'absolute', top: 32, left: 0, bottom: 0, width: 28, paddingTop: 2 },
  selectionRailRow: { height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1322' },
  gutter: { width: 36, textAlign: 'right', paddingRight: 12, fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), color: '#64748B', includeFontPadding: false },
  codeText: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.4), includeFontPadding: false },
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
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 10, borderRadius: 10, borderWidth: BW },
  hintBtnText: { fontFamily: FONT.outfit.sb, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.4), includeFontPadding: false },
  hintBox: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, borderWidth: BW, paddingHorizontal: 10, paddingVertical: 8 },
  hintText: { flex: 1, fontFamily: FONT.body, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.4), includeFontPadding: false },
  feedback: { borderRadius: 16, borderWidth: TWO, padding: 12, gap: 6 },
  feedbackTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4), includeFontPadding: false },
  explain: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  conceptLine: { fontFamily: FONT.mono.sb, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  // main button
  mainBtn: { height: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mainBtnText: { fontFamily: FONT.outfit.sb, fontSize: fz(15 * MAIN), lineHeight: lh(15, 1.5), includeFontPadding: false },
  quizActionBtn: { width: '100%', height: 54, borderRadius: 28, borderWidth: 1, paddingHorizontal: 18, gap: 10, elevation: 8, shadowOffset: { width: 5, height: 5 }, shadowRadius: 8 },
  quizActionDisabled: { shadowOpacity: 0.25, elevation: 2 },
  quizActionText: { fontSize: fz(16 * MAIN), lineHeight: lh(16, 1.4) },
  // leave dialog
  leaveOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', padding: 16, zIndex: 20 },
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
