"use client";

import * as React from "react";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 큰 숫자 + 라벨 + (선택) 변화량.
 * Hero/Footer/Calc 결과 등 신뢰 지표를 일관되게 표현.
 */
export const statVariants = cva("flex flex-col gap-1", {
  variants: {
    align: {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    },
    size: {
      sm: "[--stat-value:1.5rem] [--stat-label:0.7rem]",
      md: "[--stat-value:clamp(1.5rem,3vw,2rem)] [--stat-label:0.75rem]",
      lg: "[--stat-value:clamp(2rem,4vw,3rem)] [--stat-label:0.8rem]",
    },
  },
  defaultVariants: {
    align: "center",
    size: "md",
  },
});

export interface StatProps extends VariantProps<typeof statVariants> {
  /** 표시할 값. 숫자면 CountUp 애니메이션, 문자면 그대로 */
  value: number | string;
  label: string;
  /** 단위 (원, %, 명 등) */
  suffix?: string;
  prefix?: string;
  /** 변화량 (양수=상승, 음수=하락, 0=변화 없음) */
  delta?: number;
  /** CountUp 자릿수 (기본 0) */
  decimals?: number;
  className?: string;
}

export function Stat({
  value,
  label,
  suffix,
  prefix,
  delta,
  decimals = 0,
  align,
  size,
  className,
}: StatProps) {
  const numeric = typeof value === "number";

  const deltaIcon =
    delta === undefined ? null : delta > 0 ? (
      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
    ) : delta < 0 ? (
      <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
    );

  const deltaColor =
    delta === undefined
      ? ""
      : delta > 0
      ? "text-success-700 bg-success-50"
      : delta < 0
      ? "text-danger-700 bg-danger-50"
      : "text-muted-blue bg-canvas-100";

  return (
    <div className={cn(statVariants({ align, size }), className)}>
      <div className="flex items-baseline gap-1 font-mono-tabular">
        <span className="font-black text-primary [font-size:var(--stat-value)] tracking-[-0.04em] leading-none">
          {prefix}
          {numeric ? (
            <CountUp
              end={value as number}
              duration={1.6}
              separator=","
              decimals={decimals}
              enableScrollSpy
              scrollSpyOnce
            />
          ) : (
            value
          )}
          {suffix && (
            <span className="text-[0.55em] font-bold ml-0.5 text-muted-blue">
              {suffix}
            </span>
          )}
        </span>
      </div>
      <p className="font-bold text-faint-blue uppercase [font-size:var(--stat-label)] tracking-[0.04em]">
        {label}
      </p>
      {delta !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
            deltaColor
          )}
        >
          {deltaIcon}
          {delta > 0 && "+"}
          {delta}%
        </span>
      )}
    </div>
  );
}
