"use client";

// app/global-error.tsx — 루트 layout 자체 throw 캐치용 최후의 boundary.
// 자체 <html><body>를 포함해야 함 (App Router 규약).
// 외부 스크립트/스타일 의존 0 — 디스크에 박힌 인라인 스타일로만 동작 보장.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[GlobalError:root]", error.message, error.digest);
    }
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#EDF1F5",
          color: "#0A1829",
          fontFamily:
            '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <main
          role="alert"
          aria-live="assertive"
          style={{
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#FEE2E2",
              color: "#DC2626",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 900,
              marginBottom: "1.5rem",
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              margin: "0 0 0.75rem",
              color: "#0A1829",
            }}
          >
            페이지를 불러올 수 없습니다
          </h1>
          <p
            style={{
              color: "#3D5E78",
              lineHeight: 1.6,
              margin: "0 0 2rem",
              fontSize: "0.9375rem",
            }}
          >
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            {error?.digest && (
              <span
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#7A9AB5",
                }}
              >
                오류 ID: {error.digest}
              </span>
            )}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                appearance: "none",
                cursor: "pointer",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.875rem",
                background: "#0145F2",
                color: "#FFFFFF",
                border: "2px solid #0145F2",
                fontWeight: 800,
                fontSize: "0.9375rem",
                width: "100%",
                maxWidth: "240px",
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.875rem",
                background: "#FFFFFF",
                color: "#0A1829",
                border: "2px solid #C8D4E0",
                fontWeight: 800,
                fontSize: "0.9375rem",
                textDecoration: "none",
                width: "100%",
                maxWidth: "240px",
                boxSizing: "border-box",
              }}
            >
              홈으로
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
