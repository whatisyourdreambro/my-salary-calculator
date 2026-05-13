// src/components/Logo.tsx
//
// 머니샐러리 로고 — 그라데이션 + 부드러운 마운트 모션 + 호버 인터랙션.
// SSR 친화 (정적 SVG 첫 렌더 → hydrate 후 모션). letter-by-letter 대신 안정적인 워드 단위 모션.

"use client";

import React from "react";
import { motion } from "framer-motion";

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
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="xMinYMid meet"
      style={{ overflow: "visible", ...style }}
      initial="rest"
      whileHover="hover"
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

      {/* 파란 사각형 + M 모양 아이콘 */}
      <motion.g
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.06 },
        }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <motion.rect
          x="0"
          y="2"
          width="28"
          height="28"
          rx="7"
          fill="url(#ms-icon-grad)"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        {/* 상단 subtle gloss */}
        <rect x="0" y="2" width="28" height="14" rx="7" fill="white" opacity="0.08" />
        <motion.path
          d="M7 22L14 12L21 22"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        />
      </motion.g>

      {showText && (
        <g transform="translate(36, 24)">
          {/* Money — 딥 네이비 단색. 호버 시 미세 lift */}
          <motion.text
            x="0"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="900"
            fontSize="20"
            fill="#0A1829"
            letterSpacing="-0.04em"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            variants={{
              rest: { y: 0 },
              hover: { y: -1 },
            }}
          >
            Money
          </motion.text>
          {/* Salary — 그라데이션. 호버 시 미세 하강 (split 효과) */}
          <motion.text
            x="68"
            fontFamily="var(--font-pretendard), -apple-system, sans-serif"
            fontWeight="600"
            fontSize="20"
            fill="url(#ms-salary-grad)"
            letterSpacing="-0.02em"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            variants={{
              rest: { y: 0 },
              hover: { y: 1 },
            }}
          >
            Salary
          </motion.text>
        </g>
      )}
    </motion.svg>
  );
}
