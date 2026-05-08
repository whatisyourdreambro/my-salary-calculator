import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "DSR 한도 계산기 - 총부채원리금상환비율 (2026)",
 description:
 "본인 연봉 + 기존 부채 입력 → DSR 40% 기준 추가 대출 한도 즉시 계산. 주담대·신용대출·전세자금대출 통합 한도 시뮬, 1·2금융권 차이까지.",
 path: "/tools/real-estate/dsr",
 keywords: ["DSR 계산기", "총부채원리금상환비율", "DSR 40%", "대출 한도 계산", "주담대 DSR"],
});

const FAQ_ITEMS = [
 { question: "DSR이 뭔가요?", answer: "Debt Service Ratio. 연봉 대비 매년 갚아야 할 모든 부채의 원리금 비율. 'DSR 40%'면 연봉 5,000만의 40% = 연 2,000만(월 167만) 이내 상환 가능. 모든 대출 합산." },
 { question: "DSR 한도는?", answer: "1금융권 (은행): 40%. 2금융권 (저축은행·캐피탈): 50%. 단, 신용대출 5,000만 초과 시 1금융권 DSR도 30~40%로 더 엄격. 정부 정책에 따라 변동." },
 { question: "DSR 계산에 포함되는 부채?", answer: "주택담보대출, 신용대출, 전세자금대출, 학자금대출, 자동차할부, 신용카드 리볼빙, 마이너스통장. 단기 신용카드 결제는 제외. 모든 부채의 매월 원리금 합산." },
 { question: "DSR 한도를 늘리는 방법?", answer: "1) 연봉 인상 (이직·승진). 2) 기존 부채 상환 (신용대출 우선). 3) 만기 연장으로 월 상환액 줄이기 (단, 총 이자 증가). 4) 배우자 합산 대출 (DSR 합산 평가)." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 본인 연봉 + 기존 부채 입력", text: "원천징수영수증 총급여 + 모든 대출(주담대·신용·전세·학자금) 잔액·이자율·만기." },
 { name: "Step 2. 매월 원리금 자동 산출", text: "원리금균등상환 기준 월 상환액 자동 계산. 변동금리는 현재 금리 적용." },
 { name: "Step 3. DSR 40% 한도 확인", text: "본인 연봉 × 40% / 12 = 월 한도. 현재 부채 월 상환 + 새 대출 월 상환 합이 한도 내인지 점검." },
 { name: "Step 4. 추가 가능 대출액 시뮬", text: "남은 한도로 받을 수 있는 신규 대출 원금. 만기·금리에 따라 한도 변동." },
];

export default function DsrLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/real-estate/dsr", { leafName: "DSR 한도 계산기" }),
 softwareApplicationLd({ name: "DSR 한도 계산기", description: "총부채원리금상환비율 기반 대출 한도 무료 계산기.", url: "/tools/real-estate/dsr" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "DSR 기반 대출 한도 산출 4단계", description: "연봉·기존 부채부터 추가 대출 한도까지", totalTime: "PT15M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
