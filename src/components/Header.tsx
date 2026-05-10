// src/components/Header.tsx
//
// 메인 헤더 — 데스크톱 nav + 모바일 메뉴 통합.
// 동적 분기(isScrolled, pathname) 인라인 style은 hover handler와 결합돼 유지.
// Dropdown·MobileDropdown·navConfig는 별도 파일로 분리되어 있음.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
 motion,
 AnimatePresence,
 useScroll,
 useMotionValueEvent,
} from "framer-motion";
import Logo from "./Logo";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { navConfig } from "./header/navConfig";
import { navConfigEn } from "./header/navConfigEn";
import DesktopDropdown from "./header/DesktopDropdown";
import MobileDropdown from "./header/MobileDropdown";
import ThemeToggle from "./header/ThemeToggle";
import LocaleSwitcher from "./header/LocaleSwitcher";

export default function Header() {
 const pathname = usePathname();
 const isEnglish = pathname?.startsWith("/en") ?? false;
 const activeNavConfig = isEnglish ? navConfigEn : navConfig;
 const dashboardLabel = isEnglish ? "Dashboard" : "대시보드";
 const mobileMenuAriaLabel = isEnglish ? "Open menu" : "메뉴 열기";
 const dashboardHref = isEnglish ? "/en" : "/dashboard";
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isHidden, setIsHidden] = useState(false);
 const { scrollY } = useScroll();

 // 토스/카카오뱅크 패턴: 아래로 스크롤하면 헤더 숨김, 위로 스크롤하면 즉시 노출.
 // 모바일 메뉴 열림 상태에서는 절대 숨기지 않음.
 useMotionValueEvent(scrollY, "change", (latest) => {
 setIsScrolled(latest > 20);
 const previous = scrollY.getPrevious() ?? 0;
 if (isMobileMenuOpen) {
 setIsHidden(false);
 return;
 }
 if (latest > previous && latest > 200) {
 setIsHidden(true);
 } else if (latest < previous) {
 setIsHidden(false);
 }
 });

 useEffect(() => {
 setIsMobileMenuOpen(false);
 }, [pathname]);

 const headerBg = isScrolled || isMobileMenuOpen
 ? "rgba(255,255,255,0.92)"
 : "#EDF1F5";
 const headerBorder = isScrolled || isMobileMenuOpen
 ? "#DDE4EC"
 : "transparent";

 return (
 <>
 <motion.header
 className="fixed top-0 left-0 right-0 z-50"
 style={{
 backgroundColor: headerBg,
 borderBottom: `1px solid ${headerBorder}`,
 backdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
 WebkitBackdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
 boxShadow: isScrolled ? "0 4px 24px -8px #0145F211" : "none",
 padding: isScrolled ? "10px 0" : "18px 0",
 transition: "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, padding 0.25s ease",
 }}
 initial={{ y: -100 }}
 animate={{ y: isHidden ? -120 : 0 }}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
 >
 <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label={isEnglish ? "Main navigation" : "주 메뉴"}>
 <div className="flex items-center justify-between gap-2">
 {/* Logo — 호버 시 미세한 spring scale */}
 <motion.div
 className="flex-shrink-0 z-50"
 whileHover={{ scale: 1.03 }}
 whileTap={{ scale: 0.97 }}
 transition={{ type: "spring", stiffness: 400, damping: 22 }}
 >
 <Link href="/" className="flex items-center gap-2 no-underline" aria-label="머니샐러리 홈">
 <Logo
 className="h-9 sm:h-10 w-auto"
 showText={true}
 style={{ color: "#0145F2" }}
 />
 </Link>
 </motion.div>

 {/* Desktop Nav — 5개 카테고리, lg(1024px)부터 노출
       활성 링크에 motion layoutId underline indicator (탭 전환 부드러움) */}
 <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
 {activeNavConfig.map((item) =>
 item.type === "dropdown" ? (
 <DesktopDropdown
 key={item.name}
 item={item}
 pathname={pathname}
 />
 ) : (
 <Link
 key={item.name}
 href={item.href}
 aria-current={pathname === item.href ? "page" : undefined}
 className={`relative px-[11px] py-[7px] text-[13.5px] font-semibold rounded-[10px] whitespace-nowrap no-underline transition-colors hover:bg-electric-5 hover:text-electric no-tap-highlight ${
 pathname === item.href
 ? "text-electric"
 : "text-muted-blue"
 }`}
 >
 {item.name}
 {pathname === item.href && (
 <motion.span
 layoutId="header-active-indicator"
 className="absolute inset-0 -z-10 rounded-[10px] bg-electric-5"
 transition={{ type: "spring", stiffness: 380, damping: 30 }}
 />
 )}
 </Link>
 )
 )}
 </div>

 {/* Right Actions */}
 <div className="flex items-center gap-2 z-50 flex-shrink-0">
 <LocaleSwitcher />
 <ThemeToggle />
 {/* Dashboard CTA — md+ 에서만 텍스트, sm 이하 아이콘만 */}
 <motion.div
 whileHover={{ scale: 1.03, y: -1 }}
 whileTap={{ scale: 0.96 }}
 transition={{ type: "spring", stiffness: 400, damping: 22 }}
 >
 <Link
 href={dashboardHref}
 aria-label={dashboardLabel}
 className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-bold text-white bg-electric border-2 border-electric rounded-xl no-underline whitespace-nowrap shadow-[0_4px_14px_-2px_#0145F233] hover:shadow-[0_6px_20px_-2px_#0145F255] hover:bg-canvas hover:text-electric transition-all duration-200 no-tap-highlight"
 >
 <LayoutDashboard size={14} aria-hidden="true" />
 <span className="hidden md:inline">{dashboardLabel}</span>
 </Link>
 </motion.div>

 {/* Mobile Menu Toggle — lg 미만에서 노출 (X/Menu 아이콘 회전 트랜지션) */}
 <div className="lg:hidden">
 <motion.button
 type="button"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className={`relative flex items-center justify-center cursor-pointer p-2 rounded-[10px] border-none text-electric transition-colors hover:bg-electric-10 no-tap-highlight overflow-hidden ${
 isMobileMenuOpen ? "bg-electric-10" : "bg-transparent"
 }`}
 aria-label={mobileMenuAriaLabel}
 aria-expanded={isMobileMenuOpen}
 aria-controls="mobile-nav-menu"
 whileTap={{ scale: 0.92 }}
 transition={{ type: "spring", stiffness: 400, damping: 25 }}
 >
 <AnimatePresence mode="wait" initial={false}>
 <motion.span
 key={isMobileMenuOpen ? "close" : "open"}
 initial={{ rotate: -90, opacity: 0 }}
 animate={{ rotate: 0, opacity: 1 }}
 exit={{ rotate: 90, opacity: 0 }}
 transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
 className="flex items-center justify-center"
 >
 {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
 </motion.span>
 </AnimatePresence>
 </motion.button>
 </div>
 </div>
 </div>
 </nav>
 </motion.header>

 {/* Mobile Menu — 토스 스타일 부드러운 spring + 자식 stagger */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 id="mobile-nav-menu"
 role="dialog"
 aria-modal="true"
 aria-label={isEnglish ? "Mobile navigation" : "모바일 메뉴"}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="lg:hidden fixed inset-0 z-40 pt-20 overflow-y-auto"
 style={{
 backgroundColor: "rgba(255,255,255,0.97)",
 backdropFilter: "blur(24px)",
 WebkitBackdropFilter: "blur(24px)",
 }}
 >
 <motion.div
 className="px-5 pt-4 pb-20"
 initial="hidden"
 animate="show"
 variants={{
 hidden: {},
 show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
 }}
 >
 {/* Locale Switcher (mobile) */}
 <motion.div
 variants={{
 hidden: { opacity: 0, y: 12 },
 show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
 }}
 >
 <LocaleSwitcher variant="mobile" />
 </motion.div>

 {/* Mobile Dashboard CTA */}
 <motion.div
 variants={{
 hidden: { opacity: 0, y: 12 },
 show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
 }}
 whileTap={{ scale: 0.98 }}
 >
 <Link
 href={dashboardHref}
 onClick={() => setIsMobileMenuOpen(false)}
 className="flex items-center justify-center gap-2 w-full no-underline mb-5 p-4 text-base font-bold bg-electric text-white rounded-2xl border-2 border-electric shadow-[0_8px_24px_-4px_#0145F244] hover:shadow-[0_12px_32px_-4px_#0145F255] hover:bg-canvas hover:text-electric transition-all duration-200 no-tap-highlight"
 >
 <LayoutDashboard size={18} aria-hidden="true" />
 {isEnglish ? "Open Dashboard" : "내 대시보드 열기"}
 </Link>
 </motion.div>

 {/* Nav items — 각 항목 순차 등장 */}
 <motion.nav
 aria-label={isEnglish ? "Main navigation" : "주 메뉴"}
 className="bg-white rounded-[20px] overflow-hidden border-[1.5px] border-canvas"
 variants={{
 hidden: { opacity: 0, y: 12 },
 show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
 }}
 >
 {activeNavConfig.map((item) =>
 item.type === "link" ? (
 <Link
 key={item.href}
 href={item.href}
 aria-current={pathname === item.href ? "page" : undefined}
 onClick={() => setIsMobileMenuOpen(false)}
 className={`block no-underline border-b border-canvas-100 last:border-b-0 px-5 py-4 text-base font-semibold transition-colors no-tap-highlight active:bg-electric-10 ${
 pathname === item.href
 ? "text-electric bg-electric-5"
 : "text-navy hover:bg-electric-5"
 }`}
 >
 {item.name}
 </Link>
 ) : (
 <MobileDropdown
 key={item.name}
 item={item}
 pathname={pathname}
 onClose={() => setIsMobileMenuOpen(false)}
 />
 )
 )}
 </motion.nav>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}
