// src/components/header/MobileDropdown.tsx
//
// 모바일 헤더의 드롭다운 컴포넌트. description + badge 지원.
//
// SEO: 아코디언 패널은 항상 DOM에 렌더하고 열림/닫힘은 CSS(grid-rows 0fr↔1fr +
// visibility/opacity)로만 제어한다. 조건부 렌더({isOpen && ...})로 되돌리면
// SSR HTML에서 링크가 사라져 크롤러가 내비 링크를 못 보게 되므로 금지.

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

export default function MobileDropdown({ item, pathname, onClose, locale = "ko" }: MobileDropdownProps) {
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

      {/* 패널 — 항상 DOM에 렌더 (SSR/크롤러 링크 노출), grid-rows 0fr↔1fr로 높이 애니메이션 */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-150 motion-reduce:transition-none ${
          isOpen
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden min-h-0">
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
        </div>
      </div>
    </div>
  );
}
