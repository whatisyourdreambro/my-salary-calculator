// src/app/calc/naver-bonus/page.tsx
//
// 네이버 RSU·인센티브 계산기.
// 네이버는 임원 보수 = 단기 타깃 인센티브 + 장기 RSU 구조.
// 2025년 자사주 처분 465억 / 1,683명 = 1인당 약 2,765만원 (RSU 형태).
// 정기 PI: 기본급의 10~40% 연 1회.

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
import { Search, AlertTriangle, Info } from "lucide-react";
import NaverBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/naver-bonus";
const PAGE_TITLE = "네이버 성과급·RSU 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "네이버 NAVER 성과급·RSU 계산기. 정기 인센티브(PI 10~40%) + 자사주 RSU 합산 세전·세후 실수령액이 즉시. 2025년 자사주 처분 465억 / 1,683명 = 1인당 평균 2,765만원 사례 반영.";

const FAQ_ITEMS = [
  {
    question: "네이버 성과급은 어떻게 구성되나요?",
    answer:
      "네이버는 (1) 정기 PI(Performance Incentive, 타깃 인센티브) — 기본급의 10~40% 연 1회 지급, (2) 장기 RSU(Restricted Stock Unit, 양도제한조건부주식) — 핵심 인재·임원 위주로 부여되며 가득 조건(보통 1~3년 근속) 후 자사주로 지급. 두 가지가 합쳐져 영끌 연봉이 결정됩니다.",
  },
  {
    question: "RSU는 누가 얼마나 받나요?",
    answer:
      "2025년 네이버는 자사주 465억원 규모(약 22만주)를 1,683명 직원에게 RSU로 지급했습니다. 단순 평균 = 1인당 약 2,765만원이지만 실제는 임원·핵심 개발자에게 집중되어 일반 직원은 더 적고 임원은 수억 단위입니다. 최수연 대표의 2025년 인센티브가 약 5.6억원으로 보도됐습니다. 본 계산기는 본인이 받을 RSU 주식 수를 직접 입력해 정확히 계산합니다.",
  },
  {
    question: "RSU와 스톡옵션 차이는?",
    answer:
      "RSU는 회사가 미래에 직원에게 자사 주식을 무상으로 약속한 보상이며, 가득(vesting) 조건 충족 시 자동으로 주식을 받습니다. 스톡옵션은 정해진 가격에 주식을 매수할 권리이며, 행사 시 차익이 보상입니다. 네이버는 과거 스톡옵션을 썼으나 부정적 측면(주가 하락 시 무가치) 때문에 현재는 RSU 위주로 전환했습니다.",
  },
  {
    question: "RSU 세금은 어떻게 계산되나요?",
    answer:
      "RSU는 가득 시점(주식 지급 시점)의 시가가 근로소득으로 과세됩니다. 누진세율(6~45%) + 지방세 + 4대보험 부과. 매도 시점에는 추가 양도소득세가 발생할 수 있지만, 코스피 상장주식이라 일반 직원(소액주주)은 매도 양도세 비과세입니다. 본 계산기는 가득 시점 기준 세후 실수령을 계산합니다.",
  },
  {
    question: "네이버 주가가 RSU 가치에 미치는 영향은?",
    answer:
      "RSU 가치 = 받을 주식 수 × 가득 시점 주가입니다. 네이버 주가는 2025년 51% 상승해 직원들이 자사주 보너스 효과를 톡톡히 봤습니다. 2026년 평균 21~25만원 범위로 본 계산기 기본값은 23만원. 매수 후 가격 변동도 본인 부담이므로 가득 직후 매도/보유 결정이 중요합니다.",
  },
  {
    question: "카카오와 비교하면?",
    answer:
      "카카오도 네이버와 동일한 RSU 제도를 운영합니다. 2026년 4월 카카오는 보통주 47만 7,900주(237억원) 처분해 3,540명에게 지급 — 1인당 약 670만원. 네이버보다 더 광범위하지만 1인당 평균은 더 적습니다. 두 회사 모두 RSU + 정기 PI 합산 구조라 본 계산기 패턴은 동일하게 적용됩니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2025년 네이버 자사주 처분 공시 + 디지털투데이·뉴스1·아시아경제 보도 + 더벨 RSU 분석 기반 추정 모델입니다. 실제 RSU 부여는 본인 직급·직무·성과·근속에 따라 큰 편차가 있어 본 계산기는 일반 추정용. 정확한 본인 케이스는 사내 인사 시스템 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "본인 연봉 입력", text: "연 기본 연봉을 만원 단위로 입력. 네이버 평균 연봉 약 1.2억." },
  { name: "PI(정기 인센티브) % 선택", text: "10/20/30/40% 중 본인 평가 시나리오 선택." },
  { name: "RSU 부여 주식 수 입력", text: "본인 RSU 부여 받을 주식 수 입력. 일반 직원 수~수십 주." },
  { name: "네이버 주가 입력", text: "현재 네이버 주가 (디폴트 23만원). 가득 시점 주가로 시나리오." },
  { name: "결과 확인", text: "PI + RSU 합산 세전·세후 실수령액 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "네이버 성과급",
    "NAVER 성과급",
    "네이버 RSU",
    "네이버 인센티브",
    "네이버 자사주",
    "네이버 보너스",
    "네이버 PI 계산기",
    "네이버 성과급 2026",
    "네이버 연봉",
    "IT 대기업 성과급",
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

export default function NaverBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "네이버 성과급·RSU" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "네이버 성과급·RSU 계산하는 방법",
            description: "PI + RSU 합산 + 가득 시점 주가 기반 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Search className="w-3.5 h-3.5" />
              2025 자사주 465억 · 1,683명 RSU 지급
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              네이버 성과급·RSU 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              네이버는 정기 PI(10~40%) + 자사주 RSU 구조. 본인 연봉·평가·RSU 부여
              주식 수만 입력하면 가득 시점 <strong>세전·세후 실수령액</strong>이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <NaverBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">네이버 성과급 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📊 PI (Performance Incentive)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 정기 단기 성과급</li>
                  <li>• 기본급의 <strong>10~40%</strong> 연 1회</li>
                  <li>• 본인 평가 등급 + 사업부 성과 연동</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">🎁 RSU (Restricted Stock Unit)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 장기 보상 — 자사주로 지급</li>
                  <li>• <strong>가득(vesting) 1~3년</strong> 근속 조건</li>
                  <li>• 임원·핵심 인재 집중, 일부 일반 직원도 받음</li>
                  <li>• 2025년 465억 / 1,683명 사례</li>
                </ul>
              </article>
            </div>
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
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">{item.answer}</p>
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
                  2025 네이버 자사주 공시 + 보도 기반 추정. RSU 부여는 직급·직무·성과에
                  따라 큰 편차. 정확한 본인 케이스는 사내 시스템 확인.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/kakao-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">카카오 성과급·RSU →</p>
              <p className="text-sm text-faint mt-1">RSU 47만주 · 3,540명 지급</p>
            </Link>
            <Link
              href="/salary-db/naver"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">네이버 평균 연봉·워라밸 →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 복지 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
          </div>

          <RelatedCalculators currentPath={PAGE_PATH} limit={4} title="다음 계산기도 함께 보세요" />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2025 네이버 자사주 처분 공시 + 디지털투데이·뉴스1·아시아경제 보도,
                더벨 RSU 분석. 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
