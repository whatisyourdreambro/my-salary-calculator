/**
 * Conservative shortcut for build-verified static company documents.
 * Every unsupported request or asset response uses next-on-pages unchanged.
 * The manifest generator pins the reviewed middleware/header configuration.
 */
export function createStaticCompanyHandler(nextHandler, contract) {
  const allowed = new RegExp(contract.userAgents.ALLOWED_BOTS.source, contract.userAgents.ALLOWED_BOTS.flags);
  const bad = new RegExp(contract.userAgents.BAD_BOTS.source, contract.userAgents.BAD_BOTS.flags);
  const suspicious = new RegExp(contract.userAgents.SUSPICIOUS_UA.source, contract.userAgents.SUSPICIOUS_UA.flags);
  const tracking = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id']);
  const transportHeaders = new Set(['date', 'etag', 'content-length', 'transfer-encoding', 'connection', 'keep-alive', 'x-server-env']);
  // Unexpected platform headers must not cause an extra asset request forever.
  // Once the contract fails, this isolate uses the established handler directly.
  let assetContractAvailable = true;

  function eligible(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return null;
    // Preserve the middleware's canonical redirect, including its host semantics.
    if (request.headers.get('host') !== 'www.moneysalary.com') return null;
    const url = new URL(request.url);
    const route = contract.routes[url.pathname];
    if (!route) return null;
    for (const key of url.searchParams.keys()) if (!tracking.has(key)) return null;
    for (const key of request.headers.keys()) {
      if (key === 'cookie' || key === 'authorization' || key === 'range' || key === 'rsc'
        || key === 'content-type' || key === 'purpose' || key === 'sec-purpose'
        || key.startsWith('if-') || key.startsWith('next-') || key.startsWith('x-next')
        || key.startsWith('x-middleware-') || key.startsWith('x-prerender-')) return null;
    }
    const ua = request.headers.get('user-agent') || '';
    // Keep the original allowlist-before-denylist priority, including mixed UAs.
    if (!allowed.test(ua) && (!ua || bad.test(ua) || suspicious.test(ua))) return null;
    return route;
  }

  function responseMatches(asset, route) {
    if (asset.status !== 200 || asset.headers.has('set-cookie') || !asset.headers.has('etag')) return false;
    for (const [key, value] of Object.entries(contract.assetHeaders)) {
      if (asset.headers.get(key) !== value) return false;
    }
    // Unknown origin/security/encoding/robots/cache headers require the full handler.
    for (const [key, value] of asset.headers) {
      if (Object.hasOwn(contract.assetHeaders, key) || transportHeaders.has(key)) continue;
      if (Object.hasOwn(route, key) && route[key] === value) continue;
      return false;
    }
    return true;
  }

  return {
    async fetch(request, env, ctx) {
      const route = eligible(request);
      if (route && assetContractAvailable && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        let asset;
        try {
          asset = await env.ASSETS.fetch(request);
          if (responseMatches(asset, route)) {
            const headers = new Headers(asset.headers);
            for (const [key, value] of Object.entries(route)) headers.set(key, value);
            return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
          }
        } catch {
          // Asset availability must not replace the established application handler.
        }
        assetContractAvailable = false;
        if (asset?.body) await asset.body.cancel().catch(() => {});
      }
      return nextHandler.fetch(request, env, ctx);
    },
  };
}
