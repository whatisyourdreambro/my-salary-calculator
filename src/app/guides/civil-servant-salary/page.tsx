import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "공무원 9급, 7급 첫 월급 상세 분석 (2025년 기준 실수령액)",
  description:
    "2025년 공무원 봉급표 기준, 9급 및 7급 1호봉의 실제 첫 월급은? 기본급과 각종 수당을 포함한 세후 실수령액을 상세히 알려드립니다.",
};

export default function CivilServantSalaryPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          9급, 7급 공무원 첫 월급, 정말 박봉일까?
        </h1>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          <strong>&apos;평생 직장&apos;</strong>이라 불리는 공무원, 하지만{" "}
          <strong>&apos;박봉&apos;</strong>이라는 이미지도 강합니다. 과연 2025년
          기준 9급, 7급 신규 공무원의 첫 월급 실수령액은 얼마나 될까요?
        </p>
        <section className="mt-12 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg">
          <h2 className="!mt-0 text-2xl font-bold">
            2025년 첫 월급 실수령액 (추정치)
          </h2>
          <p>
            기본급에 정액급식비, 직급보조비 등 공통 수당을 포함하고 세금을
            공제한 금액입니다. (초과근무수당 등은 제외)
          </p>
          <ul className="list-none !pl-0">
            <li>
              <strong>9급 1호봉:</strong> 약 210만원 ~ 230만원
            </li>
            <li>
              <strong>7급 1호봉:</strong> 약 240만원 ~ 260만원
            </li>
          </ul>
        </section>
        <Link
          href="/table/monthly"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          월급별 실수령액 표 전체 보기 →
        </Link>
      </article>
    </main>
  );
}
