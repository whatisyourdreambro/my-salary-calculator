"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "@/components/AppLink";
import { watchDeferredSectionActivation } from "@/lib/deferredSectionActivation";

/** Keep section headings outside this boundary so discovery text remains server-rendered. */
export default function DeferredSection({ id, label, children, minHeight = 560, className = "", fallbackHref }: {
  id: string;
  label: string;
  children?: ReactNode;
  minHeight?: number;
  className?: string;
  fallbackHref?: string;
}) {
  const [activationId, setActivationId] = useState<string | null>(null);
  const active = activationId === id;
  const host = useRef<HTMLDivElement>(null);
  const focusRequested = useRef<string | null>(null);

  useEffect(() => {
    if (active || !host.current) return;
    return watchDeferredSectionActivation(host.current, id, () => setActivationId(id));
  }, [active, id]);

  useEffect(() => {
    if (!active || focusRequested.current !== id || !host.current) return;
    const container = host.current;
    // Only an explicit activation moves focus. An automatic nearby mount never does.
    const focusInput = () => {
      const input = container.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])')
        ?? container.querySelector<HTMLElement>('button:not([disabled]), a[href]');
      if (!input) return false;
      focusRequested.current = null;
      input.focus();
      return true;
    };
    if (focusInput()) return;
    const observer = new MutationObserver(() => { if (focusInput()) observer.disconnect(); });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [active, id]);

  return (
    <div id={id} ref={host} data-deferred-section data-load-state={active ? "requested" : "deferred"} className={`scroll-mt-24 ${className}`}>
      {active ? children : (
        <div className="flex flex-col items-start justify-center gap-4 text-sm" style={{ minHeight }}>
          <p>계산기를 열어 조건을 비교해 보세요.</p>
          <button type="button" className="btn-secondary min-h-11 px-4 py-2" onClick={() => { focusRequested.current = id; setActivationId(id); }}>
            {label} 열기
          </button>
          <noscript><p>계산기를 사용하려면 자바스크립트를 켜 주세요.{fallbackHref && <> <Link href={fallbackHref} className="underline">{label} 안내 보기</Link></>}</p></noscript>
        </div>
      )}
    </div>
  );
}
