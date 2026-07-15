// src/components/SeasonalBanner.tsx
//
// 현재 월을 기반으로 가장 관련성 높은 시즌 페이지를 자동 노출.
// deadline 있는 경우 D-Day 카운트다운으로 긴급감 부여.

import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";

interface SeasonalContent {
  month: number[];
  /** 같은 달 안에서 노출 기간을 좁힐 때 (예: 성과급 지급 주간) */
  days?: { from: number; to: number };
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  deadline?: { month: number; day: number };
}

const SEASONAL_CALENDAR: SeasonalContent[] = [
  {
    month: [4, 5],
    title: "5월 종합소득세 신고",
    subtitle: "프리랜서·N잡러는 5/31까지 꼭 신고해야 환급 가능",
    href: "/year-end-tax-2026",
    cta: "신고 가이드 보기",
    deadline: { month: 5, day: 31 },
  },
  // 6월 자동차세 1기분 — 납부기간 6/16~30, 기한 6/30 (지방세법 제128조).
  // 이전의 "7/31 납부·deadline 7/31"은 재산세 1기 기한과 혼동한 오류였음
  // (2026-07-13 사실검증 감사에서 정정 — 잘못된 D-day가 납부 지연·가산세 유발 위험)
  {
    month: [6],
    title: "6월 자동차세 1기분 납부",
    subtitle: "6/16~30 납부 (기한 6/30). 배기량·차령별 정확한 금액 미리 확인",
    href: "/auto-tax-2026",
    cta: "자동차세 계산",
    deadline: { month: 6, day: 30 },
  },
  // 2026-07-06 감사: 7월 양대 실검색 이벤트로 교체 — TAI 지급 주간(7/8) 우선,
  // 이후 재산세 1기(7/16~31). 기존 "7월 건강보험료 정산" 항목은 사실관계가
  // 어긋나(직장가입자 연말정산 반영은 4월) 제거.
  {
    month: [7],
    days: { from: 1, to: 12 },
    title: "삼성전자 TAI 지급일 7/8",
    subtitle: "2026 상반기 사업부별 지급률 확정 — 내 세후 실수령액 바로 확인",
    href: "/calc/samsung-bonus",
    cta: "TAI 계산하기",
  },
  // TAI 지급(7/8) 후에도 명세서 확인·세금 검색 수요가 1~2주 이어짐 —
  // 재산세 납부 개시(7/16) 전날까지 후속 배너로 시즌 트래픽 연장
  {
    month: [7],
    days: { from: 13, to: 15 },
    title: "삼성전자 TAI 지급 완료 — 내 실수령 맞았나?",
    subtitle: "명세서와 비교 — 사업부별 지급률·세후 실수령 확인",
    href: "/calc/samsung-bonus",
    cta: "TAI 세후 확인",
  },
  {
    month: [7],
    title: "7월 재산세 1기 납부 (주택분 50%)",
    subtitle: "7/16~31 납부 — 공시가별 재산세·종부세 부담 미리 점검",
    href: "/property-holding-tax-2026",
    cta: "보유세 계산",
    deadline: { month: 7, day: 31 },
  },
  // 8차 점검에서 추가 — 9월 부동산 재산세 2차 + 자동차세 한 번 더
  {
    month: [8, 9],
    title: "9월 부동산 재산세 2차",
    subtitle: "주택분 50% + 토지분 9/16~30 납부. 공시가별 부담 미리 점검",
    href: "/property-holding-tax-2026",
    cta: "보유세 계산",
    deadline: { month: 9, day: 30 },
  },
  {
    month: [11, 12, 1],
    title: "12월 연말정산 + 성과급",
    subtitle: "13월의 월급 극대화하는 6대 점검 항목",
    href: "/year-end-tax-settlement-2026",
    cta: "절세 가이드 보기",
    deadline: { month: 12, day: 31 },
  },
  {
    month: [2, 3],
    title: "3월 신입 연봉 협상",
    subtitle: "직군별 평균 초봉과 ±10% 협상법",
    href: "/new-employee-2026",
    cta: "협상 가이드 보기",
  },
];

function getDaysLeft(deadline: { month: number; day: number }): number {
  const now = new Date();
  const year =
    deadline.month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  const target = new Date(year, deadline.month - 1, deadline.day, 23, 59, 59);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getCurrentSeasonal(): SeasonalContent | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return (
    SEASONAL_CALENDAR.find(
      (s) =>
        s.month.includes(month) &&
        (!s.days || (day >= s.days.from && day <= s.days.to))
    ) || null
  );
}

interface SeasonalBannerProps {
  className?: string;
}

export default function SeasonalBanner({ className = "" }: SeasonalBannerProps) {
  const seasonal = getCurrentSeasonal();
  if (!seasonal) return null;

  const daysLeft = seasonal.deadline ? getDaysLeft(seasonal.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 20;

  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <Link
        href={seasonal.href}
        className="group flex items-center justify-between gap-4 max-w-5xl mx-auto p-5 sm:p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold opacity-80 mb-1">시즌 핫 이슈</p>
            <p className="font-black text-base sm:text-lg mb-1 truncate">
              {seasonal.title}
            </p>
            <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
              {seasonal.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {daysLeft !== null && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                isUrgent
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white/20 text-white"
              }`}
            >
              <Clock className="w-3 h-3" />
              D-{daysLeft}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs font-bold opacity-90">
              {seasonal.cta}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </section>
  );
}
