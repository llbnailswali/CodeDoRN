import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';
import { QuizQuestion } from './quizQuestions';
import { QuizProgress, worldStats } from './quizData';

type LessonGroup = { lessonId: string; topic: string; questions: QuizQuestion[] };

// The quiz hub of one World: its progress, one tap to take the whole bank (sticky button), review of missed questions and, below, a
// lesson-by-lesson list for focused practice.
export function QuizLessonWiseScreen({ p, world, questions, progress, topInset, onBack, onStart, onStartAll, onReview }: {
  p: Palette;
  world: { order: number; title: string };
  questions: QuizQuestion[];
  progress: QuizProgress;
  topInset: number;
  onBack: () => void;
  /** Practice one lesson's questions. */
  onStart: (questions: QuizQuestion[]) => void;
  /** The whole World's bank in one go. */
  onStartAll: () => void;
  /** Only the questions missed and not yet answered correctly. */
  onReview: () => void;
}) {
  const dark = p.isDark;
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  const groups = React.useMemo<LessonGroup[]>(() => {
    const map = new Map<string, LessonGroup>();
    questions.forEach((question) => {
      const current = map.get(question.lessonId) ?? { lessonId: question.lessonId, topic: question.topic, questions: [] };
      current.questions.push(question);
      map.set(question.lessonId, current);
    });
    return [...map.values()];
  }, [questions]);

  const stats = React.useMemo(() => worldStats({ order: world.order, title: world.title, questions }, progress), [world.order, world.title, questions, progress]);
  const percent = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  const allCorrect = stats.total > 0 && stats.correct === stats.total;
  const tiles = [
    { label: 'Seen', value: stats.seen, color: dark ? '#A5B4FC' : '#4F46E5' },
    { label: 'Correct', value: stats.correct, color: '#10B981' },
    { label: 'To review', value: stats.missed, color: '#F43F5E' },
    { label: 'Not tried', value: Math.max(0, stats.total - stats.seen), color: muted },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <View style={[s.toolbar, { paddingTop: topInset, backgroundColor: p.page, borderBottomColor: p.headerBorder }]}>
        <View style={s.toolbarInner}>
          <Pressable onPress={onBack} style={[s.back, { backgroundColor: p.card, borderColor: p.cardBorder }]}><Icon name="arrow_back" size={21} color={title} /></Pressable>
          <View style={{ flex: 1 }}><Text style={[s.kicker, { color: dark ? '#A5B4FC' : '#4F46E5' }]}>WORLD_{String(world.order).padStart(2, '0')}</Text><Text style={[s.heading, { color: title }]}>Quiz by lesson</Text></View>
          <Text style={[s.total, { color: title }]}>{questions.length}<Text style={{ color: muted }}> total</Text></Text>
        </View>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.lessonId}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <View style={[s.stats, { backgroundColor: dark ? '#17163A' : '#EEF2FF', borderColor: dark ? 'rgba(129,140,248,0.35)' : '#C7D2FE' }]}>
              <Text style={[s.statsKicker, { color: dark ? '#A5B4FC' : '#4F46E5' }]}>YOUR PROGRESS</Text>
              <View style={s.statsMain}>
                <Text style={[s.statsPercent, { color: title }]}>{percent}%</Text>
                <Text style={[s.statsCaption, { color: muted }]}>{stats.correct} of {stats.total} questions answered correctly</Text>
              </View>
              <View style={[s.track, { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(79,70,229,0.15)' }]}>
                <View style={[s.fill, { width: `${percent}%` }]} />
              </View>
              <View style={s.tiles}>
                {tiles.map((tile) => (
                  <View key={tile.label} style={[s.tile, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)' }]}>
                    <Text style={[s.tileValue, { color: tile.color }]}>{tile.value}</Text>
                    <Text style={[s.tileLabel, { color: muted }]}>{tile.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            {stats.missed > 0 && (
              <Pressable
                onPress={onReview}
                style={[s.review, dark ? { backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.35)' } : { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}
              >
                <Icon name="replay" size={18} exact color={dark ? '#FECDD3' : '#BE123C'} />
                <Text style={[s.reviewText, { color: dark ? '#FECDD3' : '#BE123C' }]}>Review mistakes · {stats.missed}</Text>
                <Icon name="arrow_forward" size={18} exact color={dark ? '#FECDD3' : '#BE123C'} />
              </Pressable>
            )}
            <Text style={[s.section, { color: muted }]}>PRACTICE BY LESSON</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable onPress={() => onStart(item.questions)} style={[s.card, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' }]}>
            <View style={[s.number, { backgroundColor: dark ? 'rgba(99,102,241,0.18)' : '#EEF2FF' }]}><Text style={{ color: dark ? '#C7D2FE' : '#4338CA', fontFamily: FONT.mono.b }}>{String(index + 1).padStart(2, '0')}</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.topic, { color: title }]}>{item.topic}</Text><Text style={[s.meta, { color: muted }]}>{item.questions.length} question{item.questions.length === 1 ? '' : 's'}</Text></View>
            <Icon name="arrow_forward" size={19} color={muted} />
          </Pressable>
        )}
      />
      <View pointerEvents="box-none" style={[s.bar, { backgroundColor: p.page, borderTopColor: p.headerBorder }]}>
        <Pressable onPress={onStartAll} disabled={stats.total === 0} style={[s.startAll, stats.total === 0 && { opacity: 0.5 }]}>
          <Text style={s.startAllText}>{allCorrect ? 'Retake full quiz' : 'Start full quiz'} · {stats.total} questions</Text>
          <Icon name="arrow_forward" size={20} exact color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  toolbar: { borderBottomWidth: BW, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 3 },
  toolbarInner: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  heading: { fontFamily: FONT.outfit.b, fontSize: fz(18), lineHeight: lh(18, 1.35), includeFontPadding: false },
  total: { fontFamily: FONT.mono.b, fontSize: fz(12), includeFontPadding: false },
  subtitle: { fontFamily: FONT.body, fontSize: fz(13), lineHeight: lh(13, 1.5), marginBottom: 2, includeFontPadding: false },
  stats: { borderRadius: 20, borderWidth: BW, padding: 18, gap: 12 },
  statsKicker: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  statsMain: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  statsPercent: { fontFamily: FONT.outfit.b, fontSize: fz(44), lineHeight: lh(44, 1.05), includeFontPadding: false },
  statsCaption: { flex: 1, fontFamily: FONT.body, fontSize: fz(13), lineHeight: lh(13, 1.4), paddingBottom: 6, includeFontPadding: false },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 2 },
  tileValue: { fontFamily: FONT.mono.b, fontSize: fz(18), lineHeight: lh(18, 1.2), includeFontPadding: false },
  tileLabel: { fontFamily: FONT.body, fontSize: fz(11), lineHeight: lh(11, 1.3), includeFontPadding: false },
  review: { minHeight: 48, borderRadius: 14, borderWidth: BW, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewText: { flex: 1, fontFamily: FONT.outfit.b, fontSize: fz(14), lineHeight: lh(14, 1.3), includeFontPadding: false },
  section: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, marginTop: 4, includeFontPadding: false },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 10, paddingBottom: 20, paddingHorizontal: 16, borderTopWidth: BW },
  startAll: { minHeight: 54, borderRadius: 16, backgroundColor: '#6366F1', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startAllText: { fontFamily: FONT.outfit.b, fontSize: fz(15), lineHeight: lh(15, 1.3), color: '#FFFFFF', includeFontPadding: false },
  card: { minHeight: 70, borderRadius: 16, borderWidth: BW, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  number: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topic: { fontFamily: FONT.outfit.sb, fontSize: fz(15), lineHeight: lh(15, 1.35), includeFontPadding: false },
  meta: { fontFamily: FONT.body, fontSize: fz(12), marginTop: 4, includeFontPadding: false },
});
