// src/components/header/DesktopDropdown.tsx
//
// 데스크톱 헤더의 메가 메뉴 드롭다운.
// 각 항목 description + badge 지원. 부드러운 호버·페이드 애니메이션.

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface DesktopDropdownProps {
  item: DropdownItem;
  pathname: string | null;
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

// 드롭다운 위에 표시되는 작은 삼각 화살표
function Caret() {
  return (
    <div
      className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rotate-45 border-l border-t border-canvas"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

const containerVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.022,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    transition: { duration: 0.16, ease: "easeIn" as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

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
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  // 항목 수 9개 이상이면 2 column
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
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="inline-flex"
        >
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={isOpen ? "text-electric" : "text-faint-blue"}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border-[1.5px] border-canvas rounded-3xl shadow-[0_28px_64px_-12px_#0145F228,0_4px_20px_-4px_#0A182920] z-50 overflow-hidden ${
              isWide ? "w-[580px]" : "w-[340px]"
            }`}
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 0% 0%, rgba(1,69,242,0.05) 0%, transparent 50%)",
            }}
          >
            <Caret />

            {/* 상단 컬러 액센트 바 */}
            <div
              className="h-[3px] w-full"
              style={{
                background: "linear-gradient(90deg, #0145F2 0%, #4F8EFF 60%, transparent 100%)",
              }}
            />

            {/* Header — 카테고리 제목 + description */}
            {item.description && (
              <div className="px-5 pt-3.5 pb-2.5 border-b border-canvas-100">
                <p className="text-[11px] font-black text-electric uppercase tracking-widest">
                  {item.name}
                </p>
                <p className="text-xs text-muted-blue mt-0.5">{item.description}</p>
              </div>
            )}

            {/* Items */}
            <div
              className={`p-2 ${isWide ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}`}
            >
              {item.items.map((subItem) => {
                const isActive = pathname === subItem.href;
                return (
                  <motion.div key={subItem.href} variants={itemVariants}>
                    <Link
                      href={subItem.href}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl no-underline transition-all duration-150 hover:bg-electric-5 ${
                        isActive ? "bg-electric-5 ring-1 ring-electric/20" : ""
                      }`}
                    >
                      {/* 텍스트 영역 */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[13.5px] font-semibold leading-tight transition-colors ${
                              isActive
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
                      </div>

                      {/* 호버 시 오른쪽 화살표 */}
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="opacity-0 group-hover:opacity-100 text-electric flex-shrink-0 transition-all duration-150"
                        aria-hidden="true"
                      >
                        <ChevronRight size={13} />
                      </motion.span>
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
