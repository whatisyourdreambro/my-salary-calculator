"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { compareSeveranceVsPension } from "@/lib/severanceVsPension";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function toEok(n: number): string {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.floor((n % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

// 계산은 src/lib/severanceVsPension.ts — 퇴직소득세는 정본 calculateSeveranceTax, IRP 연금 수령 세금은
// 이연퇴직소득세의 70%(소득세법 제129조 제1항 제5호의3, 수령 1~10년차). 2026-10-05 감사 code6-02·code6-08 정정.

export default function SeveranceClient() {
  const [salaryFmt, setSalaryFmt] = useState("60,000,000");
  const [yearsFmt, setYearsFmt] = useState("10");
  const [growthRate, setGrowthRate] = useState("3");
  const [dcReturn, setDcReturn] = useState("4");

  const salary = parseInput(salaryFmt);
  const years = Math.max(1, Number(yearsFmt) || 1);
  const growth = Number(growthRate) / 100 || 0;
  const dcRet = Number(dcReturn) / 100 || 0;

  const result = useMemo(
    () => compareSeveranceVsPension({ salary, years, growth, dcReturn: dcRet }),
    [salary, years, growth, dcRet]
  );

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          id="salary"
          label="현재 연봉 (세전)"
          value={salaryFmt}
          onChange={setSalaryFmt}
          unit="원"
        />
        <Field
          id="years"
          label="근속 예상 (년)"
          value={yearsFmt}
          onChange={setYearsFmt}
          unit="년"
          plain
        />
        <Field
          id="growth"
          label="연봉 상승률 (%/년)"
          value={growthRate}
          onChange={setGrowthRate}
          unit="%"
          plain
        />
        <Field
          id="dcReturn"
          label="DC 운용 수익률 (%/년)"
          value={dcReturn}
          onChange={setDcReturn}
          unit="%"
          plain
        />
      </div>

      {/* 결과 4가지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ResultCard
          label="① 법정/DB 일시 수령"
          subLabel="평균임금 × 근속연수, 퇴직소득세 분리과세"
          gross={result.dbAmount}
          tax={result.dbTax}
          net={result.dbNet}
          accent="#0145F2"
        />
        <ResultCard
          label="② DC 일시 수령"
          subLabel="매년 적립 + 운용 수익, 퇴직소득세 분리과세"
          gross={result.dcAmount}
          tax={result.dcTax}
          net={result.dcNet}
          accent="#3B82F6"
        />
        <ResultCard
          label="③ DB IRP 연금 수령"
          subLabel="퇴직소득세 30% 감면 (1~10년차 수령)"
          gross={result.dbAmount}
          tax={result.dbAnnuityTax}
          net={result.dbAnnuityNet}
          accent="#10B981"
          highlight
        />
        <ResultCard
          label="④ DC IRP 연금 수령"
          subLabel="DC + IRP 이전 후 분할 수령"
          gross={result.dcAmount}
          tax={result.dcAnnuityTax}
          net={result.dcAnnuityNet}
          accent="#10B981"
          highlight
        />
      </div>

      {/* 인사이트 */}
      <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
          IRP 연금 수령 절세 효과
        </p>
        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mb-1">
          최대 +{toEok(Math.round(result.maxAnnuitySaving))}
        </p>
        <p className="text-xs text-emerald-800 dark:text-emerald-300">
          IRP 이전 후 만 55세 이후 10년 이상 분할 수령 시 일시 수령 대비 위 금액 이상 절세합니다.
        </p>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}

function ResultCard({
  label,
  subLabel,
  gross,
  tax,
  net,
  accent,
  highlight = false,
}: {
  label: string;
  subLabel: string;
  gross: number;
  tax: number;
  net: number;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: highlight ? accent : "#FFFFFF",
        border: highlight ? "none" : "1.5px solid #DDE4EC",
        color: highlight ? "#FFFFFF" : "#0A1829",
        boxShadow: highlight ? `0 8px 24px ${accent}30` : "none",
      }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest mb-1"
        style={{ color: highlight ? "rgba(255,255,255,0.7)" : "#7A9AB5" }}
      >
        {label}
      </p>
      <p
        className="text-[10px] mb-3"
        style={{ color: highlight ? "rgba(255,255,255,0.6)" : "#94A3B8" }}
      >
        {subLabel}
      </p>
      <p className="text-2xl sm:text-3xl font-black tabular-nums mb-1">
        {fmt(net)}원
      </p>
      <div
        className="text-xs flex justify-between mt-3 pt-2"
        style={{
          color: highlight ? "rgba(255,255,255,0.7)" : "#7A9AB5",
          borderTop: highlight ? "1px solid rgba(255,255,255,0.2)" : "1px solid #EDF1F5",
        }}
      >
        <span>세전 {toEok(gross)}</span>
        <span>세금 -{toEok(tax)}</span>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  unit,
  plain = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  plain?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
      >
        {label}
      </label>
      <div className="relative">
        <NumberInput
          id={id}
          type="text"
          inputMode={plain ? "decimal" : "numeric"}
          value={value}
          onChange={(e) =>
            onChange(plain ? e.target.value.replace(/[^0-9.]/g, "") : formatInput(e.target.value))
          }
          className="w-full rounded-xl px-4 py-3 text-base font-black focus:outline-none focus:ring-2 focus:ring-electric/50 transition pr-10 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
          placeholder="0"
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
          {unit}
        </span>
      </div>
    </div>
  );
}
