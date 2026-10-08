import React from 'react';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BW, Icon, MAIN, fz, pressedShadows, raisedShadows } from './shell';
import { HOME_WORLDS } from './homeData';
import { EdgeGlow, InsetShadow, ShadowStack } from './shadows';
import { DEVICE_PATH_STYLE, buildTrail, getPathStyle, nodeDrift, nodeInset } from './pathStyles';
import type { JourneyVariant } from './App';
import {
  DARK, FAMILIES, FONT, INDIGO_400, INDIGO_500, LIGHT, Palette, VIOLET_500, WORLD_FAMILY, WORLD_ICONS,
  grayscale, mix, withAlpha,
} from './theme';

// The Learn tab's Home, rebuilt in React Native to look like the web Home (src/components/Home.tsx, Header.tsx,
// Navigation.tsx). Sizes are the web's CSS pixels (dp): Tailwind `p-3.5` is 14, `gap-2.5` is 10, and so on.
// Progress starts at World 1 until real lesson completion state is recorded.
const COMPLETED_WORLDS = 0;
const TOTAL_WORLDS = 22;
// Match the web's progression rule: only the current world is available until earlier worlds are completed.
const UNLOCK_ALL = false;
const UNLOCK_THROUGH = 17;
const SHOW_LEVEL_STRIPS = true;
// Height of a world node's text column in the web (chip 19.96 + title 19.35 + 2 + tag 19.96), so every row has the web's exact stride.
const NODE_COLUMN = 61.27;
const CURRENT_CARD_HEIGHT = 160.6;

// ---------------------------------------------------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------------------------------------------------

/** The Kotlin logo of the Journey chip: two triangles (the web draws them as SVG polygons). */
function KotlinLogo() {
  const SIZE = 14;
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View
        style={{
          position: 'absolute', left: 0, top: 0, width: 0, height: 0,
          borderTopWidth: SIZE, borderRightWidth: SIZE, borderTopColor: '#B22BE4', borderRightColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute', left: 0, bottom: 0, width: 0, height: 0,
          borderLeftWidth: SIZE / 2, borderRightWidth: SIZE / 2, borderBottomWidth: SIZE / 2,
          borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#7F52FF',
          marginLeft: 0, transform: [{ translateX: 0 }],
        }}
      />
    </View>
  );
}

/** A horizontal gradient from stepped colours. Slices overlap by 1px so no seams show between them (a flex row leaves hairlines). */
function GradientBar({ colors, style, radius }: { colors: string[]; style?: object; radius: number }) {
  const [w, setW] = React.useState(0);
  const step = w / colors.length;
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 &&
        colors.map((c, i) => (
          <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: i * step, width: step + 1, backgroundColor: c }} />
        ))}
    </View>
  );
}

const channelsOf = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rampColors = (stops: string[], slices: number): string[] =>
  Array.from({ length: slices }, (_, i) => {
    const t = i / Math.max(1, slices - 1);
    const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
    const local = t * (stops.length - 1) - seg;
    const a = channelsOf(stops[seg]);
    const b = channelsOf(stops[seg + 1]);
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * local)).join(',')})`;
  });

const INDIGO_PURPLE_PINK = rampColors(['#6366F1', '#A855F7', '#EC4899'], 32);
const INDIGO_VIOLET = rampColors(['#6366F1', '#8B5CF6'], 32);

// ---------------------------------------------------------------------------------------------------------------------
// Kotlin Journey card
// ---------------------------------------------------------------------------------------------------------------------

function JourneyCard({ p, current, completed }: { p: Palette; current: (typeof HOME_WORLDS)[number]; completed: number }) {
  const pct = ((completed / TOTAL_WORLDS) * 100).toFixed(1);
  return (
    <View style={s.journeyWrap}>
      <View>
      <ShadowStack r={16} shadows={raisedShadows(p.isDark)} />
      <View style={[s.journeyCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
        <View style={s.journeyTop}>
          <View style={[s.kotlinChip, { backgroundColor: p.chipBg, borderColor: p.chipBorder }]}>
            <KotlinLogo />
            <Text style={[s.kotlinChipText, { color: p.chipText }]}>KOTLIN JOURNEY dcdc</Text>
          </View>
          <View style={[s.progressBtn, { backgroundColor: p.pressed, borderColor: p.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(226,232,240,0.8)', overflow: 'hidden' }]}>
            <InsetShadow r={12} shadows={pressedShadows(p.isDark)} />
            <Text style={[s.progressLabel, { color: p.isDark ? INDIGO_400 : '#4F46E5' }]}>PROGRESS</Text>
            <Text style={[s.progressValue, { color: p.cardText }]}>{pct}%</Text>
            <Icon name="chevron_right" size={13} color="#94A3B8" />
          </View>
        </View>
        <View style={{ paddingTop: 2 }}>
          <Text numberOfLines={1} style={[s.journeyTitle, { color: p.cardText }]}>
            World {current.order} of {TOTAL_WORLDS} • {current.title}
          </Text>
        </View>
        <View style={[s.bar, { backgroundColor: p.barTrack }, !p.isDark && { borderWidth: BW, borderColor: 'rgba(226,232,240,0.6)' }]}>
          <GradientBar colors={INDIGO_PURPLE_PINK} radius={3} style={{ height: 6, width: `${Math.max(Number(pct), 4)}%` }} />
        </View>
      </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Chapter bands
// ---------------------------------------------------------------------------------------------------------------------

type ChapterTone = { fam: 'indigo' | 'purple' | 'rose'; bandActive: string; bandIdle: string; borderActive: string; borderIdle: string };

function bandColors(p: Palette, chapter: 1 | 2 | 3, active: boolean) {
  const tone = chapter === 1 ? 'indigo' : chapter === 2 ? 'purple' : 'rose';
  const f = { indigo: FAMILIES.indigo, purple: FAMILIES.purple, rose: FAMILIES.rose }[tone];
  if (p.isDark) {
    return {
      bg: withAlpha(f.c950, active ? (chapter === 1 ? 0.55 : 0.6) : 0.25),
      border: withAlpha(f.c400, active ? 0.35 : chapter === 1 ? 0.15 : 0.15),
      chipText: active ? mix(f.c200, f.c200, 0) : f.c400,
      chipBg: withAlpha(f.c500, active ? 0.2 : 0.1),
      chipBorder: withAlpha(f.c400, active ? 0.4 : 0.3),
      active: chapter === 1 ? '#A5B4FC' : chapter === 2 ? '#D8B4FE' : '#FDA4AF',
      line: 'rgba(255,255,255,0.10)',
    };
  }
  return {
    bg: active ? 'rgba(255,255,255,0.95)' : 'rgba(236,238,244,0.95)',
    border: active ? f.c200 : 'rgba(203,213,225,0.8)',
    chipText: chapter === 1 ? '#3730A3' : chapter === 2 ? '#6B21A8' : '#9F1239',
    chipBg: active ? f.c50 : '#FFFFFF',
    chipBorder: active ? (chapter === 1 ? '#A5B4FC' : chapter === 2 ? '#D8B4FE' : '#FDA4AF') : f.c200,
    active: f.c700,
    line: active ? f.c200 : 'rgba(203,213,225,0.8)',
  };
}

function Band({ p, chapter, label, active, topBorder, blurred, onLayout }: { p: Palette; chapter: 1 | 2 | 3; label: string; active: boolean; topBorder: boolean; blurred: boolean; onLayout?: (chapter: 1 | 2 | 3, y: number) => void }) {
  if (!SHOW_LEVEL_STRIPS) return null;
  const c = bandColors(p, chapter, active);
  const rgb = chapter === 1 ? '99,102,241' : chapter === 2 ? '168,85,247' : '244,63,94';
  // The strip's elevation: a glow in the strip's own colour (indigo / purple / rose) cast onto what is below it. The web uses
  // shadow-[0_4px_18px_rgba(rgb,.22)] when active; it is stronger here because RN has no backdrop to catch the light.
  const glow = p.isDark
    ? { alpha: active ? 0.55 : 0.32, blur: active ? 26 : 22, offset: active ? 7 : 5 }
    : { alpha: active ? 0.3 : 0.16, blur: 24, offset: 6 };
  return (
    <View onLayout={(e) => onLayout?.(chapter, e.nativeEvent.layout.y)}>
      <View pointerEvents="none">
        <EdgeGlow rgb={rgb} alpha={glow.alpha} blur={glow.blur} offset={glow.offset} />
      </View>
      <View style={{ borderBottomWidth: BW, borderTopWidth: topBorder ? BW : 0, borderColor: 'transparent' }}>
        {/* Blur and tint reach out under the 1px borders too, so nothing scrolling behind shows through a gap at the edge; the border
            lines are drawn on top of them. The library's own overlayColor would paint over everything around the band, so the tint is a plain View. */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: topBorder ? -BW : 0, bottom: -BW, overflow: 'hidden' }}
        >
          <BlurView style={StyleSheet.absoluteFill} blurType={p.isDark ? 'dark' : 'light'} blurRadius={20} overlayColor="transparent" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]} />
        </View>
        {topBorder && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: -BW, height: BW, backgroundColor: c.border }} />}
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -BW, height: BW, backgroundColor: c.border }} />
        <View style={s.bandInner}>
          <View>
            {active && p.isDark && <ShadowStack r={999} shadows={[{ blur: 12, rgb, alpha: 0.2 }]} />}
            <View style={[s.bandChip, { backgroundColor: c.chipBg, borderColor: c.chipBorder }]}>
              <Text style={[s.bandText, { color: c.chipText }]}>
                {label}
                {active ? <Text style={[s.bandActive, { color: c.active }]}>{'  ACTIVE'}</Text> : null}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// World nodes
// ---------------------------------------------------------------------------------------------------------------------

type WorldActivity = 'quiz' | 'writeRun' | 'debug';
type ActivityPosition = 'midLeft' | 'center' | 'midRight';

type Anchors = {
  box: (order: number) => (el: View | null) => void;
  top: (order: number) => (el: View | null) => void;
  activity: (order: number, activity: WorldActivity) => (el: View | null) => void;
};

const WORLD_ACTIVITIES: Array<{ id: WorldActivity; label: string; icon: string; dark: string; light: string }> = [
  { id: 'quiz', label: 'Quiz', icon: 'psychology', dark: '#C4B5FD', light: '#6D28D9' },
  { id: 'writeRun', label: 'Write & Run', icon: 'code', dark: '#7DD3FC', light: '#0369A1' },
  { id: 'debug', label: 'Debug Problems', icon: 'bug_report', dark: '#FDBA74', light: '#C2410C' },
];

/** A small illustrated brain, used instead of a Material-symbol glyph for Quiz. */
function BrainArtwork({ size }: { size: number }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32">
    <Defs><LinearGradient id="brainFill" x1="4" y1="3" x2="27" y2="29"><Stop offset="0" stopColor="#A78BFA" /><Stop offset="1" stopColor="#5141B8" /></LinearGradient></Defs>
    <Path d="M15.7 5.1C12 3.1 7.4 4.8 6.4 8.5c-2.2 1.1-3.3 3.8-2.3 6.1-1.3 2.6-.1 5.9 2.6 7 1.1 3.8 5.9 5.1 9 2.6V5.1Zm.6 0c3.7-2 8.3-.3 9.3 3.4 2.2 1.1 3.3 3.8 2.3 6.1 1.3 2.6.1 5.9-2.6 7-1.1 3.8-5.9 5.1-9 2.6V5.1Z" fill="url(#brainFill)" />
    <Path d="M15.9 8v16M10.1 9.4c2.1-.8 3.7.2 3.8 2.1M7.9 14.1c2.6-1.1 4.8.2 4.5 2.4M9.5 19.1c2.5-1.1 4.5.2 4.2 2.4M21.9 9.4c-2.1-.8-3.7.2-3.8 2.1M24.1 14.1c-2.6-1.1-4.8.2-4.5 2.4M22.5 19.1c-2.5-1.1-4.5.2-4.2 2.4" stroke="#F5F3FF" strokeWidth="1.45" strokeLinecap="round" fill="none" opacity=".9" />
  </Svg>;
}

const ActivityArtwork = ({ activity, locked, size, color }: { activity: WorldActivity; locked: boolean; size: number; color: string }) =>
  locked ? <Icon name="lock" size={size} exact color={color} /> : activity === 'quiz' ? <BrainArtwork size={size} /> : <Icon name={WORLD_ACTIVITIES.find((item) => item.id === activity)!.icon} size={size} exact color={color} />;

// Every activity is a true milestone: the same curved ribbon runs from a World
// through Quiz, Write & Run, and Debug before continuing to the next World.
const worldPointIndex = (order: number) => 1 + (order - 1) * (WORLD_ACTIVITIES.length + 1);
const activityPointIndex = (order: number, activityIndex: number) => worldPointIndex(order) + activityIndex + 1;
const TOTAL_PATH_POINTS = 1 + TOTAL_WORLDS * (WORLD_ACTIVITIES.length + 1);

function ActivityNode({ p, order, activity, position, locked, count, anchors, onOpen, shape = 'square' }: {
  shape?: 'square' | 'circle' | 'diamond' | 'pill';
  p: Palette;
  order: number;
  activity: (typeof WORLD_ACTIVITIES)[number];
  position: ActivityPosition;
  locked: boolean;
  count: number;
  anchors: Anchors;
  onOpen?: (order: number, activity: WorldActivity) => void;
}) {
  // Chips follow their world: only a locked world disables them (an empty count does not).
  const enabled = !locked;
  const accent = p.isDark ? activity.dark : activity.light;
  const placement = position === 'midLeft'
    ? { justifyContent: 'flex-start' as const, paddingLeft: 96 }
    : position === 'midRight'
      ? { justifyContent: 'flex-end' as const, paddingRight: 96 }
      : { justifyContent: 'center' as const };
  const box = enabled
    ? {
        backgroundColor: p.isDark ? '#161D2C' : 'rgba(238,242,255,0.9)',
        borderColor: p.isDark ? withAlpha(accent, 0.5) : accent,
        icon: accent,
      }
    : {
        backgroundColor: p.isDark ? '#161D2C' : 'rgba(238,242,255,0.9)',
        borderColor: p.isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.38)',
        icon: p.muted,
      };

  return (
    <View style={[s.activityNodeRow, placement]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${activity.label}, ${count} activities, World ${order}${enabled ? '' : locked ? ', locked' : ', coming soon'}`}
        accessibilityState={{ disabled: !enabled }}
        disabled={!enabled}
        onPress={() => onOpen?.(order, activity.id)}
        android_ripple={{ color: withAlpha(accent, 0.22), foreground: true }}
        style={[s.activityNodePressable, { opacity: locked ? 0.58 : 1 }]}
      >
        <View
          ref={anchors.activity(order, activity.id)}
          collapsable={false}
          style={[
            shape === 'diamond'
              ? s.activityDiamondBox
              : [s.activityNodeBox, { backgroundColor: box.backgroundColor, borderColor: box.borderColor }],
            shape === 'circle' && { borderRadius: 19 },
            shape === 'pill' && { width: 'auto', minWidth: 92, paddingHorizontal: 12, borderRadius: 19, flexDirection: 'row', gap: 5 },
          ]}
        >
          {shape === 'diamond' && (
            <View style={[s.activityDiamondShape, { backgroundColor: box.backgroundColor, borderColor: box.borderColor }]} />
          )}
          <ActivityArtwork activity={activity.id} locked={locked} size={shape === 'diamond' ? 21 : 24} color={box.icon} />
          {shape === 'pill' && <Text style={{ color: box.icon, fontFamily: FONT.jakarta.b, fontSize: fz(11), includeFontPadding: false }}>{activity.id === 'quiz' ? 'Quiz' : activity.id === 'writeRun' ? 'Write' : 'Debug'}</Text>}
          <View style={[s.activityCountBadge, { backgroundColor: enabled ? accent : p.muted }]}>
            <Text style={[s.activityCountText, { color: p.isDark ? '#0F172A' : '#FFFFFF' }]}>{count}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function WorldChip({ p, text, state, family }: { p: Palette; text: string; state: 'done' | 'locked' | 'current' | 'available'; family?: string }) {
  void family;
  let bg: string;
  let border: string;
  let color: string;
  if (state === 'done') {
    bg = p.isDark ? 'rgba(16,185,129,0.20)' : '#D1FAE5';
    border = p.isDark ? 'rgba(16,185,129,0.40)' : '#6EE7B7';
    color = p.isDark ? '#6EE7B7' : '#065F46';
  } else if (state === 'available') {
    bg = p.isDark ? 'rgba(99,102,241,0.20)' : '#EEF2FF';
    border = p.isDark ? 'rgba(129,140,248,0.35)' : '#C7D2FE';
    color = p.isDark ? '#C7D2FE' : '#3730A3';
  } else if (state === 'current') {
    bg = p.isDark ? 'rgba(99,102,241,0.25)' : '#E0E7FF';
    border = p.isDark ? 'rgba(129,140,248,0.50)' : '#A5B4FC';
    color = p.isDark ? '#C7D2FE' : '#3730A3';
  } else {
    bg = p.isDark ? 'rgba(30,41,59,0.8)' : '#FFFFFF';
    border = p.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.8)';
    color = p.isDark ? '#CBD5E1' : '#334155';
  }
  return (
    <View style={[s.worldChip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[s.worldChipText, { color }]}>{text}</Text>
    </View>
  );
}

function nodeBoxColors(p: Palette, order: number, kind: 'done' | 'locked' | 'current' | 'available') {
  const f = FAMILIES[WORLD_FAMILY[order - 1]];
  const gray = (hex: string) => grayscale(hex, 0.35);
  if (kind === 'done') {
    return p.isDark
      ? { bg: p.card, border: 'rgba(16,185,129,0.40)', bw: BW, icon: '#34D399' }
      : { bg: 'rgba(236,253,245,0.95)', border: 'rgba(110,231,183,0.9)', bw: 1.82, icon: '#047857' };
  }
  if (kind === 'available') {
    return p.isDark
      ? { bg: '#161D2C', border: 'rgba(99,102,241,0.50)', bw: 1.82, icon: '#818CF8' }
      : { bg: 'rgba(238,242,255,0.9)', border: '#818CF8', bw: 1.82, icon: '#4338CA' };
  }
  if (kind === 'current') {
    return p.isDark
      ? { bg: '#182030', border: '#6366F1', bw: 1.82, icon: '#A5B4FC' }
      : { bg: '#4F46E5', border: '#818CF8', bw: 1.82, icon: '#FFFFFF' };
  }
  return p.isDark
    ? { bg: withAlpha(gray(f.c950), 0.4), border: withAlpha(gray(f.c500), 0.3), bw: BW, icon: withAlpha(gray(f.c400), 0.8) }
    : { bg: withAlpha(gray(f.c50), 0.9), border: withAlpha(gray(f.c200), 0.9), bw: BW, icon: withAlpha(gray(f.c700), 0.8) };
}

function StandardNode({
  p, world, align, paddingTop, gap, pathStyle, completed, anchors, onOpenWorld,
}: {
  p: Palette;
  world: (typeof HOME_WORLDS)[number];
  align: 'left' | 'right';
  paddingTop: number;
  gap: number;
  pathStyle: ReturnType<typeof getPathStyle>;
  completed: number;
  anchors: Anchors;
  onOpenWorld?: (order: number) => void;
}) {
  const left = align === 'left';
  const done = world.order <= completed;
  const locked = !UNLOCK_ALL && world.order > UNLOCK_THROUGH;
  const available = !done && !locked;
  const kind: 'done' | 'locked' | 'available' = done ? 'done' : locked ? 'locked' : 'available';
  const c = nodeBoxColors(p, world.order, kind);
  const inset = nodeInset(pathStyle, world.order);
  const drift = nodeDrift(pathStyle, world.order);
  const iconName = locked ? 'lock' : WORLD_ICONS[world.order - 1];

  return (
    <View
      style={{
        width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: left ? 'flex-start' : 'flex-end',
        paddingTop, height: paddingTop + NODE_COLUMN, marginTop: gap + drift, paddingLeft: left ? inset : 0, paddingRight: left ? 0 : inset,
      }}
    >
      <Pressable
        onPress={() => { if (!locked && world.order <= 17) onOpenWorld?.(world.order); }}
        android_ripple={{ color: p.isDark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.45)', borderless: false, foreground: true }}
        style={{ flexDirection: left ? 'row' : 'row-reverse', alignItems: 'center', gap: 10, opacity: locked ? 0.65 : 1, borderRadius: 12, overflow: 'hidden' }}
      >
        <View
          ref={anchors.box(world.order)}
          collapsable={false}
          style={[s.nodeBox, { backgroundColor: c.bg, borderColor: c.border, borderWidth: c.bw }]}
        >
          <Icon name={iconName} size={20} color={c.icon} />
        </View>
        <View style={{ alignItems: left ? 'flex-start' : 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <WorldChip p={p} text={`World ${String(world.order).padStart(2, '0')}`} state={done ? 'done' : locked ? 'locked' : 'available'} />
            {available && (
              <View
                style={[
                  s.availableBadge,
                  p.isDark
                    ? { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.25)' }
                    : { backgroundColor: '#ECFDF5', borderColor: 'rgba(110,231,183,0.6)' },
                ]}
              >
                <Text style={[s.availableBadgeText, { color: p.isDark ? '#6EE7B7' : '#047857' }]}>AVAILABLE</Text>
              </View>
            )}
          </View>
          <Text
           
            style={[
              s.worldTitle,
              locked ? { color: p.titleLocked, fontFamily: FONT.outfit.sb } : { color: p.title, fontFamily: FONT.outfit.b },
            ]}
          >
            {world.title}
          </Text>
          <View style={[s.lessonTag, { backgroundColor: p.tagBg, borderColor: p.tagBorder }]}>
            <Text style={[s.lessonTagText, { color: p.tagText }]}>{world.lessons} lessons</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function CurrentCard({ p, world, paddingTop, gap, anchors, onOpenWorld }: { p: Palette; world: (typeof HOME_WORLDS)[number]; paddingTop: number; gap: number; anchors: Anchors; onOpenWorld?: (order: number) => void }) {
  return (
    <View style={{ width: '100%', alignItems: 'center', paddingTop, paddingBottom: 16, marginTop: gap }}>
      <View style={{ width: '100%', maxWidth: 320 }}>
      <ShadowStack
        r={16}
        shadows={p.isDark ? [{ blur: 16, rgb: '99,102,241', alpha: 0.2 }, ...raisedShadows(true)] : raisedShadows(false)}
      />
      <View
        ref={anchors.top(world.order)}
        collapsable={false}
        style={[
          s.currentCard,
          p.isDark
            ? { backgroundColor: p.card, borderColor: 'rgba(255,255,255,0.06)' }
            : { backgroundColor: '#FFFFFF', borderColor: 'rgba(226,232,240,0.9)' },
        ]}
      >
        <View style={s.currentTop}>
          <View
            style={[
              s.currentChip,
              p.isDark
                ? { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.30)' }
                : { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
            ]}
          >
            <Text style={[s.currentChipText, { color: p.isDark ? '#A5B4FC' : '#4338CA' }]}>CURRENT WORLD</Text>
          </View>
          <Text style={[s.currentLessons, { color: p.isDark ? INDIGO_400 : '#4F46E5' }]}>0 / {world.lessons} lessons</Text>
        </View>
        <View>
          <Text style={[s.currentTitle, { color: p.cardText }]}>
            World {String(world.order).padStart(2, '0')} · {world.title}
          </Text>
          <Text style={[s.currentSub, { color: p.isDark ? '#CBD5E1' : '#334155' }]}>
            Continue your journey through {world.title}.
          </Text>
        </View>
      <Pressable style={[s.cta, { overflow: 'hidden' }]} onPress={() => onOpenWorld?.(world.order)} android_ripple={{ color: p.isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.12)', foreground: true }}>
          <GradientBar colors={INDIGO_VIOLET} radius={12} style={StyleSheet.absoluteFill as object} />
          <View style={s.ctaContent}>
            <Text style={s.ctaText}>START WORLD {world.order}</Text>
            <Icon name="arrow_forward" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
      </View>
    </View>
  );
}

function BossNode({ p, world, completed, anchors, onOpenWorld }: { p: Palette; world: (typeof HOME_WORLDS)[number]; completed: number; anchors: Anchors; onOpenWorld?: (order: number) => void }) {
  const unlocked = UNLOCK_ALL || world.order <= UNLOCK_THROUGH;
  const done = completed >= 15;
  const f = FAMILIES.violet;
  const gray = (hex: string) => grayscale(hex, 0.35);
  const box = done
    ? p.isDark
      ? { bg: p.card, border: 'rgba(16,185,129,0.40)', icon: '#34D399' }
      : { bg: 'rgba(236,253,245,0.95)', border: 'rgba(110,231,183,0.9)', icon: '#047857' }
    : p.isDark
    ? { bg: withAlpha(gray(f.c950), unlocked ? 0.4 : 0.3), border: withAlpha(gray(f.c500), 0.3), icon: withAlpha(gray(f.c400), unlocked ? 1 : 0.8) }
    : { bg: withAlpha(gray(f.c50), 0.9), border: withAlpha(gray(f.c200), 0.9), icon: withAlpha(gray(f.c700), unlocked ? 1 : 0.8) };
  return (
    <View style={{ width: '100%', alignItems: 'center', paddingTop: 44 }}>
      <Pressable onPress={() => { if (unlocked) onOpenWorld?.(world.order); }} android_ripple={{ color: p.isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.12)', foreground: true }} style={{ alignItems: 'center', opacity: unlocked ? 1 : 0.65, borderRadius: 16, overflow: 'hidden' }}>
        <View ref={anchors.box(world.order)} collapsable={false} style={[s.bossBox, { backgroundColor: box.bg, borderColor: box.border }]}>
          <Icon name={unlocked ? WORLD_ICONS[14] : 'lock'} size={22} color={box.icon} />
        </View>
        <View style={{ marginTop: 4 }}>
          <WorldChip p={p} text="World 15" state={done ? 'done' : 'locked'} />
        </View>
        <Text
         
          style={[s.worldTitle, !unlocked ? { color: p.titleLocked, fontFamily: FONT.outfit.sb } : { color: p.title, fontFamily: FONT.outfit.b }]}
        >
          {world.title}
        </Text>
        <View style={[s.lessonTag, { backgroundColor: p.tagBg, borderColor: p.tagBorder }]}>
          <Text style={[s.lessonTagText, { color: p.tagText }]}>{world.lessons} lessons</Text>
        </View>
      </Pressable>
    </View>
  );
}

function FinalCard({ p, world, completed, anchors }: { p: Palette; world: (typeof HOME_WORLDS)[number]; completed: number; anchors: Anchors }) {
  const open = UNLOCK_ALL || completed >= 21;
  const d = p.isDark;
  return (
    <View style={{ width: '100%', maxWidth: 330, paddingTop: 48, paddingBottom: 16, alignItems: 'center', alignSelf: 'center' }}>
      <View
        ref={anchors.top(world.order)}
        collapsable={false}
        style={[
          s.finalCard,
          open
            ? d
              ? { backgroundColor: '#1E243A', borderColor: '#6366F1', elevation: 6, shadowColor: '#6366F1' }
              : { backgroundColor: '#FFFFFF', borderColor: '#6366F1' }
            : d
            ? { backgroundColor: 'rgba(21,27,40,0.8)', borderColor: 'rgba(51,65,85,0.6)', opacity: 0.65 }
            : { backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'rgba(203,213,225,0.8)', opacity: 0.65 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={[
              s.finalIcon,
              open
                ? d
                  ? { backgroundColor: p.pressed, borderColor: 'rgba(99,102,241,0.30)' }
                  : { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }
                : d
                ? { backgroundColor: p.pressed, borderColor: 'rgba(51,65,85,0.6)' }
                : { backgroundColor: '#F1F5F9', borderColor: 'rgba(203,213,225,0.8)' },
            ]}
          >
            <Icon name={open ? 'military_tech' : 'lock'} size={24} color={open ? (d ? '#818CF8' : '#4F46E5') : d ? '#94A3B8' : '#64748B'} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={[
                  s.finalChip,
                  open
                    ? d
                      ? { backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(129,140,248,0.30)' }
                      : { backgroundColor: '#EEF2FF', borderColor: 'rgba(199,210,254,0.9)' }
                    : d
                    ? { backgroundColor: 'rgba(30,41,59,0.8)', borderColor: 'rgba(255,255,255,0.10)' }
                    : { backgroundColor: '#FFFFFF', borderColor: 'rgba(203,213,225,0.8)' },
                ]}
              >
                <Text style={[s.finalChipText, { color: open ? (d ? '#C7D2FE' : '#4338CA') : d ? '#CBD5E1' : '#334155' }]}>FINAL WORLD 22</Text>
              </View>
              <Text style={[s.finalXp, { color: p.muted }]}>• 500 XP</Text>
            </View>
            <Text style={[s.finalTitle, { color: open ? p.cardText : d ? '#E2E8F0' : '#1E293B', fontFamily: open ? FONT.outfit.b : FONT.outfit.sb }]}>{world.title}</Text>
            <Text style={[s.finalSub, { color: p.muted }]}>Full-stack Arch & CI/CD Mastery</Text>
          </View>
        </View>
        <View
          style={[
            s.finalSide,
            open
              ? d
                ? { backgroundColor: p.card, borderColor: 'rgba(255,255,255,0.10)' }
                : { backgroundColor: 'rgba(238,242,255,0.9)', borderColor: 'rgba(199,210,254,0.9)' }
              : d
              ? { backgroundColor: p.card, borderColor: 'rgba(51,65,85,0.6)' }
              : { backgroundColor: '#F1F5F9', borderColor: 'rgba(203,213,225,0.8)' },
          ]}
        >
          <Icon name={open ? WORLD_ICONS[21] : 'lock'} size={18} color={open ? (d ? '#818CF8' : '#4338CA') : d ? '#94A3B8' : '#64748B'} />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The winding trail
// ---------------------------------------------------------------------------------------------------------------------

interface Pt { x: number; y: number }
/** Parses buildTrail()'s "M x,y L x,y C x,y x,y x,y ..." into a polyline. */
function trailToPolyline(d: string): Pt[] {
  const tokens = d.match(/[MLC]|-?\d+(?:\.\d+)?/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cur: Pt = { x: 0, y: 0 };
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'L') {
      cur = { x: num(), y: num() };
      pts.push(cur);
    } else if (cmd === 'C') {
      const c1 = { x: num(), y: num() };
      const c2 = { x: num(), y: num() };
      const end = { x: num(), y: num() };
      const steps = Math.max(12, Math.ceil((Math.hypot(end.x - cur.x, end.y - cur.y) + Math.hypot(c1.x - cur.x, c1.y - cur.y)) / 3));
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const u = 1 - t;
        pts.push({
          x: u * u * u * cur.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x,
          y: u * u * u * cur.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y,
        });
      }
      cur = end;
    }
  }
  return pts;
}

/** Re-samples a polyline at an even spacing. */
function resample(poly: Pt[], step: number): Pt[] {
  if (poly.length < 2) return poly;
  const out: Pt[] = [poly[0]];
  let carry = 0;
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1];
    const b = poly[i];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    let pos = step - carry;
    while (pos <= segLen) {
      const t = pos / segLen;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      pos += step;
    }
    carry = segLen - (pos - step);
  }
  out.push(poly[poly.length - 1]);
  return out;
}

const SHIMMER_PERIOD = 198; // stroke-dasharray "18 180": one 18px dash every 198px
const SHIMMER_TRAVEL = 396; // the dashoffset animation moves the pattern two periods per loop, so the loop is seamless
const SHIMMER_LEN = 18;
const SHIMMER_W = 3;

/**
 * The web's light streaks along the trail. Streak k sits at k*198 + 396*progress along the path, so at progress 1 it is exactly
 * where streak k-2 was at progress 0 and the loop never jumps. Each streak is one small View whose x, y, angle and opacity are
 * interpolated from `progress` over keyframes sampled along the path: the native driver evaluates them on the UI thread.
 */
function Streaks({
  pts, startY, fadeEndY, color, opacity, progress,
}: {
  pts: Pt[];
  startY: number;
  fadeEndY: number;
  color: string;
  opacity: number;
  progress: Animated.Value;
}) {
  const streaks = React.useMemo(() => {
    if (pts.length < 2) return [];
    const cum: number[] = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    const total = cum[cum.length - 1];
    const at = (dist: number) => {
      const d = Math.min(total, Math.max(0, dist));
      let lo = 0;
      let hi = cum.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < d) lo = mid;
        else hi = mid;
      }
      const t = (d - cum[lo]) / Math.max(0.0001, cum[hi] - cum[lo]);
      const a = pts[lo];
      const b = pts[hi];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
    };
    const fade = (y: number) => (y <= startY ? 0 : y >= fadeEndY ? 1 : (y - startY) / Math.max(1, fadeEndY - startY));
    const KEYS = 36; // keyframes per loop (every 11px of travel)
    const out: Array<{ key: number; input: number[]; x: number[]; y: number[]; rot: string[]; op: number[] }> = [];
    for (let k = -2; k * SHIMMER_PERIOD < total; k++) {
      const input: number[] = [];
      const x: number[] = [];
      const y: number[] = [];
      const rot: string[] = [];
      const op: number[] = [];
      let lastAngle = 0;
      for (let j = 0; j <= KEYS; j++) {
        const pos = k * SHIMMER_PERIOD + (SHIMMER_TRAVEL * j) / KEYS;
        const q = at(pos);
        // keep the angle continuous across +-180
        let ang = q.angle;
        while (ang - lastAngle > 180) ang -= 360;
        while (ang - lastAngle < -180) ang += 360;
        lastAngle = ang;
        input.push(j / KEYS);
        x.push(q.x);
        y.push(q.y);
        rot.push(`${ang.toFixed(1)}deg`);
        op.push(pos < 0 || pos > total ? 0 : fade(q.y));
      }
      if (op.some((v) => v > 0)) out.push({ key: k, input, x, y, rot, op });
    }
    return out;
  }, [pts, startY, fadeEndY]);

  return (
    <>
      {streaks.map((st) => (
        <Animated.View
          key={st.key}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -(SHIMMER_LEN + SHIMMER_W) / 2,
            top: -SHIMMER_W / 2,
            width: SHIMMER_LEN + SHIMMER_W,
            height: SHIMMER_W,
            borderRadius: SHIMMER_W / 2,
            backgroundColor: color,
            opacity: progress.interpolate({ inputRange: st.input, outputRange: st.op.map((v) => v * opacity) }),
            transform: [
              { translateX: progress.interpolate({ inputRange: st.input, outputRange: st.x }) },
              { translateY: progress.interpolate({ inputRange: st.input, outputRange: st.y }) },
              { rotate: progress.interpolate({ inputRange: st.input, outputRange: st.rot }) },
            ],
          }}
        />
      ))}
    </>
  );
}

/**
 * The trail, a port of the web's SnakePathOverlay SVG (src/components/Home.tsx): the same layers, widths, opacities and gradients,
 * drawn by react-native-svg as ONE native view (no per-piece Views, no offscreen alpha layers) so scrolling stays smooth.
 * The static layers never redraw; the two moving light streaks live in their own small SVG so only they redraw each frame.
 */

function Trail({
  p, trail, activeIndex, startY, fadeEndY, width, height, animateStreaks,
}: {
  p: Palette;
  trail: { path: (n?: number) => string };
  activeIndex: number;
  startY: number;
  fadeEndY: number;
  width: number;
  height: number;
  animateStreaks: boolean;
}) {
  const d = p.isDark;
  const fullPath = React.useMemo(() => trail.path(), [trail]);
  const activePath = React.useMemo(() => (activeIndex > 0 ? trail.path(activeIndex) : ''), [trail, activeIndex]);
  const fullPts = React.useMemo(() => animateStreaks ? resample(trailToPolyline(fullPath), 8) : [], [fullPath, animateStreaks]);
  const activePts = React.useMemo(() => animateStreaks && activePath ? resample(trailToPolyline(activePath), 8) : [], [activePath, animateStreaks]);

  // The moving light (the web animates stroke-dashoffset 0 -> -396 every 7s). One native-driven value moves every streak, so no
  // JavaScript runs per frame and nothing is redrawn: the streaks are tiny Views transformed on the UI thread.
  const progress = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!animateStreaks) return;
    const loop = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [progress, animateStreaks]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6366F1" />
            <Stop offset="1" stopColor="#8B5CF6" />
          </LinearGradient>
          <LinearGradient id="baseGrad" gradientUnits="userSpaceOnUse" x1="0" y1={startY} x2="0" y2={startY + 160}>
            <Stop offset="0" stopColor="#6366F1" />
            <Stop offset="0.35" stopColor={d ? '#4F46E5' : '#818CF8'} />
            <Stop offset="1" stopColor={d ? '#384764' : '#9CA3AF'} />
          </LinearGradient>
          <LinearGradient id="highlightGrad" gradientUnits="userSpaceOnUse" x1="0" y1={startY} x2="0" y2={startY + 160}>
            <Stop offset="0" stopColor={d ? '#818CF8' : '#C7D2FE'} />
            <Stop offset="1" stopColor={d ? '#475569' : '#FFFFFF'} />
          </LinearGradient>
          {/* The web masks the start so the trail emerges softly from the band; here a page-coloured fade is laid over it. */}
          <LinearGradient id="startFade" gradientUnits="userSpaceOnUse" x1="0" y1={startY} x2="0" y2={fadeEndY}>
            <Stop offset="0" stopColor={p.page} stopOpacity="1" />
            <Stop offset="0.25" stopColor={p.page} stopOpacity="0.75" />
            <Stop offset="0.6" stopColor={p.page} stopOpacity="0.3" />
            <Stop offset="1" stopColor={p.page} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fullPath} fill="none" stroke="url(#highlightGrad)" strokeWidth={12} strokeLinecap="round" opacity={d ? 0.35 : 0.85} />
        <Path d={fullPath} fill="none" stroke="url(#baseGrad)" strokeWidth={6} strokeLinecap="round" opacity={0.75} />
        {activePath !== '' && (
          <>
            <Path d={activePath} fill="none" stroke={d ? '#6366F1' : '#818CF8'} strokeWidth={8} strokeLinecap="round" opacity={d ? 0.25 : 0.3} />
            <Path d={activePath} fill="none" stroke="url(#activeGrad)" strokeWidth={4} strokeLinecap="round" strokeDasharray="4 4" />
          </>
        )}
        {fadeEndY > startY && <Rect x={0} y={startY} width={width} height={fadeEndY - startY} fill="url(#startFade)" />}
      </Svg>
      {animateStreaks && <Streaks pts={fullPts} startY={startY} fadeEndY={fadeEndY} color={d ? '#94A3B8' : '#FFFFFF'} opacity={d ? 0.5 : 0.7} progress={progress} />}
      {animateStreaks && activePts.length > 1 && (
        <Streaks pts={activePts} startY={startY} fadeEndY={fadeEndY} color={d ? '#C7D2FE' : '#FFFFFF'} opacity={d ? 0.95 : 1} progress={progress} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The screen
// ---------------------------------------------------------------------------------------------------------------------

/** The Learn tab's content (the shared top bar and tab bar live in App.tsx). `gap` is the extra space between world nodes. */
export const HomeContent = React.memo(function HomeContent({
  p, gap, journeyVariant = 'milestones', onOpenWorld, onOpenActivity, quizActivityCounts = {}, writeRunActivityCounts = {}, debugActivityCounts = {},
}: {
  p: Palette;
  gap: number;
  journeyVariant?: JourneyVariant;
  onOpenWorld?: (order: number) => void;
  onOpenActivity?: (order: number, activity: WorldActivity) => void;
  quizActivityCounts?: Record<number, number>;
  writeRunActivityCounts?: Record<number, number>;
  debugActivityCounts?: Record<number, number>;
}) {
  const { width } = useWindowDimensions();
  const pathStyle = React.useMemo(() => getPathStyle(DEVICE_PATH_STYLE), []);
  const expectedPointCount = TOTAL_PATH_POINTS;
  const completed = COMPLETED_WORLDS;
  // The large current-world card belongs on the furthest unlocked world.
  const currentOrder = Math.min(TOTAL_WORLDS, Math.max(completed + 1, UNLOCK_THROUGH));
  const current = HOME_WORLDS[currentOrder - 1];
  const sectionWidth = Math.min(360, width);

  // The ScrollView's inner content view: every trail coordinate is measured relative to it.
  const contentRef = React.useRef<View | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const scrolledToCurrent = React.useRef(false);
  const boxRefs = React.useRef(new Map<number, View | null>());
  const topRefs = React.useRef(new Map<number, View | null>());
  const activityRefs = React.useRef(new Map<string, View | null>());
  const startRef = React.useRef<View>(null);
  const [points, setPoints] = React.useState<Pt[] | null>(null);
  const [contentHeight, setContentHeight] = React.useState(0);
  const bandTops = React.useRef<Partial<Record<1 | 2 | 3, number>>>({});
  const [stickyBand, setStickyBand] = React.useState<1 | 2 | 3>(1);
  const onBandLayout = React.useCallback((chapter: 1 | 2 | 3, y: number) => {
    // A sticky header is laid out again at y=0 when pinned. Keep the original
    // content position; otherwise the pinned clone would make every later
    // section appear sticky immediately.
    if (y > 0 || bandTops.current[chapter] === undefined) bandTops.current[chapter] = y;
  }, []);
  const updateStickyBand = React.useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const tops = bandTops.current;
    const next = tops[3] !== undefined && y >= tops[3] - 1 ? 3 : tops[2] !== undefined && y >= tops[2] - 1 ? 2 : 1;
    setStickyBand((currentSticky) => currentSticky === next ? currentSticky : next);
  }, []);

  const anchors = React.useMemo<Anchors>(
    () => ({
      box: (order) => (el) => { boxRefs.current.set(order, el); },
      top: (order) => (el) => { topRefs.current.set(order, el); },
      activity: (order, activity) => (el) => { activityRefs.current.set(`${order}:${activity}`, el); },
    }),
    []
  );

  const measure = React.useCallback(() => {
    const journey = contentRef.current;
    if (!journey) return;
    const jobs: Array<{ index: number; el: View | null; mode: 'center' | 'top' }> = [{ index: 0, el: startRef.current, mode: 'top' }];
    for (let order = 1; order <= TOTAL_WORLDS; order++) {
      const box = boxRefs.current.get(order);
      const top = topRefs.current.get(order);
      const worldIndex = worldPointIndex(order);
      if (box) jobs.push({ index: worldIndex, el: box, mode: 'center' });
      else if (top) jobs.push({ index: worldIndex, el: top, mode: 'center' });
      WORLD_ACTIVITIES.forEach((activity, activityIndex) => {
        jobs.push({ index: activityPointIndex(order, activityIndex), el: activityRefs.current.get(`${order}:${activity.id}`) ?? null, mode: 'center' });
      });
    }
    const result: Array<Pt | undefined> = new Array(expectedPointCount);
    let pending = jobs.length;
    const done = () => {
      if (--pending > 0) return;
      // Keep every World and activity at its fixed path index. Filtering a
      // missing measurement would shift every later milestone on the trail.
      if (result.every((point): point is Pt => Boolean(point))) {
        setPoints(result as Pt[]);
      }
    };
    jobs.forEach(({ index, el, mode }) => {
      if (!el) { done(); return; }
      el.measureLayout(
        journey,
        (x, y, w, h) => {
          result[index] = { x: x + w / 2, y: mode === 'center' ? y + h / 2 : y };
          done();
        },
        () => done()
      );
    });
  }, [expectedPointCount]);

  // Re-measure whenever the layout can change (gap, width). Layout events fire child-first, so wait a frame.
  React.useEffect(() => {
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [gap, width, p.isDark, measure, pathStyle]);

  // Open on the current world's card instead of the top of the journey (once, after the first measurement).
  React.useEffect(() => {
    const currentIndex = worldPointIndex(currentOrder);
    if (!points || points.length !== expectedPointCount || scrolledToCurrent.current || points.length <= currentIndex) return;
    scrolledToCurrent.current = true;
    const y = Math.max(0, points[currentIndex].y - 150);
    // Not cancelled on re-render: the layout is re-measured a moment later, which would otherwise drop this scroll.
    const scrollTimer = setTimeout(() => scrollRef.current?.scrollTo({ y, animated: false }), 80);
    return () => clearTimeout(scrollTimer);
  }, [points, currentOrder, expectedPointCount]);

  const trailData = React.useMemo(() => {
    if (!points || points.length !== expectedPointCount || points.length < 2) return null;
    const pts = points.map((q) => ({ ...q }));
    // Keep the lead-in as part of the same curved trail. Forcing segment 0
    // straight makes the RN path visibly collapse into a vertical line.
    const trail = buildTrail(pts, [], width, pathStyle);
    return { trail, startY: pts[0].y, fadeEndY: pts[0].y + Math.min(Math.max(30, pts[1].y - pts[0].y) * 0.75, 55), activeIndex: Math.min(pts.length - 1, worldPointIndex(currentOrder)) };
  }, [points, width, pathStyle, currentOrder, expectedPointCount]);

  const nodeCommon = { p, gap: gap + 14, pathStyle, completed, anchors, onOpenWorld };
  const w = (order: number) => HOME_WORLDS[order - 1];
  const sec = (extra: object) => [s.section, { width: sectionWidth }, extra];
  const alignmentFor = (order: number): 'left' | 'right' => ((order <= 15 ? order % 2 === 1 : order % 2 === 0) ? 'left' : 'right');

  const standard = (order: number, paddingTop: number) => (
    <StandardNode {...nodeCommon} world={w(order)} align={alignmentFor(order)} paddingTop={paddingTop} />
  );
  const activities = (order: number) => {
    const movesRight = alignmentFor(order) === 'left';
    const positions: ActivityPosition[] = movesRight ? ['midLeft', 'center', 'midRight'] : ['midRight', 'center', 'midLeft'];
    return WORLD_ACTIVITIES.map((activity, index) => (
      <ActivityNode
        key={`${order}-${activity.id}`}
        p={p}
        order={order}
        activity={activity}
        position={positions[index]}
        locked={!UNLOCK_ALL && order > UNLOCK_THROUGH}
        count={activity.id === 'quiz' ? (quizActivityCounts[order] ?? 0) : activity.id === 'writeRun' ? (writeRunActivityCounts[order] ?? 0) : (debugActivityCounts[order] ?? 0)}
        anchors={anchors}
        onOpen={onOpenActivity}
        shape={journeyVariant === 'milestonesCircle' ? 'circle' : journeyVariant === 'milestonesDiamond' ? 'diamond' : journeyVariant === 'milestonesPill' ? 'pill' : 'square'}
      />
    ));
  };
  const worldNode = (order: number, paddingTop: number) => (
    <React.Fragment key={order}>
      {order === currentOrder ? (
        <CurrentCard p={p} world={w(order)} paddingTop={paddingTop} gap={gap + 14} anchors={anchors} onOpenWorld={onOpenWorld} />
      ) : (
        standard(order, paddingTop)
      )}
      {activities(order)}
    </React.Fragment>
  );
  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      {/* The three chapter bands are the ScrollView's sticky headers (children 2, 4 and 6): the system pins the current one under
          the header and the next one pushes it away, like the web's position: sticky. */}
      <ScrollView
        ref={scrollRef}
        innerViewRef={contentRef as React.RefObject<View>}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 48 }}
        stickyHeaderIndices={[2, 4, 6]}
        scrollEventThrottle={16}
        onScroll={updateStickyBand}
        onMomentumScrollEnd={updateStickyBand}
        onScrollEndDrag={updateStickyBand}
        onContentSizeChange={(_, h) => {
          setContentHeight(h);
          setTimeout(measure, 0);
        }}
      >
        <JourneyCard p={p} current={current} completed={completed} />

        {/* The trail fills the whole scroll content, behind everything else */}
        <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: contentHeight }}>
          {trailData && contentHeight > 0 && (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Trail p={p} trail={trailData.trail} activeIndex={trailData.activeIndex} startY={trailData.startY} fadeEndY={trailData.fadeEndY} width={width} height={contentHeight} animateStreaks />
            </View>
          )}
        </View>

        {/* Section 1: Beginner */}
        <Band p={p} chapter={1} label="BEGINNER · WORLDS 1–8" active={currentOrder <= 8} topBorder={false} blurred={stickyBand === 1} onLayout={onBandLayout} />
        <View style={sec({ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 32 + 24 })}>
          <View style={{ width: '100%', paddingLeft: 32, marginTop: -1 }}>
            <View ref={startRef} collapsable={false} style={{ width: 44, height: 0 }} />
          </View>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((order) => worldNode(order, 64))}
        </View>

        {/* Section 2: Intermediate */}
        <Band p={p} chapter={2} label="INTERMEDIATE · WORLDS 9–15" active={currentOrder > 8 && currentOrder <= 15} topBorder blurred={stickyBand === 2} onLayout={onBandLayout} />
        <View style={sec({ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 + 24 })}>
          {[9, 10, 11, 12, 13, 14].map((order) => worldNode(order, order === 9 ? 40 : 60))}
          <BossNode p={p} world={w(15)} completed={completed} anchors={anchors} onOpenWorld={onOpenWorld} />
          {activities(15)}
        </View>

        {/* Section 3: Experienced */}
        <Band p={p} chapter={3} label="EXPERIENCED · WORLDS 16–22" active={currentOrder > 15} topBorder blurred={stickyBand === 3} onLayout={onBandLayout} />
        <View style={sec({ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 })}>
          {[16, 17, 18, 19, 20, 21].map((order) => worldNode(order, order === 16 ? 40 : 60))}
          <FinalCard p={p} world={w(22)} completed={completed} anchors={anchors} />
          {activities(22)}
        </View>
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  // journey card
  journeyWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  journeyCard: { borderRadius: 16, borderWidth: BW, padding: 14, gap: 10 },
  lightRaised: { elevation: 2, shadowColor: '#000', shadowOpacity: 0.06 },
  journeyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' },
  kotlinChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: BW },
  kotlinChipText: { fontFamily: FONT.mono.b, fontSize: fz(9 * MAIN), lineHeight: 13.5 * MAIN, letterSpacing: 0.45 * MAIN, includeFontPadding: false },
  progressBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 30.1, borderRadius: 12, borderWidth: BW },
  progressLabel: { fontFamily: FONT.jakarta.b, fontSize: fz(9 * MAIN), lineHeight: 13.5 * MAIN, letterSpacing: 0.45 * MAIN, includeFontPadding: false },
  progressValue: { fontFamily: FONT.mono.b, fontSize: fz(12 * MAIN), lineHeight: 16 * MAIN, includeFontPadding: false },
  journeyTitle: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: 20 * MAIN, letterSpacing: -0.35 * MAIN, includeFontPadding: false },
  bar: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  // bands
  bandInner: { paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bandChip: { borderWidth: BW, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  bandText: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, letterSpacing: 0.5 * MAIN, includeFontPadding: false },
  bandActive: { fontFamily: FONT.mono.b, fontSize: fz(8 * MAIN), letterSpacing: 1.28 * MAIN },
  // sections
  section: { alignSelf: 'center', alignItems: 'center' },
  // nodes
  nodeBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  worldChip: { alignSelf: 'flex-start', borderWidth: BW, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 },
  worldChipText: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, letterSpacing: 0.25 * MAIN, includeFontPadding: false },
  worldTitle: { fontSize: fz(14 * MAIN), lineHeight: 20 * MAIN, includeFontPadding: false },
  availableBadge: { borderWidth: BW, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  availableBadgeText: { fontFamily: FONT.mono.b, fontSize: fz(8 * MAIN), lineHeight: 12 * MAIN, includeFontPadding: false },
  lessonTag: { alignSelf: 'flex-start', marginTop: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: BW },
  lessonTagText: { fontFamily: FONT.mono.md, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, letterSpacing: 0.25 * MAIN, includeFontPadding: false },
  // Activity milestones are individual nodes on the same trail as each World.
  activityNodeRow: { width: '100%', height: 52, alignItems: 'center', marginTop: 4 },
  activityNodePressable: { borderRadius: 999, padding: 3 },
  activityDiamondBox: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  activityDiamondShape: { position: 'absolute', width: 31, height: 31, borderRadius: 7, borderWidth: 1.4, transform: [{ rotate: '45deg' }] },
  activityNodeBox: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.82, alignItems: 'center', justifyContent: 'center' },
  activityCountBadge: { position: 'absolute', right: -6, top: -6, minWidth: 15, height: 15, borderRadius: 7.5, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0F172A' },
  activityCountText: { fontFamily: FONT.mono.b, fontSize: fz(7 * MAIN), lineHeight: 9 * MAIN, includeFontPadding: false },
  ribbonCountBadge: { position: 'absolute', right: -5, top: -5, minWidth: 15, height: 15, borderRadius: 7.5, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0F172A' },
  // current-world card
  currentCard: { width: '100%', maxWidth: 320, minHeight: CURRENT_CARD_HEIGHT, borderRadius: 16, borderWidth: BW, padding: 16, gap: 10 },
  currentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  currentChip: { borderWidth: BW, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  currentChipText: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, letterSpacing: 0.5 * MAIN, includeFontPadding: false },
  currentLessons: { fontFamily: FONT.mono.sb, fontSize: fz(11 * MAIN), lineHeight: 16.5 * MAIN, includeFontPadding: false },
  currentTitle: { fontFamily: FONT.outfit.b, fontSize: fz(16 * MAIN), lineHeight: 24 * MAIN, letterSpacing: -0.4 * MAIN, includeFontPadding: false },
  // marginRight -3: slack so a line that is a hair wider than the card is never wrapped-and-clipped (Android measures it as 1 line).
  currentSub: { marginRight: -3, fontFamily: FONT.body, fontSize: fz(12 * MAIN), lineHeight: 16.5 * MAIN, marginTop: 4, includeFontPadding: false },
  cta: { height: 44, width: '100%', borderRadius: 12, overflow: 'hidden' },
  ctaContent: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontFamily: FONT.outfit.sb, fontSize: fz(14 * MAIN), lineHeight: 20 * MAIN, color: '#FFFFFF', includeFontPadding: false },
  // boss node and final card
  bossBox: { width: 48, height: 48, borderRadius: 16, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  finalCard: { width: '100%', borderRadius: 24, borderWidth: BW, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  finalIcon: { width: 48, height: 48, borderRadius: 16, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  finalChip: { borderWidth: BW, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  finalChipText: { fontFamily: FONT.mono.b, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, letterSpacing: 0.25 * MAIN, includeFontPadding: false },
  finalXp: { fontFamily: FONT.mono.b, fontSize: fz(9 * MAIN), lineHeight: 13.5 * MAIN, includeFontPadding: false },
  finalTitle: { fontFamily: FONT.outfit.sb, fontSize: fz(12 * MAIN), lineHeight: 18 * MAIN, marginTop: 2, includeFontPadding: false },
  finalSub: { fontFamily: FONT.body, fontSize: fz(10 * MAIN), lineHeight: 15 * MAIN, includeFontPadding: false },
  finalSide: { width: 32, height: 32, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
});
