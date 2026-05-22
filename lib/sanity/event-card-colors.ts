import {
  contrastTextForPanel,
  PANEL_COLOR_PRESETS,
  resolvePanelColorCss,
  resolveTextColorCss,
} from "@/lib/theme/colorPresets";

const CREAM = PANEL_COLOR_PRESETS.cream.css;
const INK = PANEL_COLOR_PRESETS.ink.css;

export function resolveEventCardColors(
  raw: {
    cardBackgroundColor?: string | null;
    cardTextColor?: string | null;
  },
  listIndex: number,
): { bgColor: string; textColor: string } {
  const bgToken = raw.cardBackgroundColor?.trim() || "";
  const customBg = bgToken
    ? resolvePanelColorCss(bgToken, "cream")
    : null;
  const hasCustomBg = Boolean(bgToken);

  const customText = resolveTextColorCss(raw.cardTextColor);

  if (hasCustomBg && customBg) {
    return {
      bgColor: customBg,
      textColor:
        customText ?? contrastTextForPanel(bgToken),
    };
  }

  const lightBg = listIndex % 2 === 0;
  const bgColor = lightBg ? CREAM : INK;
  return {
    bgColor,
    textColor: customText ?? (lightBg ? INK : "#ffffff"),
  };
}