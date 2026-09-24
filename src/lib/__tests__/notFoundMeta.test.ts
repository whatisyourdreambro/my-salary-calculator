// 404(not-found.tsx) 메타·광고 보류 스크립트 게이트 (2026-09-25 B1).
// - 404 는 홈 <title>·robots 'index, follow' 를 물려받지 않는다 (Next 자동 noindex 와 상충 방지).
// - 광고 요청 보류 인라인 스크립트는 바이트 그대로 (게시자 정책 — 콘텐츠 없는 화면 광고 금지).
// - 클라이언트 컴포넌트 import 금지 (Edge 라우트 매니페스트에서 빠져 500 — 2026-09-11).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/not-found";

const SRC = readFileSync(resolve(process.cwd(), "src/app/not-found.tsx"), "utf8");

describe("not-found metadata", () => {
  it("전용 제목(absolute — layout 템플릿 미적용)과 noindex, follow", () => {
    expect(metadata.title).toEqual({ absolute: "페이지를 찾을 수 없습니다 | 머니샐러리" });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("광고 요청 보류 인라인 스크립트가 바이트 그대로 남아 있다", () => {
    expect(SRC).toContain(
      '<script dangerouslySetInnerHTML={{ __html: "(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;" }} />',
    );
    expect(SRC).toContain('data-page-state="not-found"');
  });

  it("import 는 타입(next)·AppLink·lucide-react 만 — 클라이언트 컴포넌트 직접 import 금지", () => {
    const specifiers = [...SRC.matchAll(/^import\s[^;]*?from\s+"([^"]+)";/gm)].map((m) => m[1]);
    expect(specifiers.sort()).toEqual(["@/components/AppLink", "lucide-react", "next"]);
    expect(SRC).toMatch(/^import type \{ Metadata \} from "next";/m);
    expect(SRC).not.toMatch(/^["']use client["']/m);
  });
});
