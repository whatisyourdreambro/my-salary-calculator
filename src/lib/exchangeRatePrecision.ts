// 환율 영향 계산기(src/components/ExchangeRateDisplay.tsx) 환율 문자열 정밀도 도우미.
//
// 2026-10-05 감사 code23-04 정정(9a898bf61 중 문자열 부분만 이식): 종전에는 과거·현재 환율을 toFixed(4) 문자열로
// 저장했다. 비교 통화가 KRW 이고 자산이 USD·EUR·GBP 면 환율이 0.0005~0.0007 이라 유효숫자가 한 자리만 남아
// 변동률이 0.00%·-14.29% 같은 가짜 값이 됐다. 이제 1 이상은 종전처럼 소수 4자리, 1 미만은 유효숫자 6자리로 저장한다.
// 과거 환율 요청(base=비교 통화&symbols=자산 통화)과 구매력 환산(exchangeMath.assetInComparisonCurrency)은 그대로다.

/** 환율 문자열 — 1 이상은 소수 4자리, 1 미만은 유효숫자 6자리 (0.0007 처럼 뭉개지지 않게) */
export function formatRateString(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "0";
  if (rate >= 1) return rate.toFixed(4);
  return Number(rate.toPrecision(6)).toString();
}
