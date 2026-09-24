// src/app/salary-db/listed/MetricRankingView.tsx
//
// 지표 랭킹 3종(/salary-db/listed/top-*)의 공용 뷰 — 라우트 아님.
// 서버 컴포넌트 전용 (rows는 dartRanking에서 페이지가 주입).
// 광고: layout 상속(PageFooterAds: InArticle+쿠팡+HomeTop) + 본문 50위 경계 GuideMid 1개
// + TOP 100 표 끝·FAQ 경계 CalcResult 1개 (전면 최적화 — 운영자 지시 2026-09-02.
//   아래 "GuideMid 유일 미사용" 문구는 A1 당시 기준 — 현재 미사용은 Sidebar·Multiplex(A4 게이트)만)
// (R2 A1 — 운영자 승인 2026-08-31. GuideMid는 이 라우트 유일 미사용 슬롯 — InArticle/HomeTop
//  page 삽입은 layout 슬롯을 죽이는 "이동 함정"이라 금지, Display2는 실험 #1 오염 금지).

import Link from "@/components/AppLink";
import { GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
import CitationCopyButton from "@/components/CitationCopyButton";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { breadcrumbLd, faqLd, itemListLd, datasetLd } from "@/lib/structuredData";
import {
  DART_RANKING_YEAR,
  DART_RANKING_DATE,
  LISTED_ALL_TOTAL,
  industryRankings,
  rankingItemListItems,
  type RankingRow,
} from "@/lib/salary-data/dartRanking";
import { ShieldCheck, TrendingUp } from "lucide-react";

export function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

interface MetricConfig {
  path: string;
  h1: string;
  heroLead: React.ReactNode;
  valueHeader: string;
  renderValue: (row: RankingRow) => React.ReactNode;
  /**
   * FAQ — 접힌 details 라 펼치기 전 높이는 질문 줄뿐이다. extra 는 답변 문단 아래(펼쳤을 때만)
   * 보이는 부가 블록 — 인상률 랭킹의 이상치 목록용(DATA-07, 2026-09-25). FAQPage JSON-LD 에는
   * question·answer 문자열만 나간다.
   */
  faqItems: { question: string; answer: string; extra?: React.ReactNode }[];
  methodologyExtra: string;
  datasetName: string;
  rows: RankingRow[];
  /** 인용 복사 버튼 — R2 B4 (운영자 승인 2026-08-31). 데이터 변수 기반 빌드타임 생성만. */
  citation?: { quote: string; quoteId: string };
  /**
   * 방법론의 모수 문장 — 랭킹마다 모수가 다르다 (2026-09-25 리뷰 정정). 생략 시 상장사 전수
   * 모수(직원 수·근속연수 랭킹 — 급여 집계 괴리와 무관). 인상률 랭킹은 괴리 10% 제외를 밝힌다.
   */
  poolNote?: string;
  /** 모수 회사 수 — Dataset description 용 (생략 시 전수 모수) */
  poolTotal?: number;
}

function RankTable({ cfg, rows }: { cfg: MetricConfig; rows: RankingRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
            <th className="py-2.5 px-3 font-bold">순위</th>
            <th className="py-2.5 px-3 font-bold">회사</th>
            <th className="py-2.5 px-3 font-bold">{cfg.valueHeader}</th>
            <th className="py-2.5 px-3 font-bold">평균연봉</th>
            <th className="py-2.5 px-3 font-bold">업종</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stockCode || row.nameKo} className="border-b border-canvas-200/60">
              <td className="py-2 px-3 font-bold text-faint-blue tabular-nums">{row.rank}</td>
              <td className="py-2 px-3 font-bold text-navy">
                {row.href ? (
                  <Link href={row.href} className="hover:text-electric hover:underline">
                    {row.nameKo}
                  </Link>
                ) : (
                  row.nameKo
                )}
              </td>
              <td className="py-2 px-3 tabular-nums font-black text-electric">
                {cfg.renderValue(row)}
              </td>
              <td className="py-2 px-3 tabular-nums text-muted-blue">
                {fmtManwon(row.avgSalaryManwon)}
              </td>
              <td className="py-2 px-3 text-muted-blue">{row.industryKo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MetricRankingView({ cfg }: { cfg: MetricConfig }) {
  const crumbs = [
    { name: "홈", path: "/" },
    { name: "회사 연봉 DB", path: "/salary-db" },
    { name: "상장사 공시 연봉", path: "/salary-db/listed" },
    { name: cfg.h1, path: cfg.path },
  ];
  const listItems = rankingItemListItems(cfg.rows.slice(0, 50));
  const poolTotal = cfg.poolTotal ?? LISTED_ALL_TOTAL;
  const poolNote = cfg.poolNote ?? `상장사 전체 모수 ${LISTED_ALL_TOTAL.toLocaleString("ko-KR")}곳.`;

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          // 자체 페이지 있는 행만 (RT-09 — 랭킹 페이지 자기참조 ListItem 금지). 0건이면 블록 생략
          ...(listItems.length ? [itemListLd({ name: cfg.datasetName, items: listItems })] : []),
          datasetLd({
            name: cfg.datasetName,
            // META-11 — Google Dataset description 50자 이상: 모수·상위 행 수·열 구성까지 명시
            description: `DART 사업보고서 ${DART_RANKING_YEAR} 사업연도 공시 기준 ${cfg.datasetName} — 상장사 ${poolTotal.toLocaleString("ko-KR")}곳 중 상위 ${cfg.rows.length}곳의 ${cfg.valueHeader}·평균연봉·업종 순위 데이터`,
            url: cfg.path,
            dateModified: DART_RANKING_DATE,
            keywords: ["상장사 연봉", "DART 공시", "연봉 순위"],
          }),
          faqLd(cfg.faqItems),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric mb-3">
            <ShieldCheck size={13} aria-hidden="true" />
            DART 사업보고서 공시 — 추정 0
          </p>
          <h1 className="text-2xl sm:text-4xl font-black text-navy leading-tight mb-3">{cfg.h1}</h1>
          <p className="speakable-summary text-sm sm:text-[15px] leading-7 text-muted-blue max-w-3xl">
            {cfg.heroLead}
          </p>
        </section>

        <section className="mb-8" aria-labelledby="rank-table-heading">
          <h2 id="rank-table-heading" className="text-lg sm:text-xl font-black text-navy mb-3 inline-flex items-center gap-2">
            <TrendingUp size={18} className="text-electric" aria-hidden="true" />
            TOP {cfg.rows.length}
          </h2>
          <RankTable cfg={cfg} rows={cfg.rows.slice(0, 50)} />

          {/* 50위 경계 본문 광고 — R2 A1 (운영자 승인 2026-08-31) */}
          <GuideMidAd />

          {cfg.rows.length > 50 && (
            <>
              <h3 className="text-base font-black text-navy mt-2 mb-3">51위 ~ {cfg.rows.length}위</h3>
              <RankTable cfg={cfg} rows={cfg.rows.slice(50)} />
            </>
          )}
        </section>

        {/* TOP 100 표 끝·FAQ 경계 — 전면 최적화 (운영자 지시 2026-09-02) */}
        <CalcResultAd />

        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-lg font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {cfg.faqItems.map((item) => (
              <details key={item.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-bold text-navy">{item.question}</summary>
                <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{item.answer}</p>
                {item.extra}
              </details>
            ))}
          </div>
        </section>

        {/* 업종별 순위 링크 */}
        <section className="mb-8" aria-labelledby="industry-heading">
          <h2 id="industry-heading" className="text-lg font-black text-navy mb-4">업종별 연봉 순위</h2>
          <div className="flex flex-wrap gap-2">
            {industryRankings.map((o) => (
              <Link
                key={o.industryId}
                href={`/salary-db/listed/industry/${o.industryId}`}
                className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-primary transition"
              >
                {o.industryKo} ({o.companyCount})
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-canvas-200 bg-canvas-50 p-5" aria-labelledby="method-heading">
          <h2 id="method-heading" className="text-sm font-black text-navy mb-2">데이터 출처·산정 기준</h2>
          <p className="text-xs leading-6 text-muted-blue">
            금융감독원 전자공시시스템(DART) {DART_RANKING_YEAR} 사업연도 사업보고서 「직원 등의
            현황」 기준(등기임원 제외). {poolNote}{" "}
            {cfg.methodologyExtra} 평균연봉은 <strong className="text-navy">신입 초봉이 아니며</strong>,
            성과급 지급 시점에 따라 연도별 변동이 있을 수 있습니다. 데이터 기준일: {DART_RANKING_DATE}.
          </p>
          {/* 인용 복사 — R2 B4 (운영자 승인 2026-08-31): 인용→백링크 상시 생산 */}
          {cfg.citation && (
            <CitationCopyButton
              quote={cfg.citation.quote}
              path={cfg.path}
              quoteId={cfg.citation.quoteId}
              sourceLabel="상장사 공시 연봉 DB"
              className="mt-4"
            />
          )}
        </section>
      </div>
    </main>
  );
}
