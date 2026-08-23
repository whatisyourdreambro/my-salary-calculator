"use client";

// /embed — 임베드 코드 스니펫 + 복사 버튼 (다중 위젯 props화, 2026-08-23).
// 스니펫의 크레딧 <a> 링크가 백링크 본체다 (iframe 자체는 링크 주스 0) —
// 스니펫 문자열에서 크레딧 앵커를 임의로 제거하지 말 것.
// 스니펫 정본은 src/app/embed/widgets.ts (EMBED_WIDGETS).

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function EmbedSnippetClient({
  snippet,
  widgetId,
}: {
  snippet: string;
  widgetId: string;
}) {
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
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      showToast("임베드 코드가 복사됐어요. 블로그 HTML 모드에 붙여넣으세요");
      trackEvent("embed_code_copy", { page_path: "/embed", widget_id: widgetId });
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
        <code>{snippet}</code>
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
