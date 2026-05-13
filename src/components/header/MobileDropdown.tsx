// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트. description + badge 지원.

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface MobileDropdownProps {
  item: DropdownItem;
  pathname: string | null;
  onClose: () => void;
}

const BADGE_STYLES: Record<Badge, { bg: string; text: string; label: string; Icon: typeof Sparkles }> = {
  HOT: { bg: "#FFE4E6", text: "#E11D48", label: "HOT", Icon: Flame },
  NEW: { bg: "#DBEAFE", text: "#1D4ED8", label: "NEW", Icon: Sparkles },
  SEASON: { bg: "#FEF3C7", text: "#B45309", label: "시즌", Icon: Calendar },
  MUST: { bg: "#DCFCE7", text: "#15803D", label: "추천", Icon: Star },
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
        <div className="flex flex-col items-start gap-0.5">
          <span>{item.name}</span>
          {item.description && (
            <span className="text-[11px] font-medium text-faint-blue">
              {item.description}
            </span>
          )}
        </div>
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1">
              {item.items.map((subItem, idx) => {
                const active = pathname === subItem.href;
                return (
                  <motion.div
                    key={subItem.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.2 }}
                  >
                    <Link
                      href={subItem.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl no-underline mb-0.5 transition-colors ${
                        active
                          ? "bg-electric-5 ring-1 ring-electric/20"
                          : "hover:bg-electric-5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[15px] ${
                            active
                              ? "font-bold text-electric"
                              : "font-semibold text-navy"
                          }`}
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
