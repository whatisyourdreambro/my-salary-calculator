"use client";

// src/app/medical-tax-credit-2026/Client.tsx
// 의료비 세액공제 계산기 — 2026년 귀속(2027년 1~2월 정산) 현행법 기준
//
// 계산 로직 (소득세법 제59조의4, 국세상담센터 확인 기준):
//   1) 각 그룹 의료비에서 실손의료보험금을 차감 (④일반 → ③무한도15% → ②미숙아 → ①난임 순)
//   2) 기준액 K = 총급여 × 3% 를 ④일반(한도부)에서 먼저 차감,
//      미달분은 무한도 그룹에서 공제율 낮은 순(③15% → ②20% → ①30%)으로 차감
//   3) 공제세액 = min(④', 700만) × 15% + ③' × 15% + ②' × 20% + ①' × 30%

import { useMemo, useState } from "react";

const GENERAL_LIMIT = 7_000_000; // ④ 그 밖의 부양가족 의료비 연 한도

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

/** 문자열 → 0 이상 정수 (빈 값·음수 방어) */
function toAmount(v: string): number {
  return Math.max(0, Number(v) || 0);
}

export default function MedicalTaxCreditClient() {
  const [salary, setSalary] = useState(40_000_000); // 총급여
  const [generalMed, setGeneralMed] = useState(2_000_000); // ④ 그 밖의 부양가족
  const [specialMed, setSpecialMed] = useState(0); // ③ 본인·65세↑·장애인·6세↓·산정특례
  const [prematureMed, setPrematureMed] = useState(0); // ② 미숙아·선천성이상아
  const [fertilityMed, setFertilityMed] = useState(0); // ① 난임시술비
  const [insurance, setInsurance] = useState(0); // 실손의료보험금 수령액

  const result = useMemo(() => {
    const threshold = salary * 0.03; // 총급여의 3% 기준액

    // 1) 실손 차감 — ④ → ③ → ② → ① 순으로 소진
    //    (실손이 어느 의료비에 대응하는지 정확히 알면 해당 그룹에서 미리 빼고 입력 권장)
    let ins = insurance;
    const net4 = Math.max(0, generalMed - ins);
    ins = Math.max(0, ins - generalMed);
    const net3 = Math.max(0, specialMed - ins);
    ins = Math.max(0, ins - specialMed);
    const net2 = Math.max(0, prematureMed - ins);
    ins = Math.max(0, ins - prematureMed);
    const net1 = Math.max(0, fertilityMed - ins);
    ins = Math.max(0, ins - fertilityMed);

    const totalNet = net4 + net3 + net2 + net1;

    // 2) 3% 기준액 차감 — ④에서 먼저, 미달분은 ③ → ② → ① (공제율 낮은 순)
    let remain = threshold;
    const used4 = Math.min(net4, remain);
    const base4raw = net4 - used4;
    remain -= used4;
    const used3 = Math.min(net3, remain);
    const base3 = net3 - used3;
    remain -= used3;
    const used2 = Math.min(net2, remain);
    const base2 = net2 - used2;
    remain -= used2;
    const used1 = Math.min(net1, remain);
    const base1 = net1 - used1;
    remain -= used1;

    // 3) ④ 한도 700만 적용 후 그룹별 공제율
    const base4 = Math.min(base4raw, GENERAL_LIMIT);
    const capped4 = base4raw - base4; // 한도 초과로 잘려나간 금액
    const credit4 = base4 * 0.15;
    const credit3 = base3 * 0.15;
    const credit2 = base2 * 0.2;
    const credit1 = base1 * 0.3;
    const credit = credit4 + credit3 + credit2 + credit1;

    return {
      threshold,
      net4,
      net3,
      net2,
      net1,
      totalNet,
      used4,
      used3,
      used2,
      used1,
      base4,
      capped4,
      credit4,
      credit3,
      credit2,
      credit1,
      credit,
      withLocalTax: credit * 1.1, // 지방소득세(소득세의 10%) 절감분 포함
      shortfall: Math.max(0, threshold - totalNet), // 3% 미달액
    };
  }, [salary, generalMed, specialMed, prematureMed, fertilityMed, insurance]);

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric";
  const labelCls =
    "block text-sm font-bold text-navy dark:text-canvas-100 mb-2";
  const helpCls = "mt-2 text-xs text-faint-blue leading-relaxed";

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 의료비 세액공제 즉시 계산
        </h2>

        {/* 1단계 — 총급여 */}
        <div className="mb-5">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            1단계 — 총급여
          </p>
          <label className={labelCls} htmlFor="mtc-salary">
            연간 총급여 (비과세 제외, 원)
          </label>
          <input
            id="mtc-salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(toAmount(e.target.value))}
            min={0}
            step={1_000_000}
            className={inputCls}
            aria-label="연간 총급여"
          />
          <p className={helpCls}>
            공제 기준액(총급여의 3%): <strong className="text-navy dark:text-canvas-100">{fmt(result.threshold)}원</strong>{" "}
            — 이 금액을 초과한 의료비부터 공제가 시작됩니다.
          </p>
        </div>

        {/* 2단계 — 의료비 */}
        <div className="mb-5 pt-4 border-t border-canvas-200 dark:border-canvas-700">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            2단계 — 올해 지출한 의료비 (지급일 기준)
          </p>

          <div className="mb-4">
            <label className={labelCls} htmlFor="mtc-general">
              그 밖의 부양가족 의료비 (15% · 연 700만원 한도)
            </label>
            <input
              id="mtc-general"
              type="number"
              value={generalMed}
              onChange={(e) => setGeneralMed(toAmount(e.target.value))}
              min={0}
              step={100_000}
              className={inputCls}
              aria-label="그 밖의 부양가족 의료비"
            />
            <p className={helpCls}>
              아래 무한도 대상이 아닌 가족(배우자·부모·형제자매 등)의 의료비. 나이·소득 요건 없음.
              안경·콘택트렌즈는 <strong>1인당 연 50만원</strong>, 산후조리원은{" "}
              <strong>출산 1회당 200만원</strong>까지만 합산해 입력하세요.
            </p>
          </div>

          <div className="mb-4">
            <label className={labelCls} htmlFor="mtc-special">
              본인·65세 이상·장애인·6세 이하·산정특례자 의료비 (15% · 한도 없음)
            </label>
            <input
              id="mtc-special"
              type="number"
              value={specialMed}
              onChange={(e) => setSpecialMed(toAmount(e.target.value))}
              min={0}
              step={100_000}
              className={inputCls}
              aria-label="본인·65세 이상·장애인·6세 이하·산정특례자 의료비"
            />
            <p className={helpCls}>
              근로자 본인, 65세 이상, 장애인, <strong>6세 이하</strong>(&apos;24년 지출분부터 무한도),
              건강보험산정특례자(중증·희귀난치성질환·결핵 등록자)의 의료비.
            </p>
          </div>

          <div className="mb-4">
            <label className={labelCls} htmlFor="mtc-premature">
              미숙아·선천성이상아 의료비 (20% · 한도 없음)
            </label>
            <input
              id="mtc-premature"
              type="number"
              value={prematureMed}
              onChange={(e) => setPrematureMed(toAmount(e.target.value))}
              min={0}
              step={100_000}
              className={inputCls}
              aria-label="미숙아·선천성이상아 의료비"
            />
          </div>

          <div className="mb-4">
            <label className={labelCls} htmlFor="mtc-fertility">
              난임시술비 (30% · 한도 없음)
            </label>
            <input
              id="mtc-fertility"
              type="number"
              value={fertilityMed}
              onChange={(e) => setFertilityMed(toAmount(e.target.value))}
              min={0}
              step={100_000}
              className={inputCls}
              aria-label="난임시술비"
            />
          </div>
        </div>

        {/* 3단계 — 실손보험금 */}
        <div className="mb-5 pt-4 border-t border-canvas-200 dark:border-canvas-700">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            3단계 — 실손의료보험금
          </p>
          <label className={labelCls} htmlFor="mtc-insurance">
            올해 지출한 의료비에 대해 받은(받을) 실손보험금 (원)
          </label>
          <input
            id="mtc-insurance"
            type="number"
            value={insurance}
            onChange={(e) => setInsurance(toAmount(e.target.value))}
            min={0}
            step={100_000}
            className={inputCls}
            aria-label="실손의료보험금 수령액"
          />
          <p className={helpCls}>
            실손보험금은 의료비를 <strong>지출한 연도</strong>의 의료비에서 차감합니다(수령 연도 아님).
            본 계산기는 일반 의료비부터 순서대로 차감하며, 실손금이 어느 의료비에 대응하는지 아는 경우
            해당 항목에서 미리 뺀 금액을 입력하면 더 정확합니다.
          </p>
        </div>

        {/* 결과 카드 */}
        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            의료비 세액공제액 (2026년 귀속)
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-1">
            {fmt(result.credit)}원
          </p>
          {result.credit > 0 && (
            <p className="text-sm font-bold text-navy dark:text-canvas-100 mb-3">
              지방소득세 10% 포함 예상 절세액 약 {fmt(result.withLocalTax)}원
            </p>
          )}

          {result.credit > 0 ? (
            <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
              {result.credit4 > 0 && (
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>그 밖의 부양가족 ({fmt(result.base4)}원 × 15%)</span>
                  <span>{fmt(result.credit4)}원</span>
                </div>
              )}
              {result.credit3 > 0 && (
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>본인·65세↑·장애인·6세↓ 등 (× 15%)</span>
                  <span>{fmt(result.credit3)}원</span>
                </div>
              )}
              {result.credit2 > 0 && (
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>미숙아·선천성이상아 (× 20%)</span>
                  <span>{fmt(result.credit2)}원</span>
                </div>
              )}
              {result.credit1 > 0 && (
                <div className="flex justify-between text-muted-blue dark:text-canvas-300">
                  <span>난임시술비 (× 30%)</span>
                  <span>{fmt(result.credit1)}원</span>
                </div>
              )}
              {result.capped4 > 0 && (
                <p className="text-xs text-faint-blue pt-1">
                  ※ 일반 의료비 한도(700만원) 초과분 {fmt(result.capped4)}원은 공제 대상에서
                  제외됐습니다.
                </p>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-electric-20 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
              {result.totalNet === 0 ? (
                <p>
                  실손보험금을 뺀 의료비가 0원입니다. 의료비를 입력하면 공제액이 계산됩니다.
                </p>
              ) : (
                <p>
                  실손 차감 후 의료비 {fmt(result.totalNet)}원이 기준액(총급여의 3% ={" "}
                  {fmt(result.threshold)}원)에{" "}
                  <strong className="text-navy dark:text-canvas-100">
                    {fmt(result.shortfall)}원 미달
                  </strong>
                  합니다. 올해 의료비를 {fmt(result.shortfall)}원 더 지출한 시점부터 초과분에
                  대해 공제가 시작됩니다.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 계산 근거 상세 */}
        <details className="mt-4 group rounded-2xl border border-canvas-200 dark:border-canvas-700 bg-canvas-50 dark:bg-canvas-800/50 p-4">
          <summary className="cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
            계산 근거 상세 보기 (기준액 차감·한도 적용 과정)
          </summary>
          <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            <div className="flex justify-between">
              <span>공제 기준액 (총급여 {fmt(salary)}원 × 3%)</span>
              <span className="font-bold">{fmt(result.threshold)}원</span>
            </div>
            <div className="flex justify-between">
              <span>실손 차감 후 의료비 합계</span>
              <span className="font-bold">{fmt(result.totalNet)}원</span>
            </div>
            <p className="pt-2 font-bold text-navy dark:text-canvas-100">
              기준액 차감 배분 (일반 의료비에서 먼저, 미달분은 무한도 그룹에서)
            </p>
            <div className="flex justify-between">
              <span>· 그 밖의 부양가족 {fmt(result.net4)}원 − 기준액 {fmt(result.used4)}원</span>
              <span>{fmt(result.net4 - result.used4)}원</span>
            </div>
            {result.capped4 > 0 && (
              <div className="flex justify-between">
                <span>· 일반 의료비 한도 700만원 적용</span>
                <span>−{fmt(result.capped4)}원 → {fmt(result.base4)}원</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>· 본인·65세↑ 등 {fmt(result.net3)}원 − 잔여 기준액 {fmt(result.used3)}원</span>
              <span>{fmt(result.net3 - result.used3)}원</span>
            </div>
            <div className="flex justify-between">
              <span>· 미숙아·선천성이상아 {fmt(result.net2)}원 − 잔여 기준액 {fmt(result.used2)}원</span>
              <span>{fmt(result.net2 - result.used2)}원</span>
            </div>
            <div className="flex justify-between">
              <span>· 난임시술비 {fmt(result.net1)}원 − 잔여 기준액 {fmt(result.used1)}원</span>
              <span>{fmt(result.net1 - result.used1)}원</span>
            </div>
            <p className="pt-2 font-bold text-navy dark:text-canvas-100">그룹별 공제세액</p>
            <div className="flex justify-between">
              <span>· 그 밖의 부양가족 × 15%</span>
              <span>{fmt(result.credit4)}원</span>
            </div>
            <div className="flex justify-between">
              <span>· 본인·65세↑·장애인·6세↓·산정특례 × 15%</span>
              <span>{fmt(result.credit3)}원</span>
            </div>
            <div className="flex justify-between">
              <span>· 미숙아·선천성이상아 × 20%</span>
              <span>{fmt(result.credit2)}원</span>
            </div>
            <div className="flex justify-between">
              <span>· 난임시술비 × 30%</span>
              <span>{fmt(result.credit1)}원</span>
            </div>
            <div className="flex justify-between font-bold text-navy dark:text-canvas-50 pt-2 border-t border-canvas-200 dark:border-canvas-700">
              <span>의료비 세액공제 합계</span>
              <span>{fmt(result.credit)}원</span>
            </div>
          </div>
        </details>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 세액공제는 산출세액(결정 전 소득세) 범위 내에서만 차감되며, 남는 공제액은 환급·이월되지
          않습니다. 무한도 그룹 내 기준액 차감 순서는 연말정산 서식 구조상 통용되는 납세자 유리
          방식(15% → 20% → 30%)을 따랐습니다. 정확한 금액은 홈택스 연말정산 미리보기 또는 회사
          연말정산 결과로 확인하세요.
        </p>
      </div>
    </section>
  );
}
