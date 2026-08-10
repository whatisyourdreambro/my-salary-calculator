// src/app/medical-tax-credit-2026/page.tsx
// 의료비 세액공제 계산기 — 연말정산 시즌(12~2월) 검색 수요 선점용
// 2026년 귀속(2027년 1~2월 정산) 현행법 기준.
// 근거: 소득세법 제59조의4 제1항 + 국세청 국세상담센터(call.nts.go.kr) 2026-08-08 확인.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import MedicalTaxCreditClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "의료비 세액공제 계산기 2026 — 실손 차감·3% 문턱·난임 30% 자동 계산",
  description:
    "총급여의 3% 초과 의료비부터 15~30% 세액공제. 실손보험금 차감, 본인·65세 이상·장애인·6세 이하 무한도, 난임시술 30%까지 반영해 2026년 귀속 연말정산 의료비 세액공제액을 즉시 계산합니다.",
  path: "/medical-tax-credit-2026",
  keywords: [
    "의료비 세액공제 계산기",
    "의료비 세액공제",
    "연말정산 의료비",
    "의료비 공제 한도",
    "실손보험금 의료비 공제",
    "난임시술비 세액공제",
    "산후조리원 연말정산",
    "안경 연말정산",
    "6세 이하 의료비 공제",
  ],
});

const FAQS = [
  {
    q: "의료비 세액공제는 어떻게 계산되나요?",
    a: "부양가족(나이·소득 요건 없음)을 위해 해당 연도에 지출한 의료비에서 실손의료보험금을 뺀 금액 중 총급여의 3%를 초과하는 부분이 공제 대상입니다. 공제율은 난임시술비 30%, 미숙아·선천성이상아 의료비 20%, 나머지 15%입니다. 그 밖의 부양가족 의료비만 연 700만원 한도가 있고, 본인·65세 이상·장애인·6세 이하·건강보험산정특례자·난임·미숙아 의료비는 한도가 없습니다.",
  },
  {
    q: "실손의료보험금을 받았으면 어떻게 처리하나요?",
    a: "실손보험금으로 보전받은 의료비는 공제 대상에서 제외해야 합니다. 이때 보험금을 받은 연도가 아니라 의료비를 지출한 연도의 의료비에서 차감하는 것이 국세청 기준입니다. 예를 들어 2026년에 수술비를 내고 2027년 1월에 실손보험금을 받았다면, 2026년 귀속 연말정산의 의료비에서 그 보험금을 빼야 합니다. 차감하지 않고 공제받으면 나중에 가산세와 함께 추징될 수 있습니다.",
  },
  {
    q: "6세 이하 자녀 의료비도 한도 없이 공제되나요?",
    a: "네. 2024년 1월 1일 이후 지출분부터 6세 이하 부양가족의 의료비는 한도 없는 공제 대상(공제율 15%)에 추가됐습니다. 2026년 귀속 연말정산에도 그대로 적용되므로, 영유아 병원비가 많이 나온 해에는 700만원 한도 걱정 없이 전액이 3% 초과분 계산에 들어갑니다.",
  },
  {
    q: "산후조리원 비용도 공제 대상인가요?",
    a: "네. 산후조리원 비용은 출산 1회당 200만원 한도로 의료비 세액공제 대상입니다. 과거에 있던 총급여 7,000만원 이하 요건은 2024년 1월 1일 이후 지출분부터 삭제되어, 2026년 귀속은 소득과 관계없이 모든 근로자가 적용받습니다. 오래된 블로그 글에는 소득 요건이 남아 있는 경우가 많으니 혼동하지 마세요.",
  },
  {
    q: "안경·콘택트렌즈, 보청기 비용도 공제되나요?",
    a: "시력보정용 안경·콘택트렌즈 구입비는 1인당 연 50만원 한도로 공제 대상입니다. 보청기, 장애인보장구, 의사 처방에 따른 의료기기 구입·임차 비용은 한도 없이 전액 의료비에 포함됩니다. 결제 시 근로자 본인 또는 부양가족 명의로 지출하고 증빙(사용 목적 기재 영수증 등)을 갖춰야 합니다.",
  },
  {
    q: "공제받을 수 없는 의료비는 무엇인가요?",
    a: "미용·성형수술 비용, 건강증진용 의약품(영양제 등) 구입비, 국외 의료기관에 지출한 의료비는 공제 대상이 아닙니다. 실손보험금이나 사내복지기금 등으로 보전받은 금액도 제외됩니다. 반면 치료 목적의 진료비·의약품비·입원비는 대상이며, 2026년 지출분부터는 장애아동 발달재활서비스 비용도 이용증명서를 증빙으로 인정받을 수 있습니다.",
  },
  {
    q: "부양가족의 나이·소득 요건이 있나요? 작년에 진료받고 올해 결제하면요?",
    a: "의료비 세액공제는 부양가족의 나이·소득 요건 제한이 없는 공제입니다. 소득이 있는 배우자나 성인 자녀를 위해 지출한 의료비도 공제받을 수 있습니다(기본공제 대상 여부와 무관하게 생계를 같이하는 부양가족 요건은 필요). 그리고 진료 연도가 아니라 실제로 결제한(지급한) 연도의 의료비로 공제하므로, 2025년 진료분이라도 2026년에 결제했다면 2026년 귀속 의료비입니다.",
  },
  {
    q: "이 계산기의 수치는 무엇을 근거로 하나요?",
    a: "소득세법 제59조의4 제1항(의료비 세액공제)과 국세청 국세상담센터(call.nts.go.kr) 공식 안내를 기준으로 2026-08-08 확인한 2026년 귀속 현행법 수치입니다. 공제율(15/20/30%)·한도(일반 700만원, 산후조리원 200만원, 안경 50만원)·3% 기준액 차감 순서를 그대로 반영했습니다. 다만 간이 계산기이므로 산출세액 한도, 회사별 원천징수 상황에 따라 실제 정산 결과와 다를 수 있습니다. 최종 확인은 홈택스 연말정산 미리보기를 이용하세요.",
  },
];

const HOWTO_STEPS = [
  {
    name: "총급여 입력",
    text: "비과세소득을 제외한 연간 총급여를 입력합니다. 공제 기준액(총급여의 3%)이 자동 계산됩니다.",
  },
  {
    name: "의료비 항목별 입력",
    text: "그 밖의 부양가족 의료비(한도 700만원), 본인·65세 이상·장애인·6세 이하 등 무한도 의료비, 미숙아·선천성이상아 의료비, 난임시술비를 각각 입력합니다.",
  },
  {
    name: "실손보험금 입력",
    text: "올해 지출한 의료비에 대해 받았거나 받을 실손의료보험금을 입력합니다. 공제 대상에서 자동 차감됩니다.",
  },
  {
    name: "결과 확인",
    text: "3% 문턱 차감과 항목별 공제율(15·20·30%)이 적용된 최종 세액공제액과 지방소득세 포함 예상 절세액을 확인합니다.",
  },
];

export default function MedicalTaxCredit2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/medical-tax-credit-2026", {
            leafName: "의료비 세액공제 계산기 2026",
          }),
          softwareApplicationLd({
            name: "의료비 세액공제 계산기 2026",
            description:
              "총급여 3% 초과 의료비의 15~30% 세액공제를 실손 차감·무한도 항목 반영해 자동 산출",
            url: "/medical-tax-credit-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "2026년 귀속 의료비 세액공제 계산하는 방법",
            description:
              "총급여·의료비·실손보험금을 입력해 연말정산 의료비 세액공제액을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/medical-tax-credit-2026" leafName="의료비 세액공제 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            2026년 귀속 연말정산
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            의료비 세액공제 계산기 2026
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            총급여의 3%를 초과한 의료비부터 15~30% 세액공제를 받을 수 있습니다. 실손보험금 차감,
            본인·65세 이상·장애인·6세 이하 무한도 공제, 난임시술비 30%까지 현행법 그대로 반영해
            2026년 귀속(2027년 1~2월 정산) 예상 공제액을 즉시 계산합니다. 소득세법 제59조의4와
            국세청 국세상담센터 안내 기준입니다.
          </p>
        </header>

        <HomeTopAd />

        <MedicalTaxCreditClient />

        <CalcResultAd />

        {/* 가이드 콘텐츠 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            의료비 세액공제 계산 구조 — 4단계
          </h2>
          <p>
            <strong>1단계 — 실손보험금 차감:</strong> 올해 지출한 의료비에서 실손의료보험금으로
            보전받은 금액을 먼저 뺍니다. 보험금을 내년에 받더라도 의료비를{" "}
            <strong>지출한 연도</strong>의 의료비에서 차감하는 것이 국세청 기준입니다.
          </p>
          <p>
            <strong>2단계 — 3% 문턱:</strong> 실손 차감 후 의료비가 총급여의 3%를 초과해야
            공제가 시작됩니다. 총급여 5,000만원이면 기준액은 150만원 — 의료비가 150만원 이하면
            공제액이 0원입니다. 기준액은 한도가 있는 <strong>일반 부양가족 의료비에서 먼저
            차감</strong>하고, 모자라면 무한도 의료비에서 마저 차감합니다(납세자에게 유리한 순서).
          </p>
          <p>
            <strong>3단계 — 항목별 공제율 적용:</strong> 3% 초과분에 난임시술비 30%,
            미숙아·선천성이상아 의료비 20%, 나머지 15%를 곱합니다. 일반 부양가족 의료비만
            연 700만원 한도가 적용됩니다.
          </p>
          <p>
            <strong>4단계 — 산출세액에서 차감:</strong> 계산된 공제액은 소득세 산출세액에서
            직접 차감되고, 지방소득세(소득세의 10%)도 함께 줄어듭니다. 공제액이 100만원이면
            실제 절세 효과는 약 110만원입니다. 단, 산출세액보다 큰 공제액은 환급·이월되지 않습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            공제율·한도 한눈에 보기 (2026년 귀속)
          </h2>
          <div className="not-prose overflow-x-auto my-4">
            <table className="w-full min-w-[520px] text-sm border-collapse">
              <thead>
                <tr className="bg-canvas-100 dark:bg-canvas-800 text-navy dark:text-canvas-50">
                  <th className="p-3 text-left font-bold border border-canvas-200 dark:border-canvas-700">대상 의료비</th>
                  <th className="p-3 text-center font-bold border border-canvas-200 dark:border-canvas-700">공제율</th>
                  <th className="p-3 text-center font-bold border border-canvas-200 dark:border-canvas-700">한도</th>
                </tr>
              </thead>
              <tbody className="text-muted-blue dark:text-canvas-300">
                <tr>
                  <td className="p-3 border border-canvas-200 dark:border-canvas-700">난임시술비</td>
                  <td className="p-3 text-center font-bold text-electric border border-canvas-200 dark:border-canvas-700">30%</td>
                  <td className="p-3 text-center border border-canvas-200 dark:border-canvas-700">없음</td>
                </tr>
                <tr>
                  <td className="p-3 border border-canvas-200 dark:border-canvas-700">미숙아·선천성이상아 의료비</td>
                  <td className="p-3 text-center font-bold text-electric border border-canvas-200 dark:border-canvas-700">20%</td>
                  <td className="p-3 text-center border border-canvas-200 dark:border-canvas-700">없음</td>
                </tr>
                <tr>
                  <td className="p-3 border border-canvas-200 dark:border-canvas-700">
                    본인 · 65세 이상 · 장애인 · <strong>6세 이하</strong> · 건강보험산정특례자
                  </td>
                  <td className="p-3 text-center font-bold text-electric border border-canvas-200 dark:border-canvas-700">15%</td>
                  <td className="p-3 text-center border border-canvas-200 dark:border-canvas-700">없음</td>
                </tr>
                <tr>
                  <td className="p-3 border border-canvas-200 dark:border-canvas-700">그 밖의 부양가족 의료비</td>
                  <td className="p-3 text-center font-bold text-electric border border-canvas-200 dark:border-canvas-700">15%</td>
                  <td className="p-3 text-center border border-canvas-200 dark:border-canvas-700">연 700만원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            6세 이하 부양가족 의료비는 2024년 1월 1일 지출분부터 무한도 그룹에 추가됐습니다.
            영유아 자녀의 병원비 부담이 큰 가구에 특히 의미 있는 변화로, 2026년 귀속에도 그대로
            적용됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            자주 놓치는 인정 항목과 한도
          </h2>
          <ul>
            <li>
              <strong>산후조리원</strong>: 출산 1회당 200만원 한도. 총급여 7,000만원 이하 요건은
              2024년 지출분부터 삭제 — 지금은 소득 무관 전 근로자 적용.
            </li>
            <li>
              <strong>시력보정용 안경·콘택트렌즈</strong>: 1인당 연 50만원 한도.
            </li>
            <li>
              <strong>보청기·장애인보장구·의사 처방 의료기기</strong>: 구입·임차 비용 전액 인정.
            </li>
            <li>
              <strong>장애아동 발달재활서비스</strong>: 2026년 1월 1일 이후 지출분부터
              이용증명서를 증빙으로 인정(2025년 12월 개정).
            </li>
            <li>
              <strong>제외 항목</strong>: 미용·성형수술비, 건강증진 의약품, 국외 의료기관 지출분,
              실손보험금·사내복지기금 보전분.
            </li>
          </ul>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            계산 예시 — 총급여 5,000만원 직장인
          </h2>
          <p>
            총급여 5,000만원(기준액 150만원)인 근로자가 부양가족 일반 의료비로 800만원을 쓰고
            실손보험금 100만원을 받은 경우: 순 의료비 700만원 − 기준액 150만원 = 550만원이
            공제 대상(한도 700만원 이내)이고, 세액공제는 550만원 × 15% ={" "}
            <strong className="text-electric">82만 5,000원</strong>입니다. 지방소득세 절감분까지
            더하면 실제 세 부담은 약 90만 7,500원 줄어듭니다.
          </p>
        </section>

        {/* 2027년 귀속 개정 예정 안내 박스 */}
        <aside className="my-8 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5">
          <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-2">
            2027년 귀속 개정 예정 사항 (참고)
          </p>
          <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300">
            2026년 8월 3일 발표된 세제개편안(국회 통과 필요)에는 <strong>근로자 의료비
            세액공제를 바꾸는 내용이 없습니다.</strong> 성실사업자 대상 의료비 등 공제 적용기한
            연장만 포함되어 이 계산기와 무관합니다. 즉 본 계산기의 공제율·한도는 2026년 귀속은
            물론 현재 발표 기준으로는 2027년 귀속에도 동일하게 유지될 전망입니다.
          </p>
        </aside>

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

        <RelatedCalculators
          currentPath="/medical-tax-credit-2026"
          title="연말정산과 함께 보면 좋은 도구"
        />

        <div className="my-8">
          <ShareButtons
            title="의료비 세액공제 계산기 2026"
            description="실손 차감·3% 문턱·난임 30%까지 반영한 연말정산 의료비 공제액 1분 계산"
          />
        </div>

        {/* 관련 도구 */}
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
                의료비 포함 전체 환급금 계산
              </p>
            </Link>
            <Link
              href="/year-end-tax-checklist"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                연말정산 체크리스트
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                놓치기 쉬운 공제 항목 점검
              </p>
            </Link>
            <Link
              href="/income-tax-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                종합소득세 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                8단계 누진세율 산출세액 확인
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
            <Link
              href="/credit-card-deduction-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                신용카드 소득공제 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                25% 문턱·자녀 수별 한도 반영 계산
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
          </div>
        </section>

        {/* 면책 + 출처 */}
        <aside className="my-10 rounded-2xl border border-canvas-200 dark:border-canvas-700 bg-white dark:bg-canvas-900 p-5">
          <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-2">
            이용 안내 및 출처
          </p>
          <p className="text-xs leading-6 text-muted-blue dark:text-canvas-300 mb-3">
            본 계산기는 2026년 귀속 현행 소득세법 기준의 간이 계산 도구입니다. 세액공제는 산출세액
            범위 내에서만 적용되고 이월되지 않으며, 실손보험금 귀속 시기·증빙 인정 여부·부양가족
            판정 등에 따라 실제 연말정산 결과와 차이가 날 수 있습니다. 정확한 금액은 홈택스
            연말정산 미리보기 또는 회사 연말정산 담당자를 통해 확인하세요.
          </p>
          <ul className="text-xs leading-6 text-faint-blue list-disc pl-4 space-y-0.5">
            <li>소득세법 제59조의4 제1항 (의료비 세액공제) — 국가법령정보센터(law.go.kr)</li>
            <li>국세청 국세상담센터 공식 안내 (call.nts.go.kr, 2026-08-08 조회 기준)</li>
            <li>국세청 연말정산 종합안내 (hometax.go.kr)</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
