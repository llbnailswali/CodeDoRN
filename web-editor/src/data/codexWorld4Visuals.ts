/** Independent, tall World 4 alternatives for the Claude/Codex comparison. */
import type { GraphEdge, GraphNode, GraphNote, LessonVisual } from './lessonVisuals';

// The outer columns are protected arrow lanes. All lesson content stays in
// the wide middle column, using height—not card width—to show the trace.
const tall = (nodes: GraphNode[], edges: GraphEdge[], notes?: GraphNote[]): LessonVisual => ({
  title: 'How it works — Codex',
  graph: { colWeights: [.16, .68, .16], rowHeights: [58, 104, 88, 88, 78, 68], nodes, edges, notes },
});

const center = (id: string, kind: GraphNode['kind'], text: string, row: number, sub?: string, extra: Partial<GraphNode> = {}): GraphNode =>
  ({ id, kind, text, row, col: 1, w: .94, h: kind === 'test' ? 76 : 54, sub, ...extra });

export const CODEX_WORLD_4_VISUALS: Record<string, LessonVisual> = {
  'world-4-for': tall(
    [center('start', 'start', 'Start', 0), center('value', 'step', 'Take the next value', 1, 'i = 1, 2, 3, 4, 5', { tone: 'yes', h: 58 }), center('print', 'step', 'Print i', 2, 'println(i)', { tone: 'yes' }), center('more', 'test', 'More values?', 3, 'inside 1..5'), center('end', 'end', 'End', 4, 'after i = 5')],
    [
      { from: 'start', to: 'value', out: 'bottom', into: 'top' }, { from: 'value', to: 'print', out: 'bottom', into: 'top' }, { from: 'print', to: 'more', out: 'bottom', into: 'top' },
      { from: 'more', to: 'value', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Yes: next', labelAt: 'middle', tone: 'yes' }, { from: 'more', to: 'end', out: 'bottom', into: 'top', label: 'No', tone: 'no' },
    ],
    [{ text: 'The body runs once for every value, including 5.', col: 1, row: 5, w: .94, h: 52, connectToEdge: 3 }],
  ),
  'world-4-while': tall(
    [center('start', 'start', 'Start', 0, 'ticketsLeft = 3'), center('test', 'test', 'Tickets left?', 1, 'ticketsLeft > 0'), center('sell', 'step', 'Sell one ticket', 2, 'print; ticketsLeft--', { tone: 'yes', h: 58 }), center('end', 'end', 'Print “Sold out”', 4)],
    [
      { from: 'start', to: 'test', out: 'bottom', into: 'top' }, { from: 'test', to: 'sell', out: 'bottom', into: 'top', label: 'Yes', tone: 'yes' },
      { from: 'sell', to: 'test', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Check again', labelAt: 'middle', tone: 'yes' }, { from: 'test', to: 'end', out: 'right', into: 'right', route: 'lane', lane: { col: 2, dx: 15 }, label: 'No', labelAt: 'middle', tone: 'no' },
    ],
    [{ text: 'while checks before every pass; 0 tickets skips the body.', col: 1, row: 5, w: .94, h: 52, connectToEdge: 0 }],
  ),
  'world-4-do-while': tall(
    [center('start', 'start', 'Start', 0, 'count = 5'), center('body', 'step', 'Run the body', 1, 'print 5; count becomes 6', { tone: 'yes', h: 58 }), center('test', 'test', 'Repeat?', 2, 'count < 5 is false'), center('end', 'end', 'Exit loop', 3)],
    [
      { from: 'start', to: 'body', out: 'bottom', into: 'top' }, { from: 'body', to: 'test', out: 'bottom', into: 'top' },
      { from: 'test', to: 'body', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Yes: repeat', labelAt: 'middle', tone: 'yes', faded: true }, { from: 'test', to: 'end', out: 'bottom', into: 'top', label: 'No', tone: 'no' },
    ],
    [{ text: 'The body runs before the first condition check.', col: 1, row: 5, w: .94, h: 52, connectToEdge: 1 }],
  ),
  'world-4-break': tall(
    [center('start', 'start', 'Take the next i', 0, 'i = 1 … 7'), center('test', 'test', 'Multiple of 7?', 1, 'i % 7 == 0'), center('keep', 'step', 'Keep searching', 2, 'i = 1 to 6'), center('found', 'step', 'Print “Found: 7”', 3, undefined, { tone: 'yes' }), center('end', 'end', 'Print “Search finished”', 4)],
    [
      { from: 'start', to: 'test', out: 'bottom', into: 'top' }, { from: 'test', to: 'keep', out: 'bottom', into: 'top', label: 'No', tone: 'no' },
      { from: 'keep', to: 'start', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Next i', labelAt: 'middle', tone: 'neutral' }, { from: 'test', to: 'found', out: 'right', into: 'right', route: 'lane', lane: { col: 2, dx: 15 }, label: 'Yes: i = 7', labelAt: 'middle', tone: 'yes' }, { from: 'found', to: 'end', out: 'bottom', into: 'top', label: 'break', tone: 'no' },
    ],
    [{ text: 'break exits the loop; values 8 through 20 never run.', col: 1, row: 5, w: .94, h: 52, connectToEdge: 4 }],
  ),
  'world-4-continue': tall(
    [center('start', 'start', 'Take the next i', 0, 'i = 1 … 5'), center('test', 'test', 'Is i even?', 1, 'i % 2 == 0'), center('skip', 'step', 'Skip println(i)', 2, 'continue for 2 and 4', { tone: 'no' }), center('print', 'step', 'Print i', 3, '1, 3, 5', { tone: 'yes' }), center('next', 'step', 'Move to the next i', 4)],
    [
      { from: 'start', to: 'test', out: 'bottom', into: 'top' }, { from: 'test', to: 'skip', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Yes', labelAt: 'middle', tone: 'no' }, { from: 'skip', to: 'next', out: 'bottom', into: 'top', tone: 'no' },
      { from: 'test', to: 'print', out: 'right', into: 'right', route: 'lane', lane: { col: 2, dx: 15 }, label: 'No', labelAt: 'middle', tone: 'yes' }, { from: 'print', to: 'next', out: 'bottom', into: 'top', tone: 'yes' }, { from: 'next', to: 'test', out: 'left', into: 'left', route: 'lane', lane: { col: 0, dx: 15 }, label: 'Next i', labelAt: 'middle', tone: 'neutral' },
    ],
    [{ text: 'continue skips one pass only; the loop still reaches 5.', col: 1, row: 5, w: .94, h: 52, connectToEdge: 5 }],
  ),
};
