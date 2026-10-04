import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { FONT, Palette } from './theme';
import { QuizProgress, getQuizWorlds, worldStats } from './quizData';
import { CURRICULUM_WORLDS } from './curriculumData';
import { PRACTICE_TASKS } from './practiceTasks';

const AVATAR_COLOR = '#6366F1';
const PROFILE_NAME = 'Alex Vance';

/** Totals of what the app ships, counted once from the bundled data. */
const CONTENT = (() => {
  const practice = Object.values(PRACTICE_TASKS);
  const writeRun = practice.reduce((sum, w) => sum + w.writeRun.length, 0);
  const debug = practice.reduce((sum, w) => sum + w.debug.length, 0);
  return {
    worlds: CURRICULUM_WORLDS.length,
    lessons: CURRICULUM_WORLDS.reduce((sum, w) => sum + w.lessonCount, 0),
    writeRun, debug,
    practiceWorlds: practice.length,
    quizQuestions: getQuizWorlds().reduce((sum, w) => sum + w.questions.length, 0),
  };
})();

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

export const ProfileScreen = React.memo(function ProfileScreen({ p, quizProgress, onToggleTheme }: {
  p: Palette; quizProgress: QuizProgress; onToggleTheme: () => void;
}) {
  const dark = p.isDark;
  const title = dark ? '#F1F5F9' : '#2E3040';
  const muted = dark ? '#94A3B8' : '#64748B';
  const panel = dark ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' };
  const row = dark ? { backgroundColor: '#0F1422', borderColor: 'rgba(255,255,255,0.06)' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };

  const stats = React.useMemo(() => {
    const entries = Object.values(quizProgress);
    const correct = entries.reduce((sum, e) => sum + e.correct, 0);
    const wrong = entries.reduce((sum, e) => sum + e.wrong, 0);
    const worlds = getQuizWorlds().map((world) => ({ world, ...worldStats(world, quizProgress) }));
    return {
      answered: entries.length,
      accuracy: correct + wrong === 0 ? null : Math.round((correct / (correct + wrong)) * 100),
      mistakes: worlds.reduce((sum, w) => sum + w.missed, 0),
      worlds,
    };
  }, [quizProgress]);

  return <ScrollView style={{ flex: 1, backgroundColor: p.page }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    {/* Account */}
    <View style={[s.profile, panel]}>
      <View style={[s.avatar, { backgroundColor: AVATAR_COLOR }]}><Text style={s.avatarText}>{initialsOf(PROFILE_NAME)}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={[s.name, { color: title }]} numberOfLines={1}>{PROFILE_NAME}</Text>
        <Text style={[s.sub, { color: muted }]}>Junior Kotlin Developer</Text>
      </View>
    </View>
    {/* Content totals */}
    <Section title="Stats" titleColor={muted}>
      <View style={s.contentGrid}>
        <ContentStat value={CONTENT.worlds} label="Worlds" row={row} title={title} muted={muted} />
        <ContentStat value={CONTENT.lessons} label="Lessons" row={row} title={title} muted={muted} />
        <ContentStat value={CONTENT.writeRun + CONTENT.debug} label="Write & Run and Debug problems" note={`${CONTENT.writeRun} Write & Run · ${CONTENT.debug} Debug · Worlds 1-${CONTENT.practiceWorlds}`} row={row} title={title} muted={muted} />
        <ContentStat value={CONTENT.quizQuestions} label="Quiz questions" row={row} title={title} muted={muted} />
      </View>
    </Section>

    {/* Quiz progress (only what the app really records) */}
    <Section title="Quiz progress" titleColor={muted}>
      <View style={s.statGrid}>
        <Stat label="Questions answered" value={String(stats.answered)} row={row} title={title} muted={muted} />
        <Stat label="Accuracy" value={stats.accuracy === null ? '-' : `${stats.accuracy}%`} row={row} title={title} muted={muted} />
        <Stat label="To review" value={String(stats.mistakes)} row={row} title={title} muted={muted} />
      </View>
      {stats.worlds.map(({ world, total, seen, correct }) => <View key={world.order} style={[s.worldRow, row]}>
        <View style={s.worldHead}><Text style={[s.rowTitle, { color: title, flex: 1 }]} numberOfLines={1}>World {world.order}: {world.title}</Text><Text style={[s.sub, { color: muted }]}>{seen} / {total} seen</Text></View>
        <View style={[s.track, { backgroundColor: p.barTrack }]}><View style={[s.fill, { width: `${total ? (seen / total) * 100 : 0}%` }]} /></View>
        <Text style={[s.sub, { color: muted }]}>{correct} answered correctly at least once</Text>
      </View>)}
    </Section>

    {/* Theme */}
    <Section title="Appearance" titleColor={muted}>
      <View style={[s.row, row]}>
        <Icon name={dark ? 'dark_mode' : 'light_mode'} size={20} exact color="#818CF8" />
        <View style={{ flex: 1 }}><Text style={[s.rowTitle, { color: title }]}>Theme</Text><Text style={[s.sub, { color: muted }]}>{dark ? 'Obsidian Night Mode' : 'Silk Neumorphic Light'}</Text></View>
        <View style={s.sizeGroup}>{(['Dark', 'Light'] as const).map((mode) => { const on = (mode === 'Dark') === dark; return <Pressable key={mode} onPress={() => { if (!on) onToggleTheme(); }} style={[s.mode, on && { backgroundColor: '#6366F1' }]}><Text style={{ color: on ? '#FFF' : muted, fontFamily: FONT.outfit.b, fontSize: fz(11) }}>{mode}</Text></Pressable>; })}</View>
      </View>
    </Section>
  </ScrollView>;
});

function ContentStat({ value, label, note, row, title, muted }: { value: number; label: string; note?: string; row: object; title: string; muted: string }) {
  return <View style={[s.contentStat, row]}><Text style={[s.statValue, { color: title }]}>{value}</Text><Text style={[s.rowTitle, { color: title, marginBottom: 0 }]}>{label}</Text>{note ? <Text style={[s.sub, { color: muted }]}>{note}</Text> : null}</View>;
}
function Stat({ label, value, row, title, muted }: { label: string; value: string; row: object; title: string; muted: string }) {
  return <View style={[s.stat, row]}><Text style={[s.statValue, { color: title }]}>{value}</Text><Text style={[s.sub, { color: muted }]}>{label}</Text></View>;
}
function Section({ title, titleColor, children }: { title: string; titleColor: string; children: React.ReactNode }) { return <View style={s.section}><Text style={[s.sectionTitle, { color: titleColor }]}>{title.toUpperCase()}</Text>{children}</View>; }

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  profile: { borderWidth: BW, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: FONT.outfit.b, fontSize: fz(22) },
  name: { fontFamily: FONT.outfit.b, fontSize: fz(18), marginBottom: 2 },
  sub: { fontFamily: FONT.body, fontSize: fz(11), lineHeight: fz(16) },
  section: { borderRadius: 16, padding: 14, gap: 10 },
  sectionTitle: { fontFamily: FONT.outfit.b, fontSize: fz(11), letterSpacing: 1 },
  row: { minHeight: 58, borderWidth: BW, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12), marginBottom: 2 },
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contentStat: { width: '48.5%', flexGrow: 1, borderWidth: BW, borderRadius: 12, padding: 12, gap: 2 },
  statGrid: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: BW, borderRadius: 12, padding: 12, gap: 2 },
  statValue: { fontFamily: FONT.outfit.b, fontSize: fz(22) },
  worldRow: { borderWidth: BW, borderRadius: 12, padding: 12, gap: 8 },
  worldHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  sizeGroup: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: 8, borderWidth: BW, borderColor: '#CBD5E1' },
  mode: { paddingHorizontal: 10, height: 26, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
});
