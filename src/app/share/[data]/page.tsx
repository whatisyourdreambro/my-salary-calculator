// src/app/share/[data]/page.tsx

import type { Metadata } from "next";
import ShareableResult from "@/components/ShareableResult";
import { CalcResultAd } from "@/components/AdPlacement";
import { Suspense } from "react";
import { calculateNetSalary } from "@/lib/calculator";
import NextActions from "@/components/NextActions";
import RelatedCalculators from "@/components/RelatedCalculators";

// [수정] Cloudflare Pages 배포를 위해 Edge 런타임 설정을 추가합니다.

export const runtime = 'edge';

type Props = {
 params: { data: string };
};

// 공유 데이터를 디코딩해 실제 실수령액을 복원 (ShareableResult와 동일 로직).
// 실패 시 null → 기본 메타데이터로 폴백.
function decodeShared(data: string): { annualSalary: number; monthlyNet: number } | null {
 try {
 const { annualSalary, nonTaxableAmount, dependents, children } = JSON.parse(atob(data));
 if (typeof annualSalary !== "number" || annualSalary <= 0) return null;
 const { monthlyNet } = calculateNetSalary(
 annualSalary,
 (nonTaxableAmount || 0) * 12,
 dependents || 1,
 children || 0,
 { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 }
 );
 return { annualSalary, monthlyNet };
 } catch {
 return null;
 }
}

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
 const title = `💰 연봉 ${annualManwon}만원이면 월 실수령 ${netManwon}만원!`;
 const description = `2026년 세법 기준 실수령액이에요. 내 연봉도 1초만에 계산해볼까요? 👀`;
 const ogImage = `/api/og?type=salary&amount=${decoded.annualSalary}&netPay=${decoded.monthlyNet}`;

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
 {/* 결과 카드 직하 광고 — 과밀 방지를 위해 1개만 배치 */}
 <div className="w-full mt-8">
 <CalcResultAd />
 </div>

 {/* 다음 액션 + 관련 계산기 — 유입 방문자를 사이트 탐색으로 유도 */}
 <div className="w-full mt-8 space-y-6">
 <NextActions annualSalary={decoded?.annualSalary} category="salary" />
 <RelatedCalculators currentPath="/" title="이런 계산기도 함께 보세요" />
 </div>
 </main>
 );
}
