import { expect, it } from "vitest";
import { sanitizeAnalyticsParams } from "../analyticsPrivacy";

it("civil handoff emits only fixed states even if a caller passes personal data", () => {
  expect(sanitizeAnalyticsParams("civil_pay_handoff", {
    stage: "selected", source_group: "fire", flow_version: "personal", reason: "missing",
    grade: "test", step: 1, salary: 9999, body: "private", email: "private@example.com", inputs: {}, pensionContributionStatus: "completed",
  })).toEqual({ flow_version: "1", stage: "selected", source_group: "fire" });
  expect(sanitizeAnalyticsParams("civil_pay_handoff", {
    stage: "rejected", source_group: "private", reason: "expired", identifier: "unique",
  })).toEqual({ flow_version: "1", stage: "rejected", reason: "expired" });
});

it.each(["calc_start", "calc_success", "result_view", "calc_submit"])("%s never sends pension status or tenure", (name) => {
  expect(sanitizeAnalyticsParams(name, {
    calc_type: "civil_servant_net_pay", pensionContributionStatus: "completed", yearsOfService: 37,
  })).toEqual({ calc_type: "civil_servant_net_pay" });
});

it("saved result journey cannot leak amounts or identifiers", () => {
  expect(sanitizeAnalyticsParams("saved_salary_recalculate", {
    action: "apply", body: "private", salary: 9999, savedAt: "2026-01-01", basisVersion: "private", id: "opaque",
  })).toEqual({ flow_version: "1", action: "apply" });
  expect(sanitizeAnalyticsParams("saved_salary_recalculate", { action: "private" })).toEqual({ flow_version: "1" });
});
