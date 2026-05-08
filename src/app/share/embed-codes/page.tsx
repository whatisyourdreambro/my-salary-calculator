// src/app/share/embed-codes/page.tsx
// 사용자에게 임베드 코드 안내 — 자연 백링크 유도.

import type { Metadata } from "next";
import Link from "next/link";
import { Copy, Code, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "임베드 코드 — 내 블로그·사이트에 무료 계산기 추가하기",
 description:
 "연봉·4대보험·대출·연말정산 미니 계산기를 본인 블로그·사이트에 무료로 임베드. iframe 코드 복사 + 사용 OK.",
 path: "/share/embed-codes",
 keywords: ["연봉 계산기 임베드", "iframe 계산기", "블로그 위젯", "무료 위젯"],
});

const WIDGETS = [
 {
 slug: "salary-calculator",
 name: "연봉 실수령액 계산기",
 description: "연봉 입력 → 4대보험·소득세 차감 후 월 실수령액",
 height: 360,
 width: 400,
 useCase: "직장인 블로그·인사 카페·채용 사이트",
 },
 {
 slug: "insurance-calculator",
 name: "4대보험 계산기",
 description: "월급 입력 → 국민연금·건강보험·고용보험 본인 부담",
 height: 420,
 width: 400,
 useCase: "노무사 블로그·HR 카페",
 },
 {
 slug: "loan-calculator",
 name: "대출 한도 계산기 (DSR 40%)",
 description: "연봉·금리·기간 → 대출 가능 원금 자동 산출",
 height: 480,
 width: 400,
 useCase: "부동산 블로그·재테크 카페",
 },
 {
 slug: "year-end-tax",
 name: "연말정산 환급 미리보기",
 description: "총급여·카드·연금저축 → 예상 환급금",
 height: 520,
 width: 400,
 useCase: "직장인 블로그·세무사",
 },
];

const FAQ_ITEMS = [
 { question: "임베드 사용에 비용이 있나요?", answer: "아니요. 자유롭게 사용 가능. 단 기본 'Powered by moneysalary.com' 링크가 위젯 하단에 작게 표시됩니다 (제거 불가)." },
 { question: "내 블로그에 어떻게 추가?", answer: "각 위젯의 iframe 코드를 복사 → 본인 블로그 HTML 모드에서 붙여넣기. 네이버 블로그·티스토리·워드프레스 모두 지원." },
 { question: "위젯 디자인을 커스터마이즈?", answer: "기본 디자인은 고정. 색상·크기 등 커스터마이즈는 일반 옵션 미제공. 커스텀 요청은 contact@moneysalary.com." },
 { question: "데이터는 자동 갱신되나요?", answer: "네. 2026년 세법 기준 + 매년 자동 갱신. 별도 조치 불필요." },
];

export default function EmbedCodesPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[autoBreadcrumbLd("/share/embed-codes", { leafName: "임베드 코드" }), faqLd(FAQ_ITEMS)]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Code className="w-4 h-4" /> 무료 임베드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 내 사이트에 <span className="text-electric">무료 계산기</span> 추가
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 연봉·4대보험·대출·연말정산 미니 계산기를 본인 블로그·사이트에 1줄 코드로 추가.<br />
 자유 사용 + 자동 갱신 + 광고 없음.
 </p>
 </div>

 <section className="space-y-6 mb-12">
 {WIDGETS.map((w) => {
 const code = `<iframe src="https://www.moneysalary.com/embed/${w.slug}" width="${w.width}" height="${w.height}" frameborder="0" style="border:0;border-radius:16px"></iframe>`;
 return (
 <div key={w.slug} className="bg-white border border-canvas rounded-2xl p-6">
 <div className="flex items-start justify-between gap-4 mb-3">
 <div>
 <p className="text-lg font-black text-navy mb-1">{w.name}</p>
 <p className="text-sm text-muted-blue">{w.description}</p>
 <p className="text-xs text-electric mt-1 font-bold">📌 {w.useCase}</p>
 </div>
 <Link href={`/embed/${w.slug}`} target="_blank" className="text-xs text-primary font-black hover:underline whitespace-nowrap">
 미리보기 →
 </Link>
 </div>
 <div className="bg-canvas-dark rounded-xl p-4 mt-3">
 <p className="text-xs font-bold text-muted-blue mb-2">임베드 코드 (복사해서 본인 사이트에 붙여넣기)</p>
 <code className="block text-xs text-navy bg-white rounded p-3 break-all">{code}</code>
 </div>
 </div>
 );
 })}
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3">사용 예시</h2>
 <ul className="text-sm text-muted-blue space-y-2">
 <li>• 인사 블로그: 신입·경력별 실수령액 위젯 → 채용 페이지 신뢰도 ↑</li>
 <li>• 부동산 블로그: 대출 한도 위젯 → 매물 페이지에 추가</li>
 <li>• 재테크 카페: 연말정산 환급 위젯 → 시즌 글에 첨부</li>
 <li>• 세무사·노무사 사이트: 4대보험 위젯 → 상담 진입점</li>
 </ul>
 </section>

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
