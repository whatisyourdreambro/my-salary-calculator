"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isSharePageContextPending, isSharePageReady, type SharePageContext } from "@/lib/sharePolicy";

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
    // Build-time head metadata; sharePolicy.safePageOgImage decides whether it may become the Kakao card (B38).
    ogImage: document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? null,
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
    // content: a route change may update the og:image meta in place instead of replacing it.
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "data-page-state", "content"] });
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

/**
 * SSR and the first hydration render both omit share controls until route/head agree.
 * pending: head 를 아직 읽지 못한 동안 true — 인라인 버튼이 같은 크기의 보이지 않는 자리만 잡는다(OPP-21).
 * context 판정은 종전과 같다(pending 은 추가 신호일 뿐, 이를 읽지 않는 호출부는 동작 불변).
 */
export function useSharePageContext() {
  const pathname = usePathname() ?? "/";
  const context = useSyncExternalStore(subscribe, () => snapshot, () => null);
  useEffect(refresh, [pathname]);
  const ready = isSharePageReady(context, pathname);
  return { pathname, context: ready ? context : null, pending: !ready && isSharePageContextPending(context, pathname) };
}
