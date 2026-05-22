import {
  contrastTextForPanel,
  type PanelColorPreset,
  resolvePanelColorCss,
  resolveTextColorCss,
} from "@/lib/theme/colorPresets";

export function resolveShowcasePanelColors(
  panelColor: string | null | undefined,
  panelTextColor: string | null | undefined,
  fallback: PanelColorPreset,
): { bgColor: string; textColor: string } {
  const bgToken = panelColor?.trim() || fallback;
  const bgColor = resolvePanelColorCss(panelColor, fallback);
  const customText = resolveTextColorCss(panelTextColor);
  return {
    bgColor,
    textColor: customText ?? contrastTextForPanel(bgToken),
  };
}
