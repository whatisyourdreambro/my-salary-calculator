// src/components/Header.tsx

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
 type: "link",
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
 { name: "2026 연봉 표", href: "/table/annual" },
 { name: "2026 월급 표", href: "/table/monthly" },
 { name: "2026 연봉 표", href: "/table/2026/annual" },
 { name: "2026 월급 표", href: "/table/2026/monthly" },
 ],
 },
 {
 name: "금융 가이드",
 type: "dropdown",
 items: [
 { name: "전체 가이드", href: "/guides" },
 { name: "직장인 꿀팁 모음", href: "/tips" },
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
 { name: "전체 30종 보기", href: "/tools" },
 { name: "🔥 성과급 세금 계산기", href: "/tools/finance/bonus" },
 { name: "퇴직금 세금 계산기", href: "/tools/finance/severance" },
 { name: "복리 계산기", href: "/tools/finance/compound" },
 { name: "주식 양도소득세", href: "/tools/finance/stock-tax" },
 { name: "취득세 계산기", href: "/tools/real-estate/acquisition-tax" },
 { name: "증여세 계산기", href: "/tools/real-estate/gift-tax" },
 { name: "프리랜서 종합소득세", href: "/tools/finance/freelance-tax" },
 { name: "IRP·연금저축 세액공제", href: "/tools/finance/irp" },
 { name: "할부 이자 계산기", href: "/tools/finance/installment" },
 { name: "대출 이자 계산기", href: "/tools/loan" },
 ],
 },
 {
 name: "생활 금융",
 type: "dropdown",
 items: [
 { name: "자동차 구매", href: "/car-loan" },
 { name: "FIRE 계산기", href: "/fire-calculator" },
 { name: "2026 재물운 사주", href: "/fortune-2026" },
 { name: "로또 번호 생성", href: "/lotto" },
 ],
 },
];

/* ── Desktop Dropdown ──────────────────────────────────────────── */
const Dropdown = ({
 item,
 pathname,
}: {
 item: DropdownItem;
 pathname: string | null;
 isScrolled: boolean;
}) => {
 const [isOpen, setIsOpen] = useState(false);

 return (
 <div
 className="relative"
 onMouseEnter={() => setIsOpen(true)}
 onMouseLeave={() => setIsOpen(false)}
 >
 <button
 style={{
 color: isOpen ? "#0145F2" : "#3D5E78",
 display: "flex",
 alignItems: "center",
 gap: "4px",
 padding: "8px 14px",
 fontSize: "14.5px",
 fontWeight: 600,
 background: "none",
 border: "none",
 cursor: "pointer",
 borderRadius: "10px",
 transition: "color 0.15s ease, background-color 0.15s ease",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor =
 "#0145F20D";
 (e.currentTarget as HTMLElement).style.color = "#0145F2";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
 (e.currentTarget as HTMLElement).style.color = isOpen
 ? "#0145F2"
 : "#3D5E78";
 }}
 >
 {item.name}
 <ChevronDown
 size={13}
 style={{
 transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
 transition: "transform 0.25s ease",
 color: isOpen ? "#0145F2" : "#7A9AB5",
 }}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 8, scale: 0.97 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 4 }}
 transition={{ duration: 0.18, ease: "easeOut" }}
 style={{
 position: "absolute",
 top: "100%",
 left: "50%",
 transform: "translateX(-50%)",
 marginTop: "8px",
 width: "220px",
 backgroundColor: "#FFFFFF",
 border: "1.5px solid #DDE4EC",
 borderRadius: "18px",
 boxShadow: "0 12px 40px -8px #0145F222, 0 2px 8px -2px #0A182914",
 padding: "6px",
 zIndex: 50,
 }}
 >
 <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
 {item.items.map((subItem) => (
 <Link
 key={subItem.href}
 href={subItem.href}
 style={{
 display: "block",
 padding: "9px 14px",
 fontSize: "13.5px",
 borderRadius: "12px",
 fontWeight: pathname === subItem.href ? 700 : 500,
 color:
 pathname === subItem.href ? "#0145F2" : "#3D5E78",
 backgroundColor:
 pathname === subItem.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
 transition:
 "background-color 0.12s ease, color 0.12s ease",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor =
 "#EDF1F5";
 (e.currentTarget as HTMLElement).style.color = "#0A1829";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor =
 pathname === subItem.href ? "#0145F20D" : "transparent";
 (e.currentTarget as HTMLElement).style.color =
 pathname === subItem.href ? "#0145F2" : "#3D5E78";
 }}
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

/* ── Mobile Dropdown ───────────────────────────────────────────── */
const MobileDropdown = ({
 item,
 pathname,
 onClose,
}: {
 item: DropdownItem;
 pathname: string | null;
 onClose: () => void;
}) => {
 const [isOpen, setIsOpen] = useState(false);

 return (
 <div
 style={{ borderBottom: "1px solid #EDF1F5" }}
 >
 <button
 onClick={() => setIsOpen(!isOpen)}
 style={{
 width: "100%",
 display: "flex",
 justifyContent: "space-between",
 alignItems: "center",
 padding: "16px 20px",
 fontSize: "16px",
 fontWeight: 600,
 background: "none",
 border: "none",
 cursor: "pointer",
 color: isOpen ? "#0145F2" : "#0A1829",
 transition: "color 0.15s ease",
 }}
 >
 <span>{item.name}</span>
 <ChevronDown
 size={18}
 style={{
 transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
 transition: "transform 0.25s ease",
 color: isOpen ? "#0145F2" : "#7A9AB5",
 }}
 />
 </button>
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 style={{ overflow: "hidden" }}
 >
 <div style={{ padding: "4px 12px 12px" }}>
 {item.items.map((subItem) => (
 <Link
 key={subItem.href}
 href={subItem.href}
 onClick={onClose}
 style={{
 display: "block",
 padding: "11px 16px",
 fontSize: "15px",
 borderRadius: "12px",
 fontWeight: pathname === subItem.href ? 700 : 500,
 color:
 pathname === subItem.href ? "#0145F2" : "#3D5E78",
 backgroundColor:
 pathname === subItem.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
 marginBottom: "2px",
 transition: "background-color 0.12s ease, color 0.12s ease",
 }}
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

/* ── Header ────────────────────────────────────────────────────── */
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

 const headerBg = isScrolled || isMobileMenuOpen
 ? "rgba(255,255,255,0.92)"
 : "#EDF1F5";
 const headerBorder = isScrolled || isMobileMenuOpen
 ? "#DDE4EC"
 : "transparent";

 return (
 <>
 <motion.header
 style={{
 position: "fixed",
 top: 0,
 left: 0,
 right: 0,
 zIndex: 50,
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
 <nav
 style={{
 maxWidth: "88rem",
 margin: "0 auto",
 padding: "0 1.5rem",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 }}
 >
 {/* Logo */}
 <div style={{ flexShrink: 0, zIndex: 50 }}>
 <Link
 href="/"
 style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
 >
 <Logo
 className="h-8 sm:h-9 w-auto"
 showText={true}
 style={{ color: "#0145F2" }}
 />
 </Link>
 </div>

 {/* Desktop Nav */}
 <div
 className="hidden xl:flex"
 style={{ alignItems: "center", gap: "2px" }}
 >
 {navConfig.map((item) =>
 item.type === "dropdown" ? (
 <Dropdown
 key={item.name}
 item={item}
 pathname={pathname}
 isScrolled={isScrolled}
 />
 ) : (
 <Link
 key={item.name}
 href={item.href}
 style={{
 padding: "8px 14px",
 fontSize: "14.5px",
 fontWeight: 600,
 borderRadius: "10px",
 color:
 pathname === item.href ? "#0145F2" : "#3D5E78",
 backgroundColor:
 pathname === item.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
 transition: "color 0.15s ease, background-color 0.15s ease",
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
 <div
 style={{
 display: "flex",
 alignItems: "center",
 gap: "12px",
 zIndex: 50,
 }}
 >
 {/* Dashboard CTA */}
 <Link
 href="/dashboard"
 className="hidden sm:flex"
 style={{
 alignItems: "center",
 gap: "7px",
 padding: "9px 20px",
 fontSize: "14px",
 fontWeight: 700,
 color: "#FFFFFF",
 backgroundColor: "#0145F2",
 border: "2px solid #0145F2",
 borderRadius: "12px",
 textDecoration: "none",
 transition: "background-color 0.15s ease, color 0.15s ease",
 boxShadow: "0 4px 14px -2px #0145F233",
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
 <LayoutDashboard size={15} />
 <span>내 대시보드</span>
 </Link>

 {/* Mobile Menu Toggle */}
 <div className="xl:hidden">
 <button
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 style={{
 padding: "8px",
 borderRadius: "10px",
 backgroundColor: isMobileMenuOpen ? "#0145F21A" : "transparent",
 border: "none",
 cursor: "pointer",
 color: "#0145F2",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 transition: "background-color 0.15s ease",
 }}
 aria-label="메뉴 열기"
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
 style={{
 position: "fixed",
 inset: 0,
 zIndex: 40,
 backgroundColor: "rgba(255,255,255,0.97)",
 backdropFilter: "blur(24px)",
 WebkitBackdropFilter: "blur(24px)",
 paddingTop: "80px",
 overflowY: "auto",
 }}
 className="xl:hidden"
 >
 <div style={{ padding: "16px 20px 80px" }}>
 {/* Mobile Dashboard CTA */}
 <Link
 href="/dashboard"
 onClick={() => setIsMobileMenuOpen(false)}
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 gap: "8px",
 width: "100%",
 padding: "16px",
 fontSize: "16px",
 fontWeight: 700,
 backgroundColor: "#0145F2",
 color: "#FFFFFF",
 borderRadius: "16px",
 textDecoration: "none",
 marginBottom: "20px",
 border: "2px solid #0145F2",
 boxShadow: "0 8px 24px -4px #0145F244",
 transition: "all 0.15s ease",
 }}
 >
 <LayoutDashboard size={18} />
 내 대시보드 열기
 </Link>

 {/* Nav items */}
 <div
 style={{
 backgroundColor: "#FFFFFF",
 borderRadius: "20px",
 border: "1.5px solid #DDE4EC",
 overflow: "hidden",
 }}
 >
 {navConfig.map((item) =>
 item.type === "link" ? (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setIsMobileMenuOpen(false)}
 style={{
 display: "block",
 padding: "16px 20px",
 fontSize: "16px",
 fontWeight: 600,
 borderBottom: "1px solid #EDF1F5",
 color:
 pathname === item.href ? "#0145F2" : "#0A1829",
 backgroundColor:
 pathname === item.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
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