"use client";

// 카테고리 layout 주입용 공유 섹션 fallback.
// 페이지가 자체 인라인 ShareButtons를 렌더하면(shareRegistry 등록) 스스로 숨는다.
// - SSR/프리렌더 HTML에는 아예 없음(서버 스냅숏=억제) → hydration mismatch·CLS 없음
// - 늦게 마운트되는 인라인(fun 결과 카드 등)에도 구독으로 즉시 반응
// - AutoBreadcrumb 전역 주입 사고(JSON-LD 2중 주입)와 달리 head/JSON-LD 비접촉

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { hasPrimary, subscribeShareRegistry } from "@/lib/shareRegistry";
import ShareSection from "./ShareSection";

const MAX_WIDTH_CLASS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

interface AutoShareSectionProps {
  contentType?: string;
  locale?: "ko" | "en";
  /** 소속 layout의 컨테이너 폭과 맞출 것 (tools 5xl, guides 3xl 등) */
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  className?: string;
}

export default function AutoShareSection({
  contentType = "page",
  locale = "ko",
  maxWidth = "5xl",
  className = "",
}: AutoShareSectionProps) {
  const pathname = usePathname();
  const suppressed = useSyncExternalStore(
    subscribeShareRegistry,
    () => hasPrimary(pathname ?? ""),
    () => true // 서버 스냅숏: 항상 억제 (SSR HTML에 미포함)
  );

  // 페이지 인라인의 등록 effect(커밋 시 동기 실행 — 타이머보다 항상 먼저)가
  // 끝난 뒤에만 노출 — fallback과 인라인이 한 프레임 공존하는 깜빡임 방지.
  // rAF는 백그라운드 탭에서 실행이 보류되므로 setTimeout(0) 사용.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const timer = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!ready || suppressed) return null;

  return (
    <div
      className={`${MAX_WIDTH_CLASS[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 mt-8 ${className}`}
    >
      <ShareSection contentType={contentType} locale={locale} register={false} />
    </div>
  );
}
