// 차트 툴팁·라벨 글자색 — 라이트·다크 테마 모두 읽히게, /tools/math 결과 숫자 색 (N2-components-05, 2026-11-15)
//
// globals.css 는 recharts 기본 툴팁 상자를 카드색으로 칠하고(배경 !important, 글자색 card-foreground) 차트 글자를
// --content-muted 로 칠한다. 옛 어두운 상자에 맞춘 인라인 글자색이 그 규칙을 이겨 라이트 테마에서 라벨이 사라지고
// (LoanChart #EDF1F5 1.14:1, RankChart·InsightEntrySalaryChart #fff), 다크 테마에서는 recharts 기본 값 줄 '#000'
// 이 다크 카드 위 1.25:1 이었다. 값 줄은 itemStyle color inherit 로 상자 글자색을 물려받는다.
// 모두 색만 바꾼다 — 툴팁은 떠 있는 겹층이고 글자 크기·요소·간격은 그대로라 광고 위치는 움직이지 않는다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");
/** 첫 <Tooltip …/> 블록 */
const tooltipBlock = (src: string) => {
  const m = src.match(/<Tooltip\b[\s\S]*?\/>/);
  if (!m) throw new Error("no <Tooltip/>");
  return m[0];
};

const TOOLTIP_FILES = [
  "src/components/charts/GlobalChart.tsx",
  "src/components/charts/SimulatorChart.tsx",
  "src/components/charts/DeductionBarChart.tsx",
  "src/components/charts/LoanChart.tsx",
  "src/components/charts/RankChart.tsx",
  "src/components/charts/InsightEntrySalaryChart.tsx",
  "src/components/ComparisonResultContent.tsx",
];

describe("차트 툴팁 값 줄은 상자 글자색을 물려받는다", () => {
  it("일곱 파일의 툴팁 모두 itemStyle color inherit", () => {
    for (const p of TOOLTIP_FILES) {
      expect(tooltipBlock(read(p)), p).toMatch(/itemStyle=\{\{ color: ["']inherit["'] \}\}/);
    }
  });

  it("흰 상자 위 흰·밝은 인라인 글자색이 툴팁에 없다", () => {
    for (const p of [
      "src/components/charts/LoanChart.tsx",
      "src/components/charts/RankChart.tsx",
      "src/components/charts/InsightEntrySalaryChart.tsx",
      "src/components/ComparisonResultContent.tsx",
    ]) {
      const block = tooltipBlock(read(p));
      expect(block, p).not.toMatch(/#fff\b|#EDF1F5|#e879f9/i);
      expect(block, p).not.toMatch(/\bcolor: ["']#/);
    }
  });

  it("LoanChart 잔액 이름·둥근 모서리만 남긴 contentStyle", () => {
    const src = read("src/components/charts/LoanChart.tsx");
    expect(tooltipBlock(src)).toContain('contentStyle={{ borderRadius: "0.75rem" }}');
    expect(src).toMatch(/<Area\s+name="잔액"/);
  });

  it("DeductionBarChart: % 라벨은 recharts-label 클래스(글로벌 차트 글자색), 툴팁 인라인 글자색 없음", () => {
    const src = read("src/components/charts/DeductionBarChart.tsx");
    expect(src).toMatch(/<text\s+className="recharts-label"/);
    expect(src).toContain('fill="#7A9AB5"'); // CSS 없을 때 대체값
    expect(src).toContain("fontSize={11}");
    expect(tooltipBlock(src)).not.toContain("#3D5E78");
  });

  it("globals.css 규칙(차트 글자색·카드색 툴팁 상자)이 그대로 있다 — 위 수정의 전제", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain(
      ".recharts-wrapper :is(.recharts-text, .recharts-label, .recharts-legend-item-text, .recharts-cartesian-axis-tick-value) { fill: hsl(var(--content-muted, var(--muted-foreground)));"
    );
    expect(css).toContain(
      ".recharts-tooltip-wrapper .recharts-default-tooltip { background-color: hsl(var(--card)) !important; color: hsl(var(--card-foreground));"
    );
  });
});

describe("/tools/math 비율·비중 결과 숫자는 테마 링크색", () => {
  it("결과 span 두 곳이 text-link, 크기·굵기 그대로", () => {
    const src = read("src/components/calculators/MathCalculators.tsx");
    expect(src.match(/<span className="text-2xl font-black text-link">/g)?.length).toBe(2);
    expect(src).not.toMatch(/<span className="[^"]*text-indigo-400[^"]*">/);
    // 제목 아이콘 색은 그대로
    expect(src.match(/className="w-4 h-4 text-indigo-400"/g)?.length).toBe(3);
  });
});
