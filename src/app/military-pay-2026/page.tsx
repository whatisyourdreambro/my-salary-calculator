// src/app/military-pay-2026/page.tsx
// 2026 군인 월급 허브 — "병장 월급"·"군인 월급" 에버그린 수요 (2026-08-30 승인 배치 ⑤).
// 데이터: src/lib/civilServantPay.ts (공무원보수규정 별표 13 원문, 3중 교차검증).
// 광고: civil-servant-pay-2026 표준 배치 복제 (운영자 승인 2026-08-30).
//
// ★ 갱신 체크포인트: 매년 12월 말 국무회의 의결 시 병·간부 봉급 갱신 (civilServantPay
//   기존 슬롯에 편입). 장병내일준비적금 매칭 구조는 예산사업이라 연중 1회 추가 확인.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Shield, Calendar, Calculator, FileText, ArrowRight, PiggyBank } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, datasetLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import {
  MILITARY_PAY_2026,
  MILITARY_OFFICER_STARTING_2026,
  MILITARY_SAVINGS_2026,
} from "@/lib/civilServantPay";
import CitationCopyButton from "@/components/CitationCopyButton";
import SavingsCalc from "./SavingsCalc";

const fmt = (n: number) => n.toLocaleString("ko-KR");

export const metadata: Metadata = buildPageMetadata({
  title: "2026 군인 월급 — 병장 150만원·장병내일준비적금 매칭까지 총정리",
  description:
    "2026년 병사 월급표(이병 75만·일병 90만·상병 120만·병장 150만원)와 장병내일준비적금 정부 매칭(납입 100%, 월 한도 55만원) 구조, 하사·소위 초임 봉급까지. 전역 시 예상 수령액 계산기 포함 — 공무원보수규정 별표 13 원문 수치.",
  path: "/military-pay-2026",
  ogType: "article",
  publishedTime: "2026-08-30",
  modifiedTime: "2026-08-30",
  keywords: [
    "군인 월급 2026",
    "병장 월급",
    "이병 월급",
    "군대 월급",
    "장병내일준비적금",
    "하사 월급",
    "소위 월급",
    "군인 봉급표",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026년 병장 월급은 얼마인가요?",
    answer:
      "2026년 병장 월 봉급은 1,500,000원입니다(이병 75만·일병 90만·상병 120만원, 2025년과 동일). 여기에 장병내일준비적금에 월 최대 55만원을 납입하면 정부가 납입 원금의 100%를 매칭해 전역 시 일괄 지급하므로, 보도에서 말하는 '병장 205만원'은 봉급 150만원 + 적금 매칭 최대 55만원을 합한 개념입니다. 매칭 지원금은 월급으로 받는 것이 아니라 전역할 때 받습니다.",
  },
  {
    question: "장병내일준비적금은 어떤 구조인가요?",
    answer:
      "복무 중 월 최대 55만원(은행별 한도 30만원이라 2개 은행에 분산 가입)을 납입하면, 2024년 이후 납입분에 대해 정부가 원금의 100%를 매칭 지원금으로 얹어 전역 시 일괄 지급합니다. 예를 들어 18개월간 매월 55만원을 넣으면 원금 990만원 + 매칭 990만원 = 1,980만원(+은행 이자)입니다. 이자소득 비과세 혜택은 2026년 12월 31일 가입분까지 적용됩니다.",
  },
  {
    question: "하사·소위 첫 월급은 얼마인가요?",
    answer:
      "2026년 하사 1호봉 월 봉급은 2,133,000원, 소위 1호봉은 2,150,400원입니다(공무원보수규정 별표 13). 봉급 외에 정액급식비·직급보조비 등 공통 수당과 군인 특수근무 수당이 더해지므로 실제 보수는 이보다 높습니다. 하사 1호봉은 저연차 추가 인상(6.6%)이 적용된 금액으로 순경 1호봉과 같습니다.",
  },
  {
    question: "병사 월급에서 세금이나 4대보험을 떼나요?",
    answer:
      "의무복무 병사의 봉급은 소득세 비과세이고 4대보험료 공제도 없어 표의 금액을 그대로 받습니다. 다만 장병내일준비적금 납입액 등 본인이 신청한 항목은 급여에서 빠져나갈 수 있습니다. 간부(하사·소위 이상)는 일반 공무원처럼 소득세·기여금 공제가 적용됩니다.",
  },
  {
    question: "병사 월급은 언제 오르나요?",
    answer:
      "병 봉급은 국방예산과 공무원보수규정 개정(매년 12월 말 국무회의 의결)으로 정해집니다. 2026년 병 봉급은 2025년과 동일하게 유지됐고, 정부는 '봉급+자산형성(적금 매칭)'을 합쳐 병장 기준 월 205만원 수준을 유지하는 구조입니다. 이듬해 변경분은 국무회의 의결 직후 이 페이지에 반영합니다.",
  },
];

export default function MilitaryPay2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "군인 월급 2026", path: "/military-pay-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 군인 월급 — 병사 봉급표·장병내일준비적금·간부 초임 총정리",
            description:
              "병사 월급표(이병~병장)와 장병내일준비적금 정부 매칭 구조, 하사·소위 초임 봉급, 전역 시 수령액 계산기",
            slug: "military-pay-2026",
            url: "/military-pay-2026",
            publishedDate: "2026-08-30",
            modifiedDate: "2026-08-30",
          }),
          datasetLd({
            name: "2026년 군인 봉급표 데이터 (병·초임 간부)",
            description:
              "공무원보수규정 별표 13 기준 2026년 병(이병~병장) 봉급과 하사·소위 1호봉 봉급 데이터셋.",
            url: "/military-pay-2026",
            datePublished: "2026-08-30",
            dateModified: "2026-08-30",
            keywords: ["군인 월급", "병장 월급", "군인 봉급표", "하사 월급"],
          }),
          speakableLd({ url: "/military-pay-2026", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            공무원보수규정 별표 13 · 2026-01-01 시행
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 군인 월급 <span className="text-electric">병사·간부 봉급표</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-30" updatedDate="2026-08-30" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            병장 월 봉급 150만원에 장병내일준비적금 매칭(월 최대 55만원, 전역 시 일괄)을 더하면
            월 205만원 구조입니다. 병사 봉급표부터 적금 만기 계산, 하사·소위 초임까지 한 페이지에
            정리했습니다.
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
            · 국방부 장병내일준비적금 안내 (기준일 2026-08-30)
          </p>
        </div>

        <HomeTopAd />

        {/* 데스크톱 2컬럼 — civil-servant-pay-2026 정본 패턴 (표준 배치 복제) */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 병 봉급표 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric" />
                2026 병사 월급표 (이병~병장)
              </h2>
              <p className="text-xs text-faint-blue mb-5">
                단위: 원(월 봉급액) · 출처: 공무원보수규정 별표 13 — 2025년과 동일(동결)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MILITARY_PAY_2026.map((row) => (
                  <div key={row.rank} className="p-4 bg-canvas rounded-2xl text-center">
                    <p className="text-sm font-bold text-faint-blue mb-1">{row.rank}</p>
                    <p className="text-lg font-black text-navy tabular-nums">{fmt(row.pay)}원</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-faint-blue mt-4">
                ※ 병 봉급은 소득세 비과세·4대보험 공제 없음 — 표의 금액을 그대로 수령합니다.
                &ldquo;병장 205만원&rdquo; 보도는 봉급 150만원 + 장병내일준비적금 매칭 최대
                55만원(전역 시 일괄 수령)을 합한 구조입니다.
              </p>
            </section>

            {/* 적금 계산기 */}
            <section className="mb-12">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-electric" />
                장병내일준비적금 — 전역 시 얼마 받나?
              </h2>
              <p className="text-sm text-muted-blue leading-relaxed mb-5">
                월 최대 {fmt(MILITARY_SAVINGS_2026.monthlyCap)}원 납입 시 정부가{" "}
                <strong className="text-navy">납입 원금의 100%</strong>를 매칭해 전역 시 일괄
                지급합니다. 복무 기간과 월 납입액을 넣어보세요.
              </p>
              <SavingsCalc />
            </section>

            {/* 간부 초임 */}
            <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2">부사관·장교 첫 월급 (2026)</h2>
              <p className="text-xs text-faint-blue mb-5">단위: 원(월 봉급액) · 별표 13</p>
              <div className="grid grid-cols-2 gap-3">
                {MILITARY_OFFICER_STARTING_2026.map((row) => (
                  <div key={row.rank} className="p-4 bg-canvas rounded-2xl text-center">
                    <p className="text-sm font-bold text-faint-blue mb-1">{row.rank}</p>
                    <p className="text-lg font-black text-navy tabular-nums">{fmt(row.pay)}원</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-faint-blue mt-4">
                ※ 간부는 봉급 외 정액급식비(월 16만원)·직급보조비·특수근무 수당이 더해지고,
                일반 공무원처럼 소득세·기여금이 공제됩니다. 직업군인 커리어·연봉 흐름은{" "}
                <Link href="/job/soldier" className="text-electric font-bold hover:underline">
                  직업군인 연봉 페이지
                </Link>
                에서 확인하세요.
              </p>
            </section>

            <InArticleAd />

            {/* 해설 */}
            <section className="mt-10 mb-12 prose prose-slate">
              <h2 className="text-lg font-black text-navy mb-3">
                병사 월급, 어떻게 확인하고 어떻게 굴리나
              </h2>
              <p className="text-sm leading-7 text-muted-blue">
                병 봉급은 공무원보수규정 별표 13으로 정해지는 법정 금액입니다. 2026년 병 봉급은
                동결됐지만, 장병내일준비적금 매칭(월 한도 55만원의 100%)을 합치면 병장 기준 월
                205만원 구조가 유지됩니다. 적금은 은행별 한도가 월 30만원이라{" "}
                <strong>2개 은행에 나눠 가입해야 55만원을 채울 수 있고</strong>, 이자소득
                비과세는 2026-12-31 가입분까지입니다.
              </p>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                전역 후 첫 직장 월급이 궁금하다면{" "}
                <Link href="/table/2026/monthly" className="text-electric font-bold hover:underline">
                  2026 월급 실수령액 표
                </Link>
                에서, 공무원 시험을 준비 중이라면{" "}
                <Link href="/civil-servant-pay-2026" className="text-electric font-bold hover:underline">
                  2026 공무원 봉급표
                </Link>
                ·
                <Link href="/police-pay-2026" className="text-electric font-bold hover:underline">
                  경찰 봉급표
                </Link>
                ·
                <Link href="/firefighter-pay-2026" className="text-electric font-bold hover:underline">
                  소방 봉급표
                </Link>
                를 이어서 확인하세요.
              </p>
            </section>

            {/* CTA 카드 */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/civil-servant-pay-2026"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <Calculator className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">공무원 봉급표 2026</h3>
                <p className="text-sm opacity-90">9~5급 호봉별 월급·수당 구조</p>
              </Link>
              <Link
                href="/job/soldier"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">직업군인 연봉 정보</h3>
                <p className="text-sm text-muted-blue">부사관·장교 커리어별 연봉</p>
              </Link>
              <Link
                href="/savings-interest-2026"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">적금 이자 계산기</h3>
                <p className="text-sm text-muted-blue">전역 후 목돈 굴리기</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">군인 월급 자주 묻는 질문</h2>
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

            <RelatedCalculators currentPath="/military-pay-2026" />

            {/* 인용 복사 — R2 B4 (운영자 승인 2026-08-31): 데이터 변수 기반 빌드타임 생성 */}
            <div className="mt-8">
              <CitationCopyButton
                quote={`2026년 병장 월 봉급은 ${MILITARY_PAY_2026[MILITARY_PAY_2026.length - 1].pay.toLocaleString("ko-KR")}원이며, 장병내일준비적금 정부 매칭(월 최대 ${MILITARY_SAVINGS_2026.monthlyCap.toLocaleString("ko-KR")}원, 전역 시 일괄 수령)을 더하면 월 ${(MILITARY_PAY_2026[MILITARY_PAY_2026.length - 1].pay + MILITARY_SAVINGS_2026.monthlyCap).toLocaleString("ko-KR")}원 구조다 — 공무원보수규정 별표 13 기준.`}
                path="/military-pay-2026"
                quoteId="military-sergeant-pay"
                sourceLabel="군인 월급 봉급표"
              />
            </div>

            <div className="mt-8">
              <ShareButtons
                title="2026 군인 월급 — 병장 150만원·적금 매칭 총정리"
                description="병사 봉급표와 장병내일준비적금 전역 시 수령액 계산까지"
              />
            </div>
          </div>

          {/* Desktop sticky sidebar — civil-servant 동일 조합 */}
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
