import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // eslint: {
  //   // Mengabaikan ESLint saat dev untuk menghemat RAM
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    // Mengabaikan error typescript saat dev agar compile super cepat
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["third-pts-cameron-mariah.trycloudflare.com"],
};

export default nextConfig;
