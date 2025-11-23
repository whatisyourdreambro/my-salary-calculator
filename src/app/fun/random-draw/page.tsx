import RandomDrawGame from "@/components/RandomDrawGame";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "랜덤 추첨 (Marble Race) | Moneysalary",
    description: "공정하고 스릴 넘치는 3D 마블 레이스 추첨 게임. 당직 뽑기, 점심 내기, 경품 추첨을 더 재미있게!",
};

export default function RandomDrawPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <RandomDrawGame />
            </div>
        </div>
    );
}
