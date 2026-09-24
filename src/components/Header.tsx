// src/components/Header.tsx
//
// 메인 헤더 — 데스크톱 nav + 모바일 메뉴 통합.
// 동적 분기(isScrolled, pathname) 인라인 style은 hover handler와 결합돼 유지.
// Dropdown·MobileDropdown·navConfig는 별도 파일로 분리되어 있음.

"use client";

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useModalDialog } from "@/hooks/useModalDialog";
import { subscribeMediaQuery } from "@/lib/mediaQueryListener";
import Logo from "./Logo";
import { CircleCheck, Clock3, LayoutDashboard, Menu, X } from "lucide-react";
import { navConfig } from "./header/navConfig";
import { navConfigEn } from "./header/navConfigEn";
import DesktopDropdown from "./header/DesktopDropdown";
import MobileDropdown from "./header/MobileDropdown";
import ThemeToggle from "./header/ThemeToggle";
import LocaleSwitcher from "./header/LocaleSwitcher";
import HeaderSearch from "./header/HeaderSearch";
import FavoritesBadge from "./header/FavoritesBadge";
import { isEdgeRenderedPath } from "@/lib/edgeRenderedPaths";

export default function Header() {
 const pathname = usePathname();
 // 2026-09-23 CPU 한도(1102) 대응: 요청마다 Worker 에서 SSR 되는 경로(공유·용어집·QnA 상세)는
 // 메가메뉴 패널(데스크톱 7개 + 모바일 dialog 7개, ~330KB·SVG 350개)을 매 요청 React 로 그려
 // 무료 플랜 CPU 10ms 를 넘겼다. 그 경로에서만 패널 내용을 하이드레이션 뒤 렌더한다 —
 // 상단 바·드롭다운 트리거·dialog 골격은 SSR 그대로라 화면·접근성 트리는 동일하고,
 // 서버와 클라이언트 첫 렌더가 모두 "패널 비움"이라 하이드레이션 불일치도 없다.
 // 프리렌더 페이지(~2,000)는 종전대로 전체 패널을 SSR 한다(내부 링크 크롤 경로 불변).
 const [isHydrated, setIsHydrated] = useState(false);
 useEffect(() => { setIsHydrated(true); }, []);
 const deferPanels = isEdgeRenderedPath(pathname) && !isHydrated;
 // /en 트리는 영어 메뉴 — 영어판이 있는 페이지만 링크 (navConfigEn 주석 참고)
 const isEn = pathname === "/en" || pathname.startsWith("/en/");
 const activeNavConfig = isEn ? navConfigEn : navConfig;
 const dashboardLabel = isEn ? "Dashboard" : "대시보드";
 const mobileMenuAriaLabel = isEn ? "Open menu" : "메뉴 열기";
 const dashboardHref = isEn ? "/en/dashboard" : "/dashboard";
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const mobileDialog = useRef<HTMLDialogElement>(null);
 useModalDialog(isMobileMenuOpen, mobileDialog);

 useEffect(() => {
 const wide = window.matchMedia("(min-width: 1280px)");
 const closeOnDesktop = () => { if (wide.matches) setIsMobileMenuOpen(false); };
 // Safari 13 이하엔 MediaQueryList.addEventListener 가 없다 → addListener 폴백(루트 레이아웃 throw 방지).
 return subscribeMediaQuery(wide, closeOnDesktop);
 }, []);

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
 ? "bg-card border-border"
 : "bg-background border-border";

 return (
 <>
 <header
 lang={isEn ? "en" : "ko"}
 className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-150 motion-reduce:transition-none ${headerSurface}`}
 style={{
 boxShadow: isScrolled ? "0 4px 16px -12px rgb(15 23 42 / 0.25)" : "none",
 // CLS 방어: padding 고정 (스크롤 상태와 무관)
 padding: "12px 0",
 minHeight: 64,
 }}
 >
 <nav className="page-width max-w-[96rem]" aria-label={isEn ? "Main menu" : "주 메뉴"}>
 <div className="flex items-center justify-between gap-2">
 {/* Logo */}
 <div className="flex-shrink-0 z-50">
 <Link href={isEn ? "/en" : "/"} aria-label={isEn ? "Money Salary home" : "Money Salary — 머니샐러리 홈"} className="ms-interactive hover:!translate-y-0 hover:!shadow-none flex min-h-11 items-center gap-2 rounded-lg no-underline">
 <Logo className="h-8 w-8 min-[480px]:hidden text-electric" />
 <Logo
 className="hidden min-[480px]:block h-8 sm:h-9 w-auto text-electric"
 showText={true}
 />
 </Link>
 </div>

 {/* Desktop navigation and the money checklist shortcut. */}
 <div className="hidden xl:flex items-center gap-0 2xl:gap-0.5 flex-1 justify-center min-w-0">
 {activeNavConfig.map((item) =>
 item.type === "dropdown" ? (
 <DesktopDropdown
 key={item.name}
 item={item}
 pathname={pathname}
 locale={isEn ? "en" : "ko"}
 deferPanel={deferPanels}
 />
 ) : (
 <Link
 key={item.name}
 href={item.href}
 data-msy-module={item.href === "/work-clock" ? "header-work-clock" : item.featured ? "header-money-check" : undefined}
 aria-current={pathname === item.href ? "page" : undefined}
 className={`ms-interactive hover:!translate-y-0 hover:!shadow-none inline-flex min-h-11 items-center gap-1.5 px-2 2xl:px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap no-underline hover:bg-secondary hover:text-link ${
 item.featured || pathname === item.href
 ? "text-link bg-accent font-semibold"
 : "text-muted-foreground"
 }`}
 >
 {item.featured && <CircleCheck size={15} aria-hidden="true" />}
 {item.href === "/work-clock" && <Clock3 size={15} aria-hidden="true" />}
 {item.name}
 </Link>
 )
 )}
 </div>

 {/* Right Actions */}
 <div className="flex items-center gap-1 sm:gap-2 z-50 flex-shrink-0">
 {!isEn && <Link
 href="/work-clock"
 aria-label="월급 시계"
 data-msy-module="header-work-clock"
 aria-current={pathname === "/work-clock" ? "page" : undefined}
 className="ms-interactive hover:!translate-y-0 hover:!shadow-none inline-flex xl:hidden min-h-11 items-center justify-center gap-1 rounded-xl border border-border bg-accent px-2 text-xs font-semibold text-link no-underline whitespace-nowrap"
 >
 <Clock3 size={15} aria-hidden="true" /><span className="hidden min-[360px]:inline">월급 시계</span>
 </Link>}
 <HeaderSearch />
 {/* Compact headers keep language and saved pages accessible from the menu. */}
 <div className="hidden lg:block"><LocaleSwitcher /></div>
 <ThemeToggle />
 {/* 즐겨찾기 배지 — 저장 0개면 미렌더 (재방문 루프 진입점) */}
 <div className="hidden 2xl:block"><FavoritesBadge /></div>
 {/* Dashboard CTA — compact phones use the menu; wide desktops add the label. */}
 <Link
 href={dashboardHref}
 aria-label={dashboardLabel}
 className="ms-interactive hover:!translate-y-0 hover:!shadow-none hidden md:inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground bg-secondary border border-border rounded-xl no-underline whitespace-nowrap hover:bg-accent"
 >
 <LayoutDashboard size={14} aria-hidden="true" />
 <span className="hidden 2xl:inline">{dashboardLabel}</span>
 </Link>

 {/* Mobile Menu Toggle — xl(1280px) 미만에서 노출 */}
 <div className="xl:hidden">
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className={`ms-interactive hover:!translate-y-0 hover:!shadow-none flex min-w-11 min-h-11 items-center justify-center cursor-pointer p-2 rounded-xl border-none text-foreground transition-colors hover:bg-secondary ${
 isMobileMenuOpen ? "bg-secondary" : "bg-transparent"
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

 {/* Keep navigation links in server HTML; native dialog manages modal keyboard behavior. */}
 <dialog
 ref={mobileDialog}
 id="mobile-nav-menu"
 lang={isEn ? "en" : "ko"}
 onCancel={(event) => { event.preventDefault(); setIsMobileMenuOpen(false); }}
 aria-label={isEn ? "Mobile menu" : "모바일 메뉴"}
 className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none overflow-y-auto overscroll-contain border-0 bg-card text-foreground backdrop:bg-black/40"
 style={{
 paddingTop: "env(safe-area-inset-top, 0)",
 paddingBottom: "env(safe-area-inset-bottom, 0)",
 }}
 >
 <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
 <p className="font-bold">{isEn ? "Explore Moneysalary" : "머니샐러리 메뉴"}</p>
 <button type="button" autoFocus onClick={() => setIsMobileMenuOpen(false)} aria-label={isEn ? "Close menu" : "메뉴 닫기"} className="ms-button ms-button-ghost min-h-11 min-w-11 !p-2">
 <X size={22} aria-hidden="true" />
 </button>
 </div>
 <div className="px-5 pt-4 pb-20">
 {/* Locale Switcher (mobile) */}
 <LocaleSwitcher variant="mobile" />
 {/* Mobile Dashboard CTA */}
 <Link
 href={dashboardHref}
 onClick={() => setIsMobileMenuOpen(false)}
 className="ms-button ms-button-secondary mb-5 w-full justify-center no-underline"
 >
 <LayoutDashboard size={18} aria-hidden="true" />
 {isEn ? "Open my dashboard" : "내 대시보드 열기"}
 </Link>

 {/* Nav items */}
 <nav
 aria-label={isEn ? "Main menu" : "주 메뉴"}
 className="overflow-hidden rounded-2xl border border-border bg-background"
 >
 {activeNavConfig.map((item) =>
 item.type === "link" ? (
 <Link
 key={item.href}
 href={item.href}
 data-msy-module={item.href === "/work-clock" ? "header-work-clock" : item.featured ? "header-money-check" : undefined}
 aria-current={pathname === item.href ? "page" : undefined}
 onClick={() => setIsMobileMenuOpen(false)}
 className={`ms-interactive hover:!translate-y-0 hover:!shadow-none block no-underline border-b border-border last:border-b-0 px-5 py-4 text-base font-semibold transition-colors ${
 item.featured || pathname === item.href
 ? "text-link bg-accent"
 : "text-foreground hover:bg-secondary"
 }`}
 >
 <span className="flex items-center gap-2">
 {item.featured && <CircleCheck size={19} aria-hidden="true" />}
 {item.href === "/work-clock" && <Clock3 size={19} aria-hidden="true" />}
 {item.name}
 {item.badge === "NEW" && <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">NEW</span>}
 </span>
 </Link>
 ) : (
 <MobileDropdown
 key={item.name}
 item={item}
 pathname={pathname}
 onClose={() => setIsMobileMenuOpen(false)}
 locale={isEn ? "en" : "ko"}
 deferPanel={deferPanels}
 />
 )
 )}
 </nav>
 </div>
 </dialog>
 </>
 );
}
