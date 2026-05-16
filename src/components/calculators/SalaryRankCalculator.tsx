"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RefreshCw, Crown, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { calculateSalaryRank, AGE_GROUPS } from "@/data/salaryRankData";

export default function SalaryRankCalculator() {
  const [salary, setSalary] = useState("");
  const [ageGroup, setAgeGroup] = useState("30s_early");
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedLabel = AGE_GROUPS.find((g) => g.key === ageGroup)?.label ?? "";

  const handleCalculate = () => {
    const salaryVal = Number(salary.replace(/[^0-9]/g, ""));
    if (!salaryVal) return;

    setIsCalculating(true);
    setTimeout(() => {
      const rank = calculateSalaryRank(ageGroup, salaryVal);
      setResult(rank);
      setIsCalculating(false);
    }, 2000);
  };

  const handleShare = async () => {
    if (cardRef.current) {
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: "#000000",
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = "Moneysalary_Tier_Card.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (e) {
        console.error("Share failed", e);
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/80/20 border border-primary/30 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/50 to-primary/80 mb-4 tracking-tight">
          나의 연봉 등급
        </h2>
        <p className="text-muted-blue text-lg max-w-2xl mx-auto font-light">
          대한민국 상위 1%를 향한 여정. 귀하의 연봉 위치를 프라이빗하게 분석해드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Section */}
        <div className="bg-canvas rounded-[2.5rem] p-8 sm:p-10 border border-canvas shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-navy mb-8 flex items-center gap-3 relative z-10">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="font-serif tracking-wide">정보 입력</span>
          </h3>

          <div className="space-y-8 relative z-10">
            {/* Age Group */}
            <div>
              <label className="block text-xs font-bold text-faint-blue uppercase tracking-widest mb-3">
                나이대
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag.key}
                    onClick={() => setAgeGroup(ag.key)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      ageGroup === ag.key
                        ? "bg-primary text-white shadow-md scale-[1.03]"
                        : "bg-white text-faint-blue border border-canvas hover:border-primary/40 hover:text-navy"
                    } ${ag.key === "50s" ? "col-span-2" : ""}`}
                  >
                    {ag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Input */}
            <div>
              <label className="block text-xs font-bold text-faint-blue uppercase tracking-widest mb-3">
                연간 연봉 (원)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setSalary(Number(val).toLocaleString("ko-KR"));
                  }}
                  className="w-full p-6 text-3xl font-black bg-white border border-canvas rounded-2xl focus:border-primary/50 outline-none text-navy placeholder-zinc-800 transition-all text-right tracking-tight"
                  placeholder="0"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-blue font-serif text-xl">
                  ₩
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCalculate}
              disabled={isCalculating || !salary}
              className="w-full py-6 bg-gradient-to-r from-primary to-primary/80 text-black font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  등급 분석
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            {!result && !isCalculating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-muted-blue bg-canvas rounded-[2.5rem] border border-canvas border-dashed"
              >
                <Crown className="w-24 h-24 mb-6 opacity-10" />
                <p className="font-serif text-xl opacity-50">연봉을 입력해 주세요...</p>
              </motion.div>
            )}

            {isCalculating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-canvas rounded-[2.5rem] border border-canvas z-20"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-canvas rounded-full" />
                  <div className="absolute inset-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(234,179,8,0.4)]" />
                </div>
                <p className="text-primary font-bold mt-8 animate-pulse tracking-widest text-sm">
                  데이터 분석 중...
                </p>
              </motion.div>
            )}

            {result && !isCalculating && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="w-full h-full relative"
              >
                {/* 결과 카드 */}
                <div
                  ref={cardRef}
                  className="w-full bg-electric rounded-[2.5rem] border border-canvas shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${result.color} opacity-20 blur-[100px] pointer-events-none`} />

                  {/* 카드 헤더 */}
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <p className="text-faint-blue text-xs font-bold tracking-[0.2em] mb-2">연봉 등급</p>
                      <h3 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${result.color} tracking-tight`}>
                        {result.name}
                      </h3>
                    </div>
                    <div className="w-16 h-10 bg-canvas-dark/50 rounded-lg border border-white/10 flex items-center justify-center">
                      <div className="w-10 h-6 bg-gradient-to-br from-primary to-primary/80 rounded opacity-80" />
                    </div>
                  </div>

                  {/* 핵심 수치 */}
                  <div className="mb-12 relative z-10">
                    <div className="flex items-baseline gap-4">
                      <span className="text-7xl font-black text-navy tracking-tighter">
                        {result.percentile}%
                      </span>
                      <span className="text-muted-blue font-medium text-lg">상위</span>
                    </div>
                    <div className="w-full h-3 bg-white rounded-full mt-6 overflow-hidden border border-canvas">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - result.percentile}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                        className={`h-full bg-gradient-to-r ${result.color} shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
                      />
                    </div>
                  </div>

                  {/* 세부 정보 */}
                  <div className="grid grid-cols-2 gap-8 mb-auto relative z-10">
                    <div>
                      <p className="text-muted-blue text-xs font-bold uppercase mb-2">또래 비교</p>
                      <p className="text-navy font-medium leading-relaxed">
                        <span className="text-primary font-bold">{selectedLabel}</span>{" "}
                        중{" "}
                        <span className="text-primary font-bold">{100 - result.percentile}%</span>
                        보다 높은 연봉이에요.
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-blue text-xs font-bold uppercase mb-2">인증</p>
                      <div className="flex items-center gap-2 text-navy font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        인증 완료
                      </div>
                    </div>
                  </div>

                  {/* 카드 푸터 */}
                  <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-muted-blue text-[10px] font-mono mb-1">소유자</p>
                      <p className="text-muted-blue font-mono tracking-widest">익명 VIP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-blue text-[10px] font-mono mb-1">유효기간</p>
                      <p className="text-muted-blue font-mono">12/99</p>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 py-4 bg-white text-muted-blue font-bold rounded-2xl hover:bg-canvas-dark hover:text-navy transition-all flex items-center justify-center gap-2 border border-canvas"
                  >
                    <RefreshCw className="w-4 h-4" /> 초기화
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Share2 className="w-4 h-4" /> 카드 저장
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 면책 고지 */}
      <p className="text-center text-muted-blue text-xs mt-16 font-mono">
        * 통계청·고용노동부 자료 기반 추정치입니다. 참고용으로만 활용하세요.
        <br />
        머니샐러리 연봉 분석 서비스 © 2026
      </p>
    </div>
  );
}
