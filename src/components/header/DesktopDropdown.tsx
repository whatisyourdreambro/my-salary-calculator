// src/components/header/DesktopDropdown.tsx
//
// 데스크톱 헤더의 드롭다운. duotone-card + 유틸 클래스 기반.

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
 type="button"
 aria-haspopup="menu"
 aria-expanded={isOpen}
 className={`flex items-center gap-1 px-3.5 py-2 text-[14.5px] font-semibold rounded-[10px] bg-transparent border-none cursor-pointer transition-colors hover:bg-electric-5 hover:text-electric ${
 isOpen ? "text-electric" : "text-muted-blue"
 }`}
 >
 {item.name}
 <ChevronDown
 size={13}
 aria-hidden="true"
 className={`transition-transform duration-200 ${
 isOpen ? "rotate-180 text-electric" : "text-faint-blue"
 }`}
 />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 role="menu"
 initial={{ opacity: 0, y: 8, scale: 0.97 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 4 }}
 transition={{ duration: 0.18, ease: "easeOut" }}
 className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-white border-[1.5px] border-canvas rounded-[18px] shadow-[0_12px_40px_-8px_#0145F222,0_2px_8px_-2px_#0A182914] p-1.5 z-50"
 >
 <div className="flex flex-col gap-0.5">
 {item.items.map((subItem) => (
 <Link
 key={subItem.href}
 href={subItem.href}
 role="menuitem"
 aria-current={pathname === subItem.href ? "page" : undefined}
 className={`block px-3.5 py-2.5 text-[13.5px] rounded-xl no-underline transition-colors hover:bg-canvas hover:text-navy ${
 pathname === subItem.href
 ? "font-bold text-electric bg-electric-5"
 : "font-medium text-muted-blue"
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
}
