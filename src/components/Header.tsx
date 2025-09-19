"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";

// [수정] 메뉴 아이템에 대한 명확한 타입을 정의하여 'undefined' 오류를 해결합니다.
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // [수정] useEffect 의존성 배열에 누락된 값을 추가하여 React Hook 규칙을 준수합니다.
  useEffect(() => {
    // 페이지 경로가 변경되면 모든 메뉴를 닫습니다.
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-full.png"
                alt="Moneysalary Logo"
                width={180}
                height={36}
                priority
                // [수정] 이미지 크기를 조절하기 위해 className을 추가합니다.
                className="h-9 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navConfig.map((item) =>
              item.type === "dropdown" ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 py-2 px-3 text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200">
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
                  className={`py-2 text-base font-medium transition-colors duration-200 border-b-2 ${
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
          </div>

          <div className="flex items-center">
            <ThemeToggle />
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

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-dark-bg z-50 md:hidden">
          <div className="flex justify-between items-center h-16 px-4 border-b dark:border-gray-800">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-full.png"
                alt="Moneysalary Logo"
                width={180}
                height={36}
              />
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
          <div className="flex flex-col items-start px-4 py-6 space-y-4 overflow-y-auto h-[calc(100%-4rem)]">
            {navConfig.map((item) =>
              item.type === "dropdown" ? (
                <div key={item.name} className="w-full">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.name ? null : item.name
                      )
                    }
                    className="flex justify-between items-center w-full py-2 text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-signature-blue"
                  >
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
                  {openDropdown === item.name && (
                    <div className="pl-4 border-l border-gray-200 dark:border-gray-700 mt-2 space-y-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block py-1 text-base transition-colors ${
                            pathname === subItem.href
                              ? "font-bold text-signature-blue"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setOpenDropdown(null);
                          }}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="w-full py-2 text-lg font-bold text-gray-700 dark:text-gray-300 hover:text-signature-blue"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
