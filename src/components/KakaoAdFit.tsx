// src/components/KakaoAdFit.tsx
"use client";

import { useEffect, useRef } from "react";

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

  // unit, width, height가 변경될 때마다 광고를 다시 렌더링합니다.
  useEffect(() => {
    if (disabled) {
      return;
    }

    const adContainer = adContainerRef.current;
    if (!adContainer) {
      return;
    }

    // ❗️ Kakao AdFit 스크립트가 로드되었는지 확인하는 것이 매우 중요합니다.
    // 스크립트 로드 전에 이 코드가 실행되면 오류가 발생합니다.
    if (!window.adfit) {
      return;
    }

    // 이전에 생성된 광고가 있다면 모두 제거 (중복 렌더링 방지)
    while (adContainer.firstChild) {
      adContainer.removeChild(adContainer.firstChild);
    }

    // 공식 가이드에 따라 <ins> 태그를 동적으로 생성합니다.
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";

    // data-* 속성들을 설정합니다.
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", width);
    ins.setAttribute("data-ad-height", height);

    adContainer.appendChild(ins);

    // 생성된 <ins> 태그를 기반으로 광고를 렌더링합니다.
    window.adfit.render(adContainer);

    // 컴포넌트가 사라질 때(unmount) 광고 리소스를 정리합니다.
    // 이는 메모리 누수를 방지하고, 페이지 이동 시 발생할 수 있는 오류를 막습니다.
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
