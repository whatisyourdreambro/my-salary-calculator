// src/lib/widgets/dsrLimit.ts
//
// /widget/dsr 임베드 위젯의 DSR 한도 산식 (순수 산술 — import 없음).
//
// 종전에는 route.ts 가 모듈 스코프에서 본편 /calc/dsr-quick compute 와 이 산식을 대조했다.
// 그 한 번의 검증 때문에 계산기 레지스트리 전체(simpleCalculators)가 edge 함수에 번들돼
// widget/dsr.func.js 가 1.68MB(다른 위젯 42~73KB)였고, 대조는 빌드가 아니라 프로덕션 콜드
// isolate 첫 요청에서 실행됐다(드리프트 시 빌드 실패가 아니라 위젯 500). 2026-09-25 B1 에서
// 산식을 이 모듈로 옮기고 대조는 vitest(src/lib/__tests__/widgetDsr.test.ts)로 이전했다.
// route 파일은 핸들러·세그먼트 설정 외 export 금지(Next 타입 검사) — 그래서 별도 모듈이다.
// 위젯 인라인 JS(route.ts buildHtml)도 같은 산식이다. 산식을 바꾸면 세 곳(본편 compute·이 모듈·인라인 JS)을 함께 고칠 것.

/** DSR 규제 비율 40% — 본편 dsr-quick compute 의 `yearly * 0.4` 와 동일 */
export const DSR_RATIO = 0.4;

/** 위젯 JS 와 동일한 산식 (원리금균등 상환 월납 한도 → 대출원금 PV) */
export function dsrLimitOf(yearly: number, ratePct: number, years: number): number {
  const annualLimit = yearly * DSR_RATIO;
  const monthly = annualLimit / 12;
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return Math.round(monthly * n);
  return Math.round((monthly * (1 - Math.pow(1 + r, -n))) / r);
}
