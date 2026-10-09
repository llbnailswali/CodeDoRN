import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Animated, Easing, FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BW, MAIN } from './shell';
import { HOME_WORLDS } from './homeData';
import { DEVICE_PATH_STYLE, buildTrail, getPathStyle, nodeDrift, nodeInset } from './pathStyles';
import type { JourneyVariant } from './App';
import { Palette } from './theme';
import {
  ActivityNode, ActivityPosition, Anchors, Band, BossNode, COMPLETED_WORLDS, CURRENT_CARD_HEIGHT, CurrentCard, FinalCard, JourneyCard,
  NODE_COLUMN, Pt, SHOW_STREAKS, SHIMMER_LEN, SHIMMER_W, StandardNode, StreakKeys, TOTAL_PATH_POINTS, TOTAL_WORLDS, UNLOCK_ALL, UNLOCK_THROUGH,
  WORLD_ACTIVITIES, WorldActivity, activityPointIndex, computeStreaks, resample, trailToPolyline, worldPointIndex,
} from './HomeScreen';

// The Learn tab's Home as a virtualized FlatList: it draws exactly what HomeContent (HomeScreen.tsx) draws, but only the rows near the
// screen are mounted. HomeContent measures every node and lays ONE trail SVG over the whole journey; here every position is computed
// from the same layout constants, and each row draws only its own slice of that one trail (the SVG viewBox is the row's window onto the
// journey's coordinates), so the path, its gradients and the moving light streaks join seamlessly from row to row.
// Keep the layout numbers below in sync with HomeContent's sections, StandardNode, CurrentCard, BossNode and FinalCard.

// ---------------------------------------------------------------------------------------------------------------------
// Layout model
// ---------------------------------------------------------------------------------------------------------------------

/** One list row: a pair of worlds (or a single one) with their activity milestones. Paddings are the old section paddings. */
type RowSpec = { key: string; worlds: number[]; padTop: number; padBottom: number; marginTop: number };
type Entry = { type: 'band'; chapter: 1 | 2 | 3 } | ({ type: 'row' } & RowSpec);

const ENTRIES: Entry[] = [
  { type: 'band', chapter: 1 },
  // Section 1's first child was the trail-start marker with marginTop -1, which moved the whole section up 1px.
  { type: 'row', key: 'r1', worlds: [1, 2], padTop: 0, padBottom: 0, marginTop: -1 },
  { type: 'row', key: 'r3', worlds: [3, 4], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r5', worlds: [5, 6], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r7', worlds: [7, 8], padTop: 0, padBottom: 32 + 24, marginTop: 0 },
  { type: 'band', chapter: 2 },
  { type: 'row', key: 'r9', worlds: [9, 10], padTop: 16, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r11', worlds: [11, 12], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r13', worlds: [13, 14], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r15', worlds: [15], padTop: 0, padBottom: 32 + 24, marginTop: 0 },
  { type: 'band', chapter: 3 },
  { type: 'row', key: 'r16', worlds: [16, 17], padTop: 16, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r18', worlds: [18, 19], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r20', worlds: [20, 21], padTop: 0, padBottom: 0, marginTop: 0 },
  { type: 'row', key: 'r22', worlds: [22], padTop: 0, padBottom: 48, marginTop: 0 },
];

const BAND_LABELS = { 1: 'BEGINNER · WORLDS 1–8', 2: 'INTERMEDIATE · WORLDS 9–15', 3: 'EXPERIENCED · WORLDS 16–22' } as const;

// Heights of the text-based blocks (every Text has an explicit lineHeight, so these are exact unless a line wraps; the rows holding the
// current card, the boss and the final card are measured on mount and corrected, see `fixes`).
const CHIP_H = 15 * MAIN + 4 + 2 * BW; // WorldChip / CURRENT WORLD / FINAL WORLD chip
const BOSS_H = 44 + 48 + 4 + CHIP_H + 20 * MAIN + (2 + 15 * MAIN + 4 + 2 * BW);
const CARD_H = Math.max(CURRENT_CARD_HEIGHT, 32 + 2 * BW + CHIP_H + 10 + (24 * MAIN + 4 + 16.5 * MAIN) + 10 + 44);
const FINAL_H = 32 + 2 * BW + Math.max(48, CHIP_H + 2 + 18 * MAIN + 15 * MAIN);
/** First guess at a band strip's height; the real height is measured on mount (fixes.band1..3). */
const bandEstimate = (chapter: 1 | 2 | 3) => 20 + 15 * MAIN + 8 + 2 * BW + BW + (chapter === 1 ? 0 : BW);
const ACTIVITY_H = 4 + 52; // activityNodeRow: marginTop 4 + height 52

const worldPaddingTop = (order: number) => (order <= 8 ? 64 : order === 9 || order === 16 ? 40 : 60);
const alignmentFor = (order: number): 'left' | 'right' => ((order <= 15 ? order % 2 === 1 : order % 2 === 0) ? 'left' : 'right');
const activityPositions = (order: number): ActivityPosition[] =>
  alignmentFor(order) === 'left' ? ['midLeft', 'center', 'midRight'] : ['midRight', 'center', 'midLeft'];

type BandItem = { type: 'band'; key: string; chapter: 1 | 2 | 3; top: number; height: number };
type RowItem = { type: 'row'; key: string; spec: RowSpec; top: number; height: number; variable: boolean; modelContent: number };
type Item = BandItem | RowItem;
type Streak = StreakKeys & { minY: number; maxY: number };

interface Geometry {
  width: number;
  items: Item[];
  points: Pt[];
  /** segs[i] is the trail from points[i] to points[i + 1] ("C ..." commands, exactly as buildTrail draws them). */
  segs: string[];
  activeIndex: number;
  startY: number;
  fadeEndY: number;
  streaks: Streak[];
  activeStreaks: Streak[];
}

function buildGeometry(width: number, gap: number, currentOrder: number, fixes: Record<string, number>): Geometry {
  const pathStyle = getPathStyle(DEVICE_PATH_STYLE);
  const W = Math.min(360, width);
  const off = (width - W) / 2;
  const g = gap + 14; // HomeContent passes gap + 14 to every node
  // activityNodeRow is a column centred horizontally: the 96dp padding moves the centre of the remaining width, so 'midLeft'
  // (paddingLeft 96) sits RIGHT of the screen centre and 'midRight' (paddingRight 96) left of it.
  const inner = W - 40;
  const actX: Record<ActivityPosition, number> = {
    midLeft: off + 20 + 96 + (inner - 96) / 2,
    center: off + W / 2,
    midRight: off + 20 + (inner - 96) / 2,
  };
  const points: Pt[] = new Array(TOTAL_PATH_POINTS);
  const items: Item[] = [];
  let y = 0;
  for (const entry of ENTRIES) {
    if (entry.type === 'band') {
      const height = fixes[`band${entry.chapter}`] ?? bandEstimate(entry.chapter);
      items.push({ type: 'band', key: `band${entry.chapter}`, chapter: entry.chapter, top: y, height });
      y += height;
      continue;
    }
    const spec: RowSpec = entry;
    if (spec.key === 'r1') points[0] = { x: off + 20 + 32 + 22, y: y + spec.marginTop };
    const fix = fixes[spec.key] ?? 0;
    let variable = false;
    let cursor = spec.marginTop + spec.padTop;
    for (const order of spec.worlds) {
      let h: number;
      let pointAt: number;
      let x = off + W / 2;
      if (order === 15) {
        variable = true;
        h = BOSS_H + fix;
        pointAt = 44 + 24;
      } else if (order === 22) {
        variable = true;
        h = 48 + FINAL_H + 16 + fix;
        pointAt = 48 + (FINAL_H + fix) / 2;
      } else if (order === currentOrder) {
        variable = true;
        const P = worldPaddingTop(order);
        h = g + P + CARD_H + 16 + fix;
        pointAt = g + P + (CARD_H + fix) / 2;
      } else {
        const P = worldPaddingTop(order);
        const drift = nodeDrift(pathStyle, order);
        const inset = nodeInset(pathStyle, order);
        h = g + drift + P + NODE_COLUMN;
        pointAt = g + drift + P + NODE_COLUMN / 2;
        x = alignmentFor(order) === 'left' ? off + 20 + inset + 22 : off + W - 20 - inset - 22;
      }
      points[worldPointIndex(order)] = { x, y: y + cursor + pointAt };
      cursor += h;
      activityPositions(order).forEach((position, index) => {
        points[activityPointIndex(order, index)] = { x: actX[position], y: y + cursor + 4 + 26 };
        cursor += ACTIVITY_H;
      });
    }
    const content = cursor - spec.marginTop + spec.padBottom;
    const height = Math.round(spec.marginTop + content);
    items.push({ type: 'row', key: spec.key, spec, top: y, height, variable, modelContent: content - fix });
    y += height;
  }

  const trail = buildTrail(points, [], width, pathStyle);
  const segs: string[] = [];
  for (let i = 0; i < points.length - 1; i++) segs.push(trail.path(i + 1).slice(trail.path(i).length).trim());
  const startY = points[0].y;
  const fadeEndY = startY + Math.min(Math.max(30, points[1].y - points[0].y) * 0.75, 55);
  const activeIndex = Math.min(points.length - 1, worldPointIndex(currentOrder));
  const withRange = (list: StreakKeys[]): Streak[] => list.map((st) => ({ ...st, minY: Math.min(...st.y), maxY: Math.max(...st.y) }));
  const streaks = withRange(computeStreaks(resample(trailToPolyline(trail.path()), 8), startY, fadeEndY));
  const activeStreaks = activeIndex > 0 ? withRange(computeStreaks(resample(trailToPolyline(trail.path(activeIndex)), 8), startY, fadeEndY)) : [];
  return { width, items, points, segs, activeIndex, startY, fadeEndY, streaks, activeStreaks };
}

// ---------------------------------------------------------------------------------------------------------------------
// One row's slice of the trail (the same layers as HomeScreen's Trail)
// ---------------------------------------------------------------------------------------------------------------------

const f1 = (n: number) => n.toFixed(1);
const PAD = 16; // stroke half-width plus margin: a segment this close to the window still paints into it

/** The part of the trail (segments 0..limit-1) that can paint into [top, bottom]. */
function slicePath(geo: Geometry, top: number, bottom: number, limit: number) {
  let first = -1;
  let last = -1;
  for (let i = 0; i < Math.min(limit, geo.segs.length); i++) {
    const a = geo.points[i].y;
    const b = geo.points[i + 1].y;
    if (Math.max(a, b) >= top - PAD && Math.min(a, b) <= bottom + PAD) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0) return '';
  const start = geo.points[first];
  return `M ${f1(start.x)},${f1(start.y)} ${geo.segs.slice(first, last + 1).join(' ')}`;
}

function SliceStreaks({ streaks, top, color, opacity, progress }: { streaks: Streak[]; top: number; color: string; opacity: number; progress: Animated.Value }) {
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
              { translateY: progress.interpolate({ inputRange: st.input, outputRange: st.y.map((v) => v - top) }) },
              { rotate: progress.interpolate({ inputRange: st.input, outputRange: st.rot }) },
            ],
          }}
        />
      ))}
    </>
  );
}

const TrailSlice = React.memo(function TrailSlice({
  geo, top, height, isDark: d, page, progress,
}: { geo: Geometry; top: number; height: number; isDark: boolean; page: string; progress: Animated.Value }) {
  const bottom = top + height;
  const fullPath = React.useMemo(() => slicePath(geo, top, bottom, Infinity), [geo, top, bottom]);
  const activePath = React.useMemo(() => (geo.activeIndex > 0 ? slicePath(geo, top, bottom, geo.activeIndex) : ''), [geo, top, bottom]);
  const near = (st: Streak) => st.maxY >= top - SHIMMER_LEN && st.minY <= bottom + SHIMMER_LEN;
  const streaks = React.useMemo(() => geo.streaks.filter(near), [geo, top, bottom]); // eslint-disable-line react-hooks/exhaustive-deps
  const activeStreaks = React.useMemo(() => geo.activeStreaks.filter(near), [geo, top, bottom]); // eslint-disable-line react-hooks/exhaustive-deps
  const { startY, fadeEndY } = geo;
  const activeEndY = geo.points[geo.activeIndex].y;
  if (!fullPath) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Svg width={geo.width} height={height} viewBox={`0 ${top} ${geo.width} ${height}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* HomeScreen's activeGrad spans the active path's bounding box (top to bottom); here that box is given in journey units. */}
          <LinearGradient id="activeGrad" gradientUnits="userSpaceOnUse" x1="0" y1={startY} x2="0" y2={activeEndY}>
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
          <LinearGradient id="startFade" gradientUnits="userSpaceOnUse" x1="0" y1={startY} x2="0" y2={fadeEndY}>
            <Stop offset="0" stopColor={page} stopOpacity="1" />
            <Stop offset="0.25" stopColor={page} stopOpacity="0.75" />
            <Stop offset="0.6" stopColor={page} stopOpacity="0.3" />
            <Stop offset="1" stopColor={page} stopOpacity="0" />
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
        {fadeEndY > startY && fadeEndY > top && startY < bottom && <Rect x={0} y={startY} width={geo.width} height={fadeEndY - startY} fill="url(#startFade)" />}
      </Svg>
      {SHOW_STREAKS && <SliceStreaks streaks={streaks} top={top} color={d ? '#94A3B8' : '#FFFFFF'} opacity={d ? 0.5 : 0.7} progress={progress} />}
      {SHOW_STREAKS && <SliceStreaks streaks={activeStreaks} top={top} color={d ? '#C7D2FE' : '#FFFFFF'} opacity={d ? 0.95 : 1} progress={progress} />}
    </View>
  );
});

// ---------------------------------------------------------------------------------------------------------------------
// The screen
// ---------------------------------------------------------------------------------------------------------------------

const NO_ANCHORS: Anchors = { box: () => () => {}, top: () => () => {}, activity: () => () => {} };
const AnimatedFlatList = Animated.FlatList as unknown as React.ComponentType<any>;
type Shape = 'square' | 'circle' | 'diamond' | 'pill';

/** Everything a row needs. Rows are memoized, so keep every prop here stable between renders. */
type RowProps = {
  item: Item;
  geo: Geometry;
  p: Palette;
  progress: Animated.Value;
  bandOpacity: Animated.AnimatedInterpolation<number> | null;
  sectionWidth: number;
  gap: number;
  currentOrder: number;
  shape: Shape;
  quizActivityCounts: Record<number, number>;
  writeRunActivityCounts: Record<number, number>;
  debugActivityCounts: Record<number, number>;
  onOpenWorld?: (order: number) => void;
  onOpenActivity?: (order: number, activity: WorldActivity) => void;
  onRowLayout: (item: RowItem, height: number) => void;
  onBandLayout: (chapter: 1 | 2 | 3, height: number) => void;
};

function WorldBlock({ order, ...r }: { order: number } & Omit<RowProps, 'item' | 'geo' | 'progress' | 'bandOpacity' | 'sectionWidth' | 'onRowLayout' | 'onBandLayout'>) {
  const { p, gap, currentOrder, shape, onOpenWorld, onOpenActivity } = r;
  const world = HOME_WORLDS[order - 1];
  const completed = COMPLETED_WORLDS;
  const node = order === 15 ? (
    <BossNode p={p} world={world} completed={completed} anchors={NO_ANCHORS} onOpenWorld={onOpenWorld} />
  ) : order === 22 ? (
    <FinalCard p={p} world={world} completed={completed} anchors={NO_ANCHORS} />
  ) : order === currentOrder ? (
    <CurrentCard p={p} world={world} paddingTop={worldPaddingTop(order)} gap={gap + 14} anchors={NO_ANCHORS} onOpenWorld={onOpenWorld} />
  ) : (
    <StandardNode p={p} world={world} align={alignmentFor(order)} paddingTop={worldPaddingTop(order)} gap={gap + 14} pathStyle={getPathStyle(DEVICE_PATH_STYLE)} completed={completed} anchors={NO_ANCHORS} onOpenWorld={onOpenWorld} />
  );
  return (
    <>
      {node}
      {activityPositions(order).map((position, index) => {
        const activity = WORLD_ACTIVITIES[index];
        const counts = activity.id === 'quiz' ? r.quizActivityCounts : activity.id === 'writeRun' ? r.writeRunActivityCounts : r.debugActivityCounts;
        return (
          <ActivityNode
            key={`${order}-${activity.id}`}
            p={p}
            order={order}
            activity={activity}
            position={position}
            locked={!UNLOCK_ALL && order > UNLOCK_THROUGH}
            count={counts[order] ?? 0}
            anchors={NO_ANCHORS}
            onOpen={onOpenActivity}
            shape={shape}
          />
        );
      })}
    </>
  );
}

/** One list item: a band strip or a row of worlds, each over its own slice of the trail. */
const ListRow = React.memo(function ListRow(props: RowProps) {
  const { item, geo, p, progress } = props;
  const slice = <TrailSlice geo={geo} top={item.top} height={item.height} isDark={p.isDark} page={p.page} progress={progress} />;
  if (item.type === 'band') {
    const { currentOrder } = props;
    return (
      <View onLayout={(e) => props.onBandLayout(item.chapter, e.nativeEvent.layout.height)}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: props.bandOpacity ?? 1 }]}>{slice}</Animated.View>
        <Band
          p={p}
          chapter={item.chapter}
          label={BAND_LABELS[item.chapter]}
          active={item.chapter === 1 ? currentOrder <= 8 : item.chapter === 2 ? currentOrder > 8 && currentOrder <= 15 : currentOrder > 15}
          topBorder={item.chapter !== 1}
          // Band does not use `blurred` (HomeContent tracks the pinned band on every scroll event only to pass it here), so this list
          // does not track it: no JavaScript runs while scrolling.
          blurred={false}
        />
      </View>
    );
  }
  const { spec } = item;
  return (
    <View style={{ height: item.height }}>
      {slice}
      {/* CACHE_ROWS (off): caching this static layer as a GPU bitmap was measured on device and made scrolling WORSE (median frame
          61ms vs 53ms, 668 slow bitmap uploads vs 91), because every newly mounted row has to be rasterized and uploaded. */}
      <View
        renderToHardwareTextureAndroid={CACHE_ROWS}
        onLayout={(e) => props.onRowLayout(item, e.nativeEvent.layout.height)}
        style={[s.section, { width: props.sectionWidth, paddingHorizontal: 20, paddingTop: spec.padTop, paddingBottom: spec.padBottom, marginTop: spec.marginTop }]}
      >
        {spec.worlds.map((order) => <WorldBlock key={order} order={order} {...props} />)}
      </View>
    </View>
  );
});

/** Drop-in replacement for HomeContent (same props), rendered as a virtualized list. */
export const HomeListContent = React.memo(function HomeListContent({
  p, gap, journeyVariant = 'milestones', onOpenWorld, onOpenActivity, quizActivityCounts = EMPTY_COUNTS, writeRunActivityCounts = EMPTY_COUNTS, debugActivityCounts = EMPTY_COUNTS,
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
  const completed = COMPLETED_WORLDS;
  const currentOrder = Math.min(TOTAL_WORLDS, Math.max(completed + 1, UNLOCK_THROUGH));
  const current = HOME_WORLDS[currentOrder - 1];
  const sectionWidth = Math.min(360, width);

  // Measured-minus-model height of the rows whose text could wrap (current card, boss, final card).
  const [fixes, setFixes] = React.useState<Record<string, number>>({});
  const geo = React.useMemo(() => buildGeometry(width, gap, currentOrder, fixes), [width, gap, currentOrder, fixes]);

  // The journey card is the list header; item offsets and band pin points include its height, so it is measured before the list mounts.
  const [headerH, setHeaderH] = React.useState(0);
  const listRef = React.useRef<FlatList<Item>>(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // The moving light streaks pause while the list scrolls (less work per frame) and resume from where they stopped.
  // Android does not always report the end of a scroll (e.g. a fling stopped by a tap that never drags), so every touch/scroll end
  // schedules a resume, and a paused state never outlives STREAK_WATCHDOG_MS without one.
  const progress = React.useRef(new Animated.Value(0)).current;
  const streakAnim = React.useRef<Animated.CompositeAnimation | null>(null);
  const streaksOn = React.useRef(false); // running, or about to start (the paused value arrives asynchronously from native)
  const streakGen = React.useRef(0); // bumped by every pause, so a start that resolves after a pause is dropped
  const resumeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdog = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimers = React.useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (watchdog.current) clearTimeout(watchdog.current);
    resumeTimer.current = null;
    watchdog.current = null;
  }, []);
  const startStreaks = React.useCallback(() => {
    if (!SHOW_STREAKS || streaksOn.current) return;
    streaksOn.current = true;
    const gen = streakGen.current;
    progress.stopAnimation((value) => {
      if (gen !== streakGen.current) return; // paused again before native answered
      const trip = (from: number) =>
        Animated.timing(progress, { toValue: 1, duration: STREAK_LOOP_MS * (1 - from), easing: Easing.linear, useNativeDriver: true });
      // Finish the current trip from the paused value, then loop whole trips. The loop must start at 0: Animated.loop resets to the
      // value it started from, so a loop started at 1 (the end of the first trip) animates 1 -> 1 and the streaks stand still.
      const rest = trip(value);
      streakAnim.current = rest;
      rest.start(({ finished }) => {
        if (!finished || gen !== streakGen.current || streakAnim.current !== rest) return;
        progress.setValue(0);
        const loop = Animated.loop(trip(0));
        streakAnim.current = loop;
        loop.start();
      });
    });
  }, [progress]);
  const pauseStreaks = React.useCallback(() => {
    clearTimers();
    streakGen.current += 1;
    streaksOn.current = false;
    streakAnim.current?.stop();
    streakAnim.current = null;
    watchdog.current = setTimeout(() => { watchdog.current = null; startStreaks(); }, STREAK_WATCHDOG_MS);
  }, [clearTimers, startStreaks]);
  const resumeStreaksSoon = React.useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    // A fling starts momentum right after the finger lifts; wait for it, so a fling does not resume and pause again.
    resumeTimer.current = setTimeout(() => {
      resumeTimer.current = null;
      if (watchdog.current) clearTimeout(watchdog.current);
      watchdog.current = null;
      startStreaks();
    }, 150);
  }, [startStreaks]);
  React.useEffect(() => {
    startStreaks();
    return () => {
      clearTimers();
      streakGen.current += 1;
      streakAnim.current?.stop();
    };
  }, [startStreaks, clearTimers]);

  const bandTops = React.useMemo(() => {
    const tops: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
    geo.items.forEach((item) => { if (item.type === 'band') tops[item.chapter] = headerH + item.top; });
    return tops;
  }, [geo, headerH]);
  // Native only: the scroll position drives the band slices' opacity on the UI thread, with no JavaScript listener.
  const onScroll = React.useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }),
    [scrollY]
  );
  // A band's own slice of the trail belongs to its place in the journey. Once the band is pinned it moves with the screen, so its
  // slice is hidden there; the rows scrolling underneath draw (and the blur shows) the trail instead.
  const bandSliceOpacity = React.useMemo(() => {
    const o = (top: number) => scrollY.interpolate({ inputRange: [top - 0.5, top + 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
    return { 1: o(bandTops[1]), 2: o(bandTops[2]), 3: o(bandTops[3]) };
  }, [scrollY, bandTops]);

  const stickyHeaderIndices = React.useMemo(
    // VirtualizedList counts ListHeaderComponent as cell 0, so data item i is cell i + 1.
    () => geo.items.flatMap((item, index) => (item.type === 'band' ? [index + 1] : [])),
    [geo]
  );
  const getItemLayout = React.useCallback(
    (_: ArrayLike<Item> | null | undefined, index: number) => ({ length: geo.items[index].height, offset: headerH + geo.items[index].top, index }),
    [geo, headerH]
  );
  const onBandLayout = React.useCallback((chapter: 1 | 2 | 3, height: number) => {
    const key = `band${chapter}`;
    setFixes((prev) => (prev[key] !== undefined && Math.abs(prev[key] - height) < 0.01 ? prev : { ...prev, [key]: height }));
  }, []);
  const onRowLayout = React.useCallback((item: RowItem, height: number) => {
    if (!item.variable) return;
    const fix = Math.round((height - item.modelContent) * 100) / 100;
    setFixes((prev) => (Math.abs((prev[item.key] ?? 0) - fix) < 0.5 ? prev : { ...prev, [item.key]: fix }));
  }, []);

  const shape: Shape = journeyVariant === 'milestonesCircle' ? 'circle' : journeyVariant === 'milestonesDiamond' ? 'diamond' : journeyVariant === 'milestonesPill' ? 'pill' : 'square';
  const renderItem = React.useCallback(
    ({ item }: { item: Item }) => (
      <ListRow
        item={item}
        geo={geo}
        p={p}
        progress={progress}
        bandOpacity={item.type === 'band' ? bandSliceOpacity[item.chapter] : null}
        sectionWidth={sectionWidth}
        gap={gap}
        currentOrder={currentOrder}
        shape={shape}
        quizActivityCounts={quizActivityCounts}
        writeRunActivityCounts={writeRunActivityCounts}
        debugActivityCounts={debugActivityCounts}
        onOpenWorld={onOpenWorld}
        onOpenActivity={onOpenActivity}
        onRowLayout={onRowLayout}
        onBandLayout={onBandLayout}
      />
    ),
    [geo, p, progress, bandSliceOpacity, sectionWidth, gap, currentOrder, shape, quizActivityCounts, writeRunActivityCounts, debugActivityCounts, onOpenWorld, onOpenActivity, onRowLayout, onBandLayout]
  );

  const onHeaderLayout = React.useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    setHeaderH((cur) => (Math.abs(cur - h) < 0.5 ? cur : h));
  }, []);
  const header = React.useMemo(
    () => (
      <View style={{ paddingTop: 16 }} onLayout={onHeaderLayout}>
        <JourneyCard p={p} current={current} completed={completed} />
      </View>
    ),
    [p, current, completed, onHeaderLayout]
  );
  const footer = React.useMemo(() => <View style={{ height: 48 }} />, []);

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      {headerH === 0 ? (
        // Measure the journey card once: the item offsets and the band pin points include its height.
        <View style={{ opacity: 0 }}>{header}</View>
      ) : (
        <AnimatedFlatList
          ref={listRef as any}
          data={geo.items}
          keyExtractor={(item: Item) => item.key}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={3}
          // A row is about one screen tall: keep 3 screens above and below mounted so a fling rarely reaches an unrendered row,
          // and mount new rows a few at a time.
          windowSize={7}
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={30}
          removeClippedSubviews
          stickyHeaderIndices={stickyHeaderIndices}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          onScroll={onScroll}
          onScrollBeginDrag={pauseStreaks}
          onScrollEndDrag={resumeStreaksSoon}
          onMomentumScrollBegin={pauseStreaks}
          onMomentumScrollEnd={resumeStreaksSoon}
          onTouchEnd={resumeStreaksSoon}
          onTouchCancel={resumeStreaksSoon}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
});

const EMPTY_COUNTS: Record<number, number> = {};
/** One full trip of the light streaks (HomeScreen's Trail uses the same 7s). */
const STREAK_LOOP_MS = 7000;
/** Longest the streaks stay paused without any scroll/touch end (a long fling resumes them early; a lost end event cannot freeze them). */
const STREAK_WATCHDOG_MS = 2500;
/** Cache each row's static layer as a GPU bitmap. Off: measured slower on device (see ListRow). */
const CACHE_ROWS = false;

const s = StyleSheet.create({
  section: { alignSelf: 'center', alignItems: 'center' },
});
