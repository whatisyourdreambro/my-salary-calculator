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

As of the 2026-10-17 release-preparation audit, the production `moneysalary` Worker configuration is prepared, authentication is pending, and no Worker upload, route activation or deployment has been completed. `wrangler.jsonc` declares the intended production routes and existing D1 binding; `wrangler.qa.jsonc` is the separate local-only configuration. Configuration in git is not proof of remote activation.

Before this migration is merged or pushed to `main`, disable the existing Pages Git auto-deploy, resolve any queued Pages build and preserve the known-good Pages deployment for rollback. Keep source-publishing automations disabled until a functioning Workers publication path is verified. These are release prerequisites, not claims that remote settings have already changed.

`npm run cf:build` builds the ordinary-visitor OpenNext bundle; it does not upload or activate it. The repository has push/PR CI validation, Lighthouse and post-deployment purge workflows, but no Workers publishing workflow. Manually dispatching the `ci` workflow runs the production HTTP health job; it does not run the `verify` job. Run the documented local QA gates for a manual release. A push or green CI result is not a production deployment. A release needs a separately authorized ordinary-visitor build, populated cache/assets, exact tagged Worker version, activation/routing verification, purge and the captured IndexNow delta. Never publish `.open-next-qa` or `.next-qa`.

Follow [the deployment and rollback runbook](docs/contact-operations.md#pages-to-workers-deployment-transition-2026-10-17), [Purge configuration](docs/operator-console-pack.md#배포-후-캐시-자동-purge-설정-workers-전환), and [the CI/document audit](docs/workers-release-2026-10-17/ci-deployment-docs-audit.json). Existing private D1 data must be preserved.
