"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackCalcStart, trackCalcSubmit } from "@/lib/analytics";

/**
 * 계산기 퍼널 계측(무침습형) — 페이지 안 어떤 input/select 조작이든 감지해
 * 첫 조작 = calc_start, 조작이 멈춘 뒤 1.2초 = calc_submit (각 1회).
 * SimpleCalculatorView 는 자체 계측이 있으므로 이 컴포넌트를 함께 쓰지 말 것.
 * calc_type 은 pathname 마지막 세그먼트에서 자동 추론(props 로 재정의 가능).
 */
export default function CalcFunnelTracker({ calcType }: { calcType?: string }) {
  const pathname = usePathname();
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startedRef.current = false;
    submittedRef.current = false;
    const type =
      calcType ??
      (pathname ? pathname.split("/").filter(Boolean).pop() ?? "unknown" : "unknown");

    const onInput = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") return;
      // 헤더 검색창·내비 입력은 계산기 조작이 아님 — 퍼널 오염 방지
      if (t.closest("header, nav")) return;
      if (!startedRef.current) {
        startedRef.current = true;
        trackCalcStart(type);
      }
      if (!submittedRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          submittedRef.current = true;
          trackCalcSubmit(type);
        }, 1200);
      }
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, calcType]);

  return null;
}
