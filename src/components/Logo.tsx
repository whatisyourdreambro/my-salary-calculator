import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

export default function Logo({ className = "h-8", showText = false, style }: LogoProps) {
  const viewBox = showText ? "0 0 180 36" : "0 0 32 32";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="xMinYMid meet"
      style={{ overflow: "visible", ...style }}
    >
      {/* 파란 사각형 + M 모양 아이콘 */}
      <g transform="translate(0, 2)">
        <rect x="0" y="0" width="28" height="28" rx="6" fill="#0145F2" />
        <path
          d="M7 20L14 10L21 20"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {showText && (
        <g transform="translate(36, 24)">
          <text
            x="0"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#0A1829"
            letterSpacing="-0.04em"
          >
            Money
          </text>
          <text
            x="68"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="500"
            fontSize="20"
            fill="#0145F2"
            letterSpacing="-0.02em"
          >
            Salary
          </text>
        </g>
      )}
    </svg>
  );
}