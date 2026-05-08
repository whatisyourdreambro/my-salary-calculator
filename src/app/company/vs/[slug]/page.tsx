// src/app/company/vs/[pair]/page.tsx
//
// 인기 회사 비교 쌍 페이지 — 삼성 vs LG, 네이버 vs 카카오 등.
// 50쌍 정적 빌드. URL 패턴: /company/vs/samsung-electronics-vs-naver

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitCompare, ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { allCompanies } from "@/data/companies";
import type { CompanyProfile } from "@/types/company";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";

export const dynamic = "force-static";
export const dynamicParams = false;

// 인기 비교 쌍 50개 (한국 검색 트래픽 큰 조합)
const POPULAR_PAIRS: [string, string][] = [
 // 동종 라이벌 — 가장 큰 검색량
 ["samsung-electronics", "lg-electronics"],
 ["samsung-electronics", "sk-hynix"],
 ["naver", "kakao"],
 ["coupang", "baemin"],
 ["kb-financial", "shinhan-financial"],
 ["kb-financial", "hana-financial"],
 ["shinhan-financial", "hana-financial"],
 ["hyundai-motor", "kia"],
 ["lg-chem", "samsung-sdi"],
 ["samsung-biologics", "celltrion"],
 // IT 빅테크
 ["naver", "coupang"],
 ["kakao", "coupang"],
 ["naver", "line"],
 ["kakao", "line"],
 ["toss", "kakaobank"],
 ["naver", "toss"],
 ["kakao", "toss"],
 // 게임
 ["nexon", "ncsoft"],
 ["nexon", "krafton"],
 ["ncsoft", "krafton"],
 ["nexon", "smilegate"],
 ["pearl-abyss", "kakao-games"],
 // 금융
 ["mirae-asset", "samsung-securities"],
 ["nh-investment", "kb-securities"],
 ["samsung-life", "hanwha-life"],
 ["samsung-life", "kyobo-life"],
 // 식품
 ["cj-cheiljedang", "lotte-confectionery"],
 ["nongshim", "ottogi"],
 ["maeil-dairies", "namyang-dairy"],
 // 통신
 ["kt", "skt"],
 ["lg-uplus", "kt"],
 ["lg-uplus", "skt"],
 // 자동차
 ["hyundai-motor", "hyundai-mobis"],
 ["kia", "hyundai-mobis"],
 // 화학·에너지
 ["lg-chem", "lotte-chemical"],
 ["sk-innovation", "gs-caltex"],
 ["sk-innovation", "lg-chem"],
 // 유통
 ["bgf-retail", "gs-retail"],
 ["lotte-shopping", "shinsegae"],
 // 항공
 ["korean-air", "asiana-airlines"],
 // 건설
 ["samsung-c-and-t", "hyundai-engineering"],
 ["gs-construction", "daewoo-construction"],
 // 패션·뷰티
 ["amorepacific", "lg-h-h"],
 ["lf-corp", "handsome"],
 // 핀테크·암호화폐
 ["dunamu", "bithumb"],
 // 스타트업
 ["yanolja", "zigbang"],
 ["kurly", "29cm"],
 ["daangn", "musinsa"],
 // 외국계 vs 국내
 ["samsung-electronics", "google-korea"],
 ["naver", "google-korea"],
];

// 실제 회사 데이터에 있는 쌍만 빌드 (양쪽 모두 존재하는 쌍)
const VALID_PAIRS = POPULAR_PAIRS.filter(([a, b]) => {
 const hasA = allCompanies.some((c) => c.id === a);
 const hasB = allCompanies.some((c) => c.id === b);
 return hasA && hasB;
});

const PAIR_SLUGS = VALID_PAIRS.map(([a, b]) => `${a}-vs-${b}`);

type Props = { params: { slug: string } };

export function generateStaticParams() {
 return PAIR_SLUGS.map((pair) => ({ slug: pair }));
}

function parsePair(pair: string): [CompanyProfile, CompanyProfile] | null {
 const idx = pair.indexOf("-vs-");
 if (idx === -1) return null;
 const idA = pair.slice(0, idx);
 const idB = pair.slice(idx + 4);
 const a = allCompanies.find((c) => c.id === idA);
 const b = allCompanies.find((c) => c.id === idB);
 if (!a || !b) return null;
 return [a, b];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const parsed = parsePair(params.slug);
 if (!parsed) return {};
 const [a, b] = parsed;
 return buildPageMetadata({
 title: `${a.name.ko} vs ${b.name.ko} 연봉·복지 비교 (2026)`,
 description: `${a.name.ko}와 ${b.name.ko}의 신입~임원 연봉, 워라밸, 복지, 기업 문화 한 페이지 비교. 같은 산업 라이벌 데이터.`,
 path: `/company/vs/${params.slug}`,
 keywords: [
 `${a.name.ko} ${b.name.ko}`,
 `${a.name.ko} vs ${b.name.ko}`,
 `${a.name.ko} 연봉`,
 `${b.name.ko} 연봉`,
 `${a.name.ko} ${b.name.ko} 비교`,
 ],
 ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.moneysalary.com"}/api/og?type=tool&name=${encodeURIComponent(`${a.name.ko} vs ${b.name.ko}`)}`,
 });
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function CompanyComparePage({ params }: Props) {
 const parsed = parsePair(params.slug);
 if (!parsed) notFound();
 const [a, b] = parsed;

 const aEntryNet = calculateSalary2026(a.salary.entry.base).netPay;
 const bEntryNet = calculateSalary2026(b.salary.entry.base).netPay;
 const aSeniorNet = calculateSalary2026(a.salary.senior.base).netPay;
 const bSeniorNet = calculateSalary2026(b.salary.senior.base).netPay;

 const FAQ_ITEMS = [
 {
 question: `${a.name.ko}와 ${b.name.ko} 신입 연봉은?`,
 answer: `${a.name.ko} 신입 약 ${fmt(a.salary.entry.base / 10000)}만원, ${b.name.ko} 신입 약 ${fmt(b.salary.entry.base / 10000)}만원. 차이 ${fmt(Math.abs(a.salary.entry.base - b.salary.entry.base) / 10000)}만원.`,
 },
 {
 question: `어느 회사의 워라밸이 좋나요?`,
 answer: `${a.name.ko}: 주 ${a.workLife.weeklyHours.real}시간(실제) + 연차 ${a.workLife.vacation.days}일 (사용률 ${a.workLife.vacation.usageRate}%). ${b.name.ko}: 주 ${b.workLife.weeklyHours.real}시간 + 연차 ${b.workLife.vacation.days}일 (사용률 ${b.workLife.vacation.usageRate}%).`,
 },
 {
 question: `기업 문화 차이는?`,
 answer: `${a.name.ko}: ${a.culture.keywords.join(", ")}. 장점: ${a.culture.pros.slice(0, 2).join(", ")}. ${b.name.ko}: ${b.culture.keywords.join(", ")}. 장점: ${b.culture.pros.slice(0, 2).join(", ")}.`,
 },
 {
 question: `이직 시 어디가 더 유리한가요?`,
 answer: `연봉만 비교 시 ${a.salary.senior.base > b.salary.senior.base ? a.name.ko : b.name.ko}이 시니어급에서 ${fmt(Math.abs(a.salary.senior.base - b.salary.senior.base) / 10000)}만원 더 높음. 단, 워라밸·복지·산업 전망까지 종합 판단 필요.`,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/company/vs/${params.slug}`, {
 leafName: `${a.name.ko} vs ${b.name.ko}`,
 overrides: { company: "회사", compare: "비교" },
 }),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: `${a.name.ko} vs ${b.name.ko} 비교`,
 description: "신입~임원 연봉·워라밸·복지·기업 문화 종합 비교",
 slug: `compare-${params.slug}`,
 publishedDate: "2026-04-30",
 }),
 ]}
 />

 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/salary-db" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← 회사 DB</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <GitCompare className="w-4 h-4" />
 회사 비교
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 {a.name.ko} <span className="text-electric">vs</span> {b.name.ko}
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">신입~임원 연봉 + 워라밸 + 복지 + 문화 종합 비교</p>
 </div>

 {/* 회사 카드 양쪽 */}
 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
 {[a, b].map((c) => (
 <div key={c.id} className="bg-white border border-canvas rounded-3xl p-6">
 <div className="flex items-center gap-3 mb-3">
 <p className="text-3xl">{c.logo}</p>
 <div>
 <p className="text-xl font-black text-navy">{c.name.ko}</p>
 <p className="text-xs text-muted-blue">{c.industry} · {c.tier}</p>
 </div>
 </div>
 <p className="text-sm text-muted-blue leading-relaxed mb-3">{c.description}</p>
 <div className="text-xs text-muted-blue space-y-1">
 <p>👍 {c.culture.pros[0]}</p>
 <p>⚠️ {c.culture.cons[0]}</p>
 </div>
 </div>
 ))}
 </section>

 {/* 연봉 비교 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5 flex items-center gap-2">
 <TrendingUp className="w-6 h-6 text-electric" />
 연봉 비교 (세전)
 </h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">레벨</th>
 <th className="px-3 py-2 text-right font-black text-navy">{a.name.ko}</th>
 <th className="px-3 py-2 text-right font-black text-navy">{b.name.ko}</th>
 <th className="px-3 py-2 text-right font-black text-navy">차이</th>
 </tr>
 </thead>
 <tbody>
 {(["entry", "junior", "senior", "lead", "executive"] as const).map((lvl) => {
 const aBase = a.salary[lvl].base;
 const bBase = b.salary[lvl].base;
 const diff = aBase - bBase;
 const labels = { entry: "신입", junior: "주니어 (3년차)", senior: "시니어 (5~7년차)", lead: "리드 (10년+)", executive: "임원" };
 return (
 <tr key={lvl} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">{labels[lvl]}</td>
 <td className={`px-3 py-2 text-right font-black tabular-nums ${diff > 0 ? "text-success" : "text-navy"}`}>{fmt(aBase / 10000)}만</td>
 <td className={`px-3 py-2 text-right font-black tabular-nums ${diff < 0 ? "text-success" : "text-navy"}`}>{fmt(bBase / 10000)}만</td>
 <td className={`px-3 py-2 text-right font-black tabular-nums ${diff > 0 ? "text-success" : diff < 0 ? "text-electric" : "text-muted-blue"}`}>{diff > 0 ? "+" : ""}{fmt(diff / 10000)}만</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </section>

 {/* 실수령액 비교 */}
 <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="bg-primary p-6 rounded-2xl text-center">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-1">{a.name.ko} 신입 월 실수령</p>
 <p className="text-3xl font-black text-navy">{fmt(aEntryNet)}원</p>
 <p className="text-xs text-navy/60 mt-2">시니어 약 {fmt(aSeniorNet)}원</p>
 </div>
 <div className="bg-electric/10 p-6 rounded-2xl text-center">
 <p className="text-electric/70 text-xs font-black uppercase tracking-widest mb-1">{b.name.ko} 신입 월 실수령</p>
 <p className="text-3xl font-black text-navy">{fmt(bEntryNet)}원</p>
 <p className="text-xs text-muted-blue mt-2">시니어 약 {fmt(bSeniorNet)}원</p>
 </div>
 </section>

 {/* 워라밸 비교 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">⏱️ 워라밸 비교</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">항목</th>
 <th className="px-3 py-2 text-right font-black text-navy">{a.name.ko}</th>
 <th className="px-3 py-2 text-right font-black text-navy">{b.name.ko}</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">실 근무시간/주</td>
 <td className="px-3 py-2 text-right font-black text-navy">{a.workLife.weeklyHours.real}시간</td>
 <td className="px-3 py-2 text-right font-black text-navy">{b.workLife.weeklyHours.real}시간</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">연차 일수</td>
 <td className="px-3 py-2 text-right font-black text-navy">{a.workLife.vacation.days}일</td>
 <td className="px-3 py-2 text-right font-black text-navy">{b.workLife.vacation.days}일</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">연차 사용률</td>
 <td className="px-3 py-2 text-right font-black text-navy">{a.workLife.vacation.usageRate}%</td>
 <td className="px-3 py-2 text-right font-black text-navy">{b.workLife.vacation.usageRate}%</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">근무 형태</td>
 <td className="px-3 py-2 text-right font-black text-navy capitalize">{a.workLife.remoteWork.policy}</td>
 <td className="px-3 py-2 text-right font-black text-navy capitalize">{b.workLife.remoteWork.policy}</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">기업 문화 점수</td>
 <td className="px-3 py-2 text-right font-black text-navy">{a.culture.score}/10</td>
 <td className="px-3 py-2 text-right font-black text-navy">{b.culture.score}/10</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 장단점 비교 */}
 <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[a, b].map((c) => (
 <div key={c.id} className="bg-white border border-canvas rounded-2xl p-5">
 <p className="text-base font-black text-navy mb-3">{c.name.ko}</p>
 <div className="mb-3">
 <p className="text-xs font-black text-success mb-1">장점</p>
 <ul className="text-xs text-muted-blue space-y-1">
 {c.culture.pros.map((p, i) => <li key={i}>• {p}</li>)}
 </ul>
 </div>
 <div>
 <p className="text-xs font-black text-electric mb-1">단점</p>
 <ul className="text-xs text-muted-blue space-y-1">
 {c.culture.cons.map((p, i) => <li key={i}>• {p}</li>)}
 </ul>
 </div>
 </div>
 ))}
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

 {/* 다른 비교 */}
 <section className="mb-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
 <Link href={`/salary-db/${a.id}`} className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">{a.name.ko} 상세</p>
 </Link>
 <Link href={`/salary-db/${b.id}`} className="bg-white p-4 rounded-2xl border border-canvas hover:border-electric transition text-center">
 <p className="text-sm font-black text-navy">{b.name.ko} 상세</p>
 </Link>
 <Link href="/salary-db" className="bg-primary p-4 rounded-2xl text-center">
 <p className="text-sm font-black text-navy">회사 DB</p>
 </Link>
 </section>

 <div className="p-5 bg-canvas border border-canvas rounded-xl">
 <p className="text-xs text-muted-blue leading-relaxed">
 ※ 본 페이지의 연봉·복지 데이터는 잡플래닛·블라인드·자체 추정값이며, 실제 회사 발표값과 차이 있을 수 있습니다. 본인 협상 시 참고용으로만 사용하세요.
 </p>
 </div>
 </div>
 </main>
 );
}
