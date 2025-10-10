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
    if (disabled) return;

    // adfit 스크립트가 로드되었는지 확인
    if (typeof window.adfit === "undefined") {
      return;
    }

    const adContainer = adContainerRef.current;
    if (!adContainer) {
      return;
    }

    // 이전에 생성된 광고가 있다면 제거 (중복 렌더링 방지)
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

    // 해당 광고 슬롯만 콕 집어 렌더링
    // 중요: adfit.render()는 <ins> 태그 자체를 인자로 받거나,
    // <ins> 태그를 포함하는 부모 컨테이너를 인자로 받을 수 있습니다.
    // 여기서는 컨테이너를 전달하여 그 안의 광고를 그리도록 합니다.
    window.adfit.render(adContainer);

    // 컴포넌트가 언마운트될 때 광고를 제거하는 cleanup 함수
    return () => {
      if (adContainer && window.adfit?.destroy) {
        window.adfit.destroy(adContainer);
      }
    };
  }, [unit, width, height, disabled]); // 의존성 배열은 그대로 유지

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
