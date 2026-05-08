import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "노후 자금 시뮬레이터 — 자산 + 국민연금 + 인플레이션 30년",
 description:
 "현재 자산·월 저축·연 수익률·국민연금 입력 → 은퇴 시점 자산 + 4% 룰 인출 + 30년 추이. 목표 달성 가능 여부 + 추가 저축 권장액.",
 path: "/tools/career/retirement-projection",
 keywords: ["노후 자금 시뮬", "은퇴 시뮬레이터", "노후 자금 계산", "은퇴 자산"],
});

const FAQ_ITEMS = [
 { question: "4% 룰이 무엇?", answer: "은퇴 자산의 4%만 매년 인출하면 평생 원금 안 마름 (트리니티 연구). 즉, 연 4,000만 생활비면 자산 10억. 한국은 부동산·의료비 추가로 25배 → 30배 권장." },
 { question: "60~64세 갭 어떻게?", answer: "국민연금은 65세부터. 60세 은퇴 시 5년 갭 발생. IRP·연금저축 + 자산 인출로 메꿔야. 본 시뮬은 갭 기간 추가 자금 필요액 자동 계산." },
 { question: "인플레이션 반영은?", answer: "연 2.5% 인플레이션 가정 (한국 평균). 30년 후 같은 금액의 가치는 약 절반. 본 시뮬은 목표 월 소득을 자동 인플레 반영." },
 { question: "수익률 가정 어떻게?", answer: "보수적 5% (채권+예금), 균형 6%, 공격 7% (주식 비중↑). 한국 코스피 30년 약 5%, S&P500 약 10%. 60대 이후엔 5%로 낮추는 게 안전." },
 { question: "국민연금 정확한 수령액?", answer: "NPS '내 연금 알아보기' (csa.nps.or.kr). 가입 내역 + 미래 가정 입력 시 정확. 본 시뮬은 입력값 기준 가정." },
];

export default function RetirementProjectionLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/career/retirement-projection", { leafName: "노후 자금 시뮬", overrides: { career: "커리어 도구" } }),
 softwareApplicationLd({ name: "노후 자금 시뮬레이터", description: "자산 + 국민연금 + 인플레이션 30년 시뮬.", url: "/tools/career/retirement-projection" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "노후 자금 시뮬 3단계", description: "현재 → 저축 → 목표 → 시뮬 결과", totalTime: "PT5M", steps: [
 { name: "Step 1. 현재 상황", text: "나이·은퇴 희망 나이·자산." },
 { name: "Step 2. 저축·수익률·국민연금", text: "월 저축 + 연 수익률 + 국민연금." },
 { name: "Step 3. 목표 월 생활비", text: "현재 가치 기준 입력." },
 ] }),
 ]} />
 {children}
 </>
 );
}
