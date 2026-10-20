import React from 'react';
import { Animated, Easing, Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { BW, Icon, fz } from './shell';
import { FONT } from './theme';
import type { BadgeRarity } from './badges';

const BADGE_GLOW = require('../assets/achievements/badge_glow.png');
const INDIGO = '#4338CA';

// Geometry of the hero: a 220 x 196 stage with the 170px badge in the middle. Everything else is sized from these.
const W = 220;
const H = 196;
const ART = 170;
const K = ART / 224;
const CX = W / 2;
const CY = H / 2;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** A value that eases 0 -> 1 -> 0 forever (a gentle back-and-forth). */
function useSwing(ms: number, delay = 0) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const run = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: ms, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    run.start();
    return () => run.stop();
  }, [v, ms, delay]);
  return v;
}

/** A value that runs 0 -> 1 forever and jumps back to 0 (a steady turn). */
function useTurn(ms: number) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const run = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }));
    run.start();
    return () => run.stop();
  }, [v, ms]);
  return v;
}

const hexPoints = (r: number, cx: number, cy: number) => Array.from({ length: 6 }, (_, i) => `${(cx + r * Math.cos(((60 * i - 90) * Math.PI) / 180)).toFixed(1)},${(cy + r * Math.sin(((60 * i - 90) * Math.PI) / 180)).toFixed(1)}`).join(' ');

/** Uncommon and Rare: a soft band of light sweeps across the badge, clipped to its hexagon, every few seconds. */
function ShimmerSweep() {
  const x = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    // The band moves the SVG attribute, so this one cannot use the native driver; it is a small drawing.
    const run = Animated.loop(Animated.sequence([
      Animated.delay(1400),
      Animated.timing(x, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: false }),
    ]));
    run.start();
    return () => run.stop();
  }, [x]);
  return <Svg width={ART} height={ART} style={StyleSheet.absoluteFill} pointerEvents="none">
    <Defs>
      <ClipPath id="hexClip"><Polygon points={hexPoints(ART * 0.464, ART / 2, ART / 2)} /></ClipPath>
      <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
        <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.55" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </LinearGradient>
    </Defs>
    <G clipPath="url(#hexClip)">
      <G rotation={22} origin={`${ART / 2}, ${ART / 2}`}>
        <AnimatedRect x={x.interpolate({ inputRange: [0, 1], outputRange: [-90, ART + 30] })} y={-40} width={50} height={ART + 80} fill="url(#shine)" />
      </G>
    </G>
  </Svg>;
}

const STAR = 'M12 1l2.2 8.8L23 12l-8.800 2.200L12 23l-2.200-8.800L1 12l8.800-2.200Z';

/** Epic: a few small stars circle the badge and twinkle. */
function OrbitSparkles({ color }: { color: string }) {
  const turn = useTurn(11000);
  const twinkle = useSwing(900);
  const steps = Array.from({ length: 33 }, (_, i) => i / 32);
  const items = [
    { phase: 0, r: 112 * K, size: 14 }, { phase: 0.2, r: 118 * K, size: 10 }, { phase: 0.4, r: 110 * K, size: 12 },
    { phase: 0.6, r: 120 * K, size: 9 }, { phase: 0.8, r: 114 * K, size: 11 },
  ];
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {items.map((it, i) => <Animated.View key={i} style={{
      position: 'absolute', left: CX - it.size / 2, top: CY - it.size / 2, width: it.size, height: it.size,
      opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [1, 0.35] : [0.35, 1] }),
      transform: [
        { translateX: turn.interpolate({ inputRange: steps, outputRange: steps.map((t) => Math.cos((t + it.phase) * Math.PI * 2) * it.r) }) },
        { translateY: turn.interpolate({ inputRange: steps, outputRange: steps.map((t) => Math.sin((t + it.phase) * Math.PI * 2) * it.r * 0.82) }) },
        { scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [1.1, 0.6] : [0.6, 1.1] }) },
      ],
    }}><Svg width={it.size} height={it.size} viewBox="0 0 24 24"><Path d={STAR} fill={color} /></Svg></Animated.View>)}
  </View>;
}

/** Legendary: gold specks rise from below the badge and fade out near the top, each on its own rhythm. */
const DUST = ([
  { x: 60, d: 0, ms: 3600, s: 5 }, { x: 95, d: 900, ms: 4200, s: 4 }, { x: 130, d: 400, ms: 3900, s: 6 }, { x: 165, d: 1500, ms: 4400, s: 4 },
  { x: 200, d: 700, ms: 3700, s: 5 }, { x: 78, d: 2000, ms: 4100, s: 3 }, { x: 148, d: 2400, ms: 3800, s: 4 }, { x: 112, d: 1200, ms: 4300, s: 3 }, { x: 184, d: 2800, ms: 4000, s: 5 },
]).map((d) => ({ ...d, x: Math.round(d.x * (W / 260)) }));
function Speck({ x, d, ms, s, color }: { x: number; d: number; ms: number; s: number; color: string }) {
  const t = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const run = Animated.loop(Animated.sequence([
      Animated.delay(d),
      Animated.timing(t, { toValue: 1, duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]));
    run.start();
    return () => run.stop();
  }, [t, d, ms]);
  return <Animated.View style={{
    position: 'absolute', left: x, top: H - 16, width: s, height: s, borderRadius: s / 2, backgroundColor: color,
    opacity: t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.95, 0.5, 0] }),
    transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.75] }) }, { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, x % 2 ? 10 : -10, 0] }) }],
  }} />;
}
function GoldDust({ color }: { color: string }) {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{DUST.map((p) => <Speck key={p.x} {...p} color={color} />)}</View>;
}

/**
 * The hero of the detail sheet: the glow, the badge and everything that makes it feel alive.
 *  - the badge flips on opening, floats gently, and can be dragged sideways to spin like a coin;
 *  - the glow breathes; the effect on top depends on the rarity (only for earned badges);
 *  - a locked badge with artwork shows as a silhouette with a shimmering question mark.
 */
export function BadgeHero({ source, hasArt, rarity, on, inProgress, dark, accent, check, lock }: {
  source: ImageSourcePropType; hasArt: boolean; rarity: BadgeRarity; on: boolean; inProgress: boolean; dark: boolean; accent: string; check: boolean; lock: boolean;
}) {
  const flip = React.useRef(new Animated.Value(0)).current;
  const spin = React.useRef(new Animated.Value(0)).current;
  const spinNow = React.useRef(0);
  const spinStart = React.useRef(0);
  const float = useSwing(2600);
  const breathe = useSwing(3200);

  React.useEffect(() => {
    const run = Animated.timing(flip, { toValue: 1, duration: 800, delay: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    run.start();
    const id = spin.addListener(({ value }) => { spinNow.current = value; });
    return () => { run.stop(); spin.removeListener(id); };
  }, [flip, spin]);

  const settle = React.useCallback(() => {
    spin.stopAnimation((v) => {
      Animated.spring(spin, { toValue: Math.round(v / 360) * 360, friction: 6, tension: 50, useNativeDriver: true }).start();
    });
  }, [spin]);
  const pan = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderGrant: () => { spin.stopAnimation((v) => { spinStart.current = v; }); },
    onPanResponderMove: (_, g) => spin.setValue(spinStart.current + g.dx * 0.9),
    onPanResponderRelease: (_, g) => {
      Animated.decay(spin, { velocity: g.vx * 0.9, deceleration: 0.996, useNativeDriver: true }).start(settle);
    },
    onPanResponderTerminate: settle,
  }), [spin, settle]);

  const base = on ? 0.42 : inProgress ? 0.34 : 0.16;
  const rotate = Animated.add(Animated.multiply(flip, 360), spin).interpolate({ inputRange: [-7200, 7200], outputRange: ['-7200deg', '7200deg'] });
  const silhouette = !on && !inProgress && hasArt;
  const gold = dark ? '#F5C76B' : '#E8A03C';

  return <View style={s.stage}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Image source={BADGE_GLOW} resizeMode="contain" style={[s.glow, {
        opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [base * 0.72, base] }),
        transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.07] }) }],
      }]} />
      {on && rarity === 'Epic' && <OrbitSparkles color={accent} />}
      {on && rarity === 'Legendary' && <GoldDust color={gold} />}
    </View>

    <Animated.View {...pan.panHandlers} style={[s.art, { transform: [{ perspective: 900 }, { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [-4, 5] }) }, { rotateY: rotate }] }]}>
      <Image source={source} resizeMode="contain" style={[s.artImage, silhouette && { tintColor: dark ? '#05070D' : '#1B2033', opacity: 0.88 }, !on && !inProgress && !silhouette && hasArt && { opacity: 0.5 }]} />
      {on && (rarity === 'Uncommon' || rarity === 'Rare') && <ShimmerSweep />}
      {silhouette && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.questionWrap, { opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.7] }) }]}><Text style={s.question}>?</Text></Animated.View>}
    </Animated.View>

    {check && <View pointerEvents="none" style={[s.bubble, s.checkBubble]}><Icon name="check" size={15} exact color="#FFFFFF" /></View>}
    {lock && <View pointerEvents="none" style={[s.bubble, s.lockBubble, { backgroundColor: dark ? '#252C3A' : '#FFFFFF', borderColor: dark ? '#3A4254' : '#E4E6F0' }]}><Icon name="lock" size={14} exact color={dark ? '#CBD5E1' : '#475569'} /></View>}
  </View>;
}

/**
 * The goal card of a badge that is under way: the bar fills from empty, the count runs up to the real number,
 * and the "only N more" line gives one small pulse once it has landed.
 */
export function ProgressCard({ condition, value, total, left, dark, text, muted }: { condition: string; value: number; total: number; left: number; dark: boolean; text: string; muted: string }) {
  const t = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(0)).current;
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const id = t.addListener(({ value: v }) => setCount(Math.round(v * value)));
    const run = Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 1000, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    run.start();
    return () => { run.stop(); t.removeListener(id); };
  }, [t, pulse, value]);
  return <View style={[s.goalCard, { backgroundColor: dark ? '#1C2231' : '#F8F9FC', borderColor: dark ? 'rgba(255,255,255,0.08)' : '#E6E8F0' }]}>
    <View style={s.goalTop}>
      <View style={[s.goalIcon, { backgroundColor: dark ? '#2A3040' : '#EEEFFB' }]}><Icon name="assignment_turned_in" size={13} exact color={INDIGO} /></View>
      <Text style={[s.goalText, { color: text }]} numberOfLines={2}>{condition}</Text>
      <Text style={s.goalCount}>{count} / {total}</Text>
    </View>
    <View style={[s.goalTrack, { backgroundColor: dark ? '#2A3040' : '#E4E6F0' }]}>
      <Animated.View style={[s.goalFill, { width: t.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(value / total) * 100}%`] }) }]} />
    </View>
    <Animated.Text style={[s.goalNote, { color: muted, transformOrigin: 'left center', transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>{`🔥 Only ${left} more to unlock!`}</Animated.Text>
  </View>;
}

const s = StyleSheet.create({
  stage: { width: W, height: H, alignItems: 'center', justifyContent: 'center', marginTop: 8, overflow: 'visible' },
  glow: { position: 'absolute', width: 400, height: 400, left: CX - 200, top: CY - 200 },
  art: { width: ART, height: ART },
  artImage: { position: 'absolute', left: 0, top: 0, width: ART, height: ART },
  questionWrap: { alignItems: 'center', justifyContent: 'center' },
  question: { color: '#FFFFFF', fontFamily: FONT.outfit.b, fontSize: 64 },
  bubble: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  checkBubble: { top: 10, right: 22, width: 26, height: 26, borderRadius: 13, backgroundColor: '#4DB07F' },
  lockBubble: { top: 16, right: 22, width: 30, height: 30, borderRadius: 15, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  goalCard: { alignSelf: 'stretch', borderWidth: BW, borderRadius: 14, padding: 12, marginTop: 16, gap: 9 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  goalIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  goalText: { flex: 1, fontFamily: FONT.outfit.sb, fontSize: fz(12) },
  goalCount: { color: INDIGO, fontFamily: FONT.outfit.b, fontSize: fz(12), minWidth: 44, textAlign: 'right' },
  goalTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 3, backgroundColor: INDIGO },
  goalNote: { fontFamily: FONT.body, fontSize: fz(11) },
});
