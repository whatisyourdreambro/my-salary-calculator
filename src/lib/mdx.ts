import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

const rootDirectory = path.join(process.cwd(), "content");

export const getPostBySlug = async (slug: string) => {
  const realSlug = slug.replace(/\.mdx$/, "");
  const filePath = path.join(rootDirectory, `${realSlug}.mdx`);

  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

  const { data, content } = matter(fileContent);

  const { content: compiledContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: false },
  });

  return { meta: { ...data, slug: realSlug }, content: compiledContent };
};

export const getAllPostsMeta = async () => {
  const files = fs.readdirSync(rootDirectory);

  const posts = [];
  for (const file of files) {
    const { meta } = await getPostBySlug(file);
    posts.push(meta);
  }
  return posts;
};
