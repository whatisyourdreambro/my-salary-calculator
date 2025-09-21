// src/app/opengraph-image.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

// [수정] Next.js의 opengraph-image.tsx 규칙에 맞게 GET export 대신 default export를 사용하도록 수정했습니다.
// 이렇게 하면 빌드 시 GET 함수 중복 선언 오류가 해결됩니다.
export default async function Image() {
  const title = "Moneysalary 연봉 계산기";
  const description =
    "2025년 최신 기준, 가장 정확한 연봉 실수령액을 계산해보세요.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0052ff",
          color: "white",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: "bold" }}>Moneysalary</div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 25,
            textAlign: "center",
            color: "#e0e0e0",
            padding: "0 80px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
        <div
          style={{
            fontSize: 28,
            position: "absolute",
            bottom: 50,
            right: 60,
            opacity: 0.8,
          }}
        >
          moneysalary.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
