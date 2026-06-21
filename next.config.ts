import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/experts/sumedhhkumar",
        destination: "/experts/sumedh-kumar",
        permanent: true,
      },
      {
        source: "/experts/sumedh",
        destination: "/experts/sumedh-kumar",
        permanent: true,
      },
      {
        source: "/experts/sumedhhkumar-bhalerao",
        destination: "/experts/sumedh-kumar",
        permanent: true,
      },
      {
        source: "/experts/sumedhkumar-bhalerao",
        destination: "/experts/sumedh-kumar",
        permanent: true,
      },
      {
        source: "/ai-trading-agents/agent-pulse",
        destination: "/ai-trading-agents/astro-vyn-gold",
        permanent: true,
      },
      {
        source: "/ai-trading-agents/pulse",
        destination: "/ai-trading-agents/astro-vyn-gold",
        permanent: true,
      },
      {
        source: "/ai-trading-agents/:slug/purchase",
        destination: "/ai-trading-agents/:slug#purchase",
        permanent: false,
      },
      {
        source: "/razorpay-test",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
