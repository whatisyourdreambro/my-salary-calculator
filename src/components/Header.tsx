"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  // 이전 코드에서 누락되었던 일반 링크 항목들을 다시 추가합니다.
  { name: "연봉 비교", href: "/?tab=comparator", type: "link" },
  { name: "로또 생성기", href: "/lotto", type: "link" },
];

export default function Header() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const handleDropdownToggle = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <header className="w-full bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* 요청하신 텍스트로 수정하고, 모바일 화면을 위해 폰트 크기를 반응형으로 조절합니다. */}
              <h1
                className="text-md sm:text-xl font-bold whitespace-nowrap"
                style={{ color: "#007FFF" }}
              >
                MoneySalary 대한민국 최고의 연봉 정보 사이트
              </h1>
            </Link>
          </div>

          <div className="flex-1 flex justify-end md:justify-center items-center overflow-hidden">
            <div
              ref={navRef}
              className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto whitespace-nowrap scrollbar-hide"
            >
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {/* onMouseEnter (마우스 올렸을 때) 와 onClick (클릭했을 때) 이벤트를 모두 처리하도록 수정 */}
                    <button
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onClick={() => handleDropdownToggle(item.name)}
                      className="flex items-center gap-1 py-2 px-2 sm:px-3 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
                    <div
                      className={`absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden transition-all duration-200 ${
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
                  // 누락되었던 일반 링크(LinkItem) 렌더링 로직 추가
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-2 px-2 sm:px-3 text-sm sm:text-base font-medium transition-colors duration-200 border-b-2 ${
                      pathname === item.href ||
                      (item.href.startsWith("/?") &&
                        pathname === "/" &&
                        typeof window !== "undefined" &&
                        new URLSearchParams(
                          window.location.search
                        ).toString() ===
                          new URLSearchParams(
                            item.href.split("?")[1]
                          ).toString())
                        ? "border-signature-blue text-signature-blue"
                        : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}
