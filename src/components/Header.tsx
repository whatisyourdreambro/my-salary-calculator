// src/components/Header.tsx
//
// 메인 헤더 — 데스크톱 nav + 모바일 메뉴 통합.
// 동적 분기(isScrolled, pathname) 인라인 style은 hover handler와 결합돼 유지.
// Dropdown·MobileDropdown·navConfig는 별도 파일로 분리되어 있음.

"use client";

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { navConfig } from "./header/navConfig";
import { navConfigEn } from "./header/navConfigEn";
import DesktopDropdown from "./header/DesktopDropdown";
import MobileDropdown from "./header/MobileDropdown";
import ThemeToggle from "./header/ThemeToggle";
import LocaleSwitcher from "./header/LocaleSwitcher";
import HeaderSearch from "./header/HeaderSearch";
import FavoritesBadge from "./header/FavoritesBadge";

export default function Header() {
 const pathname = usePathname();
 // /en 트리는 영어 메뉴 — 영어판이 있는 페이지만 링크 (navConfigEn 주석 참고)
 const isEn = pathname === "/en" || pathname.startsWith("/en/");
 const activeNavConfig = isEn ? navConfigEn : navConfig;
 const dashboardLabel = isEn ? "Dashboard" : "대시보드";
 const mobileMenuAriaLabel = isEn ? "Open menu" : "메뉴 열기";
 const dashboardHref = "/dashboard";
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);

 // 2026-08-26 Phase 4 배포 2: framer useScroll → 순수 passive 리스너.
 // 루트 Header 의 framer import 는 전 페이지 First Load JS 에 실리므로 제거.
 // (동일 상태로의 setState 는 React 가 리렌더를 생략 — 스크롤당 비용 없음)
 useEffect(() => {
 const onScroll = () => setIsScrolled(window.scrollY > 20);
 onScroll(); // 앵커 진입 등 초기 스크롤 위치 반영
 window.addEventListener("scroll", onScroll, { passive: true });
 return () => window.removeEventListener("scroll", onScroll);
 }, []);

 useEffect(() => {
 setIsMobileMenuOpen(false);
 }, [pathname]);

 // 2026-08-24 점검: 배경·보더를 인라인 hex → Tailwind 클래스로 이전.
 // 인라인 스타일은 .dark 오버라이드가 닿지 않아 다크모드에서 헤더만 밝게 남던
 // 전 페이지 결함의 원인이었다 (클래스 방식은 FOUC 없이 테마 전환에 반응).
 const headerSurface = isScrolled || isMobileMenuOpen
 ? "bg-white/[0.92] dark:bg-slate-900/[0.92] border-canvas-200 dark:border-canvas-800"
 : "bg-canvas border-transparent";

 return (
 <>
 <header
 className={`header-slide-in fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${headerSurface}`}
 style={{
 backdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
 WebkitBackdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
 boxShadow: isScrolled ? "0 4px 24px -8px #0145F211" : "none",
 // CLS 방어: padding 고정 (스크롤 상태와 무관)
 padding: "12px 0",
 minHeight: 64,
 }}
 >
 <nav className="page-width" aria-label={isEn ? "Main menu" : "주 메뉴"}>
 <div className="flex items-center justify-between gap-2">
 {/* Logo */}
 <div className="flex-shrink-0 z-50">
 <Link href={isEn ? "/en" : "/"} className="flex items-center gap-2 no-underline">
 <Logo
 className="h-8 sm:h-9 w-auto text-electric"
 showText={true}
 />
 </Link>
 </div>

 {/* Desktop Nav — 6개 카테고리, lg(1024px)부터 노출. xl 에서 폰트·간격↑ */}
 <div className="hidden lg:flex items-center gap-0 xl:gap-0.5 flex-1 justify-center min-w-0">
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
 className={`px-2 xl:px-3 py-2 text-[13px] xl:text-[14px] font-semibold rounded-[10px] whitespace-nowrap no-underline transition-colors hover:bg-electric-5 hover:text-electric ${
 pathname === item.href
 ? "text-electric bg-electric-5"
 : "text-muted-blue"
 }`}
 >
 {item.name}
 </Link>
 )
 )}
 </div>

 {/* Right Actions */}
 <div className="flex items-center gap-2 z-50 flex-shrink-0">
 <HeaderSearch />
 <LocaleSwitcher />
 <ThemeToggle />
 {/* 즐겨찾기 배지 — 저장 0개면 미렌더 (재방문 루프 진입점) */}
 <FavoritesBadge />
 {/* Dashboard CTA — md+ 에서만 텍스트, sm 이하 아이콘만 */}
 <Link
 href={dashboardHref}
 aria-label={dashboardLabel}
 className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-bold text-white bg-electric border-2 border-electric rounded-xl no-underline whitespace-nowrap shadow-[0_4px_14px_-2px_#0145F233] hover:bg-canvas hover:text-electric transition-colors"
 >
 <LayoutDashboard size={14} aria-hidden="true" />
 <span className="hidden md:inline">{dashboardLabel}</span>
 </Link>

 {/* Mobile Menu Toggle — lg 미만에서 노출 */}
 <div className="lg:hidden">
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className={`flex items-center justify-center cursor-pointer p-2 rounded-[10px] border-none text-electric transition-colors hover:bg-electric-10 ${
 isMobileMenuOpen ? "bg-electric-10" : "bg-transparent"
 }`}
 aria-label={mobileMenuAriaLabel}
 aria-expanded={isMobileMenuOpen}
 aria-controls="mobile-nav-menu"
 >
 {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
 </button>
 </div>
 </div>
 </div>
 </nav>
 </header>

 {/* Mobile Menu — SEO: 항상 DOM에 렌더하고 열림/닫힘은 CSS(visibility/opacity)로만
 제어. 조건부 렌더({isMobileMenuOpen && ...})로 되돌리면 SSR HTML에서 내비 링크가
 사라져 크롤러가 못 보게 되므로 금지. invisible은 닫힘 상태 탭 포커스도 제외함 */}
 <div
 id="mobile-nav-menu"
 role="dialog"
 aria-modal="true"
 aria-label={isEn ? "Mobile menu" : "모바일 메뉴"}
 className={`lg:hidden fixed inset-0 z-40 pt-header overflow-y-auto bg-white/[0.97] dark:bg-slate-900/[0.97] transition-[opacity,visibility] duration-[180ms] ${
 isMobileMenuOpen
 ? "visible opacity-100"
 : "invisible opacity-0 pointer-events-none"
 }`}
 style={{
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
 className="flex items-center justify-center gap-2 w-full no-underline mb-5 p-4 text-base font-bold bg-electric text-white rounded-2xl border-2 border-electric shadow-[0_8px_24px_-4px_#0145F244] transition-colors hover:bg-canvas hover:text-electric"
 >
 <LayoutDashboard size={18} aria-hidden="true" />
 {isEn ? "Open My Dashboard" : "내 대시보드 열기"}
 </Link>

 {/* Nav items */}
 <nav
 aria-label={isEn ? "Main menu" : "주 메뉴"}
 className="bg-white rounded-[20px] overflow-hidden border-[1.5px] border-canvas"
 >
 {activeNavConfig.map((item) =>
 item.type === "link" ? (
 <Link
 key={item.href}
 href={item.href}
 aria-current={pathname === item.href ? "page" : undefined}
 onClick={() => setIsMobileMenuOpen(false)}
 className={`block no-underline border-b border-canvas-100 last:border-b-0 px-5 py-4 text-base font-semibold transition-colors ${
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
 </nav>
 </div>
 </div>
 </>
 );
}
