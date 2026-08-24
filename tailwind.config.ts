import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

// ═══════════════════════════════════════════════════════════════
//  DUOTONE DESIGN SYSTEM
//  Primary:    Electric Blue  → #0145F2
//  Base/BG:    Canvas Cloud   → #EDF1F5
//  On-primary: White          → #FFFFFF  (accessibility only)
// ═══════════════════════════════════════════════════════════════

const ELECTRIC_BLUE = "#0145F2";
const CANVAS_CLOUD  = "#EDF1F5";
const ON_PRIMARY    = "#FFFFFF";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      spacing: {
        header: "var(--header-height)",
      },
      colors: {
        // ── Semantic tokens → CSS variables ──────────────────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // primary는 의도적으로 hex 유지: 아래 5~90 opacity shade 체계가
        // hex+알파(#0145F2xx) 기반이라 CSS 변수 전환 시 shade 전체 재설계가
        // 필요함. 라이트/다크 공통 Electric Blue 브랜드 색으로 유지한다.
        primary: {
          DEFAULT:    ELECTRIC_BLUE,   // #0145F2
          foreground: ON_PRIMARY,      // #FFFFFF
          // Opacity shades (all Electric Blue family)
          5:   "#0145F20D",
          10:  "#0145F21A",
          15:  "#0145F226",
          20:  "#0145F233",
          30:  "#0145F24D",
          40:  "#0145F266",
          50:  "#0145F280",
          60:  "#0145F299",
          70:  "#0145F2B3",
          80:  "#0145F2CC",
          90:  "#0145F2E6",
        },

        // 2026-08-24 점검: text-faint(1,357회)·border-canvas-deep(478회)가 미정의
        // 클래스로 조용히 실패(색 미적용 — 부모 색 상속)하고 있었다. 신규 컴포넌트
        // 세대의 네이밍(faint / canvas-deep)을 기존 팔레트에 별칭으로 배선.
        faint: "#7A9AB5", // = faint-blue (globals.css .text-faint-blue)
        canvas: {
          DEFAULT: CANVAS_CLOUD,   // #EDF1F5
          foreground: ELECTRIC_BLUE,
          deep: "#C8D4E0", // = canvas-300 (globals.css .bg-canvas-deeper 계열)
          // Tints
          50:  "#F8FAFB",
          100: "#EDF1F5",
          200: "#DDE4EC",
          300: "#C8D4E0",
          400: "#A8BCCD",
          500: "#7A9AB5",
          600: "#557A98",
          700: "#3D5E78",
          800: "#294460",
          900: "#162E4A",
        },

        // Keep Tailwind shorthands pointing to duotone family
        blue:   { 600: ELECTRIC_BLUE, DEFAULT: ELECTRIC_BLUE },
        slate:  {
          50:  CANVAS_CLOUD,
          100: "#DDE4EC",
          200: "#C8D4E0",
          300: "#A8BCCD",
          400: "#7A9AB5",
          500: "#557A98",
          600: "#3D5E78",
          700: "#294460",
          800: "#162E4A",
          900: "#0A1829",
        },

        // ── 2026-08-24: 다크모드 복원 — 하드코딩 hex → CSS 변수 ────────
        // 종전에는 아래 6그룹이 hex(#FFFFFF·#EDF1F5·#0145F2)로 고정되어
        // bg-card 등이 다크모드에서도 항상 라이트 색이었다. globals.css의
        // :root 값을 기존 hex와 픽셀 등가인 HSL로 정렬한 뒤 변수로 전환.
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",            // light #EDF1F5
          foreground: "hsl(var(--secondary-foreground))", // light #0145F2
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",            // light #0145F2
          foreground: "hsl(var(--destructive-foreground))", // light #FFFFFF
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))", // light #EDF1F5
          // 라이트의 60% 알파(구 #0145F299)는 HSL 트리플 변수로 표현 불가 →
          // 알파를 --muted-foreground-opacity(:root 0.6 / .dark 1)로 분리.
          // 주의: 알파가 이미 명시되어 text-muted-foreground/50 같은
          // Tailwind 알파 수정자는 생성되지 않음 — 해당 용례는 primary/50
          // (동일 픽셀)로 대체되어 있음.
          foreground: "hsl(var(--muted-foreground) / var(--muted-foreground-opacity, 1))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",            // light #EDF1F5
          foreground: "hsl(var(--accent-foreground))", // light #0145F2
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",            // light #FFFFFF
          foreground: "hsl(var(--popover-foreground))", // light #0145F2
        },
        card: {
          DEFAULT:    "hsl(var(--card))",            // light #FFFFFF
          foreground: "hsl(var(--card-foreground))", // light #0145F2
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-up": {
          "0%":   { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1",   boxShadow: `0 0 24px -4px ${ELECTRIC_BLUE}55` },
          "50%":       { opacity: "0.8", boxShadow: `0 0 12px -2px ${ELECTRIC_BLUE}22` },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "blob": {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.1)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-up":      "reveal-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":        "shimmer 8s linear infinite",
        "float":          "float 6s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":      "spin-slow 20s linear infinite",
        "blob":           "blob 10s infinite",
      },

      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":      "linear-gradient(to bottom, #EDF1F5, #FFFFFF)",
        "primary-gradient":   `linear-gradient(135deg, ${ELECTRIC_BLUE} 0%, #0D5BFF 100%)`,
        "canvas-gradient":    `linear-gradient(135deg, ${CANVAS_CLOUD} 0%, #DDE4EC 100%)`,
        "duotone-gradient":   `linear-gradient(160deg, ${CANVAS_CLOUD} 0%, #DDE4EC 50%, #C8D4E0 100%)`,
      },

      boxShadow: {
        "primary-sm":  `0 2px 8px -1px ${ELECTRIC_BLUE}22`,
        "primary-md":  `0 4px 16px -2px ${ELECTRIC_BLUE}33`,
        "primary-lg":  `0 8px 32px -4px ${ELECTRIC_BLUE}44`,
        "primary-xl":  `0 12px 48px -6px ${ELECTRIC_BLUE}55`,
        "canvas-sm":   `0 2px 8px -1px #0A182922`,
        "canvas-md":   `0 4px 16px -2px #0A182933`,
        "canvas-lg":   `0 8px 32px -4px #0A182944`,
        "card":        `0 1px 3px 0 #0A182914, 0 4px 16px -4px #0A182910`,
        "card-hover":  `0 4px 24px -4px ${ELECTRIC_BLUE}22, 0 1px 4px 0 #0A182910`,
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;

export default config;