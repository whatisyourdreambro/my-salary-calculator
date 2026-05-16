"use client";

import { useState, useMemo } from "react";
import { InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
 Calculator,
 CheckCircle2,
 AlertCircle,
 Clock,
 Banknote,
 ChevronDown,
 ChevronUp,
 ExternalLink,
 Info,
 HelpCircle,
} from "lucide-react";

const formatNumber = (n: number) => Math.round(n).toLocaleString("ko-KR");
const parseNumber = (s: string) => Number(s.replace(/,/g, "")) || 0;

const AGE_GROUPS = [
 { label: "50세 미만", value: "under50" },
 { label: "50세 이상 / 장애인", value: "over50" },
] as const;

type AgeGroup = (typeof AGE_GROUPS)[number]["value"];

const INSURANCE_PERIODS = [
 { label: "1년 미만 (12개월 미만)", days: { under50: 120, over50: 150 } },
 { label: "1년 이상 ~ 3년 미만", days: { under50: 150, over50: 180 } },
 { label: "3년 이상 ~ 5년 미만", days: { under50: 180, over50: 210 } },
 { label: "5년 이상 ~ 10년 미만", days: { under50: 210, over50: 240 } },
 { label: "10년 이상", days: { under50: 240, over50: 270 } },
] as const;

const MIN_WAGE_2026 = 10320;
const DAILY_UPPER_LIMIT = 66000;

interface FaqItem {
 q: string;
 a: string;
}

const FAQ: FaqItem[] = [
 {
  q: "자진 퇴사해도 실업급여를 받을 수 있나요?",
  a: "원칙적으로 비자발적 퇴사여야 하지만, 임금 체불(2개월 이상), 직장 내 괴롭힘·성희롱 피해, 통근 불가(왕복 3시간 이상), 건강 악화, 배우자 이직으로 인한 이사 등 정당한 사유가 있으면 자진 퇴사도 수급 자격이 인정됩니다.",
 },
 {
  q: "고용보험 180일 계산 방법은?",
  a: "퇴직일 이전 18개월 동안 고용보험에 가입한 총 날수입니다. 일용직이라면 근무일 수, 상용직이라면 월 단위로 계산됩니다. 1개월 = 30일로 환산합니다.",
 },
 {
  q: "실업급여 신청 기한이 있나요?",
  a: "퇴직일 다음 날부터 12개월이 수급 기간입니다. 이 기간이 지나면 미사용 급여는 소멸합니다. 퇴직 직후 최대한 빨리 신청하는 것이 유리합니다.",
 },
 {
  q: "알바나 프리랜서 소득이 생기면 신고해야 하나요?",
  a: "주 15시간 이상 또는 월 60만원 초과 소득이 생기면 고용센터에 즉시 신고해야 합니다. 신고하면 해당 날의 급여만 차감되고 지급 기간은 연장됩니다. 미신고 시 부정수급으로 전액 반환 + 추가 징수됩니다.",
 },
 {
  q: "조기재취업수당은 언제 신청하나요?",
  a: "재취업일 다음 날부터 12개월 이내에 가까운 고용센터에 신청해야 합니다. 잔여 급여 일수가 30일 이상 남아 있고, 취업 후 6개월 이상 근무를 예정한 경우에 해당합니다.",
 },
];

export default function UnemploymentBenefitContent() {
 const [monthlyWage, setMonthlyWage] = useState("3000000");
 const [workHoursPerDay, setWorkHoursPerDay] = useState("8");
 const [ageGroup, setAgeGroup] = useState<AgeGroup>("under50");
 const [periodIdx, setPeriodIdx] = useState(1);
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 const result = useMemo(() => {
  const wage = parseNumber(monthlyWage);
  const hoursPerDay = parseNumber(workHoursPerDay);
  if (wage <= 0 || hoursPerDay <= 0) return null;

  const dailyWage = wage / 30;
  const dailyBenefit = dailyWage * 0.6;

  const lowerLimit = MIN_WAGE_2026 * 0.8 * hoursPerDay;
  const clampedDailyBenefit = Math.min(
   Math.max(dailyBenefit, lowerLimit),
   DAILY_UPPER_LIMIT
  );

  const paymentDays = INSURANCE_PERIODS[periodIdx].days[ageGroup];
  const totalBenefit = clampedDailyBenefit * paymentDays;
  const monthlyBenefit = clampedDailyBenefit * 30;

  return {
   dailyBenefit: clampedDailyBenefit,
   paymentDays,
   totalBenefit,
   monthlyBenefit,
   isUpperLimit: clampedDailyBenefit >= DAILY_UPPER_LIMIT,
   isLowerLimit: dailyBenefit < lowerLimit,
  };
 }, [monthlyWage, workHoursPerDay, ageGroup, periodIdx]);

 return (
  <div className="max-w-3xl mx-auto px-4 py-8">
   {/* 헤더 */}
   <div className="text-center mb-8">
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
     <Banknote className="w-4 h-4" />
     2026년 최신 기준
    </div>
    <h1 className="text-3xl font-bold text-foreground mb-3">
     실업급여 계산기
    </h1>
    <p className="text-muted-foreground text-base">
     월급과 고용보험 가입 기간을 입력하면 예상 수령액을 즉시 계산합니다.
    </p>
   </div>

   {/* 계산기 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
    <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
     <Calculator className="w-5 h-5 text-primary" />
     실업급여 예상 수령액 계산
    </h2>

    <div className="space-y-5">
     {/* 월 평균임금 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       퇴직 전 월 평균임금 (세전)
      </label>
      <div className="relative">
       <input
        type="text"
        value={Number(monthlyWage).toLocaleString("ko-KR")}
        onChange={(e) =>
         setMonthlyWage(String(parseNumber(e.target.value)))
        }
        className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-right text-lg font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="3,000,000"
       />
       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        원
       </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
       퇴직 전 3개월 평균 월 급여 (세전 기준)
      </p>
     </div>

     {/* 1일 소정근로시간 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       1일 소정근로시간
      </label>
      <div className="flex gap-2">
       {[4, 5, 6, 7, 8].map((h) => (
        <button
         key={h}
         onClick={() => setWorkHoursPerDay(String(h))}
         className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          workHoursPerDay === String(h)
           ? "bg-primary text-primary-foreground border-primary"
           : "bg-background border-border hover:border-primary/50 text-foreground"
         }`}
        >
         {h}시간
        </button>
       ))}
      </div>
     </div>

     {/* 나이 구분 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       나이 구분
      </label>
      <div className="grid grid-cols-2 gap-3">
       {AGE_GROUPS.map((ag) => (
        <button
         key={ag.value}
         onClick={() => setAgeGroup(ag.value)}
         className={`py-3 rounded-xl text-sm font-medium border transition-all ${
          ageGroup === ag.value
           ? "bg-primary text-primary-foreground border-primary"
           : "bg-background border-border hover:border-primary/50 text-foreground"
         }`}
        >
         {ag.label}
        </button>
       ))}
      </div>
     </div>

     {/* 고용보험 가입 기간 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       고용보험 가입 기간
      </label>
      <div className="space-y-2">
       {INSURANCE_PERIODS.map((p, i) => (
        <button
         key={i}
         onClick={() => setPeriodIdx(i)}
         className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all ${
          periodIdx === i
           ? "bg-primary/5 border-primary text-primary font-medium"
           : "bg-background border-border hover:border-primary/30 text-foreground"
         }`}
        >
         <span>{p.label}</span>
         <span className="font-bold">
          {p.days[ageGroup]}일
         </span>
        </button>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* 결과 */}
   {result && (
    <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6 mb-6">
     <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5" />
      예상 실업급여 수령액
     </h2>

     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div className="bg-background rounded-xl p-4 text-center border border-border">
       <p className="text-xs text-muted-foreground mb-1">1일 구직급여액</p>
       <p className="text-2xl font-bold text-primary">
        {formatNumber(result.dailyBenefit)}원
       </p>
       {result.isUpperLimit && (
        <p className="text-xs text-orange-500 mt-1">상한액 적용</p>
       )}
       {result.isLowerLimit && (
        <p className="text-xs text-blue-500 mt-1">하한액 적용</p>
       )}
      </div>
      <div className="bg-background rounded-xl p-4 text-center border border-border">
       <p className="text-xs text-muted-foreground mb-1">월 예상 수령액</p>
       <p className="text-2xl font-bold text-foreground">
        {formatNumber(result.monthlyBenefit)}원
       </p>
       <p className="text-xs text-muted-foreground mt-1">
        ({result.paymentDays}일 ÷ 30 × 30일)
       </p>
      </div>
      <div className="bg-background rounded-xl p-4 text-center border border-border">
       <p className="text-xs text-muted-foreground mb-1">총 지급액 ({result.paymentDays}일)</p>
       <p className="text-2xl font-bold text-foreground">
        {formatNumber(result.totalBenefit)}원
       </p>
      </div>
     </div>

     <div className="bg-background/70 rounded-xl p-4 text-sm text-muted-foreground">
      <p className="flex items-start gap-2">
       <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
       2026년 기준: 상한 일 66,000원, 하한 최저임금(10,320원)의 80% × 1일 소정근로시간.
       신청 후 7일 대기기간이 있어 첫 지급은 약 3주 후 시작됩니다.
      </p>
     </div>
    </section>
   )}

   <InArticleAd />

   {/* 신청 조건 안내 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
     <CheckCircle2 className="w-5 h-5 text-green-500" />
     실업급여 신청 조건
    </h2>
    <div className="space-y-3">
     {[
      {
       icon: "①",
       title: "비자발적 퇴사",
       desc: "해고, 권고사직, 계약 만료, 정년퇴직 등. 자진 퇴사도 정당한 사유가 있으면 가능.",
      },
      {
       icon: "②",
       title: "고용보험 180일 이상",
       desc: "퇴직 전 18개월 중 고용보험 피보험 기간이 180일 이상이어야 합니다.",
      },
      {
       icon: "③",
       title: "근로 의지 및 구직활동",
       desc: "일할 능력과 의지가 있으며 적극적으로 재취업 활동을 해야 합니다.",
      },
     ].map((item) => (
      <div
       key={item.icon}
       className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl"
      >
       <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
        {item.icon}
       </span>
       <div>
        <p className="font-medium text-sm">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
       </div>
      </div>
     ))}
    </div>
   </section>

   {/* 자진 퇴사 예외 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
     <AlertCircle className="w-5 h-5 text-orange-500" />
     자진 퇴사도 받을 수 있는 예외 조건
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     {[
      "임금 체불 (2개월 이상)",
      "직장 내 괴롭힘·성희롱 피해",
      "통근 불가 (왕복 3시간 이상)",
      "건강 악화로 현 직무 수행 불가",
      "배우자 이직으로 원거리 이사",
      "부양가족 간호 (30일 이상)",
      "사업장 이전·축소",
      "최저임금 미달 임금",
     ].map((item) => (
      <div
       key={item}
       className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl text-sm border border-orange-200 dark:border-orange-900/30"
      >
       <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
       {item}
      </div>
     ))}
    </div>
   </section>

   {/* 신청 절차 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
     <Clock className="w-5 h-5 text-primary" />
     실업급여 신청 절차
    </h2>
    <div className="space-y-3">
     {[
      {
       step: "STEP 1",
       title: "이직확인서 제출 요청",
       desc: "회사에 고용보험 EDI 이직확인서 제출 요청. 지연 시 고용노동부(1350) 신고.",
      },
      {
       step: "STEP 2",
       title: "수급자격 신청",
       desc: "퇴직일 다음 날부터 12개월 이내. 고용24(work24.go.kr) 온라인 또는 고용센터 방문.",
      },
      {
       step: "STEP 3",
       title: "취업특강 수강",
       desc: "1회 필수 수강. 온라인 또는 오프라인 모두 가능. 수강 후 대기기간 7일.",
      },
      {
       step: "STEP 4",
       title: "구직활동 및 실업인정",
       desc: "4주마다 구직활동 2회 이상 증명. 온라인 신고 가능. 인정 후 급여 지급.",
      },
     ].map((item, i) => (
      <div key={i} className="flex gap-4 items-start">
       <div className="w-20 shrink-0">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
         {item.step}
        </span>
       </div>
       <div className="flex-1 pb-3 border-b border-border last:border-0">
        <p className="font-medium text-sm">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
       </div>
      </div>
     ))}
    </div>
   </section>

   <CoupangBanner />

   {/* FAQ */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
     <HelpCircle className="w-5 h-5 text-primary" />
     자주 묻는 질문
    </h2>
    <div className="space-y-2">
     {FAQ.map((item, i) => (
      <div key={i} className="border border-border rounded-xl overflow-hidden">
       <button
        onClick={() => setOpenFaq(openFaq === i ? null : i)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-secondary/30 transition-colors"
       >
        <span>{item.q}</span>
        {openFaq === i ? (
         <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
         <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
       </button>
       {openFaq === i && (
        <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
         {item.a}
        </div>
       )}
      </div>
     ))}
    </div>
   </section>

   {/* 관련 링크 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4">관련 링크</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     {[
      {
       title: "고용24 실업급여 신청",
       desc: "온라인 신청 바로가기",
       href: "https://www.work24.go.kr",
       external: true,
      },
      {
       title: "워크넷 구직 등록",
       desc: "구직활동 증빙용 이력서 등록",
       href: "https://www.work.go.kr",
       external: true,
      },
      {
       title: "실업급여 완벽 가이드",
       desc: "조건·신청 방법 상세 안내",
       href: "/guides/unemployment-benefits-complete",
       external: false,
      },
      {
       title: "퇴직금 계산기",
       desc: "퇴직금 수령액 계산",
       href: "/?tab=severance",
       external: false,
      },
     ].map((link) => (
      <a
       key={link.title}
       href={link.href}
       target={link.external ? "_blank" : "_self"}
       rel={link.external ? "noopener noreferrer" : undefined}
       className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors group"
      >
       <div>
        <p className="font-medium text-sm">{link.title}</p>
        <p className="text-xs text-muted-foreground">{link.desc}</p>
       </div>
       <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </a>
     ))}
    </div>
   </section>

   <InArticleAd />
  </div>
 );
}
