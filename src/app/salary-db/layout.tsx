import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import FloatingShareBar from "@/components/FloatingShareBar";

export const metadata: Metadata = buildPageMetadata({
 title: "회사별 연봉 데이터베이스 — 430+ 기업 평균 연봉·복지·워라밸",
 description:
 "삼성전자, 네이버, 카카오, 현대차, SK하이닉스 등 430+ 한국 기업의 직급별 연봉, 복지, 워라밸 데이터를 한눈에 비교하세요. 같은 업종 평균과 차이도 자동 계산.",
 path: "/salary-db",
 keywords: [
 "회사별 연봉",
 "기업 연봉 비교",
 "대기업 연봉",
 "IT 회사 연봉",
 "삼성전자 연봉",
 "네이버 연봉",
 "카카오 연봉",
 "현대차 연봉",
 ],
});

export default function SalaryDbLayout({ children }: { children: React.ReactNode }) {
 // breadcrumb JSON-LD는 페이지 단위로 이전(2026-08-07) — layout이 2단 크럼을
 // 하위 전체에 주입하면 자체 breadcrumb을 가진 [id]·ranking·compare 페이지에서
 // BreadcrumbList가 이중 주입됐다. 인덱스 크럼은 salary-db/page.tsx가 담당.
 return (
 <>
 {children}
 {/* 회사 페이지(/salary-db/[id]) 는 자체 광고 풍부하지만 메인·비교 페이지는 부족.
     layout 자동 광고로 회사 검색 트래픽 수익 회복. /salary-db/submit 도 포함되지만
     폼 페이지라 별 영향 없음. */}
 <PageFooterAds maxWidth="5xl" />
 {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
 <AutoShareSection contentType="company" maxWidth="5xl" className="pb-16" />
 {/* "{회사명} 연봉" 검색 = 최대 유입 엔진. 히어로 공유가 스크롤 밖으로
     사라진 뒤에도 모바일에서 공유 접점 유지 (광고·PWA 배너 감지 시 자동 숨김) */}
 <FloatingShareBar />
 </>
 );
}
