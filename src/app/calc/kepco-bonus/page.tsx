// src/app/calc/kepco-bonus/page.tsx
//
// 한국전력 경영평가 성과급 계산기.
// 공공기관 경영평가(기재부, 매년 6월 발표) 등급별 지급률 —
// 공기업 직원 기준 월 기본급의 S 250% / A 200% / B 150% / C 100% / D·E 0%
// (비즈니스포스트 2024-06-17). 한전은 2025년도 평가 A등급으로 2년 연속 A
// (이투데이 2026-06-19, 아시아경제 2026-06-20).
// 갱신 체크포인트: 매년 6월 기재부 경영평가 발표 시 시나리오·배지 갱신.

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
import { Zap, AlertTriangle, Info } from "lucide-react";
import KepcoBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/kepco-bonus";
const PAGE_TITLE = "한국전력 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "한국전력(한전) 경영평가 성과급 계산기. 본인 월 기본급만 입력하면 공공기관 경영평가 등급별 지급률(S 250%·A 200%·B 150%·C 100%) 기준 세전·세후 실수령액이 즉시 계산됩니다. 2025년도 평가 A등급(2년 연속) 반영, 2026 기준.";

const FAQ_ITEMS = [
  {
    question: "한국전력 성과급은 어떻게 결정되나요?",
    answer:
      "한전 직원 성과급의 핵심은 '공공기관 경영평가 성과급(경평 성과급)'입니다. 기획재정부가 매년 6월 전년도 경영실적 평가 결과를 발표하고, 등급(S~E)에 따라 공기업 직원 기준 월 기본급의 일정 비율로 차등 지급됩니다. 등급별 지급률은 S 250% / A 200% / B 150% / C 100% / D·E 0%로 보도됐습니다(비즈니스포스트 2024-06-17). C등급 이상만 지급 대상입니다(이투데이 2026-06-19). 개인별로는 내부평가에 따라 추가 차등이 적용됩니다.",
  },
  {
    question: "2026년에 받는 한전 성과급은 얼마인가요?",
    answer:
      "2026년 6월 발표된 2025년도 경영평가에서 한전은 A등급(우수)을 받아 2년 연속 A등급을 유지했습니다(이투데이 2026-06-19, 아시아경제 2026-06-20). 공기업 A등급 직원 성과급은 월 기본급의 200% 상당입니다. 예를 들어 월 기본급 300만원이면 세전 약 600만원 수준이며, 개인별 내부평가에 따라 차등됩니다. 위 계산기에 본인 기본급을 입력해 세후 실수령까지 확인하세요.",
  },
  {
    question: "한전의 최근 경영평가 등급 추이는?",
    answer:
      "2022년도 D등급(미흡, 성과급 미지급) → 2023년도 B등급(양호, 월 기본급의 150% 상당) → 2024년도 A등급(우수) → 2025년도 A등급으로 2년 연속 A를 유지 중입니다(아시아경제 2026-06-20 회고, 이투데이 2026-06-19). 등급별 지급률은 비즈니스포스트 2024-06-17 보도 기준입니다.",
  },
  {
    question: "성과급이 0원이 되는 경우도 있나요?",
    answer:
      "있습니다. 경영평가 D·E등급은 지급률 0%로 성과급이 아예 지급되지 않습니다. 실제로 한전은 2022년도 평가에서 D등급(미흡)을 받아 성과급을 받지 못했습니다(아시아경제 2026-06-20 회고). 앞서 2021년도 평가 때는 대규모 적자를 이유로 기획재정부가 한전에 성과급 자율 반납을 권고하기도 했습니다(뉴시스 2022-06-20). 실적 악화가 곧바로 성과급 삭감으로 이어지는 구조입니다.",
  },
  {
    question: "한전 성과급은 언제 지급되나요?",
    answer:
      "경영평가 발표가 매년 6월이므로 경평 성과급은 그 이후 지급되는 구조입니다. 과거 보도 기준으로는 경평 성과급을 하반기(9월·12월)에 나눠 지급하고, 별도의 내부 자체 성과급(월 기본급 200%)은 3월·6월에 분할 지급했습니다(전기신문 2016-09-26). 다만 이는 10년 전 보도로 현재 지급 시기·내부 성과급 비율은 달라졌을 수 있으니, 정확한 일정은 사내 공지로 확인하세요.",
  },
  {
    question: "1인당 평균 얼마나 받나요?",
    answer:
      "최근 연도의 1인당 평균 지급액 보도는 확인되지 않았습니다. 오래된 참고치로, A등급이던 2015년도 평가 당시 경평 성과급은 1인당 평균 약 1,000만원(9월·12월 분산)이었고 내부 성과급까지 포함하면 연간 약 2,000만원, B등급이던 해에는 1인당 700만원대로 보도된 바 있습니다(전기신문 2016-09-26, 서울파이낸스 2016-09-23). 10년 전 수치이므로 규모감 참고용으로만 보시고, 현재 기준은 위 계산기에서 본인 월 기본급 × 등급 지급률로 계산하는 것이 더 정확합니다.",
  },
  {
    question: "한전 평균 연봉은 얼마인가요?",
    answer:
      "알리오(ALIO, 공공기관 경영정보 공개시스템) 기준 2025년 한전 정규직 1인당 평균보수는 9,638만원입니다(매일경제 2026-05-06 보도 인용). 상장사인 한전은 DART 사업보고서에도 직원 보수가 공시되지만 산정 방식 차이로 소폭 다를 수 있습니다. 직급별 상세는 '한국전력 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "공기업 성과급은 민간 대기업 성과급과 뭐가 다른가요?",
    answer:
      "민간 대기업 인센티브(삼성 OPI, SK하이닉스 PS 등)는 초과이익이 나면 별도 재원을 얹어 주는 구조지만, 공기업 경영평가 성과급은 사실상 보수 재원의 일부를 평가 등급에 따라 차등 지급하는 성격이라는 해설이 있습니다(전기신문 2016-09-26). 즉 등급이 낮으면 사실상 연봉이 깎이는 효과가 있습니다. 또 지급률 자체가 기재부 경영평가 체계로 정해지므로 회사가 임의로 올릴 수 없다는 점도 다릅니다.",
  },
  {
    question: "성과급 세금은 어떻게 계산되나요?",
    answer:
      "경평 성과급도 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%) + 지방소득세(소득세의 10%) + 4대보험이 부과됩니다. 단 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원) 이상은 추가 부과가 없습니다. 본 계산기는 연 총보수+성과급 합산 세금에서 총보수만 기준 세금을 뺀 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 공개 언론 보도(이투데이·아시아경제 2026-06 경영평가 결과, 비즈니스포스트 2024-06-17 등급별 지급률) 기반 추정 시뮬레이터이며 회사·정부 공식 자료가 아닙니다. '월 기본급의 200% 상당'은 공기업 직원 기준 등급별 지급률이고, 실제 개인 지급액은 내부평가 차등·직급·성과급 산정 기준보수(내부 규정)에 따라 달라질 수 있습니다. 정확한 본인 케이스는 사내 급여 명세서로 확인하세요.",
  },
];

const HOW_TO_STEPS = [
  {
    name: "평가연도(시나리오) 선택",
    text: "2025년도 A등급(2026년 지급) / 2024년도 A / 2023년도 B / 2022년도 D 중 선택. 등급 직접 선택(커스텀)도 가능.",
  },
  {
    name: "본인 월 기본급 입력",
    text: "급여명세서의 월 기본급을 만원 단위로 입력. 경평 성과급 = 월 기본급 × 등급 지급률.",
  },
  {
    name: "연 총보수 입력",
    text: "세금 계산용. 기본값은 알리오 2025년 정규직 평균보수 9,638만원.",
  },
  {
    name: "결과 확인",
    text: "월 기본급 × 등급 지급률(A등급 200%)의 세전 성과급이 즉시 표시.",
  },
  {
    name: "세후 실수령 확인",
    text: "누진세율 + 4대보험 추가 부과 반영한 세후 실수령액 자동 계산.",
  },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "한국전력 성과급",
    "한전 성과급",
    "한전 성과급 계산기",
    "한전 경영평가 성과급",
    "공공기관 경영평가 성과급",
    "공기업 성과급",
    "경평 성과급",
    "한전 성과급 지급일",
    "한전 연봉",
    "한국전력공사 성과급 2026",
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

export default function KepcoBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "한국전력 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
          }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "한국전력 경영평가 성과급 계산하는 방법",
            description:
              "경영평가 등급 시나리오·본인 월 기본급으로 경평 성과급 세전·세후 실수령을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              2025년도 경영평가 A등급 · 2년 연속 A (2026-06 발표)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              한국전력 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              공공기관 경영평가 등급 기준 본인 월 기본급만 입력하면{" "}
              <strong>A등급 = 월 기본급의 200% 상당</strong> 경평 성과급의
              세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <KepcoBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="grade-heading"
          >
            <h2 id="grade-heading" className="text-2xl font-black mb-4">
              공공기관 경영평가 성과급 구조
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 등급별 지급률 (공기업 직원 기준)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• S등급 — 월 기본급의 <strong>250%</strong></li>
                  <li>
                    • A등급(우수) — 월 기본급의 <strong>200%</strong>{" "}
                    <span className="text-primary font-bold">← 한전 2024·2025년도</span>
                  </li>
                  <li>• B등급(양호) — 월 기본급의 <strong>150%</strong></li>
                  <li>• C등급 — 월 기본급의 <strong>100%</strong></li>
                  <li>• D·E등급 — <strong>0% (미지급)</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  기획재정부가 매년 6월 전년도 경영실적 평가 결과 발표. C등급 이상만
                  지급(이투데이 2026-06-19). 지급률 표: 비즈니스포스트 2024-06-17.
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📈 한전 등급 이력 (최근 4개년)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>
                    • 2022년도 — <strong>D등급(미흡)</strong> → 성과급 미지급
                  </li>
                  <li>
                    • 2023년도 — <strong>B등급(양호)</strong> → 150% 상당
                  </li>
                  <li>
                    • 2024년도 — <strong>A등급(우수)</strong> → 200% 상당
                  </li>
                  <li>
                    • 2025년도 — <strong>A등급(우수, 2년 연속)</strong> → 200% 상당
                  </li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  아시아경제 2026-06-20 회고, 이투데이 2026-06-19. 2021년도 평가
                  때는 대규모 적자로 기재부가 성과급 자율 반납을 권고(뉴시스
                  2022-06-20).
                </p>
              </article>
            </div>
          </section>

          <div className="mt-8">
            <GuideMidAd />
          </div>

          <section
            className="mt-8 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="timing-heading"
          >
            <h2 id="timing-heading" className="text-xl sm:text-2xl font-black mb-3">
              지급 시기와 공기업 성과급의 특성
            </h2>
            <p className="text-sm leading-relaxed text-navy">
              경영평가 결과가 매년 6월 발표되므로 경평 성과급은 그 이후에 지급되는
              구조입니다. 과거 보도 기준으로는 경평 성과급을{" "}
              <strong>하반기(9월·12월)에 분산 지급</strong>하고, 별도의 내부 자체
              성과급(월 기본급 200%)을 3월·6월에 분할 지급했습니다(전기신문
              2016-09-26). 다만 이는 10년 전 보도라서 현재의 지급 시기·내부 성과급
              비율은 달라졌을 수 있습니다 — 정확한 일정은 사내 공지 기준으로
              확인하세요.
            </p>
            <p className="text-sm leading-relaxed text-navy mt-3">
              또 하나 알아둘 점은, 공기업 경영평가 성과급은 민간 대기업 인센티브와
              달리 <strong>사실상 보수 재원의 차등지급분 성격</strong>이라는
              해설(전기신문 2016-09-26)이 있다는 것입니다. 등급이 낮아지면 사실상
              연봉이 깎이는 효과가 있고, 반대로 지급률 상한도 기재부 체계(S등급
              250%)로 정해져 있어 민간처럼 이익에 비례해 무제한 커지지 않습니다.
            </p>
          </section>

          <div className="mt-10">
            <InArticleAd />
          </div>

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

          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">
                  ⚠️ 추정 시뮬레이터입니다
                </strong>
                <span className="text-amber-800">
                  공개 언론 보도(경영평가 등급·등급별 지급률) 기반 추정이며 회사·정부
                  공식 자료가 아닙니다. 실제 지급액은 개인별 내부평가 차등·직급·성과급
                  산정 기준보수에 따라 달라질 수 있고, 과거 지급 시기 관행(9·12월
                  분산)은 10년 전 보도 기준이라 현재와 다를 수 있습니다.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/salary-db/kepco"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">한국전력 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">
                알리오 2025 평균보수 9,638만원 · 직급별 연봉·복지 전체
              </p>
            </Link>
            <Link
              href="/calc/incentive-tax"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">🧮 함께 보기</p>
              <p className="font-black text-lg">성과급 세금 계산기 →</p>
              <p className="text-sm text-faint mt-1">
                금액만 알 때 세후 실수령 빠르게 확인
              </p>
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
                <strong>데이터 출처</strong>: 2025년도 공공기관 경영평가 결과 —
                이투데이(2026-06-19)·아시아경제(2026-06-20), 등급별 지급률 표 —
                비즈니스포스트(2024-06-17), 성과급 자율 반납 권고 —
                뉴시스(2022-06-20), 과거 지급 관행 —
                전기신문(2016-09-26)·서울파이낸스(2016-09-23), 평균보수 —
                알리오 2025년 정규직 평균(매일경제 2026-05-06 인용). 2026 세법 반영.
                2025년도 평가까지 반영, 2026년도 평가는 2027년 6월 발표 예정(미확정).
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
