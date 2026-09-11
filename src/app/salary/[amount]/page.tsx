// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { SALARY_CALCULATION_METHOD_HREF, SALARY_MODEL_2026 } from "@/lib/salaryModelContent";
import SalaryTierCard from "@/components/SalaryTierCard";
import SalaryResultCard from "@/components/SalaryResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import { getRelatedGuides } from "@/lib/relatedGuides";
import RelatedCompanies from "@/components/RelatedCompanies";
// 서버 전용 (dartDisclosed 1.3MB) — 클라 반입 금지
import ListedSalaryBandTable from "@/components/ListedSalaryBandTable";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { CalcResultAd, GuideMidAd, HomeTopAd, SidebarAd } from "@/components/AdPlacement";
import { SALARY_PAGE_GUIDES } from "@/lib/crossLink";
import NextActions from "@/components/NextActions";
import { nextActionHrefs } from "@/lib/nextActionLinks";
import SeasonalLinks from "@/app/table/2026/SeasonalLinks";
import CoupangBanner from "@/components/CoupangBanner";
import FavoritesButton from "@/components/FavoritesButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { buildSalaryAmountMetadata , formatSalaryKorean } from "@/lib/seo";
import {
 breadcrumbLd,
 faqLd,
 softwareApplicationLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import {
 MIN_SALARY,
 MAX_SALARY,
 getStaticSalaryAmounts,
 getSalaryNeighborAmounts,
} from "@/lib/salaryStaticParams";

// 무거운 recharts는 클라이언트 래퍼(WealthChartLazy)에서 dynamic(ssr:false) 처리 —
// 서버 컴포넌트에서 직접 선언하면 코드 분할이 안 돼 첫 로드에 recharts가 포함됨
import WealthChart from "@/components/WealthChartLazy";

// [2026-08-07] edge 매 요청 SSR → 빌드 타임 정적 생성 전환.
// 구글봇 크롤 시 CF Worker CPU 한도 초과(GSC 5xx)의 근본 원인 제거.
// 슬러그는 순수 숫자(ASCII)라 CF Pages 한글 프리렌더 404 함정 없음.
// 집합 밖 URL은 404 (dynamicParams=false — CF Pages는 폴백 렌더 불가).
// 내부 링크 전 지점의 amount 집합은 src/lib/salaryStaticParams.ts 가 단일 소스.
export const dynamicParams = false;

export function generateStaticParams(): { amount: string }[] {
 return getStaticSalaryAmounts().map((amount) => ({ amount: String(amount) }));
}

function parseSalaryParam(param: string): number | null {
 let amount: number | null = null;
 const manwonMatch = param.match(/^(\d+)-manwon$/);
 const eokMatch = param.match(/^(\d+)-eok$/);
 const eokHalfMatch = param.match(/^(\d+)-5-eok$/);
 if (manwonMatch) {
  amount = parseInt(manwonMatch[1], 10) * 10000;
 } else if (eokMatch) {
  amount = parseInt(eokMatch[1], 10) * 100000000;
 } else if (eokHalfMatch) {
  amount = parseInt(eokHalfMatch[1], 10) * 100000000 + 50000000;
 } else if (/^\d+$/.test(param)) {
  amount = parseInt(param, 10);
 }
 if (
  amount === null ||
  !Number.isFinite(amount) ||
  amount < MIN_SALARY ||
  amount > MAX_SALARY
 ) {
  return null;
 }
 return amount;
}

type Props = {
 params: { amount: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const amount = parseSalaryParam(params.amount);
 if (amount === null) {
  return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
 }
 // SNS 공유 CTR — 월 실수령액 숫자를 OG 이미지에 직접 박기.
 const tax = calculateSalary2026(amount, 200000, 1, 0);
 const metadata = buildSalaryAmountMetadata(amount, tax.netPay);
 const description = `연봉 ${formatSalaryKorean(amount)}의 예상 월 실수령액은 약 ${Math.round(tax.netPay / 10000).toLocaleString("ko-KR")}만원입니다 (${SALARY_MODEL_2026.defaultConditions} 기준). 연간 세액 추정의 월 환산액으로, 실제 급여와 다를 수 있습니다.`;
 return {
  ...metadata,
  description,
  openGraph: { ...metadata.openGraph, description },
  twitter: { ...metadata.twitter, description },
 };
}

function buildSalaryFaq(amount: number, monthlyNet: number, totalDeduction: number) {
 const manwon = Math.round(amount / 10000).toLocaleString("ko-KR");
 const netManwon = (monthlyNet / 10000).toFixed(0);
 const deductionManwon = (totalDeduction / 10000).toFixed(0);
 const repaymentReference = Math.round((amount * 0.4) / 10000).toLocaleString("ko-KR");

 return [
 {
 question: `연봉 ${manwon}만원의 월 실수령액은 얼마인가요?`,
 answer: `연봉 ${manwon}만원의 2026년 예상 월 실수령액은 약 ${netManwon}만원입니다. 보험료와 세금을 포함한 월 공제액은 약 ${deductionManwon}만원입니다 (${SALARY_MODEL_2026.defaultConditions} 기준). ${SALARY_MODEL_2026.incomeTaxMethod} ${SALARY_MODEL_2026.limitation}`,
 },
 {
 question: `연봉 ${manwon}만원일 때 대출 상환 부담은 어떻게 비교하나요?`,
 answer: `세전 연봉의 40%를 상환 부담 비교용으로 가정하면 연 ${repaymentReference}만원입니다. 이는 단순 비율 예시이며 대출 가능 금액이나 DSR 심사 결과가 아닙니다. 기존 대출의 원리금, 금리·만기와 금융기관의 인정 소득·심사 조건을 함께 확인해야 합니다.`,
 },
 {
 question: `연봉 ${manwon}만원이면 한국 직장인 중 어느 정도 위치인가요?`,
 answer: `2024년 국세청 통계 기준 한국 직장인 평균 연봉은 약 4,200만원, 중위 연봉은 약 3,200만원입니다. 연봉 ${manwon}만원은 머니샐러리 연봉 티어에서 자세히 확인할 수 있으며, 본 페이지의 시각화를 참고하세요.`,
 },
 {
 question: "실수령액이 더 늘어나는 방법이 있나요?",
 answer:
 "급여명세서의 비과세액과 공제 대상 가족 조건을 확인한 뒤 홈 계산기에 본인의 조건을 입력해 비교하세요. 이 표의 기본 계산에는 중소기업 취업자 감면·의료비·교육비·연금저축 등 별도 공제가 반영되지 않습니다. 실제 적용 가능 여부와 정산액은 회사 급여 담당자나 국세청 자료로 확인해야 합니다.",
 },
 ];
}

export default function SalaryAmountPage({ params }: Props) {
 const amount = parseSalaryParam(params.amount);
 if (amount === null) {
  notFound();
 }
 const tax = calculateSalary2026(amount, 200000, 1, 0);

 // H1 표기는 title·description 과 같은 규칙(formatSalaryKorean)을 쓴다.
 // 종전 식은 (a) 1만원 미만 끝자리에서 "연봉 2,683.56만원" 같은 소수점을 만들었고
 // (2026-09-06 전수검사: 43쪽), (b) 1억 이상을 소수 1자리 억으로 뭉개 135쪽이
 // 16종 H1 을 공유했다(1.1억 하나에 19개 URL). 두 문제를 한 번에 해소한다.
 const formattedAmount = formatSalaryKorean(amount);

 // 인근 연봉 cross-link — 정적 생성 집합(사이트맵 격자) 안의 값만 가리키도록
 // generateStaticParams 와 같은 격자 함수를 공유 (내부 404 링크 0건)
 const neighbors = getSalaryNeighborAmounts(amount);

 const faqItems = buildSalaryFaq(amount, tax.netPay, tax.totalDeductions);

 const breadcrumbItems = [
 { name: "홈", path: "/" },
 { name: "연봉별 실수령액", path: "/" },
 { name: `연봉 ${formattedAmount}`, path: `/salary/${params.amount}` },
 ];

 const howTo = howToLd({
 name: `연봉 ${formattedAmount} 실수령액 계산하는 방법`,
 description: `연봉 ${formattedAmount}의 2026년 예상 월 수령액 계산 과정. ${SALARY_MODEL_2026.defaultConditions} 기준. ${SALARY_MODEL_2026.limitation}`,
 totalTime: "PT2M",
 steps: [
 {
 name: "비과세 식대 차감",
 text: "연봉에 포함된 월 비과세 20만원(연 240만원)을 제외해 연간 총급여액을 구합니다.",
 },
 {
 name: "4대보험 공제",
 text: "비과세를 뺀 월 보수에 국민연금 4.75%(기준소득월액 상·하한 적용), 건강보험 3.595%, 고용보험 0.9%를 적용합니다. 장기요양보험은 건강보험료의 13.14%로 계산합니다.",
 },
 {
 name: "근로소득공제 적용",
 text: "연간 총급여액에 따라 구간별 근로소득공제를 적용합니다(공제 한도 2,000만원).",
 },
 {
 name: "기본·인적공제 차감",
 text: "근로소득공제 후 본인 기본공제 150만원과 연간 국민연금 보험료 추정액을 차감해 과세표준을 구합니다. 이 페이지는 부양가족 본인 1명·자녀 0명 조건입니다.",
 },
 {
 name: "산출세액 계산",
 text: "6~45% 누진세율과 근로소득세액공제를 적용한 연간 추정 세액을 12개월로 나누고, 월 소득세의 10%를 지방소득세로 계산합니다. 실제 월별 간이세액표 조회나 연말정산 확정 세액은 아닙니다.",
 },
 ],
 });

 const speakable = speakableLd({
 url: `/salary/${params.amount}`,
 cssSelectors: [".speakable-summary", ".faq-answer"],
 });

 return (
 <main className="min-h-screen bg-transparent pb-10">
 <JsonLd
 data={[
 breadcrumbLd(breadcrumbItems),
 softwareApplicationLd({
 name: `연봉 ${formattedAmount} 실수령액 계산기`,
 description: `연봉 ${formattedAmount}의 2026년 모델 기준 예상 월 실수령액·세금 공제 분석`,
 url: `/salary/${params.amount}`,
 }),
 faqLd(faqItems),
 howTo,
 speakable,
 ]}
 />

 <div className="pt-24 px-4 sm:px-6 lg:px-8">
 <div className="max-w-7xl mx-auto">
 <Breadcrumbs items={breadcrumbItems} className="mb-6" />

 <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
 {/* Main column */}
 <div className="flex flex-col items-center lg:items-stretch">
 <div className="flex items-center gap-2 mb-2 self-center">
 <span className="bg-canvas-dark text-electric text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
 2026 REPORT
 </span>
 <Sparkles size={14} className="text-[#FFD700]" />
 </div>

 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy text-center mb-6 self-center leading-tight">
 연봉 <span className="text-primary">{formattedAmount}</span>의<br />월
 실수령액 분석
 </h1>

 <div className="self-center mb-6">
 <FavoritesButton title={`연봉 ${formattedAmount} 실수령액`} />
 </div>

 <div className="speakable-summary self-center max-w-xl text-center text-sm text-muted-blue mb-6">
 연봉 {formattedAmount}의 예상 월 실수령액은 약 {(tax.netPay / 10000).toFixed(0)}만원,
 4대보험·세금 공제는 월 약 {(tax.totalDeductions / 10000).toFixed(0)}만원입니다.
 <p className="mt-2">{SALARY_MODEL_2026.defaultConditions} 기준입니다. {SALARY_MODEL_2026.incomeTaxMethod}{" "}
 <Link href={SALARY_CALCULATION_METHOD_HREF} className="text-link underline underline-offset-4">계산 방식과 실제 급여와의 차이</Link>를 확인하세요.</p>
 </div>

 <SalaryResultCard
 monthlyNet={tax.netPay}
 totalDeduction={tax.totalDeductions}
 breakdown={{
 pension: tax.nationalPension,
 health: tax.healthInsurance,
 longTermCare: tax.longTermCare,
 employment: tax.employmentInsurance,
 incomeTax: tax.incomeTax,
 localTax: tax.localIncomeTax,
 }}
 />

 <div className="w-full mt-6">
 <CalcResultAd />
 </div>

 {/* 결과 직후 — 다음 행동 CTA */}
 <div className="w-full mt-2 px-2">
 <NextActions annualSalary={amount} category="salary" />
 </div>

 {/* 쿠팡 파트너스 배너 */}
 <div className="w-full mt-6 px-2">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "rectangle" }}
 showDisclosure={true}
 />
 </div>

 <div className="w-full mt-10 space-y-12">
 <WealthChart monthlyNetSalary={tax.netPay} />

 {/* 차트와 티어카드 사이 광고 금지 — IN_ARTICLE 슬롯은 SalaryResultCard의
 "결과 직하" 광고가 먼저 선점하므로 여기 두면 dedup 으로 렌더 자체가 안 됨
 (죽은 유닛, 2026-08-23 ad-audit 적발·제거). 이 자리는 실험 #2c 후보. */}

 <SalaryTierCard annualSalary={amount} />

 {/* 티어카드 ↔ FAQ 사이 — 이 페이지에서 유일하게 HOME_TOP 슬롯 미사용이었음 (Phase 1) */}
 <div className="px-2">
 <HomeTopAd />
 </div>

 {/* FAQ */}
 <section className="px-2 sm:px-6">
 <h2 className="text-lg font-black text-navy mb-4">자주 묻는 질문</h2>
 <div className="space-y-3">
 {faqItems.map((item) => (
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

 {/* FAQ 후 — 콘텐츠 흐름과 어울리는 fluid 인아티클 광고 (CTR↑) */}
 <div className="px-2">
 <GuideMidAd />
 </div>

 {/* (2026-08-24 죽은 유닛 수리) 종전 이 자리의 "FAQ 후 쿠팡" 2번째 배너가
 페이지당 2개 캡을 선점해 데스크톱 사이드바 skyscraper(아래 aside)가
 무음 차단되고 있었다 — 415개 URL의 데스크톱 쿠팡 인벤토리가 0이던
 문제. 본문 1개 + 사이드바 1개 구성으로 정리 (docs/ad-experiments.md) */}

 {/* 인근 연봉 리포트 */}
 {neighbors.length > 0 && (
 <div className="pt-8 border-t border-canvas px-2 sm:px-6">
 <h2 className="text-sm font-black text-faint-blue uppercase tracking-widest mb-4 text-center">
 다른 연봉 리포트
 </h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {neighbors.map((s) => (
 <Link
 key={s}
 href={`/salary/${s}`}
 className="p-4 bg-white border border-canvas rounded-2xl text-xs font-bold text-muted-blue flex justify-between items-center hover:border-primary hover:text-primary transition-colors shadow-sm"
 >
 연봉 {Math.round(s / 10000).toLocaleString("ko-KR")}만원
 <ChevronRight size={14} className="text-faint-blue" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* 위 NextActions(salary 3종)와 같은 대상은 빼고 채움 — 4개 유지 (S2-3 중복 제거) */}
 <div className="px-2 sm:px-6">
 <RelatedCalculators currentPath="/" title="이 연봉으로 다음 단계는?" exclude={nextActionHrefs("salary")} />
 </div>

 {/* 핵심 가이드 cross-link — 본인 연봉을 바탕으로 다음 의사결정 도움 */}
 <div className="px-2 sm:px-6">
 <RelatedGuides
 items={getRelatedGuides({
 currentSlug: `__salary-${params.amount}`,
 explicitSlugs: SALARY_PAGE_GUIDES,
 limit: 4,
 })}
 title="연봉을 알았다면 다음은 이걸 읽어보세요"
 />
 </div>

 {/* 같은 연봉대 회사 — 입력 연봉 ±15% 매칭 회사 6개 */}
 <div className="px-2 sm:px-6">
 <RelatedCompanies
 currentId={`__salary-${params.amount}`}
 targetSalary={amount}
 limit={6}
 title="이 연봉대의 실제 회사들"
 />
 <ShareSection contentType="salary_result" className="mt-8" />
 </div>

 {/* 증강 팩 ① (2026-08-30): 이 연봉대 공시 평균연봉 상장사 — DART 원값.
 준중복 해소(페이지별 표 상이) + lite 내부링크. 광고 전부 아래 배치 준수 */}
 <div className="px-2 sm:px-6">
 <ListedSalaryBandTable annualWon={amount} />
 </div>

 {/* 시즌 크로스링크 — 표 4종 공용 블록 재사용 (G8 메쉬, 2026-08-23).
 광고·기존 블록 전부 아래. 시즌 교체는 SeasonalLinks.tsx 한 곳에서 */}
 <div className="px-2 sm:px-6">
 <SeasonalLinks />
 </div>
 </div>
 </div>

 {/* Desktop sticky sidebar — 광고 + 쿠팡 */}
 <aside
 className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
 aria-label="추천·광고"
 >
 <SidebarAd />
 <CoupangBanner size="skyscraper" showDisclosure={false} />
 </aside>
 </div>
 </div>
 </div>
 </main>
 );
}
