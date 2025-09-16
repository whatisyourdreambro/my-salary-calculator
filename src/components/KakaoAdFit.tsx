"use client";

import { useEffect, useRef, useState } from "react";

// Kakao AdFit SDK 스크립트가 로드되었는지 전역으로 추적하는 변수
let isSdkLoaded = false;

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
  const [isAdCreated, setIsAdCreated] = useState(false);

  const loadAdFitSdk = () => {
    if (isSdkLoaded) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
      script.async = true;
      script.onload = () => {
        isSdkLoaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    const currentIns = insRef.current;
    if (!currentIns || isAdCreated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAdFitSdk().then(() => {
            if (window.AdFit && !isAdCreated) {
              try {
                window.AdFit.createIns(currentIns);
                setIsAdCreated(true);
              } catch (e) {
                console.error("Kakao AdFit create error:", e);
              }
            }
          });
          observer.unobserve(currentIns);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentIns);

    return () => {
      if (currentIns) {
        observer.unobserve(currentIns);
      }
    };
  }, [isAdCreated]);

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
