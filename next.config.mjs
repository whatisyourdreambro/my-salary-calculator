import nextMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure MDX to be treated as a page
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = nextMDX();

export default withMDX(nextConfig);
