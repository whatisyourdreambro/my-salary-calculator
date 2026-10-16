# Prevent live ads during development and QA

All agent inspections follow [AGENTS.md](../AGENTS.md). Never open production or Cloudflare preview publisher pages in a browser for QA, including saved production HTML, hidden tabs, refresh loops or ad previews.

Use the ad-free `qa:dev`, `qa:build`/`qa:start`, or `qa:cf:build`/`qa:cf:start` wrappers and the guarded `qa:run` browser entry point on loopback only. The network guard is installed before any page exists; external requests, advertising/analytics proxies, unsafe redirects and service workers are blocked. Do not treat a WebDriver flag, query parameter, hidden ad container or hostname check as sufficient isolation.

The shared runtime guards are additional defense: test flags can only disable ads and analytics. Ordinary eligible visitors retain the production advertising behavior. The isolated `.next-qa` and `.open-next-qa` artifacts must never be deployed. Inspect neither real ads nor their click behavior to validate the guard.

The CI verification build uses the local ad-free Worker. The separate scheduled health job only fetches production documents through the non-rendering HTTP helper; it does not execute returned JavaScript. See [the current release runbook](contact-operations.md#pages-to-workers-deployment-transition-2026-10-17).

These measures do not establish the historical cause of the AdSense serving limit or remove it. Google evaluates the account separately.
