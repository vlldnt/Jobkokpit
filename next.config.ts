import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Native / Node-only modules that must not be bundled by Turbopack/webpack.
  serverExternalPackages: ["@node-rs/argon2", "pino", "pino-pretty"],
  // Standalone output for a slim production Docker image (Phase 3).
  output: "standalone",
};

export default nextConfig;
