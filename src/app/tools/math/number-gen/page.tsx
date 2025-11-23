import { NumberGenerator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "랜덤 숫자 생성기 (RNG) - MoneySalary",
    description: "로또 번호 생성, 추첨 등 다양한 용도의 랜덤 숫자를 생성해보세요.",
};

export default function NumberGenPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">랜덤 숫자 생성기</h1>
                <NumberGenerator />
            </div>
        </div>
    );
}
