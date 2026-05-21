// src/app/health-checkup-2026/page.tsx
// 6~7월 건강검진 시즌 페이지 — 일반/암검진 대상자·항목·비용·예약 종합

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, Stethoscope, FileText, AlertCircle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
 title: "건강검진 2026 — 대상자·항목·비용·예약 + 미수검 과태료",
 description:
 "2026 국민건강검진 대상자 조회법, 일반·암검진 항목, 비용·자기부담금, 예약 방법, 직장가입자 미수검 과태료(최대 1,000만원)까지 한 페이지 정리.",
 path: "/health-checkup-2026",
 ogType: "article",
 publishedTime: "2026-05-22",
 modifiedTime: "2026-05-22",
 keywords: [
 "건강검진 2026",
 "2026 건강검진",
 "국민건강검진 대상",
 "직장인 건강검진",
 "암검진 대상자",
 "건강검진 비용",
 "건강검진 미수검 과태료",
 "건강검진 예약",
 ],
});

const TARGETS = [
 {
 type: "일반건강검진 (만 20세 이상)",
 desc: "직장가입자: 사무직 2년에 1회 (출생연도 짝수년·홀수년 격년) / 비사무직 매년. 지역가입자·피부양자: 만 20세 이상 격년.",
 },
 {
 type: "암검진 (5대 암)",
 desc: "위암(만 40세 이상, 2년 1회), 대장암(만 50세 이상, 1년 1회), 간암(고위험군 6개월 1회), 유방암(만 40세 이상 여성, 2년 1회), 자궁경부암(만 20세 이상 여성, 2년 1회). 폐암은 만 54~74세 고위험군 2년 1회.",
 },
 {
 type: "영유아 건강검진 (생후 14일~71개월)",
 desc: "총 8회 무료 (4·9·18·30·42·54·66개월 + 14~35일). 발달평가·구강검진 포함.",
 },
 {
 type: "학생 건강검진 (초·중·고)",
 desc: "초1, 초4, 중1, 고1 학년 무료 학교 검진. 그 외 학년은 학교 보건실 측정만.",
 },
];

const COSTS = [
 { item: "일반건강검진", cost: "전액 공단 부담 (자기부담금 0원)" },
 { item: "5대 암검진 (위·대장·간·유방·자궁경부)", cost: "공단 90% + 본인 10% (단, 의료급여수급권자·차상위계층 무료)" },
 { item: "폐암 검진", cost: "공단 90% + 본인 10% (1만원대)" },
 { item: "추가 검사 (선택)", cost: "본인 100% (혈액·복부초음파·내시경 비수면 등 2~20만원)" },
];

const FAQ_ITEMS = [
 {
 question: "2026 건강검진 대상자 어떻게 확인하나요?",
 answer:
 "국민건강보험공단 홈페이지(www.nhis.or.kr) 또는 The건강보험 모바일 앱에서 '건강검진 대상자 조회'로 본인 인증 후 확인 가능. 본인 출생연도 끝자리가 짝수면 짝수년도, 홀수면 홀수년도가 검진 대상년. 대상자는 매년 1월 우편/카카오톡 알림 발송.",
 },
 {
 question: "직장인 건강검진 미수검 시 과태료가 정말 있나요?",
 answer:
 "네, 산업안전보건법에 따라 사업주에게 최대 1,000만원 과태료, 근로자 본인에게 최대 300만원 과태료가 부과될 수 있습니다(미실시 위반). 사업주가 휴가·시간 제공하지 않은 경우도 위반. 다만 실무에서는 사전 권고·시정 명령 단계가 우선되며 즉시 과태료 부과는 드뭅니다.",
 },
 {
 question: "건강검진은 직장에서 시간을 줘야 하나요?",
 answer:
 "네, 산업안전보건법 제129조에 따라 사업주는 근로자가 건강진단을 받을 수 있도록 시간을 제공해야 합니다. 통상 반차~1일 유급 부여가 일반적이며, 회사 취업규칙에 명시되어 있습니다. 검진 시간이 근무시간 외라도 보상해야 합니다.",
 },
 {
 question: "비용이 0원이라는데 추가 검사를 권하더라고요?",
 answer:
 "국가검진은 전액 공단 부담이지만, 병원에서 권하는 '종합검진 패키지'에는 비급여 항목(복부초음파·갑상선·심혈관 정밀·내시경 수면)이 포함되어 별도 비용(10~50만원)이 발생합니다. 회사가 종합검진을 지원하는지 먼저 확인하고, 본인 부담이면 국가검진 무료 항목만 받는 게 합리적입니다.",
 },
 {
 question: "검진 예약은 어디서 하나요?",
 answer:
 "공단 홈페이지에서 '건강검진 기관 찾기'로 본인 지역 검진기관 조회 → 직접 전화/온라인 예약. 직장 단체검진은 회사 인사팀이 일괄 예약하는 경우 多. 인기 검진기관·시즌(5~7월, 11~12월)은 한 달 전 예약 권장.",
 },
 {
 question: "암검진 본인 부담금 1만원대는 정확한 금액이?",
 answer:
 "위·대장·간·유방·자궁경부암 검진 공단 90% 부담, 본인 부담 약 8,000~15,000원. 의료급여수급권자·차상위계층은 전액 무료. 추가 정밀검사(대장 내시경·조직검사 등) 필요 시 본인 부담 증가.",
 },
 {
 question: "건강검진 결과지에 '추가 검진 필요' 나오면?",
 answer:
 "고혈압·당뇨·고지혈증 등 만성질환 의심이면 의료기관 방문해 추가 진단 받으세요. 무증상이라도 7일 이내 확인 권장. 결과지는 건강보험 IM 시스템에 5년간 보관되어 다음 검진 시 추이 비교 가능. 일부 보험사는 결과 미공유 조건의 가입 상품도 있습니다.",
 },
 {
 question: "검진 전 금식·주의사항은?",
 answer:
 "검진 8~12시간 전부터 물 외 금식(혈액검사 정확도). 검진 3일 전부터 음주·과식·격렬한 운동 자제. 검진 당일 아침 약 복용 여부는 검진기관 안내 따름. 여성은 생리 중 자궁경부암 검사 어려우니 일정 조정 권장.",
 },
 {
 question: "암검진 결과 양성 나왔는데 어떻게 하나요?",
 answer:
 "암검진은 '암 의심' 단계로, 양성 = 확진 아닙니다. 결과지에 명시된 정밀검진(조직검사·CT·MRI)을 가까운 종합병원에서 받아야 확진. 정밀검진 비용은 건강보험 적용되며, 본인 부담률은 의료기관·항목별 다름. 너무 미루지 말고 2주 이내 진행 권장.",
 },
 {
 question: "직장 종합검진(회사 지원) vs 국가건강검진 차이는?",
 answer:
 "국가검진은 공단 부담 무료/암검진 본인 10%. 회사 종합검진(연 1회 지원 사례 多)은 회사가 비급여 항목 비용 부담, 검진 항목 더 광범위(복부초음파·심혈관·갑상선 등). 회사 지원이 있으면 종합검진을, 없으면 국가검진 + 본인 우려 부위만 추가 검사가 합리적.",
 },
];

export default function HealthCheckup2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "건강검진 2026", path: "/health-checkup-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "건강검진 2026 — 대상·항목·비용·예약 종합",
 description: "직장인·지역가입자 일반·암검진 대상자, 비용 자기부담금, 예약 방법, 미수검 과태료",
 slug: "health-checkup-2026",
 publishedDate: "2026-05-22",
 modifiedDate: "2026-05-22",
 }),
 speakableLd({
 url: "/health-checkup-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Stethoscope className="w-4 h-4" />
 5~7월 검진 시즌
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 건강검진 2026 <span className="text-electric">대상·비용·예약</span>
 </h1>
 <PublishedMeta publishedDate="2026-05-22" updatedDate="2026-05-22" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 본인이 2026년 건강검진 대상자인지, 어떤 항목을 받고, 비용은 얼마인지,
 예약은 어디서 하는지 한 페이지에서 확인하세요. 직장인은 미수검 시 사업주
 과태료(최대 1,000만원)가 부과될 수 있어 6~7월 시즌 내 완료 권장.
 </p>
 <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
 📚 공식 출처:{" "}
 <a
 href="https://www.nhis.or.kr/nhis/healthin/retrieveExmnAdcHmpgInfo.do"
 target="_blank"
 rel="noopener noreferrer"
 className="text-electric font-bold hover:underline"
 >
 국민건강보험공단 건강검진
 </a>
 </p>
 </div>

 {/* 본문 */}
 <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
 <p className="text-sm leading-7 text-muted-blue">
 국민건강검진은 국민건강보험 가입자라면 누구나 받을 수 있는 무료 검진입니다.
 일반건강검진(혈압·혈액·소변 등 17개 항목)은 공단이 전액 부담하고, 암검진(위·대장·
 간·유방·자궁경부·폐 등 6대 암)은 90% 공단 + 10% 본인 부담입니다. 직장가입자
 사무직은 2년에 1회, 비사무직은 매년 실시 의무.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 검진 대상년도는 출생연도 끝자리로 결정됩니다 — 짝수년 출생자는 짝수년도(2026),
 홀수년 출생자는 홀수년도(2025·2027)가 대상. 매년 1월 공단에서 우편·카카오톡으로
 대상자 알림을 발송하며, 본인이 직접 The건강보험 앱·www.nhis.or.kr에서도 조회
 가능합니다. 알림을 못 받았어도 본인이 대상이면 검진 가능.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 <strong>직장인 주의</strong>: 산업안전보건법은 사업주에게 근로자가 건강진단을
 받을 수 있도록 시간을 제공하고, 비용을 부담시킬 수 없도록 규정합니다. 회사가
 시간을 안 주거나 종합검진을 강요해 비급여 비용을 부담하게 한다면 위법 소지가
 있어 노동지청에 신고 가능. 일반 국가검진은 100% 무료라는 점을 명확히 기억하세요.
 </p>
 </section>

 <InArticleAd />

 {/* 대상자 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <FileText className="w-5 h-5 text-electric" />
 2026 건강검진 대상자
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {TARGETS.map((row) => (
 <div
 key={row.type}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <p className="font-bold text-navy text-sm mb-2">{row.type}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{row.desc}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 비용 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-electric" />
 검진 항목별 본인 부담금
 </h2>
 <div className="space-y-3">
 {COSTS.map((row) => (
 <div
 key={row.item}
 className="flex items-start gap-4 p-4 bg-canvas rounded-xl"
 >
 <div className="flex-1">
 <p className="font-bold text-navy text-sm mb-1">{row.item}</p>
 <p className="text-xs text-muted-blue">{row.cost}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* CTAs */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
 <Link
 href="/health-insurance-2026"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Calendar className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">건강보험 정산 2026</h3>
 <p className="text-sm opacity-90">7월 추가 부과 대응</p>
 </Link>
 <Link
 href="/social-insurance-rates-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <FileText className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">4대보험 요율 2026</h3>
 <p className="text-sm text-muted-blue">건강·국민·고용·산재 요율</p>
 </Link>
 <Link
 href="/"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <Calendar className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">실수령액 계산</h3>
 <p className="text-sm text-muted-blue">세후 월급 즉시 계산</p>
 </Link>
 </section>

 {/* FAQ */}
 <section className="mb-12 max-w-3xl mx-auto">
 <h2 className="text-xl font-black text-navy mb-6">건강검진 자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details
 key={item.question}
 className="group p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
 {item.question}
 <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/health-checkup-2026" />

 <div className="mt-8 max-w-3xl mx-auto">
 <ShareButtons
 title="건강검진 2026 — 대상·항목·비용·예약 종합"
 description="직장인 미수검 과태료, 일반/암검진 대상, 본인 부담금 한눈에"
 />
 </div>

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
