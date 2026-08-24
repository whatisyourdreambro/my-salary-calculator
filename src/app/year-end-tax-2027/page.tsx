// src/app/year-end-tax-2027/page.tsx
//
// 연말정산 허브 — "연말정산 2027"·"연말정산 총정리" 검색 의도 정면 대응.
// 2026년 귀속분을 2027년 1~2월에 정산하는 시즌 전체의 단계별 로드맵.
// 데이터 단일 소스: src/data/yearEndTaxHub.ts (bonusCalcHub 패턴).
// 주의: /year-end-tax-2026 은 프리랜서 5월 종합소득세 가이드(의도 상이) —
// 본 허브와 카니발 아님을 본문에서 명시. 기존 페이지 무수정 원칙.
// 광고: GuideMid(로드맵 직후)·Multiplex(하단) — 운영자 일괄 승인 2026-08-23.
// 실험 #3(2026-08-24): CalcResult(캘린더 직후)·InArticle(뉴스 직후)·쿠팡(최하단) 추가
// — 조상 layout 광고 없음(PageFooterAds 미상속), 페이지 내 슬롯 중복 0.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { buildPageMetadata } from "@/lib/seo";
import {
  autoBreadcrumbLd,
  faqLd,
  itemListLd,
  speakableLd,
} from "@/lib/structuredData";
import {
  YEAR_END_STEPS,
  YEAR_END_CALENDAR,
  YEAR_END_NEWS,
} from "@/data/yearEndTaxHub";
import { CalendarDays, Newspaper, ArrowRight, Calculator, ClipboardCheck, BookOpen } from "lucide-react";
import { CalcResultAd, GuideMidAd, InArticleAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const dynamic = "force-static";

const PAGE_PATH = "/year-end-tax-2027";

export const metadata: Metadata = buildPageMetadata({
  title: "연말정산 2027 총정리 — 2026년 귀속, 일정·계산기·단계별 로드맵",
  description:
    "2026년 귀속 연말정산(2027년 1~2월 신고)의 모든 것. 홈택스 미리보기부터 12월 지출 마감, 1월 간소화 제출, 2월 환급 확인까지 단계별 로드맵과 계산기·체크리스트를 한 곳에 모았습니다.",
  path: PAGE_PATH,
  keywords: [
    "연말정산 2027",
    "연말정산 일정",
    "연말정산 총정리",
    "연말정산 계산기",
    "연말정산 미리보기",
    "연말정산 간소화",
  ],
});

const FAQS = [
  {
    question: "연말정산 2027은 언제 하나요?",
    answer:
      "2026년 1월~12월 소득(2026년 귀속)에 대한 연말정산을 2027년 1~2월에 합니다. 간소화 서비스는 예년 기준 1월 중순에 열리고, 회사 제출을 거쳐 보통 2월 급여에 환급·추가납부가 반영됩니다.",
  },
  {
    question: "지금(연말 전) 미리 준비하면 무엇이 달라지나요?",
    answer:
      "공제 대상 지출은 12월 31일에 마감됩니다. 미리 예상 환급액을 계산해 보면 연금저축·IRP 추가 납입, 카드 사용 수단 조절(신용 15% vs 체크 30%), 월세 서류 준비 같은 '아직 할 수 있는 절세'를 놓치지 않을 수 있습니다.",
  },
  {
    question: "세액공제율에 왜 16.5%와 15% 두 숫자가 있나요?",
    answer:
      "같은 공제를 지방소득세 포함(16.5%)으로 부르기도, 소득세 기준(15%)으로 부르기도 하기 때문입니다. 지방소득세는 소득세의 10%로 함께 환급·납부되므로 실제 혜택은 지방세 포함 숫자에 가깝습니다. 머니샐러리 계산기는 소득세 기준으로 계산하고 지방세는 별도 표기합니다.",
  },
  {
    question: "프리랜서·중도퇴사자도 이 일정대로 하나요?",
    answer:
      "아니요. 회사를 통한 연말정산은 근로소득자 대상입니다. 프리랜서·N잡러는 5월 종합소득세 신고로 정산하고, 중도퇴사 후 재취업하지 않았다면 역시 5월 신고(또는 경정청구)로 환급받습니다. 아래 '놓쳤다면' 단계를 참고하세요.",
  },
];

const KIND_ICON = {
  calculator: Calculator,
  guide: BookOpen,
  checklist: ClipboardCheck,
} as const;

export default function YearEndTax2027HubPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "연말정산 2027 총정리" }),
          itemListLd({
            name: "연말정산 2027 단계별 도구",
            items: YEAR_END_STEPS.flatMap((s) =>
              s.entries.map((e) => ({ name: e.title, url: e.href }))
            ),
          }),
          faqLd(FAQS),
          speakableLd({
            url: PAGE_PATH,
            cssSelectors: [".speakable-summary", ".faq-answer"],
          }),
        ]}
      />
      <main className="min-h-screen bg-canvas pb-20 pt-28">
        <div className="page-width">
          <Breadcrumbs path={PAGE_PATH} leafName="연말정산 2027 총정리" className="mb-4" />

          {/* 히어로 */}
          <section className="mb-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4 leading-[1.18]">
              연말정산 2027 총정리
              <span className="block text-xl sm:text-2xl mt-2 text-electric">
                2026년 귀속 · 2027년 1~2월 신고 — 단계별 로드맵
              </span>
            </h1>
            <p className="speakable-summary text-sm sm:text-[15px] leading-7 text-muted-blue max-w-3xl">
              2026년 1~12월 소득에 대한 연말정산을 2027년 1~2월에 합니다. 공제 지출은{" "}
              <strong className="text-navy">12월 31일에 마감</strong>되므로, 지금 예상
              환급액을 계산하고 남은 기간의 절세 액션을 챙기는 것이 환급액을 가르는
              핵심입니다. 아래 로드맵을 시기 순서대로 따라가면 됩니다.
            </p>
            <YearEndTaxCluster />
          </section>

          {/* 단계별 로드맵 */}
          <section className="mb-12" aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="text-2xl sm:text-3xl font-black text-navy mb-6">
              단계별 로드맵
            </h2>
            <div className="space-y-6">
              {YEAR_END_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className="rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-electric mb-1">
                    STEP {idx + 1} · {step.period}
                  </p>
                  <h3 className="text-xl font-black text-navy mb-2">{step.title}</h3>
                  <p className="text-sm leading-7 text-muted-blue mb-4">{step.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {step.entries.map((e) => {
                      const Icon = KIND_ICON[e.kind];
                      return (
                        <Link
                          key={e.href + e.title}
                          href={e.href}
                          className="group rounded-xl border border-canvas-200 bg-canvas-50 p-4 hover:border-primary transition"
                        >
                          <p className="font-bold text-navy text-sm mb-1 inline-flex items-center gap-1.5 group-hover:text-electric transition-colors">
                            <Icon size={14} className="text-electric shrink-0" aria-hidden="true" />
                            {e.title}
                          </p>
                          <p className="text-xs leading-5 text-muted-blue">{e.desc}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 로드맵 직후 중간 광고 — 운영자 일괄 승인 2026-08-23 */}
          <div className="mb-12">
            <GuideMidAd />
          </div>

          {/* 시즌 캘린더 */}
          <section className="mb-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="calendar-heading">
            <h2 id="calendar-heading" className="text-2xl font-black text-navy mb-4 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" aria-hidden="true" />
              연말정산 시즌 캘린더
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
                    <th className="py-2.5 px-3 font-bold">시기</th>
                    <th className="py-2.5 px-3 font-bold">일정</th>
                    <th className="py-2.5 px-3 font-bold">체크 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {YEAR_END_CALENDAR.map((row) => (
                    <tr key={row.event} className="border-b border-canvas-200/60 align-top">
                      <td className="py-2 px-3 font-bold text-navy whitespace-nowrap">{row.period}</td>
                      <td className="py-2 px-3 font-bold text-electric">{row.event}</td>
                      <td className="py-2 px-3 text-muted-blue">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-faint-blue">
              ※ &ldquo;예년 기준&rdquo; 일정은 국세청 공식 발표 시 확정 반영합니다 (10월 말·1월 초 갱신).
            </p>
          </section>

          {/* 실험 #3: 시즌 캘린더 직후 — 일정 소비 완료 지점 (CALC_RESULT, 페이지 미사용 슬롯) */}
          <div className="mb-12">
            <CalcResultAd />
          </div>

          {/* 뉴스 */}
          <section className="mb-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="news-heading">
            <h2 id="news-heading" className="text-2xl font-black text-navy mb-4 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" aria-hidden="true" />
              올해 달라진 점·변경사항
            </h2>
            <ul className="space-y-2">
              {YEAR_END_NEWS.map((n) => (
                <li key={n.text} className="flex items-start gap-3 text-sm leading-7 text-muted-blue">
                  <span className="shrink-0 font-bold text-faint-blue tabular-nums">{n.date}</span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-faint-blue">
              프리랜서·N잡러의 5월 종합소득세는{" "}
              <Link href="/year-end-tax-2026" className="font-bold text-electric hover:underline">
                별도 가이드
              </Link>
              에서 다룹니다 (근로자 연말정산과 신고 시기·방법이 다릅니다).
            </p>
          </section>

          {/* 실험 #3: 변경사항 직후 본문 사이 fluid (IN_ARTICLE, 페이지 미사용 슬롯) */}
          <div className="mb-12">
            <InArticleAd />
          </div>

          {/* FAQ */}
          <section className="mb-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black text-navy mb-6">
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {FAQS.map((f) => (
                <details key={f.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                  <summary className="cursor-pointer text-sm font-bold text-navy flex items-start justify-between gap-3">
                    <span>{f.question}</span>
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 목록 하단 멀티플렉스 — 운영자 일괄 승인 2026-08-23 */}
          <div className="mb-12">
            <MultiplexAd />
          </div>

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="함께 보면 좋은 계산기"
          />

          {/* 실험 #3: 페이지 최하단 쿠팡 1개 (현재 쿠팡 0 → 1, 캡 2 이내) */}
          <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />
        </div>
      </main>
    </>
  );
}
