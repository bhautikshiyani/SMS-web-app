import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/messages',
        permanent: false, // Use true for permanent redirect (308), false for temporary (307)
      },
    ];
  },
};

export default nextConfig;
