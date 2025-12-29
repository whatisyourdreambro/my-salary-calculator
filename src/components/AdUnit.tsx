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
    minHeight?: string | number;
}

export default function AdUnit({
    slotId,
    format = "auto",
    responsive = true,
    className = "",
    sticky = false,
    label,
    layoutKey,
    minHeight = "100px", // Reverted default to 100px to prevent large empty spaces (white boxes) on sidebars
}: AdUnitProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            // Simulate load delay for smoother transition (optional, or rely on ad load event if possible)
            const timer = setTimeout(() => setIsLoaded(true), 1000);
            return () => clearTimeout(timer);
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className={`ad-container relative overflow-hidden rounded-xl ${className} ${sticky ? "sticky top-24" : ""}`} style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}>
            {/* Premium Placeholder / Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center z-10">
                    <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-gold" />
                    <span className="text-[10px] font-medium tracking-widest text-zinc-600 uppercase z-20">
                        Advertisement
                    </span>
                </div>
            )}

            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-2873403048341290"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
                data-ad-layout-key={layoutKey}
            />
        </div>
    );
}
