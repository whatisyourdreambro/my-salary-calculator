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
        expect(html).toContain(`aria-label="${row[grade.engineRank + 1].toLocaleString("ko-KR")}원, 2026년 ${grade.label} ${row[0]}호봉 조건으로 실수령액 계산"`);
        expect(html).toContain(row[grade.engineRank + 1].toLocaleString("ko-KR"));
      }
    }
    // Table selection is private session state, not a crawlable URL/query or data attribute.
    expect(html).not.toContain("?step=");
    expect(html).not.toContain("data-grade");
    expect(html).not.toContain("data-salary");
  });

  // 2026-11-01 owner approval B11 (P3G-04): the October 23 buttons made each pay cell the global td padding (0.75rem)
  // plus a 44px button, so the five rows grew and pushed the CalcResultAd below the table down. Pay cells drop the
  // vertical padding and the button is 40px tall, the same 40px row as the step column (py-2.5), as before the buttons.
  // WCAG 2.2 SC 2.5.8 (AA) needs 24px; the width stays min-w-11 (44px).
  it.each(["fire", "police"] as const)("keeps %s pay rows at the pre-button 40px height", variant => {
    const html = renderToStaticMarkup(createElement(PoliceFireRankTable, { variant }));
    const cells = [...html.matchAll(/<td class="([^"]*)"><button\b[^>]*\bclass="([^"]*)"/g)];
    expect(cells).toHaveLength(25);
    for (const [, td, button] of cells) {
      expect(td.split(" ")).toContain("py-0");
      expect(td).not.toMatch(/(?:^|\s)p[ytb]?-(?!0(?:\s|$))/);
      expect(button.split(" ")).toEqual(expect.arrayContaining(["min-h-10", "min-w-11"]));
      expect(button).not.toMatch(/(?:^|\s)(?:min-h-(?!10(?:\s|$))|h-|py-|-?m[yt]-)/);
    }
    expect(html.split('<td class="py-2.5 px-2 font-bold text-navy">').length - 1).toBe(POLICE_RANK_ROWS_2026.length);
  });
});
