// src/components/AdUnit.tsx

"use client";

import { useEffect, useState } from "react";

interface AdUnitProps {
    slotId: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical";
    responsive?: boolean;
    className?: string;
    sticky?: boolean;
    label?: string;
    layoutKey?: string;
}

const ADSENSE_ID = "ca-pub-5492837410";

export default function AdUnit({
    slotId,
    format = "auto",
    responsive = true,
    className = "",
    sticky = false,
    label,
    layoutKey,
}: AdUnitProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Prevent multiple initialization attempts
        if (typeof window !== "undefined" && !isLoaded) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setIsLoaded(true);
            } catch (err) {
                console.error("AdSense push error:", err);
            }
        }
    }, [isLoaded]);

    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    return (
        <div className={`ad-container relative overflow-hidden flex items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl transition-all ${className} ${sticky ? "lg:sticky lg:top-24" : ""}`} style={{ minHeight: "100px" }}>
            {/* Ad Space Placeholder for Debugging */}
            {isLocal && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                    <span>{label || "Ad Unit"}</span>
                    <span>Slot: {slotId}</span>
                </div>
            )}
            
            <ins
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
                data-ad-layout-key={layoutKey}
            />
        </div>
    );
}