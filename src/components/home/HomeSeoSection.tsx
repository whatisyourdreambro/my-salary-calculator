// 홈페이지 하단 SEO 콘텐츠 섹션 — 서버 렌더링.
// 기존 홈은 계산기 위젯 위주라 크롤러가 읽을 본문 텍스트가 거의 없었다.
// 여기서 "실수령액 계산 방법" 설명 + FAQ + 인기 연봉 구간 내부링크를 정적 HTML로 제공한다.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_FAQ_ITEMS, POPULAR_SALARY_LINKS } from "@/lib/homeContent";

export default function HomeSeoSection() {
  return (
    <section className="section-lg bg-white border-t border-canvas-200">
      <div className="page-width max-w-3xl">
        {/* 인기 연봉 구간 바로가기 — /salary/[amount] 동적 페이지 내부링크 */}
        <div className="mb-16">
          <h2 className="text-[clamp(1.375rem,3vw,2rem)] font-black text-navy tracking-[-0.035em] mb-2">
            인기 연봉 구간 실수령액 바로보기
          </h2>
          <p className="text-faint-blue text-[15px] font-medium mb-6">
            자주 찾는 연봉 구간의 2026년 월 실수령액을 한 번에 확인하세요.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {POPULAR_SALARY_LINKS.map(({ label, amount }) => (
              <Link
                key={amount}
                href={`/salary/${amount}`}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-canvas border border-canvas-200 text-sm font-bold text-navy hover:border-electric hover:text-electric transition-colors"
              >
                {label}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        {/* 실수령액 계산 방법 설명 — 본문 텍스트 (E-E-A-T·키워드) */}
        <article className="prose-toss mb-16">
          <h2 className="text-[clamp(1.375rem,3vw,2rem)] font-black text-navy tracking-[-0.035em] mb-4">
            2026년 연봉 실수령액, 이렇게 계산됩니다
          </h2>
          <p className="text-[15.5px] leading-[1.8] text-muted-blue font-medium mb-4">
            회사와 계약한 <strong className="text-navy">세전 연봉</strong>은 통장에
            그대로 들어오지 않습니다. 매달 급여에서 4대보험료와 소득세·지방소득세가
            원천징수된 뒤 남는 금액이 바로 <strong className="text-navy">실수령액</strong>
            입니다. 머니샐러리 연봉 계산기는 2026년 최신 요율을 그대로 반영해 이
            공제 과정을 5초 만에 계산해 줍니다.
          </p>
          <p className="text-[15.5px] leading-[1.8] text-muted-blue font-medium mb-4">
            공제 항목은 크게 네 가지입니다.{" "}
            <strong className="text-navy">국민연금 4.75%</strong>,{" "}
            <strong className="text-navy">건강보험 3.595%</strong>(여기에 건강보험료의
            12.95%가 장기요양보험으로 추가),{" "}
            <strong className="text-navy">고용보험 0.9%</strong>가 4대보험으로
            빠져나가고, 여기에 부양가족 수와 비과세 식대(월 20만원)에 따라 달라지는{" "}
            <strong className="text-navy">근로소득세</strong>와 그 10%인{" "}
            <strong className="text-navy">지방소득세</strong>가 더해집니다.
          </p>
          <p className="text-[15.5px] leading-[1.8] text-muted-blue font-medium">
            예를 들어 연봉 5,000만원이라면 월 기본급은 약 416만원이지만, 위 공제액을
            제하면 실제 입금액은 월 약 353만원 수준입니다. 같은 연봉이라도 부양가족
            수, 비과세 식대 포함 여부에 따라 실수령액이 달라지므로, 정확한 금액은 본인
            조건을 입력해 직접 확인하는 것이 가장 좋습니다.
          </p>
        </article>

        {/* FAQ — JSON-LD(faqLd)와 동일 콘텐츠를 화면에도 노출 */}
        <div>
          <h2 className="text-[clamp(1.375rem,3vw,2rem)] font-black text-navy tracking-[-0.035em] mb-6">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {HOME_FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-canvas-200 bg-canvas p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold text-navy text-[15.5px]">
                  {item.question}
                  <ArrowRight className="w-4 h-4 text-faint-blue transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-[14.5px] leading-[1.75] text-muted-blue font-medium">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
