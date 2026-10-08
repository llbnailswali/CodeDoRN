import React from 'react';
import { FlatList, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, MAIN, fz } from './shell';
import { accentFor, hexAlpha, lh } from './parts';
import { HelpLevel } from './HelpSheet';
import { PRACTICE_TASKS, PracticeTask } from './practiceTasks';
import { InsetShadow, ShadowStack } from './shadows';
import { FONT, Palette } from './theme';

// The task list that opens when a World is tapped on the Practice tab (web: src/components/TaskListScreen.tsx). It is a full screen with
// its own top bar, so it covers the app shell. UI only, with sample data: the statuses are made up so that every card state shows.

type Mode = 'writeRun' | 'debug';
type Status = 'not_started' | 'in_progress' | 'completed';
type WebStageApi = { warmUp?: () => void; open: (lessonKey: string, stage: Mode, dark: boolean, practice: boolean, tryIt: boolean, prefillCode: string | null) => Promise<'continue' | 'back'> };
const WebStage: WebStageApi | undefined = NativeModules.WebStage;

const practiceLessonKey = (worldOrder: number, mode: Mode, title: string) => {
  const normalizedTitle = mode === 'debug' ? title.replace(/^Fix the\s+/i, '') : title;
  const slug = normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `world-${worldOrder}-practice-${mode === 'writeRun' ? 'writerun' : 'debug'}-${slug}`;
};

export const WORLD_TITLES: Record<number, string> = {
  1: 'Kotlin Awakening', 2: 'Operator Forge', 3: 'Decision Maker', 4: 'Loop Master', 5: 'Function Forge', 6: 'Collection Valley',
  7: 'Null Safety Shield', 8: 'Object Kingdom',
};

/** Sample progress: the first `done` tasks are completed, the next one is in progress, the rest are new. */
const SAMPLE_DONE: Record<number, { writeRun: number; debug: number }> = {
  1: { writeRun: 11, debug: 12 },
  2: { writeRun: 9, debug: 0 },
};
const statusFor = (order: number, mode: Mode, index: number): Status => {
  const done = SAMPLE_DONE[order]?.[mode] ?? 0;
  return index < done ? 'completed' : index === done ? 'in_progress' : 'not_started';
};

const MODE_COLORS = {
  writeRun: { dark: '#569CD6', light: '#1F6FB5', icon: 'code', label: 'Write & Run' },
  debug: { dark: '#CE9178', light: '#A8502F', icon: 'bug_report', label: 'Debug' },
} as const;

const difficultyStyle = (d: PracticeTask['difficulty'], dark: boolean) =>
  ({
    easy: dark ? { color: '#98C379', borderColor: 'rgba(152,195,121,0.5)' } : { color: '#4A7A28', borderColor: 'rgba(152,195,121,0.7)' },
    medium: dark ? { color: '#E5C07B', borderColor: 'rgba(229,192,123,0.5)' } : { color: '#936A14', borderColor: 'rgba(199,154,46,0.7)' },
    hard: dark ? { color: '#CE9178', borderColor: 'rgba(206,145,120,0.5)' } : { color: '#A8502F', borderColor: 'rgba(206,145,120,0.8)' },
  })[d];

// Same idea as the web: break after each finished sentence unless the text already has real line breaks.
const breakAfterSentences = (text: string): string => (text.includes('\n') ? text : text.replace(/([.!?])\s+(?=[A-Z(])/g, '$1\n\n'));

const KEYWORDS = /^(val|var|fun|if|else|when|for|in|return)$/;
/** A very small Kotlin colouring for the "you start with" lines (keywords, numbers, strings). */
function CodeLine({ line }: { line: string }) {
  const parts = line.split(/("[^"]*"|'[^']*'|\b\d[\d_]*(?:\.\d+)?[fFLdD]?\b|\b[A-Za-z_]+\b)/g).filter((x) => x !== '');
  return (
    <Text style={s.givenCode}>
      {parts.map((part, i) => {
        const color = /^["']/.test(part) ? '#CE9178' : /^\d/.test(part) ? '#B5CEA8' : KEYWORDS.test(part) ? '#C586C0' : '#D4D4D4';
        return (
          <Text key={i} style={{ color }}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

function Details({ task, mode, dark, helpLevel }: { task: PracticeTask; mode: Mode; dark: boolean; helpLevel: HelpLevel }) {
  const muted = dark ? '#94A3B8' : '#64748B';
  const bodyColor = dark ? '#DBE1EE' : '#2E3345';
  return (
    <View style={[s.details, { borderTopColor: dark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]}>
      {mode === 'writeRun' && !!task.goal && (
        <View>
          <Text style={s.sectionLabel}>{'// goal'}</Text>
          <Text style={[s.detailText, { color: bodyColor }]}>{task.goal}</Text>
        </View>
      )}
      {mode === 'debug' && !!task.bug && (
        <View>
          <Text style={s.sectionLabel}>{'// the bug'}</Text>
          <Text style={[s.detailText, { color: bodyColor }]}>{task.bug}</Text>
        </View>
      )}
      {task.given.length > 0 && (
        <View>
          <Text style={s.sectionLabel}>{'// you start with'}</Text>
          <View style={s.givenBox}>
            {task.given.map((line, i) => (
              <CodeLine key={i} line={line} />
            ))}
          </View>
        </View>
      )}
      {mode === 'writeRun' && (
        <Text style={[s.mono11, { color: muted }]}>
          {helpLevel === 'beginner' ? '// the full steps are shown when you open the task' : '// the steps appear as hints while you code'}
        </Text>
      )}
      {!!task.expected && (
        <View style={s.outputBox}>
          <View style={s.outputBar}>
            <View style={[s.dot, { backgroundColor: 'rgba(244,63,94,0.7)' }]} />
            <View style={[s.dot, { backgroundColor: 'rgba(245,158,11,0.7)' }]} />
            <View style={[s.dot, { backgroundColor: 'rgba(16,185,129,0.7)' }]} />
            <Text style={s.outputName}>expected_output</Text>
          </View>
          <Text style={s.outputText}>{task.expected}</Text>
        </View>
      )}
    </View>
  );
}

export function TaskListScreen({
  p, worldOrder, mode: startMode, helpLevel, topInset, onBack, onToggleTheme, showTabs = true,
}: {
  /** False when opened from one Home chip: only that mode is shown, so the Write & Run / Debug switch is hidden. */
  showTabs?: boolean;
  p: Palette;
  worldOrder: number;
  mode: Mode;
  helpLevel: HelpLevel;
  topInset: number;
  onBack: () => void;
  onToggleTheme: () => void;
}) {
  const dark = p.isDark;
  const [mode, setMode] = React.useState<Mode>(startMode);
  const [expanded, setExpanded] = React.useState<number | null>(null);
  // Start the browser engine behind the editor now, so opening a task is faster.
  React.useEffect(() => {
    WebStage?.warmUp?.();
  }, []);
  const tasks = PRACTICE_TASKS[worldOrder]?.[mode] ?? [];
  const mc = MODE_COLORS[mode];
  const modeColor = dark ? mc.dark : mc.light;
  const [darkAccent, lightAccent] = accentFor(worldOrder);
  const accentText = dark ? darkAccent : lightAccent;
  const title = dark ? '#F1F5F9' : '#2E3040';
  const muted = dark ? '#94A3B8' : '#64748B';
  const panel = dark
    ? { backgroundColor: '#0F1420', borderColor: 'rgba(255,255,255,0.10)' }
    : { backgroundColor: '#F6F7FA', borderColor: 'rgba(203,213,225,0.7)' };
  const panelShadow = dark ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: 0.3 }] : [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.1 }];

  const statuses = tasks.map((_, i) => statusFor(worldOrder, mode, i));
  const completedCount = statuses.filter((x) => x === 'completed').length;
  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const switchMode = (m: Mode) => {
    setMode(m);
    setExpanded(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      {/* Top bar */}
      <View style={{ paddingTop: topInset, backgroundColor: p.page, borderBottomWidth: BW, borderBottomColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.7)', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: dark ? 0.28 : 0.14, shadowRadius: 3, zIndex: 10 }}>
        <View style={s.topBar}>
          <Pressable onPress={onBack} style={[s.squareBtn, panelBtn(dark)]}>
            <Icon name="arrow_back" size={20} exact color={dark ? '#E2E8F0' : '#334155'} />
          </Pressable>
          <View style={s.topMid}>
            <Icon name={mc.icon} size={16} exact color={modeColor} />
            <View style={{ flexShrink: 1 }}>
              <Text numberOfLines={1} style={[s.topTitle, { color: title }]}>{WORLD_TITLES[worldOrder] ?? 'Practice'}</Text>
              <Text numberOfLines={1} style={[s.topSub, { color: muted }]}>
                <Text style={{ fontFamily: FONT.mono.b, color: accentText }}>WORLD_{String(worldOrder).padStart(2, '0')}</Text>
                {' / '}
                {mc.label}
              </Text>
            </View>
          </View>
          <Pressable onPress={onToggleTheme} style={[s.squareBtn, panelBtn(dark)]}>
            <Icon name={dark ? 'light_mode' : 'dark_mode'} size={18} exact color={dark ? '#FBBF24' : '#475569'} />
          </Pressable>
        </View>
      </View>

      {/* Write & Run / Debug switch: a recessed track with one raised chip */}
      {showTabs && <View style={s.tabsWrap}>
        <View
          style={[
            s.track,
            dark ? { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'rgba(203,213,225,0.45)', borderColor: 'rgba(148,163,184,0.5)' },
          ]}
        >
          <InsetShadow r={12} shadows={dark ? [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.6 }] : [{ dy: 1, blur: 2, rgb: '15,23,42', alpha: 0.12 }]} />
          {(['writeRun', 'debug'] as const).map((m) => {
            const selected = m === mode;
            return (
              <View key={m} style={{ flex: 1 }}>
                {selected && <ShadowStack r={8} shadows={[{ dy: 2, blur: 8, rgb: '99,102,241', alpha: 0.45 }]} />}
                <Pressable onPress={() => switchMode(m)} style={[s.tab, selected && { backgroundColor: '#6366F1' }]}>
                  <Icon name={MODE_COLORS[m].icon} size={19} exact color={selected ? '#FFFFFF' : muted} />
                  <Text style={[s.tabText, { color: selected ? '#FFFFFF' : muted }]}>{MODE_COLORS[m].label}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>}

      <FlatList
        data={tasks}
        keyExtractor={(_, index) => `${mode}-${index}`}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
        {/* Practice progress */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
          <View>
            <ShadowStack r={12} shadows={panelShadow} />
            <View style={[s.progressCard, panel, { borderLeftColor: darkAccent }]}>
              <View style={s.progressRow}>
                <Text style={[s.mono11, { color: muted }]}>
                  {'completed = '}
                  <Text style={{ fontFamily: FONT.mono.b, color: title }}>
                    {completedCount} / {tasks.length}
                  </Text>
                </Text>
                <Text style={[s.mono11, { fontFamily: FONT.mono.b, color: accentText }]}>{pct}%</Text>
              </View>
              <View style={[s.bar, { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.7)' }]}>
                <View style={{ height: 4, width: `${pct}%`, borderRadius: 2, backgroundColor: darkAccent }} />
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 8 }} />
          </>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <View style={[s.empty, panel]}>
              <Text style={[s.mono12, { color: muted }]}>{'// no problems available for this World yet'}</Text>
            </View>
          </View>
        }
        renderItem={({ item: task, index: idx }) => {
                const status = statuses[idx];
                const completed = status === 'completed';
                const inProgress = status === 'in_progress';
                const isOpen = expanded === idx;
                const stripe = completed ? '#98C379' : inProgress ? mc.dark : dark ? '#475569' : '#94A3B8';
                const openBorder = hexAlpha(dark ? mc.dark : mc.light, 0.25);
                const actionLabel = inProgress ? 'continue()' : 'start()';
                const actionStyle = inProgress
                  ? { color: '#FFFFFF', borderColor: modeColor, backgroundColor: modeColor }
                  : { color: '#FFFFFF', borderColor: dark ? mc.dark : mc.light, backgroundColor: dark ? mc.dark : mc.light };
                return (
                  <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
                    <View style={s.taskShadow}>
                      <Pressable
                        onPress={() => setExpanded(isOpen ? null : idx)}
                        android_ripple={{ color: dark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.45)', borderless: false, foreground: true }}
                        style={[
                          s.task,
                          panel,
                          isOpen && { borderTopColor: openBorder, borderRightColor: openBorder, borderBottomColor: openBorder },
                          { borderLeftColor: stripe },
                          { overflow: 'hidden' },
                        ]}
                      >
                      <View style={{ gap: 6 }}>
                        <View style={s.taskTop}>
                          <Text style={[s.taskNum, { color: modeColor }]}>{String(idx + 1).padStart(2, '0')}</Text>
                          <Text style={[s.taskTitle, { color: title }]}>{task.title}</Text>
                          {completed && <Icon name="check" size={15} exact color={dark ? '#98C379' : '#4A7A28'} />}
                          <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={18} exact color={muted} />
                        </View>
                        <Text style={[s.taskDesc, { color: dark ? '#C4CBDA' : '#3F4558' }]}>{breakAfterSentences(task.summary)}</Text>
                        {isOpen && <Details task={task} mode={mode} dark={dark} helpLevel={helpLevel} />}
                      </View>
                      <View style={s.taskFooter}>
                        <View style={s.footerLeft}>
                          <View style={[s.chip, difficultyStyle(task.difficulty, dark)]}>
                            <Text style={[s.chipText, { color: difficultyStyle(task.difficulty, dark).color }]}>
                              {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                            </Text>
                          </View>
                          {completed && <Text style={[s.statusText, { color: muted, fontFamily: FONT.outfit.md }]}>Completed</Text>}
                          {inProgress && <Text style={[s.statusText, { color: modeColor, fontFamily: FONT.outfit.sb }]}>In progress</Text>}
                        </View>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation();
                            if (!WebStage) return;
                            WebStage.open(practiceLessonKey(worldOrder, mode, task.title), mode, dark, true, false, null).catch(() => {});
                          }}
                          style={[s.action, actionStyle]}
                          accessibilityRole="button"
                          accessibilityLabel={actionLabel}
                        >
                          <Text style={[s.actionText, { color: actionStyle.color }]}>{actionLabel}</Text>
                          <Icon name="chevron_right" size={18} exact color={actionStyle.color} />
                        </Pressable>
                      </View>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
      />
    </View>
  );
}

const panelBtn = (dark: boolean) =>
  dark ? { backgroundColor: '#0F1420', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#F6F7FA', borderColor: 'rgba(203,213,225,0.7)' };

const s = StyleSheet.create({
  taskShadow: { borderRadius: 12, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 3 },
  topBar: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  squareBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  topMid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  topTitle: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.25), letterSpacing: -0.025 * 14 * MAIN, includeFontPadding: false },
  topSub: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: 10 * MAIN, marginTop: 4, includeFontPadding: false },
  tabsWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  track: { flexDirection: 'row', borderRadius: 12, borderWidth: BW, padding: 4, gap: 4, overflow: 'hidden' },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  tabText: { fontFamily: FONT.outfit.sb, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  progressCard: { padding: 14, borderRadius: 12, borderWidth: BW, borderLeftWidth: 2.91 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bar: { height: 4, borderRadius: 2, overflow: 'hidden', width: '100%' },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  mono12: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), includeFontPadding: false },
  empty: { padding: 16, borderRadius: 12, borderWidth: BW, alignItems: 'center' },
  // task card
  task: { padding: 14, borderRadius: 12, borderWidth: BW, borderLeftWidth: 2.91, gap: 8, overflow: 'hidden' },
  taskTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskNum: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  taskTitle: { flex: 1, fontFamily: FONT.outfit.sb, fontSize: fz(15 * MAIN), lineHeight: lh(15, 1.375), letterSpacing: -0.025 * 15 * MAIN, includeFontPadding: false },
  taskDesc: { fontFamily: FONT.body, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.625), paddingTop: 2, paddingBottom: 4, includeFontPadding: false },
  taskFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  chip: { borderWidth: BW, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontFamily: FONT.outfit.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  statusText: { fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  action: { minWidth: 124, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 9, borderWidth: BW },
  actionText: { fontFamily: FONT.mono.b, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  // expanded details
  details: { marginTop: 4, paddingTop: 12, borderTopWidth: BW, borderStyle: 'dashed', gap: 12 },
  sectionLabel: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, color: '#64748B', includeFontPadding: false },
  detailText: { fontFamily: FONT.body, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.625), marginTop: 4, includeFontPadding: false },
  givenBox: { marginTop: 4, borderRadius: 8, borderWidth: BW, borderColor: '#1E293B', backgroundColor: '#0A0E17', paddingHorizontal: 12, paddingVertical: 8 },
  givenCode: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  outputBox: { borderRadius: 8, borderWidth: BW, borderColor: '#1E293B', backgroundColor: '#0A0E17', overflow: 'hidden' },
  outputBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: BW, borderBottomColor: '#1E293B' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  outputName: { marginLeft: 8, fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, color: '#64748B', includeFontPadding: false },
  outputText: { padding: 12, fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.375), color: '#34D399', includeFontPadding: false },
});
