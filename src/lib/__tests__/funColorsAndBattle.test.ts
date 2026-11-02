// fun·도구 페이지 소소한 표시 오류 회귀 가드 (2026-10-05 감사 code61-02·code61-03·code22-08·code18-08·code27-02)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CompanyComparator } from "@/lib/versusEngine";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

const profile = (ko: string, base: number, hours: number) =>
  ({
    name: { ko },
    salary: { entry: { base, incentive: { avgAmount: 0, target: 0 }, stock: null, signOn: 0 } },
    workLife: { weeklyHours: { real: hours }, vacation: { usageRate: 80 } },
    culture: { score: 7 },
    benefits: ["a", "b"],
  }) as never;

describe("연봉 배틀 판정 (code61-02·61-03)", () => {
  it("B 가 연봉·시급 모두 앞서면 B 압승 — 고른 칸과 무관하게 대칭", () => {
    const strong = profile("쿠팡", 80_000_000, 40);
    const weak = profile("네이버", 60_000_000, 45);
    expect(CompanyComparator.compare(weak, strong).verdict).toBe("쿠팡의 압승입니다. 연봉과 시급 모두 더 높습니다.");
    expect(CompanyComparator.compare(strong, weak).verdict).toBe("쿠팡의 압승입니다. 연봉과 시급 모두 더 높습니다.");
  });
  it("받침 있는 회사명 뒤 조사 — 쿠팡이, 네이버가", () => {
    const richButLong = profile("쿠팡", 80_000_000, 70);
    const lessButShort = profile("네이버", 70_000_000, 40);
    const v = CompanyComparator.compare(richButLong, lessButShort).verdict;
    expect(v).toContain("쿠팡이 돈은 더 주지만, 네이버가 '가성비(시급)'는 더 좋습니다");
    expect(v).toContain("네이버를 고려하세요");
    expect(v).not.toContain("쿠팡가");
  });
  it("레이더에 문화와 같은 값인 성장 축을 따로 그리지 않는다", () => {
    const r = CompanyComparator.compare(profile("A", 50_000_000, 40), profile("B", 50_000_000, 40));
    expect(r.radarData.map((d) => d.subject)).not.toContain("성장 (Growth)");
    expect(r.radarData.map((d) => d.subject)).toContain("문화 (Culture)");
  });
});

describe("밝은 배경 위 흰 글자·다크 테마 흰 배경 (code22-08·code18-08)", () => {
  it("복싱 게임 A 쪽 이름·HP 는 테마 글자색", () => {
    const src = readSrc("src/components/BoxingGame.tsx");
    expect(src).toContain('<div className="flex justify-between text-navy font-black text-xl mb-2 uppercase tracking-tighter">');
  });
  it("연봉 인상 비교 카드(강조 아님)는 다크 테마 배경 클래스", () => {
    const src = readSrc("src/app/salary-raise-2026/Client.tsx");
    expect(src).toContain('highlight ? "" : " bg-white dark:bg-canvas-900"');
    expect(src).not.toContain(': "#fff"');
  });
});

describe("/fun/rank 분포 차트 ME 선 (code27-02)", () => {
  it("숫자 X축(연봉)과 범위 안으로 붙인 ME 위치", () => {
    const src = readSrc("src/components/charts/RankChart.tsx");
    expect(src).toContain('<XAxis dataKey="salary" type="number" domain={[minX, maxX]} hide />');
    expect(src).toContain("<ReferenceLine x={markerX} ");
  });
  it("ME 선은 흰 카드에서도 보이는 글자색, 위쪽 라벨은 SVG 안에 들어갈 여백 (P4 검토 보정)", () => {
    const src = readSrc("src/components/charts/RankChart.tsx");
    // 흰 선(#fff)은 라이트 테마 흰 카드(duotone-card) 위에서 안 보였다
    expect(src).not.toMatch(/<ReferenceLine[^>]*stroke="#fff"/);
    expect(src).toContain('<ReferenceLine x={markerX} stroke="currentColor"');
    // 기본 위 여백 5px 이면 position top 라벨의 기준선이 y=0 에 놓여 SVG 밖으로 잘린다
    expect(src).toContain("<AreaChart data={data} margin={{ top: 24, right: 16, bottom: 5, left: 16 }}>");
  });
});
