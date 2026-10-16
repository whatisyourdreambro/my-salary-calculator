# MoneySalary

Next.js 15 and React 19 application prepared for Cloudflare Workers through OpenNext.

## Local development and QA

Use Node.js 22. Install dependencies with `npm ci`; postinstall verifies the reviewed dependency backports. Run `npm run dev` or `npm run qa:dev`, then use `http://127.0.0.1:3100`. These commands disable advertisements and analytics for QA. Follow [AGENTS.md](AGENTS.md) before any inspection.

- `npm run qa:build` / `npm run qa:start`: isolated Next QA output in `.next-qa`.
- `npm run qa:cf:build` / `npm run qa:cf:check`: isolated ad-free OpenNext build and local packaging check in `.open-next-qa`.
- `npm run qa:cf:start`: local Worker on `127.0.0.1:3319` by default; `-- --port 3000` selects the CI port.
- `npm run qa:safety`, `npm test`, `npm run lint`: safety, unit and lint checks.

Publisher pages in production or Cloudflare preview must never be opened in a browser for QA. Browser tests require the guarded `qa:run` entry point. QA build directories must never be deployed.

## Production release status and deployment

On 2026-10-17 KST, release `2e0a99484` was uploaded and activated on the `moneysalary` Worker. The code upload reported 31 ms startup. Canonical routes were attached at 03:10:23 KST and removed at 03:10:34 after eight HTTP checks passed and `/sitemap.xml` returned 503. The retained Pages deployment `a1fda725` on commit `7ae902995` serves the site again; its home page returned 200 with the old layout at 03:11:07. DNS and existing D1 data were preserved. See [the deployment outcome](docs/workers-release-2026-10-17/deployment-outcome.json) for exact IDs and evidence.

The new Worker's small dashboard sample showed seven invocations, one CPU-limit error and CPU P50/P90 of 355.79/718 ms on Workers Free (10 ms allowance). The failed sitemap request was not individually correlated to that error. Canonical Worker routes remain absent while the owner decides between Workers Paid and a redesign for Free; no paid-plan purchase is approved. Pages Git production and preview auto-deploy are frozen, and no Git push has been made. IndexNow captured one changed URL and has not submitted it. The rollback purge API was denied (401); the operator then confirmed Purge Everything in the administrator UI. The dialog closed and a subsequent home response was a cache MISS, but no explicit success receipt was captured. Final guarded checks returned home 200 with the old layout and sitemap 200 with 1953 URLs. Keep source-publishing automations stopped until the chosen publication path is verified.

`npm run cf:build` builds the ordinary-visitor OpenNext bundle; it does not upload or activate it. The repository has push/PR CI validation, Lighthouse and post-deployment purge workflows, but no Workers publishing workflow. Manually dispatching the `ci` workflow runs the production HTTP health job; it does not run the `verify` job. Run the documented local QA gates for a manual release. A push or green CI result is not a production deployment. A release needs a separately authorized ordinary-visitor build, populated cache/assets, exact tagged Worker version, activation/routing verification, purge and the captured IndexNow delta. Never publish `.open-next-qa` or `.next-qa`.

Follow [the deployment and rollback runbook](docs/contact-operations.md#pages-to-workers-deployment-transition-2026-10-17), [Purge configuration](docs/operator-console-pack.md#배포-후-캐시-자동-purge-설정-workers-전환), and [the CI/document audit](docs/workers-release-2026-10-17/ci-deployment-docs-audit.json). Existing private D1 data must be preserved.
