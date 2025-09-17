"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// 광고가 표시될 페이지 이동 횟수
const VIEW_THRESHOLD = 3;
// 전면 광고 단위 ID
const AD_UNIT_ID = "DAN-gtL0uD65wrODCXRh";

export default function PageTransitionAd() {
  const pathname = usePathname();
  const navigationCount = useRef(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // 사이트 첫 로드 시에는 광고를 호출하지 않음
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // 페이지 이동 횟수 증가
    navigationCount.current += 1;

    // 설정된 횟수만큼 페이지를 이동했는지 확인
    if (navigationCount.current >= VIEW_THRESHOLD) {
      // 광고 호출 함수 실행
      const showAdWithRetry = () => {
        let attempts = 0;
        const maxAttempts = 10; // 최대 10번 (1초) 동안 시도

        const tryShowAd = () => {
          // AdFit 스크립트가 로드되었고, showAd 함수가 사용 가능한지 확인
          if (window.AdFit && typeof window.AdFit.showAd === "function") {
            try {
              window.AdFit.showAd(AD_UNIT_ID);
              // 성공적으로 호출되면 카운트 초기화
              navigationCount.current = 0;
            } catch (e) {
              console.error("AdFit showAd execution error:", e);
            }
          } else if (attempts < maxAttempts) {
            // 아직 로드되지 않았다면 100ms 후에 다시 시도
            attempts++;
            setTimeout(tryShowAd, 100);
          } else {
            // 최대 시도 횟수를 초과하면 로그를 남기고 종료
            console.error("AdFit script did not load in time.");
          }
        };

        tryShowAd();
      };

      showAdWithRetry();
    }
  }, [pathname]);

  return null;
}
