import { calculateNetSalary } from "./calculator";
import { calculateSalary2026 } from "./TaxLogic";
import { calculatePartTimeSalary } from "./freelancerCalculator";

const MAX_TOKEN_LENGTH = 2048;
const MAX_ANNUAL = 1_000_000_000_000;
type RegularValues = { annualSalary: number; nonTaxableAmount: number; dependents: number; children: number };
export type SalarySharePayload = RegularValues | (RegularValues & { v: 1; taxYear: 2026; incomeType: "regular" }) |
  { v: 1; taxYear: 2026; incomeType: "freelancer" | "part_time"; monthlyIncome: number };

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const number = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
const keysAre = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

/** Legacy links keep their original model. New links declare the home calculation model. */
export function validateSalarySharePayload(value: unknown): SalarySharePayload | null {
  if (!object(value)) return null;
  const versioned = Object.hasOwn(value, "v");
  if (versioned && (value.v !== 1 || value.taxYear !== 2026)) return null;
  if (versioned && (value.incomeType === "freelancer" || value.incomeType === "part_time")) {
    return keysAre(value, ["v", "taxYear", "incomeType", "monthlyIncome"]) && number(value.monthlyIncome, Number.MIN_VALUE, MAX_ANNUAL / 12)
      ? value as SalarySharePayload : null;
  }
  if (versioned && value.incomeType !== "regular") return null;
  if (!keysAre(value, ["annualSalary", "nonTaxableAmount", "dependents", "children", ...(versioned ? ["v", "taxYear", "incomeType"] : [])])) return null;
  if (!number(value.annualSalary, Number.MIN_VALUE, MAX_ANNUAL) || !number(value.nonTaxableAmount, 0, MAX_ANNUAL) ||
    !number(value.dependents, 1, 20) || !Number.isInteger(value.dependents) ||
    !number(value.children, 0, 10) || !Number.isInteger(value.children)) return null;
  // Old generated links could contain independently selected family/tax-free values.
  // Preserve those finite legacy inputs; enforce valid relationships for new links.
  if (versioned && (value.children > value.dependents - 1 || value.nonTaxableAmount > value.annualSalary / 12)) return null;
  return value as SalarySharePayload;
}

export function encodeSalarySharePayload(value: unknown): string | null {
  const validated = validateSalarySharePayload(value);
  if (!validated) return null;
  return btoa(JSON.stringify(validated)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSalarySharePayload(token: string): SalarySharePayload | null {
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return null;
  try {
    const decoded = decodeURIComponent(token);
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(decoded)) return null;
    const json = atob(decoded.replace(/-/g, "+").replace(/_/g, "/"));
    return validateSalarySharePayload(JSON.parse(json));
  } catch { return null; }
}

export function calculateSharedSalary(payload: SalarySharePayload) {
  let annualSalary: number;
  let monthlyNet: number;
  let modelLabel: string;
  let regular: boolean;
  if ("v" in payload && payload.incomeType !== "regular") {
    annualSalary = payload.monthlyIncome * 12;
    monthlyNet = calculatePartTimeSalary(payload.monthlyIncome, payload.incomeType).netPay;
    regular = false;
    modelLabel = payload.incomeType === "freelancer" ? "월 사업소득 3.3% 원천징수 추정 · 최종 종합소득세와 다름" : "월 아르바이트 소득 · 4대보험 적용, 본인 1명 기준 추정";
  } else {
    annualSalary = payload.annualSalary;
    regular = true;
    monthlyNet = "v" in payload
      ? calculateSalary2026(annualSalary, payload.nonTaxableAmount, payload.dependents, payload.children).netPay
      : calculateNetSalary(annualSalary, payload.nonTaxableAmount * 12, payload.dependents, payload.children,
        { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 }).monthlyNet;
    modelLabel = "v" in payload ? "2026년 홈 계산 모델 · 연간 세액 추정을 12개월로 나눈 금액" : "기존 공유 링크의 연간 세액 추정 모델 · 현재 홈과 원 단위 처리 차이가 날 수 있음";
  }
  if (!Number.isFinite(monthlyNet) || monthlyNet <= 0) return null;
  return { annualSalary, monthlyNet, modelLabel, regular };
}

export function decodeSharedSalary(token: string) {
  const payload = decodeSalarySharePayload(token);
  if (!payload) return null;
  const result = calculateSharedSalary(payload);
  return result ? { payload, ...result } : null;
}
