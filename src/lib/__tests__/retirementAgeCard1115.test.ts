// N2-app-pages-14 (app-pages-b05-F02, 2026-11-15): /retirement-pension-2026 연령별 추천 50대 카드가
// 'DC→DB 전환 검토'를 권했지만 같은 페이지 FAQ(FAQPage JSON-LD 포함)는 'DC→DB는 불가'라고 답한다.
// 카드를 중립 문구(안전자산 비중 점진 확대)로 바꾼다. 카드는 CalcResultAd 와 GuideMidAd 사이(광고 위)라
// 옛 문구보다 좁아야 한다 — 사이트 글꼴 advance 폭으로 전략 143.2 → 116.6px(굵게), 설명 384.1 → 376.1px,
// 0.25px 간격 모든 폭에서 줄 수가 옛 문구 이하(실측은 통합 단계 1px 스윕). 화면 날짜(2026-10-26)는 광고 위라 그대로.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/retirement-pension-2026/page.tsx"), "utf8");

describe("/retirement-pension-2026 50대 연령 카드", () => {
  it("DC→DB 전환을 권하지 않고 FAQ 의 'DC→DB는 불가'는 그대로", () => {
    expect(src).toContain('strategy: "DC 안정 강화 + IRP 안전"');
    expect(src).toContain('"위험자산 30%+. 안전자산 비중 점진 확대. IRP는 안정성 우선 TDF로 일임도 옵션."');
    expect(src).not.toContain("DC→DB 전환 검토");
    expect(src).not.toContain("DB 옵션 있다면 전환 검토");
    expect(src).toContain("DC→DB는 불가");
  });

  it("새 문구가 옛 문구보다 글자 수가 적다(폭 하한 가드)", () => {
    expect([..."DC 안정 강화 + IRP 안전"].length).toBeLessThan([..."DC→DB 전환 검토 + IRP 안전"].length);
    // 설명 구간: 한글 1음절이 늘지만 'DB'와 빈칸 하나가 빠진다(글꼴 폭 −8.0px). 글자 수는 줄어든다.
    const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;
    expect(hangul("안전자산 비중 점진 확대.")).toBe(hangul("DB 옵션 있다면 전환 검토.") + 1);
    expect([..."안전자산 비중 점진 확대."].length).toBeLessThan([..."DB 옵션 있다면 전환 검토."].length);
  });

  it("화면·OG 날짜는 그대로(2026-10-26)", () => {
    expect(src).toContain('<PublishedMeta publishedDate="2026-02-01" updatedDate="2026-10-26" className="mb-2" />');
    expect(src).toContain('modifiedTime: "2026-10-26"');
  });
});
