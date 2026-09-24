// src/lib/inAppBrowser.ts
//
// 네이버 앱·카카오톡 인앱 브라우저 판정 (A16 / CLIENT-10, 운영자 승인 2026-09-25).
// 두 앱의 WebView 는 <a download>(data:·blob: URL) 프로그램 다운로드를 무시하는 경우가 많고 예외도 나지 않아
// 버튼이 '아무 반응 없음'이 된다(플랫폼 동작 기준 — 실기기 확인 전). 이 UA 에서는 이미지를 화면에 띄워
// 길게 눌러 저장하게 한다.
// 네이버 앱 UA 는 'NAVER(inapp; search; …)', 카카오톡은 'KAKAOTALK 10.x' 형태. 네이버 웨일(Whale)은 해당 없음.
// 유입의 대부분이 네이버라 범위를 이 둘로 좁힌다 — 일반 Android WebView('; wv)')까지 넓히지 않는다.

const RESTRICTED_IN_APP_UA = /NAVER\(|KAKAOTALK/i;

/** 파일 다운로드가 동작하지 않는 인앱 브라우저(네이버 앱·카카오톡)인가. SSR·빈 UA 는 false. */
export function isImageDownloadRestricted(userAgent: string | null | undefined): boolean {
  return typeof userAgent === "string" && RESTRICTED_IN_APP_UA.test(userAgent);
}
