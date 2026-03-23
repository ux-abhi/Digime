import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images for chatbot avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
