import React from "react";

interface LogoProps {
    className?: string; // e.g. "h-8 w-auto" means height is controlled, width auto
    showText?: boolean;
}

export default function Logo({ className = "h-10", showText = false }: LogoProps) {
    // ViewBox:
    // Icon is roughly 40x40.
    // Text starts at 50, goes to ~200.
    // Height is 40.
    const viewBox = showText ? "0 0 210 40" : "0 0 40 40";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="none"
            className={className}
            preserveAspectRatio="xMinYMid meet"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#15803d" /> {/* emerald-700 (Regency Green) */}
                    <stop offset="50%" stopColor="#10b981" /> {/* emerald-500 */}
                    <stop offset="100%" stopColor="#d9b07e" /> {/* Gold */}
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Icon Group */}
            <g>
                <rect width="40" height="40" fill="#18181b" rx="0" fillOpacity="0" /> {/* Canvas debug */}
                <g transform="translate(2, 2)">
                    {/* Actual Implementation: Thick Geometric M */}
                    <path
                        d="M7 32V12C7 9.79086 8.79086 8 11 8C13.2091 8 15 9.79086 15 12V24L18 28L21 24V12C21 9.79086 22.7909 8 25 8C27.2091 8 29 9.79086 29 12V32"
                        stroke="url(#logoGradient)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* Coin/Dot Accent - Gold */}
                    <circle cx="29" cy="8" r="3" fill="#d9b07e" />
                </g>
            </g>

            {showText && (
                <g transform="translate(48, 27)">
                    <text
                        x="0"
                        fontFamily="var(--font-playfair), serif"
                        fontWeight="700"
                        fontSize="26"
                        fill="currentColor"
                        className="text-foreground"
                        letterSpacing="-0.02em"
                    >
                        Money
                    </text>
                    <text
                        x="85"
                        fontFamily="var(--font-lato), sans-serif"
                        fontWeight="300"
                        fontSize="26"
                        fill="currentColor"
                        className="text-stone-500"
                        letterSpacing="0.05em"
                    >
                        Salary
                    </text>
                </g>
            )}
        </svg>
    );
}
