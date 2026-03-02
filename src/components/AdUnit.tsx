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

// 대표님의 실제 구글 애드센스 퍼블리셔 ID로 교체 완료
const ADSENSE_ID = "ca-pub-2873403048341290";

export default function AdUnit({
    slotId,
    format = "auto",
    responsive = true,
    className = "",
    sticky = false,
    label,
    layoutKey,
}: AdUnitProps) {
    const adRef = useRef<HTMLModElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const pushAd = () => {
            if (typeof window !== "undefined") {
                try {
                    // data-adsbygoogle-status 속성이 없을 때만 push하여 무한 루프 및 중복 호출 에러 완벽 차단
                    if (adRef.current && !adRef.current.hasAttribute("data-adsbygoogle-status")) {
                        // @ts-expect-error window 객체에 adsbygoogle 타입이 선언되어 있지 않음을 무시
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    }
                } catch (err) {
                    console.error("AdSense push error:", err);
                }
            }
        };

        // DOM 렌더링 직후 스크립트가 안정적으로 실행되도록 마이크로 지연 적용
        const timeoutId = setTimeout(pushAd, 100);
        return () => clearTimeout(timeoutId);
    }, [pathname, slotId]);

    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    return (
        <div className={`ad-container relative overflow-hidden flex items-center justify-center bg-transparent transition-all ${className} ${sticky ? "fixed bottom-0 left-0 w-full z-[9999] bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-1" : "my-4"}`} style={{ minHeight: sticky ? "60px" : "100px", minWidth: "100%" }}>
            {isLocal && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none z-10 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                    <span>{label || "Ad Unit"}</span>
                    <span>Slot: {slotId}</span>
                </div>
            )}

            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%"
                }}
                data-ad-client={ADSENSE_ID}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
                {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
            />
        </div>
    );
}