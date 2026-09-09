"use client";

// src/app/table/2026/TableTabsNav.tsx
// 연봉|월급|주급|시급 4개 실수령액 표 상호 링크 탭 — table/2026 layout 공통

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";

const TABS = [
 { href: "/table/2026/annual", label: "연봉" },
 { href: "/table/2026/monthly", label: "월급" },
 { href: "/table/2026/weekly", label: "주급" },
 { href: "/table/2026/hourly", label: "시급" },
];

export default function TableTabsNav() {
 const pathname = usePathname();

 // R2 W4 (2026-08-31) — 2027 대응 표로 연도 교차 링크 (annual만 있던 진입로 확장)
 const to2027 =
 pathname && pathname.startsWith("/table/2026/")
 ? pathname.replace("/table/2026/", "/table/2027/")
 : "/table/2027/annual";

 return (
 <nav aria-label="실수령액 표 종류" className="flex justify-center px-4">
 <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-secondary p-1">
 {TABS.map((tab) => {
 const isActive = pathname?.startsWith(tab.href);
 return (
 <Link
 key={tab.href}
 href={tab.href}
 aria-current={isActive ? "page" : undefined}
 className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
 isActive
 ? "bg-primary text-white shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 {tab.label}
 </Link>
 );
 })}
 <Link
 href={to2027}
 className="ms-button ms-button-ghost text-sm"
 >
 2027 미리보기
 </Link>
 </div>
 </nav>
 );
}
