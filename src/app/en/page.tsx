import { enGuideCards } from "@/lib/guidesData";
import EnLandingClient from "./EnLandingClient";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

// 영어 랜딩은 서버 컴포넌트로 유지 — 본문(content) 없는 카드 6개만 클라이언트에
// props 로 전달해 First Load JS 에서 가이드 본문을 제거한다.
// (페이지 메타데이터는 en/layout.tsx 가 제공)
export default function EnLandingPage() {
 return (
 <>
 {/* JSON-LD 0건이던 /en 루트에 breadcrumb 추가 (2026-08-24).
     autoBreadcrumbLd는 한국어 라벨("홈")이 섞여 en/guides/[slug]와 동일하게
     영문 라벨 breadcrumbLd 사용 */}
 <JsonLd data={breadcrumbLd([{ name: "Home", path: "/en" }])} />
 <EnLandingClient guides={enGuideCards.slice(0, 6)} />
 </>
 );
}
