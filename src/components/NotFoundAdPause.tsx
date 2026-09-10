"use client";

// 404 화면의 광고 요청 보류/해제 (src/app/not-found.tsx 와 한 쌍) — 루트 layout 에서 항상 마운트된다.
//
// not-found.tsx 의 인라인 스크립트가 문서 파싱 중 `adsbygoogle.pauseAdRequests=1` 을 세워
// 자동광고·수동 유닛 요청을 보류한다(Google 게시자 정책: 콘텐츠 없는 화면·알림/내비게이션 화면 광고 금지).
// 이 컴포넌트는 경로가 바뀔 때마다 404 마커(`main[data-page-state="not-found"]`)를 보고
// 404 이면 보류(클라이언트 렌더로 도달한 404 포함), 아니면 보류를 해제해 정상 페이지의 AdSlot push 가 살아난다.
//
// ★ not-found.tsx 에서 직접 import 하지 말 것 — not-found 만 참조하는 클라이언트 컴포넌트는 Edge 런타임
//   라우트(qna·glossary 한글 슬러그, /en 폴백)의 클라이언트 참조 매니페스트에서 빠져
//   `Cannot read properties of undefined (reading 'default')` 로 해당 라우트 전체가 500 이 됐다
//   (2026-09-11 로컬 next start 실측). 루트 layout 참조는 모든 라우트 매니페스트에 포함된다.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AdsQueue = unknown[] & { pauseAdRequests?: number };

export default function NotFoundAdPause() {
  const pathname = usePathname();
  useEffect(() => {
    const w = window as unknown as { adsbygoogle?: AdsQueue };
    const queue: AdsQueue = (w.adsbygoogle = w.adsbygoogle || []);
    const isNotFound = Boolean(document.querySelector('main[data-page-state="not-found"]'));
    if (isNotFound) queue.pauseAdRequests = 1;
    else if (queue.pauseAdRequests === 1) queue.pauseAdRequests = 0;
  }, [pathname]);
  return null;
}
