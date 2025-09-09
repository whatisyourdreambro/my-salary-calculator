import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  const markdownWithMeta = fs.readFileSync(
    path.join(process.cwd(), "content", `${slug}.mdx`),
    "utf-8"
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  return { frontMatter, content };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return { title: "Not Found" };
  }
  return {
    title: `${post.frontMatter.title} | Moneysalary`,
    description: post.frontMatter.description,
  };
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));
}

export default async function QnAPostPage({ params }: Props) {
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
        {/* [수정] 불필요해진 @ts-expect-error 주석을 삭제했습니다. */}
        <MDXRemote source={post.content} />
      </article>
    </main>
  );
}
