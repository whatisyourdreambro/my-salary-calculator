"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// [수정] layout.tsx와 타입을 일치시키고 showAd를 추가합니다.
declare global {
  interface Window {
    AdFit?: {
      createIns: (ins: HTMLModElement) => void;
      destroyIns: (ins: HTMLModElement) => void;
      showAd?: (unitId: string) => void;
    };
  }
}

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
      // [핵심 수정] adfit -> AdFit으로 오타 수정 및 안정성 강화를 위한 방어 코드 추가
      if (window.AdFit && typeof window.AdFit.showAd === "function") {
        window.AdFit.showAd("DAN-gtL0uD65wrODCXRh");
      }
      navigationCount.current = 0;
    }
  }, [pathname]);

  return null;
}
