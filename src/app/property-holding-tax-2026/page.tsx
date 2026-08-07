// src/app/property-holding-tax-2026/page.tsx
// 부동산 보유세 계산기 — 7월·9월 재산세 + 12월 종부세 시즌
// 2026-07-16 시즌 갱신: 7월분 납부기간(7/16~7/31) 시작 반영 — 납부지연가산세·
// 납부 방법·서울시 부과 규모·카드 무이자 안내 추가

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import PropertyHoldingTaxClient from "./PropertyHoldingTaxClient";

// ─────────────────────────────────────────────────────────────
// 2026년 재산세 납부기간 상수 — ★9월 2기분 시즌 때 이 블록만 갱신★
// 1) CURRENT_PERIOD를 PERIOD_SEPT로 교체하면 배지·헤더·메타 설명이 함께 바뀜
// 2) 본문의 "7월분 납부 안내" 섹션(서울시 부과 규모·카드 무이자 일정)은
//    7월 전용 수치이므로 9월 시즌 때 수동 점검 필요
// ─────────────────────────────────────────────────────────────
const PERIOD_JULY = {
  label: "7월분(1기분)",
  range: "7월 16일(목)~7월 31일(금)",
  rangeShort: "7/16~7/31",
  deadline: "7월 31일(금)",
  scope: "주택분 1/2 + 건축물·선박·항공기분",
};
const PERIOD_SEPT = {
  label: "9월분(2기분)",
  range: "9월 16일~9월 30일",
  rangeShort: "9/16~9/30",
  deadline: "9월 30일",
  scope: "주택분 나머지 1/2 + 토지분",
};
// 현재 시즌에 강조할 납부기간 — ★9월 2기분 시즌 때 PERIOD_SEPT로 교체★
const CURRENT_PERIOD = PERIOD_JULY;

export const metadata: Metadata = buildPageMetadata({
  title: "2026 부동산 보유세 계산기 — 재산세 + 종합부동산세 동시 산출",
  description: `${CURRENT_PERIOD.label} 재산세 납부기간 ${CURRENT_PERIOD.rangeShort} — 대상은 ${CURRENT_PERIOD.scope}. 공시가 10억 1주택자 보유세 약 200~280만원. 재산세(7·9월)+종합부동산세(12월) 동시 자동 계산, 공정시장가액비율·1세대 1주택 특례 반영.`,
  path: "/property-holding-tax-2026",
  keywords: [
    "부동산 보유세",
    "재산세 계산기",
    "종합부동산세 계산기",
    "2026 보유세",
    "재산세 7월",
    "재산세 납부기간",
    "재산세 9월",
    "종부세 12월",
    "재산세 카드 납부",
    "납부지연가산세",
    "위택스 재산세",
    "1세대 1주택 종부세",
    "다주택자 종부세",
    "공시지가 보유세",
  ],
  ogType: "article",
  publishedTime: "2026-05-22",
  modifiedTime: "2026-07-16",
});

const FAQS = [
  {
    q: "재산세와 종합부동산세는 어떻게 다른가요?",
    a: "재산세는 모든 부동산 소유자가 납부하는 지방세로, 7월(주택분 1/2 + 건축물·선박·항공기분)과 9월(주택분 나머지 1/2 + 토지분)에 부과됩니다. 종합부동산세는 공시가 합계 9억원(1세대 1주택 12억원) 초과 주택을 보유한 경우만 12월에 추가로 부과되는 국세입니다. 같은 주택에 대해 두 세금이 모두 부과될 수 있지만, 종부세는 재산세 납부분 중 중복 과세분을 공제합니다.",
  },
  {
    q: "공시가격과 시세는 어떻게 다른가요?",
    a: "공시가격은 정부(국토교통부)가 매년 4월 발표하는 공식 가격으로 시세의 약 60~70% 수준입니다. 보유세는 공시가격에 공정시장가액비율을 곱한 과세표준에 세율을 적용해 산출합니다. 2026년 적용 비율은 재산세의 경우 1세대 1주택 43~45%(공시 3억 이하 43%·3~6억 44%·6억 초과 45% — 전년과 동일)·다주택자와 법인은 60%, 종부세는 60%입니다.",
  },
  {
    q: "1세대 1주택자 종부세 공제 12억원이 무엇인가요?",
    a: "1세대가 1주택만 보유한 경우 공시가격에서 12억원을 공제한 후 종부세를 계산합니다. 즉 공시가 12억 이하 1주택자는 종부세 부담이 0원입니다. 공시가 15억 1주택자라면 15-12=3억에 종부세율이 적용되어 부담이 크게 줄어듭니다. 1세대 1주택이 아닌 경우에도 인별 9억원이 기본 공제됩니다(다주택자 포함, 2023년 개정).",
  },
  {
    q: "다주택자 종부세 세율은 어떻게 되나요?",
    a: "2023년 개정으로 조정대상지역 2주택 중과는 폐지되어, 2주택 이하는 일반세율(0.5~2.7%)이 적용됩니다. 중과세율은 3주택 이상 보유하면서 과세표준 12억원을 초과하는 구간부터 적용되며 해당 구간 세율은 2.0~5.0%입니다. 종부세는 세부담상한(전년 대비 150%)으로 급격한 증가를 막습니다.",
  },
  {
    q: "세부담상한제는 어떻게 작동하나요?",
    a: "종부세는 전년 대비 150% 이내로 증가가 제한됩니다. 주택분 재산세의 옛 세부담상한제(105~130%)는 2024년 폐지되었고, 대신 과세표준상한제가 시행되어 과세표준 증가가 직전 연도 대비 연 0~5% 이내로 제한됩니다(토지·건축물분 재산세는 150% 상한 유지). 공시가격이 급등해도 보유세가 한 번에 뛰지 않도록 보호하는 장치입니다.",
  },
  {
    q: "재산세 납부 일정은 어떻게 되나요?",
    a: `주택분은 7월(${PERIOD_JULY.range}, 1/2)과 9월(${PERIOD_SEPT.range}, 나머지 1/2) 두 번 분납이 원칙이지만, 주택분 세액이 20만원 이하면 자치단체 조례에 따라 7월에 전액 일시 부과될 수 있습니다. 건축물·선박·항공기분은 7월, 토지분은 9월에 납부하며, 종합부동산세는 12월 1~15일에 납부합니다. 위택스(wetax.go.kr, 전국)나 서울시 이택스·STAX 앱, 간편결제·은행 ATM으로 납부할 수 있고 자동이체 신청도 가능합니다.`,
  },
  {
    q: "재산세를 기한 내에 못 내면 가산세가 얼마나 붙나요?",
    a: `납부기한이 지나면 즉시 3%의 납부지연가산세가 붙습니다. 세목별 세액이 45만원 이상이면 여기에 매월 0.66%가 추가로 붙고(최대 60개월), 45만원 미만이면 3%만 부과됩니다. 2026년 7월분 재산세 기한은 ${PERIOD_JULY.deadline}이므로 하루라도 늦지 않게 납부하는 것이 좋습니다.`,
  },
  {
    q: "재산세를 신용카드로 내면 수수료가 있나요?",
    a: "없습니다. 재산세 같은 지방세는 신용카드로 납부해도 수수료가 0원입니다(납부대행 수수료가 붙는 국세와 다른 점). 2026년 7월 기준 서울시 이택스에는 카드사 무이자(부분무이자) 할부 이벤트도 안내되어 있습니다 — 우리·현대·삼성·롯데·KB국민 7/1~7/31, BC 7/1~9/30, NH농협 연중. 캐시백·적립 등 세부 혜택 조건은 카드사·시기별로 달라지므로 결제 전 각 카드사 앱에서 확인하세요.",
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
            {CURRENT_PERIOD.label} 재산세 납부기간 {CURRENT_PERIOD.rangeShort}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 부동산 보유세 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            주택 공시가격을 입력하면 7·9월 재산세와 12월 종합부동산세를 동시에 계산합니다. 1세대
            1주택 12억 공제, 다주택자 공제 9억, 공정시장가액비율 특례까지 반영.{" "}
            {CURRENT_PERIOD.label} 재산세 고지서를 받았다면 계산기로 내 세액 수준을 확인하고,{" "}
            {CURRENT_PERIOD.deadline}까지 위택스·이택스에서 납부하세요.
          </p>
        </header>

        <HomeTopAd />

        <PropertyHoldingTaxClient />

        <CalcResultAd />

        {/* 2026-07-16 시즌 섹션 — 서울시 부과 규모·카드 무이자 일정은 7월 전용 수치 (9월 2기분 시 갱신) */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            2026년 7월분 재산세 — {PERIOD_JULY.range} 납부
          </h2>
          <p>
            2026년 7월분 재산세 납부기간은 <strong>{PERIOD_JULY.range}</strong>입니다. 이번 7월분
            대상은 <strong>{PERIOD_JULY.scope}</strong>이고, 토지분과 주택분 나머지 1/2(2기분)은{" "}
            {PERIOD_SEPT.range}에 부과됩니다. 주택분 세액이 20만원 이하이면 자치단체 조례에 따라
            7월에 전액 일시 부과될 수 있습니다.
          </p>

          <h3 className="text-lg font-black text-navy dark:text-canvas-50 mt-8">
            기한을 넘기면 — 즉시 3% 납부지연가산세
          </h3>
          <p>
            납부기한({PERIOD_JULY.deadline})이 지나면 <strong>즉시 3%의 납부지연가산세</strong>가
            붙습니다. 세목별 세액이 45만원 이상이면 여기에 <strong>매월 0.66%가 추가</strong>로
            붙고(최대 60개월), 45만원 미만이면 3%만 부과됩니다. 하루 차이로 세금의 3%가 더 나가는
            구조이므로, 기한 내 납부가 가장 확실한 절세입니다.
          </p>

          <h3 className="text-lg font-black text-navy dark:text-canvas-50 mt-8">
            서울시 7월분 부과 규모 — 2조 6,387억원, 고지서 500만건
          </h3>
          <p>
            서울시는 올해 7월분 재산세 <strong>2조 6,387억원</strong>을 확정하고 고지서 약{" "}
            <strong>500만건</strong>을 발송했습니다. 전년 대비 <strong>11.7% 늘어난</strong> 규모로,
            이 중 주택분이 1조 9,545억원(+15.0%) — 공시가격 상승이 주된 원인입니다. 자치구별로는
            강남구 4,654억원, 서초구 3,093억원, 송파구 2,838억원 순으로 많습니다. 고지서 금액이
            작년보다 늘었다면, 위 계산기에 올해 공시가격을 넣어 세액이 맞게 나온 것인지 확인해
            보세요.
          </p>

          <h3 className="text-lg font-black text-navy dark:text-canvas-50 mt-8">
            납부 방법 — 신용카드 수수료 0원
          </h3>
          <ul>
            <li><strong>위택스(wetax.go.kr)</strong> — 전국 공통 온라인 납부</li>
            <li><strong>이택스(etax.seoul.go.kr)·STAX 앱</strong> — 서울시</li>
            <li>네이버페이·카카오페이 등 간편결제, 은행 ATM</li>
          </ul>
          <p>
            재산세는 지방세라 <strong>신용카드로 내도 납부 수수료가 0원</strong>입니다(납부대행
            수수료가 붙는 국세와 다른 점). 서울시 이택스에는 카드사 무이자(부분무이자) 할부
            이벤트도 안내되어 있습니다 — 우리·현대·삼성·롯데·KB국민 카드는 7/1~7/31, BC는
            7/1~9/30, NH농협은 연중 적용. 캐시백·적립 등 세부 혜택 조건은 카드사와 시기에 따라
            달라지므로 결제 전 각 카드사 앱에서 확인하세요.
          </p>
          <p>
            고지서 1장의 세액이 250만원을 초과하면 지방세법에 따라 분할납부를 신청할 수 있는
            것으로 안내됩니다. 신청 절차는 고지서 안내면 또는 관할 자치단체·위택스에서 확인할 수
            있습니다.
          </p>
        </section>

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
          <p>
            ※ 1세대 1주택자는 공시 9억원 이하 주택에 한해 표준세율보다 구간별 0.05%p 낮은
            0.05~0.35% 특례세율이 적용됩니다 — 2026년 납부분까지 한시 적용되는 것으로 안내되어
            있습니다.
          </p>

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
            <li><strong>1세대 1주택 특례</strong>: 종부세 12억 공제 + 재산세 특례세율·공정시장가액비율 43~45% (다주택자 → 1주택 정리 검토)</li>
            <li><strong>고령자·장기보유 세액공제</strong>: 1세대 1주택자 종부세 한정 — 고령자(60세 20%·65세 30%·70세 40%)와 장기보유(5년 20%·10년 40%·15년 50%)는 각각 독립 적용되며 어느 한쪽만 충족해도 공제, 합산 한도 80%</li>
            <li><strong>임대주택 등록</strong>: 일정 요건 충족 시 종부세 합산 배제 (8년·10년 장기 임대)</li>
            <li><strong>공동명의 활용</strong>: 부부 공동명의로 각자 공제 한도 적용</li>
            <li><strong>종부세 세부담상한</strong>: 전년 대비 150% 한도라 일시적 급등 보호 (재산세는 과세표준상한제 연 0~5%)</li>
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

        {/* 14차 — RelatedCalculators 추가 (dead-end 차단) */}
        <RelatedCalculators currentPath="/property-holding-tax-2026" title="보유세와 함께 보면 좋은 도구" />

        {/* 14차 — ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons title="2026 부동산 보유세 계산기" description="재산세 + 종부세 통합 자동 산출" />
        </div>

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
