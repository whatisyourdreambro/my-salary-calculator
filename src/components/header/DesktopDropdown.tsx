// src/components/header/DesktopDropdown.tsx
//
// 데스크톱 헤더의 메가 메뉴 드롭다운.
// 각 항목 description + badge 지원. 부드러운 호버·페이드 애니메이션.
//
// SEO: 드롭다운 패널은 항상 DOM에 렌더하고 열림/닫힘은 CSS(visibility/opacity)로만
// 제어한다. 조건부 렌더({isOpen && ...})로 되돌리면 SSR HTML에서 메뉴 링크가
// 사라져 Googlebot이 내비 링크를 전혀 못 보게 되므로 금지.
// invisible(visibility:hidden)은 닫힘 상태에서 탭 포커스·접근성 트리에서도 제외한다.

"use client";

import { useState, useRef, useId, useEffect, useLayoutEffect } from "react";
import Link from "@/components/AppLink";
import { ChevronDown, ChevronRight, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface DesktopDropdownProps {
  item: DropdownItem;
  pathname: string | null;
  locale?: "ko" | "en";
}

const BADGE_STYLES: Record<Badge, { bg: string; text: string; label: string; Icon: typeof Sparkles }> = {
  HOT:    { bg: "#FFE4E6", text: "#E11D48", label: "HOT",  Icon: Flame },
  NEW:    { bg: "#DBEAFE", text: "#1D4ED8", label: "NEW",  Icon: Sparkles },
  SEASON: { bg: "#FEF3C7", text: "#B45309", label: "시즌", Icon: Calendar },
  MUST:   { bg: "#DCFCE7", text: "#15803D", label: "추천", Icon: Star },
};

function BadgePill({ badge, locale }: { badge: Badge; locale: "ko" | "en" }) {
  const style = BADGE_STYLES[badge];
  const Icon = style.Icon;
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wide flex-shrink-0"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <Icon size={9} strokeWidth={2.5} aria-hidden="true" />
      {locale === "en" ? badge === "MUST" ? "PICK" : badge : style.label}
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

export default function DesktopDropdown({ item, pathname, locale = "ko" }: DesktopDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [position, setPosition] = useState({ top: 76, left: 16 });
  const width = item.items.length >= 9 ? 580 : 340;

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 12, left: Math.max(16, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 16)) });
  }, [isOpen, width]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const resize = () => setIsOpen(false);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, [isOpen]);

  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  const focusItem = (index: number) => {
    requestAnimationFrame(() => {
      const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a[role=menuitem]");
      if (links?.length) links[(index + links.length) % links.length].focus();
    });
  };

  const handleEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      if (!rootRef.current?.contains(document.activeElement)) setIsOpen(false);
    }, 120);
  };

  // 항목 수 9개 이상이면 2 column
  const isWide = item.items.length >= 9;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) { event.preventDefault(); event.stopPropagation(); setIsOpen(false); buttonRef.current?.focus(); }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => setIsOpen(open => event.detail === 0 ? !open : true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setIsOpen(true); focusItem(event.key === "ArrowUp" ? -1 : 0); }
        }}
        className={`flex min-h-11 items-center gap-0.5 px-2 2xl:px-3 py-2 text-[13px] 2xl:text-[14px] font-semibold rounded-[10px] bg-transparent border-none cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-electric-5 hover:text-electric focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
          isOpen ? "text-electric bg-electric-5" : "text-muted-blue"
        }`}
      >
        {item.name}
        <span
          className={`inline-flex transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={isOpen ? "text-electric" : "text-faint-blue"}
          />
        </span>
      </button>

      {/* 패널 — 항상 DOM에 렌더 (SSR/크롤러 링크 노출), 열림/닫힘은 CSS 토글 */}
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        aria-label={item.name}
        onKeyDown={(event) => {
          const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[role=menuitem]"));
          const index = links.indexOf(document.activeElement as HTMLAnchorElement);
          if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            focusItem(event.key === "Home" ? 0 : event.key === "End" ? -1 : index + (event.key === "ArrowDown" ? 1 : -1));
          }
        }}
        className={`fixed bg-white dark:bg-canvas-950 border-[1.5px] border-canvas rounded-3xl shadow-[0_28px_64px_-12px_#0145F228,0_4px_20px_-4px_#0A182920] z-50 overflow-y-auto overscroll-contain transition-[opacity,transform,visibility] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isWide ? "w-[580px]" : "w-[340px]"
        } ${
          isOpen
            ? "visible opacity-100 translate-y-0 scale-100"
            : "invisible opacity-0 pointer-events-none translate-y-3.5 scale-95"
        }`}
        style={{
          top: position.top,
          left: position.left,
          maxHeight: `calc(100dvh - ${position.top + 16}px)`,
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
              <div key={subItem.href}>
                <Link
                  href={subItem.href}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-2 px-3 py-2.5 rounded-xl no-underline transition-all duration-150 hover:bg-electric-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
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
                      {subItem.badge && <BadgePill badge={subItem.badge} locale={locale} />}
                    </div>
                    {subItem.description && (
                      <span className="text-[11.5px] text-faint-blue group-hover:text-muted-blue line-clamp-1 transition-colors">
                        {subItem.description}
                      </span>
                    )}
                  </div>

                  {/* 호버 시 오른쪽 화살표 */}
                  <span
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-electric flex-shrink-0 transition-all duration-150"
                    aria-hidden="true"
                  >
                    <ChevronRight size={13} />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
