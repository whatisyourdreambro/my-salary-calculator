"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import CurrencyInput from "@/components/CurrencyInput";
import NumberStepper from "@/components/NumberStepper";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Beer, Plane, Rocket, BedDouble, DoorOpen, Palmtree,
  Download, CheckCheck, BookOpen,
} from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const parse = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const fmtStr = (n: number) => n.toLocaleString("ko-KR");

const calcTarget = (monthlyCost: number) => (monthlyCost * 12) / 0.04;

const calcYears = (
  currentAssets: number,
  monthlySaving: number,
  returnRate: number,
  targetAmount: number,
) => {
  if (currentAssets >= targetAmount) return 0;
  if (returnRate === 0) return (targetAmount - currentAssets) / (monthlySaving * 12);
  const r = returnRate / 100;
  const annual = monthlySaving * 12;
  let fv = currentAssets;
  let y = 0;
  while (fv < targetAmount && y < 100) { fv = fv * (1 + r) + annual; y++; }
  return y >= 100 ? Infinity : y;
};

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden relative">
    <motion.div
      className="h-full bg-gradient-to-r from-white/60 to-white/90 relative"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(percentage, 100)}%` }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    />
    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
      {percentage.toFixed(1)}%
    </div>
  </div>
);

export default function EscapePlanPage() {
  const [currentAssets, setCurrentAssets] = useState("50,000,000");
  const [monthlySaving, setMonthlySaving] = useState("1,500,000");
  const [monthlyCost, setMonthlyCost] = useState("3,000,000");
  const [returnRate, setReturnRate] = useState(8);
  const [toast, setToast] = useState<string | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const vals = useMemo(() => ({
    currentAssets: parse(currentAssets),
    monthlySaving: parse(monthlySaving),
    monthlyCost: parse(monthlyCost),
  }), [currentAssets, monthlySaving, monthlyCost]);

  const targetAmount = useMemo(() => calcTarget(vals.monthlyCost), [vals.monthlyCost]);
  const yearsToTarget = useMemo(
    () => calcYears(vals.currentAssets, vals.monthlySaving, returnRate, targetAmount),
    [vals, returnRate, targetAmount],
  );
  const progress = (vals.currentAssets / targetAmount) * 100;
  const escapeYear = new Date().getFullYear() + Math.floor(yearsToTarget);

  const funMetrics = [
    { name: "월요병",    value: Math.floor(yearsToTarget * 52),      icon: BedDouble, unit: "번" },
    { name: "아메리카노", value: Math.floor(yearsToTarget * 250 * 2), icon: Coffee,    unit: "잔" },
    { name: "야근 식대", value: Math.floor(yearsToTarget * 100),      icon: Beer,      unit: "번" },
    { name: "여름 휴가", value: Math.floor(yearsToTarget),            icon: Plane,     unit: "번" },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const shareTitle = () =>
    yearsToTarget === 0
      ? "🔥 나의 회사 탈출 계획: 지금 당장 탈출 가능!"
      : isFinite(yearsToTarget)
        ? `🔥 나의 회사 탈출 계획: ${yearsToTarget.toFixed(1)}년 후 (${escapeYear}년) 탈출!`
        : "🔥 나의 회사 탈출 계획 세우기";

  const captureResultImage = async (): Promise<Blob | null> => {
    if (!shareRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(shareRef.current, { scale: 2, useCORS: true });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const handleSaveImage = async () => {
    if (!shareRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareRef.current, { scale: 2, useCORS: true });
      const a = document.createElement("a");
      a.download = "my-fire-plan.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      showToast("이미지를 저장했어요!");
    } catch {
      showToast("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <main className="w-full min-h-screen bg-canvas text-navy font-sans pb-20">
      {/* Hero */}
      <section className="relative pt-28 pb-14 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-primary/80 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-500 to-primary/80 text-white mb-6 shadow-lg">
            <DoorOpen size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-navy">
            FREEDOM <span className="text-electric">DASHBOARD</span>
          </h1>
          <p className="text-lg text-faint-blue max-w-2xl mx-auto font-medium">
            회사 탈출까지 남은 시간을 계산하고, 당신만의 자유 계획을 세워보세요.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: 입력 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-canvas">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                현재 자산 현황
              </h2>
              <div className="space-y-6">
                <CurrencyInput
                  label="현재 모은 돈 (총 자산)"
                  value={currentAssets}
                  onValueChange={setCurrentAssets}
                  quickAmounts={[10000000, 50000000]}
                />
                <CurrencyInput
                  label="월 저축/투자 가능액"
                  value={monthlySaving}
                  onValueChange={setMonthlySaving}
                  quickAmounts={[1000000, 2000000]}
                />
                <CurrencyInput
                  label="은퇴 후 월 희망 생활비"
                  value={monthlyCost}
                  onValueChange={setMonthlyCost}
                  quickAmounts={[2000000, 3000000]}
                />
                <NumberStepper
                  label="예상 연평균 수익률"
                  value={returnRate}
                  onValueChange={setReturnRate}
                  unit="%"
                />
              </div>
            </div>
          </div>

          {/* Right: 결과 */}
          <div className="lg:col-span-7 space-y-6">

            {/* 캡처 영역 */}
            <div ref={shareRef} className="space-y-4">

              {/* Main Result Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#0145F2] to-[#0D5BFF] p-8 rounded-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-widest">
                    경제적 자유 목표액 (FIRE)
                  </h2>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
                      {fmt(targetAmount)}
                    </span>
                    <span className="text-xl font-medium text-white/70">원</span>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-sm font-medium text-white/80">
                      <span>진행률</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <ProgressBar percentage={progress} />
                  </div>

                  <div className="pt-8 border-t border-white/20">
                    <h3 className="text-sm font-medium text-white/70 mb-2 uppercase tracking-widest">
                      예상 탈출 시점
                    </h3>
                    {yearsToTarget === 0 ? (
                      <div className="flex items-center gap-3 text-white">
                        <Rocket className="w-8 h-8 animate-bounce" />
                        <span className="text-3xl font-bold">지금 당장 사표 가능! 🎉</span>
                      </div>
                    ) : isFinite(yearsToTarget) ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white">{yearsToTarget.toFixed(1)}</span>
                        <span className="text-xl text-white/70">년 후</span>
                        <span className="text-sm text-white/60 ml-2">({escapeYear}년)</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-white/80">계획 수정이 필요합니다... 🥲</span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Fun Metrics */}
              {isFinite(yearsToTarget) && yearsToTarget > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {funMetrics.map((metric, i) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white p-4 rounded-2xl border border-canvas shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-canvas-dark flex items-center justify-center mb-3 text-muted-blue">
                        <metric.icon size={20} />
                      </div>
                      <p className="text-xs text-faint-blue font-medium mb-1">남은 {metric.name}</p>
                      <p className="text-xl font-bold text-navy">
                        {fmt(metric.value)}{" "}
                        <span className="text-sm font-normal text-faint-blue">{metric.unit}</span>
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {/* /캡처 영역 끝 */}

            {/* 공유 섹션 */}
            {isFinite(yearsToTarget) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-canvas rounded-3xl p-6 shadow-sm"
              >
                <p className="text-sm font-bold text-navy mb-1 text-center">🚀 친구에게 공유하기</p>
                <p className="text-xs text-faint-blue text-center mb-4">
                  당신의 탈출 계획을 자랑해보세요!
                </p>
                <button
                  onClick={handleSaveImage}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-canvas-dark hover:bg-primary/10 hover:text-primary text-muted-blue transition-all text-sm font-bold"
                >
                  <Download className="w-5 h-5" />
                  이미지 저장
                </button>
                <ShareButtons
                  title={shareTitle()}
                  description="회사 탈출까지 남은 시간을 계산하는 FREEDOM DASHBOARD"
                  getShareImage={captureResultImage}
                  className="justify-center mt-4"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* 동기부여 섹션 */}
        <div className="mt-12 bg-white rounded-3xl p-8 text-center border border-canvas/60 shadow-sm">
          <Palmtree className="w-12 h-12 text-electric mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">자유를 향한 여정</h3>
          <p className="text-faint-blue max-w-2xl mx-auto mb-6">
            "가장 큰 부자는 자신의 시간을 마음대로 쓸 수 있는 사람이다." <br />
            오늘의 절약과 투자가 당신의 내일을 자유롭게 만듭니다.
          </p>
          {/* 다음 행동 유도: 탈출 시기를 앞당기는 연봉협상 가이드 */}
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric text-white font-bold hover:opacity-90 transition-opacity"
          >
            <BookOpen size={18} /> 탈출을 앞당기는 연봉 협상·재테크 가이드 보기
          </Link>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 z-50"
          >
            <CheckCheck className="w-4 h-4 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
