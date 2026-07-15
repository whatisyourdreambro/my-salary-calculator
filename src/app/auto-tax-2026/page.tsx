// src/app/auto-tax-2026/page.tsx
// 자동차세 계산기 — 6월 8~30일 / 12월 9~31일 시즌 트래픽 폭증 키워드 전용 페이지

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
import AutoTaxClient from "./AutoTaxClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 자동차세 계산기 — 배기량·차령별 정확 산출 (6·12월 납부)",
  description:
    "2026 자동차세 자동 계산. 배기량(cc)·차령(년) 입력하면 1월 연납 공제(2~12월분 5%, 실질 약 4.6%) 포함 정확한 자동차세를 즉시 산출. 6월/12월 분납 금액 비교까지.",
  path: "/auto-tax-2026",
  keywords: [
    "자동차세 계산기",
    "2026 자동차세",
    "자동차세 조회",
    "자동차세 연납 할인",
    "자동차세 분납",
    "배기량별 자동차세",
    "전기차 자동차세",
    "자동차세 6월 12월",
  ],
});

const FAQS = [
  {
    q: "자동차세는 언제 납부하나요?",
    a: "자동차세는 1년에 두 번 분납합니다. 납부기간은 1기분(1~6월분) 6월 16~30일, 2기분(7~12월분) 12월 16~31일이며(고지서는 납기 개시 전 발송), 납부 기한은 1기분 6월 30일·2기분 12월 31일입니다. 1월에 연납하면 2~12월분의 5%(실질 약 4.6%)를 공제받을 수 있습니다.",
  },
  {
    q: "자동차세 연납 할인은 얼마나 되나요?",
    a: "2026년 기준 1월 16~31일에 연납을 신청하면 2~12월분 세액의 5%(연세액 대비 실질 약 4.6%)를 공제받습니다. 예: 2,000cc 차량 연 자동차세가 약 52만원이면 연납 시 약 49만 6천원으로 약 2만 4천원 절약됩니다. 3월(16~31일)·6월(16~30일)·9월(16~30일)에도 연납 신청이 가능하지만 남은 기간분만 공제되어 공제액이 줄어듭니다.",
  },
  {
    q: "자동차세는 어떻게 계산되나요?",
    a: "승용차 자동차세 = 배기량(cc) × cc당 세율입니다. 비영업용 기준 1,000cc 이하 80원/cc, 1,600cc 이하 140원/cc, 1,600cc 초과 200원/cc입니다. 여기에 지방교육세 30%가 추가됩니다. 차량 등록 후 3년차부터 매년 5%씩 12년차까지 최대 50% 경감됩니다.",
  },
  {
    q: "전기차·하이브리드 자동차세는 어떻게 다른가요?",
    a: "전기차는 배기량이 없으므로 비영업용 승용 기준 본세 연 10만원 + 지방교육세 3만원 = 총 13만원 정액으로 부과됩니다. 하이브리드는 배기량 기준으로 계산되며 전기차에 비해 세금이 높습니다. 친환경차 세제 혜택은 매년 변동될 수 있으니 행정안전부·지자체 공고를 확인하세요(자동차세는 지방세입니다).",
  },
  {
    q: "중고차 매매 시 자동차세는 누가 내나요?",
    a: "자동차세는 6월 1일·12월 1일 기준 등록 명의자에게 부과됩니다. 다만 매매로 소유권 이전등록을 하면 지방세법에 따라 지자체가 소유 기간별로 일할계산해 양도인·양수인에게 각각 부과합니다(당사자 간 관행이 아닌 법정 제도). 즉 매도자는 매도일까지, 매수자는 매수일부터의 세금을 부담합니다.",
  },
  {
    q: "차령(보유 연수)에 따른 경감은 어떻게 되나요?",
    a: "비영업용 승용차는 신차 등록 후 3년차부터 매년 5%씩 경감되어 최대 50%까지 줄어듭니다. 즉 12년 이상 보유한 차량은 자동차세의 50%만 납부합니다. 본 계산기는 차령을 입력하면 경감률을 자동 반영합니다.",
  },
  {
    q: "자동차세 미납 시 어떻게 되나요?",
    a: "납부 기한 경과 시 3%의 납부지연가산세가 부과되며, 고지서별 세액이 45만원 이상이면 1개월마다 0.66%가 추가됩니다(최대 60개월 — 일반 승용차 기분 세액은 대부분 45만원 미만이라 월 가산은 없는 경우가 많습니다). 체납이 누적되면 번호판 영치, 차량·예금 압류, 압류로 인한 이전등록 제한 등의 처분이 가능합니다. 위택스 또는 지방세 모바일 앱으로 즉시 납부할 수 있습니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "배기량(cc) 입력",
    text: "차량 등록증의 배기량(cc)을 입력합니다. 예: 1999cc, 2497cc",
  },
  {
    name: "차령(보유 연수) 선택",
    text: "신차 등록일부터 현재까지의 연수를 선택합니다. 3년차부터 매년 5%씩 경감됩니다.",
  },
  {
    name: "연납 여부 선택",
    text: "1월 연납 시 2~12월분 5% 공제(실질 약 4.6%)를 적용합니다. 분납은 6월·12월 각각 절반씩 납부합니다.",
  },
  {
    name: "결과 확인",
    text: "본세·지방교육세·연납 할인 적용 후 최종 자동차세를 확인하고 분납 시 6월·12월 각각 납부할 금액을 비교합니다.",
  },
];

export default function AutoTax2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/auto-tax-2026", { leafName: "2026 자동차세 계산기" }),
          softwareApplicationLd({
            name: "2026 자동차세 계산기",
            description: "배기량·차령·연납 여부로 정확한 자동차세 산출",
            url: "/auto-tax-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 자동차세 계산하는 방법",
            description: "배기량·차령을 입력해 비영업용 승용차 자동차세를 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/auto-tax-2026" leafName="자동차세 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            2026 시즌 페이지
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 자동차세 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            배기량(cc)과 차령을 입력하면 비영업용 승용차의 정확한 자동차세를 즉시 계산합니다. 1월
            연납 시 2~12월분 5% 공제(실질 약 4.6%)를 자동 반영하고, 6월·12월 분납 금액까지 비교할
            수 있습니다. 2026년 기준 비영업용 승용차 cc당 세율과 차령별 경감(3년차부터 매년 5%,
            최대 50%)이 적용됩니다.
          </p>
        </header>

        <HomeTopAd />

        <AutoTaxClient />

        <CalcResultAd />

        {/* 가이드 콘텐츠 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            자동차세 계산 공식
          </h2>
          <p>
            <strong>1단계 — 본세 계산:</strong> 비영업용 승용차의 자동차세는 배기량(cc)에 cc당 세율을
            곱해 산출합니다. 1,000cc 이하 80원/cc, 1,000~1,600cc 140원/cc, 1,600cc 초과 200원/cc.
            예를 들어 2,000cc 차량은 2,000 × 200 = 400,000원이 본세입니다.
          </p>
          <p>
            <strong>2단계 — 차령 경감:</strong> 신차 등록 후 3년차부터 매년 5%씩 차감되어 12년차까지
            최대 50%가 경감됩니다. 예: 5년차 차량은 본세에서 10% 차감 → 400,000원 × 90% = 360,000원.
          </p>
          <p>
            <strong>3단계 — 지방교육세 가산:</strong> 본세의 30%가 지방교육세로 추가됩니다. 360,000원
            × 30% = 108,000원. 따라서 최종 자동차세 = 360,000 + 108,000 = 468,000원.
          </p>
          <p>
            <strong>4단계 — 연납 공제:</strong> 1월 16~31일에 연납 신청·일시납하면
            2~12월분(11개월분)의 5%, 즉 연세액 대비 실질 약 4.6%가 공제됩니다. 위 예시
            468,000원 기준 공제액 약 21,450원 →{" "}
            <strong className="text-electric">약 446,550원</strong>으로 절약됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            6월·12월 분납 vs 1월 연납 — 어느 게 유리한가?
          </h2>
          <p>
            연납은 실질 약 4.6% 공제라는 즉각적인 이득이 있지만, 1월에 현금이 묶이는 단점이 있습니다.
            반면 분납은 6월·12월 두 번 나눠 내므로 현금 흐름 관리에 유리합니다. 연 50만원 이상 자동차세가
            나오는 2,000cc 이상 차량 보유자는 연납 공제 효과가 크므로 1월 연납을 추천합니다. 분납이
            기본이며 별도 신청 없이도 분납 고지서가 자동 발송됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            전기차·친환경차의 자동차세 혜택
          </h2>
          <p>
            전기차는 배기량 기준 과세 대신 비영업용 승용 기준 본세 연 10만원 정액으로 부과됩니다.
            지방교육세 30%(3만원)를 더해 총 13만원. 일반 2,000cc 가솔린차(연 약 52만원)에 비해
            연간 약 39만원의 자동차세 절감 효과가 있어, 5년 운영 시 약 195만원의 세제 혜택을
            누립니다. 하이브리드는 일반 가솔린·디젤차와 동일하게 배기량 기준 과세됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            중고차 매매 시 자동차세 분담
          </h2>
          <p>
            자동차세는 매년 6월 1일·12월 1일 기준 등록 명의자에게 부과됩니다. 그 사이에 매매가 이뤄지면
            일할 계산해서 매도자·매수자가 분담하는 것이 관행입니다. 예: 5월 15일 매매 시 1~5월 15일분은
            매도자가, 5월 16일~6월 30일분은 매수자가 부담. 매매 계약서에 정산 방식을 명시하는 것이
            분쟁을 막는 핵심입니다.
          </p>
        </section>

        <InArticleAd />

        {/* FAQ */}
        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* 14차 — RelatedCalculators 자동 추천 추가 (dead-end 차단) */}
        <RelatedCalculators
          currentPath="/auto-tax-2026"
          title="이 계산과 함께 보면 좋은 도구"
        />

        {/* 14차 — ShareButtons 추가 (공유 유입) */}
        <div className="my-8">
          <ShareButtons title="2026 자동차세 계산기" description="배기량·차령별 정확한 자동차세 1분 안에 계산" />
        </div>

        {/* 관련 도구 */}
        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            함께 보면 좋은 계산기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/tools/real-estate/acquisition-tax"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                자동차 취득세 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                차량 구입 시 취득세 7% 산출
              </p>
            </Link>
            <Link
              href="/calc/property-tax-quick"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                재산세 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                7월·9월 부과 주택·건물 재산세
              </p>
            </Link>
            <Link
              href="/car-loan"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                자동차 할부 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                원리금 균등·체증 시뮬레이션
              </p>
            </Link>
            <Link
              href="/"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                연봉 실수령액 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                4대보험·소득세 자동 공제
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
