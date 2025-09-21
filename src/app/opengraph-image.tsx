// src/app/opengraph-image.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") ?? "나의 연봉은 얼마일까?";
    const rank = searchParams.get("rank");
    const salary = searchParams.get("salary");
    const description =
      searchParams.get("description") ?? "Moneysalary.com 에서 확인해보세요";

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
            fontFamily: "sans-serif", // [수정] 시스템 기본 폰트를 사용합니다.
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
          {salary && (
            <div
              style={{
                fontSize: 42,
                marginTop: 20,
                textAlign: "center",
                color: "#e0e0e0",
              }}
            >
              연봉: {parseInt(salary, 10).toLocaleString()}원
            </div>
          )}
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
          {rank && (
            <div
              style={{
                fontSize: 52,
                marginTop: 30,
                padding: "12px 35px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "3px solid white",
                borderRadius: "20px",
                textAlign: "center",
              }}
            >
              상위 {rank}%
            </div>
          )}
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
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(`${e.message}`);
    } else {
      console.error(e);
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
