import React from 'react';
import { PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import { InsetShadow, ShadowSpec, ShadowStack } from './shadows';
import { FONT, INDIGO_400, Palette } from './theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Common to every tab of the React Native app: the sizing helpers, the neumorphic shadow recipes, icons, the top bar and the
// bottom tab bar (web: src/components/Header.tsx and Navigation.tsx). Each tab only supplies its own content.

// The web scales text inside <main> by 1.125 (Profile > text size 'small', src/index.css .font-size-small). Header, bottom nav and
// icons are not scaled by it. Android's system font scale applies on top of both, in RN as in the WebView.
export const MAIN = 1.125;
// Chrome snaps a CSS 1px border to whole device pixels: 2 of this phone's 2.75-px dp (0.727dp). RN would draw it 3px thick.
export const BW = 0.727;
// Android rounds a Text's size UP to whole pixels (37.25px becomes 38px: ~2% wider than the web's fractional size).
// Pick the nearest whole pixel instead, then express it as the dp value RN will round to exactly that.
const FONT_PX_PER_DP = PixelRatio.get() * PixelRatio.getFontScale();
export const fz = (cssPx: number): number => (Math.max(1, Math.round(cssPx * FONT_PX_PER_DP)) - 0.02) / FONT_PX_PER_DP;

// Depth from the web's CSS (src/index.css .neu-raised / .neu-pressed / .neu-nav, light and dark variants).
export const raisedShadows = (dark: boolean): ShadowSpec[] =>
  dark
    ? [{ dx: 6, dy: 6, blur: 16, rgb: '0,0,0', alpha: 0.65 }, { dx: -2, dy: -2, blur: 10, rgb: '255,255,255', alpha: 0.04 }]
    : [{ dx: 6, dy: 6, blur: 14, rgb: '0,0,0', alpha: 0.06 }, { dx: -6, dy: -6, blur: 14, rgb: '255,255,255', alpha: 0.75 }];
export const pressedShadows = (dark: boolean): ShadowSpec[] =>
  dark
    ? [{ dx: 3, dy: 3, blur: 7, rgb: '0,0,0', alpha: 0.7 }, { dx: -2, dy: -2, blur: 6, rgb: '255,255,255', alpha: 0.03 }]
    : [{ dx: 3, dy: 3, blur: 6, rgb: '0,0,0', alpha: 0.06 }, { dx: -3, dy: -3, blur: 6, rgb: '255,255,255', alpha: 0.65 }];
export const navShadows = (dark: boolean): ShadowSpec[] =>
  dark
    ? [{ dy: -8, blur: 24, rgb: '0,0,0', alpha: 0.7 }]
    : [{ dy: -6, blur: 16, rgb: '0,0,0', alpha: 0.04 }, { dy: -2, blur: 8, rgb: '255,255,255', alpha: 0.85 }];

/**
 * A Material Symbols glyph. In the web every icon renders at 24px whatever its text-[Npx] class says (the unlayered
 * `.material-symbols-outlined { font-size: 24px }` in index.css beats Tailwind's utilities), so `size` is ignored on purpose.
 */
export function Icon({ name, color, size, exact, filled }: { name: string; size?: number; color: string; exact?: boolean; filled?: boolean }) {
  // `exact`: the web sets this icon's size with `!text-[Npx]` (important), which does win over the 24px rule, so use `size` as given.
  const px = exact && size ? size : 24;
  return (
    <Text style={{ fontFamily: filled ? FONT.iconsFilled : FONT.icons, fontSize: fz(px), lineHeight: px, color, includeFontPadding: false }}>
      {name}
    </Text>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The app shell shared by every tab: top bar and bottom tab bar
// ---------------------------------------------------------------------------------------------------------------------

export function Header({ p, gap = 12, onGap, onToggleTheme, topInset, badge = 'LEARN', showGap = true, title, onBack }: { p: Palette; gap?: number; onGap?: (v: number) => void; onToggleTheme: () => void; topInset: number; badge?: string; showGap?: boolean; title?: string; onBack?: () => void }) {
  return (
    <View style={{ paddingTop: topInset, backgroundColor: p.page, borderBottomWidth: BW, borderBottomColor: p.headerBorder, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: p.isDark ? 0.28 : 0.14, shadowRadius: 3, zIndex: 10 }}>
      <View style={s.headerInner}>
        <View style={s.headerLeft}>
          {title !== undefined ? (
            <>
              {/* A pushed screen: a back button and the screen's title instead of the logo and the tab badge */}
              <View>
                <ShadowStack r={12} shadows={raisedShadows(p.isDark)} />
                <Pressable onPress={onBack} style={[s.logoBox, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
                  <Icon name="arrow_back" size={22} color={p.isDark ? '#E2E8F0' : '#1E2433'} />
                </Pressable>
              </View>
              <Text numberOfLines={1} style={[s.brand, { color: p.pageText, flexShrink: 1 }]}>{title}</Text>
            </>
          ) : (
            <>
          <View>
              <ShadowStack r={12} shadows={raisedShadows(p.isDark)} />
              <View style={[s.logoBox, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
                <Text style={[s.logoText, { color: '#7A68F3' }]}>CD</Text>
              </View>
            </View>
            <View style={s.brandRow}>
              <Text style={[s.brand, { color: p.pageText }]}>CodeDo</Text>
              <View style={[s.badge, { backgroundColor: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.20)' }]}>
                <Text style={[s.badgeText, { color: p.isDark ? INDIGO_400 : '#4F46E5' }]}>{badge}</Text>
              </View>
            </View>
            </>
          )}
        </View>
        <View style={s.headerRight}>
          {showGap && onGap && (
          <View style={[s.gapBox, { backgroundColor: p.card, borderColor: p.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[s.gapLabel, { color: p.muted }]}>GAP</Text>
            <Pressable style={s.gapBtn} onPress={() => onGap(Math.max(0, gap - 4))} disabled={gap === 0}>
              <View style={{ opacity: gap === 0 ? 0.3 : 1 }}><Icon name="remove" size={14} color="#64748B" /></View>
            </Pressable>
            <Text style={[s.gapValue, { color: p.isDark ? INDIGO_400 : '#4F46E5' }]}>{gap}px</Text>
            <Pressable style={s.gapBtn} onPress={() => onGap(Math.min(32, gap + 4))} disabled={gap === 32}>
              <View style={{ opacity: gap === 32 ? 0.3 : 1 }}><Icon name="add" size={14} color="#64748B" /></View>
            </Pressable>
          </View>
          )}
          <View>
            <ShadowStack r={12} shadows={raisedShadows(p.isDark)} />
            <Pressable onPress={onToggleTheme} style={[s.themeBtn, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
              <Icon name={p.isDark ? 'light_mode' : 'dark_mode'} size={17} color={p.isDark ? '#FBBF24' : '#475569'} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export const TABS = [
  { id: 'learn', label: 'Learn', icon: 'school' },
  { id: 'quiz', label: 'Quiz', icon: 'assignment_turned_in' },
  { id: 'practice', label: 'Practice', icon: 'terminal' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export type TabId = 'learn' | 'quiz' | 'practice' | 'profile';

export function BottomNav({ p, active: activeTab = 'learn', onSelect }: { p: Palette; active?: TabId; onSelect?: (tab: TabId) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <ShadowStack r={0} shadows={navShadows(p.isDark)} />
      <View style={{ backgroundColor: p.page, borderTopWidth: BW, borderTopColor: p.navBorder }}>
        <View style={[s.navInner, { paddingBottom: insets.bottom, height: 64 + insets.bottom }]}>
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const color = active ? (p.isDark ? INDIGO_400 : '#4F46E5') : p.isDark ? '#94A3B8' : '#475569';
            return (
              <Pressable
                key={tab.id}
                onPress={() => onSelect?.(tab.id as TabId)}
                android_ripple={{ color: p.isDark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.45)', borderless: false, foreground: true }}
                style={({ pressed }) => [
                  s.navItem,
                  (active || pressed) && { backgroundColor: p.isDark ? '#151B28' : '#E8EAF0', borderWidth: BW, borderColor: p.isDark ? 'rgba(255,255,255,0.04)' : 'transparent', overflow: 'hidden' },
                ]}
              >
                {({ pressed }) => (
                  <>
                    {(active || pressed) && <InsetShadow r={12} shadows={pressedShadows(p.isDark)} />}
                    <Icon name={tab.icon} size={22} color={color} />
                    <Text style={[s.navLabel, { color }]}>{tab.label}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}


const s = StyleSheet.create({
  // header
  headerInner: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 40, height: 40, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: FONT.outfit.xb, fontSize: fz(16), lineHeight: 24, includeFontPadding: false },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brand: { fontFamily: FONT.outfit.b, fontSize: fz(18), lineHeight: 28, letterSpacing: -0.45, includeFontPadding: false },
  badge: { borderWidth: BW, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: FONT.jakarta.b, fontSize: fz(10), lineHeight: 15, letterSpacing: 0.5, includeFontPadding: false },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gapBox: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 12, borderWidth: BW, paddingHorizontal: 4, paddingVertical: 2 },
  gapLabel: { fontFamily: FONT.mono.b, fontSize: fz(8), lineHeight: 12, letterSpacing: 0.4, paddingHorizontal: 4, includeFontPadding: false },
  gapBtn: { width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  gapValue: { fontFamily: FONT.mono.b, fontSize: fz(9), lineHeight: 13.5, minWidth: 28, textAlign: 'center', includeFontPadding: false },
  themeBtn: { width: 32, height: 32, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  // bottom nav
  navInner: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  navItem: { minWidth: 56, minHeight: 44, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navLabel: { fontFamily: FONT.jakarta.b, fontSize: fz(11), lineHeight: 16.5, letterSpacing: -0.27, includeFontPadding: false },
});
