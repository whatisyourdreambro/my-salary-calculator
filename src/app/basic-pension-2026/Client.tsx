// src/app/basic-pension-2026/Client.tsx
// 기초연금 간이 계산기 (클라이언트) — 2026년 보건복지부 공표 수치 기준.
//
// 수치 출처(전부 공식 공표값):
// - 기준연금액 월 349,700원(2.1% 인상), 부부 각 20% 감액 후 279,760원(합산 최대 559,520원)
// - 선정기준액: 단독 월 2,470,000원 / 부부 월 3,952,000원
// - 국민연금 연계 기준: 월 524,550원(기준연금액의 150%)
// - 소득역전방지 감액 최저 보장: 기준연금액의 10%(부부 2인 합산 20%)
//   → 보건복지부 보도자료(2026-01-09) · basicpension.mohw.go.kr
//
// 간이 계산 원칙: 리서치 검증된 규칙만 구현.
// 국민연금 연계 감액의 세부 산식(개인별 A급여액 필요)은 미구현 — 대상 여부만 안내.

"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  MinusCircle,
  Users,
  User,
} from "lucide-react";

// ── 2026 공표 상수 ──────────────────────────────────────────
const BASE_PENSION = 349_700; // 기준연금액(월)
const COUPLE_SUM = 559_520; // 부부 합산 최대
const SELECTION_SINGLE = 2_470_000; // 선정기준액(단독)
const SELECTION_COUPLE = 3_952_000; // 선정기준액(부부)
const NP_LINK_THRESHOLD = 524_550; // 국민연금 연계 기준(기준연금액 150%)
const FLOOR_SINGLE = Math.round(BASE_PENSION * 0.1); // 최저 보장(단독) = 34,970
const FLOOR_COUPLE = Math.round(BASE_PENSION * 0.2); // 최저 보장(부부 2인 합산) = 69,940

const formatNumber = (n: number) => Math.round(n).toLocaleString("ko-KR");
const parseNumber = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

type HouseholdType = "single" | "couple";

const INCOME_PRESETS = [0, 500_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000];
const NP_PRESETS = [0, 300_000, 524_550, 700_000];

export default function BasicPensionCalculator() {
  const [household, setHousehold] = useState<HouseholdType>("single");
  const [incomeStr, setIncomeStr] = useState("1000000");
  const [npStr, setNpStr] = useState("0");

  const result = useMemo(() => {
    const income = parseNumber(incomeStr);
    const np = parseNumber(npStr);
    const isCouple = household === "couple";

    const selection = isCouple ? SELECTION_COUPLE : SELECTION_SINGLE;

    // ① 수급 대상 여부 — 소득인정액이 선정기준액 초과면 탈락
    if (income > selection) {
      return {
        eligible: false as const,
        income,
        selection,
        overBy: income - selection,
      };
    }

    // ② 시작 금액: 기준연금액 (부부는 각 20% 감액 적용)
    const beforeReversal = isCouple ? COUPLE_SUM : BASE_PENSION;
    const coupleCut = isCouple ? BASE_PENSION * 2 - COUPLE_SUM : 0;

    // ③ 소득역전방지 감액: (소득인정액 + 기초연금액) − 선정기준액 만큼 감액,
    //    최저 보장 = 기준연금액의 10%(단독) / 부부 2인 합산 20%
    const overlap = income + beforeReversal - selection;
    const floor = isCouple ? FLOOR_COUPLE : FLOOR_SINGLE;
    const reversalCut =
      overlap > 0 ? Math.min(overlap, beforeReversal - floor) : 0;
    const finalAmount = beforeReversal - reversalCut;

    // ④ 국민연금 연계 감액 — 대상 여부만 판정(산식은 개인별 A급여액 필요, 간이 계산 미반영)
    const npLinked = np > NP_LINK_THRESHOLD;

    return {
      eligible: true as const,
      income,
      selection,
      isCouple,
      coupleCut,
      reversalCut,
      floorApplied: overlap > 0 && overlap > beforeReversal - floor,
      finalAmount,
      perPerson: isCouple ? finalAmount / 2 : finalAmount,
      yearly: finalAmount * 12,
      npLinked,
      np,
    };
  }, [household, incomeStr, npStr]);

  return (
    <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
      <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-electric" />
        기초연금 간이 계산기 (2026년 기준)
      </h2>
      <p className="text-xs text-faint-blue mb-6">
        보건복지부 2026년 공표 수치(기준연금액 349,700원·선정기준액 단독 247만원/부부
        395만 2천원) 기준 간이 계산입니다. 실제 수급 여부와 금액은 국민연금공단
        심사로 확정됩니다.
      </p>

      <div className="space-y-5">
        {/* 가구 유형 */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">가구 유형</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHousehold("single")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${
                household === "single"
                  ? "bg-electric text-white border-electric"
                  : "bg-canvas border-canvas-200 text-navy hover:border-electric"
              }`}
            >
              <User className="w-4 h-4" />
              단독 가구
            </button>
            <button
              type="button"
              onClick={() => setHousehold("couple")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${
                household === "couple"
                  ? "bg-electric text-white border-electric"
                  : "bg-canvas border-canvas-200 text-navy hover:border-electric"
              }`}
            >
              <Users className="w-4 h-4" />
              부부 가구
            </button>
          </div>
        </div>

        {/* 월 소득인정액 */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            월 소득인정액 {household === "couple" && "(부부 합산)"}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={parseNumber(incomeStr).toLocaleString("ko-KR")}
              onChange={(e) => setIncomeStr(String(parseNumber(e.target.value)))}
              className="w-full border border-canvas-200 rounded-xl px-4 py-3 pr-10 text-right text-lg font-black text-navy bg-canvas focus:outline-none focus:ring-2 focus:ring-electric/30"
              placeholder="1,000,000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-faint-blue text-sm">
              원
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {INCOME_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setIncomeStr(String(v))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-canvas border border-canvas-200 text-muted-blue hover:border-electric hover:text-electric transition-colors"
              >
                {v === 0 ? "0원" : `${v / 10_000}만원`}
              </button>
            ))}
          </div>
          <p className="text-xs text-faint-blue mt-2">
            소득인정액 = 월 소득평가액 + 재산의 월 소득환산액. 국민연금 수령액도
            소득에 포함됩니다. 정확한 값은 아래 &ldquo;소득인정액이란?&rdquo; 설명과
            공식 모의계산을 참고하세요.
          </p>
        </div>

        {/* 국민연금 월 수령액 */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            국민연금 월 수령액 (본인 기준, 없으면 0)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={parseNumber(npStr).toLocaleString("ko-KR")}
              onChange={(e) => setNpStr(String(parseNumber(e.target.value)))}
              className="w-full border border-canvas-200 rounded-xl px-4 py-3 pr-10 text-right text-lg font-black text-navy bg-canvas focus:outline-none focus:ring-2 focus:ring-electric/30"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-faint-blue text-sm">
              원
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {NP_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNpStr(String(v))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-canvas border border-canvas-200 text-muted-blue hover:border-electric hover:text-electric transition-colors"
              >
                {v === 0
                  ? "0원"
                  : v === NP_LINK_THRESHOLD
                    ? "524,550원 (연계 기준)"
                    : `${v / 10_000}만원`}
              </button>
            ))}
          </div>
          <p className="text-xs text-faint-blue mt-2">
            월 524,550원(기준연금액의 150%) 이하면 국민연금 연계 감액 없이 전액
            기준으로 계산됩니다.
          </p>
        </div>
      </div>

      {/* 결과 */}
      <div className="mt-6">
        {!result.eligible ? (
          <div className="p-5 bg-canvas rounded-2xl border border-canvas-200">
            <p className="flex items-start gap-2 text-sm font-bold text-navy">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              소득인정액이 선정기준액을 초과해 수급 대상이 아닙니다 (간이 판정)
            </p>
            <p className="text-sm text-muted-blue mt-2 leading-relaxed">
              입력한 소득인정액 월 {formatNumber(result.income)}원이{" "}
              {household === "couple" ? "부부" : "단독"} 가구 선정기준액 월{" "}
              {formatNumber(result.selection)}원보다{" "}
              {formatNumber(result.overBy)}원 많습니다. 소득인정액은 근로소득
              공제·재산 공제에 따라 실제로는 더 낮게 산정될 수 있으니, 경계선에
              있다면 공식 모의계산과 국민연금공단 상담을 꼭 받아보세요.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 bg-electric-10 rounded-2xl border border-electric/20">
            <h3 className="text-sm font-black text-electric mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              예상 기초연금액 (간이 계산)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-4 bg-white rounded-xl border border-canvas-200 text-center">
                <p className="text-xs text-faint-blue mb-1">
                  월 예상액{result.isCouple && " (부부 합산)"}
                </p>
                <p className="text-2xl font-black text-electric">
                  {formatNumber(result.finalAmount)}원
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-canvas-200 text-center">
                <p className="text-xs text-faint-blue mb-1">
                  {result.isCouple ? "1인당 월 예상액" : "연간 환산"}
                </p>
                <p className="text-2xl font-black text-navy">
                  {result.isCouple
                    ? `${formatNumber(result.perPerson)}원`
                    : `${formatNumber(result.yearly)}원`}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-canvas-200 text-center">
                <p className="text-xs text-faint-blue mb-1">
                  {result.isCouple ? "연간 환산 (합산)" : "최대 대비"}
                </p>
                <p className="text-2xl font-black text-navy">
                  {result.isCouple
                    ? `${formatNumber(result.yearly)}원`
                    : `${Math.round((result.finalAmount / BASE_PENSION) * 100)}%`}
                </p>
              </div>
            </div>

            {/* 감액 내역 */}
            <div className="space-y-2">
              {result.isCouple && (
                <p className="flex items-start gap-2 text-xs text-muted-blue">
                  <MinusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  부부 감액 20% 적용: 1인당 349,700원 → 279,760원 (합산 −
                  {formatNumber(result.coupleCut)}원)
                </p>
              )}
              {result.reversalCut > 0 && (
                <p className="flex items-start gap-2 text-xs text-muted-blue">
                  <MinusCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  소득역전방지 감액 −{formatNumber(result.reversalCut)}원:
                  (소득인정액 + 기초연금액)이 선정기준액을 초과한 만큼 감액
                  {result.floorApplied &&
                    ` — 최저 보장액(기준연금액의 ${
                      result.isCouple ? "20%·부부 합산" : "10%"
                    })이 적용됐습니다`}
                </p>
              )}
              {result.npLinked && (
                <p className="flex items-start gap-2 text-xs font-bold text-amber-600">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  국민연금 월 {formatNumber(result.np)}원은 연계 감액 기준
                  524,550원을 초과합니다. 연계 감액 산식은 개인별 국민연금 가입
                  이력에 따라 달라 이 간이 계산에는 반영되지 않았으며, 실제
                  수령액은 위 금액보다 적을 수 있습니다.
                </p>
              )}
            </div>

            <p className="flex items-start gap-2 text-xs text-faint-blue mt-4 pt-3 border-t border-electric/10">
              <Info className="w-4 h-4 shrink-0" />
              본 결과는 공표 수치 기반 간이 계산입니다. 소득인정액 산정(근로소득
              공제·재산 환산)과 국민연금 연계 감액은 간소화돼 있으며, 실제 수급
              여부와 금액은 국민연금공단 심사로 확정됩니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
