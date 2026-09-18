/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
};

// Optional bundle analyzer — only loaded when ANALYZE=true so dev/build never
// breaks if the optional devDependency hasn't been installed yet.
if (process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
    module.exports = withBundleAnalyzer(nextConfig);
  } catch {
    console.warn(
      '[next.config] ANALYZE=true was set but @next/bundle-analyzer is not installed. Run: npm i -D @next/bundle-analyzer'
    );
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}
