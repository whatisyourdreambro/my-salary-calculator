import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "로또 번호 생성기 — 통계 기반 행운 번호 자동 추천",
  description:
    "홀짝·고저 균형, 합계 범위 등 통계 패턴을 반영해 로또 번호를 자동 생성합니다. 여러 게임 세트를 한 번에 뽑아 나만의 행운 번호를 확인해 보세요.",
  path: "/lotto",
  keywords: [
    "로또 번호 생성기",
    "로또 자동 번호",
    "로또 번호 추천",
    "행운 번호 생성",
  ],
});

export default function LottoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
