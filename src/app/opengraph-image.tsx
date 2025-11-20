import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Moneysalary - 2025년 연봉 실수령액 계산기";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Noto Sans KR", sans-serif',
          color: "white",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: "60px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "30px",
            background: "rgba(255, 255, 255, 0.03)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#34d399", // Emerald-400
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Moneysalary
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: "linear-gradient(to right, #ffffff, #94a3b8)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            2025년 연봉
            <br />
            실수령액 계산기
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            최신 세법 완벽 반영 · 4대보험 · 연말정산
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          moneysalary.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
