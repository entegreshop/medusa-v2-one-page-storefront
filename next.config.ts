import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://204.168.136.196:9001/uploads/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://204.168.136.196:9001/admin/:path*',
      },
      {
        source: '/app/:path*',
        destination: 'http://204.168.136.196:9001/app/:path*',
      },
      {
        source: '/store/:path*',
        destination: 'http://204.168.136.196:9001/store/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://204.168.136.196:9001/auth/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://204.168.136.196:9001/static/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      }
    ]
  }
};

export default nextConfig;
