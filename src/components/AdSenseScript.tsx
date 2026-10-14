"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { canRequestLiveAds } from "@/lib/liveAds";

export default function AdSenseScript() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(canRequestLiveAds());
  }, []);

  if (!enabled) return null;
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
