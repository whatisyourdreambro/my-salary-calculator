"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import {
  computeSmbTaxBreak,
  youthAdjustedAge,
  YOUTH_MAX_AGE,
  YOUTH_MIN_AGE,
  type SmbBreakType,
} from "@/lib/smbTaxBreak";

function fmt(n: number) { return Math.round(n).toLocaleString("ko-KR"); }
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number { return Number(s.replace(/[^0-9]/g, "")) || 0; }

export default function SmbTaxBreakClient() {
  const [salary, setSalary] = useState("30,000,000");
  const [dependents, setDependents] = useState("1");
  const [breakType, setBreakType] = useState<SmbBreakType>("youth");
  const [age, setAge] = useState("29");
  const [militaryMonths, setMilitaryMonths] = useState("0");

  const r = useMemo(
    () =>
      computeSmbTaxBreak({
        annualSalary: parseInput(salary),
        dependents: parseInput(dependents),
        breakType,
      }),
    [salary, dependents, breakType]
  );

  const adjAge = youthAdjustedAge(parseInput(age), parseInput(militaryMonths));
  const youthOk = adjAge >= YOUTH_MIN_AGE && adjAge <= YOUTH_MAX_AGE;

  const rows = [
    {
      label: "근로소득 산출세액",
      value: `${fmt(r.calculatedTax)}원`,
      sub: `과세표준 ${fmt(r.taxBase)}원 × 누진세율 (소득세법 55조)`,
    },
    {
      label: `감면세액 (${Math.round(r.rate * 100)}%)`,
      value: `−${fmt(r.reduction)}원`,
      sub: r.reductionCapped
        ? "★한도 200만원 적용 (조특법 30조)"
        : "산출세액 × 감면율, 한도 200만원 이내",
    },
    {
      label: "근로소득세액공제 (연동 축소)",
      value: `−${fmt(r.creditAfter)}원`,
      sub: `${fmt(r.creditBefore)}원 → 감면 비율만큼 축소 (소득세법 59조 3항)`,
    },
    {
      label: "감면 적용 결정세액 (근사)",
      value: `${fmt(r.finalTaxWith)}원`,
      sub: "지방소득세 10% 별도",
    },
    {
      label: "감면이 없었다면",
      value: `${fmt(r.finalTaxWithout)}원`,
      sub: "동일 조건 미감면 결정세액 (근사)",
    },
    {
      label: `감면기간 ${r.years}년 총 절감 추정`,
      value: `${fmt(r.savedPeriodTotal)}원`,
      sub: "연봉 동일 가정 · 지방소득세 포함",
    },
  ];

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="smb-salary" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              연봉 (총급여 — 비과세 제외)
            </label>
            <div className="relative">
              <input
                id="smb-salary"
                type="text"
                inputMode="numeric"
                value={salary}
                placeholder="30,000,000"
                onChange={(e) => setSalary(formatInput(e.target.value))}
                className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                aria-label="연봉 (총급여, 비과세 제외)"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
            </div>
          </div>
          <div>
            <label htmlFor="smb-dependents" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              기본공제 인원 (본인 포함)
            </label>
            <div className="relative">
              <input
                id="smb-dependents"
                type="text"
                inputMode="numeric"
                value={dependents}
                placeholder="1"
                onChange={(e) => setDependents(formatInput(e.target.value))}
                className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                aria-label="기본공제 인원 (본인 포함)"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">명</span>
            </div>
          </div>
          <div>
            <label htmlFor="smb-type" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              감면 대상 유형
            </label>
            <select
              id="smb-type"
              value={breakType}
              onChange={(e) => setBreakType(e.target.value as SmbBreakType)}
              className="w-full rounded-xl px-4 py-4 text-base font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50"
              aria-label="감면 대상 유형"
            >
              <option value="youth">청년 (만 15~34세) — 90% · 5년</option>
              <option value="other">60세 이상·장애인·경력단절여성 — 70% · 3년</option>
            </select>
          </div>
        </div>

        {breakType === "youth" && (
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 p-4">
            <p className="text-xs font-bold text-faint-blue mb-3">
              청년 요건 체크 — 근로계약 체결일 현재 만 나이에서 병역기간(최대 6년)을 뺀 나이가 34세 이하
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="smb-age" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
                  취업(근로계약)일 만 나이
                </label>
                <div className="relative">
                  <input
                    id="smb-age"
                    type="text"
                    inputMode="numeric"
                    value={age}
                    placeholder="29"
                    onChange={(e) => setAge(formatInput(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 text-base font-black bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                    aria-label="취업일 기준 만 나이"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">세</span>
                </div>
              </div>
              <div>
                <label htmlFor="smb-mil" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
                  병역 이행기간
                </label>
                <div className="relative">
                  <input
                    id="smb-mil"
                    type="text"
                    inputMode="numeric"
                    value={militaryMonths}
                    placeholder="18"
                    onChange={(e) => setMilitaryMonths(formatInput(e.target.value))}
                    className="w-full rounded-xl px-4 py-3 text-base font-black bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-12"
                    aria-label="병역 이행기간 (개월)"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">개월</span>
                </div>
              </div>
            </div>
            <p className={`mt-3 text-sm font-bold ${youthOk ? "text-electric" : "text-red-500"}`}>
              {parseInput(age) > 0
                ? youthOk
                  ? `병역 차감 후 환산 ${adjAge % 1 === 0 ? adjAge : adjAge.toFixed(1)}세 — 청년 연령 요건 충족`
                  : `병역 차감 후 환산 ${adjAge % 1 === 0 ? adjAge : adjAge.toFixed(1)}세 — 만 ${YOUTH_MAX_AGE}세 초과로 청년 요건 미충족 (60세 이상·장애인·경력단절여성 해당 여부 확인)`
                : "만 나이를 입력하면 연령 요건을 판정합니다"}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            연간 세금 절감액 (소득세 + 지방소득세)
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            {fmt(r.savedAnnualTotal)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            감면율 {Math.round(r.rate * 100)}% · 감면기간 {r.years}년
            {r.reductionCapped ? " · 한도 200만원 적용" : ""}
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-canvas-100 dark:border-canvas-800 pb-2">
              <div>
                <div className="font-bold text-navy dark:text-canvas-50">{row.label}</div>
                <div className="text-[11px] text-faint-blue">{row.sub}</div>
              </div>
              <div className="font-black tabular-nums text-electric shrink-0">{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 결과 직하 광고 */}
      <CalcResultAd />

      <p className="text-[11px] text-faint-blue leading-relaxed">
        근사 계산 안내: 급여 전액이 감면대상 중소기업 근로 제공분이라 가정하고, 공제는
        기본 인적공제(1인 150만원)와 국민연금 연금보험료공제만 반영했습니다. 신용카드·
        월세·보험료·의료비·자녀세액공제 등 개인별 공제는 미반영이므로 실제 결정세액과
        차이가 날 수 있습니다(감면-세액공제 연동 축소는 반영). 감면기간 총액은 연봉이
        기간 내 동일하다는 가정의 추정치입니다.
      </p>
    </div>
  );
}
