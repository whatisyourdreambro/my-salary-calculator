import { describe, expect, it } from "vitest";
import { allCalculators } from "@/lib/simpleCalculators";
import type { CalculatorDef } from "@/lib/simpleCalculators/types";
import { decodeSimpleCalculatorInputs, encodeSimpleCalculatorInputs, validateSimpleCalculatorInputs } from "@/lib/simpleCalculatorShare";
const calc: CalculatorDef = { slug: "test", title: "Test", description: "", keywords: [], category: "salary", categoryLabel: "",
  fields: [{ name: "amount", label: "amount", defaultValue: 10, min: 0, max: 100 }, { name: "change", label: "change", defaultValue: 0, min: -10, max: 10 }],
  compute: (values) => ({ primary: { label: "result", value: values.amount + values.change } }) };
const token = (data: unknown) => btoa(JSON.stringify(data));
describe("simple calculator shared inputs", () => {
  it("preserves complete numeric old links and negative/decimal values permitted by a field", () => {
    const values = { amount: 12.5, change: -2.5 };
    expect(decodeSimpleCalculatorInputs(token(values), calc)).toEqual(values);
    expect(decodeSimpleCalculatorInputs(encodeSimpleCalculatorInputs(values, calc)!, calc)).toEqual(values);
  });
  it.each([null, [], { amount: 10 }, { amount: null, change: 0 }, { amount: "10", change: 0 },
    { amount: true, change: 0 }, { amount: 101, change: 0 }, { amount: 10, change: -11 },
    { amount: 10, change: 0, other: 20 }])("rejects incomplete/coerced/out-of-range input as a whole", (value) => {
    expect(decodeSimpleCalculatorInputs(token(value), calc)).toBeNull();
  });
  it("rejects oversized/nonfinite/noncomputable data and does not send it to capture", () => {
    expect(decodeSimpleCalculatorInputs("A".repeat(8193), calc)).toBeNull();
    expect(validateSimpleCalculatorInputs({ amount: Infinity, change: 0 }, calc)).toBeNull();
    expect(validateSimpleCalculatorInputs({ amount: 0, change: 0 }, { ...calc, compute: () => ({ primary: { label: "result", value: NaN } }) })).toBeNull();
    expect(validateSimpleCalculatorInputs({ amount: 0, change: 0 }, { ...calc, compute: () => { throw Error("input error"); } })).toBeNull();
  });
  it.each(allCalculators.map(calculator => [calculator.slug, calculator] as const))("keeps valid default numeric links reproducible for %s", (_, calculator) => {
    const values = Object.fromEntries(calculator.fields.map(field => [field.name, field.defaultValue]));
    expect(decodeSimpleCalculatorInputs(token(values), calculator)).toEqual(values);
  });
});
