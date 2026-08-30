"use client";

// src/app/health-insurance-dependent/Client.tsx
// 건강보험 피부양자 자격 판정기 — 문항 입력 → 유지/탈락 판정 (룰 판정형).
// 룰 정본: 국민건강보험법 시행규칙 별표 1의2 (2022년 9월 2단계 부과체계 개편 후 현행).
// ★보험료 계산 로직 없음 — 탈락 시 지역가입자 보험료는 /health-insurance-fee-2026으로 연결.
// 갱신 슬롯: 매년 9~10월 — 별표1의2 기준 개정 확인(11월 재산정 전)

import { useMemo, useState } from "react";
import Link from "@/components/AppLink";

// ── 별표 1의2 판정 기준 (원 단위) ──────────────────────────────
const INCOME_CAP = 20_000_000; // 연간 합산소득 2,000만원 이하
const INCOME_RELAXED_CAP = 10_000_000; // 재산 5.4억 초과~9억 이하 구간에서 요구되는 연 소득
const BIZ_INCOME_CAP_UNREGISTERED = 5_000_000; // 사업자등록 없을 때 사업소득 연 500만원 이하
const PROPERTY_PASS = 540_000_000; // 재산세 과세표준 5.4억원 이하 → 통과
const PROPERTY_MAX = 900_000_000; // 재산세 과세표준 9억원 초과 → 탈락
const PROPERTY_SIBLING_CAP = 180_000_000; // 형제자매 재산세 과세표준 1.8억원 이하

type Relationship = "spouse" | "ascendant" | "descendant" | "sibling" | "other";
type SiblingException = "age65" | "under30" | "disabled" | "none";

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string; hint: string }[] = [
  { value: "spouse", label: "배우자", hint: "직장가입자의 남편·아내" },
  {
    value: "ascendant",
    label: "부모·조부모 (직계존속)",
    hint: "배우자의 직계존속(장인·장모·시부모 등) 포함",
  },
  {
    value: "descendant",
    label: "자녀·손자녀 (직계비속)와 그 배우자",
    hint: "배우자의 직계비속 포함, 사위·며느리 포함",
  },
  { value: "sibling", label: "형제자매", hint: "원칙 제외 — 예외 요건 추가 확인" },
  { value: "other", label: "그 외 (삼촌·이모·조카 등)", hint: "피부양자 대상 아님" },
];

const SIBLING_EXCEPTION_OPTIONS: { value: SiblingException; label: string }[] = [
  { value: "age65", label: "65세 이상" },
  { value: "under30", label: "30세 미만" },
  { value: "disabled", label: "장애인 (국가유공자·보훈보상대상자 상이등급 포함)" },
  { value: "none", label: "해당 없음" },
];

/** 만원 단위 숫자를 "1억 2,000만원" 형태로 표기 */
function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10_000);
  const rest = Math.round(manwon % 10_000);
  if (eok > 0 && rest > 0) return `${eok.toLocaleString("ko-KR")}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok.toLocaleString("ko-KR")}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

export default function HealthInsuranceDependentClient() {
  // 입력은 만원 단위 (판정은 원 단위로 환산)
  const [relationship, setRelationship] = useState<Relationship>("ascendant");
  const [siblingException, setSiblingException] = useState<SiblingException>("none");
  const [incomeManwon, setIncomeManwon] = useState(1_200); // 연간 합산소득 1,200만원 예시
  const [hasBizRegistration, setHasBizRegistration] = useState(false);
  const [bizIncomeManwon, setBizIncomeManwon] = useState(0);
  const [propertyManwon, setPropertyManwon] = useState(30_000); // 재산세 과세표준 3억원 예시

  const result = useMemo(() => {
    const income = incomeManwon * 10_000;
    const bizIncome = bizIncomeManwon * 10_000;
    const property = propertyManwon * 10_000;
    const reasons: string[] = [];
    const notes: string[] = [];

    // ── 1. 부양요건 (관계) ──
    if (relationship === "other") {
      reasons.push(
        "부양요건 미충족 — 피부양자는 직장가입자의 배우자, 직계존속(배우자의 직계존속 포함), 직계비속(배우자의 직계비속 포함)과 그 배우자, 요건을 충족한 형제자매만 될 수 있습니다. 삼촌·이모·조카 등 그 외 친족은 대상이 아닙니다."
      );
    }
    if (relationship === "sibling" && siblingException === "none") {
      reasons.push(
        "형제자매 예외 요건 미충족 — 2022년 9월 개편 이후 형제자매는 원칙적으로 피부양자에서 제외되며, 65세 이상·30세 미만·장애인(국가유공자·보훈보상대상자 상이등급 포함)만 예외로 인정됩니다."
      );
    }

    // ── 2. 소득요건 ──
    if (income > INCOME_CAP) {
      reasons.push(
        `소득요건 미충족 — 연간 합산소득이 ${fmtManwon(incomeManwon)}으로 기준(2,000만원 이하)을 초과합니다. 초과 시 금액과 관계없이 탈락합니다.`
      );
    }
    if (hasBizRegistration && bizIncome > 0) {
      reasons.push(
        `사업소득 요건 미충족 — 사업자등록이 있는 경우 사업소득이 없어야(0원) 합니다. 현재 입력된 사업소득은 연 ${fmtManwon(bizIncomeManwon)}입니다.`
      );
    }
    if (!hasBizRegistration && bizIncome > BIZ_INCOME_CAP_UNREGISTERED) {
      reasons.push(
        `사업소득 요건 미충족 — 사업자등록이 없는 경우(프리랜서 등) 사업소득은 연 500만원 이하여야 합니다. 현재 입력된 사업소득은 연 ${fmtManwon(bizIncomeManwon)}입니다.`
      );
    }

    // ── 3. 재산요건 ──
    if (relationship === "sibling") {
      // 형제자매는 재산세 과세표준 1.8억원 이하 (별도 기준)
      if (property > PROPERTY_SIBLING_CAP) {
        reasons.push(
          `재산요건 미충족 — 형제자매는 재산세 과세표준이 1억 8,000만원 이하여야 합니다. 현재 입력값은 ${fmtManwon(propertyManwon)}입니다.`
        );
      }
    } else {
      if (property > PROPERTY_MAX) {
        reasons.push(
          `재산요건 미충족 — 재산세 과세표준이 ${fmtManwon(propertyManwon)}으로 9억원을 초과합니다. 9억원 초과는 소득과 관계없이 탈락합니다.`
        );
      } else if (property > PROPERTY_PASS) {
        if (income > INCOME_RELAXED_CAP) {
          reasons.push(
            `재산요건 미충족 — 재산세 과세표준이 5억 4,000만원 초과~9억원 이하 구간(현재 ${fmtManwon(propertyManwon)})이면 연간 합산소득이 1,000만원 이하여야 하는데, 입력된 소득은 ${fmtManwon(incomeManwon)}입니다.`
          );
        } else {
          notes.push(
            `재산세 과세표준이 5억 4,000만원을 초과하지만(${fmtManwon(propertyManwon)}), 연간 합산소득이 1,000만원 이하이므로 9억원 이하 완화 구간이 적용되어 재산요건을 통과합니다.`
          );
        }
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      notes,
    };
  }, [
    relationship,
    siblingException,
    incomeManwon,
    hasBizRegistration,
    bizIncomeManwon,
    propertyManwon,
  ]);

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric";

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          피부양자 자격 즉시 판정
        </h2>

        {/* ① 관계 */}
        <fieldset className="mb-5">
          <legend className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ① 직장가입자와의 관계
          </legend>
          <div className="space-y-2">
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  relationship === opt.value
                    ? "border-electric bg-electric-5"
                    : "border-canvas-200 dark:border-canvas-700"
                }`}
              >
                <input
                  type="radio"
                  name="relationship"
                  checked={relationship === opt.value}
                  onChange={() => setRelationship(opt.value)}
                  className="w-4 h-4 mt-0.5"
                />
                <span className="text-sm font-medium text-navy dark:text-canvas-100">
                  {opt.label}
                  <span className="block text-xs font-normal text-faint-blue mt-0.5">
                    {opt.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ①-1 형제자매 예외 (조건부) */}
        {relationship === "sibling" && (
          <fieldset className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
            <legend className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
              ①-1 형제자매 예외 요건 — 해당하는 항목이 있나요?
            </legend>
            <div className="space-y-2">
              {SIBLING_EXCEPTION_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="siblingException"
                    checked={siblingException === opt.value}
                    onChange={() => setSiblingException(opt.value)}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="text-sm font-medium text-navy dark:text-canvas-100">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-200 leading-5">
              형제자매는 위 예외에 해당하더라도 재산세 과세표준 1억 8,000만원 이하 요건이 별도로
              적용됩니다 (일반 대상자의 5억 4,000만원보다 엄격).
            </p>
          </fieldset>
        )}

        {/* ② 연간 합산소득 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ② 연간 합산소득 (만원)
          </label>
          <input
            type="number"
            value={incomeManwon}
            onChange={(e) => setIncomeManwon(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={100}
            className={inputCls}
            aria-label="연간 합산소득 (만원)"
          />
          <p className="mt-2 text-xs text-faint-blue leading-5">
            이자·배당·사업·근로·연금(공적연금)·기타소득의 연간 합계 = {fmtManwon(incomeManwon)}.
            이자·배당(금융소득)은 합계 연 1,000만원 이하면 합산하지 않고, 초과하면 전액
            합산합니다. 사업소득도 여기에 포함해 입력하세요.
          </p>
        </div>

        {/* ③ 사업자등록 여부 */}
        <fieldset className="mb-4">
          <legend className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ③ 사업자등록이 있나요?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                hasBizRegistration
                  ? "border-electric bg-electric-5"
                  : "border-canvas-200 dark:border-canvas-700"
              }`}
            >
              <input
                type="radio"
                name="bizReg"
                checked={hasBizRegistration}
                onChange={() => setHasBizRegistration(true)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-navy dark:text-canvas-100">
                있음 → 사업소득 0원이어야 함
              </span>
            </label>
            <label
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                !hasBizRegistration
                  ? "border-electric bg-electric-5"
                  : "border-canvas-200 dark:border-canvas-700"
              }`}
            >
              <input
                type="radio"
                name="bizReg"
                checked={!hasBizRegistration}
                onChange={() => setHasBizRegistration(false)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-navy dark:text-canvas-100">
                없음 → 사업소득 연 500만원 이하 허용
              </span>
            </label>
          </div>
        </fieldset>

        {/* ④ 사업소득 */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ④ 사업소득 (연간 · 만원)
          </label>
          <input
            type="number"
            value={bizIncomeManwon}
            onChange={(e) => setBizIncomeManwon(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={50}
            className={inputCls}
            aria-label="연간 사업소득 (만원)"
          />
          <p className="mt-2 text-xs text-faint-blue leading-5">
            수입금액이 아니라 필요경비를 뺀 사업소득금액 기준입니다. 프리랜서(3.3% 원천징수)
            소득도 사업소득입니다. 주택임대소득은 소득금액이 있으면 등록 여부와 관계없이
            탈락하니 아래 안내를 확인하세요.
          </p>
        </div>

        {/* ⑤ 재산세 과세표준 */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            ⑤ 재산세 과세표준 (만원)
          </label>
          <input
            type="number"
            value={propertyManwon}
            onChange={(e) => setPropertyManwon(Math.max(0, Number(e.target.value) || 0))}
            min={0}
            step={1000}
            className={inputCls}
            aria-label="재산세 과세표준 (만원)"
          />
          <p className="mt-2 text-xs text-faint-blue leading-5">
            입력값 = {fmtManwon(propertyManwon)}. 시가·공시가격이 아니라 재산세 고지서(7·9월)나
            위택스에서 확인되는 과세표준 기준입니다. 배우자 등 명의자별로 각자 판정하므로 본인
            명의 재산만 합산하세요.
          </p>
        </div>

        {/* 결과 카드 */}
        {result.eligible ? (
          <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
            <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
              판정 결과 — 별표 1의2 기준
            </p>
            <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
              피부양자 자격 유지 가능
            </p>
            <ul className="space-y-1.5 text-sm leading-6 text-muted-blue dark:text-canvas-300 pt-3 border-t border-electric-20">
              <li>
                ✓ 부양요건 — 직장가입자와의 관계가 피부양자 인정 범위에 해당합니다.
              </li>
              <li>
                ✓ 소득요건 — 연간 합산소득 {fmtManwon(incomeManwon)} ≤ 2,000만원, 사업소득
                요건({hasBizRegistration ? "사업자등록 있음 → 0원" : "사업자등록 없음 → 500만원 이하"})
                충족.
              </li>
              <li>
                ✓ 재산요건 — 재산세 과세표준 {fmtManwon(propertyManwon)}이{" "}
                {relationship === "sibling" ? "형제자매 기준 1억 8,000만원" : "기준"} 이내입니다.
              </li>
            </ul>
            {result.notes.map((note, i) => (
              <p
                key={i}
                className="mt-3 p-3 rounded-xl bg-white dark:bg-canvas-900 text-xs leading-5 text-muted-blue dark:text-canvas-300"
              >
                참고: {note}
              </p>
            ))}
            <p className="mt-4 text-xs text-faint-blue leading-5">
              ※ 실제 자격은 공단이 국세청·지자체 자료로 확정하며, 매년 11월 전년도 소득을
              반영한 재판정에서 기준 초과가 확인되면 12월부터 지역가입자로 전환됩니다.
            </p>
          </div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              판정 결과 — 별표 1의2 기준
            </p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mb-3">
              피부양자 탈락 (지역가입자 전환)
            </p>
            <ul className="space-y-2 text-sm leading-6 text-red-800 dark:text-red-300 list-disc list-inside">
              {result.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-500/30">
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                탈락하면 지역가입자로 전환되어 소득·재산 기준으로 보험료가 부과됩니다. 예상
                보험료는 기존 건강보험료 계산기에서 확인하세요.
              </p>
              <Link
                href="/health-insurance-fee-2026"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-electric text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                지역가입자 보험료 계산하러 가기 →
              </Link>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 간이 판정입니다. 소득은 국세청 확정 자료(전년도 귀속), 재산은 지방자치단체 재산세
          과세 자료를 기준으로 국민건강보험공단이 최종 판정하며, 개인별 자료에 따라 결과가 달라질
          수 있습니다. 근거: 국민건강보험법 시행규칙 별표 1의2 (2026년 8월 조회 기준).
        </p>
      </div>
    </section>
  );
}
