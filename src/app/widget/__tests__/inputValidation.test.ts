import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { calculateSeveranceTax } from "@/lib/severanceCalculator";
import { GET as getDsr } from "../dsr/route";
import { GET as getSeverance } from "../severance/route";
import { GET as getYearEndTax } from "../year-end-tax/route";

// Evaluate only the route's first inline calculator script in a synthetic DOM.
// No browser, network API, SDK, or real publisher document is involved.
async function calculator(get: () => Promise<Response>, values: Record<string, string>) {
  const elements = new Map<string, {
    value: string; textContent: string; innerHTML: string; className: string;
    setAttribute: () => void; removeAttribute: () => void; addEventListener: () => void;
  }>();
  const document = {
    getElementById(id: string) {
      if (!elements.has(id)) elements.set(id, {
        value: values[id] ?? "", textContent: "", innerHTML: "", className: "",
        setAttribute() {}, removeAttribute() {}, addEventListener() {},
      });
      return elements.get(id)!;
    },
  };
  const html = await (await get()).text();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeDefined();
  runInNewContext(script!, { document }, { timeout: 1000 });
  return (id: string) => document.getElementById(id);
}

describe("widget input validation", () => {
  it.each(["5.9", "1.5"])("does not silently truncate %s years in severance", async years => {
    const element = await calculator(getSeverance, { wage: "350", years });
    expect(element("net").textContent).toContain("정수");
    expect(element("detail").textContent).toBe("—");
  });

  it("does not silently truncate a fractional DSR maturity", async () => {
    const element = await calculator(getDsr, { yearly: "5000", rate: "4", years: "30.5" });
    expect(element("limit").textContent).toContain("정수");
    expect(element("monthly").textContent).toBe("—");
  });

  it("rejects negative prepaid tax instead of increasing the estimated tax due", async () => {
    const element = await calculator(getYearEndTax, { salary: "5000", prepaid: "-100" });
    expect(element("res").textContent).toBe("—");
    expect(element("resLabel").textContent).toContain("0 이상");
  });

  // audit1115 app-data-pages-b05-M01: the old 1,000만원 grid interpolated across the zero-tax kink and
  // showed 12 / 19 / 13만원 for these short tenures (verifier final_fix pairs, wage 만원, years, tax 만원).
  it.each([
    [250, 1, 2],
    [400, 1, 6],
    [300, 2, 7],
    [350, 5, 24],
  ])("shows the exact severance tax for %i만원 x %i years (%i만원)", async (wage, years, taxMan) => {
    const severance = await calculator(getSeverance, { wage: String(wage), years: String(years) });
    expect(severance("detail").innerHTML).toContain(`/ ${taxMan}<small>만원</small>`);
  });

  // Same 만원 display as the canonical engine (calculateSeveranceTax) for short and long tenures,
  // both sides of every kink family, the NTS worked example (1억원, 20년 → 산출세액 112만원 + 지방소득세)
  // and the 10억원 table end.
  it.each([
    [150, 1], [250, 1], [400, 1], [460, 1], [300, 2], [250, 3], [350, 5], [200, 10],
    [600, 15], [500, 20], [800, 25], [1000, 30], [3000, 30], [2500, 40],
  ])("matches the canonical engine for %i만원 x %i years", async (wage, years) => {
    const gross = wage * 10000 * years;
    const t = calculateSeveranceTax(gross, years * 365);
    const tax = t.incomeTax + t.localTax;
    const man = (won: number) => Math.round(won / 10000).toLocaleString("ko-KR");
    const severance = await calculator(getSeverance, { wage: String(wage), years: String(years) });
    expect(severance("detail").innerHTML).toBe(`${man(gross)}<small>만원</small> / ${man(tax)}<small>만원</small>`);
    expect(severance("net").innerHTML).toBe(`${man(gross - tax)}<small>만원</small>`);
  });

  it("keeps the severance breakpoint table within a few won of the engine everywhere", async () => {
    const html = await (await getSeverance()).text();
    const TAX: number[][] = JSON.parse(html.match(/var TAX = (\[.*?\]);\n/s)![1]);
    expect(TAX).toHaveLength(40);
    // the old uniform grid made the document 43.8KB; the breakpoint table keeps it small
    expect(html.length).toBeLessThan(30_000);
    // same lookup as the inline taxOf()
    const taxOf = (pay: number, y: number) => {
      const r = TAX[y - 1];
      if (pay >= r[r.length - 2]) return r[r.length - 1];
      for (let i = 2; i < r.length; i += 2) {
        if (pay <= r[i]) return r[i - 1] + ((r[i + 1] - r[i - 1]) * (pay - r[i - 2])) / (r[i] - r[i - 2]);
      }
      return r[r.length - 1];
    };
    let maxErr = 0;
    for (let y = 1; y <= 40; y++) {
      for (let wageMan = 100; wageMan <= 3000; wageMan += 7) {
        const gross = wageMan * 10000 * y;
        if (gross > 1_000_000_000) break;
        const t = calculateSeveranceTax(gross, y * 365);
        maxErr = Math.max(maxErr, Math.abs(taxOf(gross, y) - (t.incomeTax + t.localTax)));
      }
    }
    expect(maxErr).toBeLessThan(5);
  });

  it("keeps the valid whole-year and zero-prepaid cases usable", async () => {
    const severance = await calculator(getSeverance, { wage: "350", years: "5" });
    expect(severance("net").innerHTML).toMatch(/\d/);
    const dsr = await calculator(getDsr, { yearly: "5000", rate: "0", years: "30" });
    expect(dsr("limit").innerHTML).toContain("6.00");
    const tax = await calculator(getYearEndTax, { salary: "5000", prepaid: "0" });
    expect(tax("res").innerHTML).toMatch(/\d/);
    expect(tax("resLabel").textContent).toBe("예상 추가 납부");
  });
});
