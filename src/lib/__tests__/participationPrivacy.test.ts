import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("participation privacy notice survives feature withdrawal", () => {
  it.each([
    ["0", "0"], ["1", "0"], ["0", "1"], ["1", "1"],
  ])("retains consent, retention and deletion notices with reactions=%s and opinions=%s", async (reactions, opinions) => {
    vi.stubEnv("NEXT_PUBLIC_PARTICIPATION_REACTIONS_ENABLED", reactions);
    vi.stubEnv("NEXT_PUBLIC_PARTICIPATION_OPINIONS_ENABLED", opinions);
    vi.resetModules();
    const { default: PrivacyPage } = await import("@/app/privacy/page");
    const html = renderToStaticMarkup(createElement(PrivacyPage));

    expect(html).toContain("비공개 선택형 개선 의견:");
    expect(html).toContain("비공개로 접수한 의견은 공개 집계로 전환하지 않습니다.");
    expect(html).toContain("공개 집계용 선택형 반응:");
    expect(html).toContain("수집·이용 및 공개 집계에 동의해 접수한 경우");
    expect(html).toContain("비공개 수집·이용에 동의해 접수한 경우");
    expect(html).toContain("200자 이내 본문");
    expect(html).toContain("최근 28일의 공개 집계에 동의한 응답이 10건 이상일 때");
    expect(html).toContain("위 동의를 받아 접수한 데이터가 있는 경우");
    expect(html).toContain("접수일부터 90일을 보관 기준으로 정기 삭제");
    expect(html).toContain("기능 제공이나 접수를 중단해도 이미 접수한 데이터에는 보관·삭제 및 삭제 요청 안내가 계속 적용됩니다.");
    expect(html).toContain("접수 번호로 별도 삭제를 요청할 수 있습니다.");
    expect(html).toContain('href="/contact?source=privacy&amp;type=privacy"');
    expect(html).toContain("새 공유 링크는 개인 입력 없이 공용 페이지와 고정 채널 정보만 전달");
    expect(html).toContain("링크 미리보기 이미지 URL에도 개인 입력을 넣지 않습니다");
    expect(html).toContain("과거에 생성한 입력값 포함 결과 링크는 계속 읽을 수 있고");
    expect(html).not.toContain("입력값이 포함된 결과 링크·문구·이미지가 생성될 수 있습니다");
  });
});
