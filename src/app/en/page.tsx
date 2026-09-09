import { enGuideCards } from "@/lib/guidesData";
import EnLandingClient from "./EnLandingClient";
import JsonLd from "@/components/JsonLd";
import { softwareApplicationLd } from "@/lib/structuredData";

// 영어 랜딩은 서버 컴포넌트로 유지 — 본문(content) 없는 카드 6개만 클라이언트에
// props 로 전달해 First Load JS 에서 가이드 본문을 제거한다.
// (페이지 메타데이터는 en/layout.tsx 가 제공)
export default function EnLandingPage() {
  const featuredSlugs = ["four-major-insurance-complete", "samsung-vs-hynix-employee-comparison", "year-end-tax-deductions-guide", "health-insurance-2026-guide", "loan-types-comparison-2026", "chip-stock-tax-guide"];
  const featured = featuredSlugs.flatMap((slug) => { const guide = enGuideCards.find((card) => card.slug === slug); return guide ? [guide] : []; });
  return <><JsonLd data={softwareApplicationLd({ name: "Korea Salary Calculator 2026", description: "A simplified regular-employee Korean take-home salary estimate with stated insurance and tax assumptions.", url: "/en", inLanguage: "en" })} /><EnLandingClient guides={featured} /></>;
}
