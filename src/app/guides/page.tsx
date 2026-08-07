import { koGuideCards, categories } from "@/lib/guidesData";
import JsonLd from "@/components/JsonLd";
import { itemListLd } from "@/lib/structuredData";
import GuidesListClient from "./GuidesListClient";

// 목록 페이지는 서버 컴포넌트로 유지 — 본문(content) 없는 카드 메타만 클라이언트에
// props 로 전달해 First Load JS 에서 가이드 본문(~888KB)을 제거한다.
// (페이지 메타데이터는 guides/layout.tsx 가 제공)
export default function GuidesPage() {
  // 목록 페이지 ItemList 구조화데이터 — 조회수 상위 30개 가이드만
  // (salary-db/page.tsx 패턴. breadcrumb 없음 — layout 도 미주입이라 중복 없음)
  const topGuides = [...koGuideCards]
    .sort((a, b) => b.views - a.views)
    .slice(0, 30)
    .map((g) => ({
      name: g.title,
      url: `/guides/${g.slug}`,
    }));

  return (
    <>
      <JsonLd data={itemListLd({ name: "금융·연봉 가이드", items: topGuides })} />
      <GuidesListClient guides={koGuideCards} categories={categories} />
    </>
  );
}
