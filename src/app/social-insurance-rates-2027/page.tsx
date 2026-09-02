// src/app/social-insurance-rates-2027/page.tsx
// 2027 4대보험 요율 선발행 (2026-08-31 신설, 임무 P6 — 광고 구성은 2026판 표준 배치 복제, 운영자 승인 2026-08-31)
//
// 확정값 (기준일 2026-08-31):
// - 국민연금: 2027-01-01부터 총 10.0%·근로자 5.0% — 2025 연금개혁법 법정 스케줄
//   (정본: src/lib/generateData2027.ts NET_SALARY_RATES_2027.pension = 0.05,
//    src/app/calc/pension-hike-2027/Client.tsx RATE_2027 = 0.05 과 정합 확인)
// - 최저임금: 시급 10,700원·월 2,236,300원 — 고용노동부 고시 제2026-60호 (2026-08-05 확정)
//   (정본: src/lib/generateData2027.ts MIN_WAGE_2027 / MIN_WAGE_2027_MONTHLY)
// - 고용보험 실업급여 요율 총 1.8%(근로자 0.9%) — 2022-07-01 이후 현행 유지
// 미확정 (2026 기준 준용, 페이지 내 고지 배너 필수 유지):
// - 건강보험(통상 9월 건정심 의결)·장기요양(장기요양위원회)·산재(12월 고용노동부 고시)
//
// ★갱신 슬롯: 2026년 9월 건정심 — 2027 건보료율 확정 시 이 페이지의 카드·배너·FAQ와
//   src/lib/generateData2027.ts 의 HEALTH 슬롯을 한 배포로 동시 갱신할 것.
// ★갱신 슬롯: 2026년 12월 — 장기요양·산재 2027 요율 고시 확정 시 해당 카드·FAQ 갱신.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Shield, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, GuideMidAd, CalcResultAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
  NET_SALARY_RATES_2027,
  MIN_WAGE_2027,
  MIN_WAGE_2027_MONTHLY,
} from "@/lib/generateData2027";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";

export const metadata: Metadata = buildPageMetadata({
  title: "2027 4대보험 요율표 — 국민연금 10.0% 확정·건강보험은 확정 전 2026 준용",
  description:
    "2027년 4대보험 요율 총정리. 국민연금 총 10.0%(근로자 5.0%)가 2027년 1월 1일 법정 시행되고 최저임금은 시급 10,700원으로 확정. 건강보험·장기요양·산재는 확정 고시 전까지 2026 요율 준용 — 연봉별 월 보험료와 2026 대비 증가액까지 한 페이지에서.",
  path: "/social-insurance-rates-2027",
  ogType: "article",
  publishedTime: "2026-08-31",
  keywords: [
    "2027 4대보험",
    "2027 국민연금 요율",
    "국민연금 10%",
    "2027 건강보험료율",
    "2027 고용보험 요율",
    "2027 보험료 계산",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2027년에 확정된 4대보험 변화는 무엇인가요?",
    answer:
      "2026년 8월 31일 기준 확정된 것은 두 가지입니다. 첫째, 국민연금 보험료율이 2027년 1월 1일부터 총 10.0%(근로자 5.0%·회사 5.0%)로 오릅니다 — 2025년 통과된 국민연금법 개정(연금개혁)에 법정 스케줄로 명시된 인상입니다. 둘째, 2027년 최저임금이 시급 10,700원(주휴 포함 월 2,236,300원)으로 확정 고시됐습니다(고용노동부 고시 제2026-60호, 2026-08-05). 건강보험·장기요양·산재 요율은 아직 확정 전입니다.",
  },
  {
    question: "2027년 국민연금은 내 월급에서 얼마나 더 빠지나요?",
    answer:
      "근로자 부담률이 4.75%에서 5.0%로 0.25%포인트 오릅니다. 월급 300만원이면 매달 7,500원(연 9만원), 월급 500만원이면 매달 12,500원(연 15만원)을 더 냅니다. 기준소득월액 상한(659만원, 2027년 6월까지) 이상 고소득자는 월 16,475원 증가입니다. 회사도 같은 금액을 추가 부담합니다.",
  },
  {
    question: "2027년 건강보험료율은 언제 확정되나요?",
    answer:
      "건강보험료율은 통상 매년 8월 말~9월 보건복지부 건강보험정책심의위원회(건정심)에서 다음 해 요율을 의결합니다. 2026년 요율(총 7.19%, 근로자 3.595%)도 2025년 8월 28일 건정심에서 결정됐습니다. 2027년 요율이 확정 발표되면 이 페이지와 2027 실수령액 표에 즉시 반영합니다. 확정 전까지 이 페이지의 건강보험·장기요양 수치는 2026년 요율을 준용한 참고치입니다.",
  },
  {
    question: "고용보험료는 2027년에 오르나요?",
    answer:
      "2026년 8월 31일 기준 인상 발표는 없습니다. 실업급여 계정 요율은 2022년 7월 1일 1.8%(근로자 0.9%·회사 0.9%)로 인상된 뒤 현행 유지 중입니다. 회사는 이와 별도로 고용안정·직업능력개발사업 보험료 0.25~0.85%(기업 규모별)를 추가 부담하며, 이 부분도 근로자 월급에서는 공제되지 않습니다.",
  },
  {
    question: "2027년 4대보험 본인 부담은 월급의 몇 %인가요?",
    answer:
      "확정된 국민연금 5.0%에 건강보험 3.595%·장기요양 약 0.472%(이상 2026 준용)·고용보험 0.9%를 더하면 약 9.97% 수준입니다. 2026년(약 9.7%)보다 약 0.25%포인트 높아지는데, 이는 전액 국민연금 인상분입니다. 건강보험 요율이 추가 인상 확정되면 이 비율은 더 올라갑니다. 산재보험은 회사가 100% 부담합니다.",
  },
];

// 요율 카드 — 계산 로직은 아래 calculateInsurance2027()이 정본 상수
// (NET_SALARY_RATES_2027·INSURANCE_RATES_2026)를 직접 사용. 카드의 표시 문자열은
// 그 상수와 정합 (국민연금 5.0%=NET_SALARY_RATES_2027.pension, 건보 3.595%=2026 준용).
// ★갱신 슬롯: 2026년 9월 건정심 — 2027 건보료율 확정 시 건강보험·장기요양 카드의
//   수치·status 문구 갱신 (generateData2027.ts HEALTH 슬롯과 같은 트리거).
// ★갱신 슬롯: 2026년 12월 — 장기요양·산재 고시 확정 시 해당 카드 status 갱신.
const INSURANCE_RATES_2027_CARDS = [
  {
    name: "국민연금",
    totalRate: "10.0%",
    selfRate: "5.0%",
    companyRate: "5.0%",
    base: "보수월액 기준 (상한 659만·하한 41만, 2027.6까지 — 2027.7 재조정)",
    purpose: "노후 연금 — 2027-01-01부터 총 9.5%→10.0% 인상",
    status: "확정 — 2025 연금개혁법 법정 스케줄 (매년 0.5%p 인상, 2033년 13%)",
  },
  {
    name: "건강보험",
    totalRate: "7.19% (2026 준용)",
    selfRate: "3.595%",
    companyRate: "3.595%",
    base: "보수월액",
    purpose: "의료비 보장",
    status: "미확정 — 통상 9월 건정심 의결, 확정 시 즉시 갱신",
  },
  {
    name: "장기요양보험",
    totalRate: "건강보험료의 13.14% (2026 준용)",
    selfRate: "약 0.472%",
    companyRate: "약 0.472%",
    base: "건강보험료 기준",
    purpose: "노인 장기요양 서비스",
    status: "미확정 — 통상 연말 장기요양위원회 의결, 확정 시 즉시 갱신",
  },
  {
    name: "고용보험",
    totalRate: "실업급여 1.8% + 회사 추가분",
    selfRate: "0.9%",
    companyRate: "0.9% + 0.25~0.85% (고용안정·직능, 규모별)",
    base: "보수월액",
    purpose: "실업급여·고용안정",
    status: "현행 유지 — 실업급여 요율 1.8%는 2022.7 이후 변동 없음 (인상 발표 없음)",
  },
  {
    name: "산재보험",
    totalRate: "업종별 차등",
    selfRate: "0%",
    companyRate: "100% (2026년 평균 1.4%대)",
    base: "보수총액 기준 (업종별 요율표)",
    purpose: "업무 중 재해 보장",
    status: "미확정 — 2027 요율은 통상 12월 고용노동부 고시, 확정 시 갱신",
  },
];

const SAMPLE_SALARIES = [
  { salary: 30000000, monthly: 2500000 },
  { salary: 50000000, monthly: 4166667 },
  { salary: 70000000, monthly: 5833333 },
  { salary: 100000000, monthly: 8333333 },
];

// 2027 요율 시뮬 — 정본 상수 재사용 (병렬 로직 신설 금지 원칙):
// 연금 5.0%는 NET_SALARY_RATES_2027, 건보·장기요양·고용은 같은 모듈의 2026 준용값,
// 2026 대비 증가분은 INSURANCE_RATES_2026.NATIONAL_PENSION(4.75%) 대비 연금 인상 효과.
function calculateInsurance2027(monthly: number) {
  const pensionBase = Math.min(monthly, PENSION_BASE_2026.MAX_MONTHLY);
  const pension =
    Math.floor((pensionBase * NET_SALARY_RATES_2027.pension) / 10) * 10;
  const pension2026 =
    Math.floor((pensionBase * INSURANCE_RATES_2026.NATIONAL_PENSION) / 10) * 10;
  const health = Math.floor((monthly * NET_SALARY_RATES_2027.health) / 10) * 10;
  const longTermCare =
    Math.floor((health * NET_SALARY_RATES_2027.ltcRatio) / 10) * 10;
  const employment =
    Math.floor((monthly * NET_SALARY_RATES_2027.employment) / 10) * 10;
  const total = pension + health + longTermCare + employment;
  return {
    pension,
    health,
    longTermCare,
    employment,
    total,
    diff2026: pension - pension2026,
  };
}

const RELATED_2027_LINKS = [
  {
    href: "/calc/pension-hike-2027",
    title: "국민연금 인상 계산기",
    description: "내 월급 기준 2027년 매달 더 내는 금액 즉시 계산",
  },
  {
    href: "/table/2027/annual",
    title: "2027 연봉 실수령액 표",
    description: "연금 5.0% 반영 — 연봉 2,400만~2억 월 실수령액",
  },
  {
    href: "/minimum-wage-2027",
    title: "2027 최저임금 총정리",
    description: "시급 10,700원 확정 고시 — 월급·연봉 환산과 심의 경과",
  },
  {
    href: "/social-insurance-rates-2026",
    title: "2026 4대보험 요율표",
    description: "올해 확정 요율 — 2027 미확정 항목의 준용 기준",
  },
  {
    href: "/health-insurance-fee-2026",
    title: "건강보험료 계산기",
    description: "직장가입자 본인 부담 건보료·장기요양 계산",
  },
];

export default function SocialInsuranceRates2027Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "2027 4대보험 요율", path: "/social-insurance-rates-2027" },
          ]),
          faqLd(FAQ_ITEMS),
          speakableLd({
            url: "/social-insurance-rates-2027",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Shield className="w-4 h-4" />
            2027년 기준 · 2026-08-31 확정분 반영
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2027 4대보험 <span className="text-electric">요율표</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-31" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            국민연금 총 10.0% 인상과 최저임금 시급{" "}
            {MIN_WAGE_2027.toLocaleString("ko-KR")}원은 확정, 건강보험·장기요양·산재는
            확정 고시 전. 무엇이 정해졌고 무엇이 남았는지 한 페이지에서.
          </p>
        </div>

        {/* 보험별 요율 — 확정/미확정 상태 명시 */}
        <section className="mb-12 space-y-3">
          {INSURANCE_RATES_2027_CARDS.map((insurance) => (
            <div
              key={insurance.name}
              className="p-6 bg-white rounded-2xl border border-canvas-200"
            >
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-black text-navy">{insurance.name}</h2>
                  <p className="text-xs text-faint-blue mt-1">{insurance.purpose}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-electric">{insurance.totalRate}</p>
                  <p className="text-xs text-faint-blue">총 요율</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-canvas rounded-xl">
                  <p className="text-xs text-faint-blue mb-1">본인 부담</p>
                  <p className="font-bold text-navy">{insurance.selfRate}</p>
                </div>
                <div className="p-3 bg-canvas rounded-xl">
                  <p className="text-xs text-faint-blue mb-1">회사 부담</p>
                  <p className="font-bold text-navy">{insurance.companyRate}</p>
                </div>
              </div>
              <p className="text-xs text-muted-blue mt-3 leading-relaxed">
                <strong className="text-navy">기준:</strong> {insurance.base}
                <br />
                <strong className="text-navy">2027 상태:</strong> {insurance.status}
              </p>
            </div>
          ))}
        </section>

        <InArticleAd />

        {/* 미확정 요율 고지 배너 — 광고 아래 배치 (2026-08-16 규칙 준수,
            table/2027/layout.tsx 20-32행 배너 패턴 복제) */}
        <div className="mt-8 mb-12">
          <p className="rounded-xl bg-electric/5 border border-electric/20 px-4 py-3 text-xs leading-5 text-muted-blue">
            <strong className="text-navy">2027 확정:</strong> 국민연금 총 10.0%(근로자
            5.0%, 연금개혁법 법정 스케줄)·최저임금 시급{" "}
            {MIN_WAGE_2027.toLocaleString("ko-KR")}원(고용노동부 고시 제2026-60호).{" "}
            <strong className="text-navy">미확정(2026 기준 준용):</strong> 건강보험(통상
            9월 건정심 의결)·장기요양·산재 — 확정 고시 즉시 갱신합니다. 고용보험
            실업급여 요율 1.8%(근로자 0.9%)는 현행 유지 중입니다. 올해 확정 요율은{" "}
            <Link
              href="/social-insurance-rates-2026"
              className="font-bold text-electric hover:underline"
            >
              2026 요율표
            </Link>
            에서 확인하세요.
          </p>
        </div>

        {/* 연봉별 시뮬 — 2027 요율 (건보·장기요양은 2026 준용) */}
        <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">
            연봉별 월 4대보험료 시뮬 (2027)
          </h2>
          <p className="text-sm text-faint-blue mb-6">
            본인 부담 기준. &ldquo;2026 대비&rdquo;는 연금 5.0% 인상으로 늘어나는 월
            부담분.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-canvas-200">
                  <th className="py-3 px-2 text-left text-navy font-bold">연봉</th>
                  <th className="py-3 px-2 text-right text-navy font-bold">국민연금</th>
                  <th className="py-3 px-2 text-right text-navy font-bold">건강+장기</th>
                  <th className="py-3 px-2 text-right text-navy font-bold">고용</th>
                  <th className="py-3 px-2 text-right text-navy font-bold">합계</th>
                  <th className="py-3 px-2 text-right text-navy font-bold">2026 대비</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_SALARIES.map(({ salary, monthly }) => {
                  const ins = calculateInsurance2027(monthly);
                  return (
                    <tr key={salary} className="border-b border-canvas">
                      <td className="py-3 px-2 font-bold text-navy">
                        {(salary / 10000).toLocaleString("ko-KR")}만
                      </td>
                      <td className="py-3 px-2 text-right text-muted-blue font-mono">
                        {ins.pension.toLocaleString("ko-KR")}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-blue font-mono">
                        {(ins.health + ins.longTermCare).toLocaleString("ko-KR")}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-blue font-mono">
                        {ins.employment.toLocaleString("ko-KR")}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-electric font-mono">
                        {ins.total.toLocaleString("ko-KR")}원
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-navy font-mono">
                        +{ins.diff2026.toLocaleString("ko-KR")}원
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-canvas rounded-xl">
            <p className="text-xs text-muted-blue">
              ※ 본인 부담만 표시. 회사 부담은 별도(산재보험 100% 회사). 건강보험·장기요양은
              2026 요율 준용 참고치이며 확정 시 갱신. 국민연금은 기준소득월액
              상한(659만원)까지만 산정. 정확한 금액은 비과세 항목·세부 조건에 따라 다름.
              최저임금 근로자(월 {MIN_WAGE_2027_MONTHLY.toLocaleString("ko-KR")}원) 기준
              시뮬은 2027 최저임금 페이지 참조.
            </p>
          </div>
        </section>

        <GuideMidAd />

        {/* CTA — 광고 아래 */}
        <Link
          href="/calc/pension-hike-2027"
          className="block mb-8 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold opacity-90 mb-2">2027년 1월 시행 확정</p>
              <h3 className="text-xl sm:text-2xl font-black mb-2">
                국민연금 인상, 내 월급에서 얼마나 더 빠지나
              </h3>
              <p className="text-sm opacity-90">
                월급만 입력하면 매달·연간 추가 부담을 즉시 계산
              </p>
            </div>
            <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
          </div>
        </Link>

        {/* 2027 관련 페이지 내부 링크 — 광고(GuideMidAd) 아래 배치 */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-navy mb-4">함께 보는 2027 페이지</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED_2027_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
              >
                <p className="font-bold text-navy text-sm flex items-center justify-between">
                  {link.title}
                  <ArrowRight className="w-4 h-4 text-electric opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-xs text-muted-blue mt-1 leading-relaxed">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 2027 관련 링크·FAQ 사이 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="mb-12">
          <CalcResultAd />
        </div>
        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-navy mb-6">자주 묻는 질문</h2>
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
                <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        <RelatedCalculators currentPath="/social-insurance-rates-2027" />

        <div className="mt-8">
          <HomeTopAd />
        </div>

        <ShareSection heading="도움이 됐다면 공유해 주세요" contentType="page" className="mt-10" />
        {/* 본문 끝 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="mt-10">
          <MultiplexAd />
        </div>
      </div>
    </main>
  );
}
