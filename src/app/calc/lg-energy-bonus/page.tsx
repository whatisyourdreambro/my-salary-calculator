// src/app/calc/lg-energy-bonus/page.tsx
//
// LG에너지솔루션 성과급 계산기.
// 배터리 사이클에 따른 성과급 변동이 매우 큰 회사 (50% ~ 900% 사이).
// 2022 870~900% / 2023 340~380% / 2024 50% / 2025 75%.

import type { Metadata } from "next";
import Link from "next/link";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Zap, AlertTriangle, Info } from "lucide-react";
import LgEnergyBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/lg-energy-bonus";
const PAGE_TITLE = "LG에너지솔루션 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "LG에너지솔루션 성과급 계산기. 배터리 사이클별(적자/평년/호황) 시나리오와 본인 기본급만 입력하면 세전·세후 실수령액이 즉시 계산. 2022 870%·2023 340%·2024 50%·2025 75% 실제 지급 이력 반영.";

const FAQ_ITEMS = [
  {
    question: "LG에너지솔루션 성과급은 어떻게 계산되나요?",
    answer:
      "LG에너지솔루션 경영성과급은 연 1회 영업이익/실적 기반으로 결정되는 정률(%) 방식입니다. 본인 기본급(통상 연봉의 1/12 또는 1/13)에 회사 지급률을 곱해 산정됩니다. 배터리 사이클에 따라 변동이 매우 커서 2022년 호황기에는 870~900%까지 받았지만, 2024년 적자 전환 시기에는 50%로 급락했습니다. 본 계산기는 시나리오별 % 선택 + 본인 기본급으로 즉시 계산합니다.",
  },
  {
    question: "왜 성과급 변동이 이렇게 큰가요?",
    answer:
      "배터리 산업은 (1) 전기차 수요 사이클, (2) 미국 IRA(인플레이션감축법) 보조금 정책, (3) 중국 LFP 배터리 경쟁, (4) 원자재(리튬·니켈) 가격 같은 외부 변수에 매우 민감합니다. 2022~23년은 전기차 폭증 사이클 호황, 2024년부터는 캐즘(chasm, 수요 둔화)으로 영업이익이 크게 줄었습니다. 2026년 1분기는 영업손실 2,078억원으로 적자 전환했지만, ESS(에너지저장장치) 사업으로 회복 신호도 있습니다.",
  },
  {
    question: "2026년 성과급은 어떻게 될 것 같나요?",
    answer:
      "2026년 1분기 적자(-2,078억) 상황이라 2025년(75%)보다 더 낮거나 비슷할 가능성이 큽니다. 단, 하반기 ESS 사업 본격화·전기차 시장 회복 시그널이 나오면 2027년에는 다시 200~300% 수준으로 복구될 수 있다는 전망도 있습니다. 본 계산기 시나리오 '회복기(200%)'로 시뮬레이션 가능합니다. 정확한 결정은 1분기 결산 후 노사 협의로 이뤄집니다.",
  },
  {
    question: "다른 배터리 회사와 비교하면?",
    answer:
      "삼성SDI는 비슷한 변동성을 가지고 있지만 IT소재 사업부 비중이 있어 LG에너지솔루션보다 변동이 작은 편입니다. SK온은 비상장사로 정확한 정보는 적지만 적자 폭이 더 커서 성과급도 더 낮은 것으로 알려졌습니다. LG화학(모회사)은 첨단소재·생명과학 등 다각화 사업으로 LG에너지솔루션 분사 후에도 안정적입니다. 자세한 비교는 '회사별 연봉 DB' 페이지를 참고하세요.",
  },
  {
    question: "기본급은 어떻게 정의하나요?",
    answer:
      "LG에너지솔루션의 성과급 계산 기준 '기본급'은 보통 월 통상임금(매월 정기 지급되는 본봉)을 의미합니다. 연봉이 7,000만원이면 월 기본급은 대략 400~450만원 수준입니다. 본 계산기는 본인의 월 기본급을 직접 입력하거나, 연봉을 입력하면 자동 환산해 사용합니다. 정확한 통상임금은 급여명세서 '기본급' 또는 '통상임금' 항목 확인.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급은 연간 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험(국민연금·건강·고용)이 부과됩니다. 국민연금은 보수월액 상한(2026년 연 7,404만원) 적용. 본 계산기는 marginal 방식(연봉+성과급 합산 세금에서 연봉만 기준 세금 차이)으로 정확하게 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 보도(뉴스웨이·디일렉·배터리인사이드·다올투자증권 리포트) + LG에너지솔루션 분기 실적발표 기반 추정 모델이며 회사 공식 자료가 아닙니다. 실제 지급은 사업본부·직군·평가 등에 따라 ±15% 차이 가능. 정확한 본인 케이스는 사내 시스템 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "시나리오 선택", text: "적자(50%) / 회복(200%) / 평년(400%) / 호황(900%) 중 선택." },
  { name: "본인 월 기본급 입력", text: "월 통상임금을 입력. 보통 350~600만원 범위." },
  { name: "결과 확인", text: "기본급 × 시나리오 % = 세전 성과급 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산." },
  { name: "다년도 비교", text: "여러 시나리오를 비교해 사이클별 받을 금액을 예측." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "LG에너지솔루션 성과급",
    "LG엔솔 성과급",
    "LG에너지솔루션 보너스",
    "LG엔솔 성과급 계산기",
    "배터리 성과급",
    "LG에너지솔루션 영업이익",
    "LG엔솔 2026 성과급",
    "전기차 배터리 성과급",
  ],
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: PAGE_TITLE_FULL, description: PAGE_DESC },
};

export default function LgEnergyBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "LG엔솔 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "LG에너지솔루션 성과급 계산하는 방법",
            description: "배터리 사이클 시나리오·본인 기본급으로 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              2022 870% · 2023 340% · 2024 50% · 2025 75% 실 지급 이력
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              LG에너지솔루션 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              배터리 사이클별 시나리오와 본인 기본급만 입력하면{" "}
              <strong>세전·세후 실수령액</strong>이 즉시 계산됩니다. 적자(50%)부터
              호황(900%)까지 5가지 시나리오 비교.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <LgEnergyBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">LG에너지솔루션 성과급 지급 이력</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-canvas-deep">
                    <th className="py-2 px-3 text-left font-bold">연도</th>
                    <th className="py-2 px-3 text-right font-bold">성과급 (월 기본급 %)</th>
                    <th className="py-2 px-3 text-left font-bold">시장 상황</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2022</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-primary">870 ~ 900%</td>
                    <td className="py-2 px-3 text-faint">전기차 폭증 사이클 호황</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2023</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold">340 ~ 380%</td>
                    <td className="py-2 px-3 text-faint">IRA 효과 부분 반영</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2024</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-amber-600">50%</td>
                    <td className="py-2 px-3 text-faint">전기차 캐즘·중국 경쟁 심화</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 px-3 font-bold">2025</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold">75%</td>
                    <td className="py-2 px-3 text-faint">전년比 소폭 확대</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">2026 (예상)</td>
                    <td className="py-2 px-3 text-right tabular-nums text-faint">50~100%?</td>
                    <td className="py-2 px-3 text-faint">1Q 적자 -2,078억, ESS 회복 신호</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 2022~2024 보도 기준. 사업본부·직군·평가에 따라 ±15% 편차.
            </p>
          </section>

          <div className="mt-10">
            <InArticleAd />
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
                  본 계산기는 공개 보도(뉴스웨이·디일렉·다올투자증권) + 분기 실적
                  기반 추정 모델로, 회사 공식 자료가 아닙니다. 실제 지급은
                  사업본부·직군·평가에 따라 ±15% 차이 가능.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/samsung-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">삼성전자 성과급 시뮬레이터 →</p>
              <p className="text-sm text-faint mt-1">OPI + TAI 사업부별 분배</p>
            </Link>
            <Link
              href="/salary-db/lgensol"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">LG에너지솔루션 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: LG에너지솔루션 2025·2026 분기 실적발표
                (배터리인사이드·디일렉), 뉴스웨이 2026-02 성과급 보도, 다올투자증권
                리포트 2026-05. 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
