import { koGuideCards, categories } from "@/lib/guidesData";
import GuidesListClient from "./GuidesListClient";

// 목록 페이지는 서버 컴포넌트로 유지 — 본문(content) 없는 카드 메타만 클라이언트에
// props 로 전달해 First Load JS 에서 가이드 본문(~888KB)을 제거한다.
// (페이지 메타데이터는 guides/layout.tsx 가 제공)
export default function GuidesPage() {
  return <GuidesListClient guides={koGuideCards} categories={categories} />;
}
