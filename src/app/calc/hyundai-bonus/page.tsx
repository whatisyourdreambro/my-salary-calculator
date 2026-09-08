// src/app/calc/hyundai-bonus/page.tsx
//
// 현대자동차 임단협 성과급·격려금 계산기.
// 임단협 합의 결과를 기준으로 한 본인 받을 금액 계산기.
// 2026 타결(8/31 가결, 운영자 승인 2026-09-03 반영): 기본급 +10만 / 성과금 400%+1,270만 /
//   주식 15주 / 복지포인트 50만 / 하계휴가비 +20만. 출처 머니투데이·한국경제 2026-09-01.
// 2025 합의(전년): 기본급 +10만 / 성과금 450%+1,580만 / 무상주 30주 / 상품권 20만.
// ★갱신 슬롯: 매년 8~9월 임협 타결 보도 → Client.tsx SCENARIOS·본문·FAQ·bonusData·허브 hook 동기화.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "@/components/AppLink";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import BonusClusterLinks from "@/components/BonusClusterLinks";
import { GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Car, AlertTriangle, Info } from "lucide-react";
import HyundaiBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hyundai-bonus";
const PAGE_TITLE = "현대차 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "현대자동차 성과급을 2026 임협 타결 보도와 2025 합의 시나리오로 비교합니다. 월 기준금액·주가 가정에 따른 현금·주식·포인트 합산 가치와 예상 공제액을 확인하세요. 회사의 개인별 지급 확정액은 아닙니다.";

const FAQ_ITEMS = [
  {
    question: "현대차 성과급은 어떻게 계산되나요?",
    answer:
      "본 계산기는 공개 보도에 기재된 정률(%) + 정액 + 주식 + 포인트·상품권을 합산하는 시나리오입니다. 2026년 타결 보도(8월 31일 찬반투표 가결)의 성과금 400% + 정액 1,270만원 / 주식 15주 / 복지포인트 50만원과, 2025년 합의의 450% + 정액 1,580만원 / 무상주 30주를 비교합니다. 회사가 성과금 산정에 사용하는 본인의 월 기준금액을 입력하면 정률 부분을 환산합니다. 기본급 인상·휴가비 인상 등은 계산 결과에 별도로 합산하지 않습니다.",
  },
  {
    question: "기본급은 어떻게 정하나요?",
    answer:
      "입력란은 회사가 해당 성과금의 정률 부분을 계산할 때 사용하는 월 기준금액입니다. 연봉이나 연봉을 12로 나눈 값을 그대로 넣지 마세요. 급여명세서의 기본급과 각종 수당을 포함한 통상임금이 같은 금액이라고 가정해서도 안 됩니다. 적용 항목은 본인에게 해당하는 합의안·회사 지급 안내에서 확인하세요. 세후 추정에는 입력한 월 기준금액의 18배를 연봉으로 보는 별도 가정이 사용됩니다.",
  },
  {
    question: "주식 15주는 얼마나 가치가 있나요?",
    answer:
      "계산기의 주식 가치는 주식 수에 사용자가 입력한 주가를 곱한 평가액입니다. 기본 입력값 23만원은 예시이며 현재가나 2026년 평균 주가가 아닙니다. 이 예시에서 15주는 345만원입니다. 실제 지급 조건·평가일·매매 제한·과세 처리는 회사 안내와 적용 규정을 확인해야 하며, 주식 평가액이 지급일의 현금 입금액을 뜻하지는 않습니다.",
  },
  {
    question: "성과금 400% 는 무엇의 400%인가요?",
    answer:
      "계산기에 입력한 월 기준금액의 4배입니다. 기준금액 500만원이면 정률 성과금은 2,000만원입니다. 2026 보도 시나리오에서 정액 1,270만원, 주식 15주를 주당 23만원으로 가정한 345만원, 포인트 50만원을 더하면 합산 가치는 3,665만원입니다. 현금·주식·포인트를 합한 비교용 금액이므로 전액이 통장에 들어오는 현금이라고 해석하면 안 됩니다.",
  },
  {
    question: "2026년 협상은 어떻게 진행됐나요?",
    answer:
      "2026년 5월 노조는 기본급 14만 9,600원 인상·순이익 30% 성과급·상여 800%·정년 65세 등을 요구했고, 7월 13일부터 조합원 1인당 총 60시간의 파업(10년 만의 8시간 전면파업 포함)을 거쳐 8월 말 잠정합의에 도달했습니다. 8월 31일 찬반투표에서 투표율 78.63%, 찬성 61.55%로 가결됐습니다(머니투데이·한국경제 9월 1일 보도). 성과금 400%+1,270만원 외에 생산직 500명 신규 채용(2027년 하반기~2028년), 정년 연장 검토, 손해배상 가압류 철회도 합의에 포함됐습니다.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "과세 대상 상여는 근로소득에 포함되며, 소득세 기본세율은 연봉 자체가 아닌 공제 후 과세표준에 적용됩니다. 이 계산기는 추정 연봉만 있을 때와 성과급 합산 시의 세금 차이를 비교하고 세액공제율을 기본 30%로 가정합니다. 보험료 반영 옵션과 주식·포인트를 합산 소득처럼 취급하는 가정도 사용합니다. 실제 비현금 항목의 과세 처리, 상여 지급대상기간에 따른 원천징수, 개인별 공제와 보험료 정산을 재현하지 않으므로 결과는 비교용 추정치입니다.",
  },
  {
    question: "기아와 비교하면?",
    answer:
      "기아 계산기에서 해당 회사의 연도별 보도 시나리오를 비교할 수 있습니다. 같은 그룹이라도 지급 대상·기준금액·정액·주식 수·포인트 조건은 각각 확인해야 합니다. 주식 수만 비교하거나 두 회사가 같은 가치를 지급한다고 가정하지 말고, 동일한 평가일의 주가 가정과 각 회사의 지급 기준을 구분하세요.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "공개 보도와 입력 가정에 따른 추정 모델이며 회사 공식 계산기가 아닙니다. 실제 지급은 적용 직군·근속·평가·개인별 급여 및 공제 조건에 따라 달라지며, 검증된 오차 범위를 제시할 근거는 없습니다. 지급 대상과 항목은 회사 공지, 확정 공제액은 급여명세서·원천징수영수증으로 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2026 임협 타결안 / 2025 합의 / 직접 입력 중 선택합니다." },
  { name: "본인 기준금액(월) 입력", text: "회사 지급 안내에서 정률 성과금 산정에 사용하는 월 기준금액을 확인해 입력합니다." },
  { name: "무상주 주가 가정 입력", text: "비교에 사용할 주가를 입력합니다. 기본값 23만원은 예시이며 실시간 시세가 아닙니다." },
  { name: "결과 확인", text: "% × 기본급 + 정액 + 무상주 + 상품권 합산이 즉시 표시됩니다." },
  { name: "예상 공제액 확인", text: "연봉·세액공제·보험료 가정을 확인하고, 현금과 비현금 항목을 합한 비교용 결과로 이용합니다." },
];

export const metadata: Metadata = {
  // canonical/OG/twitter/robots/hreflang은 buildPageMetadata(src/lib/seo.ts) 정본으로 생성 —
  // 수기 canonical 드리프트 방지. 기존 출력값은 유지되고 헬퍼 자동 필드만 추가된다.
  ...buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: PAGE_PATH,
  }),
  // 페이지 고유 키워드 — 헬퍼의 DEFAULT_KEYWORDS 병합으로 기존 keywords 출력이
  // 바뀌지 않도록 기존 값 그대로 override.
  keywords: [
    "현대차 성과급",
    "현대자동차 성과급",
    "현대차 임단협",
    "현대차 성과금 계산기",
    "현대차 격려금",
    "현대차 무상주",
    "현대차 성과급 2026",
    "현대차 보너스",
    "현대자동차 임단협 합의",
    "현대차 상여금",
  ],
};

export default function HyundaiBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "현대차 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
            dateModified: "2026-09-09",
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "현대차 성과급 계산하는 방법",
            description: "임단협 보도 시나리오·월 기준금액·주가 가정으로 성과금과 비현금 항목의 합산 가치 및 예상 공제액을 비교하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Car className="w-3.5 h-3.5" />
              2026 임협 타결안(8/31 가결) + 2025 합의 비교 시나리오
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              현대차 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              2026 임금협상 타결 보도 시나리오에 월 기준금액과 주가 가정을 입력해{" "}
              <strong>성과금 400% + 정액 1,270만 + 주식 15주 + 복지포인트 50만</strong>{" "}
              합산 가치와 예상 공제액을 비교합니다. 주식·포인트 평가액이 포함되며 개인별 현금 입금액은 아닙니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <HyundaiBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">
              현대차 임단협 합의 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg flex items-center gap-2">
                  ✅ 2026년 임협 타결 보도 (8/31 가결)
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 <strong>10만원 인상</strong> (호봉승급분 포함)</li>
                  <li>• 성과금 <strong>400% + 1,270만원</strong></li>
                  <li>• 주식 <strong>15주</strong></li>
                  <li>• 복지포인트 <strong>50만원</strong></li>
                  <li>• 하계휴가비 <strong>20만원 인상</strong></li>
                  <li>• 생산직 500명 신규 채용(2027 하반기~2028) · 정년 연장 검토</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  찬반투표 투표율 78.63% · 찬성 61.55% (총 60시간 파업 후 타결)
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg flex items-center gap-2">
                  📋 2025년 합의 보도 시나리오
                </h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 10만원 인상 (호봉승급 포함)</li>
                  <li>• 경영성과금 <strong>350% + 700만원</strong></li>
                  <li>• 생산판매 격려금 <strong>100% + 380만원</strong></li>
                  <li>• 추가 격려금 <strong>500만원</strong></li>
                  <li>• 무상주 <strong>30주</strong></li>
                  <li>• 전통시장 상품권 <strong>20만원</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>450% + 정액 1,580만 + 무상주 30주</strong> — 2026년은 정률·정액·주식 모두 축소
                </p>
              </article>
            </div>
          </section>

          <div className="mt-10">
            <GuideMidAd />
          </div>

          <section className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-black mb-6">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-canvas-deep bg-white p-5 open:bg-canvas/30"
                >
                  <summary className="cursor-pointer font-bold text-base list-none flex items-start gap-3">
                    <span className="text-primary mt-0.5">Q.</span>
                    <span className="flex-1">{item.question}</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  2026 임금협상 타결안(8/31 가결)·2025 합의안 공개 보도 기반 추정.
                  세후 계산에는 월 기준금액 × 18의 연봉과 기본 세액공제율 30%를 가정합니다.
                  주식·포인트까지 합산하므로 현금 입금액과 다릅니다. 검증된 오차 범위를 보장하지 않으며,
                  지급 시기·세부 배분·과세 처리는 회사 공지와 급여명세서를 확인하세요.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/kia-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">기아 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">기아의 연도별 지급 기준과 주식 가치 가정 비교</p>
            </Link>
            <Link
              href="/salary-db/hyundai"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">현대차 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
            <Link
              href="/calc/hyundai-rotem-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 그룹사 계산기</p>
              <p className="font-black text-lg">현대로템 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">2025 타결안 450% + 1,620만원</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "square", desktop: "rectangle" }} />
          </div>

          <BonusClusterLinks currentSlug="hyundai-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2026년 8월 31일 현대차 임금협상 잠정합의안 찬반투표 가결
                (머니투데이·한국경제 2026-09-01 보도), 2025년 9월 임단협 합의안
                (현대차그룹 공식 발표·녹색경제·전자신문). 회사별 지급 안내를 대체하지 않습니다.
                세금 설명 확인: 2026-09-09. 근거:{" "}
                <a className="underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6594">국세청 과세표준·기본세율</a>,{" "}
                <a className="underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7862&mi=6583">상여 원천징수 방법</a>.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
