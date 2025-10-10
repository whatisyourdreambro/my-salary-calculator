// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean; // 광고를 쉽게 켜고 끌 수 있는 옵션
};

// Kakao AdFit 스크립트 타입을 위한 전역 선언
declare global {
  interface Window {
    adfit?: {
      render: () => void;
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
    // disabled 상태이거나 adfit 스크립트가 없으면 아무것도 하지 않음
    if (disabled || !window.adfit) {
      return;
    }

    // adContainerRef.current를 변수에 할당하여 클린업 함수에서 사용
    const adContainer = adContainerRef.current;

    // adContainer가 없으면 아무것도 하지 않음
    if (!adContainer) {
      return;
    }

    // window.adfit.render()를 호출하여 페이지 내의 모든 광고를 렌더링합니다.
    window.adfit.render();

    // 컴포넌트가 언마운트될 때 광고를 정리하여 메모리 누수 및 중복을 방지합니다.
    return () => {
      if (adContainer && window.adfit && window.adfit.destroy) {
        // adfit.destroy를 사용하여 특정 컨테이너의 광고만 깔끔하게 제거합니다.
        window.adfit.destroy(adContainer);
      }
    };
  }, [unit, width, height, disabled]); // 광고 정보가 변경될 때마다 effect를 다시 실행

  if (disabled) {
    return null;
  }

  // JSX에서 직접 ins 태그를 렌더링하여 안정성을 높입니다.
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
      <div ref={adContainerRef}>
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit={unit}
          data-ad-width={width}
          data-ad-height={height}
        ></ins>
      </div>
    </div>
  );
}
