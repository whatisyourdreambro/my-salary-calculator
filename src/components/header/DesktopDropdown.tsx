// src/components/header/DesktopDropdown.tsx
//
// 데스크톱 헤더의 메가 메뉴 드롭다운.
// 각 항목 description + badge 지원. 부드러운 호버·페이드 애니메이션.

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface DesktopDropdownProps {
  item: DropdownItem;
  pathname: string | null;
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

export default function DesktopDropdown({ item, pathname }: DesktopDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleLeave = () => {
    // 짧은 지연 — 부드러운 hover ↔ 메뉴 이동
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  // 항목 수 9개 이상이면 2 column, 미만이면 1 column
  const isWide = item.items.length >= 9;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex items-center gap-0.5 px-2.5 xl:px-3 py-2 text-[13px] xl:text-[14px] font-semibold rounded-[10px] bg-transparent border-none cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-electric-5 hover:text-electric ${
          isOpen ? "text-electric bg-electric-5" : "text-muted-blue"
        }`}
      >
        {item.name}
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-electric" : "text-faint-blue"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border-[1.5px] border-canvas rounded-3xl shadow-[0_24px_60px_-12px_#0145F222,0_4px_16px_-4px_#0A182918] z-50 overflow-hidden ${
              isWide ? "w-[560px]" : "w-[340px]"
            }`}
            style={{
              backgroundImage:
                "radial-gradient(circle at 0% 0%, rgba(1, 69, 242, 0.04) 0%, transparent 35%)",
            }}
          >
            {/* Header — 카테고리 제목 + description */}
            {item.description && (
              <div className="px-5 pt-4 pb-2 border-b border-canvas-100">
                <p className="text-[11px] font-black text-electric uppercase tracking-widest">
                  {item.name}
                </p>
                <p className="text-xs text-muted-blue mt-0.5">{item.description}</p>
              </div>
            )}

            {/* Items */}
            <div
              className={`p-2 ${isWide ? "grid grid-cols-2 gap-1" : "flex flex-col gap-0.5"}`}
            >
              {item.items.map((subItem, idx) => (
                <motion.div
                  key={subItem.href}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.018, duration: 0.2 }}
                >
                  <Link
                    href={subItem.href}
                    role="menuitem"
                    aria-current={pathname === subItem.href ? "page" : undefined}
                    className={`group flex flex-col gap-0.5 px-3 py-2.5 rounded-xl no-underline transition-all duration-150 hover:bg-electric-5 hover:translate-x-0.5 ${
                      pathname === subItem.href
                        ? "bg-electric-5 ring-1 ring-electric/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <span
                        className={`text-[13.5px] font-semibold transition-colors ${
                          pathname === subItem.href
                            ? "text-electric"
                            : "text-navy group-hover:text-electric"
                        }`}
                      >
                        {subItem.name}
                      </span>
                      {subItem.badge && <BadgePill badge={subItem.badge} />}
                    </div>
                    {subItem.description && (
                      <span className="text-[11.5px] text-faint-blue group-hover:text-muted-blue line-clamp-1 transition-colors">
                        {subItem.description}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
