# /calc/health-premium-hike-2027 — 건강보험 인상 계산기 발행 셸 (초안)

- 작성: 2026-08-31 (임무 P8). **이 문서는 라우트가 아니라 보관용 초안이다. src/app 아래에 이 라우트를 지금 만들지 말 것.**
- 원형: `src/app/calc/pension-hike-2027/` (page.tsx + Client.tsx) — 구조·광고 배치·스타일 동일 복제.
- 발행 트리거: 보건복지부 건강보험정책심의위원회(건정심)의 **2027년 건강보험료율 인상 의결** 보도자료.

## ★발행 조건 체크리스트 (전부 확인 전 발행 금지)

1. **인상 의결 시에만 발행.** 건정심이 2027 요율을 동결·인하로 의결하면 이 문서는 폐기한다 — `health-premium-hike`(인상) 슬러그로 동결 콘텐츠를 발행하는 것은 금지.
2. **10월 말 이후 지연 시 발행 금지.** 건정심 발표가 10월 말을 넘겨 시즌을 놓치면 동결기 발행하지 말고, 이 셸은 차년(2028) 인상 이벤트용으로 재사용한다.
3. **부과체계 개편 동시 발표 시 로직 재확인.** 정률 구조(보수월액 × 요율)가 유지되는지 보도자료 원문으로 확인한 뒤 로직을 확정한다. 정률 구조가 깨지면(구간제·상한 구조 개편 등) 아래 Client.tsx는 재설계 대상이다.
4. **generateData2027.ts HEALTH 슬롯과 한 배포로 동기화.** 이 계산기 발행과 `src/lib/generateData2027.ts` 의 `NET_SALARY_RATES_2027.health`(·`ltcRatio`) 갱신, `/social-insurance-rates-2027` 의 건보 카드·배너·FAQ 갱신은 같은 트리거(건정심 확정)이므로 반드시 같은 커밋·배포로 나간다.
5. **광고는 표준 배치 기승인(운영자 2026-08-31).** 결과 직하 `CalcResultAd` + 본문-FAQ 사이 `InArticleAd` — 원형 그대로. 새 광고 유닛 추가·광고 컴포넌트 수정·광고 위 신규 UI 배치는 금지.

요율 상수·미정 수치 자리는 전부 `TODO(2027-건정심)` / `TODO(2027-장기요양)` 마커로 표시했다. 발행 직전 `TODO(2027` 문자열 전체 검색으로 잔여 마커 0을 확인할 것.

## 발행 절차 (요약)

1. 건정심 보도자료에서 확정값 채록: 총 요율 %, 근로자 부담 %, 시행일(통상 2027-01-01), 의결일.
2. 아래 두 파일을 `src/app/calc/health-premium-hike-2027/` 에 생성하고 `TODO(2027-…)` 마커를 전부 확정값으로 치환. FAQ·본문 예시 금액(월급 300만·500만 기준)은 확정 요율로 재계산해 기입.
3. 체크리스트 4의 동기화 대상(generateData2027.ts·/social-insurance-rates-2027)을 같은 커밋에서 갱신.
4. 중앙 등록(sitemap·searchIndex·/calc 인덱스·relatedCalculators·crossLink)은 오케스트레이터 일괄 처리 — 이 셸 코드에는 포함하지 않는다.
5. 게이트: `npx tsc --noEmit` 종료코드 0 + 신규 파일 eslint 0 + `TODO(2027` 검색 결과 0.

참고: 원형과 동일하게 `buildToolMetadata` 를 쓰면 공유 헬퍼가 타이틀에 "2026" 연도 접미를 붙인다(`${name} 2026 — ${tagline}`, pension-hike-2027도 동일). 헬퍼 수정은 금지 — 발행 시점에 운영자가 연도 표기를 문제 삼으면 `buildPageMetadata` 로 전환만 검토.

---

## page.tsx (전문)

```tsx
// /calc/health-premium-hike-2027 — 건강보험 인상 월급 영향 계산기
// 발행 조건: 2027 건보료율 건정심 "인상" 의결 시에만 (동결 시 발행 금지 — docs/drafts/health-premium-hike-2027-shell.md 체크리스트 참조)
// ★ 갱신 체크포인트: 발행 시 generateData2027.ts HEALTH 슬롯·/social-insurance-rates-2027 과 한 배포 동기화.
//   장기요양 2027 비율은 별도 의결(통상 연말) — 확정 전 2026 준용(13.14%) 명시.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import { TrendingUp, Info } from "lucide-react";
import HealthPremiumHikeClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "건강보험료가 왜 오르나요?",
    answer:
      "보건복지부 건강보험정책심의위원회(건정심)가 TODO(2027-건정심: 의결일)에 2027년 건강보험료율을 총 TODO(2027-건정심)%로 인상 의결했습니다. 2026년 총 7.19%(근로자 3.595%)에서 TODO(2027-건정심)%포인트 오른 것으로, 직장가입자는 회사와 절반씩 부담하므로 근로자 몫은 2027년 1월부터 월 보수의 TODO(2027-건정심)%가 됩니다.",
  },
  {
    question: "내 월급에서 실제로 얼마나 더 빠지나요?",
    answer:
      "근로자 부담률이 3.595%에서 TODO(2027-건정심)%로 오르면, 월급 300만원 기준 매달 약 TODO(2027-건정심: 재계산)원, 월급 500만원 기준 매달 약 TODO(2027-건정심: 재계산)원을 더 냅니다. 건강보험료에 정률로 붙는 장기요양보험료까지 함께 늘어나므로 체감 인상분은 건보 단독 인상분보다 조금 큽니다. 위 계산기에 월급을 입력하면 장기요양 연동분까지 합산해 보여줍니다.",
  },
  {
    question: "장기요양보험료도 같이 오르나요?",
    answer:
      "장기요양보험료는 건강보험료에 일정 비율(2026년 13.14%)을 곱해 산정하므로, 요율표가 그대로여도 건강보험료가 오르면 자동으로 함께 오릅니다. 2027년 장기요양 비율 자체의 변경 여부는 통상 연말 장기요양위원회에서 별도 의결됩니다 — TODO(2027-장기요양: 확정 시 반영, 확정 전에는 '2026 비율 준용' 문구 유지).",
  },
  {
    question: "회사도 같이 더 내나요?",
    answer:
      "네. 직장가입자의 건강보험료는 근로자와 회사가 절반씩 부담합니다. 2027년 총 요율 TODO(2027-건정심)% 중 근로자 TODO(2027-건정심)%, 회사 TODO(2027-건정심)%입니다. 지역가입자는 소득·재산 기반 별도 부과체계로, 인상률이 그대로 적용되면 부담이 전액 본인 몫입니다.",
  },
  {
    question: "언제부터 적용되나요?",
    answer:
      "2027년 1월 1일 보수분부터 적용됩니다(TODO(2027-건정심: 시행일 원문 확인)). 실제 월급 공제액 변화는 2027년 1월 급여명세서부터 확인할 수 있습니다. 참고로 4월에 공제액이 또 달라진다면 인상이 아니라 전년 보수 확정에 따른 연말정산(4월 정산) 때문입니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "건강보험 인상 계산기",
  tagline: "2027년 요율 인상 — 내 월급에서 얼마나 더 빠지나",
  description:
    "2027년 1월부터 건강보험료율이 총 7.19%에서 TODO(2027-건정심)%(근로자 TODO(2027-건정심)%)로 오릅니다. 월급만 입력하면 장기요양 연동분까지 합산해 매달 더 내는 금액과 연간 부담 증가액을 즉시 계산합니다.",
  path: "/calc/health-premium-hike-2027",
  keywords: ["건강보험 인상", "건강보험료율 2027", "건보료 인상 계산", "2027 건강보험", "장기요양보험료 인상"],
});

export default function HealthPremiumHike2027Page() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "건강보험 인상 계산기",
            description: "2027년 건강보험료율 인상으로 월급에서 더 빠지는 금액을 자동 계산합니다.",
            url: "/calc/health-premium-hike-2027",
          }),
          autoBreadcrumbLd("/calc/health-premium-hike-2027", { leafName: "건강보험 인상 계산기" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <TrendingUp size={12} /> 2027-01-01 시행 {/* TODO(2027-건정심): 시행일 확정 문구 */}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              건강보험 인상 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              요율 7.19% → <strong className="text-electric">TODO(2027-건정심)%</strong> — 내 월급에서 얼마나 더 빠지나
            </p>
          </header>

          <HealthPremiumHikeClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">2027년 건강보험, 무엇이 바뀌나</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              건정심 의결(TODO(2027-건정심: 의결일))로 2027년 1월 1일부터 건강보험료율이 총{" "}
              <strong>TODO(2027-건정심)%</strong>로 오릅니다. 직장가입자는 회사와 절반씩 부담하므로
              근로자 몫은 월 보수의 <strong>TODO(2027-건정심)%</strong>입니다. 건강보험료에 정률로
              연동되는 장기요양보험료(2026년 건보료의 13.14%)도 자동으로 함께 늘어납니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>월급 300만원: 월 +TODO(2027-건정심: 재계산)원 (장기요양 연동 포함)</li>
              <li>월급 500만원: 월 +TODO(2027-건정심: 재계산)원 (장기요양 연동 포함)</li>
              <li>같은 해 국민연금도 4.75%→5.0%로 올라 1월 공제 증가는 두 항목 합산으로 체감됩니다</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              연금 인상분은{" "}
              <Link href="/calc/pension-hike-2027" className="text-electric font-bold hover:underline">
                국민연금 인상 계산기
              </Link>
              에서, 두 인상이 모두 반영된 내년 세후 월급은{" "}
              <Link href="/table/2027/annual" className="text-electric font-bold hover:underline">
                2027 연봉 실수령액 표
              </Link>
              에서 확인하세요.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 — 원형(pension-hike-2027)과 동일, 표준 배치 기승인 2026-08-31 */}
          <InArticleAd />

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}<span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              직장가입자 기준이며, 보수월액은 실제로는 전년 보수로 산정한 뒤 4월 연말정산으로
              정산됩니다(본 계산기는 입력 월급 기준 정률 근사). 보수월액 상·하한 해당자(초고액·저액)는
              별도 고시 기준이 적용됩니다. 장기요양 2027 비율은 확정 전까지 2026 비율(13.14%)을
              준용합니다. 지역가입자는 부과체계가 달라 본 계산기 대상이 아닙니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/health-premium-hike-2027" />
        </div>
      </main>
    </>
  );
}
```

## Client.tsx (전문)

```tsx
"use client";

// 건강보험 인상(2026 근로자 3.595% → 2027 TODO) 월급 영향 계산
// 발행 시 검증 메모(작성일 기입): 건정심 의결값·시행일·보도자료 링크를 여기에 기록.
// 2026 정본 요율은 taxConstants2026(INSURANCE_RATES_2026)에서 import — 병렬 상수 금지.
// 2027 확정값은 generateData2027.ts HEALTH 슬롯과 같은 커밋으로 갱신(체크리스트 ④).

import { useState, useMemo } from "react";
import { CalcResultAd } from "@/components/AdPlacement";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

// 2026 정본 — 근로자 3.595% (총 7.19%), 장기요양 = 건보료의 13.14%
const HEALTH_RATE_2026 = INSURANCE_RATES_2026.HEALTH_INSURANCE;
const LTC_RATIO_2026 = INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO;

// TODO(2027-건정심): 건정심 의결 "근로자" 요율로 교체 (총 요율의 절반, 예: 총 7.XX% → 0.03XX).
// 0인 채로는 발행 금지 — 발행 게이트에서 TODO(2027 검색 0 확인.
const HEALTH_RATE_2027 = 0; // TODO(2027-건정심)
// TODO(2027-장기요양): 2027 비율 확정 시 교체. 확정 전 발행이면 2026 준용 유지(현행 코드).
const LTC_RATIO_2027 = LTC_RATIO_2026;

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");
const pct = (r: number) => (r * 100).toFixed(3).replace(/\.?0+$/, "");

export default function HealthPremiumHikeClient() {
  const [salaryFmt, setSalaryFmt] = useState("3,500,000");

  const monthly = Number(salaryFmt.replace(/[^0-9]/g, "")) || 0;

  const r = useMemo(() => {
    // 정률 구조(보수월액 × 요율) 전제 — 부과체계 개편 발표 시 체크리스트 ③ 확인 후 확정
    const h2026 = monthly * HEALTH_RATE_2026;
    const h2027 = monthly * HEALTH_RATE_2027;
    const ltc2026 = h2026 * LTC_RATIO_2026;
    const ltc2027 = h2027 * LTC_RATIO_2027;
    const total2026 = h2026 + ltc2026;
    const total2027 = h2027 + ltc2027;
    return {
      h2026,
      h2027,
      total2026,
      total2027,
      diffMonthly: total2027 - total2026,
      diffYearly: (total2027 - total2026) * 12,
      totalWithEmployer2027: h2027 * 2,
    };
  }, [monthly]);

  return (
    <div className="space-y-5 mb-10">
      <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6">
        <label htmlFor="hp-salary" className="text-xs font-bold uppercase tracking-widest block mb-2 text-faint-blue">
          월급 (세전, 보수월액)
        </label>
        <div className="relative max-w-md">
          <input
            id="hp-salary"
            type="text"
            inputMode="numeric"
            value={salaryFmt}
            onChange={(e) => {
              const d = e.target.value.replace(/[^0-9]/g, "");
              setSalaryFmt(d ? Number(d).toLocaleString("ko-KR") : "");
            }}
            className="w-full rounded-xl px-4 py-4 text-2xl font-black focus:outline-none transition pr-9"
            style={{ backgroundColor: "#0145F208", border: "2px solid #0145F2", color: "#0145F2" }}
            aria-label="월급"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-electric">원</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px #0145F225" }}>
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #0145F2 0%, #0D5BFF 100%)" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            2027년 1월부터 매달 더 내는 건강보험료 (장기요양 포함)
          </p>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.04em" }}>
            +{fmt(r.diffMonthly)}원
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            연간 +{fmt(r.diffYearly)}원 — 그만큼 월 실수령액이 줄어듭니다
          </p>
        </div>
        <div className="bg-white dark:bg-canvas-900 px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">2026년 본인 부담 ({pct(HEALTH_RATE_2026)}%+장기요양)</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">월 {fmt(r.total2026)}원</div>
          </div>
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">2027년 본인 부담 ({pct(HEALTH_RATE_2027)}%+장기요양)</div>
            <div className="font-black tabular-nums text-electric">월 {fmt(r.total2027)}원</div>
          </div>
          <div className="rounded-xl bg-canvas-50 dark:bg-canvas-800 p-3">
            <div className="text-xs text-faint-blue mb-0.5">회사 부담 합산 건보료 (장기요양 제외)</div>
            <div className="font-black tabular-nums text-navy dark:text-canvas-50">월 {fmt(r.totalWithEmployer2027)}원</div>
          </div>
        </div>
      </div>

      {/* 결과 직하 광고 — 원형과 동일, 표준 배치 기승인 2026-08-31 */}
      <CalcResultAd />
    </div>
  );
}
```

---

## 발행 시 동기화 대상 (체크리스트 ④ 상세)

같은 커밋에 반드시 포함:

- `src/lib/generateData2027.ts` — `NET_SALARY_RATES_2027.health` (확정 근로자 요율), 장기요양 확정 시 `ltcRatio`. 이 한 곳으로 `/table/2027/*` 4표가 일괄 갱신된다.
- `src/app/social-insurance-rates-2027/page.tsx` — 건강보험 카드 수치·status, 미확정 고지 배너, FAQ 3번(확정 문구로 전환), 갱신 슬롯 주석 소거.
- `src/app/table/2027/layout.tsx` 고지 배너 문구 (미확정 목록에서 건보 제거).
- 중앙 등록(sitemap·searchIndex·/calc 인덱스·relatedCalculators·crossLink)은 오케스트레이터 절차로 처리.
