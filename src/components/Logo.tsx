// src/components/Logo.tsx
//
// 머니샐러리 로고 — 그라데이션 + 글자별 stagger 모션 + 호버 인터랙션.
// SVG 기반이라 모든 해상도 선명. SSR 친화 (초기 렌더 정적 → hydrate 후 모션 시작).

"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  showText?: boolean;
  style?: React.CSSProperties;
}

const MONEY_LETTERS = ["M", "o", "n", "e", "y"];
const SALARY_LETTERS = ["S", "a", "l", "a", "r", "y"];

export default function Logo({
  className = "h-8",
  showText = false,
  style,
}: LogoProps) {
  const viewBox = showText ? "0 0 188 36" : "0 0 32 32";

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
      animate="rest"
    >
      <defs>
        {/* M 아이콘 그라데이션 — 일렉트릭 블루 → 라이트 인디고 */}
        <linearGradient id="ms-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0145F2" />
          <stop offset="100%" stopColor="#5B7FFF" />
        </linearGradient>
        {/* Money 텍스트 그라데이션 — 딥 네이비 → 미드 네이비 */}
        <linearGradient id="ms-money-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0A1829" />
          <stop offset="100%" stopColor="#1B2C42" />
        </linearGradient>
        {/* Salary 텍스트 그라데이션 — 일렉트릭 → 인디고 */}
        <linearGradient id="ms-salary-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0145F2" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        {/* M 아이콘 글로우 */}
        <filter id="ms-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 파란 사각형 + M 모양 아이콘 */}
      <motion.g
        transform="translate(0, 2)"
        variants={{
          rest: { rotate: 0, scale: 1 },
          hover: { rotate: -4, scale: 1.06 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{ transformOrigin: "14px 14px" }}
      >
        <motion.rect
          x="0"
          y="0"
          width="28"
          height="28"
          rx="7"
          fill="url(#ms-icon-grad)"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* inner highlight (subtle gloss) */}
        <rect
          x="0"
          y="0"
          width="28"
          height="14"
          rx="7"
          fill="white"
          opacity="0.08"
        />
        <motion.path
          d="M7 20L14 10L21 20"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#ms-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
        />
      </motion.g>

      {showText && (
        <g transform="translate(36, 24)">
          {/* Money — 글자별 stagger fade-in + 호버 시 미세 lift */}
          <motion.g
            variants={{
              rest: { y: 0 },
              hover: { y: -1 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {MONEY_LETTERS.map((char, i) => (
              <motion.text
                key={`money-${i}`}
                x={i * 13}
                fontFamily="var(--font-pretendard), -apple-system, sans-serif"
                fontWeight="900"
                fontSize="21"
                fill="url(#ms-money-grad)"
                letterSpacing="-0.04em"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char}
              </motion.text>
            ))}
          </motion.g>

          {/* Salary — 글자별 stagger + 호버 시 미세 lower */}
          <motion.g
            variants={{
              rest: { y: 0 },
              hover: { y: 1 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {SALARY_LETTERS.map((char, i) => (
              <motion.text
                key={`salary-${i}`}
                x={71 + i * 12}
                fontFamily="var(--font-pretendard), -apple-system, sans-serif"
                fontWeight="700"
                fontSize="21"
                fill="url(#ms-salary-grad)"
                letterSpacing="-0.025em"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char}
              </motion.text>
            ))}
          </motion.g>

          {/* 하단 액센트 점 (호버 시 펄스) */}
          <motion.circle
            cx="178"
            cy="-5"
            r="2"
            fill="#0145F2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            variants={{
              rest: { scale: 1, opacity: 1 },
              hover: { scale: 1.4, opacity: 0.8 },
            }}
          />
        </g>
      )}
    </motion.svg>
  );
}
