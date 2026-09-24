// 네이버·카카오톡 인앱의 '이미지로 저장' → 기존 미리보기(길게 눌러 저장) (A16 / CLIENT-10, 운영자 승인 2026-09-25)
//
// jsdom 없음 — UA 판정은 순수 함수로, 배선은 소스로 고정한다.
// 규칙: 광고 위 새 블록 금지(2026-08-16). 티어 카드는 /salary/[amount] 의 HomeTopAd 바로 위라
// 새 요소를 넣지 않고, 이미 있는 ResultSharePanel 미리보기를 탭했을 때만 펼친다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { isImageDownloadRestricted } from "@/lib/inAppBrowser";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("isImageDownloadRestricted — 네이버 앱·카카오톡 인앱만", () => {
  it("네이버 앱(iOS·Android)과 카카오톡 인앱 UA", () => {
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NAVER(inapp; search; 2000; 12.7.3; 15PRO)",
      "Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.8.1)",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.5",
      "Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36 KAKAOTALK/10.8.5 (INAPP)",
    ]) expect(isImageDownloadRestricted(ua), ua).toBe(true);
  });

  it("일반 브라우저·네이버 웨일·그 밖의 WebView·빈 값은 종전 다운로드", () => {
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Whale/3.27.254.15 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36",
      "Yeti/1.1 (NHN Corp.; https://naver.me/spd)",
      "",
    ]) expect(isImageDownloadRestricted(ua), ua).toBe(false);
    expect(isImageDownloadRestricted(undefined)).toBe(false);
    expect(isImageDownloadRestricted(null)).toBe(false);
  });
});

describe("배선 — 새 블록 없이 기존 미리보기를 연다", () => {
  const card = read("src/components/SalaryTierCard.tsx");
  const panel = read("src/components/ResultSharePanel.tsx");

  it("티어 카드: 인앱이고 패널이 있을 때만 미리보기 요청, 아니면 종전 data: 다운로드", () => {
    expect(card).toContain('isImageDownloadRestricted(navigator.userAgent) && actionsRef.current?.querySelector("[data-result-share-panel]")');
    expect(card).toContain("setPreviewRequest((n) => n + 1);");
    expect(card).toContain("openPreviewRequest={previewRequest}");
    expect(card).toContain('link.href = canvas.toDataURL("image/png");');
    // 버튼·패널 외 새 요소 없음 — Actions 래퍼에 ref 만 붙였다
    expect(card).toContain("<div ref={actionsRef}>");
    expect(card.match(/<ResultSharePanel\b/g)).toHaveLength(1);
  });

  it("패널: 요청마다 같은 openPreview 를 쓰고, 길게 눌러 저장 안내는 탭 뒤 미리보기 안에서만", () => {
    expect(panel).toContain("useEffect(() => { if (openPreviewRequest > 0) requestPreview.current(); }, [openPreviewRequest]);");
    expect(panel).toContain("if (resultIsCurrent && !active) void openPreview();");
    expect(panel).toMatch(/\{active\.objectUrl && isImageDownloadRestricted\(/);
    expect(panel).toContain("이미지를 길게 눌러 저장하세요.");
  });

  it("퍼널 계측: 미리보기 열기·승인에 고정 enum 이벤트 (OG-13)", () => {
    expect(panel).toContain('trackSharePreview("open", contentType);');
    expect(panel).toContain('trackSharePreview("approve", contentType);');
    expect(panel).not.toMatch(/trackSharePreview\([^)]*(resultKey|url|title|imageUrl)/);
  });
});
