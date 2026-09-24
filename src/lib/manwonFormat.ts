// src/lib/manwonFormat.ts
//
// 만원 단위 금액 → 한글 표기 (예: 5,200만원 / 1억 2,000만원 / 2억원).
//
// 1억(10,000만원) 이상만 억 표기로 바꾸고, 1억 미만은 종전 문자열
// `${n.toLocaleString("ko-KR")}만원` 과 바이트 단위로 같다. "12,000만원" 같은
// 다섯 자리 만원 표기는 SERP 가독성이 나빠 CTR 을 깎는다 — 원 단위 헬퍼
// formatSalaryKorean(src/lib/seo.ts)으로 /salary·회사 제목을 바꾼 근거와 같다
// (seo.ts buildSalaryAmountMetadata 주석). 정수 입력에서는 두 헬퍼 결과가 같고,
// 이 함수는 공시 원값처럼 소수 만원(12,345.6)도 반올림 없이 보존한다.

const EOK_IN_MANWON = 10_000;

/** toLocaleString 기본 최대 소수 3자리에 맞춘 반올림 */
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function formatManwonKorean(manwon: number): string {
  // 억 여부는 표시 정밀도(소수 3자리)로 반올림한 값으로 판정한다 — 9999.9996 이 "10,000만원" 으로
  // 새지 않도록. 1억 미만 분기는 원값 그대로 포맷해 종전 문자열과 바이트 동일.
  if (!Number.isFinite(manwon) || round3(manwon) < EOK_IN_MANWON) {
    return `${manwon.toLocaleString("ko-KR")}만원`;
  }
  const rounded = round3(manwon);
  let eok = Math.floor(rounded / EOK_IN_MANWON);
  // 부동소수 잔차 제거(12345.6 − 10000 = 2345.6000000000004)
  let rest = round3(rounded - eok * EOK_IN_MANWON);
  // 잔여가 반올림으로 1억에 닿으면 억 자리로 올린다 ("1억 10,000만원" 방지)
  if (rest >= EOK_IN_MANWON) {
    eok += 1;
    rest = round3(rest - EOK_IN_MANWON);
  }
  return rest > 0
    ? `${eok}억 ${rest.toLocaleString("ko-KR")}만원`
    : `${eok}억원`;
}
