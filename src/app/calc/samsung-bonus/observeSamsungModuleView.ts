export function observeSamsungModuleView(element: Element, onView: () => void): () => void {
  if (typeof IntersectionObserver === "undefined" || typeof document === "undefined") {
    return () => {};
  }
  const page = document;
  const pageEvents = typeof window === "undefined" ? null : window;
  let active = true;
  let pageActive = true;
  let viewed = false;
  let sufficientlyVisible = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const update = () => {
    if (!active || !pageActive || viewed || !sufficientlyVisible || page.visibilityState !== "visible") {
      cancel();
      return;
    }
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      timer = undefined;
      if (!active || !pageActive || viewed || !sufficientlyVisible || page.visibilityState !== "visible") return;
      viewed = true;
      observer.disconnect();
      onView();
    }, 1000);
  };
  const observer = new IntersectionObserver((entries) => {
    if (!active) return;
    const entry = entries.filter((item) => item.target === element).at(-1);
    if (!entry) return;
    sufficientlyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    update();
  }, { threshold: 0.5 });
  const onPageHide = () => { pageActive = false; cancel(); };
  const onPageShow = () => { pageActive = true; update(); };

  page.addEventListener("visibilitychange", update);
  pageEvents?.addEventListener("pagehide", onPageHide);
  pageEvents?.addEventListener("pageshow", onPageShow);
  observer.observe(element);
  return () => {
    active = false;
    cancel();
    observer.disconnect();
    page.removeEventListener("visibilitychange", update);
    pageEvents?.removeEventListener("pagehide", onPageHide);
    pageEvents?.removeEventListener("pageshow", onPageShow);
  };
}
