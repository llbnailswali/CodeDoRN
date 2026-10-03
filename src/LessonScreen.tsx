import React from 'react';
import { Animated, BackHandler, LayoutChangeEvent, Modal, NativeModules, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BW, Icon, MAIN, fz, raisedShadows } from './shell';
import { KotlinLines } from './kotlinCode';
import { HorizontalCodeScroll } from './HorizontalCodeScroll';
import { LESSONS, LessonData } from './lessonData';
import { lh } from './parts';
import { ShadowStack } from './shadows';
import { FONT } from './theme';

// The five-stage lesson screen (web: src/components/Detail.tsx with Learn.tsx, Explore.tsx, Predict.tsx and Mastered.tsx). Learn, Explore
// and Predict are native; Write & Run and Debug open the web app's own stage in an Android activity over this screen (WebStage module,
// src/components/NativeStageHost.tsx on the web side) and return "continue" or "back". Nothing is saved by this screen. The lesson content is the real web data (lessonData.ts, generated).

type StageKey = 'learn' | 'explore' | 'predict' | 'writeRun' | 'debug' | 'mastered';

const STAGE_LABELS: Record<StageKey, string> = {
  learn: 'LEARN', explore: 'EXPLORE', predict: 'PREDICT', writeRun: 'WRITE & RUN', debug: 'DEBUG', mastered: 'MASTERED',
};
const CONTINUE_LABELS: Record<StageKey, string> = {
  learn: 'Learn', explore: 'Explore', predict: 'Predict', writeRun: 'Write & Run', debug: 'Debug', mastered: 'Mastered',
};

type WebStageApi = { open: (lessonKey: string, stage: string, dark: boolean, practice?: boolean) => Promise<'continue' | 'continue_debug' | 'back'> };
const WebStage: WebStageApi | undefined = NativeModules.WebStage;

const px = (n: number) => fz(n * MAIN);
const INDIGO = '#4F46E5';

const tk = (d: boolean) => ({
  page: d ? '#0F131D' : '#F1F4F9',
  title: d ? '#FFFFFF' : '#0F172A',
  body: d ? '#94A3B8' : '#475569',
  bodyStrong: d ? '#CBD5E1' : '#475569',
  card: d ? '#171B26' : '#FFFFFF',
  cardBorder: d ? '#262C3D' : 'rgba(226,232,240,0.8)',
  codeBg: d ? '#0A0E18' : '#EEF1F6',
  codeBorder: d ? '#1E2438' : '#E2E8F0',
  codeBg2: d ? '#0F131D' : '#F8FAFC',
  codeBorder2: d ? '#262C3D' : 'rgba(226,232,240,0.7)',
  faint: '#94A3B8',
  tagBg: d ? 'rgba(30,27,75,0.8)' : '#EEF2FF',
  tagBorder: d ? 'rgba(67,56,202,0.5)' : '#E0E7FF',
  tagText: d ? '#A5B4FC' : '#4338CA',
  pillBg: d ? '#0F131D' : '#F1F5F9',
  pillBorder: d ? '#262C3D' : 'transparent',
  pillText: d ? '#CBD5E1' : '#475569',
});

const cardShadow = (d: boolean, strong?: boolean) =>
  d
    ? [{ dy: strong ? 10 : 1, blur: strong ? 15 : 3, rgb: '0,0,0', alpha: strong ? 0.35 : 0.3 }]
    : [{ dy: strong ? 4 : 1, blur: strong ? 6 : 3, rgb: '0,0,0', alpha: strong ? 0.1 : 0.08 }];

// ---------------------------------------------------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------------------------------------------------

function Card({ dark, style, children, active, shadow = true }: { dark: boolean; style?: object; children: React.ReactNode; active?: boolean; shadow?: boolean }) {
  const t = tk(dark);
  return (
    <View>
      <View
        style={[
          { borderRadius: 16, borderWidth: BW, backgroundColor: t.card, borderColor: active ? (dark ? 'rgba(99,102,241,0.4)' : 'rgba(199,210,254,0.9)') : t.cardBorder, padding: 14, elevation: shadow ? (active ? 4 : 2) : 0, shadowColor: '#000', shadowOffset: { width: 0, height: active ? 3 : 1 }, shadowOpacity: shadow ? (dark ? 0.25 : 0.10) : 0, shadowRadius: active ? 5 : 2 },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function NumberTag({ text, dark }: { text: string; dark: boolean }) {
  const t = tk(dark);
  return (
    <View style={{ backgroundColor: t.tagBg, borderColor: t.tagBorder, borderWidth: BW, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, justifyContent: 'center' }}>
      <Text style={{ fontFamily: FONT.mono.b, fontSize: px(12), lineHeight: lh(12, 1.3333), color: t.tagText, includeFontPadding: false }}>{text}</Text>
    </View>
  );
}

function LangPill({ text, dark }: { text: string; dark: boolean }) {
  const t = tk(dark);
  return (
    <View style={{ backgroundColor: t.pillBg, borderColor: t.pillBorder, borderWidth: dark ? BW : 0, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
      <Text style={{ fontFamily: FONT.body, fontSize: px(11), lineHeight: lh(11, 1.5), color: t.pillText, includeFontPadding: false }}>{text}</Text>
    </View>
  );
}

const heading = (dark: boolean, size: number, extra?: object) => ({
  fontFamily: FONT.outfit.sb, fontSize: px(size), color: dark ? '#FFFFFF' : '#0F172A', letterSpacing: -0.025 * size * MAIN, includeFontPadding: false, ...extra,
});

/** Code in a horizontally scrolling block (the web's overflow-x-auto + whitespace-pre). */
const CodeScroll = HorizontalCodeScroll;

type ExploreCardData = NonNullable<LessonData['explore']>['cards'][number];
const ExploreExampleCard = React.memo(function ExploreExampleCard({ card, dark, active, index, onSelect }: { card: ExploreCardData; dark: boolean; active: boolean; index: number; onSelect: (index: number) => void }) {
  const t = tk(dark);
  return (
    <Pressable onPress={() => onSelect(index)}>
      <Card dark={dark} active={active} style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
            <NumberTag text={card.number} dark={dark} />
            <Text style={{ flexShrink: 1, fontFamily: FONT.outfit.b, fontSize: px(18), lineHeight: lh(18, 1.5556), color: t.title, includeFontPadding: false }}>{card.title}</Text>
          </View>
          <LangPill text={card.language} dark={dark} />
        </View>
        <Text style={{ fontFamily: FONT.body, fontSize: px(14), lineHeight: lh(14, 1.4286), marginBottom: 12, color: dark ? '#CBD5E1' : '#475569', includeFontPadding: false }}>{card.subtitle}</Text>
        <View style={{ marginHorizontal: -14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, backgroundColor: t.codeBg2, borderWidth: BW, borderColor: t.codeBorder2 }}>
          <CodeScroll><KotlinLines lines={card.code} dark={dark} size={14} /></CodeScroll>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(11), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, color: dark ? '#94A3B8' : '#64748B', marginBottom: 8, includeFontPadding: false }}>WHAT IT MEANS</Text>
          <View style={{ gap: 6 }}>
            {card.whatItMeans.map((item, m) => (
              <View key={m} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.5), color: '#6366F1', fontWeight: '700', includeFontPadding: false }}>•</Text>
                <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.5), color: dark ? '#CBD5E1' : '#475569', includeFontPadding: false }}>
                  <Text style={{ fontFamily: FONT.mono.r, fontSize: px(11), backgroundColor: dark ? '#0F131D' : '#F1F5F9', color: dark ? '#E2E8F0' : '#1E293B' }}> {item.label} </Text>
                  {' → '}{item.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ borderRadius: 12, padding: 14, borderWidth: BW, backgroundColor: dark ? 'rgba(30,27,75,0.4)' : 'rgba(238,242,255,0.6)', borderColor: dark ? 'rgba(55,48,163,0.4)' : '#E0E7FF' }}>
          <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(10), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, color: dark ? '#A5B4FC' : '#4338CA', marginBottom: 4, includeFontPadding: false }}>WHAT CHANGED</Text>
          <Text style={{ fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.5), color: dark ? '#E2E8F0' : '#1E293B', includeFontPadding: false }}>{card.whatChanged}</Text>
        </View>
      </Card>
    </Pressable>
  );
});

// ---------------------------------------------------------------------------------------------------------------------
// Header, progress strip, bottom bar
// ---------------------------------------------------------------------------------------------------------------------

function LessonHeader({ dark, title, topInset, onBack, onToggleTheme, showBook }: { dark: boolean; title: string; topInset: number; onBack: () => void; onToggleTheme: () => void; showBook: boolean }) {
  const t = tk(dark);
  return (
    <View style={{ paddingTop: topInset, backgroundColor: dark ? 'rgba(15,19,29,0.95)' : 'rgba(255,255,255,0.95)', borderBottomWidth: BW, borderBottomColor: dark ? '#262C3D' : 'rgba(226,232,240,0.9)', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: dark ? 0.28 : 0.14, shadowRadius: 3, zIndex: 10 }}>
      <View style={s.headerInner}>
        <View>
          <ShadowStack r={12} shadows={raisedShadows(dark)} />
          <Pressable onPress={onBack} style={[s.hBtn, { backgroundColor: dark ? '#151B28' : '#E8EAF0', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.9)' }]}>
            <Icon name="arrow_back" color={dark ? '#E2E8F0' : '#1E2433'} />
          </Pressable>
        </View>
        <Text numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontFamily: FONT.outfit.b, fontSize: px(16), lineHeight: lh(16, 1.5), letterSpacing: -0.025 * 16 * MAIN, color: t.title, includeFontPadding: false }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {showBook && (
            <View style={[s.hBtn, { backgroundColor: dark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', borderColor: dark ? 'rgba(99,102,241,0.3)' : '#C7D2FE' }]}>
              <Icon name="auto_stories" color={dark ? '#818CF8' : '#4F46E5'} />
              <View style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1' }} />
            </View>
          )}
          <Pressable onPress={onToggleTheme} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={dark ? 'light_mode' : 'dark_mode'} color={dark ? '#FBBF24' : '#334155'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ProgressStrip({ dark, topic, stages, index, onJump }: { dark: boolean; topic: string; stages: StageKey[]; index: number; onJump: (k: StageKey) => void }) {
  return (
    <View style={{ marginTop: 8, marginBottom: 12 }}>
      <ShadowStack r={12} shadows={cardShadow(dark)} />
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: BW,
          backgroundColor: dark ? '#171B26' : 'rgba(255,255,255,0.9)', borderColor: dark ? '#262C3D' : 'rgba(226,232,240,0.8)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, paddingRight: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: INDIGO }} />
          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3333), letterSpacing: 0.025 * 12 * MAIN, color: dark ? '#A5B4FC' : '#312E81', includeFontPadding: false }}>
            {topic}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {stages.map((key, idx) => {
            const active = idx === index;
            const passed = idx < index;
            const size = active ? 10 : passed ? 8 : 6;
            return (
              <Pressable key={key} hitSlop={8} onPress={() => onJump(key)}>
                <View
                  style={{
                    width: size, height: size, borderRadius: size / 2,
                    backgroundColor: active || passed ? INDIGO : dark ? '#334155' : '#CBD5E1',
                    ...(active ? { borderWidth: 2, borderColor: dark ? 'rgba(99,102,241,0.4)' : '#A5B4FC' } : null),
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function BottomBar({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const page = dark ? '#0F131D' : '#F1F4F9';
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 6, paddingBottom: 20, paddingHorizontal: 8 }}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="barfade" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={page} stopOpacity="1" />
              <Stop offset="0.5" stopColor={page} stopOpacity="0.95" />
              <Stop offset="1" stopColor={page} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#barfade)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

function PrimaryButton({ label, icon = 'arrow_forward', onPress, disabled, dark, flex }: { label: string; icon?: string; onPress: () => void; disabled?: boolean; dark: boolean; flex?: boolean }) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      {!disabled && <ShadowStack r={16} shadows={[{ dy: 8, blur: 12, rgb: '79,70,229', alpha: 0.35 }]} />}
      <Pressable
        onPress={onPress}
        style={[
          s.primary,
          disabled
            ? { backgroundColor: dark ? '#171B26' : '#E2E8F0', borderWidth: BW, borderColor: dark ? '#262C3D' : '#CBD5E1', opacity: dark ? 0.6 : 0.75 }
            : { backgroundColor: INDIGO },
        ]}
      >
        <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(16), lineHeight: lh(16, 1.5), color: disabled ? '#64748B' : '#FFFFFF', includeFontPadding: false }}>{label}</Text>
        <Icon name={icon} color={disabled ? '#64748B' : '#FFFFFF'} />
      </Pressable>
    </View>
  );
}

function TapHint({ dark, enabled = true, label = 'Tap to continue', onPress, extra }: { dark: boolean; enabled?: boolean; label?: string; onPress: () => void; extra?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 }}>
      <View>
        <ShadowStack r={999} shadows={[{ dy: 4, blur: 6, rgb: '0,0,0', alpha: dark ? 0.4 : 0.1 }]} />
        <Pressable
          onPress={onPress}
          style={[
            s.pill,
            enabled
              ? { backgroundColor: dark ? '#171B26' : '#FFFFFF', borderColor: dark ? 'rgba(99,102,241,0.5)' : '#C7D2FE' }
              : { backgroundColor: dark ? 'rgba(18,22,34,0.9)' : 'rgba(241,245,249,0.9)', borderColor: dark ? '#262C3D' : '#E2E8F0', opacity: 0.8 },
          ]}
        >
          <Icon name={enabled ? 'touch_app' : 'lock'} color={enabled ? '#6366F1' : '#94A3B8'} />
          <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3333), letterSpacing: 0.025 * 12 * MAIN, color: enabled ? (dark ? '#A5B4FC' : '#4338CA') : dark ? '#64748B' : '#94A3B8', includeFontPadding: false }}>
            {label}
          </Text>
        </Pressable>
      </View>
      {extra}
    </View>
  );
}

function RevealedItem({ children, animate, onLayout }: { children: React.ReactNode; animate: boolean; onLayout?: (e: LayoutChangeEvent) => void }) {
  const opacity = React.useRef(new Animated.Value(animate ? 0 : 1)).current;

  React.useEffect(() => {
    if (!animate) return;
    const animation = Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [animate, opacity]);

  return <Animated.View onLayout={onLayout} style={{ opacity }}>{children}</Animated.View>;
}

function SkipButton({ dark, onPress, tall }: { dark: boolean; onPress: () => void; tall?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        tall ? s.skipTall : s.pill,
        { backgroundColor: tall ? (dark ? '#171B26' : '#FFFFFF') : dark ? 'rgba(245,158,11,0.15)' : '#FFFBEB', borderColor: dark ? 'rgba(245,158,11,0.4)' : '#FCD34D' },
      ]}
    >
      <Icon name="fast_forward" color="#F59E0B" />
      <Text style={{ fontFamily: tall ? FONT.outfit.b : FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3333), color: dark ? '#FCD34D' : '#92400E', includeFontPadding: false }}>Skip</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Indicator rail (Explore / Predict): the numbered buttons that stick under the header
// ---------------------------------------------------------------------------------------------------------------------

function IndicatorRail({
  dark, labels, active, onPress, status, onLayoutBar,
}: {
  dark: boolean;
  labels: string[];
  active: number;
  onPress: (idx: number) => void;
  status?: (idx: number) => 'correct' | 'wrong' | 'locked' | null;
  onLayoutBar?: (h: number) => void;
}) {
  const ref = React.useRef<ScrollView>(null);
  const xs = React.useRef<number[]>([]);
  const width = React.useRef(0);
  React.useEffect(() => {
    const x = xs.current[active];
    if (x === undefined) return;
    const id = setTimeout(() => ref.current?.scrollTo({ x: Math.max(0, x - width.current / 2 + 21), animated: true }), 30);
    return () => clearTimeout(id);
  }, [active]);
  return (
    <View onLayout={(e) => onLayoutBar?.(e.nativeEvent.layout.height)} style={{ paddingVertical: 2, marginBottom: 10 }}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => (width.current = e.nativeEvent.layout.width)}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 2, paddingVertical: 4 }}
      >
        <View>
          <ShadowStack r={12} shadows={[{ dy: 4, blur: 6, rgb: '0,0,0', alpha: dark ? 0.4 : 0.1 }]} />
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 12, borderWidth: BW,
              backgroundColor: dark ? 'rgba(23,27,38,0.95)' : 'rgba(255,255,255,0.95)', borderColor: dark ? '#262C3D' : 'rgba(226,232,240,0.9)',
            }}
          >
            {labels.map((label, idx) => {
              const highlighted = active === idx;
              const st = status?.(idx) ?? null;
              const locked = st === 'locked';
              return (
                <Pressable
                  key={idx}
                  onLayout={(e: LayoutChangeEvent) => (xs.current[idx] = e.nativeEvent.layout.x + 6)}
                  onPress={() => onPress(idx)}
                  style={[
                    s.railBtn,
                    locked
                      ? { opacity: 0.4, borderColor: 'transparent' }
                      : highlighted
                      ? { backgroundColor: INDIGO, borderColor: 'rgba(99,102,241,0.5)' }
                      : { backgroundColor: dark ? '#121622' : '#F1F5F9', borderColor: dark ? '#262C3D' : '#E2E8F0' },
                  ]}
                >
                  <Text style={{ fontFamily: FONT.mono.b, fontSize: px(12), lineHeight: lh(12, 1.3333), letterSpacing: 0.05 * 12 * MAIN, color: highlighted && !locked ? '#FFFFFF' : dark ? '#94A3B8' : '#64748B', includeFontPadding: false }}>
                    {label}
                  </Text>
                  {st === 'correct' && <Icon name="check" size={13} exact color="#34D399" />}
                  {st === 'wrong' && <Icon name="close" size={13} exact color="#FB7185" />}
                  {st === 'locked' && <Icon name="lock" size={11} exact color="#64748B" />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The screen
// ---------------------------------------------------------------------------------------------------------------------

export function LessonScreen({
  dark, worldOrder, lessonTitle, topInset, onExit, onToggleTheme,
}: {
  dark: boolean;
  worldOrder: number;
  lessonTitle: string;
  topInset: number;
  onExit: () => void;
  onToggleTheme: () => void;
}) {
  const t = tk(dark);
  const lesson: LessonData | undefined = LESSONS[`${worldOrder}:${lessonTitle}`];

  const stages: StageKey[] = React.useMemo(
    () =>
      lesson
        ? ['learn', ...(lesson.explore ? (['explore'] as const) : []), ...(lesson.predict ? (['predict'] as const) : []), ...(lesson.hasWriteRun ? (['writeRun'] as const) : []), ...(lesson.hasDebug ? (['debug'] as const) : []), 'mastered']
        : ['learn'],
    [lesson]
  );

  const [stack, setStack] = React.useState<StageKey[]>(['learn']);
  const current = stack[stack.length - 1];
  const index = Math.max(0, stages.indexOf(current));
  const nextKey = stages[index + 1];
  const nextLabel = nextKey ? CONTINUE_LABELS[nextKey] : undefined;

  // Reveal progress is kept per stage, so going back finds a stage as it was left.
  const [learnReveal, setLearnReveal] = React.useState(0);
  const [exploreReveal, setExploreReveal] = React.useState(0);
  const [exploreIdx, setExploreIdx] = React.useState(0);
  const [predictReveal, setPredictReveal] = React.useState(0);
  const [predictIdx, setPredictIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [skipOpen, setSkipOpen] = React.useState(false);

  const scrollRef = React.useRef<ScrollView>(null);
  const stageOpacity = React.useRef(new Animated.Value(1)).current;
  const scrollY = React.useRef(0);
  const viewH = React.useRef(0);
  const contentH = React.useRef(0);
  const savedScroll = React.useRef<Partial<Record<StageKey, number>>>({});
  const cardTops = React.useRef<number[]>([]);
  const cardsY = React.useRef(0);
  const barH = React.useRef(44);
  const pendingLearnStep = React.useRef<number | null>(null);
  const revealScrollFrame = React.useRef<number | null>(null);
  const revealScrollTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCardScroll = React.useRef<number | null>(null);
  const pendingEndCard = React.useRef<number | null>(null);
  const cardScrollFrame = React.useRef<number | null>(null);
  const cardScrollTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (revealScrollFrame.current !== null) cancelAnimationFrame(revealScrollFrame.current);
    if (revealScrollTimer.current) clearTimeout(revealScrollTimer.current);
    if (cardScrollFrame.current !== null) cancelAnimationFrame(cardScrollFrame.current);
    if (cardScrollTimer.current) clearTimeout(cardScrollTimer.current);
  }, []);

  const onLearnItemLayout = (step: number) => {
    if (current !== 'learn' || pendingLearnStep.current !== step) return;
    pendingLearnStep.current = null;
    // The web waits for the revealed element to enter the layout before a smooth scroll.
    revealScrollFrame.current = requestAnimationFrame(() => {
      // RevealedItem fades in for ~280ms. Waiting until that animation and
      // its layout settle prevents the scroll animation from fighting the
      // content insertion and producing a visible jerk.
      revealScrollTimer.current = setTimeout(() => {
        const target = Math.max(0, contentH.current - viewH.current);
        scrollRef.current?.scrollTo({ y: target, animated: true });
      }, 50);
    });
  };

  const goNext = () => {
    if (!nextKey) return onExit();
    if (nextKey === 'writeRun' || nextKey === 'debug') {
      openWebStage(nextKey);
      return;
    }
    savedScroll.current[current] = scrollY.current;
    savedScroll.current[nextKey] = 0;
    setStack((st) => [...st, nextKey]);
  };
  const goBack = React.useCallback(() => {
    if (current === 'mastered') return onExit();
    if (stack.length <= 1) return onExit();
    savedScroll.current[current] = scrollY.current;
    setStack((st) => st.slice(0, -1));
  }, [stack.length, current, onExit]);
  const jump = (key: StageKey) => {
    savedScroll.current[current] = scrollY.current;
    // Stage navigation always opens the selected stage at its own top, rather than
    // restoring the scroll position of the stage that was just left.
    savedScroll.current[key] = 0;
    setStack((st) => {
      const at = st.lastIndexOf(key);
      return at >= 0 ? st.slice(0, at + 1) : [...st, key];
    });
  };

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (skipOpen) {
        setSkipOpen(false);
        return true;
      }
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack, skipOpen]);

  // Write & Run and Debug are the web's screens: open the stage over this one, then follow what the learner did there.
  const [webOpen, setWebOpen] = React.useState(false);
  const launching = React.useRef(false);
  const openWebStage = React.useCallback((requestedStage: 'writeRun' | 'debug') => {
    if (!lesson || !WebStage || launching.current) return;
    launching.current = true;
    setWebOpen(true);
    const stage = requestedStage;
    WebStage.open(lesson.key, stage, dark, false)
      .then((action) => {
        launching.current = false;
        setWebOpen(false);
        const completedStage = action === 'continue_debug' ? 'debug' : stage;
        if (action !== 'continue' && action !== 'continue_debug') return;

        const stageIndex = stages.indexOf(completedStage);
        const following = stages[stageIndex + 1];
        if (!following) {
          onExit();
        } else if (following === 'writeRun' || following === 'debug') {
          openWebStage(following);
        } else {
          setStack((st) => [...st, completedStage, following]);
        }
      })
      .catch(() => {
        launching.current = false;
        setWebOpen(false);
      });
  }, [lesson, dark, stages, onExit]);

  // Back to a stage: restore where it was scrolled. A first visit starts at the top.
  React.useEffect(() => {
    const y = savedScroll.current[current] ?? 0;
    pendingLearnStep.current = null;
    pendingCardScroll.current = null;
    if (revealScrollFrame.current !== null) cancelAnimationFrame(revealScrollFrame.current);
    if (revealScrollTimer.current) clearTimeout(revealScrollTimer.current);
    if (cardScrollFrame.current !== null) cancelAnimationFrame(cardScrollFrame.current);
    if (cardScrollTimer.current) clearTimeout(cardScrollTimer.current);
    stageOpacity.stopAnimation();
    stageOpacity.setValue(0);
    Animated.timing(stageOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    let firstFrame = 0;
    let secondFrame = 0;
    const id = setTimeout(() => {
      // Wait for the new stage's content to lay out before starting the native
      // scroll animation; this prevents the old content position from flashing.
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y, animated: false });
        });
      });
    }, 40);
    return () => {
      clearTimeout(id);
      if (firstFrame) cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [current, stageOpacity]);

  const scheduleCardScroll = (idx: number) => {
    if (cardScrollFrame.current !== null) cancelAnimationFrame(cardScrollFrame.current);
    if (cardScrollTimer.current) clearTimeout(cardScrollTimer.current);
    cardScrollFrame.current = requestAnimationFrame(() => {
      cardScrollTimer.current = setTimeout(() => {
        const top = cardTops.current[idx];
        if (top === undefined) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, cardsY.current + top - barH.current - 8), animated: true });
      }, 60);
    });
  };
  const onCardLayout = (idx: number, y: number) => {
    cardTops.current[idx] = y;
    if (pendingEndCard.current === idx) {
      pendingEndCard.current = null;
      requestAnimationFrame(() => setTimeout(() => scrollToEnd(), 60));
    }
    if (pendingCardScroll.current !== idx) return;
    pendingCardScroll.current = null;
    scheduleCardScroll(idx);
  };
  const scrollToCard = (idx: number, newlyRevealed = false) => {
    if (newlyRevealed) delete cardTops.current[idx];
    if (cardTops.current[idx] === undefined) pendingCardScroll.current = idx;
    else scheduleCardScroll(idx);
  };
  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 60);
    });
  };

  // Active number tags change on reveal or an explicit tap; scrolling only saves its restore position.

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: t.page }}>
        <LessonHeader dark={dark} title="Lesson" topInset={topInset} onBack={onExit} onToggleTheme={onToggleTheme} showBook={false} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(16), color: t.title, textAlign: 'center' }}>This lesson is not available yet.</Text>
        </View>
      </View>
    );
  }

  // ---- Learn ----
  const learn = lesson.learn;
  const learnMax = 3 + learn.keyIdeas.length;
  const learnFull = learnReveal >= learnMax;
  const revealLearn = () => {
    if (learnReveal < learnMax) {
      const next = learnReveal + 1;
      if (revealScrollFrame.current !== null) cancelAnimationFrame(revealScrollFrame.current);
      if (revealScrollTimer.current) clearTimeout(revealScrollTimer.current);
      pendingLearnStep.current = next;
      setLearnReveal(next);
    }
  };

  // ---- Explore ----
  const ex = lesson.explore;
  const exMax = ex?.cards.length ?? 0;
  const exFull = exploreReveal >= exMax;
  const revealExplore = () => {
    if (exploreReveal >= exMax) return;
    const next = exploreReveal + 1;
    setExploreReveal(next);
    setExploreIdx(next - 1);
    pendingEndCard.current = next - 1;
  };
  const exploreIndicator = (idx: number) => {
    if (exploreReveal < idx + 1) setExploreReveal(idx + 1);
    setExploreIdx(idx);
    scrollToCard(idx);
  };
  const selectExplore = React.useCallback((idx: number) => setExploreIdx(idx), []);

  // ---- Predict ----
  const pr = lesson.predict;
  const prMax = pr?.questions.length ?? 0;
  const correct = (q: number) => Boolean(pr?.questions[q]?.options.find((o) => o.id === answers[q])?.isCorrect);
  const answered = (q: number) => answers[q] !== undefined;
  const allRevealedCorrect = predictReveal === 0 || Array.from({ length: predictReveal }).every((_, i) => correct(i));
  const prFull = predictReveal >= prMax;
  const allCorrect = pr ? pr.questions.every((_, i) => correct(i)) : false;
  const scrollToUnsolved = () => {
    const first = Array.from({ length: Math.max(predictReveal, 1) }).findIndex((_, i) => !correct(i));
    const target = first !== -1 ? first : predictIdx;
    setPredictIdx(target);
    scrollToCard(target);
  };
  const revealPredict = () => {
    if (!allRevealedCorrect) return scrollToUnsolved();
    if (predictReveal >= prMax) return;
    const next = predictReveal + 1;
    setPredictReveal(next);
    setPredictIdx(next - 1);
    scrollToCard(next - 1, true);
  };
  const predictIndicator = (idx: number) => {
    if (idx < predictReveal) {
      setPredictIdx(idx);
      scrollToCard(idx);
    } else if (idx === predictReveal && allRevealedCorrect) revealPredict();
    else scrollToUnsolved();
  };
  const choose = (q: number, optId: string) => {
    setPredictIdx(q);
    setAnswers((a) => ({ ...a, [q]: optId }));
    scrollToEnd();
  };
  const autofillPredict = () => {
    if (!pr) return;
    const filled: Record<number, string> = {};
    pr.questions.forEach((q, i) => {
      const answer = q.options.find((option) => option.isCorrect);
      if (answer) filled[i] = answer.id;
    });
    setAnswers(filled);
    setPredictReveal(pr.questions.length);
    setPredictIdx(Math.max(0, pr.questions.length - 1));
    requestAnimationFrame(scrollToEnd);
  };

  // ---- the stage's scroll children (a sticky one is the indicator bar) ----
  const strip = <ProgressStrip key="strip" dark={dark} topic={lesson.topicTitle} stages={stages} index={index} onJump={jump} />;
  const tap = (key: string, node: React.ReactNode, onPress?: () => void) => (
    <Pressable key={key} onPress={onPress} disabled={!onPress}>
      {node}
    </Pressable>
  );

  let children: React.ReactNode[] = [];
  let sticky: number[] = [];
  let bottom: React.ReactNode = null;

  if (current === 'learn') {
    const reveal = learnFull ? undefined : revealLearn;
    children = [
      strip,
      tap(
        'learn-body',
        <View style={{ minHeight: 480 }}>
          <View style={{ paddingTop: 4, marginBottom: 8, paddingHorizontal: 10 }}>
            <Text style={heading(dark, 24, { lineHeight: lh(24, 1.3333), marginBottom: 6 })}>{learn.title}</Text>
          </View>
          {learnReveal >= 1 && (
            <RevealedItem animate={learnReveal === 1} onLayout={() => onLearnItemLayout(1)}>
              <Text style={{ fontFamily: FONT.body, fontSize: px(15), lineHeight: lh(15, 1.625), color: t.body, marginTop: 4, marginBottom: 12, paddingHorizontal: 10, includeFontPadding: false }}>
                {learn.subtitle}
              </Text>
            </RevealedItem>
          )}
          {learnReveal >= 2 && (
            <RevealedItem animate={learnReveal === 2} onLayout={() => onLearnItemLayout(2)}>
              <View style={{ marginTop: 4, marginBottom: 16 }}>
              <Card dark={dark}>
                <Text style={heading(dark, 14, { lineHeight: lh(14, 1.4286), marginBottom: 10, color: dark ? '#F8FAFC' : '#1E293B' })}>{learn.exampleTitle}</Text>
                <View style={{ borderRadius: 12, padding: 12, backgroundColor: t.codeBg, borderWidth: BW, borderColor: t.codeBorder }}>
                  <CodeScroll>
                    <KotlinLines lines={learn.codeSnippet} dark={dark} size={13} />
                  </CodeScroll>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
                  <View style={{ marginTop: -1 }}>
                    <Icon name="info" color={dark ? '#818CF8' : '#6366F1'} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.625), color: t.body, includeFontPadding: false }}>{learn.explanation}</Text>
                </View>
              </Card>
              </View>
            </RevealedItem>
          )}
          {learnReveal >= 3 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(12), lineHeight: lh(12, 1.3333), letterSpacing: 0.05 * 12 * MAIN, color: '#94A3B8', marginBottom: 10, paddingHorizontal: 4, includeFontPadding: false }}>KEY IDEAS</Text>
              <View style={{ gap: 8 }}>
                {learn.keyIdeas.map((idea, i) =>
                  learnReveal < 3 + i ? null : (
                    <RevealedItem key={idea.number} animate={learnReveal === 3 + i} onLayout={() => onLearnItemLayout(3 + i)}>
                      <Card dark={dark} style={{ padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 12 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2, backgroundColor: dark ? 'rgba(30,27,75,0.8)' : '#EEF2FF', borderWidth: BW, borderColor: dark ? 'rgba(67,56,202,0.5)' : '#E0E7FF' }}>
                        <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(12), lineHeight: lh(12, 1.3333), color: dark ? '#818CF8' : '#4F46E5', includeFontPadding: false }}>{idea.number}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(14), lineHeight: lh(14, 1.4286), color: dark ? '#FFFFFF' : '#1E293B', includeFontPadding: false }}>{idea.title}</Text>
                        <Text style={{ fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.5), marginTop: 2, color: dark ? '#94A3B8' : '#64748B', includeFontPadding: false }}>{idea.description}</Text>
                      </View>
                      </Card>
                    </RevealedItem>
                  )
                )}
              </View>
            </View>
          )}
          {learnReveal >= 3 + learn.keyIdeas.length && (
            <RevealedItem animate={learnReveal === 3 + learn.keyIdeas.length} onLayout={() => onLearnItemLayout(3 + learn.keyIdeas.length)}>
              <View
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: BW, marginBottom: 20,
                backgroundColor: dark ? 'rgba(30,27,75,0.4)' : 'rgba(99,102,241,0.08)', borderColor: dark ? 'rgba(99,102,241,0.3)' : 'rgba(199,210,254,0.8)',
              }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? '#171B26' : '#FFFFFF', borderWidth: BW, borderColor: dark ? 'rgba(99,102,241,0.3)' : '#E0E7FF' }}>
                <Icon name="lightbulb" color={dark ? '#818CF8' : '#4F46E5'} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONT.outfit.b, fontSize: px(10), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, color: dark ? '#818CF8' : '#4F46E5', marginBottom: 2, includeFontPadding: false }}>KEY TAKEAWAY</Text>
                <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.375), color: dark ? '#E2E8F0' : '#1E293B', includeFontPadding: false }}>{learn.keyTakeaway}</Text>
              </View>
              </View>
            </RevealedItem>
          )}
        </View>,
        reveal
      ),
    ];
    bottom = !learnFull ? (
      <TapHint dark={dark} onPress={revealLearn} extra={<SkipButton dark={dark} onPress={() => setSkipOpen(true)} />} />
    ) : (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <PrimaryButton dark={dark} flex label={`Continue to ${nextLabel ?? ''}`} onPress={goNext} />
        <SkipButton dark={dark} tall onPress={() => setSkipOpen(true)} />
      </View>
    );
  } else if (current === 'explore' && ex) {
    const reveal = exFull ? undefined : revealExplore;
    const head = (
      <View style={{ minHeight: 0 }}>
        <View style={{ paddingTop: 4, marginBottom: 8, paddingHorizontal: 10 }}>
          <Text style={heading(dark, 24, { lineHeight: lh(24, 1.3333), marginBottom: 6 })}>{ex.title}</Text>
        </View>
        {ex.subtitle.trim() !== '' && (
          <Text style={{ fontFamily: FONT.body, fontSize: px(15), lineHeight: lh(15, 1.375), color: dark ? '#CBD5E1' : '#475569', marginBottom: 8, paddingHorizontal: 10, includeFontPadding: false }}>{ex.subtitle}</Text>
        )}
      </View>
    );
    children = [strip, tap('head', head, reveal)];
    if (exploreReveal >= 1) {
      sticky = [2];
      children.push(
        <IndicatorRail
          key="rail"
          dark={dark}
          labels={ex.cards.map((c, i) => c.number || (i < 9 ? `0${i + 1}` : `${i + 1}`))}
          active={exploreIdx}
          onPress={exploreIndicator}
          onLayoutBar={(h) => (barH.current = h)}
        />
      );
      children.push(
        tap(
          'cards',
          <View onLayout={(e) => (cardsY.current = e.nativeEvent.layout.y)} style={{ gap: 16, marginBottom: 24 }}>
            {ex.cards.map((card, i) =>
              exploreReveal < 1 + i ? null : (
                <RevealedItem key={card.id} animate={exploreReveal === i + 1} onLayout={(e) => onCardLayout(i, e.nativeEvent.layout.y)}>
                  <ExploreExampleCard card={card} dark={dark} active={exploreIdx === i} index={i} onSelect={selectExplore} />
                </RevealedItem>
              )
            )}
          </View>
        )
      );
    }
    bottom = !exFull ? <TapHint dark={dark} onPress={revealExplore} /> : <PrimaryButton dark={dark} label={`Continue to ${nextLabel ?? ''}`} onPress={goNext} />;
  } else if (current === 'predict' && pr) {
    const reveal = !prFull && allRevealedCorrect ? revealPredict : undefined;
    const head = (
      <View>
        <View style={{ paddingTop: 4, marginBottom: 8, paddingHorizontal: 10 }}>
          <Text style={heading(dark, 24, { lineHeight: lh(24, 1.3333), marginBottom: 6 })}>{pr.title}</Text>
          {!!pr.subtitle && pr.subtitle.trim() !== '' && (
            <Text style={{ fontFamily: FONT.body, fontSize: px(15), lineHeight: lh(15, 1.375), color: dark ? '#CBD5E1' : '#475569', marginBottom: 8, includeFontPadding: false }}>{pr.subtitle}</Text>
          )}
          <Pressable onPress={autofillPredict} style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: BW, borderColor: dark ? '#3730A3' : '#C7D2FE', backgroundColor: dark ? 'rgba(79,70,229,0.18)' : '#EEF2FF' }}>
            <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), color: dark ? '#A5B4FC' : '#4338CA', includeFontPadding: false }}>Autofill answers</Text>
          </Pressable>
        </View>
      </View>
    );
    children = [strip, tap('head', head, reveal)];
    if (predictReveal >= 1) {
      sticky = [2];
      children.push(
        <IndicatorRail
          key="rail"
          dark={dark}
          labels={pr.questions.map((_, i) => (i < 9 ? `0${i + 1}` : `${i + 1}`))}
          active={predictIdx}
          onPress={predictIndicator}
          status={(i) => {
            if (correct(i)) return 'correct';
            if (answered(i)) return 'wrong';
            const revealed = predictReveal > i;
            return !revealed && (!allRevealedCorrect || i > predictReveal) ? 'locked' : null;
          }}
          onLayoutBar={(h) => (barH.current = h)}
        />
      );
      children.push(
        tap(
          'cards',
          <View onLayout={(e) => (cardsY.current = e.nativeEvent.layout.y)} style={{ gap: 16, marginBottom: 24 }}>
            {pr.questions.map((q, qi) => {
              if (predictReveal < 1 + qi) return null;
              const selected = answers[qi];
              const hasAnswer = selected !== undefined;
              const isOk = correct(qi);
              return (
                <RevealedItem key={q.id} animate={predictReveal === qi + 1} onLayout={(e) => onCardLayout(qi, e.nativeEvent.layout.y)}>
                  <Pressable onPress={() => setPredictIdx(qi)}>
                    <Card dark={dark} active={predictIdx === qi} style={{ gap: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                          <NumberTag text={qi < 9 ? `0${qi + 1}` : `${qi + 1}`} dark={dark} />
                          <Text style={{ flex: 1, fontFamily: FONT.outfit.b, fontSize: px(14), lineHeight: lh(14, 1.4286), color: t.title, includeFontPadding: false }}>{q.title || q.topicMeta}</Text>
                        </View>
                        {!!q.code && q.code.length > 0 && <LangPill text={q.language} dark={dark} />}
                      </View>
                      {!!q.code && q.code.length > 0 && (
                        <View style={{ borderRadius: 12, padding: 16, backgroundColor: t.codeBg2, borderWidth: BW, borderColor: dark ? '#262C3D' : 'rgba(226,232,240,0.8)' }}>
                          <CodeScroll>
                            <KotlinLines lines={q.code} dark={dark} size={12} />
                          </CodeScroll>
                        </View>
                      )}
                      <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(16), lineHeight: lh(16, 1.5), letterSpacing: -0.025 * 16 * MAIN, color: t.title, includeFontPadding: false }}>{q.prompt}</Text>
                      <View style={{ gap: 10 }}>
                        {q.options.map((opt) => {
                          const sel = selected === opt.id;
                          const ok = opt.isCorrect;
                          const palette = sel
                            ? dark
                              ? ok ? { bg: 'rgba(2,44,34,0.5)', border: '#10B981', text: '#A7F3D0' } : { bg: 'rgba(76,5,25,0.5)', border: '#F43F5E', text: '#FECDD3' }
                              : ok ? { bg: '#ECFDF5', border: '#10B981', text: '#064E3B' } : { bg: '#FFF1F2', border: '#F43F5E', text: '#881337' }
                            : dark
                            ? { bg: '#0F131D', border: '#262C3D', text: '#CBD5E1' }
                            : { bg: '#FFFFFF', border: 'rgba(226,232,240,0.8)', text: '#1E293B' };
                          return (
                            <Pressable
                              key={opt.id}
                              onPress={() => choose(qi, opt.id)}
                              style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 12, borderWidth: BW, backgroundColor: palette.bg, borderColor: palette.border }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                                <View
                                  style={{
                                    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: sel ? (ok ? '#059669' : '#E11D48') : dark ? '#171B26' : '#F1F5F9',
                                  }}
                                >
                                  <Text style={{ fontFamily: sel ? FONT.outfit.b : FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3333), color: sel ? '#FFFFFF' : dark ? '#94A3B8' : '#475569', includeFontPadding: false }}>{opt.id}</Text>
                                </View>
                                <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: px(14), lineHeight: lh(14, 1.4286), color: palette.text, includeFontPadding: false }}>{opt.label}</Text>
                              </View>
                              {sel && <Icon name={ok ? 'check_circle' : 'cancel'} filled color={ok ? '#10B981' : '#F43F5E'} />}
                            </Pressable>
                          );
                        })}
                      </View>
                      {hasAnswer && (
                        <View
                          style={{
                            borderRadius: 12, padding: 16, borderWidth: BW, gap: 8,
                            backgroundColor: isOk ? (dark ? 'rgba(2,44,34,0.4)' : 'rgba(236,253,245,0.8)') : dark ? 'rgba(76,5,25,0.4)' : 'rgba(255,241,242,0.8)',
                            borderColor: isOk ? (dark ? 'rgba(16,185,129,0.4)' : '#A7F3D0') : dark ? 'rgba(244,63,94,0.4)' : '#FECDD3',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Icon name={isOk ? 'check_circle' : 'info'} color={isOk ? (dark ? '#34D399' : '#059669') : dark ? '#FB7185' : '#E11D48'} />
                            <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3333), letterSpacing: 0.05 * 12 * MAIN, color: isOk ? (dark ? '#34D399' : '#059669') : dark ? '#FB7185' : '#E11D48', includeFontPadding: false }}>
                              {isOk ? 'CORRECT!' : 'INCORRECT'}
                            </Text>
                          </View>
                          <Text style={{ fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.625), color: dark ? '#CBD5E1' : '#475569', includeFontPadding: false }}>
                            <Text style={{ fontFamily: FONT.mono.r, fontSize: px(11), color: isOk ? (dark ? '#34D399' : '#059669') : dark ? '#FB7185' : '#E11D48' }}>{q.explanation.codeRef}</Text>
                            {' '}
                            {q.explanation.detail}
                          </Text>
                        </View>
                      )}
                    </Card>
                  </Pressable>
                </RevealedItem>
              );
            })}
          </View>
        )
      );
    }
    bottom = !prFull ? (
      <TapHint
        dark={dark}
        enabled={allRevealedCorrect}
        label={allRevealedCorrect ? 'Tap to continue' : answered(Math.max(0, predictReveal - 1)) ? 'Select the correct answer to continue' : 'Select an answer to continue'}
        onPress={() => (allRevealedCorrect ? revealPredict() : scrollToUnsolved())}
      />
    ) : (
      <PrimaryButton
        dark={dark}
        disabled={!allCorrect}
        icon={allCorrect ? 'arrow_forward' : 'lock'}
        label={allCorrect ? `Continue to ${nextLabel ?? ''}` : 'Select the correct answer to continue'}
        onPress={() => (allCorrect ? goNext() : scrollToUnsolved())}
      />
    );
  } else if (current === 'mastered') {
    const m = lesson.mastered;
    children = [
      strip,
      <View key="mastered" style={{ alignItems: 'center', paddingTop: 8 }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 12, marginBottom: 24 }}>
          <View>
            <ShadowStack r={999} shadows={cardShadow(dark)} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: BW, backgroundColor: dark ? '#171B26' : '#FFFFFF', borderColor: dark ? '#262C3D' : '#E2E8F0' }}>
              <Icon name="check_circle" filled color={dark ? '#818CF8' : '#4F46E5'} />
              <Text style={{ fontFamily: FONT.body, fontWeight: '700', fontSize: px(11), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, color: dark ? '#818CF8' : '#4F46E5', includeFontPadding: false }}>CONCEPT MASTERED!</Text>
              <Icon name="rocket_launch" color="#F59E0B" />
            </View>
          </View>
          <Text style={{ marginTop: 12, textAlign: 'center', fontFamily: FONT.outfit.b, fontSize: px(24), lineHeight: lh(24, 1.375), letterSpacing: -0.025 * 24 * MAIN, color: t.title, marginBottom: 8, includeFontPadding: false }}>{m.topicTitle}</Text>
          <Text style={{ textAlign: 'center', fontFamily: FONT.body, fontSize: px(12), lineHeight: lh(12, 1.625), color: dark ? '#94A3B8' : '#475569', includeFontPadding: false }}>{m.summary}</Text>
        </View>
        <View style={{ width: '100%', marginBottom: 20 }}>
          <Card dark={dark} style={{ padding: 14, gap: 16, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4, borderBottomWidth: BW, borderBottomColor: 'rgba(100,116,139,0.1)' }}>
              <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(11), lineHeight: lh(11, 1.5), letterSpacing: 0.05 * 11 * MAIN, color: dark ? '#94A3B8' : '#64748B', includeFontPadding: false }}>MASTERY VERIFICATION</Text>
              <View style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: dark ? '#0F131D' : '#F1F5F9', borderWidth: dark ? BW : 0, borderColor: '#262C3D' }}>
                <Text style={{ fontFamily: FONT.body, fontWeight: '700', fontSize: px(10), lineHeight: lh(10, 1.5), color: dark ? '#818CF8' : '#4F46E5', includeFontPadding: false }}>{m.passedCount}</Text>
              </View>
            </View>
            <View style={{ gap: 12 }}>
              {m.verificationItems.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2, backgroundColor: dark ? '#0F131D' : '#F1F5F9', borderWidth: dark ? BW : 0, borderColor: '#262C3D' }}>
                    <Icon name="check" filled={false} color={dark ? '#818CF8' : '#4F46E5'} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONT.body, fontWeight: '600', fontSize: px(12), lineHeight: lh(12, 1.3333), color: dark ? '#FFFFFF' : '#1E293B', includeFontPadding: false }}>{item.title}</Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: px(11), lineHeight: lh(11, 1.25), color: dark ? '#94A3B8' : '#64748B', includeFontPadding: false }}>{item.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </View>,
    ];
    bottom = <PrimaryButton dark={dark} label="Continue Journey" icon="arrow_forward" onPress={onExit} />;
  } else {
    // Debug is hosted entirely by the web activity as a child of Write & Run.
    // There is intentionally no duplicate/debug placeholder screen in RN.
    children = current === 'writeRun' ? [strip] : [];
    bottom = current === 'writeRun'
      ? <PrimaryButton dark={dark} label={webOpen ? 'Editor is open' : 'Open Write & Run'} icon="code" disabled={webOpen} onPress={() => openWebStage('writeRun')} />
      : null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.page }}>
      <LessonHeader dark={dark} title={`Stage ${index + 1} - ${STAGE_LABELS[current]}`} topInset={topInset} onBack={goBack} onToggleTheme={onToggleTheme} showBook={index === 0} />
      <Animated.ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        directionalLockEnabled
        style={[{ flex: 1 }, { opacity: stageOpacity }]}
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 110 }}
        stickyHeaderIndices={sticky}
        scrollEventThrottle={32}
        onLayout={(e) => { viewH.current = e.nativeEvent.layout.height; }}
        onContentSizeChange={(_, height) => { contentH.current = height; }}
        onScrollEndDrag={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        onMomentumScrollEnd={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
      >
        {children}
      </Animated.ScrollView>
      <BottomBar dark={dark}>{bottom}</BottomBar>

      <Modal transparent visible={skipOpen} animationType="fade" onRequestClose={() => setSkipOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={() => setSkipOpen(false)}>
          <Pressable style={{ backgroundColor: dark ? '#171B26' : '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28, gap: 8 }}>
            <Text style={heading(dark, 16, { fontFamily: FONT.outfit.b, marginBottom: 6 })}>Skip to a stage</Text>
            {stages.map((key, i) =>
              i <= index ? null : (
                <Pressable
                  key={key}
                  onPress={() => {
                    setSkipOpen(false);
                    setLearnReveal(10);
                    // Stage 4 and 5 are hosted by the same WebStageActivity as
                    // the normal Continue button. Do not put them on the RN
                    // stage stack, otherwise the skip action opens a blank
                    // native placeholder instead of the web editor/debugger.
                    if (key === 'writeRun' || key === 'debug') {
                      openWebStage(key);
                    } else {
                      jump(key);
                    }
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: BW, borderColor: dark ? '#262C3D' : '#E2E8F0', backgroundColor: dark ? '#0F131D' : '#F8FAFC' }}
                >
                  <NumberTag text={`${i + 1}`} dark={dark} />
                  <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(14), color: t.title, includeFontPadding: false }}>{CONTINUE_LABELS[key]}</Text>
                </Pressable>
              )
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  headerInner: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, gap: 8 },
  hBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  primary: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, borderWidth: BW },
  skipTall: { height: 56, paddingHorizontal: 16, borderRadius: 16, borderWidth: BW, flexDirection: 'row', alignItems: 'center', gap: 6 },
  railBtn: { minWidth: 42, height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: BW, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
