// 세법 경계값·엔진 회귀 테스트 러너 설정 (2026-08 대규모 점검 도입)
// 실행: npm test — the sole @/* alias mirrors tsconfig.json without an extra parser.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Next의 jsx:preserve와 별도로 실제 TSX 메타데이터·SSR 모듈을 테스트한다.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["src/**/*.test.ts"],
    // Hundreds of SSR fixtures import the full calculator/company catalog. Keep
    // memory and disk contention bounded on developer machines and CI runners.
    maxWorkers: 2,
  },
});
