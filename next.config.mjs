/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages와의 호환성을 높이기 위해 standalone 모드로 빌드합니다.
  output: "standalone",
};

export default nextConfig;
