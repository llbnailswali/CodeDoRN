import React from 'react';
import { BlurView } from '@react-native-community/blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BW, MAIN, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';

// The "How much help do you want?" bottom sheet of the Practice tab (web: src/components/PracticeHelpSheet.tsx).

export type HelpLevel = 'beginner' | 'intermediate' | 'experienced';

export const HELP_OPTIONS: Array<{ level: HelpLevel; label: string; line: string }> = [
  { level: 'beginner', label: 'Beginner', line: 'Full step-by-step guidance, including what to do and how to approach each step.' },
  { level: 'intermediate', label: 'Intermediate', line: 'Progressive hints, one at a time, covering the goal, key concepts, and main tools.' },
  { level: 'experienced', label: 'Experienced', line: 'Minimal progressive hints, one at a time, to point you in the right direction.' },
];

export function HelpSheet({ p, current, onChoose, onClose }: { p: Palette; current: HelpLevel; onChoose: (level: HelpLevel) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
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
        style={[s.sheet, { paddingBottom: 20 + insets.bottom }, d ? { backgroundColor: '#151B28', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}
        onPress={() => {}}
      >
        <Text style={[s.title, { color: d ? '#F1F5F9' : '#0F172A' }]}>Choose your help level</Text>
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
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'transparent', justifyContent: 'flex-end', zIndex: 50 },
  // Dim the whole Practice screen while the chooser is active, so attention
  // stays on the help-level decision in both light and dark themes.
  backdropTint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.58)' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: BW, borderBottomWidth: 0, padding: 20, gap: 12 },
  title: { fontFamily: FONT.outfit.sb, fontSize: fz(16 * MAIN), lineHeight: lh(16, 1.5), letterSpacing: -0.025 * 16 * MAIN, includeFontPadding: false },
  option: { borderRadius: 12, borderWidth: BW, paddingHorizontal: 16, paddingVertical: 14 },
  optionLabel: { fontFamily: FONT.outfit.b, fontSize: fz(13 * MAIN), lineHeight: lh(13, 1.3), includeFontPadding: false },
  optionLine: { fontFamily: FONT.outfit.md, fontSize: fz(11 * MAIN), lineHeight: lh(11, 1.4), marginTop: 6, includeFontPadding: false },
});
