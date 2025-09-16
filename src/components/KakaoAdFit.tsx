"use client";

import { useEffect, useRef } from "react";

// [핵심 수정] 이곳에 있던 'declare global' 블록을 완전히 삭제합니다.
// 타입 정의는 root layout에서 관리합니다.

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

    const tryLoadAd = () => {
      // [수정] 안정성을 위해 방어 코드를 추가합니다.
      if (window.AdFit && typeof window.AdFit.createIns === "function") {
        try {
          window.AdFit.createIns(currentIns);
          initializedRef.current = true;
        } catch (e) {
          console.error("Kakao AdFit create error:", e);
        }
      }
    };

    tryLoadAd();
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
