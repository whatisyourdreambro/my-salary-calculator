// src/components/SidebarStack.tsx
//
// 데스크톱 우측 sticky 사이드바.
// 광고(SidebarAd) + PartnerSlot + 페이지 컨텍스트별 RelatedX를 적층.
// 모바일에서는 컨테이너가 lg: breakpoint로 숨겨져 영향 없음.

"use client";

import { SidebarAd } from "./AdPlacement";
import PartnerSlot from "./PartnerSlot";
import type { PartnerId } from "@/lib/partnerConfig";

interface SidebarStackProps {
  context: "salary" | "calc" | "guide" | "company";
  annualSalary?: number;
  partnerId?: PartnerId;
  className?: string;
}

export default function SidebarStack({
  context,
  annualSalary,
  partnerId,
  className = "",
}: SidebarStackProps) {
  // 컨텍스트별 기본 PartnerSlot 결정 (props로 override 가능)
  const resolvedPartnerId: PartnerId =
    partnerId ??
    (context === "salary"
      ? "finda-dsr"
      : context === "calc"
        ? "finda-loan-calc"
        : context === "company"
          ? "finda-company"
          : "finda-loan-guide");

  return (
    <aside
      className={`hidden lg:block lg:sticky lg:top-24 space-y-6 ${className}`}
      aria-label="추천·광고"
    >
      <SidebarAd />
      <PartnerSlot
        id={resolvedPartnerId}
        context={annualSalary ? { annualSalary } : undefined}
      />
    </aside>
  );
}
