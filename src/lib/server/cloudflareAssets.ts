// src/lib/server/cloudflareAssets.ts
//
// OpenNext Workers 정적 자산 바인딩. ASSETS는 public/immutable 자산 및 빌드 캐시용이며
// Pages의 /<route>.html 저장 위치를 가정해서는 안 된다.
import { cloudflareBindings } from "./cloudflareBindings";

export type AssetFetcher = { fetch(input: URL | string | Request): Promise<Response> };

export function cloudflareAssets(): AssetFetcher | undefined {
  const environment = cloudflareBindings();
  const assets = environment["ASSETS"] as AssetFetcher | undefined;
  return assets && typeof assets.fetch === "function" ? assets : undefined;
}
