// EN 404(en/not-found.tsx) 메타 게이트 (2026-09-28 S32).
// - 미들웨어가 모든 알 수 없는 /en/* 에 내보내는 /en/page-unavailable 404 는 /en layout 의 제목·설명·
//   canonical(/en)·hreflang 과 루트 layout 의 robots 'index, follow'(googleBot 포함)를 물려받지 않는다.
// - notFound() 경로에서 Next 는 page 메타를 건너뛰고 layout 체인 + 가장 깊은 not-found 메타만 합친다
//   (next/dist/lib/metadata/resolve-metadata — errorConvention 'not-found'). 그 합성을 그대로 재현해 확인한다.
// - 클라이언트 컴포넌트 import 금지 (Edge 라우트 매니페스트에서 빠져 500 — 2026-09-11): next 는 타입 import 만.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Metadata } from "next";
import { accumulateMetadata } from "next/dist/lib/metadata/resolve-metadata";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/en/not-found";
import { metadata as enLayoutMetadata } from "@/app/en/layout";

const SRC = readFileSync(resolve(process.cwd(), "src/app/en/not-found.tsx"), "utf8");

// 루트 layout(src/app/layout.tsx)은 next/font·globals.css 때문에 테스트에서 import 할 수 없어
// 이 게이트에 필요한 robots 만 같은 값으로 둔다 — googleBot 까지 빠지는지 보기 위한 것.
const ROOT_ROBOTS_ONLY: Metadata = {
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

async function resolveEnglish404() {
  return accumulateMetadata(
    [ROOT_ROBOTS_ONLY, enLayoutMetadata, metadata].map((m) => [m, null, null]),
    { pathname: "/en/page-unavailable", trailingSlash: false, isStandaloneMode: false },
  );
}

describe("en/not-found metadata", () => {
  it("전용 제목(absolute)·설명, noindex, follow, 빈 alternates", () => {
    expect(metadata).toEqual({
      title: { absolute: "Page not found | Moneysalary" },
      description: "The address may be incomplete or the page may no longer exist. Choose an available English calculator or guide.",
      robots: { index: false, follow: true },
      alternates: {},
    });
  });

  it("합성된 404 head 는 /en 의 제목·설명·canonical·hreflang 과 index 신호를 물려받지 않는다", async () => {
    const resolved = await resolveEnglish404();
    expect(resolved.title?.absolute).toBe("Page not found | Moneysalary");
    expect(resolved.title?.absolute).not.toBe((enLayoutMetadata.title as { absolute: string }).absolute);
    expect(resolved.description).toBe(metadata.description);
    expect(resolved.description).not.toBe(enLayoutMetadata.description);
    expect(resolved.alternates?.canonical ?? null).toBeNull();
    expect(resolved.alternates?.languages ?? null).toBeNull();
    expect(resolved.robots?.basic).toBe("noindex, follow");
    expect(resolved.robots?.googleBot ?? null).toBeNull();
  });

  it("본문 영어 문구와 404 마커는 그대로 (qa:english 가 확인하는 문구)", () => {
    expect(SRC).toContain('title="This English page could not be found"');
    expect(SRC).toContain('data-page-state="not-found"');
    expect(metadata.description).not.toContain("This English page could not be found");
  });

  it("next 는 타입 import 만, 'use client' 없음", () => {
    expect(SRC).toMatch(/^import type \{ Metadata \} from "next";/m);
    expect(SRC).not.toMatch(/^import (?!type )[^;]*from "next";/m);
    expect(SRC).not.toMatch(/^["']use client["']/m);
  });
});
