// src/app/api/og/route.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 파라미터 파싱
    const title = searchParams.get("title") ?? "나의 연봉은 얼마일까?";
    const rank = searchParams.get("rank");
    const salary = searchParams.get("salary");

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
            backgroundColor: "#007FFF",
            color: "white",
            fontFamily: '"Noto Sans KR", sans-serif',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.moneysalary.com/logo-full.png"
            alt="Moneysalary Logo"
            width={300}
            style={{ position: "absolute", top: 50, left: 50 }}
          />
          <div style={{ fontSize: 72, fontWeight: 700, textAlign: "center" }}>
            {title}
          </div>
          {salary && (
            <div style={{ fontSize: 48, marginTop: 30, textAlign: "center" }}>
              연봉: {parseInt(salary, 10).toLocaleString()}원
            </div>
          )}
          {rank && (
            <div
              style={{
                fontSize: 60,
                marginTop: 40,
                padding: "10px 30px",
                border: "4px solid white",
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
              bottom: 40,
              right: 60,
            }}
          >
            Moneysalary.com
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
