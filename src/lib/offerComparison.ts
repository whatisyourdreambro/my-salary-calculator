import { calculateSalary2026 } from "@/lib/TaxLogic";

export type OfferInput = { id: number; companyName: string; salary: string; bonus: string; overtime: string };
export type OfferSettings = { nonTaxableAmount: string; dependents: number; children: number };
export type OfferResult = {
  id: number; companyName: string; salary: number; bonus: number; overtime: number;
  totalAnnual: number; monthlyNet: number; annualNet: number; annualDeduction: number;
  annualInsurance: number; annualTax: number; roundingAdjustment: number;
};
export type OfferComparison = {
  results: OfferResult[]; baselineId: number;
  settings: { monthlyNonTaxable: number; dependents: number; children: number };
};

const MAX_AMOUNT = 1_000_000_000_000;
function parseAmount(value: string, optional = false): number | null {
  const normalized = value.trim().replace(/,/g, "");
  if (!normalized) return optional ? 0 : null;
  if (!/^\d+$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isSafeInteger(amount) && amount <= MAX_AMOUNT ? amount : null;
}

export function compareOffers(offers: OfferInput[], settings: OfferSettings):
  { ok: true; comparison: OfferComparison } | { ok: false; error: string } {
  if (offers.length < 2 || offers.length > 10) return { ok: false, error: "비교할 오퍼는 2개 이상, 10개 이하로 입력해 주세요." };
  const monthlyNonTaxable = parseAmount(settings.nonTaxableAmount, true);
  if (monthlyNonTaxable === null || !Number.isSafeInteger(settings.dependents) || settings.dependents < 1 || settings.dependents > 20
    || !Number.isSafeInteger(settings.children) || settings.children < 0 || settings.children > 10 || settings.children > settings.dependents - 1) {
    return { ok: false, error: "공통 조건을 확인해 주세요. 가족 수는 1~20명, 공제 대상 자녀는 0~10명이며 본인을 제외한 가족 수를 넘을 수 없습니다." };
  }
  const results: OfferResult[] = [];
  for (const [index, offer] of offers.entries()) {
    const salary = parseAmount(offer.salary);
    const bonus = parseAmount(offer.bonus, true);
    const overtime = parseAmount(offer.overtime, true);
    if (salary === null || salary <= 0 || bonus === null || overtime === null || salary + bonus + overtime > MAX_AMOUNT) {
      return { ok: false, error: `${index + 1}번째 오퍼의 계약 연봉을 0원보다 크게 입력해 주세요. 금액은 0원 이상 정수이며 연간 합계는 1조원 이하여야 합니다.` };
    }
    const totalAnnual = salary + bonus + overtime;
    if (monthlyNonTaxable * 12 > totalAnnual) {
      return { ok: false, error: `${index + 1}번째 오퍼의 연간 총액보다 연간 비과세액이 큽니다. 비과세액은 입력한 총액에 포함된 금액으로 입력해 주세요.` };
    }
    // Same monthly non-taxable input and rounding model as the regular-salary home result.
    const net = calculateSalary2026(totalAnnual, monthlyNonTaxable, settings.dependents, settings.children);
    const annualNet = net.netPay * 12;
    const annualDeduction = totalAnnual - annualNet;
    const annualInsurance = (net.nationalPension + net.healthInsurance + net.longTermCare + net.employmentInsurance) * 12;
    const annualTax = (net.incomeTax + net.localIncomeTax) * 12;
    if (![net.netPay, annualDeduction, annualInsurance, annualTax].every(Number.isFinite)) {
      return { ok: false, error: "계산할 수 없는 값이 있습니다. 입력 금액과 공통 조건을 확인해 주세요." };
    }
    results.push({ id: offer.id, companyName: offer.companyName.trim() || `오퍼 ${index + 1}`,
      salary, bonus, overtime, totalAnnual, monthlyNet: net.netPay, annualNet, annualDeduction,
      annualInsurance, annualTax, roundingAdjustment: annualDeduction - annualInsurance - annualTax });
  }
  return { ok: true, comparison: { results: results.sort((a, b) => b.monthlyNet - a.monthlyNet),
    baselineId: offers[0].id, settings: { monthlyNonTaxable, dependents: settings.dependents, children: settings.children } } };
}

export function explainOfferDifference(offer: OfferResult, baseline: OfferResult) {
  return {
    gross: offer.totalAnnual - baseline.totalAnnual,
    salary: offer.salary - baseline.salary, bonus: offer.bonus - baseline.bonus, overtime: offer.overtime - baseline.overtime,
    insurance: offer.annualInsurance - baseline.annualInsurance, tax: offer.annualTax - baseline.annualTax,
    rounding: offer.roundingAdjustment - baseline.roundingAdjustment, deductions: offer.annualDeduction - baseline.annualDeduction,
    net: offer.annualNet - baseline.annualNet, monthlyNet: offer.monthlyNet - baseline.monthlyNet,
  };
}

export type OfferComparisonState = {
  offers: OfferInput[]; settings: OfferSettings; comparison: OfferComparison | null; stale: boolean; error: string | null;
};
export const initialOfferComparisonState: OfferComparisonState = {
  offers: [{ id: 1, companyName: "A 회사", salary: "", bonus: "", overtime: "" },
    { id: 2, companyName: "B 회사", salary: "", bonus: "", overtime: "" }],
  settings: { nonTaxableAmount: "200000", dependents: 1, children: 0 }, comparison: null, stale: false, error: null,
};
export type OfferComparisonAction =
  | { type: "offer"; id: number; field: keyof Omit<OfferInput, "id">; value: string }
  | { type: "prefill"; annualGross: number; nonTaxableMonthly: number; dependents: number; children: number }
  | { type: "settings"; value: OfferSettings } | { type: "add" } | { type: "remove"; id: number } | { type: "compare" };

export function offerComparisonReducer(state: OfferComparisonState, action: OfferComparisonAction): OfferComparisonState {
  if (action.type === "compare") {
    const outcome = compareOffers(state.offers, state.settings);
    return outcome.ok ? { ...state, comparison: outcome.comparison, stale: false, error: null }
      : { ...state, comparison: null, error: outcome.error };
  }
  const edited = { ...state, comparison: null, stale: state.stale || state.comparison !== null, error: null };
  if (action.type === "prefill") {
    return { ...edited, offers: state.offers.map((offer, index) => index === 0
      ? { ...offer, salary: action.annualGross.toLocaleString("ko-KR"), bonus: "", overtime: "" } : offer),
      settings: { nonTaxableAmount: action.nonTaxableMonthly.toLocaleString("ko-KR"), dependents: action.dependents, children: action.children } };
  }
  if (action.type === "offer") {
    if (!state.offers.some(offer => offer.id === action.id && offer[action.field] !== action.value)) return state;
    return { ...edited, offers: state.offers.map(offer => offer.id === action.id ? { ...offer, [action.field]: action.value } : offer) };
  }
  if (action.type === "settings") {
    if (Object.keys(action.value).every(key => action.value[key as keyof OfferSettings] === state.settings[key as keyof OfferSettings])) return state;
    return { ...edited, settings: action.value };
  }
  if (action.type === "add") {
    if (state.offers.length >= 10) return state;
    const id = Math.max(...state.offers.map(offer => offer.id)) + 1;
    return { ...edited, offers: [...state.offers, { id, companyName: `오퍼 ${id}`, salary: "", bonus: "", overtime: "" }] };
  }
  if (state.offers.length <= 2 || !state.offers.some(offer => offer.id === action.id)) return state;
  return { ...edited, offers: state.offers.filter(offer => offer.id !== action.id) };
}
