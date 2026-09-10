"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
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

  const dark = resolvedTheme === "dark";
  const Icon = dark ? Moon : Sun;
  const label = dark
    ? (isEn ? "Dark theme: switch to light" : "다크 모드 (라이트로 전환)")
    : (isEn ? "Light theme: switch to dark" : "라이트 모드 (다크로 전환)");

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="ms-interactive hover:!translate-y-0 hover:!shadow-none flex items-center justify-center cursor-pointer w-11 h-11 p-2 rounded-xl bg-transparent border border-border text-foreground hover:bg-secondary"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
