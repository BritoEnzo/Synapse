function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export interface ContrastColors {
  text: string;
  subtext: string;
  muted: string;
  divider: string;
  actionBar: string;
  actionText: string;
  badgeBg: string;
  badgeText: string;
}

export function getContrastColors(bgHex: string = '#ffffff'): ContrastColors {
  const L = luminance(bgHex);
  const isDark = L < 0.2;

  return isDark
    ? {
        text: '#f9fafb',
        subtext: '#e5e7eb',
        muted: '#9ca3af',
        divider: 'rgba(255,255,255,0.15)',
        actionBar: 'rgba(255,255,255,0.08)',
        actionText: '#d1d5db',
        badgeBg: 'rgba(255,255,255,0.15)',
        badgeText: '#f9fafb',
      }
    : {
        text: '#111827',
        subtext: '#374151',
        muted: '#6b7280',
        divider: 'rgba(0,0,0,0.08)',
        actionBar: 'rgba(0,0,0,0.04)',
        actionText: '#6b7280',
        badgeBg: 'rgba(0,0,0,0.08)',
        badgeText: '#374151',
      };
}
