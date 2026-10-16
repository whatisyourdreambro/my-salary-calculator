import { mkdirSync, writeFileSync } from "node:fs";
import { EN_ALL_PAGE_PATHS } from "../src/lib/englishRoutes";
import { isShareExcludedPath } from "../src/lib/sharePolicy";
import qaSafety from "./lib/qa-safety.cjs";
const { assertLocalQaTarget, QA_USER_AGENT, fetchQaDocument } = qaSafety;

const base = assertLocalQaTarget(process.env.BASE_URL ?? "http://127.0.0.1:3100");
const origin = "https://www.moneysalary.com";
const ua = `Mozilla/5.0 (Moneysalary English release QA) ${QA_USER_AGENT}`;
type Record = { path: string; status: number; title?: string; canonical?: string; headings?: number; issues: string[] };
const records: Record[] = [];
const attr = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

async function inspect(path: string) {
  const record: Record = { path, status: 0, issues: [] };
  try {
    const response = await fetchQaDocument(base + path, base, { headers: { "User-Agent": ua }, signal: AbortSignal.timeout(30_000) });
    record.status = response.status;
    const html = await response.text();
    if (response.status !== 200) record.issues.push(`expected 200, received ${response.status}`);
    record.title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    // English titles may define a Korean tax term in parentheses for international readers.
    if (!record.title || !/^[A-Za-z]/.test(record.title)) record.issues.push("missing or non-English title");
    const canonicals = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]).filter(tag => attr(tag, "rel") === "canonical");
    record.canonical = canonicals[0] ? attr(canonicals[0], "href") : undefined;
    if (canonicals.length !== 1 || record.canonical !== origin + path) record.issues.push("canonical does not identify this English page exactly once");
    record.headings = [...html.matchAll(/<h1(?:\s|>)/g)].length;
    if (record.headings !== 1) record.issues.push(`expected one H1, received ${record.headings}`);
    const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]);
    const meta = (name: string) => metas.find(tag => attr(tag, "name") === name || attr(tag, "property") === name);
    if (attr(meta("og:locale") ?? "", "content") !== "en_US") record.issues.push("English OG locale missing");
    if (!attr(meta("og:image") ?? "", "content")?.includes("lang=en")) record.issues.push("English share image missing");
    if (!attr(meta("description") ?? "", "content")) record.issues.push("description missing");
    if (!html.includes('href="/manifest.en.webmanifest"')) record.issues.push("English install manifest missing");
    if (isShareExcludedPath(path) && !attr(meta("robots") ?? "", "content")?.includes("noindex")) record.issues.push("private page must be noindex");
    if (!isShareExcludedPath(path) && attr(meta("robots") ?? "", "content")?.includes("noindex")) record.issues.push("public English page unexpectedly noindex");
  } catch (error) { record.issues.push(String(error)); }
  records.push(record);
}

async function main() {
for (let i = 0; i < EN_ALL_PAGE_PATHS.length; i += 4) await Promise.all(EN_ALL_PAGE_PATHS.slice(i, i + 4).map(inspect));
const missing = [];
for (const path of ["/en/definitely-not-a-page", "/en/tools/definitely-not-a-tool", "/en/guides/definitely-not-a-guide"]) {
  const response = await fetchQaDocument(base + path, base, { headers: { "User-Agent": ua }, signal: AbortSignal.timeout(30_000) });
  const html = await response.text();
  // Next can stream the not-found boundary as an RSC payload. The browser QA
  // checks its final DOM marker; server QA checks HTTP, noindex and English copy.
  missing.push({ path, status: response.status, english: html.includes("This English page could not be found"), noindex: /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html) });
}
const failed = records.filter(record => record.issues.length);
const report = { at: new Date().toISOString(), base, scope: "Every declared English page's HTTP and server HTML; no browser interaction or external SNS delivery.", total: records.length, failed: failed.length, records, missing };
mkdirSync(".artifacts/english-page-quality", { recursive: true });
writeFileSync(".artifacts/english-page-quality/ssr-ledger.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ total: records.length, failed, missing }));
if (failed.length || missing.some(record => record.status !== 404 || !record.english || !record.noindex)) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
