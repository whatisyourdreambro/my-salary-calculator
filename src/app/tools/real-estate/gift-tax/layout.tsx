import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "증여세 계산기 - 가족 간 공제한도·세율 (2026)",
 description:
 "배우자 6억, 직계존비속 5천만(미성년 2천만), 기타친족 1천만 공제한도 자동 적용. 누진세율 10~50% 단계별 계산 + 절세 분할 증여 시뮬까지.",
 path: "/tools/real-estate/gift-tax",
 keywords: ["증여세 계산기", "가족 증여세", "증여 공제 한도", "직계존비속 증여", "배우자 증여"],
});

export default function GiftTaxLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}
