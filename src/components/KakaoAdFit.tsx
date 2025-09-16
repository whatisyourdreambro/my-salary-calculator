// src/components/KakaoAdFit.tsx

"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentIns = insRef.current;
    if (!currentIns) return;

    // Intersection Observer를 사용하여 광고가 뷰포트에 들어왔을 때만 로드
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoaded) {
          try {
            if (window.AdFit) {
              window.AdFit.createIns(currentIns);
              setIsLoaded(true); // 한번 로드되면 다시 로드하지 않도록 상태 변경
            }
          } catch (e) {
            console.error("Kakao AdFit error:", e);
          }
          observer.unobserve(currentIns); // 관찰 중지
        }
      },
      { threshold: 0.1 } // 10% 보이면 실행
    );

    observer.observe(currentIns);

    return () => {
      if (currentIns) {
        observer.unobserve(currentIns);
      }
    };
  }, [isLoaded, unit]);

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
