/**
 * Curated color tokens for Sanity → site CSS.
 * Keys are stored in CMS; values are resolved at render time.
 */

export type TextColorPreset = "ink" | "white" | "cream" | "black";

export interface ColorPresetDefinition {
  label: string;
  css: string;
  /** Used when text color is left on “automatic” */
  contrastText: TextColorPreset;
  isGradient?: boolean;
}

/** Solid fills — Tailwind-aligned hex values plus brand tones */
export const SOLID_COLOR_PRESETS = {
  cream: { label: "Cream", css: "#f5f0eb", contrastText: "ink" },
  ink: { label: "Ink", css: "#1a1a1a", contrastText: "white" },
  white: { label: "White", css: "#ffffff", contrastText: "ink" },
  black: { label: "Black", css: "#000000", contrastText: "white" },
  sage: { label: "Sage", css: "#9db7a8", contrastText: "ink" },
  "gray-100": { label: "Gray 100", css: "#f3f4f6", contrastText: "ink" },
  "gray-200": { label: "Gray 200", css: "#e5e7eb", contrastText: "ink" },
  "gray-800": { label: "Gray 800", css: "#1f2937", contrastText: "white" },
  "red-400": { label: "Red 400", css: "#f87171", contrastText: "ink" },
  "red-500": { label: "Red 500", css: "#ef4444", contrastText: "white" },
  "red-600": { label: "Red 600", css: "#dc2626", contrastText: "white" },
  "orange-400": { label: "Orange 400", css: "#fb923c", contrastText: "ink" },
  "orange-500": { label: "Orange 500", css: "#f97316", contrastText: "ink" },
  "amber-400": { label: "Amber 400", css: "#fbbf24", contrastText: "ink" },
  "amber-500": { label: "Amber 500", css: "#f59e0b", contrastText: "ink" },
  "yellow-300": { label: "Yellow 300", css: "#fde047", contrastText: "ink" },
  "yellow-400": { label: "Yellow 400", css: "#facc15", contrastText: "ink" },
  "lime-400": { label: "Lime 400", css: "#a3e635", contrastText: "ink" },
  "lime-500": { label: "Lime 500", css: "#84cc16", contrastText: "ink" },
  "green-500": { label: "Green 500", css: "#22c55e", contrastText: "ink" },
  "green-600": { label: "Green 600", css: "#16a34a", contrastText: "white" },
  "emerald-300": { label: "Emerald 300", css: "#6ee7b7", contrastText: "ink" },
  "emerald-400": { label: "Emerald 400", css: "#34d399", contrastText: "ink" },
  "emerald-500": { label: "Emerald 500", css: "#10b981", contrastText: "ink" },
  "teal-400": { label: "Teal 400", css: "#2dd4bf", contrastText: "ink" },
  "teal-500": { label: "Teal 500", css: "#14b8a6", contrastText: "ink" },
  "teal-600": { label: "Teal 600", css: "#0d9488", contrastText: "white" },
  "cyan-400": { label: "Cyan 400", css: "#22d3ee", contrastText: "ink" },
  "cyan-500": { label: "Cyan 500", css: "#06b6d4", contrastText: "ink" },
  "sky-400": { label: "Sky 400", css: "#38bdf8", contrastText: "ink" },
  "sky-500": { label: "Sky 500", css: "#0ea5e9", contrastText: "white" },
  "blue-500": { label: "Blue 500", css: "#3b82f6", contrastText: "white" },
  "blue-600": { label: "Blue 600", css: "#2563eb", contrastText: "white" },
  "indigo-500": { label: "Indigo 500", css: "#6366f1", contrastText: "white" },
  "violet-500": { label: "Violet 500", css: "#8b5cf6", contrastText: "white" },
  "purple-500": { label: "Purple 500", css: "#a855f7", contrastText: "white" },
  "purple-600": { label: "Purple 600", css: "#9333ea", contrastText: "white" },
  "fuchsia-500": { label: "Fuchsia 500", css: "#d946ef", contrastText: "white" },
  "pink-400": { label: "Pink 400", css: "#f472b6", contrastText: "ink" },
  "pink-500": { label: "Pink 500", css: "#ec4899", contrastText: "white" },
  "rose-500": { label: "Rose 500", css: "#f43f5e", contrastText: "white" },
} as const satisfies Record<string, ColorPresetDefinition>;

/** Gradients for panels and event cards */
export const GRADIENT_COLOR_PRESETS = {
  "gradient-sunset": {
    label: "Gradient — Sunset",
    css: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-ocean": {
    label: "Gradient — Ocean",
    css: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-forest": {
    label: "Gradient — Forest",
    css: "linear-gradient(135deg, #22c55e 0%, #0d9488 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-twilight": {
    label: "Gradient — Twilight",
    css: "linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-citrus": {
    label: "Gradient — Citrus",
    css: "linear-gradient(135deg, #fde047 0%, #84cc16 100%)",
    contrastText: "ink",
    isGradient: true,
  },
  "gradient-cherry": {
    label: "Gradient — Cherry",
    css: "linear-gradient(135deg, #fb7185 0%, #dc2626 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-neon": {
    label: "Gradient — Neon",
    css: "linear-gradient(135deg, #facc15 0%, #d946ef 100%)",
    contrastText: "ink",
    isGradient: true,
  },
  "gradient-mint": {
    label: "Gradient — Mint",
    css: "linear-gradient(135deg, #6ee7b7 0%, #22d3ee 100%)",
    contrastText: "ink",
    isGradient: true,
  },
  "gradient-night": {
    label: "Gradient — Night",
    css: "linear-gradient(160deg, #1a1a1a 0%, #581c87 100%)",
    contrastText: "white",
    isGradient: true,
  },
  "gradient-cream-ink": {
    label: "Gradient — Cream to ink",
    css: "linear-gradient(180deg, #f5f0eb 0%, #1a1a1a 100%)",
    contrastText: "ink",
    isGradient: true,
  },
} as const satisfies Record<string, ColorPresetDefinition>;

export const PANEL_COLOR_PRESETS = {
  ...SOLID_COLOR_PRESETS,
  ...GRADIENT_COLOR_PRESETS,
} as const;

export type PanelColorPreset = keyof typeof PANEL_COLOR_PRESETS;

export const TEXT_COLOR_PRESETS = {
  ink: { label: "Ink", css: "#1a1a1a" },
  white: { label: "White", css: "#ffffff" },
  cream: { label: "Cream", css: "#f5f0eb" },
  black: { label: "Black", css: "#000000" },
} as const satisfies Record<TextColorPreset, { label: string; css: string }>;

export type TextColorPresetKey = keyof typeof TEXT_COLOR_PRESETS;

const HEX_SHORT = /^#([A-Fa-f0-9]{3})$/;
const HEX_LONG = /^#([A-Fa-f0-9]{6})$/;

export function normalizeHex(hex: string): string | null {
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

function isPanelPreset(value: string): value is PanelColorPreset {
  return value in PANEL_COLOR_PRESETS;
}

function isTextPreset(value: string): value is TextColorPresetKey {
  return value in TEXT_COLOR_PRESETS;
}

/** Dropdown options for Sanity (solids, then gradients) */
export function panelColorOptions(): { title: string; value: string }[] {
  const solids = Object.entries(SOLID_COLOR_PRESETS).map(([value, def]) => ({
    title: def.label,
    value,
  }));
  const gradients = Object.entries(GRADIENT_COLOR_PRESETS).map(([value, def]) => ({
    title: def.label,
    value,
  }));
  return [...solids, ...gradients];
}

export function textColorOptions(): { title: string; value: string }[] {
  return Object.entries(TEXT_COLOR_PRESETS).map(([value, def]) => ({
    title: def.label,
    value,
  }));
}

export function resolvePanelColorCss(
  token: string | null | undefined,
  fallback: PanelColorPreset,
): string {
  const trimmed = token?.trim();
  if (!trimmed) return PANEL_COLOR_PRESETS[fallback].css;
  if (isPanelPreset(trimmed)) return PANEL_COLOR_PRESETS[trimmed].css;
  const legacyHex = normalizeHex(trimmed);
  if (legacyHex) return legacyHex;
  return PANEL_COLOR_PRESETS[fallback].css;
}

export function resolveTextColorCss(
  token: string | null | undefined,
): string | null {
  const trimmed = token?.trim();
  if (!trimmed) return null;
  if (isTextPreset(trimmed)) return TEXT_COLOR_PRESETS[trimmed].css;
  return normalizeHex(trimmed);
}

export function contrastTextForPanel(token: string | null | undefined): string {
  const trimmed = token?.trim();
  if (trimmed && isPanelPreset(trimmed)) {
    const preset = TEXT_COLOR_PRESETS[PANEL_COLOR_PRESETS[trimmed].contrastText];
    return preset.css;
  }
  const css = trimmed
    ? isPanelPreset(trimmed)
      ? PANEL_COLOR_PRESETS[trimmed].css
      : normalizeHex(trimmed)
    : null;
  if (!css || css.startsWith("linear-gradient")) {
    return trimmed && isPanelPreset(trimmed)
      ? TEXT_COLOR_PRESETS[PANEL_COLOR_PRESETS[trimmed].contrastText].css
      : TEXT_COLOR_PRESETS.white.css;
  }
  return luminanceFromHex(css) > 0.45
    ? TEXT_COLOR_PRESETS.ink.css
    : TEXT_COLOR_PRESETS.white.css;
}

function luminanceFromHex(hex: string): number {
  const n = normalizeHex(hex);
  if (!n) return 0;
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
