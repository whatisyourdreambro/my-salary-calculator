# Calculator quality and comparison release

The comparison result belongs to the current inputs. Editing an offer or shared conditions, adding or removing an offer invalidates the previous result. At least two valid offers are required. The highest monthly estimate is a numeric comparison, not a recommendation to accept a job.

## Calculation and sharing contracts

- Compare gross compensation, insurance, tax and net differences against the first input offer. Disclose the annual estimate divided by 12, rounding and excluded personal conditions.
- Keep income deductions separate from tax credits in the child calculator. Eligibility comes before amounts; these amounts are not promised refunds.
- Missing dashboard inputs remain unknown. A missing loan estimate is not evidence of no debt.
- Transfer salary inputs only after an explicit action, through short-lived session storage to the fixed comparison URL. Validate the payload and show its conditions before applying it. Preserve existing saved financial data.
- Offer comparison events contain only fixed state labels. Salary, family values, company names and transfer data are excluded. Existing calculator success events are not reused as comparison counts.
- The fixed share link contains no personal result. Downloaded comparison images may contain amounts, even when names are anonymized; the UI explains this before export.

## Search and content quality

Retain established URLs and published dates. Update only the modified dates of substantively revised articles. Source links explain specific claims; the editorial policy page is not presented as an official tax source. Unknown Q&A and glossary slugs return a not-found response.

`npm run qa:quality` inventories the current Next build and sitemap into `.artifacts/page-quality/`. Every URL records machine status separately from factual review. Runtime routes listed in the sitemap are not represented as tested HTTP responses. Short copy, duplicate headings or omission from a sitemap alone do not trigger deletion or noindex.

## Verification

Run `npm test`, `node --test scripts/__tests__/qa-page-quality.test.mjs`, `npm run lint`, `npm run build`, `npm run qa:quality`, and the existing crawl against a local production server. Test real interactions at narrow mobile and desktop sizes, including stale results, invalid amounts, input transfer, anonymization and image export. Verify the production release independently after merge.

Existing ad experiments remain separate. Ranking, traffic and revenue outcomes require observation; these checks establish behavior and build quality, not revenue uplift or Google indexing.
