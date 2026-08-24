import type { Metadata } from "next";
import EnglishLocaleSync from "./LocaleSync";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import { buildPageMetadata } from "@/lib/seo";

// en 로케일 수렴 (2026-08-24): buildPageMetadata locale:"en"으로
// 접미사("| Moneysalary")·og:locale(en_US)·og:image(자동 OG 라우트)·hreflang을 표준화.
// koPath "/" = 한국어 홈이 ko-KR·x-default (기존 수동 선언과 동일 구조).
export const metadata: Metadata = buildPageMetadata({
 title: "Salary, Stocks & Tax for Working in Korea",
 description:
 "Net pay calculator, Samsung Electronics & SK Hynix stock analysis, ESOP and ISA strategies — English guides for professionals working in Korea.",
 path: "/en",
 locale: "en",
 koPath: "/",
});

export default function EnglishLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 // ⚠️ 서빙 HTML의 <html lang>은 여전히 "ko" (root layout 하드코딩):
 // Next App Router에서 <html>은 root layout 소유라 중첩 layout이 바꿀 수 없고,
 // middleware는 렌더 전에 실행돼 응답 본문(HTML)에 접근 불가 —
 // NextResponse.next()는 라우팅 지시일 뿐이라 CF Workers의 HTMLRewriter로도
 // 본문 치환 지점이 없다 (가능하려면 Next 밖의 커스텀 _worker.js 래핑이 필요 = 배포 해킹).
 // 따라서 ① 이 <div lang="en">으로 서브트리 언어를 표기하고(HTML 표준상 유효한
 // 언어 스코프) ② LocaleSync가 하이드레이션 후 document.documentElement.lang을
 // "en"으로 교정하는 이중 장치를 유지한다. 크롤러 언어 판정은 hreflang·og:locale·
 // 콘텐츠 언어가 우선 신호라 실질 영향은 제한적.
 return (
 <div className="en-locale" lang="en">
 <EnglishLocaleSync />
 {children}
 {/* 영어권 트래픽도 AdSense 가 자동 매칭 (지역별 광고 송출 — Cloudflare 엣지) */}
 <PageFooterAds maxWidth="3xl" />
 {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
 <AutoShareSection contentType="page" locale="en" maxWidth="3xl" className="pb-16" />
 </div>
 );
}
