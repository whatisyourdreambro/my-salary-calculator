// src/components/AdManager.tsx
"use client";

import { useState, useEffect } from "react";
import KakaoAdFit from "./KakaoAdFit";

// 광고 위치 타입을 정의합니다.
type AdPosition =
  | "header-banner"
  | "footer-banner"
  | "in-content"
  | "sidebar-left"
  | "sidebar-right"
  | "interstitial" // '008화면 전환' 광고를 위한 새 위치
  | "footer-banner-mobile-alt"; // '007' 광고를 위한 새 위치

type AdManagerProps = {
  position: AdPosition;
};

const AdManager = ({ position }: AdManagerProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adDisabled = false;

  // position 값에 따라 다른 광고 유닛을 렌더링합니다.
  switch (position) {
    case "header-banner":
      return isDesktop ? (
        // 데스크톱 상단 배너 (728x90) - 002번
        <KakaoAdFit
          unit="DAN-7DJN8QMp6O5Kayn7"
          width="728"
          height="90"
          disabled={adDisabled}
        />
      ) : (
        // 모바일 상단 배너 (320x100) - 006번
        <KakaoAdFit
          unit="DAN-WgV2d248sf3mJoB2"
          width="320"
          height="100"
          disabled={adDisabled}
        />
      );

    case "footer-banner":
      return isDesktop ? (
        // 데스크톱 하단 배너 (728x90) - 002번 (재사용)
        <KakaoAdFit
          unit="DAN-7DJN8QMp6O5Kayn7"
          width="728"
          height="90"
          disabled={adDisabled}
        />
      ) : (
        // 모바일 하단 배너 (320x50) - 005번
        <KakaoAdFit
          unit="DAN-lpJFw6yqHhzOXIfV"
          width="320"
          height="50"
          disabled={adDisabled}
        />
      );

    // [추가] 007번 광고단위 (320x50)
    case "footer-banner-mobile-alt":
      return (
        <KakaoAdFit
          unit="DAN-no5HCWDFKDsohy4c"
          width="320"
          height="50"
          disabled={adDisabled}
        />
      );

    case "in-content":
      // 콘텐츠 중간 삽입용 광고 (300x250) - 001번
      return (
        <KakaoAdFit
          unit="DAN-4eRqZLQIGjrNcXj6"
          width="300"
          height="250"
          disabled={adDisabled}
        />
      );

    // [추가] 008번 화면 전환 광고 (300x250)
    case "interstitial":
      return (
        <KakaoAdFit
          unit="DAN-gtL0uD65wrODCXRh"
          width="300"
          height="250"
          disabled={adDisabled}
        />
      );

    case "sidebar-left":
      // 왼쪽 사이드바용 광고 (160x600) - 004번
      return (
        <KakaoAdFit
          unit="DAN-O4kzbtdd9NleD4P6"
          width="160"
          height="600"
          disabled={adDisabled}
        />
      );

    case "sidebar-right":
      // 오른쪽 사이드바용 광고 (160x600) - 003번
      return (
        <KakaoAdFit
          unit="DAN-HVBNRsdPlneE3Uxn"
          width="160"
          height="600"
          disabled={adDisabled}
        />
      );

    default:
      return null;
  }
};

export default AdManager;
