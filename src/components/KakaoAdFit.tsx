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

  useEffect(() => {
    // 광고가 비활성화 상태이거나, 렌더링 할 컨테이너가 없으면 아무것도 하지 않음
    if (disabled || !adContainerRef.current) {
      return;
    }

    // 이미 광고가 렌더링 되었다면 중복 실행 방지
    if (adContainerRef.current.querySelector("iframe")) {
      return;
    }

    // 컴포넌트가 다시 렌더링될 때 이전 광고 태그를 지워 중복을 방지합니다.
    while (adContainerRef.current.firstChild) {
      adContainerRef.current.removeChild(adContainerRef.current.firstChild);
    }

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);
    adContainerRef.current.appendChild(ins);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;

    adContainerRef.current.appendChild(script);
  }, [unit, width, height, disabled]);

  if (disabled) {
    return null;
  }

  // 광고 컨테이너 스타일링
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
