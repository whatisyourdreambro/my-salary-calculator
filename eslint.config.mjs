import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // next/link 직접 import 금지 — 뷰포트 프리페치가 CF Worker 요청을 증폭해
    // 무료 플랜 일 한도를 초과시킴. 반드시 @/components/AppLink 사용.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                "next/link 대신 @/components/AppLink 를 사용하세요 (prefetch 기본 차단 — CF 요청 한도 대응).",
            },
          ],
        },
      ],
    },
  },
  {
    // 래퍼 자신만 next/link 직접 import 허용
    files: ["src/components/AppLink.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
