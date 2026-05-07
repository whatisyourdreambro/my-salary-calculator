// src/components/PartnerSlot.tsx
//
// 한국형 제휴 마케팅 자리잡기 컴포넌트.
// ENV가 비어 있으면 fallback(주로 CoupangBanner)을 렌더하고,
// ENV가 채워지면 자동으로 활성 카드(헤드라인 + CTA + 추적 URL)로 전환.
//
// 사용 예:
//   <PartnerSlot id="finda-dsr" context={{annualSalary: 50000000}} fallback={<CoupangBanner size="rectangle"/>} />

"use client";

import Link from "next/link";
import {
  getPartnerConfig,
  isPartnerActive,
  buildPartnerUrl,
  type PartnerId,
  type PartnerContext,
} from "@/lib/partnerConfig";
import { ArrowRight, Building2, Shield, Calculator, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface PartnerSlotProps {
  id: PartnerId;
  context?: PartnerContext;
  fallback?: ReactNode;
  /** 시각적 강조 강도 — "card"(기본) / "inline"(작은 라인) */
  layout?: "card" | "inline";
  className?: string;
}

const KIND_ICON = {
  loan: Building2,
  insurance: Shield,
  tax: Calculator,
  investment: TrendingUp,
} as const;

const KIND_GRADIENT = {
  loan: "from-blue-500 to-indigo-600",
  insurance: "from-emerald-500 to-teal-600",
  tax: "from-amber-500 to-orange-600",
  investment: "from-violet-500 to-purple-600",
} as const;

export default function PartnerSlot({
  id,
  context,
  fallback = null,
  layout = "card",
  className = "",
}: PartnerSlotProps) {
  const active = isPartnerActive(id);
  if (!active) return <>{fallback}</>;

  const config = getPartnerConfig(id);
  const url = buildPartnerUrl(id, context);
  if (!url) return <>{fallback}</>;

  const headline = config.buildDynamicHeadline?.(context ?? {}) ?? config.headline;
  const Icon = KIND_ICON[config.kind];
  const gradient = KIND_GRADIENT[config.kind];

  if (layout === "inline") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener nofollow sponsored"
        className={`inline-flex items-center gap-2 text-sm font-bold text-electric hover:underline ${className}`}
      >
        {headline}
        <ArrowRight className="w-3 h-3" />
      </Link>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <Link
        href={url}
        target="_blank"
        rel="noopener nofollow sponsored"
        className="block group"
      >
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 sm:p-7 text-white shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="absolute -top-6 -right-6 opacity-15 pointer-events-none">
            <Icon className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">
                추천 · 광고
              </p>
              <h3 className="text-base sm:text-lg font-black leading-tight mb-1">
                {headline}
              </h3>
              <p className="text-sm opacity-90">{config.subline}</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap group-hover:bg-white/30 transition-colors flex-shrink-0">
              {config.cta}
            </div>
          </div>
        </div>
      </Link>
      <p className="text-[10px] text-faint-blue text-center mt-2">
        본 링크는 제휴 마케팅 활동의 일환으로, 클릭 시 일정액의 수수료가 머니샐러리에 제공될 수 있습니다.
      </p>
    </div>
  );
}
