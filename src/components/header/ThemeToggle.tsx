"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    setMounted(true);
  }, []);

  // hydration mismatch 방지: mount 전에는 빈 자리만 차지
  if (!mounted) {
    return <div style={{ width: 44, height: 44 }} aria-hidden="true" />;
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
      ? (isEn ? "Light theme: switch to dark" : "라이트 모드 (다크로 전환)")
      : theme === "dark"
        ? (isEn ? "Dark theme: use system setting" : "다크 모드 (시스템 설정으로 전환)")
        : (isEn ? "System theme: switch to light" : "시스템 설정 (라이트로 전환)");

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="ms-interactive hover:!translate-y-0 hover:!shadow-none flex items-center justify-center cursor-pointer w-11 h-11 p-2 rounded-xl bg-transparent border border-border text-foreground hover:bg-secondary"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
