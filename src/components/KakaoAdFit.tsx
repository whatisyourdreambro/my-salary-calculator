// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

type AdFitProps = {
  unit: string;
  width: string;
  height: string;
  disabled?: boolean;
};

declare global {
  interface Window {
    adfit?: {
      render: (el: HTMLElement) => void;
      destroy: (el: HTMLElement) => void;
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
    if (disabled || !window.adfit) return;

    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // adContainer 내부에 ins 태그를 동적으로 생성합니다.
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);
    adContainer.appendChild(ins);

    // 해당 광고 단위만 콕 집어서 렌더링합니다.
    window.adfit.render(adContainer);

    // 컴포넌트가 언마운트될 때 광고를 확실하게 제거합니다.
    return () => {
      if (adContainer && window.adfit?.destroy) {
        window.adfit.destroy(adContainer);
      }
    };
  }, [unit, width, height, disabled]);

  if (disabled) return null;

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
