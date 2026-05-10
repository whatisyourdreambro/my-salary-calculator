"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 페이지 섹션 래퍼 — page-width + spacing 토큰 일관 적용.
 * Toss/Naver 처럼 큰 여백을 기본값으로.
 */
export const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "",
      xs: "py-section-xs",
      sm: "py-section-sm",
      md: "py-section-md",
      lg: "py-section-lg",
      xl: "py-section-xl",
    },
    background: {
      transparent: "",
      canvas: "bg-canvas",
      white: "bg-white",
      primary: "bg-primary text-primary-foreground",
    },
    divider: {
      none: "",
      top: "border-t border-canvas-200",
      bottom: "border-b border-canvas-200",
      both: "border-y border-canvas-200",
    },
  },
  defaultVariants: {
    spacing: "lg",
    background: "transparent",
    divider: "none",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** 내부 콘텐츠를 page-width로 감쌀지 (기본 true) */
  contained?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, background, divider, contained = true, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(sectionVariants({ spacing, background, divider }), className)}
      {...props}
    >
      {contained ? <div className="page-width">{children}</div> : children}
    </section>
  )
);
Section.displayName = "Section";

/**
 * 섹션 헤더 — Badge + 제목 + 설명을 일관된 위계로.
 */
export interface SectionHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" && "text-center mx-auto max-w-2xl",
        className
      )}
    >
      {badge && <div className="mb-4 inline-flex">{badge}</div>}
      <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-text mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-[15px] font-medium text-muted-blue leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
