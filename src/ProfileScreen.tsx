import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { PATH_STYLES, DEFAULT_PATH_STYLE, PathStyleId } from './pathStyles';
import { FONT, Palette } from './theme';

export const ProfileScreen = React.memo(function ProfileScreen({ p, completedWorlds, quizAnswered, onToggleTheme, onReset }: {
  p: Palette; completedWorlds: number; quizAnswered: number; onToggleTheme: () => void; onReset: () => void;
}) {
  const dark = p.isDark;
  const [fontSize, setFontSize] = React.useState<'small' | 'medium' | 'large'>('medium');
  const [pathStyle, setPathStyle] = React.useState<PathStyleId>(DEFAULT_PATH_STYLE);
  const title = dark ? '#F1F5F9' : '#2E3040';
  const muted = dark ? '#94A3B8' : '#64748B';
  const panel = dark ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' };
  const row = dark ? { backgroundColor: '#0F1422', borderColor: 'rgba(255,255,255,0.06)' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };
  const reset = () => Alert.alert('Reset progress?', 'This clears native quiz progress.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: onReset }]);
  return <ScrollView style={{ flex: 1, backgroundColor: p.page }} contentContainerStyle={s.content}>
    <View style={[s.profile, panel]}>
      <View style={s.avatar}><Text style={{ fontSize: 28 }}>🧑‍💻</Text></View>
      <View style={{ flex: 1 }}><Text style={[s.name, { color: title }]}>Alex Vance</Text><Text style={[s.sub, { color: muted }]}>Junior Kotlin Developer</Text><Text style={[s.stats, { color: '#F59E0B' }]}>🔥 {completedWorlds} Worlds · <Text style={{ color: '#818CF8' }}>💎 {quizAnswered} Quiz answers</Text></Text></View>
    </View>
    <Section title="Preferences & Display" titleColor={muted}>
      <ActionRow icon={dark ? 'light_mode' : 'dark_mode'} label="Appearance Theme" value={dark ? 'DARK' : 'LIGHT'} description={dark ? 'Obsidian Night Mode' : 'Silk Neumorphic Light'} p={p} onPress={onToggleTheme} />
      <View style={[s.row, row]}><Icon name="format_size" size={20} exact color="#22D3EE" /><View style={{ flex: 1 }}><Text style={[s.rowTitle, { color: title }]}>Text Size</Text><Text style={[s.sub, { color: muted }]}>Applies across the app</Text></View><View style={s.sizeGroup}>{(['small', 'medium', 'large'] as const).map((size) => <Pressable key={size} onPress={() => setFontSize(size)} style={[s.size, fontSize === size && { backgroundColor: '#6366F1' }]}><Text style={{ color: fontSize === size ? '#FFF' : muted, fontWeight: '700' }}>A</Text></Pressable>)}</View></View>
    </Section>
    <Section title="Journey Path" titleColor={muted}>
      <Text style={[s.sub, { color: muted, marginBottom: 10 }]}>Choose the shape used on the Learn journey.</Text>
      <View style={s.pathGrid}>{PATH_STYLES.map((style) => <Pressable key={style.id} onPress={() => setPathStyle(style.id)} style={[s.path, row, pathStyle === style.id && { borderColor: '#6366F1', borderWidth: 2 }]}><Text style={[s.rowTitle, { color: title }]}>{style.label}</Text><Text style={[s.sub, { color: muted }]} numberOfLines={2}>{style.description}</Text></Pressable>)}</View>
    </Section>
    <Section title="Tools" titleColor={muted}>
      <ActionRow icon="restart_alt" label="Reset Native Progress" value="RESET" description="Clear quiz progress and start again" p={p} onPress={reset} danger />
    </Section>
  </ScrollView>;
});

function Section({ title, titleColor, children }: { title: string; titleColor: string; children: React.ReactNode }) { return <View style={s.section}><Text style={[s.sectionTitle, { color: titleColor }]}>{title.toUpperCase()}</Text>{children}</View>; }
function ActionRow({ icon, label, value, description, p, onPress, danger }: { icon: string; label: string; value: string; description: string; p: Palette; onPress: () => void; danger?: boolean }) { return <Pressable onPress={onPress} style={[s.row, p.isDark ? { backgroundColor: '#0F1422', borderColor: 'rgba(255,255,255,0.06)' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}><Icon name={icon} size={20} exact color={danger ? '#F43F5E' : '#818CF8'} /><View style={{ flex: 1 }}><Text style={[s.rowTitle, { color: p.isDark ? '#F1F5F9' : '#2E3040' }]}>{label}</Text><Text style={[s.sub, { color: p.isDark ? '#94A3B8' : '#64748B' }]}>{description}</Text></View><Text style={{ color: danger ? '#F43F5E' : '#818CF8', fontFamily: FONT.mono.b, fontSize: fz(10) }}>{value}</Text></Pressable>; }

const s = StyleSheet.create({ content: { padding: 16, paddingBottom: 40, gap: 14 }, profile: { borderWidth: BW, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }, avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }, name: { fontFamily: FONT.outfit.b, fontSize: fz(18), marginBottom: 2 }, sub: { fontFamily: FONT.body, fontSize: fz(11), lineHeight: fz(16) }, stats: { fontFamily: FONT.mono.b, fontSize: fz(10), marginTop: 8 }, section: { borderRadius: 16, padding: 14, gap: 10 }, sectionTitle: { fontFamily: FONT.outfit.b, fontSize: fz(11), letterSpacing: 1 }, row: { minHeight: 58, borderWidth: BW, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, rowTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12), marginBottom: 2 }, sizeGroup: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: 8, borderWidth: BW, borderColor: '#CBD5E1' }, size: { width: 28, height: 26, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }, pathGrid: { gap: 8 }, path: { borderWidth: BW, borderRadius: 10, padding: 11, gap: 3 } });
