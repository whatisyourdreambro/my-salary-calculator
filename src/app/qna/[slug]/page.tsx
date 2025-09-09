import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: "Not Found" };
  }
  return {
    title: `${post.meta.title} | Moneysalary`,
    description: post.meta.description,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post!.meta.slug,
  }));
}

export default async function QnAPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm-px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>{post.meta.title}</h1>
        <p className="lead text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {post.meta.description}
        </p>
        <div>{post.content}</div>
      </article>
    </main>
  );
}
