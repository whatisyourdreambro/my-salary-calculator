import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "CAGR 연평균 수익률 계산기 - 투자 기간별 수익률",
 description:
 "처음 자산, 최종 자산, 투자 기간 입력 → 연평균 복리 수익률(CAGR) 자동 계산. 펀드·ETF·부동산 투자 성과 평가의 황금 기준.",
 path: "/tools/finance/cagr",
 keywords: ["CAGR 계산기", "연평균 수익률", "복리 수익률", "투자 성과 평가", "ETF 수익률"],
});

const FAQ_ITEMS = [
 { question: "CAGR이 뭔가요?", answer: "Compound Annual Growth Rate. 매년 동일한 비율로 늘어났다고 가정한 연평균 복리 수익률. 1억이 5년 후 1.6억이면 CAGR 9.86% — '매년 9.86%씩 복리로 늘어난 결과'." },
 { question: "CAGR vs 평균 수익률 차이?", answer: "산술평균은 변동성을 무시. 30%, -30% 평균은 0%지만 실제 자산은 -9% (1.3 × 0.7 = 0.91). CAGR이 실제 자산 변화를 정확히 반영." },
 { question: "한국 자산별 CAGR 평균?", answer: "코스피 30년 약 5%, 미국 S&P500 30년 약 10%, 한국 부동산 20년 약 5~7%, 채권 3~4%, 예적금 2~3%. 본인 투자 CAGR이 시장 평균과 비교 권장." },
 { question: "CAGR 활용 핵심?", answer: "1) 펀드·ETF 비교 — 1년 수익률 말고 5/10년 CAGR. 2) 본인 포트폴리오 점검 — 매년 측정. 3) 미래 시뮬 — 보수적 5%, 공격적 8% 전제." },
];

const HOWTO_STEPS = [
 { name: "Step 1. 시작 자산 + 최종 자산 입력", text: "투자 시작 시점 자산 + 측정 시점 자산 (배당 재투자 포함)." },
 { name: "Step 2. 투자 기간 입력", text: "기간(년). 1년 미만은 CAGR 의미 적음, 3년 이상 권장." },
 { name: "Step 3. CAGR 산출 + 시장 비교", text: "CAGR = (최종/시작)^(1/기간) - 1. S&P500·코스피 같은 기간 CAGR과 비교." },
 { name: "Step 4. 미래 자산 시뮬", text: "본인 CAGR + 동일 기간 추가 투자 시 예상 자산 산출." },
];

export default function CagrLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/cagr", { leafName: "CAGR 연평균 수익률 계산기" }),
 softwareApplicationLd({ name: "CAGR 연평균 수익률 계산기", description: "투자 기간별 복리 수익률 무료 계산기.", url: "/tools/finance/cagr" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "CAGR 산출하고 본인 투자 평가하는 4단계", description: "시작·최종 자산부터 시장 비교까지", totalTime: "PT10M", steps: HOWTO_STEPS }),
 ]} />
 {children}
 </>
 );
}
