import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/shared"],
  async rewrites() {
    // API_URL: 서버 전용 (rewrite 프록시 대상)
    // 로컬: http://localhost:4000, Docker: http://api:4000, 배포: Railway URL
    const apiUrl = process.env.API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
