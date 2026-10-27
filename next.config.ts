import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bukti transfer/penyaluran maksimal 5 MB, ditambah ruang untuk data form lain.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default nextConfig;
