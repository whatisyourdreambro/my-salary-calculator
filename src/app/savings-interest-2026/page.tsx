// src/app/savings-interest-2026/page.tsx
// 적금·예금 이자 계산기 — 금융 카테고리 고RPM 키워드

import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import SavingsInterestClient from "./SavingsInterestClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 적금·예금 이자 계산기 — 세후 만기 원리금 즉시 산출",
  description:
    "월 50만원 × 24개월 연 4% 적금이면 만기 약 1,250만원·세후 이자 약 105만원. 정기적금/정기예금, 단리/복리 모두 지원. 이자소득세 15.4% 자동 차감 + 비과세·세금우대 옵션.",
  path: "/savings-interest-2026",
  keywords: [
    "적금 이자 계산기",
    "예금 이자 계산기",
    "정기적금 만기",
    "정기예금 이자",
    "복리 계산기",
    "단리 계산기",
    "이자소득세 15.4%",
    "비과세 적금",
    "세금우대 적금",
    "적금 만기 원리금",
  ],
});

const FAQS = [
  {
    q: "적금과 예금의 차이는 무엇인가요?",
    a: "정기적금은 매월 일정액을 적립해 만기 시 원리금을 받는 상품입니다. 반면 정기예금은 한 번에 목돈을 예치해 만기 시 원리금을 받습니다. 같은 금리라도 정기예금 이자가 적금보다 큽니다(예금은 처음부터 만기까지 전액 운용, 적금은 후반에 입금된 돈은 짧게 운용되기 때문). 목돈이 있으면 예금, 매월 저축할 거면 적금을 선택합니다.",
  },
  {
    q: "단리와 복리는 어떻게 다른가요?",
    a: "단리는 원금에만 이자가 붙는 방식, 복리는 원금+이전 이자에 다시 이자가 붙는 방식입니다. 같은 5% 금리·5년 운용 시 1,000만원이 단리 1,250만원, 복리(연복리) 약 1,276만원이 됩니다. 기간이 길어질수록 복리 효과가 커지므로 장기 저축은 복리 상품을 선호합니다. 다만 시중 은행 정기예적금은 대부분 단리입니다.",
  },
  {
    q: "이자소득세 15.4%는 무엇인가요?",
    a: "예적금 이자에는 14% 이자소득세 + 1.4% 농어촌특별세 = 총 15.4%가 원천징수됩니다. 즉 만기 시 발생한 이자에서 15.4%가 자동 차감되어 실제 입금되는 금액은 세전 이자의 84.6% 수준입니다. 예: 세전 이자 100만원이면 세후 약 84.6만원이 입금됩니다.",
  },
  {
    q: "비과세·세금우대 상품은 어떤 게 있나요?",
    a: "① ISA(개인종합자산관리계좌): 연 2천만원 한도 비과세, 200만원 초과분 9.9% 분리과세. ② 청년도약계좌(만 19~34세): 5년 만기, 정부기여금 + 비과세. ③ 청년형 장기집합투자증권저축. ④ 농어가목돈마련저축. ⑤ 조합 예탁금(농협·신협·새마을금고 등) 1인 3천만원 한도 비과세. 본인 자격 요건에 맞는 상품을 챙기면 15.4% 세금을 절약할 수 있습니다.",
  },
  {
    q: "정기적금 만기 이자 계산 공식은?",
    a: "단리 정기적금 만기 이자 = 월적립액 × 가입기간(월) × (가입기간 + 1) / 2 × 월이율. 예: 월 50만원, 24개월, 연 4%(월이율 0.333%) → 500,000 × 24 × 25 / 2 × 0.00333 ≈ 500,000원 세전 이자. 세후(15.4% 차감) 약 423,000원. 만기 원리금 = 적립 원금 1,200만원 + 세후 이자 423,000원 = 약 1,242만원.",
  },
  {
    q: "어떤 적금 금리가 좋은가요?",
    a: "2026년 기준 시중은행 정기적금은 연 3.0~4.5% 수준이며 우대 조건(자동이체·카드사용·앱 가입 등) 충족 시 +1~2%p 보너스. 인터넷은행(케이뱅크·카카오뱅크·토스뱅크)은 4~5% 적금, 저축은행은 5~6% 적금도 가능. 단 저축은행은 1인 5천만원까지 예금자보호. 금리비교는 금융감독원 '금융상품한눈에'에서 확인.",
  },
];

const HOWTO_STEPS = [
  { name: "상품 유형 선택", text: "정기적금(월 적립) / 정기예금(목돈 거치) 중 선택." },
  { name: "금액·기간·금리 입력", text: "월 적립액 또는 예치금, 가입 개월수, 연 이자율 입력." },
  { name: "이자 방식 선택", text: "단리 또는 복리. 일반 시중은행은 보통 단리." },
  { name: "결과 확인", text: "세전·세후 이자, 만기 원리금이 표시됩니다." },
];

export default function SavingsInterest2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/savings-interest-2026", {
            leafName: "2026 적금·예금 이자 계산기",
          }),
          softwareApplicationLd({
            name: "2026 적금·예금 이자 계산기",
            description: "정기적금/정기예금 만기 원리금 + 세후 이자 자동 산출",
            url: "/savings-interest-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026 적금·예금 이자 계산법",
            description: "월 적립액/예치금, 기간, 금리 입력으로 만기 원리금 1분 산출",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/savings-interest-2026" leafName="적금·예금 이자 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            금융상품 비교 핵심 도구
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            2026 적금·예금 이자 계산기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            정기적금(월 적립) 또는 정기예금(목돈 거치) 시 만기에 받을 수 있는 원리금을 즉시
            계산합니다. 단리/복리, 이자소득세 15.4% 자동 차감, 비과세·세금우대 옵션까지 반영.
            상품 가입 전 본인 저축 계획에 맞춰 최적 상품을 비교하세요.
          </p>
        </header>

        <HomeTopAd />

        <SavingsInterestClient />

        <CalcResultAd />

        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            정기적금 vs 정기예금 — 어떤 게 유리한가?
          </h2>
          <p>
            <strong>정기적금</strong>은 매월 일정액을 적립하는 상품으로, 매월 새 적립금이 들어와
            전체 평균 운용기간이 가입기간의 절반 수준입니다. 따라서 같은 금리라도 정기예금보다
            실수익이 작습니다. <strong>정기예금</strong>은 한 번에 목돈을 거치하므로 가입기간 전체
            동안 전액이 운용되어 이자가 더 많이 붙습니다. 매월 저축할 거면 적금, 목돈을 한 번에
            묶어둘 거면 예금이 일반적입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            단리·복리 공식 비교
          </h2>
          <p>
            <strong>단리 정기예금</strong>: 만기 이자 = 원금 × 연이율 × 기간(년)
          </p>
          <p>
            <strong>복리 정기예금</strong>: 만기 원리금 = 원금 × (1 + 연이율 ÷ 복리주기)^(복리주기 × 기간) — 일반적으로 월복리 또는 연복리 적용
          </p>
          <p>
            <strong>단리 정기적금</strong>: 만기 이자 = 월적립액 × n × (n+1) / 2 × 월이율 (n=가입개월수)
          </p>
          <p>
            5년 운용 시 5% 금리로 1,000만원 정기예금 → 단리 1,250만원 vs 연복리 1,276만원 vs 월복리 1,283만원.
            기간이 길수록 복리 차이가 커지지만, 시중은행은 대부분 단리 상품이므로 가입 전 약관 확인이 필요합니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            세금 우회 5가지 비과세·세금우대 상품
          </h2>
          <ul>
            <li><strong>ISA (개인종합자산관리계좌)</strong>: 연 2천만원 한도 비과세 (만기 5년)</li>
            <li><strong>청년도약계좌</strong> (만 19~34세): 5년 만기, 정부기여금 최대 144만원 + 비과세</li>
            <li><strong>농어가목돈마련저축</strong>: 농어업인 비과세</li>
            <li><strong>조합 예탁금</strong> (농협·신협·새마을금고): 1인 3천만원 한도 비과세</li>
            <li><strong>장기집합투자증권저축</strong>: 펀드 형식 비과세 (소득 조건)</li>
          </ul>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            저축 전략 — 자산 단계별 추천
          </h2>
          <ol>
            <li><strong>비상금 (생활비 3개월)</strong>: 입출금 자유로운 파킹통장(연 3~4%)</li>
            <li><strong>1~2년 단기 목표</strong>: 정기적금 (연 4~5%) + ISA 활용</li>
            <li><strong>3~5년 중기 목표</strong>: 정기예금 + 청년도약계좌(자격 시) + 채권 ETF</li>
            <li><strong>10년+ 장기</strong>: IRP·연금저축(세액공제 + 복리) + 인덱스 펀드</li>
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
        <RelatedCalculators currentPath="/savings-interest-2026" title="적금·예금과 함께 보면 좋은 도구" />

        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">함께 보면 좋은 계산기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/tools/finance/compound" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">복리 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">적립식 자산 시뮬</p>
            </Link>
            <Link href="/tools/finance/cagr" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">CAGR 연평균수익률</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">투자 기간별 수익률</p>
            </Link>
            <Link href="/tools/deposit" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">예적금 만기 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">이자·원리금 상세</p>
            </Link>
            <Link href="/fire-calculator" className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors">
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">FIRE 계산기</p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">조기은퇴 자산 시뮬</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
