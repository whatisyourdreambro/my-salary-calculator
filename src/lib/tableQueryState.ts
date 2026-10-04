/** Normalize query text without converting salary digits to floating point. */
export function normalizeTableSearch(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  if (!text || !/^[0-9,]+$/.test(text)) return "";
  return text.replace(/,/g, "").replace(/^0+(?=\d)/, "");
}

export function formatTableSearch(value: string): string {
  const digits = normalizeTableSearch(value);
  if (!digits) return "";
  const groups = [digits.slice(0, digits.length % 3 || 3)];
  for (let index = groups[0].length; index < digits.length; index += 3) {
    groups.push(digits.slice(index, index + 3));
  }
  return groups.join(",");
}

export function safeTablePageCount(totalPages: number): number {
  return Math.max(1, Number.isFinite(totalPages) ? Math.floor(totalPages) : 1);
}

export function clampTablePage(rawPage: string | null, totalPages: number): number {
  const page = Number(rawPage ?? "1");
  return Number.isFinite(page) && page >= 1
    ? Math.min(safeTablePageCount(totalPages), Math.floor(page))
    : 1;
}
