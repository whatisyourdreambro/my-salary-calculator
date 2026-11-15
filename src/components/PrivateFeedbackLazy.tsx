"use client";

// 2026-11-15 N2-perf-04 (lens-perf-F09): 회사 페이지(/salary-db/[id])는 삼성전자 한 곳에서만 비공개 의견 폼을 그리는데,
// 정적 import 라 폼·의견 상자·단어 필터 청크(약 23KB, gzip 8KB)가 회사 페이지 430쪽 전부의 첫 로드에 실렸다.
// 이 래퍼는 폼을 next/dynamic 으로 불러 나머지 429쪽에서 그 청크를 뺀다. 삼성전자 페이지 서버 HTML 에는 폼이 그대로 있다
// (ssr 기본값 true — 하이드레이션 때 청크가 아직 없으면 서버 HTML 을 그대로 두고 기다린다, 높이 변화 없음).
//
// ★ loading 옵션이나 ssr:false 를 절대 넣지 말 것. 둘 중 하나라도 있으면 next/dynamic 이 Suspense 경계를 만들어
//   (next 15.5 shared/lib/lazy-dynamic/loadable.js: hasSuspenseBoundary = !opts.ssr || !!opts.loading)
//   클라이언트 전환으로 삼성전자 페이지에 들어올 때 폼 자리가 비었다가 늦게 나타나고, 그 아래 HomeTopAd·SidebarAd 가 밀린다.
//   src/lib/__tests__/privateFeedbackLazy.test.ts 가 이 형태를 고정한다.
// /calc/samsung-bonus·/civil-servant-pay-2027 은 폼을 늘 그리므로 정적 import 를 그대로 쓴다.
import dynamic from "next/dynamic";
import type { FixedFeedbackTarget } from "@/lib/fixedFeedbackContract";

const PrivateFeedback = dynamic(() => import("./PrivateFeedback"));

export default function PrivateFeedbackLazy({ target }: { target: FixedFeedbackTarget }) {
  return <PrivateFeedback target={target} />;
}
