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
                    <stop offset="0%" stopColor="#10B981" /> {/* emerald-500 */}
                    <stop offset="50%" stopColor="#0EA5E9" /> {/* sky-500 */}
                    <stop offset="100%" stopColor="#6366F1" /> {/* indigo-500 */}
                </linearGradient>
                <linearGradient id="logoGradientText" x1="50" y1="20" x2="200" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Icon Group */}
            {/* Concept: Abstract 'M' constructed from 3 vertical bars with a growth arrow */}
            <g filter="url(#glow)">
                {/* Left Pillar */}
                <path
                    d="M8 28V12C8 10.8954 8.89543 10 10 10V10C11.1046 10 12 10.8954 12 12V28C12 29.1046 11.1046 30 10 30V30C8.89543 30 8 29.1046 8 28Z"
                    fill="url(#logoGradient)"
                    opacity="0.8"
                />
                {/* Middle Pillar (Slightly higher) */}
                <path
                    d="M18 28V8C18 6.89543 18.8954 6 20 6V6C21.1046 6 22 6.89543 22 8V28C22 29.1046 21.1046 30 20 30V30C18.8954 30 18 29.1046 18 28Z"
                    fill="url(#logoGradient)"
                />

                {/* Right Arrow/Pillar (Growth) */}
                {/* Connecting to form an M visually */}
                <path
                    d="M28 28V12L32 8L36 12V28C36 29.1046 35.1046 30 34 30C32.8954 30 32 29.1046 32 28V16L30 14L28 16V28C28 29.1046 27.1046 30 26 30C24.8954 30 24 29.1046 24 28V12L28 16V28Z"
                    fill="url(#logoGradient)"
                    style={{ display: 'none' }} // Hidden legacy idea
                />
                {/* Right Leg & Arrow */}
                <path
                    d="M28 28V16L34 10"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M34 10H29"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M28 28H28.01"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Let's try a simpler geometric 'M' */}
                {/* Left vertical bar */}
                <rect x="6" y="8" width="6" height="24" rx="2" fill="url(#logoGradient)" />
                {/* Middle V */}
                <path d="M12 12L20 22L28 10" stroke="url(#logoGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Right vertical bar */}
                <rect x="28" y="8" width="6" height="24" rx="2" fill="url(#logoGradient)" />
            </g>

            {/* Re-doing the icon to be cleaner: A "Growth M" */}
            {/* Overwriting previous paths with a single unified path for the M */}
            <rect width="40" height="40" fill="#18181b" rx="0" fillOpacity="0" /> {/* Canvas debug */}
            <g transform="translate(2, 2)">
                {/* 36x36 area */}
                <path
                    d="M6 30V10C6 8.89543 6.89543 8 8 8H10C11.1046 8 12 8.89543 12 10V20L17.2 26.5C17.6 27 18.4 27 18.8 26.5L24 20V10C24 8.89543 24.8954 8 26 8H28C29.1046 8 30 8.89543 30 10V22L34 18"
                    stroke="url(#logoGradient)"
                    strokeWidth="0"
                    fill="none"
                />

                {/* Actual Implementation: Thick Geometric M */}
                <path
                    d="M7 32V12C7 9.79086 8.79086 8 11 8C13.2091 8 15 9.79086 15 12V24L18 28L21 24V12C21 9.79086 22.7909 8 25 8C27.2091 8 29 9.79086 29 12V32"
                    stroke="url(#logoGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    filter="url(#glow)"
                />

                {/* Coin/Dot Accent */}
                <circle cx="29" cy="8" r="3" fill="#FACC15" filter="url(#glow)" />
            </g>

            {showText && (
                <g transform="translate(48, 27)">
                    <text
                        fontFamily="'Inter', 'Noto Sans KR', sans-serif"
                        fontWeight="800"
                        fontSize="24"
                        fill="currentColor"
                        className="text-white"
                        letterSpacing="-0.5"
                    >
                        Money
                    </text>
                    <text
                        x="80"
                        fontFamily="'Inter', 'Noto Sans KR', sans-serif"
                        fontWeight="400"
                        fontSize="24"
                        fill="currentColor"
                        className="text-zinc-400"
                        letterSpacing="0"
                    >
                        Salary
                    </text>
                </g>
            )}
        </svg>
    );
}
