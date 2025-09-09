import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const filePath = path.join(process.cwd(), "content", "qna", `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter, content } = matter(fileContent);

    return NextResponse.json({ frontMatter, content });
  } catch {
    // [수정] 사용하지 않는 (error) 변수 제거
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
