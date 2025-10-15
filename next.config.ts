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
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 프로필 이미지 도메인
        pathname: '**',
      },
      // Kakao 프로필 이미지 도메인
      // 1. k.kakaocdn.net
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '/**' },
      // 2. img1.kakaocdn.net
      { protocol: 'http', hostname: 'img1.kakaocdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'img1.kakaocdn.net', pathname: '/**' },
      // 3. t1.kakaocdn.net (기본 프로필 등에 사용됨)
      { protocol: 'http', hostname: 't1.kakaocdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 't1.kakaocdn.net', pathname: '/**' },
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
    ],
  },
};

export default nextConfig;
