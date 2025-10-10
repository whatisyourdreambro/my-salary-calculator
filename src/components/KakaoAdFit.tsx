// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean;
};

// Kakao AdFit 스크립트 타입을 위한 전역 선언
declare global {
  interface Window {
    adfit?: {
      render: (container: HTMLElement) => void;
      destroy: (container: HTMLElement) => void;
    };
  }
}

export default function KakaoAdFit({
  unit,
  width,
  height,
  disabled = false,
}: AdFitProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || typeof window.adfit === "undefined") {
      return;
    }

    const adContainer = adContainerRef.current;
    if (!adContainer) {
      return;
    }

    // 이전에 생성된 광고가 있다면 제거
    while (adContainer.firstChild) {
      adContainer.removeChild(adContainer.firstChild);
    }

    // 공식 가이드에 따라 ins 태그를 동적으로 생성
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);
    adContainer.appendChild(ins);

    // 해당 광고 단위만 렌더링하도록 수정
    window.adfit.render(adContainer);

    // 컴포넌트가 사라질 때 광고를 명확하게 제거 (메모리 누수 방지)
    return () => {
      if (adContainer && window.adfit?.destroy) {
        window.adfit.destroy(adContainer);
      }
    };
  }, [unit, width, height, disabled]);

  if (disabled) {
    return null;
  }

  // 광고를 담을 컨테이너 div
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: `${height}px`,
        padding: "20px 0",
      }}
    >
      <div ref={adContainerRef} />
    </div>
  );
}
