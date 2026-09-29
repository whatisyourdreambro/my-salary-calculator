// src/app/savings-interest-2026/page.tsx
// 적금·예금 이자 계산기 — 금융 카테고리 고RPM 키워드

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import SavingsInterestClient from "./SavingsInterestClient";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 적금·예금 이자 계산기 — 세후 만기 원리금 즉시 산출",
  description:
    "월 50만원 × 24개월 연 4% 적금이면 만기 약 1,242만원·세후 이자 약 42만원. 정기적금/정기예금, 단리/복리 모두 지원. 이자소득세 15.4% 자동 차감 + 비과세·세금우대 옵션.",
  path: "/savings-interest-2026",
  ogType: "article",
  publishedTime: "2026-06-11",
  modifiedTime: "2026-09-27",
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
    // 기준금리 인상 시의성 쿼리 — 2026-07-16 2.75%, 2026-08-27 3.00% (한국은행 ECOS 722Y001)
    "기준금리 인상 예금 금리",
    "기준금리 3.00%",
  ],
});

// FAQ 답변은 InArticleAd 아래 접힌 <details> 안이라 문구 길이가 광고 위치에 영향이 없다(닫힌 details 는 높이 0) — FAQPage JSON-LD 로도 나간다.
// 2026-09-27 정정: 예금자보호 한도는 2025-09-01부터 금융회사(저축은행 포함)별 1인당 원리금 합산 1억원
// (예금자보호법 시행령 개정 — 금융위원회 보도자료·예금보험공사 FAQ; 사이트 가이드 legacy-rewrite-10.ts 의 예금자보호 확대 안내와 같은 값).
// 이자소득 원천징수 15.4% 는 소득세 14% + 지방소득세 1.4%(소득세의 10%) — 농어촌특별세가 아니다.
// 2026-09-27 정정(B-standalone-facts): 청년도약계좌는 2025-12-31 로 신규 가입 종료(조세특례제한법 제91조의22,
// 금융위원회 2026-06-15 보도자료 '청년도약계좌 가입종료('25.12월)'), 후속 청년미래적금은 2026-06-22 출시
// (금융위원회 보도자료·서민금융진흥원 상품 안내: 만 19~34세, 월 최대 50만원, 3년, 정부기여금 일반형 6%·우대형 12%,
// 이자소득 비과세 — 조세특례제한법 제91조의25, 2028-12-31 까지 가입분). 월 최대 기여금 6만원 = 50만원 × 12%.
// 광고 위 목록(GuideMidAd ↔ InArticleAd) 두 줄은 폭 맞춤: '청년도약계좌'→'청년미래적금'(같은 6음절),
// 기여금 항목 줄은 옛 줄과 같은 1px 폭 구간(+0.03px) — 1줄↔2줄 전환 폭이 같다. 320~1440px 1px 간격 + 1536·1920 전 폭 확인.
// ISA·청년형 장기집합투자증권저축 설명도 접힌 FAQ 에서만 조세특례제한법 제91조의18·제91조의20 에 맞췄다
// (광고 위 목록의 ISA·조합 예탁금·장기집합투자증권저축 줄은 이번 배치 범위 밖 — 폭 맞춤 후보 없음, 보고로 넘김).
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
    a: "예적금 이자에는 14% 이자소득세 + 1.4% 지방소득세 = 총 15.4%가 원천징수됩니다. 즉 만기 시 발생한 이자에서 15.4%가 자동 차감되어 실제 입금되는 금액은 세전 이자의 84.6% 수준입니다. 예: 세전 이자 100만원이면 세후 약 84.6만원이 입금됩니다.",
  },
  {
    q: "비과세·세금우대 상품은 어떤 게 있나요?",
    a: "① ISA(개인종합자산관리계좌): 연 2천만원 납입 한도, 계좌 순이익 200만원(서민형 400만원)까지 비과세·초과분 9.9% 분리과세. ② 청년미래적금(만 19~34세, 2026년 6월 출시): 월 최대 50만원·3년 만기, 납입액의 6%(일반형) 또는 12%(우대형) 정부기여금 + 이자소득 비과세. 청년도약계좌는 2025년 12월 31일로 신규 가입이 끝나 기존 가입자만 유지됩니다(금융위원회·서민금융진흥원). ③ 청년형 장기집합투자증권저축(비과세가 아닌 납입액 40% 소득공제, 2025년 12월 31일로 신규 가입 종료). ④ 농어가목돈마련저축. ⑤ 조합 예탁금(농협·신협·새마을금고 등) 1인 3천만원 한도 — 2026~2028년 가입분은 조합원 자격 또는 총급여 7천만원 이하(종합소득 6천만원 이하) 요건을 갖추면 비과세, 그 밖에는 2026년 가입분 5%·2027년 이후 가입분 9% 분리과세(조세특례제한법 제89조의3). 본인 자격 요건에 맞는 상품을 챙기면 15.4% 세금을 절약할 수 있습니다.",
  },
  {
    q: "정기적금 만기 이자 계산 공식은?",
    a: "단리 정기적금 만기 이자 = 월적립액 × 가입기간(월) × (가입기간 + 1) / 2 × 월이율. 예: 월 50만원, 24개월, 연 4%(월이율 0.333%) → 500,000 × 24 × 25 / 2 × 0.00333 ≈ 500,000원 세전 이자. 세후(15.4% 차감) 약 423,000원. 만기 원리금 = 적립 원금 1,200만원 + 세후 이자 423,000원 = 약 1,242만원.",
  },
  {
    q: "어떤 적금 금리가 좋은가요?",
    a: "한국은행 기준금리는 2026년 7월 16일(2.50%→2.75%)과 8월 27일(2.75%→3.00%) 두 차례 연속 인상돼 현재 연 3.00%입니다(한국은행 경제통계시스템 ECOS 기준). 2026년 기준 시중은행 정기적금은 연 3.0~4.5% 수준이며 우대 조건(자동이체·카드사용·앱 가입 등) 충족 시 +1~2%p 보너스. 인터넷은행(케이뱅크·카카오뱅크·토스뱅크)은 4~5% 적금, 저축은행은 5~6% 적금도 가능. 단 예금자보호 한도는 2025년 9월 1일부터 금융회사(저축은행 포함)별 1인당 원리금 합산 1억원(예금보험공사). 금리비교는 금융감독원 '금융상품한눈에'에서 확인.",
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

        {/* 한국은행 기준금리 2026-07-16 2.50%→2.75%, 2026-08-27 2.75%→3.00% 연속 인상 — 시의성 안내 (기존 본문 수치 불변).
            광고(HomeTopAd) 위 문구라 줄 수 불변 폭 맞춤(2026-09-27): 제목은 옛 제목과 전체 폭 동일 구간(259.4→259.7px),
            본문은 한글 단어만 같은 음절 수로 교체(띄어쓰기 위치 동일) — 320~1440px 전 폭 광고 위치 불변 확인.
            날짜·수치 원문은 아래 FAQ(접힘)에 있다. 다시 고칠 때도 같은 방식으로 폭을 맞출 것. */}
        <div className="mb-8 p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700 border-l-4 border-l-electric">
          <p className="text-sm font-black text-navy dark:text-canvas-50 mb-2">
            8월 기준금리 3%로 재인상, 예·적금 금리 상승기
          </p>
          <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300">
            한국은행이 2026년 7월 16일 기준금리를 연 2.50%에서 2.75%로 0.25%p
            인상했습니다. 2023년 1월 이후 3년 6개월 만의 인상에 이어 한은은
            바로 다음 금통위에서 올렸고, 기준금리 인상이 시차를 두고 시중은행
            예·적금 금리에 반영되는 국면입니다. 금리가 오르는 시기에는 가입
            시점과 만기 설계에 따라 세후 이자 차이가 커지므로, 가입 전{" "}
            <Link
              href="/tools/deposit"
              className="font-bold text-electric underline underline-offset-2"
            >
              예금/적금 만기 계산기
            </Link>
            로 상품별 세후 원리금을 비교해 보세요.
          </p>
        </div>

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

          {/* 본문 섹션 경계 광고 (단리·복리 ↔ 비과세 상품) — 전면 최적화 (운영자 지시 2026-09-02) */}
          <GuideMidAd />

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            세금 우회 5가지 비과세·세금우대 상품
          </h2>
          <ul>
            <li><strong>ISA (개인종합자산관리계좌)</strong>: 연 2천만원 한도 비과세 (만기 5년)</li>
            <li><strong>청년미래적금</strong> (만 19~34세): 월 50만원·3년, 기여금 월 최대 6만원, 비과세</li>
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
            <li><strong>3~5년 중기 목표</strong>: 정기예금 + 청년미래적금(자격 시) + 채권 ETF</li>
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

        {/* 14차 — ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons title="2026 적금·예금 이자 계산기" description="단리/복리 만기 원리금 + 비과세 옵션" />
        </div>

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
