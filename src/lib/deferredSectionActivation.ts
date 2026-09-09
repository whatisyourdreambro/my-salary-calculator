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
