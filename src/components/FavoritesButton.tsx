// src/components/FavoritesButton.tsx
//
// 즐겨찾기 버튼 — localStorage 기반.
// 사용자가 클릭하면 현재 페이지를 "즐겨찾기"에 추가/제거.
// /dashboard 에서 목록 표시 (재방문 유도).

"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export const FAVORITES_KEY = "msy_favorites";

export interface FavoriteItem {
  path: string;
  title: string;
  addedAt: string;
}

export function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

interface FavoritesButtonProps {
  /** 저장될 경로 — 없으면 현재 페이지 pathname */
  path?: string;
  /** 표시될 제목 — 없으면 document.title */
  title?: string;
  /** 변형: "icon"은 아이콘만, "labeled"는 텍스트 동반 */
  variant?: "icon" | "labeled";
  className?: string;
}

export default function FavoritesButton({
  path,
  title,
  variant = "labeled",
  className = "",
}: FavoritesButtonProps) {
  const [resolvedPath, setResolvedPath] = useState<string>(path ?? "");
  const [resolvedTitle, setResolvedTitle] = useState<string>(title ?? "");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = path ?? window.location.pathname;
    const t = title ?? document.title.replace(" | 머니샐러리", "");
    setResolvedPath(p);
    setResolvedTitle(t);
    setActive(loadFavorites().some((f) => f.path === p));
  }, [path, title]);

  const toggle = () => {
    if (!resolvedPath) return;
    const list = loadFavorites();
    const exists = list.some((f) => f.path === resolvedPath);
    const next = exists
      ? list.filter((f) => f.path !== resolvedPath)
      : [
          ...list,
          {
            path: resolvedPath,
            title: resolvedTitle,
            addedAt: new Date().toISOString(),
          },
        ];
    saveFavorites(next);
    setActive(!exists);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        className={`p-2 rounded-full hover:bg-canvas-100 transition-colors ${className}`}
      >
        <Star
          className={`w-5 h-5 ${active ? "fill-amber-400 text-amber-400" : "text-faint-blue"}`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-bold ${
        active
          ? "bg-amber-50 border-amber-200 text-amber-700"
          : "bg-white border-canvas-200 text-navy hover:border-electric"
      } ${className}`}
    >
      <Star
        className={`w-4 h-4 ${active ? "fill-amber-400 text-amber-400" : "text-faint-blue"}`}
      />
      {active ? "즐겨찾기 추가됨" : "즐겨찾기 추가"}
    </button>
  );
}
