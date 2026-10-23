import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BW, Icon, fz, navScrollHandlers, useNavClearance } from './shell';
import { BadgeTile } from './BadgesScreen';
import { BADGES, RARITY_COLOR, BadgeDef, UNLOCKED_FOR_TESTING } from './badges';
import { FONT, Palette } from './theme';
import { QuizProgress, quizProgressStats } from './quizData';
import type { JourneyVariant } from './App';
import { COMPLETED_WORLDS, TOTAL_WORLDS, UNLOCK_THROUGH } from './HomeScreen';
import { HOME_BANDS } from './homeData';

const INDIGO = '#4338CA';

/** The learner's level is the Home band their current World is in (Beginner, Intermediate, Experienced), the same current World as Home. */
function journeyLevel() {
  const world = Math.min(TOTAL_WORLDS, Math.max(COMPLETED_WORLDS + 1, UNLOCK_THROUGH));
  const band = HOME_BANDS.find((b) => world >= b.firstWorld && world <= b.lastWorld) ?? HOME_BANDS[0];
  return `${band.label.charAt(0)}${band.label.slice(1).toLowerCase()} • World ${world}`;
}

export const ProfileScreen = React.memo(function ProfileScreen({ p, quizProgress, journeyVariant, onJourneyVariant, onToggleTheme, onOpenStats, onOpenBadges, showAccentBorder, onAccentBorder }: {
  p: Palette; quizProgress: QuizProgress; journeyVariant: JourneyVariant; onJourneyVariant: (variant: JourneyVariant) => void; onToggleTheme: () => void; onOpenStats: () => void; onOpenBadges: () => void; showAccentBorder: boolean; onAccentBorder: (visible: boolean) => void;
}) {
  const dark = p.isDark;
  const navClearance = useNavClearance();
  const text = dark ? '#F8FAFC' : '#202126';
  const muted = dark ? '#A7B0C0' : '#5D5D6F';
  const surface = dark ? '#171B25' : '#FFFFFF';
  const soft = dark ? '#202633' : '#EFEEEC';
  const border = dark ? 'rgba(255,255,255,0.09)' : '#EEECE8';
  const page = dark ? p.page : '#F9F7F3';
  const bandA = dark ? 'rgba(148,163,184,0.05)' : 'rgba(120,98,60,0.05)';
  const bandB = dark ? 'rgba(148,163,184,0.09)' : 'rgba(120,98,60,0.10)';
  const stats = React.useMemo(() => quizProgressStats(quizProgress), [quizProgress]);
  // Quiz questions answered correctly at least once (a repeat of the same question counts once).
  const quizSolved = React.useMemo(() => stats.worlds.reduce((sum, item) => sum + item.correct, 0), [stats]);
  // Write & Run and Debug problems solved. Practice completion is not saved yet (the task lists show sample progress), so this stays 0 until it is.
  const practiceSolved = 0;
  return <ScrollView {...navScrollHandlers} style={{ flex: 1, backgroundColor: page }} contentContainerStyle={[s.content, { paddingBottom: navClearance }]} showsVerticalScrollIndicator={false}>
    <View style={[s.band, { backgroundColor: bandA }]}>
    <View style={[s.card, { backgroundColor: surface, borderColor: border }]}>
      <View style={s.identityRow}>
        <View style={s.avatarWrap}><View style={[s.avatar, { backgroundColor: dark ? '#262B55' : '#EEF0FF', borderColor: dark ? '#4F56B8' : '#C7CBFA' }]}><Text style={s.seedling}>🌱</Text></View><View style={s.camera}><SettingsIcon name="camera" size={13} color="#FFFFFF" /></View></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[s.name, { color: text }]}>New Coder</Text>
          <View style={[s.level, { backgroundColor: dark ? 'rgba(129,140,248,0.18)' : '#EEF0FF' }]}><View style={[s.levelDot, { backgroundColor: dark ? '#A5B4FC' : INDIGO }]} /><Text style={[s.levelText, { color: dark ? '#C7D2FE' : INDIGO }]}>{journeyLevel()}</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" style={[s.edit, { borderColor: border, backgroundColor: soft }]}><SettingsIcon name="pencil" size={16} color={text} /></Pressable>
      </View>
    </View>
    <View style={s.statsGrid}>
      <QuickStat label="STREAK" value="0" suffix="Days" note="Start today" icon="streak" iconColor="#B42318" noteColor="#B42318" surface={surface} border={border} text={text} muted={muted} />
      <QuickStat label="QUIZ" value={String(quizSolved)} suffix="" note="Questions solved" icon="help" iconColor="#6D28D9" surface={surface} border={border} text={text} muted={muted} />
      <QuickStat label="PRACTICE" value={String(practiceSolved)} suffix="" note="Problems solved" icon="solved" iconColor="#1F6FB5" surface={surface} border={border} text={text} muted={muted} />
    </View>
    </View>
    <View style={[s.band, { backgroundColor: bandB }]}>
    <View style={[s.card, { backgroundColor: surface, borderColor: border }]}><SectionHeader title="Achievements" tag={`${UNLOCKED_FOR_TESTING.size} / ${BADGES.length}`} action="View All" onAction={onOpenBadges} text={text} muted={muted} /><ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgeScroll} contentContainerStyle={s.badgeRow}>{BADGES.slice(0, 5).map((b) => <BadgeTile key={b.id} badge={b} width={112} compact dark={dark} unlocked={UNLOCKED_FOR_TESTING.has(b.id)} onPress={onOpenBadges} />)}</ScrollView></View>
    <View style={[s.card, { backgroundColor: surface, borderColor: border }]}><SectionHeader title="Coding Activity" subtitle="Past 4 weeks" action="Details" text={text} muted={muted} /><View style={[s.activity, { backgroundColor: soft }]}>{['W1', 'W2', 'W3', 'Today'].map((week, i) => <View key={week} style={s.week}><Text style={[s.weekText, { color: i === 3 ? INDIGO : muted }]}>{week}</Text><View style={s.dotRow}>{[0, 1, 2, 3].map((dot) => <View key={dot} style={[s.dot, { backgroundColor: i === 3 && dot === 3 ? INDIGO : dark ? '#303847' : '#E3E1E0' }, i === 3 && dot === 3 && s.todayDot]} />)}</View></View>)}</View><Text style={[s.activityHint, { color: muted }]}>Start your first streak today by completing a quick challenge</Text></View>
    </View>
    <View style={[s.band, { backgroundColor: bandA }]}>
    <View style={[s.settingsCard, { backgroundColor: surface, borderColor: border }]}><Text style={[s.settingsTitle, { color: text }]}>SETTINGS</Text><SettingRow icon="analytics" label="Learning Statistics" text={text} muted={muted} onPress={onOpenStats} /><SettingRow icon="notifications" label="Notifications & Reminders" text={text} muted={muted} /><SettingRow icon="tune" label="App Preferences" text={text} muted={muted} onPress={onToggleTheme} /><SettingRow icon="help" label="Help & Feedback" text={text} muted={muted} /><SettingRow icon="info" label="About CodeDo" text={text} muted={muted} detail="v2.4" /><View style={[s.preference, { borderTopColor: border }]}><Text style={[s.preferenceLabel, { color: muted }]}>Accent borders</Text><Pressable onPress={() => onAccentBorder(!showAccentBorder)} style={[s.toggle, { backgroundColor: showAccentBorder ? INDIGO : soft }]}><Text style={[s.toggleText, { color: showAccentBorder ? '#FFFFFF' : muted }]}>{showAccentBorder ? 'On' : 'Off'}</Text></Pressable></View><View style={s.shapeRow}>{(['milestones', 'milestonesCircle', 'milestonesDiamond', 'milestonesPill'] as const).map((variant, index) => <Pressable key={variant} onPress={() => onJourneyVariant(variant)} style={[s.shape, { backgroundColor: journeyVariant === variant ? INDIGO : soft }]}><Text style={[s.shapeText, { color: journeyVariant === variant ? '#FFFFFF' : muted }]}>{['Square', 'Circle', 'Diamond', 'Pill'][index]}</Text></Pressable>)}</View></View>
    <Pressable style={s.logout}><Icon name="replay" size={19} exact color="#B42318" /><Text style={s.logoutText}>Log Out of CodeDo</Text></Pressable>
    </View>
  </ScrollView>;
});

function QuickStat({ label, value, suffix, note, icon, iconColor, noteColor, surface, border, text, muted }: { label: string; value: string; suffix: string; note: string; icon: string; iconColor: string; noteColor?: string; surface: string; border: string; text: string; muted: string }) {
  return (
    <View style={[s.quickStat, { backgroundColor: surface, borderColor: border }]}>
      <View style={s.statTop}>
        <View style={[s.statChip, { backgroundColor: `${iconColor}1F` }]}><SettingsIcon name={icon} size={16} color={iconColor} /></View>
        <Text numberOfLines={1} style={[s.statLabel, { color: muted }]}>{label}</Text>
      </View>
      <Text style={[s.statValue, { color: text }]}>{value}{suffix ? <Text style={[s.statSuffix, { color: muted }]}>{` ${suffix}`}</Text> : null}</Text>
      <Text numberOfLines={1} style={[s.statNote, { color: noteColor ?? muted }]}>{note}</Text>
    </View>
  );
}
function SectionHeader({ title, subtitle, tag, action, onAction, text, muted }: { title: string; subtitle?: string; tag?: string; action?: string; onAction?: () => void; text: string; muted: string }) { return <View style={s.sectionHead}><View style={s.headingGroup}><Text style={[s.cardTitle, { color: text }]}>{title}</Text>{tag && <View style={s.tag}><Text style={[s.tagText, { color: muted }]}>{tag}</Text></View>}{subtitle && <Text style={[s.caption, { color: muted }]}>{subtitle}</Text>}</View>{action && <Pressable onPress={onAction} hitSlop={8} style={s.action}><Text style={s.actionText}>{action}</Text><Icon name="chevron_right" size={16} exact color={INDIGO} /></Pressable>}</View>; }
function Badge({ badge, next, dark, text, muted, soft, border }: { badge: BadgeDef; next?: boolean; dark: boolean; text: string; muted: string; soft: string; border: string }) {
  const rarity = RARITY_COLOR[badge.rarity][dark ? 'dark' : 'light'];
  return <View style={[s.badge, { backgroundColor: next ? 'rgba(238,238,255,0.5)' : soft, borderColor: next ? '#C9C5FF' : border }]}>
    <View style={[s.badgeIcon, { backgroundColor: next ? '#E4E2FF' : dark ? '#2A3140' : '#E9E7E6' }]}><Text style={[s.badgeEmoji, !next && { opacity: 0.4 }]}>{badge.emoji}</Text>{!next && <View style={s.badgeLock}><Icon name="lock" size={10} exact color="#7C7D8C" /></View>}</View>
    <Text style={[s.badgeTitle, { color: text }]} numberOfLines={1}>{badge.title}</Text>
    <Text style={[s.badgeSub, { color: muted }]} numberOfLines={3}>{badge.condition}</Text>
    <Text style={[s.badgeRarity, { color: rarity }]}>{badge.rarity.toUpperCase()}</Text>
  </View>;
}
const SETTINGS_ICON_PATHS: Record<string, string> = {
  analytics: 'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM8 17v-2M12 17v-5M16 17v-8',
  notifications: 'M6 10a6 6 0 0 1 12 0c0 4.5 1.5 5.5 2 6.5H4c.5-1 2-2 2-6.5ZM12 3v1M10 19.5a2 2 0 0 0 4 0',
  tune: 'M3 7h7M14 7h7M10 4.5v5M14 4.5v5M3 12h2M9 12h12M5 9.5v5M9 9.5v5M3 17h9M16 17h5M12 14.5v5M16 14.5v5',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17v.01',
  streak: 'M12 3c1 3.5 5.5 5.5 5.5 10a5.5 5.5 0 0 1-11 0c0-2.2 1-3.6 2.2-4.8.2 1.8 1 2.8 2 3 0-3-.7-5 1.3-8.2ZM12 18a2.2 2.2 0 0 0 2.2-2.2c0-1.6-2.2-2.6-2.2-4.3-1.1 1.1-2.2 2.700-2.200 4.300A2.200 2.200 0 0 0 12 18Z',
  solved: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM3 8h18M7 12l3 2-3 2M12 16h4',
  badges: 'M7 3h10v5l-5 3-5-3V3ZM12 14l1.200 2.500 2.800.400-2 2 .500 2.800-2.500-1.300-2.500 1.300.500-2.800-2-2 2.800-.400L12 14Z',
  camera: 'M4 8.5A1.500 1.500 0 0 1 5.500 7h2l1.200-2h6.600l1.200 2h2A1.500 1.500 0 0 1 20 8.500v9a1.500 1.500 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 17.500v-9ZM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  pencil: 'M4 20l1-4L16.500 4.500a1.800 1.800 0 0 1 2.500 0l.5.500a1.800 1.800 0 0 1 0 2.500L8 19l-4 1ZM14.500 6.500l3 3',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6M12 7.5v.01',
};
function SettingsIcon({ name, color, size = 22 }: { name: string; color: string; size?: number }) { return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={SETTINGS_ICON_PATHS[name] ?? SETTINGS_ICON_PATHS.info} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function SettingRow({ icon, label, detail, text, muted, onPress }: { icon: string; label: string; detail?: string; text: string; muted: string; onPress?: () => void }) { return <Pressable onPress={onPress} style={s.setting}><SettingsIcon name={icon} color={muted} /><Text style={[s.settingLabel, { color: text }]}>{label}</Text>{detail ? <Text style={[s.detail, { color: muted }]}>{detail}</Text> : <Icon name="chevron_right" size={20} exact color={muted} />}</Pressable>; }

const s = StyleSheet.create({
  content: { paddingBottom: 0 }, band: { padding: 18, gap: 16 }, card: { borderWidth: BW, borderRadius: 12, padding: 20, shadowColor: '#3A3226', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, identityRow: { flexDirection: 'row', alignItems: 'center', gap: 13 }, avatarWrap: { width: 64, height: 64 }, avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center' }, seedling: { fontSize: 29 }, camera: { position: 'absolute', right: 0, bottom: 0, width: 23, height: 23, borderRadius: 12, backgroundColor: INDIGO, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, name: { fontFamily: FONT.outfit.b, fontSize: fz(19), lineHeight: fz(24) }, handle: { fontFamily: FONT.body, fontSize: fz(13), marginTop: 1 }, level: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  levelDot: { width: 6, height: 6, borderRadius: 3 }, levelText: { fontFamily: FONT.outfit.sb, fontSize: fz(10) }, edit: { width: 40, height: 40, borderWidth: BW, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, editText: { fontFamily: FONT.outfit.sb, fontSize: fz(12) }, statsGrid: { flexDirection: 'row', gap: 10 }, quickStat: { flex: 1, minHeight: 100, padding: 12, borderRadius: 10, borderWidth: BW, shadowColor: '#3A3226', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, statTop: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  statChip: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, statLabel: { fontFamily: FONT.outfit.md, fontSize: fz(10), letterSpacing: 0.8 }, statValue: { fontFamily: FONT.outfit.b, fontSize: fz(26), lineHeight: fz(30) }, statSuffix: { fontFamily: FONT.body, fontSize: fz(11) }, statNote: { fontFamily: FONT.body, fontSize: fz(11), marginTop: 2 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13 }, cardTitle: { fontFamily: FONT.outfit.b, fontSize: fz(13), lineHeight: fz(18) }, caption: { fontFamily: FONT.body, fontSize: fz(11), marginTop: 2 }, percent: { fontFamily: FONT.outfit.sb, fontSize: fz(12), marginTop: 8 }, progressTrack: { height: 7, borderRadius: 8, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 8, backgroundColor: INDIGO }, metrics: { flexDirection: 'row', marginTop: 15, marginBottom: 15, borderTopWidth: BW, borderBottomWidth: BW, paddingVertical: 10 }, metric: { flex: 1, alignItems: 'center' }, metricDivided: { borderLeftWidth: BW, borderRightWidth: BW, borderColor: '#E9E7E5' }, metricLabel: { fontFamily: FONT.body, fontSize: fz(10) }, metricValue: { fontFamily: FONT.outfit.b, fontSize: fz(13), marginTop: 5 }, startBanner: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, startTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12) }, startSub: { fontFamily: FONT.body, fontSize: fz(10), marginTop: 4 }, startButton: { backgroundColor: INDIGO, height: 39, paddingHorizontal: 13, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5 }, startButtonText: { color: '#FFFFFF', fontFamily: FONT.outfit.sb, fontSize: fz(11) }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }, headingGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }, tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, backgroundColor: '#ECEAE9' }, tagText: { fontFamily: FONT.outfit.sb, fontSize: fz(10) }, action: { flexDirection: 'row', alignItems: 'center' }, actionText: { color: INDIGO, fontFamily: FONT.outfit.sb, fontSize: fz(11) }, badgeScroll: { marginHorizontal: -20, marginBottom: -14 }, badgeRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 }, badge: { width: 124, minHeight: 168, borderRadius: 10, borderWidth: BW, padding: 12, alignItems: 'center', gap: 4 }, badgeEmoji: { fontSize: 24 }, badgeLock: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, badgeRarity: { fontFamily: FONT.outfit.b, fontSize: fz(9), letterSpacing: 0.6, marginTop: 'auto' }, badgeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }, next: { color: INDIGO, fontFamily: FONT.outfit.b, fontSize: fz(10), letterSpacing: 0.5, backgroundColor: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, overflow: 'hidden', marginTop: 4 }, badgeProgress: { fontFamily: FONT.body, fontSize: fz(10), marginTop: 4 }, badgeTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(12), textAlign: 'center' }, badgeSub: { fontFamily: FONT.body, fontSize: fz(10), textAlign: 'center', minHeight: 40 }, activity: { flexDirection: 'row', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 9, justifyContent: 'space-between' }, week: { alignItems: 'center', flex: 1, gap: 9 }, weekText: { fontFamily: FONT.outfit.md, fontSize: fz(10) }, dotRow: { flexDirection: 'row', gap: 4 }, dot: { width: 10, height: 10, borderRadius: 5 }, todayDot: { width: 12, height: 12, borderWidth: 2, borderColor: '#C7C4FF', marginTop: -1 }, activityHint: { textAlign: 'center', fontFamily: FONT.body, fontSize: fz(10), marginTop: 13 }, settingsCard: { borderWidth: BW, borderRadius: 12, padding: 10, shadowColor: '#3A3226', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, settingsTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12), letterSpacing: 0.8, paddingHorizontal: 7, paddingTop: 9, paddingBottom: 5 }, setting: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 8 }, settingLabel: { flex: 1, fontFamily: FONT.outfit.md, fontSize: fz(12) }, detail: { fontFamily: FONT.body, fontSize: fz(10) }, preference: { marginTop: 4, paddingTop: 10, borderTopWidth: BW, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 }, preferenceLabel: { fontFamily: FONT.body, fontSize: fz(10) }, toggle: { minWidth: 42, paddingVertical: 5, borderRadius: 8, alignItems: 'center' }, toggleText: { fontFamily: FONT.outfit.b, fontSize: fz(10) }, shapeRow: { flexDirection: 'row', gap: 6, padding: 8 }, shape: { flex: 1, borderRadius: 7, paddingVertical: 7, alignItems: 'center' }, shapeText: { fontFamily: FONT.outfit.sb, fontSize: fz(9) }, logout: { height: 57, borderWidth: BW, borderColor: '#F9BBB6', borderRadius: 15, backgroundColor: '#FFF0EE', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }, logoutText: { color: '#B42318', fontFamily: FONT.outfit.sb, fontSize: fz(12) },
});
