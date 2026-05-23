"use client";

import { useEffect } from "react";
import { trackSalaryLookup } from "@/lib/analytics";

interface Props {
  companyId: string;
  companyName: string;
  industry?: string;
}

/**
 * 회사 페이지 진입 시 GA4 salary_lookup 이벤트 1회 전송.
 * "{회사명} 연봉" 검색이 트래픽 엔진의 1순위이므로 이 이벤트를
 * GA4 콘솔에서 주요 이벤트(conversion)로 표시하면 검색→매출 funnel 가시화.
 */
export default function SalaryLookupTracker({ companyId, companyName, industry }: Props) {
  useEffect(() => {
    trackSalaryLookup(companyId, companyName, industry);
  }, [companyId, companyName, industry]);

  return null;
}
