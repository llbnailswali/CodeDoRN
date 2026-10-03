import React from 'react';
import { BlurView } from '@react-native-community/blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, MAIN, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';

// The "How much help do you want?" bottom sheet of the Practice tab (web: src/components/PracticeHelpSheet.tsx).

export type HelpLevel = 'beginner' | 'intermediate' | 'experienced';

export const HELP_OPTIONS: Array<{ level: HelpLevel; label: string; line: string }> = [
  { level: 'beginner', label: 'Beginner', line: 'Complete step-by-step guidance shown up front, including what to do and how to approach each step.' },
  { level: 'intermediate', label: 'Intermediate', line: 'Progressive hints shown one at a time, covering the goal, key concepts, and main tools to use.' },
  { level: 'experienced', label: 'Experienced', line: 'Minimal progressive hints shown one at a time, giving only enough direction to help you move forward.' },
];

export function HelpSheet({ p, current, onChoose, onClose }: { p: Palette; current: HelpLevel; onChoose: (level: HelpLevel) => void; onClose: () => void }) {
  const d = p.isDark;
  const muted = d ? '#94A3B8' : '#64748B';
  return (
    // covers the whole screen (top bar and tab bar included), like the web's fixed overlay
    <Pressable style={s.overlay} onPress={onClose}>
      <BlurView
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        blurType={d ? 'dark' : 'light'}
        blurAmount={3}
        overlayColor="transparent"
      />
      <View pointerEvents="none" style={s.backdropTint} />
      <Pressable
        style={[s.sheet, d ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}
        onPress={() => {}}
      >
        <View style={{ gap: 2 }}>
          <Text style={[s.title, { color: d ? '#F1F5F9' : '#0F172A' }]}>How much help do you want?</Text>
          <Text style={[s.sub, { color: muted }]}>This changes the guidance in Write &amp; Run tasks. Debug hints stay the same. You can change it any time.</Text>
        </View>
        <View style={{ gap: 10, paddingTop: 4 }}>
          {HELP_OPTIONS.map((opt) => {
            const selected = opt.level === current;
            return (
              <Pressable
                key={opt.level}
                onPress={() => onChoose(opt.level)}
                style={[
                  s.option,
                  selected
                    ? d
                      ? { borderColor: 'rgba(129,140,248,0.6)', backgroundColor: 'rgba(99,102,241,0.15)' }
                      : { borderColor: '#818CF8', backgroundColor: '#EEF2FF' }
                    : d
                    ? { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: '#0F1420' }
                    : { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
                ]}
              >
                <Text style={[s.optionLabel, { color: d ? '#F1F5F9' : '#0F172A' }]}>{opt.label}</Text>
                <Text style={[s.optionLine, { color: muted }]}>{opt.line}</Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Pressable>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent', justifyContent: 'flex-end', zIndex: 50 },
  backdropTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: BW, borderBottomWidth: 0, padding: 20, paddingBottom: 28, gap: 12 },
  title: { fontFamily: FONT.outfit.sb, fontSize: fz(18 * MAIN), lineHeight: lh(18, 1.5556), letterSpacing: -0.025 * 18 * MAIN, includeFontPadding: false },
  sub: { fontFamily: FONT.outfit.md, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.3333), includeFontPadding: false },
  option: { borderRadius: 12, borderWidth: BW, paddingHorizontal: 16, paddingVertical: 14 },
  optionLabel: { fontFamily: FONT.outfit.b, fontSize: fz(14 * MAIN), lineHeight: lh(14, 1.25), includeFontPadding: false },
  optionLine: { fontFamily: FONT.outfit.md, fontSize: fz(12 * MAIN), lineHeight: lh(12, 1.375), marginTop: 6, includeFontPadding: false },
});
