// src/app/calc/s-oil-bonus/page.tsx
//
// S-OIL(에쓰오일) 경영성과급 계산기.
// 연 1회 경영성과급 — 전년도 영업이익 기반, 매년 초(통상 2월) 월 기본급의 % 일괄 지급.
// 최근 지급 실적: 2022 실적분 1,500%(2023년 초) → 2023 실적분 800%(2024년 초)
//   → 2024 실적분 250%(2025-02 확정, 데일리한국 2025-02-20).
// 2025 실적분(2026년)은 미확정 — SBS Biz 2026-02-22 "3월 지급 목표 격려금 규모 검토 중".
// 갱신 체크포인트: 2026년 확정 지급률 보도 시 시나리오·노티스 교체 필요.

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
import BonusClusterLinks from "@/components/BonusClusterLinks";
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Fuel, AlertTriangle, Info } from "lucide-react";
import SOilBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/s-oil-bonus";
const PAGE_TITLE = "S-OIL 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "S-OIL(에쓰오일) 경영성과급 계산기. 본인 월 기본급만 입력하면 최근 지급 실적 시나리오(2024 실적분 250% · 2023 실적분 800% · 2022 실적분 1,500%)별 세전·세후 실수령액이 즉시 계산됩니다. 2025년 실적분(2026년 지급)은 미확정 — 보도 기준으로 정리. 2026 세법 반영.";

const FAQ_ITEMS = [
  {
    question: "S-OIL 성과급은 어떻게 계산되나요?",
    answer:
      "S-OIL은 정식 명칭이 따로 없는 연 1회 경영성과급을 운영합니다. 전년도 영업이익 실적을 기반으로 매년 초(통상 2월) '월 기본급의 %' 형태로 전 직원에게 일괄 지급됩니다. 최근 실적은 2024년 실적분 250%(2025년 2월 지급, 데일리한국·네이트뉴스 2025-02-20 보도), 2023년 실적분 800%, 2022년 실적분 1,500%(파이낸셜뉴스 2024-02-05 기사 내 인용)입니다. 본 계산기는 월 기본급 × 지급률(%)로 세전 성과급을 계산합니다.",
  },
  {
    question: "2026년(2025년 실적분) 성과급은 확정됐나요?",
    answer:
      "미확정입니다. SBS Biz 2026-02-22 보도에 따르면 S-OIL은 3월 지급을 목표로 격려금 규모를 검토 중인 것으로 알려졌으나, 확정 지급률 보도는 아직 확인되지 않았습니다. 확정 발표가 나오면 본 페이지에 즉시 반영할 예정이며, 그 전에는 최근 3개년 실적 시나리오나 직접 입력으로 미리 시뮬레이션해 보세요.",
  },
  {
    question: "왜 지급률이 해마다 크게 달라지나요?",
    answer:
      "정유업 특성상 국제유가·정제마진에 따라 영업이익이 급변하기 때문입니다. 2024년 영업이익은 4,606억원으로 전년 대비 66% 감소했고, 그 결과 성과급도 전년 800%에서 550%p 줄어든 250%로 확정됐습니다(데일리한국 2025-02-20). 반대로 정제마진 호황이던 2022년 실적분은 기본급의 1,500%에 달했습니다(파이낸셜뉴스 2024-02-05). 즉 250%~1,500% 사이 큰 변동 폭이 이 회사 성과급의 특징입니다.",
  },
  {
    question: "상여금 800%와 경영성과급은 다른 건가요?",
    answer:
      "다릅니다. S-OIL 생산직 채용공고 기준으로 별도 상여금 800%가 존재하며, 이는 경영성과급과 별개로 지급되는 고정 상여입니다. 본 계산기가 계산하는 것은 실적 연동 경영성과급이며, 세금 추정 시 연봉 근사(월 기본급 × 20 = 12개월 + 상여 800%)에 고정 상여를 반영합니다.",
  },
  {
    question: "성과급 지급 기준이 명문화되어 있나요?",
    answer:
      "아니요. S-OIL 성과급은 지급 기준이 명문화되어 있지 않아 노조가 성과급 명문화를 요구하고 있습니다. 더팩트 2025-03-07 보도에 따르면 노사는 비재무 평가 기반 중간 성과급 제도(SK이노베이션 LTI 벤치마킹)를 이사회에 보고하기로 합의했습니다. 제도가 확정되면 지급 방식이 달라질 수 있습니다.",
  },
  {
    question: "다른 정유사와 비교하면 어떤가요?",
    answer:
      "2024년 실적분 기준 정유 4사 성과급은 SK이노베이션 660%(PS+LTI+STI 등 합산), HD현대오일뱅크 265%, GS칼텍스 250%, S-OIL 250%였습니다(더팩트 2025-03-07 업계 비교). 업황 부진으로 4사 모두 전년 대비 큰 폭으로 줄었다는 공통점이 있습니다.",
  },
  {
    question: "2022년 실적분은 1,500%인가요, 1,470%인가요?",
    answer:
      "매체 간 수치 차이가 있습니다. 파이낸셜뉴스(2024-02-05)는 기본급의 1,500%로, 시사오늘은 1,470%로 보도했습니다. 본 계산기 시나리오는 1,500% 기준이며, 1,470%로 계산하고 싶다면 '직접 입력' 모드에서 조정할 수 있습니다.",
  },
  {
    question: "S-OIL 평균 연봉은 얼마인가요?",
    answer:
      "2024년 사업보고서 기준 평균연봉은 1억 5,404만원입니다(디지털타임스 2025-03-19). 2023년 1억 7,293만원 대비 10.9% 감소했는데, 성과급 축소가 주된 영향입니다. 직급별 상세는 'S-OIL 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용됩니다. 여기에 지방소득세(소득세의 10%)와 4대보험(국민연금·건강·고용)이 추가 부과됩니다. 단 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상이면 추가 부과가 없습니다. 본 계산기는 '연봉+성과급 합산 세금 − 연봉만 기준 세금'을 성과급에 귀속시키는 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(데일리한국·네이트뉴스 2025-02-20, 파이낸셜뉴스 2024-02-05, 더팩트 2025-03-07, SBS Biz 2026-02-22)와 사업보고서 기반 추정 시뮬레이터이며 회사 공식 자료가 아닙니다. 실제 지급은 본인 직군·근속·기본급 구성에 따라 차이가 날 수 있습니다. 결과는 참고용으로만 사용하시고, 정확한 본인 케이스는 사내 급여 명세서를 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "시나리오 선택",
    text: "최근 지급 실적(2024 실적분 250% / 2023 실적분 800% / 2022 실적분 1,500%) 중 선택. 직접 입력도 가능.",
  },
  {
    name: "본인 월 기본급 입력",
    text: "월 기본급을 만원 단위로 입력. 추정 연봉(기본급 × 20 = 12개월 + 상여 800%)이 자동 계산됩니다.",
  },
  {
    name: "결과 확인",
    text: "월 기본급 × 지급률(%)로 세전 경영성과급이 즉시 표시됩니다.",
  },
  {
    name: "세후 실수령 확인",
    text: "누진세율 + 지방세 + 4대보험 추가 부과를 반영한 세후 실수령액이 자동 계산됩니다.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "에쓰오일 성과급",
    "S-OIL 성과급",
    "에쓰오일 성과급 계산기",
    "에쓰오일 경영성과급",
    "에쓰오일 성과급 250%",
    "에쓰오일 보너스",
    "에쓰오일 상여금",
    "정유사 성과급",
    "에쓰오일 연봉",
    "에쓰오일 성과급 2026",
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

export default function SOilBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "S-OIL 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "S-OIL 경영성과급 계산하는 방법",
            description:
              "최근 지급 실적 시나리오·본인 월 기본급으로 세전 성과급 + 세후 실수령액을 산출하는 4단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Fuel className="w-3.5 h-3.5" />
              연 1회 경영성과급 · 최근 3년 1,500% → 800% → 250% 변동
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              S-OIL 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              본인 월 기본급만 입력하면 최근 지급 실적{" "}
              <strong>250% · 800% · 1,500%</strong> 시나리오별 세전·세후
              실수령액이 즉시 계산됩니다. 2025년 실적분(2026년 지급)은{" "}
              <strong>미확정</strong> — 확정 보도가 나오면 즉시 반영합니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* 2026년(2025 실적분) 미확정 노티스 — 확정 보도 시 이 블록을 확정값으로 교체 */}
          <aside
            className="mb-6 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6"
            aria-label="2025년 실적분 성과급 미확정 안내"
          >
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">
              ⏰ 2025년 실적분(2026년 지급) 아직 미확정
            </p>
            <p className="text-sm leading-relaxed text-navy">
              SBS Biz 2026-02-22 보도에 따르면 S-OIL은{" "}
              <strong>3월 지급을 목표로 격려금 규모를 검토 중</strong>인 것으로
              알려졌으나, 확정 지급률 보도는 아직 확인되지 않았습니다.
            </p>
            <p className="text-xs text-faint mt-2 leading-relaxed">
              확정 발표가 나오면 이 페이지에 즉시 반영합니다. 그 전에는 아래
              계산기에서 최근 3개년 실적 시나리오(250%·800%·1,500%)나 직접
              입력으로 미리 계산해 보세요.
            </p>
          </aside>

          {/* Calculator */}
          <SOilBonusClient />

          {/* 결과 직후 광고 */}
          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 제도 개요 */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="policy-heading"
          >
            <h2 id="policy-heading" className="text-2xl font-black mb-4">
              S-OIL 경영성과급 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">제도 특징</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 정식 명칭 없는 <strong>연 1회 경영성과급</strong></li>
                  <li>• 전년도 <strong>영업이익 실적</strong> 기반</li>
                  <li>• 매년 초(통상 2월) <strong>월 기본급의 %</strong>로 일괄 지급</li>
                  <li>• 지급 기준 미명문화 — 노조가 명문화 요구 중</li>
                  <li>• 생산직 채용공고 기준 <strong>별도 상여금 800%</strong>가 성과급과 별개로 존재</li>
                </ul>
              </article>
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📊 최근 지급 실적 (보도 기준)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 2022년 실적분(2023년 초): <strong>기본급 1,500%</strong>{" "}
                    <span className="text-xs text-faint">(파이낸셜뉴스 2024-02-05 · 시사오늘 1,470% 보도, 매체 간 차이)</span>
                  </li>
                  <li>
                    • 2023년 실적분(2024년 초): <strong>기본급 800%</strong>{" "}
                    <span className="text-xs text-faint">(데일리한국 2025-02-20 기사 내 인용)</span>
                  </li>
                  <li>
                    • 2024년 실적분(2025-02): <strong>기본급 250% 확정</strong>{" "}
                    <span className="text-xs text-faint">(데일리한국·네이트뉴스 2025-02-20 — 영업이익 4,606억원·전년비 -66%)</span>
                  </li>
                  <li>
                    • 2025년 실적분(2026년): <strong className="text-primary">미확정</strong>{" "}
                    <span className="text-xs text-faint">(SBS Biz 2026-02-22 — 3월 지급 목표 검토 중)</span>
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* 본문 중간 광고 */}
          <div className="mt-8">
            <GuideMidAd />
          </div>

          {/* 제도 개편 논의 + 업계 비교 */}
          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="reform-heading"
          >
            <h2
              id="reform-heading"
              className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2"
            >
              <Info className="w-5 h-5 text-primary" />
              성과급 명문화 논의 &amp; 정유 4사 비교
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              S-OIL 성과급은 지급 기준이 명문화되어 있지 않아{" "}
              <strong>노조가 성과급 명문화를 요구</strong>하고 있습니다. 더팩트
              2025-03-07 보도에 따르면 노사는{" "}
              <strong>
                비재무 평가 기반 중간 성과급 제도(SK이노베이션 LTI 벤치마킹)를
                이사회에 보고
              </strong>
              하기로 합의했습니다. 제도가 확정되면 지급 구조가 달라질 수
              있습니다.
            </p>
            <p className="text-sm leading-relaxed text-navy mt-3">
              같은 보도의 업계 비교 기준, 2024년 실적분 정유 4사 성과급은{" "}
              <strong>SK이노베이션 660% · HD현대오일뱅크 265% · GS칼텍스
              250% · S-OIL 250%</strong>로, 업황 부진에 4사 모두 전년 대비 크게
              줄었습니다.
            </p>
          </section>

          {/* FAQ 앞 광고 */}
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
                  본 계산기는 공개 언론 보도(데일리한국·네이트뉴스 2025-02-20,
                  파이낸셜뉴스 2024-02-05, 더팩트 2025-03-07, SBS Biz
                  2026-02-22)와 사업보고서 기반 추정 모델이며 회사 공식 자료가
                  아닙니다. 2025년 실적분(2026년 지급)은 미확정이고, 실제
                  지급은 본인 직군·근속·기본급 구성에 따라 차이가 날 수
                  있습니다.
                </span>
              </span>
            </p>
          </aside>

          {/* 관련 링크 카드 */}
          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/incentive-tax"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 함께 보기</p>
              <p className="font-black text-lg">성과급 세금 계산기 →</p>
              <p className="text-sm text-faint mt-1">
                성과급 실수령액·세금만 따로 정밀 계산
              </p>
            </Link>
            <Link
              href="/salary-db/s-oil"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">S-OIL 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                평균연봉 1억 5,404만원(2024 공시) · 직급별 연봉·복지 전체
              </p>
            </Link>
          </section>

          {/* 쿠팡 + 관련 계산기 */}
          <div className="mt-10">
            <CoupangBanner
              responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
            />
          </div>

          <BonusClusterLinks currentSlug="s-oil-bonus" />

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
                <strong>데이터 출처</strong>: 데일리한국·네이트뉴스
                2025-02-20(2024 실적분 250% 확정·영업이익 4,606억원·전년
                800%), 파이낸셜뉴스 2024-02-05(2022 실적분 1,500% · 시사오늘
                1,470% 보도 병존), 더팩트 2025-03-07(성과급 명문화 논의·정유
                4사 비교), SBS Biz 2026-02-22(2026년 3월 지급 목표 검토 중),
                디지털타임스 2025-03-19(2024 사업보고서 평균연봉 1억
                5,404만원). 2026년 세법(소득세율·4대보험 요율) 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
