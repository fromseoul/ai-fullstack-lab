import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/shared"],
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://localhost:4000";

    // 빌드 로그에서 확인
    console.log("===== BUILD TIME API_URL =====", apiUrl);

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
