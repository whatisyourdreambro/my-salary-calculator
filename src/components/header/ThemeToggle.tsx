"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { haptic } from "@/lib/haptic";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // hydration mismatch 방지: mount 전에는 빈 자리만 차지
  if (!mounted) {
    return <div style={{ width: 38, height: 38 }} aria-hidden="true" />;
  }

  const cycle = () => {
    haptic("light");
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const iconKey = theme === "system" ? "monitor" : resolvedTheme === "dark" ? "moon" : "sun";

  const label =
    theme === "light"
      ? "라이트 모드 (다크로 전환)"
      : theme === "dark"
        ? "다크 모드 (시스템 설정으로 전환)"
        : "시스템 설정 (라이트로 전환)";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="relative flex items-center justify-center cursor-pointer w-[38px] h-[38px] rounded-[10px] bg-transparent border-[1.5px] border-canvas-200 text-electric transition-all duration-200 hover:bg-electric-10 hover:border-electric hover:scale-105 active:scale-95 no-tap-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={iconKey}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon size={17} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
