import { useEffect, useState, type CSSProperties } from "react";

export type MobileSheetFrame = {
  height: number;
  offsetTop: number;
  bottomInset: number;
  keyboardOpen: boolean;
};

const KEYBOARD_INSET_PX = 72;

export function readMobileSheetFrame(): MobileSheetFrame {
  const viewport = window.visualViewport;
  const layoutHeight = window.innerHeight;
  const height = Math.round(viewport?.height ?? layoutHeight);
  const offsetTop = Math.round(viewport?.offsetTop ?? 0);
  const bottomInset = Math.max(0, layoutHeight - offsetTop - height);
  const keyboardOpen =
    bottomInset > KEYBOARD_INSET_PX ||
    (offsetTop > 12 && height < layoutHeight - KEYBOARD_INSET_PX);

  return {
    height,
    offsetTop,
    bottomInset,
    keyboardOpen,
  };
}

/** Keep a bottom sheet inside the visible area when the phone keyboard opens. */
export function useMobileSheetFrame(active: boolean): MobileSheetFrame | null {
  const [frame, setFrame] = useState<MobileSheetFrame | null>(null);

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setFrame(null);
      return;
    }

    const apply = () => setFrame(readMobileSheetFrame());
    const remeasureSoon = () => {
      apply();
      window.setTimeout(apply, 50);
      window.setTimeout(apply, 180);
      window.setTimeout(apply, 360);
    };

    apply();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", remeasureSoon);
    viewport?.addEventListener("scroll", apply);
    window.addEventListener("resize", remeasureSoon);
    document.addEventListener("focusin", remeasureSoon);
    document.addEventListener("focusout", remeasureSoon);

    return () => {
      viewport?.removeEventListener("resize", remeasureSoon);
      viewport?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", remeasureSoon);
      document.removeEventListener("focusin", remeasureSoon);
      document.removeEventListener("focusout", remeasureSoon);
    };
  }, [active]);

  return frame;
}

export function mobileSheetPositionStyle(
  frame: MobileSheetFrame | null,
): CSSProperties {
  if (!frame?.keyboardOpen) {
    return { position: "fixed", left: 0, right: 0, bottom: 0 };
  }

  return {
    position: "fixed",
    left: 0,
    right: 0,
    top: "auto",
    bottom: frame.bottomInset,
    height: frame.height,
    maxHeight: frame.height,
  };
}

/**
 * Stop the page behind a sheet from scrolling without `overflow: hidden`.
 * That lock keeps iOS from shrinking `visualViewport` when the keyboard opens,
 * so the sheet stays pinned behind the keyboard.
 */
export function useSheetScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const blockBackgroundScroll = (event: TouchEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-sheet-scroll], [data-sheet-panel]")
      ) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundScroll, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", blockBackgroundScroll);
    };
  }, [active]);
}

export function scrollFieldIntoSheet(target: EventTarget | null) {
  if (!(target instanceof HTMLElement) || target.tagName === "BODY") return;
  const scroller = target.closest("[data-sheet-scroll]");
  if (!(scroller instanceof HTMLElement)) return;

  const scrollerRect = scroller.getBoundingClientRect();
  const fieldRect = target.getBoundingClientRect();
  const padding = 16;

  if (fieldRect.top < scrollerRect.top + padding) {
    scroller.scrollTop -= scrollerRect.top + padding - fieldRect.top;
    return;
  }

  if (fieldRect.bottom > scrollerRect.bottom - padding) {
    scroller.scrollTop += fieldRect.bottom - (scrollerRect.bottom - padding);
  }
}

export function scheduleScrollFieldIntoSheet() {
  const run = () => {
    scrollFieldIntoSheet(document.activeElement);
  };
  requestAnimationFrame(run);
  window.setTimeout(run, 80);
  window.setTimeout(run, 280);
}
