// src/components/AdUnit.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface AdUnitProps {
 slotId: string;
 format?: "auto" | "fluid" | "rectangle" | "vertical";
 responsive?: boolean;
 className?: string;
 sticky?: boolean;
 label?: string;
 layoutKey?: string;
}

const ADSENSE_ID = "ca-pub-2873403048341290";

export default function AdUnit({
 slotId,
 format = "auto",
 responsive = true,
 className = "",
 sticky = false,
 layoutKey,
}: AdUnitProps) {
 const adRef = useRef<HTMLModElement>(null);
 const pathname = usePathname();

 useEffect(() => {
 const pushAd = () => {
 if (typeof window !== "undefined") {
 try {
 if (adRef.current && !adRef.current.hasAttribute("data-adsbygoogle-status")) {
 // @ts-expect-error adsbygoogle type
 (window.adsbygoogle = window.adsbygoogle || []).push({});
 }
 } catch (err) {
 console.error("AdSense push error:", err);
 }
 }
 };
 const timeoutId = setTimeout(pushAd, 100);
 return () => clearTimeout(timeoutId);
 }, [pathname, slotId]);

 const isLocal = typeof window !== "undefined" &&
 (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

 // 로컬 개발 환경: 광고 자리만 확보, 시각적 박스 없음
 if (isLocal) return <div style={{ minHeight: "90px" }} />;

 return (
 <div
 className={`ad-container overflow-hidden ${sticky
 ? "fixed bottom-0 left-0 w-full z-[9999] bg-white/95 backdrop-blur-sm border-t border-canvas shadow-lg py-1"
 : "my-2"
 } ${className}`}
 style={{ minHeight: sticky ? "60px" : "90px" }}
 >
 <ins
 ref={adRef}
 className="adsbygoogle"
 style={{ display: "block", width: "100%", height: "100%" }}
 data-ad-client={ADSENSE_ID}
 data-ad-slot={slotId}
 data-ad-format={format}
 data-full-width-responsive={responsive ? "true" : "false"}
 {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
 />
 </div>
 );
}