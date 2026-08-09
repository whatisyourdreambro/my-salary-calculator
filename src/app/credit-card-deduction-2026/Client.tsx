"use client";

// 신용카드 등 사용금액 소득공제 계산기 — 2026년 귀속(현행법) 기준
// 근거: 조세특례제한법 제126조의2 (2025-12 개정으로 2028-12-31까지 연장 확정)
// 공제율: 신용 15% / 체크·현금영수증 30% / 문화비 30%(총급여 7천만 이하만) /
//         전통시장 40% / 대중교통 40%
// 한도: 2026년 귀속부터 자녀 수(최대 2명분)에 따라 기본공제 한도 상향 신규 적용

import { useMemo, useState } from "react";
import {
  TAX_BRACKETS_2026,
  earnedIncomeDeduction2026,
} from "@/lib/taxConstants2026";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

/** 만원 단위 축약 표기 (예: 12,000,000 → "1,200만원") */
function fmtMan(n: number): string {
  return `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
}

const SALARY_THRESHOLD = 70_000_000; // 문화비·한도 구분 기준 총급여 7,000만원

/** 기본공제 한도 — 2026년 귀속부터 자녀(손자녀 포함) 수에 따라 상향 (최대 2명분) */
function baseLimit(isLow: boolean, children: number): number {
  const c = Math.min(children, 2);
  return isLow
    ? [3_000_000, 3_500_000, 4_000_000][c]
    : [2_500_000, 2_750_000, 3_000_000][c];
}

/** 간이 과세표준 기준 한계세율 (소득세법 §55 누진세율표) */
function marginalRate(taxable: number): number {
  for (const b of TAX_BRACKETS_2026) {
    if (taxable <= b.limit) return b.rate;
  }
  return 0.45;
}

interface MoneyFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  step?: number;
  ariaLabel?: string;
}

function MoneyField({
  label,
  value,
  onChange,
  hint,
  step = 100_000,
  ariaLabel,
}: MoneyFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        min={0}
        step={step}
        className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
        aria-label={ariaLabel || label}
      />
      {hint && <p className="mt-1.5 text-xs text-faint-blue">{hint}</p>}
    </div>
  );
}

export default function CreditCardDeductionClient() {
  const [salary, setSalary] = useState(40_000_000); // 총급여
  const [children, setChildren] = useState(0); // 자녀 수 (0 / 1 / 2+)
  const [credit, setCredit] = useState(12_000_000); // 신용카드
  const [checkCash, setCheckCash] = useState(4_000_000); // 체크·선불·현금영수증
  const [traditional, setTraditional] = useState(0); // 전통시장
  const [transit, setTransit] = useState(600_000); // 대중교통
  const [culture, setCulture] = useState(0); // 문화비 (7천만 이하만)

  const result = useMemo(() => {
    const isLow = salary <= SALARY_THRESHOLD;
    // 총급여 7,000만원 초과자의 문화비는 문화비 공제 대상이 아님 — 계산에서 제외
    // (실제로는 결제수단별 일반 사용분으로 분류해야 하므로 입력 안내로 처리)
    const cultureEff = isLow ? culture : 0;

    const M = salary * 0.25; // 최저사용금액 (총급여의 25%)
    const totalUse = credit + checkCash + traditional + transit + cultureEff;

    // 결제수단별 공제액 (차감 전)
    const A = credit * 0.15;
    const B = checkCash * 0.3;
    const C = cultureEff * 0.3;
    const D = traditional * 0.4;
    const E = transit * 0.4;
    const gross = A + B + C + D + E;

    // 최저사용금액 차감액 T — 공제율 낮은 결제수단(신용→30%그룹→40%그룹)부터 소진
    const mid = checkCash + cultureEff; // 30% 그룹
    let T: number;
    let tCase: 1 | 2 | 3;
    if (credit >= M) {
      T = M * 0.15;
      tCase = 1;
    } else if (credit + mid >= M) {
      T = credit * 0.15 + (M - credit) * 0.3;
      tCase = 2;
    } else {
      T = credit * 0.15 + mid * 0.3 + (M - credit - mid) * 0.4;
      tCase = 3;
    }

    const S = Math.max(0, gross - T); // 한도 적용 전 공제액

    // 한도 — 2026년 귀속: 자녀 수에 따른 기본공제 한도 상향 신규 적용
    const L1 = baseLimit(isLow, children);
    const L2 = isLow ? 3_000_000 : 2_000_000; // 추가공제 한도
    // 추가공제 대상: 전통시장 + 대중교통 (+ 총급여 7천만 이하는 문화비 포함)
    const extraEligible = D + E + (isLow ? C : 0);
    const baseDeduction = Math.min(S, L1);
    const extraDeduction = Math.min(Math.max(S - L1, 0), extraEligible, L2);
    const finalDeduction = baseDeduction + extraDeduction;

    const thresholdMet = totalUse > M;
    const shortfall = Math.max(0, M - totalUse);
    const progressPct = M > 0 ? Math.min(100, (totalUse / M) * 100) : 0;

    // 예상 절세액 — 간이 과세표준(총급여 − 근로소득공제 − 본인 인적공제 150만) 기준
    // 한계세율 × 1.1 (지방소득세 10% 포함). 실제 과세표준은 개인별 공제에 따라 달라짐.
    const estTaxable = Math.max(
      0,
      salary - earnedIncomeDeduction2026(salary) - 1_500_000
    );
    const rate = marginalRate(estTaxable);
    const saving = finalDeduction * rate * 1.1;

    return {
      isLow,
      M,
      totalUse,
      A,
      B,
      C,
      D,
      E,
      gross,
      T,
      tCase,
      S,
      L1,
      L2,
      extraEligible,
      baseDeduction,
      extraDeduction,
      finalDeduction,
      thresholdMet,
      shortfall,
      progressPct,
      rate,
      saving,
      capped: S > finalDeduction + 0.5, // 한도로 잘렸는지
      cultureIgnored: !isLow && culture > 0,
    };
  }, [salary, children, credit, checkCash, traditional, transit, culture]);

  const salaryValid = salary > 0;

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 카드 소득공제 즉시 계산
        </h2>

        {/* 1단계 — 총급여 */}
        <div className="mb-5">
          <MoneyField
            label="1. 연간 총급여 (세전, 원)"
            value={salary}
            onChange={setSalary}
            step={1_000_000}
            hint={`총급여 ${fmtMan(salary)} — ${
              result.isLow
                ? "7,000만원 이하: 문화비 30% 공제 대상"
                : "7,000만원 초과: 문화비 공제 제외, 기본한도 250만원부터"
            }`}
            ariaLabel="연간 총급여"
          />
        </div>

        {/* 2단계 — 자녀 수 (2026 귀속 한도 상향) */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            2. 자녀 수 (손자녀 포함 — 2026년 귀속부터 한도 상향)
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-canvas-100 dark:bg-canvas-800 rounded-2xl">
            {[
              { v: 0, label: "없음" },
              { v: 1, label: "1명" },
              { v: 2, label: "2명 이상" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setChildren(opt.v)}
                className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                  children === opt.v
                    ? "bg-white dark:bg-canvas-900 text-electric shadow-sm"
                    : "text-muted-blue dark:text-canvas-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-faint-blue">
            기본공제 한도 {fmtMan(result.L1)} + 추가공제 한도 {fmtMan(result.L2)}{" "}
            (전통시장·대중교통{result.isLow ? "·문화비" : ""})
          </p>
        </div>

        {/* 3단계 — 결제수단별 사용액 */}
        <p className="text-sm font-bold text-navy dark:text-canvas-100 mb-3">
          3. 올해 사용액 (공제 대상 금액만, 원)
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-2">
          <MoneyField
            label="신용카드 (15%)"
            value={credit}
            onChange={setCredit}
            ariaLabel="신용카드 사용액"
          />
          <MoneyField
            label="체크카드·선불·현금영수증 (30%)"
            value={checkCash}
            onChange={setCheckCash}
            ariaLabel="체크카드·현금영수증 사용액"
          />
          <MoneyField
            label="전통시장 (40%)"
            value={traditional}
            onChange={setTraditional}
            ariaLabel="전통시장 사용액"
          />
          <MoneyField
            label="대중교통 (40%)"
            value={transit}
            onChange={setTransit}
            ariaLabel="대중교통 이용액"
          />
          {result.isLow && (
            <MoneyField
              label="문화비 — 도서·공연·영화·헬스장 (30%)"
              value={culture}
              onChange={setCulture}
              hint="총급여 7,000만원 이하만. 헬스장·수영장 시설이용료 포함(PT 등 강습 결합 결제는 50%만 산입)"
              ariaLabel="문화비 사용액"
            />
          )}
        </div>
        {result.cultureIgnored && (
          <p className="mb-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
            총급여 7,000만원 초과 시 문화비는 별도 공제 대상이 아닙니다. 입력했던
            문화비 {fmt(culture)}원은 계산에서 제외했으니, 실제 결제한 수단(신용카드
            또는 체크카드) 사용액에 합산해 입력하세요.
          </p>
        )}

        {/* 25% 문턱 진행 바 — UX 핵심 */}
        {salaryValid && (
          <div className="mt-5 mb-1">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold text-navy dark:text-canvas-100">
                공제 문턱 (총급여의 25% = {fmt(result.M)}원)
              </span>
              <span className="text-xs font-bold text-electric">
                {result.progressPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-electric transition-all"
                style={{ width: `${result.progressPct}%` }}
              />
            </div>
            {result.thresholdMet ? (
              <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                최저사용금액을 넘었습니다 — 초과 사용분부터 공제가 적용됩니다.
              </p>
            ) : (
              <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                아직 공제 시작 전입니다 — {fmt(result.shortfall)}원 더 사용해야
                공제가 시작됩니다. 문턱까지는 포인트·할인 혜택이 좋은 카드를 쓰는
                것이 유리합니다.
              </p>
            )}
          </div>
        )}

        {/* 결과 카드 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          {!salaryValid ? (
            <p className="text-sm font-bold text-muted-blue dark:text-canvas-300">
              총급여를 입력하면 공제액이 계산됩니다.
            </p>
          ) : (
            <>
              <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
                최종 소득공제액 (2026년 귀속 기준)
              </p>
              <p className="text-3xl sm:text-4xl font-black text-electric mb-1">
                {fmt(result.finalDeduction)}원
              </p>
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-3">
                예상 절세액 약{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {fmt(result.saving)}원
                </span>{" "}
                <span className="font-medium text-muted-blue dark:text-canvas-300">
                  (한계세율 {(result.rate * 100).toFixed(0)}% + 지방소득세 가정)
                </span>
              </p>

              <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>공제 대상 사용액 합계</span>
                  <span>{fmt(result.totalUse)}원</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>결제수단별 공제액 (차감 전)</span>
                  <span>{fmt(result.gross)}원</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>최저사용금액 차감</span>
                  <span>-{fmt(result.T)}원</span>
                </div>
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>한도 적용 전 공제액</span>
                  <span>{fmt(result.S)}원</span>
                </div>
                <div className="flex justify-between text-navy dark:text-canvas-50 font-bold pt-2 border-t border-electric-20 mt-2">
                  <span>기본공제 (한도 {fmtMan(result.L1)})</span>
                  <span>{fmt(result.baseDeduction)}원</span>
                </div>
                <div className="flex justify-between text-navy dark:text-canvas-50 font-bold">
                  <span>추가공제 (전통시장·대중교통 등)</span>
                  <span>+{fmt(result.extraDeduction)}원</span>
                </div>
              </div>

              {result.capped && (
                <p className="mt-3 pt-3 border-t border-electric-20 text-xs font-bold text-amber-700 dark:text-amber-400">
                  공제 한도에 도달했습니다. 한도 적용 전 공제액 {fmt(result.S)}원
                  중 {fmt(result.finalDeduction)}원까지만 공제됩니다 (이론상 최대{" "}
                  {fmtMan(result.L1 + result.L2)}).
                </p>
              )}
            </>
          )}
        </div>

        {/* 계산 근거 상세 */}
        {salaryValid && (
          <details className="mt-4 group p-4 bg-canvas-50 dark:bg-canvas-800 rounded-2xl border border-canvas-200 dark:border-canvas-700">
            <summary className="cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
              계산 근거 상세 보기
            </summary>
            <div className="mt-3 space-y-1.5 text-xs leading-6 text-muted-blue dark:text-canvas-300">
              <p className="font-bold text-navy dark:text-canvas-100">
                ① 결제수단별 공제액
              </p>
              <p>신용카드 {fmt(credit)}원 × 15% = {fmt(result.A)}원</p>
              <p>
                체크·선불·현금영수증 {fmt(checkCash)}원 × 30% = {fmt(result.B)}원
              </p>
              {result.isLow && culture > 0 && (
                <p>문화비 {fmt(culture)}원 × 30% = {fmt(result.C)}원</p>
              )}
              <p>전통시장 {fmt(traditional)}원 × 40% = {fmt(result.D)}원</p>
              <p>대중교통 {fmt(transit)}원 × 40% = {fmt(result.E)}원</p>

              <p className="font-bold text-navy dark:text-canvas-100 pt-2">
                ② 최저사용금액 차감 (공제율 낮은 수단부터 소진)
              </p>
              <p>
                최저사용금액 = 총급여 {fmt(salary)}원 × 25% = {fmt(result.M)}원
              </p>
              {result.tCase === 1 && (
                <p>
                  신용카드 사용액이 최저사용금액 이상 → 차감액 = {fmt(result.M)}원
                  × 15% = {fmt(result.T)}원
                </p>
              )}
              {result.tCase === 2 && (
                <p>
                  차감액 = 신용 {fmt(credit)}원 × 15% + 나머지 문턱분 × 30% ={" "}
                  {fmt(result.T)}원
                </p>
              )}
              {result.tCase === 3 && (
                <p>
                  차감액 = 신용 × 15% + 30%그룹 × 30% + 나머지 문턱분 × 40% ={" "}
                  {fmt(result.T)}원
                </p>
              )}

              <p className="font-bold text-navy dark:text-canvas-100 pt-2">
                ③ 한도 적용
              </p>
              <p>
                한도 적용 전 공제액 = {fmt(result.gross)} − {fmt(result.T)} ={" "}
                {fmt(result.S)}원
              </p>
              <p>
                기본공제 한도 {fmtMan(result.L1)} (총급여{" "}
                {result.isLow ? "7,000만원 이하" : "7,000만원 초과"} · 자녀{" "}
                {Math.min(children, 2)}명 기준) → {fmt(result.baseDeduction)}원
              </p>
              <p>
                추가공제 = min(한도 초과분 {fmt(Math.max(result.S - result.L1, 0))}
                원, 전통시장·대중교통{result.isLow ? "·문화비" : ""} 공제액{" "}
                {fmt(result.extraEligible)}원, 추가한도 {fmtMan(result.L2)}) ={" "}
                {fmt(result.extraDeduction)}원
              </p>
              <p className="font-bold text-navy dark:text-canvas-100">
                최종 소득공제액 = {fmt(result.finalDeduction)}원
              </p>

              <p className="pt-2">
                ④ 예상 절세액 = 공제액 × 한계세율(
                {(result.rate * 100).toFixed(0)}%) × 1.1(지방소득세 포함) ≈{" "}
                {fmt(result.saving)}원. 한계세율은 총급여에서 근로소득공제와 본인
                인적공제(150만원)만 뺀 간이 과세표준 기준 추정치로, 실제 개인별
                공제 항목에 따라 달라질 수 있습니다.
              </p>
            </div>
          </details>
        )}

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 조세특례제한법 제126조의2에 따른 2026년 귀속(2027년 초 연말정산)
          현행법 기준 간이 계산입니다. 세금·공과금, 통신요금, 신차 구입비, 해외
          사용분 등 공제 제외 항목은 빼고 입력해야 정확합니다. 실제 공제액은
          국세청 홈택스 연말정산 미리보기에서 확인하세요.
        </p>
      </div>
    </section>
  );
}
