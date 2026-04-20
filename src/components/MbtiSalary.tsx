"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Share2, RefreshCw, DollarSign, TrendingUp } from "lucide-react";
import html2canvas from "html2canvas";
const MBTI_DATA: Record<string, { rank: number; avgSalary: string; desc: string; color: string }> = {
 "ENTJ": { rank: 1, avgSalary: "8,500", desc: "타고난 지도자, 연봉도 1위!", color: "from-primary to-indigo-600" },
 "ESTJ": { rank: 2, avgSalary: "8,200", desc: "현실적인 관리자, 확실한 성과!", color: "from-blue-600 to-primary/80" },
 "ENTP": { rank: 3, avgSalary: "7,800", desc: "뜨거운 논쟁을 즐기는 변론가!", color: "from-primary to-primary/80" },
 "ISTJ": { rank: 4, avgSalary: "7,500", desc: "청렴결백한 논리주의자!", color: "from-blue-500 to-primary/80" },
 "ESTP": { rank: 5, avgSalary: "7,200", desc: "모험을 즐기는 사업가!", color: "from-primary to-primary/80" },
 "INTJ": { rank: 6, avgSalary: "7,100", desc: "용의주도한 전략가!", color: "from-primary to-primary/80" },
 "ENFJ": { rank: 7, avgSalary: "6,900", desc: "정의로운 사회운동가!", color: "from-green-500 to-primary/80" },
 "ISTP": { rank: 8, avgSalary: "6,700", desc: "만능 재주꾼!", color: "from-primary to-primary/80" },
 "ESFJ": { rank: 9, avgSalary: "6,500", desc: "사교적인 외교관!", color: "from-blue-400 to-sky-400" },
 "ENFP": { rank: 10, avgSalary: "6,300", desc: "재기발랄한 활동가!", color: "from-green-400 to-primary/80" },
 "INFJ": { rank: 11, avgSalary: "6,100", desc: "선의의 옹호자!", color: "from-green-600 to-primary/80" },
 "INTP": { rank: 12, avgSalary: "5,900", desc: "논리적인 사색가!", color: "from-primary to-primary/80" },
 "ISFJ": { rank: 13, avgSalary: "5,700", desc: "용감한 수호자!", color: "from-blue-300 to-primary/80" },
 "ISFP": { rank: 14, avgSalary: "5,500", desc: "호기심 많은 예술가!", color: "from-primary to-primary/80" },
 "INFP": { rank: 15, avgSalary: "5,300", desc: "열정적인 중재자!", color: "from-green-300 to-primary/80" },
 "ESFP": { rank: 16, avgSalary: "5,100", desc: "자유로운 영혼의 연예인!", color: "from-primary to-primary/80" },
};

export default function MbtiSalary() {
 const [selectedMbti, setSelectedMbti] = useState<string | null>(null);
 const [isAnalyzing, setIsAnalyzing] = useState(false);
 const [result, setResult] = useState<any>(null);
 const cardRef = useRef<HTMLDivElement>(null);

 const handleSelect = (mbti: string) => {
 setSelectedMbti(mbti);
 setIsAnalyzing(true);
 setResult(null);

 setTimeout(() => {
 setResult(MBTI_DATA[mbti]);
 setIsAnalyzing(false);
 }, 1500);
 };

 const handleShare = async () => {
 if (cardRef.current) {
 const canvas = await html2canvas(cardRef.current, { backgroundColor: "#000000" });
 const link = document.createElement("a");
 link.download = `MBTI_Salary_${selectedMbti}.png`;
 link.href = canvas.toDataURL("image/png");
 link.click();
 }
 };

 return (
 <div className="w-full max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 mb-4">
 MBTI 연봉 순위
 </h2>
 <p className="text-faint-blue text-lg">
 내 MBTI의 평균 연봉은 얼마일까요? 재미로 보는 통계!
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
 {/* Selection Grid */}
 <div className="bg-white rounded-3xl p-8 border border-canvas shadow-xl">
 <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
 <Brain className="text-primary" /> MBTI 선택
 </h3>
 <div className="grid grid-cols-4 gap-2">
 {Object.keys(MBTI_DATA).map((mbti) => (
 <button
 key={mbti}
 onClick={() => handleSelect(mbti)}
 className={`p-2 rounded-xl font-bold text-sm transition-all ${selectedMbti === mbti
 ? "bg-primary text-white shadow-lg scale-105"
 : "bg-canvas-dark text-faint-blue hover:bg-canvas-deeper hover:text-white"
 }`}
 >
 {mbti}
 </button>
 ))}
 </div>

 <div className="mt-8">
 </div>
 </div>

 {/* Result Section */}
 <div className="relative min-h-[400px]">
 <AnimatePresence mode="wait">
 {!result && !isAnalyzing && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 flex flex-col items-center justify-center text-faint-blue bg-white/50 rounded-3xl border border-canvas border-dashed"
 >
 <Brain className="w-16 h-16 mb-4 opacity-20" />
 <p>MBTI를 선택하고<br />연봉 순위를 확인하세요!</p>
 </motion.div>
 )}

 {isAnalyzing && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl border border-canvas z-10"
 >
 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-primary font-bold animate-pulse">데이터 분석 중...</p>
 </motion.div>
 )}

 {result && !isAnalyzing && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="w-full"
 >
 <div
 ref={cardRef}
 className="bg-white rounded-3xl border border-canvas shadow-2xl overflow-hidden relative p-8"
 >
 <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${result.color}`} />

 <div className="text-center mb-8">
 <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${result.color} text-white font-bold text-sm mb-4`}>
 RANK #{result.rank}
 </div>
 <h3 className="text-5xl font-black text-navy mb-2 tracking-tight">
 {selectedMbti}
 </h3>
 <p className="text-faint-blue font-medium">{result.desc}</p>
 </div>

 <div className="bg-electric/50 rounded-2xl p-6 backdrop-blur-sm border border-white/5 mb-6 text-center">
 <p className="text-faint-blue text-sm font-bold mb-2">평균 연봉 (추정)</p>
 <div className="flex items-center justify-center gap-2 text-4xl font-black text-navy">
 <DollarSign className="w-8 h-8 text-primary" />
 {result.avgSalary}만원
 </div>
 </div>

 <div className="text-center">
 <p className="text-xs text-muted-blue mb-6">
 * 재미로 보는 통계입니다. 실제와 다를 수 있습니다.
 </p>
 <div className="flex gap-4">
 <button
 onClick={() => setSelectedMbti(null)}
 className="flex-1 py-3 bg-canvas-dark text-muted-blue rounded-xl font-bold hover:bg-canvas-deeper transition-colors flex items-center justify-center gap-2"
 >
 <RefreshCw className="w-4 h-4" /> 다시 하기
 </button>
 <button
 onClick={handleShare}
 className={`flex-1 py-3 bg-gradient-to-r ${result.color} text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
 >
 <Share2 className="w-4 h-4" /> 공유하기
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
