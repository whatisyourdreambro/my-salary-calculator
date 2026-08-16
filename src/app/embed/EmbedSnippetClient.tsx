"use client";

// /embed — 임베드 코드 스니펫 + 복사 버튼.
// 스니펫의 크레딧 <a> 링크가 백링크 본체다 (iframe 자체는 링크 주스 0) —
// 스니펫 문자열에서 크레딧 앵커를 임의로 제거하지 말 것.

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const EMBED_SNIPPET = `<iframe src="https://www.moneysalary.com/widget/salary" width="100%" height="380"
  style="border:1px solid #e2e8f0;border-radius:12px;max-width:480px;"
  title="2026 연봉 실수령액 계산기" loading="lazy"></iframe>
<p style="margin:8px 0 0;font-size:13px;">
  <a href="https://www.moneysalary.com/?utm_source=embed&utm_medium=widget"
     target="_blank">2026 연봉 실수령액 계산기 by 머니샐러리</a>
</p>`;

export default function EmbedSnippetClient() {
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
    try {
      await navigator.clipboard.writeText(EMBED_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      showToast("임베드 코드가 복사됐어요. 블로그 HTML 모드에 붙여넣으세요");
      trackEvent("embed_code_copy", { page_path: "/embed" });
    } catch {
      showToast("복사에 실패했습니다. 코드를 직접 드래그해 주세요");
    }
  };

  return (
    <div className="rounded-3xl border border-canvas-200 bg-navy overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <span className="text-xs font-bold text-white/60">
          HTML 임베드 코드 (크레딧 링크 포함)
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-electric text-white text-[13px] font-bold hover:opacity-90 active:scale-95 transition"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {copied ? "복사 완료" : "코드 복사"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-[12px] leading-[1.7] text-emerald-200">
        <code>{EMBED_SNIPPET}</code>
      </pre>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="share-toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
