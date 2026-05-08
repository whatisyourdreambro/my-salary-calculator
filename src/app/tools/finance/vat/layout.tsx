import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "부가세 계산기 - 일반과세자·간이과세자 신고세액 (2026)",
 description:
 "공급가액 입력 → 부가세 10%, 간이과세자 1.5~4% 자동 계산. 매출세액 - 매입세액 신고세액 시뮬, 분기별·반기별 신고일정까지 한 번에.",
 path: "/tools/finance/vat",
 keywords: ["부가세 계산기", "VAT 계산기", "부가가치세", "간이과세자 부가세", "사업자 부가세"],
});

const FAQ_ITEMS = [
 { question: "일반과세자 vs 간이과세자 차이?", answer: "일반과세자: 매출 부가세 10% + 매입세액 환급 가능, 분기별 신고. 간이과세자: 1.5~4% 업종별 부가율, 반기별 신고, 매입세액 환급 X. 연 매출 8천만 이하면 간이과세자 자격." },
 { question: "부가세는 언제 신고하나요?", answer: "일반과세자: 1월(전년 4분기), 4월(예정), 7월(2분기), 10월(예정) — 분기별 4회. 간이과세자: 1월(전년 1년), 7월(상반기 예정) — 연 2회. 미신고 가산세 20%." },
 { question: "매입세액은 어떻게 환급받나요?", answer: "사업 관련 지출에 포함된 부가세를 매출 부가세에서 차감. 사업용 임대료·통신비·차량 운영비 등. 세금계산서 발급분만 인정 (현금영수증·신용카드 매출전표도 가능)." },
 { question: "1년 매출 1억인데 일반/간이 어느 게?", answer: "8천만 초과면 일반과세자 자동 전환 (다음 해 7월부터). 일반과세자가 매입세액 환급 가능해서 매입 비중 큰 업종(도소매)은 유리. 매입 적은 서비스업은 간이가 유리." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 공급가액 + 사업자 유형 입력", text: "1분기/반기 매출 공급가액 (부가세 별도). 본인 일반/간이 과세자 유형." },
 { name: "Step 2. 매입세액 정리 (일반과세자만)", text: "사업 관련 매입의 부가세 합산. 세금계산서·신용카드 매출전표·현금영수증 모두 인정." },
 { name: "Step 3. 신고세액 산출", text: "매출세액 - 매입세액 = 신고세액. 음수면 환급, 양수면 납부." },
 { name: "Step 4. 신고 일정 캘린더 등록", text: "분기/반기별 신고 마감일 미리 캘린더 등록. 미신고 가산세 20% + 지연 가산세." },
];

export default function VatLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/vat", { leafName: "부가세 계산기" }),
 softwareApplicationLd({ name: "부가세 계산기", description: "일반·간이 과세자 부가세 무료 계산기.", url: "/tools/finance/vat" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "부가세 신고 4단계", description: "공급가액부터 분기별 신고 일정까지", totalTime: "PT45M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
