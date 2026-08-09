// TEMP 진단 라우트 (2026-08-08) — CF 프로덕션 빌드에서 한글 동적 파라미터가
// 어떤 형태로 도착하는지 실측하기 위한 임시 엔드포인트.
// /glossary·/qna 한글 슬러그 308 문제의 원인 확정 후 즉시 삭제 예정.
// noindex 헤더로 색인 차단. 민감 정보 없음(요청 경로를 그대로 되돌려줄 뿐).
export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const s = String(params.slug ?? "");
  return new Response(
    JSON.stringify({
      raw: s,
      codes: Array.from(s).map((c) => c.charCodeAt(0)),
      url: req.url,
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
        "cache-control": "no-store",
      },
    }
  );
}
