import type { ImageSourcePropType } from 'react-native';

/**
 * Hero art for the Survival results: a transparent illustration of the staircase with the character on the step for the level.
 * `faces` mark where the app draws each step number, as fractions of the image (0 to 1), so the numbers stay on the right step at any
 * width. Re-measure them whenever an image is replaced.
 */
export type SurvivalArtFace = { x: number; y: number; w: number; h: number };
export type SurvivalArt = {
  source: ImageSourcePropType;
  /** The image's size in its original pixels (the file is the same picture, resized); its ratio is what the app uses. */
  width: number;
  height: number;
  faces: SurvivalArtFace[];
  /** How many steps the art draws in colour, from step 1. The rest are grey, and their numbers are drawn grey to match. */
  lit: number;
  /** Replaces the default step numbers 1 to 5 (the Level 6+ art counts levels, not steps): one label per face, null for none. */
  labels?: (level: number) => (string | null)[];
  /** Label colour per face (defaults to the step accents, grey beyond `lit`). */
  colors?: string[];
  /** Faces whose label sits on a small white pill, because it is over clouds. */
  pills?: number[];
};

const face = (W: number, H: number, left: number, top: number, right: number, bottom: number): SurvivalArtFace => ({
  x: left / W, y: top / H, w: (right - left) / W, h: (bottom - top) / H,
});

// Every image was generated at 1774 x 887 and resized to 1100 wide. The empty strip above the highest part of each was then trimmed
// (`top` original pixels, keeping a small margin), so the picture is shorter. The anchors below are still written in the UNTRIMMED
// pixels, where they were measured, and `frame` shifts them up by the trim.
const W0 = 1774, H0 = 887;
const frame = (top: number) => {
  const height = H0 - top;
  return {
    height,
    // A number's anchor is the CENTRE of a step's visible front face. The box around it is tall enough that every number is drawn at the
    // same size. The centres were measured from the brightness of each file (the bright top surface ends at a crease, the face ends where
    // its bevel darkens, the sides where the neighbouring step begins), then checked on screen.
    at: (cx: number, cy: number) => face(W0, height, cx - 100, cy - 70 - top, cx + 100, cy + 70 - top),
    box: (l: number, t: number, r: number, b: number) => face(W0, height, l, t - top, r, b - top),
  };
};
type Frame = ReturnType<typeof frame>;

// Levels 1 to 4: the staircase sits in the same place in all four images.
const LEVEL_CENTRES: [number, number][] = [[605, 749], [836, 685], [1069, 615], [1295, 544], [1523, 466]];
const levelFaces = (f: Frame) => LEVEL_CENTRES.map(([x, y]) => f.at(x, y));

// Trims, in original pixels, chosen per image from where its content starts (the summit's confetti reaches high, so it trims little).
const T0 = frame(74), T1 = frame(74), T2 = frame(76), T3 = frame(78), T4 = frame(77), T5 = frame(9), T6 = frame(67);

/**
 * The art for a level. Level 5 is the summit; from Level 6 on, one "beyond the summit" image serves every level: the old summit with
 * its flag, a cloud path for the levels climbed since, the learner's gold step, and grey steps ahead fading into clouds.
 * A run with no correct answer gets its own image (`fell`).
 */
export const survivalArtFor = (level: number, fell = false) => (fell ? SURVIVAL_ART[0] : SURVIVAL_ART[level >= 6 ? 6 : level]);

export const SURVIVAL_ART: Partial<Record<number, SurvivalArt>> = {
  // No correct answer: the climber fell before step 1, every step grey. The staircase is shifted a little to the right.
  0: {
    source: require('../assets/survival/survival-0.webp'),
    width: W0,
    height: T0.height,
    faces: [T0.at(622, 745), T0.at(852, 683), T0.at(1085, 614), T0.at(1311, 544), T0.at(1536, 466)],
    lit: 0,
  },
  1: { source: require('../assets/survival/survival-1.webp'), width: W0, height: T1.height, faces: levelFaces(T1), lit: 1 },
  2: { source: require('../assets/survival/survival-2.webp'), width: W0, height: T2.height, faces: levelFaces(T2), lit: 2 },
  3: { source: require('../assets/survival/survival-3.webp'), width: W0, height: T3.height, faces: levelFaces(T3), lit: 3 },
  // Step 5 is drawn coloured in the Level 4 image: it is the goal ahead.
  4: { source: require('../assets/survival/survival-4.webp'), width: W0, height: T4.height, faces: levelFaces(T4), lit: 5 },
  // The summit: the staircase sits lower in this image.
  5: {
    source: require('../assets/survival/survival-5.webp'),
    width: W0,
    height: T5.height,
    faces: [T5.at(603, 782), T5.at(833, 752), T5.at(1062, 682), T5.at(1290, 614), T5.at(1523, 540)],
    lit: 5,
  },
  // Beyond the summit: the old summit, the cloud (a pill reading "+N", the levels climbed since Level 5), the current step, and the two
  // steps ahead (a third is hidden in the clouds on purpose; the second ahead is mostly behind the clouds and the plant).
  6: {
    source: require('../assets/survival/survival-6.webp'),
    width: W0,
    height: T6.height,
    faces: [T6.at(402, 742), T6.box(745, 583, 935, 652), T6.at(1102, 575), T6.at(1304, 516), T6.box(1411, 404, 1501, 544)],
    lit: 3,
    labels: (level) => ['5', `+${level - 5}`, String(level), String(level + 1), String(level + 2)],
    colors: ['#5B21B6', '#6D28D9', '#B45309', '#9CA3AF', '#9CA3AF'],
    pills: [1],
  },
};
