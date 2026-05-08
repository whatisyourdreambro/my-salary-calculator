import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "난수 생성기 — 1~N 사이 무작위 숫자 추첨",
 description: "범위 입력 → 무작위 숫자 즉시 생성. 추첨·복불복·번호 추첨에 활용.",
 path: "/tools/math/number-gen",
 keywords: ["난수 생성기", "랜덤 숫자", "추첨", "랜덤 번호"],
});

const FAQ_ITEMS = [
 { question: "난수가 무엇?", answer: "예측 불가능한 무작위 숫자. 본 계산기는 JavaScript Math.random() 사용 (의사 난수, 통계적 무작위)." },
 { question: "중복 없이 여러 개?", answer: "범위 + 개수 입력 시 중복 없이 N개 추첨 가능. 예: 1~45 중 6개 → 로또 번호 추첨." },
 { question: "복불복·추첨에 사용?", answer: "친구·동료 게임·당첨자 결정 등. 결과 공정성 보장 위해 화면 캡처 권장." },
 { question: "암호학적 난수?", answer: "본 계산기는 일반 난수 (의사 난수). 보안·암호화 용도는 crypto.randomBytes() 등 별도 라이브러리 필요." },
];

export default function NumberGenLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/math/number-gen", { leafName: "난수 생성기" }),
 softwareApplicationLd({ name: "난수 생성기", description: "무작위 숫자 추첨 무료 도구.", url: "/tools/math/number-gen" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
