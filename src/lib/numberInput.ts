/** Number-field text helpers. Never round a user's integer or fractional digits. */
export interface NumberDraftOptions {
  allowDecimal?: boolean;
  allowNegative?: boolean;
}

export function normalizeNumberDraft(text: string, { allowDecimal = true, allowNegative = true }: NumberDraftOptions = {}): string | null {
  const raw = text.normalize("NFKC").replace(/\u2212/g, "-").replace(/[,\s]/g, "");
  if (!/^-?\d*\.?\d*$/.test(raw) || (!allowDecimal && raw.includes(".")) || (!allowNegative && raw.startsWith("-"))) return null;
  return raw.replace(/^(-?)0+(?=\d)/, "$1");
}

/** Expand JS scientific notation without locale rounding (e.g. 1e21). */
export function expandNumberExponent(value: string): string {
  const match = value.match(/^(-?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/);
  if (!match) return value;
  const [, sign, integer, fraction = "", exponentText] = match;
  const exponent = Number(exponentText);
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 400) return "";
  const digits = integer + fraction;
  const position = integer.length + exponent;
  if (position <= 0) return `${sign}0.${"0".repeat(-position)}${digits}`;
  if (position >= digits.length) return sign + digits + "0".repeat(position - digits.length);
  return `${sign}${digits.slice(0, position)}.${digits.slice(position)}`;
}

export function numberInputDraft(value: string | number | readonly string[] | undefined): string {
  if (value === undefined || (typeof value === "number" && !Number.isFinite(value))) return "";
  return normalizeNumberDraft(expandNumberExponent(String(value))) ?? "";
}

export function formatNumberDraft(raw: string): string {
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [integer, fraction] = unsigned.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped}${fraction !== undefined ? `.${fraction}` : ""}`;
}

/** Like a native number field, incomplete signs/dots have an empty numeric value. */
export function numberDraftValue(raw: string): string {
  return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) && Number.isFinite(Number(raw)) ? raw : "";
}

/** Match controlled numeric state while retaining an in-progress '.', '-' or clear. */
export function equivalentNumberDraft(external: string, emitted: string): boolean {
  if (external === emitted) return true;
  const left = numberDraftValue(external);
  const right = numberDraftValue(emitted);
  return Number(left) === Number(right);
}

export function numberCaretPosition(before: string, position: number, after: string): number {
  const units = before.slice(0, position).replace(/[,\s]/g, "").length;
  if (units === 0) return 0;
  let seen = 0;
  for (let index = 0; index < after.length; index++) {
    if (after[index] !== ",") seen++;
    if (seen >= units) return index + 1;
  }
  return after.length;
}

/** Backspace/Delete adjacent to a grouping comma removes a digit, not a comma that reappears. */
export function deleteNumberAtSeparator(display: string, caret: number, direction: "backward" | "forward"): { text: string; caret: number } | null {
  if (direction === "backward" && caret > 1 && display[caret - 1] === ",") {
    return { text: display.slice(0, caret - 2) + display.slice(caret), caret: caret - 2 };
  }
  if (direction === "forward" && display[caret] === "," && caret + 1 < display.length) {
    return { text: display.slice(0, caret) + display.slice(caret + 2), caret };
  }
  return null;
}
