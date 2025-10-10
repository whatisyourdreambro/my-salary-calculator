// src/components/AdManager.tsx
"use client";

import { useState, useEffect } from "react";
import KakaoAdFit from "./KakaoAdFit";

// 광고 위치 타입을 정의합니다. (예: 'header', 'footer', 'sidebar')
type AdPosition =
  | "header-banner"
  | "footer-banner"
  | "in-content"
  | "sidebar-left"
  | "sidebar-right";

type AdManagerProps = {
  position: AdPosition;
};

const AdManager = ({ position }: AdManagerProps) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 화면 너비가 768px 이상이면 데스크톱 환경으로 판단합니다.
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize(); // 컴포넌트가 처음 로드될 때 실행
    window.addEventListener("resize", handleResize); // 화면 크기가 바뀔 때마다 실행

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1달 뒤 AdSense로 돌아갈 때 이 값을 true로 바꾸면 모든 카카오 광고가 표시되지 않습니다.
  const adDisabled = false;

  // position 값에 따라 다른 광고 유닛을 렌더링합니다.
  switch (position) {
    case "header-banner":
      return isDesktop ? (
        // 데스크톱 상단 배너 (728x90)
        <KakaoAdFit
          unit="DAN-7DJN8QMp6O5Kayn7"
          width="728"
          height="90"
          disabled={adDisabled}
        />
      ) : (
        // 모바일 상단 배너 (320x100)
        <KakaoAdFit
          unit="DAN-WgV2d248sf3mJoB2"
          width="320"
          height="100"
          disabled={adDisabled}
        />
      );

    case "footer-banner":
      return isDesktop ? (
        // 데스크톱 하단 배너 (728x90) - 상단과 동일한 유닛 사용 또는 다른 유닛 사용 가능
        <KakaoAdFit
          unit="DAN-7DJN8QMp6O5Kayn7"
          width="728"
          height="90"
          disabled={adDisabled}
        />
      ) : (
        // 모바일 하단 배너 (320x50)
        <KakaoAdFit
          unit="DAN-lpJFw6yqHhzOXIfV"
          width="320"
          height="50"
          disabled={adDisabled}
        />
      );

    case "in-content":
      // 콘텐츠 중간 삽입용 광고 (300x250)
      return (
        <KakaoAdFit
          unit="DAN-4eRqZLQIGjrNcXj6"
          width="300"
          height="250"
          disabled={adDisabled}
        />
      );

    case "sidebar-left":
      // 사이드바용 광고 (160x600)
      return (
        <KakaoAdFit
          unit="DAN-O4kzbtdd9NleD4P6"
          width="160"
          height="600"
          disabled={adDisabled}
        />
      );

    case "sidebar-right":
      // 오른쪽 사이드바용 다른 광고 (160x600)
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
