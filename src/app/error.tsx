// src/app/error.tsx — 글로벌 Error Boundary
// Next.js App Router 표준: 페이지 렌더링 중 throw된 에러를 캐치

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 콘솔 로그만 (외부 트래킹 서비스 없음 — Phase E에서 무료 endpoint 추가 예정)
    if (typeof window !== "undefined") {
      console.error("[GlobalError]", error.message, error.digest);
    }
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center px-4 py-24 bg-canvas dark:bg-canvas-950"
    >
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-danger-50 dark:bg-danger/10 border border-danger-20 mb-6">
          <AlertTriangle size={28} className="text-danger-700 dark:text-danger" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
          페이지를 불러올 수 없습니다
        </h1>
        <p className="text-muted-blue dark:text-canvas-300 mb-8 leading-relaxed">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          {error.digest && (
            <span className="block mt-3 text-[11px] font-mono text-faint-blue tracking-wider">
              오류 ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary inline-flex"
            style={{ fontSize: "14.5px", padding: "12px 24px" }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            다시 시도
          </button>
          <Link
            href="/"
            className="btn-secondary inline-flex"
            style={{ fontSize: "14.5px", padding: "12px 24px" }}
          >
            <Home size={16} aria-hidden="true" />
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
