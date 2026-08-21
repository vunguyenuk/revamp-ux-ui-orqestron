import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Reaching the dev server over the LAN (phone, second machine) instead of
  // localhost — without this, Next blocks the HMR socket and edits stop
  // hot-reloading. Add any other host you open the dev server from.
  allowedDevOrigins: ["192.168.1.132"],
};

export default nextConfig;
