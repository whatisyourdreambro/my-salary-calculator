/** Optional below-the-fold tools can mount near the viewport without blocking primary inputs. */
export function watchDeferredSectionActivation(target: Element, id: string, activate: () => void) {
  let settled = false;
  let observer: IntersectionObserver | undefined;
  const stop = () => {
    observer?.disconnect();
    window.removeEventListener("hashchange", onHash);
  };
  const enable = () => {
    if (settled) return;
    settled = true;
    stop();
    activate();
  };
  function onHash() {
    if (window.location.hash === `#${id}`) enable();
  }

  // Direct deep links must not depend on an observer callback arriving first.
  onHash();
  if (!settled) {
    if (typeof IntersectionObserver === "undefined") {
      enable();
    } else {
      window.addEventListener("hashchange", onHash);
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.target === target && entry.isIntersecting)) enable();
      }, { rootMargin: "800px 0px", threshold: 0 });
      observer.observe(target);
    }
  }

  return () => { settled = true; stop(); };
}

/**
 * Mount a heavy below-the-fold widget (e.g. a recharts chart) only once its fixed-size box nears the
 * viewport. Unlike watchDeferredSectionActivation there is no hash deep link and no "open" UI; the
 * caller keeps the box geometry, so a late mount never shifts content or ads.
 */
export function watchNearViewport(target: Element, activate: () => void, rootMargin = "300px 0px") {
  let settled = false;
  let observer: IntersectionObserver | undefined;
  const enable = () => {
    if (settled) return;
    settled = true;
    observer?.disconnect();
    activate();
  };

  if (typeof IntersectionObserver === "undefined") {
    enable();
  } else {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.target === target && entry.isIntersecting)) enable();
    }, { rootMargin, threshold: 0 });
    observer.observe(target);
  }

  return () => { settled = true; observer?.disconnect(); };
}
