/** Small Pages/React bridge. No Next runtime, DOM, network, storage or analytics. */
import { decodeSharedSalary, encodeSalarySharePayload } from "./salarySharePayload";
import { salaryReportHrefOrNearest } from "./salaryRedirect";

export const PAGES_SHARE_BOOTSTRAP_ID = "msy-pages-share-bootstrap";
export const PAGES_SHARE_RESULT_SELECTOR = "[data-pages-share-result]";
const SITE_URL = "https://www.moneysalary.com";
// Keep the default decimal precision of Number#toLocaleString, including legacy inputs.
const numberFormatter = new Intl.NumberFormat("ko-KR");
type Decoded = NonNullable<ReturnType<typeof decodeSharedSalary>>;

type ShareMeta = {
  metadataTitle: string;
  openGraphTitle: string;
  metadataDescription: string;
  imageUrl: string;
  canonicalUrl: string | null;
  robots: "noindex, nofollow";
};
export type PagesShareModel = ShareMeta & (
  { valid: false; token: null; decoded: null; shareTitle: null; previewDescription: null } |
  { valid: true; token: string; decoded: Decoded; shareTitle: string; previewDescription: string }
);

export function getPagesShareModel(token: unknown): PagesShareModel {
  const decoded = typeof token === "string" ? decodeSharedSalary(token) : null;
  if (!decoded) return {
    valid: false, token: null, decoded: null, shareTitle: null, previewDescription: null,
    metadataTitle: "공유된 연봉 결과 | 머니샐러리",
    openGraphTitle: "공유된 연봉 결과",
    metadataDescription: "공유된 연봉 계산 결과 페이지",
    canonicalUrl: null, imageUrl: `${SITE_URL}/og-default.png`, robots: "noindex, nofollow",
  };
  const canonicalToken = encodeSalarySharePayload(decoded.payload)!;
  return {
    valid: true, token: canonicalToken, decoded,
    metadataTitle: "공유된 연봉 결과 | 머니샐러리",
    openGraphTitle: "공유된 연봉 결과",
    metadataDescription: "공유된 연봉 계산 결과 페이지",
    canonicalUrl: `${SITE_URL}/`,
    imageUrl: `${SITE_URL}/og-default.png`,
    robots: "noindex, nofollow",
    shareTitle: `${decoded.regular ? "연봉" : "연 환산 소득"} ${numberFormatter.format(decoded.annualSalary)}원 · 월 수령 추정 ${numberFormatter.format(decoded.monthlyNet)}원`,
    previewDescription: "아래 문구에 표시된 원래 공유자의 소득과 수령 추정액을 공개해도 되는지 확인해 주세요. 새 링크와 링크 미리보기 이미지에는 원래 입력을 넣지 않으며, 받은 사람이 입력 조건을 복원할 수 없습니다.",
  };
}

export function pagesShareTokenFromPath(pathname: string): string | null {
  const match = /^\/share\/([^/]+)\/?$/.exec(pathname);
  if (!match || match[1].length > 2048) return null;
  // Match Next's decoded route parameter and the Pages document transformer.
  // The payload decoder then handles the encoding in legacy share links.
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

/** Only the token crosses the boundary; never trust precomputed money from JSON. */
export function serializePagesShareBootstrap(model: PagesShareModel): string {
  return JSON.stringify({ v: 1, token: model.valid ? model.token : null })
    .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/** Bind the bootstrap to this document's URL, including supported legacy encodings. */
export function readPagesShareBootstrap(text: string | null, pathname: string): PagesShareModel {
  const invalid = () => getPagesShareModel(null);
  if (!text || text.length > 4096) return invalid();
  try {
    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) return invalid();
    const entry = data as Record<string, unknown>;
    if (entry.v !== 1 || Object.keys(entry).length !== 2 || !Object.hasOwn(entry, "token")) return invalid();
    const fromPath = getPagesShareModel(pagesShareTokenFromPath(pathname));
    const fromBootstrap = getPagesShareModel(entry.token);
    return fromPath.valid && fromBootstrap.valid && fromPath.token === fromBootstrap.token
      ? fromBootstrap : invalid();
  } catch { return invalid(); }
}

const escapeHtml = (value: string | number) => String(value).replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const formatNumber = (value: number) => escapeHtml(numberFormatter.format(value));

/**
 * The same opaque card HTML is inserted by Pages and used by React's first render.
 * The reservation is replaced by the existing CalcResultAd only after hydration.
 * No ad script/iframe/image or result-sharing side effect is present in this HTML.
 */
export function renderShareResultHtml(model: PagesShareModel, { reserveAd = true }: { reserveAd?: boolean } = {}): string {
  if (!model.valid) return '<div data-pages-share-invalid="true" data-page-state="error" class="text-center p-8 bg-card rounded-2xl shadow-lg border"><h1 class="text-2xl font-bold text-destructive">잘못된 정보입니다.</h1><p class="mt-4 text-muted-foreground">공유된 데이터가 올바르지 않습니다. 다시 시도해주세요.</p><a href="/" class="inline-block mt-6 py-3 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition">홈으로 돌아가기</a></div>';
  const result = model.decoded;
  const payload = result.payload;
  const salaryReportLink = result.regular ? salaryReportHrefOrNearest(result.annualSalary) : null;
  const fields = "annualSalary" in payload
    ? `<div><dt class="inline font-semibold">월 비과세액: </dt><dd class="inline">${formatNumber(payload.nonTaxableAmount)}원</dd></div><div><dt class="inline font-semibold">부양가족 수(본인 포함): </dt><dd class="inline">${payload.dependents}명</dd></div><div><dt class="inline font-semibold">공제 대상 자녀 수: </dt><dd class="inline">${payload.children}명</dd></div>`
    : `<div><dt class="inline font-semibold">세전 월 소득: </dt><dd class="inline">${formatNumber(payload.monthlyIncome)}원</dd></div>`;
  const reportLink = result.regular
    ? `<a href="${escapeHtml(salaryReportLink ?? "/")}" class="inline-block py-4 px-8 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg">${salaryReportLink ? "연봉 상세 분석 보기" : "연봉 계산기로 다시 계산"}</a>` : "";
  const card = `<div class="bg-card p-8 rounded-2xl shadow-2xl border animate-fade-in-up"><div class="text-center"><p class="font-semibold text-muted-foreground">공유받은 소득 계산 결과</p><h2 class="text-3xl font-bold my-2">${result.regular ? "연봉" : "월 소득의 연 환산"} <span class="text-primary">${formatNumber(result.annualSalary)}원</span>의</h2><h1 class="text-5xl sm:text-6xl font-bold text-primary my-4">월 수령 추정액 <br/> ${formatNumber(Math.round(result.monthlyNet))}원</h1><p class="text-muted-foreground">${escapeHtml(result.modelLabel)}</p><p class="mt-3 text-sm text-muted-foreground">공유 링크에 포함된 입력으로 재현한 결과이며, 실제 급여명세서나 최종 확정 세액이 아닙니다.</p><dl class="mt-5 grid grid-cols-1 gap-2 rounded-xl bg-muted/40 p-4 text-left text-sm">${fields}</dl><div class="mt-8 flex flex-col sm:flex-row justify-center gap-3">${reportLink}<a href="/" class="inline-block py-4 px-8 bg-accent text-accent-foreground font-bold text-lg rounded-lg hover:bg-accent/90 transition-transform transform hover:scale-105 shadow-lg">나의 연봉도 계산해보기 →</a></div></div></div>`;
  // CalcResultAd reserves 250px + 20px label and 24px vertical margins, inside mt-8.
  const reservation = '<div data-pages-share-ad-reservation="true" aria-hidden="true" class="w-full mt-8"><div style="width:100%;margin:1.5rem 0;min-height:270px"></div></div>';
  return card + (reserveAd ? reservation : "");
}

/** React treats this entire JSON/data card boundary as opaque during hydration. */
export function renderShareIslandHtml(model: PagesShareModel, options?: { reserveAd?: boolean }): string {
  return `<script id="${PAGES_SHARE_BOOTSTRAP_ID}" type="application/json">${serializePagesShareBootstrap(model)}</script>`
    + renderShareResultHtml(model, options);
}
