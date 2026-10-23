// 공유 채널 utm 귀속 회귀 테스트 (2026-09-05 plan-gap-critic-3)
//
// jsdom 없음 — src/lib/shareChannels.ts 의 순수 함수 withUtm 만 검증한다.
// 배경: 카카오 인앱·링크 복사·웹공유 유입이 GA4 (direct) 23.5% 에 섞여 분해 불가였다.
// 신규 공유에서는 개인 query/hash/token을 제거한다. 기존 링크 수신은 별도 decoder 회귀로 보존한다.

import { afterEach, describe, expect, it, vi } from "vitest";
import { kakaoFeedImageSize, SHARE_CHANNELS, tryKakaoFeedShare, withUtm } from "@/lib/shareChannels";

const HOME = "https://www.moneysalary.com";

describe("withUtm — 기본 결합", () => {
  it("쿼리 없는 URL: ?utm_source=<채널>&utm_medium=share", () => {
    expect(withUtm(`${HOME}/calc/samsung-bonus`, "kakao")).toBe(
      `${HOME}/calc/samsung-bonus?utm_source=kakao&utm_medium=share`
    );
  });

  it("홈(루트 슬래시) URL", () => {
    expect(withUtm(`${HOME}/`, "copy")).toBe(
      `${HOME}/?utm_source=copy&utm_medium=share`
    );
  });

  it("기존 쿼리는 개인값 여부와 무관하게 제거", () => {
    expect(withUtm(`${HOME}/?tab=severance`, "webshare")).toBe(
      `${HOME}/?utm_source=webshare&utm_medium=share`
    );
  });

  it("빈 쿼리(끝이 ?)는 ? 하나만 남김", () => {
    expect(withUtm(`${HOME}/guides/x?`, "copy")).toBe(
      `${HOME}/guides/x?utm_source=copy&utm_medium=share`
    );
  });

  it("medium 인자 지정 가능 (PWA start_url 등)", () => {
    expect(withUtm(`${HOME}/`, "pwa", "homescreen")).toBe(
      `${HOME}/?utm_source=pwa&utm_medium=homescreen`
    );
  });
});

describe("withUtm — fragment 제거", () => {
  it("앵커도 새 외부 URL에 전송하지 않음", () => {
    expect(withUtm(`${HOME}/guides/x#faq`, "kakao")).toBe(
      `${HOME}/guides/x?utm_source=kakao&utm_medium=share`
    );
  });

  it("쿼리+fragment 동시", () => {
    expect(withUtm(`${HOME}/calc/x?v=abc#result`, "copy")).toBe(
      `${HOME}/calc/x?utm_source=copy&utm_medium=share`
    );
  });
});

describe("withUtm — 새 공유에는 결과 재현 payload 없음", () => {
  it("기존 /share/{base64} 링크를 입력받아도 공용 홈 링크만 생성", () => {
    // btoa('{"annualSalary":50000000,"dependents":1}') 류 — 패딩 = 과 +,/ 가 섞일 수 있음
    const b64 = "eyJhbm51YWxTYWxhcnkiOjUwMDAwMDAwfQ+/==";
    const out = withUtm(`${HOME}/share/${b64}`, "kakao");
    expect(out).toBe(`${HOME}/?utm_source=kakao&utm_medium=share`);
    expect(out).not.toContain(b64);
  });

  it("SimpleCalculatorView 의 ?v=base64 값은 제거", () => {
    const v = "eyJzYWxhcnkiOjEwMH0=";
    expect(withUtm(`${HOME}/calc/opi?v=${v}`, "x")).toBe(
      `${HOME}/calc/opi?utm_source=x&utm_medium=share`
    );
  });
});

describe("withUtm — 멱등·교체", () => {
  it("이미 utm 이 있으면 교체하고 중복 생성하지 않는다", () => {
    const once = withUtm(`${HOME}/calc/x`, "copy");
    const twice = withUtm(once, "kakao");
    expect(twice).toBe(`${HOME}/calc/x?utm_source=kakao&utm_medium=share`);
    expect(twice.match(/utm_source=/g)?.length).toBe(1);
    expect(twice.match(/utm_medium=/g)?.length).toBe(1);
  });

  it("기존 캠페인도 제거하고 고정 채널만 사용", () => {
    expect(
      withUtm(`${HOME}/?utm_campaign=season&utm_source=embed&utm_medium=widget`, "kakao")
    ).toBe(`${HOME}/?utm_source=kakao&utm_medium=share`);
  });

  it("임의 source/medium에 개인값을 넣을 수 없음", () => {
    expect(withUtm(`${HOME}/`, "a b")).toBe(
      `${HOME}/?utm_source=copy&utm_medium=share`
    );
    expect(withUtm(`${HOME}/`, "kakao", "salary-987654321")).toBe(`${HOME}/?utm_source=kakao&utm_medium=share`);
  });
});

describe("withUtm — 채널 인텐트 결합", () => {
  it("인텐트 빌더에 넣은 utm URL 이 통째로 인코딩된다 (& 가 잘리지 않음)", () => {
    const url = withUtm(`${HOME}/calc/x`, "naver_blog");
    const intent = SHARE_CHANNELS.naver_blog.intentUrl!({ url, title: "t" });
    expect(intent).toContain(encodeURIComponent(url));
    expect(intent).toContain("utm_source%3Dnaver_blog%26utm_medium%3Dshare");
  });
});

// OG-12 (2026-09-25): 우리 1200×630 카드일 때만 카카오 피드에 크기 힌트
describe("kakaoFeedImageSize — 우리 OG 카드에만 크기 힌트", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("/api/og·/og-default.png(우리 도메인)는 1200×630", () => {
    for (const url of [
      `${HOME}/api/og?type=salary&amount=50000000&net=3520000&v=20260924`,
      `${HOME}/api/og?path=%2Fcalc%2Fx&title=t&lang=ko`,
      `${HOME}/og-default.png`,
      "https://moneysalary.com/api/og?type=guide&title=x",
      "/api/og?type=tool&name=x",
    ]) expect(kakaoFeedImageSize(url), url).toEqual({ imageWidth: 1200, imageHeight: 630 });
  });

  it("다른 경로·다른 도메인·잘못된 URL에는 넣지 않는다", () => {
    for (const url of [
      `${HOME}/images/card.png`,
      `${HOME}/api/og-other`,
      "https://example.com/api/og?type=salary",
      "https://cdn.example.com/og-default.png",
      "http://[invalid",
    ]) expect(kakaoFeedImageSize(url), url).toEqual({});
  });

  it("홈 계산기는 현재 origin 으로 카드 주소를 만든다 — 같은 host(프리뷰 배포)도 우리 카드", () => {
    vi.stubGlobal("window", { location: { host: "preview.moneysalary.pages.dev" } });
    expect(kakaoFeedImageSize("https://preview.moneysalary.pages.dev/api/og?type=salary&amount=1")).toEqual({ imageWidth: 1200, imageHeight: 630 });
  });

  it("Kakao에는 호출자가 준 개인 OG나 외부 이미지 대신 공용 카드만 전송", () => {
    const sendDefault = vi.fn();
    vi.stubGlobal("window", { location: { host: "www.moneysalary.com" }, Kakao: { isInitialized: () => true, Share: { sendDefault } } });
    expect(tryKakaoFeedShare({ url: `${HOME}/calc/x`, title: "t", imageUrl: `${HOME}/api/og?type=tool&name=x` })).toBe(true);
    expect(sendDefault.mock.calls[0][0].content).toMatchObject({ imageUrl: `${HOME}/api/og?path=%2Fcalc%2Fx&lang=ko`, imageWidth: 1200, imageHeight: 630 });
    tryKakaoFeedShare({ url: `${HOME}/calc/x`, title: "t", imageUrl: "https://example.com/a.png" });
    const content = sendDefault.mock.calls[1][0].content;
    expect(content).toMatchObject({ imageUrl: `${HOME}/api/og?path=%2Fcalc%2Fx&lang=ko`, imageWidth: 1200, imageHeight: 630 });
  });
});
