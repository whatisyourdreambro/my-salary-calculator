// src/app/opengraph-image.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Moneysalary Open Graph Image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// [수정] export default async function으로 구조를 변경하여 빌드 오류를 해결합니다.
export default async function Image() {
  const notoBold = fetch(
    "https://www.moneysalary.com/fonts/NotoSansKR-Bold.ttf"
  ).then((res) => res.arrayBuffer());
  const notoRegular = fetch(
    "https://www.moneysalary.com/fonts/NotoSansKR-Regular.ttf"
  ).then((res) => res.arrayBuffer());

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
          fontFamily: '"Noto Sans KR", sans-serif',
          padding: "80px",
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
            fontSize: 68,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.3,
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          2025년 연봉 실수령액 계산기
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
          최신 세법 기준, 당신의 진짜 월급을 확인하고 미래를 계획하세요.
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
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: await notoRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Noto Sans KR",
          data: await notoBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
