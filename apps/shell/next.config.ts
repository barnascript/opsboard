import type { NextConfig } from "next";

const config: NextConfig = {
  // workspace packages ship TypeScript source, so Next compiles them
  transpilePackages: ["@opsboard/ui", "@opsboard/api"],
  poweredByHeader: false,
  async headers() {
    // CSP is set per request in src/proxy.ts (it needs a fresh nonce)
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
