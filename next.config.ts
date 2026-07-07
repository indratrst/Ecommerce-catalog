import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Naikkan batas ke 5 Megabytes
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        // Mendaftarkan domain Supabase Storage kamu agar diizinkan oleh next/image
        hostname: "ajzmmottxfwhxoukibgh.supabase.co",
        pathname: "/storage/v1/object/public/**",
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
  // allowedDevOrigins: ["third-pts-cameron-mariah.trycloudflare.com"],
};

export default nextConfig;
