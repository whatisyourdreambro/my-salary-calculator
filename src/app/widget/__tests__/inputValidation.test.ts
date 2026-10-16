import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
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
