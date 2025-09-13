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
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    // adRef.current가 비어있으면 광고 스크립트를 새로 로드합니다.
    if (adRef.current && adRef.current.innerHTML.trim() === "") {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [unit, disabled]);

  if (disabled) return null;

  return (
    <div ref={adRef} className="contents">
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unit}
        data-ad-width={width}
        data-ad-height={height}
      ></ins>
    </div>
  );
}
