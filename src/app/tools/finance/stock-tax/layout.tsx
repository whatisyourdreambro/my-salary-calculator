import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "주식 양도소득세 계산기 - 해외주식·대주주 (2026)",
 description:
 "해외주식·대주주 양도소득세 계산기. 250만원 기본공제, 22% 세율(지방세 포함) 자동 적용. 매수가·매도가 입력만으로 절세 시뮬까지 한 번에.",
 path: "/tools/finance/stock-tax",
 keywords: ["주식 양도세 계산기", "해외주식 세금", "대주주 양도세", "주식 세금", "양도소득세"],
});

const FAQ_ITEMS = [
 { question: "해외주식 양도세는 언제 신고하나요?", answer: "전년도 1/1~12/31 기간 매도 양도차익을 다음 해 5월에 신고. 250만 기본공제 후 22%(지방세 포함). 손실은 5년 이월 가능." },
 { question: "국내주식과 해외주식 세금 차이?", answer: "국내주식: 일반 투자자 비과세 (대주주는 22~33%). 해외주식: 250만 공제 후 22% 일률 적용. ETF는 국내상장 해외ETF는 배당소득(15.4%), 해외상장은 양도소득(22%)." },
 { question: "대주주 기준은?", answer: "한 종목 지분 1% 이상 OR 평가액 50억 이상 (코스피·코스닥 별도). 4월 1일 기준 본인 + 가족 합산. 대주주가 되면 22~33% 양도세 부과." },
 { question: "양도세 절세 방법?", answer: "1) 손익통산 — 손실 종목과 이익 종목 같은 해 매도. 2) 250만 공제 활용 — 매년 250만씩 분할 매도. 3) 배우자 증여 후 매도 — 6억 공제 활용. 4) ISA 계좌 활용 (200만 비과세)." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 매수가 + 매도가 + 환율 입력", text: "해외주식은 매수·매도 시점 환율 모두 적용. 매도 시점 원화 환산 차익 기준." },
 { name: "Step 2. 1년 양도차익 합산", text: "1/1~12/31 모든 매도 종목 합산. 손익통산 후 순이익 산출." },
 { name: "Step 3. 250만 공제 적용", text: "기본공제 250만 차감 후 과세표준 산출. 손실 시 5년 이월." },
 { name: "Step 4. 5월 종합소득세와 함께 신고", text: "다음 해 5월 종합소득세 신고 시 함께 신고. 미신고 시 가산세 20%." },
];

export default function StockTaxLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/stock-tax", { leafName: "주식 양도소득세 계산기" }),
 softwareApplicationLd({ name: "주식 양도소득세 계산기", description: "해외주식·대주주 양도세 무료 계산기.", url: "/tools/finance/stock-tax" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "주식 양도세 신고 4단계", description: "매수·매도가 입력부터 5월 신고까지 절세 시뮬", totalTime: "PT30M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
