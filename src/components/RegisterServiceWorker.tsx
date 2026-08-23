"use client";

// 서비스워커 등록 — public/sw.js (PWA 설치 요건).
// Chrome은 fetch 핸들러 있는 SW가 등록돼야 beforeinstallprompt를 발화하므로,
// 이 컴포넌트가 InstallPwaBanner 를 실제로 작동시키는 전제 조건이다.
// 로드 완료 후 idle 타이밍에 등록 — 초기 렌더·LCP에 영향 없음.

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 등록 실패는 치명적이지 않음 — 조용히 무시 (다음 방문에 재시도)
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
