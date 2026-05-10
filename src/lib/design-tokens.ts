/**
 * Design Tokens — Single Source of Truth
 *
 * tailwind.config.ts / globals.css 와 동일한 값을 TS 객체로 노출.
 * recharts·inline 스타일·canvas-confetti 등 Tailwind 클래스로 표현 불가능한
 * 곳에서만 import해 사용한다. 일반적인 UI 스타일링은 Tailwind 유틸 우선.
 */

export const colors = {
  // ── Brand (Duotone) ─────────────────────────────────────────
  primary: "#0145F2",       // Electric Blue
  primaryDark: "#0032B5",
  primaryLight: "#4D80F5",
  primaryFaint: "#80A8FA",

  canvas: "#EDF1F5",        // Canvas Cloud
  canvasDark: "#DDE4EC",
  canvasDeeper: "#C8D4E0",

  // ── Foreground ──────────────────────────────────────────────
  text: "#0A1829",
  textMuted: "#3D5E78",
  textFaint: "#7A9AB5",
  white: "#FFFFFF",

  // ── Semantic feedback (Toss-style) ──────────────────────────
  success: "#1FAA59",
  successLight: "#E8F7EF",
  warning: "#F5A623",
  warningLight: "#FEF6E7",
  danger: "#E5484D",
  dangerLight: "#FCE8E9",
  info: "#0145F2",
} as const;

/**
 * Recharts 등 차트의 시리즈 색상.
 * 토스 톤 — 단일 파란색 명도 변화 + 회색 보조.
 */
export const chartSeries = [
  colors.primary,
  colors.primaryLight,
  colors.primaryFaint,
  "#B3CCFC",
  colors.canvasDeeper,
] as const;

/**
 * 양수/음수 비교용 (수익/지출, 증가/감소 등).
 */
export const chartDelta = {
  positive: colors.success,
  negative: colors.danger,
  neutral: colors.textMuted,
} as const;

export const radius = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "999px",
} as const;

export const shadow = {
  sm: "0 1px 3px 0 rgba(10, 24, 41, 0.08)",
  md: "0 4px 16px -4px rgba(10, 24, 41, 0.10)",
  lg: "0 8px 24px -4px rgba(10, 24, 41, 0.12)",
  primary: "0 4px 16px -2px rgba(1, 69, 242, 0.20)",
  primaryLg: "0 8px 32px -4px rgba(1, 69, 242, 0.27)",
} as const;

/**
 * 섹션 수직 패딩 — Tailwind spacing 토큰과 동일 값.
 * 토스식 큰 여백을 유지하기 위한 단일 출처.
 */
export const section = {
  xs: "1rem",
  sm: "2rem",
  md: "3.5rem",
  lg: "5rem",
  xl: "7rem",
  "2xl": "9rem",
} as const;

/**
 * Framer Motion / CSS transition 표준 값.
 */
export const motion = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
  },
  ease: {
    /** Toss 시그니처 ease — 시작은 빠르게, 끝은 부드럽게 */
    smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
    /** 표준 ease-out */
    out: [0, 0, 0.2, 1] as [number, number, number, number],
  },
} as const;

export type Colors = typeof colors;
export type ChartSeries = typeof chartSeries;
