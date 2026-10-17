# MoneySalary

Next.js 15 and React 19 application. The owner selected existing Cloudflare Pages and a static build for the Free plan on 2026-10-17. A paid Workers subscription is not authorized.

## Local development and QA

Use Node.js 22. Install dependencies with `npm ci`; postinstall verifies the reviewed dependency backports. Run `npm run dev` or `npm run qa:dev`, then use `http://127.0.0.1:3100`. These commands disable advertisements and analytics for QA. Follow [AGENTS.md](AGENTS.md) before any inspection.

- `npm run qa:build` / `npm run qa:start`: isolated Next QA output in `.next-qa`.
- `npm run qa:pages:build` / `npm run qa:pages:verify`: native static export and Pages package in `.pages-qa`, with ads and analytics disabled and source/output identity checks.
- `npm run qa:pages:start`: verified local Pages runtime on `127.0.0.1:3320`; `-- --port 3000` selects the CI port. External Worker fetches are denied and remote database/secret bindings are absent.
- `npm run qa:pages:http`: non-rendering route, API, PNG and body-limit checks. `npm run qa:run -- scripts/qa-pages-navigation.mjs` checks browser navigation and sharing through the isolated runner. Set `BASE_URL` to the local server for both.
- Legacy OpenNext adapter checks remain available as `qa:cf:build`, `qa:cf:check`, and `qa:cf:start`; these are not the selected publication path.
- `npm run qa:safety`, `npm test`, `npm run lint`: safety, unit and lint checks.

Publisher pages in production or Cloudflare preview must never be opened in a browser for QA. Browser tests require the guarded `qa:run` entry point. QA build directories must never be deployed.

## Production release status and deployment

On 2026-10-17 KST, release `2e0a99484` was uploaded and activated on the `moneysalary` Worker. The code upload reported 31 ms startup. Canonical routes were attached at 03:10:23 KST and removed at 03:10:34 after eight HTTP checks passed and `/sitemap.xml` returned 503. The retained Pages deployment `a1fda725` on commit `7ae902995` serves the site again; its home page returned 200 with the old layout at 03:11:07. DNS and existing D1 data were preserved. See [the deployment outcome](docs/workers-release-2026-10-17/deployment-outcome.json) for exact IDs and evidence.

The new Worker's small dashboard sample showed seven invocations, one CPU-limit error and CPU P50/P90 of 355.79/718 ms on Workers Free (10 ms allowance). The failed sitemap request was not individually correlated to that error. Canonical Worker routes remain absent. The owner has selected a free Pages redesign; no paid-plan purchase is approved. Pages Git production and preview auto-deploy remain frozen while the replacement package is verified. IndexNow captured one changed URL and has not submitted it. The rollback purge API was denied (401); the operator then confirmed Purge Everything in the administrator UI. The dialog closed and a subsequent home response was a cache MISS, but no explicit success receipt was captured. Final guarded checks of the retained deployment returned home 200 with the old layout and sitemap 200 with 1953 URLs. Keep source-publishing automations stopped until the chosen publication path is verified.

`npm run pages:build` creates an ordinary-visitor publication package in `.pages-build/dist`; `npm run pages:verify` checks its identity. The build requires the approved public ad slot settings and preserves the ordinary visitor ad policy. Neither command uploads or activates anything. The Worker serves prebuilt HTML and Flight payloads plus bounded dynamic APIs; it does not include the Next/OpenNext server runtime. Personalized share cards and OG images remain dynamic. Free Pages Functions quotas still apply; static export is not a guarantee of unlimited traffic or CPU compliance.

Production builds read only approved public keys from the regular root `.env.production` file. Valid process overrides take precedence and must be supplied again when verifying that artifact. The build marker records file and effective-configuration hashes, never values. QA builds do not read or copy this file.

The existing Pages project enforces a 25 MiB uncompressed Function package limit: an initial preview upload returned code `8000101` without creating a deployment. The build enforces that observed limit. OG font strips are packaged as compressed Data modules and expanded in bounded blocks at isolate startup; no decompression or remote font fetch occurs in an image request. Preserve exact-data checks and deployment startup/CPU verification when changing this packaging.

The dependency security check currently reports no known advisories. ESLint 9.39.5 still emits its upstream end-of-support warning: the current Next 15 configuration and the latest React/accessibility plugins do not declare ESLint 10 support. Keep their active rules and compatible versions until a supported upgrade is available; do not suppress the warning or force incompatible peers to claim a clean installation.

Publish only the separately verified production package. A manual preview upload must use an isolated CLI working directory and the existing project, exact clean commit and non-production branch. Inspect the exact successful deployment record and use bounded non-rendering HTTP plus deployment logs. Never render preview pages in a browser. Activate the production branch only after local QA and preview checks pass; retain the previous deployment ID for rollback and preserve existing D1 bindings and secrets. Do not unfreeze the old Git build command: it still uses next-on-pages and does not produce this package.

The repository has push/PR CI validation, Lighthouse and manual post-deployment purge workflows. Manually dispatching `ci` runs the production HTTP health job, not `verify`. Run the local QA gates for a manual release. A push or green CI result is not a production deployment. `cf:build` and the root Workers Wrangler configuration are retained for historical reproduction only; do not run `wrangler deploy` or attach their canonical routes for the selected Pages release. Never publish `.pages-qa`, `.open-next-qa` or `.next-qa`.

The previous [Workers rollback runbook](docs/contact-operations.md#pages-to-workers-deployment-transition-2026-10-17), [Purge configuration](docs/operator-console-pack.md#배포-후-캐시-자동-purge-설정-workers-전환), and [CI/document audit](docs/workers-release-2026-10-17/ci-deployment-docs-audit.json) document the abandoned cutover. For the selected Pages path, the manual purge workflow now defaults to Pages and verifies the requested publication commit. Existing private D1 data must be preserved.
