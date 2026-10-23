"use client";

import { useEffect, useState } from "react";
import { PARTICIPATION_MAX_AGE_SECONDS, type ParticipationTarget } from "@/lib/participationContract";

type Summary = { total: number; helpful: number; confusing: number; generatedAt: number };
const REFRESH_MS = 5 * 60 * 1000;
const MAX_AGE_MS = PARTICIPATION_MAX_AGE_SECONDS * 1000;

export function parseParticipationSummary(value: unknown, now = Date.now()): Summary | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (data.ok !== true || data.visible !== true || data.windowDays !== 28) return null;
  const { total, helpful, confusing, generatedAt } = data;
  if (!Number.isFinite(now) || typeof generatedAt !== "number" || !Number.isSafeInteger(generatedAt)
    || generatedAt <= 0 || generatedAt * 1000 > now || now - generatedAt * 1000 >= MAX_AGE_MS
    || typeof total !== "number" || !Number.isSafeInteger(total) || total < 10
    || typeof helpful !== "number" || !Number.isSafeInteger(helpful) || helpful < 0
    || typeof confusing !== "number" || !Number.isSafeInteger(confusing) || confusing < 0
    || helpful + confusing !== total) return null;
  return { total, helpful, confusing, generatedAt };
}

export function formatParticipationGeneratedAt(generatedAt: number): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(generatedAt * 1000));
}

/** Public aggregate only. Unavailable/expired responses never become a displayed zero. */
export default function ParticipationSummary({ target }: { target: ParticipationTarget }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let expiryTimer: number | undefined;
    let controller: AbortController | undefined;
    let deadline: number | undefined;
    let inFlight = false;
    let refreshRequested = false;
    function hideSummary() {
      window.clearTimeout(expiryTimer);
      setSummary(null);
    }
    async function refresh() {
      if (!active || document.hidden) return;
      if (inFlight) { refreshRequested = true; return; }
      inFlight = true;
      window.clearTimeout(timer);
      hideSummary();
      const requestController = new AbortController();
      controller = requestController;
      deadline = window.setTimeout(() => requestController.abort(), 10000);
      try {
        const response = await fetch(`/api/participation/summary?target=${target}`, {
          credentials: "same-origin", cache: "no-store", signal: requestController.signal,
        });
        // Failed responses still own a body stream. Close it before releasing
        // the deadline or scheduling the next refresh; never parse error data.
        if (!response.ok) await response.body?.cancel();
        const data: unknown = response.ok ? await response.json() : null;
        if (active && !document.hidden && !requestController.signal.aborted) {
          const now = Date.now();
          const parsed = parseParticipationSummary(data, now);
          setSummary(parsed);
          if (parsed) {
            // This uses the device clock. Timers can pause in background tabs;
            // hide on visibility changes and revalidate on return. Polling is
            // not an expiry clock or a promise of immediate remote kill-switches.
            expiryTimer = window.setTimeout(hideSummary, parsed.generatedAt * 1000 + MAX_AGE_MS - now);
          }
        }
      } catch { if (active) hideSummary(); }
      finally {
        window.clearTimeout(deadline);
        inFlight = false;
        controller = undefined;
        if (active && !document.hidden) {
          if (refreshRequested) { refreshRequested = false; void refresh(); }
          else timer = window.setTimeout(refresh, REFRESH_MS);
        } else refreshRequested = false;
      }
    }
    function onVisibilityChange() {
      hideSummary();
      window.clearTimeout(timer);
      controller?.abort();
      refreshRequested = false;
      if (!document.hidden) void refresh();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    void refresh();
    return () => {
      active = false;
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(timer); window.clearTimeout(expiryTimer); window.clearTimeout(deadline);
    };
  }, [target]);
  if (!summary) return <p className="mt-3 text-xs leading-6 text-muted-blue">최근 28일의 공개 집계는 동의한 응답이 10건 이상이고 갱신 상태가 확인될 때 표시합니다.</p>;
  return <div className="mt-3 rounded-xl bg-canvas p-3 text-sm leading-6">
    <p className="font-bold">최근 28일 응답 {summary.total.toLocaleString("ko-KR")}건</p>
    <p>도움 됐어요 {summary.helpful.toLocaleString("ko-KR")}건 · 헷갈려요 {summary.confusing.toLocaleString("ko-KR")}건</p>
    <p className="text-xs text-muted-blue">집계 갱신: <time dateTime={new Date(summary.generatedAt * 1000).toISOString()}>{formatParticipationGeneratedAt(summary.generatedAt)} (KST)</time> · 이 시각까지 최근 28일</p>
    <p className="text-xs text-muted-blue">응답 건수이며, 고유 참여자 수나 전체 이용자의 만족도를 뜻하지 않습니다. 반영에는 시간이 걸릴 수 있습니다.</p>
  </div>;
}
