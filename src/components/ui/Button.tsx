"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Toss-style 버튼 스타일 토큰.
 * Link/외부 링크에서도 동일한 스타일을 쓰고 싶다면
 * `<Link className={buttonVariants({ intent: "primary" })}>`로 사용한다.
 */
export const buttonVariants = cva(
  // 공통 — 폰트, 정렬, 트랜지션, 접근성
  [
    "inline-flex items-center justify-center gap-2",
    "font-bold whitespace-nowrap no-underline no-tap-highlight",
    "transition-all duration-150 ease-out",
    "active:scale-[0.97]",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      intent: {
        primary:
          "bg-primary text-primary-foreground border-2 border-primary shadow-primary-md hover:bg-canvas hover:text-primary",
        secondary:
          "bg-canvas text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground",
        ghost:
          "bg-transparent text-primary border-2 border-transparent hover:bg-primary-10 hover:border-primary-20",
        outline:
          "bg-white text-text border border-canvas-300 hover:border-primary hover:text-primary",
        success:
          "bg-success text-success-foreground border-2 border-success shadow-md hover:bg-success-600",
        danger:
          "bg-destructive text-destructive-foreground border-2 border-destructive shadow-md hover:opacity-90",
      },
      size: {
        sm: "px-3 py-1.5 text-[13px] rounded-lg",
        md: "px-4 py-2.5 text-[14.5px] rounded-xl",
        lg: "px-7 py-3.5 text-[15.5px] rounded-xl",
        xl: "px-9 py-4 text-base rounded-2xl",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      block: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, intent, size, block, loading, children, disabled, type, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ intent, size, block }), className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
