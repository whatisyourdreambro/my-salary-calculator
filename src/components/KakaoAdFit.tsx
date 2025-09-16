"use client";

import { useEffect, useRef } from "react";

// AdFit 전역 타입 선언
declare global {
  interface Window {
    AdFit?: {
      createIns: (ins: HTMLModElement) => void;
      destroyIns: (ins: HTMLModElement) => void;
    };
  }
}

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

    // window.AdFit이 로드될 때까지 짧은 지연을 두고 재시도할 수 있습니다.
    const tryLoadAd = () => {
      if (window.AdFit) {
        try {
          window.AdFit.createIns(currentIns);
          initializedRef.current = true; // 광고가 한 번 생성되었음을 표시
        } catch (e) {
          console.error("Kakao AdFit create error:", e);
        }
      }
    };

    // 스크립트가 로드된 후이므로 바로 실행
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
