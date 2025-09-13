import type { Metadata } from "next";
import GlossaryAccordion from "@/components/GlossaryAccordion";

export const metadata: Metadata = {
  title: "급여 용어 사전 | Moneysalary",
  description:
    "국민연금, 건강보험, 소득세 등 알쏭달쏭한 급여 관련 용어들을 쉽고 명확하게 설명해 드립니다.",
};

const glossaryData = [
  {
    title: "국민연금",
    content:
      "국가가 직접 운영하는 공적 연금 제도로, 국민 개개인이 소득 활동을 할 때 보험료를 납부했다가 나이가 들거나, 갑작스런 사고나 질병으로 장애를 입거나 사망하였을 때 본인이나 유족에게 연금을 지급하여 기본 생활을 유지할 수 있도록 돕는 소득보장제도입니다.",
  },
  {
    title: "건강보험",
    content:
      "일상생활의 사고나 질병, 부상 등에 대해 보험급여를 제공하여 국민보건을 향상시키고 사회보장을 증진시키는 것을 목적으로 하는 사회보장제도입니다. 직장가입자와 지역가입자로 나뉩니다.",
  },
  {
    title: "장기요양보험",
    content:
      "고령이나 노인성 질병 등의 사유로 일상생활을 혼자서 수행하기 어려운 노인 등에게 신체활동 또는 가사활동 지원 등의 장기요양급여를 제공하는 사회보험제도입니다. 건강보험료에 합산되어 고지됩니다.",
  },
  {
    title: "고용보험",
    content:
      "실업 예방, 고용 촉진 및 근로자의 직업능력 개발과 향상을 꾀하고, 국가의 직업지도와 직업소개 기능을 강화하며, 근로자가 실업한 경우에 생활에 필요한 급여를 실시하여 근로자의 생활안정과 구직 활동을 촉진하는 것을 목적으로 하는 사회보험입니다.",
  },
  {
    title: "소득세 (근로소득세)",
    content:
      "개인이 얻는 소득에 대해 부과되는 세금입니다. 근로자의 경우 월 급여에서 간이세액표에 따라 원천징수되며, 연말정산을 통해 최종 납부세액이 결정됩니다.",
  },
  {
    title: "지방소득세",
    content:
      "소득세 납부 의무가 있는 자가 함께 납부하는 지방세입니다. 일반적으로 소득세액의 10%에 해당하는 금액이 부과됩니다.",
  },
  {
    title: "과세표준",
    content:
      "세금을 부과하는 기준이 되는 금액을 말합니다. 일반적으로 총 소득(연봉)에서 비과세소득과 각종 소득공제(인적공제, 연금보험료 공제 등)를 제외하여 계산됩니다. 과세표준 금액에 따라 소득세율 구간이 결정됩니다.",
  },
  {
    title: "근로소득 세액공제",
    content:
      "산출된 세액에서 직접 일정 금액을 공제해주는 제도입니다. 모든 근로소득자가 소득 수준에 따라 일정 한도 내에서 세액공제를 받을 수 있어, 세금 부담을 줄여주는 중요한 역할을 합니다.",
  },
];

export default function GlossaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          급여 용어 사전
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          알쏭달쏭한 급여 관련 용어, 여기서 명확하게 확인하세요.
        </p>
      </div>

      <GlossaryAccordion items={glossaryData} />
    </main>
  );
}
