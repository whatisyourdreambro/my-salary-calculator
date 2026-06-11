import { NumberGenerator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "랜덤 숫자 생성기 (RNG)",
 description: "로또 번호 생성, 추첨 등 다양한 용도의 랜덤 숫자를 생성해보세요.",
 path: "/tools/math/number-gen",
});

export default function NumberGenPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">랜덤 숫자 생성기</h1>
 <NumberGenerator />
 </div>
 <ToolPageContent path="/tools/math/number-gen" />
 </div>
 );
}
