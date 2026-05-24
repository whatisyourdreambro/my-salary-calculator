// src/app/calc/kakao-bonus/page.tsx
//
// 카카오 RSU·인센티브 계산기.
// 2026-04 카카오 자사주 47만 7,900주(237억) 처분 → 3,540명 RSU 지급.
// 1인당 평균 약 670만원. 정기 PI 10~40% + 격려금 100만(2026).

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
import { MessageCircle, AlertTriangle, Info } from "lucide-react";
import KakaoBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/kakao-bonus";
const PAGE_TITLE = "카카오 성과급·RSU 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "카카오 KAKAO 성과급·RSU 계산기. 정기 PI(10~40%) + 자사주 RSU + 2026 격려금 100만원 합산 세전·세후 실수령액이 즉시. 2026-04 자사주 47만 7,900주(237억) / 3,540명 = 1인당 평균 670만원 사례 반영.";

const FAQ_ITEMS = [
  {
    question: "카카오 성과급은 어떻게 구성되나요?",
    answer:
      "카카오는 (1) 정기 PI(Performance Incentive) — 기본급의 10~40% 연 1회, (2) 장기 RSU(Restricted Stock Unit) — 자사주를 1년 근속 가득 조건으로 지급, (3) 2026년 신규: 노사 합의 격려금 100만원. 세 가지가 합쳐져 영끌 보상이 결정됩니다.",
  },
  {
    question: "2026년 카카오 RSU는 얼마나 지급됐나요?",
    answer:
      "2026년 4월 카카오는 자사주 47만 7,900주(약 237억원)를 처분해 3,540명 직원에게 RSU로 지급했습니다. 단순 평균 = 1인당 약 670만원 (135주 × 5만원 가정)이지만 실제는 직급·평가에 따라 편차가 큽니다. 가득 조건은 부여일로부터 1년 근속 + 주식 지급일까지 재직.",
  },
  {
    question: "카카오 RSU 가득 조건은 무엇인가요?",
    answer:
      "카카오 RSU는 2025년 RSU 계약 체결 → 2026년 4월 17일 재직자에게 자사주 교부 형태로 진행됐습니다. 즉 부여 시점에서 약 1년 근속해야 가득되고, 가득 시점 시가 기준 근로소득으로 과세됩니다. 매도는 가득 후 본인 결정.",
  },
  {
    question: "2026년 카카오 임금협상은 어떻게 되나요?",
    answer:
      "2026년 5월 기준 카카오 노사는 연봉 인상률 6%대 후반에서 공감대를 형성했습니다. 사측은 연봉 총액 6.8% 인상 + 별도 격려금 100만원 지급안을 제시, 노조는 6.9% 요구로 격차가 작아 합의 가능성 높음. 다만 성과급 산정 방식에서는 평행선.",
  },
  {
    question: "정확한 카카오 평균 연봉은?",
    answer:
      "카카오 전체 평균 연봉은 약 8,500만~9,500만원이며 성과급 + RSU 포함 시 1억 이상 실수령자도 다수. 신입 대졸 초봉 5,000만~5,500만원, 경력직 7,000만~9,000만원, 리더/팀장급 1억~1억 3,000만원+. 본 계산기는 본인 연봉 입력으로 정확 계산.",
  },
  {
    question: "RSU 세금은 어떻게 계산되나요?",
    answer:
      "RSU는 가득 시점(주식 지급 시점)의 시가가 근로소득으로 과세됩니다. 누진세율(6~45%) + 지방세 + 4대보험. 매도 시점에는 코스피 상장주식이므로 대주주가 아닌 일반 직원은 추가 양도세 비과세. 본 계산기는 가득 시점 세후 실수령 기준.",
  },
  {
    question: "네이버 RSU와 비교하면?",
    answer:
      "두 회사 모두 RSU + 정기 PI 구조. 차이는 (1) 네이버는 임원·핵심 집중(1,683명 / 1인 약 2,765만원), 카카오는 더 광범위(3,540명 / 1인 약 670만원), (2) 카카오는 2026 격려금 100만원 추가. 본 계산기는 카카오 기준이며 네이버는 '네이버 성과급·RSU 계산기' 페이지 참고.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "2026 카카오 자사주 처분 공시(데이터투자·DealSite경제TV·인베스팅닷컴), 2026-05 임금협상 보도(뉴스웨이), 카카오 연봉체계 자료 기반 추정. 실제 RSU·PI는 본인 직급·평가에 따라 편차 큼. 정확한 본인 케이스는 사내 시스템 확인.",
  },
];

const HOW_TO_STEPS = [
  { name: "본인 연봉 입력", text: "연 기본 연봉을 만원 단위로 입력. 카카오 평균 약 8,500~9,500만원." },
  { name: "PI % 선택", text: "10/20/30/40% 중 본인 평가 시나리오 선택." },
  { name: "RSU 부여 주식 수 입력", text: "본인 RSU 부여 받을 주식 수 입력. 일반 직원 약 135주 (1인당 670만원 기준)." },
  { name: "카카오 주가 입력", text: "현재 카카오 주가 (디폴트 5만원). 가득 시점 주가 시나리오." },
  { name: "결과 확인", text: "PI + RSU + 격려금 합산 세전·세후 실수령액 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "카카오 성과급",
    "KAKAO 성과급",
    "카카오 RSU",
    "카카오 인센티브",
    "카카오 자사주",
    "카카오 보너스",
    "카카오 PI 계산기",
    "카카오 성과급 2026",
    "카카오 연봉",
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

export default function KakaoBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "카카오 성과급·RSU" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "카카오 성과급·RSU 계산하는 방법",
            description: "PI + RSU + 격려금 합산 + 가득 시점 주가 기반 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <MessageCircle className="w-3.5 h-3.5" />
              2026-04 자사주 237억 · 3,540명 RSU 지급
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              카카오 성과급·RSU 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              카카오는 정기 PI(10~40%) + 자사주 RSU + 2026 격려금 100만원 구조.
              본인 연봉·평가·RSU 주식 수만 입력하면 가득 시점{" "}
              <strong>세전·세후 실수령액</strong>이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <KakaoBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">카카오 성과급 구조</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-sm">📊 PI (정기 인센티브)</h3>
                <ul className="space-y-1 text-xs leading-relaxed">
                  <li>• 기본급의 10~40%</li>
                  <li>• 연 1회 지급</li>
                  <li>• 평가 + 사업부 성과</li>
                </ul>
              </article>
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-sm">🎁 RSU (2026 신규)</h3>
                <ul className="space-y-1 text-xs leading-relaxed">
                  <li>• 자사주 47만 7,900주</li>
                  <li>• 3,540명 / 1인당 ~670만</li>
                  <li>• 1년 근속 가득 조건</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-sm">💸 격려금 (2026)</h3>
                <ul className="space-y-1 text-xs leading-relaxed">
                  <li>• 연봉 6.8% 인상안</li>
                  <li>• 격려금 100만원 별도</li>
                  <li>• 노사 합의 진행 중</li>
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
                  2026 카카오 자사주 공시 + 보도 기반 추정. RSU 부여는 직급·평가에
                  따라 편차 큼. 정확한 본인 케이스는 사내 시스템 확인.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/naver-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">네이버 성과급·RSU →</p>
              <p className="text-sm text-faint mt-1">RSU 465억 · 1,683명 지급</p>
            </Link>
            <Link
              href="/salary-db/kakao"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">카카오 평균 연봉·워라밸 →</p>
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
                <strong>데이터 출처</strong>: 2026 카카오 자사주 처분 공시 (데이터투자·DealSite경제TV·인베스팅닷컴),
                2026-05 임협 보도(뉴스웨이), 카카오 연봉체계 자료. 2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
