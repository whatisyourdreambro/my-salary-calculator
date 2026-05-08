import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "자녀 양육비 시뮬 — 출생부터 대학까지 22년 누적",
 description:
 "자녀 수·교육 스타일·대학 포함 여부 → 22년 누적 양육비 + 월 평균 + 단계별 분석. 정부 지원 차감 옵션.",
 path: "/tools/family/child-cost-projection",
 keywords: ["자녀 양육비", "양육비 시뮬", "자녀 한 명 비용"],
});

export default function ChildCostProjectionLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/family/child-cost-projection", { leafName: "자녀 양육비 시뮬", overrides: { family: "가족 도구" } }),
 softwareApplicationLd({ name: "자녀 양육비 시뮬", description: "출생~대학 22년 누적 양육비 시뮬.", url: "/tools/family/child-cost-projection" }),
 faqLd([
 { question: "한국 평균 자녀 1명 양육비?", answer: "초등~고등 약 2~3억, 대학 포함 시 3~4억. 본 시뮬은 교육 스타일별 차이 반영." },
 { question: "정부 지원 얼마?", answer: "0~7세 아동수당 + 보육료 등 약 8년간 약 3,000만 합산. 출산축하금·첫만남 별도." },
 { question: "사교육비 절감 방법?", answer: "공립 학교 + 학원 1~2과목 + EBS·인터넷 강의 활용. 교육 스타일 '검소'는 약 30% 절감." },
 ]),
 ]} />
 {children}
 </>
 );
}
