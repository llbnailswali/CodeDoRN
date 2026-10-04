// Editor-style accents (the muted tones of a code editor's syntax colours), one per World, cycling. Full class names, so Tailwind can see them.
export interface Accent {
  stripe: string; text: string; textDark: string; bar: string; /** Full-card outline for dark mode: the accent at low opacity. */ borderDark: string;
}
export const ACCENTS: Accent[] = [
  { stripe: 'border-l-[#569cd6]', text: 'text-[#1f6fb5]', textDark: 'text-[#569cd6]', bar: 'bg-[#569cd6]', borderDark: 'border-[#569cd6]/40' }, // blue
  { stripe: 'border-l-[#4ec9b0]', text: 'text-[#17846f]', textDark: 'text-[#4ec9b0]', bar: 'bg-[#4ec9b0]', borderDark: 'border-[#4ec9b0]/40' }, // teal
  { stripe: 'border-l-[#c586c0]', text: 'text-[#95468f]', textDark: 'text-[#c586c0]', bar: 'bg-[#c586c0]', borderDark: 'border-[#c586c0]/40' }, // purple
  { stripe: 'border-l-[#ce9178]', text: 'text-[#a8502f]', textDark: 'text-[#ce9178]', bar: 'bg-[#ce9178]', borderDark: 'border-[#ce9178]/40' }, // orange
  { stripe: 'border-l-[#e5c07b]', text: 'text-[#936a14]', textDark: 'text-[#e5c07b]', bar: 'bg-[#e5c07b]', borderDark: 'border-[#e5c07b]/40' }, // gold
  { stripe: 'border-l-[#98c379]', text: 'text-[#4a7a28]', textDark: 'text-[#98c379]', bar: 'bg-[#98c379]', borderDark: 'border-[#98c379]/40' }, // green
];

export const accentForWorld = (order: number): Accent => ACCENTS[(order - 1) % ACCENTS.length];
