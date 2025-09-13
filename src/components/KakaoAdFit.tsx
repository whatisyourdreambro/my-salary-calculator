"use client";

import { useEffect } from "react";

// Kakao AdFit SDK 타입을 window 객체에 추가하여 타입스크립트 오류를 방지합니다.
declare global {
  interface Window {
    AdFit?: {
      createIns: (ins: HTMLModElement) => void;
    };
  }
}

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  className?: string; // 추가적인 스타일링을 위한 className prop
};

export default function KakaoAdFit({
  unit,
  width,
  height,
  className = "",
}: AdFitProps) {
  useEffect(() => {
    // AdFit 스크립트가 로드된 후 광고를 렌더링하도록 처리합니다.
    try {
      const ins = document.querySelector<HTMLModElement>(
        `ins[data-ad-unit="${unit}"]`
      );
      if (window.AdFit && ins) {
        window.AdFit.createIns(ins);
      }
    } catch (e) {
      console.error("Kakao AdFit error:", e);
    }
  }, [unit]);

  return (
    <div className={`kakao-ad-container ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      ></ins>
    </div>
  );
}
