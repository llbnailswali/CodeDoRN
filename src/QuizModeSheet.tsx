import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';

export function QuizModeSheet({ p, world, total, onLessonWise, onAllInOne, onClose }: { p: Palette; world: { order: number; title: string }; total: number; onLessonWise: () => void; onAllInOne: () => void; onClose: () => void }) {
  const dark = p.isDark;
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  return <Modal transparent visible animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.backdrop} onPress={onClose}>
      <Pressable onPress={() => {}} style={[s.sheet, { backgroundColor: p.page, borderColor: p.cardBorder }]}>
        <View style={s.handle} />
        <Text style={[s.kicker, { color: dark ? '#A5B4FC' : '#4F46E5' }]}>WORLD_{String(world.order).padStart(2, '0')}</Text>
        <Text style={[s.title, { color: title }]}>Choose quiz mode</Text>
        <Text style={[s.subtitle, { color: muted }]}>{world.title} · {total} questions</Text>
        <Pressable onPress={onLessonWise} style={[s.option, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: dark ? 'rgba(129,140,248,0.6)' : '#A5B4FC' }]}>
          <View style={[s.icon, { backgroundColor: dark ? 'rgba(99,102,241,0.18)' : '#EEF2FF' }]}><Icon name="menu_book" size={22} color={dark ? '#C7D2FE' : '#4338CA'} /></View>
          <View style={{ flex: 1 }}><Text style={[s.optionTitle, { color: title }]}>Lesson-wise quiz</Text><Text style={[s.optionSub, { color: muted }]}>Practice one lesson at a time · Recommended</Text></View>
          <Icon name="arrow_forward" size={20} color={muted} />
        </Pressable>
        <Pressable onPress={onAllInOne} style={[s.option, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' }]}>
          <View style={[s.icon, { backgroundColor: dark ? 'rgba(251,191,36,0.15)' : '#FEF3C7' }]}><Icon name="bolt" size={22} color={dark ? '#FCD34D' : '#B45309'} /></View>
          <View style={{ flex: 1 }}><Text style={[s.optionTitle, { color: title }]}>All-in-one quiz</Text><Text style={[s.optionSub, { color: muted }]}>Take all {total} questions together</Text></View>
          <Icon name="arrow_forward" size={20} color={muted} />
        </Pressable>
        <Pressable onPress={onClose} style={s.cancel}><Text style={[s.cancelText, { color: muted }]}>Cancel</Text></Pressable>
      </Pressable>
    </Pressable>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: BW, padding: 20, paddingBottom: 28, gap: 10, elevation: 12 },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#94A3B8', marginBottom: 6 },
  kicker: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  title: { fontFamily: FONT.outfit.b, fontSize: fz(22), lineHeight: lh(22, 1.3), includeFontPadding: false },
  subtitle: { fontFamily: FONT.body, fontSize: fz(13), includeFontPadding: false, marginBottom: 4 },
  option: { minHeight: 76, borderRadius: 16, borderWidth: BW, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(15), includeFontPadding: false },
  optionSub: { fontFamily: FONT.body, fontSize: fz(12), lineHeight: lh(12, 1.4), marginTop: 4, includeFontPadding: false },
  cancel: { height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cancelText: { fontFamily: FONT.outfit.b, fontSize: fz(14), includeFontPadding: false },
});
