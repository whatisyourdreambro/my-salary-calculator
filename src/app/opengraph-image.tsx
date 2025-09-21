// src/app/opengraph-image.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Moneysalary Open Graph Image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // 폰트 데이터를 가져오는 로직은 실제 프로젝트에 맞게 경로를 확인해야 합니다.
  // public 폴더에 폰트 파일이 있다고 가정합니다.
  const interSemiBold = fetch(
    new URL("../../public/Inter-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interBold = fetch(
    new URL("../../public/Inter-Bold.ttf", import.meta.url)
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
          backgroundColor: "#111827",
          color: "#F9FAFB",
          fontFamily: '"Inter", sans-serif',
          padding: "40px",
          position: "relative",
        }}
      >
        {/* [수정] ESLint 경고를 비활성화하는 주석을 추가했습니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Moneysalary Logo"
          src="https://www.moneysalary.com/logo-full.png"
          width="120"
          height="120"
          style={{ position: "absolute", top: 40, left: 40 }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 20,
            textAlign: "center",
            lineHeight: "1.2",
            color: "#FFFFFF",
          }}
        >
          Moneysalary 연봉 계산기
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            maxWidth: "80%",
            color: "#D1D5DB",
            lineHeight: "1.4",
          }}
        >
          2025년 최신 기준, 가장 정확한 연봉 실수령액을 계산해보세요.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            fontSize: 24,
            color: "#6B7280",
          }}
        >
          moneysalary.com
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Inter",
          data: await interBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
