// src/components/FavoritesButton.tsx
//
// 즐겨찾기 버튼 — localStorage 기반.
// 사용자가 클릭하면 현재 페이지를 "즐겨찾기"에 추가/제거.
// /dashboard 에서 목록 표시 (재방문 유도).

"use client";

import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { Star } from "lucide-react";
import { trackBookmarkClick } from "@/lib/analytics";
import { useSharePageContext } from "@/hooks/useSharePageContext";
import { isSharePageReady, type SharePageContext } from "@/lib/sharePolicy";

export const FAVORITES_KEY = "msy_favorites";

/** 즐겨찾기 변경 브로드캐스트 — Header 배지(FavoritesBadge)가 구독 */
export const FAVORITES_EVENT = "msy:favorites";

export interface FavoriteItem {
  path: string;
  title: string;
  addedAt: string;
}

export function safeFavoritePath(path: unknown): path is string {
  if (typeof path !== "string" || path.length > 200 || !path.startsWith("/") || path.startsWith("//") || /[?#\\\s\u0000-\u001f\u007f]/.test(path)) return false;
  try {
    const decoded = decodeURIComponent(path);
    return !/[?#\\\u0000-\u001f\u007f]/.test(decoded) && !decoded.includes("//") && !/%(?:2f|5c|25)/i.test(path) && !/^\/(?:en\/)?(?:api|_next|share|contact|dashboard|report|favorites|widget)(?:\/|$)/.test(decoded);
  } catch { return false; }
}

export function parseFavorites(value: unknown): FavoriteItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 100).flatMap((item: unknown) => {
    if (!item || typeof item !== "object" || !("path" in item) || !("title" in item) || !("addedAt" in item)) return [];
    if (!safeFavoritePath(item.path) || seen.has(item.path) || typeof item.title !== "string" || !item.title.trim() || item.title.length > 200 || /[\u0000-\u001f\u007f]/.test(item.title) || typeof item.addedAt !== "string" || !Number.isFinite(Date.parse(item.addedAt))) return [];
    seen.add(item.path);
    return [{ path: item.path, title: item.title, addedAt: item.addedAt }];
  });
}

/** Default page bookmarks wait for this route's canonical/title; explicit cards keep their supplied target. */
export function resolveFavoriteTarget(pathname: string, context: SharePageContext | null, overrides: { path?: string; title?: string } = {}): Pick<FavoriteItem, "path" | "title"> | null {
  const explicit = overrides.path !== undefined;
  if (!explicit && (!isSharePageReady(context, pathname) || !context)) return null;
  const targetPath = explicit ? overrides.path : context!.pathname;
  if (!safeFavoritePath(targetPath)) return null;
  const currentTitle = context && isSharePageReady(context, pathname) && targetPath === context.pathname ? context.title : targetPath;
  const targetTitle = (overrides.title ?? currentTitle).replace(" | 머니샐러리", "").trim().slice(0, 200);
  if (!targetTitle || /[\u0000-\u001f\u007f]/.test(targetTitle)) return null;
  return { path: targetPath, title: targetTitle };
}

export function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? parseFavorites(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items: FavoriteItem[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(parseFavorites(items)));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
    return true;
  } catch {
    return false;
  }
}

interface FavoritesButtonProps {
  /** 저장될 경로 — 없으면 현재 페이지 pathname */
  path?: string;
  /** 표시될 제목 — 없으면 현재 정본 페이지의 확인된 제목 */
  title?: string;
  /** 변형: "icon"은 아이콘만, "labeled"는 텍스트 동반 */
  variant?: "icon" | "labeled";
  className?: string;
  locale?: "ko" | "en";
}

export default function FavoritesButton({
  path,
  title,
  variant = "labeled",
  className = "",
  locale,
}: FavoritesButtonProps) {
  const { pathname, context } = useSharePageContext();
  const isEnglish = locale ? locale === "en" : /^\/en(?:\/|$)/.test(pathname ?? "");
  const dashboardPath = isEnglish ? "/en/dashboard" : "/dashboard";
  const target = resolveFavoriteTarget(pathname, context, { path, title });
  const resolvedPath = target?.path ?? "";
  const resolvedTitle = target?.title ?? "";
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => setActive(loadFavorites().some((f) => f.path === resolvedPath));
    refresh();
    setToast(false);
    setStorageError(false);
    window.addEventListener(FAVORITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(FAVORITES_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [resolvedPath, resolvedTitle]);

  const toggle = () => {
    if (!target) return;
    // Recheck the live head at the action boundary, including a route/head change before the observer runs.
    const current = path === undefined ? resolveFavoriteTarget(window.location.pathname, {
      pathname: window.location.pathname,
      canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
      title: document.title,
      notFound: !!document.querySelector('[data-page-state="not-found"]'),
    }, { title }) : resolveFavoriteTarget(pathname, context, { path, title });
    if (!current || current.path !== target.path || current.title !== target.title) return;
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
    if (next.length > 100 || !saveFavorites(next)) { setStorageError(true); return; }
    setStorageError(false);
    setActive(!exists);
    trackBookmarkClick(resolvedPath, exists ? "remove" : "add");
    if (!exists) {
      // 추가 시에만 토스트 — 대시보드 재방문 루프의 첫 안내
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }
  };

  // fixed 오버레이 — 문서 흐름·광고 위치를 밀지 않음
  const toastNode = toast && (
    <div
      role="status"
      aria-live="polite"
      className="share-toast fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-navy text-white pl-5 pr-3 py-2.5 rounded-full text-sm font-bold shadow-xl whitespace-nowrap"
    >
      {isEnglish ? "⭐ Saved to favorites" : "⭐ 즐겨찾기에 추가됨"}
      <Link
        href={dashboardPath}
        onClick={() => trackBookmarkClick(resolvedPath, "toast_dashboard")}
        className="px-3 py-1 bg-electric rounded-full text-xs font-bold hover:bg-blue-600 transition-colors"
      >
        {isEnglish ? "View saved pages →" : "대시보드에서 보기 →"}
      </Link>
    </div>
  );

  if (!target) return null;
  const errorNode = storageError && <p role="status" className="mt-2 text-sm text-red-700">{isEnglish ? "Could not save this page. Check browser storage or remove a favorite if you have reached 100." : "저장하지 못했습니다. 브라우저 저장 공간을 확인하거나 즐겨찾기 100개 중 일부를 삭제해 주세요."}</p>;

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={toggle}
          aria-label={isEnglish ? (active ? "Remove favorite" : "Save page to favorites") : (active ? "즐겨찾기 해제" : "즐겨찾기 추가")}
          aria-pressed={active}
          className={`min-h-11 min-w-11 p-2 rounded-full hover:bg-canvas-100 transition-colors ${className}`}
        >
          <Star
            className={`w-5 h-5 ${active ? "fill-amber-400 text-amber-400" : "text-faint-blue"}`}
          />
        </button>
        {toastNode}
        {errorNode}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-bold ${
          active
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-white border-canvas-200 text-navy hover:border-electric"
        } ${className}`}
      >
        <Star
          className={`w-4 h-4 ${active ? "fill-amber-400 text-amber-400" : "text-faint-blue"}`}
        />
        {isEnglish ? (active ? "Saved to favorites" : "Save page to favorites") : (active ? "즐겨찾기 추가됨" : "즐겨찾기 추가")}
      </button>
      {toastNode}
      {errorNode}
    </>
  );
}
