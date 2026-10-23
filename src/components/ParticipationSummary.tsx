"use client";

import { useEffect, useState } from "react";
import type { ParticipationTarget } from "@/lib/participationContract";

type Summary = { total: number; helpful: number; confusing: number };
const REFRESH_MS = 5 * 60 * 1000;

export function parseParticipationSummary(value: unknown): Summary | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (data.ok !== true || data.visible !== true || data.windowDays !== 28) return null;
  const { total, helpful, confusing } = data;
  if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 10
    || typeof helpful !== "number" || !Number.isSafeInteger(helpful) || helpful < 0
    || typeof confusing !== "number" || !Number.isSafeInteger(confusing) || confusing < 0
    || helpful + confusing !== total) return null;
  return { total, helpful, confusing };
}

/** Public counts only. Unavailable/expired responses never become a displayed zero. */
export default function ParticipationSummary({ target }: { target: ParticipationTarget }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let controller: AbortController | undefined;
    let deadline: number | undefined;
    async function refresh() {
      setSummary(null);
      controller = new AbortController();
      deadline = window.setTimeout(() => controller?.abort(), 10000);
      try {
        const response = await fetch(`/api/participation/summary?target=${target}`, {
          credentials: "same-origin", cache: "no-store", signal: controller.signal,
        });
        // Failed responses still own a body stream. Close it before releasing
        // the deadline or scheduling the next refresh; never parse error data.
        if (!response.ok) await response.body?.cancel();
        const data: unknown = response.ok ? await response.json() : null;
        if (active) setSummary(parseParticipationSummary(data));
      } catch { if (active) setSummary(null); }
      finally {
        window.clearTimeout(deadline);
        if (active) timer = window.setTimeout(refresh, REFRESH_MS);
      }
    }
    void refresh();
    return () => { active = false; controller?.abort(); window.clearTimeout(timer); window.clearTimeout(deadline); };
  }, [target]);
  if (!summary) return <p className="mt-3 text-xs leading-6 text-muted-blue">최근 28일의 공개 집계는 동의한 응답이 10건 이상이고 갱신 상태가 확인될 때 표시합니다.</p>;
  return <div className="mt-3 rounded-xl bg-canvas p-3 text-sm leading-6">
    <p className="font-bold">최근 28일 응답 {summary.total.toLocaleString("ko-KR")}건</p>
    <p>도움 됐어요 {summary.helpful.toLocaleString("ko-KR")}건 · 헷갈려요 {summary.confusing.toLocaleString("ko-KR")}건</p>
    <p className="text-xs text-muted-blue">응답 건수이며, 고유 참여자 수나 전체 이용자의 만족도를 뜻하지 않습니다. 반영에는 시간이 걸릴 수 있습니다.</p>
  </div>;
}
