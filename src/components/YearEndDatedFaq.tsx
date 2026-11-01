// src/components/YearEndDatedFaq.tsx
//
// 연말정산 정밀 계산기 4쪽 — 페이지 맨 끝(마지막 광고 MultiplexAd 보다 아래) 날짜 박힌 FAQ 블록 (SEASON-15, 2026-09-26).
// 서버 컴포넌트·상호작용은 기본 <details> 뿐. 문구는 src/lib/yearEndDatedFaqs.ts, 같은 배열을 그 쪽 FAQPage JSON-LD 에 합친다.
// 광고 위에 두지 않는다 — 기존 FAQ(쿠팡·멀티플렉스 위)와 별도 블록.
// 2026-10-22 SE-04: 연말정산 허브(/year-end-tax-2027) 맨 끝도 같은 블록을 쓴다 — 확인일·근거 문구만 선택 인자로 받는다.
//   기본값이면 종전 4쪽의 서버 HTML 과 바이트가 같다(안내 문장은 종전처럼 텍스트 노드 하나 — yearEndDatedFaqs.test.ts 가 고정).

import {
  YEAR_END_DATED_FAQ_CHECKED_LABEL,
  YEAR_END_DATED_FAQ_CHECKED_ON,
  YEAR_END_DATED_FAQ_HEADING,
  type YearEndDatedFaqItem,
} from "@/lib/yearEndDatedFaqs";

/** 종전 안내 문장의 근거 부분 — 정밀 계산기 4쪽 기본값 */
const DEFAULT_BASIS = "국가법령정보센터 현행 조문과 재정경제부 발표로";

export default function YearEndDatedFaq({
  items,
  headingId,
  checkedOn = YEAR_END_DATED_FAQ_CHECKED_ON,
  checkedLabel = YEAR_END_DATED_FAQ_CHECKED_LABEL,
  basis = DEFAULT_BASIS,
}: {
  items: readonly YearEndDatedFaqItem[];
  headingId: string;
  /** 확인일(YYYY-MM-DD) — 기본 YEAR_END_DATED_FAQ_CHECKED_ON */
  checkedOn?: string;
  /** 화면 표기 확인일 — 기본 YEAR_END_DATED_FAQ_CHECKED_LABEL */
  checkedLabel?: string;
  /** '… 확인한 내용입니다' 앞 근거 문구 */
  basis?: string;
}) {
  return (
    <section className="my-10" aria-labelledby={headingId} data-test="year-end-dated-faq">
      <h2 id={headingId} className="text-lg font-black text-navy dark:text-canvas-50 mb-1">
        {YEAR_END_DATED_FAQ_HEADING}
      </h2>
      <p className="text-xs leading-6 text-faint-blue mb-4">
        <time dateTime={checkedOn}>{checkedLabel}</time>
        {` ${basis} 확인한 내용입니다.`}
      </p>
      <div className="space-y-4">
        {items.map((f) => (
          <details
            key={f.question}
            className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700"
          >
            <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
              Q. {f.question}
            </summary>
            <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
