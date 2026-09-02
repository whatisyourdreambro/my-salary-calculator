// src/app/minimum-wage-2027/page.tsx
// 최저임금 2027 시즌 페이지 — 2026-07-14 최저임금위원회 의결 직후 검색 폭증 대응
// 확정 수치: 시급 10,700원 (고용노동부 보도자료, 제14차 전원회의 의결)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { TrendingUp, ArrowRight, Calculator, FileText, Calendar } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import { calculateNetSalary2026 } from "@/lib/calculator";
import type { AdvancedSettings } from "@/app/types";
import { MINIMUM_WAGE_2027 } from "@/config/minimumWage";

// 2027년 적용 최저임금 — 정본은 src/config/minimumWage.ts (위젯 /widget/minimum-wage 와 공유)
const MONTHLY_2027 = MINIMUM_WAGE_2027.monthly; // 2,236,300원 (주 40시간, 월 209시간)
const YEARLY_2027 = MINIMUM_WAGE_2027.yearly; // 26,835,600원

const DEFAULT_SETTINGS: AdvancedSettings = {
  isSmeYouth: false,
  disabledDependents: 0,
  seniorDependents: 0,
};

export const metadata: Metadata = buildPageMetadata({
  title: "2027 최저임금 시급 10,700원 확정 — 월 2,236,300원 환산표",
  description:
    "2027년 최저임금 시급 10,700원 확정(2026년 8월 5일 고용노동부 고시, 2026년 10,320원 대비 +380원, 3.7% 인상). 주휴수당 포함 월 2,236,300원, 연 26,835,600원. 표결 결과와 시급·월급·연봉 환산표, 세후 실수령액 참고치까지 한 번에.",
  path: "/minimum-wage-2027",
  ogType: "article",
  publishedTime: "2026-07-16",
  modifiedTime: "2026-08-26",
  keywords: [
    "2027 최저임금",
    "2027 최저시급",
    "최저임금 2027",
    "최저시급 10700원",
    "2027 최저임금 월급",
    "2027 최저임금 연봉",
    "내년 최저임금",
    "최저임금 인상률",
    "최저임금위원회 표결",
    "2027 최저임금 실수령액",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2027년 최저임금은 얼마인가요?",
    answer:
      "시급 10,700원입니다. 2026년 7월 14일 최저임금위원회 제14차 전원회의에서 의결됐습니다(고용노동부 보도자료). 주휴수당 포함 월급으로 환산하면 2,236,300원(주 40시간, 월 209시간 기준), 연봉으로는 26,835,600원입니다.",
  },
  {
    question: "2027년 최저임금은 언제부터 적용되나요?",
    answer:
      "고용노동부가 이의제기 절차를 거쳐 2026년 8월 5일 시급 10,700원으로 확정 고시했으며(민주노총·소상공인연합회의 이의제기는 불수용), 2027년 1월 1일부터 적용됩니다. 그 전까지, 즉 2026년 12월 31일까지는 현행 2026년 최저임금 시급 10,320원(주휴 포함 월 2,156,880원)이 적용됩니다.",
  },
  {
    question: "2026년보다 얼마나 오르나요?",
    answer:
      "시급 기준 380원, 3.7% 인상입니다(10,320원 → 10,700원). 주휴수당 포함 월급 기준으로는 2,156,880원 → 2,236,300원으로 79,420원 오릅니다.",
  },
  {
    question: "표결은 어떻게 진행됐나요?",
    answer:
      "재적 위원 27명이 전원 참석한 가운데 표결이 이뤄졌고, 사용자안 10,700원이 15표, 근로자안 10,730원이 11표를 얻었으며 무효가 1표 나왔습니다. 최종 표결 직전 노사 격차는 30원(노 10,730원 vs 사 10,700원)이었던 것으로 보도됐습니다.",
  },
  {
    question: "노사 최초 요구안은 얼마였나요?",
    answer:
      "노동계는 12,000원(16.3% 인상), 경영계는 동결(10,320원)을 최초 요구안으로 제시한 것으로 보도됐습니다. 이후 공익위원이 심의촉진구간 10,600~10,860원을 제시했고, 공익 권고안 10,720원은 채택되지 않은 채 노사 최종안 표결로 결정된 것으로 전해집니다.",
  },
  {
    question: "3.7% 인상률은 예년과 비교하면 어느 정도인가요?",
    answer:
      "2023년 적용 최저임금 인상률 5.0% 이후 4년 만의 최고 인상률로 보도됐습니다. 최근 인상률 추이는 2024년 2.5%, 2025년 1.7%, 2026년 2.9%, 그리고 이번 2027년 3.7%입니다.",
  },
  {
    question: "월 2,236,300원의 세후 실수령액은 얼마인가요?",
    answer:
      "이 페이지 본문의 실수령액 표에서 2026년 4대보험 요율 기준 참고치를 확인할 수 있습니다. 다만 2027년 요율이 확정되면 실제 실수령액은 달라질 수 있습니다. 특히 국민연금 보험료율은 법정 인상 일정에 따라 2026년 9.5%에서 2027년 10.0%(직장인 본인부담 5.0%)로 오를 예정이어서, 실제 공제액은 참고치보다 커질 수 있습니다.",
  },
  {
    question: "최저임금 시급에 주휴수당이 포함되나요?",
    answer:
      "아니요. 최저임금 시급 10,700원은 주휴수당을 제외한 시급입니다. 다만 월급으로 계산할 때는 주휴수당을 포함해 월 209시간(주 40시간 근무 + 주휴 8시간, 4.345주)으로 환산하는 것이 일반적입니다. 10,700원 × 209시간 = 2,236,300원이 주휴수당 포함 월 환산액입니다.",
  },
  {
    question: "도급제 확대와 업종별 구분적용은 어떻게 됐나요?",
    answer:
      "이번 심의에서 도급제(플랫폼·특수고용 종사자) 적용 확대 안건과 업종별 구분적용 안건은 모두 부결된 것으로 보도됐습니다. 즉 2027년에도 전 업종에 단일 최저임금 10,700원이 적용됩니다.",
  },
  {
    question: "수습 기간에도 2027년 최저임금이 그대로 적용되나요?",
    answer:
      "원칙적으로 적용되지만, 1년 이상 근로계약을 체결한 경우에 한해 수습 시작일부터 3개월 이내까지 최저임금의 90%를 지급할 수 있습니다(단순노무 종사자 제외). 단기 알바·일용직은 첫날부터 100% 적용됩니다.",
  },
];

export default function MinimumWage2027Page() {
  // 세후 실수령액 — 사이트 공용 계산 함수로 렌더 시 계산 (2026년 요율 기준 참고치)
  // 비과세액 0원, 부양가족 본인 1인 기준
  const net = calculateNetSalary2026(YEARLY_2027, 0, 1, 0, DEFAULT_SETTINGS);
  const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

  const deductionRows = [
    { label: "국민연금 (4.75%)", value: net.pension },
    { label: "건강보험 (3.595%)", value: net.health },
    { label: "장기요양보험", value: net.longTermCare },
    { label: "고용보험 (0.9%)", value: net.employment },
    { label: "소득세", value: net.incomeTax },
    { label: "지방소득세", value: net.localTax },
  ];

  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "최저임금 2027", path: "/minimum-wage-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2027 최저임금 시급 10,700원 확정 — 월급·연봉 환산 + 표결 결과",
            description:
              "2027년 최저임금 10,700원 확정(2026-08-05 고시, +380원, 3.7%). 월 2,236,300원 환산, 표결 결과, 실수령액 참고치 종합",
            slug: "minimum-wage-2027",
            url: "/minimum-wage-2027",
            publishedDate: "2026-07-16",
            modifiedDate: "2026-08-26",
          }),
          speakableLd({
            url: "/minimum-wage-2027",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            2026.7.14 의결 · 2027.1.1 적용
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 최저임금 <span className="text-electric">시급 10,700원</span>
          </h1>
          <PublishedMeta publishedDate="2026-07-16" updatedDate="2026-08-26" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            2026년 7월 14일 최저임금위원회 제14차 전원회의에서 2027년 적용 최저임금이
            시급 10,700원으로 의결됐습니다. 2026년 10,320원 대비 380원(3.7%) 인상,
            주휴수당 포함 월 환산액은 2,236,300원(주 40시간, 월 209시간)입니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처:{" "}
            <a
              href="https://www.minimumwage.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              최저임금위원회 공식 사이트
            </a>
          </p>
        </div>

        {/* 핵심 본문 */}
        <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
          <p className="text-sm leading-7 text-muted-blue">
            2027년에 적용될 최저임금이 <strong>시급 10,700원</strong>으로 결정됐습니다.
            고용노동부 보도자료에 따르면 최저임금위원회는 2026년 7월 14일 제14차
            전원회의에서 표결로 이같이 의결했습니다. 2026년 10,320원보다 380원 올라
            인상률은 3.7%이며, 주휴수당 포함 월 환산액은 2,236,300원(주 40시간, 월
            209시간 기준), 연봉으로는 26,835,600원입니다.
          </p>

          <h2 className="text-lg font-black text-navy mt-8 mb-3">표결 결과 한눈에</h2>
          <p className="text-sm leading-7 text-muted-blue">
            표결에는 재적 위원 27명이 전원 참석했습니다. <strong>사용자안 10,700원이
            15표</strong>, 근로자안 10,730원이 11표를 얻었고 무효가 1표 나왔습니다. 최종
            표결 직전 노사 격차는 30원(노 10,730원 vs 사 10,700원)까지 좁혀졌던 것으로
            보도됐습니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            심의 초반 최초 요구안은 노동계 12,000원(16.3% 인상) vs 경영계
            동결(10,320원)로 출발한 것으로 보도됐습니다. 이후 공익위원이 심의촉진구간
            10,600~10,860원을 제시했고, 공익 권고안 10,720원은 채택되지 않은 채 노사
            최종안 표결로 결정된 것으로 전해집니다. 한편 이번 심의에서 도급제(플랫폼·
            특수고용 종사자) 적용 확대와 업종별 구분적용 안건은 모두 부결된 것으로
            보도됐습니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            3.7% 인상률은 2023년 적용 최저임금(5.0% 인상) 이후{" "}
            <strong>4년 만의 최고 인상률</strong>로 보도됐습니다. 최근 추이는 2024년
            2.5% → 2025년 1.7% → 2026년 2.9% → 2027년 3.7%입니다.
          </p>

          <h2 className="text-lg font-black text-navy mt-8 mb-3">확정 고시와 현행 최저임금</h2>
          <p className="text-sm leading-7 text-muted-blue">
            의결안은 이의제기 절차(민주노총·소상공인연합회 이의 불수용)를 거쳐{" "}
            <strong>2026년 8월 5일 고용노동부가 확정 고시했으며</strong>, 2027년 1월 1일부터
            적용됩니다. 그 전까지(2026년 12월 31일까지) 급여·알바비 계산은 현재 적용
            중인 <strong>2026년 시급 10,320원(주휴 포함 월 2,156,880원)</strong>을
            기준으로 해야 합니다. 현행 기준 상세는{" "}
            <Link href="/minimum-wage-2026" className="text-electric font-bold hover:underline">
              최저임금 2026 페이지
            </Link>
            에서 확인하세요.
          </p>
        </section>

        <InArticleAd />

        {/* 시간 단위 환산표 */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric" />
            시급 → 월급·연봉 환산 (209시간 기준, 주휴수당 포함)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { hourly: 10030, label: "2025 시급" },
              { hourly: 10320, label: "2026 시급 (현재 적용 중)" },
              { hourly: 10700, label: "2027 시급 (확정 고시)" },
              { hourly: 11000, label: "시급 11,000원 (참고)" },
              { hourly: 12000, label: "시급 12,000원 (참고)" },
              { hourly: 13000, label: "시급 13,000원 (참고)" },
            ].map((row) => {
              const monthly = row.hourly * 209;
              const yearly = monthly * 12;
              return (
                <div key={row.hourly} className="p-4 bg-canvas rounded-xl">
                  <p className="text-xs font-bold text-faint-blue mb-1">{row.label}</p>
                  <p className="text-lg font-black text-electric">
                    시급 {row.hourly.toLocaleString("ko-KR")}원
                  </p>
                  <p className="text-sm text-muted-blue mt-1">
                    월 {Math.round(monthly / 10000).toLocaleString("ko-KR")}만원 · 연{" "}
                    {Math.round(yearly / 10000).toLocaleString("ko-KR")}만원
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 2027 최저시급 10,700원은 2026년 8월 5일 고용노동부가 확정 고시한 수치로,
            주휴 포함 월 209시간 기준 월 2,236,300원입니다.
          </p>
        </section>

        {/* 실수령액 참고표 */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-electric" />
            월 2,236,300원 세후 실수령액 (참고치)
          </h2>
          <p className="text-sm text-muted-blue mb-6">
            2027년 최저임금 월급을 받을 때 4대보험·세금을 뺀 실수령액 참고치입니다.
            비과세액 0원, 부양가족 본인 1인 기준.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-canvas-200">
                  <td className="py-3 font-bold text-navy">세전 월급 (주휴 포함)</td>
                  <td className="py-3 text-right font-black text-navy">
                    {MONTHLY_2027.toLocaleString("ko-KR")}원
                  </td>
                </tr>
                {deductionRows.map((row) => (
                  <tr key={row.label} className="border-b border-canvas-100">
                    <td className="py-2.5 text-muted-blue">{row.label}</td>
                    <td className="py-2.5 text-right text-muted-blue">-{fmt(row.value)}원</td>
                  </tr>
                ))}
                <tr className="border-b border-canvas-200">
                  <td className="py-3 font-bold text-navy">공제 합계</td>
                  <td className="py-3 text-right font-bold text-navy">
                    -{fmt(net.totalDeduction)}원
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-black text-navy">월 실수령액 (참고치)</td>
                  <td className="py-3 text-right text-lg font-black text-electric">
                    {fmt(net.monthlyNet)}원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-4 leading-relaxed">
            ※ 위 실수령액은 <strong>2026년 4대보험 요율 기준 참고치</strong>입니다.
            2027년 요율이 확정되면 실수령액은 달라질 수 있습니다. 특히 국민연금
            보험료율은 법정 인상 일정에 따라 2026년 9.5% → 2027년 10.0%(직장인
            본인부담 5.0%)로 오를 예정이어서 실제 공제액은 이보다 커질 수 있습니다.
          </p>
        </section>

        <CalcResultAd />

        {/* CTAs */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <Calculator className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">연봉 실수령액 계산</h3>
            <p className="text-sm opacity-90">본인 시급 vs 최저임금 비교</p>
          </Link>
          <Link
            href="/minimum-wage-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">최저임금 2026 (현행)</h3>
            <p className="text-sm text-muted-blue">올해 12월 31일까지 적용 기준</p>
          </Link>
          <Link
            href="/social-insurance-rates-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">2026 4대보험 요율</h3>
            <p className="text-sm text-muted-blue">실수령액 계산의 기준 요율</p>
          </Link>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">2027 최저임금 자주 묻는 질문</h2>
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

        <RelatedCalculators currentPath="/minimum-wage-2027" />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="2027 최저임금 시급 10,700원 확정 — 월급·연봉 환산표"
            description="+380원(3.7%) 인상, 월 2,236,300원. 표결 결과·확정 일정·실수령액 참고치 한눈에"
          />
        </div>

        <div className="mt-8">
          <HomeTopAd />
        </div>
      </div>
    </main>
  );
}
