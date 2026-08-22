import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dab2jnv1e/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wxuplmmzfb2hrjxz.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "frontend-six-kappa-clmd7dlhna.vercel.app",
        pathname: "/api/media/**",
      },
      {
        protocol: "https",
        hostname: "www.yugmach.com",
        pathname: "/api/media/**",
      },
      {
        protocol: "https",
        hostname: "yugmach.com",
        pathname: "/api/media/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/machines/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/brand-logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/sitemap", destination: "/site-map", permanent: false },
      {
        source: "/subsidy/pmfme-packaging-machine",
        destination: "/finance/roi-calculator",
        permanent: true,
      },
      { source: "/subsidy", destination: "/finance/roi-calculator", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
