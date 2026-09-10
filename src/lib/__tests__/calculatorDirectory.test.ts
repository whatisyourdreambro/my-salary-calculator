import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allCalculators, getAllSlugs } from "@/lib/simpleCalculators";
import { SIMPLE_CALC_COUNT } from "@/config/site";
import { getDedicatedCalculatorEntries } from "@/lib/searchIndex";

describe("expanded calculator discovery", () => {
  it("keeps generated counts, unique routes and the doubled registry in sync", () => {
    expect(allCalculators.length).toBeGreaterThanOrEqual(202);
    expect(SIMPLE_CALC_COUNT).toBe(allCalculators.length);
    expect(new Set(getAllSlugs()).size).toBe(allCalculators.length);
  });

  it("publishes 101 new usable calculators with complete explanations and live related routes", () => {
    const expanded = allCalculators.filter(calc => calc.publishedAt === "2026-09-10");
    expect(expanded).toHaveLength(101);
    const known = new Set(getAllSlugs());
    for (const calc of expanded) {
      expect(existsSync(join(process.cwd(), "src/app/calc", calc.slug, "page.tsx")), calc.slug).toBe(false);
      expect(calc.explanation?.length, calc.slug).toBeGreaterThan(150);
      expect(calc.faqs?.length, calc.slug).toBeGreaterThanOrEqual(3);
      expect(calc.formula?.length, calc.slug).toBeGreaterThan(10);
      expect(calc.caveats?.length, calc.slug).toBeGreaterThan(0);
      expect(new Set(calc.fields.map(field => field.name)).size, calc.slug).toBe(calc.fields.length);
      for (const related of calc.relatedSlugs ?? []) expect(known.has(related), `${calc.slug} -> ${related}`).toBe(true);
      const defaults = Object.fromEntries(calc.fields.map(field => [field.name, field.defaultValue]));
      expect(calc.compute(defaults).status, calc.slug).not.toBe("invalid");
    }
  });

  it("includes real dedicated tools with unique links for directory and header search", () => {
    const entries = getDedicatedCalculatorEntries();
    expect(new Set(entries.map(entry => entry.href)).size).toBe(entries.length);
    for (const href of ["/", "/home-loan", "/tools/date/age", "/tools/date/work-days", "/tools/math/percent", "/tools/health/bmi", "/calc/kia-bonus", "/calc/jeonse-loan"]) {
      expect(entries.some(entry => entry.href === href), href).toBe(true);
    }
  });
});
