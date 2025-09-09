import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "퇴직금 중간정산, 아무나 받을 수 있나요? | Moneysalary",
  description:
    "2012년 이후 원칙적으로 금지된 퇴직금 중간정산, 하지만 법에서 정한 예외적인 사유에 해당하면 가능합니다. 그 조건을 확인해보세요.",
};

export default function InterimSeverancePayPage() {
  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>퇴직금 중간정산, 아무나 받을 수 있나요?</h1>
        <p>
          결론부터 말씀드리면, <strong>아닙니다.</strong> 2012년 7월 26일 이후,
          법이 개정되어 원칙적으로 퇴직금 중간정산은 금지되었습니다. 안정적인
          노후 자금 마련을 위함입니다.
        </p>
        <p>
          다만, 아래와 같이 법에서 정한 <strong>매우 예외적인 사유</strong>에
          해당하고, 근로자의 요청이 있는 경우에만 신청할 수 있습니다.
        </p>
        <ul>
          <li>
            <strong>주택 구입</strong>: 무주택자인 근로자가 본인 명의의 주택을
            구입하는 경우
          </li>
          <li>
            <strong>장기 요양</strong>: 본인, 배우자, 또는 부양가족이 질병이나
            부상으로 6개월 이상 요양하는 경우
          </li>
          <li>
            <strong>파산 선고</strong>: 근로자가 파산 선고를 받은 경우
          </li>
          <li>
            <strong>개인회생절차</strong>: 근로자가 개인회생절차 개시 결정을
            받은 경우
          </li>
          <li>
            <strong>기타</strong>: 천재지변 등 고용노동부장관이 정하는 사유와
            요건을 갖춘 경우
          </li>
        </ul>
        <blockquote>
          <p>
            나의 예상 퇴직금이 궁금하다면? <Link href="/">퇴직금 계산기</Link>.
          </p>
        </blockquote>
      </article>
    </main>
  );
}
