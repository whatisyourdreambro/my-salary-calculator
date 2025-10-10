// src/components/AdManager.tsx
"use client";

import { useState, useEffect } from "react";
import KakaoAdFit from "./KakaoAdFit"; // 이전에 만든 KakaoAdFit 컴포넌트

const AdManager = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 화면 너비가 768px 이상이면 데스크톱으로 간주합니다.
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize(); // 페이지 로드 시 한 번 실행
    window.addEventListener("resize", handleResize); // 화면 크기가 변경될 때마다 실행
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1달 뒤 AdSense로 돌아갈 때 이 값을 true로 바꾸면 모든 카카오 광고가 사라집니다.
  const adDisabled = false;

  if (isDesktop) {
    // 데스크톱용 광고 (728x90)
    return (
      <KakaoAdFit
        unit="DAN-7DJN8QMp6O5Kayn7"
        width="728"
        height="90"
        disabled={adDisabled}
      />
    );
  } else {
    // 모바일용 광고 (320x50)
    return (
      <KakaoAdFit
        unit="DAN-no5HCWDFKDsohy4c"
        width="320"
        height="50"
        disabled={adDisabled}
      />
    );
  }
};

export default AdManager;
