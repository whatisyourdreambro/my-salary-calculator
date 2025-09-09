import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";

// Define the type for the page's props
interface Props {
  params: { slug: string };
}

// Function to get the post data
async function getPost(params: { slug: string }) {
  const markdownWithMeta = fs.readFileSync(
    path.join(process.cwd(), "content", `${params.slug}.mdx`),
    "utf-8"
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  return { frontMatter, content };
}

// Function to generate metadata dynamically
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { frontMatter } = await getPost(params);
  return {
    title: `${frontMatter.title} | Moneysalary`,
    description: frontMatter.description,
  };
}

// Function to generate the static paths for all posts
export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));
}

// The main page component with the correct props type
export default async function QnAPostPage({ params }: Props) {
  const { frontMatter, content } = await getPost(params);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="prose dark:prose-invert lg:prose-xl w-full">
        <h1>{frontMatter.title}</h1>
        <p className="lead text-lg text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {frontMatter.description}
        </p>
        {/*
          The temporary error comment has been removed as the code is now fully compliant.
        */}
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
