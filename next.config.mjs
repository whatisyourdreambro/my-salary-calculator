/** @type {import('next').NextConfig} */
const nextConfig = {
  // 모든 URL 끝에 슬래시(/)를 추가하여
  // 서버 환경에 따라 발생할 수 있는 라우팅 문제를 해결하고 URL 일관성을 유지합니다.
  trailingSlash: true,

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
