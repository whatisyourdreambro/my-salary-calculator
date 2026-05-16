// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트. description + badge 지원.

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface MobileDropdownProps {
  item: DropdownItem;
  pathname: string | null;
  onClose: () => void;
}

const BADGE_STYLES: Record<Badge, { bg: string; text: string; label: string; Icon: typeof Sparkles }> = {
  HOT:    { bg: "#FFE4E6", text: "#E11D48", label: "HOT",  Icon: Flame },
  NEW:    { bg: "#DBEAFE", text: "#1D4ED8", label: "NEW",  Icon: Sparkles },
  SEASON: { bg: "#FEF3C7", text: "#B45309", label: "시즌", Icon: Calendar },
  MUST:   { bg: "#DCFCE7", text: "#15803D", label: "추천", Icon: Star },
};

function BadgePill({ badge }: { badge: Badge }) {
  const style = BADGE_STYLES[badge];
  const Icon = style.Icon;
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wide flex-shrink-0"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <Icon size={9} strokeWidth={2.5} aria-hidden="true" />
      {style.label}
    </span>
  );
}

const listVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      opacity: { duration: 0.2 },
      staggerChildren: 0.02,
      delayChildren: 0.04,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: "easeIn" as const },
      opacity: { duration: 0.15 },
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

export default function MobileDropdown({ item, pathname, onClose }: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-canvas-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full flex justify-between items-center px-5 py-4 text-base font-semibold bg-transparent border-0 cursor-pointer transition-colors ${
          isOpen ? "text-electric" : "text-navy"
        }`}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span>{item.name}</span>
          {item.description && (
            <span className="text-[11px] font-medium text-faint-blue">
              {item.description}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="inline-flex"
        >
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={isOpen ? "text-electric" : "text-faint-blue"}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            {/* 왼쪽 액센트 바 */}
            <div className="mx-5 mb-2 h-[2px] rounded-full bg-gradient-to-r from-electric/30 to-transparent" />

            <div className="px-3 pb-3 pt-0.5">
              {item.items.map((subItem) => {
                const active = pathname === subItem.href;
                return (
                  <motion.div key={subItem.href} variants={itemVariants}>
                    <Link
                      href={subItem.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-2 px-4 py-3 rounded-xl no-underline mb-0.5 transition-all duration-150 ${
                        active
                          ? "bg-electric-5 ring-1 ring-electric/20"
                          : "hover:bg-electric-5"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[15px] ${
                              active
                                ? "font-bold text-electric"
                                : "font-semibold text-navy group-hover:text-electric"
                            } transition-colors`}
                          >
                            {subItem.name}
                          </span>
                          {subItem.badge && <BadgePill badge={subItem.badge} />}
                        </div>
                        {subItem.description && (
                          <span className="text-[11.5px] text-faint-blue line-clamp-1">
                            {subItem.description}
                          </span>
                        )}
                      </div>
                      <ChevronRight
                        size={14}
                        aria-hidden="true"
                        className={`flex-shrink-0 transition-all duration-150 ${
                          active
                            ? "text-electric opacity-100"
                            : "text-faint-blue opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5"
                        }`}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
