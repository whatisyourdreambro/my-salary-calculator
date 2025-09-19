"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

// [수정] 사용자들이 가장 많이 찾는 핵심 메뉴 6개만 선별하여 재구성합니다.
const navLinks = [
  { name: "연봉 계산기", href: "/" },
  { name: "연봉 테이블", href: "/table/annual" },
  { name: "콘텐츠 가이드", href: "/guides" },
  { name: "커뮤니티", href: "/community" },
  { name: "연봉 비교", href: "/?tab=comparator" },
  { name: "FIRE 계산기", href: "/fire-calculator" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고/사이트 이름 */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-signature-blue tracking-tight"
            >
              Moneysalary
            </Link>
          </div>

          {/* 네비게이션 링크 */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              // 연봉 비교 탭의 활성화 상태를 정확히 추적하기 위한 로직
              const isActive =
                link.href === "/?tab=comparator"
                  ? pathname === "/" &&
                    new URLSearchParams(window.location.search).get("tab") ===
                      "comparator"
                  : pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-2 text-base font-medium transition-colors duration-200 border-b-2 ${
                    isActive
                      ? "border-signature-blue text-signature-blue"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* 테마 토글 */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {/* [추가] 모바일 화면용 헤더 (스크롤) */}
      <div className="md:hidden w-full px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap h-12">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/?tab=comparator"
                ? pathname === "/" &&
                  typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).get("tab") ===
                    "comparator"
                : pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-signature-blue"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
