/** One World on the Home path (same data as the Compose screen and the web Home). */
export interface HomeWorld {
  order: number;
  title: string;
  lessons: number;
  glyph: string;
}

export interface HomeBand {
  label: string;
  firstWorld: number;
  lastWorld: number;
}

export const HOME_BANDS: HomeBand[] = [
  { label: 'BEGINNER', firstWorld: 1, lastWorld: 8 },
  { label: 'INTERMEDIATE', firstWorld: 9, lastWorld: 15 },
  { label: 'EXPERIENCED', firstWorld: 16, lastWorld: 22 },
];

export const HOME_WORLDS: HomeWorld[] = [
  { order: 1, title: 'Kotlin Awakening', lessons: 13, glyph: '</>' },
  { order: 2, title: 'Operator Forge', lessons: 7, glyph: '+=%' },
  { order: 3, title: 'Decision Maker', lessons: 9, glyph: '<>' },
  { order: 4, title: 'Loop Master', lessons: 11, glyph: '↻' },
  { order: 5, title: 'Function Forge', lessons: 9, glyph: 'f(x)' },
  { order: 6, title: 'Collection Valley', lessons: 11, glyph: '[ ]' },
  { order: 7, title: 'Null Safety Shield', lessons: 11, glyph: '?.' },
  { order: 8, title: 'Object Kingdom', lessons: 14, glyph: '{ }' },
  { order: 9, title: 'Lambda Lab', lessons: 12, glyph: 'λ' },
  { order: 10, title: 'Collection Wizardry', lessons: 10, glyph: '.map' },
  { order: 11, title: 'OOP Evolution', lessons: 14, glyph: 'OOP' },
  { order: 12, title: 'Generic Realm', lessons: 15, glyph: '<T>' },
  { order: 13, title: 'Scope Masters', lessons: 10, glyph: 'let' },
  { order: 14, title: 'Sequence Dimension', lessons: 13, glyph: 'seq' },
  { order: 15, title: 'Error Fortress', lessons: 15, glyph: 'try' },
  { order: 16, title: 'Coroutine Academy', lessons: 12, glyph: 'co' },
  { order: 17, title: 'Flow Universe', lessons: 10, glyph: '~>' },
  { order: 18, title: 'Concurrency Arena', lessons: 14, glyph: '||' },
  { order: 19, title: 'Kotlin Blacksmith', lessons: 16, glyph: 'DSL' },
  { order: 20, title: 'JVM Bridge', lessons: 10, glyph: 'JVM' },
  { order: 21, title: 'Performance Lab', lessons: 15, glyph: 'perf' },
  { order: 22, title: 'Production Kotlin', lessons: 22, glyph: 'prod' },
];
