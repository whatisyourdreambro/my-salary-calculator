// src/components/DashboardFavoritesSection.tsx
//
// /dashboard에서 사용자의 즐겨찾기를 표시.
// FavoritesButton.tsx가 저장한 localStorage(msy_favorites) 데이터 표시.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, ExternalLink } from "lucide-react";
import {
  FAVORITES_KEY,
  loadFavorites,
  saveFavorites,
  type FavoriteItem,
} from "./FavoritesButton";

export default function DashboardFavoritesSection() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const removeFavorite = (path: string) => {
    const next = favorites.filter((f) => f.path !== path);
    saveFavorites(next);
    setFavorites(next);
  };

  if (favorites.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-black text-navy flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          내 즐겨찾기 ({favorites.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(FAVORITES_KEY);
              setFavorites([]);
            }
          }}
          className="text-xs text-faint-blue hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {favorites
          .slice()
          .sort(
            (a, b) =>
              new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          )
          .map((fav) => (
            <div
              key={fav.path}
              className="group p-4 bg-white rounded-2xl border border-canvas-200 hover:border-amber-300 transition-colors flex items-center gap-3"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link
                  href={fav.path}
                  className="block font-bold text-navy text-sm truncate hover:text-electric transition-colors"
                >
                  {fav.title || fav.path}
                </Link>
                <p className="text-[11px] text-faint-blue mt-0.5">
                  {new Date(fav.addedAt).toLocaleDateString("ko-KR")} 추가
                </p>
              </div>
              <Link
                href={fav.path}
                aria-label="열기"
                className="p-1.5 rounded-full text-faint-blue hover:text-electric hover:bg-canvas transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(fav.path)}
                aria-label="즐겨찾기 해제"
                className="p-1.5 rounded-full text-faint-blue hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
