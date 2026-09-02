import WeekendDutyGame from "@/components/WeekendDutyGame";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "주말 당직 게임 (Office Survival) - 공정한 당직 뽑기",
 description: "이름·날짜·희망일을 넣으면 주말 당직을 공정하게 자동 배정하는 무료 당직 뽑기 룰렛. 1인당 최대 근무 횟수 설정, 결과 이미지 저장·공유까지 한 번에.",
 path: "/fun/weekend-duty",
 keywords: ["당직 뽑기", "주말 당직", "당직 룰렛", "복불복 게임"],
});

export default function WeekendDutyPage() {
 return (
 <div className="min-h-screen bg-electric pt-20 pt-28">
 <WeekendDutyGame />
 </div>
 );
}
