"use client";

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { estimateJanuaryBonus2026 } from "@/lib/januaryBonus2026";

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
  const [withheldFmt, setWithheldFmt] = useState(""); // 작년 원천징수세액 (미입력 시 추정치 사용)
  const [hasSpouse, setHasSpouse] = useState(false);
  const [dependents, setDependents] = useState(0);

  const salary = parseInput(salaryFmt);
  const card = parseInput(cardFmt);
  const irp = parseInput(irpFmt);
  const medical = parseInput(medicalFmt);
  const donation = parseInput(donationFmt);
  const withheldInput = parseInput(withheldFmt);

  // 2026-11-01 B23 CALC-01: 계산은 연말정산 정본 엔진 어댑터(src/lib/januaryBonus2026.ts)만 쓴다.
  // 종전 이 파일의 포크 엔진은 국민연금·건강·장기요양·고용보험료 소득공제가 없어 결정세액이 부풀었고,
  // 실제 원천징수세액을 넣으면 환급이 추가 납부로 뒤집혔다. 원천징수세액을 비우면 간이세액표 추정치,
  // 기부금 칸은 고향사랑기부금으로 계산한다. IRP 공제율은 엔진의 소득세분 15%/12%(지방세 이중 반영 없음).
  const result = useMemo(
    () =>
      estimateJanuaryBonus2026({
        salary,
        card,
        irp,
        medical,
        donation,
        withheldWithLocal: withheldInput,
        hasSpouse,
        dependents,
      }),
    [salary, card, irp, medical, donation, withheldInput, hasSpouse, dependents]
  );

  const isRefund = result.refund >= 0;

  return (
    <div className="space-y-5 mb-10">
      {/* 입력 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-faint-blue">소득 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="salary"
            label="총급여 (비과세 제외)"
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
            label="의료비 지출액 (3% 초과분 공제)"
            value={medicalFmt}
            onChange={(v) => setMedicalFmt(v)}
          />
          <Field
            id="donation"
            label="고향사랑기부금 (10만원 전액)"
            value={donationFmt}
            onChange={(v) => setDonationFmt(v)}
          />
          <Field
            id="withheld"
            label="작년 원천징수세액 (작년 한 해 미리 낸 세금)"
            value={withheldFmt}
            onChange={(v) => setWithheldFmt(v)}
            placeholder="미입력 시 추정치 사용"
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
                  backgroundColor: hasSpouse ? "#0145F2" : "hsl(var(--card))",
                  border: `1.5px solid ${hasSpouse ? "#0145F2" : "hsl(var(--border))"}`,
                  color: hasSpouse ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                }}
                aria-pressed={hasSpouse}
              >
                {hasSpouse ? "배우자 ✓" : "배우자"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-faint-blue">
          💡 원천징수세액은 작년 한 해 급여에서 미리 떼인 소득세+지방소득세 합계입니다(원천징수영수증
          또는 급여명세서에서 확인). 모르면 비워두세요 — 연봉 기반 간이세액 추정치로 계산됩니다.
        </p>
      </div>

      {/* 결과 카드 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px #0145F225" }}
      >
        {/* 360px 미만은 좌우 여백 20px — 정본 엔진 기본 환급액(+532,183원, 48px 비례 숫자)이 여백 32px 로는 338px 부터
            한 줄이라 322~337px 에서 원이 접혀 CalcResultAd 가 48px 내려갔다(11/1 통합 스윕 실측). 20px 면 320px 부터 한 줄. */}
        <div
          className="px-5 min-[360px]:px-8 py-8 text-center"
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
          <p className="text-sm font-bold mt-2 mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>
            {isRefund ? "1~2월 월급에 환급금 합산 예상" : "1~2월 월급에서 추가 차감 예상"}
          </p>
          {result.isWithheldEstimated && (
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              원천징수세액 미입력 — 연간 세액 추정치 기준
            </p>
          )}
        </div>

        {/* 상세 */}
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 space-y-0">
          {[
            { label: "총급여", value: salary },
            {
              label: result.isWithheldEstimated
                ? "원천징수세액 (연간 세액 추정치)"
                : "원천징수세액 (입력값)",
              value: result.withheld,
            },
            { label: "결정세액 (소득세 + 지방세)", value: result.totalFinalTax },
            { label: "IRP 세액공제(소득세분)", value: result.irpCredit, sub: true },
            { label: "의료비 세액공제", value: result.medicalCredit, sub: true },
            { label: "기부금 세액공제", value: result.donationCredit, sub: true },
            { label: "카드 소득공제", value: result.cardDeductionCapped, sub: true },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-3 ${row.sub ? "pl-4" : ""}`}
              style={{
                borderBottom: i < arr.length - 1 ? "1px solid hsl(var(--border))" : "none",
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

      {/* 결과 직하 광고 */}
      <CalcResultAd />
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          className="w-full rounded-xl px-4 py-3 text-base font-black focus:outline-none focus:ring-2 focus:ring-electric/50 transition pr-10 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50"
          placeholder={placeholder}
          aria-label={label}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">
          원
        </span>
      </div>
    </div>
  );
}
