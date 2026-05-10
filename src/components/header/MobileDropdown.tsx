// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트.

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
 aria-expanded={isOpen}
 className={`w-full flex justify-between items-center px-5 py-4 text-base font-semibold bg-transparent border-0 cursor-pointer transition-colors ${
 isOpen ? "text-electric" : "text-navy"
 }`}
 >
 <span>{item.name}</span>
 <ChevronDown
 size={18}
 aria-hidden="true"
 className={`transition-transform duration-300 ${
 isOpen ? "rotate-180 text-electric" : "rotate-0 text-faint-blue"
 }`}
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
 {item.items.map((subItem) => {
 const active = pathname === subItem.href;
 return (
 <Link
 key={subItem.href}
 href={subItem.href}
 onClick={onClose}
 aria-current={active ? "page" : undefined}
 className={`block px-4 py-[11px] text-[15px] rounded-xl no-underline mb-0.5 transition-colors ${
 active
 ? "font-bold text-electric bg-electric-5"
 : "font-medium text-muted-blue hover:bg-electric-5"
 }`}
 >
 {subItem.name}
 </Link>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
