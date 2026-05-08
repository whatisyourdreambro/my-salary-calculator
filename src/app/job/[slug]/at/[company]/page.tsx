// src/app/job/[job]/at/[company]/page.tsx
//
// 직업 × 회사 cross 페이지 — "삼성에서 백엔드 개발자 연봉" 같은 long-tail.
// 인기 직업 5개 × 인기 회사 10개 = 50개 정적 빌드.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ArrowRight, Calculator, Building2 } from "lucide-react";
import { getJob, JOB_SALARIES } from "@/data/jobSalaries";
import { allCompanies } from "@/data/companies";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";

export const dynamic = "force-static";
export const dynamicParams = false;

const FEATURED_JOBS = [
 "backend-developer",
 "frontend-developer",
 "data-scientist",
 "product-manager",
 "marketing-manager",
];

const FEATURED_COMPANIES = [
 "samsung-electronics",
 "naver",
 "kakao",
 "coupang",
 "toss",
 "hyundai-motor",
 "lg-electronics",
 "kb-financial",
 "shinhan-financial",
 "amorepacific",
];

type Props = { params: { slug: string; company: string } };

export function generateStaticParams() {
 const params: { slug: string; company: string }[] = [];
 FEATURED_JOBS.forEach((job) => {
 FEATURED_COMPANIES.forEach((company) => {
 const hasJob = JOB_SALARIES.some((j) => j.slug === job);
 const hasCompany = allCompanies.some((c) => c.id === company);
 if (hasJob && hasCompany) {
 params.push({ slug: job, company });
 }
 });
 });
 return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const job = getJob(params.slug);
 const company = allCompanies.find((c) => c.id === params.company);
 if (!job || !company) return {};

 // 회사 평균과 직업 평균을 합쳐 가중 추정
 const estSalary = Math.round((job.avgSalary + company.salary.senior.base) / 2);
 return buildPageMetadata({
 title: `${company.name.ko} ${job.name} 연봉 — 평균 ${Math.round(estSalary / 10000).toLocaleString("ko-KR")}만원 (2026)`,
 description: `${company.name.ko} ${job.name} 신입~10년차 연봉 추정. 같은 직군 한국 평균 대비 위치, 회사 워라밸·복지·실수령액까지 한 페이지로.`,
 path: `/job/${params.slug}/at/${params.company}`,
 keywords: [
 `${company.name.ko} ${job.name}`,
 `${company.name.ko} ${job.name} 연봉`,
 `${company.name.ko} 신입`,
 `${job.name} ${company.name.ko}`,
 ],
 ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.moneysalary.com"}/api/og?type=tool&name=${encodeURIComponent(`${company.name.ko} ${job.name}`)}`,
 });
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function JobAtCompanyPage({ params }: Props) {
 const job = getJob(params.slug);
 const company = allCompanies.find((c) => c.id === params.company);
 if (!job || !company) notFound();

 // 가중 평균 — 회사 시니어 + 직업 평균
 const estEntry = Math.round((job.entrySalary + company.salary.entry.base) / 2);
 const estMid = Math.round((job.midSalary + company.salary.junior.base) / 2);
 const estSenior = Math.round((job.seniorSalary + company.salary.senior.base) / 2);

 const entryNet = calculateSalary2026(estEntry).netPay;
 const seniorNet = calculateSalary2026(estSenior).netPay;

 const FAQ_ITEMS = [
 {
 question: `${company.name.ko}에서 ${job.name}의 연봉은?`,
 answer: `${company.name.ko}의 ${job.name} 추정 연봉: 신입 약 ${fmt(estEntry / 10000)}만원, 5년차 ${fmt(estMid / 10000)}만원, 10년+ ${fmt(estSenior / 10000)}만원. 회사·직군 평균을 합산한 추정값으로, 실제는 본인 경력·성과에 따라 ±20% 변동 가능.`,
 },
 {
 question: `${job.name} 평균과 ${company.name.ko} 평균 비교`,
 answer: `한국 ${job.name} 평균 ${fmt(job.avgSalary / 10000)}만원 vs ${company.name.ko} 직군 평균 ${fmt(company.salary.senior.base / 10000)}만원. ${company.salary.senior.base > job.avgSalary ? `${company.name.ko}이 평균보다 높음 (+${fmt((company.salary.senior.base - job.avgSalary) / 10000)}만)` : `${company.name.ko}이 평균보다 낮음 (-${fmt((job.avgSalary - company.salary.senior.base) / 10000)}만)`}.`,
 },
 {
 question: `${company.name.ko}의 ${job.name} 직무 환경은?`,
 answer: `${company.description} 워라밸: 주 ${company.workLife.weeklyHours.real}시간(실제) + 연차 ${company.workLife.vacation.days}일. 문화 키워드: ${company.culture.keywords.join(", ")}.`,
 },
 {
 question: `${company.name.ko}의 ${job.name} 신입 실수령액은?`,
 answer: `세전 추정 ${fmt(estEntry / 10000)}만원 → 4대보험·소득세 차감 후 월 약 ${fmt(entryNet)}원, 연 ${fmt((entryNet * 12) / 10000)}만원. 비과세 식대·부양가족 추가 시 ±5%.`,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/job/${params.slug}/at/${params.company}`, {
 leafName: `${company.name.ko} ${job.name}`,
 overrides: { job: "직업별", at: "@" },
 }),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: `${company.name.ko} ${job.name} 연봉`,
 description: `${company.name.ko}의 ${job.name} 직군 연봉·실수령액·워라밸`,
 slug: `job-${params.slug}-at-${params.company}`,
 publishedDate: "2026-04-30",
 }),
 ]}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href={`/job/${params.slug}/salary`} className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← {job.name} 일반 연봉</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Briefcase className="w-4 h-4" />
 {company.industry} · {job.category}
 </p>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy mb-3">
 {company.name.ko}의 <span className="text-electric">{job.name}</span> 연봉
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">
 추정 평균 {fmt(estSenior / 10000)}만원 · 신입 {fmt(estEntry / 10000)}만원
 </p>
 </div>

 {/* 평균 카드 */}
 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">{company.name.ko} {job.name} 추정 연봉 (시니어)</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(estSenior / 10000)}<span className="text-2xl">만원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">월 실수령</p><p className="text-navy font-black">{fmt(seniorNet)}원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">신입 실수령</p><p className="text-navy font-black">{fmt(entryNet)}원</p></div>
 </div>
 </section>

 {/* 경력별 추정 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">경력별 추정 연봉</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">경력</th>
 <th className="px-3 py-2 text-right font-black text-navy">추정 연봉</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 실수령</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">신입</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(estEntry / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(entryNet)}원</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">5년차</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(estMid / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(calculateSalary2026(estMid).netPay)}원</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">10년+</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(estSenior / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(seniorNet)}원</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 회사 정보 */}
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-10">
 <div className="flex items-center gap-3 mb-3">
 <p className="text-3xl">{company.logo}</p>
 <div>
 <p className="text-xl font-black text-navy">{company.name.ko}</p>
 <p className="text-xs text-muted-blue">{company.industry}</p>
 </div>
 </div>
 <p className="text-sm text-muted-blue leading-relaxed mb-3">{company.description}</p>
 <div className="grid grid-cols-3 gap-3 text-center">
 <div><p className="text-xs text-muted-blue">실 근무</p><p className="text-base font-black text-navy">{company.workLife.weeklyHours.real}h/주</p></div>
 <div><p className="text-xs text-muted-blue">연차</p><p className="text-base font-black text-navy">{company.workLife.vacation.days}일</p></div>
 <div><p className="text-xs text-muted-blue">문화 점수</p><p className="text-base font-black text-navy">{company.culture.score}/10</p></div>
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

 {/* 다른 진입점 */}
 <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
 <Link href={`/job/${params.slug}/salary`} className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">{job.name} 평균</p>
 </Link>
 <Link href={`/salary-db/${company.id}`} className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">{company.name.ko} 상세</p>
 </Link>
 <Link href="/" className="bg-primary p-4 rounded-2xl text-center">
 <p className="text-sm font-black text-navy">본인 연봉 입력</p>
 </Link>
 </section>

 <div className="p-5 bg-canvas border border-canvas rounded-xl">
 <p className="text-xs text-muted-blue leading-relaxed">
 ※ 본 페이지의 연봉은 회사 평균 + 직군 평균의 가중 추정값입니다. 실제 연봉은 본인 경력·성과·협상력에 따라 ±20% 변동 가능. 정확한 회사별 직군 연봉은 잡플래닛·블라인드 참고.
 </p>
 </div>
 </div>
 </main>
 );
}
