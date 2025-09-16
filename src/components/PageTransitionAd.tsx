"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

//
// [정리] layout.tsx에 표준 타입이 정의되었으므로, 이곳의 declare global 블록은 삭제합니다.
//

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
      // AdFit 객체와 showAd 함수가 존재하는지 확인하여 안정성을 높입니다.
      if (window.AdFit && typeof window.AdFit.showAd === "function") {
        window.AdFit.showAd("DAN-gtL0uD65wrODCXRh");
      }
      navigationCount.current = 0;
    }
  }, [pathname]);

  return null;
}
