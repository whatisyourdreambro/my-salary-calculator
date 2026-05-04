// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트.
// 인라인 style은 isOpen·pathname 분기와 결합되어 유지.

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { DropdownItem } from "./navConfig";

interface MobileDropdownProps {
 item: DropdownItem;
 pathname: string | null;
 onClose: () => void;
}

export default function MobileDropdown({ item, pathname, onClose }: MobileDropdownProps) {
 const [isOpen, setIsOpen] = useState(false);

 return (
 <div className="border-b border-canvas-100">
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
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 pt-1">
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
 color: pathname === subItem.href ? "#0145F2" : "#3D5E78",
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
}
