// src/app/company/compare/page.tsx
// 서버 래퍼 — 순수 클라이언트 선택 UI(CompareSelectionClient)를 감싸 세그먼트 설정을 제공.
// "use client" 페이지에는 runtime 선언이 불가한데, 선언이 없으면 vercel build가 이 라우트를
// Node 람다로 분류해 @cloudflare/next-on-pages가 "Unable to find lambda for route:
// /company/compare"로 실패하고 21KB 스텁 워커를 생성함 (2026-08-08 로컬 실측 —
// 프로덕션에서 edge 전 라우트가 일시 404였던 관측과 동일 증상). 형제 라우트
// (company/[id], compare/[slug])와 동일하게 edge로 고정한다.
export const runtime = "edge";

import CompareSelectionClient from "./CompareSelectionClient";

export default function CompareSelectionPage() {
  return <CompareSelectionClient />;
}
