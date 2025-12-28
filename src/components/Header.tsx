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
      { name: "랜덤 뽑기", href: "/fun/random-draw" },
      { name: "주말 당직 게임", href: "/fun/weekend-duty" },
      { name: "MBTI 연봉 순위", href: "/fun/mbti-salary" },
      { name: "연봉 배틀", href: "/fun/salary-battle" },
      { name: "이상형 월드컵", href: "/fun/worldcup" },
      { name: "테트리스", href: "/fun/tetris" },
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
        className={`flex items-center gap-1 py-2 px-3 text-[15px] font-medium transition-all duration-300 rounded-full group
          ${isOpen ? "bg-primary/10 text-primary" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}
        `}
      >
        {item.name}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(5px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 glass-card rounded-2xl p-2 z-50 shadow-2xl ring-1 ring-white/20 dark:ring-white/10"
          >
            <div className="flex flex-col gap-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-3 text-sm rounded-xl transition-all ${pathname === subItem.href
                    ? "font-semibold text-primary bg-primary/10"
                    : "text-foreground/80 hover:bg-primary/5 hover:text-primary hover:translate-x-1"
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
        className="w-full flex justify-between items-center px-4 py-4 text-base font-medium hover:bg-accent/30 transition-colors"
      >
        <span className={isOpen ? "text-primary" : "text-foreground/90"}>{item.name}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-accent/20"
          >
            <div className="py-2 px-4 space-y-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-3 text-sm rounded-lg transition-all ${pathname === subItem.href
                    ? "font-semibold text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-primary hover:bg-accent/50"
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen
          ? "bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-lg supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent border-b border-transparent"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo Area */}
            <div className="flex-shrink-0 z-50">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                  <Logo className="h-10 w-auto" showText={true} />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden xl:flex items-center gap-1">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <Dropdown key={item.name} item={item} pathname={pathname} isScrolled={isScrolled} />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-2 px-4 text-[15px] font-medium rounded-full transition-all duration-300 ${pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                      }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 z-50">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 py-2.5 px-5 text-sm font-bold text-primary-foreground bg-primary rounded-full shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:bg-primary/90 hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all"
              >
                <LayoutDashboard size={18} />
                <span className="hidden lg:inline">대시보드</span>
              </Link>



              <div className="xl:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 rounded-full hover:bg-accent/50 transition-colors text-foreground/80"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl xl:hidden pt-20"
          >
            <div className="h-full overflow-y-auto pb-20">
              <div className="px-4 py-2 space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 text-lg font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-6"
                >
                  <LayoutDashboard size={20} />
                  마이 대시보드
                </Link>

                <div className="bg-card/50 rounded-2xl overflow-hidden border border-border/40">
                  {navConfig.map((item) =>
                    item.type === "link" ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-4 text-base font-medium border-b border-border/30 last:border-none hover:bg-accent/30 transition-colors text-foreground/90"
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
