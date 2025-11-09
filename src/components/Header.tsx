"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { LayoutDashboard, ChevronDown, Menu, X } from "lucide-react";

type LinkItem = { name: string; href: string; type: "link" };
type DropdownItem = {
  name: string;
  type: "dropdown";
  items: { name: string; href: string }[];
};
type NavItem = LinkItem | DropdownItem;

const navConfig: NavItem[] = [
  {
    name: "커리어 플래너",
    href: "/pro/career-planner",
    type: "link"
  },
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
    name: "재미로 보는 금융",
    type: "dropdown",
    items: [
      { name: "내 월급으로 살 수 있는 것?", href: "/fun/what-to-buy" },
      { name: "소비 성향 테스트", href: "/fun/spending-test" },
      { name: "부자 DNA 테스트", href: "/fun/rich-dna-test" },
      { name: "내 연봉으로 환생한다면?", href: "/fun/reincarnation" },
      { name: "밈코인 투자 시뮬레이터", href: "/fun/meme-coin" },
      { name: "나의 금융 MBTI", href: "/fun/financial-mbti" },
      { name: "회사 탈출 계산기", href: "/fun/escape-plan" },
      { name: "오늘 점심 뭐 먹지?", href: "/fun/lunch-roulette" },
      { name: "행운의 로또 번호", href: "/lotto" },
    ],
  },
];

const Dropdown = ({ item, pathname }: { item: DropdownItem; pathname: string | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 py-2 px-3 text-base font-medium text-foreground/70 hover:text-foreground transition-colors">
        {item.name}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-card rounded-md shadow-lg border border-border"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileDropdown = ({ item, pathname }: { item: DropdownItem; pathname: string | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 text-base font-medium rounded-md hover:bg-accent"
      >
        <span>{item.name}</span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="w-full bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">
                Moneysalary
              </h1>
            </Link>
          </div>

          <div className="flex items-center">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <Dropdown key={item.name} item={item} pathname={pathname} />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="py-2 px-4 text-base font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 py-2 px-4 ml-4 text-base font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LayoutDashboard size={18} />
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
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 text-base font-bold rounded-md bg-primary/10 text-primary"
                >
                  <LayoutDashboard size={20} />
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
                    <MobileDropdown key={item.name} item={item} pathname={pathname} />
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
