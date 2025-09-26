import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    // 임시 테스트 더미 데이터용 -> 나중에 실제 서버 버킷 주소로 변경 필요
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'fastly.picsum.photos', pathname: '/**' },
    ],
  },
};

export default nextConfig;
