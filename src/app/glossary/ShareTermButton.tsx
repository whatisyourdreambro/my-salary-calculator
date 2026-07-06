"use client";

// 용어 카드의 공유 버튼 — 카드 본문은 서버 렌더링을 유지하고
// navigator.share가 필요한 이 버튼만 클라이언트 아일랜드로 분리.
import { Share2 } from "lucide-react";

export default function ShareTermButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `머니샐러리 용어사전: ${title}`,
        text: `${title}에 대해 알아보세요!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard
        ?.writeText(window.location.href)
        .then(() => alert("링크가 복사되었습니다."));
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 text-muted-foreground hover:text-primary transition-colors"
      aria-label={`${title} 공유하기`}
    >
      <Share2 size={16} />
    </button>
  );
}
