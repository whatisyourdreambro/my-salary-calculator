"use client";

import { useEffect, useRef } from "react"; // useState를 여기서 삭제했습니다.
import { usePathname } from "next/navigation";

// Kakao AdFit 전역 타입 선언 (중복 선언 방지)
declare global {
  interface Window {
    adfit?: {
      showAd: (unitId: string) => void;
    };
  }
}

// 몇 번 페이지를 이동했을 때 광고를 띄울지 설정합니다. (3 = 3번 이동 시 1번)
const VIEW_THRESHOLD = 3;

export default function PageTransitionAd() {
  const pathname = usePathname();
  const navigationCount = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // 첫 페이지 로드 시에는 광고를 띄우지 않습니다.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // 페이지 이동 횟수를 1 증가시킵니다.
    navigationCount.current += 1;

    // 설정한 횟수에 도달했는지 확인합니다.
    if (navigationCount.current % VIEW_THRESHOLD === 0) {
      // Kakao AdFit 전면 광고 API를 호출합니다.
      if (window.adfit) {
        // [적용 완료] 전달해주신 광고 단위 코드를 적용했습니다.
        window.adfit.showAd("DAN-gtL0uD65wrODCXRh");
      }

      // 카운트를 초기화하여 다시 3번을 세도록 합니다.
      navigationCount.current = 0;
    }
  }, [pathname]); // pathname이 바뀔 때마다 이 useEffect가 실행됩니다.

  // 이 컴포넌트는 화면에 아무것도 그리지 않고, 로직만 처리합니다.
  return null;
}
