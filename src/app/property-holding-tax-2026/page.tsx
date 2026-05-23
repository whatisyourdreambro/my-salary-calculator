// src/app/property-holding-tax-2026/page.tsx
// 부동산 보유세 계산기 — 7월·9월 재산세 + 12월 종부세 시즌

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import PropertyHoldingTaxClient from "./PropertyHoldingTaxClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 부동산 보유세 계산기 — 재산세 + 종합부동산세 동시 산출",
  description:
    "공시가 10억 1주택자 보유세 약 200~280만원, 15억 약 350~500만원. 2026 재산세(7·9월) + 종합부동산세(12월) 동시 자동 계산. 공정시장가액·세부담상한·1세대1주택 특례까지 반영.",
  path: "/property-holding-tax-2026",
  keywords: [
    "부동산 보유세",
    "재산세 계산기",
    "종합부동산세 계산기",
    "2026 보유세",
    "재산세 7월",
    "재산세 9월",
    "종부세 12월",
    "1세대 1주택 종부세",
    "다주택자 종부세",
    "공시지가 보유세",
  ],
});

const FAQS = [
  {
    q: "재산세와 종합부동산세는 어떻게 다른가요?",
    a: "재산세는 모든 부동산 소유자가 매년 7월(주택 1/2)·9월(주택 1/2 + 토지)에 납부하는 지방세입니다. 종합부동산세는 공시가 합계 9억원(1세대 1주택 12억원) 초과 주택을 보유한 경우만 12월에 추가로 부과되는 국세입니다. 같은 주택에 대해 두 세금이 모두 부과될 수 있지만, 종부세는 재산세 납부분을 일부 공제합니다.",
  },
  {
    q: "공시가격과 시세는 어떻게 다른가요?",
    a: "공시가격은 정부(국토교통부)가 매년 4월 발표하는 공식 가격으로 시세의 약 60~70% 수준입니다. 보유세는 공시가격에 공정시장가액비율(60~80%)을 곱한 과세표준에 세율을 적용해 산출하므로 실제 부담률은 시세 대비 0.1~0.4% 수준입니다.",
  },
  {
    q: "1세대 1주택자 종부세 공제 12억원이 무엇인가요?",
    a: "1세대가 1주택만 보유한 경우 공시가격에서 12억원을 공제한 후 종부세를 계산합니다. 즉 공시가 12억 이하 1주택자는 종부세 부담이 0원입니다. 공시가 15억 1주택자라면 15-12=3억에 종부세율이 적용되어 부담이 크게 줄어듭니다.",
  },
  {
    q: "다주택자 종부세 세율은 어떻게 되나요?",
    a: "조정대상지역 2주택 이상 또는 비조정 3주택 이상은 중과세율(1.2~6.0% 누진)이 적용됩니다. 1주택·일반 다주택자는 일반세율(0.5~2.7%)이 적용되며 세부담상한(전년 대비 150%)으로 급격한 증가를 막습니다.",
  },
  {
    q: "세부담상한제는 어떻게 작동하나요?",
    a: "재산세는 전년 부담 대비 105~130%(공시가격 구간별), 종부세는 전년 대비 150% 이내로 증가가 제한됩니다. 공시가격이 급등해도 보유세 증가폭이 상한선을 넘지 못하도록 보호하는 장치입니다.",
  },
  {
    q: "재산세 납부 일정은 어떻게 되나요?",
    a: "주택분은 7월 16~31일(50%)과 9월 16~30일(50%) 두 번 분납됩니다. 토지·건축물은 9월 한 번에 납부하며, 종합부동산세는 12월 1~15일에 납부합니다. 위택스(wetax.go.kr) 또는 자동 이체 신청으로 편리하게 처리할 수 있습니다.",
  },
];

const HOWTO_STEPS = [
  { name: "공시가격 입력", text: "국토부 공시가격 확인 후 입력합니다 (시세의 약 60~70% 수준)." },
  { name: "주택 수 선택", text: "1주택 / 2주택 / 3주택 이상 중 선택 (다주택은 중과세 가능성)." },
  { name: "1세대 1주택 여부", text: "1세대 1주택자는 12억원 공제 + 우대세율 적용." },
  { name: "결과 확인", text: "재산세(7·9월) + 종부세(12월) 연 보유세 총액이 표시됩니다." },
];

export default function PropertyHoldingTax2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/property-holding-tax-2026", { leafName: "2026 부동산 보유세 계산기" }),
          softwareApplicationLd({
            name: "2026 부동산 보유세 계산기",
            description: "재산세 + 종합부동산세 동시 자동 산출",
            url: "/property-holding-tax-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 부동산 보유세 계산법",
            description: "공시가격·주택 수·1세대 1주택 여부로 재산세와 종부세를 한 번에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/property-holding-tax-2026" leafName="부동산 보유세 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            7·9·12월 보유세 시즌
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 부동산 보유세 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            주택 공시가격을 입력하면 7·9월 재산세와 12월 종합부동산세를 동시에 계산합니다. 1세대
            1주택 12억 공제, 다주택자 중과, 세부담상한제까지 반영. 2026년 공시가격 발표(4월) 후 본인
            연 보유세 부담을 미리 확인하세요.
          </p>
        </header>

        <HomeTopAd />

        <PropertyHoldingTaxClient />

        <CalcResultAd />

        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            보유세 = 재산세 + 종합부동산세
          </h2>
          <p>
            한국의 부동산 보유세는 두 단계로 구성됩니다. <strong>재산세</strong>는 모든 부동산 소유자가
            매년 7·9월에 납부하는 지방세이고, <strong>종합부동산세</strong>는 일정 금액 이상의 부동산을
            보유한 경우 12월에 추가로 부과되는 국세입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            2026 재산세 (주택분) 세율
          </h2>
          <ul>
            <li>과세표준 6천만원 이하: <strong>0.1%</strong></li>
            <li>6천만~1.5억: 6만원 + 6천만원 초과분의 <strong>0.15%</strong></li>
            <li>1.5억~3억: 19.5만원 + 1.5억 초과분의 <strong>0.25%</strong></li>
            <li>3억 초과: 57만원 + 3억 초과분의 <strong>0.4%</strong></li>
          </ul>
          <p>※ 1세대 1주택자는 9억원 이하 주택에 한해 0.05~0.35% 우대세율 적용 (한시 특례).</p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            2026 종합부동산세 (일반) 세율
          </h2>
          <ul>
            <li>과세표준 3억 이하: <strong>0.5%</strong></li>
            <li>3억~6억: 150만원 + 3억 초과분의 <strong>0.7%</strong></li>
            <li>6억~12억: 360만원 + 6억 초과분의 <strong>1.0%</strong></li>
            <li>12억~25억: 960만원 + 12억 초과분의 <strong>1.3%</strong></li>
            <li>25억~50억: 2,650만원 + 25억 초과분의 <strong>1.5%</strong></li>
            <li>50억~94억: 6,400만원 + 50억 초과분의 <strong>2.0%</strong></li>
            <li>94억 초과: 1억 5,200만원 + 94억 초과분의 <strong>2.7%</strong></li>
          </ul>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">절세 핵심 5가지</h2>
          <ol>
            <li><strong>1세대 1주택 특례</strong>: 12억 공제 + 우대세율 (다주택자 → 1주택 정리 검토)</li>
            <li><strong>고령자·장기보유 세액공제</strong>: 만 60세 이상·5년 이상 보유 시 종부세 20~80% 감면 (최대 합산 80%)</li>
            <li><strong>임대주택 등록</strong>: 일정 요건 충족 시 종부세 합산 배제 (8년·10년 장기 임대)</li>
            <li><strong>공동명의 활용</strong>: 부부 공동명의로 각자 공제 한도 적용</li>
            <li><strong>세부담상한제 활용</strong>: 전년 대비 150% 한도라 일시적 급등 보호</li>
          </ol>
        </section>

        <InArticleAd />

        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">함께 보면 좋은 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tools/real-estate/acquisition-tax" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">취득세 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">주택 구입 시 한 번 납부</p>
            </Link>
            <Link href="/home-loan" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">주택담보대출 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">원리금·총 이자 시뮬</p>
            </Link>
            <Link href="/tools/real-estate/dsr" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">DSR 한도 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">총부채원리금상환비율</p>
            </Link>
            <Link href="/tools/real-estate/gift-tax" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">증여세 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">가족 간 증여 한도</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
