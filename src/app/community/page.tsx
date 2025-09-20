// src/app/community/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getPosts } from "@/app/actions";
import NewPostForm from "@/components/NewPostForm";
import PollDisplay from "@/components/PollDisplay";
// ✅ 사용하지 않는 Metadata import 제거
// import type { Metadata } from "next";
import type { Post } from "@/app/types";

// ... timeAgo 함수는 변경 없음 ...
function timeAgo(date: Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
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

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    }
    fetchPosts();
  }, []);

  // 이제 이 함수는 NewPostForm에서 호출될 것입니다.
  const handlePostSuccess = async () => {
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);
  };

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

      {/* ✅ onPostSuccess prop으로 함수를 전달합니다. */}
      <NewPostForm onPostSuccess={handlePostSuccess} />

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
