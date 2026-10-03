// Visual tokens copied from the web Home (Tailwind classes in src/components/Home.tsx, Header.tsx, Navigation.tsx).
export interface Palette {
  isDark: boolean;
  page: string; // main background
  pageText: string; // inherited text colour
  card: string; // raised surfaces (#151b28 dark)
  cardText: string;
  cardBorder: string;
  pressed: string; // inset surfaces (progress button, active tab)
  barTrack: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  muted: string; // slate-400 / slate-500
  headerBorder: string;
  navBorder: string;
  title: string; // world titles
  titleLocked: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
}

export const DARK: Palette = {
  isDark: true,
  page: '#0B0F19',
  pageText: '#DFE2F1',
  card: '#151B28',
  cardText: '#FFFFFF',
  cardBorder: 'rgba(255,255,255,0.06)',
  pressed: '#121824',
  barTrack: '#090D16',
  chipBg: 'rgba(30,41,59,0.9)',
  chipBorder: 'rgba(255,255,255,0.10)',
  chipText: '#E2E8F0',
  muted: '#94A3B8',
  headerBorder: 'rgba(255,255,255,0.05)',
  navBorder: 'rgba(255,255,255,0.10)',
  title: '#F1F5F9',
  titleLocked: '#CBD5E1',
  tagBg: 'rgba(30,41,59,0.5)',
  tagBorder: 'rgba(255,255,255,0.05)',
  tagText: '#94A3B8',
};

export const LIGHT: Palette = {
  isDark: false,
  page: '#E8EAF0',
  pageText: '#2E3040',
  card: '#FFFFFF',
  cardText: '#0F172A',
  cardBorder: 'rgba(226,232,240,0.9)',
  pressed: '#F8FAFC',
  barTrack: '#F1F5F9',
  chipBg: '#F1F5F9',
  chipBorder: '#E2E8F0',
  chipText: '#1E293B',
  muted: '#64748B',
  headerBorder: 'rgba(255,255,255,0.4)',
  navBorder: 'rgba(255,255,255,0.5)',
  title: '#0F172A',
  titleLocked: '#334155',
  tagBg: 'rgba(241,245,249,0.9)',
  tagBorder: 'rgba(226,232,240,0.8)',
  tagText: '#64748B',
};

export const INDIGO_400 = '#818CF8';
export const INDIGO_500 = '#6366F1';
export const VIOLET_500 = '#8B5CF6';

// The web app swaps its fonts at runtime (utils/fontThemes.ts). The theme on the test device is 'cognitive-clarity':
// Lexend for display AND body (so every font-['Outfit'] / font-['Plus_Jakarta_Sans'] in the web code renders as Lexend),
// JetBrains Mono for code. Change the three families below to follow a different theme.
export const FONT = {
  outfit: { md: 'Lexend-Medium', sb: 'Lexend-SemiBold', b: 'Lexend-Bold', xb: 'Lexend-Bold' },
  jakarta: { md: 'Lexend-Medium', sb: 'Lexend-SemiBold', b: 'Lexend-Bold' },
  body: 'Lexend-Regular',
  mono: { r: 'JetBrainsMono-Regular', md: 'JetBrainsMono-Medium', sb: 'JetBrainsMono-SemiBold', b: 'JetBrainsMono-Bold' },
  icons: 'MaterialSymbolsOutlined',
  iconsFilled: 'MaterialSymbolsFilled',
};

/** Tailwind colour families used by the per-world node styling (50 / 200 / 400 / 500 / 700 / 950). */
export interface Family {
  c50: string;
  c200: string;
  c400: string;
  c500: string;
  c700: string;
  c950: string;
}
const fam = (c50: string, c200: string, c400: string, c500: string, c700: string, c950: string): Family => ({ c50, c200, c400, c500, c700, c950 });
export const FAMILIES: Record<string, Family> = {
  indigo: fam('#EEF2FF', '#C7D2FE', '#818CF8', '#6366F1', '#4338CA', '#1E1B4B'),
  violet: fam('#F5F3FF', '#DDD6FE', '#A78BFA', '#8B5CF6', '#6D28D9', '#2E1065'),
  blue: fam('#EFF6FF', '#BFDBFE', '#60A5FA', '#3B82F6', '#1D4ED8', '#172554'),
  cyan: fam('#ECFEFF', '#A5F3FC', '#22D3EE', '#06B6D4', '#0E7490', '#083344'),
  fuchsia: fam('#FDF4FF', '#F5D0FE', '#E879F9', '#D946EF', '#A21CAF', '#4A044E'),
  amber: fam('#FFFBEB', '#FDE68A', '#FBBF24', '#F59E0B', '#B45309', '#451A03'),
  rose: fam('#FFF1F2', '#FECDD3', '#FB7185', '#F43F5E', '#BE123C', '#4C0519'),
  teal: fam('#F0FDFA', '#99F6E4', '#2DD4BF', '#14B8A6', '#0F766E', '#042F2E'),
  purple: fam('#FAF5FF', '#E9D5FF', '#C084FC', '#A855F7', '#7E22CE', '#3B0764'),
  sky: fam('#F0F9FF', '#BAE6FD', '#38BDF8', '#0EA5E9', '#0369A1', '#082F49'),
  emerald: fam('#ECFDF5', '#A7F3D0', '#34D399', '#10B981', '#047857', '#022C22'),
  orange: fam('#FFF7ED', '#FED7AA', '#FB923C', '#F97316', '#C2410C', '#431407'),
  pink: fam('#FDF2F8', '#FBCFE8', '#F472B6', '#EC4899', '#BE185D', '#500724'),
  red: fam('#FEF2F2', '#FECACA', '#F87171', '#EF4444', '#B91C1C', '#450A0A'),
};

/** WORLD_ICON_STYLES in Home.tsx: which family colours each world's node. */
export const WORLD_FAMILY: string[] = [
  'indigo', 'violet', 'blue', 'cyan', 'fuchsia', 'amber', 'rose', 'teal', 'purple', 'sky', 'indigo',
  'emerald', 'orange', 'pink', 'violet', 'amber', 'red', 'emerald', 'purple', 'cyan', 'orange', 'amber',
];

/** getWorldIcon in Home.tsx. */
export const WORLD_ICONS: string[] = [
  'code', 'terminal', 'data_object', 'account_tree', 'function', 'visibility', 'security', 'category', 'science',
  'view_list', 'hub', 'data_object', 'inventory_2', 'bolt', 'workspace_premium', 'architecture', 'swap_vert',
  'tune', 'memory', 'cloud', 'rocket_launch', 'military_tech',
];

const channels = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** '#RRGGBB' with an alpha (0-1) as an rgba() string. */
export const withAlpha = (hex: string, alpha: number): string => {
  const [r, g, b] = channels(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};

/** Blend `from` toward `to` by t (0 = from, 1 = to). */
export const mix = (from: string, to: string, t: number): string => {
  const a = channels(from);
  const b = channels(to);
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0');
  return `#${m(0)}${m(1)}${m(2)}`;
};

/** CSS grayscale(amount) for a colour: the web greys locked worlds with grayscale-[0.35]. */
export const grayscale = (hex: string, amount: number): string => {
  const [r, g, b] = channels(hex);
  const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const hx = (c: number) => Math.round(c + (lum - c) * amount).toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
};
