// src/components/Logo.tsx
//
// 머니샐러리 로고 — 그라데이션 + 부드러운 마운트 모션 + 호버 인터랙션.
// SSR 친화 (정적 SVG 첫 렌더 → CSS 애니메이션). letter-by-letter 대신 안정적인 워드 단위 모션.
// 2026-08-26 Phase 4: framer-motion → CSS 키프레임(globals.css .ms-logo-*) 전환 —
// Logo 는 Header 를 통해 전 페이지 셸에 실리므로 framer import 금지.

"use client";

import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

export default function Logo({
  className = "h-8",
  showText = false,
  style,
}: LogoProps) {
  const viewBox = showText ? "0 0 180 36" : "0 0 32 32";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      className={`ms-logo ${className}`}
      preserveAspectRatio="xMinYMid meet"
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        {/* M 아이콘 그라데이션 — 일렉트릭 블루 → 라이트 인디고 */}
        <linearGradient id="ms-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0145F2" />
          <stop offset="100%" stopColor="#5B7FFF" />
        </linearGradient>
        {/* Salary 텍스트 그라데이션 — 일렉트릭 → 인디고 */}
        <linearGradient id="ms-salary-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0145F2" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* 파란 사각형 + M 모양 아이콘 — 호버 시 미세 확대 */}
      <g className="ms-logo-icon">
        <rect
          x="0"
          y="2"
          width="28"
          height="28"
          rx="7"
          fill="url(#ms-icon-grad)"
          className="ms-logo-rect"
        />
        {/* 상단 subtle gloss */}
        <rect x="0" y="2" width="28" height="14" rx="7" fill="white" opacity="0.08" />
        <path
          d="M7 22L14 12L21 22"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="ms-logo-path"
        />
      </g>

      {showText && (
        <g transform="translate(36, 24)">
          {/* Money — 딥 네이비 단색. 호버 시 미세 lift */}
          <text
            x="0"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#0A1829"
            letterSpacing="-0.04em"
            className="ms-logo-word ms-logo-word-money"
          >
            Money
          </text>
          {/* Salary — 그라데이션. 호버 시 미세 하강 (split 효과) */}
          <text
            x="68"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="600"
            fontSize="20"
            fill="url(#ms-salary-grad)"
            letterSpacing="-0.02em"
            className="ms-logo-word ms-logo-word-salary"
          >
            Salary
          </text>
        </g>
      )}
    </svg>
  );
}
