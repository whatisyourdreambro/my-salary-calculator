import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "복리 계산기 - 적립식 투자 자산 시뮬레이션 (2026)",
 description:
 "월 적립금, 연 수익률, 투자 기간만 입력하면 복리 효과로 늘어나는 미래 자산을 즉시 시뮬레이션합니다. 단리 vs 복리 비교, 세후 수익률까지 한눈에.",
 path: "/tools/finance/compound",
 keywords: ["복리 계산기", "적립식 투자", "자산 시뮬레이션", "미래 자산", "단리 복리 비교"],
});

const FAQ_ITEMS = [
 { question: "복리와 단리의 차이는?", answer: "단리: 원금에만 이자. 복리: 원금 + 이자에 이자. 30년 투자 시 차이 5~10배. 한국 적금은 대부분 단리, ETF·펀드 재투자가 복리." },
 { question: "월 100만 적립, 연 7%면 30년 후 얼마?", answer: "약 12억 2천만원. 원금 3억 6천만원 + 복리 효과 8억 6천만원. 연 수익률 1%p 차이가 30년 누적 1~2억 차이." },
 { question: "세후 수익률은 어떻게 계산하나요?", answer: "이자소득세 15.4% (2,000만원 초과 분리과세 시), 배당소득세 14% + 지방세. ISA 200만 비과세, 연금저축은 인출 시 5.5%로 세제 우대." },
 { question: "복리의 마법을 활용하는 핵심?", answer: "1) 일찍 시작, 2) 꾸준히 적립 (시장 변동 무시), 3) 비용 낮추기 (수수료 0.5% 차이가 30년 누적 수천만), 4) 세제 혜택 계좌(ISA·연금저축·IRP) 우선." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 월 적립금 + 기간 결정", text: "본인 월 가처분 소득의 30% 권장. 최소 10년, 권장 20~30년 장기 시뮬." },
 { name: "Step 2. 보수적 수익률 입력", text: "주식형 ETF 연 6~8%, 채권형 3~4%, 예적금 3% 전후. 본인 포트폴리오 가중평균." },
 { name: "Step 3. 인플레이션 보정", text: "매년 연 2~3% 인플레이션 차감. 명목 수익률 7%면 실질 4~5%로 봄." },
 { name: "Step 4. 세제 혜택 계좌 우선", text: "ISA 200만 비과세, 연금저축 600만/IRP 300만 추가 세액공제. 일반계좌보다 30%+ 절세." },
];

export default function CompoundLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/compound", { leafName: "복리 계산기" }),
 softwareApplicationLd({ name: "복리 계산기", description: "적립식 투자 자산 시뮬 무료 계산기.", url: "/tools/finance/compound" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "복리 효과로 자산 시뮬하는 4단계", description: "월 적립부터 세제 혜택 계좌 활용까지", totalTime: "PT15M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
