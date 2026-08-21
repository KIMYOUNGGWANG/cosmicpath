import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Security: Disable x-powered-by header
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  images: {
    localPatterns: [
      {
        pathname: '/api/og/**',
      },
      {
        pathname: '/og-image.png',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.kakaocdn.net',
      },
    ],
  },

  // Security headers for API routes (CORS)
  async headers() {
    return [
      {
        // Apply CORS to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.live',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Request-Id',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
    ];
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production (except error/warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
