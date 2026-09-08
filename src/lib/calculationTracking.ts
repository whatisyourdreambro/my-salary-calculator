import { createCalculationMeasurement } from "./calculationMeasurement";
import { trackCalcStart, trackCalcSuccess, trackCalcResultView } from "./analytics";

/** Shared by scopes and the persistent route observer, including component remounts. */
export const calculationTracking = createCalculationMeasurement((event) => {
  if (event.name === "calc_start") trackCalcStart(event.calcType, event.pagePath);
  if (event.name === "calc_success") trackCalcSuccess(event.calcType, event.pagePath);
  if (event.name === "result_view") {
    trackCalcResultView(event.calcType, event.resultOrigin!, event.pagePath);
  }
});
