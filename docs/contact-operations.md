# Private contact operations

This endpoint stores private inquiries; it does not send email, publish comments, or promise a reply. The optional reply address is available only to the owner in D1. There is no public read, admin, or deletion endpoint. The receipt confirms database storage, not that an operator has read the inquiry.

The separate three-page fixed helpful/confusing pilot is documented in [feedback operations](feedback-operations.md). It reuses the bindings with a separate table and rate-limit scope; the contact contract and existing quota remain unchanged. Once migration 0002 is applied, include the feedback table in the daily cleanup described there.

## Runtime and configuration

- Next route: `src/app/api/contact/route.ts`, Next Node runtime through OpenNext on Cloudflare Workers, POST only.
- D1 binding: `FEEDBACK_DB`. Use separate production and preview databases.
- Secret binding: `FEEDBACK_RATE_LIMIT_SECRET`, generated randomly, at least 32 characters (recommended 32 random bytes encoded as hex). Set it as a Cloudflare secret, never a `NEXT_PUBLIC_*` value, source file, log, screenshot, or client parameter.
- Optional `FEEDBACK_ALLOWED_ORIGIN`: one exact HTTPS origin without a trailing slash, needed for a preview deployment. Production defaults to `https://www.moneysalary.com`. Both the request URL and Origin header must match. Do not let preview use the production DB.
- Verify the selected database and its applied schema first. Apply `migrations/0001_private_contact.sql` only where needed, then add the binding to the appropriate Workers environment during a separately authorized deployment. Preserve existing inquiries and rate-limit rows; changing adapters does not require replacing the database. No DB/secret configuration means 503, not a simulated receipt.

The OpenNext migration reads `getCloudflareContext().env` dynamically inside each request through `cloudflareBindings.ts`; it never snapshots the DB or secret at build time and does not use string-only `process.env` as a database fallback. Plain `next start` or a Workers environment without both bindings returns 503 for an otherwise valid request. Local development bindings, if configured, must be local emulations. Do not replace the DB with an in-memory production fallback. The production `wrangler.jsonc` now declares the selected existing D1 binding; it contains no secret value. `wrangler.qa.jsonc` remains separate and has no account, routes, D1 or production variables. A declared binding does not establish that it is remotely installed or usable.

The old Pages adapter is no longer the target configuration. A successful local build or mocked binding test does not prove the production D1 binding exists. Before calling reception operational, a separately authorized deployment needs its verified database identity, secret binding, migrations, and a synthetic POST/private-row verification. Preserve AGENTS.md's prohibition on production/preview publisher browser QA.

Sources: [OpenNext request bindings](https://opennext.js.org/cloudflare/bindings), [OpenNext Workers setup](https://opennext.js.org/cloudflare/get-started), [local D1 development](https://developers.cloudflare.com/d1/best-practices/local-development/).

## Pages-to-Workers deployment transition (2026-10-17)

Release-preparation status on 2026-10-17: the production configuration is prepared, authentication is pending, and no Worker upload, route activation or production deployment has been completed. `wrangler.jsonc` names `moneysalary`, declares both production hostname routes and the selected existing `FEEDBACK_DB`, and disables workers.dev/preview URLs. Those local declarations are not evidence of remote state. `npm run cf:build` only builds an OpenNext bundle. The push/PR CI verify job validates an isolated ad-free Worker and contains no Workers upload/deploy job. A manual ci dispatch runs the separate production HTTP health job, not verify. Never deploy `.open-next-qa` or `.next-qa` output.

Before merging or pushing this migration to `main`, disable the existing Pages Git production auto-deploy and confirm that no older queued Pages build can replace the retained rollback deployment. Keep the Pages project, known-good deployment and existing DNS/custom-domain mapping available for rollback. Keep source-publishing automations disabled and do not run `publish-approved` during the transition. A functioning, authorized Workers publication path must be established before those publishers resume: approved source and passing gates → fresh ordinary-visitor build/cache assets → exact release tag and version upload/activation → routing verification → purge → IndexNow. A Git push, a green CI run or a purge job does not deploy this Worker. This document does not claim those remote settings or automation switches have already been changed.

The authorized production transition must verify the configured account, Worker, hostname routing and deployment mechanism; attach the existing production `FEEDBACK_DB` and secret to that Worker; and verify the schema without replacing private data. Pages bindings do not establish that the new Worker has those bindings. Keep a separate non-production database for acceptance. Confirm the exact allowed origin and that the trusted Cloudflare client-IP header reaches both POST routes. Use the private console for synthetic receipt verification, without copying row contents or secret values into audit artifacts.

The existing post-deployment functions also need an explicit transition:

| Existing item | Current local code | Workers transition obligation |
|---|---|---|
| `.github/workflows/cf-purge.yml` and `scripts/cf-purge-after-deploy.mjs` | Support `CF_DEPLOY_TARGET=workers`. Require one active version at 100%, exact `workers/tag`, and unchanged deployment identity on repeated checks. Workers mode fails on missing configuration; Pages remains the default and can skip missing credentials. | Set repository variables `CF_DEPLOY_TARGET=workers` and `CF_WORKER_NAME=moneysalary`, with read access to Worker deployments/versions plus zone cache purge. Automatic runs expect the exact GitHub SHA tag. Manual runs require `expected_version_id` and the matching `release_tag`. Independently verify public hostname routing and application health: this job verifies the named Worker, not DNS or Pages cutover. |
| `scripts/indexnow-ping.mjs` and `postbuild` | Workers builds defer submission with `CF_DEPLOY_TARGET=workers` or `INDEXNOW_DEFER=1`. Explicit `--capture <manifest.json>` preserves the pre-cutover delta; `--submit <manifest.json>` requires the exact active version and matching canonical sitemap. | Capture after the final ordinary-visitor build and before hostname cutover. Submit that same manifest only after activation, routing verification and purge, with `CF_EXPECTED_VERSION_ID`. Keep the manifest and submission receipt together; a claimed/ambiguous attempt is not automatically retried. These modes fail on errors; the legacy no-argument postbuild path is nonfatal. Never set `INDEXNOW_FORCE` for QA. |
| `_routes.json` and `public/_routes.json` | Retained Pages routing artifacts. | They do not control Workers routing. OpenNext's `ASSETS` binding and `run_worker_first` determine routing; verify application HTML, RSC, API and 404 headers rather than assuming old Pages exclusions still apply. |
| Zone cache and other edge settings | Not changed or reverified by this local migration. | Review the actual HTML/RSC cache key and bypass rules, redirects, DNS/custom domains and script-injection integrations for the selected Worker. Confirm private APIs remain uncached and old HTML cannot retain removed chunk references. |

Rebuild production from the approved source with the intended public service configuration. Use the current checked Wrangler entry point, including the pre-adapter request guards in cloudflare/worker-entry.mjs; do not upload the generated .open-next/worker.js as a standalone replacement that bypasses that wrapper. Do not carry `MSY_QA_MODE`, `MSY_QA_WORKER_STAGE` or `NEXT_PUBLIC_ADS_DISABLED=1` from the isolated QA artifact into the ordinary visitor build. Preserve the current public assets, advertisement/service configuration and cleanup responsibility; local ad-free validation does not verify live account settings. The current local CI/document audit is [here](workers-release-2026-10-17/ci-deployment-docs-audit.json). Earlier draft inventories are historical and do not prove remote activation.

Rollback preparation must record the prior Pages deployment/commit and hostname route state before activation. For a first-cutover rollback, remove or restore only the newly changed Worker routes after verifying the retained Pages origin and DNS mapping; do not delete the Pages project or drop/recreate D1 tables. After routing is back on the intended Pages deployment, the purge workflow can be dispatched with `target=pages` and its `release_sha`. Pages mode checks a successful matching deployment and does not itself restore routing or prove that deployment is currently selected. For a later Worker rollback, select the known-good Worker version, verify it at 100% with its tag/version ID, then purge in Workers mode. Do not reuse a submitted IndexNow manifest for a different release.

## Request and result

`POST /api/contact`, `Content-Type: application/json`, maximum body 4 KiB. The public TypeScript contract is `src/lib/contactContract.ts`.

```json
{
  "submissionId": "a UUID v4 generated once for this submission",
  "type": "calculation_error | explanation | data_correction | business | privacy | other",
  "pagePath": "/",
  "body": "1–500 characters of plain text",
  "inquiryConsent": true,
  "replyEmail": "",
  "replyConsent": false
}
```

The example describes the contract; use an actual UUID and one actual type when sending. `pagePath` is an internal path up to 200 characters, with no query, fragment, external origin, traversal, or controls. The server also redacts salary amount path segments and shared-result payloads. The body is trimmed, newlines normalized, and HTML/control characters rejected. Evidence and business-site URLs are accepted as private plain text: the server never fetches them or renders them as HTML. No attachments. Email is optional, trimmed and validated up to 254 characters; a nonempty address requires `replyConsent: true`. No address means no individual reply channel. Processing consent is required and recorded as `consent_version = contact-v1` at receipt time. Unknown request fields are rejected.

Successful new storage is 201 `{ok:true,receiptId,duplicate:false}`. Same UUID plus the same normalized contents returns 200 with `duplicate:true`; changed contents under that UUID return 409 `RECEIPT_CONFLICT`. Keep the same submission ID and content when retrying an uncertain request. Generate a new ID after changing the content. Never clear the local draft until a valid success response is received.

Failures return only `{ok:false,error}`: 400 invalid input/consent/email, 403 origin, 413 size, 415 media type, 429 `RATE_LIMITED` with `Retry-After`, or 503 `UNAVAILABLE`. A 503 or network timeout may happen after a write committed; say that receipt could not be confirmed and offer a same-ID retry. Do not claim it definitely was not received. The response and errors never reflect the body/email or raw database errors.

## Abuse control and privacy

New inquiries are limited to 5 per fixed 10-minute window for each Cloudflare client IP. The handler derives an HMAC-SHA-256 key using the secret, `contact` scope, window start and `CF-Connecting-IP`. The raw IP is not persisted or logged. No X-Forwarded-For fallback is accepted. Hashes are separate from inquiry rows and rotate each window. Shared networks share the limit; a boundary can permit up to 10 requests across two adjacent windows. Secret rotation resets these windows. This is abuse limiting, not a unique-person metric or complete bot defense.

Reservation, insertion and receipt lookup execute in one D1 batch transaction on the primary. The insertion checks SQLite `changes()` from the immediately preceding reservation. A full bucket cannot insert, and retries/conflicts do not consume another reservation. Never split these statements into separate calls, insert other statements between reservation/insertion, or implement this limit as a non-atomic KV counter. A failed batch rolls back its reservation. [D1 transaction behavior](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)

Do not log request objects, bodies, emails, IDs, SQL parameters or database exceptions. Do not send them to GA, error trackers, debug analytics, or ad services. Client analytics, if added, may include only a fixed event type and non-sensitive route category after confirmed success. The API sets private/no-store and noindex headers; these headers are not access control. Only an authorized Cloudflare operator may read the D1 tables.

## Owner workflow and retention

Use the Cloudflare D1 console under the owner's authenticated account. The following SQL is for that privileged console, never an API accepting arbitrary SQL. All timestamps are Unix seconds. Review daily, run cleanup daily, and record the completed cleanup date in the owner's private operations record.

Inquiries, optional email and consent records have an operational retention target of 90 days from receipt. `expires_at` excludes old items from the normal queue; it does **not** trigger automatic deletion. Expired rows remain until the daily operator cleanup runs. Rate keys expire after their 10-minute window and are removed by the same daily cleanup. This version has no scheduler, so do not claim automatic hard deletion or guaranteed 10-minute physical retention. Cloudflare backups/Time Travel follow the provider's separate retention; do not export private rows into git or audit documents.

```sql
-- Run at the start of each daily review.
DELETE FROM feedback_rate_limits WHERE expires_at <= unixepoch();
DELETE FROM contact_inquiries WHERE expires_at <= unixepoch();

-- Normal private queue. Do not copy its output into public reports.
SELECT submission_id, inquiry_type, page_path, body, reply_email,
       reply_consent, consent_version, status, created_at, expires_at
FROM contact_inquiries
WHERE expires_at > unixepoch() AND status IN ('new', 'reviewed')
ORDER BY created_at ASC LIMIT 100;

-- Replace the placeholder with the exact receipt from the private queue.
UPDATE contact_inquiries SET status = 'reviewed', resolved_at = NULL
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();

UPDATE contact_inquiries SET status = 'resolved', resolved_at = unixepoch()
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();

UPDATE contact_inquiries SET status = 'spam', resolved_at = unixepoch()
WHERE submission_id = '<receipt-id>' AND expires_at > unixepoch();
```

An owner can honor a deletion request after checking the receipt and request context privately. Possession of a receipt does not grant a public read/delete capability. Use the private console to inspect only the matching row, then delete it; do not paste additional email/body data into SQL strings.

```sql
SELECT submission_id, inquiry_type, created_at, status
FROM contact_inquiries WHERE submission_id = '<receipt-id>';
DELETE FROM contact_inquiries WHERE submission_id = '<receipt-id>';
SELECT COUNT(*) AS remaining FROM contact_inquiries WHERE submission_id = '<receipt-id>';
```

Deleting a row also deletes its deduplication evidence. Retrying its ID after deletion/retention is a new submission; this API intentionally keeps no separate long-lived personal-data tombstone.

## Verification and recovery

Run `npx vitest run src/lib/__tests__/contactHandler.test.ts` for HTTP validation, consent, error/replay behavior and privacy checks. Run `python scripts/verify-contact-storage.py` (or `python3` on Linux) for the actual schema and SQL against isolated SQLite, including 20 concurrent submissions with exactly 5 accepted, duplicate/conflicting IDs, transaction rollback and cleanup. These local checks do not prove a remote binding works.

For later explicitly authorized storage acceptance, configure a separate non-production database and use non-rendering API requests from its exact allowed origin: submit one synthetic question, locate that exact UUID privately, retry unchanged (same one row), change text while keeping UUID (409), then test a fresh rate window with six new synthetic IDs (five accepted, sixth 429). Confirm 503 with storage deliberately absent only in that isolated environment. Do not open production or Cloudflare preview publisher pages in a browser. UI draft/error and network-isolation checks run only on loopback with the guarded ad-free QA runner, using synthetic fixtures. Delete only the identified synthetic rows privately afterward. None of this remote acceptance is performed by the local migration checks.

If D1 or the secret is unavailable, keep the route closed with 503 and the client draft available; never switch to a fake success, client-only queue, or a public issue tracker. An operator-controlled email fallback can be added later if a real address is provided and its disclosure is approved. This endpoint does not fabricate a fallback address.
