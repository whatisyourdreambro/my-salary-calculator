"use client";

import { useEffect, useRef } from "react";

//
// [정리] layout.tsx에 표준 타입이 정의되었으므로, 이곳의 declare global 블록은 삭제합니다.
//

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
      // AdFit 객체와 createIns 함수가 존재하는지 확인하여 안정성을 높입니다.
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
