"use client";

// Header 즐겨찾기 배지 — 저장 개수를 상시 노출해 /dashboard 재방문 루프를 만든다.
// count가 0이면 아예 렌더하지 않아 기존 레이아웃 불변 (hydration mismatch 없음:
// SSR·초기 렌더 = null → mount effect 후 표시).

import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { Star } from "lucide-react";
import { loadFavorites, FAVORITES_EVENT } from "@/components/FavoritesButton";
import { trackBookmarkClick } from "@/lib/analytics";

export default function FavoritesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(loadFavorites().length);
    refresh();
    // 동일 탭(커스텀 이벤트) + 크로스 탭(storage) 모두 반영
    window.addEventListener(FAVORITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/dashboard"
      aria-label={`즐겨찾기 ${count}개 보기`}
      onClick={() => trackBookmarkClick("/dashboard", "header_badge")}
      className="relative p-2 rounded-full hover:bg-canvas-100 transition-colors"
    >
      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-electric text-white text-[10px] font-black flex items-center justify-center leading-none">
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
}
