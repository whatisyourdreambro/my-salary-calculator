/** Focus the result summary only after a user's calculation, with no delayed jump. */
export function focusCalculationResult(summary: HTMLElement | null) {
  if (!summary) return;
  summary.focus({ preventScroll: true });
  const rect = summary.getBoundingClientRect();
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const bottom = top + (viewport?.height ?? window.innerHeight);
  // The fixed header needs the same clearance as the summary's scroll margin.
  if (rect.top < top + 96 || rect.bottom > bottom) {
    summary.scrollIntoView({ behavior: "instant", block: "nearest" });
  }
}
