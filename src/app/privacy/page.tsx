import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "개인정보 처리방침 — 머니샐러리",
 description:
 "머니샐러리(moneysalary.com)의 개인정보 처리 원칙. 수집 항목, 처리 목적, 보유 기간, 광고 파트너 정보, 사용자 권리에 대해 안내합니다.",
 path: "/privacy",
 keywords: ["개인정보 처리방침", "프라이버시", "쿠키 정책"],
});

const SECTIONS = [
 {
 title: "1. 수집하는 개인정보 항목",
 body: [
 "머니샐러리는 회원가입 절차 없이 이용 가능한 서비스로, 별도의 개인정보를 직접 수집하지 않습니다.",
 "다만 서비스 운영을 위해 다음 정보가 자동 수집될 수 있습니다:",
 "• 접속 로그 (IP 주소, 접속 시간, 브라우저 종류) — 호스팅 제공자(Cloudflare)가 보안·운영 목적으로 자동 수집",
 "• 사용자 입력 데이터 (연봉, 부양가족 수 등) — 사용자 브라우저의 localStorage에만 저장되며 서버로 전송되지 않습니다",
 "• 광고/분석 쿠키 — Google AdSense, Google Analytics 4, 쿠팡 파트너스가 제공하는 쿠키",
 ],
 },
 {
 title: "2. 처리 목적",
 body: [
 "수집된 정보는 다음 목적 외 사용되지 않습니다:",
 "• 서비스 제공 및 사용자 경험 개선",
 "• 사이트 트래픽 분석 (Google Analytics 4)",
 "• 맞춤형 광고 게재 (Google AdSense)",
 "• 제휴 마케팅 추적 (쿠팡 파트너스 — 클릭 시 일정액 수수료 발생, 구매와 무관)",
 ],
 },
 {
 title: "3. 보유 및 이용 기간",
 body: [
 "• localStorage 데이터: 사용자가 직접 삭제하기 전까지 브라우저에 보관됩니다.",
 "• 접속 로그: 호스팅 제공자 정책에 따라 일반적으로 30일 이내 자동 폐기됩니다.",
 "• Google Analytics 데이터: 기본 26개월 후 자동 삭제됩니다.",
 ],
 },
 {
 title: "4. 제3자 제공 및 광고 파트너",
 body: [
 "본 사이트는 다음 제3자 서비스를 사용합니다. 각 제공자의 개인정보 정책을 별도로 확인하시기 바랍니다:",
 "• Google AdSense / Google Analytics — Google LLC (https://policies.google.com/privacy)",
 "• 쿠팡 파트너스 — 쿠팡(주) (https://partners.coupang.com)",
 "• Cloudflare (호스팅) — Cloudflare, Inc. (https://www.cloudflare.com/privacypolicy)",
 ],
 },
 {
 title: "5. 쿠키 사용 및 거부",
 body: [
 "본 사이트는 사용자 경험 개선과 광고 게재를 위해 쿠키를 사용합니다.",
 "사용자는 브라우저 설정에서 쿠키를 거부하거나 삭제할 수 있습니다. 단, 일부 기능(localStorage 저장, 맞춤 광고)이 제한될 수 있습니다.",
 "Google 광고 개인화 거부: https://adssettings.google.com",
 ],
 },
 {
 title: "6. 사용자 권리",
 body: [
 "사용자는 본인의 정보에 대해 다음 권리를 가집니다:",
 "• 개인정보 열람·정정·삭제 요청",
 "• 처리 정지 요청",
 "• localStorage 데이터의 즉시 삭제 (브라우저 설정 또는 사이트 내 '데이터 초기화' 기능)",
 ],
 },
 {
 title: "7. 책임자 및 문의처",
 body: [
 "본 방침에 대한 문의는 사이트 내 연락 채널을 통해 부탁드립니다.",
 "방침 변경 시 본 페이지에 즉시 공지합니다.",
 ],
 },
];

export default function PrivacyPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "개인정보 처리방침", path: "/privacy" },
 ])}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-12">
 <p className="text-sm text-faint-blue mb-2">최종 업데이트: 2026년 5월</p>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy mb-4">
 개인정보 처리방침
 </h1>
 <p className="text-base text-muted-blue leading-relaxed">
 머니샐러리(이하 &ldquo;사이트&rdquo;)는 사용자의 개인정보를 중요시하며,
 정보통신망 이용촉진 및 정보보호 등에 관한 법률을 준수합니다.
 </p>
 </div>

 <div className="space-y-8">
 {SECTIONS.map((section) => (
 <section key={section.title} className="p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-lg font-black text-navy mb-4">{section.title}</h2>
 <div className="space-y-2 text-sm text-muted-blue leading-relaxed">
 {section.body.map((para, i) => (
 <p key={i}>{para}</p>
 ))}
 </div>
 </section>
 ))}
 </div>

 <div className="mt-16 pt-8 border-t border-canvas-200 text-center text-xs text-faint-blue">
 <Link href="/about" className="hover:text-electric">사이트 소개</Link>
 <span className="mx-2">·</span>
 <Link href="/terms" className="hover:text-electric">이용약관</Link>
 </div>
 </div>
 </main>
 );
}
