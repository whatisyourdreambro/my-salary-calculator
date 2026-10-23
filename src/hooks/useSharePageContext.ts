"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isSharePageReady, type SharePageContext } from "@/lib/sharePolicy";

let snapshot: SharePageContext | null = null;
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;

function refresh() {
  if (typeof document === "undefined") return;
  const next: SharePageContext = {
    pathname: window.location.pathname,
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    title: document.title,
    notFound: !!document.querySelector('[data-page-state="not-found"]'),
  };
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    // One observer shared by inline, compact, fallback and floating controls.
    observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "data-page-state"] });
    window.addEventListener("popstate", refresh);
  }
  refresh();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      window.removeEventListener("popstate", refresh);
      snapshot = null;
    }
  };
}

/** SSR and the first hydration render both omit share controls until route/head agree. */
export function useSharePageContext() {
  const pathname = usePathname() ?? "/";
  const context = useSyncExternalStore(subscribe, () => snapshot, () => null);
  useEffect(refresh, [pathname]);
  return { pathname, context: isSharePageReady(context, pathname) ? context : null };
}
