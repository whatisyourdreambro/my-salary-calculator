// src/app/share/[data]/page.tsx

import type { Metadata } from "next";
import ShareableResult from "@/components/ShareableResult";
import { CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Suspense } from "react";
import { decodeSharedSalary, encodeSalarySharePayload } from "@/lib/salarySharePayload";
import NextActions from "@/components/NextActions";
import RelatedCalculators from "@/components/RelatedCalculators";
import ResultSharePanel from "@/components/ResultSharePanel";

// [수정] Cloudflare Pages 배포를 위해 Edge 런타임 설정을 추가합니다.

export const runtime = 'edge';

type Props = {
 params: { data: string };
};

// 공유 데이터를 디코딩해 실제 실수령액을 복원 (ShareableResult와 동일 로직).
// 실패 시 null → 기본 메타데이터로 폴백.
const decodeShared = decodeSharedSalary;

// 공유 링크가 카톡·SNS에서 열렸을 때 '실제 금액'이 보이는 미리보기 카드를 생성.
// 밋밋한 기본 로고 대신 호기심을 자극하는 문구 + 동적 OG 이미지(실수령액)로
// 단톡방 클릭률을 끌어올린다 (바이럴 유입 루프의 핵심).
export function generateMetadata({ params }: Props): Metadata {
 const decoded = decodeShared(params.data);

 if (!decoded) {
 return {
 title: "공유된 연봉 결과 — 머니샐러리",
 description: "공유된 연봉 계산 결과 페이지",
 robots: { index: false, follow: false },
 };
 }

 const annualManwon = Math.round(decoded.annualSalary / 10000).toLocaleString("ko-KR");
 const netManwon = Math.round(decoded.monthlyNet / 10000).toLocaleString("ko-KR");
 const title = `${decoded.regular ? "연봉" : "연 환산 소득"} ${annualManwon}만원 · 월 수령 추정 ${netManwon}만원`;
 const description = `${decoded.modelLabel}. 공유자가 입력한 조건에 따른 추정액입니다.`;
 // /api/og는 net= 파라미터를 읽음 (netPay= 오기로 실수령액이 안 찍히던 버그 수정)
 const ogImage = `/api/og?type=salary&amount=${decoded.annualSalary}&net=${decoded.monthlyNet}`;

 return {
 title,
 description,
 robots: { index: false, follow: false },
 openGraph: {
 title,
 description,
 images: [{ url: ogImage, width: 1200, height: 630 }],
 },
 twitter: {
 card: "summary_large_image",
 title,
 description,
 images: [ogImage],
 },
 };
}

export default function SharePage({ params }: Props) {
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
 previewDescription={`다시 공유하는 링크에는 원래 공유자의 ${"annualSalary" in decoded.payload ? `연봉 ${decoded.annualSalary.toLocaleString("ko-KR")}원, 월 비과세액 ${decoded.payload.nonTaxableAmount.toLocaleString("ko-KR")}원, 본인 포함 부양가족 ${decoded.payload.dependents}명, 공제 대상 자녀 ${decoded.payload.children}명` : `소득 유형 ${decoded.payload.incomeType === "freelancer" ? "프리랜서" : "알바"}, 세전 월 소득 ${decoded.payload.monthlyIncome.toLocaleString("ko-KR")}원`}이 포함됩니다. 공개해도 되는지 확인해 주세요. 기본 페이지 링크에는 해당 결과를 넣지 않습니다.`}
 url={`https://www.moneysalary.com/share/${encodeSalarySharePayload(decoded.payload)}`}
 title={`${decoded.regular ? "연봉" : "연 환산 소득"} ${decoded.annualSalary.toLocaleString("ko-KR")}원 · 월 수령 추정 ${decoded.monthlyNet.toLocaleString("ko-KR")}원`}
 description={decoded.modelLabel}
 imageUrl={`https://www.moneysalary.com/api/og?type=salary&amount=${decoded.annualSalary}&net=${decoded.monthlyNet}`}
 contentType="salary_result"
 />
 </div>
 )}

 {/* 다음 액션 + 관련 계산기 — 유입 방문자를 사이트 탐색으로 유도 */}
 <div className="w-full mt-8 space-y-6">
 <NextActions annualSalary={decoded?.annualSalary} category="salary" />
 <RelatedCalculators currentPath="/" title="이런 계산기도 함께 보세요" />
 </div>
 </main>
 );
}
