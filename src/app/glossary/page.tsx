import type { Metadata } from "next";
import {
  ShieldCheck,
  HeartPulse,
  Briefcase,
  Hospital,
  FileText,
  Building,
  BarChartHorizontal,
  Wallet,
  BookUser,
  BadgePercent,
} from "lucide-react";

export const metadata: Metadata = {
  title: "급여 용어 사전 | Moneysalary",
  description:
    "국민연금, 건강보험, 소득세부터 통상임금, 비과세 수당까지. 알쏭달쏭한 급여 관련 용어들을 쉽고 명확하게 설명해 드립니다.",
};

const glossaryData = [
  {
    title: "국민연금",
    icon: ShieldCheck,
    content:
      "국가가 운영하는 공적 연금 제도입니다. 소득이 있을 때 보험료를 납부하여, 노령, 장애, 사망 시 본인이나 유족에게 연금을 지급해 기본 생활을 보장합니다.",
    analogy:
      "미래의 나에게 보내는 '시간 소포' 같아요. 지금 조금씩 담아두면, 은퇴한 내가 풍족하게 열어볼 수 있죠.",
    tip: "국민연금 납부액은 전액 소득공제 대상이라 연말정산 시 세금을 줄여주는 효과가 있습니다.",
  },
  {
    title: "건강보험",
    icon: HeartPulse,
    content:
      "질병이나 부상으로 인해 발생하는 고액의 진료비 부담을 막기 위해, 모든 국민이 평소에 보험료를 내고 이를 모아 서로 돕는 사회보험제도입니다.",
    analogy:
      "인생이라는 도로를 달릴 때 의무적으로 장착하는 '에어백'입니다. 언제 터질지 모르는 사고로부터 나를 지켜주죠.",
    tip: "직장가입자의 경우, 회사가 보험료의 50%를 부담해줍니다.",
  },
  {
    title: "장기요양보험",
    icon: Hospital,
    content:
      "고령이나 노인성 질병으로 일상생활이 어려운 분들께 신체활동이나 가사활동 지원을 제공하는 사회보험입니다. 건강보험료에 포함되어 함께 청구됩니다.",
    analogy:
      "건강보험이 '치료'를 위한 보험이라면, 장기요양보험은 '돌봄'을 위한 보험입니다.",
    tip: "장기요양 등급을 받으면 재가급여, 시설급여 등 다양한 요양 서비스를 이용할 수 있습니다.",
  },
  {
    title: "고용보험",
    icon: Briefcase,
    content:
      "실직 시 재취업 활동 기간 동안 실업급여를 지급하고, 직업능력개발 훈련을 지원하는 등 근로자의 고용 안정을 돕는 사회보험입니다.",
    analogy:
      "갑작스러운 실직이라는 폭풍우를 만났을 때 잠시 비를 피할 수 있게 해주는 '튼튼한 우산'입니다.",
    tip: "육아휴직 급여도 고용보험 기금에서 지급됩니다.",
  },
  {
    title: "소득세 (근로소득세)",
    icon: FileText,
    content:
      "개인이 얻는 소득에 대해 부과되는 세금입니다. 근로자의 경우 매월 급여에서 간이세액표에 따라 원천징수되며, 연말정산을 통해 최종 납부세액이 결정됩니다.",
    analogy:
      "국가라는 큰 집의 운영을 위해 함께 내는 '월 관리비'라고 생각할 수 있습니다.",
    tip: "소득이 높을수록 높은 세율이 적용되는 '누진세' 구조를 따릅니다.",
  },
  {
    title: "지방소득세",
    icon: Building,
    content:
      "소득세 납부 의무가 있는 사람이 거주하는 지방자치단체에 납부하는 세금입니다. 일반적으로 소득세액의 10%가 부과됩니다.",
    analogy:
      "소득세가 '국세'라면, 지방소득세는 내가 사는 지역을 위해 내는 '지방세'입니다.",
    tip: "연말정산이나 종합소득세 신고 시 소득세와 함께 처리됩니다.",
  },
  {
    title: "과세표준",
    icon: BarChartHorizontal,
    content:
      "세금을 부과하는 기준이 되는 금액입니다. 총 소득에서 비과세소득과 각종 소득공제를 뺀 금액으로, 여기에 세율을 곱하여 산출세액이 결정됩니다.",
    analogy:
      "피자에 토핑을 올리기 전, 세금을 뿌릴 '순수한 도우' 부분이라고 할 수 있습니다. 도우가 작을수록 세금 토핑도 적게 올라가겠죠?",
    tip: "연말정산의 핵심은 바로 이 과세표준을 합법적으로 최대한 줄이는 것입니다.",
  },
  {
    title: "세액공제",
    icon: BadgePercent,
    content:
      "이미 계산된 산출세액에서 세금 자체를 직접 깎아주는 방식입니다. 소득 수준과 관계없이 일정 금액/비율을 공제해주어 저연봉자에게 더 유리할 수 있습니다.",
    analogy:
      "마트에서 계산이 끝난 총액에서 바로 할인해주는 '모바일 쿠폰'과 같습니다. 할인율이 강력하죠.",
    tip: "월세, 의료비, 교육비, 연금계좌 납입액 등이 대표적인 세액공제 항목입니다.",
  },
  {
    title: "통상임금",
    icon: Wallet,
    content:
      "근로자에게 정기적, 일률적으로 지급하기로 정한 금액입니다. 연장, 야간, 휴일근로수당이나 연차수당, 퇴직금 등을 산정하는 중요한 기준이 됩니다.",
    analogy: "각종 추가 수당을 계산하기 위한 '기본 공식'의 변수 값과 같습니다.",
    tip: "기본급, 직무수당, 직책수당 등이 포함되며, 성과급이나 복리후생비는 보통 제외됩니다.",
  },
  {
    title: "비과세 수당",
    icon: BookUser,
    content:
      "세금을 부과하지 않는 소득 항목입니다. 근로자의 생활을 보조하는 성격이 강하며, 식대, 차량유지비, 육아휴직 급여 등이 대표적입니다.",
    analogy:
      "연봉이라는 그릇에 담기지만, 세금이라는 젓가락이 피해 가는 '특별한 반찬'입니다.",
    tip: "비과세 수당이 높을수록 같은 연봉이라도 세후 실수령액이 높아집니다. 연봉 협상 시 중요한 고려 요소입니다.",
  },
];

export default function GlossaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          급여 용어 사전
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          알쏭달쏭한 급여 관련 용어, 여기서 명확하게 확인하세요.
        </p>
      </div>

      <div className="space-y-8">
        {glossaryData.map((item, index) => (
          <section
            key={index}
            className="p-6 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <item.icon className="w-8 h-8 text-signature-blue" />
              <h2 className="!m-0 text-2xl font-bold">{item.title}</h2>
            </div>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary border-b pb-4 dark:border-gray-700">
              {item.content}
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="!m-0 text-sm">
                  <strong>💬 쉽게 풀어보기:</strong> {item.analogy}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="!m-0 text-sm">
                  <strong>💡 Moneysalary&apos;s Tip:</strong> {item.tip}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
