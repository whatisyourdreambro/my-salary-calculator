import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "더치페이 계산기 — 인원·비율별 정산 + 1원 단위 분배",
 description: "총액·인원수 입력 → 1인당 분배 + 잔돈 처리. 술 차등·비율 정산까지 한 번에.",
 path: "/tools/life/dutch-pay",
 keywords: ["더치페이 계산기", "1/N 정산", "회식 더치페이", "비율 정산"],
});

const FAQ_ITEMS = [
 { question: "더치페이 = 1/N?", answer: "기본은 1/N. 잔돈은 1명이 부담. 더 정확하게 1원 단위까지 나누면 송금 시 수수료 부담." },
 { question: "술 마신 사람만 더 내려면?", answer: "비율 정산 가능 — 음식만 1배, 술 포함 1.5배. 본 계산기는 균등·비율 둘 다 지원." },
 { question: "송금 수수료 절약은?", answer: "토스·카카오페이는 친구 송금 무료. 은행 앱은 동일 은행끼리 무료, 타행은 500원 안팎." },
 { question: "회식 결제 후 N분의 1 처리는?", answer: "결제자가 본인 카드로 한꺼번에 결제 후 인원 수만큼 분배 → 송금 받음. 카카오톡 송금하기 활용." },
];

export default function DutchPayLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/life/dutch-pay", { leafName: "더치페이 계산기" }),
 softwareApplicationLd({ name: "더치페이 계산기", description: "인원·비율별 정산 무료 계산기.", url: "/tools/life/dutch-pay" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "더치페이 정산 3단계", description: "총액 → 1인당 분배", totalTime: "PT2M", steps: [
 { name: "Step 1. 총액·인원 입력", text: "결제 총액 + 참여 인원." },
 { name: "Step 2. 비율 결정", text: "균등 또는 차등 (술 포함 등)." },
 { name: "Step 3. 1인당 + 잔돈 분배", text: "잔돈은 1명이 부담." },
 ] }),
 ]} />
 {children}
 </>
 );
}
