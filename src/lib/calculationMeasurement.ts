/** Version 2: a page visit + calculator is a funnel, not every input keystroke. */
export const CALC_MEASUREMENT_VERSION = "2";
export type CalculationEventName = "calc_start" | "calc_success" | "result_view";
export type CalculationEvent = {
  name: CalculationEventName;
  calcType: string;
  pagePath: string;
  resultOrigin?: "default" | "user";
};

type Funnel = { started: boolean; succeeded: boolean; viewed: boolean };

/** Pure state machine; no inputs, salaries, results or user identifiers are stored. */
export function createCalculationMeasurement(send: (event: CalculationEvent) => void) {
  let path: string | null = null;
  const funnels = new Map<string, Funnel>();
  function visit(pagePath: string) {
    if (path !== pagePath) {
      path = pagePath;
      funnels.clear();
    }
  }
  function get(pagePath: string, calcType: string) {
    if (path !== pagePath) return null; // Ignore callbacks from a route that was left.
    if (!funnels.has(calcType)) {
      funnels.set(calcType, { started: false, succeeded: false, viewed: false });
    }
    return funnels.get(calcType)!;
  }
  return {
    visit,
    interact(pagePath: string, calcType: string, isTrusted: boolean) {
      if (!isTrusted) return;
      const funnel = get(pagePath, calcType);
      if (!funnel) return;
      if (!funnel.started) {
        funnel.started = true;
        send({ name: "calc_start", pagePath, calcType });
      }
    },
    result(pagePath: string, calcType: string, state: {
      valid: boolean;
      visible: boolean;
      userResult: boolean;
    }): boolean {
      const funnel = get(pagePath, calcType);
      if (!funnel) return false;
      if (!state.valid || !state.visible) return false;
      if (!funnel.viewed) {
        funnel.viewed = true;
        send({ name: "result_view", pagePath, calcType,
          resultOrigin: funnel.started && state.userResult ? "user" : "default" });
      }
      if (funnel.started && state.userResult && !funnel.succeeded) {
        funnel.succeeded = true;
        send({ name: "calc_success", pagePath, calcType });
        return true;
      }
      return false;
    },
  };
}

/** Use input presence/bounds as well as finite output: an empty field coerced to 0 is not valid. */
export function isValidCalculationNumber(value: string | number, min = -Infinity, max = Infinity) {
  if (typeof value === "string" && !value.replace(/,/g, "").trim()) return false;
  const number = typeof value === "number" ? value : Number(value.replace(/,/g, ""));
  return Number.isFinite(number) && number >= min && number <= max;
}

/** Validate the user's raw edit before a controlled input removes invalid characters. */
export function isValidCalculationEdit(value: string, allowNegative = false, allowDecimal = true) {
  const cleaned = value.replace(/,/g, "");
  const pattern = allowDecimal ? /^-?\d*\.?\d*$/ : /^-?\d+$/;
  return pattern.test(cleaned) && isValidCalculationNumber(cleaned, allowNegative ? -Infinity : 0);
}
