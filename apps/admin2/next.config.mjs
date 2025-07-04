/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@eugenios/ui", "@eugenios/types", "@eugenios/react-query", "@eugenios/services", "@eugenios/icons"],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-dd6c6759a4454b4cb75e3cd097f59bb1.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
}

export default nextConfig
