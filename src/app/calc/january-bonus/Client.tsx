"use client";

import { useState, useMemo } from "react";

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEmpDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit) return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

function formatInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

export default function JanuaryBonusClient() {
  const [salaryFmt, setSalaryFmt] = useState("50,000,000");
  const [cardFmt, setCardFmt] = useState("18,000,000");
  const [irpFmt, setIrpFmt] = useState("3,000,000");
  const [medicalFmt, setMedicalFmt] = useState("500,000");
  const [donationFmt, setDonationFmt] = useState("100,000");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [dependents, setDependents] = useState(0);

  const salary = parseInput(salaryFmt);
  const card = parseInput(cardFmt);
  const irp = parseInput(irpFmt);
  const medical = parseInput(medicalFmt);
  const donation = parseInput(donationFmt);

  const result = useMemo(() => {
    // 인적공제
    const basicDeduct = 1_500_000 * (1 + (hasSpouse ? 1 : 0) + dependents);

    // 근로소득공제
    const empDeduct = calcEmpDeduction(salary);

    // 카드공제: 총급여 25% 초과분의 15%
    const cardThreshold = salary * 0.25;
    const cardDeduction = Math.max(0, card - cardThreshold) * 0.15;
    const cardDeductionCapped = Math.min(cardDeduction, 3_000_000);

    // 과세표준 (소득공제 후)
    const taxableIncome = Math.max(
      0,
      salary - empDeduct - basicDeduct - cardDeductionCapped - irp
    );

    // 산출세액
    const grossTax = calcTax(taxableIncome);

    // 세액공제
    const baseTaxCredit =
      grossTax <= 1_300_000
        ? grossTax * 0.55
        : 715_000 + (grossTax - 1_300_000) * 0.3;
    const taxCreditLimit =
      salary > 120_000_000
        ? 500_000
        : salary > 70_000_000
          ? 660_000
          : salary > 33_000_000
            ? 740_000
            : Infinity;
    const earnedIncomeCredit = Math.min(baseTaxCredit, taxCreditLimit);

    // 의료비 세액공제: 총급여 3% 초과분의 15%
    const medicalThreshold = salary * 0.03;
    const medicalCredit = Math.max(0, medical - medicalThreshold) * 0.15;

    // 기부금 세액공제: 10만원까지 100%, 초과분 15%
    const donationCredit =
      donation <= 100_000
        ? donation * (100 / 110) // 100% 환산 (limit calc)
        : 100_000 + (donation - 100_000) * 0.15;

    // IRP 세액공제 (소득공제 대신 별도 세액공제 가정)
    const irpCreditRate = salary > 55_000_000 ? 0.132 : 0.165;
    const irpCredit = Math.min(irp, 9_000_000) * irpCreditRate;

    const totalCredit =
      earnedIncomeCredit + medicalCredit + donationCredit + irpCredit;

    // 결정세액 (소득세)
    const finalTax = Math.max(0, grossTax - totalCredit);
    const finalLocal = finalTax * 0.1;
    const totalFinalTax = finalTax + finalLocal;

    // 원천징수 추정 (간이세액표: 평균적으로 결정세액의 약 1.05배 가정)
    const estimatedWithheld = totalFinalTax * 1.08;

    // 환급액 (음수면 추징)
    const refund = estimatedWithheld - totalFinalTax;

    return {
      taxableIncome,
      grossTax,
      totalCredit,
      finalTax,
      totalFinalTax,
      estimatedWithheld,
      refund,
      cardDeductionCapped,
      irpCredit,
      medicalCredit,
      donationCredit,
    };
  }, [salary, card, irp, medical, donation, hasSpouse, dependents]);

  const isRefund = result.refund >= 0;

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-faint-blue">소득 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="salary"
            label="총급여 (연봉)"
            value={salaryFmt}
            onChange={(v) => setSalaryFmt(v)}
          />
          <Field
            id="card"
            label="신용/체크카드 1년 사용액"
            value={cardFmt}
            onChange={(v) => setCardFmt(v)}
          />
          <Field
            id="irp"
            label="IRP/연금저축 납입액 (연 900만 한도)"
            value={irpFmt}
            onChange={(v) => setIrpFmt(v)}
          />
          <Field
            id="medical"
            label="의료비 (총급여 3% 초과분)"
            value={medicalFmt}
            onChange={(v) => setMedicalFmt(v)}
          />
          <Field
            id="donation"
            label="기부금 (10만원까지 100%)"
            value={donationFmt}
            onChange={(v) => setDonationFmt(v)}
          />

          <div>
            <label className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
              부양가족·배우자
            </label>
            <div className="flex gap-2">
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="flex-1 rounded-xl px-3 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-electric/50 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
                aria-label="부양가족 수"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    부양 {n}명
                  </option>
                ))}
              </select>
              <button
                onClick={() => setHasSpouse(!hasSpouse)}
                className="px-4 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: hasSpouse ? "#0145F2" : "#F8FAFB",
                  border: `1.5px solid ${hasSpouse ? "#0145F2" : "#DDE4EC"}`,
                  color: hasSpouse ? "#FFFFFF" : "#3D5E78",
                }}
                aria-pressed={hasSpouse}
              >
                {hasSpouse ? "배우자 ✓" : "배우자"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 카드 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px #0145F225" }}
      >
        <div
          className="px-8 py-8 text-center"
          style={{
            background: isRefund
              ? "linear-gradient(135deg, #10B981 0%, #14C997 100%)"
              : "linear-gradient(135deg, #E63B5A 0%, #F97316 100%)",
          }}
        >
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            예상 {isRefund ? "환급" : "추징"} 금액
          </p>
          <div
            className="text-5xl sm:text-6xl font-black tracking-tight text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            {isRefund ? "+" : "-"}
            {fmt(Math.abs(result.refund))}원
          </div>
          <p className="text-sm font-bold mt-2 mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
            {isRefund ? "1~2월 월급에 환급금 합산 예상" : "1~2월 월급에서 추가 차감 예상"}
          </p>
        </div>

        {/* 상세 */}
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 space-y-0">
          {[
            { label: "총급여", value: salary },
            { label: "결정세액 (소득세 + 지방세)", value: result.totalFinalTax, sign: "+" },
            { label: "원천징수 추정", value: result.estimatedWithheld, sign: "-" },
            { label: "IRP/연금저축 세액공제", value: result.irpCredit, sub: true },
            { label: "의료비 세액공제", value: result.medicalCredit, sub: true },
            { label: "기부금 세액공제", value: result.donationCredit, sub: true },
            { label: "카드 소득공제", value: result.cardDeductionCapped, sub: true },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-3 ${row.sub ? "pl-4" : ""}`}
              style={{
                borderBottom: i < arr.length - 1 ? "1px solid #EDF1F5" : "none",
              }}
            >
              <span
                className={`text-sm ${row.sub ? "text-faint-blue" : "font-medium text-muted-blue dark:text-canvas-300"}`}
              >
                {row.sub ? "└ " : ""}
                {row.label}
              </span>
              <span
                className={`text-sm tabular-nums ${
                  row.sub ? "text-faint-blue" : "font-black text-navy dark:text-canvas-50"
                }`}
              >
                {fmt(row.value)}원
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
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
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          className="w-full rounded-xl px-4 py-3 text-base font-black focus:outline-none focus:ring-2 focus:ring-electric/50 transition pr-10 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
          placeholder="0"
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
          원
        </span>
      </div>
    </div>
  );
}
