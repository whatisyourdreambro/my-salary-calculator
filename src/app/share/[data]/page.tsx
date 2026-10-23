// src/app/share/[data]/page.tsx

import type { Metadata } from "next";
import ShareableResult from "@/components/ShareableResult";
import { CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Suspense } from "react";
import { decodeSharedSalary } from "@/lib/salarySharePayload";
import NextActions from "@/components/NextActions";
import RelatedCalculators from "@/components/RelatedCalculators";
import { nextActionHrefs } from "@/lib/nextActionLinks";
import ResultSharePanel from "@/components/ResultSharePanel";

const SITE_URL = "https://www.moneysalary.com";

// [수정] Cloudflare Pages 배포를 위해 Edge 런타임 설정을 추가합니다.


type Props = {
 params: Promise<{ data: string }>;
};

// 공유 데이터를 디코딩해 실제 실수령액을 복원 (ShareableResult와 동일 로직).
// 실패 시 null → 기본 메타데이터로 폴백.
const decodeShared = decodeSharedSalary;

// 기존 토큰 결과는 본문에서 복원한다. 링크 미리보기와 원격 이미지 URL에는 개인값을 넣지 않는다.
export async function generateMetadata({ params: pendingParams }: Props): Promise<Metadata> {
 const params = await pendingParams;
 const decoded = decodeShared(params.data);

 if (!decoded) {
 return {
 // 브랜드는 루트 layout 템플릿('%s | 머니샐러리')이 한 번만 붙인다 — 종전 '— 머니샐러리' 는 브랜드 2회 노출
 title: "공유된 연봉 결과",
 description: "공유된 연봉 계산 결과 페이지",
 robots: { index: false, follow: false },
 };
 }

 const title = "공유된 연봉 결과";
 const description = "공유된 연봉 계산 결과 페이지";
 const ogImage = `${SITE_URL}/og-default.png`;

 return {
 title,
 description,
 robots: { index: false, follow: false },
 // 이 openGraph 객체가 루트 openGraph 를 통째로 대체하므로 type·locale·siteName·url 을 여기서 다시 채운다 (OG-11)
 openGraph: {
 type: "website",
 locale: "ko_KR",
 siteName: "머니샐러리",
 url: `${SITE_URL}/`,
 title,
 description,
 images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
 },
 twitter: {
 card: "summary_large_image",
 title,
 description,
 images: [ogImage],
 },
 };
}

export default async function SharePage({ params: pendingParams }: Props) {
 const params = await pendingParams;
 // 공유 링크로 들어온 신규 방문자 — 결과만 보고 이탈하지 않도록
 // 다음 액션·관련 계산기를 붙여 세션당 페이지뷰를 늘린다 (바이럴→탐색 전환).
 const decoded = decodeShared(params.data);

 return (
 <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[70vh]">
 <Suspense fallback={<div>결과를 불러오는 중...</div>}>
 <ShareableResult data={params.data} />
 </Suspense>
 {/* 결과 카드 직하 광고 — 과밀 방지를 위해 1개만 배치.
     디코드 실패(잘못된 공유 링크) 시에는 콘텐츠 없는 오류 화면이므로
     광고 미노출 (AdSense 무가치 화면 게재 정책 방어, 운영자 승인 2026-07-13) */}
 {decoded && (
 <div className="w-full mt-8">
 <CalcResultAd />
 </div>
 )}
 {/* 쿠팡 배너 — 카톡 공유 유입 랜딩의 쿠팡 인벤토리 0 해소 (2026-08-17 수익
     감사, 운영자 승인 — 2026-07-13 "광고 1개" 결정은 AdSense 유닛 기준이며
     이번 승인으로 쿠팡 1개 추가. 위치는 기존 광고 아래 고정, 위 배치 금지) */}
 {decoded && (
 <div className="w-full mt-4">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 category="salary"
 />
 </div>
 )}

 {/* 재공유 루프 — 공유받고 들어온 사람이 다시 단톡방에 퍼뜨리는 지점 */}
 {decoded && (
 <div className="w-full mt-8">
 <ResultSharePanel
 resultKey={params.data}
 pageUrl="https://www.moneysalary.com/"
 pageTitle="2026 연봉 실수령액 계산기 | 머니샐러리"
 pageDescription="소득 조건을 입력해 월 수령액을 계산해 보세요."
 previewDescription="아래 문구에 표시된 원래 공유자의 소득과 수령 추정액을 공개해도 되는지 확인해 주세요. 새 링크와 링크 미리보기 이미지에는 원래 입력을 넣지 않으며, 받은 사람이 입력 조건을 복원할 수 없습니다."
 url={`${SITE_URL}/`}
 title={`${decoded.regular ? "연봉" : "연 환산 소득"} ${decoded.annualSalary.toLocaleString("ko-KR")}원 · 월 수령 추정 ${decoded.monthlyNet.toLocaleString("ko-KR")}원`}
 description={decoded.modelLabel}
 contentType="salary_result"
 />
 </div>
 )}

 {/* 다음 액션 + 관련 계산기 — 유입 방문자를 사이트 탐색으로 유도 */}
 <div className="w-full mt-8 space-y-6">
 <NextActions annualSalary={decoded?.annualSalary} category="salary" />
 {/* 위 NextActions(salary 3종)와 같은 대상은 빼고 채움 — 4개 유지. 종전에는 /year-end-tax 가 두 블록에 겹쳤다
     (S2-3 중복 제거의 누락분, 2026-09-12 리뷰 지적 — /salary/[amount] 와 같은 exclude) */}
 <RelatedCalculators currentPath="/" title="이런 계산기도 함께 보세요" exclude={nextActionHrefs("salary")} />
 </div>
 </main>
 );
}
