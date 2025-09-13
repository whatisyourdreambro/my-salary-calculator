"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

// [수정] 1. Q&A 메뉴 추가, 2. 모든 href 값 끝에 있던 슬래시('/') 제거
const navLinks = [
  { name: "계산기", longName: "연봉/퇴직금 계산기", href: "/" },
  { name: "연봉 표", longName: "연봉 표", href: "/table/annual" },
  { name: "월급 표", longName: "월급 표", href: "/table/monthly" },
  { name: "주급 표", longName: "주급 표", href: "/table/weekly" },
  { name: "시급 표", longName: "시급 표", href: "/table/hourly" },
  { name: "로또", longName: "로또 생성기", href: "/lotto" },
  { name: "Q&A", longName: "Q&A", href: "/qna" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              // next.config.mjs에서 trailingSlash를 제거했으므로,
              // pathname에는 더 이상 '/'가 붙지 않아 정확한 비교가 가능합니다.
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-2 px-1 sm:px-2 text-sm md:text-base font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${
                    isActive
                      ? "text-signature-blue"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span className="hidden md:inline">{link.longName}</span>
                  <span className="md:hidden">{link.name}</span>
                </Link>
              );
            })}
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
