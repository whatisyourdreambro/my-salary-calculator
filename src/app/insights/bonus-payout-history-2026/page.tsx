// src/app/insights/bonus-payout-history-2026/page.tsx
//
// 데이터 리포트 3호 — 대기업 성과급 실지급률 총정리 (serp 전략 리포트 2호 과제,
// 2026-08-23 조기 발행 — 10월 말 데드라인 대비 색인 숙성 기간 확보).
// 데이터 단일 소스: src/data/bonusData.ts (성과급 계산기 23종에서 수기 전사,
// scripts/verify-bonus-data.mjs 로 원본 diff 검증 — 불일치 0 게이트 통과분).
// ★기준 혼합 랭킹 금지: 월 기본급 대비 % / 연봉 대비 % / 정액을 표 3개로 분리.
// 1월 성과급 발표 시즌에 24시간 내 갱신 — bonusData 에 행 추가 후
// reportsRegistry updatedDate 갱신(sitemap lastModified 자동 반영).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { BarChart3, ArrowRight, ShieldCheck, Calculator } from "lucide-react";
import { BONUS_PROFILES, type BonusPayout } from "@/data/bonusData";
import { getReportBySlug } from "@/data/reportsRegistry";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, datasetLd, articleLd, faqLd } from "@/lib/structuredData";
import PublishedMeta from "@/components/PublishedMeta";
import CitationCopyButton from "@/components/CitationCopyButton";
import { InArticleAd, GuideMidAd, HomeTopAd } from "@/components/AdPlacement";

export const dynamic = "force-static";

const SLUG = "bonus-payout-history-2026";
const PATH = `/insights/${SLUG}`;
const report = getReportBySlug(SLUG)!;

const companyCount = new Set(BONUS_PROFILES.map((p) => p.calcSlug)).size;
const payoutCount = BONUS_PROFILES.reduce((s, p) => s + p.payouts.length, 0);

interface FlatRow extends BonusPayout {
  nameKo: string;
  calcSlug: string;
  companyId?: string;
}

const allRows: FlatRow[] = BONUS_PROFILES.flatMap((p) =>
  p.payouts.map((pay) => ({
    ...pay,
    nameKo: p.nameKo,
    calcSlug: p.calcSlug,
    companyId: p.companyId,
  }))
);

const sortRows = (rows: FlatRow[], value: (r: FlatRow) => number) =>
  [...rows].sort((a, b) => b.year - a.year || value(b) - value(a) || a.nameKo.localeCompare(b.nameKo, "ko"));

const baseRows = sortRows(allRows.filter((r) => r.percentOfBase != null), (r) => r.percentOfBase!);
const salaryRows = sortRows(allRows.filter((r) => r.percentOfSalary != null), (r) => r.percentOfSalary!);
const fixedRows = sortRows(allRows.filter((r) => r.fixedAmountManwon != null), (r) => r.fixedAmountManwon!);

// 인용문 — 데이터에서 파생한 확정 사실만 (잠정합의·전망은 인용문에 쓰지 않는다)
const samsungTai2026 = baseRows.find(
  (r) => r.calcSlug === "samsung-bonus" && r.year === 2026 && r.scheme === "TAI" && r.division === "메모리"
);
const heroQuote = `머니샐러리가 국내 대기업 ${companyCount}개사의 성과급 실지급 내역 ${payoutCount}건(보도·공시 교차 확인)을 집계했다. 월 기본급 대비·연봉 대비·정액 세 가지 지급 기준을 분리해 집계한 국내 첫 성과급 실지급률 데이터베이스다.`;
const statQuote = samsungTai2026
  ? `집계에 따르면 2026년 상반기 삼성전자 TAI(목표달성장려금)는 메모리사업부 기준 월 기본급의 ${samsungTai2026.percentOfBase}%였다. 같은 제도 안에서도 사업부별 지급률은 최대 4배까지 갈렸다.`
  : heroQuote;

const faqs = [
  {
    question: "'월 기본급 대비'와 '연봉 대비' 지급률은 어떻게 다른가요?",
    answer:
      "예를 들어 '월 기본급의 600%'는 월 기본급 6개월치로, 연봉의 약 25~30% 수준입니다. 반면 '연봉의 50%'(삼성 OPI 상한 방식)는 같은 %숫자라도 규모가 훨씬 큽니다. 기준이 다른 %를 한 표에서 순위 매기면 왜곡이 생기므로 이 리포트는 세 기준을 분리해 집계합니다.",
  },
  {
    question: "이 지급률 데이터의 출처는 무엇인가요?",
    answer: `각 회사의 성과급 발표 당시 복수 언론 보도와 공시·노사 타결 자료를 교차 확인한 값입니다(각 행에 출처 병기). 노조 요구안·시뮬레이션 가정치·제도상 상한 같은 '실지급이 아닌 숫자'는 집계에서 제외했습니다. 회사별 상세 시뮬레이션은 성과급 계산기 ${companyCount}종에서 할 수 있습니다.`,
  },
  {
    question: "이 리포트를 기사나 블로그에 인용해도 되나요?",
    answer:
      "네. '머니샐러리' 출처 표기(온라인은 링크 포함 권장)만 해주시면 자유롭게 인용하실 수 있습니다. 본문의 '인용문 복사' 버튼을 누르면 출처가 포함된 문장이 복사됩니다.",
  },
  {
    question: "데이터는 얼마나 자주 갱신되나요?",
    answer:
      "성과급 발표가 몰리는 12~2월(연말 성과급·OPI·PS 시즌)과 7월(상반기 TAI 등)에 발표 후 신속히 갱신합니다. 각 행의 지급 연도와 출처를 함께 표기해 시점을 확인할 수 있게 했습니다.",
  },
];

function CompanyCell({ row }: { row: FlatRow }) {
  return (
    <td className="py-2 px-3 font-bold">
      <Link
        href={`/calc/${row.calcSlug}`}
        className="underline decoration-canvas-200 underline-offset-2 hover:text-electric transition"
      >
        {row.nameKo}
      </Link>
    </td>
  );
}

function PayoutTable({
  id,
  title,
  subtitle,
  rows,
  valueHeader,
  renderValue,
}: {
  id: string;
  title: string;
  subtitle: string;
  rows: FlatRow[];
  valueHeader: string;
  renderValue: (r: FlatRow) => string;
}) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="text-2xl sm:text-3xl font-black text-navy mb-2">
        {title}
      </h2>
      <p className="text-sm text-muted-blue mb-4 leading-relaxed">{subtitle}</p>
      <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
              <th className="py-2.5 px-3 font-bold">지급연도</th>
              <th className="py-2.5 px-3 font-bold">회사</th>
              <th className="py-2.5 px-3 font-bold">제도·사업부</th>
              <th className="py-2.5 px-3 font-bold">{valueHeader}</th>
              <th className="py-2.5 px-3 font-bold">비고·출처</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.calcSlug}-${r.year}-${r.scheme}-${r.division ?? ""}-${i}`} className="border-b border-canvas-200/60 align-top">
                <td className="py-2 px-3 tabular-nums text-faint-blue">{r.year}</td>
                <CompanyCell row={r} />
                <td className="py-2 px-3">
                  {r.scheme}
                  {r.division ? <span className="text-faint-blue"> · {r.division}</span> : null}
                </td>
                <td className="py-2 px-3 tabular-nums font-black text-electric">{renderValue(r)}</td>
                <td className="py-2 px-3 text-xs text-muted-blue max-w-[320px]">
                  {r.note ? <>{r.note} — </> : null}
                  {r.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const metadata: Metadata = buildPageMetadata({
  title: report.title,
  description: report.description,
  path: PATH,
  keywords: report.keywords,
  ogType: "article",
  publishedTime: report.publishedDate,
  modifiedTime: report.updatedDate,
});

export default function BonusPayoutHistoryReport() {
  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "데이터 리포트", path: "/insights" },
            { name: "2026 성과급 실지급률 총정리", path: PATH },
          ]),
          datasetLd({
            name: report.title,
            description: report.description,
            url: PATH,
            datePublished: report.publishedDate,
            dateModified: report.updatedDate,
            keywords: report.keywords,
          }),
          articleLd({
            title: report.title,
            description: report.description,
            slug: SLUG,
            publishedDate: report.publishedDate,
            modifiedDate: report.updatedDate,
            url: PATH,
          }),
          faqLd(faqs),
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/10 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <BarChart3 className="w-4 h-4" />
            <span>머니샐러리 데이터 리포트 — 성과급 실지급률 전수</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4 leading-[1.18]">
            2026 대기업 성과급 실지급률 총정리
            <span className="block text-xl sm:text-2xl mt-2 text-electric">
              {companyCount}개사 · 실지급 {payoutCount}건 — 기준별 분리 집계
            </span>
          </h1>
          <PublishedMeta
            publishedDate={report.publishedDate}
            updatedDate={report.updatedDate}
            className="mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">집계 회사</p>
              <p className="text-lg font-black text-navy">{companyCount}개사</p>
              <p className="text-sm font-bold text-electric">성과급 계산기 연동</p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">실지급 내역</p>
              <p className="text-lg font-black text-navy">{payoutCount}건</p>
              <p className="text-sm font-bold text-electric">보도·공시 교차 확인</p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">추정치</p>
              <p className="text-lg font-black text-navy">0건</p>
              <p className="text-sm font-bold text-electric">요구안·가정치 제외</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4">
        {/* 핵심 인용문 */}
        <CitationCopyButton quote={heroQuote} quoteId="bonus-hero" path={PATH} />

        <InArticleAd />

        {/* 기준 분리 안내 */}
        <section className="mt-8 rounded-2xl border border-canvas-200 bg-white p-6" aria-labelledby="basis-heading">
          <h2 id="basis-heading" className="text-xl font-black text-navy mb-3 inline-flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-electric" />
            왜 표를 세 개로 나눴나요?
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            회사마다 성과급 기준이 다릅니다. <strong className="text-navy">월 기본급 대비 %</strong>(현대차
            500%, SK하이닉스 PS 등), <strong className="text-navy">연봉 대비 %</strong>(삼성 OPI 최대
            50% 등), <strong className="text-navy">정액</strong>(네이버 RSU 등) — 기준이 다른 숫자를
            한 표에서 순위 매기면 왜곡이 생기므로, 이 리포트는 세 기준을 분리해 집계합니다.
            월 기본급의 600%는 대략 연봉의 25~30% 수준입니다.
          </p>
        </section>

        <PayoutTable
          id="base-heading"
          title="① 월 기본급 대비 지급률"
          subtitle="지급 연도 최신순 · 같은 해에는 지급률 내림차순. 회사명을 누르면 해당 성과급 계산기로 이동합니다."
          rows={baseRows}
          valueHeader="월 기본급 대비"
          renderValue={(r) => `${r.percentOfBase!.toLocaleString("ko-KR")}%`}
        />

        <div className="mt-8">
          <GuideMidAd />
        </div>

        <PayoutTable
          id="salary-heading"
          title="② 연봉 대비 지급률"
          subtitle="삼성 OPI(초과이익성과급)처럼 연봉(기준연봉)을 기준으로 지급하는 제도입니다. ①의 월 기본급 기준과 %를 직접 비교하면 안 됩니다."
          rows={salaryRows}
          valueHeader="연봉 대비"
          renderValue={(r) => `${r.percentOfSalary!.toLocaleString("ko-KR")}%`}
        />

        <PayoutTable
          id="fixed-heading"
          title="③ 정액 지급"
          subtitle="1인 평균 지급액 또는 일괄 정액으로 발표된 사례입니다."
          rows={fixedRows}
          valueHeader="지급액"
          renderValue={(r) => `${r.fixedAmountManwon!.toLocaleString("ko-KR")}만원`}
        />

        <div className="mt-6">
          <CitationCopyButton quote={statQuote} quoteId="bonus-stats" path={PATH} />
        </div>

        {/* 방법론 */}
        <section className="mt-10 rounded-2xl border border-canvas-200 bg-white p-6" aria-labelledby="method-heading">
          <h2 id="method-heading" className="text-xl font-black text-navy mb-3">
            집계 방법·한계
          </h2>
          <ul className="space-y-2 text-sm leading-7 text-muted-blue">
            <li>
              · 머니샐러리 성과급 계산기 {companyCount}종의 데이터 파일에서 전사한 실지급
              내역만 집계 — 각 행에 지급 연도·출처를 병기했습니다.
            </li>
            <li>
              · 노조 요구안, 협상 중 수치, 시뮬레이션 가정치, 제도상 상·하한은{" "}
              <strong className="text-navy">집계에서 제외</strong>했습니다. 잠정합의는 비고에
              명시했습니다(SK하이닉스 2026 등).
            </li>
            <li>
              · 사업부·직군에 따라 실제 수령액은 다릅니다. 개인별 예상액은 각 회사
              계산기에서 월 기본급을 넣어 확인하세요.
            </li>
            <li>· 전사 정확성은 원본 파일 대조 스크립트로 검증했습니다(불일치 0).</li>
          </ul>
        </section>

        {/* 크로스링크 */}
        <section className="mt-10" aria-labelledby="next-heading">
          <h2 id="next-heading" className="text-xl font-black text-navy mb-4">
            함께 보면 좋은 데이터
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/calc/bonus-calculators"
              className="flex items-center justify-between rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy inline-flex items-center gap-2">
                <Calculator className="w-4 h-4 text-electric" />
                회사별 성과급 계산기 {companyCount}종
              </span>
              <ArrowRight className="w-4 h-4 text-electric" />
            </Link>
            <Link
              href="/insights/listed-avg-salary-top100-2026"
              className="flex items-center justify-between rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy inline-flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-electric" />
                공시 평균연봉 TOP 100 리포트
              </span>
              <ArrowRight className="w-4 h-4 text-electric" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-xl font-black text-navy mb-4">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-bold text-navy">{f.question}</summary>
                <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <HomeTopAd />
        </div>
      </div>
    </main>
  );
}
