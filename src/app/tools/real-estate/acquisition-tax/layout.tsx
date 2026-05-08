import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
 howToLd,
 softwareApplicationLd,
} from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "취득세 계산기 - 주택·토지·교육세·농특세 (2026)",
 description:
 "주택·토지 취득가액 입력 → 취득세, 지방교육세, 농어촌특별세 자동 계산. 1주택자/다주택자/조정대상지역 세율 자동 적용, 2026년 최신 기준.",
 path: "/tools/real-estate/acquisition-tax",
 keywords: ["취득세 계산기", "주택 취득세", "토지 취득세", "지방교육세", "농어촌특별세"],
});

const FAQ_ITEMS = [
 { question: "취득세 세율은 어떻게 결정되나요?", answer: "주택은 6억 이하 1%, 6~9억 1~3%, 9억 초과 3%. 다주택자는 2주택 8%, 3주택 이상 12% (조정대상지역). 토지는 4%. 농어촌특별세 + 지방교육세 별도 부과." },
 { question: "1주택자와 다주택자 세율 차이는?", answer: "1주택자(생애최초 포함): 기본세율(1~3%). 2주택자: 8% (조정대상지역) / 1~3% (비조정). 3주택 이상: 12% / 4%. 차이가 매우 크므로 매수 전 확정 필수." },
 { question: "취득세 감면은?", answer: "생애최초 주택구입(50% 감면, 1.5억 이하 소형주택), 신혼부부 4년 이내 첫 주택, 농어촌·다자녀가구 등. 시·군·구청 신청 필수, 자동 적용 X." },
 { question: "취득세는 언제까지 내야 하나요?", answer: "취득일(잔금일·등기일 중 빠른 날) 기준 60일 이내 신고·납부. 미신고 시 가산세 20% + 납부지연 가산세. 등기 시 등기소에서 동시 처리 가능." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 취득가액 입력", text: "잔금일 기준 매매가 (실거래가). 6억 이하/9억 이하/초과로 세율 결정." },
 { name: "Step 2. 주택 수 + 지역 확인", text: "현재 보유 주택 수 + 매수 주택의 조정대상지역 여부. 다주택자는 8~12%로 점프." },
 { name: "Step 3. 감면 자격 점검", text: "생애최초·신혼부부·다자녀 등 감면 적용 가능한지 시·군·구청 확인." },
 { name: "Step 4. 60일 이내 신고·납부", text: "잔금일 후 60일 이내 위택스 또는 시·군·구청 신고. 등기 시 동시 처리 권장." },
];

export default function AcquisitionTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/real-estate/acquisition-tax", { leafName: "취득세 계산기" }),
 softwareApplicationLd({ name: "주택·토지 취득세 계산기", description: "2026 다주택자·조정대상지역 세율 자동 적용 무료 계산기.", url: "/tools/real-estate/acquisition-tax" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "취득세 계산하고 60일 이내 신고하는 4단계", description: "취득가액부터 감면 신청까지", totalTime: "PT30M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
