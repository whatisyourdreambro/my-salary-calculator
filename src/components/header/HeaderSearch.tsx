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
import type { SearchEntry, SearchCategory } from "@/lib/searchIndex";

// 검색 인덱스(가이드·회사DB·용어·QnA 데이터 포함, gzip 약 425KB)는 정적 import 시
// 전 페이지 First Load JS에 실려 LCP를 지연시킴 — 검색을 열 때만 동적 로드한다.
let searchIndexPromise: Promise<typeof import("@/lib/searchIndex")> | null = null;
function loadSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = import("@/lib/searchIndex");
  }
  return searchIndexPromise;
}

const CATEGORY_BADGE: Record<SearchCategory, { bg: string; text: string }> = {
  계산기: { bg: "#DBEAFE", text: "#1D4ED8" },
  가이드: { bg: "#DCFCE7", text: "#15803D" },
  용어: { bg: "#F3E8FF", text: "#7C3AED" },
  "Q&A": { bg: "#FEF3C7", text: "#B45309" },
  회사: { bg: "#FFE4E6", text: "#E11D48" },
  시즌: { bg: "#FED7AA", text: "#C2410C" },
  도구: { bg: "#CFFAFE", text: "#0E7490" },
};

// 시즌 검색 칩(ko) — 교체 단위. 9/26 교체: KO_CHIP_SETS.SEP → KO_CHIP_SETS.OCT (L13a)
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
// 12/1·1/2 교체 = 한 줄 (아래 chips): KO_CHIP_SETS.OCT → KO_CHIP_SETS.DEC → KO_CHIP_SETS.JAN

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
    // 9/26 교체: KO_CHIP_SETS.SEP → KO_CHIP_SETS.OCT
    chips: KO_CHIP_SETS.SEP,
  },
  en: {
    trigger: "Search",
    ariaOpen: "Open search",
    ariaSearch: "Site search",
    ariaClose: "Close",
    placeholder: "Search calculators & guides",
    empty: "Search calculators, guides, and terms",
    noResults: "No results. Try a different keyword.",
    chips: ["Samsung", "SK Hynix", "ISA", "Tax"],
  },
} as const;

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const S =
    pathname === "/en" || pathname?.startsWith("/en/")
      ? SEARCH_STRINGS.en
      : SEARCH_STRINGS.ko;

  // 검색 디바운스 (input 변화에 따라 결과 업데이트)
  // isOpen 가드: 닫힌 상태(마운트 직후)에 인덱스를 로드하면 지연 로드가 무의미해짐
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { searchEntries } = await loadSearchIndex();
      if (cancelled) return;
      setResults(searchEntries(query, 10));
      setActiveIndex(0);
    }, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  // Cmd/Ctrl+K 단축키로 열기 + ESC 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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

  // 열릴 때 자동 포커스 + 인덱스 선로딩 (첫 타이핑 전에 다운로드 시작)
  useEffect(() => {
    if (isOpen) {
      loadSearchIndex();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
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
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
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
        aria-label={S.ariaSearch}
        className="hidden xl:inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-faint-blue bg-white border border-canvas rounded-xl hover:border-electric/40 hover:text-electric transition-all"
      >
        <Search size={14} />
        <span>{S.trigger}</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-canvas-100 text-faint-blue rounded">
          ⌘K
        </kbd>
      </button>

      {/* lg(1024~1279px) + 모바일: 검색 아이콘만 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={S.ariaOpen}
        className="xl:hidden inline-flex items-center justify-center p-2 rounded-[10px] text-electric hover:bg-electric-10 transition-colors"
      >
        <Search size={20} />
      </button>

      {/* 검색 모달 — createPortal(document.body): 헤더의 backdrop-filter·슬라이드
          transform 이 fixed 자손의 containing block 이 되어 inset-0 이 헤더 박스로
          축소되는 문제를 원천 차단 (2026-08-26 framer 제거 리뷰에서 발견).
          isOpen 은 사용자 상호작용 이후에만 true — SSR 에서 document 미참조. */}
      {isOpen &&
        createPortal(
          <>
            {/* 배경 오버레이 */}
            <div
              className="search-overlay-in fixed inset-0 z-[100] bg-navy/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* 검색 패널
                모바일(< sm): inset-0 풀스크린, 둥근 모서리 없음, 안전 영역 패딩.
                sm 이상: 중앙 정렬 floating 모달.
                min-w-0 + overflow-hidden 으로 child overflow 방지. */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={S.ariaSearch}
              className="search-panel-in fixed z-[101] bg-white shadow-[0_24px_80px_-8px_#0145F244] overflow-hidden border-canvas inset-0 sm:inset-auto sm:top-[8vh] sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(92vw,640px)] sm:max-h-[80vh] sm:rounded-3xl sm:border-[1.5px] flex flex-col"
              style={{
                paddingTop: "env(safe-area-inset-top, 0)",
                paddingBottom: "env(safe-area-inset-bottom, 0)",
              }}
            >
              {/* 입력 영역 */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-canvas-100 min-w-0">
                <Search size={18} className="text-electric flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKey}
                  placeholder={S.placeholder}
                  className="flex-1 min-w-0 bg-transparent text-[15px] font-medium text-navy placeholder:text-faint-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={S.ariaClose}
                  className="flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg text-faint-blue hover:bg-canvas hover:text-navy transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 결과 영역 — flex-1로 모바일에서 남는 영역 채움 */}
              <div className="flex-1 overflow-y-auto overscroll-contain min-w-0">
                {!query.trim() ? (
                  <div className="px-5 py-10 text-center text-sm text-faint-blue">
                    <p className="mb-3 font-medium">{S.empty}</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {S.chips.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setQuery(kw)}
                          className="px-3 py-1.5 text-xs font-semibold bg-canvas-100 text-muted-blue rounded-full hover:bg-electric-10 hover:text-electric transition-colors"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-faint-blue">
                    {S.noResults}
                  </div>
                ) : (
                  <ul className="py-2">
                    {results.map((entry, idx) => {
                      const isActive = idx === activeIndex;
                      const badge = CATEGORY_BADGE[entry.category];
                      return (
                        <li key={`${entry.href}-${idx}`}>
                          <Link
                            href={entry.href}
                            onClick={() => setIsOpen(false)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 transition-colors min-w-0 ${
                              isActive ? "bg-electric-5" : "hover:bg-canvas-50"
                            }`}
                          >
                            <span
                              className="flex-shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black tracking-wide rounded-md"
                              style={{ backgroundColor: badge.bg, color: badge.text }}
                            >
                              {entry.category}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold truncate ${
                                  isActive ? "text-electric" : "text-navy"
                                }`}
                              >
                                {entry.title}
                              </p>
                              {entry.description && (
                                <p className="text-xs text-faint-blue mt-0.5 truncate">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight
                              size={14}
                              className={`flex-shrink-0 transition-all ${
                                isActive
                                  ? "text-electric translate-x-0.5"
                                  : "text-faint-blue"
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
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-canvas-100 bg-canvas-50 flex items-center justify-between text-[11px] text-faint-blue font-medium flex-shrink-0">
                <div className="hidden sm:flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-canvas rounded text-[10px]">↑↓</kbd>
                    탐색
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-canvas rounded text-[10px]">↵</kbd>
                    이동
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-canvas rounded text-[10px]">ESC</kbd>
                    닫기
                  </span>
                </div>
                <span className="sm:hidden">탭해서 이동</span>
                <span>{results.length} 건</span>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
