import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "연봉에 포함되는 수당, 안되는 수당은? | Moneysalary",
  description:
    "통상임금, 평균임금의 차이부터 비과세 수당까지, 내 연봉을 구성하는 각종 수당에 대해 자세히 알아보세요.",
};

export default function SalaryAllowancePage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>연봉에 포함되는 수당, 안되는 수당은?</h1>
        <p>
          연봉 협상이나 이직 시, 생각했던 실수령액과 달라서 당황하는 경우가
          많습니다. 이는 연봉에 포함되는 수당의 종류와 과세 여부를 정확히 알지
          못하기 때문입니다. 가장 중요한 개념인 <strong>통상임금</strong>과{" "}
          <strong>비과세 수당</strong>에 대해 알아보겠습니다.
        </p>
        <h2>1. 통상임금: 각종 수당 계산의 기준</h2>
        <p>
          통상임금은 근로자에게 정기적이고 일률적으로 소정 근로에 대하여
          지급하기로 정한 금액을 말하며,{" "}
          <strong>
            연장, 야간, 휴일근로수당이나 연차유급휴가수당 등을 산정하는 기준
          </strong>
          이 됩니다.
        </p>
        <ul>
          <li>
            <strong>포함되는 항목:</strong> 기본급, 직무수당, 직책수당,
            기술수당, 면허수당, 위험수당 등
          </li>
          <li>
            <strong>포함되지 않는 항목:</strong> 연장근로수당, 성과급, 상여금,
            출장비, 식대 등 (지급 조건이 변동적이거나 실비 변상적인 항목)
          </li>
        </ul>
        <h2>2. 비과세 수당: 세금을 떼지 않는 똑똑한 수당</h2>
        <p>
          비과세 수당은 말 그대로 세금을 부과하지 않는 소득입니다. 연봉 총액이
          같더라도 비과세 수당이 많을수록 실수령액이 높아지는 효과가 있습니다.
        </p>
        <ul>
          <li>
            <strong>식대:</strong> 월 20만원까지 비과세 (2023년 개정)
          </li>
          <li>
            <strong>차량유지비(자가운전보조금):</strong> 월 20만원까지 비과세
            (본인 명의 차량, 업무 활용 등 조건 충족 시)
          </li>
          <li>
            <strong>육아휴직 급여 및 수당:</strong> 전액 비과세
          </li>
          <li>
            <strong>연구보조비 또는 연구활동비:</strong> 월 20만원까지 비과세
            (관련 법령 조건 충족 시)
          </li>
        </ul>
        <blockquote>
          <p>
            나의 비과세액을 적용한 정확한 실수령액이 궁금하다면?{" "}
            <Link href="/">연봉 계산기</Link>를 이용해보세요.
          </p>
        </blockquote>
      </article>
    </main>
  );
}
