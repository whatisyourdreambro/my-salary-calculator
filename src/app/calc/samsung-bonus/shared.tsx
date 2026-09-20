"use client";

// samsung-bonus 공유 모듈 — 고정 정책 상수·세금 로직·사업부 데이터·포맷 유틸·useCountUp.
// Client.tsx 본체와 next/dynamic 으로 분리 로드되는 시뮬레이터 2종이 함께 사용한다.

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { observeSamsungModuleView } from "./observeSamsungModuleView";
import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import { trackEvent, trackGuideCTAClick } from "@/lib/analytics";
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";

// ────────────────────────────────────────────────────────────
// 고정 정책 상수·세금 로직·사업부 데이터·풀 분배 — 순수 모듈 model.ts 로 이동
// (2026-09-21 S2-0). 여기서 그대로 재수출하므로 기존 "./shared" import 는 유지된다.
// 수치·로직 수정은 model.ts(계산)·opiData.ts(OPI 실지급률)·taiData.ts(TAI)에서만.
// ────────────────────────────────────────────────────────────
export {
  FIXED_RERATE,
  FIXED_BU_RATIO,
  FIXED_SA_RATIO,
  FIXED_OPI1_RATE,
  REFERENCE_SALARY,
  getThreshold,
  getThresholdPeriod,
  calcSamsungBonusNet,
  DIVISIONS,
  defaultDivisionCounts,
  defaultDivisionRatios,
  computeDivisionPool,
  parseNumberInput,
} from "./model";
export type { Division, DivisionId, DivisionPoolRow } from "./model";

// ────────────────────────────────────────────────────────────
// 유틸 — 모든 큰 숫자 입력은 콤마 포맷으로 통일
// ────────────────────────────────────────────────────────────

export function fmtManwon(n: number) {
  return Math.round(n).toLocaleString("ko-KR") + "만원";
}
export function fmtManwonInt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
export function fmtEok(n: number) {
  const eok = n / 10000;
  return eok >= 1 ? `≈ ${eok.toFixed(2)}억` : "";
}
export function fmtTrillion(manwon: number) {
  return (manwon / 1e8).toFixed(1);
}
export function fmtEokInt(manwon: number) {
  return Math.round(manwon / 10000).toLocaleString("ko-KR");
}
export function fmtPlain(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
export function formatNumberInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
// 소수점 입력 정리 — 두 번째 이후의 '.'을 제거해 "3.5.0" 같은
// NaN 유발 입력을 차단한다 (NaN → 0 으로 조용히 계산되는 사고 방지)
export function sanitizeDecimalInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

// ────────────────────────────────────────────────────────────
// 결과 직하 다음 액션 링크 — 계산 결과를 확인한 피크 순간에
// 사이트 내 다른 서비스로 이어주는 컴팩트 pill 링크 행.
// (광고 컴포넌트와 무관 — 결과 카드 내부/각주 옆에만 배치)
// ────────────────────────────────────────────────────────────

export function ResultNextLinks({
  links,
  className = "",
  calcResult,
  position,
}: {
  links: { href: string; label: string; primary?: boolean }[];
  className?: string;
  position?: "samsung-pool-next" | "samsung-personal-next";
  /** 계산 결과 보간 값 — 오퍼 활성 시 문구 치환용 (예: { amount: 성과급 만원 }) */
  calcResult?: Record<string, string | number>;
}) {
  const pathname = usePathname();
  const linkRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = linkRowRef.current;
    if (!position || pathname !== "/calc/samsung-bonus" || !element) return;
    return observeSamsungModuleView(element, () => {
      trackEvent("module_view", { position, page_path: pathname });
    });
  }, [position, pathname]);

  return (
    <div className={className}>
      <div
        ref={linkRowRef}
        role={position ? "navigation" : undefined}
        aria-label={position === "samsung-personal-next" ? "개인 결과 다음 단계" : position ? "평균 결과 다음 단계" : undefined}
        className="flex flex-wrap gap-2"
      >
        {links.map((l) => (
          <Link
            key={l.href + l.label}
            href={l.href}
            onClick={() => trackGuideCTAClick(l.href, position ?? "next-action")}
            className={`group inline-flex items-center gap-1 text-xs font-bold border rounded-full px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric ${l.primary ? "min-h-11 text-white bg-electric border-electric hover:bg-electric/90" : "text-electric bg-electric-5 border-electric-20 hover:bg-electric hover:text-white"}`}
          >
            {l.label}
            <ArrowRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            />
          </Link>
        ))}
      </div>
      {/* 제휴 오퍼 병기 — 승인 전(전부 inactive)엔 무렌더, 내부 링크는 위에서 유지 */}
      <OfferSlot vertical="securities" calcResult={calcResult} />
    </div>
  );
}

export function useCountUp(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const prevValue = useRef(target);

  useEffect(() => {
    if (Math.abs(prevTarget.current - target) < 1) {
      setValue(target);
      prevTarget.current = target;
      prevValue.current = target;
      return;
    }
    const start = prevValue.current;
    const startTime = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      prevValue.current = current;
      setValue(current);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else {
        prevTarget.current = target;
        prevValue.current = target;
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}
