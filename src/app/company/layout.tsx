import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";

// 2026-08-24 점검: 이 layout의 metadata(canonical=/company)가 하위 simulator·compare에
// 상속되고 있었는데 /company 자체는 next.config 301(→/salary-db) 대상이라 "리다이렉트
// URL을 canonical로 선언"하는 모순이었다. metadata는 각 하위 라우트로 이동, breadcrumb도
// 실존 허브(/salary-db)로 정정.

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "연봉 DB", path: "/salary-db" },
 ])}
 />
 {children}
 {/* /company 와 /company/compare, /company/simulator 자동 광고 적용 */}
 <PageFooterAds maxWidth="5xl" />
 {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
 <AutoShareSection contentType="company" maxWidth="5xl" className="pb-16" />
 </>
 );
}
