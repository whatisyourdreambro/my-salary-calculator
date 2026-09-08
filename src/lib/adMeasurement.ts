/** Observe one real, non-empty element until at least half of it is in view. */
export function observeViewableImpression(
  element: Element,
  onImpression: () => void,
): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  let active = true;
  const observer = new IntersectionObserver((entries) => {
    if (!active) return;
    for (const entry of entries) {
      if (
        entry.target !== element || !element.isConnected ||
        !entry.isIntersecting || entry.intersectionRatio < 0.5 ||
        entry.boundingClientRect.width <= 0 || entry.boundingClientRect.height <= 0
      ) continue;
      active = false;
      observer.disconnect();
      onImpression();
      break;
    }
  }, { rootMargin: "0px", threshold: 0.5 });
  observer.observe(element);
  return () => {
    active = false;
    observer.disconnect();
  };
}

export type CoupangImpressionDimensions = { banner_size: string; category: string };

/**
 * One page visit's fallback impressions. Observe the rendered banner, not its
 * possibly empty wrapper. Core owns responsive size/dedup; metadata follows it.
 * Restart this subscription on pathname changes, including browser back/forward.
 */
export function observeCoupangImpressions(
  container: Element,
  onImpression: (dimensions: CoupangImpressionDimensions) => void,
): () => void {
  let active = true;
  let current: Element | null = null;
  let currentKey = "";
  let stopObserving = () => {};
  const reported = new Set<string>();
  const reconcile = () => {
    if (!active) return;
    const banner = container.querySelector("[data-coupang-banner-size][data-coupang-category]");
    const size = banner?.getAttribute("data-coupang-banner-size");
    const category = banner?.getAttribute("data-coupang-category");
    const key = JSON.stringify([size, category]);
    if (banner === current && key === currentKey) return;
    stopObserving();
    current = banner;
    currentKey = key;
    if (!banner || !size || !category || reported.has(key)) return;
    stopObserving = observeViewableImpression(banner, () => {
      if (
        !active || !container.contains(banner) ||
        banner.getAttribute("data-coupang-banner-size") !== size ||
        banner.getAttribute("data-coupang-category") !== category
      ) return;
      reported.add(key);
      onImpression({ banner_size: size, category });
    });
  };
  reconcile();
  const mutations = typeof MutationObserver === "undefined" ? null : new MutationObserver(reconcile);
  mutations?.observe(container, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["data-coupang-banner-size", "data-coupang-category"],
  });
  return () => {
    active = false;
    mutations?.disconnect();
    stopObserving();
  };
}
