// 성과급 지급률 리포트(/insights/bonus-payout-history-2026)의 현대모비스 행 — 2026 임단협 타결 (R4 MOBIS, N2-calc-19)
//
// bonusData.ts 는 계산기 Client.tsx 시나리오의 전사본이다(scripts/verify-bonus-data.mjs). 계산기 칩이 2026 타결·2025 타결 두 개가
// 되어(운영자 승인 2026-11-17) 2024 임협 합의 행 2개를 2026 타결 행 2개로 바꿨다. 리포트 표 ①(GuideMidAd 위)·③(MultiplexAd 위)에
// 그대로 그려지므로 행 수는 그대로 두고, 비고·출처 칸('비고 — 출처', text-xs, 칸 최대 320px)은 바뀐 2024 행보다 모든 칸 폭에서 줄 수가
// 같거나 적게 맞췄다(사이트 서브셋 글꼴 폭 모델: ① 346.9 → 325.3px, ③ 673.5 → 599.0px). 게시 전 통합 스윕에서 실측한다.
// 출처: 더팩트 2026-08-26(잠정합의안 400%+1,320만원·주식 8주·복지포인트 50만원)·2026-09-04(올해 임단협 마무리),
// DART 2026-10-30 주요사항보고서(자기주식처분결정 — 2026년 단체교섭에 따른 회사주식 지급, 처분 예정 2026-11-30).
import { describe, expect, it } from "vitest";
import { BONUS_PROFILES } from "@/data/bonusData";
import { payoutStatus } from "@/app/insights/_lib/reportDatasets";

const mobis = BONUS_PROFILES.find((p) => p.companyId === "hyundai-mobis")!;

describe("bonusData 현대모비스 — 2026 타결 행 (2024 행과 교체, 행 수 그대로)", () => {
  it("행은 2026 2개 + 2025 2개, 2024 행은 없다", () => {
    expect(mobis.calcSlug).toBe("hyundai-mobis-bonus");
    expect(mobis.payouts.map((p) => p.year)).toEqual([2026, 2026, 2025, 2025]);
  });

  it("2026 값은 계산기 기본 시나리오와 같은 400% · 1,320만원, 상태는 지급(paid)", () => {
    const y26 = mobis.payouts.filter((p) => p.year === 2026);
    expect(y26.map((p) => p.percentOfBase ?? p.fixedAmountManwon)).toEqual([400, 1320]);
    for (const p of y26) expect(payoutStatus(p)).toBe("paid");
  });

  it("비고·출처 칸 글은 폭을 맞춘 값 그대로다(바뀐 2024 행보다 짧게)", () => {
    const cell = (i: number) => `${mobis.payouts[i].note} — ${mobis.payouts[i].source}`;
    expect(cell(0)).toBe("2026 임단협 타결 — 기본급 월 +10만 별도 — 더팩트 2026-09-04");
    expect(cell(1)).toBe("2026 임단협 타결 — 별도 주식 8주(11/30 지급, DART 2026-10-30 공시)·복지포인트 50만 — 더팩트 2026-08-26·09-04");
  });
});
