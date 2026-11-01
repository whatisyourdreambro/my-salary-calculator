"use client";

import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import NumberInput from "@/components/NumberInput";
import { setHoldingTaxInputs, useHoldingTax } from "./holdingTaxInputs";

// 계산은 src/lib/propertyHoldingTax2026.ts — 재산세는 주택별(지방세법 제113조 제2항), 종부세는 인별 합계.
// 2주택 이상이면 입력값을 공시가격 합계로 보고 주택마다 같은 금액이라 보고 재산세를 집별로 계산한다 (2026-10-05 감사 code15-02).
// 2026-11-01 R2-HOLD: 총액·12월 줄에 농어촌특별세(종부세의 20%)와 1세대 1주택 고령자·장기보유 세액공제를 넣었다.
// 이 블록은 HomeTopAd 와 CalcResultAd 사이라 줄을 늘리지 않는다 — 나이·보유기간 입력과 항목별 내역은 맨 아래
// 상세(PropertyHoldingTaxDetail, 마지막 광고 아래)에 있고 입력은 holdingTaxInputs.ts 로 공유한다.

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function PropertyHoldingTaxClient() {
  const { inputs, result } = useHoldingTax();
  const { publishedValue, numHomes, isOnlyOneHome } = inputs;
  const multi = numHomes >= 2;

  return (
    <section className="my-6">
      <div className="rounded-3xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
          내 부동산 보유세 즉시 계산
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            {multi ? "공시가격 합계 (원)" : "주택 공시가격 (원)"}
          </label>
          <NumberInput
            type="number"
            value={publishedValue}
            onChange={(e) => setHoldingTaxInputs({ publishedValue: Math.max(0, Number(e.target.value) || 0) })}
            min={0}
            step={100_000_000}
            className="w-full px-4 py-3 rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-800 text-navy dark:text-canvas-50 font-bold text-lg focus:outline-none focus:border-electric"
            aria-label={multi ? "보유 주택 공시가격 합계 (원)" : "주택 공시가격 (원)"}
          />
          <p className="mt-2 text-xs text-faint-blue">
            {fmt(Math.floor(publishedValue / 100_000_000))}억{" "}
            {fmt((publishedValue % 100_000_000) / 10000)}만원{" "}
            {/* {" "} 필수 — 줄바꿈 뒤 {식} 앞 공백은 JSX 가 지워 '만원(' 으로 붙는다. 기본 화면은 종전 '만원 (' 그대로 */}
            {multi
              ? "(주택마다 공시가격이 같다고 보고 재산세를 집별로 계산)"
              : "(공시가격과 시세는 다릅니다. 실제 시세는 별도로 확인하세요)"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-navy dark:text-canvas-100 mb-2">
            보유 주택 수: {numHomes}주택{numHomes >= 3 ? " (다주택자 중과 대상 가능)" : ""}
          </label>
          <input
            type="range"
            value={numHomes}
            onChange={(e) => setHoldingTaxInputs({ numHomes: Number(e.target.value) })}
            min={1}
            max={5}
            step={1}
            className="w-full"
            aria-label="보유 주택 수"
          />
          <div className="flex justify-between text-xs text-faint-blue mt-1">
            {/* 눈금 5개 = 슬라이더 값 1~5 (종전 3개 라벨이 justify-between 으로 퍼져 '2주택'이 값 3 위에 있었다) */}
            <span>1주택</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5주택</span>
          </div>
        </div>

        {numHomes === 1 && (
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={isOnlyOneHome}
              onChange={(e) => setHoldingTaxInputs({ isOnlyOneHome: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-navy dark:text-canvas-100">
              1세대 1주택자 (종부세 12억 공제 + 재산세 특례세율·공정시장가액비율
              43~45% 적용)
            </span>
          </label>
        )}

        <div className="mt-6 p-5 rounded-2xl bg-electric-5 border border-electric-20">
          <p className="text-xs font-bold text-electric uppercase tracking-wider mb-2">
            연 보유세 총액
          </p>
          <p className="text-3xl sm:text-4xl font-black text-electric mb-3">
            {fmt(result.total)}원
          </p>
          <div className="space-y-1 text-sm pt-3 border-t border-electric-20">
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>재산세 (7·9월 분납 · 20만원 이하는 조례상 7월 일괄 가능)</span>
              <span>{fmt(result.propertyTax)}원</span>
            </div>
            <div className="flex justify-between text-muted-blue dark:text-canvas-300">
              <span>지방교육세 (재산세의 20%)</span>
              <span>+{fmt(result.educationTax)}원</span>
            </div>
            <div className="flex justify-between text-navy dark:text-canvas-100 font-bold pt-2 border-t border-electric-20 mt-2">
              <span>재산세 합계 (7·9월)</span>
              <span>{fmt(result.totalRegional)}원</span>
            </div>
            {/* 12월 고지 = 종부세(1세대 1주택 세액공제 뒤) + 농어촌특별세 20%. 광고 위 줄이라 라벨은 종전 12자
                라벨(종부세 정식 명칭 + 월 괄호)보다 짧은 11자 — 항목별 내역·나이·보유기간 입력은 맨 아래 상세로 잇는다 */}
            <div className="flex justify-between text-muted-blue dark:text-canvas-300 pt-2">
              <span>
                <a href="#holding-tax-detail" className="underline decoration-dotted underline-offset-2 hover:text-electric">
                  12월 종부세·농특세
                </a>
              </span>
              <span>{result.totalNational > 0 ? fmt(result.totalNational) + "원" : "—"}</span>
            </div>
          </div>
        </div>

        {/* 결과 직하 다음 액션 — 보유세 확인 직후 절세·자금 계획으로 연결 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tools/real-estate/gift-tax"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            공동명의·증여로 줄이려면? 증여세 계산
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
          <Link
            href="/tools/real-estate/acquisition-tax"
            className="group inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors"
          >
            매수 계획이면 취득세 먼저 계산
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
        </div>

        <p className="mt-4 text-xs text-faint-blue leading-relaxed">
          ※ 2026년 기준 — 1세대 1주택은 공정시장가액비율 43~45% 특례와
          특례세율(공시 9억 이하)을 반영하며, 그 외는 60%·표준세율 기준입니다.
          도시지역분 재산세(과표의 0.14%), 종부세의 재산세 중복분 공제,
          3주택 이상 중과세율(과표 12억 초과분 2.0~5.0%), 과세표준상한제·세부담상한은
          단순화를 위해 미반영 — 실제 고지액과 차이가 날 수 있습니다. 정확한 금액은
          위택스(wetax.go.kr)·홈택스에서 확인하세요.
        </p>
      </div>
    </section>
  );
}
