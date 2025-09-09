import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Function to get all Q&A posts
async function getQnAPosts() {
  const postsDirectory = path.join(process.cwd(), "content");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter } = matter(fileContents);

    return {
      slug: filename.replace(".mdx", ""),
      title: frontMatter.title,
      description: frontMatter.description,
    };
  });
  return posts;
}

export default async function QnAListPage() {
  const posts = await getQnAPosts();

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          궁금한 점을 해결해 보세요 (Q&A)
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          급여, 세금, 퇴직금에 대한 모든 것을 알려드립니다.
        </p>
      </div>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/qna/${post.slug}`}
            className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow bg-light-card dark:bg-dark-card"
          >
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              {post.title}
            </h2>
            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
