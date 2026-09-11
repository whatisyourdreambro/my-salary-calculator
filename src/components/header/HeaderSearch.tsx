// src/components/header/HeaderSearch.tsx
//
// 헤더 통합 검색바. 계산기·가이드·용어·Q&A·회사·시즌 페이지를 한 번에 검색.
// 키보드 단축키 (Cmd/Ctrl+K) 로도 열림.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import Link from "@/components/AppLink";
import { Search, X, ArrowRight } from "lucide-react";
import type { SearchEntry } from "@/lib/searchIndex";
import { useModalDialog } from "@/hooks/useModalDialog";
import { SEASON_KEY } from "@/config/seasonKey.generated";

// 검색 인덱스(가이드·회사DB·용어·QnA 데이터 포함, gzip 약 425KB)는 정적 import 시
// 전 페이지 First Load JS에 실려 LCP를 지연시킴 — 검색을 열 때만 동적 로드한다.
let searchIndexPromise: Promise<typeof import("@/lib/searchIndex")> | null = null;
let englishIndexPromise: Promise<typeof import("@/lib/searchIndexEn")> | null = null;
async function loadSearchIndex(english: boolean) {
  if (english) {
    englishIndexPromise ??= import("@/lib/searchIndexEn");
    return { searchEntries: (await englishIndexPromise).searchEnglishEntries };
  }
  if (!searchIndexPromise) {
    searchIndexPromise = import("@/lib/searchIndex");
  }
  return searchIndexPromise;
}

// 시즌 검색 칩(ko) — 교체 단위. 활성 세트는 빌드 시점 키 SEASON_KEY 가 고른다 (S1-1 2026-09-11):
// ~9/25 SEP → 9/26 OCT → 12/1 DEC 자동(KST), JAN 은 src/lib/seasonKey.ts SEASON_KEY_OVERRIDE 로 수동.
// 클라이언트 컴포넌트라 new Date() 대신 빌드 상수를 써야 서버·클라 칩이 일치한다(hydration).
const KO_CHIP_SETS = {
  // 9월 추석 세트 — 전면 최적화 (운영자 지시 2026-09-02)
  SEP: ["추석 상여금", "연말정산", "성과급", "퇴직금", "삼성전자", "DSR", "IRP"],
  // 10월 연말정산 예열 세트 (2026-09-05 사전 제작) — 검색 인덱스에 /year-end-tax-preview 존재
  OCT: ["연말정산 미리보기", "연말정산", "성과급", "퇴직금", "삼성전자", "DSR", "IRP"],
  // 12월 연말정산 마감·TAI 세트 (2026-09-05 사전 제작) — 칩 전부 검색 인덱스 매치 확인
  // ("TAI" 는 삼성 성과급 계산기 description 매치). 지급률 수치 칩 금지.
  DEC: ["연말정산", "TAI", "신용카드", "의료비", "성과급", "삼성전자", "IRP"],
  // 1월 간소화·OPI 세트 (2026-09-05 사전 제작) — "연말정산 간소화" 는 인덱스 0건이라 "연말정산"
  // 으로 대체, "2027 연봉" → /table/2027/annual, "13월의 월급" → /calc/january-bonus 매치 확인.
  JAN: ["연말정산", "OPI", "신용카드", "2027 연봉", "13월의 월급", "삼성전자", "IRP"],
} as const;
// 네 키 전부 정의돼 있어야 KO_CHIP_SETS[SEASON_KEY] 가 타입 검사를 통과한다 — 키 추가 시 함께 추가.

// /en 페이지 UI 문구 분기 — 푸터의 /en 분기와 동일 패턴 (검색 인덱스 자체는 공용)
const SEARCH_STRINGS = {
  ko: {
    trigger: "검색",
    ariaOpen: "검색 열기",
    ariaSearch: "사이트 검색",
    ariaClose: "닫기",
    placeholder: "계산기·가이드·용어 검색",
    empty: "계산기·가이드·용어를 검색해 보세요",
    noResults: "검색 결과가 없습니다. 다른 키워드로 검색해 보세요.",
    loadError: "검색을 불러오지 못했습니다. 닫은 뒤 다시 열어 주세요.",
    // 빌드 시점 시즌 키로 자동 선택 (S1-1) — 수동 교체 금지
    chips: KO_CHIP_SETS[SEASON_KEY],
  },
  en: {
    trigger: "Search",
    ariaOpen: "Open search",
    ariaSearch: "Site search",
    ariaClose: "Close",
    placeholder: "Search calculators & guides",
    empty: "Search the English calculators and guides",
    noResults: "No results. Try a different keyword.",
    loadError: "Search could not load. Close and reopen it to try again.",
    chips: ["Salary", "Flat tax", "Currency", "Insurance", "Help"],
  },
} as const;

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  useModalDialog(isOpen, dialogRef);
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname?.startsWith("/en/");
  const S =
    pathname === "/en" || pathname?.startsWith("/en/")
      ? SEARCH_STRINGS.en
      : SEARCH_STRINGS.ko;

  // 검색 디바운스 (input 변화에 따라 결과 업데이트)
  // isOpen 가드: 닫힌 상태(마운트 직후)에 인덱스를 로드하면 지연 로드가 무의미해짐
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    const timer = setTimeout(async () => {
      try {
        const { searchEntries } = await loadSearchIndex(isEn);
        if (cancelled) return;
        setResults(searchEntries(query, 10));
        setActiveIndex(0);
      } catch {
        searchIndexPromise = null;
        englishIndexPromise = null;
        if (!cancelled) { setResults([]); setLoadError(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen, isEn]);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Cmd/Ctrl+K 단축키로 열기 + ESC 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (document.querySelector("dialog[open]") && !dialogRef.current?.open) return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Native dialog focuses the labelled input and restores the opener on close.
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  // 화살표 ↑↓ + Enter 키 네비게이션
  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, Math.min(prev + 1, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      handleSelect(results[activeIndex].href);
    }
  };

  return (
    <>
      {/* 트리거 버튼 — lg 미만 / xl 이상 분기로 너비 조절 */}
      {/* xl(1280px+): 검색바 + 텍스트 + ⌘K */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={S.ariaOpen}
        className="ms-interactive hover:!translate-y-0 hover:!shadow-none hidden min-h-11 xl:inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-muted-foreground bg-card border border-border rounded-xl hover:bg-secondary"
      >
        <Search size={14} aria-hidden="true" />
        <span>{S.trigger}</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-secondary text-muted-foreground rounded">
          ⌘K
        </kbd>
      </button>

      {/* lg(1024~1279px) + 모바일: 검색 아이콘만 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={S.ariaOpen}
        className="ms-interactive hover:!translate-y-0 hover:!shadow-none xl:hidden inline-flex min-w-11 min-h-11 items-center justify-center p-2 rounded-xl text-foreground hover:bg-secondary"
      >
        <Search size={20} aria-hidden="true" />
      </button>

      {/* 검색 모달 — createPortal(document.body): 헤더의 backdrop-filter·슬라이드
          transform 이 fixed 자손의 containing block 이 되어 inset-0 이 헤더 박스로
          축소되는 문제를 원천 차단 (2026-08-26 framer 제거 리뷰에서 발견).
          isOpen 은 사용자 상호작용 이후에만 true — SSR 에서 document 미참조. */}
      {isOpen &&
        createPortal(
          <>
            {/* 검색 패널
                모바일(< sm): inset-0 풀스크린, 둥근 모서리 없음, 안전 영역 패딩.
                sm 이상: 중앙 정렬 floating 모달.
                min-w-0 + overflow-hidden 으로 child overflow 방지. */}
            <dialog
              ref={dialogRef}
              onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}
              onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setIsOpen(false);
              }}
              aria-label={S.ariaSearch}
              className="fixed m-0 p-0 h-dvh w-screen max-h-none max-w-none bg-card text-foreground shadow-xl overflow-hidden border-0 border-border inset-0 sm:inset-auto sm:top-[8vh] sm:left-1/2 sm:-translate-x-1/2 sm:h-auto sm:w-[min(92vw,640px)] sm:max-h-[80vh] sm:rounded-2xl sm:border open:flex flex-col backdrop:bg-black/40"
              style={{
                paddingTop: "env(safe-area-inset-top, 0)",
                paddingBottom: "env(safe-area-inset-bottom, 0)",
              }}
            >
              {/* 입력 영역 */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-border min-w-0">
                <Search size={18} className="text-link flex-shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  aria-label={S.placeholder}
                  aria-controls="site-search-results"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKey}
                  placeholder={S.placeholder}
                  className="ms-field flex-1 min-h-11 min-w-0 text-base font-medium placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={S.ariaClose}
                  className="flex-shrink-0 flex min-w-11 min-h-11 items-center justify-center p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-electric"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* 결과 영역 — flex-1로 모바일에서 남는 영역 채움 */}
              <div className="flex-1 overflow-y-auto overscroll-contain min-w-0">
                {loadError ? <p role="alert" className="p-5 text-sm">{S.loadError}</p> : !query.trim() ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    <p className="mb-3 font-medium">{S.empty}</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {S.chips.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setQuery(kw)}
                          className="min-h-11 px-3 py-1.5 text-xs font-semibold bg-secondary text-muted-foreground rounded-full hover:bg-secondary hover:text-link transition-colors focus-visible:ring-2 focus-visible:ring-electric"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : loading ? <p role="status" className="p-5 text-sm">{isEn ? "Searching…" : "검색 중…"}</p> : results.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    {S.noResults}
                  </div>
                ) : (
                  <ul id="site-search-results" className="py-2">
                    {results.map((entry, idx) => {
                      const isActive = idx === activeIndex;

                      return (
                        <li key={`${entry.href}-${idx}`}>
                          <Link
                            id={`site-search-result-${idx}`}
                            href={entry.href}
                            onClick={() => setIsOpen(false)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`ms-interactive hover:!translate-y-0 hover:!shadow-none flex min-h-11 items-center gap-2.5 px-4 sm:px-5 py-3 transition-colors min-w-0 ${
                              isActive ? "bg-secondary" : "hover:bg-secondary"
                            }`}
                          >
                            <span
                              className="flex-shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-background text-muted-foreground border border-border"

                            >
                              {isEn ? ({ 계산기: "Calculator", 가이드: "Guide", 용어: "Glossary", "Q&A": "Q&A", 회사: "Company", 시즌: "Seasonal", 도구: "Tool" } as const)[entry.category] : entry.category}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold line-clamp-2 break-words ${
                                  isActive ? "text-link" : "text-foreground"
                                }`}
                              >
                                {entry.title}
                              </p>
                              {entry.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight
                              size={14}
                              className={`flex-shrink-0 transition-all ${
                                isActive
                                  ? "text-link translate-x-0.5"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 하단 안내 — 모바일에서는 키보드 단축키 숨김 (탭 환경) */}
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-border bg-secondary flex items-center justify-between text-[11px] text-muted-foreground font-medium flex-shrink-0">
                <div className="hidden sm:flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↑↓</kbd>
                    {isEn ? "Browse" : "탐색"}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">↵</kbd>
                    {isEn ? "Open" : "이동"}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px]">ESC</kbd>
                    {isEn ? "Close" : "닫기"}
                  </span>
                </div>
                <span className="sm:hidden">{isEn ? "Tap a result to open" : "탭해서 이동"}</span>
                <span role="status" aria-live="polite">
                  {!loading && query.trim() ? (isEn ? `${results.length} ${results.length === 1 ? "result" : "results"}` : `${results.length} 건`) : ""}
                  {!loading && query.trim() && results[activeIndex] && <span className="sr-only">{isEn ? ` Highlighted: ${results[activeIndex].title}. Press Enter to open.` : ` 선택: ${results[activeIndex].title}. Enter로 이동할 수 있습니다.`}</span>}
                </span>
              </div>
            </dialog>
          </>,
          document.body
        )}
    </>
  );
}
