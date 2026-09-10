"use client";

// 404 화면의 광고 요청 보류 해제 담당 (src/app/not-found.tsx 와 한 쌍).
//
// not-found.tsx 의 인라인 스크립트가 문서 파싱 중 `adsbygoogle.pauseAdRequests=1` 을 세워
// 자동광고·수동 유닛 요청을 보류한다(Google 게시자 정책: 콘텐츠 없는 화면·알림/내비게이션 화면 광고 금지).
// 사용자가 404 의 추천 링크로 SPA 이동하면 새 페이지의 AdSlot 이 push 하므로, 이 컴포넌트의
// 언마운트 시점에 보류를 풀어야 정상 페이지 광고가 살아난다(React 는 이전 트리의 cleanup 을
// 새 트리의 effect 보다 먼저 실행한다). 클라이언트 렌더로 도달한 404(인라인 스크립트 미실행)도
// mount effect 가 같은 값을 세운다.

import { useEffect } from "react";

type AdsQueue = unknown[] & { pauseAdRequests?: number };

export default function NotFoundAdPause() {
  useEffect(() => {
    const w = window as unknown as { adsbygoogle?: AdsQueue };
    const queue: AdsQueue = (w.adsbygoogle = w.adsbygoogle || []);
    queue.pauseAdRequests = 1;
    return () => {
      queue.pauseAdRequests = 0;
    };
  }, []);
  return null;
}
