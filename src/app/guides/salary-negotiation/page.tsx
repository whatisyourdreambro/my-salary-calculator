import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이직 시 연봉협상, 최소 OO%는 불러야 하는 이유",
  description:
    "성공적인 이직을 위한 연봉협상 전략! 현재 연봉, 시장 가치, 희망 연봉을 기반으로 최소 15~20%를 높여 불러야 하는 이유와 협상 노하우를 알려드립니다.",
};

export default function SalaryNegotiationPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          이직 연봉협상, 얼마를 불러야 할까?
        </h1>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          이직 과정의 마지막 관문, 연봉협상. 만족스러운 결과를 얻기 위해서는
          전략적인 접근이 필요합니다. 결론부터 말하자면, 특별한 경우를 제외하고{" "}
          <strong>최소 15~20% 이상</strong>을 높여 부르는 것이 좋습니다.
        </p>
        <h2 className="!mt-0 text-2xl font-bold">
          왜 15~20% 이상 높여야 할까?
        </h2>
        <ul className="!my-4">
          <li>
            <strong>협상의 여지:</strong> 회사는 당신이 부른 금액에서 일부를
            깎을 것을 염두에 두고 협상에 임합니다.
          </li>
          <li>
            <strong>미래 상승분 고려:</strong> 이직 시점이 연봉을 가장 크게 올릴
            수 있는 '골든 타임'입니다.
          </li>
          <li>
            <strong>자신감의 표현:</strong> 자신의 가치를 높게 평가하는 것은
            능력에 대한 자신감을 보여주는 지표가 됩니다.
          </li>
        </ul>
        <Link
          href="/?tab=comparator"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          여러 회사 오퍼, 실수령액으로 비교하기 →
        </Link>
      </article>
    </main>
  );
}
