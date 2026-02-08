import { Metadata } from "next";
import Link from "next/link";
import { calculateNetSalary } from "@/lib/calculator";
import AdUnit from "@/components/AdUnit";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Generate static params for popular salary ranges
export const dynamic = 'force-static';
export async function generateStaticParams() {
  const params = [];

  // 20m to 100m in 1m increments
  for (let i = 20; i <= 100; i++) {
    params.push({ amount: (i * 1000000).toString() });
  }

  // 105m to 200m in 5m increments
  for (let i = 105; i <= 200; i += 5) {
    params.push({ amount: (i * 1000000).toString() });
  }

  // Special popular amounts
  const specials = [
    24000000, 26000000, 28000000, 32000000, 35000000, 38000000, 42000000,
    45000000, 55000000, 65000000, 75000000, 85000000, 95000000,
  ];
  specials.forEach((s) => params.push({ amount: s.toString() }));

  return params;
}

type Props = {
  params: { amount: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = Number(params.amount);
  const formattedAmount = (amount / 10000).toLocaleString();
  const result = calculateNetSalary(amount, 200000 * 12, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  return {
    title: `2025년 연봉 ${formattedAmount}만원 실수령액은? (세금 포함) | Moneysalary`,
    description: `연봉 ${formattedAmount}만원의 월 예상 실수령액은 ${result.monthlyNet.toLocaleString()}원입니다. 4대보험, 소득세, 지방소득세 공제 내역을 확인하세요.`,
    alternates: {
      canonical: `https://moneysalary.com/salary/${params.amount}`,
    },
  };
}

export default function SalaryAmountPage({ params }: Props) {
  const amount = Number(params.amount);
  const result = calculateNetSalary(amount, 200000 * 12, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const monthlyAmount = Math.floor(amount / 12);
  const taxRate = ((result.totalDeduction / monthlyAmount) * 100).toFixed(1);

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
            <Calculator className="w-4 h-4" />
            <span>2025년 최신 세율 적용</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
            연봉 <span className="text-primary">{(amount / 10000).toLocaleString()}만원</span>의<br />
            월 실수령액은 얼마일까요?
          </h1>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-white/20 shadow-2xl">
            <p className="text-sm text-slate-300 mb-2">예상 월 실수령액</p>
            <p className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {result.monthlyNet.toLocaleString()}
              <span className="text-2xl sm:text-3xl font-medium ml-2 text-slate-300">원</span>
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm text-slate-300">
              <span>공제액 합계: -{result.totalDeduction.toLocaleString()}원</span>
              <span className="text-white/20">|</span>
              <span>실효세율: {taxRate}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-8">
        {/* Ad Unit 1 */}
        <AdUnit slotId="1234567890" format="auto" label="Salary Top Ad" />

        {/* Detailed Breakdown */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              급여 상세 내역
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">세전 월급</span>
              <span className="font-bold text-lg">{monthlyAmount.toLocaleString()}원</span>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-semibold text-muted-foreground mb-2">공제 내역 (4대보험 + 세금)</p>
              {[
                { label: "국민연금 (4.5%)", value: result.pension },
                { label: "건강보험 (3.545%)", value: result.health },
                { label: "장기요양 (12.95%)", value: result.longTermCare },
                { label: "고용보험 (0.9%)", value: result.employment },
                { label: "소득세 (간이세액)", value: result.incomeTax },
                { label: "지방소득세 (10%)", value: result.localTax },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {item.label}
                  </span>
                  <span className="font-medium text-red-500">-{item.value.toLocaleString()}원</span>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t-2 border-dashed border-border">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">최종 실수령액</span>
                <span className="font-black text-2xl text-primary">{result.monthlyNet.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Analysis: What can you buy? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-indigo-500" />
              저축 시뮬레이션
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">월 50% 저축 시</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {(result.monthlyNet * 0.5).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">1년 모으면</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {(result.monthlyNet * 0.5 * 12).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">1억 모으는데</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {(100000000 / (result.monthlyNet * 0.5)).toFixed(1)}개월
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              구매력 지수
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">치킨 (2만원)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  약 {Math.floor(result.monthlyNet / 20000)}마리
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">아이폰15 (125만원)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  약 {(result.monthlyNet / 1250000).toFixed(1)}대
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">스타벅스 (4500원)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  약 {Math.floor(result.monthlyNet / 4500)}잔
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Unit 2 */}
        <AdUnit slotId="0987654321" format="rectangle" label="Salary Middle Ad" />

        {/* CTA */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">내 상황에 딱 맞는 계산이 필요하신가요?</h3>
          <p className="text-muted-foreground mb-6">
            부양가족, 비과세액, 2026년 예상 실수령액 등 더 자세한 계산은<br />
            전문 계산기에서 확인해보세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <Calculator className="w-5 h-5" />
            정밀 계산기 바로가기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/table/2025/annual" className="p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors flex items-center justify-between group">
            <span className="font-medium">2025년 연봉 실수령액 표</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/fun/salary-slip" className="p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors flex items-center justify-between group">
            <span className="font-medium">월급 영수증 발급받기</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </main>
  );
}
