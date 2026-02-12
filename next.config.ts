import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.dog.ceo',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_HOST_NAME || '',
      },
    ],
  },
  experimental: { 
    serverActions: { 
      bodySizeLimit: '5mb', // 必要に応じて値を変更 
    }, 
  }
};

export default nextConfig;
