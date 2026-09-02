// src/app/calc/kia-bonus/page.tsx
//
// 기아 임단협 성과급·격려금 계산기.
// 2026 타결(8/25 잠정합의·8/28 가결 64.1%, 운영자 승인 2026-09-03 반영): 기본급 +10만 /
//   경영성과금 300%+400만 / 품질향상 격려금 100%+470만 / 오토카 어워즈 기념 400만 /
//   자사주 47주 / 특별 포인트 50만 → 합산 400% + 1,270만 + 47주. 6년 연속 무분규.
//   출처 헤럴드경제 2026-08-25·ZDNet·워크투데이 2026-08-28.
// 2025 합의(전년): 기본급 +10만 / 성과금 450%+1,600만 / 무상주 53주 / 상품권 20만.
// ★갱신 슬롯: 매년 8~9월 임단협 타결 보도 → Client.tsx SCENARIOS·본문·FAQ·bonusData·허브 hook 동기화.

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
import KiaBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/kia-bonus";
const PAGE_TITLE = "기아 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "기아 2026 임단협 타결안 성과급 계산기. 본인 기본급(월)만 입력하면 성과금·격려금 400% + 정액 1,270만원 + 자사주 47주 + 특별 포인트 50만 합산 세전·세후 실수령액이 즉시. 6년 연속 무분규 타결, 2025 합의(450%+1,600만) 시나리오와 비교.";

const FAQ_ITEMS = [
  {
    question: "기아 성과급은 어떻게 계산되나요?",
    answer:
      "기아 성과급은 매년 임단협 결과로 결정되는 정률(%) + 정액 + 자사주 + 포인트·상품권 구성입니다. 2026년 타결안(8월 25일 12차 본교섭 잠정합의, 8월 28일 찬반투표 가결)은 경영성과금 300% + 400만원 / 품질향상 격려금 100% + 470만원 / 2026 오토카 어워즈 기념 격려금 400만원 / 자사주 47주 / 최대 생산·판매 목표 달성 특별 포인트 50만 / 기본급 월 10만원 인상으로, 합산 정률 400% + 정액 1,270만원 + 자사주 47주입니다. 전년(2025) 합의는 450% + 1,600만원 + 무상주 53주였습니다.",
  },
  {
    question: "기아와 현대차 성과급 차이는?",
    answer:
      "두 회사는 같은 현대차그룹이라 임단협 결과가 거의 동일합니다. 2026년은 정률 400%와 정액 1,270만원이 양사 동일하고, 차이는 (1) 주식 — 기아 자사주 47주 vs 현대차 15주, (2) 포인트 — 기아 특별 포인트 50만 vs 현대차 복지포인트 50만, (3) 오토카 어워즈 기념 격려금 같은 회사 고유 항목 포함 여부입니다. 주식 수가 다른 이유는 두 회사 주가 차이 때문 — 기아 약 12만원 vs 현대차 약 23만원으로, 동일한 가치를 분배하려면 기아는 더 많은 주가 필요합니다.",
  },
  {
    question: "6년 연속 무분규 임단협의 의미는?",
    answer:
      "기아 노사는 2021년부터 2026년까지 6년 연속 파업 없이 임단협을 타결했습니다. 2026년에는 교섭 결렬 위기도 있었지만 중동 전쟁·관세 장벽 같은 불확실한 환경에서 노사 상생을 우선시해 8월 25일 잠정합의, 8월 28일 찬성 64.1%(투표율 91.0%)로 가결됐습니다. 같은 시기 현대차가 총 60시간 파업 뒤 타결한 것과 대비되는 점이며, 안정적 성과급 지급의 배경입니다.",
  },
  {
    question: "자사주 47주는 얼마인가요?",
    answer:
      "2026년 타결안의 자사주 47주는 기아 보통주 47주 지급입니다(2025년은 무상주 53주). 2026년 평균 주가 약 12만원 기준 47주 = 약 564만원의 가치입니다. 본 계산기는 시점별 주가를 직접 입력 가능합니다. 지급 주식은 양도제한 기간이 있을 수 있으니 매도 시점을 확인하시고, 코스피 상장주식이므로 대주주가 아닌 일반 직원은 매도 시 양도세 비과세입니다.",
  },
  {
    question: "기아 정확한 평균 연봉은?",
    answer:
      "2024년 기아 사업보고서 기준 1인당 평균 급여는 약 1억 2,800만원 (등기임원 제외)입니다. 사무·기술직과 생산직 평균이 합산된 수치라 직군별 편차는 큽니다. 자세한 직급별 평균은 '기아 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "성과금·격려금·정액 보너스 모두 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 무상주는 시가 기준 근로소득으로 과세되며 매도 시점이 아닌 지급 시점에 과세됩니다. 본 계산기는 marginal 방식으로 정확하게 계산합니다.",
  },
  {
    question: "2026년 노조 요구안과 타결안은 어떻게 달랐나요?",
    answer:
      "2026년 5월 기아 노조는 현대차와 비슷하게 기본급 14만원대 인상·순이익 30% 성과급·상여 800%·정년 65세 연장 등을 요구했습니다. 최종 타결안은 기본급 월 10만원 인상과 정률 400% + 정액 1,270만원 + 자사주 47주 + 특별 포인트 50만으로, 요구안보다는 낮지만 파업 없이 8월 안에 마무리됐습니다. 여기에 사회공헌기금 40억원 출연도 합의에 포함됐습니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2026년 8월 기아 임단협 타결안(헤럴드경제·ZDNet·워크투데이 보도)과 2025년 합의안(녹색경제·전자신문·지피코리아·삼프로TV) 기반 추정 모델입니다. 실제 지급은 본인 직군(생산·기술·사무)·근속·평가에 따라 ±10% 차이 가능. 정확한 본인 케이스는 사내 급여 명세서 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "2026 임단협 타결안 / 2025 합의 / 직접 입력 중 선택." },
  { name: "본인 기본급(월) 입력", text: "월 통상임금 입력. 보통 400~600만원 범위." },
  { name: "무상주 주가 확인", text: "기아 보통주 현재가 입력 (디폴트 12만원). 2026년 10~14만원 범위." },
  { name: "결과 확인", text: "% × 기본급 + 정액 + 무상주 + 상품권 합산 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
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
    "기아 성과급",
    "기아자동차 성과급",
    "기아 임단협",
    "기아 성과금 계산기",
    "기아 격려금",
    "기아 무상주",
    "기아 성과급 2026",
    "기아 보너스",
    "기아 임단협 합의",
    "기아 상여금",
  ],
};

export default function KiaBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "기아 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "기아 성과급 계산하는 방법",
            description: "임단협 시나리오·본인 기본급으로 성과금+격려금+무상주 합산 + 세후 실수령을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Car className="w-3.5 h-3.5" />
              2026 임단협 타결안(8/28 가결·6년 연속 무분규) + 2025 합의 비교
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              기아 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              2026 임단협 타결안 기준 본인 기본급만 입력하면{" "}
              <strong>성과금·격려금 400% + 정액 1,270만 + 자사주 47주 + 특별 포인트 50만</strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <KiaBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">기아 임단협 합의 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">✅ 2026년 임단협 타결안 (8/28 가결 · 실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 <strong>10만원 인상</strong></li>
                  <li>• 경영성과금 <strong>300% + 400만원</strong></li>
                  <li>• 품질향상 격려금 <strong>100% + 470만원</strong></li>
                  <li>• 2026 오토카 어워즈 기념 격려금 <strong>400만원</strong></li>
                  <li>• 자사주 <strong>47주</strong> (현대차 15주보다 많음)</li>
                  <li>• 최대 생산·판매 목표 달성 특별 포인트 <strong>50만</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>400% + 정액 1,270만 + 자사주 47주</strong> · 찬성 64.1%(투표율 91.0%) · 6년 연속 무분규
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📋 2025년 합의 (전년 실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 10만원 인상 (호봉승급 포함)</li>
                  <li>• 경영성과금 <strong>350% + 700만원</strong></li>
                  <li>• 생산판매 격려금 <strong>100% + 400만원</strong></li>
                  <li>• World Car 격려금 <strong>500만원</strong></li>
                  <li>• 무상주 <strong>53주</strong></li>
                  <li>• 전통시장 상품권 <strong>20만원</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  합산: <strong>450% + 정액 1,600만 + 무상주 53주</strong> — 2026년은 정률·정액·주식 모두 축소
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
                  2026 임단협 타결안(8/28 가결)·2025 합의안 공개 보도 기반 추정.
                  실제 지급은 직군·근속·평가에 따라 ±10% 차이 가능, 지급 시기·세부 배분은 회사 공지 확인.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/hyundai-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">현대차 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">2026 타결 400% + 1,270만 + 주식 15주</p>
            </Link>
            <Link
              href="/salary-db/kia"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">기아 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "square", desktop: "rectangle" }} />
          </div>

          <BonusClusterLinks currentSlug="kia-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2026년 8월 기아 임단협 잠정합의(8/25)·찬반투표 가결(8/28)
                보도(헤럴드경제·ZDNet·워크투데이), 2025년 9월 합의안
                (녹색경제·전자신문·지피코리아·삼프로TV). 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
