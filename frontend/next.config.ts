import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: '../backend/src/main/resources/static',
  basePath: '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
