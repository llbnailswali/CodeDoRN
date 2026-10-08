import React from 'react';
import { FlatList, LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { BW, Header, Icon, MAIN, fz, raisedShadows } from './shell';
import { hexAlpha, lh } from './parts';
import { CURRICULUM_WORLDS, CurriculumWorld } from './curriculumData';
import { ShadowStack } from './shadows';
import { FONT, Palette, mix } from './theme';

// The Curriculum screen a Home World opens (web: src/components/Listing.tsx): a strip of World pills, the World's hero card with its
// mastery progress, the lesson timeline, the boss challenge and a button to the next World. UI only, with sample progress.

const TOTAL_WORLDS_DONE = 16;

/** Sample progress: Worlds up to 16 are finished, World 17 is 4 lessons in, the rest have not been started. */
const completedFor = (order: number, total: number) => (order <= TOTAL_WORLDS_DONE ? total : order === TOTAL_WORLDS_DONE + 1 ? Math.min(4, total) : 0);

const tokens = (dark: boolean) => ({
  page: dark ? '#0B0F19' : '#F1F4F9',
  pageText: dark ? '#E2E8F0' : '#1E2433',
  surface: dark ? '#151B28' : '#FFFFFF',
  border: dark ? 'rgba(255,255,255,0.10)' : 'rgba(226,232,240,0.8)',
  muted: dark ? '#94A3B8' : '#475569',
  slate400: '#94A3B8',
  indigoText: dark ? '#818CF8' : '#4F46E5',
  cardShadow: dark ? [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.35 }] : [{ dy: 1, blur: 3, rgb: '0,0,0', alpha: 0.1 }],
});

/** The Kotlin logo: the web's SVG path with its purple-to-red gradient. */
function KotlinMark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="kt" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="0" y2="24">
          <Stop offset="0" stopColor="#7F52FF" />
          <Stop offset="0.5" stopColor="#C711E1" />
          <Stop offset="1" stopColor="#E4485D" />
        </LinearGradient>
      </Defs>
      <Path d="M24 24H0V0H24L12 12L24 24Z" fill="url(#kt)" />
    </Svg>
  );
}

const WorldPill = React.memo(function WorldPill({ world, selected, dark, onPress, onLayoutX }: { world: CurriculumWorld; selected: boolean; dark: boolean; onPress: () => void; onLayoutX: (x: number) => void }) {
  const t = tokens(dark);
  const avail = world.available;
  return (
    <View onLayout={(e) => onLayoutX(e.nativeEvent.layout.x)} style={{ opacity: avail ? 1 : 0.55 }}>
      <ShadowStack r={16} shadows={selected ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: dark ? 0.3 : 0.1 }] : t.cardShadow} />
      <Pressable
        disabled={!avail}
        onPress={onPress}
        style={[
          s.pill,
          selected
            ? dark
              ? { backgroundColor: 'rgba(30,27,75,0.7)', borderColor: '#6366F1' }
              : { backgroundColor: '#EEF2FF', borderColor: '#818CF8' }
            : dark
            ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' }
            : { backgroundColor: '#FFFFFF', borderColor: 'rgba(226,232,240,0.8)' },
        ]}
      >
        <View
          style={[
            s.pillNum,
            avail
              ? { backgroundColor: selected ? '#4F46E5' : '#059669' }
              : { backgroundColor: dark ? '#0F1420' : '#F1F5F9' },
          ]}
        >
          {avail ? (
            <Text style={s.pillNumText}>{world.order}</Text>
          ) : (
            <Icon name="lock" color={dark ? '#64748B' : '#94A3B8'} />
          )}
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text numberOfLines={1} style={[s.pillTitle, { color: selected ? (dark ? '#FFFFFF' : '#1E1B4B') : dark ? '#94A3B8' : '#475569', maxWidth: 130 }]}>{world.title}</Text>
          <Text style={[s.pillSub, { color: t.slate400 }]}>{avail ? `${world.lessonCount} lessons` : 'Coming soon'}</Text>
        </View>
      </Pressable>
    </View>
  );
});

const Hero = React.memo(function Hero({ world, completed, total, dark }: { world: CurriculumWorld; completed: number; total: number; dark: boolean }) {
  const t = tokens(dark);
  const pct = Math.round((completed / total) * 100);
  const fillPct = Math.max(pct, completed > 0 ? 5 : 0);
  return (
    <View style={{ marginBottom: 12 }}>
      <ShadowStack r={24} shadows={dark ? [{ dy: 8, blur: 12, rgb: '0,0,0', alpha: 0.1 }] : t.cardShadow} />
      <View style={[s.hero, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={[s.trackBadge, { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.10)' }, !dark && { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.10)' }]}>
          <KotlinMark />
          <Text style={[s.trackText, { color: t.pageText }]}>Kotlin Track</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={s.worldLabel}>World {world.order}</Text>
          <Text style={[s.heroTitle, { color: t.pageText }]}>{world.title}</Text>
          <Text style={[s.heroSub, { color: dark ? '#94A3B8' : '#475569' }]}>{world.subtitle}</Text>
        </View>
        {/* Mastery progress */}
        <View style={[s.mastery, dark ? { backgroundColor: '#0F1420', borderColor: 'rgba(255,255,255,0.05)' } : { backgroundColor: '#F0F3F8', borderColor: 'rgba(226,232,240,0.6)' }]}>
          <View style={s.masteryTop}>
            <Text style={[s.mastered, { color: t.indigoText }]}>{pct}% Mastered</Text>
            <View style={[s.lessonsPill, dark ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
              <View style={[s.dot, { backgroundColor: completed > 0 ? '#10B981' : dark ? '#334155' : '#CBD5E1' }]} />
              <Text style={[s.lessonsText, { color: dark ? '#CBD5E1' : '#334155' }]}>
                {completed}/{total} Lessons
              </Text>
            </View>
          </View>
          <View style={[s.track, { backgroundColor: dark ? '#090D16' : '#E2E8F0' }]}>
            <Svg width={`${fillPct}%`} height={4} style={{ borderRadius: 2 }}>
              <Defs>
                <LinearGradient id="mastery" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#10B981" />
                  <Stop offset="0.5" stopColor="#A855F7" />
                  <Stop offset="1" stopColor="#EC4899" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" rx="2" fill="url(#mastery)" />
            </Svg>
          </View>
        </View>
      </View>
    </View>
  );
});

const LessonRow = React.memo(function LessonRow({
  title, index, count, status, dark, onPress,
}: { title: string; index: number; count: number; status: 'completed' | 'current' | 'upcoming'; dark: boolean; onPress?: () => void }) {
  const t = tokens(dark);
  const first = index === 0;
  const last = index === count - 1;
  const completed = status === 'completed';
  const current = status === 'current';
  const upcoming = status === 'upcoming';
  // The stem is drawn in pieces, one per row, so it follows rows of any height; each piece runs through half the gap to the next one.
  const stemEnd = dark ? '#334155' : '#CBD5E1';
  const colorAt = (f: number) => (f < 0.5 ? mix('#6366F1', '#A855F7', f * 2) : mix('#A855F7', stemEnd, (f - 0.5) * 2));
  const c0 = colorAt(index / count);
  const c1 = colorAt((index + 1) / count);

  return (
    <View style={s.row}>
      <View style={[s.stem, { top: first ? '50%' : -9, bottom: last ? '50%' : -9 }]}>
        <Svg width={4} height="100%">
          <Defs>
            <LinearGradient id={`stem${index}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c0} />
              <Stop offset="1" stopColor={c1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="4" height="100%" fill={`url(#stem${index})`} />
        </Svg>
      </View>

      <View style={{ width: 36, height: 36 }}>
        {current && <View style={s.ring} />}
        <View
          style={[
            s.node,
            completed && { backgroundColor: '#4F46E5', borderColor: '#818CF8' },
            current && { backgroundColor: '#9333EA', borderColor: '#D8B4FE' },
            upcoming && (dark ? { backgroundColor: '#0F1420', borderColor: 'rgba(51,65,85,0.8)' } : { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }),
          ]}
        >
          <Icon name={completed ? 'check' : current ? 'play_arrow' : 'lock'} color={upcoming ? (dark ? '#64748B' : '#94A3B8') : '#FFFFFF'} />
        </View>
      </View>

      <Pressable onPress={onPress} style={{ flex: 1, opacity: upcoming ? 0.65 : 1 }}>
        <ShadowStack r={16} shadows={t.cardShadow} />
        <View
          style={[
            s.lessonCard,
            { backgroundColor: t.surface, borderColor: t.border },
            current && { borderColor: '#A855F7', borderWidth: 1.82 - 1 + BW },
          ]}
        >
          <Text style={[s.lessonTitle, { color: t.pageText }]}>{title}</Text>
          <View style={s.lessonFoot}>
            <View style={s.lessonFootLeft}>
              <Text style={[s.status, { color: completed ? '#10B981' : current ? '#6366F1' : dark ? '#94A3B8' : '#64748B' }]}>
                {completed ? 'Completed' : current ? 'Available Now' : 'Up Next'}
              </Text>
              <Text style={[s.bullet, { color: '#94A3B8' }]}>•</Text>
              <Text style={[s.action, { color: completed || current ? '#6366F1' : '#94A3B8' }]}>{completed ? 'Review' : 'Start'}</Text>
            </View>
            <Text style={[s.lessonNo, { color: '#94A3B8' }]}>Lesson {index + 1}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
});

const BossRow = React.memo(function BossRow({ title, dark, onPress }: { title: string; dark: boolean; onPress?: () => void }) {
  const t = tokens(dark);
  return (
    <View style={[s.row, { marginTop: 24 }]}>
      <View style={{ width: 36, height: 36 }}>
        <View style={[s.ring, { backgroundColor: 'rgba(245,158,11,0.25)' }]} />
        <View style={[s.node, { backgroundColor: '#F59E0B', borderColor: '#FCD34D' }]}>
          <Icon name="military_tech" color="#FFFFFF" />
        </View>
      </View>
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <ShadowStack r={16} shadows={t.cardShadow} />
        <View
          style={[
            s.lessonCard,
            { borderColor: dark ? '#F59E0B' : '#FBBF24', backgroundColor: dark ? '#1C1917' : '#FFFBEB' },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Icon name="military_tech" color="#F59E0B" />
            <Text style={s.bossLabel}>Boss Challenge</Text>
          </View>
          <Text style={[s.lessonTitle, { color: t.pageText }]}>{title}</Text>
          <Text style={[s.status, { color: '#F59E0B', marginTop: 6 }]}>Write & Run, then Debug — Begin</Text>
        </View>
      </Pressable>
    </View>
  );
});

export const CurriculumScreen = React.memo(function CurriculumScreen({
  p, worldOrder, topInset, onBack, onToggleTheme, onOpenLesson,
}: {
  p: Palette;
  worldOrder: number;
  topInset: number;
  onBack: () => void;
  onToggleTheme: () => void;
  onOpenLesson?: (worldOrder: number, title: string) => void;
}) {
  const dark = p.isDark;
  const t = tokens(dark);
  const [selected, setSelected] = React.useState(worldOrder);
  const world = CURRICULUM_WORLDS.find((w) => w.order === selected) ?? CURRICULUM_WORLDS[0];
  const next = CURRICULUM_WORLDS.find((w) => w.order === world.order + 1);
  const total = Math.max(1, world.lessons.length);
  const completed = completedFor(world.order, total);

  // Once the world strip has stuck to the top, the full toolbar collapses to just the back and theme buttons.
  const [stuck, setStuck] = React.useState(false);
  const onScroll = React.useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const next = e.nativeEvent.contentOffset.y > 12;
    setStuck((prev) => {
      if (prev === next) return prev;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return next;
    });
  }, []);

  const stripRef = React.useRef<FlatList<CurriculumWorld>>(null);
  const pillX = React.useRef<Record<number, number>>({});
  const scrollRef = React.useRef<FlatList<string>>(null);
  // Bring the selected pill into view, like the web's scrollToActiveWorld.
  React.useEffect(() => {
    const id = setTimeout(() => stripRef.current?.scrollToOffset({ offset: Math.max(0, (pillX.current[selected] ?? 0) - 16), animated: true }), 80);
    return () => clearTimeout(id);
  }, [selected]);

  return (
    <View style={{ flex: 1, backgroundColor: t.page }}>
      {stuck ? (
        <View style={{ paddingTop: topInset, backgroundColor: t.page, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 6, zIndex: 10 }}>
          <View style={{ paddingTop: 6 }}>
            <ShadowStack r={10} shadows={raisedShadows(dark)} />
            <Pressable onPress={onBack} accessibilityLabel="Back" style={[s.compactBtn, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
              <Icon name="arrow_back" size={20} color={dark ? '#E2E8F0' : '#1E2433'} />
            </Pressable>
          </View>
          <View style={{ paddingTop: 6 }}>
            <ShadowStack r={10} shadows={raisedShadows(dark)} />
            <Pressable onPress={onToggleTheme} accessibilityLabel="Toggle theme" style={[s.compactBtn, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
              <Icon name={dark ? 'light_mode' : 'dark_mode'} size={17} color={dark ? '#FBBF24' : '#475569'} />
            </Pressable>
          </View>
        </View>
      ) : (
        <Header p={{ ...p, page: t.page }} title="Curriculumm" onBack={onBack} onToggleTheme={onToggleTheme} topInset={topInset} showGap={false} />
      )}
      <FlatList
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[0]}
        data={world.lessons}
        keyExtractor={(title, index) => `${world.order}-${index}-${title}`}
        renderItem={({ item: title, index }) => (
          <View style={{ paddingHorizontal: 16 }}>
            {index === 0 && <View style={{ marginBottom: 16 }}><Hero world={world} completed={completed} total={total} dark={dark} /></View>}
            <LessonRow
              title={title}
              index={index}
              count={world.lessons.length}
              status={index < completed ? 'completed' : index === completed && completed < total ? 'current' : 'upcoming'}
              dark={dark}
              onPress={() => onOpenLesson?.(world.order, title)}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <>
            <View style={{ paddingTop: 4, paddingBottom: 4, backgroundColor: t.page }}>
              <FlatList
                ref={stripRef}
                horizontal
                data={CURRICULUM_WORLDS}
                keyExtractor={(item) => String(item.order)}
                renderItem={({ item: w }) => (
                  <View style={{ marginRight: 8 }}>
                    <WorldPill world={w} selected={w.order === selected} dark={dark} onPress={() => setSelected(w.order)} onLayoutX={(x) => { pillX.current[w.order] = x; }} />
                  </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={5}
                windowSize={3}
                removeClippedSubviews
              />
            </View>
          </>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16 }}>
            {world.boss && <BossRow title={world.boss} dark={dark} onPress={() => onOpenLesson?.(world.order, world.boss as string)} />}
            {next && (
              <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16 }}>
                <View style={{ opacity: next.available ? 1 : 0.55 }}>
                  <ShadowStack r={999} shadows={dark ? [{ dy: 4, blur: 6, rgb: '0,0,0', alpha: 0.3 }] : t.cardShadow} />
                  <Pressable disabled={!next.available} onPress={() => { setSelected(next.order); scrollRef.current?.scrollToOffset({ offset: 0, animated: true }); }} style={[s.nextBtn, { backgroundColor: t.surface, borderColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' }]}>
                    <Icon name={next.available ? 'explore' : 'lock'} color="#6366F1" />
                    <Text style={[s.nextText, { color: dark ? '#CBD5E1' : '#334155' }]}>{next.available ? `WORLD ${next.order} • ${next.title}` : `WORLD ${next.order} • COMING SOON`}</Text>
                    <Icon name="chevron_right" color={dark ? '#CBD5E1' : '#334155'} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
});

const s = StyleSheet.create({
  compactBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: BW },
  pillNum: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pillNumText: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), color: '#FFFFFF', includeFontPadding: false },
  pillTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  pillSub: { fontFamily: FONT.body, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  // hero
  hero: { borderRadius: 24, borderWidth: BW, padding: 20 },
  trackBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: BW, marginBottom: 12 },
  trackText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, textTransform: 'uppercase', includeFontPadding: false },
  worldLabel: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), letterSpacing: 0.1 * 12 * MAIN, textTransform: 'uppercase', color: '#6366F1', includeFontPadding: false },
  heroTitle: { fontFamily: FONT.outfit.b, fontSize: fz(24 * MAIN), lineHeight: lh(24, 1.3333), letterSpacing: -0.025 * 24 * MAIN, includeFontPadding: false },
  heroSub: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), marginTop: 4, includeFontPadding: false },
  mastery: { borderRadius: 16, borderWidth: BW, padding: 16 },
  masteryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  mastered: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), letterSpacing: 0.025 * 12 * MAIN, textTransform: 'uppercase', includeFontPadding: false },
  lessonsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: BW },
  dot: { width: 6, height: 6, borderRadius: 3 },
  lessonsText: { fontFamily: FONT.mono.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  track: { height: 8, borderRadius: 4, padding: 2, overflow: 'hidden' },
  // timeline
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stem: { position: 'absolute', left: 16, width: 4 },
  node: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.82, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', left: -4, top: -4, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(168,85,247,0.25)' },
  lessonCard: { borderRadius: 16, borderWidth: BW, padding: 14 },
  lessonTitle: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.4286), includeFontPadding: false },
  lessonFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  lessonFootLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: { fontFamily: FONT.outfit.sb, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  bullet: { fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  action: { fontFamily: FONT.outfit.b, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  lessonNo: { fontFamily: FONT.mono.sb, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), includeFontPadding: false },
  bossLabel: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.1 * 10 * MAIN, textTransform: 'uppercase', color: '#F59E0B', includeFontPadding: false },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: BW },
  nextText: { fontFamily: FONT.outfit.b, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, includeFontPadding: false },
});
