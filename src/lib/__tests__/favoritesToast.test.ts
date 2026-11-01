// 즐겨찾기 추가 알림(3초)이 하단 앵커 광고 구역에 탭 대상을 두지 않는지 (IVT-09·CC-04, 2026-11-01 운영자 승인 1번 가안)
// 알림은 클릭 뒤 클라이언트 상태에서만 그려져 서버 HTML 에 없으므로 컴포넌트 소스의 알림 구간을 직접 읽어 고정한다.
// 위치는 종전 bottom-20 그대로 — 앵커 감지 위치 조정(나안, favoritesToastPlacement)은 이번에 하지 않았다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/components/FavoritesButton.tsx"), "utf8").replace(/\r\n/g, "\n");
const start = src.indexOf("const toastNode");
const end = src.indexOf("if (!target) return null;");
const toast = src.slice(start, end);

describe("FavoritesButton toast", () => {
  it("still has a single toast block before the render branches", () => {
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    expect(src.indexOf("const toastNode", start + 1)).toBe(-1);
  });

  it("is a text-only polite status without links, buttons or handlers", () => {
    expect(toast).toContain('role="status"');
    expect(toast).toContain('aria-live="polite"');
    expect(toast).not.toMatch(/<(Link|a|button)\b/);
    expect(toast).not.toMatch(/\b(onClick|onPointer\w*|onTouch\w*|onMouse\w*|href)\b/);
  });

  it("keeps the approved bottom-20 position and does not pass taps through to what lies beneath", () => {
    expect(toast).toMatch(/className="share-toast fixed bottom-20 /);
    // pointer-events-none 이면 알림을 누른 손가락이 아래(앵커 광고 자리)로 그대로 내려간다.
    expect(toast).not.toContain("pointer-events-none");
  });
});
