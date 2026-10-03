import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';
import { QuizQuestion } from './quizQuestions';

type LessonGroup = { lessonId: string; topic: string; questions: QuizQuestion[] };

export function QuizLessonWiseScreen({ p, world, questions, topInset, onBack, onStart }: {
  p: Palette;
  world: { order: number; title: string };
  questions: QuizQuestion[];
  topInset: number;
  onBack: () => void;
  onStart: (questions: QuizQuestion[]) => void;
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
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}
        ListHeaderComponent={<Text style={[s.subtitle, { color: muted }]}>Choose a lesson to practice its quiz questions.</Text>}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => onStart(item.questions)} style={[s.card, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' }]}>
            <View style={[s.number, { backgroundColor: dark ? 'rgba(99,102,241,0.18)' : '#EEF2FF' }]}><Text style={{ color: dark ? '#C7D2FE' : '#4338CA', fontFamily: FONT.mono.b }}>{String(index + 1).padStart(2, '0')}</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.topic, { color: title }]}>{item.topic}</Text><Text style={[s.meta, { color: muted }]}>{item.questions.length} question{item.questions.length === 1 ? '' : 's'}</Text></View>
            <Icon name="arrow_forward" size={19} color={muted} />
          </Pressable>
        )}
      />
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
  card: { minHeight: 70, borderRadius: 16, borderWidth: BW, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  number: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topic: { fontFamily: FONT.outfit.sb, fontSize: fz(15), lineHeight: lh(15, 1.35), includeFontPadding: false },
  meta: { fontFamily: FONT.body, fontSize: fz(12), marginTop: 4, includeFontPadding: false },
});
