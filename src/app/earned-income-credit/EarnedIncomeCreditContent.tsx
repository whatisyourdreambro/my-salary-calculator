"use client";

// src/app/earned-income-credit/EarnedIncomeCreditContent.tsx

import { useState, useMemo } from "react";
import {
 Gift,
 ChevronDown,
 ChevronUp,
 Users,
 User,
 Heart,
 AlertCircle,
 CheckCircle2,
 Calendar,
 ExternalLink,
} from "lucide-react";
import { InArticleAd, GuideMidAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Link from "next/link";

type HouseholdType = "single" | "one-earner" | "dual-earner";

interface HouseholdConfig {
 label: string;
 description: string;
 maxIncome: number; // 만원
 peakStart: number; // 만원 — 점증구간 끝
 peakEnd: number;   // 만원 — 평탄구간 끝
 maxBenefit: number; // 만원
 icon: React.ReactNode;
}

const HOUSEHOLD_CONFIGS: Record<HouseholdType, HouseholdConfig> = {
 "single": {
  label: "단독가구",
  description: "배우자·부양자녀·70세 이상 직계존속 없음",
  maxIncome: 2200,
  peakStart: 400,
  peakEnd: 900,
  maxBenefit: 165,
  icon: <User size={18} />,
 },
 "one-earner": {
  label: "홑벌이가구",
  description: "배우자 또는 부양자녀 있고 배우자 소득 300만원 미만",
  maxIncome: 3200,
  peakStart: 700,
  peakEnd: 1400,
  maxBenefit: 285,
  icon: <Users size={18} />,
 },
 "dual-earner": {
  label: "맞벌이가구",
  description: "신청인 + 배우자 각각 소득 300만원 이상",
  maxIncome: 4400,
  peakStart: 800,
  peakEnd: 1700,
  maxBenefit: 330,
  icon: <Heart size={18} />,
 },
};

const PROPERTY_THRESHOLD = 17000; // 재산 1억7천만원 이상 → 50% 감액
const PROPERTY_MAX = 24000;       // 재산 2억4천만원 이상 → 지급 불가

function calcBenefit(income: number, cfg: HouseholdConfig): number {
 const { peakStart, peakEnd, maxIncome, maxBenefit } = cfg;
 if (income <= 0) return 0;
 if (income >= maxIncome) return 0;

 if (income <= peakStart) {
  // 점증구간
  return (income / peakStart) * maxBenefit;
 } else if (income <= peakEnd) {
  // 평탄구간
  return maxBenefit;
 } else {
  // 점감구간
  return maxBenefit * (maxIncome - income) / (maxIncome - peakEnd);
 }
}

const APPLY_STEPS = [
 {
  step: "01",
  title: "신청 기간 확인",
  desc: "정기 신청: 매년 5월 1~31일 / 반기 신청: 9월(상반기), 다음 해 3월(하반기)",
 },
 {
  step: "02",
  title: "홈택스·손택스 접속",
  desc: "국세청 홈택스(PC) 또는 손택스 앱(모바일) → 장려금 신청 메뉴 선택",
 },
 {
  step: "03",
  title: "소득·재산 정보 확인",
  desc: "대부분 자동 조회됨. 누락 소득(프리랜서 등)은 직접 입력",
 },
 {
  step: "04",
  title: "신청 완료 → 지급",
  desc: "정기 신청 시 9월 말 지급. 반기는 신청 다음 달 말 지급",
 },
];

const ELIGIBILITY_CHECKS = [
 { label: "단독가구 소득", value: "연간 2,200만원 미만" },
 { label: "홑벌이가구 소득", value: "연간 3,200만원 미만" },
 { label: "맞벌이가구 소득", value: "연간 4,400만원 미만" },
 { label: "재산 요건", value: "6월 1일 기준 가구원 합산 2억 4천만원 미만" },
 { label: "연령 요건", value: "연령 무관 (단독가구 연령 요건 폐지)" },
 { label: "국적 요건", value: "대한민국 국적 (또는 국적자와 혼인한 외국인)" },
];

const FAQ_LIST = [
 {
  q: "아르바이트·일용직도 신청할 수 있나요?",
  a: "네. 일용근로소득, 사업소득, 종교인소득도 포함됩니다. 단, 소득 유형에 따라 계산 방식이 다를 수 있어 국세청 안내를 확인하세요.",
 },
 {
  q: "재산이 1억7천만원 이상이면 아예 못 받나요?",
  a: "받을 수 있지만 50% 감액됩니다. 재산이 2억 4천만원 이상이면 지급 대상에서 제외됩니다. 재산에는 토지·건물·자동차·금융재산 등이 포함됩니다.",
 },
 {
  q: "반기 신청과 정기 신청 중 무엇이 유리한가요?",
  a: "반기 신청은 소득이 발생한 직후 빠르게 받을 수 있어 현금 흐름에 유리합니다. 다만 소득이 연말에 집중된다면 정기 신청이 더 높은 금액을 받을 수도 있습니다. 두 방식은 중복 신청이 불가합니다.",
 },
 {
  q: "자녀장려금과 어떻게 다른가요?",
  a: "근로장려금은 저소득 근로자·사업자 대상 소득 지원입니다. 자녀장려금은 18세 미만 자녀가 있는 홑벌이·맞벌이 가구에 추가로 지급(자녀 1인당 최대 100만원)합니다. 둘 다 동시에 신청 가능합니다.",
 },
 {
  q: "신청을 놓쳤을 때 기한 후 신청이 가능한가요?",
  a: "정기 신청 기간(5월) 이후에도 11월 30일까지 기한 후 신청이 가능합니다. 단, 지급액의 10%가 감액됩니다.",
 },
];

export default function EarnedIncomeCreditContent() {
 const [household, setHousehold] = useState<HouseholdType>("one-earner");
 const [incomeInput, setIncomeInput] = useState("2400");
 const [propertyInput, setPropertyInput] = useState("8000");
 const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

 const cfg = HOUSEHOLD_CONFIGS[household];

 const { income, property, baseBenefit, finalBenefit, status } = useMemo(() => {
  const income = parseFloat(incomeInput.replace(/,/g, "")) || 0;
  const property = parseFloat(propertyInput.replace(/,/g, "")) || 0;

  if (property >= PROPERTY_MAX) {
   return { income, property, baseBenefit: 0, finalBenefit: 0, status: "over-property" as const };
  }
  if (income >= cfg.maxIncome) {
   return { income, property, baseBenefit: 0, finalBenefit: 0, status: "over-income" as const };
  }

  const base = calcBenefit(income, cfg);
  const reduced = property >= PROPERTY_THRESHOLD ? base * 0.5 : base;
  return { income, property, baseBenefit: base, finalBenefit: reduced, status: "eligible" as const };
 }, [incomeInput, propertyInput, cfg]);

 const isPropertyReduced = property >= PROPERTY_THRESHOLD && property < PROPERTY_MAX;

 const formatWon = (v: number) => Math.round(v).toLocaleString("ko-KR");

 const phaseLabel = (() => {
  if (status !== "eligible" || income === 0) return null;
  if (income <= cfg.peakStart) return "점증구간";
  if (income <= cfg.peakEnd) return "평탄구간 (최대 지급)";
  return "점감구간";
 })();

 return (
  <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
   {/* Hero */}
   <div className="text-center space-y-2">
    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
     <Gift size={15} />
     2026년 근로장려금 계산기
    </div>
    <h1 className="text-2xl font-bold text-navy">
     근로장려금 수령액<br />
     <span className="text-electric">즉시 계산</span>
    </h1>
    <p className="text-sm text-muted-blue">
     가구 유형 + 연간 소득 입력 → 예상 지급액 자동 계산
    </p>
   </div>

   <HomeTopAd />

   {/* Calculator Card */}
   <div className="bg-white rounded-2xl border border-canvas-200 shadow-sm p-6 space-y-5">
    {/* Household Type */}
    <div className="space-y-2">
     <label className="text-sm font-semibold text-navy">가구 유형</label>
     <div className="grid grid-cols-3 gap-2">
      {(Object.keys(HOUSEHOLD_CONFIGS) as HouseholdType[]).map((type) => {
       const c = HOUSEHOLD_CONFIGS[type];
       return (
        <button
         key={type}
         onClick={() => setHousehold(type)}
         className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
          household === type
           ? "border-electric bg-electric-5 text-electric"
           : "border-canvas-200 text-muted-blue hover:border-electric-30"
         }`}
        >
         {c.icon}
         <span>{c.label}</span>
        </button>
       );
      })}
     </div>
     <p className="text-xs text-muted-blue bg-canvas rounded-lg px-3 py-2">
      {cfg.description}
     </p>
    </div>

    {/* Annual Income */}
    <div className="space-y-1">
     <label className="text-sm font-semibold text-navy">
      연간 총소득 <span className="text-muted-blue font-normal">(만원)</span>
     </label>
     <div className="relative">
      <input
       type="number"
       value={incomeInput}
       onChange={(e) => setIncomeInput(e.target.value)}
       min={0}
       max={cfg.maxIncome}
       placeholder="예: 2400"
       className="w-full px-4 py-3 pr-12 rounded-xl border border-canvas-200 text-navy font-semibold focus:outline-none focus:border-electric text-base"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue text-sm">만원</span>
     </div>
     <div className="flex justify-between text-xs text-muted-blue px-1">
      <span>소득 상한: {formatWon(cfg.maxIncome)}만원</span>
      <span>최대 지급 구간: {formatWon(cfg.peakStart)}~{formatWon(cfg.peakEnd)}만원</span>
     </div>
    </div>

    {/* Property */}
    <div className="space-y-1">
     <label className="text-sm font-semibold text-navy">
      가구원 합산 재산 <span className="text-muted-blue font-normal">(만원)</span>
     </label>
     <div className="relative">
      <input
       type="number"
       value={propertyInput}
       onChange={(e) => setPropertyInput(e.target.value)}
       min={0}
       placeholder="예: 8000"
       className="w-full px-4 py-3 pr-12 rounded-xl border border-canvas-200 text-navy font-semibold focus:outline-none focus:border-electric text-base"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue text-sm">만원</span>
     </div>
     <p className="text-xs text-muted-blue px-1">
      토지·건물·자동차·금융재산 합산 / 2억 4천만원 미만이어야 신청 가능
     </p>
    </div>

    {/* Result */}
    <div className={`rounded-xl p-5 space-y-3 ${
     status === "eligible" && finalBenefit > 0
      ? "bg-green-50 border border-green-200"
      : "bg-red-50 border border-red-200"
    }`}>
     {status === "over-property" && (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
       <AlertCircle size={18} />
       재산 2억 4천만원 이상 — 지급 대상 제외
      </div>
     )}
     {status === "over-income" && (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
       <AlertCircle size={18} />
       소득 초과 — {cfg.label} 지급 대상 아님
      </div>
     )}
     {status === "eligible" && finalBenefit <= 0 && income > 0 && (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
       <AlertCircle size={18} />
       소득 구간 초과 — 지급액 없음
      </div>
     )}
     {status === "eligible" && finalBenefit > 0 && (
      <>
       <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-green-800">예상 지급액</span>
        {phaseLabel && (
         <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
          {phaseLabel}
         </span>
        )}
       </div>
       <div className="text-3xl font-bold text-green-700">
        {formatWon(finalBenefit)}<span className="text-lg font-semibold">만원</span>
       </div>
       {isPropertyReduced && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
         <AlertCircle size={13} />
         재산 1억7천만원 이상 → 50% 감액 적용 (기준액 {formatWon(baseBenefit)}만원)
        </div>
       )}
       <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-white rounded-lg p-3 text-center">
         <div className="text-xs text-muted-blue">이번 달 신청 시</div>
         <div className="text-base font-bold text-navy">{formatWon(finalBenefit / 2)}만원</div>
         <div className="text-xs text-muted-blue">반기 지급</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
         <div className="text-xs text-muted-blue">5월 정기 신청 시</div>
         <div className="text-base font-bold text-navy">{formatWon(finalBenefit)}만원</div>
         <div className="text-xs text-muted-blue">연간 일시 지급</div>
        </div>
       </div>
      </>
     )}
     {status === "eligible" && income === 0 && (
      <div className="text-sm text-muted-blue text-center py-2">
       위에 소득을 입력하면 예상 지급액을 계산합니다
      </div>
     )}
    </div>
   </div>

   <InArticleAd />

   {/* Payout Structure Table */}
   <div className="bg-white rounded-2xl border border-canvas-200 shadow-sm p-6 space-y-4">
    <h2 className="text-lg font-bold text-navy flex items-center gap-2">
     <Gift size={18} className="text-electric" />
     2026년 가구 유형별 지급액 구조
    </h2>
    <div className="overflow-x-auto">
     <table className="w-full text-sm border-collapse">
      <thead>
       <tr className="bg-canvas text-navy">
        <th className="text-left px-3 py-2.5 rounded-tl-lg font-semibold">가구 유형</th>
        <th className="text-right px-3 py-2.5 font-semibold">소득 상한</th>
        <th className="text-right px-3 py-2.5 font-semibold">평탄구간</th>
        <th className="text-right px-3 py-2.5 rounded-tr-lg font-semibold">최대 지급</th>
       </tr>
      </thead>
      <tbody>
       {(Object.keys(HOUSEHOLD_CONFIGS) as HouseholdType[]).map((type, i) => {
        const c = HOUSEHOLD_CONFIGS[type];
        return (
         <tr key={type} className={`border-t border-canvas-100 ${household === type ? "bg-electric-5" : ""}`}>
          <td className="px-3 py-3 font-semibold text-navy">{c.label}</td>
          <td className="px-3 py-3 text-right text-muted-blue">{formatWon(c.maxIncome)}만원</td>
          <td className="px-3 py-3 text-right text-muted-blue">{formatWon(c.peakStart)}~{formatWon(c.peakEnd)}만원</td>
          <td className="px-3 py-3 text-right font-bold text-electric">{formatWon(c.maxBenefit)}만원</td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
    <div className="text-xs text-muted-blue bg-canvas rounded-lg px-3 py-2 space-y-1">
     <p>• 재산 1억 7천만원 이상 2억 4천만원 미만: 지급액 50% 감액</p>
     <p>• 재산 2억 4천만원 이상: 지급 불가</p>
     <p>• 자녀장려금(18세 미만 자녀 1인당 최대 100만원)과 중복 수급 가능</p>
    </div>
   </div>

   {/* Eligibility */}
   <div className="bg-white rounded-2xl border border-canvas-200 shadow-sm p-6 space-y-4">
    <h2 className="text-lg font-bold text-navy flex items-center gap-2">
     <CheckCircle2 size={18} className="text-electric" />
     신청 자격 요건
    </h2>
    <div className="space-y-2">
     {ELIGIBILITY_CHECKS.map((item, i) => (
      <div key={i} className="flex items-start gap-3 p-3 bg-canvas rounded-xl">
       <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
       <div>
        <div className="text-sm font-semibold text-navy">{item.label}</div>
        <div className="text-xs text-muted-blue">{item.value}</div>
       </div>
      </div>
     ))}
    </div>
   </div>

   <CoupangBanner />

   {/* Application Steps */}
   <div className="bg-white rounded-2xl border border-canvas-200 shadow-sm p-6 space-y-4">
    <h2 className="text-lg font-bold text-navy flex items-center gap-2">
     <Calendar size={18} className="text-electric" />
     신청 방법 4단계
    </h2>
    <div className="space-y-3">
     {APPLY_STEPS.map((s) => (
      <div key={s.step} className="flex gap-4 items-start">
       <div className="flex-shrink-0 w-9 h-9 rounded-full bg-electric text-white text-xs font-bold flex items-center justify-center">
        {s.step}
       </div>
       <div>
        <div className="text-sm font-semibold text-navy">{s.title}</div>
        <div className="text-xs text-muted-blue mt-0.5">{s.desc}</div>
       </div>
      </div>
     ))}
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-1">
     <p className="font-semibold">기한 후 신청 (5월 이후 ~ 11월 30일)</p>
     <p>지급액의 10% 감액 적용. 최대한 5월 정기 신청을 활용하세요.</p>
    </div>
   </div>

   <GuideMidAd />

   {/* FAQ */}
   <div className="bg-white rounded-2xl border border-canvas-200 shadow-sm p-6 space-y-3">
    <h2 className="text-lg font-bold text-navy">자주 묻는 질문</h2>
    {FAQ_LIST.map((item, i) => (
     <div key={i} className="border border-canvas-200 rounded-xl overflow-hidden">
      <button
       onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
       className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-canvas transition-colors"
      >
       <span className="text-sm font-semibold text-navy pr-4">{item.q}</span>
       {expandedFaq === i
        ? <ChevronUp size={16} className="text-muted-blue flex-shrink-0" />
        : <ChevronDown size={16} className="text-muted-blue flex-shrink-0" />
       }
      </button>
      {expandedFaq === i && (
       <div className="px-4 pb-4 text-sm text-muted-blue leading-relaxed border-t border-canvas-100 pt-3">
        {item.a}
       </div>
      )}
     </div>
    ))}
   </div>

   {/* Related Links */}
   <div className="bg-canvas rounded-2xl p-5 space-y-3">
    <h3 className="text-sm font-bold text-navy">관련 계산기 · 가이드</h3>
    <div className="grid grid-cols-2 gap-2">
     {[
      { label: "실업급여 계산기", href: "/unemployment-benefit" },
      { label: "육아휴직 급여 계산기", href: "/parental-leave" },
      { label: "연봉 실수령액 계산기", href: "/?tab=salary" },
      { label: "연말정산 계산기", href: "/year-end-tax" },
      { label: "근로장려금 완벽 가이드", href: "/guides/earned-income-credit-2026" },
      { label: "청년 지원 정책 총정리", href: "/guides/youth-benefits-2026" },
     ].map((link) => (
      <Link
       key={link.href}
       href={link.href}
       className="flex items-center gap-1.5 text-xs font-semibold text-electric hover:underline"
      >
       <ExternalLink size={12} />
       {link.label}
      </Link>
     ))}
    </div>
   </div>
  </div>
 );
}
