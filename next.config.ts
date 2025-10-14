import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'team5-s3-1.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 프로필 이미지 도메인
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net', // 카카오톡 프로필 이미지 도메인
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'phinf.pstatic.net', // 네이버 프로필 이미지 도메인
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub 프로필 이미지 도메인
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'team5-s3-1.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
