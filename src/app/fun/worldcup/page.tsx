import IdealTypeWorldCup from "@/components/IdealTypeWorldCup";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "기업 이상형 월드컵 | Moneysalary",
    description: "당신의 꿈의 직장은 어디인가요? 16강 토너먼트로 알아보는 나의 최애 기업 찾기!",
};

export default function WorldCupPage() {
    return (
        <div className="min-h-screen pt-20 pb-20">
            <IdealTypeWorldCup />
        </div>
    );
}
