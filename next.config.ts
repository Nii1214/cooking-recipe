import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: {
      /** サムネイルを Server Action の FormData で受け取るため */
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
