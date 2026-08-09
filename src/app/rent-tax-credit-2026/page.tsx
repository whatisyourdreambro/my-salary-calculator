// src/app/rent-tax-credit-2026/page.tsx
// 월세 세액공제 계산기 — 연말정산 시즌(12~2월) 검색 수요 선점 페이지.
// 2026년 귀속(현행법, 조세특례제한법 제95조의2) 기준. 국세청 공식 안내(2026-08 조회) 검증분.

import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import RentTaxCreditClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "월세 세액공제 계산기 2026 — 최대 170만원, 15%·17% 자동 판정",
  description:
    "2026년 귀속 월세 세액공제 즉시 계산. 총급여 5,500만원 이하 17%·8,000만원 이하 15%, 연 1,000만원 한도로 최대 170만원 세액공제. 무주택 세대주·전입신고·오피스텔 포함 요건까지 1분 확인.",
  path: "/rent-tax-credit-2026",
  keywords: [
    "월세 세액공제",
    "월세 세액공제 계산기",
    "월세 세액공제 조건",
    "월세 환급",
    "연말정산 월세 공제",
    "월세 세액공제 한도",
    "무주택 세대주 월세 공제",
    "오피스텔 월세 세액공제",
    "주말부부 월세 세액공제",
    "월세 공제 15% 17%",
  ],
});

const FAQS = [
  {
    q: "월세 세액공제는 누가 받을 수 있나요?",
    a: "다음 요건을 모두 충족한 근로자입니다. ① 과세기간 종료일(12월 31일) 현재 무주택 세대의 세대주(세대주가 주택자금공제·주택마련저축공제 등 주택 관련 공제를 받지 않았다면 세대원도 가능), ② 총급여 8,000만원 이하(종합소득금액 7,000만원 초과 시 제외), ③ 국민주택규모(전용 85㎡) 이하 또는 기준시가 4억원 이하 주택 임차, ④ 임대차계약증서 주소지와 주민등록등본 주소지 일치(전입신고 필수), ⑤ 임대차계약이 본인 또는 본인의 기본공제대상자 명의일 것. 근거는 조세특례제한법 제95조의2입니다.",
  },
  {
    q: "공제율은 15%와 17% 중 어떻게 정해지나요?",
    a: "총급여 기준으로 자동 판정됩니다. 총급여 5,500만원 이하(종합소득금액 4,500만원 이하)는 17%, 총급여 5,500만원 초과~8,000만원 이하는 15%입니다. 총급여가 정확히 5,500만원이면 '이하'에 포함되어 17%가 적용됩니다. 단 총급여 5,500만원 이하라도 종합소득금액이 4,500만원을 초과하면 15%가 적용됩니다.",
  },
  {
    q: "공제 한도와 최대 공제액은 얼마인가요?",
    a: "공제 대상 월세 한도는 연 1,000만원입니다(2026년 귀속 현행법 기준). 따라서 최대 세액공제액은 17% 적용 시 170만원, 15% 적용 시 150만원입니다. 예를 들어 월세 90만원(연 1,080만원)을 냈다면 1,000만원까지만 공제 대상이 되어, 총급여 5,500만원 이하라면 1,000만원 × 17% = 170만원을 공제받습니다.",
  },
  {
    q: "오피스텔·고시원 월세도 공제되나요?",
    a: "됩니다. 아파트·단독주택·다가구주택 외에 주거용 오피스텔과 고시원도 공제 대상에 포함됩니다. 다만 해당 주택이 국민주택규모(전용 85㎡) 이하이거나 기준시가 4억원 이하여야 하며(둘 중 하나만 충족하면 됨), 전입신고가 되어 있어야 합니다.",
  },
  {
    q: "세대주가 아닌 세대원도 받을 수 있나요?",
    a: "세대주가 주택자금공제·주택마련저축공제 등 주택 관련 공제를 받지 않은 경우에는 세대원도 공제받을 수 있습니다. 이때 임대차계약은 본인 또는 본인의 기본공제대상자 명의여야 하고, 월세도 공제받는 본인 기준으로 지급된 것이어야 합니다.",
  },
  {
    q: "전입신고를 안 했으면 공제받을 수 있나요?",
    a: "받을 수 없습니다. 임대차계약증서의 주소지와 주민등록등본의 주소지가 같아야 하므로 전입신고는 필수 요건입니다. 아직 전입신고를 하지 않았다면 정부24 또는 주민센터에서 전입신고를 마친 뒤, 그 이후에 지급하는 월세분부터 공제받을 수 있습니다.",
  },
  {
    q: "주말부부인데 부부가 각자 공제받을 수 있나요?",
    a: "2026년 1월 1일 이후 지출분부터는 세대주와 주소를 달리하는 세대주의 배우자(주말부부)도 요건을 충족하면 각각 공제받을 수 있습니다(2025년 12월 개정 사항). 다만 부부 합산 한도는 연 1,000만원으로 동일하므로, 두 사람의 공제 대상 월세를 합쳐 1,000만원까지만 인정됩니다.",
  },
  {
    q: "집주인 동의가 필요한가요? 어떤 서류를 내야 하나요?",
    a: "임대인(집주인)의 동의는 필요하지 않습니다. 연말정산 시 회사에 주민등록등본, 임대차계약증서 사본, 월세 지급을 증명할 수 있는 서류(계좌이체 확인서·무통장입금증 등)를 제출하면 됩니다. 계약서에 월세 공제 금지 특약이 있어도 공제 신청에는 영향이 없습니다. 과거 연도분을 놓쳤다면 경정청구로 소급 신청할 수 있으니 기한 등 상세는 국세청 홈택스에서 확인하세요.",
  },
  {
    q: "공제액이 산출세액보다 크면 차액을 환급받나요?",
    a: "아니요. 월세 세액공제는 산출세액 한도 내에서만 차감되는 세액공제라서, 산출세액을 초과하는 부분은 환급되지 않습니다(농어촌특별세 비대상). 또한 해당 과세기간에 실제 지급한 월세만 대상이므로 연체분·선납분은 실제 귀속 시기를 따져 구분해야 합니다.",
  },
  {
    q: "이 계산기의 수치는 어디에 근거하나요?",
    a: "조세특례제한법 제95조의2(월세액 세액공제)와 국세청 공식 안내 페이지(nts.go.kr)를 2026년 8월 기준으로 확인해 반영했습니다(공제율 15%·17%, 한도 연 1,000만원, 총급여 8,000만원 요건 등). 2027년 귀속부터 적용 예정인 한도 확대(연 1,200만원)와 청년 17% 일괄 적용은 2026년 8월 발표된 세제개편안으로 국회 통과가 필요하며, 이 계산기에는 반영하지 않았습니다. 본 계산기는 간이 계산 도구로 실제 연말정산 결과와 차이가 있을 수 있습니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "총급여 입력",
    text: "비과세를 제외한 연간 총급여를 입력합니다. 5,500만원 이하면 17%, 5,500만원 초과~8,000만원 이하면 15%가 자동 적용됩니다.",
  },
  {
    name: "월세액·지급 개월 수 입력",
    text: "매달 내는 월세와 올해 실제로 지급한 개월 수를 입력합니다. 보증금은 입력하지 않습니다.",
  },
  {
    name: "공제 요건 체크",
    text: "무주택 세대(세대주 또는 요건 충족 세대원), 전용 85㎡ 이하 또는 기준시가 4억원 이하, 전입신고 완료 여부를 확인합니다.",
  },
  {
    name: "결과 확인",
    text: "공제율 자동 판정, 연 1,000만원 한도를 적용한 공제 대상액과 예상 세액공제액을 확인합니다.",
  },
];

export default function RentTaxCredit2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/rent-tax-credit-2026", { leafName: "월세 세액공제 계산기 2026" }),
          softwareApplicationLd({
            name: "월세 세액공제 계산기 2026",
            description: "총급여·월세액으로 2026년 귀속 월세 세액공제액(15%·17%, 연 1,000만원 한도) 자동 산출",
            url: "/rent-tax-credit-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "월세 세액공제 계산하는 방법 (2026년 귀속)",
            description: "총급여와 월세액을 입력해 연말정산 월세 세액공제액을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/rent-tax-credit-2026" leafName="월세 세액공제 계산기 2026" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            2026년 귀속 연말정산 대비
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            월세 세액공제 계산기 2026
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            총급여와 월세액을 입력하면 2026년 귀속(2027년 1~2월 연말정산) 월세 세액공제액을
            즉시 계산합니다. 총급여 5,500만원 이하 17%·8,000만원 이하 15% 자동 판정, 공제 대상
            월세 연 1,000만원 한도 적용으로 최대 170만원까지 세금에서 바로 빼 줍니다. 무주택
            세대주 요건과 오피스텔·고시원 포함 여부까지 한 번에 확인하세요. 근거: 조세특례제한법
            제95조의2.
          </p>
        </header>

        <HomeTopAd />

        <RentTaxCreditClient />

        <CalcResultAd />

        {/* 제도 설명 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            월세 세액공제란?
          </h2>
          <p>
            조세특례제한법 제95조의2에 따라 무주택 세대의 근로자가 지급한 월세의{" "}
            <strong>15% 또는 17%를 산출세액에서 직접 빼 주는 제도</strong>입니다. 과세표준을
            줄여 주는 소득공제와 달리 세액공제는 계산된 세금에서 그대로 차감되기 때문에 체감
            환급 효과가 큽니다. 공제 대상 월세는 연 1,000만원까지 인정되므로 최대 공제액은
            170만원(17% 적용 시)입니다. 월세 세입자라면{" "}
            <Link href="/year-end-tax">연말정산 환급금 계산</Link>에서 가장 먼저 챙겨야 할
            항목입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            2026년 귀속 공제 요건 5가지 (모두 충족)
          </h2>
          <ol>
            <li>
              <strong>무주택 세대의 세대주</strong> — 과세기간 종료일(12월 31일) 기준. 세대주가
              주택자금공제·주택마련저축공제 등 주택 관련 공제를 받지 않았다면{" "}
              <strong>세대원도 가능</strong>합니다.
            </li>
            <li>
              <strong>총급여 8,000만원 이하</strong> 근로자 — 종합소득금액 7,000만원 초과 시
              제외됩니다.
            </li>
            <li>
              <strong>국민주택규모(전용 85㎡) 이하 또는 기준시가 4억원 이하</strong> — 둘 중
              하나만 충족하면 됩니다. 아파트·단독·다가구 외에{" "}
              <strong>주거용 오피스텔·고시원도 포함</strong>됩니다.
            </li>
            <li>
              <strong>임대차계약증서 주소지 = 주민등록등본 주소지</strong> — 전입신고가
              필수입니다.
            </li>
            <li>
              <strong>임대차계약은 본인 또는 본인의 기본공제대상자 명의</strong>여야 합니다.
            </li>
          </ol>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            공제율·한도 — 경계값까지 정확히
          </h2>
          <p>
            공제율은 2단계입니다. 총급여 <strong>5,500만원 이하</strong>(종합소득금액 4,500만원
            이하)는 <strong>17%</strong>, 총급여 <strong>5,500만원 초과~8,000만원 이하</strong>는{" "}
            <strong>15%</strong>. 총급여가 정확히 5,500만원이면 &lsquo;이하&rsquo;에 포함되어
            17%가 적용됩니다.
          </p>
          <p>
            예시: 총급여 5,500만원 근로자가 월세 90만원을 12개월 냈다면 연간 월세는
            1,080만원입니다. 공제 대상은 한도가 적용된 min(1,080만원, 1,000만원) = 1,000만원이고,
            세액공제액은 1,000만원 × 17% = <strong className="text-electric">170만원</strong>
            입니다. 한도를 넘긴 80만원분은 공제 대상에서 제외됩니다.
          </p>
          <p>
            주의할 점: 해당 과세기간에 <strong>실제 지급한 월세만</strong> 대상이며(연체·선납은
            실제 귀속 시기로 구분), 산출세액을 초과하는 공제액은 환급되지 않습니다. 2026년 1월
            1일 이후 지출분부터는 세대주와 주소를 달리하는{" "}
            <strong>세대주의 배우자(주말부부)도 각각 공제</strong>받을 수 있게 되었는데, 이때도
            부부 합산 한도는 연 1,000만원입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            신청 방법과 준비 서류
          </h2>
          <p>
            연말정산 간소화 서비스에 월세 내역이 자동으로 잡히지 않는 경우가 많아{" "}
            <strong>직접 서류를 챙겨야</strong> 합니다. 회사에 ① 주민등록등본, ② 임대차계약증서
            사본, ③ 월세 지급 증빙(계좌이체 확인서·무통장입금증 등)을 제출하면 됩니다.
            임대인 동의는 필요 없고, 계약서에 공제 금지 특약이 있어도 신청할 수 있습니다.
            과거 연도분을 놓쳤다면 경정청구로 소급 신청이 가능하니 상세 기한은 국세청
            홈택스에서 확인하세요.
          </p>
        </section>

        {/* 2027년 귀속 개정 예정 — 국회 통과 필요, 안내 전용 */}
        <div className="my-8 rounded-2xl border-2 border-electric-20 bg-electric-5 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
            2027년 귀속 개정 예정 — 국회 통과 필요 (이 계산기에는 미반영)
          </p>
          <p className="text-sm leading-7 text-navy dark:text-canvas-100">
            2026년 8월 3일 발표된 세제개편안에 따르면, <strong>2027년 1월 1일 이후 지급하는
            월세분부터</strong> 공제 대상 월세 한도가 연 1,000만원 →{" "}
            <strong>연 1,200만원</strong>으로 확대되고, <strong>청년(15~34세)은 소득 수준과
            무관하게 17%</strong>가 일괄 적용될 예정입니다(2029년 12월 31일까지 한시). 위
            예시(월세 90만원 = 연 1,080만원, 총급여 5,500만원)가 2027년 귀속이라면 1,080만원
            전액 × 17% = 183만 6천원으로 공제액이 늘어납니다. 다만 이는{" "}
            <strong>국회 통과가 필요한 개정안</strong>이며, 2026년 지급분에는 적용되지 않습니다.
          </p>
        </div>

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
                본 계산기는 총급여 기준의 간이 계산으로, 종합소득금액 요건(4,500만원·7,000만원)과
                산출세액 한도는 개인별 정산 자료에 따라 달라질 수 있습니다. 실제 공제액은
                연말정산·종합소득세 신고 결과로 확정되며, 정확한 내용은 국세청 홈택스 또는
                세무 전문가에게 확인하세요.
              </span>
            </span>
          </p>
        </aside>

        {/* 출처 */}
        <section className="my-8 text-xs text-faint-blue leading-6">
          <h2 className="text-sm font-bold text-navy dark:text-canvas-100 mb-2">출처·근거</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>조세특례제한법 제95조의2 (월세액에 대한 세액공제)</li>
            <li>국세청 공식 안내 — 월세액 세액공제 (nts.go.kr, 2026년 8월 조회 기준)</li>
            <li>
              2027년 귀속 개정 예정 사항: 기획재정부 2026년 8월 3일 세제개편안 (국회 통과 필요,
              미확정)
            </li>
          </ul>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* RelatedCalculators 자동 추천 (dead-end 차단) */}
        <RelatedCalculators
          currentPath="/rent-tax-credit-2026"
          title="이 계산과 함께 보면 좋은 도구"
        />

        {/* ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons
            title="월세 세액공제 계산기 2026"
            description="총급여·월세액으로 최대 170만원 세액공제 1분 계산"
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
                13월의 월급, 환급액 미리 계산
              </p>
            </Link>
            <Link
              href="/tools/finance/irp"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                IRP·연금저축 절세 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                세액공제 환급 극대화 전략
              </p>
            </Link>
            <Link
              href="/calc/jeonse-loan"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                전세대출 한도·이자 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                월세 vs 전세 갈아타기 판단
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
          </div>
        </section>
      </div>
    </main>
  );
}
