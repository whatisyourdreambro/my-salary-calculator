"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RefreshCw, Crown, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";
import { calculateSalaryRank, AGE_GROUPS } from "@/data/salaryRankData";
import ResultSharePanel from "@/components/ResultSharePanel";
import { normalizeShareImageText } from "@/lib/shareImage";
import { InArticleAd } from "@/components/AdPlacement";
import NumberInput from "@/components/NumberInput";

export default function SalaryRankCalculator() {
  const [salary, setSalary] = useState("");
  const [ageGroup, setAgeGroup] = useState("30s_early");
  const [result, setResult] = useState<ReturnType<typeof calculateSalaryRank> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedInputKey, setCalculatedInputKey] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedLabel = AGE_GROUPS.find((g) => g.key === ageGroup)?.label ?? "";

  const handleCalculate = () => {
    const salaryVal = Number(salary.replace(/[^0-9]/g, ""));
    if (!salaryVal) return;

    setIsCalculating(true);
    setTimeout(() => {
      const rank = calculateSalaryRank(ageGroup, salaryVal);
      setResult(rank);
      setCalculatedInputKey(JSON.stringify([salary, ageGroup]));
      setIsCalculating(false);
    }, 2000);
  };

  // 결과 카드를 캔버스로 캡처 — 다운로드/SNS 이미지 공유에서 공용 사용
  const captureCard = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(cardRef.current, {
      backgroundColor: "#000000",
      scale: 2,
      onclone: (_document, element) => normalizeShareImageText(element, "#FFFFFF"),
    });
  };

  const handleShare = async () => {
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "Moneysalary_Tier_Card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  // 인스타그램 등 이미지 공유용 — ShareButtons.getShareImage 콜백
  const getShareImage = async (): Promise<Blob | null> => {
    try {
      const canvas = await captureCard();
      if (!canvas) return null;
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/png")
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/80/20 border border-primary/30 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-4xl md:text-5xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/50 to-primary/80 mb-4 tracking-tight">
          나의 연봉 참고 티어
        </h2>
        <p className="text-muted-blue text-lg max-w-2xl mx-auto font-light">
          입력 연봉을 선택한 나이대의 자체 참고표와 비교합니다. 공식 전국 순위나 소득 인증은 아닙니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Section */}
        <div className="bg-canvas rounded-[2.5rem] p-8 sm:p-10 border border-canvas shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-navy mb-8 flex items-center gap-3 relative z-10">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="font-sans tracking-wide">정보 입력</span>
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
                    aria-pressed={ageGroup === ag.key}
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
              <label htmlFor="salary-rank-annual" className="block text-xs font-bold text-faint-blue uppercase tracking-widest mb-3">
                연간 연봉 (원)
              </label>
              <div className="relative">
                <NumberInput
                  id="salary-rank-annual"
                  type="text"
                  value={salary}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setSalary(Number(val).toLocaleString("ko-KR"));
                  }}
                  className="w-full p-6 text-3xl font-black bg-white border border-canvas rounded-2xl focus:border-primary/50 outline-none text-navy placeholder-zinc-800 transition-all text-right tracking-tight"
                  placeholder="0"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-blue font-sans text-xl">
                  ₩
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCalculate}
              disabled={isCalculating || !salary}
              className="w-full py-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
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
                <p className="font-sans text-xl opacity-50">연봉을 입력해 주세요...</p>
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
                  ref={cardRef} data-share-color-scope
                  className="w-full bg-electric rounded-[2.5rem] border border-canvas shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${result.color} opacity-20 blur-[100px] pointer-events-none`} />

                  {/* 카드 헤더 */}
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <p className="text-faint-blue text-xs font-bold tracking-[0.2em] mb-2">연봉 참고 티어</p>
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
                      <span className="text-muted-blue font-medium text-lg">참고표 상위</span>
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
                      <p className="text-muted-blue text-xs font-bold uppercase mb-2">자체 참고표 비교</p>
                      <p className="text-navy font-medium leading-relaxed">
                        <span className="text-primary font-bold">{selectedLabel}</span>{" "}
                        참고표에서{" "}
                        <span className="text-primary font-bold">{100 - result.percentile}%</span>
                        구간보다 높게 분류됩니다.
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-blue text-xs font-bold uppercase mb-2">산출 기준</p>
                      <div className="flex items-center gap-2 text-navy font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        사용자 입력
                      </div>
                    </div>
                  </div>

                  <p className="relative z-10 mt-5 text-xs leading-relaxed text-white/80">상위 비율은 자체 참고표 기준입니다. 공식 전국 순위·소득 인증이 아니며 공식 통계 기준연도·원자료는 확인되지 않았습니다.</p>

                  {/* 카드 푸터 */}
                  <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-muted-blue text-[10px] font-sans mb-1">소유자</p>
                      <p className="text-muted-blue font-sans tracking-widest">익명 VIP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-blue text-[10px] font-sans mb-1">공식 통계연도</p>
                      <p className="text-muted-blue font-sans">미확인</p>
                    </div>
                  </div>
                </div>

                {/* 결과 인접 광고 */}
                <div className="mt-4">
                  <InArticleAd />
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
                    className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Share2 className="w-4 h-4" /> 카드 저장
                  </button>
                </div>

                {/* SNS 공유 — 결과 카드 이미지를 카카오·인스타·X로 바이럴 */}
                <div className="mt-5 flex flex-col items-center gap-3">
                  <p className="text-muted-blue text-xs font-bold">
                    연봉 참고 티어 공유하기
                  </p>
                  <ResultSharePanel resultKey={JSON.stringify([salary, ageGroup, result])} resultIsCurrent={calculatedInputKey === JSON.stringify([salary, ageGroup])}
                    title={`${selectedLabel} 자체 참고표 기준 상위 ${result.percentile}% · 머니샐러리 참고 티어`}
                    description="사용자 입력을 자체 참고표와 비교한 결과입니다. 공식 전국 순위·소득 인증이 아니며, 공식 통계 기준연도와 원자료는 확인되지 않았습니다."
                    getShareImage={getShareImage}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 면책 고지 */}
      <p className="text-center text-muted-blue text-xs mt-16 font-sans">
        * 자체 참고표에 따른 분류이며 공식 전국 순위가 아닙니다. 참고용으로만 활용하세요.
        <br />
        머니샐러리 연봉 분석 서비스 © 2026
      </p>
    </div>
  );
}
