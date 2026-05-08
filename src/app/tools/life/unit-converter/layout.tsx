import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "단위 변환기 — 길이·무게·온도·면적·부피",
 description: "cm·m·km·인치·평·m²·℃·℉ 등 일상 단위 즉시 변환.",
 path: "/tools/life/unit-converter",
 keywords: ["단위 변환", "단위 환산", "평 m2 변환", "인치 cm 변환"],
});

const FAQ_ITEMS = [
 { question: "평 → m² 변환식은?", answer: "1평 = 약 3.3058 m². 30평 = 약 99.17 m² (보통 100m²로 통용)." },
 { question: "온도 변환식?", answer: "℃ → ℉: ℃×9/5 + 32. ℉ → ℃: (℉-32)×5/9. 예: 25℃ = 77℉." },
 { question: "1인치는 몇 cm?", answer: "1인치 = 2.54 cm. 27인치 모니터 = 약 68.6 cm 대각선." },
 { question: "1마일은 몇 km?", answer: "1마일 = 1.609 km. 5km = 약 3.1마일." },
];

export default function UnitConverterLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd data={[
 autoBreadcrumbLd("/tools/life/unit-converter", { leafName: "단위 변환기" }),
 softwareApplicationLd({ name: "단위 변환기", description: "길이·무게·온도·면적·부피 무료 변환.", url: "/tools/life/unit-converter" }),
 faqLd(FAQ_ITEMS),
 ]} />
 {children}
 </>
 );
}
