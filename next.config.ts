import nextMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // MDX 페이지를 사용하도록 설정
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = nextMDX();

export default withMDX(nextConfig);
