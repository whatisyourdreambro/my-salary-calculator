"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

// [수정] 메뉴 구조를 드롭다운 형태로 재구성합니다.
const navConfig = {
  calculators: {
    title: "계산기",
    items: [
      { name: "종합 계산기", href: "/" },
      { name: "연말정산", href: "/year-end-tax" },
      { name: "주택담보대출", href: "/home-loan" },
      { name: "FIRE 계산기", href: "/fire-calculator" },
    ],
  },
  tables: {
    title: "연봉 테이블",
    items: [
      { name: "연봉 표", href: "/table/annual" },
      { name: "월급 표", href: "/table/monthly" },
      { name: "주급 표", href: "/table/weekly" },
      { name: "시급 표", href: "/table/hourly" },
    ],
  },
  content: {
    title: "콘텐츠",
    items: [
      { name: "전체 가이드", href: "/guides" },
      { name: "머니 Q&A 커뮤니티", href: "/community" },
      { name: "자주 묻는 질문(Q&A)", href: "/qna" },
      { name: "용어 사전", href: "/glossary" },
    ],
  },
  lotto: {
    title: "로또 생성기",
    href: "/lotto",
  },
};

export default function Header() {
  const pathname = usePathname();
  // [추가] 드롭다운 메뉴의 상태를 관리하기 위한 state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* [수정] 재구성된 메뉴 구조를 렌더링합니다. */}
            {Object.entries(navConfig).map(([key, value]) =>
              "items" in value ? (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(key)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className="flex items-center gap-1 py-2 px-3 text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200">
                    {value.title}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {/* 드롭다운 메뉴 */}
                  <div
                    className={`absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                      openMenu === key
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {value.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === item.href
                            ? "font-bold text-signature-blue"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={key}
                  href={value.href}
                  className={`py-2 px-3 text-base font-medium transition-colors duration-200 ${
                    pathname === value.href
                      ? "text-signature-blue"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {value.title}
                </Link>
              )
            )}
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
