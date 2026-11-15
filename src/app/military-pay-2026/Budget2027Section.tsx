// src/app/military-pay-2026/Budget2027Section.tsx
// 2027 군 초급간부 처우 — 정부 예산안 섹션 (서버 컴포넌트, 2026-09-26 준비 · RL-13 2026-11-15 재착지, 운영자 2026-11-13 질문 2 승인).
// 위치: 본문 컬럼 마지막 광고(CoupangBanner) 아래, 세후 계산기 역링크 문단 뒤(본문 컬럼 맨 끝) — 어떤 광고 위에도 두지 않는다.
// 정부안(국회 의결 전)임을 상태 줄·행 배지·안내 문장 세 곳에서 밝힌다.
// 규칙: FAQ 항목·JSON-LD·title 변경 없음(FAQ 는 Coupang 위라 추가 금지), 2027 호봉표·예상표 없음(2026-09-25 결정),
//   수치는 src/lib/militaryBudget2027.ts(기획예산처·국방부 원문)와 civilServantPay.ts(별표 13)에서만 가져온다.
// id="budget-2027" 은 향후 앵커 링크용(외부·내부 링크가 걸릴 수 있으니 바꾸지 말 것).

import { Landmark, AlertTriangle } from "lucide-react";
import {
  MILITARY_BUDGET_2027_ROWS,
  MILITARY_BUDGET_2027_SOURCE,
  MILITARY_BUDGET_2027_MND_SOURCE,
  MILITARY_BUDGET_2027_STATUS_LINE,
  ENLISTED_PAY_2027_LINE,
  SERGEANT_STARTING_PAY_2026,
  militaryBudget2027Row,
} from "@/lib/militaryBudget2027";

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default function Budget2027Section() {
  const raise = militaryBudget2027Row("raise");
  const target = militaryBudget2027Row("target");

  return (
    <section
      id="budget-2027"
      aria-labelledby="budget-2027-heading"
      className="mt-10 mb-12 scroll-mt-28 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200"
    >
      <h2
        id="budget-2027-heading"
        className="text-xl font-black text-navy mb-3 flex items-center gap-2"
      >
        <Landmark className="w-5 h-5 text-electric flex-shrink-0" aria-hidden="true" />
        2027 군 초급간부 처우 — 정부 예산안
      </h2>
      <p className="inline-flex items-start gap-2 text-xs text-amber-800 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 mb-5">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{MILITARY_BUDGET_2027_STATUS_LINE}</span>
      </p>
      <p className="text-sm text-muted-blue leading-relaxed mb-5">
        정부가 2027년도 예산안에 부사관·장교 초급간부 처우개선을 담았습니다. 아래는 예산안 원문에
        적힌 항목만 옮긴 것으로, 국회 심의에서 금액이 달라질 수 있습니다.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MILITARY_BUDGET_2027_ROWS.map((row) => (
          <li key={row.key} className="p-4 bg-canvas rounded-2xl">
            <p className="flex items-start justify-between gap-2 text-sm font-bold text-faint-blue mb-1">
              <span>{row.label}</span>
              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200">
                {row.status}
              </span>
            </p>
            <p className="text-base font-black text-navy tabular-nums">{row.value}</p>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-3 text-sm text-muted-blue leading-relaxed">
        <p>
          <strong className="text-navy">&lsquo;{target.value}&rsquo;은 수당을 포함한 목표</strong>
          입니다. 기획예산처 자료는 이를 초급 간부 &lsquo;총보수&rsquo; 인상으로, 국방부 발표는
          &lsquo;하사 1호봉 기준 보수&rsquo; 인상으로 적었습니다. 참고로 2026년 하사 1호봉 월
          봉급(기본급)은{" "}
          <strong className="text-navy tabular-nums">{fmt(SERGEANT_STARTING_PAY_2026)}원</strong>
          (공무원보수규정 별표 13)입니다. 목표 금액은 이 봉급에 각종 수당을 더한 총보수 기준이라
          봉급표 금액과 그대로 비교하면 안 됩니다.
        </p>
        <p>
          처우개선율({raise.value})은 국방부 발표 기준 중·소위 및 중·하사 기본급에 반영됩니다.
        </p>
        <p className="font-bold text-navy">{ENLISTED_PAY_2027_LINE}</p>
      </div>

      <p className="text-xs text-faint-blue mt-5 leading-6">
        출처:{" "}
        <a
          href={MILITARY_BUDGET_2027_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-electric font-bold hover:underline"
        >
          {MILITARY_BUDGET_2027_SOURCE.issuer} {MILITARY_BUDGET_2027_SOURCE.title}
        </a>{" "}
        (정책브리핑 보도자료 첨부, {MILITARY_BUDGET_2027_SOURCE.asOf}) ·{" "}
        <a
          href={MILITARY_BUDGET_2027_MND_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-electric font-bold hover:underline"
        >
          {MILITARY_BUDGET_2027_MND_SOURCE.issuer} 2027 국방예산 발표
        </a>{" "}
        (정책브리핑, {MILITARY_BUDGET_2027_MND_SOURCE.asOf})
      </p>
    </section>
  );
}
