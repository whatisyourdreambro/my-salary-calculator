"use client";

import { useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import {
  judgeDependent,
  ageInTaxYear,
  RELATION_LABEL,
  ELDER_70_BIRTH_YEAR_MAX,
  type DependentRelation,
  type IncomeType,
  type LivingStatus,
} from "@/lib/dependentEligibility";

function fmtMan(won: number): string {
  return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만원`;
}
function formatInput(raw: string): string {
  const d = raw.replace(/[^0-9]/g, "");
  return d ? Number(d).toLocaleString("ko-KR") : "";
}
function parseInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

const RELATIONS: { value: DependentRelation; label: string; sub: string }[] = [
  { value: "ascendant", label: "부모·조부모", sub: "배우자의 부모 포함" },
  { value: "spouse", label: "배우자", sub: "나이 요건 없음" },
  { value: "descendant", label: "자녀·손자녀", sub: "입양자 포함" },
  { value: "sibling", label: "형제자매", sub: "처남·시누이 포함" },
];

const INCOME_TYPES: { value: IncomeType; label: string; sub: string }[] = [
  { value: "none", label: "소득 없음", sub: "비과세·분리과세만 있는 경우 포함" },
  { value: "workOnly", label: "근로소득만 있음", sub: "총급여 500만원 이하면 충족" },
  { value: "other", label: "다른 소득도 있음", sub: "사업·연금·금융·기타 등" },
];

// 동거 문항 선택지 — 관계별로 법정 예외가 달라 라벨을 분리
const LIVING_OPTIONS: Record<
  "ascendant" | "sibling",
  { value: LivingStatus; label: string }[]
> = {
  ascendant: [
    { value: "together", label: "함께 살고 있어요" },
    { value: "apartQualified", label: "따로 살지만 생활비를 보태는 등 실제 부양해요" },
    { value: "apart", label: "따로 살고 부양하지 않아요" },
  ],
  sibling: [
    { value: "together", label: "함께 살고 있어요 (주민등록 동거)" },
    { value: "apartQualified", label: "취학·요양·근무·사업 때문에 일시 퇴거 중이에요" },
    { value: "apart", label: "그 외 사유로 따로 살아요" },
  ],
};

function OptionButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl px-3 py-3 text-left border transition w-full ${
        active
          ? "border-electric bg-electric-10 text-electric"
          : "border-canvas-200 dark:border-canvas-700 bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50 hover:border-electric/50"
      }`}
    >
      <span className="block text-sm font-black tracking-tight">{label}</span>
      {sub && <span className="block text-[11px] mt-0.5 text-faint-blue">{sub}</span>}
    </button>
  );
}

export default function DependentCheckClient() {
  const [relation, setRelation] = useState<DependentRelation>("ascendant");
  const [birthYearStr, setBirthYearStr] = useState("1958");
  const [incomeType, setIncomeType] = useState<IncomeType>("none");
  const [incomeStr, setIncomeStr] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [living, setLiving] = useState<LivingStatus>("together");

  const birthYear = Number(birthYearStr.replace(/[^0-9]/g, "")) || 0;
  const birthYearValid = birthYear >= 1900 && birthYear <= 2026;
  const needIncomeAmount = incomeType !== "none";
  const needLiving = relation === "ascendant" || relation === "sibling";

  const verdict = useMemo(() => {
    if (!birthYearValid) return null;
    return judgeDependent({
      relation,
      birthYear,
      incomeType,
      incomeAmount: needIncomeAmount ? parseInput(incomeStr) : 0,
      isDisabled,
      living: needLiving ? living : "together",
    });
  }, [relation, birthYear, birthYearValid, incomeType, incomeStr, isDisabled, living, needIncomeAmount, needLiving]);

  const extras: { label: string; amount: number }[] = verdict
    ? [
        ...(verdict.extraSenior > 0
          ? [{ label: `경로우대 (만 70세 이상 — ${ELDER_70_BIRTH_YEAR_MAX}년 이전 출생)`, amount: verdict.extraSenior }]
          : []),
        ...(verdict.extraDisabled > 0
          ? [{ label: "장애인 추가공제", amount: verdict.extraDisabled }]
          : []),
      ]
    : [];

  return (
    <div className="space-y-5 mb-10">
      {/* 문항 카드 */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-6">
        <div>
          <p className="text-xs font-bold tracking-tight mb-2 text-faint-blue">
            1. 공제받으려는 가족과의 관계
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {RELATIONS.map((r) => (
              <OptionButton
                key={r.value}
                active={relation === r.value}
                onClick={() => setRelation(r.value)}
                label={r.label}
                sub={r.sub}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dc-birth" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
              2. 출생연도 (주민등록 기준)
            </label>
            <input
              id="dc-birth"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={birthYearStr}
              placeholder="1958"
              onChange={(e) => setBirthYearStr(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50"
              aria-label="출생연도"
            />
            {birthYearValid && (
              <p className="text-[11px] text-faint-blue mt-1.5">
                2026년 귀속 기준 만 {ageInTaxYear(birthYear)}세로 판정합니다.
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight mb-2 text-faint-blue">
              3. 장애인 여부 (장애인복지법 등록·중증환자 등)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton active={!isDisabled} onClick={() => setIsDisabled(false)} label="아니요" />
              <OptionButton
                active={isDisabled}
                onClick={() => setIsDisabled(true)}
                label="예"
                sub="나이 요건 면제 + 200만원 추가"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-tight mb-2 text-faint-blue">
            4. 이 가족의 2026년 소득
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {INCOME_TYPES.map((t) => (
              <OptionButton
                key={t.value}
                active={incomeType === t.value}
                onClick={() => setIncomeType(t.value)}
                label={t.label}
                sub={t.sub}
              />
            ))}
          </div>
          {needIncomeAmount && (
            <div className="mt-3">
              <label htmlFor="dc-income" className="text-xs font-bold tracking-tight block mb-2 text-faint-blue">
                {incomeType === "workOnly"
                  ? "연간 총급여 (세전, 비과세 제외)"
                  : "연간 소득금액 (총수입 − 필요경비, 각 소득 합산)"}
              </label>
              <div className="relative max-w-xs">
                <input
                  id="dc-income"
                  type="text"
                  inputMode="numeric"
                  value={incomeStr}
                  placeholder={incomeType === "workOnly" ? "4,800,000" : "900,000"}
                  onChange={(e) => setIncomeStr(formatInput(e.target.value))}
                  className="w-full rounded-xl px-4 py-4 text-lg font-black bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric/50 pr-9"
                  aria-label="연간 소득"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint-blue">원</span>
              </div>
            </div>
          )}
        </div>

        {needLiving && (
          <div>
            <p className="text-xs font-bold tracking-tight mb-2 text-faint-blue">
              5. 같이 살고 있나요?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {LIVING_OPTIONS[relation === "ascendant" ? "ascendant" : "sibling"].map((o) => (
                <OptionButton
                  key={o.value}
                  active={living === o.value}
                  onClick={() => setLiving(o.value)}
                  label={o.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 판정 결과 */}
      {!verdict ? (
        <p className="text-sm font-bold text-muted-blue text-center py-4">
          출생연도 4자리를 입력하면 즉시 판정됩니다.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ boxShadow: verdict.eligible ? "0 8px 40px #0145F225" : "0 8px 40px #0F172A20" }}>
          <div
            className="px-8 py-8 text-center"
            style={{
              background: verdict.eligible
                ? "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)"
                : "linear-gradient(135deg, #334155 0%, #475569 100%)",
            }}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              {RELATION_LABEL[relation]} — 2026년 귀속 판정
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
              {verdict.eligible ? `기본공제 ${fmtMan(verdict.basicDeduction)} 가능` : "기본공제 불가"}
            </div>
            <p className="text-sm font-bold mt-2" style={{ color: "rgba(255,255,255,0.7)" }}>
              {verdict.eligible
                ? `추가공제 포함 소득공제 합계 ${fmtMan(verdict.totalDeduction)} — 과세표준에서 차감`
                : "아래 미충족 요건을 확인하세요. 요건이 하나라도 어긋나면 공제 대상이 아닙니다."}
            </p>
          </div>

          <div className="bg-white dark:bg-canvas-900 px-6 py-5 space-y-3">
            {verdict.checks.map((c) => (
              <div key={c.key} className="flex items-start gap-3 border-b border-canvas-100 dark:border-canvas-800 pb-3">
                {c.ok ? (
                  <CheckCircle2 size={18} className="text-electric flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className={`text-sm font-black ${c.ok ? "text-navy dark:text-canvas-50" : "text-red-500"}`}>
                    {c.title} {c.ok ? "충족" : "미충족"}
                  </div>
                  <div className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed mt-0.5">{c.detail}</div>
                </div>
              </div>
            ))}

            {verdict.eligible && extras.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-black uppercase tracking-widest text-faint-blue mb-2">추가공제</p>
                {extras.map((ex) => (
                  <div key={ex.label} className="flex items-baseline justify-between gap-3 text-sm py-1">
                    <span className="font-bold text-navy dark:text-canvas-50">{ex.label}</span>
                    <span className="font-black tabular-nums text-electric shrink-0">+{fmtMan(ex.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ★소득요건 기준연도 안내 — 2026 귀속(이번 정산)은 100만원이 정답 */}
            <div className="rounded-xl px-4 py-3 bg-canvas-50 dark:bg-canvas-800 text-[11px] text-muted-blue dark:text-canvas-300 leading-relaxed">
              이 판정은 <strong className="text-navy dark:text-canvas-50">2026년 귀속분(2027년 1~2월 정산)</strong> 기준으로,
              소득요건은 연간 소득금액 <strong className="text-navy dark:text-canvas-50">100만원 이하</strong>(근로소득만 있으면 총급여
              500만원 이하)입니다. 2026년 8월 3일 발표된 세제개편안의 <strong className="text-navy dark:text-canvas-50">300만원 완화</strong>는
              국회를 통과해야 하며, 통과 시에도 <strong className="text-navy dark:text-canvas-50">2027년 귀속분(2028년 초 정산)부터</strong> 적용됩니다.
            </div>
          </div>
        </div>
      )}

      {/* 결과 직하 광고 */}
      <CalcResultAd />

      {/* 다음 단계 CTA — 광고 아래 배치 (2026-08-16 규칙) */}
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-2">
          부양가족을 확인했다면, 환급액도 미리 계산해 보세요
        </h2>
        <p className="text-sm text-muted-blue dark:text-canvas-300 mb-4 leading-relaxed">
          기본공제 대상자 수를 연말정산 계산기에 넣으면 올해 예상 환급(또는 추가 납부)액이 바로 나옵니다.
        </p>
        <Link
          href="/year-end-tax"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black text-white bg-electric hover:opacity-90 transition"
        >
          연말정산 환급액 계산하기 <ArrowRight size={16} />
        </Link>
        <div className="mt-4 pt-4 border-t border-canvas-100 dark:border-canvas-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/calc/child-deduction" className="font-bold text-electric hover:underline">
            자녀 인적공제·세액공제 계산기 →
          </Link>
          <Link href="/year-end-tax-checklist" className="font-bold text-electric hover:underline">
            연말정산 준비 체크리스트 →
          </Link>
        </div>
      </div>
    </div>
  );
}
