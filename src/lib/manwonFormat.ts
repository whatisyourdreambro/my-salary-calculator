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

export function formatManwonKorean(manwon: number): string {
  if (!Number.isFinite(manwon) || manwon < EOK_IN_MANWON) {
    return `${manwon.toLocaleString("ko-KR")}만원`;
  }
  const eok = Math.floor(manwon / EOK_IN_MANWON);
  // 부동소수 잔차 제거(12345.6 − 10000 = 2345.6000000000004) — toLocaleString 기본 소수 3자리에 맞춘다
  const rest = Math.round((manwon - eok * EOK_IN_MANWON) * 1000) / 1000;
  return rest > 0
    ? `${eok}억 ${rest.toLocaleString("ko-KR")}만원`
    : `${eok}억원`;
}
