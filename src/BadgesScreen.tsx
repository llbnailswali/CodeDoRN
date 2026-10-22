import React from 'react';
import { Animated, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BW, Icon, TabId, fz } from './shell';
import { FONT, Palette } from './theme';
import { BADGES, BADGE_PROGRESS_FOR_TESTING as PROGRESS, BadgeCategory, BadgeDef, RARITY_COLOR, UNLOCK_DATE_FOR_TESTING, UNLOCKED_FOR_TESTING as UNLOCKED } from './badges';
import { badgeHasArt, badgeImageFor } from './badgeImages';
import { BadgeHero, ProgressCard } from './BadgeHero';

type Filter = 'All' | BadgeCategory;

const CATEGORIES: BadgeCategory[] = ['Accuracy', 'Coding', 'Quizzes', 'Challenges', 'Consistency', 'Worlds', 'Bosses'];
const CATEGORY_ICONS: Record<BadgeCategory, string> = { Accuracy: '🎯', Coding: '💻', Quizzes: '🧠', Challenges: '⚡', Consistency: '🔥', Worlds: '🌍', Bosses: '👑' };
const CATEGORY_SUB: Record<BadgeCategory, string> = { Accuracy: 'Precision & error-free runs', Coding: 'Syntax mastery & tests', Quizzes: 'Knowledge & speed', Challenges: 'Daily & timed trials', Consistency: 'Dedication & milestones', Worlds: 'Explore every world', Bosses: 'Defeat the world bosses' };
const CATEGORY_TINT: Record<BadgeCategory, string> = { Accuracy: '#EF4444', Coding: '#3B82F6', Quizzes: '#8B5CF6', Challenges: '#F59E0B', Consistency: '#F97316', Worlds: '#10B981', Bosses: '#EAB308' };
const INDIGO = '#4338CA';
const GREEN = '#3E8E64';
// Where the button on a badge's detail sheet leads: the tab where the learner can make progress on that badge.
const BADGE_ACTION: Record<BadgeCategory, { label: string; tab: TabId }> = {
  Accuracy: { label: 'Keep Practicing', tab: 'practice' },
  Coding: { label: 'Start Practice', tab: 'practice' },
  Quizzes: { label: 'Practice Quiz', tab: 'quiz' },
  Challenges: { label: 'Try a Challenge', tab: 'quiz' },
  Consistency: { label: "Start Today's Lesson", tab: 'learn' },
  Worlds: { label: 'Continue Learning', tab: 'learn' },
  Bosses: { label: 'Continue Learning', tab: 'learn' },
};
// The icon font has no glyphs for these two, so they are drawn.
function TrophyIcon({ size, color }: { size: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5.500a2.500 2.500 0 0 0 2.800 3.800M16 6h2.500a2.500 2.500 0 0 1-2.800 3.800M12 13v4M8.500 20h7M10 17h4" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function FilledTrophyIcon({ size, color }: { size: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 3.500h10V9a5 5 0 0 1-10 0V3.500ZM10.800 13.800h2.400V17h-2.400ZM7.500 17.500h9V20h-9Z" fill={color} /><Path d="M7 5.200H4.600v1.400a3.200 3.200 0 0 0 3 3.200M17 5.200h2.400v1.400a3.200 3.200 0 0 1-3 3.200" fill="none" stroke={color} strokeWidth={1.600} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
// A scalloped seal with a check: the "unlocked" mark in the achievement card.
const SEAL_POINTS = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 - Math.PI / 2; const r = i % 2 === 0 ? 11.500 : 9.800; return `${(12 + Math.cos(a) * r).toFixed(2)},${(12 + Math.sin(a) * r).toFixed(2)}`; }).join(' ');
function SealCheckIcon({ size, color }: { size: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Polygon points={SEAL_POINTS} fill={color} stroke={color} strokeWidth={1} strokeLinejoin="round" /><Path d="M7.600 12.400l3 3 5.800-6" fill="none" stroke="#FFFFFF" strokeWidth={2.200} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function MedalIcon({ size, color }: { size: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 3.500a5.500 5.500 0 1 0 0 11 5.500 5.500 0 0 0 0-11ZM9.200 14l-1.700 7 4.500-2.500 4.500 2.500-1.700-7" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Path d="M12 6.600l.9 1.900 2 .3-1.500 1.400.4 2L12 11.200l-1.800 1 .4-2L9.100 8.800l2-.3Z" fill={color} /></Svg>;
}

// Colours of the detail sheet's rarity chip and its gold-style card. Legendary (light) is the approved design; the other tiers are derived from their colour.
function rarityTone(rc: string, dark: boolean) {
  // The chip follows the badge's rarity; the "unlocked" card is the same cream and gold for every badge.
  const chip = rc === '#B7791F' && !dark
    ? { accent: '#E8A03C', text: '#7A3E16', chipBg: '#FEF0DC', chipBorder: '#F5D983' }
    : { accent: rc, text: rc, chipBg: `${rc}1F`, chipBorder: `${rc}55` };
  const card = dark
    ? { cardBg: 'rgba(245,199,107,0.08)', cardBorder: 'rgba(245,199,107,0.28)', tile: 'rgba(245,199,107,0.18)', tileBorder: 'rgba(245,199,107,0.35)', tileIcon: '#F5C76B', pillBg: 'rgba(245,199,107,0.2)', pillText: '#F5C76B', divider: 'rgba(245,199,107,0.2)' }
    : { cardBg: '#FEFDF4', cardBorder: '#F9E8AE', tile: '#FCF0C5', tileBorder: '#F5E19B', tileIcon: '#B65F1D', pillBg: '#FCEFC2', pillText: '#8E4112', divider: '#F8EBC1' };
  return { ...chip, ...card };
}
const TOOLBAR_H = 56;
const CHIPS_H = 65;

const BADGE_GLOW = require('../assets/achievements/badge_glow.png');

// One badge in the grid. An earned badge gets a soft wash and glow in its rarity colour, a rarity pill and a tinted shadow;
// a locked one is quiet and flat, with a "Locked" pill (or its progress bar).
function BadgeTile({ badge, width, dark, unlocked, onPress }: { badge: BadgeDef; width: number; dark: boolean; unlocked: boolean; onPress: () => void }) {
  const rc = RARITY_COLOR[badge.rarity][dark ? 'dark' : 'light'];
  const text = dark ? '#E2E8F0' : '#1F2437';
  const surface = dark ? '#171B25' : '#FFFFFF';
  const progress = !unlocked ? PROGRESS[badge.id] : undefined;
  const gradId = `tile-${badge.id}`;
  return <Pressable onPress={onPress} disabled={!unlocked} accessibilityState={{ disabled: !unlocked }}
    style={({ pressed }) => [s.tile, { width, backgroundColor: surface }, unlocked
      ? { shadowColor: rc, shadowOpacity: dark ? 0.35 : 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 }
      : { shadowColor: '#3A3226', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
    pressed && { transform: [{ scale: 0.97 }] }]}>
    <View pointerEvents="none" style={[s.tileClip, { borderColor: unlocked ? `${rc}50` : dark ? 'rgba(255,255,255,0.08)' : '#ECEAE6' }]}>
      {unlocked && <>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs><LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={rc} stopOpacity={dark ? 0.22 : 0.16} />
            <Stop offset="0.55" stopColor={rc} stopOpacity={dark ? 0.06 : 0.04} />
            <Stop offset="1" stopColor={rc} stopOpacity="0" />
          </LinearGradient></Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
        </Svg>
        <Image source={BADGE_GLOW} resizeMode="contain" style={[s.tileGlow, { opacity: dark ? 0.5 : 0.4 }, badge.rarity !== 'Legendary' && { tintColor: rc }]} />
      </>}
    </View>
    {unlocked
      ? <View style={s.statusDot}><Icon name="check" size={10} exact color="#FFFFFF" /></View>
      : <View style={[s.statusDot, { backgroundColor: dark ? '#303847' : '#ECEAE6' }]}><Icon name="lock" size={9} exact color={dark ? '#CBD5E1' : '#7A8094'} /></View>}
    <Image source={badgeImageFor(badge.id)} resizeMode="contain" style={[s.art, !unlocked && badgeHasArt(badge.id) && { opacity: 0.42 }]} />
    <Text numberOfLines={2} style={[s.tileTitle, { color: unlocked ? text : dark ? '#7C8599' : '#8A90A3' }]}>{badge.title}</Text>
    {progress
      ? <View style={s.progressWrap}>
        <View style={[s.track, { backgroundColor: dark ? '#252C3A' : '#EDEFF5' }]}><View style={[s.fill, { width: `${(progress[0] / progress[1]) * 100}%` }]} /></View>
        <Text style={s.progressText}>{progress[0]}/{progress[1]}</Text>
      </View>
      : unlocked
        ? <View style={[s.rarityPill, { backgroundColor: `${rc}${dark ? '2E' : '1C'}` }]}><View style={[s.pillDot, { backgroundColor: rc }]} /><Text style={[s.pillText, { color: rc }]}>{badge.rarity.toUpperCase()}</Text></View>
        : <View style={[s.rarityPill, { backgroundColor: dark ? '#222836' : '#F1EFEC' }]}><View style={[s.pillDot, { backgroundColor: dark ? '#7C8599' : '#B4B9C8' }]} /><Text style={[s.pillText, { color: dark ? '#7C8599' : '#9AA0B2' }]}>LOCKED</Text></View>}
  </Pressable>;
}

export function BadgesScreen({ p, topInset, onBack, onGoTab }: { p: Palette; topInset: number; onBack: () => void; onGoTab: (tab: TabId) => void }) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const dark = p.isDark;
  const text = dark ? '#F8FAFC' : '#1E2235';
  const muted = dark ? '#A7B0C0' : '#8A90A6';
  const [filter, setFilter] = React.useState<Filter>('All');
  const [selected, setSelected] = React.useState<BadgeDef | null>(null);
  // Badges pinned to the profile (up to three). Kept here for now; it is lost when the screen closes until profile storage exists.
  const [showcased, setShowcased] = React.useState<string[]>([]);
  // Dragging the detail sheet down closes it: it follows the finger, then leaves if pulled far enough (or flicked); otherwise it springs back.
  const drag = React.useRef(new Animated.Value(0)).current;
  const closeDetail = React.useCallback(() => setSelected(null), []);
  React.useEffect(() => { drag.setValue(0); }, [selected, drag]);
  const sheetPan = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => g.dy > 8 && g.dy > Math.abs(g.dx) * 1.5,
    onPanResponderMove: (_, g) => { if (g.dy > 0) drag.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 110 || g.vy > 0.9) Animated.timing(drag, { toValue: 800, duration: 180, useNativeDriver: true }).start(closeDetail);
      else Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    },
    onPanResponderTerminate: () => Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start(),
  }), [drag, closeDetail]);
  const categories = filter === 'All' ? CATEGORIES : [filter];
  const tileWidth = Math.floor((screenWidth - 32 - 20) / 3);
  // The toolbar and the chips ride on the scroll: the toolbar leaves as the list scrolls up and returns the moment it scrolls back down
  // (diffClamp follows the finger, not the position), while the chips slide up behind the status bar and stay there.
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const toolbarShift = React.useRef(Animated.diffClamp(scrollY, 0, TOOLBAR_H)).current.interpolate({ inputRange: [0, TOOLBAR_H], outputRange: [0, -TOOLBAR_H], extrapolate: 'clamp' });
  const stickyShadow = toolbarShift.interpolate({ inputRange: [-TOOLBAR_H, -TOOLBAR_H + 10], outputRange: [1, 0], extrapolate: 'clamp' });

  return <View style={{ flex: 1, backgroundColor: p.page }}>
    <Animated.View style={[s.toolbar, { top: topInset, backgroundColor: p.page, shadowOpacity: dark ? 0.4 : 0.08, transform: [{ translateY: toolbarShift }] }]}>
      <View style={s.headerRow}>
        <Pressable onPress={onBack} accessibilityLabel="Back" hitSlop={10} style={[s.back, { backgroundColor: dark ? '#252C3A' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#E8E8F0' }]}><Icon name="arrow_back" size={22} exact color={text} /></Pressable>
        <Text style={[s.title, { color: text }]}>Achievements</Text>
        <View style={[s.countPill, { backgroundColor: dark ? 'rgba(99,102,241,0.2)' : '#ECEBFF', borderColor: dark ? 'rgba(129,140,248,0.4)' : '#CFCBFA' }]}><View style={s.countDot} /><Text style={[s.countText, { color: dark ? '#C7D2FE' : INDIGO }]}>{UNLOCKED.size} / {BADGES.length}</Text></View>
      </View>
    </Animated.View>
    <Animated.View style={[s.chipBar, { top: topInset + TOOLBAR_H, backgroundColor: p.page, transform: [{ translateY: toolbarShift }] }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={s.chips}>
        {(['All', ...CATEGORIES] as Filter[]).map((category) => {
          const on = filter === category;
          return <Pressable key={category} onPress={() => setFilter(category)} style={[s.chip, { backgroundColor: on ? INDIGO : dark ? '#1C2231' : '#FFFFFF', borderColor: on ? INDIGO : dark ? 'rgba(255,255,255,0.12)' : '#DADCE6' }, on && s.chipOn]}>
            <Text numberOfLines={1} style={[s.chipText, { color: on ? '#FFFFFF' : dark ? '#A7B0C0' : '#5D6275' }]}>{category}</Text>
          </Pressable>;
        })}
      </ScrollView>
      {/* The chips' shadow appears only once they are pinned (the toolbar has fully left); until then they sit flat under it. */}
      <Animated.View pointerEvents="none" style={[s.stickyShadow, { opacity: stickyShadow }]}>
        <Svg width="100%" height="100%"><Defs><LinearGradient id="chipShadow" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#3A3226" stopOpacity={dark ? 0.45 : 0.14} /><Stop offset="1" stopColor="#3A3226" stopOpacity="0" /></LinearGradient></Defs><Rect x="0" y="0" width="100%" height="100%" fill="url(#chipShadow)" /></Svg>
      </Animated.View>
    </Animated.View>
    <View pointerEvents="none" style={[s.statusCover, { height: topInset, backgroundColor: p.page }]} />
    <Animated.FlatList
      data={categories}
      keyExtractor={(category) => category}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      contentContainerStyle={[s.content, { paddingTop: topInset + TOOLBAR_H + CHIPS_H + 4, paddingBottom: bottomInset + 32 }]}
      renderItem={({ item: category }) => {
        const badges = BADGES.filter((badge) => badge.category === category);
        const done = badges.filter((badge) => UNLOCKED.has(badge.id)).length;
        return <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleWrap}>
              <View style={[s.categoryTile, { backgroundColor: `${CATEGORY_TINT[category]}${dark ? '2A' : '1C'}` }]}><Text style={s.categoryIcon}>{CATEGORY_ICONS[category]}</Text></View>
              <View style={{ flex: 1 }}><Text style={[s.sectionTitle, { color: text }]}>{category}</Text><Text numberOfLines={1} style={[s.sectionSub, { color: muted }]}>{CATEGORY_SUB[category]}</Text></View>
            </View>
            <View style={[s.countChip, { backgroundColor: dark ? '#252C3A' : '#EDEEF3' }]}><Text style={[s.sectionCount, { color: dark ? '#CBD5E1' : '#6B7188' }]}>{done}/{badges.length} Unlocked</Text></View>
          </View>
          <View style={s.grid}>{badges.map((badge) => <BadgeTile key={badge.id} badge={badge} width={tileWidth} dark={dark} unlocked={UNLOCKED.has(badge.id)} onPress={() => setSelected(badge)} />)}</View>
        </View>;
      }}
    />
    <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
      <Pressable style={s.sheetBackdrop} onPress={closeDetail}><Animated.View {...sheetPan.panHandlers} style={{ transform: [{ translateY: drag }] }}><Pressable style={[s.sheet, { backgroundColor: dark ? '#171B25' : '#FFFFFF', paddingBottom: 18 + bottomInset }]} onPress={() => {}}>
        <View style={[s.grabber, { backgroundColor: dark ? '#3A4254' : '#DAD7D2' }]} />
        <Pressable accessibilityLabel="Close achievement details" hitSlop={10} onPress={closeDetail} style={[s.close, { backgroundColor: dark ? '#252C3A' : '#EEF1F6' }]}><Icon name="close" size={15} exact color={dark ? '#A7B0C0' : '#64748B'} /></Pressable>
        {selected && (() => {
          const on = UNLOCKED.has(selected.id);
          const progress = on ? undefined : PROGRESS[selected.id];
          const action = BADGE_ACTION[selected.category];
          const rc = RARITY_COLOR[selected.rarity][dark ? 'dark' : 'light'];
          const doneTotal = on ? Number(selected.condition.match(/\d+/)?.[0] ?? NaN) || null : null;
          const tone = rarityTone(rc, dark);
          const left = progress ? progress[1] - progress[0] : 0;
          return <>
            <BadgeHero key={selected.id} source={badgeImageFor(selected.id)} hasArt={badgeHasArt(selected.id)} rarity={selected.rarity} on={on} inProgress={!!progress} dark={dark} accent={tone.accent} check={on} lock={!on && !progress} />
            <Text style={[s.sheetTitle, { color: dark ? '#F8FAFC' : '#141A33' }]}>{selected.title}</Text>
            <View style={s.chipRow}>
              <View style={[s.rarityChip, { backgroundColor: tone.chipBg, borderColor: tone.chipBorder }]}>{on ? <View style={[s.rarityStar, { backgroundColor: tone.accent }]}><Svg width={9} height={9} viewBox="0 0 24 24"><Path d="M12 2.500l2.900 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8Z" fill="#FFFFFF" /></Svg></View> : <View style={[s.rarityDot, { backgroundColor: tone.accent }]} />}<Text style={[s.rarityText, { color: tone.text }]}>{selected.rarity.toUpperCase()}</Text></View>
              {!on && !progress && <View style={[s.rarityChip, { backgroundColor: dark ? '#252C3A' : '#EEF0F6', borderColor: dark ? '#3A4254' : '#E1E4EE' }]}><Icon name="lock" size={11} exact color={dark ? '#CBD5E1' : '#475569'} /><Text style={[s.lockedChipText, { color: dark ? '#CBD5E1' : '#475569' }]}>Locked</Text></View>}
            </View>
            <Text style={[s.sheetDescription, { color: dark ? '#A7B0C0' : '#5B6477' }]}>{selected.description}</Text>
            {on ? <View style={[s.doneCard, { backgroundColor: tone.cardBg, borderColor: tone.cardBorder }]}>
              <View style={s.goalTop}>
                <View style={[s.trophyTile, { backgroundColor: tone.tile, borderColor: tone.tileBorder }]}><FilledTrophyIcon size={14} color={tone.tileIcon} /></View>
                <Text style={[s.doneText, { color: dark ? '#F8FAFC' : '#1E2438' }]} numberOfLines={2}>{selected.condition}</Text>
                {doneTotal !== null && <View style={[s.donePill, { backgroundColor: tone.pillBg }]}><Text style={[s.donePillText, { color: tone.pillText }]}>{doneTotal}/{doneTotal}</Text></View>}
              </View>
              <View style={[s.doneDivider, { backgroundColor: tone.divider }]} />
              <View style={s.doneFoot}><SealCheckIcon size={17} color="#3F9468" /><Text style={[s.doneDate, dark && { color: '#7BD3A5' }]}>Unlocked on {UNLOCK_DATE_FOR_TESTING}</Text><Text style={[s.doneEarned, { color: dark ? '#94A3B8' : '#6B7794' }]}>Earned with full mastery</Text></View>
            </View> : !on && !progress ? <View style={[s.reqCard, { backgroundColor: dark ? '#1C2231' : '#F8F9FC', borderColor: dark ? 'rgba(255,255,255,0.08)' : '#E6E8F0' }]}>
              <View style={[s.reqIcon, { backgroundColor: dark ? '#2A3040' : '#EAECF4' }]}><Icon name="check_circle" size={18} exact color={dark ? '#CBD5E1' : '#475569'} /></View>
              <View style={{ flex: 1 }}><Text style={[s.reqLabel, { color: muted }]}>REQUIREMENT</Text><Text style={[s.reqText, { color: text }]}>{selected.condition}</Text></View>
              <View style={[s.statusPill, { backgroundColor: dark ? '#252C3A' : '#E8EAF2' }]}><Text style={[s.statusText, { color: dark ? '#CBD5E1' : '#475569' }]}>Status: Not Started</Text></View>
            </View> : <ProgressCard key={selected.id} condition={selected.condition} value={progress![0]} total={progress![1]} left={left} dark={dark} text={text} muted={muted} />}
            {on && <Pressable onPress={() => setShowcased((list) => list.includes(selected.id) ? list.filter((id) => id !== selected.id) : list.length >= 3 ? list : [...list, selected.id])} style={[s.showcase, { backgroundColor: dark ? '#1F2440' : '#EFF1FD', borderColor: dark ? '#3A4378' : '#CDD2F4' }]}>
              <MedalIcon size={18} color={INDIGO} /><Text style={s.showcaseText}>{showcased.includes(selected.id) ? 'Showcased on Profile' : 'Showcase on Profile'} ({showcased.length}/3 slots used)</Text>
            </Pressable>}
            {!on && <Pressable onPress={() => { setSelected(null); onGoTab(selected.id === 'codedo-legend' ? 'learn' : action.tab); }} style={s.cta}><Text style={s.ctaText}>{selected.id === 'codedo-legend' ? 'Start Learning Journey' : action.label}</Text><Icon name="arrow_forward" size={18} exact color="#FFFFFF" /></Pressable>}
          </>;
        })()}
      </Pressable></Animated.View></Pressable>
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  toolbar: { position: 'absolute', left: 0, right: 0, height: TOOLBAR_H, zIndex: 25, elevation: 4, shadowColor: '#3A3226', shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  stickyShadow: { position: 'absolute', left: 0, right: 0, top: CHIPS_H, height: 12 },
  statusCover: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 30 },
  headerRow: { height: TOOLBAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8, paddingHorizontal: 12 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 6, shadowColor: '#3A3226', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  title: { flex: 1, fontFamily: FONT.outfit.b, fontSize: fz(21) },
  countPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, height: 34 },
  countDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6C63F0' },
  countText: { fontFamily: FONT.outfit.sb, fontSize: fz(14) },
  chipBar: { position: 'absolute', left: 0, right: 0, height: CHIPS_H, zIndex: 20, justifyContent: 'center' },
  chipScroll: { flexGrow: 0 },
  chips: { gap: 10, paddingHorizontal: 16, alignItems: 'center' },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 20, height: 40, alignItems: 'center', justifyContent: 'center' },
  chipOn: { shadowColor: INDIGO, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  chipText: { fontFamily: FONT.outfit.md, fontSize: fz(15) },
  content: { paddingHorizontal: 16 },
  section: { marginTop: 10, marginBottom: 14 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 2, gap: 8 },
  sectionTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { fontSize: fz(18) },
  sectionTitle: { fontFamily: FONT.outfit.b, fontSize: fz(18) },
  sectionSub: { fontFamily: FONT.body, fontSize: fz(12.5), marginTop: 1 },
  countChip: { borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' },
  sectionCount: { fontFamily: FONT.outfit.sb, fontSize: fz(12.5) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { borderRadius: 22, alignItems: 'center', paddingHorizontal: 8, paddingTop: 22, paddingBottom: 16 },
  tileClip: { ...StyleSheet.absoluteFill, borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  tileGlow: { position: 'absolute', width: 170, height: 170, top: -30, alignSelf: 'center' },
  statusDot: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#3E8E64', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  rarityPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, height: 24, marginTop: 8 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: FONT.outfit.b, fontSize: fz(10.5), letterSpacing: 0.8 },
  art: { width: 80, height: 80 },
  tileTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(13.5), lineHeight: fz(17), textAlign: 'center', marginTop: 10, minHeight: fz(17) },
  progressWrap: { alignSelf: 'stretch', alignItems: 'center', marginTop: 8, gap: 4 },
  track: { alignSelf: 'stretch', height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: INDIGO },
  progressText: { color: INDIGO, fontFamily: FONT.outfit.sb, fontSize: fz(11) },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.5)' },
  sheet: { overflow: 'hidden', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 14, alignItems: 'center' },
  grabber: { width: 38, height: 4, borderRadius: 2 },
  close: { position: 'absolute', zIndex: 5, elevation: 5, right: 20, top: 22, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { fontFamily: FONT.outfit.b, fontSize: fz(20), lineHeight: fz(26), marginTop: 2, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  rarityChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, borderWidth: 1.5, borderColor: 'transparent', paddingHorizontal: 12, height: 25 },
  lockedChipText: { fontFamily: FONT.outfit.sb, fontSize: fz(12) },
  reqCard: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: BW, borderRadius: 14, padding: 12, marginTop: 16 },
  reqIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  reqLabel: { fontFamily: FONT.outfit.b, fontSize: fz(10), letterSpacing: 0.6 },
  reqText: { fontFamily: FONT.outfit.sb, fontSize: fz(12), lineHeight: fz(16), marginTop: 2 },
  statusPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, maxWidth: 96 },
  statusText: { fontFamily: FONT.outfit.sb, fontSize: fz(10), textAlign: 'center' },
  rarityStar: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  rarityStarText: { color: '#FFFFFF', fontSize: 8, lineHeight: 10, includeFontPadding: false },
  doneCard: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, marginTop: 18, gap: 11 },
  trophyTile: { width: 27, height: 27, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  doneText: { flex: 1, fontFamily: FONT.outfit.sb, fontSize: fz(15), marginLeft: 3 },
  donePill: { borderRadius: 999, paddingHorizontal: 11, height: 20, justifyContent: 'center' },
  donePillText: { fontFamily: FONT.outfit.sb, fontSize: fz(12.5) },
  doneDivider: { height: BW },
  doneFoot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneDate: { flex: 1, color: '#235A41', fontFamily: FONT.outfit.sb, fontSize: fz(13.5) },
  doneEarned: { fontFamily: FONT.body, fontSize: fz(11.5), fontStyle: 'italic' },
  showcase: { alignSelf: 'stretch', height: 43, borderRadius: 16, borderWidth: 1, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  showcaseText: { color: INDIGO, fontFamily: FONT.outfit.sb, fontSize: fz(14) },
  rarityDot: { width: 6, height: 6, borderRadius: 3 },
  rarityText: { fontFamily: FONT.outfit.b, fontSize: fz(12), letterSpacing: 1.2 },
  sheetDescription: { fontFamily: FONT.body, fontSize: fz(13.5), lineHeight: fz(20), marginTop: 12, textAlign: 'center', paddingHorizontal: 6 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  cta: { alignSelf: 'stretch', height: 50, borderRadius: 14, backgroundColor: INDIGO, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: INDIGO, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  ctaText: { color: '#FFFFFF', fontFamily: FONT.outfit.sb, fontSize: fz(14) },
});
