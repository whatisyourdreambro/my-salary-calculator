"use client";

// 자동광고 관측 autoads_seen(측정 버전 aa1, 2026-09-26 준비 — 운영자 승인 뒤 배포) — 루트 layout 에 무렌더로 1개.
// 착지 뷰에서 애드센스가 끼워 넣은 자동 인페이지 자리·요청·채움 수를 읽기만 하고, 페이지를 떠날 때 GA4 로 1회 보낸다.
// 상세·해석은 src/lib/autoAdsSeen.ts · docs/analytics-measurement.md.
// DOM 을 만들지 않으므로(return null) 자동광고 학습 경로(verify:autoads)·광고 위치와 무관하다.

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { installAutoAdsSeen, type AutoAdsWindow } from "@/lib/autoAdsSeen";

export default function AutoAdsSeenTracker() {
  useEffect(() => {
    installAutoAdsSeen(window as unknown as AutoAdsWindow, trackEvent);
  }, []);

  return null;
}
