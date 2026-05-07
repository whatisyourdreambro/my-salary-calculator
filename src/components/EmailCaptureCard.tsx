// src/components/EmailCaptureCard.tsx
//
// 이메일 수집 카드 — 락인(재방문) 토대.
// 1단계: localStorage에만 저장 (외부 의존성 0, 사장님 가입 없이도 동작)
// 2단계: STIBEE_API_KEY ENV가 채워지면 Stibee로 자동 동기화 (별도 server route 필요)
//
// "재방문 → 광고 누적 노출 → 수익 ↑" 경로의 기반.

"use client";

import { useState } from "react";
import { Mail, CheckCircle2, X } from "lucide-react";

const STORAGE_KEY = "msy_email_subscriptions";

type CaptureContext =
  | "year-end-tax"
  | "salary-negotiation"
  | "new-year"
  | "new-employee"
  | "general";

interface SubscriptionRecord {
  email: string;
  context: CaptureContext;
  capturedAt: string;
  path: string;
}

function loadSubscriptions(): SubscriptionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SubscriptionRecord[]) : [];
  } catch {
    return [];
  }
}

function saveSubscription(record: SubscriptionRecord) {
  if (typeof window === "undefined") return;
  const existing = loadSubscriptions();
  const merged = [...existing.filter((r) => r.email !== record.email), record];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // QuotaExceeded 등 무시 — 광고/CTA가 메인 경로
  }
}

const CONTEXT_COPY: Record<CaptureContext, { headline: string; subline: string }> = {
  "year-end-tax": {
    headline: "연말정산 환급 팁, 이메일로 받기",
    subline: "11월·1월 시즌마다 환급금 더 받는 5가지를 보내드려요.",
  },
  "salary-negotiation": {
    headline: "연봉협상 시즌 알림",
    subline: "1월·12월 협상 타이밍과 시장 평균을 메일로 보내드려요.",
  },
  "new-year": {
    headline: "새해 세법 변경 한눈에",
    subline: "1월 1일 변경되는 세법·4대보험 요율을 미리 받아보세요.",
  },
  "new-employee": {
    headline: "신입 직장인 가이드 받기",
    subline: "첫 월급·연말정산·청약 등 12개월 체크리스트 메일.",
  },
  general: {
    headline: "머니샐러리 인사이트 받기",
    subline: "월 1회, 직장인 머니 팁만 골라 메일로.",
  },
};

interface EmailCaptureCardProps {
  context?: CaptureContext;
  className?: string;
  /** 닫기 버튼 노출 여부 (모달용) */
  dismissible?: boolean;
}

export default function EmailCaptureCard({
  context = "general",
  className = "",
  dismissible = false,
}: EmailCaptureCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [dismissed, setDismissed] = useState(false);
  const copy = CONTEXT_COPY[context];

  if (dismissed) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("submitting");

    saveSubscription({
      email,
      context,
      capturedAt: new Date().toISOString(),
      path: typeof window !== "undefined" ? window.location.pathname : "",
    });

    // Stibee API 후속 연동: ENV 있으면 fetch (지금은 localStorage만)
    if (process.env.NEXT_PUBLIC_STIBEE_PUBLIC_FORM_URL) {
      try {
        await fetch(process.env.NEXT_PUBLIC_STIBEE_PUBLIC_FORM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email,
            context,
          }).toString(),
          mode: "no-cors",
        });
      } catch {
        // 네트워크 오류여도 localStorage엔 저장됐으니 재시도는 추후
      }
    }

    setStatus("done");
  };

  return (
    <div
      className={`relative my-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-electric to-blue-600 text-white shadow-lg ${className}`}
    >
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="닫기"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-black mb-1">{copy.headline}</h3>
          <p className="text-sm opacity-90 mb-4">{copy.subline}</p>

          {status === "done" ? (
            <p className="inline-flex items-center gap-2 text-sm font-bold bg-white/15 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              구독 완료! 다음 시즌에 메일이 갑니다.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-navy bg-white text-sm font-medium placeholder:text-faint-blue focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="이메일 주소"
                required
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="px-5 py-2.5 bg-white text-electric font-bold text-sm rounded-xl hover:bg-canvas-50 transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {status === "submitting" ? "구독 중..." : "구독하기"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-xs mt-2 text-amber-100">
              올바른 이메일 주소를 입력해주세요.
            </p>
          )}

          <p className="text-[10px] opacity-70 mt-3">
            언제든 메일 하단의 구독 취소 링크로 해지할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
