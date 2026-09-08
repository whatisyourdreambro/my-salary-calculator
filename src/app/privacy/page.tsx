import type { Metadata } from "next";
import Link from "@/components/AppLink";
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
 "머니샐러리는 회원가입 없이 계산할 수 있습니다. 비공개 문의 또는 페이지 개선 의견을 직접 보내는 경우에는 아래 접수 정보를 수집합니다.",
 "• 비공개 문의: 문의 종류, 관련 페이지 경로, 문의 내용, 접수 번호·시각, 동의 여부, 처리 상태. 회신 이메일은 선택 입력이며, 입력하고 동의한 경우에만 수집합니다. 첨부 파일은 받지 않습니다.",
 "• 페이지 개선 의견: 세 개 시범 페이지(삼성 성과급 계산기·2027 공무원 봉급 예상표·삼성전자 연봉)의 고정 페이지 구분과 경로, 도움 여부, 선택한 고정 이유, 접수 번호·시각, 동의 버전, 처리 상태를 저장합니다. 자유 입력·이메일·계산 입력값·결과·방문 쿼리·분석 식별자는 받지 않습니다.",
 "• 남용 방지: 서버의 비밀 키로 변환한 단기 IP 해시와 접수 횟수를 별도 제한 테이블에 저장합니다. 문의와 개선 의견은 별도의 제한 범위로 처리합니다. 문의·의견 행에 원본 IP를 저장하거나 이 해시를 연결하지 않습니다. 호스팅 제공자의 접속 로그는 별도로 처리될 수 있습니다.",
 "다만 서비스 운영을 위해 다음 정보가 자동 수집될 수 있습니다:",
 "• 접속 로그 (IP 주소, 접속 시간, 브라우저 종류) — 호스팅 제공자(Cloudflare)가 보안·운영 목적으로 자동 수집",
 "• 계산 입력값 (연봉, 부양가족 수 등) — 계산과 저장은 기본적으로 사용자 브라우저에서 처리합니다. 직접 구현한 계산 분석 이벤트에는 정확한 금액·금액 구간·부양가족 수를 포함하지 않고 계산기 종류와 이용 단계만 전송합니다.",
 "• 결과 공유 — 사용자가 결과 공유 기능을 선택하면 입력값이 포함된 결과 링크·문구·이미지가 생성될 수 있습니다. 공유한 상대와 선택한 외부 서비스가 해당 내용을 볼 수 있으며, 결과 링크나 미리보기 요청은 호스팅 서버에 전달될 수 있습니다.",
 "• 분석 URL — 직접 구현한 분석 이벤트에서는 공유 토큰과 계산 입력 쿼리를 제거하고 캠페인 유입 정보만 남깁니다. Google Analytics의 자동 페이지·링크 측정은 별도로 동작하므로 서비스 설정에 따라 방문 URL과 링크 정보가 수집될 수 있습니다.",
 "• 광고/분석 쿠키 — Google AdSense, Google Analytics 4, 쿠팡 파트너스가 제공하는 쿠키",
 ],
 },
 {
 title: "2. 처리 목적",
 body: [
 "수집된 정보는 다음 목적 외 사용되지 않습니다:",
 "• 서비스 제공 및 사용자 경험 개선",
 "• 비공개 문의 검토, 오류·정보 정정 및 개인정보 요청 처리, 선택 이메일을 통한 회신. 문의 본문·이메일·접수 번호를 직접 구현한 Google Analytics 이벤트에 보내지 않으며 사이트에 공개하지 않습니다.",
 "• 페이지 개선 의견은 어떤 설명을 보완할지 검토하는 데 사용합니다. 의견·이유·접수 번호를 직접 구현한 Google Analytics 이벤트로 보내지 않고 비공개로 보관합니다. 공개 댓글·참여자 목록·개별 답변 알림은 제공하지 않습니다.",
 "• 사이트 트래픽 분석 (Google Analytics 4)",
 "• 맞춤형 광고 게재 (Google AdSense)",
 "• 제휴 마케팅 추적 (쿠팡 파트너스 — 링크 경유 구매 발생 시 일정액의 수수료를 제공받으며, 구매 가격에는 영향이 없습니다)",
 ],
 },
 {
 title: "3. 보유 및 이용 기간",
 body: [
 "• localStorage 데이터: 사용자가 직접 삭제하기 전까지 브라우저에 보관됩니다.",
 "• 비공개 문의·페이지 개선 의견: 접수일부터 90일을 보유 기준으로 운영자가 삭제 관리합니다. 만료된 접수는 운영 검토 목록에서 제외하며, 만료 데이터와 단기 남용 방지 기록은 운영자가 정리합니다. 자동 삭제를 보장하는 기능은 아니므로 삭제를 원하면 접수 번호와 함께 요청해 주세요. 호스팅 제공자의 백업 보관은 별도 정책에 따릅니다.",
 "• 접속·보안 로그: Cloudflare가 서비스 운영과 보안을 위해 처리하며, 보관기간은 사용하는 로그 기능·서비스 설정과 관련 보관정책에 따라 달라집니다.",
 "• Google Analytics 데이터: 사용자·이벤트 수준 데이터의 보관기간은 해당 속성의 설정에 따릅니다. 집계 보고서에는 동일한 보관 설정이 적용되지 않습니다.",
 ],
 },
 {
 title: "4. 제3자 제공 및 광고 파트너",
 body: [
 "본 사이트는 다음 제3자 서비스를 사용합니다. 각 제공자의 개인정보 정책을 별도로 확인하시기 바랍니다:",
 "• Google AdSense / Google Analytics — Google LLC (https://policies.google.com/privacy)",
 "• 쿠팡 파트너스 — 쿠팡(주) (https://partners.coupang.com)",
 "• Cloudflare (호스팅·비공개 문의 및 페이지 개선 의견 저장) — Cloudflare, Inc. (https://www.cloudflare.com/privacypolicy). 운영자는 인증된 관리 화면에서 접수를 확인하며, 외부 방문자가 접수 목록을 조회하는 기능은 제공하지 않습니다.",
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
 "본 방침과 열람·정정·삭제 요청은 비공개 문의 페이지(/contact)의 개인정보 관련 요청으로 접수할 수 있습니다. 기존 문의나 개선 의견에 관한 요청에는 접수 번호를 적어 주세요. 처리에 필요한 범위에서 추가 확인을 요청할 수 있습니다.",
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
 <p className="text-sm text-faint-blue mb-2">최종 업데이트: 2026년 9월 9일</p>
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
 <Link href="/contact?source=privacy&type=privacy" className="font-bold text-electric hover:underline">개인정보 관련 비공개 문의</Link>
 <span className="mx-2">·</span>
 <Link href="/about" className="hover:text-electric">사이트 소개</Link>
 <span className="mx-2">·</span>
 <Link href="/terms" className="hover:text-electric">이용약관</Link>
 </div>
 </div>
 </main>
 );
}
