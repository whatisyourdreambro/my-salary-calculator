// src/components/InstallPwaBanner.tsx
//
// PWA "홈 화면에 추가" 유도 배너.
// - beforeinstallprompt 이벤트 캡처 → 원하는 타이밍에 prompt 표시
// - 3 PV 이상 + 모바일에서만 노출 (UX 보호)
// - 거부 시 30일간 안 보임 (localStorage 플래그)
//
// 락인 시스템: 홈 화면 설치 사용자는 재방문율 5~10배 ↑ → 광고 누적 수익 ↑.

"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const PV_KEY = "msy_pv_count";
const DISMISS_KEY = "msy_pwa_dismissed_until";
const MIN_PV = 3;
const DISMISS_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) PV 카운트 증가 (페이지 단위)
    try {
      const current = Number(window.localStorage.getItem(PV_KEY) ?? "0");
      window.localStorage.setItem(PV_KEY, String(current + 1));
    } catch {
      return;
    }

    // 2) 거부 플래그 확인
    try {
      const dismissedUntil = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
      if (dismissedUntil > Date.now()) return;
    } catch {
      return;
    }

    // 3) PV 임계 + 모바일 체크
    const pv = Number(window.localStorage.getItem(PV_KEY) ?? "0");
    if (pv < MIN_PV) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    // 4) beforeinstallprompt 캡처
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
    if (outcome === "dismissed") rememberDismiss();
  };

  const handleDismiss = () => {
    setVisible(false);
    rememberDismiss();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="홈 화면에 추가"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md p-4 rounded-2xl bg-navy text-white shadow-2xl flex items-center gap-3 animate-slide-up"
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-electric flex items-center justify-center">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight mb-0.5">
          홈 화면에 머니샐러리 추가
        </p>
        <p className="text-xs opacity-80">앱처럼 빠르게 — 1초 실행</p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="px-3 py-2 bg-electric text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
      >
        추가
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="닫기"
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function rememberDismiss() {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(DISMISS_KEY, String(until));
  } catch {
    // ignore
  }
}
