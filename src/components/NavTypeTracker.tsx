"use client";

// 소프트 내비게이션 계측(측정 전용, 2026-09-25) — 루트 layout 에 무렌더로 1개. 상세는 src/lib/navType.ts.
//
// ★ layout 에서 <Script id="ga4-init"> 보다 앞 형제로 둘 것. 같은 커밋의 effect 는 트리 순서로 돌기 때문에
//   여기서 넣는 gtag('set', { nav_type: 'landing' }) 가 ga4-init 의 config(첫 page_view)보다 먼저 큐에 들어간다.
//   순서가 뒤집히면 첫 page_view 의 nav_type 이 (not set) 이 된다(navType.test.ts 가 순서를 고정).
// DOM 을 만들지 않으므로 광고 위치·자동광고 CSS 경로와 무관하다.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { installNavTypeTracking, markSoftNavigation, type NavTypeWindow } from "@/lib/navType";

export default function NavTypeTracker() {
  const pathname = usePathname();
  const firstPathname = useRef<string | null>(null);

  useEffect(() => {
    installNavTypeTracking(window as unknown as NavTypeWindow);
  }, []);

  // 폴백: history 래핑이 없던 경우에도 경로가 바뀌면 광고 이벤트의 nav_type 은 soft 가 된다.
  useEffect(() => {
    if (firstPathname.current === null) {
      firstPathname.current = pathname;
      return;
    }
    if (pathname !== firstPathname.current) markSoftNavigation();
  }, [pathname]);

  return null;
}
