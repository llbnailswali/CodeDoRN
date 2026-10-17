/**
 * "How it works" visuals for the Learn stage: a small flowchart per lesson, drawn by the native app (src/LessonVisual.tsx).
 * Keyed by the lesson id (the `id` of the five-stage lesson, for example `world-3-if-else`). A lesson with no entry shows no card.
 * `scripts/generate-native-data.ts` copies the entry into the lesson's `learn.visual` in src/lessonData.ts, and it copies the
 * type block below into that file, so the app and this file always use the same shape.
 *
 * Rules for authoring (keep them short so they fit a phone, about 300 px wide):
 *  - The flow reads from top to bottom. One idea per box, 1 to 5 words of plain English. Put code in `code`, not in `text`.
 *  - Use the SAME values and names as the lesson's code example, so the picture and the code agree.
 *  - A decision has 2 branches (Yes / No) or 3 and more (a `when`). Prefer a `ladder` for a chain of tests (else if, when).
 *  - `tone` colours: yes = green, no = red, neutral = grey. start/end = purple.
 */

// <visual-types>
export type FlowTone = 'yes' | 'no' | 'neutral';
export interface FlowStep { kind: 'start' | 'end' | 'step'; text: string; code?: string; tone?: FlowTone }
export interface FlowBranch { label: string; tone: FlowTone; steps: FlowStep[] }
export interface FlowDecision { kind: 'decision'; text: string; branches: FlowBranch[] }
export interface FlowLoop { kind: 'loop'; text: string; yesLabel?: string; noLabel?: string; body: FlowStep[] }
export interface FlowLadderRow { test: string; result: FlowStep }
export interface FlowLadder { kind: 'ladder'; rows: FlowLadderRow[]; otherwise?: FlowStep; otherwiseLabel?: string }
export type FlowItem = FlowStep | FlowDecision | FlowLoop | FlowLadder;
// A graph visual: nodes on a fixed grid, edges routed along it, and notes. Used by the visuals that follow VISUAL_QUALITY_STANDARD.md.
export type GraphSide = 'top' | 'bottom' | 'left' | 'right';
export interface GraphNode {
  id: string;
  kind: 'start' | 'end' | 'step' | 'test';
  text: string;
  /** A second, smaller line: a value or a line of code (monospace). */
  sub?: string;
  tone?: FlowTone;
  col: number;
  row: number;
  /** Number of columns the node's cell spans (default 1). */
  colSpan?: number;
  /** Shift to the left (negative) or right (positive), in px. */
  dx?: number;
  /** Width and height as a fraction of the cell (default 1) and in px (default: the row height minus the gap). */
  w?: number;
  h?: number;
  /** Drawn faded: the part of the picture the example's run does not reach. */
  faded?: boolean;
}
export interface GraphEdge {
  from: string;
  to: string;
  out: GraphSide;
  into: GraphSide;
  /**
   * 'elbow': leave to the side, then turn down into the top of the target (rounded corner).
   * 'merge': leave downward, run sideways just above the target, then down into its top.
   * 'lane': leave from `out`, run along the vertical lane at `lane`, then come into `into` (a repeat arrow, an exit around the side).
   *   'around' is the same as 'lane' (the earlier name, kept so existing entries keep working).
   */
  route?: 'straight' | 'elbow' | 'merge' | 'lane' | 'around';
  lane?: { col: number; dx: number };
  label?: string;
  /** Where the label sits: next to the start of the edge (default) or in the middle of its longest straight part. */
  labelAt?: 'start' | 'middle';
  tone?: FlowTone;
  faded?: boolean;
}
export interface GraphNote { text: string; col: number; row: number; colSpan?: number; w?: number; h?: number; connectToEdge?: number }
export interface Graph { colWeights: number[]; rowHeights: number[]; nodes: GraphNode[]; edges: GraphEdge[]; notes?: GraphNote[] }
export interface LessonVisual { title?: string; items?: FlowItem[]; graph?: Graph }
export interface LessonVisualVariants { claude: LessonVisual; codex: LessonVisual }
// </visual-types>

const start = (text: string, code?: string): FlowStep => ({ kind: 'start', text, code });
const end = (text: string, code?: string): FlowStep => ({ kind: 'end', text, code });
const step = (text: string, code?: string, tone?: FlowTone): FlowStep => ({ kind: 'step', text, code, tone });
const yes = (steps: FlowStep[], label = 'Yes (true)'): FlowBranch => ({ label, tone: 'yes', steps });
const no = (steps: FlowStep[], label = 'No (false)'): FlowBranch => ({ label, tone: 'no', steps });

export const LESSON_VISUALS: Record<string, LessonVisual> = {
  // ---------------------------------------------------------------- World 3: decisions
  // Owner-approved design (2026-10-16). Explains the Learn example: age = 20, if (age >= 18) { println("You can vote") }.
  // The "Yes" route is the run of the example (solid); the "No" route is what is skipped (faded, dashed).
  'world-3-if': {
    graph: {
      colWeights: [1, 1],
      rowHeights: [64, 150, 96, 84],
      nodes: [
        { id: 'start', kind: 'start', text: 'Start', col: 0, colSpan: 2, row: 0, w: 0.45, h: 46 },
        { id: 'test', kind: 'test', text: 'Is age >= 18?', sub: '(condition)', col: 0, colSpan: 2, row: 1, w: 0.44, h: 104 },
        { id: 'yes', kind: 'step', text: 'Run this block', sub: 'println("You can vote")', tone: 'yes', col: 0, row: 2, w: 0.88, dx: -8, h: 66 },
        { id: 'no', kind: 'step', text: 'Skip this block', sub: '(nothing runs)', tone: 'no', col: 1, row: 2, w: 0.88, dx: 8, h: 66, faded: true },
        { id: 'end', kind: 'end', text: 'End', col: 0, colSpan: 2, row: 3, w: 0.45, h: 46 },
      ],
      edges: [
        { from: 'start', to: 'test', out: 'bottom', into: 'top' },
        { from: 'test', to: 'yes', out: 'left', into: 'top', route: 'elbow', label: 'Yes', tone: 'yes' },
        { from: 'test', to: 'no', out: 'right', into: 'top', route: 'elbow', label: 'No', tone: 'no', faded: true },
        { from: 'yes', to: 'end', out: 'bottom', into: 'top', route: 'merge' },
        { from: 'no', to: 'end', out: 'bottom', into: 'top', route: 'merge', faded: true },
      ],
    },
  },
  'world-3-if-else': {
    items: [
      start('Start'),
      {
        kind: 'decision',
        text: 'Is age >= 18?',
        branches: [yes([step('Run this block', 'println("You can vote")', 'yes')]), no([step('Run this block', 'println("Not old enough yet")', 'no')])],
      },
    ],
  },
  'world-3-else-if': {
    items: [
      start('Start', 'score = 75'),
      {
        kind: 'ladder',
        rows: [
          { test: 'score >= 90?', result: step('Grade A', 'println("Grade: A")') },
          { test: 'score >= 80?', result: step('Grade B', 'println("Grade: B")') },
          { test: 'score >= 70?', result: step('Grade C', 'println("Grade: C")') },
        ],
        otherwise: step('Grade F', 'println("Grade: F")'),
        otherwiseLabel: 'else',
      },
      end('The first true test wins', 'the others are skipped'),
    ],
  },
  'world-3-when': {
    items: [
      start('Start', 'day = 3'),
      {
        kind: 'ladder',
        rows: [
          { test: 'day is 1, 2, 3, 4 or 5?', result: step('Weekday', 'println("Weekday")') },
          { test: 'day is 6 or 7?', result: step('Weekend', 'println("Weekend")') },
        ],
        otherwise: step('Invalid day', 'println("Invalid day")'),
        otherwiseLabel: 'else',
      },
      end('Only the first match runs'),
    ],
  },
  'world-3-when-with-ranges': {
    items: [
      start('Start', 'score = 85'),
      {
        kind: 'ladder',
        rows: [
          { test: 'in 90..100?', result: step('A', 'println("A")') },
          { test: 'in 80..89?', result: step('B', 'println("B")') },
          { test: 'in 70..79?', result: step('C', 'println("C")') },
        ],
        otherwise: step('F', 'println("F")'),
        otherwiseLabel: 'else',
      },
      end('85 is in 80..89, so B is printed'),
    ],
  },
  'world-3-when-as-an-expression': {
    items: [
      start('Start', 'score = 85'),
      {
        kind: 'ladder',
        rows: [
          { test: 'in 90..100?', result: step('Value is "A"') },
          { test: 'in 80..89?', result: step('Value is "B"') },
          { test: 'in 70..79?', result: step('Value is "C"') },
        ],
        otherwise: step('Value is "F"'),
        otherwiseLabel: 'else',
      },
      step('The value is stored', 'val grade = "B"'),
      end('println(grade) prints B'),
    ],
  },
  'world-3-multiple-conditions-and-nested-condition': {
    items: [
      start('Start', 'age = 20, hasId = true'),
      step('Check both conditions together', 'age >= 18 && hasId'),
      {
        kind: 'decision',
        text: 'Are both true?',
        branches: [yes([step('Allowed', 'println("Entry allowed")', 'yes')]), no([step('Denied', 'println("Entry denied")', 'no')], 'No (one is false)')],
      },
    ],
  },
  'world-3-type-checks-with-is-where-appropriate': {
    items: [
      start('Start', 'value: Any = 42'),
      {
        kind: 'decision',
        text: 'value is Int?',
        branches: [yes([step('Run this block', 'println("It\'s a number")', 'yes')]), no([step('Run this block', 'println("It\'s not a number")', 'no')])],
      },
    ],
  },

  // ---------------------------------------------------------------- World 4: loops
  // Explains the Learn example: for (i in 1..5) { println(i) }. Every route is taken in this run (i = 1, 2, 3, 4, 5, then nothing is left).
  'world-4-for': {
    graph: {
      colWeights: [0.55, 1.5, 1.15],
      rowHeights: [62, 134, 90, 80, 64],
      nodes: [
        { id: 'start', kind: 'start', text: 'Start', sub: 'i = 1', col: 1, row: 0, w: 0.6, h: 50 },
        { id: 'test', kind: 'test', text: 'Another i?', sub: '(i in 1..5)', col: 1, row: 1, w: 0.9, h: 108 },
        { id: 'body', kind: 'step', text: 'Run the body', sub: 'println(i)', tone: 'yes', col: 1, row: 2, w: 0.82, h: 56 },
        { id: 'next', kind: 'step', text: 'Move to the next i', col: 1, row: 3, w: 0.82, h: 44 },
        { id: 'end', kind: 'end', text: 'End', col: 1, row: 4, w: 0.5, h: 44 },
      ],
      edges: [
        { from: 'start', to: 'test', out: 'bottom', into: 'top' },
        { from: 'test', to: 'body', out: 'bottom', into: 'top', label: 'Yes', tone: 'yes' },
        { from: 'body', to: 'next', out: 'bottom', into: 'top' },
        { from: 'next', to: 'test', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 22 }, label: 'Repeat', labelAt: 'middle', tone: 'yes' },
        { from: 'test', to: 'end', out: 'right', into: 'right', route: 'lane', lane: { col: 2, dx: 10 }, label: 'No', tone: 'no' },
      ],
      notes: [{ text: 'i is 1, 2, 3, 4, 5. Then no values are left, so the loop ends.', col: 2, row: 2, w: 0.86, h: 92, connectToEdge: 4 }],
    },
  },
  'world-4-while': {
    items: [
      start('Start', 'ticketsLeft = 3'),
      {
        kind: 'loop',
        text: 'ticketsLeft > 0?',
        yesLabel: 'Yes (true)',
        noLabel: 'No (false)',
        body: [step('Sell a ticket', 'println("Selling ticket #$ticketsLeft")'), step('Take one away', 'ticketsLeft--')],
      },
      end('Leave the loop', 'println("Sold out")'),
    ],
  },
  'world-4-do-while': {
    title: 'The first pass happens before the check',
    graph: {
      // The Learn example is deliberately false from the start: count is 5.
      // The green route is its complete run; the dashed loop is possible but is
      // not taken because the later check sees count as 6.
      colWeights: [0.26, 0.48, 0.26],
      rowHeights: [58, 76, 108, 60],
      nodes: [
        { id: 'start', kind: 'start', text: 'Start', sub: 'count = 5', col: 1, row: 0, w: 0.9, h: 46 },
        { id: 'body', kind: 'step', text: 'Run the body', sub: 'print 5, count = 6', tone: 'yes', col: 1, row: 1, w: 0.98, h: 62 },
        { id: 'check', kind: 'test', text: 'Is 6 < 5?', sub: 'false', col: 1, row: 2, w: 0.94, h: 88 },
        { id: 'end', kind: 'end', text: 'End', sub: 'printed 5 once', col: 1, row: 3, w: 0.9, h: 46 },
      ],
      edges: [
        { from: 'start', to: 'body', out: 'bottom', into: 'top' },
        { from: 'body', to: 'check', out: 'bottom', into: 'top', tone: 'yes' },
        { from: 'check', to: 'end', out: 'bottom', into: 'top', label: 'No', tone: 'no' },
        { from: 'check', to: 'body', out: 'right', into: 'right', route: 'around', lane: { col: 2, dx: 8 }, label: 'Yes', tone: 'yes', faded: true },
      ],
      notes: [
        { text: 'The body runs once before the condition is checked.', col: 0, row: 2, w: 0.98, h: 76, connectToEdge: 2 },
      ],
    },
  },
  'world-4-break': {
    items: [
      start('Start', 'for (i in 1..20)'),
      {
        kind: 'decision',
        text: 'i % 7 == 0?',
        branches: [
          yes([step('Found it', 'println("Found: $i")', 'yes'), step('break', 'leave the loop now', 'yes')]),
          no([step('Next i', 'go back to the top', 'no')], 'No (false)'),
        ],
      },
      end('After the loop', 'println("Search finished")'),
    ],
  },
  'world-4-continue': {
    items: [
      start('Start', 'for (i in 1..5)'),
      {
        kind: 'decision',
        text: 'i % 2 == 0?',
        branches: [yes([step('continue', 'skip the rest of this round', 'yes')]), no([step('Run the rest', 'println(i)', 'no')], 'No (false)')],
      },
      end('Go to the next i'),
    ],
  },
};
