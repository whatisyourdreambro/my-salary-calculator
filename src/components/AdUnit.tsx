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

    return (
        <div className={`ad-container relative overflow-hidden ${className} ${sticky ? "sticky top-24" : ""}`} style={{ minHeight: "100px" }}>
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
