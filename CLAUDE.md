# MoneySalary testing rule

Read and follow [AGENTS.md](./AGENTS.md), especially the owner's 2026-10-16 requirement to prevent live advertising and analytics requests during every site inspection and automated test. This applies to scheduled tasks and delegated workflows as well. Production UI navigation, hidden production iframes, ad-fill checks, old browser snippets and direct CDP sessions are prohibited. Use the isolated QA server and guarded maintained tests; production checks use non-rendering HTTP only.
