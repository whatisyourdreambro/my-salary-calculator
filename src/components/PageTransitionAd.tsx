"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

    if (navigationCount.current >= VIEW_THRESHOLD) {
      // [수정] window.AdFit과 window.AdFit.showAd가 실제로 존재하는지 확인하는 로직을 추가했습니다.
      if (window.AdFit && typeof window.AdFit.showAd === "function") {
        try {
          window.AdFit.showAd("DAN-gtL0uD65wrODCXRh");
        } catch (e) {
          console.error("Failed to show AdFit page transition ad:", e);
        }
      }
      // 광고 호출 성공 여부와 관계없이 카운트는 초기화합니다.
      navigationCount.current = 0;
    }
  }, [pathname]);

  return null;
}
