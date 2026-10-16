import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { entryBasedSchedule, fiscalYearSchedule, statutoryLeaveDays } from "../annualLeave";

const compiled = ts.transpileModule(readFileSync("src/lib/annualLeave.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

describe("annual leave date boundaries", () => {
  it.each(["", "not-a-date", "2026-02-30", "2026-13-01", "0000-01-01"])("rejects %s in a bounded VM (a regression cannot hang the test process)", (bad) => {
    const script = `${compiled}\nJSON.stringify([exports.entryBasedSchedule(bad, '2026-12-31'), exports.entryBasedSchedule('2020-01-01', bad), exports.fiscalYearSchedule(bad, '2026-12-31'), exports.fiscalYearSchedule('2020-01-01', bad)]);`;
    expect(vm.runInNewContext(script, { exports: {}, bad }, { timeout: 1000 })).toBe("[[],[],[],[]]");
  });
  it("preserves normal month/year grants and leap-day handling", () => {
    const normal = entryBasedSchedule("2023-03-02", "2024-03-02");
    expect(normal).toHaveLength(12); expect(normal.at(-1)).toMatchObject({ grantDate: "2024-03-02", days: 15 });
    expect(entryBasedSchedule("2024-02-29", "2025-02-28").at(-1)).toMatchObject({ grantDate: "2025-02-28", days: 15 });
    expect(fiscalYearSchedule("2023-03-02", "2026-01-01").at(-1)).toMatchObject({ grantDate: "2026-01-01", days: 15 });
    expect(statutoryLeaveDays(NaN)).toBe(0);
  });
});
