// src/components/header/DesktopDropdown.tsx
//
// 데스크톱 헤더의 드롭다운 컴포넌트.
// 인라인 style은 hover handler·isOpen 동적 분기와 결합되어 그대로 유지.
// (시각 회귀 0 마이그레이션을 위해 분리만 진행)

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { DropdownItem } from "./navConfig";

interface DesktopDropdownProps {
 item: DropdownItem;
 pathname: string | null;
}

export default function DesktopDropdown({ item, pathname }: DesktopDropdownProps) {
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
 (e.currentTarget as HTMLElement).style.backgroundColor = "#0145F20D";
 (e.currentTarget as HTMLElement).style.color = "#0145F2";
 }}
 onMouseLeave={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
 (e.currentTarget as HTMLElement).style.color = isOpen ? "#0145F2" : "#3D5E78";
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
 <div className="flex flex-col gap-0.5">
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
 color: pathname === subItem.href ? "#0145F2" : "#3D5E78",
 backgroundColor:
 pathname === subItem.href ? "#0145F20D" : "transparent",
 textDecoration: "none",
 transition: "background-color 0.12s ease, color 0.12s ease",
 }}
 onMouseEnter={(e) => {
 (e.currentTarget as HTMLElement).style.backgroundColor = "#EDF1F5";
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
}
