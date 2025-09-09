import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Function to get the post data
async function getPost(slug: string) {
  const markdownWithMeta = fs.readFileSync(
    path.join(process.cwd(), "content", "qna", `${slug}.mdx`),
    "utf-8"
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  return {
    frontMatter: frontMatter as { title: string; description: string },
    content,
  };
}

// Function to generate metadata dynamically
// [수정] Props 인터페이스 대신 타입을 직접 명시
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { frontMatter } = await getPost(params.slug);
  return {
    title: `${frontMatter.title} | Moneysalary`,
    description: frontMatter.description,
  };
}

// Function to generate the static paths for all posts
export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content", "qna"));
  return files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));
}

// The main page component
// [수정] Props 인터페이스 대신 타입을 직접 명시
export default async function QnAPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>{post.frontMatter.title}</h1>
        <p className="lead text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {post.frontMatter.description}
        </p>
        {}
        <MDXRemote source={post.content} />
      </article>
    </main>
  );
}
