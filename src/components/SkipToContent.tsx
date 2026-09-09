"use client";

import { usePathname } from "next/navigation";

export default function SkipToContent() {
  const path = usePathname();
  const english = path === "/en" || path.startsWith("/en/");
  return <a href="#main-content" className="skip-to-content">{english ? "Skip to main content" : "본문으로 바로가기"}</a>;
}
