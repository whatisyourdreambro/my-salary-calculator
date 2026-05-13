// src/components/header/HeaderSearch.tsx
//
// 헤더 통합 검색바. 계산기·가이드·용어·Q&A·회사·시즌 페이지를 한 번에 검색.
// 키보드 단축키 (Cmd/Ctrl+K) 로도 열림.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Loader } from "lucide-react";
import { searchEntries, type SearchEntry, type SearchCategory } from "@/lib/searchIndex";

const CATEGORY_BADGE: Record<SearchCategory, { bg: string; text: string }> = {
  계산기: { bg: "#DBEAFE", text: "#1D4ED8" },
  가이드: { bg: "#DCFCE7", text: "#15803D" },
  용어: { bg: "#F3E8FF", text: "#7C3AED" },
  "Q&A": { bg: "#FEF3C7", text: "#B45309" },
  회사: { bg: "#FFE4E6", text: "#E11D48" },
  시즌: { bg: "#FED7AA", text: "#C2410C" },
  도구: { bg: "#CFFAFE", text: "#0E7490" },
};

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // 검색 디바운스 (input 변화에 따라 결과 업데이트)
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchEntries(query, 10));
      setActiveIndex(0);
    }, 80);
    return () => clearTimeout(timer);
  }, [query]);

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

  // 열릴 때 자동 포커스
  useEffect(() => {
    if (isOpen) {
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
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="사이트 검색"
        className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-faint-blue bg-white border border-canvas rounded-xl hover:border-electric/40 hover:text-electric transition-all"
      >
        <Search size={14} />
        <span>계산기·가이드 검색</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-canvas-100 text-faint-blue rounded">
          ⌘K
        </kbd>
      </button>

      {/* 모바일 아이콘 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="검색 열기"
        className="md:hidden inline-flex items-center justify-center p-2 rounded-[10px] text-electric hover:bg-electric-10 transition-colors"
      >
        <Search size={20} />
      </button>

      {/* 검색 모달 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] bg-navy/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* 검색 패널 */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="사이트 검색"
              className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-[min(92vw,640px)] z-[101] bg-white rounded-3xl shadow-[0_24px_80px_-8px_#0145F244] overflow-hidden border-[1.5px] border-canvas"
            >
              {/* 입력 영역 */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-canvas-100">
                <Search size={18} className="text-electric flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKey}
                  placeholder="계산기·가이드·용어·회사를 한 번에 검색…"
                  className="flex-1 bg-transparent text-[15px] font-medium text-navy placeholder:text-faint-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="닫기"
                  className="flex items-center justify-center p-1.5 rounded-lg text-faint-blue hover:bg-canvas hover:text-navy transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 결과 영역 */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query.trim() ? (
                  <div className="px-5 py-10 text-center text-sm text-faint-blue">
                    <p className="mb-3 font-medium">계산기·가이드·용어를 검색해 보세요</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {["연말정산", "퇴직금", "삼성전자", "DSR", "IRP", "FIRE"].map((kw) => (
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
                    검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
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
                            className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                              isActive ? "bg-electric-5" : "hover:bg-canvas-50"
                            }`}
                          >
                            <span
                              className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-black tracking-wide rounded-md"
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

              {/* 하단 안내 */}
              <div className="px-5 py-3 border-t border-canvas-100 bg-canvas-50 flex items-center justify-between text-[11px] text-faint-blue font-medium">
                <div className="flex items-center gap-3">
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
                <span>{results.length} 건</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
