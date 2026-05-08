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
 title: "프리랜서 종합소득세 계산기 - 사업소득·필요경비 (2026)",
 description:
 "프리랜서·N잡러 종합소득세 계산기. 사업소득에서 필요경비 차감, 종합소득공제 적용 후 누진세율 자동 계산. 5월 종소세 신고 전 미리 확인하세요.",
 path: "/tools/finance/freelance-tax",
 keywords: ["프리랜서 세금 계산기", "종합소득세 계산기", "사업소득세", "N잡 세금", "5월 종소세"],
});

const FAQ_ITEMS = [
 { question: "프리랜서 3.3% 원천징수와 종합소득세는 다른가요?", answer: "3.3%는 미리 떼는 임시 세금. 5월 종합소득세 신고에서 1년 총 사업소득 기준 누진세율 적용 후 최종 세액 확정. 원천징수액 > 최종 세액이면 환급, 반대면 추가 납부." },
 { question: "필요경비는 무엇이 인정되나요?", answer: "사업과 직접 관련된 지출: 사무실 임대료, 통신비(업무 비율), 출장비, 업무 도서·교육비, 사업용 자산 감가상각, 광고비. 영수증 5년 보관 필수. 일상 식비·개인 의류는 미인정." },
 { question: "단순경비율 vs 기준경비율 차이는?", answer: "단순경비율(소규모): 수입 × 정해진 비율 자동 인정 (영수증 불필요). 기준경비율(중규모): 주요 경비만 영수증으로 인정. 본인 업종·전년 수입에 따라 자동 적용. 홈택스에서 조회." },
 { question: "사업자등록 안 한 프리랜서도 신고하나요?", answer: "네. 3.3% 원천징수된 사업소득이 있으면 5월 신고 의무. 미신고 시 무신고 가산세 20% + 납부지연 가산세. 환급 대상이면 신고해야 받음." },
 { question: "근로소득 + 사업소득 동시에 있으면?", answer: "두 소득 합산해 종합과세. 근로소득은 회사가 연말정산, 사업소득은 본인이 5월 신고. 합산 후 누진세율 한 단계 위로 점프 가능 — IRP·연금저축·기부금 절세 항목 적극 활용." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 1년 총 사업소득 합산", text: "1월~12월 받은 모든 사업소득(3.3% 원천징수 받은 거 + 미원천징수)을 합산." },
 { name: "Step 2. 필요경비 정리", text: "사업 관련 영수증 모두 정리. 단순경비율 적용 대상이면 자동, 아니면 직접 영수증 합산." },
 { name: "Step 3. 종합소득공제 적용", text: "본인 + 부양가족 인적공제 + 연금저축·IRP + 기부금 등 추가 공제." },
 { name: "Step 4. 누진세율 산출 + 환급 확인", text: "과세표준에 누진세율 적용 → 최종 세액 산출 → 원천징수액과 비교해 환급/추납 결정." },
];

export default function FreelanceTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/freelance-tax", { leafName: "프리랜서 종합소득세 계산기" }),
 softwareApplicationLd({ name: "프리랜서 종합소득세 계산기", description: "프리랜서·N잡러 5월 종소세 무료 계산기.", url: "/tools/finance/freelance-tax" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "프리랜서 종합소득세 신고 4단계", description: "5월 신고 전 사업소득·필요경비 정리부터 환급 시뮬까지", totalTime: "PT1H", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
