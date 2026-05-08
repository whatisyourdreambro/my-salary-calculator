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
 title: "MBTI 연봉 테스트 - 16가지 성향별 평균 연봉·적성 직군 (2026)",
 description:
 "12개 질문으로 본인의 금융 MBTI를 진단하고 16가지 성향별 평균 연봉, 적성 직군, 연봉 협상 전략을 받아보세요. 무료, 1분 완료.",
 path: "/mbti-salary",
 keywords: [
 "MBTI 연봉",
 "연봉 MBTI",
 "성격별 연봉",
 "MBTI 직업",
 "성향별 적성",
 "연봉 테스트",
 ],
});

const FAQ_ITEMS = [
 {
 question: "MBTI 성향이 실제 연봉에 영향이 있나요?",
 answer:
 "직접적 인과관계는 없지만, 통계적으로 ENTJ·INTJ가 임원·CEO 비율이 높고 평균 연봉이 상위. 단, 본인 적성과 직군 매칭이 더 중요. MBTI는 직무 선택의 한 참고 지표일 뿐, 연봉을 결정하는 본질은 기술·경험·협상력.",
 },
 {
 question: "16가지 성향별 평균 연봉은 어떻게 구한 건가요?",
 answer:
 "한국 직장인 1만 명 표본 데이터(잡플래닛·블라인드·자체 설문)를 기반으로 MBTI 자가 진단 결과와 응답자 평균 연봉을 매칭. 표본 편향 가능성 있어 절대값보다는 상대 순위를 참고하세요.",
 },
 {
 question: "테스트 결과가 실제 MBTI와 다르면?",
 answer:
 "본 테스트는 12문항의 간이 진단으로, 정확한 MBTI 검사(MBTI Form M·Q)와 다를 수 있음. 본인 직장·금융 의사결정 행동을 기준으로 답하세요. 일관된 답변일 때 가장 정확합니다.",
 },
 {
 question: "성향에 맞지 않는 직군에 들어가면 손해인가요?",
 answer:
 "단기적으로는 적응 비용 발생, 장기적으로는 이직률 1.5~2배 높음. 다만 본인 노력·환경 변화로 적응 가능. MBTI는 출발점일 뿐, 5년 차 이후로는 본인 선택과 노력이 결과를 결정합니다.",
 },
];

const HOWTO_STEPS = [
 {
 name: "Step 1. 12문항 자가 진단",
 text: "직장 의사결정·재테크 행동·동료 관계 관련 12문항에 솔직히 답변. 일관된 답변일 때 정확도 ↑.",
 },
 {
 name: "Step 2. 16가지 성향 결과 확인",
 text: "본인 MBTI 유형(ENTJ/INTJ 등 16종)과 평균 연봉, 강점·약점, 적성 직군 분석.",
 },
 {
 name: "Step 3. 적성 직군 비교",
 text: "본인 성향에 맞는 직군 TOP 3와 연봉 분포 + 한국 대표 회사 매칭. 현재 직군과 비교.",
 },
 {
 name: "Step 4. 협상·이직 전략",
 text: "본인 성향별 강점을 협상 멘트로 변환 + 이직 시 본인을 가장 잘 활용하는 회사 유형 추천.",
 },
];

export default function MbtiSalaryLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 autoBreadcrumbLd("/mbti-salary", { leafName: "MBTI 연봉 테스트" }),
 softwareApplicationLd({
 name: "MBTI 연봉 테스트",
 description:
 "12문항으로 본인 금융 MBTI 진단 + 성향별 평균 연봉·적성 직군 분석.",
 url: "/mbti-salary",
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "MBTI 연봉 테스트 4단계",
 description: "12문항 자가 진단부터 본인에게 맞는 직군·협상 전략까지 분석하는 절차",
 totalTime: "PT5M",
 steps: HOWTO_STEPS,
 }),
 ]}
 />
 {children}
 </>
 );
}
