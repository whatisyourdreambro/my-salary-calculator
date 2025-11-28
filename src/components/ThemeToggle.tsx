"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-accent/50 transition-colors group"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-full h-full transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-orange-500"
            }`}
        />
        <Moon
          className={`absolute inset-0 w-full h-full transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100 text-blue-400" : "-rotate-90 scale-0 opacity-0"
            }`}
        />
      </div>
      <span className="sr-only">테마 변경</span>
    </button>
  );
}