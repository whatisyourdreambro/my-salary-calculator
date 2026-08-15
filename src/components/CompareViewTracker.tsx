"use client";

import { useEffect } from "react";
import { trackCompareView } from "@/lib/analytics";

interface Props {
  companyIds: string[];
  source?: string;
}

/**
 * 회사 비교 페이지 진입 시 GA4 compare_view 이벤트 1회 전송.
 * 413개 비교 페이지 중 어떤 페어가 실제 소비되는지 측정 → 페어 확장/정리 근거.
 */
export default function CompareViewTracker({ companyIds, source }: Props) {
  useEffect(() => {
    trackCompareView(companyIds, source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyIds.join(","), source]);

  return null;
}
