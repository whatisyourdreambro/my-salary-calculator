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
 title: "연봉 협상 시뮬레이터 — 본인 시장 가치 + 협상 멘트 자동 생성",
 description:
 "현재 연봉·직군·경력·회사 분위기 입력 → 추천 목표 연봉 + 협상 멘트 + 성공 확률 자동 산출. 4단계 인터랙티브 시뮬.",
 path: "/tools/career/negotiation-simulator",
 keywords: ["연봉 협상", "연봉 협상 시뮬", "협상 멘트", "연봉 인상 협상"],
});

const FAQ_ITEMS = [
 { question: "연봉 협상 평균 인상률은?", answer: "한국 평균 5~10%. 이직 시 20~30% 인상 가능. 본 시뮬레이터는 본인 시장 위치 + 회사 분위기 기반 추천." },
 { question: "협상 시 가장 중요한 카드는?", answer: "1) 다른 회사 오퍼 (가장 강력). 2) 시장 평균 데이터. 3) 본인 성과·기여. 4) 이직 가능성 시그널." },
 { question: "협상 실패 후 대처?", answer: "1) 협상 결과 서면 정리. 2) 다음 평가 시점에 재협상. 3) 6~12개월 내 이직 준비. 4) 동일 회사 내 다른 부서 검토." },
 { question: "협상 시 피해야 할 말?", answer: "1) '돈이 필요해서' (개인 사정). 2) '다른 사람보다 적게 받아서' (비교). 3) '아니면 그만두겠다' (이직 카드 약하면 위험). 4) 감정적 표현." },
 { question: "협상 좋은 시점은?", answer: "1) 분기·연 평가 직전. 2) 큰 프로젝트 성공 직후. 3) 이직 오퍼 받았을 때. 4) 회사 호황기. 회사 위기·구조조정 시기는 피하기." },
];

export default function NegotiationSimulatorLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/career/negotiation-simulator", { leafName: "연봉 협상 시뮬", overrides: { career: "커리어 도구" } }),
 softwareApplicationLd({ name: "연봉 협상 시뮬레이터", description: "본인 시장 가치 + 협상 멘트 자동 생성.", url: "/tools/career/negotiation-simulator" }),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "연봉 협상 시뮬 4단계", description: "현재 연봉부터 협상 멘트까지", totalTime: "PT5M", steps: [
 { name: "Step 1. 현재 연봉 입력", text: "본인 연봉 (세전)." },
 { name: "Step 2. 직군·경력 선택", text: "직군 9종 중 선택 + 경력 년수." },
 { name: "Step 3. 회사 분위기 평가", text: "유연/보통/엄격 중 선택." },
 { name: "Step 4. 결과 + 멘트 확인", text: "추천 목표 연봉 + 성공 확률 + 협상 멘트." },
 ] }),
 ]} />
 {children}
 </>
 );
}
