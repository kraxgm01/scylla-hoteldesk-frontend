import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript type-checking errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
