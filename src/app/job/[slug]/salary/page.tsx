// src/app/job/[slug]/salary/page.tsx
// 100개 직업별 연봉 페이지.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { JOB_SALARIES, JOB_SLUGS, getJob, getJobsByCategory } from "@/data/jobSalaries";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildJobMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = { params: { slug: string } };

export function generateStaticParams() {
 return JOB_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const job = getJob(params.slug);
 if (!job) return {};
 return buildJobMetadata(job);
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function JobSalaryPage({ params }: Props) {
 const job = getJob(params.slug);
 if (!job) notFound();

 const entryNet = calculateSalary2026(job.entrySalary).netPay;
 const midNet = calculateSalary2026(job.midSalary).netPay;
 const seniorNet = calculateSalary2026(job.seniorSalary).netPay;
 const avgNet = calculateSalary2026(job.avgSalary).netPay;

 // 같은 카테고리 다른 직업 (관련 추천)
 const relatedJobs = getJobsByCategory(job.category)
 .filter((j) => j.slug !== job.slug)
 .slice(0, 5);

 const FAQ_ITEMS = [
 {
 question: `${job.name}의 평균 연봉은 얼마인가요?`,
 answer: `${job.name} 평균 연봉은 약 ${fmt(job.avgSalary / 10000)}만원입니다. 신입 ${fmt(job.entrySalary / 10000)}만원, 5년차 ${fmt(job.midSalary / 10000)}만원, 10년+ ${fmt(job.seniorSalary / 10000)}만원 수준. 회사·경력·성과에 따라 ±20% 변동 가능.`,
 },
 {
 question: `${job.name} 신입 실수령액은?`,
 answer: `세전 ${fmt(job.entrySalary / 10000)}만원 → 4대보험·소득세 차감 후 월 실수령액 약 ${fmt(entryNet)}원, 연 ${fmt(entryNet * 12 / 10000)}만원. 비과세 식대 20만원 + 본인 1인 공제 적용 기준.`,
 },
 {
 question: `${job.name} 대표 회사는?`,
 answer: `한국 ${job.name} 분야 대표 회사: ${job.topCompanies.join(", ")}. 회사별 연봉 격차 ±30% 가능. 정확한 회사별 연봉은 회사 페이지에서 확인.`,
 },
 {
 question: `${job.name} 직무는 무엇인가요?`,
 answer: job.description,
 },
 {
 question: `${job.name} 5년차 vs 10년차 연봉 차이?`,
 answer: `5년차 ${fmt(job.midSalary / 10000)}만 → 10년차 ${fmt(job.seniorSalary / 10000)}만. 약 ${Math.round(((job.seniorSalary - job.midSalary) / job.midSalary) * 100)}% 인상. 시니어·관리자 트랙으로 전환 시 더 큼.`,
 },
 {
 question: `${job.name} 연봉을 올리는 방법?`,
 answer:
 "이직(평균 +20~30%) > 승진(평균 +10~15%) > 근속 자동 인상(연 3~5%). 본인 시장 가치를 매년 점검하고, 핵심 기술·자격증·영어로 차별화하면 협상력 상승.",
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/job/${job.slug}/salary`, {
 leafName: `${job.name} 연봉`,
 overrides: { job: "직업별", salary: "연봉" },
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: `${job.name} 본인 연봉 평가하는 4단계`,
 description: "본인 연봉을 평균과 비교하고 다음 협상·이직 전략 수립",
 totalTime: "PT15M",
 steps: [
 { name: "Step 1. 본인 연봉을 평균과 비교", text: `${job.name} 평균 ${fmt(job.avgSalary / 10000)}만 대비 본인 위치 확인. ±20% 이내면 시장 평균.` },
 { name: "Step 2. 경력별 위치 확인", text: `신입 ${fmt(job.entrySalary / 10000)}만 → 5년 ${fmt(job.midSalary / 10000)}만 → 10년 ${fmt(job.seniorSalary / 10000)}만 그래프 비교.` },
 { name: "Step 3. 동급 회사 비교", text: `${job.topCompanies.slice(0, 3).join(", ")} 등 대표 회사별 연봉 비교 → 이직 시 협상 카드.` },
 { name: "Step 4. 협상 또는 이직 결정", text: "평균 미달이면 1차 협상, 협상 실패 시 6~12개월 내 이직 준비." },
 ],
 }),
 articleLd({
 title: `${job.name} 연봉 가이드`,
 description: `${job.name} 평균 연봉·경력별 분포·대표 회사`,
 slug: `job-${job.slug}`,
 publishedDate: "2026-04-30",
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← 홈으로</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Briefcase className="w-4 h-4" />
 {job.category}
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">{job.name}</span> 연봉
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">
 평균 {fmt(job.avgSalary / 10000)}만원 · 신입~10년차 분포 + 실수령액
 </p>
 </div>

 {/* 평균 연봉 큰 카드 */}
 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">평균 연봉</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(job.avgSalary / 10000)}<span className="text-2xl">만원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">월 실수령</p><p className="text-navy font-black">{fmt(avgNet)}원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">연 실수령</p><p className="text-navy font-black">{fmt(avgNet * 12 / 10000)}만원</p></div>
 </div>
 </section>

 {/* 경력별 분포 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5 flex items-center gap-2">
 <TrendingUp className="w-6 h-6 text-electric" />
 경력별 연봉 분포
 </h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">경력</th>
 <th className="px-3 py-2 text-right font-black text-navy">연봉 (세전)</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 실수령</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">신입 (1년차)</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(job.entrySalary / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(entryNet)}원</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">중급 (5년차)</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(job.midSalary / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(midNet)}원</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">시니어 (10년+)</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(job.seniorSalary / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(seniorNet)}원</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 대표 회사 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🏢 대표 회사</h2>
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 {job.topCompanies.map((c) => (
 <div key={c} className="bg-white p-4 rounded-2xl border border-canvas text-center">
 <p className="text-sm font-black text-navy">{c}</p>
 </div>
 ))}
 </div>
 <Link href="/salary-db" className="inline-flex items-center gap-2 text-primary font-black text-sm mt-4">
 회사별 정확한 연봉 보기 →
 </Link>
 </section>

 {/* 직무 설명 */}
 <section className="mb-10 bg-white p-6 rounded-2xl border border-canvas">
 <h2 className="text-lg font-black text-navy mb-3">직무 설명</h2>
 <p className="text-sm text-muted-blue leading-relaxed">{job.description}</p>
 </section>

 {/* 본인 연봉 시뮬 */}
 <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Link href="/" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">본인 연봉 입력</p>
 <p className="text-sm opacity-80">정확한 4대보험·소득세 차감 실수령액</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/year-end-tax" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Calculator className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">연말정산 환급</p>
 <p className="text-sm text-muted-blue">{job.name} 절세 가능 금액</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 {/* 같은 카테고리 다른 직업 */}
 {relatedJobs.length > 0 && (
 <section className="mb-10">
 <h2 className="text-xl font-black text-navy mb-4">📊 같은 분야 다른 직업</h2>
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 {relatedJobs.map((rj) => (
 <Link
 key={rj.slug}
 href={`/job/${rj.slug}/salary`}
 className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition group text-center"
 >
 <p className="text-sm font-black text-navy">{rj.name}</p>
 <p className="text-xs text-muted-blue mt-1">{fmt(rj.avgSalary / 10000)}만원</p>
 </Link>
 ))}
 </div>
 </section>
 )}

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

 <RelatedCalculators currentPath={`/job/${job.slug}/salary`} />
 </div>
 </main>
 );
}
