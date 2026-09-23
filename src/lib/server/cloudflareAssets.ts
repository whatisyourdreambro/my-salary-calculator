// src/lib/server/cloudflareAssets.ts
//
// Cloudflare Pages 의 정적 자산 바인딩(env.ASSETS). next-on-pages 는 요청 범위의 바인딩을
// process.env 프록시로 노출한다(feedbackStorage.ts 와 같은 접근 방식). next dev/start 에는 없다.
// 테스트는 이 모듈을 vi.mock 으로 대체한다(Node 의 process.env 는 문자열만 담을 수 있어 주입 불가).

export type AssetFetcher = { fetch(input: URL | string | Request): Promise<Response> };

export function cloudflareAssets(): AssetFetcher | undefined {
  const environment = process.env as unknown as Record<string, unknown>;
  const assets = environment["ASSETS"] as AssetFetcher | undefined;
  return assets && typeof assets.fetch === "function" ? assets : undefined;
}
