import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, MAIN, fz } from './shell';
import { EditorPanel, WorldsDivider, accentFor, hexAlpha, lh } from './parts';
import { HELP_OPTIONS, HelpLevel } from './HelpSheet';
import { ShadowStack } from './shadows';
import { FONT, Palette } from './theme';
import { CURRICULUM_WORLDS } from './curriculumData';
import { PRACTICE_TASKS } from './practiceTasks';

// The Practice tab, rebuilt in React Native to look like the web one (src/components/PracticeTab.tsx). Sizes are the web's CSS pixels,
// read from the running app. UI only, with sample data: the progress numbers are made up so that every card state shows (finished,
// in progress, new, and a World with no challenges yet).

interface PracticeWorld {
  order: number;
  title: string;
  writeRun: number;
  debug: number;
  /** Challenges completed (sample). */
  completed: number;
}

const WORLDS: PracticeWorld[] = CURRICULUM_WORLDS.map((world) => {
  const tasks = PRACTICE_TASKS[world.order] ?? { writeRun: [], debug: [] };
  return {
    order: world.order,
    title: world.title,
    writeRun: tasks.writeRun.length,
    debug: tasks.debug.length,
    // Completion is updated by TaskListScreen in a later persistence pass;
    // never show fabricated completed counts here.
    completed: 0,
  };
});
const tokens = (dark: boolean) => ({
  title: dark ? '#F1F5F9' : '#2E3040',
  muted: dark ? '#94A3B8' : '#64748B',
  chevron: dark ? '#64748B' : '#94A3B8',
  codeIcon: dark ? '#569CD6' : '#1F6FB5',
  bugIcon: dark ? '#CE9178' : '#A8502F',
  panel: dark
    ? { backgroundColor: '#0F1420', borderColor: 'rgba(255,255,255,0.10)' }
    : { backgroundColor: '#F6F7FA', borderColor: 'rgba(203,213,225,0.7)' },
  panelShadow: dark
    ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: 0.3 }]
    : [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.1 }],
});

function WorldCard({ world, dark, onOpen }: { world: PracticeWorld; dark: boolean; onOpen: (order: number) => void }) {
  const t = tokens(dark);
  const [darkAccent, lightAccent] = accentFor(world.order);
  const accentText = dark ? darkAccent : lightAccent;
  const total = world.writeRun + world.debug;
  const fullyLearned = total > 0 && world.completed >= total;
  const inProgress = world.completed > 0 && !fullyLearned;
  const pct = total > 0 ? Math.round((world.completed / total) * 100) : 0;
  const hasAny = total > 0;
  const footerColor = fullyLearned || inProgress ? accentText : t.muted;
  return (
    <View style={{ opacity: hasAny ? 1 : 0.6 }}>
      <ShadowStack r={12} shadows={t.panelShadow} />
      <Pressable onPress={() => { if (hasAny) onOpen(world.order); }} android_ripple={{ color: dark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.45)', borderless: false, foreground: true }} style={[s.card, t.panel, { borderLeftColor: darkAccent, overflow: 'hidden' }]}>
        {/* WORLD_NN label (+ "current" while in progress), check or chevron on the right */}
        <View style={s.cardTop}>
          <View style={s.cardTopLeft}>
            <Text style={[s.worldLabel, { color: accentText }]}>WORLD_{String(world.order).padStart(2, '0')}</Text>
            {inProgress && (
              <View style={s.current}>
                <View style={[s.currentDot, { backgroundColor: darkAccent }]} />
                <Text style={[s.mono10, { color: t.muted }]}>current</Text>
              </View>
            )}
          </View>
          {fullyLearned ? (
            <Icon name="check" size={20} exact color={accentText} />
          ) : (
            <Icon name="chevron_right" size={22} exact color={t.chevron} />
          )}
        </View>

        {/* Title, with the challenge count beside it */}
        <View style={s.titleRow}>
          <Text style={[s.cardTitle, { color: t.title }]}>{world.title}</Text>
          <Text style={[s.mono11, { color: t.muted }]}>
            {total} {total === 1 ? 'challenge' : 'challenges'}
          </Text>
        </View>

        {/* Write & Run count, Debug count */}
        <View style={s.countsRow}>
          <View style={s.countGroup}>
            <Icon name="code" size={18} exact color={t.codeIcon} />
            <Text style={[s.mono12, { color: t.title, fontFamily: FONT.mono.b }]}>{world.writeRun}</Text>
            <Text style={[s.mono12, { color: t.muted }]}>write_run</Text>
          </View>
          <Text style={[s.mono12, { color: t.muted, opacity: 0.5 }]}>·</Text>
          <View style={s.countGroup}>
            <Icon name="bug_report" size={18} exact color={t.bugIcon} />
            <Text style={[s.mono12, { color: t.title, fontFamily: FONT.mono.b }]}>{world.debug}</Text>
            <Text style={[s.mono12, { color: t.muted }]}>debug</Text>
          </View>
        </View>

        {/* Progress footer */}
        <View style={{ marginTop: 14 }}>
          <View style={[s.track, { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.7)' }]}>
            <View style={{ height: 4, width: `${pct}%`, borderRadius: 2, backgroundColor: darkAccent }} />
          </View>
          <View style={s.footerRow}>
            <Text style={[s.mono11, { color: footerColor }]}>{fullyLearned ? `all ${total} completed` : `${world.completed} / ${total} completed`}</Text>
            <Text style={[s.mono11, { color: footerColor, fontFamily: FONT.mono.b }]}>{pct}%</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export const PracticeContent = React.memo(function PracticeContent({ p, helpLevel, onOpenHelp, onOpenWorld }: { p: Palette; helpLevel: HelpLevel; onOpenHelp: () => void; onOpenWorld: (order: number) => void }) {
  const dark = p.isDark;
  const t = tokens(dark);
  const helpLabel = HELP_OPTIONS.find((o) => o.level === helpLevel)?.label ?? 'Beginner';
  const slate400 = '#94A3B8';

  return (
    <FlatList
      data={WORLDS}
      keyExtractor={(world) => String(world.order)}
      renderItem={({ item: world }) => <WorldCard world={world} dark={dark} onOpen={onOpenWorld} />}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListHeaderComponent={
        <>
      {/* Heading, with the "Practice help" level picker */}
      <View style={{ paddingTop: 4, gap: 12, marginBottom: 16 }}>
        <View style={s.headingRow}>
          <Text style={[s.h1, { color: t.title }]}>Ready to practice?</Text>
          <View>
            <ShadowStack r={8} shadows={t.panelShadow} />
            <Pressable onPress={onOpenHelp} style={[s.helpBtn, t.panel]}>
              <Icon name="tune" size={15} exact color={dark ? '#CE9178' : '#A8502F'} />
              <Text style={[s.helpText, { color: dark ? '#CE9178' : '#A8502F' }]}>{helpLabel}</Text>
              <View style={{ opacity: 0.7 }}>
                <Icon name="expand_more" size={15} exact color={dark ? '#CE9178' : '#A8502F'} />
              </View>
            </Pressable>
          </View>
        </View>
        <Text style={[s.sub, { color: t.muted, lineHeight: lh(12, 1.625) }]}>Sharpen your Kotlin skills with quick coding challenges.</Text>
      </View>

      {/* Surprise challenge */}
      <View style={{ marginBottom: 16 }}>
        <EditorPanel
          fileName="surprise_challenge.kt"
          playSize={22}
          comment={"// a random concept you've learned"}
          code={
            <>
              <Text style={{ color: '#C586C0' }}>fun </Text>
              <Text style={{ color: '#DCDCAA' }}>surpriseMe</Text>
              <Text style={{ color: slate400 }}>()</Text>
              <Text style={{ color: slate400 }}>: </Text>
              <Text style={{ color: '#4EC9B0' }}>Task</Text>
            </>
          }
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <WorldsDivider p={p} />
      </View>

      {/* Practice by World */}
      <View style={{ gap: 12 }}>
        <View style={{ paddingHorizontal: 2, gap: 2 }}>
          <Text style={[s.h2, { color: t.title }]}>Practice by World</Text>
          <Text style={[s.subMedium, { color: t.muted }]}>Choose a World and sharpen your Kotlin skills</Text>
        </View>
      </View>
      <View style={{ height: 12 }} />
        </>
      }
      contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  );
});

const s = StyleSheet.create({
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  h1: { fontFamily: FONT.outfit.sb, fontSize: fz(20 * MAIN), lineHeight: lh(20, 1.4), letterSpacing: -0.025 * 20 * MAIN, includeFontPadding: false },
  sub: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), includeFontPadding: false },
  subMedium: { fontFamily: FONT.outfit.md, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  h2: { fontFamily: FONT.outfit.sb, fontSize: fz(18 * MAIN), lineHeight: lh(18, 1.5556), letterSpacing: -0.025 * 18 * MAIN, includeFontPadding: false },
  helpBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: BW },
  helpText: { fontFamily: FONT.mono.sb, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  mono10: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  mono12: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.625), includeFontPadding: false },
  mono13: { fontFamily: FONT.mono.b, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.5), includeFontPadding: false },
  // recommended
  recommended: { borderRadius: 12, padding: 16, borderWidth: BW, borderLeftWidth: 2.91, gap: 10 },
  recTitle: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), letterSpacing: -0.025 * 14 * MAIN, includeFontPadding: false },
  recSub: { fontFamily: FONT.outfit.md, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  recGrid: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  recBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: BW, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  // world card
  card: { borderRadius: 12, padding: 16, borderWidth: BW, borderLeftWidth: 2.91, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  worldLabel: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, includeFontPadding: false },
  current: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currentDot: { width: 6, height: 6, borderRadius: 3 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 8 },
  cardTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(16 * MAIN), lineHeight: lh(16, 1.375), letterSpacing: -0.025 * 16 * MAIN, includeFontPadding: false },
  countsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, marginTop: 12 },
  countGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', width: '100%' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
