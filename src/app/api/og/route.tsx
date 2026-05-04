// src/app/api/og/route.tsx
//
// 동적 Open Graph 이미지 생성기.
// type 파라미터로 페이지 종류별 unique 이미지 자동 생성:
//   ?type=salary&amount=50000000   — 연봉 페이지
//   ?type=tool&name=성과급+세금     — 계산기 도구 페이지
//   ?type=guide&slug=...           — 가이드 글
//   ?type=company&id=...           — 회사 페이지
//   기본(type 없음)                 — title 파라미터로 일반 페이지

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BRAND_BLUE = "#0145F2";
const BRAND_DARK = "#0A1829";
const CANVAS = "#EDF1F5";

const containerStyle = {
 height: "100%",
 width: "100%",
 display: "flex",
 flexDirection: "column" as const,
 alignItems: "center",
 justifyContent: "center",
 backgroundColor: BRAND_BLUE,
 backgroundImage:
 "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.12) 0%, transparent 50%)",
 padding: "0 60px",
};

const cardStyle = {
 display: "flex",
 flexDirection: "column" as const,
 alignItems: "center",
 backgroundColor: "rgba(255, 255, 255, 0.06)",
 padding: "60px 80px",
 borderRadius: "40px",
 border: "2px solid rgba(255, 255, 255, 0.12)",
 maxWidth: "1000px",
};

const watermarkStyle = {
 position: "absolute" as const,
 bottom: 36,
 color: "white",
 opacity: 0.5,
 fontSize: 24,
 fontWeight: 700,
 letterSpacing: "0.04em",
};

function renderSalaryOg(amount: string, netPay?: string) {
 const manwon = Math.round(Number(amount) / 10000).toLocaleString("ko-KR");
 return (
 <div style={containerStyle}>
 <div style={cardStyle}>
 <div style={{ color: CANVAS, fontSize: 28, fontWeight: 900, marginBottom: 16, letterSpacing: "0.04em" }}>
 2026 연봉 리포트
 </div>
 <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 10 }}>
 연봉 {manwon}만원
 </div>
 <div style={{ color: "white", fontSize: 32, fontWeight: 400, opacity: 0.85, marginBottom: 32 }}>
 세후 월 실수령액은?
 </div>
 {netPay && (
 <div
 style={{
 backgroundColor: CANVAS,
 color: BRAND_DARK,
 padding: "16px 48px",
 borderRadius: "100px",
 fontSize: 56,
 fontWeight: 900,
 display: "flex",
 alignItems: "baseline",
 }}
 >
 {netPay}
 <span style={{ fontSize: 28, marginLeft: 8 }}>원</span>
 </div>
 )}
 </div>
 <div style={watermarkStyle}>moneysalary.com</div>
 </div>
 );
}

function renderToolOg(name: string) {
 return (
 <div style={containerStyle}>
 <div style={cardStyle}>
 <div style={{ color: CANVAS, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.04em" }}>
 머니샐러리 · 금융 계산기
 </div>
 <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.15 }}>
 {name}
 </div>
 <div style={{ color: "white", fontSize: 28, fontWeight: 500, opacity: 0.85, marginTop: 16 }}>
 2026년 최신 세법 기준 · 무료
 </div>
 </div>
 <div style={watermarkStyle}>moneysalary.com</div>
 </div>
 );
}

function renderGuideOg(title: string) {
 return (
 <div style={{ ...containerStyle, alignItems: "flex-start", justifyContent: "flex-end", padding: "60px 80px" }}>
 <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "1040px" }}>
 <div style={{ color: CANVAS, fontSize: 24, fontWeight: 900, marginBottom: 16, letterSpacing: "0.04em" }}>
 머니샐러리 · 금융 가이드
 </div>
 <div style={{ color: "white", fontSize: 56, fontWeight: 900, lineHeight: 1.2, marginBottom: 24 }}>
 {title}
 </div>
 <div style={{ color: "white", fontSize: 24, fontWeight: 600, opacity: 0.85 }}>
 직장인이 꼭 알아야 할 세금·재테크
 </div>
 </div>
 <div style={watermarkStyle}>moneysalary.com</div>
 </div>
 );
}

function renderCompanyOg(name: string) {
 return (
 <div style={containerStyle}>
 <div style={cardStyle}>
 <div style={{ color: CANVAS, fontSize: 26, fontWeight: 900, marginBottom: 14, letterSpacing: "0.04em" }}>
 머니샐러리 · 회사별 연봉
 </div>
 <div style={{ color: "white", fontSize: 64, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>
 {name}
 </div>
 <div style={{ color: "white", fontSize: 32, fontWeight: 500, opacity: 0.85 }}>
 평균 연봉 · 직급별 실수령액
 </div>
 </div>
 <div style={watermarkStyle}>moneysalary.com</div>
 </div>
 );
}

function renderDefaultOg(title: string) {
 return (
 <div style={containerStyle}>
 <div style={cardStyle}>
 <div style={{ color: CANVAS, fontSize: 28, fontWeight: 900, marginBottom: 18, letterSpacing: "0.04em" }}>
 머니샐러리
 </div>
 <div style={{ color: "white", fontSize: 60, fontWeight: 900, marginBottom: 12, textAlign: "center", lineHeight: 1.2 }}>
 {title}
 </div>
 <div style={{ color: "white", fontSize: 28, fontWeight: 500, opacity: 0.85 }}>
 2026년 최신 세법 · 무료
 </div>
 </div>
 <div style={watermarkStyle}>moneysalary.com</div>
 </div>
 );
}

export async function GET(req: NextRequest) {
 try {
 const { searchParams } = new URL(req.url);
 const type = searchParams.get("type");
 const title = searchParams.get("title") || "연봉 실수령액 계산기";

 let content;

 if (type === "salary") {
 const amount = searchParams.get("amount") || "50000000";
 const netPay = searchParams.get("net") || undefined;
 content = renderSalaryOg(amount, netPay);
 } else if (type === "tool") {
 const name = searchParams.get("name") || title;
 content = renderToolOg(name);
 } else if (type === "guide") {
 // slug보다 title이 더 사람 읽기 좋아서 title 우선 사용
 content = renderGuideOg(title);
 } else if (type === "company") {
 const name = searchParams.get("name") || title;
 content = renderCompanyOg(name);
 } else {
 // legacy 호환: amount 단독 query는 salary로 처리
 const legacyAmount = searchParams.get("amount");
 if (legacyAmount) {
 const netPay = searchParams.get("net") || undefined;
 content = renderSalaryOg(legacyAmount, netPay);
 } else {
 content = renderDefaultOg(title);
 }
 }

 return new ImageResponse(content, {
 width: 1200,
 height: 630,
 });
 } catch {
 return new Response("Failed to generate the image", { status: 500 });
 }
}
