// src/lib/edgeRenderedPaths.ts
//
// 요청마다 Worker 에서 React SSR 되는(edge runtime) 페이지 경로.
// 2026-09-23 Cloudflare 무료 플랜 CPU 10ms 한도(1102) 사건: 이 경로들은 매 요청 루트 레이아웃의
// 메가메뉴 패널(데스크톱+모바일 dialog, ~330KB·SVG 350개)까지 다시 그려 CPU 한도를 넘겼다.
// Header 는 이 경로에서만 패널 내용을 하이드레이션 뒤 렌더한다(상단 바·트리거는 SSR 유지).
// 프리렌더 페이지(~2,000)는 목록에 넣지 말 것 — 정적 HTML 의 내부 링크(크롤 경로)가 사라진다.
//
// 한글 슬러그 상세(/glossary/[slug]·/qna/[slug])는 CF Pages 가 비ASCII 프리렌더를 못 서빙해
// edge 로 남아 있고(project_cf_pages_deploy_facts), /share/[data]는 페이로드별 동적 페이지다.
//
// 정확히 "한 세그먼트"만 매칭한다: 허브(/glossary, /qna)는 정적이고, 2세그먼트 이상
// (/glossary/a/b)은 어느 라우트에도 안 잡혀 CF 가 프리렌더된 전역 404(_not-found.html,
// 패널 전체 포함)를 서빙하므로 여기서 true 를 주면 서버 HTML(패널 있음)과 클라이언트 첫
// 렌더(패널 없음)가 어긋나 하이드레이션 불일치가 난다(2026-09-23 리뷰). 단일 세그먼트는
// 존재 여부와 무관하게 항상 edge 함수가 그린다(미존재 슬러그의 notFound() 포함).
const EDGE_RENDERED_PATH = /^\/(share|glossary|qna)\/[^/]+$/;

export function isEdgeRenderedPath(pathname: string | null | undefined): boolean {
  return !!pathname && EDGE_RENDERED_PATH.test(pathname);
}
