import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@0xintuition/1ui'],
  webpack: (config) => {
    // Handle SVG files from the app
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
      exclude: [/node_modules/],
    });

    // Handle SVG files from node_modules (including sprites)
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg)$/i,
      issuer: /\.[jt]sx?$/,
      include: /node_modules/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]',
      },
    });

    return config;
  },
  experimental: {
    optimizePackageImports: ['@0xintuition/1ui'],
  },
  async rewrites() {
    return [
      {
        source: '/static/media/:path*',
        destination: '/_next/static/media/:path*',
      },
    ];
  },
  // Add assetPrefix for Vercel
  assetPrefix: process.env.VERCEL ? '/_next' : '',
};

export default nextConfig;