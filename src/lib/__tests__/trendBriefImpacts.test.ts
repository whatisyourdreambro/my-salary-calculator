// 트렌드 브리프 영향 표 엔진 게이트 (2026-09-26 R5 publisher)
//
// - 계산 종류마다 대표 파라미터로 3행 × 값 2열 이상을 만들고, 두 번 계산해도 같다(결정적).
// - 값은 fixtures/trendBriefNumbers.json 에 고정 — kinds(대표 파라미터)와 briefs(발행분, render.ts --write 가 기록).
//   엔진이 바뀌어 발행된 브리프의 표가 조용히 달라지는 것을 막는다.
// - impacts.ts 는 현행 요율 포인터(CURRENT_*·src/config/currentRates)를 import 하지 않고 verify:tax 감시 리터럴을 쓰지 않는다.
// - impacts.ts 의 정적 import 그래프에 React·'use client' 모듈이 없다(서버·스크립트 전용 순수 계산).
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CANONICAL_CONSTS,
  IMPACT_KINDS,
  constText,
  impactCell,
  impactRows,
  impactTable,
  manwon,
  pct,
  validateImpactParams,
} from "@/lib/trendBriefs/impacts";
import { parseVerifyTaxPatterns } from "@/lib/trendBriefs/rules";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const NUMBERS = JSON.parse(read("src/lib/__tests__/fixtures/trendBriefNumbers.json")) as {
  kinds: Record<string, { params: Record<string, unknown>; rows: string[][] }>;
  briefs: Record<string, { kind: string; params: Record<string, unknown>; rows: string[][] }>;
};
const CHANGED = "brief numbers changed — re-render with render.ts and review before merge";

describe("영향 표 계산 종류", () => {
  it("v1 종류 9개가 모두 있고 대표 파라미터가 고정돼 있다", () => {
    expect(Object.keys(IMPACT_KINDS).sort()).toEqual(
      ["bonus-net", "civil-servant-pay", "insurance-rate-change", "loan-repayment", "minimum-wage", "net-pay", "severance", "unemployment-benefit", "year-end-tax"].sort()
    );
    expect(Object.keys(NUMBERS.kinds).sort()).toEqual(Object.keys(IMPACT_KINDS).sort());
  });

  for (const [id, kind] of Object.entries(IMPACT_KINDS)) {
    it(`${id}: 3행 × 값 2열 이상, 열 수 일치, 결정적`, () => {
      const { params } = NUMBERS.kinds[id];
      expect(validateImpactParams(id, params)).toEqual([]);
      const a = kind.build(params).rows;
      const b = kind.build(JSON.parse(JSON.stringify(params))).rows;
      expect(a.length).toBeGreaterThanOrEqual(3);
      expect(kind.columns.length - 1).toBeGreaterThanOrEqual(2);
      for (const row of a) expect(row.length).toBe(kind.columns.length);
      expect(b).toEqual(a);
      // 열 라벨은 일반 표현 — verify:tax 감시 숫자·요율 리터럴 없음
      for (const col of kind.columns) expect(col).not.toMatch(/\d[\d,.]*\s?%|\d{1,3}(?:,\d{3})+/);
    });
  }

  it("값이 고정 수치와 같다 (kinds + 발행된 briefs)", () => {
    for (const [id, pin] of Object.entries(NUMBERS.kinds)) expect(impactTable(id, pin.params).rows, `${CHANGED} (kind ${id})`).toEqual(pin.rows);
    for (const [slug, pin] of Object.entries(NUMBERS.briefs)) expect(impactTable(pin.kind, pin.params).rows, `${CHANGED} (${slug})`).toEqual(pin.rows);
  });

  it("행 HTML·셀은 이스케이프된 엔진 값이다", () => {
    const { params } = NUMBERS.kinds["minimum-wage"];
    const rows = impactRows("minimum-wage", params);
    expect(rows.split("\n")).toHaveLength(3);
    expect(rows.startsWith("<tr><td>시급</td>")).toBe(true);
    expect(impactCell("minimum-wage", params, 0, 1)).toBe(NUMBERS.kinds["minimum-wage"].rows[0][1]);
    expect(() => impactCell("minimum-wage", params, 9, 9)).toThrow();
    expect(impactCell("loan-repayment", NUMBERS.kinds["loan-repayment"].params, 0, 0)).toContain("가정");
  });

  it("파라미터 검증 — 범위·개수·알 수 없는 키·연도 짝", () => {
    expect(validateImpactParams("net-pay", { salaries: [30000000, 50000000] }).join()).toContain("3~6개");
    expect(validateImpactParams("net-pay", { salaries: [1, 2, 3] }).join()).toContain("범위");
    expect(validateImpactParams("net-pay", { salaries: [30000000, 40000000, 50000000], extra: 1 }).join()).toContain("알 수 없는");
    expect(validateImpactParams("minimum-wage", { from: "2025", to: "2027" }).join()).toContain("from + 1");
    expect(validateImpactParams("insurance-rate-change", { monthlyPays: [2000000, 3000000, 4000000], override: { X: 0.1 } }).join()).toContain("요율 키");
    expect(validateImpactParams("nope", {})).toEqual(["알 수 없는 영향 표 종류: nope"]);
    expect(() => impactTable("net-pay", { salaries: [] })).toThrow();
  });

  it("출처 요율 override 는 표에 반영되고 base 2026 이면 나머지는 현행 요율", () => {
    const rows = impactTable("insurance-rate-change", {
      monthlyPays: [2000000, 3000000, 4000000],
      base: "2026",
      override: { EMPLOYMENT_INSURANCE: 0.01 },
    }).rows;
    // 국민연금·건강 칸은 현행 = 변경 후, 고용보험 칸만 바뀐다
    for (const row of rows) {
      const [p0, p1] = row[1].split(" → ");
      const [h0, h1] = row[2].split(" → ");
      const [e0, e1] = row[3].split(" → ");
      expect(p0).toBe(p1);
      expect(h0).toBe(h1);
      expect(e0).not.toBe(e1);
    }
  });
});

describe("정본 상수 표기 (constText)", () => {
  it("공식 문서 표기와 같다", () => {
    expect(constText("MINIMUM_WAGE_2026_HOURLY")).toBe("10,320원");
    expect(constText("MINIMUM_WAGE_2026_HOURLY_NUM")).toBe("10,320");
    expect(constText("MINIMUM_WAGE_2027_HOURLY")).toBe("10,700원");
    expect(constText("UNEMPLOYMENT_UPPER_2026")).toBe("68,100원");
    expect(constText("UNEMPLOYMENT_LOWER_2026")).toBe("66,048원");
    expect(constText("PENSION_RATE_2026")).toBe("4.75%");
    expect(constText("HEALTH_RATE_2026")).toBe("3.595%");
    expect(constText("PENSION_BASE_2026_MAX_MANWON")).toBe("659만원");
    expect(constText("PENSION_BASE_2026_MAX_ANNUAL_MANWON")).toBe("7,908만원");
    expect(() => constText("NOPE")).toThrow();
    expect(pct(0.0475)).toBe("4.75%");
    expect(manwon(100_000_000)).toBe("1억원");
    expect(manwon(150_000_000)).toBe("1억 5,000만원");
  });

  it("확정 상태는 taxConstants2027 상태 플래그를 따른다", () => {
    expect(CANONICAL_CONSTS.PENSION_RATE_2027.confirmed).toBe(true);
    expect(CANONICAL_CONSTS.LTC_RATIO_2027.confirmed).toBe(false);
    expect(CANONICAL_CONSTS.EMPLOYMENT_RATE_2027.confirmed).toBe(false);
    // 흔한 표기('5%'·'0.9%')는 자동 치환하지 않는다
    expect(CANONICAL_CONSTS.PENSION_RATE_2027.autoReplace).toBe(false);
    expect(CANONICAL_CONSTS.EMPLOYMENT_RATE_2026.autoReplace).toBe(false);
  });
});

describe("impacts.ts 소스 규칙", () => {
  const src = read("src/lib/trendBriefs/impacts.ts");

  it("현행 요율 포인터를 import 하지 않는다", () => {
    expect(src).not.toMatch(/from\s+["']@\/config\/currentRates["']/);
    expect(src).not.toMatch(/\bCURRENT_[A-Z_]+/);
  });

  it("verify:tax 감시 리터럴이 없다", () => {
    const patterns = parseVerifyTaxPatterns(read("scripts/verify-tax-constants.mjs"));
    expect(patterns.length).toBeGreaterThanOrEqual(11);
    expect(patterns.filter((p) => p.re.test(src)).map((p) => p.name)).toEqual([]);
  });

  it("정적 import 그래프에 React·'use client' 모듈이 없다", () => {
    const EXTS = ["", ".ts", ".tsx", ".js", "/index.ts", "/index.tsx"];
    const resolveSpec = (from: string, spec: string): string | null => {
      const base = spec.startsWith("@/") ? join(ROOT, "src", spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(from), spec) : null;
      if (!base) return null;
      for (const e of EXTS) if (existsSync(base + e) && statSync(base + e).isFile()) return base + e;
      return null;
    };
    const seen = new Set<string>();
    const packages = new Set<string>();
    const stack = [join(ROOT, "src/lib/trendBriefs/impacts.ts")];
    while (stack.length) {
      const f = stack.pop()!;
      if (seen.has(f)) continue;
      seen.add(f);
      const text = readFileSync(f, "utf8");
      expect(/^\s*["']use client["']/.test(text), relative(ROOT, f)).toBe(false);
      for (const m of text.matchAll(/(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\s+from\s+)?["']([^"']+)["']/g)) {
        if (/^(?:import|export)\s+type\s/.test(m[0])) continue;
        const t = resolveSpec(f, m[1]);
        if (t) stack.push(t);
        else if (!m[1].startsWith(".") && !m[1].startsWith("@/")) packages.add(m[1]);
      }
    }
    expect(seen.size).toBeGreaterThan(5);
    expect([...packages].filter((p) => /^react|^next|lucide|recharts|framer/.test(p))).toEqual([]);
    expect([...seen].map((f) => relative(ROOT, f).replace(/\\/g, "/")).filter((p) => p.endsWith(".tsx"))).toEqual([]);
  });
});
