"use client";

// 404/오류 화면의 광고 요청 보류/해제 (src/app/not-found.tsx 와 한 쌍) — 루트 layout 에서 항상 마운트된다.
//
// not-found.tsx 의 인라인 스크립트가 문서 파싱 중 `adsbygoogle.pauseAdRequests=1` 을 세워
// 자동광고·수동 유닛 요청을 보류한다(Google 게시자 정책: 콘텐츠 없는 화면·알림/내비게이션 화면 광고 금지).
// 경로 변경과 같은 경로의 오류/복구 DOM 교체를 모두 관측한다. 마커의 태그 종류는 제한하지 않는다.
// 이미 SDK가 시작한 네트워크 요청을 취소하는 기능은 아니며, 후속 요청의 보류 상태를 갱신한다.
//
// ★ not-found.tsx 에서 직접 import 하지 말 것 — not-found 만 참조하는 클라이언트 컴포넌트는 Edge 런타임
//   라우트(qna·glossary 한글 슬러그, /en 폴백)의 클라이언트 참조 매니페스트에서 빠져
//   `Cannot read properties of undefined (reading 'default')` 로 해당 라우트 전체가 500 이 됐다
//   (2026-09-11 로컬 next start 실측). 루트 layout 참조는 모든 라우트 매니페스트에 포함된다.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { canRequestLiveAds } from "@/lib/liveAds";

type AdsQueue = unknown[] & { pauseAdRequests?: number };

/** Also handles error-boundary replacement without a pathname change. */
export function observePageAdPause() {
  const w = window as unknown as { adsbygoogle?: AdsQueue };
  let active = true;
  const refresh = () => {
    if (!active) return;
    const queue: AdsQueue = (w.adsbygoogle = w.adsbygoogle || []);
    const suppressed = Boolean(document.querySelector('[data-page-state="not-found"], [data-page-state="error"]'));
    if (suppressed || !canRequestLiveAds()) queue.pauseAdRequests = 1;
    else if (queue.pauseAdRequests === 1) queue.pauseAdRequests = 0;
  };
  refresh();
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ["data-page-state"],
  });
  return () => { active = false; observer.disconnect(); };
}

export default function NotFoundAdPause() {
  const pathname = usePathname();
  useEffect(observePageAdPause, [pathname]);
  return null;
}
