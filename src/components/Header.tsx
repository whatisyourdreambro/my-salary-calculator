"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

type LinkItem = { name: string; href: string; type: "link" };
type DropdownItem = {
  name: string;
  type: "dropdown";
  items: { name: string; href: string }[];
};
type NavItem = LinkItem | DropdownItem;

const navConfig: NavItem[] = [
  {
    name: "계산기",
    type: "dropdown",
    items: [
      { name: "종합 계산기", href: "/" },
      { name: "연말정산 계산기", href: "/year-end-tax" },
      { name: "주택담보대출 계산기", href: "/home-loan" },
      { name: "자동차 구매 계산기", href: "/car-loan" },
      { name: "FIRE 계산기", href: "/fire-calculator" },
    ],
  },
  {
    name: "연봉 테이블",
    type: "dropdown",
    items: [
      { name: "연봉 표", href: "/table/annual" },
      { name: "월급 표", href: "/table/monthly" },
      { name: "주급 표", href: "/table/weekly" },
      { name: "시급 표", href: "/table/hourly" },
    ],
  },
  {
    name: "콘텐츠",
    type: "dropdown",
    items: [
      { name: "전체 가이드", href: "/guides" },
      { name: "자주 묻는 질문(Q&A)", href: "/qna" },
      { name: "용어 사전", href: "/glossary" },
    ],
  },
  { name: "연봉 비교", href: "/?tab=comparator", type: "link" },
  { name: "연봉 순위", href: "/?tab=rank", type: "link" },
];

export default function Header() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const handleDropdownToggle = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 로고/사이트 제목 영역 */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <h1
                className="text-sm sm:text-lg md:text-xl font-bold whitespace-nowrap"
                style={{ color: "#007FFF" }}
              >
                MoneySalary 대한민국 최고의 연봉 정보 사이트
              </h1>
            </Link>
          </div>

          {/* 메뉴 및 테마 토글 영역 */}
          <div className="flex flex-1 justify-end items-center min-w-0">
            {/* 메뉴 항목들을 담는 컨테이너 */}
            <div className="hidden md:flex items-center space-x-1">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onClick={() => handleDropdownToggle(item.name)}
                      className="flex items-center gap-1 py-2 px-3 text-sm lg:text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {item.name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-5 h-5 transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-gray-700 ${
                        openDropdown === item.name
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm ${
                            pathname === subItem.href
                              ? "font-bold text-signature-blue"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-2 px-3 text-sm lg:text-base font-medium border-b-2 ${
                      pathname === item.href
                        ? "border-signature-blue text-signature-blue"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
            {/* 모바일 햄버거 메뉴 */}
            <div className="md:hidden">
              <button
                onClick={() => handleDropdownToggle("mobile-menu")}
                className="p-2 rounded-md"
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
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
              {openDropdown === "mobile-menu" && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-gray-700">
                  {/* 'flat_map'을 올바른 'flatMap'으로 수정했습니다. */}
                  {navConfig
                    .flatMap((item) =>
                      item.type === "link" ? [item] : item.items
                    )
                    .map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 text-sm ${
                          pathname === subItem.href
                            ? "font-bold text-signature-blue"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                </div>
              )}
            </div>
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
