import WeekendDutyGame from "@/components/WeekendDutyGame";
import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "주말 당직 게임 (Office Survival) - 공정한 당직 뽑기",
 description: "주말 당직, 운명의 룰렛을 돌려라! 공정하고 재미있는 당직 배정 게임.",
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
