import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "이용약관 — 머니샐러리",
 description:
 "머니샐러리 이용약관. 서비스 이용 조건, 책임 한계, 콘텐츠 사용 권한, 분쟁 해결 절차를 안내합니다.",
 path: "/terms",
 keywords: ["이용약관", "서비스 약관", "Terms of Service"],
});

const SECTIONS = [
 {
 title: "제1조 (목적)",
 body: [
 "본 약관은 머니샐러리(moneysalary.com, 이하 &ldquo;사이트&rdquo;)가 제공하는 연봉 실수령액 계산 및 금융 정보 서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건을 규정합니다.",
 ],
 },
 {
 title: "제2조 (서비스의 성격)",
 body: [
 "본 서비스는 정보 제공을 목적으로 하며, 다음 사항에 해당하지 않습니다:",
 "• 세무 자문 또는 법률 자문",
 "• 투자 권유 또는 투자 자문",
 "• 대출·보험 상품의 가입 권유",
 "사용자는 중요한 재무 의사결정 전 반드시 자격을 갖춘 전문가와 상담해야 합니다.",
 ],
 },
 {
 title: "제3조 (서비스 이용)",
 body: [
 "본 서비스는 회원가입 없이 누구나 무료로 이용할 수 있습니다.",
 "단, 다음 행위는 금지됩니다:",
 "• 자동화 도구를 사용한 대량 트래픽 발생",
 "• 서비스의 안정적 운영을 방해하는 행위",
 "• 본 사이트의 콘텐츠를 무단으로 상업적 목적에 복제·배포",
 ],
 },
 {
 title: "제4조 (책임 한계)",
 body: [
 "본 사이트는 정보의 정확성을 위해 노력하지만, 다음 사항에 대해서는 책임을 지지 않습니다:",
 "• 세법 변경, 데이터 입력 오류 등으로 인한 계산 오차",
 "• 본 서비스의 정보를 활용하여 발생한 재무적 손실",
 "• 외부 링크(국세청, 쿠팡, 광고주 등)의 콘텐츠 및 운영",
 "사용자는 자신의 책임하에 본 서비스를 이용하시기 바랍니다.",
 ],
 },
 {
 title: "제5조 (저작권)",
 body: [
 "본 사이트의 모든 콘텐츠(계산기 로직, 가이드 글, 디자인)에 대한 저작권은 머니샐러리에 귀속됩니다.",
 "비영리 목적의 인용은 출처(moneysalary.com)를 명시하는 조건으로 허용됩니다.",
 "상업적 활용을 원하시는 경우 별도 문의가 필요합니다.",
 ],
 },
 {
 title: "제6조 (광고 및 제휴)",
 body: [
 "본 사이트는 Google AdSense를 통한 광고와 쿠팡 파트너스 활동의 일환인 제휴 마케팅 링크를 포함합니다.",
 "사용자가 광고 또는 제휴 링크를 통해 구매할 경우, 본 사이트는 일정 수수료를 받을 수 있으며 이는 구매 가격에 영향을 미치지 않습니다.",
 "쿠팡 파트너스 고지: 본 사이트는 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다.",
 ],
 },
 {
 title: "제7조 (약관 변경)",
 body: [
 "본 약관은 관련 법령 또는 서비스 운영상 필요에 따라 변경될 수 있으며, 변경 시 본 페이지에 즉시 공지됩니다.",
 ],
 },
 {
 title: "제8조 (분쟁 해결)",
 body: [
 "본 약관에 명시되지 않은 사항은 대한민국 관련 법령과 일반 상관례에 따릅니다.",
 "본 서비스 이용과 관련한 분쟁이 발생한 경우, 사용자와 사이트는 신의성실의 원칙에 따라 협의하여 해결합니다.",
 ],
 },
];

export default function TermsPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "이용약관", path: "/terms" },
 ])}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-12">
 <p className="text-sm text-faint-blue mb-2">최종 업데이트: 2026년 5월</p>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy mb-4">
 이용약관
 </h1>
 <p className="text-base text-muted-blue leading-relaxed">
 머니샐러리(moneysalary.com)의 서비스를 이용하기 전 본 약관을 반드시 확인해주세요.
 </p>
 </div>

 <div className="space-y-6">
 {SECTIONS.map((section) => (
 <section key={section.title} className="p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-base font-black text-navy mb-4">{section.title}</h2>
 <div className="space-y-2 text-sm text-muted-blue leading-relaxed">
 {section.body.map((para, i) => (
 <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/&ldquo;|&rdquo;/g, '"') }} />
 ))}
 </div>
 </section>
 ))}
 </div>

 <div className="mt-16 pt-8 border-t border-canvas-200 text-center text-xs text-faint-blue">
 <Link href="/about" className="hover:text-electric">사이트 소개</Link>
 <span className="mx-2">·</span>
 <Link href="/privacy" className="hover:text-electric">개인정보 처리방침</Link>
 </div>
 </div>
 </main>
 );
}
