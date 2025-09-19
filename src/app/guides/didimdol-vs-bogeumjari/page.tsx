import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "내 집 마련 디딤돌 대출 vs 보금자리론 완벽 비교 (2025년)",
  description:
    "신혼부부, 생애최초 주택 구매자를 위한 대표 정책 대출 상품! 디딤돌 대출과 보금자리론의 자격 조건, 대출 한도, 금리를 2025년 기준으로 완벽하게 비교 분석합니다.",
};

export default function DidimdolVsBogeumjariPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          디딤돌 vs 보금자리론, 나에게 맞는 대출은?
        </h1>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          내 집 마련의 꿈을 이루기 위한 첫걸음, 주택담보대출. 그중에서도 정부가
          지원하는 디딤돌 대출과 보금자리론은 낮은 금리 덕분에 가장 먼저
          알아보는 필수 상품입니다. 두 상품의 핵심 차이점을 비교해 나에게 딱
          맞는 상품을 찾아보세요.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>디딤돌 대출</th>
                <th>보금자리론</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>대상 주택</strong>
                </td>
                <td>5억원 이하</td>
                <td>6억원 이하</td>
              </tr>
              <tr>
                <td>
                  <strong>소득 조건</strong>
                </td>
                <td>부부합산 6천만원 이하</td>
                <td>부부합산 7천만원 이하</td>
              </tr>
              <tr>
                <td>
                  <strong>금리</strong>
                </td>
                <td>
                  <strong>더 낮음 (고정 또는 5년 변동)</strong>
                </td>
                <td>상대적으로 높음 (고정)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link
          href="/home-loan"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          내 연봉으로 대출 한도(DSR) 계산하기 →
        </Link>
      </article>
    </main>
  );
}
