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
      onClick={cycle}
      aria-label={label}
      title={label}
      className="flex items-center justify-center cursor-pointer transition-all"
      style={{
        width: 38,
        height: 38,
        padding: "8px",
        borderRadius: "10px",
        backgroundColor: "transparent",
        border: "1.5px solid #DDE4EC",
        color: "#0145F2",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "#0145F21A";
        (e.currentTarget as HTMLElement).style.borderColor = "#0145F2";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "#DDE4EC";
      }}
    >
      <Icon size={17} />
    </button>
  );
}
