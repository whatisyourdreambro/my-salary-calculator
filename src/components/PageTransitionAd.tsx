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

    if (navigationCount.current % VIEW_THRESHOLD === 0) {
      if (window.AdFit && typeof window.AdFit.showAd === "function") {
        window.AdFit.showAd("DAN-gtL0uD65wrODCXRh");
      }
      navigationCount.current = 0;
    }
  }, [pathname]);

  return null;
}
