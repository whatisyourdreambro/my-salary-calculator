"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Info } from "lucide-react";
import { CalcResultAd } from "@/components/AdPlacement";
import { calcDividendTax } from "@/lib/dividendTax";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function DividendTaxPage() {
  const [dividend, setDividend] = useState(15_000_000);
  const [interest, setInterest] = useState(0);
  const [otherBase, setOtherBase] = useState(0);

  const r = useMemo(
    () => calcDividendTax(interest, dividend, otherBase),
    [interest, dividend, otherBase]
  );

  const rows: { label: string; value: number; main?: boolean }[] = [
    { label: "금융소득 합계 (이자 + 배당)", value: r.financial },
    ...(r.isComprehensive
      ? [
          { label: "1) 종합과세 방식 산출세액", value: r.methodA },
          { label: "2) 분리과세 상당 산출세액", value: r.methodB },
        ]
      : []),
    {
      label: r.isComprehensive ? "소득세 (두 방식 중 큰 금액)" : "소득세 (14%)",
      value: r.incomeTax,
    },
    { label: "지방소득세 (소득세의 10%)", value: r.localTax },
    { label: "세금 합계", value: r.total, main: true },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 pb-10 border-b border-canvas">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-sm uppercase tracking-widest mb-6">
            <PiggyBank size={14} /> 2026 세법 기준
          </div>
          <h1 className="text-4xl font-black text-navy tracking-tight mb-3">
            배당소득세 계산기
          </h1>
          <p className="text-faint-blue font-medium">
            배당·이자 원천징수 15.4%와 금융소득 2,000만원 초과 시 종합과세를 함께 계산합니다
          </p>
        </div>

        <div className="bg-white border border-canvas rounded-2xl p-8 mb-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">
                연간 배당소득 (원)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={dividend}
                onChange={(e) => setDividend(Number(e.target.value))}
                className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">
                연간 이자소득 (원)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-faint-blue uppercase tracking-widest block mb-2">
              기타 종합소득 과세표준 (원) — 근로·사업소득 등 공제 후 금액
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={otherBase}
              onChange={(e) => setOtherBase(Number(e.target.value))}
              className="w-full border border-canvas rounded-xl px-4 py-3.5 font-black text-navy focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <p className="text-[11px] text-faint-blue mt-2">
              금융소득이 2,000만원 이하면 이 값은 결과에 영향을 주지 않습니다.
            </p>
          </div>
        </div>

        <motion.div
          key={r.total}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-primary shadow-lg mb-6"
        >
          <div className="bg-primary p-8 text-center">
            <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">
              금융소득 관련 세금 합계
            </p>
            <p className="text-5xl font-black text-navy tracking-tight">
              {fmt(r.total)}
              <span className="text-2xl ml-1">원</span>
            </p>
            <p className="text-navy/70 text-sm mt-2">
              금융소득 대비 실효세율: {r.effectiveRate.toFixed(1)}%
            </p>
            <p className="text-navy font-bold mt-1">
              {r.isComprehensive ? "금융소득종합과세 대상" : "분리과세로 납세 종결"}
            </p>
          </div>
          <div className="bg-white p-6 space-y-3">
            {rows.map((item) => (
              <div
                key={item.label}
                className={`flex justify-between items-center py-2 ${
                  item.main ? "border-t-2 border-primary pt-4" : "border-b border-canvas"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    item.main ? "font-black text-navy" : "text-faint-blue"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`font-black tabular-nums ${
                    item.main ? "text-primary text-xl" : "text-navy"
                  }`}
                >
                  {fmt(item.value)}원
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 결과 직하 광고 */}
        <CalcResultAd />

        <div className="p-5 bg-canvas border border-canvas rounded-xl flex gap-3 mb-8">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-blue leading-relaxed">
            <strong>2,000만원 이하</strong>: 15.4%(소득세 14% + 지방소득세 1.4%) 원천징수로 납세가
            종결되며 별도 신고가 필요 없습니다. <strong>2,000만원 초과</strong>: 소득세법 제62조에
            따라 종합과세 방식과 분리과세 상당액 중 큰 금액이 산출세액이 되며, 다음 해 5월
            종합소득세 신고 대상입니다. 이 계산기는 국내 법인 배당의 배당가산(Gross-up 10%)과
            배당세액공제, 해외 배당의 외국납부세액공제를 반영하지 않은 간이 계산입니다.
          </p>
        </div>
      </div>
    </main>
  );
}
