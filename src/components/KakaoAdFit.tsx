// src/components/KakaoAdFit.tsx

"use client";

import { useEffect, useRef } from "react";

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  className?: string;
};

export default function KakaoAdFit({
  unit,
  width,
  height,
  className = "",
}: AdFitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const currentIns = insRef.current;
    if (!currentIns || initializedRef.current) {
      return;
    }

    // [수정] AdFit 스크립트가 로드될 때까지 대기하는 로직 추가
    const tryLoadAd = () => {
      if (window.AdFit && typeof window.AdFit.createIns === "function") {
        try {
          window.AdFit.createIns(currentIns);
          initializedRef.current = true;
          return true; // 성공
        } catch (e) {
          console.error("Kakao AdFit create error:", e);
          return true; // 오류가 발생했더라도 재시도 중단
        }
      }
      return false; // AdFit 스크립트가 아직 로드되지 않음
    };

    // 즉시 시도
    if (tryLoadAd()) {
      return;
    }

    // 스크립트가 로드될 때까지 100ms 간격으로 최대 10초간 재시도
    let attempt = 0;
    const intervalId = setInterval(() => {
      attempt++;
      if (tryLoadAd() || attempt >= 100) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className={`kakao-ad-container ${className}`}
      style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
    >
      <ins
        ref={insRef}
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      ></ins>
    </div>
  );
}
