/**
 * Shapes for the Learn tab's journey path (TEMPORARY: the Profile tab has a switcher until one shape is chosen).
 * A style decides where each world node sits (sideways inset, small vertical drift) and how the trail curves between nodes.
 * Everything "random" is seeded, so a style always draws the same path and nothing jumps when the screen re-renders.
 */

export type PathStyleId = 'classic' | 'gentle' | 'meander' | 'winding' | 'wave';

export interface PathStyle {
  id: PathStyleId;
  label: string;
  description: string;
  /** Sideways distance (px) of a node from the screen edge. */
  insetMin: number;
  insetMax: number;
  /** Extra vertical gap (px) above a node. */
  driftMin: number;
  driftMax: number;
  /** 'classic' is the original even S-curve. 'trail' puts a bend between nodes. */
  curve: 'classic' | 'trail';
  /** Total sideways range (px) of the bend between two nodes. */
  bend: number;
  /** How much the trail leans sideways at a bend (0 = straight down). */
  lean: number;
  /** Lean at the nodes themselves. */
  endLean: number;
  /** Bends alternate left/right in a fixed rhythm instead of random sides. */
  alternate?: boolean;
  /** World 1 starts the whole trail (the line comes down from the Beginner strip into it): a fixed inset keeps the start left of centre like Classic. */
  firstInset?: number;
}

export const PATH_STYLES: PathStyle[] = [
  { id: 'classic', label: 'Classic', description: 'The original: even S-curves, nodes at a fixed distance from the edges.', insetMin: 32, insetMax: 32, driftMin: 0, driftMax: 0, curve: 'classic', bend: 0, lean: 0, endLean: 0 },
  { id: 'gentle', label: 'Gentle', description: 'Calm and mostly regular, with small random bends.', insetMin: 30, insetMax: 46, driftMin: 0, driftMax: 4, curve: 'trail', bend: 36, lean: 0.4, endLean: 0.2 },
  { id: 'meander', label: 'Meander', description: 'A natural winding road: varied node positions and bends on both sides.', insetMin: 22, insetMax: 62, driftMin: -6, driftMax: 10, curve: 'trail', bend: 70, lean: 1.1, endLean: 0.5 },
  { id: 'winding', label: 'Wild trail', description: 'A loose, adventurous trail with wide swings and uneven spacing.', insetMin: 18, insetMax: 80, driftMin: -10, driftMax: 14, curve: 'trail', bend: 110, lean: 1.8, endLean: 0.9, firstInset: 32 },
  { id: 'wave', label: 'Wave', description: 'A smooth, regular wave: every bend swings the opposite way.', insetMin: 36, insetMax: 36, driftMin: 0, driftMax: 0, curve: 'trail', bend: 56, lean: 0.9, endLean: 0.3, alternate: true },
];

export const DEFAULT_PATH_STYLE: PathStyleId = 'meander';

export const getPathStyle = (id: string | null | undefined): PathStyle =>
  PATH_STYLES.find((style) => style.id === id) ?? PATH_STYLES.find((style) => style.id === DEFAULT_PATH_STYLE)!;

export interface PathPoint {
  x: number;
  y: number;
}

/** Small deterministic random generator (mulberry32): the same seed always gives the same numbers. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sideways offset of a world's node from the screen edge, fixed per world. */
export const nodeInset = (style: PathStyle, worldOrder: number) =>
  worldOrder === 1 && style.firstInset !== undefined
    ? style.firstInset
    : style.insetMin + Math.round(seededRandom(worldOrder * 7919 + 11)() * (style.insetMax - style.insetMin));

/** Extra vertical gap above a world's node, fixed per world, so nodes are not evenly spaced. */
export const nodeDrift = (style: PathStyle, worldOrder: number) =>
  style.driftMin + Math.round(seededRandom(worldOrder * 104729 + 3)() * (style.driftMax - style.driftMin));

/**
 * The trail through the node centres. Between every two nodes it adds a bend, and every point has a lean, so a 'trail' meanders.
 * Curves are cubic Beziers whose handles follow the same lean on both sides of a point (a smooth join) and always run downwards
 * (no loops). Randomness is seeded by the segment number, so the active path is an exact prefix of the full path.
 */
export function buildTrail(points: PathPoint[], straightSegmentIndices: number[], width: number, style: PathStyle) {
  const lo = 26;
  const hi = Math.max(lo + 1, width - 26);
  const clampX = (x: number) => Math.min(hi, Math.max(lo, x));
  const f = (n: number) => n.toFixed(1);
  type Waypoint = { x: number; y: number; lean: number };
  const segments: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (straightSegmentIndices.includes(i) && Math.abs(b.x - a.x) < 8) {
      segments.push(`L ${f(b.x)},${f(b.y)}`);
      continue;
    }
    if (style.curve === 'classic') {
      const dy = b.y - a.y;
      segments.push(`C ${f(a.x)},${f(a.y + dy * 0.55)} ${f(b.x)},${f(b.y - dy * 0.55)} ${f(b.x)},${f(b.y)}`);
      continue;
    }
    const rand = seededRandom(i * 2654435761 + 97);
    const sign = style.alternate ? (i % 2 === 0 ? 1 : -1) : rand() < 0.5 ? -1 : 1;
    const side = style.alternate ? 0.5 : rand();
    const size = style.alternate ? 0.5 : Math.abs(rand() - 0.5) + 0.25;
    const mid: Waypoint = {
      x: clampX((a.x + b.x) / 2 + sign * (style.alternate ? style.bend / 2 : size * style.bend) * (style.alternate ? 1 : 1) + (style.alternate ? 0 : (side - 0.5) * style.bend * 0.2)),
      y: (a.y + b.y) / 2 + (rand() - 0.5) * 12,
      lean: sign * style.lean * (style.alternate ? 0.5 : rand() * 0.6 + 0.2),
    };
    const start: Waypoint = { x: a.x, y: a.y, lean: (rand() - 0.5) * 2 * style.endLean };
    const end: Waypoint = { x: b.x, y: b.y, lean: (rand() - 0.5) * 2 * style.endLean };
    const curve = (from: Waypoint, to: Waypoint) => {
      const dy = Math.max(1, to.y - from.y);
      return `C ${f(from.x + from.lean * dy * 0.45)},${f(from.y + dy * 0.45)} ${f(to.x - to.lean * dy * 0.45)},${f(to.y - dy * 0.45)} ${f(to.x)},${f(to.y)}`;
    };
    segments.push(`${curve(start, mid)} ${curve(mid, end)}`);
  }
  return {
    /** The whole trail, or only the part up to node `upToIndex`. */
    path: (upToIndex = points.length - 1) =>
      points.length < 2 ? '' : `M ${f(points[0].x)},${f(points[0].y)} ${segments.slice(0, Math.max(0, upToIndex)).join(' ')}`,
  };
}
