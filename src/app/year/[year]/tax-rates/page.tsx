// src/app/year/[year]/tax-rates/page.tsx
//
// 연도별 세율표 페이지 — 2020~2026.
// 과거 세율 검색 트래픽 + Google 콘텐츠 신선도 시그널.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import { buildYearTaxRatesMetadata } from "@/lib/seo";
import { TAX_HISTORY, HISTORY_YEARS, getYearTaxData } from "@/lib/taxHistory";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
 articleLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = { params: { year: string } };

export function generateStaticParams() {
 return HISTORY_YEARS.map((y) => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const year = parseInt(params.year, 10);
 if (!getYearTaxData(year)) return {};
 return buildYearTaxRatesMetadata(year);
}

const fmt = (n: number) => n.toLocaleString("ko-KR");
const formatKrw = (n: number) =>
 n >= 100_000_000 ? `${(n / 100_000_000).toFixed(1)}억` : n >= 10_000 ? `${(n / 10_000).toLocaleString("ko-KR")}만` : fmt(n);

export default function YearTaxRatesPage({ params }: Props) {
 const year = parseInt(params.year, 10);
 const data = getYearTaxData(year);
 if (!data) notFound();

 const FAQ_ITEMS = [
 {
 question: `${year}년 소득세율은 어떻게 되었나요?`,
 answer: `${year}년 한국 소득세는 ${data.incomeTaxBrackets.length}단계 누진세율 (${(data.incomeTaxBrackets[0].rate * 100).toFixed(0)}%~${(data.incomeTaxBrackets[data.incomeTaxBrackets.length - 1].rate * 100).toFixed(0)}%)로 운영. 1구간 한계 ${formatKrw(data.incomeTaxBrackets[0].max!)}원, 최저시급은 ${fmt(data.minWage)}원이었습니다.`,
 },
 {
 question: `${year}년 4대보험 본인 부담률은?`,
 answer: `국민연금 ${(data.nationalPensionRate * 100).toFixed(1)}%, 건강보험 ${(data.healthInsuranceRate * 100).toFixed(3)}%, 장기요양 건강보험의 ${(data.longTermCareRatio * 100).toFixed(2)}%, 고용보험 ${(data.employmentInsuranceRate * 100).toFixed(1)}%. 산재보험은 회사 100% 부담.`,
 },
 {
 question: `${year}년의 주요 세법 변경점은?`,
 answer: data.majorChange,
 },
 {
 question: `${year}년 세율로 본인 연봉 실수령액 계산은?`,
 answer: `머니샐러리 메인 계산기는 2026년 기준입니다. ${year}년 기준 실수령액은 본 페이지의 누진세율표 + 4대보험 요율을 본인 연봉에 적용해 수동 계산하거나, 인기 연봉의 ${year}년 환산 페이지를 참고하세요.`,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/year/${year}/tax-rates`, {
 leafName: `${year} 세율표`,
 overrides: { year: "연도별 세율" },
 }),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: `${year}년 세율표 — 소득세·4대보험`,
 description: `${year}년 한국 소득세 누진세율 + 4대보험 요율 + 최저시급`,
 slug: `year-${year}-tax-rates`,
 publishedDate: `${year}-01-01`,
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← 홈으로</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Calendar className="w-4 h-4" />
 연도별 세율
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">{year}년</span> 세율표
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">소득세 + 4대보험 + 최저시급 + 주요 변경점</p>
 </div>

 {/* 주요 변경점 */}
 <section className="bg-white border border-electric/20 rounded-3xl p-6 mb-8">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <FileText className="w-5 h-5 text-electric" />
 {year}년 주요 변경점
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">{data.majorChange}</p>
 </section>

 {/* 소득세 누진세율 */}
 <section className="mb-8">
 <h2 className="text-xl font-black text-navy mb-4">소득세 누진세율</h2>
 <div className="overflow-x-auto bg-white rounded-2xl border border-canvas">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-4 py-3 text-left font-black text-navy">과세표준 구간</th>
 <th className="px-4 py-3 text-right font-black text-navy">세율</th>
 <th className="px-4 py-3 text-right font-black text-navy">누진공제</th>
 </tr>
 </thead>
 <tbody>
 {data.incomeTaxBrackets.map((b, i) => (
 <tr key={i} className="border-t border-canvas">
 <td className="px-4 py-3 text-muted-blue">
 {b.max === null
 ? `${formatKrw(b.min)}원 초과`
 : `${formatKrw(b.min)}원 ~ ${formatKrw(b.max)}원`}
 </td>
 <td className="px-4 py-3 text-right font-black text-navy tabular-nums">{(b.rate * 100).toFixed(0)}%</td>
 <td className="px-4 py-3 text-right text-muted-blue tabular-nums">
 {b.deduction === 0 ? "-" : `${formatKrw(b.deduction)}원`}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 {/* 4대보험 요율 */}
 <section className="mb-8">
 <h2 className="text-xl font-black text-navy mb-4">4대보험 본인 부담률</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { name: "국민연금", rate: `${(data.nationalPensionRate * 100).toFixed(1)}%` },
 { name: "건강보험", rate: `${(data.healthInsuranceRate * 100).toFixed(3)}%` },
 { name: "장기요양", rate: `건보의 ${(data.longTermCareRatio * 100).toFixed(2)}%` },
 { name: "고용보험", rate: `${(data.employmentInsuranceRate * 100).toFixed(1)}%` },
 ].map((c) => (
 <div key={c.name} className="bg-white rounded-2xl p-4 border border-canvas">
 <p className="text-xs text-muted-blue mb-1">{c.name}</p>
 <p className="text-base font-black text-navy">{c.rate}</p>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-blue mt-3">산재보험은 회사 100% 부담 (업종별 0.7~18.6%).</p>
 </section>

 {/* 최저시급 */}
 <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8">
 <h2 className="text-lg font-black text-navy mb-2">{year}년 최저시급</h2>
 <p className="text-3xl font-black text-primary">{fmt(data.minWage)}원</p>
 <p className="text-xs text-muted-blue mt-2">월 209시간 = 월 {fmt(data.minWage * 209)}원 (세전)</p>
 </section>

 {/* 다른 연도 비교 */}
 <section className="mb-8">
 <h2 className="text-xl font-black text-navy mb-4">다른 연도 비교</h2>
 <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
 {HISTORY_YEARS.map((y) => (
 <Link
 key={y}
 href={`/year/${y}/tax-rates`}
 className={`p-3 rounded-xl text-center text-sm font-black transition ${y === year ? "bg-primary text-navy" : "bg-white border border-canvas hover:border-electric text-navy"}`}
 >
 {y}
 </Link>
 ))}
 </div>
 </section>

 {/* FAQ */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details key={item.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{item.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath={`/year/${year}/tax-rates`} />
 </div>
 </main>
 );
}
