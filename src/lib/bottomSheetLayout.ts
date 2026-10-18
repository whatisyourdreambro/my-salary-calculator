import { BOTTOM_AD_CHECK_INTERVAL_MS, getBottomAdHeight } from "./bottomAdDetect";

export interface BottomSheetSpace {
  bottom: number;
  maxHeight: number;
  paddingBottom: number;
}

/** Read geometry only. Never hide, move, or interact with an advertisement. */
export function readBottomSheetSpace(previousPadding = 0): BottomSheetSpace {
  const layoutHeight = window.innerHeight;
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const height = viewport?.height ?? layoutHeight;
  if (![layoutHeight, top, height].every(Number.isFinite) || layoutHeight <= 0 || height <= 0 || top < 0) {
    throw new Error("Unavailable viewport");
  }
  const bottomEdge = Math.min(layoutHeight, top + height);
  const visibleHeight = bottomEdge - top;
  const adInset = getBottomAdHeight(bottomEdge, top);
  if (!Number.isFinite(adInset) || adInset < 0) throw new Error("Unavailable anchor geometry");
  // Do not collapse the reserved gap while this sheet is open.
  const paddingBottom = Math.max(previousPadding, adInset > 0 ? adInset + 12 : 0);
  const maxHeight = Math.floor(visibleHeight * 0.85);
  if (maxHeight - paddingBottom < 96) throw new Error("Insufficient safe space");
  return { bottom: Math.max(0, layoutHeight - bottomEdge), maxHeight, paddingBottom };
}

/** Fail closed on unreadable geometry; no automatic reopening after failure. */
export function observeBottomSheetSpace(onSpace: (space: BottomSheetSpace) => void, onUnsafe: () => void) {
  const viewport = window.visualViewport;
  let active = true;
  let padding = 0;
  const stop = () => {
    active = false;
    clearInterval(timer);
    window.removeEventListener("resize", evaluate);
    window.removeEventListener("orientationchange", evaluate);
    viewport?.removeEventListener("resize", evaluate);
    viewport?.removeEventListener("scroll", evaluate);
  };
  const evaluate = () => {
    if (!active) return;
    try {
      const space = readBottomSheetSpace(padding);
      padding = space.paddingBottom;
      onSpace(space);
    } catch {
      stop();
      onUnsafe();
    }
  };
  window.addEventListener("resize", evaluate);
  window.addEventListener("orientationchange", evaluate);
  viewport?.addEventListener("resize", evaluate);
  viewport?.addEventListener("scroll", evaluate);
  const timer = setInterval(evaluate, BOTTOM_AD_CHECK_INTERVAL_MS);
  evaluate();
  return stop;
}
