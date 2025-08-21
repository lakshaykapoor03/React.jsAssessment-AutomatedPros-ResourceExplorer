import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // swcMinify: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rickandmortyapi.com" },
    ],
  },
};

export default nextConfig;


