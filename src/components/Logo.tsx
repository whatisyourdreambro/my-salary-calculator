import React from "react";

interface LogoProps {
    className?: string; // e.g. "h-8 w-auto" means height is controlled, width auto
    showText?: boolean;
}

export default function Logo({ className = "h-8", showText = false }: LogoProps) {
    // A highly premium, minimalist corporate logo
    // Solid Blue Accent Square + Crisp Sans-Serif Text
    const viewBox = showText ? "0 0 160 32" : "0 0 32 32";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="none"
            className={className}
            preserveAspectRatio="xMinYMid meet"
        >
            {/* The Accent Mark - Minimal Blue Square / 'M' abstract */}
            <g transform="translate(0, 0)">
                <rect x="0" y="4" width="24" height="24" rx="4" fill="#1428A0" />
                <path d="M6 18L12 10L18 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>

            {showText && (
                <g transform="translate(34, 22)">
                    <text
                        x="0"
                        fontFamily="var(--font-pretendard), sans-serif"
                        fontWeight="900"
                        fontSize="22"
                        fill="#000000"
                        letterSpacing="-0.04em"
                    >
                        Money
                    </text>
                    <text
                        x="72"
                        fontFamily="var(--font-pretendard), sans-serif"
                        fontWeight="500"
                        fontSize="22"
                        fill="#1428A0"
                        letterSpacing="-0.02em"
                    >
                        Salary
                    </text>
                </g>
            )}
        </svg>
    );
}