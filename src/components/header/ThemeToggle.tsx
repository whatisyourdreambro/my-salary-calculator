"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

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
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

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
      className="flex items-center justify-center cursor-pointer w-[38px] h-[38px] p-2 rounded-[10px] bg-transparent border-[1.5px] border-canvas text-electric transition-colors hover:bg-electric-10 hover:border-electric"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
