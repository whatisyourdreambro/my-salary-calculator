// src/components/SalaryTierCard.tsx

"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { calculateSalaryRank } from "@/data/salaryRankData";
import { Download, Share2, Award, Zap } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500 fill-yellow-500"/> 소셜 공유용 티어 카드
        </h3>
        <p className="text-xs text-gray-500">이미지로 저장해서 공유해보세요!</p>
      </div>

      {/* The Visual Card to Capture */}
      <div 
        ref={cardRef}
        className={`relative w-full aspect-[4/5] sm:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${rank.color} p-8 flex flex-col justify-between text-white border-4 border-white/20`}
      >
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="text-white/80 text-xs font-bold tracking-widest uppercase mb-1">2026 Salary Report</div>
            <div className="text-3xl font-black italic tracking-tighter">MONEYSALARY</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/30">
            OFFICIAL RANK
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <MungRankIcon tier={rank.name} />
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-white/90 mb-1">내 연봉 티어는?</div>
            <div className="text-5xl font-black tracking-tight drop-shadow-lg mb-2">
              {rank.name}
            </div>
            <div className="inline-block bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold border border-white/20">
              상위 {rank.percentile}% {rank.icon}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/20 pt-6 flex justify-between items-end">
          <div>
            <div className="text-white/70 text-[10px] mb-1">Annual Salary</div>
            <div className="text-xl font-bold">{(annualSalary / 10000).toLocaleString()}만원</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-white/80 leading-tight">
              {rank.message}
            </div>
            <div className="text-[9px] text-white/50 mt-1">moneysalary.com</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadImage}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Download size={16} />
          )}
          이미지로 저장
        </button>
        <button
          className="flex items-center justify-center gap-2 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
          onClick={() => {
              if (navigator.share) {
                  navigator.share({
                      title: '내 2026 연봉 티어 확인하기',
                      text: `내 연봉 티어는 ${rank.name}! 상위 ${rank.percentile}% 입니다.`,
                      url: window.location.href,
                  });
              } else {
                  alert('공유 기능을 지원하지 않는 브라우저입니다.');
              }
          }}
        >
          <Share2 size={16} /> 인스타 공유
        </button>
      </div>
    </div>
  );
}
