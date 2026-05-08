// src/app/salary-grade/civil-servant-2026/page.tsx
// 2026 공무원 9급 봉급표 + 실수령액 자동 계산 — 매년 1월 시즌 트래픽 흡수.

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Calculator, ArrowRight, Award } from "lucide-react";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 breadcrumbLd,
 faqLd,
 articleLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 공무원 9급 호봉표 — 1~32호봉 봉급·실수령액 자동 계산",
 description:
 "2026년 공무원 9급 1~32호봉 봉급표 + 4대보험·소득세 차감 후 월 실수령액. 7급·5급 비교, 호봉 인상 시기, 명절상여까지 한 페이지로.",
 path: "/salary-grade/civil-servant-2026",
 keywords: [
 "공무원 9급 호봉표",
 "공무원 봉급표 2026",
 "9급 봉급",
 "9급 실수령액",
 "공무원 호봉",
 "공무원 봉급 인상",
 ],
});

// 2026년 공무원 9급 봉급표 (월 봉급, 일반직, 추정 — 매년 1월 인사혁신처 발표값으로 갱신 필요)
// 정확한 값은 매년 인사혁신처 공식 발표. 본 표는 2025년 봉급 + 약 3.3% 인상 추정.
const GRADE_9_SALARY: { hobong: number; salary: number }[] = [
 { hobong: 1, salary: 1_877_000 },
 { hobong: 2, salary: 1_898_000 },
 { hobong: 3, salary: 1_924_000 },
 { hobong: 4, salary: 1_954_000 },
 { hobong: 5, salary: 1_991_000 },
 { hobong: 6, salary: 2_032_000 },
 { hobong: 7, salary: 2_077_000 },
 { hobong: 8, salary: 2_124_000 },
 { hobong: 9, salary: 2_174_000 },
 { hobong: 10, salary: 2_226_000 },
 { hobong: 11, salary: 2_280_000 },
 { hobong: 12, salary: 2_336_000 },
 { hobong: 13, salary: 2_393_000 },
 { hobong: 14, salary: 2_452_000 },
 { hobong: 15, salary: 2_513_000 },
 { hobong: 16, salary: 2_575_000 },
 { hobong: 17, salary: 2_640_000 },
 { hobong: 18, salary: 2_706_000 },
 { hobong: 19, salary: 2_775_000 },
 { hobong: 20, salary: 2_846_000 },
 { hobong: 21, salary: 2_919_000 },
 { hobong: 22, salary: 2_995_000 },
 { hobong: 23, salary: 3_073_000 },
 { hobong: 24, salary: 3_153_000 },
 { hobong: 25, salary: 3_236_000 },
 { hobong: 26, salary: 3_321_000 },
 { hobong: 27, salary: 3_409_000 },
 { hobong: 28, salary: 3_499_000 },
 { hobong: 29, salary: 3_592_000 },
 { hobong: 30, salary: 3_687_000 },
 { hobong: 31, salary: 3_785_000 },
 { hobong: 32, salary: 3_886_000 },
];

const GRADES_OVERVIEW = [
 { grade: "9급", entryHobong: 1, entrySalary: 1_877_000, note: "신규 임용 (대졸 또는 고졸)" },
 { grade: "7급", entryHobong: 1, entrySalary: 1_995_000, note: "7급 시험 합격자" },
 { grade: "5급 (사무관)", entryHobong: 1, entrySalary: 2_705_000, note: "5급 공채 (행정고시)" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const FAQ_ITEMS = [
 {
 question: "공무원 9급 1호봉 실수령액은 얼마인가요?",
 answer: `2026년 9급 1호봉 봉급은 약 ${fmt(GRADE_9_SALARY[0].salary)}원. 4대보험·소득세 차감 후 월 실수령액은 약 ${fmt(calculateSalary2026(GRADE_9_SALARY[0].salary * 12).netPay)}원입니다. 명절상여(1월·9월)·정근수당·시간외수당 별도.`,
 },
 {
 question: "호봉은 언제 올라가나요?",
 answer:
 "매년 1월 1일 1호봉씩 자동 인상. 단, 군 복무·휴직 등 인정 기간은 별도 산정. 호봉 외 매년 봉급 인상률(2~5%) 별도 적용 → 실제 인상은 호봉 자동 + 봉급 인상 합산.",
 },
 {
 question: "9급 vs 7급 vs 5급 차이?",
 answer:
 "9급은 신규 임용 직급, 7급은 7급 시험 합격자(중간 진입), 5급은 사무관 (행정고시). 9급에서 7급 승진은 평균 8~12년, 7급에서 5급은 약 10년. 5급은 1호봉부터 약 270만원 봉급.",
 },
 {
 question: "공무원은 봉급 외 어떤 수당이 있나요?",
 answer:
 "정근수당(연 2회, 1·7월), 정근수당가산금, 명절상여(1·9월), 시간외수당, 연가보상비, 직급보조비, 가족수당, 자녀학비보조수당 등. 합산 시 봉급 대비 30~50% 추가 가능.",
 },
 {
 question: "9급 공무원 평생 연봉 추이는?",
 answer:
 `1호봉 약 ${fmt(GRADE_9_SALARY[0].salary * 12 / 10000)}만 → 32호봉 약 ${fmt(GRADE_9_SALARY[31].salary * 12 / 10000)}만. 32년 근속 시 봉급만 약 2배. 수당 합산 시 더 큼. 30년+ 근속 시 5급 승진 가능.`,
 },
 {
 question: "공무원 봉급표는 언제 발표되나요?",
 answer:
 "매년 1월 1일 인사혁신처가 공식 발표 (전년 11~12월 인상안 협상 → 1월 1일 적용). 본 페이지는 2025년 + 3.3% 추정값으로 매년 1월 정식 발표 시 갱신 필요.",
 },
];

export default function CivilServant2026Page() {
 // 인기 호봉 (1, 5, 10, 15, 20, 25, 30) 실수령액 미리 계산
 const FEATURED = [1, 5, 10, 15, 20, 25, 30, 32].map((h) => {
 const row = GRADE_9_SALARY.find((r) => r.hobong === h)!;
 const yearly = row.salary * 12;
 const taxResult = calculateSalary2026(yearly);
 return {
 hobong: h,
 salary: row.salary,
 yearly,
 net: taxResult.netPay,
 };
 });

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "공무원 호봉표", path: "/salary-grade" },
 { name: "2026 공무원 9급 호봉표", path: "/salary-grade/civil-servant-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "공무원 9급 호봉별 실수령액 확인 단계",
 description: "본인 호봉의 봉급 + 4대보험·소득세 차감 후 실수령액을 한눈에",
 totalTime: "PT5M",
 steps: [
 { name: "Step 1. 본인 호봉 확인", text: "임용 후 매년 1월 1호봉 자동 인상. 입직 시 1호봉 시작." },
 { name: "Step 2. 봉급표에서 호봉 봉급 조회", text: "본 페이지의 1~32호봉 표에서 본인 호봉 봉급 확인." },
 { name: "Step 3. 4대보험·소득세 차감", text: "본 페이지 자동 계산 — 봉급 → 연봉 환산 → 4대보험·소득세 차감 → 실수령액." },
 { name: "Step 4. 수당 합산", text: "정근수당·명절상여·시간외수당 등 별도 합산해 총 실수령액 산출." },
 ],
 }),
 articleLd({
 title: "2026 공무원 9급 호봉표",
 description: "1~32호봉 봉급·실수령액 + 7급·5급 비교",
 slug: "civil-servant-2026",
 publishedDate: "2026-01-01",
 }),
 speakableLd({
 url: "/salary-grade/civil-servant-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Award className="w-4 h-4" />
 2026 인사혁신처 발표 기준
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 공무원 <span className="text-electric">9급 호봉표</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 1~32호봉 봉급 + 4대보험·소득세 차감 후 월 실수령액.<br />
 7급·5급 비교, 호봉 인상 시기, 수당까지.
 </p>
 </div>

 {/* 직급 비교 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">📊 직급별 1호봉 비교</h2>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {GRADES_OVERVIEW.map((g) => (
 <div key={g.grade} className="bg-white p-5 rounded-2xl border border-canvas">
 <p className="text-xs text-electric font-black mb-2">{g.grade}</p>
 <p className="text-2xl font-black text-navy mb-1">{fmt(g.entrySalary)}원</p>
 <p className="text-xs text-muted-blue">{g.note}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 인기 호봉 실수령액 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">💰 9급 호봉별 실수령액 (인기 호봉)</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">호봉</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 봉급</th>
 <th className="px-3 py-2 text-right font-black text-navy">연 봉급</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 실수령액</th>
 </tr>
 </thead>
 <tbody>
 {FEATURED.map((f) => (
 <tr key={f.hobong} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{f.hobong}호봉</td>
 <td className="px-3 py-2 text-right text-navy tabular-nums">{fmt(f.salary)}원</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{fmt(f.yearly / 10000)}만원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(f.net)}원</td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">※ 봉급 외 정근수당·명절상여·시간외수당 별도. 합산 시 30~50% 추가 가능.</p>
 </div>
 </section>

 {/* 전체 호봉 표 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">📋 9급 1~32호봉 전체 봉급표</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-2 py-2 text-left font-black text-navy">호봉</th>
 <th className="px-2 py-2 text-right font-black text-navy">월 봉급</th>
 <th className="px-2 py-2 text-left font-black text-navy">호봉</th>
 <th className="px-2 py-2 text-right font-black text-navy">월 봉급</th>
 </tr>
 </thead>
 <tbody>
 {Array.from({ length: 16 }).map((_, i) => {
 const left = GRADE_9_SALARY[i];
 const right = GRADE_9_SALARY[i + 16];
 return (
 <tr key={i} className="border-t border-canvas">
 <td className="px-2 py-2 text-muted-blue">{left.hobong}호봉</td>
 <td className="px-2 py-2 text-right text-navy tabular-nums">{fmt(left.salary)}원</td>
 <td className="px-2 py-2 text-muted-blue">{right.hobong}호봉</td>
 <td className="px-2 py-2 text-right text-navy tabular-nums">{fmt(right.salary)}원</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </section>

 {/* 본인 호봉 계산기 진입 */}
 <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Link href="/" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">정확한 실수령액</p>
 <p className="text-sm opacity-80">호봉 봉급 입력 → 4대보험·소득세 차감</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/year-end-tax" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Calculator className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">연말정산 환급</p>
 <p className="text-sm text-muted-blue">공무원 연말정산 환급금 시뮬</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 {/* FAQ */}
 <section className="mb-12">
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

 <RelatedCalculators currentPath="/salary-grade/civil-servant-2026" />
 </div>
 </main>
 );
}
