"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Lightbulb,
  User,
  Lock,
  Check,
  Settings,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  FIXED_RERATE,
  FIXED_BU_RATIO,
  FIXED_SA_RATIO,
  FIXED_OPI1_RATE,
  REFERENCE_SALARY,
  getThreshold,
  getThresholdPeriod,
  calcBonusNet,
  DIVISIONS,
  fmtManwon,
  fmtManwonInt,
  fmtEok,
  fmtTrillion,
  fmtEokInt,
  formatNumberInput,
  parseNumberInput,
  useCountUp,
} from "./shared";

// 하단 시뮬레이터 2종 — 별도 청크로 지연 로드 (First Load 경량화, 클라이언트 전용)
const MultiYearRSUSimulator = dynamic(() => import("./MultiYearRSUSimulator"), {
  ssr: false,
  loading: () => <SimulatorLoading label="다년도 RSU 매도 시뮬레이터" />,
});
const MultiYearBonusSimulator = dynamic(
  () => import("./MultiYearBonusSimulator"),
  {
    ssr: false,
    loading: () => <SimulatorLoading label="다년도 누적 성과급 시뮬레이터" />,
  }
);

function SimulatorLoading({ label }: { label: string }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 text-center text-xs text-faint-blue">
      {label} 불러오는 중…
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// 메인
// ────────────────────────────────────────────────────────────

export default function SamsungBonusClient() {
  const [year, setYear] = useState(2026); // 적용 연도
  const [profitFmt, setProfitFmt] = useState("350"); // 조원 — 자유 입력
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(
      DIVISIONS.map((d) => [d.id, d.defaultCount.toLocaleString("ko-KR")])
    )
  );
  const [ratios, setRatios] = useState<Record<string, string>>(
    Object.fromEntries(DIVISIONS.map((d) => [d.id, String(d.defaultRatio)]))
  );

  // 본인 케이스 state — MySalaryCalculator + MultiYearBonusSimulator 공유
  const [salaryFmt, setSalaryFmt] = useState("80,000,000");
  const [selectedDivId, setSelectedDivId] = useState<string>("memory");
  const [creditRate, setCreditRate] = useState<number>(20);
  const [applyInsurance, setApplyInsurance] = useState<boolean>(true);

  const profit = Math.max(0, Number(profitFmt) || 0);
  const threshold = getThreshold(year);
  // 임계값 정보 없는 연도(범위 외)는 체크 없이 영업이익 그대로 적용
  const thresholdMet = threshold > 0 ? profit >= threshold : true;
  const triggered = thresholdMet;

  const result = useMemo(() => {
    // 임계값 미달이면 성과급 풀 = 0
    const effectiveProfit = triggered ? profit : 0;
    const totalFundManwon = effectiveProfit * 1e8 * (FIXED_RERATE / 100);
    const buFund = totalFundManwon * (FIXED_BU_RATIO / 10);
    const saFund = totalFundManwon * (FIXED_SA_RATIO / 10);

    const countNums = Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, parseNumberInput(v)])
    );
    const ratioNums = Object.fromEntries(
      Object.entries(ratios).map(([k, v]) => [k, Number(v) || 0])
    );

    const totalCount = DIVISIONS.reduce(
      (acc, d) => acc + (countNums[d.id] || 0),
      0
    );
    const buPer = totalCount > 0 ? buFund / totalCount : 0;

    const wTotal = DIVISIONS.reduce(
      (acc, d) => acc + (countNums[d.id] || 0) * (ratioNums[d.id] || 0),
      0
    );
    const saUnit = wTotal > 0 ? saFund / wTotal : 0;
    const ratioSum = DIVISIONS.reduce(
      (acc, d) => acc + (ratioNums[d.id] || 0),
      0
    );

    const perDivision = DIVISIONS.map((d) => {
      const r = ratioNums[d.id] || 0;
      const saPart = saUnit * r;
      const total = buPer + saPart;
      return { ...d, buPart: buPer, saPart, total };
    });

    const max = Math.max(...perDivision.map((r) => r.total), 1);

    return {
      totalFundManwon,
      totalFundTrillion: fmtTrillion(totalFundManwon),
      totalFundEok: fmtEokInt(totalFundManwon),
      perDivision,
      max,
      ratioSum,
    };
  }, [profit, counts, ratios, triggered]);

  return (
    <div className="space-y-4 mb-10">
      {/* 영업이익 + 고정 정책 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 transition-shadow hover:shadow-md"
        aria-labelledby="profit-section-title"
      >
        <p
          id="profit-section-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-5"
        >
          주요 변수
        </p>

        {/* 적용 연도 선택 — 임계값 자동 결정 */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <label
              htmlFor="year-input"
              className="text-xs font-bold uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5"
            >
              <Calendar size={11} aria-hidden /> 적용 연도
            </label>
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: "#7C83FF" }}
            >
              {year}년
            </span>
          </div>
          <input
            id="year-input"
            type="range"
            min={2026}
            max={2035}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all"
            style={{
              background: `linear-gradient(to right, #7C83FF 0%, #7C83FF ${
                ((year - 2026) / (2035 - 2026)) * 100
              }%, #DDE4EC ${
                ((year - 2026) / (2035 - 2026)) * 100
              }%, #DDE4EC 100%)`,
              accentColor: "#7C83FF",
            }}
            aria-label="적용 연도"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[2026, 2027, 2028, 2029, 2030, 2032, 2035].map((y) => {
              const active = year === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:text-white"
                  }`}
                  style={{
                    backgroundColor: active ? "#7C83FF" : undefined,
                  }}
                >
                  {y}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-faint-blue mt-2 leading-relaxed">
            회의록 임계값: <strong className="text-navy dark:text-canvas-50">{getThresholdPeriod(year)}</strong>{" "}
            — 영업이익이 이 기준에 미달하면 성과급 풀 미활성.
          </p>
        </div>

        {/* 영업이익 자유 입력 — 콤마 포맷 통일 */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <label
              htmlFor="profit-input"
              className="text-xs font-bold uppercase tracking-widest text-faint-blue"
            >
              회사 연간 영업이익
            </label>
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color: triggered ? "#0145F2" : "#EF4444" }}
              aria-live="polite"
            >
              {profit.toLocaleString("ko-KR")}
              <span className="text-base ml-0.5">조원</span>
            </span>
          </div>
          <div className="relative">
            <input
              id="profit-input"
              type="text"
              inputMode="decimal"
              value={profitFmt}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setProfitFmt(v);
              }}
              className="w-full rounded-xl px-4 py-3 text-2xl font-black tabular-nums focus:outline-none transition-all pr-14 text-electric"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="350"
              aria-label="회사 연간 영업이익 (조원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              조원
            </span>
          </div>
          {/* 임계값 게이지 — 영업이익 vs 임계값 시각화 */}
          {threshold > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-faint-blue">
                  임계값 기준 ({threshold}조)
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-black ${
                    triggered ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {triggered ? (
                    <>
                      <CheckCircle2 size={12} aria-hidden />
                      충족 (+{Math.round(((profit - threshold) / threshold) * 100)}%)
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} aria-hidden />
                      미달 ({Math.round(((threshold - profit) / threshold) * 100)}% 부족)
                    </>
                  )}
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
                {/* 영업이익 막대 */}
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (profit / (threshold * 1.5)) * 100)}%`,
                    backgroundColor: triggered ? "#10B981" : "#EF4444",
                  }}
                />
                {/* 임계값 마커 */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${(threshold / (threshold * 1.5)) * 100}%`,
                    backgroundColor: "#0A1829",
                  }}
                  aria-hidden
                />
                <span
                  className="absolute -top-0.5 text-[9px] font-black"
                  style={{
                    left: `${(threshold / (threshold * 1.5)) * 100}%`,
                    transform: "translateX(-50%) translateY(-100%)",
                    color: "#0A1829",
                  }}
                  aria-hidden
                >
                  ▼ {threshold}조
                </span>
              </div>
              {!triggered && (
                <div className="mt-2 rounded-lg p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="text-rose-500 flex-shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    <strong>{year}년 임계값 {threshold}조 미달</strong> — 회의록상
                    이 연도는 영업이익 {threshold}조 이상일 때만 성과급 풀이
                    활성화됩니다. 현재 영업이익으로는 사업부별 1인당 성과급이
                    0원으로 산정됩니다.
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            className="flex flex-wrap gap-1.5 mt-2"
            role="group"
            aria-label="영업이익 빠른선택"
          >
            {[30, 50, 100, 200, 350, 500, 1000].map((v) => {
              const active = profitFmt === String(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setProfitFmt(String(v))}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  {v}조
                </button>
              );
            })}
          </div>
        </div>

        {/* 고정 정책 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FixedPolicyCard
            label="성과급 재원 비율"
            value="10.5%"
            note="영업이익의 10.5% — 공개 노사 합의 보도 기반 고정"
            color="#7C83FF"
          />
          <FixedPolicyCard
            label="부문 : 사업부"
            value="4 : 6"
            note="부문 균등 40% · 사업부 가중 60%"
            color="#F59E0B"
          />
        </div>

        {/* 총 재원 */}
        <div
          className="mt-5 rounded-xl px-4 py-3 flex justify-between items-center"
          style={{
            background:
              "linear-gradient(90deg, #0145F210 0%, #7C83FF10 100%)",
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-faint-blue">
            총 재원
          </span>
          <span
            className="text-navy dark:text-canvas-50 font-black tabular-nums"
            aria-live="polite"
          >
            {result.totalFundTrillion}조{" "}
            <span className="text-faint-blue font-bold text-sm">
              ({result.totalFundEok}억원)
            </span>
          </span>
        </div>
      </section>

      {/* 사업부 설정 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
        aria-labelledby="division-section-title"
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p
            id="division-section-title"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue"
          >
            사업부 설정
          </p>
          <p className="text-[11px] text-faint-blue">
            가중치 합계{" "}
            <span className="text-navy dark:text-canvas-50 font-black tabular-nums">
              {result.ratioSum.toFixed(1)}
            </span>{" "}
            (상대값 — 1.0이 표준)
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DIVISIONS.map((d) => (
            <div key={d.id}>
              <p
                className="text-sm font-black mb-3 inline-flex items-center gap-1.5"
                style={{ color: d.color }}
              >
                <span
                  className="w-3 h-3 rounded-full inline-flex items-center justify-center text-[8px] font-black text-white"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                >
                  {d.shortLabel}
                </span>
                {d.label}
              </p>
              <div className="space-y-3">
                <LabeledCommaInput
                  label="인원"
                  unit="명"
                  value={counts[d.id]}
                  onChange={(v) =>
                    setCounts((prev) => ({ ...prev, [d.id]: v }))
                  }
                  color={d.color}
                />
                <LabeledDecimalInput
                  label="사업부 가중치"
                  unit="× 표준"
                  value={ratios[d.id]}
                  onChange={(v) =>
                    setRatios((prev) => ({ ...prev, [d.id]: v }))
                  }
                  color={d.color}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[11px] text-faint-blue leading-relaxed">
            가중치는 절대 합이 1일 필요 없는 <strong>상대값</strong>입니다.
            1.0이 표준, 0.7이 70% 가중, 0.0이면 사업부 분배 제외. 사업부 풀(60%)을
            Σ(인원×가중치)로 정규화해 분배합니다.
          </p>
          <div
            className="rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              backgroundColor: "#F59E0B0F",
              border: "1px solid #F59E0B33",
            }}
          >
            <p className="font-black text-amber-700 dark:text-amber-400 mb-1">
              디폴트 가중치 — 보도값 매칭 보정
            </p>
            <ul className="text-muted-blue dark:text-canvas-400 space-y-0.5 list-disc pl-4">
              <li>
                메모리 <strong>1.0</strong> · 공통 <strong>0.55</strong> ·
                파운드리·LSI <strong>0.05</strong> → 350조 입력 시 약
                858/579/269% (보도값 791/553/252%에 근접)
              </li>
              <li>
                회의록 원본은 <strong>1.0 / 0.7 / 0.0</strong> — 위 값으로 직접
                입력 가능 (단 보도값과 16% 차이 발생)
              </li>
              <li>
                <strong>2026년</strong>: 적자 사업부(파운드리·LSI) 가중치 0
                근처. <strong>2027년~</strong>: 사업부 성과에 따라 가변.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 1인당 평균 결과 */}
      <section
        className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
        aria-labelledby="avg-result-title"
      >
        <p
          id="avg-result-title"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1"
        >
          1인당 성과급 결과 (세전 · 평균 직원 기준)
        </p>
        <p className="text-[11px] text-faint-blue mb-5">
          이 값은 사업부 평균이며, 본인 케이스는 아래 "내 연봉으로 계산"에서
          확인.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.perDivision.map((r) => (
            <ResultCard
              key={r.id}
              label={r.label}
              color={r.color}
              bgTint={r.bgTint}
              shortLabel={r.shortLabel}
              buPart={r.buPart}
              saPart={r.saPart}
              total={r.total}
              max={result.max}
            />
          ))}
        </div>
      </section>

      {/* 내 연봉으로 계산 */}
      <MySalaryCalculator
        perDivision={result.perDivision}
        salaryFmt={salaryFmt}
        setSalaryFmt={setSalaryFmt}
        selectedDivId={selectedDivId}
        setSelectedDivId={setSelectedDivId}
        creditRate={creditRate}
        setCreditRate={setCreditRate}
        applyInsurance={applyInsurance}
        setApplyInsurance={setApplyInsurance}
      />

      {/* SK하이닉스 비교 */}
      <aside
        className="rounded-2xl p-5"
        style={{
          background: "#10B98108",
          border: "1px solid #10B98133",
        }}
        aria-label="SK하이닉스 비교 참고 박스"
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: "#10B981" }}
        >
          참고 · 비교
        </p>
        <div className="flex items-start gap-3">
          <Lightbulb
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "#10B981" }}
            aria-hidden
          />
          <div className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
            <p className="font-black text-emerald-700 dark:text-emerald-400 mb-1">
              SK하이닉스 성과급 예상치 (2024 실적 기준)
            </p>
            <p>
              영업이익{" "}
              <strong className="text-navy dark:text-canvas-50">23.4조</strong> ·
              재원비율{" "}
              <strong className="text-navy dark:text-canvas-50">10%</strong> ·
              직원{" "}
              <strong className="text-navy dark:text-canvas-50">35,000명</strong>{" "}
              기준
            </p>
            <p className="mt-1">
              → 인당 평균{" "}
              <strong
                className="text-lg font-black"
                style={{ color: "#10B981" }}
              >
                ≈ 약 6,700만원
              </strong>
              <span className="text-xs text-faint-blue ml-2">
                (전사 균등 분배 가정)
              </span>
            </p>
            <p className="mt-2">
              <Link
                href="/calc/sk-hynix-bonus"
                className="text-xs font-bold underline"
                style={{ color: "#10B981" }}
              >
                SK하이닉스 PS·PI 성과급 계산기에서 정밀 계산 →
              </Link>
            </p>
          </div>
        </div>
      </aside>

      {/* 다년도 누적 성과급 시뮬레이터 — 연도별 영업이익 + 임계값 자동 */}
      <MultiYearBonusSimulator
        counts={counts}
        ratios={ratios}
        salary={parseNumberInput(salaryFmt)}
        creditRate={creditRate}
        applyInsurance={applyInsurance}
        defaultDivId={selectedDivId}
      />

      {/* 다년도 RSU 매도 시뮬레이터 — 상단 메모리 1인당 평균과 연동 */}
      <MultiYearRSUSimulator
        memoryPerPerson={
          result.perDivision.find((d) => d.id === "memory")?.total ?? 0
        }
      />

      <p className="text-center text-[11px] text-faint-blue">
        * 만원 단위 반올림 · 공개 노사 합의 보도 기반 추정 시뮬레이터
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 내 연봉으로 계산 — 세금 가정 사용자 조정 가능
// ────────────────────────────────────────────────────────────

function MySalaryCalculator({
  perDivision,
  salaryFmt,
  setSalaryFmt,
  selectedDivId,
  setSelectedDivId,
  creditRate,
  setCreditRate,
  applyInsurance,
  setApplyInsurance,
}: {
  perDivision: Array<{
    id: string;
    label: string;
    color: string;
    bgTint: string;
    shortLabel: string;
    buPart: number;
    saPart: number;
    total: number;
  }>;
  salaryFmt: string;
  setSalaryFmt: (v: string) => void;
  selectedDivId: string;
  setSelectedDivId: (v: string) => void;
  creditRate: number;
  setCreditRate: (v: number) => void;
  applyInsurance: boolean;
  setApplyInsurance: (v: boolean) => void;
}) {
  const salary = parseNumberInput(salaryFmt);
  const selected =
    perDivision.find((d) => d.id === selectedDivId) ?? perDivision[0];

  const personal = useMemo(() => {
    // OPI2 — 특별경영성과금 (영업이익 기반 사업부 분배)
    const ratio = salary / REFERENCE_SALARY;
    const opi2BuManwon = selected.buPart * ratio; // 부문 균등 40% × 본인비례
    const opi2SaManwon = selected.saPart * ratio; // 사업부 가중 60% × 본인비례
    const opi2Manwon = opi2BuManwon + opi2SaManwon;
    const opi2Won = opi2Manwon * 10000;

    // OPI1 — 기본 성과인센티브 (연봉의 50%)
    const opi1Won = salary * (FIXED_OPI1_RATE / 100);
    const opi1Manwon = opi1Won / 10000;

    // 합산 — 세금은 OPI1+OPI2 합산 기준으로 누진세 적용
    const totalGrossWon = opi1Won + opi2Won;
    const totalGrossManwon = opi1Manwon + opi2Manwon;

    const tax = calcBonusNet(
      salary,
      totalGrossWon,
      creditRate,
      applyInsurance
    );
    const grossPct = salary > 0 ? (totalGrossWon / salary) * 100 : 0;
    const netPct = salary > 0 ? (tax.net / salary) * 100 : 0;
    return {
      opi1Won,
      opi1Manwon,
      opi2Won,
      opi2Manwon,
      opi2BuManwon,
      opi2SaManwon,
      totalGrossWon,
      totalGrossManwon,
      netWon: tax.net,
      netManwon: tax.net / 10000,
      deductWon: tax.deduct,
      effRate: tax.effRate,
      breakdown: tax.breakdown,
      grossPct,
      netPct,
      grossMultiplier: salary > 0 ? totalGrossWon / salary : 0,
      opi2Multiplier: salary > 0 ? opi2Won / salary : 0,
    };
  }, [salary, selected, creditRate, applyInsurance]);

  const animOpi1 = useCountUp(personal.opi1Manwon);
  const animOpi2 = useCountUp(personal.opi2Manwon);
  const animGross = useCountUp(personal.totalGrossManwon);
  const animNet = useCountUp(personal.netManwon);

  return (
    <section
      className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6"
      aria-labelledby="my-calc-title"
    >
      <p
        id="my-calc-title"
        className="text-[10px] font-black uppercase tracking-[0.2em] text-faint-blue mb-1 inline-flex items-center gap-1.5"
      >
        <User size={11} className="text-electric" aria-hidden /> 내 연봉으로
        계산 — 세전·세후
      </p>
      <p className="text-[11px] text-faint-blue mb-5 leading-relaxed">
        평균 결과는 평균 직원 연봉 8,000만원 기준입니다. 본인 연봉에 비례해
        받는 성과급과 세금 공제 후 실수령액을 계산합니다.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="my-salary"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            내 연봉 (세전)
          </label>
          <div className="relative">
            <input
              id="my-salary"
              type="text"
              inputMode="numeric"
              value={salaryFmt}
              onChange={(e) =>
                setSalaryFmt(formatNumberInput(e.target.value))
              }
              className="w-full rounded-xl px-4 py-3 text-2xl font-black focus:outline-none transition pr-12 text-electric tabular-nums"
              style={{
                backgroundColor: "#0145F208",
                border: "2px solid #0145F2",
              }}
              placeholder="80,000,000"
              aria-label="내 연봉 입력 (원)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-electric">
              원
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5 mt-2"
            role="group"
            aria-label="연봉 빠른선택"
          >
            {[
              50_000_000,
              80_000_000,
              100_000_000,
              140_000_000,
              200_000_000,
            ].map((v) => {
              const active = parseNumberInput(salaryFmt) === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSalaryFmt(v.toLocaleString("ko-KR"))}
                  aria-pressed={active}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    active
                      ? "bg-electric text-white"
                      : "bg-canvas-50 dark:bg-canvas-800 text-muted-blue hover:bg-electric hover:text-white"
                  }`}
                >
                  {(v / 10000).toLocaleString("ko-KR")}만
                </button>
              );
            })}
          </div>
        </div>

        {/* 사업부 선택 — 탭 ARIA */}
        <div>
          <label
            id="div-tabs-label"
            className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue"
          >
            내 사업부 선택
          </label>
          <div
            className="grid grid-cols-3 gap-2"
            role="tablist"
            aria-labelledby="div-tabs-label"
          >
            {perDivision.map((d) => {
              const active = selectedDivId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedDivId(d.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                    active
                      ? "text-white scale-[1.02] shadow-md"
                      : "bg-white dark:bg-canvas-900 hover:scale-[1.01]"
                  }`}
                  style={{
                    backgroundColor: active ? d.color : undefined,
                    borderColor: active ? d.color : `${d.color}55`,
                    color: active ? "#fff" : d.color,
                  }}
                >
                  {active && <Check size={12} aria-hidden />}
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 세금 가정 조정 */}
        <details className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4 group">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5 list-none">
            <Settings size={12} className="text-electric" aria-hidden /> 세금
            계산 가정 조정
            <span className="ml-auto text-electric group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-faint-blue">
                  세액공제율 (가정)
                </span>
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: "#0145F2" }}
                >
                  {creditRate}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={creditRate}
                onChange={(e) => setCreditRate(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0145F2 0%, #0145F2 ${
                    (creditRate / 50) * 100
                  }%, #DDE4EC ${(creditRate / 50) * 100}%, #DDE4EC 100%)`,
                  accentColor: "#0145F2",
                }}
                aria-label="세액공제율 가정"
              />
              <p className="text-[10px] text-faint-blue mt-1 leading-relaxed">
                자녀·연금·의료비·기부 등 세액공제로 소득세가 줄어드는 비율.
                디폴트 20% (평균 직장인). IRP·기부 적극 활용 시 30%+, 단순
                기본공제만이면 10% 내외.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyInsurance}
                onChange={(e) => setApplyInsurance(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-electric flex-shrink-0"
                aria-describedby="insurance-help"
              />
              <span className="text-xs">
                <span className="font-bold text-navy dark:text-canvas-50">
                  4대보험 추가 부과 적용
                </span>
                <span
                  id="insurance-help"
                  className="block text-faint-blue mt-1 leading-relaxed"
                >
                  성과급은 보수에 합산되어 4대보험 정산 시 추가 부과됩니다.
                  단 국민연금은 보수월액 상한(연 7,644만원)이 있어 고소득자는
                  추가 부과액이 적습니다. 체크하지 않으면 4대보험은
                  포함하지 않고 소득세·지방세만 공제합니다.
                </span>
              </span>
            </label>
          </div>
        </details>

        {/* 결과 카드 — 정돈된 위계 (세후 강조 → 세전 → OPI 분해 → 산식) */}
        <div
          className="rounded-2xl overflow-hidden border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900"
          aria-live="polite"
        >
          {/* 헤더 — 사업부 라벨 (단색 액센트 바) */}
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ backgroundColor: selected.color }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                aria-hidden
              >
                {selected.shortLabel}
              </span>
              <p className="text-sm font-black text-white">
                {selected.label} 사업부
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
              본인 케이스
            </span>
          </div>

          {/* 메인 결과 — 세전 합계 / 세후 실수령 */}
          <div className="grid grid-cols-2 divide-x divide-canvas-200 dark:divide-canvas-800 border-b border-canvas-200 dark:border-canvas-800">
            <div className="px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-faint-blue mb-1.5">
                세전 합계
              </p>
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-navy dark:text-canvas-50">
                {fmtManwon(animGross)}
              </p>
              <p className="text-[11px] text-faint-blue mt-1 tabular-nums">
                {fmtEok(personal.totalGrossManwon)} · 연봉의{" "}
                {personal.grossPct.toFixed(0)}%
              </p>
            </div>
            <div
              className="px-5 py-5"
              style={{ backgroundColor: `${selected.color}08` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5"
                style={{ color: selected.color }}
              >
                세후 실수령
              </p>
              <p
                className="text-3xl sm:text-4xl font-black tabular-nums"
                style={{ color: selected.color }}
              >
                {fmtManwon(animNet)}
              </p>
              <p className="text-[11px] text-faint-blue mt-1 tabular-nums">
                {fmtEok(personal.netManwon)} · 공제{" "}
                {personal.effRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* OPI1 + OPI2 위계적 breakdown */}
          <div className="px-5 py-4 space-y-3 bg-canvas-50 dark:bg-canvas-800/50">
            {/* OPI1 한 줄 */}
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1 h-8 rounded-full bg-faint-blue/40" aria-hidden />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-faint-blue">
                    OPI1 · 기본 인센티브
                  </p>
                  <p className="text-[10px] text-faint-blue">
                    연봉 × 50% · 사업부 무관
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black tabular-nums text-navy dark:text-canvas-50">
                  {fmtManwon(animOpi1)}
                </p>
                <p className="text-[10px] text-faint-blue tabular-nums">
                  연봉의 50.0%
                </p>
              </div>
            </div>

            {/* OPI2 + 부문/사업부 breakdown */}
            <div className="rounded-xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: selected.color }}
                    aria-hidden
                  />
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: selected.color }}
                    >
                      OPI2 · 특별경영성과금
                    </p>
                    <p className="text-[10px] text-faint-blue">
                      영업이익 기반 · 부문(40%) + 사업부(60%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black tabular-nums text-navy dark:text-canvas-50">
                    {fmtManwon(animOpi2)}
                  </p>
                  <p className="text-[10px] text-faint-blue tabular-nums">
                    연봉의 {(personal.opi2Multiplier * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-lg px-3 py-2 bg-canvas-50 dark:bg-canvas-800">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-faint-blue mb-0.5">
                    부문 (균등 40%)
                  </p>
                  <p className="text-sm font-black tabular-nums text-navy dark:text-canvas-50">
                    {fmtManwon(personal.opi2BuManwon)}
                  </p>
                </div>
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ backgroundColor: `${selected.color}10` }}
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5"
                    style={{ color: selected.color }}
                  >
                    사업부 (가중 60%)
                  </p>
                  <p
                    className="text-sm font-black tabular-nums"
                    style={{ color: selected.color }}
                  >
                    {fmtManwon(personal.opi2SaManwon)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 산식 푸터 */}
          <div className="px-5 py-3 border-t border-canvas-200 dark:border-canvas-800 bg-canvas-50 dark:bg-canvas-800/30">
            <p className="text-[10px] text-muted-blue dark:text-canvas-400 leading-relaxed tabular-nums">
              <span className="font-bold text-faint-blue">산식 · </span>
              OPI1 {fmtManwonInt(personal.opi1Manwon)} + OPI2 (부문{" "}
              {fmtManwonInt(personal.opi2BuManwon)} + 사업부{" "}
              {fmtManwonInt(personal.opi2SaManwon)}) ={" "}
              <strong className="text-navy dark:text-canvas-50">
                세전 {fmtManwonInt(personal.totalGrossManwon)}만원
              </strong>
            </p>
          </div>
        </div>

        {/* 공제 상세 + 면책 */}
        {personal.totalGrossWon > 0 && (
          <details className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-4 group">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-faint-blue flex items-center justify-between">
              공제 항목 상세
              <span className="text-electric group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <div className="mt-3 space-y-1.5 text-xs">
              <DeductRow
                label={`소득세 (누진세율 · 세액공제 ${creditRate}% 가정)`}
                value={personal.breakdown.incomeTax}
              />
              <DeductRow
                label="지방소득세 (소득세의 10%)"
                value={personal.breakdown.localTax}
              />
              {applyInsurance && (
                <>
                  <DeductRow
                    label="국민연금 (4.75% · 보수월액 상한 적용)"
                    value={personal.breakdown.nationalPension}
                  />
                  <DeductRow
                    label="건강보험 (3.595%)"
                    value={personal.breakdown.healthIns}
                  />
                  <DeductRow
                    label="장기요양 (건강보험의 13.14%)"
                    value={personal.breakdown.longTermCare}
                  />
                  <DeductRow
                    label="고용보험 (0.9%)"
                    value={personal.breakdown.employment}
                  />
                </>
              )}
              <div className="border-t border-canvas-200 dark:border-canvas-700 mt-2 pt-2">
                <DeductRow
                  label="총 공제"
                  value={personal.deductWon}
                  bold
                />
              </div>
              <p className="text-[10px] text-faint-blue mt-3 leading-relaxed">
                ※ 본 계산은 추정치이며 실제 회사 원천징수와 다릅니다. 세액공제율
                {creditRate}% 가정은 사용자 조정 가능.{" "}
                {applyInsurance
                  ? "4대보험은 보수 정산 방식에 따라 회사가 일부 분담하므로 실제 본인 부담은 더 작을 수 있습니다."
                  : "4대보험 추가 부과를 적용하지 않은 상태입니다. 위의 토글을 켜면 부과 결과를 확인할 수 있습니다."}
              </p>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

function DeductRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`${
          bold ? "font-black text-navy dark:text-canvas-50" : "text-muted-blue"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold
            ? "font-black text-rose-500 text-sm"
            : "font-bold text-navy dark:text-canvas-50"
        }`}
      >
        -{Math.round(value).toLocaleString("ko-KR")}원
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 입력 컴포넌트들 (콤마 자동·단위 일관)
// ────────────────────────────────────────────────────────────

function LabeledCommaInput({
  label,
  unit,
  value,
  onChange,
  color,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 text-faint-blue">
        {label} <span className="opacity-70 font-medium">({unit})</span>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatNumberInput(e.target.value))}
          className="w-full rounded-lg px-3 py-2 pr-9 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
          style={{ border: `1.5px solid ${color}33` }}
          onFocus={(e) => (e.currentTarget.style.borderColor = color)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
          aria-label={`${label} (${unit})`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function LabeledDecimalInput({
  label,
  unit,
  value,
  onChange,
  color,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 text-faint-blue">
        {label} <span className="opacity-70 font-medium">({unit})</span>
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            onChange(v);
          }}
          className="w-full rounded-lg px-3 py-2 pr-10 text-sm font-black tabular-nums focus:outline-none transition-all bg-canvas-50 dark:bg-canvas-800 text-navy dark:text-canvas-50"
          style={{ border: `1.5px solid ${color}33` }}
          onFocus={(e) => (e.currentTarget.style.borderColor = color)}
          onBlur={(e) => (e.currentTarget.style.borderColor = `${color}33`)}
          aria-label={`${label} (${unit})`}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-faint-blue pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function FixedPolicyCard({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}33` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-faint-blue inline-flex items-center gap-1.5">
          <Lock size={9} aria-hidden /> {label}
        </span>
      </div>
      <p
        className="text-2xl font-black tabular-nums mb-1"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-blue leading-relaxed">{note}</p>
    </div>
  );
}

function ResultCard({
  label,
  color,
  bgTint,
  shortLabel,
  buPart,
  saPart,
  total,
  max,
}: {
  label: string;
  color: string;
  bgTint: string;
  shortLabel: string;
  buPart: number;
  saPart: number;
  total: number;
  max: number;
}) {
  const animTotal = useCountUp(total);
  const barPct = (total / max) * 100;
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        background: `linear-gradient(135deg, ${bgTint}, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <p
        className="text-sm font-black mb-2 inline-flex items-center gap-1.5"
        style={{ color }}
      >
        <span
          className="w-3 h-3 rounded-full inline-flex items-center justify-center text-[8px] font-black text-white"
          style={{ backgroundColor: color }}
          aria-hidden
        >
          {shortLabel}
        </span>
        {label}
      </p>
      <div className="text-[11px] text-muted-blue leading-relaxed mb-2">
        <div className="flex justify-between">
          <span>부문</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwonInt(buPart)}만원
          </span>
        </div>
        <div className="flex justify-between">
          <span>사업부</span>
          <span className="text-navy dark:text-canvas-50 font-bold tabular-nums">
            {fmtManwonInt(saPart)}만원
          </span>
        </div>
      </div>
      <p className="text-xl font-black tabular-nums" style={{ color }}>
        {fmtManwon(animTotal)}
      </p>
      <p className="text-[11px] text-faint-blue mt-0.5">{fmtEok(total)}</p>
      <div className="mt-2 h-1.5 rounded-full bg-canvas-100 dark:bg-canvas-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barPct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

