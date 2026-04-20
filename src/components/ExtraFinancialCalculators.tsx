"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Percent,
  Calendar,
  Home,
  Briefcase,
  RefreshCw,
  BarChart2,
} from "lucide-react";

/* ─────────────────────────────────────────
  Shared helpers
───────────────────────────────────────── */
const fmt = (v: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(v);
const fmtRaw = (v: number) => v.toLocaleString("ko-KR");

function useCommaInput(init: number) {
  const [num, setNum] = useState(init);
  const [display, setDisplay] = useState(init.toLocaleString("ko-KR"));
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      const n = raw === "" ? 0 : parseInt(raw, 10);
      setNum(n);
      setDisplay(n === 0 ? "" : n.toLocaleString("ko-KR"));
    }
  };
  return { num, display, onChange };
}

/* ─────────────────────────────────────────
  Shared style tokens
───────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px 10px 40px",
  backgroundColor: "#EDF1F5",
  border: "none",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 600,
  color: "#0A1829",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#7A9AB5",
  marginBottom: "6px",
  letterSpacing: "0.02em",
};
const iconWrap: React.CSSProperties = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#B0C4D8",
  fontSize: "13px",
  fontWeight: 700,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
};
const resultBox: React.CSSProperties = {
  backgroundColor: "#EDF1F5",
  borderRadius: "16px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "16px",
};
const bigNum: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  color: "#0145F2",
  letterSpacing: "-0.04em",
};
const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
};

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={rowStyle}>
      <span style={{ color: "#7A9AB5" }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? "#E53E3E" : "#0A1829" }}>{value}</span>
    </div>
  );
}

function CardHeader({ icon: Icon, title, color = "#0145F2" }: { icon: React.ElementType; title: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          backgroundColor: `${color}12`,
          border: `1.5px solid ${color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <Icon style={{ width: "20px", height: "20px" }} />
      </div>
      <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0A1829", letterSpacing: "-0.03em" }}>
        {title}
      </h2>
    </div>
  );
}

function CalcGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      {children}
    </div>
  );
}

function Inputs({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>{children}</div>;
}

/* ─────────────────────────────────────────
  1. 복리 수익률 계산기
───────────────────────────────────────── */
function CompoundCalculator() {
  const principal = useCommaInput(10000000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);

  const total = principal.num * Math.pow(1 + rate / 100, years);
  const gain = total - principal.num;

  return (
    <div>
      <CardHeader icon={TrendingUp} title="복리 수익률 계산기" color="#10B981" />
      <CalcGrid>
        <Inputs>
          <div>
            <label style={labelStyle}>초기 투자금</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}>₩</span>
              <input type="text" inputMode="numeric" value={principal.display} onChange={principal.onChange} style={inputStyle} placeholder="10,000,000" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>연 수익률 (%)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Percent style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>투자 기간 (년)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Calendar style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </Inputs>
        <div style={resultBox}>
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>최종 자산</p>
            <p style={bigNum}>{fmt(Math.round(total))}</p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ResultRow label="원금" value={fmt(principal.num)} />
            <ResultRow label="수익금" value={fmt(Math.round(gain))} />
            <ResultRow label="수익률" value={`+${((gain / (principal.num || 1)) * 100).toFixed(1)}%`} />
          </div>
        </div>
      </CalcGrid>
    </div>
  );
}

/* ─────────────────────────────────────────
  2. 부동산 취득세 계산기
───────────────────────────────────────── */
function RealEstateTaxCalculator() {
  const price = useCommaInput(500000000);
  const [houseCount, setHouseCount] = useState<"1" | "2" | "3">("1");

  const getRates = () => {
    const p = price.num;
    if (houseCount === "1") {
      if (p <= 60000000) return { acq: 0.01, edu: 0.001 };
      if (p <= 900000000) return { acq: 0.01, edu: 0.001 }; // simplified: 1~3%
      return { acq: 0.03, edu: 0.003 };
    }
    if (houseCount === "2") return { acq: 0.08, edu: 0.004 };
    return { acq: 0.12, edu: 0.004 };
  };

  const { acq, edu } = getRates();
  const acqTax = Math.round(price.num * acq);
  const eduTax = Math.round(price.num * edu);
  const agriTax = Math.round(price.num * 0.002);
  const total = acqTax + eduTax + agriTax;

  return (
    <div>
      <CardHeader icon={Home} title="부동산 취득세 계산기" color="#F59E0B" />
      <CalcGrid>
        <Inputs>
          <div>
            <label style={labelStyle}>매매가</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}>₩</span>
              <input type="text" inputMode="numeric" value={price.display} onChange={price.onChange} style={inputStyle} placeholder="500,000,000" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>보유 주택 수</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["1", "2", "3"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setHouseCount(v)}
                  style={{
                    flex: 1, padding: "10px 4px", borderRadius: "10px", border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 700,
                    backgroundColor: houseCount === v ? "#F59E0B" : "#EDF1F5",
                    color: houseCount === v ? "#fff" : "#7A9AB5",
                    transition: "all 0.2s",
                  }}
                >
                  {v}주택
                </button>
              ))}
            </div>
          </div>
        </Inputs>
        <div style={resultBox}>
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>총 취득세</p>
            <p style={{ ...bigNum, color: "#F59E0B" }}>{fmt(total)}</p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ResultRow label={`취득세 (${(acq * 100).toFixed(0)}%)`} value={fmt(acqTax)} />
            <ResultRow label={`교육세 (${(edu * 100).toFixed(1)}%)`} value={fmt(eduTax)} />
            <ResultRow label="농특세 (0.2%)" value={fmt(agriTax)} />
          </div>
        </div>
      </CalcGrid>
    </div>
  );
}

/* ─────────────────────────────────────────
  3. 퇴직금 계산기
───────────────────────────────────────── */
function SeveranceCalculator() {
  const salary = useCommaInput(4000000);
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);

  const totalMonths = years * 12 + months;
  const avgThreeMonth = salary.num * 3;
  const severance = Math.round((avgThreeMonth / 91.25) * 30 * (totalMonths / 12));
  const taxBase = Math.max(0, severance - 1200000 * years);
  const tax = Math.round(taxBase * 0.06);

  return (
    <div>
      <CardHeader icon={Briefcase} title="퇴직금 계산기" color="#8B5CF6" />
      <CalcGrid>
        <Inputs>
          <div>
            <label style={labelStyle}>월 평균 임금</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}>₩</span>
              <input type="text" inputMode="numeric" value={salary.display} onChange={salary.onChange} style={inputStyle} placeholder="4,000,000" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>근속 기간 (년)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Calendar style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>추가 개월 수</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Calendar style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" min={0} max={11} value={months} onChange={(e) => setMonths(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </Inputs>
        <div style={resultBox}>
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>예상 퇴직금</p>
            <p style={{ ...bigNum, color: "#8B5CF6" }}>{fmt(severance)}</p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ResultRow label="근속 기간" value={`${years}년 ${months}개월`} />
            <ResultRow label="퇴직소득세 (개략)" value={fmt(tax)} accent />
            <ResultRow label="세후 수령액 (개략)" value={fmt(Math.max(0, severance - tax))} />
          </div>
        </div>
      </CalcGrid>
    </div>
  );
}

/* ─────────────────────────────────────────
  4. 환율 계산기
───────────────────────────────────────── */
function ExchangeCalculator() {
  const amount = useCommaInput(1000000);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "JPY" | "CNY">("USD");
  const rates: Record<string, number> = { USD: 1380, EUR: 1500, JPY: 9.1, CNY: 189 };

  const toForeign = amount.num / rates[currency];
  const fromForeign = amount.num * rates[currency];

  return (
    <div>
      <CardHeader icon={RefreshCw} title="환율 계산기" color="#06B6D4" />
      <CalcGrid>
        <Inputs>
          <div>
            <label style={labelStyle}>원화 금액 (KRW)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}>₩</span>
              <input type="text" inputMode="numeric" value={amount.display} onChange={amount.onChange} style={inputStyle} placeholder="1,000,000" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>환전 통화</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(["USD", "EUR", "JPY", "CNY"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    flex: "1 1 calc(50% - 3px)", padding: "8px 4px", borderRadius: "10px", border: "none", cursor: "pointer",
                    fontSize: "12px", fontWeight: 700,
                    backgroundColor: currency === c ? "#06B6D4" : "#EDF1F5",
                    color: currency === c ? "#fff" : "#7A9AB5",
                    transition: "all 0.2s",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#7A9AB5", padding: "8px 12px", backgroundColor: "#EDF1F5", borderRadius: "10px" }}>
            기준환율: 1 {currency} = ₩{fmtRaw(rates[currency])}
            <br />
            <span style={{ fontSize: "10px", opacity: 0.7 }}>※ 참고용 환율 (실시간 아님)</span>
          </div>
        </Inputs>
        <div style={resultBox}>
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>
              {fmtRaw(amount.num)}원 →
            </p>
            <p style={{ ...bigNum, color: "#06B6D4", fontSize: "22px" }}>
              {currency === "JPY"
                ? `¥${toForeign.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`
                : currency === "EUR"
                ? `€${toForeign.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`
                : currency === "CNY"
                ? `¥${toForeign.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`
                : `$${toForeign.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`}
            </p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ResultRow label={`1 ${currency} → KRW`} value={`₩${fmtRaw(rates[currency])}`} />
            <ResultRow label={`1만 KRW → ${currency}`} value={
              currency === "JPY" ? `¥${(10000 / rates[currency]).toFixed(0)}`
              : `${currency === "EUR" ? "€" : currency === "CNY" ? "¥" : "$"}${(10000 / rates[currency]).toFixed(2)}`
            } />
          </div>
        </div>
      </CalcGrid>
    </div>
  );
}

/* ─────────────────────────────────────────
  5. 물가상승률 계산기
───────────────────────────────────────── */
function InflationCalculator() {
  const amount = useCommaInput(1000000);
  const [rate, setRate] = useState(3.5);
  const [years, setYears] = useState(10);

  const futureValue = amount.num * Math.pow(1 + rate / 100, years);
  const presentValue = amount.num / Math.pow(1 + rate / 100, years);
  const lostValue = Math.round(amount.num - presentValue);

  return (
    <div>
      <CardHeader icon={BarChart2} title="물가상승률 계산기" color="#EF4444" />
      <CalcGrid>
        <Inputs>
          <div>
            <label style={labelStyle}>현재 금액</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}>₩</span>
              <input type="text" inputMode="numeric" value={amount.display} onChange={amount.onChange} style={inputStyle} placeholder="1,000,000" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>연 물가상승률 (%)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Percent style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>기간 (년)</label>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Calendar style={{ width: "13px", height: "13px" }} /></span>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </Inputs>
        <div style={resultBox}>
          <div>
            <p style={{ fontSize: "12px", color: "#7A9AB5", fontWeight: 600, marginBottom: "4px" }}>
              {years}년 후 같은 가치
            </p>
            <p style={{ ...bigNum, color: "#EF4444" }}>{fmt(Math.round(futureValue))}</p>
          </div>
          <div style={{ borderTop: "1px solid #DDE4EC", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ResultRow label="현재 실질 가치 손실" value={fmt(lostValue)} accent />
            <ResultRow label={`미래 물가 지수`} value={`${(Math.pow(1 + rate / 100, years) * 100).toFixed(1)}p`} />
            <ResultRow label="구매력 하락률" value={`-${(((futureValue - amount.num) / futureValue) * 100).toFixed(1)}%`} accent />
          </div>
        </div>
      </CalcGrid>
    </div>
  );
}

/* ─────────────────────────────────────────
  Export: All calculators section
───────────────────────────────────────── */
const calculators = [
  { id: "compound", label: "복리 수익률", component: <CompoundCalculator /> },
  { id: "realestate", label: "부동산 취득세", component: <RealEstateTaxCalculator /> },
  { id: "severance", label: "퇴직금", component: <SeveranceCalculator /> },
  { id: "exchange", label: "환율", component: <ExchangeCalculator /> },
  { id: "inflation", label: "물가상승률", component: <InflationCalculator /> },
];

export default function ExtraFinancialCalculators() {
  const [active, setActive] = useState("compound");
  const current = calculators.find((c) => c.id === active);

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {calculators.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              border: "1.5px solid",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 700,
              transition: "all 0.2s",
              borderColor: active === c.id ? "#0145F2" : "#DDE4EC",
              backgroundColor: active === c.id ? "#0145F2" : "#fff",
              color: active === c.id ? "#fff" : "#7A9AB5",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Calculator card */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1.5px solid #DDE4EC",
          borderRadius: "20px",
          padding: "28px",
        }}
      >
        {current?.component}
      </div>
    </div>
  );
}
