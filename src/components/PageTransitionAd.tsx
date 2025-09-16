"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Kakao AdFit 전역 타입 선언 (수정)
declare global {
  interface Window {
    adfit?: {
      showAd: (unitId: string) => void;
    };
  }
}

// 몇 번 페이지를 이동했을 때 광고를 띄울지 설정합니다.
const VIEW_THRESHOLD = 3;

export default function PageTransitionAd() {
  const pathname = usePathname();
  const navigationCount = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    navigationCount.current += 1;

    if (navigationCount.current % VIEW_THRESHOLD === 0) {
      if (window.adfit && typeof window.adfit.showAd === "function") {
        window.adfit.showAd("DAN-gtL0uD65wrODCXRh");
      }
      navigationCount.current = 0;
    }
  }, [pathname]);

  return null;
}
