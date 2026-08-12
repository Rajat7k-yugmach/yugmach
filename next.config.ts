import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
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
    ],
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
