// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean; // 광고를 쉽게 켜고 끌 수 있는 옵션
};

export default function KakaoAdFit({
  unit,
  width,
  height,
  disabled = false,
}: AdFitProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false); // 중복 실행을 막기 위한 플래그

  useEffect(() => {
    // 1. useEffect가 실행되는 시점의 ref.current 값을 변수에 저장합니다.
    const currentAdContainer = adContainerRef.current;

    if (disabled || !currentAdContainer || initialized.current) {
      return;
    }

    if (window.adfit) {
      const ins = document.createElement("ins");
      ins.className = "kakao_ad_area";
      ins.style.display = "none";

      ins.setAttribute("data-ad-unit", unit);
      ins.setAttribute("data-ad-width", width);
      ins.setAttribute("data-ad-height", height);

      currentAdContainer.appendChild(ins);
      window.adfit.render(currentAdContainer);
      initialized.current = true;
    } else {
      console.error("Kakao AdFit 스크립트가 로드되지 않았습니다.");
    }

    // 2. 정리 함수에서는 저장해둔 변수를 사용합니다.
    return () => {
      if (currentAdContainer) {
        while (currentAdContainer.firstChild) {
          currentAdContainer.removeChild(currentAdContainer.firstChild);
        }
      }
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, width, height, disabled]); // 의존성 배열은 그대로 둡니다.

  if (disabled) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "20px 0",
      }}
    >
      <div
        ref={adContainerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}

// Kakao AdFit 스크립트 타입을 위한 전역 선언
declare global {
  interface Window {
    adfit?: {
      render: (element: HTMLElement | null) => void;
    };
  }
}
