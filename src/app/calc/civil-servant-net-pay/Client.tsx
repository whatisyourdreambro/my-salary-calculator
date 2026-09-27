"use client";

// 공무원 월급 실수령액 계산기 — 입력·결과 클라이언트 (2026-09-27 신설, 운영자 승인 202종 동결 예외 1건).
// 엔진·데이터: src/lib/civilServantNetPay.ts · civilServantAllowances2026.ts (조문·확인일은 각 파일 머리 주석).
//
// ★ 광고 위 고정 높이 규칙 (2026-08-16 수익 급락 사건 · 결과 직하 광고):
//   CalcResultAd 위의 입력 카드·결과 카드는 직종(#general·#teacher·#police·#fire·#soldier)과 입력값에 관계없이
//   모든 폭에서 같은 높이여야 한다. 그래서
//   - 입력 행은 항상 같은 개수의 칸을 렌더하고(해당 없는 칸은 비활성 자리표시), 라벨은 한 줄 고정 높이(h-5, 말줄임)
//   - 컨트롤은 전부 h-11 고정, 결과 카드는 항상 8행(0원도 표시) · 행마다 고정 높이 · 줄바꿈 금지
//   - 해시 프리셋은 useEffect 에서 읽는다(useSearchParams 는 정적 렌더를 깨뜨림) — 서버 렌더 기본값은 9급 1호봉(골든 A)
//   새 행·문구를 광고 위에 추가하지 말 것. 설명·표·미리보기는 광고 아래에만 둔다.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "@/components/AppLink";
import { CalcResultAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import {
  CIVIL_AMOUNT_INPUT_MAX,
  CIVIL_DEFAULT_INPUT,
  CIVIL_KINDS,
  CIVIL_KIND_PRESETS,
  CIVIL_RANKS,
  CIVIL_YEARS_OPTIONS,
  civilHobongOptions,
  clampHobong,
  computeCivilNetPay,
  previewCivilNetPay2027,
  type CivilHazard,
  type CivilKind,
  type CivilNetPayInput,
  type WithholdingPct,
} from "@/lib/civilServantNetPay";
import { CIVIL_PENSION_2026, CIVIL_OVERTIME_2026 } from "@/lib/civilServantAllowances2026";
import { RAISE_2027_BUDGET } from "@/lib/civilServantPay";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n) : 0).toLocaleString("ko-KR");
const won = (n: number) => `${fmt(n)}원`;
const RAISE_LABEL = `${(RAISE_2027_BUDGET * 100).toFixed(1)}%`;
/** 요율 표기 — 부동소수 꼬리 제거 (소수 셋째 자리까지) */
const RATE_TEXT = (rate: number) => `${Number((rate * 100).toFixed(3))}%`;

const HOURS_OPTIONS = Array.from({ length: 121 }, (_, i) => i);
const COUNT_OPTIONS = Array.from({ length: 7 }, (_, i) => i);
const HAZARD_OPTIONS: ReadonlyArray<{ value: CivilHazard; label: string }> = [
  { value: "none", label: "없음" },
  { value: "gap", label: "갑종 6만" },
  { value: "gapPlus", label: "갑종+가산금 8만" },
];

const KIND_HASHES: Record<string, CivilKind> = {
  "#general": "general",
  "#teacher": "teacher",
  "#police": "police",
  "#fire": "fire",
  "#soldier": "soldier",
};

// 모든 컨트롤(select·토글 버튼)이 같은 크기 클래스를 쓴다 — 높이 h-11 고정, 한 줄 말줄임
const CONTROL_SIZE = "h-11 w-full min-w-0 truncate whitespace-nowrap rounded-xl border px-2 sm:px-3 text-sm font-bold";
const CONTROL = `${CONTROL_SIZE} border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50 focus:outline-none focus:ring-2 focus:ring-electric disabled:bg-canvas-50 disabled:text-faint-blue dark:disabled:bg-canvas-800`;
const LABEL = "block h-5 truncate whitespace-nowrap text-[11px] sm:text-xs font-bold leading-5 text-faint-blue";

function Slot({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="min-w-0" data-civ-slot="">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={LABEL}>
          {label}
        </label>
      ) : (
        <span className={LABEL}>{label}</span>
      )}
      <div className="mt-1 h-11">{children}</div>
    </div>
  );
}

function EmptySlot({ id }: { id: string }) {
  return (
    <Slot label="추가 항목 없음" htmlFor={id}>
      <select id={id} disabled className={CONTROL} value="-" onChange={() => undefined}>
        <option value="-">–</option>
      </select>
    </Slot>
  );
}

function Toggle({ id, pressed, disabled, onClick, children }: { id: string; pressed: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`${CONTROL_SIZE} transition-colors disabled:border-canvas-200 disabled:bg-canvas-50 disabled:text-faint-blue dark:disabled:border-canvas-700 dark:disabled:bg-canvas-800 ${
        pressed ? "border-electric bg-electric text-white" : "border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 text-navy dark:text-canvas-50"
      }`}
    >
      {children}
    </button>
  );
}

function ResultRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex h-8 items-center justify-between gap-3 overflow-hidden whitespace-nowrap text-sm" data-civ-result-row="">
      <dt className="min-w-0 truncate text-muted-blue dark:text-canvas-300">{label}</dt>
      <dd className={`shrink-0 tabular-nums ${strong ? "font-black text-navy dark:text-canvas-50" : "font-bold text-navy dark:text-canvas-100"}`}>{value}</dd>
    </div>
  );
}

export default function CivilNetPayClient({ initialKind = "general" }: { initialKind?: CivilKind }) {
  const [input, setInput] = useState<CivilNetPayInput>(() =>
    initialKind === "general" ? CIVIL_DEFAULT_INPUT : { ...CIVIL_DEFAULT_INPUT, ...CIVIL_KIND_PRESETS[initialKind] }
  );
  const [baseDraft, setBaseDraft] = useState("");
  const [otherTaxDraft, setOtherTaxDraft] = useState("");
  const [otherNonTaxDraft, setOtherNonTaxDraft] = useState("");
  const [bonusDraft, setBonusDraft] = useState("");

  // 해시 프리셋 (#teacher 등) — 마운트 후에만 읽는다. 서버 렌더·첫 하이드레이션은 항상 기본값.
  useEffect(() => {
    const apply = () => {
      const kind = KIND_HASHES[window.location.hash];
      if (kind) setInput((prev) => ({ ...prev, ...CIVIL_KIND_PRESETS[kind] }));
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const toAmount = (draft: string) => {
    const n = Number(draft.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? Math.min(n, CIVIL_AMOUNT_INPUT_MAX) : 0;
  };
  const effective: CivilNetPayInput = useMemo(
    () => ({
      ...input,
      baseIncomeOverride: toAmount(baseDraft) > 0 ? toAmount(baseDraft) : null,
      otherTaxableMonthly: toAmount(otherTaxDraft),
      otherNonTaxableMonthly: toAmount(otherNonTaxDraft),
      annualPerformanceBonus: toAmount(bonusDraft),
    }),
    [input, baseDraft, otherTaxDraft, otherNonTaxDraft, bonusDraft]
  );
  const r = useMemo(() => computeCivilNetPay(effective), [effective]);
  const p27 = useMemo(() => previewCivilNetPay2027(effective), [effective]);

  const kind = input.kind;
  const soldier = kind === "soldier";
  const ranks = CIVIL_RANKS[kind];
  const hobongs = civilHobongOptions(kind, input.rank);
  const inputsOk = Boolean(CIVIL_RANKS[kind]?.[input.rank]) && (soldier || hobongs.includes(input.hobong));
  const measurement = useCalculatorMeasurement({
    calcType: "civil_servant_net_pay",
    valid: inputsOk && [r.net, r.grossMonthly, r.deductions].every(Number.isFinite),
    // React 메모리 안의 비교 키일 뿐 — 금액·직종은 분석 이벤트로 보내지 않는다(훅이 전송하지 않음).
    resultKey: `${kind}:${input.rank}:${input.hobong}:${r.net}`,
  });

  const update = (patch: Partial<CivilNetPayInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const chooseKind = (next: CivilKind) => {
    if (next === kind) return;
    setInput((prev) => ({ ...prev, ...CIVIL_KIND_PRESETS[next] }));
  };
  const chooseRank = (rank: number) => setInput((prev) => ({ ...prev, rank, hobong: clampHobong(prev.kind, rank, prev.hobong) }));

  const yearsLabel = CIVIL_YEARS_OPTIONS.find((o) => o.value === input.yearsOfService)?.label ?? "";
  const caption = soldier
    ? `${r.rankLabel} · 월 실수령액 (봉급 전액 비과세)`
    : `${r.rankLabel} ${input.hobong}호봉 · 재직 ${yearsLabel} · 월 실수령액`;

  const hoursSelect = (id: string) => (
    <Slot label="시간외근무(월)" htmlFor={id}>
      <select id={id} className={CONTROL} value={input.overtimeHours} onChange={(e) => update({ overtimeHours: Number(e.target.value) })}>
        {HOURS_OPTIONS.map((h) => (
          <option key={h} value={h}>
            {h}시간{h === CIVIL_OVERTIME_2026.flatHours ? " (정액분)" : ""}
          </option>
        ))}
      </select>
    </Slot>
  );

  let optionSlots: ReactNode;
  if (kind === "general") {
    optionSlots = (
      <>
        {hoursSelect("civ-hours")}
        <EmptySlot id="civ-opt2" />
        <EmptySlot id="civ-opt3" />
      </>
    );
  } else if (kind === "teacher") {
    optionSlots = (
      <>
        <Slot label="담임(학급담당)">
          <Toggle id="civ-homeroom" pressed={input.homeroom} onClick={() => update({ homeroom: !input.homeroom })}>
            {input.homeroom ? "담임 ✓" : "담임 아님"}
          </Toggle>
        </Slot>
        <Slot label="보직교사">
          <Toggle id="civ-head" pressed={input.headTeacher} onClick={() => update({ headTeacher: !input.headTeacher })}>
            {input.headTeacher ? "보직 ✓" : "보직 아님"}
          </Toggle>
        </Slot>
        {hoursSelect("civ-hours")}
      </>
    );
  } else if (kind === "police" || kind === "fire") {
    optionSlots = (
      <>
        <Slot label="위험근무수당" htmlFor="civ-hazard">
          <select id="civ-hazard" className={CONTROL} value={input.hazard} onChange={(e) => update({ hazard: e.target.value as CivilHazard })}>
            {HAZARD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Slot>
        {hoursSelect("civ-hours")}
        <EmptySlot id="civ-opt3" />
      </>
    );
  } else {
    optionSlots = (
      <>
        <EmptySlot id="civ-opt1" />
        <EmptySlot id="civ-opt2" />
        <EmptySlot id="civ-opt3" />
      </>
    );
  }

  const annualNote = soldier
    ? "병 봉급은 소득세법상 비과세이고 공무원연금 기여금·건강보험료가 없어 봉급이 그대로 실수령액입니다."
    : "설·추석 달과 1월·7월에는 아래 명절휴가비·정근수당이 더해지고, 그 달 소득세는 따로 원천징수됩니다.";

  return (
    <div className="space-y-5 mb-10">
      {/* (1) 입력 카드 — 모든 직종에서 같은 행·칸 수 (광고 위 고정 높이) */}
      <div
        {...measurement.inputProps}
        data-civ-block="input"
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-4 sm:p-6"
      >
        <div data-civ-row="kind">
          <span className={LABEL}>직종</span>
          <div className="mt-1 grid h-11 grid-cols-5 gap-1 sm:gap-2" role="group" aria-label="직종">
            {CIVIL_KINDS.map((k) => (
              <Toggle key={k.kind} id={`civ-kind-${k.kind}`} pressed={kind === k.kind} onClick={() => chooseKind(k.kind)}>
                {k.label}
              </Toggle>
            ))}
          </div>
        </div>

        <div data-civ-row="grade" className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <Slot label="계급" htmlFor="civ-rank">
            <select id="civ-rank" className={CONTROL} value={input.rank} disabled={ranks.length === 1} onChange={(e) => chooseRank(Number(e.target.value))}>
              {ranks.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </Slot>
          <Slot label="호봉" htmlFor="civ-hobong">
            <select id="civ-hobong" className={CONTROL} value={soldier ? "-" : input.hobong} disabled={soldier} onChange={(e) => update({ hobong: Number(e.target.value) })}>
              {soldier ? (
                <option value="-">–</option>
              ) : (
                hobongs.map((h) => (
                  <option key={h} value={h}>
                    {h}호봉
                  </option>
                ))
              )}
            </select>
          </Slot>
          <Slot label="재직 연수" htmlFor="civ-years">
            <select id="civ-years" className={CONTROL} value={input.yearsOfService} disabled={soldier} onChange={(e) => update({ yearsOfService: Number(e.target.value) })}>
              {CIVIL_YEARS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Slot>
        </div>

        <div data-civ-row="family" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Slot label="배우자">
            <Toggle id="civ-spouse" pressed={input.spouse && !soldier} disabled={soldier} onClick={() => update({ spouse: !input.spouse })}>
              {input.spouse ? "배우자 있음" : "배우자 없음"}
            </Toggle>
          </Slot>
          <Slot label="자녀 수" htmlFor="civ-children">
            <select
              id="civ-children"
              className={CONTROL}
              value={input.children}
              disabled={soldier}
              onChange={(e) => {
                const children = Number(e.target.value);
                update({ children, children8to20: Math.min(input.children8to20, children) });
              }}
            >
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </Slot>
          <Slot label="그중 8~20세 자녀" htmlFor="civ-children-8-20">
            <select
              id="civ-children-8-20"
              className={CONTROL}
              value={input.children8to20}
              disabled={soldier}
              onChange={(e) => update({ children8to20: Math.min(Number(e.target.value), input.children) })}
            >
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n} disabled={n > input.children}>
                  {n}명
                </option>
              ))}
            </select>
          </Slot>
          <Slot label="기타 부양가족" htmlFor="civ-others">
            <select id="civ-others" className={CONTROL} value={input.otherDependents} disabled={soldier} onChange={(e) => update({ otherDependents: Number(e.target.value) })}>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </Slot>
        </div>

        <div data-civ-row="options" className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {optionSlots}
        </div>
      </div>

      {/* (2) 결과 카드 — 항상 8행, 0원도 표시 (광고 위 고정 높이) */}
      <div
        ref={measurement.resultRef}
        data-civ-block="result"
        className="rounded-2xl overflow-hidden border border-canvas-200 dark:border-canvas-800"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="px-5 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="h-5 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold leading-5" style={{ color: "rgba(255,255,255,0.75)" }} data-civ-result-row="">
            {caption}
          </p>
          <div className="mt-1 h-12 overflow-hidden whitespace-nowrap text-3xl font-black leading-[48px] tracking-tight text-white tabular-nums sm:text-5xl" style={{ letterSpacing: "-0.03em" }}>
            {won(r.net)}
          </div>
        </div>
        <dl className="bg-white dark:bg-canvas-900 px-5 sm:px-8 py-3">
          <ResultRow label="세전 월 지급액" value={won(r.grossMonthly)} strong />
          <ResultRow label="공제 합계" value={`−${won(r.deductions)}`} strong />
          <ResultRow label="봉급" value={won(r.pay)} />
          <ResultRow label="수당 합계 (정액급식비 포함)" value={won(r.allowanceTotal)} />
          <ResultRow label="공무원연금 기여금" value={won(r.contribution)} />
          <ResultRow label="건강·장기요양보험" value={won(r.health + r.longTermCare)} />
          <ResultRow label="소득세·지방소득세" value={won(r.incomeTax + r.localIncomeTax)} />
        </dl>
      </div>

      {/* (3) 결과 직하 광고 */}
      <CalcResultAd />

      {/* ── 이하 광고 아래 — 높이가 바뀌어도 되는 영역 ── */}
      <section className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">수당 상세 (일반 달, 월)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-canvas-200 dark:border-canvas-700 text-left text-xs text-faint-blue">
                <th className="py-2 pr-2 font-bold">항목</th>
                <th className="py-2 pr-2 text-right font-bold">금액</th>
                <th className="py-2 pr-2 font-bold">과세 여부</th>
                <th className="py-2 font-bold">근거 조문</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((item) => (
                <tr key={item.key} className="border-b border-canvas-100 dark:border-canvas-800">
                  <td className="py-2 pr-2 font-bold text-navy dark:text-canvas-50">{item.label}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-navy dark:text-canvas-100">{won(item.amount)}</td>
                  <td className={`py-2 pr-2 ${item.tax === "비과세" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-blue dark:text-canvas-300"}`}>{item.tax}</td>
                  <td className="py-2 text-xs text-muted-blue dark:text-canvas-300">{item.basis}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-2 font-black text-navy dark:text-canvas-50">세전 월 지급액</td>
                <td className="py-2 pr-2 text-right font-black tabular-nums text-electric">{won(r.grossMonthly)}</td>
                <td className="py-2 pr-2 text-xs text-muted-blue dark:text-canvas-300" colSpan={2}>
                  과세 월급여 {won(r.monthlyTaxablePay)} · 비과세 {won(r.nonTaxable)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {!soldier && (
          <dl className="mt-4 grid gap-1 text-xs text-muted-blue dark:text-canvas-300 sm:grid-cols-2">
            <div>
              <dt className="inline font-bold">기준소득월액{r.baseIncomeEstimated ? " (추정)" : " (직접 입력)"}: </dt>
              <dd className="inline tabular-nums">{won(r.baseIncome)}</dd>
            </div>
            <div>
              <dt className="inline font-bold">기여금: </dt>
              <dd className="inline tabular-nums">
                min(기준소득월액, {won(CIVIL_PENSION_2026.cap)}) × 9% = {won(r.contribution)}
              </dd>
            </div>
            <div>
              <dt className="inline font-bold">건강보험 / 장기요양: </dt>
              <dd className="inline tabular-nums">
                {won(r.health)} / {won(r.longTermCare)}
              </dd>
            </div>
            <div>
              <dt className="inline font-bold">소득세 / 지방소득세: </dt>
              <dd className="inline tabular-nums">
                {won(r.incomeTax)} / {won(r.localIncomeTax)} (원천징수 {effective.withholdingPct}%)
              </dd>
            </div>
            {r.overtime > 0 && (
              <div className="sm:col-span-2">
                <dt className="inline font-bold">시간외근무수당: </dt>
                <dd className="inline tabular-nums">
                  1시간 {won(r.overtimeHourly)} (기준 {r.overtimeBaseHobong}호봉) × {input.overtimeHours}시간 = {won(r.overtime)}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">연간 요약 (세전)</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-blue dark:text-canvas-300">월 지급액 × 12개월</dt>
            <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(r.annual.monthly12)}</dd>
          </div>
          {!soldier && (
            <>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-blue dark:text-canvas-300">명절휴가비 (설·추석, 봉급의 60% × 2회)</dt>
                <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(r.annual.holidayBonusTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-blue dark:text-canvas-300">
                  정근수당 (1월·7월, 봉급의 {r.jeonggeunPct}% × 2회)
                </dt>
                <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(r.annual.jeonggeunTotal)}</dd>
              </div>
              {r.annual.performanceBonus > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-blue dark:text-canvas-300">성과상여금 (입력값)</dt>
                  <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(r.annual.performanceBonus)}</dd>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between gap-3 border-t border-canvas-200 dark:border-canvas-700 pt-2">
            <dt className="font-black text-navy dark:text-canvas-50">연간 세전 합계</dt>
            <dd className="font-black tabular-nums text-electric">{won(r.annual.annualGrossWithBonus)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">{annualNote}</p>
      </section>

      {p27 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50">2027 정부안 미리보기 (확정 아님)</h2>
          <p className="mt-1 text-xs font-bold text-amber-800 dark:text-amber-300">
            정부안 {RAISE_LABEL} · 저연차 추가인상 미반영 · 12월 말 국무회의 확정 전
          </p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-blue dark:text-canvas-300">2027 예상 봉급 ({RAISE_LABEL} 단순 적용)</dt>
              <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(p27.pay)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-blue dark:text-canvas-300">예상 세전 월 지급액</dt>
              <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">{won(p27.grossMonthly)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-blue dark:text-canvas-300">예상 월 실수령액</dt>
              <dd className="font-black tabular-nums text-electric">{won(p27.net)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-blue dark:text-canvas-300">2026 대비</dt>
              <dd className="font-bold tabular-nums text-navy dark:text-canvas-50">
                {p27.net - r.net >= 0 ? "+" : "−"}
                {won(Math.abs(p27.net - r.net))}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">
            봉급(과 시간외 기준호봉 봉급)에만 인상률을 적용한 시나리오입니다. 수당·간이세액표·기여금 상한은 2026년 값 그대로,
            건강보험 요율은 2027년 동결 결정을 반영했습니다. 확정 봉급표는{" "}
            <Link href="/civil-servant-pay-2027" className="font-bold text-electric hover:underline">
              2027 공무원 봉급표
            </Link>
            에서 12월 말 갱신합니다.
          </p>
        </section>
      )}

      <details {...measurement.inputProps} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 sm:p-6 group">
        <summary className="cursor-pointer font-black text-navy dark:text-canvas-50">고급 설정 — 기준소득월액·기타 수당·원천징수 비율·성과상여금</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="civ-base" className="text-xs font-bold text-faint-blue">
              기준소득월액 직접 입력 (공단 통보액, 비우면 추정)
            </label>
            <NumberInput
              id="civ-base"
              type="text"
              inputMode="numeric"
              value={baseDraft}
              onChange={(e) => setBaseDraft(e.target.value)}
              placeholder={fmt(computeCivilNetPay({ ...effective, baseIncomeOverride: null }).baseIncome)}
              className="mt-1 h-11 w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-3 text-base font-bold text-navy dark:text-canvas-50"
            />
          </div>
          <div>
            <label htmlFor="civ-withholding" className="text-xs font-bold text-faint-blue">
              원천징수 비율 (근로자 선택)
            </label>
            <select
              id="civ-withholding"
              className="mt-1 h-11 w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-3 text-base font-bold text-navy dark:text-canvas-50"
              value={input.withholdingPct}
              onChange={(e) => update({ withholdingPct: Number(e.target.value) as WithholdingPct })}
            >
              <option value={80}>80%</option>
              <option value={100}>100% (기본)</option>
              <option value={120}>120%</option>
            </select>
          </div>
          <div>
            <label htmlFor="civ-other-tax" className="text-xs font-bold text-faint-blue">
              기타 과세 수당 (월, 원)
            </label>
            <NumberInput
              id="civ-other-tax"
              type="text"
              inputMode="numeric"
              value={otherTaxDraft}
              onChange={(e) => setOtherTaxDraft(e.target.value)}
              placeholder="0"
              className="mt-1 h-11 w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-3 text-base font-bold text-navy dark:text-canvas-50"
            />
          </div>
          <div>
            <label htmlFor="civ-other-nontax" className="text-xs font-bold text-faint-blue">
              기타 비과세 수당 (월, 원)
            </label>
            <NumberInput
              id="civ-other-nontax"
              type="text"
              inputMode="numeric"
              value={otherNonTaxDraft}
              onChange={(e) => setOtherNonTaxDraft(e.target.value)}
              placeholder="0"
              className="mt-1 h-11 w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-3 text-base font-bold text-navy dark:text-canvas-50"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="civ-bonus" className="text-xs font-bold text-faint-blue">
              성과상여금 연액 (원, 연간 요약에만 더함)
            </label>
            <NumberInput
              id="civ-bonus"
              type="text"
              inputMode="numeric"
              value={bonusDraft}
              onChange={(e) => setBonusDraft(e.target.value)}
              placeholder="0"
              className="mt-1 h-11 w-full rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 px-3 text-base font-bold text-navy dark:text-canvas-50"
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">
          금액 입력은 월 1억원까지 반영합니다. 기준소득월액을 입력하면 공무원연금 기여금과 건강보험료 계산에 그 값을 씁니다.
        </p>
      </details>

      <section className="rounded-2xl bg-canvas-50 dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 sm:p-6">
        <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">산식·출처</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-blue dark:text-canvas-300">
          <li>봉급: 인사혁신처 2026년 공무원 봉급표(공무원보수규정 별표 3·10·11), 병 봉급 별표 13.</li>
          <li>
            수당: 공무원수당 등에 관한 규정(대통령령 제36015호, 2026-01-02) — 정액급식비 월 16만원(제18조), 직급보조비(별표 15),
            가족수당(제10조·별표 5, 부양가족 4명 이내·자녀는 예외), 정근수당·가산금(별표 2), 명절휴가비 60%(제18조의3), 교직수당(별표 11),
            위험근무수당(별표 8·9), 시간외근무수당 = 기준호봉 봉급 × 55%(8급 이하 60%) ÷ 209 × 150%(제15조·별표 12). 일반직 기본 10시간은
            월 15일 이상 출근 시 지급되는 정액분(인사혁신처 공무원보수 등의 업무지침).
          </li>
          <li>
            공무원연금 기여금: 기준소득월액 × 9%, 상한 {won(CIVIL_PENSION_2026.cap)} = 공무원 전체 평균 {won(CIVIL_PENSION_2026.avgBaseIncome)}(인사혁신처 고시
            2026-04-30) × 160%, 36년 초과 납부 시 면제(공무원연금법 제67조). 기준소득월액 추정 = (연간 세전 − 비과세) ÷ 12 — 실제 값은 전년도 과세소득
            기준으로 매년 5월 정해집니다.
          </li>
          <li>
            건강보험·장기요양: 기준소득월액(추정)을 보수월액으로 보고 직장가입자 요율(건강보험 {RATE_TEXT(INSURANCE_RATES_2026.HEALTH_INSURANCE)}, 장기요양 = 건강보험료의{" "}
            {RATE_TEXT(INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO)}) 적용. 공무원은 고용보험 적용 제외.
          </li>
          <li>
            소득세: 근로소득 간이세액표(소득세법 시행령 별표 2) — 공제대상가족 = 본인 + 배우자 + 자녀 + 기타 부양가족(소득요건 충족 가정), 8~20세 자녀 공제
            반영. 지방소득세 = 소득세의 10%. 정액급식비는 식사대 비과세(소득세법 제12조제3호러목, 월 20만원 이하).
          </li>
          <li>일반 달 기준 추정치입니다. 실제 급여명세서와는 기준소득월액·건강보험 정산·기타 수당에 따라 차이가 날 수 있습니다.</li>
        </ul>
      </section>

      <nav aria-label="공무원 봉급표" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
        <Link href="/civil-servant-pay-2026" className="text-electric hover:underline">
          2026 공무원 봉급표
        </Link>
        <Link href="/civil-servant-pay-2027" className="text-electric hover:underline">
          2027 봉급표 전망
        </Link>
        <Link href="/teacher-pay-2026" className="text-electric hover:underline">
          교사 호봉표
        </Link>
        <Link href="/police-pay-2026" className="text-electric hover:underline">
          경찰 봉급표
        </Link>
        <Link href="/firefighter-pay-2026" className="text-electric hover:underline">
          소방관 봉급표
        </Link>
        <Link href="/military-pay-2026" className="text-electric hover:underline">
          군인 월급
        </Link>
      </nav>
    </div>
  );
}
