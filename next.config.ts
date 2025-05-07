import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'media.licdn.com'
    },
    {
      protocol: 'https',
      hostname: 'placehold.co'
    }
    ],
  },
};

export default nextConfig;
