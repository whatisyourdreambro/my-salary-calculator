import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Database, Shield, ExternalLink, Mail } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, organizationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "머니샐러리 소개 - 데이터 출처와 운영 원칙",
 description:
 "머니샐러리는 2026년 최신 세법을 반영한 연봉 실수령액 계산기입니다. 국세청·건강보험공단 공식 데이터를 기반으로 직장인의 금융 의사결정을 돕습니다.",
 path: "/about",
 keywords: ["머니샐러리", "About", "사이트 소개", "데이터 출처"],
});

const DATA_SOURCES = [
 {
 name: "국세청 — 근로소득 간이세액표 2026",
 url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2272&cntntsId=7711",
 description: "근로소득세 원천징수 기준",
 },
 {
 name: "국민연금공단",
 url: "https://www.nps.or.kr/jsppage/info/easy/easy_04_01.jsp",
 description: "국민연금 보험료율 (4.5%)",
 },
 {
 name: "국민건강보험공단",
 url: "https://www.nhis.or.kr/nhis/together/wbhaea01400m01.do",
 description: "건강보험 요율 (3.545%) + 장기요양보험",
 },
 {
 name: "근로복지공단",
 url: "https://www.comwel.or.kr/comwel/info/info/insrcmprt.jsp",
 description: "고용보험 요율 (0.9%)",
 },
];

const PRINCIPLES = [
 {
 icon: Calculator,
 title: "최신 세법 반영",
 body:
 "2026년 변경되는 국민연금·건강보험 요율과 누진세율을 즉시 반영합니다. 정부 발표 30일 이내 업데이트를 원칙으로 합니다.",
 },
 {
 icon: Database,
 title: "공식 데이터만 사용",
 body:
 "모든 계산은 국세청·건강보험공단·근로복지공단의 공식 자료를 기반으로 합니다. 추정치는 명시적으로 표기합니다.",
 },
 {
 icon: Shield,
 title: "개인정보 수집 최소화",
 body:
 "계산 결과는 사용자 브라우저에만 저장(localStorage)됩니다. 서버에 개인 식별 정보를 저장하지 않습니다.",
 },
];

export default function AboutPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 organizationLd(),
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "사이트 소개", path: "/about" },
 ]),
 ]}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs mb-6">
 About 머니샐러리
 </p>
 <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-6">
 직장인의 금융 의사결정을<br />
 <span className="text-electric">데이터로 돕습니다</span>
 </h1>
 <p className="text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 머니샐러리는 2026년 최신 세법을 반영한 연봉 실수령액 계산기입니다.
 국세청과 4대 보험 기관의 공식 데이터를 기반으로,
 직장인이 자신의 소득과 세금을 정확히 이해할 수 있도록 돕습니다.
 </p>
 </div>

 {/* 운영 원칙 */}
 <section className="mb-16">
 <h2 className="text-2xl font-black text-navy mb-8">운영 원칙</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {PRINCIPLES.map(({ icon: Icon, title, body }) => (
 <div key={title} className="p-6 bg-white rounded-2xl border border-canvas-200">
 <div className="w-10 h-10 rounded-xl bg-electric-10 flex items-center justify-center mb-4">
 <Icon className="w-5 h-5 text-electric" />
 </div>
 <h3 className="font-black text-navy text-lg mb-2">{title}</h3>
 <p className="text-sm text-muted-blue leading-relaxed">{body}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 데이터 출처 */}
 <section className="mb-16">
 <h2 className="text-2xl font-black text-navy mb-2">데이터 출처</h2>
 <p className="text-sm text-faint-blue mb-8">
 모든 계산식과 세율은 아래 정부 기관의 공식 자료를 따릅니다.
 </p>
 <div className="space-y-3">
 {DATA_SOURCES.map((source) => (
 <a
 key={source.url}
 href={source.url}
 target="_blank"
 rel="noopener noreferrer"
 className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div>
 <p className="font-bold text-navy text-sm group-hover:text-electric transition-colors">
 {source.name}
 </p>
 <p className="text-xs text-faint-blue mt-1">{source.description}</p>
 </div>
 <ExternalLink className="w-4 h-4 text-faint-blue group-hover:text-electric transition-colors" />
 </a>
 ))}
 </div>
 </section>

 {/* 책임 한계 */}
 <section className="mb-16 p-8 bg-white border border-canvas-200 rounded-2xl">
 <h2 className="text-xl font-black text-navy mb-4">책임 한계</h2>
 <p className="text-sm text-muted-blue leading-relaxed">
 머니샐러리의 모든 계산 결과는 일반적인 참고 자료입니다.
 실제 납세액은 개인별 소득공제·세액공제 항목, 부양가족 구성,
 회사별 비과세 항목 등에 따라 다를 수 있습니다.
 정확한 세무 의사결정은 국세청 홈택스 또는 세무 전문가와 상담하시기를
 권장드립니다.
 </p>
 </section>

 {/* 연락처 */}
 <section className="text-center">
 <h2 className="text-2xl font-black text-navy mb-4">문의·제보</h2>
 <p className="text-sm text-muted-blue mb-6">
 데이터 오류 제보, 새 계산기 요청, 협업 문의를 환영합니다.
 </p>
 <Link
 href="/qna"
 className="inline-flex items-center gap-2 px-6 py-3 bg-electric text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
 >
 <Mail className="w-4 h-4" />
 자주 묻는 질문 보기
 </Link>
 </section>

 <div className="mt-16 pt-8 border-t border-canvas-200 text-center text-xs text-faint-blue">
 <p>© {new Date().getFullYear()} 머니샐러리 — 모든 콘텐츠는 정보 제공 목적입니다.</p>
 <div className="flex items-center justify-center gap-3 mt-3">
 <Link href="/privacy" className="hover:text-electric">개인정보 처리방침</Link>
 <span>·</span>
 <Link href="/terms" className="hover:text-electric">이용약관</Link>
 </div>
 </div>
 </div>
 </main>
 );
}
