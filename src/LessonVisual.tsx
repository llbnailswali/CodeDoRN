import React from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { BW, fz, MAIN } from './shell';
import { lh } from './parts';
import { FONT } from './theme';
import type { FlowBranch, FlowDecision, FlowItem, FlowLadder, FlowLoop, FlowStep, FlowTone, Graph, GraphEdge, GraphNode, LessonVisual as LessonVisualData } from './lessonData';

// The "How it works" card of the Learn stage: a small flowchart (src/data/lessonVisuals.ts in web-editor/ holds the content).
// Everything is drawn with Views and react-native-svg, from the card's measured width, so it fits any phone and both themes.

const px = (n: number) => fz(n * MAIN);

type Kind = 'step' | 'yes' | 'no';

const palette = (dark: boolean) => ({
  start: dark
    ? { bg: 'rgba(91,33,182,0.35)', border: '#7C3AED', text: '#EDE9FE', sub: '#C4B5FD' }
    : { bg: '#EDE9FE', border: '#C4B5FD', text: '#312E81', sub: '#6D28D9' },
  step: dark
    ? { bg: '#1E2438', border: '#334155', text: '#E2E8F0', sub: '#94A3B8' }
    : { bg: '#F8FAFC', border: '#CBD5E1', text: '#1E293B', sub: '#64748B' },
  yes: dark
    ? { bg: 'rgba(20,83,45,0.45)', border: '#16A34A', text: '#DCFCE7', sub: '#86EFAC' }
    : { bg: '#DCFCE7', border: '#86EFAC', text: '#14532D', sub: '#15803D' },
  no: dark
    ? { bg: 'rgba(127,29,29,0.45)', border: '#DC2626', text: '#FEE2E2', sub: '#FCA5A5' }
    : { bg: '#FEE2E2', border: '#FCA5A5', text: '#7F1D1D', sub: '#B91C1C' },
  decision: dark
    ? { fill: 'rgba(30,64,175,0.35)', stroke: '#3B82F6', text: '#DBEAFE' }
    : { fill: '#DBEAFE', stroke: '#60A5FA', text: '#1E3A8A' },
  line: dark ? '#64748B' : '#94A3B8',
  arrowYes: '#22C55E',
  arrowNo: '#EF4444',
  muted: dark ? '#94A3B8' : '#64748B',
  title: dark ? '#FFFFFF' : '#0F172A',
  note: dark ? { bg: 'rgba(113,63,18,0.4)', border: '#CA8A04', text: '#FEF08A' } : { bg: '#FEF9C3', border: '#FACC15', text: '#713F12' },
  chipBg: dark ? 'rgba(30,27,75,0.8)' : '#EEF2FF',
  chipBorder: dark ? 'rgba(67,56,202,0.5)' : '#E0E7FF',
  chipText: dark ? '#A5B4FC' : '#4338CA',
});
type Pal = ReturnType<typeof palette>;

const toneOf = (tone: FlowTone | undefined): Kind => (tone === 'yes' ? 'yes' : tone === 'no' ? 'no' : 'step');
const arrowColor = (tone: FlowTone | undefined, p: Pal) => (tone === 'yes' ? p.arrowYes : tone === 'no' ? p.arrowNo : p.line);
const chipColors = (tone: FlowTone, p: Pal, dark: boolean) =>
  tone === 'yes'
    ? { bg: p.yes.bg, border: p.yes.border, text: p.yes.text }
    : tone === 'no'
      ? { bg: p.no.bg, border: p.no.border, text: p.no.text }
      : { bg: dark ? '#1E2438' : '#F1F5F9', border: p.step.border, text: p.step.text };

// ---------------------------------------------------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------------------------------------------------

/** A box for one step. `grow` makes it fill the height of its column (so branches end on the same line). */
function StepBox({ step, dark, grow, dashed, onLayout }: { step: FlowStep; dark: boolean; grow?: boolean; dashed?: boolean; onLayout?: (e: LayoutChangeEvent) => void }) {
  const p = palette(dark);
  const c = step.kind === 'start' || step.kind === 'end' ? p.start : p[toneOf(step.tone)];
  return (
    <View
      onLayout={onLayout}
      style={[
        styles.box,
        { backgroundColor: c.bg, borderColor: c.border, borderRadius: step.kind === 'start' || step.kind === 'end' ? 10 : 12, borderStyle: dashed ? 'dashed' : 'solid' },
        grow ? { flex: 1 } : null,
      ]}
    >
      <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12.5), lineHeight: lh(12.5, 1.35), color: c.text, textAlign: 'center', includeFontPadding: false }}>{step.text}</Text>
      {step.code ? (
        <Text style={{ fontFamily: FONT.mono.md, fontSize: px(11), lineHeight: lh(11, 1.4), color: c.sub, textAlign: 'center', marginTop: 3, includeFontPadding: false }}>{step.code}</Text>
      ) : null}
    </View>
  );
}

/** A straight arrow pointing down. */
function DownArrow({ color, height = 22, label, labelColor, dark }: { color: string; height?: number; label?: string; labelColor?: string; dark: boolean }) {
  const p = palette(dark);
  return (
    <View style={{ height, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={14} height={height} viewBox={`0 0 14 ${height}`}>
        <Path d={`M7 0 V${height - 6}`} stroke={color} strokeWidth={1.6} fill="none" />
        <Polygon points={`2.5,${height - 7} 11.5,${height - 7} 7,${height}`} fill={color} />
      </Svg>
      {label ? (
        <Text numberOfLines={1} style={{ position: 'absolute', left: '50%', marginLeft: 10, fontFamily: FONT.outfit.sb, fontSize: px(10.5), color: labelColor ?? p.muted, includeFontPadding: false }}>{label}</Text>
      ) : null}
    </View>
  );
}

function Chip({ text, tone, dark }: { text: string; tone: FlowTone; dark: boolean }) {
  const p = palette(dark);
  const c = chipColors(tone, p, dark);
  return (
    <View style={{ alignSelf: 'center', backgroundColor: c.bg, borderColor: c.border, borderWidth: BW, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(10.5), lineHeight: lh(10.5, 1.3), color: c.text, includeFontPadding: false }}>{text}</Text>
    </View>
  );
}

/** A vertical run of steps joined by arrows. */
function StepColumn({ steps, dark, tone, growLast, onLastLayout }: { steps: FlowStep[]; dark: boolean; tone?: FlowTone; growLast?: boolean; onLastLayout?: (e: LayoutChangeEvent) => void }) {
  const p = palette(dark);
  return (
    <>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <DownArrow color={arrowColor(tone, p)} height={16} dark={dark} /> : null}
            <StepBox step={s} dark={dark} grow={growLast && last} onLayout={last ? onLastLayout : undefined} />
          </React.Fragment>
        );
      })}
    </>
  );
}

function Diamond({ text, sub, width, height, dark }: { text: string; sub?: string; width: number; height: number; dark: boolean }) {
  const p = palette(dark);
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
        <Polygon
          points={`${width / 2},1 ${width - 1},${height / 2} ${width / 2},${height - 1} 1,${height / 2}`}
          fill={p.decision.fill}
          stroke={p.decision.stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </Svg>
      <View style={{ width: width * 0.68 }}>
        <Text numberOfLines={3} style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.25), color: p.decision.text, textAlign: 'center', includeFontPadding: false }}>{text}</Text>
        {sub ? <Text numberOfLines={1} style={{ fontFamily: FONT.mono.md, fontSize: px(10), lineHeight: lh(10, 1.3), color: p.decision.text, opacity: 0.8, textAlign: 'center', marginTop: 2, includeFontPadding: false }}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const diamondSize = (w: number, text: string) => {
  const width = Math.max(130, Math.min(w * (text.length > 16 ? 0.5 : 0.44), 210));
  return { width, height: text.length > 26 ? 96 : 80 };
};

// ---------------------------------------------------------------------------------------------------------------------
// Decision: a diamond with 2 branches (Yes / No) or more, side by side
// ---------------------------------------------------------------------------------------------------------------------
const GAP = 10;
const CONNECT = 30;

function DecisionBlock({ item, width, dark, hasNext }: { item: FlowDecision; width: number; dark: boolean; hasNext: boolean }) {
  const p = palette(dark);
  const n = item.branches.length;
  const d = diamondSize(width, item.text);
  const colW = (width - GAP * (n - 1)) / n;
  const centers = item.branches.map((_, i) => i * (colW + GAP) + colW / 2);
  const cx = width / 2;
  const two = n === 2;
  const topH = d.height + CONNECT;
  return (
    <View style={{ width }}>
      <View style={{ width, height: topH }}>
        <Svg width={width} height={topH} viewBox={`0 0 ${width} ${topH}`} style={StyleSheet.absoluteFill}>
          {item.branches.map((b, i) => {
            const color = arrowColor(b.tone, p);
            const x = centers[i];
            const path = two
              ? `M${i === 0 ? cx - d.width / 2 : cx + d.width / 2} ${d.height / 2} H${x} V${topH - 6}`
              : `M${cx} ${d.height - 1} V${d.height + CONNECT / 2} H${x} V${topH - 6}`;
            return (
              <React.Fragment key={i}>
                <Path d={path} stroke={color} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
                <Polygon points={`${x - 4.5},${topH - 7} ${x + 4.5},${topH - 7} ${x},${topH}`} fill={color} />
              </React.Fragment>
            );
          })}
        </Svg>
        <View style={{ position: 'absolute', left: (width - d.width) / 2, top: 0 }}>
          <Diamond text={item.text} width={d.width} height={d.height} dark={dark} />
        </View>
        {two
          ? item.branches.map((b, i) => (
              <View key={i} style={{ position: 'absolute', top: d.height / 2 - 28, ...(i === 0 ? { left: 0 } : { right: 0 }) }}>
                <Chip text={b.label} tone={b.tone} dark={dark} />
              </View>
            ))
          : null}
      </View>
      <View style={{ flexDirection: 'row', gap: GAP, alignItems: 'stretch' }}>
        {item.branches.map((b: FlowBranch, i) => (
          <View key={i} style={{ width: colW }}>
            {!two ? (
              <View style={{ marginBottom: 6 }}>
                <Chip text={b.label} tone={b.tone} dark={dark} />
              </View>
            ) : null}
            <StepColumn steps={b.steps} dark={dark} tone={b.tone} growLast />
          </View>
        ))}
      </View>
      {hasNext ? (
        <Svg width={width} height={26} viewBox={`0 0 ${width} 26`}>
          {centers.map((x, i) => (
            <Path key={i} d={`M${x} 0 V11 H${cx}`} stroke={p.line} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
          ))}
          <Path d={`M${cx} 11 V20`} stroke={p.line} strokeWidth={1.6} fill="none" />
          <Polygon points={`${cx - 4.5},19 ${cx + 4.5},19 ${cx},26`} fill={p.line} />
        </Svg>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Loop: a diamond (the check), the body, and an arrow back up to the check
// ---------------------------------------------------------------------------------------------------------------------
const GUTTER = 26;

function LoopBlock({ item, width, dark, hasNext }: { item: FlowLoop; width: number; dark: boolean; hasNext: boolean }) {
  const p = palette(dark);
  const inner = width - GUTTER;
  const d = diamondSize(inner, item.text);
  const [body, setBody] = React.useState<{ y: number; h: number } | null>(null);
  const [last, setLast] = React.useState<{ y: number; h: number } | null>(null);
  const cx = inner / 2;
  const backColor = p.line;
  let backPath: string | null = null;
  if (body && last) {
    const fromY = body.y + last.y + last.h / 2;
    const toY = d.height / 2;
    backPath = `M${inner} ${fromY} H${width - 8} V${toY} H${cx + d.width / 2 + 6}`;
  }
  return (
    <View style={{ width }}>
      <View style={{ width: inner, alignItems: 'center' }}>
        <Diamond text={item.text} width={d.width} height={d.height} dark={dark} />
        <DownArrow color={p.arrowYes} height={24} label={item.yesLabel ?? 'Yes'} labelColor={p.arrowYes} dark={dark} />
        <View
          style={{ width: inner }}
          onLayout={(e) => setBody({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
        >
          <StepColumn steps={item.body} dark={dark} tone="yes" onLastLayout={(e) => setLast({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })} />
        </View>
        <DownArrow color={p.arrowNo} height={hasNext ? 26 : 22} label={item.noLabel ?? 'No (done)'} labelColor={p.arrowNo} dark={dark} />
      </View>
      {backPath ? (
        <Svg width={width} height={body ? body.y + body.h : 0} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path d={backPath} stroke={backColor} strokeWidth={1.6} fill="none" strokeLinejoin="round" strokeDasharray="5 4" />
          <Polygon points={`${cx + d.width / 2 + 7},${d.height / 2 - 4.5} ${cx + d.width / 2 + 7},${d.height / 2 + 4.5} ${cx + d.width / 2 + 1},${d.height / 2}`} fill={backColor} />
        </Svg>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Ladder: a chain of tests (else if / when), each with its own result
// ---------------------------------------------------------------------------------------------------------------------
const ARROW_W = 46;

function SideArrow({ color, label, dark }: { color: string; label: string; dark: boolean }) {
  const p = palette(dark);
  return (
    <View style={{ width: ARROW_W, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(10.5), color: p.muted, marginBottom: 1, includeFontPadding: false }}>{label}</Text>
      <Svg width={ARROW_W - 8} height={10} viewBox={`0 0 ${ARROW_W - 8} 10`}>
        <Path d={`M0 5 H${ARROW_W - 15}`} stroke={color} strokeWidth={1.6} />
        <Polygon points={`${ARROW_W - 16},1 ${ARROW_W - 16},9 ${ARROW_W - 8},5`} fill={color} />
      </Svg>
    </View>
  );
}

function TestPill({ text, tone, dark }: { text: string; tone: 'decision' | 'no'; dark: boolean }) {
  const p = palette(dark);
  const c = tone === 'no' ? { bg: p.no.bg, border: p.no.border, text: p.no.text } : { bg: p.decision.fill, border: p.decision.stroke, text: p.decision.text };
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, borderColor: c.border, borderWidth: BW, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', minHeight: 44 }}>
      <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(12), lineHeight: lh(12, 1.3), color: c.text, textAlign: 'center', includeFontPadding: false }}>{text}</Text>
    </View>
  );
}

function LadderBlock({ item, dark }: { item: FlowLadder; dark: boolean }) {
  const p = palette(dark);
  return (
    <View>
      {item.rows.map((r, i) => (
        <React.Fragment key={i}>
          <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
            <TestPill text={r.test} tone="decision" dark={dark} />
            <SideArrow color={p.arrowYes} label="Yes" dark={dark} />
            <View style={{ flex: 1 }}>
              <StepBox step={{ ...r.result, tone: r.result.tone ?? 'yes' }} dark={dark} grow />
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <DownArrow color={p.arrowNo} height={22} label="No" labelColor={p.arrowNo} dark={dark} />
            </View>
            <View style={{ width: ARROW_W }} />
            <View style={{ flex: 1 }} />
          </View>
        </React.Fragment>
      ))}
      {item.otherwise ? (
        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
          <TestPill text={item.otherwiseLabel ?? 'otherwise'} tone="no" dark={dark} />
          <SideArrow color={p.arrowNo} label="" dark={dark} />
          <View style={{ flex: 1 }}>
            <StepBox step={{ ...item.otherwise, tone: item.otherwise.tone ?? 'no' }} dark={dark} grow />
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------------------------------------------------

function EyeIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Circle cx={12} cy={12} r={3} fill={color} />
    </Svg>
  );
}

function renderItem(item: FlowItem, index: number, items: FlowItem[], width: number, dark: boolean): React.ReactNode {
  const p = palette(dark);
  const hasNext = index < items.length - 1;
  const prev = index > 0 ? items[index - 1] : undefined;
  // A decision and a loop draw their own closing arrow when something follows, so only the other items need one.
  const needsArrow = prev !== undefined && prev.kind !== 'decision' && prev.kind !== 'loop';
  const before = needsArrow ? <DownArrow color={p.line} height={20} dark={dark} /> : null;
  let block: React.ReactNode;
  if (item.kind === 'decision') block = <DecisionBlock item={item} width={width} dark={dark} hasNext={hasNext} />;
  else if (item.kind === 'loop') block = <LoopBlock item={item} width={width} dark={dark} hasNext={hasNext} />;
  else if (item.kind === 'ladder') block = <LadderBlock item={item} dark={dark} />;
  else {
    block = (
      <View style={{ alignSelf: 'center', width: item.kind === 'step' ? width : Math.max(150, width * 0.6) }}>
        <StepBox step={item} dark={dark} />
      </View>
    );
  }
  return (
    <React.Fragment key={index}>
      {before}
      {block}
    </React.Fragment>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Graph: nodes on a fixed grid, edges routed along it, notes (the visuals that follow VISUAL_QUALITY_STANDARD.md)
// ---------------------------------------------------------------------------------------------------------------------
type Pt = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

const anchorOf = (r: Rect, side: 'top' | 'bottom' | 'left' | 'right'): Pt =>
  side === 'top' ? { x: r.x + r.w / 2, y: r.y } : side === 'bottom' ? { x: r.x + r.w / 2, y: r.y + r.h } : side === 'left' ? { x: r.x, y: r.y + r.h / 2 } : { x: r.x + r.w, y: r.y + r.h / 2 };

const CORNER = 10;

/**
 * A path made of horizontal and vertical segments with rounded corners: "M x y", then "H x" or "V y", and "Q cx cy x y" at each turn.
 * (Only M, H, V and Q are used, so test-lesson-visual.tsx can check every coordinate.)
 */
function roundedPath(pts: Pt[]): string {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i];
    const prev = pts[i - 1];
    const next = pts[i + 1];
    if (!next) {
      d += Math.abs(cur.x - prev.x) < 0.5 ? ` V${cur.y}` : ` H${cur.x}`;
      break;
    }
    const inLen = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
    const outLen = Math.abs(next.x - cur.x) + Math.abs(next.y - cur.y);
    const r = Math.min(CORNER, inLen / 2, outLen / 2);
    const sx = Math.sign(cur.x - prev.x);
    const sy = Math.sign(cur.y - prev.y);
    const ex = Math.sign(next.x - cur.x);
    const ey = Math.sign(next.y - cur.y);
    const start: Pt = { x: cur.x - sx * r, y: cur.y - sy * r };
    const end: Pt = { x: cur.x + ex * r, y: cur.y + ey * r };
    d += Math.abs(cur.x - prev.x) < 0.5 ? ` V${start.y}` : ` H${start.x}`;
    d += ` Q${cur.x} ${cur.y} ${end.x} ${end.y}`;
  }
  return d;
}

function GraphView({ graph, width, dark }: { graph: Graph; width: number; dark: boolean }) {
  const p = palette(dark);
  const totalW = graph.colWeights.reduce((a, b) => a + b, 0);
  const colW = graph.colWeights.map((w) => (w / totalW) * width);
  const colX = colW.map((_, i) => colW.slice(0, i).reduce((a, b) => a + b, 0));
  const rowY = graph.rowHeights.map((_, i) => graph.rowHeights.slice(0, i).reduce((a, b) => a + b, 0));
  const height = graph.rowHeights.reduce((a, b) => a + b, 0);
  const cell = (col: number, row: number, span = 1) => ({ x: colX[col], y: rowY[row], w: colW.slice(col, col + span).reduce((a, b) => a + b, 0), h: graph.rowHeights[row] });
  const rects: Record<string, Rect> = {};
  for (const n of graph.nodes) {
    const c = cell(n.col, n.row, n.colSpan);
    const w = (n.w ?? 1) * (c.w - (n.kind === 'test' ? 4 : 12));
    const h = n.h ?? c.h - 14;
    rects[n.id] = { x: c.x + (c.w - w) / 2 + (n.dx ?? 0), y: c.y + (c.h - h) / 2, w, h };
  }
  const toneColor = (tone: FlowTone | undefined) => arrowColor(tone, p);

  const edges = graph.edges.map((e: GraphEdge) => {
    const a = anchorOf(rects[e.from], e.out);
    const b = anchorOf(rects[e.to], e.into);
    let pts: Pt[];
    if ((e.route === 'lane' || e.route === 'around') && e.lane) {
      const laneX = colX[e.lane.col] + e.lane.dx;
      pts = [a, { x: laneX, y: a.y }, { x: laneX, y: b.y }, b];
    } else if (e.route === 'elbow') {
      pts = [a, { x: b.x, y: a.y }, b];
    } else if (e.route === 'merge') {
      const yPre = b.y - 20;
      pts = Math.abs(a.x - b.x) < 0.5 ? [a, b] : [a, { x: a.x, y: yPre }, { x: b.x, y: yPre }, b];
    } else if (Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5) {
      pts = [a, b];
    } else {
      const mid = (a.y + b.y) / 2;
      pts = [a, { x: a.x, y: mid }, { x: b.x, y: mid }, b];
    }
    return { e, pts, a, b };
  });

  const noteRects = (graph.notes ?? []).map((n) => {
    const c = cell(n.col, n.row, n.colSpan);
    const w = (n.w ?? 1) * c.w;
    const h = n.h ?? c.h - 10;
    return { n, r: { x: c.x + c.w - w, y: c.y + (c.h - h) / 2, w, h } as Rect };
  });

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
        {edges.map(({ e, pts, b }, i) => {
          const color = toneColor(e.tone);
          const faded = !!e.faded;
          // The line stops where the arrowhead starts (7 px before the target), and the arrowhead points into the target's side.
          const back = e.into === 'top' ? { x: 0, y: -7 } : e.into === 'bottom' ? { x: 0, y: 7 } : e.into === 'left' ? { x: -7, y: 0 } : { x: 7, y: 0 };
          const shown = pts.slice(0, -1).concat([{ x: b.x + back.x, y: b.y + back.y }]);
          const head =
            e.into === 'top' || e.into === 'bottom'
              ? `${b.x - 4.5},${b.y + back.y} ${b.x + 4.5},${b.y + back.y} ${b.x},${b.y}`
              : `${b.x + back.x},${b.y - 4.5} ${b.x + back.x},${b.y + 4.5} ${b.x},${b.y}`;
          return (
            <React.Fragment key={i}>
              <Path d={roundedPath(shown)} stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeDasharray={faded ? '5 4' : undefined} opacity={faded ? 0.6 : 1} />
              <Polygon points={head} fill={color} opacity={faded ? 0.6 : 1} />
            </React.Fragment>
          );
        })}
        {noteRects.map(({ n, r }, i) => {
          if (n.connectToEdge === undefined) return null;
          const path = edges[n.connectToEdge]?.pts;
          if (!path) return null;
          const y = r.y + r.h / 2;
          let targetX: number | null = null;
          for (let k = 1; k < path.length; k++) {
            if (Math.abs(path[k].x - path[k - 1].x) < 0.5 && y >= Math.min(path[k].y, path[k - 1].y) && y <= Math.max(path[k].y, path[k - 1].y)) targetX = path[k].x;
          }
          if (targetX === null) return null;
          return <Path key={i} d={`M${r.x} ${y} H${targetX}`} stroke={p.note.border} strokeWidth={1.4} strokeDasharray="4 3" fill="none" />;
        })}
      </Svg>
      {graph.nodes.map((n: GraphNode) => {
        const r = rects[n.id];
        return (
          <View key={n.id} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: n.faded ? 0.8 : 1 }}>
            {n.kind === 'test' ? (
              <Diamond text={n.text} sub={n.sub} width={r.w} height={r.h} dark={dark} />
            ) : (
              <StepBox step={{ kind: n.kind === 'start' || n.kind === 'end' ? n.kind : 'step', text: n.text, code: n.sub, tone: n.tone }} dark={dark} grow dashed={n.faded} />
            )}
          </View>
        );
      })}
      {edges.map(({ e, a, pts }, i) => {
        if (!e.label) return null;
        const opacity = e.faded ? 0.75 : 1;
        if (e.labelAt === 'middle') {
          // The middle of the longest straight part of the path, with the chip centred on the line.
          let best = { len: -1, x: 0, y: 0 };
          for (let k = 1; k < pts.length; k++) {
            const len = Math.abs(pts[k].x - pts[k - 1].x) + Math.abs(pts[k].y - pts[k - 1].y);
            if (len > best.len) best = { len, x: (pts[k].x + pts[k - 1].x) / 2, y: (pts[k].y + pts[k - 1].y) / 2 };
          }
          return (
            <View key={`l${i}`} style={{ position: 'absolute', left: best.x - 32, top: best.y - 11, width: 64, alignItems: 'center', opacity }}>
              <Chip text={e.label} tone={e.tone ?? 'neutral'} dark={dark} />
            </View>
          );
        }
        return (
          <View
            key={`l${i}`}
            style={{
              position: 'absolute',
              top: e.out === 'bottom' ? a.y + 6 : a.y - 30,
              ...(e.out === 'left' ? { right: width - a.x + 6 } : { left: e.out === 'bottom' ? a.x + 8 : a.x + 6 }),
              opacity,
            }}
          >
            <Chip text={e.label} tone={e.tone ?? 'neutral'} dark={dark} />
          </View>
        );
      })}
      {noteRects.map(({ n, r }, i) => (
        <View key={`n${i}`} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: p.note.bg, borderColor: p.note.border, borderWidth: BW, borderRadius: 10, padding: 8, justifyContent: 'center' }}>
          <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(11), lineHeight: lh(11, 1.3), color: p.note.text, includeFontPadding: false }}>{n.text}</Text>
        </View>
      ))}
    </View>
  );
}

/** The card shown between the lesson's intro and its code example. */
export function LessonVisual({ visual, dark }: { visual: LessonVisualData; dark: boolean }) {
  const p = palette(dark);
  const [width, setWidth] = React.useState(0);
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: BW,
        borderColor: dark ? '#262C3D' : 'rgba(226,232,240,0.9)',
        backgroundColor: dark ? '#141824' : '#FBFCFE',
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <Text style={{ flexShrink: 1, fontFamily: FONT.outfit.sb, fontSize: px(14), lineHeight: lh(14, 1.4286), color: p.title, includeFontPadding: false }}>{visual.title ?? 'How it works'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: p.chipBg, borderColor: p.chipBorder, borderWidth: BW, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
          <EyeIcon color={p.chipText} />
          <Text style={{ fontFamily: FONT.outfit.sb, fontSize: px(11), lineHeight: lh(11, 1.3), color: p.chipText, includeFontPadding: false }}>Visual Explanation</Text>
        </View>
      </View>
      <View onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}>
        {width <= 0 ? <View style={{ height: 120 }} /> : visual.graph ? <GraphView graph={visual.graph} width={width} dark={dark} /> : (visual.items ?? []).map((item, i, all) => renderItem(item, i, all, width, dark))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
