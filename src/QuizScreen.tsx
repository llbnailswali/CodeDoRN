import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, MAIN, fz, raisedShadows } from './shell';
import { EditorPanel, WorldsDivider, accentFor, hexAlpha, lh } from './parts';
import { ShadowStack } from './shadows';
import { FONT, INDIGO_400, Palette } from './theme';
import { QuizProgress, getQuizWorlds, worldStats } from './quizData';
import { CURRICULUM_WORLDS } from './curriculumData';

// The Quiz tab, rebuilt in React Native to look like the web one (src/components/QuizView.tsx). Sizes are the web's CSS pixels, read from
// the running app. UI only, with sample data: there is no quiz logic behind it, and the progress numbers below are made up so that every
// card state (new, in progress with missed questions, finished) shows up.

const QUIZ_SESSION_SIZE = 10;

const WORLD_GLYPHS: Record<number, string> = {
  1: '\u003C/\u003E', 2: '+=%', 3: '<>', 4: '↻', 5: 'f(x)', 6: '[ ]', 7: '?.', 8: '{ }', 9: 'λ',
  10: '.map', 11: 'OOP', 12: '<T>', 13: 'let', 14: 'seq', 15: 'try', 16: 'co', 17: '~>',
};

// ---------------------------------------------------------------------------------------------------------------------

function QuickQuizPanel() {
  const slate400 = '#94A3B8';
  return (
    <EditorPanel
      fileName="quick_quiz.kt"
      playSize={18}
      comment={"// a mix of concepts you've learned"}
      code={
        <>
          <Text style={{ color: '#C586C0' }}>fun </Text>
          <Text style={{ color: '#DCDCAA' }}>quickQuiz</Text>
          <Text style={{ color: slate400 }}>(</Text>
          <Text style={{ color: '#9CDCFE' }}>count</Text>
          <Text style={{ color: slate400 }}>: </Text>
          <Text style={{ color: '#4EC9B0' }}>Int</Text>
          <Text style={{ color: slate400 }}> = </Text>
          <Text style={{ color: '#B5CEA8' }}>{QUIZ_SESSION_SIZE}</Text>
          <Text style={{ color: slate400 }}>)</Text>
        </>
      }
    />
  );
}

function WorldCard({ world, dark, onOpen, onReview }: { world: { order: number; title: string; total: number; correct: number; missed: number }; dark: boolean; onOpen: (world: { order: number; title: string }) => void; onReview: (world: { order: number; title: string }) => void }) {
  const [darkAccent, lightAccent] = accentFor(world.order);
  const accentText = dark ? darkAccent : lightAccent;
  const muted = dark ? '#94A3B8' : '#585A68';
  const title = dark ? '#E2E8F0' : '#2E3040';
  const percent = Math.round((world.correct / world.total) * 100);
  const started = world.correct > 0;
  const done = world.correct >= world.total;
  const available = world.total > 0;
  return (
    <View style={{ flex: 1 }}>
      <ShadowStack r={12} shadows={dark ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: 0.3 }] : [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.1 }]} />
      <Pressable
        accessibilityState={{ disabled: !available }}
        onPress={() => { if (available) onOpen({ order: world.order, title: world.title }); }}
        android_ripple={{ color: dark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.45)', borderless: false, foreground: true }}
        style={[
          s.card,
          dark
            ? { backgroundColor: '#0F1420', borderColor: hexAlpha(darkAccent, 0.4) }
            : { backgroundColor: '#F6F7FA', borderColor: 'rgba(203,213,225,0.7)' },
          { borderLeftColor: darkAccent },
          { overflow: 'hidden' },
        ]}
      >
        <View>
          <View style={s.cardTop}>
            <Text style={[s.worldLabel, { color: accentText }]}>WORLD_{String(world.order).padStart(2, '0')}</Text>
            {done && <Icon name="check" size={15} exact color={accentText} />}
          </View>
          <Text numberOfLines={1} style={[s.cardTitle, { color: title }]}>{world.title}</Text>
          <View style={s.metaRow}>
            <View
              style={[
                s.glyph,
                dark ? { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.05)' } : { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
              ]}
            >
              <Text style={[s.glyphText, { color: accentText }]}>{WORLD_GLYPHS[world.order] ?? '{ }'}</Text>
            </View>
            <Text style={[s.mono11, { color: muted }]}>{world.total} questions</Text>
          </View>
        </View>
        <View style={s.cardBottom}>
          <View style={s.progressRow}>
            <Text style={[s.mono10, { color: muted }]}>progress</Text>
            <Text style={[s.mono10, started && { fontFamily: FONT.mono.b, color: accentText }, !started && { color: muted }]}>{percent}%</Text>
          </View>
          <View style={[s.track, { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.7)' }]}>
            <View style={{ height: 4, width: `${percent}%`, borderRadius: 2, backgroundColor: darkAccent }} />
          </View>
          <View style={s.startRow}>
          {done && world.missed === 0 ? null : <Text style={[s.startText, { color: available ? accentText : muted }]}>{!available ? 'coming_soon()' : done ? `review(${world.missed})` : started ? 'continue()' : 'start()'}</Text>}
          {available && (!done || world.missed > 0) && <Icon name={done ? 'replay' : 'arrow_forward'} size={13} exact color={accentText} />}
          </View>
        </View>
      </Pressable>
      {world.missed > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Review ${world.missed} missed questions in ${world.title}`}
          onPress={() => onReview({ order: world.order, title: world.title })}
          style={[
            s.missed,
            dark ? { borderColor: 'rgba(251,113,133,0.5)', backgroundColor: 'rgba(251,113,133,0.1)' } : { borderColor: '#FDA4AF', backgroundColor: '#FFF1F2' },
          ]}
        >
          <Icon name="replay" size={13} exact color={dark ? '#FECDD3' : '#BE123C'} />
          <Text style={[s.missedText, { color: dark ? '#FECDD3' : '#BE123C' }]}>{world.missed}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** The Quiz tab's content (the shared top bar and tab bar live in App.tsx). */
export const QuizContent = React.memo(function QuizContent({ p, progress, onOpenQuiz }: { p: Palette; progress: QuizProgress; onOpenQuiz: (world?: { order: number; title: string }, review?: boolean) => void }) {
  const isDark = p.isDark;
  const title = isDark ? '#E2E8F0' : '#2E3040';
  const muted = isDark ? '#94A3B8' : '#585A68';
  const accent = isDark ? INDIGO_400 : '#6366F1';
  const surface = isDark ? '#151B28' : '#E8EAF0';

  const quizWorlds = getQuizWorlds();
  const worlds = CURRICULUM_WORLDS.map((catalogWorld) => {
    const world = quizWorlds.find((candidate) => candidate.order === catalogWorld.order);
    const stats = world ? worldStats(world, progress) : { total: 0, correct: 0, missed: 0 };
    return { order: catalogWorld.order, title: catalogWorld.title, total: stats.total, correct: stats.correct, missed: stats.missed };
  });
  const rows: typeof worlds[] = [];
  for (let i = 0; i < worlds.length; i += 2) rows.push(worlds.slice(i, i + 2));

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <FlatList
        data={rows}
        keyExtractor={(_, index) => `world-row-${index}`}
        renderItem={({ item: row }) => (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {row.map((w) => (
              <WorldCard key={w.order} world={w} dark={isDark} onOpen={onOpenQuiz} onReview={(world) => onOpenQuiz(world, true)} />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={s.intro}>
              <View style={{ flexShrink: 1 }}>
                <Text style={[s.h1, { color: title }]}>Test your knowledge</Text>
                <Text style={[s.sub, { color: muted }]}>Practice Kotlin concepts with quick quizzes.</Text>
              </View>
              <View>
                <ShadowStack r={16} shadows={raisedShadows(isDark)} />
                <View style={[s.brainBox, { backgroundColor: surface }, isDark && { borderWidth: BW, borderColor: 'rgba(255,255,255,0.06)' }]}>
                  <Icon name="psychology" size={20} exact filled color={accent} />
                </View>
              </View>
            </View>
            <View style={{ height: 20 }} />
            <Pressable onPress={() => onOpenQuiz()}>
              <QuickQuizPanel />
            </Pressable>
            <View style={{ height: 20 }} />
            <WorldsDivider p={p} />
            <View style={{ height: 20 }} />
            <View style={{ paddingHorizontal: 4 }}>
              <Text style={[s.h2, { color: title }]}>Quiz by World</Text>
              <Text style={[s.sub, { color: muted }]}>{"Choose a World and test what you've learned"}</Text>
            </View>
            <View style={{ height: 12 }} />
          </>
        }
        contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const s = StyleSheet.create({
  intro: { paddingHorizontal: 4, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontFamily: FONT.outfit.b, fontSize: fz(22 * MAIN), lineHeight: lh(22, 1.5), letterSpacing: -0.025 * 22 * MAIN, includeFontPadding: false },
  sub: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), marginTop: 2, includeFontPadding: false },
  h2: { fontFamily: FONT.outfit.sb, fontSize: fz(16 * MAIN), lineHeight: lh(16, 1.5), letterSpacing: -0.025 * 16 * MAIN, includeFontPadding: false },
  brainBox: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  // quick quiz panel
  quick: { borderRadius: 16, borderWidth: BW, borderColor: 'rgba(51,65,85,0.6)', backgroundColor: '#0D1322', overflow: 'hidden' },
  quickBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#090D17', borderBottomWidth: BW, borderBottomColor: 'rgba(30,41,59,0.7)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  randomize: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  mono10: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  quickBody: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  codeLine: { fontFamily: FONT.mono.sb, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.375), includeFontPadding: false },
  codeComment: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), marginTop: 4, color: '#7D8CA4', includeFontPadding: false },
  playBox: {
    width: 36, height: 36, borderRadius: 8, borderWidth: BW, borderColor: 'rgba(78,201,176,0.5)', backgroundColor: 'rgba(78,201,176,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  // divider
  divider: { paddingTop: 20 + 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { height: 1, flex: 1 },
  dividerLabel: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, includeFontPadding: false },
  // world card
  card: { flex: 1, borderRadius: 12, padding: 14, borderWidth: BW, borderLeftWidth: 2.91, justifyContent: 'space-between', overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  worldLabel: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, includeFontPadding: false },
  cardTitle: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.375), marginBottom: 6, includeFontPadding: false },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  glyph: { borderWidth: BW, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  glyphText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  cardBottom: { marginTop: 12, paddingTop: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', width: '100%' },
  startRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 10, paddingTop: 6 },
  startText: { fontFamily: FONT.mono.sb, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  missed: {
    position: 'absolute', right: 10, bottom: 10, height: 28, paddingHorizontal: 8, borderRadius: 8, borderWidth: BW,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  missedText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
});
