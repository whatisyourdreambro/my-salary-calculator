"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isSharePageReady, type SharePageContext } from "@/lib/sharePolicy";

let snapshot: SharePageContext | null = null;
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
let frame = 0;

function refresh() {
  if (typeof document === "undefined") return;
  const next: SharePageContext = {
    pathname: window.location.pathname,
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    title: document.title,
    notFound: !!document.querySelector('[data-page-state="not-found"]'),
    // 계산기가 선언한 공유 상태 URL(해시) — FloatingShareBar 결과 모드 동기 (삼성 S2-0). 없으면 null.
    resultUrl: document.querySelector<HTMLElement>("[data-share-result-url]")?.getAttribute("data-share-result-url") ?? null,
    // 이 페이지의 메타 설명·og:image 원문 (S02) — 카카오·기기 공유 기본값. og:image 는 resolvePublicShare 가 같은 사이트 카드만 통과시킨다.
    description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? null,
    ogImage: document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? null,
  };
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

// DOM 변경 묶음마다 조회·직렬화하지 않고 한 프레임에 한 번만 다시 읽는다 (S02 · RT-09).
function scheduleRefresh() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    refresh();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    // One observer shared by inline, compact, fallback and floating controls.
    observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "content", "data-page-state", "data-share-result-url"] });
    window.addEventListener("popstate", refresh);
  }
  refresh();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = undefined;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("popstate", refresh);
      snapshot = null;
    }
  };
}

/** Test seam only (S02): the shared store behind useSharePageContext, without React. */
export const sharePageContextStore = { subscribe, getSnapshot: () => snapshot };

/** SSR and the first hydration render both omit share controls until route/head agree. */
export function useSharePageContext() {
  const pathname = usePathname() ?? "/";
  const context = useSyncExternalStore(subscribe, () => snapshot, () => null);
  useEffect(refresh, [pathname]);
  return { pathname, context: isSharePageReady(context, pathname) ? context : null };
}
