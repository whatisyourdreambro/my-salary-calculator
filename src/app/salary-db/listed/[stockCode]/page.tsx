// src/app/salary-db/listed/[stockCode]/page.tsx
//
// DART 공시 전용 경량 회사 페이지 — "{회사명} 연봉" 롱테일 확장 (Phase 1, 2026-08-23).
// 코호트·게이팅은 src/lib/salary-data/dartLite.ts 단일 소스 (직원 500+ 상위 약 200곳,
// 기존 /salary-db/[id] 보유사 제외 — 카니발 방지). dynamicParams=false 로 코호트 밖
// URL 은 404 — 크롤 예산 자체를 쓰지 않는다 (compare 413 색인 거부 교훈).
// 광고·공유는 salary-db/layout.tsx 상속 — 이 페이지에 광고 코드 없음.
// 서버 컴포넌트 전용 — dartLite(dartDisclosed 1.3MB)는 클라 번들 오염 금지.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { isStaticSalaryAmount } from "@/lib/salaryStaticParams";
import {
  listedCohort,
  getListedByStockCode,
  getSalaryNeighbors,
  getSameIndustryExisting,
  DART_LITE_DATE,
} from "@/lib/salary-data/dartLite";
import { ShieldCheck, ExternalLink, TrendingUp, Building2, Users } from "lucide-react";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { stockCode: string }[] {
  return listedCohort.map((c) => ({ stockCode: c.stockCode }));
}

type Props = { params: { stockCode: string } };

/** 만원 → "1억 5,800만원" */
function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

/** 공시 평균연봉(만원) → /salary 격자 실존값 (원). 격자 밖이면 null — 내부 404 금지 */
function toSalaryGridAmount(manwon: number): number | null {
  const won = manwon * 10000;
  const step = won > 100_000_000 ? 5_000_000 : 500_000;
  const snapped = Math.round(won / step) * step;
  const clamped = Math.min(Math.max(snapped, 5_000_000), 200_000_000);
  return isStaticSalaryAmount(clamped) ? clamped : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getListedByStockCode(params.stockCode);
  if (!c) return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
  return buildPageMetadata({
    title: `${c.nameKo} 평균연봉 ${fmtManwon(c.avgSalaryManwon)} — ${c.fiscalYear} 사업보고서 공시`,
    description: `${c.nameKo}의 ${c.fiscalYear} 사업연도 공시 평균연봉은 ${fmtManwon(
      c.avgSalaryManwon
    )}(직원 ${c.employeeCount.toLocaleString("ko-KR")}명)입니다. 월 실수령액 환산, 상장사 ${c.listedTotal.toLocaleString(
      "ko-KR"
    )}곳 중 순위, ${c.industryKo} 업종 내 위치까지 한 번에 확인하세요.`,
    path: `/salary-db/listed/${c.stockCode}`,
    keywords: [`${c.nameKo} 연봉`, `${c.nameKo} 평균연봉`, `${c.nameKo} 초봉`, `${c.industryKo} 연봉`],
  });
}

export default function ListedCompanyPage({ params }: Props) {
  const c = getListedByStockCode(params.stockCode);
  if (!c) notFound();

  const annualWon = c.avgSalaryManwon * 10000;
  const tax = calculateSalary2026(annualWon, 200000, 1, 0);
  const monthlyNetManwon = Math.round(tax.netPay / 10000);
  const neighbors = getSalaryNeighbors(c);
  const existing = getSameIndustryExisting(c);
  const gridAmount = toSalaryGridAmount(c.avgSalaryManwon);
  const vsIndustry =
    c.industryWeightedAvgManwon != null
      ? Math.round(((c.avgSalaryManwon - c.industryWeightedAvgManwon) / c.industryWeightedAvgManwon) * 100)
      : null;

  const path = `/salary-db/listed/${c.stockCode}`;
  const crumbs = [
    { name: "홈", path: "/" },
    { name: "회사 연봉 DB", path: "/salary-db" },
    { name: "상장사 공시 연봉", path: "/salary-db/listed" },
    { name: c.nameKo, path },
  ];

  const faqItems = [
    {
      question: `${c.nameKo} 평균연봉은 얼마인가요?`,
      answer: `${c.nameKo}의 ${c.fiscalYear} 사업연도 사업보고서 공시 기준 평균연봉(1인 평균 급여액)은 ${fmtManwon(
        c.avgSalaryManwon
      )}입니다. 등기임원을 제외한 직원 ${c.employeeCount.toLocaleString("ko-KR")}명 기준이며, 신입 초봉이 아니라 전 직급·전 연차 평균입니다.`,
    },
    {
      question: `${c.nameKo} 평균연봉의 월 실수령액은 얼마인가요?`,
      answer: `평균연봉 ${fmtManwon(c.avgSalaryManwon)}을 2026년 세법(4대보험·소득세, 비과세 식대 20만원·본인 1인 공제)으로 환산하면 월 실수령액은 약 ${monthlyNetManwon.toLocaleString(
        "ko-KR"
      )}만원입니다.`,
    },
    {
      question: `${c.nameKo} 연봉은 업계에서 어느 수준인가요?`,
      answer:
        c.industryTotal >= 5
          ? `${c.fiscalYear} 공시 기준 상장사 ${c.listedTotal.toLocaleString("ko-KR")}곳 중 ${c.listedRank.toLocaleString(
              "ko-KR"
            )}위, ${c.industryKo} 업종 상장사 ${c.industryTotal.toLocaleString("ko-KR")}곳 중 ${
              c.industryRank
            }위입니다.${
              vsIndustry != null
                ? ` 업종 가중 평균(${fmtManwon(c.industryWeightedAvgManwon!)}) 대비 ${
                    vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry
                  }% 수준입니다.`
                : ""
            }`
          : `${c.fiscalYear} 공시 기준 상장사 ${c.listedTotal.toLocaleString("ko-KR")}곳 중 ${c.listedRank.toLocaleString(
              "ko-KR"
            )}위입니다.`,
    },
  ];

  const dartUrl = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${c.rceptNo}`;

  const deductionRows: { label: string; value: number }[] = [
    { label: "국민연금", value: tax.nationalPension },
    { label: "건강보험(+장기요양)", value: tax.healthInsurance + tax.longTermCare },
    { label: "고용보험", value: tax.employmentInsurance },
    { label: "소득세(+지방세)", value: tax.incomeTax + tax.localIncomeTax },
  ];

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <JsonLd data={[breadcrumbLd(crumbs), faqLd(faqItems)]} />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path={path} leafName={c.nameKo} overrides={{ listed: "상장사 공시 연봉" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 */}
        <section className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric mb-3">
            <ShieldCheck size={13} aria-hidden="true" />
            금융감독원 전자공시(DART) 사업보고서 — 추정이 아닌 공식 수치
          </p>
          <h1 className="text-2xl sm:text-4xl font-black text-navy leading-tight mb-3">
            {c.nameKo} 평균연봉 <span className="text-primary">{fmtManwon(c.avgSalaryManwon)}</span>
            <br className="hidden sm:block" /> — {c.fiscalYear} 사업보고서 공시
          </h1>
          <p className="speakable-summary text-sm sm:text-[15px] leading-7 text-muted-blue max-w-3xl">
            {c.nameKo}(종목코드 {c.stockCode})의 {c.fiscalYear} 사업연도 공시 평균연봉은{" "}
            {fmtManwon(c.avgSalaryManwon)}, 월 실수령액으로 환산하면 약{" "}
            {monthlyNetManwon.toLocaleString("ko-KR")}만원입니다. 급여총액을 직원 수(등기임원
            제외 {c.employeeCount.toLocaleString("ko-KR")}명)로 나눈 값으로, 신입 초봉이 아니라
            전 직급 평균입니다.
          </p>
        </section>

        {/* 스탯 카드 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" aria-label="핵심 지표">
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">공시 평균연봉</p>
            <p className="font-black text-navy text-lg leading-tight">{fmtManwon(c.avgSalaryManwon)}</p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1 inline-flex items-center gap-1">
              <Users size={12} aria-hidden="true" /> 직원 수
            </p>
            <p className="font-black text-navy text-lg leading-tight">
              {c.employeeCount.toLocaleString("ko-KR")}명
            </p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">평균 근속</p>
            <p className="font-black text-navy text-lg leading-tight">
              {c.avgTenureYears != null ? `${Math.round(c.avgTenureYears * 10) / 10}년` : "미공시"}
            </p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1 inline-flex items-center gap-1">
              <Building2 size={12} aria-hidden="true" /> 업종
            </p>
            <p className="font-black text-navy text-lg leading-tight">{c.industryKo}</p>
          </div>
        </section>

        {/* 월 실수령 환산 — 계산기 사이트 고유 차별화 */}
        <section className="mb-8 rounded-2xl border border-canvas-200 bg-white p-5 sm:p-6" aria-labelledby="net-heading">
          <h2 id="net-heading" className="text-lg sm:text-xl font-black text-navy mb-4">
            평균연봉 {fmtManwon(c.avgSalaryManwon)}, 월 실수령액으로 환산하면?
          </h2>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-3xl font-black text-primary tabular-nums">
              월 {monthlyNetManwon.toLocaleString("ko-KR")}만원
            </p>
            <p className="text-sm font-bold text-muted-blue">
              (공제 월 {Math.round(tax.totalDeductions / 10000).toLocaleString("ko-KR")}만원)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {deductionRows.map((r) => (
              <div key={r.label} className="rounded-xl bg-canvas-50 p-3">
                <p className="text-xs text-faint-blue mb-0.5">{r.label}</p>
                <p className="font-bold text-navy text-sm tabular-nums">
                  월 {Math.round(r.value / 10000).toLocaleString("ko-KR")}만원
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs leading-6 text-muted-blue">
            2026년 세법 기준(국민연금 4.75%·건강보험 3.595% 등), 비과세 식대 월 20만원·본인 1인
            공제 가정. 부양가족·비과세 항목에 따라 실제 수령액은 달라집니다.
          </p>
          {gridAmount != null && (
            <Link
              href={`/salary/${gridAmount}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
            >
              연봉 {fmtManwon(Math.round(gridAmount / 10000))} 상세 실수령 리포트 보기 →
            </Link>
          )}
        </section>

        {/* 순위 컨텍스트 */}
        <section className="mb-8 rounded-2xl border border-canvas-200 bg-white p-5 sm:p-6" aria-labelledby="rank-heading">
          <h2 id="rank-heading" className="text-lg sm:text-xl font-black text-navy mb-3 inline-flex items-center gap-2">
            <TrendingUp size={18} className="text-electric" aria-hidden="true" />
            상장사 전체·업종 내 위치
          </h2>
          <ul className="space-y-2 text-sm leading-7 text-muted-blue">
            <li>
              · {c.fiscalYear} 공시 상장사 <strong className="text-navy">{c.listedTotal.toLocaleString("ko-KR")}곳</strong>{" "}
              중 평균연봉 <strong className="text-primary">{c.listedRank.toLocaleString("ko-KR")}위</strong>
            </li>
            {c.industryTotal >= 5 && (
              <li>
                ·{" "}
                {c.industryId !== "etc" ? (
                  <Link
                    href={`/salary-db/listed/industry/${c.industryId}`}
                    className="font-bold text-electric hover:underline"
                  >
                    {c.industryKo} 업종
                  </Link>
                ) : (
                  <>{c.industryKo} 업종</>
                )}{" "}
                상장사 <strong className="text-navy">{c.industryTotal}곳</strong> 중{" "}
                <strong className="text-primary">{c.industryRank}위</strong>
                {vsIndustry != null && (
                  <> — 업종 가중 평균({fmtManwon(c.industryWeightedAvgManwon!)}) 대비{" "}
                    <strong className={vsIndustry >= 0 ? "text-primary" : "text-navy"}>
                      {vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry}%
                    </strong>
                  </>
                )}
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs text-muted-blue">
            전체 순위표는{" "}
            <Link href="/insights/listed-avg-salary-top100-2026" className="font-bold text-electric hover:underline">
              공시 평균연봉 TOP 100 리포트
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </section>

        {/* 3개년 연봉 추이 — fetch-hist 수집 연도가 있는 회사만 렌더 (추정 0) */}
        {c.history && c.history.length > 0 && (
          <section className="mb-8 rounded-2xl border border-canvas-200 bg-white p-5 sm:p-6" aria-labelledby="history-heading">
            <h2 id="history-heading" className="text-lg sm:text-xl font-black text-navy mb-4">
              공시 평균연봉 추이
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
                    <th className="py-2 px-3 font-bold">사업연도</th>
                    <th className="py-2 px-3 font-bold">평균연봉</th>
                    <th className="py-2 px-3 font-bold">직원 수</th>
                    <th className="py-2 px-3 font-bold">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { fiscalYear: c.fiscalYear, avgSalaryManwonRaw: c.avgSalaryManwon, employeeCount: c.employeeCount },
                    ...c.history,
                  ].map((row, i, arr) => {
                    const prev = arr[i + 1];
                    const delta =
                      prev != null
                        ? Math.round(((row.avgSalaryManwonRaw - prev.avgSalaryManwonRaw) / prev.avgSalaryManwonRaw) * 100)
                        : null;
                    return (
                      <tr key={row.fiscalYear} className="border-b border-canvas-200/60">
                        <td className="py-2 px-3 font-bold text-navy">
                          {row.fiscalYear}
                          {i === 0 && <span className="ml-1 text-[10px] font-normal text-faint-blue">최신</span>}
                        </td>
                        <td className="py-2 px-3 tabular-nums font-black text-electric">
                          {fmtManwon(row.avgSalaryManwonRaw)}
                        </td>
                        <td className="py-2 px-3 tabular-nums text-muted-blue">
                          {row.employeeCount.toLocaleString("ko-KR")}명
                        </td>
                        <td className="py-2 px-3 tabular-nums font-bold">
                          {delta == null ? (
                            <span className="text-faint-blue">—</span>
                          ) : (
                            <span className={delta >= 0 ? "text-primary" : "text-navy"}>
                              {delta >= 0 ? `+${delta}` : delta}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-blue">
              각 연도 사업보고서 공시 원값 기준. 성과급 지급 시점에 따라 연도별 변동이 클 수 있습니다.
            </p>
          </section>
        )}

        {/* 유사 연봉 상장사 — lite 상호 메쉬 */}
        {neighbors.length > 0 && (
          <section className="mb-8" aria-labelledby="neighbors-heading">
            <h2 id="neighbors-heading" className="text-lg font-black text-navy mb-4">
              평균연봉이 비슷한 상장사
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {neighbors.map((n) => (
                <Link
                  key={n.stockCode}
                  href={`/salary-db/listed/${n.stockCode}`}
                  className="rounded-xl border border-canvas-200 bg-white p-4 hover:border-primary transition"
                >
                  <p className="font-bold text-navy text-sm mb-1">{n.nameKo}</p>
                  <p className="text-xs text-muted-blue">
                    {fmtManwon(n.avgSalaryManwon)} · {n.industryKo}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 같은 업종 상세 프로필 보유 회사 — 기존 DB 환류 */}
        {existing.length > 0 && (
          <section className="mb-8" aria-labelledby="existing-heading">
            <h2 id="existing-heading" className="text-lg font-black text-navy mb-4">
              {c.industryKo} 업종 상세 연봉 프로필
            </h2>
            <div className="flex flex-wrap gap-2">
              {existing.map((e) => (
                <Link
                  key={e.id}
                  href={`/salary-db/${e.id}`}
                  className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-primary transition"
                >
                  {e.nameKo} 연봉 →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-lg font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-bold text-navy">{item.question}</summary>
                <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 방법론·출처 */}
        <section className="mb-4 rounded-2xl border border-canvas-200 bg-canvas-50 p-5" aria-labelledby="method-heading">
          <h2 id="method-heading" className="text-sm font-black text-navy mb-2">데이터 출처·산정 기준</h2>
          <p className="text-xs leading-6 text-muted-blue">
            금융감독원 전자공시시스템(DART) {c.fiscalYear} 사업연도 사업보고서의 「직원 등의
            현황」 기준 — 연간 급여총액 ÷ 직원 수(등기임원 제외). 기간제·단시간 근로자 포함
            범위는 회사 공시에 따르며, <strong className="text-navy">신입 초봉이 아닙니다</strong>.
            성과급 지급 시점에 따라 연도별 변동이 있을 수 있습니다. 데이터 기준일: {DART_LITE_DATE}.{" "}
            <a
              href={dartUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-electric hover:underline"
            >
              DART 원문 공시 보기
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
