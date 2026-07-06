// src/app/calc/lg-chem-bonus/page.tsx
//
// LG화학 PS + PI 성과급 계산기.
// 사업부별 차등: 석유화학(850%) / 첨단소재·생명과학(600%) — 2022 호황 사례.
// PS 720~730% + PI 200% (연간 고정) 구조.

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
import { Beaker, AlertTriangle, Info } from "lucide-react";
import LgChemBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/lg-chem-bonus";
const PAGE_TITLE = "LG화학 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "LG화학 PS + PI 성과급 계산기. 사업부별 시나리오(석유화학 850% / 첨단소재·생명과학 600% / 적자 0%)와 본인 기본급만 입력하면 세전·세후 실수령액이 즉시. PS 720~730% + PI 200% 사례 반영.";

const FAQ_ITEMS = [
  {
    question: "LG화학 성과급은 어떻게 구성되나요?",
    answer:
      "LG화학은 (1) PS(Profit Sharing, 연 1회 영업이익 연동) + (2) PI(생산성격려금, 연간 고정 200%) 두 가지 구조입니다. PS는 사업부 영업이익에 따라 변동이 크고(0~850%), PI는 안정적으로 매년 기본급의 200% 지급. 본 계산기는 사업부 시나리오를 선택하면 PS + PI 합산 자동 산출됩니다.",
  },
  {
    question: "사업부별 PS 차이가 큰가요?",
    answer:
      "2022년 호황 기준 (1) 석유화학본부 850% — 가장 높음, (2) 첨단소재 600%, (3) 생명과학 600%, (4) 배터리(LG에너지솔루션 분사 전) 450%. 2024~2025년 석유화학 다운사이클로 0%대까지 떨어진 사업부도 있음. 본 계산기 호황/평년/적자 3단계 시나리오로 시뮬레이션.",
  },
  {
    question: "2022년 연봉 10~12% 인상 사례는?",
    answer:
      "2022년 초 LG화학은 직원 연봉을 10~12% 인상 + 성과급 720~730% 지급으로 화제가 됐습니다. 핀포인트뉴스 보도 기준. 당시 석유화학 슈퍼사이클 + 배터리 사업 분사 효과로 영업이익이 폭발했기 때문. 본 계산기 '호황' 시나리오로 이 수준 시뮬레이션 가능.",
  },
  {
    question: "PI 200%는 안정적인가요?",
    answer:
      "네. PI는 연간 고정으로 기본급의 200% 지급되는 안정 항목입니다. 회사 영업이익이 적자여도 PI는 보장. 단, 노사 합의로 변경 가능성은 있음. 본 계산기에서 PI 포함 여부를 체크박스로 ON/OFF 가능.",
  },
  {
    question: "LG에너지솔루션과 어떻게 다른가요?",
    answer:
      "LG에너지솔루션은 2022년 LG화학에서 분사한 자회사. 현재는 별도 임단협 + 별도 성과급 체계입니다. LG엔솔은 단일 풀(50~900%) 단순 구조, LG화학은 PS + PI 분리 구조. '/calc/lg-energy-bonus' 비교 가능.",
  },
  {
    question: "기본급은 어떻게 정의하나요?",
    answer:
      "LG화학의 '기본급'은 월 통상임금(매월 정기 지급 본봉)입니다. PS·PI 모두 월 기본급 기준 % 형태로 지급. 본인 기본급은 급여명세서 '기본급/통상임금' 항목 확인. 본 계산기는 본인 기본급 입력으로 추정 연봉(기본급 × 16~18)도 자동 산출됩니다.",
  },
  {
    question: "세금은 어떻게 떼나요?",
    answer:
      "성과급은 근로소득 합산 누진세율(6~45%) + 지방세 + 4대보험. 국민연금은 보수월액 상한(2026.7~ 연 7,908만원) 적용. 본 계산기는 marginal 방식으로 정확하게 계산.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "공개 보도(서울경제·핀포인트뉴스·사람인) + LG화학 노조 자료 + 사업보고서 기반 추정. 실제 지급은 본인 사업부·평가·근속에 따라 ±15% 차이 가능.",
  },
];

const HOW_TO_STEPS = [
  { name: "사업부 시나리오 선택", text: "석유화학 호황 850% / 첨단소재 600% / 평년 400% / 적자 100% / 0%." },
  { name: "본인 월 기본급 입력", text: "월 통상임금 입력 (보통 400~600만원)." },
  { name: "PI 포함 여부", text: "PI(연간 고정 200%) 포함 체크. 기본 포함." },
  { name: "결과 확인", text: "PS + PI 합산 세전 즉시 표시." },
  { name: "세후 실수령 확인", text: "누진세율 + 4대보험 marginal 자동 계산." },
];

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE_FULL },
  description: PAGE_DESC,
  keywords: [
    "LG화학 성과급",
    "LG화학 PS",
    "LG화학 PI",
    "LG화학 성과급 계산기",
    "석유화학 성과급",
    "LG화학 보너스",
    "LG화학 인센티브",
    "LG화학 2026",
    "첨단소재 성과급",
    "LG화학 임단협",
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

export default function LgChemBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "LG화학 성과급" }),
          softwareApplicationLd({ name: PAGE_TITLE, description: PAGE_DESC, url: `${SITE_URL}${PAGE_PATH}` }),
          faqLd(FAQ_ITEMS),
          howToLd({
            name: "LG화학 성과급 계산하는 방법",
            description: "사업부 시나리오·본인 기본급으로 PS+PI 세전·세후 실수령액을 산출하는 5단계 가이드",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Beaker className="w-3.5 h-3.5" />
              2022 석유화학 850% / 첨단소재·생명과학 600% 사례
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              LG화학 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              <strong>PS(연 1회) + PI(연간 고정 200%)</strong> 구조. 사업부 시나리오와
              본인 기본급만 입력하면 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
          </header>

          <LgChemBonusClient />

          <div className="mt-8">
            <CalcResultAd />
          </div>

          {/* 성과급 구조 · 지급 이력 — 본문 콘텐츠 (광고 사이 배치) */}
          <section
            className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
            aria-labelledby="lgchem-structure-heading"
          >
            <h2 id="lgchem-structure-heading" className="text-2xl font-black mb-4">
              LG화학 성과급 구조 — PS · PI
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">PS (Profit Sharing)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 사업부 <strong>영업이익 연동</strong>, 변동 큼 (0~850%)</li>
                  <li>• 연 1회 지급, 월 기본급 기준 %</li>
                  <li>• 사업부별 차등 — 적자 사업부는 0%대</li>
                </ul>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">PI (생산성격려금)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 연간 고정 <strong>기본급의 200%</strong></li>
                  <li>• 영업이익 적자여도 보장되는 안정 항목</li>
                  <li>• 노사 합의로 변경 가능성은 있음</li>
                </ul>
              </article>
            </div>
            <h3 className="font-bold text-lg mb-3">사업부별 PS 지급 이력 (보도 기준)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-4 font-bold">시기</th>
                    <th className="py-2 pr-4 font-bold">사업부</th>
                    <th className="py-2 font-bold">PS (월 기본급 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">2022 호황</td>
                    <td className="py-2 pr-4">석유화학본부</td>
                    <td className="py-2">850%</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">2022 호황</td>
                    <td className="py-2 pr-4">첨단소재 · 생명과학</td>
                    <td className="py-2">600%</td>
                  </tr>
                  <tr className="border-b border-canvas-deep">
                    <td className="py-2 pr-4">2022 호황</td>
                    <td className="py-2 pr-4">배터리 (분사 전)</td>
                    <td className="py-2">450%</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">2024~2025 다운사이클</td>
                    <td className="py-2 pr-4">석유화학 일부</td>
                    <td className="py-2">0%대</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-faint mt-3">
              ※ 서울경제·핀포인트뉴스 보도 기반. 2022년에는 연봉 10~12% 인상 +
              성과급 720~730% 지급 사례도 보도되었습니다.
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
                  서울경제·핀포인트뉴스·사람인 + LG화학 노조 자료 기반 추정. 실제
                  지급은 사업부·평가·근속에 따라 ±15% 차이 가능.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/lg-energy-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">LG에너지솔루션 성과급 →</p>
              <p className="text-sm text-faint mt-1">배터리 사이클 50~900% (LG화학에서 분사)</p>
            </Link>
            <Link
              href="/salary-db/lg-chem"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">LG화학 평균 연봉·복지 →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 워라밸 전체</p>
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
                <strong>데이터 출처</strong>: 서울경제 2022 LG화학 850% 보도,
                핀포인트뉴스 2022 720~730% 사례, LG화학 노조 자료, 사람인 연봉 데이터.
                2026 세법 반영.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
