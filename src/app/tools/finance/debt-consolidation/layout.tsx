import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "부채 통합 시뮬 — 여러 대출 → 단일 통합 절약액",
 description:
 "신용카드·마이너스통장·신용대출 등 여러 부채를 단일 대출로 통합 시 이자 절약·월 상환 변화 시뮬.",
 path: "/tools/finance/debt-consolidation",
 keywords: ["부채 통합", "대환대출", "부채 갈아타기"],
});

export default function DebtConsolidationLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/finance/debt-consolidation", { leafName: "부채 통합 시뮬" }),
 softwareApplicationLd({ name: "부채 통합 시뮬", description: "여러 부채 → 단일 통합 절약액 시뮬.", url: "/tools/finance/debt-consolidation" }),
 faqLd([
 { question: "부채 통합 언제 유리?", answer: "고금리 부채 (15%+) 다수 + 1금융권 신용대출 가능 시. 통합 금리 < 가중 평균 금리." },
 { question: "신용 영향?", answer: "기존 부채 상환 후 신규 대출 → 일시 점수 ↓. 6개월~1년 내 회복. 채무조정은 부정적 영향 큼." },
 { question: "중도상환 수수료?", answer: "보통 잔금의 1~3%. 1년 미만 면제 안 되는 경우 많음. 수수료 차감 후 절약액 비교 필수." },
 ]),
 ]} />
 {children}
 </>
 );
}
