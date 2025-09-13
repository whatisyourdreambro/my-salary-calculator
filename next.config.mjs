/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export" 설정을 제거하여 Next.js의 서버 기능을 활성화합니다.
  // 이를 통해 동적 페이지 라우팅이 정상적으로 작동합니다.
  // 향후 필요하다면 여기에 다른 Next.js 설정을 추가할 수 있습니다.
  // 예: 이미지 최적화를 위한 remotePatterns 설정
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'example.com',
  //       port: '',
  //       pathname: '/images/**',
  //     },
  //   ],
  // },
};

export default nextConfig;
