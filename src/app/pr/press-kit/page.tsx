// src/app/pr/press-kit/page.tsx
// 언론·블로거용 프레스 키트.

import type { Metadata } from "next";
import { Mail, Download, ArrowRight, Newspaper } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "moneysalary.com Press Kit — 언론·블로거 자료실",
 description:
 "moneysalary.com 사이트 소개·통계·로고·인용 가능 데이터 모음. 기자·블로거·연구자 인용 시 출처 표기 안내.",
 path: "/pr/press-kit",
 keywords: ["프레스킷", "moneysalary 소개", "보도자료", "사이트 인용"],
});

const SITE_STATS = [
 { label: "총 페이지 수", value: "5,500+", note: "정적 페이지 (계산기·가이드·통계)" },
 { label: "단순 계산기", value: "100+", note: "세금·연봉·대출·투자·부동산 등" },
 { label: "회사 DB", value: "85+", note: "한국·글로벌 주요 기업" },
 { label: "직업별 페이지", value: "100", note: "IT·금융·의료·공무원 등" },
 { label: "지역별 페이지", value: "27", note: "17 광역시도 + 10 주요 시" },
 { label: "심층 가이드", value: "60+", note: "세금·연봉·재테크·커리어" },
];

const FAQ_ITEMS = [
 { question: "moneysalary.com은 어떤 사이트인가요?", answer: "한국 직장인을 위한 종합 금융 도구·콘텐츠 사이트. 2026년 세법 기반 정확한 연봉 계산 + 100+ 단순 계산기 + 60+ 심층 가이드 + 회사·직업·지역 DB." },
 { question: "데이터 인용 시 어떻게?", answer: "자유 인용 가능. 출처 표기 \"moneysalary.com\" 또는 본 페이지 URL. 학술·언론·블로그·SNS 모두 가능." },
 { question: "운영 주체는?", answer: "1인 사이드 프로젝트로 시작. 한국 직장인 금융 정보 격차 해소 목표. 광고는 AdSense + 쿠팡파트너스만." },
 { question: "연락은 어디로?", answer: "contact@moneysalary.com. 데이터 정정·인용 협의·기능 제안·언론 인터뷰 모두 환영." },
];

export default function PressKitPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[autoBreadcrumbLd("/pr/press-kit", { leafName: "Press Kit" }), faqLd(FAQ_ITEMS)]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Newspaper className="w-4 h-4" /> Press Kit
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 <span className="text-electric">moneysalary.com</span> Press Kit
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 언론·블로거·연구자를 위한 사이트 소개·통계·인용 가능 데이터 모음.<br />
 자유로운 인용을 환영합니다.
 </p>
 </div>

 {/* 사이트 한 줄 소개 */}
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3">한 줄 소개</h2>
 <p className="text-sm text-muted-blue leading-relaxed">
 <strong className="text-navy">moneysalary.com</strong>은 한국 직장인을 위한 종합 금융 도구·콘텐츠 사이트입니다. 2026년 세법 기반 정확한 연봉 계산 + 100+ 단순 계산기 + 60+ 심층 가이드 + 회사·직업·지역 DB를 무료로 제공합니다.
 </p>
 </section>

 {/* 사이트 통계 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 사이트 통계</h2>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {SITE_STATS.map((s) => (
 <div key={s.label} className="bg-white p-5 rounded-2xl border border-canvas">
 <p className="text-xs text-muted-blue mb-1">{s.label}</p>
 <p className="text-2xl font-black text-electric">{s.value}</p>
 <p className="text-xs text-muted-blue mt-1">{s.note}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 인용 가능 데이터 */}
 <section className="mb-10 bg-white border border-canvas rounded-2xl p-6">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <Download className="w-5 h-5 text-electric" />
 인용 가능 데이터
 </h2>
 <p className="text-sm text-muted-blue mb-4">
 다음 통계 페이지의 데이터는 자유롭게 인용 가능합니다. 출처 표기 시 자유 사용:
 </p>
 <ul className="text-sm space-y-2">
 <li>• <a href="/stats/korean-salary-distribution-2026" className="text-primary font-bold hover:underline">한국 직장인 연봉 분포 백분위표</a></li>
 <li>• <a href="/stats/minimum-wage-history" className="text-primary font-bold hover:underline">한국 최저시급 history 1988~2026</a></li>
 <li>• <a href="/stats/4-insurance-rates-history" className="text-primary font-bold hover:underline">4대보험 요율 history 2010~2026</a></li>
 <li>• <a href="/stats/income-tax-bracket-history" className="text-primary font-bold hover:underline">소득세 누진세율 변천사</a></li>
 <li>• <a href="/stats/jeonse-vs-monthly-by-year" className="text-primary font-bold hover:underline">전월세 전환율 history</a></li>
 </ul>
 </section>

 {/* 임베드 위젯 */}
 <section className="mb-10 bg-electric/5 border border-electric/20 rounded-2xl p-6">
 <h2 className="text-lg font-black text-navy mb-3">언론·블로그용 무료 임베드 위젯</h2>
 <p className="text-sm text-muted-blue mb-4">
 본인 사이트·블로그에 무료로 추가 가능한 미니 계산기 4종:
 </p>
 <ul className="text-sm space-y-2 mb-4">
 <li>• 연봉 실수령액 계산기</li>
 <li>• 4대보험 계산기</li>
 <li>• 대출 한도 계산기 (DSR 40%)</li>
 <li>• 연말정산 환급 미리보기</li>
 </ul>
 <a href="/share/embed-codes" className="inline-flex items-center gap-2 text-primary font-black text-sm hover:underline">
 임베드 코드 보기 <ArrowRight className="w-4 h-4" />
 </a>
 </section>

 {/* 연락 */}
 <section className="bg-primary p-6 rounded-2xl text-center mb-10">
 <Mail className="w-6 h-6 text-navy mx-auto mb-2" />
 <p className="text-base font-black text-navy mb-1">연락처</p>
 <p className="text-sm text-navy/80">데이터 정정·인용 협의·언론 인터뷰</p>
 <p className="text-lg font-black text-navy mt-2">contact@moneysalary.com</p>
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
 </div>
 </main>
 );
}
