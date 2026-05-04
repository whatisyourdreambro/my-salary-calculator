// src/components/HeroBadge.tsx
//
// 메인 hero의 배지 텍스트를 현재 월에 따라 자동 변경.
// 시즌 핵심 키워드 노출로 즉시 관련 페이지 진입 유도.

"use client";

import { useEffect, useState } from "react";

interface SeasonalCopy {
 month: number[];
 badge: string;
 emoji: string;
}

const SEASONAL_COPY: SeasonalCopy[] = [
 { month: [4, 5], badge: "5월 종합소득세 신고 시즌", emoji: "📋" },
 { month: [6, 7], badge: "7월 건강보험료 정산 시즌", emoji: "🏥" },
 { month: [11, 12, 1], badge: "13월의 월급 — 연말정산 시즌", emoji: "🎁" },
 { month: [2, 3], badge: "3월 신입 연봉 협상 시즌", emoji: "🚀" },
];

const DEFAULT_COPY = { badge: "2026년 세법 완벽 반영", emoji: "" };

export default function HeroBadge() {
 const [copy, setCopy] = useState<{ badge: string; emoji: string }>(DEFAULT_COPY);

 useEffect(() => {
 const month = new Date().getMonth() + 1;
 const seasonal = SEASONAL_COPY.find((s) => s.month.includes(month));
 if (seasonal) {
 setCopy({ badge: seasonal.badge, emoji: seasonal.emoji });
 }
 }, []);

 return (
 <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
 {copy.emoji && <span>{copy.emoji}</span>}
 {copy.badge}
 </span>
 );
}
