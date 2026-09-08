"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { observeSamsungModuleView } from "@/app/calc/samsung-bonus/observeSamsungModuleView";
import { trackEvent, trackGuideCTAClick } from "@/lib/analytics";

const POSITION = "samsung-company-summary";
const PAGE_PATH = "/salary-db/samsung-electronics";
const TARGETS = new Set([
  "/calc/samsung-bonus",
  "#samsung-salary-table",
  "#samsung-career-levels",
  "#samsung-disclosed-salary",
]);

export default function SamsungCompanySummaryLinks({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (pathname !== PAGE_PATH || !ref.current) return;
    return observeSamsungModuleView(ref.current, () => {
      trackEvent("module_view", { position: POSITION, page_path: PAGE_PATH });
    });
  }, [pathname]);

  return (
    <nav
      ref={ref}
      aria-label="삼성전자 연봉 자료 바로가기"
      className="mt-4 flex flex-wrap gap-2"
      onClick={(event) => {
        if (pathname !== PAGE_PATH || !(event.target instanceof Element)) return;
        const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
        const href = anchor?.getAttribute("href");
        if (anchor && event.currentTarget.contains(anchor) && href && TARGETS.has(href)) {
          trackGuideCTAClick(href, POSITION, PAGE_PATH);
        }
      }}
    >
      {children}
    </nav>
  );
}
