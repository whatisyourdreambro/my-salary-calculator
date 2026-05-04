import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "월급 배틀 - 누구 연봉이 더 셀까?",
 description:
 "친구·동료와 연봉 비교 배틀! 두 연봉의 세후 실수령액·티어·실구매력까지 비교해 진짜 승자를 가립니다. 결과 카드 공유 가능.",
 path: "/fun/salary-battle",
 keywords: ["월급 배틀", "연봉 비교", "친구 연봉 비교", "연봉 대결"],
});

export default function SalaryBattleLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
