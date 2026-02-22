/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/", destination: "/portal/index.html" },
      { source: "/assets/:path*", destination: "/portal/assets/:path*" },
      { source: "/_expo/:path*", destination: "/portal/_expo/:path*" },
      { source: "/favicon.ico", destination: "/portal/favicon.ico" },
      { source: "/manifest.json", destination: "/portal/manifest.json" },
      { source: "/expo-service-worker.js", destination: "/portal/expo-service-worker.js" },
      { source: "/metadata.json", destination: "/portal/metadata.json" }
    ];
  }
};

module.exports = nextConfig;
