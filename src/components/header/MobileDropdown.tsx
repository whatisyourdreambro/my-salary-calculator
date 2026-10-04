// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트. description + badge 지원.
//
// 아코디언 골격·id는 항상 렌더하고 열림/닫힘은 CSS로 제어한다.
// Header의 데스크톱 메뉴는 정적 페이지에서 모든 목적지를 SSR한다.
// 따라서 동일 링크가 반복되는 모바일 dialog는 처음 열기 전까지 deferPanel로 내용만 미룬다.
// Edge SSR 경로의 초기 지연도 같은 prop을 사용한다. 메뉴를 열면 각 패널의
// 링크가 모두 렌더되므로 카테고리 전환·키보드 탐색·현재 경로 표시는 그대로 유지된다.

"use client";

import { useEffect, useId, useState } from "react";
import Link from "@/components/AppLink";
import { ChevronDown, ChevronRight, Sparkles, Flame, Calendar, Star } from "lucide-react";
import type { DropdownItem, Badge } from "./navConfig";

interface MobileDropdownProps {
  item: DropdownItem;
  pathname: string | null;
  onClose: () => void;
  locale?: "ko" | "en";
  /** 모바일 메뉴를 처음 열기 전 또는 Edge SSR 초기 상태에서는 중복 패널 내용만 렌더하지 않는다. */
  deferPanel?: boolean;
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
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-medium flex-shrink-0"
    >
      <Icon size={9} strokeWidth={2.5} aria-hidden="true" />
      {locale === "en" ? badge === "MUST" ? "PICK" : badge : style.label}
    </span>
  );
}

export default function MobileDropdown({ item, pathname, onClose, locale = "ko", deferPanel = false }: MobileDropdownProps) {
  const currentSection = item.items.some(link => link.href === pathname);
  const [isOpen, setIsOpen] = useState(currentSection);
  const panelId = useId();
  useEffect(() => { setIsOpen(currentSection); }, [pathname, currentSection]);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`ms-interactive hover:!translate-y-0 hover:!shadow-none min-h-11 w-full flex justify-between items-center px-5 py-4 text-left text-base font-semibold bg-transparent border-0 cursor-pointer transition-colors ${
          isOpen ? "text-link" : "text-foreground"
        }`}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span>{item.name}</span>
          {item.description && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
        <span
          className={`inline-flex transition-transform duration-150 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={isOpen ? "text-link" : "text-muted-foreground"}
          />
        </span>
      </button>

      {/* 패널 골격과 id는 유지하며 메뉴가 열리면 내용도 DOM에 함께 존재한다. */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-150 motion-reduce:transition-none ${
          isOpen
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          {deferPanel ? null : (<>
          <div className="mx-5 mb-2 border-t border-border" aria-hidden="true" />

          <div className="px-3 pb-3 pt-0.5">
            {item.items.map((subItem) => {
              const active = pathname === subItem.href;
              return (
                <div key={subItem.href}>
                  <Link
                    href={subItem.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`ms-interactive hover:!translate-y-0 hover:!shadow-none group flex min-h-11 items-center gap-2 px-4 py-3 rounded-xl no-underline mb-0.5 transition-colors duration-150 motion-reduce:transition-none ${
                      active
                        ? "bg-secondary ring-1 ring-border"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[15px] ${
                            active
                              ? "font-bold text-link"
                              : "font-semibold text-foreground group-hover:text-link"
                          } transition-colors`}
                        >
                          {subItem.name}
                        </span>
                        {subItem.badge && <BadgePill badge={subItem.badge} locale={locale} />}
                      </div>
                      {subItem.description && (
                        <span className="text-xs text-muted-foreground leading-5">
                          {subItem.description}
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      aria-hidden="true"
                      className={`flex-shrink-0 transition-colors duration-150 motion-reduce:transition-none ${
                        active
                          ? "text-link opacity-100"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
