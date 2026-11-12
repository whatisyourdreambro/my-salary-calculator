"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Divide, ArrowRightLeft, Percent } from "lucide-react";
import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import NumberInput from "@/components/NumberInput";
import { changeColorClass, percentResults, toNum } from "@/lib/percentCalculator";

export default function MathCalculators() {
 const [activeTab, setActiveTab] = useState<"percent" | "unit">("percent");

 return (
 // mt-8: /tools/math 에서 바로 위 CalcResultAd 바깥 여백(24px)과 병합돼 탭 버튼이 광고 아래 32px(2026-10-05 운영자 승인 #5, 광고 아래만).
 // 이 기본 내보내기는 /tools/math 한 곳에서만 쓴다(하위 계산기 PercentCalculator·NumberGenerator 는 별도 내보내기).
 <div className="mt-8 w-full max-w-4xl mx-auto">
 {/* Tabs */}
 <div className="flex justify-center mb-8">
 <div className="bg-white p-1 rounded-xl border border-canvas flex gap-1">
 <button
 onClick={() => setActiveTab("percent")}
 className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "percent"
 ? "bg-primary text-white shadow-lg"
 : "text-muted-blue hover:text-primary"
 }`}
 >
 퍼센트 계산기
 </button>
 <button
 onClick={() => setActiveTab("unit")}
 className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "unit"
 ? "bg-primary text-white shadow-lg"
 : "text-muted-blue hover:text-primary"
 }`}
 >
 단위 변환기
 </button>
 </div>
 </div>

 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {activeTab === "percent" ? <PercentCalculator /> : <UnitConverter />}
 </motion.div>
 </div>
 );
}

// 카드별 입력·결과 산식은 src/lib/percentCalculator.ts (2026-10-05 감사 code26-02·code26-03)

function PercentCalculator() {
 const [ratioWhole, setRatioWhole] = useState<number | "">("");
 const [ratioPercent, setRatioPercent] = useState<number | "">("");
 const [sharePart, setSharePart] = useState<number | "">("");
 const [shareWhole, setShareWhole] = useState<number | "">("");
 const [changeFrom, setChangeFrom] = useState<number | "">("");
 const [changeTo, setChangeTo] = useState<number | "">("");

 const { res1, res2, res3 } = percentResults(
 { whole: ratioWhole, percent: ratioPercent },
 { part: sharePart, whole: shareWhole },
 { from: changeFrom, to: changeTo }
 );

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Case 1 */}
 <div className="bg-white border border-canvas p-6 rounded-2xl">
 <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
 <Percent className="w-4 h-4 text-indigo-400" /> 비율 계산
 </h3>
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="전체값"
 aria-label="비율 계산 전체값"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={ratioWhole}
 onChange={(e) => setRatioWhole(toNum(e.target.value))}
 />
 <span className="text-muted-blue">의</span>
 </div>
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="비율(%)"
 aria-label="비율 계산 비율 (%)"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={ratioPercent}
 onChange={(e) => setRatioPercent(toNum(e.target.value))}
 />
 <span className="text-muted-blue">% 는?</span>
 </div>
 <div className="mt-4 p-3 bg-primary/10 border border-electric/30 rounded-xl text-center">
 <span className="text-2xl font-black text-indigo-400">{res1.toLocaleString('ko-KR')}</span>
 </div>
 </div>
 </div>

 {/* Case 2 */}
 <div className="bg-white border border-canvas p-6 rounded-2xl">
 <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
 <Divide className="w-4 h-4 text-indigo-400" /> 비중 계산
 </h3>
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="일부값"
 aria-label="비중 계산 일부값"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={sharePart}
 onChange={(e) => setSharePart(toNum(e.target.value))}
 />
 <span className="text-muted-blue">은</span>
 </div>
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="전체값"
 aria-label="비중 계산 전체값"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={shareWhole}
 onChange={(e) => setShareWhole(toNum(e.target.value))}
 />
 <span className="text-muted-blue">의 몇 %?</span>
 </div>
 <div className="mt-4 p-3 bg-primary/10 border border-electric/30 rounded-xl text-center">
 <span className="text-2xl font-black text-indigo-400">{res2.toFixed(2)}%</span>
 </div>
 </div>
 </div>

 {/* Case 3 */}
 <div className="bg-white border border-canvas p-6 rounded-2xl">
 <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
 <ArrowRightLeft className="w-4 h-4 text-indigo-400" /> 증감율 계산
 </h3>
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="기존값"
 aria-label="증감율 계산 기존값"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={changeFrom}
 onChange={(e) => setChangeFrom(toNum(e.target.value))}
 />
 <span className="text-muted-blue">에서</span>
 </div>
 <div className="flex items-center gap-2">
 <NumberInput
 type="number"
 placeholder="변경값"
 aria-label="증감율 계산 변경값"
 className="w-full bg-canvas border border-canvas rounded-lg px-3 py-2 text-navy"
 value={changeTo}
 onChange={(e) => setChangeTo(toNum(e.target.value))}
 />
 <span className="text-muted-blue">으로 변하면?</span>
 </div>
 <div className="mt-4 p-3 bg-primary/10 border border-electric/30 rounded-xl text-center">
 <span className={`text-2xl font-black ${changeColorClass(res3)}`}>
 {res3 > 0 ? "+" : ""}{res3.toFixed(2)}%
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}

// 단위 변환기는 검증된 공용 컴포넌트(LifeCalculators)를 재사용한다.
