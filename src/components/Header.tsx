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
        className={`flex items-center gap-1 py-2 px-4 text-[15px] font-semibold transition-colors duration-200
          ${isOpen ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}
        `}
      >
        {item.name}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-white rounded-[20px] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-2 z-50"
          >
            <div className="flex flex-col gap-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-2.5 text-[14px] rounded-[12px] transition-all font-medium ${pathname === subItem.href
                    ? "font-bold text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
    <div className="border-b border-slate-100 last:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-4 text-[16px] font-semibold hover:bg-slate-50 transition-colors"
      >
        <span className={isOpen ? "text-blue-600" : "text-slate-800"}>{item.name}</span>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="py-2 px-4 space-y-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`block px-4 py-3 text-[15px] rounded-[14px] transition-all font-medium ${pathname === subItem.href
                    ? "font-bold text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
          ? "bg-white/70 dark:bg-[#1E232E]/70 backdrop-blur-3xl border-b border-slate-200/40 dark:border-slate-700/50 shadow-[0_4px_30px_#0000000A] py-3"
          : "bg-transparent border-b border-transparent py-5"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo Area */}
            <div className="flex-shrink-0 z-50">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative transition-transform duration-300 active:scale-95">
                  <Logo className="h-8 sm:h-9 w-auto text-slate-900" showText={true} />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navConfig.map((item) =>
                item.type === "dropdown" ? (
                  <Dropdown key={item.name} item={item} pathname={pathname} isScrolled={isScrolled} />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`py-2 px-4 text-[15px] font-semibold transition-colors duration-200 rounded-[12px] hover:bg-slate-50 ${pathname === item.href
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                      }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 z-50">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 py-2 px-5 text-[14px] font-bold text-white bg-blue-600 rounded-[14px] hover:bg-blue-700 active:scale-95 transition-all shadow-[0_4px_12px_rgba(49,130,246,0.2)]"
              >
                <LayoutDashboard size={16} />
                <span>내 대시보드</span>
              </Link>

              <div className="xl:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
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
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl xl:hidden pt-24"
          >
            <div className="h-full overflow-y-auto pb-20 px-6">
              <div className="py-2 space-y-4">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 text-[16px] font-bold rounded-[16px] bg-blue-600 text-white shadow-[0_8px_20px_rgba(49,130,246,0.25)] mb-8 active:scale-95 transition-transform"
                >
                  <LayoutDashboard size={18} />
                  내 대시보드 열기
                </Link>

                <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  {navConfig.map((item) =>
                    item.type === "link" ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-4 text-[16px] font-semibold border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors text-slate-800"
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