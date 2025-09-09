import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";

// 모든 Q&A 글 목록을 생성하여 Next.js에게 알려줍니다.
export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));
}

// slug에 해당하는 글의 데이터를 가져옵니다.
async function getPost(slug: string) {
  const markdownWithMeta = fs.readFileSync(
    path.join("content", `${slug}.mdx`),
    "utf-8"
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  return { frontMatter, content };
}

export default async function QnAPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { frontMatter, content } = await getPost(params.slug);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl">
        <h1>{frontMatter.title}</h1>
        <p className="lead">{frontMatter.description}</p>
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
