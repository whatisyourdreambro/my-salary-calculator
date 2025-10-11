// src/app/api/og/route.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") ?? "나의 연봉은 얼마일까?";
    const rank = searchParams.get("rank");
    const description =
      searchParams.get("description") ?? "Moneysalary.com 에서 확인해보세요";

    // Fetch fonts from CDN
    const notoSansKrBold = fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.13/files/noto-sans-kr-korean-700-normal.woff2'
    ).then((res) => res.arrayBuffer());
    const notoSansKrRegular = fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.13/files/noto-sans-kr-korean-400-normal.woff2'
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
            backgroundColor: "#1a1a1a",
            backgroundImage: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
            color: "white",
            fontFamily: '"Noto Sans KR"',
            padding: "60px",
          }}
        >
            <img 
                src="https://www.moneysalary.com/logo-full.png" 
                width="180" 
                style={{ position: 'absolute', top: 60, left: 60, opacity: 0.8 }}
            />
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.2,
              padding: "0 80px",
              textShadow: "0px 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 36,
              marginTop: 30,
              textAlign: "center",
              color: "#b0b0b0",
              padding: "0 100px",
              lineHeight: 1.5,
              textShadow: "0px 2px 5px rgba(0,0,0,0.3)"
            }}
          >
            {description}
          </div>
          {rank && (
            <div
              style={{
                fontSize: 52,
                marginTop: 40,
                padding: "15px 40px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "2px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "100px",
                textAlign: "center",
                fontWeight: 700,
                textShadow: "0px 1px 3px rgba(0,0,0,0.3)"
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
              opacity: 0.7,
              color: "#b0b0b0"
            }}
          >
            Moneysalary.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Noto Sans KR",
            data: await notoSansKrRegular,
            style: "normal",
            weight: 400,
          },
          {
            name: "Noto Sans KR",
            data: await notoSansKrBold,
            style: "normal",
            weight: 700,
          },
        ],
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
