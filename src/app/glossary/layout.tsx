import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { glossaryData } from "@/data/glossaryData";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";

export const metadata: Metadata = buildPageMetadata({
 title: `금융 용어 사전 - 4대보험·세금·재테크 핵심 용어 ${glossaryData.length}개`,
 description:
 "직장인이 꼭 알아야 할 4대보험, 세금, 부동산, 투자 용어를 쉬운 비유로 설명합니다. 검색·카테고리·랜덤 학습까지 한 페이지에서.",
 path: "/glossary",
 keywords: ["금융 용어", "세금 용어", "4대보험 용어", "재테크 용어", "용어 사전"],
});

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 {/* BreadcrumbList 는 페이지 단위(index·[slug])가 담당 — layout 이중 주입 시 잎 이름이 다른 목록 2개가
     같은 문서에 실려 구글이 잎을 임의 선택한다(2026-07-06 전 사이트 제거 사고의 재발, 2026-09-11 감사).
     DefinedTermSet(용어 50개·약 7KB)도 인덱스 page 로 이동 — 용어별 edge 렌더마다 싣지 않는다 (META-10, 2026-09-25). */}
 {children}
 {/* 58개 용어 동적 + 메인 = 정의 검색 트래픽 광고 적용 */}
 <PageFooterAds maxWidth="3xl" />
 {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
 <AutoShareSection contentType="page" maxWidth="3xl" className="pb-16" />
 </>
 );
}
