import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PoliceFireRankTable from "@/components/PoliceFireRankTable";
import { CIVIL_PAY_GRADES } from "@/lib/civilPayHandoff";
import { POLICE_RANK_ROWS_2026 } from "@/lib/civilServantPay";

vi.mock("next/navigation", () => ({ usePathname: () => "/firefighter-pay-2026", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/civilPayHandoffTracking", () => ({ trackCivilPayHandoff: vi.fn() }));

describe("readable and keyboard-operable source pay tables", () => {
  it.each(["fire", "police"] as const)("renders every %s pay cell before JavaScript with an explicit accessible action", variant => {
    const html = renderToStaticMarkup(createElement(PoliceFireRankTable, { variant }));
    expect((html.match(/<button /g) ?? []).length).toBe(25);
    expect((html.match(/type="button"/g) ?? []).length).toBe(25);
    for (const grade of CIVIL_PAY_GRADES[variant]) {
      for (const row of POLICE_RANK_ROWS_2026) {
        expect(html).toContain(`aria-label="2026년 ${grade.label} ${row[0]}호봉 조건으로 실수령액 계산"`);
        expect(html).toContain(row[grade.engineRank + 1].toLocaleString("ko-KR"));
      }
    }
    // Table selection is private session state, not a crawlable URL/query or data attribute.
    expect(html).not.toContain("?step=");
    expect(html).not.toContain("data-grade");
    expect(html).not.toContain("data-salary");
  });
});
