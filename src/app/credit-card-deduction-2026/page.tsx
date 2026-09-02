// src/app/credit-card-deduction-2026/page.tsx
// 신용카드 소득공제 계산기 — 연말정산 시즌(12~2월) 검색 수요 선점 페이지
// 2026년 귀속(2027년 1~2월 정산) 현행법 기준. 조세특례제한법 제126조의2
// (2025-12-02 국회 의결로 2028-12-31까지 3년 연장 확정 — 2026년 사용분 유효).
// ★2026년 귀속 신규: 자녀 수(최대 2명분)에 따른 기본공제 한도 상향 반영.
// 소비증가분 추가공제(전년 대비 5% 초과분 10%)는 2025년 사용분까지만 확인되어 미반영.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
// 부활 팩 ④ (운영자 승인 2026-08-31) — CPA 오퍼 슬롯 (allcredit pages 명시 페이지 — 즉시 노출)
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import CreditCardDeductionClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "신용카드 소득공제 계산기 2026 — 공제한도·예상 절세액 즉시 계산",
  description:
    "총급여의 25% 초과 사용분부터 신용카드 15%·체크/현금영수증 30%·전통시장/대중교통 40% 공제. 2026년 귀속 자녀 수별 한도 상향(최대 400만원)까지 반영해 최종 소득공제액과 예상 절세액을 즉시 계산합니다.",
  path: "/credit-card-deduction-2026",
  keywords: [
    "신용카드 소득공제 계산기",
    "신용카드 소득공제",
    "카드 소득공제 한도",
    "체크카드 소득공제",
    "현금영수증 소득공제",
    "연말정산 카드공제",
    "전통시장 소득공제",
    "대중교통 소득공제",
    "문화비 소득공제",
    "2026 연말정산",
  ],
});

const FAQS = [
  {
    q: "신용카드 소득공제는 얼마부터 받을 수 있나요?",
    a: "연간 카드·현금영수증 사용액 합계가 총급여의 25%(최저사용금액)를 초과해야 그 초과분부터 공제가 시작됩니다. 예를 들어 총급여 4,000만원이면 연 1,000만원을 넘게 써야 하고, 1,000만원 이하로 쓰면 공제액은 0원입니다. 근로소득자라면 총급여 요건 없이 누구나 대상입니다.",
  },
  {
    q: "신용카드와 체크카드 중 뭐가 더 유리한가요?",
    a: "공제율은 신용카드 15%, 체크카드·현금영수증 30%로 체크카드가 2배 높습니다. 다만 최저사용금액(총급여의 25%)은 공제율이 낮은 신용카드 사용분부터 차감되므로, 25% 문턱까지는 포인트·할인 혜택이 좋은 신용카드를 쓰고 문턱을 넘긴 이후부터 체크카드·현금영수증을 쓰는 것이 유리한 '황금비율' 전략입니다.",
  },
  {
    q: "2026년 공제 한도는 어떻게 되나요?",
    a: "2026년 귀속부터 자녀(손자녀 포함) 수에 따라 기본공제 한도가 상향됩니다. 총급여 7,000만원 이하는 자녀 0명 300만·1명 350만·2명 이상 400만원, 7,000만원 초과는 250만·275만·300만원입니다(1명당 50만/25만원, 최대 2명분). 여기에 전통시장·대중교통(7,000만원 이하는 문화비 포함) 공제액으로 추가 한도 300만원(초과자는 200만원)이 더해져, 이론상 최대 600만~700만원(초과자 450만~500만원)까지 공제됩니다.",
  },
  {
    q: "작년에 있던 소비증가분 추가공제는 2026년에도 받을 수 있나요?",
    a: "전년 대비 5% 초과 증가분의 10%를 추가 공제(한도 100만원)하는 소비증가분 특례는 2025년 사용분까지만 확인됩니다. 2026년 사용분에 대한 연장은 2025년 12월 개정세법 정리 자료에서 확인되지 않아 본 계산기에는 반영하지 않았습니다. 추후 세법 개정으로 재도입될 수 있으니 연말정산 시점에 국세청 안내를 확인하세요.",
  },
  {
    q: "문화비(도서·공연·영화·헬스장) 공제는 누가 받나요?",
    a: "총급여 7,000만원 이하 근로자만 도서·신문·공연·박물관·미술관·영화관람료·체육시설 사용분에 30% 공제율을 적용받습니다. 헬스장·수영장 시설이용료는 2025년 7월 1일부터 문화비에 포함됐고 2026년 귀속은 연중(1~12월) 적용됩니다. 단 PT 등 강습이 결합된 결제는 50%만 문화비로 산입됩니다. 총급여 7,000만원 초과자의 문화비 지출은 결제수단에 따라 일반 공제율(신용 15%·체크 30%)이 적용됩니다.",
  },
  {
    q: "공제에서 제외되는 사용액도 있나요?",
    a: "세금·공과금, 통신요금, 신차 구입비, 해외 사용분 등은 통상 공제 대상에서 제외되며, 중고차 구입비는 결제액의 10%만 공제 대상에 산입됩니다(국세청 연말정산 안내 통상 기준). 본 계산기에는 공제 대상 사용액만 입력해야 정확한 결과가 나옵니다. 실제 공제 대상 분류는 홈택스 연말정산 간소화 자료에서 자동으로 확인됩니다.",
  },
  {
    q: "2027년부터는 무엇이 바뀌나요?",
    a: "2026년 8월 3일 발표된 세제개편안에는 대중교통 40% 우대공제 폐지(기본공제로 일원화), 문화비 총급여 7,000만원 요건 폐지, 추가공제 한도 100만원씩 하향(300만→200만/200만→100만)이 담겨 있습니다. 다만 모두 국회 통과가 필요하고 2027년 1월 1일 이후 개시 과세기간부터 적용 예정이므로, 2026년 사용분(2027년 초 정산)에는 적용되지 않습니다.",
  },
  {
    q: "이 계산기 결과는 얼마나 정확한가요?",
    a: "조세특례제한법 제126조의2(2025년 12월 개정으로 2028년 12월 31일까지 적용 연장 확정)의 2026년 귀속 현행법 기준으로 계산하며, 2026년 8월 기준 국가법령정보센터 조문과 개정세법 해설 자료를 교차 확인해 만들었습니다. 다만 공제 제외 항목의 정밀 분류, 개인별 과세표준 차이 등에 따라 실제 정산 결과와 다를 수 있는 간이 계산입니다. 최종 확인은 국세청 홈택스 연말정산 미리보기를 이용하세요.",
  },
];

const HOWTO_STEPS = [
  {
    name: "총급여 입력",
    text: "연간 세전 총급여를 입력합니다. 총급여의 25%가 공제 시작 문턱(최저사용금액)이 됩니다.",
  },
  {
    name: "자녀 수 선택",
    text: "자녀(손자녀 포함) 수를 선택합니다. 2026년 귀속부터 자녀 1명당 기본공제 한도가 50만원(총급여 7,000만원 초과자는 25만원)씩, 최대 2명분까지 상향됩니다.",
  },
  {
    name: "결제수단별 사용액 입력",
    text: "신용카드·체크카드/현금영수증·전통시장·대중교통·문화비 사용액을 각각 입력합니다. 공제율이 15~40%로 다르기 때문에 구분 입력이 필요합니다.",
  },
  {
    name: "결과 확인",
    text: "최종 소득공제액과 예상 절세액, 25% 문턱까지 남은 금액, 한도 도달 여부를 확인합니다.",
  },
];

export default function CreditCardDeduction2026Page() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/credit-card-deduction-2026", {
            leafName: "신용카드 소득공제 계산기 2026",
          }),
          softwareApplicationLd({
            name: "신용카드 소득공제 계산기 2026",
            description:
              "총급여·결제수단별 사용액으로 2026년 귀속 신용카드 등 소득공제액과 예상 절세액 산출",
            url: "/credit-card-deduction-2026",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "신용카드 소득공제 계산하는 방법",
            description:
              "총급여와 결제수단별 사용액을 입력해 연말정산 카드 소득공제액을 1분 안에 계산",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs
          path="/credit-card-deduction-2026"
          leafName="신용카드 소득공제 계산기 2026"
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            연말정산 시즌 페이지
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            신용카드 소득공제 계산기 2026
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            총급여와 결제수단별 사용액을 입력하면 2026년 귀속(2027년 초 연말정산)
            신용카드 등 사용금액 소득공제액을 즉시 계산합니다. 총급여의 25%
            문턱까지 얼마나 남았는지, 신용 15%·체크/현금영수증 30%·전통시장/대중교통
            40% 공제율과 2026년 새로 도입된 자녀 수별 한도 상향(최대 400만원 +
            추가 300만원)까지 모두 반영해 예상 절세액을 보여줍니다.
          </p>
        </header>

        <HomeTopAd />

        <CreditCardDeductionClient />

        <CalcResultAd />

        {/* 부활 팩 ④ (운영자 승인 2026-08-31): CalcResultAd 직후 CPA 오퍼 — 하단 쿠팡은 폴백 유지 */}
        <OfferSlot vertical="loan" />

        {/* 연말정산 클러스터 칩 — 메쉬 비대칭 해소 (2026-08-23). 광고 아래 배치 준수 */}
        <YearEndTaxCluster />

        {/* 가이드 콘텐츠 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            신용카드 소득공제 계산 공식
          </h2>
          <p>
            <strong>1단계 — 최저사용금액(문턱) 확인:</strong> 공제는 연간
            카드·현금영수증 사용액 합계가 <strong>총급여의 25%</strong>를 넘어야
            시작됩니다. 총급여 4,000만원이면 1,000만원, 6,000만원이면
            1,500만원이 문턱입니다. 문턱에 못 미치면 공제액은 0원입니다.
          </p>
          <p>
            <strong>2단계 — 결제수단별 공제율 적용:</strong> 신용카드 15%,
            체크카드·선불카드·현금영수증 30%, 문화비(총급여 7,000만원 이하만)
            30%, 전통시장 40%, 대중교통 40%를 각각 곱합니다. 최저사용금액
            차감은 공제율이 낮은 결제수단(신용카드)부터 소진되므로, 같은 금액을
            써도 <strong>문턱까지는 신용카드, 그 이후는 체크·현금</strong>으로
            쓰는 쪽이 공제액이 커집니다.
          </p>
          <p>
            <strong>3단계 — 한도 적용:</strong> 기본공제 한도(아래 표)를 먼저
            적용하고, 한도를 넘는 공제액이 있으면 전통시장·대중교통(총급여
            7,000만원 이하는 문화비 포함) 공제액에 한해 추가 한도(300만원, 초과자
            200만원)만큼 더 공제됩니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            2026년 새로 바뀐 것 — 자녀 수별 기본공제 한도 상향
          </h2>
          <p>
            2025년 12월 개정세법으로 <strong>2026년 1월 1일 이후 과세기간부터</strong>{" "}
            자녀(손자녀 포함) 수에 따라 기본공제 한도가 올라갑니다. 자녀 1명당
            50만원(총급여 7,000만원 초과자는 25만원)씩, 최대 2명분까지 가산되며
            셋째부터는 추가되지 않습니다.
          </p>
          <div className="not-prose overflow-x-auto my-4">
            <table className="w-full min-w-[420px] text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-canvas-200 dark:border-canvas-700 text-navy dark:text-canvas-50">
                  <th className="py-2 px-3 text-left font-black">총급여</th>
                  <th className="py-2 px-3 text-right font-black">자녀 0명</th>
                  <th className="py-2 px-3 text-right font-black">1명</th>
                  <th className="py-2 px-3 text-right font-black">2명 이상</th>
                </tr>
              </thead>
              <tbody className="text-muted-blue dark:text-canvas-300">
                <tr className="border-b border-canvas-200 dark:border-canvas-700">
                  <td className="py-2 px-3 font-bold">7,000만원 이하</td>
                  <td className="py-2 px-3 text-right">300만원</td>
                  <td className="py-2 px-3 text-right">350만원</td>
                  <td className="py-2 px-3 text-right">400만원</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold">7,000만원 초과</td>
                  <td className="py-2 px-3 text-right">250만원</td>
                  <td className="py-2 px-3 text-right">275만원</td>
                  <td className="py-2 px-3 text-right">300만원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            추가 한도까지 더하면 이론상 최대 공제액은 총급여 7,000만원 이하{" "}
            <strong>600만원(자녀 2명 이상 시 700만원)</strong>, 초과자
            450만원(자녀 2명 이상 시 500만원)입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            25% 문턱을 넘기는 황금비율 전략
          </h2>
          <p>
            최저사용금액 차감은 공제율이 낮은 신용카드 사용분부터 이뤄집니다.
            따라서 <strong>총급여의 25%까지는 혜택(포인트·할인)이 좋은
            신용카드</strong>를 쓰고, 문턱을 넘긴 뒤부터는{" "}
            <strong>공제율 30%인 체크카드·현금영수증</strong>을 쓰는 것이 공제액을
            극대화하는 정석입니다. 전통시장·대중교통 지출은 40% 공제율에 별도
            추가 한도까지 있으므로 기본 한도가 꽉 찬 고소득·고지출자에게 특히
            효과적입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            헬스장·수영장도 문화비 공제 대상
          </h2>
          <p>
            2025년 7월 1일부터 체육시설(헬스장·수영장) 시설이용료가 문화비
            소득공제에 포함됐고, 2026년 귀속분은 1~12월 연중 적용됩니다. 순수
            시설이용료는 전액 문화비로 인정되지만,{" "}
            <strong>PT 등 강습이 결합된 결제는 50%만 산입</strong>됩니다. 문화비
            30% 공제율은 총급여 7,000만원 이하 근로자만 적용받으며, 초과자는 해당
            지출이 결제수단별 일반 공제율(신용 15%·체크 30%)로 계산됩니다.
          </p>
        </section>

        {/* 가이드 본문 끝 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
        <GuideMidAd />
        {/* 2027년 귀속 개정 예정 — 국회 통과 필요, 별도 안내 박스 */}
        <aside className="my-8 rounded-2xl p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="font-black text-amber-900 dark:text-amber-200 mb-2 text-sm">
            2027년 귀속부터 바뀔 수 있는 것 (2026-08-03 세제개편안 — 국회 통과
            필요)
          </p>
          <ul className="text-xs leading-6 text-amber-800 dark:text-amber-300 list-disc pl-4 space-y-1">
            <li>대중교통 40% 우대공제 폐지 (기본공제로 일원화, 재정지원 전환)</li>
            <li>문화비 총급여 7,000만원 이하 요건 폐지</li>
            <li>추가공제 한도 100만원씩 하향 (300만→200만 / 200만→100만)</li>
          </ul>
          <p className="mt-2 text-xs leading-6 text-amber-800 dark:text-amber-300">
            모두 2027년 1월 1일 이후 개시 과세기간부터 적용 예정이므로{" "}
            <strong>2026년 사용분 연말정산에는 적용되지 않습니다.</strong> 개편안
            전체 내용은{" "}
            <Link href="/tax-reform-2026" className="underline font-bold">
              2026 세법개정안 총정리
            </Link>
            에서 확인하세요.
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

        {/* 면책 + 출처 */}
        <aside className="my-8 rounded-2xl p-5 bg-canvas-50 dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700">
          <p className="text-xs leading-6 text-muted-blue dark:text-canvas-300">
            <strong className="text-navy dark:text-canvas-100">면책 안내:</strong>{" "}
            본 계산기는 2026년 귀속 현행 세법 기준의 간이 계산 도구입니다. 공제
            제외 항목(세금·공과금·통신요금·신차 구입비·해외 사용분 등)의 정밀
            분류, 급여·가족 상황 변동, 추후 세법 개정에 따라 실제 연말정산
            결과와 차이가 날 수 있습니다. 법적 효력이 있는 확인은 국세청 홈택스
            연말정산 미리보기와 회사 연말정산 담당 부서를 통해 진행하세요.
          </p>
          <p className="mt-3 text-xs leading-6 text-faint-blue">
            출처: 국가법령정보센터 조세특례제한법 제126조의2(2025-12-23 공포,
            2028-12-31까지 적용 연장) · 국세청 연말정산 안내 · 문화체육관광부
            보도자료(체육시설 문화비 포함, 2025-07-01 시행) · 기획재정부 2026년
            세제개편안(2026-08-03 발표). 기준일 2026-08-08.
          </p>
        </aside>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        <RelatedCalculators
          currentPath="/credit-card-deduction-2026"
          title="연말정산과 함께 보면 좋은 도구"
        />

        <div className="my-8">
          <ShareButtons
            title="신용카드 소득공제 계산기 2026"
            description="총급여 25% 문턱부터 자녀 수별 한도 상향까지 — 카드 공제액·절세액 1분 계산"
          />
        </div>

        {/* 관련 링크 직후 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <MultiplexAd />
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
                13월의 월급 미리 계산
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
              href="/income-tax-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                종합소득세 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                8단계 누진세율 산출
              </p>
            </Link>
            <Link
              href="/tax-reform-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                2026 세법개정안 총정리
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                2027년 카드공제 개편 내용
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
          </div>
        </section>
      </div>
    </main>
  );
}
