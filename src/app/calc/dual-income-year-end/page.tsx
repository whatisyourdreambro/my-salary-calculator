// /calc/dual-income-year-end — 맞벌이 연말정산 몰아주기 시뮬레이터 (2026-08-31 신설, 승인 배치)
// 세법 로직은 src/lib/yearEndTaxCalculator.ts(정본 엔진) 호출 조합 — 신규 산식 없음.
// 근거: 소득세법 §50(기본공제)·§59의2(자녀세액공제)·§59의4(의료비·교육비·기부금 세액공제),
// 조세특례제한법 §126의2(신용카드 등 소득공제). 2026년 귀속(정산 2027년 1~2월) 기준.
// 갱신 슬롯: 2026-12 세법개정 확인 (공제 한도·자녀세액공제·카드공제 개정 여부)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Users, Info } from "lucide-react";
import DualIncomeYearEndClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "맞벌이 연말정산 몰아주기란 무엇인가요?",
    answer:
      "부부가 각각 연말정산을 하면서, 부부 중 누가 공제받을지 선택할 수 있는 항목(자녀 기본공제, 그 자녀의 의료비·교육비·기부금 등)을 세금이 더 많이 줄어드는 쪽에 귀속시키는 절세 방법입니다. 한계세율이 높은 쪽에 소득공제를 몰면 공제 1원당 절감액이 커지고, 반대로 의료비 세액공제는 총급여의 3% 초과분만 인정되므로 총급여가 낮은 쪽이 유리한 경우가 많습니다. 어느 쪽이 유리한지는 소득 구성에 따라 달라져 계산기로 시나리오를 비교해야 정확합니다.",
  },
  {
    question: "신용카드 사용액도 배우자에게 몰아줄 수 있나요?",
    answer:
      "아니요. 신용카드 등 사용금액 소득공제(조세특례제한법 제126조의2)는 각자 명의의 카드로 사용한 금액만 그 명의자가 공제받습니다. 이미 결제한 금액을 연말정산 시점에 배우자 쪽으로 옮기는 것은 불가능합니다. 가능한 전략은 하나뿐입니다 — 남은 기간 동안 어느 명의의 카드로 결제할지 미리 정하는 것입니다. 공제는 총급여의 25% 초과 사용분부터 시작되므로 문턱을 넘기기 쉬운(대개 총급여가 낮은) 배우자의 카드에 지출을 집중하는 것이 기본 전략입니다.",
  },
  {
    question: "자녀 기본공제는 부부 중 누가 받는 게 유리한가요?",
    answer:
      "자녀 1명당 150만원의 기본공제는 부부 중 한 사람만 받을 수 있습니다(중복 불가). 소득공제이므로 한계세율이 높은, 즉 총급여가 높은 쪽이 받는 것이 일반적으로 유리합니다. 다만 자녀의 의료비·교육비·기부금은 그 자녀의 기본공제를 받는 사람만 공제할 수 있어서, 자녀 의료비 지출이 크다면 3% 문턱이 낮은 저소득 배우자에게 자녀를 귀속시키는 것이 오히려 유리할 수 있습니다. 또 자녀세액공제(첫째 25만·둘째 30만·셋째 이상 40만원)는 자녀 수에 따라 커지므로 자녀를 쪼개 나누면 손해가 나기도 합니다. 이 계산기가 조합을 전수 비교해 최적안을 제시합니다.",
  },
  {
    question: "배우자를 위해 쓴 의료비는 누가 공제받나요?",
    answer:
      "의료비 세액공제는 예외적으로, 소득이 있는 배우자를 위해 지출한 의료비도 실제로 지출한 사람이 공제받을 수 있습니다(의료비는 부양가족 판정 시 나이·소득 요건을 보지 않는 특례). 즉 맞벌이라도 배우자의 수술비·치료비를 내가 결제했다면 내 연말정산에서 공제됩니다. 앞으로 발생할 의료비를 누구 카드·계좌로 결제할지 미리 정하는 것만으로 귀속을 선택할 수 있는, 사전 계획이 가능한 항목입니다.",
  },
  {
    question: "국세청 공식 맞벌이 절세 안내와는 무엇이 다른가요?",
    answer:
      "국세청 홈택스 편리한 연말정산 서비스는 매년 1~2월 정산 기간에 부부의 실제 간소화 자료를 바탕으로 한 맞벌이 근로자 절세 안내를 제공합니다. 실제 자료 기반이라 정확하지만, 부부 모두 홈택스 로그인(인증)이 필요하고 정산 기간에만 이용할 수 있습니다. 이 계산기는 로그인 없이 연중 언제든 대략의 유불리를 미리 시뮬레이션해 소비·결제 전략을 세우는 용도입니다. 최종 신고 전에는 반드시 국세청 공식 서비스로 검증하세요.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "맞벌이 연말정산 몰아주기 계산기",
  tagline: "자녀공제·의료비 최적 배분 시뮬레이션",
  description:
    "맞벌이 부부의 총급여·자녀·의료비·교육비·기부금을 입력하면 전부 본인/전부 배우자/최적 배분 시나리오별 부부 합산 결정세액을 비교하고 최적 몰아주기 조합을 제시합니다. 2026년 귀속 기준, 홈택스 로그인 없이 미리 계획.",
  path: "/calc/dual-income-year-end",
  keywords: [
    "맞벌이 연말정산",
    "연말정산 몰아주기",
    "맞벌이 연말정산 몰아주기",
    "자녀 기본공제 누가",
    "맞벌이 의료비 공제",
    "맞벌이 신용카드 공제",
    "맞벌이 부부 절세",
  ],
});

export default function DualIncomeYearEndPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "맞벌이 연말정산 몰아주기 계산기",
            description:
              "맞벌이 부부의 자녀 기본공제·의료비·교육비·기부금 귀속 시나리오별 부부 합산 결정세액을 비교해 최적 배분을 제시합니다.",
            url: "/calc/dual-income-year-end",
          }),
          autoBreadcrumbLd("/calc/dual-income-year-end", {
            leafName: "맞벌이 연말정산 몰아주기 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Users size={12} /> 2026년 귀속 · 정산은 2027년 1~2월
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              맞벌이 연말정산 몰아주기 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              자녀공제·의료비를 <strong className="text-electric">누구에게 몰아야</strong> 부부
              합산 세금이 최소가 되는지 시나리오 비교
            </p>
          </header>

          <DualIncomeYearEndClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              몰아줄 수 있는 것과 없는 것부터 구분하세요
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              맞벌이 절세의 절반은 <strong>배분 가능한 항목의 범위를 정확히 아는 것</strong>
              입니다. 부부가 선택할 수 있는 것은 다음 세 가지뿐입니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>자녀 기본공제 귀속</strong> — 자녀 1명당 150만원 소득공제는 부부 중 한
                사람만 받습니다(소득세법 제50조). 누구에게 올릴지 자녀별로 선택할 수 있고,
                자녀세액공제(첫째 25만·둘째 30만·셋째 이상 1명당 40만원, 소득세법
                제59조의2)도 기본공제를 받는 쪽에 따라갑니다.
              </li>
              <li>
                <strong>부양가족의 의료비·교육비·기부금 귀속</strong> — 그 부양가족의
                기본공제를 받는 사람만 공제할 수 있습니다(소득세법 제59조의4). 자녀를 누구에게
                올리느냐가 곧 그 자녀의 의료비·교육비·기부금 귀속을 결정합니다.
              </li>
              <li>
                <strong>배우자 의료비 — 지출한 쪽 공제 특례</strong> — 의료비는 부양가족 판정
                시 나이·소득 요건을 따지지 않아, 소득이 있는 배우자를 위해 지출한 의료비도
                실제 지출자가 공제받습니다. 앞으로 누가 결제할지만 정하면 되는, 사전 계획이
                가능한 항목입니다.
              </li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              반대로 <strong>신용카드 등 사용액 공제는 사후 배분이 불가능</strong>합니다. 각자
              명의 카드 사용분만 본인이 공제받으므로(조세특례제한법 제126조의2), 이미 쓴
              금액을 정산 때 옮길 방법은 없습니다. 또 맞벌이 부부는 서로에 대한 배우자
              공제(150만원)를 받을 수 없고, 본인의 보험료·연금계좌 납입액도 각자 것만
              공제됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              왜 몰아주는 방향에 따라 세금이 달라지나
            </h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>소득공제는 한계세율이 높은 쪽이 유리</strong> — 자녀 기본공제 150만원은
                세율 24% 구간에서는 36만원, 15% 구간에서는 22만 5천원을 줄입니다. 같은
                공제라도 귀속에 따라 절감액이 달라집니다.
              </li>
              <li>
                <strong>의료비는 총급여가 낮은 쪽이 유리한 경우가 많음</strong> — 의료비
                세액공제는 총급여의 3%를 초과한 금액의 15%만 인정됩니다. 총급여 6,000만원이면
                180만원을 넘겨야 하지만 4,000만원이면 120만원만 넘기면 되므로, 문턱이 낮은
                쪽에 몰아야 공제 대상 금액이 커집니다.
              </li>
              <li>
                <strong>자녀세액공제는 쪼개면 손해일 수 있음</strong> — 자녀 2명을 한 사람이
                공제하면 55만원(25만+30만)이지만, 한 명씩 나누면 각자 첫째 25만원씩 총
                50만원이 됩니다. 셋째부터는 1명당 40만원이라 격차가 더 벌어집니다.
              </li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              이렇게 유불리가 항목마다 반대 방향으로 작용하기 때문에 직관만으로는 답이 나오지
              않습니다. 이 계산기는 자녀 귀속 조합과 지출 귀속을 전수 비교해 부부 합산
              결정세액이 가장 작은 조합을 찾습니다. 결정세액이 줄어든 만큼 부부 합산 환급액이
              늘어나는 구조라(원천징수된 기납부세액은 배분과 무관하게 고정), 결정세액 비교가
              곧 환급액 비교입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              국세청 공식 서비스와 함께 쓰세요
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              국세청 홈택스의 <strong>편리한 연말정산</strong> 서비스는 정산 기간인 매년
              1~2월에 부부의 실제 간소화 자료 기반 <strong>맞벌이 근로자 절세 안내</strong>를
              제공합니다. 실제 지출 자료로 계산하므로 최종 판단은 그쪽이 정확하지만, 부부
              모두 로그인(인증)이 필요하고 정산 기간에만 열립니다. 이 계산기는{" "}
              <strong>로그인 없이 연중 언제든</strong> 유불리 방향을 미리 확인해, 연말까지
              남은 기간의 결제·지출 전략(누구 카드로 쓸지, 의료비를 누가 낼지)을 세우는
              용도로 설계했습니다. 둘은 대체재가 아니라 보완재입니다.
            </p>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              <strong>출처·기준일</strong>: 소득세법 제50조·제59조의2·제59조의4, 조세특례제한법
              제126조의2, 국세청 편리한 연말정산 서비스 안내 — 2026년 귀속(2027년 1~2월 정산)
              현행 법령 기준, 2026-08-31 작성.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group"
                >
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}
                    <span className="text-electric group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* FAQ 직하 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
          <GuideMidAd />

          {/* 연말정산 시즌 내부 링크 — 광고 아래 고정 배치 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              연말정산 준비 도구 모음
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/year-end-tax",
                  title: "연말정산 환급액 계산기",
                  desc: "내 몫의 환급·추가납부를 항목별로 정밀 계산",
                },
                {
                  href: "/year-end-tax-preview",
                  title: "연말정산 미리보기",
                  desc: "총급여만으로 결정세액 대략 확인",
                },
                {
                  href: "/year-end-tax-checklist",
                  title: "연말정산 체크리스트",
                  desc: "놓치기 쉬운 공제 서류·항목 점검",
                },
                {
                  href: "/credit-card-deduction-2026",
                  title: "신용카드 공제 계산기",
                  desc: "결제수단별 공제액·한도 정밀 계산",
                },
                {
                  href: "/medical-tax-credit-2026",
                  title: "의료비 세액공제 계산기",
                  desc: "3% 문턱·공제 대상 의료비 확인",
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-4 hover:border-electric transition-colors block"
                >
                  <div className="font-bold text-navy dark:text-canvas-50 mb-1">{l.title}</div>
                  <div className="text-xs text-faint-blue">{l.desc}</div>
                </Link>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 2026년 귀속 현행 법령의 일반 산식에 따른 참고용 시뮬레이션으로,
              소득세 기준(지방소득세 10% 별도)이며 일부 공제 한도를 단순화해 실제 절감액과
              차이가 날 수 있습니다. 부양가족 공제는 다른 가족(조부모 등)과의 중복 청구 시
              가산세 대상이 될 수 있으니, 최종 신고 전 국세청 홈택스 편리한 연말정산의 공식
              안내로 반드시 검증하세요.
            </p>
          </div>

          {/* 연말정산 시리즈 클러스터 — 마지막 광고 아래·RelatedCalculators 직전 고정 (L14', 2026-09-05) */}
          <YearEndTaxCluster />

          <RelatedCalculators currentPath="/calc/dual-income-year-end" />
        </div>
      </main>
    </>
  );
}
