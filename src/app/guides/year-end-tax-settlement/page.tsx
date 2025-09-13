import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법 | Moneysalary",
  description:
    "소득공제와 세액공제의 차이점부터 놓치기 쉬운 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
};

export default function YearEndTaxSettlementPage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <div className="mb-8">
          <h1 className="!mb-2">
            연말정산 A to Z: 13월의 월급, 제대로 챙기는 법
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            최종 업데이트: 2025년 9월
          </p>
        </div>

        <p className="lead">
          -13월의 월급-이라고 불리는 연말정산, 하지만 제대로 준비하지 않으면
          -13월의 세금폭탄-이 될 수도 있습니다. 연말정산은 지난 1년 동안
          월급에서 원천징수된 세금이 내가 실제로 내야 할 세금보다 많은지,
          적은지를 따져보고 정산하는 과정입니다. 복잡해 보이지만, 핵심적인 공제
          항목만 잘 챙겨도 훌륭한 절세가 가능합니다.
        </p>

        <h2>1. 연말정산의 기본 구조: 소득공제 vs 세액공제</h2>
        <p>연말정산은 크게 -소득공제-와 -세액공제- 두 단계로 이루어집니다.</p>
        <ul>
          <li>
            <strong>소득공제:</strong> 세금을 매기는 기준이 되는 금액 자체를
            줄여주는 것입니다. (예: 인적공제, 신용카드 사용액 공제). 소득이
            높을수록 절세 효과가 큽니다.
          </li>
          <li>
            <strong>세액공제:</strong> 소득공제를 거쳐 계산된 -산출세액-에서
            세금 자체를 직접 깎아주는 것입니다. (예: 자녀 세액공제, 월세
            세액공제). 소득 수준과 관계없이 공제액이 일정합니다.
          </li>
        </ul>

        <h2>2. 직장인이 놓치기 쉬운 핵심 공제 항목 3가지</h2>
        <p>
          국세청 홈택스의 연말정산 간소화 서비스가 편리해졌지만, 직접 챙겨야만
          공제받을 수 있는 항목들이 있습니다.
        </p>
        <ol>
          <li>
            <strong>월세액 세액공제:</strong> 총급여 7,000만 원 이하의 무주택
            근로자가 국민주택규모 이하의 주택에 거주하며 월세를 낸 경우, 연간
            최대 750만 원 한도로 월세액의 15~17%까지 세액공제를 받을 수
            있습니다. 임대차계약서, 주민등록등본, 월세 이체 증빙서류를 챙겨야
            합니다.
          </li>
          <li>
            <strong>안경 및 콘택트렌즈 구입비:</strong> 시력 교정용 안경,
            콘택트렌즈 구입비는 1인당 연 50만 원까지 의료비 세액공제 대상에
            포함됩니다. 간소화 서비스에서 조회가 안되므로, 구입처에서 영수증을
            발급받아 제출해야 합니다.
          </li>
          <li>
            <strong>중고생 교복 구입비:</strong> 자녀의 교복 구입비 역시 1인당
            연 50만 원까지 교육비 세액공제를 받을 수 있습니다.
          </li>
        </ol>

        <blockquote>
          <p>
            내 연봉과 부양가족 수를 기준으로 예상 소득세를 미리 계산해보고
            싶다면? <Link href="/">연봉 계산기</Link>
          </p>
        </blockquote>
      </article>
    </main>
  );
}

// 이 파일이 모듈임을 명시적으로 선언하여 오류를 해결합니다.
export {};
