// src/components/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { LayoutDashboard } from "lucide-react";

type LinkItem = { name: string; href: string; type: "link" };
type DropdownItem = {
  name: string;
  type: "dropdown";
  items: { name: string; href: string }[];
};
type NavItem = LinkItem | DropdownItem;

const navConfig: NavItem[] = [
  {
    name: "연봉 계산기",
    type: "dropdown",
    items: [
      { name: "종합 계산기", href: "/?tab=salary" },
      { name: "퇴직금 계산기", href: "/?tab=severance" },
      { name: "프리랜서/알바", href: "/?tab=freelancer" },
      { name: "연말정산 계산기", href: "/year-end-tax" },
    ],
  },
  {
    name: "연봉 정보",
    type: "dropdown",
    items: [
      { name: "연봉 테이블", href: "/table/annual" },
      { name: "연봉 비교", href: "/?tab=comparator" },
      { name: "연봉 순위", href: "/?tab=rank" },
      { name: "미래 연봉 예측", href: "/?tab=future" },
    ],
  },
  {
    name: "금융 가이드",
    type: "dropdown",
    items: [
      { name: "전체 가이드", href: "/guides" },
      { name: "Q&A", href: "/qna" },
      { name: "용어 사전", href: "/glossary" },
    ],
  },
  {
    name: "생활 금융",
    type: "dropdown",
    items: [
      { name: "자동차 구매 계산기", href: "/car-loan" },
      { name: "FIRE 계산기", href: "/fire-calculator" },
      { name: "환율 영향 계산기", href: "/?tab=exchange" },
      { name: "급여명세서 생성기", href: "/?tab=paystub" },
    ],
  },
  {
    name: "커뮤니티",
    type: "dropdown",
    items: [
      { name: "연봉 MBTI", href: "/mbti-salary" },
      { name: "로또 번호 생성기", href: "/lotto" },
    ],
  },
];

export default function Header() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="w-full bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold whitespace-nowrap text-primary">
                Moneysalary
              </h1>
            </Link>
          </div>

          <div className="flex items-center">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.name ? null : item.name
                        )
                      }
                      className="flex items-center gap-1 py-2 px-3 text-sm lg:text-base font-medium text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {item.name}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${ openDropdown === item.name ? "rotate-180" : "" }`}>
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-card rounded-md shadow-lg border border-border transition-all duration-200 ${
                        openDropdown === item.name
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="p-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-md ${
                              pathname === subItem.href
                                ? "font-semibold text-primary"
                                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="py-2 px-3 text-sm lg:text-base font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 py-2 px-4 ml-4 text-sm lg:text-base font-bold text-primary-foreground bg-primary rounded-lg hover:brightness-95 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                마이 대시보드
              </Link>
            </div>

            <div className="flex items-center">
              <div className="ml-4">
                <ThemeToggle />
              </div>
              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-foreground/70"
                  aria-label="메뉴 열기"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in-up">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-base font-bold rounded-md bg-primary/10 text-primary"
            >
              <LayoutDashboard className="w-5 h-5" />
              마이 대시보드
            </Link>
            {navConfig.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium rounded-md text-foreground/80 hover:bg-accent"
                >
                  {item.name}
                </Link>
              ) : (
                <div key={item.name}>
                  <button
                    onClick={() =>
                      setOpenMobileDropdown(
                        openMobileDropdown === item.name ? null : item.name
                      )
                    }
                    className="w-full flex justify-between items-center px-4 py-3 text-base font-bold rounded-md hover:bg-accent"
                  >
                    <span>{item.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${ openMobileDropdown === item.name ? "rotate-180" : "" }`}>
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {openMobileDropdown === item.name && (
                    <div className="pl-5 mt-1 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block pl-5 pr-4 py-2 text-base rounded-md ${
                            pathname === subItem.href
                              ? "font-semibold text-primary bg-primary/10"
                              : "text-foreground/70 hover:bg-accent"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
