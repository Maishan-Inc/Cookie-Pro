import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: "/script.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
          {
            key: "Content-Type",
            value: "text/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
