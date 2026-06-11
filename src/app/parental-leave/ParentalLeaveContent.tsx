"use client";

import { useState, useMemo } from "react";
import { InArticleAd, GuideMidAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import {
 Baby,
 Calculator,
 CheckCircle2,
 ChevronDown,
 ChevronUp,
 ExternalLink,
 HelpCircle,
 Info,
 Star,
 Users,
} from "lucide-react";

const formatNumber = (n: number) => Math.round(n).toLocaleString("ko-KR");
const parseNumber = (s: string) => Number(s.replace(/,/g, "")) || 0;

// 6+6 부모 육아휴직: 첫 6개월 통상임금 100%, 상한 월 250→450만원 (2025 개편: 첫달 250만)
const MONTHS_6_6_LIMIT = [250, 250, 300, 350, 400, 450];

// 일반 육아휴직 (2025 개편, 사후지급금 폐지 — 매월 전액 지급)
// 1~3개월 100% (상한 250만) / 4~6개월 100% (상한 200만) / 7개월~ 80% (상한 160만)
function getGeneralBenefit(month: number) {
 if (month <= 3) return { rate: 1.0, limit: 2_500_000 };
 if (month <= 6) return { rate: 1.0, limit: 2_000_000 };
 return { rate: 0.8, limit: 1_600_000 };
}

interface FaqItem {
 q: string;
 a: string;
}

const FAQ: FaqItem[] = [
 {
  q: "6+6 부모 육아휴직, 부모가 동시에 써야 하나요?",
  a: "동시에 사용하거나 순차적으로 사용해도 됩니다. 단, 자녀가 생후 18개월이 되기 전까지 사용 기간이 포함되어야 합니다. 아빠가 먼저 사용 후 엄마가 사용해도 각자 6+6 혜택이 적용됩니다.",
 },
 {
  q: "육아휴직 급여 사후지급금(25%)이 아직 있나요?",
  a: "아니요. 2025년 개편으로 사후지급금 제도가 폐지되어 매월 급여 전액이 당월 지급됩니다. 복직 후 별도로 청구할 금액이 없습니다.",
 },
 {
  q: "육아기 근로시간 단축제도는 뭔가요?",
  a: "만 8세 이하 자녀를 둔 근로자가 주 15~35시간으로 줄여 일하는 제도입니다. 단축한 시간 중 주 5시간까지는 통상임금 100%를 고용보험에서 지원합니다. 자녀 1명당 최대 2년 사용 가능합니다.",
 },
 {
  q: "계약직·기간제인데 육아휴직이 가능한가요?",
  a: "고용보험 가입 기간 180일만 충족하면 계약직도 육아휴직을 신청할 수 있습니다. 단, 육아휴직 중 계약이 만료되면 연장 의무는 없습니다.",
 },
 {
  q: "배우자 출산휴가는 얼마나 되나요?",
  a: "배우자(남성 근로자)는 출산일로부터 120일 이내에 20일의 유급 배우자 출산휴가를 사용할 수 있습니다(2025년 개편으로 10일→20일 확대). 120일 이내 3회 분할 사용도 가능합니다.",
 },
];

export default function ParentalLeaveContent() {
 const [monthlyWage, setMonthlyWage] = useState("4000000");
 const [useParents, setUseParents] = useState(true);
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 const result = useMemo(() => {
  const wage = parseNumber(monthlyWage);
  if (wage <= 0) return null;

  const months = [];

  if (useParents) {
   // 6+6: 첫 6개월은 통상임금 100%, 상한은 월별 다름 (250→450만원)
   for (let m = 1; m <= 6; m++) {
    const limit = MONTHS_6_6_LIMIT[m - 1] * 10000;
    const benefit = Math.min(wage, limit);
    const rateLabel = `100% (상한 ${MONTHS_6_6_LIMIT[m - 1]}만원)`;
    months.push({ month: m, benefit, rateLabel, label: `${m}개월`, is6Plus6: true });
   }
  }

  // 일반 구간 (2025 개편): 1~3개월 100%(상한 250만) / 4~6개월 100%(상한 200만) / 7개월~ 80%(상한 160만)
  const startMonth = useParents ? 7 : 1;
  for (let m = startMonth; m <= 12; m++) {
   const { rate, limit } = getGeneralBenefit(m);
   const benefit = Math.min(wage * rate, limit);
   const rateLabel = `${Math.round(rate * 100)}% (상한 ${limit / 10000}만원)`;
   months.push({ month: m, benefit, rateLabel, label: `${m}개월`, is6Plus6: false });
  }

  const total6Plus6 = months.filter(m => m.is6Plus6).reduce((s, m) => s + m.benefit, 0);
  const totalGeneral = months.filter(m => !m.is6Plus6).reduce((s, m) => s + m.benefit, 0);
  const grandTotal = total6Plus6 + totalGeneral;

  return { months, total6Plus6, totalGeneral, grandTotal };
 }, [monthlyWage, useParents]);

 return (
  <div className="max-w-3xl mx-auto px-4 py-8">
   {/* 헤더 */}
   <div className="text-center mb-8">
    <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
     <Baby className="w-4 h-4" />
     2026년 최신 기준
    </div>
    <h1 className="text-3xl font-bold text-foreground mb-3">
     육아휴직 급여 계산기
    </h1>
    <p className="text-muted-foreground text-base">
     통상임금을 입력하면 월별 육아휴직 급여를 즉시 계산합니다.
    </p>
   </div>

   <HomeTopAd />

   {/* 계산기 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
    <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
     <Calculator className="w-5 h-5 text-primary" />
     육아휴직 급여 예상 계산
    </h2>

    <div className="space-y-5">
     {/* 통상임금 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       월 통상임금 (세전)
      </label>
      <div className="relative">
       <input
        type="text"
        value={Number(monthlyWage).toLocaleString("ko-KR")}
        onChange={(e) =>
         setMonthlyWage(String(parseNumber(e.target.value)))
        }
        className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-right text-lg font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="4,000,000"
       />
       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        원
       </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
       통상임금 = 기본급 + 고정 수당 (식대, 교통비 등 포함)
      </p>
     </div>

     {/* 6+6 부모 육아휴직 여부 */}
     <div>
      <label className="block text-sm font-medium text-foreground mb-2">
       부모 모두 육아휴직 사용 여부
      </label>
      <div className="grid grid-cols-2 gap-3">
       <button
        onClick={() => setUseParents(true)}
        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
         useParents
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-border hover:border-primary/50 text-foreground"
        }`}
       >
        <Users className="w-4 h-4 inline mr-1.5" />
        6+6 (부모 모두 사용)
       </button>
       <button
        onClick={() => setUseParents(false)}
        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
         !useParents
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-border hover:border-primary/50 text-foreground"
        }`}
       >
        일반 (1인만 사용)
       </button>
      </div>
      {useParents && (
       <p className="text-xs text-primary mt-2 bg-primary/5 px-3 py-2 rounded-lg">
        생후 18개월 이내 자녀 대상. 첫 6개월 통상임금 100% 지급 (상한 월 250만원에서 시작, 최대 월 450만원)
       </p>
      )}
     </div>
    </div>
   </section>

   {/* 결과 */}
   {result && (
    <>
     {/* 요약 */}
     <section className="bg-gradient-to-br from-pink-500/10 to-primary/5 rounded-2xl border border-pink-200 dark:border-pink-900/30 p-6 mb-6">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
       <CheckCircle2 className="w-5 h-5 text-pink-500" />
       예상 육아휴직 급여 (12개월 합산)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       {useParents && (
        <div className="bg-background rounded-xl p-4 text-center border border-pink-200 dark:border-pink-900/30">
         <p className="text-xs text-muted-foreground mb-1">6+6 기간 합계 (6개월)</p>
         <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
          {formatNumber(result.total6Plus6)}원
         </p>
        </div>
       )}
       <div className="bg-background rounded-xl p-4 text-center border border-border">
        <p className="text-xs text-muted-foreground mb-1">
         일반 기간 합계 ({useParents ? 6 : 12}개월)
        </p>
        <p className="text-2xl font-bold text-foreground">
         {formatNumber(result.totalGeneral)}원
        </p>
       </div>
       <div className="bg-background rounded-xl p-4 text-center border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">12개월 총 합계</p>
        <p className="text-2xl font-bold text-primary">
         {formatNumber(result.grandTotal)}원
        </p>
       </div>
      </div>
     </section>

     {/* 월별 상세 */}
     <section className="bg-card rounded-2xl border border-border p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">월별 급여 상세</h2>
      <div className="space-y-2">
       {result.months.map((m) => (
        <div
         key={m.month}
         className={`flex items-center justify-between p-3 rounded-xl text-sm ${
          m.is6Plus6
           ? "bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/30"
           : "bg-secondary/30 border border-border"
         }`}
        >
         <div className="flex items-center gap-2">
          {m.is6Plus6 && (
           <Star className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          )}
          <span className="font-medium">
           {m.label}
           {m.is6Plus6 && (
            <span className="ml-1.5 text-xs text-pink-500 font-bold">6+6</span>
           )}
          </span>
         </div>
         <div className="text-right">
          <p className="font-bold">{formatNumber(m.benefit)}원</p>
          <p className="text-xs text-muted-foreground">통상임금 {m.rateLabel}</p>
         </div>
        </div>
       ))}
      </div>
      <div className="mt-4 p-3 bg-secondary/30 rounded-xl text-xs text-muted-foreground flex items-start gap-2">
       <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
       <span>
        2025년 개편으로 사후지급금이 폐지되어 매월 급여 전액이 당월 지급됩니다.
        상한: 1~3개월 250만 / 4~6개월 200만 / 7개월부터 160만 (6+6은 첫 6개월 최대
        250~450만원). 하한: 월 70만원. 휴직 기간은 부모 각각 3개월 이상 사용 등 조건
        충족 시 최대 1년 6개월까지 연장됩니다.
       </span>
      </div>
     </section>
    </>
   )}

   <InArticleAd />

   {/* 비교표 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4">출산·육아 관련 제도 비교</h2>
    <div className="overflow-x-auto">
     <table className="w-full text-sm border-collapse min-w-[400px]">
      <thead>
       <tr className="bg-secondary/50">
        <th className="p-3 text-left font-medium">구분</th>
        <th className="p-3 text-center font-medium">기간</th>
        <th className="p-3 text-right font-medium">급여</th>
       </tr>
      </thead>
      <tbody>
       <tr className="border-t border-border">
        <td className="p-3">출산전후휴가</td>
        <td className="p-3 text-center">90일 (다태아 120일)</td>
        <td className="p-3 text-right">통상임금 100%<br /><span className="text-xs text-muted-foreground">상한 월 210만원</span></td>
       </tr>
       <tr className="border-t border-border">
        <td className="p-3">배우자 출산휴가</td>
        <td className="p-3 text-center">20일 (유급, 3회 분할 가능)</td>
        <td className="p-3 text-right">통상임금 100%</td>
       </tr>
       <tr className="border-t border-border bg-pink-50 dark:bg-pink-950/10">
        <td className="p-3 font-medium">
         육아휴직 (6+6)
         <span className="ml-1 text-xs text-pink-500 font-bold">NEW</span>
        </td>
        <td className="p-3 text-center">첫 6개월</td>
        <td className="p-3 text-right">통상임금 100%<br /><span className="text-xs text-pink-500">상한 최대 월 450만원</span></td>
       </tr>
       <tr className="border-t border-border">
        <td className="p-3">육아휴직 (일반)</td>
        <td className="p-3 text-center">최대 1년 6개월<br /><span className="text-xs text-muted-foreground">(부모 각 3개월+ 사용 등 조건부)</span></td>
        <td className="p-3 text-right">1~6개월 100%, 7개월~ 80%<br /><span className="text-xs text-muted-foreground">상한 월 250→200→160만원</span></td>
       </tr>
       <tr className="border-t border-border">
        <td className="p-3">육아기 근로시간 단축</td>
        <td className="p-3 text-center">최대 2년</td>
        <td className="p-3 text-right">단축 5시간 100%<br /><span className="text-xs text-muted-foreground">나머지는 비례 지급</span></td>
       </tr>
      </tbody>
     </table>
    </div>
   </section>

   {/* 신청 방법 */}
   <section className="bg-card rounded-2xl border border-border p-6 mb-6">
    <h2 className="text-lg font-bold mb-4">육아휴직 신청 방법</h2>
    <div className="space-y-3">
     {[
      { step: "30일 전", title: "회사에 서면 신청", desc: "육아휴직 시작 30일 전까지 사용 기간, 자녀 정보를 포함하여 서면으로 신청." },
      { step: "시작 후", title: "고용24 급여 신청", desc: "육아휴직 시작 후 1개월 이내 고용24(work24.go.kr)에서 육아휴직 급여 신청." },
      { step: "매월", title: "급여 지급", desc: "매월 고용보험에서 급여 전액 지급 (2025년 개편으로 사후지급금 폐지)." },
     ].map((item, i) => (
      <div key={i} className="flex gap-4 items-start">
       <div className="shrink-0 w-16 text-center">
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
       title: "고용24 육아휴직 급여 신청",
       desc: "온라인 신청 바로가기",
       href: "https://www.work24.go.kr",
       external: true,
      },
      {
       title: "육아휴직 완벽 가이드",
       desc: "조건·신청 방법 상세 안내",
       href: "/guides/parental-leave-complete-guide",
       external: false,
      },
      {
       title: "실업급여 계산기",
       desc: "퇴직 후 실업급여 계산",
       href: "/unemployment-benefit",
       external: false,
      },
      {
       title: "연봉 실수령액 계산기",
       desc: "복직 후 실수령액 확인",
       href: "/calc",
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

   <GuideMidAd />
  </div>
 );
}
