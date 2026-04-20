"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Percent, Calendar } from "lucide-react";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(100000000);
  const [amountDisplay, setAmountDisplay] = useState("100,000,000");
  const [rate, setRate] = useState(4.5);
  const [period, setPeriod] = useState(30);
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalPayment: number } | null>(null);

  useEffect(() => {
    calculateLoan();
  }, [amount, rate, period]);

  const calculateLoan = () => {
    const monthlyRate = rate / 100 / 12;
    const months = period * 12;
    if (months === 0 || amount === 0) return;
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalInterest = monthlyPayment * months - amount;
    setResult({
      monthly: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(amount + totalInterest),
    });
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(val);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      const num = raw === "" ? 0 : parseInt(raw, 10);
      setAmount(num);
      setAmountDisplay(num === 0 ? "" : num.toLocaleString("ko-KR"));
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px 10px 40px",
    backgroundColor: "#EDF1F5",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#0A1829",
    outline: "none",
    boxSizing: "border-box" as const,
  };
  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#7A9AB5",
    marginBottom: "6px",
    letterSpacing: "0.02em",
  };
  const iconWrapStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#B0C4D8",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1,
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            backgroundColor: "#0145F20D",
            border: "1.5px solid #0145F221",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0145F2",
          }}
        >
          <Calculator style={{ width: "20px", height: "20px" }} />
        </div>
        <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0A1829", letterSpacing: "-0.03em" }}>
          대출 이자 계산기
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 대출 금액 */}
          <div>
            <label style={labelStyle}>대출 금액</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrapStyle}>₩</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                style={inputStyle}
                placeholder="100,000,000"
              />
            </div>
          </div>

          {/* 연 이자율 */}
          <div>
            <label style={labelStyle}>연 이자율 (%)</label>
            <div style={{ position: "relative" }}>
              <span style={{ ...iconWrapStyle }}>
                <Percent style={{ width: "14px", height: "14px" }} />
              </span>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* 대출 기간 */}
          <div>
            <label style={labelStyle}>대출 기간 (년)</label>
            <div style={{ position: "relative" }}>
              <span style={{ ...iconWrapStyle }}>
                <Calendar style={{ width: "14px", height: "14px" }} />
              </span>
              <input
                type="number"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Result */}
        <div
          style={{
            backgroundColor: "#EDF1F5",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>
              월 예상 상환액
            </p>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#0145F2", letterSpacing: "-0.04em" }}>
              {result ? formatMoney(result.monthly) : "-"}
            </p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#7A9AB5" }}>총 이자액</span>
              <span style={{ fontWeight: 700, color: "#0A1829" }}>{result ? formatMoney(result.totalInterest) : "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#7A9AB5" }}>총 상환금액</span>
              <span style={{ fontWeight: 700, color: "#0A1829" }}>{result ? formatMoney(result.totalPayment) : "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
