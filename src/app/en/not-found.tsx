import type { Metadata } from "next";
import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";

// EN 404 전용 메타 (2026-09-28 S32) — 종전에는 metadata 가 없어 미들웨어가 모든 알 수 없는 /en/* 에 내보내는
// /en/page-unavailable 404 가 /en layout 의 제목·설명·canonical(/en)·hreflang 을 그대로 물려받았고,
// 루트 layout 의 robots 'index, follow'(googleBot 포함)가 Next 자동 noindex 와 상충하는 robots 메타로 나갔다.
// notFound() 경로에서는 [...missing]/page.tsx 의 metadata 가 읽히지 않으므로 여기서 덮어쓴다.
// 최상위 키 단위로 덮어써져 alternates: {} 는 canonical·hreflang 을, robots 는 googleBot 까지 함께 뺀다(한국어 404 와 동일).
// 정적 객체·타입 import 만 둔다 — 클라이언트 컴포넌트를 새로 import 하면 Edge 라우트 매니페스트에서 빠져 500(2026-09-11).
export const metadata: Metadata = {
  title: { absolute: "Page not found | Moneysalary" },
  description: "The address may be incomplete or the page may no longer exist. Choose an available English calculator or guide.",
  robots: { index: false, follow: true },
  alternates: {},
};

export default function EnglishNotFound() {
  return <div data-page-state="not-found"><EnglishPageShell eyebrow="404 · Page not found" title="This English page could not be found" description="The address may be incomplete or the page may no longer exist. Choose an available English tool or guide below.">
    <nav aria-label="Find an English page" className="flex flex-wrap gap-4"><Link href="/en" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">English home</Link><Link href="/en/calculators" className="inline-flex min-h-11 items-center px-4 font-bold text-primary underline">Calculators</Link><Link href="/en/guides" className="inline-flex min-h-11 items-center px-4 font-bold text-primary underline">Guides</Link></nav>
  </EnglishPageShell></div>;
}
