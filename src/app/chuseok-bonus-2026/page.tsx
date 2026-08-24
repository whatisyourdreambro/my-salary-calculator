// src/app/chuseok-bonus-2026/page.tsx
// 2026 추석 상여금 시즌 페이지 — "추석 상여금 평균·지급 의무·떡값" 클러스터 선점
// (검색 피크: 8월 말~9월 추석 직전. 2026 추석 = 9/25(금), 연휴 9/24~26)
//
// ★ 갱신 체크포인트:
//   1) 매년 8~9월: 사람인 등 추석 상여 조사 발표 시 AVG_BONUS_ROWS·지급 비율 갱신
//   2) 매년: 추석 날짜·연휴·대체공휴일 여부 갱신 (2027 추석 대비)
// ⚠ 키워드 카니발 방지: "추석 상여금 세금 실수령"은 /guides/chuseok-bonus-tax-2026,
//   "추석 보너스 세금 계산기"는 /calc/holiday-bonus 가 선점 — 이 페이지는
//   평균·지급의무·떡값·연휴수당 정보 허브 + 두 페이지로의 내부링크 역할.
// 사실관계 출처(2026-08-16 교차 확인): 추석 날짜 4개 독립 출처 일치,
//   근로기준법 제55·56조 + 고용노동부 자료, 사람인 2025 조사(950개사) 보도.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  ArrowRight,
  Calendar,
  Gift,
  Scale,
  FileText,
  Calculator,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  InArticleAd,
  HomeTopAd,
  CalcResultAd,
  GuideMidAd,
} from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import ChuseokBonusClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 추석 상여금 — 평균 지급액·지급 의무·떡값 세금 총정리",
  description:
    "2026 추석 상여금, 남들은 얼마나 받을까? 기업 규모별 평균(300인 이상 105.9만원·중소 59.1만원), 상여금 지급 의무가 생기는 3가지 경우, 떡값·상품권·선물 과세 기준, 연휴(9/24~26) 근무 수당 150%까지 — 추석 돈 문제 전부 정리.",
  path: "/chuseok-bonus-2026",
  ogType: "article",
  publishedTime: "2026-08-16",
  modifiedTime: "2026-08-16",
  // ⚠ "세금 계산"·"명절 상여금" 일반형 금지 — 기존 가이드·계산기 잠식 방지
  keywords: [
    "추석 상여금 평균",
    "추석 상여금 얼마",
    "2026 추석 상여금",
    "추석 상여금 지급 의무",
    "추석 떡값",
    "추석 보너스 평균",
    "추석 상여금 안 주는 회사",
    "추석 연휴 근무 수당",
  ],
});

// 사람인 2025년 추석 조사(950개사, 2025-09 보도) — 매년 갱신
const AVG_BONUS_ROWS: ReadonlyArray<{ size: string; amount: string }> = [
  { size: "300인 이상", amount: "105만 9,000원" },
  { size: "100~299인", amount: "76만 3,000원" },
  { size: "100인 미만", amount: "59만 1,000원" },
];

const FAQ_ITEMS = [
  {
    question: "2026년 추석 상여금 평균은 얼마인가요?",
    answer:
      "가장 최근 조사인 사람인 2025년 추석 조사(기업 950개사) 기준으로 상여금을 지급한 기업은 56.9%였고, 규모별 평균은 300인 이상 105만 9,000원, 100~299인 76만 3,000원, 100인 미만 59만 1,000원이었습니다. 2026년 조사 결과가 발표되면 이 페이지를 갱신합니다.",
  },
  {
    question: "회사가 추석 상여금을 꼭 줘야 하나요?",
    answer:
      "법으로 정해진 지급 의무는 없습니다. 다만 ① 근로계약서·취업규칙·단체협약에 명절 상여 지급이 명시돼 있거나 ② 오랜 기간 정기적·일률적으로 지급해 '관행'으로 임금성이 인정되는 경우에는 지급 의무가 생기고, 일방적으로 끊으면 임금체불이 될 수 있습니다. 반대로 규정도 관행도 없다면 지급하지 않아도 위법이 아닙니다.",
  },
  {
    question: "떡값·상품권·선물세트도 세금을 떼나요?",
    answer:
      "현금성 지급(떡값·상여금·상품권)은 금액과 무관하게 전부 근로소득으로 과세됩니다. 상품권도 현금과 동일하게 급여에 합산됩니다. 회사가 주는 선물세트 같은 현물도 원칙적으로 근로소득이지만, 사회통념상 소액의 창립기념품 등 일부 예외를 빼면 시가 상당액이 과세 대상입니다. '선물이라 세금 안 뗀다'는 흔한 오해입니다.",
  },
  {
    question: "추석 상여금은 왜 생각보다 많이 떼이나요?",
    answer:
      "상여금은 별도 세율이 아니라 연봉에 합산되는 근로소득이라, 내 연봉 구간의 한계세율(6~45%)과 4대보험이 그대로 적용됩니다. 연봉이 높을수록 상여에서 떼이는 비율도 커집니다. 위 간편 계산기에 연봉과 상여금을 넣으면 실수령액을 바로 확인할 수 있습니다.",
  },
  {
    question: "2026년 추석 연휴에 일하면 수당은 어떻게 되나요?",
    answer:
      "2026년 추석 연휴(9/24~26)는 관공서 공휴일로, 상시 5인 이상 사업장은 유급휴일로 보장해야 합니다(근로기준법 제55조). 이날 근무하면 휴일근로 가산수당이 붙습니다: 8시간 이내는 통상임금의 50% 가산(월급제 기준 통상임금의 150% 추가 지급), 8시간 초과분은 100% 가산입니다. 다만 5인 미만 사업장은 공휴일 유급휴일·가산수당 의무가 적용되지 않고, 근로자대표와 서면 합의한 '휴일대체'가 있으면 가산 없이 통상 근무가 됩니다.",
  },
  {
    question: "2026년 추석은 언제이고 대체공휴일이 있나요?",
    answer:
      "2026년 추석 당일은 9월 25일(금)이며 법정 연휴는 9월 24일(목)~26일(토) 3일입니다. 대체공휴일은 없습니다 — 설·추석 연휴는 일요일과 겹칠 때만 대체공휴일이 생기는데 2026년은 목·금·토라 해당하지 않습니다. 다만 연휴 다음 날이 일요일(9/27)이라 주5일 근무자는 사실상 목~일 4일을 쉬게 됩니다.",
  },
];

export default function ChuseokBonus2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "추석 상여금 2026", path: "/chuseok-bonus-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 추석 상여금 — 평균 지급액·지급 의무·떡값 세금 총정리",
            description:
              "기업 규모별 추석 상여금 평균, 지급 의무가 생기는 경우, 떡값·상품권·선물 과세, 연휴 근무 수당까지 2026 추석 돈 문제 총정리",
            slug: "chuseok-bonus-2026",
            url: "/chuseok-bonus-2026",
            publishedDate: "2026-08-16",
            modifiedDate: "2026-08-16",
          }),
          speakableLd({
            url: "/chuseok-bonus-2026",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            2026 추석 9/25(금) · 연휴 9/24~26 · 대체공휴일 없음
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 추석 상여금 <span className="text-electric">평균·지급 의무·떡값</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-16" updatedDate="2026-08-16" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            남들은 얼마나 받는지, 우리 회사는 안 줘도 되는 건지, 떡값과 선물엔 세금이
            붙는지 — 추석 앞두고 궁금한 돈 문제를 조사 통계와 법 기준으로 정리했습니다.
          </p>
        </div>

        <HomeTopAd />

        {/* 평균 지급액 */}
        <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
            <Gift className="w-5 h-5 text-electric" />
            추석 상여금, 남들은 얼마나 받을까 — 기업 규모별 평균
          </h2>
          <p className="text-xs text-faint-blue mb-5">
            출처: 사람인 2025년 추석 조사(기업 950개사, 2025-09 보도) · 2026 조사 발표 시 갱신
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b-2 border-canvas-200 text-navy">
                  <th className="py-3 px-2 text-left font-black">기업 규모</th>
                  <th className="py-3 px-2 text-right font-black">평균 지급액</th>
                </tr>
              </thead>
              <tbody>
                {AVG_BONUS_ROWS.map((row) => (
                  <tr key={row.size} className="border-b border-canvas-100">
                    <td className="py-2.5 px-2 font-bold text-navy">{row.size}</td>
                    <td className="py-2.5 px-2 text-right text-muted-blue">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-blue leading-relaxed mt-4">
            2025년 추석에 상여금을 지급한 기업은 <strong>56.9%</strong>였습니다. 지급
            방식은 &quot;별도 상여&quot;(49.7%)와 &quot;정기 상여에 포함&quot;(45.7%)이 비슷하게 갈리고,
            중소기업일수록 현금 대신 선물로 대체하는 비율이 높습니다. 참고로 2024년
            조사에서는 지급 기업이 47.7%(평균 66만 5,600원)까지 떨어진 적도 있어, 지급
            여부는 해마다 경기 상황에 따라 출렁입니다.
          </p>
        </section>

        <CalcResultAd />

        {/* 미니 계산기 */}
        <div className="mt-10 mb-12">
          <ChuseokBonusClient />
        </div>

        {/* 지급 의무 */}
        <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
          <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-electric" />
            우리 회사는 안 주는데, 불법인가요? — 지급 의무가 생기는 3가지 경우
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            명절 상여금은 <strong>법정 수당이 아니라서 원칙적으로 지급 의무가 없습니다.</strong>{" "}
            하지만 다음 세 경우에는 이야기가 달라집니다.
          </p>
          <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
            <li>
              <strong>근로계약서·취업규칙에 명시</strong> — &quot;설·추석에 각 ○○만원(또는
              월봉급의 ○%)을 지급한다&quot;고 적혀 있으면 임금의 일부라 지급 의무가 있습니다.
            </li>
            <li>
              <strong>단체협약에 명시</strong> — 노조가 있는 회사라면 단체협약의 명절
              상여 조항이 우선 적용됩니다.
            </li>
            <li>
              <strong>지급 관행의 임금성</strong> — 규정에 없어도 수년간 전 직원에게
              정기적·일률적으로 지급해 왔다면 &apos;관행에 의한 임금&apos;으로 인정될 수 있고, 이
              경우 회사가 일방적으로 중단하면 임금체불 문제가 됩니다.
            </li>
          </ul>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            반대로 셋 다 해당이 없다면 상여금을 주지 않아도 위법이 아닙니다. 내 경우가
            어디에 해당하는지는 근로계약서와 취업규칙(사내 인트라넷·인사팀 요청으로 열람
            가능)을 먼저 확인하는 것이 순서입니다.
          </p>

          <h2 className="text-lg font-black text-navy mt-8 mb-3">
            떡값·상품권·선물세트 — 뭐가 과세되고 뭐가 안 되나
          </h2>
          <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
            <li>
              <strong>현금(떡값·상여금)</strong> — 금액과 무관하게 전부 근로소득 과세.
            </li>
            <li>
              <strong>상품권</strong> — 현금과 동일하게 과세. &quot;상품권이라 비과세&quot;는 오해.
            </li>
            <li>
              <strong>선물세트 등 현물</strong> — 원칙적으로 시가 상당액이 근로소득.
              사회통념상 소액 기념품 수준의 일부 예외만 비과세.
            </li>
          </ul>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            상여금 원천징수가 실제로 어떻게 계산되는지(지급 시 세금을 더 떼는 구조와
            연말정산 정산)는{" "}
            <Link
              href="/guides/chuseok-bonus-tax-2026"
              className="text-electric font-bold hover:underline"
            >
              추석 상여금 세금 실수령 가이드
            </Link>
            에 자세히 정리돼 있습니다.
          </p>
        </section>

        <InArticleAd />

        {/* 연휴 근무 수당 */}
        <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
          <h2 className="text-lg font-black text-navy mb-3">
            연휴에 일하면? — 2026 추석 근무 수당 기준
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            2026년 추석 연휴 <strong>9월 24일(목)~26일(토)</strong>은 모두 관공서
            공휴일입니다. 상시 5인 이상 사업장이라면 이 3일은 유급휴일이고(근로기준법
            제55조 제2항), 공휴일을 연차로 대체하는 것은 불법입니다. 이날 근무하면
            휴일근로 가산수당이 붙습니다(제56조).
          </p>
          <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
            <li>
              <strong>8시간 이내 근무</strong> — 통상임금의 50% 가산. 월급제는 유급휴일분이
              월급에 포함돼 있어 <strong>통상임금의 150%를 추가</strong>로 받습니다.
            </li>
            <li>
              <strong>8시간 초과분</strong> — 100% 가산(2배).
            </li>
            <li>
              <strong>5인 미만 사업장</strong> — 공휴일 유급휴일·가산수당 의무가 적용되지
              않습니다.
            </li>
            <li>
              <strong>휴일대체</strong> — 근로자대표와 서면 합의로 다른 근무일과 바꿨다면
              가산 없이 통상 근무가 됩니다.
            </li>
          </ul>
        </section>

        {/* CTA 카드 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/calc/holiday-bonus"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <Calculator className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">명절 상여 정밀 계산기</h3>
            <p className="text-sm opacity-90">부양가족·세액공제까지 반영한 실수령</p>
          </Link>
          <Link
            href="/guides/chuseok-bonus-tax-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">상여금 세금 구조 가이드</h3>
            <p className="text-sm text-muted-blue">원천징수·연말정산 정산 원리</p>
          </Link>
          <Link
            href="/tools/finance/bonus"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <Calculator className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">성과급 세금 계산기</h3>
            <p className="text-sm text-muted-blue">연간 성과급·인센티브 통합 계산</p>
          </Link>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="mt-10 mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            추석 상여금 자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                  {item.question}
                  <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                </summary>
                <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        <RelatedCalculators currentPath="/chuseok-bonus-2026" />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="2026 추석 상여금 — 평균 지급액·지급 의무·떡값 세금"
            description="300인 이상 평균 105.9만원. 우리 회사는 안 줘도 되는 걸까? 통계와 법 기준 총정리"
          />
        </div>
      </div>
    </main>
  );
}
