// src/app/calc/doosan-enerbility-bonus/page.tsx
//
// 두산에너빌리티 경영성과급 계산기.
// 제도: 임단협 기반, 영업이익 목표 달성률에 따라 지급. 상한 기본급 530% /
//   하한 100% (달성률 50% 미만이어도 100% 보장) — 서울경제 2026-05-21.
// 2025년 지급: 전체 직원 연봉의 약 27% 재원, 평가 차등 — 조선일보 2026-05-12.
// 2026 임단협: 노조 상한(530%) 폐지 + 기본급 월 14만9,600원 인상 요구,
//   사측은 하한 100% 폐지 맞대응 — 헤럴드경제 단독·브릿지경제 2026-05-20.
//   교섭 진행 중 → 타결 시 시나리오·본문 갱신 필요.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
  howToLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Zap, Coins, AlertTriangle, Info } from "lucide-react";
import DoosanEnerbilityBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/doosan-enerbility-bonus";
const PAGE_TITLE = "두산에너빌리티 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "두산에너빌리티 경영성과급 계산기. 본인 연봉·월 기본급만 입력하면 상한 530%·하한 100%·2025년 지급 실적(연봉의 약 27% 재원) 시나리오별 세전·세후 실수령액이 즉시 계산됩니다. 2026 임단협 쟁점(노조 상한 폐지 요구 vs 사측 하한 폐지)까지 정리.";

const FAQ_ITEMS = [
  {
    question: "두산에너빌리티 성과급은 어떻게 결정되나요?",
    answer:
      "임단협(금속노조 경남지부 두산에너빌리티지회) 기반 경영성과급으로, 영업이익 기준 목표치 달성률에 따라 지급 규모가 결정됩니다. 상한은 기본급의 530%, 하한은 100%이며, 영업이익 목표 달성률이 50% 미만이어도 기본 100%는 보장됩니다 (서울경제 2026-05-21 보도). 여기에 회사 실적 + 개인·조직 평가로 개인별 차등이 붙습니다.",
  },
  {
    question: "2025년에는 실제로 얼마나 지급됐나요?",
    answer:
      "2025년에는 전체 직원 연봉의 약 27%를 재원으로 평가에 따라 성과급을 차등 지급했습니다 (조선일보 2026-05-12 보도). '연봉의 27%'는 전사 평균 개념이라 개인별 실수령은 평가에 따라 이보다 많거나 적을 수 있습니다. 본 계산기의 '2025 지급 실적' 시나리오는 본인 연봉 × 27%에 평가 차등 배율(70~130%)을 곱해 추정합니다.",
  },
  {
    question: "상한 530% / 하한 100%는 무슨 뜻인가요?",
    answer:
      "영업이익 목표를 초과 달성하면 최대 월 기본급의 530%까지, 달성률 50% 미만이어도 최소 100%는 지급된다는 뜻입니다 (서울경제 2026-05-21 보도). 삼성 OPI처럼 개인별 '기본급의 N%'가 매년 일괄 공표되는 방식이 아니라 총재원을 평가로 차등 배분하는 형태라, 본 계산기는 상한·하한·직전 실적 3개 구간 시뮬레이션으로 설계했습니다.",
  },
  {
    question: "2026년 임단협 쟁점은 무엇인가요?",
    answer:
      "노조는 성과급 지급 상한(530%) 개선(폐지)과 기본급 월 14만9,600원 인상(평균임금 약 5.1%)을 요구했고 (헤럴드경제 단독·브릿지경제 2026-05-20 보도), 사측은 하한 100% 폐지로 맞대응하고 있습니다. 교섭이 진행 중이라 제도가 바뀔 수 있으며, 2026년분 지급률은 미확정입니다. 타결되면 본 페이지에 즉시 반영하겠습니다.",
  },
  {
    question: "두산에너빌리티 평균 연봉은 얼마인가요?",
    answer:
      "FY2025 사업보고서(DART, 2026-03-20 제출) 기준 직원 평균 연봉은 1억원입니다 (직원 6,233명, 남 1억400만원/여 5,700만원). 원전·SMR 호황으로 2022년 7,700만원 대비 크게 올라 처음 1억원에 도달했습니다. 직급별 상세는 '두산에너빌리티 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "삼성전자 OPI처럼 매년 지급률이 공표되지 않나요?",
    answer:
      "네, 공표 방식이 다릅니다. 삼성 OPI는 사업부별 '연봉의 N%'가 매년 언론에 일괄 공개되지만, 두산에너빌리티는 임단협으로 정한 상·하한(100~530%) 안에서 총재원을 평가에 따라 차등 배분하는 구조라 개인별 지급률이 제각각입니다. 언론에 확인되는 수치는 '2025년 연봉의 약 27% 재원'(조선일보 2026-05-12)과 상·하한(서울경제 2026-05-21)이며, 본 계산기는 이 보도값만 사용합니다.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상이면 추가 부과가 없습니다. 본 계산기는 '연봉+성과급 합산 세금 − 연봉만 기준 세금'의 차이를 성과급에 귀속시키는 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(서울경제 2026-05-21, 조선일보 2026-05-12, 헤럴드경제·브릿지경제 2026-05-20)와 DART 사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 개인·조직 평가, 직군, 근속에 따라 차이가 크고 2026년분은 임단협 미타결로 미확정입니다. 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "시나리오 선택",
    text: "2025 지급 실적(연봉의 약 27%) / 상한 530% / 하한 100% / 직접 입력 중 선택.",
  },
  {
    name: "본인 연봉·월 기본급 입력",
    text: "연 기본 연봉(만원)과 월 기본급(만원)을 입력. FY2025 평균 연봉은 1억원.",
  },
  {
    name: "평가 차등 조정",
    text: "개인·조직 평가 차등 배율을 70~130% 범위에서 조정.",
  },
  { name: "결과 확인", text: "시나리오별 세전 성과급과 기본급 환산율(100~530% 범위)이 즉시 표시." },
  {
    name: "세후 실수령 확인",
    text: "누진세율 + 4대보험 추가 부과로 세후 실수령액 자동 계산.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "두산에너빌리티 성과급",
    "두산에너빌리티 성과급 계산기",
    "두산에너빌리티 경영성과급",
    "두산에너빌리티 임단협",
    "두산에너빌리티 성과급 530",
    "두산에너빌리티 연봉",
    "두산 성과급",
    "두산에너빌리티 상여금",
    "두산에너빌리티 보너스",
    "두산에너빌리티 성과급 2026",
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
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE_FULL,
    description: PAGE_DESC,
  },
};

export default function DoosanEnerbilityBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "두산에너빌리티 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "두산에너빌리티 성과급 계산하는 방법",
            description:
              "지급 시나리오·본인 연봉·평가 차등으로 경영성과급 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              2026 임단협 진행 중 · 노조 상한 530% 폐지 요구
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              두산에너빌리티 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              본인 연봉·월 기본급만 입력하면{" "}
              <strong>상한 530% · 하한 100% · 2025 지급 실적(연봉의 약 27% 재원)</strong>{" "}
              시나리오별 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* Calculator */}
          <DoosanEnerbilityBonusClient />

          {/* 결과 직후 광고 */}
          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 제도 구조 */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="policy-heading"
          >
            <h2
              id="policy-heading"
              className="text-2xl font-black mb-4 flex items-center gap-2"
            >
              <Coins className="w-6 h-6 text-primary" />
              두산에너빌리티 경영성과급 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 현행 제도 (임단협 기반)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • <strong>영업이익 목표 달성률</strong> 기준으로 지급 규모 결정
                  </li>
                  <li>
                    • 상한 <strong>기본급의 530%</strong> / 하한 <strong>100%</strong>
                  </li>
                  <li>• 달성률 50% 미만이어도 기본 100% 보장</li>
                  <li>• 회사 실적 + 개인·조직 평가로 개인별 차등</li>
                  <li>
                    • 2025년: 전 직원 <strong>연봉의 약 27%</strong> 재원 차등 지급
                  </li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  출처: 서울경제 2026-05-21 · 조선일보 2026-05-12
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📢 2026 임단협 쟁점 (교섭 중)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 노조: 성과급 <strong>상한(530%) 폐지</strong> 요구
                  </li>
                  <li>
                    • 노조: 기본급 <strong>월 14만9,600원 인상</strong> (평균임금 약
                    5.1%) 요구
                  </li>
                  <li>
                    • 사측: <strong>하한 100% 폐지</strong>로 맞대응
                  </li>
                  <li>• 2026년분 지급률 미확정</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  출처: 헤럴드경제 단독·브릿지경제 2026-05-20. 타결 시 본 페이지 즉시
                  갱신.
                </p>
              </article>
            </div>
          </section>

          {/* 본문 중간 광고 */}
          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* 연봉 컨텍스트 */}
          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="salary-heading"
          >
            <h2 id="salary-heading" className="text-xl sm:text-2xl font-black mb-3">
              평균 연봉 첫 1억원 돌파 — 성과급이 끌어올렸다
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              FY2025 사업보고서(DART, 2026-03-20 제출) 기준 두산에너빌리티 직원 평균
              연봉은 <strong>1억원</strong>입니다 (직원 6,233명, 남 1억400만원·근속
              14년 / 여 5,700만원·근속 6년). 원전 생태계 복원과 SMR(소형모듈원전)
              호황으로 2022년 7,700만원 대비 크게 올라 처음 1억원에 도달했으며,
              2025년 연봉의 약 27%에 달한 성과급 재원(조선일보 2026-05-12)이 주요
              배경으로 꼽힙니다.
            </p>
            <p className="text-sm leading-relaxed text-navy mt-3">
              평균 연봉에는 성과급이 포함되므로, 계산기에 입력하는 &lsquo;연 기본
              연봉&rsquo;은 성과급을 뺀 본인 계약 연봉 기준으로 넣는 것이 더
              정확합니다.
            </p>
          </section>

          <div className="mt-10">
            <InArticleAd />
          </div>

          {/* FAQ */}
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black mb-6">
              자주 묻는 질문
            </h2>
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

          {/* 면책 */}
          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">
                  ⚠️ 추정 시뮬레이터입니다
                </strong>
                <span className="text-amber-800">
                  본 계산기는 공개 언론 보도(서울경제 2026-05-21 상·하한, 조선일보
                  2026-05-12 연봉 27% 재원, 헤럴드경제·브릿지경제 2026-05-20 임단협
                  요구안)와 DART 사업보고서 기반 추정 모델이며 회사 공식 자료가
                  아닙니다. 실제 지급은 개인·조직 평가와 직군·근속에 따라 차이가
                  크고, 2026년분은 임단협 미타결로 미확정입니다.
                </span>
              </span>
            </p>
          </aside>

          {/* 관련 링크 카드 */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/hd-hyundai-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">HD현대 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">
                같은 중공업·에너지 섹터 성과급 비교
              </p>
            </Link>
            <Link
              href="/salary-db/doosan-enerbility"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">두산에너빌리티 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                직급별 평균 연봉, 워라밸, 복지 전체
              </p>
            </Link>
          </section>

          {/* 쿠팡 + 관련 계산기 */}
          <div className="mt-10">
            <CoupangBanner
              responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
            />
          </div>

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          {/* 출처 */}
          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 서울경제 2026-05-21 (상한 530%·하한
                100%·영업이익 달성률 기준), 조선일보 2026-05-12 (2025년 연봉의 약 27%
                재원 차등 지급), 헤럴드경제 단독·브릿지경제 2026-05-20 (2026 임단협
                노조 요구안), DART 두산에너빌리티 사업보고서 2026-03-20 제출 (FY2025
                평균 연봉 1억원). 2026년 세법(소득세율·4대보험 요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
