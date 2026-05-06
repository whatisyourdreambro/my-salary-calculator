// src/components/header/LocaleSwitcher.tsx
//
// KO ↔ EN 언어 토글.
// pathname을 분석해 같은 슬러그의 영어/한국어 페이지로 이동.
// 매칭되는 영어 페이지가 없으면 /en (영어 메인)으로 폴백.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { enGuides } from "@/lib/guidesData";

/** 영어로 사용 가능한 한국어 → 영어 경로 매핑 */
const KO_TO_EN: Record<string, string> = {
 "/": "/en",
 "/guides": "/en/guides",
};

/** 영어 페이지로 매핑 가능한지 확인 */
function getEnglishPath(pathname: string): string {
 if (pathname.startsWith("/en")) return pathname;

 if (KO_TO_EN[pathname]) return KO_TO_EN[pathname];

 const guideMatch = pathname.match(/^\/guides\/(.+)$/);
 if (guideMatch) {
  const slug = guideMatch[1];
  if (enGuides.some((g) => g.slug === slug)) {
   return `/en/guides/${slug}`;
  }
  return "/en/guides";
 }

 return "/en";
}

/** 영어 → 한국어 매핑 */
function getKoreanPath(pathname: string): string {
 if (!pathname.startsWith("/en")) return pathname;

 const koPath = pathname.replace(/^\/en/, "") || "/";
 return koPath;
}

export default function LocaleSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
 const pathname = usePathname() ?? "/";
 const isEnglish = pathname.startsWith("/en");

 const koHref = isEnglish ? getKoreanPath(pathname) : pathname;
 const enHref = isEnglish ? pathname : getEnglishPath(pathname);

 if (variant === "mobile") {
  return (
   <div className="flex items-center gap-2 mb-4">
    <Globe size={16} className="text-muted-blue" />
    <span className="text-xs font-bold text-muted-blue mr-1">Language</span>
    <Link
     href={koHref}
     className="px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
     style={{
      color: !isEnglish ? "#0145F2" : "#3D5E78",
      backgroundColor: !isEnglish ? "#0145F20D" : "transparent",
     }}
    >
     한국어
    </Link>
    <Link
     href={enHref}
     className="px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
     style={{
      color: isEnglish ? "#0145F2" : "#3D5E78",
      backgroundColor: isEnglish ? "#0145F20D" : "transparent",
     }}
    >
     EN
    </Link>
   </div>
  );
 }

 return (
  <div className="hidden sm:flex items-center gap-1 px-1 py-1 rounded-lg border border-canvas-200 bg-white">
   <Link
    href={koHref}
    aria-label="한국어로 보기"
    className="px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
    style={{
     color: !isEnglish ? "#FFFFFF" : "#3D5E78",
     backgroundColor: !isEnglish ? "#0145F2" : "transparent",
    }}
   >
    KO
   </Link>
   <Link
    href={enHref}
    aria-label="View in English"
    className="px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
    style={{
     color: isEnglish ? "#FFFFFF" : "#3D5E78",
     backgroundColor: isEnglish ? "#0145F2" : "transparent",
    }}
   >
    EN
   </Link>
  </div>
 );
}
