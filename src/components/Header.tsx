"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

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
  // [추가] 모바일 메뉴의 열림/닫힘 상태를 관리
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // [추가] 라우트가 변경될 때마다 메뉴를 닫도록 설정
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

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

          {/* 데스크톱용 네비게이션 링크 (md 사이즈 이상에서 보임) */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href.startsWith("/?") &&
                  pathname === "/" &&
                  typeof window !== "undefined" &&
                  new URLSearchParams(window.location.search).toString() ===
                    new URLSearchParams(link.href.split("?")[1]).toString());

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

          {/* 오른쪽 영역 (테마 토글 및 모바일 메뉴 버튼) */}
          <div className="flex items-center">
            <ThemeToggle />
            {/* 모바일용 햄버거 메뉴 버튼 (md 사이즈 미만에서 보임) */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="메뉴 열기"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* [추가] 모바일 메뉴 패널 (isMenuOpen 상태에 따라 보임) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-dark-bg z-50 md:hidden">
          <div className="flex justify-between items-center h-16 px-4 border-b dark:border-gray-800">
            <Link
              href="/"
              className="text-2xl font-bold text-signature-blue tracking-tight"
            >
              Moneysalary
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400"
              aria-label="메뉴 닫기"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-2xl font-bold text-gray-700 dark:text-gray-300 hover:text-signature-blue"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
