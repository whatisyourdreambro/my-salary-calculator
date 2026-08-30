"use client";

// 데이터 리포트 인용문 복사 버튼 — 기자·블로거의 인용 마찰 제거가 목적.
// 인용문을 blockquote로 노출하고, 버튼 클릭 시 출처 링크가 붙은 형태로 복사한다.
//
// 주의: CopyAttribution(전역 드래그 복사 어트리뷰션)은 copy 이벤트 기반이라
// navigator.clipboard.writeText 에는 발동하지 않는다 — 출처 문구를 여기서 직접 내장.

import { useEffect, useRef, useState } from "react";
import { Quote, Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const SITE_URL = "https://www.moneysalary.com";

interface CitationCopyButtonProps {
  /** 인용 문장 — 화면에도 blockquote로 렌더된다 */
  quote: string;
  /** canonical 경로 (예: "/insights/entry-salary-by-industry-2026") */
  path: string;
  /** GA4 quote_id — 어떤 인용문이 복사됐는지 구분 */
  quoteId: string;
  /**
   * 복사 문구의 출처 라벨 — 기본 "데이터 리포트"(insights 기존 동작 유지).
   * R2 B4 (2026-08-31): 상시 랭킹·봉급표 확산용 라벨 분기.
   */
  sourceLabel?: string;
  className?: string;
}

export default function CitationCopyButton({
  quote,
  path,
  quoteId,
  sourceLabel = "데이터 리포트",
  className = "",
}: CitationCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2200);
  };

  const handleCopy = async () => {
    const text = `${quote}\n\n출처: 머니샐러리 ${sourceLabel} (${SITE_URL}${path})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      showToast("인용문이 복사됐어요. 출처 링크가 함께 담겼습니다");
      trackEvent("citation_copy", { page_path: path, quote_id: quoteId });
    } catch {
      showToast("복사에 실패했습니다. 문장을 직접 드래그해 주세요");
    }
  };

  return (
    <figure
      className={`rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5 ${className}`}
    >
      <blockquote className="flex gap-3">
        <Quote className="w-5 h-5 shrink-0 text-electric mt-0.5" aria-hidden="true" />
        <p className="text-[15px] leading-[1.75] font-semibold text-navy dark:text-canvas-50">
          {quote}
        </p>
      </blockquote>
      <figcaption className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-faint-blue">
          출처 표기 시 자유롭게 인용하실 수 있습니다
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-electric text-white text-[13px] font-bold hover:opacity-90 active:scale-95 transition"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {copied ? "복사 완료" : "출처와 함께 인용문 복사"}
        </button>
      </figcaption>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="share-toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
        >
          {toast}
        </div>
      )}
    </figure>
  );
}
