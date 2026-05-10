"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 시맨틱 배지 — info/success/warning/danger/neutral.
 * Toss 톤의 옅은 배경 + 진한 텍스트.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-bold tracking-tight whitespace-nowrap",
  {
    variants: {
      intent: {
        info:
          "bg-primary-10 text-primary border border-primary-20",
        success:
          "bg-success-50 text-success-700 border border-success-20",
        warning:
          "bg-warning-50 text-warning-700 border border-warning-20",
        danger:
          "bg-danger-50 text-danger-700 border border-danger-20",
        neutral:
          "bg-canvas-100 text-muted-blue border border-canvas-200",
        primary:
          "bg-primary text-primary-foreground border border-primary",
      },
      size: {
        sm: "px-2 py-0.5 text-[10.5px] uppercase tracking-[0.04em]",
        md: "px-3 py-1 text-[12px]",
        lg: "px-4 py-1.5 text-[13.5px]",
      },
      pulse: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      intent: "info",
      size: "md",
      pulse: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, intent, size, pulse, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ intent, size, pulse }), className)}
      {...props}
    >
      {pulse && (
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-current opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  )
);
Badge.displayName = "Badge";
