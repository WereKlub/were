const CREAM = "#f5f0eb";
const INK = "#1a1a1a";

const HEX_SHORT = /^#([A-Fa-f0-9]{3})$/;
const HEX_LONG = /^#([A-Fa-f0-9]{6})$/;

function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();
  const long = trimmed.match(HEX_LONG);
  if (long) return `#${long[1].toLowerCase()}`;
  const short = trimmed.match(HEX_SHORT);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function luminance(hex: string): number {
  const n = normalizeHex(hex);
  if (!n) return 0;
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastTextColor(backgroundHex: string): string {
  return luminance(backgroundHex) > 0.45 ? INK : "#ffffff";
}

export function resolveEventCardColors(
  raw: {
    cardBackgroundColor?: string | null;
    cardTextColor?: string | null;
  },
  listIndex: number,
): { bgColor: string; textColor: string } {
  const customBg = raw.cardBackgroundColor
    ? normalizeHex(raw.cardBackgroundColor)
    : null;
  const customText = raw.cardTextColor
    ? normalizeHex(raw.cardTextColor)
    : null;

  if (customBg) {
    return {
      bgColor: customBg,
      textColor: customText ?? contrastTextColor(customBg),
    };
  }

  const lightBg = listIndex % 2 === 0;
  const bgColor = lightBg ? CREAM : INK;
  return {
    bgColor,
    textColor: customText ?? (lightBg ? INK : "#ffffff"),
  };
}
