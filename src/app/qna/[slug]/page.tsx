import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  // [수정] content 폴더 경로를 src 안으로 변경합니다.
  const markdownWithMeta = fs.readFileSync(
    path.join(process.cwd(), "src/content", `${slug}.mdx`),
    "utf-8"
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  return { frontMatter, content };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { frontMatter } = await getPost(params.slug);
  return {
    title: `${frontMatter.title} | Moneysalary`,
    description: frontMatter.description,
  };
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "src/content"));
  return files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));
}

export default async function QnAPostPage({ params }: Props) {
  const { frontMatter, content } = await getPost(params.slug);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>{frontMatter.title}</h1>
        <p className="lead text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {frontMatter.description}
        </p>
        {/* @ts-expect-error RSC 호환성 문제에 대한 임시 해결책 */}
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
