"use client";

import { useEffect } from "react";

interface AdUnitProps {
    slotId: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical";
    responsive?: boolean;
    className?: string;
    sticky?: boolean;
    label?: string;
    layoutKey?: string;
}

export default function AdUnit({
    slotId,
    format = "auto",
    responsive = true,
    className = "",
    sticky = false,
    label,
    layoutKey,
}: AdUnitProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    // Development placeholder (visible only in dev mode or if explicitly requested)
    if (process.env.NODE_ENV === "development") {
        return (
            <div className={`bg-zinc-800/50 border border-zinc-700 border-dashed flex items-center justify-center text-zinc-500 text-xs font-mono p-4 ${className}`} style={{ minHeight: "100px", width: "100%" }}>
                [AdSense: {label || slotId}]<br />
                Format: {format}
            </div>
        );
    }

    // Manual Ad Units are currently disabled to allow Auto Ads to take full control.
    // User Request: "Delete the places written as advertisement... so that even auto ads can go in"
    return null;

    /*
    return (
        <div className={`ad-container ${className} ${sticky ? "sticky top-4" : ""}`}>
            {label && <div className="text-[10px] text-zinc-600 text-center mb-1">Advertisement</div>}
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
    */
}
