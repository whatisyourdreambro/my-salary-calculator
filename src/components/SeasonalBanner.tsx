// src/components/SeasonalBanner.tsx
//
// 현재 월을 기반으로 가장 관련성 높은 시즌 페이지를 자동 노출.
// deadline 있는 경우 D-Day 카운트다운으로 긴급감 부여.
// 캘린더 데이터·선택 로직은 src/lib/seasonalCalendar.ts (순수 함수, vitest 대상) —
// 이 파일은 마크업만 담당한다 (2026-09-05 L13a 분리, 마크업·위치 무변경).

import Link from "@/components/AppLink";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { getCurrentSeasonal, getDaysLeft } from "@/lib/seasonalCalendar";

interface SeasonalBannerProps {
  className?: string;
}

export default function SeasonalBanner({ className = "" }: SeasonalBannerProps) {
  const now = new Date();
  const seasonal = getCurrentSeasonal(now);
  if (!seasonal) return null;

  const daysLeft = seasonal.deadline ? getDaysLeft(seasonal.deadline, now) : null;
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
