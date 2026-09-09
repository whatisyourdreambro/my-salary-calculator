// src/components/SalaryTierCard.tsx

"use client";

import React, { useRef, useState } from "react";
import { calculateSalaryRank } from "@/data/salaryRankData";
import { Download, Zap } from "lucide-react";
import ResultSharePanel from "@/components/ResultSharePanel";

interface SalaryTierCardProps {
 annualSalary: number;
}

const MungRankIcon = ({ tier }: { tier: string }) => {
 const getEmoji = () => {
 switch (tier) {
 case "CHALLENGER": return "👑";
 case "GRANDMASTER": return "🔥";
 case "MASTER": return "🦁";
 case "DIAMOND": return "💎";
 default: return "🥔";
 }
 };

 return (
 <div className="relative">
 <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-5xl shadow-inner border border-white/30">
 {getEmoji()}
 </div>
 <div className="absolute -bottom-2 -right-2 bg-[#FFD700] text-[#381f15] text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white">
 LEVEL MAX
 </div>
 </div>
 );
};

export default function SalaryTierCard({ annualSalary }: SalaryTierCardProps) {
 const cardRef = useRef<HTMLDivElement>(null);
 const [isDownloading, setIsDownloading] = useState(false);
 
 // Default to 30s for ranking as it's the most common target demographic
 const rank = calculateSalaryRank("30s", annualSalary);

 const downloadImage = async () => {
 if (!cardRef.current) return;
 setIsDownloading(true);

 try {
 const { default: html2canvas } = await import("html2canvas");
 const canvas = await html2canvas(cardRef.current, {
 scale: 2, // High quality
 backgroundColor: null,
 logging: false,
 useCORS: true,
 });

 const link = document.createElement("a");
 link.download = `mung-salary-rank-${rank.name.toLowerCase()}.png`;
 link.href = canvas.toDataURL("image/png");
 link.click();
 } catch (err) {
 console.error("Failed to generate image", err);
 } finally {
 setIsDownloading(false);
 }
 };

 const captureCardImage = async (): Promise<Blob | null> => {
 if (!cardRef.current) return null;
 const { default: html2canvas } = await import("html2canvas");
 const canvas = await html2canvas(cardRef.current, {
 scale: 2,
 backgroundColor: null,
 logging: false,
 useCORS: true,
 });
 return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
 };

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-navy flex items-center gap-2">
 <Zap size={18} className="text-primary fill-yellow-500"/> 30대 기준 참고 티어 카드
 </h3>
 <p className="text-xs text-faint-blue">이미지로 저장해서 공유해보세요!</p>
 </div>

 {/* The Visual Card to Capture */}
 <div 
 ref={cardRef} data-share-color-scope
 className={`relative w-full min-h-[32rem] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${rank.color} p-8 flex flex-col justify-between gap-4 text-white border-4 border-white/20`}
 >
 {/* Background Patterns */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
 <div className="absolute bottom-0 left-0 w-48 h-48 bg-electric/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

 {/* Header */}
 <div className="relative z-10 flex flex-wrap gap-3 justify-between items-start">
 <div>
 <div className="text-white/70 text-xs font-bold mb-1">30대 기준 참고 티어 · 자체 추정표</div>
 <div className="text-2xl font-black italic tracking-tighter text-white">MONEYSALARY</div>
 </div>
 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/30">
 REFERENCE
 </div>
 </div>

 {/* Center Content */}
 <div className="relative z-10 flex flex-col items-center justify-center py-4">
 <MungRankIcon tier={rank.name} />
 <div className="mt-4 text-center">
 <div className="text-sm font-medium text-white/80 mb-1">30대 참고표에서 내 티어는?</div>
 <div className="text-5xl font-black tracking-tight drop-shadow-lg mb-2">
 {rank.name}
 </div>
 <div className="inline-block bg-electric/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold border border-white/20">
 참고표 기준 상위 {rank.percentile}% {rank.icon}
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="relative z-10 border-t border-white/20 pt-6 flex justify-between items-end">
 <div>
 <div className="text-white/60 text-[10px] mb-1">Annual Salary</div>
 <div className="text-xl font-bold text-white">{(annualSalary / 10000).toLocaleString('ko-KR')}만원</div>
 </div>
 <div className="text-right">
 <div className="text-[10px] font-bold text-white/80 leading-tight">
 자체 참고표에 따른 분류<br />공식 전국 순위가 아닙니다
 </div>
 <div className="text-[9px] text-white/50 mt-1">moneysalary.com</div>
 </div>
 </div>
 <p className="relative z-10 text-[10px] leading-relaxed text-white/80">상위 비율은 이 자체 참고표 기준입니다. 공식 통계의 기준연도와 원자료는 확인되지 않았습니다.</p>
 </div>

 {/* Actions */}
 <div>
 <button
 onClick={downloadImage}
 disabled={isDownloading}
 className="w-full flex items-center justify-center gap-2 py-3.5 bg-electric text-white rounded-xl font-bold text-sm hover:bg-electric transition-all active:scale-95 disabled:opacity-50 border-0"
 >
 {isDownloading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 ) : (
 <Download size={16} className="text-white" />
 )}
 <span className="text-white">이미지로 저장</span>
 </button>
 <ResultSharePanel showPageShare={false} register={false} resultKey={JSON.stringify([annualSalary, rank])}
 title={`30대 참고표 기준 내 연봉 티어: ${rank.name} · 참고표 상위 ${rank.percentile}%`}
 description="자체 추정표로 보는 참고 티어입니다. 공식 전국 순위가 아니며 공식 통계 기준연도·원자료가 확인되지 않았습니다."
 getShareImage={captureCardImage}
 className="justify-center mt-4"
 />
 </div>
 </div>
 );
}
