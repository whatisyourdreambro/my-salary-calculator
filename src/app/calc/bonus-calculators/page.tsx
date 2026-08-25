// src/app/calc/bonus-calculators/page.tsx
//
// 성과급 계산기 허브 — 회사별 성과급 계산기(BONUS_CALCS 전수)의 토픽 허브.
// 제네릭 "성과급 계산기" 검색 의도(목록·비교) 대응. 세금 계산 의도는
// /tools/finance/bonus 가 담당 — 상호 CTA 로 의도 분리를 명시한다.
// 광고: calc/layout.tsx 하단 스택(IN_ARTICLE·쿠팡·HOME_TOP) 상속 + 본문
// GuideMid(카드 그리드 직후)·Multiplex(FAQ 직후 목록 하단) — 상속 슬롯과
// 무충돌 확인, 운영자 일괄 승인 2026-08-23.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { bonusCalcCountKo, companyCountKo, companyCountPlus } from "@/config/site";
import Link from "@/components/AppLink";
import {
  autoBreadcrumbLd,
  faqLd,
  itemListLd,
  speakableLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";
import {
  BONUS_CALCS,
  BONUS_SECTORS,
  BONUS_CALENDAR_2026,
  BONUS_NEWS_2026,
} from "@/data/bonusCalcHub";
import { Sparkles, CalendarDays, Newspaper, ArrowRight, Calculator } from "lucide-react";
import { GuideMidAd, MultiplexAd } from "@/components/AdPlacement";

export const dynamic = "force-static";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/bonus-calculators";
const PAGE_TITLE = "성과급 계산기 2026 — 삼성전자·SK하이닉스 등 23개 기업";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "삼성전자 OPI·TAI, SK하이닉스 PS·PI, 현대차·기아 임단협 성과급까지 23개 기업 전용 성과급 계산기 모음. 최신 지급률 반영 세후 실수령 시뮬레이션과 2026 성과급 지급 캘린더·FAQ까지 한 페이지에서.";

const FAQ_ITEMS = [
  {
    question: "성과급에도 세금이 붙나요? 얼마나 떼나요?",
    answer:
      "네. 성과급은 별도 분리과세가 아니라 연간 근로소득에 합산되어 누진세율(6~45%)이 적용되고, 지방소득세(소득세의 10%)와 4대보험이 추가 부과됩니다. 연봉이 높을수록 성과급에 적용되는 한계세율도 높아져, 연봉 1억대라면 성과급의 약 30~40%가 공제되는 경우가 많습니다. 각 회사 계산기가 이 합산 누진 방식으로 세후 실수령액을 계산합니다.",
  },
  {
    question: "대기업 성과급은 보통 언제 지급되나요?",
    answer:
      "회사마다 다르지만 큰 흐름은 1~2월에 몰립니다. 삼성전자 OPI는 1월 말, SK하이닉스 PS는 2월 초, 셀트리온은 1월 선지급 + 3월 잔여가 관례입니다. 반기 성과급(삼성 TAI, SK하이닉스 PI)은 7월과 12월~1월에 지급되고, 현대차·기아 등 임단협 성과급은 타결 직후(주로 연말)에 지급됩니다. 아래 2026 시즌 캘린더에서 월별로 확인하세요.",
  },
  {
    question: "OPI·PS·PI·TAI는 뭐가 다른가요?",
    answer:
      "모두 성과급이지만 재원과 주기가 다릅니다. OPI(삼성 초과이익성과금)와 PS(SK하이닉스 초과이익분배금)는 회사 연간 이익의 일부를 나누는 연 1회 대형 성과급입니다. TAI(삼성 목표달성장려금)와 PI(SK하이닉스 생산성격려금)는 반기마다 월 기본급 대비 %로 지급되는 소형 성과급입니다. 그 외 현대차·기아처럼 임단협에서 '기본급 N% + 정액 + 주식'으로 타결되는 방식, 셀트리온처럼 연봉 대비 %로 지급하는 방식도 있습니다.",
  },
  {
    question: "성과급도 4대보험을 떼나요?",
    answer:
      "네, 성과급도 보수에 합산되어 4대보험이 부과됩니다. 다만 국민연금은 보수월액 상한(2026.7~2027.6 기준 연 7,908만원)이 있어 연봉이 이미 상한 이상이면 성과급에 추가 부과되지 않습니다. 건강보험(+장기요양)과 고용보험은 상한 없이 부과됩니다. 각 계산기에서 4대보험 반영 여부를 조정할 수 있습니다.",
  },
  {
    question: "성과급 세후 실수령액은 어떻게 계산하나요?",
    answer:
      "정확한 방법은 '연봉+성과급 합산 세금'에서 '연봉만 기준 세금'을 뺀 차액을 성과급의 세금으로 보는 한계(marginal) 방식입니다. 회사별 계산기는 모두 이 방식과 2026년 세율·요율을 사용합니다. 회사 무관으로 금액만 넣어 계산하려면 성과급 세금 계산기(/tools/finance/bonus)를 사용하세요.",
  },
  {
    question: "성과급 받고 절세하는 방법이 있나요?",
    answer:
      "성과급 자체의 원천징수는 피할 수 없지만, 연말정산에서 돌려받는 폭을 키울 수 있습니다. 대표적으로 (1) IRP·연금저축 연 900만원 한도 세액공제(13.2~16.5%), (2) 우리사주조합 출연 소득공제, (3) 의료비·기부금 공제 극대화가 있습니다. 성과급 입금 직후 IRP 한도를 채우는 것이 실효가 가장 큽니다.",
  },
  {
    question: "우리 회사가 목록에 없으면 어떻게 계산하나요?",
    answer:
      `전용 계산기가 없는 회사는 성과급 세금 계산기(/tools/finance/bonus)에 연봉과 성과급 금액만 입력하면 동일한 2026년 세법 기준으로 세후 실수령액이 나옵니다. 회사별 평균 연봉·복지가 궁금하면 ${companyCountKo}을 다루는 회사별 연봉 DB(/salary-db)를 참고하세요. 전용 계산기는 보도·공시로 지급률이 확인되는 회사부터 순차 추가하고 있습니다.`,
  },
];

export const metadata: Metadata = {
  // canonical/OG/twitter/robots/hreflang은 buildPageMetadata(src/lib/seo.ts) 정본으로 생성 —
  // 수기 canonical 드리프트 방지. 기존 출력값은 유지되고 헬퍼 자동 필드만 추가된다.
  ...buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: PAGE_PATH,
    ogImage: `${SITE_URL}/api/og?type=tool&name=${encodeURIComponent(`성과급 계산기 ${bonusCalcCountKo}`)}`,
  }),
  // 페이지 고유 키워드 — 헬퍼의 DEFAULT_KEYWORDS 병합으로 기존 keywords 출력이
  // 바뀌지 않도록 기존 값 그대로 override.
  keywords: [
    "성과급 계산기",
    "성과급 세금 계산기",
    "성과급 실수령액",
    "성과급 세후",
    "성과급 세금",
    "대기업 성과급",
    "성과급 지급일",
    "성과급 계산",
    "OPI 계산기",
    "PS 계산기",
    "TAI 계산기",
    "PI 계산기",
    "삼성전자 성과급 계산기",
    "SK하이닉스 성과급 계산기",
    "현대차 성과급 계산기",
    "성과급 지급 시기",
    "성과급 절세",
  ].join(", "),
  other: {
    "article:modified_time": "2026-08-23",
  },
};

export default function BonusCalculatorsHubPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: `성과급 계산기 ${bonusCalcCountKo}` }),
          itemListLd({
            name: `회사별 성과급 계산기 ${bonusCalcCountKo}`,
            items: BONUS_CALCS.map((c) => ({
              name: `${c.company} 성과급 계산기`,
              url: `/calc/${c.slug}`,
            })),
          }),
          faqLd(FAQ_ITEMS),
          speakableLd({
            url: PAGE_PATH,
            cssSelectors: ["#hub-summary", ".faq-answer"],
          }),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Breadcrumbs
            path={PAGE_PATH}
            leafName={`성과급 계산기 ${bonusCalcCountKo}`}
            className="mb-4"
          />

          {/* Hero */}
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              대기업 성과급 계산기 {bonusCalcCountKo} · 최신 지급률 반영
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              성과급 계산기 <span className="text-primary">2026</span> —
              삼성전자·SK하이닉스 등 23개 기업
            </h1>
            <p
              id="hub-summary"
              className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl"
            >
              삼성전자 OPI·TAI, SK하이닉스 PS·PI, 현대차·기아 임단협 성과급까지
              — 회사별 최신 지급률과 2026년 세법을 반영한 전용 계산기에서 본인
              연봉만 입력하면 <strong>세전·세후 실수령액</strong>이 즉시
              나옵니다. 성과급의 세금 구조와 지급 시즌도 이 페이지에서 한 번에
              확인하세요.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          {/* 인트로 — 성과급 종류·세금 구조 */}
          <section className="mb-10 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="text-2xl font-black mb-4">
              성과급, 회사마다 이름도 구조도 다릅니다
            </h2>
            <div className="space-y-3 text-sm sm:text-base leading-relaxed text-navy">
              <p>
                <strong>OPI(삼성 초과이익성과금)</strong>와{" "}
                <strong>PS(SK하이닉스 초과이익분배금)</strong>는 회사 연간
                이익의 일부를 나누는 연 1회 대형 성과급이고,{" "}
                <strong>TAI(목표달성장려금)</strong>와{" "}
                <strong>PI(생산성격려금)</strong>는 반기마다 월 기본급 대비 %로
                지급됩니다. 현대차·기아·현대모비스처럼 임단협에서 &lsquo;기본급
                N% + 정액 + 주식&rsquo;으로 타결하는 회사도, 셀트리온처럼 연봉
                대비 %로 주는 회사도 있습니다.
              </p>
              <p>
                공통점은 하나 — <strong>전부 근로소득 합산 누진세율(6~45%)
                대상</strong>이라는 점입니다. 같은 1,000만원 성과급이라도 본인
                연봉에 따라 실수령이 크게 달라지므로, 회사별 지급 구조와 본인
                연봉을 함께 넣어야 정확합니다. 아래에서 회사를 골라 계산해
                보세요.
              </p>
            </div>
          </section>

          {/* 회사별 계산기 카드 그리드 — 섹터별 */}
          <section className="mb-12" aria-labelledby="calcs-heading">
            <h2 id="calcs-heading" className="text-2xl sm:text-3xl font-black mb-6">
              회사별 성과급 계산기
            </h2>
            {BONUS_SECTORS.map((sector) => (
              <div key={sector} className="mb-8">
                <h3 className="text-lg font-black mb-3 text-faint-blue">
                  {sector}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BONUS_CALCS.filter((c) => c.sector === sector).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/calc/${c.slug}`}
                      className={`group block rounded-xl border p-4 transition hover:shadow-md ${
                        c.badge === "HOT"
                          ? "border-2 border-primary/40 bg-primary/5 hover:bg-primary/10"
                          : "border-canvas-deep bg-white hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex w-7 h-7 rounded-lg bg-primary/10 text-primary items-center justify-center text-xs font-black"
                          aria-hidden
                        >
                          {c.company.slice(0, 1)}
                        </span>
                        <span className="font-black">
                          {c.company} 성과급 계산기
                        </span>
                        {c.badge && (
                          <span className="text-[10px] font-black text-primary border border-primary/40 rounded px-1">
                            {c.badge}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 ml-auto text-faint group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-faint leading-relaxed">{c.hook}</p>
                      <p className="text-[10px] text-faint-blue mt-1 font-bold">
                        ⏰ {c.seasonLabel}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* 카드 그리드 직후 중간 광고 — GUIDE_MID 이 페이지·상속 layout 미사용 */}
          <div className="mb-12">
            <GuideMidAd />
          </div>

          {/* 시즌 캘린더 */}
          <section className="mb-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="calendar-heading">
            <h2 id="calendar-heading" className="text-2xl font-black mb-4 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" />
              2026 성과급 시즌 캘린더
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[480px]">
                <caption className="sr-only">
                  2026년 월별 주요 성과급 지급 일정
                </caption>
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-3 font-bold w-16">월</th>
                    <th className="py-2 font-bold">주요 지급·발표</th>
                  </tr>
                </thead>
                <tbody>
                  {BONUS_CALENDAR_2026.map((row) => (
                    <tr key={row.month} className="border-b border-canvas-deep/60">
                      <td className="py-2.5 pr-3 font-black text-primary">
                        {row.month}
                      </td>
                      <td className="py-2.5">
                        <span className="flex flex-wrap gap-x-3 gap-y-1">
                          {row.events.map((e) => (
                            <Link
                              key={e.label}
                              href={e.href}
                              className="underline decoration-canvas-deep underline-offset-2 hover:text-primary transition"
                            >
                              {e.label}
                            </Link>
                          ))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-faint">
              * 최근 연도 보도·타결 이력 기준 관례이며, 실제 일정은 회사
              발표에 따라 달라질 수 있습니다.
            </p>
          </section>

          {/* 최근 소식 */}
          <section className="mb-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8" aria-labelledby="news-heading">
            <h2 id="news-heading" className="text-2xl font-black mb-4 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              최근 성과급 소식
            </h2>
            <ul className="space-y-3">
              {BONUS_NEWS_2026.map((n) => (
                <li key={n.date + n.href} className="flex items-start gap-3 text-sm">
                  <span className="font-black tabular-nums text-primary whitespace-nowrap">
                    {n.date}
                  </span>
                  <Link href={n.href} className="leading-relaxed hover:text-primary transition">
                    {n.text} →
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-faint">
              * 복수 언론 보도 기준 사실 요약 — 각 계산기 페이지에 출처를
              명기했습니다.
            </p>
          </section>

          {/* 일반 도구 링크 */}
          <section className="mb-12" aria-labelledby="tools-heading">
            <h2 id="tools-heading" className="text-2xl font-black mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              금액만 넣고 바로 계산하려면
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/tools/finance/bonus"
                className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
              >
                <p className="text-xs font-bold text-primary mb-1">
                  🧾 회사 무관 · 직접 계산
                </p>
                <p className="font-black text-lg">성과급 세금 계산기 →</p>
                <p className="text-sm text-faint mt-1">
                  연봉+성과급 금액만 입력 — 2026 세법 세후 실수령
                </p>
              </Link>
              <Link
                href="/calc/incentive-tax"
                className="block rounded-xl border border-canvas-deep bg-white p-5 hover:bg-canvas/40 transition"
              >
                <p className="text-xs font-bold text-faint mb-1">💡 인센티브</p>
                <p className="font-black text-lg">인센티브 세금 계산기 →</p>
                <p className="text-sm text-faint mt-1">
                  영업 인센티브·수당 세후 계산
                </p>
              </Link>
              <Link
                href="/calc/year-end-bonus"
                className="block rounded-xl border border-canvas-deep bg-white p-5 hover:bg-canvas/40 transition"
              >
                <p className="text-xs font-bold text-faint mb-1">🎄 연말</p>
                <p className="font-black text-lg">연말 상여금 계산기 →</p>
                <p className="text-sm text-faint mt-1">
                  연말 보너스 세후 실수령
                </p>
              </Link>
              <Link
                href="/salary-db"
                className="block rounded-xl border border-canvas-deep bg-white p-5 hover:bg-canvas/40 transition"
              >
                <p className="text-xs font-bold text-faint mb-1">🏢 연봉 DB</p>
                <p className="font-black text-lg">회사별 연봉 데이터베이스 →</p>
                <p className="text-sm text-faint mt-1">
                  {companyCountPlus} 기업 평균 연봉·직급별 연봉표
                </p>
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black mb-6">
              성과급, 자주 묻는 질문
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
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7 faq-answer">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 목록 하단 멀티플렉스(관련 콘텐츠형) — layout 푸터 광고와는
              RelatedCalculators 그리드가 사이에 있어 연속 광고 아님 */}
          <div className="mb-12">
            <MultiplexAd />
          </div>

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />
        </div>
      </main>
    </>
  );
}
