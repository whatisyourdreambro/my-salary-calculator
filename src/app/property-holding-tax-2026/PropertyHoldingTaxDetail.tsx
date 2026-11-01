"use client";

// /property-holding-tax-2026 맨 아래 — 12월 종부세 상세 (2026-11-01 R2-HOLD)
// 마지막 광고(MultiplexAd) 아래에 둔다 — 광고 위 줄 수는 그대로다. 위 계산기와 입력을 공유하고
// (holdingTaxInputs.ts), 여기서 고른 나이·보유기간은 위 '연 보유세 총액'과 '12월 종부세·농특세' 줄에도 반영된다.
// 근거(법제처 국가법령정보센터 원문): 종합부동산세법 제9조 제5항·제6항·제8항(1세대 1주택자 세액공제, 합계 80% 한도),
// 농어촌특별세법 제5조 제1항 제8호(납부하여야 할 종부세액의 20%), 과세기준일 6월 1일(종부세법 제3조·지방세법 제114조).

import { ONE_HOME_CREDIT_CAP_PERCENT, RURAL_SPECIAL_TAX_PERCENT } from "@/lib/propertyHoldingTax2026";
import { setHoldingTaxInputs, useHoldingTax } from "./holdingTaxInputs";

// 값은 구간 하한 — 공제율 구간은 엔진(seniorCreditPercent·longHoldingCreditPercent)이 정한다
const AGE_OPTIONS = [
  { value: 0, label: "만 60세 미만 — 공제 없음" },
  { value: 60, label: "만 60~64세 — 20%" },
  { value: 65, label: "만 65~69세 — 30%" },
  { value: 70, label: "만 70세 이상 — 40%" },
];
const HOLDING_OPTIONS = [
  { value: 0, label: "5년 미만 — 공제 없음" },
  { value: 5, label: "5년 이상 10년 미만 — 20%" },
  { value: 10, label: "10년 이상 15년 미만 — 40%" },
  { value: 15, label: "15년 이상 — 50%" },
];

const SELECT_CLASS =
  "w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 px-3 py-3 text-base text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric disabled:opacity-60";
const ROW_CLASS = "flex justify-between gap-3 text-muted-blue dark:text-canvas-300";

function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export default function PropertyHoldingTaxDetail() {
  const { inputs, result } = useHoldingTax();
  const eligible = result.oneHomeCreditEligible;
  const hasTax = result.comprehensiveTaxBeforeCredit > 0;
  const requestedPercent = result.seniorCreditPercent + result.longHoldingCreditPercent;
  const condition =
    inputs.numHomes >= 2
      ? `${inputs.numHomes}주택, 공시가격 합계 ${won(inputs.publishedValue)}`
      : `1주택, 공시가격 ${won(inputs.publishedValue)}${eligible ? ", 1세대 1주택자" : ""}`;
  const creditLabel =
    requestedPercent === 0
      ? "1세대 1주택 세액공제 (해당 없음)"
      : `1세대 1주택 세액공제 (고령자 ${result.seniorCreditPercent}% + 장기보유 ${result.longHoldingCreditPercent}%${
          requestedPercent > ONE_HOME_CREDIT_CAP_PERCENT ? ` → 한도 ${ONE_HOME_CREDIT_CAP_PERCENT}%` : ""
        })`;

  return (
    <section id="holding-tax-detail" aria-labelledby="holding-tax-detail-title" className="my-10 scroll-mt-28">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 id="holding-tax-detail-title" className="text-lg font-black text-navy dark:text-canvas-50 mb-2">
          12월 종부세 상세 — 세액공제·농어촌특별세
        </h2>
        <p className="mb-4 text-sm leading-6 text-muted-blue dark:text-canvas-300">
          위 계산기 입력({condition})으로 12월 고지분을 나눠 봅니다. 1세대 1주택자는 과세기준일(6월 1일) 현재 나이와
          보유기간을 고르면 고령자·장기보유 세액공제가 위 연 보유세 총액에도 반영됩니다.
        </p>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-navy dark:text-canvas-100">나이 (6월 1일 현재 만 나이)</span>
            <select
              value={inputs.age}
              onChange={(e) => setHoldingTaxInputs({ age: Number(e.target.value) })}
              disabled={!eligible}
              className={SELECT_CLASS}
            >
              {AGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-navy dark:text-canvas-100">보유기간 (6월 1일 현재)</span>
            <select
              value={inputs.holdingYears}
              onChange={(e) => setHoldingTaxInputs({ holdingYears: Number(e.target.value) })}
              disabled={!eligible}
              className={SELECT_CLASS}
            >
              {HOLDING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!eligible && (
          <p className="mb-4 text-xs leading-relaxed text-faint-blue">
            고령자·장기보유 세액공제는 1세대 1주택자만 받습니다. 위 계산기에서 1주택과 1세대 1주택자를 고르면 적용됩니다.
          </p>
        )}

        <dl className="space-y-1 text-sm">
          <div className={ROW_CLASS}>
            <dt>재산세 합계 (7·9월)</dt>
            <dd className="shrink-0">{won(result.totalRegional)}</dd>
          </div>
          {eligible ? (
            <>
              <div className={`${ROW_CLASS} pt-2 border-t border-canvas-200 dark:border-canvas-700 mt-2`}>
                <dt>종부세 산출세액</dt>
                <dd className="shrink-0">{hasTax ? won(result.comprehensiveTaxBeforeCredit) : "—"}</dd>
              </div>
              <div className={ROW_CLASS}>
                <dt>{creditLabel}</dt>
                <dd className="shrink-0">{result.oneHomeCredit > 0 ? `−${won(result.oneHomeCredit)}` : "—"}</dd>
              </div>
              <div className={ROW_CLASS}>
                <dt>납부할 종부세</dt>
                <dd className="shrink-0">{hasTax ? won(result.comprehensiveTax) : "—"}</dd>
              </div>
            </>
          ) : (
            <div className={`${ROW_CLASS} pt-2 border-t border-canvas-200 dark:border-canvas-700 mt-2`}>
              <dt>종부세</dt>
              <dd className="shrink-0">{hasTax ? won(result.comprehensiveTax) : "—"}</dd>
            </div>
          )}
          <div className={ROW_CLASS}>
            <dt>농어촌특별세 (납부할 종부세의 {RURAL_SPECIAL_TAX_PERCENT}%)</dt>
            <dd className="shrink-0">{hasTax ? won(result.ruralSpecialTax) : "—"}</dd>
          </div>
          <div className={ROW_CLASS}>
            <dt>12월 종부세·농특세 합계</dt>
            <dd className="shrink-0">{hasTax ? won(result.totalNational) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-3 pt-2 border-t border-canvas-200 dark:border-canvas-700 mt-2 font-bold text-navy dark:text-canvas-100">
            <dt>연 보유세 총액</dt>
            <dd className="shrink-0">{won(result.total)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-faint-blue">
          근거: 종합부동산세법 제9조 제5항·제6항·제8항(1세대 1주택자 만 60·65·70세 이상 20·30·40%, 5·10·15년 이상 보유
          20·40·50%, 두 공제 합계 80% 한도)과 농어촌특별세법 제5조 제1항 제8호(납부할 종부세액의 20%). 종부세의 재산세
          중복분 공제와 세부담 상한은 반영하지 않아 실제 고지액이 이보다 적을 수 있고, 3주택 이상 중과세율(과세표준 12억 초과분)도
          반영하지 않습니다. 부부 공동명의 1주택 특례와 일시적 2주택·상속주택 특례는 계산하지 않습니다.
        </p>
      </div>
    </section>
  );
}
