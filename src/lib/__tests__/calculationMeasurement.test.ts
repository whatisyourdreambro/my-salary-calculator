import { describe, expect, it } from "vitest";
import { createCalculationMeasurement, isValidCalculationNumber, isValidCalculationEdit, type CalculationEvent } from "../calculationMeasurement";

function setup(path = "/") {
  const events: CalculationEvent[] = [];
  const tracker = createCalculationMeasurement((event) => events.push(event));
  tracker.visit(path);
  return { tracker, events };
}
const shown = { valid: true, visible: true, userResult: true };

describe("calculation funnel v2 behavior", () => {
  it("a visible default/shared result is a view, never a start or successful calculation", () => {
    const { tracker, events } = setup("/calc/samsung-bonus");
    tracker.result("/calc/samsung-bonus", "samsung-bonus-personal", { ...shown, userResult: false });
    tracker.result("/calc/samsung-bonus", "samsung-bonus-personal", shown);
    expect(events).toEqual([{ name: "result_view", pagePath: "/calc/samsung-bonus", calcType: "samsung-bonus-personal", resultOrigin: "default" }]);
  });

  it("requires real interaction, a valid current result AND visibility", () => {
    const { tracker, events } = setup();
    tracker.interact("/", "salary", false);
    tracker.result("/", "salary", { ...shown, visible: false });
    expect(events).toEqual([]);
    tracker.interact("/", "salary", true);
    tracker.result("/", "salary", { ...shown, valid: false }); // empty/invalid/stale inputs
    tracker.result("/", "salary", { ...shown, visible: false }); // result below fold/overlay
    expect(events.map((event) => event.name)).toEqual(["calc_start"]);
    expect(tracker.result("/", "salary", shown)).toBe(true);
    expect(events.map((event) => event.name)).toEqual(["calc_start", "result_view", "calc_success"]);
    expect(events[1].resultOrigin).toBe("user");
  });

  it("typing, Strict Mode effect replays, rerenders and recalculation cannot inflate the funnel", () => {
    const { tracker, events } = setup();
    for (let i = 0; i < 10; i++) {
      tracker.visit("/");
      tracker.interact("/", "salary", true);
      tracker.result("/", "salary", shown);
    }
    expect(events.map((event) => event.name)).toEqual(["calc_start", "result_view", "calc_success"]);
  });

  it("a default view followed by an actual calculation records success without a second view", () => {
    const { tracker, events } = setup("/calc/vat");
    tracker.result("/calc/vat", "vat", { ...shown, userResult: false });
    tracker.interact("/calc/vat", "vat", true);
    tracker.result("/calc/vat", "vat", shown);
    expect(events.map((event) => event.name)).toEqual(["result_view", "calc_start", "calc_success"]);
    expect(events[0].resultOrigin).toBe("default");
  });

  it("keeps Samsung pool and personal calculators separate on the same page", () => {
    const { tracker, events } = setup("/calc/samsung-bonus");
    tracker.interact("/calc/samsung-bonus", "samsung-bonus-pool", true);
    tracker.result("/calc/samsung-bonus", "samsung-bonus-pool", shown);
    tracker.result("/calc/samsung-bonus", "samsung-bonus-personal", { ...shown, userResult: false });
    expect(events.filter((event) => event.name === "calc_success").map((event) => event.calcType)).toEqual(["samsung-bonus-pool"]);
  });

  it("starts a fresh A -> non-calculator B -> A visit and ignores old-route callbacks", () => {
    const { tracker, events } = setup();
    tracker.interact("/", "salary", true);
    tracker.result("/", "salary", shown);
    tracker.visit("/guides");
    tracker.result("/", "salary", shown);
    tracker.interact("/", "salary", true);
    expect(events).toHaveLength(3);
    tracker.visit("/");
    tracker.result("/", "salary", { ...shown, userResult: false });
    expect(events.filter((event) => event.name === "calc_success")).toHaveLength(1);
    tracker.interact("/", "salary", true);
    tracker.result("/", "salary", shown);
    expect(events.filter((event) => event.name === "calc_success")).toHaveLength(2);
  });

  it("stores only event identity and never user input or monetary values", () => {
    const { tracker, events } = setup();
    tracker.interact("/", "salary", true);
    tracker.result("/", "salary", shown);
    expect(events.every((event) => Object.keys(event).every((key) => ["name", "pagePath", "calcType", "resultOrigin"].includes(key)))).toBe(true);
  });
});

describe("calculator input validity", () => {
  it.each(["", " ", ",", "-", ".", "-.", "NaN", "Infinity", Infinity, NaN])("does not turn %j into successful input", (input) => {
    expect(isValidCalculationNumber(input)).toBe(false);
  });
  it("keeps zero valid when allowed, and applies each calculator's bounds", () => {
    expect(isValidCalculationNumber("0", 0)).toBe(true);
    expect(isValidCalculationNumber("0", Number.MIN_VALUE)).toBe(false);
    expect(isValidCalculationNumber("50,000,000", 1)).toBe(true);
    expect(isValidCalculationNumber("3.5", 0, 100)).toBe(true);
    expect(isValidCalculationNumber("101", 0, 100)).toBe(false);
    expect(isValidCalculationNumber("-1", 0)).toBe(false);
  });

  it.each(["350a", "30000a", "1.2.3", "1e3", "-350", "", "."])("rejected raw edit %j cannot turn the retained default into success", (input) => {
    const { tracker, events } = setup("/calc/samsung-bonus");
    tracker.interact("/calc/samsung-bonus", "samsung-bonus-pool", true);
    tracker.result("/calc/samsung-bonus", "samsung-bonus-pool", {
      ...shown, userResult: isValidCalculationEdit(input),
    });
    expect(events.some((event) => event.name === "calc_start")).toBe(true);
    expect(events.some((event) => event.name === "calc_success")).toBe(false);
  });
  it("accepts permitted numeric edits without treating formatted or decimal input as invalid", () => {
    expect(isValidCalculationEdit("80,000,000", false, false)).toBe(true);
    expect(isValidCalculationEdit("3.5")).toBe(true);
    expect(isValidCalculationEdit("3.5", false, false)).toBe(false);
    expect(isValidCalculationEdit("-3.5", true)).toBe(true);
  });
});
