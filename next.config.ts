import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper build output for Vercel
  output: 'standalone',
  // Enable experimental features that are stable
  experimental: {
    // Remove any turbopack references
  },
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  // Ensure proper ESLint handling
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
