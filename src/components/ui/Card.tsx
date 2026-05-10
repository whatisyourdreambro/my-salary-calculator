"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Toss-style 카드.
 * - default: 흰 배경 + 1px 라인 + 부드러운 그림자
 * - outline: 그림자 없이 라인만 (조밀 그리드용)
 * - elevated: 강조 카드, 큰 그림자
 * - filled: canvas 배경, 라인 없음 (보조 영역)
 *
 * interactive=true: hover 시 부드럽게 위로 + 그림자 강화 + 클릭 피드백.
 */
export const cardVariants = cva(
  "bg-white dark:bg-canvas-900 rounded-2xl transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "border border-canvas-200 dark:border-canvas-800 shadow-card hover:border-primary-20 hover:shadow-card-hover",
        outline:
          "border border-canvas-300 dark:border-canvas-700",
        elevated:
          "border border-canvas-200 dark:border-canvas-800 shadow-canvas-md hover:shadow-canvas-lg hover:-translate-y-0.5",
        filled:
          "bg-canvas dark:bg-canvas-800 border border-transparent",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99] active:transition-transform active:duration-100 no-tap-highlight",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-bold tracking-tight text-text", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-blue", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-text", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mt-4 pt-4 border-t border-canvas-200", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
