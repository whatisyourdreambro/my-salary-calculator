import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

// Keep the legacy numeric palette stable; semantic colors follow the active theme.
const ELECTRIC_BLUE = "#0145F2";
const CANVAS_CLOUD  = "#EDF1F5";
const semantic = (token: string) => `hsl(var(--${token}) / <alpha-value>)`;

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
        sans: ["var(--font-site-sans)"],
      },
      // Legacy pages use these heavy utilities throughout their Korean UI.
      // Keep emphasis without closing up small Hangul counters at 800–900.
      fontWeight: {
        extrabold: "750",
        black: "750",
      },
      letterSpacing: {
        tight: "-0.015em",
        tighter: "-0.025em",
      },
      spacing: {
        header: "var(--header-height)",
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "var(--font-site-sans)",
            lineHeight: "1.8",
            letterSpacing: "-0.01em",
            h1: { fontWeight: "700", letterSpacing: "-0.025em", lineHeight: "1.3" },
            h2: { fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.4" },
            h3: { fontWeight: "600", letterSpacing: "-0.015em", lineHeight: "1.5" },
            "--tw-prose-body": "hsl(var(--content-muted, var(--muted-foreground)))",
            "--tw-prose-headings": "hsl(var(--content-foreground, var(--foreground)))",
            "--tw-prose-lead": "hsl(var(--content-muted, var(--muted-foreground)))",
            "--tw-prose-links": "hsl(var(--content-link, var(--link)))",
            "--tw-prose-bold": "hsl(var(--content-foreground, var(--foreground)))",
            "--tw-prose-counters": "hsl(var(--content-muted, var(--muted-foreground)))",
            "--tw-prose-bullets": "hsl(var(--content-link, var(--link)))",
            "--tw-prose-hr": "hsl(var(--border))",
            "--tw-prose-quotes": "hsl(var(--content-foreground, var(--foreground)))",
            "--tw-prose-quote-borders": "hsl(var(--border))",
            "--tw-prose-captions": "hsl(var(--content-muted, var(--muted-foreground)))",
            "--tw-prose-code": "hsl(var(--content-foreground, var(--foreground)))",
            "--tw-prose-th-borders": "hsl(var(--border))",
            "--tw-prose-td-borders": "hsl(var(--border))",
          },
        },
      },
      colors: {
        // ── Semantic tokens → CSS variables ──────────────────────────
        border:     semantic("border"),
        input:      semantic("input"),
        ring:       semantic("ring"),
        background: semantic("background"),
        foreground: "hsl(var(--content-foreground, var(--foreground)) / <alpha-value>)",
        link:       "hsl(var(--content-link, var(--link)) / <alpha-value>)",

        primary: {
          DEFAULT:    semantic("primary"),
          foreground: semantic("primary-foreground"),
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

        // Legacy names now follow semantic text/border tokens; numbered shades stay fixed.
        faint: "hsl(var(--content-muted, var(--muted-foreground)) / <alpha-value>)",
        canvas: {
          DEFAULT: semantic("background"),
          foreground: semantic("foreground"),
          deep: semantic("border"),
          // Tints
          50:  "#F8FAFB",
          100: "#EDF1F5",
          200: "#DDE4EC",
          300: "#C8D4E0",
          400: "#A8BCCD",
          500: "#7A9AB5",
          600: "#557A98",
          700: "#3D5E78",
          800: "#30343B",
          900: "#202329",
          950: "#101216",
        },

        // Existing numbered utility colors are explicit palettes, not theme tokens.
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
          800: "#202329",
          900: "#15171C",
          950: "#101216",
        },

        secondary: {
          DEFAULT:    semantic("secondary"),
          foreground: semantic("secondary-foreground"),
        },
        destructive: {
          DEFAULT:    semantic("destructive"),
          foreground: semantic("destructive-foreground"),
        },
        muted: {
          DEFAULT:    semantic("muted"),
          foreground: "hsl(var(--content-muted, var(--muted-foreground)) / <alpha-value>)",
        },
        accent: {
          DEFAULT:    semantic("accent"),
          foreground: semantic("accent-foreground"),
        },
        popover: {
          DEFAULT:    semantic("popover"),
          foreground: semantic("popover-foreground"),
        },
        card: {
          DEFAULT:    semantic("card"),
          foreground: semantic("card-foreground"),
        },
        success: { DEFAULT: semantic("success"), foreground: semantic("success-foreground") },
        warning: { DEFAULT: semantic("warning"), foreground: semantic("warning-foreground") },
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
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
        "fade-in-up":     "fade-in-up 0.18s ease-out backwards",
        "reveal-up":      "reveal-up 0.22s ease-out backwards",
        "shimmer":        "shimmer 8s linear infinite",
        "float":          "float 6s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":      "spin-slow 20s linear infinite",
        "blob":           "blob 10s infinite",
      },

      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":      "linear-gradient(to bottom, hsl(var(--background)), hsl(var(--card)))",
        "primary-gradient":   `linear-gradient(135deg, ${ELECTRIC_BLUE} 0%, #0D5BFF 100%)`,
        "canvas-gradient":    "linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary)))",
        "duotone-gradient":   "linear-gradient(160deg, hsl(var(--background)), hsl(var(--secondary)) 50%, hsl(var(--muted)))",
      },

      boxShadow: {
        "primary-sm":  `0 2px 8px -1px ${ELECTRIC_BLUE}22`,
        "primary-md":  `0 4px 16px -2px ${ELECTRIC_BLUE}33`,
        "primary-lg":  `0 8px 32px -4px ${ELECTRIC_BLUE}44`,
        "primary-xl":  `0 12px 48px -6px ${ELECTRIC_BLUE}55`,
        "canvas-sm":   `0 2px 8px -1px #0A182922`,
        "canvas-md":   `0 4px 16px -2px #0A182933`,
        "canvas-lg":   `0 8px 32px -4px #0A182944`,
        "card":        "var(--shadow-card)",
        "card-hover":  "var(--shadow-raised)",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;

export default config;
