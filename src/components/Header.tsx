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
 const { scrollY } = useScroll();

 useMotionValueEvent(scrollY, "change", (latest) => {
 setIsScrolled(latest > 20);
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
 transition: "all 0.3s ease",
 }}
 initial={{ y: -100 }}
 animate={{ y: 0 }}
 transition={{ duration: 0.5, ease: "circOut" }}
 >
 <nav className="max-w-7xl mx-auto px-4 sm:px-6">
 <div className="flex items-center justify-between gap-2">
 {/* Logo */}
 <div className="flex-shrink-0 z-50">
 <Link href="/" className="flex items-center gap-2 no-underline">
 <Logo
 className="h-8 sm:h-9 w-auto"
 showText={true}
 style={{ color: "#0145F2" }}
 />
 </Link>
 </div>

 {/* Desktop Nav — 5개 카테고리, lg(1024px)부터 노출 */}
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
 style={{
 padding: "7px 11px",
 fontSize: "13.5px",
 fontWeight: 600,
 borderRadius: "10px",
 color: pathname === item.href ? "#0145F2" : "#3D5E78",
 backgroundColor:
 pathname === item.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
 transition: "color 0.15s ease, background-color 0.15s ease",
 whiteSpace: "nowrap",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLElement).style.color = "#0145F2";
 (e.currentTarget as HTMLElement).style.backgroundColor = "#0145F20D";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLElement).style.color =
 pathname === item.href ? "#0145F2" : "#3D5E78";
 (e.currentTarget as HTMLElement).style.backgroundColor =
 pathname === item.href ? "#0145F20D" : "transparent";
 }}
 >
 {item.name}
 </Link>
 )
 )}
 </div>

 {/* Right Actions */}
 <div className="flex items-center gap-2 z-50 flex-shrink-0">
 <LocaleSwitcher />
 <ThemeToggle />
 {/* Dashboard CTA — md+ 에서만 텍스트, sm 이하 아이콘만 */}
 <Link
 href={dashboardHref}
 aria-label={dashboardLabel}
 className="hidden sm:inline-flex items-center"
 style={{
 gap: "6px",
 padding: "8px 14px",
 fontSize: "13.5px",
 fontWeight: 700,
 color: "#FFFFFF",
 backgroundColor: "#0145F2",
 border: "2px solid #0145F2",
 borderRadius: "12px",
 textDecoration: "none",
 transition: "background-color 0.15s ease, color 0.15s ease",
 boxShadow: "0 4px 14px -2px #0145F233",
 whiteSpace: "nowrap",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor = "#EDF1F5";
 (e.currentTarget as HTMLElement).style.color = "#0145F2";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor = "#0145F2";
 (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
 }}
 >
 <LayoutDashboard size={14} />
 <span className="hidden md:inline">{dashboardLabel}</span>
 </Link>

 {/* Mobile Menu Toggle — lg 미만에서 노출 */}
 <div className="lg:hidden">
 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="flex items-center justify-center cursor-pointer"
 style={{
 padding: "8px",
 borderRadius: "10px",
 backgroundColor: isMobileMenuOpen ? "#0145F21A" : "transparent",
 border: "none",
 color: "#0145F2",
 transition: "background-color 0.15s ease",
 }}
 aria-label={mobileMenuAriaLabel}
 >
 {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
 </button>
 </div>
 </div>
 </div>
 </nav>
 </motion.header>

 {/* Mobile Menu */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.18 }}
 className="lg:hidden fixed inset-0 z-40 pt-20 overflow-y-auto"
 style={{
 backgroundColor: "rgba(255,255,255,0.97)",
 backdropFilter: "blur(24px)",
 WebkitBackdropFilter: "blur(24px)",
 }}
 >
 <div className="px-5 pt-4 pb-20">
 {/* Locale Switcher (mobile) */}
 <LocaleSwitcher variant="mobile" />
 {/* Mobile Dashboard CTA */}
 <Link
 href={dashboardHref}
 onClick={() => setIsMobileMenuOpen(false)}
 className="flex items-center justify-center gap-2 w-full no-underline mb-5"
 style={{
 padding: "16px",
 fontSize: "16px",
 fontWeight: 700,
 backgroundColor: "#0145F2",
 color: "#FFFFFF",
 borderRadius: "16px",
 border: "2px solid #0145F2",
 boxShadow: "0 8px 24px -4px #0145F244",
 transition: "all 0.15s ease",
 }}
 >
 <LayoutDashboard size={18} />
 {isEnglish ? "Open Dashboard" : "내 대시보드 열기"}
 </Link>

 {/* Nav items */}
 <div
 className="bg-white rounded-[20px] overflow-hidden"
 style={{ border: "1.5px solid #DDE4EC" }}
 >
 {activeNavConfig.map((item) =>
 item.type === "link" ? (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setIsMobileMenuOpen(false)}
 className="block no-underline border-b border-canvas-100 last:border-b-0"
 style={{
 padding: "16px 20px",
 fontSize: "16px",
 fontWeight: 600,
 color: pathname === item.href ? "#0145F2" : "#0A1829",
 backgroundColor:
 pathname === item.href ? "#0145F20D" : "transparent",
 transition: "color 0.12s ease",
 }}
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
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}
