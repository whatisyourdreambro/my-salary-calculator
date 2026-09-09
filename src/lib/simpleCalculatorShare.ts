import type { CalculatorDef } from "./simpleCalculators/types";

/** Existing complete numeric ?v= links remain valid; never coerce or partially restore. */
export function validateSimpleCalculatorInputs(value: unknown, calc: CalculatorDef): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (entries.length !== calc.fields.length) return null;
  const result: Record<string, number> = {};
  for (const field of calc.fields) {
    if (!Object.hasOwn(value, field.name)) return null;
    const n = (value as Record<string, unknown>)[field.name];
    if (typeof n !== "number" || !Number.isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER ||
      n < (field.min ?? -Infinity) || n > (field.max ?? Infinity)) return null;
    result[field.name] = n;
  }
  try {
    const computed = calc.compute(result);
    if (!Number.isFinite(computed.primary.value) || !(computed.secondary ?? []).every((item) => Number.isFinite(item.value))) return null;
  } catch { return null; }
  return result;
}

export function decodeSimpleCalculatorInputs(token: string, calc: CalculatorDef) {
  if (!token || token.length > 8192) return null;
  try {
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(token)) return null;
    return validateSimpleCalculatorInputs(JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/"))), calc);
  } catch { return null; }
}

export function encodeSimpleCalculatorInputs(inputs: unknown, calc: CalculatorDef) {
  const valid = validateSimpleCalculatorInputs(inputs, calc);
  if (!valid) return null;
  const token = btoa(JSON.stringify(valid)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return token.length <= 8192 ? token : null;
}
