/**
 * SalaryNudge.tsx
 * 넛지 UI — 연봉 비교 & 호기심 유발 컴포넌트
 * 체류시간 증가 + SEO 텍스트 콘텐츠 동시 효과
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, TrendingUp, Zap } from "lucide-react";

// 인기 연봉 구간 (SEO 키워드 기반)
const POPULAR_SALARIES = [
  { amount: 30000000, label: "연봉 3천만원",  monthly: 2160000,  tax: 340000  },
  { amount: 35000000, label: "연봉 3500만원", monthly: 2520000,  tax: 415000  },
  { amount: 40000000, label: "연봉 4천만원",  monthly: 2875000,  tax: 498000  },
  { amount: 45000000, label: "연봉 4500만원", monthly: 3225000,  tax: 581000  },
  { amount: 50000000, label: "연봉 5천만원",  monthly: 3570000,  tax: 671000  },
  { amount: 60000000, label: "연봉 6천만원",  monthly: 4253000,  tax: 882000  },
  { amount: 70000000, label: "연봉 7천만원",  monthly: 4905000,  tax: 1128000 },
  { amount: 80000000, label: "연봉 8천만원",  monthly: 5530000,  tax: 1403000 },
  { amount: 100000000, label: "연봉 1억",     monthly: 6780000,  tax: 2053000 },
];

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default function SalaryNudge({ currentSalary }: { currentSalary?: number }) {
  const [expanded, setExpanded] = useState(false);

  // 현재 연봉 기준으로 ±1000만원 구간 강조
  const highlight = currentSalary
    ? POPULAR_SALARIES.find((s) => Math.abs(s.amount - currentSalary) < 5500000)
    : null;

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #EDF1F5 0%, #FFFFFF 100%)",
        border: "1.5px solid #DDE4EC",
        borderRadius: "1.5rem",
        padding: "1.75rem",
        marginTop: "2rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-black text-navy"
            style={{ fontSize: "1.1rem", letterSpacing: "-0.03em" }}
          >
            💡 다른 연봉도 궁금하신가요?
          </h3>
          <p className="text-faint-blue text-sm mt-0.5">
            인기 연봉 구간별 세후 실수령액 한눈에 비교
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm font-bold transition-colors"
          style={{ color: "#0145F2" }}
        >
          {expanded ? "접기" : "전체보기"}
          <ChevronDown
            size={16}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>

      {/* Quick Grid — 항상 상위 4개 노출 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2">
        {POPULAR_SALARIES.slice(0, 4).map((s) => (
          <NudgeCard key={s.amount} s={s} isHighlight={highlight?.amount === s.amount} />
        ))}
      </div>

      {/* Expandable rest */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 mt-2">
              {POPULAR_SALARIES.slice(4).map((s) => (
                <NudgeCard key={s.amount} s={s} isHighlight={highlight?.amount === s.amount} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA — 체류시간 & 내부 링크 SEO */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #DDE4EC" }}>
        <Link
          href="/table/annual"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: "#0145F21A", color: "#0145F2" }}
        >
          <TrendingUp size={14} /> 연봉 실수령액 대백과표
        </Link>
        <Link
          href="/year-end-tax"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: "#0145F21A", color: "#0145F2" }}
        >
          <Zap size={14} /> 연말정산 계산기
        </Link>
        <Link
          href="/fire-calculator"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: "#0145F21A", color: "#0145F2" }}
        >
          <ArrowRight size={14} /> FIRE 은퇴 계산기
        </Link>
      </div>
    </section>
  );
}

function NudgeCard({
  s,
  isHighlight,
}: {
  s: (typeof POPULAR_SALARIES)[0];
  isHighlight: boolean;
}) {
  return (
    <Link
      href={`/salary/${s.amount}`}
      className="block rounded-xl p-3 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: isHighlight ? "#0145F2" : "#FFFFFF",
        border: isHighlight ? "none" : "1.5px solid #DDE4EC",
        color: isHighlight ? "#FFFFFF" : "#0A1829",
        boxShadow: isHighlight ? "0 4px 16px #0145F230" : "none",
        textDecoration: "none",
      }}
    >
      <div
        className="text-xs font-bold mb-1"
        style={{ color: isHighlight ? "rgba(255,255,255,0.7)" : "#7A9AB5" }}
      >
        {s.label}
      </div>
      <div
        className="text-sm font-black tabular-nums"
        style={{ letterSpacing: "-0.03em" }}
      >
        월 {fmt(s.monthly)}원
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ color: isHighlight ? "rgba(255,255,255,0.65)" : "#7A9AB5" }}
      >
        세금 -{fmt(s.tax)}원
      </div>
    </Link>
  );
}
