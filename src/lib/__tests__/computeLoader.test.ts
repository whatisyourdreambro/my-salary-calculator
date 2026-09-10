// 번들 분리 회귀 게이트 (2026-09-11):
//  1) 202종 전부 배치 키가 있고, 그 배치의 동적 import 가 같은 slug 의 compute 를 돌려준다.
//  2) 지연 로드된 compute 와 레지스트리 compute 가 기본값·0·최대값 입력에서 동일 결과를 낸다.
//  3) toClientCalculator 는 compute 를 떼고 나머지 텍스트·필드를 그대로 보존한다.
//  4) 클라이언트 컴포넌트(SimpleCalculatorView)가 레지스트리 전체를 다시 import 하지 않는다.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  allCalculators,
  defaultInputsOf,
  getCalculatorBatch,
  toClientCalculator,
} from "@/lib/simpleCalculators";
import { loadCalculatorCompute } from "@/lib/simpleCalculators/computeLoader";

const probeInputs = (fields: (typeof allCalculators)[number]["fields"]) => {
  const zero: Record<string, number> = {};
  const max: Record<string, number> = {};
  for (const f of fields) {
    zero[f.name] = 0;
    max[f.name] = f.max ?? f.defaultValue * 10;
  }
  return [zero, max];
};

describe("simpleCalculators compute loader (client bundle split)", () => {
  it("resolves a batch for every registered slug", () => {
    const missing = allCalculators.filter((c) => !getCalculatorBatch(c.slug)).map((c) => c.slug);
    expect(missing).toEqual([]);
  });

  it("lazy-loaded compute equals registry compute for default/zero/max inputs", async () => {
    for (const calc of allCalculators) {
      const batch = getCalculatorBatch(calc.slug)!;
      const compute = await loadCalculatorCompute(batch, calc.slug);
      expect(compute, `${calc.slug} missing in ${batch}`).toBeTypeOf("function");
      for (const inputs of [defaultInputsOf(calc), ...probeInputs(calc.fields)]) {
        let expected: unknown, actual: unknown;
        try { expected = calc.compute(inputs); } catch (e) { expected = { threw: String(e) }; }
        try { actual = compute!(inputs); } catch (e) { actual = { threw: String(e) }; }
        expect(actual, `${calc.slug} ${JSON.stringify(inputs)}`).toEqual(expected);
      }
    }
  });

  it("returns null for an unknown slug without throwing", async () => {
    await expect(loadCalculatorCompute("batch1", "__nope__")).resolves.toBeNull();
  });

  it("toClientCalculator strips compute and keeps everything else", () => {
    for (const calc of allCalculators) {
      const client = toClientCalculator(calc);
      expect("compute" in client).toBe(false);
      const { compute: _c, ...rest } = calc;
      void _c;
      expect(client).toMatchObject(rest);
      // relatedSlugs 는 서버에서 카드로 풀린다 — 존재하는 slug 만, 순서 유지
      const resolvable = (calc.relatedSlugs ?? []).filter((s) => allCalculators.some((c) => c.slug === s));
      expect((client.relatedCards ?? []).map((r) => r.slug)).toEqual(resolvable);
      expect(() => JSON.stringify(client)).not.toThrow();
    }
  });

  it("SimpleCalculatorView does not import the full registry", () => {
    const src = readFileSync(path.resolve(process.cwd(), "src/components/SimpleCalculatorView.tsx"), "utf8");
    expect(src).not.toMatch(/from\s+["']@\/lib\/simpleCalculators["']/);
    expect(src).not.toMatch(/from\s+["']@\/lib\/simpleCalculators\/index["']/);
    expect(src).toMatch(/simpleCalculators\/computeLoader/);
  });
});
