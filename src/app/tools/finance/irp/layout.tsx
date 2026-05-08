import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "IRP·연금저축 절세 계산기 - 최대 900만 세액공제 (2026)",
 description:
 "연금저축 600만 + IRP 300만 추가 세액공제. 총급여 5,500만 기준 16.5%/13.2% 환급률 자동 적용. 본인 소득 입력만으로 절세액 즉시 확인.",
 path: "/tools/finance/irp",
 keywords: ["IRP 계산기", "연금저축 세액공제", "IRP 환급", "노후 절세", "퇴직연금 IRP"],
});

const FAQ_ITEMS = [
 { question: "IRP와 연금저축은 뭐가 다른가요?", answer: "IRP: 퇴직금 받을 수 있는 계좌 + 추가 납입 가능. 30% 이상 안전자산 의무. 연금저축: 일반 노후 저축 계좌, 자산 자유. 둘 다 55세 후 연금 수령 시 5.5% 저세율." },
 { question: "최대 절세 한도가 900만원이라는데?", answer: "연금저축 600만 + IRP 추가 300만 = 합 900만. 16.5% 환급률 적용 시 약 148만 환급. 13.2% 환급률(총급여 5,500만 초과)이면 약 119만." },
 { question: "납입은 언제까지 해야 하나요?", answer: "12월 31일까지 입금된 분만 당해 연도 공제. 이체 처리 1~2일 소요 → 12월 30일 권장. 1월 1일 이후 입금은 다음 연도분." },
 { question: "중도 인출하면 페널티는?", answer: "55세 전 인출: 기타소득세 16.5% 일괄 부과. 그동안 받은 환급액 토해내야 함. 사실상 55세까지 묶이는 자금. 다만 무주택자 첫 주택구입·6개월 이상 입원 등 예외 가능." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 본인 총급여 확인", text: "원천징수영수증의 '총급여' 항목. 5,500만 이하 16.5% 환급, 초과 13.2% 환급." },
 { name: "Step 2. 납입 한도 결정", text: "여유 자금 풀납입 권장. 900만 풀 활용 시 최대 148만 환급. 부담되면 부분 납입." },
 { name: "Step 3. 12월 30일까지 입금", text: "연말정산 반영 조건. 자동이체 + 12월 추가 일시 납입 조합 권장." },
 { name: "Step 4. 운용 — 안전자산 30% + 위험자산 70%", text: "IRP는 안전자산 30% 의무. 본인 연령 기반 — 30대는 위험자산 80%, 50대는 50% 권장." },
];

export default function IrpLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/irp", { leafName: "IRP·연금저축 절세 계산기" }),
 softwareApplicationLd({ name: "IRP·연금저축 절세 계산기", description: "최대 900만 세액공제 무료 계산기.", url: "/tools/finance/irp" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "IRP·연금저축으로 최대 900만 절세하는 4단계", description: "총급여 확인부터 운용 전략까지", totalTime: "PT20M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
