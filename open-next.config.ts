import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages are rebuilt on publication; the app does not use ISR or on-demand revalidation.
// Keep middleware/Next header handling enabled; public immutable assets bypass it.
const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: false,
});

// The isolated QA runner compiles the same source without publication hooks.
if (process.env.MSY_QA_WORKER_STAGE === "1") {
  config.buildCommand = "node node_modules/next/dist/bin/next build";
}
export default config;
