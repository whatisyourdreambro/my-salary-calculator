// src/app/error.tsx — 글로벌 Error Boundary
// Next.js App Router 표준: 페이지 렌더링 중 throw된 에러를 캐치

"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/AppLink";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunkReload";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // 콘솔 로그만 (외부 트래킹 서비스 없음 — Phase E에서 무료 endpoint 추가 예정)
    if (typeof window !== "undefined") {
      console.error("[GlobalError]", error.name, error.message, error.digest);
    }
    // 2026-09-25 CLIENT-01: 배포로 옛 청크가 404 → 새 HTML 로 1회 새로고침(60초에 1회, lib/chunkReload).
    // 이 화면에는 본문 광고가 없어 새로고침이 광고를 잃지 않는다.
    reloadOnceForChunkError(error);
  }, [error]);

  // 서버 컴포넌트 오류는 RSC 를 다시 받아야 풀린다 → refresh + reset 을 한 전환으로.
  // 청크 오류는 React.lazy 가 거부된 import 를 캐시해 재렌더로는 안 풀린다 → 사용자가 누르면 전체 새로고침.
  const retry = () => {
    if (isChunkLoadError(error)) {
      window.location.reload();
      return;
    }
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <main
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center px-4 py-24 bg-canvas dark:bg-canvas-950"
    >
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/40 mb-6">
          <AlertTriangle size={28} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-3xl font-black text-navy dark:text-canvas-50 mb-3">
          페이지를 불러올 수 없습니다
        </h1>
        <p className="text-muted-blue dark:text-canvas-300 mb-8 leading-relaxed">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          {error.digest && (
            <span className="block mt-2 text-xs text-faint-blue">
              오류 ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-electric text-white font-bold transition-all hover:bg-blue-700"
          >
            <RotateCcw size={16} />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50 border border-canvas-200 dark:border-canvas-700 font-bold transition-all"
          >
            <Home size={16} />
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
