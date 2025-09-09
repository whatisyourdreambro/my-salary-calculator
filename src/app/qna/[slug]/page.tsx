"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";

export default function QnAPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<{
    frontMatter: { title: string; description: string };
    content: MDXRemoteProps;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/qna/${slug}`);
        if (!res.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }
        const data = await res.json();
        setPost(data);
      } catch (err: unknown) {
        // [수정] any 대신 unknown 타입 사용
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div>오류: {error}</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div>게시물을 찾을 수 없습니다.</div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>{post.frontMatter.title}</h1>
        <p className="lead text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {post.frontMatter.description}
        </p>
        {/* @ts-expect-error RSC Server Component compatibility issue */}
        {/* [수정] @ts-ignore를 @ts-expect-error로 변경 */}
        <MDXRemote {...post.content} />
      </article>
    </main>
  );
}
