import React from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { BW, Icon, MAIN, fz } from './shell';
import { accentFor, lh } from './parts';
import { ShadowStack } from './shadows';
import { FONT, Palette } from './theme';
import { QuizFilter, QuizProgress, buildDailySession, buildSession, getQuizWorlds, matchesQuizFilter, worldStats } from './quizData';
import type { QuizQuestion } from './quizQuestions';

import { CURRICULUM_WORLDS } from './curriculumData';

// The Quiz tab, rebuilt in React Native to look like the web one (src/components/QuizView.tsx). Sizes are the web's CSS pixels, read from
// the running app. UI only, with sample data: there is no quiz logic behind it, and the progress numbers below are made up so that every
// card state (new, in progress with missed questions, finished) shows up.

const WORLD_GLYPHS: Record<number, string> = {
  1: '\u003C/\u003E', 2: '+=%', 3: '<>', 4: '↻', 5: 'f(x)', 6: '[ ]', 7: '?.', 8: '{ }', 9: 'λ',
  10: '.map', 11: 'OOP', 12: '<T>', 13: 'let', 14: 'seq', 15: 'try', 16: 'co', 17: '~>',
};

// ---------------------------------------------------------------------------------------------------------------------

type QuizMode = {
  id: string;
  badge: string;
  title: string;
  description: string;
  detail: string;
  action: string;
  icon: string;
  tone: string;
  tone2: string;
  toneLight: string;
  /** 'soon' cards are not built yet: they show a coming-soon dialog and never start a quiz. */
  kind: 'quick' | 'review' | 'soon';
};

type QuizTypeCard = { id: string; filter: QuizFilter; title: string; description: string; icon: string; tone: string; tone2: string; toneLight: string };
// Most useful first (the grid reads column by column): code reading, then recall, then the lighter and harder extras.
// One card per question type: a short quiz of only that kind of question, drawn from every World.
const QUIZ_TYPES: QuizTypeCard[] = [
  { id: 'predict-output', filter: { type: 'predict_output' }, title: 'Predict Output', description: 'Choose what the code prints.', icon: 'terminal', tone: '#8B7DF7', tone2: '#8B7DF7', toneLight: '#6655F0' },
  { id: 'code-comparison', filter: { type: 'code_comparison' }, title: 'Compare Code', description: 'Spot how two snippets differ.', icon: 'compare_arrows', tone: '#38BDF8', tone2: '#38BDF8', toneLight: '#0079C8' },
  { id: 'fill-blank', filter: { type: 'fill_blank' }, title: 'Fill the Blank', description: 'Complete the missing code.', icon: 'code', tone: '#2DD4BF', tone2: '#2DD4BF', toneLight: '#008E83' },
  { id: 'bug-hunter', filter: { type: 'find_error' }, title: 'Bug Hunter', description: 'Find the error in the code.', icon: 'bug_report', tone: '#FB923C', tone2: '#FB923C', toneLight: '#C0522B' },
  { id: 'true-false', filter: { type: 'true_false' }, title: 'True or False', description: 'Spot the Kotlin myths.', icon: 'check_circle', tone: '#E879F9', tone2: '#E879F9', toneLight: '#A23F99' },
  { id: 'multi-select', filter: { type: 'multi_select' }, title: 'Multi Select', description: 'Pick all the right answers.', icon: 'checklist', tone: '#84CC16', tone2: '#84CC16', toneLight: '#4B8C26' },
  { id: 'single-choice', filter: { type: 'single_choice' }, title: 'Single Choice', description: 'Pick the one right answer.', icon: 'radio_button_checked', tone: '#8B7DF7', tone2: '#8B7DF7', toneLight: '#6655F0' },
  { id: 'hard-mode', filter: { difficulty: 'hard' }, title: 'Hard Mode', description: 'Only the toughest questions.', icon: 'military_tech', tone: '#38BDF8', tone2: '#38BDF8', toneLight: '#0079C8' },
];

// Space between the screen edge and the content of every section.
const PAGE_X = 12;

// One surface, shadow and corner radius for every card on the Quiz tab, the same as the Practice tab's cards.
const cardSurface = (dark: boolean) => ({ backgroundColor: dark ? '#1A2133' : '#FFFFFF', borderColor: dark ? '#2C3548' : '#D5DDE8' });
// The format and world cards use the Practice tab's day-mode surface: a flat off-white with no border.
const flatSurface = (dark: boolean) => (dark ? cardSurface(dark) : { backgroundColor: '#F6F7FA', borderColor: 'transparent' });
const cardShadow = (dark: boolean) => (dark ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: 0.3 }] : [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.1 }]);

const QUIZ_MODES: QuizMode[] = [
  { id: 'quick-mix', badge: 'RANDOM', title: 'Quick Mix', description: "A fresh mix of questions from concepts you've learned.", detail: '10 questions · ~5 min', action: 'Start', icon: 'shuffle', tone: '#2DD4BF', toneLight: '#008E83', tone2: '#3B82F6', kind: 'quick' },
  { id: 'mistakes', badge: 'REVIEW', title: 'Mistake Replay', description: 'Revisit questions you previously answered incorrectly.', detail: '5–15 questions', action: 'Review', icon: 'replay', tone: '#FDBA74', toneLight: '#C0522B', tone2: '#F43F5E', kind: 'review' },
  { id: 'daily', badge: 'TODAY', title: 'Daily Challenge', description: 'A new set of questions each day to keep your skills sharp.', detail: '10 questions · ~5 min', action: 'Start', icon: 'rocket_launch', tone: '#60A5FA', toneLight: '#0079C8', tone2: '#8B5CF6', kind: 'quick' },
  { id: 'speed-round', badge: 'TIMED', title: 'Speed Round', description: 'Answer as many questions as you can before the 60 seconds run out.', detail: '60 seconds · Best score', action: 'Start', icon: 'bolt', tone: '#FACC15', tone2: '#F97316', toneLight: '#A23F99', kind: 'soon' },
];

// The icon font is a subset without these glyphs, so they are drawn (Material Symbols paths, 24px).
const FITNESS_CENTER_PATH = 'm536-84-56-56 142-142-340-340-142 142-56-56 56-58-56-56 84-84-56-58 56-56 58 56 84-84 56 56 58-56 56 56-142 142 340 340 142-142 56 56-56 58 56 56-84 84 56 58-56 56-58-56-84 84-56-56-58 56Z';
const SHUFFLE_PATH = 'M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z';
const DRAWN_ICONS: Record<string, string> = {
  fitness_center: FITNESS_CENTER_PATH,
  shuffle: SHUFFLE_PATH,
  radio_button_checked: 'M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z',
  checklist: 'M222-200 80-342l56-56 85 85 170-170 56 57-225 226Zm0-320L80-662l56-56 85 85 170-170 56 57-225 226Zm298 240v-80h360v80H520Zm0-320v-80h360v80H520Z',
  schedule: 'm612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z',
  compare_arrows: 'm320-160-56-57 103-103H80v-80h287L264-503l56-57 200 200-200 200Zm320-240L440-600l200-200 56 57-103 103h287v80H593l103 103-56 57Z',
};
/** The footer's detail line. A "~" in the text is drawn as a small clock, so "10 questions · ~5 min" reads "10 questions · (clock) 5 min". */
function DetailText({ text, color }: { text: string; color: string }) {
  const [before, after] = text.split('~');
  if (after === undefined) return <Text numberOfLines={1} style={[s.modeDetail, { color }]}>{text}</Text>;
  const px = fz(12 * MAIN);
  return (
    <View style={s.detailRow}>
      <Text numberOfLines={1} style={[s.modeDetail, { color, flex: 0, flexShrink: 1 }]}>{before}</Text>
      <Svg width={px} height={px} viewBox="0 -960 960 960" style={{ marginHorizontal: 3 }}><Path d={DRAWN_ICONS.schedule} fill={color} /></Svg>
      <Text numberOfLines={1} style={[s.modeDetail, { color, flex: 0 }]}>{after}</Text>
    </View>
  );
}

function ModeIcon({ name, color }: { name: string; color: string }) {
  const d = DRAWN_ICONS[name] ?? null;
  if (!d) return <Icon name={name} size={18} exact color={color} />;
  const px = fz(18 * MAIN);
  return <Svg width={px} height={px} viewBox="0 -960 960 960"><Path d={d} fill={color} /></Svg>;
}

// A diagonal wash of the card's own colour across the whole card (stronger at the top-left, still tinted at the bottom-right).
function ModeGradient({ id, tone, tone2, dark, strength = 1 }: { id: string; tone: string; tone2: string; dark: boolean; strength?: number }) {
  // Svg percentage sizes do not fill an absolutely positioned box reliably, so measure the card and draw at its pixel size.
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size.w} y2={size.h}>
              <Stop offset="0" stopColor={tone} stopOpacity={(dark ? 0.34 : 0.22) * strength} />
              <Stop offset="1" stopColor={tone2} stopOpacity={(dark ? 0.22 : 0.16) * strength} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.w} height={size.h} fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const todayLabel = () => { const d = new Date(); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; };

// Both review modes need something to work on: at least one missed question.
const isModeLocked = (mode: QuizMode, missed: number) => mode.kind === 'soon' || (mode.kind === 'review' && missed < 1);
const lockedDetail = (mode: QuizMode) => (mode.kind === 'soon' ? 'Coming soon' : 'No mistakes yet');
const lockedCopy = (mode: QuizMode) => mode.kind === 'soon'
  ? { heading: 'Coming soon', body: `${mode.title} is on its way. ${mode.description}`, rule: 'In the works' }
  : { heading: 'Nothing to replay yet', body: 'Every question you get wrong is saved here. Miss one in any quiz, and you can replay it until it sticks.', rule: 'Unlocks after your first miss' };

function LockedDialog({ mode, dark, onClose, onQuickMix }: { mode: QuizMode | null; dark: boolean; onClose: () => void; onQuickMix: () => void }) {
  if (!mode) return null;
  const ink = dark ? mode.tone : mode.toneLight;
  const title = dark ? '#F8FAFC' : '#203047';
  const muted = dark ? '#94A3B8' : '#52647B';
  const copy = lockedCopy(mode);
  return (
    <Modal transparent animationType="fade" statusBarTranslucent visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={s.dialogBackdrop}>
        <Pressable onPress={() => {}} style={[s.dialog, { backgroundColor: dark ? '#141B2B' : '#FFFFFF', borderColor: `${ink}55` }]}>
          <ModeGradient id="grad-dialog" tone={ink} tone2={mode.tone2} dark={dark} />
          <View style={[s.dialogIcon, { backgroundColor: `${ink}1F`, borderColor: `${ink}55` }]}>
            <ModeIcon name={mode.icon} color={ink} />
            <View style={[s.dialogLock, { backgroundColor: dark ? '#141B2B' : '#FFFFFF', borderColor: `${ink}55` }]}><Icon name="lock" size={11} exact color={ink} /></View>
          </View>
          <Text style={[s.dialogKicker, { color: ink }]}>{mode.title.toUpperCase()} · {mode.kind === 'soon' ? 'SOON' : 'LOCKED'}</Text>
          <Text style={[s.dialogTitle, { color: title }]}>{copy.heading}</Text>
          <Text style={[s.dialogBody, { color: muted }]}>{copy.body}</Text>
          <View style={[s.dialogRule, { backgroundColor: `${ink}14`, borderColor: `${ink}40` }]}><Icon name="lock" size={13} exact color={ink} /><Text style={[s.dialogRuleText, { color: ink }]}>{copy.rule}</Text></View>
          <View style={s.dialogActions}>
            <Pressable onPress={onClose} style={[s.dialogBtn, { borderWidth: BW, borderColor: `${ink}55` }]}><Text style={[s.dialogBtnText, { color: ink }]}>Got it</Text></Pressable>
            <Pressable onPress={onQuickMix} style={[s.dialogBtn, { backgroundColor: ink }]}><Text style={[s.dialogBtnText, { color: dark ? '#0B1020' : '#FFFFFF' }]}>Try Quick Mix</Text></Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function QuizModeRail({ dark, missed, onStart }: { dark: boolean; missed: number; onStart: (mode: QuizMode) => void }) {
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.8;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lockedMode, setLockedMode] = React.useState<QuizMode | null>(null);
  // Locked cards go last, so a new learner sees the modes that work first.
  const modes = React.useMemo(() => [...QUIZ_MODES].sort((a, b) => Number(isModeLocked(a, missed)) - Number(isModeLocked(b, missed))), [missed]);
  const updateActiveIndex = (offset: number) => {
    const index = Math.round(offset / (cardWidth + 12));
    setActiveIndex(Math.max(0, Math.min(modes.length - 1, index)));
  };
  const title = dark ? '#F8FAFC' : '#203047';
  const muted = dark ? '#94A3B8' : '#52647B';
  return (
    <View style={s.modeSection}>
      <View style={s.modeHeading}><View><Text style={[s.h2, { color: title }]}>Ways to Play</Text><Text style={[s.sub, { color: muted }]}>Pick a mode that fits your mood.</Text></View></View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.modeRail}
        snapToInterval={cardWidth + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        directionalLockEnabled
        scrollEventThrottle={16}
        onScroll={(event) => updateActiveIndex(event.nativeEvent.contentOffset.x)}
      >
        {modes.map((mode) => {
          const ink = dark ? mode.tone : mode.toneLight;
          const cardMuted = muted;
          const unavailable = isModeLocked(mode, missed);
          const detail = unavailable ? lockedDetail(mode) : mode.kind === 'review' ? `${missed} to revisit` : mode.detail;
          return (
            <View key={mode.id} style={{ width: cardWidth }}>
            <ShadowStack r={12} shadows={cardShadow(dark)} />
            <Pressable accessibilityHint={unavailable ? lockedCopy(mode).body : undefined} onPress={() => (unavailable ? setLockedMode(mode) : onStart(mode))} style={[s.modeCard, cardSurface(dark), { borderColor: `${ink}55` }, unavailable && { opacity: 0.58 }]}>
              <ModeGradient id={`grad-${mode.id}`} tone={ink} tone2={mode.tone2} dark={dark} strength={0.45} />
              <View style={s.modeCardTop}><View style={s.modeHead}><View style={[s.modeIcon, { backgroundColor: `${ink}18`, borderColor: `${ink}55` }]}><ModeIcon name={mode.icon} color={ink} /></View><Text numberOfLines={2} style={[s.modeTitle, { color: title }]}>{mode.title}</Text></View>{cardWidth >= 260 && <View style={[s.modeBadge, { backgroundColor: `${ink}18`, borderColor: `${ink}55` }]}><Text style={[s.modeBadgeText, { color: ink }]}>{mode.id === 'daily' ? todayLabel() : mode.badge}</Text></View>}</View>
              <Text numberOfLines={2} style={[s.modeDescription, { color: cardMuted }]}>{mode.description}</Text>
              <View style={[s.modeFooter, { borderTopColor: dark ? '#283247' : '#E2E8F0', backgroundColor: dark ? 'rgba(8,12,22,0.4)' : 'rgba(255,255,255,0.7)' }]}><DetailText text={detail} color={cardMuted} /><View style={s.modeAction}><Text style={[s.modeActionText, { color: ink }]}>{unavailable ? (mode.kind === 'soon' ? 'Soon' : 'Locked') : mode.action}</Text><Icon name="arrow_forward" size={18} exact color={ink} /></View></View>
            </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <LockedDialog mode={lockedMode} dark={dark} onClose={() => setLockedMode(null)} onQuickMix={() => { setLockedMode(null); onStart(QUIZ_MODES[0]); }} />
      <View style={s.modePagination}>{modes.map((mode, index) => <View key={mode.id} style={[s.modeDot, index === activeIndex ? { width: 16, backgroundColor: dark ? mode.tone : mode.toneLight } : { backgroundColor: dark ? '#475569' : '#94A3B8' }]} />)}</View>
    </View>
  );
}

function TypeCard({ card, count, dark, onOpen }: { card: QuizTypeCard; count: number; dark: boolean; onOpen: () => void }) {
  const ink = dark ? card.tone : card.toneLight;
  const muted = dark ? '#94A3B8' : '#52647B';
  const available = count > 0;
  return (
    <View>
      <ShadowStack r={12} shadows={cardShadow(dark)} />
      <Pressable
        accessibilityState={{ disabled: !available }}
        onPress={() => { if (available) onOpen(); }}
        android_ripple={{ color: `${ink}33`, borderless: false, foreground: true }}
        style={[s.typeCard, flatSurface(dark), !available && { opacity: 0.58 }]}
      >
        <View style={{ gap: 3 }}>
          <View style={s.typeTitleRow}>
            <Text numberOfLines={1} style={[s.typeTitle, { color: dark ? '#F8FAFC' : '#203047' }]}>{card.title}</Text>
            {/* A fixed box, so a drawn (SVG) icon and a font icon take the same height and every card matches. */}
            <View style={s.typeIcon}><ModeIcon name={card.icon} color={ink} /></View>
          </View>
          <Text numberOfLines={2} style={[s.typeDescription, { color: muted }]}>{card.description}</Text>
        </View>
        <View style={s.typeFooter}>
          <Text numberOfLines={1} style={[s.typeCount, { color: muted }]}>{available ? `${count} questions` : 'Coming soon'}</Text>
          {available && <Icon name="chevron_right" size={20} exact color={ink} />}
        </View>
      </Pressable>
    </View>
  );
}

/** Two rows of type cards that scroll sideways, a column at a time. Bleeds to the screen edges like the activity rail. */
function TypeGrid({ dark, counts, onOpen }: { dark: boolean; counts: Record<string, number>; onOpen: (card: QuizTypeCard) => void }) {
  const { width } = useWindowDimensions();
  const columnWidth = (width - 24) / 2.2; // two full columns and a small peek of the third
  const columns: QuizTypeCard[][] = [];
  for (let i = 0; i < QUIZ_TYPES.length; i += 2) columns.push(QUIZ_TYPES.slice(i, i + 2));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -PAGE_X }} contentContainerStyle={s.typeGrid} snapToInterval={columnWidth + 12} snapToAlignment="start" decelerationRate="fast" directionalLockEnabled>
      {columns.map((column, i) => (
        <View key={i} style={{ width: columnWidth, gap: 12 }}>
          {column.map((card) => <TypeCard key={card.id} card={card} count={counts[card.id] ?? 0} dark={dark} onOpen={() => onOpen(card)} />)}
        </View>
      ))}
    </ScrollView>
  );
}

function WorldCard({ world, dark, onOpen, onReview, showAccentBorder }: { world: { order: number; title: string; total: number; correct: number; missed: number }; dark: boolean; onOpen: (world: { order: number; title: string }) => void; onReview: (world: { order: number; title: string }) => void; showAccentBorder: boolean }) {
  const [darkAccent, lightAccent] = accentFor(world.order);
  const accent = dark ? darkAccent : lightAccent;
  const muted = dark ? '#94A3B8' : '#52647B';
  const title = dark ? '#F8FAFC' : '#203047';
  const percent = world.total ? Math.round((world.correct / world.total) * 100) : 0;
  const started = world.correct > 0;
  const done = world.total > 0 && world.correct >= world.total;
  const available = world.total > 0;
  const action = !available ? 'Coming soon' : done ? 'Review' : started ? 'Continue' : 'Start Quiz';
  return (
    <View style={{ flex: 1 }}>
      <ShadowStack r={12} shadows={cardShadow(dark)} />
      <Pressable
        accessibilityState={{ disabled: !available }}
        onPress={() => { if (available) onOpen({ order: world.order, title: world.title }); }}
        android_ripple={{ color: `${accent}33`, borderless: false, foreground: true }}
        style={[s.card, flatSurface(dark), showAccentBorder && { borderLeftColor: darkAccent, borderLeftWidth: 2.91 }]}
      >
        <View>
          <View style={s.cardTop}>
            <View style={[s.worldLabelWrap, { borderColor: `${accent}66`, backgroundColor: `${accent}18` }]}><Text numberOfLines={1} style={[s.worldLabel, { color: accent }]}>World {String(world.order).padStart(2, '0')}</Text></View>
            {available && !done && <Text style={[s.percentText, { color: started ? accent : muted }]}>{percent}%</Text>}
            {done && <View style={[s.completeMark, { backgroundColor: `${accent}18` }]}><Icon name="check" size={17} exact color={accent} /></View>}
          </View>
          <Text numberOfLines={2} style={[s.cardTitle, { color: title }]}>{world.title}</Text>
          <View style={s.metaRow}>
            <View style={[s.glyph, { backgroundColor: `${accent}18` }]}><Text style={[s.glyphText, { color: accent }]}>{WORLD_GLYPHS[world.order] ?? '{ }'}</Text></View>
            <Text style={[s.mono11, { color: muted }]}>{world.total} questions</Text>
          </View>
        </View>
        <View style={s.cardBottom}>
          <View style={[s.startRow, world.missed > 0 && { paddingRight: 56 }]}><Text style={[s.startText, { color: available ? accent : muted }]}>{action}</Text>{available && <Icon name={done ? 'replay' : 'chevron_right'} size={20} exact color={accent} />}</View>
        </View>
        {/* Progress runs edge to edge along the bottom of the card. */}
        <View style={[s.edgeTrack, { backgroundColor: dark ? '#222B3E' : '#E2E8F0' }]}><View style={{ height: 4, width: `${percent}%`, backgroundColor: accent }} /></View>
      </Pressable>
      {world.missed > 0 && <Pressable accessibilityRole="button" accessibilityLabel={`Review ${world.missed} missed questions in ${world.title}`} onPress={() => onReview({ order: world.order, title: world.title })} style={[s.missed, dark ? { backgroundColor: '#253047' } : { backgroundColor: '#EEF2F7' }]}><Icon name="replay" size={16} exact color={accent} /><Text style={[s.missedText, { color: accent }]}>{world.missed}</Text></Pressable>}
    </View>
  );
}

/** The Quiz tab's content (the shared top bar and tab bar live in App.tsx). */
export const QuizContent = React.memo(function QuizContent({ p, progress, onOpenQuiz, onOpenType, onOpenSession, showAccentBorder = true }: { p: Palette; progress: QuizProgress; onOpenType?: (filter: QuizFilter, label: string) => void; onOpenSession?: (questions: QuizQuestion[], label: string) => void; onOpenQuiz: (world?: { order: number; title: string }, review?: boolean) => void; showAccentBorder?: boolean }) {
  const isDark = p.isDark;
  const title = isDark ? '#E2E8F0' : '#203047';
  const muted = isDark ? '#94A3B8' : '#52647B';

  // A faint tint behind each section, so the three parts of the page read as separate blocks.
  const bands = isDark
    ? { modes: 'rgba(148,163,184,0.05)', format: 'rgba(148,163,184,0.09)', world: 'rgba(148,163,184,0.05)' }
    : { modes: 'rgba(100,116,139,0.06)', format: 'rgba(100,116,139,0.11)', world: 'rgba(100,116,139,0.06)' };
  const quizWorlds = getQuizWorlds();
  // The Quick Mix and Daily Challenge cards pick their questions up front, so a tap starts exactly that set.
  // Quick Mix is re-picked whenever your answers change (so a finished quiz is not offered again); Daily is fixed for the day.
  const dayKey = new Date().toDateString();
  const sessions = React.useMemo(() => ({ 'quick-mix': buildSession(quizWorlds, undefined, progress), daily: buildDailySession(quizWorlds) }), [progress, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const worlds = CURRICULUM_WORLDS.map((catalogWorld) => {
    const world = quizWorlds.find((candidate) => candidate.order === catalogWorld.order);
    const stats = world ? worldStats(world, progress) : { total: 0, correct: 0, missed: 0, seen: 0 };
    return { order: catalogWorld.order, title: catalogWorld.title, total: stats.total, correct: stats.correct, missed: stats.missed, seen: stats.seen };
  });
  const missed = worlds.reduce((total, world) => total + world.missed, 0);
  const typeCounts = React.useMemo(() => {
    const questions = quizWorlds.flatMap((world) => world.questions);
    return Object.fromEntries(QUIZ_TYPES.map((card) => [card.id, questions.filter((q) => matchesQuizFilter(q, card.filter)).length]));
  }, [quizWorlds]);
  const rows: typeof worlds[] = [];
  for (let i = 0; i < worlds.length; i += 2) rows.push(worlds.slice(i, i + 2));

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? p.page : '#E8EDF4' }}>
      <FlatList
        data={rows}
        keyExtractor={(_, index) => `world-row-${index}`}
        renderItem={({ item: row }) => (
          <View style={[s.band, { backgroundColor: bands.world, paddingBottom: 12 }]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {row.map((w) => (
                <WorldCard key={w.order} world={w} dark={isDark} onOpen={onOpenQuiz} onReview={(world) => onOpenQuiz(world, true)} showAccentBorder={showAccentBorder} />
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={[s.band, { backgroundColor: bands.modes, paddingTop: 20, paddingBottom: 14 }]}>
              <QuizModeRail dark={isDark} missed={missed} onStart={(mode) => {
                if (mode.id === 'quick-mix' && onOpenSession) onOpenSession(sessions['quick-mix'], 'Quick quiz');
                else if (mode.id === 'daily' && onOpenSession) onOpenSession(sessions.daily, 'Daily challenge');
                else onOpenQuiz(undefined, mode.kind === 'review');
              }} />
            </View>
            <View style={[s.band, { backgroundColor: bands.format, paddingTop: 20, paddingBottom: 20 }]}>
              <View style={{ paddingHorizontal: 4 }}>
                <Text style={[s.h2, { color: title }]}>Quiz by Format</Text>
                <Text style={[s.sub, { color: muted }]}>One kind of question at a time.</Text>
              </View>
              <View style={{ height: 12 }} />
              <TypeGrid dark={isDark} counts={typeCounts} onOpen={(card) => onOpenType?.(card.filter, card.title)} />
            </View>
            <View style={[s.band, { backgroundColor: bands.world, paddingTop: 20 }]}>
              <View style={{ paddingHorizontal: 4 }}>
                <Text style={[s.h2, { color: title }]}>Quiz by World</Text>
                <Text style={[s.sub, { color: muted }]}>Test your knowledge, world by world.</Text>
              </View>
              <View style={{ height: 12 }} />
            </View>
          </>
        }
        ListFooterComponent={<View style={{ height: 32, marginHorizontal: -PAGE_X, backgroundColor: bands.world }} />}
        contentContainerStyle={{ paddingHorizontal: PAGE_X }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const s = StyleSheet.create({
  sub: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), marginTop: 2, includeFontPadding: false },
  h2: { fontFamily: FONT.outfit.sb, fontSize: fz(17 * MAIN), lineHeight: lh(17, 1.4), letterSpacing: -0.025 * 17 * MAIN, includeFontPadding: false },
  // horizontally scrolling quiz activities
  modeSection: { gap: 6, marginHorizontal: -PAGE_X },
  modeHeading: { paddingHorizontal: PAGE_X + 4, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  modeRail: { gap: 12, paddingHorizontal: PAGE_X, paddingTop: 4, paddingBottom: 14 },
  modePagination: { height: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modeDot: { width: 6, height: 6, borderRadius: 3 },
  modeCard: { flex: 1, minHeight: 146, borderRadius: 12, borderWidth: BW, padding: 16, justifyContent: 'space-between', gap: 8, overflow: 'hidden' },
  modeCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dialogBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 360, borderRadius: 24, borderWidth: BW, padding: 22, overflow: 'hidden', alignItems: 'center' },
  dialogIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: BW, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  dialogLock: { position: 'absolute', right: -6, bottom: -6, width: 22, height: 22, borderRadius: 11, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  dialogKicker: { fontFamily: FONT.mono.b, fontSize: fz(9.5 * MAIN), letterSpacing: 0.08 * 9.5 * MAIN, includeFontPadding: false, textAlign: 'center' },
  dialogTitle: { marginTop: 8, fontFamily: FONT.outfit.b, fontSize: fz(20 * MAIN), lineHeight: lh(20, 1.25), letterSpacing: -0.025 * 20 * MAIN, textAlign: 'center', includeFontPadding: false },
  dialogBody: { marginTop: 8, fontFamily: FONT.body, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.45), textAlign: 'center', includeFontPadding: false },
  dialogRule: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: BW },
  dialogRuleText: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), includeFontPadding: false },
  dialogActions: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 20 },
  dialogBtn: { flex: 1, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dialogBtnText: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), includeFontPadding: false },
  typeGrid: { gap: 12, paddingHorizontal: PAGE_X, paddingBottom: 4 },
  typeCard: { minHeight: 112, borderRadius: 12, borderWidth: BW, padding: 14, justifyContent: 'space-between', gap: 8, overflow: 'hidden' },
  typeIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  typeTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  typeTitle: { flex: 1, fontFamily: FONT.outfit.b, fontSize: fz(13.5 * MAIN), lineHeight: lh(13.5, 1.35), letterSpacing: -0.025 * 13.5 * MAIN, includeFontPadding: false },
  typeDescription: { minHeight: lh(11, 1.4) * 2, fontFamily: FONT.body, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.4), includeFontPadding: false },
  typeFooter: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  typeCount: { flex: 1, fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  detailRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  band: { marginHorizontal: -PAGE_X, paddingHorizontal: PAGE_X },
  modeHead: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  modeBadge: { flexShrink: 0, maxWidth: 190, borderWidth: BW, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  modeBadgeText: { fontFamily: FONT.mono.b, fontSize: fz(8.5 * MAIN), letterSpacing: 0.05 * 8.5 * MAIN, includeFontPadding: false },
  modeIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: BW, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  modeTitle: { flexShrink: 1, fontFamily: FONT.outfit.b, fontSize: fz(13.5 * MAIN), lineHeight: lh(13.5, 1.35), letterSpacing: -0.025 * 13.5 * MAIN, includeFontPadding: false },
  modeDescription: { minHeight: lh(11.5, 1.4) * 2, fontFamily: FONT.body, fontSize: fz(11.5 * MAIN), lineHeight: lh(11.5, 1.4), includeFontPadding: false },
  modeFooter: { marginHorizontal: -16, marginBottom: -16, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: BW, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  modeDetail: { flex: 1, fontFamily: FONT.body, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.35), includeFontPadding: false },
  modeAction: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  modeActionText: { fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.3), includeFontPadding: false },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  // divider
  divider: { paddingTop: 20 + 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { height: 1, flex: 1 },
  dividerLabel: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, includeFontPadding: false },
  // world card
  card: { flex: 1, borderRadius: 12, padding: 14, borderWidth: BW, justifyContent: 'space-between', overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  worldLabelWrap: { flexShrink: 0, borderWidth: BW, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  worldLabel: { flexShrink: 0, fontFamily: FONT.outfit.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  percentText: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  completeMark: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: FONT.outfit.b, fontSize: fz(13.5 * MAIN), lineHeight: lh(13.5, 1.35), letterSpacing: -0.025 * 13.5 * MAIN, marginBottom: 5, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  glyph: { minWidth: 30, height: 30, borderRadius: 6, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  glyphText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.3), includeFontPadding: false },
  cardBottom: { marginTop: 8, paddingBottom: 2 },
  edgeTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  progressLabel: { fontFamily: FONT.body, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  progressValue: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  track: { height: 5, borderRadius: 3, overflow: 'hidden', width: '100%' },
  startRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  startText: { fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  missed: {
    position: 'absolute', right: 12, bottom: 12, height: 30, minWidth: 48, paddingHorizontal: 8, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  missedText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
});
