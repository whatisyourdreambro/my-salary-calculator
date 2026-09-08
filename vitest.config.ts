// 세법 경계값·엔진 회귀 테스트 러너 설정 (2026-08 대규모 점검 도입)
// 실행: npm test — tsconfig paths(@/*)는 vite-tsconfig-paths가 해석
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Next의 jsx:preserve와 별도로 실제 TSX 메타데이터·SSR 모듈을 테스트한다.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
