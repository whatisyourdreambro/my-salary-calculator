import MbtiSalary from "@/components/MbtiSalary";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "MBTI 연봉 순위 (Viral) - MoneySalary",
    description: "내 MBTI의 평균 연봉은 얼마일까요? 재미로 보는 MBTI 연봉 순위!",
};

export default function MbtiSalaryPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <MbtiSalary />
        </div>
    );
}
