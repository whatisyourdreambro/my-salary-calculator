"use client";

import { useEffect, useRef } from "react";
import { trackSalaryLookup } from "@/lib/analytics";
import { runWhenGtagReady } from "@/lib/gtagReady";

interface Props {
  companyId: string;
  companyName: string;
  industry?: string;
}

/**
 * 회사 페이지 진입 시 GA4 salary_lookup 이벤트 1회 전송.
 * "{회사명} 연봉" 검색이 트래픽 엔진의 1순위이므로 이 이벤트를
 * GA4 콘솔에서 주요 이벤트(conversion)로 표시하면 검색→매출 funnel 가시화.
 *
 * 2026-09-25 CLIENT-03: 하드 로드(검색 착지)에서는 마운트 effect 가 ga4-init 보다 먼저 돌아
 * 이벤트가 버려졌다 → gtag 가 생길 때까지 기다렸다 보낸다(lib/gtagReady). 회사 id 당 1회.
 */
export default function SalaryLookupTracker({ companyId, companyName, industry }: Props) {
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (sentFor.current === companyId) return;
    return runWhenGtagReady(() => {
      sentFor.current = companyId;
      trackSalaryLookup(companyId, companyName, industry);
    });
  }, [companyId, companyName, industry]);

  return null;
}
