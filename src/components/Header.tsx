"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

type LinkItem = {
  name: string;
  href: string;
  type: "link";
};

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
      { name: "머니 Q&A 커뮤니티", href: "/community" },
      { name: "자주 묻는 질문(Q&A)", href: "/qna" },
      { name: "용어 사전", href: "/glossary" },
    ],
  },
  { name: "연봉 비교", href: "/?tab=comparator", type: "link" },
  { name: "로또 생성기", href: "/lotto", type: "link" },
];

export default function Header() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* h-16 -> h-24 로 헤더 높이 증가, flex-col md:flex-row 로 모바일에서 세로 정렬 */}
        <div className="flex flex-col md:flex-row justify-between items-center h-24">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* 로고 Image 컴포넌트를 h1 텍스트로 교체 */}
              <h1 className="text-xl font-bold text-signature-blue py-2">
                MoneySalary 대한민국 최고의 연봉 계산기
              </h1>
            </Link>
          </div>

          {/* hidden md:flex 클래스를 제거하여 항상 메뉴가 보이도록 수정 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {navConfig.map((item) =>
              item.type === "dropdown" ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 px-1 sm:px-3 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200">
                    {item.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-5 h-5 transition-transform duration-200 ${
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
                    className={`absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                      openDropdown === item.name
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-2 invisible"
                    }`}
                  >
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === subItem.href
                            ? "font-bold text-signature-blue bg-gray-50 dark:bg-gray-800"
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
                  className={`py-2 text-sm sm:text-base font-medium transition-colors duration-200 border-b-2 ${
                    pathname === item.href ||
                    (item.href.startsWith("/?") &&
                      pathname === "/" &&
                      typeof window !== "undefined" &&
                      new URLSearchParams(window.location.search).toString() ===
                        new URLSearchParams(item.href.split("?")[1]).toString())
                      ? "border-signature-blue text-signature-blue"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
            {/* ThemeToggle을 메뉴 항목들과 함께 배치 */}
            <ThemeToggle />
          </div>

          {/* 모바일 햄버거 메뉴 버튼과 메뉴 패널 전체를 삭제 */}
        </div>
      </nav>
    </header>
  );
}
