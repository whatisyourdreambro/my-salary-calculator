import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

const contentDirectory = path.join(process.cwd(), "content");

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, "");
  const filePath = path.join(contentDirectory, `${realSlug}.mdx`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    const compiledContent = await compileMDX({
      source: content,
      options: { parseFrontmatter: false },
    });

    return { meta: data, content: compiledContent.content, slug: realSlug };
  } catch (error) {
    console.error(`Error reading or parsing MDX file for slug: ${slug}`, error);
    return null;
  }
}

export async function getAllPosts() {
  try {
    const files = fs.readdirSync(contentDirectory);
    const posts = await Promise.all(
      files.map((filename) => {
        const slug = filename.replace(/\.mdx$/, "");
        return getPostBySlug(slug);
      })
    );
    return posts.filter((post) => post !== null);
  } catch (error) {
    console.error("Error reading content directory:", error);
    return [];
  }
}
