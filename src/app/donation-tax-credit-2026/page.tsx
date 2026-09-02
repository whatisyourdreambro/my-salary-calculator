// src/app/donation-tax-credit-2026/page.tsx
// 기부금 세액공제 계산기 — 연말정산 공제 4축(카드·의료비·월세·기부금) 완성 페이지.
// 2026년 귀속(현행법) 기준: 소득세법 §59의4, 조특법 §76(정치자금)·§58(고향사랑).
// 계산 로직 정본: src/lib/donationCredit.ts (연말정산 엔진과 15%·30% 수치 공유).
// 갱신 슬롯: 12월 세법개정 — 고액기부(3천만원 초과분) 40% 특례 연장 여부 확인
// 갱신 슬롯: 2027-01 — 고향사랑기부금 연간 상한(2,000만원)·답례품 비율(30%) 재확인

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import DonationTaxCreditClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "기부금 세액공제 계산기 2026 — 정치자금·고향사랑·종교단체 한도 자동 계산",
  description:
    "2026년 귀속 기부금 세액공제 즉시 계산. 1천만원 이하 15%·초과분 30%, 정치자금·고향사랑 10만원 전액공제(100/110), 종교단체 10%·일반 30% 한도와 10년 이월공제까지 유형별로 자동 판정합니다.",
  path: "/donation-tax-credit-2026",
  keywords: [
    "기부금 세액공제",
    "기부금 세액공제 계산기",
    "기부금 공제 한도",
    "정치자금 기부금 세액공제",
    "고향사랑기부제 세액공제",
    "종교단체 기부금 공제",
    "연말정산 기부금",
    "기부금 이월공제",
    "고향사랑기부금 답례품",
    "지정기부금 한도",
  ],
});

const FAQS = [
  {
    q: "기부금 세액공제는 얼마나 받을 수 있나요?",
    a: "특례(법정)기부금과 일반(지정)기부금은 합산 공제대상금액 기준으로 1천만원 이하분은 15%, 1천만원 초과분은 30%를 산출세액에서 차감합니다(소득세법 제59조의4). 예를 들어 한도 내 기부금이 1,500만원이면 1,000만원 × 15% + 500만원 × 30% = 300만원입니다. 정치자금기부금과 고향사랑기부금은 별도 산식(10만원까지 100/110 전액공제)이 적용됩니다.",
  },
  {
    q: "기부금 유형은 어떻게 구분되나요?",
    a: "크게 5가지입니다. ① 특례(법정)기부금 — 국가·지방자치단체 기부금, 이재민 구호금품 등(한도: 근로소득금액 100%), ② 일반(지정)기부금 — 사회복지법인·공익법인 등(한도: 30%), ③ 종교단체 기부금 — 일반기부금 중 종교단체분(한도: 10%), ④ 정치자금기부금 — 정당·후보자·선거관리위원회 기탁금(본인 지출만), ⑤ 고향사랑기부금 — 주소지 외 지자체 기부(본인 지출만, 연 2,000만원 한도)입니다. 연말정산 간소화 자료에도 이 구분대로 집계됩니다.",
  },
  {
    q: "정치자금 10만원을 기부하면 정말 전액 돌려받나요?",
    a: "사실상 그렇습니다. 정치자금기부금은 10만원까지 100/110(약 90.9%)을 소득세에서 세액공제하고, 지방소득세가 소득세 공제액의 10%만큼 함께 줄어들어 합계 10만원이 전액 환급되는 효과가 있습니다(조세특례제한법 제76조). 10만원 초과분은 15%, 3천만원 초과분은 25%가 적용됩니다. 단 근로자 본인이 지출한 것만 공제되며, 배우자나 부양가족 명의 기부는 공제받을 수 없습니다. 또한 산출세액이 있어야 공제 효과가 발생합니다.",
  },
  {
    q: "고향사랑기부제는 어떤 혜택이 있나요?",
    a: "두 가지 혜택이 겹칩니다. ① 세액공제 — 10만원까지 100/110 전액공제(지방소득세 포함 시 10만원 전액 환급 효과), 초과분은 15%, ② 답례품 — 기부액의 30% 이내에서 지역 특산품 등을 포인트로 받습니다. 즉 10만원을 기부하면 10만원 환급 + 3만원 상당 답례품으로 사실상 3만원 이득입니다. 본인 주민등록 주소지 관할 지자체에는 기부할 수 없고, 연간 기부 상한은 2,000만원입니다(2025년 1월 1일부터 상향).",
  },
  {
    q: "기부금 공제 한도는 어떻게 계산하나요?",
    a: "한도는 근로소득금액(총급여 − 근로소득공제) 기준입니다. 특례(법정)기부금은 근로소득금액의 100%, 일반(지정)기부금은 특례기부금 공제 후 잔여 금액의 30%, 종교단체 기부금은 잔여 금액의 10%까지만 공제대상이 됩니다(종교단체 기부금이 있으면 '잔여액의 10% + min(잔여액의 20%, 종교단체 외 일반기부금)' 산식 적용). 이 계산기는 총급여만 입력하면 근로소득금액과 유형별 한도를 자동으로 계산합니다.",
  },
  {
    q: "한도를 초과한 기부금은 사라지나요?",
    a: "유형에 따라 다릅니다. 특례기부금과 일반기부금(종교단체 포함)의 한도 초과분은 이후 10년간 이월해서 공제받을 수 있습니다. 반면 정치자금기부금과 고향사랑기부금의 한도 초과분은 이월되지 않고 소멸합니다. 이월된 기부금은 해당 연도 지출분보다 먼저 공제되므로, 큰 금액을 기부했다면 이월 내역을 놓치지 말고 다음 해 연말정산에 반영하세요.",
  },
  {
    q: "배우자나 부모님이 낸 기부금도 제가 공제받을 수 있나요?",
    a: "특례기부금과 일반기부금(종교단체 포함)은 기본공제대상자인 배우자·부양가족(소득금액 100만원 이하, 나이 요건은 보지 않음)이 지출한 기부금도 합산해 공제받을 수 있습니다. 다만 정치자금기부금과 고향사랑기부금은 근로자 본인이 지출한 것만 공제됩니다. 같은 기부금을 두 사람이 중복으로 공제받을 수는 없습니다.",
  },
  {
    q: "기부금 공제에 필요한 서류는 무엇인가요?",
    a: "대부분의 기부단체·정당·지자체 기부 내역은 연말정산 간소화 서비스(홈택스)에 자동으로 조회됩니다. 조회되지 않는 기부금은 해당 단체가 발행한 기부금영수증을 받아 회사에 제출하면 됩니다. 종교단체 기부금은 간소화에 잡히지 않는 경우가 많아 소속 단체에서 기부금영수증을 직접 발급받아야 하며, 허위·과다 영수증은 가산세 대상이므로 실제 기부액만 신고해야 합니다.",
  },
  {
    q: "이 계산기의 수치는 어디에 근거하나요?",
    a: "소득세법 제59조의4(기부금 세액공제 15%·30%, 유형별 한도), 조세특례제한법 제76조(정치자금 100/110·15%·25%), 조세특례제한법 제58조 및 고향사랑 기부금에 관한 법률(고향사랑기부금 연 2,000만원 한도·답례품 30%)의 2026년 8월 기준 현행 규정을 반영했습니다. 근로소득만 있는 근로자를 가정한 간이 계산으로, 우리사주조합기부금·전년도 이월분은 반영하지 않으며 실제 공제액은 연말정산 결과로 확정됩니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "총급여 입력",
    text: "비과세를 제외한 연간 총급여를 입력합니다. 공제 한도의 기준인 근로소득금액이 자동 계산됩니다.",
  },
  {
    name: "유형별 기부액 입력",
    text: "특례(법정)·일반(지정)·종교단체·정치자금·고향사랑 5가지 유형별로 올해 기부한 금액을 입력합니다.",
  },
  {
    name: "결과 확인",
    text: "유형별 세액공제액 합계와 한도 초과분(10년 이월 가능 여부), 고향사랑 답례품 혜택까지 확인합니다.",
  },
  {
    name: "증빙 준비",
    text: "간소화 자료에 없는 기부금은 기부금영수증을 발급받아 회사에 제출합니다.",
  },
];

export default function DonationTaxCredit2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/donation-tax-credit-2026", { leafName: "기부금 세액공제 계산기 2026" }),
          softwareApplicationLd({
            name: "기부금 세액공제 계산기 2026",
            description:
              "총급여와 유형별 기부액으로 2026년 귀속 기부금 세액공제액(15%·30%, 정치자금·고향사랑 100/110)과 한도·이월공제를 자동 산출",
            url: "/donation-tax-credit-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "기부금 세액공제 계산하는 방법 (2026년 귀속)",
            description: "총급여와 유형별 기부액을 입력해 연말정산 기부금 세액공제액을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/donation-tax-credit-2026" leafName="기부금 세액공제 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            2026년 귀속 연말정산 대비
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            기부금 세액공제 계산기 2026
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            총급여와 유형별 기부액만 입력하면 2026년 귀속(2027년 1~2월 연말정산) 기부금
            세액공제액을 즉시 계산합니다. 특례·일반기부금은 1천만원 이하 15%·초과분 30%,
            정치자금·고향사랑기부금은 10만원까지 100/110 전액공제. 종교단체 10%·일반 30%
            한도와 10년 이월공제, 고향사랑 답례품 혜택까지 한 번에 확인하세요. 근거:
            소득세법 제59조의4, 조세특례제한법 제76조·제58조.
          </p>
        </header>

        <HomeTopAd />

        <DonationTaxCreditClient />

        <CalcResultAd />

        {/* 연말정산 클러스터 칩 — 광고 아래 배치 준수 */}
        <YearEndTaxCluster />

        {/* 제도 설명 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            기부금 세액공제란?
          </h2>
          <p>
            소득세법 제59조의4에 따라 근로자가 낸 기부금의{" "}
            <strong>15%(1천만원 초과분은 30%)를 산출세액에서 직접 빼 주는 제도</strong>
            입니다. 과세표준을 줄이는 소득공제와 달리 계산된 세금에서 그대로 차감되므로
            소득 구간과 무관하게 같은 금액을 돌려받습니다. 신용카드·의료비·월세와 함께{" "}
            <Link href="/year-end-tax">연말정산 환급금</Link>을 좌우하는 4대 공제 축
            중 하나이고, 특히 정치자금·고향사랑기부금의 <strong>10만원 전액공제</strong>는
            누구나 챙길 수 있는 확정 혜택입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            기부 유형 5가지 — 어디에 냈는지가 공제율·한도를 결정
          </h2>
          <ol>
            <li>
              <strong>특례(법정)기부금</strong> — 국가·지방자치단체 기부금, 이재민
              구호금품, 국립대학병원·사립학교(시설비 등) 기부. 한도는{" "}
              <strong>근로소득금액의 100%</strong>로 가장 넓습니다.
            </li>
            <li>
              <strong>일반(지정)기부금 (종교단체 외)</strong> — 사회복지법인, 공익법인,
              인가된 NGO 등 지정 단체 기부. 한도는 잔여 근로소득금액의{" "}
              <strong>30%</strong>입니다.
            </li>
            <li>
              <strong>종교단체 기부금</strong> — 교회 헌금·절 시주 등. 일반기부금에
              속하지만 한도가 잔여 근로소득금액의 <strong>10%</strong>로 따로 묶입니다.
            </li>
            <li>
              <strong>정치자금기부금</strong> — 정당·후보자 후원금, 선거관리위원회
              기탁금. <strong>본인 지출분만</strong> 공제되며 10만원까지 100/110
              전액공제, 초과분 15%(3천만원 초과분 25%)입니다.
            </li>
            <li>
              <strong>고향사랑기부금</strong> — 본인 주소지 <strong>외</strong> 지자체에
              기부(주소지 관할 지자체는 불가). 연간 <strong>2,000만원 한도</strong>,
              10만원까지 100/110 전액공제 + <strong>기부액 30% 이내 답례품</strong>을
              별도로 받습니다.
            </li>
          </ol>

          {/* 본문 중간 보강 광고(prose 밖) — 전면 최적화 (운영자 지시 2026-09-02) */}
          <div className="not-prose">
            <GuideMidAd />
          </div>
          {/* 갱신 슬롯: 12월 세법개정 — 고액기부(3천만원 초과분) 40% 특례 연장 여부 확인 후 반영 */}
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            공제율과 한도 — 예시로 확인
          </h2>
          <p>
            특례·일반기부금은 <strong>합산 공제대상금액</strong> 기준으로 1천만원
            이하분 15%, 초과분 30%가 적용됩니다. 예시 ①: 총급여 1억원 근로자가 한도 내
            기부금 1,500만원을 냈다면 1,000만원 × 15% + 500만원 × 30% ={" "}
            <strong className="text-electric">300만원</strong>을 산출세액에서 뺍니다.
          </p>
          <p>
            한도는 근로소득금액(총급여 − 근로소득공제)이 기준입니다. 예시 ②: 총급여
            5,000만원이면 근로소득공제 1,225만원을 뺀 근로소득금액은 3,775만원입니다.
            종교단체에만 500만원을 기부했다면 한도는 3,775만원 × 10% = 377만 5천원이라
            공제대상은 377만 5천원 × 15% = <strong>566,250원</strong>이고, 한도를 넘긴
            122만 5천원은 <strong>10년간 이월</strong>해 다음 해부터 공제받을 수
            있습니다. 이 계산기는 이 한도·이월 판정을 자동으로 처리합니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            10만원 기부 전략 — 정치자금·고향사랑은 사실상 전액 환급
          </h2>
          <p>
            정치자금기부금과 고향사랑기부금은 각각 10만원까지 100/110을 소득세에서
            공제하고, 소득세에 연동되는 지방소득세(10%)까지 함께 줄어 {" "}
            <strong>10만원이 전액 환급되는 효과</strong>가 있습니다. 고향사랑기부금은
            여기에 기부액의 30% 이내 답례품(지역 특산품 포인트)이 더해져 10만원 기부 시{" "}
            <strong>약 3만원 상당의 순이득</strong>이 생깁니다. 단 두 제도 모두 근로자{" "}
            <strong>본인 지출분만</strong> 인정되고, 산출세액이 있어야 공제 효과가
            발생한다는 점을 기억하세요. 절세 우선순위는{" "}
            <Link href="/guides/donation-tax-credit">기부금 세액공제 가이드</Link>에서
            자세히 다룹니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            신청 방법과 증빙
          </h2>
          <p>
            정당·지자체·주요 공익법인 기부는 연말정산 간소화 서비스에 자동 집계됩니다.
            간소화에 없는 기부금(특히 종교단체)은 해당 단체가 발행한{" "}
            <strong>기부금영수증</strong>을 받아 회사에 제출해야 합니다. 배우자·부양가족
            (소득금액 100만원 이하)이 낸 특례·일반기부금은 합산 가능하지만
            정치자금·고향사랑기부금은 본인 지출분만 됩니다. 놓친 연도가 있다면
            경정청구로 소급 신청할 수 있으며, 기부금 공제 후 환급액 전체가 궁금하다면{" "}
            <Link href="/year-end-tax">연말정산 환급금 계산기</Link>에서 다른 공제와
            합산해 보세요.
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

        {/* 면책 */}
        <aside className="my-10 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-5 text-sm">
          <p className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="block mb-1 text-amber-900 dark:text-amber-300">
                간이 계산 도구입니다
              </strong>
              <span className="text-amber-800 dark:text-amber-200">
                본 계산기는 근로소득만 있는 근로자를 가정한 간이 계산으로,
                우리사주조합기부금·전년도 이월 기부금·산출세액 한도는 반영하지 않습니다.
                세액공제는 산출세액 범위 내에서만 차감되며, 실제 공제액은
                연말정산·종합소득세 신고 결과로 확정됩니다. 정확한 내용은 국세청
                홈택스 또는 세무 전문가에게 확인하세요.
              </span>
            </span>
          </p>
        </aside>

        {/* 출처 */}
        <section className="my-8 text-xs text-faint-blue leading-6">
          <h2 className="text-sm font-bold text-navy dark:text-canvas-100 mb-2">출처·근거</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>소득세법 제59조의4 (기부금 세액공제 15%·30%) · 제34조 (기부금 구분·한도)</li>
            <li>조세특례제한법 제76조 (정치자금기부금 — 100/110·15%·3천만원 초과분 25%)</li>
            <li>
              조세특례제한법 제58조 · 고향사랑 기부금에 관한 법률 (연 2,000만원 한도·답례품
              30%, 2025-01-01 상한 상향분 반영)
            </li>
            <li>국세청 연말정산 안내 — 기부금 세액공제 (nts.go.kr, 2026년 8월 조회 기준)</li>
          </ul>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* RelatedCalculators 자동 추천 (dead-end 차단) */}
        <RelatedCalculators
          currentPath="/donation-tax-credit-2026"
          title="이 계산과 함께 보면 좋은 도구"
        />

        {/* ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons
            title="기부금 세액공제 계산기 2026"
            description="정치자금·고향사랑 10만원 전액공제부터 한도·이월까지 1분 계산"
          />
        </div>

        {/* 관련 링크 직후 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <MultiplexAd />
        {/* 관련 도구 — 연말정산 공제 4축 + 가이드 */}
        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            함께 보면 좋은 계산기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/year-end-tax"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                연말정산 환급금 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                기부금 포함 전체 환급액 계산
              </p>
            </Link>
            <Link
              href="/credit-card-deduction-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                신용카드 소득공제 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                25% 문턱·자녀 수별 한도 반영
              </p>
            </Link>
            <Link
              href="/medical-tax-credit-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                의료비 세액공제 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                실손 차감·3% 문턱 반영 계산
              </p>
            </Link>
            <Link
              href="/rent-tax-credit-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                월세 세액공제 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                15%·17% 자동 판정, 최대 170만원
              </p>
            </Link>
            <Link
              href="/guides/donation-tax-credit"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                기부금 세액공제 가이드
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                유형별 절세 전략·서류 총정리
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
