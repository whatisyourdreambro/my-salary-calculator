"use client";

import { useEffect, useRef } from "react";
import { trackCompareView } from "@/lib/analytics";
import { runWhenGtagReady } from "@/lib/gtagReady";

interface Props {
  companyIds: string[];
  source?: string;
}

/**
 * 회사 비교 페이지 진입 시 GA4 compare_view 이벤트 1회 전송.
 * 413개 비교 페이지 중 어떤 페어가 실제 소비되는지 측정 → 페어 확장/정리 근거.
 *
 * 2026-09-25 CLIENT-03: 하드 로드에서 ga4-init 전에 effect 가 돌아 버려지던 이벤트를
 * gtag 가 생긴 뒤 보낸다(lib/gtagReady). 회사 조합(id 목록) 당 1회.
 */
export default function CompareViewTracker({ companyIds, source }: Props) {
  const idsKey = companyIds.join(",");
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (sentFor.current === idsKey) return;
    return runWhenGtagReady(() => {
      sentFor.current = idsKey;
      // 회사 id 는 슬러그(쉼표 없음)라 키에서 그대로 복원된다 — 배열 prop 을 deps 에 넣지 않기 위함.
      trackCompareView(idsKey ? idsKey.split(",") : [], source);
    });
  }, [idsKey, source]);

  return null;
}
