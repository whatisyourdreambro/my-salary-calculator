// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

// window.adfit 타입을 전역으로 확장합니다.
declare global {
  interface Window {
    adfit?: {
      render: (el: HTMLElement) => void;
      destroy: (el: HTMLElement) => void;
    };
  }
}

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean;
};

export default function KakaoAdFit({
  unit,
  width,
  height,
  disabled = false,
}: AdFitProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // [수정] window.adfit 객체가 로드되었는지 확인하는 방어 코드 추가
    if (typeof window.adfit?.render !== "function") {
      console.warn("AdFit 스크립트가 아직 로드되지 않았습니다.");
      return;
    }

    // 이전에 생성된 광고가 있다면 모두 제거 (중복 렌더링 방지)
    while (adContainer.firstChild) {
      adContainer.removeChild(adContainer.firstChild);
    }

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";

    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);

    adContainer.appendChild(ins);

    // [수정] window.adfit.render를 호출하기 전에 한 번 더 확인합니다.
    try {
      window.adfit.render(adContainer);
    } catch (e) {
      console.error("Kakao AdFit 렌더링에 실패했습니다.", e);
    }

    return () => {
      // [수정] destroy 함수 존재 여부도 확인하여 안정성 강화
      if (adContainer && typeof window.adfit?.destroy === "function") {
        try {
          window.adfit.destroy(adContainer);
        } catch (e) {
          console.error("Kakao AdFit 리소스 정리에 실패했습니다.", e);
        }
      }
    };
  }, [unit, width, height, disabled]);

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
        minHeight: `${height}px`,
        padding: "20px 0",
      }}
    >
      <div ref={adContainerRef} />
    </div>
  );
}
