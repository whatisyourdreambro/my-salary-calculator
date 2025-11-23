import WeekendDutyGame from "@/components/WeekendDutyGame";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "주말 당직 게임 (Office Survival) - MoneySalary",
    description: "주말 당직, 운명의 룰렛을 돌려라! 공정하고 재미있는 당직 배정 게임.",
};

export default function WeekendDutyPage() {
    return (
        <div className="min-h-screen bg-black pt-20">
            <WeekendDutyGame />
        </div>
    );
}
