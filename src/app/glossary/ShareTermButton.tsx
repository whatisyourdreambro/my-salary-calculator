"use client";

// 용어 카드의 공유 버튼 — 카드 본문은 서버 렌더링을 유지하고
// navigator.share가 필요한 이 버튼만 클라이언트 아일랜드로 분리.
// v2: alert() → 토스트, GA4 trackShare 계측 추가 (공유 코어와 UX 통일).
import { useState } from "react";
import { Share2 } from "lucide-react";
import { trackShare } from "@/lib/analytics";

export default function ShareTermButton({ title }: { title: string }) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      trackShare("webshare", "glossary_term");
      try {
        await navigator.share({
          title: `머니샐러리 용어사전: ${title}`,
          text: `${title}에 대해 알아보세요!`,
          url,
        });
      } catch {
        // 공유 시트 닫음 — 무시
      }
      return;
    }
    trackShare("copy", "glossary_term");
    try {
      await navigator.clipboard.writeText(url);
      showToast("🔗 링크가 복사됐어요!");
    } catch {
      showToast("복사에 실패했습니다.");
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="p-2 text-muted-foreground hover:text-primary transition-colors"
        aria-label={`${title} 공유하기`}
      >
        <Share2 size={16} />
      </button>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="share-toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
        >
          {toast}
        </div>
      )}
    </>
  );
}
