import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, howToLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "구독 비용 계산기 — Netflix·유튜브·디즈니 등 월 총 구독료",
 description: "여러 구독 서비스 입력 → 월·연 총 비용 + 절약 가능액 분석.",
 path: "/tools/life/subscription",
 keywords: ["구독 비용 계산", "OTT 비용", "구독료 합계", "구독 절약"],
});

const FAQ_ITEMS = [
 { question: "한국 평균 구독료 지출?", answer: "1인 가구 월 평균 약 30~50만원 (OTT·음악·뉴스·SaaS 합산). 여러 OTT + 클라우드 + 멤버십 합산 시 빠르게 늘어남." },
 { question: "절약 방법?", answer: "1) 같이 쓰는 가족·친구와 공유 (Netflix·유튜브 프리미엄). 2) 사용 안 하는 구독 즉시 해지. 3) 연 결제 할인 (보통 10~20%)." },
 { question: "OTT 비용 비교?", answer: "넷플릭스 9,500~17,000원/월, 디즈니+ 9,900원, 티빙 7,900~17,900원, 쿠팡플레이 4,900원, 웨이브 7,900~13,900원." },
 { question: "유튜브 프리미엄 가족 요금제?", answer: "월 약 22,300원, 가족 6명까지 공유 → 1인당 약 3,700원. 가장 가성비 좋음." },
];

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/life/subscription", { leafName: "구독 비용 계산기" }),
 softwareApplicationLd({ name: "구독 비용 계산기", description: "월·연 총 구독료 무료 계산기.", url: "/tools/life/subscription" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "구독료 정리 3단계", description: "총 비용 + 절약 분석", totalTime: "PT5M", steps: [
 { name: "Step 1. 모든 구독 나열", text: "OTT, 음악, 뉴스, SaaS 등." },
 { name: "Step 2. 월·연 비용 합산", text: "본 계산기 자동 합산." },
 { name: "Step 3. 사용 빈도 점검", text: "월 1회 미만 사용 구독은 즉시 해지." },
 ] }),
 ]} />
 {children}
 </>
 );
}
