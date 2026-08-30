// src/app/police-pay-2026/page.tsx
// 2026 경찰 봉급표 — "경찰 봉급표"·"순경 월급" 에버그린 수요 (2026-08-30 승인 배치 ⑤).
// 데이터: civilServantPay.ts POLICE_RANK_ROWS_2026 (별표 10, 3중 교차검증).
// 광고: civil-servant-pay-2026 표준 배치 복제 (운영자 승인 2026-08-30).
// ★ 갱신 체크포인트: 매년 12월 말 국무회의 의결 시 봉급표·수당 갱신.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Shield, Calendar, Calculator, FileText, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, datasetLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import PoliceFireRankTable from "@/components/PoliceFireRankTable";
import { HAZARD_ALLOWANCE_2026 } from "@/lib/civilServantPay";

const fmt = (n: number) => n.toLocaleString("ko-KR");

export const metadata: Metadata = buildPageMetadata({
  title: "2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급 총정리",
  description:
    "인사혁신처 확정 2026년 경찰공무원 봉급표. 순경 1호봉 월 2,133,000원(저연차 6.6% 인상)부터 경감까지 계급×호봉 월급, 위험근무수당 8만원·수당 구조와 실수령액 계산 흐름 — 공무원보수규정 별표 10 원문 수치.",
  path: "/police-pay-2026",
  ogType: "article",
  publishedTime: "2026-08-30",
  modifiedTime: "2026-08-30",
  keywords: [
    "경찰 봉급표 2026",
    "경찰 월급",
    "순경 월급",
    "순경 초임",
    "경장 월급",
    "경찰공무원 봉급표",
    "경찰 연봉",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026년 순경 첫 월급은 얼마인가요?",
    answer:
      "순경 1호봉 월 봉급은 2,133,000원으로 일반직 9급 1호봉과 같습니다(저연차 추가 인상 6.6% 반영). 여기에 정액급식비(월 16만원)·직급보조비(월 17.5만원)·위험근무수당(월 8만원)과 초과근무수당 등이 더해지므로 실제 세전 보수는 봉급표보다 큽니다. 중앙경찰학교 교육 기간에는 별도 기준이 적용됩니다.",
  },
  {
    question: "경찰 봉급표는 소방과 같나요?",
    answer:
      "네. 공무원보수규정 별표 10은 '경찰공무원·소방공무원' 단일 통합 봉급표입니다. 순경=소방사, 경장=소방교, 경사=소방장, 경위=소방위, 경감=소방경으로 계급이 1:1 대응하며 금액이 같습니다. 차이는 직렬별 수당(위험근무·출동 수당 등)에서 생깁니다.",
  },
  {
    question: "봉급표 금액이 실수령액인가요?",
    answer:
      "아닙니다. 봉급표는 기본급만 표시합니다. 실제 보수는 봉급 + 정액급식비·직급보조비·위험근무수당·초과근무수당·명절휴가비(설·추석 각 월봉급의 60%) 등을 더한 뒤 공무원연금 기여금·건강보험·소득세를 공제한 금액입니다. 교대근무가 많은 지구대·파출소는 초과근무수당 비중이 커서 실수령 편차가 큽니다.",
  },
  {
    question: "경찰 위험근무수당은 얼마인가요?",
    answer:
      "2026년 위험근무수당은 월 80,000원으로 전년 7만원에서 인상됐습니다. 112 출동수당과 관련 출동 가산금의 일 상한도 3만원에서 4만원으로 올랐습니다(2026년 공무원수당규정 개정).",
  },
  {
    question: "승진하면 월급이 얼마나 오르나요?",
    answer:
      "같은 5호봉 기준 순경 2,281,100원 → 경장 2,427,500원 → 경사 2,710,600원 → 경위 2,879,500원 → 경감 3,178,700원으로, 한 계급 승진마다 월 15만~30만원가량 오릅니다. 승진 시 호봉도 일부 이어지므로 실제 인상 폭은 더 큽니다.",
  },
];

export default function PolicePay2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "경찰 봉급표 2026", path: "/police-pay-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급과 수당 구조",
            description:
              "경찰공무원 봉급표(순경~경감 1~5호봉)와 위험근무수당·수당 구조, 실수령액 계산 흐름",
            slug: "police-pay-2026",
            url: "/police-pay-2026",
            publishedDate: "2026-08-30",
            modifiedDate: "2026-08-30",
          }),
          datasetLd({
            name: "2026년 경찰공무원 봉급표 데이터 (순경~경감 1~5호봉)",
            description:
              "공무원보수규정 별표 10 기준 2026년 경찰공무원 계급별·호봉별 월 봉급액 데이터셋.",
            url: "/police-pay-2026",
            datePublished: "2026-08-30",
            dateModified: "2026-08-30",
            keywords: ["경찰 봉급표", "순경 월급", "경찰 월급", "경찰공무원"],
          }),
          speakableLd({ url: "/police-pay-2026", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            공무원보수규정 별표 10 · 2026-01-01 시행
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 경찰 봉급표 <span className="text-electric">순경~경감 월급</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-30" updatedDate="2026-08-30" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            순경 1호봉 월 2,133,000원(저연차 6.6% 인상 반영)부터 경감까지 — 계급×호봉 봉급표
            원문 수치와 위험근무수당·실수령 계산 흐름을 정리했습니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처:{" "}
            <a
              href="https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              인사혁신처 2026년 공무원 봉급표
            </a>{" "}
            · 법제처 공무원수당규정
          </p>
        </div>

        <HomeTopAd />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 봉급표 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric" />
                2026 경찰공무원 봉급표 (순경~경감, 1~5호봉)
              </h2>
              <p className="text-xs text-faint-blue mb-5">
                단위: 원(월 봉급액) · 출처: 공무원보수규정 별표 10 (경찰·소방 통합표)
              </p>
              <PoliceFireRankTable variant="police" />
              <p className="text-xs text-faint-blue mt-4">
                ※ 참고: 경정 1호봉 월 {fmt(3126100)}원. 소방공무원은 동일 표를 적용받습니다 —{" "}
                <Link href="/firefighter-pay-2026" className="text-electric font-bold hover:underline">
                  소방 봉급표 페이지
                </Link>
                에서 소방 계급 기준으로 볼 수 있습니다.
              </p>
            </section>

            <CalcResultAd />

            {/* 수당 해설 */}
            <section className="mt-10 mb-12 prose prose-slate">
              <h2 className="text-lg font-black text-navy mb-3">봉급 위에 얹히는 경찰 수당</h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>위험근무수당</strong> — 월 {fmt(HAZARD_ALLOWANCE_2026)}원 (2026년 7만→8만원 인상)
                </li>
                <li>
                  <strong>112 출동수당·출동 가산금</strong> — 일 상한 4만원 (2026년 3만→4만원 인상)
                </li>
                <li>
                  <strong>정액급식비</strong> 월 16만원 · <strong>직급보조비</strong> 월 17.5만원(순경~경사급) ·{" "}
                  <strong>명절휴가비</strong> 설·추석 각 월봉급의 60%
                </li>
                <li>
                  <strong>초과근무수당</strong> — 교대·비상근무 비중이 커 실수령 편차의 핵심
                </li>
              </ul>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                수당까지 합친 순경 초임의 세전 보수는 일반직 9급 초임(연 3,428만원)보다 높은
                편입니다. 세후 실수령은{" "}
                <Link href="/salary/36000000" className="text-electric font-bold hover:underline">
                  연봉 3,600만원 실수령액 표
                </Link>
                에서, 경찰 커리어별 연봉 흐름은{" "}
                <Link href="/job/police-officer" className="text-electric font-bold hover:underline">
                  경찰공무원 연봉 페이지
                </Link>
                에서 확인하세요.
              </p>
            </section>

            <InArticleAd />

            {/* CTA */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/civil-servant-pay-2026"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <Calculator className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">공무원 봉급표 2026</h3>
                <p className="text-sm opacity-90">일반직 9~5급 호봉별 월급</p>
              </Link>
              <Link
                href="/job/police-officer"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">경찰공무원 연봉 정보</h3>
                <p className="text-sm text-muted-blue">계급·연차별 연봉 흐름</p>
              </Link>
              <Link
                href="/firefighter-pay-2026"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">소방 봉급표 2026</h3>
                <p className="text-sm text-muted-blue">소방사~소방경 동일표</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">경찰 월급 자주 묻는 질문</h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details
                    key={item.question}
                    className="group p-5 bg-white rounded-2xl border border-canvas-200"
                  >
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                      {item.question}
                      <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

            <RelatedCalculators currentPath="/police-pay-2026" />

            <div className="mt-8">
              <ShareButtons
                title="2026 경찰 봉급표 — 순경~경감 계급·호봉별 월급"
                description="순경 1호봉 213만원부터 경감까지, 위험근무수당·수당 구조 총정리"
              />
            </div>
          </div>

          <aside
            className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
            aria-label="추천·광고"
          >
            <SidebarAd />
            <CoupangBanner size="skyscraper" showDisclosure={false} />
          </aside>
        </div>
      </div>
    </main>
  );
}
