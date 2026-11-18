// R4 PRIVKO (2026-11-18) N2-app-pages-20 6단계 / SEC-05 (c)(d) — 한국어 개인정보 처리방침에
// 카카오톡 공유 도구 한 줄(4번)과 '8. 개인정보의 국외 이전'(개인정보 보호법 제28조의8 제2항 다섯 가지).
// 운영자 승인 2026-11-18 '권장대로'(owner-questions-2026-11-18b.md D: 한국어 방침에만).
// 한국어 /privacy 에는 광고 컴포넌트가 없다(r4Content2Privacy 가 같은 사실을 고정). 영문 방침은 손대지 않는다.
// 이메일 주소는 운영자 주소와 2026-11-18 각 사업자의 공식 방침에서 확인한 주소만 허용한다:
//   dpo@cloudflare.com — https://www.cloudflare.com/privacypolicy/ 19. CONTACT INFORMATION (Cloudflare, Inc.)
//   googlekrsupport@google.com — https://policies.google.com/privacy?hl=ko 의 문의 주소이자
//     https://policies.google.com/privacy/additional?hl=ko 국외 이전 문단의 문의 주소
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PrivacyPage from "@/app/privacy/page";

const ROOT = process.cwd();
const SRC = readFileSync(join(ROOT, "src/app/privacy/page.tsx"), "utf8");
const VERIFIED_EMAILS = ["dpo@cloudflare.com", "googlekrsupport@google.com", "moneysalary.help@gmail.com"];

function sections(html: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const chunk of html.split("<section").slice(1)) {
    const title = chunk.match(/<h2[^>]*>([^<]+)<\/h2>/)?.[1] ?? "";
    out.set(title, chunk.replace(/<[^>]+>/g, " "));
  }
  return out;
}

describe("R4 PRIVKO /privacy — 카카오톡 공유 고지와 개인정보의 국외 이전", () => {
  const html = renderToStaticMarkup(createElement(PrivacyPage));
  const bySection = sections(html);
  const titles = [...bySection.keys()];

  it("keeps sections 1 to 7 in place and adds 8 as the last section", () => {
    expect(titles).toEqual([
      "1. 수집하는 개인정보 항목",
      "2. 처리 목적",
      "3. 보유 및 이용 기간",
      "4. 제3자 제공 및 광고 파트너",
      "5. 쿠키 사용 및 거부",
      "6. 사용자 권리",
      "7. 개인정보 보호책임자 및 문의처",
      "8. 개인정보의 국외 이전",
    ]);
  });

  it("section 4 names (주)카카오 and its official privacy policy address", () => {
    const s4 = bySection.get("4. 제3자 제공 및 광고 파트너") ?? "";
    expect(s4).toContain("카카오톡 공유 — (주)카카오 (https://www.kakao.com/policy/privacy)");
    expect(s4).toContain("t1.kakaocdn.net");
    expect(s4).toContain("버튼을 누르지 않아도");
    expect(s4).toContain("페이지 주소·제목·설명·미리보기 이미지 주소·버튼 링크");
    expect(s4).toContain("결과 미리보기에서 승인한 뒤");
  });

  it("the Kakao sentence still matches the code: SDK from t1.kakaocdn.net, lazyOnload, mounted in the root layout", () => {
    const loader = readFileSync(join(ROOT, "src/components/KakaoScript.tsx"), "utf8");
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(loader).toContain("https://t1.kakaocdn.net/kakao_js_sdk/");
    expect(loader).toContain('strategy="lazyOnload"');
    expect(layout).toContain("<KakaoScript />");
  });

  it("section 8 covers the five items of 개인정보 보호법 제28조의8 제2항", () => {
    const s8 = bySection.get("8. 개인정보의 국외 이전") ?? "";
    expect(s8).toContain("이전되는 항목:"); // 1. 이전되는 개인정보 항목
    expect(s8).toContain("이전되는 국가: 미국"); // 2. 국가
    expect(s8).toContain("이전 시기와 방법:"); // 2. 시기 및 방법
    expect(s8).toContain("네트워크를 통해 전송");
    expect(s8).toContain("이전받는 자와 연락처:"); // 3. 이전받는 자의 명칭과 연락처
    expect(s8).toContain("이전받는 자의 이용 목적과 보유·이용 기간:"); // 4.
    expect(s8).toContain("이전을 거부하는 방법·절차와 효과:"); // 5.
    expect(s8).toContain("해당 기능을 이용할 수 없습니다");
    expect(s8).toContain("호스팅 제공자의 접속 로그 처리");
  });

  it("section 8 names Cloudflare, Inc. and Google LLC with their verified contacts, and no Korean company", () => {
    const s8 = bySection.get("8. 개인정보의 국외 이전") ?? "";
    expect(s8).toContain("Cloudflare, Inc. (dpo@cloudflare.com, https://www.cloudflare.com/privacypolicy)");
    expect(s8).toContain("Google LLC (googlekrsupport@google.com, https://policies.google.com/privacy)");
    expect(s8).not.toMatch(/카카오|쿠팡|링크프라이스/);
    expect(s8).not.toContain("동의를 받");
  });

  it("every e-mail address in the page source is one verified on 2026-11-18", () => {
    const found = [...new Set(SRC.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [])].sort();
    expect(found).toEqual([...VERIFIED_EMAILS].sort());
  });

  it("the 최종 업데이트 day is not in the future", () => {
    const m = SRC.match(/최종 업데이트: (\d{4})년 (\d{1,2})월 (\d{1,2})일/);
    expect(m).not.toBeNull();
    const day = new Date(`${m![1]}-${m![2].padStart(2, "0")}-${m![3].padStart(2, "0")}T00:00:00+09:00`);
    expect(day.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
