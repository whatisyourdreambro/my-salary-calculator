import React from "react";

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export default function Logo({ className = "h-10", showText = false }: LogoProps) {
    // User's SVG is 250x60.
    // Icon part is roughly 0 to 80 width.
    // Text starts at 85.
    const viewBox = showText ? "0 0 250 60" : "0 0 80 60";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="none"
            className={className}
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                <linearGradient id="growthGradient_jsx" x1="0" y1="60" x2="60" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E3A8A" />
                    <stop offset="1" stopColor="#10B981" />
                </linearGradient>
            </defs>

            <g transform="translate(0, 5)">
                {/* The first path had stroke-width="0" in the user snippet. Keeping it as is, though it might be invisible. */}
                <path d="M10 45 V 15 C 10 12 12 10 15 10 H 20 C 23 10 25 12 25 15 V 35 L 30 30" stroke="url(#growthGradient_jsx)" strokeWidth="0" />

                <path d="M5 45 L 5 15 Q 5 10 10 10 L 25 10 L 32 25 L 39 10 L 54 10 Q 59 10 59 15 L 59 25 L 59 30 L 70 19" stroke="url(#growthGradient_jsx)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                <path d="M62 19 H 70 V 27" stroke="url(#growthGradient_jsx)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {showText && (
                <>
                    <text x="85" y="42" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontWeight="800" fontSize="28" fill="currentColor" className="text-foreground" letterSpacing="-0.5">
                        Money
                    </text>

                    <text x="175" y="42" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontWeight="400" fontSize="28" fill="currentColor" className="text-foreground/80" letterSpacing="0">
                        Salary
                    </text>
                </>
            )}
        </svg>
    );
}
