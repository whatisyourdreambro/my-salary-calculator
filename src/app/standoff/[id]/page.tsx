// src/app/standoff/[id]/page.tsx
import { getPoll } from "@/app/actions";
import BalanceGame from "@/components/BalanceGame";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const pollId = parseInt(params.id, 10);
  const poll = await getPoll(pollId);

  if (!poll) {
    return { title: "투표를 찾을 수 없습니다." };
  }

  const title = `${poll.optionA_text} vs ${poll.optionB_text} | 밸런스 게임`;
  return {
    title,
    description:
      "직장인들의 현실적인 선택은? 당신의 선택과 다른 사람들의 생각을 비교해보세요.",
  };
}

export default async function StandoffPage({ params }: PageProps) {
  const pollId = parseInt(params.id, 10);
  const poll = await getPoll(pollId);

  if (!poll) {
    notFound();
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          커리어 밸런스 게임
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          당신의 선택은 무엇인가요?
        </p>
      </div>
      <BalanceGame initialPoll={poll} />
    </main>
  );
}
