import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/curriculum", destination: "/journey", permanent: false },
      { source: "/theory", destination: "/journey", permanent: false },
      { source: "/practice", destination: "/metronome", permanent: false },
      { source: "/progress", destination: "/profile", permanent: false },
    ];
  },
};

export default nextConfig;
