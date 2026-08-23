// src/app/monthly/[amount]/page.tsx
//
// 월급(세전 월 기본급) 기준 실수령액 리포트 — /salary/[amount](연봉 축)의 자매 축.
// "월급 300만원 실수령액" 계열 쿼리는 연봉 쿼리에 필적하는 볼륨인데 전용 URL이
// 없었다 (2026-08-15 수익 개선 Phase 3 신설).
//
// 도어웨이 방지 — /salary 와 본문 완전 차별화:
//   · 상여금 시나리오별 연봉 환산표 (월급×12 ≠ 연봉인 회사 대응)
//   · 시급·주급·일급 환산 + 최저임금 대비 배수
//   · 국민연금 기준소득월액 상한(월 659만, 2026-07~) 도달 여부 안내
// 정적 생성: 월 160만~1,000만 10만 단위 + 1,050만~2,000만 50만 단위 (dynamicParams=false)

import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import SalaryResultCard from "@/components/SalaryResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedCompanies from "@/components/RelatedCompanies";
import SeasonalLinks from "@/app/table/2026/SeasonalLinks";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import FavoritesButton from "@/components/FavoritesButton";
// InArticleAd 는 SalaryResultCard 내부(결과 직하)가 담당 — 여기서 또 쓰면 dedup 사망
import { CalcResultAd, GuideMidAd, HomeTopAd, Display2Ad } from "@/components/AdPlacement";
import NextActions from "@/components/NextActions";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ChevronRight, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import { isStaticSalaryAmount, sitemapGridAmounts } from "@/lib/salaryStaticParams";
import { getStaticMonthlyAmounts, MIN_MONTHLY, MAX_MONTHLY } from "@/lib/monthlyStaticParams";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";

export const dynamicParams = false;

export function generateStaticParams(): { amount: string }[] {
  return getStaticMonthlyAmounts().map((amount) => ({ amount: String(amount) }));
}

function parseMonthlyParam(param: string): number | null {
  if (!/^\d+$/.test(param)) return null;
  const amount = parseInt(param, 10);
  if (!Number.isFinite(amount) || amount < MIN_MONTHLY || amount > MAX_MONTHLY) {
    return null;
  }
  return amount;
}

/** 연봉 정적 집합(50만 격자)으로 스냅 — /salary 링크 404 방지 */
function snapToSalaryGrid(annual: number): number {
  if (isStaticSalaryAmount(annual)) return annual;
  const grid = Array.from(new Set(sitemapGridAmounts())).sort((a, b) => a - b);
  let best = grid[0];
  for (const g of grid) {
    if (Math.abs(g - annual) < Math.abs(best - annual)) best = g;
  }
  return best;
}

/** 인근 월급 링크 — 격자 위 값만 (±10만/±20만/±50만/±100만) */
function monthlyNeighbors(amount: number): number[] {
  const set = new Set(getStaticMonthlyAmounts());
  const out: number[] = [];
  for (const off of [-1_000_000, -500_000, -200_000, -100_000, 100_000, 200_000, 500_000, 1_000_000]) {
    const v = amount + off;
    if (set.has(v) && v !== amount) out.push(v);
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

const fmtManwon = (won: number) =>
  Math.round(won / 10_000).toLocaleString("ko-KR");

type Props = { params: { amount: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const monthly = parseMonthlyParam(params.amount);
  if (monthly === null) {
    return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
  }
  const annual = monthly * 12;
  const tax = calculateSalary2026(annual, 200000, 1, 0);
  const m = fmtManwon(monthly);
  const net = fmtManwon(tax.netPay);
  return buildPageMetadata({
    title: `월급 ${m}만원 실수령액 — 세후 월 ${net}만원 (2026 기준)`,
    description: `세전 월급 ${m}만원의 2026년 실수령액은 약 ${net}만원. 4대보험·소득세 공제 내역, 상여금 포함 연봉 환산표, 시급·주급 환산까지 월급 기준으로 정리했습니다.`,
    path: `/monthly/${monthly}`,
    keywords: [
      `월급 ${m}만원 실수령액`,
      `월급 ${m} 실수령`,
      `세전 ${m}만원 세후`,
      `월급 ${m}만원 연봉`,
      `${m}만원 실수령액`,
    ],
  });
}

export default function MonthlyPage({ params }: Props) {
  const monthly = parseMonthlyParam(params.amount);
  if (monthly === null) notFound();

  const annual = monthly * 12;
  const tax = calculateSalary2026(annual, 200000, 1, 0);
  const m = fmtManwon(monthly);
  const netManwon = fmtManwon(tax.netPay);
  const deductManwon = fmtManwon(tax.totalDeductions);

  // 시급·주급·일급 환산 (근로기준법 월 소정근로 209시간 기준)
  const hourly = Math.round(monthly / 209);
  const daily = Math.round((monthly / 209) * 8);
  const weekly = Math.round((monthly / 209) * 40);

  // 국민연금 상한(월 659만, 2026-07-01~) 도달 여부
  const pensionCapped = monthly >= PENSION_BASE_2026.MAX_MONTHLY;

  // 상여금 시나리오별 연봉 환산 (기본급 대비 %)
  const bonusScenarios = [0, 100, 200, 400, 600, 800].map((pct) => ({
    pct,
    annual: Math.round(annual + (monthly * pct) / 100),
  }));

  const salaryHref = `/salary/${snapToSalaryGrid(annual)}`;
  const neighbors = monthlyNeighbors(monthly);

  const faqItems = [
    {
      question: `월급 ${m}만원의 실수령액은 얼마인가요?`,
      answer: `세전 월급 ${m}만원 기준 2026년 실수령액은 약 ${netManwon}만원입니다. 국민연금 ${(INSURANCE_RATES_2026.NATIONAL_PENSION * 100).toFixed(2)}%, 건강보험 ${(INSURANCE_RATES_2026.HEALTH_INSURANCE * 100).toFixed(3)}%(+장기요양), 고용보험 ${(INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE * 100).toFixed(1)}%와 근로소득세·지방소득세를 공제한 값입니다 (비과세 식대 20만원, 본인 1인 공제 기준).`,
    },
    {
      question: "월급 실수령액과 '연봉 ÷ 12'가 왜 다른가요?",
      answer: `상여금·성과급이 별도인 회사는 연봉이 월급×12보다 큽니다. 예를 들어 월 기본급 ${m}만원에 상여 400%면 연봉은 약 ${fmtManwon(annual + monthly * 4)}만원이 됩니다. 아래 상여금 시나리오 표에서 본인 연봉 구조로 확인하세요.`,
    },
    {
      question: `월급 ${m}만원은 시급으로 얼마인가요?`,
      answer: `근로기준법 월 소정근로시간 209시간 기준으로 시급 약 ${hourly.toLocaleString("ko-KR")}원입니다. 주급(40시간)으로는 약 ${fmtManwon(weekly)}만원, 일급(8시간)은 약 ${Math.round(daily / 10000)}만원 수준입니다.`,
    },
    {
      question: "4대보험은 월급 기준으로 어떻게 계산되나요?",
      answer: pensionCapped
        ? `국민연금은 기준소득월액 상한(2026년 7월부터 월 ${fmtManwon(PENSION_BASE_2026.MAX_MONTHLY)}만원)이 있어, 월급 ${m}만원은 상한을 초과하므로 상한 기준으로만 부과됩니다. 건강보험·고용보험은 상한 없이 보수월액 비례로 부과됩니다.`
        : `국민연금·건강보험·고용보험 모두 세전 보수월액(비과세 제외)에 요율을 곱해 매월 부과됩니다. 국민연금에는 기준소득월액 상한(2026년 7월부터 월 ${fmtManwon(PENSION_BASE_2026.MAX_MONTHLY)}만원)이 있으며, 월급 ${m}만원은 상한 미만이라 전액 부과 대상입니다.`,
    },
  ];

  const breadcrumbItems = [
    { name: "홈", path: "/" },
    { name: "월급 실수령액", path: "/table/2026/monthly" },
    { name: `월급 ${m}만원`, path: `/monthly/${monthly}` },
  ];

  return (
    <main className="min-h-screen bg-canvas pb-20 pt-24">
      <JsonLd
        data={[
          breadcrumbLd(breadcrumbItems),
          faqLd(faqItems),
          speakableLd({
            url: `https://www.moneysalary.com/monthly/${monthly}`,
            cssSelectors: [".speakable-summary", ".faq-answer"],
          }),
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <h1 className="text-3xl sm:text-4xl font-black text-navy text-center mb-4 leading-tight">
          월급 <span className="text-primary">{m}만원</span>의
          <br />
          실수령액 분석
        </h1>

        <div className="flex justify-center mb-4">
          <FavoritesButton
            path={`/monthly/${monthly}`}
            title={`월급 ${m}만원 실수령액`}
            variant="icon"
          />
        </div>

        <p className="speakable-summary max-w-xl mx-auto text-center text-sm text-muted-blue mb-8">
          세전 월급 {m}만원의 2026년 실수령액은 약 {netManwon}만원, 4대보험·세금
          공제는 월 약 {deductManwon}만원입니다.
        </p>

        <SalaryResultCard
          monthlyNet={tax.netPay}
          totalDeduction={tax.totalDeductions}
          breakdown={{
            pension: tax.nationalPension,
            health: tax.healthInsurance,
            longTermCare: tax.longTermCare,
            employment: tax.employmentInsurance,
            incomeTax: tax.incomeTax,
            localTax: tax.localIncomeTax,
          }}
        />

        <div className="mt-6">
          <CalcResultAd />
        </div>

        <div className="mt-2">
          <NextActions annualSalary={annual} category="salary" />
        </div>

        {/* ── 월급 고유 콘텐츠 ① 상여금 시나리오별 연봉 환산 ── */}
        <section className="mt-12 p-6 bg-white rounded-2xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-3">
            상여금 포함 연봉 환산표 — 월급 {m}만원의 진짜 연봉
          </h2>
          <p className="text-sm text-muted-blue leading-relaxed mb-5">
            상여금이 기본급과 별도로 지급되는 회사라면 연봉은 월급×12보다
            큽니다. 본인 회사의 상여 비율(기본급 대비 연간 %)로 확인하세요.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-canvas-200 text-left text-faint-blue">
                  <th className="py-2 pr-4">상여 비율</th>
                  <th className="py-2 pr-4">환산 연봉</th>
                  <th className="py-2">연봉 리포트</th>
                </tr>
              </thead>
              <tbody>
                {bonusScenarios.map((s) => {
                  const href = `/salary/${snapToSalaryGrid(s.annual)}`;
                  return (
                    <tr key={s.pct} className="border-b border-canvas-100">
                      <td className="py-2.5 pr-4 font-bold text-navy">
                        {s.pct === 0 ? "없음 (월급×12)" : `${s.pct}%`}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        약 {fmtManwon(s.annual)}만원
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                        >
                          실수령 보기 <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 실험 #1 (docs/ad-experiments.md, 운영자 승인 2026-08-17): display-2
            추가 배치 — 상여금 환산표 직후, 기존 광고와 1스크린+ 간격.
            env NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2 미설정 시 자동 미렌더. */}
        <div className="mt-8">
          <Display2Ad />
        </div>

        {/* ── 월급 고유 콘텐츠 ② 시급·주급 환산 + 국민연금 상한 ── */}
        <section className="mt-8 p-6 bg-white rounded-2xl border border-canvas-200">
          <h2 className="text-xl font-black text-navy mb-4">
            시급·주급으로 환산하면?
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-5">
            <div className="p-4 bg-canvas-50 rounded-xl">
              <p className="text-xs text-faint-blue mb-1">시급 (209시간)</p>
              <p className="font-black text-navy tabular-nums">
                {hourly.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="p-4 bg-canvas-50 rounded-xl">
              <p className="text-xs text-faint-blue mb-1">일급 (8시간)</p>
              <p className="font-black text-navy tabular-nums">
                {daily.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="p-4 bg-canvas-50 rounded-xl">
              <p className="text-xs text-faint-blue mb-1">주급 (40시간)</p>
              <p className="font-black text-navy tabular-nums">
                {weekly.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-blue leading-relaxed">
            {pensionCapped ? (
              <>
                월급 {m}만원은 국민연금 기준소득월액{" "}
                <strong>
                  상한(월 {fmtManwon(PENSION_BASE_2026.MAX_MONTHLY)}만원,
                  2026년 7월 인상)
                </strong>
                을 넘어, 국민연금은 상한 기준으로만 부과됩니다. 월급이 더
                올라도 국민연금 공제액은 늘지 않습니다.
              </>
            ) : (
              <>
                4대보험은 세전 보수월액 기준으로 매월 부과됩니다. 국민연금
                상한(월 {fmtManwon(PENSION_BASE_2026.MAX_MONTHLY)}만원, 2026년
                7월 인상)까지는 월급에 비례해 공제액이 늘어납니다.
              </>
            )}{" "}
            시급 환산은 근로기준법 월 소정근로 209시간(주휴 포함) 기준입니다.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group p-5 bg-white rounded-xl border border-canvas-200"
              >
                <summary className="cursor-pointer text-sm font-bold text-navy flex items-start justify-between gap-3">
                  <span>{item.question}</span>
                  <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
                </summary>
                <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <GuideMidAd />
        </div>

        {/* 연봉 축 크로스링크 */}
        <section className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
          <h2 className="text-lg font-black text-navy mb-2">
            연봉 기준으로도 확인해 보세요
          </h2>
          <p className="text-sm text-muted-blue mb-4">
            월급 {m}만원 × 12개월 = 연봉 약 {fmtManwon(annual)}만원의 상세
            리포트 (자산 시뮬레이션·연봉 티어 포함)
          </p>
          <Link
            href={salaryHref}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition"
          >
            연봉 {fmtManwon(annual)}만원 리포트 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* 인근 월급 */}
        {neighbors.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black text-navy mb-4">
              다른 월급 실수령액
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {neighbors.map((n) => (
                <Link
                  key={n}
                  href={`/monthly/${n}`}
                  className="p-3 bg-white rounded-xl border border-canvas-200 text-center text-sm font-bold text-navy hover:border-primary transition"
                >
                  월급 {fmtManwon(n)}만원
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />
        </div>

        <div className="mt-6">
          <HomeTopAd />
        </div>

        <ShareSection contentType="salary_result" className="mt-8" />

        {/* 이 월급대 실제 회사 — 연봉 환산 ±15% 매칭. /salary/[amount]:338 검증
            패턴 복제 (G5 메쉬, 2026-08-23). 광고 블록 전부 아래 위치 준수. */}
        <RelatedCompanies
          currentId={`__monthly-${monthly}`}
          targetSalary={annual}
          limit={6}
          title="이 월급대의 실제 회사들"
        />

        <RelatedCalculators
          currentPath={`/monthly/${monthly}`}
          limit={4}
          title="함께 보면 좋은 계산기"
        />

        {/* 시즌 크로스링크 — 표 4종 공용 블록 재사용 (G8 메쉬, 2026-08-23) */}
        <SeasonalLinks />
      </div>
    </main>
  );
}
