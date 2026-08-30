"use client";

// src/app/table/2027/TableTabsNav.tsx
// 연봉|월급|주급|시급 4개 실수령액 표 상호 링크 탭 — table/2027 layout 공통 (2026 복제)

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";

const TABS = [
 { href: "/table/2027/annual", label: "연봉" },
 { href: "/table/2027/monthly", label: "월급" },
 { href: "/table/2027/weekly", label: "주급" },
 { href: "/table/2027/hourly", label: "시급" },
];

export default function TableTabsNav() {
 const pathname = usePathname();

 // R2 W4 (2026-08-31) — 2026 현행 표로 연도 교차 링크
 const to2026 =
 pathname && pathname.startsWith("/table/2027/")
 ? pathname.replace("/table/2027/", "/table/2026/")
 : "/table/2026/annual";

 return (
 <nav aria-label="실수령액 표 종류" className="flex justify-center px-4">
 <div className="inline-flex items-center gap-1 p-1 rounded-full bg-canvas border border-canvas">
 {TABS.map((tab) => {
 const isActive = pathname?.startsWith(tab.href);
 return (
 <Link
 key={tab.href}
 href={tab.href}
 aria-current={isActive ? "page" : undefined}
 className={`px-4 sm:px-6 py-2 rounded-full text-sm font-bold transition-colors ${
 isActive
 ? "bg-primary text-white shadow-sm"
 : "text-faint-blue hover:text-navy"
 }`}
 >
 {tab.label}
 </Link>
 );
 })}
 <Link
 href={to2026}
 className="px-4 sm:px-5 py-2 rounded-full text-sm font-bold text-electric hover:bg-electric/10 transition-colors whitespace-nowrap"
 >
 2026 현행
 </Link>
 </div>
 </nav>
 );
}
