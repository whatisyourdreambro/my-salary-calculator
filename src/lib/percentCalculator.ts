// /tools/math 퍼센트 계산기(src/components/calculators/MathCalculators.tsx) 산식 — 카드 3장이 각자 입력 두 칸만 쓴다.

// 입력칸 문자열 → 숫자 상태 ("" = 미입력)
export const toNum = (raw: string): number | "" => (raw === "" ? "" : Number(raw));

/**
 * 퍼센트 계산 3종 — 카드마다 자기 입력 두 칸만 쓴다.
 * 2026-10-05 감사 code26-02 정정: 종전에는 세 카드가 val1/val2 한 쌍을 공유하고 입력칸은 value 없이(비제어) 그려져,
 * 한 카드에 입력하면 비어 있는 다른 카드에 엉뚱한 결과(+249900.00% 등)가 나왔다.
 */
export function percentResults(
  ratio: { whole: number | ""; percent: number | "" },
  share: { part: number | ""; whole: number | "" },
  change: { from: number | ""; to: number | "" }
): { res1: number; res2: number; res3: number } {
  // 1. 전체값의 X% 는?
  const res1 = ratio.whole && ratio.percent ? (Number(ratio.percent) / 100) * Number(ratio.whole) : 0;
  // 2. 일부값은 전체값의 몇 %?
  const res2 = share.part && share.whole ? (Number(share.part) / Number(share.whole)) * 100 : 0;
  // 3. 기존값에서 변경값으로 증감율 — 변경값 0 도 입력값이다(100 → 0 = -100%, 2026-11-15 lib-b07-F01). 기존값 0 은 나눌 수 없어 0.
  const from = Number(change.from);
  const to = Number(change.to);
  const res3 = change.from !== "" && change.to !== "" && from !== 0 && Number.isFinite(from) && Number.isFinite(to) ? ((to - from) / from) * 100 : 0;
  return { res1, res2, res3 };
}

/** 증감율 결과 글자색 — 종전 0 이하가 흰색(rgba 255,255,255,0.8)이라 밝은 배경에서 안 보였다 (code26-03) */
export function changeColorClass(res3: number): string {
  if (res3 > 0) return "text-primary";
  if (res3 < 0) return "text-rose-600 dark:text-rose-400";
  return "text-navy";
}

