"use client";

import { useEffect, useState } from "react";

interface AdUnitProps {
    slotId: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical";
    responsive?: boolean;
    className?: string;
    sticky?: boolean;
    label?: string; // For debugging or internal labeling
}

export default function AdUnit({
    slotId,
    format = "auto",
    responsive = true,
    className = "",
    sticky = false,
    label,
}: AdUnitProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setIsLoaded(true);
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div
            className={`relative w-full overflow-hidden my-8 ${sticky ? "sticky top-24 z-10" : ""
                } ${className}`}
        >
            {/* Label for debugging/admin view (optional) */}
            {process.env.NODE_ENV === "development" && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 z-20">
                    Ad: {label || slotId}
                </div>
            )}

            {/* Skeleton UI for CLS prevention */}
            {!isLoaded && (
                <div className="w-full h-[250px] bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
                        <span>Advertisement</span>
                    </div>
                </div>
            )}

            <div className={`min-h-[100px] ${!isLoaded ? "hidden" : "block"}`}>
                <ins
                    className="adsbygoogle block"
                    style={{ display: "block" }}
                    data-ad-client="ca-pub-2873403048341290"
                    data-ad-slot={slotId}
                    data-ad-format={format}
                    data-full-width-responsive={responsive ? "true" : "false"}
                />
            </div>

            {/* Policy Compliance: Labeling */}
            <div className="text-[10px] text-center text-muted-foreground mt-1">
                광고
            </div>
        </div>
    );
}
