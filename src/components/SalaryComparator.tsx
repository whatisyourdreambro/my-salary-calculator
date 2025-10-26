// src/components/SalaryComparator.tsx

"use client";

import { useState, useRef } from "react";
import { calculateNetSalary } from "@/lib/calculator";
import CurrencyInput from "./CurrencyInput";
import html2canvas from "html2canvas";
import CountUp from "react-countup";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type Offer = {
  id: number;
  companyName: string;
  salary: string;
  bonus: string;
  overtime: string;
};

type OfferResult = {
  id: number;
  companyName: string;
  monthlyNet: number;
  totalAnnual: number;
};

export default function SalaryComparator() {
  const [offers, setOffers] = useState<Offer[]>([
    { id: 1, companyName: "A 회사", salary: "", bonus: "", overtime: "" },
    { id: 2, companyName: "B 회사", salary: "", bonus: "", overtime: "" },
  ]);
  const [commonSettings, setCommonSettings] = useState({
    nonTaxableAmount: "200,000",
    dependents: 1,
    children: 0,
  });
  const [results, setResults] = useState<OfferResult[]>([]);
  const comparatorRef = useRef<HTMLDivElement>(null);

  const handleOfferChange = (
    id: number,
    field: keyof Omit<Offer, "id">,
    value: string
  ) => {
    setOffers(
      offers.map((offer) =>
        offer.id === id ? { ...offer, [field]: value } : offer
      )
    );
  };

  const addOffer = () => {
    if (offers.length >= 10) {
      alert("최대 10개까지 비교할 수 있습니다.");
      return;
    }
    const newId = (offers[offers.length - 1]?.id || 0) + 1;
    const newCompanyName = `${String.fromCharCode(65 + offers.length)} 회사`;
    setOffers([
      ...offers,
      {
        id: newId,
        companyName: newCompanyName,
        salary: "",
        bonus: "",
        overtime: "",
      },
    ]);
  };

  const removeOffer = (id: number) => {
    if (offers.length <= 2) {
      alert("최소 2개의 항목이 필요합니다.");
      return;
    }
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  const handleCalculate = () => {
    const calculatedResults = offers.map((offer) => {
      const annualSalary = parseNumber(offer.salary);
      const annualBonus = parseNumber(offer.bonus);
      const annualOvertime = parseNumber(offer.overtime);
      const totalAnnualIncome = annualSalary + annualBonus + annualOvertime;

      // [수정] 불필요한 인수(0)를 제거했습니다.
      const net = calculateNetSalary(
        totalAnnualIncome,
        parseNumber(commonSettings.nonTaxableAmount) * 12,
        commonSettings.dependents,
        commonSettings.children,
        { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 }
      );

      return {
        id: offer.id,
        companyName: offer.companyName,
        monthlyNet: net.monthlyNet,
        totalAnnual: totalAnnualIncome,
      };
    });
    setResults(calculatedResults);
  };

  const bestOffer =
    results.length > 0
      ? results.reduce((max, current) =>
          current.monthlyNet > max.monthlyNet ? current : max
        )
      : null;

  const handleCapture = () => {
    const captureArea = comparatorRef.current;
    if (!captureArea) return;

    const watermark = document.createElement("div");
    watermark.innerText = "moneysalary.com";
    Object.assign(watermark.style, {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      fontSize: "14px",
      fontWeight: "bold",
      color: "rgba(0, 0, 0, 0.2)",
      pointerEvents: "none",
    });
    captureArea.appendChild(watermark);

    html2canvas(captureArea, {
      backgroundColor: null,
      useCORS: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `연봉비교_결과_moneysalary.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      captureArea.removeChild(watermark);
    });
  };

  const quickAmounts = [10000000, 1000000, 100000];

  return (
    <div ref={comparatorRef} className="space-y-8 mt-8">
      <div className="bg-card p-6 rounded-xl border">
        <h2 className="text-lg font-bold mb-4">공통 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">비과세액 (월)</label>
            <input
              type="text"
              value={formatNumber(parseNumber(commonSettings.nonTaxableAmount))}
              className="w-full p-2 mt-1 border rounded-lg bg-card border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium">부양가족 (본인포함)</label>
            <input
              type="number"
              min="1"
              value={commonSettings.dependents}
              onChange={(e) =>
                setCommonSettings({
                  ...commonSettings,
                  dependents: Number(e.target.value),
                })
              }
              className="w-full p-2 mt-1 border rounded-lg bg-card border-border"
            />
          </div>
          <div>
            <label className="text-sm font-medium">20세 이하 자녀</label>
            <input
              type="number"
              min="0"
              value={commonSettings.children}
              onChange={(e) =>
                setCommonSettings({
                  ...commonSettings,
                  children: Number(e.target.value),
                })
              }
              className="w-full p-2 mt-1 border rounded-lg bg-card border-border"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-card p-6 rounded-xl border relative"
          >
            <button
              onClick={() => removeOffer(offer.id)}
              className="absolute top-2 right-2 text-destructive font-bold text-xl leading-none p-1"
            >
              &times;
            </button>
            <input
              type="text"
              value={offer.companyName}
              onChange={(e) =>
                handleOfferChange(offer.id, "companyName", e.target.value)
              }
              className="text-xl font-bold mb-4 w-full bg-transparent border-b border-border pb-2"
            />
            <CurrencyInput
              label="계약 연봉"
              value={offer.salary}
              onValueChange={(v) => handleOfferChange(offer.id, "salary", v)}
              quickAmounts={quickAmounts}
            />
            <div className="mt-4">
              <CurrencyInput
                label="성과금 (연)"
                value={offer.bonus}
                onValueChange={(v) => handleOfferChange(offer.id, "bonus", v)}
                quickAmounts={quickAmounts}
              />
            </div>
            <div className="mt-4">
              <CurrencyInput
                label="기타 수당 (연)"
                value={offer.overtime}
                onValueChange={(v) =>
                  handleOfferChange(offer.id, "overtime", v)
                }
                quickAmounts={quickAmounts}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={addOffer}
          className="w-full py-3 bg-secondary font-semibold rounded-lg hover:bg-secondary/80 transition"
        >
          + 오퍼 추가
        </button>
        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition"
        >
          결과 분석하기
        </button>
      </div>

      {results.length > 0 && bestOffer && (
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-2xl font-bold text-center mb-6">
            최종 오퍼 비교 결과
          </h2>
          <div className="space-y-4">
            {results
              .sort((a, b) => b.monthlyNet - a.monthlyNet)
              .map((res, index) => (
                <div
                  key={res.id}
                  className={`p-4 rounded-lg border-2 ${
                    res.id === bestOffer.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xl font-bold ${
                          res.id === bestOffer.id ? "text-primary" : ""
                        }`}
                      >
                        {index + 1}위
                      </span>
                      <span className="text-lg font-semibold">
                        {res.companyName}
                      </span>
                      {res.id === bestOffer.id && (
                        <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                          BEST
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        월 <CountUp end={res.monthlyNet} separator="," /> 원
                      </p>
                      <p className="text-xs text-muted-foreground">
                        연봉 환산 {formatNumber(res.totalAnnual)}원
                      </p>
                    </div>
                  </div>
                  {res.id !== bestOffer.id && (
                    <div className="text-right mt-2 text-sm text-destructive">
                      - 월 {formatNumber(bestOffer.monthlyNet - res.monthlyNet)}
                      원 차이
                    </div>
                  )}
                </div>
              ))}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCapture}
              className="w-full py-3 bg-secondary font-semibold rounded-lg hover:bg-secondary/80 transition"
            >
              결과 이미지 저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}