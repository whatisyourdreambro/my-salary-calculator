"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 페이지 최상위 wrapper.
 * - 헤더 fixed 높이를 고려한 상단 padding을 모바일/데스크톱 반응형으로 일관 적용
 * - container 폭을 표준화 (narrow/page/wide)
 * - 다크모드 자동 호환
 *
 * 100+ 페이지의 일관성을 위해 신규/마이그레이션 페이지에 우선 도입.
 * 기존 페이지는 globals.css의 .page-shell · .container-{narrow,page,wide} 클래스로
 * 점진 적용 가능.
 */
export const pageShellVariants = cva("min-h-screen", {
  variants: {
    background: {
      canvas: "bg-canvas dark:bg-canvas-950",
      white: "bg-white dark:bg-canvas-900",
      gradient:
        "bg-gradient-to-b from-canvas to-white dark:from-canvas-950 dark:to-canvas-900",
    },
    spacing: {
      tight: "pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20",
      normal: "pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24",
      loose: "pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28",
    },
  },
  defaultVariants: {
    background: "canvas",
    spacing: "normal",
  },
});

const containerClasses = {
  narrow: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
  page: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
  wide: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
} as const;

export interface PageShellProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof pageShellVariants> {
  /** 콘텐츠 폭 — narrow(가이드)/page(기본)/wide(대시보드)/full */
  container?: keyof typeof containerClasses;
  children: React.ReactNode;
  /** main 내부 wrapper 자체의 최대 폭만 적용하고 싶을 때 false (커스텀 hero 등) */
  contained?: boolean;
}

export const PageShell = React.forwardRef<HTMLElement, PageShellProps>(
  (
    {
      className,
      background,
      spacing,
      container = "page",
      contained = true,
      children,
      ...props
    },
    ref
  ) => (
    <main
      ref={ref}
      className={cn(pageShellVariants({ background, spacing }), className)}
      {...props}
    >
      {contained ? <div className={containerClasses[container]}>{children}</div> : children}
    </main>
  )
);
PageShell.displayName = "PageShell";

/**
 * 페이지 상단 Hero — Badge + 제목 + 설명을 일관된 위계로.
 */
export interface PageHeroProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const heroSizeClasses = {
  sm: "[--hero-title:clamp(1.5rem,3vw,2rem)] mb-6 sm:mb-8",
  md: "[--hero-title:clamp(1.875rem,4vw,2.75rem)] mb-8 sm:mb-12",
  lg: "[--hero-title:clamp(2.25rem,5vw,3.5rem)] mb-10 sm:mb-16",
} as const;

export function PageHero({
  badge,
  title,
  description,
  align = "center",
  size = "md",
  className,
  children,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        heroSizeClasses[size],
        align === "center" && "text-center",
        align === "center" && size !== "sm" && "max-w-2xl mx-auto",
        className
      )}
    >
      {badge && <div className="mb-4 inline-flex">{badge}</div>}
      <h1
        className="font-black tracking-[-0.04em] leading-[1.1] text-navy dark:text-canvas-50 mb-4"
        style={{ fontSize: "var(--hero-title)" }}
      >
        {title}
      </h1>
      {description && (
        <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 leading-relaxed font-medium">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
