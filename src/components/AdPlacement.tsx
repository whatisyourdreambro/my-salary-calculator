/**
 * AdPlacement.tsx
 * 데이터 기반 최적 광고 배치 컴포넌트
 * 
 * 위치 전략:
 * 1. ResultAd   — 계산 결과값 바로 아래 (CTR 최고 구간, 시선 종착점)
 * 2. StickyAd   — 모바일 Sticky 하단 배너 (스크롤 내내 노출)
 * 3. InlineAd   — 콘텐츠 중간 (데스크탑 사이드바 / 모바일 콘텐츠 사이)
 */
"use client";

import { useEffect, useRef } from "react";

// ── 1. 결과값 바로 아래 광고 (최고 CTR) ────────────────────────
export function ResultAd() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (ref.current && ref.current.clientHeight === 0) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  return (
    <div
      ref={ref}
      className="result-ad-container"
      style={{
        width: "100%",
        minHeight: "90px",
        margin: "1.5rem 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client="ca-pub-2873403048341290"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ── 2. 모바일 고정 하단 배너 (Sticky Footer) ───────────────────
export function StickyBottomAd() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #DDE4EC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // 데스크탑에서는 숨김 - 모바일에서만
        padding: "4px 0",
      }}
      className="sticky-bottom-ad md:hidden"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width: "320px", height: "50px" }}
        data-ad-client="ca-pub-2873403048341290"
        data-ad-slot="auto"
        data-ad-format="auto"
      />
    </div>
  );
}

// ── 3. 인라인 콘텐츠 중간 광고 ────────────────────────────────
export function InlineAd({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (ref.current && ref.current.clientHeight === 0) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  return (
    <div
      ref={ref}
      className={`inline-ad-container ${className}`}
      style={{
        width: "100%",
        minHeight: "120px",
        margin: "2rem 0",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "120px" }}
        data-ad-client="ca-pub-2873403048341290"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
