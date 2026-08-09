// TEMP 진단 페이지 (2026-08-08) — 프로덕션 CF 빌드에서 "페이지" 파이프라인의
// 동적 파라미터가 어떤 형태로 도착하는지 실측용. route 핸들러(/api/param-echo)는
// 정상 수신이 확인됐으나 /glossary·/qna "페이지"는 여전히 매칭 실패라
// 페이지 경로의 파라미터 전달만 남은 용의자다. 원인 확정 후 즉시 삭제.
import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "debug",
  robots: { index: false, follow: false },
};

export default function DebugParamPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const s = String(params?.slug ?? "");
  const codes = Array.from(s).map((c) => c.charCodeAt(0)).join(",");
  return (
    <main style={{ fontFamily: "monospace", padding: 24 }}>
      <div id="raw">raw:{s}</div>
      <div id="len">len:{s.length}</div>
      <div id="codes">codes:{codes}</div>
      <div id="pj">params:{JSON.stringify(params)}</div>
      <div id="sp">searchParams:{JSON.stringify(searchParams)}</div>
    </main>
  );
}
