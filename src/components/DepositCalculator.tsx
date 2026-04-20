"use client";

import { useState, useEffect } from "react";
import { PiggyBank, TrendingUp, Calendar } from "lucide-react";

export default function DepositCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(1000000);
  const [monthlyDisplay, setMonthlyDisplay] = useState("1,000,000");
  const [rate, setRate] = useState(3.5);
  const [period, setPeriod] = useState(12);
  const [isCompound, setIsCompound] = useState(true);
  const [result, setResult] = useState<{ principal: number; interest: number; total: number; tax: number } | null>(null);

  useEffect(() => {
    calculateDeposit();
  }, [monthlyAmount, rate, period, isCompound]);

  const calculateDeposit = () => {
    const principal = monthlyAmount * period;
    let interest = 0;
    if (isCompound) {
      const monthlyRate = rate / 100 / 12;
      interest =
        monthlyAmount *
          ((Math.pow(1 + monthlyRate, period + 1) - (1 + monthlyRate)) / monthlyRate) -
        principal;
    } else {
      interest = monthlyAmount * ((period * (period + 1)) / 2) * (rate / 100 / 12);
    }
    const tax = interest * 0.154;
    const afterTaxInterest = interest - tax;
    setResult({
      principal,
      interest: Math.round(interest),
      tax: Math.round(tax),
      total: Math.round(principal + afterTaxInterest),
    });
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(val);

  const handleMonthlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      const num = raw === "" ? 0 : parseInt(raw, 10);
      setMonthlyAmount(num);
      setMonthlyDisplay(num === 0 ? "" : num.toLocaleString("ko-KR"));
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
          <PiggyBank style={{ width: "20px", height: "20px" }} />
        </div>
        <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0A1829", letterSpacing: "-0.03em" }}>
          적금 이자 계산기
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>월 적립액</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrapStyle}>₩</span>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyDisplay}
                onChange={handleMonthlyChange}
                style={inputStyle}
                placeholder="1,000,000"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>연 이자율 (%)</label>
            <div style={{ position: "relative" }}>
              <span style={{ ...iconWrapStyle }}>
                <TrendingUp style={{ width: "14px", height: "14px" }} />
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

          <div>
            <label style={labelStyle}>적립 기간 (개월)</label>
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

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setIsCompound(true)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor: isCompound ? "#0145F2" : "#EDF1F5",
                color: isCompound ? "#fff" : "#7A9AB5",
                transition: "all 0.2s",
              }}
            >
              월복리
            </button>
            <button
              onClick={() => setIsCompound(false)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor: !isCompound ? "#0145F2" : "#EDF1F5",
                color: !isCompound ? "#fff" : "#7A9AB5",
                transition: "all 0.2s",
              }}
            >
              단리
            </button>
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
              세후 만기 수령액
            </p>
            <p style={{ fontSize: "26px", fontWeight: 900, color: "#0145F2", letterSpacing: "-0.04em" }}>
              {result ? formatMoney(result.total) : "-"}
            </p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#7A9AB5" }}>원금 합계</span>
              <span style={{ fontWeight: 700, color: "#0A1829" }}>{result ? formatMoney(result.principal) : "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#7A9AB5" }}>세전 이자</span>
              <span style={{ fontWeight: 700, color: "#0A1829" }}>{result ? formatMoney(result.interest) : "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#7A9AB5" }}>이자 과세 (15.4%)</span>
              <span style={{ fontWeight: 700, color: "#E53E3E" }}>-{result ? formatMoney(result.tax) : "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
