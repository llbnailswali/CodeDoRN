import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BW, Icon, MAIN, fz } from './shell';
import { ShadowStack } from './shadows';
import { FONT, Palette } from './theme';

// Pieces the Quiz and Practice tabs have in common (web: the dark editor-style panel, the "// worlds" divider, the editor accents).

/** Editor-style accents, one per World, cycling (src/utils/worldAccents.ts): [dark-mode colour, light-mode text colour]. */
const ACCENTS: Array<[string, string]> = [
  ['#569CD6', '#1F6FB5'], // blue
  ['#4EC9B0', '#17846F'], // teal
  ['#C586C0', '#95468F'], // purple
  ['#CE9178', '#A8502F'], // orange
  ['#E5C07B', '#936A14'], // gold
  ['#98C379', '#4A7A28'], // green
];
export const accentFor = (order: number) => ACCENTS[(order - 1) % ACCENTS.length];

export const hexAlpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Line height for a font size that already includes the main-content scale (`ratio` is the CSS line-height multiple). */
export const lh = (cssPx: number, ratio: number) => cssPx * MAIN * ratio;

/** The dark editor-style call-to-action panel (Quick quiz, Surprise challenge). */
export function EditorPanel({
  fileName, code, comment, playSize,
}: {
  fileName: string;
  /** The coloured code line, as nested <Text> parts. */
  code: React.ReactNode;
  comment: string;
  /** The web sizes the play icon per screen (18 on Quiz, 22 on Practice). */
  playSize: number;
}) {
  const slate400 = '#94A3B8';
  const teal = '#4EC9B0';
  return (
    <View>
      <ShadowStack r={16} shadows={[{ dy: 8, blur: 12, rgb: '0,0,0', alpha: 0.1 }]} />
      <View style={s.panel}>
        {/* the editor's title bar */}
        <View style={s.bar}>
          <View style={[s.dot, { backgroundColor: 'rgba(248,113,113,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(251,191,36,0.8)' }]} />
          <View style={[s.dot, { backgroundColor: 'rgba(52,211,153,0.8)' }]} />
          <Text style={[s.mono11, { color: slate400, marginLeft: 8 }]}>{fileName}</Text>
          <View style={s.randomize}>
            <Icon name="autorenew" size={13} exact color={hexAlpha(teal, 0.75)} />
            <Text style={[s.mono11, { color: hexAlpha(teal, 0.75), fontFamily: FONT.mono.md }]}>randomize()</Text>
          </View>
        </View>
        <View style={s.body}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.codeLine}>{code}</Text>
            <Text numberOfLines={1} style={s.codeComment}>{comment}</Text>
          </View>
          <View style={s.playBox}>
            <Icon name="play_arrow" size={playSize} exact color={teal} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** The "// worlds" divider between a tab's call-to-action and its per-World list. */
export function WorldsDivider({ p }: { p: Palette }) {
  const line = p.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(148,163,184,0.4)';
  return (
    <View style={s.divider}>
      <View style={[s.dividerLine, { backgroundColor: line }]} />
      <Text style={[s.dividerLabel, { color: p.isDark ? '#64748B' : '#94A3B8' }]}>{'// worlds'}</Text>
      <View style={[s.dividerLine, { backgroundColor: line }]} />
    </View>
  );
}

const s = StyleSheet.create({
  panel: { borderRadius: 16, borderWidth: BW, borderColor: 'rgba(51,65,85,0.6)', backgroundColor: '#0D1322', overflow: 'hidden' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#090D17', borderBottomWidth: BW, borderBottomColor: 'rgba(30,41,59,0.7)',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  randomize: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 },
  mono11: { fontFamily: FONT.mono.r, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.5), includeFontPadding: false },
  body: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  codeLine: { fontFamily: FONT.mono.sb, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.375), includeFontPadding: false },
  codeComment: { fontFamily: FONT.mono.r, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.5), marginTop: 4, color: '#7D8CA4', includeFontPadding: false },
  playBox: {
    width: 36, height: 36, borderRadius: 8, borderWidth: BW, borderColor: 'rgba(78,201,176,0.5)', backgroundColor: 'rgba(78,201,176,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { height: 1, flex: 1 },
  dividerLabel: { fontFamily: FONT.mono.r, fontSize: fz(10 * MAIN), lineHeight: lh(10, 1.5), letterSpacing: 0.05 * 10 * MAIN, includeFontPadding: false },
});
