// src/components/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Logo from "./Logo";
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
      { name: "기업별 연봉 DB", href: "/salary-db" },
      { name: "내 연봉 제보하기", href: "/salary-db/submit" },
      { name: "2025 연봉 표", href: "/table/annual" },
      { name: "2025 월급 표", href: "/table/monthly" },
      { name: "2026 연봉 표", href: "/table/2026/annual" },
      { name: "2026 월급 표", href: "/table/2026/monthly" },
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
    name: "Fun/Lab",
    type: "dropdown",
    items: [
      { name: "전체 보기", href: "/fun" },
      { name: "멘사급 IQ 테스트", href: "/fun/iq-test" },
      { name: "부자 DNA 테스트", href: "/fun/rich-dna-test" },
      { name: "연봉 상위 1% 계산기", href: "/fun/rank" },
      { name: "인생 2회차 게임", href: "/fun/reincarnation" },
      { name: "월급쟁이 테트리스", href: "/fun/tetris" },
    ],
  },
  {
    name: "계산기 도구",
    type: "dropdown",
    items: [
      { name: "전체 보기", href: "/tools" },
      { name: "대출 이자 계산기", href: "/tools/loan" },
      { name: "예적금 계산기", href: "/tools/deposit" },
      { name: "부가세(VAT) 계산기", href: "/tools/finance/vat" },
      { name: "BMI 비만도 계산기", href: "/tools/health/bmi" },
      { name: "부동산 계산기", href: "/tools/real-estate/dsr" },
    ],
  },
  {
    name: "생활 금융",
    type: "dropdown",
    items: [
      { name: "자동차 구매", href: "/car-loan" },
      { name: "FIRE 계산기", href: "/fire-calculator" },
      { name: "로또 번호 생성", href: "/lotto" },
    ],
  },
];

const Dropdown = ({ item, pathname, isScrolled }: { item: DropdownItem; pathname: string | null; isScrolled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-1 py-2 px-4 text-[15px] font-medium transition-all duration-300 font-sans tracking-wide
          ${isOpen ? "text-primary" : "text-foreground/80 hover:text-primary"}
        `}
      >
        {item.name}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 glass-card p-3 z-50 rounded-xl border border-stone-200/50 dark:border-stone-800/50 shadow-2xl"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1C1917] rotate-45 border-t border-l border-stone-200/50 dark:border-stone-800/50" />
            <div className="relative z-10 flex flex-col gap-1 bg-white/50 dark:bg-[#1C1917]/50 rounded-lg p-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-3 text-sm rounded-lg transition-all font-sans ${pathname === subItem.href
                    ? "font-bold text-primary bg-primary/5"
                    : "text-foreground/70 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-primary hover:pl-5"
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
    <div className="border-b border-border/30 last:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-4 text-base font-medium hover:bg-accent/5 transition-colors font-sans"
      >
        <span className={isOpen ? "text-primary font-bold" : "text-foreground/90"}>{item.name}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-stone-50/50 dark:bg-stone-900/50"
          >
            <div className="py-2 px-4 space-y-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-3 text-sm rounded-lg transition-all font-sans ${pathname === subItem.href
                    ? "font-bold text-primary bg-primary/5"
                    : "text-foreground/70 hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
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
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled || isMobileMenuOpen
          ? "bg-background/90 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm py-2"
          : "bg-transparent border-b border-transparent py-4"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo Area */}
            <div className="flex-shrink-0 z-50">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative transition-transform duration-500 group-hover:scale-105">
                  <Logo className="h-8 sm:h-10 w-auto" showText={true} />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden xl:flex items-center gap-2">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <Dropdown key={item.name} item={item} pathname={pathname} isScrolled={isScrolled} />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-2 px-4 text-[15px] font-medium transition-all duration-300 font-sans tracking-wide relative group ${pathname === item.href
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                      }`}
                  >
                    {item.name}
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${pathname === item.href ? "w-1/2" : "w-0 group-hover:w-1/3"}`} />
                  </Link>
                )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 z-50">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 py-2.5 px-6 text-sm font-bold text-accent-foreground bg-accent rounded-full hover:bg-accent/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-sans tracking-wide shadow-md shadow-accent/20"
              >
                <LayoutDashboard size={16} />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>

              <div className="xl:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-foreground/80"
                  aria-label="메뉴 열기"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl xl:hidden pt-24"
          >
            <div className="h-full overflow-y-auto pb-20">
              <div className="px-6 py-2 space-y-4">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 text-lg font-bold rounded-xl bg-accent text-accent-foreground shadow-xl shadow-accent/20 mb-8 font-serif"
                >
                  <LayoutDashboard size={20} />
                  My Dashboard
                </Link>

                <div className="bg-white/50 dark:bg-stone-900/50 rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                  {navConfig.map((item) =>
                    item.type === "link" ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-4 text-base font-medium border-b border-border/30 last:border-none hover:bg-stone-100/50 transition-colors text-foreground/90 font-sans"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <MobileDropdown key={item.name} item={item} pathname={pathname} />
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
