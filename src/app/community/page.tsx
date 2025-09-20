// src/app/community/page.tsx
import { getPosts } from "@/app/actions";
import NewPostForm from "@/components/NewPostForm";
import PollDisplay from "@/components/PollDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "커뮤니티 | Moneysalary",
  description:
    "연봉, 이직, 커리어에 대한 직장인들의 솔직한 이야기를 익명으로 나눠보세요.",
};

// 시간 표기 포맷 함수
function timeAgo(dateString: string): string {
  const date = new Date(dateString); // ✅ 문자열을 Date 객체로 변환
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "년 전";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "달 전";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "일 전";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "시간 전";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "분 전";
  return Math.floor(seconds) + "초 전";
}

// async 서버 컴포넌트
export default async function CommunityPage() {
  const posts = await getPosts();

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          커뮤니티
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          직장인들의 솔직한 이야기를 익명으로 나눠보세요.
        </p>
      </div>

      <NewPostForm />

      <div className="mt-12 space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{post.author}</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
            <p className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.postType === "poll" && post.pollOptions && (
              <PollDisplay post={post} />
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            아직 등록된 글이 없습니다. 첫 번째 글을 작성해보세요!
          </p>
        )}
      </div>
    </main>
  );
}
