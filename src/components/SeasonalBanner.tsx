// src/components/SeasonalBanner.tsx
//
// 현재 월을 기반으로 가장 관련성 높은 시즌 페이지를 자동 노출.
// deadline 있는 경우 D-Day 카운트다운으로 긴급감 부여.
// 캘린더 데이터·선택 로직은 src/lib/seasonalCalendar.ts (순수 함수, vitest 대상) —
// 이 파일은 마크업만 담당한다 (2026-09-05 L13a 분리, 마크업·위치 무변경).
//
// RL-20(10월 D4-③ 63d0be8a 의 홈 부분 재착륙, 2026-11-18): 종전에는 HomeClient 가 dynamic(ssr:false)로 불러
// 하이드레이션·청크 로드 뒤에야 배너가 나타나 아래 계산기·Display2Ad 를 배너 높이만큼 밀었다.
// 이제 서버 HTML·하이드레이션 첫 렌더에는 서버가 본 날짜(seed — 정적 프리렌더라 빌드 날짜, KST)로 고른 같은 항목을
// 같은 class·같은 내용의 '보이지 않는 상자'(링크 아님, aria-hidden, invisible)로 그려 자리만 잡고,
// 마운트 뒤에는 지금 시각으로 종전과 같은 실제 배너를 그린다. 마운트 뒤 최종 DOM·class 는 종전과 같다.
// seed 가 없으면(다른 호출부) 종전처럼 하이드레이션 전에는 아무것도 그리지 않는다.
// ★ 빌드 날짜와 방문 날짜의 배너 내용(항목·부제·D-day 배지 유무와 자릿수)이 다르면 마운트 때 두 상자의 높이 차이만큼은
//   여전히 움직일 수 있다(항목이 바뀌는 날 1/15·2/1·2/16·4/1·6/1·7/1·7/13·7/16·7/20·7/29·8/1·8/16·9/1·9/27·10/1·11/1,
//   배지가 사라지는 1/1·9/26, 두 자리 -> 한 자리 D-9 가 되는 날). 최종 위치는 어느 경우든 종전과 같다.

"use client";

import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { getCurrentSeasonal, getDaysLeft, seasonalSeedDate, type SeasonalSeed } from "@/lib/seasonalCalendar";
import { OPI_2026_ANNOUNCEMENT } from "@/data/opiAnnouncement";

interface SeasonalBannerProps {
  className?: string;
  /** 서버가 본 오늘(KST) — 하이드레이션 전 자리 예약용. 없으면 하이드레이션 전엔 그리지 않는다. */
  seed?: SeasonalSeed | null;
}

/** 실제 배너의 링크와 자리 상자의 div 가 같은 class 를 쓰도록 한 곳에 둔다(종전 Link className 그대로). */
export const SEASONAL_CARD_CLASS = "group flex items-center justify-between gap-4 max-w-5xl mx-auto p-5 sm:p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors";

export default function SeasonalBanner({ className = "", seed = null }: SeasonalBannerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return seed ? <SeasonalBannerView className={className} now={seasonalSeedDate(seed)} reserve /> : null;
  return <SeasonalBannerView className={className} now={new Date()} />;
}

/** 실제 배너(reserve=false)와 자리 예약(reserve=true)이 같은 마크업을 쓴다 — 바깥 링크만 div 로, 섹션에 invisible·aria-hidden. */
export function SeasonalBannerView({ className = "", now, reserve = false }: { className?: string; now: Date; reserve?: boolean }) {
  // 1월 OPI 슬롯(1/20~31)은 발표 확인(announced=true) 뒤에만 열린다 — 그 전에는 카드공제로 폴스루.
  const seasonal = getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced });
  if (!seasonal) return null;

  const daysLeft = seasonal.deadline ? getDaysLeft(seasonal.deadline, now) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 20;

  const body = (
    <>
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold"
              // A dark opaque badge also respects the banner's inherited white text.
              // Pulsing opacity weakened contrast at the middle of the animation.
              style={{ backgroundColor: isUrgent ? "#991B1B" : "#0A1829", color: "#FFFFFF" }}
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
    </>
  );

  if (reserve) {
    return (
      <section aria-hidden="true" data-cls-reserve="seasonal" className={`px-4 sm:px-6 lg:px-8 ${className} invisible`}>
        <div className={SEASONAL_CARD_CLASS}>{body}</div>
      </section>
    );
  }

  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <Link
        href={seasonal.href}
        className={SEASONAL_CARD_CLASS}
      >
        {body}
      </Link>
    </section>
  );
}
