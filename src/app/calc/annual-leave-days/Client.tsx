"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import {
  entryBasedSchedule,
  fiscalYearSchedule,
  totalDays,
  type LeaveGrant,
} from "@/lib/annualLeave";

function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function GrantTable({ grants, empty }: { grants: LeaveGrant[]; empty: string }) {
  if (grants.length === 0) {
    return <p className="text-sm text-muted-blue px-1 py-3">{empty}</p>;
  }
  // 최근 발생분이 위로
  const rows = [...grants].reverse().slice(0, 14);
  const hidden = grants.length - rows.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[300px]">
        <thead>
          <tr className="border-b border-canvas-200 dark:border-canvas-700 text-left text-xs text-faint-blue">
            <th className="py-2 px-2 font-bold">발생일</th>
            <th className="py-2 px-2 font-bold">구분</th>
            <th className="py-2 px-2 font-bold text-right">일수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={`${g.grantDate}-${g.label}`} className="border-b border-canvas-100 dark:border-canvas-800">
              <td className="py-1.5 px-2 tabular-nums text-muted-blue dark:text-canvas-300">{g.grantDate}</td>
              <td className="py-1.5 px-2 font-bold text-navy dark:text-canvas-50">{g.label}</td>
              <td className="py-1.5 px-2 tabular-nums font-black text-electric text-right">{g.days}일</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hidden > 0 && (
        <p className="text-[11px] text-faint-blue px-2 pt-2">…이전 발생분 {hidden}건 생략 (합계에는 포함)</p>
      )}
    </div>
  );
}

export default function AnnualLeaveDaysClient() {
  const today = toISO(new Date());
  const [entry, setEntry] = useState("2023-03-02");
  const [until, setUntil] = useState(today);

  const { entryGrants, fiscalGrants, entryTotal, fiscalTotal, valid } = useMemo(() => {
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(entry) && /^\d{4}-\d{2}-\d{2}$/.test(until) && entry <= until;
    if (!ok) return { entryGrants: [], fiscalGrants: [], entryTotal: 0, fiscalTotal: 0, valid: false };
    const eg = entryBasedSchedule(entry, until);
    const fg = fiscalYearSchedule(entry, until);
    return { entryGrants: eg, fiscalGrants: fg, entryTotal: totalDays(eg), fiscalTotal: totalDays(fg), valid: true };
  }, [entry, until]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="al-entry" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">입사일</label>
          <input
            id="al-entry"
            type="date"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50"
            aria-label="입사일"
          />
        </div>
        <div>
          <label htmlFor="al-until" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">기준일 (재직 중인 날)</label>
          <input
            id="al-until"
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="w-full rounded-xl px-4 py-4 text-lg font-black focus:outline-none transition"
            style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2", color: "#0145F2" }}
            aria-label="기준일"
          />
        </div>
      </div>

      {!valid ? (
        <p className="text-sm font-bold text-muted-blue text-center py-4">입사일과 기준일을 확인해 주세요 (기준일은 입사일 이후).</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
          <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              입사일 기준 누적 발생 연차
            </p>
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
              {entryTotal}일
            </div>
            <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              회계연도(1/1) 방식 누적: {fiscalTotal}일 — 개근·80% 출근 가정
            </p>
          </div>
          <div className="bg-white dark:bg-canvas-900 px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-black text-navy dark:text-canvas-50 mb-2">입사일 기준 발생 내역</h3>
              <GrantTable grants={entryGrants} empty="아직 발생한 연차가 없습니다 (1개월 개근 시 1일 발생)." />
            </div>
            <div>
              <h3 className="text-sm font-black text-navy dark:text-canvas-50 mb-2">회계연도(1/1) 기준 발생 내역</h3>
              <GrantTable grants={fiscalGrants} empty="아직 발생한 연차가 없습니다." />
            </div>
          </div>
        </div>
      )}

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}
